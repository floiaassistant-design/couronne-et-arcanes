// Contrat de sélection public. Les dégâts restent calculés uniquement par battle.js.
import {classSkillTargetError,classSkillEnemies,classSkillAllies,blessingTarget} from './class-skills.js';
import {controlTargetError,silenceTarget,teleportPlan,trapPlan} from './battle-control.js';
import {tempoTargetError} from './tempo.js';
import {laneCount,crownColumn} from './board.js';

export const SPELL_TARGET_MODES=Object.freeze({
 spell_bolt:'first',spell_root:'first',spell_storm:'enemy-line',
 spell_heal:'ally-line',spell_buff:'ally-line',spell_ward:'automatic',
 spell_guard_wall:'ally-line',spell_guard_rally:'ally-line',spell_cleric_light:'ally-line',
 spell_cleric_bless:'blessing',spell_arc_freeze:'first',spell_arc_chain:'chain',
 spell_ranger_pierce:'first',spell_ranger_draw:'automatic',
 spell_silence:'silence',spell_teleport:'destination',spell_trap:'trap',
 spell_hasten:'automatic',spell_slow:'automatic'
});
// Même ordre historique, partagé par le moteur et la sélection du joueur.
export function frontEnemy(b,side,lane){
 const list=b.board[lane].map((u,i)=>u&&u.side!==side?{u,i}:null).filter(Boolean);
 return side==='p'?list.sort((a,c)=>a.i-c.i)[0]:list.sort((a,c)=>c.i-a.i)[0];
}
export function spellTargetOptions(b,side,card){
 const mode=SPELL_TARGET_MODES[card?.ability],options=[];
 if(!mode)return {mode:null,options,reason:'Ciblage de ce sort à définir.'};
 for(let lane=0;lane<laneCount(b);lane++){
  const error=classSkillTargetError(b,side,card,lane)||controlTargetError(b,side,card,lane)||tempoTargetError(b,side,card);
  if(error){options.push({lane,error,selectors:[],affected:[],cells:[]});continue;}
  const friends=classSkillAllies(b,side,lane),foes=classSkillEnemies(b,side,lane);
  let affected=[],selectors=[],cells=[],heroes=[];
  if(mode==='first'||mode==='chain'){
   const first=frontEnemy(b,side,lane);
   selectors=first?[first.u.uid]:[];
   affected=mode==='chain'?foes.slice(0,2).map(x=>x.u.uid):selectors;
   if(!first&&card.ability==='spell_bolt')heroes=[side==='p'?'e':'p'];
  }else if(mode==='enemy-line')selectors=affected=foes.map(x=>x.u.uid);
  else if(mode==='ally-line'){
   selectors=affected=friends.map(u=>u.uid);
   if(card.ability==='spell_heal')heroes=[side];
  }else if(mode==='blessing'){
   const u=blessingTarget(b,side,lane);selectors=affected=u?[u.uid]:[];
  }else if(mode==='silence')selectors=affected=[silenceTarget(b,side,lane).u.uid];
  else if(mode==='destination'){
   const p=teleportPlan(b,side,lane);affected=[p.u.uid];cells=[{lane,col:p.col}];
  }else if(mode==='trap'){
   const p=trapPlan(b,side,lane);cells=[{lane,col:p.col}];
  }else if(mode==='automatic')heroes=[card.ability==='spell_slow'?(side==='p'?'e':'p'):side];
  options.push({lane,selectors,affected,cells,heroes,error:''});
  if(mode==='automatic')break;
 }
 return {mode,options,reason:options.every(o=>o.error)?options[0]?.error:''};
}
export function spellTargetAt(b,side,card,lane,uid=null){
 const o=spellTargetOptions(b,side,card).options.find(o=>o.lane===lane&&!o.error);
 return o&&(uid===null||o.selectors.some(x=>String(x)===String(uid)))?o:null;
}
