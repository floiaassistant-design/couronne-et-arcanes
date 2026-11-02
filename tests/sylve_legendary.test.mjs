import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {freshProfile,fuseEvolutionCopies,modifyDeck,createBattle,playPlayerCard,endPlayerTurn,finishEnemyTurn} from '../src/engine.js';
import {SYLVE_UNIT_IDS,resolveUnitDefinition} from '../src/cards/definitions.js';
import {cardReference,cardKey,ownedCardCopies} from '../src/cards/references.js';
import {evolutionFusionFor} from '../src/evolution-fusion.js';
import {resolveUnitSupport,resolveUnitArrival} from '../src/engine/unit-support.js';
import {attackAfterPenalty,consumeAttackPenalty,applyAttackEffects,resolveRegeneration} from '../src/engine/unit-effects.js';
import {hit,resolveRetaliation,grantSharedBarrier} from '../src/engine/battle-defense.js';
import {applySilence,prepareControlUnits,triggerTrap} from '../src/engine/battle-control.js';
import {findCrownGuardian} from '../src/engine/guard-candidates.js';
import {cardPresentation,boardInspectionData} from '../src/ui/card-presentation.js';
import {boardCard} from '../src/ui/card-arena.js';
import {storeBattle,restoreBattle,validateImportedProfile,saveProfile,loadProfile} from '../src/ui/storage.js';
import {recordCombatEvent} from '../src/engine/combat-events.js';
import {freshLab,setLabRarity,createLabBattle} from '../src/engine/developer-lab.js';
import {playEnemyCard} from '../src/engine.js';

const totals={ranger:[3,5,1],wolf:[4,4,1],treant:[3,12,2],dryad:[1,7,2],stag:[5,8,3],thorn:[3,6,1],pixie:[2,4,1],bear:[5,11,2],archdruid:[3,9,3],owl:[3,5,1],sylvan_trapper:[3,6,2]};
const native=(id,side,uid,extra={})=>({id,rarity:CARDS[id].rarity,side,uid,atk:CARDS[id].attack,hp:CARDS[id].hp,maxhp:CARDS[id].hp,armor:0,ranged:CARDS[id].ability==='ranged',ability:CARDS[id].ability,stun:0,poison:0,poisonTurns:0,...extra});
function storage(){const values={};globalThis.localStorage={getItem:k=>values[k]??null,setItem:(k,v)=>{values[k]=String(v)},removeItem:k=>{delete values[k]}};}
function prepared(id){
 const p=freshProfile();p.completed=['01','02','03','04','05','06'];
 const source=cardReference({id,rarity:'épique'}),used=p.deck.filter(r=>cardKey(r)===cardKey(source)).length;
 if(typeof source==='string')p.collection[source]=used+3;else p.evolvedCollection={[cardKey(source)]:used+3};
 const plan=fuseEvolutionCopies(p,id+':légendaire');assert.equal(plan.ok,true);assert.equal(modifyDeck(p,plan.target,1),true);
 const b=createBattle(p,{...CAMPAIGN[0],hp:100,deck:[]},11,{turnFlow:'alternating'});
 for(const h of Object.values(b.heroes))Object.assign(h,{hp:100,maxhp:100,hand:[],deck:[],discard:[]});
 b.heroes.p.hand=[{...plan.target,wait:0}];return {p,b,ref:plan.target};
}
function gained(id,col=1){const x=prepared(id);assert.equal(playPlayerCard(x.b,0,0,col).ok,true);return {...x,u:x.b.board[0][col]};}
const nofx=()=>{},hooks={hit,emit:nofx,note:nofx,enter:nofx};

test('Onze Légendaires réellement fusionnées, statistiques indépendantes, aucun don ni nouveau paquet',()=>{
 assert.deepEqual(Object.keys(totals).sort(),[...SYLVE_UNIT_IDS].sort());
 for(const [id,expected] of Object.entries(totals)){
  const d=resolveUnitDefinition(id,'légendaire');assert.deepEqual([d.stats.attack,d.stats.hp,d.stats.delay],expected);
  assert.equal(evolutionFusionFor(id,'légendaire').mission,'06');assert.equal(evolutionFusionFor(id,'légendaire').ascension,undefined);
  const {p,b,u,ref}=gained(id);assert.deepEqual([u.atk,u.maxhp],[...expected.slice(0,2)]);assert.equal(ownedCardCopies(p,ref),1);
  assert.equal(p.completedTrials,undefined);assert.equal(b.mode,'campaign');assert.deepEqual(validateImportedProfile(p),p);
  storage();assert(saveProfile(p));assert.deepEqual(loadProfile(),p);assert(storeBattle(b));assert.deepEqual(restoreBattle(),b);
 }
});

test('Portée 3 réelle et première cible obligatoire, aux deux camps dans le laboratoire commun',()=>{
 for(const side of ['p','e']){
  const lab=freshLab();setLabRarity(lab,side,'ranger','légendaire');const b=createLabBattle(lab,2);b.heroes[side].hand=[{id:'ranger',wait:0}];
  if(side==='p')assert.equal(playPlayerCard(b,0,0,3).ok,true);else{b.phase='enemy';assert.equal(playEnemyCard(b).ok,true);}
  const u=b.board.flat().find(u=>u?.id==='ranger'&&u.side===side);for(const row of b.board)row.fill(null);
  const col=side==='p'?3:8,dir=side==='p'?1:-1;b.board[0][col]=u;
  const foe=native('bone',side==='p'?'e':'p',900,{hp:20,maxhp:20,stun:99}),back={...foe,uid:901};b.board[0][col+dir*2]=foe;b.board[0][col+dir*3]=back;
  if(side==='p')endPlayerTurn(b);else finishEnemyTurn(b);
  assert.equal(foe.hp,17);assert.equal(back.hp,20);assert.equal(b.board[0][col],u);
 }
});

test('Loup obtenu : Charge +3 remplace +2, sans bonus quand il ne se déplace pas',()=>{
 for(const distance of [1,3]){
  const {b,u}=gained('wolf',1),foe=native('bone','e',900,{hp:30,maxhp:30,stun:99});b.board[0][1+distance]=foe;endPlayerTurn(b);
  assert.equal(foe.hp,30-4-(distance===3?3:0));assert.equal(u.atk,4);
 }
});

test('Gardien obtenu : Armure 3, Garde positionnelle et Riposte à ATQ effective, sans Garde pour Ours',()=>{
 const {b,u}=gained('treant');assert.equal(hit(b,u,5,'e'),2);assert.equal(u.hp,10);
 assert.equal(findCrownGuardian(b,0,'p',3).u,u);assert.equal(findCrownGuardian(b,0,'p',0),null);
 const foe=native('bone','e',900,{hp:20,maxhp:20});assert(resolveRetaliation(b,u,foe,0,1,2,1));assert.equal(foe.hp,16);
 assert.equal(resolveRetaliation(b,u,foe,0,1,2,1),false);assert.equal(gained('bear').u.atk,5);assert.equal(resolveUnitDefinition('bear','légendaire').abilities.guard,undefined);
});

test('Poison obtenu : trois tours, pas de cumul, protections natives et sauvegarde des trois ticks',()=>{
 const {b,u}=gained('thorn'),foe=native('bone','e',900,{hp:20,maxhp:20,stun:99});b.board[0][2]=foe;endPlayerTurn(b);
 assert.deepEqual([foe.hp,foe.poison,foe.poisonTurns],[17,1,3]);applyAttackEffects(u,foe);assert.equal(foe.poisonTurns,3);
 u.stun=99;storage();storeBattle(b);assert.deepEqual(restoreBattle(),b);
 for(const remaining of [2,1,0]){finishEnemyTurn(b);assert.equal(foe.poisonTurns,remaining);if(remaining)endPlayerTurn(b);}
 assert.equal(foe.hp,14);
});

test('Piège obtenu : deux dégâts bruts une seule fois, armure, quota et cadence trois tours conservés',()=>{
 const {b,u}=gained('sylvan_trapper');b.round=1;prepareControlUnits(b,hooks,'p');assert.equal(b.traps.length,1);
 assert.deepEqual([b.traps[0].damage,b.traps[0].stun,b.traps[0].expiresRound,u.controlReadyRound],[2,1,3,4]);
 prepareControlUnits(b,hooks,'p');assert.equal(b.traps.length,1);
 const foe=native('bone','e',900,{hp:10,maxhp:10,armor:1});assert(triggerTrap(b,foe,0,2,hit));assert.deepEqual([foe.hp,foe.stun],[9,1]);assert.equal(triggerTrap(b,foe,0,2,hit),false);
 b.round=3;prepareControlUnits(b,hooks,'p');assert.equal(b.traps.length,0);b.round=4;prepareControlUnits(b,hooks,'p');assert.equal(b.traps.length,1);
});

test('Luciole obtenue : barrière au seul autre allié le plus blessé, plafonnée et arrivée non rejouée',()=>{
 const {b}=prepared('pixie'),x=native('bone','p',900,{hp:4,maxhp:10}),y=native('bone','p',901,{hp:1,maxhp:10}),other=native('bone','p',902,{hp:1,maxhp:20});
 b.board[0][2]=x;b.board[0][3]=y;b.board[1][2]=other;assert(playPlayerCard(b,0,0,1).ok);
 const pixie=b.board[0][1];assert.equal(b.heroes.p.shield,5);assert.equal(y.barrier,2);assert.equal(x.barrier,undefined);assert.equal(other.barrier,undefined);assert.equal(pixie.barrier,undefined);
 const once=structuredClone(b);resolveUnitArrival(b,pixie,0,1,hooks);assert.deepEqual(b,once);
 grantSharedBarrier(y,3,3);assert.equal(y.barrier,3);const second={...pixie,uid:999,arrivalResolved:false};resolveUnitArrival(b,second,0,1,hooks);assert.equal(y.barrier,3);
 hit(b,y,2,'e');assert.equal(y.barrier,1);resolveUnitArrival(b,{...second,uid:1000,arrivalResolved:false},0,1,hooks);assert.equal(y.barrier,3);
 const solo=gained('pixie');assert.equal(solo.u.barrier,undefined);assert.equal(solo.b.heroes.p.shield,5);
});

test('Régénération obtenue : soin 2 immédiat, puis 1 au prochain tour, même après mort de la Dryade',()=>{
 const {b,u}=gained('dryad'),ally=native('bone','p',900,{hp:1,maxhp:10,stun:99});b.board[0][2]=ally;endPlayerTurn(b);
 assert.equal(ally.hp,3);assert.deepEqual(ally.regeneration,{amount:1,remaining:1,readyRound:2});
 resolveRegeneration(b,'p',nofx);resolveUnitSupport(b,'p',nofx);assert.equal(ally.hp,3);
 storage();storeBattle(b);const recovered=restoreBattle();assert.deepEqual(recovered,b);
 b.board[0][1]=null;u.hp=0;finishEnemyTurn(b);endPlayerTurn(b);assert.equal(ally.hp,4);assert.equal(ally.regeneration,undefined);
});

test('Régénération : deux Dryades ne cumulent pas l’effet différé, aucun soin si cible pleine ou morte',()=>{
 const {b,u}=gained('dryad'),ally=native('bone','p',900,{hp:1,maxhp:10});b.board[0][2]=ally;b.board[0][3]={...u,uid:901};
 resolveUnitSupport(b,'p',nofx);assert.equal(ally.hp,5);assert.deepEqual(ally.regeneration,{amount:1,remaining:1,readyRound:2});
 b.round=2;resolveRegeneration(b,'p',nofx);assert.equal(ally.hp,6);resolveRegeneration(b,'p',nofx);assert.equal(ally.hp,6);
 resolveUnitSupport(b,'p',nofx);assert.equal(ally.hp,10);assert.equal(ally.regeneration.readyRound,3);
 b.round=3;resolveRegeneration(b,'p',nofx);assert.equal(ally.hp,10);assert.equal(ally.regeneration,undefined);
 ally.hp=0;ally.regeneration={amount:1,remaining:1,readyRound:3};resolveRegeneration(b,'p',nofx);assert.equal(ally.hp,0);
});

test('Harcèlement obtenu : malus de la prochaine attaque, ATQ zéro sans dégât minimum, retour à la base',()=>{
 const {b,u}=gained('owl',2),foe=native('bone','e',900,{atk:1,hp:20,maxhp:20});b.board[0][4]=foe;endPlayerTurn(b);
 assert.deepEqual(foe.attackPenalty,{amount:1,remaining:1});assert.equal(foe.atk,1);assert.equal(boardInspectionData(b,900).stats.atk,0);
 assert.match(boardCard(foe),/Harcèlement −1/);const hp=u.hp;finishEnemyTurn(b);assert.equal(u.hp,hp);assert.equal(foe.attackPenalty,undefined);assert.equal(foe.atk,1);
});

test('Harcèlement : rafraîchi sans cumul, aucune consommation par sort, Riposte comprise et bonus appliqués',()=>{
 const {b,u}=gained('owl'),foe=native('shield','e',900,{hp:20,maxhp:20});
 applyAttackEffects(u,foe);applyAttackEffects(u,foe);assert.deepEqual(foe.attackPenalty,{amount:1,remaining:1});
 hit(b,foe,3,'p');assert.deepEqual(foe.attackPenalty,{amount:1,remaining:1});
 const attacker=native('bone','p',902),before=attacker.hp;assert(resolveRetaliation(b,foe,attacker,0,2,1));assert.equal(attacker.hp,before);assert.equal(foe.attackPenalty,undefined);
 foe.lastRiposteRound=0;foe.attackPenalty={amount:1,remaining:1};assert(resolveRetaliation(b,foe,attacker,0,2,1,2));assert.equal(attacker.hp,before-2);
 const other=native('bone','e',901,{atk:3});other.attackPenalty={amount:1,remaining:1};assert.equal(consumeAttackPenalty(other,5),4);assert.equal(consumeAttackPenalty(other,5),5);
});

test('Silence : empêche nouveaux Harcèlements/soins, conserve Vol/portée et les effets déjà appliqués',()=>{
 const {b,u}=gained('owl',2),foe=native('bone','e',900,{hp:20,maxhp:20,stun:99});b.board[0][4]=foe;assert(applySilence(b,u,1));endPlayerTurn(b);
 assert.equal(foe.hp,17);assert.equal(foe.attackPenalty,undefined);
 const dryad=gained('dryad'),ally=native('bone','p',901,{hp:1,maxhp:10});dryad.b.board[0][2]=ally;applySilence(dryad.b,dryad.u,1);resolveUnitSupport(dryad.b,'p',nofx);assert.equal(ally.hp,1);assert.equal(ally.regeneration,undefined);
 ally.regeneration={amount:1,remaining:1,readyRound:1};ally.silenceUntil=5;resolveRegeneration(dryad.b,'p',nofx);assert.equal(ally.hp,2);
});

test('Ancien mode simultané : les intentions déjà préparées gardent leur ATQ, malus pour l’attaque suivante',()=>{
 const {p}=prepared('owl'),b=createBattle(p,{...CAMPAIGN[0],deck:[],hp:100},1);for(const h of Object.values(b.heroes))Object.assign(h,{hp:100,maxhp:100,hand:[],deck:[],discard:[]});
 b.heroes.p.hand=[{id:'owl',rarity:'légendaire',wait:0}];assert(playPlayerCard(b,0,0,2).ok);const u=b.board[0][2],foe=native('archer','e',900,{atk:3,hp:20,maxhp:20});b.board[0][4]=foe;
 endPlayerTurn(b);assert.equal(u.hp,2);assert.deepEqual(foe.attackPenalty,{amount:1,remaining:1});
});

test('Reprise et événements : états facultatifs validés, instantanés non modifiés par consommation',()=>{
 const {b}=gained('owl');const foe=native('bone','e',900,{hp:20,maxhp:20,attackPenalty:{amount:1,remaining:1},regeneration:{amount:1,remaining:1,readyRound:2}});b.board[0][4]=foe;
 b.vfx=[];recordCombatEvent(b,{type:'state',lane:0,col:4,side:'e'});const frame=JSON.stringify(b.vfx[0].frame);consumeAttackPenalty(foe,3);b.round=2;resolveRegeneration(b,'e',nofx);assert.equal(JSON.stringify(b.vfx[0].frame),frame);
 storage();storeBattle(b);const {vfx,...saved}=b;assert.deepEqual(restoreBattle(),saved);
 for(const effect of [{attackPenalty:{amount:-1,remaining:1}},{regeneration:{amount:1,remaining:1,readyRound:Infinity}},{attackPenalty:null},{regeneration:{amount:1,remaining:0,readyRound:2}}]){
  const copy=structuredClone(saved);Object.assign(copy.board[0][4],effect);storeBattle(copy);assert.equal(restoreBattle(),null);
 }
 assert.equal(attackAfterPenalty(foe,3),3);assert.match(cardPresentation({id:'owl',rarity:'légendaire'}).details.join(' '),/Harcèlement/);
});

test('Effets réels aux deux camps : Harcèlement, poison prolongé, soin/régénération et arrivée alliée',()=>{
 for(const side of ['p','e'])for(const id of ['owl','thorn','dryad','pixie']){
  const lab=freshLab();setLabRarity(lab,side,id,'légendaire');const b=createLabBattle(lab,7);
  for(const h of Object.values(b.heroes))Object.assign(h,{hp:100,maxhp:100,hand:[],deck:[],discard:[]});
  const col=side==='p'?1:10,dir=side==='p'?1:-1;
  const ally=native('bone',side,900,{hp:1,maxhp:10,stun:99});
  if(id==='pixie')for(let lane=0;lane<b.board.length;lane++)b.board[lane][col+dir]={...ally,uid:900+lane};
  b.heroes[side].hand=[{id,wait:0}];
  if(side==='p')assert(playPlayerCard(b,0,0,col).ok);else{b.phase='enemy';assert(playEnemyCard(b).ok);}
  const u=b.board.flat().find(u=>u?.id===id&&u.side===side);
  if(id==='pixie'){assert.equal(b.heroes[side].shield,5);assert.deepEqual(b.board.flat().filter(x=>x?.barrier).map(x=>x.barrier),[2]);continue;}
  for(const row of b.board)row.fill(null);b.board[0][col]=u;
  const foe=native('bone',side==='p'?'e':'p',901,{hp:20,maxhp:20,stun:99});
  if(id==='dryad')b.board[0][col+dir]=ally;else b.board[0][col+dir]=foe;
  if(side==='p')endPlayerTurn(b);else finishEnemyTurn(b);
  if(id==='owl')assert.deepEqual(foe.attackPenalty,{amount:1,remaining:1});
  if(id==='thorn')assert.deepEqual([foe.poison,foe.poisonTurns],[1,3]);
  if(id==='dryad'){assert.equal(ally.hp,3);assert.deepEqual(ally.regeneration,{amount:1,remaining:1,readyRound:2});}
 }
});
