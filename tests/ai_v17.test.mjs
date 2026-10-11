import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {freshProfile,createBattle,endPlayerTurn} from '../src/engine.js';
import {rankEnemyMoves,inspectEnemyLane} from '../src/ai.js';
const make=(seed=309)=>{
 const b=createBattle(freshProfile(),CAMPAIGN[0],seed);
 b.heroes.e.hand=[];b.heroes.e.deck=[];b.heroes.e.discard=[];
 b.heroes.p.hand=[];b.heroes.p.deck=[];b.heroes.p.discard=[];
 return b;
};
let id=9500;
const unit=(card,side='p',extra={})=>({uid:++id,id:card,side,
 atk:CARDS[card].attack,hp:CARDS[card].hp,maxhp:CARDS[card].hp,
 ranged:CARDS[card].ability==='ranged',armor:CARDS[card].ability==='armor'?2:0,
 ability:CARDS[card].ability,stun:0,poison:0,poisonTurns:0,...extra});

test('V1.7 IA detects urgent enemy troops close to its crown',()=>{
 const b=make();b.board[2][4]=unit('wolf');
 const info=inspectEnemyLane(b,2);
 assert.ok(info.urgency>inspectEnemyLane(b,0).urgency);
 assert.equal(info.frontline.u.id,'wolf');
});

test('V1.7 IA chooses an imminent-threat lane instead of an empty lane',()=>{
 const b=make();b.heroes.e.hand=[{id:'militia',wait:0}];
 b.board[2][4]=unit('wolf');
 const ranked=rankEnemyMoves(b);
 assert.equal(ranked[0].lane,2);
 assert.equal(ranked[0].reason,'Défense prioritaire');
});

test('V1.7 IA prefers a useful finishing spell when a dangerous creature is present',()=>{
 const b=make();b.heroes.e.hand=[{id:'militia',wait:0},{id:'firebolt',wait:0}];
 b.board[2][4]=unit('wolf');
 assert.deepEqual(rankEnemyMoves(b)[0].id,'firebolt');
 const oldHP=b.board[2][4].hp;
 endPlayerTurn(b);
 assert.equal(b.board[2][4],null);
 assert.ok(oldHP>0);
 assert.ok(b.log.some(x=>x.includes('Éliminer une menace · ligne 3')), 'the first tactical choice is recorded');
});

test('V1.7 IA creates a same-faction formation on a suitable line',()=>{
 const b=make();b.heroes.e.hand=[{id:'shield',wait:0},{id:'ranger',wait:0}];
 b.board[1][3]=unit('archer','e');
 const move=rankEnemyMoves(b)[0];
 assert.equal(move.lane,1);
 assert.equal(move.id,'shield');
 assert.equal(move.reason,'Formation de faction');
});

test('V1.7 IA does not waste unsupported healing, rooting or storm spells',()=>{
 const b=make();b.heroes.e.hand=['healing','storm','entangle'].map(id=>({id,wait:0}));
 assert.equal(rankEnemyMoves(b).length,0);
 const before=b.heroes.e.hand.length;
 endPlayerTurn(b);
 assert.ok(b.heroes.e.hand.length>=before,'no card discarded needlessly');
});

test('V1.7 IA avoids deploying on occupied entry slots',()=>{
 const b=make();b.heroes.e.hand=[{id:'golem',wait:0}];
 b.board[0][5]=unit('bone','e');b.board[1][5]=unit('bone','e');
 assert.equal(rankEnemyMoves(b)[0].lane,2);
 const applied=endPlayerTurn(b);
 assert.equal(applied.ok,true);
 assert.ok(b.board[0].some(u=>u?.id==='bone'&&u.side==='e'),'original occupant survives');
 assert.ok(b.board[1].some(u=>u?.id==='bone'&&u.side==='e'),'second occupant survives');
});

test('V1.7 IA heals a wounded hero instead of wasting the available spell',()=>{
 const b=make();b.heroes.e.hand=[{id:'healing',wait:0}];
 b.heroes.e.hp=6;
 const choice=rankEnemyMoves(b)[0];
 assert.equal(choice.id,'healing');
 endPlayerTurn(b);
 assert.ok(b.heroes.e.hp>=11);
 assert.ok(b.aiLastPlan?.includes('Soigner'));
});

test('V1.7 move ranking is pure and cannot inspect the player private hand or deck',()=>{
 const b=make();b.heroes.e.hand=[{id:'archer',wait:0},{id:'healing',wait:1}];
 b.board[0][4]=unit('militia');
 const before=structuredClone(b),first=rankEnemyMoves(b);
 assert.deepEqual(b,before);
 assert.equal(first.every(x=>x.id!=='healing'),true);
 b.heroes.p.hand=[{id:'dragon',wait:0},{id:'storm',wait:0}];
 b.heroes.p.deck=['wolf'];
 assert.deepEqual(rankEnemyMoves(b),first);
});

test('V1.7 recalculates its plan after each action and never plays over two cards',()=>{
 const b=make();b.heroes.e.hand=[{id:'militia',wait:0},{id:'shield',wait:0},{id:'ranger',wait:0}];
 endPlayerTurn(b);
 assert.equal(b.heroes.e.hand.length+b.heroes.e.deck.length+b.heroes.e.discard.length,3,'played cards are recycled into deck and hand');
 assert.ok(b.log.some(x=>x.includes('L’ennemi invoque')),'two units were deployed');
 assert.ok(b.log.some(x=>x.includes('Tactique adverse')));
 assert.ok(b.board.some(row=>row.some(u=>u&&u.side==='e')));
});

test('V1.7 remains deterministic in repeated battles without revealing enemy hand',()=>{
 const a=make(401),b=make(401);
 for(const combat of [a,b]){
  combat.heroes.e.hand=[{id:'militia',wait:0},{id:'healing',wait:0}];
  combat.board[1][3]=unit('wolf');
 }
 // Unit IDs are not game logic for ranking.
 assert.deepEqual(rankEnemyMoves(a),rankEnemyMoves(b));
 endPlayerTurn(a);endPlayerTurn(b);
 assert.equal(a.aiLastPlan,b.aiLastPlan);
});
