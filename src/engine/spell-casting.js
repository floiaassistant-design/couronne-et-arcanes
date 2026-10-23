// Résolution des sorts existants. Les primitives de dégâts sont injectées par le combat.
import {CARDS} from '../data.js';
import {frontEnemy,spellTargetOptions} from './spell-targeting.js';
import {crownColumn} from './board.js';
import {resolveClassSkill} from './class-skills.js';
import {resolveControlSpell} from './battle-control.js';
import {resolveTempoSpell} from './tempo.js';
export function castSpell(b,side,id,lane,{emit,hit,damageHero,sweepDead,checkOutcome,note,controlHooks}){
 const c=CARDS[id],enemy=side==='p'?'e':'p',foe=frontEnemy(b,side,lane);
 let drawAfter=0;
 const supportSpell=['spell_heal','spell_buff','spell_ward'].includes(c.ability);
 const allied=b.board[lane].findIndex(u=>u&&u.side===side);
 const plan=spellTargetOptions(b,side,c).options.find(o=>o.lane===lane&&!o.error);
 const plannedCol=plan?.affected.length?b.board[lane].findIndex(u=>u?.uid===plan.affected[0]):plan?.cells[0]?.col;
 const visualTo=plannedCol>=1?plannedCol:plan?.heroes?.length?crownColumn(b,plan.heroes[0]):null;
 emit(b,{type:'spell',cardId:id,name:c.name,side,lane,from:crownColumn(b,side),to:visualTo??(supportSpell?(allied>=1?allied:crownColumn(b,side)):(foe?foe.i:crownColumn(b,enemy))),variant:c.ability,icon:c.icon});
 if(c.ability==='spell_bolt'){
  if(foe)hit(b,foe.u,4,side);else damageHero(b,enemy,2);
 }else if(c.ability==='spell_heal'){
  const hero=b.heroes[side];hero.hp=Math.min(hero.maxhp,hero.hp+5);
  b.board[lane].forEach(u=>{if(u&&u.side===side)u.hp=Math.min(u.maxhp,u.hp+2)});
 }else if(c.ability==='spell_buff'){
  b.board[lane].forEach(u=>{if(u&&u.side===side)u.atk+=2;});
 }else if(c.ability==='spell_storm'){
  b.board[lane].filter(u=>u&&u.side===enemy).forEach(u=>hit(b,u,3,side));
 }else if(c.ability==='spell_root'){
  if(foe)foe.u.stun=2;
 }else if(c.ability==='spell_ward'){
  b.heroes[side].shield=Math.min(15,b.heroes[side].shield+5);
 }else if(['spell_silence','spell_teleport','spell_trap'].includes(c.ability)){
  resolveControlSpell(b,side,c,lane,controlHooks);
 }else if(['spell_hasten','spell_slow'].includes(c.ability)){
  resolveTempoSpell(b,side,c,note);
 }else if(c.heroClass){
  drawAfter=resolveClassSkill(b,side,c,lane,hit);
 }
 emit(b,{type:'spell-resolved',side,lane});
 note(b,`${side==='p'?'Vous lancez':'L’ennemi lance'} ${c.name} (ligne ${lane+1}).`);
 sweepDead(b);
 checkOutcome(b);
 return drawAfter;
}
