"""Ascensions : deux combats UI complets, deux reprises, fusion et vraie invocation."""
import copy,json,subprocess
from pathlib import Path
from evolution_ci_plan import ascension_cases

ROOT=Path(__file__).resolve().parents[1]
SAVE='couronnes_arcanes_v1'
BATTLE='couronnes_arcanes_bataille_v1'
SCENARIOS=json.loads(subprocess.check_output(['node','tests/fixtures/ascension-scenarios.mjs','--json'],cwd=ROOT))

async def run_ascension_cases(browser,part,url,*,make_case,click,select,replay,stored):
    for config in ascension_cases(part):
        label,touch=config['label'],config['touch'];s=SCENARIOS[config['index']]
        address=url if label=='web' else None
        locked=copy.deepcopy(s);locked['profile']['completed']=[]
        ctx,page,errors,_=await make_case(browser,locked,config['viewport'],touch=touch,url=address)
        await click(page.locator('#nav [data-page="trials"]'),touch)
        tile=page.locator(f'[data-trial-id="{s["id"]}"]')
        assert await tile.locator('[data-action="trial-start"]').is_disabled()
        assert await page.locator('.trial-card').count()==4 and await page.locator('.ascension-card').count()==2
        assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
        assert not errors,errors
        await ctx.close()
        failure=None if config['full'] else 'profile' if label=='landscape' else 'cleanup'
        ctx,page,errors,external=await make_case(browser,s,config['viewport'],touch=touch,url=address,terminal=None if config['full'] else s['terminal'],failure=failure)
        if config['full']:
            await click(page.locator('#nav [data-page="trials"]'),touch)
            tile=page.locator(f'[data-trial-id="{s["id"]}"]')
            assert await tile.locator('[data-action="trial-start"]').is_enabled()
            await tile.scroll_into_view_if_needed()
            await page.screenshot(path=f'/tmp/ca-evolution-ascension-{label}.png')
            await click(tile.locator('[data-action="trial-start"]'),touch)
            snapshot=await stored(page,BATTLE);assert snapshot['trialChallenge']['version']==2
            await click(page.locator('.trial-combat-objective summary'),touch)
            assert await page.locator('.trial-objective-panel li').count()==4
            await page.screenshot(path=f'/tmp/ca-evolution-ascension-objective-{label}.png')
            await click(page.locator('.trial-combat-objective summary'),touch)
            await page.reload();await page.locator('.combat-screen').wait_for();assert await stored(page,BATTLE)==snapshot
            await replay(page,s,touch,result_title='Ascension accomplie')
        else:
            if failure=='profile':
                assert await stored(page)==s['profile']
                assert not (await stored(page,BATTLE)).get('progressionGranted')
                await click(page.locator('.combat-menu-link'),touch)
                await click(page.locator('#nav [data-page="trials"]'),touch)
                assert await page.locator('[data-action="trial-start"]:enabled').count()==0
            else:
                assert (await stored(page))['completedTrials']==s['expected']['completedTrials']
                assert await stored(page,BATTLE) is not None
            await page.evaluate("localStorage.setItem('evolution-test-failure','')")
            await page.reload()
        result=await stored(page)
        assert {k:v for k,v in result.items() if k!='lastBattleSettlementId'}==s['expected']
        assert result['deck']==s['profile']['deck'] and result['collection']==s['profile']['collection']
        assert result['evolvedCollection']==s['profile']['evolvedCollection']
        assert result['completedTrials'].count(s['id'])==1
        assert await stored(page,BATTLE) is None
        exit_button=page.locator('.modal [data-action="trial-exit"][data-page="trials"]')
        if await exit_button.count():
            await click(exit_button,touch)
        else:
            if await page.locator('.combat-menu-link').is_visible():
                await click(page.locator('.combat-menu-link'),touch)
            await click(page.locator('#nav [data-page="trials"]'),touch)
        assert await page.locator(f'[data-trial-id="{s["id"]}"] [data-action="trial-start"]').is_disabled()
        await page.reload();assert await stored(page)==result
        await click(page.locator('#nav [data-page="alchemy"]'),touch)
        target='dawnbastion:'+s['trial']['to']
        recipe=page.locator(f'[data-fusion-id="{target}"]')
        assert await recipe.locator('button').is_enabled()
        await click(recipe.locator('button'),touch)
        assert '3 exemplaires' in await page.locator('.modal').inner_text()
        assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
        await page.screenshot(path=f'/tmp/ca-evolution-ascension-fusion-{label}.png')
        await click(page.locator('.modal [data-action="close-modal"]'),touch);assert await stored(page)==result
        await click(recipe.locator('button'),touch)
        await page.locator('.modal [data-action="evolution-fusion-confirm"]').dblclick()
        fused=await stored(page);assert fused['evolvedCollection'][target]==1
        source='dawnbastion:'+s['trial']['from']
        if s['trial']['from']=='légendaire':assert fused['collection']['dawnbastion']==result['collection']['dawnbastion']-3
        else:assert fused['evolvedCollection'][source]==result['evolvedCollection'][source]-3
        for key in ['gold','shards','heroXp','completed','completedTrials','deck']:assert fused[key]==result[key],key
        await click(page.locator('#nav [data-page="collection"]'),touch)
        row=page.locator('[data-collection-character="dawnbastion"]')
        assert await row.locator('td').count()==6
        assert 'Possédée ×1' in await row.locator(f'[data-collection-rarity="{s["trial"]["to"]}"]').inner_text()
        await click(page.locator('#nav [data-page="deck"]'),touch)
        await click(page.locator(f'[data-deck-card="{target}"] [data-action="deck-add"]'),touch)
        final=await stored(page);assert {'id':'dawnbastion','rarity':s['trial']['to']} in final['deck']
        await click(page.locator('#nav [data-page="guide"]'),touch)
        async with page.expect_download() as info:await click(page.locator('[data-action="export-save"]'),touch)
        exported=json.loads(Path(await (await info.value).path()).read_text());assert exported==final
        await page.locator('#import-file').set_input_files({'name':'ascension.json','mimeType':'application/json','buffer':json.dumps(exported).encode()})
        await page.locator('#view .hero-copy').wait_for();assert await stored(page)==final
        seed=int(subprocess.check_output(['node','--input-type=module','-e',"import {createBattle} from './src/engine.js';import {CAMPAIGN} from './src/data.js';const p=JSON.parse(process.argv[1]);for(let s=1;s<=1000;s++){if(createBattle(p,CAMPAIGN[0],s).heroes.p.hand.some(c=>c.id==='dawnbastion'&&c.rarity===process.argv[2])){console.log(s);break}}",json.dumps(final),s['trial']['to']],cwd=ROOT))
        await page.evaluate('(seed)=>{Date.now=()=>seed}',seed)
        await click(page.locator('#nav [data-page="campaign"]'),touch)
        await click(page.locator('[data-action="start-mission"][data-id="01"]'),touch)
        for _ in range(3):
            b=await stored(page,BATTLE);await click(page.locator('[data-action="end-turn"]'),touch)
            await page.wait_for_function('''([key,n])=>{const b=JSON.parse(localStorage.getItem(key));return b?.phase==='player'&&b.round>n}''',arg=[BATTLE,b['round']])
        b=await stored(page,BATTLE);index=next(i for i,h in enumerate(b['heroes']['p']['hand']) if h['id']=='dawnbastion' and h.get('rarity')==s['trial']['to'])
        assert b['heroes']['p']['hand'][index]['wait']==0
        await select(page,index,touch)
        await click(page.locator('[data-action="deploy"][data-lane="0"][data-col="1"]'),touch)
        snapshot=await stored(page,BATTLE);unit=snapshot['board'][0][1]
        assert (unit['id'],unit['rarity'],unit['atk'],unit['maxhp'])==('dawnbastion',s['trial']['to'],7 if s['trial']['to']=='divine' else 9,14)
        assert unit['arrivalResolved'] and snapshot['heroes']['p']['shield']==3
        await page.reload();await page.locator('.combat-screen').wait_for();assert await stored(page,BATTLE)==snapshot
        await click(page.locator('.combat-menu-link'),touch)
        await click(page.locator('#nav [data-page="alchemy"]'),touch)
        assert await page.locator('[data-fusion-id] button:enabled').count()==0
        await click(page.locator('#nav [data-page="trials"]'),touch)
        assert 'Fusions débloquées' in await page.locator(f'[data-trial-id="{s["id"]}"]').inner_text()
        assert await stored(page)==final
        assert not await page.evaluate("'profile' in window||'battle' in window")
        assert not errors,errors
        assert not external,external
        await ctx.close()
        print(f'Ascension {label}: {s["trial"]["to"]}, {"combat UI complet" if config["full"] else "reprise après panne"}, déblocage sans cadeau, fusion, export/import et vraie invocation/reprise PASS',flush=True)
