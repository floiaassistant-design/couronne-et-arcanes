import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
async def main():
 async with async_playwright() as pw:
  b=await pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  page=await b.new_page(viewport={'width':1400,'height':900},device_scale_factor=1)
  errors=[];page.on('pageerror',lambda e: errors.append(str(e)))
  await page.set_content((ROOT/'tests/JOUER.test.html').read_text(),wait_until='load')
  await page.locator('[data-action="welcome-guide"]').click()
  assert await page.get_by_text('Apprendre à jouer').count()==1
  await page.locator('[data-action="nav"][data-page="home"]').click()
  await page.wait_for_timeout(3000)
  await page.screenshot(path=str(ROOT/'apercu_citadelle.png'),full_page=True)
  await page.locator('[data-action="start-next"]').click()
  await page.locator('.hand .unit-card:not(.on-cooldown)').first.click()
  await page.locator('.lane-row').nth(1).locator('[data-action="deploy"][data-col="1"]').click()
  await page.screenshot(path=str(ROOT/'apercu_bataille.png'),full_page=True)
  await page.locator('[data-action="end-turn"]').click()
  assert await page.locator('.turn-n').inner_text()=='2'
  if await page.locator('.combat-intel > summary').count():
      await page.locator('.combat-intel > summary').click()
  await page.locator('[data-action="retreat"]').click()
  await page.locator('[data-action="confirm-retreat"]').click()
  await page.locator('[data-action="battle-deck"]').click()
  assert await page.locator('.card-grid .unit-card').count()==60
  await page.locator('[data-action="deck-add"][data-id="bone"]').first.click()
  assert await page.locator('.deck-list .deck-item').count()>0
  await page.locator('[data-action="nav"][data-page="alchemy"]').click()
  assert await page.locator('.alchemy-recipe').count()>10
  await page.locator('[data-action="extract-card"][data-id="thorn"]').click()
  assert 'Alchimie' in await page.locator('.page-title').inner_text()
  await page.locator('[data-action="nav"][data-page="forge"]').click()
  assert await page.locator('.forge-tile').count()>=14
  await page.locator('[data-action="craft-equipment"][data-id="lame"]').click()
  assert await page.get_by_text('Équipé',exact=False).count()>0
  await page.locator('[data-action="nav"][data-page="tower"]').click()
  assert await page.locator('.mission').count()==20
  await page.locator('[data-action="start-tower"][data-id="1"]').click()
  assert await page.locator('.turn-n').inner_text()=='1'
  active=await page.evaluate('''() => {
    const mk=(uid,id)=>({uid,id,side:'p',atk:2,hp:5,maxhp:5,armor:0,ranged:false,ability:'none',stun:0,poison:0,poisonTurns:0});
    battle.board[0][1]=mk(9870,'militia');battle.board[0][2]=mk(9871,'shield');render();
    return {bonus:formationBonus(battle,0,battle.board[0][1]),badges:document.querySelectorAll('.formation-badge').length};
  }''')
  assert active['bonus']==1 and active['badges']==2,active
  print('DESKTOP navigation/deck/battle/forge/Concorde: PASS', 'js_errors', errors)
  mobile=await b.new_page(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True)
  errors2=[];mobile.on('pageerror',lambda e: errors2.append(str(e)))
  await mobile.set_content((ROOT/'tests/JOUER.test.html').read_text(),wait_until='load')
  assert await mobile.locator('[data-action="welcome-start"]').count()==1
  await mobile.locator('[data-action="welcome-start"]').click()
  assert await mobile.locator('.battle-grid .lane-row').count()==3
  assert await mobile.locator('.hand .unit-card').count()==5
  print('MOBILE 390x844: PASS','js_errors',errors2)
  if errors or errors2: raise RuntimeError('Browser JS errors')
  await b.close()
asyncio.run(main())
