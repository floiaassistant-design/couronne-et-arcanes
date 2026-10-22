import test from 'node:test';
import assert from 'node:assert/strict';
import {esc} from '../src/ui/markup.js';
import {createViews} from '../src/ui/views.js';
import {freshProfile,createBattle} from '../src/engine.js';
import {CAMPAIGN} from '../src/data.js';

test('Les textes et attributs partagent le même échappement HTML',()=>{
 assert.equal(esc(`<a title="'&">`),'&lt;a title=&quot;&#039;&amp;&quot;&gt;');
 assert.equal(esc(42),'42');
 const profile=freshProfile();
 profile.name='<img src=x onerror="alert(1)">';
 const battle=createBattle(profile,CAMPAIGN[0],42);
 battle.heroes.p.name=profile.name;
 const views=createViews(()=>({profile,battle,selectedCard:-1,animationsEnabled:false}));
 assert.ok(views.battleUI().includes(esc(profile.name)));
 assert.ok(!views.battleUI().includes(profile.name));
});

test('Les vues réutilisées lisent le profil et les préférences actuels sans les modifier',()=>{
 let state={profile:freshProfile(),battle:null,screen:'home',selectedCard:-1,
  collectionFilter:'aube',collectionOwned:false,animationsEnabled:true};
 const views=createViews(()=>state);
 assert.match(views.cardUI('militia',{compact:true,cooldown:0}),/timer-motion/);
 const replacement=freshProfile();replacement.gold=98765;
 state={...state,profile:replacement,animationsEnabled:false,previousGameAvailable:true};
 const unchanged=JSON.stringify(state);
 assert.match(views.resourceUI(),/98[^\d]?765/);
 assert.doesNotMatch(views.cardUI('militia',{compact:true,cooldown:0}),/timer-motion/);
 assert.match(views.homeUI(),/restore-previous-game/);
 assert.equal(JSON.stringify(state),unchanged);
});

test('Le plateau réutilisé relit la géométrie réelle après une reprise historique',()=>{
 const profile=freshProfile();
 let battle=createBattle(profile,{...CAMPAIGN[0],boss:true},42);
 const views=createViews(()=>({profile,battle,selectedCard:-1,animationsEnabled:false}));
 const cells=html=>(html.match(/class="battle-cell /g)||[]).length;
 assert.equal(cells(views.battleUI()),40);
 battle=createBattle(profile,CAMPAIGN[0],42,{legacy:true});
 const unchanged=JSON.stringify(battle);
 assert.equal(cells(views.battleUI()),15);
 assert.equal(JSON.stringify(battle),unchanged);
});
