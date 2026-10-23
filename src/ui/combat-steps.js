// Lecture pure des événements publics : aucune règle de combat recalculée.
import {CARDS} from '../data.js';
const unitName=u=>CARDS[u?.id]?.name||'Unité';
const crown=side=>side==='p'?'Votre couronne':'Couronne adverse';
const at=(frame,lane,col)=>frame.board[lane]?.[col];
const units=frame=>frame.board.flat().filter(Boolean);
export function unitEffectChanges(prev,u){
 const effects=[];
 if(u.atk!==prev.atk)effects.push(`${u.atk>prev.atk?'+':''}${u.atk-prev.atk} ATQ`);
 if(u.stun!==prev.stun)effects.push(u.stun>0?`Immobilisation ${u.stun}`:'Immobilisation terminée');
 if(u.poisonTurns!==prev.poisonTurns)effects.push(u.poisonTurns>0?`Poison ${u.poisonTurns}`:'Poison terminé');
 if(u.silenceUntil!==prev.silenceUntil)effects.push(Number.isFinite(u.silenceUntil)?'Silence':'Silence terminé');
 if(u.rallyUntil!==prev.rallyUntil)effects.push('Ralliement +1 ATQ');
 return effects;
}


export function frameChanges(before,after) {
 const old=new Map(units(before).map(u=>[u.uid,u])),changes=[];
 for(let lane=0;lane<after.board.length;lane++)for(let col=1;col<after.board[lane].length-1;col++){
  const u=at(after,lane,col),prev=old.get(u?.uid);if(!u||!prev)continue;
  const hp=u.hp-prev.hp,barrier=(u.barrier||0)-(prev.barrier||0);
  const effects=unitEffectChanges(prev,u);
  if(hp||barrier||effects.length)changes.push({lane,col,side:u.side,name:unitName(u),hp,shield:barrier,...(effects.length?{effects}:{} )});
 }
 for(const side of ['p','e']){
  const hp=after.heroes[side].hp-before.heroes[side].hp,shield=after.heroes[side].shield-before.heroes[side].shield;
  if(hp||shield)changes.push({hero:true,side,name:crown(side),hp,shield});
 }
 return changes;
}
function changeText(c) {
 return c.name+' : '+[c.hp?`${c.hp>0?'+':'−'}${Math.abs(c.hp)} PV`:'',c.shield?`${c.shield>0?'+':'−'}${Math.abs(c.shield)} protection`:'',...(c.effects||[])].filter(Boolean).join(', ');
}
function describe(e,before,after,changes) {
 const source=unitName(at(before,e.fromLane??e.lane,e.from)),target=at(before,e.lane,e.to??e.col);
 const targetName=target?unitName(target):(e.to===0?crown('p'):crown('e'));
 const line=Number.isInteger(e.lane)?` · ligne ${e.lane+1}`:'';
 const titles={spawn:`${e.side==='e'?'L’IA invoque':'Vous invoquez'} ${unitName(at(after,e.lane,e.col))}`,
  move:`${source} avance de ${e.from} à ${e.to}`,attack:`${e.riposte?'Riposte':e.charged?'Charge':e.magic?'Attaque magique':e.ranged?'Tir à distance':'Attaque'} : ${source} → ${targetName}`,
  spell:`${e.side==='e'?'Sort adverse':'Votre sort'}${e.name?' : '+e.name:''}`,power:'Pouvoir du souverain',
  damage:changes.length?'Dégâts subis':'Coup absorbé', 'hero-damage':changes.length?'Couronne touchée':'Coup absorbé par la couronne',
  death:`${unitName(at(before,e.lane,e.col))} est vaincu`,heal:'Soin',poison:'Poison',
  teleport:`${source} change de ligne`,silence:'Capacité réduite au silence',
  'trap-place':'Piège posé','trap-trigger':'Piège déclenché','trap-expire':'Piège expiré',state:'Soutiens et effets de fin d’action'};
 const protection=e.armor>0?` · armure : ${e.armor}`:'';
 return (titles[e.type]||'Effet de combat')+line+(changes.length?' — '+changes.map(changeText).join(' · '):'')+protection;
}
const damageType=type=>type==='damage'||type==='hero-damage';
export function buildCombatSteps(events,before,after) {
 const steps=[];let current=before;
 for(let i=0;i<events.length;i++){
  const event=events[i];if(!event.frame)continue;
  let frame=event.frame,armor=event.armor||0;
  if(event.type==='spell'){
   const end=events.findIndex((e,n)=>n>i&&e.type==='spell-resolved');
   if(end>=0){
    for(let n=i+1;n<=end;n++)armor+=events[n].armor||0;
    frame=events[end].frame;i=end;
   }
  }

  // Une frappe et ses dégâts constituent une seule action lisible, y compris l'éclaboussure.
  if(['attack','spell','power'].includes(event.type))while(damageType(events[i+1]?.type)){
   const damage=events[++i];frame=damage.frame;armor+=damage.armor||0;
  }
  const changes=frameChanges(current,frame),e={...event,armor};
  const source=at(current,e.fromLane??e.lane,e.from);
  e.faction=CARDS[e.cardId||source?.id]?.faction;
  e.sourceId=e.cardId||source?.id;
  if(e.type==='power'){
   const c=changes.find(c=>c.hp<0)||changes[0];
   if(c){e.side='p';e.lane=c.lane??0;e.to=c.hero?(c.side==='p'?0:frame.board[0].length-1):c.col;}
   else if(['gardien','clerc'].includes(e.variant)){e.side='p';e.to=0;}
  }
  steps.push({...e,frame,changes,label:describe(e,current,frame,changes)});current=frame;
 }
 if(JSON.stringify(current)!==JSON.stringify(after)){
  const changes=frameChanges(current,after),e={type:'state'};
  steps.push({...e,frame:after,changes,label:describe(e,current,after,changes)});
 }
 return steps;
}
