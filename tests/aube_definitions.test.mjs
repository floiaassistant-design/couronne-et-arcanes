import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS} from '../src/data.js';
import {CARD_RARITIES,normalizeCardRarity} from '../src/cards/schema.js';
import {AUBE_UNIT_IDS,resolveUnitDefinition,unitVersions,unitVersionReference,unitVersionPlayable} from '../src/cards/definitions.js';

// Totaux transcrits de Notion, indépendants des patches du registre (25/10/2026, 17:28:45.661Z).
// https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f
const totals={
 militia:[[2,5,1],[2,5,1],[2,5,1],[2,8,1],[2,8,1],[2,8,1]],
 shield:[[1,9,1],[1,11,1],[2,11,1],[2,13,1],[2,13,1],[2,13,1]],
 archer:[[2,3,1],[2,4,1],[3,4,1],[3,4,1],[3,4,1],[3,4,1]],
 cleric:[[1,4,2],[1,6,2],[1,6,2],[1,6,2],[1,6,2]],
 paladin:[[4,9,3],[4,11,3],[4,11,3],[4,13,3]],
 banner:[[2,6,2],[2,8,2],[2,8,2],[2,8,2],[2,8,2]],
 scoutcaptain:[[3,6,1],[3,8,1],[4,8,1],[4,8,1],[4,8,1]],
 sunpriest:[[2,7,2],[2,9,2],[2,9,2],[2,9,2],[2,9,2]],
 lancer:[[3,5,1],[3,6,1],[4,6,1],[4,8,1],[4,8,1],[4,8,1]],
 dawnbastion:[[5,11,4],[5,11,4],[7,11,4]]
};
const version=(id,rank)=>resolveUnitDefinition(id,rank);

test('51 versions Aube : tous les totaux et délais Notion, 9 rangs inférieurs inexistants',()=>{
 assert.deepEqual([...AUBE_UNIT_IDS].sort(),Object.keys(totals).sort());
 const identities=new Set();let missing=0;
 for(const [id,expected] of Object.entries(totals)){
  const nativeIndex=CARD_RARITIES.findIndex(r=>r.id===CARDS[id].rarity);
  assert.equal(unitVersions(id).length,expected.length,id);
  for(const [index,rank] of CARD_RARITIES.entries()){
   const def=version(id,rank.id);
   if(index<nativeIndex){assert.equal(def,null,id+' '+rank.id);missing++;continue;}
   const [attack,hp,delay]=expected[index-nativeIndex];
   assert.deepEqual(def.stats,{attack,hp,delay},id+' '+rank.id);
   assert.equal(def.id,id);assert.equal(def.rarity,rank.id);
   assert.equal(def.nativeRarity,CARDS[id].rarity);
   assert(!identities.has(def.versionId));identities.add(def.versionId);
   assert.equal(unitVersionPlayable({id,rarity:rank.id}),index===nativeIndex);
   assert.equal(def.status.combat,index===nativeIndex?'implemented':'pending');
   assert.equal(def.status.obtaining,index===nativeIndex?'existing':'undefined');
  }
 }
 assert.equal(identities.size,51);assert.equal(missing,9);
});

test('Identité : un ID historique reste natif ; alias normalisés ; référence explicite invalide refusée',()=>{
 assert.equal(normalizeCardRarity('Divin'),'divine');
 assert.equal(normalizeCardRarity('Éveillé'),'éveillée');
 assert.equal(normalizeCardRarity('e\u0301pique'),'épique');
 assert.equal(normalizeCardRarity('inconnu'),null);
 for(const id of Object.keys(totals)){
  assert.strictEqual(resolveUnitDefinition(id),version(id,CARDS[id].rarity));
  for(const def of unitVersions(id)){
   const ref=unitVersionReference(id,def.rarity);
   assert.deepEqual(ref,{id,rarity:def.rarity});
   assert.strictEqual(resolveUnitDefinition(ref),def);
   assert.strictEqual(resolveUnitDefinition({...ref,uid:12,wait:0}),def);
   assert.equal(resolveUnitDefinition(def.versionId),null,'Une clé de version ne devient pas un nouvel ID de CARDS');
  }
 }
 for(const ref of [null,{},[],{id:'militia',rarity:null},{id:'militia',rarity:''},
  {id:'militia',rarity:'inconnue'},'inconnu','__proto__','toString','firebolt'])assert.equal(resolveUnitDefinition(ref),null);
 assert.equal(unitVersionReference('paladin','rare'),null);
 assert.deepEqual(unitVersions('inconnu'),[]);
});

test('Données immuables : ni la consultation ni un appelant ne peuvent modifier une autre version',()=>{
 const before=JSON.stringify(unitVersions('militia'));
 assert.throws(()=>{version('militia','rare').abilities.firstHitReduction.amount=99;},TypeError);
 assert.throws(()=>{version('militia','rare').stats.hp=99;},TypeError);
 assert.throws(()=>{unitVersions('militia').pop();},TypeError);
 assert.throws(()=>{version('shield','rare').pendingDecisions.push('x');},TypeError);
 assert.throws(()=>{unitVersionReference('militia','rare').rarity='commun';},TypeError);
 assert.equal(JSON.stringify(unitVersions('militia')),before);
});

test('Milicien : réduction remplacée 1/2/2/3/3, 8 PV totaux, riposte et Rempart hérités une seule fois',()=>{
 const defs=unitVersions('militia');
 assert.deepEqual(defs.map(d=>d.abilities.firstHitReduction?.amount||0),[0,1,2,2,3,3]);
 assert.deepEqual(defs.map(d=>Object.keys(d.abilities)),[
  [],['firstHitReduction'],['firstHitReduction'],['firstHitReduction'],
  ['firstHitReduction','riposte'],['firstHitReduction','riposte','lastStand']
 ]);
 for(const d of defs.slice(1))assert.equal(d.abilities.firstHitReduction.frequency,'invocation');
 for(const d of defs.slice(4))assert.deepEqual(d.abilities.riposte,
  {damageMode:'effective-attack',frequency:'invocation',trigger:'melee-attack'});
 assert.deepEqual(defs[5].abilities.lastStand,{hp:5,frequency:'invocation'});
 for(const d of defs){assert.deepEqual(d.geometry,{steps:1,range:1});assert(!d.abilities.guard);}
});

test('Porte-égide : Armure 2 héritée, Garde étendue sans duplication, politique validée et natif historique',()=>{
 const defs=unitVersions('shield');
 assert.deepEqual(defs.map(d=>d.abilities.guard.scope),['legacy-line','positioned','positioned','positioned','line','all-lines']);
 for(const d of defs){
  assert.deepEqual(d.abilities.armor,{amount:2,minimumDamage:1});
  assert.deepEqual(Object.keys(d.abilities).sort(),['armor','guard','riposte']);
  assert.deepEqual(d.geometry,{steps:1,range:1});
  assert.equal(d.abilities.riposte.damageMode,d.source?'effective-attack':'fixed');
 }
 assert.deepEqual(defs[0].pendingDecisions,[]);
 for(const d of defs.slice(1))assert.deepEqual(d.pendingDecisions,[]);
 assert.equal(defs[4].abilities.guard.unitTargetPriority,false);
});

test('Arbalétrière : portée 2/3 héritée, Perforation primaire et tir arrière protégé indépendants',()=>{
 const defs=unitVersions('archer');
 assert.deepEqual(defs.map(d=>d.geometry.range),[2,2,2,3,3,3]);
 for(const d of defs){assert.equal(d.geometry.steps,1);assert(d.abilities.ranged);}
 for(const d of defs.slice(0,4))assert(!d.abilities.pierce);
 for(const d of defs.slice(4))assert.deepEqual(d.abilities.pierce,{target:'primary',ignoreArmor:true});
 assert.deepEqual(defs[5].abilities.rearShot,{amount:2,target:'enemy-immediately-behind-primary',ignoreArmor:false});
 assert.equal(Object.keys(defs[5].abilities).length,3);
});

test('Sœur et Prieur : montant, cibles et lignes hérités ; barrière uniquement après soin effectif',()=>{
 const sisters=unitVersions('cleric'),priests=unitVersions('sunpriest');
 assert.deepEqual(sisters.map(d=>[d.abilities.heal.amount,d.abilities.heal.targets,d.abilities.heal.scope]),
  [[2,1,'line'],[2,1,'line'],[3,1,'line'],[3,2,'line'],[3,2,'all-lines']]);
 assert.deepEqual(priests.map(d=>[d.abilities.heal.amount,d.abilities.heal.targets,d.abilities.heal.scope]),
  [[2,1,'line'],[2,1,'line'],[3,1,'line'],[3,1,'line'],[3,1,'line']]);
 for(const d of [...sisters,...priests]){
  assert.equal(d.abilities.heal.timing,'after-attacks');
  assert.equal(d.abilities.heal.selection,'injury-ratio');assert.equal(d.abilities.heal.includeSelf,true);
 }
 assert.deepEqual(priests.map(d=>d.abilities.healBarrier?.amount||0),[0,0,0,1,2]);
 for(const d of priests.slice(3)){
  assert.equal(d.abilities.healBarrier.cap,2);assert.equal(d.abilities.healBarrier.trigger,'effective-heal');
  assert.equal(d.abilities.healBarrier.target,'healed-unit');
 }
});

test('Paladin : Armure 3 remplace 2, barrière personnelle plafonnée après Riposte autorisée',()=>{
 const defs=unitVersions('paladin');
 assert.deepEqual(defs.map(d=>d.abilities.armor.amount),[2,2,3,3]);
 for(const d of defs){assert.equal(d.abilities.riposte.frequency,'round');assert.equal(d.abilities.riposte.damageMode,d.source?'effective-attack':'fixed');}
 assert.deepEqual(defs[3].abilities.riposteBarrier,
  {amount:2,cap:2,frequency:'round',target:'self',trigger:'authorized-riposte'});
 for(const d of defs.slice(1))assert.deepEqual(d.pendingDecisions,[]);
});

test('Porte-étendard et Capitaine : Inspiration unique, cadence et cibles distinctes, arrivée héritée',()=>{
 const banners=unitVersions('banner'),captains=unitVersions('scoutcaptain');
 assert.deepEqual(banners.map(d=>[d.abilities.inspire.amount,d.abilities.inspire.targets,d.abilities.inspire.scope,d.abilities.inspire.period]),
  [[1,1,'line',3],[1,1,'line',3],[1,2,'line',3],[2,2,'line',3],[2,2,'all-lines',3]]);
 assert.deepEqual(captains.map(d=>[d.abilities.inspire.amount,d.abilities.inspire.targets,d.abilities.inspire.scope,d.abilities.inspire.period]),
  [[1,1,'line',3],[1,1,'line',3],[1,1,'line',3],[1,1,'line',2],[1,1,'line',2]]);
 for(const d of [...banners,...captains]){assert.equal(d.abilities.inspire.cap,12);assert.equal(d.abilities.inspire.includeSelf,false);}
 assert.deepEqual(captains[4].abilities.arrivalInspire,
  {amount:1,targets:1,scope:'line',includeSelf:false,cap:12,timing:'spawn'});
 assert.equal(Object.keys(captains[4].abilities).length,2);
});

test('Lancier : Charge 3 remplace 2, Célérité seulement Éveillé et Perforation conservée',()=>{
 const defs=unitVersions('lancer');
 assert.deepEqual(defs.map(d=>d.abilities.charge.amount),[2,2,2,2,3,3]);
 assert.deepEqual(defs.map(d=>d.geometry.steps),[1,1,1,1,1,2]);
 for(const d of defs){assert.equal(d.geometry.range,1);assert.equal(d.abilities.pierce.ignoreArmor,true);assert.equal(d.abilities.charge.condition,'moved-before-attack');}
 assert(defs[5].abilities.haste);for(const d of defs.slice(0,5))assert(!d.abilities.haste);
});

test('Ange : une Intervention héritée, Protection +3 plafonnée 20, Vol, Riposte et attaque normale distincts',()=>{
 const defs=unitVersions('dawnbastion');
 assert(!defs[0].abilities.intervention);
 for(const d of defs){
  assert.deepEqual(d.abilities.ward,{amount:3,cap:20,target:'own-crown',timing:'spawn'});
  assert.deepEqual(d.geometry,{steps:1,range:1});assert(d.abilities.flying);
  assert.equal(d.abilities.riposte.frequency,'round');
 }
 for(const d of defs.slice(1)){
  assert.deepEqual(d.abilities.intervention,{amount:4,range:2,targets:1,scope:'line',direction:'forward',timing:'spawn',ignoreArmor:false});
  assert.equal(Object.keys(d.abilities).filter(k=>k==='intervention').length,1);
  assert.deepEqual(d.pendingDecisions,[]);
 }
});
