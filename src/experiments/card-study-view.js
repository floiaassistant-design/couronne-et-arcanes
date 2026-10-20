import {CARDS} from '../data.js';
import {formationBonus} from '../engine/battle.js';
import {artSrc} from '../visuals.js';
export const STUDY_INLINE_ART={};
const keys={militia:'milicien_aube',shield:'porte_egide',cleric:'soeur_aurore',paladin:'paladin_solaire',banner:'porte_etendard'};
export function studyArt(id){return STUDY_INLINE_ART[id]||(id==='archer'?'../../'+artSrc('arbaletriere_aube'):`./portraits/${keys[id]}.webp`);}
const tags={militia:'Mêlée',shield:'Armure · Riposte',archer:'Portée 2',cleric:'Soin',paladin:'Armure · Riposte',banner:'Inspiration'};
const escape=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function cardHtml(b,u,lane){
 if(!u)return '<div class="empty-card"><span>✧</span>Emplacement libre</div>';
 const c=CARDS[u.id],attack=u.atk+formationBonus(b,lane,u);
 return `<button class="duel-card ${u.side==='e'?'enemy':'ally'}" data-unit="${u.uid}" data-card="${u.id}" aria-label="${escape(c.name)}, attaque ${attack}, vie ${u.hp} sur ${u.maxhp}. ${escape(c.text||c.description||tags[u.id])}">
 <img src="${studyArt(u.id)}" alt="" draggable="false"><span class="card-order">☀ AUBE</span><span class="card-position">${b.board[lane].indexOf(u)} / 10</span>
 <span class="card-copy"><span class="card-name">${escape(c.name)}</span><span class="card-trait">${tags[u.id]}</span></span>
 <span class="card-stats"><span class="atk" title="Attaque">⚔ <b>${attack}</b></span><span class="hp" title="Points de vie">♥ <b>${u.hp}</b><small> / ${u.maxhp}</small></span></span>
 <span class="hp-track"><i style="width:${100*u.hp/u.maxhp}%"></i></span></button>`;
}
export function renderStudy(b){
 for(const side of ['p','e']){
  document.querySelector(`[data-hero="${side}"] .hero-health`).textContent=`${b.heroes[side].hp} / ${b.heroes[side].maxhp}`;
  document.querySelector(`[data-hero="${side}"] .hero-track i`).style.width=100*b.heroes[side].hp/b.heroes[side].maxhp+'%';
  document.querySelector(`[data-team="${side}"]`).innerHTML=b.board.map((row,lane)=>{
   const unit=row.find(u=>u?.side===side);
   return `<div class="card-slot" data-lane="${lane}" data-side="${side}">${cardHtml(b,unit,lane)}</div>`;
  }).join('');
 }
 document.querySelector('#turn').textContent=b.round;
 document.querySelector('#result').textContent=b.status==='victory'?'Votre couronne triomphe':b.status==='defeat'?'Les Échos remportent le duel':'';
}
export function describeCard(id){
 const c=CARDS[id];return c?`${c.name} — ${c.desc||c.description||c.text||tags[id]}. Attaque ${c.attack}, vie ${c.hp}, délai ${c.delay}.`:'';
}
