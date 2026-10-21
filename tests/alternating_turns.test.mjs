import test from 'node:test';
import assert from 'node:assert/strict';
import {CAMPAIGN} from '../src/data.js';
import {createBattle,endPlayerTurn,playEnemyCard,finishEnemyTurn,playPlayerCard} from '../src/engine.js';
import {freshProfile} from '../src/engine/profile.js';
import {validStoredBattle} from '../src/ui/storage.js';

const mk=(seed=171)=>createBattle(freshProfile(),CAMPAIGN[0],seed,{turnFlow:'alternating'});
const clearEnemy=b=>{b.heroes.e.hand=[];b.heroes.e.deck=[];b.heroes.e.discard=[];};
const unit=(uid,side)=>({uid,id:'militia',side,atk:2,hp:5,maxhp:5,armor:0,ranged:false,ability:'none',stun:0,poison:0,poisonTurns:0});

test('un tour alternatif sépare les mouvements du joueur et ceux de l IA',()=>{
 const b=mk();clearEnemy(b);
 b.heroes.p.hand=[{id:'militia',wait:0}];
 assert.equal(playPlayerCard(b,0,0,1).ok,true);
 b.board[1][9]=unit(800,'e');
 assert.equal(endPlayerTurn(b).ok,true);
 assert.equal(b.phase,'enemy');
 assert.equal(b.round,1);
 assert.equal(b.board[0][2]?.side,'p','le joueur avance après validation');
 assert.equal(b.board[1][9]?.side,'e','la troupe adverse attend son propre tour');
 assert.deepEqual(playEnemyCard(b),{ok:true,done:true});
 assert.equal(finishEnemyTurn(b).ok,true);
 assert.equal(b.phase,'player');
 assert.equal(b.round,2);
 assert.equal(b.board[1][8]?.side,'e','l IA agit seulement après avoir terminé ses poses');
 assert.equal(validStoredBattle(b),true);
});

test('les cartes de l IA sont jouées une par une et visibles avant sa résolution',()=>{
 const b=mk(172);
 b.heroes.e.hand=[{id:'militia',wait:0}];b.heroes.e.deck=[];b.heroes.e.discard=[];
 b.heroes.p.hand=[];b.heroes.p.deck=[];b.heroes.p.discard=[];
 endPlayerTurn(b);
 const first=playEnemyCard(b);
 assert.equal(first.ok,true);assert.equal(first.done,false);
 assert.equal(first.id,'militia');
 assert.equal(b.heroes.e.cardsPlayed,1);
 const spawned=b.board[first.lane][first.col];
 assert.equal(spawned?.side,'e');
 const restored=JSON.parse(JSON.stringify(b));
 assert.equal(validStoredBattle(restored),true,'le combat peut reprendre entre deux poses adverses');
 assert.deepEqual(playEnemyCard(restored),{ok:true,done:true});
 assert.equal(finishEnemyTurn(restored).ok,true);
 assert.equal(restored.round,2);
 assert.equal(restored.phase,'player');
 assert.equal(finishEnemyTurn(restored).ok,false,'la résolution ne se répète pas');
});

test('un héros vaincu pendant la phase joueur empêche l IA de jouer',()=>{
 const b=mk(173);clearEnemy(b);
 b.heroes.e.hp=2;
 b.board[0][10]=unit(900,'p');
 assert.equal(endPlayerTurn(b).ok,true);
 assert.equal(b.status,'victory');
 assert.equal(b.phase,'finished');
 assert.equal(playEnemyCard(b).ok,false);
});

test('les combats historiques restent sur la résolution commune',()=>{
 const b=createBattle(freshProfile(),CAMPAIGN[0],174);
 clearEnemy(b);b.heroes.p.hand=[];b.heroes.p.deck=[];b.heroes.p.discard=[];
 assert.equal(endPlayerTurn(b).ok,true);
 assert.equal(b.round,2);
 assert.equal(b.phase,'player');
 assert.equal(b.turnFlow,undefined);
});
