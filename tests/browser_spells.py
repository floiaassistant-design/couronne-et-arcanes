from browser_spell_actions import target_spell
"""23 sorts exacts : trois champs, attente, aperçu et lancement par la vraie UI."""
import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright,expect
from browser_aube import exact,ROOT,ASSETS

IDS=[a['cardId'] for a in json.loads((ROOT/'docs/approvals/sorts-vingt-trois-cartes-20261023.json').read_text())['assets']]
CLASSES={
    'skill_guard_wall':'gardien','skill_guard_rally':'gardien',
    'skill_arc_freeze':'arcaniste','skill_arc_chain':'arcaniste',
    'skill_ranger_pierce':'rodeur','skill_ranger_draw':'rodeur',
    'skill_cleric_light':'clerc','skill_cleric_bless':'clerc'
}

async def spell_face(face,card_id):
    # Attendre l'identité attendue avant de décoder : le focus et le survol
    # peuvent remplacer le contenu de la fiche entre deux commandes Playwright.
    await expect(face).to_have_attribute('data-card-template',ASSETS[card_id]['key'])
    await exact(face,card_id)
    assert await face.get_attribute('data-generated-layout')=='sort'
    assert await face.locator('[data-card-field]').count()==3
    assert await face.locator('.card-stats,.stat.atk,.stat.hp').count()==0

async def run(browser,label,viewport):
    ctx=await browser.new_context(viewport=viewport,offline=True,reduced_motion='reduce')
    page=await ctx.new_page();errors=[];network=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda r:network.append(r.url) if r.url.startswith(('http:','https:')) else None)
    await page.goto((ROOT/'tests/JOUER.test.html').as_uri())
    await page.locator('[data-action="welcome-guide"]').click()
    await page.locator('#nav [data-page="collection"]').click()
    await page.locator('[data-action="collection-faction"][data-id="sort"]').click()
    before=await page.evaluate('JSON.stringify(profile)')
    assert await page.locator('.collection-spells .generated-face').count()==23
    for card_id in IDS:
        await spell_face(page.locator(f'.collection-spells [data-card-template="{ASSETS[card_id]["key"]}"]'),card_id)
    assert await page.evaluate('JSON.stringify(profile)')==before
    await page.locator('.collection-spells').scroll_into_view_if_needed()
    await page.screenshot(path=f'/tmp/ca-spells-{label}-collection.png')
    await page.locator('#nav [data-page="campaign"]').click()
    await page.locator('[data-action="start-mission"][data-id="01"]').click()
    for card_id in IDS:
        lane=1 if card_id=='transposition' else 0
        # Le pointeur du clic précédent ne doit pas viser une autre carte
        # pendant ce parcours au clavier (notamment après un scroll mobile).
        await page.mouse.move(1,1)
        await page.evaluate('''({id,heroClass})=>{
          battle=createBattle(profile,{id:'01',name:'Revue des sorts',enemy:'Bastion',hp:100,difficulty:1,deck:['militia']},415);
          battle.heroClass=heroClass;
          battle.heroes.p.hand=[{id:'militia',wait:0}];playPlayerCard(battle,0,0,3);
          const u=battle.board[0][3];u.hp=2;
          battle.board[0][7]={...u,uid:999,id:'wolf',side:'e',hp:30,maxhp:30,ability:'haste'};
          battle.heroes.p.hp=10;battle.heroes.p.cardsPlayed=0;
          battle.heroes.e.hand=[{id:'militia',wait:1}];
          battle.heroes.p.deck=['militia','militia'];
          battle.heroes.p.hand=[{id,wait:2},{id:'militia',wait:4}];
          persistBattle();render();
        }''',{'id':card_id,'heroClass':CLASSES.get(card_id,'gardien')})
        face=page.locator('.hand-card[data-index="0"] .generated-face')
        await spell_face(face,card_id)
        assert await face.locator('.generated-counter b').inner_text()=='2'
        await page.keyboard.press('Tab');await page.locator('.hand-card[data-index="0"]').focus()
        panel=page.locator('#hand-card-inspection')
        await expect(panel).to_be_visible()
        await spell_face(panel.locator(f'[data-card-template="{ASSETS[card_id]["key"]}"]'),card_id)
        assert 'Attente 2 tours' in await panel.inner_text()
        assert await panel.locator('.inspection-stats').count()==0
        await page.keyboard.press('Escape')
        await page.evaluate('battle.heroes.p.hand[0].wait=0;render()')
        await page.locator('.hand-card[data-index="0"]').click()
        assert await panel.is_hidden()
        await target_spell(page,lane)
        assert await page.evaluate('(id)=>battle.heroes.p.discard.includes(id)',card_id),card_id
        assert await page.evaluate('(id)=>!battle.heroes.p.hand.some(c=>c.id===id)',card_id),card_id
    await page.screenshot(path=f'/tmp/ca-spells-{label}-combat.png')
    snapshot=await page.evaluate('JSON.stringify(battle)')
    await page.reload();assert await page.evaluate('JSON.stringify(battle)')==snapshot
    assert not errors,errors;assert not network,network
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
    await ctx.close()
    print(f'Sorts {label}: 23 exports exacts, trois champs, aperçus, vraies poses et reprise hors réseau PASS',flush=True)

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,args=['--no-sandbox'])
        for label,vp in [('desktop',{'width':1440,'height':1000}),('portrait',{'width':390,'height':844}),('landscape',{'width':844,'height':390})]:
            await run(browser,label,vp)
        await browser.close()

if __name__=='__main__':asyncio.run(main())
