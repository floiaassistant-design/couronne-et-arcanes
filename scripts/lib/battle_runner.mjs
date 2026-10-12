// Joueur automatisé fixe pour les audits comparatifs, sans état global ni DOM.
// Ne prédit pas la réussite des joueurs humains.
import {CARDS} from '../../src/data.js';
import {createBattle,playPlayerCard,endPlayerTurn,usePower} from '../../src/engine.js';
import {classSkillTargetError} from '../../src/engine/class-skills.js';
import {controlTargetError,silenceTarget,silenceValue,teleportPlan,teleportGain,trapPlan,activeAbility} from '../../src/engine/battle-control.js';

import {laneCount} from '../../src/engine/board.js';
export function chooseSimulatedMove(b){
 const moves=[];
 for(let i=0;i<b.heroes.p.hand.length;i++){
  const entry=b.heroes.p.hand[i],c=CARDS[entry.id];
  if(!c||entry.wait>0)continue;
  for(let lane=0;lane<laneCount(b);lane++){
   const row=b.board[lane];if(c.type==='unité'&&row[1])continue;
   if(classSkillTargetError(b,'p',c,lane)||controlTargetError(b,'p',c,lane))continue;
   const friends=row.filter(u=>u&&u.side==='p'),foes=row.filter(u=>u&&u.side==='e');
   const threat=foes.reduce((sum,u)=>sum+u.atk+(u.hp>=8?3:0),0);
   const matching=friends.filter(u=>CARDS[u.id]?.faction===c.faction).length;
   let score=c.type==='unité'?4+c.attack*.65+c.hp*.24+threat*.7+Math.min(2,matching)*3:
    c.ability==='spell_storm'?foes.length*(5+threat*.1):
    c.ability==='spell_bolt'?foes.length*4+(foes.length===0&&b.heroes.e.hp<=2?20:0):
    c.ability==='spell_heal'?Math.max(0,b.heroes.p.maxhp-b.heroes.p.hp)*.7+friends.filter(u=>u.hp<u.maxhp).length*2:
    c.ability==='spell_buff'?friends.length*3:
    c.ability==='spell_root'?foes.length*3:
    c.ability==='spell_ward'?Math.max(0,12-b.heroes.p.shield)*.7:0;
   if(c.ability==='spell_silence')score=silenceValue(silenceTarget(b,'p',lane)?.u)*1.3;
   if(c.ability==='spell_teleport')score=teleportGain(b,'p',teleportPlan(b,'p',lane));
   if(c.ability==='spell_trap'){
    const plan=trapPlan(b,'p',lane);
    score=plan&&row.some((u,col)=>u?.side==='e'&&col>plan.col&&u.stun<=0&&col-plan.col<=3*(activeAbility(b,u)==='haste'?2:1))?5+threat*.2:0;
   }
   if(c.heroClass)score=c.ability==='spell_ranger_draw'?5:c.ability==='spell_guard_rally'?friends.length*3:
    c.ability==='spell_cleric_light'?friends.reduce((n,u)=>n+Math.min(3,u.maxhp-u.hp),0):
    ['spell_guard_wall','spell_cleric_bless'].includes(c.ability)?friends.length*2+threat*.2:foes.length*4+threat*.25;
   if((c.heroClass||['spell_silence','spell_teleport','spell_trap'].includes(c.ability))&&score<=0)continue;
   if(lane===1)score+=.15;
   moves.push({i,lane,score});
  }
 }
 moves.sort((a,b)=>b.score-a.score||a.i-b.i||a.lane-b.lane);
 return moves[0]||null;
}
export function simulateBattle(profile,mission,seed,{turnLimit=40,observe,legacy=false}={}){
 const b=createBattle(profile,mission,seed,{legacy});let turns=0,powers=0;
 while(b.status==='active'&&turns<turnLimit){
  if(b.powerCooldown===0){const result=usePower(b);if(result.ok)powers++;}
  for(let i=0;i<2&&b.status==='active';i++){
   const best=chooseSimulatedMove(b);if(!best)break;
   const result=playPlayerCard(b,best.i,best.lane);if(!result.ok)throw Error(result.reason);
  }
  if(b.status==='active')endPlayerTurn(b);
  observe?.(b);
  turns++;
 }
 if(b.status==='active')throw Error(`Simulation inachevée (${mission.id}, ${seed})`);
 return {win:b.status==='victory',powers,turns,hp:b.heroes.p.hp,maxhp:b.heroes.p.maxhp};
}
