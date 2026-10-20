// Présentation des vraies unités sur leurs cases. Ni règles, ni partie préfabriquée.
import {CARDS,FACTIONS} from '../data.js';
import {visualFor,artSrc} from '../visuals.js';
export function cardArenaEnabled(){
 if(typeof document==='undefined')return false;
 const query=new URLSearchParams(globalThis.location?.search||'');
 if(query.has('cartes'))return query.get('cartes')!=='0';
 if(document.body?.dataset.cardCombat)return document.body.dataset.cardCombat==='true';
 try{return localStorage.getItem('couronnes_arcanes_vue_cartes_v1')==='on';}catch{return false;}
}
export function setCardArenaMode(enabled){
 document.body.dataset.cardCombat=String(enabled);
 try{localStorage.setItem('couronnes_arcanes_vue_cartes_v1',enabled?'on':'off');}catch{}
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function boardCard(u,attack=u.atk){
 const c=CARDS[u.id],v=visualFor(c,{cards:true});
 return `<div class="board-card" data-card-id="${u.id}" data-side="${u.side}" aria-label="${esc(c.name)} : attaque ${attack}, vie ${u.hp} sur ${u.maxhp}">
 <img class="board-card-art" src="${artSrc(v.art)}" alt="" draggable="false"><span class="board-card-order">${esc(FACTIONS[c.faction].short)}</span>
 <span class="board-card-name">${esc(c.name)}</span><span class="board-card-stats"><span>⚔ <b>${attack}</b></span><span>♥ <b>${u.hp}</b></span></span>
 <span class="board-card-health"><i style="width:${Math.max(0,100*u.hp/u.maxhp)}%"></i></span></div>`;
}
