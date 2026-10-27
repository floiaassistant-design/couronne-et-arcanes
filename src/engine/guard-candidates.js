// Protection des couronnes : éligibilité et priorité validées, sans mutation.
import {laneCount,lastCell,validLane,crownColumn} from './board.js';
import {versionUnitAbilities} from '../cards/definitions.js';
import {GUARD_IDS} from '../data.js';
import {FUTURE_GUARD_POLICY} from '../cards/abilities.js';

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

// Sans nouvelle version éligible, conserver exactement la priorité historique.
// Dans un combat mêlant les deux systèmes, tous les candidats éligibles suivent
// la priorité validée dès qu'une Garde versionnée entre dans la sélection.
export function findCrownGuardian(b,attackLane,heroSide,attackerCol){
 if(!['p','e'].includes(heroSide)||!validLane(b,attackLane)||!Number.isInteger(attackerCol)||attackerCol<1||attackerCol>lastCell(b))return null;
 const future=crownGuardCandidates(b,attackLane,heroSide,attackerCol);
 const historical=[];
 for(let col=1;col<=lastCell(b);col++){
  const u=b.board[attackLane][col];
  if(u&&u.hp>0&&u.side===heroSide&&GUARD_IDS.has(u.id)&&!versionUnitAbilities(u))historical.push({u,lane:attackLane,col});
 }
 if(!future.length)return historical.sort((a,z)=>heroSide==='p'?z.col-a.col:a.col-z.col)[0]||null;
 const policy=versionUnitAbilities(future[0].u).guard;
 if(policy.priority!==FUTURE_GUARD_POLICY.priority||policy.frequency!==FUTURE_GUARD_POLICY.frequency||policy.maxPerAttack!==1)return null;
 const crown=crownColumn(b,heroSide);
 return [...future,...historical].sort((a,z)=>
  Number(a.lane!==attackLane)-Number(z.lane!==attackLane)||
  Math.abs(a.col-crown)-Math.abs(z.col-crown)||a.lane-z.lane||a.u.uid-z.u.uid)[0]||null;
}
