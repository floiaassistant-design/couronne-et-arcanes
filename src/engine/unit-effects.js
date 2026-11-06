// États temporaires communs aux unités ; jamais de modification permanente d'ATQ.
import {versionUnitAbilities} from '../cards/definitions.js';
import {applyUnitPoison,validPoisonOrigin} from './unit-poison.js';
import {validStrikeModifiers,activeStrikeState} from './unit-strike-modifiers.js';
import {validStillOmen,validRetaliatoryOmen} from './unit-omens.js';
import {validPortalEcho} from './unit-portal-echo.js';
import {validFlightWake} from './unit-flight-support.js';
import {healUnit,validHealingPenalty} from './unit-healing.js';

export function attackAfterPenalty(u,raw,round=0){
 const boosted=raw+(u.fury||0)+(u.devourAttack||0);
 return Math.min(boosted,...[u.attackPenalty,activeStrikeState(u,'prismPenalty',round)].filter(Boolean).map(p=>Math.max(p.minimum||0,boosted-p.amount)));
}
export function consumeAttackPenalty(u,raw,round=0){
 const result=attackAfterPenalty(u,raw,round),p=u.attackPenalty;
 if(p){if(p.remaining<=1)delete u.attackPenalty;else u.attackPenalty={...p,remaining:p.remaining-1};}
 delete u.prismPenalty;
 if(u.fury)delete u.fury;
 return result;
}
export function applyAttackEffects(source,target,suppressed=false,round=0,touched=true,{battle,lane,col,skipPoison=false}={}){
 if(suppressed||!target||target.side===source.side)return;
 const a=versionUnitAbilities(source);
 if(a?.poison&&source.ability==='poison'&&!skipPoison&&(!a.catalysis||touched)){
  applyUnitPoison(target,a.poison,{uid:source.uid,side:source.side,contagion:a.contagion});
 }
 if(a?.harass&&target.hp>0){
  const p=a.harass;
  if(!p.period){
   if(target.attackPenalty?.minimum!==undefined)applyAttackPenalty(target,{...p,minimum:0});
   else target.attackPenalty={amount:p.amount,remaining:p.attacks};
  }
  else if(touched&&!(source.harassReadyRound>round)){
   source.harassReadyRound=round+p.period;applyAttackPenalty(target,p);
   if(p.secondary&&battle){
    const other=battle.board[lane].map((u,col)=>({u,col})).filter(t=>t.u&&t.u.hp>0&&t.u.side===target.side&&t.u.uid!==target.uid&&Math.abs(t.col-col)<=p.secondary.range)
     .sort((a,z)=>Math.abs(a.col-col)-Math.abs(z.col-col)||a.col-z.col||a.u.uid-z.u.uid).slice(0,p.secondary.targets);
    for(const t of other)applyAttackPenalty(t.u,{...p,amount:p.secondary.amount});
   }
  }
 }
 if(touched&&target.hp>0&&a?.entangle&&round>0){
  const p=a.entangle,ready=p.frequency==='invocation'?!source.entangleUsed:!(source.entangleReadyRound>round);
  if(ready){target.movementRoot=1;if(p.frequency==='invocation')source.entangleUsed=true;else source.entangleReadyRound=round+p.period;}
 }
}
function applyAttackPenalty(target,p){
 const old=target.attackPenalty;if(old&&old.amount>p.amount)return;
 target.attackPenalty={amount:p.amount,remaining:Math.max(p.attacks,old?.remaining||0),minimum:old&&old.amount===p.amount?Math.min(old.minimum||0,p.minimum):p.minimum};
}
export function executionBonus(u,target,suppressed=false){
 const p=versionUnitAbilities(u)?.execution;
 return !suppressed&&p&&target.hp>0&&target.hp*2<=target.maxhp?p.amount:0;
}
export function resolveLifesteal(b,u){
 const p=versionUnitAbilities(u)?.lifesteal;if(!p)return;
 const hero=b.heroes[u.side];hero.hp=Math.min(hero.maxhp,hero.hp+p.amount);
}
export function grantRegeneration(b,target,parameters){
 target.regeneration={amount:parameters.amount,remaining:parameters.resolutions,readyRound:b.round+1};
}
// Une fois au prochain tour de son camp, avant les nouveaux soins/applications.
export function resolveRegeneration(b,sideFilter,emit){
 for(let lane=0;lane<b.board.length;lane++)for(let col=1;col<b.board[lane].length-1;col++){
  const u=b.board[lane][col],p=u?.regeneration;
  if(!p||u.hp<=0||(sideFilter&&u.side!==sideFilter)||b.round<p.readyRound)continue;
  if(p.remaining<=1)delete u.regeneration;
  else u.regeneration={...p,remaining:p.remaining-1,readyRound:b.round+1};
  if(healUnit(u,p.amount,b.round))emit(b,{type:'heal',side:u.side,lane,col,regeneration:true});
 }
}
const integer=(n,max)=>Number.isSafeInteger(n)&&n>0&&n<=max;
export function validUnitEffects(u,battle){
 const p=u.attackPenalty,r=u.regeneration;
 return (p===undefined||p&&integer(p.amount,100)&&integer(p.remaining,10)&&(p.minimum===undefined||p.minimum===0||p.minimum===1))&&
  (r===undefined||r&&integer(r.amount,100)&&integer(r.remaining,10)&&integer(r.readyRound,100))&&
  (u.movementRoot===undefined||u.movementRoot===1)&&(u.entangleUsed===undefined||typeof u.entangleUsed==='boolean')&&
  (u.deathResolved===undefined||typeof u.deathResolved==='boolean')&&
  (u.deathStrikeUsed===undefined||typeof u.deathStrikeUsed==='boolean')&&
  (u.devourAttack===undefined||integer(u.devourAttack,2))&&
  ['harassReadyRound','lastStrikeHealRound','lastChargeBarrierRound','killHasteRound','strikeWardReadyRound','barrierDrillReadyRound','knockbackReadyRound','scoriaReadyRound','spottingReadyRound','catalysisReadyRound','spectralRetreatReadyRound','stillOmenReadyRound','lastGuardWardRound','guardPrismReadyRound','splashKnockbackReadyRound'].every(k=>u[k]===undefined||integer(u[k],100))&&
  (u.scoriaHits===undefined||Number.isSafeInteger(u.scoriaHits)&&u.scoriaHits>=0&&u.scoriaHits<=2)&&
  (u.movedCellsThisRound===undefined||Number.isSafeInteger(u.movedCellsThisRound)&&u.movedCellsThisRound>=0&&u.movedCellsThisRound<=10)&&
  (u.lastFuneralWatchRound===undefined||integer(u.lastFuneralWatchRound,100))&&
  (u.flightSupportReadyRound===undefined||integer(u.flightSupportReadyRound,100))&&validFlightWake(u)&&
  (u.impactExtraReadyRound===undefined||integer(u.impactExtraReadyRound,100))&&validHealingPenalty(u)&&
  (u.chargeAdvanceReadyRound===undefined||integer(u.chargeAdvanceReadyRound,100))&&
  (u.retaliatoryOmenReadyRound===undefined||integer(u.retaliatoryOmenReadyRound,100))&&validRetaliatoryOmen(u)&&validPortalEcho(u,battle)&&
  (u.entangleReadyRound===undefined||integer(u.entangleReadyRound,100))&&
  (u.fury===undefined||integer(u.fury,100))&&(u.lastFuryBarrierRound===undefined||integer(u.lastFuryBarrierRound,100))&&validPoisonOrigin(u.poisonOrigin)&&validStrikeModifiers(u)&&validStillOmen(u);
}
