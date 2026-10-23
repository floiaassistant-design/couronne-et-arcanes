"""Laboratoire intégré : progression pilote et sauvegardes identiques après essai hors ligne."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[1]
PROFILE='couronnes_arcanes_v1'
BATTLE='couronnes_arcanes_bataille_v1'

async def scenario(browser,label,viewport):
    ctx=await browser.new_context(viewport=viewport,offline=True)
    page=await ctx.new_page()
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    await page.goto((ROOT/'JOUER.html').as_uri())
    welcome=page.locator('[data-action="welcome-guide"]')
    if await welcome.count():await welcome.click()
    before=await page.evaluate('([p,b])=>[localStorage.getItem(p),localStorage.getItem(b)]',[PROFILE,BATTLE])
    await page.locator('[data-action="nav"][data-page="developer"]').click()
    assert await page.locator('.developer-lab').count()==1
    await page.locator('[data-lab-field="cardId"]').select_option('dragon')
    await page.locator('[data-action="lab-add"]').click()
    assert 'Dragon des Sept Cieux' in await page.locator('.lab-deck-list').inner_text()
    await page.locator('[data-lab-field="cardId"]').select_option('militia')
    await page.locator('[data-lab-field="rarity"]').select_option('divine')
    await page.locator('[data-lab-field="level"]').select_option('2')
    assert '5 ATQ · 10 PV' in await page.locator('.lab-stats').inner_text()
    await page.locator('[data-action="lab-start"]').click()
    assert await page.locator('.combat-screen').count()==1
    assert 'TEST SANS RÉCOMPENSE' in await page.locator('.combat-titlebar').text_content()
    assert await page.locator('[data-action="end-turn"]').count()==1
    await page.locator('[data-action="end-turn"]').click()
    await page.locator('[data-action="lab-back"]').first.click()
    assert await page.locator('.developer-lab').count()==1
    await page.locator('[data-action="lab-exit"]').click()
    after=await page.evaluate('([p,b])=>[localStorage.getItem(p),localStorage.getItem(b)]',[PROFILE,BATTLE])
    assert before==after,(label,before,after)
    assert not errors,(label,errors)
    await ctx.close()

async def main():
    async with async_playwright() as playwright:
        browser=await playwright.chromium.launch()
        for label,viewport in [
            ('bureau',{'width':1440,'height':900}),
            ('mobile',{'width':390,'height':844})
        ]:
            await scenario(browser,label,viewport)
        await browser.close()

if __name__=='__main__':
    asyncio.run(main())