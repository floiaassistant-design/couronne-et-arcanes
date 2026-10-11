import test from 'node:test';
import assert from 'node:assert/strict';
import {CAMPAIGN,CARDS,CLASS_SKILLS} from '../src/data.js';
import {freshProfile,normalizeProfile,validateDeck,changeHeroClass,modifyDeck,learnClassSkill,createBattle,playPlayerCard,proposeDeck,heroLevel,HERO_LEVEL_THRESHOLD} from '../src/engine.js';

const ids=Object.keys(CLASS_SKILLS);
function combat(hero,id,seed=98){
 const p=freshProfile();p.heroClass=hero;p.collection[id]=1;p.deck[p.deck.length-1]=id;
 assert.equal(validateDeck(p),'');
 const b=createBattle(p,CAMPAIGN[0],seed);
 b.heroes.p.hand=[{id,wait:0}];b.heroes.p.deck=[];b.heroes.p.discard=[];
 b.heroes.e.hand=[];b.heroes.e.deck=[];b.heroes.e.discard=[];
 return b;
}
function unit(id,side,uid,hp=6,maxhp=8,armor=0){
 return {id,side,uid,hp,maxhp,atk:3,armor,ranged:false,ability:'',stun:0,poison:0,poisonTurns:0};
}
test('V2.8 eight unique exclusive skills extend the 60 existing cards',()=>{
 assert.equal(Object.keys(CARDS).length,74);assert.equal(ids.length,8);
 assert.equal(new Set(ids).size,8);
 for(const id of ids){
  assert.equal(CARDS[id].heroClass,CLASS_SKILLS[id].hero);
  assert.equal(CARDS[id].type,'sort');
  assert.ok([3,6].includes(CLASS_SKILLS[id].level));
  assert.ok(CARDS[id].ability.startsWith('spell_'));
 }
});
test('V2.8 skills unlock once using earned shards and levels, no reset for legacy profiles',()=>{
 const p=normalizeProfile({...freshProfile(),gold:321,shards:200,heroXp:HERO_LEVEL_THRESHOLD(6)});
 assert.equal(heroLevel(p),6);
 const priorGold=p.gold,oldCollection={...p.collection};
 const first=learnClassSkill(p,'skill_guard_wall');
 assert.equal(first.ok,true);assert.equal(p.shards,170);assert.equal(p.gold,priorGold);
 assert.equal(p.collection.skill_guard_wall,1);
 assert.equal(learnClassSkill(p,'skill_guard_wall').ok,false);
 assert.equal(p.collection.skill_guard_wall,1);
 assert.equal(learnClassSkill(p,'nonexistent').ok,false);
 assert.equal(Object.keys(p.collection).length,Object.keys(oldCollection).length+1);
 const reloaded=normalizeProfile(JSON.parse(JSON.stringify(p)));
 assert.equal(reloaded.collection.skill_guard_wall,1);
 assert.equal(reloaded.gold,priorGold);
 assert.equal(reloaded.shards,170);
});
test('V2.8 skills cannot be learned too early or without enough shards',()=>{
 const p=freshProfile();
 assert.equal(learnClassSkill(p,'skill_guard_wall').ok,false);
 p.heroXp=HERO_LEVEL_THRESHOLD(3);p.shards=29;
 assert.equal(learnClassSkill(p,'skill_guard_wall').ok,false);
 assert.equal(p.collection.skill_guard_wall,undefined);
 p.shards=100;
 assert.equal(learnClassSkill(p,'skill_guard_rally').ok,false);
});
test('V2.8 class restrictions apply to deck edits, validation, switching and battle',()=>{
 const p=freshProfile();p.collection.skill_guard_wall=1;
 assert.equal(modifyDeck(p,'skill_arc_freeze',1),false);
 assert.equal(modifyDeck(p,'skill_guard_wall',1),true);
 assert.equal(validateDeck(p),'');
 assert.equal(changeHeroClass(p,'arcaniste').ok,false);
 assert.equal(p.heroClass,'gardien');
 assert.equal(modifyDeck(p,'skill_guard_wall',-1),true);
 assert.equal(changeHeroClass(p,'arcaniste').ok,true);
 assert.equal(p.heroClass,'arcaniste');
 const legacy=normalizeProfile({...p,heroClass:'gardien',deck:[...p.deck.slice(0,17),'skill_arc_freeze'],collection:{...p.collection,skill_arc_freeze:1}});
 assert.match(validateDeck(legacy),/réservée/);
 const b=combat('gardien','skill_guard_wall');b.heroes.p.hand=[{id:'skill_arc_freeze',wait:0}];
 assert.equal(playPlayerCard(b,0,0).ok,false);assert.equal(b.heroes.p.cardsPlayed,0);
});
test('V2.8 automatic decks never include skills of another class',()=>{
 const p=freshProfile();for(const id of ids)p.collection[id]=1;
 for(const style of ['equilibre','assaut','rempart','arcanes']){
  const d=proposeDeck(p,style);
  assert.equal(d.ok,true);
  assert.ok(d.deck.every(id=>!CARDS[id].heroClass||CARDS[id].heroClass==='gardien'));
 }
});
test('V2.8 empty targets reject without consuming cards or actions',()=>{
 for(const [hero,id] of [['gardien','skill_guard_wall'],['gardien','skill_guard_rally'],['arcaniste','skill_arc_freeze'],['arcaniste','skill_arc_chain'],['rodeur','skill_ranger_pierce'],['clerc','skill_cleric_light'],['clerc','skill_cleric_bless']]){
  const b=combat(hero,id);
  assert.equal(playPlayerCard(b,0,0).ok,false,id);
  assert.equal(b.heroes.p.cardsPlayed,0,id);
  assert.equal(b.heroes.p.hand.length,1,id);
 }
});
test('V2.8 guardian barrier absorbs damage and rally remains bounded',()=>{
 const b=combat('gardien','skill_guard_wall');
 b.board[0][1]=unit('militia','p',1,6,8,0);
 assert.equal(playPlayerCard(b,0,0).ok,true);
 assert.equal(b.board[0][1].barrier,2);
 const rally=combat('gardien','skill_guard_rally');
 rally.board[0][1]=unit('militia','p',1);
 assert.equal(playPlayerCard(rally,0,0).ok,true);
 assert.equal(rally.board[0][1].rallyUntil,2);
 assert.equal((rally.board[0][1].rallyUntil>=1),true);
 assert.equal((rally.board[0][1].rallyUntil>=3),false);
 const restored=JSON.parse(JSON.stringify(b));assert.equal(restored.board[0][1].barrier,2);
});
test('V2.8 mage freeze and chain effects damage distinct targets',()=>{
 const freeze=combat('arcaniste','skill_arc_freeze');
 freeze.board[1][3]=unit('wolf','e',2,5);
 assert.equal(playPlayerCard(freeze,0,1).ok,true);
 assert.equal(freeze.board[1][3].hp,4);assert.equal(freeze.board[1][3].stun,2);
 const chain=combat('arcaniste','skill_arc_chain');
 chain.board[0][2]=unit('wolf','e',2,6);
 chain.board[0][4]=unit('treant','e',3,6);
 assert.equal(playPlayerCard(chain,0,0).ok,true);
 assert.equal(chain.board[0][2].hp,3);assert.equal(chain.board[0][4].hp,4);
});
test('V2.8 ranger pierces armor and preparation draws after spell leaves hand',()=>{
 const pierce=combat('rodeur','skill_ranger_pierce');
 pierce.board[0][2]=unit('golem','e',2,8,8,3);
 assert.equal(playPlayerCard(pierce,0,0).ok,true);
 assert.equal(pierce.board[0][2].hp,3);
 const focus=combat('rodeur','skill_ranger_draw');
 focus.heroes.p.deck=['militia','wolf','archer'];
 assert.equal(playPlayerCard(focus,0,0).ok,true);
 assert.equal(focus.heroes.p.hand.length,2);
 assert.equal(focus.heroes.p.discard[0],'skill_ranger_draw');
 assert.equal(focus.heroes.p.cardsPlayed,1);
});
test('V2.8 cleric light heals wounded allies and blessing shields one unit',()=>{
 const light=combat('clerc','skill_cleric_light');
 light.board[0][1]=unit('militia','p',1,2,8);
 light.board[0][2]=unit('shield','p',2,5,8);
 assert.equal(playPlayerCard(light,0,0).ok,true);
 assert.equal(light.board[0][1].hp,5);assert.equal(light.board[0][2].hp,8);
 const bless=combat('clerc','skill_cleric_bless');
 bless.board[1][1]=unit('militia','p',1,7,8);
 bless.board[1][2]=unit('shield','p',2,3,8);
 assert.equal(playPlayerCard(bless,0,1).ok,true);
 assert.equal(bless.board[1][1].barrier,undefined);
 assert.equal(bless.board[1][2].barrier,4);
});
test('V2.8 each skill obeys cooldown and two card actions limit',()=>{
 const b=combat('gardien','skill_guard_wall');
 b.board[0][1]=unit('militia','p',1);
 b.heroes.p.hand=[{id:'skill_guard_wall',wait:1},{id:'militia',wait:0}];
 assert.equal(playPlayerCard(b,0,0).ok,false);
 assert.equal(b.heroes.p.cardsPlayed,0);
 b.heroes.p.hand[0].wait=0;b.heroes.p.cardsPlayed=2;
 assert.equal(playPlayerCard(b,0,0).ok,false);
 assert.equal(b.board[0][1].barrier,undefined);
});
