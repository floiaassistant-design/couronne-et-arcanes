import test from 'node:test';
import assert from 'node:assert/strict';
import {freshProfile} from '../src/engine.js';
import {createViews} from '../src/ui/views.js';

function fixtures(animationsEnabled=true){
 const profile=freshProfile();
 const views=createViews(()=>({profile,battle:null,screen:'battle',selectedCard:-1,collectionFilter:'all',collectionOwned:false,animationsEnabled}));
 return {views,profile};
}

test('La main distingue une carte prête de deux comptes à rebours sans changer les cartes',()=>{
 const {views,profile}=fixtures();
 const unchanged=JSON.stringify(profile);
 const ready=views.cardUI('militia',{compact:true,index:0,cooldown:0});
 const waiting=views.cardUI('militia',{compact:true,index:1,cooldown:3});
 const almost=views.cardUI('militia',{compact:true,index:2,cooldown:1});
 assert.match(ready,/hand-card/);
 assert.match(ready,/hand-ready/);
 assert.match(ready,/✓ PRÊTE/);
 assert.doesNotMatch(ready,/cooldown-stamp/);
 assert.match(waiting,/hand-waiting/);
 assert.match(waiting,/EN ATTENTE/);
 assert.match(waiting,/<b>3<\/b><small>TOURS<\/small>/);
 assert.match(waiting,/aria-disabled="true"/);
 assert.match(almost,/<b>1<\/b><small>TOUR<\/small>/);
 assert.equal(JSON.stringify(profile),unchanged);
});

test('Les autres écrans ne portent aucun badge de compte à rebours, animations désactivables',()=>{
 const {views}=fixtures(false);
 const collection=views.cardUI('militia');
 const hand=views.cardUI('militia',{compact:true,index:0,cooldown:0});
 assert.doesNotMatch(collection,/hand-readiness|hand-card|cooldown-stamp/);
 assert.match(hand,/hand-ready/);
 assert.doesNotMatch(hand,/timer-motion/);
 assert.match(hand,/data-action="select-card"/);
});
