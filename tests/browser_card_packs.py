"""Vrais achats : probabilités affichées, confirmation, panne, rangs, fusion et combat."""
import asyncio,copy,json,subprocess,threading
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from playwright.async_api import async_playwright
from evolution_ci_plan import card_pack_cases

ROOT=Path(__file__).resolve().parents[1]
SAVE='couronnes_arcanes_v1'
BATTLE='couronnes_arcanes_bataille_v1'
PROFILE=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {freshProfile} from './src/engine.js';const p=freshProfile();p.gold=1000;p.completed=['01','02','03'];p.guideSeen=true;console.log(JSON.stringify(p));"],cwd=ROOT))

async def run_card_packs(browser,label,viewport,url=None):
    touch=label in ('portrait','landscape')
    context=await browser.new_context(viewport=viewport,has_touch=touch,offline=not bool(url),reduced_motion='reduce',accept_downloads=True)
    page=await context.new_page();errors=[];external=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda r:external.append(r.url) if r.url.startswith(('http:','https:')) and not r.url.startswith('http://127.0.0.1:') else None)
    # Six valeurs par achat : une carte de base, une évolution Rare et une Épique.
    # Le hook règle le hasard, jamais les sauvegardes ou le résultat du moteur.
    await page.add_init_script('''(()=>{const values=[0,0,.6,0,.95,0];let i=0;Math.random=()=>values[i++%values.length];})()''')
    await page.goto(url or (ROOT/'JOUER.html').as_uri())
    locked=copy.deepcopy(PROFILE);locked['completed']=['01','02']
    await page.evaluate('([key,p])=>{localStorage.setItem(key,JSON.stringify(p));localStorage.setItem("couronnes_arcanes_animations_v13","off")}',[SAVE,locked])
    await page.reload()
    async def click(locator):
        if touch:await locator.tap()
        else:await locator.click()
    async def saved(key=SAVE):return await page.evaluate('(key)=>JSON.parse(localStorage.getItem(key))',key)
    async def forge():await click(page.locator('#nav [data-page="forge"]'))
    offer=page.locator('[data-pack-id="aube-evolution"]')
    async def prepare():await click(offer.locator('[data-action="card-pack-preview"]'))
    async def confirm():await click(page.locator('.modal [data-action="card-pack-confirm"]'))
    async def close():await click(page.locator('.modal [data-action="close-modal"]'))
    await forge()
    assert await offer.locator('button').is_disabled()
    assert 'Gardien du Bosquet' in await offer.inner_text()
    assert await page.locator('[data-action="buy-pack"]').is_enabled()
    await click(page.locator('#nav [data-page="guide"]'))
    await page.locator('#import-file').set_input_files({'name':'boss-termine.json','mimeType':'application/json','buffer':json.dumps(PROFILE).encode()})
    await page.locator('#view .hero-copy').wait_for();await forge();baseline=await saved()
    text=await offer.inner_text()
    for word in ['190 or','60 %','35 %','5 %','tirages indépendants','aucun rang garanti']:assert word in text,word
    assert await offer.locator('.pack-rates li').count()==3
    assert await offer.locator('.pack-content').get_attribute('open') is None
    await offer.scroll_into_view_if_needed();await page.screenshot(path=f'/tmp/ca-packs-{label}.png')
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    await prepare();assert await saved()==baseline
    assert '190 or seront dépensés' in await page.locator('.modal').inner_text()
    await page.screenshot(path=f'/tmp/ca-packs-confirm-{label}.png')
    await close();assert await saved()==baseline
    # Échec de sauvegarde après tirage : ni débit, ni carte, ni résultat annoncé.
    await page.evaluate('''()=>{const write=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='couronnes_arcanes_v1')throw Error('quota simulé');return write.call(this,k,v)}}''')
    await prepare();await confirm();assert await saved()==baseline
    assert 'aucun or dépensé' in await page.locator('#toast').inner_text()
    await page.reload();await forge();assert await saved()==baseline
    await prepare();await page.reload();await forge();assert await saved()==baseline
    await prepare();await page.locator('.modal [data-action="card-pack-confirm"]').dblclick()
    first=await saved();assert first['gold']==810
    assert first['collection']['militia']==5
    assert first['evolvedCollection']=={'militia:rare':1,'militia:épique':1}
    keep=lambda p:{k:v for k,v in p.items() if k not in ('gold','collection','evolvedCollection')}
    assert keep(first)==keep(baseline)
    assert await page.locator('.modal .unit-card').count()==3
    target=page.locator('.modal .unit-card[data-rarity="épique"]')
    if touch:await target.tap()
    else:await target.hover()
    popup=page.locator('#collection-hover-inspection:not([hidden])');await popup.wait_for()
    assert 'PAQUET' in await popup.inner_text() and '−2' in await popup.inner_text()
    assert await saved()==first;await page.keyboard.press('Escape')
    await click(page.locator('.modal [data-action="pack-collection"]'))
    row=page.locator('[data-collection-character="militia"]')
    for rarity in ['rare','épique']:assert 'Possédée ×1' in await row.locator(f'[data-collection-rarity="{rarity}"]').inner_text()
    await page.reload();assert await saved()==first;await forge()
    for _ in range(2):await prepare();await confirm();await close()
    drawn=await saved();assert drawn['gold']==430
    assert drawn['evolvedCollection']=={'militia:rare':3,'militia:épique':3}
    await click(page.locator('#nav [data-page="alchemy"]'))
    await click(page.locator('[data-fusion-id="militia:épique"] [data-action="evolution-fusion-preview"]'))
    await click(page.locator('.modal [data-action="evolution-fusion-confirm"]'))
    fused=await saved();assert fused['gold']==430
    assert fused['evolvedCollection']=={'militia:rare':0,'militia:épique':4}
    assert 'completedTrials' not in fused and fused['deck']==baseline['deck']
    # Le paquet mystique reste un achat de trois cartes natives pour 95 or.
    await forge();await click(page.locator('[data-action="buy-pack"]'))
    assert await page.locator('.modal .unit-card').count()==3
    native=await saved();assert native['gold']==335 and native['evolvedCollection']==fused['evolvedCollection'];await close()
    await click(page.locator('#nav [data-page="deck"]'))
    await click(page.locator('[data-deck-card="militia:épique"] [data-action="deck-add"]'))
    final=await saved();assert {'id':'militia','rarity':'épique'} in final['deck']
    await click(page.locator('#nav [data-page="guide"]'))
    async with page.expect_download() as info:await click(page.locator('[data-action="export-save"]'))
    exported=json.loads(Path(await (await info.value).path()).read_text());assert exported==final
    await page.locator('#import-file').set_input_files({'name':'paquets.json','mimeType':'application/json','buffer':json.dumps(exported).encode()})
    await page.locator('#view .hero-copy').wait_for();assert await saved()==final
    seed=int(subprocess.check_output(['node','--input-type=module','-e',"import {createBattle} from './src/engine.js';import {CAMPAIGN} from './src/data.js';const p=JSON.parse(process.argv[1]);for(let s=1;s<=100;s++){if(createBattle(p,CAMPAIGN[0],s).heroes.p.hand.some(c=>c.id==='militia'&&c.rarity==='épique')){console.log(s);break;}}",json.dumps(final)],cwd=ROOT))
    await page.evaluate('(s)=>{Date.now=()=>s}',seed)
    await click(page.locator('#nav [data-page="campaign"]'));await click(page.locator('[data-action="start-mission"][data-id="01"]'))
    b=await saved(BATTLE);index=next(i for i,c in enumerate(b['heroes']['p']['hand']) if c['id']=='militia' and c.get('rarity')=='épique')
    hand=page.locator(f'.hand [data-action="select-card"][data-index="{index}"]');await click(hand)
    if touch:await click(hand)
    await click(page.locator('[data-action="deploy"][data-lane="0"][data-col="1"]'))
    snapshot=await saved(BATTLE);u=snapshot['board'][0][1]
    assert (u['id'],u['rarity'],u['atk'],u['maxhp'])==('militia','épique',2,5)
    await page.reload();await page.locator('.combat-screen').wait_for();assert await saved(BATTLE)==snapshot
    await click(page.locator('.combat-menu-link'));await forge()
    assert await offer.locator('button').is_disabled() and await page.locator('[data-action="buy-pack"]').is_disabled()
    assert await saved()==final
    assert not await page.evaluate("'profile' in window||'battle' in window")
    assert not errors,errors
    assert not external,external
    await context.close()
    print(f'Paquets {label}: boss, probabilités, annulation, panne, double clic, stocks, fusion, export/import et invocation/reprise PASS',flush=True)

async def run_card_pack_cases(browser,part=None,web_url=None):
    for case in card_pack_cases(part):
        await run_card_packs(browser,case['label'],case['viewport'],web_url if case['label']=='web' else None)

async def main():
    class Quiet(SimpleHTTPRequestHandler):
        def log_message(self,*args):pass
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:
        async with async_playwright() as pw:
            browser=await pw.chromium.launch(headless=True,args=['--no-sandbox'])
            await run_card_pack_cases(browser,web_url=f'http://127.0.0.1:{server.server_port}/index.html');await browser.close()
    finally:server.shutdown();server.server_close()

if __name__=='__main__':asyncio.run(main())
