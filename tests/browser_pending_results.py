"""Un résultat non enregistré ne peut être remplacé par action ou import."""
import json,subprocess,threading
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
SAVE='couronnes_arcanes_v1'
BATTLE='couronnes_arcanes_bataille_v1'
FAILURE='pending-result-test-block'
SCENARIOS=json.loads(subprocess.check_output(['node','tests/fixtures/pending-results.mjs'],cwd=ROOT))

async def stored(page,key=SAVE):
    return await page.evaluate('(key)=>JSON.parse(localStorage.getItem(key))',key)

async def pending_case(browser,scenario,label,viewport,*,touch=False,url=None):
    context=await browser.new_context(viewport=viewport,has_touch=touch,is_mobile=touch,
                                      reduced_motion='reduce',offline=not bool(url))
    page=await context.new_page();errors=[];external=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.on('request',lambda request:external.append(request.url)
            if request.url.startswith(('http:','https:')) and not request.url.startswith('http://127.0.0.1:') else None)
    await page.add_init_script('''(() => {
      const write=Storage.prototype.setItem;
      Storage.prototype.setItem=function(key,value){
        if(key==='couronnes_arcanes_v1'&&this.getItem('pending-result-test-block')==='yes')throw Error('quota simulé');
        return write.call(this,key,value);
      };
    })()''')
    await page.goto(url or (ROOT/'JOUER.html').as_uri())
    payload={SAVE:json.dumps(scenario['profile']),BATTLE:json.dumps(scenario['battle']),
             'couronnes_arcanes_animations_v13':'off',FAILURE:'yes'}
    await page.evaluate('(data)=>{for(const [key,value] of Object.entries(data))localStorage.setItem(key,value)}',payload)
    await page.reload()
    async def click(locator):
        if touch:await locator.tap()
        else:await locator.click()
    async def unchanged():
        assert await stored(page)==scenario['profile'],label
        assert await stored(page,BATTLE)==scenario['battle'],label

    await unchanged()
    # La navigation et l'export restent disponibles, le résultat reste intact.
    await click(page.locator('.combat-menu-link'))
    await click(page.locator('[data-action="start-next"]'))
    await unchanged()
    assert await page.locator('.combat-screen').count()==0
    await click(page.locator('[data-action="new-game"]'))
    assert await page.locator('[data-action="new-game-select"]').count()==0
    await unchanged()
    await click(page.locator('#nav [data-page="deck"]'))
    await click(page.locator('[data-action="deck-remove"]:not(:disabled)').first)
    await unchanged()
    await click(page.locator('#nav [data-page="guide"]'))
    # Un import déclenché sur le champ réel ne doit pas contourner le routeur.
    other={**scenario['profile'],'gold':999}
    await page.locator('#import-file').set_input_files({'name':'blocked.json','mimeType':'application/json',
                                                       'buffer':json.dumps(other).encode()})
    await unchanged()
    # Une fois le stockage rétabli, la première action règle l'ancien résultat.
    # Elle n'importe pas un autre profil et ne démarre pas une nouvelle bataille.
    await page.evaluate('(key)=>localStorage.removeItem(key)',FAILURE)
    await page.locator('#import-file').set_input_files({'name':'retry.json','mimeType':'application/json',
                                                       'buffer':json.dumps(other).encode()})
    await page.locator('.modal h2').wait_for()
    assert await stored(page)==scenario['expected'],label
    assert await stored(page,BATTLE) is None,label
    await page.screenshot(path=f'/tmp/ca-maintenance-pending-{label}.png')
    exit_action='dungeon-exit' if scenario['mode']=='dungeon' else 'battle-exit'
    await click(page.locator(f'.modal [data-action="{exit_action}"]'))
    await page.reload()
    assert await stored(page)==scenario['expected'],'aucun second gain à la reprise'
    await click(page.locator('#nav [data-page="campaign"]'))
    await click(page.locator('[data-action="start-mission"][data-id="01"]'))
    active=await stored(page,BATTLE)
    assert active['status']=='active' and active['missionId']=='01'
    assert await stored(page)==scenario['expected']
    assert not await page.evaluate("'profile' in window||'battle' in window"),'export de production requis'
    assert not errors,errors
    assert not external,external
    await context.close()
    print(f'Clôture protégée {label} : actions/import bloqués, reprise et gain unique PASS',flush=True)

async def run_pending_results(browser):
    for scenario in SCENARIOS:
        await pending_case(browser,scenario,scenario['mode']+'-'+scenario['status'],{'width':1366,'height':900})
    for label,scenario,viewport in [('portrait',SCENARIOS[0],{'width':390,'height':844}),
                                     ('landscape',SCENARIOS[1],{'width':844,'height':390})]:
        await pending_case(browser,scenario,label,viewport,touch=True)
    class QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self,*args):pass
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    try:
        await pending_case(browser,SCENARIOS[0],'web',{'width':1366,'height':900},
                           url=f'http://127.0.0.1:{server.server_port}/index.html')
    finally:server.shutdown();server.server_close()
