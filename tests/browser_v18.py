import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for label,viewport in [('desktop',{'width':1440,'height':900}),('mobile',{'width':390,'height':844})]:
   p=await browser.new_page(viewport=viewport)
   errors=[]
   p.on('pageerror',lambda e: errors.append(str(e)))
   await p.set_content((ROOT/'tests/JOUER.test.html').read_text(),wait_until='load')
   await p.locator('[data-action="welcome-guide"]').click()
   await p.locator('[data-action="nav"][data-page="campaign"]').click()
   assert await p.locator('.enemy-style-tag').count()==12, f'{label}: expected 12 campaign strategy tags'
   await p.evaluate('''() => {profile.unlocked=12; profile.guideSeen=true; save(); render()}''')
   await p.locator('[data-action="start-mission"][data-id="03"]').click()
   assert await p.locator('.ai-personality').count()==1
   assert 'Bastion' in await p.locator('.ai-personality').inner_text()
   assert 'Boss' in await p.locator('.enemy-style-tag').first.inner_text()
   await p.evaluate('''() => {battle.heroes.e.hp=Math.floor(battle.heroes.e.maxhp/2); render()}''')
   assert 'FURIE' in await p.locator('.enemy-style-tag').first.inner_text()
   await p.locator('[data-action="end-turn"]').click()
   assert await p.locator('.turn-n').inner_text()=='2'
   assert await p.locator('.log-list').get_by_text('phase de furie',exact=False).count()==1
   if errors: raise RuntimeError(label+': '+repr(errors))
   print(f'V1.8 {label} boss HUD, fury phase, turn: PASS')
   await p.close()
  await browser.close()
asyncio.run(main())
