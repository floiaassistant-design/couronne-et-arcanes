"""Composition immersive : vraie surface du plateau, main, journal et lecture."""
import asyncio,base64
from playwright.async_api import async_playwright
from browser_class_skills_v28 import make_page

async def run(browser,label,viewport):
    errors=[]
    page=await make_page(browser,viewport,{},errors,touch=label!='desktop')
    await page.locator('[data-action="welcome-start"]').click()
    stage=await page.locator('.combat-stage').bounding_box()
    grid=await page.locator('.battle-grid').bounding_box()
    dock=await page.locator('.combat-hand-dock').bounding_box()
    assert stage['height']>=viewport['height']-2,(label,stage)
    assert grid['y']+grid['height']<=dock['y']+1,(grid,dock)
    assert dock['y']+dock['height']<=viewport['height']+1,dock
    assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+2')
    frame=await page.locator('.arena-painted-frame').bounding_box()
    assert frame['width']>=max(960,viewport['width'])-2,(frame,viewport)
    notes=page.locator('.combat-notes')
    assert await notes.get_attribute('open') is None
    await notes.locator('summary').click()
    assert await notes.locator('.log-list').is_visible()
    dock=await page.locator('.combat-hand-dock').bounding_box()
    drawer=await notes.locator('.combat-notes-body').bounding_box()
    assert drawer['y']>=-1 and drawer['y']+drawer['height']<dock['y'],(drawer,dock)
    await notes.locator('summary').click()
    await page.evaluate('''()=>{
      battle=createBattle(profile,{id:'01',name:'La Porte des Serments',enemy:'Veilleur des Portes',hp:80,difficulty:3,deck:[]},219);
      const unit=(id,side,uid)=>({id,side,uid,atk:3,hp:9,maxhp:10,armor:0,ability:'',ranged:id==='archer',stun:0,poison:0,poisonTurns:0});
      battle.board[0][2]=unit('shield','p',1);battle.board[1][4]=unit('archer','p',2);battle.board[1][7]=unit('lich','e',3);battle.board[2][8]=unit('golem','e',4);battle.board[2][3]=unit('militia','p',5);
      battle.heroes.p.hand=[{id:'militia',wait:0},{id:'archer',wait:2},{id:'shield',wait:1},{id:'healing',wait:0},{id:'cleric',wait:2},{id:'firebolt',wait:1}];render();
    }''')
    await page.locator('.hand img').evaluate_all('imgs=>Promise.all(imgs.map(img=>img.decode()))')
    await page.screenshot(path=f'/tmp/ca-immersive-{label}.png',full_page=True)
    review=await page.screenshot(path=f'/tmp/ca-immersive-{label}.jpg',type='jpeg',quality=82)
    print('CA_IMMERSIVE_'+label.upper()+':'+base64.b64encode(review).decode(),flush=True)
    await page.locator('.hand .hand-card').nth(1).click(position={'x':10,'y':20})
    inspection=page.locator('.hand-card-inspection')
    assert await inspection.is_visible()
    inspection_box=await inspection.bounding_box()
    hand=await page.locator('.hand').bounding_box()
    assert inspection_box['y']+inspection_box['height']<=hand['y']+2,(inspection_box,hand)
    grid=await page.locator('.battle-grid').bounding_box()
    dock=await page.locator('.combat-hand-dock').bounding_box()
    assert grid['y']+grid['height']<=dock['y']+1,(grid,dock)
    await page.locator('[data-action="close-inspection"]').click()
    assert not errors,errors
    await page.close()
    print('Composition immersive '+label+' PASS')

async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True,args=['--no-sandbox'])
        for label,viewport in [('desktop',{'width':1366,'height':900}),('mobile',{'width':390,'height':844}),('landscape',{'width':844,'height':390})]:
            await run(browser,label,viewport)
        await browser.close()

if __name__=='__main__':asyncio.run(main())
