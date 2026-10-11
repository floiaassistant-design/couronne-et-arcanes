import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS} from '../src/data.js';
import {visualFor,artSrc,ART_NAMES} from '../src/visuals.js';
import {existsSync} from 'node:fs';

 test('V1.4 visual mapping covers 60 cards with valid original assets and roles',()=>{
   const valid=new Set(['fighter','heavy','ranged','beast','flying','caster','support','undead','spell']);
   assert.equal(Object.keys(CARDS).length,60);
   for(const card of Object.values(CARDS)){
     const {art,role}=visualFor(card);
     assert.ok(ART_NAMES.includes(art),card.name+' art is missing');
     assert.ok(valid.has(role),card.name+' role is missing');
     assert.ok(existsSync(new URL('../assets/creatures/'+art+'.webp',import.meta.url)),card.name+' artwork file is missing');
     assert.ok(artSrc(art).endsWith(art+'.webp'));
   }
 });
 test('V1.4 distinctive animation families support flying, armored, ranged and magic units',()=>{
   assert.equal(visualFor(CARDS.archer).role,'ranged');
   assert.equal(visualFor(CARDS.dragon).role,'flying');
   assert.equal(visualFor(CARDS.golem).role,'heavy');
   assert.equal(visualFor(CARDS.lich).role,'caster');
   assert.equal(visualFor(CARDS.wolf).role,'beast');
   assert.equal(visualFor(CARDS.firebolt).role,'spell');
   assert.notEqual(visualFor(CARDS.archer).art,visualFor(CARDS.golem).art);
 });
