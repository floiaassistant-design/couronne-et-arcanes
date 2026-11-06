import test from 'node:test';
import assert from 'node:assert/strict';
import {ETHER_ASCENSIONS,evolutionAscensionFor} from '../src/evolution-trials.js';
import {EVOLUTION_FUSIONS} from '../src/evolution-fusion.js';
import {createEvolutionTrial,settleEvolutionTrial,fuseEvolutionCopies} from '../src/engine.js';
import {trialObjectiveState} from '../src/engine/trial-objectives.js';
import {validStoredBattle,validateImportedProfile} from '../src/ui/storage.js';
import {ascensionProfile,ascensionScenarios,playAscension} from './fixtures/ascension-scenarios.mjs';

const scenarios=ascensionScenarios('ether'),id='ether-ascension-divine';
test('Deux ascensions Éther : onze recettes Divines et onze Éveillées',()=>{
 const [divine,awakened]=ETHER_ASCENSIONS;assert.equal(ETHER_ASCENSIONS.length,2);
 assert.equal(evolutionAscensionFor('ether','divine'),divine);
 assert.equal(evolutionAscensionFor('ether','éveillée'),awakened);
 assert.deepEqual(divine.goal,{distinct:3,crownPercent:40,maxRound:24});assert.equal(divine.mission,'09');
 assert.deepEqual(awakened.goal,{distinct:4,crownPercent:60,maxRound:24});assert.equal(awakened.mission,'12');assert.equal(awakened.previous,id);
 assert.deepEqual(EVOLUTION_FUSIONS.filter(r=>r.ascension===id).map(r=>r.cardId).sort(),['aetherknight','dragon','elemental','griffin','mystic','portal_walker','seer','sentinel','seraph','spark','tempest']);
 assert.deepEqual(EVOLUTION_FUSIONS.filter(r=>r.ascension===awakened.id).map(r=>r.cardId).sort(),['aetherknight','dragon','elemental','griffin','mystic','portal_walker','seer','sentinel','seraph','spark','tempest']);
});
test('Éveil Éther : victoire en mission 12 et ascension Divine Éther, puis reçu sans cadeau',()=>{
 const s=scenarios[1];assert(validStoredBattle(s.initial));assert(trialObjectiveState(s.terminal).achieved);
 for(const change of [p=>{p.completed=p.completed.filter(id=>id!=='12');},p=>{p.completedTrials=['forge-ascension-divine'];},p=>{p.deck=scenarios[0].profile.deck;},p=>{p.deck=Array(12).fill({id:'sentinel',rarity:'divine'});}]){
  const p=structuredClone(s.profile);change(p);
  assert.equal(createEvolutionTrial(p,s.id,1).ok,false);assert.equal(fuseEvolutionCopies(p,'mystic:éveillée').ok,false);
 }
 const p=structuredClone(s.profile);assert(createEvolutionTrial(p,s.id,s.seed).ok);
 assert(!fuseEvolutionCopies(p,'mystic:éveillée').ok);
 assert(settleEvolutionTrial(p,structuredClone(s.terminal)).unlocked);
 assert.deepEqual(p,{...s.profile,completedTrials:[id,s.id]});assert.deepEqual(validateImportedProfile(p),p);
 assert(!settleEvolutionTrial(p,structuredClone(s.terminal)).unlocked);
 for(const {cardId:id} of EVOLUTION_FUSIONS.filter(r=>r.ascension===s.id)){
  const q=structuredClone(p);assert(fuseEvolutionCopies(q,id+':éveillée').ok);assert.deepEqual(q.deck,p.deck);
  assert.equal(q.evolvedCollection[id+':divine'],p.evolvedCollection[id+':divine']-3);
 }
});
test('Accès : boss réellement vaincu, trois Légendaires Éther distinctes, exemplaires possédés, aucun combat en attente',()=>{
 const s=scenarios[0];assert(createEvolutionTrial(s.profile,id,1).ok);
 for(const fault of [p=>{p.completed=[];},p=>{p.deck=ascensionProfile().deck;},p=>{p.deck=Array(12).fill({id:'sentinel',rarity:'légendaire'});},p=>{p.evolvedCollection={};}]){
  const p=structuredClone(s.profile);fault(p);const before=structuredClone(p);assert.equal(createEvolutionTrial(p,id,1).ok,false);assert.deepEqual(p,before);
 }
 for(const status of ['active','victory','defeat'])assert.equal(createEvolutionTrial(s.profile,id,1,{status}).ok,false);
 for(const rank of ['divine','éveillée']){
  const p=ascensionProfile('légendaire',2,'ether');p.completedTrials=['forge-ascension-divine','forge-ascension-eveillee'];const before=structuredClone(p);
  assert.equal(fuseEvolutionCopies(p,'spark:'+rank).ok,false);assert.deepEqual(p,before);
 }
});
test('Combat complet et reçu unique : objectifs, reprise, ressources et stocks conservés, défaite/hors objectif refusés',()=>{
 const s=scenarios[0],p=structuredClone(s.profile),b=structuredClone(s.terminal),before=structuredClone(p);
 assert(validStoredBattle(s.initial));assert.equal(b.status,'victory');assert(trialObjectiveState(b).achieved);
 assert(settleEvolutionTrial(p,b).unlocked);assert.deepEqual(p,{...before,completedTrials:[id]});assert.deepEqual(validateImportedProfile(p),p);
 const once=structuredClone(p);assert.equal(settleEvolutionTrial(p,b).unlocked,undefined);assert.deepEqual(p,once);
 for(const fault of [b=>{b.status='defeat';},b=>{b.round=25;},b=>{b.heroes.p.hp=1;},b=>{for(const u of b.board.flat())if(u?.side==='p')u.rarity='commun';},b=>{b.mode='developer';}]){
  const q=structuredClone(s.profile),bad=structuredClone(s.terminal);fault(bad);assert.equal(settleEvolutionTrial(q,bad).unlocked,undefined);assert.deepEqual(q,s.profile);
 }
 for(const r of EVOLUTION_FUSIONS.filter(r=>r.ascension===id)){
  const q=structuredClone(p),deck=structuredClone(q.deck);assert(fuseEvolutionCopies(q,r.id).ok);assert.deepEqual(q.deck,deck);
 }
});
test('64 graines/niveaux rejouées : succès accessible, déterminisme, plateau valide et profil inchangé',()=>{
 for(const level of [0,1,2,3]){
  const p=ascensionProfile('légendaire',level,'ether'),before=structuredClone(p);let won=0;
  for(let seed=1;seed<=16;seed++){
   const a=playAscension(p,id,seed),b=playAscension(p,id,seed);assert.deepEqual(a,b);assert.deepEqual(p,before);
   const units=a.battle.board.flat().filter(Boolean);assert(units.every(u=>u.hp>0&&Number.isFinite(u.atk)));assert.equal(new Set(units.map(u=>u.uid)).size,units.length);
   if(a.battle.status==='victory'&&a.objective.achieved)won++;
  }
  assert(won>0,'niveau '+level);
 }
});
