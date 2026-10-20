import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CARDS} from '../src/data.js';
import {visualFor,CARD_ARENA_ART} from '../src/visuals.js';
import {boardCard,cardArenaEnabled} from '../src/ui/card-arena.js';
test('Vue cartes : présentation conservée, ancien lot Aube désactivé',()=>{
 assert.equal(cardArenaEnabled(),false);assert.deepEqual(CARD_ARENA_ART,{});
 for(const c of Object.values(CARDS)){
  assert.equal(visualFor(c).art,null);assert.equal(visualFor(c,{cards:true}).art,null);
 }
});
test('Vue cartes : vrais nombres rendus sans mutation et repère autonome',()=>{
 const u={id:'militia',uid:42,side:'p',atk:3,hp:2,maxhp:7},before=structuredClone(u);
 const html=boardCard(u,4);
 assert.match(html,/attaque 4, vie 2 sur 7/);assert.match(html,/data:image\/svg\+xml,/);
 assert.deepEqual(u,before);
});
test('Vue cartes : export du même jeu et même plateau, aucune fixture préplacée',()=>{
 const html=fs.readFileSync('ESSAI_CARTES.html','utf8');
 assert.match(html,/<body data-card-combat="true">/);
 assert.match(html,/src\/app.js/);assert.match(html,/paintedArena/);
 assert.match(html,/data-action="deploy"/);assert.match(html,/data-action="end-turn"/);
 assert.doesNotMatch(html,/createStudy|study-cards|STUDY_PRESETS|Object.defineProperties\(window/);
});
test('Vue cartes : le registre de la nouvelle génération ne contient aucun ancien lot',()=>{
 const active=JSON.parse(fs.readFileSync('assets/artwork.json'));
 const index=JSON.parse(fs.readFileSync('docs/CARD_ARENA_ASSETS.json'));
 assert.equal(active.generation,'reset-2026-10-20');assert.deepEqual(active.assets,[]);
 assert.equal(index.activeRegistry,'assets/artwork.json');assert.deepEqual(index.assets,[]);
});
