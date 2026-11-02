import test from 'node:test';
import assert from 'node:assert/strict';
import {EVOLUTION_FUSIONS} from '../src/evolution-fusion.js';
import {freshProfile,previewEvolutionFusion,fuseEvolutionCopies,createBattle,playPlayerCard,modifyDeck,validateDeck,createEvolutionTrial,settleEvolutionTrial,endPlayerTurn} from '../src/engine.js';
import {CAMPAIGN,CARDS} from '../src/data.js';
import {cardKey,cardReference,ownedCardCopies,playableCardReference} from '../src/cards/references.js';
import {resolveUnitDefinition} from '../src/cards/definitions.js';
import {loadProfile,saveProfile,validateImportedProfile,storeBattle,restoreBattle} from '../src/ui/storage.js';
import {createEvolutionFusionController} from '../src/ui/evolution-fusion-controller.js';
import {simulateBattle} from '../scripts/lib/battle_runner.mjs';
import {resolveUnitSupport} from '../src/engine/unit-support.js';

const expected={militia:{rare:[2,5],'épique':[2,5],'légendaire':[2,8],divine:[2,8],'éveillée':[2,8]},shield:{rare:[1,11],'épique':[2,11],'légendaire':[2,13],divine:[2,13],'éveillée':[2,13]},archer:{rare:[2,4],'épique':[3,4],'légendaire':[3,4],divine:[3,4],'éveillée':[3,4]},lancer:{rare:[3,6],'épique':[4,6],'légendaire':[4,8],divine:[4,8],'éveillée':[4,8]},cleric:{'épique':[1,6],'légendaire':[1,6],divine:[1,6],'éveillée':[1,6]},paladin:{'légendaire':[4,11],divine:[4,11],'éveillée':[4,13]},banner:{'épique':[2,8],'légendaire':[2,8],divine:[2,8],'éveillée':[2,8]},scoutcaptain:{'épique':[3,8],'légendaire':[4,8],divine:[4,8],'éveillée':[4,8]},sunpriest:{'épique':[2,9],'légendaire':[2,9],divine:[2,9],'éveillée':[2,9]},dawnbastion:{divine:[5,11],'éveillée':[7,11]},ranger:{rare:[2,5],'épique':[3,5],'légendaire':[3,5]},wolf:{rare:[3,4],'épique':[4,4],'légendaire':[4,4]},treant:{'épique':[3,12],'légendaire':[3,12]},dryad:{'épique':[1,7],'légendaire':[1,7]},thorn:{rare:[2,6],'épique':[3,6],'légendaire':[3,6]},pixie:{rare:[2,4],'épique':[2,4],'légendaire':[2,4]},bear:{'épique':[4,11],'légendaire':[5,11]},owl:{rare:[2,5],'épique':[3,5],'légendaire':[3,5]},sylvan_trapper:{rare:[2,6],'épique':[3,6],'légendaire':[3,6]},stag:{'légendaire':[5,8]},archdruid:{'légendaire':[3,9]}};
for(const id of ['ranger','wolf','treant','dryad','thorn','pixie','bear','owl','sylvan_trapper','stag','archdruid']){expected[id].divine=[...expected[id]['légendaire']];expected[id]['éveillée']=[...expected[id]['légendaire']];}
const ready=()=>{const p=freshProfile();p.completed=['01','02','03','04','05','06','07','08','09','10','11','12'];return p;};
function stocked(recipe){
 const p=ready(),source=cardReference({id:recipe.cardId,rarity:recipe.from});
 const used=p.deck.filter(ref=>cardKey(ref)===cardKey(source)).length;
 if(typeof source==='string')p.collection[source]=used+3;
 else p.evolvedCollection={[cardKey(source)]:used+3};
 if(recipe.ascension)p.completedTrials=recipe.to==='éveillée'?[CARDS[recipe.cardId].faction+'-ascension-divine',recipe.ascension]:[recipe.ascension];
 return p;
}
function storage(){const data={};globalThis.localStorage={getItem:k=>data[k]??null,setItem:(k,v)=>{data[k]=String(v)},removeItem:k=>{delete data[k]}};return data;}

test('89 recettes explicites, transitions adjacentes et autres rangs/factions fermés',()=>{
 assert.equal(EVOLUTION_FUSIONS.length,89);
 assert.deepEqual(EVOLUTION_FUSIONS.map(r=>r.id).sort(),Object.entries(expected).flatMap(([id,ranks])=>Object.keys(ranks).map(rank=>id+':'+rank)).sort());
 for(const recipe of EVOLUTION_FUSIONS){assert.equal(recipe.copies,3);assert.equal(recipe.from,{rare:'commun','épique':'rare','légendaire':'épique',divine:'légendaire','éveillée':'divine'}[recipe.to]);assert.equal(recipe.mission,{rare:'01','épique':'03','légendaire':'06',divine:'09','éveillée':'12'}[recipe.to]);}
 const p=ready();
 for(const id of ['bone:divine','firebolt:rare','militia:commun','constructor']){
  const before=structuredClone(p);assert.equal(fuseEvolutionCopies(p,id).ok,false);assert.deepEqual(p,before,id);
 }
 for(const ref of [{id:'bone',rarity:'divine'}])assert.equal(playableCardReference(ref),false);
});

test('Chaque recette consomme 3 stocks du rang exact, crée 1 carte jouable et protège le deck et toute autre progression',()=>{
 for(const recipe of EVOLUTION_FUSIONS){
  const p=stocked(recipe),before=structuredClone(p),preview=previewEvolutionFusion(p,recipe.id);
  assert.equal(preview.ok,true);assert.equal(preview.available,3);assert.deepEqual(p,before);
  const result=fuseEvolutionCopies(p,recipe.id);assert.equal(result.ok,true);
  assert.equal(ownedCardCopies(p,result.source),preview.used);assert.equal(ownedCardCopies(p,result.target),1);
  const desired=structuredClone(before);
  if(typeof result.source==='string')desired.collection[result.source]-=3;
  else desired.evolvedCollection[cardKey(result.source)]-=3;
  desired.evolvedCollection??={};desired.evolvedCollection[recipe.id]=1;
  assert.deepEqual(p,desired);assert.equal(validateDeck(p),'');assert.deepEqual(p.completedTrials,before.completedTrials);
  assert.deepEqual(validateImportedProfile(p),p);assert.equal(modifyDeck(p,result.target,1),true);
  const b=createBattle(p,CAMPAIGN[0],1);b.heroes.p.hand=[{...result.target,wait:0}];
  assert.equal(playPlayerCard(b,0,0,1).ok,true,recipe.id);
  const u=b.board[0][1];assert.deepEqual([u.atk,u.maxhp],expected[recipe.cardId][recipe.to],recipe.id);
  assert.equal(u.rarity,recipe.to);assert.equal(u.cardRules,'cards-v2');
  storage();assert(storeBattle(b));assert.deepEqual(restoreBattle(),b);
 }
});

test('Rangs distincts, copies du deck et manque de doublons : aucun prélèvement ou mélange implicite',()=>{
 const p=ready();p.evolvedCollection={'militia:rare':2,'militia:épique':3};
 const before=structuredClone(p);
 assert.equal(previewEvolutionFusion(p,'militia:rare').available,0);
 assert.equal(fuseEvolutionCopies(p,'militia:rare').ok,false);
 assert.equal(fuseEvolutionCopies(p,'militia:épique').ok,false);assert.deepEqual(p,before);
 p.evolvedCollection['militia:rare']=3;p.deck[0]={id:'militia',rarity:'rare'};
 const held=structuredClone(p);assert.equal(fuseEvolutionCopies(p,'militia:épique').ok,false);assert.deepEqual(p,held);
});

test('1424 exécutions de combat avec les versions réellement fusionnées : fin, plateau valide, déterminisme et profil conservé',()=>{
 for(const recipe of EVOLUTION_FUSIONS){
  const p=stocked(recipe),result=fuseEvolutionCopies(p,recipe.id);modifyDeck(p,result.target,1);
  const before=structuredClone(p);
  for(let seed=1;seed<=8;seed++){
   const observe=b=>{const units=b.board.flat().filter(Boolean);assert.ok(units.every(u=>u.hp>0&&Number.isFinite(u.atk)));assert.equal(new Set(units.map(u=>u.uid)).size,units.length);};
   const mission=CAMPAIGN[seed%3];
   assert.deepEqual(simulateBattle(p,mission,seed,{observe}),simulateBattle(p,mission,seed,{observe}));
   assert.deepEqual(p,before);
  }
 }
});

test('Progression de campagne, résultat non récupéré et combat actif bloquent sans mutation ; aucune épreuve obligatoire',()=>{
 const recipe=EVOLUTION_FUSIONS.find(r=>r.id==='shield:épique');
 const p=stocked(recipe);p.completed=['01','02'];let before=structuredClone(p);
 assert.match(fuseEvolutionCopies(p,recipe.id).reason,/Gardien du Bosquet/);assert.deepEqual(p,before);
 p.completed.push('03');before=structuredClone(p);
 for(const battle of [{status:'active'},{status:'victory'},{status:'defeat'}]){assert.equal(fuseEvolutionCopies(p,recipe.id,battle).ok,false);assert.deepEqual(p,before);}
 assert.equal(fuseEvolutionCopies(p,recipe.id,{status:'victory',rewardGiven:true}).ok,true);
 assert.equal(p.completedTrials,undefined);
 const rare=stocked(EVOLUTION_FUSIONS[0]);rare.completed=[];before=structuredClone(rare);
 assert.equal(fuseEvolutionCopies(rare,EVOLUTION_FUSIONS[0].id).ok,false);assert.deepEqual(rare,before);
});

test('Stocks invalides ou saturés refusés, jamais de copie créée par normalisation d’un profil ancien',()=>{
 const recipe=EVOLUTION_FUSIONS[0];
 for(const qty of [-1,3.5,Infinity,100001]){
  const p=stocked(recipe);p.collection.militia=qty;const before=structuredClone(p);
  assert.equal(fuseEvolutionCopies(p,recipe.id).ok,false);assert.deepEqual(p,before);
 }
 const p=stocked(recipe);p.evolvedCollection={'militia:rare':100000};const before=structuredClone(p);
 assert.equal(fuseEvolutionCopies(p,recipe.id).ok,false);assert.deepEqual(p,before);
 storage();const old=freshProfile();saveProfile(old);assert.deepEqual(loadProfile(),old);assert.equal(loadProfile().evolvedCollection,undefined);
});

test('Fusion répétable puis épreuve unique : stocks séparés, ni boucle gratuite ni épreuve marquée par la fusion',()=>{
 const p=ready();p.collection.militia=13;
 for(let i=0;i<3;i++)assert.equal(fuseEvolutionCopies(p,'militia:rare').ok,true);
 assert.equal(p.collection.militia,4);assert.equal(p.evolvedCollection['militia:rare'],3);
 assert.equal(fuseEvolutionCopies(p,'militia:épique').ok,true);assert.equal(p.evolvedCollection['militia:rare'],0);
 assert.equal(p.evolvedCollection['militia:épique'],1);assert.equal(p.completedTrials,undefined);
 const b=createEvolutionTrial(p,'aube-militia-rare',1).battle;b.heroes.p.hand=[{id:'militia',wait:0}];
 playPlayerCard(b,0,0);b.trialChallenge.counts[b.board[0][1].uid]=3;b.status='victory';b.phase='finished';
 assert.equal(settleEvolutionTrial(p,b).evolved,true);assert.equal(p.collection.militia,3);
 assert.equal(p.evolvedCollection['militia:rare'],1);assert.equal(p.evolvedCollection['militia:épique'],1);
 const once=structuredClone(p);assert.equal(settleEvolutionTrial(p,structuredClone(b)).evolved,false);assert.deepEqual(p,once);
});

function controller(recipe=EVOLUTION_FUSIONS[0]){
 let profile=stocked(recipe),battle=null,fail=false,saves=0,modal='',message='';
 const api={btn:()=>'',cardUI:()=>'',esc:s=>s,showModal:s=>{modal=s},hideModal:()=>{modal=''},refresh:()=>{},toast:s=>{message=s},commitProfile:next=>{saves++;if(fail)return false;profile=next;return true;}};
 const handle=createEvolutionFusionController(()=>({profile,battle}),api);
 return {handle,get profile(){return profile},get saves(){return saves},get modal(){return modal},get message(){return message},set fail(v){fail=v},set battle(v){battle=v}};
}

test('Confirmation : annulation, double clic et répétition sans prévisualisation ne consomment pas de copies',()=>{
 const c=controller(),before=structuredClone(c.profile);
 c.handle('evolution-fusion-confirm');assert.equal(c.saves,0);
 c.handle('evolution-fusion-preview',{id:'militia:rare'});assert.match(c.modal,/3 exemplaires/);assert.deepEqual(c.profile,before);
 c.handle('close-modal');c.handle('evolution-fusion-confirm');assert.equal(c.saves,0);
 c.handle('evolution-fusion-preview',{id:'militia:rare'});c.handle('evolution-fusion-confirm');const once=structuredClone(c.profile);
 c.handle('evolution-fusion-confirm');assert.equal(c.saves,1);assert.deepEqual(c.profile,once);
});

test('Sauvegarde en échec, manque de copies ou début de combat après prévisualisation : transaction sans perte',()=>{
 for(const change of ['storage','stock','battle']){
  const c=controller();c.handle('evolution-fusion-preview',{id:'militia:rare'});
  if(change==='storage')c.fail=true;if(change==='stock')c.profile.collection.militia=4;if(change==='battle')c.battle={status:'active'};
  const before=structuredClone(c.profile);c.handle('evolution-fusion-confirm');assert.deepEqual(c.profile,before,change);
  assert.equal(c.saves,change==='storage'?1:0);assert.ok(c.message);
 }
});

test('Les vingt Légendaires Aube/Sylve exigent la victoire réelle du deuxième boss, pas le niveau ou la mission accessible',()=>{
 const recipes=EVOLUTION_FUSIONS.filter(r=>r.to==='légendaire');assert.equal(recipes.length,20);
 for(const recipe of recipes){
  const p=stocked(recipe);p.completed=['01','02','03','04','05'];p.unlocked=12;p.heroXp=100000;
  const before=structuredClone(p);
  assert.match(fuseEvolutionCopies(p,recipe.id).reason,/Colosse des Fourneaux/);assert.deepEqual(p,before);
  p.completed.push('06');assert.equal(fuseEvolutionCopies(p,recipe.id).ok,true);
 }
});

test('Sources Épiques natives et évoluées : copies du deck protégées, sans saut depuis Rare',()=>{
 for(const id of ['paladin','lancer']){
  const recipe=EVOLUTION_FUSIONS.find(r=>r.id===id+':légendaire'),p=stocked(recipe);
  const source=cardReference({id,rarity:'épique'});p.deck[0]=source;
  const before=structuredClone(p);assert.equal(fuseEvolutionCopies(p,recipe.id).ok,false);assert.deepEqual(p,before);
  if(id==='paladin')p.collection.paladin++;
  else p.evolvedCollection['lancer:épique']++;
  assert.equal(fuseEvolutionCopies(p,recipe.id).ok,true);assert.equal(ownedCardCopies(p,source),1);
  assert.deepEqual(p.deck,before.deck);
 }
 const p=ready();p.evolvedCollection={'militia:rare':27};const before=structuredClone(p);
 assert.equal(fuseEvolutionCopies(p,'militia:légendaire').ok,false);assert.deepEqual(p,before);
});

test('Chaîne complète : 27 Communes libres donnent une Légendaire, sans gain ni consommation du deck',()=>{
 const p=ready();p.collection.militia=31;const before=structuredClone(p);
 for(let i=0;i<9;i++)assert.equal(fuseEvolutionCopies(p,'militia:rare').ok,true);
 for(let i=0;i<3;i++)assert.equal(fuseEvolutionCopies(p,'militia:épique').ok,true);
 assert.equal(fuseEvolutionCopies(p,'militia:légendaire').ok,true);
 const expected=structuredClone(before);expected.collection.militia=4;
 expected.evolvedCollection={'militia:rare':0,'militia:épique':0,'militia:légendaire':1};
 assert.deepEqual(p,expected);assert.equal(fuseEvolutionCopies(p,'militia:légendaire').ok,false);
});

function earnedBattle(id){
 const p=stocked(EVOLUTION_FUSIONS.find(r=>r.id===id+':légendaire'));
 const {target}=fuseEvolutionCopies(p,id+':légendaire');assert.equal(modifyDeck(p,target,1),true);
 const b=createBattle(p,{...CAMPAIGN[0],deck:[]},21);b.heroes.p.hand=[{...target,wait:0}];
 assert.equal(playPlayerCard(b,0,0,1).ok,true);assert.notEqual(b.mode,'developer');return b;
}
function addAlly(b,id,lane,col){
 b.heroes.p.cardsPlayed=0;b.heroes.p.hand=[{id,wait:0}];assert.equal(playPlayerCard(b,0,lane,col).ok,true);
 return b.board[lane][col];
}

test('Pouvoirs réellement gagnés en aventure : portée 3, soins 3 et deux inspirations sur la même ligne',()=>{
 const ranged=earnedBattle('archer'),enemy={...ranged.board[0][1],uid:999,side:'e',id:'militia',rarity:'commun',hp:10,maxhp:10,ranged:false};
 ranged.board[0][4]=enemy;endPlayerTurn(ranged);
 assert.equal(ranged.board[0][1].id,'archer');assert.equal(enemy.hp,7);
 for(const id of ['cleric','sunpriest']){
  const b=earnedBattle(id),x=addAlly(b,'militia',0,2),y=addAlly(b,'militia',1,1);x.hp=1;y.hp=1;
  resolveUnitSupport(b,'p',()=>{});assert.equal(x.hp,4);assert.equal(y.hp,1);
  resolveUnitSupport(b,'p',()=>{});assert.equal(x.hp,4,'un seul soin par tour');
 }
 const b=earnedBattle('banner'),x=addAlly(b,'militia',0,2),y=addAlly(b,'archer',0,3),z=addAlly(b,'militia',1,1);
 b.round=3;resolveUnitSupport(b,'p',()=>{});assert.deepEqual([x.atk,y.atk,z.atk],[3,3,2]);
 resolveUnitSupport(b,'p',()=>{});assert.deepEqual([x.atk,y.atk,z.atk],[3,3,2]);
 storage();assert(storeBattle(b));assert.deepEqual(restoreBattle(),b);
});

test('Confirmation Légendaire : panne et double clic gardent la transaction entière',()=>{
 for(const recipe of EVOLUTION_FUSIONS.filter(r=>r.to==='légendaire')){
  const c=controller(recipe),before=structuredClone(c.profile);
  c.handle('evolution-fusion-preview',{id:recipe.id});assert.match(c.modal,/3 exemplaires épique/);
  c.fail=true;c.handle('evolution-fusion-confirm');assert.deepEqual(c.profile,before);
  c.fail=false;c.handle('evolution-fusion-preview',{id:recipe.id});c.handle('evolution-fusion-confirm');
  const once=structuredClone(c.profile);c.handle('evolution-fusion-confirm');assert.deepEqual(c.profile,once);
  assert.equal(ownedCardCopies(c.profile,{id:recipe.cardId,rarity:recipe.to}),1);assert.equal(c.saves,2);
 }
});
