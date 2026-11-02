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
