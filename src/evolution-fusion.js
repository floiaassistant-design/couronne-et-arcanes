// Recettes d'obtention uniquement ; statistiques et pouvoirs restent dans le registre.
import {CARDS} from './data.js';
import {AUBE_EVOLUTIONS} from './cards/aube.js';
import {CARD_RARITIES,freezeCardData} from './cards/schema.js';

export const EVOLUTION_FUSION_COPIES=3;
export const EVOLUTION_FUSIONS=freezeCardData(Object.entries(AUBE_EVOLUTIONS).flatMap(([cardId,versions])=>{
 const native=CARD_RARITIES.findIndex(r=>r.id===CARDS[cardId].rarity);
 return CARD_RARITIES.flatMap((rank,index)=>index>native&&['rare','épique'].includes(rank.id)&&versions[rank.id]
  ?[{id:`${cardId}:${rank.id}`,cardId,from:CARD_RARITIES[index-1].id,to:rank.id,copies:EVOLUTION_FUSION_COPIES,mission:rank.id==='rare'?'01':'03'}]:[]);
}));
export const evolutionFusion=id=>EVOLUTION_FUSIONS.find(r=>r.id===id)||null;
export const evolutionFusionFor=(id,rarity)=>EVOLUTION_FUSIONS.find(r=>r.cardId===id&&r.to===rarity)||null;
