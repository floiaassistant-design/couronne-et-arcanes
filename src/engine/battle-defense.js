// Résolution commune des dégâts et défenses. Aucun DOM, profil ou moteur parallèle.
import {CARDS} from '../data.js';
import {versionUnitAbilities} from '../cards/definitions.js';
import {silenced} from './battle-control.js';
import {recordCombatEvent} from './combat-events.js';
import {consumeAttackPenalty} from './unit-effects.js';

const barrierKeys=['healBarrier','riposteBarrier','arrivalBarrier'];
export function grantAbilityBarrier(u,key,parameters){
 if(!u||u.hp<=0||!barrierKeys.includes(key)||!parameters)return 0;
 const sources={...u.abilityBarriers};
 const remaining=Math.min(sources[key]||0,u.barrier||0);
 const added=Math.max(0,Math.min(parameters.amount,parameters.cap-remaining));
 if(!added)return 0;
 sources[key]=remaining+added;u.abilityBarriers=sources;
 u.barrier=(u.barrier||0)+added;
 return added;
}

export function grantSharedBarrier(u,amount,cap){
 // Le plafond du sort porte sur la barrière totale ; ne jamais effacer un
 // surplus déjà acquis via une autre source ni réattribuer ses points.
 const total=u.barrier||0;u.barrier=Math.max(total,Math.min(cap,total+amount));
}

function absorbBarrier(u,damage){
 const absorbed=Math.min(u.barrier||0,damage);
 if((u.barrier||0)>0)u.barrier-=absorbed;
 if(absorbed&&u.abilityBarriers){
  let left=absorbed;const sources={...u.abilityBarriers};
  // Les barrières de capacités sont consommées avant le reste du bouclier.
  for(const key of barrierKeys){const used=Math.min(sources[key]||0,left);sources[key]=(sources[key]||0)-used;left-=used;}
  u.abilityBarriers=sources;
 }
 return absorbed;
}

export function hit(b,u,raw,bySide,ignoreArmor=false){
 if(!u||u.hp<=0)return 0; // Une victime ne compte jamais deux fois.
 const abilities=versionUnitAbilities(u);
 const armor=u.armor??abilities?.armor?.amount??0;
 let dmg=Math.max(1,raw-(ignoreArmor?0:armor));
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
 if(bySide!==u.side&&u.hp<=0)b.stats[bySide==='p'?'playerKills':'enemyKills']++;
 if(Array.isArray(b.vfx)){
  const lane=b.board.findIndex(row=>row.includes(u)),col=lane<0?-1:b.board[lane].indexOf(u);
  recordCombatEvent(b,{type:'damage',side:u.side,lane,col,damage:Math.max(0,before-u.hp),absorbed,armor:ignoreArmor?0:Math.min(raw-1,armor)});
 }
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
 const raw=consumeAttackPenalty(defender,defender.atk+attackBonus);
 const dealt=raw>0?hit(b,attacker,raw,defender.side):0;
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
