// Fusion déterministe des seuls exemplaires libres, après revérification complète.
import {CARDS,CAMPAIGN} from '../data.js';
import {evolutionFusion} from '../evolution-fusion.js';
import {resolveUnitDefinition,unitVersionPlayable} from '../cards/definitions.js';
import {cardReference,cardKey,ownedCardCopies} from '../cards/references.js';
import {evolutionTrial} from '../evolution-trials.js';

export function previewEvolutionFusion(profile,id,battle=null){
 const recipe=evolutionFusion(id);if(!recipe)return {ok:false,reason:'Recette d’évolution inconnue.'};
 const source=cardReference({id:recipe.cardId,rarity:recipe.from}),target=cardReference({id:recipe.cardId,rarity:recipe.to});
 const owned=ownedCardCopies(profile,source),used=profile.deck.filter(ref=>cardKey(ref)===cardKey(source)).length;
 const available=owned-used,output=ownedCardCopies(profile,target),definition=resolveUnitDefinition(target);
 const state={recipe,source,target,owned,used,available,output};
 let reason='';
 if(battle&&(!battle.rewardGiven||battle.status==='active'))reason='Terminez le combat et récupérez son résultat avant de fusionner.';
 else if(!definition||!unitVersionPlayable(target)||definition.pendingDecisions.length)reason='Cette évolution n’est pas disponible.';
 else if(!Number.isSafeInteger(owned)||owned<0||owned>100000||!Number.isSafeInteger(output)||output<0||output>=100000)reason='Quantité d’exemplaires invalide ou limite atteinte.';
 else if(!profile.completed.includes(recipe.mission)){
  const mission=CAMPAIGN.find(m=>m.id===recipe.mission);
  reason=`Vaincre ${mission.enemy} dans « ${mission.name} » pour accéder à ce rang.`;
 }else if(recipe.ascension&&!profile.completedTrials?.includes(recipe.ascension))reason=`Réussir l’ascension « ${evolutionTrial(recipe.ascension).name} » pour débloquer ces fusions.`;
 else if(available<recipe.copies)reason=`Il faut ${recipe.copies} exemplaires ${recipe.from} libres : ${Math.max(0,available)} disponibles, ${used} dans le deck.`;
 return {...state,ok:!reason,reason};
}

export function fuseEvolutionCopies(profile,id,battle=null){
 const plan=previewEvolutionFusion(profile,id,battle);if(!plan.ok)return plan;
 const {recipe,source,target,owned,output}=plan;
 if(typeof source==='string')profile.collection[source]=owned-recipe.copies;
 else profile.evolvedCollection[cardKey(source)]=owned-recipe.copies;
 profile.evolvedCollection??={};profile.evolvedCollection[cardKey(target)]=output+1;
 return {ok:true,source,target,consumed:recipe.copies,name:CARDS[recipe.cardId].name};
}
