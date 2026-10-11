import test from 'node:test';
import assert from 'node:assert/strict';
import {CAMPAIGN,towerMission} from '../src/data.js';
import {DUNGEONS,dungeonBonusMission} from '../src/dungeons.js';
import {freshProfile,normalizeProfile,beginDungeon,chooseDungeonEvent,nextDungeonBattle,settleDungeonBattle} from '../src/engine.js';

test('V2.1 first steps and late bottleneck have documented enemy tuning',()=>{
 assert.equal(CAMPAIGN[0].hp,15);
 assert.equal(CAMPAIGN[2].hp,21);
 assert.equal(CAMPAIGN[10].difficulty,4);
 assert.equal(CAMPAIGN[10].hp,34);
 assert.equal(CAMPAIGN[10].deck.filter(id=>id==='dragon').length,1);
 assert.equal(CAMPAIGN[11].boss,true);
});
test('V2.1 early tower unlock offers gentler floor 1 without weakening milestone bosses',()=>{
 assert.equal(towerMission(1).hp,17);
 assert.equal(towerMission(4).hp,20);
 assert.equal(towerMission(5).hp,17+Math.ceil(5*1.15)+5);
});
test('V2.1 ambush pays over twice the guaranteed treasure and scales with stage',()=>{
 for(const d of DUNGEONS)for(const stage of [1,2]){
  const mission=dungeonBonusMission(d.id,stage);
  const chestGold=35+stage*10,chestShards=12+stage*5;
  assert.ok(mission.reward>=2*chestGold);
  assert.ok(mission.shards>=2*chestShards);
  assert.ok(mission.difficulty<=5);
 }
});
test('V2.1 rewards still require winning the optional fight, remain single claim, and preserve old saves',()=>{
 const p=normalizeProfile({dungeonCleared:[],dungeonRun:null});
 assert.equal(beginDungeon(p,'ysara').ok,true);
 const first=nextDungeonBattle(p,13);first.status='victory';
 assert.equal(settleDungeonBattle(p,first).ok,true);
 const beforeGold=p.gold,beforeShards=p.shards;
 chooseDungeonEvent(p,'challenge');
 assert.equal(p.gold,beforeGold,'starting bonus fight cannot claim reward');
 const bonus=nextDungeonBattle(p,14);bonus.status='victory';
 const mission=dungeonBonusMission('ysara',1);
 const reward=settleDungeonBattle(p,bonus);
 assert.equal(reward.gold,mission.reward);
 assert.equal(reward.shards,mission.shards);
 assert.equal(p.gold,beforeGold+mission.reward);
 assert.equal(p.shards,beforeShards+mission.shards);
 assert.equal(settleDungeonBattle(p,bonus).ok,false);
 const restored=normalizeProfile(JSON.parse(JSON.stringify(p)));
 assert.equal(restored.dungeonRun.phase,'ready');
 assert.equal(restored.dungeonRun.stage,1);
});
