// Fiche partagée main/plateau : lecture et état éphémère, aucune action de jeu.
import {CARDS,FACTIONS,CLASSES,cardTraits} from '../data.js';
import {unitStats} from '../engine/unit-stats.js';
import {formationBonus} from '../engine.js';
import {silenced} from '../engine/battle-control.js';
import {visualFor,artSrc} from '../visuals.js';
import {cardArenaEnabled} from './card-arena.js';

export function boardInspectionData(battle,uid){
 for(let lane=0;lane<(battle?.board?.length||0);lane++)for(let col=1;col<battle.board[lane].length-1;col++){
  const u=battle.board[lane][col];if(!u||String(u.uid)!==String(uid))continue;
  const concord=formationBonus(battle,lane,u),rallied=u.rallyUntil>=battle.round?1:0;
  const statuses=[concord?'Concorde +1 ATQ':'',rallied?'Ralliement +1 ATQ':'',u.armor?'Armure '+u.armor:'',u.barrier?'Barrière '+u.barrier:'',u.poisonTurns?'Poison '+u.poisonTurns+' tour(s)':'',u.stun?'Immobilisation '+u.stun:'',silenced(battle,u)?'Silence : capacités déclenchées suspendues':''].filter(Boolean);
  return {card:CARDS[u.id],entry:{wait:0},stats:{atk:u.atk+concord+rallied,hp:u.hp,maxhp:u.maxhp,bonuses:[]},board:{side:u.side,lane,col,statuses}};
 }
 return null;
}

export function cardInspectionContent(card,entry,stats,esc,{illustrated=false,board=null}={}){
 const bonusText=stats?.bonuses.map(b=>esc(b.label)+' '+[b.atk?'+'+b.atk+' ATQ':'',b.hp?'+'+b.hp+' PV':''].filter(Boolean).join(' / ')).join(' · ');
 const traits=cardTraits(card.id),faction=FACTIONS[card.faction];
 const readiness=board?`${board.side==='p'?'Votre unité':'Unité adverse'} · Ligne ${board.lane+1}, case ${board.col}`:entry.wait>0?'Attente '+entry.wait+' tour'+(entry.wait>1?'s':''):'Prête à jouer';
 const heading=`<div class="inspection-heading">${illustrated?`<span class="inspection-context">${board?'SUR LE PLATEAU':'DANS VOTRE MAIN'}</span>`:`<b>${esc(card.name)}</b>`}<button type="button" data-action="close-inspection" aria-label="Fermer la fiche">×</button></div>`;
 const statistics=stats?`<div class="inspection-stats">${board?'En combat':'À l’invocation'} : <b>ATQ ${stats.atk} / PV ${board?stats.hp+'/':''}${stats.maxhp}</b></div>`:'';
 const identity=illustrated?`<div class="inspection-feature"><img class="inspection-art" src="${artSrc(visualFor(card,{cards:true}).art)}" alt="Illustration de ${esc(card.name)}" draggable="false"><div class="inspection-identity"><h2>${esc(card.name)}</h2><span class="inspection-order">${esc(faction.name)}</span><span class="inspection-rarity">${esc(card.rarity)} · ${esc(card.type)}</span><div class="inspection-readiness">${esc(readiness)}</div>${statistics}</div></div>`:statistics;
 const body=`<div class="inspection-body"><p class="inspection-description">${esc(card.description)}</p>
  <div class="inspection-summary">${esc(faction.name)} · ${esc(card.rarity)}${card.heroClass?' · '+esc(CLASSES[card.heroClass].name):''} · ${esc(readiness)}</div>
  ${traits.length?`<div class="inspection-traits">${traits.map(t=>`<span>${esc(t)}</span>`).join(' · ')}</div>`:''}
  ${board?.statuses.length?`<div class="inspection-statuses">${board.statuses.map(esc).join(' · ')}</div>`:''}
  ${bonusText?`<div class="inspection-bonuses">Bonus inclus : ${bonusText}</div>`:''}</div>`;
 return illustrated?`<div class="card-preview" data-preview-kind="${board?'board':'hand'}" data-side="${board?.side||'p'}" data-rarity="${esc(card.rarity)}" style="--preview-tone:${faction.tone}">${heading}${identity}${body}</div>`:heading+identity+body;
}

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
 return {left:clamp(x,viewport.width-size.width),top:clamp(y,viewport.height-size.height)};
}

export function createCardInspection(getContext,esc){
 let pinned=null,current=null,trigger=null,dismissTimer,dismissedKey=null;
 const panel=()=>document.getElementById('hand-card-inspection');
 const key=r=>r.kind+':'+r.id;
 function closeCardInspection(suppressHover=false){
  dismissedKey=suppressHover&&current?key(current):null;
  clearTimeout(dismissTimer);pinned=null;current=null;
  trigger?.setAttribute('aria-expanded','false');trigger=null;
  const el=panel();if(!el)return;
  el.hidden=true;el.textContent='';el.classList.remove('illustrated-inspection');
  for(const p of ['left','top'])el.style.removeProperty(p);
  el.closest('.hand-header')?.style.removeProperty('--inspection-header-height');
 }
 function position(){
  const el=panel();if(!cardArenaEnabled()||!el||el.hidden||!trigger?.isConnected)return;
  const pos=previewPosition(trigger.getBoundingClientRect(),el.getBoundingClientRect(),{width:innerWidth,height:innerHeight},current.kind);
  el.style.left=pos.left+'px';el.style.top=pos.top+'px';
 }
 function show(request,pin=false){
  const {battle,screen}=getContext();if(!battle||screen!=='battle')return;
  clearTimeout(dismissTimer);
  if(!pin&&dismissedKey===key(request))return;
  dismissedKey=null;
  if(pin&&pinned&&key(pinned)===key(request)){closeCardInspection();return;}
  if(!pin&&pinned&&!cardArenaEnabled())return;
  const el=panel();if(!el)return;
  const data=request.kind==='board'?boardInspectionData(battle,request.id):(()=>{
   const entry=battle.heroes.p.hand[request.id],card=entry&&CARDS[entry.id];
   return card?{card,entry,stats:unitStats(battle,card.id)}:null;
  })();
  if(!data?.card)return;
  if(pin)pinned=request;
  if(current&&key(current)===key(request)&&!el.hidden)return;
  if(el.hidden){const header=el.closest('.hand-header');header?.style.setProperty('--inspection-header-height',header.getBoundingClientRect().height+'px');}
  trigger?.setAttribute('aria-expanded','false');
  trigger=request.kind==='board'?[...document.querySelectorAll('.battle-cell .board-card')].find(c=>c.dataset.unitId===String(request.id)):document.querySelector(`.hand-card[data-index="${request.id}"]`);
  trigger?.setAttribute('aria-expanded','true');current=request;
  el.classList.toggle('illustrated-inspection',cardArenaEnabled());
  el.innerHTML=cardInspectionContent(data.card,data.entry,data.stats,esc,{illustrated:cardArenaEnabled(),board:data.board});
  el.hidden=false;position();
 }
 function inspectCard(index,pin=false){const i=Number(index);if(Number.isInteger(i)&&i>=0)show({kind:'hand',id:i},pin);}
 function inspectUnit(uid,pin=false){if(cardArenaEnabled())show({kind:'board',id:String(uid)},pin);}
 function dismissCardInspection(){
  clearTimeout(dismissTimer);
  if(pinned){if(cardArenaEnabled())show(pinned);}else closeCardInspection();
 }
 function bindCardInspection(){
  const source=t=>t instanceof Element?t.closest('.hand-card,.battle-cell .board-card'):null;
  const inPanel=t=>t instanceof Element&&!!t.closest('#hand-card-inspection');
  const enter=event=>{
   if(event.sourceCapabilities?.firesTouchEvents)return;
   if(inPanel(event.target)){clearTimeout(dismissTimer);return;}
   const el=source(event.target);if(!el)return;
   if(el.matches('.board-card'))inspectUnit(el.dataset.unitId);else inspectCard(el.dataset.index);
  };
  const leave=event=>{
   const el=source(event.target);if(!el&&!inPanel(event.target))return;
   if(el&&!el.contains(event.relatedTarget)&&!inPanel(event.relatedTarget))dismissedKey=null;
   if(el?.contains(event.relatedTarget)||inPanel(event.relatedTarget)||source(event.relatedTarget)){clearTimeout(dismissTimer);return;}
   clearTimeout(dismissTimer);
   if(cardArenaEnabled())dismissTimer=setTimeout(dismissCardInspection,160);else dismissCardInspection();
  };
  document.addEventListener('mouseover',enter);document.addEventListener('focusin',enter);
  document.addEventListener('mouseout',leave);document.addEventListener('focusout',leave);
  document.addEventListener('click',event=>{if(cardArenaEnabled()&&!source(event.target)&&!inPanel(event.target))closeCardInspection();});
  document.addEventListener('scroll',event=>{if(cardArenaEnabled()&&event.target instanceof Element&&event.target.matches('.battle-grid,.hand,.combat-stage'))closeCardInspection();},true);
  window.addEventListener('resize',position);
 }
 return {inspectCard,inspectUnit,closeCardInspection,dismissCardInspection,bindCardInspection};
}
