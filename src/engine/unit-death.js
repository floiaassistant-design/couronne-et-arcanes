// Réactions à la destruction, avant les dégâts suivants ; repli du balayage sans doublon.
import {versionUnitAbilities} from '../cards/definitions.js';
import {spreadUnitPoison} from './unit-poison.js';
import {alliedTargets} from './unit-targets.js';
import {grantAbilityBarrier,grantCrownShield} from './unit-barriers.js';
import {silenced} from './battle-control.js';
export function resolveUnitDeath(b,u,lane,col,emit,poisonReadyRound){
 const p=versionUnitAbilities(u)?.deathWard;
 if(u.hp>0||u.deathResolved)return;
 const watchers=alliedTargets(b,u,lane,{includeSelf:false})
  .map(t=>({...t,p:versionUnitAbilities(t.u)?.funeralWatch})).filter(t=>t.p);
 if(!(p||u.poisonOrigin?.contagion||watchers.length))return;
 u.deathResolved=true;
 if(p&&!(u.silenceUntil>=b.round)){
  grantCrownShield(b.heroes[u.side],p);
 }
 for(const t of watchers){
  if(silenced(b,t.u)||t.u.lastFuneralWatchRound===b.round)continue;
  t.u.lastFuneralWatchRound=b.round;
  if(grantAbilityBarrier(t.u,'funeralBarrier',t.p))emit(b,{type:'state',side:u.side,lane:t.lane,col:t.col});
 }
 spreadUnitPoison(b,u,lane,col,emit,poisonReadyRound);
}
