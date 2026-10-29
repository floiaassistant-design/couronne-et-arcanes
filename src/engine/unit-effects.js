// États temporaires communs aux unités ; jamais de modification permanente d'ATQ.
import {versionUnitAbilities} from '../cards/definitions.js';

export function attackAfterPenalty(u,raw){return u.attackPenalty?Math.max(0,raw-u.attackPenalty.amount):raw;}
export function consumeAttackPenalty(u,raw){
 const result=attackAfterPenalty(u,raw),p=u.attackPenalty;
 if(p){if(p.remaining<=1)delete u.attackPenalty;else u.attackPenalty={...p,remaining:p.remaining-1};}
 return result;
}
export function applyAttackEffects(source,target,suppressed=false){
 if(suppressed||!target||target.side===source.side)return;
 const a=versionUnitAbilities(source);
 if(a?.poison&&source.ability==='poison'){
  target.poison=a.poison.amount;target.poisonTurns=Math.max(target.poisonTurns||0,a.poison.resolutions);
 }
 if(a?.harass&&target.hp>0)target.attackPenalty={amount:a.harass.amount,remaining:a.harass.attacks};
}
export function grantRegeneration(b,target,parameters){
 target.regeneration={amount:parameters.amount,remaining:parameters.resolutions,readyRound:b.round+1};
}
// Une fois au prochain tour de son camp, avant les nouveaux soins/applications.
export function resolveRegeneration(b,sideFilter,emit){
 for(let lane=0;lane<b.board.length;lane++)for(let col=1;col<b.board[lane].length-1;col++){
  const u=b.board[lane][col],p=u?.regeneration;
  if(!p||u.hp<=0||(sideFilter&&u.side!==sideFilter)||b.round<p.readyRound)continue;
  if(p.remaining<=1)delete u.regeneration;
  else u.regeneration={...p,remaining:p.remaining-1,readyRound:b.round+1};
  const before=u.hp;u.hp=Math.min(u.maxhp,u.hp+p.amount);
  if(u.hp>before)emit(b,{type:'heal',side:u.side,lane,col,regeneration:true});
 }
}
const integer=(n,max)=>Number.isSafeInteger(n)&&n>0&&n<=max;
export function validUnitEffects(u){
 const p=u.attackPenalty,r=u.regeneration;
 return (p===undefined||p&&integer(p.amount,100)&&integer(p.remaining,10))&&
  (r===undefined||r&&integer(r.amount,100)&&integer(r.remaining,10)&&integer(r.readyRound,100));
}
