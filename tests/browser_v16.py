"""V1.6: browser confirms tactical UI, active combat and animations."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
async def main():
 async with async_playwright() as pw:
  b=await pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  desktop=await b.new_page(viewport={'width':1440,'height':900})
  errors=[];desktop.on('pageerror',lambda e:errors.append(str(e)))
  await desktop.set_content((ROOT/'tests/JOUER.test.html').read_text(encoding='utf-8'),wait_until='load')
  await desktop.locator('[data-action="welcome-guide"]').click()
  assert 'Charge' in await desktop.locator('body').inner_text()
  assert 'Riposte' in await desktop.locator('body').inner_text()
  await desktop.locator('[data-action="nav"][data-page="collection"]').click()
  pills=await desktop.locator('.trait-pill').all_inner_texts()
  assert 'Charge' in pills and 'Riposte' in pills
  await desktop.locator('[data-action="nav"][data-page="home"]').click()
  await desktop.locator('[data-action="start-next"]').click()
  assert await desktop.locator('.formation-tip').count()==1
  result=await desktop.evaluate('''() => {
   const unit=(uid,id,side,hp,atk,armor=0)=>({uid,id,side,atk,hp,maxhp:hp,armor,ranged:false,ability:'',stun:0,poison:0,poisonTurns:0});
   battle.heroes.e.hand=[];battle.heroes.e.deck=[];battle.heroes.e.discard=[];
   battle.heroes.p.hand=[];battle.heroes.p.deck=[];battle.heroes.p.discard=[];
   battle.board=Array.from({length:3},()=>Array(7).fill(null));
   battle.board[0][1]=unit(9871,'wolf','p',8,3);
   battle.board[0][3]=unit(9872,'bone','e',12,3);
   battle.board[1][2]=unit(9873,'shield','p',9,1,2);
   battle.board[1][3]=unit(9874,'bone','e',12,3);
   render();
   const tooltip=document.querySelector('.battle-cell .unit-on-board')?.title;
   document.querySelector('[data-action="end-turn"]').click();
   return {tooltip,turn:battle.round,chargedEnemyHp:battle.board[0][3]?.hp,
    riposteEnemyHp:battle.board[1][3]?.hp,log:battle.log.join(' ')};
  }''')
  assert result['chargedEnemyHp']==7,result
  assert result['riposteEnemyHp']==9,result
  assert 'Charge' in result['log'] and 'Riposte' in result['log'],result
  assert 'Charge' in result['tooltip'],result
  await desktop.wait_for_selector('.vfx-tactic',state='attached',timeout=4000)
  await desktop.wait_for_timeout(5000)
  assert await desktop.locator('.battle-vfx-overlay').count()==0
  assert not errors,errors
  mobile=await b.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
  merrors=[];mobile.on('pageerror',lambda e:merrors.append(str(e)))
  await mobile.set_content((ROOT/'tests/JOUER.test.html').read_text(encoding='utf-8'),wait_until='load')
  await mobile.locator('[data-action="welcome-start"]').click()
  assert await mobile.locator('.battle-grid .lane-row').count()==3
  assert not merrors,merrors
  await b.close()
  print('V1.6 browser: tactical cards + combat traces + animations + mobile PASS')
asyncio.run(main())
