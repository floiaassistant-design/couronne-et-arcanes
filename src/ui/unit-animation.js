// Lecture des atlas sur les traces publiques ; état et horloges jamais sauvegardés.
import {unitSpriteFor,unitTexture,unitSpriteHTML,clipFrame,unitAnimationPlan} from './unit-sprites.js';

const textures=new Map();
function textureReady(key){
 if(!textures.has(key)){
  const image=new Image(),entry={ready:false,failed:false};textures.set(key,entry);
  image.onload=()=>{entry.ready=true;};image.onerror=()=>{entry.failed=true;};
  image.src=unitTexture(key);
 }
 return textures.get(key).ready;
}
function setPose(node,clipName,elapsed){
 const sprite=unitSpriteFor(node.dataset.unitCard),clip=sprite.clips[clipName];
 const index=clipFrame(clip,elapsed),atlas=node.querySelector('.unit-atlas');
 node.dataset.clip=clipName;node.dataset.frame=String(index);
 if(textureReady(clip.texture)){
  atlas.style.backgroundImage=`url("${unitTexture(clip.texture)}")`;
  atlas.style.backgroundSize=clip.durations.length*100+'% 100%';
  atlas.style.backgroundPosition=(clip.durations.length===1?0:index/(clip.durations.length-1)*100)+'% 0';
  node.classList.add('atlas-ready');
 }else node.classList.remove('atlas-ready');
}
const stateFor=clip=>({repos:'idle',marche:'move',tir:'attack',impact:'hit',defaite:'death'})[clip];

export function createUnitAnimation(getContext,pointFor){
 let raf=0,overlay=null,replay=null,mounted=[],origin=0,completion=null;
 const media=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 const allowed=()=>getContext().animationsEnabled&&getContext().screen==='battle'&&!media?.matches;
 function cleanupReplay(){
  overlay?.remove();overlay=null;replay=null;
  document.querySelectorAll('[data-visual-replaying]').forEach(el=>delete el.dataset.visualReplaying);
 }
 function stop(){
  cancelAnimationFrame(raf);raf=0;completion=null;cleanupReplay();mounted=[];
 }
 function warm(node){
  const sprite=unitSpriteFor(node.dataset.unitCard);
  if(allowed())for(const clip of Object.values(sprite.clips))textureReady(clip.texture);
  const image=node.querySelector('.unit-static');
  image.addEventListener('error',()=>{
   if(node.dataset.fallback&&image.src!==node.dataset.fallback)image.src=node.dataset.fallback;
   node.classList.remove('atlas-ready');
  },{once:true});
 }
 function mount(){
  cancelAnimationFrame(raf);raf=0;mounted=[...document.querySelectorAll('.unit-on-board .illustrated-unit')];
  origin=performance.now();mounted.forEach(warm);
  const frame=document.querySelector('.arena-painted-frame');if(frame)frame.dataset.renderMode=mounted.length?'hybrid':'static';
  if(!allowed())mounted.forEach(node=>node.classList.remove('atlas-ready'));
  if(allowed()&&mounted.length)raf=requestAnimationFrame(tick);
 }
 function sizeAt(point,id){
  const frame=point.el.closest('.arena-painted-frame');
  return frame?unitSpriteFor(id).displaySize*frame.getBoundingClientRect().width/1672:96;
 }
 function createGhost(actor,position){
  const point=pointFor(position.lane,position.col);if(!point)return null;
  const real=[...document.querySelectorAll('.unit-on-board')].find(n=>n.dataset.actorId===String(actor.uid));
  const el=document.createElement('div');el.className='unit-animation-actor';
  el.dataset.actorId=String(actor.uid);el.dataset.owner=actor.side;
  el.innerHTML=unitSpriteHTML(actor.cardId,actor.side,real?.querySelector('.illustrated-unit')?.dataset.fallback||'');overlay.append(el);
  const node=el.querySelector('.illustrated-unit');warm(node);
  if(real)real.dataset.visualReplaying='true';
  return {actor,el,node,position,actions:[],bolts:new Map(),impacts:new Map()};
 }
 function place(ghost,position,opacity=1){
  const point=pointFor(position.lane,position.col);if(!point)return null;
  const size=sizeAt(point,ghost.actor.cardId);ghost.el.style.left=point.x+'px';ghost.el.style.top=point.y+'px';
  ghost.el.style.width=size+'px';ghost.el.style.height=size+'px';ghost.el.style.opacity=String(opacity);
  return {...point,size};
 }
 function projectile(ghost,action,time){
  const sprite=unitSpriteFor(ghost.actor.cardId),p=sprite.projectile;
  if(time<p.releaseMs||time>=p.releaseMs+p.travelMs+p.impactMs)return;
  let bolt=ghost.bolts.get(action);
  if(!bolt&&time<p.releaseMs+p.travelMs){
   bolt=document.createElement('span');bolt.className='unit-crossbow-bolt';
   bolt.innerHTML='<svg viewBox="0 0 40 8" width="40" height="8"><path d="M0 1l8 2v2L0 7l3-3z" fill="#e9dfc5"/><path d="M3 3h27v2H3z" fill="#9c754d"/><path d="M29 1l11 3-11 3z" fill="#d9e6ee"/><path d="M4 3l4-2v2z" fill="#243a5b"/></svg>';
   overlay.append(bolt);ghost.bolts.set(action,bolt);
  }
  const start=pointFor(action.from.lane,action.from.col),end=pointFor(action.event.lane,action.event.to);
  if(!start||!end)return;const size=sizeAt(start,ghost.actor.cardId),sign=ghost.actor.side==='p'?1:-1;
  const x=start.x+sign*(p.x-sprite.anchor.x)/sprite.frame*size;
  const y=start.y+(p.y-sprite.anchor.y)/sprite.frame*size;
  const targetY=end.y-(end.el.classList.contains('battle-cell')?size*.45:0);
  const progress=Math.min(1,(time-p.releaseMs)/p.travelMs),angle=Math.atan2(targetY-y,end.x-x)*180/Math.PI;
  if(bolt){
  bolt.style.left=(x+(end.x-x)*progress)+'px';bolt.style.top=(y+(targetY-y)*progress)+'px';
  bolt.style.transform=`translate(-50%,-50%) rotate(${angle}deg)`;
  bolt.dataset.sourceX=String(x);bolt.dataset.sourceY=String(y);bolt.dataset.actorId=String(ghost.actor.uid);
  }
  const impactAge=time-p.releaseMs-p.travelMs;
  if(impactAge>=0){
   let impact=ghost.impacts.get(action);
   if(!impact){impact=document.createElement('span');impact.className='unit-crossbow-impact';impact.dataset.actorId=String(ghost.actor.uid);overlay.append(impact);ghost.impacts.set(action,impact);}
   const progress=impactAge/p.impactMs,radius=7+31*progress;
   const rays=Array.from({length:9},(_,n)=>{const a=n*Math.PI*2/9;return `<line x1="${Math.cos(a)*radius}" y1="${Math.sin(a)*radius}" x2="${Math.cos(a)*(radius+9)}" y2="${Math.sin(a)*(radius+9)}"/>`;}).join('');
   impact.innerHTML=`<svg viewBox="-50 -50 100 100" aria-hidden="true"><g stroke="#f3dc99" stroke-width="2">${rays}</g><circle r="${6+21*progress}" fill="none" stroke="#b9daee" stroke-width="2"/></svg>`;
   impact.style.left=end.x+'px';impact.style.top=targetY+'px';impact.style.width=size*100/220+'px';impact.style.height=size*100/220+'px';impact.style.opacity=String(1-progress);
   impact.dataset.targetX=String(end.x);impact.dataset.targetY=String(targetY);
  }
 }
 function drawGhost(ghost,elapsed){
  const active=ghost.actions.find(a=>elapsed>=a.start&&elapsed<a.start+a.duration);
  const previous=ghost.actions.findLast(a=>elapsed>=a.start+a.duration);
  let clip='repos',time=elapsed,position=previous?.to||ghost.position,opacity=1;
  if(previous?.clip==='defaite'){clip='defaite';time=previous.duration;opacity=0;}
  if(active){
   clip=active.clip;time=elapsed-active.start;position=active.from;
   if(clip==='marche'){
    const from=pointFor(active.from.lane,active.from.col),to=pointFor(active.to.lane,active.to.col);
    if(from&&to){
     const progress=Math.min(1,time/active.duration);place(ghost,active.from);
     ghost.el.style.left=(from.x+(to.x-from.x)*progress)+'px';
     ghost.el.style.top=(from.y+(to.y-from.y)*progress)+'px';
    }
   }
   if(active.event.type==='spawn')opacity=Math.min(1,time/180);
   if(clip==='defaite')opacity=Math.min(1,(active.duration-time)/160);
  }
  if(clip!=='marche')place(ghost,position,opacity);
  ghost.el.style.opacity=String(opacity);ghost.el.dataset.animationState=stateFor(clip);
  setPose(ghost.node,clip,time);
  for(const action of ghost.actions)if(action.clip==='tir')projectile(ghost,action,elapsed-action.start);
  for(const [action,impact] of ghost.impacts){const p=unitSpriteFor(ghost.actor.cardId).projectile;if(elapsed>=action.start+p.releaseMs+p.travelMs+p.impactMs){impact.remove();ghost.impacts.delete(action);}}
  for(const [action,bolt] of ghost.bolts){if(elapsed>=action.start+1040){bolt.remove();ghost.bolts.delete(action);}}
 }
 function tick(now){
  if(!allowed()){
   const done=completion;stop();mounted=[...document.querySelectorAll('.unit-on-board .illustrated-unit')];
   mounted.forEach(node=>{node.classList.remove('atlas-ready');node.dataset.clip='repos';node.dataset.frame='0';});done?.();return;
  }
  mounted=mounted.filter(n=>n.isConnected);mounted.forEach(node=>setPose(node,'repos',now-origin));
  if(replay){
   const box=document.querySelector('.battle-grid')?.getBoundingClientRect();
   if(box)overlay.style.clipPath=`inset(${Math.max(0,box.top)}px ${Math.max(0,innerWidth-box.right)}px ${Math.max(0,innerHeight-box.bottom)}px ${Math.max(0,box.left)}px)`;
   const elapsed=now-replay.start;
   replay.ghosts.forEach(ghost=>drawGhost(ghost,elapsed));
   if(elapsed>=replay.duration){const done=completion;completion=null;cleanupReplay();done?.();}
  }
  raf=mounted.length||replay?requestAnimationFrame(tick):0;
 }
 function play(events,onDone){
  cleanupReplay();const plan=unitAnimationPlan(events);
  if(!allowed()||!plan.actions.length){onDone?.();return 0;}
  overlay=document.createElement('div');overlay.className='unit-animation-overlay';overlay.setAttribute('aria-hidden','true');document.body.append(overlay);
  const ghosts=new Map();
  for(const action of plan.actions){
   let ghost=ghosts.get(action.actor.uid);
   if(!ghost){ghost=createGhost(action.actor,action.from);if(ghost)ghosts.set(action.actor.uid,ghost);}
   ghost?.actions.push(action);
  }
  replay={ghosts:[...ghosts.values()],duration:plan.duration,start:performance.now()};completion=onDone;
  if(!raf)raf=requestAnimationFrame(tick);return plan.duration;
 }
 media?.addEventListener('change',()=>{
  const done=completion;stop();mount();if(!allowed())done?.();
 });
 return {mount,stop,play};
}
