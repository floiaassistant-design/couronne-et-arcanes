import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createViews} from '../src/ui/views.js';
import {freshProfile,createBattle} from '../src/engine.js';
import {CAMPAIGN} from '../src/data.js';

function display(lanes,legacy=false){
 const profile=freshProfile();
 const battle=createBattle(profile,{...CAMPAIGN[0],boss:lanes===4,difficulty:lanes===3?3:1},211,{legacy});
 if(!legacy){
  battle.board[0][1]={id:'paladin',side:'p',uid:101,atk:4,hp:12,maxhp:12,armor:1};
  battle.board[0][10]={id:'lich',side:'e',uid:102,atk:6,hp:12,maxhp:12,armor:0};
 }
 return createViews(()=>({profile,battle,screen:'battle',selectedCard:-1,collectionFilter:'all',
  collectionOwned:false,animationsEnabled:false,previousGameAvailable:false})).battleUI();
}
for(const lanes of [2,3,4]){
 test('arène structurée : '+lanes+' lignes actives sur 4 pistes permanentes',()=>{
  const html=display(lanes);
  const active=[...html.matchAll(/class="lane-row arena-active-row" data-visual-lane="(\d)"/g)].map(m=>Number(m[1]));
  const dormant=[...html.matchAll(/class="arena-dormant-row" data-visual-lane="(\d)"/g)].map(m=>Number(m[1]));
  assert.deepEqual(active,lanes===2?[1,2]:Array.from({length:lanes},(_,i)=>i));
  assert.equal(dormant.length,4-lanes);
  assert.equal((html.match(/class="battle-cell /g)||[]).length,lanes*10);
  assert.equal((html.match(/class="arena-dormant-cell"/g)||[]).length,(4-lanes)*10);
  assert.equal((html.match(/data-action="deploy"/g)||[]).length,lanes);
  assert.match(html,/battle-grid arena-structured/);
  assert.match(html,/board-owner/);
  assert.match(html,/data-rarity/);
 });
}
test('arène structurée : ancienne sauvegarde 3x5 sans pistes décoratives',()=>{
 const html=display(3,true);
 assert.doesNotMatch(html,/class="arena-dormant-row"/);
 assert.doesNotMatch(html,/battle-grid arena-structured/);
 assert.equal((html.match(/class="battle-cell /g)||[]).length,15);
});
test('arène structurée : dalles calées sur les cellules, sans panoramique étiré',()=>{
 const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
 assert.match(css,/\.arena-structured \.battle-cell/);
 assert.match(css,/\.arena-dormant-cell/);
 assert.doesNotMatch(css.slice(css.indexOf('/* Arène structurée')),/background-size:\s*cover/);
});
