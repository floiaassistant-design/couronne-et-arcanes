import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {SYLVE_DESIGN_SOURCE} from '../src/cards/sylve.js';
import {SYLVE_UNIT_IDS,unitVersions,resolveUnitDefinition} from '../src/cards/definitions.js';
import {EVOLUTION_FUSIONS,evolutionFusionFor} from '../src/evolution-fusion.js';
import {cardPack,evolutionPackFor} from '../src/card-packs.js';
import {cardKey,cardReference,ownedCardCopies,playableCardReference} from '../src/cards/references.js';
import {freshProfile,normalizeProfile,buyCardPack,fuseEvolutionCopies,modifyDeck,createBattle,playPlayerCard,playEnemyCard,endPlayerTurn,finishEnemyTurn} from '../src/engine.js';
import {freshLab,setLabLevel,setLabRarity,createLabBattle} from '../src/engine/developer-lab.js';
import {resolveUnitArrival,resolveUnitSupport} from '../src/engine/unit-support.js';
import {hit,resolveRetaliation} from '../src/engine/battle-defense.js';
import {prepareControlUnits,triggerTrap} from '../src/engine/battle-control.js';
import {findCrownGuardian} from '../src/engine/guard-candidates.js';
import {saveProfile,loadProfile,validateImportedProfile,storeBattle,restoreBattle} from '../src/ui/storage.js';
import {cardPresentation} from '../src/ui/card-presentation.js';

// Totaux indépendants des patches, tableau maître relu le 28/10/2026.
const totals={ranger:[[2,4,1],[2,5,1],[3,5,1],[3,5,1]],wolf:[[3,3,1],[3,4,1],[4,4,1],[4,4,1]],treant:[[3,10,2],[3,12,2],[3,12,2]],dryad:[[1,5,2],[1,7,2],[1,7,2]],stag:[[5,6,3],[5,8,3]],thorn:[[2,5,1],[2,6,1],[3,6,1],[3,6,1]],pixie:[[2,3,1],[2,4,1],[2,4,1],[2,4,1]],bear:[[4,9,2],[4,11,2],[5,11,2]],archdruid:[[3,7,3],[3,9,3]],owl:[[2,4,1],[2,5,1],[3,5,1],[3,5,1]],sylvan_trapper:[[2,5,2],[2,6,2],[3,6,2],[3,6,2]]};
const recipes=EVOLUTION_FUSIONS.filter(r=>CARDS[r.cardId].faction==='sylve');
const ready=()=>{const p=freshProfile();p.completed=['01','02','03'];p.gold=2000;return p;};
function storage(){const data={};globalThis.localStorage={getItem:k=>data[k]??null,setItem:(k,v)=>{data[k]=String(v)},removeItem:k=>{delete data[k]}};return data;}
function earned(id,rarity='épique'){
 const p=ready(),recipe=evolutionFusionFor(id,rarity),source=cardReference({id,rarity:recipe.from});
 const used=p.deck.filter(r=>cardKey(r)===cardKey(source)).length;
 if(typeof source==='string')p.collection[source]=used+3;else p.evolvedCollection={[cardKey(source)]:used+3};
 const r=fuseEvolutionCopies(p,recipe.id);assert.equal(r.ok,true);assert.equal(modifyDeck(p,r.target,1),true);
 const b=createBattle(p,{...CAMPAIGN[0],deck:[]},11,{turnFlow:'alternating'});b.heroes.p.hand=[{...r.target,wait:0}];
 assert.equal(playPlayerCard(b,0,0,1).ok,true);return {p,b,u:b.board[0][1]};
}
const unit=(uid,id,side,extra={})=>({uid,id,side,rarity:CARDS[id].rarity,atk:CARDS[id].attack,hp:CARDS[id].hp,maxhp:CARDS[id].hp,armor:0,ranged:false,ability:CARDS[id].ability,stun:0,poison:0,poisonTurns:0,...extra});

test('37 versions Sylve : onze natifs conservés, 26 évolutions et 22 rangs supérieurs non activés',()=>{
 assert.deepEqual([...SYLVE_UNIT_IDS].sort(),Object.keys(totals).sort());assert.equal(recipes.length,26);
 let defined=0;
 for(const [id,expected] of Object.entries(totals)){
  const versions=unitVersions(id);defined+=versions.length;assert.equal(versions.length,expected.length);
  for(const [index,d] of versions.entries()){
   assert.deepEqual([d.stats.attack,d.stats.hp,d.stats.delay],expected[index],d.versionId);
   assert.equal(d.status.engine,'implemented');assert.equal(d.status.combat,'implemented');
   assert.deepEqual(d.pendingDecisions,[]);if(index)assert.strictEqual(d.source,SYLVE_DESIGN_SOURCE);
  }
  for(const rank of ['divine','éveillée'])assert.equal(resolveUnitDefinition(id,rank),null);
 }
 assert.equal(defined,37);assert.equal(Object.keys(CARDS).length,76);
 assert.equal(resolveUnitDefinition('stag','rare'),null);assert.equal(resolveUnitDefinition('archdruid','rare'),null);
 const p=freshProfile(),before=structuredClone(p);assert.deepEqual(normalizeProfile(p),before);
 assert.equal(p.evolvedCollection,undefined);assert.equal(p.completedTrials,undefined);
});

test('Capacités héritées exactes : Charge, Garde/Riposte, poison, piège, soin, Vol et bouclier +5',()=>{
 const a=id=>resolveUnitDefinition(id,'épique').abilities;
 assert.equal(a('wolf').charge.amount,2);assert.equal(resolveUnitDefinition('wolf','épique').geometry.steps,2);
 assert.equal(a('treant').armor.amount,2);assert.equal(a('treant').guard.scope,'positioned');assert.equal(a('treant').riposte.damageMode,'effective-attack');
 assert.equal(a('bear').armor.amount,2);assert.equal(a('bear').guard,undefined);
 assert.deepEqual([a('thorn').poison.amount,a('thorn').poison.resolutions],[1,2]);
 assert.deepEqual([a('sylvan_trapper').trapper.period,a('sylvan_trapper').trapper.damage,a('sylvan_trapper').trapper.stun,a('sylvan_trapper').trapper.resolutions],[3,1,1,3]);
 assert.deepEqual([a('dryad').heal.amount,a('dryad').heal.targets,a('dryad').heal.scope],[2,1,'line']);
 assert.equal(resolveUnitDefinition('pixie','rare').abilities.ward.amount,3);assert.equal(a('pixie').ward.amount,5);assert.equal(a('pixie').ward.cap,20);
 assert.ok(a('pixie').flying);assert.ok(a('owl').flying);assert.equal(resolveUnitDefinition('owl','épique').geometry.range,2);
});

test('37 versions × quatre niveaux × deux camps : vrais chiffres et invocations du laboratoire',()=>{
 for(const id of SYLVE_UNIT_IDS)for(const [index,d] of unitVersions(id).entries())for(const level of [0,1,2,3])for(const side of ['p','e']){
  const lab=freshLab();assert.equal(setLabRarity(lab,side,id,d.rarity).ok,true);assert.equal(setLabLevel(lab,side,id,level).ok,true);
  const before=structuredClone(lab),b=createLabBattle(lab,11);b.heroes[side].hand=[{id,wait:0}];
  if(side==='e')b.phase='enemy';
  assert.equal((side==='p'?playPlayerCard(b,0,0,1):playEnemyCard(b)).ok,true);
  const u=b.board.flat().find(u=>u?.id===id&&u.side===side);assert.ok(u);
  assert.deepEqual([u.atk,u.maxhp],[totals[id][index][0]+level,totals[id][index][1]+level]);
  assert.equal(u.rarity,d.rarity);assert.deepEqual(lab,before);
 }
});

test('Paquets séparés : pools Sylve 9/6/9, aucun mélange dans Aube ou rang supérieur',()=>{
 const sylve=cardPack('sylve-evolution'),aube=cardPack('aube-evolution');
 assert.deepEqual([sylve.cost,sylve.count,sylve.mission],[190,3,'03']);assert.deepEqual(sylve.groups.map(g=>g.weight),[60,35,5]);
 assert.deepEqual(sylve.groups.map(g=>g.cards.length),[9,6,9]);assert.deepEqual(aube.groups.map(g=>g.cards.length),[8,4,8]);
 for(const [pack,faction] of [[sylve,'sylve'],[aube,'aube']])for(const group of pack.groups)for(const ref of group.cards){
  assert.equal(CARDS[typeof ref==='string'?ref:ref.id].faction,faction);assert.ok(playableCardReference(ref));
  if(typeof ref==='object')assert.ok(['rare','épique'].includes(ref.rarity));
 }
 for(const recipe of recipes)assert.equal(evolutionPackFor(recipe.cardId,recipe.to)?.id,recipe.to==='légendaire'?undefined:sylve.id);
});

test('Les quinze évolutions sont réellement tirées, invoquées, exportables et reprises, avec leurs stocks exacts',()=>{
 const pack=cardPack('sylve-evolution');
 for(const group of pack.groups.slice(1))for(const [index,ref] of group.cards.entries()){
  const p=ready();let calls=0;const roll=ref.rarity==='rare'?.7:.97;
  const result=buyCardPack(p,pack.id,()=>calls++%2===0?roll:(index+.5)/group.cards.length);
  assert.deepEqual(result.cards,[ref,ref,ref]);assert.equal(calls,6);assert.equal(ownedCardCopies(p,ref),3);assert.equal(p.gold,1810);
  assert.equal(modifyDeck(p,ref,1),true);assert.deepEqual(validateImportedProfile(p),p);
  storage();assert(saveProfile(p));assert.deepEqual(loadProfile(),p);
  const b=createBattle(p,CAMPAIGN[0],1);b.heroes.p.hand=[{...ref,wait:0}];assert.equal(playPlayerCard(b,0,0,1).ok,true);
  assert.equal(b.board[0][1].rarity,ref.rarity);assert.equal(b.mode,'campaign');assert(storeBattle(b));assert.deepEqual(restoreBattle(),b);
 }
});

test('Rangs exacts, accès de campagne et copies protégées : aucune consommation implicite',()=>{
 for(const recipe of recipes){
  const p=ready(),source=cardReference({id:recipe.cardId,rarity:recipe.from});p.deck[0]=source;
  const used=p.deck.filter(ref=>cardKey(ref)===cardKey(source)).length;
  if(typeof source==='string')p.collection[source]=used+2;else p.evolvedCollection={[cardKey(source)]:used+2};
  const before=structuredClone(p);assert.equal(fuseEvolutionCopies(p,recipe.id).ok,false);assert.deepEqual(p,before);
  p.completed=[];assert.equal(fuseEvolutionCopies(p,recipe.id).ok,false);
 }
 const p=ready(),before=structuredClone(p);p.completed=[];assert.equal(buyCardPack(p,'sylve-evolution').ok,false);p.completed=before.completed;assert.deepEqual(p,before);
});

test('Luciole Épique obtenue : +5 effectifs, plafond 20 et arrivée non rejouée après sauvegarde',()=>{
 const {b,u}=earned('pixie');assert.equal(b.heroes.p.shield,5);assert.equal(u.maxhp,4);
 const once=structuredClone(b);resolveUnitArrival(b,u,0,1,{hit,emit:()=>{}});assert.deepEqual(b,once);
 storage();storeBattle(b);assert.deepEqual(restoreBattle(),b);
 b.heroes.p.shield=19;delete u.arrivalResolved;resolveUnitArrival(b,u,0,1,{hit,emit:()=>{}});assert.equal(b.heroes.p.shield,20);
});

test('Gardien Épique obtenu : Garde/Riposte effectives, Ours sans Garde, Dryade avec soin réel',()=>{
 const {b,u}=earned('treant');assert.equal(findCrownGuardian(b,0,'p',3).u,u);
 const foe=unit(900,'militia','e',{hp:20,maxhp:20});b.board[0][2]=foe;
 assert.equal(resolveRetaliation(b,u,foe,0,1,2,1),true);assert.equal(foe.hp,16);assert.equal(resolveRetaliation(b,u,foe,0,1,2,1),false);
 const bear=earned('bear');assert.equal(findCrownGuardian(bear.b,0,'p',3),null);
 const dryad=earned('dryad'),ally=unit(901,'wolf','p',{hp:1});dryad.b.board[0][2]=ally;
 resolveUnitSupport(dryad.b,'p',()=>{});assert.equal(ally.hp,3);assert.equal(dryad.u.maxhp,7);
});

test('Loup et Hibou Épiques obtenus : Célérité/Charge et Vol/portée exécutés par le moteur commun',()=>{
 const wolf=earned('wolf'),foe=unit(900,'militia','e',{hp:20,maxhp:20,stun:99});wolf.b.board[0][4]=foe;
 endPlayerTurn(wolf.b);assert.equal(wolf.b.board[0][3],wolf.u);assert.equal(foe.hp,14);assert.equal(wolf.u.atk,4);
 const owl=earned('owl'),target=unit(902,'militia','e',{hp:20,maxhp:20,stun:99});owl.b.board[0][2]=unit(901,'militia','p',{stun:99});owl.b.board[0][4]=target;
 endPlayerTurn(owl.b);assert.equal(owl.b.board[0][3],owl.u);assert.equal(target.hp,17);
});

test('Traqueur et Trappeur Épiques obtenus : poison et pièges natifs restent actifs avec leurs quotas',()=>{
 const thorn=earned('thorn'),foe=unit(900,'militia','e',{hp:20,maxhp:20,stun:99});thorn.b.board[0][2]=foe;
 endPlayerTurn(thorn.b);assert.deepEqual([foe.poison,foe.poisonTurns],[1,2]);finishEnemyTurn(thorn.b);assert.deepEqual([foe.hp,foe.poisonTurns],[16,1]);
 const trapper=earned('sylvan_trapper');trapper.b.round=3;
 prepareControlUnits(trapper.b,{hit,emit:()=>{},note:()=>{},enter:()=>{}},'p');assert.equal(trapper.b.traps.length,1);assert.equal(trapper.b.traps[0].damage,1);
 prepareControlUnits(trapper.b,{hit,emit:()=>{},note:()=>{},enter:()=>{}},'p');assert.equal(trapper.b.traps.length,1);
 const trapped=unit(903,'militia','e');trapper.b.board[0][2]=trapped;assert.equal(triggerTrap(trapper.b,trapped,0,2,hit),true);assert.deepEqual([trapped.hp,trapped.stun],[4,1]);
 storage();storeBattle(trapper.b);assert.deepEqual(restoreBattle(),trapper.b);
 const text=cardPresentation({id:'sylvan_trapper',rarity:'épique'});assert.match(text.card.description,/Piège 1/);assert.match(text.details.join(' '),/3 tours/);
});
