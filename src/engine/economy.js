// Gains de mission, récompenses et économie interne (sans paiement réel).
import {CARDS,CLASS_SKILLS,TOWER_MAX} from '../data.js';
import {ownedCopies,grantBattleProgress,heroLevel} from './profile.js';
export function completeBattle(profile,mission,b){
 if(b.status!=='victory'&&b.status!=='defeat')return null;
 if(b.progressionGranted)return {victory:b.status==='victory',gold:0,shards:0,card:null,reputation:[],heroXp:0,levelShards:0,mastered:[]};
 const reward={victory:b.status==='victory',gold:0,shards:0,card:null,reputation:[]};
 if(b.status==='victory'){
  reward.gold=mission.reward;reward.shards=mission.shards;reward.card=mission.unlock;
  profile.gold+=reward.gold;profile.shards+=reward.shards;profile.wins++;
  if(mission.mode==='tower'){
   const floor=mission.floor;const first=!profile.towerCleared.includes(floor);
   if(first){profile.towerCleared.push(floor);profile.towerUnlocked=Math.min(TOWER_MAX,Math.max(profile.towerUnlocked,floor+1));}
   if(first&&mission.unlock)profile.collection[mission.unlock]=(profile.collection[mission.unlock]||0)+1;
   else reward.card=null;
  }else if(!profile.completed.includes(mission.id)){
   profile.completed.push(mission.id);
   if(mission.unlock)profile.collection[mission.unlock]=(profile.collection[mission.unlock]||0)+1;
   profile.unlocked=Math.min(12,Math.max(profile.unlocked,Number(mission.id)+1));
  }else reward.card=null;
  for(const faction of Object.keys(profile.reputation)){const copies=profile.deck.filter(id=>CARDS[id]?.faction===faction).length;
   if(!copies)continue;const gained=Math.ceil(copies/4)+(profile.equipped?.relique==='sceau'?2:0);
   profile.reputation[faction]+=gained;reward.reputation.push([faction,gained]);
  }
  profile.stars+=Math.max(1,mission.difficulty);
 }else{
  reward.gold=10;profile.gold+=10;profile.losses++;
 }
 Object.assign(reward,grantBattleProgress(profile,b));
 return reward;
}
export function buyPack(profile,random=Math.random){
 if(profile.gold<95)return {ok:false,reason:'Il faut 95 pièces d’or.'};
 profile.gold-=95;
 const all=Object.values(CARDS).filter(c=>!c.heroClass),result=[];
 for(let i=0;i<3;i++){
  const roll=random();const pool=all.filter(c=>roll<0.65?c.rarity==='commun':roll<0.93?c.rarity==='rare':c.rarity==='épique');
  const card=pool[Math.floor(random()*pool.length)]||all[0];profile.collection[card.id]=(profile.collection[card.id]||0)+1;result.push(card.id);
 }
 return {ok:true,cards:result};
}
export function upgradeCard(profile,id){
 if(!CARDS[id]||!ownedCopies(profile,id))return {ok:false,reason:'Vous ne possédez pas cette carte.'};
 if(CARDS[id].type==='sort')return {ok:false,reason:'Les sorts ne sont pas améliorables dans cette version.'};
 const level=profile.upgrades[id]||0;if(level>=3)return {ok:false,reason:'Niveau maximum atteint.'};
 const cost=(level+1)*35;if(profile.shards<cost)return {ok:false,reason:`Il faut ${cost} éclats.`};
 profile.shards-=cost;profile.upgrades[id]=level+1;return {ok:true,cost};
}
// Guaranteed in-game card crafting (no premium currency, no random failure).
// Apprentissage déterministe : accessible aux anciens profils de haut niveau.
// Une seule copie par compétence. Aucune modification de clé de sauvegarde.
export function learnClassSkill(profile,id){
 const skill=CLASS_SKILLS[id];
 if(!skill)return {ok:false,reason:'Compétence de classe inconnue.'};
 if(heroLevel(profile)<skill.level)return {ok:false,reason:'Niveau '+skill.level+' requis.'};
 if((profile.collection[id]||0)>0)return {ok:false,reason:'Compétence déjà apprise.'};
 if(profile.shards<skill.shards)return {ok:false,reason:'Il faut '+skill.shards+' éclats.'};
 profile.shards-=skill.shards;
 profile.collection[id]=(profile.collection[id]||0)+1;
 return {ok:true,cost:skill.shards};
}
export const FUSION_RECIPES=['lancer','scoutcaptain','sunpriest','archdruid','vampire','graveknight','cannon','mechanist','tempest','aetherknight','dawnbastion','seraph','sundawn','arcflare'];
export const FUSION_COSTS={'commun':{gold:12,shards:26},'rare':{gold:32,shards:64},'épique':{gold:85,shards:145},'légendaire':{gold:180,shards:290}};
export const EXTRACTION_SHARDS={'commun':8,'rare':18,'épique':44,'légendaire':90};
export function extractCard(p,id){
 const c=CARDS[id];if(!c)return {ok:false,reason:'Carte inconnue.'};
 if(c.heroClass)return {ok:false,reason:'Une compétence de classe apprise ne peut pas être extraite.'};
 const used=p.deck.filter(x=>x===id).length;
 if((p.collection[id]||0)<=used)return {ok:false,reason:'Retirez un exemplaire du deck avant extraction.'};
 p.collection[id]--;p.shards+=EXTRACTION_SHARDS[c.rarity];
 return {ok:true,shards:EXTRACTION_SHARDS[c.rarity]};
}
export function fuseCard(p,id){
 if(!FUSION_RECIPES.includes(id))return {ok:false,reason:'Recette non disponible.'};
 const c=CARDS[id],cost=FUSION_COSTS[c.rarity];
 if(p.gold<cost.gold||p.shards<cost.shards)return {ok:false,reason:`Il faut ${cost.gold} or et ${cost.shards} éclats.`};
 p.gold-=cost.gold;p.shards-=cost.shards;p.collection[id]=(p.collection[id]||0)+1;
 return {ok:true,cost};
}
export const BUILDINGS={
 bastion:{name:'Bastion royal',description:'+4 PV du héros par niveau.',cost:70,max:3},
 forge:{name:'Forge ancestrale',description:'+1 PV aux unités invoquées par niveau.',cost:90,max:3},
 bibliotheque:{name:'Bibliothèque des Sages',description:'+1 carte en main au départ par niveau.',cost:115,max:2}
};
export function upgradeBuilding(profile,key){
 const b=BUILDINGS[key];if(!b)return {ok:false,reason:'Bâtiment inconnu.'};
 const level=profile.buildings[key]||0,cost=b.cost*(level+1);
 if(level>=b.max)return {ok:false,reason:'Bâtiment au niveau maximum.'};
 if(profile.gold<cost)return {ok:false,reason:`Il faut ${cost} pièces d’or.`};
 profile.gold-=cost;profile.buildings[key]=level+1;return {ok:true,cost};
}
