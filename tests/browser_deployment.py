"""Production hors ligne : sélection sans fiche, pose libre 3/2/1, quota et reprise."""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
KEY='couronnes_arcanes_bataille_v1'
async def run(browser,label,viewport):
    ctx=await browser.new_context(offline=True,viewport=viewport,has_touch=True)
    page=await ctx.new_page();errors=[];requests=[]
    page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:requests.append(r.url))
    await page.add_init_script('Date.now=()=>12345')
    await page.goto((ROOT/'JOUER.html').as_uri())
    await page.locator('[data-action="welcome-start"]').click()
    panel=page.locator('#hand-card-inspection')
    for step,col in enumerate([3,2,1]):
        ready=page.locator('.hand-card.hand-ready:has(.stat.atk)').first
        if not await ready.count():
            before_round=json.loads(await page.evaluate('(k)=>localStorage.getItem(k)',KEY))['round']
            await page.locator('[data-action="end-turn"]').click()
            await page.wait_for_function("([key,n])=>JSON.parse(localStorage.getItem(key))?.round>n",arg=[KEY,before_round])
            ready=page.locator('.hand-card.hand-ready:has(.stat.atk)').first
        before=await page.evaluate('(k)=>localStorage.getItem(k)',KEY)
        await ready.click() if label=='desktop' else await ready.tap()
        assert await panel.is_hidden(),(label,step,await panel.inner_text())
        await page.wait_for_timeout(220);assert await panel.is_hidden()
        assert await page.evaluate('(k)=>localStorage.getItem(k)',KEY)==before
        assert await page.locator('.battle-cell.available').count()>0
        assert await page.locator('.battle-cell.available:not([data-col="1"]):not([data-col="2"]):not([data-col="3"])').count()==0
        assert await page.locator('[data-action="deploy"][data-col="4"]').count()==0
        target=page.locator(f'[data-action="deploy"][data-lane="0"][data-col="{col}"]')
        if col==1:
            await target.focus();await page.keyboard.press('Enter')
        elif label=='desktop':await target.click()
        else:await target.tap()
        state=json.loads(await page.evaluate('(k)=>localStorage.getItem(k)',KEY))
        assert state['board'][0][col] is not None,(label,col,state['board'][0])
        assert state['heroes']['p']['cardsPlayed']<=2
        await page.mouse.move(1,1);await page.wait_for_timeout(220)
        if step==0:
            before_round=state['round']
            await page.locator('[data-action="end-turn"]').click()
            await page.wait_for_function("([key,n])=>JSON.parse(localStorage.getItem(key))?.round>n",arg=[KEY,before_round])
    assert state['heroes']['p']['cardsPlayed']==2
    spare=page.locator('.hand-card.hand-ready').first
    if await spare.count():
        before=await page.evaluate('(k)=>localStorage.getItem(k)',KEY)
        await spare.tap();assert await panel.is_hidden()
        assert await page.locator('.battle-cell.available').count()==0
        assert await page.evaluate('(k)=>localStorage.getItem(k)',KEY)==before
    await page.screenshot(path=f'/tmp/ca-deployment-{label}.png',full_page=False)
    snapshot=await page.evaluate('(k)=>localStorage.getItem(k)',KEY)
    await page.reload();assert await panel.is_hidden()
    assert await page.evaluate('(k)=>localStorage.getItem(k)',KEY)==snapshot
    assert not await page.evaluate("'battle' in window||'profile' in window")
    assert not any(r.startswith(('http:','https:')) for r in requests),requests
    assert not errors,errors
    await ctx.close();print(f'Pose {label}: cases 3/2/1, clic/toucher/clavier, aucune fiche après sélection, quota 2, reprise et hors ligne PASS')
async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True,args=['--no-sandbox'])
        for label,vp in [('desktop',{'width':1366,'height':900}),('mobile',{'width':390,'height':844}),('landscape',{'width':844,'height':390})]:await run(browser,label,vp)
        await browser.close()
if __name__=='__main__':asyncio.run(main())
