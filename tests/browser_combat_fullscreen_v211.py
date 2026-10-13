"""Combat immersif : HUD, arène dominante, main fixe en bas et sauvegardes."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
from browser_class_skills_v28 import make_page

ROOT=Path(__file__).resolve().parents[1]

async def run(browser,name,viewport):
 errors=[]
 page=await make_page(browser,viewport,{},errors)
 await page.locator('[data-action="welcome-start"]').click()
 shell=page.locator('.combat-screen')
 dock=page.locator('.combat-hand-dock')
 stage=page.locator('.combat-stage')
 hand=page.locator('.combat-hand-dock .hand')
 assert await shell.is_visible()
 assert await dock.is_visible()
 assert await page.locator('.topbar').is_hidden()
 assert await page.locator('.main-nav').is_hidden()
 assert await page.locator('.combat-titlebar').is_visible()
 assert await page.locator('.combat-menu-link').is_visible()
 assert await page.locator('.combat-hand-dock [data-action="end-turn"]').is_visible()
 assert await page.locator('.combat-hand-dock [data-action="hero-power"]').is_visible()
 assert await page.locator('.combat-hand-dock [data-action="retreat"]').is_visible()
 assert await page.locator('.combat-hand-dock .hand .unit-card').count()>0
 rect=await dock.bounding_box()
 board=await stage.bounding_box()
 screen=await shell.bounding_box()
 assert rect and board and screen
 assert board['y']<rect['y']<rect['y']+rect['height']<=viewport['height']+2,(rect,board)
 assert abs(screen['height']-viewport['height'])<3,screen
 assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
 await page.screenshot(path=f'/tmp/ca-combat-{name}.png',full_page=True)

 # Les deux défilements sont indépendants et maintenus lorsque le DOM est reconstruit.
 await page.evaluate("""() => {
  document.querySelector('.battle-grid').scrollLeft=9999;
  document.querySelector('.combat-hand-dock .hand').scrollLeft=9999;
 }""")
 before=await page.evaluate("""() => ({
  board:document.querySelector('.battle-grid').scrollLeft,
  hand:document.querySelector('.combat-hand-dock .hand').scrollLeft
 })""")
 await page.locator('[data-action="toggle-animations"]').click()
 after=await page.evaluate("""() => ({
  board:document.querySelector('.battle-grid').scrollLeft,
  hand:document.querySelector('.combat-hand-dock .hand').scrollLeft
 })""")
 assert before==after,(name,before,after)

 # Quitter la vue de combat n'abandonne pas la partie ; le bouton en haut rétablit la navigation.
 await page.locator('.combat-menu-link').click()
 assert await page.locator('.combat-screen').count()==0
 await page.locator('#nav [data-action="nav"][data-page="battle"]').click()
 assert await page.locator('.combat-screen').count()==1
 assert await page.locator('.battle-cell').count()==20

 # La main reste jouable et la pose se fait uniquement sur une ligne active.
 await page.locator('.combat-hand-dock .hand [data-action="select-card"]:not(.on-cooldown)').first.click()
 await page.locator('[data-action="deploy"][data-lane="0"]').click()
 assert await page.evaluate('battle.board[0][1]?.id') is not None
 await page.locator('.combat-hand-dock [data-action="end-turn"]').click()
 assert await page.locator('.turn-n').inner_text()=='2'
 # Le harnais teste un document injecté en about:blank : reconstituer la page à partir
 # de la sauvegarde simulée, plutôt que recharger about:blank sans contenu.
 saved=await page.evaluate('() => ({...window.__saves})')
 await page.close()
 page=await make_page(browser,viewport,saved,errors)
 assert await page.locator('.combat-screen').count()==1
 assert await page.locator('.turn-n').inner_text()=='2'

 # Les anciennes batailles réaffichent exactement leurs cases en conservant le dock.
 await page.evaluate("""() => {
  battle=createBattle(profile,{id:'01',name:'Sauvegarde historique',enemy:'Sentinelle',
    hp:80,difficulty:1,deck:[]},29,{legacy:true});
  render();
 }""")
 assert await page.locator('.battle-cell').count()==15
 assert await page.locator('.combat-hand-dock').is_visible()
 assert not errors,errors
 await page.close()
 print(f'Combat plein écran {name}: HUD, arène, main, navigation, reprise et ancien plateau PASS')

async def offline(browser):
 context=await browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
 page=await context.new_page()
 requests=[]
 page.on('request',lambda req:requests.append(req.url))
 await page.goto((ROOT/'JOUER.html').as_uri())
 await page.locator('[data-action="welcome-start"]').click()
 assert await page.locator('.combat-screen').count()==1
 assert await page.locator('.combat-hand-dock .hand [data-action="select-card"]').count()>0
 assert not any(url.startswith(('http:','https:')) for url in requests),requests
 await context.close()
 print('Combat plein écran autonome hors réseau : PASS')

async def main():
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(headless=True,args=['--no-sandbox'])
  for name,viewport in [('desktop',{'width':1366,'height':900}),
                        ('mobile',{'width':390,'height':844}),
                        ('landscape',{'width':844,'height':390})]:
   await run(browser,name,viewport)
  await offline(browser)
  await browser.close()

if __name__=='__main__':asyncio.run(main())
