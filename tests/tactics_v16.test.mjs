import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,CAMPAIGN,cardTraits,CHARGE_IDS,RIPOSTE_IDS} from '../src/data.js';
import {freshProfile,createBattle,endPlayerTurn} from '../src/engine.js';

const make=(seed=166)=>{
 const b=createBattle(freshProfile(),CAMPAIGN[0],seed);
 for(const side of ['p','e']){
  b.heroes[side].hand=[];
  b.heroes[side].deck=[];
  b.heroes[side].discard=[];
 }
 return b;
};
let sequence=8000;
const unit=(id,side,hp=CARDS[id].hp,atk=CARDS[id].attack,extra={})=>({
 uid:++sequence,id,side,atk,hp,maxhp:hp,
 armor:CARDS[id].ability==='armor'?2:0,ranged:CARDS[id].ability==='ranged',
 ability:CARDS[id].ability,stun:0,poison:0,poisonTurns:0,...extra
});

test('V1.6 Charge: a wolf gets +2 on a melee attack immediately after advancing',()=>{
 const b=make();b.board[0][1]=unit('wolf','p',8);b.board[0][3]=unit('bone','e',12);
 b.vfx=[];
 endPlayerTurn(b);
 assert.equal(b.board[0][2]?.id,'wolf');
 assert.equal(b.board[0][3]?.hp,7,'3 attack + 2 charge');
 assert.ok(b.vfx.some(e=>e.type==='attack'&&e.side==='p'&&e.charged));
 assert.ok(b.log.some(m=>m.includes('Charge')));
});

test('V1.6 Charge does not trigger if a unit did not move on that round',()=>{
 const b=make();b.board[0][2]=unit('wolf','p',9);b.board[0][3]=unit('bone','e',12);
 b.vfx=[];
 endPlayerTurn(b);
 assert.equal(b.board[0][3]?.hp,9,'normal damage only');
 assert.ok(!b.vfx.some(e=>e.type==='attack'&&e.side==='p'&&e.charged));
});

test('V1.6 enemy Charge obeys the same rules and no lasting bonus remains',()=>{
 const b=make();b.board[1][2]=unit('militia','p',12,2,{stun:1});b.board[1][4]=unit('shade','e',9);
 const initial=b.board[1][2].hp;
 endPlayerTurn(b);
 assert.equal(b.board[1][2].hp,initial-5,'3 +2 from enemy shade');
 assert.equal(b.board[1][3].movedThisRound,false,'charge flag cleared');
});

test('V1.6 Riposte: a living defender counters a melee hit once',()=>{
 const b=make();b.board[1][2]=unit('shield','p',9);b.board[1][3]=unit('bone','e',12);
 b.vfx=[];
 endPlayerTurn(b);
 assert.equal(b.board[1][2].hp,8,'3 melee minus 2 armor');
 assert.equal(b.board[1][3].hp,10,'1 attaque + Riposte égale à son ATQ 1');
 assert.equal(b.vfx.filter(e=>e.riposte).length,1);
 assert.equal(b.board[1][2].lastRiposteRound,1);
});

test('V1.6 Riposte never triggers against an attack from distance',()=>{
 const b=make();b.board[1][2]=unit('shield','p',9,1,{stun:1});b.board[1][4]=unit('archer','e',9);
 b.vfx=[];
 endPlayerTurn(b);
 assert.equal(b.board[1][4].hp,9);
 assert.equal(b.vfx.filter(e=>e.riposte).length,0);
});

test('V1.6 one already defeated defender cannot counterattack',()=>{
 const b=make();b.board[1][2]=unit('shield','p',1);b.board[1][3]=unit('bone','e',12);
 b.vfx=[];
 endPlayerTurn(b);
 assert.equal(b.vfx.filter(e=>e.riposte).length,0);
 assert.equal(b.board[1][2],null);
});

test('V1.6 Kill statistics count a defender only once even when multiple intents hit',()=>{
 const b=make();b.board[1][1]=unit('archer','p');b.board[1][2]=unit('militia','p');b.board[1][3]=unit('bone','e',1);
 endPlayerTurn(b);
 assert.equal(b.stats.playerKills,1);
});

test('V1.6 old saves without tactical fields retain Charge and Riposte by card ID',()=>{
 const b=make();
 b.board[0][1]=unit('wolf','p',8);b.board[0][3]=unit('bone','e',10);
 delete b.board[0][1].movedThisRound;
 assert.ok(cardTraits('wolf').includes('Charge'));
 assert.ok(cardTraits('shield').includes('Riposte'));
 assert.ok(CHARGE_IDS.has('wolf')&&RIPOSTE_IDS.has('shield'));
 endPlayerTurn(b);
 assert.equal(b.board[0][3].hp,5);
});
