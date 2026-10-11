"""V2.0 browser integration: mandatory choice, three event effects, persisted ambush and no duplicate reward."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
from browser_dungeons import make_page, reopen
ROOT=Path(__file__).resolve().parents[1]

async def scenario(browser,label,viewport):
 errors=[]
 p=await make_page(browser,viewport,{},errors)
 await p.locator('[data-action="welcome-guide"]').click()
 await p.locator('[data-action="nav"][data-page="dungeons"]').click()
 await p.locator('[data-action="start-dungeon"][data-id="ysara"]').click()
 await p.evaluate("""() => {battle.heroes.p.hp=10;battle.status='victory';battle.phase='finished';settle();}""")
 await p.locator('[data-action="dungeon-choice-open"]').click()
 assert await p.locator('.dungeon-event-option').count()==3
 assert await p.evaluate('profile.dungeonRun.phase')=='choice'
 if label=='desktop': await p.screenshot(path=str(ROOT/'apercu_evenements_V2.0.png'),full_page=True)
 p=await reopen(browser,p,viewport,errors)
 await p.locator('[data-action="nav"][data-page="dungeons"]').click()
 assert await p.locator('.dungeon-event-option').count()==3
 # Cannot bypass the event from the engine (UI never presents a continue button).
 assert await p.locator('.dungeon-run [data-action="dungeon-next"]').count()==0
 await p.locator('.dungeon-event-option[data-id="challenge"]').click()
 assert await p.evaluate('profile.dungeonRun.phase')=='bonus'
 p=await reopen(browser,p,viewport,errors)
 await p.locator('[data-action="nav"][data-page="dungeons"]').click()
 await p.locator('.dungeon-run [data-action="dungeon-next"]').click()
 assert await p.evaluate('battle.dungeonBonus') is True
 assert await p.evaluate('battle.missionId')=='B_ysara_2'
 await p.evaluate("""() => {battle.heroes.p.hp=8;battle.status='victory';battle.phase='finished';settle();}""")
 assert await p.get_by_text('Embuscade vaincue !').count()==1
 await p.locator('[data-action="dungeon-next"]').click()
 assert await p.evaluate('battle.dungeonBonus') is False
 assert await p.evaluate('battle.missionId')=='D_ysara_2'
 assert await p.evaluate('battle.heroes.p.hp')==14
 await p.evaluate("""() => {battle.heroes.p.hp=15;battle.status='victory';battle.phase='finished';settle();}""")
 await p.locator('[data-action="dungeon-choice-open"]').click()
 before=await p.evaluate('profile.dungeonRun.hp')
 await p.locator('[data-action="dungeon-event"][data-id="rest"]').click()
 assert await p.evaluate('profile.dungeonRun.hp')==min(26,before+10)
 assert await p.locator('.dungeon-event-option').count()==0
 assert errors==[],str(errors)
 print('V2.0',label,'choice/reload/ambush/reward/rest: PASS')
 await p.close()

async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  for label,viewport in [('desktop',{'width':1400,'height':900}),('mobile',{'width':390,'height':844})]:
   await scenario(browser,label,viewport)
  await browser.close()
if __name__=='__main__':asyncio.run(main())
