// Résultats terminaux fictifs : tester la transaction UI, pas l'équilibrage.
import {freshProfile,createBattle,completeBattle,beginDungeon,nextDungeonBattle,settleDungeonBattle} from '../../src/engine.js';
import {CAMPAIGN,towerMission} from '../../src/data.js';
const scenarios=[];
for(const mode of ['campaign','tower','dungeon'])for(const status of ['victory','defeat']){
 const profile=freshProfile();profile.guideSeen=true;
 let battle,mission;
 if(mode==='dungeon'){
  beginDungeon(profile,'ysara');battle=nextDungeonBattle(profile,61031,{turnFlow:'alternating'});
 }else{
  mission=mode==='tower'?towerMission(1):CAMPAIGN[0];
  battle=createBattle(profile,mission,61031,{turnFlow:'alternating'});
 }
 battle.status=status;battle.phase='finished';battle.round=3;
 battle.heroes[status==='victory'?'e':'p'].hp=0;
 battle.settlementId=`audit:${mode}:${status}`;
 const expected=structuredClone(profile),terminal=structuredClone(battle);
 if(mode==='dungeon')settleDungeonBattle(expected,terminal);
 else completeBattle(expected,mission,terminal);
 expected.lastBattleSettlementId=battle.settlementId;
 scenarios.push({mode,status,profile,battle,expected});
}
console.log(JSON.stringify(scenarios));
