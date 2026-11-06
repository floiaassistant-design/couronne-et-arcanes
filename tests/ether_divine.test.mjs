import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import {endPlayerTurn,finishEnemyTurn} from '../src/engine.js';
import {resolveUnitDefinition} from '../src/cards/definitions.js';
import {resolveGuardPrism,resolveSplashDisplacement,resolveSpectralRetreat} from '../src/engine/unit-triggers.js';
import {consumeNormalStrikeBonus,expireStrikeModifiers} from '../src/engine/unit-strike-modifiers.js';
import {consumeAttackPenalty,validUnitEffects} from '../src/engine/unit-effects.js';
import {resolveStillOmens,noteOmenMovement} from '../src/engine/unit-omens.js';
import {hit,resolveRetaliation} from '../src/engine/battle-defense.js';
import {applySilence,placeTrap} from '../src/engine/battle-control.js';
import {captureCombatFrame,recordCombatEvent} from '../src/engine/combat-events.js';
import {cardPresentation,boardInspectionData} from '../src/ui/card-presentation.js';
import {validStoredBattle,storeBattle,restoreBattle} from '../src/ui/storage.js';
import {forgeBattle,forgeUnit as unit,testStorage} from './fixtures/forge-combat.mjs';
import {etherDivineBattle} from './fixtures/ether-divine-battle.mjs';

const outcome={performed:true,damaged:true,suppressed:false};
const hooks={emit:recordCombatEvent,hit,enter:()=>{}};
function contact(id='spark',side='p',legacy=false){
 const c=forgeBattle(id,'divine');c.b.board=Array.from({length:3},()=>Array(legacy?7:12).fill(null));
 const last=c.b.board[0].length-2,col=side==='p'?(legacy?2:4):(legacy?4:7),dir=side==='p'?1:-1;
 c.u.side=side;c.b.board[0][col]=c.u;c.b.phase=side==='p'?'player':'enemy';
 const target=unit('militia',side==='p'?'e':'p',{hp:40,maxhp:40,armor:0,stun:99});c.b.board[0][col+dir]=target;
 return {...c,target,col,dir,last};
}
const attack=c=>(c.u.side==='p'?endPlayerTurn:finishEnemyTurn)(c.b);

test('Cinq versions : statistiques héritées, pouvoirs remplacés et Éveillées définies seulement',()=>{
 for(const [id,atk,hp] of [['spark',3,4],['seer',3,5],['sentinel',2,11],['dragon',7,12]]){
  const c=forgeBattle(id,'divine'),d=resolveUnitDefinition(id,'divine');
  assert.deepEqual([c.u.atk,c.u.maxhp],[atk,hp]);assert.equal(!!resolveUnitDefinition(id,'éveillée'),id==='sentinel');
  assert.equal(c.p.evolvedCollection[id+':divine'],1);assert.equal(d.status.obtaining,'fusion');
 }
 assert.equal(resolveUnitDefinition('sentinel','légendaire').abilities.guard.scope,'positioned');
 assert.equal(resolveUnitDefinition('sentinel','divine').abilities.guard.scope,'line');
 assert.deepEqual(resolveUnitDefinition('seer','divine').abilities.stillOmen,{amount:3,period:3,delay:1});
});

test('Éclat : vrai recul, +2 à la seule prochaine attaque normale, deux camps/deux géométries',()=>{
 for(const side of ['p','e'])for(const legacy of [false,true]){
  const c=contact('spark',side,legacy);attack(c);
  assert.deepEqual(c.u.nextStrikeBonus,{amount:2,expiresRound:3});assert.equal(c.target.hp,37);
  assert.equal(c.b.board[0][c.col-c.dir],c.u);c.b.round=2;c.b.phase=side==='p'?'player':'enemy';attack(c);
  assert.equal(c.target.hp,32);assert.equal(c.u.nextStrikeBonus,undefined);assert.equal(c.u.atk,3);
  c.b.round=3;c.b.phase=side==='p'?'player':'enemy';attack(c);assert.equal(c.target.hp,29);
 }
});

test('Éclat : repli bloqué, Silence, mort sur piège et victime éliminée ne créent aucun bonus',()=>{
 for(const reason of ['blocked','silence','dead','kill']){
  const c=contact();
  if(reason==='blocked')c.b.board[0][c.col-c.dir]=unit('bone','p',{stun:99});
  if(reason==='silence')applySilence(c.b,c.u);
  if(reason==='dead'){c.u.hp=1;placeTrap(c.b,'e',{lane:0,col:c.col-c.dir});}
  if(reason==='kill')c.target.hp=1;
  attack(c);assert.equal(c.u.nextStrikeBonus,undefined,reason);
 }
});

test('Éclat : protections normales, couronne éligible, aucune consommation par sort/Riposte',()=>{
 const c=contact();attack(c);c.target.barrier=4;c.target.armor=2;c.b.round=2;c.b.phase='player';attack(c);
 assert.equal(c.target.hp,37);assert.equal(c.target.barrier,1);assert.equal(c.u.nextStrikeBonus,undefined);
 const crown=contact();attack(crown);crown.b.board[0].fill(null);crown.b.board[0][crown.last]=crown.u;crown.b.round=2;crown.b.phase='player';attack(crown);
 assert.equal(crown.b.heroes.e.hp,95);assert.equal(crown.u.nextStrikeBonus,undefined);
 const other=contact();attack(other);hit(other.b,other.target,2,'p');assert(other.u.nextStrikeBonus);
 resolveRetaliation(other.b,other.target,other.u,0,other.col+1,other.col);assert(other.u.nextStrikeBonus);
});

test('Éclat : rafraîchissement sans cumul, expiration en fin N+2 et bonus déjà appliqué conservé sous Silence',()=>{
 const c=contact();resolveSpectralRetreat(c.b,c.u,c.target,outcome,hooks);c.u.spectralRetreatReadyRound=1;
 resolveSpectralRetreat(c.b,c.u,c.target,outcome,hooks);assert.equal(c.u.nextStrikeBonus.amount,2);
 c.b.round=2;expireStrikeModifiers(c.b);assert(c.u.nextStrikeBonus);
 c.b.round=3;expireStrikeModifiers(c.b);assert.equal(c.u.nextStrikeBonus,undefined);
 const quiet=contact();attack(quiet);applySilence(quiet.b,quiet.u);quiet.b.round=2;quiet.b.phase='player';attack(quiet);assert.equal(quiet.target.hp,32);
 assert.equal(consumeNormalStrikeBonus(c.b,c.u),0);
});

function guard(side='e',rank='légendaire',position='front',legacy=false){
 const c=forgeBattle('sentinel',rank);c.b.board=Array.from({length:3},()=>Array(legacy?7:12).fill(null));
 const last=c.b.board[0].length-2,near=side==='p'?1:last,dir=side==='p'?1:-1;
 const col=near+(position==='behind'?3:position==='far'?2:0)*dir,at=position==='far'?col+dir:near+dir;
 c.u.side=side;c.u.stun=99;c.b.board[position==='cross'?1:0][col]=c.u;
 const attacker=unit('archer',side==='p'?'e':'p',{atk:3,hp:40,maxhp:40});c.b.board[0][at]=attacker;c.b.phase=attacker.side==='p'?'player':'enemy';
 return {...c,attacker,side,col,at};
}
const defend=c=>(c.attacker.side==='p'?endPlayerTurn:finishEnemyTurn)(c.b);

test('Prisme : couronne réellement menacée, minimum 1 et attaque déjà préparée inchangée, deux camps/géométries',()=>{
 for(const side of ['p','e'])for(const legacy of [false,true]){
  const c=guard(side,'légendaire','front',legacy);defend(c);
  assert.deepEqual(c.attacker.prismPenalty,{amount:1,minimum:1,expiresRound:3});assert.equal(c.u.hp,10);
  assert.equal(c.u.guardPrismReadyRound,4);assert.equal(consumeAttackPenalty(c.attacker,3),2);assert.equal(c.attacker.prismPenalty,undefined);
  resolveGuardPrism(c.b,c.u,c.attacker,true,true,false,recordCombatEvent);assert.equal(c.attacker.prismPenalty,undefined);
  c.b.round=4;assert(resolveGuardPrism(c.b,c.u,c.attacker,true,true,false,recordCombatEvent));assert.equal(consumeAttackPenalty(c.attacker,1),1);
 }
});

test('Prisme : Garde normale positionnelle, Divine sur sa ligne, Éveillée sur toutes les lignes',()=>{
 for(const side of ['p','e'])for(const [rank,position,expected] of [['légendaire','behind',false],['divine','behind',true],['divine','cross',false],['divine','far',false],['éveillée','cross',true],['éveillée','far',false]]){
  const c=guard(side,rank,position);defend(c);assert.equal(!!c.attacker.prismPenalty,expected,rank+position);
  if(rank==='éveillée'&&position==='cross'){
   assert.equal(c.b.heroes[side].hp,100);assert.equal(c.u.hp,10);assert.equal(c.u.guardPrismReadyRound,4);
   assert(c.b.vfx.some(e=>e.type==='attack'&&e.fromLane===0&&e.lane===1));
  }
 }
});

test('Prisme : coups sans menace de couronne, Silence, zéro, mort, sorts et autre unité protégée exclus',()=>{
 for(const reason of ['silence','zero','death','unit']){
  const c=guard();if(reason==='silence')applySilence(c.b,c.u);if(reason==='zero')c.attacker.atk=0;if(reason==='death')c.attacker.atk=40;
  if(reason==='unit'){c.b.board[0][10]=unit('militia','e',{stun:99});c.b.board[0][9]=c.u;c.b.board[0][8]=c.attacker;c.b.board[0][c.at]=null;}
  defend(c);assert.equal(c.attacker.prismPenalty,undefined,reason);
 }
 const c=guard();hit(c.b,c.u,3,'p');assert.equal(c.u.guardPrismReadyRound,undefined);
});

test('Prisme : pas de cumul, malus plus fort conservé, expiration et consommation par vraie Riposte',()=>{
 const c=guard();defend(c);c.attacker.attackPenalty={amount:2,remaining:2,minimum:0};
 assert.equal(consumeAttackPenalty(c.attacker,4),2);assert.equal(c.attacker.attackPenalty.remaining,1);assert.equal(c.attacker.prismPenalty,undefined);
 const d=guard();defend(d);assert.equal(consumeAttackPenalty(structuredClone(d.attacker),3,4),3,'état expiré importé ignoré');d.b.round=3;expireStrikeModifiers(d.b);assert.equal(d.attacker.prismPenalty,undefined);
 const r=contact('sentinel');r.u.prismPenalty={amount:1,minimum:1,expiresRound:3};r.target.ranged=false;
 assert(resolveRetaliation(r.b,r.u,r.target,0,r.col,r.col+1));assert.equal(r.target.hp,39);assert.equal(r.u.prismPenalty,undefined);
});

test('Dragon : Impact contigu puis recul de la seule cible secondaire blessée, deux camps/géométries',()=>{
 for(const side of ['p','e'])for(const legacy of [false,true]){
  const c=contact('dragon',side,legacy),secondary=unit('militia',c.target.side,{hp:40,maxhp:40,armor:0,stun:99});
  // Garder une destination intérieure même sur l'ancienne géométrie.
  const origin=side==='p'?1:c.last;c.b.board[0].fill(null);c.b.board[0][origin]=c.u;c.b.board[0][origin+c.dir]=c.target;c.b.board[0][origin+2*c.dir]=secondary;
  attack(c);assert.equal(c.target.hp,33);assert.equal(secondary.hp,38);assert.equal(c.b.board[0][origin+3*c.dir],secondary);
  assert.equal(c.u.splashKnockbackReadyRound,4);assert.equal(c.b.vfx.filter(e=>e.type==='attack'&&!e.riposte).length,1);
 }
});

test('Dragon : absorption, mort, Silence, trou, case occupée ou bord refusent recul et quota',()=>{
 for(const reason of ['barrier','dead','silence','gap','occupied','edge']){
  const c=contact('dragon'),extra=unit('militia','e',{hp:40,maxhp:40,armor:0,stun:99});
  if(reason==='edge'){c.b.board[0].fill(null);c.b.board[0][8]=c.u;c.b.board[0][9]=c.target;c.b.board[0][10]=extra;}
  else c.b.board[0][c.col+(reason==='gap'?3:2)]=extra;
  if(reason==='barrier')extra.barrier=20;if(reason==='dead')extra.hp=1;if(reason==='silence')applySilence(c.b,c.u);
  if(reason==='occupied')c.b.board[0][c.col+3]=unit('militia','e',{stun:99});
  attack(c);assert.equal(c.u.splashKnockbackReadyRound,undefined,reason);
 }
});

test('Dragon : cadence, entrée de piège et mouvement qui annule un présage au tour dû',()=>{
 const c=contact('dragon'),extra=unit('militia','e',{hp:40,maxhp:40,armor:0,stun:99});c.b.board[0][6]=extra;c.b.round=2;
 extra.stillOmen={sourceUid:999,side:'p',amount:3,dueRound:2};placeTrap(c.b,'p',{lane:0,col:7});attack(c);
 assert.equal(extra.hp,35);assert.equal(extra.stillOmen,undefined);assert.equal(c.b.traps.length,0);assert.equal(c.u.splashKnockbackReadyRound,5);
 assert.equal(resolveSplashDisplacement(c.b,c.u,extra,true,false,hooks),false);
 c.b.round=5;assert(resolveSplashDisplacement(c.b,c.u,extra,true,false,hooks));
});

test('Destin scellé : une seule marque de 3, protections habituelles et annulation par déplacement',()=>{
 for(const moved of [false,true]){
  const c=contact('seer');attack(c);assert.equal(c.target.stillOmen.amount,3);c.b.round=2;c.target.barrier=1;
  if(moved)noteOmenMovement(c.b,c.target);resolveStillOmens(c.b,hit);
  assert.equal(c.target.hp,moved?37:35);assert.equal(c.target.stillOmen,undefined);
 }
});

test('Reprise exacte, nouveaux champs invalides refusés et instantanés indépendants',()=>{
 const f=etherDivineBattle(),b=f.battle,frame=captureCombatFrame(b),before=JSON.stringify(frame);
 endPlayerTurn(b);finishEnemyTurn(b);assert.equal(JSON.stringify(frame),before);assert(validStoredBattle(b));
 testStorage();assert(storeBattle(b));const {vfx,...saved}=b;assert.deepEqual(restoreBattle(),saved);
 for(const patch of [{nextStrikeBonus:{amount:0,expiresRound:3}},{prismPenalty:{amount:1,minimum:0,expiresRound:3}},{guardPrismReadyRound:101},{splashKnockbackReadyRound:NaN}]){
  const copy=structuredClone(b),u=copy.board.flat().find(Boolean);Object.assign(u,patch);assert.equal(validUnitEffects(u),false);assert.equal(validStoredBattle(copy),false);
 }
});

test('Combat partagé : les quatre pouvoirs réels, fiches et moteur réellement embarqué dans JOUER',()=>{
 const source=readFileSync(new URL('../JOUER.html',import.meta.url),'utf8').match(/<script>\n([\s\S]*)<\/script>/)[1],context={structuredClone};
 new Script(source.replace("__load('src/app.js');","globalThis.api=__load('src/engine.js');")).runInNewContext(context);
 for(const api of [{endPlayerTurn,finishEnemyTurn},context.api]){
  const f=etherDivineBattle(),b=f.battle,p=structuredClone(f.profile);api.endPlayerTurn(b);api.finishEnemyTurn(b);
  const units=Object.fromEntries(b.board.flat().filter(Boolean).map(u=>[u.uid,u]));
  assert.equal(units[f.sources.spark].nextStrikeBonus.amount,2);assert.equal(units[f.targets.seer].stillOmen.amount,3);
  assert.equal(units[f.targets.sentinel].prismPenalty.amount,1);assert.equal(b.board[2][7].uid,f.targets.secondary);
  assert.deepEqual(f.profile,p);assert(validStoredBattle(b));
  for(const [uid,word] of [[f.sources.spark,'Éclat persistant'],[f.targets.sentinel,'Prisme inhibiteur'],[f.sources.dragon,'Souffle disponible']])assert(boardInspectionData(b,uid).board.statuses.some(s=>s.includes(word)));
 }
 for(const [id,word] of [['spark','Éclat persistant'],['seer','Destin scellé'],['sentinel','Prisme inhibiteur'],['dragon','Souffle des Sept Vents']])assert(cardPresentation({id,rarity:'divine'}).details.join(' ').includes(word));
});
