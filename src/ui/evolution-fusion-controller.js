// Une confirmation = une transaction ; sauvegarder la copie avant de l'adopter.
import {previewEvolutionFusion,fuseEvolutionCopies} from '../engine/evolution-fusion.js';
import {evolutionFusionConfirmation} from './evolution-fusion.js';

export function createEvolutionFusionController(getState,{btn,cardUI,esc,showModal,hideModal,commitProfile,refresh,toast}){
 let pending=null;
 return function handleEvolutionFusion(action,{id}={}){
  if(action==='evolution-fusion-preview'){
   pending=null;const {profile,battle}=getState(),plan=previewEvolutionFusion(profile,id,battle);
   if(!plan.ok){toast(plan.reason);return true;}
   pending=id;showModal(evolutionFusionConfirmation(plan,{btn,cardUI,esc}));return true;
  }
  if(action==='evolution-fusion-confirm'){
   if(!pending)return true;
   const recipe=pending;pending=null;
   const {profile,battle}=getState(),next=structuredClone(profile),result=fuseEvolutionCopies(next,recipe,battle);
   hideModal();
   if(!result.ok){toast(result.reason);return true;}
   if(!commitProfile(next)){toast('Fusion non enregistrée : aucun exemplaire consommé. Vérifiez le stockage local.');return true;}
   refresh();toast(`${result.name} : évolution obtenue. Ajoutez-la dans Mon deck.`);return true;
  }
  if(action!=='close-inspection')pending=null;
  return false;
 };
}
