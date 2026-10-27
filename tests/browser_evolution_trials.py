"""Épreuves : vrai parcours UI, récompenses, inventaire et clôture récupérable."""
import asyncio,copy,json,subprocess,threading
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[1]
SAVE='couronnes_arcanes_v1'
BATTLE='couronnes_arcanes_bataille_v1'
SCENARIOS=json.loads(subprocess.check_output(['node','tests/fixtures/evolution-scenarios.mjs'],cwd=ROOT))

async def stored(page,key=SAVE):
    return await page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',key)

async def case(browser,scenario,viewport,*,touch=False,url=None,terminal=None,failure=None):
    context=await browser.new_context(viewport=viewport,has_touch=touch,offline=not bool(url),reduced_motion='reduce',accept_downloads=True)
    page=await context.new_page();errors=[];external=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda r:external.append(r.url) if r.url.startswith(('http:','https:')) and not r.url.startswith('http://127.0.0.1:') else None)
    payload={SAVE:json.dumps(scenario['profile']),'couronnes_arcanes_animations_v13':'off','evolution-test-failure':failure or ''}
    if terminal is not None:payload[BATTLE]=json.dumps(terminal)
    await page.add_init_script('''([data,seed])=>{
      if(!localStorage.getItem('evolution-test-loaded')){
        for(const [key,value] of Object.entries(data))localStorage.setItem(key,value);
        localStorage.setItem('evolution-test-loaded','yes');
      }
      Date.now=()=>seed;
      const write=Storage.prototype.setItem,remove=Storage.prototype.removeItem;
      Storage.prototype.setItem=function(k,v){
        if(k==='couronnes_arcanes_v1'&&this.getItem('evolution-test-failure')==='profile')throw Error('quota profil simulé');
        return write.call(this,k,v);
      };
      Storage.prototype.removeItem=function(k){
        if(k==='couronnes_arcanes_bataille_v1'&&this.getItem('evolution-test-failure')==='cleanup')throw Error('coupure simulée');
        return remove.call(this,k);
      };
    }'''.replace('([data,seed])=>','(([data,seed])=>')+')('+json.dumps([payload,scenario['seed']])+')')
    await page.goto(url or (ROOT/'JOUER.html').as_uri())
    return context,page,errors,external

async def click(locator,touch=False):
    if touch:await locator.tap()
    else:await locator.click()

async def select(page,index,touch):
    card=page.locator(f'.hand [data-action="select-card"][data-index="{index}"]')
    await click(card,touch)
    if touch:await click(card,touch)

async def replay(page,scenario,touch):
    for action in scenario['actions']:
        assert await page.locator('.combat-screen').count()==1,(action,(await page.locator('#view').inner_text())[:400])
        if action['type']=='power':await click(page.locator('[data-action="hero-power"]'),touch)
        elif action['type']=='end':
            await click(page.locator('[data-action="end-turn"]'),touch)
            await page.wait_for_function('''([key,round])=>{
              const b=JSON.parse(localStorage.getItem(key));
              return !b||b.status!=='active'||(b.round>round&&b.phase==='player');
            }''',arg=[BATTLE,action['round']])
        else:
            battle=await stored(page,BATTLE);h=battle['heroes']['p']['hand'][action['i']]
            assert h['id']==action['id'] and h.get('rarity')==action.get('rarity'),(scenario['id'],action,h)
            await select(page,action['i'],touch)
            if action['type']=='unité':
                await click(page.locator(f'[data-action="deploy"][data-lane="{action["lane"]}"][data-col="{action["col"]}"]'),touch)
            else:
                lane=action['lane']
                targets=page.locator(f'[data-action="spell-target"][data-lane="{lane}"]')
                lanes=page.locator(f'.spell-lanes [data-action="spell-lane"][data-lane="{lane}"]')
                if await targets.count():await click(targets.first,touch)
                elif await lanes.count():await click(lanes.first,touch)
                await click(page.locator('[data-action="spell-confirm"]'),touch)
        await page.wait_for_function("!document.querySelector('.combat-playing')")
    await page.locator('.modal h2').filter(has_text='Évolution obtenue').wait_for()

def without_receipt(profile):
    return {k:v for k,v in profile.items() if k!='lastBattleSettlementId'}

async def earned_flow(browser,scenario,label,viewport,*,full=False,touch=False,url=None):
    ctx,page,errors,external=await case(browser,scenario,viewport,touch=touch,url=url,terminal=None if full else scenario['terminal'])
    if full:
        await click(page.locator('#nav [data-page="trials"]'),touch)
        assert await page.locator('.trial-card').count()==4
        trial=page.locator(f'[data-trial-id="{scenario["id"]}"]')
        assert scenario['trial']['objective'] in await trial.inner_text()
        before=await stored(page)
        card=trial.locator('.unit-card')
        if touch:await card.tap()
        else:await card.hover()
        assert await stored(page)==before
        await page.keyboard.press('Escape')
        assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
        await page.screenshot(path=f'/tmp/ca-evolution-{label}-{scenario["id"]}.png')
        await click(trial.locator('[data-action="trial-start"]'),touch)
        assert (await stored(page,BATTLE))['missionId']==scenario['id']
        await click(page.locator('.trial-combat-objective summary'),touch)
        assert scenario['trial']['objective'] in await page.locator('.trial-combat-objective').inner_text()
        assert f'0/{scenario["initial"]["trialChallenge"]["target"]}' in await page.locator('.trial-combat-objective summary').inner_text()
        await page.screenshot(path=f'/tmp/ca-evolution-objective-{label}-{scenario["id"]}.png')
        await click(page.locator('.trial-combat-objective summary'),touch)
        snapshot=await stored(page,BATTLE)
        await page.reload()
        # La reprise doit être peinte avant les actions ; count() ne l'attend pas.
        # Contrôler aussi les octets métier, pour ne pas masquer une perte d'état.
        await page.locator('.combat-screen').wait_for()
        assert await stored(page,BATTLE)==snapshot,'Le combat sauvegardé a changé pendant la reprise.'
        await replay(page,scenario,touch)
    else:await page.locator('.modal h2').filter(has_text='Évolution obtenue').wait_for()
    target=scenario['initial']['trialChallenge']['target']
    assert f'{target}/{target}' in await page.locator('.trial-combat-objective summary').inner_text()
    result=await stored(page)
    assert without_receipt(result)==scenario['expected'],(label,scenario['id'],result)
    assert await stored(page,BATTLE) is None
    await click(page.locator('[data-action="trial-exit"][data-page="trials"]'),touch)
    assert await page.locator(f'[data-trial-id="{scenario["id"]}"] [data-action="trial-start"]').is_disabled()
    await page.reload()
    assert await stored(page)==result
    await click(page.locator('#nav [data-page="collection"]'),touch)
    card_id,rarity=scenario['trial']['cardId'],scenario['trial']['to']
    row=page.locator(f'[data-collection-character="{card_id}"]')
    assert await row.locator('td').count()==6
    cell=row.locator(f'[data-collection-rarity="{rarity}"]')
    assert 'Possédée ×1' in await cell.inner_text()
    await click(page.locator('#nav [data-page="deck"]'),touch)
    tile=page.locator(f'.manual-card-entry[data-deck-card="{card_id}:{rarity}"]')
    assert await tile.count()==1
    assert await tile.locator('[data-action="deck-add"]').is_disabled()
    await click(tile.locator('[data-action="deck-remove"]'),touch)
    await click(tile.locator('[data-action="deck-add"]'),touch)
    changed=await stored(page)
    assert changed['deck'].count({'id':card_id,'rarity':rarity})==1
    assert changed['evolvedCollection']==result['evolvedCollection']
    # Export réel, puis import refusé et import valide, sans outil de diagnostic.
    await click(page.locator('#nav [data-page="guide"]'),touch)
    async with page.expect_download() as download_info:
        await click(page.locator('[data-action="export-save"]'),touch)
    exported=json.loads(Path(await (await download_info.value).path()).read_text())
    assert exported==changed
    invalid=copy.deepcopy(exported);invalid['evolvedCollection']['militia:divine']=1
    await page.locator('#import-file').set_input_files({'name':'invalide.json','mimeType':'application/json','buffer':json.dumps(invalid).encode()})
    assert await stored(page)==changed
    await page.locator('#import-file').set_input_files({'name':'profil.json','mimeType':'application/json','buffer':json.dumps(exported).encode()})
    await page.locator('#view .hero-copy').wait_for()
    assert await stored(page)==changed
    # La carte réellement gagnée, remise dans le deck, est invoquée en campagne.
    await page.evaluate('(seed)=>{Date.now=()=>seed}',scenario['campaignSeed'])
    await click(page.locator('#nav [data-page="campaign"]'),touch)
    await click(page.locator('[data-action="start-mission"][data-id="01"]'),touch)
    battle=await stored(page,BATTLE)
    index=next(i for i,h in enumerate(battle['heroes']['p']['hand']) if h['id']==card_id and h.get('rarity')==rarity)
    await select(page,index,touch)
    await click(page.locator('[data-action="deploy"][data-lane="0"][data-col="1"]'),touch)
    snapshot=await stored(page,BATTLE);unit=snapshot['board'][0][1]
    assert unit['id']==card_id and unit['rarity']==rarity and unit['cardRules']=='aube-v1'
    assert unit['maxhp']=={'militia':5,'shield':11,'archer':4}[card_id]
    await page.screenshot(path=f'/tmp/ca-evolution-campaign-{label}-{scenario["id"]}.png')
    await page.reload();assert await stored(page,BATTLE)==snapshot
    assert not await page.evaluate("'battle' in window||'profile' in window")
    assert not errors,errors
    assert not external,external
    await ctx.close()
    print(f'Épreuve {label} {scenario["id"]}: {"combat UI complet" if full else "clôture"}, Collection/deck/export/import/campagne/reprise PASS',flush=True)

async def recovery(browser):
    s=SCENARIOS[0];vp={'width':390,'height':844}
    for failure in ['profile','cleanup']:
        ctx,page,errors,_=await case(browser,s,vp,terminal=s['terminal'],failure=failure)
        if failure=='profile':
            assert await stored(page)==s['profile']
            assert not (await stored(page,BATTLE)).get('progressionGranted')
            await page.locator('.combat-menu-link').click()
            await page.locator('#nav [data-page="trials"]').click()
            await page.locator('[data-trial-id="aube-shield-rare"] [data-action="trial-start"]').click()
            assert (await stored(page,BATTLE))['missionId']==s['id']
            assert await stored(page)==s['profile']
        else:
            assert without_receipt(await stored(page))==s['expected']
            assert await stored(page,BATTLE) is not None
        await page.evaluate("localStorage.setItem('evolution-test-failure','')")
        if failure=='profile':
            await page.locator('[data-trial-id="aube-shield-rare"] [data-action="trial-start"]').click()
            await page.locator('.modal h2').filter(has_text='Évolution obtenue').wait_for()
            assert await stored(page,BATTLE) is None
        await page.reload()
        once=await stored(page)
        assert without_receipt(once)==s['expected']
        assert await stored(page,BATTLE) is None
        await page.reload();assert await stored(page)==once
        assert not errors,errors
        await ctx.close()
    for outcome in ['defeat','missed']:
        b=copy.deepcopy(s['terminal'])
        if outcome=='defeat':b['status']='defeat'
        else:
            b['board']=[[None if u and u['side']=='p' and u['id']=='militia' else u for u in row] for row in b['board']]
        ctx,page,errors,_=await case(browser,s,vp,terminal=b)
        await page.locator('[data-action="trial-exit"]').first.wait_for()
        assert without_receipt(await stored(page))==s['profile']
        assert await stored(page,BATTLE) is None
        assert not errors,errors
        await ctx.close()
    # Une ancienne épreuve active garde ses conditions, sans nouvel objectif imposé.
    legacy=copy.deepcopy(s['initial']);del legacy['trialChallenge']
    ctx,page,errors,_=await case(browser,s,vp,terminal=legacy)
    await page.locator('.trial-combat-objective summary').click()
    assert s['trial']['legacyObjective'] in await page.locator('.trial-objective-panel').inner_text()
    assert 'Personnage vivant' in await page.locator('.trial-objective-panel').inner_text()
    await page.reload();assert await stored(page,BATTLE)==legacy
    assert not errors,errors
    await ctx.close()
    # Le boss et l'épreuve précédente sont des conditions distinctes.
    locked=copy.deepcopy(SCENARIOS[1]);locked['profile']['completed']=['01','02']
    ctx,page,errors,_=await case(browser,locked,vp)
    await page.locator('#nav [data-page="trials"]').click()
    epic=page.locator('[data-trial-id="aube-militia-epic"]')
    assert await epic.locator('[data-action="trial-start"]').is_disabled()
    assert 'Gardien du Bosquet' in await epic.inner_text()
    assert not errors,errors
    await ctx.close()
    print('Épreuves: échec profil, coupure après reçu, objectif manqué/défaite sans coût, ancienne épreuve et verrou boss PASS',flush=True)

async def main():
    class Quiet(SimpleHTTPRequestHandler):
        def log_message(self,*args):pass
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
    try:
        async with async_playwright() as pw:
            browser=await pw.chromium.launch(headless=True,args=['--no-sandbox'])
            for label,vp,touch in [('desktop',{'width':1440,'height':1000},False),('portrait',{'width':390,'height':844},True),('landscape',{'width':844,'height':390},True)]:
                for i,s in enumerate(SCENARIOS):
                    await earned_flow(browser,s,label,vp,touch=touch,full=label=='desktop' or i==(0 if label=='portrait' else 1))
            await earned_flow(browser,SCENARIOS[0],'web',{'width':1366,'height':900},full=True,url=f'http://127.0.0.1:{server.server_port}/index.html')
            await recovery(browser)
            await browser.close()
    finally:server.shutdown();server.server_close()

if __name__=='__main__':asyncio.run(main())
