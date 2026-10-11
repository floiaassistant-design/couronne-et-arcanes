"""V2.2 progression UI, battle reward, reload migration & mobile validation."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]

async def scenario(browser, device, width, height):
    errors=[]
    page=await browser.new_page(viewport={'width':width,'height':height})
    page.on('pageerror', lambda error:errors.append(str(error)))
    await page.evaluate('''() => {
      const data={};window.__storage=data;
      Object.defineProperty(window,'localStorage',{configurable:true,value:{
        getItem(k){return data[k]??null},setItem(k,v){data[k]=String(v)},removeItem(k){delete data[k]}
      }});
    }''')
    await page.set_content((ROOT/'tests/JOUER.test.html').read_text(),wait_until='load')
    await page.locator('[data-action="welcome-guide"]').click()
    await page.locator('[data-action="nav"][data-page="home"]').click()
    assert await page.locator('.progression-panel').count()==1
    assert 'Niveau 1 / 12' in await page.locator('.progression-panel').inner_text()
    await page.evaluate('''() => {
      profile.heroXp=HERO_LEVEL_THRESHOLD(5)-5;
      profile.mastery.militia=21;
      save();render();
    }''')
    await page.locator('[data-action="nav"][data-page="collection"]').click()
    assert await page.locator('[data-action="deck-add"][data-id="militia"]').count()>0
    assert await page.locator('.mastery-progress').count()>0
    await page.locator('.nav-btn[data-action="nav"][data-page="campaign"]').click()
    await page.locator('[data-action="start-mission"][data-id="01"]').click()
    await page.evaluate('''() => {
      battle.heroes.p.hand=[{id:'militia',wait:0}];
      playPlayerCard(battle,0,0);
      battle.status='victory';battle.phase='finished';
      settle();
    }''')
    message=await page.locator('.modal').inner_text()
    assert 'Niveau 5 atteint' in message,message
    assert await page.evaluate('heroLevel(profile)')==5
    assert await page.evaluate('masteryRank(profile,"militia")')==3
    await page.locator('[data-action="battle-exit"]').click()
    await page.locator('[data-action="nav"][data-page="collection"]').click()
    assert await page.locator('.unit-card .mastery-seal').count()>0
    assert await page.locator('.mastery-progress').count()>0
    if device=='desktop':
        await page.locator('[data-action="nav"][data-page="home"]').click()
        await page.screenshot(path=str(ROOT/'apercu_progression_V2.2.png'),full_page=False)
    storage=await page.evaluate('window.__storage')
    await page.close()
    second=await browser.new_page(viewport={'width':width,'height':height})
    second.on('pageerror',lambda error:errors.append(str(error)))
    await second.evaluate('''data => {
      window.__storage=data;
      Object.defineProperty(window,'localStorage',{configurable:true,value:{
        getItem(k){return data[k]??null},setItem(k,v){data[k]=String(v)},removeItem(k){delete data[k]}
      }});
    }''',storage)
    await second.set_content((ROOT/'tests/JOUER.test.html').read_text(),wait_until='load')
    assert await second.evaluate('heroLevel(profile)')==5
    assert await second.evaluate('masteryRank(profile,"militia")')==3
    assert not errors,errors
    print(f'V2.2 {device}: XP, rank, combat, UI, persisted save: PASS')
    await second.close()

async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        await scenario(browser,'desktop',1440,900)
        await scenario(browser,'mobile',390,844)
        await browser.close()

if __name__=='__main__':asyncio.run(main())
