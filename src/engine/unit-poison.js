// Un seul poison actif comme historiquement ; provenance facultative, sans cumul.
export function applyUnitPoison(target,parameters,source,readyRound){
 if(!target||target.hp<=0&&parameters.sourceBound)return;
 target.poison=parameters.amount;
 target.poisonTurns=parameters.sourceBound?parameters.resolutions:Math.max(target.poisonTurns||0,parameters.resolutions);
 if(parameters.sourceBound){
  target.poisonOrigin={uid:source.uid,side:source.side,...(source.contagion?{contagion:{...source.contagion}}:{}),...(readyRound?{readyRound}:{})};
 }else delete target.poisonOrigin;
}
export function clearUnitPoison(u){u.poison=0;u.poisonTurns=0;delete u.poisonOrigin;}
export function tickUnitPoison(b,u){
 if(!(u.poisonTurns>0)||u.poisonOrigin?.readyRound>b.round)return false;
 u.hp=Math.max(0,u.hp-u.poison);u.poisonTurns--;
 if(u.hp<=0&&u.poisonOrigin)u.poisonOrigin={...u.poisonOrigin,lethal:true};
 else if(!u.poisonTurns)delete u.poisonOrigin;
 return true;
}
// La contagion est attachée au poison déjà appliqué, même si sa source a disparu.
// Consommation au premier décès éligible ; aucune contamination en chaîne.
export function spreadUnitPoison(b,dead,lane,col,emit,readyRound){
 const origin=dead.poisonOrigin,p=origin?.contagion;
 if(!p||!(dead.poisonTurns>0||origin.lethal)||(b.poisonSpreads||[]).includes(origin.uid))return;
 b.poisonSpreads=[...(b.poisonSpreads||[]),origin.uid];
 const target=b.board[lane].map((u,col)=>({u,col})).filter(t=>t.u&&t.u.hp>0&&t.u.side===dead.side)
  .sort((a,z)=>Math.abs(a.col-col)-Math.abs(z.col-col)||a.col-z.col||a.u.uid-z.u.uid)[0];
 if(!target)return;
 applyUnitPoison(target.u,{...p,sourceBound:true},{uid:origin.uid,side:origin.side},readyRound);
 emit(b,{type:'state',side:origin.side,lane,col:target.col});
}
const positive=n=>Number.isSafeInteger(n)&&n>0&&n<=100;
export function validPoisonOrigin(p){
 return p===undefined||!!p&&Number.isSafeInteger(p.uid)&&p.uid>=0&&['p','e'].includes(p.side)&&
  (p.readyRound===undefined||positive(p.readyRound))&&(p.lethal===undefined||typeof p.lethal==='boolean')&&
  (p.contagion===undefined||!!p.contagion&&positive(p.contagion.amount)&&positive(p.contagion.resolutions));
}
export function validPoisonSpreads(ids){return ids===undefined||Array.isArray(ids)&&ids.every(n=>Number.isSafeInteger(n)&&n>=0)&&new Set(ids).size===ids.length;}
