import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import {endPlayerTurn,finishEnemyTurn,freshProfile,fuseEvolutionCopies,modifyDeck} from '../src/engine.js';
import {resolveUnitDefinition} from '../src/cards/definitions.js';
import {hit,resolveRetaliation} from '../src/engine/battle-defense.js';
import {applySilence,placeTrap,teleportUnit} from '../src/engine/battle-control.js';
import {placeStillOmen,noteOmenMovement,resolveStillOmens} from '../src/engine/unit-omens.js';
import {resolveStrikeDisplacement} from '../src/engine/unit-triggers.js';
import {recordCombatEvent,captureCombatFrame} from '../src/engine/combat-events.js';
import {validUnitEffects} from '../src/engine/unit-effects.js';
import {cardPresentation,boardInspectionData} from '../src/ui/card-presentation.js';
import {storeBattle,restoreBattle,validStoredBattle} from '../src/ui/storage.js';
import {forgeUnit as unit,forgeBattle,testStorage} from './fixtures/forge-combat.mjs';
import {etherBattle} from './fixtures/ether-battle.mjs';

function contact(id='spark',side='p',legacy=false){
 const c=forgeBattle(id,'légendaire');
 if(legacy)c.b.board=Array.from({length:3},()=>Array(7).fill(null));
 else for(const row of c.b.board)row.fill(null);
 const last=c.b.board[0].length-2,col=side==='p'?(legacy?2:4):(legacy?4:7),dir=side==='p'?1:-1;
 c.u.side=side;c.b.board[0][col]=c.u;c.b.phase=side==='p'?'player':'enemy';
 const target=unit('militia',side==='p'?'e':'p',{hp:40,maxhp:40,armor:0,stun:99});
 c.b.board[0][col+dir]=target;
 return {...c,target,col,dir,last};
}
const attack=c=>(c.u.side==='p'?endPlayerTurn:finishEnemyTurn)(c.b);
const cycle=b=>{if(b.phase==='player')endPlayerTurn(b);if(b.status==='active')finishEnemyTurn(b);};
const outcome={performed:true,damaged:true,suppressed:false};

test('Feu follet : portée 3 des trois évolutions, natif 2 ; cible proche et ligne conservées aux deux camps/deux géométries',()=>{
 assert.equal(resolveUnitDefinition('spark').geometry.range,2);
 for(const rank of ['rare','épique','légendaire'])assert.equal(resolveUnitDefinition('spark',rank).geometry.range,3);
 for(const side of ['p','e'])for(const legacy of [false,true]){
  const c=contact('spark',side,legacy);c.b.board[0][c.col+c.dir]=null;c.b.board[0][c.col+3*c.dir]=c.target;
  const other=unit('militia',c.target.side,{hp:40,maxhp:40,stun:99});c.b.board[1][c.col+c.dir]=other;
  attack(c);assert.equal(c.target.hp,37);assert.equal(other.hp,40);assert.equal(c.b.board[0][c.col-c.dir],c.u);
  assert.equal(c.b.vfx.filter(e=>e.type==='attack'&&!e.riposte).length,1);
  const near=contact('spark',side,legacy),far=unit('militia',near.target.side,{hp:40,maxhp:40,stun:99});
  near.b.board[0][near.col+3*near.dir]=far;attack(near);assert.equal(near.target.hp,37);assert.equal(far.hp,40);
 }
});

test('Repli spectral : une frappe absorbée compte ; recul personnel, cadence individuelle et aucune attaque ajoutée',()=>{
 for(const side of ['p','e'])for(const barrier of [0,20]){
  const c=contact('spark',side);c.target.barrier=barrier;attack(c);
  assert.equal(c.b.board[0][c.col-c.dir],c.u);assert.equal(c.u.spectralRetreatReadyRound,4);
  assert.equal(c.target.hp,barrier?40:37);assert.equal(c.target.barrier,barrier?17:0);
  c.b.round=3;c.b.phase=side==='p'?'player':'enemy';attack(c);assert.equal(c.b.board[0][c.col-c.dir],c.u);
  c.b.round=4;c.b.phase=side==='p'?'player':'enemy';attack(c);assert.equal(c.b.board[0][c.col-2*c.dir],c.u);
 }
 const c=contact(),copy=unit('spark','p',{rarity:'légendaire'}),foe=unit('militia','e',{hp:40,maxhp:40,stun:99});
 c.b.board[1][4]=copy;c.b.board[1][5]=foe;attack(c);assert.equal(copy.spectralRetreatReadyRound,4);assert.equal(c.u.spectralRetreatReadyRound,4);
});

test('Repli bloqué par un allié ou une limite : aucun quota consommé ni mouvement vers une autre ligne',()=>{
 for(const side of ['p','e'])for(const blocked of ['occupied','edge']){
  const c=contact('spark',side);const origin=blocked==='edge'?(side==='p'?1:c.last):c.col;
  c.b.board[0][c.col]=null;c.b.board[0][c.col+c.dir]=null;c.b.board[0][origin]=c.u;c.b.board[0][origin+c.dir]=c.target;
  if(blocked==='occupied')c.b.board[0][origin-c.dir]=unit('bone',side,{stun:99});
  attack(c);assert.equal(c.b.board[0][origin],c.u);assert.equal(c.u.spectralRetreatReadyRound,undefined);
 }
});

test('Repli : Silence, attaque nulle, victime morte et Feu follet détruit après réaction excluent le pouvoir',()=>{
 for(const reason of ['silence','zero','kill','death']){
  const c=contact();
  if(reason==='silence')assert(applySilence(c.b,c.u));
  if(reason==='zero')c.u.atk=0;
  if(reason==='kill')c.target.hp=1;
  if(reason==='death'){
   c.target=unit('bone','e',{rarity:'divine',hp:1,maxhp:6});c.b.board[0][c.col+1]=c.target;c.u.hp=1;
  }
  attack(c);assert.equal(c.u.spectralRetreatReadyRound,undefined,reason);
  if(reason==='death')assert.equal(c.u.hp,0);
 }
});

test('Repli : couronne, sort et Riposte ne déclenchent pas de déplacement',()=>{
 const c=contact();c.b.board[0][c.col+1]=null;c.b.board[0][c.col]=null;c.b.board[0][10]=c.u;attack(c);
 assert.equal(c.u.spectralRetreatReadyRound,undefined);assert.equal(c.b.heroes.e.hp,97);
 const s=contact();hit(s.b,s.target,3,'p');assert.equal(s.u.spectralRetreatReadyRound,undefined);
 resolveRetaliation(s.b,s.target,s.u,0,5,4);assert.equal(s.u.spectralRetreatReadyRound,undefined);
});

test('Repli : piège réellement rencontré, quota et mort via les primitives communes',()=>{
 const c=contact();assert(placeTrap(c.b,'e',{lane:0,col:3}));const before=c.u.hp;attack(c);
 assert.equal(c.b.traps.length,0);assert.equal(c.u.hp,before-3);assert.equal(c.u.stun,0);assert.equal(c.u.spectralRetreatReadyRound,4);
 assert.equal(c.b.vfx.filter(e=>e.spectralRetreat).length,1);
 const dead=contact();dead.u.hp=1;assert(placeTrap(dead.b,'e',{lane:0,col:3}));attack(dead);
 assert.equal(dead.u.hp,0);assert.equal(dead.b.board[0][3],null);assert.equal(dead.b.traps.length,0);
});

test('Étoile immobile : perte effective de PV exigée, une marque non cumulable et cadence par invocation',()=>{
 for(const reason of ['normal','barrier','zero','kill','silence']){
  const c=contact('seer');
  if(reason==='barrier')c.target.barrier=30;
  if(reason==='zero')c.u.atk=0;
  if(reason==='kill')c.target.hp=1;
  if(reason==='silence')assert(applySilence(c.b,c.u));
  attack(c);
  assert.equal(!!c.target.stillOmen,reason==='normal',reason);
  if(reason==='normal'){
   assert.deepEqual(c.target.stillOmen,{sourceUid:c.u.uid,side:'p',amount:2,dueRound:2});assert.equal(c.u.stillOmenReadyRound,4);
   const mark=c.target.stillOmen;placeStillOmen(c.b,c.u,c.target,outcome,recordCombatEvent);assert.strictEqual(c.target.stillOmen,mark);
  }
 }
});

test('Présage : fin du tour suivant complet, jamais le tour de pose, deux camps et deux géométries',()=>{
 for(const side of ['p','e'])for(const legacy of [false,true]){
  const c=contact('seer',side,legacy);attack(c);assert.equal(c.target.hp,37);
  if(c.b.round===1)finishEnemyTurn(c.b);
  assert.equal(c.b.round,2);assert.equal(c.target.hp,37);assert(c.target.stillOmen);
  c.u.stun=99;endPlayerTurn(c.b);assert.equal(c.target.hp,37);finishEnemyTurn(c.b);
  assert.equal(c.target.hp,35);assert.equal(c.target.stillOmen,undefined);cycle(c.b);assert.equal(c.target.hp,35);
 }
});

test('Présage : mouvement normal au tour suivant annule ; mouvement avant ce tour ne l’annule pas',()=>{
 const c=contact('seer');attack(c);assert(c.target.stillOmen);c.b.board[0][c.col]=null;finishEnemyTurn(c.b);
 c.target.stun=0;cycle(c.b);assert.equal(c.target.stillOmen,undefined);assert.equal(c.target.hp,37);
 const d=contact('seer');attack(d);noteOmenMovement(d.b,d.target);assert(d.target.stillOmen);
});

test('Présage : mode de tour historique, résolution après les deux camps au prochain round',()=>{
 for(const side of ['p','e']){
  const c=contact('seer',side,true);delete c.b.turnFlow;c.b.phase='player';endPlayerTurn(c.b);
  assert.equal(c.b.round,2);assert.equal(c.target.hp,37);assert.equal(c.target.stillOmen.dueRound,2);
  c.u.stun=99;endPlayerTurn(c.b);assert.equal(c.target.hp,35);assert.equal(c.target.stillOmen,undefined);
 }
});

test('Présage : téléportation réelle puis retour, recul forcé et blocage sont distingués',()=>{
 const c=contact('seer');attack(c);finishEnemyTurn(c.b);
 const enter=(b,u)=>noteOmenMovement(b,u),plan={fromLane:0,toLane:1,col:c.col+1};
 assert(teleportUnit(c.b,'e',plan,recordCombatEvent,()=>{},enter));assert.equal(c.target.stillOmen,undefined);
 delete c.target.teleportedRound;assert(teleportUnit(c.b,'e',{fromLane:1,toLane:0,col:c.col+1},recordCombatEvent,()=>{},enter));
 c.u.stun=99;cycle(c.b);assert.equal(c.target.hp,37);
 for(const blocked of [true,false]){
  const x=contact('seer');attack(x);finishEnemyTurn(x.b);
  const smith=unit('smith','p',{rarity:'légendaire'});x.b.board[0][x.col]=smith;
  if(blocked)x.b.board[0][x.col+2]=unit('bone','e',{stun:99});
  assert.equal(resolveStrikeDisplacement(x.b,smith,x.target,{damaged:true,suppressed:false},{emit:recordCombatEvent,hit,enter}),!blocked);
  assert.equal(!!x.target.stillOmen,blocked);
 }
});

test('Présage : immobilisation sans mouvement et protections normales ; aucune Riposte ou préparation déclenchée',()=>{
 for(const armor of [0,9])for(const barrier of [0,3]){
  const c=contact('seer');attack(c);finishEnemyTurn(c.b);c.u.stun=99;c.target.armor=armor;c.target.barrier=barrier;
  const hp=c.target.hp;cycle(c.b);const raw=Math.max(1,2-armor);
  assert.equal(c.target.hp,hp-Math.max(0,raw-barrier));assert.equal(c.target.barrier,Math.max(0,barrier-raw));
  assert.equal(c.target.lastRiposteRound,undefined);assert.equal(c.target.stillOmen,undefined);
 }
});

test('Présage : une seule cible par Voyante, deux copies indépendantes et disparition de la source conservée',()=>{
 const c=contact('seer');attack(c);const other=unit('militia','e',{hp:40,maxhp:40,stun:99});c.b.board[1][5]=other;
 c.b.round=4;assert(placeStillOmen(c.b,c.u,other,outcome,recordCombatEvent));assert.equal(c.target.stillOmen,undefined);
 const second=unit('seer','p',{rarity:'légendaire'});c.b.board[1][4]=second;
 assert(placeStillOmen(c.b,second,c.target,outcome,recordCombatEvent));assert(other.stillOmen);assert(c.target.stillOmen);
 c.b.board[0][c.col]=null;c.b.board[1][4]=null;c.b.round=5;resolveStillOmens(c.b,hit);
 assert.equal(c.target.hp,35);assert.equal(other.hp,38);
});

test('Présage : une victime morte ne reçoit plus de dégâts, un décès différé compte une seule fois',()=>{
 for(const alreadyDead of [false,true]){
  const c=contact('seer');attack(c);c.u.stun=99;c.b.round=2;c.target.hp=alreadyDead?0:1;
  const kills=c.b.stats.playerKills;resolveStillOmens(c.b,hit);assert.equal(c.target.hp,0);
  assert.equal(c.b.stats.playerKills,kills+(alreadyDead?0:1));resolveStillOmens(c.b,hit);assert.equal(c.b.stats.playerKills,kills+(alreadyDead?0:1));
 }
});

test('États facultatifs : reprise exacte, validation des imports et instantanés immuables après mouvement',()=>{
 const c=contact('seer');attack(c);testStorage();assert(validStoredBattle(c.b));assert(storeBattle(c.b));
 const {vfx,...saved}=c.b;assert.deepEqual(restoreBattle(),saved);
 const frame=captureCombatFrame(c.b),json=JSON.stringify(frame);c.b.round=2;noteOmenMovement(c.b,c.target);assert.equal(JSON.stringify(frame),json);
 for(const patch of [{stillOmen:{amount:2,dueRound:2,sourceUid:1,side:'e'}},{stillOmen:{amount:0,dueRound:2,sourceUid:1,side:'p'}},{stillOmen:{amount:2,dueRound:-1,sourceUid:1,side:'p'}},{stillOmenReadyRound:NaN},{spectralRetreatReadyRound:101}])assert.equal(validUnitEffects({...c.target,...patch}),false);
 assert(validUnitEffects(unit('militia')));
});

test('Fiches : pouvoirs, portée effective, présage de la victime et cadence sans valeur inventée',()=>{
 const c=contact('seer');attack(c);const view=boardInspectionData(c.b,c.target.uid);
 assert(view.board.statuses.some(s=>s.includes('présage 2, fin du tour 2')));
 assert.match(cardPresentation({id:'spark',rarity:'légendaire'}).card.description,/Portée 3.*Repli spectral/);
 assert.match(cardPresentation({id:'seer',rarity:'légendaire'}).details.join(' '),/déplacement réel.*suivant complet/);
 for(const id of ['spark','seer'])assert.equal(resolveUnitDefinition(id,'divine'),null);
});

function fixtureProfile(id){const p=freshProfile();p.completed=['01','02','03','04','05','06'];p.evolvedCollection={[id+':épique']:3};const r=fuseEvolutionCopies(p,id+':légendaire');assert(r.ok);assert(modifyDeck(p,r.target,1));return p;}
test('Fixtures UI : fusion et invocation réelles, puis Repli ou présage et résolution suivante',()=>{
 for(const id of ['spark','seer']){
  const p=fixtureProfile(id),before=structuredClone(p),{battle:b,plan}=etherBattle(p,id),target=b.board.flat().find(u=>u?.uid===plan.targetUid);
  assert.equal(target.stillOmen,undefined);assert.equal(b.board[0][1].spectralRetreatReadyRound,undefined);
  const hp=target.hp;endPlayerTurn(b);assert.equal(target.hp,hp-1);
  if(id==='spark'){assert.equal(b.board[0][1].spectralRetreatReadyRound,4);assert.equal(b.board[0][2],null);}
  else {assert.equal(target.stillOmen.dueRound,2);finishEnemyTurn(b);cycle(b);assert.equal(target.hp,hp-3);assert.equal(target.stillOmen,undefined);}
  assert.deepEqual(p,before);assert(validStoredBattle(b));
 }
});

test('Export réellement embarqué : Repli, présage, annulation et résolution du même moteur',()=>{
 const source=readFileSync(new URL('../JOUER.html',import.meta.url),'utf8').match(/<script>\n([\s\S]*)<\/script>/)[1],context={structuredClone};
 new Script(source.replace("__load('src/app.js');","globalThis.api=__load('src/engine.js');")).runInNewContext(context);
 for(const id of ['spark','seer']){
  const {battle:b,plan}=etherBattle(fixtureProfile(id),id),target=b.board.flat().find(u=>u?.uid===plan.targetUid),hp=target.hp;
  context.api.endPlayerTurn(b);
  if(id==='spark')assert.equal(b.board[0][1].spectralRetreatReadyRound,4);
  else {assert(target.stillOmen);context.api.finishEnemyTurn(b);context.api.endPlayerTurn(b);context.api.finishEnemyTurn(b);assert.equal(target.hp,hp-3);assert.equal(target.stillOmen,undefined);}
 }
});
