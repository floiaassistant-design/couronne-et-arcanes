"""Pilote illustré sur des événements réels, puis reprise/offline et assets indisponibles."""
import asyncio
import functools
import json
import threading
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from playwright.async_api import async_playwright
from browser_class_skills_v28 import make_page,ROOT

async def wait_done(page):
    await page.wait_for_function("!document.querySelector('.unit-animation-overlay')",timeout=12000)

async def run(browser,label,viewport):
    errors=[];page=await make_page(browser,viewport,{},errors,touch=label!='desktop')
    await page.locator('[data-action="welcome-start"]').click()
    await page.evaluate('''()=>{
      battle=createBattle(profile,{id:'01',name:'Pilote animé',enemy:'Sentinelle',hp:80,difficulty:1,deck:[]},219);
      battle.heroes.p.hand=[{id:'archer',wait:0}];render();
    }''')
    await page.locator('.hand .hand-card').click(position={'x':10,'y':20})
    await page.locator('[data-action="close-inspection"]').click()
    await page.locator('[data-action="deploy"][data-lane="0"]').click()
    await page.mouse.move(0,0)
    await wait_done(page)
    unit=page.locator('.unit-on-board[data-card-id="archer"]')
    assert await unit.count()==1
    assert await unit.locator('.unit-static').evaluate('(el)=>[el.naturalWidth,el.naturalHeight]')==[512,512]
    await page.wait_for_function("document.querySelector('.unit-on-board .illustrated-unit').classList.contains('atlas-ready')")
    await page.wait_for_function("Number(document.querySelector('.unit-on-board .illustrated-unit').dataset.frame)>0")
    assert await unit.locator('.sprite-figure').evaluate("el=>getComputedStyle(el).imageRendering")=='auto'
    assert await page.locator('.arena-painted-frame').get_attribute('data-render-mode')=='hybrid'

    # Le tour est résolu et sauvegardé avant la fin du déplacement cosmétique.
    await page.locator('[data-action="end-turn"]').click()
    await page.wait_for_function("document.querySelector('.unit-animation-actor[data-animation-state=move]')")
    assert await page.evaluate('battle.board[0][2].id')=='archer'
    saved_model=await page.evaluate('JSON.stringify(battle)')
    await page.screenshot(path=f'/tmp/ca-unit-walk-{label}.png',full_page=True)
    await wait_done(page)
    assert await page.evaluate('JSON.stringify(battle)')==saved_model

    # Un ennemi public adjacent permet un vrai tir et un vrai impact.
    await page.evaluate('''()=>{
      const u=battle.board[0][2];battle.board[0][2]=null;battle.board[0][4]=u;
      battle.heroes.e.hand=[];battle.heroes.e.deck=[];
      battle.board[0][5]={...u,uid:99,id:'militia',side:'e',hp:10,maxhp:10,atk:1,ranged:false,ability:'',armor:0};
      persistBattle();render();
    }''')
    await unit.scroll_into_view_if_needed()
    await page.locator('[data-action="end-turn"]').click()
    await page.wait_for_function("document.querySelector('.unit-animation-actor [data-clip=tir][data-frame=3]')")
    bolt=page.locator('.unit-crossbow-bolt').first
    assert await bolt.count()==1
    ghost=page.locator('.unit-animation-actor[data-owner=p]')
    rect=await ghost.bounding_box()
    # Le point de sortie est celui de l'arme (469,141), pas le centre de la case.
    origin=await bolt.evaluate('(el)=>[Number(el.dataset.sourceX),Number(el.dataset.sourceY)]')
    assert abs(origin[0]-(rect['x']+469/512*rect['width']))<2,(origin,rect)
    assert abs(origin[1]-(rect['y']+141/512*rect['height']))<2,(origin,rect)
    model=await page.evaluate('JSON.stringify(battle)')
    await page.screenshot(path=f'/tmp/ca-unit-shot-{label}.png',full_page=True)
    await page.wait_for_function("document.querySelector('.unit-animation-actor[data-animation-state=hit]')")
    await wait_done(page)
    assert await page.evaluate('JSON.stringify(battle)')==model

    # Mort : l'acteur garde ses images même après son retrait du vrai plateau.
    await page.evaluate('''()=>{
      battle.board[0][4].hp=1;battle.board[0][5].atk=9;
      persistBattle();render();
    }''')
    await page.locator('[data-action="end-turn"]').click()
    assert await page.evaluate('battle.board[0][4]') is None
    await page.wait_for_function("document.querySelector('.unit-animation-actor[data-animation-state=death]')")
    await page.screenshot(path=f'/tmp/ca-unit-death-{label}.png',full_page=True)
    await wait_done(page)
    assert await page.locator('[data-visual-replaying]').count()==0

    # Sauvegarde ancienne 3x5, orientation adverse et images fixes désactivées.
    await page.evaluate('''()=>{
      battle=createBattle(profile,{id:'01',name:'Reprise historique',enemy:'Sentinelle',hp:80,difficulty:1,deck:[]},220,{legacy:true});
      battle.heroes.p.hand=[{id:'archer',wait:0}];playPlayerCard(battle,0,0);
      const u=battle.board[0][1];battle.board[1][5]={...u,uid:98,side:'e'};
      persistBattle();render();
    }''')
    assert await page.locator('.arena-painted-frame').count()==0
    assert await page.locator('.unit-on-board.enemy .unit-facing').evaluate("el=>getComputedStyle(el).transform")== 'matrix(-1, 0, 0, 1, 0, 0)'
    await page.locator('[data-action="toggle-animations"]').click()
    assert await page.locator('.unit-on-board .illustrated-unit.atlas-ready').count()==0
    assert (await page.locator('.unit-on-board .unit-static').first.get_attribute('src')).startswith('data:image/webp;base64,')
    await page.locator('[data-action="end-turn"]').click()
    assert await page.locator('.unit-animation-overlay').count()==0
    saved=await page.evaluate('()=>({...window.__saves})')
    battle_save=json.loads(saved['couronnes_arcanes_bataille_v1'])
    assert 'vfx' not in battle_save and not any('animation' in k for k in battle_save)

    # Navigation et changement du réglage arrêtent immédiatement un mouvement.
    await page.locator('[data-action="toggle-animations"]').click()
    await page.locator('[data-action="end-turn"]').click()
    await page.locator('[data-action="nav"][data-page="home"]').click()
    assert await page.locator('.unit-animation-overlay').count()==0
    await page.locator('[data-action="nav"][data-page="battle"]').click()
    await page.emulate_media(reduced_motion='reduce')
    await page.wait_for_function("!document.querySelector('.unit-on-board .illustrated-unit.atlas-ready')")
    assert await page.locator('.unit-on-board .illustrated-unit.atlas-ready').count()==0
    assert await page.locator('.unit-animation-overlay').count()==0
    assert not errors,errors
    await page.close()
    print(f'Unités illustrées {label}: repos, marche, tir/arme, impact, mort, 3x5, orientation et interruptions PASS')
    return saved

async def production(browser,saved,base_url=None):
    saved=dict(saved)
    fixture=json.loads(saved['couronnes_arcanes_bataille_v1'])
    for row in fixture['board']:
        for unit in row:
            if unit:unit['hp']=12;unit['maxhp']=12
    saved['couronnes_arcanes_bataille_v1']=json.dumps(fixture)
    context=await browser.new_context(viewport={'width':844,'height':390},offline=base_url is None)
    await context.add_init_script('''(()=>{const saves=%s;for(const [k,v] of Object.entries(saves))if(localStorage.getItem(k)===null)localStorage.setItem(k,v);})()'''%json.dumps(saved))
    page=await context.new_page();errors=[];requests=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.on('request',lambda request:requests.append(request.url))
    if base_url:
        await page.route('**/assets/units/arbaletriere_aube/tir.webp',lambda route:route.abort())
    await page.goto(base_url+'/index.html' if base_url else (ROOT/'JOUER.html').as_uri())
    await page.locator('[data-action="toggle-animations"]').click()
    await page.wait_for_function("document.querySelector('.unit-on-board .illustrated-unit').classList.contains('atlas-ready')")
    if base_url:
        await page.locator('[data-action="end-turn"]').click()
        await page.wait_for_function("document.querySelector('.unit-animation-actor [data-clip=tir][data-frame=3]')")
        assert await page.locator('.unit-animation-actor .illustrated-unit.atlas-ready').count()==0
        assert await page.locator('.unit-animation-actor .unit-static').first.evaluate('(el)=>el.naturalWidth')==512
        await wait_done(page)
    turn=await page.locator('.turn-n').inner_text()
    await page.reload()
    assert await page.locator('.turn-n').inner_text()==turn
    assert await page.locator('.unit-animation-overlay').count()==0
    assert await page.locator('[data-visual-replaying]').count()==0
    await page.emulate_media(reduced_motion='reduce')
    await page.wait_for_function("!document.querySelector('.unit-on-board .illustrated-unit.atlas-ready')")
    assert await page.locator('.unit-on-board .illustrated-unit.atlas-ready').count()==0
    image=page.locator('.unit-on-board .unit-static').first
    await image.evaluate('(el)=>el.decode()')
    assert await image.evaluate('(el)=>el.naturalWidth')==512
    if not base_url:assert not any(u.startswith(('http:','https:')) for u in requests),requests
    assert not errors,errors
    await context.close()
    print('Unités illustrées '+('sources HTTP et atlas indisponible' if base_url else 'production hors réseau/reprise/mouvement réduit')+' PASS')

async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True,args=['--no-sandbox'])
        for label,vp in [('desktop',{'width':1366,'height':900}),('mobile',{'width':390,'height':844}),('landscape',{'width':844,'height':390})]:
            saved=await run(browser,label,vp)
        await production(browser,saved)
        handler=functools.partial(SimpleHTTPRequestHandler,directory=str(ROOT))
        server=ThreadingHTTPServer(('127.0.0.1',0),handler)
        threading.Thread(target=server.serve_forever,daemon=True).start()
        try:await production(browser,saved,f'http://127.0.0.1:{server.server_port}')
        finally:server.shutdown();server.server_close()
        await browser.close()

if __name__=='__main__':asyncio.run(main())
