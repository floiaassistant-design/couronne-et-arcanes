// Effets visuels synchronisés avec les événements du moteur ; aucun changement aux dégâts.
import {paintedFootPoint} from './painted-arena.js';
import {createUnitAnimation} from './unit-animation.js';
export function createCombatFx(getContext){
 let fxTimers=[],fxOverlay=null,fxSequence=0;
 const units=createUnitAnimation(getContext,(lane,col)=>{
  const point=fxPoint(lane,col);if(!point||point.el.hasAttribute('data-foot-x'))return point;
  const box=point.el.getBoundingClientRect();
  return {...point,y:point.el.classList.contains('battle-cell')?box.top+box.height*.82:point.y};
 });
function stopBattleFx(){
 units.stop();
 fxSequence++;
 for(const timer of fxTimers)clearTimeout(timer);
 fxTimers=[];
 fxOverlay?.remove();fxOverlay=null;
}
function fxPoint(lane,col){
 const row=document.querySelectorAll('.battle-grid .lane-row')[lane];
 if(!row)return null;
 const el=col===0?row.querySelector('.lane-gate:not(.enemy)'):col===Number(row.dataset.crownCol)?row.querySelector('.lane-gate.enemy'):row.querySelectorAll('.battle-cell')[col-1];
 if(!el)return null;
 const anchor=paintedFootPoint(el);if(anchor)return anchor;
 const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,el};
}
function fxNode(cls,x,y,text=''){
 if(!fxOverlay)return null;
 const el=document.createElement('span');el.className=`combat-fx ${cls}`;el.style.left=x+'px';el.style.top=y+'px';el.textContent=text;
 el.setAttribute('aria-hidden','true');fxOverlay.append(el);return el;
}
function animateFx(el,frames,time=440){
 if(!el)return;
 const animation=el.animate(frames,{duration:time,easing:'ease-out',fill:'forwards'});
 animation.addEventListener('finish',()=>el.remove(),{once:true});
}
function fxImpact(point,kind,damage){
 if(!point)return;
 const color=kind==='heal'?'healing':kind==='magic'?'magical':kind==='poison'?'toxic':'physical';
 const flash=fxNode(`vfx-impact ${color}`,point.x,point.y,kind==='heal'?'✧':kind==='poison'?'☣':'✦');
 animateFx(flash,[{opacity:0,transform:'translate(-50%,-50%) scale(.2)'},{opacity:1,transform:'translate(-50%,-50%) scale(1.6)',offset:.45},{opacity:0,transform:'translate(-50%,-50%) scale(2.1)'}],490);
 if(damage>0){const dmg=fxNode('vfx-damage',point.x,point.y-12,`−${damage}`);animateFx(dmg,[{opacity:0,transform:'translate(-50%,-50%) translateY(8px)'},{opacity:1,offset:.2},{opacity:0,transform:'translate(-50%,-50%) translateY(-35px)'}],660);}
}
function fxOne(event){
 if(event.actor?.cardId==='archer'&&['spawn','move','teleport','attack','death'].includes(event.type))return;
 const start=fxPoint(event.fromLane??event.lane,event.from??event.col??1),end=fxPoint(event.lane,event.to??event.col??1);
 if(!end)return;
 if(event.type==='teleport'){
  fxImpact(start,'magic',0);fxImpact(end,'magic',0);
  const portal=fxNode('vfx-moving',end.x,end.y,'✧');
  animateFx(portal,[{opacity:0,transform:'translate(-50%,-50%) scale(.3)'},{opacity:1,offset:.5,transform:'translate(-50%,-50%) scale(1.7)'},{opacity:0,transform:'translate(-50%,-50%) scale(2.2)'}],500);return;
 }
 if(['silence','trap-place','trap-trigger','trap-expire'].includes(event.type)){
  fxImpact(end,'magic',event.damage||0);
  const label=fxNode('vfx-tactic',end.x,end.y-20,event.type==='silence'?'⊘ SILENCE':event.type==='trap-trigger'?'⌁ PIÈGE !':event.type==='trap-place'?'⌁ ARMÉ':'⌁ EXPIRÉ');
  animateFx(label,[{opacity:0},{opacity:1,offset:.3},{opacity:0,transform:'translate(-50%,-50%) translateY(-25px)'}],700);return;
 }
 if(event.type==='spawn'){
  const unit=end.el.querySelector('.unit-on-board');
  unit?.animate([{filter:'brightness(2)',transform:'scale(.65)'},{filter:'brightness(1.4)',transform:'scale(1.12)',offset:.55},{filter:'brightness(1)',transform:'scale(1)'}],{duration:520,easing:'ease-out'});
  fxImpact(end,'magic',0);return;
 }
 if(event.type==='move'){
  if(!start)return;
  // Utiliser l'apparence du véritable sprite lorsque la case d'arrivée le contient.
  // Aucun changement de coordonnées ou de calcul ; repli sur le symbole historique.
  const occupant=end.el.querySelector('.unit-on-board');
  const graphic=occupant?.dataset.owner===event.side?occupant.querySelector('.sprite-figure'):null;
  const unit=fxNode('vfx-moving'+(graphic?' vfx-creature':''),start.x,start.y,graphic?'':event.icon||'♞');
  if(graphic&&unit){
   const figure=document.createElement('img');
   figure.src=graphic.src;figure.alt='';figure.draggable=false;
   figure.className='vfx-creature-image';
   unit.append(figure);
  }
  animateFx(unit,[{opacity:.8,transform:'translate(-50%,-50%) scale(.8)'},{opacity:1,transform:`translate(calc(-50% + ${end.x-start.x}px),calc(-50% + ${end.y-start.y}px)) scale(1.03)`}],450);return;
 }
 if(event.type==='attack'||event.type==='spell'||event.type==='power'){
  if(!start)return;
  if(event.charged||event.riposte){
   const tactic=fxNode('vfx-tactic',start.x,start.y-24,event.charged?'⚡ CHARGE':'↶ RIPOSTE');
   animateFx(tactic,[{opacity:0,transform:'translate(-50%,-50%) translateY(8px)'},{opacity:1,offset:.25},{opacity:0,transform:'translate(-50%,-50%) translateY(-23px)'}],720);
  }
  const attacker=start.el?.querySelector('.sprite-figure');
  const defender=end.el?.querySelector('.sprite-figure');
  if(attacker){
   const swing=Math.sign(end.x-start.x)||1;
   attacker.animate([{transform:'translateX(0) scale(1)'},{transform:`translateX(${swing*13}px) scale(1.16)`,offset:.45},{transform:'translateX(0) scale(1)'}],{duration:420,easing:'ease-in-out'});
  }
  if(defender){
   const seq=fxSequence;fxTimers.push(setTimeout(()=>{if(seq===fxSequence&&defender.isConnected)defender.animate([{filter:'brightness(2.3)'},{filter:'brightness(1)',transform:'translateX(4px)'},{transform:'translateX(0)'}],{duration:330});},event.ranged||event.magic?430:70));
  }
  const magical=event.magic||event.type==='spell'||event.type==='power';
  const restorative=event.type==='spell'&&['spell_heal','spell_buff','spell_ward'].includes(event.variant)||event.type==='power'&&['gardien','clerc'].includes(event.variant);
  const ranged=event.ranged||magical;
  if(!ranged){
   const pulse=fxNode('vfx-slash',end.x,end.y,'╱');
   animateFx(pulse,[{opacity:0,transform:'translate(-50%,-50%) rotate(-35deg) scale(.4)'},{opacity:1,offset:.4,transform:'translate(-50%,-50%) rotate(15deg) scale(1.5)'},{opacity:0,transform:'translate(-50%,-50%) rotate(40deg) scale(1.8)'}],350);
   fxImpact(end,'physical',event.damage||0);return;
  }
  const bolt=fxNode(`vfx-projectile ${magical?'arcane':'arrow'} ${restorative?'restorative':''}`,start.x,start.y,restorative?'✚':magical?(event.type==='power'?'✵':'✦'):'➶');
  animateFx(bolt,[{opacity:0,transform:'translate(-50%,-50%) scale(.6)'},{opacity:1,offset:.15},{opacity:1,transform:`translate(calc(-50% + ${end.x-start.x}px),calc(-50% + ${end.y-start.y}px)) scale(1.15)`}],500);
  const seq=fxSequence;
  fxTimers.push(setTimeout(()=>{if(seq===fxSequence)fxImpact(end,restorative?'heal':magical?'magic':'physical',event.damage||0);},490));return;
 }
 if(event.type==='heal'||event.type==='poison'||event.type==='death')fxImpact(end,event.type==='heal'?'heal':event.type==='poison'?'poison':'physical',event.damage||0);
}
function playBattleFx(events,onDone){
 stopBattleFx();
 units.mount();
 const {animationsEnabled,screen}=getContext();
 if(!animationsEnabled||!events?.length||screen!=='battle'||!document.querySelector('.battle-grid')||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches){onDone?.();return;}
 if(document.querySelector('.arena-painted-frame')){units.play(events,onDone);return;}
 const unitDuration=units.play(events);
 const seq=fxSequence;
 fxOverlay=document.createElement('div');fxOverlay.className='battle-vfx-overlay';fxOverlay.setAttribute('aria-hidden','true');document.body.append(fxOverlay);
 const selected=events.slice(0,30);
 selected.forEach((event,i)=>fxTimers.push(setTimeout(()=>{if(seq===fxSequence)fxOne(event);},i*135)));
 fxTimers.push(setTimeout(()=>{if(seq!==fxSequence)return;stopBattleFx();units.mount();onDone?.();},Math.max(selected.length*135+800,unitDuration)));
}
return {stopBattleFx,playBattleFx,mountUnitAnimations:units.mount};
}
