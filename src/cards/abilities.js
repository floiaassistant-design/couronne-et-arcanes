// Description structurée du socle natif. Le branchement des règles de combat suit aux étapes 3/4.
import {FLYING_IDS,GUARD_IDS,CHARGE_IDS,RIPOSTE_IDS} from '../data.js';

export function nativeUnitAbilities(card){
 const abilities={};
 const primary={
  armor:{amount:2,minimumDamage:1},
  ranged:{},haste:{},
  heal:{amount:2,targets:1,scope:'line',includeSelf:true,selection:'injury-ratio',timing:'after-attacks'},
  inspire:{amount:1,targets:1,scope:'line',includeSelf:false,period:3,cap:12,timing:'after-attacks'},
  ward:{amount:3,cap:20,target:'own-crown',timing:'spawn'},
  pierce:{target:'primary',ignoreArmor:true},
  poison:{amount:1,resolutions:2,target:'primary'},
  splash:{amount:2,target:'other-enemy-on-line'},
  lifesteal:{amount:2,target:'own-hero',trigger:'attack'},
  silence:{period:3,resolutions:1,target:'enemy-on-line'},
  portal:{period:3,target:'free-same-column'},
  trapper:{period:3,damage:1,stun:1,resolutions:3}
 };
 if(card.ability&&Object.hasOwn(primary,card.ability))abilities[card.ability]=primary[card.ability];
 if(FLYING_IDS.has(card.id))abilities.flying={over:'ally',landing:'free'};
 if(GUARD_IDS.has(card.id))abilities.guard={scope:'legacy-line',target:'own-crown',unitTargetPriority:true};
 if(CHARGE_IDS.has(card.id))abilities.charge={amount:2,condition:'moved-before-attack'};
 if(RIPOSTE_IDS.has(card.id))abilities.riposte={damageMode:'fixed',amount:2,frequency:'round',trigger:'melee-attack'};
 return abilities;
}

// Un seul enregistrement par pouvoir : une amélioration remplace ses paramètres, jamais un second déclencheur.
export function inheritUnitAbilities(previous,changes={}){
 const result=structuredClone(previous);
 for(const [id,parameters] of Object.entries(changes)){
  result[id]={...result[id],...parameters};
 }
 return result;
}
