"""Fusion Légendaire Sylve, vrai combat et reprise des effets dans le jeu distribué."""
import asyncio,copy,json,subprocess
from pathlib import Path
from evolution_ci_plan import card_pack_cases

ROOT=Path(__file__).resolve().parents[1]
SAVE='couronnes_arcanes_v1'
BATTLE='couronnes_arcanes_bataille_v1'
PROFILE=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {freshProfile} from './src/engine.js';const p=freshProfile();p.completed=['01','02','03','04','05'];p.unlocked=6;p.guideSeen=true;p.evolvedCollection={'owl:épique':3};p.deck[0]={id:'owl',rarity:'épique'};console.log(JSON.stringify(p));"],cwd=ROOT))
PLAN="""import {createBattle,playPlayerCard,endPlayerTurn,playEnemyCard,finishEnemyTurn} from './src/engine.js';import {CAMPAIGN} from './src/data.js';const p=JSON.parse(process.argv[1]);let found=null;for(let seed=1;seed<=1000&&!found;seed++){const b=createBattle(p,CAMPAIGN[5],seed,{turnFlow:'alternating'}),i=b.heroes.p.hand.findIndex(c=>c.id==='owl'&&c.rarity==='légendaire');if(i<0)continue;playPlayerCard(b,i,0,1);for(let turn=1;turn<=10&&b.status==='active';turn++){endPlayerTurn(b);const target=b.board.flat().find(u=>u?.side==='e'&&u.attackPenalty);if(target){found={seed,turn};break;}for(let n=0;n<2&&b.status==='active';n++)if(playEnemyCard(b).done)break;if(b.status==='active')finishEnemyTurn(b);}}if(!found)throw Error('Aucune graine de combat normale trouvée');console.log(JSON.stringify(found));"""

async def run_sylve_legendary(browser,label,viewport,url=None):
    touch=label in ('portrait','landscape')
    ctx=await browser.new_context(viewport=viewport,has_touch=touch,offline=not bool(url),reduced_motion='reduce',accept_downloads=True)
    page=await ctx.new_page();errors=[];external=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda r:external.append(r.url) if r.url.startswith(('http:','https:')) and not r.url.startswith('http://127.0.0.1:') else None)
    await page.goto(url or (ROOT/'JOUER.html').as_uri())
    await page.evaluate('([k,p])=>{localStorage.setItem(k,JSON.stringify(p));localStorage.setItem("couronnes_arcanes_animations_v13","off")}',[SAVE,PROFILE]);await page.reload()
    async def click(loc):
        if touch:await loc.tap()
        else:await loc.click()
    async def saved(key=SAVE):return await page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',key)
    async def nav(screen):await click(page.locator(f'#nav [data-page="{screen}"]'))
    async def prepare():await click(page.locator('[data-fusion-id="owl:légendaire"] [data-action="evolution-fusion-preview"]'))
    await nav('alchemy');tile=page.locator('[data-fusion-id="owl:légendaire"]')
    assert await tile.locator('button').is_disabled() and 'Colosse des Fourneaux' in await tile.inner_text()
    unlocked=copy.deepcopy(PROFILE);unlocked['completed'].append('06')
    await nav('guide');await page.locator('#import-file').set_input_files({'name':'boss06.json','mimeType':'application/json','buffer':json.dumps(unlocked).encode()});await page.locator('#view .hero-copy').wait_for()
    await nav('alchemy');assert await tile.locator('button').is_disabled() and '1 dans le deck' in await tile.inner_text()
    await nav('deck');await click(page.locator('[data-deck-zone="current"] [data-deck-card="owl:épique"] [data-action="deck-remove"]'))
    await nav('alchemy');baseline=await saved();assert await tile.locator('button').is_enabled()
    card=tile.locator('.unit-card')
    if touch:await card.tap()
    else:await card.hover()
    popup=page.locator('#collection-hover-inspection:not([hidden])');await popup.wait_for()
    for text in ['Harcèlement','−1 ATQ','fusion']:assert text in await popup.inner_text(),text
    await page.keyboard.press('Escape');await prepare();assert await saved()==baseline
    assert '3 exemplaires épique' in await page.locator('.modal').inner_text()
    await page.screenshot(path=f'/tmp/ca-sylve-legendary-fusion-{label}.png')
    await click(page.locator('.modal [data-action="close-modal"]'));assert await saved()==baseline
    await page.evaluate('''()=>{const write=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='couronnes_arcanes_v1')throw Error('quota simulé');return write.call(this,k,v)}}''')
    await prepare();await click(page.locator('.modal [data-action="evolution-fusion-confirm"]'));assert await saved()==baseline
    assert 'aucun exemplaire consommé' in await page.locator('#toast').inner_text()
    await page.reload();await nav('alchemy');await prepare();await page.locator('.modal [data-action="evolution-fusion-confirm"]').dblclick()
    fused=await saved();expected=copy.deepcopy(baseline);expected['evolvedCollection']={'owl:épique':0,'owl:légendaire':1};assert fused==expected
    await nav('collection');await click(page.locator('[data-action="collection-faction"][data-id="sylve"]'))
    row=page.locator('[data-collection-character="owl"]');assert await row.locator('td').count()==6
    assert 'Possédée ×1' in await row.locator('[data-collection-rarity="légendaire"]').inner_text()
    for rank in ['divine','éveillée']:assert 'Ascension requise' in await row.locator(f'[data-collection-rarity="{rank}"]').inner_text()
    await nav('deck');await click(page.locator('[data-deck-card="owl:légendaire"] [data-action="deck-add"]'));profile=await saved()
    await nav('guide')
    async with page.expect_download() as info:await click(page.locator('[data-action="export-save"]'))
    exported=json.loads(Path(await (await info.value).path()).read_text());assert exported==profile
    await page.locator('#import-file').set_input_files({'name':'sylve-legend.json','mimeType':'application/json','buffer':json.dumps(exported).encode()});await page.locator('#view .hero-copy').wait_for();assert await saved()==profile
    plan=json.loads(subprocess.check_output(['node','--input-type=module','-e',PLAN,json.dumps(profile)],cwd=ROOT))
    # Horloge de test : observer la sauvegarde entre les deux camps, sans changer le moteur.
    await page.clock.install(time='2026-10-29T00:00:00Z')
    await page.clock.pause_at('2026-10-29T00:00:01Z')
    await page.evaluate('(seed)=>{Date.now=()=>seed}',plan['seed']);await nav('campaign');await click(page.locator('[data-action="start-mission"][data-id="06"]'))
    b=await saved(BATTLE);index=next(i for i,c in enumerate(b['heroes']['p']['hand']) if c['id']=='owl' and c.get('rarity')=='légendaire')
    hand=page.locator(f'.hand [data-action="select-card"][data-index="{index}"]');await click(hand)
    if touch:await click(hand)
    await click(page.locator('[data-action="deploy"][data-lane="0"][data-col="1"]'))
    b=await saved(BATTLE);u=b['board'][0][1];assert (u['rarity'],u['atk'],u['maxhp'])==('légendaire',3,5)
    found=False;trace=[]
    for turn in range(1,plan['turn']+1):
        await page.locator('[data-action="end-turn"]:enabled').wait_for();await click(page.locator('[data-action="end-turn"]'))
        b=await saved(BATTLE);targets=[u for row in b['board'] for u in row if u and u['side']=='e' and u.get('attackPenalty')]
        trace.append({'round':b['round'],'phase':b['phase'],'units':[(u['id'],u['side'],u['hp'],u.get('attackPenalty')) for row in b['board'] for u in row if u]})
        if targets:
            target=targets[0];assert target['attackPenalty']=={'amount':1,'remaining':1};found=True;break
        await page.clock.run_for(1000)
        await page.wait_for_function("()=>{const b=JSON.parse(localStorage.getItem('couronnes_arcanes_bataille_v1'));return b&&(b.phase==='player'||b.status!=='active')}")
    assert found,(plan,trace)
    card=page.locator(f'.board-card[data-unit-id="{target["uid"]}"]')
    if touch:await card.tap()
    else:await card.hover()
    assert 'Harcèlement' in await page.locator('#hand-card-inspection').inner_text()
    await page.screenshot(path=f'/tmp/ca-sylve-legendary-harass-{label}.png')
    await page.keyboard.press('Escape')
    await click(page.locator('.combat-menu-link'));frozen=await saved(BATTLE)
    assert any(u and u.get('attackPenalty') for row in frozen['board'] for u in row)
    await page.reload();await page.locator('.combat-screen').wait_for();assert await saved(BATTLE)==frozen
    await click(page.locator('.combat-menu-link'));assert await saved()==profile
    assert not await page.evaluate("'profile' in window||'battle' in window")
    assert not errors,errors;assert not external,external
    await ctx.close();print(f'Sylve Légendaire {label}: boss 06, deck protégé, panne, double clic, fusion, Collection/deck, export/import, Harcèlement réel et reprise PASS',flush=True)

async def run_sylve_legendary_cases(browser,part=None,web_url=None):
    for case in card_pack_cases(part):
        await run_sylve_legendary(browser,case['label'],case['viewport'],web_url if case['label']=='web' else None)
