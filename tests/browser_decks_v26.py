"""V2.6 real-browser deck presets, confirmations, persistence and ongoing combat."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]

async def make_page(browser,viewport,stored,errors):
    page=await browser.new_page(viewport=viewport)
    page.on('pageerror',lambda exc:errors.append(str(exc)))
    await page.evaluate('''seed=>{const cache={...seed};window.__saves=cache;
      Object.defineProperty(window,'localStorage',{configurable:true,value:{
        getItem(k){return cache[k]??null},setItem(k,v){cache[k]=String(v)},removeItem(k){delete cache[k]}}});}''',stored)
    await page.set_content((ROOT/'JOUER.html').read_text(),wait_until='load')
    return page

async def run(browser,label,viewport):
    errors=[]
    page=await make_page(browser,viewport,{},errors)
    await page.locator('[data-action="welcome-guide"]').click()
    await page.locator('[data-action="nav"][data-page="collection"]').click()
    assert await page.locator('.deck-preset-card').count()==4
    original=await page.evaluate('JSON.parse(window.__saves.couronnes_arcanes_v1).deck')
    await page.locator('[data-action="deck-preview"][data-id="assaut"]').click()
    assert 'Assaut rapide' in await page.locator('.modal h2').inner_text()
    assert await page.locator('.deck-preview-list>div').count()>0
    assert await page.evaluate('JSON.parse(window.__saves.couronnes_arcanes_v1).deck')==original,'Preview modified deck'
    await page.locator('[data-action="close-modal"]').click()
    assert await page.locator('.modal').count()==0
    if label=='desktop':
        await page.screenshot(path=str(ROOT/'apercu_decks_V2.6.png'),full_page=True)
    await page.locator('[data-action="deck-preview"][data-id="assaut"]').click()
    await page.locator('[data-action="deck-apply"][data-id="assaut"]').click()
    assert (await page.locator('.deck-aside .stat-box strong').first.inner_text()).strip()=='16'
    state=await page.evaluate('JSON.parse(window.__saves.couronnes_arcanes_v1)')
    assert len(state['deck'])==16
    assert state['gold']==110 and state['shards']==50
    assert state['collection']['militia']==4
    snapshot=await page.evaluate('window.__saves')
    await page.close()
    page=await make_page(browser,viewport,snapshot,errors)
    await page.locator('[data-action="nav"][data-page="collection"]').click()
    assert (await page.locator('.deck-aside .stat-box strong').first.inner_text()).strip()=='16'
    await page.locator('#nav [data-action="nav"][data-page="campaign"]').click()
    await page.locator('[data-action="start-mission"][data-id="01"]').click()
    assert await page.locator('.battle-grid .lane-row').count()==3
    await page.locator('[data-action="nav"][data-page="collection"]').click()
    assert await page.locator('[data-action="deck-preview"][data-id="assaut"]').is_disabled()
    assert errors==[],errors
    print(f'V2.6 {label}: preview/cancel/apply/persist/battle/restriction PASS')
    await page.close()

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        for label,viewport in [('desktop',{'width':1366,'height':900}),('mobile',{'width':390,'height':844})]:
            await run(browser,label,viewport)
        await browser.close()
asyncio.run(main())
