import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import {endPlayerTurn,finishEnemyTurn} from '../src/engine.js';
import {resolveUnitDefinition} from '../src/cards/definitions.js';
import {hit,resolveRetaliation} from '../src/engine/battle-defense.js';
import {applySilence,placeTrap} from '../src/engine/battle-control.js';
import {captureCombatFrame} from '../src/engine/combat-events.js';
import {storeBattle,restoreBattle,validStoredBattle} from '../src/ui/storage.js';
import {cardPresentation} from '../src/ui/card-presentation.js';
import {forgeBattle,forgeUnit as unit,testStorage} from './fixtures/forge-combat.mjs';

function contact({side='p',barrier=0,hp=30,col=side==='p'?4:7,targetId='militia'}={}){
 const {p,b,u}=forgeBattle();for(const row of b.board)row.fill(null);u.side=side;
 const dir=side==='p'?1:-1,target=unit(targetId,side==='p'?'e':'p',{hp,maxhp:Math.max(hp,30),barrier,stun:99});
 b.board[0][col]=u;b.board[0][col+dir]=target;
 b.phase=side==='p'?'player':'enemy';return {p,b,u,target,col,dir};
}
function attack(c){(c.u.side==='p'?endPlayerTurn:finishEnemyTurn)(c.b);return c;}

test('Marteau obtenu par fusion : 4/8/1, recul 1 à cadence 3 et natifs inchangés',()=>{
 const {p,u}=forgeBattle(),epic=resolveUnitDefinition('smith','épique'),d=resolveUnitDefinition('smith','légendaire');
 assert.deepEqual(d.stats,epic.stats);assert.deepEqual(d.geometry,{steps:1,range:1});
 assert.deepEqual(d.abilities,{knockback:{cells:1,period:3}});assert.deepEqual(epic.abilities,{});
 assert.deepEqual([u.atk,u.maxhp],[4,8]);assert.equal(p.evolvedCollection['smith:légendaire'],1);
 for(const rank of ['divine','éveillée'])assert.equal(resolveUnitDefinition('golem',rank),null);
});

test('Coup de masse : blessure, recul vers la couronne dans les deux camps, une seule attaque et aucun suivi',()=>{
 for(const side of ['p','e']){
  const c=attack(contact({side})),{b,u,target,col,dir}=c;
  assert.equal(target.hp,26);assert.equal(b.board[0][col+2*dir],target);assert.equal(b.board[0][col+dir],null);
  assert.equal(b.board[0][col],u);assert.equal(u.knockbackReadyRound,4);
  assert.equal(b.vfx.filter(e=>e.type==='attack'&&!e.riposte).length,1);
  assert.equal(b.vfx.filter(e=>e.knockback).length,1);
 }
});

test('Pas de recul sans perte de PV, après élimination, sous Silence ou avec attaque nulle',()=>{
 for(const kind of ['barrier','death','silence','zero']){
  const c=contact(kind==='barrier'?{barrier:10}:kind==='death'?{hp:1}:{});
  if(kind==='silence')assert(applySilence(c.b,c.u,1));if(kind==='zero')c.u.atk=0;
  attack(c);assert.equal(c.u.knockbackReadyRound,undefined,kind);assert.equal(c.b.vfx.some(e=>e.knockback),false);
  if(kind!=='death')assert.equal(c.b.board[0][c.col+c.dir],c.target);
 }
});

test('Cases bloquées ou hors plateau : aucun recul, aucune collision ni consommation de cadence',()=>{
 for(const side of ['p','e'])for(const blocked of [true,false]){
  const c=contact({side,col:blocked?(side==='p'?4:7):(side==='p'?9:2)}),{b,u,target,col,dir}=c;
  let blocker;if(blocked){blocker=unit('militia',side,{stun:99});b.board[0][col+2*dir]=blocker;}
  attack(c);assert.equal(b.board[0][col+dir],target);assert.equal(u.knockbackReadyRound,undefined);
  if(blocker)assert.equal(b.board[0][col+2*dir],blocker);
 }
});

test('Cadence par invocation : tours 1/4, reprise exacte et aucune perte du profil',()=>{
 const c=contact(),profile=structuredClone(c.p);attack(c);testStorage();assert(storeBattle(c.b));
 const b=restoreBattle(),u=b.board[0][c.col];assert.equal(u.knockbackReadyRound,4);
 for(const round of [2,3,4]){
  for(const row of b.board)row.fill(null);b.round=round;b.phase='player';b.board[0][4]=u;
  const target=unit('militia','e',{hp:30,maxhp:30,stun:99});b.board[0][5]=target;endPlayerTurn(b);
  assert.equal(b.board[0][round===4?6:5],target);assert.equal(u.knockbackReadyRound,round===4?7:4);
 }
 assert.deepEqual(c.p,profile);
});

test('Les réactions de contact précèdent le recul : vraie Riposte du Golem et mort du Marteau',()=>{
 for(const survives of [true,false]){
  const c=contact({targetId:'golem'});c.target.atk=survives?2:20;attack(c);
  assert.equal(c.target.lastRiposteRound,1);assert.equal(c.target.hp,28);
  assert.equal(c.u.hp,survives?6:0);
  assert.equal(c.b.board[0][survives?6:5],c.target);assert.equal(c.u.knockbackReadyRound,survives?4:undefined);
 }
});

test('Recul : piège de la case d’arrivée déclenché une seule fois via le moteur commun',()=>{
 const c=contact();assert(placeTrap(c.b,'p',{lane:0,col:6}));attack(c);
 assert.equal(c.target.hp,23);assert.equal(c.b.traps.length,0);assert.equal(c.u.knockbackReadyRound,4);
 assert.equal(c.b.vfx.filter(e=>e.type==='trap-trigger').length,1);
});

test('Sort, poison et Riposte ne déclenchent pas le recul ; une couronne ne recule jamais',()=>{
 const direct=contact();hit(direct.b,direct.target,4,'p');assert.equal(direct.u.knockbackReadyRound,undefined);
 const poison=contact();poison.u.stun=99;poison.target.poison=1;poison.target.poisonTurns=1;poison.b.phase='enemy';finishEnemyTurn(poison.b);
 assert.equal(poison.u.knockbackReadyRound,undefined);
 const riposte=contact();assert.equal(resolveRetaliation(riposte.b,riposte.u,riposte.target,0,4,5),false);assert.equal(riposte.u.knockbackReadyRound,undefined);
 const crown=contact();for(const row of crown.b.board)row.fill(null);crown.b.board[0][10]=crown.u;endPlayerTurn(crown.b);
 assert.equal(crown.b.heroes.e.hp,96);assert.equal(crown.u.knockbackReadyRound,undefined);
});

test('Pas de déplacement après une frappe préparée devenue hors contact, ni entre lignes',()=>{
 const c=contact();c.u.ranged=true;attack(c);assert.equal(c.b.board[0][5],c.target);assert.equal(c.u.knockbackReadyRound,undefined);
 const other=contact();for(const row of other.b.board)row.fill(null);other.b.board[0][10]=other.u;
 const guard=unit('shield','e',{rarity:'éveillée',hp:30,maxhp:30,stun:99});other.b.board[1][9]=guard;endPlayerTurn(other.b);
 assert.equal(guard.hp,28);assert.equal(other.b.board[1][9],guard);assert.equal(other.u.knockbackReadyRound,undefined);
});

test('Géométrie historique : recul borné aux cinq cases réelles',()=>{
 for(const side of ['p','e'])for(const edge of [false,true]){
  const c=contact({side,col:side==='p'?(edge?4:2):(edge?2:4)});
  c.b.board=c.b.board.map(row=>row.slice(0,7));attack(c);
  assert.equal(c.b.board[0][c.col+(edge?1:2)*c.dir],c.target);
  assert.equal(c.u.knockbackReadyRound,edge?undefined:4);
 }
});

test('Instantanés : positions initiales conservées, événement de recul et sauvegarde à la nouvelle position',()=>{
 const c=contact(),before=captureCombatFrame(c.b),snapshot=JSON.stringify(before);attack(c);
 assert.equal(JSON.stringify(before),snapshot);const moved=c.b.vfx.find(e=>e.knockback);
 assert.equal(moved.frame.board[0][5],null);assert.equal(moved.frame.board[0][6].uid,c.target.uid);
 testStorage();assert(storeBattle(c.b));const {vfx,...persistent}=c.b;assert.deepEqual(restoreBattle(),persistent);
 for(const value of [null,0,-1,1.5,101]){const bad=structuredClone(c.b);bad.board[0][4].knockbackReadyRound=value;assert.equal(validStoredBattle(bad),false,String(value));}
});

test('Fiche : recul, conditions, cadence et fusion lisibles sans rang futur activé',()=>{
 const view=cardPresentation({id:'smith',rarity:'légendaire'});
 assert.match(view.card.description,/Coup de masse : recul 1/);
 for(const text of ['retirant des PV','survivante','case est libre','3 tours','aucune attaque supplémentaire'])assert.ok(view.details.join(' ').includes(text),text);
 assert.match(view.availability,/fusion/i);
});

test('Véritable export autonome : une attaque du Marteau repousse la cible sans seconde frappe',()=>{
 const source=readFileSync(new URL('../JOUER.html',import.meta.url),'utf8').match(/<script>\n([\s\S]*)<\/script>/)[1],context={structuredClone};
 new Script(source.replace("__load('src/app.js');","globalThis.api=__load('src/engine.js');")).runInNewContext(context);
 const c=contact();context.api.endPlayerTurn(c.b);assert.equal(c.b.board[0][6].uid,c.target.uid);assert.equal(c.target.hp,26);
 assert.equal(c.u.knockbackReadyRound,4);
});
