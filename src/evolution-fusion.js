// Recettes d'obtention uniquement ; statistiques et pouvoirs restent dans le registre.
import {CARDS} from './data.js';
import {EVOLUTION_FAMILIES} from './cards/evolutions.js';
import {CARD_RARITIES,freezeCardData} from './cards/schema.js';
import {EVOLUTION_ASCENSIONS,evolutionAscensionFor} from './evolution-trials.js';

export const EVOLUTION_FUSION_COPIES=3;
export const EVOLUTION_FUSION_MISSIONS=freezeCardData({rare:'01','épique':'03','légendaire':'06',...Object.fromEntries(EVOLUTION_ASCENSIONS.map(t=>[t.to,t.mission]))});
export const EVOLUTION_FUSIONS=freezeCardData(EVOLUTION_FAMILIES.flatMap(family=>Object.entries(family.versions).flatMap(([cardId,versions])=>{
 const native=CARD_RARITIES.findIndex(r=>r.id===CARDS[cardId].rarity);
 return CARD_RARITIES.flatMap((rank,index)=>{
  if(index<=native||!Object.hasOwn(EVOLUTION_FUSION_MISSIONS,rank.id)||!versions[rank.id])return [];
  const ascension=evolutionAscensionFor(CARDS[cardId].faction,rank.id);
  return [{id:`${cardId}:${rank.id}`,cardId,from:CARD_RARITIES[index-1].id,to:rank.id,copies:EVOLUTION_FUSION_COPIES,mission:EVOLUTION_FUSION_MISSIONS[rank.id],...(ascension?{ascension:ascension.id}:{})}];
 });
})));
export const evolutionFusion=id=>EVOLUTION_FUSIONS.find(r=>r.id===id)||null;
export const evolutionFusionFor=(id,rarity)=>EVOLUTION_FUSIONS.find(r=>r.cardId===id&&r.to===rarity)||null;
