// Réactions à la destruction, avant les dégâts suivants ; repli du balayage sans doublon.
import {versionUnitAbilities} from '../cards/definitions.js';
import {spreadUnitPoison} from './unit-poison.js';
export function resolveUnitDeath(b,u,lane,col,emit,poisonReadyRound){
 const p=versionUnitAbilities(u)?.deathWard;
 if(u.hp>0||u.deathResolved||!(p||u.poisonOrigin?.contagion))return;
 u.deathResolved=true;
 if(p&&!(u.silenceUntil>=b.round)){
  const h=b.heroes[u.side];h.shield=Math.max(h.shield,Math.min(p.cap,h.shield+p.amount));
 }
 spreadUnitPoison(b,u,lane,col,emit,poisonReadyRound);
}
