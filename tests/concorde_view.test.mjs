import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {freshProfile,createBattle,playPlayerCard} from '../src/engine.js';
import {createViews} from '../src/ui/views.js';
import {boardInspectionData,cardInspectionContent,previewPosition} from '../src/ui/card-inspection.js';
import {generatedCardFace} from '../src/ui/generated-card.js';
import {collectionHoverContent} from '../src/ui/collection.js';
import {concordeDescription} from '../src/ui/concorde.js';
import {esc} from '../src/ui/markup.js';

const pairs=[['militia','shield'],['ranger','wolf'],['bone','crypt'],['smith','drill'],['spark','mystic']];
const view=(profile,battle)=>createViews(()=>({profile,battle,screen:'battle',selectedCard:-1,animationsEnabled:false}));
const countLights=html=>(html.match(/class="concorde-emblem-light"/g)||[]).length;

test('Concorde : résumé et symbole de faction pour les 53 unités, aucun bonus pour les 23 sorts',()=>{
 let units=0,spells=0;
 for(const card of Object.values(CARDS)){
  const before=JSON.stringify(card);
  const html=cardInspectionContent(card,{wait:0},null,esc);
  if(card.type==='unité'){
   units++;assert.match(html,/class="concorde-description"/);
   const symbols={aube:'☀',sylve:'❧',ombre:'☾',forge:'⚒',ether:'◇'};
   assert.match(html,new RegExp(`class="concorde-symbol"[^>]*>${symbols[card.faction]}</span> Bonus de faction : \\+1 attaque`));
   assert.equal(concordeDescription(card),'Bonus de faction : +1 attaque');
   assert.doesNotMatch(html,/elle-même compte|condition disparaît|\(inactif\)/);
  }else{
   spells++;assert.doesNotMatch(html,/concorde-description|data-concorde=|concorde-emblem-light/);
  }
  assert.equal(countLights(html),0,'La main ne constitue pas une formation');
  assert.equal(JSON.stringify(card),before);
 }
 assert.equal(units,53);assert.equal(spells,23);
});

test('Le rendu suit le moteur : camps, lignes, morts, troisième allié, Silence et Ralliement isolé',()=>{
 for(const legacy of [false,true])for(const [id,partner] of pairs){
  const profile=freshProfile(),battle=createBattle(profile,CAMPAIGN[0],71,{legacy});
  battle.heroes.p.hand=[{id,wait:0}];assert.ok(playPlayerCard(battle,0,0).ok);
  const unit=battle.board[0][1],v=view(profile,battle);
  const ally={...unit,id:partner,uid:901};
  unit.rallyUntil=battle.round;
  assert.equal(countLights(v.battleUI()),0,'Ralliement ne doit pas allumer Concorde');
  battle.board[0][2]={...ally,side:'e'};
  assert.equal(countLights(v.battleUI()),0,'Le camp adverse ne complète pas la formation');
  battle.board[0][2]=null;battle.board[1][2]=ally;
  assert.equal(countLights(v.battleUI()),0,'Une autre ligne ne complète pas la formation');
  battle.board[1][2]=null;battle.board[0][2]=ally;
  unit.silenceUntil=battle.round;
  const before=JSON.stringify({profile,battle}),html=v.battleUI();
  assert.equal(countLights(html),2,'Silence conserve le bonus passif');
  assert.doesNotMatch(html,/formation-badge/);
  const model=boardInspectionData(battle,unit.uid);
  assert.equal(model.board.concordeActive,true);assert.equal(model.stats.atk,unit.atk+2);
  const preview=cardInspectionContent(model.card,model.entry,model.stats,esc,{board:model.board});
  assert.equal(countLights(preview),1);assert.match(preview,/data-concorde-state="active"/);
  assert.match(preview,/Bonus de faction : \+1 attaque/);assert.doesNotMatch(preview,/\(inactif\)/);
  assert.equal(JSON.stringify({profile,battle}),before,'Aucun état graphique sauvegardé');
  battle.board[0][3]={...ally,uid:902};
  assert.equal(countLights(v.battleUI()),3);
  assert.equal(boardInspectionData(battle,unit.uid).stats.atk,unit.atk+2,'Pas de cumul du bonus');
  battle.board[0][3]=null;ally.hp=0;
  assert.equal(countLights(v.battleUI()),0,'Les morts ne maintiennent pas le bonus');
  battle.board[0][2]=null;
  const restored=JSON.parse(JSON.stringify(battle));
  assert.equal(countLights(view(profile,restored).battleUI()),0);
  const inactive=boardInspectionData(restored,unit.uid);
  const inactivePreview=cardInspectionContent(inactive.card,inactive.entry,inactive.stats,esc,{board:inactive.board});
  assert.match(inactivePreview,/data-concorde-state="inactive"/);assert.match(inactivePreview,/\(inactif\)/);
 }
});

test('Les deux camps affichent leur formation sans modifier les cinq champs de carte',()=>{
 const profile=freshProfile(),battle=createBattle(profile,CAMPAIGN[0],8,{legacy:true});
 battle.heroes.p.hand=[{id:'militia',wait:0}];playPlayerCard(battle,0,0);
 const u=battle.board[0][1];battle.board[0][2]={...u,id:'shield',uid:901};
 battle.board[0][4]={...u,side:'e',id:'bone',uid:902};battle.board[0][5]={...u,side:'e',id:'crypt',uid:903};
 assert.equal(countLights(view(profile,battle).battleUI()),4);
 for(const card of Object.values(CARDS)){
  const html=generatedCardFace(card,{concordeActive:true,esc});
  assert.equal(countLights(html),card.type==='unité'?1:0,card.id);
  assert.equal((html.match(/data-card-field=/g)||[]).length,card.type==='unité'?5:3,card.id);
 }
});

test('La Collection explique Concorde pour les versions définies seulement',()=>{
 const profile=freshProfile();
 assert.match(collectionHoverContent(profile,'militia','commun',esc),/concorde-description/);
 assert.match(collectionHoverContent(profile,'militia','divine',esc),/concorde-description/);
 assert.doesNotMatch(collectionHoverContent(profile,'wolf','divine',esc),/concorde-description/);
 const card={...CARDS.militia,name:'<img>'};
 assert.doesNotMatch(cardInspectionContent(card,{wait:0},null,esc),/<img>/);
});

test('La fiche agrandie réserve la barre de navigation du combat sur petit écran',()=>{
 const viewport={width:390,height:844,topInset:50};
 for(const kind of ['hand','board']){
  const pos=previewPosition({left:30,top:55,right:90,width:60,height:82},{width:312,height:760},viewport,kind);
  assert.ok(pos.top>=50);assert.ok(pos.top+760<=832);
 }
});
