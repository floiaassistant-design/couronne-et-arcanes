"""Vraie collection : rangs projetés, deck, stockage, fonds et mise en page."""
import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[1]
SAVE='couronnes_arcanes_v1'

async def run(browser,label,viewport,url=None):
    context=await browser.new_context(viewport=viewport,offline=not bool(url),has_touch=label!='desktop',reduced_motion='reduce')
    page=await context.new_page();errors=[];external=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda r:external.append(r.url) if r.url.startswith(('http:','https:')) and not (url and r.url.startswith(url.rsplit('/',1)[0])) else None)
    await page.goto(url or (ROOT/'JOUER.html').as_uri())
    await page.locator('[data-action="welcome-guide"]').click()
    await page.locator('#nav [data-page="collection"]').click()
    assert await page.locator('body.collection-mode').count()==1
    assert await page.locator('[data-action="collection-faction"][data-id="aube"]').get_attribute('aria-pressed')=='true'
    row=page.locator('[data-collection-character="militia"]')
    assert await row.locator('td').count()==6
    assert await row.locator('[data-current-version="true"]').count()==1
    assert 'Possédée ×4' in await row.inner_text()
    assert await row.locator('[data-action="deck-add"]').count()==1
    assert await row.locator('[data-current-version="false"] .stat.atk b').all_inner_texts()==['—']*5
    await row.locator('.creature-image').first.evaluate('(e)=>e.decode()')
    # Le fond réellement embarqué est une image JPEG, décodable sans réseau.
    dimensions=await page.locator('.collection-hero').evaluate('''async e=>{
      const raw=getComputedStyle(e).getPropertyValue('--collection-scene').trim();
      const src=raw.slice(4,-1).replace(/^['"]|['"]$/g,'');
      const img=new Image();img.src=src;await img.decode();return [img.naturalWidth,img.naturalHeight];
    }''')
    assert dimensions==[1774,887],dimensions
    before=await page.evaluate('(k)=>localStorage.getItem(k)',SAVE)
    await row.locator('[data-collection-rarity="divine"] [data-action="collection-inspect"]').click()
    modal=page.locator('.collection-inspection')
    assert 'évolution est à concevoir' in await modal.inner_text()
    assert await modal.locator('[data-action="deck-add"]').count()==0
    await page.keyboard.press('Escape');assert await modal.count()==0
    assert await page.evaluate('(k)=>localStorage.getItem(k)',SAVE)==before
    # Les quatre Miliciens sont déjà dans le deck : retirer, reprendre, puis réajouter.
    await row.locator('[data-current-version="true"] [data-action="deck-remove"]').click()
    state=json.loads(await page.evaluate('(k)=>localStorage.getItem(k)',SAVE));assert len(state['deck'])==17
    await page.reload();await page.locator('#nav [data-page="collection"]').click()
    assert '17' in await page.locator('.deck-aside').inner_text()
    await page.locator('[data-collection-character="militia"] [data-current-version="true"] [data-action="deck-add"]').click()
    state=json.loads(await page.evaluate('(k)=>localStorage.getItem(k)',SAVE));assert len(state['deck'])==18
    # Un filtre ne touche ni la possession, ni le profil sauvegardé.
    before=await page.evaluate('(k)=>localStorage.getItem(k)',SAVE)
    await page.locator('#owned-only').check()
    assert await page.locator('[data-collection-character]').count()>0
    await page.locator('#owned-only').uncheck()
    await page.locator('[data-action="collection-faction"][data-id="sylve"]').click()
    assert await page.locator('[data-collection-character="wolf"]').count()==1
    await page.locator('[data-action="collection-faction"][data-id="sort"]').click()
    assert await page.locator('.collection-spells .unit-card').count()>0
    await page.locator('[data-action="collection-faction"][data-id="aube"]').click()
    assert await page.evaluate('(k)=>localStorage.getItem(k)',SAVE)==before
    geometry=await page.evaluate('''()=>({
      width:innerWidth,page:document.documentElement.scrollWidth,view:document.querySelector('#view').getBoundingClientRect().width,
      rows:[...document.querySelectorAll('[data-collection-character]')].map(r=>[...r.querySelectorAll('td')].map(e=>Math.round(e.getBoundingClientRect().top)))
    })''')
    assert geometry['page']<=geometry['width']+1,geometry
    assert abs(geometry['view']-geometry['width'])<2,geometry
    assert all(len(r)==6 and len(set(r))==1 for r in geometry['rows']),geometry
    scroll=page.locator('.collection-table-scroll')
    await scroll.evaluate('e=>e.scrollLeft=e.scrollWidth')
    last=await page.locator('[data-collection-character="militia"] td').last.bounding_box()
    assert last['x']+last['width']<=viewport['width']+1,last
    await scroll.evaluate('e=>e.scrollLeft=0')
    # Images manquantes : noms, valeurs et accès au deck restent disponibles.
    await page.locator('[data-collection-character="militia"] .creature-image').first.evaluate('e=>e.src="data:image/png;base64,broken"')
    assert await page.locator('[data-collection-character="militia"] .card-title').first.is_visible()
    assert await page.locator('[data-collection-character="militia"] [data-action="deck-add"]').is_visible()
    await page.locator('[data-collection-character="militia"] [data-current-version="true"] [data-action="collection-inspect"]').click()
    assert 'Un soldat loyal' in await page.locator('.collection-inspection').inner_text()
    await page.locator('.collection-inspection [data-action="close-modal"]').click()
    await page.locator('.collection-hero').scroll_into_view_if_needed()
    await page.screenshot(path=f'/tmp/ca-collection-{label}.png',full_page=False)
    await page.locator('#nav [data-page="home"]').click()
    assert await page.locator('body.collection-mode').count()==0
    # Les compositions restent prévisualisées sans mutation et confirmées avant application.
    await page.locator('#nav [data-page="collection"]').click()
    assert await page.locator('.deck-preset-card').count()==4
    before=await page.evaluate('(k)=>localStorage.getItem(k)',SAVE)
    await page.locator('[data-action="deck-preview"][data-id="assaut"]').click()
    assert await page.locator('.deck-preview-list>div').count()>0
    await page.locator('[data-action="close-modal"]').click()
    assert await page.evaluate('(k)=>localStorage.getItem(k)',SAVE)==before
    await page.locator('[data-action="deck-preview"][data-id="assaut"]').click()
    await page.locator('[data-action="deck-apply"][data-id="assaut"]').click()
    state=json.loads(await page.evaluate('(k)=>localStorage.getItem(k)',SAVE));assert len(state['deck'])==16
    await page.reload();await page.locator('#nav [data-page="collection"]').click()
    assert '16' in await page.locator('.deck-aside .stat-box').first.inner_text()
    await page.locator('#nav [data-page="campaign"]').click()
    await page.locator('[data-action="start-mission"][data-id="01"]').click()
    await page.locator('.combat-menu-link').click()
    await page.locator('#nav [data-page="collection"]').click()
    assert await page.locator('[data-action="deck-preview"][data-id="assaut"]').is_disabled()
    assert not errors,errors
    assert not external,external
    await context.close()
    print(f'Collection {label}: vrais exemplaires, six rangs, lecture sans mutation, deck/reprise, images absentes et largeur PASS')

async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True,args=['--no-sandbox'])
        for label,vp in [('desktop',{'width':1440,'height':1000}),('portrait',{'width':390,'height':844}),('landscape',{'width':844,'height':390})]:
            await run(browser,label,vp)
        if os.environ.get('CA_HTTP_URL'):
            await run(browser,'web',{'width':1366,'height':900},os.environ['CA_HTTP_URL'])
        await browser.close()

if __name__=='__main__':asyncio.run(main())
