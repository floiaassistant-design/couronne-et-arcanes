import test from 'node:test';
import assert from 'node:assert/strict';
import {CAMPAIGN,CARDS} from '../src/data.js';
import {freshProfile,normalizeProfile,createBattle,playPlayerCard,completeBattle,heroLevel,HERO_MAX_LEVEL,HERO_LEVEL_THRESHOLD,heroShieldBonus,masteryRank,settleDungeonBattle,beginDungeon,nextDungeonBattle} from '../src/engine.js';

const make=(p=freshProfile(),seed=23)=>createBattle(p,CAMPAIGN[0],seed);

test('V2.2 old saves migrate without losing progression or inventory',()=>{
 const p=normalizeProfile({version:1,gold:230,shards:90,deck:freshProfile().deck,collection:{militia:5},completed:['01']});
 assert.equal(p.heroXp,0);assert.deepEqual(p.mastery,{});
 assert.equal(p.gold,230);assert.equal(p.collection.militia,5);assert.deepEqual(p.completed,['01']);
});

test('V2.2 invalid XP and unknown mastery are discarded safely',()=>{
 const p=normalizeProfile({heroXp:-800,mastery:{militia:12,invalid:200,wolf:-2,shield:'oops'}});
 assert.equal(p.heroXp,0);assert.deepEqual(p.mastery,{militia:12});
 assert.equal(masteryRank(p,'militia'),2);assert.equal(masteryRank(p,'invalid'),0);
});

test('V2.2 hero XP has bounded shield bonuses and max level',()=>{
 const p=freshProfile();assert.equal(heroLevel(p),1);assert.equal(heroShieldBonus(p),0);
 p.heroXp=HERO_LEVEL_THRESHOLD(5);assert.equal(heroLevel(p),5);assert.equal(heroShieldBonus(p),1);
 p.heroXp=HERO_LEVEL_THRESHOLD(9);assert.equal(heroLevel(p),9);assert.equal(heroShieldBonus(p),2);
 p.heroXp=999999;assert.equal(heroLevel(p),HERO_MAX_LEVEL);assert.equal(heroShieldBonus(p),2);
});

test('V2.2 battle gains XP and once-only mastery for player cards, not enemy cards',()=>{
 const p=freshProfile(),b=make(p);
 b.heroes.p.hand=[{id:'militia',wait:0},{id:'firebolt',wait:0}];
 assert.equal(playPlayerCard(b,0,0).ok,true);
 assert.equal(playPlayerCard(b,0,1).ok,true);
 b.status='victory';
 const r=completeBattle(p,CAMPAIGN[0],b);
 assert.ok(r.heroXp>0);assert.equal(p.heroXp,r.heroXp);
 assert.equal(p.mastery.militia,2);assert.equal(p.mastery.firebolt,2);
 assert.equal(p.mastery.wolf,undefined,'enemy cards gain no XP');
 const snapshot={xp:p.heroXp,mastery:{...p.mastery},gold:p.gold};
 const repeat=completeBattle(p,CAMPAIGN[0],b);
 assert.equal(repeat.heroXp,0);assert.equal(repeat.gold,0);
 assert.deepEqual({xp:p.heroXp,mastery:p.mastery,gold:p.gold},snapshot);
});

test('V2.2 hero level-up takes effect only in next battle',()=>{
 const p=freshProfile();p.heroXp=HERO_LEVEL_THRESHOLD(5)-10;
 const b=make(p);assert.equal(b.heroes.p.shield,0);
 b.status='victory';const r=completeBattle(p,CAMPAIGN[0],b);
 assert.ok(r.heroXp>=10);assert.equal(r.levelAfter,5);
 const next=make(p);assert.equal(next.heroes.p.shield,1);
 assert.equal(p.shards,50+CAMPAIGN[0].shards,'leveling has no extra shards inflation');
});

test('V2.2 max mastery provides exactly one extra HP, never extra attack',()=>{
 const p=freshProfile();p.mastery.militia=22;
 const b=make(p);b.heroes.p.hand=[{id:'militia',wait:0}];
 assert.equal(masteryRank(p,'militia'),3);
 assert.equal(playPlayerCard(b,0,0).ok,true);
 assert.equal(b.board[0][1].maxhp,CARDS.militia.hp+1);
 assert.equal(b.board[0][1].hp,CARDS.militia.hp+1);
 assert.equal(b.board[0][1].atk,CARDS.militia.attack);
 assert.equal(masteryRank({mastery:{militia:10}},'militia'),2);
});

test('V2.2 immediate retreat grants no XP or mastery',()=>{
 const p=freshProfile(),b=make(p);
 b.heroes.p.hand=[{id:'militia',wait:0}];playPlayerCard(b,0,0);
 b.status='defeat';const r=completeBattle(p,CAMPAIGN[0],b);
 assert.equal(r.heroXp,0);assert.equal(p.mastery.militia,undefined);
});

test('V2.2 dungeon stage also grants experience without duplicate claims',()=>{
 const p=freshProfile();assert.equal(beginDungeon(p,'ysara').ok,true);
 const b=nextDungeonBattle(p,555);b.heroes.p.hand=[{id:'militia',wait:0}];
 playPlayerCard(b,0,0);b.status='victory';
 const r=settleDungeonBattle(p,b);
 assert.equal(r.ok,true);assert.ok(r.heroXp>0);assert.ok(p.mastery.militia>0);
 const old=p.heroXp;assert.equal(settleDungeonBattle(p,b).ok,false);assert.equal(p.heroXp,old);
});
