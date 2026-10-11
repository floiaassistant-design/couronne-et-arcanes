// Comparative deterministic talent simulations: paired scenarios/seeds, same deck and bot.
// Not an estimate of human-player win rates; run npm run talent-balance.
import {CAMPAIGN,towerMission} from '../src/data.js';
import {DUNGEONS,dungeonStageMission} from '../src/dungeons.js';
import {TALENT_TREE} from '../src/talents.js';
import {freshProfile,HERO_LEVEL_THRESHOLD,chooseHeroTalent} from '../src/engine.js';
import {simulateBattle} from './lib/battle_runner.mjs';
const seeds=Number(process.env.TALENT_SEEDS||16);
const missions=[...CAMPAIGN.filter((_,i)=>[0,1,2,3,4,6,7,9,10,11].includes(i)),towerMission(4),towerMission(9),dungeonStageMission(DUNGEONS[0].id,1),dungeonStageMission(DUNGEONS[2].id,1)];
function createProfile(hero,talents){
 const p=freshProfile();p.heroClass=hero;p.heroXp=HERO_LEVEL_THRESHOLD(8);
 p.buildings={bastion:1,forge:1,bibliotheque:0};p.reputation.aube=8;p.reputation.sylve=8;
 p.upgrades={militia:1,shield:1,ranger:1};
 for(const id of talents){const result=chooseHeroTalent(p,id);if(!result.ok)throw Error(result.reason);}
 return p;
}
function run(p,mission,seed){const r=simulateBattle(p,mission,seed,{turnLimit:40});return {win:Number(r.win),powers:r.powers,turns:r.turns,hp:r.hp/r.maxhp};}
const summary={method:'paired deterministic seeds, fixed scripted bot, non-human benchmark',seedCount:seeds,encounters:missions.length,perVariant:seeds*missions.length,classes:{}};
for(const [hero,list] of Object.entries(TALENT_TREE)){
 const tier1=list.filter(t=>t.tier===1).map(t=>t.id),tier2=list.filter(t=>t.tier===2).map(t=>t.id);
 const variants=[[],...list.map(t=>[t.id]),...tier1.flatMap(a=>tier2.map(b=>[a,b]))];
 summary.classes[hero]=[];
 for(const talents of variants){const p=createProfile(hero,talents);const metrics={wins:0,powers:0,turns:0,hp:0};
  for(const m of missions)for(let k=0;k<seeds;k++){
   const r=run(p,m,50001+k*2711);metrics.wins+=r.win;metrics.powers+=r.powers;metrics.turns+=r.turns;metrics.hp+=r.hp;
  }
  const n=seeds*missions.length;
  summary.classes[hero].push({talents,winPct:Number((100*metrics.wins/n).toFixed(1)),avgPowers:Number((metrics.powers/n).toFixed(1)),avgTurns:Number((metrics.turns/n).toFixed(1)),avgRemainingHpPct:Number((100*metrics.hp/n).toFixed(1))});
 }
}
console.log(JSON.stringify(summary,null,2));
