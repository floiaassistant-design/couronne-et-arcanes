"""Fiche universelle : versions réelles, contextes, toucher et absence de mutation."""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]

async def contained(page,panel):
    box=await panel.bounding_box();vp=page.viewport_size
    assert box['x']>=11 and box['y']>=11 and box['x']+box['width']<=vp['width']-11 and box['y']+box['height']<=vp['height']-11,box

async def run(browser,label,viewport):
    touch=label!='desktop'
    ctx=await browser.new_context(viewport=viewport,has_touch=touch,offline=True,reduced_motion='reduce')
    page=await ctx.new_page();errors=[];network=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda r:network.append(r.url) if r.url.startswith(('http:','https:')) else None)
    await page.goto((ROOT/'tests/JOUER.test.html').as_uri())
    await page.locator('[data-action="welcome-guide"]').click()
    popup=page.locator('#collection-hover-inspection')
    async def inspect(target):
        if touch:await target.tap()
        else:await target.hover()
    # Les mêmes éléments de lecture couvrent Collection, deck et Atelier/Alchimie.
    await page.locator('#nav [data-page="collection"]').click()
    before=await page.evaluate('JSON.stringify(profile)')
    future=page.locator('[data-collection-character="militia"] [data-collection-rarity="éveillée"] [data-collection-preview]')
    await inspect(future)
    assert 'ATQ 2 / PV 8' in await popup.inner_text()
    assert 'Dernier Rempart' in await popup.inner_text()
    assert 'Ascension requise' in await popup.inner_text()
    await contained(page,popup)
    await popup.locator('.inspection-description p').last.scroll_into_view_if_needed()
    assert await popup.locator('.inspection-description p').last.is_visible()
    await page.screenshot(path=f'/tmp/ca-universal-{label}-collection.png')
    await page.keyboard.press('Escape')
    for target in [page.locator('.deck-item [data-card-preview]').first]:
        await inspect(target);assert 'DECK' in await popup.inner_text();await contained(page,popup)
        await page.keyboard.press('Escape')
    assert await page.evaluate('JSON.stringify(profile)')==before
    for screen,title in [('forge','ATELIER'),('alchemy','ALCHIMIE')]:
        await page.locator(f'#nav [data-page="{screen}"]').click()
        card=page.locator('.unit-card[data-card-preview]').first
        await inspect(card);assert title in await popup.inner_text();await contained(page,popup)
        await page.keyboard.press('Escape')
        assert await page.evaluate('JSON.stringify(profile)')==before
    # Le paquet ouvre une vraie modale ; sa consultation ne dépense rien de plus.
    await page.evaluate("()=>{profile.gold=1000;screen='forge';render();}")
    await page.locator('[data-action="buy-pack"]').click()
    after_pack=await page.evaluate('JSON.stringify(profile)')
    await inspect(page.locator('.modal .unit-card[data-card-preview]').first)
    assert 'PAQUET' in await popup.inner_text();await contained(page,popup)
    assert await page.evaluate('JSON.stringify(profile)')==after_pack
    if touch:
        sheet=await popup.inner_text()
        await page.locator('.modal [data-card-preview]').nth(1).evaluate("el=>el.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}))")
        assert await popup.get_attribute('data-input')=='touch'
        assert await popup.inner_text()==sheet
        await popup.locator('[data-action="close-inspection"]').tap()
    else:await page.keyboard.press('Escape')
    assert await popup.is_hidden()
    await page.locator('[data-action="close-modal"]').click()
    # Laboratoire : paramètres choisis par la vraie UI, preview et unités cohérents.
    saved=await page.evaluate('JSON.stringify(localStorage)')
    await page.locator('#nav [data-page="developer"]').click()
    await page.locator('[data-lab-field="cardId"]').select_option('shield')
    await page.locator('[data-lab-field="rarity"]').select_option('éveillée')
    await page.locator('[data-lab-field="level"]').select_option('0')
    await inspect(page.locator('.lab-card-preview'))
    assert 'ATQ 2 / PV 13' in await popup.inner_text()
    assert 'toutes les lignes' in await popup.inner_text()
    await page.keyboard.press('Escape')
    await page.locator('[data-lab-field="side"]').select_option('e')
    await page.locator('[data-lab-field="cardId"]').select_option('lancer')
    await page.locator('[data-lab-field="rarity"]').select_option('divine')
    await page.locator('[data-lab-field="level"]').select_option('1')
    await page.locator('[data-action="lab-start"]').click()
    await page.evaluate("()=>{battle.heroes.p.hand=[{id:'shield',wait:0}];selectedCard=-1;render();}")
    hand=page.locator('.hand-card').first;panel=page.locator('#hand-card-inspection')
    state=await page.evaluate('JSON.stringify({battle,profile,selectedCard})')
    await inspect(hand)
    assert 'ATQ 2 / PV 13' in await panel.inner_text()
    assert 'ATQ effective' in await panel.inner_text()
    assert await hand.get_attribute('data-rarity')=='éveillée'
    assert await page.evaluate('JSON.stringify({battle,profile,selectedCard})')==state
    if touch:await hand.tap()
    else:await hand.click()
    assert await page.evaluate('selectedCard')==0
    assert await panel.is_hidden()
    await page.locator('[data-action="deploy"][data-lane="0"][data-col="3"]').click()
    await page.wait_for_function("!document.querySelector('.combat-playing')")
    await page.evaluate("""()=>{
      battle.phase='enemy';battle.heroes.e.hand=[{id:'lancer',wait:0}];playEnemyCard(battle);
      battle.phase='player';battle.heroes.p.cardsPlayed=0;selectedCard=-1;render();
    }""")
    ally=page.locator('.board-card[data-side="p"]');enemy=page.locator('.board-card[data-side="e"]')
    for card,rarity,expected in [(ally,'éveillée','toutes les lignes'),(enemy,'divine','+3 ATQ')]:
        await inspect(card);assert await card.get_attribute('data-rarity')==rarity
        assert await card.locator('xpath=..').get_attribute('data-rarity')==rarity
        assert expected in await panel.inner_text();await contained(page,panel)
        await page.keyboard.press('Escape')
    # Consulter une unité occupée ne doit jamais déclencher la pose sélectionnée.
    await page.evaluate("()=>{battle.heroes.p.hand=[{id:'militia',wait:0}];selectedCard=0;render();}")
    state=await page.evaluate('JSON.stringify({battle,selectedCard})')
    if touch:await ally.tap()
    else:await ally.click()
    assert await page.evaluate('JSON.stringify({battle,selectedCard})')==state
    await page.keyboard.press('Escape')
    await page.screenshot(path=f'/tmp/ca-universal-{label}-battle.png')
    await page.locator('[data-action="lab-back"]').first.click()
    await page.locator('[data-action="lab-exit"]').click()
    assert await page.evaluate('JSON.stringify(localStorage)')==saved
    # Fixture de résultat pour vérifier le nom de la carte gagnée et sa fiche.
    await page.evaluate("""()=>{
      startMission('01');battle.status='victory';battle.phase='finished';battle.heroes.e.hp=0;settle();
    }""")
    receipt=await page.evaluate('JSON.stringify(profile)')
    await inspect(page.locator('.modal [data-preview-context="reward"]').first)
    assert 'RÉCOMPENSE' in await popup.inner_text();await contained(page,popup)
    assert await page.evaluate('JSON.stringify(profile)')==receipt
    assert not errors,errors
    assert not network,network
    await ctx.close();print(f'Fiche universelle {label}: Collection, deck, Atelier, Alchimie, paquet, labo, deux camps et toucher sans pose PASS')

async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True,args=['--no-sandbox'])
        for label,vp in [('desktop',{'width':1366,'height':900}),('mobile',{'width':390,'height':844}),('landscape',{'width':844,'height':390})]:await run(browser,label,vp)
        await browser.close()
if __name__=='__main__':asyncio.run(main())
