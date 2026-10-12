// Comparaison isolée de géométrie : mêmes profils, decks, graines et rencontres.
import assert from 'node:assert/strict';
import {CAMPAIGN,towerMission} from '../src/data.js';
import {dungeonStageMission} from '../src/dungeons.js';
import {proposeDeck} from '../src/engine.js';
import {supportedBoard,lastCell,laneCount} from '../src/engine/board.js';
import {makeLabProfile,LAB_COLLECTIONS} from './lib/deck_scenarios.mjs';
import {simulateBattle} from './lib/battle_runner.mjs';
const seeds=Number(process.env.ARENA_SEEDS||8);
assert.ok(Number.isInteger(seeds)&&seeds>0&&seeds<=64);
const encounters=[CAMPAIGN[0],CAMPAIGN[2],CAMPAIGN[4],CAMPAIGN[8],towerMission(1),towerMission(10),dungeonStageMission('ysara',2),dungeonStageMission('minuit',2)];
function run(){
 const rows=[];let completed=0,maxTurns=0,invalid=0,late=0;
 for(const collection of LAB_COLLECTIONS)for(const hero of ['gardien','arcaniste','rodeur','clerc'])for(const style of ['equilibre','assaut','rempart','arcanes']){
  const p=makeLabProfile(collection,hero),proposal=proposeDeck(p,style);assert.equal(proposal.ok,true);p.deck=proposal.deck;
  for(const legacy of [true,false]){
   let wins=0,turns=0,attrition=0;
   for(const mission of encounters)for(let k=0;k<seeds;k++){
    const r=simulateBattle(p,mission,211001+k*997,{legacy,observe:b=>{
     if(!supportedBoard(b.board)){invalid++;throw Error('Plateau invalide');}
     const units=b.board.flat().filter(Boolean);assert.equal(new Set(units.map(u=>u.uid)).size,units.length);
     assert.ok(units.every(u=>u.hp>0));assert.ok(b.round<=36);
     for(const t of b.traps||[])assert.ok(t.lane>=0&&t.lane<laneCount(b)&&t.col>=2&&t.col<lastCell(b));
    }});
    wins+=Number(r.win);turns+=r.turns;attrition+=Number(r.turns>=17);completed++;maxTurns=Math.max(maxTurns,r.turns);late+=Number(r.turns>=35);
   }
   const n=encounters.length*seeds;rows.push({collection,hero,style,layout:legacy?'3x5':'2-4x10',battles:n,wins,winRate:Math.round(wins/n*1000)/10,meanTurns:Math.round(turns/n*100)/100,attrition});
  }
 }
 return {schema:1,seeds,completed,maxTurns,invalid,late,encounters:encounters.map(m=>m.id),rows};
}
const result=run();assert.deepEqual(run(),result,'Les deux passes doivent être identiques');
console.log(JSON.stringify(result,null,2));
