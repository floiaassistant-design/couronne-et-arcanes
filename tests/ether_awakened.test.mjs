import test from 'node:test';
import assert from 'node:assert/strict';
import {endPlayerTurn,finishEnemyTurn} from '../src/engine.js';
import {placeTrap,expireControl} from '../src/engine/battle-control.js';
import {applyHealingPenalty} from '../src/engine/unit-healing.js';
import {boardInspectionData} from '../src/ui/card-presentation.js';
import {storeBattle,restoreBattle,validStoredBattle} from '../src/ui/storage.js';
import {forgeBattle,forgeUnit as unit,testStorage} from './fixtures/forge-combat.mjs';

function layout(id,side='p',legacy=false){
 const c=forgeBattle(id,'éveillée');
 c.b.board=Array.from({length:3},()=>Array(legacy?7:12).fill(null));
 const col=side==='p'?(legacy?2:4):(legacy?4:7),dir=side==='p'?1:-1;
 const enemy=side==='p'?'e':'p';
 c.u.side=side;c.b.board[1][col]=c.u;c.b.phase=side==='p'?'player':'enemy';
 return {...c,row:c.b.board[1],col,dir,enemy};
}
const attack=({b,u})=>(u.side==='p'?endPlayerTurn:finishEnemyTurn)(b);
const victim=(side,overrides={})=>unit('militia',side,{hp:30,maxhp:30,armor:0,stun:99,...overrides});

test('Fuite lumineuse : deux cases, repli partiel, aucun saut de case occupée, deux camps',()=>{
 for(const side of ['p','e'])for(const cells of [0,1,2]){
  const c=layout('spark',side),{b,u,row,col,dir,enemy}=c;
  const target=victim(enemy);row[col+dir]=target;
  if(cells<2)row[col-(cells+1)*dir]=victim(side);
  assert(attack(c).ok);
  assert.equal(row[col-cells*dir],u);assert.equal(target.hp,27);
  assert.deepEqual(u.nextStrikeBonus,cells?{amount:2,expiresRound:3}:undefined);
  assert.equal(u.spectralRetreatReadyRound,cells?4:undefined);
  assert.equal(b.vfx.filter(e=>e.spectralRetreat).length,cells);
 }
 const c=layout('spark','p',true);c.row[3]=victim('e');assert(attack(c).ok);assert.equal(c.row[1],c.u);
 const lethal=layout('spark');lethal.u.hp=1;lethal.row[lethal.col+1]=victim('e');
 assert(placeTrap(lethal.b,'e',{lane:1,col:lethal.col-1}));assert(attack(lethal).ok);
 assert.equal(lethal.u.hp,0);assert.equal(lethal.u.nextStrikeBonus,undefined);
 assert.equal(lethal.b.vfx.filter(e=>e.spectralRetreat).length,1);
});

test('Tempête des Hauts Cieux : seulement la victime secondaire, piège en chemin et recul partiel',()=>{
 for(const side of ['p','e'])for(const cells of [0,1,2]){
  const c=layout('dragon',side),{b,u,row,col,dir,enemy}=c;
  const target=victim(enemy),secondary=victim(enemy);
  row[col+dir]=target;row[col+2*dir]=secondary;
  if(cells<2)row[col+(3+cells)*dir]=victim(enemy);
  if(cells===2)assert(placeTrap(b,side,{lane:1,col:col+3*dir}));
  assert(attack(c).ok);
  assert.equal(row[col+dir],target);assert.equal(target.hp,23);
  assert.equal(row[col+(2+cells)*dir],secondary);assert.equal(secondary.hp,cells===2?25:28);
  assert.equal(u.splashKnockbackReadyRound,cells?4:undefined);
  assert.equal(b.vfx.filter(e=>e.type==='attack').length,1);
 }
});

test('Constellation captive : barrière après perte de PV, sans cumul, et reprise du plafond',()=>{
 for(const state of ['normal','absorbé','déplacé','source morte','plafond']){
  const c=layout('seer'),{b,u,row,col}=c;
  const target=victim('e');row[col+2]=target;assert(attack(c).ok);assert(finishEnemyTurn(b).ok);
  assert.equal(target.stillOmen.amount,3);
  if(state==='absorbé')target.barrier=3;
  if(state==='déplacé'){target.stun=0;row[col+2]=null;row[col+3]=target;}
  if(state==='source morte')row[col]=null;
  if(state==='plafond'){u.abilityBarriers={stillOmenBarrier:1};u.barrier=4;}
  u.stun=99;assert(attack(c).ok);assert(finishEnemyTurn(b).ok);
  assert.equal(target.stillOmen,undefined);
  assert.equal(target.hp,['absorbé','déplacé'].includes(state)?27:24);
  assert.equal(u.barrier,state==='normal'?1:state==='plafond'?4:undefined);
  if(state==='normal'){
   testStorage();assert(storeBattle(b));const restored=restoreBattle();
   assert.equal(restored.board[1][col].abilityBarriers.stillOmenBarrier,1);
   restored.board[1][col].abilityBarriers.stillOmenBarrier=2;assert(!validStoredBattle(restored));
  }
 }
});

test('Conquête céleste : une vraie Percée arme une seule frappe, avec protections et expiration',()=>{
 const c=layout('aetherknight'),{b,u,row,col}=c;
 row[col+2]=victim('e',{hp:7});assert(attack(c).ok);
 assert.equal(row[col+2],u);assert.deepEqual(u.nextStrikeBonus,{amount:2,expiresRound:3});
 assert.equal(u.atk,5);assert.match(boardInspectionData(b,u.uid).board.statuses.join(' '),/Conquête céleste/);
 assert(finishEnemyTurn(b).ok);
 const target=victim('e',{barrier:2});row[col+3]=target;
 assert(attack(c).ok);assert.equal(target.hp,25);assert.equal(u.nextStrikeBonus,undefined);
 const blocked=layout('aetherknight');blocked.row[blocked.col+1]=victim('e',{hp:1});
 assert(attack(blocked).ok);assert.equal(blocked.u.nextStrikeBonus,undefined);
 const expired=layout('aetherknight');expired.row[expired.col+2]=victim('e',{hp:7});
 assert(attack(expired).ok);expired.b.round=3;expireControl(expired.b);
 assert.equal(expired.u.nextStrikeBonus,undefined);
});

test('Vents du Zénith : attaque +1 seulement après le pas du Sillage, pour les deux camps',()=>{
 for(const side of ['p','e'])for(const distance of [1,2,3]){
  const c=layout('griffin',side),{b,u,row,col,dir,enemy}=c;
  const ally=unit('militia',side,{stun:1});row[col+dir]=ally;
  row[col+3*dir]=victim(enemy);assert(attack(c).ok);
  assert.deepEqual(ally.flightWake,{cells:1,expiresRound:2,strike:1});
  testStorage();assert(storeBattle(b));const restored=restoreBattle();
  assert.equal(restored.board[1][col+dir].flightWake.strike,1);
  restored.board[1][col+dir].flightWake.strike=2;assert(!validStoredBattle(restored));
  row[col+2*dir]=null;row[col+3*dir]=null;
  const target=victim(enemy);row[col+(1+distance)*dir]=target;
  b.round=2;b.phase=side==='p'?'player':'enemy';b.vfx=[];
  assert(attack(c).ok);
  assert.equal(target.hp,30-ally.atk-(distance===3?1:0));
  assert.equal(b.vfx.filter(e=>e.type==='attack').length,1);
  assert.equal(row[col+distance*dir],ally);
  assert.equal(ally.flightWake?.strike,distance===1&&side==='p'?1:undefined);
 }
 const c=layout('griffin'),{b,row,col}=c,ally=unit('militia','p',{stun:1});
 row[col+1]=ally;row[col+3]=victim('e');assert(attack(c).ok);assert(finishEnemyTurn(b).ok);
 row[col+2]=null;row[col+3]=null;b.vfx=[];assert(attack(c).ok);assert.equal(row[col+3],ally);
 assert.equal(b.vfx.filter(e=>e.type==='attack').length,0);assert(finishEnemyTurn(b).ok);
 const target=victim('e');row[col+4]=target;assert(attack(c).ok);assert.equal(target.hp,30-ally.atk);
});

test('Ascension secourable : +3 à l’allié et +1 au Séraphin seulement si le survol soigne',()=>{
 for(const side of ['p','e'])for(const absorbed of [false,true]){
  const c=layout('seraph',side),{b,u,row,col,dir}=c;
  const ally=unit('militia',side,{hp:1,maxhp:10,stun:99});u.hp=5;row[col+dir]=ally;
  if(absorbed)applyHealingPenalty(ally,b.round,{amount:3,duration:1});
  assert(attack(c).ok);
  assert.equal(u.flightSupportReadyRound,4);
  assert.equal(u.hp,absorbed?5:6);
  assert.equal(ally.hp,absorbed?3:6);
  const arrival=b.vfx.find(e=>e.type==='heal'&&e.col===col+2*dir);
  assert.equal(!!arrival,!absorbed);
  if(arrival)assert.equal(arrival.frame.board[1][col+dir].hp,4);
 }
});

test('Faille prolongée : vrai Portail, plus proche d’abord, puis portée deux après reprise',()=>{
 for(const side of ['p','e']){
  const c=layout('portal_walker',side),{b,u,row,col,dir,enemy}=c;
  b.board.pop();
  const near=victim(enemy),far=victim(enemy),rear=victim(enemy),normal=victim(enemy);
  row[col+dir]=near;row[col+2*dir]=far;row[col-dir]=rear;
  b.board[0][col+2*dir]=normal;
  assert(attack(c).ok);
  assert.equal(normal.hp,26);assert.equal(near.hp,30);assert.equal(far.hp,30);
  assert.deepEqual(u.portalEcho,{lane:1,col,expiresRound:2});
  testStorage();assert(storeBattle(b));const restored=restoreBattle();
  assert.equal(restored.board[0][col+dir].portalEcho.col,col);
  for(const skipNear of [false,true]){
   const board=structuredClone(restored);
   board.board[0][col+2*dir]=null;
   if(skipNear)board.board[1][col+dir]=null;
   board.round=2;board.phase=side==='p'?'player':'enemy';board.vfx=[];
   const walker=board.board[0][col+dir],expected=board.board[1][col+(skipNear?2:1)*dir];
   assert(attack({b:board,u:walker}).ok);
   assert.equal(expected.hp,26);assert.equal(walker.portalEcho,undefined);
   if(!skipNear)assert.equal(board.board[1][col+2*dir].hp,30);
   assert.equal(board.board[1][col-dir].hp,30);
   assert.equal(board.vfx.filter(e=>e.type==='attack').length,1);
  }
 }
});
