"""Campagne de bout en bout dans le navigateur, à lancer à la demande."""
import asyncio
import json
import subprocess
import threading
from argparse import ArgumentParser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
SAVE='couronnes_arcanes_v1'
BATTLE='couronnes_arcanes_bataille_v1'
SCENARIOS=json.loads(subprocess.check_output(['node','tests/fixtures/campaign-journey.mjs'],cwd=ROOT))
async def stored(page,key):
    return await page.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',key)

async def activate(locator,seed=None):
    await locator.evaluate('''(button,seed) => {
        if(button.disabled||!button.getClientRects().length)throw Error("Commande indisponible");
        const realNow=Date.now;
        try {
            if(seed!==null)Date.now=()=>seed;
            button.click();
        } finally {Date.now=realNow;}
    }''',seed)

async def press(page,action,qualifier='',*,seed=None):
    prefix='#nav ' if action=='nav' else ''
    await activate(page.locator(f'{prefix}[data-action="{action}"]{qualifier}'),seed)

async def combat(page,mission):
    for action in mission['actions']:
        kind=action['type']
        if kind=='power':
            await press(page,'hero-power')
        elif kind=='end':
            if action['round']%5==0:print(f"Mission {mission['id']}, tour {action['round']}",flush=True)
            await press(page,'end-turn')
            await page.wait_for_function('''([k,n])=>{
                const b=JSON.parse(localStorage.getItem(k));
                return !b||b.status!=='active'||(b.phase==='player'&&b.round>n);
            }''',arg=[BATTLE,action['round']])
            if action['round']==3 and mission['id'] in ('01','06','12'):
                snapshot=await stored(page,BATTLE)
                assert snapshot['status']=='active'
                await page.reload()
                await page.locator('.combat-screen').wait_for()
                assert await stored(page,BATTLE)==snapshot
        else:
            b=await stored(page,BATTLE)
            assert b['heroes']['p']['hand'][action['i']]['id']==action['id'],(mission['id'],action,b['round'])
            await press(page,'select-card',f'[data-index="{action["i"]}"]')
            lane=f'[data-lane="{action["lane"]}"]'
            if kind=='unité':
                await press(page,'deploy',f'{lane}[data-col="{action["col"]}"]')
            else:
                targets=page.locator(f'[data-action="spell-target"]{lane}')
                lanes=page.locator(f'.spell-lanes [data-action="spell-lane"]{lane}')
                if await targets.count():await activate(targets.first)
                elif await lanes.count():await activate(lanes.first)
                await press(page,'spell-confirm')
    await page.locator('.modal h2').filter(has_text='La couronne est vôtre !').wait_for()

async def main(url,offline):
    errors,external=[],[]
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True,args=['--no-sandbox'])
        context=await browser.new_context(viewport={'width':1440,'height':960},offline=offline,reduced_motion='reduce',accept_downloads=True)
        page=await context.new_page()
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('request',lambda r:external.append(r.url) if r.url.startswith(('http:','https:')) and not r.url.startswith('http://127.0.0.1:') else None)
        await page.goto(url)
        assert await stored(page,SAVE) is None and await stored(page,BATTLE) is None
        for index,mission in enumerate(SCENARIOS):
            mid=mission['id']
            print(f'Mission {mid} · graine {mission["seed"]}',flush=True)
            if index==0:
                await press(page,'welcome-start',seed=mission['seed'])
                await press(page,'toggle-animations')
            else:
                if mission['upgrades']:
                    await press(page,'nav','[data-page="forge"]')
                    for upgrade in mission['upgrades']:
                        await press(page,upgrade['type']+'-upgrade',f'[data-id="{upgrade["id"]}"]')
                    await press(page,'nav','[data-page="campaign"]')
                await press(page,'start-mission',f'[data-id="{mid}"]',seed=mission['seed'])
            assert (await stored(page,BATTLE))['missionId']==mid
            await combat(page,mission)
            after=await stored(page,SAVE)
            receipt=after.pop('lastBattleSettlementId')
            assert receipt.startswith(mid+':'),receipt
            assert after==mission['expected'],(mid,{k:(after.get(k),mission['expected'].get(k)) for k in after if after.get(k)!=mission['expected'].get(k)})
            await press(page,'battle-exit')
            assert await stored(page,BATTLE) is None
            if mid in ('01','06','12'):
                before=await stored(page,SAVE)
                await page.reload()
                assert await stored(page,SAVE)==before
                await press(page,'nav','[data-page="campaign"]')
            print(mid,mission['seed'],mission['turns'],after['wins'],after['gold'],after['shards'],flush=True)
        await press(page,'nav','[data-page="guide"]')
        async with page.expect_download() as transfer:
            await press(page,'export-save')
        downloaded=await (await transfer.value).path()
        assert json.loads(downloaded.read_text())==await stored(page,SAVE)
        assert len(SCENARIOS)==12 and not errors and not external,(errors,external)
        print('Campagne 01 à 12, profil neuf, sauvegardes et export final vérifiés.',flush=True)
        await browser.close()

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self,*args):
        pass

if __name__=='__main__':
    parser=ArgumentParser(description=__doc__)
    parser.add_argument('--offline',action='store_true',help='Utiliser JOUER.html sans réseau')
    if parser.parse_args().offline:
        asyncio.run(main((ROOT/'JOUER.html').as_uri(),True))
    else:
        with ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=ROOT)) as server:
            threading.Thread(target=server.serve_forever,daemon=True).start()
            try:
                asyncio.run(main(f'http://127.0.0.1:{server.server_port}/index.html',False))
            finally:
                server.shutdown()
