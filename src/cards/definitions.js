// Catalogue de versions en lecture seule. Aucun ajout à CARDS, aucune possession ni règle activée.
import {CARDS} from '../data.js';
import {CARD_RARITIES,normalizeCardRarity,freezeCardData} from './schema.js';
import {nativeUnitAbilities,inheritUnitAbilities,FUTURE_GUARD_POLICY} from './abilities.js';
import {AUBE_EVOLUTIONS,AUBE_DESIGN_SOURCE} from './aube.js';
import {evolutionTrialFor} from '../evolution-trials.js';

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
  const definition=freezeCardData({
   id:card.id,versionId:`${card.id}:${rank.id}`,rarity:rank.id,nativeRarity:card.rarity,
   stats:{...stats},geometry:{...geometry},abilities,
   status:{design:'validated',combat:native||evolutionTrialFor(card.id,rank.id)?'implemented':'pending',engine:'implemented',obtaining:native?'existing':evolutionTrialFor(card.id,rank.id)?'trial':'undefined'},
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

// Identité explicite des règles futures. Les anciens instantanés restent historiques.
export const AUBE_RULESET='aube-v1';
const rulesDefinitions=new Map();
for(const versions of definitions.values())for(const def of versions){
 if(!AUBE_UNIT_IDS.includes(def.id))continue;
 const changes={};
 if(def.abilities.riposte&&def.id!=='militia')changes.riposte={damageMode:'effective-attack'};
 if(def.abilities.guard)changes.guard={...FUTURE_GUARD_POLICY,scope:def.rarity===def.nativeRarity?'positioned':def.abilities.guard.scope,unitTargetPriority:false};
 rulesDefinitions.set(def.versionId,freezeCardData({...def,cardRules:AUBE_RULESET,
  abilities:inheritUnitAbilities(def.abilities,changes),source:AUBE_DESIGN_SOURCE}));
}
export function resolveRulesDefinition(reference){
 const def=resolveUnitDefinition(reference);return def?rulesDefinitions.get(def.versionId)||def:null;
}
export function versionUnitAbilities(unit){
 if(!unit||!Object.hasOwn(unit,'rarity'))return null;
 const d=unit.cardRules===AUBE_RULESET?resolveRulesDefinition(unit):resolveUnitDefinition(unit);
 return d?.source?d.abilities:null;
}
