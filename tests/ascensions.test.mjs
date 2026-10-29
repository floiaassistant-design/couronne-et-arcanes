import test from 'node:test';
import assert from 'node:assert/strict';
import {EVOLUTION_TRIALS,EVOLUTION_ASCENSIONS,ALL_EVOLUTION_TRIALS} from '../src/evolution-trials.js';
import {EVOLUTION_FUSIONS} from '../src/evolution-fusion.js';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {AUBE_UNIT_IDS,unitVersions} from '../src/cards/definitions.js';
import {cardKey,ownedCardCopies} from '../src/cards/references.js';
import {freshProfile,normalizeProfile,evolutionTrialAccess,createEvolutionTrial,settleEvolutionTrial,fuseEvolutionCopies,createBattle,modifyDeck,playPlayerCard,bossEvolutionUnlocks} from '../src/engine.js';
import {trialObjectiveState,validTrialChallenge} from '../src/engine/trial-objectives.js';
import {hit} from '../src/engine/battle-defense.js';
import {resolveUnitArrival} from '../src/engine/unit-support.js';
import {saveProfile,loadProfile,storeBattle,restoreBattle,validStoredBattle,validateImportedProfile} from '../src/ui/storage.js';
import {cardPresentation} from '../src/ui/card-presentation.js';
import {ascensionProfile,ascensionScenarios,playAscension} from './fixtures/ascension-scenarios.mjs';

const scenarios=ascensionScenarios();
function storage(){const data={};globalThis.localStorage={getItem:k=>data[k]??null,setItem:(k,v)=>{data[k]=String(v)},removeItem:k=>{delete data[k]}};return data;}

test('Deux ascensions communes, dix fusions par rang, 41 évolutions et quatre épreuves pilotes conservées',()=>{
 assert.equal(EVOLUTION_TRIALS.length,4);assert.equal(EVOLUTION_ASCENSIONS.length,2);assert.equal(ALL_EVOLUTION_TRIALS.length,6);
 assert.equal(EVOLUTION_FUSIONS.filter(r=>CARDS[r.cardId].faction==='aube').length,41);
 for(const t of EVOLUTION_ASCENSIONS){
  const recipes=EVOLUTION_FUSIONS.filter(r=>r.ascension===t.id);assert.equal(recipes.length,10);
  assert.ok(recipes.every(r=>r.to===t.to&&r.from===t.from&&r.mission===t.mission));
  assert.ok(bossEvolutionUnlocks(t.mission).some(r=>r.id===t.id));
 }
 const all=AUBE_UNIT_IDS.flatMap(unitVersions);assert.equal(all.length,51);assert.ok(all.every(v=>v.status.combat==='implemented'));
 const p=freshProfile(),before=structuredClone(p);normalizeProfile(p);assert.deepEqual(p,before);
 assert.equal(p.evolvedCollection,undefined);assert.equal(p.completedTrials,undefined);
});

test('Accès purs : boss réel, ascension précédente, rang du deck, diversité et deck possédé',()=>{
 for(const [index,t] of EVOLUTION_ASCENSIONS.entries()){
  const p=structuredClone(scenarios[index].profile),before=structuredClone(p);
  assert.equal(evolutionTrialAccess(p,t.id).ok,true);assert.deepEqual(p,before);
  const variants=[
   q=>{q.completed=[];q.unlocked=12;q.heroXp=100000},
   q=>{q.deck=Array(12).fill('militia')},
   q=>{q.deck=Array(12).fill({id:'shield',rarity:t.from})},
   q=>{q.evolvedCollection={};q.collection.dawnbastion=0}
  ];
  if(index)variants.push(q=>{q.completedTrials=[]});
  for(const change of variants){const q=structuredClone(p);change(q);const old=structuredClone(q);assert.equal(createEvolutionTrial(q,t.id,1).ok,false);assert.deepEqual(q,old);}
  for(const battle of [{status:'active'},{status:'victory'},{status:'defeat'}])assert.equal(createEvolutionTrial(p,t.id,1,battle).ok,false);
  assert.equal(createEvolutionTrial(p,t.id,1,{status:'victory',rewardGiven:true}).ok,true);
 }
 assert.equal(createEvolutionTrial(freshProfile(),'inconnue').ok,false);
});

test('Objectifs composites : pas de cumul entre copies, ennemis, morts ou autres factions ; seuils exacts',()=>{
 for(const s of scenarios){
  const b=structuredClone(s.terminal),before=structuredClone(b);assert.equal(trialObjectiveState(b).achieved,true);assert.deepEqual(b,before);
  const broken=[
   q=>{q.round=q.trialChallenge.maxRound+1},
   q=>{q.heroes.p.maxhp=100;q.heroes.p.hp=q.trialChallenge.crownPercent-1},
   q=>{for(const u of q.board.flat())if(u?.side==='p'){u.id='shield';u.rarity=q.trialChallenge.rarity}},
   q=>{for(const u of q.board.flat())if(u?.side==='p')u.hp=0},
   q=>{for(const u of q.board.flat())if(u?.side==='p')u.side='e'},
   q=>{for(const u of q.board.flat())if(u?.side==='p'){u.id='wolf';u.rarity='commun'}},
   q=>{for(const u of q.board.flat())if(u?.side==='p')u.rarity=q.trialChallenge.rarity==='divine'?'légendaire':u.id==='dawnbastion'?'divine':'épique'}
  ];
  for(const change of broken){const q=structuredClone(b);change(q);assert.equal(trialObjectiveState(q).achieved,false);}
  b.round=b.trialChallenge.maxRound;b.heroes.p.maxhp=100;b.heroes.p.hp=b.trialChallenge.crownPercent;
  assert.equal(trialObjectiveState(b).achieved,true);
 }
});

test('Instantané v2 obligatoire et validé ; reprise exacte, sans repli sur les anciens objectifs',()=>{
 for(const s of scenarios){
  const b=structuredClone(s.initial);assert.equal(validTrialChallenge(b),true);assert.equal(validStoredBattle(b),true);
  storage();assert(storeBattle(b));assert.deepEqual(restoreBattle(),b);
  const mutations=[q=>{delete q.trialChallenge},q=>{q.trialChallenge.version=1},q=>{q.trialChallenge.faction='ombre'},q=>{q.trialChallenge.rarity='rare'},q=>{q.trialChallenge.distinct=0},q=>{q.trialChallenge.distinct=11},q=>{q.trialChallenge.crownPercent=101},q=>{q.trialChallenge.maxRound=0},q=>{q.trialChallenge.text=''}];
  for(const mutate of mutations){const q=structuredClone(b);mutate(q);assert.equal(validTrialChallenge(q),false);assert.equal(validStoredBattle(q),false);assert.equal(trialObjectiveState(q).achieved,false);}
 }
});

test('Deux vrais combats complets : accès unique sauvegardé, sans carte, coût, XP ou changement du deck',()=>{
 for(const s of scenarios){
  const p=structuredClone(s.profile),b=structuredClone(s.terminal),before=structuredClone(p);
  assert.equal(b.status,'victory');assert.equal(trialObjectiveState(b).achieved,true);
  const result=settleEvolutionTrial(p,b);assert.equal(result.unlocked,true);assert.equal(result.evolved,false);assert.equal(result.card,null);
  const expected=structuredClone(before);expected.completedTrials=[...(before.completedTrials||[]),s.id];assert.deepEqual(p,expected);
  const once=structuredClone(p);assert.equal(settleEvolutionTrial(p,b).unlocked,undefined);assert.deepEqual(p,once);
  assert.equal(settleEvolutionTrial(p,structuredClone(s.terminal)).unlocked,undefined);assert.deepEqual(p,once);
  assert.equal(evolutionTrialAccess(p,s.id).completed,true);
  assert.equal(evolutionTrialAccess(p,s.id,{status:'active'}).completed,true);
  storage();assert(saveProfile(p));assert.deepEqual(loadProfile(),p);assert.deepEqual(validateImportedProfile(JSON.parse(JSON.stringify(p))),p);
 }
});

test('Défaite, victoire hors objectif et laboratoire : aucun déblocage ni prélèvement',()=>{
 for(const s of scenarios)for(const outcome of ['defeat','objective','developer','unfinished']){
  const p=structuredClone(s.profile),b=structuredClone(s.terminal),before=structuredClone(p);
  if(outcome==='defeat')b.status='defeat';if(outcome==='objective')b.round=b.trialChallenge.maxRound+1;
  if(outcome==='developer')b.mode='developer';if(outcome==='unfinished')b.status='active';
  assert.equal(settleEvolutionTrial(p,b).unlocked,undefined);assert.deepEqual(p,before);
 }
});

test('Les vingt nouvelles recettes restent verrouillées avant leur ascension, malgré le stock et tous les boss',()=>{
 for(const recipe of EVOLUTION_FUSIONS.filter(r=>r.ascension)){
  const p=ascensionProfile(recipe.from),before=structuredClone(p);
  assert.match(fuseEvolutionCopies(p,recipe.id).reason,/ascension/);assert.deepEqual(p,before);
 }
});

test('Les vingt cartes réellement fusionnées après ascension : stocks, deck, invocation et sauvegarde d’aventure',()=>{
 for(const s of scenarios)for(const recipe of EVOLUTION_FUSIONS.filter(r=>r.ascension===s.id)){
  const p=structuredClone(s.expected);if(recipe.to==='éveillée')p.deck=ascensionProfile().deck;
  const source={id:recipe.cardId,rarity:recipe.from},owned=ownedCardCopies(p,source),before=structuredClone(p);
  const result=fuseEvolutionCopies(p,recipe.id);assert.equal(result.ok,true,recipe.id);
  assert.equal(ownedCardCopies(p,source),owned-3);assert.equal(ownedCardCopies(p,result.target),1);
  assert.deepEqual(p.deck,before.deck);assert.deepEqual(p.completedTrials,before.completedTrials);
  assert.equal(modifyDeck(p,result.target,1),true);assert.deepEqual(validateImportedProfile(p),p);
  const b=createBattle(p,CAMPAIGN[0],1);b.heroes.p.hand=[{...result.target,wait:0}];
  assert.equal(playPlayerCard(b,0,0,1).ok,true);const u=b.board[0][1];
  assert.equal(u.rarity,recipe.to);assert.equal(b.mode,'campaign');assert.equal(u.cardRules,'cards-v2');
  assert.equal(cardPresentation(result.target,{profile:p}).availability,'Évolution obtenue');
  storage();assert(storeBattle(b));assert.deepEqual(restoreBattle(),b);
  if(recipe.cardId==='militia'&&recipe.to==='éveillée'){
   hit(b,u,100,'e');assert.equal(u.hp,5);assert.equal(u.lastStandUsed,true);assert.equal(u.firstHitReductionUsed,true);
   storeBattle(b);assert.deepEqual(restoreBattle(),b);hit(b,u,100,'e');assert.ok(u.hp<=0);
  }
 }
});

test('Ange Divin/Éveillé réellement obtenu : Intervention, protections et aucune répétition à la reprise',()=>{
 for(const s of scenarios){
  const p=structuredClone(s.expected);if(s.trial.to==='éveillée')p.deck=ascensionProfile().deck;
  const result=fuseEvolutionCopies(p,'dawnbastion:'+s.trial.to);assert.equal(result.ok,true);modifyDeck(p,result.target,1);
  const b=createBattle(p,CAMPAIGN[0],1);
  const enemy={uid:999,id:'shield',rarity:'commun',side:'e',atk:1,hp:20,maxhp:20,armor:2,ranged:false,ability:'armor',stun:0,poison:0,poisonTurns:0};
  b.board[0][2]=enemy;b.heroes.p.hand=[{...result.target,wait:0}];assert.equal(playPlayerCard(b,0,0,1).ok,true);
  const angel=b.board[0][1];assert.equal(enemy.hp,18);assert.equal(b.heroes.p.shield,3);assert.equal(angel.atk,s.trial.to==='divine'?7:9);
  const once=structuredClone(b);resolveUnitArrival(b,angel,0,1,{emit:()=>{},hit});assert.deepEqual(b,once);
  storage();storeBattle(b);assert.deepEqual(restoreBattle(),once);
 }
});

test('256 simulations déterministes : succès et échecs réels, plateau valide et profil inchangé',()=>{
 for(const [index,t] of EVOLUTION_ASCENSIONS.entries())for(const level of [0,1,2,3]){
  const p=ascensionProfile(t.from,level);if(index)p.completedTrials=[EVOLUTION_ASCENSIONS[0].id];
  const before=structuredClone(p);let victories=0,unlocks=0;
  for(let seed=1;seed<=16;seed++){
   const a=playAscension(p,t.id,seed),b=playAscension(p,t.id,seed);assert.deepEqual(a,b);assert.deepEqual(p,before);
   assert.ok(a.battle.board.flat().filter(Boolean).every(u=>u.hp>0&&Number.isFinite(u.atk)));
   if(a.battle.status==='victory'){victories++;if(a.objective.achieved)unlocks++;}
  }
  assert.ok(victories>0);assert.ok(unlocks>0);if(level===0)assert.ok(unlocks<16);
 }
});
