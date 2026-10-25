// Statistiques d'invocation partagées par le moteur et les aperçus, sans mutation.
import {CARDS,FACTIONS} from '../data.js';
import {gearBonus,masteryRank,reputationLevel} from './profile.js';
import {resolveUnitDefinition} from '../cards/definitions.js';

// Effets expérimentaux du Milicien, actifs uniquement dans une bataille de laboratoire.
export function labMilitiaBonus(rarity,level){
 const ranks=['commun','rare','épique','légendaire','divine'],rank=ranks.indexOf(rarity);
 if(rank<0)return {hp:0,block:0,counter:false};
 const hp=rank>=3?2:rank>=1?1:0;
 const block=rank===1?(level>=2?1:0):rank>=2&&rank<=3?2:rank===4?3:0;
 return {hp,block,counter:rank===4&&level>=2};
}
export function unitStatContext(profile){
 return {
  upgrades:{...profile.upgrades},mastery:{...profile.mastery},
  forgeBonus:profile.buildings?.forge||0,unitAtkBonus:gearBonus(profile,'unitAtk'),
  reputationBonus:Object.fromEntries(Object.keys(FACTIONS).map(id=>[id,reputationLevel(profile,id)]))
 };
}

export function unitStats(context,id,side='p'){
 if(typeof id!=='string')return null;
 const definition=resolveUnitDefinition(id);
 const card=CARDS[id];if(!definition||!card||card.type!=='unité')return null;
 const allied=side==='p';
 const lab=context.mode==='developer'?context.labStats:null;
 const labLevel=lab?.levels?.[side]?.[id]??0;
 const labRank=lab?.rarities?.[side]?.[id]||card.rarity;
 const level=lab?(id==='militia'&&labRank!=='commun'?3:labLevel):
  allied?(context.upgrades?.[id]||0):Math.max(0,context.enemyDifficulty-3);
 const experimental=lab&&id==='militia'?labMilitiaBonus(labRank,labLevel):{hp:0};
 return calculateUnitStats(context,definition,side,level,experimental.hp);
}

// Prévision pure des versions définies : ne rend aucune évolution jouable et n'écrit aucun état.
// Le laboratoire sera raccordé à cette API seulement avec les pouvoirs des étapes 3/4.
export function versionUnitStats(context,reference,side='p'){
 const definition=resolveUnitDefinition(reference);if(!definition)return null;
 const level=context.mode==='developer'?(context.labStats?.levels?.[side]?.[definition.id]||0):
  side==='p'?(context.upgrades?.[definition.id]||0):Math.max(0,context.enemyDifficulty-3);
 return {versionId:definition.versionId,base:{...definition.stats},
  ...calculateUnitStats(context,definition,side,level)};
}

function calculateUnitStats(context,definition,side,level,experimentalHp=0){
 const id=definition.id,card=CARDS[id],allied=side==='p';
 const equipment=allied?(context.unitAtkBonus||0):0;
 const forge=allied?(context.forgeBonus||0):0;
 const reputation=allied?(context.reputationBonus?.[card.faction]||0):0;
 const mastery=allied&&masteryRank({mastery:context.mastery},id)===3?1:0;
 const bonuses=[
  {label:allied?'Amélioration':'Difficulté',atk:level,hp:level},
  {label:'Équipement',atk:equipment,hp:0},{label:'Forge',atk:0,hp:forge},
  {label:'Réputation',atk:0,hp:reputation},{label:'Maîtrise',atk:0,hp:mastery},
  {label:'Milicien expérimental',atk:0,hp:experimentalHp}
 ].filter(b=>b.atk||b.hp);
 return {atk:definition.stats.attack+level+equipment,
  maxhp:definition.stats.hp+level+forge+reputation+mastery+experimentalHp,bonuses};
}
