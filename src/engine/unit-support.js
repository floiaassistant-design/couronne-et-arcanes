// Soutiens et arrivée du moteur commun ; les capacités viennent du registre.
import {CARDS} from '../data.js';
import {versionUnitAbilities} from '../cards/definitions.js';
import {silenced,activeAbility} from './battle-control.js';
import {lastCell} from './board.js';
import {grantHealBarrier} from './battle-defense.js';

function allies(b,u,lane,parameters){
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
function inspireTargets(b,u,lane,p){return allies(b,u,lane,p).slice(0,p.targets);}
function strengthen(target,p){const before=target.atk;target.atk=Math.max(before,Math.min(p.cap,before+p.amount));return target.atk-before;}

export function resolveUnitArrival(b,u,lane,col,hooks){
 const a=versionUnitAbilities(u);
 if(!a||u.arrivalResolved||!(a.ward||a.arrivalInspire||a.intervention))return;
 u.arrivalResolved=true;
 if(a.ward)b.heroes[u.side].shield=Math.max(b.heroes[u.side].shield,Math.min(a.ward.cap,b.heroes[u.side].shield+a.ward.amount));
 if(a.arrivalInspire)for(const target of inspireTargets(b,u,lane,a.arrivalInspire)){
  if(strengthen(target.u,a.arrivalInspire))hooks.emit(b,{type:'state',side:u.side,lane:target.lane,col:target.col});
 }
 if(a.intervention){
  const p=a.intervention,dir=u.side==='p'?1:-1;
  for(let d=1;d<=p.range;d++){
   const targetCol=col+dir*d;if(targetCol<1||targetCol>lastCell(b))break;
   const target=b.board[lane][targetCol];if(!target||target.hp<=0||target.side===u.side)continue;
   hooks.emit(b,{type:'attack',side:u.side,lane,from:col,to:targetCol,ranged:true,magic:true,arrival:true,damage:p.amount,icon:CARDS[u.id]?.icon});
   hooks.hit(b,target,p.amount,u.side,p.ignoreArmor);break;
  }
 }
}

export function resolveUnitSupport(b,sideFilter,emit){
 for(let lane=0;lane<b.board.length;lane++)for(const u of b.board[lane]){
  if(!u||u.hp<=0||(sideFilter&&u.side!==sideFilter))continue;
  const a=versionUnitAbilities(u);
  if(!a){
   // Repli historique inchangé : une cible, ordre stable du tableau.
   if(activeAbility(b,u)==='heal'){
    const targets=b.board[lane].filter(v=>v&&v.side===u.side&&v.hp<v.maxhp);
    if(targets.length){targets.sort((x,z)=>x.hp/x.maxhp-z.hp/z.maxhp);targets[0].hp=Math.min(targets[0].maxhp,targets[0].hp+2);emit(b,{type:'heal',lane,col:b.board[lane].indexOf(targets[0])});}
   }
   if(activeAbility(b,u)==='inspire'&&b.round%3===0){
    const targets=b.board[lane].filter(v=>v&&v.side===u.side&&v.uid!==u.uid);
    if(targets.length)targets[0].atk=Math.min(targets[0].atk+1,12);
   }
   continue;
  }
  if(silenced(b,u))continue;
  if(a.heal&&u.lastHealRound!==b.round){
   const p=a.heal,targets=allies(b,u,lane,p).filter(t=>t.u.hp<t.u.maxhp)
    .sort((x,z)=>x.u.hp/x.u.maxhp-z.u.hp/z.u.maxhp||x.lane-z.lane||x.col-z.col||x.u.uid-z.u.uid).slice(0,p.targets);
   if(targets.length)u.lastHealRound=b.round;
   for(const t of targets){const before=t.u.hp;t.u.hp=Math.min(t.u.maxhp,before+p.amount);grantHealBarrier(b,u,t.u,t.u.hp-before);emit(b,{type:'heal',side:u.side,lane:t.lane,col:t.col});}
  }
  if(a.inspire&&b.round%a.inspire.period===0&&u.lastInspireRound!==b.round){
   const targets=inspireTargets(b,u,lane,a.inspire);if(targets.length)u.lastInspireRound=b.round;
   for(const t of targets)if(strengthen(t.u,a.inspire))emit(b,{type:'state',side:u.side,lane:t.lane,col:t.col});
  }
 }
}
