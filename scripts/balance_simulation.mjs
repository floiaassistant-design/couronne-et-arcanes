// Reproducible comparative balance probe. Automated heuristic, NOT a human win-rate predictor.
// 32 encounters × 40 fixed seeds = 1280 battles per profile.
import {CAMPAIGN,towerMission} from '../src/data.js';
import {DUNGEONS,dungeonStageMission,dungeonBonusMission} from '../src/dungeons.js';
import {freshProfile} from '../src/engine.js';
import {simulateBattle} from './lib/battle_runner.mjs';
function play(mission,seed,profile){return simulateBattle(profile,mission,seed,{turnLimit:39});}
const missions=[...CAMPAIGN.map(m=>({id:'C'+m.id,m})),...[1,5,10,15,20].map(i=>({id:'T'+i,m:towerMission(i)})),...DUNGEONS.flatMap(d=>d.stages.map((_,idx)=>({id:`D-${d.id}-${idx+1}`,m:dungeonStageMission(d.id,idx)}))),...DUNGEONS.flatMap(d=>[1,2].map(i=>({id:`B-${d.id}-${i}`,m:dungeonBonusMission(d.id,i)})))];
const s=process.argv.includes('--developed')?'developed':process.argv.includes('--mid')?'mid':'starter';
const p=freshProfile();
if(s==='mid'){p.buildings.bastion=1;p.upgrades.militia=1;p.upgrades.ranger=1;p.reputation.aube=5;}
if(s==='developed'){p.buildings={bastion:2,forge:1,bibliotheque:1};p.reputation={aube:15,sylve:15,ombre:0,forge:0,ether:0};p.equipmentOwned=['lame','cuirasse'];p.equipped={arme:'lame',armure:'cuirasse',relique:null};p.upgrades={militia:1,shield:1,archer:1,ranger:1,wolf:1,firebolt:0};}
let overall=0,wins=0;
const summaryOnly=process.argv.includes('--summary');
for(const {id,m} of missions){let w=0,turns=0,hp=0;for(let k=0;k<40;k++){const result=play(m,100_001+k*2137,p);w+=result.win;turns+=result.turns;hp+=result.hp;wins+=result.win;overall++;}
if(!summaryOnly)console.log(`${id.padEnd(17)} win=${String((w*100/40).toFixed(0)).padStart(3)}% turns=${(turns/40).toFixed(1).padStart(4)} hero_hp=${(hp/40).toFixed(1).padStart(5)}`)}
console.log('TOTAL',wins,overall,(wins*100/overall).toFixed(1)+'%',s);
