// Épreuves : accès, création d'un combat normal et transformation unique.
import {CARDS,CAMPAIGN} from '../data.js';
import {evolutionTrial,EVOLUTION_TRIALS} from '../evolution-trials.js';
import {cardReference,cardKey,ownedCardCopies} from '../cards/references.js';
import {createBattle} from './battle.js';
import {validateDeck} from './profile.js';

export const trialSource=t=>cardReference({id:t.cardId,rarity:t.from});
export const trialReward=t=>cardReference({id:t.cardId,rarity:t.to});
export function evolutionTrialAccess(profile,id){
 const t=evolutionTrial(id);if(!t)return {ok:false,reason:'Épreuve inconnue.'};
 if(profile.completedTrials?.includes(id))return {ok:false,completed:true,reason:'Évolution déjà obtenue : une seule récompense par épreuve.'};
 const mission=CAMPAIGN.find(m=>m.id===t.mission);
 if(!profile.completed.includes(t.mission))return {ok:false,reason:`Vaincre ${mission.enemy} dans « ${mission.name} ».`};
 if(t.previous&&!profile.completedTrials?.includes(t.previous))return {ok:false,reason:`Terminer l’épreuve « ${evolutionTrial(t.previous).name} ».`};
 const required=trialSource(t),name=CARDS[t.cardId].name;
 if(ownedCardCopies(profile,required)<1)return {ok:false,reason:`Posséder ${name} au rang ${t.from}.`};
 if(!profile.deck.some(ref=>cardKey(ref)===cardKey(required)))return {ok:false,reason:`Ajouter ${name} ${t.from} au deck.`};
 const invalid=validateDeck(profile);if(invalid)return {ok:false,reason:invalid};
 return {ok:true,trial:t};
}
export function createEvolutionTrial(profile,id,seed=Date.now()){
 const access=evolutionTrialAccess(profile,id);if(!access.ok)return access;
 const t=access.trial;
 const battle=createBattle(profile,{id:t.id,name:t.name,enemy:t.enemy,difficulty:t.difficulty,hp:t.hp,aiStyle:t.aiStyle,boss:!!t.boss,deck:t.deck,mode:'evolution-trial'},seed,{turnFlow:'alternating'});
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
 const alive=b.board.some(row=>row.some(u=>u&&u.side==='p'&&u.hp>0&&u.id===t.cardId&&(u.rarity||CARDS[u.id].rarity)===t.from));
 if(!alive)return {...empty,reason:'Victoire, mais l’objectif de l’épreuve n’est pas rempli. Aucun exemplaire consommé.'};
 const access=evolutionTrialAccess(profile,t.id);if(!access.ok)return {...empty,reason:access.reason};
 const source=trialSource(t),reward=trialReward(t),key=cardKey(source);
 // Seul un exemplaire est transformé ; le slot éventuel du deck reste en place.
 if(typeof source==='string')profile.collection[source]--;else profile.evolvedCollection[key]--;
 profile.evolvedCollection??={};
 const target=cardKey(reward);profile.evolvedCollection[target]=(profile.evolvedCollection[target]||0)+1;
 const index=profile.deck.findIndex(ref=>cardKey(ref)===key);if(index>=0)profile.deck[index]=reward;
 profile.completedTrials??=[];profile.completedTrials.push(t.id);b.progressionGranted=true;
 return {...empty,card:reward,evolved:true,from:source,trial:t};
}
export const bossEvolutionUnlocks=missionId=>EVOLUTION_TRIALS.filter(t=>t.previous&&t.mission===missionId);
