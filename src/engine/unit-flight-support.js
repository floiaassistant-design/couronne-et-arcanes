import {versionUnitAbilities} from '../cards/definitions.js';

export function activeFlightWake(unit,round){
 const wake=unit.flightWake;
 return wake?.expiresRound>=round?wake:null;
}

// Called only after a real flying leap has reached a legal landing cell.
export function resolveFlightSupport(b,source,ally,lane,col,suppressed,emit){
 if(ally.hp<=0||ally.side!==source.side||suppressed||source.flightSupportReadyRound>b.round)return;
 const abilities=versionUnitAbilities(source);
 if(abilities?.flightWake){
  const p=abilities.flightWake;
  ally.flightWake={cells:p.cells,expiresRound:b.round+p.duration};
  source.flightSupportReadyRound=b.round+p.period;
  emit(b,{type:'state',side:ally.side,lane,col});
 }else if(abilities?.flightHeal&&ally.hp<ally.maxhp){
  const p=abilities.flightHeal;
  ally.hp=Math.min(ally.maxhp,ally.hp+p.amount);
  source.flightSupportReadyRound=b.round+p.period;
  emit(b,{type:'heal',side:ally.side,lane,col});
 }
}

export function expireFlightWake(unit,round){
 if(unit.flightWake?.expiresRound<=round)delete unit.flightWake;
}

export function validFlightWake(unit){
 const wake=unit.flightWake;
 return wake===undefined||!!wake&&wake.cells===1&&Number.isSafeInteger(wake.expiresRound)&&wake.expiresRound>0&&wake.expiresRound<=100;
}
