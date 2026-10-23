"""Carte v02 réelle : cadre complet, zones dynamiques, pose, blessures et reprise."""
import asyncio,base64,hashlib
from pathlib import Path
from playwright.async_api import async_playwright
ROOT=Path(__file__).resolve().parents[1]
SHA='7900c39aed106d66cf92a31bee39de56135998b32b41160d6ab07f9e50281794'

async def image_exact(face):
    img=face.locator('.generated-card-image')
    await img.evaluate('(e)=>e.decode()')
    assert await img.evaluate('(e)=>[e.naturalWidth,e.naturalHeight]')==[768,1152]
    src=await img.get_attribute('src')
    assert hashlib.sha256(base64.b64decode(src.split(',',1)[1])).hexdigest()==SHA
    bounds=await face.bounding_box();assert abs(bounds['width']/bounds['height']-2/3)<.012,bounds
    assert await face.locator('[data-card-field="counter"]').is_visible()
    assert await face.locator('[data-card-field]').evaluate_all('''els=>els.every(e=>{
      const r=e.getBoundingClientRect(),p=e.closest('.generated-face').getBoundingClientRect();
      return r.x>=p.x && r.y>=p.y && r.right<=p.right+1 && r.bottom<=p.bottom+1 && e.scrollWidth<=e.clientWidth+1 && e.scrollHeight<=e.clientHeight+1;
    })''')

async def run(browser,label,vp):
    ctx=await browser.new_context(viewport=vp,offline=True,reduced_motion='reduce',has_touch=label!='desktop')
    page=await ctx.new_page();errors=[];external=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda r:external.append(r.url) if r.url.startswith(('http:','https:')) else None)
    # Le job validation construit JOUER.test ; le paramètre active le même rendu cartes.
    await page.goto((ROOT/'tests/JOUER.test.html').as_uri()+'?cartes=1')
    await page.locator('[data-action="welcome-guide"]').click();await page.locator('#nav [data-page="collection"]').click()
    row=page.locator('[data-collection-character="militia"]')
    before=await page.evaluate('JSON.stringify(profile)')
    await image_exact(row.locator('[data-current-version="true"] .generated-face'))
    assert await row.locator('.generated-face').count()==6
    assert await row.locator('[data-current-version="false"] .stat.hp b').all_inner_texts()==['—']*5
    await row.locator('[data-current-version="true"] [data-action="collection-inspect"]').click()
    await image_exact(page.locator('.collection-inspection .generated-face'))
    await page.screenshot(path=f'/tmp/ca-milicien-{label}-fiche.png')
    await page.keyboard.press('Escape');assert await page.evaluate('JSON.stringify(profile)')==before
    await page.locator('#nav [data-page="campaign"]').click();await page.locator('[data-action="start-mission"][data-id="01"]').click()
    await page.evaluate('''()=>{
      battle=createBattle(profile,{id:'01',name:'Milicien intégré',enemy:'Sentinelle',hp:80,difficulty:1,deck:[]},415);
      battle.heroes.e.deck=[];battle.heroes.e.hand=[];
      battle.heroes.p.hand=[{id:'militia',wait:0},{id:'militia',wait:3},{id:'archer',wait:1}];
      persistBattle();render();
    }''')
    hand=page.locator('.hand-card[data-index="0"]')
    await image_exact(hand.locator('.generated-face'))
    assert await page.locator('.hand .generated-counter b').all_inner_texts()==['0','3','1']
    assert await hand.locator('.stat.atk b').inner_text()=='2';assert await hand.locator('.stat.hp b').inner_text()=='5'
    await page.screenshot(path=f'/tmp/ca-milicien-{label}-main.png')
    await hand.click();assert await page.locator('#hand-card-inspection').is_hidden()
    await page.locator('[data-action="deploy"][data-col="1"][data-lane="0"]').click()
    card=page.locator('.board-card[data-card-id="militia"]')
    assert await card.count()==1;await image_exact(card.locator('.generated-face'))
    await page.evaluate('''()=>{const u=battle.board[0][1];u.hp=12;u.maxhp=15;u.atk=11;persistBattle();render()}''')
    assert await card.locator('.stat.atk b').inner_text()=='11';assert await card.locator('.stat.hp b').inner_text()=='12'
    await image_exact(card.locator('.generated-face'))
    await page.keyboard.press('Tab')  # Vraie navigation clavier après le remplacement du DOM.
    await card.focus();assert await page.locator('#hand-card-inspection').is_visible()
    assert 'PV 12/15' in await page.locator('#hand-card-inspection').inner_text()
    await page.screenshot(path=f'/tmp/ca-milicien-{label}-plateau.png')
    await page.keyboard.press('Escape');await page.locator('[data-action="end-turn"]').click()
    await page.wait_for_function('()=>battle.round>=2')
    assert await page.evaluate('battle.round')==2
    await page.reload();assert await page.evaluate('battle.round')==2
    assert await page.locator('.board-card[data-card-id="militia"] .stat.hp b').inner_text()=='12'
    assert await page.locator('[data-action="toggle-card-arena"]').count()==0
    assert await page.locator('.sprite-figure').count()==0
    assert not errors,errors;assert not external,external
    await ctx.close();print(f'Milicien {label}: export exact, champs alignés, valeurs actuelles, vraie pose, tour et reprise PASS',flush=True)
async def main():
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True,args=['--no-sandbox'])
        for label,vp in [('desktop',{'width':1440,'height':1000}),('portrait',{'width':390,'height':844}),('landscape',{'width':844,'height':390})]:await run(browser,label,vp)
        await browser.close()
if __name__=='__main__':asyncio.run(main())
