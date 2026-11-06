import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import {endPlayerTurn,finishEnemyTurn} from '../src/engine.js';
import {resolveUnitDefinition} from '../src/cards/definitions.js';
import {hit,resolveRetaliation,grantAbilityBarrier,grantSharedBarrier} from '../src/engine/battle-defense.js';
import {applySilence,placeTrap} from '../src/engine/battle-control.js';
import {captureCombatFrame} from '../src/engine/combat-events.js';
import {cardPresentation} from '../src/ui/card-presentation.js';
import {storeBattle,restoreBattle,validStoredBattle} from '../src/ui/storage.js';
import {forgeBattle,forgeUnit as unit,testStorage} from './fixtures/forge-combat.mjs';

const ranks=['divine','éveillée'];
function contact(id,rarity,{side='p',col=side==='p'?4:7,hp=30,barrier=0,armor=0}={}){
 const c=forgeBattle(id,rarity),{b,u}=c;for(const row of b.board)row.fill(null);u.side=side;
 const dir=side==='p'?1:-1,target=unit('militia',side==='p'?'e':'p',{hp,maxhp:Math.max(hp,30),barrier,armor,stun:99});
 b.board[0][col]=u;b.board[0][col+dir]=target;b.phase=side==='p'?'player':'enemy';
 return {...c,target,col,dir};
}
function attack(c){(c.u.side==='p'?endPlayerTurn:finishEnemyTurn)(c.b);return c;}
function direct(b,target,attacker,raw=3){
 const lane=b.board.findIndex(row=>row.includes(target)),from=b.board[lane].indexOf(attacker),to=b.board[lane].indexOf(target);
 return hit(b,target,raw,attacker.side,false,true,{attacker,from,to,sameLine:true});
}

test('Huit hauts rangs : vraie fusion, totaux indépendants, paramètres remplaçants et états de départ absents',()=>{
 for(const [id,stats] of Object.entries({smith:[4,8,1],drill:[3,7,1],colossus:[6,13,4],ironwraith:[3,9,1]}))for(const rank of ranks){
  const d=resolveUnitDefinition(id,rank),{p,u}=forgeBattle(id,rank);
  assert.deepEqual([d.stats.attack,d.stats.hp,d.stats.delay],stats);assert.equal(p.evolvedCollection[id+':'+rank],1);
  assert.deepEqual([u.atk,u.maxhp],[stats[0],stats[1]]);
  for(const key of ['knockbackReadyRound','barrierDrillReadyRound','strikeWardReadyRound','scoriaHits','scoriaReadyRound'])assert.equal(u[key],undefined);
 }
 const a=(id,rank)=>resolveUnitDefinition(id,rank).abilities;
 assert.deepEqual(a('smith','éveillée').knockback,{cells:1,period:3,follow:true,blockedDamage:2});
 assert.equal(a('drill','éveillée').barrierDrill.amount,4);assert.equal(a('colossus','éveillée').scoria.amount,4);
 assert.equal(a('ironwraith','divine').strikeWard.requiresKill,false);assert.equal(a('ironwraith','éveillée').strikeWard.amount,3);
 assert.equal(a('colossus','éveillée').guard,undefined);assert.equal(a('colossus','éveillée').riposte,undefined);
 for(const id of ['dragon','aetherknight'])assert.equal(resolveUnitDefinition(id,'commun'),null);
});

test('Brèche ouverte : recul puis avancée dans les deux camps, sans deuxième attaque',()=>{
 for(const side of ['p','e'])for(const rank of ranks){
  const {b,u,target,col,dir}=attack(contact('smith',rank,{side}));
  assert.equal(b.board[0][col],null);assert.equal(b.board[0][col+dir],u);assert.equal(b.board[0][col+2*dir],target);
  assert.equal(target.hp,26);assert.equal(u.knockbackReadyRound,4);
  assert.equal(b.vfx.filter(e=>e.type==='attack'&&!e.riposte).length,1);
  assert.equal(b.vfx.filter(e=>e.followKnockback).length,1);
 }
});

test('Brèche : vraie entrée dans un piège adverse, aucune avancée sans recul ni après mort du Marteau',()=>{
 const c=contact('smith','divine');assert(placeTrap(c.b,'e',{lane:0,col:6}));
 // Le piège appartient à la cible : il reste inactif sous elle, puis frappe le poursuivant.
 c.b.traps[0].col=5;attack(c);assert.equal(c.u.hp,5);assert.equal(c.b.traps.length,0);
 const blocked=contact('smith','divine');blocked.b.board[0][6]=unit('militia','e',{stun:99});attack(blocked);
 assert.equal(blocked.b.board[0][4],blocked.u);assert.equal(blocked.target.hp,26);assert.equal(blocked.u.knockbackReadyRound,undefined);
 const dead=contact('smith','divine');dead.target=unit('golem','e',{atk:20,hp:30,maxhp:30,stun:99});dead.b.board[0][5]=dead.target;
 attack(dead);assert.equal(dead.u.hp,0);assert.equal(dead.b.vfx.some(e=>e.knockback||e.followKnockback),false);
});

test('Fracas inexorable : alternative au recul, dégâts bruts protégés, bord et occupation dans les deux camps',()=>{
 for(const side of ['p','e'])for(const edge of [false,true])for(const armor of [0,2,5]){
  const c=contact('smith','éveillée',{side,col:edge?(side==='p'?9:2):side==='p'?4:7,armor});
  if(!edge)c.b.board[0][c.col+2*c.dir]=unit('militia',side,{stun:99});
  attack(c);const amount=Math.max(1,4-armor)+Math.max(1,2-armor);
  assert.equal(c.target.hp,30-amount);assert.equal(c.b.board[0][c.col+c.dir],c.target);
  assert.equal(c.b.board[0][c.col],c.u);assert.equal(c.u.knockbackReadyRound,4);
  assert.equal(c.b.vfx.filter(e=>e.type==='attack'&&!e.riposte).length,1);assert.equal(c.b.vfx.some(e=>e.followKnockback),false);
 }
});

test('Recul/Fracas partagent la cadence ; pas de Fracas après absorption complète, élimination ou Silence',()=>{
 const c=contact('smith','éveillée');c.b.board[0][6]=unit('militia','p',{stun:99});attack(c);assert.equal(c.target.hp,24);
 c.b.phase='player';c.b.round=2;attack(c);assert.equal(c.target.hp,20);assert.equal(c.u.knockbackReadyRound,4);
 for(const kind of ['barrier','dead','silence']){
  const q=contact('smith','éveillée',{barrier:kind==='barrier'?10:0,hp:kind==='dead'?1:30});q.b.board[0][6]=unit('militia','e',{stun:99});
  if(kind==='silence')applySilence(q.b,q.u,1);attack(q);assert.equal(q.u.knockbackReadyRound,undefined,kind);
 }
});

test('Foreuse runique : quatre points avant protections ; récupération seulement si le retrait vide la barrière',()=>{
 for(const side of ['p','e'])for(const rank of ranks)for(const barrier of [0,1,4,5,10]){
  const c=attack(contact('drill',rank,{side,barrier}));
  assert.equal(c.target.barrier,Math.max(0,barrier-7));assert.equal(c.target.hp,30-Math.max(0,3-Math.max(0,barrier-4)));
  assert.equal(c.u.barrier||0,rank==='éveillée'&&barrier>0&&barrier<=4?2:0);
  assert.equal(c.u.barrierDrillReadyRound,barrier?4:undefined);
 }
});

test('Récupération runique : plafond par effet, barrières coexistantes, cadence et Silence',()=>{
 const c=contact('drill','éveillée',{barrier:4});grantAbilityBarrier(c.u,'healBarrier',{amount:5,cap:5});attack(c);
 assert.equal(c.u.barrier,7);assert.equal(c.u.abilityBarriers.drillBarrier,2);
 c.b.round=2;c.b.phase='player';c.target.barrier=4;attack(c);assert.equal(c.u.barrier,7);assert.equal(c.target.barrier,1);
 c.b.round=4;c.b.phase='player';c.target.barrier=4;attack(c);assert.equal(c.u.barrier,7);
 const silent=contact('drill','éveillée',{barrier:4});applySilence(silent.b,silent.u,1);attack(silent);
 assert.equal(silent.target.barrier,1);assert.equal(silent.u.barrier,undefined);assert.equal(silent.u.barrierDrillReadyRound,undefined);
});

test('Recyclage actif : une blessure suffit, barrière seule et couronne exclues, légendaire inchangée',()=>{
 for(const side of ['p','e']){
  const c=contact('ironwraith','divine',{side});c.b.heroes[side].shield=0;attack(c);
  assert.equal(c.target.hp,27);assert.equal(c.b.heroes[side].shield,2);assert.equal(c.u.strikeWardReadyRound,4);
 }
 const barrier=contact('ironwraith','divine',{barrier:10});barrier.b.heroes.p.shield=0;attack(barrier);assert.equal(barrier.b.heroes.p.shield,0);assert.equal(barrier.u.strikeWardReadyRound,undefined);
 const legend=contact('ironwraith','légendaire');legend.b.heroes.p.shield=0;attack(legend);assert.equal(legend.b.heroes.p.shield,0);
 const crown=contact('ironwraith','divine');for(const row of crown.b.board)row.fill(null);crown.b.board[0][10]=crown.u;crown.b.heroes.p.shield=0;attack(crown);assert.equal(crown.b.heroes.p.shield,0);
});

test('Forge infatigable : conversion exacte du surplus, plafond propre et surplus de couronne conservé',()=>{
 for(const before of [0,17,18,19,20,25]){
  const c=contact('ironwraith','éveillée');c.b.heroes.p.shield=before;grantAbilityBarrier(c.u,'healBarrier',{amount:3,cap:3});attack(c);
  const gained=Math.max(before,Math.min(20,before+3))-before;
  assert.equal(c.b.heroes.p.shield,before+gained);assert.equal(c.u.barrier,3+Math.min(2,3-gained));
  c.b.round=4;c.b.phase='player';attack(c);assert.ok(c.u.barrier<=5);
 }
});

test('Marchefer : cadence commune, Silence et mort sur réaction interdisent tout nouveau gain',()=>{
 const c=contact('ironwraith','éveillée');c.b.heroes.p.shield=0;attack(c);c.b.round=2;c.b.phase='player';attack(c);assert.equal(c.b.heroes.p.shield,3);
 for(const kind of ['silence','death']){
  const q=contact('ironwraith','éveillée');q.b.heroes.p.shield=0;
  if(kind==='silence')applySilence(q.b,q.u,1);
  else {q.target=unit('bone','e',{rarity:'divine',hp:1,maxhp:30,stun:99});q.b.board[0][5]=q.target;q.u.hp=1;}
  attack(q);assert.equal(q.b.heroes.p.shield,0);assert.equal(q.u.strikeWardReadyRound,undefined);
 }
});

test('Cuirasse/Fournaise : deux attaques directes avec PV perdus, même comportement aux deux camps',()=>{
 for(const side of ['p','e'])for(const rank of ranks){
  const c=contact('colossus',rank,{side});c.u.hp=c.u.maxhp=50;
  direct(c.b,c.u,c.target);assert.equal(c.u.hp,49);assert.equal(c.u.scoriaHits,1);assert.equal(c.u.barrier,undefined);
  direct(c.b,c.u,c.target);assert.equal(c.u.hp,48);assert.equal(c.u.scoriaHits,0);assert.equal(c.u.scoriaReadyRound,4);
  assert.equal(c.u.barrier,rank==='divine'?2:4);assert.equal(c.u.abilityBarriers.scoriaBarrier,c.u.barrier);
 }
});

test('Colosse : coups absorbés, sorts, impacts secondaires, Silence, alliés et destruction exclus',()=>{
 for(const kind of ['barrier','spell','secondary','silence','ally','death']){
  const c=contact('colossus','éveillée');if(kind==='barrier')grantSharedBarrier(c.u,10,10);if(kind==='silence')applySilence(c.b,c.u,1);
  if(kind==='ally')c.target.side='p';if(kind==='death')c.u.hp=1;
  for(let n=0;n<2;n++)if(kind==='spell')hit(c.b,c.u,3,'e');else if(kind==='secondary')hit(c.b,c.u,3,'e',false,true);else direct(c.b,c.u,c.target);
  assert.equal(c.u.scoriaReadyRound,undefined,kind);assert.equal(c.u.abilityBarriers?.scoriaBarrier,undefined,kind);
 }
});

test('Deux vrais tirs dans le tour adverse activent la Cuirasse/Fournaise, aux deux camps',()=>{
 for(const side of ['p','e'])for(const rank of ranks){
  const c=contact('colossus',rank,{side});for(const row of c.b.board)row.fill(null);
  const foe=side==='p'?'e':'p',col=side==='p'?4:7,dir=side==='p'?1:-1;
  c.b.board[0][col]=c.u;
  for(const distance of [1,2])c.b.board[0][col+dir*distance]=unit('archer',foe);
  c.b.phase=foe==='p'?'player':'enemy';(foe==='p'?endPlayerTurn:finishEnemyTurn)(c.b);
  assert.equal(c.u.hp,11);assert.equal(c.u.barrier,rank==='divine'?2:4);assert.equal(c.u.scoriaHits,0);assert.equal(c.u.scoriaReadyRound,4);
 }
});

test('Le vrai Fracas du Marteau ne compte pas comme une deuxième attaque directe sur le Colosse',()=>{
 const c=contact('smith','éveillée');c.target=unit('colossus','e',{rarity:'divine'});c.b.board[0][5]=c.target;c.b.board[0][6]=unit('militia','e',{stun:99});
 attack(c);assert.equal(c.target.hp,10);assert.equal(c.target.scoriaHits,1);assert.equal(c.target.barrier,undefined);assert.equal(c.target.scoriaReadyRound,undefined);
 c.b.round=2;c.b.phase='player';attack(c);assert.equal(c.target.hp,8);assert.equal(c.target.barrier,2);assert.equal(c.target.scoriaHits,0);
});

test('Colosse : une Riposte est directe ; compteur conservé en cadence et aucune barrière avant la prochaine blessure',()=>{
 const c=contact('colossus','divine');c.u.hp=c.u.maxhp=50;c.target=unit('golem','e',{atk:3,hp:50,maxhp:50});c.b.board[0][5]=c.target;
 assert(resolveRetaliation(c.b,c.target,c.u,0,5,4));assert.equal(c.u.scoriaHits,1);direct(c.b,c.u,c.target);assert.equal(c.u.barrier,2);
 c.b.round=2;for(let n=0;n<4;n++)direct(c.b,c.u,c.target);assert.equal(c.u.scoriaHits,2);assert.equal(c.u.scoriaReadyRound,4);
 c.b.round=4;assert.equal(c.u.barrier,0);direct(c.b,c.u,c.target);assert.equal(c.u.barrier,2);assert.equal(c.u.scoriaHits,0);assert.equal(c.u.scoriaReadyRound,7);
});

test('Instantanés et reprise : origines de barrières, compteur partiel et quotas sauvegardés sans mutation des anciens états',()=>{
 const c=contact('colossus','éveillée'),before=captureCombatFrame(c.b),old=JSON.stringify(before);c.u.hp=c.u.maxhp=50;direct(c.b,c.u,c.target);
 assert.equal(JSON.stringify(before),old);testStorage();assert(storeBattle(c.b));const b=restoreBattle(),u=b.board[0][4];assert.equal(u.scoriaHits,1);
 direct(b,u,b.board[0][5]);assert.equal(u.barrier,4);assert.equal(c.u.barrier,undefined);
 for(const [key,values] of Object.entries({scoriaHits:[-1,3,1.5,null],scoriaReadyRound:[0,-1,101,1.5,null]}))for(const value of values){
  const bad=structuredClone(b);bad.board[0][4][key]=value;assert.equal(validStoredBattle(bad),false,key+':'+value);
 }
});

test('Fiches des huit rangs : pouvoir effectif, remplacement, ascension et statistiques du registre',()=>{
 for(const [id,labels] of Object.entries({smith:['Brèche ouverte','Fracas inexorable'],drill:['Foreuse runique','Récupération runique'],colossus:['Cuirasse de scories','Fournaise blindée'],ironwraith:['Recyclage actif','Forge infatigable']}))for(const [i,rank] of ranks.entries()){
  const view=cardPresentation({id,rarity:rank});assert.ok(view.details.join(' ').includes(labels[i]),id+':'+rank);assert.match(view.availability,/Ascension/i);
 }
});

test('Véritable export autonome : avancée, alternative Fracas et récupération de barrière sont résolues',()=>{
 const source=readFileSync(new URL('../JOUER.html',import.meta.url),'utf8').match(/<script>\n([\s\S]*)<\/script>/)[1],context={structuredClone};
 new Script(source.replace("__load('src/app.js');","globalThis.api=__load('src/engine.js');")).runInNewContext(context);
 const smith=contact('smith','divine');context.api.endPlayerTurn(smith.b);assert.equal(smith.b.board[0][5].uid,smith.u.uid);
 const drill=contact('drill','éveillée',{barrier:4});context.api.endPlayerTurn(drill.b);assert.equal(drill.u.barrier,2);
 const blocked=contact('smith','éveillée',{col:9});context.api.endPlayerTurn(blocked.b);assert.equal(blocked.target.hp,24);
});
