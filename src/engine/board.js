// Géométrie partagée : le tableau sauvegardé est la source des dimensions.
// Les couronnes sont des sentinelles hors des cases jouables (colonnes 0 et N+1).
export const LANES=2;
export const WIDTH=12;
export const laneCount=b=>b.board.length;
export const lastCell=b=>b.board[0].length-2;
export const crownColumn=(b,side)=>side==='p'?0:lastCell(b)+1;
export const entryColumn=(b,side)=>side==='p'?1:lastCell(b);
export const validLane=(b,lane)=>Number.isInteger(lane)&&lane>=0&&lane<laneCount(b);
export function missionLayout(mission,{legacy=false}={}){
 if(legacy)return {lanes:3,cells:5};
 return {lanes:mission.boss?4:mission.difficulty>=3?3:2,cells:10};
}
export function trapColumns(b,side){
 const middle=side==='p'?Math.floor((lastCell(b)+1)/2):Math.ceil((lastCell(b)+1)/2);
 const dir=side==='p'?1:-1;
 return [middle,middle-dir,middle+dir];
}
export function supportedBoard(board){
 if(!Array.isArray(board))return false;
 const width=board[0]?.length;
 return ((board.length===3&&width===7)||(board.length>=2&&board.length<=4&&width===12))&&
  board.every(row=>Array.isArray(row)&&row.length===width&&row[0]===null&&row[width-1]===null);
}
