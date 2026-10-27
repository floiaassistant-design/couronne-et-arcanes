// Lecture commune des paramètres de combat, sans moteur, DOM ou accès au profil.
import {CARDS} from '../data.js';
import {resolveUnitDefinition,versionUnitAbilities,CARD_RULESET} from '../cards/definitions.js';

export function battleUnitReference(context,reference,side='p'){
 const entry=typeof reference==='string'?{id:reference}:reference;
 if(!entry||!CARDS[entry.id])return null;
 if(Object.hasOwn(entry,'rarity'))return {id:entry.id,rarity:entry.rarity};
 const rarity=context.mode==='developer'?context.labStats?.rarities?.[side]?.[entry.id]:undefined;
 return rarity===undefined?{id:entry.id}:{id:entry.id,rarity};
}
export function battleUnitDefinition(context,reference,side='p'){
 return resolveUnitDefinition(battleUnitReference(context,reference,side));
}
export function unitCanPlay(context,reference,side='p'){
 const d=battleUnitDefinition(context,reference,side);if(!d)return false;
 if(d.rarity===d.nativeRarity)return true;
 if(context.mode==='developer')return d.status.engine==='implemented';
 return side==='p'&&context.evolutionsEnabled===true&&d.status.combat==='implemented';
}
export function unitAttackRange(u){
 return u?.ranged?Math.max(2,resolveUnitDefinition(u)?.geometry.range||0):1;
}
export function unitMovementSteps(u,suppressed=false){
 const d=resolveUnitDefinition(u);
 return d?.abilities.haste&&!suppressed?d.geometry.steps:1;
}
export function unitChargeAmount(u){return versionUnitAbilities(u)?.charge?.amount||0;}
export function unitHasPierce(u,suppressed=false){return !suppressed&&!!versionUnitAbilities(u)?.pierce?.ignoreArmor;}
export function unitFlying(u){return !!versionUnitAbilities(u)?.flying;}

export const battleRulesError=b=>b?.cardRules===CARD_RULESET?'':'Ce combat doit être relancé après la mise à jour des cartes.';
