// Statistiques d'invocation partagées par le moteur et les aperçus, sans mutation.
import {CARDS,FACTIONS} from '../data.js';
import {gearBonus,masteryRank,reputationLevel} from './profile.js';
import {battleUnitDefinition} from './unit-rules.js';

export function unitStatContext(profile){
 return {
  upgrades:{...profile.upgrades},mastery:{...profile.mastery},
  forgeBonus:profile.buildings?.forge||0,unitAtkBonus:gearBonus(profile,'unitAtk'),
  reputationBonus:Object.fromEntries(Object.keys(FACTIONS).map(id=>[id,reputationLevel(profile,id)]))
 };
}

export function unitStats(context,reference,side='p'){
 const definition=battleUnitDefinition(context,reference,side);if(!definition)return null;
 const level=context.mode==='developer'?(context.labStats?.levels?.[side]?.[definition.id]||0):
  side==='p'?(context.upgrades?.[definition.id]||0):Math.max(0,context.enemyDifficulty-3);
 return calculateUnitStats(context,definition,side,level);
}

// Prévision pure des versions définies : ne rend aucune évolution jouable et n'écrit aucun état.
// Le laboratoire utilise la même définition et les mêmes bonus que la vraie invocation.
export function versionUnitStats(context,reference,side='p'){
 const definition=battleUnitDefinition(context,reference,side);if(!definition)return null;
 const level=context.mode==='developer'?(context.labStats?.levels?.[side]?.[definition.id]||0):
  side==='p'?(context.upgrades?.[definition.id]||0):Math.max(0,context.enemyDifficulty-3);
 return {versionId:definition.versionId,base:{...definition.stats},
  ...calculateUnitStats(context,definition,side,level)};
}

function calculateUnitStats(context,definition,side,level){
 const id=definition.id,card=CARDS[id],allied=side==='p';
 const equipment=allied?(context.unitAtkBonus||0):0;
 const forge=allied?(context.forgeBonus||0):0;
 const reputation=allied?(context.reputationBonus?.[card.faction]||0):0;
 const mastery=allied&&masteryRank({mastery:context.mastery},id)===3?1:0;
 const bonuses=[
  {label:allied?'Amélioration':'Difficulté',atk:level,hp:level},
  {label:'Équipement',atk:equipment,hp:0},{label:'Forge',atk:0,hp:forge},
  {label:'Réputation',atk:0,hp:reputation},{label:'Maîtrise',atk:0,hp:mastery}
 ].filter(b=>b.atk||b.hp);
 return {atk:definition.stats.attack+level+equipment,
  maxhp:definition.stats.hp+level+forge+reputation+mastery,bonuses};
}
