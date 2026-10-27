"""Construire un vrai deck depuis l'interface, le reprendre et jouer avec lui."""
import asyncio,json,os
from collections import Counter
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[1]
SAVE='couronnes_arcanes_v1'

async def run_manual_deck(browser,label,viewport,url=None):
    touch=label in ('portrait','landscape')
    context=await browser.new_context(viewport=viewport,offline=not bool(url),has_touch=touch,reduced_motion='reduce')
    page=await context.new_page();errors=[];external=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda r:external.append(r.url) if r.url.startswith(('http:','https:')) and not (url and r.url.startswith(url.rsplit('/',1)[0])) else None)
    async def click(locator):
        if touch:await locator.tap()
        else:await locator.click()
    async def saved():return json.loads(await page.evaluate('(k)=>localStorage.getItem(k)',SAVE))
    await page.goto(url or (ROOT/'JOUER.html').as_uri())
    await click(page.locator('[data-action="welcome-guide"]'))
    baseline=await saved()
    await click(page.locator('#nav [data-page="collection"]'))
    await click(page.locator('.collection-hero [data-page="deck"]'))
    assert await page.locator('#manual-deck-title').inner_text()=='Mon deck'
    assert not await page.locator('.manual-deck-help').get_attribute('open')
    assert '18' in await page.locator('.manual-deck-count strong').inner_text()
    query=page.locator('[data-deck-field="query"]')
    await query.fill('eclaireuse')
    assert await page.locator('.manual-card-entry').count()==1
    ranger=page.locator('.manual-card-entry[data-deck-card="ranger"]')
    assert await ranger.locator('[data-action="deck-add"]').is_disabled()
    await click(ranger.locator('[data-action="deck-remove"]'))
    assert Counter((await saved())['deck'])['ranger']==1
    assert await query.evaluate('(e)=>document.activeElement===e') is False
    await click(ranger.locator('[data-action="deck-add"]'))
    assert Counter((await saved())['deck'])==Counter(baseline['deck'])
    await query.fill('Milicien')
    await query.press('End');await query.press_sequentially('zzz')
    assert await query.input_value()=='Milicienzzz',(await query.input_value(),await query.evaluate('(e)=>[document.activeElement===e,e.selectionStart,e.selectionEnd]'))
    assert await query.evaluate('(e)=>document.activeElement===e&&e.selectionStart===e.value.length')
    assert await page.locator('.manual-card-entry').count()==0
    await query.fill('')
    await page.locator('[data-deck-field="faction"]').select_option('aube')
    assert await page.locator('.manual-card-entry').count()==3
    assert await page.locator('.manual-card-entry [data-rarity="divine"]').count()==0
    await page.locator('[data-deck-field="faction"]').select_option('all')
    await page.locator('[data-deck-field="type"]').select_option('sort')
    assert await page.locator('.manual-card-entry').count()==2
    assert (await saved())['collection']==baseline['collection']
    await page.locator('[data-deck-field="type"]').select_option('all')
    # Les suggestions gardent une prévisualisation et une confirmation distinctes.
    await click(page.locator('.manual-deck-help > summary'))
    before=(await saved())['deck']
    await click(page.locator('[data-action="deck-preview"][data-id="assaut"]'))
    await click(page.locator('[data-action="close-modal"]'))
    assert (await saved())['deck']==before
    await click(page.locator('[data-action="deck-clear"]'))
    await click(page.locator('[data-action="close-modal"]'))
    assert (await saved())['deck']==before
    await click(page.locator('[data-action="deck-clear"]'))
    await click(page.locator('[data-action="deck-clear-confirm"]'))
    assert (await saved())['deck']==[]
    assert await page.locator('.manual-deck-aside [data-page="campaign"]').is_disabled()
    await click(page.locator('#nav [data-page="campaign"]'))
    await click(page.locator('[data-action="start-mission"][data-id="01"]'))
    assert await page.locator('#manual-deck-title').is_visible()
    assert await page.evaluate("localStorage.getItem('couronnes_arcanes_bataille_v1')") is None
    wanted={'militia':4,'shield':2,'archer':2,'firebolt':2,'healing':2}
    for card_id,count in wanted.items():
        for _ in range(count):
            await click(page.locator(f'.manual-card-entry[data-deck-card="{card_id}"] [data-action="deck-add"]'))
    current=await saved()
    assert Counter(current['deck'])==Counter(wanted)
    assert {k:v for k,v in current.items() if k!='deck'}=={k:v for k,v in baseline.items() if k!='deck'}
    assert 'Deck prêt au combat' in await page.locator('.manual-deck-aside').inner_text()
    # Lecture de la carte : aucune sélection/écriture et même fiche universelle.
    card=page.locator('.manual-card-entry[data-deck-card="militia"] .unit-card')
    if touch:await card.tap()
    else:await card.hover()
    await page.locator('#collection-hover-inspection:not([hidden])').wait_for()
    assert (await saved())==current
    await page.keyboard.press('Escape')
    await page.locator('#toast.show').wait_for(state='detached')
    await page.evaluate("window.scrollTo({top:0,behavior:'instant'})")
    await page.screenshot(path=f'/tmp/ca-manual-deck-{label}.png')
    await page.locator('.manual-card-library').scroll_into_view_if_needed()
    await page.screenshot(path=f'/tmp/ca-manual-deck-library-{label}.png')
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    for button in await page.locator('.manual-card-entry .manual-card-controls button').all():
        box=await button.bounding_box();assert box['width']>=44 and box['height']>=44
    await page.reload()
    await click(page.locator('#nav [data-page="deck"]'))
    assert Counter((await saved())['deck'])==Counter(wanted)
    await click(page.locator('.manual-deck-aside [data-page="campaign"]'))
    await click(page.locator('[data-action="start-mission"][data-id="01"]'))
    battle=json.loads(await page.evaluate("localStorage.getItem('couronnes_arcanes_bataille_v1')"))
    assert Counter(battle['heroes']['p']['deck']+[c['id'] for c in battle['heroes']['p']['hand']])==Counter(wanted)
    await click(page.locator('.combat-menu-link'))
    await click(page.locator('#nav [data-page="deck"]'))
    assert await page.locator('.manual-deck-screen [data-action="deck-add"]:not(:disabled)').count()==0
    assert await page.locator('[data-action="deck-clear"]').is_disabled()
    assert (await saved())['deck']==current['deck']
    assert not errors,errors
    assert not external,external
    await context.close()
    print(f'Deck manuel {label}: recherche/filtres, quantités, création, sauvegarde, vraie mission et verrou PASS')

async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True,args=['--no-sandbox'])
        for label,vp in [('desktop',{'width':1440,'height':1000}),('portrait',{'width':390,'height':844}),('landscape',{'width':844,'height':390})]:
            await run_manual_deck(browser,label,vp)
        if os.environ.get('CA_HTTP_URL'):await run_manual_deck(browser,'web',{'width':1366,'height':900},os.environ['CA_HTTP_URL'])
        await browser.close()

if __name__=='__main__':asyncio.run(main())
