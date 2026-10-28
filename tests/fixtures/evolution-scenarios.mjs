// Scénarios navigateur issus de combats complets du moteur, sans résultat forcé.
import {freshProfile,createBattle,createEvolutionTrial,settleEvolutionTrial,playPlayerCard,endPlayerTurn,playEnemyCard,finishEnemyTurn,usePower} from '../../src/engine.js';
import {CARDS,CAMPAIGN} from '../../src/data.js';
import {EVOLUTION_TRIALS} from '../../src/evolution-trials.js';
import {chooseSimulatedMove} from '../../scripts/lib/battle_runner.mjs';

const profile=freshProfile();profile.completed=['01','02','03'];profile.unlocked=4;profile.guideSeen=true;
const scenarios=[];
for(const id of ['aube-militia-rare','aube-militia-epic','aube-shield-rare','aube-archer-rare']){
 const trial=EVOLUTION_TRIALS.find(t=>t.id===id);let found;
 for(let seed=1;seed<=256&&!found;seed++){
  const b=createEvolutionTrial(profile,id,seed).battle,initial=structuredClone(b),actions=[];
  for(let turn=0;turn<40&&b.status==='active';turn++){
   if(b.powerCooldown===0){usePower(b);actions.push({type:'power'});}
   for(let n=0;n<2&&b.status==='active';n++){
    const m=chooseSimulatedMove(b);if(!m)break;
    const hand=b.heroes.p.hand[m.i];
    actions.push({...m,type:CARDS[hand.id].type,id:hand.id,rarity:hand.rarity});
    if(!playPlayerCard(b,m.i,m.lane,m.col).ok)throw Error('Action simulée invalide');
   }
   if(b.status==='active'){
    actions.push({type:'end',round:b.round});endPlayerTurn(b);
    if(b.status==='active'){while(!playEnemyCard(b).done){}finishEnemyTurn(b);}
   }
  }
  if(b.status==='active')throw Error('Combat sans fin');
  const next=structuredClone(profile),reward=settleEvolutionTrial(next,structuredClone(b));
  if(reward.evolved)found={id,trial:{...trial,legacyObjective:trial.objective,objective:initial.trialChallenge.text},seed,profile:structuredClone(profile),initial,terminal:b,actions,expected:next};
 }
 if(!found)throw Error('Aucun parcours complet réussi : '+id);
 const edited=structuredClone(found.expected),index=edited.deck.findIndex(ref=>ref?.id===trial.cardId&&ref.rarity===trial.to);
 edited.deck.push(edited.deck.splice(index,1)[0]);
 for(let seed=1;seed<=100;seed++){
  if(createBattle(edited,CAMPAIGN[0],seed).heroes.p.hand.some(h=>h.id===trial.cardId&&h.rarity===trial.to)){found.campaignSeed=seed;break;}
 }
 if(!found.campaignSeed)throw Error('Pas de pioche de campagne');
 scenarios.push(found);Object.assign(profile,found.expected);
}
console.log(JSON.stringify(scenarios));
