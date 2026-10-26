// Éligibilité de la Garde future ; aucun choix implicite entre plusieurs gardiens.
import {laneCount,lastCell,validLane} from './board.js';
import {versionUnitAbilities} from '../cards/definitions.js';

export function crownGuardCandidates(b,attackLane,heroSide,attackerCol){
 if(!validLane(b,attackLane)||!Number.isInteger(attackerCol)||attackerCol<1||attackerCol>lastCell(b))return [];
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
