import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CARDS,CAMPAIGN,CLASS_SKILLS,towerMission} from '../src/data.js';
import {freshProfile,createBattle,playPlayerCard,endPlayerTurn,usePower,formationBonus} from '../src/engine.js';
import {laneCount,lastCell,crownColumn,entryColumn,supportedBoard} from '../src/engine/board.js';
import {applySilence,teleportPlan,teleportDestinationError,placeTrap,trapPlan} from '../src/engine/battle-control.js';
import {rankEnemyMoves,inspectEnemyLane} from '../src/ai.js';
import {storeBattle,restoreBattle,storedBattleNeedsRestart,BATTLE_KEY} from '../src/ui/storage.js';
import {arenaBackdrop} from '../src/ui/arena-art.js';
const unit=(id,side,uid,extra={})=>({uid,id,side,atk:CARDS[id].attack,hp:20,maxhp:20,armor:CARDS[id].ability==='armor'?2:0,ranged:CARDS[id].ability==='ranged',ability:CARDS[id].ability,stun:0,poison:0,poisonTurns:0,...extra});
function combat(lanes=2){
 const b=createBattle(freshProfile(),{...CAMPAIGN[0],boss:lanes===4,difficulty:lanes===3?3:1},211);
 for(const h of Object.values(b.heroes)){h.hp=100;h.maxhp=100;h.hand=[];h.deck=[];h.discard=[];}
 return b;
}
function play(b,id,lane){b.heroes.p.cardsPlayed=0;b.heroes.p.hand=[{id,wait:0}];return playPlayerCard(b,0,lane);}
function storage(){const cache={};globalThis.localStorage={getItem:k=>cache[k]??null,setItem:(k,v)=>cache[k]=v,removeItem:k=>delete cache[k]};return cache;}

test('V2.11 every campaign, tower and dungeon selects ten playable cells',async()=>{
 const {dungeonStageMission,DUNGEONS,dungeonBonusMission}=await import('../src/dungeons.js');
 const missions=[...CAMPAIGN,...Array.from({length:20},(_,i)=>towerMission(i+1)),...DUNGEONS.flatMap(d=>d.stages.map((_,i)=>dungeonStageMission(d.id,i))),dungeonBonusMission('ysara',1)];
 for(const m of missions){
  const b=createBattle(freshProfile(),m,211);
  assert.equal(lastCell(b),10,m.id);assert.equal(laneCount(b),m.boss?4:m.difficulty>=3?3:2,m.id);
  assert.ok(supportedBoard(b.board));assert.equal(entryColumn(b,'e'),10);assert.equal(crownColumn(b,'e'),11);
 }
});
for(const lanes of [2,3,4]){
 test(`V2.11 ${lanes}×10 validates all lanes and deploys both sides at the edges`,()=>{
  const b=combat(lanes);assert.equal(play(b,'militia',lanes-1).ok,true);
  assert.equal(b.board[lanes-1][1].side,'p');
  b.heroes.e.hand=[{id:'militia',wait:0}];endPlayerTurn(b);
  assert.ok(b.board.some(row=>row[9]?.side==='e'));
  for(const l of [-1,lanes,1.5]){const state=JSON.stringify(b);assert.equal(playPlayerCard(b,0,l).ok,false);assert.equal(JSON.stringify(b),state);}
  assert.ok(b.board.every(row=>row[0]===null&&row[11]===null));
 });
 test(`V2.11 ${lanes}×10 movement visits cells 6–10 and attacks the actual crown`,()=>{
  const b=combat(lanes),u=unit('militia','p',1);b.board[lanes-1][5]=u;
  for(let col=6;col<=10;col++){endPlayerTurn(b);assert.equal(b.board[lanes-1][col],u);if(col<10)assert.equal(b.heroes.e.hp,100);}
  assert.equal(b.heroes.e.hp,100-u.atk);assert.equal(b.board[lanes-1][11],null);
  const mirror=combat(lanes),e=unit('militia','e',2);mirror.board[lanes-1][7]=e;
  for(let col=6;col>=1;col--){endPlayerTurn(mirror);assert.equal(mirror.board[lanes-1][col],e);}
  assert.equal(mirror.heroes.p.hp,100-e.atk);
 });
 test(`V2.11 ${lanes}×10 ranged attack, Garde and sweep work at the far edge`,()=>{
  const b=combat(lanes);b.board[lanes-1][9]=unit('archer','p',1,{stun:0});b.board[lanes-1][4]=unit('shield','e',2,{stun:2});
  const hp=b.board[lanes-1][4].hp;endPlayerTurn(b);assert.equal(b.heroes.e.hp,98);assert.equal(b.board[lanes-1][4].hp,hp,'gardien dépassé : aucune interception');
  const sweep=combat(lanes);sweep.board[lanes-1][10]=unit('bone','e',3,{hp:2,poison:2,poisonTurns:1});endPlayerTurn(sweep);assert.equal(sweep.board[lanes-1][10],null);
 });
 test(`V2.11 ${lanes}×10 silence, teleport and terrain work in the final lane`,()=>{
  const b=combat(lanes),lane=lanes-1;b.board[lane][8]=unit('lich','e',1,{stun:4});
  assert.equal(play(b,'seal_silence',lane).ok,true);assert.equal(b.board[lane][8].silenceUntil,2);
  b.board[0][7]=unit('wolf','p',2);assert.equal(play(b,'transposition',lane).ok,true);
  assert.equal(b.board[lane][7].uid,2);assert.equal(b.board[0][7],null);
  b.board[lane][7]=null;assert.ok(placeTrap(b,'p',{lane,col:7}));endPlayerTurn(b);
  // L'ennemi immobilisé n'arrive pas encore ; expiration indépendante du nombre de cases.
  endPlayerTurn(b);endPlayerTurn(b);assert.equal(b.traps.length,0);assert.equal(b.board[lane].find(u=>u?.uid===1).silenceUntil,undefined);
  const t=combat(lanes);placeTrap(t,'p',{lane,col:8});t.board[lane][9]=unit('militia','e',3);endPlayerTurn(t);
  assert.equal(t.board[lane][8].hp,17);assert.equal(t.traps.length,0);
 });
 test(`V2.11 ${lanes}×10 teleport forbids crowns, occupied cells and duplicate use`,()=>{
  const b=combat(lanes);b.board[0][10]=unit('militia','p',1);assert.equal(teleportPlan(b,'p',1),null);
  b.board[0][9]=unit('militia','p',2);b.board[1][9]=unit('militia','e',3);
  assert.match(teleportDestinationError(b,'p',0,9,1),/occupée/);b.board[1][9]=null;
  assert.equal(play(b,'transposition',1).ok,true);assert.equal(teleportPlan(b,'p',0),null);
  assert.match(teleportDestinationError(b,'p',1,9,lanes),/valide/);
 });
 test(`V2.11 ${lanes}×10 all eight class skills remain playable`,()=>{
  for(const id of Object.keys(CLASS_SKILLS)){
   const b=combat(lanes),lane=lanes-1;b.heroClass=CARDS[id].heroClass;
   b.board[lane][7]=unit('militia','p',1,{hp:6});b.board[lane][8]=unit('wolf','e',2);b.heroes.p.deck=['militia','shield'];
   assert.equal(play(b,id,lane).ok,true,id);
  }
 });
 test(`V2.11 ${lanes}×10 hero powers and Concorde cover every lane`,()=>{
  const b=combat(lanes);b.heroClass='rodeur';
  for(let lane=0;lane<lanes;lane++){b.board[lane][8]=unit('militia','e',lane);b.board[lane][9]=unit('banner','e',lane+10);assert.equal(formationBonus(b,lane,b.board[lane][8]),1);}
  assert.equal(usePower(b).ok,true);for(const row of b.board)assert.equal(row[8].hp,18);
  const c=combat(lanes);c.heroClass='clerc';for(let lane=0;lane<lanes;lane++)c.board[lane][8]=unit('militia','p',lane,{hp:6});
  usePower(c);for(const row of c.board)assert.equal(row[8].hp,9);
 });
 test(`V2.11 ${lanes}×10 AI finds the true crown threat and avoids expiring distant traps`,()=>{
  const b=combat(lanes);b.board[lanes-1][9]=unit('wolf','p',1);b.heroes.e.hand=[{id:'firebolt',wait:0}];
  assert.ok(inspectEnemyLane(b,lanes-1).urgency>=12);assert.equal(rankEnemyMoves(b)[0].lane,lanes-1);
  b.board[lanes-1][9]=null;b.board[lanes-1][1]=unit('militia','p',2);b.heroes.e.hand=[{id:'rune_trap',wait:0}];
  assert.equal(rankEnemyMoves(b).length,0);b.board[lanes-1][1]=null;b.board[lanes-1][4]=unit('militia','p',2);assert.equal(rankEnemyMoves(b)[0].lane,lanes-1);
  const before=rankEnemyMoves(b);for(const key of ['hand','deck','discard'])Object.defineProperty(b.heroes.p,key,{get(){throw Error('Hidden cards read');}});assert.deepEqual(rankEnemyMoves(b),before);
 });
 test(`V2.11 ${lanes}×10 saves all coordinates and effects without VFX`,()=>{
  const cache=storage(),b=combat(lanes);b.board[lanes-1][9]=unit('lich','p',1);applySilence(b,b.board[lanes-1][9],2);placeTrap(b,'e',{lane:lanes-1,col:8});b.vfx=[{type:'teleport'}];
  storeBattle(b);assert.equal(JSON.parse(cache[BATTLE_KEY]).vfx,undefined);const restored=restoreBattle();assert.equal(lastCell(restored),10);assert.equal(restored.board[lanes-1][9].silenceUntil,2);assert.deepEqual(restored.traps,b.traps);
  endPlayerTurn(restored);assert.equal(restored.round,2);
 });
 test(`V2.11 ${lanes}×10 haste, Vol, Charge and Riposte work beyond column five`,()=>{
  const b=combat(lanes),lane=lanes-1,wolf=unit('wolf','p',1);b.board[lane][6]=wolf;
  endPlayerTurn(b);assert.equal(b.board[lane][8],wolf);
  const f=combat(lanes),flyer=unit('griffin','p',2);f.board[lane][7]=flyer;f.board[lane][8]=unit('militia','p',3,{stun:2});
  endPlayerTurn(f);assert.equal(f.board[lane][10],flyer); // Vol puis deuxième pas de Hâte.
  const c=combat(lanes);c.board[lane][6]=unit('wolf','p',4);c.board[lane][8]=unit('shield','e',5,{stun:2});
  endPlayerTurn(c);assert.equal(c.board[lane][8].hp,20-(CARDS.wolf.attack+2-2));
  const r=combat(lanes);r.board[lane][7]=unit('militia','p',6);r.board[lane][8]=unit('shield','e',7);
  endPlayerTurn(r);assert.equal(r.board[lane][8].lastRiposteRound,1);assert.equal(r.board[lane][7].hp,18);
 });
 test(`V2.11 ${lanes}×10 control creatures trigger on the far columns and final lane`,()=>{
  const b=combat(lanes),lane=lanes-1;b.board[lane][8]=unit('mist_inquisitor','p',1);b.board[lane][9]=unit('lich','e',2,{stun:3});b.vfx=[];
  endPlayerTurn(b);assert.ok(b.vfx.some(e=>e.type==='silence'&&e.lane===lane&&e.col===9));
  const p=combat(lanes),walker=unit('portal_walker','p',3,{hp:3});p.board[lane][8]=walker;p.board[lane][9]=unit('golem','e',4,{atk:30});p.vfx=[];
  endPlayerTurn(p);assert.ok(p.vfx.some(e=>e.type==='teleport'&&e.fromLane===lane));assert.ok(walker.hp>0);
  const t=combat(lanes);t.board[lane][7]=unit('sylvan_trapper','p',5);t.board[lane][9]=unit('militia','e',6);t.vfx=[];
  endPlayerTurn(t);assert.ok(t.vfx.some(e=>e.type==='trap-place'&&e.lane===lane&&e.col===8));assert.equal(t.board[lane].find(u=>u?.uid===5).controlReadyRound,4);
 });
}
test('V2.11 authentic old V2.4 save requests restart without changing its 3×5 snapshot',()=>{
 const entries=JSON.parse(readFileSync(new URL('./fixtures/refactor_baseline_v24.json',import.meta.url)));
 const b=JSON.parse(entries.find(e=>JSON.parse(e.battle).status==='active').battle);storage();storeBattle(b);
 const before=JSON.stringify(b);assert.equal(restoreBattle(),null);assert(storedBattleNeedsRestart());assert.equal(lastCell(b),5);assert.equal(laneCount(b),3);assert.equal(endPlayerTurn(b).ok,false);assert.equal(JSON.stringify(b),before);
});
test('V2.11 corrupt and ragged boards are rejected without touching the profile',()=>{
 const cache=storage(),b=combat();b.board[1].pop();cache.couronnes_arcanes_v1='profile stays intact';cache[BATTLE_KEY]=JSON.stringify(b);assert.equal(restoreBattle(),null);assert.equal(cache.couronnes_arcanes_v1,'profile stays intact');
});
test('V2.11 le fond des sauvegardes historiques reste autonome et déterministe',()=>{
 assert.equal(arenaBackdrop(),arenaBackdrop());assert.match(arenaBackdrop(),/^data:image\/svg\+xml,/);
});
