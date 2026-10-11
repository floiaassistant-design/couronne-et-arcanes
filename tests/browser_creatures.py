"""V1.4: portrait assets, battle units, idle-role animations and offline mode."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
ROOT = Path(__file__).resolve().parents[1]
async def run():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  page=await browser.new_page(viewport={'width':1440,'height':1000})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  await page.set_content((ROOT/'tests/JOUER.test.html').read_text(),wait_until='load')
  await page.locator('[data-action="welcome-start"]').click()
  assert await page.locator('.creature-image').count()>0,'No playable card art found'
  assert await page.locator('.creature-image').first.evaluate('(im)=>im.complete && im.naturalWidth>0'),'Image is broken in standalone HTML'
  await page.evaluate('''() => {
    const mk=(uid,id,side,atk,hp)=>({uid,id,side,atk,hp,maxhp:hp,armor:0,ranged:false,ability:'',stun:0,poison:0,poisonTurns:0});
    battle.board[0][1]=mk(501,'archer','p',2,5);
    battle.board[0][3]=mk(502,'golem','e',2,9);
    battle.board[1][2]=mk(503,'dragon','p',6,12);
    battle.board[1][4]=mk(504,'shade','e',2,3);
    battle.board[2][1]=mk(505,'treant','p',3,10);
    battle.board[2][4]=mk(506,'griffin','e',4,6);
    render();
    document.querySelector('.battle-grid').scrollIntoView({block:'center'});
  }''')
  await page.wait_for_timeout(250)
  assert await page.locator('.sprite-figure').count()==6
  images=await page.locator('.sprite-figure').evaluate_all('(all)=>all.map(im=>[im.complete,im.naturalWidth,im.currentSrc.startsWith("data:image/webp;base64,")])')
  assert all(complete and width>0 and inline for complete,width,inline in images),images
  roles=await page.locator('.sprite-stage').evaluate_all('(all)=>all.map(x=>x.className)')
  assert any('role-flying' in role for role in roles)
  assert any('role-heavy' in role for role in roles)
  assert any('role-ranged' in role for role in roles)
  await page.evaluate('() => document.getElementById("toast")?.classList.remove("show")')
  await page.screenshot(path=str(ROOT/'apercu_bestiaire_V1.4.png'))
  await page.locator('[data-action="toggle-animations"]').click()
  assert await page.locator('body').evaluate('(el)=>el.classList.contains("animations-off")')
  save=await page.evaluate('() => JSON.parse(JSON.stringify(battle))')
  assert 'vfx' not in save
  assert not errors,errors
  mobile=await browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce')
  errs=[];mobile.on('pageerror',lambda e:errs.append(str(e)))
  await mobile.set_content((ROOT/'tests/JOUER.test.html').read_text(),wait_until='load')
  await mobile.locator('[data-action="welcome-start"]').click()
  assert await mobile.locator('.creature-image').first.evaluate('(im)=>im.complete&&im.naturalWidth>0')
  assert not errs,errs
  print('V1.4 browser PASS: offline artwork, 6 creature sprites, 4 animations, toggle, mobile, save')
  await browser.close()
asyncio.run(run())
