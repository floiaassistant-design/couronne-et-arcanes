import {createBattle} from './fixtures/legacy-battle.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {freshProfile,playPlayerCard,endPlayerTurn,fuseCard,FUSION_COSTS} from '../src/engine.js';
import {rankEnemyMoves} from '../src/ai.js';
import {TEMPO_IDS,TEMPO_MAX_WAIT,accelerationTarget,obstructionTarget,tempoTargetError} from '../src/engine/tempo.js';
function battle(id='hourglass_surge'){
 const b=createBattle(freshProfile(),CAMPAIGN[0],31337);
 for(const side of ['p','e'])Object.assign(b.heroes[side],{hand:[],deck:[],discard:[],hp:100,maxhp:100});
 b.heroes.p.hand=[{id,wait:0}];return b;
}
test('V2.10 adds two tempo spells without changing previous nominal delays',()=>{
 assert.equal(Object.keys(CARDS).length,76);
 assert.deepEqual([...TEMPO_IDS],['hourglass_surge','time_bind']);
 assert.equal(CARDS.dragon.delay,5);assert.equal(CARDS.militia.delay,0);
 assert.ok(TEMPO_IDS.every(id=>CARDS[id].type==='sort'));
});
test('Acceleration targets the slowest friendly card and respects leftmost ties',()=>{
 const b=battle();b.heroes.p.hand.push({id:'dragon',wait:4},{id:'lich',wait:4},{id:'militia',wait:0});
 assert.equal(accelerationTarget(b,'p').index,1);
 assert.equal(playPlayerCard(b,0,0).ok,true);
 assert.deepEqual(b.heroes.p.hand.map(x=>x.wait),[2,4,0]);
 assert.equal(b.heroes.p.cardsPlayed,1);
 assert.equal(b.heroes.p.discard[0],'hourglass_surge');
 assert.ok(b.log.some(s=>s.includes('Dragon des Sept Cieux')));
});
test('Acceleration cannot go below zero, or consume actions without a target',()=>{
 const b=battle();b.heroes.p.hand.push({id:'archer',wait:1});
 assert.equal(playPlayerCard(b,0,0).ok,true);assert.equal(b.heroes.p.hand[0].wait,0);
 const c=battle();c.heroes.p.hand.push({id:'militia',wait:0});
 const before=JSON.stringify(c);
 assert.match(tempoTargetError(c,'p',CARDS.hourglass_surge),/Aucune autre carte/);
 assert.equal(playPlayerCard(c,0,1).ok,false);assert.equal(JSON.stringify(c),before);
});
test('Slowdown affects one opposing ready card without revealing identity',()=>{
 const b=battle('time_bind');
 b.heroes.e.hand=[{id:'dragon',wait:4},{id:'lich',wait:0},{id:'archer',wait:0}];
 assert.equal(obstructionTarget(b,'p').index,1);
 assert.equal(playPlayerCard(b,0,2).ok,true);
 assert.deepEqual(b.heroes.e.hand.map(x=>x.wait),[4,2,0]);
 assert.ok(!b.log.some(s=>s.includes('Archiliche de Minuit')));
});
test('Slowdown has a wait cap of six and fails without a target',()=>{
 const b=battle('time_bind');b.heroes.e.hand=[{id:'dragon',wait:5}];
 assert.equal(playPlayerCard(b,0,0).ok,true);assert.equal(b.heroes.e.hand[0].wait,TEMPO_MAX_WAIT);
 const c=battle('time_bind');c.heroes.e.hand=[{id:'dragon',wait:6}];
 assert.equal(playPlayerCard(c,0,0).ok,false);
 assert.equal(c.heroes.p.cardsPlayed,0);
});
test('Enemy can use tempo on the player; saving requires no new field',()=>{
 const b=battle();b.heroes.p.hand=[{id:'militia',wait:0},{id:'dragon',wait:3}];
 b.heroes.e.hand=[{id:'time_bind',wait:0}];b.aiStyle='rituel';
 assert.ok(rankEnemyMoves(b).some(x=>x.id==='time_bind'));
 endPlayerTurn(b);
 assert.equal(b.heroes.p.hand.find(x=>x.id==='militia').wait,1);
 const copy=JSON.parse(JSON.stringify(b));assert.deepEqual(copy.heroes.p.hand,b.heroes.p.hand);
 assert.ok(!Object.hasOwn(copy,'tempo'));
});
test('AI scoring of slowdown never inspects hidden player hand',()=>{
 const b=battle();b.heroes.e.hand=[{id:'time_bind',wait:0}];
 Object.defineProperty(b.heroes.p,'hand',{get(){throw Error('Private cards read by AI');}});
 assert.ok(rankEnemyMoves(b).some(x=>x.id==='time_bind'));
});
test('Both spells are obtainable in alchemy without removing old cards',()=>{
 const p=freshProfile();p.gold=100;p.shards=200;
 const before={...p.collection};const keys=Object.keys(p).sort();
 for(const id of TEMPO_IDS){
  assert.equal(fuseCard(p,id).ok,true);assert.equal(p.collection[id],1);
  assert.deepEqual(FUSION_COSTS[CARDS[id].rarity],{gold:32,shards:64});
 }
 for(const [id,n] of Object.entries(before))assert.equal(p.collection[id],n);
 assert.deepEqual(Object.keys(p).sort(),keys);
});
