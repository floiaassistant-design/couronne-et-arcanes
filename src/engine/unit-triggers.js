// Préparation des protections et récompenses de frappe, moteur commun.
import {versionUnitAbilities} from '../cards/definitions.js';
import {grantAbilityBarrier,grantCrownShield,absorbBarrier} from './unit-barriers.js';
import {alliedTargets,injuryOrder} from './unit-targets.js';
import {lastCell} from './board.js';

// Après les réactions de contact : aucun recul à distance ni attaque ajoutée.
export function resolveStrikeDisplacement(b,u,target,{damaged,suppressed},hooks){
 const p=versionUnitAbilities(u)?.knockback;
 if(!p||suppressed||!damaged||u.hp<=0||target?.hp<=0||target?.side===u.side||u.ranged||u.knockbackReadyRound>b.round)return false;
 const lane=b.board.findIndex(row=>row.includes(u)),row=b.board[lane];
 if(!row||!row.includes(target))return false;
 const from=row.indexOf(u),col=row.indexOf(target),dir=target.side==='p'?-1:1;
 if(col-from!==dir)return false;
 const destination=col+dir*p.cells;
 if(destination<1||destination>lastCell(b)||row[destination])return false;
 u.knockbackReadyRound=b.round+p.period;
 row[destination]=target;row[col]=null;
 hooks.emit(b,{type:'move',side:target.side,lane,from:col,to:destination,knockback:true});
 hooks.enter(b,target,lane,destination);
 return true;
}

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
