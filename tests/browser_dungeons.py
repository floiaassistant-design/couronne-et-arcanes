"""End-to-end V1.9 dungeon flow on the standalone HTML, using a storage polyfill for simulated page reopen."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]

async def make_page(browser,viewport,values,errors):
    p=await browser.new_page(viewport=viewport)
    p.on('pageerror',lambda error: errors.append(str(error)))
    await p.evaluate('''(seed) => {
       const store={...seed};window.__storage=store;
       Object.defineProperty(window,'localStorage',{configurable:true,value:{
         getItem(key){return store[key]??null},
         setItem(key,value){store[key]=String(value)},
         removeItem(key){delete store[key]}
       }});
    }''',values)
    await p.set_content((ROOT/'tests/JOUER.test.html').read_text(),wait_until='load')
    return p

async def reopen(browser,p,viewport,errors):
    snapshot=await p.evaluate('window.__storage')
    await p.close()
    return await make_page(browser,viewport,snapshot,errors)

async def scenario(browser,label,viewport):
    errors=[]
    p=await make_page(browser,viewport,{},errors)
    await p.locator('[data-action="welcome-guide"]').click()
    await p.locator('[data-action="nav"][data-page="dungeons"]').click()
    assert await p.locator('.dungeon-card').count()==3
    assert await p.locator('.dungeon-stage').count()==9
    if label=='desktop':await p.screenshot(path=str(ROOT/'apercu_donjons_V1.9.png'),full_page=True)
    assert await p.locator('[data-action="start-dungeon"][data-id="braise"]').is_disabled()
    await p.locator('[data-action="start-dungeon"][data-id="ysara"]').click()
    assert await p.locator('.dungeon-battle-banner').count()==1
    assert 'Salle 1/3' in await p.locator('.dungeon-battle-banner').inner_text()
    # Can't start a different encounter over a live dungeon battle.
    await p.locator('[data-action="nav"][data-page="campaign"]').click()
    await p.locator('[data-action="start-mission"][data-id="01"]').click()
    assert 'Salle 1/3' in await p.locator('.dungeon-battle-banner').inner_text()
    await p.evaluate('''() => {battle.heroes.p.hp=8; battle.status='victory'; battle.phase='finished'; settle();}''')
    assert await p.get_by_text('Salle remportée !').count()==1
    assert await p.locator('[data-action="dungeon-choice-open"]').count()==1
    await p.locator('[data-action="dungeon-choice-open"]').click()
    await p.locator('[data-action="dungeon-event"][data-id="treasure"]').click()
    await p.locator('.dungeon-run [data-action="dungeon-next"]').click()
    assert 'Salle 2/3' in await p.locator('.dungeon-battle-banner').inner_text()
    assert await p.evaluate('battle.heroes.p.hp')==14
    p=await reopen(browser,p,viewport,errors)
    assert 'Salle 2/3' in await p.locator('.dungeon-battle-banner').inner_text()
    assert await p.evaluate('battle.heroes.p.hp')==14
    await p.evaluate('''() => {battle.heroes.p.hp=5; battle.status='victory'; battle.phase='finished'; settle();}''')
    await p.locator('[data-action="dungeon-exit"]').click()
    await p.locator('[data-action="dungeon-event"][data-id="treasure"]').click()
    assert 'Salle 3' in await p.locator('.dungeon-run').inner_text() or 'Le Cœur noueux' in await p.locator('.dungeon-run').inner_text()
    p=await reopen(browser,p,viewport,errors)
    await p.locator('[data-action="nav"][data-page="dungeons"]').click()
    await p.locator('.dungeon-run [data-action="dungeon-next"]').click()
    assert 'Salle 3/3' in await p.locator('.dungeon-battle-banner').inner_text()
    assert await p.evaluate('battle.heroes.p.hp')==11
    assert await p.evaluate('battle.aiBoss') is True
    await p.evaluate('''() => {battle.heroes.p.hp=4; battle.status='victory'; battle.phase='finished'; settle();}''')
    assert await p.get_by_text('Donjon terminé !').count()==1
    assert await p.get_by_text('Archidruide Feuillage',exact=False).count()>0
    await p.locator('[data-action="dungeon-exit"]').click()
    assert await p.evaluate('profile.dungeonCleared.includes("ysara")') is True
    assert await p.evaluate('profile.collection.archdruid')==1
    assert not await p.locator('[data-action="start-dungeon"][data-id="braise"]').is_disabled()
    # The second dungeon can start; a failure resets the run.
    await p.locator('[data-action="start-dungeon"][data-id="braise"]').click()
    await p.evaluate('''() => {battle.status='defeat'; battle.phase='finished'; settle();}''')
    await p.locator('[data-action="dungeon-exit"]').click()
    assert await p.evaluate('profile.dungeonRun') is None
    assert errors==[], f'{label} JavaScript errors: {errors}'
    print(f'V1.9 {label}: expedition 3 salles, PV, reload, unlock, defeat: PASS')
    await p.close()

async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        for name,viewport in [('desktop',{'width':1400,'height':900}),('mobile',{'width':390,'height':844})]:
            await scenario(browser,name,viewport)
        await browser.close()
if __name__=='__main__':
    asyncio.run(main())
