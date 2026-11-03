// Parties complètes du moteur et préparation de profils avancés pour les tests.
import {CARDS,CAMPAIGN} from '../../src/data.js';
import {EVOLUTION_ASCENSIONS,SYLVE_ASCENSIONS,OMBRE_ASCENSIONS,FORGE_ASCENSIONS} from '../../src/evolution-trials.js';
import {EVOLUTION_FUSIONS} from '../../src/evolution-fusion.js';
import {unitVersions} from '../../src/cards/definitions.js';
import {CARD_RARITIES} from '../../src/cards/schema.js';
import {cardReference,cardKey} from '../../src/cards/references.js';
import {freshProfile,createBattle,createEvolutionTrial,settleEvolutionTrial,fuseEvolutionCopies,playPlayerCard,endPlayerTurn,playEnemyCard,finishEnemyTurn,usePower} from '../../src/engine.js';
import {trialObjectiveState} from '../../src/engine/trial-objectives.js';
import {chooseSimulatedMove} from '../../scripts/lib/battle_runner.mjs';

const composition=['shield','shield','shield','lancer','lancer','lancer','archer','archer','archer','cleric','cleric','sunpriest','sunpriest','banner','banner','scoutcaptain','scoutcaptain','paladin','healing','healing'];
const sylveComposition=['treant','treant','treant','bear','bear','wolf','wolf','ranger','ranger','dryad','dryad','archdruid','archdruid','pixie','pixie','owl','sylvan_trapper','stag','healing','healing'];
const ombreComposition=['crypt','crypt','crypt','graveknight','graveknight','shade','shade','bone','bone','vampire','vampire','banshee','banshee','lich','mist_inquisitor','plague','nightblade','spectre','healing','healing'];
const forgeComposition=['ironwraith','ironwraith','ironwraith','drill','drill','drill','smith','smith','smith','colossus','colossus','golem','golem','cannon','engineer','engineer','mechanist','alchemist','healing','healing'];
const factionComposition=faction=>faction==='forge'?forgeComposition:faction==='ombre'?ombreComposition:faction==='sylve'?sylveComposition:composition;
const factionTrials=faction=>faction==='forge'?FORGE_ASCENSIONS:faction==='ombre'?OMBRE_ASCENSIONS:faction==='sylve'?SYLVE_ASCENSIONS:EVOLUTION_ASCENSIONS;
function factionReference(id,rarity,faction){
 if(CARDS[id].type==='sort')return id;
 const rank=faction==='forge'?unitVersions(id).filter(d=>CARD_RARITIES.findIndex(r=>r.id===d.rarity)<=CARD_RARITIES.findIndex(r=>r.id===rarity)).at(-1).rarity:rarity;
 return cardReference({id,rarity:rank});
}
export function ascensionProfile(rarity='légendaire',level=2,faction='aube'){
 const p=freshProfile();p.completed=CAMPAIGN.map(m=>m.id);p.unlocked=12;p.guideSeen=true;p.heroClass='clerc';
 p.evolvedCollection={};p.buildings.bastion=2;p.buildings.forge=1;
 for(const id of Object.keys(CARDS).filter(id=>CARDS[id].faction===faction)){
  p.collection[id]=30;p.upgrades[id]=level;
  const ref=factionReference(id,rarity,faction);if(typeof ref==='object')p.evolvedCollection[cardKey(ref)]=30;
 }
 p.deck=factionComposition(faction).map(id=>factionReference(id,rarity,faction));
 if(faction!=='aube')p.collection.healing=30;
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
export function ascensionScenarios(faction='aube'){
 const scenarios=[];let profile=ascensionProfile('légendaire',2,faction);
 for(const t of factionTrials(faction)){
  let found;
  for(let seed=1;seed<=256&&!found;seed++){
   const run=playAscension(profile,t.id,seed,true),expected=structuredClone(profile);
   const reward=settleEvolutionTrial(expected,structuredClone(run.battle));
   if(reward.unlocked)found={id:t.id,trial:t,seed,profile:structuredClone(profile),initial:run.initial,terminal:run.battle,actions:run.actions,expected};
  }
  if(!found)throw Error('Aucun parcours réussi : '+t.id);
  scenarios.push(found);profile=structuredClone(found.expected);
  if(t.to==='divine'){
   for(const recipe of EVOLUTION_FUSIONS.filter(r=>r.to==='divine'&&CARDS[r.cardId].faction===faction))for(let n=0;n<3+(['ombre','forge'].includes(faction)?factionComposition(faction).filter(id=>id===recipe.cardId).length:0);n++){
    const r=fuseEvolutionCopies(profile,recipe.id);if(!r.ok)throw Error(r.reason);
   }
   profile.deck=factionComposition(faction).map(id=>factionReference(id,'divine',faction));
  }
 }
 return scenarios;
}
if(process.argv.includes('--json'))console.log(JSON.stringify(ascensionScenarios(process.argv.includes('--forge')?'forge':process.argv.includes('--ombre')?'ombre':process.argv.includes('--sylve')?'sylve':'aube')));
