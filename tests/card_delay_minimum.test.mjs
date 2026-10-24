import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {freshProfile,createBattle} from '../src/engine.js';

// Règle validée le 24 octobre 2026 : aucun délai de carte ne commence à zéro.
const formerlyInstant=['militia','ranger','wolf','bone','drill','spark','pixie','nightblade'];

test('le catalogue entier conserve 76 cartes avec un délai de base minimum de 1',()=>{
 const cards=Object.values(CARDS);
 assert.equal(cards.length,76);
 assert.equal(cards.filter(c=>c.type==='unité').length,53);
 assert.equal(cards.filter(c=>c.type==='sort').length,23);
 for(const card of cards){
  assert.ok(Number.isInteger(card.delay)&&card.delay>=1,`${card.id} : délai ${card.delay} invalide`);
 }
 for(const id of formerlyInstant)assert.equal(CARDS[id].delay,1,id);
});

test('l’attente réelle des cartes piochées garde la règle existante : délai 1 immédiatement jouable',()=>{
 const battle=createBattle(freshProfile(),CAMPAIGN[0],20261024);
 const dealt=[...battle.heroes.p.hand,...battle.heroes.e.hand];
 assert.ok(dealt.length>0);
 for(const card of dealt){
  assert.equal(card.wait,Math.max(0,CARDS[card.id].delay-1),card.id);
 }
});
