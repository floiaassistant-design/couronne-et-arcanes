// V2.7 — compositions proposées à partir de la collection réelle, sans création de cartes.
// Arcanes privilégie désormais trois sorts au plus pour limiter les mains lentes.
// Déterministe, indépendant de l'interface et sans modification avant confirmation.
import {CARDS,CHARGE_IDS,GUARD_IDS} from '../data.js';
import {validateDeck} from './profile.js';

export const DECK_STYLES=Object.freeze({
 equilibre:{name:'Équilibré',description:'Une armée polyvalente : unités, soutien et sorts.',size:18,spells:4},
 assaut:{name:'Assaut rapide',description:'Des unités vives et des sorts offensifs.',size:16,spells:2},
 rempart:{name:'Rempart',description:'Résistance, gardiens et soins pour tenir les lignes.',size:18,spells:4},
 arcanes:{name:'Arcanes',description:'Sorts de contrôle, tireurs et unités mystiques.',size:18,spells:3}
});

const abilityOf=c=>c.ability||'';
function unitScore(c,style){
 const base=5+c.attack*1.2+c.hp*.32-c.delay*.6;
 const guard=GUARD_IDS.has(c.id),charge=CHARGE_IDS.has(c.id);
 if(style==='assaut')return base+c.attack*1.8+(c.delay===0?7:0)+(charge?9:0)+(abilityOf(c)==='haste'?5:0)-c.hp*.15;
 if(style==='rempart')return base+c.hp*.95+(guard?13:0)+(abilityOf(c)==='armor'?7:0)+(abilityOf(c)==='heal'?8:0)+(abilityOf(c)==='ward'?5:0);
 if(style==='arcanes')return base+(c.faction==='ether'?13:0)+(abilityOf(c)==='ranged'?7:0)+(abilityOf(c)==='splash'?7:0)+(abilityOf(c)==='inspire'?3:0);
 return base+(guard?4:0)+(charge?3:0)+(abilityOf(c)==='ranged'?4:0)+(abilityOf(c)==='heal'?5:0);
}
const spellBonuses={
 equilibre:{spell_bolt:10,spell_heal:9,spell_buff:7,spell_storm:8,spell_root:6,spell_ward:7},
 assaut:{spell_bolt:15,spell_heal:0,spell_buff:12,spell_storm:13,spell_root:5,spell_ward:0},
 rempart:{spell_bolt:4,spell_heal:17,spell_buff:7,spell_storm:6,spell_root:10,spell_ward:16},
 arcanes:{spell_bolt:13,spell_heal:5,spell_buff:10,spell_storm:17,spell_root:16,spell_ward:5}
};
function candidateCards(profile,style){
 const owned=profile?.collection||{};
 const cards=[];
 for(const [id,quantity] of Object.entries(owned)){
  const c=CARDS[id];if(!c)continue;
  const n=Number(quantity);
  const count=Number.isFinite(n)?Math.min(24,Math.max(0,Math.floor(n))):0;
  const base=c.type==='sort'?8+(spellBonuses[style]?.[c.ability]||0)-c.delay*.65:unitScore(c,style);
  for(let i=0;i<count;i++)cards.push({id,type:c.type,score:base-Math.max(0,i-1)*1.1});
 }
 return cards.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
}
export function deckOverview(deck){
 const counts={},factions={};let units=0,spells=0,guards=0,quick=0;
 for(const id of deck||[]){const c=CARDS[id];if(!c)continue;
  counts[id]=(counts[id]||0)+1;
  if(c.type==='sort')spells++;else{units++;factions[c.faction]=(factions[c.faction]||0)+1;if(GUARD_IDS.has(id))guards++;if(c.delay===0)quick++;}
 }
 const dominant=Object.entries(factions).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0]?.[0]||null;
 return {total:units+spells,units,spells,guards,quick,dominant,counts};
}
export function proposeDeck(profile,style){
 const config=DECK_STYLES[style];if(!config)return {ok:false,reason:'Composition inconnue.'};
 const candidates=candidateCards(profile,style);
 if(candidates.length<12)return {ok:false,reason:'Il vous faut au moins 12 cartes possédées pour préparer un deck.'};
 const size=Math.min(config.size,candidates.length),chosen=[],used=new Set();
 function pick(pool,limit){for(const card of pool){if(chosen.length>=limit)break;if(used.has(card))continue;chosen.push(card.id);used.add(card);}}
 pick(candidates.filter(c=>c.type==='sort'),Math.min(config.spells,size));
 pick(candidates.filter(c=>c.type==='unité'),size);
 pick(candidates,size);
 // Chaque exemplaire vient d'une entrée précise de collection, jamais d'une carte inventée.
 const deck=chosen;
 const error=validateDeck({...profile,deck});
 if(error)return {ok:false,reason:error};
 return {ok:true,style,deck,overview:deckOverview(deck)};
}
export function applyDeckStyle(profile,style){
 const result=proposeDeck(profile,style);
 if(!result.ok)return result;
 profile.deck=[...result.deck];
 return result;
}
