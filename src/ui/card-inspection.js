// Lecteur universel : état de consultation éphémère, aucune règle ou sauvegarde.
import {cardPresentation,cardInspectionContent,boardInspectionData} from './card-presentation.js';
import {labCardStats,labRarity} from '../engine/developer-lab.js';
export * from './card-presentation.js';

export function previewPosition(anchor,size,viewport,kind){
 const margin=12,gap=12,clamp=(n,max)=>Math.max(margin,Math.min(n,max-margin));
 let x=kind==='hand'?anchor.left+(anchor.width-size.width)/2:anchor.right+gap;
 let y=kind==='hand'?anchor.top-size.height-gap:anchor.top+(anchor.height-size.height)/2;
 if(kind==='board'&&x+size.width>viewport.width-margin){
  x=anchor.left-size.width-gap;
  if(x<margin){
   if(anchor.top+anchor.height+gap+size.height<=viewport.height-margin)y=anchor.top+anchor.height+gap;
   else if(anchor.top-size.height-gap>=margin)y=anchor.top-size.height-gap;
  }
 }
 if(kind==='hand'&&y<margin){
  if(anchor.right+gap+size.width<=viewport.width-margin)x=anchor.right+gap;
  else if(anchor.left-size.width-gap>=margin)x=anchor.left-size.width-gap;
 }
 return {left:clamp(x,viewport.width-size.width),top:Math.max(viewport.topInset||margin,clamp(y,viewport.height-size.height))};
}

export function createCardInspection(getContext,esc){
 let current=null,trigger=null,popup=null,activePanel=null,dismissTimer,dismissedKey=null,touch=null,touchOpenKey=null;
 const key=r=>[r.kind,r.id,r.rarity||'',r.side||'p'].join(':');
 const inPanel=t=>t instanceof Element&&!!t.closest('#hand-card-inspection,#collection-hover-inspection');
 function source(t){
  if(!(t instanceof Element)||inPanel(t))return null;
  const el=t.closest('.collection-card-visual[data-collection-preview],.hand-card,.battle-cell .board-card,[data-card-preview]');
  if(!el)return null;
  const action=t.closest('button,a,input,select,[data-action]');
  if(action&&action!==el&&el.contains(action))return null;
  if(el.matches('.board-card[data-action]'))return null; // Ciblage explicite d'un sort.
  return el;
 }
 function request(el){
  if(el.matches('.hand-card'))return {kind:'hand',id:Number(el.dataset.index)};
  if(el.matches('.board-card'))return {kind:'board',id:el.dataset.unitId};
  return {kind:el.dataset.previewContext||'collection',id:el.dataset.cardId,rarity:el.dataset.previewRarity||el.dataset.rarity,side:el.dataset.side||'p'};
 }
 function panel(combat){
  if(combat)return document.getElementById('hand-card-inspection');
  if(!popup){popup=document.createElement('div');popup.id='collection-hover-inspection';popup.className='collection-hover-inspection illustrated-inspection';popup.setAttribute('role','region');popup.setAttribute('aria-label','Capacités de la carte consultée');popup.hidden=true;document.body.appendChild(popup);}
  return popup;
 }
 function closeCardInspection(suppressHover=false,sourceKey=null){
  dismissedKey=suppressHover?(sourceKey||(current?key(current):dismissedKey)):null;
  clearTimeout(dismissTimer);current=null;touchOpenKey=null;
  trigger?.setAttribute('aria-expanded','false');trigger=null;
  for(const el of [activePanel,popup,document.getElementById('hand-card-inspection')])if(el){
   el.hidden=true;el.textContent='';el.style.removeProperty('left');el.style.removeProperty('top');el.style.removeProperty('--preview-max-height');
   el.closest('.hand-header')?.style.removeProperty('--inspection-header-height');
  }
  activePanel=null;
 }
 function position(){
  const el=activePanel;if(!el||el.hidden||!trigger?.isConnected){if(trigger&&!trigger.isConnected)closeCardInspection();return;}
  const anchor=trigger.getBoundingClientRect(),combat=current.kind==='hand'||current.kind==='board';
  const titlebar=document.querySelector(combat?'.combat-titlebar':'.main-nav')?.getBoundingClientRect();
  const topInset=Math.max(12,titlebar?.bottom+8||12);
  let availableHeight=Math.max(120,innerHeight-topInset-12);
  el.style.setProperty('--preview-max-height',availableHeight+'px');
  const size=el.getBoundingClientRect(),beside=anchor.right+12+size.width<=innerWidth-12||anchor.left-size.width-12>=12;
  const handTop=combat?document.querySelector('.combat-hand-tray')?.getBoundingClientRect().top:null;
  if(!beside&&handTop>topInset+180)el.style.setProperty('--preview-max-height',Math.min(availableHeight,handTop-topInset-12)+'px');
  if(current.kind==='hand'&&anchor.top>=324&&!beside)el.style.setProperty('--preview-max-height',Math.min(availableHeight,anchor.top-topInset-12)+'px');
  const pos=previewPosition(anchor,el.getBoundingClientRect(),{width:innerWidth,height:innerHeight,topInset},current.kind==='hand'?'hand':'board');
  el.style.left=pos.left+'px';el.style.top=pos.top+'px';
 }
 function read(r,ctx){
  if(r.kind==='board')return boardInspectionData(ctx.battle,r.id);
  if(r.kind==='hand'){
   const entry=ctx.battle?.heroes.p.hand[r.id];if(!entry)return null;
   const presentation=cardPresentation(entry,{context:ctx.battle});
   return presentation?{...presentation,presentation,entry}:null;
  }
  let presentation;
  if(r.kind==='developer'&&ctx.developer?.draft){
   const lab=ctx.developer.draft,s=labCardStats(lab,r.side,r.id);
   presentation=cardPresentation({id:r.id,rarity:labRarity(lab,r.side,r.id)},{definition:s.definition,stats:s.definition?{atk:s.atk,maxhp:s.hp,bonuses:[]}:null});
  }else presentation=cardPresentation({id:r.id,rarity:r.rarity},{profile:ctx.profile});
  return presentation?{...presentation,presentation,entry:{wait:0}}:null;
 }
 function show(r,el,force=false,input='hover'){
  const ctx=getContext(),combat=r.kind==='board'||r.kind==='hand';
  if(ctx.screen==='resolving'||(combat&&(!ctx.battle||ctx.screen!=='battle')))return;
  clearTimeout(dismissTimer);if(dismissedKey!==null&&!force)return;
  const data=read(r,ctx);if(!data?.card)return;
  if(current&&key(current)===key(r)&&!activePanel?.hidden){activePanel.dataset.input=input;return;}
  closeCardInspection();dismissedKey=null;
  activePanel=panel(combat);if(!activePanel)return;
  trigger=el;trigger.setAttribute('aria-expanded','true');current=r;
  activePanel.classList.add('illustrated-inspection');activePanel.dataset.input=input;
  activePanel.innerHTML=cardInspectionContent(data.card,data.entry,data.stats,esc,{board:data.board,presentation:data.presentation,context:r.kind});
  activePanel.hidden=false;position();
 }
 function suppressCardInspection(index){closeCardInspection(true,['hand',Number(index),'','p'].join(':'));}
 function bindCardInspection(){
  const enter=event=>{
   if(event.sourceCapabilities?.firesTouchEvents||event.pointerType==='touch'||touch||event.type==='mouseover'&&touchOpenKey)return;
   if(inPanel(event.target)){clearTimeout(dismissTimer);return;}
   const el=source(event.target);if(el){const r=request(el);show(r,el,event.type==='focusin'&&r.kind!=='hand'&&r.kind!=='board',event.type==='focusin'?'focus':'hover');}
  };
  document.addEventListener('pointermove',event=>{
   if(event.pointerType==='touch')return;
   touch=null;const el=source(event.target);
   if(touchOpenKey&&(event.movementX||event.movementY)){
    touchOpenKey=null;dismissedKey=null;
    if(el)enter(event);else if(!inPanel(event.target))closeCardInspection();
   }
   if(dismissedKey!==null&&(!el||key(request(el))!==dismissedKey)){dismissedKey=null;if(el)enter(event);}
  });
  document.addEventListener('keydown',event=>{if(event.key==='Tab'){dismissedKey=null;touch=null;touchOpenKey=null;}if(event.key==='Escape')closeCardInspection(true);});
  document.addEventListener('pointerdown',event=>{
   const el=source(event.target);
   if(event.pointerType==='touch'&&el){const r=request(el);touch={key:key(r),repeat:touchOpenKey===key(r)&&current&&key(current)===key(r)};return;}
   touch=null;
   if(el&&(el.matches('.hand-card,.board-card')))closeCardInspection(true,key(request(el)));
   else if(!el&&!inPanel(event.target))closeCardInspection();
  },true);
  document.addEventListener('click',event=>{
   const el=source(event.target);if(!el){if(!inPanel(event.target))closeCardInspection();return;}
   const r=request(el),isTouch=touch?.key===key(r),repeat=touch?.repeat;
   touch=null;
   if(isTouch&&!repeat){show(r,el,true,'touch');touchOpenKey=key(r);event.preventDefault();event.stopImmediatePropagation();return;}
   if(r.kind==='board'){closeCardInspection(true,key(r));event.preventDefault();event.stopImmediatePropagation();return;}
   if(r.kind==='hand')closeCardInspection(true,key(r));
   else if(isTouch)show(r,el,true,'touch');
  },true);
  document.addEventListener('mouseover',enter);document.addEventListener('focusin',enter);
  const leave=event=>{
   if(touchOpenKey)return;
   const el=source(event.target);if(!el&&!inPanel(event.target))return;
   if(el?.contains(event.relatedTarget)||inPanel(event.relatedTarget)||source(event.relatedTarget)){clearTimeout(dismissTimer);return;}
   clearTimeout(dismissTimer);dismissTimer=setTimeout(()=>{const blocked=dismissedKey;closeCardInspection();dismissedKey=blocked;},160);
  };
  document.addEventListener('mouseout',leave);document.addEventListener('focusout',leave);
  document.addEventListener('scroll',position,true);window.addEventListener('resize',position);
 }
 return {closeCardInspection,suppressCardInspection,bindCardInspection};
}
