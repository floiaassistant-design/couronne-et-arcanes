import test from 'node:test';
import assert from 'node:assert/strict';
import {endPlayerTurn,finishEnemyTurn,playPlayerCard,usePower} from '../src/engine.js';
import {applySilence,expireControl} from '../src/engine/battle-control.js';
import {grantSharedBarrier} from '../src/engine/battle-defense.js';
import {resolveRegeneration} from '../src/engine/unit-effects.js';
import {applyHealingPenalty,healUnit} from '../src/engine/unit-healing.js';
import {resolveUnitSupport} from '../src/engine/unit-support.js';
import {resolveClassSkill} from '../src/engine/class-skills.js';
import {CARDS} from '../src/data.js';
import {boardInspectionData} from '../src/ui/card-presentation.js';
import {restoreBattle,storeBattle,validStoredBattle} from '../src/ui/storage.js';
import {forgeBattle,forgeUnit as unit,testStorage} from './fixtures/forge-combat.mjs';

function impact(id,side='p',legacy=false,rarity='divine'){
 const c=forgeBattle(id,rarity),size=legacy?7:12;
 c.b.board=Array.from({length:3},()=>Array(size).fill(null));
 const from=side==='p'?(legacy?2:4):(legacy?4:7),dir=side==='p'?1:-1;
 const lane=1,col=from+2*dir,enemy=side==='p'?'e':'p';
 const victim=()=>unit('militia',enemy,{hp:30,maxhp:30,armor:0,stun:99});
 const primary=victim(),secondary=victim(),upper=victim(),lower=victim();
 c.u.side=side;c.b.phase=side==='p'?'player':'enemy';
 c.b.board[lane][from]=c.u;c.b.board[lane][from+dir]=primary;c.b.board[lane][col]=secondary;
 c.b.board[lane-1][col]=upper;c.b.board[lane+1][col]=lower;
 return {...c,lane,col,primary,secondary,upper,lower};
}
const attack=c=>(c.u.side==='p'?endPlayerTurn:finishEnemyTurn)(c.b);

test('Arc et Foudre : priorité haute, protections, une seule cible et aucun nouveau coup',()=>{
 for(const [rarity,amount] of [['divine',2],['éveillée',3]])for(const side of ['p','e'])for(const legacy of [false,true]){
  const c=impact('tempest',side,legacy,rarity);c.upper.barrier=1;
  assert(attack(c).ok);
  assert.deepEqual([c.primary.hp,c.secondary.hp,c.upper.hp,c.lower.hp],[26,28,31-amount,30]);
  assert.equal(c.upper.barrier,0);assert.equal(c.u.impactExtraReadyRound,4);
  assert.equal(c.b.vfx.filter(e=>e.type==='attack').length,1);
  c.b.round=2;c.b.phase=side==='p'?'player':'enemy';assert(attack(c).ok);
  assert.deepEqual([c.secondary.hp,c.upper.hp,c.lower.hp],[26,31-amount,30]);
  c.b.round=4;c.b.phase=side==='p'?'player':'enemy';c.b.board[0][c.col]=null;assert(attack(c).ok);
  assert.equal(c.lower.hp,30-amount);
 }
});

test('Les deux effets attendent un Impact blessant sur une cible survivante, hors Silence',()=>{
 for(const id of ['elemental','tempest'])for(const reason of ['barrière','mort','Silence','vide']){
  const c=impact(id);
  if(reason==='barrière')c.secondary.barrier=2;
  if(reason==='mort')c.secondary.hp=1;
  if(reason==='Silence')assert(applySilence(c.b,c.u));
  if(reason==='vide')c.b.board[c.lane][c.col]=null;
  attack(c);assert.equal(c.u.impactExtraReadyRound,undefined,reason);
  assert.equal(c.secondary.healingPenalty,undefined,reason);assert.equal(c.upper.hp,30,reason);
 }
 const c=impact('tempest');c.b.board[0][c.col]=unit('militia','p',{stun:99});c.b.board[2][c.col]=null;
 attack(c);assert.equal(c.u.impactExtraReadyRound,undefined);
});

test('Résonance issue du combat : sauvegarde, lecture, expiration et vrai Souffle vital',()=>{
 const c=impact('elemental','e');c.b.heroes.p.hp=90;assert(attack(c).ok);
 assert.equal(c.primary.healingPenalty,undefined);
 assert.deepEqual(c.secondary.healingPenalty,{amount:2,expiresRound:2});
 assert.equal(c.u.impactExtraReadyRound,4);
 assert.match(boardInspectionData(c.b,c.secondary.uid).board.statuses.join(' '),/prochain soin −2 PV/);
 testStorage();assert(storeBattle(c.b));const restored=restoreBattle();assert(validStoredBattle(restored));
 assert.deepEqual(restored.board[c.lane][c.col].healingPenalty,c.secondary.healingPenalty);
 restored.board[c.lane][c.col].healingPenalty.amount=-2;assert.equal(validStoredBattle(restored),false);
 c.b.heroes.p.hand=[{id:'healing',wait:0}];assert(playPlayerCard(c.b,0,c.lane).ok);
 assert.equal(c.secondary.hp,28);assert.equal(c.secondary.healingPenalty,undefined);
 assert.equal(c.primary.hp,27);assert.equal(c.b.heroes.p.hp,95);
 const untouched=impact('elemental');attack(untouched);expireControl(untouched.b);
 assert(untouched.secondary.healingPenalty);untouched.b.round=2;expireControl(untouched.b);
 assert.equal(untouched.secondary.healingPenalty,undefined);
});

test('Résonance : soin d’unité, de classe et régénération utilisent le même malus, sans toucher aux barrières',()=>{
 const c=impact('elemental','e');attack(c);
 const u=c.secondary,b=c.b,at=c.col;
 c.primary.hp=c.primary.maxhp;b.board[c.lane][at-1]=unit('cleric','p');
 grantSharedBarrier(u,3,4);assert.equal(u.barrier,3);assert(u.healingPenalty);
 resolveUnitSupport(b,'p',()=>{});assert.equal(u.hp,28);assert.equal(u.barrier,3);assert(!u.healingPenalty);
 applyHealingPenalty(u,b.round,{amount:2,duration:1});
 u.regeneration={amount:1,remaining:1,readyRound:b.round};
 resolveRegeneration(b,'p',()=>{});assert.equal(u.hp,28);assert(!u.regeneration);assert(!u.healingPenalty);
 applyHealingPenalty(u,b.round,{amount:2,duration:1});
 resolveClassSkill(b,'p',CARDS.skill_cleric_light,c.lane);assert.equal(u.hp,29);assert(!u.healingPenalty);
 applyHealingPenalty(u,b.round,{amount:2,duration:1});b.heroClass='clerc';
 assert(usePower(b).ok);assert.equal(u.hp,30);assert(!u.healingPenalty);
 applyHealingPenalty(u,b.round,{amount:2,duration:1});assert.equal(healUnit(u,3,b.round),0);assert(u.healingPenalty);
});


test('Résonance majeure : seul le prochain soin perd 4, le soin suivant retrouve sa valeur',()=>{
 const c=impact('elemental','e',false,'éveillée');assert(attack(c).ok);
 assert.deepEqual(c.secondary.healingPenalty,{amount:4,expiresRound:2});
 assert.equal(c.u.impactExtraReadyRound,4);
 assert.match(boardInspectionData(c.b,c.secondary.uid).board.statuses.join(' '),/prochain soin −4 PV/);
 c.secondary.hp=20;
 assert.equal(healUnit(c.secondary,5,c.b.round),1);
 assert.equal(healUnit(c.secondary,5,c.b.round),5);
});
