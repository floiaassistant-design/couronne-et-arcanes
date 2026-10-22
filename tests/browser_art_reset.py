"""Retrait des anciens visuels : décodage des repères, vraie pose et sauvegarde."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[1]

async def run(browser,label,viewport):
    context=await browser.new_context(viewport=viewport,offline=True,reduced_motion='reduce')
    page=await context.new_page();errors=[];external=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda r:external.append(r.url) if r.url.startswith(('http:','https:')) else None)
    await page.goto((ROOT/'tests/ESSAI_CARTES.test.html').as_uri())
    await page.evaluate('localStorage.clear()');await page.reload()
    await page.locator('[data-action="welcome-start"]').click()
    frame=page.locator('.arena-painted-frame')
    assert await frame.count()==1
    # Une carte Éther conserve le repli neutre ; les quatre autres ordres sont illustrés.
    await page.evaluate("()=>{battle.heroes.p.hand=[{id:'spark',wait:0}];render()}")
    image=page.locator('.hand .creature-image').first
    await image.evaluate('(el)=>el.decode()')
    assert await image.evaluate('(el)=>el.naturalWidth===384 && el.naturalHeight===576 && el.currentSrc.startsWith("data:image/svg+xml,")')
    await page.evaluate('''()=>{
      battle.heroes.p.hand=[{id:'militia',wait:0}];battle.heroes.p.cardsPlayed=0;
      persistBattle();render();
    }''')
    await page.locator('.hand-card').first.click()
    await page.locator('[data-action="deploy"][data-lane="0"][data-col="3"]').click()
    card=page.locator('.board-card').first
    art=card.locator('img');await art.evaluate('(el)=>el.decode()')
    assert await art.evaluate('(el)=>el.naturalWidth===768 && el.naturalHeight===1152 && el.currentSrc.startsWith("data:image/webp;base64,")')
    assert await page.evaluate('battle.board[0][3].id')=='militia'
    before=await page.evaluate('battle.round')
    await page.locator('[data-action="end-turn"]').click()
    # Les nouveaux tours alternés concluent la manche après les poses visibles de l'IA.
    await page.wait_for_function("([round])=>JSON.parse(localStorage.getItem('couronnes_arcanes_bataille_v1'))?.round>round",arg=[before])
    assert await page.evaluate('battle.round')==before+1
    assert await page.locator('.battle-vfx-overlay,.unit-sprite-player').count()==0
    assert await page.evaluate("document.getAnimations().every(a=>!String(a.animationName||'').startsWith('creature-'))")
    await page.reload()
    assert await page.evaluate('battle.round')==before+1
    assert await page.locator('.board-card').count()>0
    assert not errors,errors
    assert not external,external
    await page.screenshot(path=f'/tmp/ca-card-study-reset-{label}.png',full_page=False)
    await context.close()
    print(f'Base neuve {label}: repères décodés, vraie pose, tour, reprise et aucun ancien effet ni réseau PASS')

async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True,args=['--no-sandbox'])
        for label,vp in [('desktop',{'width':1366,'height':900}),('mobile',{'width':390,'height':844}),('landscape',{'width':844,'height':390})]:
            await run(browser,label,vp)
        await browser.close()

if __name__=='__main__':asyncio.run(main())
