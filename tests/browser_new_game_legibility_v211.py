"""Nouvelle partie, classes, étiquettes du plateau et restauration : desktop/mobile hors ligne."""
import asyncio
from playwright.async_api import async_playwright
from browser_class_skills_v28 import make_page

async def run(browser,label,viewport):
    errors=[]
    page=await make_page(browser,viewport,{},errors)
    await page.locator('[data-action="welcome-start"]').click()
    await page.evaluate("""() => {profile.gold=789;profile.wins=3;save();persistBattle();}""")
    await page.locator('#nav [data-action="nav"][data-page="home"]').click()
    await page.locator('[data-action="new-game"]').click()
    assert await page.locator('[data-action="new-game-select"]').count()==4
    await page.locator('[data-action="new-game-select"][data-id="arcaniste"]').click()
    await page.locator('[data-action="confirm-new-game"]').click()
    state=await page.evaluate("() => ({hero:profile.heroClass,gold:profile.gold,wins:profile.wins,active:Boolean(battle)})")
    assert state=={'hero':'arcaniste','gold':110,'wins':0,'active':False},state
    assert await page.locator('[data-action="restore-previous-game"]').count()==1

    await page.locator('[data-action="start-next"]').click()
    await page.locator('[data-action="toggle-animations"]').click()
    await page.emulate_media(reduced_motion='reduce')
    await page.evaluate("""() => {
      const unit=(id,side,uid)=>({uid,id,side,atk:4,hp:9,maxhp:9,armor:0,
        ranged:false,ability:'',stun:0,poison:0,poisonTurns:0});
      battle.board[0][1]=unit('paladin','p',801);
      battle.board[0][10]=unit('lich','e',802);
      battle.heroes.p.hand=[{id:'paladin',wait:0},{id:'lich',wait:1}];
      persistBattle();render();
    }""")
    assert await page.locator('.unit-on-board[data-owner="p"][data-rarity="épique"]').count()==1
    assert await page.locator('.unit-on-board[data-owner="e"][data-rarity="légendaire"]').count()==1
    assert await page.locator('.unit-on-board.ally .board-owner').inner_text()=='VOUS'
    assert await page.locator('.unit-on-board.enemy .board-owner').inner_text()=='ENNEMI'
    assert await page.locator('.unit-on-board.ally .board-faction').inner_text()=='Aube'
    assert await page.locator('.unit-on-board.enemy .board-faction').inner_text()=='Ombre'
    assert 'ÉPIQUE' in await page.locator('.hand .card-quality-tag').first.inner_text()
    assert 'LÉGENDAIRE' in await page.locator('.hand .card-quality-tag').last.inner_text()
    colors=await page.evaluate("""() => [...document.querySelectorAll('.hand .unit-card')].map(e=>getComputedStyle(e).borderTopColor)""")
    assert colors[0]!=colors[1],colors
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')

    # Rechargement complet du HTML autonome, sans réseau, puis retour à l'ancienne sauvegarde.
    saved=await page.evaluate('() => ({...window.__saves})')
    await page.close()
    page=await make_page(browser,viewport,saved,errors)
    assert await page.evaluate('profile.heroClass')=='arcaniste'
    assert await page.locator('.unit-on-board.enemy .board-owner').inner_text()=='ENNEMI'
    await page.locator('#nav [data-action="nav"][data-page="home"]').click()
    await page.locator('[data-action="restore-previous-game"]').click()
    await page.locator('[data-action="confirm-restore-previous-game"]').click()
    restored=await page.evaluate("() => ({hero:profile.heroClass,gold:profile.gold,wins:profile.wins,active:!!battle,mission:battle?.missionId})")
    assert restored=={'hero':'gardien','gold':789,'wins':3,'active':True,'mission':'01'},restored
    assert await page.locator('.battle-grid').count()==1
    assert not errors,errors
    await page.close()
    print(f'UX nouvelle aventure, visibilité, animations off, reprise {label} : PASS')

async def main():
    async with async_playwright() as playwright:
        browser=await playwright.chromium.launch(headless=True,args=['--no-sandbox'])
        for label,viewport in [('desktop',{'width':1366,'height':900}),('mobile',{'width':390,'height':844})]:
            await run(browser,label,viewport)
        await browser.close()

if __name__=='__main__':
    asyncio.run(main())
