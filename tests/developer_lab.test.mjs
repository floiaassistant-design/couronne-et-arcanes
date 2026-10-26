import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CARDS} from '../src/data.js';
import {freshProfile} from '../src/engine/profile.js';
import {unitStats} from '../src/engine/unit-stats.js';
import {createBattle,playPlayerCard} from '../src/engine/battle.js';
import {freshLab,labCardStats,setLabLevel,setLabRarity,editLabDeck,createLabBattle} from '../src/engine/developer-lab.js';
import {developerLabUI} from '../src/ui/developer-lab.js';

const btn=(text,action,extra='')=>`<button data-action="${action}" ${extra}>${text}</button>`;
const esc=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');

test('Le laboratoire réutilise les 76 cartes et les règles du combat sans progresser',()=>{
 const lab=freshLab(),p=freshProfile(),original=structuredClone(p);
 assert.equal(Object.keys(CARDS).length,76);
 assert.equal(lab.decks.p.length,18);
 assert.ok(lab.decks.e.length>=12);
 const b=createLabBattle(lab,12345);
 assert.equal(b.mode,'developer');
 assert.equal(b.turnFlow,'alternating');
 assert.equal(b.board.length,2);
 assert.equal(b.heroes.p.deck.length+b.heroes.p.hand.length,18);
 assert.equal(b.heroes.e.deck.length+b.heroes.e.hand.length,lab.decks.e.length);
 assert.deepEqual(p,original);
 assert.equal(b.heroes.p.hp,26);
});

test('Les decks de test acceptent les cartes non possédées mais gardent leurs limites',()=>{
 const lab=freshLab(),id='dragon';
 assert.equal(editLabDeck(lab,'p',id,1).ok,true);
 assert.ok(lab.decks.p.includes(id));
 for(let i=0;i<5;i++)editLabDeck(lab,'p',id,1);
 assert.equal(lab.decks.p.length,24);
 assert.equal(editLabDeck(lab,'p',id,1).ok,false);
 assert.equal(editLabDeck(lab,'e','skill_guard_wall',1).ok,false);
 assert.equal(editLabDeck(lab,'p',id,-1).ok,true);
 assert.equal(editLabDeck(lab,'p','skill_guard_wall',1).ok,true);
 assert.equal(createLabBattle(lab,1).mode,'developer');
});

test('Trois niveaux existants pour les autres cartes, sans fabriquer une rareté nouvelle',()=>{
 const lab=freshLab();
 assert.equal(setLabRarity(lab,'p','dragon','divine').ok,false);
 assert.equal(setLabLevel(lab,'p','dragon',3).ok,true);
 assert.equal(labCardStats(lab,'p','dragon').atk,CARDS.dragon.attack+3);
 const b=createLabBattle(lab,2);
 assert.equal(unitStats(b,'dragon','p').atk,CARDS.dragon.attack+3);
 assert.equal(unitStats(b,'dragon','e').atk,CARDS.dragon.attack);
});

test('Milicien validé : rareté et achats indépendants, pouvoirs du registre dans le moteur commun',()=>{
 const lab=freshLab();
 const base=labCardStats(lab,'p','militia');
 assert.deepEqual({atk:base.atk,hp:base.hp},{atk:2,hp:5});
 assert.equal(setLabLevel(lab,'p','militia',3).ok,true);
 assert.equal(setLabRarity(lab,'p','militia','divine').ok,true);
 assert.equal(setLabLevel(lab,'p','militia',2).ok,true);
 const exp=labCardStats(lab,'p','militia');
 assert.deepEqual({atk:exp.atk,hp:exp.hp,block:exp.definition.abilities.firstHitReduction.amount,riposte:exp.definition.abilities.riposte.damageMode},
  {atk:4,hp:10,block:3,riposte:'effective-attack'});
 const b=createLabBattle(lab,3);
 assert.deepEqual({atk:unitStats(b,'militia','p').atk,hp:unitStats(b,'militia','p').maxhp},{atk:4,hp:10});
 b.heroes.p.hand=[{id:'militia',wait:0}];
 assert.equal(playPlayerCard(b,0,0,1).ok,true);
 assert.equal(b.board[0][1].labGuard,undefined);
 assert.equal(b.board[0][1].rarity,'divine');assert.equal(b.board[0][1].cardRules,'aube-v1');
 assert.equal(setLabLevel(lab,'p','militia',0).ok,true);
 assert.equal(labCardStats(lab,'p','militia').atk,2);
 assert.equal(labCardStats(lab,'p','militia').hp,8);
 assert.equal(unitStats(createBattle(freshProfile(),{id:'01',name:'Base',enemy:'IA',hp:26,difficulty:1,deck:Array(12).fill('militia')},3),'militia','p').maxhp,5);
});

test('Les contrôles du laboratoire restent purement visuels et sont embarquables hors ligne',()=>{
 const lab=freshLab();
 const html=developerLabUI(lab,{esc,btn});
 assert.match(html,/data-action="lab-start"/);
 assert.match(html,/data-action="lab-exit"/);
 assert.match(html,/data-lab-field="rarity"/);
 assert.match(html,/data-lab-field="aiStyle"/);
 assert.match(html,/sans sauvegarde/i);
 const app=fs.readFileSync('src/app.js','utf8');
 assert.match(app,/function save\(\)\{if\(developer\)return;/);
 assert.match(app,/function persistBattle\(\)\{\s*if\(developer\)return true;/);
 assert.match(app,/if\(developer\)\{\s*if\(developer\.resultShown\)return;/);
 assert.match(fs.readFileSync('index.html','utf8'),/styles\/pages\/developer-lab\.css/);
});