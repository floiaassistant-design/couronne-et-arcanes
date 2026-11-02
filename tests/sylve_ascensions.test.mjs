import test from 'node:test';
import assert from 'node:assert/strict';
import {SYLVE_ASCENSIONS,EVOLUTION_ASCENSIONS,ALL_EVOLUTION_ASCENSIONS,evolutionAscensionFor} from '../src/evolution-trials.js';
import {EVOLUTION_FUSIONS} from '../src/evolution-fusion.js';
import {freshProfile,evolutionTrialAccess,createEvolutionTrial,settleEvolutionTrial,fuseEvolutionCopies,normalizeProfile} from '../src/engine.js';
import {CARDS} from '../src/data.js';
import {trialObjectiveState} from '../src/engine/trial-objectives.js';
import {ascensionProfile,ascensionScenarios,playAscension} from './fixtures/ascension-scenarios.mjs';
import {validStoredBattle,validateImportedProfile} from '../src/ui/storage.js';
import {renderEvolutionTrials,evolutionTrialResult} from '../src/ui/evolution-trials.js';
import {esc} from '../src/ui/markup.js';

const scenarios=ascensionScenarios('sylve');
test('Deux ascensions Sylve, onze recettes par rang, indépendantes des deux ascensions Aube',()=>{
 assert.equal(ALL_EVOLUTION_ASCENSIONS.length,4);assert.equal(EVOLUTION_ASCENSIONS.length,2);assert.equal(SYLVE_ASCENSIONS.length,2);
 for(const t of SYLVE_ASCENSIONS){
  assert.equal(evolutionAscensionFor('sylve',t.to),t);const recipes=EVOLUTION_FUSIONS.filter(r=>r.ascension===t.id);assert.equal(recipes.length,11);
  assert.ok(recipes.every(r=>CARDS[r.cardId].faction==='sylve'&&r.to===t.to&&r.from===t.from&&r.mission===t.mission));
 }
 assert.equal(evolutionAscensionFor('ombre','divine'),null);
 const p=freshProfile();assert.deepEqual(normalizeProfile(p),p);assert.equal(p.completedTrials,undefined);
});

test('Accès : boss 09/12, rang et diversité Sylve, ascension précédente de même faction ; pureté',()=>{
 for(const [index,s] of scenarios.entries()){
  const p=structuredClone(s.profile),before=structuredClone(p);assert.equal(evolutionTrialAccess(p,s.id).ok,true);assert.deepEqual(p,before);
  const mutations=[q=>{q.completed=[]},q=>{q.deck=ascensionProfile(s.trial.from).deck},q=>{q.deck=Array(12).fill({id:'wolf',rarity:s.trial.from})},q=>{q.evolvedCollection={}},q=>{q.deck=q.deck.map(r=>typeof r==='string'?r:{...r,rarity:'épique'})}];
  if(index)mutations.push(q=>{q.completedTrials=['aube-ascension-divine']});
  for(const change of mutations){const q=structuredClone(p);change(q);const old=structuredClone(q);assert.equal(createEvolutionTrial(q,s.id,1).ok,false);assert.deepEqual(q,old);}
  for(const b of [{status:'active'},{status:'victory'},{status:'defeat'}])assert.equal(createEvolutionTrial(p,s.id,1,b).ok,false);
 }
});

test('Deux combats complets : objectifs réels, déblocage unique, ni gain ni consommation, reprise et import',()=>{
 for(const s of scenarios){
  assert.equal(s.terminal.status,'victory');assert.equal(trialObjectiveState(s.terminal).achieved,true);assert.equal(validStoredBattle(s.initial),true);
  const p=structuredClone(s.profile),b=structuredClone(s.terminal),before=structuredClone(p);assert.equal(settleEvolutionTrial(p,b).unlocked,true);
  assert.deepEqual(p,{...before,completedTrials:[...(before.completedTrials||[]),s.id]});assert.deepEqual(validateImportedProfile(p),p);
  const once=structuredClone(p);assert.equal(settleEvolutionTrial(p,b).unlocked,undefined);assert.equal(settleEvolutionTrial(p,structuredClone(s.terminal)).unlocked,undefined);assert.deepEqual(p,once);
  for(const fault of ['defeat','late','other-faction','no-rank','crown','developer']){
   const bad=structuredClone(s.terminal),q=structuredClone(s.profile);
   if(fault==='defeat')bad.status='defeat';if(fault==='late')bad.round=25;if(fault==='crown')bad.heroes.p.hp=1;if(fault==='developer')bad.mode='developer';
   if(fault==='other-faction')for(const u of bad.board.flat())if(u?.side==='p')u.id='militia';
   if(fault==='no-rank')for(const u of bad.board.flat())if(u?.side==='p')u.rarity='épique';
   assert.equal(settleEvolutionTrial(q,bad).unlocked,undefined);assert.deepEqual(q,s.profile);
  }
 }
});

test('Épreuve Sylve ne débloque aucune recette Aube et inversement ; progression sans don ni reset',()=>{
 for(const t of SYLVE_ASCENSIONS){
  const p=ascensionProfile(t.from,2,'sylve');p.completedTrials=EVOLUTION_ASCENSIONS.map(t=>t.id);const before=structuredClone(p);
  assert.match(fuseEvolutionCopies(p,'wolf:'+t.to).reason,/ascension/);assert.deepEqual(p,before);
 }
 const p=ascensionProfile('légendaire');p.completedTrials=SYLVE_ASCENSIONS.map(t=>t.id);const before=structuredClone(p);assert.equal(fuseEvolutionCopies(p,'militia:divine').ok,false);assert.deepEqual(p,before);
});

test('128 graines jouées deux fois : rencontres terminées, déterministes, plateau sain et profil préservé',()=>{
 for(const [index,t] of SYLVE_ASCENSIONS.entries())for(const level of [0,1,2,3]){
  const p=ascensionProfile(t.from,level,'sylve');if(index)p.completedTrials=[SYLVE_ASCENSIONS[0].id];const before=structuredClone(p);let won=0;
  for(let seed=1;seed<=16;seed++){
   const a=playAscension(p,t.id,seed),b=playAscension(p,t.id,seed);assert.deepEqual(a,b);assert.deepEqual(p,before);
   const units=a.battle.board.flat().filter(Boolean);assert.ok(units.every(u=>u.hp>0&&Number.isFinite(u.atk)));assert.equal(new Set(units.map(u=>u.uid)).size,units.length);
   if(a.battle.status==='victory'&&a.objective.achieved)won++;
  }
  assert.ok(won>0,`${t.id} niveau ${level}`);
 }
});

test('Épreuves et résultat : vraie faction, 11 recettes Sylve / 10 Aube, aucun objet de données dans le texte',()=>{
 const html=renderEvolutionTrials(freshProfile(),null,{btn:()=>'',cardUI:()=>'',esc});assert.equal((html.match(/class="card-panel ascension-card"/g)||[]).length,4);
 assert.equal((html.match(/11 fusions à débloquer/g)||[]).length,2);assert.equal((html.match(/10 fusions à débloquer/g)||[]).length,2);assert.match(html,/3 copies libres/);assert.doesNotMatch(html,/\[object Object\]/);
 for(const s of scenarios){assert.match(s.initial.trialChallenge.text,/Sylve/);const result=evolutionTrialResult({unlocked:true,trial:s.trial},{btn:()=>'',cardUI:()=>'',esc});assert.match(result,/Sylve/);assert.doesNotMatch(result,/Aube/);}
});
