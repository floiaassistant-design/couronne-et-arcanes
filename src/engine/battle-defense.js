// Résolution commune des dégâts et défenses. Aucun DOM, profil ou moteur parallèle.
import {CARDS} from '../data.js';
import {versionUnitAbilities} from '../cards/definitions.js';
import {silenced} from './battle-control.js';
import {recordCombatEvent} from './combat-events.js';
import {consumeAttackPenalty} from './unit-effects.js';
import {resolveUnitDeath} from './unit-death.js';
import {resolveSurvivedStrike} from './unit-triggers.js';
import {prepareDirectStrike,grantCalibrationReward} from './unit-strike-modifiers.js';

import {absorbBarrier,grantAbilityBarrier} from './unit-barriers.js';
// Préserver les imports existants des appelants.
export * from './unit-barriers.js';

export function hit(b,u,raw,bySide,ignoreArmor=false,attack=false,direct=null){
 if(!u||u.hp<=0)return 0; // Une victime ne compte jamais deux fois.
 const abilities=versionUnitAbilities(u);
 const baseArmor=u.armor??abilities?.armor?.amount??0;
 const directStrike=attack&&direct?.attacker?prepareDirectStrike(b,direct.attacker,u,raw,baseArmor,ignoreArmor):null;
 const armor=directStrike?.armor??(ignoreArmor?0:baseArmor);
 if(directStrike)raw=directStrike.raw;
 let dmg=Math.max(1,raw-armor);
 const reduction=abilities?.firstHitReduction;
 if(reduction&&!u.firstHitReductionUsed&&bySide!==u.side){
  u.firstHitReductionUsed=true;dmg=Math.max(0,dmg-reduction.amount);
 }
 const absorbed=absorbBarrier(u,dmg);dmg-=absorbed;
 const before=u.hp;u.hp=Math.max(0,u.hp-dmg);
 // « Coup mortel » : les dégâts directs passent ici ; le poison garde sa résolution historique.
 if(u.hp<=0&&abilities?.lastStand&&!u.lastStandUsed&&!silenced(b,{...u,hp:before})){
  u.lastStandUsed=true;u.hp=Math.min(u.maxhp,abilities.lastStand.hp);
 }
 if(attack&&bySide!==u.side&&before>u.hp&&u.hp>0&&abilities?.fury&&!silenced(b,u))u.fury=abilities.fury.amount;
 if(bySide!==u.side&&u.hp<=0)b.stats[bySide==='p'?'playerKills':'enemyKills']++;
 if(Array.isArray(b.vfx)){
  const lane=b.board.findIndex(row=>row.includes(u)),col=lane<0?-1:b.board[lane].indexOf(u);
  recordCombatEvent(b,{type:'damage',side:u.side,lane,col,damage:Math.max(0,before-u.hp),absorbed,armor:ignoreArmor?0:Math.min(raw-1,armor)});
 }
 if(u.hp<=0){const lane=b.board.findIndex(row=>row.includes(u));if(lane>=0)resolveUnitDeath(b,u,lane,b.board[lane].indexOf(u),recordCombatEvent);}
 if(attack&&direct?.attacker)resolveSurvivedStrike(b,u,direct.attacker,before>u.hp,silenced(b,u),recordCombatEvent);
 const deathStrike=abilities?.deathStrike,attacker=direct?.attacker;
 if(u.hp<=0&&deathStrike&&!u.deathStrikeUsed&&attack&&direct?.sameLine&&attacker?.hp>0&&attacker.side!==u.side&&
    Math.abs(direct.from-direct.to)<=deathStrike.range&&!silenced(b,{...u,hp:before})){
  u.deathStrikeUsed=true;
  // Dégât secondaire : ne crée ni nouvelle attaque ni chaîne de Fracas.
  hit(b,attacker,deathStrike.amount,u.side);
  if(attacker.hp>0&&deathStrike.entangle)attacker.movementRoot=1;
 }
 if(directStrike)grantCalibrationReward(b,direct.attacker,directStrike.calibration,before>u.hp,recordCombatEvent);
 return dmg;
}

export function resolveRetaliation(b,defender,attacker,lane,defenderCol,attackerCol,attackBonus=0,note=()=>{}){
 const abilities=versionUnitAbilities(defender),riposte=abilities?.riposte;
 const eligible=!!riposte;
 const spent=riposte?.frequency==='invocation'?defender.riposteUsed:defender.lastRiposteRound===b.round;
 if(!eligible||spent||silenced(b,defender)||defender.hp<=0||attacker.hp<=0||attacker.ranged||
    defender.side===attacker.side||Math.abs(defenderCol-attackerCol)!==1)return false;
 if(riposte?.frequency==='invocation')defender.riposteUsed=true;
 else defender.lastRiposteRound=b.round;
 recordCombatEvent(b,{type:'attack',side:defender.side,lane,from:defenderCol,to:attackerCol,ranged:false,magic:false,riposte:true,icon:'↶'});
 const raw=consumeAttackPenalty(defender,defender.atk+attackBonus,b.round);
 const dealt=raw>0?hit(b,attacker,raw,defender.side,false,true,{attacker:defender,from:defenderCol,to:attackerCol,sameLine:true}):0;
 if(dealt>0)note(b,`Riposte de ${CARDS[defender.id]?.name||'la créature'} : ${dealt} dégât(s).`);
 if(abilities?.riposteBarrier)grantAbilityBarrier(defender,'riposteBarrier',abilities.riposteBarrier);
 return true;
}

// Raccordé au soin multi-cible à l'étape 4 ; aucun gain pour un soin nul ou une autre cible.
export function grantHealBarrier(b,healer,target,healed){
 const parameters=versionUnitAbilities(healer)?.healBarrier;
 if(!parameters||healed<=0||healer.hp<=0||target?.side!==healer.side||silenced(b,healer))return 0;
 return grantAbilityBarrier(target,'healBarrier',parameters);
}
