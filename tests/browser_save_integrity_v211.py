from browser_spell_actions import target_spell
from browser_pending_results import run_pending_results
"""V2.11: final reward persistence, interrupted settlement, and storage errors."""
import asyncio
import json
from playwright.async_api import async_playwright
from browser_class_skills_v28 import make_page

VIEWPORT={'width':390,'height':844}
SAVE='couronnes_arcanes_v1'
BATTLE='couronnes_arcanes_bataille_v1'

async def finish_page(browser,animated):
    errors=[]
    page=await make_page(browser,VIEWPORT,{},errors)
    await page.locator('[data-action="welcome-start"]').click()
    if not animated:
        await page.locator('[data-action="toggle-animations"]').click()
    await page.evaluate("""() => {
      battle.heroes.e.hp=2;battle.heroes.e.shield=0;
      battle.heroes.p.hand=[{id:'firebolt',wait:0}];
      persistBattle();render();
    }""")
    await page.locator('.hand [data-action="select-card"]').first.click()
    await target_spell(page,0)
    saved=await page.evaluate("() => JSON.parse(JSON.stringify(window.__saves))")
    assert json.loads(saved[SAVE])['wins']==1,saved[SAVE]
    assert BATTLE not in saved,saved
    assert await page.evaluate('battle.rewardGiven === true')
    assert not errors,errors
    return page,saved,errors

async def run(browser):
    for enabled in [True,False]:
        page,saved,errors=await finish_page(browser,enabled)
        # Simulate a crash after the profile receipt is durable but before
        # the pending battle key is removed.
        terminal=await page.evaluate("""() => {
          const b=JSON.parse(JSON.stringify(battle));delete b.rewardGiven;return b;
        }""")
        saved[BATTLE]=json.dumps(terminal)
        await page.close()
        resumed=await make_page(browser,VIEWPORT,saved,errors)
        state=await resumed.evaluate("""() => ({
          wins:profile.wins, saved:JSON.parse(window.__saves.couronnes_arcanes_v1).wins,
          battlePresent:Boolean(window.__saves.couronnes_arcanes_bataille_v1)
        })""")
        assert state=={'wins':1,'saved':1,'battlePresent':False},state
        assert not errors,errors
        await resumed.close()
    errors=[]
    page=await make_page(browser,VIEWPORT,{},errors)
    await page.locator('[data-action="welcome-start"]').click()
    await page.evaluate("""() => {
      const saved=JSON.parse(JSON.stringify(battle));
      saved.status='victory';saved.phase='finished';saved.heroes.e.hp=0;
      window.__saves.couronnes_arcanes_bataille_v1=JSON.stringify(saved);
    }""")
    cache=await page.evaluate("() => JSON.parse(JSON.stringify(window.__saves))")
    await page.close()
    resumed=await make_page(browser,VIEWPORT,cache,errors)
    assert await resumed.evaluate('profile.wins')==1
    assert await resumed.evaluate("Boolean(window.__saves.couronnes_arcanes_bataille_v1)")==False
    assert not errors,errors
    await resumed.close()
    failure=await make_page(browser,VIEWPORT,{},errors)
    await failure.locator('[data-action="welcome-start"]').click()
    result=await failure.evaluate("""() => {
      window.localStorage.setItem=(key,value)=>{
        if(key==='couronnes_arcanes_bataille_v1')throw Error('quota');
        window.__saves[key]=String(value);
      };
      return persistBattle();
    }""")
    assert result==False
    assert 'Combat non sauvegardé' in await failure.locator('#toast').inner_text()
    assert not errors,errors
    await failure.close()
    # Profil illisible : aucune sauvegarde neuve ne remplace le texte initial.
    corrupt='{fragment incomplet'
    broken=await make_page(browser,VIEWPORT,{SAVE:corrupt},errors)
    assert await broken.locator('#recovery-title').count()==1
    assert await broken.locator('#nav button').count()==0
    assert await broken.evaluate('window.__saves.couronnes_arcanes_v1')==corrupt
    await broken.locator('[data-action="export-unreadable-save"]').click()
    assert await broken.evaluate('window.__saves.couronnes_arcanes_v1')==corrupt
    await broken.close()
    # Réimporter une copie saine doit lever le blocage, sans remise à zéro implicite.
    donor=await make_page(browser,VIEWPORT,{},errors)
    await donor.locator('[data-action="welcome-guide"]').click()
    backup=await donor.evaluate('window.__saves.couronnes_arcanes_v1')
    await donor.close()
    recovered=await make_page(browser,VIEWPORT,{SAVE:corrupt},errors)
    await recovered.locator('#import-file').set_input_files({'name':'backup.json','mimeType':'application/json','buffer':backup.encode()})
    assert await recovered.locator('#recovery-title').count()==0
    assert await recovered.evaluate('JSON.parse(window.__saves.couronnes_arcanes_v1).deck.length')==18
    assert not errors,errors
    await recovered.close()
    # Les achats ne sont confirmés que si la nouvelle progression a été enregistrée.
    page=await make_page(browser,VIEWPORT,{},errors)
    await page.locator('[data-action="welcome-guide"]').click()
    await page.locator('[data-action="nav"][data-page="forge"]').click()
    before=await page.evaluate('window.__saves.couronnes_arcanes_v1')
    await page.evaluate("""() => {const original=localStorage.setItem.bind(localStorage);
      localStorage.setItem=(k,v)=>{if(k==='couronnes_arcanes_v1')throw Error('quota');original(k,v)};
    }""")
    await page.locator('[data-action="craft-equipment"][data-id="lame"]').click()
    assert await page.evaluate('window.__saves.couronnes_arcanes_v1')==before
    assert await page.evaluate('profile.gold')==110
    assert 'non enregistrée' in await page.locator('#toast').inner_text()
    assert not errors,errors
    await page.close()
    await run_pending_results(browser)
    print('V2.11 persistence: animated/static victory, duplicate receipt, interrupted close, failed storage PASS')

async def main():
    async with async_playwright() as pw:
        browser=await pw.chromium.launch(headless=True,args=['--no-sandbox'])
        await run(browser)
        await browser.close()

if __name__=='__main__':
    asyncio.run(main())
