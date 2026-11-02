import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {SYLVE_UNIT_IDS,resolveUnitDefinition} from '../src/cards/definitions.js';
import {freshProfile,fuseEvolutionCopies,modifyDeck,createBattle,playPlayerCard,endPlayerTurn,finishEnemyTurn} from '../src/engine.js';
import {cardKey,ownedCardCopies} from '../src/cards/references.js';
import {applyAttackEffects,resolveRegeneration,attackAfterPenalty,consumeAttackPenalty} from '../src/engine/unit-effects.js';
import {applyUnitPoison,tickUnitPoison} from '../src/engine/unit-poison.js';
import {resolveUnitSupport} from '../src/engine/unit-support.js';
import {hit,grantSharedBarrier,resolveRetaliation} from '../src/engine/battle-defense.js';
import {resolveStrikeRewards} from '../src/engine/unit-triggers.js';
import {resolveUnitDeath} from '../src/engine/unit-death.js';
import {findCrownGuardian} from '../src/engine/guard-candidates.js';
import {prepareControlUnits,triggerTrap,applySilence,expireControl} from '../src/engine/battle-control.js';
import {unitHasPierce,unitMovementSteps} from '../src/engine/unit-rules.js';
import {recordCombatEvent} from '../src/engine/combat-events.js';
import {storeBattle,restoreBattle,saveProfile,loadProfile,validateImportedProfile,validStoredBattle} from '../src/ui/storage.js';
import {cardPresentation,boardInspectionData} from '../src/ui/card-presentation.js';

const noop=()=>{},hooks={hit,emit:noop,note:noop,enter:noop};
let uid=1000;
function unit(id,rarity='commun',side='e',extra={}){
 const d=resolveUnitDefinition(id,rarity);return {uid:uid++,id,rarity,side,atk:d.stats.attack,hp:d.stats.hp,maxhp:d.stats.hp,armor:d.abilities.armor?.amount||0,ranged:d.geometry.range>1,ability:CARDS[id].ability,stun:0,poison:0,poisonTurns:0,...extra};
}
function gained(id,rarity='divine',side='p'){
 const p=freshProfile();p.completed=CAMPAIGN.map(m=>m.id);p.completedTrials=['sylve-ascension-divine',...(rarity==='éveillée'?['sylve-ascension-eveillee']:[])];
 const from=rarity==='divine'?'légendaire':'divine';p.evolvedCollection={[cardKey({id,rarity:from})]:3};
 const r=fuseEvolutionCopies(p,id+':'+rarity);assert.equal(r.ok,true);assert.equal(modifyDeck(p,r.target,1),true);
 const b=createBattle(p,{...CAMPAIGN[0],deck:[],hp:100},11,{turnFlow:'alternating'});
 for(const h of Object.values(b.heroes))Object.assign(h,{hp:100,maxhp:100,hand:[],deck:[],discard:[]});
 b.heroes.p.hand=[{...r.target,wait:0}];assert(playPlayerCard(b,0,0,1).ok);
 const u=b.board[0][1];u.side=side;return {p,b,u};
}
function storage(){const data={};globalThis.localStorage={getItem:k=>data[k]??null,setItem:(k,v)=>{data[k]=String(v)},removeItem:k=>{delete data[k]}};}
const advance=(b,side)=>side==='p'?endPlayerTurn(b):finishEnemyTurn(b);

test('22 ascensions obtenues par fusion : pas de statistiques inventées, stocks exacts, import et reprise',()=>{
 const expected={ranger:[3,5],wolf:[4,4],treant:[3,12],dryad:[1,7],stag:[5,8],thorn:[3,6],pixie:[2,4],bear:[5,11],archdruid:[3,9],owl:[3,5],sylvan_trapper:[3,6]};
 for(const id of SYLVE_UNIT_IDS)for(const rank of ['divine','éveillée']){
  const {p,b,u}=gained(id,rank);assert.deepEqual([u.atk,u.maxhp],expected[id]);assert.equal(ownedCardCopies(p,{id,rarity:rank}),1);
  assert.equal(ownedCardCopies(p,{id,rarity:rank==='divine'?'légendaire':'divine'}),0);
  assert.deepEqual(validateImportedProfile(p),p);storage();assert(saveProfile(p));assert.deepEqual(loadProfile(),p);assert(storeBattle(b));assert.deepEqual(restoreBattle(),b);
  const model=cardPresentation({id,rarity:rank});assert.ok(model.card.description.length<=90,id+rank);assert.ok(model.details.length>0);
 }
});

test('Entrave : une seule application divine, réveil tous les trois tours, cible survivante et aucun cumul',()=>{
 for(const rank of ['divine','éveillée']){
  const {u}=gained('ranger',rank),target=unit('bone');
  applyAttackEffects(u,target,false,1);assert.equal(target.movementRoot,1);delete target.movementRoot;
  applyAttackEffects(u,target,false,2);assert.equal(target.movementRoot,undefined);
  applyAttackEffects(u,target,false,3);assert.equal(target.movementRoot,undefined);
  applyAttackEffects(u,target,false,4);assert.equal(target.movementRoot,rank==='éveillée'?1:undefined);
 }
 for(const extra of [{hp:0},{}]){
  const {u}=gained('ranger'),target=unit('bone','commun','e',extra);
  applyAttackEffects(u,target,true,1);assert.equal(u.entangleUsed,undefined);
  applyAttackEffects(u,target,false,1,false);assert.equal(u.entangleUsed,undefined);
 }
});

test('Entrave réelle aux deux camps : prochain déplacement sauté, attaque conservée et état consommé',()=>{
 for(const side of ['p','e']){
  const {b,u}=gained('ranger','divine',side),foe=side==='p'?'e':'p';
  for(const row of b.board)row.fill(null);const col=side==='p'?2:9,dir=side==='p'?1:-1;
  b.board[0][col]=u;const target=unit('bone','commun',foe,{hp:20,maxhp:20});b.board[0][col+dir]=target;
  b.phase=side==='p'?'player':'enemy';advance(b,side);assert.equal(target.movementRoot,1);const hp=u.hp;
  b.phase=foe==='p'?'player':'enemy';advance(b,foe);assert.equal(target.movementRoot,undefined);assert.equal(b.board[0][col+dir],target);assert.ok(u.hp<hp);
 }
});

test('Loup : armure ignorée seulement avec déplacement, barrière conservée, trois pas éveillés et une frappe',()=>{
 for(const rank of ['divine','éveillée'])for(const distance of [1,4]){
  const {b,u}=gained('wolf',rank),target=unit('shield','commun','e',{hp:30,maxhp:30,armor:3,stun:99,barrier:2});b.board[0][1+distance]=target;
  assert.equal(unitHasPierce(u,false,false),false);assert.equal(unitHasPierce(u,false,true),true);assert.equal(unitHasPierce(u,true,true),false);
  endPlayerTurn(b);const moved=rank==='éveillée'?3:2;
  if(distance===1)assert.equal(target.hp,30);else if(rank==='éveillée')assert.equal(target.hp,25);else assert.equal(target.hp,30);
  assert.equal(b.board[0][distance===1?1:1+moved],u);assert.equal(u.atk,4);
 }
});

test('Gardien : Garde de ligne même dépassé, puis toutes lignes, une interception et Riposte au contact seulement',()=>{
 for(const rank of ['divine','éveillée']){
  const {b,u}=gained('treant',rank);b.board[0][1]=null;b.board[0][5]=u;
  assert.equal(findCrownGuardian(b,0,'p',2).u,u);
  assert.equal(findCrownGuardian(b,1,'p',2)?.u,rank==='éveillée'?u:undefined);
  assert.equal(u.armor,3);const foe=unit('bone','commun','e',{hp:20,maxhp:20});assert(resolveRetaliation(b,u,foe,0,5,4));assert.equal(foe.hp,17);assert.equal(resolveRetaliation(b,u,foe,0,5,4),false);
 }
});

test('Dryade : deux régénérations après soin effectif, rafraîchies sans cumul et indépendantes de la source',()=>{
 for(const rank of ['divine','éveillée']){
  const {b,u}=gained('dryad',rank),target=unit('bone','commun','p',{hp:1,maxhp:20});b.board[0][2]=target;
  resolveUnitSupport(b,'p',noop);assert.equal(target.hp,rank==='divine'?3:4);assert.deepEqual(target.regeneration,{amount:1,remaining:2,readyRound:2});
  u.hp=0;for(const round of [2,3]){b.round=round;const hp=target.hp;resolveRegeneration(b,'p',noop);assert.equal(target.hp,hp+1);resolveRegeneration(b,'p',noop);assert.equal(target.hp,hp+1);}
  assert.equal(target.regeneration,undefined);u.hp=u.maxhp;b.round=4;resolveUnitSupport(b,'p',noop);b.round=5;resolveUnitSupport(b,'p',noop);assert.equal(target.regeneration.remaining,2);
 }
});

test('Cerf : barrière après vraie Charge sur unité, allié le plus blessé au rang Éveillé, plafonds sans cumul',()=>{
 for(const rank of ['divine','éveillée'])for(const charged of [false,true]){
  const {b,u}=gained('stag',rank),ally=unit('bone','commun','p',{hp:1,maxhp:10});b.board[0][2]=ally;
  const other=unit('bone','commun','p',{hp:4,maxhp:10});b.board[0][3]=other;
  const intent={charged,furious:false,killed:false,suppressed:false};resolveStrikeRewards(b,u,0,1,intent,noop);resolveStrikeRewards(b,u,0,1,intent,noop);
  assert.equal(u.barrier||0,charged?2:0);assert.equal(ally.barrier||0,charged&&rank==='éveillée'?2:0);assert.equal(other.barrier,undefined);
  grantSharedBarrier(u,8,10);resolveStrikeRewards(b,u,0,1,intent,noop);assert.equal(u.barrier,charged?10:8);
 }
 const {b,u}=gained('stag','éveillée');endPlayerTurn(b);assert.equal(u.barrier,undefined);
 const x=gained('stag','éveillée'),target=unit('bone','commun','e',{hp:30,maxhp:30,stun:99});x.b.board[0][4]=target;endPlayerTurn(x.b);assert.equal(x.u.barrier,2);assert.equal(target.hp,23);
});

test('Traqueur : Poison 2 × 3, rafraîchissement exact, contagion une fois au premier décès, sans chaîne',()=>{
 const {b,u}=gained('thorn','éveillée'),target=unit('bone'),near=unit('bone'),far=unit('bone');Object.assign(target,{hp:20,maxhp:20});b.board[0][4]=target;b.board[0][3]=near;b.board[0][7]=far;
 applyAttackEffects(u,target,false,1);assert.deepEqual([target.poison,target.poisonTurns],[2,3]);target.poisonTurns=1;applyAttackEffects(u,target,false,1);assert.equal(target.poisonTurns,3);
 u.hp=0;target.hp=0;resolveUnitDeath(b,target,0,4,noop);assert.deepEqual([near.poison,near.poisonTurns],[2,2]);assert.equal(far.poisonTurns,0);assert.deepEqual(b.poisonSpreads,[u.uid]);assert.equal(near.poisonOrigin.contagion,undefined);
 near.hp=0;resolveUnitDeath(b,near,0,3,noop);assert.equal(far.poisonTurns,0);resolveUnitDeath(b,target,0,4,noop);assert.equal(far.poisonTurns,0);
});

test('Contagion : dernier tick létal et égalité déterministe ; ni allié ni autre ligne, première mort sans cible consommée',()=>{
 for(const eligible of [true,false]){
  const {b,u}=gained('thorn','éveillée'),target=unit('bone','commun','e',{hp:2});b.board[0][5]=target;
  const left=unit('bone'),right=unit('bone');if(eligible){b.board[0][4]=left;b.board[0][6]=right;}else{b.board[0][4]=unit('bone','commun','p');b.board[1][5]=right;}
  applyAttackEffects(u,target,false,1);target.poisonTurns=1;assert(tickUnitPoison(b,target));resolveUnitDeath(b,target,0,5,noop);
  assert.equal(left.poisonTurns,eligible?2:0);assert.equal(right.poisonTurns,0);assert.deepEqual(b.poisonSpreads,[u.uid]);
 }
});

test('Luciole : bouclier de décès 2 puis 4, plafond 20, seulement lors de sa destruction en combat',()=>{
 for(const [rank,amount] of [['divine',2],['éveillée',4]])for(const side of ['p','e']){
  const {b,u}=gained('pixie',rank,side);b.heroes[side].shield=0;u.hp=0;endPlayerTurn(b);assert.equal(b.heroes[side].shield,amount);finishEnemyTurn(b);assert.equal(b.heroes[side].shield,amount);
  const x=gained('pixie',rank,side);x.b.heroes[side].shield=19;x.u.hp=0;endPlayerTurn(x.b);assert.equal(x.b.heroes[side].shield,20);
  const y=gained('pixie',rank,side);y.b.heroes[side].shield=0;y.b.board[0][1]=null;endPlayerTurn(y.b);assert.equal(y.b.heroes[side].shield,0);
 }
});

test('Ours : Fureur seulement après vraie perte de PV d’attaque, sans cumul, consommée puis réactivable',()=>{
 for(const [rank,amount] of [['divine',2],['éveillée',3]]){
  const {b,u}=gained('bear',rank);hit(b,u,3,'e');assert.equal(u.fury,undefined);
  u.barrier=5;hit(b,u,3,'e',false,true);assert.equal(u.fury,undefined);u.barrier=0;hit(b,u,3,'e',false,true);assert.equal(u.fury,amount);
  hit(b,u,3,'e',false,true);assert.equal(u.fury,amount);assert.equal(attackAfterPenalty(u,u.atk),5+amount);assert.equal(boardInspectionData(b,u.uid).stats.atk,5+amount);
  assert.equal(consumeAttackPenalty(u,u.atk),5+amount);assert.equal(consumeAttackPenalty(u,u.atk),5);hit(b,u,3,'e',false,true);assert.equal(u.fury,amount);
 }
});

test('Ours Éveillé : élimination réelle sous Fureur donne barrière 2, sinon aucun gain',()=>{
 for(const fury of [0,3])for(const hp of [5,30]){
  const {b,u}=gained('bear','éveillée'),target=unit('bone','commun','e',{hp,maxhp:hp,stun:99});if(fury)u.fury=fury;b.board[0][2]=target;
  endPlayerTurn(b);assert.equal(u.barrier||0,fury&&hp===5?2:0);assert.equal(u.fury,undefined);
  resolveStrikeRewards(b,u,0,1,{furious:true,killed:true,suppressed:false},noop);assert.equal(u.barrier,2);
 }
});

test('Archidruide : purification de la seule cible soignée, Entrave éveillée, pas de dissipation sans PV rendus',()=>{
 for(const rank of ['divine','éveillée']){
  const {b,u}=gained('archdruid',rank),target=unit('bone','commun','p',{hp:1,maxhp:10,movementRoot:1,stun:1,silenceUntil:5});b.board[0][2]=target;
  applyUnitPoison(target,{amount:2,resolutions:3,sourceBound:true},{uid:999,side:'e'});resolveUnitSupport(b,'p',noop);
  assert.equal(target.hp,rank==='divine'?3:4);assert.equal(target.poisonTurns,0);assert.equal(target.poisonOrigin,undefined);assert.equal(target.movementRoot,rank==='éveillée'?undefined:1);assert.equal(target.stun,1);assert.equal(target.silenceUntil,5);
  b.round++;target.hp=10;u.hp=u.maxhp;target.poisonTurns=2;target.movementRoot=1;resolveUnitSupport(b,'p',noop);assert.equal(target.poisonTurns,2);assert.equal(target.movementRoot,1);
 }
});

test('Hibou : −2 pour une puis deux attaques, renouvellement sans cumul et Riposte comprise',()=>{
 for(const [rank,count] of [['divine',1],['éveillée',2]]){
  const {b,u}=gained('owl',rank),target=unit('shield','commun','e',{hp:20,maxhp:20});applyAttackEffects(u,target);applyAttackEffects(u,target);assert.deepEqual(target.attackPenalty,{amount:2,remaining:count});
  const attacker=unit('bone','commun','p');assert(resolveRetaliation(b,target,attacker,0,2,1));assert.equal(target.attackPenalty?.remaining,count===2?1:undefined);assert.equal(attacker.hp,attacker.maxhp);
  assert.equal(consumeAttackPenalty(target,4),count===2?2:4);assert.equal(target.attackPenalty,undefined);
 }
});

test('Trappeur : période 3 puis 2, un piège visible, poison différé pour deux tours, pas après décès',()=>{
 for(const [rank,period] of [['divine',3],['éveillée',2]]){
  const {b,u}=gained('sylvan_trapper',rank);prepareControlUnits(b,hooks,'p');prepareControlUnits(b,hooks,'p');assert.equal(b.traps.length,1);assert.equal(u.controlReadyRound,1+period);
  assert.deepEqual(b.traps[0].poison,{amount:1,resolutions:2});assert.equal(b.traps[0].expiresRound,3);
  const target=unit('bone','commun','e',{hp:10,maxhp:10});b.board[0][2]=target;assert(triggerTrap(b,target,0,2,hit));assert.deepEqual([target.hp,target.stun,target.poison,target.poisonTurns],[8,1,1,2]);
  assert.equal(tickUnitPoison(b,target),false);for(const round of [2,3]){b.round=round;assert(tickUnitPoison(b,target));}assert.equal(target.hp,6);assert.equal(target.poisonTurns,0);
  b.board[0][2]=null;b.round=1+period;prepareControlUnits(b,hooks,'p');assert.equal(b.traps.length,1);b.round+=3;expireControl(b);assert.equal(b.traps.length,0);
 }
});

test('Silence : nouvelles capacités bloquées, effets déjà appliqués maintenus ; déplacement et ATQ affichés partagés',()=>{
 for(const id of ['ranger','bear','pixie','stag','thorn']){
  const {b,u}=gained(id,'éveillée');assert(applySilence(b,u,1),id);
  if(id==='bear'){hit(b,u,3,'e',false,true);assert.equal(u.fury,undefined);}
  if(id==='pixie'){b.heroes.p.shield=0;u.hp=0;resolveUnitDeath(b,u,0,1,noop);assert.equal(b.heroes.p.shield,0);}
  const target=unit('bone');applyAttackEffects(u,target,true,1);assert.equal(target.movementRoot,undefined);assert.equal(target.poisonTurns,0);
 }
 const {u}=gained('wolf','éveillée');u.movementRoot=1;assert.equal(unitMovementSteps(u),0);
});

test('Reprise : états optionnels validés, vieux combats inchangés et instantanés immuables',()=>{
 const {b,u}=gained('thorn','éveillée'),target=unit('bone','commun','e',{hp:20,maxhp:20});b.board[0][4]=target;applyAttackEffects(u,target,false,1);target.movementRoot=1;u.fury=3;u.entangleReadyRound=4;b.poisonSpreads=[123];
 b.vfx=[];recordCombatEvent(b,{type:'state',lane:0,col:4,side:'e'});const frame=JSON.stringify(b.vfx[0].frame);tickUnitPoison(b,target);applyAttackEffects(u,target,false,2);consumeAttackPenalty(u,3);assert.equal(JSON.stringify(b.vfx[0].frame),frame);
 storage();storeBattle(b);const {vfx,...saved}=b;assert.deepEqual(restoreBattle(),saved);
 for(const effect of [{movementRoot:2},{fury:-1},{entangleUsed:1},{deathResolved:1},{entangleReadyRound:Infinity},{lastFuryBarrierRound:0},{poisonOrigin:null},{poisonOrigin:{uid:-1,side:'e'}},{poisonOrigin:{uid:1,side:'x'}},{poisonOrigin:{uid:1,side:'e',contagion:{amount:2,resolutions:0}}}]){
  const bad=structuredClone(saved);Object.assign(bad.board[0][4],effect);assert.equal(validStoredBattle(bad),false);
 }
 for(const ids of [[1,1],[-1],null]){const bad=structuredClone(saved);bad.poisonSpreads=ids;assert.equal(validStoredBattle(bad),false);}
});

test('Luciole : le décès protège immédiatement la couronne contre la frappe suivante, jamais deux fois',()=>{
 const {b,u}=gained('pixie','éveillée');b.heroes.p.shield=0;const attacker=unit('bone','commun','e',{atk:20,hp:50,maxhp:50});b.board[0][2]=attacker;
 b.board[1][1]=unit('bone','commun','e',{atk:5,hp:50,maxhp:50});b.phase='enemy';finishEnemyTurn(b);
 assert.equal(b.heroes.p.hp,99);assert.equal(b.heroes.p.shield,0);assert.equal(u.deathResolved,true);
 const hp=b.heroes.p.hp;resolveUnitDeath(b,u,0,1,noop);assert.equal(b.heroes.p.shield,0);assert.equal(b.heroes.p.hp,hp);
});

test('Contagion : ordre réel des morts et poison différé si le décès survient pendant les ticks',()=>{
 const {b,u}=gained('thorn','éveillée'),left=unit('bone'),right=unit('bone'),nearRight=unit('bone');b.board[0][3]=left;b.board[0][8]=right;b.board[0][9]=nearRight;
 applyAttackEffects(u,left);applyAttackEffects(u,right);hit(b,right,100,'p');assert.equal(nearRight.poisonTurns,2);hit(b,left,100,'p');assert.deepEqual(b.poisonSpreads,[u.uid]);
 const x=gained('thorn','éveillée'),dead=unit('bone','commun','e',{hp:2}),next=unit('bone','commun','e',{hp:20,maxhp:20});x.b.board[0][4]=dead;x.b.board[0][5]=next;applyAttackEffects(x.u,dead);dead.poisonTurns=1;
 x.b.phase='enemy';finishEnemyTurn(x.b);assert.equal(next.hp,20);assert.equal(next.poisonTurns,2);assert.equal(dead.deathResolved,true);
 x.b.phase='enemy';finishEnemyTurn(x.b);assert.equal(next.hp,18);assert.equal(next.poisonTurns,1);
});

test('Fureur : les dégâts secondaires d’une attaque comptent, les pièges et sorts n’activent rien',()=>{
 for(const side of ['p','e']){
  const {b,u}=gained('bear','éveillée',side),foe=side==='p'?'e':'p';for(const row of b.board)row.fill(null);
  const col=foe==='p'?1:10,dir=foe==='p'?1:-1;const archer=unit('archer','éveillée',foe,{atk:1});b.board[0][col]=archer;
  b.board[0][col+dir]=unit('bone','commun',side,{hp:20,maxhp:20,stun:99});b.board[0][col+2*dir]=u;
  b.phase=foe==='p'?'player':'enemy';advance(b,foe);assert.equal(u.hp,10);assert.equal(u.fury,3);
 }
});
