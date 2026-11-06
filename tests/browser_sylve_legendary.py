"""Fusions Légendaires partagées, vrai combat et reprise dans le jeu distribué."""
import argparse,asyncio,copy,json,subprocess,threading
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from evolution_ci_plan import card_pack_cases

ROOT=Path(__file__).resolve().parents[1]
SAVE='couronnes_arcanes_v1'
BATTLE='couronnes_arcanes_bataille_v1'
SCENARIOS={
    'ether-spark':{'card':'spark','faction':'ether','stats':(3,4),'futureByRank':{'divine':'Ascension requise'},'divineStats':(3,4),'effect':'spectralRetreatReadyRound','effectSide':'p','status':'Repli spectral','detail':['Repli spectral','Portée 3','3 tours','fusion'],'future':'Ascension requise','prepared':True,'fixture':'ether'},
    'ether-seer':{'card':'seer','faction':'ether','stats':(3,5),'futureByRank':{'divine':'Ascension requise'},'divineStats':(3,5),'effect':'stillOmen','status':'Étoile immobile','detail':['Étoile immobile','déplacement réel','3 tours','fusion'],'future':'Ascension requise','prepared':True,'fixture':'ether'},
    'sylve':{'card':'owl','stats':(3,5),'effect':'attackPenalty','status':'Harcèlement','detail':['Harcèlement','−1 ATQ','fusion'],'future':'Ascension requise'},
    'ombre':{'card':'plague','stats':(4,7),'effect':'poisonTurns','status':'Poison 2 tour(s)','detail':['Poison 1','2 tours','fusion'],'future':'Ascension requise'},
    'forge-scrap':{'card':'ironwraith','faction':'forge','stats':(3,9),'effect':'strikeWardReadyRound','effectSide':'p','status':'Ferraille récupérée','detail':['Ferraille récupérée','plafond 20','3 tours','fusion'],'future':'Ascension requise'},
    'forge-smith':{'card':'smith','faction':'forge','stats':(4,8),'effect':'knockbackReadyRound','effectSide':'p','status':'Coup de masse','detail':['Coup de masse','3 tours','fusion'],'future':'Ascension requise','prepared':True},
    'forge-drill':{'card':'drill','faction':'forge','stats':(3,7),'effect':'barrierDrillReadyRound','effectSide':'p','status':'Foreuse','detail':['Foreuse d’acier','2 points','3 tours','fusion'],'future':'Ascension requise','prepared':True},
    'forge':{'card':'alchemist','stats':(4,7),'effect':'poisonTurns','status':'Poison 2 tour(s)','detail':['Poison 1','2 tours','fusion'],'future':'Ascension requise'},
    'ether':{'card':'aetherknight','stats':(5,11),'futureByRank':{'divine':'Ascension requise'},'divineStats':(5,11),'effect':'hp','status':'Perforation','detail':['Perforation','Charge','fusion'],'future':'Ascension requise','prepared':True,'nativeSource':True,'damageOnly':5},
}
PROFILE_SCRIPT="import {freshProfile} from './src/engine.js';const p=freshProfile(),id=process.argv[1],native=process.argv[2]==='native';p.completed=['01','02','03','04','05'];p.unlocked=6;p.guideSeen=true;if(native)p.collection[id]=3;else p.evolvedCollection={[id+':épique']:3};p.deck[0]=native?id:{id,rarity:'épique'};console.log(JSON.stringify(p));"
PROFILES={name:json.loads(subprocess.check_output(['node','--input-type=module','-e',PROFILE_SCRIPT,cfg['card'],'native' if cfg.get('nativeSource') else 'evolved'],cwd=ROOT)) for name,cfg in SCENARIOS.items()}
PLAN="""import {createBattle,playPlayerCard,endPlayerTurn,playEnemyCard,finishEnemyTurn} from './src/engine.js';import {CAMPAIGN} from './src/data.js';const p=JSON.parse(process.argv[1]),id=process.argv[2],effect=process.argv[3],effectSide=process.argv[4]||'e';let found=null;const enemy=b=>{for(let n=0;n<2&&b.status==='active';n++)if(playEnemyCard(b).done)break;if(b.status==='active')finishEnemyTurn(b);};for(let seed=1;seed<=1000&&!found;seed++){const b=createBattle(p,CAMPAIGN[5],seed,{turnFlow:'alternating'});let i=b.heroes.p.hand.findIndex(c=>c.id===id&&c.rarity==='légendaire'),opening=0;if(i<0)continue;while(b.heroes.p.hand[i].wait>0&&opening<4&&b.status==='active'){endPlayerTurn(b);enemy(b);opening++;i=b.heroes.p.hand.findIndex(c=>c.id===id&&c.rarity==='légendaire');}if(b.status!=='active'||!playPlayerCard(b,i,0,1).ok)continue;for(let turn=1;turn<=10&&b.status==='active';turn++){endPlayerTurn(b);const target=b.board.flat().find(u=>u?.side===effectSide&&u[effect]);if(target){found={seed,turn,opening};break;}enemy(b);}}if(!found)throw Error('Aucune graine de combat normale trouvée');console.log(JSON.stringify(found));"""

async def run_sylve_legendary(browser,label,viewport,url=None,scenario='sylve'):
    cfg=SCENARIOS[scenario];faction=cfg.get('faction',scenario);card_id=cfg['card'];source=card_id if cfg.get('nativeSource') else card_id+':épique';target_key=card_id+':légendaire';profile_before=PROFILES[scenario]
    touch=label in ('portrait','landscape')
    ctx=await browser.new_context(viewport=viewport,has_touch=touch,offline=not bool(url),reduced_motion='reduce',accept_downloads=True)
    page=await ctx.new_page();errors=[];external=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda r:external.append(r.url) if r.url.startswith(('http:','https:')) and not r.url.startswith('http://127.0.0.1:') else None)
    await page.goto(url or (ROOT/'JOUER.html').as_uri())
    await page.evaluate('([k,p])=>{localStorage.setItem(k,JSON.stringify(p));localStorage.setItem("couronnes_arcanes_animations_v13","off")}',[SAVE,profile_before]);await page.reload()
    async def click(loc):
        if touch:await loc.tap()
        else:await loc.click()
    async def saved(key=SAVE):return await page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',key)
    async def nav(screen):await click(page.locator(f'#nav [data-page="{screen}"]'))
    async def prepare():await click(page.locator(f'[data-fusion-id="{target_key}"] [data-action="evolution-fusion-preview"]'))
    await nav('alchemy');tile=page.locator(f'[data-fusion-id="{target_key}"]')
    assert await tile.locator('button').is_disabled() and 'Colosse des Fourneaux' in await tile.inner_text()
    unlocked=copy.deepcopy(profile_before);unlocked['completed'].append('06')
    await nav('guide');await page.locator('#import-file').set_input_files({'name':'boss06.json','mimeType':'application/json','buffer':json.dumps(unlocked).encode()});await page.locator('#view .hero-copy').wait_for()
    await nav('alchemy');assert await tile.locator('button').is_disabled() and '1 dans le deck' in await tile.inner_text()
    await nav('deck');await click(page.locator(f'[data-deck-zone="current"] [data-deck-card="{source}"] [data-action="deck-remove"]'))
    await nav('alchemy');baseline=await saved();assert await tile.locator('button').is_enabled()
    card=tile.locator('.unit-card')
    if touch:await card.tap()
    else:await card.hover()
    popup=page.locator('#collection-hover-inspection:not([hidden])');await popup.wait_for()
    for text in cfg['detail']:assert text in await popup.inner_text(),text
    await page.keyboard.press('Escape');await prepare();assert await saved()==baseline
    assert '3 exemplaires épique' in await page.locator('.modal').inner_text()
    await page.screenshot(path=f'/tmp/ca-{scenario}-legendary-fusion-{label}.png')
    await click(page.locator('.modal [data-action="close-modal"]'));assert await saved()==baseline
    await page.evaluate('''()=>{const write=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='couronnes_arcanes_v1')throw Error('quota simulé');return write.call(this,k,v)}}''')
    await prepare();await click(page.locator('.modal [data-action="evolution-fusion-confirm"]'));assert await saved()==baseline
    assert 'aucun exemplaire consommé' in await page.locator('#toast').inner_text()
    await page.reload();await nav('alchemy');await prepare();await page.locator('.modal [data-action="evolution-fusion-confirm"]').dblclick()
    fused=await saved();expected=copy.deepcopy(baseline)
    if cfg.get('nativeSource'):expected['collection'][card_id]-=3;expected['evolvedCollection']={target_key:1}
    else:expected['evolvedCollection']={source:0,target_key:1}
    assert fused==expected
    await nav('collection');await click(page.locator(f'[data-action="collection-faction"][data-id="{faction}"]'))
    row=page.locator(f'[data-collection-character="{card_id}"]');assert await row.locator('td').count()==6
    assert 'Possédée ×1' in await row.locator('[data-collection-rarity="légendaire"]').inner_text()
    for rank in ['divine','éveillée']:
        cell=row.locator(f'[data-collection-rarity="{rank}"]')
        assert cfg.get('futureByRank',{}).get(rank,cfg['future']) in await cell.inner_text()
        if rank=='divine' and 'divineStats' in cfg:
            atk,hp=cfg['divineStats']
            assert await cell.locator('.stat.atk b').inner_text()==str(atk)
            assert await cell.locator('.stat.hp b').inner_text()==str(hp)
    if scenario=='ombre':
        preview=page.locator('[data-collection-character="crypt"] [data-collection-rarity="légendaire"] [data-collection-preview]')
        if touch:await preview.tap()
        else:await preview.hover()
        popup=page.locator('#collection-hover-inspection:not([hidden])');await popup.wait_for()
        for text in ['Veille funéraire','barrière personnelle 2','Au plus une fois par tour']:assert text in await popup.inner_text(),text
        assert await saved()==fused
        await page.keyboard.press('Escape')
    await nav('deck');await click(page.locator(f'[data-deck-card="{target_key}"] [data-action="deck-add"]'));profile=await saved()
    await nav('guide')
    async with page.expect_download() as info:await click(page.locator('[data-action="export-save"]'))
    exported=json.loads(Path(await (await info.value).path()).read_text());assert exported==profile
    await page.locator('#import-file').set_input_files({'name':'sylve-legend.json','mimeType':'application/json','buffer':json.dumps(exported).encode()});await page.locator('#view .hero-copy').wait_for();assert await saved()==profile
    if cfg.get('prepared'):
        fixture=json.loads(subprocess.check_output(['node',f'tests/fixtures/{cfg.get("fixture","foreur")}-battle.mjs',json.dumps(profile),card_id],cwd=ROOT))
        plan=fixture['plan']
        # Fusion et deck réels ci-dessus ; combat préparé valide pour rendre
        # une barrière éligible, avant d'installer l'horloge de cette page.
        await page.evaluate('([key,b])=>localStorage.setItem(key,JSON.stringify(b))',[BATTLE,fixture['battle']])
        await page.reload();await page.locator('.combat-screen').wait_for();assert await saved()==profile
    else:plan=json.loads(subprocess.check_output(['node','--input-type=module','-e',PLAN,json.dumps(profile),card_id,cfg['effect'],cfg.get('effectSide','e')],cwd=ROOT))
    # Horloge de test : observer la sauvegarde entre les deux camps, sans changer le moteur.
    await page.clock.install(time='2026-10-29T00:00:00Z')
    await page.clock.pause_at('2026-10-29T00:00:01Z')
    if not cfg.get('prepared'):
        await page.evaluate('(seed)=>{Date.now=()=>seed}',plan['seed']);await nav('campaign');await click(page.locator('[data-action="start-mission"][data-id="06"]'))
        for _ in range(plan['opening']):
            await click(page.locator('[data-action="end-turn"]'))
            await page.clock.run_for(1000)
            await page.wait_for_function("()=>{const b=JSON.parse(localStorage.getItem('couronnes_arcanes_bataille_v1'));return b?.phase==='player'}")
        b=await saved(BATTLE);index=next(i for i,c in enumerate(b['heroes']['p']['hand']) if c['id']==card_id and c.get('rarity')=='légendaire')
        hand=page.locator(f'.hand [data-action="select-card"][data-index="{index}"]');await click(hand)
        if touch:await click(hand)
        await click(page.locator('[data-action="deploy"][data-lane="0"][data-col="1"]'))
    b=await saved(BATTLE);u=b['board'][0][1];assert (u['rarity'],u['atk'],u['maxhp'])==('légendaire',*cfg['stats'])
    found=False;trace=[]
    for turn in range(1,plan['turn']+1):
        before=await saved(BATTLE)
        shield_before=before['heroes']['p']['shield']
        await page.locator('[data-action="end-turn"]:enabled').wait_for();await click(page.locator('[data-action="end-turn"]'))
        b=await saved(BATTLE);targets=[u for row in b['board'] for u in row if u and u['side']==cfg.get('effectSide','e') and u.get(cfg['effect'])]
        trace.append({'round':b['round'],'phase':b['phase'],'units':[(u['id'],u['side'],u['hp'],u.get(cfg['effect'])) for row in b['board'] for u in row if u]})
        if targets:
            target=targets[0]
            if cfg.get('damageOnly'):
                previous=next(u for row in before['board'] for u in row if u and u['uid']==plan['targetUid'])
                assert target['uid']==plan['targetUid'] and target['hp']==previous['hp']-cfg['damageOnly']
            elif scenario=='ether-spark':
                assert target[cfg['effect']]==b['round']+3
                assert b['board'][0][1]['uid']==target['uid'] and b['board'][0][2] is None
                victim=next(u for row in b['board'] for u in row if u and u['uid']==plan['targetUid'])
                assert victim['hp']==victim['maxhp']-1
            elif scenario=='ether-seer':
                source=next(u for row in b['board'] for u in row if u and u['id']=='seer' and u['side']=='p')
                assert target['uid']==plan['targetUid'] and target['hp']==target['maxhp']-1
                assert target[cfg['effect']]=={'sourceUid':source['uid'],'side':'p','amount':2,'dueRound':b['round']+1}
            elif scenario=='forge-scrap':
                assert target[cfg['effect']]==b['round']+3
                assert b['heroes']['p']['shield']==max(shield_before,min(20,shield_before+2))
            elif scenario=='forge-smith':
                assert target[cfg['effect']]==b['round']+3
                source_before=next((lane,col) for lane,row in enumerate(before['board']) for col,u in enumerate(row) if u and u['uid']==target['uid'])
                lane,col=source_before
                victim=before['board'][lane][col+1]
                assert victim and victim['side']=='e'
                assert b['board'][lane][col+1] is None
                assert b['board'][lane][col+2]['uid']==victim['uid']
                assert b['board'][lane][col]['uid']==target['uid']
            elif scenario=='forge-drill':
                assert target[cfg['effect']]==b['round']+3
                victim=next(u for row in b['board'] for u in row if u and u['uid']==plan['targetUid'])
                assert victim['barrier']==2 and victim['hp']==victim['maxhp']
                assert b['heroes']['p']['shield']==shield_before
            else:assert target[cfg['effect']]==({'amount':1,'remaining':1} if scenario=='sylve' else 2)
            found=True;break
        await page.clock.run_for(1000)
        await page.wait_for_function("()=>{const b=JSON.parse(localStorage.getItem('couronnes_arcanes_bataille_v1'));return b&&(b.phase==='player'||b.status!=='active')}")
    assert found,(plan,trace)
    inspected=next(u for row in b['board'] for u in row if u and u['id']==card_id and u['side']=='p') if cfg.get('damageOnly') else target
    card=page.locator(f'.board-card[data-unit-id="{inspected["uid"]}"]')
    if touch:await card.tap()
    else:await card.hover()
    assert cfg['status'] in await page.locator('#hand-card-inspection').inner_text()
    await page.screenshot(path=f'/tmp/ca-{scenario}-legendary-harass-{label}.png')
    await page.keyboard.press('Escape')
    await click(page.locator('.combat-menu-link'));frozen=await saved(BATTLE)
    assert any(u and u.get(cfg['effect']) for row in frozen['board'] for u in row)
    await page.reload();await page.locator('.combat-screen').wait_for();assert await saved(BATTLE)==frozen
    if scenario=='ether-seer':
        hp=target['hp']
        await page.clock.run_for(1000)
        await page.wait_for_function("()=>JSON.parse(localStorage.getItem('couronnes_arcanes_bataille_v1'))?.phase==='player'")
        await click(page.locator('[data-action="end-turn"]'));await page.clock.run_for(1000)
        await page.wait_for_function("()=>JSON.parse(localStorage.getItem('couronnes_arcanes_bataille_v1'))?.round===3")
        resolved=await saved(BATTLE);victim=next(u for row in resolved['board'] for u in row if u and u['uid']==plan['targetUid'])
        assert victim['hp']==hp-2 and 'stillOmen' not in victim
    await click(page.locator('.combat-menu-link'));assert await saved()==profile
    assert not await page.evaluate("'profile' in window||'battle' in window")
    assert not errors,errors;assert not external,external
    await ctx.close();print(f'{scenario.title()} Légendaire {label}: boss 06, deck protégé, panne, double clic, fusion, Collection/deck, export/import, {cfg["status"]} réel et reprise PASS',flush=True)

async def run_sylve_legendary_cases(browser,part=None,web_url=None,scenario='sylve'):
    for case in card_pack_cases(part):
        await run_sylve_legendary(browser,case['label'],case['viewport'],web_url if case['label']=='web' else None,scenario)

async def main(scenario):
    from playwright.async_api import async_playwright
    class Quiet(SimpleHTTPRequestHandler):
        def log_message(self,*args):pass
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:
        async with async_playwright() as pw:
            browser=await pw.chromium.launch(headless=True,args=['--no-sandbox'])
            await run_sylve_legendary_cases(browser,web_url=f'http://127.0.0.1:{server.server_port}/index.html',scenario=scenario)
            await browser.close()
    finally:server.shutdown();server.server_close()

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--scenario',choices=tuple(SCENARIOS),default='sylve')
    asyncio.run(main(parser.parse_args().scenario))
