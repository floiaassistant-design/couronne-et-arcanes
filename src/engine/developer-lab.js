// Laboratoire de développement : données de test éphémères, sans modifier les profils.
import {CARDS,CAMPAIGN,CLASSES} from '../data.js';
import {freshProfile} from './profile.js';
import {createBattle} from './battle.js';

export const LAB_RANKS=Object.freeze(['commun','rare','épique','légendaire','divine']);
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
 return id==='militia'?(lab.rarities?.[side]?.[id]||'commun'):card.rarity;
}
export function labLevel(lab,side,id){return lab.levels?.[side]?.[id]||0;}
export function labMilitiaBonus(rarity,level){
 if(!LAB_RANKS.includes(rarity))return {hp:0,block:0,counter:false};
 const rank=LAB_RANKS.indexOf(rarity);
 const hp=rank>=3?2:rank>=1?1:0;
 const block=rank===1?(level>=2?1:0):rank===2?2:rank===3?(level>=2?2:2):rank===4?3:0;
 return {hp,block,counter:rank===4&&level>=2};
}
export function labCardStats(lab,side,id){
 const card=CARDS[id];if(!card)return null;
 const rarity=labRarity(lab,side,id),level=labLevel(lab,side,id);
 const upgrades=id==='militia'&&rarity!=='commun'?3:level;
 const bonus=id==='militia'?labMilitiaBonus(rarity,level):{hp:0,block:0,counter:false};
 return {atk:card.attack+(card.type==='unité'?upgrades:0),
  hp:card.hp+(card.type==='unité'?upgrades:0)+bonus.hp,
  rarity,level,block:bonus.block,counter:bonus.counter};
}
export function setLabRarity(lab,side,id,rarity){
 if(!LAB_SIDES.includes(side)||!CARDS[id])return {ok:false,reason:'Carte inconnue.'};
 if(id!=='militia'&&rarity!==CARDS[id].rarity)return {ok:false,reason:'Évolutions futures encore à concevoir.'};
 if(id==='militia'&&!LAB_RANKS.includes(rarity))return {ok:false,reason:'Rareté non disponible.'};
 lab.rarities[side][id]=rarity;
 if(id==='militia'&&rarity!=='commun'&&labLevel(lab,side,id)===0)lab.levels[side][id]=1;
 return {ok:true};
}
export function setLabLevel(lab,side,id,level){
 if(!LAB_SIDES.includes(side)||!CARDS[id]||!Number.isInteger(level)||level<0||level>3)
  return {ok:false,reason:'Niveau invalide.'};
 if(id==='militia'&&labRarity(lab,side,id)!=='commun'&&level<1)
  return {ok:false,reason:'Le niveau commence à 1 au-delà de Commune.'};
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
 const p=freshProfile();
 p.heroClass=lab.heroClass;p.deck=[...lab.decks.p];
 p.collection=Object.fromEntries(p.deck.map(id=>[id,p.deck.filter(x=>x===id).length]));
 p.upgrades={};p.mastery={};
 const m={...CAMPAIGN[0],id:'laboratoire',name:'Laboratoire de combat',enemy:'IA de test',
  hp:26,difficulty:2,boss:false,mode:'developer',aiStyle:lab.aiStyle,
  deck:[...lab.decks.e],unlock:null};
 const b=createBattle(p,m,seed,{turnFlow:'alternating'});
 // Ces valeurs restent uniquement dans la bataille de test, jamais dans le stockage.
 b.labStats={levels:structuredClone(lab.levels),rarities:structuredClone(lab.rarities)};
 return b;
}