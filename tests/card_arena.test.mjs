import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CARDS} from '../src/data.js';
import {visualFor,CARD_ARENA_ART,CARD_TEMPLATES} from '../src/visuals.js';
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
 assert.match(html,/attaque 4, vie 2 sur 7/);assert.match(html,/assets\/cards\/milicien_aube_carte_v02.webp/);
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
 assert.equal(active.generation,'reset-2026-10-20');
 const ids=Object.values(CARDS).filter(c=>['aube','sylve','ombre'].includes(c.faction)).map(c=>c.id).sort();assert.equal(ids.length,32);
 assert.deepEqual(active.assets.map(a=>a.cardId).sort(),ids);
 for(const a of active.assets){assert.equal(a.key,CARD_TEMPLATES[a.cardId]);assert.equal(a.kind,'card');}
 assert.equal(index.activeRegistry,'assets/artwork.json');assert.deepEqual(index.assets.map(a=>a.cardId).sort(),ids);
});

test('Les sceaux distinguent les camps par leur forme, avec vie et camp accessibles sans trait sous la carte',()=>{
 const unit={id:'shield',uid:41,side:'p',atk:2,hp:4,maxhp:9};
 const ally=boardCard(unit),enemy=boardCard({...unit,side:'e'});
 assert.match(ally,/aria-label="Votre unité, Porte-égide : attaque 2, vie 4 sur 9"/);
 assert.match(enemy,/aria-label="Unité adverse, Porte-égide : attaque 2, vie 4 sur 9"/);
 assert.match(ally,/data-camp="p"/);assert.match(enemy,/data-camp="e"/);
 assert.notEqual(ally.match(/class="camp-seal-body" d="([^"]+)"/)[1],enemy.match(/class="camp-seal-body" d="([^"]+)"/)[1]);
 assert.doesNotMatch(ally+enemy,/board-card-health/);
});
