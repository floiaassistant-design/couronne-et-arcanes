"""Check reward text shown to players exactly matches real dungeon mission data."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]

async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for viewport in ({'width':1360,'height':900},{'width':390,'height':844}):
   page=await browser.new_page(viewport=viewport)
   errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   await page.set_content((ROOT/'tests/JOUER.test.html').read_text(encoding='utf-8'),wait_until='load')
   await page.evaluate('''() => {document.querySelector('.modal-backdrop')?.remove(); profile.dungeonRun={id:'ysara',stage:1,hp:12,maxhp:26,phase:'choice'};screen='dungeons';render();}''')
   card=page.locator('[data-action="dungeon-event"][data-id="challenge"]')
   assert '100 or' in await card.inner_text()
   assert '40 éclats' in await card.inner_text()
   await page.evaluate('''() => {profile.dungeonRun.stage=2;render();}''')
   card=page.locator('[data-action="dungeon-event"][data-id="challenge"]')
   assert '115 or' in await card.inner_text()
   assert '48 éclats' in await card.inner_text()
   assert not errors,errors
   print(f"V2.1 rewards UI {viewport['width']}x{viewport['height']}: PASS")
   await page.close()
  await browser.close()
asyncio.run(main())
