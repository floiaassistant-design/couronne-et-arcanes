"""Cinq portraits approuvés : collection, main, déploiement et export sans réseau."""
import asyncio
import base64
import json
from playwright.async_api import async_playwright
from browser_class_skills_v28 import make_page, ROOT

ASSETS=json.loads((ROOT/'assets/creatures/portraits-aube.json').read_text())['assets']

async def check_image(image,asset):
    await image.scroll_into_view_if_needed()
    await image.evaluate('(el)=>el.decode()')
    assert await image.evaluate('(el)=>[el.naturalWidth,el.naturalHeight]')==[512,768]
    expected='data:image/webp;base64,'+base64.b64encode((ROOT/asset['target']).read_bytes()).decode()
    assert await image.get_attribute('src')==expected,asset['gameCardId']

async def run(browser,label,viewport):
    errors=[]
    page=await make_page(browser,viewport,{},errors,touch=label!='desktop')
    await page.locator('[data-action="welcome-start"]').click()
    await page.evaluate('''ids=>{
      battle.heroes.p.hand=ids.map((id,i)=>({id,wait:i%3}));
      persistBattle();render();
    }''',[a['gameCardId'] for a in ASSETS])
    cards=page.locator('.hand .hand-card')
    assert await cards.count()==5
    for i,asset in enumerate(ASSETS):
        card=cards.nth(i)
        await check_image(card.locator('.creature-image'),asset)
        assert await card.locator('.stat.cd b').inner_text()==str(i%3)
    assert await page.locator('.hand .illustrated-pilot').count()==0
    await page.mouse.move(0,0)
    await page.screenshot(path=f'/tmp/ca-aube-main-{label}.png',full_page=True)

    # Le nouveau portrait ne change ni les gestes ni l'identité de l'unité déployée.
    await cards.nth(1).scroll_into_view_if_needed()
    await cards.nth(1).click(position={'x':10,'y':20})
    assert await page.evaluate('selectedCard')==-1
    assert 'Porte-égide' in await page.locator('#hand-card-inspection').inner_text()
    await page.locator('[data-action="close-inspection"]').click()
    await cards.first.scroll_into_view_if_needed()
    await cards.first.click(position={'x':10,'y':20})
    await page.locator('[data-action="close-inspection"]').click()
    target=page.locator('[data-action="deploy"][data-lane="0"]')
    await target.scroll_into_view_if_needed();await target.click()
    assert await page.evaluate('battle.board[0][1].id')=='militia'
    assert (await page.locator('.unit-on-board.ally .sprite-figure').first.get_attribute('src')).startswith('data:image/svg+xml,')
    await page.evaluate("screen='collection';render()")
    for asset in ASSETS:
        card=page.locator('.card-grid .unit-card').filter(has=page.locator(f'[data-action="deck-add"][data-id="{asset["gameCardId"]}"]'))
        await check_image(card.locator('.creature-image'),asset)
    assert not errors,errors
    await page.close()
    print(f'Lot Aube {label}: cinq portraits, compteurs, fiche, pose et collection PASS')

async def offline(browser):
    context=await browser.new_context(viewport={'width':844,'height':390},offline=True,reduced_motion='reduce')
    page=await context.new_page();requests=[];errors=[]
    page.on('request',lambda req:requests.append(req.url))
    page.on('pageerror',lambda err:errors.append(str(err)))
    await page.goto((ROOT/'JOUER.html').as_uri())
    await page.locator('[data-action="welcome-guide"]').click()
    await page.locator('[data-action="nav"][data-page="collection"]').click()
    for asset in ASSETS:
        card=page.locator('.card-grid .unit-card').filter(has=page.locator(f'[data-action="deck-add"][data-id="{asset["gameCardId"]}"]'))
        await check_image(card.locator('.creature-image'),asset)
    await page.reload()
    await page.locator('[data-action="nav"][data-page="collection"]').click()
    await check_image(page.locator('.card-grid .unit-card').filter(has=page.locator('[data-action="deck-add"][data-id="militia"]')).locator('.creature-image'),ASSETS[0])
    assert not any(url.startswith(('http:','https:')) for url in requests),requests
    assert not errors,errors
    await context.close()
    print('Lot Aube autonome: cinq portraits sans réseau, mouvement réduit et rechargement PASS')

async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True,args=['--no-sandbox'])
        for label,vp in [('desktop',{'width':1366,'height':900}),('mobile',{'width':390,'height':844}),('landscape',{'width':844,'height':390})]:
            await run(browser,label,vp)
        await offline(browser)
        await browser.close()

if __name__=='__main__':asyncio.run(main())
