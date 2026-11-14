"""Vérifier les variantes de campagne en bureau et en mobile émulé."""
import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from subprocess import check_output
from threading import Thread

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
PROFILE_KEY = 'couronnes_arcanes_v1'
BATTLE_KEY = 'couronnes_arcanes_bataille_v1'
STARTER = json.loads(check_output([
    'node', '--input-type=module', '-e',
    "import {freshProfile} from './src/engine.js'; console.log(JSON.stringify(freshProfile()))",
], cwd=ROOT))


def check(browser, url, *, mobile, offline):
    context = browser.new_context(
        viewport={'width': 390, 'height': 844} if mobile else {'width': 1440, 'height': 960},
        is_mobile=mobile, has_touch=mobile, reduced_motion='reduce', offline=offline,
    )
    errors = []
    page = context.new_page()
    page.on('pageerror', lambda error: errors.append(str(error)))

    def open_campaign(unlocked):
        page.goto(url)
        page.evaluate('''([key, profile, battle]) => {
            localStorage.removeItem(battle);
            localStorage.setItem(key, JSON.stringify(profile));
        }''', [PROFILE_KEY, {**STARTER, 'guideSeen': True, 'unlocked': unlocked}, BATTLE_KEY])
        page.reload()
        page.locator('#nav [data-action="nav"][data-page="campaign"]').click()

    def snapshot():
        return page.evaluate('(key) => JSON.parse(localStorage.getItem(key))', BATTLE_KEY)

    campaign_buttons = page.locator('[data-action="start-hard-mission"]')
    open_campaign(5)
    expect(campaign_buttons).to_have_count(0)
    open_campaign(6)
    expect(campaign_buttons).to_have_count(1)
    page.locator('[data-action="start-mission"][data-id="06"]').click()
    expect(page.locator('.combat-mission-name')).not_to_contain_text('Difficile')
    assert 'campaignDifficulty' not in snapshot()

    for mission_id, card_id, rarity in [('06', 'golem', 'légendaire'), ('12', 'sentinel', 'divine')]:
        open_campaign(12)
        expect(campaign_buttons).to_have_count(2)
        page.locator(f'[data-action="start-hard-mission"][data-id="{mission_id}"]').click()
        expect(page.locator('.combat-mission-name')).to_contain_text('Difficile')
        battle = snapshot()
        assert battle['missionId'] == mission_id and battle['campaignDifficulty'] == 'hard'
        enemy = battle['heroes']['e']
        cards = enemy['deck'] + enemy['hand']
        assert sum(isinstance(card, dict) and card.get('id') == card_id
                   and card.get('rarity') == rarity for card in cards) == 1
        page.reload()
        expect(page.locator('.combat-mission-name')).to_contain_text('Difficile')
        assert snapshot() == battle

    assert not errors, errors
    context.close()


def main():
    with ThreadingHTTPServer(('127.0.0.1', 0), partial(SimpleHTTPRequestHandler, directory=ROOT)) as server:
        Thread(target=server.serve_forever, daemon=True).start()
        web_url = f'http://127.0.0.1:{server.server_port}/index.html'
        with sync_playwright() as browser_api:
            browser = browser_api.chromium.launch()
            check(browser, web_url, mobile=False, offline=False)
            check(browser, web_url, mobile=True, offline=False)
            check(browser, (ROOT / 'JOUER.html').as_uri(), mobile=False, offline=True)
            browser.close()
    print('Difficulté de campagne vérifiée sur le web et hors ligne.')


if __name__ == '__main__':
    main()
