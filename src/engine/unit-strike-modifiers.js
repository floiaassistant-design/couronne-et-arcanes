// États consommés par une attaque directe ; ni DOM ni règles de dégâts copiées.
import {versionUnitAbilities} from '../cards/definitions.js';
import {grantAbilityBarrier} from './unit-barriers.js';

const keys=['armorPenalty','temporaryArmor','calibration','spotMark'];
export const activeStrikeState=(u,key,round)=>u?.[key]?.expiresRound>=round?u[key]:null;
function timedArmor(target,key,p,round){
 const old=activeStrikeState(target,key,round);
 if(target.hp<=0||old?.amount>p.amount)return false;
 target[key]={amount:p.amount,expiresRound:round+p.expiresAfter};return true;
}
export function grantSupportStrikeState(target,abilities,round){
 let changed=false;
 if(abilities.inspireArmor)changed=timedArmor(target,'temporaryArmor',abilities.inspireArmor,round)||changed;
 const p=abilities.calibration,old=activeStrikeState(target,'calibration',round);
 if(p&&!(old?.ignoreArmor>p.ignoreArmor)&&target.hp>0){
  target.calibration={ignoreArmor:p.ignoreArmor,expiresRound:round+p.expiresAfter,
   ...(p.barrier?{barrier:{...p.barrier}}:old?.barrier&&old.ignoreArmor===p.ignoreArmor?{barrier:{...old.barrier}}:{})};
  changed=true;
 }
 return changed;
}
export function applyStrikeFracture(b,source,target,damaged,secondary,suppressed,emit){
 const p=versionUnitAbilities(source)?.fracture;
 if(!p||suppressed||!damaged||!target||target.side===source.side||!secondary&&!p.primary)return false;
 if(!timedArmor(target,'armorPenalty',p,b.round))return false;
 const lane=b.board.findIndex(row=>row.includes(target));
 if(lane>=0)emit(b,{type:'state',side:target.side,lane,col:b.board[lane].indexOf(target)});
 return true;
}
export function placeSpotMark(b,source,target,p,emit){
 if(!target||target.hp<=0||target.side===source.side)return false;
 // Une seule cible par Canon, une seule marque sur une cible ; remplacement.
 for(const row of b.board)for(const u of row)if(u?.spotMark?.sourceUid===source.uid)delete u.spotMark;
 target.spotMark={sourceUid:source.uid,side:source.side,amount:p.amount,remaining:p.attacks,expiresRound:b.round+p.expiresAfter};
 const lane=b.board.findIndex(row=>row.includes(target));
 if(lane>=0)emit(b,{type:'state',side:target.side,lane,col:b.board[lane].indexOf(target)});
 return true;
}
export function prepareDirectStrike(b,attacker,target,raw,baseArmor,ignoreArmor){
 if(raw<=0||!attacker||attacker.side===target.side)return {raw,armor:ignoreArmor?0:baseArmor,calibration:null};
 const penalty=activeStrikeState(target,'armorPenalty',b.round),protection=activeStrikeState(target,'temporaryArmor',b.round);
 const calibration=activeStrikeState(attacker,'calibration',b.round),mark=activeStrikeState(target,'spotMark',b.round);
 delete target.armorPenalty;delete target.temporaryArmor;
 if(calibration)delete attacker.calibration;
 if(mark&&mark.side===attacker.side&&mark.sourceUid!==attacker.uid){
  raw+=mark.amount;
  if(mark.remaining<=1)delete target.spotMark;else target.spotMark={...mark,remaining:mark.remaining-1};
 }
 return {raw,armor:ignoreArmor?0:Math.max(0,baseArmor+(protection?.amount||0)-(penalty?.amount||0)-(calibration?.ignoreArmor||0)),calibration};
}
export function grantCalibrationReward(b,attacker,calibration,damaged,emit){
 if(!calibration?.barrier||!damaged||!attacker||attacker.hp<=0)return;
 if(grantAbilityBarrier(attacker,'calibrationBarrier',calibration.barrier)){
  const lane=b.board.findIndex(row=>row.includes(attacker));
  if(lane>=0)emit(b,{type:'state',side:attacker.side,lane,col:b.board[lane].indexOf(attacker)});
 }
}
export function expireStrikeModifiers(b){
 for(const row of b.board)for(const u of row)if(u)for(const key of keys)if(u[key]?.expiresRound<=b.round)delete u[key];
}
const positive=n=>Number.isSafeInteger(n)&&n>0&&n<=100;
export function validStrikeModifiers(u){
 const timed=p=>p===undefined||!!p&&positive(p.amount)&&positive(p.expiresRound);
 const c=u.calibration,m=u.spotMark;
 return timed(u.armorPenalty)&&timed(u.temporaryArmor)&&
  (c===undefined||!!c&&positive(c.ignoreArmor)&&positive(c.expiresRound)&&
   (c.barrier===undefined||!!c.barrier&&positive(c.barrier.amount)&&positive(c.barrier.cap)))&&
  (m===undefined||!!m&&Number.isSafeInteger(m.sourceUid)&&m.sourceUid>=0&&['p','e'].includes(m.side)&&
   positive(m.amount)&&Number.isSafeInteger(m.remaining)&&m.remaining>=1&&m.remaining<=2&&positive(m.expiresRound));
}
