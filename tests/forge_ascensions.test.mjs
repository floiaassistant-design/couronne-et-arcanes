import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS} from '../src/data.js';
import {FORGE_ASCENSIONS,evolutionAscensionFor} from '../src/evolution-trials.js';
import {EVOLUTION_FUSIONS} from '../src/evolution-fusion.js';
import {createEvolutionTrial,settleEvolutionTrial,fuseEvolutionCopies} from '../src/engine.js';
import {trialObjectiveState} from '../src/engine/trial-objectives.js';
import {validateImportedProfile,validStoredBattle} from '../src/ui/storage.js';
import {ascensionProfile,ascensionScenarios,playAscension} from './fixtures/ascension-scenarios.mjs';

const scenarios=ascensionScenarios('forge');
test('Deux ascensions Forge : quatre recettes par rang, pas de déblocage des cartes absentes ni de récompense',()=>{
 assert.equal(FORGE_ASCENSIONS.length,2);
 for(const t of FORGE_ASCENSIONS){
  assert.equal(evolutionAscensionFor('forge',t.to),t);
  assert.deepEqual(EVOLUTION_FUSIONS.filter(r=>r.ascension===t.id).map(r=>r.cardId).sort(),['colossus','drill','ironwraith','smith']);
  assert.deepEqual(t.goal,{distinct:t.to==='divine'?3:4,crownPercent:t.to==='divine'?40:60,maxRound:24});
  assert.equal(t.mission,t.to==='divine'?'09':'12');assert.ok(t.deck.every(id=>typeof id==='string'&&CARDS[id]));
 }
});

test('Accès : victoire 09/12, diversité, rang source et ascension précédente de la bonne faction',()=>{
 for(const [i,s] of scenarios.entries()){
  assert.equal(createEvolutionTrial(s.profile,s.id,1).ok,true);
  const faults=[p=>{p.completed=[];},p=>{p.deck=ascensionProfile(s.trial.from,2,'aube').deck;},p=>{p.deck=Array(12).fill({id:'drill',rarity:s.trial.from});}];
  if(i)faults.push(p=>{p.completedTrials=['ombre-ascension-divine'];});
  for(const fault of faults){const p=structuredClone(s.profile);fault(p);const before=structuredClone(p);assert.equal(createEvolutionTrial(p,s.id,1).ok,false);assert.deepEqual(p,before);}
  for(const b of [{status:'active'},{status:'victory'},{status:'defeat'}])assert.equal(createEvolutionTrial(s.profile,s.id,1,b).ok,false);
 }
});

test('Deux combats complets : objectifs, reprise, déblocage unique, profil et stocks conservés',()=>{
 for(const s of scenarios){
  assert.equal(validStoredBattle(s.initial),true);assert.equal(s.terminal.status,'victory');assert.equal(trialObjectiveState(s.terminal).achieved,true);
  const p=structuredClone(s.profile),b=structuredClone(s.terminal),before=structuredClone(p);
  assert.equal(settleEvolutionTrial(p,b).unlocked,true);
  assert.deepEqual(p,{...before,completedTrials:[...(before.completedTrials||[]),s.id]});assert.deepEqual(validateImportedProfile(p),p);
  const once=structuredClone(p);assert.equal(settleEvolutionTrial(p,b).unlocked,undefined);assert.deepEqual(p,once);
  for(const fault of ['defeat','late','crown','rank','faction']){
   const q=structuredClone(s.profile),bad=structuredClone(s.terminal);
   if(fault==='defeat')bad.status='defeat';if(fault==='late')bad.round=25;if(fault==='crown')bad.heroes.p.hp=1;
   if(fault==='rank'||fault==='faction')for(const u of bad.board.flat())if(u?.side==='p'){if(fault==='rank')u.rarity=CARDS[u.id].rarity;else u.id='militia';}
   assert.equal(settleEvolutionTrial(q,bad).unlocked,undefined);assert.deepEqual(q,s.profile);
  }
 }
});

test('Les autres ascensions ne débloquent pas Forge ; Forge ne débloque pas Aube',()=>{
 for(const rank of ['divine','éveillée']){
  const p=ascensionProfile(rank==='divine'?'légendaire':'divine',2,'forge');p.completedTrials=['ombre-ascension-divine','ombre-ascension-eveillee'];const before=structuredClone(p);
  assert.equal(fuseEvolutionCopies(p,'drill:'+rank).ok,false);assert.deepEqual(p,before);
 }
 const p=ascensionProfile('légendaire');p.completedTrials=FORGE_ASCENSIONS.map(t=>t.id);const before=structuredClone(p);
 assert.equal(fuseEvolutionCopies(p,'militia:divine').ok,false);assert.deepEqual(p,before);
});

test('128 graines/niveaux, deux exécutions : objectif accessible, déterminisme et plateau valide',()=>{
 for(const [index,t] of FORGE_ASCENSIONS.entries())for(const level of [0,1,2,3]){
  const p=ascensionProfile(t.from,level,'forge');if(index)p.completedTrials=[FORGE_ASCENSIONS[0].id];const before=structuredClone(p);let won=0;
  for(let seed=1;seed<=16;seed++){
   const a=playAscension(p,t.id,seed),b=playAscension(p,t.id,seed);assert.deepEqual(a,b);assert.deepEqual(p,before);
   const units=a.battle.board.flat().filter(Boolean);assert.ok(units.every(u=>u.hp>0&&Number.isFinite(u.atk)));assert.equal(new Set(units.map(u=>u.uid)).size,units.length);
   if(a.battle.status==='victory'&&a.objective.achieved)won++;
  }
  assert.ok(won>0,`${t.id} niveau ${level}`);
 }
});
