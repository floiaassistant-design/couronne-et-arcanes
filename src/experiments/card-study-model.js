// Fixture de revue : le vrai moteur résout le tour ; cet extrait ne touche aucun profil.
import {CARDS} from '../data.js';
import {freshProfile} from '../engine/profile.js';
import {createBattle,endPlayerTurn} from '../engine/battle.js';
import {unitStats} from '../engine/unit-stats.js';

export const STUDY_KEY='couronnes_arcanes_essai_cartes_v1';
export const STUDY_IDS=['militia','shield','archer','cleric','paladin','banner'];
export const STUDY_PRESETS={
 balanced:{p:['archer','shield','cleric'],e:['militia','paladin','banner']},
 assault:{p:['paladin','archer','banner'],e:['shield','militia','cleric']},
 support:{p:['militia','cleric','archer'],e:['banner','shield','paladin']}
};
export function createStudy(preset='balanced'){
 const teams=STUDY_PRESETS[preset]||STUDY_PRESETS.balanced;
 const b=createBattle(freshProfile(),{id:'study-cards',name:'Le duel des Serments',enemy:'Les Échos de l’Aube',difficulty:3,hp:26,deck:[]},20261020);
 b.studyPreset=STUDY_PRESETS[preset]?preset:'balanced';
 for(const side of ['p','e'])Object.assign(b.heroes[side],{hand:[],deck:[],discard:[],shield:0});
 for(let lane=0;lane<3;lane++)for(const side of ['p','e']){
  const id=teams[side][lane],c=CARDS[id],stats=unitStats(b,id,side);
  b.board[lane][side==='p'?5:6]={uid:b.nextUnitId++,id,side,atk:stats.atk,maxhp:stats.maxhp,hp:stats.maxhp,
   armor:c.ability==='armor'?2:0,ranged:c.ability==='ranged',ability:c.ability,stun:0,poison:0,poisonTurns:0};
 }
 return b;
}
export function resolveStudy(b){
 const before=structuredClone(b);delete before.vfx;
 b.vfx=[];
 try{
  endPlayerTurn(b);
  return {before,after:structuredClone({...b,vfx:undefined}),events:[...b.vfx]};
 }finally{delete b.vfx;}
}
// Lecture des PV d'affichage, pour les SEULS événements de cette fixture sans sorts.
// Le moteur reste seul autoritaire. Un écart impose le rendu de son état final.
export function studySteps({before,events}){
 const frame=structuredClone(before),steps=[];
 for(const event of events){
  const e={...event},row=frame.board[e.lane];if(!row)continue;
  if(e.type==='move'){row[e.to]=row[e.from];row[e.from]=null;e.label='Avancée vers la couronne';}
  if(e.type==='attack'){
   const attacker=row[e.from],defender=row[e.to];
   e.sourceUid=attacker?.uid;e.targetUid=defender?.uid;
   e.cardId=attacker?.id;e.label=e.riposte?'Riposte':e.ranged?'Carreau d’arbalète':attacker?.id==='shield'?'Coup de bouclier':'Frappe';
   if(defender){
    const raw=e.riposte?e.damage:Math.max(1,e.damage-(defender.armor||0));
    e.actual=Math.min(defender.hp,raw);defender.hp=Math.max(0,defender.hp-raw);
   }else{
    const side=e.side==='p'?'e':'p',hero=frame.heroes[side];
    e.heroSide=side;e.actual=Math.min(hero.hp,e.damage);hero.hp=Math.max(0,hero.hp-e.damage);
   }
  }
  if(e.type==='heal'){
   const u=row[e.col];if(u){e.actual=Math.min(2,u.maxhp-u.hp);u.hp+=e.actual;e.targetUid=u.uid;e.cardId=u.id;e.label='Lumière de soin';}
  }
  if(e.type==='death'){e.targetUid=row[e.col]?.uid;row[e.col]=null;e.label='Carte vaincue';}
  steps.push({event:e,frame:structuredClone(frame)});
 }
 return steps;
}
export function validStudy(b){
 return b?.missionId==='study-cards'&&Number.isInteger(b.round)&&b.round>=1&&b.round<=36&&
  ['active','victory','defeat'].includes(b.status)&&['p','e'].every(s=>Number.isFinite(b.heroes?.[s]?.hp)&&Number.isFinite(b.heroes[s].maxhp))&&
  Array.isArray(b.board)&&b.board.length===3&&b.board.every(row=>Array.isArray(row)&&row.length===12&&row.every(u=>
   u===null||STUDY_IDS.includes(u.id)&&['p','e'].includes(u.side)&&Number.isFinite(u.hp)&&u.hp>0));
}
