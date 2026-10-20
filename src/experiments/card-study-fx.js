// Transformations de cartes et VFX vectoriels. Aucun sprite ni calcul du moteur.
export function createStudyFx(){
 let controller=null;
 const layer=document.querySelector('#effects');
 function stop(){controller?.abort();controller=null;document.getAnimations().forEach(a=>a.cancel());layer.replaceChildren();}
 function animate(el,frames,duration){if(!el)return;const a=el.animate(frames,{duration,easing:'ease-out',fill:'forwards'});return a.finished.catch(()=>{});}
 function point(el){if(!el)return null;const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};}
 function node(cls,p,text=''){const el=document.createElement('span');el.className='fx '+cls;el.style.left=p.x+'px';el.style.top=p.y+'px';el.textContent=text;layer.append(el);return el;}
 function wait(ms,signal){return new Promise(resolve=>{const t=setTimeout(resolve,ms);signal.addEventListener('abort',()=>{clearTimeout(t);resolve();},{once:true});});}
 async function play(event){
  stop();controller=new AbortController();const signal=controller.signal;
  const source=document.querySelector(`[data-unit="${event.sourceUid}"]`);
  const target=document.querySelector(`[data-unit="${event.targetUid}"]`)||(event.heroSide?document.querySelector(`[data-hero="${event.heroSide}"]`):null);
  const start=point(source),end=point(target);
  if(event.type==='move'){await wait(170,signal);return;}
  if(event.type==='death'){
   if(target)animate(target,[{opacity:1,filter:'brightness(1.6)'},{opacity:0,transform:'translateY(14px) scale(.88)'}],420);
   await wait(420,signal);return;
  }
  if(!end)return;
  if(event.type==='attack'&&start){
   animate(source,[{transform:'translateY(0)',filter:'brightness(1)'},{transform:`translateY(${event.side==='p'?-14:14}px) scale(1.045)`,filter:'brightness(1.35)',offset:.5},{transform:'translateY(0)',filter:'brightness(1)'}],420);
   if(event.ranged){
    const angle=Math.atan2(end.y-start.y,end.x-start.x)*180/Math.PI;
    const bolt=node('bolt',start);bolt.style.setProperty('--angle',angle+'deg');
    animate(bolt,[{opacity:0,transform:`rotate(${angle}deg) scale(.6)`},{opacity:1,offset:.12},{opacity:1,transform:`translate(${end.x-start.x}px,${end.y-start.y}px) rotate(${angle}deg)`}],400);
    await wait(390,signal);
   }else{
    await wait(160,signal);if(signal.aborted)return;
    animate(node('slash',end),[{opacity:0,transform:'translate(-50%,-50%) rotate(-40deg) scale(.4)'},{opacity:1,offset:.3},{opacity:0,transform:'translate(-50%,-50%) rotate(30deg) scale(1.5)'}],340);
   }
  }
  if(signal.aborted)return;
  const heal=event.type==='heal';
  animate(node(heal?'ring healing':'ring',end),[{opacity:.95,transform:'translate(-50%,-50%) scale(.2)'},{opacity:0,transform:'translate(-50%,-50%) scale(1.7)'}],480);
  animate(target,[{filter:heal?'brightness(1.5) sepia(.3)':'brightness(2.3)'},{filter:'brightness(1)',transform:'translateX(3px)',offset:.35},{filter:'brightness(1)',transform:'translateX(0)'}],360);
  if(event.actual>0)animate(node(heal?'number healing':'number',end),( [{opacity:0,transform:'translate(-50%,-20%) scale(.5)'},{opacity:1,transform:'translate(-50%,-50%) scale(1.1)',offset:.2},{opacity:0,transform:'translate(-50%,-160%)'}]),650);
  const number=layer.querySelector('.number');if(number)number.textContent=(heal?'+':'−')+event.actual;
  await wait(680,signal);if(!signal.aborted)layer.replaceChildren();
 }
 return {play,stop};
}
