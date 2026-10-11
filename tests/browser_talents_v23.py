"""Test navigateur V2.3 : talents, classes, combat, sauvegarde et mobile."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]

async def verify(browser, device, width, height):
 errors=[]
 page=await browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
 page.on('pageerror',lambda e:errors.append(str(e)))
 await page.evaluate('''() => {
   const store={};window.__store=store;
   Object.defineProperty(window,'localStorage',{configurable:true,value:{
     getItem(k){return store[k]??null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}
   }});
 }''')
 await page.set_content((ROOT/'tests/JOUER.test.html').read_text(),wait_until='load')
 await page.locator('[data-action="welcome-guide"]').click()
 await page.locator('[data-action="nav"][data-page="forge"]').click()
 assert await page.locator('.talent-node').count()==4
 assert await page.locator('.talent-node.locked').count()==4
 assert await page.locator('[data-action="choose-talent"]:not([disabled])').count()==0
 await page.evaluate('''() => {profile.heroXp=HERO_LEVEL_THRESHOLD(8);save();render()}''')
 assert await page.locator('.talent-node.locked').count()==0
 await page.locator('[data-action="choose-talent"][data-id="gardien_rempart"]').click()
 assert await page.locator('.talent-node.active').count()==1
 await page.locator('[data-action="choose-talent"][data-id="gardien_serment"]').click()
 assert await page.locator('.talent-node.active').count()==1
 assert await page.evaluate('profile.talents.gardien[1]')=='gardien_serment'
 await page.locator('[data-action="choose-talent"][data-id="gardien_barriere"]').click()
 assert await page.locator('.talent-node.active').count()==2
 await page.locator('[data-action="choose-class"][data-id="arcaniste"]').click()
 assert await page.locator('.talent-node.active').count()==0
 await page.locator('[data-action="choose-talent"][data-id="arcaniste_focus"]').click()
 assert await page.evaluate('profile.talents.arcaniste[1]')=='arcaniste_focus'
 await page.locator('[data-action="choose-class"][data-id="gardien"]').click()
 assert await page.locator('.talent-node.active').count()==2
 if device=='desktop':
  await page.locator('.talents-section').screenshot(path=str(ROOT/'apercu_talents_V2.3.png'))
 await page.locator('[data-action="nav"][data-page="campaign"]').click()
 await page.locator('[data-action="start-mission"][data-id="01"]').click()
 assert await page.locator('.battle-talents').count()==1
 assert 'Serment vivant' in await page.locator('.battle-talents').inner_text()
 effects=await page.evaluate('''() => {
    battle.heroes.p.hp=8;
    const result=usePower(battle);
    persistBattle();render();
    return {ok:result.ok,hp:battle.heroes.p.hp,talents:battle.heroTalents};
 }''')
 assert effects['ok'] and effects['hp']==14 and 'gardien_serment' in effects['talents'],effects
 storage=await page.evaluate('window.__store')
 await page.close()
 next_page=await browser.new_page(viewport={'width':width,'height':height})
 next_page.on('pageerror',lambda e:errors.append(str(e)))
 await next_page.evaluate('''store => {
   window.__store=store;
   Object.defineProperty(window,'localStorage',{configurable:true,value:{
    getItem(k){return store[k]??null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}
   }});
 }''',storage)
 await next_page.set_content((ROOT/'tests/JOUER.test.html').read_text(),wait_until='load')
 assert await next_page.evaluate('profile.talents.gardien[1]')=='gardien_serment'
 assert await next_page.evaluate('profile.talents.arcaniste[1]')=='arcaniste_focus'
 assert await next_page.evaluate('battle.heroTalents.includes("gardien_serment")')
 assert not errors,errors
 print(f'V2.3 {device} talents/class switch/combat/save: PASS')
 await next_page.close()

async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  await verify(browser,'desktop',1440,900)
  await verify(browser,'mobile',390,844)
  await browser.close()

if __name__=='__main__':asyncio.run(main())
