import test from 'node:test';
import assert from 'node:assert/strict';
import {freshProfile,normalizeProfile,validateDeck,DECK_STYLES,proposeDeck,applyDeckStyle,deckOverview} from '../src/engine.js';
import {CARDS} from '../src/data.js';

const styles=Object.keys(DECK_STYLES);
test('V2.6 four real deck archetypes exist with accessible descriptions',()=>{
 assert.deepEqual(styles,['equilibre','assaut','rempart','arcanes']);
 for(const style of Object.values(DECK_STYLES))assert.ok(style.name&&style.description);
});
test('V2.6 presets are deterministic and never modify profile on preview',()=>{
 const p=freshProfile(),before=structuredClone(p);
 for(const style of styles){
  const a=proposeDeck(p,style),b=proposeDeck(p,style);
  assert.equal(a.ok,true,style);assert.deepEqual(a,b,style);
  assert.equal(validateDeck({...p,deck:a.deck}),'',style);
  assert.ok(a.deck.length>=12&&a.deck.length<=24,style);
 }
 assert.deepEqual(p,before);
});
test('V2.6 every proposed card is owned, even with unusual collections',()=>{
 const p=freshProfile();
 p.collection={militia:2,archer:2,firebolt:1,wolf:3,shield:2,thorn:2,healing:2,dragon:1,storm:1,sentinel:1};
 for(const style of styles){const proposal=proposeDeck(p,style);assert.equal(proposal.ok,true);
  const uses=deckOverview(proposal.deck).counts;
  for(const [id,n] of Object.entries(uses))assert.ok(n<=p.collection[id],`${style}: ${id} overdrawn`);
  assert.ok(proposal.deck.every(id=>CARDS[id]));
 }
});
test('V2.6 genuinely different strategies from starting collection',()=>{
 const p=freshProfile();const assault=proposeDeck(p,'assaut'),defense=proposeDeck(p,'rempart'),magic=proposeDeck(p,'arcanes');
 assert.notDeepEqual(assault.deck,defense.deck);
 assert.notDeepEqual(magic.deck,assault.deck);
 // Les anciennes cartes à délai 0 ont maintenant un délai 1 : elles sont
 // toujours immédiatement jouables. Distinguer Assaut par sa puissance offensive,
 // et contrôler séparément que l'indicateur « rapide » suit bien ce nouveau seuil.
 const avgAttack=deck=>{
  const units=deck.map(id=>CARDS[id]).filter(c=>c.type==='unité');
  return units.reduce((sum,c)=>sum+c.attack,0)/units.length;
 };
 assert.ok(avgAttack(assault.deck)>avgAttack(defense.deck),'assault privilégie les attaquants plus puissants');
 for(const proposal of [assault,defense]){
  assert.equal(proposal.overview.quick,proposal.deck.filter(id=>CARDS[id].type==='unité'&&CARDS[id].delay===1).length);
 }
 assert.ok(defense.overview.guards>assault.overview.guards,'defense uses more guards');
 assert.ok(magic.overview.spells>assault.overview.spells,'magic uses more spells');
});
test('V2.6 applying a preset changes only the deck and spends no resources',()=>{
 const p=freshProfile(),before=structuredClone(p);
 const result=applyDeckStyle(p,'assaut');assert.equal(result.ok,true);
 assert.deepEqual(p.deck,result.deck);
 const {deck:ignored,...other}=p,{deck:ignoredOld,...others}=before;
 assert.deepEqual(other,others);
});
test('V2.6 unusable collection or unknown strategy cannot destroy a custom deck',()=>{
 const p=freshProfile();p.collection={militia:2,firebolt:2};const original=[...p.deck];
 assert.equal(proposeDeck(p,'rempart').ok,false);
 assert.equal(applyDeckStyle(p,'rempart').ok,false);
 assert.equal(applyDeckStyle(p,'invalid').ok,false);
 assert.deepEqual(p.deck,original);
});
test('V2.6 handles saves from V1 and avoids unknown or fractional card counts',()=>{
 const p=normalizeProfile({collection:{militia:9.7,healing:3,shield:3,unknown:30,dragon:Infinity},deck:['militia']});
 for(const style of styles){const proposal=proposeDeck(p,style);assert.ok(proposal.ok);assert.ok(!proposal.deck.includes('unknown'));
  assert.ok(proposal.deck.filter(id=>id==='militia').length<=9);
  assert.ok(!proposal.deck.includes('dragon'));
 }
});
test('V2.6 never forces spell cards if user owns only units',()=>{
 const p=freshProfile();p.collection={militia:12,shield:4};
 for(const style of styles){const result=proposeDeck(p,style);assert.ok(result.ok);assert.equal(result.overview.spells,0);assert.equal(result.deck.length,Math.min(16,DECK_STYLES[style].size));}
});
test('V2.6 after applying a deck, player can still edit and use core battles',async()=>{
 const p=freshProfile();applyDeckStyle(p,'rempart');
 const {modifyDeck,createBattle}=await import('../src/engine.js');
 assert.ok(modifyDeck(p,'militia',1)||modifyDeck(p,'shield',-1));
 assert.equal(validateDeck(p),'');
 const {CAMPAIGN}=await import('../src/data.js');
 const battle=createBattle(p,CAMPAIGN[0],26);
 assert.equal(battle.status,'active');
});
