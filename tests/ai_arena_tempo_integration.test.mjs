import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectEnemyLane,rankEnemyMoves} from '../src/ai.js';

function encounter(lanes,cells){
 const b={
  status:'active',round:1,board:Array.from({length:lanes},()=>Array(cells+2).fill(null)),
  heroes:{
   e:{hp:10,maxhp:10,shield:0,hand:[{id:'time_bind',wait:0}],cardsPlayed:0},
   p:{hp:20,maxhp:20,shield:0}
  },traps:[]
 };
 Object.defineProperty(b.heroes.p,'hand',{get(){throw Error('Hidden player hand accessed')}});
 b.board[lanes-1][cells]={side:'p',id:'threat',hp:4,maxhp:4,atk:2,stun:0};
 return b;
}

test('V2.11 + tempo IA: the fourth lane and distant crown use actual board dimensions',()=>{
 const b=encounter(4,10);
 const lane=inspectEnemyLane(b,3);
 assert.equal(lane.frontline.col,10);
 assert.equal(lane.entryFree,false); 
 const moves=rankEnemyMoves(b);
 assert.equal(moves.length,4);
 assert.deepEqual(moves.map(x=>x.lane),[0,1,2,3]);
 assert.ok(moves.every(x=>x.id==='time_bind'&&x.score===3));
});

test('V2.11 + tempo IA: an old saved 3x5 battlefield retains identical crown threat scoring',()=>{
 const b=encounter(3,5);
 const moves=rankEnemyMoves(b);
 assert.equal(moves.length,3);
 assert.ok(moves.every(x=>x.score===3));
});
