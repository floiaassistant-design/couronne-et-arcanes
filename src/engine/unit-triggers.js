// Préparation des protections et récompenses de frappe, moteur commun.
import {versionUnitAbilities} from '../cards/definitions.js';
import {grantAbilityBarrier,grantCrownShield,absorbBarrier} from './unit-barriers.js';
import {alliedTargets,injuryOrder} from './unit-targets.js';
import {lastCell} from './board.js';
import {placeSpotMark} from './unit-strike-modifiers.js';
import {poisonBelongsTo,clearUnitPoison} from './unit-poison.js';

// Repli personnel après une frappe normale touchant une unité encore vivante.
export function resolveSpectralRetreat(b,u,target,{performed,suppressed},hooks){
 const p=versionUnitAbilities(u)?.spectralRetreat;
 if(!p||!performed||suppressed||u.hp<=0||!target||target.hp<=0||target.side===u.side||u.spectralRetreatReadyRound>b.round)return false;
 const lane=b.board.findIndex(row=>row.includes(u)),row=b.board[lane];
 if(!row)return false;
 const from=row.indexOf(u),to=from+(u.side==='p'?-1:1)*p.cells;
 if(to<1||to>lastCell(b)||row[to])return false;
 u.spectralRetreatReadyRound=b.round+p.period;
 row[to]=u;row[from]=null;
 hooks.emit(b,{type:'move',side:u.side,lane,from,to,spectralRetreat:true});
 hooks.enter(b,u,lane,to);
 return true;
}

// Quota propre au gardien, distinct du nombre illimité d'interceptions.
export function resolveGuardWard(b,u,intercepted,performed,suppressed,emit){
 const p=versionUnitAbilities(u)?.guardWard;
 if(!p||!intercepted||!performed||suppressed||u.hp<=0||u.lastGuardWardRound===b.round)return 0;
 u.lastGuardWardRound=b.round;
 const gained=grantCrownShield(b.heroes[u.side],p);
 if(gained){
  const lane=b.board.findIndex(row=>row.includes(u));
  if(lane>=0)emit(b,{type:'state',side:u.side,lane,col:b.board[lane].indexOf(u),guardWard:gained});
 }
 return gained;
}

// Détonation secondaire après la frappe : jamais une nouvelle attaque.
export function resolveAlchemyStrike(b,u,target,poisonedAtStart,suppressed,hit){
 const p=versionUnitAbilities(u)?.catalysis;
 if(!p||suppressed||u.hp<=0||!poisonedAtStart||!poisonBelongsTo(target,u)||u.catalysisReadyRound>b.round)return false;
 clearUnitPoison(target);u.catalysisReadyRound=b.round+p.period;
 hit(b,target,p.amount,u.side);
 return true;
}

// Après les réactions de contact : aucun recul à distance ni attaque ajoutée.
export function resolveStrikeDisplacement(b,u,target,{damaged,suppressed},hooks){
 const p=versionUnitAbilities(u)?.knockback;
 if(!p||suppressed||!damaged||u.hp<=0||target?.hp<=0||target?.side===u.side||u.ranged||u.knockbackReadyRound>b.round)return false;
 const lane=b.board.findIndex(row=>row.includes(u)),row=b.board[lane];
 if(!row||!row.includes(target))return false;
 const from=row.indexOf(u),col=row.indexOf(target),dir=target.side==='p'?-1:1;
 if(col-from!==dir)return false;
 const destination=col+dir*p.cells;
 if(destination<1||destination>lastCell(b)||row[destination]){
  if(!p.blockedDamage)return false;
  u.knockbackReadyRound=b.round+p.period;
  hooks.hit(b,target,p.blockedDamage,u.side);
  return true;
 }
 u.knockbackReadyRound=b.round+p.period;
 row[destination]=target;row[col]=null;
 hooks.emit(b,{type:'move',side:target.side,lane,from:col,to:destination,knockback:true});
 hooks.enter(b,target,lane,destination);
 if(p.follow&&u.hp>0&&row[from]===u&&!row[col]){
  row[col]=u;row[from]=null;
  hooks.emit(b,{type:'move',side:u.side,lane,from,to:col,followKnockback:true});
  hooks.enter(b,u,lane,col);
 }
 return true;
}

export function resolveStrikePreparation(b,u,target,suppressed,emit){
 const p=versionUnitAbilities(u)?.barrierDrill;
 if(!p||suppressed||!target||target.hp<=0||target.side===u.side||!(target.barrier>0)||u.barrierDrillReadyRound>b.round)return 0;
 const removed=absorbBarrier(target,p.amount);
 if(!removed)return 0;
 u.barrierDrillReadyRound=b.round+p.period;
 if(p.breakBarrier&&!target.barrier)grantAbilityBarrier(u,'drillBarrier',p.breakBarrier);
 const lane=b.board.findIndex(row=>row.includes(target));
 if(lane>=0)emit(b,{type:'state',side:target.side,lane,col:b.board[lane].indexOf(target),barrierRemoved:removed});
 return removed;
}

export function resolveStrikeRewards(b,u,lane,col,{charged,furious,killed,suppressed,damaged,execution,victim},emit){
 if(suppressed||u.hp<=0)return;
 const a=versionUnitAbilities(u);
 if(a.spotting&&damaged&&victim?.hp>0&&!(u.spottingReadyRound>b.round)){
  if(placeSpotMark(b,u,victim,a.spotting,emit))u.spottingReadyRound=b.round+a.spotting.period;
 }
 if(a.strikeWard&&(a.strikeWard.requiresKill?killed:damaged)&&!(u.strikeWardReadyRound>b.round)){
  u.strikeWardReadyRound=b.round+a.strikeWard.period;
  const gained=grantCrownShield(b.heroes[u.side],a.strikeWard),p=a.strikeWard.overflowBarrier;
  const barrier=p?grantAbilityBarrier(u,'scrapBarrier',{...p,amount:Math.min(p.amount,a.strikeWard.amount-gained)}):0;
  if(gained||barrier)emit(b,{type:'state',side:u.side,lane,col});
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

// Une attaque directe qui retire des PV et laisse le défenseur vivant compte.
export function resolveSurvivedStrike(b,u,attacker,damaged,suppressed,emit){
 const p=versionUnitAbilities(u)?.scoria;
 if(!p||suppressed||!damaged||u.hp<=0||!attacker||attacker.side===u.side)return;
 u.scoriaHits=Math.min(p.hits,(u.scoriaHits||0)+1);
 if(u.scoriaHits<p.hits||u.scoriaReadyRound>b.round)return;
 u.scoriaHits=0;u.scoriaReadyRound=b.round+p.period;
 if(grantAbilityBarrier(u,'scoriaBarrier',p)){
  const lane=b.board.findIndex(row=>row.includes(u));
  if(lane>=0)emit(b,{type:'state',side:u.side,lane,col:b.board[lane].indexOf(u)});
 }
}
