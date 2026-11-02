import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {freshProfile,createBattle,endPlayerTurn,finishEnemyTurn} from '../src/engine.js';
import {resolveUnitDefinition} from '../src/cards/definitions.js';
import {splashSecondaryTargets} from '../src/engine/unit-targets.js';

const makeBoard=(width=10,lanes=3)=>({board:Array.from({length:lanes},()=>Array(width+2).fill(null))});
let serial=2000;
function unit(id,side,options={}){
 const d=resolveUnitDefinition(id,options.rarity);
 assert.ok(d,id);
 const maxhp=options.maxhp??30;
 return {uid:serial++,id,side,rarity:d.rarity,atk:d.stats.attack,hp:options.hp??maxhp,
  maxhp,armor:options.armor??0,barrier:options.barrier??0,ranged:d.geometry.range>1,
  ability:CARDS[id].ability,stun:0,poison:0,poisonTurns:0};
}
function battle(legacy=false){
 const b=createBattle(freshProfile(),{...CAMPAIGN[0],deck:[],hp:100},55,{legacy,turnFlow:'alternating'});
 for(const h of Object.values(b.heroes))Object.assign(h,{hp:100,maxhp:100,deck:[],discard:[],hand:[],cardsPlayed:0});
 b.vfx=[];
 return b;
}

test('Impact : direction, contact strict, trous, alliés, limites et deux camps sur les deux plateaux',()=>{
 for(const width of [5,10])for(const side of ['p','e']){
  const dir=side==='p'?1:-1,source=side==='p'?1:width,primary=source+dir;
  const b=makeBoard(width);
  const first=unit('bone',side==='p'?'e':'p'),second=unit('bone',first.side);
  b.board[0][primary]=first;b.board[0][primary+dir]=second;
  const locate=(count=1)=>splashSecondaryTargets(b,0,source,primary,side,count).map(x=>x.col);
  assert.deepEqual(locate(),[primary+dir]);
  assert.deepEqual(locate(2),[primary+dir]);
  assert.deepEqual(splashSecondaryTargets(b,0,primary+dir,primary,side,2),[],
    'aucune cible derrière l’attaquant');
  b.board[0][primary+dir]=null;
  const farther=primary+2*dir;
  if(farther>=1&&farther<=width)b.board[0][farther]=second;
  assert.deepEqual(locate(2),[],'pas de saut au-dessus d’une case vide');
  b.board[0][primary+dir]=unit('militia',side);
  assert.deepEqual(locate(2),[],'pas de traversée alliée');
  b.board[0][primary+dir]=second;
  second.hp=0;assert.deepEqual(locate(2),[],'aucun mort visé');
  second.hp=30;
  if(farther>=1&&farther<=width)b.board[0][farther]=unit('bone',first.side);
  assert.deepEqual(locate(2),[primary+dir,farther].filter(x=>x>=1&&x<=width));
  assert.deepEqual(splashSecondaryTargets(b,1,source,primary,side,2),[],'aucune autre ligne');
 }
});

test('Les cinq natifs à Impact suivent le même ciblage moteur et leurs dégâts restent bruts',()=>{
 for(const id of ['lich','bomb','elemental','dragon','tempest']){
  const b=battle(),attacker=unit(id,'p'),primary=unit('bone','e'),secondary=unit('bone','e'),far=unit('bone','e');
  b.board[0][3]=attacker;b.board[0][4]=primary;b.board[0][5]=secondary;b.board[0][7]=far;
  assert.equal(endPlayerTurn(b).ok,true,id);
  assert.equal(primary.hp,30-attacker.atk,id+' : cible principale');
  assert.equal(secondary.hp,28,id+' : impact contigu');
  assert.equal(far.hp,30,id+' : aucun ennemi éloigné');
  assert.ok(b.vfx.some(v=>v.type==='damage'&&v.side==='e'&&v.lane===0&&v.col===5&&v.damage===2),id+' : dégât animé sur cible réelle');
 }
});

test('Impact : ennemi derrière le tireur, trou, armure et barrière ; aucune frappe de couronne secondaire',()=>{
 for(const kind of ['behind','gap','armor','barrier','crown']){
  const b=battle(),attacker=unit('elemental','p'),primary=unit('bone','e'),second=unit('bone','e');
  if(kind==='crown'){
   b.board[0][10]=attacker;b.board[0][9]=second;
   assert.equal(endPlayerTurn(b).ok,true);
   assert.equal(second.hp,30,'aucun splash quand la couronne est la cible principale');
   assert.equal(b.heroes.e.hp,95);
   continue;
  }
  b.board[0][3]=attacker;b.board[0][4]=primary;
  if(kind==='behind')b.board[0][2]=second;
  if(kind==='gap')b.board[0][6]=second;
  if(kind==='armor'){second.armor=2;b.board[0][5]=second;}
  if(kind==='barrier'){second.barrier=2;b.board[0][5]=second;}
  assert.equal(endPlayerTurn(b).ok,true);
  assert.equal(second.hp,kind==='armor'?29:kind==='barrier'?30:30,kind);
  if(kind==='barrier')assert.equal(second.barrier,0);
 }
});

test('L’Impact garde la direction du camp ennemi, sans cible choisie derrière le tireur',()=>{
 const b=battle(),attacker=unit('tempest','e'),primary=unit('bone','p'),
  secondary=unit('bone','p'),distant=unit('bone','p');
 b.phase='enemy';b.board[0][8]=attacker;b.board[0][7]=primary;b.board[0][6]=secondary;b.board[0][4]=distant;
 assert.equal(finishEnemyTurn(b).ok,true);
 assert.equal(primary.hp,27);assert.equal(secondary.hp,28);assert.equal(distant.hp,30);
});

test('Apocalypse de Minuit : deux cibles seulement si consécutives derrière la première, sans saut',()=>{
 for(const separated of [false,true]){
  const b=battle(),attacker=unit('lich','p',{rarity:'éveillée'}),main=unit('bone','e'),
   second=unit('bone','e'),third=unit('bone','e');
  b.board[0][3]=attacker;b.board[0][4]=main;b.board[0][5]=second;b.board[0][separated?7:6]=third;
  assert.equal(endPlayerTurn(b).ok,true);
  assert.equal(main.hp,24);assert.equal(second.hp,27);
  assert.equal(third.hp,separated?30:27);
 }
});

test('L’Impact reste possible si le coup principal tue sa cible, sans nouvelle attaque',()=>{
 const b=battle(),attacker=unit('tempest','p'),primary=unit('bone','e',{hp:1}),
  secondary=unit('bone','e');
 b.board[0][3]=attacker;b.board[0][4]=primary;b.board[0][5]=secondary;
 assert.equal(endPlayerTurn(b).ok,true);
 assert.equal(primary.hp,0);assert.equal(secondary.hp,28);
 assert.equal(b.stats.playerKills,1);
 const attacks=b.vfx.filter(v=>v.type==='attack'&&v.side==='p'&&v.lane===0);
 assert.equal(attacks.length,1,'Impact est un effet, pas une seconde attaque');
});
