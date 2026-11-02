// Déclencheurs de protection après frappe, moteur commun.
import {versionUnitAbilities} from '../cards/definitions.js';
import {grantAbilityBarrier} from './battle-defense.js';
import {alliedTargets,injuryOrder} from './unit-targets.js';

export function resolveStrikeRewards(b,u,lane,col,{charged,furious,killed,suppressed,damaged,execution},emit){
 if(suppressed||u.hp<=0)return;
 const a=versionUnitAbilities(u);
 const protect=(target,key,p)=>{if(grantAbilityBarrier(target.u,key,p))emit(b,{type:'state',side:u.side,lane:target.lane,col:target.col});};
 if(charged&&a.chargeBarrier&&(!a.chargeBarrier.requiresKill||killed)&&(!a.chargeBarrier.frequency||u.lastChargeBarrierRound!==b.round)){
  if(a.chargeBarrier.frequency)u.lastChargeBarrierRound=b.round;
  protect({u,lane,col},'chargeBarrier',a.chargeBarrier);
  if(a.chargeBarrier.allies)for(const target of alliedTargets(b,u,lane,{includeSelf:false}).sort(injuryOrder).slice(0,a.chargeBarrier.allies))protect(target,'chargeBarrier',a.chargeBarrier);
 }
 if(killed&&a.devour){
  u.hp=Math.min(u.maxhp,u.hp+a.devour.heal);
  if(a.devour.attack)u.devourAttack=Math.min(a.devour.cap,(u.devourAttack||0)+a.devour.attack);
  emit(b,{type:'heal',side:u.side,lane,col});
 }
 if(damaged&&a.strikeHeal&&u.lastStrikeHealRound!==b.round){
  u.lastStrikeHealRound=b.round;u.hp=Math.min(u.maxhp,u.hp+a.strikeHeal.amount);emit(b,{type:'heal',side:u.side,lane,col});
 }
 if(killed&&execution&&a.execution?.killHaste)u.killHasteRound=b.round+1;
 if(furious&&killed&&a.furyBarrier&&u.lastFuryBarrierRound!==b.round){
  u.lastFuryBarrierRound=b.round;protect({u,lane,col},'furyBarrier',a.furyBarrier);
 }
}
