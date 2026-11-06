import {versionUnitAbilities} from '../cards/definitions.js';
import {healUnit} from './unit-healing.js';

export function activeFlightWake(unit,round){
 const wake=unit.flightWake;
 return wake?.expiresRound>=round?wake:null;
}

// Called only after a real flying leap has reached a legal landing cell.
export function resolveFlightSupport(b,source,ally,lane,col,landing,suppressed,emit){
 if(ally.hp<=0||ally.side!==source.side||suppressed||source.flightSupportReadyRound>b.round)return;
 const abilities=versionUnitAbilities(source);
 if(abilities?.flightWake){
  const p=abilities.flightWake;
  ally.flightWake={cells:p.cells,expiresRound:b.round+p.duration,...(p.strike?{strike:p.strike}:{})};
  source.flightSupportReadyRound=b.round+p.period;
  emit(b,{type:'state',side:ally.side,lane,col});
 }else if(abilities?.flightHeal&&ally.hp<ally.maxhp){
  const p=abilities.flightHeal;
  const healed=healUnit(ally,p.amount,b.round);
  source.flightSupportReadyRound=b.round+p.period;
  emit(b,{type:healed?'heal':'state',side:ally.side,lane,col});
  if(healed&&p.selfHeal&&healUnit(source,p.selfHeal,b.round))emit(b,{type:'heal',side:source.side,lane,col:landing});
 }
}

export function expireFlightWake(unit,round){
 if(unit.flightWake?.expiresRound<=round)delete unit.flightWake;
}

export function validFlightWake(unit){
 const wake=unit.flightWake;
 return wake===undefined||!!wake&&wake.cells===1&&(wake.strike===undefined||wake.strike===1)&&Number.isSafeInteger(wake.expiresRound)&&wake.expiresRound>0&&wake.expiresRound<=100;
}
