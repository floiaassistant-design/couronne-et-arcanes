"""V1.3: prove arrows and magic are actually visible and can be toggled."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
ROOT = Path(__file__).resolve().parents[1]
async def run():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  page=await browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
  errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
  await page.set_content((ROOT/'tests/JOUER.test.html').read_text(),wait_until='load')
  await page.locator('[data-action="welcome-start"]').click()
  assert await page.locator('.vfx-toggle').get_attribute('aria-pressed')=='true'
  await page.evaluate('''() => {
    const mk=(uid,id,side,atk,hp,ranged=false)=>({uid,id,side,atk,hp,maxhp:hp,armor:0,ranged,ability:ranged?'ranged':'',stun:0,poison:0,poisonTurns:0});
    battle.heroes.e.hand=[];battle.heroes.e.deck=[];battle.heroes.e.discard=[];
    battle.board[0][1]=mk(881,'archer','p',2,5,true);
    battle.board[0][3]=mk(882,'bone','e',2,8);
    render();
  }''')
  await page.evaluate('''() => {const grid=document.querySelector('.battle-grid');window.scrollTo(0,grid.getBoundingClientRect().top+window.scrollY-180);document.querySelector('[data-action=\"end-turn\"]').click();}''')
  await page.wait_for_selector('.vfx-projectile.arrow',state='attached',timeout=3500)
  await page.screenshot(path=str(ROOT/'apercu_animations_v13.png'))
  await page.wait_for_timeout(4700)
  assert await page.locator('.battle-vfx-overlay').count()==0
  # Magic from real spell. Close combat remains active after one round.
  await page.evaluate('''() => { battle.heroes.p.hand=[{id:'firebolt',wait:0}];battle.heroes.p.cardsPlayed=0;render(); }''')
  await page.locator('.hand .unit-card').first.click()
  await page.locator('.lane-row').first.locator('[data-action="deploy"]').click()
  await page.wait_for_selector('.vfx-projectile.arcane',state='attached',timeout=2000)
  await page.wait_for_timeout(1350)
  await page.locator('[data-action="toggle-animations"]').click()
  assert await page.locator('.vfx-toggle').get_attribute('aria-pressed')=='false'
  await page.locator('[data-action="end-turn"]').click()
  await page.wait_for_timeout(160)
  assert await page.locator('.battle-vfx-overlay').count()==0
  # Visual effects remain transient, never included in the state model.
  save=await page.evaluate('''() => JSON.parse(JSON.stringify(battle))''')
  assert 'vfx' not in save
  assert not errors, errors
  print('DESKTOP VFX arrow+spell+toggle+legacy-save: PASS')
  reduced=await browser.new_page(viewport={'width':390,'height':844},reduced_motion='reduce',is_mobile=True,has_touch=True)
  errors2=[]; reduced.on('pageerror',lambda e:errors2.append(str(e)))
  await reduced.set_content((ROOT/'tests/JOUER.test.html').read_text(),wait_until='load')
  await reduced.evaluate('''() => {hideModal();startMission('01'); document.querySelector('[data-action=\"end-turn\"]').click();}''')
  assert await reduced.locator('.battle-vfx-overlay').count()==0
  assert not errors2, errors2
  print('MOBILE reduced motion: PASS')
  await browser.close()
asyncio.run(run())
