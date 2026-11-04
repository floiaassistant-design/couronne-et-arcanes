import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import {endPlayerTurn,finishEnemyTurn} from '../src/engine.js';
import {resolveUnitDefinition} from '../src/cards/definitions.js';
import {evolutionFusionFor} from '../src/evolution-fusion.js';
import {evolutionPackFor} from '../src/card-packs.js';
import {isInterposedCrownGuardian,findCrownGuardian} from '../src/engine/guard-candidates.js';
import {hit,resolveRetaliation} from '../src/engine/battle-defense.js';
import {applySilence} from '../src/engine/battle-control.js';
import {captureCombatFrame} from '../src/engine/combat-events.js';
import {storeBattle,restoreBattle,validStoredBattle} from '../src/ui/storage.js';
import {cardPresentation,boardInspectionData} from '../src/ui/card-presentation.js';
import {forgeBattle,forgeUnit as unit,testStorage} from './fixtures/forge-combat.mjs';
import {golemFixture} from './fixtures/golem-battle.mjs';
import {ascensionScenarios} from './fixtures/ascension-scenarios.mjs';

const ranks=['légendaire','divine','éveillée'];
function defence(rank='légendaire',{side='e',legacy=false,position='front',shield=0,raw=3,barrier=0}={}){
 const c=forgeBattle('golem',rank),{b,u}=c;
 b.board=Array.from({length:legacy?3:2},()=>Array(legacy?7:12).fill(null));
 const end=b.board[0].length-2,near=side==='p'?1:end,dir=side==='p'?1:-1;
 const col=position==='far'?near+3*dir:position==='behind'?near+3*dir:near;
 const attackerCol=position==='far'?col+dir:near+dir,attackSide=side==='p'?'e':'p';
 u.side=side;u.stun=99;if(barrier)u.barrier=barrier;
 const attacker=unit('archer',attackSide,{atk:raw,hp:20,maxhp:20});
 b.board[position==='cross'?1:0][col]=u;b.board[0][attackerCol]=attacker;
 b.phase=attackSide==='p'?'player':'enemy';b.heroes[side].shield=shield;b.vfx=[];
 return {...c,attacker,col,attackerCol,side,dir,end};
}
const defend=c=>(c.attacker.side==='p'?endPlayerTurn:finishEnemyTurn)(c.b);

test('Golem : trois vraies fusions, 2/14/délai2, Armure/Riposte et portées de Garde remplaçantes',()=>{
 for(const rank of ranks){
  const {p,u}=forgeBattle('golem',rank),d=resolveUnitDefinition('golem',rank),r=evolutionFusionFor('golem',rank);
  assert.equal(p.evolvedCollection['golem:'+rank],1);assert.deepEqual([u.atk,u.maxhp,d.stats.delay],[2,14,2]);
  assert.equal(d.abilities.armor.amount,2);assert.equal(d.abilities.riposte.damageMode,'effective-attack');
  assert.equal(d.abilities.guard.scope,{'légendaire':'positioned',divine:'line','éveillée':'all-lines'}[rank]);
  assert.deepEqual(d.abilities.guardWard,{amount:1,cap:20,frequency:'round',interposedCrownThreat:true});
  assert.equal(r.copies,3);assert.equal(r.ascension,rank==='légendaire'?undefined:'forge-ascension-'+(rank==='divine'?'divine':'eveillee'));
  assert.equal(evolutionPackFor('golem',rank),null);assert.equal(u.lastGuardWardRound,undefined);
 }
 assert.equal(resolveUnitDefinition('golem','rare').abilities.guardWard,undefined);
 assert.equal(resolveUnitDefinition('golem','épique').abilities.guardWard,undefined);
});

test('Proposition interposé : menace réelle de couronne, deux camps et deux géométries, sans déplacer ni changer la victime',()=>{
 for(const side of ['p','e'])for(const legacy of [false,true])for(const rank of ranks){
  const c=defence(rank,{side,legacy});assert(isInterposedCrownGuardian(c.b,0,c.attackerCol,c.attacker,c.u));
  const frame=captureCombatFrame(c.b),before=JSON.stringify(frame);defend(c);
  assert.equal(c.u.hp,13);assert.equal(c.b.heroes[side].shield,1);assert.equal(c.b.heroes[side].hp,100);
  assert.equal(c.u.lastGuardWardRound,1);assert.equal(c.b.board[0][c.col],c.u);assert.equal(JSON.stringify(frame),before);
  assert.equal(c.b.vfx.filter(e=>e.guardWard===1).length,1);assert.equal(c.b.vfx.filter(e=>e.type==='hero-damage').length,0);
 }
});

test('Pas de Cœur sur un coup reçu loin de sa couronne, ni sur une frappe qui viserait une autre unité',()=>{
 for(const side of ['p','e']){
  const far=defence('légendaire',{side,position:'far'});defend(far);assert.equal(far.u.hp,13);
  assert.equal(far.b.heroes[side].shield,0);assert.equal(far.u.lastGuardWardRound,undefined);
  const c=defence('légendaire',{side}),near=side==='p'?1:c.end;
  c.b.board[0][c.col]=null;c.b.board[0][c.attackerCol]=null;
  c.col=near+c.dir;c.attackerCol=near+2*c.dir;
  c.attacker.rarity='légendaire';c.b.board[0][c.col]=c.u;c.b.board[0][c.attackerCol]=c.attacker;
  c.b.board[0][near]=unit('militia',side,{stun:99});
  assert.equal(isInterposedCrownGuardian(c.b,0,c.attackerCol,c.attacker,c.u),false);defend(c);
  assert.equal(c.b.heroes[side].shield,0);assert.equal(c.u.lastGuardWardRound,undefined);
  assert.equal(c.b.board[0][near].hp,5,'Garde ne détourne pas une attaque pour protéger cette unité');
 }
});

test('Garde normale dépassée, Divine sur sa ligne et Éveillée interligne : véritables interceptions raccordées',()=>{
 for(const side of ['p','e'])for(const [rank,position,expected] of [['légendaire','behind',false],['divine','behind',true],['divine','cross',false],['éveillée','cross',true]]){
  const c=defence(rank,{side,position});defend(c);
  assert.equal(c.u.hp,expected?13:14);assert.equal(c.b.heroes[side].shield,expected?1:0);
  assert.equal(c.b.heroes[side].hp,expected?100:97);assert.equal(c.b.vfx.filter(e=>e.riposte).length,0);
  if(expected)assert(c.b.log.some(s=>s.includes('intercepte')));
 }
});

test('Deux interceptions dans la même action de camp : deux protections, un seul point de bouclier ; tour suivant réouvert',()=>{
 const c=defence('divine',{position:'behind'});c.b.board[0][c.attackerCol-1]=unit('archer','p',{rarity:'légendaire',atk:3,hp:20,maxhp:20});
 defend(c);assert.equal(c.b.heroes.e.shield,1);assert.equal(c.u.hp,10);
 assert.equal(c.b.vfx.filter(e=>e.type==='attack'&&!e.riposte).length,2);
 assert.equal(c.b.vfx.filter(e=>e.guardWard).length,1);
 c.b.round=2;c.b.phase='player';defend(c);assert.equal(c.b.heroes.e.shield,2);assert.equal(c.u.lastGuardWardRound,2);
});

test('Plafond 20 sans réduction de surplus, absorption complète autorisée, quota indépendant des pertes de PV',()=>{
 for(const shield of [0,19,20,25]){
  const c=defence('éveillée',{position:'cross',shield,barrier:5});defend(c);
  assert.equal(c.u.hp,14);assert.equal(c.u.barrier,4);assert.equal(c.b.heroes.e.shield,shield<20?shield+1:shield);
  assert.equal(c.u.lastGuardWardRound,1);
 }
});

test('Silence, attaque nulle et mort : aucun bouclier ; Garde passive et protections communes conservées',()=>{
 for(const kind of ['silence','zero','dead']){
  const c=defence('éveillée',{position:'cross',raw:kind==='zero'?0:kind==='dead'?30:3});
  if(kind==='silence')assert(applySilence(c.b,c.u,1));defend(c);
  assert.equal(c.b.heroes.e.shield,0,kind);assert.equal(c.u.lastGuardWardRound,undefined,kind);
  assert.equal(c.b.heroes.e.hp,100);assert.equal(c.u.hp,kind==='dead'?0:kind==='zero'?14:13);
 }
});

test('Sorts, poison/secondaires et Riposte directe ne deviennent pas des interceptions de couronne',()=>{
 const c=defence('légendaire');
 hit(c.b,c.u,3,'p');hit(c.b,c.u,3,'p',false,true);
 const defender=unit('golem','p',{hp:20,maxhp:20,atk:3});c.u.ranged=false;
 assert(resolveRetaliation(c.b,defender,c.u,0,c.col-1,c.col));
 assert.equal(c.b.heroes.e.shield,0);assert.equal(c.u.lastGuardWardRound,undefined);
});

test('Plusieurs gardiens : priorité centrale respectée et un seul bénéficiaire par attaque',()=>{
 const c=defence('éveillée',{position:'cross'}),preferred=unit('golem','e',{rarity:'divine',stun:99});
 c.b.board[0][3]=preferred;
 assert.equal(findCrownGuardian(c.b,0,'e',c.attackerCol).u,preferred);defend(c);
 assert.equal(c.u.hp,14);assert.equal(c.u.lastGuardWardRound,undefined);assert.equal(preferred.hp,13);
 assert.equal(preferred.lastGuardWardRound,1);assert.equal(c.b.heroes.e.shield,1);
});

test('Deux Golems sur leurs lignes : quotas individuels, aucun quota global de couronne',()=>{
 const c=defence('divine',{position:'behind'}),copy=unit('golem','e',{rarity:'divine',stun:99});
 c.b.board[1][c.col]=copy;c.b.board[1][c.end]=unit('bone','p',{atk:3});
 defend(c);assert.equal(c.b.heroes.e.shield,2);assert.equal(c.u.lastGuardWardRound,1);assert.equal(copy.lastGuardWardRound,1);
});

test('Survie évaluée après Riposte et Fracas : aucun Cœur si la réaction de contact tue le Golem',()=>{
 const c=defence('divine');c.b.board[0][c.col]=null;c.b.board[0][c.attackerCol]=null;
 c.col=9;c.attackerCol=10;c.u.hp=2;c.b.board[0][9]=c.u;
 c.attacker=unit('bone','p',{rarity:'divine',hp:1,maxhp:6,atk:3});c.b.board[0][10]=c.attacker;
 defend(c);assert.equal(c.attacker.hp,0);assert.equal(c.u.hp,0);assert.equal(c.b.heroes.e.shield,0);assert.equal(c.u.lastGuardWardRound,undefined);
});

test('Un quota par invocation, reprise exacte, ancien profil intact et marqueurs invalides refusés',()=>{
 const c=defence('éveillée',{position:'cross'}),profile=structuredClone(c.p);defend(c);
 testStorage();assert(storeBattle(c.b));const resumed=restoreBattle();assert(resumed);
 const {vfx,...saved}=c.b;assert.deepEqual(resumed,saved);assert.deepEqual(c.p,profile);
 const u=resumed.board[1][c.col];assert.equal(u.lastGuardWardRound,1);
 for(const value of [0,-1,101,1.5,null,'1']){
  const bad=structuredClone(resumed);bad.board[1][c.col].lastGuardWardRound=value;assert.equal(validStoredBattle(bad),false);
 }
 resumed.round=2;resumed.phase='player';endPlayerTurn(resumed);assert.equal(resumed.heroes.e.shield,2);assert.equal(u.lastGuardWardRound,2);
});

test('Fiches : règle d’interception, +1 plafond20, quota visible et absence de nouvelle statistique',()=>{
 for(const rank of ranks){const view=cardPresentation({id:'golem',rarity:rank});assert.match(view.card.description,/Cœur runique \+1/);assert.match(view.details.join(' '),/plafond 20.*une fois par tour/);assert.equal(view.card.attack,2);assert.equal(view.card.hp,14);}
 const c=defence('divine',{position:'behind'});defend(c);assert(boardInspectionData(c.b,c.u.uid).board.statuses.includes('Cœur runique utilisé ce tour'));
});

test('Export autonome : le vrai moteur embarqué déclenche le Cœur après interception interligne',()=>{
 const source=readFileSync(new URL('../JOUER.html',import.meta.url),'utf8').match(/<script>\n([\s\S]*)<\/script>/)[1],context={structuredClone};
 new Script(source.replace("__load('src/app.js');","globalThis.api=__load('src/engine.js');")).runInNewContext(context);
 const c=defence('éveillée',{position:'cross'});context.api.endPlayerTurn(c.b);assert.equal(c.b.heroes.e.shield,1);assert.equal(c.u.lastGuardWardRound,1);
});

test('Scénario navigateur partagé : fusion et vraie interception Divine/Éveillée, sans résultat attribué à la fixture',()=>{
 for(const s of ascensionScenarios('forge')){
  const before=structuredClone(s.expected),f=golemFixture(s.expected,s.trial.to),b=f.battle;
  assert.deepEqual(s.expected,before);assert.equal(b.heroes.p.shield,0);
  assert.equal(b.board.flat().find(u=>u?.uid===f.golemUid).lastGuardWardRound,undefined);
  endPlayerTurn(b);finishEnemyTurn(b);
  const u=b.board.flat().find(u=>u?.uid===f.golemUid);assert.equal(u.hp,f.maxhp-1);assert.equal(u.lastGuardWardRound,1);assert.equal(b.heroes.p.shield,1);assert.equal(b.heroes.p.hp,b.heroes.p.maxhp);
  assert(b.log.some(s=>s.includes('intercepte')));assert(validStoredBattle(b));
 }
});
