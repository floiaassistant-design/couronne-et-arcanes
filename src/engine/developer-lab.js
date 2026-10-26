// Laboratoire de développement : données de test éphémères, sans modifier les profils.
import {CARDS,CAMPAIGN,CLASSES} from '../data.js';
import {freshProfile} from './profile.js';
import {createBattle} from './battle.js';
import {versionUnitStats} from './unit-stats.js';
import {unitVersions,resolveRulesDefinition,AUBE_RULESET} from '../cards/definitions.js';
import {CARD_RARITIES} from '../cards/schema.js';

export const LAB_RANKS=Object.freeze(CARD_RARITIES.map(r=>r.id));
export const LAB_SIDES=Object.freeze(['p','e']);

export function freshLab(){
 return {
  heroClass:'gardien',aiStyle:'assaut',side:'p',cardId:'militia',
  decks:{p:[...freshProfile().deck],e:[...CAMPAIGN[0].deck]},
  levels:{p:{},e:{}},rarities:{p:{},e:{}}
 };
}
export function labRarity(lab,side,id){
 const card=CARDS[id];
 if(!card)return null;
 return lab.rarities?.[side]?.[id]||card.rarity;
}
export function labLevel(lab,side,id){return lab.levels?.[side]?.[id]||0;}
export function labRanks(id){return CARDS[id]?.type==='unité'?unitVersions(id).map(d=>d.rarity):CARDS[id]?[CARDS[id].rarity]:[];}
export function labCardStats(lab,side,id){
 const card=CARDS[id];if(!card)return null;
 const rarity=labRarity(lab,side,id),level=labLevel(lab,side,id);
 if(card.type!=='unité')return {rarity,level};
 const context={mode:'developer',cardRules:AUBE_RULESET,labStats:{levels:lab.levels,rarities:lab.rarities}};
 const stats=versionUnitStats(context,{id,rarity},side),definition=resolveRulesDefinition({id,rarity});
 return stats?{atk:stats.atk,hp:stats.maxhp,rarity,level,definition}:null;
}
export function setLabRarity(lab,side,id,rarity){
 if(!LAB_SIDES.includes(side)||!CARDS[id])return {ok:false,reason:'Carte inconnue.'};
 if(!labRanks(id).includes(rarity))return {ok:false,reason:'Cette version n’est pas définie.'};
 lab.rarities[side][id]=rarity;
 return {ok:true};
}
export function setLabLevel(lab,side,id,level){
 if(!LAB_SIDES.includes(side)||!CARDS[id]||!Number.isInteger(level)||level<0||level>3)
  return {ok:false,reason:'Niveau invalide.'};
 lab.levels[side][id]=level;
 return {ok:true};
}
export function editLabDeck(lab,side,id,delta){
 if(!LAB_SIDES.includes(side)||!CARDS[id]||![-1,1].includes(delta))
  return {ok:false,reason:'Carte inconnue.'};
 const card=CARDS[id],deck=lab.decks[side];
 if(delta>0){
  if(deck.length>=24)return {ok:false,reason:'Le deck est limité à 24 cartes.'};
  if(card.heroClass&&(side==='e'||card.heroClass!==lab.heroClass))
   return {ok:false,reason:'Compétence réservée à la classe du héros joueur.'};
  deck.push(id);
 }else{
  if(deck.length<=12)return {ok:false,reason:'Le deck doit conserver au moins 12 cartes.'};
  const index=deck.indexOf(id);
  if(index<0)return {ok:false,reason:'Cette carte n’est pas dans le deck.'};
  deck.splice(index,1);
 }
 return {ok:true};
}
export function createLabBattle(lab,seed=Date.now()){
 if(!CLASSES[lab.heroClass])throw Error('Classe de héros inconnue.');
 for(const side of LAB_SIDES){
  if(!Array.isArray(lab.decks[side])||lab.decks[side].length<12||lab.decks[side].length>24||
   lab.decks[side].some(id=>!CARDS[id]||(CARDS[id].heroClass&&(side==='e'||CARDS[id].heroClass!==lab.heroClass))))
   throw Error('Deck de laboratoire invalide ou compétence de classe incompatible.');
 }
 for(const side of LAB_SIDES)for(const id of lab.decks[side]){
  if(!labRanks(id).includes(labRarity(lab,side,id))||!Number.isInteger(labLevel(lab,side,id))||labLevel(lab,side,id)<0||labLevel(lab,side,id)>3)throw Error('Version ou niveau de laboratoire invalide.');
 }
 const p=freshProfile();
 p.heroClass=lab.heroClass;p.deck=[...lab.decks.p];
 p.collection=Object.fromEntries(p.deck.map(id=>[id,p.deck.filter(x=>x===id).length]));
 p.upgrades={};p.mastery={};
 const m={...CAMPAIGN[0],id:'laboratoire',name:'Laboratoire de combat',enemy:'IA de test',
  hp:26,difficulty:2,boss:false,mode:'developer',aiStyle:lab.aiStyle,
  deck:[...lab.decks.e],unlock:null};
 const b=createBattle(p,m,seed,{turnFlow:'alternating',cardRules:AUBE_RULESET});
 // Ces valeurs restent uniquement dans la bataille de test, jamais dans le stockage.
 b.labStats={levels:structuredClone(lab.levels),rarities:structuredClone(lab.rarities)};
 return b;
}