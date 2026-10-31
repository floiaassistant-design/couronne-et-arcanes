import test from 'node:test';
import assert from 'node:assert/strict';
import {freshProfile} from '../src/engine.js';
import {craftEquipment,chooseDungeonEvent,modifyDeck} from '../src/engine.js';
import {SAVE_KEY,inspectStoredProfile} from '../src/ui/storage.js';
import {commitProfileChange} from '../src/ui/profile-transactions.js';

const mock=()=>{const cache={};globalThis.localStorage={getItem:k=>cache[k]??null,setItem:(k,v)=>{cache[k]=String(v)},removeItem:k=>{delete cache[k]}};return cache;};
test('une sauvegarde absente démarre normalement, sans écrire',()=>{
 const cache=mock(),state=inspectStoredProfile();
 assert.equal(state.error,null);assert.deepEqual(state.profile,freshProfile());assert.deepEqual(cache,{});
});
test('JSON corrompu ou profil sans deck / collection : aucun retour silencieux à une partie vierge',()=>{
 const cache=mock();for(const bad of ['{fragment', 'null','[]','{}',JSON.stringify({deck:[],collection:null})]){
  cache[SAVE_KEY]=bad;const state=inspectStoredProfile();
  assert.equal(state.profile,null);assert.ok(state.error);assert.equal(cache[SAVE_KEY],bad);
 }
});
test('un ancien profil lisible et un deck vide restent compatibles, sans réécriture',()=>{
 const cache=mock(),p=freshProfile();p.deck=[];p.gold='invalide';delete p.completedTrials;
 cache[SAVE_KEY]=JSON.stringify(p);const state=inspectStoredProfile();
 assert.equal(state.error,null);assert.deepEqual(state.profile.deck,[]);
 assert.equal(state.profile.gold,110);assert.equal(cache[SAVE_KEY],JSON.stringify(p));
});
test('stockage inaccessible : les données ne sont pas remplacées',()=>{
 mock();localStorage.getItem=()=>{throw Error('bloqué');};
 assert.equal(inspectStoredProfile().profile,null);
});
test('achats, choix et deck : une opération refusée ou non enregistrée ne change jamais le profil',()=>{
 const p=freshProfile(),snapshot=structuredClone(p);let writes=0;
 const failed=commitProfileChange(p,next=>craftEquipment(next,'lame'),()=>{writes++;return false});
 assert.equal(failed.ok,false);assert.equal(writes,1);assert.deepEqual(p,snapshot);
 const rejected=commitProfileChange(p,next=>chooseDungeonEvent(next,'treasure'),()=>{writes++;return true});
 assert.equal(rejected.ok,false);assert.equal(writes,1);assert.deepEqual(p,snapshot);
 const deck=commitProfileChange(p,next=>modifyDeck(next,'militia',-1),()=>false);
 assert.equal(deck.ok,false);assert.deepEqual(p,snapshot);
 const good=commitProfileChange(p,next=>craftEquipment(next,'lame'),()=>true);
 assert.equal(good.ok,true);assert.notEqual(good.profile,p);
 assert.equal(good.profile.gold,25);assert.equal(good.profile.shards,30);
 assert.deepEqual(p,snapshot);
});
