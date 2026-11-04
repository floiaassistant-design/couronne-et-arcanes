import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import {endPlayerTurn,finishEnemyTurn} from '../src/engine.js';
import {resolveUnitDefinition} from '../src/cards/definitions.js';
import {hit,resolveRetaliation} from '../src/engine/battle-defense.js';
import {applySilence,expireControl} from '../src/engine/battle-control.js';
import {applyAttackEffects} from '../src/engine/unit-effects.js';
import {tickUnitPoison} from '../src/engine/unit-poison.js';
import {placeSpotMark} from '../src/engine/unit-strike-modifiers.js';
import {captureCombatFrame,recordCombatEvent} from '../src/engine/combat-events.js';
import {boardInspectionData,cardPresentation} from '../src/ui/card-presentation.js';
import {storeBattle,restoreBattle,validStoredBattle} from '../src/ui/storage.js';
import {forgeBattle,forgeUnit as unit,forgeContact as contact,directForgeHit as directHit,testStorage} from './fixtures/forge-combat.mjs';
import {ascensionScenarios} from './fixtures/ascension-scenarios.mjs';
import {forgeTacticalFixture} from './fixtures/forge-tactical-battle.mjs';

const ranks=['divine','éveillée'];
function attack(c){(c.u.side==='p'?endPlayerTurn:finishEnemyTurn)(c.b);}
function poison(c,source=c.u){applyAttackEffects(source,c.target,false,c.b.round);}

test('Canon et Alchimiste : quatre vraies fusions, statistiques et capacités héritées intactes',()=>{
 for(const [id,stats] of Object.entries({cannon:[5,9,3],alchemist:[4,7,2]}))for(const rank of ranks){
  const d=resolveUnitDefinition(id,rank),{p,u}=forgeBattle(id,rank);assert.deepEqual([d.stats.attack,d.stats.hp,d.stats.delay],stats);
  assert.deepEqual([u.atk,u.maxhp],stats.slice(0,2));assert.equal(p.evolvedCollection[id+':'+rank],1);
 }
 assert.equal(resolveUnitDefinition('cannon','divine').geometry.range,2);
 assert.equal(resolveUnitDefinition('alchemist','légendaire').abilities.poison.sourceBound,undefined);
});

test('Repérage : vrai tir blessant et cible survivante, marque et cadence dans les deux camps',()=>{
 for(const side of ['p','e'])for(const rank of ranks){
  const c=contact('cannon',rank,side);attack(c);assert.equal(c.target.hp,38);
  assert.deepEqual(c.target.spotMark,{sourceUid:c.u.uid,side,amount:2,remaining:rank==='divine'?1:2,expiresRound:3});
  assert.equal(c.u.spottingReadyRound,4);
 }
});

test('Canon : aucune marque sur absorption complète, élimination, Silence ou attaque nulle',()=>{
 for(const kind of ['barrier','dead','silence','zero']){
  const c=contact('cannon','éveillée');if(kind==='barrier')c.target.barrier=10;if(kind==='dead')c.target.hp=1;
  if(kind==='silence')applySilence(c.b,c.u,1);if(kind==='zero')c.u.atk=0;
  attack(c);assert.equal(c.target.spotMark,undefined,kind);assert.equal(c.u.spottingReadyRound,undefined,kind);
 }
});

test('Une ou deux attaques alliées : +2 bruts avant protections, ni bonus personnel du Canon ni attaque ajoutée',()=>{
 for(const rank of ranks){
  const c=contact('cannon',rank);attack(c);const ally=unit('militia','p',{atk:5});c.b.board[0][c.col-1]=ally;
  directHit(c.b,c.u,c.target,5);assert.equal(c.target.hp,36);assert.equal(c.target.spotMark.remaining,rank==='divine'?1:2);
  directHit(c.b,ally,c.target);assert.equal(c.target.hp,32);
  assert.equal(c.target.spotMark?.remaining,rank==='divine'?undefined:1);
  directHit(c.b,ally,c.target);assert.equal(c.target.hp,rank==='divine'?30:28);assert.equal(c.target.spotMark,undefined);
  assert.equal(ally.atk,5);
 }
});

test('Un vrai tour de deux alliés : le Canon pose la marque puis une autre unité l’utilise',()=>{
 for(const side of ['p','e']){
  const c=contact('cannon','divine',side);for(const row of c.b.board)row.fill(null);
  const from=side==='p'?3:6,ally=unit('archer',side,{atk:4});
  c.b.board[0][from]=c.u;c.b.board[0][from+1]=ally;c.b.board[0][5]=c.target;attack(c);
  assert.equal(c.target.hp,35);assert.equal(c.target.spotMark,undefined);assert.equal(c.u.spottingReadyRound,4);
  assert.equal(c.b.vfx.filter(e=>e.type==='attack'&&!e.riposte).length,2);
 }
});

test('Repérage : sorts/secondaires exclus, Riposte d’un autre allié et attaque absorbée consomment une utilisation',()=>{
 const c=contact('cannon','éveillée');attack(c);hit(c.b,c.target,5,'p');hit(c.b,c.target,5,'p',false,true);
 assert.equal(c.target.spotMark.remaining,2);
 const guard=unit('golem','p',{atk:5});c.b.board[0][c.col]=guard;assert(resolveRetaliation(c.b,guard,c.target,0,c.col,c.col+1));
 assert.equal(c.target.spotMark.remaining,1);c.target.barrier=10;directHit(c.b,guard,c.target,5);
 assert.equal(c.target.spotMark,undefined);assert.equal(c.target.barrier,6);
});

test('Une marque par Canon/cible, remplacement sans cumul et ancienne source sans propriété résiduelle',()=>{
 const c=contact('cannon','éveillée');attack(c);const other=unit('militia','e',{hp:40,maxhp:40}),second=unit('cannon','p',{rarity:'divine'});
 c.b.board[1][5]=other;c.b.board[1][4]=second;
 placeSpotMark(c.b,c.u,other,resolveUnitDefinition('cannon','éveillée').abilities.spotting,recordCombatEvent);assert.equal(c.target.spotMark,undefined);assert.equal(other.spotMark.sourceUid,c.u.uid);
 placeSpotMark(c.b,second,other,resolveUnitDefinition('cannon','divine').abilities.spotting,recordCombatEvent);assert.equal(other.spotMark.sourceUid,second.uid);assert.equal(other.spotMark.remaining,1);
 directHit(c.b,second,other,5);assert.ok(other.spotMark);directHit(c.b,c.u,other,5);assert.equal(other.spotMark,undefined);
});

test('Repérage : cadence 1/4, expiration après le deuxième tour suivant, effet posé conservé si Canon meurt',()=>{
 const c=contact('cannon','éveillée');attack(c);const before=structuredClone(c.target.spotMark);
 c.b.round=2;c.b.phase='player';attack(c);assert.deepEqual(c.target.spotMark,before);assert.equal(c.u.spottingReadyRound,4);
 c.u.hp=0;expireControl(c.b);assert.ok(c.target.spotMark);c.b.round=3;expireControl(c.b);assert.equal(c.target.spotMark,undefined);
});

test('Silence après pose ne retire pas la marque et ne bloque pas l’allié bénéficiaire',()=>{
 const c=contact('cannon','divine');attack(c);applySilence(c.b,c.u,1);const ally=unit('militia','p',{atk:5,silenceUntil:1});c.b.board[0][c.col-1]=ally;
 directHit(c.b,ally,c.target);assert.equal(c.target.hp,34);assert.equal(c.target.spotMark,undefined);
});

test('Catalyse : première attaque pose le poison sourcé, deuxième le consomme, deux camps et deux rangs',()=>{
 for(const side of ['p','e'])for(const rank of ranks){
  const c=contact('alchemist',rank,side);c.target.armor=2;attack(c);
  assert.equal(c.target.hp,38);assert.deepEqual(c.target.poisonOrigin,{uid:c.u.uid,side});assert.equal(c.target.poisonTurns,2);assert.equal(c.u.catalysisReadyRound,undefined);
  c.b.round=2;c.b.phase=side==='p'?'player':'enemy';attack(c);
  assert.equal(c.target.hp,rank==='divine'?35:34);assert.equal(c.target.poisonTurns,0);assert.equal(c.target.poisonOrigin,undefined);assert.equal(c.u.catalysisReadyRound,5);
  assert.equal(c.b.vfx.filter(e=>e.type==='attack'&&!e.riposte).length,2);
 }
});

test('Catalyse : seul le poison de la même invocation est consommé, pas celui d’une autre copie ou d’un natif',()=>{
 for(const source of ['other','native','none']){
  const c=contact('alchemist','éveillée'),other=unit('alchemist','p',{rarity:source==='native'?'rare':'éveillée'});
  if(source!=='none')poison(c,other);attack(c);
  assert.equal(c.u.catalysisReadyRound,undefined);assert.equal(c.target.poisonTurns,2);assert.equal(c.target.poisonOrigin.uid,c.u.uid);
 }
});

test('Catalyse : cadence partagée, poison réappliqué hors déclenchement puis consommé après disponibilité',()=>{
 const c=contact('alchemist','éveillée');c.target.armor=0;poison(c);attack(c);assert.equal(c.u.catalysisReadyRound,4);
 c.b.round=2;c.b.phase='player';attack(c);assert.equal(c.target.poisonTurns,2);
 const hp=c.target.hp;c.b.round=3;c.b.phase='player';attack(c);assert.equal(c.target.hp,hp-4);assert.equal(c.target.poisonTurns,2);
 c.b.round=4;c.b.phase='player';attack(c);assert.equal(c.u.catalysisReadyRound,7);assert.equal(c.target.poisonTurns,0);
});

test('Catalyse : barrières/Armure protègent séparément les deux dégâts, pas de chaîne de réaction fatale',()=>{
 const c=contact('alchemist','éveillée');c.target.armor=2;c.target.barrier=3;poison(c);attack(c);
 assert.equal(c.target.hp,39);assert.equal(c.target.barrier,0);assert.equal(c.target.poisonTurns,0);assert.equal(c.u.catalysisReadyRound,4);
 const dead=contact('alchemist','éveillée');dead.target.hp=1;poison(dead);attack(dead);assert.equal(dead.u.catalysisReadyRound,undefined);
});

test('Catalyse : Silence, attaque nulle, poison expiré, sorts et couronne ne provoquent aucune détonation',()=>{
 for(const kind of ['silence','zero','expired','spell','crown']){
  const c=contact('alchemist','éveillée');poison(c);
  if(kind==='silence')applySilence(c.b,c.u,1);if(kind==='zero')c.u.atk=0;
  if(kind==='expired'){c.target.poisonTurns=1;tickUnitPoison(c.b,c.target);}
  if(kind==='spell')hit(c.b,c.target,4,'p');
  else if(kind==='crown'){for(const row of c.b.board)row.fill(null);c.b.board[0][10]=c.u;attack(c);}
  else attack(c);
  assert.equal(c.u.catalysisReadyRound,undefined,kind);
 }
});

test('Détonation secondaire et Sapeur ne consomment pas une marque comme une attaque supplémentaire',()=>{
 const c=contact('alchemist','éveillée'),canon=unit('cannon','p',{rarity:'éveillée'});c.b.board[1][1]=canon;poison(c);
 placeSpotMark(c.b,canon,c.target,resolveUnitDefinition('cannon','éveillée').abilities.spotting,recordCombatEvent);
 attack(c);assert.equal(c.target.spotMark.remaining,1);assert.equal(c.u.catalysisReadyRound,4);
});

test('Repérage et poison sourcé : instantanés immuables, compteurs et reprise exacte',()=>{
 const c=contact('cannon','éveillée');attack(c);const frame=captureCombatFrame(c.b),text=JSON.stringify(frame),ally=unit('militia','p',{atk:5});c.b.board[0][3]=ally;
 directHit(c.b,ally,c.target);assert.equal(JSON.stringify(frame),text);testStorage();assert(storeBattle(c.b));const restored=restoreBattle();assert.deepEqual(restored.board,c.b.board);
 const alchemy=contact('alchemist','éveillée');poison(alchemy);const old=captureCombatFrame(alchemy.b),snapshot=JSON.stringify(old);attack(alchemy);
 assert.equal(JSON.stringify(old),snapshot);assert(storeBattle(alchemy.b));assert.equal(restoreBattle().board[0][4].catalysisReadyRound,4);
 for(const value of [null,{sourceUid:-1,side:'p',amount:2,remaining:1,expiresRound:3},{sourceUid:1,side:'p',amount:2,remaining:3,expiresRound:3}]){
  const bad=structuredClone(restored);bad.board[0][5].spotMark=value;assert.equal(validStoredBattle(bad),false);
 }
 for(const key of ['spottingReadyRound','catalysisReadyRound'])for(const value of [0,-1,101,null,1.5]){const bad=structuredClone(restored);bad.board[0][4][key]=value;assert.equal(validStoredBattle(bad),false);}
});

test('Fiches : paramètres du registre, états de Repérage et aucune Sentinelle future activée',()=>{
 const c=contact('cannon','éveillée');attack(c);assert.match(boardInspectionData(c.b,c.target.uid).board.statuses.join(' '),/Repérage.*2 attaque.*\+2/);
 for(const [id,label] of Object.entries({cannon:'Barrage coordonné',alchemist:'Combustion totale'}))assert.ok(cardPresentation({id,rarity:'éveillée'}).details.join(' ').includes(label));
 for(const rank of ['légendaire',...ranks])assert.equal(resolveUnitDefinition('sentinel',rank),null);
});

test('Véritable export : fracture, marque et catalyse sont exécutées depuis les modules embarqués',()=>{
 const source=readFileSync(new URL('../JOUER.html',import.meta.url),'utf8').match(/<script>\n([\s\S]*)<\/script>/)[1],context={structuredClone};
 new Script(source.replace("__load('src/app.js');","globalThis.api=__load('src/engine.js');")).runInNewContext(context);
 const bomb=contact('bomb','éveillée');context.api.endPlayerTurn(bomb.b);assert.equal(bomb.target.armorPenalty.amount,2);
 const cannon=contact('cannon','divine');context.api.endPlayerTurn(cannon.b);assert.equal(cannon.target.spotMark.remaining,1);
 const alchemist=contact('alchemist','éveillée');poison(alchemist);context.api.endPlayerTurn(alchemist.b);assert.equal(alchemist.u.catalysisReadyRound,4);assert.equal(alchemist.target.poisonTurns,0);
});

test('Scénario partagé du navigateur : cinq fusions, trois tours de pose puis pouvoirs réels sur deux tours',()=>{
 for(const s of ascensionScenarios('forge')){
  const before=structuredClone(s.profile),fixture=forgeTacticalFixture(s.expected,s.trial.to),b=fixture.battle;
  assert.equal(validStoredBattle(b),true);assert.equal(b.round,3);assert.equal(b.heroes.p.cardsPlayed,2);assert.equal(b.board.flat().filter(u=>u?.side==='p').length,6);
  for(const id of ['engineer','mechanist','cannon','bomb','alchemist'])assert.ok(fixture.profile.evolvedCollection[id+':'+s.trial.to]>=1);
  endPlayerTurn(b);let units=Object.fromEntries(b.board.flat().filter(Boolean).map(u=>[u.uid,u]));
  const amount=s.trial.to==='divine'?1:2;
  assert.equal(units[fixture.sources.mechanist].calibration.ignoreArmor,amount);assert.equal(units[fixture.sources.engineer].temporaryArmor.amount,amount);
  assert.equal(units[fixture.targets.secondary].armorPenalty.amount,amount);
  // Canon 7 + Concorde 1, puis Loup 3 + Repérage 2, contre Armure 2 : 6 + 3 PV.
  assert.equal(units[fixture.targets.mark].hp,3);assert.equal(units[fixture.targets.mark].spotMark?.remaining,s.trial.to==='divine'?undefined:1);
  assert.equal(units[fixture.targets.poison].poisonOrigin.uid,fixture.sources.alchemist);
  finishEnemyTurn(b);endPlayerTurn(b);units=Object.fromEntries(b.board.flat().filter(Boolean).map(u=>[u.uid,u]));
  assert.equal(units[fixture.sources.alchemist].catalysisReadyRound,7);assert.equal(units[fixture.targets.poison].poisonTurns,0);assert.equal(units[fixture.targets.poison].hp,s.trial.to==='divine'?2:1);
  assert.equal(validStoredBattle(b),true);assert.deepEqual(s.profile,before);
 }
});
