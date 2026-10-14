// Statistiques d'invocation partagées par le moteur et les aperçus, sans mutation.
import {CARDS,FACTIONS} from '../data.js';
import {gearBonus,masteryRank,reputationLevel} from './profile.js';

export function unitStatContext(profile){
 return {
  upgrades:{...profile.upgrades},mastery:{...profile.mastery},
  forgeBonus:profile.buildings?.forge||0,unitAtkBonus:gearBonus(profile,'unitAtk'),
  reputationBonus:Object.fromEntries(Object.keys(FACTIONS).map(id=>[id,reputationLevel(profile,id)]))
 };
}

export function unitStats(context,id,side='p'){
 const card=CARDS[id];if(!card||card.type!=='unité')return null;
 const allied=side==='p';
 const level=allied?(context.upgrades?.[id]||0):Math.max(0,context.enemyDifficulty-3);
 const equipment=allied?(context.unitAtkBonus||0):0;
 const forge=allied?(context.forgeBonus||0):0;
 const reputation=allied?(context.reputationBonus?.[card.faction]||0):0;
 const mastery=allied&&masteryRank({mastery:context.mastery},id)===3?1:0;
 const bonuses=[
  {label:allied?'Amélioration':'Difficulté',atk:level,hp:level},
  {label:'Équipement',atk:equipment,hp:0},{label:'Forge',atk:0,hp:forge},
  {label:'Réputation',atk:0,hp:reputation},{label:'Maîtrise',atk:0,hp:mastery}
 ].filter(b=>b.atk||b.hp);
 return {atk:card.attack+level+equipment,maxhp:card.hp+level+forge+reputation+mastery,bonuses};
}
