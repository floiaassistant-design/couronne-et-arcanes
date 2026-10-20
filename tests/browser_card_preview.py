"""Cadre commun : survol, fiche persistante, clavier/toucher, aucun coup involontaire."""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]

async def contained(page,panel):
    box=await panel.bounding_box();vp=page.viewport_size
    assert box['x']>=11 and box['y']>=11,box
    assert box['x']+box['width']<=vp['width']-11,box
    assert box['y']+box['height']<=vp['height']-11,box
    assert await panel.locator('.inspection-art').evaluate('(e)=>e.complete&&e.naturalWidth>0')

async def run(browser,label,viewport):
    context=await browser.new_context(viewport=viewport,has_touch=True,offline=True)
    page=await context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    await page.goto((ROOT/'tests/ESSAI_CARTES.test.html').as_uri())
    await page.locator('[data-action="welcome-start"]').click()
    await page.evaluate('''()=>{
      battle=createBattle(profile,{id:'01',name:'Revue des aperçus',enemy:'Gardien',hp:90,difficulty:1,boss:true,deck:[]},211);
      battle.heroes.p.hand=[{id:'militia',wait:0}];playPlayerCard(battle,0,0);endPlayerTurn(battle);
      battle.heroes.p.hand=[{id:'shield',wait:0}];playPlayerCard(battle,0,0);
      const u=battle.board[0][2];Object.assign(u,{hp:2,barrier:2,rallyUntil:battle.round});
      battle.board[3][10]={...u,id:'archer',uid:999,side:'e',atk:5,hp:2,maxhp:6,rallyUntil:0};
      battle.heroes.p.hand=[{id:'cleric',wait:3},{id:'firebolt',wait:0}];persistBattle();render();
    }''')
    panel=page.locator('#hand-card-inspection');unit=page.locator('.board-card[data-card-id="militia"]')
    model=await page.evaluate('JSON.stringify({battle,selectedCard})')
    dock_before=await page.locator('.combat-hand-dock').bounding_box()
    await unit.hover();await page.wait_for_selector('.card-preview[data-preview-kind="board"]')
    assert 'En combat' in await panel.inner_text()
    assert 'ATQ 4 / PV 2/5' in await panel.inner_text()
    assert 'Concorde +1 ATQ' in await panel.inner_text()
    assert 'Ralliement +1 ATQ' in await panel.inner_text()
    assert 'Barrière 2' in await panel.inner_text()
    await contained(page,panel)
    assert await page.locator('.combat-hand-dock').bounding_box()==dock_before
    # La fiche reste lisible quand la souris passe du portrait à son contenu.
    await panel.locator('.inspection-description').hover();await page.wait_for_timeout(220)
    assert await panel.is_visible()
    await page.screenshot(path=f'/tmp/ca-card-preview-{label}-board.png',full_page=False)
    await page.mouse.move(1,1);await page.wait_for_timeout(220);assert await panel.is_hidden()
    # Clavier : consulter ne lance pas le data-action deploy de la case parente.
    await unit.focus();await page.keyboard.press('Enter')
    assert await panel.is_visible()
    assert await page.evaluate('JSON.stringify({battle,selectedCard})')==model
    await page.keyboard.press('Escape');assert await panel.is_hidden()
    # Même cadre pour une carte en attente et un sort ; lire n'autorise pas la pose.
    waiting=page.locator('.hand-card[data-index="0"]')
    await waiting.tap();assert await panel.locator('.card-preview[data-preview-kind="hand"]').count()==1
    assert 'Attente 3 tours' in await panel.inner_text()
    assert 'À l’invocation' in await panel.inner_text()
    assert await page.evaluate('selectedCard')==-1
    await contained(page,panel)
    await page.screenshot(path=f'/tmp/ca-card-preview-{label}-hand.png',full_page=False)
    await panel.locator('[data-action="close-inspection"]').click();assert await panel.is_hidden()
    ready=page.locator('.hand-card[data-index="1"]')
    await ready.click();assert await page.evaluate('selectedCard')==1
    assert 'Lame de feu' in await panel.inner_text()
    assert await panel.locator('.inspection-stats').count()==0
    # Une carte sélectionnée n'empêche pas de lire une unité ; aucune attaque ni pose.
    chosen=await page.evaluate('JSON.stringify({battle,selectedCard})')
    await unit.hover();assert await panel.locator('[data-preview-kind="board"]').count()==1
    await unit.tap();assert await page.evaluate('JSON.stringify({battle,selectedCard})')==chosen
    await page.keyboard.press('Escape');assert await page.evaluate('selectedCard')==1
    # Unité adverse à l'autre extrémité : clamp du cadre et PV de l'instance réelle.
    enemy=page.locator('.board-card[data-unit-id="999"]')
    await enemy.hover()
    assert 'Unité adverse' in await panel.inner_text(),(label,await panel.inner_text(),await panel.is_hidden())
    assert 'ATQ 5 / PV 2/6' in await panel.inner_text()
    await contained(page,panel)
    await page.screenshot(path=f'/tmp/ca-card-preview-{label}-enemy.png',full_page=False)
    await page.keyboard.press('Escape')
    await page.locator('[data-action="end-turn"]').click();assert await panel.is_hidden()
    await page.reload();assert await panel.is_hidden()
    assert not errors,errors
    await context.close();print(f'Aperçus {label}: cadre commun, PV réels, bords, survol lisible, clavier/toucher, aucune mutation ni pose involontaire PASS')

async def production(browser):
    context=await browser.new_context(offline=True,viewport={'width':1366,'height':900})
    page=await context.new_page();errors=[];requests=[]
    page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:requests.append(r.url))
    await page.add_init_script('Date.now=()=>12345')
    await page.goto((ROOT/'ESSAI_CARTES.html').as_uri())
    await page.locator('[data-action="welcome-start"]').click()
    ready=page.locator('.hand-card.hand-ready:has(.stat.atk)').first
    await ready.click();await page.locator('[data-action="close-inspection"]').click()
    await page.locator('[data-action="deploy"][data-lane="0"]').click()
    unit=page.locator('.board-card').first
    await unit.evaluate("el=>Promise.all(el.closest('.unit-on-board').getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{})))")
    before=await page.evaluate('localStorage.getItem("couronnes_arcanes_bataille_v1")')
    await unit.hover();assert await page.locator('.card-preview[data-preview-kind="board"]').is_visible()
    await page.keyboard.press('Escape');await unit.click()
    assert await page.evaluate('localStorage.getItem("couronnes_arcanes_bataille_v1")')==before
    assert not await page.evaluate("'battle' in window||'profile' in window")
    assert not any(u.startswith(('https:','http:')) for u in requests),requests
    assert not errors,errors
    await context.close();print('Aperçus production : vraie unité posée, survol/clic sans action, hors ligne et sans API de diagnostic PASS')

async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True,args=['--no-sandbox'])
        for label,vp in [('desktop',{'width':1366,'height':900}),('mobile',{'width':390,'height':844}),('landscape',{'width':844,'height':390})]:await run(browser,label,vp)
        await production(browser);await browser.close()
if __name__=='__main__':asyncio.run(main())
