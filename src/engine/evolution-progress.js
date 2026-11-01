// Épreuves : accès, création d'un combat normal et transformation unique.
import {CARDS,CAMPAIGN,FACTIONS} from '../data.js';
import {evolutionTrial,ALL_EVOLUTION_TRIALS} from '../evolution-trials.js';
import {cardReference,cardKey,cardId,cardRarity,ownedCardCopies} from '../cards/references.js';
import {createBattle} from './battle.js';
import {validateDeck} from './profile.js';
import {createTrialChallenge,trialObjectiveState} from './trial-objectives.js';
import {CARD_RARITIES} from '../cards/schema.js';

export const trialSource=t=>cardReference({id:t.cardId,rarity:t.from});
export const trialReward=t=>cardReference({id:t.cardId,rarity:t.to});
export function evolutionTrialAccess(profile,id,battle=null){
 const t=evolutionTrial(id);if(!t)return {ok:false,reason:'Épreuve inconnue.'};
 if(profile.completedTrials?.includes(id))return {ok:false,completed:true,reason:t.kind==='ascension'?'Ascension déjà accomplie : fusions débloquées.':'Évolution déjà obtenue : une seule récompense par épreuve.'};
 if(battle&&(battle.status==='active'||!battle.rewardGiven))return {ok:false,reason:'Terminez le combat et récupérez son résultat avant de commencer une épreuve.'};
 const mission=CAMPAIGN.find(m=>m.id===t.mission);
 if(!profile.completed.includes(t.mission))return {ok:false,reason:`Vaincre ${mission.enemy} dans « ${mission.name} ».`};
 if(t.previous&&!profile.completedTrials?.includes(t.previous))return {ok:false,reason:`Terminer l’épreuve « ${evolutionTrial(t.previous).name} ».`};
 if(t.kind==='ascension'){
  const allies=profile.deck.filter(ref=>CARDS[cardId(ref)]?.faction===t.faction);
  const faction=t.faction==='aube'?'l’Aube':'la '+FACTIONS[t.faction].short;
  if(!allies.some(ref=>cardRarity(ref)===t.from))return {ok:false,reason:`Ajouter au deck un personnage de ${faction} au rang ${CARD_RARITIES.find(r=>r.id===t.from).name}.`};
  if(new Set(allies.map(cardId)).size<t.goal.distinct)return {ok:false,reason:`Ajouter au deck au moins ${t.goal.distinct} personnages distincts de ${faction}.`};
  const invalid=validateDeck(profile);return invalid?{ok:false,reason:invalid}:{ok:true,trial:t};
 }
 const required=trialSource(t),name=CARDS[t.cardId].name;
 if(ownedCardCopies(profile,required)<1)return {ok:false,reason:`Posséder ${name} au rang ${t.from}.`};
 if(!profile.deck.some(ref=>cardKey(ref)===cardKey(required)))return {ok:false,reason:`Ajouter ${name} ${t.from} au deck.`};
 const invalid=validateDeck(profile);if(invalid)return {ok:false,reason:invalid};
 return {ok:true,trial:t};
}
export function createEvolutionTrial(profile,id,seed=Date.now(),currentBattle=null){
 const access=evolutionTrialAccess(profile,id,currentBattle);if(!access.ok)return access;
 const t=access.trial;
 const battle=createBattle(profile,{id:t.id,name:t.name,enemy:t.enemy,difficulty:t.difficulty,hp:t.hp,aiStyle:t.aiStyle,boss:!!t.boss,deck:t.deck,mode:'evolution-trial'},seed,{turnFlow:'alternating'});
 battle.trialChallenge=createTrialChallenge(t);
 return {ok:true,battle};
}
export function settleEvolutionTrial(profile,b){
 const t=evolutionTrial(b?.missionId);
 if(!t||b.mode!=='evolution-trial'||!['victory','defeat'].includes(b.status))return {ok:false,reason:'Ce combat ne correspond pas à une épreuve terminée.'};
 const empty={ok:true,victory:b.status==='victory',gold:0,shards:0,card:null,evolved:false};
 if(b.progressionGranted)return {...empty,reason:'Ce combat a déjà été réglé.'};
 b.progressionGranted=true;
 if(profile.completedTrials?.includes(t.id))return {...empty,reason:'Évolution déjà obtenue.'};
 if(b.status!=='victory')return {...empty,reason:'Épreuve à retenter. Aucun exemplaire consommé.'};
 if(!trialObjectiveState(b).achieved)return {...empty,reason:'Victoire, mais l’objectif de l’épreuve n’est pas rempli. Aucun exemplaire consommé.'};
 const access=evolutionTrialAccess(profile,t.id);if(!access.ok)return {...empty,reason:access.reason};
 if(t.kind==='ascension'){
  profile.completedTrials??=[];profile.completedTrials.push(t.id);
  return {...empty,unlocked:true,trial:t};
 }
 const source=trialSource(t),reward=trialReward(t),key=cardKey(source);
 // Seul un exemplaire est transformé ; le slot éventuel du deck reste en place.
 if(typeof source==='string')profile.collection[source]--;else profile.evolvedCollection[key]--;
 profile.evolvedCollection??={};
 const target=cardKey(reward);profile.evolvedCollection[target]=(profile.evolvedCollection[target]||0)+1;
 const index=profile.deck.findIndex(ref=>cardKey(ref)===key);if(index>=0)profile.deck[index]=reward;
 profile.completedTrials??=[];profile.completedTrials.push(t.id);b.progressionGranted=true;
 return {...empty,card:reward,evolved:true,from:source,trial:t};
}
export const bossEvolutionUnlocks=missionId=>ALL_EVOLUTION_TRIALS.filter(t=>(t.previous||t.kind==='ascension')&&t.mission===missionId);
