import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CARDS,CAMPAIGN,towerMission} from '../src/data.js';
import {freshProfile,normalizeProfile,validateDeck} from '../src/engine/profile.js';
import {createBattle,playPlayerCard,playEnemyCard} from '../src/engine/battle.js';
import {unitStatContext,unitStats,versionUnitStats} from '../src/engine/unit-stats.js';
import {buyPack,fuseCard,upgradeCard} from '../src/engine/economy.js';
import {validateImportedProfile,storeBattle,restoreBattle,saveProfile,loadProfile} from '../src/ui/storage.js';
import {freshLab,createLabBattle} from '../src/engine/developer-lab.js';
import {AUBE_UNIT_IDS,resolveUnitDefinition,unitVersions,unitVersionReference} from '../src/cards/definitions.js';

function storage(){
 const cache={};globalThis.localStorage={getItem:k=>cache[k]??null,setItem:(k,v)=>{cache[k]=String(v);},removeItem:k=>{delete cache[k];}};
 return cache;
}
function improvedProfile(){
 const p=freshProfile();
 for(const id of AUBE_UNIT_IDS){p.collection[id]=4;p.upgrades[id]=2;p.mastery[id]=22;}
 p.buildings.forge=2;p.reputation.aube=30;
 p.equipmentOwned=['lame'];p.equipped.arme='lame';return p;
}

test('Rareté et bonus séparés : Porte-égide Rare 11 PV totaux, achats et profil ajoutés une seule fois',()=>{
 const p=improvedProfile(),context=unitStatContext(p),before=JSON.stringify({p,context});
 const rare=versionUnitStats(context,{id:'shield',rarity:'rare'});
 assert.deepEqual(rare.base,{attack:1,hp:11,delay:1});
 assert.equal(rare.atk,4);assert.equal(rare.maxhp,18);
 assert.deepEqual(rare.bonuses,[
  {label:'Amélioration',atk:2,hp:2},{label:'Équipement',atk:1,hp:0},
  {label:'Forge',atk:0,hp:2},{label:'Réputation',atk:0,hp:2},{label:'Maîtrise',atk:0,hp:1}
 ]);
 const legend=versionUnitStats(context,{id:'shield',rarity:'légendaire'});
 assert.equal(legend.atk,5);assert.equal(legend.maxhp,20);
 assert.deepEqual(unitStats(context,'shield'),{atk:4,maxhp:16,bonuses:rare.bonuses});
 assert.equal(JSON.stringify({p,context}),before);
});

test('51 versions × 4 niveaux : jamais de niveau forcé, maîtrise ni effet temporaire confondus avec la base',()=>{
 const p=freshProfile();
 for(const id of AUBE_UNIT_IDS)for(const def of unitVersions(id))for(const level of [0,1,2,3]){
  p.upgrades[id]=level;
  const context=unitStatContext(p),before=JSON.stringify(context);
  const stats=versionUnitStats(context,unitVersionReference(id,def.rarity));
  assert.equal(stats.atk,def.stats.attack+level,def.versionId);
  assert.equal(stats.maxhp,def.stats.hp+level,def.versionId);
  assert.equal(stats.base.attack,def.stats.attack);assert.equal(stats.base.hp,def.stats.hp);
  assert.equal(JSON.stringify(context),before);
  const lab={mode:'developer',labStats:{levels:{p:{[id]:level}},rarities:{p:{[id]:def.rarity}}}};
  assert.equal(versionUnitStats(lab,{id,rarity:def.rarity}).maxhp,def.stats.hp+level);
 }
 const context=unitStatContext(p),ref={id:'militia',rarity:'éveillée'};
 const before=versionUnitStats(context,ref);
 assert.deepEqual(versionUnitStats({...context,barrier:99,rallyUntil:99,movedThisRound:true,formationBonus:1},ref),before);
 assert.equal(before.base.hp,8);assert.equal(before.base.attack,2);
 assert.equal(versionUnitStats(context,{id:'paladin',rarity:'rare'}),null);
 assert.equal(versionUnitStats(context,{id:'militia',rarity:'absente'}),null);
 assert.equal(versionUnitStats(context,'firebolt'),null);
});

test('Les natifs des cinq factions conservent statistiques et invocation, joueur/adversaire, 3×5/10 cases',()=>{
 const p=improvedProfile();
 for(const c of Object.values(CARDS).filter(c=>c.type==='unité'))for(const side of ['p','e'])for(const legacy of [true,false]){
  const b=createBattle(p,{...CAMPAIGN[0],difficulty:5,deck:[]},114,{legacy,turnFlow:'alternating'});
  const stats=versionUnitStats(b,c.id,side),old=unitStats(b,c.id,side);
  assert.deepEqual({atk:stats.atk,maxhp:stats.maxhp,bonuses:stats.bonuses},old,c.id);
  b.heroes[side].hand=[{id:c.id,wait:0}];
  if(side==='p')assert.equal(playPlayerCard(b,0,0).ok,true,c.id);
  else{b.phase='enemy';assert.equal(playEnemyCard(b).done,false,c.id);}
  const unit=b.board.flat().find(u=>u?.side===side&&u.id===c.id);
  assert(unit,c.id);assert.equal(unit.atk,stats.atk);assert.equal(unit.hp,stats.maxhp);
  assert(!Object.hasOwn(unit,'rarity'));assert(!Object.hasOwn(unit,'versionId'));
 }
});

test('Profils historiques : collection, deck, achats, maîtrise et ressources identiques après import/sauvegarde',()=>{
 storage();
 const old=improvedProfile(),before=JSON.stringify(old);
 const normal=normalizeProfile(old),imported=validateImportedProfile(old);
 assert.deepEqual(imported,normal);assert.deepEqual(normal.collection,old.collection);
 assert.deepEqual(normal.deck,old.deck);assert.deepEqual(normal.upgrades,old.upgrades);
 assert.deepEqual(normal.mastery,old.mastery);assert.equal(validateDeck(normal),'');
 for(const id of AUBE_UNIT_IDS)for(const def of unitVersions(id))versionUnitStats(unitStatContext(imported),{id,rarity:def.rarity});
 assert(saveProfile(imported));assert.deepEqual(loadProfile(),normal);
 assert.equal(JSON.stringify(old),before);
 assert(Object.keys(normal.collection).every(id=>!id.includes(':')));
 assert(!Object.hasOwn(normal,'rarities'));assert(!Object.hasOwn(normal,'versions'));
});

test('Anciennes batailles : aucun recalcul des chiffres sauvegardés ni ajout de rareté à la reprise',()=>{
 storage();
 const historical=JSON.parse(fs.readFileSync(new URL('./fixtures/refactor_baseline_v24.json',import.meta.url)))
  .map(entry=>JSON.parse(entry.battle)).filter(b=>b.status==='active');
 assert(historical.length>0);
 for(const b of historical){assert(storeBattle(b));assert.deepEqual(restoreBattle(),b);}
 const b=createBattle(improvedProfile(),CAMPAIGN[0],123);
 b.heroes.p.hand=[{id:'shield',wait:0}];playPlayerCard(b,0,0);
 const u=b.board[0][1];u.atk=17;u.maxhp=23;u.hp=7;u.barrier=3;
 const before=structuredClone(b);assert(storeBattle(b));assert.deepEqual(restoreBattle(),before);
 assert.deepEqual([u.atk,u.maxhp,u.hp,u.barrier],[17,23,7,3]);
});

test('Catalogue et économie inchangés : aucune variante dans paquets, Tour, recettes ou achats',()=>{
 assert.equal(Object.keys(CARDS).length,76);
 const p=freshProfile();p.gold=100000;p.shards=100000;
 for(const roll of [0,.64,.65,.92,.93,.999]){
  const result=buyPack(p,()=>roll);assert(result.ok);
  for(const id of result.cards){assert(CARDS[id]);assert.equal(resolveUnitDefinition(id)?.rarity||CARDS[id].rarity,CARDS[id].rarity);}
 }
 for(let n=1;n<=20;n++)assert(towerMission(n).deck.every(id=>Object.hasOwn(CARDS,id)));
 for(const ref of ['militia:rare','shield:éveillée','dawnbastion:divine']){
  const before=JSON.stringify(p);assert.equal(fuseCard(p,ref).ok,false);assert.equal(upgradeCard(p,ref).ok,false);
  assert.equal(JSON.stringify(p),before);
 }
 assert(Object.keys(p.collection).every(id=>Object.hasOwn(CARDS,id)));
 const bad={...p,deck:[...p.deck.slice(0,17),{id:'militia',rarity:'rare'}]};
 assert.throws(()=>validateImportedProfile(bad),'Le contrat de deck historique reste une liste d’IDs');
});

test('Références futures : refus sans consommation ni invocation partielle dans les deux camps',()=>{
 for(const side of ['p','e'])for(const legacy of [true,false]){
  for(const entry of [{id:'militia',rarity:'rare'},{id:'paladin',rarity:'commun'},
   {id:'shield',rarity:'inconnue'},{id:'wolf',rarity:'éveillée'},{id:'militia',rarity:null}]){
   const b=createBattle(freshProfile(),{...CAMPAIGN[0],deck:[]},331,{legacy,turnFlow:'alternating'});
   b.phase=side==='p'?'player':'enemy';b.heroes[side].hand=[{...entry,wait:0}];
   const before=structuredClone(b);
   if(side==='p')assert.equal(playPlayerCard(b,0,0).ok,false);
   else assert.equal(playEnemyCard(b).done,true);
   assert.deepEqual(b,before,side+' '+JSON.stringify(entry));
  }
 }
 const b=createBattle(freshProfile(),CAMPAIGN[0],1);
 b.heroes.p.hand=[{id:'militia',rarity:'Commun',wait:0}];
 assert.equal(playPlayerCard(b,0,0).ok,true);
 assert.deepEqual([b.board[0][1].atk,b.board[0][1].hp],[2,5]);
});

test('Laboratoire : le registre en lecture ne modifie ni aventure ni bataille active ni réglages expérimentaux',()=>{
 const cache=storage(),p=improvedProfile(),active=createBattle(p,CAMPAIGN[0],13);
 saveProfile(p);storeBattle(active);
 const saved=JSON.stringify(cache),lab=freshLab(),before=JSON.stringify(lab);
 for(const id of AUBE_UNIT_IDS)for(const d of unitVersions(id)){
  versionUnitStats({mode:'developer',labStats:{levels:lab.levels}},{id,rarity:d.rarity});
 }
 const battle=createLabBattle(lab,88);
 assert.equal(battle.mode,'developer');assert.equal(JSON.stringify(lab),before);
 assert.equal(JSON.stringify(cache),saved);
 assert.deepEqual(restoreBattle(),active);assert.deepEqual(loadProfile(),normalizeProfile(p));
});
