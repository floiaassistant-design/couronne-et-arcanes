// Préparation des protections et récompenses de frappe, moteur commun.
import {versionUnitAbilities} from '../cards/definitions.js';
import {grantAbilityBarrier,grantCrownShield,absorbBarrier} from './unit-barriers.js';
import {alliedTargets,injuryOrder} from './unit-targets.js';

export function resolveStrikePreparation(b,u,target,suppressed,emit){
 const p=versionUnitAbilities(u)?.barrierDrill;
 if(!p||suppressed||!target||target.hp<=0||target.side===u.side||!(target.barrier>0)||u.barrierDrillReadyRound>b.round)return 0;
 const removed=absorbBarrier(target,p.amount);
 if(!removed)return 0;
 u.barrierDrillReadyRound=b.round+p.period;
 const lane=b.board.findIndex(row=>row.includes(target));
 if(lane>=0)emit(b,{type:'state',side:target.side,lane,col:b.board[lane].indexOf(target),barrierRemoved:removed});
 return removed;
}

export function resolveStrikeRewards(b,u,lane,col,{charged,furious,killed,suppressed,damaged,execution},emit){
 if(suppressed||u.hp<=0)return;
 const a=versionUnitAbilities(u);
 if(a.strikeWard&&(!a.strikeWard.requiresKill||killed)&&!(u.strikeWardReadyRound>b.round)){
  u.strikeWardReadyRound=b.round+a.strikeWard.period;
  if(grantCrownShield(b.heroes[u.side],a.strikeWard))emit(b,{type:'state',side:u.side,lane,col});
 }
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
