"""Arène peinte : clics projetés, ancrages, rendu fixe et main entièrement lisible."""
import asyncio
from playwright.async_api import async_playwright
from browser_class_skills_v28 import make_page

async def run(browser,label,viewport):
    errors=[]
    page=await make_page(browser,viewport,{},errors)
    await page.locator('[data-action="welcome-start"]').click()
    for lanes in [2,3,4]:
        await page.evaluate('''n=>{
          battle=createBattle(profile,{id:'01',name:'Arène peinte',enemy:'Sentinelle',hp:80,difficulty:n===3?3:1,boss:n===4,deck:[]},213);
          battle.heroes.e.deck=[];battle.heroes.e.hand=[];render();
        }''',lanes)
        for lane in range(lanes):
            await page.evaluate('''()=>{battle.heroes.p.hand=[{id:'militia',wait:0}];battle.heroes.p.cardsPlayed=0;render();}''')
            await page.mouse.move(0,0)
            await page.keyboard.press('Escape')
            card=page.locator('.hand [data-action="select-card"]').first
            await card.click()
            target=page.locator(f'[data-action="deploy"][data-col="1"][data-lane="{lane}"]')
            await target.scroll_into_view_if_needed()
            await target.click()
            assert await page.evaluate('(l)=>battle.board[l][1]?.id',lane)=='militia'
        assert await page.locator('.arena-hero-slot').count()==2
        assert await page.locator('.arena-hero-slot img').count()==0
        assert await page.locator('.unit-on-board[data-animation-state="idle"]').count()==lanes
        assert await page.locator('.board-card').evaluate_all("els=>els.every(el=>getComputedStyle(el).animationName==='none')")
        assert await page.locator('.battle-vfx-overlay').count()==0
        await page.evaluate('''()=>{const g=document.querySelector('.battle-grid');g.scrollLeft=9999;g.scrollTop=9999;}''')
        before=await page.evaluate("()=>{const g=document.querySelector('.battle-grid');return [g.scrollLeft,g.scrollTop]}")
        await page.evaluate('render()')
        after=await page.evaluate("()=>{const g=document.querySelector('.battle-grid');return [g.scrollLeft,g.scrollTop]}")
        assert before==after,(label,before,after)
        await page.evaluate('''()=>{battle.heroes.p.hand=[{id:'militia',wait:0},{id:'archer',wait:2}];render();}''')
        dimensions=await page.locator('.hand .unit-card').evaluate_all('''cards=>cards.map(card=>{
          const box=card.getBoundingClientRect();const stats=card.querySelector('.card-stats').getBoundingClientRect();
          return {bottom:box.bottom,statsBottom:stats.bottom,statsTop:stats.top,top:box.top};
        })''')
        assert all(d['statsBottom']<=d['bottom']+1 and d['statsTop']>=d['top'] for d in dimensions),(label,dimensions)
    assert not errors,errors
    await page.close()
    print(f'Arène peinte {label}: clics 2/3/4, pieds, héros réservés, statique, défilements et statistiques PASS')

async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True,args=['--no-sandbox'])
        for label,viewport in [('desktop',{'width':1366,'height':900}),('mobile',{'width':390,'height':844}),('landscape',{'width':844,'height':390})]:
            await run(browser,label,viewport)
        await browser.close()
if __name__=='__main__':asyncio.run(main())
