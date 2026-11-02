// Déclencheurs de protection après frappe, moteur commun.
import {versionUnitAbilities} from '../cards/definitions.js';
import {grantAbilityBarrier} from './battle-defense.js';
import {alliedTargets,injuryOrder} from './unit-targets.js';

export function resolveStrikeRewards(b,u,lane,col,{charged,furious,killed,suppressed},emit){
 if(suppressed||u.hp<=0)return;
 const a=versionUnitAbilities(u);
 const protect=(target,key,p)=>{if(grantAbilityBarrier(target.u,key,p))emit(b,{type:'state',side:u.side,lane:target.lane,col:target.col});};
 if(charged&&a.chargeBarrier){
  protect({u,lane,col},'chargeBarrier',a.chargeBarrier);
  if(a.chargeBarrier.allies)for(const target of alliedTargets(b,u,lane,{includeSelf:false}).sort(injuryOrder).slice(0,a.chargeBarrier.allies))protect(target,'chargeBarrier',a.chargeBarrier);
 }
 if(furious&&killed&&a.furyBarrier&&u.lastFuryBarrierRound!==b.round){
  u.lastFuryBarrierRound=b.round;protect({u,lane,col},'furyBarrier',a.furyBarrier);
 }
}
