import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {freshProfile} from '../src/engine/profile.js';
import {createBattle,endPlayerTurn,playPlayerCard} from '../src/engine/battle.js';
import {resolveUnitDefinition} from '../src/cards/definitions.js';
import {hit,resolveRetaliation as retaliate,grantAbilityBarrier,grantHealBarrier} from '../src/engine/battle-defense.js';
import {crownGuardCandidates} from '../src/engine/guard-candidates.js';
import {applySilence,triggerTrap} from '../src/engine/battle-control.js';
import {storeBattle,restoreBattle} from '../src/ui/storage.js';

function combat(legacy=false){
 const b=createBattle(freshProfile(),{...CAMPAIGN[0],deck:[]},121,{legacy,turnFlow:'alternating'});
 for(const h of Object.values(b.heroes))Object.assign(h,{hp:100,maxhp:100,hand:[],deck:[],discard:[]});
 b.vfx=[];return b;
}
let sequence=8000;
function unit(id,rarity,side='p',extra={}){
 const d=resolveUnitDefinition(id,rarity),c=CARDS[id];
 return {uid:++sequence,id,side,atk:d.stats.attack,hp:d.stats.hp,maxhp:d.stats.hp,
  armor:d.abilities.armor?.amount||0,ranged:!!d.abilities.ranged,ability:c.ability,
  stun:0,poison:0,poisonTurns:0,...(rarity?{rarity}:{}),...extra};
}

test('Réduction initiale : montants par rareté, un seul coup, même entièrement absorbé par barrière',()=>{
 for(const [rarity,reduction] of [['rare',1],['épique',2],['légendaire',2],['divine',3],['éveillée',3]]){
  const b=combat(),u=unit('militia',rarity);b.board[0][4]=u;
  hit(b,u,4,'e');assert.equal(u.hp,u.maxhp-(4-reduction));
  hit(b,u,1,'e');assert.equal(u.hp,u.maxhp-(4-reduction)-1);
  assert.equal(u.firstHitReductionUsed,true);
 }
 const b=combat(),u=unit('militia','rare','p',{barrier:5});b.board[0][4]=u;
 hit(b,u,3,'p');assert.equal(u.firstHitReductionUsed,undefined,'un effet allié ne consomme pas la réduction');
 hit(b,u,1,'e');assert.equal(u.firstHitReductionUsed,true);assert.equal(u.barrier,2);
 hit(b,u,3,'e');assert.equal(u.hp,4);assert.equal(u.barrier,0);
});

test('Armure 3 : minimum 1, Perforation ignore seulement l’armure, barrière conservée',()=>{
 const b=combat(),u=unit('paladin','divine','p',{barrier:2});b.board[0][4]=u;
 assert.equal(hit(b,u,1,'e'),0);assert.equal(u.barrier,1);assert.equal(u.hp,11);
 assert.equal(hit(b,u,5,'e',true),4);assert.equal(u.hp,7);assert.equal(u.barrier,0);
 assert.equal(hit(b,u,5,'e'),2);assert.equal(u.hp,5);
 assert.equal(b.vfx.filter(e=>e.type==='damage').at(-1).armor,3);
});

test('Dernier Rempart : après protections, une fois, plafond des PV max et mortalité unique',()=>{
 const b=combat(),u=unit('militia','éveillée');b.board[0][4]=u;
 hit(b,u,99,'e');assert.equal(u.hp,5);assert.equal(u.lastStandUsed,true);assert.equal(b.stats.enemyKills,0);
 hit(b,u,99,'e');assert.equal(u.hp,0);assert.equal(b.stats.enemyKills,1);
 hit(b,u,99,'e');assert.equal(b.stats.enemyKills,1);
 const small=unit('militia','éveillée','p',{maxhp:3,hp:1});b.board[0][5]=small;
 hit(b,small,99,'e');assert.equal(small.hp,3);assert.equal(b.stats.enemyKills,1);
 assert(b.vfx.filter(e=>e.type==='damage').every(e=>e.damage>=0));
});

test('Pipeline réel : les sorts et pièges partagent les protections ; poison garde ses dégâts directs',()=>{
 const spell=combat(),victim=unit('militia','rare','e');spell.board[0][5]=victim;
 spell.heroes.p.hand=[{id:'firebolt',wait:0}];
 assert.equal(playPlayerCard(spell,0,0).ok,true);assert.equal(victim.hp,2);
 const trapped=combat(),entrant=unit('militia','rare');trapped.board[0][4]=entrant;
 trapped.traps=[{owner:'e',lane:0,col:4,damage:3,expiresRound:2}];
 assert.equal(triggerTrap(trapped,entrant,0,4,hit),true);assert.equal(entrant.hp,3);
 assert.equal(trapped.traps.length,0);
 const b=combat(),u=unit('militia','éveillée','p',{hp:1,poison:2,poisonTurns:1});b.board[0][4]=u;
 endPlayerTurn(b);assert.equal(b.board[0][4],null);assert.equal(u.lastStandUsed,undefined);
 assert.equal(u.firstHitReductionUsed,undefined,'un poison périodique ne consomme pas un premier coup');
});

test('Silence : réduction passive conservée, Riposte et Dernier Rempart suspendus sans consommer leur quota',()=>{
 const b=combat(),u=unit('militia','éveillée'),foe=unit('bone',undefined,'e',{hp:20});
 assert.equal(applySilence(b,u,1),true);
 b.board[0][4]=u;b.board[0][5]=foe;
 assert.equal(retaliate(b,u,foe,0,4,5),false);assert.equal(u.riposteUsed,undefined);
 hit(b,u,2,'e');assert.equal(u.hp,8);assert.equal(u.firstHitReductionUsed,true);
 hit(b,u,99,'e');assert.equal(u.hp,0);assert.equal(u.lastStandUsed,undefined);
});

test('Riposte effective : ATQ actuelle + Concorde + Ralliement ; Charge jamais ajoutée au contre-coup',()=>{
 const b=combat(),u=unit('shield','épique','e',{atk:7,movedThisRound:true,rallyUntil:1,stun:4});
 const ally=unit('militia',undefined,'e',{stun:4});
 const attacker=unit('bone',undefined,'p',{atk:1,hp:30,maxhp:30});
 b.board[0][4]=attacker;b.board[0][5]=u;b.board[0][7]=ally;
 endPlayerTurn(b);assert.equal(attacker.hp,21,'7 ATQ + 1 Concorde + 1 Ralliement, sans Charge');
 assert.equal(u.lastRiposteRound,1);assert.equal(b.vfx.filter(e=>e.riposte).length,1);
});

test('Quotas : une Riposte du Milicien par invocation, les autres par tour, reprise JSON sans réarmement',()=>{
 for(const [id,rarity] of [['militia','divine'],['shield','rare'],['paladin','légendaire'],['dawnbastion','divine']]){
  const b=combat(),u=unit(id,rarity),foe=unit('bone',undefined,'e',{hp:100,armor:1,barrier:1});
  b.board[0][4]=u;b.board[0][5]=foe;
  assert.equal(retaliate(b,u,foe,0,4,5),true);assert.equal(retaliate(b,u,foe,0,4,5),false);
  const saved=JSON.parse(JSON.stringify(b));saved.round++;
  assert.equal(retaliate(saved,saved.board[0][4],saved.board[0][5],0,4,5),id!=='militia');
 }
});

test('Riposte : pas de chaîne, pas à distance, entre alliés, après mort ou sous silence',()=>{
 for(const extras of [{ranged:true},{hp:0},{side:'p'}]){
  const b=combat(),u=unit('paladin','éveillée'),foe=unit('bone',undefined,'e',extras);
  assert.equal(retaliate(b,u,foe,0,4,5),false);assert.equal(u.lastRiposteRound,undefined);assert.equal(u.barrier,undefined);
 }
 const b=combat(),u=unit('paladin','éveillée'),foe=unit('shield','rare','e',{hp:30,armor:2,barrier:3});
 b.board[0][4]=u;b.board[0][5]=foe;
 assert.equal(retaliate(b,u,foe,0,4,7),false);
 assert.equal(retaliate(b,u,foe,0,4,5),true);assert.equal(foe.hp,30);assert.equal(foe.barrier,1);
 assert.equal(u.barrier,2,'barrière après Riposte autorisée, même absorbée');
 assert.equal(foe.lastRiposteRound,undefined);assert.equal(b.vfx.filter(e=>e.riposte).length,1);
});

test('Barrières : plafond par effet, protection extérieure préservée et rechargement après absorption',()=>{
 const b=combat(),u=unit('paladin','éveillée','p',{barrier:6});b.board[0][4]=u;
 const p=resolveUnitDefinition(u).abilities.riposteBarrier;
 assert.equal(grantAbilityBarrier(u,'riposteBarrier',p),2);assert.equal(u.barrier,8);
 assert.equal(grantAbilityBarrier(u,'riposteBarrier',p),0);assert.equal(u.barrier,8);
 hit(b,u,4,'e');assert.equal(u.barrier,7);assert.equal(u.abilityBarriers.riposteBarrier,1);
 assert.equal(grantAbilityBarrier(u,'riposteBarrier',p),1);assert.equal(u.barrier,8);
 const healer=unit('sunpriest','divine');
 assert.equal(grantHealBarrier(b,healer,u,0),0);assert.equal(grantHealBarrier(b,healer,u,1),1);
 assert.equal(grantHealBarrier(b,healer,u,1),1);assert.equal(grantHealBarrier(b,healer,u,1),0);
 assert.equal(u.barrier,10);assert.equal(u.abilityBarriers.healBarrier,2);
 healer.silenceUntil=1;assert.equal(grantHealBarrier(b,healer,unit('militia',undefined),1),0);
 const awakened=unit('sunpriest','éveillée'),target=unit('militia',undefined,'p',{barrier:6});
 assert.equal(grantHealBarrier(b,awakened,target,2),2);assert.equal(target.barrier,8);
 assert.equal(grantHealBarrier(b,awakened,unit('bone',undefined,'e'),2),0);
});

test('Sauvegarde et instantanés : quotas persistants et barrières de capacités indépendantes des événements',()=>{
 const cache={};globalThis.localStorage={getItem:k=>cache[k]??null,setItem:(k,v)=>{cache[k]=String(v);},removeItem:k=>{delete cache[k];}};
 const b=combat(),u=unit('militia','éveillée');b.board[0][4]=u;
 grantAbilityBarrier(u,'healBarrier',{amount:2,cap:2});hit(b,u,4,'e');
 const frame=b.vfx.at(-1).frame;hit(b,u,4,'e');
 assert.equal(frame.board[0][4].abilityBarriers.healBarrier,1);
 assert(storeBattle(b));const saved=restoreBattle();assert(saved);assert.equal(saved.vfx,undefined);
 assert.equal(saved.board[0][4].firstHitReductionUsed,true);assert.equal(saved.board[0][4].rarity,'éveillée');
 hit(saved,saved.board[0][4],99,'e');assert.equal(saved.board[0][4].hp,5);
 assert(storeBattle(saved));const resumed=restoreBattle();hit(resumed,resumed.board[0][4],99,'e');
 assert.equal(resumed.board[0][4].hp,0);assert.equal(resumed.stats.enemyKills,1);
});

test('Tous les natifs : Riposte fixe historique, chiffres sauvegardés et absence de nouveaux champs',()=>{
 for(const id of ['shield','paladin','dawnbastion','treant','graveknight','golem','sentinel']){
  const b=combat(),u=unit(id,undefined,'p',{atk:17}),foe=unit('bone',undefined,'e',{hp:20});
  b.board[0][4]=u;b.board[0][5]=foe;
  assert.equal(retaliate(b,u,foe,0,4,5,5),true);assert.equal(foe.hp,18,id);
  assert.equal(u.rarity,undefined);assert.equal(u.riposteUsed,undefined);assert.equal(u.abilityBarriers,undefined);
 }
});

test('Garde : éligibilité Normale/Divine/Éveillée symétrique, deux géométries, silence passif conservé',()=>{
 for(const legacy of [true,false])for(const side of ['p','e']){
  const b=combat(legacy),end=b.board[0].length-2,attackCol=side==='p'?2:end-1,front=side==='p'?1:end,behind=side==='p'?3:end-2;
  const u=unit('shield','rare',side,{silenceUntil:1});b.board[0][front]=u;
  assert.deepEqual(crownGuardCandidates(b,0,side,attackCol).map(g=>[g.lane,g.col]),[[0,front]]);
  b.board[0][front]=null;b.board[0][behind]=u;
  assert.equal(crownGuardCandidates(b,0,side,attackCol).length,0);
  u.rarity='divine';assert.equal(crownGuardCandidates(b,0,side,attackCol).length,1);
  assert.equal(crownGuardCandidates(b,1,side,attackCol).length,0);
  u.rarity='éveillée';assert.deepEqual(crownGuardCandidates(b,1,side,attackCol).map(g=>[g.lane,g.col]),[[0,behind]]);
  u.hp=0;assert.deepEqual(crownGuardCandidates(b,1,side,attackCol),[]);
 }
});

test('Garde multiple : toutes les candidatures, aucune priorité ou limite inventée',()=>{
 const b=combat();b.board[0][1]=unit('shield','éveillée');b.board[1][3]=unit('shield','éveillée');
 const before=JSON.stringify(b);
 for(let n=0;n<2;n++)assert.equal(crownGuardCandidates(b,0,'p',2).length,2);
 assert.equal(JSON.stringify(b),before);assert.deepEqual(crownGuardCandidates(b,8,'p',2),[]);
 assert.deepEqual(crownGuardCandidates(b,0,'e',2),[]);
 assert.deepEqual(crownGuardCandidates(b,0,'p',0),[]);
 assert.deepEqual(resolveUnitDefinition('shield','éveillée').pendingDecisions,['guard-priority','guard-frequency']);
});
