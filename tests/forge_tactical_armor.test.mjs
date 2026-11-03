import test from 'node:test';
import assert from 'node:assert/strict';
import {endPlayerTurn,finishEnemyTurn} from '../src/engine.js';
import {resolveUnitDefinition} from '../src/cards/definitions.js';
import {hit,resolveRetaliation} from '../src/engine/battle-defense.js';
import {applySilence,expireControl} from '../src/engine/battle-control.js';
import {resolveUnitSupport} from '../src/engine/unit-support.js';
import {captureCombatFrame,recordCombatEvent} from '../src/engine/combat-events.js';
import {grantSupportStrikeState,activeStrikeState} from '../src/engine/unit-strike-modifiers.js';
import {boardInspectionData,cardPresentation} from '../src/ui/card-presentation.js';
import {storeBattle,restoreBattle,validStoredBattle} from '../src/ui/storage.js';
import {forgeBattle,forgeUnit as unit,testStorage,forgeContact as tacticalContact,directForgeHit as directHit} from './fixtures/forge-combat.mjs';

const ranks=['divine','éveillée'];
const attack=c=>(c.u.side==='p'?endPlayerTurn:finishEnemyTurn)(c.b);
function support(id,rank,side='p',atk=2){
 const c=tacticalContact(id,rank,side);c.b.board[0][c.col+c.dir]=null;c.u.stun=99;
 const ally=unit('militia',side,{atk,hp:30,maxhp:30,stun:99});c.b.board[0][c.col+c.dir]=ally;c.b.round=3;
 resolveUnitSupport(c.b,side,recordCombatEvent);return {...c,ally};
}

test('Six évolutions d’armure : statistiques indépendantes, vraies fusions et héritage natif conservé',()=>{
 for(const [id,stats] of Object.entries({bomb:[5,5,2],engineer:[3,9,3],mechanist:[3,10,2]}))for(const rank of ranks){
  const {p,u}=forgeBattle(id,rank),d=resolveUnitDefinition(id,rank);
  assert.deepEqual([d.stats.attack,d.stats.hp,d.stats.delay],stats);assert.deepEqual([u.atk,u.maxhp],stats.slice(0,2));assert.equal(p.evolvedCollection[id+':'+rank],1);
 }
 assert.equal(resolveUnitDefinition('bomb','légendaire').abilities.fracture,undefined);
 assert.equal(resolveUnitDefinition('engineer','légendaire').abilities.calibration,undefined);
 assert.equal(resolveUnitDefinition('mechanist','légendaire').abilities.inspireArmor,undefined);
});

test('Sapeur : fracture sur les vraies cibles blessées, cibles contiguës et deux camps',()=>{
 for(const side of ['p','e'])for(const rank of ranks){
  const c=tacticalContact('bomb',rank,side),secondary=unit('militia',c.target.side,{hp:40,maxhp:40,armor:3,stun:99});c.b.board[0][c.col+2*c.dir]=secondary;
  attack(c);assert.equal(c.target.hp,38);assert.equal(secondary.hp,39);
  assert.deepEqual(secondary.armorPenalty,{amount:rank==='divine'?1:2,expiresRound:2});
  assert.deepEqual(c.target.armorPenalty,rank==='divine'?undefined:{amount:2,expiresRound:2});
  assert.equal(secondary.armor,3);assert.equal(c.target.armor,3);
 }
});

test('Sapeur : barrière absorbante, case vide/alliée et Silence excluent les malus correspondants',()=>{
 for(const kind of ['barrier','empty','ally','silence']){
  const c=tacticalContact('bomb','éveillée'),secondary=unit('militia','e',{hp:40,maxhp:40,armor:3,stun:99});
  c.b.board[0][c.col+2]=secondary;
  if(kind==='barrier'){c.target.barrier=10;secondary.barrier=10;}
  if(kind==='empty'){c.b.board[0][c.col+2]=null;c.b.board[0][c.col+3]=secondary;}
  if(kind==='ally')secondary.side='p';if(kind==='silence')assert(applySilence(c.b,c.u,1));
  attack(c);assert.equal(secondary.armorPenalty,undefined,kind);
  if(['barrier','silence'].includes(kind))assert.equal(c.target.armorPenalty,undefined,kind);
 }
});

test('Fracture : consommation par une seule attaque directe, armure permanente intacte',()=>{
 for(const amount of [1,2]){
  const c=tacticalContact('bomb','éveillée');c.target.armorPenalty={amount,expiresRound:2};
  directHit(c.b,c.u,c.target,4);assert.equal(c.target.hp,40-(1+amount));assert.equal(c.target.armorPenalty,undefined);
  directHit(c.b,c.u,c.target,4);assert.equal(c.target.hp,38-amount);assert.equal(c.target.armor,3);
 }
 const zero=tacticalContact('bomb','éveillée');zero.target.armor=0;zero.target.armorPenalty={amount:2,expiresRound:2};directHit(zero.b,zero.u,zero.target,4);assert.equal(zero.target.hp,36);
});

test('Sorts/secondaires ne consomment pas Fracture ; Perforation la consomme sans réduction de dégâts',()=>{
 const c=tacticalContact('bomb','éveillée');c.target.armorPenalty={amount:2,expiresRound:2};
 hit(c.b,c.target,4,'p');hit(c.b,c.target,4,'p',false,true);assert.equal(c.target.hp,38);assert.ok(c.target.armorPenalty);
 directHit(c.b,c.u,c.target,4,true);assert.equal(c.target.hp,34);assert.equal(c.target.armorPenalty,undefined);
});

test('Fracture : expire à la fin du tour suivant, aucune nouvelle attaque ni mutation d’instantané',()=>{
 const c=tacticalContact('bomb','éveillée'),before=captureCombatFrame(c.b),snapshot=JSON.stringify(before);attack(c);
 const after=captureCombatFrame(c.b),state=JSON.stringify(after);expireControl(c.b);assert.ok(c.target.armorPenalty);
 assert.equal(activeStrikeState(c.target,'armorPenalty',2).amount,2);c.b.round=2;expireControl(c.b);assert.equal(c.target.armorPenalty,undefined);
 assert.equal(JSON.stringify(before),snapshot);assert.equal(JSON.stringify(after),state);assert.equal(c.b.vfx.filter(e=>e.type==='attack'&&!e.riposte).length,1);
});

test('Inspiration : une seule cible, gain réel d’ATQ, périodicité et aucun double déclenchement',()=>{
 for(const id of ['engineer','mechanist'])for(const rank of ranks)for(const side of ['p','e']){
  const c=support(id,rank,side);assert.equal(c.ally.atk,3);assert.equal(c.u.lastInspireRound,3);
  const state=id==='engineer'?c.ally.calibration:c.ally.temporaryArmor;assert.equal(state.expiresRound,4);
  assert.equal(id==='engineer'?state.ignoreArmor:state.amount,rank==='divine'?1:2);
  resolveUnitSupport(c.b,side,recordCombatEvent);assert.equal(c.ally.atk,3);assert.equal(c.u.atk,3);
 }
 for(const id of ['engineer','mechanist']){const capped=support(id,'éveillée','p',12);assert.equal(capped.ally.calibration,undefined);assert.equal(capped.ally.temporaryArmor,undefined);}
});

test('Calibrage : ignore un/deux points lors de la prochaine attaque d’unité, barrière si PV perdus',()=>{
 for(const rank of ranks)for(const side of ['p','e']){
  const c=support('engineer',rank,side),victim=unit('militia',side==='p'?'e':'p',{hp:40,maxhp:40,armor:3});c.b.board[0][c.col+2*c.dir]=victim;
  directHit(c.b,c.ally,victim,5);assert.equal(victim.hp,rank==='divine'?37:36);assert.equal(c.ally.calibration,undefined);
  assert.equal(c.ally.barrier||0,rank==='divine'?0:1);assert.equal(victim.armor,3);
  directHit(c.b,c.ally,victim,5);assert.equal(victim.hp,rank==='divine'?35:34);assert.equal(c.ally.barrier||0,rank==='divine'?0:1);
 }
});

test('Calibrage : attaque absorbée, couronne, sort, Perforation et Riposte respectent la consommation',()=>{
 const absorbed=support('engineer','éveillée'),victim=unit('militia','e',{hp:40,maxhp:40,armor:3,barrier:10});absorbed.b.board[0][6]=victim;
 directHit(absorbed.b,absorbed.ally,victim,5);assert.equal(victim.hp,40);assert.equal(absorbed.ally.barrier,undefined);assert.equal(absorbed.ally.calibration,undefined);
 const spell=support('engineer','éveillée');spell.b.board[0][6]=unit('militia');hit(spell.b,spell.b.board[0][6],5,'p');assert.ok(spell.ally.calibration);
 const pierced=support('engineer','éveillée'),foe=unit('militia','e',{hp:40,maxhp:40,armor:5});pierced.b.board[0][6]=foe;directHit(pierced.b,pierced.ally,foe,5,true);assert.equal(foe.hp,35);assert.equal(pierced.ally.barrier,1);assert.equal(pierced.ally.calibration,undefined);
 const riposte=tacticalContact('engineer','éveillée'),guard=unit('golem','p',{atk:5}),attacker=unit('militia','e',{hp:40,maxhp:40,armor:3});
 riposte.b.board[0][4]=guard;riposte.b.board[0][5]=attacker;grantSupportStrikeState(guard,resolveUnitDefinition('engineer','éveillée').abilities,1);
 assert(resolveRetaliation(riposte.b,guard,attacker,0,4,5));assert.equal(attacker.hp,36);assert.equal(guard.barrier,1);assert.equal(guard.calibration,undefined);
});

test('Calibrage déjà appliqué persiste sous Silence de l’allié ; Silence de la source empêche l’application',()=>{
 const c=support('engineer','éveillée'),victim=unit('militia','e',{hp:40,maxhp:40,armor:3});c.b.board[0][6]=victim;
 c.ally.silenceUntil=3;directHit(c.b,c.ally,victim,5);assert.equal(victim.hp,36);assert.equal(c.ally.barrier,1);
 const blocked=tacticalContact('engineer','éveillée');blocked.u.stun=99;blocked.b.round=3;const ally=unit('militia','p');blocked.b.board[0][5]=ally;applySilence(blocked.b,blocked.u,1);
 resolveUnitSupport(blocked.b,'p',recordCombatEvent);assert.equal(ally.atk,2);assert.equal(ally.calibration,undefined);
});

test('Calibrage : bonus plus fort non rétrogradé, expiration et barrière plafonnée par origine',()=>{
 const c=support('engineer','éveillée');grantSupportStrikeState(c.ally,resolveUnitDefinition('engineer','divine').abilities,3);assert.equal(c.ally.calibration.ignoreArmor,2);
 const victim=unit('militia','e',{hp:40,maxhp:40});c.b.board[0][6]=victim;directHit(c.b,c.ally,victim,3);assert.equal(c.ally.barrier,1);
 grantSupportStrikeState(c.ally,resolveUnitDefinition('engineer','éveillée').abilities,3);directHit(c.b,c.ally,victim,3);assert.equal(c.ally.barrier,1);
 grantSupportStrikeState(c.ally,resolveUnitDefinition('engineer','éveillée').abilities,3);c.b.round=4;expireControl(c.b);assert.equal(c.ally.calibration,undefined);
});

test('Calibrage suprême ne réanime pas un attaquant détruit par le Fracas immédiat de sa cible',()=>{
 const c=support('engineer','éveillée'),victim=unit('bone','e',{rarity:'divine',hp:1});c.b.board[0][6]=victim;c.ally.hp=1;
 directHit(c.b,c.ally,victim,3);assert.equal(c.ally.hp,0);assert.equal(victim.hp,0);assert.equal(c.ally.barrier,undefined);assert.equal(c.ally.calibration,undefined);
});

test('Blindage : Armure +1/+2 consommée par un coup direct, sans cumul et sans effet sur les sorts',()=>{
 for(const rank of ranks){
  const c=support('mechanist',rank),foe=unit('militia','e',{atk:5});c.ally.armor=2;c.b.board[0][6]=foe;
  hit(c.b,c.ally,5,'e');assert.equal(c.ally.hp,27);assert.ok(c.ally.temporaryArmor);
  directHit(c.b,foe,c.ally);assert.equal(c.ally.hp,rank==='divine'?25:26);assert.equal(c.ally.temporaryArmor,undefined);assert.equal(c.ally.armor,2);
  directHit(c.b,foe,c.ally);assert.equal(c.ally.hp,rank==='divine'?22:23);
 }
});

test('Blindage avec Fracture et Calibrage : un seul calcul protégé, Armure effective jamais négative',()=>{
 const c=support('mechanist','éveillée'),foe=unit('militia','e',{atk:5});c.ally.armor=2;c.ally.armorPenalty={amount:2,expiresRound:4};c.b.board[0][6]=foe;
 grantSupportStrikeState(foe,resolveUnitDefinition('engineer','éveillée').abilities,3);directHit(c.b,foe,c.ally);
 assert.equal(c.ally.hp,25);assert.equal(c.ally.temporaryArmor,undefined);assert.equal(c.ally.armorPenalty,undefined);assert.equal(foe.calibration,undefined);assert.equal(foe.barrier,1);
 const pierce=support('mechanist','éveillée'),archer=unit('militia','e',{atk:5});pierce.b.board[0][6]=archer;directHit(pierce.b,archer,pierce.ally,5,true);assert.equal(pierce.ally.hp,25);assert.equal(pierce.ally.temporaryArmor,undefined);
});

test('Blindage : pas de cumul entre copies, le plus fort persiste et expire en fin du tour suivant',()=>{
 const c=support('mechanist','éveillée');grantSupportStrikeState(c.ally,resolveUnitDefinition('mechanist','divine').abilities,3);assert.equal(c.ally.temporaryArmor.amount,2);
 grantSupportStrikeState(c.ally,resolveUnitDefinition('mechanist','éveillée').abilities,3);assert.equal(c.ally.temporaryArmor.amount,2);
 c.b.round=4;assert.equal(activeStrikeState(c.ally,'temporaryArmor',4).amount,2);expireControl(c.b);assert.equal(c.ally.temporaryArmor,undefined);
});

test('Reprise et instantanés : états remplacés sans modifier les anciens, valeurs importées invalides refusées',()=>{
 const c=support('engineer','éveillée');grantSupportStrikeState(c.ally,resolveUnitDefinition('mechanist','éveillée').abilities,3);c.ally.armorPenalty={amount:1,expiresRound:4};
 const frame=captureCombatFrame(c.b),before=JSON.stringify(frame);testStorage();assert(storeBattle(c.b));const copy=restoreBattle();assert.deepEqual(copy.board,c.b.board);
 const foe=unit('militia','e',{hp:40,maxhp:40});c.b.board[0][6]=foe;directHit(c.b,c.ally,foe,3);assert.equal(JSON.stringify(frame),before);
 for(const [key,values] of Object.entries({calibration:[null,{ignoreArmor:0,expiresRound:4},{ignoreArmor:2,expiresRound:0}],temporaryArmor:[null,{amount:-1,expiresRound:4}],armorPenalty:[null,{amount:1,expiresRound:101}]}))for(const value of values){
  const bad=structuredClone(copy);bad.board[0][5][key]=value;assert.equal(validStoredBattle(bad),false,key+':'+JSON.stringify(value));
 }
});

test('Fiches et plateau : effets d’armure transitoires visibles, expiration lue sans muter le combat',()=>{
 const c=support('engineer','éveillée');grantSupportStrikeState(c.ally,resolveUnitDefinition('mechanist','éveillée').abilities,3);c.ally.armorPenalty={amount:2,expiresRound:4};
 const before=structuredClone(c.b),text=boardInspectionData(c.b,c.ally.uid).board.statuses.join(' ');
 for(const word of ['Calibrage','Blindage','Armure −2'])assert.ok(text.includes(word),word);assert.deepEqual(c.b,before);
 for(const [id,label] of Object.entries({bomb:'Démolition totale',engineer:'Calibrage suprême',mechanist:'Blindage renforcé'}))assert.ok(cardPresentation({id,rarity:'éveillée'}).details.join(' ').includes(label));
});
