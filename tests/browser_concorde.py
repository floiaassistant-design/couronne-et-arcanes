"""Concorde réel : lueur, nombres, descriptions, clics, extinction et reprise."""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[1]
PAIRS=[('militia','shield','aube'),('ranger','wolf','sylve'),('bone','crypt','ombre'),('smith','drill','forge'),('spark','mystic','ether')]
KEY='couronnes_arcanes_bataille_v1'
SETUP=r'''({ids,legacy})=>{
 battle=createBattle(profile,{id:'01',name:'Contrôle Concorde',enemy:'Bastion',hp:100,difficulty:4,deck:[]},71,{legacy});
 battle.board=battle.board.map(row=>row.map(()=>null));
 battle.heroes.p.hand=ids.map(id=>({id,wait:0}));
 battle.heroes.e.hand=[];battle.heroes.e.deck=[];
 selectedCard=-1;persistBattle();render();
}'''

async def run(browser,label,viewport,legacy=False,reduced=False,off=False):
 ctx=await browser.new_context(viewport=viewport,offline=True,has_touch=viewport['width']<900,reduced_motion='reduce' if reduced else 'no-preference')
 page=await ctx.new_page();errors=[];network=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('request',lambda r:network.append(r.url) if r.url.startswith(('http:','https:')) else None)
 await page.goto((ROOT/'tests/JOUER.test.html').as_uri())
 await page.locator('[data-action="welcome-start"]').click()
 if off:await page.locator('[data-action="toggle-animations"]').click()
 for first,second,faction in PAIRS:
  await page.evaluate(SETUP,{'ids':[first,second],'legacy':legacy})
  # La sélection et la pose passent par la vraie interface, deux unités au total.
  await page.locator('.hand-card[data-index="0"]').click()
  await page.locator('[data-action="deploy"][data-lane="0"][data-col="1"]').click()
  await page.wait_for_function('!document.querySelector(".combat-playing")')
  assert await page.locator('.concorde-emblem-light').count()==0
  # Le second déploiement historique nécessite une entrée libérée.
  if legacy:await page.evaluate("()=>{battle.board[0][2]=battle.board[0][1];battle.board[0][1]=null;persistBattle();render()}")
  await page.locator('.hand-card[data-index="0"]').click()
  await page.locator(f'[data-action="deploy"][data-lane="0"][data-col="{1 if legacy else 2}"]').click()
  await page.wait_for_function('!document.querySelector(".combat-playing")')
  await page.mouse.move(1,1);await page.keyboard.press('Escape')
  assert await page.locator('.board-card .concorde-emblem-light').count()==2,(label,first,await page.evaluate('({phase:battle.phase,hand:battle.heroes.p.hand,board:battle.board.map(row=>row.map(u=>u&&({id:u.id,hp:u.hp,side:u.side})))})'))
  assert await page.locator('.formation-badge').count()==0
  assert await page.locator('.board-card[data-side="p"] [data-concorde="active"]').count()==2
  for card in await page.locator('.board-card').all():
   light=card.locator('.concorde-emblem-light')
   assert await light.get_attribute('data-concorde-faction')==faction
   assert await light.is_visible()
   assert await light.evaluate('e=>getComputedStyle(e).pointerEvents')=='none'
   assert await light.evaluate('e=>e.getAnimations().length')==0
   assert await light.evaluate('e=>{const a=e.getBoundingClientRect(),b=e.closest(".board-card").querySelector(".board-camp-seal").getBoundingClientRect();return a.right<=b.x||a.x>=b.right||a.bottom<=b.y||a.y>=b.bottom}'),'Le sceau de camp doit laisser le logo visible'
   assert await light.evaluate('e=>{const a=e.getBoundingClientRect(),b=e.closest(".generated-face").getBoundingClientRect();return a.x>=b.x&&a.y>=b.y&&a.right<=b.right+1&&a.bottom<=b.bottom+1}')
   assert await light.locator('.concorde-emblem-pixels').evaluate('e=>getComputedStyle(e).backgroundImage.includes(e.closest(".generated-face").querySelector("img").src)')
   expected=await card.evaluate('e=>{const u=battle.board.flat().find(u=>u&&String(u.uid)===e.dataset.unitId);return u.atk+1}')
   assert await card.locator('.stat.atk b').inner_text()==str(expected)
  before=await page.evaluate('JSON.stringify({profile,battle})')
  card=page.locator(f'.board-card[data-card-id="{first}"]')
  await page.keyboard.press('Tab')
  await card.focus()
  panel=page.locator('#hand-card-inspection')
  assert await panel.is_visible()
  assert await panel.locator('.concorde-emblem-light').count()==1
  assert 'Actif : +1 ATQ incluse' in await panel.inner_text()
  assert 'La carte elle-même compte parmi les deux' in await panel.inner_text()
  assert await page.evaluate('JSON.stringify({profile,battle})')==before
  assert await panel.evaluate('e=>{const r=e.getBoundingClientRect();return r.x>=0&&r.y>=0&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1}')
  await page.screenshot(path=f'/tmp/ca-concorde-{label}-{faction}-fiche.png')
  await page.keyboard.press('Escape');await page.mouse.move(1,1)
  # L'IA bénéficie du même indicateur ; un allié isolé avec Ralliement reste éteint.
  await page.evaluate('''()=>{
   const cells=battle.board[0].length-2,pair=battle.board[0].filter(Boolean);
   battle.board[1][cells-1]={...pair[0],uid:901,side:'e',hp:1,armor:0,barrier:0};
   battle.board[1][cells]={...pair[1],uid:902,side:'e',hp:1,armor:0,barrier:0};
   battle.heroes.p.hand=[{id:'firebolt',wait:0}];battle.heroes.p.cardsPlayed=0;
   persistBattle();render();
  }''')
  assert await page.locator('.board-card[data-side="e"] .concorde-emblem-light').count()==2
  saved=await page.evaluate('(k)=>localStorage.getItem(k)',KEY)
  await page.reload()
  assert await page.evaluate('(k)=>localStorage.getItem(k)',KEY)==saved
  assert await page.locator('.board-card .concorde-emblem-light').count()==4
  # Vrai sort mortel : l'indicateur s'éteint et l'ATQ revient à sa valeur réelle.
  await page.locator('.hand-card').click()
  await page.locator('.board-card[data-unit-id="901"]').click()
  await page.locator('[data-action="spell-confirm"]').click()
  await page.wait_for_function('!document.querySelector(".combat-playing")')
  assert await page.locator('.board-card[data-side="e"] .concorde-emblem-light').count()==0
  remaining=page.locator('.board-card[data-side="e"]');assert await remaining.count()==1
  assert await remaining.locator('.stat.atk b').inner_text()==str(await remaining.evaluate('e=>battle.board.flat().find(u=>u&&String(u.uid)===e.dataset.unitId).atk'))
  assert 'concorde' not in json.loads(await page.evaluate('(k)=>localStorage.getItem(k)',KEY))
  await page.screenshot(path=f'/tmp/ca-concorde-{label}-{faction}-plateau.png')
 assert not errors,errors
 assert not network,network
 await ctx.close();print(f'Concorde {label}: 5 factions, deux camps, pose, fiches, sort mortel, extinction et reprise hors réseau PASS',flush=True)

async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True,args=['--no-sandbox'])
  for label,vp,legacy,reduced,off in [
   ('desktop',{'width':1440,'height':1000},False,False,False),
   ('portrait',{'width':390,'height':844},False,True,False),
   ('landscape',{'width':844,'height':390},False,False,True),
   ('legacy',{'width':1366,'height':900},True,True,False)
  ]:await run(browser,label,vp,legacy,reduced,off)
  await browser.close()
if __name__=='__main__':asyncio.run(main())
