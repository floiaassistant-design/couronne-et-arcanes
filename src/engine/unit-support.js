// Soutiens et arrivée du moteur commun ; les capacités viennent du registre.
import {CARDS} from '../data.js';
import {versionUnitAbilities} from '../cards/definitions.js';
import {silenced} from './battle-control.js';
import {lastCell} from './board.js';
import {grantHealBarrier,grantAbilityBarrier} from './battle-defense.js';
import {grantRegeneration} from './unit-effects.js';
import {alliedTargets as allies,injuryOrder} from './unit-targets.js';
import {clearUnitPoison} from './unit-poison.js';
function inspireTargets(b,u,lane,p){return allies(b,u,lane,p).slice(0,p.targets);}
function strengthen(target,p){const before=target.atk;target.atk=Math.max(before,Math.min(p.cap,before+p.amount));return target.atk-before;}

export function resolveUnitArrival(b,u,lane,col,hooks){
 const a=versionUnitAbilities(u);
 if(!a||u.arrivalResolved||!(a.ward||a.arrivalInspire||a.intervention||a.arrivalBarrier))return;
 u.arrivalResolved=true;
 if(a.ward)b.heroes[u.side].shield=Math.max(b.heroes[u.side].shield,Math.min(a.ward.cap,b.heroes[u.side].shield+a.ward.amount));
 if(a.arrivalBarrier)for(const t of allies(b,u,lane,a.arrivalBarrier).sort(injuryOrder).slice(0,a.arrivalBarrier.targets)){
  if(grantAbilityBarrier(t.u,'arrivalBarrier',a.arrivalBarrier))hooks.emit(b,{type:'state',side:u.side,lane:t.lane,col:t.col});
 }
 if(a.arrivalInspire)for(const target of inspireTargets(b,u,lane,a.arrivalInspire)){
  if(strengthen(target.u,a.arrivalInspire))hooks.emit(b,{type:'state',side:u.side,lane:target.lane,col:target.col});
 }
 if(a.intervention){
  const p=a.intervention,dir=u.side==='p'?1:-1;
  for(let d=1;d<=p.range;d++){
   const targetCol=col+dir*d;if(targetCol<1||targetCol>lastCell(b))break;
   const target=b.board[lane][targetCol];if(!target||target.hp<=0||target.side===u.side)continue;
   hooks.emit(b,{type:'attack',side:u.side,lane,from:col,to:targetCol,ranged:true,magic:true,arrival:true,damage:p.amount,icon:CARDS[u.id]?.icon});
   hooks.hit(b,target,p.amount,u.side,p.ignoreArmor);break;
  }
 }
}

export function resolveUnitSupport(b,sideFilter,emit){
 for(let lane=0;lane<b.board.length;lane++)for(const u of b.board[lane]){
  if(!u||u.hp<=0||(sideFilter&&u.side!==sideFilter))continue;
  const a=versionUnitAbilities(u);
  if(silenced(b,u))continue;
  if(a.heal&&u.lastHealRound!==b.round){
   const p=a.heal,targets=allies(b,u,lane,p).filter(t=>t.u.hp<t.u.maxhp)
    .sort(injuryOrder).slice(0,p.targets);
   if(targets.length)u.lastHealRound=b.round;
   for(const t of targets){const before=t.u.hp;t.u.hp=Math.min(t.u.maxhp,before+p.amount);grantHealBarrier(b,u,t.u,t.u.hp-before);
    if(t.u.hp>before){
     if(a.regeneration)grantRegeneration(b,t.u,a.regeneration);
     if(a.purify?.poison)clearUnitPoison(t.u);
     if(a.purify?.movement)delete t.u.movementRoot;
    }
    emit(b,{type:'heal',side:u.side,lane:t.lane,col:t.col});}
  }
  if(a.inspire&&b.round%a.inspire.period===0&&u.lastInspireRound!==b.round){
   const targets=inspireTargets(b,u,lane,a.inspire);if(targets.length)u.lastInspireRound=b.round;
   for(const t of targets)if(strengthen(t.u,a.inspire))emit(b,{type:'state',side:u.side,lane:t.lane,col:t.col});
  }
 }
}
