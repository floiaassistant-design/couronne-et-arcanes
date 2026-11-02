import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {OMBRE_DESIGN_SOURCE} from '../src/cards/ombre.js';
import {OMBRE_UNIT_IDS,unitVersions,resolveUnitDefinition,VERSIONED_UNIT_IDS} from '../src/cards/definitions.js';
import {EVOLUTION_FUSIONS,evolutionFusionFor} from '../src/evolution-fusion.js';
import {cardPack,evolutionPackFor} from '../src/card-packs.js';
import {cardReference,cardKey,ownedCardCopies} from '../src/cards/references.js';
import {freshProfile,normalizeProfile,buyCardPack,fuseEvolutionCopies,modifyDeck,createBattle,playPlayerCard,playEnemyCard,endPlayerTurn,finishEnemyTurn} from '../src/engine.js';
import {freshLab,setLabLevel,setLabRarity,createLabBattle} from '../src/engine/developer-lab.js';
import {hit,resolveRetaliation} from '../src/engine/battle-defense.js';
import {findCrownGuardian} from '../src/engine/guard-candidates.js';
import {prepareControlUnits} from '../src/engine/battle-control.js';
import {cardPresentation} from '../src/ui/card-presentation.js';
import {saveProfile,loadProfile,validateImportedProfile,storeBattle,restoreBattle} from '../src/ui/storage.js';

// Totaux indépendants : tableau maître relu le 02/11/2026. Le délai 1 de
// nightblade est confirmé dans le catalogue natif, sans nouveau délai inventé.
const totals={bone:[[3,3,1],[3,4,1],[4,4,1]],shade:[[3,3,1],[3,5,1]],crypt:[[2,7,1],[2,9,1],[3,9,1]],plague:[[3,5,2],[3,7,2]],lich:[[6,9,4]],banshee:[[4,5,3]],vampire:[[5,6,3]],graveknight:[[4,8,2],[4,10,2]],nightblade:[[3,3,1],[3,4,1],[4,4,1]],spectre:[[3,4,1],[3,6,1]],mist_inquisitor:[[2,6,3],[2,8,3]]};
const legendary={bone:[4,6,1],shade:[4,5,1],crypt:[3,9,1],plague:[4,7,2],banshee:[4,7,3],vampire:[5,8,3],graveknight:[5,10,2],nightblade:[4,6,1],spectre:[4,6,1],mist_inquisitor:[3,8,3]};
for(const [id,stats] of Object.entries(legendary))totals[id].push(stats);
for(const [id,stats] of Object.entries({...legendary,lich:[6,9,4]}))totals[id].push([...stats],[...stats]);
const recipes=EVOLUTION_FUSIONS.filter(r=>CARDS[r.cardId].faction==='ombre'&&['rare','épique'].includes(r.to));
const ready=()=>{const p=freshProfile();p.completed=['01','02','03'];p.gold=2000;return p;};
function storage(){const data={};globalThis.localStorage={getItem:k=>data[k]??null,setItem:(k,v)=>{data[k]=String(v)},removeItem:k=>{delete data[k]}};}
function earned(id,rarity='épique'){
 const p=ready(),recipe=evolutionFusionFor(id,rarity),source=cardReference({id,rarity:recipe.from});
 const used=p.deck.filter(r=>cardKey(r)===cardKey(source)).length;
 if(typeof source==='string')p.collection[source]=used+3;else p.evolvedCollection={[cardKey(source)]:used+3};
 const result=fuseEvolutionCopies(p,recipe.id);assert.equal(result.ok,true);assert.equal(modifyDeck(p,result.target,1),true);
 const b=createBattle(p,{...CAMPAIGN[0],deck:[],hp:100},11,{turnFlow:'alternating'});
 for(const h of Object.values(b.heroes))Object.assign(h,{hp:100,maxhp:100,hand:[],deck:[],discard:[]});
 b.heroes.p.hand=[{...result.target,wait:0}];assert(playPlayerCard(b,0,0,1).ok);return {p,b,u:b.board[0][1],ref:result.target};
}
let uid=900;
const foe=(extra={})=>({uid:uid++,id:'bone',rarity:'commun',side:'e',atk:3,hp:30,maxhp:30,armor:0,ranged:false,ability:'',stun:99,poison:0,poisonTurns:0,...extra});

test('54 versions Ombre : onze natifs inchangés, 43 évolutions jusqu’à Éveillé',()=>{
 assert.equal(recipes.length,11);assert.deepEqual([...OMBRE_UNIT_IDS].sort(),Object.keys(totals).sort());let count=0;
 for(const [id,expected] of Object.entries(totals)){
  const versions=unitVersions(id);assert.equal(versions.length,expected.length,id);count+=versions.length;
  for(const [i,d] of versions.entries()){
   assert.deepEqual([d.stats.attack,d.stats.hp,d.stats.delay],expected[i],d.versionId);assert.equal(d.status.combat,'implemented');assert.deepEqual(d.pendingDecisions,[]);
   if(i){assert.strictEqual(d.source,OMBRE_DESIGN_SOURCE);assert.equal(d.status.obtaining,'fusion');}
   else assert.deepEqual([d.stats.attack,d.stats.hp,d.stats.delay],[CARDS[id].attack,CARDS[id].hp,CARDS[id].delay]);
  }
  for(const rarity of ['divine','éveillée'])assert.equal(resolveUnitDefinition(id,rarity).status.obtaining,'fusion',id+rarity);
 }
 assert.equal(count,54);assert.equal(Object.keys(CARDS).length,76);
 assert.equal(OMBRE_UNIT_IDS.filter(id=>VERSIONED_UNIT_IDS.includes(id)).length,11);
 const p=freshProfile();assert.deepEqual(normalizeProfile(p),p);assert.equal(p.evolvedCollection,undefined);assert.equal(p.completedTrials,undefined);
});

test('54 versions × quatre niveaux × deux camps : chiffres et invocations du même laboratoire',()=>{
 for(const id of OMBRE_UNIT_IDS)for(const [i,d] of unitVersions(id).entries())for(const level of [0,1,2,3])for(const side of ['p','e']){
  const lab=freshLab();assert(setLabRarity(lab,side,id,d.rarity).ok);assert(setLabLevel(lab,side,id,level).ok);const before=structuredClone(lab),b=createLabBattle(lab,11);
  b.heroes[side].hand=[{id,wait:0}];if(side==='e')b.phase='enemy';assert((side==='p'?playPlayerCard(b,0,0,1):playEnemyCard(b)).ok);
  const u=b.board.flat().find(u=>u?.id===id&&u.side===side);assert.deepEqual([u.atk,u.maxhp],[totals[id][i][0]+level,totals[id][i][1]+level]);assert.equal(u.rarity,d.rarity);assert.deepEqual(lab,before);
 }
});

test('Pouvoirs hérités : Charge, Garde positionnelle, Riposte effective, poison, Perforation et Silence',()=>{
 const a=id=>resolveUnitDefinition(id,'épique').abilities;
 for(const id of ['shade','spectre']){assert.equal(a(id).charge.amount,2);assert.equal(resolveUnitDefinition(id,'épique').geometry.steps,2);}
 assert.equal(a('crypt').armor.amount,2);assert.equal(a('crypt').guard.scope,'positioned');assert.equal(a('crypt').riposte,undefined);
 assert.equal(a('graveknight').armor.amount,2);assert.equal(a('graveknight').riposte.damageMode,'effective-attack');assert.equal(a('graveknight').guard,undefined);assert.equal(a('graveknight').charge.amount,2);
 assert.deepEqual([a('plague').poison.amount,a('plague').poison.resolutions],[1,2]);assert.equal(a('nightblade').pierce.ignoreArmor,true);
 assert.deepEqual([a('mist_inquisitor').silence.period,a('mist_inquisitor').silence.resolutions],[3,1]);
 assert.equal(VERSIONED_UNIT_IDS.includes('lich'),true);for(const id of ['banshee','vampire'])assert.equal(VERSIONED_UNIT_IDS.includes(id),true);
});

test('Onze fusions réelles : rang exact, stocks/deck protégés, aucun gain ni ascension imposée',()=>{
 for(const recipe of recipes){
  assert.equal(recipe.copies,3);assert.equal(recipe.ascension,undefined);assert.equal(recipe.mission,recipe.to==='rare'?'01':'03');
  const {p,b,u,ref}=earned(recipe.cardId,recipe.to);assert.equal(ownedCardCopies(p,ref),1);assert.equal(ownedCardCopies(p,{id:recipe.cardId,rarity:recipe.from}),0);
  assert.equal(u.rarity,recipe.to);assert.equal(b.mode,'campaign');assert.equal(p.completedTrials,undefined);assert.equal(p.gold,2000);
  assert.deepEqual(validateImportedProfile(p),p);storage();assert(saveProfile(p));assert.deepEqual(loadProfile(),p);assert(storeBattle(b));assert.deepEqual(restoreBattle(),b);
  const blocked=ready(),source=cardReference({id:recipe.cardId,rarity:recipe.from});blocked.deck[0]=source;
  const used=blocked.deck.filter(r=>cardKey(r)===cardKey(source)).length;
  if(typeof source==='string')blocked.collection[source]=used+2;else blocked.evolvedCollection={[cardKey(source)]:used+2};
  const before=structuredClone(blocked);assert.equal(fuseEvolutionCopies(blocked,recipe.id).ok,false);assert.deepEqual(blocked,before);
 }
});

test('Nouveau paquet Ombre : pools explicites 8/3/8, prix et taux annoncés, aucune carte haute',()=>{
 const p=cardPack('ombre-evolution');assert.deepEqual([p.cost,p.count,p.mission],[190,3,'03']);assert.deepEqual(p.groups.map(g=>g.weight),[60,35,5]);assert.deepEqual(p.groups.map(g=>g.cards.length),[8,3,8]);
 assert.deepEqual(p.groups[0].cards.slice().sort(),['bone','shade','crypt','plague','graveknight','nightblade','spectre','mist_inquisitor'].sort());
 assert.deepEqual(p.groups[1].cards.map(cardKey).sort(),['bone:rare','crypt:rare','nightblade:rare'].sort());
 for(const g of p.groups)for(const ref of g.cards){assert.equal(CARDS[typeof ref==='string'?ref:ref.id].faction,'ombre');if(typeof ref==='object')assert.ok(['rare','épique'].includes(ref.rarity));}
 assert.deepEqual(cardPack('aube-evolution').groups.map(g=>g.cards.length),[8,4,8]);assert.deepEqual(cardPack('sylve-evolution').groups.map(g=>g.cards.length),[9,6,9]);
 assert.equal(cardPack('mystic').cost,95);assert.equal(evolutionPackFor('bone','légendaire'),null);
});

test('Onze évolutions réellement tirées : six appels aléatoires, stocks exacts, import et invocation',()=>{
 const pack=cardPack('ombre-evolution');
 for(const group of pack.groups.slice(1))for(const [i,ref] of group.cards.entries()){
  const p=ready();let calls=0;const roll=ref.rarity==='rare'?.7:.97;
  const result=buyCardPack(p,pack.id,()=>calls++%2===0?roll:(i+.5)/group.cards.length);assert.equal(calls,6);assert.deepEqual(result.cards,[ref,ref,ref]);assert.equal(ownedCardCopies(p,ref),3);assert.equal(p.gold,1810);
  assert.equal(modifyDeck(p,ref,1),true);assert.deepEqual(validateImportedProfile(p),p);const b=createBattle(p,CAMPAIGN[0],1);b.heroes.p.hand=[{...ref,wait:0}];assert(playPlayerCard(b,0,0,1).ok);assert.equal(b.board[0][1].rarity,ref.rarity);
 }
 const p=ready();p.completed=['01','02'];const before=structuredClone(p);assert.equal(buyCardPack(p,pack.id).ok,false);assert.deepEqual(p,before);
});

test('Ombre vorace et Spectre Épiques : deux pas, Charge +2 réelle et aucun bonus sans mouvement',()=>{
 for(const id of ['shade','spectre'])for(const distance of [1,3]){
  const {b,u}=earned(id),target=foe();b.board[0][1+distance]=target;endPlayerTurn(b);assert.equal(target.hp,30-3-(distance===3?2:0));assert.equal(u.atk,3);assert.equal(b.board[0][distance===3?3:1],u);
 }
});

test('Veilleur et Chevalier : protection de couronne positionnelle, Armure 2, Riposte sans Charge et sans Garde ajoutée',()=>{
 const crypt=earned('crypt');assert.equal(findCrownGuardian(crypt.b,0,'p',4).u,crypt.u);assert.equal(findCrownGuardian(crypt.b,0,'p',0),null);assert.equal(hit(crypt.b,crypt.u,4,'e'),2);assert.equal(crypt.u.hp,7);
 const {b,u}=earned('graveknight'),target=foe({stun:0});assert.equal(findCrownGuardian(b,0,'p',4),null);assert(resolveRetaliation(b,u,target,0,1,2,1));assert.equal(target.hp,25);assert.equal(resolveRetaliation(b,u,target,0,1,2,1),false);
});

test('Faucheur et Lame Épiques : poison 1 × 2 et Perforation effectifs, barrières conservées',()=>{
 const {b}=earned('plague'),target=foe();b.board[0][2]=target;endPlayerTurn(b);assert.deepEqual([target.hp,target.poison,target.poisonTurns],[27,1,2]);finishEnemyTurn(b);assert.deepEqual([target.hp,target.poisonTurns],[26,1]);
 const blade=earned('nightblade'),armored=foe({armor:9,barrier:1});blade.b.board[0][2]=armored;endPlayerTurn(blade.b);assert.equal(armored.hp,27);assert.equal(armored.barrier,0);
});

test('Inquisiteur : Silence réel pendant un tour, cadence trois tours, fiche complète et reprise',()=>{
 const {b,u}=earned('mist_inquisitor'),target=foe({id:'wolf',rarity:'commun',ability:'haste'});b.board[0][4]=target;
 const noop=()=>{},hooks={hit,emit:noop,note:noop,enter:noop};prepareControlUnits(b,hooks,'p');assert.equal(target.silenceUntil,1);assert.equal(u.controlReadyRound,4);
 b.round=2;prepareControlUnits(b,hooks,'p');assert.equal(target.silenceUntil,1);b.round=4;prepareControlUnits(b,hooks,'p');assert.equal(target.silenceUntil,4);assert.equal(u.controlReadyRound,7);
 storage();assert(storeBattle(b));assert.deepEqual(restoreBattle(),b);const text=cardPresentation({id:'mist_inquisitor',rarity:'épique'});assert.match(text.card.description,/Silence/);assert.match(text.details.join(' '),/3 tours/);
});

test('Compétences effectives aux deux camps : moteur du laboratoire, copies isolées et sauvegarde exacte',()=>{
 for(const side of ['p','e'])for(const id of ['shade','plague','nightblade','mist_inquisitor']){
  const lab=freshLab();setLabRarity(lab,side,id,'épique');const b=createLabBattle(lab,11);for(const h of Object.values(b.heroes))Object.assign(h,{hp:100,maxhp:100,hand:[],deck:[],discard:[]});
  b.heroes[side].hand=[{id,wait:0}];if(side==='e')b.phase='enemy';assert((side==='p'?playPlayerCard(b,0,0,1):playEnemyCard(b)).ok);
  const u=b.board.flat().find(u=>u?.side===side&&u.id===id);for(const row of b.board)row.fill(null);const col=side==='p'?1:10,dir=side==='p'?1:-1;b.board[0][col]=u;
  const target=foe({side:side==='p'?'e':'p',id:'wolf',ability:'haste',armor:id==='nightblade'?9:0});b.board[0][col+dir*(id==='shade'?3:1)]=target;
  b.vfx=[];if(side==='p')endPlayerTurn(b);else finishEnemyTurn(b);
  if(id==='shade')assert.equal(target.hp,25);if(id==='plague')assert.deepEqual([target.hp,target.poison,target.poisonTurns],[27,1,2]);if(id==='nightblade')assert.equal(target.hp,26);if(id==='mist_inquisitor'){assert.equal(b.vfx.find(e=>e.type==='silence').frame.board[0][col+dir].silenceUntil,1);assert.equal(target.silenceUntil,side==='p'?1:undefined);assert.equal(u.controlReadyRound,4);}
  storage();assert(storeBattle(b));const {vfx,...saved}=b;assert.deepEqual(restoreBattle(),saved);
 }
});
