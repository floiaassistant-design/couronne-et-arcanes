// Présages différés : état métier attaché à la victime, sans DOM ni dégâts recopiés.
import {versionUnitAbilities} from '../cards/definitions.js';
import {activeStrikeState} from './unit-strike-modifiers.js';
import {grantAbilityBarrier} from './unit-barriers.js';

function placeOmen(b,source,target,key,readyKey,parameters,timing,{performed,damaged,suppressed},emit){
 if(!performed||!damaged||suppressed||source.hp<=0||!target||target.hp<=0||target.side===source.side||source[readyKey]>b.round)return false;
 // Un seul présage actif par invocation et par victime ; remplacer, jamais cumuler.
 for(const row of b.board)for(const u of row)if(u?.[key]?.sourceUid===source.uid)delete u[key];
 target[key]={sourceUid:source.uid,side:source.side,amount:parameters.amount,...timing};
 source[readyKey]=b.round+parameters.period;
 const lane=b.board.findIndex(row=>row.includes(target));
 if(lane>=0)emit(b,{type:'state',side:target.side,lane,col:b.board[lane].indexOf(target),[key]:true});
 return true;
}

export function placeStillOmen(b,source,target,result,emit){
 const p=versionUnitAbilities(source)?.stillOmen;
 return !!p&&placeOmen(b,source,target,'stillOmen','stillOmenReadyRound',p,{dueRound:b.round+p.delay},result,emit);
}

export function placeRetaliatoryOmen(b,source,target,result,emit){
 const p=versionUnitAbilities(source)?.retaliatoryOmen;
 return !!p&&placeOmen(b,source,target,'retaliatoryOmen','retaliatoryOmenReadyRound',p,{expiresRound:b.round+p.expiresAfter},result,emit);
}

export function resolveRetaliatoryOmen(b,unit,performed,hit){
 const omen=activeStrikeState(unit,'retaliatoryOmen',b.round);
 if(!performed||!omen)return;
 delete unit.retaliatoryOmen;
 if(unit.hp>0)hit(b,unit,omen.amount,omen.side);
}

// Appelé uniquement après une véritable entrée de case : bloqué/immobilisé ne compte pas.
export function noteOmenMovement(b,u){
 if(u.stillOmen?.dueRound===b.round)delete u.stillOmen;
}

function grantStillOmenBarrier(b,omen,emit){
 for(const [lane,row] of b.board.entries()){
  const col=row.findIndex(u=>u?.uid===omen.sourceUid&&u.side===omen.side&&u.hp>0);
  if(col<0)continue;
  const source=row[col],parameters=versionUnitAbilities(source)?.stillOmen?.barrier;
  if(grantAbilityBarrier(source,'stillOmenBarrier',parameters))emit?.(b,{type:'state',side:source.side,lane,col});
  return;
 }
}

// Fin du tour de combat complet, après les actions des deux camps, avant son incrément.
export function resolveStillOmens(b,hit,emit){
 let resolved=false;
 for(const row of b.board)for(const u of row){
  const p=u?.stillOmen;
  if(!p||p.dueRound>b.round)continue;
  delete u.stillOmen;
  resolved=true;
  if(u.hp<=0)continue;
  const before=u.hp;hit(b,u,p.amount,p.side);
  if(u.hp<before)grantStillOmenBarrier(b,p,emit);
 }
 return resolved;
}

const integer=(n,max)=>Number.isSafeInteger(n)&&n>0&&n<=max;
function validOmen(p,unit,timing){
 return p===undefined||!!(p&&typeof p==='object'&&!Array.isArray(p)&&integer(p.sourceUid,1e9)&&
  ['p','e'].includes(p.side)&&p.side!==unit.side&&integer(p.amount,100)&&integer(p[timing],100));
}
export function validStillOmen(unit){
 const barrier=unit.abilityBarriers?.stillOmenBarrier;
 return validOmen(unit.stillOmen,unit,'dueRound')&&
  (barrier===undefined||barrier===0||barrier===1&&Number.isSafeInteger(unit.barrier)&&unit.barrier>=1);
}
export const validRetaliatoryOmen=unit=>validOmen(unit.retaliatoryOmen,unit,'expiresRound');
