"""Production autonome : six portraits, vrais tours, VFX et interruptions, stockage isolé."""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]

async def run(browser,label,viewport):
    context=await browser.new_context(viewport=viewport)
    await context.set_offline(True)
    page=await context.new_page();errors=[];requests=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda r:requests.append(r.url))
    await page.goto((ROOT/'ESSAI_CARTES.html').as_uri())
    await page.evaluate("localStorage.clear()")
    await page.reload()
    assert await page.locator('.duel-card').count()==6
    assert await page.locator('.duel-card img').evaluate_all('els=>els.every(e=>e.complete&&e.naturalWidth===512&&e.naturalHeight===768)')
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth'),label
    # Pas d'API de test dans l'export livré ; tous les gestes sont ceux du joueur.
    assert not await page.evaluate("'battle' in window || 'profile' in window")
    await page.locator('[data-card="archer"]').click()
    assert 'deux cases' in await page.locator('#card-description').inner_text()
    await page.screenshot(path=f'/tmp/ca-card-study-{label}.png',full_page=True)
    await page.locator('#next').click()
    await page.wait_for_selector('.bolt')
    # Une capture pleine page peut redimensionner le viewport et interrompre les VFX.
    await page.screenshot(path=f'/tmp/ca-card-study-tir-{label}.png',full_page=False)
    await page.wait_for_selector('.slash')
    await page.wait_for_selector('.ring.healing',timeout=20000)
    await page.screenshot(path=f'/tmp/ca-card-study-soin-{label}.png',full_page=False)
    await page.wait_for_function("document.querySelector('#next').disabled===false")
    assert await page.locator('#turn').inner_text()=='2'
    assert await page.locator('.duel-card[data-card="shield"] .hp b').inner_text()=='6'
    assert await page.locator('.duel-card[data-card="cleric"] .hp b').inner_text()=='4'
    # Reprise de l'état autoritaire ; aucun VFX n'est sérialisé.
    saved=json.loads(await page.evaluate("localStorage.getItem('couronnes_arcanes_essai_cartes_v1')"))
    assert 'vfx' not in saved and saved['round']==2
    assert await page.evaluate("localStorage.getItem('couronnes_arcanes_v1')===null&&localStorage.getItem('couronnes_arcanes_bataille_v1')===null")
    await page.reload();assert await page.locator('#turn').inner_text()=='2'
    # Désactivation au milieu d'une attaque : état final affiché immédiatement.
    await page.locator('#next').click();await page.wait_for_selector('.fx')
    await page.locator('#toggle-fx').click()
    assert await page.locator('.fx').count()==0
    assert await page.locator('#turn').inner_text()=='3'
    await page.locator('#next').click();assert await page.locator('#turn').inner_text()=='4'
    assert await page.locator('.fx').count()==0
    # Chaque formation redémarre vraiment la fixture et conserve son nom après reprise.
    await page.select_option('#formation','assault')
    assert await page.locator('#turn').inner_text()=='1'
    await page.reload();assert await page.locator('#formation').input_value()=='assault'
    await page.emulate_media(reduced_motion='reduce')
    assert await page.locator('body').get_attribute('data-effects')=='false'
    await page.locator('#auto').click();await page.wait_for_timeout(500);await page.locator('#auto').click()
    assert await page.locator('.fx').count()==0
    assert int(await page.locator('#turn').inner_text())>=2
    await page.wait_for_timeout(500)
    frozen=await page.locator('#turn').inner_text();await page.wait_for_timeout(700)
    assert await page.locator('#turn').inner_text()==frozen
    # Le clavier permet aussi de sélectionner une carte.
    await page.locator('.duel-card').first.focus();await page.keyboard.press('Enter')
    assert await page.locator('#card-description').inner_text()
    assert not errors,errors
    assert not any(url.startswith(('http:','https:')) for url in requests),requests
    await context.close()
    print(f'Essai cartes {label}: portraits, tir/frappe/soin, vrais PV, reprise, interruptions et hors ligne PASS')

async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True,args=['--no-sandbox'])
        for label,viewport in [('desktop',{'width':1366,'height':900}),('mobile',{'width':390,'height':844}),('small',{'width':320,'height':740}),('landscape',{'width':844,'height':390})]:
            await run(browser,label,viewport)
        await browser.close()
if __name__=='__main__':asyncio.run(main())
