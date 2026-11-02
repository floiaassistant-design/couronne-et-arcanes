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

// Cibles secondaires de l'Impact : une chaîne contiguë dans le sens de frappe.
// La première case vide, alliée ou hors plateau termine la chaîne ; pas de saut.
export function contiguousSplashTargets(b,lane,sourceCol,primaryCol,side,count=1){
 const row=b.board[lane],dir=side==='p'?1:-1;
 if(!row||!Number.isInteger(sourceCol)||!Number.isInteger(primaryCol)||
    (primaryCol-sourceCol)*dir<=0||!Number.isSafeInteger(count)||count<1)return [];
 const targets=[];
 for(let n=1;n<=count;n++){
  const col=primaryCol+n*dir;
  if(col<1||col>lastCell(b))break;
  const u=row[col];
  if(!u||u.hp<=0||u.side===side)break;
  targets.push({u,col});
 }
 return targets;
}
