"""Contrôle partagé des cartes complètes : Collection, main et sceaux des deux camps."""
import asyncio,base64,hashlib,json
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
ASSETS={a['cardId']:a for a in json.loads((ROOT/'assets/artwork.json').read_text())['assets']}
FACTION_IDS={
    'aube':{'militia','shield','archer','lancer','cleric','banner','scoutcaptain','paladin','sunpriest','dawnbastion'},
    'sylve':{'treant','ranger','wolf','dryad','stag','thorn','pixie','bear','archdruid','owl','sylvan_trapper'}
}

async def exact(face,card_id,readable=True):
    img=face.locator('.generated-card-image');await img.evaluate('(e)=>e.decode()')
    assert await img.evaluate('(e)=>[e.naturalWidth,e.naturalHeight]')==[768,1152]
    src=await img.get_attribute('src')
    assert hashlib.sha256(base64.b64decode(src.split(',',1)[1])).hexdigest()==ASSETS[card_id]['sha256']
    assert await face.get_attribute('data-card-template')==ASSETS[card_id]['key']
    fields='[data-card-field]' if readable else '[data-card-field="counter"], [data-card-field="attack"], [data-card-field="health"]'
    assert await face.locator(fields).evaluate_all('''els=>els.every(e=>{
          const r=e.getBoundingClientRect(),p=e.closest('.generated-face').getBoundingClientRect();
          return r.x>=p.x && r.y>=p.y && r.right<=p.right+1 && r.bottom<=p.bottom+1 && e.scrollWidth<=e.clientWidth+1 && e.scrollHeight<=e.clientHeight+1;
        })'''),card_id

async def run(browser,label,viewport,faction='aube'):
    ctx=await browser.new_context(viewport=viewport,offline=True,reduced_motion='reduce')
    page=await ctx.new_page();errors=[];network=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda r:network.append(r.url) if r.url.startswith(('http:','https:')) else None)
    await page.goto((ROOT/'tests/JOUER.test.html').as_uri()+'?cartes=1')
    await page.locator('[data-action="welcome-guide"]').click()
    await page.locator('#nav [data-page="collection"]').click()
    await page.locator(f'[data-action="collection-faction"][data-id="{faction}"]').click()
    before=await page.evaluate('JSON.stringify(profile)')
    assets={card_id:ASSETS[card_id] for card_id in FACTION_IDS[faction]}
    assert await page.locator('[data-collection-character]').count()==len(assets)
    for card_id in assets:
        row=page.locator(f'[data-collection-character="{card_id}"]')
        assert await row.locator('.generated-face').count()==6,card_id
        await exact(row.locator('[data-current-version="true"] .generated-face'),card_id)
        assert await row.locator('[data-current-version="false"] .stat.hp b').all_inner_texts()==['—']*5
        await row.locator('[data-current-version="true"] [data-action="collection-inspect"]').click()
        await exact(page.locator('.collection-inspection .generated-face'),card_id)
        await page.keyboard.press('Escape')
    assert await page.evaluate('JSON.stringify(profile)')==before
    await page.locator(f'[data-collection-character="{"shield" if faction=="aube" else "treant"}"]').scroll_into_view_if_needed()
    await page.screenshot(path=f'/tmp/ca-{faction}-{label}-collection.png')
    await page.locator('#nav [data-page="campaign"]').click()
    await page.locator('[data-action="start-mission"][data-id="01"]').click()
    # Contrôle de chaque cadre dans la vraie main puis sur le plateau. Pose par l'API
    # normale ; copie adverse uniquement pour vérifier le rendu des deux camps.
    for card_id in assets:
        await page.evaluate('''id=>{
          battle=createBattle(profile,{id:'01',name:'Revue de l’Aube',enemy:'Bastion',hp:80,difficulty:1,deck:[]},415);
          battle.heroes.p.hand=[{id,wait:0}];render();
        }''',card_id)
        await exact(page.locator('.hand-card .generated-face'),card_id)
        await page.locator('.hand-card').click()
        await page.locator('[data-action="deploy"][data-col="3"][data-lane="0"]').click()
        await page.evaluate('''()=>{
          const u=battle.board[0][3];u.hp=Math.max(1,u.maxhp-1);
          battle.board[0][4]={...u,side:'e',uid:999};persistBattle();render();
        }''')
        await page.mouse.move(1,1);await page.keyboard.press('Escape')
        for side in ['p','e']:
            card=page.locator(f'.board-card[data-side="{side}"]')
            await exact(card.locator('.generated-face'),card_id,False)
            seal=card.locator(f'.board-camp-seal[data-camp="{side}"]')
            await seal.scroll_into_view_if_needed()
            assert await seal.is_visible()
            assert await seal.evaluate('''e=>{
              const r=e.getBoundingClientRect(),x=r.x+r.width/2,y=r.y+r.height/2;
              return document.elementsFromPoint(x,y).some(el=>el===e||el.contains(e));
            }'''),(label,card_id,side)
            hp=await page.evaluate('battle.board[0][3].hp')
            assert await card.locator('.stat.hp b').inner_text()==str(hp)
        assert await page.locator('.board-card-health').count()==0
    await page.screenshot(path=f'/tmp/ca-{faction}-{label}-sceaux.png')
    await page.keyboard.press('Tab')
    await page.locator('.board-card[data-side="e"]').focus()
    assert 'Unité adverse' in await page.locator('#hand-card-inspection').inner_text()
    assert 'PV ' in await page.locator('#hand-card-inspection').inner_text()
    await page.keyboard.press('Escape')
    snapshot=await page.evaluate('JSON.stringify(battle)')
    await page.reload();assert await page.evaluate('JSON.stringify(battle)')==snapshot
    assert await page.locator('.board-camp-seal[data-camp="e"]').count()>=1
    assert not errors,errors;assert not network,network
    await ctx.close();print(f'{faction} {label}: {len(assets)} exports exacts, {len(assets)*6} projections, champs, poses, deux sceaux et reprise hors réseau PASS',flush=True)

async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,args=['--no-sandbox'])
        for label,vp in [('desktop',{'width':1440,'height':1000}),('portrait',{'width':390,'height':844}),('landscape',{'width':844,'height':390})]:await run(browser,label,vp)
        await browser.close()
if __name__=='__main__':asyncio.run(main())
