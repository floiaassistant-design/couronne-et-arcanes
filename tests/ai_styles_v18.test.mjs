import {createBattle} from './fixtures/legacy-battle.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {CAMPAIGN,CARDS,towerMission,TOWER_MAX} from '../src/data.js';
import {freshProfile,endPlayerTurn} from '../src/engine.js';
import {AI_STYLES,aiStyle,aiEnraged,personalityBonus,rankEnemyMoves} from '../src/ai.js';
const mk=(seed=111)=>{const b=createBattle(freshProfile(),CAMPAIGN[0],seed);for(const side of ['p','e']){b.heroes[side].hand=[];b.heroes[side].deck=[];b.heroes[side].discard=[];}return b;};
const unit=(id,side='p')=>({uid:100,id,side,hp:CARDS[id].hp,maxhp:CARDS[id].hp,atk:CARDS[id].attack,armor:CARDS[id].ability==='armor'?2:0,ranged:CARDS[id].ability==='ranged',ability:CARDS[id].ability,stun:0,poison:0,poisonTurns:0});
const hand=(b,...ids)=>{b.heroes.e.hand=ids.map(id=>({id,wait:0}));};

test('V1.8 campaign and tower assign documented, valid enemy personalities',()=>{
 assert.equal(Object.keys(AI_STYLES).length,5);
 for(const mission of CAMPAIGN){assert.ok(AI_STYLES[mission.aiStyle],mission.name);const b=createBattle(freshProfile(),mission,1);assert.equal(b.aiStyle,mission.aiStyle);assert.equal(b.aiBoss,Boolean(mission.boss));}
 for(let n=1;n<=TOWER_MAX;n++){const m=towerMission(n);assert.ok(AI_STYLES[m.aiStyle]);assert.equal(m.boss,n%5===0);}
});

test('V1.8 defensive style chooses guards while assaulter chooses fast offensive units',()=>{
 const b=mk();hand(b,'wolf','shield');b.aiStyle='bastion';assert.equal(rankEnemyMoves(b)[0].id,'shield');
 b.aiStyle='assaut';assert.equal(rankEnemyMoves(b)[0].id,'wolf');
});

test('V1.8 Ritual prioritizes effective area control when two player units threaten a line',()=>{
 const b=mk();hand(b,'ranger','storm');b.board[2][4]=unit('golem');b.board[2][3]=unit('wolf');b.aiStyle='rituel';
 assert.equal(rankEnemyMoves(b)[0].id,'storm');assert.equal(rankEnemyMoves(b)[0].lane,2);
});

test('V1.8 pack style rewards Concorde on a line with a compatible ally',()=>{
 const b=mk();hand(b,'wolf');b.board[1][3]=unit('ranger','e');b.aiStyle='meute';
 assert.equal(rankEnemyMoves(b)[0].lane,1);
 const scorePack=rankEnemyMoves(b)[0].score;
 b.aiStyle='equilibre';assert.ok(scorePack>rankEnemyMoves(b)[0].score);
});

test('V1.8 boss enters fury only at or below half life with no extra combat resources',()=>{
 const b=mk();hand(b,'militia','healing','firebolt');b.aiStyle='bastion';b.aiBoss=true;
 b.heroes.e.maxhp=30;b.heroes.e.hp=16;assert.equal(aiEnraged(b),false);
 b.heroes.e.hp=15;assert.equal(aiEnraged(b),true);
 const handBefore=structuredClone(b.heroes.e.hand),deckBefore=[...b.heroes.e.deck],stats=structuredClone(b.heroes.e);
 rankEnemyMoves(b);
 assert.deepEqual(b.heroes.e.hand,handBefore);assert.deepEqual(b.heroes.e.deck,deckBefore);assert.deepEqual(b.heroes.e,stats);
});

test('V1.8 boss phase changes tactical priorities without hidden buffs',()=>{
 const b=mk();hand(b,'militia','healing','firebolt');b.aiStyle='bastion';b.aiBoss=true;b.heroes.e.maxhp=30;b.heroes.e.hp=9;
 const normal=structuredClone(b);normal.aiBoss=false;
 assert.equal(rankEnemyMoves(normal)[0].id,'healing');
 assert.equal(rankEnemyMoves(b)[0].id,'militia');
});

test('V1.8 fury announcement occurs once on actual enemy turn, including reloads',()=>{
 const b=mk();hand(b,'militia');b.aiStyle='assaut';b.aiBoss=true;b.heroes.e.maxhp=30;b.heroes.e.hp=14;
 const totalBefore=b.heroes.e.hand.length+b.heroes.e.deck.length+b.heroes.e.discard.length;
 endPlayerTurn(b);
 assert.equal(b.aiPhaseAnnounced,true);
 assert.equal(b.log.filter(t=>t.includes('phase de furie')).length,1);
 assert.equal(b.heroes.e.hand.length+b.heroes.e.deck.length+b.heroes.e.discard.length,totalBefore,'fury grants no extra card; empty decks cannot draw');
 endPlayerTurn(b);
 assert.equal(b.log.filter(t=>t.includes('phase de furie')).length,1);
});

test('V1.8 legacy saved battle without style or boss markers defaults safely to balanced',()=>{
 const b=mk();delete b.aiStyle;delete b.aiBoss;hand(b,'militia');
 assert.equal(aiStyle(b),'equilibre');assert.equal(aiEnraged(b),false);
 assert.ok(rankEnemyMoves(b).length>0);assert.equal(endPlayerTurn(b).ok,true);
});

test('V1.8 tactical ranking remains pure, deterministic and never reads hidden player hand',()=>{
 const b=mk();hand(b,'wolf','shield','firebolt');b.aiStyle='meute';b.aiBoss=true;
 b.board[0][3]=unit('archer');
 const before=structuredClone(b),rank=rankEnemyMoves(b);
 assert.deepEqual(b,before);
 b.heroes.p.hand=[{id:'dragon',wait:0}];b.heroes.p.deck=['lich'];
 assert.deepEqual(rankEnemyMoves(b),rank);
 assert.ok(rank.every(x=>x.index<b.heroes.e.hand.length&&x.score>0));
});
