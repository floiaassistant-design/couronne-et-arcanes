// Sélection pure partagée par les soins et protections des unités.
import {lastCell} from './board.js';
export function alliedTargets(b,u,lane,parameters){
 const found=[];
 for(let l=0;l<b.board.length;l++){
  if(parameters.scope!=='all-lines'&&l!==lane)continue;
  for(let col=1;col<=lastCell(b);col++){
   const other=b.board[l][col];
   if(other&&other.hp>0&&other.side===u.side&&(parameters.includeSelf||other.uid!==u.uid))found.push({u:other,lane:l,col});
  }
 }
 return found;
}
export const injuryOrder=(x,z)=>x.u.hp/x.u.maxhp-z.u.hp/z.u.maxhp||x.lane-z.lane||x.col-z.col||x.u.uid-z.u.uid;
// Ciblage d'Impact de zone : seulement les ennemis consécutifs derrière la cible.
// La case de la cible principale reste la référence même si elle vient de mourir.
export function splashSecondaryTargets(b,lane,attackerCol,primaryCol,attackerSide,maxTargets=1){
 const dir=attackerSide==='p'?1:-1;
 if((primaryCol-attackerCol)*dir<=0)return [];
 const result=[];
 for(let distance=1;distance<=maxTargets;distance++){
  const col=primaryCol+dir*distance;
  if(col<1||col>lastCell(b))break;
  const u=b.board[lane]?.[col];
  if(!u||u.hp<=0||u.side===attackerSide)break;
  result.push({u,col});
 }
 return result;
}
