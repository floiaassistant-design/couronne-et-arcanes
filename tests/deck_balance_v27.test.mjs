import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {makeLabProfile,LAB_COLLECTIONS} from '../scripts/lib/deck_scenarios.mjs';
import {chooseSimulatedMove,simulateBattle} from '../scripts/lib/battle_runner.mjs';
import {DECK_STYLES,proposeDeck,validateDeck} from '../src/engine.js';

test('V2.7 simulation collections are only local fixtures and never mutate real profiles',()=>{
 assert.deepEqual(LAB_COLLECTIONS,['depart','progression','catalogue']);
 for(const level of LAB_COLLECTIONS){
  const p=makeLabProfile(level),q=makeLabProfile(level);
  assert.deepEqual(p,q);
  for(const id of Object.keys(p.collection))assert.ok(CARDS[id]);
  for(const style of Object.keys(DECK_STYLES)){
   const proposal=proposeDeck(p,style);
   assert.equal(proposal.ok,true,`${level}/${style}`);
   assert.equal(validateDeck({...p,deck:proposal.deck}),'');
  }
  assert.deepEqual(p,q,'Preview never changes the collection');
 }
 assert.throws(()=>makeLabProfile('unknown'),/Collection inconnue/);
});
test('V2.7 the Arcanes proposal keeps a distinct, slightly faster spell ratio',()=>{
 assert.equal(DECK_STYLES.arcanes.spells,3);
 for(const level of LAB_COLLECTIONS){
  const p=makeLabProfile(level),magic=proposeDeck(p,'arcanes'),rush=proposeDeck(p,'assaut');
  assert.equal(magic.ok,true);assert.equal(rush.ok,true);
  assert.ok(magic.overview.spells>rush.overview.spells,level);
  assert.notDeepEqual(magic.deck,rush.deck,level);
 }
});
test('V2.7 the scripted bot is deterministic and respects the real engine',()=>{
 const p=makeLabProfile('depart');
 const a=simulateBattle(p,CAMPAIGN[0],8877),b=simulateBattle(p,CAMPAIGN[0],8877);
 assert.deepEqual(a,b);
 assert.equal(typeof a.win,'boolean');assert.ok(a.turns>0);
 assert.ok(a.maxhp>0);
 assert.equal(chooseSimulatedMove({heroes:{p:{hand:[]}},board:[[],[],[]]}),null);
});
test('V2.7 the benchmark covers both classes, four decks, three collections and repeated seeds',()=>{
 const output=execFileSync(process.execPath,['scripts/deck_style_balance.mjs','--json'],{
  cwd:process.cwd(),env:{...process.env,DECK_SEEDS:'1'},encoding:'utf8',timeout:15000
 });
 const data=JSON.parse(output);
 assert.equal(data.variants,24);
 assert.equal(data.battles,24*data.encounters);
 assert.equal(data.groups.length,6);
 assert.equal(data.rows.length,24);
 assert.equal(data.byEncounter.length,24*data.encounters);
 assert.ok(data.rows.every(r=>r.wins>=0&&r.wins<=r.n&&r.deckSize>=12));
});
