// Progression et récompenses d'une expédition en plusieurs salles.
import {DUNGEONS,dungeonById,dungeonStageMission,dungeonBonusMission} from '../dungeons.js';
import {createBattle,note} from './battle.js';
import {validateDeck,grantBattleProgress} from './profile.js';
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
export function dungeonUnlocked(profile,id){
 const index=DUNGEONS.findIndex(d=>d.id===id);
 return index>=0&&(index===0||profile.dungeonCleared?.includes(DUNGEONS[index-1].id));
}
export function beginDungeon(profile,id){
 if(profile.dungeonRun)return {ok:false,reason:'Une expédition est déjà en cours.'};
 if(!dungeonUnlocked(profile,id))return {ok:false,reason:'Terminez le donjon précédent pour débloquer celui-ci.'};
 const deckError=validateDeck(profile);if(deckError)return {ok:false,reason:deckError};
 profile.dungeonRun={id,stage:0,hp:null,maxhp:null,phase:'ready'};
 return {ok:true};
}
// One mandatory, persistent decision after each ordinary room (not after the final boss).
// Deterministic costs/rewards make the three options transparent and testable.
export function chooseDungeonEvent(profile,choice){
 const run=profile.dungeonRun;
 if(!run||run.phase!=='choice'||run.stage<1)return {ok:false,reason:'Aucun événement à résoudre.'};
 const maxhp=run.maxhp||26;
 if(choice==='rest'){
  const restored=Math.min(10,Math.max(0,maxhp-run.hp));
  run.hp+=restored;run.phase='ready';
  return {ok:true,choice,restored,hp:run.hp};
 }
 if(choice==='treasure'){
  const gold=35+run.stage*10,shards=12+run.stage*5;
  profile.gold+=gold;profile.shards+=shards;run.phase='ready';
  return {ok:true,choice,gold,shards};
 }
 if(choice==='challenge'){
  run.phase='bonus';return {ok:true,choice};
 }
 return {ok:false,reason:'Choix inconnu.'};
}
export function nextDungeonBattle(profile,seed=Date.now()){
 const run=profile.dungeonRun;if(!run)throw Error('Aucune expédition en cours');
 if(run.phase==='choice')throw Error('Choisissez un événement avant le prochain combat.');
 if(run.phase!=='ready'&&run.phase!=='bonus')throw Error('État de donjon invalide.');
 const isBonus=run.phase==='bonus';
 const mission=isBonus?dungeonBonusMission(run.id,run.stage):dungeonStageMission(run.id,run.stage);
 const b=createBattle(profile,mission,seed);
 b.dungeonId=mission.dungeonId;b.dungeonStage=mission.dungeonStage;b.dungeonBonus=isBonus;
 if(run.hp!==null){
  b.heroes.p.hp=clamp(run.hp,1,b.heroes.p.maxhp);
  note(b,`Endurance de l'expédition : ${b.heroes.p.hp}/${b.heroes.p.maxhp} PV conservés.`);
 }
 return b;
}
export function settleDungeonBattle(profile,b){
 const run=profile.dungeonRun;
 const isBonus=!!b.dungeonBonus;
 const expectedId=isBonus?`B_${run?.id}_${(run?.stage??0)+1}`:`D_${run?.id}_${(run?.stage??0)+1}`;
 if(!run||b.mode!=='dungeon'||b.status==='active'||run.id!==b.dungeonId||run.stage!==b.dungeonStage||
    b.missionId!==expectedId||run.phase!==(isBonus?'bonus':'ready'))
  return {ok:false,reason:'Cette étape est déjà réglée ou ne correspond pas à l’expédition.'};
 const mission=isBonus?dungeonBonusMission(run.id,run.stage):dungeonStageMission(run.id,run.stage),victory=b.status==='victory';
 if(!victory){profile.dungeonRun=null;profile.losses++;return {ok:true,victory:false,gold:0,shards:0,card:null,finished:true,bonus:isBonus,stage:run.stage+1,...grantBattleProgress(profile,b)};}
 profile.gold+=mission.reward;profile.shards+=mission.shards;profile.wins++;
 const progression=grantBattleProgress(profile,b);
 const heal=6,retainedHp=clamp(b.heroes.p.hp+heal,1,b.heroes.p.maxhp);
 if(isBonus){
  profile.dungeonRun={...run,hp:retainedHp,maxhp:b.heroes.p.maxhp,phase:'ready'};
  return {ok:true,victory:true,gold:mission.reward,shards:mission.shards,card:null,bonus:true,
   finished:false,stage:run.stage,retainedHp,...progression};
 }
 const nextStage=run.stage+1,definition=dungeonById(run.id);
 let card=null,finalBonusGold=0,finalBonusShards=0,firstClear=false;
 if(nextStage>=definition.stages.length){
  firstClear=!profile.dungeonCleared.includes(run.id);
  if(firstClear){profile.dungeonCleared.push(run.id);card=definition.unlock;profile.collection[card]=(profile.collection[card]||0)+1;}
  finalBonusGold=definition.bonusGold;finalBonusShards=definition.bonusShards;
  profile.gold+=finalBonusGold;profile.shards+=finalBonusShards;profile.dungeonRun=null;
 }else profile.dungeonRun={id:run.id,stage:nextStage,hp:retainedHp,maxhp:b.heroes.p.maxhp,phase:'choice'};
 return {ok:true,victory:true,gold:mission.reward+finalBonusGold,shards:mission.shards+finalBonusShards,card,
  finished:!profile.dungeonRun,bonus:false,choicePending:!!profile.dungeonRun,stage:nextStage,retainedHp:profile.dungeonRun?.hp??null,firstClear,...progression};
}
export function abandonDungeon(profile){if(!profile.dungeonRun)return false;profile.dungeonRun=null;return true;}
