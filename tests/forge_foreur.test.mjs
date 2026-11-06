import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {freshProfile,fuseEvolutionCopies,modifyDeck,createBattle,playPlayerCard,endPlayerTurn,finishEnemyTurn,playEnemyCard} from '../src/engine.js';
import {resolveUnitDefinition} from '../src/cards/definitions.js';
import {cardPresentation} from '../src/ui/card-presentation.js';
import {hit,grantAbilityBarrier,grantSharedBarrier} from '../src/engine/battle-defense.js';
import {applySilence,canSilence} from '../src/engine/battle-control.js';
import {captureCombatFrame} from '../src/engine/combat-events.js';
import {storeBattle,restoreBattle,validStoredBattle} from '../src/ui/storage.js';
import {freshLab,setLabRarity,setLabLevel,createLabBattle} from '../src/engine/developer-lab.js';

let uid=2000;
function unit(id='militia',side='e',extra={}){
 const d=resolveUnitDefinition(id,extra.rarity);
 return {uid:uid++,id,side,rarity:d.rarity,cardRules:'cards-v2',atk:d.stats.attack,hp:d.stats.hp,maxhp:d.stats.hp,
  armor:d.abilities.armor?.amount||0,ranged:!!d.abilities.ranged,ability:CARDS[id].ability,stun:99,poison:0,poisonTurns:0,...extra};
}
function gained(){
 const p=freshProfile();p.completed=['01','02','03','04','05','06'];p.evolvedCollection={'drill:épique':3};
 const result=fuseEvolutionCopies(p,'drill:légendaire');assert.equal(result.ok,true);assert.equal(modifyDeck(p,result.target,1),true);
 const b=createBattle(p,{...CAMPAIGN[0],deck:[],hp:100},11,{turnFlow:'alternating'});
 for(const h of Object.values(b.heroes))Object.assign(h,{hp:100,maxhp:100,hand:[],deck:[],discard:[]});
 b.heroes.p.hand=[{...result.target,wait:0}];assert(playPlayerCard(b,0,0,1).ok);
 return {p,b,u:b.board[0][1]};
}
function strike(b,u,barrier=10,armor=0){
 for(const row of b.board)row.fill(null);
 const col=u.side==='p'?1:10,other=u.side==='p'?'e':'p',target=unit('militia',other,{hp:30,maxhp:30,barrier,armor});
 b.board[0][col]=u;b.board[0][col+(u.side==='p'?1:-1)]=target;
 if(u.side==='p'){b.phase='player';endPlayerTurn(b);}else{b.phase='enemy';finishEnemyTurn(b);}
 return target;
}
function storage(){const data={};globalThis.localStorage={getItem:k=>data[k]??null,setItem:(k,v)=>{data[k]=String(v)},removeItem:k=>{delete data[k]}};}

test('Foreur fusionné : 3/7/1 et Armure 2 hérités, unique Foreuse validée et aucun rang futur inventé',()=>{
 const epic=resolveUnitDefinition('drill','épique'),d=resolveUnitDefinition('drill','légendaire');
 assert.deepEqual(d.stats,epic.stats);assert.deepEqual(d.geometry,epic.geometry);
 assert.deepEqual(d.abilities,{...epic.abilities,barrierDrill:{amount:2,period:3}});
 const {p,u}=gained();assert.equal(p.evolvedCollection['drill:légendaire'],1);assert.deepEqual([u.atk,u.maxhp,u.armor],[3,7,2]);
 for(const id of ['spark','aetherknight'])assert.equal(resolveUnitDefinition(id,'éveillée'),null);
});

test('Foreuse avant frappe : retire seulement la barrière, puis Armure et barrière restante protègent normalement',()=>{
 for(const barrier of [1,2,5,10])for(const armor of [0,2,5]){
  const {b,u}=gained();b.vfx=[];const target=strike(b,u,barrier,armor);
  const afterDrill=barrier-Math.min(barrier,2),normal=Math.max(1,3-armor);
  assert.equal(target.barrier,Math.max(0,afterDrill-normal));assert.equal(target.hp,30-Math.max(0,normal-afterDrill));
  assert.equal(u.barrierDrillReadyRound,4);assert.equal(u.atk,3);
  const effect=b.vfx.find(e=>e.barrierRemoved);assert.equal(effect.barrierRemoved,Math.min(barrier,2));
  assert.equal(effect.frame.board[0][2].barrier,afterDrill);assert.equal(effect.frame.board[0][2].hp,30);
  assert.equal(b.vfx.filter(e=>e.type==='attack'&&!e.riposte).length,1);
 }
});

test('Aucune barrière éligible : aucun quota dépensé ; première activation possible au tour suivant',()=>{
 const {b,u}=gained();strike(b,u,0);assert.equal(u.barrierDrillReadyRound,undefined);
 b.round=2;const target=strike(b,u,10);assert.equal(target.barrier,5);assert.equal(u.barrierDrillReadyRound,5);
});

test('Cadence sauvegardée : retrait aux tours 1 et 4, attaques normales seules aux tours 2 et 3',()=>{
 const {b,u}=gained();assert.equal(strike(b,u).barrier,5);assert.equal(u.barrierDrillReadyRound,4);
 for(const round of [2,3]){b.round=round;assert.equal(strike(b,u).barrier,7);assert.equal(u.barrierDrillReadyRound,4);}
 storage();assert(storeBattle(b));const copy=restoreBattle(),r=copy.board[0][1];copy.round=4;
 assert.equal(strike(copy,r).barrier,5);assert.equal(r.barrierDrillReadyRound,7);
});

test('Silence supprime Foreuse, conserve Armure 2 et ne dépense pas la cadence',()=>{
 const {b,u}=gained();assert(canSilence(b,u));assert(applySilence(b,u,1));
 assert.equal(strike(b,u).barrier,7);assert.equal(u.barrierDrillReadyRound,undefined);assert.equal(u.armor,2);
 b.round=2;assert.equal(strike(b,u).barrier,5);assert.equal(u.barrierDrillReadyRound,5);
 assert.equal(canSilence(b,unit('drill','p')),false,'sélection native inchangée');
});

test('Attaque réduite à zéro : aucune destruction de barrière ni consommation du pouvoir',()=>{
 for(const penalty of [false,true]){
  const {b,u}=gained();if(penalty)u.attackPenalty={amount:3,remaining:1,minimum:0};else u.atk=0;
  const target=strike(b,u);assert.equal(target.barrier,10);assert.equal(target.hp,30);assert.equal(u.barrierDrillReadyRound,undefined);
 }
});

test('Couronne, dégâts directs de sort et poison : pas de Foreuse ni de destruction de bouclier de couronne',()=>{
 const {b,u}=gained();b.board[0][1]=null;b.board[0][10]=u;b.heroes.e.shield=10;endPlayerTurn(b);
 assert.equal(b.heroes.e.shield,7);assert.equal(u.barrierDrillReadyRound,undefined);
 const direct=gained(),target=unit('militia','e',{barrier:10});direct.b.board[0][2]=target;hit(direct.b,target,3,'p');
 assert.equal(target.barrier,7);assert.equal(direct.u.barrierDrillReadyRound,undefined);
 const poison=gained();poison.u.stun=99;const poisoned=unit('militia','e',{hp:10,maxhp:10,barrier:10,poison:1,poisonTurns:1});poison.b.board[1][5]=poisoned;
 poison.b.phase='enemy';finishEnemyTurn(poison.b);assert.equal(poisoned.barrier,10);assert.equal(poison.u.barrierDrillReadyRound,undefined);
});

test('Gardien réel interceptant une attaque de couronne : sa barrière est préparée avant les dégâts, sans modifier Garde',()=>{
 const {b,u}=gained();b.board[0][1]=null;b.board[0][10]=u;
 const guard=unit('shield','e',{rarity:'divine',hp:30,maxhp:30,barrier:5});b.board[0][9]=guard;b.heroes.e.shield=8;
 endPlayerTurn(b);assert.equal(guard.barrier,2);assert.equal(guard.hp,30);assert.equal(u.barrierDrillReadyRound,4);
 assert.equal(b.heroes.e.shield,8);assert.ok(b.log.some(s=>s.includes('intercepte')));
});

test('Barrières de plusieurs origines : consommation commune et instantanés antérieurs conservés',()=>{
 const {b,u}=gained(),target=unit('militia','e',{hp:30,maxhp:30,armor:2});
 grantAbilityBarrier(target,'healBarrier',{amount:2,cap:2});grantAbilityBarrier(target,'arrivalBarrier',{amount:2,cap:2});grantSharedBarrier(target,6,10);
 b.board[0][2]=target;b.vfx=[];const before=captureCombatFrame(b),text=JSON.stringify(before);
 endPlayerTurn(b);assert.equal(target.barrier,7);assert.equal(target.hp,30);
 assert.equal(target.abilityBarriers.healBarrier,0);assert.equal(target.abilityBarriers.arrivalBarrier,1);
 assert.equal(JSON.stringify(before),text);
 const state=b.vfx.find(e=>e.barrierRemoved);assert.equal(state.frame.board[0][2].abilityBarriers.arrivalBarrier,2);
 assert.equal(u.barrierDrillReadyRound,4);
});

test('Même pouvoir aux deux camps et quatre niveaux du laboratoire, sans effet sur la progression',()=>{
 for(const side of ['p','e'])for(const level of [0,1,2,3]){
  const lab=freshLab();setLabRarity(lab,side,'drill','légendaire');setLabLevel(lab,side,'drill',level);const before=structuredClone(lab),b=createLabBattle(lab,11);
  b.heroes[side].hand=[{id:'drill',wait:0}];if(side==='e')b.phase='enemy';assert((side==='p'?playPlayerCard(b,0,0,1):playEnemyCard(b)).ok);
  const u=b.board.flat().find(x=>x?.id==='drill'&&x.side===side),target=strike(b,u);
  assert.equal(target.barrier,10-2-u.atk);assert.equal(u.barrierDrillReadyRound,4);assert.deepEqual(lab,before);
 }
});

test('Intention simultanée déjà préparée : sa frappe garde ses paramètres même si le Foreur vient de mourir',()=>{
 const {b}=gained();delete b.turnFlow;for(const row of b.board)row.fill(null);
 const attacker=unit('militia','p',{atk:10,hp:30,maxhp:30,barrier:10,stun:0}),drill=unit('drill','e',{rarity:'légendaire',hp:1,stun:0});
 b.board[0][3]=attacker;b.board[0][4]=drill;endPlayerTurn(b);
 assert.equal(drill.hp,0);assert.equal(attacker.barrier,5);assert.equal(drill.barrierDrillReadyRound,4);assert.equal(b.board[0][4],null);
});

test('Reprise : quota facultatif préservé et valeurs invalides refusées, sans migration du profil',()=>{
 const {p,b,u}=gained(),profile=structuredClone(p);storage();storeBattle(b);assert.deepEqual(restoreBattle(),b);assert.equal(Object.hasOwn(u,'barrierDrillReadyRound'),false);
 strike(b,u);storeBattle(b);assert.deepEqual(restoreBattle(),b);assert.deepEqual(p,profile);
 for(const value of [null,-1,0,1.5,Infinity,101]){
  const bad=structuredClone(b);bad.board[0][1].barrierDrillReadyRound=value;assert.equal(validStoredBattle(bad),false,String(value));
 }
});

test('Fiches Foreur : capacité et limites dérivées du registre, fusion et rangs futurs explicites',()=>{
 const view=cardPresentation({id:'drill',rarity:'légendaire'});
 assert.match(view.card.description,/Foreuse : barrière −2/);assert.match(view.card.description,/Armure 2/);
 for(const text of ['Foreuse d’acier','avant les dégâts','2 points','3 tours','Aucun dégât supplémentaire aux PV'])assert.ok(view.details.join(' ').includes(text),text);
 assert.match(view.availability,/fusion/i);assert.equal(cardPresentation({id:'spark',rarity:'éveillée'}).known,false);
});

test('Export autonome : préparation de barrière exécutée depuis les modules réellement embarqués',()=>{
 const script=readFileSync(new URL('../JOUER.html',import.meta.url),'utf8').match(/<script>\n([\s\S]*)<\/script>/)[1],context={structuredClone};
 new Script(script.replace("__load('src/app.js');","globalThis.api=__load('src/engine.js');")).runInNewContext(context);
 const e=context.api,p=e.freshProfile();p.evolvedCollection={'drill:légendaire':1};p.deck[0]={id:'drill',rarity:'légendaire'};
 const b=e.createBattle(p,{id:'offline',name:'Hors ligne',enemy:'Test',hp:100,difficulty:1,deck:[]},11,{turnFlow:'alternating'});
 b.heroes.p.hand=[{id:'drill',rarity:'légendaire',wait:0}];assert(e.playPlayerCard(b,0,0,1).ok);
 const u=b.board[0][1];b.board[0][2]=unit('militia','e',{hp:30,maxhp:30,barrier:5});e.endPlayerTurn(b);
 assert.equal(b.board[0][2].barrier,0);assert.equal(b.board[0][2].hp,30);assert.equal(u.barrierDrillReadyRound,4);
});
