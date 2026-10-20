import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createViews} from '../src/ui/views.js';
import {freshProfile,createBattle} from '../src/engine.js';
import {CAMPAIGN} from '../src/data.js';
test('Ancien décor calibré retiré du jeu modulaire et du builder',()=>{
 assert.equal(existsSync(new URL('../assets/backgrounds/arena-celeste-calibree.css',import.meta.url)),false);
 for(const f of ['index.html','scripts/build_standalone.mjs'])assert.doesNotMatch(readFileSync(new URL('../'+f,import.meta.url),'utf8'),/arena-celeste-calibree\.css/);
 assert.match(readFileSync(new URL('../index.html',import.meta.url),'utf8'),/arena-celeste-peinte\.css/);
});
for(const lanes of [2,3,4]){
 test('Plateau peint conservé : '+lanes+' vraies lignes et quatre pistes visuelles',()=>{
  const profile=freshProfile(),battle=createBattle(profile,{...CAMPAIGN[0],boss:lanes===4,difficulty:lanes===3?3:1},213);
  const html=createViews(()=>({profile,battle,screen:'battle',selectedCard:-1,collectionFilter:'all',collectionOwned:false,animationsEnabled:false})).battleUI();
  assert.equal((html.match(/class="arena-calibrated-art"/g)||[]).length,1);
  assert.equal((html.match(/class="battle-cell /g)||[]).length,10*lanes);
  assert.equal((html.match(/class="arena-dormant-cell"/g)||[]).length,10*(4-lanes));
 });
}
