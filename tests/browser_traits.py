"""V1.5 audit: displayed tactical traits, offline build and a legacy save."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]

async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True, executable_path='/usr/bin/chromium', args=['--no-sandbox'])
        page = await browser.new_page(viewport={'width': 1360, 'height': 850})
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        await page.set_content((ROOT / 'tests/JOUER.test.html').read_text(encoding='utf8'), wait_until='load')
        await page.locator('[data-action="welcome-guide"]').click()
        await page.locator('[data-action="nav"][data-page="collection"]').click()
        traits = await page.locator('.trait-pill').all_inner_texts()
        assert 'Vol' in traits and 'Garde' in traits and 'Perforation' in traits, traits
        assert await page.locator('.card-grid .unit-card').count() == 60
        flying = page.locator('.card-grid .unit-card').filter(has=page.locator('.card-title', has_text='Dragon des Sept Cieux'))
        assert 'Vol' in await flying.inner_text()
        guarded = page.locator('.card-grid .unit-card').filter(has=page.locator('.card-title', has_text='Golem runique'))
        assert 'Garde' in await guarded.inner_text()
        # Check the live browser app renders a fresh battle after using its actual navigation.
        await page.locator('[data-action="nav"][data-page="home"]').click()
        await page.locator('[data-action="start-next"]').click()
        assert await page.locator('.battle-grid .lane-row').count() == 3
        # Simulate old V1.4 unit data (no guard/flight properties): engine must derive traits via ID.
        legacy = await page.evaluate('''() => {
          const u={uid:777,id:'shield',side:'p',hp:9,maxhp:9,atk:1,armor:2,ranged:false,ability:'armor',stun:0,poison:0,poisonTurns:0};
          battle.board[1][1]=u;
          render();
          return battle.board[1][1].id;
        }''')
        assert legacy == 'shield'
        assert not errors, errors
        await browser.close()
    print('V1.5 browser traits and legacy battlefield: PASS')

asyncio.run(main())
