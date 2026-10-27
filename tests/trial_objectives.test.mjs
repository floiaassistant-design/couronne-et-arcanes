import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {freshProfile,createEvolutionTrial,createBattle,playPlayerCard,endPlayerTurn,finishEnemyTurn,settleEvolutionTrial} from '../src/engine.js';
import {trialObjectiveState,recordTrialTurn} from '../src/engine/trial-objectives.js';
import {hit} from '../src/engine/battle-defense.js';
import {storeBattle,restoreBattle,validStoredBattle} from '../src/ui/storage.js';

function trial(id){
 const p=freshProfile();p.completed=['01','02','03'];
 if(id==='aube-militia-epic'){p.completedTrials=['aube-militia-rare'];p.evolvedCollection={'militia:rare':1};p.collection.militia--;p.deck[0]={id:'militia',rarity:'rare'};}
 const b=createEvolutionTrial(p,id,1).battle;b.heroes.e.deck=[];b.heroes.e.hand=[];b.heroes.e.hp=b.heroes.e.maxhp=200;
 return {p,b};
}
function ally(b,id,lane=0,col=1,rarity){
 b.heroes.p.hand=[{id,wait:0,...(rarity?{rarity}:{})}];b.heroes.p.cardsPlayed=0;b.phase='player';
 assert.equal(playPlayerCard(b,0,lane,1).ok,true);
 const u=b.board[lane][1];b.board[lane][1]=null;b.board[lane][col]=u;return u;
}
function enemy(b,id,lane,col,hp=100,atk=0){
 const c=CARDS[id],u={uid:b.nextUnitId++,id,side:'e',hp,maxhp:hp,atk,armor:0,ability:c.ability,ranged:c.ability==='ranged',stun:0,poison:0,poisonTurns:0};
 b.board[lane][col]=u;return u;
}
function persist(b){
 const cache={};globalThis.localStorage={getItem:k=>cache[k]??null,setItem:(k,v)=>{cache[k]=String(v)},removeItem:k=>{delete cache[k]}};
 assert.equal(storeBattle(b),true);const copy=restoreBattle();assert.ok(copy);return copy;
}

test('Milicien : trois tours réels, aucun second comptage, quotas et objectif sauvegardés',()=>{
 const {b}=trial('aube-militia-rare'),u=ally(b,'militia');
 assert.equal(trialObjectiveState(b).value,0);endPlayerTurn(b);
 assert.equal(trialObjectiveState(b).value,1);assert.equal(endPlayerTurn(b).ok,false);recordTrialTurn(b);
 assert.equal(trialObjectiveState(b).value,1);finishEnemyTurn(b);
 const copy=persist(b);assert.deepEqual(copy.trialChallenge,b.trialChallenge);
 for(let i=0;i<2;i++){endPlayerTurn(copy);finishEnemyTurn(copy);}
 assert.equal(trialObjectiveState(copy).achieved,true);assert.equal(copy.trialChallenge.counts[u.uid],3);
 const before=structuredClone(copy);trialObjectiveState(copy);assert.deepEqual(copy,before);
});

test('Un mort ou une nouvelle invocation ne reprend pas les exploits du précédent exemplaire',()=>{
 const {p,b}=trial('aube-militia-rare'),u=ally(b,'militia');
 for(let i=0;i<3;i++){endPlayerTurn(b);finishEnemyTurn(b);}
 assert.equal(trialObjectiveState(b).achieved,true);
 const row=b.board.find(r=>r.includes(u));row[row.indexOf(u)]=null;
 const next=ally(b,'militia');assert.notEqual(next.uid,u.uid);assert.equal(trialObjectiveState(b).value,0);
 b.status='victory';b.phase='finished';const before=structuredClone(p);
 assert.equal(settleEvolutionTrial(p,b).evolved,false);assert.deepEqual(p,before);
});

test('Porte-égide natif : seules les vraies interceptions de couronne comptent',()=>{
 const {b}=trial('aube-shield-rare'),u=ally(b,'shield',0,3);enemy(b,'archer',0,2,100,2);
 for(let i=0;i<2;i++){endPlayerTurn(b);finishEnemyTurn(b);}
 assert.equal(b.heroes.p.hp,26);assert.equal(b.trialChallenge.counts[u.uid],2);assert.equal(trialObjectiveState(b).achieved,true);
 const direct=trial('aube-shield-rare').b,guard=ally(direct,'shield',0,3);enemy(direct,'militia',0,4,100,2);
 endPlayerTurn(direct);finishEnemyTurn(direct);
 assert.ok(guard.hp<guard.maxhp);assert.equal(trialObjectiveState(direct).value,0);
});

test('Arbalétrière : dégâts effectifs à deux cases, surdégâts plafonnés et contact exclu',()=>{
 const {b}=trial('aube-archer-rare'),u=ally(b,'archer',0,5);const foe=enemy(b,'militia',0,7,1);foe.stun=20;
 endPlayerTurn(b);assert.equal(b.trialChallenge.counts[u.uid],1);assert.equal(foe.hp,0);
 const close=trial('aube-archer-rare').b;ally(close,'archer',0,5);enemy(close,'militia',0,6);
 endPlayerTurn(close);assert.equal(trialObjectiveState(close).value,0);
});

test('Deux arbalétrières vivantes ne peuvent pas additionner leurs compteurs',()=>{
 const {p,b}=trial('aube-archer-rare');
 for(let lane=0;lane<2;lane++){ally(b,'archer',lane,5);enemy(b,'militia',lane,7);}
 endPlayerTurn(b);assert.deepEqual(Object.values(b.trialChallenge.counts),[2,2]);
 assert.equal(trialObjectiveState(b).value,2);assert.equal(trialObjectiveState(b).achieved,false);
 b.status='victory';b.phase='finished';const before=structuredClone(p);
 assert.equal(settleEvolutionTrial(p,b).evolved,false);assert.deepEqual(p,before);
});

test('Milicien Rare : vraie réduction initiale, reprise et survie du même exemplaire',()=>{
 const {p,b}=trial('aube-militia-epic'),u=ally(b,'militia',0,1,'rare');
 hit(b,u,1,'p');assert.equal(trialObjectiveState(b).achieved,false);
 const before=u.hp;hit(b,u,1,'e');assert.equal(u.hp,before);assert.equal(trialObjectiveState(b).achieved,true);
 const copy=persist(b);assert.equal(trialObjectiveState(copy).achieved,true);
 copy.status='victory';copy.phase='finished';assert.equal(settleEvolutionTrial(p,copy).evolved,true);
});

test('Anciens combats : objectif original conservé et aucune attribution avant victoire',()=>{
 const {p,b}=trial('aube-shield-rare');delete b.trialChallenge;ally(b,'shield');
 const raw=structuredClone(b);assert.equal(trialObjectiveState(b).legacy,true);assert.deepEqual(b,raw);
 assert.equal(settleEvolutionTrial(p,b).ok,false);b.status='victory';b.phase='finished';
 assert.equal(settleEvolutionTrial(p,b).evolved,true);
 const normal=createBattle(freshProfile(),CAMPAIGN[0],1),before=structuredClone(normal);
 assert.equal(trialObjectiveState(normal),null);recordTrialTurn(normal);assert.deepEqual(normal,before);
});

test('Sauvegarde : objectifs inconnus, compteurs invalides et détournements de mode refusés',()=>{
 const {b}=trial('aube-militia-rare');assert.equal(validStoredBattle(b),true);
 for(const patch of [{version:2},{metric:'inventé'},{target:0},{counts:[]},{counts:{1:-1}},{counts:{1:1.5}},{counts:{'01':3}},{lastRound:b.round+1}]){
  const copy=structuredClone(b);Object.assign(copy.trialChallenge,patch);assert.equal(validStoredBattle(copy),false,JSON.stringify(patch));
  assert.equal(trialObjectiveState(copy).achieved,false);
 }
 const copy=structuredClone(b);copy.mode='campaign';assert.equal(validStoredBattle(copy),false);
});

test('Un réglage sauvegardé garde son objectif et son seuil, sans lecture de la recette courante',()=>{
 const {b}=trial('aube-militia-rare');ally(b,'militia');b.trialChallenge.target=4;b.trialChallenge.text='Objectif enregistré au départ.';
 for(let i=0;i<3;i++){endPlayerTurn(b);finishEnemyTurn(b);}
 const copy=persist(b),before=structuredClone(copy),state=trialObjectiveState(copy);
 assert.equal(state.text,'Objectif enregistré au départ.');assert.equal(state.target,4);assert.equal(state.value,3);assert.equal(state.achieved,false);
 assert.deepEqual(copy,before);
});
