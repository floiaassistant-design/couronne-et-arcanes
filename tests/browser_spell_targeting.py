"""Clic/toucher des vraies cartes, aperçu pur, restrictions et confirmations uniques."""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
KEY='couronnes_arcanes_bataille_v1'
SETUP=r'''({id,legacy})=>{
 battle=createBattle(profile,{id:'01',name:'Ciblage direct',enemy:'Bastion',hp:100,difficulty:1,deck:[]},71,{turnFlow:'alternating'});
 if(legacy)battle.board=Array.from({length:3},()=>Array(7).fill(null));
 const u=(uid,side,extra={})=>({uid,id:'militia',side,atk:3,hp:8,maxhp:12,armor:1,barrier:1,ranged:false,ability:'',stun:0,poison:0,poisonTurns:0,...extra});
 battle.board[0][2]=u(900,'p');battle.board[0][3]=u(901,'e');battle.board[0][4]=u(902,'e');
 battle.board[1][3]=u(903,'e');battle.board[1][4]=u(904,'e');battle.board[1][2]=u(905,'p');
 battle.heroClass=id.startsWith('skill_cleric')?'clerc':'gardien';
 battle.heroes.p.hand=[{id,wait:0},{id:'militia',wait:0}];battle.heroes.p.cardsPlayed=0;
 battle.heroes.p.hp=10;battle.heroes.p.shield=0;battle.heroes.e.hand=[];battle.heroes.e.deck=[];battle.heroes.e.discard=[];
 selectedCard=-1;persistBattle();render();
}'''
async def idle(page):await page.wait_for_function("!document.querySelector('.combat-playing')")
async def run(browser,label,vp,touch=False,reduced=False,legacy=False):
 ctx=await browser.new_context(viewport=vp,has_touch=touch,is_mobile=touch,offline=True,reduced_motion='reduce' if reduced else 'no-preference')
 page=await ctx.new_page();errors=[];network=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('request',lambda r:network.append(r.url) if r.url.startswith(('http:','https:')) else None)
 await page.goto((ROOT/'tests/JOUER.test.html').as_uri());await page.locator('[data-action="welcome-start"]').click()
 async def click(selector):
  n=page.locator(selector)
  if await n.get_attribute('aria-disabled')=='true':
   await n.scroll_into_view_if_needed();box=await n.bounding_box();x=box['x']+box['width']/2;y=box['y']+box['height']/2
   if touch:await page.touchscreen.tap(x,y)
   else:await page.mouse.click(x,y)
  elif touch:await n.tap()
  else:await n.click()
 async def select_hand():
  await click('.hand [data-index="0"]')
  if touch:
   assert await page.evaluate('selectedCard')==-1
   await click('.hand [data-index="0"]')
 async def setup(id):
  await page.evaluate(SETUP,{'id':id,'legacy':legacy});await select_hand()
 await setup('firebolt')
 snapshot=await page.evaluate('(key)=>localStorage.getItem(key)',KEY)
 state=await page.evaluate('JSON.stringify(battle)')
 assert await page.locator('[data-unit-id="901"]').get_attribute('data-action')=='spell-target'
 assert await page.locator('[data-unit-id="902"]').get_attribute('aria-disabled')=='true'
 await click('[data-unit-id="902"]')
 assert await page.locator('[data-action="spell-confirm"]').count()==0
 await click('[data-unit-id="900"]')
 assert await page.locator('[data-action="spell-confirm"]').count()==0
 await click('[data-unit-id="901"]')
 assert '−2 PV' in await page.locator('.spell-prediction').inner_text()
 assert '−1 protection' in await page.locator('.spell-prediction').inner_text()
 assert await page.locator('.board-card.spell-affected').count()==1
 assert await page.evaluate('JSON.stringify(battle)')==state
 assert await page.evaluate('(key)=>localStorage.getItem(key)',KEY)==snapshot
 # Changer de cible et annuler avant de consommer ; le clavier reste disponible.
 await click('[data-action="spell-lane"][data-lane="1"]')
 assert await page.locator('[data-unit-id="903"]').get_attribute('class') and await page.locator('[data-unit-id="903"].spell-affected').count()==1
 await click('[data-action="spell-cancel"]')
 assert await page.locator('.spell-targeting').count()==0
 assert await page.evaluate('JSON.stringify(battle)')==state
 await select_hand();await click('[data-unit-id="901"]')
 await page.screenshot(path=f'/tmp/ca-targeting-{label}.png')
 await click('[data-action="spell-confirm"]')
 assert await page.evaluate('battle.board[0][3].hp')==6
 assert await page.evaluate('battle.heroes.p.cardsPlayed')==1
 if not reduced:
  await page.wait_for_selector('.combat-playing')
  await page.wait_for_selector('.combat-fx-layer[data-faction="forge"]')
  assert await page.locator('.combat-fx-layer[data-faction="forge"]').count()==1
  await page.screenshot(path=f'/tmp/ca-targeting-{label}-impact.png')
  await page.evaluate("act('spell-confirm',{});act('spell-target',{lane:'0',unitId:'902'})")
  assert await page.evaluate('battle.heroes.p.cardsPlayed')==1
  await page.evaluate("document.querySelector('[data-action=\"fx-skip\"]:not([hidden])')?.click()")
 await idle(page)
 saved=await page.evaluate('(k)=>localStorage.getItem(k)',KEY)
 await page.reload();assert await page.evaluate('(k)=>localStorage.getItem(k)',KEY)==saved
 assert await page.locator('.spell-targeting,.combat-fx-layer').count()==0
 # Zone : toucher une carte de la ligne affecte toute cette ligne, aucune autre.
 await setup('storm');await click('[data-unit-id="904"]')
 assert await page.locator('.spell-affected').count()==2
 assert await page.evaluate('battle.board[1][3].hp')==8
 await click('[data-action="spell-confirm"]')
 assert await page.evaluate('[battle.board[0][3].hp,battle.board[1][3].hp,battle.board[1][4].hp]')==[8,7,7]
 if not reduced:
  await page.wait_for_selector('.combat-playing')
  assert await page.locator('.combat-fx-number.damage').count()==2
  await page.evaluate("document.querySelector('[data-action=\"fx-skip\"]:not([hidden])')?.click()")
 await idle(page)
 # Soin, protection et immobilisation : états réels persistants.
 for id,uid,expected in [('healing',900,10),('skill_cleric_bless',900,5),('entangle',901,2)]:
  await setup(id);await click(f'[data-unit-id="{uid}"]');assert await page.locator('.spell-prediction').inner_text()
  await click('[data-action="spell-confirm"]')
  if not reduced:
   await page.wait_for_selector('.combat-playing')
   assert await page.locator('.combat-fx-aura').count()>0
   await page.evaluate("document.querySelector('[data-action=\"fx-skip\"]:not([hidden])')?.click()")
  await idle(page)
  if id=='healing':assert await page.evaluate('battle.board[0][2].hp')==expected
  elif id=='skill_cleric_bless':assert await page.evaluate('battle.board[0][2].barrier')==expected
  else:assert await page.evaluate('battle.board[0][3].stun')==expected
  if id!='healing':assert await page.locator('.combat-statuses').count()>0
 # Coup fatal : l’aperçu doit encore montrer les vrais dégâts après retrait de la cible.
 await setup('firebolt')
 await page.evaluate("()=>{battle.board[0][3].hp=1;persistBattle();render()}")
 await click('[data-unit-id="901"]')
 assert '−1 PV' in await page.locator('.spell-prediction').inner_text()
 assert 'est vaincu' in await page.locator('.spell-prediction').inner_text()
 assert await page.evaluate('battle.board[0][3].hp')==1
 await click('[data-action="spell-confirm"]')
 assert await page.evaluate('battle.board[0][3]') is None
 await page.evaluate("document.querySelector('[data-action=\"fx-skip\"]:not([hidden])')?.click()")
 await idle(page)
 await setup('sanctuary')
 assert await page.locator('[data-action="spell-lane"]').count()==0
 assert await page.locator('[data-action="spell-confirm"]').count()==1
 await click('[data-action="spell-confirm"]');await idle(page)
 assert await page.evaluate('battle.heroes.p.shield')==5
 # Annulation au clavier puis validation réelle du tour et IA automatique.
 await setup('firebolt');await page.keyboard.press('Escape')
 assert await page.locator('.spell-targeting').count()==0
 await page.evaluate("()=>{animationsEnabled=false;render()}")
 await click('[data-action="end-turn"]')
 await page.wait_for_function('battle.round===2&&battle.phase==="player"');await idle(page)
 assert not errors,errors;assert not network,network
 assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
 await ctx.close();print(f'Ciblage {label}: souris/tactile, restrictions, annulation, aperçu pur, 1 lancement, zone, soins, états, reprise et IA PASS',flush=True)
async def failure_fallback(browser):
 page=await browser.new_page(viewport={'width':1366,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 await page.goto((ROOT/'tests/JOUER.test.html').as_uri());await page.locator('[data-action="welcome-start"]').click()
 await page.evaluate(SETUP,{'id':'firebolt','legacy':False})
 await page.evaluate("()=>{Element.prototype.animate=function(){throw Error('Animation indisponible pour ce test')}}")
 await page.locator('.hand [data-index="0"]').click();await page.locator('[data-unit-id="901"]').click();await page.locator('[data-action="spell-confirm"]').click()
 await idle(page);assert await page.evaluate('battle.heroes.p.cardsPlayed')==1
 assert await page.locator('.combat-fx-layer').count()==0
 assert not errors,errors
 await page.close();print('Repli après erreur du lecteur : résultat conservé, verrou libéré, aucun doublon PASS',flush=True)
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(headless=True,args=['--no-sandbox'])
  for label,vp,touch,reduced,legacy in [('desktop',{'width':1366,'height':900},False,False,False),('portrait',{'width':390,'height':844},True,False,False),('landscape',{'width':844,'height':390},True,False,False),('legacy',{'width':1000,'height':800},False,True,True),('reduced',{'width':390,'height':844},True,True,False)]:
   await run(b,label,vp,touch,reduced,legacy)
  await failure_fallback(b);await b.close()
if __name__=='__main__':asyncio.run(main())
