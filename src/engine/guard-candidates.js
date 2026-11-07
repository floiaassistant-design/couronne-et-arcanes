// Protection des couronnes : éligibilité et priorité validées, sans mutation.
import {laneCount,lastCell,validLane,crownColumn} from './board.js';
import {versionUnitAbilities} from '../cards/definitions.js';
import {unitAttackRange} from './unit-rules.js';
import {hasClearAttackLine} from './unit-targets.js';

export function crownGuardCandidates(b,attackLane,heroSide,attackerCol){
 if(!['p','e'].includes(heroSide)||!validLane(b,attackLane)||!Number.isInteger(attackerCol)||attackerCol<1||attackerCol>lastCell(b))return [];
 const guards=[];
 for(let lane=0;lane<laneCount(b);lane++)for(let col=1;col<=lastCell(b);col++){
  const u=b.board[lane][col],guard=versionUnitAbilities(u)?.guard;
  if(!guard||u.hp<=0||u.side!==heroSide||guard.target!=='own-crown')continue;
  const sameLine=lane===attackLane;
  const between=heroSide==='p'?col<attackerCol:col>attackerCol;
  if(guard.scope==='all-lines'||sameLine&&(guard.scope==='line'||guard.scope==='positioned'&&between))guards.push({u,lane,col});
 }
 return guards;
}

// Un seul choix, même ligne puis proximité de sa couronne ; aucune limite par tour.
export function findCrownGuardian(b,attackLane,heroSide,attackerCol){
 const guards=crownGuardCandidates(b,attackLane,heroSide,attackerCol);
 const crown=crownColumn(b,heroSide);
 return guards.sort((a,z)=>
  Number(a.lane!==attackLane)-Number(z.lane!==attackLane)||
  Math.abs(a.col-crown)-Math.abs(z.col-crown)||a.lane-z.lane||a.u.uid-z.u.uid)[0]||null;
}

// Proposition explicite pour Cœur runique : sans le gardien effectivement
// ciblé, cette même attaque atteindrait la couronne, pas une autre unité.
// Ce constat ne redirige aucune attaque et ne change pas les priorités de Garde.
export function isInterposedCrownGuardian(b,lane,attackerCol,attacker,guardian){
 if(!attacker||!['p','e'].includes(attacker.side)||!guardian||guardian.hp<=0||guardian.side===attacker.side||!validLane(b,lane))return false;
 const crown=crownColumn(b,guardian.side),distance=Math.abs(crown-attackerCol),range=unitAttackRange(attacker);
 if(distance>range||findCrownGuardian(b,lane,guardian.side,attackerCol)?.u!==guardian||
  !hasClearAttackLine(b,lane,attackerCol,crown,attacker,guardian))return false;
 const dir=attacker.side==='p'?1:-1;
 let found=false;
 for(let step=1;step<=range;step++){
  const other=b.board[lane][attackerCol+step*dir];
  if(!other||other.hp<=0||other.side===attacker.side)continue;
  if(other!==guardian)return false;
  found=true;
 }
 return found;
}
