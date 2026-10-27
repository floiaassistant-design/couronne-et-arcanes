// Lecture commune des paramètres de combat, sans moteur, DOM ou accès au profil.
import {CARDS,CHARGE_IDS,FLYING_IDS} from '../data.js';
import {resolveUnitDefinition,resolveRulesDefinition,versionUnitAbilities,AUBE_RULESET} from '../cards/definitions.js';

export function battleUnitReference(context,reference,side='p'){
 const entry=typeof reference==='string'?{id:reference}:reference;
 if(!entry||!CARDS[entry.id])return null;
 if(Object.hasOwn(entry,'rarity'))return {id:entry.id,rarity:entry.rarity};
 const rarity=context.mode==='developer'?context.labStats?.rarities?.[side]?.[entry.id]:undefined;
 return rarity===undefined?{id:entry.id}:{id:entry.id,rarity};
}
export function battleUnitDefinition(context,reference,side='p'){
 const ref=battleUnitReference(context,reference,side);
 const native=CARDS[ref?.id]?.rarity;
 return context.cardRules===AUBE_RULESET||ref?.rarity!==undefined&&ref.rarity!==native?resolveRulesDefinition(ref):resolveUnitDefinition(ref);
}
export function unitCanPlay(context,reference,side='p'){
 const d=battleUnitDefinition(context,reference,side);if(!d)return false;
 if(d.rarity===d.nativeRarity)return true;
 if(context.mode==='developer')return context.cardRules===AUBE_RULESET&&d.status.engine==='implemented';
 return side==='p'&&context.evolutionsEnabled===true&&d.status.combat==='implemented';
}
export function unitAttackRange(u){
 const d=versionUnitAbilities(u);
 return d?resolveRulesDefinition(u).geometry.range:u.ranged?2:1;
}
export function unitMovementSteps(u,suppressed=false){
 const abilities=versionUnitAbilities(u);
 return abilities?(abilities.haste&&!suppressed?resolveRulesDefinition(u).geometry.steps:1):!suppressed&&u.ability==='haste'?2:1;
}
export function unitChargeAmount(u){return versionUnitAbilities(u)?.charge?.amount??(CHARGE_IDS.has(u.id)?2:0);}
export function unitHasPierce(u,suppressed=false){return !suppressed&&(versionUnitAbilities(u)?!!versionUnitAbilities(u).pierce?.ignoreArmor:u.ability==='pierce');}
export function unitFlying(u){return !!u&&(versionUnitAbilities(u)?!!versionUnitAbilities(u).flying:FLYING_IDS.has(u.id));}
