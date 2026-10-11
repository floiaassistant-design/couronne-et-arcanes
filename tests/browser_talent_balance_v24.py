"""V2.4 browser regression: talent labels and single-use draw with simulated storage."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
async def verify(browser,width,height):
    page=await browser.new_page(viewport={'width':width,'height':height})
    errors=[]
    page.on('pageerror', lambda e:errors.append(str(e)))
    await page.set_content((ROOT/'tests/JOUER.test.html').read_text(encoding='utf-8'),wait_until='load')
    await page.locator('[data-action="welcome-guide"]').click()
    await page.locator('[data-action="nav"][data-page="forge"]').click()
    await page.evaluate('''() => {profile.heroXp=HERO_LEVEL_THRESHOLD(8); profile.heroClass='rodeur'; save(); render()}''')
    assert await page.locator('.talent-node').count()==4
    text=await page.locator('.talents-section').inner_text()
    assert 'une fois par combat' in text.lower(),text[:400]
    if width>900: await page.locator('.talents-section').screenshot(path=str(ROOT/'apercu_equilibrage_talents_V2.4.png'))
    await page.locator('[data-action="choose-talent"][data-id="rodeur_poursuite"]').click()
    await page.locator('[data-action="choose-talent"][data-id="rodeur_precision"]').click()
    await page.locator('[data-action="nav"][data-page="campaign"]').click()
    await page.locator('[data-action="start-mission"][data-id="01"]').click()
    assert 'disponible' in await page.locator('.talent-once-status').inner_text()
    state=await page.evaluate('''() => {
      const b=battle;
      const hp=b.heroes.p.hand.length;
      const a=usePower(b);
      render();
      const status=document.querySelector('.talent-once-status')?.textContent;
      b.powerCooldown=0;
      const second=usePower(b);
      return {hp,after:b.heroes.p.hand.length,used:b.talentDrawUsed,status,first:a.ok,second:second.ok};
    }''')
    assert state['first'] and state['second'] and state['used'] and state['after']==state['hp']+1,state
    assert 'utilisée' in state['status'],state
    assert not errors,errors
    print(f'V2.4 {width}x{height}: talent tooltip, reserve one-shot and UI PASS')
    await page.close()
async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        await verify(browser,1440,900)
        await verify(browser,390,844)
        await browser.close()
if __name__=='__main__': asyncio.run(main())
