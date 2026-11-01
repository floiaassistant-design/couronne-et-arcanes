import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {EVOLUTION_TRIALS} from '../src/evolution-trials.js';
import {cardReference,cardId,cardKey,cardFromKey,ownedCardCopies} from '../src/cards/references.js';
import {freshProfile,normalizeProfile,validateDeck,modifyDeck,createBattle,playPlayerCard,endPlayerTurn,playEnemyCard,finishEnemyTurn,usePower,createEvolutionTrial,settleEvolutionTrial,evolutionTrialAccess,proposeDeck,completeBattle,grantBattleProgress,upgradeCard} from '../src/engine.js';
import {resolveRulesDefinition} from '../src/cards/definitions.js';
import {hit} from '../src/engine/battle-defense.js';
import {validateImportedProfile,validStoredBattle,storeBattle,restoreBattle,saveProfile,loadProfile,startNewAdventure,restorePreviousAdventure} from '../src/ui/storage.js';
import {chooseSimulatedMove} from '../scripts/lib/battle_runner.mjs';
import {unitStats} from '../src/engine/unit-stats.js';
import {createViews} from '../src/ui/views.js';
import {cardPresentation} from '../src/ui/card-presentation.js';

function profile(){const p=freshProfile();p.completed=['01','02','03'];return p;}
function won(p,id){
 const r=createEvolutionTrial(p,id,1);assert.equal(r.ok,true,r.reason);const b=r.battle,t=EVOLUTION_TRIALS.find(t=>t.id===id);
 const ref=cardReference({id:t.cardId,rarity:t.from});
 b.heroes.p.hand=[{id:t.cardId,...(typeof ref==='object'?{rarity:ref.rarity}:{}),wait:0}];
 assert.equal(playPlayerCard(b,0,0,1).ok,true);
 // Instantané de clôture pour les tests d'attribution ; les combats complets
 // ci-dessous atteignent les objectifs par les seules actions du moteur.
 const q=b.trialChallenge,u=b.board[0][1];
 if(q.metric==='firstHit')u.firstHitReductionUsed=true;else q.counts[u.uid]=q.target;
 b.status='victory';b.phase='finished';return b;
}
function earn(p,id){const b=won(p,id),r=settleEvolutionTrial(p,b);assert.equal(r.evolved,true,r.reason);return {b,r};}

test('Références : ID natifs conservés, quatre évolutions obtenables et aucune version inférieure inventée',()=>{
 assert.deepEqual(EVOLUTION_TRIALS.map(t=>`${t.cardId}:${t.to}`).sort(),['archer:rare','militia:rare','militia:épique','shield:rare'].sort());
 assert.equal(cardReference('militia'),'militia');
 assert.equal(cardReference({id:'militia',rarity:'commun'}),'militia');
 assert.deepEqual(cardFromKey('militia:Rare'),{id:'militia',rarity:'rare'});
 assert.equal(cardFromKey('cleric:commun'),null);assert.equal(cardReference('constructor'),null);
 assert.equal(Object.keys(CARDS).length,76);
 const p=freshProfile();assert.equal(p.evolvedCollection,undefined);assert.equal(p.completedTrials,undefined);
 assert.deepEqual(normalizeProfile(JSON.parse(JSON.stringify(p))),p);
 assert.ok(p.deck.every(ref=>typeof ref==='string'));
});

test('Accès : progression, boss, exemplaire et deck sont nécessaires, consultation pure et aucun gain rétroactif',()=>{
 const p=freshProfile(),before=JSON.stringify(p);
 assert.equal(evolutionTrialAccess(p,'aube-militia-rare').ok,false);
 assert.equal(JSON.stringify(p),before);p.completed=['01'];
 assert.equal(evolutionTrialAccess(p,'aube-militia-rare').ok,true);
 assert.equal(evolutionTrialAccess(p,'aube-militia-epic').ok,false);
 p.deck=p.deck.filter(id=>id!=='militia');assert.equal(evolutionTrialAccess(p,'aube-militia-rare').ok,false);
 const old=profile(),snapshot=JSON.stringify(old);
 assert.equal(evolutionTrialAccess(old,'aube-militia-epic').ok,false);
 assert.equal(old.evolvedCollection,undefined);assert.equal(JSON.stringify(old),snapshot);
 assert.equal(createEvolutionTrial(old,'inconnue').ok,false);
});

test('Campagne et épreuves : cartes natives garanties distinctes, sans seconde copie du butin du boss',()=>{
 const p=freshProfile();
 for(const mission of CAMPAIGN){
  const before=p.collection[mission.unlock]||0,b=createBattle(p,mission,1);
  b.status='victory';b.phase='finished';
  assert.equal(completeBattle(p,mission,b).card,mission.unlock);
  assert.equal(p.collection[mission.unlock],before+1,mission.id);
  assert.equal(completeBattle(p,mission,b).card,null);
  const replay=createBattle(p,mission,2);replay.status='victory';replay.phase='finished';
  assert.equal(completeBattle(p,mission,replay).card,null);
  assert.equal(p.collection[mission.unlock],before+1,mission.id+' rejouée');
 }
 const native=structuredClone(p.collection);
 for(const t of EVOLUTION_TRIALS){
  assert.ok(CAMPAIGN.every(m=>m.unlock!==t.cardId));
  const before=structuredClone(p),{b,r}=earn(p,t.id);
  assert.equal(cardKey(r.card),cardKey({id:t.cardId,rarity:t.to}));
  const expected=structuredClone(before.collection);
  if(t.from===CARDS[t.cardId].rarity)expected[t.cardId]--;
  assert.deepEqual(p.collection,expected);
  assert.equal(p.collection.treant,native.treant,'le boss ne redonne pas son Gardien pendant une épreuve');
  for(const key of ['gold','shards','heroXp','stars','wins','losses','completed','unlocked'])assert.deepEqual(p[key],before[key],key);
  const once=structuredClone(p);assert.equal(settleEvolutionTrial(p,b).evolved,false);assert.deepEqual(p,once);
 }
});

test('Victoire : un exemplaire exact transformé, slot conservé, aucun coût ni autre progression, attribution unique',()=>{
 const p=profile();p.upgrades.militia=2;p.mastery.militia=22;
 const before=structuredClone(p),b=won(p,'aube-militia-rare'),r=settleEvolutionTrial(p,b);
 assert.equal(r.evolved,true);assert.equal(p.collection.militia,3);
 assert.deepEqual(p.evolvedCollection,{'militia:rare':1});
 assert.deepEqual(p.deck[0],{id:'militia',rarity:'rare'});assert.deepEqual(p.deck.slice(1),before.deck.slice(1));
 assert.deepEqual(p.completedTrials,['aube-militia-rare']);assert.equal(validateDeck(p),'');
 for(const key of ['gold','shards','heroXp','mastery','upgrades','wins','losses','completed','unlocked'])assert.deepEqual(p[key],before[key],key);
 const once=JSON.stringify(p);assert.equal(settleEvolutionTrial(p,b).evolved,false);assert.equal(JSON.stringify(p),once);
 assert.equal(createEvolutionTrial(p,'aube-militia-rare').ok,false);
 assert.equal(evolutionTrialAccess(p,'aube-militia-epic').ok,true);
 const epic=createEvolutionTrial(p,'aube-militia-epic',3).battle;
 assert.equal(epic.aiBoss,false);assert.equal(epic.board.length,2);
 const boss=createBattle(p,CAMPAIGN[2],3);assert.equal(boss.aiBoss,true);assert.equal(boss.board.length,4);
 earn(p,'aube-militia-epic');assert.equal(p.evolvedCollection['militia:rare'],0);assert.equal(p.evolvedCollection['militia:épique'],1);
 assert.equal(p.collection.militia,3);assert.equal(cardKey(p.deck[0]),'militia:épique');assert.equal(validateDeck(p),'');
 assert.equal(cardPresentation({id:'militia',rarity:'rare'},{profile:p}).availability,'Épreuve accomplie · Aucun exemplaire à ce rang');
 assert.equal(cardPresentation({id:'militia',rarity:'épique'},{profile:p}).availability,'Évolution obtenue');
});

test('Défaite, objectif manqué, mauvais camp/rang et appels hors épreuve ne consomment et ne récompensent rien',()=>{
 for(const kind of ['defeat','absent','enemy','wrong-rank','dead']){
  const p=profile(),b=won(p,'aube-militia-rare'),before=JSON.stringify(p),u=b.board[0][1];
  if(kind==='defeat')b.status='defeat';if(kind==='absent')b.board[0][1]=null;
  if(kind==='enemy')u.side='e';if(kind==='wrong-rank')u.rarity='rare';if(kind==='dead')u.hp=0;
  assert.equal(settleEvolutionTrial(p,b).evolved,false,kind);assert.equal(JSON.stringify(p),before,kind);
  assert.equal(b.progressionGranted,true);assert.equal(settleEvolutionTrial(p,b).evolved,false);
 }
 const p=profile(),b=won(p,'aube-militia-rare'),before=JSON.stringify(p);b.mode='developer';
 assert.equal(settleEvolutionTrial(p,b).ok,false);assert.equal(JSON.stringify(p),before);
 b.mode='evolution-trial';assert.equal(completeBattle(p,CAMPAIGN[0],b),null);assert.equal(grantBattleProgress(p,b).heroXp,0);assert.equal(JSON.stringify(p),before);
});

test('Moteur réel : règles uniques pour natifs et versions gagnées, bonus, réduction et recyclage restent corrects',()=>{
 const p=profile();p.upgrades.militia=2;p.mastery.militia=22;earn(p,'aube-militia-rare');
 const b=createBattle(p,{...CAMPAIGN[0],deck:[],hp:100},1,{turnFlow:'alternating'});
 assert.equal(b.evolutionsEnabled,true);assert.equal(b.cardRules,'cards-v2');
 const index=b.heroes.p.hand.findIndex(h=>h.rarity==='rare');assert.ok(index>=0);
 const stats=unitStats(b,b.heroes.p.hand[index]);assert.equal(playPlayerCard(b,index,0,1).ok,true);
 const u=b.board[0][1];assert.equal(u.rarity,'rare');assert.equal(u.cardRules,'cards-v2');
 assert.equal(u.atk,stats.atk);assert.equal(u.maxhp,stats.maxhp);assert.equal(u.atk,4);assert.equal(u.maxhp,8);
 hit(b,u,3,'e');assert.equal(u.hp,6);hit(b,u,3,'e');assert.equal(u.hp,3);
 assert.equal(u.firstHitReductionUsed,true);assert.deepEqual(b.heroes.p.discard,[{id:'militia',rarity:'rare'}]);
 b.heroes.p.hand=[];b.heroes.p.deck=[];endPlayerTurn(b);while(!playEnemyCard(b).done){}finishEnemyTurn(b);
 assert.equal(b.heroes.p.hand[0].rarity,'rare');assert.equal(b.heroes.p.hand[0].cardRules,'cards-v2');
 const legacy=createBattle(freshProfile(),CAMPAIGN[0],1);assert.equal(legacy.evolutionsEnabled,undefined);
 legacy.heroes.p.hand=[{id:'militia',rarity:'rare',wait:0}];const snapshot=JSON.stringify(legacy);
 assert.equal(playPlayerCard(legacy,0,0,1).ok,false);assert.equal(JSON.stringify(legacy),snapshot);
 assert.equal(ownedCardCopies(p,'militia'),3);assert.equal(ownedCardCopies(p,{id:'militia',rarity:'rare'}),1);
});

test('Inventaire/decks : quantités par version, propositions, entraînement partagé et imports stricts',()=>{
 const p=profile();earn(p,'aube-shield-rare');
 assert.equal(modifyDeck(p,{id:'shield',rarity:'rare'},1),false);
 assert.equal(modifyDeck(p,{id:'shield',rarity:'rare'},-1),true);
 assert.equal(modifyDeck(p,{id:'shield',rarity:'rare'},1),true);
 assert.equal(modifyDeck(p,{id:'shield',rarity:'divine'},1),false);
 for(const style of ['equilibre','assaut','rempart','arcanes']){
  const result=proposeDeck(p,style);assert.equal(result.ok,true);assert.equal(validateDeck({...p,deck:result.deck}),'');
 }
 p.collection.shield=0;p.deck=p.deck.filter(ref=>ref!=='shield');p.shards=100;
 assert.equal(upgradeCard(p,'shield').ok,true);assert.equal(p.upgrades.shield,1);
 assert.deepEqual(validateImportedProfile(JSON.parse(JSON.stringify(p))),normalizeProfile(p));
 for(const evolvedCollection of [{'bone:divine':1},{'shield:rare':-1},{'shield:rare':1.5},null]){
  assert.throws(()=>validateImportedProfile({...p,evolvedCollection}));
 }
 assert.throws(()=>validateImportedProfile({...p,completedTrials:['inconnue']}));
 assert.throws(()=>validateImportedProfile({...p,deck:[...p.deck.slice(0,11),{id:'militia',rarity:'rare'}]}));
});

test('Sauvegarde : futures piles/main/unités et quotas conservés, anciennes batailles non enrichies',()=>{
 const cache={};globalThis.localStorage={getItem:k=>cache[k]??null,setItem:(k,v)=>{cache[k]=String(v)},removeItem:k=>{delete cache[k]}};
 const p=profile();earn(p,'aube-militia-rare');const b=createBattle(p,CAMPAIGN[0],1);
 const i=b.heroes.p.hand.findIndex(h=>h.rarity==='rare');assert.equal(playPlayerCard(b,i,0,1).ok,true);hit(b,b.board[0][1],1,'e');
 assert.equal(validStoredBattle(b),true);assert.equal(storeBattle(b),true);const copy=restoreBattle();assert.ok(copy);
 assert.equal(copy.board[0][1].firstHitReductionUsed,true);assert.equal(cardKey(copy.heroes.p.discard[0]),'militia:rare');
 assert.equal(copy.board[0][1].hp,b.board[0][1].hp);assert.equal(copy.board[0][1].maxhp,b.board[0][1].maxhp);
 const bad=structuredClone(copy);bad.heroes.p.deck.push({id:'bone',rarity:'divine'});assert.equal(validStoredBattle(bad),false);
 const old=createBattle(freshProfile(),CAMPAIGN[0],2),before=JSON.stringify(old);assert.equal(storeBattle(old),true);assert.deepEqual(restoreBattle(),JSON.parse(before));
});

test('Collection et constructeur : version gagnée visible, six cellules conservées, lecture sans attribution',()=>{
 const p=profile();earn(p,'aube-archer-rare');p.collection.archer=0;p.deck=p.deck.filter(ref=>ref!=='archer');
 const before=JSON.stringify(p),v=createViews(()=>({profile:p,battle:null,screen:'collection',collectionFilter:'aube',collectionOwned:true}));
 const html=v.collectionUI(),row=html.match(/<tr data-collection-character="archer"[^]*?<\/tr>/)[0];
 assert.equal((row.match(/<td /g)||[]).length,6);assert.match(row,/Possédée ×1/);assert.match(row,/data-id="archer:rare"/);
 assert.match(v.deckUI(),/data-deck-card="archer:rare"/);assert.match(v.forgeUI(),/data-rarity="rare"/);
 assert.match(v.trialsUI(),/ÉVOLUTION OBTENUE/);assert.equal(JSON.stringify(p),before);
});

test('Deux combats terminés ne doublent pas une évolution ; partie précédente et exemplaire manquant restent sûrs',()=>{
 const p=profile(),a=won(p,'aube-militia-rare'),b=structuredClone(a);
 assert.equal(settleEvolutionTrial(p,a).evolved,true);
 const once=structuredClone(p);assert.equal(settleEvolutionTrial(p,b).evolved,false);assert.deepEqual(p,once);
 const cache={};globalThis.localStorage={getItem:k=>cache[k]??null,setItem:(k,v)=>{cache[k]=String(v)},removeItem:k=>{delete cache[k]}};
 assert.equal(saveProfile(p),true);assert.equal(startNewAdventure('clerc'),true);
 assert.equal(loadProfile().evolvedCollection,undefined);
 assert.equal(restorePreviousAdventure(),true);assert.deepEqual(loadProfile(),p);
 const missing=profile(),pending=won(missing,'aube-shield-rare');missing.collection.shield=0;
 const before=structuredClone(missing);assert.equal(settleEvolutionTrial(missing,pending).evolved,false);assert.deepEqual(missing,before);
});

test('Combats complets des quatre épreuves : fin et intégrité déterministes, objectifs réalisables',()=>{
 function run(p,id,seed){
  const b=createEvolutionTrial(p,id,seed).battle;
  for(let turn=0;turn<40&&b.status==='active';turn++){
   if(b.powerCooldown===0)usePower(b);
   for(let n=0;n<2&&b.status==='active';n++){const m=chooseSimulatedMove(b);if(!m)break;const r=playPlayerCard(b,m.i,m.lane,m.col);assert.equal(r.ok,true,r.reason);}
   if(b.status==='active')endPlayerTurn(b);
   if(b.status==='active'){while(!playEnemyCard(b).done){}finishEnemyTurn(b);}
   const units=b.board.flat().filter(Boolean);assert.ok(units.every(u=>u.hp>0));assert.equal(new Set(units.map(u=>u.uid)).size,units.length);
  }
  assert.notEqual(b.status,'active');return b;
 }
 for(const trial of EVOLUTION_TRIALS){
  const p=profile();if(trial.previous)earn(p,trial.previous);
  const before=JSON.stringify(p);let achieved=0;
  for(const seed of [...Array.from({length:32},(_,i)=>i+1),41,124]){
   const a=run(p,trial.id,seed),b=run(p,trial.id,seed);assert.deepEqual(a,b);assert.equal(JSON.stringify(p),before);
   const copy=structuredClone(p),result=settleEvolutionTrial(copy,a);if(result.evolved)achieved++;
  }
  assert.ok(achieved>0,trial.id+' : objectif jamais atteint dans la matrice');
 }
});
