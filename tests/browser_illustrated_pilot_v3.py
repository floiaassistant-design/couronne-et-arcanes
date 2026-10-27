"""Arbalétrière complète : image exacte, compteur unique, fiche et pose."""
import asyncio
from playwright.async_api import async_playwright
from browser_class_skills_v28 import make_page

async def run(browser,label,viewport):
    errors=[]
    page=await make_page(browser,viewport,{},errors)
    await page.locator('[data-action="welcome-start"]').click()
    await page.evaluate("""()=>{
      battle=createBattle(profile,{id:'01',name:'Essai pilote',enemy:'Sentinelle',hp:80,difficulty:1,deck:[]},415);
      battle.heroes.e.deck=[];battle.heroes.e.hand=[];
      battle.heroes.p.hand=[{id:'archer',wait:0},{id:'archer',wait:1},{id:'archer',wait:2}];
      battle.heroes.p.cardsPlayed=0;render();
    }""")
    cards=page.locator('.hand .illustrated-pilot')
    assert await cards.count()==3
    assert await page.locator('.hand .illustrated-count').count()==3
    assert await page.locator('.hand .illustrated-pilot .cooldown-stamp').evaluate_all("els=>els.length===2 && els.every(el=>getComputedStyle(el).display==='none')")
    for i in range(3):
        assert await cards.nth(i).locator('.illustrated-count b').inner_text()==str(i)
        assert await cards.nth(i).locator('.illustrated-count').get_attribute('data-delay-kind')=='remaining'
        assert await cards.nth(i).locator('.card-head > span').inner_text()=='Aube'
    image=cards.first.locator('.creature-image')
    await image.evaluate('(el)=>el.decode()')
    assert await image.evaluate('(el)=>el.complete && el.naturalWidth===768 && el.naturalHeight===1152 && el.currentSrc.startsWith("data:image/webp;base64,")')
    assert await page.evaluate('selectedCard')==-1

    # Aucun bouton n'encombre le portrait : survol ou focus pour consulter.
    assert await page.locator('.hand .illustrated-inspect,[data-action="inspect-card"]').count()==0
    await page.keyboard.press('Tab')  # Reprendre la navigation après le rendu.
    await cards.first.focus()
    assert not await page.locator('#hand-card-inspection').is_hidden()
    assert 'Portée 2' in await page.locator('#hand-card-inspection').inner_text()
    assert await page.evaluate('selectedCard')==-1
    await cards.first.press('Escape')
    assert await page.locator('#hand-card-inspection').is_hidden()

    # Cliquer une carte en attente ne sélectionne rien et ne laisse aucune fiche.
    wait_click_y=await cards.nth(1).evaluate('(el)=>Math.min(35,Math.floor(el.getBoundingClientRect().height/2))')
    await cards.nth(1).click(position={'x':10,'y':wait_click_y})
    assert await page.evaluate('selectedCard')==-1
    assert await page.locator('#hand-card-inspection').is_hidden()

    # Sélection et déploiement depuis le même élément restent disponibles.
    # Le dock est plus bas en paysage : utiliser une zone visible de la carte,
    # et vérifier que la main ne recouvre pas le point où l'on clique.
    click_y=await cards.first.evaluate('(el)=>Math.min(35,Math.floor(el.getBoundingClientRect().height/2))')
    assert await cards.first.evaluate("""(el)=>{
      const r=el.getBoundingClientRect(),x=r.left+10,y=r.top+Math.min(35,Math.floor(r.height/2));
      return el.contains(document.elementFromPoint(x,y));
    }"""),'Carte masquée par une autre zone de la main'
    await cards.first.click(position={'x':10,'y':click_y})
    assert await page.evaluate('selectedCard')==0
    assert await page.locator('#hand-card-inspection').is_hidden()
    assert await page.evaluate('selectedCard')==0
    target=page.locator('[data-action="deploy"][data-col="1"][data-lane="0"]')
    await target.scroll_into_view_if_needed()
    await target.click()
    assert await page.evaluate('battle.board[0][1]?.id')=='archer'
    await page.evaluate("""()=>{
      screen='collection';profile.collection.archer=1;render();
    }""")
    version=page.locator('[data-collection-character="archer"] [data-current-version="true"]')
    pilot=version.locator('.illustrated-pilot')
    assert await pilot.count()==1
    assert await pilot.locator('.illustrated-count b').inner_text()=='1'
    assert await pilot.locator('.illustrated-count').get_attribute('data-delay-kind')=='base'
    assert 'Portée 2' in await pilot.locator('.card-detail').inner_text()
    assert await version.locator('[data-card-field="counter"] b').inner_text()=='1'
    assert await version.locator('[data-action="deck-add"]').count()==1
    assert not errors,errors
    await page.close()
    print('Pilote Illustrée '+label+': portrait, compteurs 0/1/2, fiche, sélection, pose et collection PASS')

async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True,args=['--no-sandbox'])
        for label,vp in [('desktop',{'width':1366,'height':900}),('mobile',{'width':390,'height':844}),('landscape',{'width':844,'height':390})]:
            await run(browser,label,vp)
        await browser.close()
if __name__=='__main__':asyncio.run(main())
