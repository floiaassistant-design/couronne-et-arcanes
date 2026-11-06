import test from 'node:test';
import assert from 'node:assert/strict';
import {endPlayerTurn,finishEnemyTurn,playPlayerCard} from '../src/engine.js';
import {applySilence,placeTrap,prepareControlUnits,teleportUnit,expireControl} from '../src/engine/battle-control.js';
import {hit,resolveRetaliation} from '../src/engine/battle-defense.js';
import {recordCombatEvent} from '../src/engine/combat-events.js';
import {placeRetaliatoryOmen} from '../src/engine/unit-omens.js';
import {validStoredBattle,storeBattle,restoreBattle} from '../src/ui/storage.js';
import {forgeBattle,forgeUnit as unit,testStorage} from './fixtures/forge-combat.mjs';

const hooks={emit:recordCombatEvent,hit,note:()=>{},enter:()=>{}};
const attack=({b,u})=>(u.side==='p'?endPlayerTurn:finishEnemyTurn)(b);

function layout(id,side='p',legacy=false){
 const c=forgeBattle(id,'divine');
 c.b.board=Array.from({length:legacy?3:2},()=>Array(legacy?7:12).fill(null));
 const col=side==='p'?(legacy?2:4):(legacy?4:7),dir=side==='p'?1:-1;
 c.u.side=side;c.b.board[1][col]=c.u;c.b.phase=side==='p'?'player':'enemy';
 const target=unit('militia',side==='p'?'e':'p',{hp:30,maxhp:30,armor:0,atk:3});
 return {...c,col,dir,target};
}

test('Présage rétributif : une attaque normale passe avant les dégâts du présage, avec barrières et reprise',()=>{
 const c=layout('mystic'),{b,u,col,dir,target}=c;b.board[1][col+2*dir]=target;
 assert(attack(c).ok);assert.equal(target.hp,26);
 assert.deepEqual(target.retaliatoryOmen,{sourceUid:u.uid,side:'p',amount:2,expiresRound:3});
 assert.equal(u.retaliatoryOmenReadyRound,4);
 testStorage();assert(storeBattle(b));assert(validStoredBattle(restoreBattle()));
 target.barrier=1;b.vfx=[];assert(finishEnemyTurn(b).ok);
 assert.equal(u.hp,3);assert.equal(target.hp,25);assert.equal(target.barrier,0);
 assert.equal(target.retaliatoryOmen,undefined);
 assert.deepEqual(b.vfx.filter(e=>['attack','damage'].includes(e.type)).map(e=>[e.type,e.side]),[['attack','e'],['damage','p'],['damage','e']]);
});

test('Présage : pas de pose sans blessure survivante, aucun déclenchement par Riposte ou sort et expiration au bon tour',()=>{
 for(const exclusion of ['barrière','mort','Silence']){
  const c=layout('mystic','e',true),{b,u,col,dir,target}=c;b.board[1][col+dir]=target;
  if(exclusion==='barrière')target.barrier=4;
  if(exclusion==='mort')target.hp=1;
  if(exclusion==='Silence')assert(applySilence(b,u));
  assert(attack(c).ok);assert.equal(target.retaliatoryOmen,undefined);assert.equal(u.retaliatoryOmenReadyRound,undefined);
 }
 const c=layout('mystic'),{b,u,col,dir}=c,target=unit('shield','e');b.board[1][col+dir]=target;
 assert(attack(c).ok);
 const contact=unit('militia','p');assert(resolveRetaliation(b,target,contact,1,col+dir,col));assert(target.retaliatoryOmen);
 b.phase='player';b.heroes.p.hand=[{id:'firebolt',wait:0}];assert(playPlayerCard(b,0,1).ok);assert(target.retaliatoryOmen);
 b.round=2;expireControl(b);assert(target.retaliatoryOmen);
 b.round=3;expireControl(b);assert.equal(target.retaliatoryOmen,undefined);
});

test('Présage : une cible par Oracle et réapplication sans cumul',()=>{
 const c=layout('mystic'),{b,u,target}=c,other=unit('militia','e');
 b.board[0][2]=target;b.board[0][3]=other;
 const result={performed:true,damaged:true,suppressed:false};
 assert(placeRetaliatoryOmen(b,u,target,result,recordCombatEvent));
 assert.equal(placeRetaliatoryOmen(b,u,other,result,recordCombatEvent),false);
 b.round=4;assert(placeRetaliatoryOmen(b,u,other,result,recordCombatEvent));
 assert.equal(target.retaliatoryOmen,undefined);assert.equal(other.retaliatoryOmen.amount,2);
});

test('Percée du Zénith : vraie Charge, déplacement dans la case libérée et piège, deux camps et géométries',()=>{
 for(const side of ['p','e'])for(const legacy of [false,true]){
  const c=layout('aetherknight',side,legacy),{b,u,col,dir,target}=c;
  const cell=col+2*dir;
  if(!legacy)assert(placeTrap(b,target.side,{lane:1,col:cell}));
  b.board[1][cell]=target;target.hp=7;target.armor=3;target.stun=99;
  assert(attack(c).ok);assert.equal(target.hp,0);assert.equal(b.board[1][cell],u);
  assert.equal(u.chargeAdvanceReadyRound,4);assert.equal(u.hp,legacy?11:8);
  assert.equal(b.vfx.filter(e=>e.type==='attack').length,1);
  assert.equal(b.vfx.filter(e=>e.type==='death'&&e.col===cell).length,1);
  assert(b.vfx.some(e=>e.chargeAdvance));assert.equal(b.traps?.length??0,0);
 }
});

test('Percée : cadence, attaque immobile et survivant excluent la seconde avancée',()=>{
 for(const exclusion of ['immobile','survie','cadence','Silence']){
  const c=layout('aetherknight'),{b,u,col,dir,target}=c;
  const adjacent=exclusion==='immobile';b.board[1][col+(adjacent?1:2)*dir]=target;
  target.hp=exclusion==='survie'?8:4;target.stun=99;
  if(exclusion==='cadence')u.chargeAdvanceReadyRound=3;
  if(exclusion==='Silence')assert(applySilence(b,u));
  assert(attack(c).ok);assert.equal(b.board[1][col+(adjacent?0:1)*dir],u);
  assert.equal(u.chargeAdvanceReadyRound,exclusion==='cadence'?3:undefined);
 }
});

test('Écho : vrai Portail puis une seule frappe vers l’avant depuis l’ancienne ligne',()=>{
 for(const side of ['p','e'])for(const legacy of [false,true]){
  const c=layout('portal_walker',side,legacy),{b,u,col,dir,target}=c;
  b.board[1][col+dir]=target;target.stun=99;target.barrier=1;
  const rear=unit('militia',target.side,{stun:99});b.board[1][col-dir]=rear;
  assert(attack(c).ok);assert.equal(target.hp,27);assert.equal(target.barrier,0);
  assert.equal(rear.hp,rear.maxhp);assert.equal(u.portalEcho,undefined);
  const strikes=b.vfx.filter(e=>e.type==='attack');assert.equal(strikes.length,1);
  assert.equal(strikes[0].lane,1);assert.equal(strikes[0].fromLane,0);
  assert.equal(b.heroes[target.side].hp,100);
 }
});

test('Écho : la cible normale garde la priorité, l’origine est validée et l’Écho expire ou se consomme',()=>{
 const c=layout('portal_walker'),{b,u,col,dir,target}=c;
 b.board[1][col+dir]=target;target.stun=99;
 const normal=unit('militia','e',{hp:30,maxhp:30,stun:99});b.board[0][col+2*dir]=normal;
 assert(attack(c).ok);assert.equal(target.hp,30);assert.equal(normal.hp,26);
 assert.deepEqual(u.portalEcho,{lane:1,col,expiresRound:2});
 testStorage();assert(storeBattle(b));const restored=restoreBattle();assert(validStoredBattle(restored));
 const corrupt=structuredClone(restored);corrupt.board[0][col+dir].portalEcho.lane=2;assert(!validStoredBattle(corrupt));
 b.board[0][col+2*dir]=null;
 assert(finishEnemyTurn(b).ok);assert(attack(c).ok);assert.equal(target.hp,26);assert.equal(u.portalEcho,undefined);
 const other=layout('portal_walker');other.b.board[1][other.col+other.dir]=other.target;
 prepareControlUnits(other.b,hooks,'p');assert(other.u.portalEcho);
 other.b.round=2;expireControl(other.b);assert.equal(other.u.portalEcho,undefined);
});

test('Écho : Transposition et Portail silencieux ne mémorisent aucune origine',()=>{
 const c=layout('portal_walker'),{b,u,col}=c;
 assert(teleportUnit(b,'p',{fromLane:1,toLane:0,col}));assert.equal(u.portalEcho,undefined);
 const quiet=layout('portal_walker');quiet.b.board[1][quiet.col+quiet.dir]=quiet.target;
 assert(applySilence(quiet.b,quiet.u));assert(attack(quiet).ok);assert.equal(quiet.u.portalEcho,undefined);
});

test('Écho : une couronne à portée conserve son attaque normale, avec Garde',()=>{
 const c=layout('portal_walker'),{b,u,col,target}=c;
 b.board[1][col]=null;b.board[0][10]=u;
 b.board[1][col+1]=target;target.stun=99;
 u.portalEcho={lane:1,col,expiresRound:2};
 const guard=unit('shield','e',{rarity:'divine',stun:99});b.board[0][9]=guard;
 assert(attack(c).ok);assert.equal(b.heroes.e.hp,100);assert(guard.hp<guard.maxhp);
 assert.equal(target.hp,30);assert(u.portalEcho);
});
