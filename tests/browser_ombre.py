"""Onze cartes Ombre, mêmes parcours que l’Aube, sans modifier les possessions."""
import asyncio
from playwright.async_api import async_playwright
from browser_aube import run

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,args=['--no-sandbox'])
        for label,vp in [('desktop',{'width':1440,'height':1000}),('portrait',{'width':390,'height':844}),('landscape',{'width':844,'height':390})]:
            await run(browser,label,vp,'ombre')
        await browser.close()

if __name__=='__main__':asyncio.run(main())
