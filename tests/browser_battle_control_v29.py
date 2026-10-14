"""Parcours V2.9 : fabrication, ciblage, trois effets, animations et reprise."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright
from browser_class_skills_v28 import make_page
ROOT=Path(__file__).resolve().parents[1]
IDS=['seal_silence','mist_inquisitor','transposition','portal_walker','rune_trap','sylvan_trapper']


async def check_hand_countdowns(page,label):
    """UI seulement : états, compteurs, focus, responsive et animation réduite."""
    await page.evaluate('''()=>{
      battle.heroes.p.hand=[
        {id:'militia',wait:0},{id:'dragon',wait:3},{id:'archer',wait:1}
      ];
      battle.heroes.p.cardsPlayed=0;persistBattle();render();
    }''')
    hand=page.locator('.hand .hand-card')
    assert await hand.count()==3
    assert await page.locator('.hand .hand-ready').count()==1
    assert await page.locator('.hand .hand-waiting').count()==2
    assert await hand.nth(0).locator('.hand-readiness').inner_text()=='✓ PRÊTE'
    assert await hand.nth(1).locator('.hand-readiness').inner_text()=='◷ EN ATTENTE'
    assert await hand.nth(1).locator('.cooldown-stamp b').inner_text()=='3'
    # Le pilote Illustrée remplace les deux badges historiques par un seul compteur visible.
    assert await hand.nth(2).locator('.illustrated-count b').inner_text()=='1'
    assert await hand.nth(2).locator('.cooldown-stamp,.hand-readiness').evaluate_all("els=>els.length===2 && els.every(el=>getComputedStyle(el).display==='none')")
    assert await hand.nth(1).get_attribute('aria-disabled') is None # Consultable, sans autoriser la pose.
    assert '3 tours' in await hand.nth(1).get_attribute('aria-label')
    # Les chiffres tiennent dans les cartes et les étiquettes ne sont pas tronquées.
    measures=await page.evaluate('''()=>{
      const cards=[...document.querySelectorAll('.hand .hand-card')];
      return cards.map(c=>{
        const pilot=c.classList.contains('illustrated-pilot');
        const badge=c.querySelector(pilot?'.illustrated-count':'.hand-readiness');
        const stamp=pilot?null:c.querySelector('.cooldown-stamp');
        const b=badge.getBoundingClientRect(),r=c.getBoundingClientRect(),s=stamp?.getBoundingClientRect();
        return {readable:parseFloat(getComputedStyle(badge).fontSize)>=10,
          fits:b.left>=r.left&&b.right<=r.right&&(!s||(s.left>=r.left&&s.right<=r.right)),
          labelFits:badge.scrollWidth<=badge.clientWidth+1};
      });
    }''')
    assert all(m['readable'] and m['fits'] and m['labelFits'] for m in measures),measures
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
    await page.screenshot(path=f'/tmp/ca-hand-countdowns-{label}.png',full_page=True)
    await hand.nth(0).click()
    assert await page.locator('.hand .hand-ready.selected').count()==1
    # L'option d'animation existante et la préférence d'accessibilité priment.
    await page.locator('[data-action="toggle-animations"]').click()
    assert await page.locator('.hand .timer-motion').count()==0
    await page.locator('[data-action="toggle-animations"]').click()
    await page.emulate_media(reduced_motion='reduce')
    assert await page.locator('.hand .hand-waiting .cooldown-stamp').first.evaluate('(el)=>getComputedStyle(el).animationName')=='none'
    await page.emulate_media(reduced_motion='no-preference')
    # Le temps de jeu et le format de sauvegarde sont conservés.
    before=await page.evaluate('Object.keys(JSON.parse(__saves.couronnes_arcanes_bataille_v1)).sort()')
    await page.evaluate('''()=>{
      battle.heroes.p.hand[1].wait=0;persistBattle();render();
    }''')
    assert await page.locator('.hand .hand-ready').count()==2
    assert await page.locator('.hand .hand-waiting').count()==1
    after=await page.evaluate('Object.keys(JSON.parse(__saves.couronnes_arcanes_bataille_v1)).sort()')
    assert before==after
    assert await page.evaluate('battle.heroes.p.hand[1].wait')==0
    # La sélection de démonstration ne doit pas influencer les étapes de combat suivantes.
    await page.evaluate('()=>{selectedCard=-1;render()}')

async def play(page,id,lane):
    await page.evaluate('(id)=>{battle.heroes.p.hand=[{id,wait:0}];battle.heroes.p.cardsPlayed=0;render()}',id)
    await page.locator('.hand [data-action="select-card"]').click()
    await page.locator(f'[data-action="deploy"][data-lane="{lane}"]').click()

async def run(browser,label,viewport):
    errors=[]
    page=await make_page(browser,viewport,{},errors)
    await page.locator('[data-action="welcome-guide"]').click()
    await page.evaluate('()=>{profile.gold=2000;profile.shards=2000;save();render()}')
    await page.locator('#nav [data-page="alchemy"]').click()
    for id in IDS:
        await page.locator(f'[data-action="fuse-card"][data-id="{id}"]').click()
        assert await page.evaluate('(id)=>profile.collection[id]',id)==1
    await page.locator('#nav [data-page="collection"]').click()
    for id in IDS:
        await page.locator(f'[data-action="deck-add"][data-id="{id}"]').click()
        assert await page.evaluate('(id)=>profile.deck.includes(id)',id)
        card=page.locator('.collection-layout .unit-card').filter(has=page.locator(f'[data-action="deck-add"][data-id="{id}"]'))
        assert len(await card.locator('.card-detail').inner_text())>50
    await page.locator('#nav [data-page="campaign"]').click()
    await page.locator('[data-action="start-mission"][data-id="01"]').click()
    await check_hand_countdowns(page,label)
    await page.evaluate('''()=>{
      battle=createBattle(profile,{id:'01',name:'Reprise historique',enemy:'Sentinelle',hp:80,difficulty:1,deck:[]},11,{legacy:true});
      window.__unit=(id,side,uid,ability='')=>({uid,id,side,atk:2,hp:20,maxhp:20,armor:0,ranged:false,ability,stun:0,poison:0,poisonTurns:0});
      battle.heroes.e.hand=[];battle.heroes.e.deck=[];battle.heroes.e.discard=[];
      battle.board[0][4]=__unit('lich','e',90,'splash');render();
    }''')
    await play(page,'seal_silence',0)
    assert await page.locator('.silence-badge').inner_text()=='⊘ Silence 2'
    assert await page.evaluate('battle.board[0][4].silenceUntil')==2
    # Une carte de classe demeure utilisable sur la créature réduite au silence.
    await page.evaluate('()=>{battle.board[1][2]=__unit("wolf","p",91,"haste");battle.board[1][2].silenceUntil=2;render()}')
    await play(page,'skill_guard_wall',1)
    assert await page.evaluate('battle.board[1][2].barrier')==2
    await page.evaluate('()=>{battle.heroes.p.hand=[{id:"transposition",wait:0}];battle.heroes.p.cardsPlayed=0;render()}')
    await page.locator('.hand [data-action="select-card"]').click()
    assert 'Ligne 3' in await page.locator('.teleport-preview').inner_text()
    await page.locator('[data-action="deploy"][data-lane="2"]').click()
    assert await page.evaluate('battle.board[2][2].uid')==91
    assert await page.evaluate('battle.board[1][2]') is None
    await page.locator('.combat-fx.vfx-moving').wait_for(state='visible',timeout=1500)
    await page.wait_for_timeout(700)
    await play(page,'rune_trap',2)
    assert await page.locator('.terrain-trap').count()==1
    assert 'ALLIÉ' in await page.locator('.terrain-trap').inner_text()
    saved=await page.evaluate('window.__saves')
    await page.close()
    page=await make_page(browser,viewport,saved,errors)
    assert await page.evaluate('battle.traps[0].owner')=='p'
    assert await page.evaluate('battle.traps[0].expiresRound')==3
    assert await page.locator('.silence-badge').count()==2
    await page.evaluate('''()=>{
      battle.board[2][2]=null;
      battle.board[2][4]={uid:92,id:'militia',side:'e',atk:1,hp:10,maxhp:10,armor:0,ranged:false,ability:'',stun:0,poison:0,poisonTurns:0};
      render();
    }''')
    await page.locator('[data-action="end-turn"]').click()
    assert await page.evaluate('battle.traps.length')==0
    assert await page.evaluate('battle.board[2].find(u=>u?.uid===92).hp')==7
    assert 'Piège déclenché' in await page.locator('.log-list').inner_text()
    assert await page.locator('.turn-n').inner_text()=='2'
    await page.wait_for_timeout(2600)
    await page.emulate_media(reduced_motion='reduce')
    await page.locator('[data-action="end-turn"]').click()
    assert await page.locator('.silence-badge').count()==0
    assert await page.locator('.battle-grid .lane-row').count()==3
    # Chargement d'un combat historique sans aucune propriété V2.9.
    legacy=await page.evaluate('''()=>{
      delete battle.traps;
      for(const u of battle.board.flat())if(u){delete u.silenceUntil;delete u.silenceGuardUntil;delete u.teleportedRound;delete u.controlReadyRound;}
      persistBattle();return __saves;
    }''')
    await page.close()
    page=await make_page(browser,viewport,legacy,errors)
    await page.locator('[data-action="end-turn"]').click()
    assert await page.locator('.turn-n').inner_text()=='4'
    assert not errors,errors
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
    await page.screenshot(path=f'/tmp/ca-v29-{label}.png',full_page=True)
    await page.close()
    print(f'V2.9 {label}: six cartes, trois effets, compétences V2.8, reprise historique, réduction des animations PASS')

async def production(browser,label,viewport):
    # Véritable export autonome, localStorage réel et rechargement du fichier.
    page=await browser.new_page(viewport=viewport,is_mobile=label=='mobile',has_touch=label=='mobile')
    errors=[];requests=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.on('request',lambda request:requests.append(request.url))
    await page.goto((ROOT/'JOUER.html').as_uri())
    await page.locator('[data-action="welcome-start"]').click()
    await page.locator('.hand .unit-card:not(.on-cooldown)').first.click()
    await page.locator('[data-action="deploy"][data-lane="0"]').click()
    await page.locator('[data-action="end-turn"]').click()
    await page.wait_for_timeout(3000)
    await page.reload()
    assert await page.locator('.turn-n').inner_text()=='2'
    assert await page.evaluate('typeof window.battle')=='undefined'
    await page.locator('[data-action="retreat"]').click()
    await page.locator('[data-action="confirm-retreat"]').click()
    await page.locator('[data-action="battle-deck"]').click()
    assert await page.locator('.collection-layout .unit-card').count()==76
    await page.locator('#nav [data-page="forge"]').click()
    assert await page.locator('.forge-tile').count()>0
    assert not errors,errors
    assert not any(url.startswith(('http:','https:')) for url in requests),requests
    await page.close()
    print(f'Production {label}: hors ligne, stockage réel, reprise, fin de combat, collection et atelier PASS')

async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True,args=['--no-sandbox'])
        for label,viewport in [('desktop',{'width':1366,'height':900}),('mobile',{'width':390,'height':844})]:
            await run(browser,label,viewport)
            await production(browser,label,viewport)
        await browser.close()
if __name__=='__main__':asyncio.run(main())
