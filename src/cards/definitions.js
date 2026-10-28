// Registre unique des règles actuelles ; aucune possession ajoutée au catalogue.
import {CARDS} from '../data.js';
import {CARD_RARITIES,normalizeCardRarity,freezeCardData} from './schema.js';
import {nativeUnitAbilities,inheritUnitAbilities} from './abilities.js';
import {AUBE_EVOLUTIONS,AUBE_DESIGN_SOURCE} from './aube.js';
import {evolutionTrialFor} from '../evolution-trials.js';
import {evolutionFusionFor} from '../evolution-fusion.js';

export const AUBE_UNIT_IDS=Object.freeze(Object.keys(AUBE_EVOLUTIONS));
const definitions=new Map();
const noVersions=Object.freeze([]);

for(const card of Object.values(CARDS)){
 if(card.type!=='unité')continue;
 const nativeIndex=CARD_RARITIES.findIndex(rank=>rank.id===card.rarity);
 if(nativeIndex<0)throw Error('Rareté native inconnue : '+card.id);
 const versions=[];
 let stats={attack:card.attack,hp:card.hp,delay:card.delay};
 let geometry={steps:card.ability==='haste'?2:1,range:card.ability==='ranged'?2:1};
 let abilities=nativeUnitAbilities(card),pendingDecisions=[];
 for(const rank of CARD_RARITIES.slice(nativeIndex)){
  const native=rank.id===card.rarity;
  const patch=AUBE_EVOLUTIONS[card.id]?.[rank.id];
  if(!native&&!patch)break;
  stats={...stats,...patch?.stats};
  geometry={...geometry,...patch?.geometry};
  abilities=inheritUnitAbilities(abilities,patch?.abilities);
  pendingDecisions=patch?.pendingDecisions||pendingDecisions;
  const trial=evolutionTrialFor(card.id,rank.id),fusion=evolutionFusionFor(card.id,rank.id);
  const definition=freezeCardData({
   id:card.id,versionId:`${card.id}:${rank.id}`,rarity:rank.id,nativeRarity:card.rarity,
   stats:{...stats},geometry:{...geometry},abilities,
   status:{design:'validated',combat:native||trial||fusion?'implemented':'pending',engine:'implemented',obtaining:native?'existing':trial&&fusion?'trial-or-fusion':trial?'trial':fusion?'fusion':'undefined'},
   pendingDecisions:[...pendingDecisions],source:native?null:AUBE_DESIGN_SOURCE
  });
  versions.push(definition);
 }
 definitions.set(card.id,Object.freeze(versions));
}

// Une chaîne historique désigne toujours le natif. Une référence future garde le même ID.
// Une rareté explicite inconnue/inexistante échoue, sans repli silencieux sur le natif.
export function resolveUnitDefinition(reference,rarity){
 const id=typeof reference==='string'?reference:reference?.id;
 if(typeof id!=='string'||!definitions.has(id))return null;
 const explicit=rarity!==undefined?rarity:typeof reference==='object'?reference?.rarity:undefined;
 const rank=explicit===undefined?CARDS[id].rarity:normalizeCardRarity(explicit);
 return definitions.get(id).find(version=>version.rarity===rank)||null;
}

export function unitVersions(id){return definitions.get(id)||noVersions;}

export function unitVersionReference(id,rarity){
 const definition=resolveUnitDefinition(id,rarity);
 return definition?Object.freeze({id:definition.id,rarity:definition.rarity}):null;
}

export function unitVersionPlayable(reference){
 return resolveUnitDefinition(reference)?.status.combat==='implemented';
}

// Révision du combat, pas une variante sélectionnable de ses règles.
export const CARD_RULESET='cards-v2';
// Même registre pour aventure, laboratoire, fiches et références natives.
export const resolveRulesDefinition=resolveUnitDefinition;
export function versionUnitAbilities(unit){return unit?resolveUnitDefinition(unit)?.abilities||null:null;}
