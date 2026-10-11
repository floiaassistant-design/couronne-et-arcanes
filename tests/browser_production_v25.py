"""Test the real distributed HTML, never the browser diagnostic artifact."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
  for width,height in [(1366,768),(390,844)]:
   page=await browser.new_page(viewport={'width':width,'height':height})
   errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   await page.set_content((ROOT/'JOUER.html').read_text(),wait_until='load')
   assert await page.get_by_text('Couronnes & Arcanes',exact=False).count()>0
   assert await page.evaluate("typeof window.battle === 'undefined' && typeof window.profile === 'undefined' && typeof window.render === 'undefined'"), 'Private gameplay state leaked to player'
   assert await page.locator('img.creature-image').count()==0
   await page.locator('[data-action="welcome-start"]').click()
   assert await page.locator('.battle-grid .lane-row').count()==3
   assert await page.locator('img.creature-image').first.evaluate('(img)=>img.complete && img.naturalWidth>0'),'Offline art unavailable'
   await page.locator('[data-action="end-turn"]').click()
   assert await page.locator('.turn-n').inner_text()=='2'
   assert not errors,errors
   print(f'PRODUCTION {width}x{height}: gameplay/images/private state PASS; JS errors {errors}')
   await page.close()
  await browser.close()
asyncio.run(main())
