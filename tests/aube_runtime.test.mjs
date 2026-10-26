import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {freshProfile} from '../src/engine/profile.js';
import {createBattle,playPlayerCard,playEnemyCard,endPlayerTurn,finishEnemyTurn} from '../src/engine/battle.js';
import {freshLab,setLabRarity,setLabLevel,createLabBattle,labCardStats,labRanks} from '../src/engine/developer-lab.js';
import {AUBE_UNIT_IDS,AUBE_RULESET,unitVersions,resolveRulesDefinition,versionUnitAbilities} from '../src/cards/definitions.js';
import {unitStats} from '../src/engine/unit-stats.js';
import {resolveUnitSupport,resolveUnitArrival} from '../src/engine/unit-support.js';
import {hit,grantAbilityBarrier,grantSharedBarrier} from '../src/engine/battle-defense.js';
import {recordCombatEvent} from '../src/engine/combat-events.js';
import {rankEnemyMoves} from '../src/ai.js';
import {unitAbilitySummary} from '../src/cards/ability-text.js';

let uid=12000;
function unit(id,rarity,side='p',extra={}){
 const d=resolveRulesDefinition({id,rarity});
 return {uid:++uid,id,side,rarity,cardRules:AUBE_RULESET,atk:d.stats.attack,hp:d.stats.hp,maxhp:d.stats.hp,
  armor:d.abilities.armor?.amount||0,ranged:!!d.abilities.ranged,ability:CARDS[id].ability,
  stun:0,poison:0,poisonTurns:0,...extra};
}
function combat(){
 const b=createBattle(freshProfile(),{...CAMPAIGN[0],deck:[]},421,{turnFlow:'alternating',cardRules:AUBE_RULESET});
 for(const h of Object.values(b.heroes))Object.assign(h,{hp:100,maxhp:100,hand:[],deck:[],discard:[]});
 b.vfx=[];return b;
}
const emit=recordCombatEvent;

test('51 versions × 4 niveaux × 2 camps : vraie invocation, prévision identique, aucun achat forcé',()=>{
 for(const id of AUBE_UNIT_IDS)for(const d of unitVersions(id))for(const level of [0,1,2,3])for(const side of ['p','e']){
  const lab=freshLab();assert.equal(setLabRarity(lab,side,id,d.rarity).ok,true);
  assert.equal(setLabLevel(lab,side,id,level).ok,true);const expected=labCardStats(lab,side,id);
  const b=createLabBattle(lab,22);b.heroes[side].hand=[{id,wait:0}];
  if(side==='p')assert.equal(playPlayerCard(b,0,0).ok,true,d.versionId);
  else{b.phase='enemy';assert.equal(playEnemyCard(b).done,false,d.versionId);}
  const u=b.board.flat().find(u=>u?.id===id&&u.side===side);assert(u,d.versionId);
  assert.equal(u.atk,d.stats.attack+level);assert.equal(u.maxhp,d.stats.hp+level);
  assert.equal(u.atk,expected.atk);assert.equal(u.hp,expected.hp);assert.equal(u.rarity,d.rarity);
  assert.equal(u.cardRules,AUBE_RULESET);assert.equal(u.labGuard,undefined);
  assert.deepEqual(unitStats(b,id,side),{atk:expected.atk,maxhp:expected.hp,bonuses:level?[{label:side==='p'?'Amélioration':'Difficulté',atk:level,hp:level}]:[]});
 }
});

test('Laboratoire : six rangs définis, rangs inférieurs absents, réglages invalides refusés',()=>{
 const lab=freshLab();assert.equal(labRanks('militia').length,6);assert.equal(labRanks('paladin').length,4);
 assert.equal(labRanks('dawnbastion').length,3);assert.equal(labRanks('wolf').length,1);
 assert.equal(setLabRarity(lab,'p','paladin','commun').ok,false);
 assert.equal(setLabRarity(lab,'p','wolf','éveillée').ok,false);
 setLabRarity(lab,'p','militia','éveillée');assert.equal(setLabLevel(lab,'p','militia',0).ok,true);
 lab.rarities.p.militia='inconnue';assert.throws(()=>createLabBattle(lab),/invalide/);
});

test('Campagne : aucune possession future créée et références futures refusées même avec les nouvelles règles',()=>{
 for(const options of [{},{cardRules:AUBE_RULESET}]){
  const b=createBattle(freshProfile(),CAMPAIGN[0],4,options);b.heroes.p.hand=[{id:'militia',rarity:'éveillée',wait:0}];
  const before=structuredClone(b);assert.equal(playPlayerCard(b,0,0).ok,false);assert.deepEqual(b,before);
 }
});

test('Arbalétrière : portée 3, première cible obligatoire même devant un gardien historique',()=>{
 const b=combat(),a=unit('archer','légendaire');b.board[0][4]=a;
 b.board[0][7]=unit('militia','commun','e',{hp:20,maxhp:20,stun:99});endPlayerTurn(b);
 assert.equal(b.board[0][4],a);assert.equal(b.board[0][7].hp,17);
 const c=combat();c.board[0][4]=unit('archer','légendaire');c.board[0][5]=unit('militia','commun','e',{hp:20,stun:99});
 c.board[0][6]={...unit('shield','commun','e',{stun:99}),cardRules:undefined};delete c.board[0][6].rarity;
 endPlayerTurn(c);assert.equal(c.board[0][5].hp,17);assert.equal(c.board[0][6].hp,9);
});

test('Arbalétrière Éveillée : perforation primaire et deuxième cible immédiatement derrière, protégée normalement',()=>{
 for(const side of ['p','e']){
  const b=combat(),foe=side==='p'?'e':'p',from=side==='p'?4:7,first=side==='p'?6:5,second=side==='p'?7:4;
  const a=unit('archer','éveillée',side),target=unit('militia','commun',foe,{hp:20,maxhp:20,armor:8,stun:99});
  const rear=unit('militia','commun',foe,{hp:20,maxhp:20,armor:1,barrier:1,stun:99});
  b.board[0][from]=a;b.board[0][first]=target;b.board[0][second]=rear;
  if(side==='e'){
   // Vérifie le même chemin de résolution adverse sans laisser agir les cibles.
   b.turnFlow=undefined;b.round=2;b.board[0][from].stun=0;
  }
  endPlayerTurn(b);
  assert.equal(target.hp,17);assert.equal(rear.hp,20);assert.equal(rear.barrier,0);
  assert.equal(b.vfx.filter(e=>e.type==='damage'&&e.side===foe).length,2);
 }
});

test('Tir arrière : aucune cible après un trou, alliée, derrière le tireur ou sur une autre ligne',()=>{
 for(const mode of ['gap','ally','behind','other-line']){
  const b=combat();b.board[0][4]=unit('archer','éveillée');b.board[0][6]=unit('militia','commun','e',{hp:20,stun:99});
  const rear=unit('militia','commun',mode==='ally'?'p':'e',{hp:20,stun:99});
  b.board[mode==='other-line'?1:0][mode==='gap'?8:mode==='behind'?3:7]=rear;
  endPlayerTurn(b);assert.equal(rear.hp,20,mode);
 }
});

test('Silence : portée passive conservée, Perforation et tir arrière suspendus',()=>{
 const b=combat(),a=unit('archer','éveillée','p',{silenceUntil:1});b.board[0][4]=a;
 b.board[0][7]=unit('militia','commun','e',{hp:20,armor:2,stun:99});b.board[0][8]=unit('militia','commun','e',{hp:20,stun:99});
 endPlayerTurn(b);assert.equal(b.board[0][4],a);assert.equal(b.board[0][7].hp,19);assert.equal(b.board[0][8].hp,20);
});

test('Lancier Éveillé : deux cases, Charge +3 et Perforation, aucune Charge sans déplacement',()=>{
 for(const moved of [true,false]){
  const b=combat(),u=unit('lancer','éveillée');b.board[0][moved?1:3]=u;
  b.board[0][4]=unit('militia','commun','e',{hp:20,maxhp:20,armor:4,stun:99});endPlayerTurn(b);
  assert.equal(b.board[0][3],u);assert.equal(b.board[0][4].hp,moved?13:16);
 }
 const b=combat(),u=unit('lancer','éveillée','p',{silenceUntil:1});b.board[0][1]=u;
 b.board[0][4]=unit('militia','commun','e',{hp:20,stun:99});endPlayerTurn(b);
 assert.equal(b.board[0][2],u);assert.equal(b.board[0][4].hp,20);
});

test('Sœur Éveillée : deux cibles distinctes, toutes lignes, blessure proportionnelle puis ordre stable',()=>{
 const b=combat(),healer=unit('cleric','éveillée','p',{hp:6});b.board[0][1]=healer;
 const x=unit('militia','commun','p',{hp:2,maxhp:10}),y=unit('militia','commun','p',{hp:2,maxhp:10}),z=unit('militia','commun','p',{hp:5,maxhp:10});
 b.board[0][3]=x;b.board[1][3]=y;b.board[1][4]=z;
 resolveUnitSupport(b,'p',emit);assert.deepEqual([x.hp,y.hp,z.hp],[5,5,5]);
 resolveUnitSupport(b,'p',emit);assert.deepEqual([x.hp,y.hp,z.hp],[5,5,5],'pas de double soin du même soigneur au même tour');
 const copy=JSON.parse(JSON.stringify(b));resolveUnitSupport(copy,'p',emit);assert.equal(copy.board[0][3].hp,5);
 b.round++;healer.hp=1;resolveUnitSupport(b,'p',emit);assert.equal(healer.hp,4,'elle-même est admissible');
});

test('Soin Divine : une seule cible blessée ne reçoit pas deux soins ; aucun soin de mort, ennemi ou couronne',()=>{
 const b=combat();b.board[0][1]=unit('cleric','divine');b.board[0][2]=unit('militia','commun','p',{hp:1,maxhp:10});
 b.board[0][3]=unit('militia','commun','p',{hp:0});b.board[0][4]=unit('militia','commun','e',{hp:1});
 resolveUnitSupport(b,'p',emit);assert.equal(b.board[0][2].hp,4);assert.equal(b.board[0][3].hp,0);assert.equal(b.board[0][4].hp,1);assert.equal(b.heroes.p.hp,100);
});

test('Prieur : barrière uniquement après soin effectif, +1/+2 remplacés et plafond par effet',()=>{
 for(const [rarity,amount] of [['divine',1],['éveillée',2]]){
  const b=combat(),healer=unit('sunpriest',rarity),target=unit('militia','commun','p',{hp:1,maxhp:10,barrier:6});
  b.board[0][1]=healer;b.board[0][2]=target;resolveUnitSupport(b,'p',emit);
  assert.equal(target.hp,4);assert.equal(target.barrier,6+amount);
  b.round++;resolveUnitSupport(b,'p',emit);assert.equal(target.barrier,8);
  target.hp=10;b.round++;const before=target.barrier;resolveUnitSupport(b,'p',emit);assert.equal(target.barrier,before);
  target.hp=1;healer.silenceUntil=b.round;resolveUnitSupport(b,'p',emit);assert.equal(target.hp,1);
 }
});

test('Barrières de capacités et sorts : coexistence dans les deux ordres, absorption puis recharge',()=>{
 for(const first of ['ability','spell']){
  const b=combat(),u=unit('paladin','éveillée');b.board[0][4]=u;
  const add=()=>grantAbilityBarrier(u,'riposteBarrier',{amount:2,cap:2});
  if(first==='ability'){add();grantSharedBarrier(u,4,6);}else{grantSharedBarrier(u,4,6);add();}
  assert.equal(u.barrier,6);grantSharedBarrier(u,2,4);assert.equal(u.barrier,6);
  hit(b,u,5,'e');assert.equal(u.barrier,4);assert.equal(u.abilityBarriers.riposteBarrier,0);
  add();assert.equal(u.barrier,6);
 }
});

test('Barrières de sorts : plafonds individuels conservés sans effacer les points des capacités',()=>{
 const u=unit('paladin','éveillée');grantAbilityBarrier(u,'riposteBarrier',{amount:2,cap:2});
 grantSharedBarrier(u,2,4);assert.equal(u.barrier,4);
 grantSharedBarrier(u,4,6);assert.equal(u.barrier,6,'la Bénédiction reste plafonnée à 6 au total');
 grantSharedBarrier(u,2,4);assert.equal(u.barrier,6,'Mur ne réduit pas un surplus existant');
 grantSharedBarrier(u,4,6);assert.equal(u.barrier,6);
 assert.equal(u.abilityBarriers.riposteBarrier,2);
});

test('Porte-étendard Éveillé : deux autres alliés toutes lignes, +2 tous les 3 tours et plafond non destructif',()=>{
 const b=combat(),u=unit('banner','éveillée');b.board[0][2]=u;
 const x=unit('militia','commun','p',{atk:11}),y=unit('militia','commun','p',{atk:13}),z=unit('militia','commun','p',{atk:2});
 b.board[0][1]=x;b.board[1][1]=y;b.board[1][2]=z;
 resolveUnitSupport(b,'p',emit);assert.equal(x.atk,11);
 b.round=3;resolveUnitSupport(b,'p',emit);assert.deepEqual([x.atk,y.atk,z.atk,u.atk],[12,13,2,2]);
 resolveUnitSupport(b,'p',emit);assert.equal(z.atk,2);
});

test('Capitaine Éveillé : Commandement à l’arrivée une fois, Inspiration ensuite tous les 2 tours',()=>{
 const lab=freshLab();setLabRarity(lab,'p','scoutcaptain','éveillée');const b=createLabBattle(lab,8);
 for(const h of Object.values(b.heroes))Object.assign(h,{hp:100,maxhp:100,hand:[],deck:[],discard:[]});
 b.board[0][2]=unit('militia','commun','p',{atk:2});b.board[0][3]=unit('militia','commun','p',{atk:2});
 b.heroes.p.hand=[{id:'scoutcaptain',wait:0}];assert.equal(playPlayerCard(b,0,0,1).ok,true);
 assert.deepEqual([b.board[0][2].atk,b.board[0][3].atk],[3,2]);assert.equal(b.heroes.p.cardsPlayed,1);
 b.round=2;resolveUnitSupport(b,'p',emit);assert.equal(b.board[0][2].atk,4);
 const saved=JSON.parse(JSON.stringify(b));resolveUnitSupport(saved,'p',emit);assert.equal(saved.board[0][2].atk,4);
});

test('Ange Éveillé : Protection puis une seule Intervention à portée 2, protections réelles et aucune frappe de plus',()=>{
 const lab=freshLab();setLabRarity(lab,'p','dawnbastion','éveillée');const b=createLabBattle(lab,8);b.vfx=[];
 for(const h of Object.values(b.heroes))Object.assign(h,{hp:100,maxhp:100,hand:[],deck:[],discard:[]});
 const target=unit('militia','commun','e',{hp:20,maxhp:20,armor:1,barrier:1,stun:99});b.board[0][5]=target;
 b.board[0][6]=unit('militia','commun','e',{hp:20,stun:99});b.heroes.p.hand=[{id:'dawnbastion',wait:0}];
 assert.equal(playPlayerCard(b,0,0,3).ok,true);assert.equal(target.hp,18);assert.equal(b.heroes.p.shield,3);
 assert.equal(b.vfx.filter(e=>e.type==='attack').length,1);assert.equal(b.vfx.find(e=>e.arrival).damage,4);
 assert.equal(b.board[0][3].atk,7);endPlayerTurn(b);
 assert.equal(target.hp,12,'attaque ordinaire unique 7 moins Armure 1 après le déplacement');
 assert.equal(b.vfx.filter(e=>e.arrival).length,1);assert.equal(b.board[0][6].hp,20);
});

test('Intervention : premier ennemi devant uniquement, rien au-delà de 2, pas de couronne ni de cible arrière',()=>{
 for(const side of ['p','e']){
  const b=combat(),u=unit('dawnbastion','divine',side),from=side==='p'?3:8,dir=side==='p'?1:-1,foe=side==='p'?'e':'p';
  b.board[0][from]=u;b.board[0][from-dir]=unit('militia','commun',foe,{hp:20});b.board[0][from+3*dir]=unit('militia','commun',foe,{hp:20});
  resolveUnitArrival(b,u,0,from,{hit,emit});assert.equal(b.vfx.filter(e=>e.arrival).length,0);
  assert.equal(b.heroes[foe].hp,100);assert.equal(b.heroes[side].shield,3);
 }
});

test('Arrivée : état persistant une fois par invocation, piège appliqué après le pouvoir',()=>{
 const b=combat(),u=unit('dawnbastion','divine'),target=unit('militia','commun','e',{hp:20,armor:0});
 b.board[0][3]=u;b.board[0][5]=target;
 resolveUnitArrival(b,u,0,3,{hit,emit});resolveUnitArrival(b,u,0,3,{hit,emit});
 assert.equal(target.hp,16);assert.equal(b.heroes.p.shield,3);
 const copy=JSON.parse(JSON.stringify(b));resolveUnitArrival(copy,copy.board[0][3],0,3,{hit,emit});
 assert.equal(copy.board[0][5].hp,16);assert.equal(copy.heroes.p.shield,3);
 const lab=freshLab();setLabRarity(lab,'p','dawnbastion','divine');const trapped=createLabBattle(lab,8);
 trapped.heroes.p.hand=[{id:'dawnbastion',wait:0}];trapped.board[0][5]=unit('militia','commun','e',{hp:20});
 trapped.traps=[{owner:'e',lane:0,col:3,damage:99,expiresRound:2}];
 assert.equal(playPlayerCard(trapped,0,0,3).ok,true);assert.equal(trapped.board[0][3],null);
 assert.equal(trapped.board[0][5].hp,16);assert.equal(trapped.heroes.p.shield,3);
});

test('Natifs futurs : règles explicites de Garde/Riposte, aucun changement des anciennes définitions ou instantanés',()=>{
 const old={id:'shield',atk:17,hp:7,maxhp:23,side:'p'};
 const before=structuredClone(old);assert.equal(versionUnitAbilities(old),null);assert.deepEqual(old,before);
 const newNative=unit('shield','commun');assert.equal(versionUnitAbilities(newNative).guard.scope,'positioned');
 assert.equal(versionUnitAbilities(newNative).riposte.damageMode,'effective-attack');
});

test('IA : vraies statistiques de version, choix déterministes et aucun accès aux cartes privées du joueur',()=>{
 const b=createLabBattle(freshLab(),5);b.heroes.e.hand=[{id:'militia',rarity:'commun',wait:0},{id:'militia',rarity:'éveillée',wait:0}];b.phase='enemy';
 Object.defineProperty(b.heroes.p,'hand',{get(){throw Error('main privée');},configurable:true});
 Object.defineProperty(b.heroes.p,'deck',{get(){throw Error('pioche privée');},configurable:true});
 const seed=b.seed,a=rankEnemyMoves(b),z=rankEnemyMoves(b);assert.deepEqual(a,z);assert.equal(b.seed,seed);
 assert.equal(a[0].index,1);assert.equal(playEnemyCard(b).done,false);
 assert.equal(b.board.flat().find(u=>u?.side==='e').rarity,'éveillée');
});


test('Résumé du laboratoire : montants et cadence issus de la définition résolue',()=>{
 const banner=unitAbilitySummary(resolveRulesDefinition({id:'banner',rarity:'éveillée'})).join(' · ');
 assert.match(banner,/\+2 ATQ à 2 allié\(s\) \/ 3 tours/);assert.match(banner,/toutes lignes/);
 const paladin=unitAbilitySummary(resolveRulesDefinition({id:'paladin',rarity:'éveillée'})).join(' · ');
 assert.match(paladin,/Armure 3/);assert.match(paladin,/Riposte : ATQ, 1\/tour/);
 assert.match(unitAbilitySummary(resolveRulesDefinition({id:'sunpriest',rarity:'éveillée'})).join(' · '),/Barrière après soin : \+2, max 2/);
});


test('Batailles complètes du laboratoire : six rangs, deux camps, moteur commun déterministe sans progression',()=>{
 function run(rankIndex,seed){
  const lab=freshLab();lab.decks.p=[...AUBE_UNIT_IDS,'firebolt','healing'];lab.decks.e=[...lab.decks.p];
  for(const side of ['p','e'])for(const id of AUBE_UNIT_IDS){
   const defs=unitVersions(id),globalIndex=Math.max(rankIndex,6-defs.length),rank=defs[globalIndex-(6-defs.length)].rarity;
   setLabRarity(lab,side,id,rank);setLabLevel(lab,side,id,0);
  }
  const draft=JSON.stringify(lab),b=createLabBattle(lab,seed);
  for(let n=0;n<36&&b.status==='active';n++){
   for(let action=0;action<2;action++){
    let played=false;
    for(let i=0;i<b.heroes.p.hand.length&&!played;i++)for(let lane=0;lane<b.board.length&&!played;lane++)for(const col of [1,2,3])if(playPlayerCard(b,i,lane,col).ok){played=true;break;}
    if(!played)break;
   }
   assert(b.heroes.p.cardsPlayed<=2);endPlayerTurn(b);
   if(b.status==='active'){while(!playEnemyCard(b).done){}assert(b.heroes.e.cardsPlayed<=2);finishEnemyTurn(b);}
   const units=b.board.flat().filter(Boolean);assert.equal(new Set(units.map(u=>u.uid)).size,units.length);assert(units.every(u=>u.hp>0));
  }
  assert.notEqual(b.status,'active');assert.equal(JSON.stringify(lab),draft);return JSON.stringify(b);
 }
 for(let rank=0;rank<6;rank++)for(const seed of [12,41,90,302])assert.equal(run(rank,seed),run(rank,seed));
});
