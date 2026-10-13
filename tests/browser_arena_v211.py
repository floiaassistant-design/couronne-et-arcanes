"""Arène réelle 2/3/4×10 : interaction, défilement, effets, sauvegarde et export."""
import asyncio
import functools
import threading
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from playwright.async_api import async_playwright
from browser_class_skills_v28 import make_page

ROOT=Path(__file__).resolve().parents[1]

async def run(browser,label,viewport):
    errors=[]
    page=await make_page(browser,viewport,{},errors)
    await page.locator('[data-action="welcome-start"]').click()
    for lanes in [2,3,4]:
        await page.evaluate('''lanes=>{
          battle=createBattle(profile,{id:'01',name:'Les ruines d’Astravelle',enemy:'Veilleur des Portes',hp:90,difficulty:lanes===3?3:1,boss:lanes===4,deck:[]},211);
          battle.heroes.p.hand=[{id:'militia',wait:0}];battle.heroes.e.hand=[];
          render();
        }''',lanes)
        assert await page.locator('.lane-row').count()==lanes
        # Quatre pistes visuelles fixes ; seules les lignes du moteur sont interactives.
        assert await page.locator('.arena-structured').count()==1
        assert await page.locator('.arena-dormant-row').count()==4-lanes
        expected=[1,2] if lanes==2 else list(range(lanes))
        active=await page.locator('.lane-row').evaluate_all(
            "(rows) => rows.map(row=>Number(row.dataset.visualLane))")
        assert active==expected,(lanes,active)
        rows=page.locator('.arena-structured > .lane-row, .arena-structured > .arena-dormant-row')
        assert await rows.count()==4
        geometry=await rows.evaluate_all("""rows => rows.map(row => {
            const tile=row.querySelector('.battle-cell,.arena-dormant-cell');
            const r=tile.getBoundingClientRect();
            return {x:r.x,w:r.width,height:r.height};
        })""")
        assert max(x['x'] for x in geometry)-min(x['x'] for x in geometry)<1,geometry
        assert max(x['w'] for x in geometry)-min(x['w'] for x in geometry)<1,geometry
        assert all(x['height']>=90 for x in geometry)
        assert await page.locator('.arena-dormant-row [data-action],.arena-dormant-row [tabindex]').count()==0
        assert await page.locator('.battle-cell').count()==lanes*10
        assert await page.locator('.lane-gate').count()==lanes*2
        assert f'{lanes} lignes · 10 cases' in await page.locator('.arena-caption').inner_text()
        await page.locator('.hand [data-action="select-card"]').click()
        target=page.locator(f'[data-action="deploy"][data-lane="{lanes-1}"]')
        await target.focus()
        await page.keyboard.press('Enter')
        assert await page.evaluate('(l)=>battle.board[l-1][1].id',lanes)=='militia'
        src=await page.locator('.sprite-figure').first.get_attribute('src')
        assert src.startswith('data:image/svg+xml,'),src
        await page.evaluate('''lanes=>{
          const u=(id,side,uid,ability='',ranged=false)=>({uid,id,side,atk:2,hp:12,maxhp:12,armor:0,ranged,ability,stun:0,poison:0,poisonTurns:0});
          battle.board[0][3]=u('wolf','p',90,'haste');battle.board[0][7]=u('lich','e',91,'splash');
          battle.board[lanes-1][8]=u('archer','e',92,'ranged',true);
          battle.heroes.p.hand=[{id:'seal_silence',wait:0},{id:'rune_trap',wait:0},{id:'transposition',wait:0}];battle.heroes.p.cardsPlayed=0;render();
        }''',lanes)
        await page.locator('.hand [data-action="select-card"]').first.click()
        await page.locator('[data-action="deploy"][data-lane="0"]').click()
        assert await page.locator('.silence-badge').count()==1
        await page.locator('.hand [data-action="select-card"]').first.click()
        await page.locator('[data-action="deploy"][data-lane="0"]').click()
        assert await page.locator('.terrain-trap').count()==1
        await page.screenshot(path=f'/tmp/ca-arena-{label}-{lanes}.png',full_page=True)
        # Les dix cases restent accessibles par défilement sans élargir la page.
        await page.evaluate("document.querySelector('.battle-grid').scrollLeft=9999")
        last=await page.locator('.lane-row').first.locator('[data-col="10"]').bounding_box()
        grid=await page.locator('.battle-grid').bounding_box()
        assert last['x']+last['width']<=grid['x']+grid['width']+2
        pos=await page.evaluate("document.querySelector('.battle-grid').scrollLeft")
        await page.locator('[data-action="toggle-animations"]').click()
        assert await page.evaluate("document.querySelector('.battle-grid').scrollLeft")==pos
        assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
        # Reprise exacte des trois formats, effets compris.
        saved=await page.evaluate('()=>{persistBattle();return __saves}')
        await page.close()
        page=await make_page(browser,viewport,saved,errors)
        assert await page.locator('.battle-cell').count()==lanes*10
        assert await page.locator('.terrain-trap').count()==1
        await page.emulate_media(reduced_motion='reduce')
        await page.locator('[data-action="end-turn"]').click()
        assert await page.locator('.turn-n').inner_text()=='2'
        assert await page.locator('.battle-vfx-overlay').count()==0
    # Ancienne sauvegarde : pas de conversion destructrice du plateau.
    await page.evaluate('''()=>{
      battle=createBattle(profile,{id:'01',name:'Ancien combat',enemy:'Sentinelle',hp:80,difficulty:1,deck:[]},29,{legacy:true});
      persistBattle();render();
    }''')
    saved=await page.evaluate('__saves')
    await page.close()
    page=await make_page(browser,viewport,saved,errors)
    assert await page.locator('.lane-row').count()==3
    assert await page.locator('.battle-cell').count()==15
    assert await page.locator('.arena-dormant-row,.arena-structured').count()==0
    await page.locator('[data-action="end-turn"]').click()
    assert await page.locator('.turn-n').inner_text()=='2'
    assert not errors,errors
    # Projectile vers la vraie couronne en colonne 11, et non l'ancienne colonne 6.
    await page.emulate_media(reduced_motion='no-preference')
    await page.evaluate('''()=>{
      localStorage.setItem('couronnes_arcanes_animations_v13','on');
      battle=createBattle(profile,{id:'01',name:'Test couronne',enemy:'Sentinelle',hp:80,difficulty:1,deck:[]},211);
      battle.heroes.e.hand=[];battle.board[0][10]={uid:88,id:'archer',side:'p',atk:2,hp:12,maxhp:12,armor:0,ranged:true,ability:'ranged',stun:0,poison:0,poisonTurns:0};render();
    }''')
    if await page.locator('[data-action="toggle-animations"]').get_attribute('aria-pressed')!='true':
        await page.locator('[data-action="toggle-animations"]').click()
    await page.evaluate("document.querySelector('.battle-grid').scrollLeft=9999")
    await page.locator('[data-action="end-turn"]').click()
    impact=page.locator('.combat-fx.vfx-impact').first
    await impact.wait_for(state='attached',timeout=2000)
    gate=await page.locator('.lane-row').first.locator('.lane-gate.enemy').bounding_box()
    x=await impact.evaluate('el=>parseFloat(el.style.left)')
    assert abs(x-(gate['x']+gate['width']/2))<2,(x,gate)
    await page.wait_for_timeout(2000)
    assert not errors,errors
    await page.close()
    print(f'Arène {label}: 2/3/4×10, clavier, contrôle, défilement, reprise et 3×5 historique PASS')

async def production(browser,label,viewport):
    context=await browser.new_context(viewport=viewport,is_mobile=label!='desktop',has_touch=label!='desktop')
    page=await context.new_page()
    requests=[];errors=[]
    page.on('request',lambda req:requests.append(req.url))
    page.on('pageerror',lambda err:errors.append(str(err)))
    await page.goto((ROOT/'JOUER.html').as_uri())
    await page.locator('[data-action="welcome-start"]').click()
    assert await page.locator('.battle-cell').count()==20
    await page.locator('.hand .unit-card:not(.on-cooldown)').first.click()
    await page.locator('[data-action="deploy"][data-lane="1"]').click()
    await page.emulate_media(reduced_motion='reduce')
    await page.locator('[data-action="end-turn"]').click()
    await page.reload()
    assert await page.locator('.turn-n').inner_text()=='2'
    assert await page.locator('.battle-cell').count()==20
    saved=await page.evaluate("JSON.parse(localStorage.getItem('couronnes_arcanes_bataille_v1'))")
    assert len(saved['board'])==2 and len(saved['board'][0])==12
    assert not saved.get('vfx')
    assert not any(url.startswith(('http:','https:')) for url in requests),requests
    assert not errors,errors
    await context.close()
    print(f'Export {label}: hors ligne, vraies cases, stockage réel et rechargement PASS')

async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True,args=['--no-sandbox'])
        for label,viewport in [('desktop',{'width':1366,'height':900}),('mobile',{'width':390,'height':844}),('landscape',{'width':844,'height':390})]:
            await run(browser,label,viewport)
            await production(browser,label,viewport)
        # Entrée web modulaire : mêmes imports et comportement depuis index.html.
        handler=functools.partial(SimpleHTTPRequestHandler,directory=str(ROOT))
        server=ThreadingHTTPServer(('127.0.0.1',0),handler)
        threading.Thread(target=server.serve_forever,daemon=True).start()
        try:
            page=await browser.new_page(viewport={'width':1366,'height':900})
            errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
            await page.goto(f'http://127.0.0.1:{server.server_port}/index.html')
            await page.locator('[data-action="welcome-start"]').click()
            assert await page.locator('.battle-cell').count()==20
            await page.locator('.hand .unit-card:not(.on-cooldown)').first.click()
            await page.locator('[data-action="deploy"][data-lane="0"]').click()
            await page.emulate_media(reduced_motion='reduce')
            await page.locator('[data-action="end-turn"]').click()
            await page.reload()
            assert await page.locator('.turn-n').inner_text()=='2'
            assert not errors,errors
            await page.close()
            print('Sources modulaires HTTP : imports, déploiement, tour et reprise PASS')
        finally:
            server.shutdown();server.server_close()
        await browser.close()
if __name__=='__main__':asyncio.run(main())
