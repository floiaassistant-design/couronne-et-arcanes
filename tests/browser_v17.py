"""Navigateur réel : une mission fait jouer l'IA, et sa décision devient visible."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
async def run():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for width,height in [(1360,880),(390,844)]:
   page=await browser.new_page(viewport={'width':width,'height':height})
   errors=[]
   page.on('pageerror',lambda ex:errors.append(str(ex)))
   await page.set_content((ROOT/'tests/JOUER.test.html').read_text(),wait_until='load')
   await page.locator('[data-action="welcome-start"]').click()
   await page.locator('[data-action="toggle-animations"]').click()
   await page.locator('[data-action="end-turn"]').click()
   await page.wait_for_timeout(150)
   # The first turn might have only delayed cards; continue several turns.
   for _ in range(5):
    if await page.locator('.ai-plan').count():break
    if not await page.locator('[data-action="end-turn"]:not([disabled])').count():break
    await page.locator('[data-action="end-turn"]').click()
    await page.wait_for_timeout(150)
   assert await page.locator('.ai-plan').count()==1,'Last decision should be exposed in the battle interface'
   assert await page.locator('.ai-plan').inner_text(), 'Missing decision description'
   if width==1360: await page.screenshot(path=str(ROOT/'apercu_IA_V1.7.png'),full_page=True)
   assert not errors, f'JS page errors: {errors}'
   print(f'Chromium {width}x{height}: IA plan displayed and no JS errors')
   await page.close()
  await browser.close()
asyncio.run(run())
