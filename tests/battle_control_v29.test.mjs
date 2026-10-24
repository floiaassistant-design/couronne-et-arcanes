import {createBattle} from './fixtures/legacy-battle.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CARDS,CAMPAIGN,CLASS_SKILLS,towerMission} from '../src/data.js';
import {freshProfile,normalizeProfile,playPlayerCard,endPlayerTurn,modifyDeck,validateDeck,fuseCard,buyPack} from '../src/engine.js';
import {rankEnemyMoves} from '../src/ai.js';
import {TEMPO_IDS} from '../src/engine/tempo.js';
import {CONTROL_IDS,silenced,applySilence,teleportDestinationError,teleportPlan,trapPlan,placeTrap,expireControl} from '../src/engine/battle-control.js';
import {storeBattle,restoreBattle,SAVE_KEY,BATTLE_KEY} from '../src/ui/storage.js';
const unit=(id,side,uid,extras={})=>({uid,id,side,hp:20,maxhp:20,atk:2,armor:0,ranged:CARDS[id].ability==='ranged',ability:CARDS[id].ability,stun:0,poison:0,poisonTurns:0,...extras});
function combat(id='seal_silence'){
 const b=createBattle(freshProfile(),CAMPAIGN[0],11);
 for(const side of ['p','e'])Object.assign(b.heroes[side],{hand:[],deck:[],discard:[],hp:100,maxhp:100});
 b.heroes.p.hand=[{id,wait:0}];return b;
}
function storage(){
 const cache=new Map();globalThis.localStorage={getItem:k=>cache.get(k)??null,setItem:(k,v)=>cache.set(k,v),removeItem:k=>cache.delete(k)};return cache;
}
test('V2.9 conserve les cartes V2.8 hors délais approuvés, ainsi que campagne et Tour',()=>{
 const baseline=JSON.parse(readFileSync(new URL('./fixtures/catalogue_v28.json',import.meta.url)));
 // Garder le snapshot historique et toutes ses caractéristiques.
 // Seuls les anciens délais 0 sont intentionnellement normalisés à 1.
 const expectedCards=Object.fromEntries(Object.entries(baseline.cards).map(([id,card])=>[
  id,{...card,delay:Math.max(1,card.delay)}
 ]));
 assert.deepEqual(Object.fromEntries(Object.entries(CARDS).filter(([id])=>!CONTROL_IDS.includes(id)&&!TEMPO_IDS.includes(id))),expectedCards);
 assert.deepEqual(CAMPAIGN,baseline.campaign);
 assert.deepEqual(Array.from({length:20},(_,i)=>towerMission(i+1)),baseline.tower);
 assert.equal(Object.keys(CARDS).length,76);assert.equal(Object.keys(CLASS_SKILLS).length,8);
});
test('V2.9 silence selects dangerous ability deterministically, and rejects empty/passive targets',()=>{
 const b=combat();const initial=JSON.stringify(b);
 for(const lane of [-1,3,NaN,.5])assert.equal(playPlayerCard(b,0,lane).ok,false);
 assert.equal(playPlayerCard(b,0,0).ok,false);assert.equal(JSON.stringify(b),initial);
 b.board[0][3]=unit('ranger','e',7,{armor:2});
 assert.equal(playPlayerCard(b,0,0).ok,false);
 b.board[0][4]=unit('lich','e',8);assert.equal(playPlayerCard(b,0,0).ok,true);
 assert.equal(b.board[0][4].silenceUntil,2);assert.equal(b.board[0][3].silenceUntil,undefined);
});
test('V2.9 silence lasts two resolutions, expires and guarantees one recovery turn',()=>{
 const b=combat(),u=unit('lich','e',2);b.board[0][3]=u;
 assert.equal(playPlayerCard(b,0,0).ok,true);assert.equal(silenced(b,u),true);
 endPlayerTurn(b);assert.equal(b.round,2);assert.equal(silenced(b,u),true);
 assert.equal(applySilence(b,u,2),false);
 endPlayerTurn(b);assert.equal(b.round,3);assert.equal(silenced(b,u),false);assert.equal(u.silenceUntil,undefined);
 assert.equal(applySilence(b,u,2),false);
 endPlayerTurn(b);assert.equal(applySilence(b,u,99),true);assert.equal(u.silenceUntil,5);
});
for(const ability of ['poison','splash','lifesteal','pierce'])test(`V2.9 silence suppresses ${ability} while normal attacks persist`,()=>{
 const b=combat(),p=unit('militia','p',1,{hp:30,maxhp:30,armor:2}),e=unit('lich','e',2,{ability});
 b.board[0][2]=p;b.board[0][3]=e;b.board[0][1]=unit('smith','p',3,{stun:3});
 b.heroes.e.hp=80;
 applySilence(b,e,1);endPlayerTurn(b);
 assert.equal(p.hp,29);assert.equal(p.poisonTurns,0);assert.equal(b.board[0][1].hp,20);assert.equal(b.heroes.e.hp,80);
});
test('V2.9 silence suppresses support and haste, preserves armor/range/guard/formation and existing poison',()=>{
 const b=combat();b.round=3;
 const healer=unit('cleric','e',2),hurt=unit('militia','e',3,{hp:8});
 b.board[0][5]=healer;b.board[0][4]=hurt;applySilence(b,healer,1);
 const banner=unit('banner','e',4);b.board[1][5]=banner;b.board[1][4]=unit('militia','e',5);applySilence(b,banner,1);
 const wolf=unit('wolf','p',6);b.board[2][1]=wolf;applySilence(b,wolf,1);
 hurt.poison=1;hurt.poisonTurns=1;endPlayerTurn(b);
 assert.equal(hurt.hp,7);assert.equal(banner.atk,2);assert.equal(b.board[1].find(u=>u?.uid===5).atk,2);
 assert.equal(b.board[2][2],wolf);assert.equal(wolf.atk,2);
 const passive=combat();const guard=unit('graveknight','e',8,{armor:2,ranged:true,silenceUntil:1});
 passive.board[0][3]=guard;passive.board[0][2]=unit('militia','p',9);endPlayerTurn(passive);
 assert.equal(guard.armor,2);assert.equal(guard.ranged,true);
});
test('V2.9 silence disables Charge and Riposte without changing base statistics',()=>{
 const b=combat();b.board[0][1]=unit('wolf','p',1,{silenceUntil:1});b.board[0][3]=unit('shield','e',2,{stun:3});
 endPlayerTurn(b);assert.equal(b.board[0][3].hp,18);assert.equal(b.board[0][2].atk,2);
 const r=combat();r.board[0][2]=unit('militia','p',3);r.board[0][3]=unit('shield','e',4,{silenceUntil:1});
 endPlayerTurn(r);assert.equal(r.board[0][2].hp,18); // Normal attack, no extra retaliation.
});
test('V2.9 silence retains flying, guard interception, armor and dynamic Concorde',()=>{
 const flight=combat();flight.heroes.p.hand=[];
 const flyer=unit('griffin','p',1,{silenceUntil:1});flight.board[0][1]=flyer;flight.board[0][2]=unit('militia','p',2,{stun:2});
 endPlayerTurn(flight);assert.equal(flight.board[0][3],flyer);
 const b=combat();b.heroes.p.hand=[];
 const guard=unit('sentinel','e',3,{armor:2,silenceUntil:1});
 b.board[0][3]=guard;b.board[0][1]=unit('ironwraith','e',4,{stun:2});b.board[0][5]=unit('archer','p',5);
 endPlayerTurn(b);assert.equal(b.heroes.e.hp,100);assert.equal(guard.hp,19);assert.equal(guard.armor,2);assert.equal(guard.atk,2);
});
test('V2.9 Inquisitor and Trapper have bounded cooldown and obey silence/stun',()=>{
 const b=combat('mist_inquisitor');b.board[0][4]=unit('lich','e',2,{stun:5});
 playPlayerCard(b,0,0);const inquisitor=b.board[0][1];endPlayerTurn(b);
 assert.equal(inquisitor.controlReadyRound,4);assert.equal(b.board[0][4].silenceGuardUntil,2);
 endPlayerTurn(b);assert.equal(inquisitor.controlReadyRound,4);
 const t=combat('sylvan_trapper');playPlayerCard(t,0,0);const trapper=t.board[0][1];endPlayerTurn(t);
 assert.equal(t.traps.length,1);assert.equal(trapper.controlReadyRound,4);
 const blocked=combat('sylvan_trapper');playPlayerCard(blocked,0,0);blocked.board[0][1].silenceUntil=1;endPlayerTurn(blocked);assert.equal(blocked.traps,undefined);
});
test('V2.9 teleport is lateral, chooses frontmost eligible ally and never reaches crown',()=>{
 const b=combat('transposition');b.board[0][2]=unit('militia','p',1);b.board[1][3]=unit('wolf','p',2);b.board[0][5]=unit('ranger','p',3);
 assert.equal(teleportPlan(b,'p',2).u.uid,2);
 assert.equal(playPlayerCard(b,0,2).ok,true);assert.equal(b.board[2][3].uid,2);assert.equal(b.board[1][3],null);
 assert.equal(b.board[0][5].uid,3);assert.equal(b.board.flat().filter(u=>u?.uid===2).length,1);
 assert.equal(teleportDestinationError(b,'p',0,5,1).length>0,true);
 assert.equal(teleportDestinationError(b,'p',0,6,1).length>0,true);
});
test('V2.9 teleport rejects occupied/invalid/same lane destinations and repeated teleport',()=>{
 const b=combat('transposition');b.board[0][2]=unit('militia','p',1);b.board[1][2]=unit('golem','e',2);
 assert.equal(playPlayerCard(b,0,1).ok,false);assert.equal(b.heroes.p.cardsPlayed,0);
 assert.match(teleportDestinationError(b,'p',0,2,0),/autre/);
 assert.match(teleportDestinationError(b,'p',0,2,3),/valide/);
 playPlayerCard(b,0,2);b.heroes.p.hand=[{id:'transposition',wait:0}];
 assert.equal(playPlayerCard(b,0,0).ok,false);assert.equal(b.heroes.p.hand.length,1);
 const enemy=combat();enemy.board[0][1]=unit('militia','e',3);
 assert.equal(teleportPlan(enemy,'e',2),null);
});
test('V2.9 Portal Walker chooses a useful public position once every three rounds',()=>{
 const b=combat();b.heroes.p.hand=[];
 const walker=unit('portal_walker','p',1,{hp:5,maxhp:5});b.board[0][2]=walker;b.board[0][3]=unit('golem','e',2,{atk:9});
 b.vfx=[];endPlayerTurn(b);
 assert.equal(walker.controlReadyRound,4);assert.equal(walker.teleportedRound,1);
 assert.equal(b.vfx.filter(e=>e.type==='teleport').length,1);assert.equal(b.board[0].includes(walker),false);
 const muted=combat();const w=unit('portal_walker','p',3,{silenceUntil:1});muted.board[0][2]=w;muted.board[0][3]=unit('golem','e',4,{atk:9});endPlayerTurn(muted);
 assert.equal(w.teleportedRound,undefined);
});
test('V2.9 rune trap triggers once on entry, uses armor/barrier/kill accounting',()=>{
 const b=combat('rune_trap');assert.equal(playPlayerCard(b,0,0).ok,true);
 assert.deepEqual(b.traps[0],{owner:'p',lane:0,col:3,kind:'rune',damage:3,stun:0,expiresRound:3});
 b.board[0][4]=unit('golem','e',1,{armor:2,barrier:1});endPlayerTurn(b);
 assert.equal(b.traps.length,0);const u=b.board[0].find(u=>u?.uid===1);assert.equal(u.hp,20);assert.equal(u.barrier,0);
 const lethal=combat('rune_trap');playPlayerCard(lethal,0,0);lethal.board[0][4]=unit('militia','e',2,{hp:2});endPlayerTurn(lethal);
 assert.equal(lethal.board.flat().some(u=>u?.uid===2),false);assert.equal(lethal.stats.playerKills,1);
});
test('V2.9 snare stops haste and attack for this resolution; allied entry never consumes a trap',()=>{
 const b=combat();b.heroes.p.hand=[];placeTrap(b,'p',{lane:0,col:3},'snare');
 const wolf=unit('wolf','e',1);b.board[0][4]=wolf;endPlayerTurn(b);
 assert.equal(b.board[0][3],wolf);assert.equal(wolf.hp,19);assert.equal(wolf.stun,0);assert.equal(b.traps.length,0);
 const allied=combat();placeTrap(allied,'p',{lane:1,col:2});allied.board[1][1]=unit('militia','p',2);endPlayerTurn(allied);
 assert.equal(allied.traps.length,1);
});
test('V2.9 teleport entry triggers enemy trap, flying over it does not',()=>{
 const b=combat('transposition');placeTrap(b,'e',{lane:1,col:2},'snare');b.board[0][2]=unit('militia','p',1);
 playPlayerCard(b,0,1);assert.equal(b.board[1][2].hp,19);assert.equal(b.board[1][2].stun,1);assert.equal(b.traps.length,0);
 const flight=combat();flight.heroes.p.hand=[];placeTrap(flight,'e',{lane:0,col:2});
 flight.board[0][1]=unit('griffin','p',2);flight.board[0][2]=unit('militia','p',3,{stun:2});endPlayerTurn(flight);
 assert.equal(flight.traps.length,1);assert.equal(flight.board[0][4].uid,2);
});
test('V2.9 traps are capped, reject occupied terrain and expire after three resolutions',()=>{
 const b=combat('rune_trap');b.board[0][3]=unit('militia','p',1,{stun:5});
 assert.equal(trapPlan(b,'p',0).col,2);placeTrap(b,'p',{lane:0,col:2});placeTrap(b,'p',{lane:1,col:3});
 const before=JSON.stringify(b);assert.equal(playPlayerCard(b,0,2).ok,false);assert.equal(JSON.stringify(b),before);
 endPlayerTurn(b);assert.equal(b.traps.length,2);endPlayerTurn(b);assert.equal(b.traps.length,2);endPlayerTurn(b);assert.equal(b.traps.length,0);
 assert.equal(placeTrap(b,'p',{lane:4,col:3}),false);assert.equal(placeTrap(b,'p',{lane:0,col:6}),false);
});
test('V2.9 persisted battle retains trap owner/expiry, silence and teleport cooldown',()=>{
 storage();const b=combat();b.board[0][2]=unit('wolf','p',1);applySilence(b,b.board[0][2],2);
 b.board[0][2].teleportedRound=1;b.board[0][2].controlReadyRound=4;placeTrap(b,'e',{lane:1,col:3});
 storeBattle(b);const restored=restoreBattle();assert.deepEqual(restored,b);
 endPlayerTurn(restored);assert.equal(restored.round,2);assert.equal(restored.traps[0].owner,'e');assert.equal(restored.board[0][3].silenceUntil,2);
});
test('V2.9 old profile and battle load without new properties or progression reset',()=>{
 const cache=storage();const p=freshProfile();delete p.mastery;delete p.talents;p.gold=345;p.shards=222;p.wins=8;
 const loaded=normalizeProfile(JSON.parse(JSON.stringify(p)));assert.equal(loaded.gold,345);assert.equal(loaded.shards,222);assert.equal(loaded.wins,8);assert.deepEqual(loaded.deck,p.deck);
 const b=combat();delete b.heroTalents;cache.set(BATTLE_KEY,JSON.stringify(b));const restored=restoreBattle();endPlayerTurn(restored);
 assert.equal(restored.round,2);assert.equal(restored.traps,undefined);assert.equal(SAVE_KEY,'couronnes_arcanes_v1');
});
for(const id of CONTROL_IDS)test(`V2.9 ${id} obtainable by earned resources and usable in decks`,()=>{
 const p=freshProfile();p.gold=1000;p.shards=1000;const old=[p.gold,p.shards];
 assert.equal(fuseCard(p,id).ok,true);assert.ok(p.gold<old[0]&&p.shards<old[1]);assert.equal(p.collection[id],1);
 assert.equal(modifyDeck(p,id,1),true);assert.equal(validateDeck(p),'');assert.equal(normalizeProfile(JSON.parse(JSON.stringify(p))).collection[id],1);
 const roll=CARDS[id].rarity==='commun'?.1:.8;
 const pool=Object.values(CARDS).filter(c=>!c.heroClass&&c.rarity===CARDS[id].rarity),pick=(pool.findIndex(c=>c.id===id)+.1)/pool.length;
 let n=0;assert.ok(buyPack(p,()=>n++%2===0?roll:pick).cards.includes(id));
});
test('V2.9 AI prioritizes useful silence and does not waste it on passive or already silenced units',()=>{
 const b=combat();b.heroes.p.hand=[];b.heroes.e.hand=[{id:'seal_silence',wait:0}];b.board[2][3]=unit('lich','p',1);
 assert.equal(rankEnemyMoves(b)[0].lane,2);endPlayerTurn(b);assert.equal(b.heroes.e.cardsPlayed,0);assert.equal(silenced(b,b.board[2].find(u=>u?.uid===1)),true);
 assert.equal(rankEnemyMoves(b).length,0);
 const passive=combat();passive.heroes.e.hand=[{id:'seal_silence',wait:0}];passive.board[0][2]=unit('ranger','p',2);assert.equal(rankEnemyMoves(passive).length,0);
});
test('V2.9 AI uses lateral teleport for advantage and saves it when no benefit',()=>{
 const b=combat();b.heroes.p.hand=[];b.heroes.e.hand=[{id:'transposition',wait:0}];
 b.board[0][4]=unit('militia','e',1,{hp:3});b.board[0][3]=unit('golem','p',2,{atk:8});
 assert.equal(rankEnemyMoves(b)[0].id,'transposition');assert.notEqual(rankEnemyMoves(b)[0].lane,0);
 endPlayerTurn(b);assert.equal(b.board[0].some(u=>u?.uid===1),false);
 const empty=combat();empty.heroes.e.hand=[{id:'transposition',wait:0}];empty.board[0][4]=unit('militia','e',3);assert.equal(rankEnemyMoves(empty).length,0);
});
test('V2.9 AI places traps ahead of an approaching threat and avoids empty/overloaded lanes',()=>{
 const b=combat();b.heroes.e.hand=[{id:'rune_trap',wait:0}];assert.equal(rankEnemyMoves(b).length,0);
 b.board[1][1]=unit('militia','p',1);assert.equal(rankEnemyMoves(b)[0].lane,1);endPlayerTurn(b);
 assert.equal(b.traps[0].owner,'e');assert.equal(b.traps[0].lane,1);
});
test('V2.9 AI is pure, reproducible and cannot read player hidden information',()=>{
 const b=combat();b.heroes.e.hand=CONTROL_IDS.map(id=>({id,wait:0}));b.board[0][2]=unit('lich','p',1);
 const before=JSON.stringify(b),moves=rankEnemyMoves(b);assert.deepEqual(rankEnemyMoves(b),moves);assert.equal(JSON.stringify(b),before);
 for(const key of ['hand','deck','discard'])Object.defineProperty(b.heroes.p,key,{get(){throw Error('Private player cards accessed');}});
 assert.deepEqual(rankEnemyMoves(b),moves);
});
for(const id of ['mist_inquisitor','portal_walker','sylvan_trapper'])test(`V2.9 AI deploys ${id} and triggers its useful ability`,()=>{
 const b=combat();b.heroes.p.hand=[];b.heroes.e.hand=[{id,wait:0}];
 b.board[0][3]=unit('lich','p',50,{atk:2});b.vfx=[];
 if(id==='portal_walker'){b.board[0][3]=null;b.board[0][4]=unit('lich','p',50,{atk:8});}
 assert.equal(rankEnemyMoves(b)[0].id,id);endPlayerTurn(b);
 assert.ok(b.board.flat().some(u=>u?.side==='e'&&u.id===id));
 const event=id==='mist_inquisitor'?'silence':id==='portal_walker'?'teleport':'trap-place';
 assert.ok(b.vfx.some(e=>e.type===event),id);
});
test('V2.9 all six control cards obey delay and the two action limit',()=>{
 for(const id of CONTROL_IDS){
  const b=combat(id);b.heroes.p.hand[0].wait=1;
  const before=JSON.stringify(b);assert.equal(playPlayerCard(b,0,0).ok,false);assert.equal(JSON.stringify(b),before);
  b.heroes.p.hand[0].wait=0;b.heroes.p.cardsPlayed=2;
  const capped=JSON.stringify(b);assert.equal(playPlayerCard(b,0,0).ok,false);assert.equal(JSON.stringify(b),capped);
 }
});
test('V2.9 silence does not suppress hero V2.8 skills, rally or barriers already applied',()=>{
 const b=combat('skill_guard_wall');const u=unit('wolf','p',1,{silenceUntil:2,rallyUntil:2});b.board[0][2]=u;
 assert.equal(playPlayerCard(b,0,0).ok,true);assert.equal(u.barrier,2);assert.equal(u.rallyUntil,2);assert.equal(silenced(b,u),true);
});
