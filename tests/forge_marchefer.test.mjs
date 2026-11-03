import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {freshProfile,fuseEvolutionCopies,modifyDeck,createBattle,playPlayerCard,endPlayerTurn,finishEnemyTurn,playEnemyCard} from '../src/engine.js';
import {resolveUnitDefinition} from '../src/cards/definitions.js';
import {cardPresentation} from '../src/ui/card-presentation.js';
import {hit,resolveRetaliation} from '../src/engine/battle-defense.js';
import {applySilence,canSilence} from '../src/engine/battle-control.js';
import {resolveUnitArrival} from '../src/engine/unit-support.js';
import {recordCombatEvent} from '../src/engine/combat-events.js';
import {storeBattle,restoreBattle,validStoredBattle} from '../src/ui/storage.js';
import {freshLab,setLabRarity,createLabBattle} from '../src/engine/developer-lab.js';

let uid=1000;
function unit(id='militia',side='e',extra={}){
 const d=resolveUnitDefinition(id);
 return {uid:uid++,id,side,rarity:d.rarity,cardRules:'cards-v2',atk:d.stats.attack,hp:d.stats.hp,maxhp:d.stats.hp,
  armor:d.abilities.armor?.amount||0,ranged:!!d.abilities.ranged,ability:CARDS[id].ability,stun:99,poison:0,poisonTurns:0,...extra};
}
function gained(){
 const p=freshProfile();p.completed=['01','02','03','04','05','06'];p.evolvedCollection={'ironwraith:épique':3};
 const result=fuseEvolutionCopies(p,'ironwraith:légendaire');assert.equal(result.ok,true);assert.equal(modifyDeck(p,result.target,1),true);
 const b=createBattle(p,{...CAMPAIGN[0],deck:[],hp:100},11,{turnFlow:'alternating'});
 for(const h of Object.values(b.heroes))Object.assign(h,{hp:100,maxhp:100,hand:[],deck:[],discard:[]});
 b.heroes.p.hand=[{...result.target,wait:0}];assert(playPlayerCard(b,0,0,1).ok);
 return {p,b,u:b.board[0][1]};
}
function strike(b,u,hp=1,extra={}){
 for(const row of b.board)row.fill(null);
 const col=u.side==='p'?1:10,other=u.side==='p'?'e':'p',target=unit('militia',other,{hp,maxhp:Math.max(5,hp),...extra});
 b.board[0][col]=u;b.board[0][col+(u.side==='p'?1:-1)]=target;
 if(u.side==='p'){b.phase='player';endPlayerTurn(b);}else{b.phase='enemy';finishEnemyTurn(b);}
 return target;
}
function storage(){const data={};globalThis.localStorage={getItem:k=>data[k]??null,setItem:(k,v)=>{data[k]=String(v)},removeItem:k=>{delete data[k]}};}

test('Marchefer Légendaire fusionné : 3/9/1, Protection héritée et unique pouvoir additionnel validé',()=>{
 const epic=resolveUnitDefinition('ironwraith','épique'),d=resolveUnitDefinition('ironwraith','légendaire');
 assert.deepEqual(d.stats,epic.stats);assert.deepEqual(d.geometry,epic.geometry);
 assert.deepEqual(d.abilities,{...epic.abilities,strikeWard:{amount:2,cap:20,period:3,requiresKill:true}});
 const {p,b,u}=gained();assert.equal(p.evolvedCollection['ironwraith:légendaire'],1);
 assert.deepEqual([u.atk,u.maxhp,b.heroes.p.shield],[3,9,3]);
 resolveUnitArrival(b,u,0,1,{emit:recordCombatEvent});assert.equal(b.heroes.p.shield,3,'Protection ne se rejoue pas');
 for(const rank of ['divine','éveillée'])assert.equal(resolveUnitDefinition('golem',rank),null);
});

test('Véritable élimination par attaque normale : +2 bouclier, sans second coup ni modification ATQ/PV',()=>{
 const {b,u}=gained();b.vfx=[];const victim=strike(b,u);
 assert.equal(victim.hp,0);assert.deepEqual([b.heroes.p.shield,u.strikeWardReadyRound,u.atk,u.maxhp],[5,4,3,9]);
 assert.equal(b.vfx.filter(e=>e.type==='attack'&&!e.riposte).length,1);
 const state=b.vfx.find(e=>e.type==='state');assert.equal(state.frame.heroes.p.shield,5);
 const frame=JSON.stringify(state.frame);b.heroes.p.shield=0;assert.equal(JSON.stringify(state.frame),frame);
});

test('Cadence individuelle : activations aux tours 1 et 4 seulement, même après reprise',()=>{
 const {b,u}=gained();strike(b,u);assert.equal(b.heroes.p.shield,5);
 for(const round of [2,3]){b.round=round;strike(b,u);assert.equal(b.heroes.p.shield,5);assert.equal(u.strikeWardReadyRound,4);}
 storage();assert(storeBattle(b));const restored=restoreBattle(),r=restored.board[0][1];assert.equal(r.strikeWardReadyRound,4);
 restored.round=4;strike(restored,r);assert.equal(restored.heroes.p.shield,7);assert.equal(r.strikeWardReadyRound,7);
});

test('Plafond 20 : restauration partielle, surplus préservé, quota consommé même à plafond atteint',()=>{
 for(const initial of [18,19,20,25]){
  const {b,u}=gained();b.heroes.p.shield=initial;strike(b,u);
  assert.equal(b.heroes.p.shield,Math.max(initial,Math.min(20,initial+2)));assert.equal(u.strikeWardReadyRound,4);
  b.heroes.p.shield=0;b.round=2;strike(b,u);assert.equal(b.heroes.p.shield,0);
 }
});

test('Pas de gain ni de quota sans élimination directe : blessure, absorption, couronne, sort, poison ou Riposte',()=>{
 for(const extra of [{},{barrier:20}]){
  const {b,u}=gained();strike(b,u,30,extra);assert.equal(b.heroes.p.shield,3);assert.equal(u.strikeWardReadyRound,undefined);
 }
 const crown=gained();crown.b.board[0][1]=null;crown.b.board[0][10]=crown.u;endPlayerTurn(crown.b);
 assert.equal(crown.b.heroes.p.shield,3);assert.equal(crown.u.strikeWardReadyRound,undefined);
 const direct=gained(),victim=unit();direct.b.board[0][2]=victim;hit(direct.b,victim,100,'p');
 assert.equal(direct.b.heroes.p.shield,3);assert.equal(direct.u.strikeWardReadyRound,undefined);
 const poison=gained();poison.u.stun=99;poison.b.board[1][5]=unit('militia','e',{hp:1,poison:1,poisonTurns:1});
 poison.b.phase='enemy';finishEnemyTurn(poison.b);assert.equal(poison.b.heroes.p.shield,3);assert.equal(poison.u.strikeWardReadyRound,undefined);
 const riposte=gained(),counter=unit('shield','p',{stun:0}),attacker=unit('ironwraith','e',{rarity:'légendaire',hp:1,atk:1});
 riposte.b.board[0][1]=counter;riposte.b.board[0][2]=attacker;
 assert(resolveRetaliation(riposte.b,counter,attacker,0,1,2));assert.equal(attacker.hp,0);
 assert.equal(riposte.b.heroes.e.shield,0);assert.equal(attacker.strikeWardReadyRound,undefined);
});

test('Silence empêche Ferraille ; reprise ultérieure possible sans retoucher la Protection native',()=>{
 const {b,u}=gained();assert(canSilence(b,u));assert(applySilence(b,u,1));strike(b,u);
 assert.equal(b.heroes.p.shield,3);assert.equal(u.strikeWardReadyRound,undefined);
 b.round=2;strike(b,u);assert.equal(b.heroes.p.shield,5);assert.equal(u.strikeWardReadyRound,5);
 const native=unit('ironwraith','p',{stun:0});assert.equal(canSilence(b,native),false,'politique native conservée');
});

test('Destruction simultanée par Fracas : aucun gain après la mort du Marchefer',()=>{
 const {b,u}=gained();u.hp=1;
 const victim=strike(b,u,1,{id:'bone',rarity:'éveillée'});
 assert.equal(victim.hp,0);assert.equal(u.hp,0);assert.equal(b.heroes.p.shield,3);assert.equal(u.strikeWardReadyRound,undefined);
});

test('Plusieurs Marchefers : quotas par invocation et gain de chaque camp au laboratoire commun',()=>{
 for(const side of ['p','e']){
  const lab=freshLab();setLabRarity(lab,side,'ironwraith','légendaire');const before=structuredClone(lab),b=createLabBattle(lab,11);
  b.heroes[side].hand=[{id:'ironwraith',wait:0}];if(side==='e')b.phase='enemy';
  assert((side==='p'?playPlayerCard(b,0,0,1):playEnemyCard(b)).ok);
  const u=b.board.flat().find(x=>x?.id==='ironwraith'&&x.side===side);b.heroes[side].shield=3;
  strike(b,u);assert.equal(b.heroes[side].shield,5);assert.equal(u.strikeWardReadyRound,4);
  const second={...u,uid:uid++};delete second.strikeWardReadyRound;b.round=1;strike(b,second);
  assert.equal(b.heroes[side].shield,7);assert.deepEqual(lab,before);
 }
});

test('Quota facultatif validé et préservé, aucune mutation des sauvegardes historiques',()=>{
 const {b,u}=gained();storage();storeBattle(b);assert.deepEqual(restoreBattle(),b);
 assert.equal(Object.hasOwn(u,'strikeWardReadyRound'),false);strike(b,u);storeBattle(b);assert.deepEqual(restoreBattle(),b);
 for(const value of [null,-1,0,1.5,Infinity,101]){
  const bad=structuredClone(b);bad.board[0][1].strikeWardReadyRound=value;assert.equal(validStoredBattle(bad),false,String(value));
 }
});

test('Fiche et carte : paramètres communs, obtention par fusion et rangs absents explicites',()=>{
 const view=cardPresentation({id:'ironwraith',rarity:'légendaire'});
 assert.match(view.card.description,/Ferraille récupérée/);assert.match(view.card.description,/Protection \+3/);
 for(const text of ['attaque normale','élimine une unité ennemie','+2 bouclier','plafond 20','3 tours'])assert.ok(view.details.join(' ').includes(text),text);
 assert.match(view.availability,/fusion/i);assert.equal(cardPresentation({id:'golem',rarity:'divine'}).known,false);
});

test('Export autonome : Ferraille exécutée depuis les modules réellement embarqués',()=>{
 const script=readFileSync(new URL('../JOUER.html',import.meta.url),'utf8').match(/<script>\n([\s\S]*)<\/script>/)[1],context={structuredClone};
 new Script(script.replace("__load('src/app.js');","globalThis.api=__load('src/engine.js');")).runInNewContext(context);
 const e=context.api,p=e.freshProfile();p.evolvedCollection={'ironwraith:légendaire':1};p.deck[0]={id:'ironwraith',rarity:'légendaire'};
 const b=e.createBattle(p,{id:'offline',name:'Hors ligne',enemy:'Test',hp:100,difficulty:1,deck:[]},11,{turnFlow:'alternating'});
 b.heroes.p.hand=[{id:'ironwraith',rarity:'légendaire',wait:0}];assert(e.playPlayerCard(b,0,0,1).ok);
 const u=b.board[0][1];b.board[0][2]=unit('militia','e',{hp:1});e.endPlayerTurn(b);
 assert.equal(b.heroes.p.shield,5);assert.equal(u.strikeWardReadyRound,4);
});
