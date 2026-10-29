// Parties complètes du moteur et préparation de profils avancés pour les tests.
import {CARDS,CAMPAIGN} from '../../src/data.js';
import {EVOLUTION_ASCENSIONS} from '../../src/evolution-trials.js';
import {EVOLUTION_FUSIONS} from '../../src/evolution-fusion.js';
import {cardReference,cardKey} from '../../src/cards/references.js';
import {freshProfile,createBattle,createEvolutionTrial,settleEvolutionTrial,fuseEvolutionCopies,playPlayerCard,endPlayerTurn,playEnemyCard,finishEnemyTurn,usePower} from '../../src/engine.js';
import {trialObjectiveState} from '../../src/engine/trial-objectives.js';
import {chooseSimulatedMove} from '../../scripts/lib/battle_runner.mjs';

const composition=['shield','shield','shield','lancer','lancer','lancer','archer','archer','archer','cleric','cleric','sunpriest','sunpriest','banner','banner','scoutcaptain','scoutcaptain','paladin','healing','healing'];
export function ascensionProfile(rarity='légendaire',level=2){
 const p=freshProfile();p.completed=CAMPAIGN.map(m=>m.id);p.unlocked=12;p.guideSeen=true;p.heroClass='clerc';
 p.evolvedCollection={};p.buildings.bastion=2;p.buildings.forge=1;
 for(const id of Object.keys(CARDS).filter(id=>CARDS[id].faction==='aube')){
  p.collection[id]=30;p.upgrades[id]=level;
  if(CARDS[id].rarity!==rarity)p.evolvedCollection[cardKey({id,rarity})]=30;
 }
 p.deck=composition.map(id=>CARDS[id].type==='sort'?id:cardReference({id,rarity}));
 return p;
}
export function playAscension(profile,id,seed,withActions=false){
 const created=createEvolutionTrial(profile,id,seed);if(!created.ok)throw Error(created.reason);
 const b=created.battle,initial=withActions?structuredClone(b):null,actions=[];
 for(let turn=0;turn<60&&b.status==='active';turn++){
  if(b.powerCooldown===0){usePower(b);if(withActions)actions.push({type:'power'});}
  for(let n=0;n<2&&b.status==='active';n++){
   const move=chooseSimulatedMove(b);if(!move)break;const h=b.heroes.p.hand[move.i];
   if(withActions)actions.push({...move,type:CARDS[h.id].type,id:h.id,rarity:h.rarity});
   const r=playPlayerCard(b,move.i,move.lane,move.col);if(!r.ok)throw Error(r.reason);
  }
  if(b.status==='active'){
   if(withActions)actions.push({type:'end',round:b.round});endPlayerTurn(b);
   if(b.status==='active'){while(!playEnemyCard(b).done){}finishEnemyTurn(b);}
  }
 }
 if(b.status==='active')throw Error('Ascension sans fin');
 return {battle:b,initial,actions,objective:trialObjectiveState(b)};
}
export function ascensionScenarios(){
 const scenarios=[];let profile=ascensionProfile();
 for(const t of EVOLUTION_ASCENSIONS){
  let found;
  for(let seed=1;seed<=256&&!found;seed++){
   const run=playAscension(profile,t.id,seed,true),expected=structuredClone(profile);
   const reward=settleEvolutionTrial(expected,structuredClone(run.battle));
   if(reward.unlocked)found={id:t.id,trial:t,seed,profile:structuredClone(profile),initial:run.initial,terminal:run.battle,actions:run.actions,expected};
  }
  if(!found)throw Error('Aucun parcours réussi : '+t.id);
  scenarios.push(found);profile=structuredClone(found.expected);
  if(t.to==='divine'){
   for(const recipe of EVOLUTION_FUSIONS.filter(r=>r.to==='divine'))for(let n=0;n<3;n++){
    const r=fuseEvolutionCopies(profile,recipe.id);if(!r.ok)throw Error(r.reason);
   }
   profile.deck=composition.map(id=>CARDS[id].type==='sort'?id:cardReference({id,rarity:'divine'}));
  }
 }
 return scenarios;
}
if(process.argv.includes('--json'))console.log(JSON.stringify(ascensionScenarios()));
