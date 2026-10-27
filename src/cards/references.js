// Identité et inventaire : les anciens ID restent des chaînes, les évolutions
// sont des références {id,rarity}. Jamais de nouvelle entrée dans CARDS.
import {CARDS} from '../data.js';
import {resolveUnitDefinition} from './definitions.js';
import {EVOLUTION_TRIALS,evolutionTrialFor,evolutionTrial} from '../evolution-trials.js';

export const cardId=ref=>typeof ref==='string'?ref:ref?.id;
export function cardReference(ref){
 const id=cardId(ref);if(typeof id!=='string'||!Object.hasOwn(CARDS,id))return null;const c=CARDS[id];
 if(typeof ref==='string'||ref.rarity===undefined)return id;
 if(c.type==='sort')return ref.rarity===c.rarity?id:null;
 const d=resolveUnitDefinition(ref);if(!d)return null;
 return d.rarity===c.rarity?id:Object.freeze({id,rarity:d.rarity});
}
export function cardKey(ref){const r=cardReference(ref);return typeof r==='string'?r:r?`${r.id}:${r.rarity}`:'';}
export function cardFromKey(key){
 if(typeof key!=='string')return null;
 if(Object.hasOwn(CARDS,key))return key;
 const parts=key.split(':');return parts.length===2?cardReference({id:parts[0],rarity:parts[1]}):null;
}
export function cardRarity(ref){const r=cardReference(ref);return typeof r==='string'?CARDS[r].rarity:r?.rarity;}
export function playableCardReference(ref){
 const r=cardReference(ref);return !!r&&(typeof r==='string'||!!evolutionTrialFor(r.id,r.rarity));
}
export function ownedCardCopies(profile,ref){
 const r=cardReference(ref);return !r?0:typeof r==='string'?(profile.collection?.[r]||0):(playableCardReference(r)?profile.evolvedCollection?.[cardKey(r)]||0:0);
}
export function ownedCardEntries(profile){
 const list=Object.entries(profile.collection||{}).filter(([id,n])=>Object.hasOwn(CARDS,id)&&Number.isSafeInteger(n)&&n>0).map(([reference,quantity])=>({reference,quantity}));
 for(const [key,quantity] of Object.entries(profile.evolvedCollection||{})){
  const reference=cardFromKey(key);if(typeof reference==='object'&&reference&&playableCardReference(reference)&&quantity>0)list.push({reference,quantity});
 }
 return list;
}
export const totalOwnedCopies=(profile,id)=>ownedCardEntries(profile).filter(e=>cardId(e.reference)===id).reduce((n,e)=>n+e.quantity,0);
export function normalizeEvolutionInventory(raw){
 const result={};if(!raw||typeof raw!=='object'||Array.isArray(raw))return result;
 for(const [key,n] of Object.entries(raw)){
  const r=cardFromKey(key);if(r&&typeof r==='object'&&playableCardReference(r)&&Number.isSafeInteger(n)&&n>=0)result[cardKey(r)]=Math.min(n,100000);
 }
 return result;
}
export function evolutionProfileError(raw){
 if(raw.evolvedCollection!==undefined){
  if(!raw.evolvedCollection||typeof raw.evolvedCollection!=='object'||Array.isArray(raw.evolvedCollection))return 'Inventaire d’évolutions invalide.';
  for(const [key,n] of Object.entries(raw.evolvedCollection)){
   const r=cardFromKey(key);
   if(!r||typeof r!=='object'||!playableCardReference(r)||!Number.isSafeInteger(n)||n<0)return 'Version ou quantité d’évolution invalide.';
  }
 }
 if(raw.completedTrials!==undefined&&(!Array.isArray(raw.completedTrials)||!raw.completedTrials.every(id=>!!evolutionTrial(id))))return 'Épreuves terminées invalides.';
 return '';
}
export const completedEvolutionTrials=raw=>[...new Set(Array.isArray(raw)?raw.filter(id=>EVOLUTION_TRIALS.some(t=>t.id===id)):[])];
