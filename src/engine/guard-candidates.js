// Protection des couronnes : éligibilité et priorité validées, sans mutation.
import {laneCount,lastCell,validLane,crownColumn} from './board.js';
import {versionUnitAbilities} from '../cards/definitions.js';

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
