"""Vue cartes dans le jeu réel : plateau, main, délais, pose, avancée et reprise."""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
BATTLE='couronnes_arcanes_bataille_v1'

async def layout(page,label):
    geometry=await page.evaluate("""()=>{
      const r=s=>{const b=document.querySelector(s).getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height,b:b.bottom}};
      const cells=[...document.querySelectorAll('.arena-active-row .battle-cell')].map(e=>e.getBoundingClientRect());
      return {stage:r('.combat-stage'),dock:r('.combat-hand-dock'),hud:r('.battle-hud'),
        hand:r('.hand'),first:r('.hand-card'),end:r('[data-action="end-turn"]'),
        turn:r('.battle-mid'),controls:r('.vfx-controls'),
        low:Math.max(...cells.map(c=>c.bottom)),high:Math.min(...cells.map(c=>c.top)),
        inside:!!document.querySelector('.combat-stage > .combat-hand-dock'),
        cards:[...document.querySelectorAll('.hand-card')].map(e=>[e.offsetWidth,e.offsetHeight]),
        viewport:[innerWidth,innerHeight],page:document.documentElement.scrollWidth};
    }""")
    w,h=geometry['viewport'];stage=geometry['stage'];dock=geometry['dock']
    assert abs(stage['x'])<1 and abs(stage['y'])<1,(label,geometry)
    assert abs(stage['w']-w)<1 and abs(stage['h']-h)<1,(label,geometry)
    assert geometry['controls']['y']>=geometry['turn']['b'],(label,geometry)
    assert geometry['inside'] and dock['b']<=h and geometry['page']<=w+1,(label,geometry)
    assert geometry['low']<=dock['y']-10,(label,geometry)
    assert geometry['high']>=geometry['hud']['b'],(label,geometry)
    assert len(set(tuple(c) for c in geometry['cards']))==1,(label,geometry)
    assert geometry['first']['h']>geometry['first']['w']>40,(label,geometry)
    assert geometry['end']['x']>=geometry['hand']['x']+geometry['hand']['w'],(label,geometry)
    # Le recadrage coupe uniquement du décor : les cases extrêmes restent atteignables.
    await page.locator('.battle-grid').evaluate('(el)=>el.scrollLeft=el.scrollWidth')
    last=await page.locator('.lane-row').first.locator('[data-col="10"]').bounding_box()
    assert last['x']+last['width']<=w+1,(label,last)
    await page.locator('.battle-grid').evaluate('(el)=>el.scrollLeft=0')
    return geometry

async def run(browser,label,viewport):
    context=await browser.new_context(viewport=viewport,offline=True)
    page=await context.new_page();errors=[];requests=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda r:requests.append(r.url))
    # Graine de mission stable : mêmes pioches et décisions IA à chaque parcours.
    await page.add_init_script('Date.now=()=>12345')
    await page.goto((ROOT/'ESSAI_CARTES.html').as_uri())
    await page.evaluate('localStorage.clear()');await page.reload()
    await page.locator('[data-action="welcome-start"]').click()
    assert await page.locator('.arena-painted-frame').count()==1
    assert await page.locator('.lane-row').count()==2
    assert await page.locator('.battle-cell').count()==20
    assert await page.locator('.lane-gate').count()==4
    assert await page.locator('.board-card').count()==0
    assert await page.locator('.hand-card').count()>=5
    initial=await layout(page,label)
    # La vraie main contient de l'attente ; lire une carte n'en permet pas la pose.
    waiting=page.locator('.hand-card.hand-waiting')
    if await waiting.count():
        await waiting.first.click();assert not await page.locator('#hand-card-inspection').is_hidden()
        assert await page.locator('.battle-cell.available').count()==0
        inspected=await layout(page,label)
        assert initial['dock']==inspected['dock'] and initial['hand']==inspected['hand']
    ready=page.locator('.hand-card.hand-ready:has(.stat.atk)').first
    if not await ready.count():
        await page.locator('[data-action="end-turn"]').click()
        ready=page.locator('.hand-card.hand-ready:has(.stat.atk)').first
    await ready.click()
    await page.locator('[data-action="close-inspection"]').click()
    await page.locator('[data-action="deploy"][data-lane="0"]').click()
    await page.wait_for_selector('.lane-row .board-card')
    before=json.loads(await page.evaluate('(key)=>localStorage.getItem(key)',BATTLE))
    unit=before['board'][0][1];assert unit is not None
    portrait=page.locator('.lane-row .board-card').first
    assert await portrait.locator('img').evaluate('(el)=>el.complete&&el.naturalWidth>0')
    # Mesurer l'emplacement final, après l'animation d'invocation (520 ms).
    await portrait.evaluate("el=>Promise.all(el.closest('.unit-on-board').getAnimations({subtree:true}).map(a=>a.finished.catch(()=>{})))")
    # Le rectangle conserve le format portrait et ne déborde pas sur la ligne suivante.
    bounds=await portrait.bounding_box();assert bounds['height']>bounds['width']>20,(label,bounds)
    await layout(page,label)
    await page.screenshot(path=f'/tmp/ca-card-study-{label}.png',full_page=False)
    await page.locator('.combat-intel summary').click()
    assert await page.locator('.combat-intel-panel .log-list').is_visible()
    assert await page.locator('[data-action="retreat"]').is_visible()
    await page.locator('.combat-intel summary').click()
    await page.locator('[data-action="end-turn"]').click()
    after=json.loads(await page.evaluate('(key)=>localStorage.getItem(key)',BATTLE))
    assert after['round']==before['round']+1
    assert any(u and u['uid']==unit['uid'] for u in after['board'][0][2:]),after['board'][0]
    assert 'vfx' not in after
    # Le défilement du vrai plateau est conservé après le rendu.
    await page.evaluate("document.querySelector('.battle-grid').scrollLeft=120")
    x=await page.locator('.battle-grid').evaluate('(el)=>el.scrollLeft')
    await page.locator('[data-action="toggle-animations"]').click()
    assert await page.locator('.battle-vfx-overlay').count()==0
    assert await page.locator('.battle-grid').evaluate('(el)=>el.scrollLeft')==x
    await page.reload();assert await page.locator('.turn-n').inner_text()==str(after['round'])
    assert await page.locator('.board-card').count()>0
    # Comparateur du rendu : le même combat, mêmes unités et compteurs.
    snapshot=await page.evaluate('(key)=>localStorage.getItem(key)',BATTLE)
    await page.locator('[data-action="toggle-card-arena"]').click()
    assert await page.locator('.board-card').count()==0
    assert await page.locator('.lane-row .sprite-figure').count()>0
    assert await page.evaluate('(key)=>localStorage.getItem(key)',BATTLE)==snapshot
    await page.locator('[data-action="toggle-card-arena"]').click()
    assert await page.locator('.board-card').count()>0
    assert await page.evaluate('(key)=>localStorage.getItem(key)',BATTLE)==snapshot
    await page.emulate_media(reduced_motion='reduce')
    await page.locator('[data-action="end-turn"]').click()
    assert await page.locator('.battle-vfx-overlay').count()==0
    assert not await page.evaluate("'battle' in window||'profile' in window")
    assert not errors,errors
    assert not any(u.startswith(('http:','https:')) for u in requests),requests
    await context.close()
    print(f'Cartes sur plateau {label}: vraie main, délais, pose, avancée, couronnes, vue réversible, reprise et hors ligne PASS')

async def combat(browser):
    # Bundle de diagnostic du même jeu ; la mission est jouée avec les API normales.
    page=await browser.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    await page.goto((ROOT/'tests/ESSAI_CARTES.test.html').as_uri())
    await page.locator('[data-action="welcome-start"]').click()
    await page.evaluate('''()=>{
      for(let turn=0;turn<40&&battle.status==='active';turn++){
        if(battle.powerCooldown===0)usePower(battle);
        for(let a=0;a<2&&battle.status==='active';a++){
          let played=false;
          for(let i=0;i<battle.heroes.p.hand.length&&!played;i++)for(let l=0;l<battle.board.length&&!played;l++)
            if(playPlayerCard(battle,i,l).ok)played=true;
        }
        if(battle.status==='active')endPlayerTurn(battle);
      }
      persistBattle();render();settle();
    }''')
    assert await page.evaluate('battle.status') in ['victory','defeat']
    assert await page.evaluate('profile.wins+profile.losses')==1
    assert await page.evaluate('battle.rewardGiven')
    assert not errors,errors
    await page.close();print('Vue cartes : mission 01 du vrai jeu terminée, progression et récompense uniques PASS')

async def four_lanes(browser,label,viewport):
    page=await browser.new_page(viewport=viewport)
    await page.goto((ROOT/'tests/ESSAI_CARTES.test.html').as_uri())
    await page.locator('[data-action="welcome-start"]').click()
    await page.evaluate("""()=>{
      battle=createBattle(profile,{id:'01',name:'Revue des quatre lignes',enemy:'Gardien',hp:90,difficulty:1,boss:true,deck:[]},211);
      for(let l=0;l<4;l++){
        battle.heroes.p.hand=[{id:['militia','shield','archer','cleric'][l],wait:0}];
        battle.heroes.p.cardsPlayed=0;playPlayerCard(battle,0,l);
      }
      battle.heroes.p.hand=[{id:'banner',wait:2},{id:'paladin',wait:1},{id:'firebolt',wait:0}];render();
    }""")
    assert await page.locator('.arena-active-row').count()==4
    assert await page.locator('.hand-card').count()==3
    await layout(page,label)
    await page.screenshot(path=f'/tmp/ca-card-study-{label}-4.png',full_page=False)
    await page.close()
    print(f'Plein écran {label}: quatre lignes visibles, main intégrée, cartes uniformes et commandes accessibles PASS')

async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True,args=['--no-sandbox'])
        for label,vp in [('desktop',{'width':1366,'height':900}),('mobile',{'width':390,'height':844}),('landscape',{'width':844,'height':390})]:await run(browser,label,vp)
        for label,vp in [('desktop',{'width':1366,'height':900}),('mobile',{'width':390,'height':844}),('landscape',{'width':844,'height':390})]:await four_lanes(browser,label,vp)
        await combat(browser);await browser.close()
if __name__=='__main__':asyncio.run(main())
