// Sélection transitoire : jamais ajoutée au combat ou à sa sauvegarde.
import {CARDS} from '../data.js';
import {previewPlayerSpell} from '../engine/battle.js';
import {spellTargetAt,spellTargetOptions} from '../engine/spell-targeting.js';

export function createSpellController(getContext,{refresh,launch,closeInspection}){
 let owner=null,index=-1,target=null,preview=null;
 function reset(){owner=null;index=-1;target=null;preview=null;}
 function state(){
  const {battle,selectedCard}=getContext();
  const card=CARDS[battle?.heroes.p.hand[selectedCard]?.id];
  if(!battle||battle.phase!=='player'||battle.status!=='active'||card?.type!=='sort'){
   reset();return {spellTarget:null,spellPreview:null};
  }
  if(owner!==battle||index!==selectedCard){
   reset();owner=battle;index=selectedCard;
   const plan=spellTargetOptions(battle,'p',card);
   if(plan.mode==='automatic'&&!plan.reason){target={lane:plan.options[0].lane};preview=previewPlayerSpell(battle,index,target.lane);}
  }
  return {spellTarget:target,spellPreview:preview};
 }
 function handle(action,data={}){
  if(!action.startsWith('spell-'))return false;
  state();
  if(!owner)return true;
  const card=CARDS[owner.heroes.p.hand[index]?.id];
  if(action==='spell-invalid')return true;
  if(action==='spell-confirm'){
   // Revérifier le plan et la projection à la confirmation, sans confiance dans le DOM.
   if(target&&spellTargetAt(owner,'p',card,target.lane,target.uid??null)&&previewPlayerSpell(owner,index,target.lane).ok){
    const i=index,lane=target.lane;reset();launch(i,lane);
   }
   return true;
  }
  const lane=Number(data.lane),uid=action==='spell-target'?data.unitId:null;
  if((action==='spell-lane'||action==='spell-target')&&spellTargetAt(owner,'p',card,lane,uid)){
   target={lane,...(uid!==null?{uid}:{} )};preview=previewPlayerSpell(owner,index,lane);
   closeInspection();refresh();
  }
  return true;
 }
 return {spellState:state,handleSpell:handle,resetSpell:reset};
}
