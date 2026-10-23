"""Actions réelles, images intermédiaires, exactitude et reprise sans réseau."""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
KEY='couronnes_arcanes_bataille_v1'
SETUP=r'''()=>{
 const unit=(uid,side,extra={})=>({uid,id:'militia',side,atk:4,hp:8,maxhp:8,armor:0,ranged:false,ability:'none',stun:0,poison:0,poisonTurns:0,...extra});
 battle.board=battle.board.map(row=>row.map(()=>null));battle.round=1;battle.phase='player';battle.status='active';battle.turnFlow='alternating';battle.nextUnitId=1000;
 for(const h of Object.values(battle.heroes))Object.assign(h,{hp:100,maxhp:100,hand:[],deck:[],discard:[],cardsPlayed:0});
 battle.board[0][4]=unit(900,'p');battle.board[0][5]=unit(901,'e',{hp:2,maxhp:5,armor:2});
 persistBattle();render();
}'''
async def idle(page):await page.wait_for_function("!document.querySelector('.combat-playing')")
async def run(browser,label,viewport,reduced=False,off=False):
 ctx=await browser.new_context(viewport=viewport,offline=True,reduced_motion='reduce' if reduced else 'no-preference')
 page=await ctx.new_page();errors=[];network=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('request',lambda r:network.append(r.url) if r.url.startswith(('http:','https:')) else None)
 await page.goto((ROOT/'tests/JOUER.test.html').as_uri());await page.locator('[data-action="welcome-start"]').click()
 await page.evaluate(SETUP)
 if off:await page.locator('[data-action="toggle-animations"]').click()
 await page.locator('[data-action="end-turn"]').click()
 if not reduced and not off:
  await page.wait_for_selector('.combat-playing')
  assert await page.locator('[data-unit-id="901"]').count()==1,'La cible doit rester visible pendant le coup fatal'
  assert await page.evaluate('battle.board[0][5]===null'),'Le moteur a déjà résolu le résultat réel'
  saved=json.loads(await page.evaluate('(k)=>localStorage.getItem(k)',KEY))
  assert saved['board'][0][5] is None and 'vfx' not in saved
  assert await page.locator('[data-action="end-turn"]').is_disabled()
  await page.evaluate("act('end-turn',{})")
  assert await page.evaluate('battle.round')==1
  assert await page.locator('.combat-fx-path').count()==1
  assert '−2 PV' in await page.locator('.combat-action').inner_text()
  assert 'armure : 2' in await page.locator('.combat-action').inner_text()
  # Le défilement automatique doit amener la cible et ses vrais nombres dans l'écran.
  rect=await page.locator('[data-unit-id="901"]').bounding_box()
  assert rect['x']>=-2 and rect['x']+rect['width']<=viewport['width']+2,(label,rect)
  await page.wait_for_timeout(350)
  await page.screenshot(path=f'/tmp/ca-combat-fx-{label}.png')
  await page.locator('[data-action="fx-speed"]').click()
  assert await page.locator('[data-action="fx-speed"]').inner_text()=='×2'
  await page.locator('[data-action="fx-skip"]').click()
 await page.wait_for_function('battle.round===2');await idle(page)
 assert await page.locator('[data-unit-id="901"]').count()==0
 assert await page.locator('[data-action="end-turn"]').is_enabled()
 await page.locator('.combat-intel>summary').click()
 assert await page.locator('.combat-recap li').count()>=2
 await page.locator('.combat-recap>summary').click()
 assert '−2 PV' in await page.locator('.combat-recap').inner_text(),await page.locator('.combat-recap').inner_text()
 saved=await page.evaluate('(k)=>localStorage.getItem(k)',KEY)
 await page.reload();assert await page.evaluate('(k)=>localStorage.getItem(k)',KEY)==saved
 assert await page.locator('.combat-playing,.combat-fx-layer').count()==0
 # Mouvement : la vraie carte reste à l'origine, puis rejoint sa case réelle.
 if not reduced and not off:
  await page.evaluate(SETUP)
  await page.evaluate("()=>{battle.board[0][5]=null;persistBattle();render()}")
  await page.locator('[data-action="end-turn"]').click();await page.wait_for_selector('.combat-playing')
  assert await page.locator('[data-unit-id="900"]').evaluate('(e)=>e.closest(".battle-cell").dataset.col')=='4'
  assert await page.evaluate('battle.board[0][5]?.uid')==900
  # Coupure pendant la lecture : reprendre le résultat sauvé, sans rejouer l'action.
  await page.reload()
  await page.wait_for_function('battle.round===2');await idle(page)
  assert await page.locator('[data-unit-id="900"]').evaluate('(e)=>e.closest(".battle-cell").dataset.col')=='5'
 assert not errors,errors
 assert not network,network
 await ctx.close();print(f'Effets {label}: attaque réelle, armure, cible, verrou, journal, vitesse, reprise et hors ligne PASS')
async def check_effect_types(browser):
 ctx=await browser.new_context(viewport={'width':1366,'height':900},offline=True)
 page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 await page.goto((ROOT/'tests/JOUER.test.html').as_uri());await page.locator('[data-action="welcome-start"]').click()
 for kind in ['ranged','magic']:
  await page.evaluate(SETUP)
  await page.evaluate("kind=>{const e=battle.board[0][5];e.hp=e.maxhp=20;e.armor=0;if(kind==='ranged'){battle.board[0][6]=e;battle.board[0][5]=null;battle.board[0][4].ranged=true}else battle.board[0][4].ability='splash';persistBattle();render()}",kind)
  await page.locator('[data-action="end-turn"]').click()
  await page.wait_for_selector('.combat-fx-projectile.'+kind)
  assert ('Tir à distance' if kind=='ranged' else 'Attaque magique') in await page.locator('.combat-action').inner_text()
  await page.locator('[data-action="fx-skip"]').click();await page.wait_for_function('battle.round===2');await idle(page)
 for card in ['firebolt','healing']:
  await page.evaluate(SETUP)
  await page.evaluate("id=>{battle.heroes.p.hand=[{id,wait:0}];if(id==='healing'){battle.board[0][5]=null;battle.board[0][4].hp=7;battle.heroes.p.hp=99}else battle.board[0][4]=null;persistBattle();render()}",card)
  await page.locator('.hand [data-action="select-card"]').click()
  await page.locator('[data-action="deploy"][data-col="1"][data-lane="0"]').click()
  if card=='firebolt':
   await page.wait_for_selector('.combat-fx-projectile.magic');assert 'Lame de feu' in await page.locator('.combat-action').inner_text()
  else:
   await page.wait_for_selector('.combat-fx-number.healing',state='attached')
   assert await page.locator('.combat-fx-number.healing').count()==2
   assert all('+1 PV' in x for x in await page.locator('.combat-fx-number.healing').all_text_contents())
  await idle(page)
 await page.evaluate(SETUP)
 await page.evaluate("()=>{battle.board[0][5]=null;Object.assign(battle.board[0][4],{hp:1,poison:2,poisonTurns:1});persistBattle();render()}")
 await page.locator('[data-action="end-turn"]').click()
 await page.wait_for_function("document.querySelector('.combat-action')?.textContent.includes('Poison')")
 assert '−1 PV' in await page.locator('.combat-action').inner_text()
 await page.locator('[data-action="fx-skip"]').click();await page.wait_for_function('battle.round===2');await idle(page)
 assert not errors,errors
 await ctx.close();print('Effets distincts : tir, magie, sort nommé, soins partiels et poison plafonné PASS')
async def check_laboratory_integration(browser):
 ctx=await browser.new_context(viewport={'width':1366,'height':900},offline=True)
 page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 await page.goto((ROOT/'tests/JOUER.test.html').as_uri())
 await page.locator('[data-action="welcome-guide"]').click()
 snapshot=await page.evaluate("[localStorage.getItem('couronnes_arcanes_v1'),localStorage.getItem('couronnes_arcanes_bataille_v1')]")
 await page.locator('#nav [data-page="developer"]').click()
 await page.locator('[data-lab-field="cardId"]').select_option('militia')
 await page.locator('[data-lab-field="rarity"]').select_option('divine')
 await page.locator('[data-lab-field="level"]').select_option('2')
 await page.locator('[data-action="lab-start"]').click()
 await page.evaluate("()=>{battle.heroes.p.hand=[{id:'militia',wait:0}];battle.heroes.e.hand=[];battle.heroes.e.deck=[];render()}")
 await page.locator('.hand [data-action="select-card"]').click()
 await page.locator('[data-action="deploy"][data-col="1"][data-lane="0"]').click()
 await page.wait_for_selector('.combat-playing')
 await page.locator('[data-action="fx-speed"]').click()
 assert await page.locator('[data-action="fx-speed"]').inner_text()=='×2'
 await page.locator('[data-action="fx-skip"]').click();await idle(page)
 assert await page.evaluate("({atk:battle.board[0][1].atk,hp:battle.board[0][1].hp,block:battle.board[0][1].labGuard.block})")=={'atk':5,'hp':10,'block':3}
 await page.locator('[data-action="end-turn"]').click();await page.wait_for_selector('.combat-playing')
 await page.locator('[data-action="lab-back"]').first.click()
 assert await page.locator('.developer-lab').count()==1
 assert await page.locator('.combat-playing,.combat-fx-layer').count()==0
 # Une victoire calculée avant sa lecture doit rester sans récompense réelle.
 await page.locator('[data-action="lab-start"]').click()
 await page.evaluate("()=>{battle.heroes.p.hand=[{id:'militia',wait:0}];battle.heroes.e.hand=[];battle.heroes.e.deck=[];playPlayerCard(battle,0,0,1);battle.board[0][10]=battle.board[0][1];battle.board[0][1]=null;battle.heroes.e.hp=1;battle.heroes.e.shield=0;render()}")
 await page.locator('[data-action="end-turn"]').click();await page.wait_for_selector('.combat-playing')
 await page.locator('[data-action="fx-skip"]').click();await idle(page)
 await page.locator('.modal').wait_for()
 assert 'TEST TERMINÉ' in await page.locator('.modal').inner_text()
 assert await page.evaluate('battle.status')=='victory'
 await page.locator('.modal [data-action="lab-exit"]').click()
 assert await page.evaluate("[localStorage.getItem('couronnes_arcanes_v1'),localStorage.getItem('couronnes_arcanes_bataille_v1')]")==snapshot
 assert not errors,errors
 await ctx.close();print('Effets + laboratoire : Milicien Divin II, vitesse, passage, sortie pendant lecture et victoire sans sauvegarde PASS')
async def main():
 async with async_playwright() as pw:
  b=await pw.chromium.launch(headless=True,args=['--no-sandbox'])
  for label,vp,reduce,off in [('desktop',{'width':1366,'height':900},False,False),('portrait',{'width':390,'height':844},False,False),('landscape',{'width':844,'height':390},False,False),('reduced',{'width':390,'height':844},True,False),('off',{'width':1366,'height':900},False,True)]:
   await run(b,label,vp,reduce,off)
  await check_effect_types(b)
  await check_laboratory_integration(b)
  await b.close()
if __name__=='__main__':asyncio.run(main())
