"""Pouvoirs Éther : même préparation moteur que Node, puis clics et reprise UI."""
import json,subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
BATTLE='couronnes_arcanes_bataille_v1'

async def run_ether_divine_case(browser,config,address,profile,make_case,click,stored):
    fixture=json.loads(subprocess.check_output(['node','tests/fixtures/ether-divine-battle.mjs',json.dumps(profile)],cwd=ROOT))
    touch=config['touch']
    ctx,page,errors,external=await make_case(browser,fixture,config['viewport'],touch=touch,url=address,terminal=fixture['battle'])
    await page.locator('.combat-screen').wait_for()
    await page.clock.install(time='2026-11-05T00:00:00Z');await page.clock.pause_at('2026-11-05T00:00:01Z')
    await click(page.locator('[data-action="end-turn"]'),touch)
    await page.clock.run_for(1000)
    await page.wait_for_function("()=>{const b=JSON.parse(localStorage.getItem('couronnes_arcanes_bataille_v1'));return b?.round===2&&b.phase==='player'}")
    b=await stored(page,BATTLE);units={u['uid']:u for row in b['board'] for u in row if u};s=fixture['sources'];t=fixture['targets']
    assert units[s['spark']]['nextStrikeBonus']=={'amount':2,'expiresRound':3}
    assert units[t['seer']]['stillOmen']['amount']==3 and units[t['seer']]['stillOmen']['dueRound']==2
    assert units[t['sentinel']]['prismPenalty']=={'amount':1,'minimum':1,'expiresRound':3}
    assert units[s['sentinel']]['guardPrismReadyRound']==4
    assert b['board'][2][7]['uid']==t['secondary'] and units[t['secondary']]['hp']==38
    assert units[s['dragon']]['splashKnockbackReadyRound']==4
    for uid,phrase in [(s['spark'],'Éclat persistant'),(t['sentinel'],'Prisme inhibiteur'),(s['dragon'],'Souffle disponible'),(s['seer'],'Destin scellé')]:
        card=page.locator(f'.board-card[data-unit-id="{uid}"]')
        if touch:await card.tap()
        else:await card.hover()
        assert phrase in await page.locator('#hand-card-inspection').inner_text()
        await page.keyboard.press('Escape')
    await page.screenshot(path=f'/tmp/ca-ether-divine-{config["label"]}.png')
    assert await stored(page)==fixture['profile']
    await page.reload();await page.locator('.combat-screen').wait_for();assert await stored(page,BATTLE)==b
    await page.clock.run_for(1000)
    await click(page.locator('[data-action="end-turn"]'),touch)
    await page.clock.run_for(1000)
    await page.wait_for_function("()=>{const b=JSON.parse(localStorage.getItem('couronnes_arcanes_bataille_v1'));return b?.round===3&&b.phase==='player'}")
    after=await stored(page,BATTLE);units={u['uid']:u for row in after['board'] for u in row if u}
    assert not units[s['spark']].get('nextStrikeBonus')
    assert not units[t['seer']].get('stillOmen')
    assert not units[t['sentinel']].get('prismPenalty')
    await page.reload();await page.locator('.combat-screen').wait_for();assert await stored(page,BATTLE)==after
    assert not errors,errors;assert not external,external
    await ctx.close()
    print(f'Éther Divin {config["label"]}: quatre pouvoirs réels, consommation, présage, fiches et deux reprises PASS',flush=True)

async def run_ether_flight_case(browser,config,address,make_case,click,stored):
    fixture=json.loads(subprocess.check_output(['node','tests/fixtures/ether-flight-battle.mjs'],cwd=ROOT))
    touch=config['touch']
    ctx,page,errors,external=await make_case(browser,fixture,config['viewport'],touch=touch,url=address,terminal=fixture['battle'])
    await page.locator('.combat-screen').wait_for()
    await page.clock.install(time='2026-11-05T00:00:00Z')
    await page.clock.pause_at('2026-11-05T00:00:01Z')
    for turn in (2,3):
        await click(page.locator('[data-action="end-turn"]'),touch)
        await page.clock.run_for(1000)
        await page.wait_for_function("round=>{const b=JSON.parse(localStorage.getItem('couronnes_arcanes_bataille_v1'));return b?.round===round&&b.phase==='player'}",arg=turn)
        battle=await stored(page,BATTLE)
        if turn==2:
            ally=battle['board'][0][2]
            assert ally['flightWake']=={'cells':1,'expiresRound':2}
            assert battle['board'][1][2]['hp']==5
            assert battle['board'][1][3]['flightSupportReadyRound']==4
            card=page.locator(f'.board-card[data-unit-id="{ally["uid"]}"]')
            if touch:await card.tap()
            else:await card.hover()
            assert 'Sillage ascendant' in await page.locator('#hand-card-inspection').inner_text()
            await page.keyboard.press('Escape')
        else:
            moved=battle['board'][0][4]
            assert moved['uid']==ally['uid'] and 'flightWake' not in moved
        await page.reload()
        await page.locator('.combat-screen').wait_for()
        assert await stored(page,BATTLE)==battle
    assert await stored(page)==fixture['profile'];assert not errors,errors;assert not external,external
    await ctx.close()
    print(f'Éther Vol {config["label"]}: fusions, soin, Sillage, déplacement et reprise PASS',flush=True)

async def run_ether_impact_case(browser,config,address,make_case,click,stored):
    fixture=json.loads(subprocess.check_output(['node','tests/fixtures/ether-impact-battle.mjs'],cwd=ROOT))
    touch=config['touch']
    ctx,page,errors,external=await make_case(browser,fixture,config['viewport'],touch=touch,url=address,terminal=fixture['battle'])
    await page.locator('.combat-screen').wait_for()
    await page.clock.install(time='2026-11-05T00:00:00Z')
    await page.clock.pause_at('2026-11-05T00:00:01Z')
    for turn in (2,3):
        await click(page.locator('[data-action="end-turn"]'),touch)
        await page.clock.run_for(1000)
        await page.wait_for_function("round=>{const b=JSON.parse(localStorage.getItem('couronnes_arcanes_bataille_v1'));return b?.round===round&&b.phase==='player'}",arg=turn)
        battle=await stored(page,BATTLE)
        board=battle['board'];target=board[0][3]
        assert (board[1][3]['hp'],board[3][3]['hp'])==(28,30)
        if turn==2:
            assert target['hp']==28 and target['healingPenalty']=={'amount':2,'expiresRound':2}
            card=page.locator(f'.board-card[data-unit-id="{target["uid"]}"]')
            if touch:await card.tap()
            else:await card.hover()
            assert 'prochain soin −2 PV' in await page.locator('#hand-card-inspection').inner_text()
            await page.keyboard.press('Escape')
        else:
            assert target['hp']==27 and 'healingPenalty' not in target and 'regeneration' not in target
        await page.reload()
        await page.locator('.combat-screen').wait_for()
        assert await stored(page,BATTLE)==battle
    assert await stored(page)==fixture['profile'];assert not errors,errors;assert not external,external
    await ctx.close()
    print(f'Éther Impact {config["label"]}: fusions, Résonance, Arc, cadence et reprises PASS',flush=True)

async def run_last_ether_divines_case(browser,config,address,make_case,click,stored):
    fixture=json.loads(subprocess.check_output(['node','tests/fixtures/ether-last-divines-battle.mjs'],cwd=ROOT))
    touch=config['touch']
    ctx,page,errors,external=await make_case(browser,fixture,config['viewport'],touch=touch,url=address,terminal=fixture['battle'])
    await page.locator('.combat-screen').wait_for()
    await page.clock.install(time='2026-11-06T00:00:00Z')
    await page.clock.pause_at('2026-11-06T00:00:01Z')
    for turn in (2,3):
        await click(page.locator('[data-action="end-turn"]'),touch)
        await page.clock.run_for(1000)
        await page.wait_for_function("round=>{const b=JSON.parse(localStorage.getItem('couronnes_arcanes_bataille_v1'));return b?.round===round&&b.phase==='player'}",arg=turn)
        battle=await stored(page,BATTLE);board=battle['board']
        if turn==2:
            marked,knight,walker=board[0][6],board[1][6],board[3][5]
            assert marked['hp']==26 and marked['retaliatoryOmen']['expiresRound']==3
            assert knight['id']=='aetherknight' and knight['chargeAdvanceReadyRound']==4
            assert walker['id']=='portal_walker' and walker['portalEcho']=={'lane':2,'col':4,'expiresRound':2}
            assert board[2][5]['hp']==30 and board[3][6] is None
            for unit,label in [(marked,'Présage rétributif'),(knight,'Percée du Zénith'),(walker,'Écho dimensionnel')]:
                card=page.locator(f'.board-card[data-unit-id="{unit["uid"]}"]')
                if touch:await card.tap()
                else:await card.hover()
                assert label in await page.locator('#hand-card-inspection').inner_text()
                await page.keyboard.press('Escape')
        else:
            assert board[0][4]['hp']==3 and board[0][5]['hp']==20 and 'retaliatoryOmen' not in board[0][5]
            assert board[2][5]['hp']==26 and 'portalEcho' not in board[3][6]
        await page.reload()
        await page.locator('.combat-screen').wait_for()
        assert await stored(page,BATTLE)==battle
    assert await stored(page)==fixture['profile'];assert not errors,errors;assert not external,external
    await ctx.close()
    print(f'Éther dernières Divines {config["label"]}: fusions, Présage, Percée, Écho et reprises PASS',flush=True)
