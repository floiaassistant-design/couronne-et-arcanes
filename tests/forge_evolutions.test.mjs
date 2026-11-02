import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {FORGE_DESIGN_SOURCE} from '../src/cards/forge.js';
import {FORGE_UNIT_IDS,VERSIONED_UNIT_IDS,unitVersions,resolveUnitDefinition} from '../src/cards/definitions.js';
import {EVOLUTION_FUSIONS,evolutionFusionFor} from '../src/evolution-fusion.js';
import {cardPack,evolutionPackFor} from '../src/card-packs.js';
import {cardReference,cardKey,ownedCardCopies,playableCardReference} from '../src/cards/references.js';
import {freshProfile,normalizeProfile,previewEvolutionFusion,fuseEvolutionCopies,modifyDeck,buyCardPack,createBattle,playPlayerCard,playEnemyCard} from '../src/engine.js';
import {freshLab,setLabRarity,setLabLevel,createLabBattle} from '../src/engine/developer-lab.js';
import {findCrownGuardian} from '../src/engine/guard-candidates.js';
import {saveProfile,loadProfile,validateImportedProfile,storeBattle,restoreBattle} from '../src/ui/storage.js';
import {cardPresentation} from '../src/ui/card-presentation.js';

const expected={
 smith:[[3,6,1],[3,8,1],[4,8,1]],
 golem:[[2,12,2],[2,14,2]],
 bomb:[[4,3,2],[4,5,2]],
 drill:[[2,5,1],[2,7,1],[3,7,1]],
 colossus:[[6,13,4]],
 engineer:[[3,7,3]],
 cannon:[[5,7,3]],
 mechanist:[[2,8,2],[2,10,2]],
 ironwraith:[[2,7,1],[2,9,1],[3,9,1]],
 alchemist:[[3,5,2],[3,7,2]]
};
const forgeRecipes=EVOLUTION_FUSIONS.filter(r=>CARDS[r.cardId].faction==='forge');
const ready=()=>{const p=freshProfile();p.gold=2000;p.completed=['01','02','03'];return p;};
function localStorageMock(){const values={};globalThis.localStorage={getItem:k=>values[k]??null,setItem:(k,v)=>{values[k]=String(v)},removeItem:k=>{delete values[k]}};}
function stocked(recipe){
 const p=ready(),source=cardReference({id:recipe.cardId,rarity:recipe.from});
 const held=p.deck.filter(ref=>cardKey(ref)===cardKey(source)).length;
 if(typeof source==='string')p.collection[source]=held+3;
 else p.evolvedCollection={[cardKey(source)]:held+3};
 return p;
}

test('Forge : dix natives inchangées, dix évolutions validées, aucun rang futur inventé',()=>{
 assert.deepEqual([...FORGE_UNIT_IDS].sort(),Object.keys(expected).sort());
 assert.equal(forgeRecipes.length,10);assert.equal(VERSIONED_UNIT_IDS.filter(id=>FORGE_UNIT_IDS.includes(id)).length,7);
 assert.equal(Object.keys(CARDS).length,76);
 let total=0;
 for(const [id,totals] of Object.entries(expected)){
  const versions=unitVersions(id);total+=versions.length;assert.equal(versions.length,totals.length,id);
  for(const [i,d] of versions.entries()){
   assert.deepEqual([d.stats.attack,d.stats.hp,d.stats.delay],totals[i],d.versionId);
   assert.equal(d.status.combat,'implemented');assert.deepEqual(d.pendingDecisions,[]);
   if(i){assert.strictEqual(d.source,FORGE_DESIGN_SOURCE);assert.equal(d.status.obtaining,'fusion');}
   else assert.equal(d.rarity,CARDS[id].rarity);
  }
  for(const rank of ['légendaire','divine','éveillée']){
   if(rank!==CARDS[id].rarity)assert.equal(resolveUnitDefinition(id,rank),null,id+':'+rank);
  }
 }
 assert.equal(total,20);
 const p=freshProfile();assert.deepEqual(normalizeProfile(p),p);assert.equal(p.evolvedCollection,undefined);
});

test('Dix évolutions : capacités natives et géométrie héritées à l’identique',()=>{
 const a=(id,r='épique')=>resolveUnitDefinition(id,r).abilities;
 assert.equal(a('golem').armor.amount,2);assert.equal(a('golem').guard.scope,'positioned');assert.equal(a('golem').riposte.damageMode,'effective-attack');
 assert.equal(a('bomb').splash.amount,2);assert.equal(a('bomb').splash.target,'contiguous-enemies-behind-primary');
 assert.equal(a('drill').armor.amount,2);assert.deepEqual(resolveUnitDefinition('drill','épique').geometry,{steps:1,range:1});
 assert.equal(a('mechanist').inspire.amount,1);assert.equal(a('mechanist').inspire.period,3);assert.equal(a('mechanist').inspire.cap,12);
 assert.equal(a('ironwraith').ward.amount,3);assert.equal(a('ironwraith').ward.cap,20);
 assert.deepEqual([a('alchemist').poison.amount,a('alchemist').poison.resolutions],[1,2]);
 assert.deepEqual(Object.keys(a('smith')),[]);assert.equal(a('golem').flying,undefined);
 assert.equal(a('bomb').guard,undefined);assert.equal(a('drill').riposte,undefined);
 assert.equal(evolutionFusionFor('colossus','divine'),undefined);assert.equal(evolutionFusionFor('engineer','légendaire'),undefined);
 assert.equal(playableCardReference({id:'smith',rarity:'légendaire'}),false);
});

test('Fusions Forge : trois copies libres du rang exact, mission requise et deck protégé',()=>{
 for(const recipe of forgeRecipes){
  assert.equal(recipe.copies,3);assert.equal(recipe.mission,recipe.to==='rare'?'01':'03');assert.equal(recipe.ascension,undefined);
  const p=stocked(recipe),before=structuredClone(p);
  assert.equal(previewEvolutionFusion(p,recipe.id).ok,true);
  const result=fuseEvolutionCopies(p,recipe.id);assert.equal(result.ok,true,recipe.id);
  assert.equal(ownedCardCopies(p,result.source),before.deck.filter(x=>cardKey(x)===cardKey(result.source)).length);
  assert.equal(ownedCardCopies(p,result.target),1);assert.equal(modifyDeck(p,result.target,1),true);
  assert.deepEqual(validateImportedProfile(p),p);localStorageMock();assert(saveProfile(p));assert.deepEqual(loadProfile(),p);
  const battle=createBattle(p,CAMPAIGN[0],1);battle.heroes.p.hand=[{...result.target,wait:0}];
  assert.equal(playPlayerCard(battle,0,0,1).ok,true,recipe.id);
  assert.equal(battle.board[0][1].rarity,recipe.to);assert.equal(battle.board[0][1].cardRules,'cards-v2');
  assert(storeBattle(battle));assert.deepEqual(restoreBattle(),battle);
  const blocked=stocked(recipe),source=cardReference({id:recipe.cardId,rarity:recipe.from});
  blocked.deck[0]=source;const snapshot=structuredClone(blocked);
  assert.equal(fuseEvolutionCopies(blocked,recipe.id).ok,false);assert.deepEqual(blocked,snapshot);
  const locked=stocked(recipe);locked.completed=[];const lockedBefore=structuredClone(locked);
  assert.equal(fuseEvolutionCopies(locked,recipe.id).ok,false);assert.deepEqual(locked,lockedBefore);
 }
});

test('Paquet Forge : 7 natives, 3 Rares, 7 Épiques ; aucun mélange ni rang supérieur',()=>{
 const pack=cardPack('forge-evolution');
 assert.deepEqual([pack.cost,pack.count,pack.mission],[190,3,'03']);
 assert.deepEqual(pack.groups.map(g=>g.weight),[60,35,5]);
 assert.deepEqual(pack.groups.map(g=>g.cards.length),[7,3,7]);
 assert.deepEqual(pack.groups[1].cards.map(cardKey).sort(),['smith:rare','drill:rare','ironwraith:rare'].sort());
 for(const group of pack.groups)for(const ref of group.cards){
  assert.equal(CARDS[typeof ref==='string'?ref:ref.id].faction,'forge');
  assert.equal(playableCardReference(ref),true);
  if(typeof ref==='object')assert.ok(['rare','épique'].includes(ref.rarity));
 }
 for(const recipe of forgeRecipes)assert.equal(evolutionPackFor(recipe.cardId,recipe.to)?.id,'forge-evolution');
 for(const id of ['colossus','engineer','cannon'])assert.equal(evolutionPackFor(id,'légendaire'),null);
 assert.deepEqual(cardPack('aube-evolution').groups.map(g=>g.cards.length),[8,4,8]);
 assert.deepEqual(cardPack('sylve-evolution').groups.map(g=>g.cards.length),[9,6,9]);
 assert.deepEqual(cardPack('ombre-evolution').groups.map(g=>g.cards.length),[8,3,8]);
 assert.equal(cardPack('mystic').cost,95);
});

test('Chaque Rare/Épique Forge peut être tirée, sauvegardée, mise au deck et invoquée',()=>{
 const pack=cardPack('forge-evolution');
 for(const group of pack.groups.slice(1))for(const [i,ref] of group.cards.entries()){
  const p=ready();let calls=0,roll=ref.rarity==='rare'?.7:.97;
  const result=buyCardPack(p,pack.id,()=>calls++%2===0?roll:(i+.5)/group.cards.length);
  assert.equal(calls,6);assert.deepEqual(result.cards,[ref,ref,ref]);assert.equal(p.gold,1810);
  assert.equal(ownedCardCopies(p,ref),3);assert.equal(modifyDeck(p,ref,1),true);
  assert.deepEqual(validateImportedProfile(p),p);localStorageMock();assert(saveProfile(p));assert.deepEqual(loadProfile(),p);
  const battle=createBattle(p,CAMPAIGN[0],1);battle.heroes.p.hand=[{...ref,wait:0}];
  assert.equal(playPlayerCard(battle,0,0,1).ok,true);assert.equal(battle.board[0][1].rarity,ref.rarity);
  assert(storeBattle(battle));assert.deepEqual(restoreBattle(),battle);
 }
 const p=ready(),before=structuredClone(p);p.completed=['01','02'];
 const locked=structuredClone(p);assert.equal(buyCardPack(p,pack.id,()=>0).ok,false);assert.deepEqual(p,locked);
 assert.notDeepEqual(p,before);
});

test('Laboratoire : 20 versions Forge × 4 niveaux × 2 camps, aucun gain réel',()=>{
 for(const id of FORGE_UNIT_IDS)for(const [i,def] of unitVersions(id).entries())for(const level of [0,1,2,3])for(const side of ['p','e']){
  const lab=freshLab();
  assert.equal(setLabRarity(lab,side,id,def.rarity).ok,true);
  assert.equal(setLabLevel(lab,side,id,level).ok,true);
  const before=structuredClone(lab),battle=createLabBattle(lab,11);
  battle.heroes[side].hand=[{id,wait:0}];if(side==='e')battle.phase='enemy';
  assert.equal((side==='p'?playPlayerCard(battle,0,0,1):playEnemyCard(battle)).ok,true,id+':'+def.rarity);
  const unit=battle.board.flat().find(u=>u?.id===id&&u.side===side);
  assert.ok(unit);assert.deepEqual([unit.atk,unit.maxhp],[expected[id][i][0]+level,expected[id][i][1]+level]);
  assert.equal(unit.rarity,def.rarity);assert.deepEqual(lab,before);
 }
});

test('Fiches Forge : versions définies lisibles et futures non jouables',()=>{
 for(const recipe of forgeRecipes){
  const d=resolveUnitDefinition(recipe.cardId,recipe.to),view=cardPresentation({id:recipe.cardId,rarity:recipe.to});
  assert.equal(d.stats.delay,CARDS[recipe.cardId].delay);
  assert.ok(view.card.description.length>0);
  assert.equal(view.card.id,recipe.cardId);
 }
});
