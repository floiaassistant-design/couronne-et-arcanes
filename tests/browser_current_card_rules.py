"""Règles communes : fiches des cinq factions et relance d'un ancien combat en production."""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
from browser_class_skills_v28 import make_page
ROOT=Path(__file__).resolve().parents[1]
SAVE='couronnes_arcanes_v1'
BATTLE='couronnes_arcanes_bataille_v1'

async def run(browser,label,viewport):
    touch=label!='desktop';errors=[]
    page=await make_page(browser,viewport,{},errors,touch=touch)
    await page.locator('[data-action="welcome-guide"]').click()
    await page.locator('#nav [data-page="collection"]').click()
    before=await page.evaluate('JSON.stringify(profile)')
    popup=page.locator('#collection-hover-inspection')
    for card,rank in [('shield','commun'),('treant','rare'),('crypt','commun'),('golem','rare'),('sentinel','rare')]:
        faction={'shield':'aube','treant':'sylve','crypt':'ombre','golem':'forge','sentinel':'ether'}[card]
        await page.locator(f'[data-action="collection-faction"][data-id="{faction}"]').click()
        target=page.locator(f'[data-collection-character="{card}"] [data-collection-rarity="{rank}"] [data-collection-preview]')
        if touch:await target.tap()
        else:await target.hover()
        text=await popup.inner_text()
        assert 'entre l’attaquant et la couronne' in text,(card,text)
        assert 'historique' not in text,(card,text)
        if card!='crypt':assert 'ATQ effective' in text and 'sans Charge' in text
        box=await popup.bounding_box()
        assert box['x']>=0 and box['y']>=0 and box['x']+box['width']<=viewport['width']+1 and box['y']+box['height']<=viewport['height']+1,box
        if card=='shield':await page.screenshot(path=f'/tmp/ca-card-preview-regles-{label}.png')
        await page.keyboard.press('Escape')
    assert await page.evaluate('JSON.stringify(profile)')==before
    await page.locator('#nav [data-page="campaign"]').click()
    await page.locator('[data-action="start-mission"][data-id="01"]').click()
    saved=await page.evaluate('JSON.parse(JSON.stringify(window.__saves))')
    old=json.loads(saved[BATTLE]);old.pop('cardRules');saved[BATTLE]=json.dumps(old)
    # L'export officiel n'expose aucun des objets de diagnostic.
    await page.close()
    ctx=await browser.new_context(viewport=viewport,has_touch=touch,offline=True,reduced_motion='reduce')
    page=await ctx.new_page();network=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda r:network.append(r.url) if r.url.startswith(('http:','https:')) else None)
    await page.add_init_script('(' + '''saved=>{
      window.__saves={...saved};Object.defineProperty(window,'localStorage',{configurable:true,value:{
        getItem(k){return window.__saves[k]??null},setItem(k,v){window.__saves[k]=String(v)},removeItem(k){delete window.__saves[k]}
      }});
    }''' + ')(' + json.dumps(saved) + ')')
    await page.goto((ROOT/'JOUER.html').as_uri())
    assert await page.evaluate('typeof createBattle')=='undefined'
    modal=page.locator('.modal')
    assert 'Ce combat doit être relancé' in await modal.inner_text()
    assert await page.evaluate('window.__saves.couronnes_arcanes_v1')==saved[SAVE]
    assert await page.evaluate('window.__saves.couronnes_arcanes_bataille_v1')==saved[BATTLE]
    await page.screenshot(path=f'/tmp/ca-card-preview-mise-a-jour-{label}.png')
    await page.locator('[data-action="dismiss-battle-update"]').click()
    assert not await page.evaluate('Boolean(window.__saves.couronnes_arcanes_bataille_v1)')
    assert await page.evaluate('window.__saves.couronnes_arcanes_v1')==saved[SAVE]
    await page.locator('#nav [data-page="campaign"]').click()
    await page.locator('[data-action="start-mission"][data-id="01"]').click()
    await page.locator('[data-action="end-turn"]').click()
    await page.wait_for_function("JSON.parse(window.__saves.couronnes_arcanes_bataille_v1).round===2")
    current=await page.evaluate('window.__saves.couronnes_arcanes_bataille_v1')
    assert json.loads(current)['cardRules']=='cards-v2'
    # Conserver le véritable stockage modifié lors du rechargement de l'export.
    saved_now=await page.evaluate('JSON.parse(JSON.stringify(window.__saves))')
    await page.close();await ctx.close()
    ctx=await browser.new_context(viewport=viewport,offline=True,reduced_motion='reduce')
    page=await ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
    await page.add_init_script('(' + '''saved=>{
      window.__saves={...saved};Object.defineProperty(window,'localStorage',{configurable:true,value:{
        getItem(k){return window.__saves[k]??null},setItem(k,v){window.__saves[k]=String(v)},removeItem(k){delete window.__saves[k]}
      }});
    }''' + ')(' + json.dumps(saved_now) + ')')
    await page.goto((ROOT/'JOUER.html').as_uri())
    assert await page.locator('[data-action="dismiss-battle-update"]').count()==0
    assert await page.evaluate('window.__saves.couronnes_arcanes_bataille_v1')==current
    assert await page.evaluate('window.__saves.couronnes_arcanes_v1')==saved[SAVE]
    assert not errors,errors
    assert not network,network
    await ctx.close();print(f'Règles uniques {label}: cinq gardiens, fiches, relance sans pénalité, vrai tour et reprise hors réseau PASS')

async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True,args=['--no-sandbox'])
        for label,vp in [('desktop',{'width':1366,'height':900}),('mobile',{'width':390,'height':844}),('landscape',{'width':844,'height':390})]:await run(browser,label,vp)
        await browser.close()
if __name__=='__main__':asyncio.run(main())
