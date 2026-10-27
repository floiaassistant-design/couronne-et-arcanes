import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {freshProfile,createBattle} from '../src/engine.js';
import {CLASSES,CAMPAIGN} from '../src/data.js';
import {createViews} from '../src/ui/views.js';
import {SAVE_KEY,BATTLE_KEY,PREVIOUS_GAME_KEY,saveProfile,storeBattle,loadProfile,restoreBattle,startNewAdventure,hasPreviousAdventure,restorePreviousAdventure} from '../src/ui/storage.js';

function store(){
 const values=new Map();
 return {
  values,failOn:null,
  getItem:key=>values.has(key)?values.get(key):null,
  setItem(key,value){if(this.failOn===key)throw Error('Quota simulé');values.set(key,String(value));},
  removeItem(key){if(this.failOn===key)throw Error('Quota simulé');values.delete(key);}
 };
}
test('nouvelle aventure : quatre classes, progression sauvegardée et reprise possible',()=>{
 for(const classId of Object.keys(CLASSES)){
  globalThis.localStorage=store();
  const profile=freshProfile();profile.gold=431;profile.wins=7;profile.guideSeen=true;
  const battle=createBattle(profile,CAMPAIGN[0]);
  assert.equal(saveProfile(profile),true);
  assert.equal(storeBattle(battle),true);
  assert.equal(startNewAdventure(classId),true);
  assert.equal(loadProfile().heroClass,classId);
  assert.equal(loadProfile().guideSeen,true);
  assert.equal(loadProfile().gold,110);
  assert.equal(restoreBattle(),null);
  assert.equal(hasPreviousAdventure(),true);
  assert.equal(restorePreviousAdventure(),true);
  assert.equal(loadProfile().gold,431);
  assert.equal(loadProfile().wins,7);
  assert.equal(restoreBattle().missionId,battle.missionId);
  // Le nouvel essai reste accessible : les deux emplacements s'échangent.
  assert.equal(restorePreviousAdventure(),true);
  assert.equal(loadProfile().heroClass,classId);
 }
});
test('nouvelle aventure : refus des classes inconnues sans toucher à la sauvegarde',()=>{
 globalThis.localStorage=store();
 const p=freshProfile();p.gold=987;saveProfile(p);
 assert.equal(startNewAdventure('inconnue'),false);
 assert.equal(loadProfile().gold,987);
 assert.equal(hasPreviousAdventure(),false);
});
test('erreur de stockage : progression courante conservée',()=>{
 globalThis.localStorage=store();
 const p=freshProfile();p.gold=777;saveProfile(p);
 const previous=localStorage.getItem(SAVE_KEY);
 localStorage.failOn=SAVE_KEY;
 assert.equal(startNewAdventure('clerc'),false);
 assert.equal(localStorage.getItem(SAVE_KEY),previous);
 assert.equal(localStorage.getItem(BATTLE_KEY),null);
 assert.equal(localStorage.getItem(PREVIOUS_GAME_KEY),null);
 localStorage.failOn=null;
});
test('rendu : identité de camp, Ordre, rareté et classe disponibles sans état visuel',()=>{
 const p=freshProfile(),b=createBattle(p,CAMPAIGN[0]);
 b.board[0][1]={id:'paladin',side:'p',uid:100,atk:4,hp:9,maxhp:9,armor:1};
 b.board[0][2]={id:'lich',side:'e',uid:101,atk:6,hp:9,maxhp:9,armor:0};
 const v=createViews(()=>({profile:p,battle:b,screen:'battle',selectedCard:-1,collectionFilter:'all',collectionOwned:false,animationsEnabled:false,previousGameAvailable:true}));
 const html=v.battleUI();
 assert.match(html,/data-owner="p" data-rarity="épique"/);
 assert.match(html,/data-owner="e" data-rarity="légendaire"/);
 assert.match(html,/aria-label="Votre unité,/);
 assert.match(html,/aria-label="Unité adverse,/);
 assert.match(html,/Aube/);
 assert.match(html,/Ombre/);
 assert.match(html,/Contour : rareté/);
 assert.match(v.cardUI('dragon'),/card-quality-tag[^>]*>LÉGENDAIRE/);
 assert.match(v.homeUI(),/data-action="new-game"/);
 assert.match(v.homeUI(),/data-action="restore-previous-game"/);
});
test('six contours de rareté déclarés et contrôle séparé du camp',()=>{
 const css=readFileSync(new URL('../styles/cards/rarity.css',import.meta.url),'utf8')+readFileSync(new URL('../styles/battle/board.css',import.meta.url),'utf8');
 for(const rarity of ['commun','rare','épique','légendaire','divine','éveillée']){
  assert.ok(css.includes(':is(.unit-card,.board-card,.card-preview,.lab-card-preview)[data-rarity="'+rarity+'"]'));
  if(['rare','épique','légendaire'].includes(rarity))assert.ok(css.includes('.arena-lofi .unit-on-board[data-rarity="'+rarity+'"]'));
 }
 assert.match(css,/\.arena-lofi \.unit-on-board\[data-owner="e"\]/);
});
