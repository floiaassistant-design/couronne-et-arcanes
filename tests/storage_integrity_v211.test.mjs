import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {freshProfile,normalizeProfile,createBattle} from '../src/engine.js';
import {CAMPAIGN} from '../src/data.js';
import {loadProfile,restoreBattle,storeBattle,saveProfile,validateImportedProfile,BATTLE_KEY,SAVE_KEY} from '../src/ui/storage.js';
const mock=()=>{const cache={};globalThis.localStorage={
 getItem:key=>cache[key]??null,setItem:(key,value)=>{cache[key]=String(value);},removeItem:key=>delete cache[key]
};return cache;};
test('profile numbers and card counts are bounded without breaking a valid legacy profile',()=>{
 const raw=freshProfile();raw.gold='9999';raw.shards=-2;raw.collection.militia='infinite';raw.upgrades.militia=999;
 raw.buildings.bibliotheque=500;raw.reputation.aube='999';
 const p=normalizeProfile(raw);
 assert.equal(p.gold,110);assert.equal(p.shards,50);assert.equal(p.collection.militia,0);
 assert.equal(p.upgrades.militia,3);assert.equal(p.buildings.bibliotheque,2);assert.equal(p.reputation.aube,0);
 const pristine=freshProfile();assert.deepEqual(normalizeProfile(pristine).deck,pristine.deck);
});
test('import requires valid ownership, safe numeric currency, and preserves a valid profile',()=>{
 const p=freshProfile();assert.equal(validateImportedProfile(p).gold,p.gold);
 for(const change of [x=>x.gold='1000',x=>x.shards=-1,x=>x.collection.militia='x',
  x=>x.deck.push('unknown-card'),x=>x.collection.militia=0,x=>x.deck.length=4]){
  const bad=JSON.parse(JSON.stringify(p));change(bad);
  assert.throws(()=>validateImportedProfile(bad));
 }
});
test('a completed unclaimed battle persists for recovery and cannot be rewarded twice from the same saved state',()=>{
 const cache=mock(),b=createBattle(freshProfile(),CAMPAIGN[0],317);
 b.heroes.e.hp=0;b.status='victory';b.phase='finished';b.settlementId='receipt-test';
 assert.equal(storeBattle(b),true);assert.equal(restoreBattle().status,'victory');
 assert.equal(JSON.parse(cache[BATTLE_KEY]).vfx,undefined);
 b.rewardGiven=true;assert.equal(storeBattle(b),true);assert.equal(restoreBattle(),null);
});
test('historical active 3x5 saves resume, malformed heroes and units are rejected nondestructively',()=>{
 const original=JSON.parse(readFileSync(new URL('./fixtures/refactor_baseline_v24.json',import.meta.url)))
  .map(entry=>JSON.parse(entry.battle)).find(b=>b.status==='active');
 const cache=mock();assert.equal(storeBattle(original),true);assert.deepEqual(restoreBattle(),original);
 cache[SAVE_KEY]=JSON.stringify(freshProfile());
 for(const damage of [b=>b.heroes.p.hand=null,b=>b.heroes.e.hp='bad',b=>b.board[0][1]={id:'not-a-card',side:'p',hp:1},
  b=>b.heroes.p.deck=['missing-id'],b=>b.round='one']){
  const bad=JSON.parse(JSON.stringify(original));damage(bad);cache[BATTLE_KEY]=JSON.stringify(bad);
  assert.equal(restoreBattle(),null);assert.ok(cache[BATTLE_KEY]);
 }
 assert.equal(loadProfile().gold,110);
});
test('localStorage save errors are reported by return values, not swallowed as success',()=>{
 mock();localStorage.setItem=()=>{throw Error('quota');};
 assert.equal(saveProfile(freshProfile()),false);
 const b=createBattle(freshProfile(),CAMPAIGN[0],9);
 assert.equal(storeBattle(b),false);
});
