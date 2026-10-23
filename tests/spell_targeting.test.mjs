import test from 'node:test';
import assert from 'node:assert/strict';
import {freshProfile,createBattle,playPlayerCard,previewPlayerSpell} from '../src/engine.js';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {spellTargetOptions,spellTargetAt,SPELL_TARGET_MODES} from '../src/engine/spell-targeting.js';
import {createSpellController} from '../src/ui/spell-controller.js';
import {captureCombatFrame} from '../src/engine/combat-events.js';
import {buildCombatSteps} from '../src/ui/combat-steps.js';
import {combatEffectProfile} from '../src/ui/combat-effects.js';
const unit=(uid,side,extra={})=>({uid,id:'wolf',side,atk:4,hp:4,maxhp:8,armor:2,barrier:1,ranged:false,ability:'haste',stun:0,poison:0,poisonTurns:0,...extra});
function make(id,legacy=false){
 const b=createBattle(freshProfile(),CAMPAIGN[0],71,{turnFlow:'alternating'});
 if(legacy)b.board=Array.from({length:3},()=>Array(7).fill(null));
 b.heroClass=CARDS[id].heroClass||'gardien';
 b.board[0][2]=unit(1,'p');b.board[0][3]=unit(2,'e');b.board[0][4]=unit(3,'e');
 b.heroes.p.hand=[{id,wait:0},{id:'militia',wait:4}];b.heroes.p.hp=10;
 b.heroes.e.hand=[{id:'militia',wait:1}];b.heroes.p.deck=['militia','militia'];
 return b;
}
test('Chaque sort du catalogue possède un contrat et un aperçu identique au vrai moteur, y compris en 3×5',()=>{
 for(const c of Object.values(CARDS).filter(c=>c.type==='sort'))for(const legacy of [false,true]){
  assert.ok(SPELL_TARGET_MODES[c.ability],c.id);
  const b=make(c.id,legacy),snapshot=JSON.stringify(b),plan=spellTargetOptions(b,'p',c);
  for(const option of plan.options){
   const preview=previewPlayerSpell(b,0,option.lane),copy=structuredClone(b),actual=playPlayerCard(copy,0,option.lane);
   assert.equal(preview.ok,actual.ok,c.id);assert.equal(!option.error,actual.ok,c.id);
   if(actual.ok)assert.deepEqual(preview.after,captureCombatFrame(copy),c.id);
   assert.equal(JSON.stringify(b),snapshot,'Aucune mutation, consommation ni graine modifiée');
   assert.equal(preview.after?.heroes.e.hand,undefined,'Aucune main privée exposée');
  }
 }
});
test('Monocible, zone, chaîne, bénédiction et silence conservent leurs restrictions réelles',()=>{
 let b=make('firebolt');
 assert.deepEqual(spellTargetOptions(b,'p',CARDS.firebolt).options[0].selectors,[2]);
 assert.equal(spellTargetAt(b,'p',CARDS.firebolt,0,3),null);
 assert.equal(spellTargetAt(b,'p',CARDS.firebolt,0,1),null);
 assert.deepEqual(spellTargetOptions(b,'p',CARDS.storm).options[0].affected,[2,3]);
 assert.deepEqual(spellTargetOptions(b,'p',CARDS.skill_arc_chain).options[0].affected,[2,3]);
 b=make('skill_cleric_bless');b.board[0][1]=unit(4,'p',{hp:1});
 assert.deepEqual(spellTargetOptions(b,'p',CARDS.skill_cleric_bless).options[0].selectors,[4]);
 assert.equal(spellTargetAt(b,'p',CARDS.skill_cleric_bless,0,1),null);
 b=make('seal_silence');b.board[0][4].ability='heal';
 assert.deepEqual(spellTargetOptions(b,'p',CARDS.seal_silence).options[0].selectors,[3]);
});
test('Aperçus : dégâts après armure/barrière, soin plafonné, protection, contrôle et fin de sort',()=>{
 for(const id of ['firebolt','healing','skill_guard_wall','entangle','storm']){
  const b=make(id);if(id==='storm')for(const u of b.board[0])if(u?.side==='e'){u.armor=0;u.barrier=0;}
  const before=captureCombatFrame(b);b.vfx=[];playPlayerCard(b,0,0);
  const steps=buildCombatSteps(b.vfx,before,captureCombatFrame(b)),spell=steps.find(s=>s.type==='spell');
  assert.ok(spell);assert.equal(spell.sourceId,id);assert.deepEqual(steps.at(-1).frame,captureCombatFrame(b));
  assert.equal(steps.some(s=>s.type==='spell-resolved'),false);
  if(id==='firebolt')assert.equal(spell.changes[0].hp,-1);
  if(id==='healing')assert.equal(spell.changes.find(c=>c.hero).hp,5);
  if(id==='skill_guard_wall')assert.equal(spell.changes[0].shield,2);
  if(id==='entangle')assert.match(spell.changes[0].effects.join(' '),/Immobilisation 2/);
  if(id==='storm')assert.equal(spell.changes.filter(c=>c.hp<0).length,2);
 }
});
test('Le contrôleur refuse une fausse cible, ne consomme rien avant confirmation et n’exécute qu’une fois',()=>{
 const battle=make('firebolt');let selectedCard=0,casts=0;
 const controller=createSpellController(()=>({battle,selectedCard}),{refresh:()=>{},closeInspection:()=>{},launch:()=>{casts++;selectedCard=-1;}});
 controller.handleSpell('spell-target',{lane:'0',unitId:'3'});assert.equal(controller.spellState().spellTarget,null);
 controller.handleSpell('spell-confirm');assert.equal(casts,0);
 controller.handleSpell('spell-target',{lane:'0',unitId:'2'});assert.equal(battle.heroes.p.hand.length,2);
 assert.equal(controller.spellState().spellPreview.ok,true);
 controller.resetSpell();assert.equal(controller.spellState().spellTarget,null);
 controller.handleSpell('spell-target',{lane:'0',unitId:'2'});
 controller.handleSpell('spell-confirm');controller.handleSpell('spell-confirm');assert.equal(casts,1);
});
test('Les effets automatiques ne demandent pas de clic de cible ; une main sans cible tempo reste interdite',()=>{
 const battle=make('sanctuary');
 const c=createSpellController(()=>({battle,selectedCard:0}),{refresh:()=>{},closeInspection:()=>{},launch:()=>{}});
 assert.equal(c.spellState().spellPreview.ok,true);
 battle.heroes.p.hand=[{id:'hourglass_surge',wait:0}];c.resetSpell();
 assert.equal(c.spellState().spellPreview,null);
});
test('Bibliothèque : contact, tir, magie et cinq identités paramétrables',()=>{
 assert.equal(combatEffectProfile({type:'attack',ranged:false,faction:'aube'}).kind,'melee');
 assert.equal(combatEffectProfile({type:'attack',ranged:true,faction:'aube'}).kind,'ranged');
 for(const faction of ['aube','sylve','ombre','forge','ether'])assert.equal(combatEffectProfile({type:'attack',magic:true,faction}).faction,faction);
 assert.equal(combatEffectProfile({type:'spell',sourceId:'sundawn'}).faction,'aube');
 assert.equal(combatEffectProfile({type:'spell',sourceId:'firebolt'}).faction,'forge');
});
test('Téléportation sur piège mortel : conserver le déplacement, les dégâts et la disparition dans leur ordre réel',()=>{
 const b=make('transposition');b.board[0][2].hp=1;b.board[0][2].armor=0;b.board[0][2].barrier=0;
 b.traps=[{owner:'e',lane:1,col:2,kind:'rune',damage:3,expiresRound:3}];
 const before=captureCombatFrame(b);b.vfx=[];playPlayerCard(b,0,1);
 const steps=buildCombatSteps(b.vfx,before,captureCombatFrame(b)),types=steps.map(s=>s.type);
 assert.ok(types.indexOf('teleport')>types.indexOf('spell'));
 assert.ok(types.indexOf('damage')>types.indexOf('teleport'));
 assert.ok(types.indexOf('death')>types.indexOf('damage'));
 assert.equal(steps.find(s=>s.type==='damage').changes[0].hp,-1);
 assert.equal(steps.find(s=>s.type==='teleport').frame.board[1][2].uid,1);
 assert.equal(steps.find(s=>s.type==='death').frame.board[1][2],null);
 assert.deepEqual(steps.at(-1).frame,captureCombatFrame(b));
});
