// L'achat est adopté seulement après sauvegarde ; la confirmation ne se rejoue pas.
import {previewCardPack,buyCardPack} from '../engine/card-packs.js';
import {cardPackConfirmation,cardPackResult} from './card-packs.js';

export function createCardPackController(getState,{btn,cardUI,esc,showModal,hideModal,commitProfile,refresh,toast,random=()=>Math.random()}){
 let pending=null,showing=false;
 function purchase(id){
  if(showing)return;
  const {profile,battle}=getState(),next=structuredClone(profile),result=buyCardPack(next,id,random,battle);
  hideModal();
  if(!result.ok){toast(result.reason);return;}
  if(!commitProfile(next)){toast('Ouverture non enregistrée : aucun or dépensé. Vérifiez le stockage local.');return;}
  refresh();showing=true;showModal(cardPackResult(previewCardPack(next,id).pack,result.cards,{btn,cardUI,esc}));
 }
 return function handleCardPack(action,{id}={}){
  if(action==='buy-pack'){pending=null;purchase('mystic');return true;}
  if(action==='card-pack-preview'){
   pending=null;const {profile,battle}=getState(),plan=previewCardPack(profile,id,battle);
   if(!plan.ok){toast(plan.reason);return true;}
   showing=false;pending=id;showModal(cardPackConfirmation(plan.pack,{btn,esc}));return true;
  }
  if(action==='card-pack-confirm'){
   if(!pending)return true;const selected=pending;pending=null;purchase(selected);return true;
  }
  if(action!=='close-inspection'){pending=null;showing=false;}
  return false;
 };
}
