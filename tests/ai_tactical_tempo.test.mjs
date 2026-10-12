import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {freshProfile,createBattle,endPlayerTurn} from '../src/engine.js';
import {rankEnemyMoves} from '../src/ai.js';
import {rankEnemyMoves as rankBaseline} from './fixtures/ai_v210_baseline.mjs';

// Les deux heuristiques reçoivent exactement le même combat et la même graine.
const seeds=[101,203,307,409,503,607,709,811,907,1009,1103,1201];
function make(seed,kind){
 const b=createBattle(freshProfile(),CAMPAIGN[0],seed);
 for(const side of ['p','e'])Object.assign(b.heroes[side],{hand:[],deck:[],discard:[],cardsPlayed:0});
 const lane=seed%3;
 const wolf={uid:9000+seed,id:'wolf',side:'p',atk:CARDS.wolf.attack,
  hp:CARDS.wolf.hp,maxhp:CARDS.wolf.hp,armor:0,ranged:false,
  ability:CARDS.wolf.ability,stun:0,poison:0,poisonTurns:0};
 if(kind==='combo'){
  b.board[lane][3]=wolf;
  b.heroes.e.hand=[{id:'hourglass_surge',wait:0},{id:'dragon',wait:2},{id:'militia',wait:0}];
  b.aiStyle='equilibre';
 }else if(kind==='crown'){
  b.board[lane][5]=wolf;
  b.heroes.e.hp=3;b.heroes.e.shield=0;b.aiStyle='assaut';
  b.heroes.e.hand=[{id:'militia',wait:0},{id:'sanctuary',wait:0},{id:'time_bind',wait:0}];
 }
 return b;
}
test('Tactical tempo: unlock a delayed high-value unit for the second action',()=>{
 const b=make(101,'combo');
 assert.equal(rankBaseline(b)[0].id,'militia','base V2.10 joue une unité immédiate');
 assert.equal(rankEnemyMoves(b)[0].id,'hourglass_surge');
 const before=structuredClone(b);
 assert.deepEqual(rankEnemyMoves(b),rankEnemyMoves(b));
 assert.deepEqual(b,before,'l’IA ne modifie pas le combat pendant la recherche');
 endPlayerTurn(b);
 assert.ok(b.log.some(s=>s.includes('accélère une carte')),'accélération réellement jouée');
 assert.ok(b.log.some(s=>s.includes('invoque Dragon des Sept Cieux')),'deuxième carte réellement jouée');
 assert.equal(b.log.filter(s=>s.includes('Tactique adverse :')).length,2,'pas plus de deux cartes');
});
test('Tactical crown: emergency shield beats unrelated assault and slowdown',()=>{
 const b=make(203,'crown');
 assert.equal(rankBaseline(b)[0].id,'militia');
 assert.equal(rankEnemyMoves(b)[0].id,'sanctuary');
 endPlayerTurn(b);
 assert.ok(b.log.some(s=>s.includes('Sanctuaire')),'le sort défensif est utilisé');
 assert.ok(b.heroes.e.hp>0,'la couronne survit à la résolution imminente');
});
test('Tactical slowdown: no access to private player cards or deck',()=>{
 const b=make(409,'crown');
 b.heroes.e.hand=[{id:'time_bind',wait:0}];
 Object.defineProperty(b.heroes.p,'hand',{get(){throw Error('main privée consultée');}});
 Object.defineProperty(b.heroes.p,'deck',{get(){throw Error('pioche privée consultée');}});
 assert.equal(rankEnemyMoves(b).length,0,'aucune action tempo inutile en urgence mortelle');
 const quiet=make(101,'combo');
 quiet.board=quiet.board.map(row=>row.map(()=>null));
 quiet.heroes.e.hand=[{id:'time_bind',wait:0}];
 Object.defineProperty(quiet.heroes.p,'hand',{get(){throw Error('main privée consultée');}});
 Object.defineProperty(quiet.heroes.p,'deck',{get(){throw Error('pioche privée consultée');}});
 assert.equal(rankEnemyMoves(quiet)[0].id,'time_bind','le ciblage réel reste délégué au moteur');
});
test('A/B deterministe: twelve seeds per tactical objective, identical states',()=>{
 const metrics={baseline:{combo:0,crown:0},after:{combo:0,crown:0}};
 for(const kind of ['combo','crown'])for(const seed of seeds){
  const b=make(seed,kind),snapshot=structuredClone(b);
  const expected=kind==='combo'?'hourglass_surge':'sanctuary';
  if(rankBaseline(b)[0]?.id===expected)metrics.baseline[kind]++;
  assert.deepEqual(b,snapshot,'le témoin ne touche pas au scénario');
  if(rankEnemyMoves(b)[0]?.id===expected)metrics.after[kind]++;
  assert.deepEqual(b,snapshot,'la nouvelle IA ne touche pas au scénario');
 }
 console.log('IA tactique A/B (scénarios contrôlés, non taux de victoire):',JSON.stringify(metrics));
 assert.ok(metrics.after.combo>metrics.baseline.combo,JSON.stringify(metrics));
 assert.ok(metrics.after.crown>metrics.baseline.crown,JSON.stringify(metrics));
 assert.equal(metrics.after.combo,seeds.length);
 assert.equal(metrics.after.crown,seeds.length);
});
test('Last action does not pretend an acceleration grants a third card',()=>{
 const b=make(307,'combo');b.heroes.e.cardsPlayed=1;
 const choices=rankEnemyMoves(b);
 assert.equal(choices[0].id,'militia','avec une action restante on ne sacrifie pas la défense immédiate');
 assert.equal(choices.every(x=>x.index>=0&&x.index<b.heroes.e.hand.length),true);
});
