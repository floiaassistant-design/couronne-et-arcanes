import {versionUnitAbilities} from '../cards/definitions.js';
import {lastCell} from './board.js';
import {activeStrikeState} from './unit-strike-modifiers.js';

export function rememberPortalEcho(b,unit,{fromLane,toLane,col},emit){
 const ability=versionUnitAbilities(unit)?.portalEcho;
 if(!ability||unit.hp<=0)return;
 unit.portalEcho={lane:fromLane,col,expiresRound:b.round+ability.expiresAfter};
 emit(b,{type:'state',side:unit.side,lane:toLane,col});
}

export function findPortalEchoTarget(b,lane,unit){
 const echo=activeStrikeState(unit,'portalEcho',b.round);
 if(!echo||echo.lane===lane)return null;
 const ability=versionUnitAbilities(unit)?.portalEcho;
 if(!ability)return null;
 const col=echo.col+(unit.side==='p'?1:-1)*ability.range;
 if(col<1||col>lastCell(b))return null;
 const target=b.board[echo.lane]?.[col];
 return target&&target.hp>0&&target.side!==unit.side?{type:'unit',target,lane:echo.lane,col,echo:true}:null;
}

export function validPortalEcho(unit,battle){
 const echo=unit.portalEcho;
 return echo===undefined||!!echo&&!!versionUnitAbilities(unit)?.portalEcho&&
  Number.isSafeInteger(echo.lane)&&echo.lane>=0&&echo.lane<(battle?.board.length??4)&&
  Number.isSafeInteger(echo.col)&&echo.col>=1&&echo.col<=(battle?lastCell(battle):10)&&
  Number.isSafeInteger(echo.expiresRound)&&echo.expiresRound>0&&echo.expiresRound<=100;
}
