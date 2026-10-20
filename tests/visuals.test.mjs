import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS} from '../src/data.js';
import {visualFor,artSrc,ART_NAMES,CARD_ARENA_ART,PLACEHOLDER_ART} from '../src/visuals.js';
import {readdirSync} from 'node:fs';

test('Nouvelle base : 76 cartes jouables sans ancien fichier ni image cassée',()=>{
 assert.equal(Object.keys(CARDS).length,76);
 assert.deepEqual(ART_NAMES,[]);assert.deepEqual(CARD_ARENA_ART,{});
 assert.deepEqual(readdirSync(new URL('../assets/creatures/',import.meta.url)).filter(n=>n.endsWith('.webp')),[]);
 const valid=new Set(['fighter','heavy','ranged','beast','flying','caster','support','undead','spell']);
 for(const c of Object.values(CARDS)){
  const v=visualFor(c);assert.equal(v.art,null);assert.ok(valid.has(v.role));
  assert.equal(artSrc(v.art),PLACEHOLDER_ART);
  assert.match(decodeURIComponent(artSrc(v.art)),/<svg[^>]+width="384" height="576"/);
 }
 for(const old of ['arbaletriere_aube','knight','milicien_aube','inconnu'])assert.equal(artSrc(old),PLACEHOLDER_ART);
});
test('Les rôles techniques restent disponibles sans réactiver les anciennes images',()=>{
 for(const [id,role] of Object.entries({archer:'ranged',dragon:'flying',golem:'heavy',lich:'caster',wolf:'beast',firebolt:'spell'}))assert.equal(visualFor(CARDS[id]).role,role);
});
