"""Statistiques réelles, consultation de toutes les cartes et vrai combat de campagne."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
from browser_class_skills_v28 import make_page,ROOT

async def touch_or_click(page,card,touch):
    if touch:
        await card.scroll_into_view_if_needed()
        box=await card.bounding_box()
        await page.touchscreen.tap(box['x']+10,box['y']+min(35,box['height']/2))
    else:
        await card.click(position={'x':10,'y':25})

async def run(browser,label,viewport):
    errors=[];touch=label!='desktop'
    page=await make_page(browser,viewport,{},errors,touch=touch)
    await page.locator('[data-action="welcome-start"]').click()
    await page.evaluate("""()=>{
      profile.buildings.forge=1;profile.reputation.aube=15;
      profile.equipmentOwned=['lame'];profile.equipped.arme='lame';
      profile.upgrades.archer=2;profile.mastery.archer=22;
      battle=null;startMission('01');
      battle.heroes.p.hand=[{id:'militia',wait:0},{id:'archer',wait:1},
        {id:'firebolt',wait:0},{id:'skill_guard_wall',wait:2}];
      persistBattle();render();
    }""")
    cards=page.locator('.hand .hand-card');panel=page.locator('#hand-card-inspection')
    assert await cards.nth(0).locator('.stat.atk b').inner_text()=='3'
    assert await cards.nth(0).locator('.stat.hp b').inner_text()=='7'
    assert await cards.nth(1).locator('.stat.atk b').inner_text()=='5'
    assert await cards.nth(1).locator('.stat.hp b').inner_text()=='8'

    # La fiche flottante garde la main immobile et reste dans le viewport.
    await page.mouse.move(0,0)
    before=await cards.nth(1).bounding_box()
    model=await page.evaluate('JSON.stringify(battle)')
    await cards.nth(1).hover()
    assert await page.evaluate('selectedCard')==-1
    assert await page.evaluate('JSON.stringify(battle)')==model
    assert 'ATQ 5 / PV 8' in await panel.inner_text()
    assert 'Peut attaquer à deux cases' in await panel.inner_text()
    assert 'Bonus inclus' in await panel.inner_text()
    after=await cards.nth(1).bounding_box()
    assert abs(before['y']-after['y'])<2,(label,before,after)
    rect=await panel.bounding_box();dock=await page.locator('.combat-hand-dock').bounding_box()
    assert rect['x']>=11 and rect['y']>=11 and rect['x']+rect['width']<=viewport['width']-11 and rect['y']+rect['height']<=viewport['height']-11,(rect,dock,after)
    assert await panel.locator('.inspection-description').evaluate('el=>parseFloat(getComputedStyle(el).fontSize)')>=14
    description=await panel.locator('.inspection-description').bounding_box()
    body=await panel.locator('.inspection-body').bounding_box()
    assert description['y']+description['height']<=body['y']+body['height']+1,(label,description,body)
    close=panel.locator('[data-action="close-inspection"]')
    assert (await close.bounding_box())['width']>=44
    await page.screenshot(path=f'/tmp/ca-capacites-{label}.png',full_page=True)
    await close.click()
    assert await panel.is_hidden()

    # Sort et compétence de classe : règles accessibles même pendant leur attente.
    await cards.nth(3).hover()
    assert 'Gardien' in await panel.inner_text()
    assert 'Attente 2 tours' in await panel.inner_text()
    assert await page.evaluate('selectedCard')==-1
    await close.click()
    await cards.nth(2).hover()
    assert 'Lame de feu' in await panel.inner_text()
    assert await panel.locator('.inspection-stats').count()==0
    await close.click()
    await touch_or_click(page,cards.nth(2),touch)
    assert await page.evaluate('selectedCard')==2
    assert await panel.is_hidden()

    # Sélection d'une unité, fermeture sans perdre le choix, puis pose dans le vrai moteur.
    await touch_or_click(page,cards.nth(0),touch)
    assert await page.evaluate('selectedCard')==0
    assert await panel.is_hidden()
    target=page.locator('[data-action="deploy"][data-col="1"][data-lane="0"]')
    await target.scroll_into_view_if_needed();await target.click()
    assert await page.evaluate('({atk:battle.board[0][1].atk,hp:battle.board[0][1].maxhp})')=={'atk':3,'hp':7}
    await page.locator('[data-action="end-turn"]').click()
    await page.wait_for_function('()=>battle.round>=2')
    saved=await page.evaluate('()=>({...window.__saves})')
    round_before=await page.evaluate('battle.round')
    await page.close();page=await make_page(browser,viewport,saved,errors,touch=touch)
    assert await page.evaluate('battle.round')==round_before
    assert await page.locator('#hand-card-inspection').is_hidden()
    assert not await page.evaluate("Object.keys(JSON.parse(window.__saves.couronnes_arcanes_bataille_v1)).some(k=>/inspect/i.test(k))")

    # Fin de la mission 01 réelle : uniquement des coups autorisés, aucune modification de PV/résultat.
    await page.evaluate("""()=>{
      for(let turn=0;turn<40&&battle.status==='active';turn++){
        if(battle.powerCooldown===0)usePower(battle);
        for(let action=0;action<2&&battle.status==='active';action++){
          let played=false;
          for(let i=0;i<battle.heroes.p.hand.length&&!played;i++){
            if(battle.heroes.p.hand[i].wait>0)continue;
            for(let lane=0;lane<battle.board.length;lane++){
              if(playPlayerCard(battle,i,lane).ok){played=true;break;}
            }
          }
        }
        if(battle.status==='active'){
          endPlayerTurn(battle);
          if(battle.phase==='enemy'){
            for(let n=0;n<2&&battle.status==='active';n++){if(playEnemyCard(battle).done)break;}
            if(battle.status==='active')finishEnemyTurn(battle);
          }
        }
      }
      persistBattle();render();settle();
    }""")
    assert await page.evaluate('battle.status') in ['victory','defeat']
    assert await page.evaluate('battle.rewardGiven')
    assert await page.evaluate('profile.wins+profile.losses')==1
    assert not errors,errors
    await page.close()
    print('Capacités '+label+': bonus, toucher, sorts/compétences, pose, reprise et mission 01 terminée PASS')

async def offline(browser):
    context=await browser.new_context(viewport={'width':844,'height':390},has_touch=True,is_mobile=True,offline=True,reduced_motion='reduce')
    page=await context.new_page();requests=[];errors=[]
    page.on('request',lambda req:requests.append(req.url));page.on('pageerror',lambda e:errors.append(str(e)))
    await page.goto((ROOT/'JOUER.html').as_uri())
    await page.locator('[data-action="welcome-start"]').click()
    await page.mouse.move(0,0)
    await page.keyboard.press('Escape')
    await page.locator('[data-action="toggle-animations"]').click()
    await page.keyboard.press('Tab')  # Le réglage a remplacé le DOM de la main.
    await page.locator('.hand .hand-card').first.focus()
    assert not await page.locator('#hand-card-inspection').is_hidden()
    await page.locator('[data-action="close-inspection"]').click()
    await page.locator('[data-action="end-turn"]').click()
    await page.wait_for_function("() => JSON.parse(localStorage.getItem('couronnes_arcanes_bataille_v1'))?.round>=2")
    turn=await page.locator('.turn-n').inner_text()
    await page.reload()
    assert await page.locator('.turn-n').inner_text()==turn
    assert await page.locator('#hand-card-inspection').is_hidden()
    assert await page.locator('.battle-vfx-overlay').count()==0
    assert not any(url.startswith(('http:','https:')) for url in requests),requests
    assert not errors,errors
    await context.close()
    print('Capacités autonome : sans réseau, animations désactivées, mouvement réduit et stockage réel PASS')

async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True,args=['--no-sandbox'])
        for label,vp in [('desktop',{'width':1366,'height':900}),('mobile',{'width':390,'height':844}),('landscape',{'width':844,'height':390})]:
            await run(browser,label,vp)
        await offline(browser);await browser.close()

if __name__=='__main__':asyncio.run(main())
