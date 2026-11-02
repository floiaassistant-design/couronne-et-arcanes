import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {CARD_RULESET,resolveUnitDefinition} from '../src/cards/definitions.js';
import {contiguousSplashTargets} from '../src/engine/unit-targets.js';
import {freshProfile,createBattle,endPlayerTurn,finishEnemyTurn} from '../src/engine.js';

let uid=9200;
const unit=(id='militia',side='e',rarity=CARDS[id].rarity,extra={})=>{
 const d=resolveUnitDefinition(id,rarity);
 return {uid:uid++,id,side,rarity,atk:d.stats.attack,hp:d.stats.hp,maxhp:d.stats.hp,
  armor:d.abilities.armor?.amount||0,ranged:!!d.abilities.ranged,ability:CARDS[id].ability,
  stun:0,poison:0,poisonTurns:0,cardRules:CARD_RULESET,...extra};
};
function battle(legacy=false){
 const b=createBattle(freshProfile(),{...CAMPAIGN[0],deck:[],hp:100},23,{turnFlow:'alternating',legacy});
 for(const h of Object.values(b.heroes))Object.assign(h,{hp:100,maxhp:100,hand:[],deck:[],discard:[]});
 b.vfx=[];
 return b;
}
const enemy=(side='e',extra={})=>unit('militia',side,'commun',{hp:20,maxhp:20,stun:99,...extra});

test('Impact : une seule cible secondaire adjacente devant, ni arrière ni saut ni autre ligne',()=>{
 const b=battle(),source=unit('bomb','p'),primary=enemy(),adjacent=enemy('e',{armor:2}),
  far=enemy(),behind=enemy(),otherLane=enemy();
 b.board[0][3]=source;b.board[0][4]=primary;b.board[0][5]=adjacent;b.board[0][7]=far;
 b.board[0][2]=behind;b.board[1][5]=otherLane;
 endPlayerTurn(b);
 assert.equal(primary.hp,20-source.atk);
 assert.equal(adjacent.hp,19,'2 dégâts bruts moins 2 Armure : 1 PV minimum');
 assert.equal(far.hp,20);assert.equal(behind.hp,20);assert.equal(otherLane.hp,20);
 assert.equal(b.vfx.some(x=>x.type==='damage'&&x.lane===0&&x.col===5),true,'effet visuel sur la vraie cible');
});
test('Impact : sans ennemi sur la case immédiatement derrière, aucune onde',()=>{
 const b=battle(),source=unit('elemental','p'),primary=enemy(),far=enemy();
 b.board[0][3]=source;b.board[0][4]=primary;b.board[0][6]=far;
 endPlayerTurn(b);
 assert.equal(primary.hp,20-source.atk);assert.equal(far.hp,20);
});
test('Impact : sens de frappe inversé pour le camp adverse',()=>{
 const b=battle(),source=unit('tempest','e'),primary=enemy('p'),adjacent=enemy('p',{barrier:2}),
  gap=enemy('p'),behind=enemy('p');
 b.board[0][8]=source;b.board[0][7]=primary;b.board[0][6]=adjacent;b.board[0][4]=gap;b.board[0][9]=behind;
 b.phase='enemy';finishEnemyTurn(b);
 assert.equal(primary.hp,20-source.atk);assert.equal(adjacent.hp,20);
 assert.equal(adjacent.barrier,0,'barrière absorbe les 2 dégâts secondaires');
 assert.equal(gap.hp,20);assert.equal(behind.hp,20);
});
test('Impact : Liche Éveillée conserve deux cibles secondaires, obligatoirement contiguës',()=>{
 const b=battle(),source=unit('lich','p','éveillée'),primary=enemy(),second=enemy('e',{armor:2}),
  third=enemy('e',{barrier:3}),fourth=enemy();
 b.board[0][3]=source;b.board[0][4]=primary;b.board[0][5]=second;b.board[0][6]=third;b.board[0][7]=fourth;
 endPlayerTurn(b);
 assert.equal(primary.hp,14);assert.equal(second.hp,19);assert.equal(third.hp,20);assert.equal(third.barrier,0);
 assert.equal(fourth.hp,20,'jamais de quatrième cible');
});
test('Impact : la chaîne s’arrête sur une case alliée, morte, vide ou la couronne',()=>{
 const b=battle(),front=enemy(),ally=unit('militia','p'),dead=enemy('e',{hp:0});
 b.board[0][4]=front;b.board[0][5]=ally;b.board[0][6]=enemy();
 assert.deepEqual(contiguousSplashTargets(b,0,3,4,'p',2),[]);
 b.board[0][5]=dead;assert.deepEqual(contiguousSplashTargets(b,0,3,4,'p',2),[]);
 b.board[0][5]=null;assert.deepEqual(contiguousSplashTargets(b,0,3,4,'p',2),[]);
 b.board[0][9]=front;b.board[0][10]=enemy();
 assert.equal(contiguousSplashTargets(b,0,8,9,'p',2).length,1);
 assert.deepEqual(contiguousSplashTargets(b,0,8,10,'p',2),[]);
 assert.deepEqual(contiguousSplashTargets(b,1,3,4,'p',2),[]);
 assert.deepEqual(contiguousSplashTargets(b,0,6,4,'p',2),[],'cible principale derrière attaquant');
});
test('Impact : les anciennes grilles de 5 cases gardent le même contrat',()=>{
 const b=battle(true),primary=enemy(),second=enemy(),third=enemy();
 b.board[0][2]=primary;b.board[0][3]=second;b.board[0][5]=third;
 assert.deepEqual(contiguousSplashTargets(b,0,1,2,'p',2).map(x=>x.col),[3]);
 assert.deepEqual(contiguousSplashTargets(b,0,5,3,'e',2).map(x=>x.col),[2]);
});
