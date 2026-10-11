import test from 'node:test';
import assert from 'node:assert/strict';
import {DUNGEONS,dungeonBonusMission} from '../src/dungeons.js';
import {freshProfile,normalizeProfile,beginDungeon,chooseDungeonEvent,nextDungeonBattle,settleDungeonBattle,abandonDungeon} from '../src/engine.js';

function afterFirstRoom(){const p=freshProfile();assert.equal(beginDungeon(p,'ysara').ok,true);const b=nextDungeonBattle(p,987);b.heroes.p.hp=9;b.status='victory';const r=settleDungeonBattle(p,b);assert.equal(r.choicePending,true);return p;}

test('V2.0 mandatory event persists after the first room and cannot be skipped',()=>{
 const p=afterFirstRoom();assert.equal(p.dungeonRun.phase,'choice');
 assert.throws(()=>nextDungeonBattle(p,17),/Choisissez un événement/);
 const restored=normalizeProfile(JSON.parse(JSON.stringify(p)));
 assert.equal(restored.dungeonRun.phase,'choice');assert.equal(restored.dungeonRun.hp,15);
});

test('V2.0 rest heals up to ten extra HP and can only be claimed once',()=>{
 const p=afterFirstRoom();const before=p.dungeonRun.hp;
 const healed=chooseDungeonEvent(p,'rest');assert.equal(healed.ok,true);
 assert.equal(healed.restored,10);assert.equal(p.dungeonRun.hp,before+10);
 assert.equal(chooseDungeonEvent(p,'rest').ok,false);
 assert.equal(nextDungeonBattle(p,19).heroes.p.hp,before+10);
});

test('V2.0 rest never exceeds hero maximum',()=>{
 const p=afterFirstRoom();p.dungeonRun.hp=p.dungeonRun.maxhp-2;
 assert.equal(chooseDungeonEvent(p,'rest').restored,2);
 assert.equal(p.dungeonRun.hp,p.dungeonRun.maxhp);
});

test('V2.0 treasure deposits guaranteed currency once, no random draw',()=>{
 const p=afterFirstRoom(),gold=p.gold,shards=p.shards;
 const result=chooseDungeonEvent(p,'treasure');
 assert.equal(result.ok,true);assert.equal(result.gold,45);assert.equal(result.shards,17);
 assert.equal(p.gold,gold+45);assert.equal(p.shards,shards+17);
 assert.equal(chooseDungeonEvent(p,'treasure').ok,false);
});

test('V2.0 optional ambush creates a true additional distinct battle and grants reward on win',()=>{
 const p=afterFirstRoom(),gold=p.gold;
 assert.equal(chooseDungeonEvent(p,'challenge').ok,true);
 assert.equal(p.gold,gold,'no unearned reward for challenge selection');
 assert.equal(p.dungeonRun.phase,'bonus');
 const battle=nextDungeonBattle(p,110);
 assert.equal(battle.mode,'dungeon');assert.equal(battle.dungeonBonus,true);
 assert.equal(battle.missionId,'B_ysara_2');
 assert.ok(battle.heroes.e.hp>0);
 battle.heroes.p.hp=7;battle.status='victory';
 const bonus=settleDungeonBattle(p,battle);
 assert.ok(bonus.ok);assert.equal(bonus.bonus,true);assert.equal(bonus.gold,dungeonBonusMission('ysara',1).reward);
 assert.equal(p.gold,gold+dungeonBonusMission('ysara',1).reward);assert.equal(p.dungeonRun.stage,1);
 assert.equal(p.dungeonRun.phase,'ready');assert.equal(p.dungeonRun.hp,13);
 assert.equal(settleDungeonBattle(p,battle).ok,false);
 const next=nextDungeonBattle(p,111);
 assert.equal(next.missionId,'D_ysara_2');assert.equal(next.dungeonBonus,false);
});

test('V2.0 a defeated ambush ends the run but retains rewards earned so far',()=>{
 const p=afterFirstRoom();chooseDungeonEvent(p,'challenge');const gold=p.gold;
 const b=nextDungeonBattle(p,111);b.status='defeat';const r=settleDungeonBattle(p,b);
 assert.equal(r.victory,false);assert.equal(r.bonus,true);
 assert.equal(p.dungeonRun,null);assert.equal(p.gold,gold);
});

test('V2.0 old V1.9 run is migrated to ready for backwards compatibility',()=>{
 const p=normalizeProfile({dungeonRun:{id:'ysara',stage:1,hp:14,maxhp:26}});
 assert.equal(p.dungeonRun.phase,'ready');assert.equal(nextDungeonBattle(p,120).missionId,'D_ysara_2');
 const corrupt=normalizeProfile({dungeonRun:{id:'ysara',stage:0,hp:null,maxhp:null,phase:'bonus'}});
 assert.equal(corrupt.dungeonRun.phase,'ready');
});

test('V2.0 rejects arbitrary options and bonus battle without choosing the challenge',()=>{
 const p=afterFirstRoom();assert.equal(chooseDungeonEvent(p,'fake').ok,false);
 assert.equal(p.dungeonRun.phase,'choice');
 chooseDungeonEvent(p,'treasure');assert.equal(chooseDungeonEvent(p,'challenge').ok,false);
 const b=nextDungeonBattle(p,999);b.dungeonBonus=true;b.missionId='B_ysara_2';b.status='victory';
 assert.equal(settleDungeonBattle(p,b).ok,false);
});

test('V2.0 optional encounter is available between both transitions and never after boss',()=>{
 for(const d of DUNGEONS){for(const stage of [1,2]){
  const bonus=dungeonBonusMission(d.id,stage);
  assert.ok(bonus.id.startsWith('B_'));assert.ok(bonus.reward>0&&bonus.shards>0);
  assert.equal(bonus.boss,false);assert.equal(bonus.bonusEncounter,true);
 }}
 assert.throws(()=>dungeonBonusMission('ysara',0));
 const p=afterFirstRoom();assert.equal(abandonDungeon(p),true);assert.equal(chooseDungeonEvent(p,'rest').ok,false);
});
