"""Aperçu au survol/focus uniquement ; clic sélectionne, premier toucher consulte sans sélectionner."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
from browser_card_presentation import run as universal_run
ROOT=Path(__file__).resolve().parents[1]
async def contained(page,panel):
    b=await panel.bounding_box();vp=page.viewport_size
    assert b['x']>=11 and b['y']>=11 and b['x']+b['width']<=vp['width']-11 and b['y']+b['height']<=vp['height']-11,b
    assert await panel.locator('.inspection-art,.generated-card-image').first.evaluate('(e)=>e.complete&&e.naturalWidth>0')
async def run(browser,label,viewport):
    ctx=await browser.new_context(viewport=viewport,has_touch=True,offline=True)
    page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    await page.goto((ROOT/'tests/JOUER.test.html').as_uri())
    await page.locator('[data-action="welcome-start"]').click()
    await page.evaluate('''()=>{
      battle=createBattle(profile,{id:'01',name:'Aperçu au survol',enemy:'Gardien',hp:90,difficulty:1,boss:true,deck:[]},211);
      battle.heroes.p.hand=[{id:'militia',wait:0}];playPlayerCard(battle,0,0);endPlayerTurn(battle);
      battle.heroes.p.hand=[{id:'shield',wait:0}];playPlayerCard(battle,0,0);
      const u=battle.board[0][2];Object.assign(u,{hp:2,barrier:2,rallyUntil:battle.round});
      battle.board[3][10]={...u,id:'archer',uid:999,side:'e',atk:5,hp:2,maxhp:6,rallyUntil:0};
      battle.heroes.p.hand=[{id:'cleric',wait:3},{id:'militia',wait:0}];persistBattle();render();
    }''')
    panel=page.locator('#hand-card-inspection');unit=page.locator('.board-card[data-card-id="militia"]')
    model=await page.evaluate('JSON.stringify({battle,selectedCard})')
    dock=await page.locator('.combat-hand-dock').bounding_box()
    await unit.hover();await page.wait_for_selector('.card-preview[data-preview-kind="board"]')
    text=await panel.inner_text()
    for value in ['ATQ 4 / PV 2/5','Concorde +1 ATQ','Ralliement +1 ATQ','Barrière 2']:assert value in text,text
    await contained(page,panel);assert await page.locator('.combat-hand-dock').bounding_box()==dock
    await panel.locator('.inspection-description').hover();await page.wait_for_timeout(220);assert await panel.is_visible()
    await page.screenshot(path=f'/tmp/ca-card-preview-{label}-board.png',full_page=False)
    await page.mouse.move(1,1);await page.wait_for_timeout(220);assert await panel.is_hidden()
    # Focus de lecture ; Entrée est un clic, qui ne doit jamais épingler la fiche.
    await page.keyboard.press('Tab');await unit.focus();assert await panel.is_visible()
    await page.keyboard.press('Enter');assert await panel.is_hidden()
    assert await page.evaluate('JSON.stringify({battle,selectedCard})')==model
    waiting=page.locator('.hand-card[data-index="0"]')
    await waiting.hover();assert 'Attente 3 tours' in await panel.inner_text()
    assert 'À l’invocation' in await panel.inner_text();await contained(page,panel)
    await page.screenshot(path=f'/tmp/ca-card-preview-{label}-hand.png',full_page=False)
    await waiting.tap();assert await panel.is_visible();assert await page.evaluate('selectedCard')==-1
    await panel.locator('[data-action="close-inspection"]').click();assert await panel.is_hidden()
    ready=page.locator('.hand-card[data-index="1"]')
    await ready.click();assert await page.evaluate('selectedCard')==1
    assert await panel.is_hidden()
    # Attendre plus que le délai de disparition : aucun retour automatique après sélection.
    await page.wait_for_timeout(220);assert await panel.is_hidden()
    await page.locator('[data-action="deploy"][data-lane="1"][data-col="3"]').tap()
    assert await page.evaluate('battle.board[1][3]?.id')=='militia'
    assert await page.evaluate('battle.heroes.p.cardsPlayed')==2
    await page.mouse.move(1,1);await page.wait_for_timeout(220)
    await page.wait_for_function("!document.querySelector('.combat-playing')")
    enemy=page.locator('.board-card[data-unit-id="999"]')
    await enemy.hover();assert 'Unité adverse' in await panel.inner_text()
    assert 'ATQ 5 / PV 2/6' in await panel.inner_text();await contained(page,panel)
    await page.screenshot(path=f'/tmp/ca-card-preview-{label}-enemy.png',full_page=False)
    before=await page.evaluate('JSON.stringify({battle,selectedCard})')
    await enemy.tap();assert await panel.is_visible()
    await panel.locator('[data-action="close-inspection"]').click();assert await panel.is_hidden()
    assert await page.evaluate('JSON.stringify({battle,selectedCard})')==before
    await page.locator('[data-action="end-turn"]').click();assert await panel.is_hidden()
    await page.reload();assert await panel.is_hidden();assert not errors,errors
    await ctx.close();print(f'Aperçus {label}: survol/focus, cadre commun, clic/toucher sans épinglage, sélection et pose en case 3 PASS')
async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True,args=['--no-sandbox'])
        for label,vp in [('desktop',{'width':1366,'height':900}),('mobile',{'width':390,'height':844}),('landscape',{'width':844,'height':390})]:
            await run(browser,label,vp)
            await universal_run(browser,label,vp)
        await browser.close()
if __name__=='__main__':asyncio.run(main())
