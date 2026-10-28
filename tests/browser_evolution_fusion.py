"""Fusion réelle : confirmation, stocks par rang, panne de stockage, deck et combat."""
import asyncio,copy,json,subprocess,threading
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[1]
SAVE='couronnes_arcanes_v1'
BATTLE='couronnes_arcanes_bataille_v1'
PROFILE=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {freshProfile} from './src/engine.js';const p=freshProfile();p.completed=['01','02','03'];p.guideSeen=true;p.collection.lancer=12;p.collection.shield=5;p.collection.cleric=3;console.log(JSON.stringify(p));"],cwd=ROOT))

async def run_evolution_fusion(browser,label,viewport,url=None):
    touch=label in ('portrait','landscape')
    context=await browser.new_context(viewport=viewport,has_touch=touch,offline=not bool(url),reduced_motion='reduce',accept_downloads=True)
    page=await context.new_page();errors=[];external=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda r:external.append(r.url) if r.url.startswith(('http:','https:')) and not r.url.startswith('http://127.0.0.1:') else None)
    await page.goto(url or (ROOT/'JOUER.html').as_uri())
    await page.evaluate('([key,p])=>{localStorage.setItem(key,JSON.stringify(p));localStorage.setItem("couronnes_arcanes_animations_v13","off")}',[SAVE,PROFILE])
    await page.reload()
    async def click(locator):
        if touch:await locator.tap()
        else:await locator.click()
    async def saved(key=SAVE):return await page.evaluate('(key)=>JSON.parse(localStorage.getItem(key))',key)
    async def open_alchemy():await click(page.locator('#nav [data-page="alchemy"]'))
    def tile(recipe):return page.locator(f'[data-fusion-id="{recipe}"]')
    async def preview(recipe):await click(tile(recipe).locator('[data-action="evolution-fusion-preview"]'))
    async def confirm():await click(page.locator('.modal [data-action="evolution-fusion-confirm"]'))
    async def fuse(recipe):await preview(recipe);await confirm()
    await open_alchemy();baseline=await saved()
    assert await page.locator('[data-fusion-id]').count()==12
    assert await tile('militia:rare').locator('button').is_disabled(),'Les quatre Miliciens du deck sont protégés.'
    assert await tile('lancer:rare').locator('button').is_enabled()
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    await tile('lancer:rare').scroll_into_view_if_needed()
    await page.screenshot(path=f'/tmp/ca-evolution-fusion-{label}.png')
    # Consultation et annulation sans mutation.
    card=tile('lancer:rare').locator('.unit-card')
    if touch:await card.tap()
    else:await card.hover()
    popup=page.locator('#collection-hover-inspection:not([hidden])');await popup.wait_for()
    assert 'À obtenir par fusion' in await popup.inner_text()
    assert await saved()==baseline
    await page.keyboard.press('Escape')
    await preview('lancer:rare');assert '3 exemplaires commun' in await page.locator('.modal').inner_text()
    await page.screenshot(path=f'/tmp/ca-evolution-fusion-confirm-{label}.png')
    await click(page.locator('.modal [data-action="close-modal"]'));assert await saved()==baseline
    # Une panne d'écriture n'adopte pas le profil modifié.
    await page.evaluate('''()=>{
      const write=Storage.prototype.setItem;
      Storage.prototype.setItem=function(k,v){if(k==='couronnes_arcanes_v1')throw Error('quota simulé');return write.call(this,k,v)};
    }''')
    await preview('lancer:rare');await confirm();assert await saved()==baseline
    assert 'aucun exemplaire consommé' in await page.locator('#toast').inner_text()
    await preview('lancer:rare');assert '12 → 9' in await page.locator('.modal').inner_text()
    await page.reload();assert await saved()==baseline;await open_alchemy()
    # La préparation d'une fusion est perdue à la reprise ; elle ne consomme rien.
    await preview('lancer:rare');await page.reload();assert await saved()==baseline;await open_alchemy()
    await preview('lancer:rare')
    await page.locator('.modal [data-action="evolution-fusion-confirm"]').dblclick()
    first=await saved();assert first['collection']['lancer']==9 and first['evolvedCollection']=={'lancer:rare':1}
    assert first['deck']==baseline['deck']
    for key in ['gold','shards','completed','mastery','wins','losses','heroXp']:assert first[key]==baseline[key],key
    await page.reload();assert await saved()==first;await open_alchemy()
    for _ in range(2):await fuse('lancer:rare')
    before_epic=await saved();assert before_epic['evolvedCollection']['lancer:rare']==3
    await fuse('lancer:épique')
    epic=await saved();assert epic['collection']['lancer']==3
    assert epic['evolvedCollection']=={'lancer:rare':0,'lancer:épique':1}
    assert 'completedTrials' not in epic
    # Le Porte-égide du deck n'est jamais prélevé ; une nouvelle version de soin fonctionne aussi.
    await fuse('shield:rare');assert (await saved())['collection']['shield']==2
    assert await tile('shield:rare').locator('button').is_disabled()
    await fuse('cleric:épique');assert (await saved())['collection']['cleric']==0
    await click(page.locator('#nav [data-page="collection"]'))
    cell=page.locator('[data-collection-character="lancer"] [data-collection-rarity="épique"]')
    assert 'Possédée ×1' in await cell.inner_text()
    await click(page.locator('#nav [data-page="deck"]'))
    await click(page.locator('[data-deck-card="lancer:épique"] [data-action="deck-add"]'))
    final=await saved();assert {'id':'lancer','rarity':'épique'} in final['deck']
    await click(page.locator('#nav [data-page="guide"]'))
    async with page.expect_download() as info:await click(page.locator('[data-action="export-save"]'))
    exported=json.loads(Path(await (await info.value).path()).read_text());assert exported==final
    await page.locator('#import-file').set_input_files({'name':'fusion.json','mimeType':'application/json','buffer':json.dumps(exported).encode()})
    await page.locator('#view .hero-copy').wait_for();assert await saved()==final
    # Graine déterministe choisie pour piocher l'exemplaire réellement créé.
    seed=int(subprocess.check_output(['node','--input-type=module','-e',"import {createBattle} from './src/engine.js';import {CAMPAIGN} from './src/data.js';const p=JSON.parse(process.argv[1]);for(let s=1;s<=100;s++){if(createBattle(p,CAMPAIGN[0],s).heroes.p.hand.some(c=>c.id==='lancer'&&c.rarity==='épique')){console.log(s);break;}}",json.dumps(final)],cwd=ROOT))
    await page.evaluate('(s)=>{Date.now=()=>s}',seed)
    await click(page.locator('#nav [data-page="campaign"]'));await click(page.locator('[data-action="start-mission"][data-id="01"]'))
    b=await saved(BATTLE);index=next(i for i,c in enumerate(b['heroes']['p']['hand']) if c['id']=='lancer' and c.get('rarity')=='épique')
    hand=page.locator(f'.hand [data-action="select-card"][data-index="{index}"]')
    await click(hand)
    if touch:await click(hand)
    await click(page.locator('[data-action="deploy"][data-lane="0"][data-col="1"]'))
    snapshot=await saved(BATTLE);u=snapshot['board'][0][1]
    assert (u['id'],u['rarity'],u['atk'],u['maxhp'])==('lancer','épique',4,6)
    await page.reload();await page.locator('.combat-screen').wait_for();assert await saved(BATTLE)==snapshot
    await click(page.locator('.combat-menu-link'));await open_alchemy()
    assert await tile('lancer:rare').locator('button').is_disabled(),'Aucune fusion pendant le combat.'
    assert await saved()==final
    assert not await page.evaluate("'profile' in window||'battle' in window")
    assert not errors,errors
    assert not external,external
    await context.close()
    print(f'Fusion {label}: confirmation, annulation, panne, stocks par rang, deck protégé, export/import et vraie invocation/reprise PASS',flush=True)

async def run_fusion_cases(browser):
    for label,vp in [('desktop',{'width':1440,'height':1000}),('portrait',{'width':390,'height':844}),('landscape',{'width':844,'height':390})]:
        await run_evolution_fusion(browser,label,vp)
    class Quiet(SimpleHTTPRequestHandler):
        def log_message(self,*args):pass
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
    try:await run_evolution_fusion(browser,'web',{'width':1366,'height':900},f'http://127.0.0.1:{server.server_port}/index.html')
    finally:server.shutdown();server.server_close()

async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True,args=['--no-sandbox'])
        await run_fusion_cases(browser);await browser.close()

if __name__=='__main__':asyncio.run(main())
