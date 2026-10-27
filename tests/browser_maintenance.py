"""Comparer deux versions rendues : DOM, styles calculés, géométrie et pixels.
Usage: python3 tests/browser_maintenance.py --reference /chemin/checkout-reference
Les deux checkouts doivent avoir leur export de diagnostic régénéré. Aucun réseau.
"""
import argparse,asyncio,hashlib,json
from pathlib import Path
from playwright.async_api import async_playwright

ROOT=Path(__file__).resolve().parents[1]
SNAPSHOT=r"""async()=>{
 const nodes=[...document.querySelectorAll('body,body *')].filter(e=>!['SCRIPT','STYLE'].includes(e.tagName));
 const longValues=new Map();
 const intern=v=>{if(v.length<512)return v;if(!longValues.has(v))longValues.set(v,longValues.size);return 'LONG:'+longValues.get(v)};
 // Les images embarquées dans des variables héritées atteignent 900 Ko.
 // Lire une seule fois celles définies sur :root ou un conteneur d'image unique.
 // Une déclaration ailleurs (même inline/keyframe) conserve la lecture complète.
 const definitions=new Map(),registered=new Set();
 const inspect=rules=>{for(const r of rules){
  if(r.constructor.name==='CSSPropertyRule')registered.add(r.name);
  if(r.style)for(const k of r.style)if(k.startsWith('--')){
   if(!definitions.has(k))definitions.set(k,new Set());
   definitions.get(k).add(r.selectorText||'non-root');
  }
  if(r.cssRules)inspect(r.cssRules);
 }};
 for(const sheet of document.styleSheets)inspect(sheet.cssRules);
 const rootValues=new Map(),scopedValues=new Map(),rootStyle=getComputedStyle(document.documentElement);
 const pageRoot=location.href.replace(/[^/]+$/,'');
 const normalize=v=>v.replaceAll(pageRoot,'ROOT/');
 for(const [k,selectors] of definitions){
  if(registered.has(k)||selectors.size!==1||nodes.some(e=>e.style.getPropertyValue(k)))continue;
  const selector=[...selectors][0];
  if(selector===':root'){
   const value=rootStyle.getPropertyValue(k);if(value.length>=512)rootValues.set(k,normalize(value));
  }else if(/^\[data-[\w-]+="[\w-]+"\]$/.test(selector)){
   scopedValues.set(k,{selector,values:new WeakMap()});
  }
 }
 const rows=nodes.map(e=>{
  const rect=e.getBoundingClientRect();
  const styles=['','::before','::after'].map(p=>{
   const s=getComputedStyle(e,p||null);
   // Sans contenu, ::before/::after ne génère aucune boîte à comparer.
   if(p&&['none','normal'].includes(s.content))return 'content:'+s.content;
   // CSSOM peut exposer une marge utilisée négative pour un bloc débordant.
   // Typed OM garde la valeur calculée auto ; les rectangles sont comparés à part.
   const typed=!p&&e.computedStyleMap?.();
   return [...s].sort().map(k=>{
    if(rootValues.has(k))return k+':'+intern(rootValues.get(k));
    if(scopedValues.has(k)){
     const {selector,values}=scopedValues.get(k),owner=e.closest(selector);
     if(owner){
      if(!values.has(owner))values.set(owner,normalize(getComputedStyle(owner).getPropertyValue(k)));
      return k+':'+intern(values.get(owner));
     }
    }
    const value=typed&&k.startsWith('margin-')?typed.get(k)?.toString()||s.getPropertyValue(k):s.getPropertyValue(k);
    return k+':'+intern(normalize(value));
   }).join(';');
  });
  return [e.tagName,[...e.attributes].filter(a=>!['src','style'].includes(a.name)).map(a=>[a.name,a.value]),
   [...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent),
   [rect.x,rect.y,rect.width,rect.height],styles];
 });
 window.__maintenanceRows=rows;
 const bytes=new TextEncoder().encode(JSON.stringify([rows,[...longValues.keys()]]));
 const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');
 return {hash,count:rows.length};
}"""

async def stable(page):
 await page.evaluate("""async()=>{
  await document.fonts.ready;
  await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{})}));
  for(const a of document.getAnimations())a.finish();
 }""")
 await page.mouse.move(0,0)
 await page.evaluate('window.scrollTo(0,0)')
 await page.evaluate('()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))')

async def capture(page):
 await stable(page)
 data=await page.evaluate(SNAPSHOT)
 data['pixels']=hashlib.sha256(await page.screenshot(animations='disabled')).hexdigest()
 return data

async def states(page):
 # Un même profil riche est injecté aux deux versions ; seuls les rendus sont comparés.
 await page.evaluate("""()=>{
  hideModal(); profile.welcomeSeen=true; profile.heroXp=2000;
  profile.gold=10000;profile.shards=10000;
  localStorage.setItem('couronnes_arcanes_animations_v13','off');selectedCard=-1;save();
 }""")
 for screen_name in ['home','campaign','tower','dungeons','alchemy','forge','guide']:
  await page.evaluate('(s)=>{screen=s;render()}',screen_name)
  yield screen_name
 for faction in ['aube','sylve','ombre','forge','ether','sort','all']:
  await page.evaluate("f=>{screen='collection';act('collection-faction',f);render()}",faction)
  yield 'collection-'+faction
 for phase in ['ready','choice','bonus']:
  await page.evaluate("p=>{profile.dungeonRun={id:'ysara',stage:1,phase:p,hp:22,maxhp:30};screen='dungeons';render()}",phase)
  yield 'donjon-'+phase
 # 2/3/4 lignes et ancien 3×5, présentation cartes, prête/attente, pièges et silence.
 for legacy,lanes in [(False,2),(False,3),(False,4),(True,3)]:
  await page.evaluate("""({legacy,lanes})=>{
   battle=createBattle(profile,{id:'01',name:'Audit',enemy:'Adversaire',hp:80,
    difficulty:lanes===3?3:1,boss:lanes===4,deck:[]},42,{legacy,turnFlow:legacy?undefined:'alternating'});
   battle.heroes.p.hand=[{id:'militia',wait:0},{id:'archer',wait:2},{id:'wolf',wait:0},{id:'shade',wait:0},{id:'smith',wait:0},{id:'spark',wait:0}];
   playPlayerCard(battle,0,0,1);battle.heroes.p.cardsPlayed=0;
   battle.board[0][1].silenceUntil=2;
   battle.traps=[{lane:1,col:2,owner:'e',kind:'snare',expiresRound:3}];
   screen='battle';selectedCard=-1;render();
  }""",dict(legacy=legacy,lanes=lanes))
  label=f'battle-{lanes}-legacy{legacy}-cartes'
  yield label
  await page.evaluate('selectedCard=1;render()')
  yield label+'-selection'
  await page.evaluate("battle.phase='enemy';selectedCard=-1;render()")
  yield label+'-enemy'

async def main(reference,only_case=None,only_viewport=None):
 async with async_playwright() as pw:
  browser=await pw.chromium.launch(headless=True,args=['--no-sandbox'])
  total=0
  for label,viewport in [('desktop',{'width':1366,'height':900}),('portrait',{'width':390,'height':844}),('landscape',{'width':844,'height':390})]:
   if only_viewport and label!=only_viewport:continue
   contexts=[];pages=[];errors=[]
   for root in [reference,ROOT]:
    ctx=await browser.new_context(viewport=viewport,offline=True,reduced_motion='reduce')
    page=await ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
    await page.add_init_script('Date.now=()=>12345')
    await page.goto((root/'tests/JOUER.test.html').as_uri())
    await page.evaluate("localStorage.clear();localStorage.setItem('couronnes_arcanes_animations_v13','off')");await page.reload()
    contexts.append(ctx);pages.append(page)
   iters=[states(p).__aiter__() for p in pages]
   while True:
    names=await asyncio.gather(*(anext(it,None) for it in iters))
    assert names[0]==names[1],names
    if names[0] is None:break
    if only_case and names[0]!=only_case:continue
    a,b=await asyncio.gather(*(capture(p) for p in pages))
    if a!=b:
     for suffix,p in zip(['reference','candidate'],pages):
      await p.screenshot(path=f'/tmp/ca-maintenance-{label}-{suffix}.png')
     rows=await asyncio.gather(*(p.evaluate('window.__maintenanceRows') for p in pages))
     differences=[(i,x,y) for i,(x,y) in enumerate(zip(*rows)) if x!=y]
     Path('/tmp/ca-maintenance-diff.json').write_text(json.dumps(differences,ensure_ascii=False))
     raise AssertionError((label,names,a,b,'differences',len(differences)))
    total+=1
    print(label,names[0],'identique',flush=True)
   assert not errors,errors
   for ctx in contexts:await ctx.close()
   print(label, 'DOM/styles/pixels identiques')
  await browser.close()
  print(total,'états comparés hors réseau')

async def modular():
 from functools import partial
 from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
 from threading import Thread
 class QuietHandler(SimpleHTTPRequestHandler):
  def log_message(self,*args):pass
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(ROOT)))
 Thread(target=server.serve_forever,daemon=True).start()
 try:
  async with async_playwright() as pw:
   browser=await pw.chromium.launch(headless=True,args=['--no-sandbox'])
   for label,viewport in [('desktop',{'width':1366,'height':900}),('portrait',{'width':390,'height':844}),('landscape',{'width':844,'height':390})]:
    context=await browser.new_context(viewport=viewport,reduced_motion='reduce')
    page=await context.new_page();errors=[];requests=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda r:requests.append(r.url))
    await page.add_init_script("Date.now=()=>12345;localStorage.setItem('couronnes_arcanes_animations_v13','off')")
    await page.goto(f'http://127.0.0.1:{server.server_port}/index.html?cartes=1')
    assert await page.evaluate("""()=>{
     const links=[...document.querySelectorAll('link[rel="stylesheet"]')];
     return links.length===document.styleSheets.length&&links.every(link=>
      [...document.styleSheets].some(sheet=>sheet.href===link.href&&sheet.cssRules.length>0));
    }"""),'Chaque feuille CSS doit être chargée et analysée dans le jeu web'
    await page.locator('[data-action="welcome-start"]').click()
    assert await page.locator('.battle-cell').count()==20
    await page.locator('.combat-menu-link').click()
    for screen_name in ['campaign','tower','dungeons','collection','deck','alchemy','forge','guide','home']:
     await page.locator(f'#nav [data-page="{screen_name}"]').click()
     assert await page.locator('#view').inner_text()
    await page.locator('#nav [data-page="battle"]').click()
    ready=page.locator('.hand-card.hand-ready:has(.stat.atk)').first
    if not await ready.count():
     before=await page.evaluate("JSON.parse(localStorage.getItem('couronnes_arcanes_bataille_v1')).round")
     await page.locator('[data-action="end-turn"]').click()
     await page.wait_for_function("n=>JSON.parse(localStorage.getItem('couronnes_arcanes_bataille_v1')).round>n",arg=before)
    await ready.click()
    await page.locator('[data-action="deploy"][data-lane="0"][data-col="1"]').click()
    assert await page.locator('.board-card').count()>0
    before=await page.evaluate("localStorage.getItem('couronnes_arcanes_bataille_v1')")
    await page.reload()
    assert await page.evaluate("localStorage.getItem('couronnes_arcanes_bataille_v1')")==before
    assert await page.locator('body.animations-off').count()==1
    assert await page.locator('.combat-fx-chip').count()==0
    await stable(page)
    assert await page.locator('.board-card img').first.evaluate('(i)=>i.complete&&i.naturalWidth>0')
    await page.screenshot(path=f'/tmp/ca-maintenance-web-{label}.png')
    assert all(u.startswith(('http://127.0.0.1:','data:')) for u in requests),requests
    assert not errors,errors
    await context.close()
    print('Web modulaire',label,': neuf écrans, pose, reprise, mouvement réduit et images PASS')
   await browser.close()
 finally:server.shutdown();server.server_close()

if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--reference',type=Path);parser.add_argument('--case')
 parser.add_argument('--viewport',choices=['desktop','portrait','landscape'])
 args=parser.parse_args()
 asyncio.run(main(args.reference.resolve(),args.case,args.viewport) if args.reference else modular())
