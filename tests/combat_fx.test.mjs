import test from 'node:test';
import assert from 'node:assert/strict';
import {freshProfile,createBattle,endPlayerTurn,playEnemyCard,finishEnemyTurn,playPlayerCard} from '../src/engine.js';
import {CAMPAIGN} from '../src/data.js';
import {captureCombatFrame,recordCombatEvent} from '../src/engine/combat-events.js';
import {buildCombatSteps,frameChanges} from '../src/ui/combat-steps.js';
const make=()=>{
 const b=createBattle(freshProfile(),CAMPAIGN[0],71,{turnFlow:'alternating'});
 for(const h of Object.values(b.heroes))Object.assign(h,{hp:100,maxhp:100,hand:[],deck:[],discard:[]});
 return b;
};
const unit=(uid,side,extra={})=>({uid,id:'militia',side,atk:4,hp:8,maxhp:8,armor:0,barrier:0,ranged:false,ability:'none',stun:0,poison:0,poisonTurns:0,...extra});
const publicBattle=b=>{const {vfx,...rest}=b;return rest;};

test('Les événements enrichis ne changent aucun résultat, graine ou décision adverse',()=>{
 for(const legacy of [false,true])for(const seed of [1,71,198]){
  const a=createBattle(freshProfile(),CAMPAIGN[0],seed,legacy?{}:{turnFlow:'alternating'}),b=structuredClone(a);b.vfx=[];
  for(let n=0;n<5&&a.status==='active';n++){
   endPlayerTurn(a);endPlayerTurn(b);
   if(!legacy&&a.status==='active'){
    while(!playEnemyCard(a).done){}while(!playEnemyCard(b).done){}
    finishEnemyTurn(a);finishEnemyTurn(b);
   }
   assert.deepEqual(publicBattle(b),a);
  }
 }
});
test('L’attaque affiche les PV perdus après armure et barrière, sans gonfler un coup fatal',()=>{
 const b=make();b.board[0][4]=unit(1,'p',{atk:9});b.board[0][5]=unit(2,'e',{hp:2,armor:2,barrier:3});
 const before=captureCombatFrame(b);b.vfx=[];endPlayerTurn(b);
 const damage=b.vfx.find(e=>e.type==='damage');assert.equal(damage.damage,2);assert.equal(damage.absorbed,3);assert.equal(damage.armor,2);
 const steps=buildCombatSteps(b.vfx,before,captureCombatFrame(b)),attack=steps.find(e=>e.type==='attack');
 assert.match(attack.label,/−2 PV/);assert.match(attack.label,/−3 protection/);assert.match(attack.label,/armure : 2/);
 assert.equal(attack.frame.board[0][5].hp,0);assert.equal(steps.find(e=>e.type==='death').frame.board[0][5],null);
 assert.equal(before.board[0][5].hp,2,'la cible existe encore avant la lecture');
});
test('La riposte précède ses dégâts dans le flux et reste une action distincte',()=>{
 const b=make();b.board[0][4]=unit(1,'p');b.board[0][5]=unit(2,'e',{id:'shield',hp:20,maxhp:20});
 b.vfx=[];endPlayerTurn(b);
 const riposte=b.vfx.findIndex(e=>e.type==='attack'&&e.riposte);
 assert.ok(riposte>=0);assert.equal(b.vfx[riposte+1].type,'damage');assert.equal(b.vfx[riposte+1].side,'p');
});
test('Les instantanés sont indépendants, publics et préservent le contrat des anciens événements',()=>{
 const b=make();b.board[0][1]=unit(1,'p');b.vfx=[];
 recordCombatEvent(b,{type:'spawn',lane:0,col:1});const e=b.vfx[0];
 assert.deepEqual(e,{type:'spawn',lane:0,col:1});assert.equal(e.frame.heroes.p.hand,undefined);assert.equal(e.frame.heroes.p.deck,undefined);
 b.board[0][1].hp=1;b.heroes.p.hp=1;assert.equal(e.frame.board[0][1].hp,8);assert.equal(e.frame.heroes.p.hp,100);
});
test('La lecture conserve toutes les actions au-delà de l’ancienne limite de 28',()=>{
 const b=make(),before=captureCombatFrame(b);b.vfx=[];
 for(let n=0;n<100;n++)recordCombatEvent(b,{type:'silence',lane:0,col:1});
 assert.equal(buildCombatSteps(b.vfx,before,captureCombatFrame(b)).length,100);
});
test('Une couronne protégée montre séparément protection et vrais PV perdus',()=>{
 const b=make();b.board[0][10]=unit(1,'p',{atk:6});b.heroes.e.hp=2;b.heroes.e.shield=3;
 const before=captureCombatFrame(b);b.vfx=[];endPlayerTurn(b);
 const damage=b.vfx.find(e=>e.type==='hero-damage');assert.equal(damage.damage,2);assert.equal(damage.absorbed,3);
 const step=buildCombatSteps(b.vfx,before,captureCombatFrame(b)).find(e=>e.type==='attack');
 assert.match(step.label,/Couronne adverse : −2 PV, −3 protection/);assert.equal(b.status,'victory');
});
test('Un déplacement interligne n’invente pas de soin ; les soins partiels restent exacts',()=>{
 const b=make();b.board[0][3]=unit(1,'p',{hp:7});const before=captureCombatFrame(b);
 b.board[1][3]=b.board[0][3];b.board[0][3]=null;
 assert.deepEqual(frameChanges(before,captureCombatFrame(b)),[]);
 b.board[1][3].hp=8;assert.deepEqual(frameChanges(before,captureCombatFrame(b)).map(c=>c.hp),[1]);
});
test('Une invocation ne copie aucune main privée dans ses instantanés',()=>{
 const b=make();b.heroes.p.hand=[{id:'militia',wait:0}];b.vfx=[];playPlayerCard(b,0,0,1);
 assert.ok(b.vfx[0].frame.board[0][1]);assert.deepEqual(Object.keys(b.vfx[0].frame.heroes.p),['hp','shield']);
});
