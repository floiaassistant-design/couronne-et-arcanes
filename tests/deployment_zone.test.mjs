import test from 'node:test';
import assert from 'node:assert/strict';
import {CAMPAIGN} from '../src/data.js';
import {freshProfile,createBattle,playPlayerCard,endPlayerTurn} from '../src/engine.js';
import {deploymentColumns,validDeploymentColumn} from '../src/engine/board.js';
import {rankEnemyMoves} from '../src/ai.js';
import {chooseSimulatedMove} from '../scripts/lib/battle_runner.mjs';
function combat(lanes=2,legacy=false){
 const b=createBattle(freshProfile(),{...CAMPAIGN[0],boss:lanes===4,difficulty:lanes===3?3:1},73,{legacy});
 for(const h of Object.values(b.heroes))Object.assign(h,{hand:[],deck:[],discard:[],hp:100,maxhp:100});
 return b;
}
const ready=(b,id='militia')=>{b.heroes.p.hand=[{id,wait:0}];b.heroes.p.cardsPlayed=0;};
for(const lanes of [2,3,4])test(`Pose ${lanes} lignes : chacune des trois cases, statistiques et événement exacts`,()=>{
 for(let lane=0;lane<lanes;lane++)for(const col of [1,2,3]){
  const b=combat(lanes);ready(b);b.vfx=[];
  assert.equal(playPlayerCard(b,0,lane,col).ok,true);
  assert.equal(b.board[lane][col].id,'militia');assert.equal(b.board[lane].filter(Boolean).length,1);
  assert.deepEqual(b.vfx.find(e=>e.type==='spawn'),{type:'spawn',side:'p',lane,col,icon:'⚔'});
  assert.equal(b.heroes.p.cardsPlayed,1);assert.equal(b.heroes.p.hand.length,0);
  const uid=b.board[lane][col].uid;endPlayerTurn(b);
  assert.equal(b.board[lane][col+1].uid,uid);
 }
});
test('Pose : hors zone, occupée, attente et quota ne consomment aucune ressource',()=>{
 const b=combat();ready(b);
 for(const col of [0,4,7,8,10,11,-1,1.5,NaN,'2',null]){
  const before=JSON.stringify(b);assert.equal(playPlayerCard(b,0,0,col).ok,false,String(col));assert.equal(JSON.stringify(b),before);
 }
 assert.equal(playPlayerCard(b,0,0,3).ok,true);ready(b);
 let before=JSON.stringify(b);assert.equal(playPlayerCard(b,0,0,3).ok,false);assert.equal(JSON.stringify(b),before);
 b.heroes.p.hand[0].wait=1;before=JSON.stringify(b);assert.equal(playPlayerCard(b,0,0,2).ok,false);assert.equal(JSON.stringify(b),before);
 b.heroes.p.hand[0].wait=0;b.heroes.p.cardsPlayed=2;before=JSON.stringify(b);assert.equal(playPlayerCard(b,0,0,1).ok,false);assert.equal(JSON.stringify(b),before);
});
test('Pose : piège adverse déclenché à l’entrée et sort toujours ciblé par ligne',()=>{
 const b=combat();ready(b);b.traps=[{owner:'e',lane:0,col:3,damage:3,kind:'rune',stun:0,expiresRound:3}];
 assert.equal(playPlayerCard(b,0,0,3).ok,true);assert.equal(b.board[0][3].hp,2);assert.equal(b.traps.length,0);
 ready(b,'healing');assert.equal(playPlayerCard(b,0,0,2).ok,true);assert.equal(b.board[0][3].hp,4);
});
test('IA : même zone miroir, repli 10 → 9 → 8, sans accès à la main privée',()=>{
 const b=combat();ready(b);playPlayerCard(b,0,0,1);const u=b.board[0][1];b.board[0][1]=null;
 b.heroes.e.hand=[{id:'militia',wait:0}];
 assert.deepEqual(deploymentColumns(b,'p'),[1,2,3]);assert.deepEqual(deploymentColumns(b,'e'),[10,9,8]);
 Object.defineProperty(b.heroes.p,'hand',{get(){throw Error('Lecture privée');},configurable:true});
 for(const col of [10,9,8]){
  assert.equal(rankEnemyMoves(b).find(m=>m.lane===0).col,col);
  b.board[0][col]={...u,uid:100+col,side:'e',stun:5};
 }
 assert.equal(rankEnemyMoves(b).some(m=>m.lane===0),false);
 // Bloquer aussi la seconde ligne ; rouvrir uniquement la case 8 de la première.
 for(const col of [10,9,8])b.board[1][col]={...u,uid:200+col,side:'e',stun:5};
 b.board[0][8]=null;b.vfx=[];
 Object.defineProperty(b.heroes.p,'hand',{value:[],writable:true,configurable:true});
 endPlayerTurn(b);
 assert.equal(b.vfx.find(e=>e.type==='spawn'&&e.side==='e').col,8);
});
test('Compatibilité : API sans colonne, sauvegardes 3×5 et robot d’audit',()=>{
 const b=combat();ready(b);assert.equal(playPlayerCard(b,0,0).ok,true);assert.ok(b.board[0][1]);
 ready(b);const move=chooseSimulatedMove(b);assert.ok(move.col===2||move.lane!==0);
 const old=combat(3,true);ready(old);assert.deepEqual(deploymentColumns(old,'p'),[1]);assert.deepEqual(deploymentColumns(old,'e'),[5]);
 assert.equal(validDeploymentColumn(old,'p',2),false);assert.equal(playPlayerCard(old,0,0,2).ok,false);assert.equal(playPlayerCard(old,0,0).ok,true);
});
