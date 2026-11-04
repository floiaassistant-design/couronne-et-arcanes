// Présages différés : état métier attaché à la victime, sans DOM ni dégâts recopiés.
import {versionUnitAbilities} from '../cards/definitions.js';

export function placeStillOmen(b,source,target,{performed,damaged,suppressed},emit){
 const p=versionUnitAbilities(source)?.stillOmen;
 if(!p||!performed||!damaged||suppressed||source.hp<=0||!target||target.hp<=0||target.side===source.side||source.stillOmenReadyRound>b.round)return false;
 // Un seul présage actif par invocation et par victime ; remplacer, jamais cumuler.
 for(const row of b.board)for(const u of row)if(u?.stillOmen?.sourceUid===source.uid)delete u.stillOmen;
 target.stillOmen={sourceUid:source.uid,side:source.side,amount:p.amount,dueRound:b.round+p.delay};
 source.stillOmenReadyRound=b.round+p.period;
 const lane=b.board.findIndex(row=>row.includes(target));
 if(lane>=0)emit(b,{type:'state',side:target.side,lane,col:b.board[lane].indexOf(target),stillOmen:true});
 return true;
}

// Appelé uniquement après une véritable entrée de case : bloqué/immobilisé ne compte pas.
export function noteOmenMovement(b,u){
 if(u.stillOmen?.dueRound===b.round)delete u.stillOmen;
}

// Fin du tour de combat complet, après les actions des deux camps, avant son incrément.
export function resolveStillOmens(b,hit){
 let resolved=false;
 for(const row of b.board)for(const u of row){
  const p=u?.stillOmen;
  if(!p||p.dueRound>b.round)continue;
  delete u.stillOmen;
  resolved=true;
  if(u.hp>0)hit(b,u,p.amount,p.side);
 }
 return resolved;
}

const integer=(n,max)=>Number.isSafeInteger(n)&&n>0&&n<=max;
export function validStillOmen(u){
 const p=u.stillOmen;
 return p===undefined||!!(p&&typeof p==='object'&&!Array.isArray(p)&&integer(p.sourceUid,1e9)&&
  ['p','e'].includes(p.side)&&p.side!==u.side&&integer(p.amount,100)&&integer(p.dueRound,100));
}
