"""V2.8 : compétences dans l'UI desktop/mobile, classe, combat et sauvegardes."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[1]
HTML=(ROOT/'tests/JOUER.test.html').read_text()

async def make_page(browser,viewport,store,errors):
    page=await browser.new_page(viewport=viewport)
    page.on('pageerror',lambda error:errors.append(str(error)))
    await page.evaluate('''saved=>{
      const cache={...saved};window.__saves=cache;
      Object.defineProperty(window,'localStorage',{configurable:true,value:{
        getItem(k){return cache[k]??null},
        setItem(k,v){cache[k]=String(v)},
        removeItem(k){delete cache[k]}
      }});
    }''',store)
    await page.set_content(HTML,wait_until='load')
    return page

async def run(browser,label,viewport):
    errors=[]
    page=await make_page(browser,viewport,{},errors)
    await page.locator('[data-action="welcome-guide"]').click()
    await page.evaluate('''() => {
      profile.heroXp=HERO_LEVEL_THRESHOLD(6);
      profile.shards=500;
      save();render();
    }''')
    await page.locator('[data-action="nav"][data-page="collection"]').click()
    assert await page.locator('[data-action="learn-class-skill"]').count()==2
    await page.locator('[data-action="learn-class-skill"][data-id="skill_guard_wall"]').click()
    assert await page.evaluate('profile.collection.skill_guard_wall')==1
    assert await page.evaluate('profile.shards')==470
    await page.locator('[data-action="deck-add"][data-id="skill_guard_wall"]').click()
    assert await page.evaluate('profile.deck.includes("skill_guard_wall")')
    await page.locator('[data-action="nav"][data-page="forge"]').click()
    await page.locator('[data-action="choose-class"][data-id="arcaniste"]').click()
    assert await page.evaluate('profile.heroClass')=='gardien'
    await page.locator('[data-action="nav"][data-page="collection"]').click()
    await page.locator('[data-action="deck-remove"][data-id="skill_guard_wall"]').first.click()
    await page.locator('[data-action="nav"][data-page="forge"]').click()
    await page.locator('[data-action="choose-class"][data-id="arcaniste"]').click()
    assert await page.evaluate('profile.heroClass')=='arcaniste'
    await page.locator('[data-action="nav"][data-page="collection"]').click()
    assert await page.locator('[data-action="learn-class-skill"]').count()==2
    await page.locator('[data-action="learn-class-skill"][data-id="skill_arc_freeze"]').click()
    await page.locator('[data-action="deck-add"][data-id="skill_arc_freeze"]').click()
    assert await page.evaluate('profile.deck.includes("skill_arc_freeze")')
    await page.locator('#nav [data-action="nav"][data-page="campaign"]').click()
    await page.locator('[data-action="start-mission"][data-id="01"]').click()
    await page.evaluate('''() => {
      battle.heroes.p.hand=[{id:'skill_arc_freeze',wait:0}];
      battle.board[0][3]={uid:999,id:'wolf',side:'e',hp:5,maxhp:5,atk:3,armor:0,ranged:false,ability:'haste',stun:0,poison:0,poisonTurns:0};
      persistBattle();render();
    }''')
    await page.locator('.hand [data-action="select-card"]').first.click()
    await page.locator('[data-action="deploy"][data-lane="0"]').click()
    assert await page.evaluate('battle.board[0][3].hp')==4
    assert await page.evaluate('battle.board[0][3].stun')==2
    saved=await page.evaluate('window.__saves')
    await page.close()
    page=await make_page(browser,viewport,saved,errors)
    assert await page.evaluate('profile.heroClass')=='arcaniste'
    assert await page.evaluate('profile.collection.skill_arc_freeze')==1
    assert await page.evaluate('battle.board[0][3].stun')==2
    assert await page.locator('.battle-grid .lane-row').count()==2
    assert not errors,errors
    print('V2.8 '+label+': apprentissage/classe/combat/sauvegarde PASS')
    await page.close()

async def main():
    async with async_playwright() as playwright:
        browser=await playwright.chromium.launch(headless=True,args=['--no-sandbox'])
        for label,viewport in [('desktop',{'width':1366,'height':900}),('mobile',{'width':390,'height':844})]:
            await run(browser,label,viewport)
        await browser.close()

if __name__=='__main__':
    asyncio.run(main())
