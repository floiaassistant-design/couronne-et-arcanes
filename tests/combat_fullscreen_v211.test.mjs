import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createViews} from '../src/ui/views.js';
import {freshProfile,createBattle} from '../src/engine.js';
import {CAMPAIGN} from '../src/data.js';

function combat(lanes,legacy=false){
 const profile=freshProfile();
 const battle=createBattle(profile,{...CAMPAIGN[0],difficulty:lanes===3?3:1,boss:lanes===4},211,{legacy});
 battle.heroes.p.hand=[{id:'militia',wait:0},{id:'archer',wait:2}];
 const ui=createViews(()=>({profile,battle,screen:'battle',selectedCard:-1,
  collectionFilter:'all',collectionOwned:false,animationsEnabled:true}));
 return ui.battleUI();
}
for(const lanes of [2,3,4]){
 test('combat plein écran : arène et main basse sur '+lanes+' lignes',()=>{
  const html=combat(lanes);
  const main=html.indexOf('class="combat-screen"'),
    title=html.indexOf('class="split-head combat-titlebar"'),
    stage=html.indexOf('class="battle-panel arena-lofi combat-stage"'),
    grid=html.indexOf('class="battle-grid arena-structured'),
    endStage=html.indexOf('</section><div class="combat-hand-dock"'),
    hand=html.indexOf('class="hand-panel"');
  assert.ok(main===5||main>=0);
  assert.ok(main<title&&title<stage&&stage<grid&&grid<endStage&&endStage<hand);
  assert.match(html,/data-action="nav" data-page="home"/);
  assert.match(html,/data-action="end-turn"/);
  assert.match(html,/data-action="hero-power"/);
  assert.match(html,/data-action="retreat"/);
  assert.match(html,/class="hand"/);
  assert.match(html,/data-action="select-card"/);
  assert.match(html,/en attente : 2 tours/);
  assert.equal((html.match(/class="lane-row arena-active-row"/g)||[]).length,lanes);
  assert.equal((html.match(/class="arena-dormant-row"/g)||[]).length,4-lanes);
 });
}
test('combat plein écran : bataille historique 3x5 conserve ses cases',()=>{
 const html=combat(3,true);
 assert.match(html,/class="combat-screen"/);
 assert.equal((html.match(/class="battle-cell /g)||[]).length,15);
 assert.equal((html.match(/class="arena-dormant-row"/g)||[]).length,0);
});
test('combat plein écran : styles et restauration indépendante des défilements',()=>{
 const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8'),
       js=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 assert.match(css,/body:has\(\.combat-screen\) #view/);
 assert.match(css,/\.combat-hand-dock\s*\{/);
 assert.match(css,/overflow-x:auto;overflow-y:hidden/);
 assert.match(js,/const handScroll=document\.querySelector\('\.combat-hand-dock \.hand'\)/);
 assert.match(js,/hand\.scrollLeft=handScroll/);
 assert.match(js,/stage\.scrollTop=stageScroll/);
});
