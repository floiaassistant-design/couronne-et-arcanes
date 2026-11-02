import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {resolveUnitDefinition,OMBRE_UNIT_IDS,CARD_RULESET} from '../src/cards/definitions.js';
import {freshProfile,createBattle,playPlayerCard,endPlayerTurn,finishEnemyTurn,fuseEvolutionCopies,findCrownGuardian} from '../src/engine.js';
import {hit} from '../src/engine/battle-defense.js';
import {applyAttackEffects,consumeAttackPenalty,executionBonus} from '../src/engine/unit-effects.js';
import {tickUnitPoison} from '../src/engine/unit-poison.js';
import {resolveUnitDeath} from '../src/engine/unit-death.js';
import {resolveStrikeRewards} from '../src/engine/unit-triggers.js';
import {prepareControlUnits,applySilence} from '../src/engine/battle-control.js';
import {cardPresentation,boardInspectionData} from '../src/ui/card-presentation.js';
import {storeBattle,restoreBattle,validStoredBattle,validateImportedProfile} from '../src/ui/storage.js';
import {evolutionFusionFor} from '../src/evolution-fusion.js';
import {cardPack,evolutionPackFor} from '../src/card-packs.js';

const totals={bone:[4,6,1],shade:[4,5,1],crypt:[3,9,1],plague:[4,7,2],lich:[6,9,4],banshee:[4,7,3],vampire:[5,8,3],graveknight:[5,10,2],nightblade:[4,6,1],spectre:[4,6,1],mist_inquisitor:[3,8,3]};
let uid=900;
const noop=()=>{},hooks={emit:noop,note:noop,enter:noop};
function unit(id='militia',rarity=CARDS[id].rarity,side='e',extra={}){const d=resolveUnitDefinition(id,rarity);return {uid:uid++,id,rarity,side,atk:d.stats.attack,hp:d.stats.hp,maxhp:d.stats.hp,armor:d.abilities.armor?.amount||0,ranged:!!d.abilities.ranged,ability:CARDS[id].ability,stun:0,poison:0,poisonTurns:0,cardRules:CARD_RULESET,...extra};}
function ready(id,rarity='éveillée',side='p'){
 const p=freshProfile();p.completed=CAMPAIGN.map(m=>m.id);p.completedTrials=['ombre-ascension-divine','ombre-ascension-eveillee'];
 const from=rarity==='divine'?'légendaire':'divine';if(CARDS[id].rarity===from)p.collection[id]=3;else p.evolvedCollection={[id+':'+from]:3};
 const result=fuseEvolutionCopies(p,id+':'+rarity);assert(result.ok,result.reason);p.deck[0]=result.target;
 const b=createBattle(p,{...CAMPAIGN[0],deck:[],hp:100},11,{turnFlow:'alternating'});
 for(const h of Object.values(b.heroes))Object.assign(h,{hp:100,maxhp:100,hand:[],deck:[],discard:[]});
 b.heroes.p.hand=[{...result.target,wait:0}];assert(playPlayerCard(b,0,0,1).ok);const u=b.board[0][1];
 if(side==='e'){b.board[0][1]=null;b.board[0][10]=u;u.side='e';b.phase='enemy';}return {p,b,u};
}
function storage(){const cache={};globalThis.localStorage={getItem:k=>cache[k]??null,setItem:(k,v)=>{cache[k]=String(v)},removeItem:k=>{delete cache[k]}};}

test('22 hauts rangs : fusions exactes, totaux indépendants, sauvegarde et paquets conservés',()=>{
 assert.deepEqual([...OMBRE_UNIT_IDS].sort(),Object.keys(totals).sort());
 for(const [id,stats] of Object.entries(totals))for(const rank of ['divine','éveillée']){
  const {p,b,u}=ready(id,rank),d=resolveUnitDefinition(id,rank);assert.deepEqual([d.stats.attack,d.stats.hp,d.stats.delay],stats);assert.deepEqual([u.atk,u.maxhp],stats.slice(0,2));
  assert.equal(evolutionFusionFor(id,rank).ascension,'ombre-ascension-'+(rank==='divine'?'divine':'eveillee'));assert.equal(evolutionPackFor(id,rank),null);
  assert.deepEqual(validateImportedProfile(p),p);storage();assert(storeBattle(b));assert.deepEqual(restoreBattle(),b);
  const text=cardPresentation({id,rarity:rank});assert(text.known);assert(text.details.length>1);
 }
 assert.deepEqual(cardPack('ombre-evolution').groups.map(g=>g.cards.length),[8,3,8]);assert.equal(freshProfile().evolvedCollection,undefined);
});

test('Fracas : vrai coup fatal direct, protections, portée et Entrave, aux deux camps',()=>{
 for(const side of ['p','e'])for(const rank of ['divine','éveillée']){
  const {b,u}=ready('bone',rank,side),from=side==='p'?2:9,to=side==='p'?1:10;
  const attacker=unit('militia','commun',side==='p'?'e':'p',{hp:10,maxhp:10,armor:1});b.board[0][from]=attacker;
  hit(b,u,100,attacker.side,false,true,{attacker,from,to,sameLine:true});
  assert.equal(u.hp,0);assert.equal(u.deathStrikeUsed,true);assert.equal(attacker.hp,rank==='divine'?9:8);assert.equal(attacker.movementRoot,rank==='divine'?undefined:1);
  hit(b,u,100,attacker.side,false,true,{attacker,from,to,sameLine:true});assert.equal(attacker.hp,rank==='divine'?9:8);
 }
 const {b,u}=ready('bone','divine','e'),attacker=unit('militia','commun','p',{atk:10,hp:10,maxhp:10});b.board[0][10]=null;b.board[0][2]=u;b.board[0][1]=attacker;b.phase='player';endPlayerTurn(b);assert.equal(b.board[0][2],null);assert.equal(attacker.hp,8);
});

test('Fracas exclut sorts, poison, dégâts secondaires, autre ligne, trop loin et Silence ; aucune chaîne',()=>{
 for(const fault of ['spell','secondary','other-line','far','silence','poison']){
  const {b,u}=ready('bone'),attacker=unit('bone','éveillée','e',{hp:1});b.board[0][2]=attacker;
  if(fault==='silence')assert(applySilence(b,u,1));
  if(fault==='poison'){u.hp=1;u.poison=1;u.poisonTurns=1;tickUnitPoison(b,u);resolveUnitDeath(b,u,0,1,noop);}
  else hit(b,u,100,'e',false,fault!=='spell'&&fault!=='secondary',{attacker,from:fault==='far'?4:2,to:1,sameLine:fault!=='other-line'});
  assert.equal(attacker.hp,1,fault);assert.equal(u.deathStrikeUsed,undefined,fault);
 }
 const secondary=ready('bone');assert.doesNotThrow(()=>hit(secondary.b,secondary.u,100,'e',false,true));assert.equal(secondary.u.deathStrikeUsed,undefined);
 const {b,u}=ready('bone'),attacker=unit('bone','éveillée','e',{hp:1});b.board[0][2]=attacker;hit(b,u,100,'e',false,true,{attacker,from:2,to:1,sameLine:true});assert.equal(attacker.hp,0);assert.equal(attacker.deathStrikeUsed,undefined);
});

test('Dévoration : éliminations directes, soins plafonnés, bonus séparé limité à +2, silence et deux camps',()=>{
 for(const side of ['p','e']){
  const {b,u}=ready('shade','éveillée',side),col=side==='p'?2:9;u.hp=1;
  for(let n=1;n<=3;n++){b.round=n;b.phase=side==='p'?'player':'enemy';b.board[0][col]=unit('militia','commun',side==='p'?'e':'p',{hp:1,stun:99});(side==='p'?endPlayerTurn:finishEnemyTurn)(b);assert.equal(u.devourAttack,Math.min(n,2));}
  assert.equal(u.hp,5);assert.equal(u.atk,4);assert.equal(boardInspectionData(b,u.uid).stats.atk,6);storage();assert(storeBattle(b));assert.deepEqual(restoreBattle(),b);
 }
 const {b,u}=ready('shade');u.hp=1;assert(applySilence(b,u,1));b.board[0][2]=unit('militia','commun','e',{hp:1,stun:99});endPlayerTurn(b);assert.equal(u.hp,1);assert.equal(u.devourAttack,undefined);
});

test('Garde du Veilleur : portée remplace l’ancienne, mêmes priorités et aucune protection d’unité',()=>{
 const {b,u}=ready('crypt','divine');b.board[0][1]=null;b.board[0][8]=u;assert.equal(findCrownGuardian(b,0,'p',2).u,u);assert.equal(findCrownGuardian(b,1,'p',2),null);
 const awake=unit('crypt','éveillée','p');b.board[1][1]=awake;assert.equal(findCrownGuardian(b,0,'p',2).u,u);b.board[0][8]=null;assert.equal(findCrownGuardian(b,0,'p',2).u,awake);assert.equal(awake.ability,'armor');
});

test('Faucheur : contagion seulement au décès dû au poison, distance 2, pas de chaîne ni quota entre victimes',()=>{
 for(const lethal of [false,true]){
  const {b,u}=ready('plague'),victim=unit('militia','commun','e',{hp:1}),near=unit('militia','commun','e',{hp:10,maxhp:10});b.board[0][4]=victim;b.board[0][6]=near;
  applyAttackEffects(u,victim,false,1);assert.equal(victim.poisonTurns,3);
  if(lethal){tickUnitPoison(b,victim);resolveUnitDeath(b,victim,0,4,noop,2);}else hit(b,victim,2,'p');
  assert.equal(near.poisonTurns,lethal?2:0);if(lethal){assert.equal(near.poisonOrigin.contagion,undefined);assert.equal(near.poisonOrigin.readyRound,2);}
 }
 const {b,u}=ready('plague'),victim=unit('militia','commun','e',{hp:1}),far=unit('militia','commun','e',{hp:10});b.board[0][3]=victim;b.board[0][6]=far;applyAttackEffects(u,victim,false,1);tickUnitPoison(b,victim);resolveUnitDeath(b,victim,0,3,noop);assert.equal(far.poisonTurns,0);
 const second=unit('militia','commun','e',{hp:1}),next=unit('militia','commun','e',{hp:10});b.board[1][3]=second;b.board[1][4]=next;applyAttackEffects(u,second,false,1);u.hp=0;tickUnitPoison(b,second);resolveUnitDeath(b,second,1,3,noop);assert.equal(next.poisonTurns,2);assert.equal(b.poisonSpreads,undefined);
});

test('Archiliche : une ou deux cibles secondaires distinctes, protections normales, aucune chaîne',()=>{
 for(const rank of ['divine','éveillée']){
  const {b}=ready('lich',rank),primary=unit('militia','commun','e',{hp:20,maxhp:20,stun:99}),a=unit('militia','commun','e',{hp:20,maxhp:20,armor:2,stun:99}),z=unit('bone','éveillée','e',{hp:20,maxhp:20,barrier:3,stun:99}),far=unit('militia','commun','e',{hp:20,maxhp:20,stun:99});
  b.board[0][2]=primary;b.board[0][3]=a;b.board[0][4]=z;b.board[0][5]=far;endPlayerTurn(b);assert.equal(primary.hp,14);assert.equal(a.hp,19);assert.equal(z.hp,20);assert.equal(z.barrier,rank==='divine'?3:0);assert.equal(far.hp,20);assert.equal(z.deathStrikeUsed,undefined);
 }
});

test('Banshee : cadence 3, minimum 1, plus fort malus, une cible adjacente et reprise',()=>{
 const {b,u}=ready('banshee'),target=unit('militia','commun','e',{hp:20}),left=unit('militia','commun','e',{hp:20}),right=unit('militia','commun','e',{hp:20});b.board[0][5]=target;b.board[0][4]=left;b.board[0][6]=right;
 applyAttackEffects(u,target,false,1,true,{battle:b,lane:0,col:5});assert.deepEqual(target.attackPenalty,{amount:2,remaining:1,minimum:1});assert.equal(left.attackPenalty.amount,1);assert.equal(right.attackPenalty,undefined);assert.equal(u.harassReadyRound,4);
 assert.equal(consumeAttackPenalty(target,1),1);assert.equal(consumeAttackPenalty(left,0),0);applyAttackEffects(u,target,false,2,true,{battle:b,lane:0,col:5});assert.equal(target.attackPenalty,undefined);
 target.attackPenalty={amount:3,remaining:2};applyAttackEffects(u,target,false,4,true,{battle:b,lane:0,col:5});assert.deepEqual(target.attackPenalty,{amount:3,remaining:2});storage();assert(storeBattle(b));assert.deepEqual(restoreBattle(),b);
});

test('Vampire : héros +3 sur absorption, soin personnel seulement après perte de PV, une fois par tour',()=>{
 const {b,u}=ready('vampire');u.hp=2;b.heroes.p.hp=50;const target=unit('militia','commun','e',{hp:30,maxhp:30,barrier:100,stun:99});b.board[0][2]=target;endPlayerTurn(b);assert.equal(b.heroes.p.hp,53);assert.equal(u.hp,2);
 b.phase='player';b.round=2;target.barrier=0;endPlayerTurn(b);assert.equal(u.hp,4);assert.equal(b.heroes.p.hp,56);resolveStrikeRewards(b,u,0,1,{damaged:true},noop);assert.equal(u.hp,4);
});

test('Chevalier : Armure 3, Charge 3, barrière seulement sur élimination chargée et quota',()=>{
 for(const distance of [1,2])for(const killed of [false,true]){
  const {b,u}=ready('graveknight'),target=unit('militia','commun','e',{hp:killed?1:30,maxhp:30,stun:99});b.board[0][1+distance]=target;assert.equal(u.armor,3);endPlayerTurn(b);
  assert.equal(u.barrier,killed&&distance===2?2:undefined);assert.equal(target.hp,killed?0:30-(distance===2?8:5));
 }
});

test('Exécution : PV immédiatement avant la frappe et malus appliqué à l’ATQ complète',()=>{
 for(const penalty of [false,true]){
  const {b,u}=ready('nightblade');b.board[0][1]=unit('archer','légendaire','p');b.board[0][3]=u;
  const target=unit('militia','commun','e',{hp:12,maxhp:20,stun:99,armor:9});b.board[0][4]=target;b.board[0][1].atk=3;
  // Le premier tir retire 1 PV sous Armure : on part de 11 PV pour atteindre exactement la moitié.
  target.hp=11;if(penalty)u.attackPenalty={amount:5,remaining:1};assert.equal(executionBonus(u,target),0);endPlayerTurn(b);assert.equal(target.hp,penalty?8:3);assert.equal(u.atk,4);
 }
});

test('Traque : Célérité au prochain tour seulement après élimination par Exécution',()=>{
 const {b,u}=ready('nightblade');b.board[0][2]=unit('militia','commun','e',{hp:1,maxhp:10,stun:99});endPlayerTurn(b);assert.equal(u.killHasteRound,2);
 b.phase='player';b.round=2;endPlayerTurn(b);assert.equal(b.board[0][3],u);assert.equal(u.killHasteRound,undefined);
 b.phase='player';b.round=3;endPlayerTurn(b);assert.equal(b.board[0][4],u);
});

test('Spectre : perforation après deux vraies cases ; traversée alliée dans le budget de trois',()=>{
 for(const distance of [2,3]){
  const {b,u}=ready('spectre','divine'),target=unit('militia','commun','e',{hp:30,maxhp:30,armor:9,stun:99});b.board[0][1+distance]=target;endPlayerTurn(b);assert.equal(target.hp,distance===3?24:29);assert.equal(u.movedCellsThisRound,undefined);
 }
 const {b,u}=ready('spectre');b.board[0][2]=unit('militia','commun','p',{stun:99});const target=unit('militia','commun','e',{hp:30,maxhp:30,armor:9,stun:99});b.board[0][5]=target;endPlayerTurn(b);assert.equal(b.board[0][4],u);assert.equal(target.hp,24);assert.equal(b.board[0][2].id,'militia');
});

test('Tribunal : deux cibles distinctes, durée 2, cadence 3, mêmes priorités et Silence',()=>{
 const {b,u}=ready('mist_inquisitor');const targets=['plague','vampire','shade'].map(id=>unit(id,CARDS[id].rarity,'e'));targets.forEach((v,i)=>b.board[0][i+5]=v);
 prepareControlUnits(b,hooks,'p');assert.equal(targets.filter(t=>t.silenceUntil===2).length,2);assert.equal(u.controlReadyRound,4);b.round=2;prepareControlUnits(b,hooks,'p');assert.equal(targets.filter(t=>t.silenceUntil===2).length,2);
 const silent=ready('mist_inquisitor');assert(applySilence(silent.b,silent.u,1));silent.b.board[0][5]=unit('plague','rare','e');prepareControlUnits(silent.b,hooks,'p');assert.equal(silent.b.board[0][5].silenceUntil,undefined);
});

test('États nouveaux : reprise exacte, nombres invalides refusés, natifs sans champ ajouté',()=>{
 const {b,u}=ready('shade');Object.assign(u,{devourAttack:2,harassReadyRound:4,killHasteRound:2,lastStrikeHealRound:1,lastChargeBarrierRound:1,deathStrikeUsed:true});storage();assert(storeBattle(b));assert.deepEqual(restoreBattle(),b);
 for(const [key,bad] of [['devourAttack',3],['harassReadyRound',0],['killHasteRound',null],['lastStrikeHealRound',1.5],['deathStrikeUsed',1],['movedCellsThisRound',11]]){const copy=structuredClone(b);copy.board[0][1][key]=bad;assert.equal(validStoredBattle(copy),false,key);}
 const old=createBattle(freshProfile(),CAMPAIGN[0],1);assert(!('devourAttack' in old));
});

test('Export autonome : nouvelles définitions et Fracas exécutés par le vrai graphe embarqué',()=>{
 const script=readFileSync(new URL('../JOUER.html',import.meta.url),'utf8').match(/<script>\n([\s\S]*)<\/script>/)[1];const ctx={structuredClone};new Script(script.replace("__load('src/app.js');","globalThis.e=__load('src/engine/battle-defense.js');globalThis.d=__load('src/cards/definitions.js');")).runInNewContext(ctx);
 const victim=unit('bone','éveillée','e'),attacker=unit('militia','commun','p',{hp:10,maxhp:10});const b=ready('shade').b;b.board[0][1]=attacker;b.board[0][2]=victim;assert.equal(ctx.d.resolveUnitDefinition('bone','éveillée').abilities.deathStrike.amount,3);ctx.e.hit(b,victim,100,'p',false,true,{attacker,from:1,to:2,sameLine:true});assert.equal(attacker.hp,7);assert.equal(attacker.movementRoot,1);
});
