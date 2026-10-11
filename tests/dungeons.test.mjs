import test from 'node:test';
import assert from 'node:assert/strict';
import {DUNGEONS,dungeonStageMission,dungeonById} from '../src/dungeons.js';
import {CARDS} from '../src/data.js';
import {freshProfile,normalizeProfile,beginDungeon,nextDungeonBattle,settleDungeonBattle,dungeonUnlocked,abandonDungeon,chooseDungeonEvent} from '../src/engine.js';

test('V1.9 three dungeons with 3 playable encounters and a final boss each',()=>{
 assert.equal(DUNGEONS.length,3);
 for(const d of DUNGEONS){
  assert.equal(d.stages.length,3);assert.ok(CARDS[d.unlock]);
  assert.equal(dungeonById(d.id),d);
  for(let i=0;i<3;i++){
   const m=dungeonStageMission(d.id,i);
   assert.equal(m.mode,'dungeon');assert.equal(m.dungeonId,d.id);
   assert.equal(m.dungeonStage,i);assert.ok(m.deck.length>=12);
   assert.ok(m.deck.every(c=>CARDS[c]));assert.equal(!!m.boss,i===2);
  }
 }
 assert.throws(()=>dungeonStageMission('unknown',0));
 assert.throws(()=>dungeonStageMission('ysara',3));
});

test('V1.9 dungeon selection requires unlocking and a valid deck',()=>{
 const p=freshProfile();
 assert.ok(dungeonUnlocked(p,'ysara'));
 assert.equal(dungeonUnlocked(p,'braise'),false);
 assert.equal(beginDungeon(p,'braise').ok,false);
 assert.equal(beginDungeon(p,'ysara').ok,true);
 assert.equal(beginDungeon(p,'ysara').ok,false);
 const x=freshProfile();x.deck=[];
 assert.equal(beginDungeon(x,'ysara').ok,false);
});

test('V1.9 dungeon run retains life, heals by 6, then gives unique card on first full clear',()=>{
 const p=freshProfile(),startGold=p.gold,startShards=p.shards;
 assert.equal(beginDungeon(p,'ysara').ok,true);
 let expectedGold=0,expectedShards=0;
 for(let index=0;index<3;index++){
  const m=dungeonStageMission('ysara',index),b=nextDungeonBattle(p,710+index);
  assert.equal(b.mode,'dungeon');assert.equal(b.dungeonId,'ysara');assert.equal(b.dungeonStage,index);
  if(index>0)assert.equal(b.heroes.p.hp,20,'hero retains 14 HP and gets six rest HP');
  b.heroes.p.hp=14;b.status='victory';
  const r=settleDungeonBattle(p,b);
  assert.ok(r.ok);assert.equal(r.victory,true);
  expectedGold+=m.reward;expectedShards+=m.shards;
  if(index<2){assert.equal(p.dungeonRun.stage,index+1);assert.equal(p.dungeonRun.hp,20);assert.equal(r.finished,false);assert.equal(chooseDungeonEvent(p,'treasure').ok,true);expectedGold+=35+(index+1)*10;expectedShards+=12+(index+1)*5;}
  else{
   expectedGold+=DUNGEONS[0].bonusGold;expectedShards+=DUNGEONS[0].bonusShards;
   assert.equal(r.card,'archdruid');assert.equal(r.finished,true);
  }
  assert.equal(settleDungeonBattle(p,b).ok,false,'must not grant same stage twice');
 }
 assert.equal(p.gold,startGold+expectedGold);assert.equal(p.shards,startShards+expectedShards);
 assert.equal(p.collection.archdruid,1);assert.deepEqual(p.dungeonCleared,['ysara']);
 assert.equal(p.dungeonRun,null);assert.ok(dungeonUnlocked(p,'braise'));
});

test('V1.9 replaying completed dungeon has bonuses but no second unique card',()=>{
 const p=freshProfile();p.dungeonCleared=['ysara'];p.collection.archdruid=1;
 assert.equal(beginDungeon(p,'ysara').ok,true);
 let result;
 for(let index=0;index<3;index++){
  const b=nextDungeonBattle(p,100+index);b.status='victory';result=settleDungeonBattle(p,b);if(index<2)chooseDungeonEvent(p,'rest');
 }
 assert.equal(result.card,null);assert.equal(result.firstClear,false);assert.equal(p.collection.archdruid,1);
});

test('V1.9 a defeat resets only the expedition while retaining earlier stage loot',()=>{
 const p=freshProfile();beginDungeon(p,'ysara');
 const b=nextDungeonBattle(p,301);b.status='victory';
 settleDungeonBattle(p,b);const earnedGold=p.gold;chooseDungeonEvent(p,'rest');
 const b2=nextDungeonBattle(p,302);b2.status='defeat';
 const r=settleDungeonBattle(p,b2);
 assert.equal(r.victory,false);assert.equal(p.dungeonRun,null);assert.equal(p.gold,earnedGold);
 assert.equal(p.losses,1);assert.equal(p.dungeonCleared.length,0);
 assert.equal(beginDungeon(p,'ysara').ok,true,'retry starts from the first room');
 assert.equal(p.dungeonRun.stage,0);
});

test('V1.9 abandon clears current run and leaves earned cards and currency alone',()=>{
 const p=freshProfile();beginDungeon(p,'ysara');const gold=p.gold;
 assert.equal(abandonDungeon(p),true);assert.equal(p.gold,gold);
 assert.equal(p.dungeonRun,null);assert.equal(abandonDungeon(p),false);
});

test('V1.9 old save migration and damaged dungeon metadata are safe',()=>{
 assert.deepEqual(normalizeProfile({version:1,deck:['militia']}).dungeonCleared,[]);
 assert.equal(normalizeProfile({version:1,deck:['militia']}).dungeonRun,null);
 const p=normalizeProfile({dungeonRun:{id:'ysara',stage:1,hp:11,maxhp:26},dungeonCleared:['ysara','bogus','ysara']});
 assert.deepEqual(p.dungeonCleared,['ysara']);assert.equal(p.dungeonRun.hp,11);
 assert.equal(normalizeProfile({dungeonRun:{id:'bad',stage:0}}).dungeonRun,null);
 assert.equal(normalizeProfile({dungeonRun:{id:'ysara',stage:99}}).dungeonRun,null);
});

test('V1.9 stale dungeon victory cannot be replayed after advancing',()=>{
 const p=freshProfile();beginDungeon(p,'ysara');
 const old=nextDungeonBattle(p,900);old.status='victory';
 assert.equal(settleDungeonBattle(p,old).ok,true);
 assert.equal(settleDungeonBattle(p,old).ok,false);
 const forged={...old,dungeonStage:2,missionId:'D_ysara_3'};
 assert.equal(settleDungeonBattle(p,forged).ok,false);
});
