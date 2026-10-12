// IA tactique V1.7 — heuristique déterministe, sans accès aux cartes cachées du joueur.
// Évalue l'état public du plateau et les cartes réellement présentes dans sa propre main.
import {CARDS,GUARD_IDS,CHARGE_IDS} from './data.js';
import {silenceTarget,silenceValue,teleportPlan,teleportGain,trapPlan,activeAbility} from './engine/battle-control.js';
import {accelerationTarget} from './engine/tempo.js';
export const AI_STYLES = Object.freeze({
 equilibre:{name:'Équilibré',desc:'Combine attaque, défense et opportunités de cartes.'},
 assaut:{name:'Assaut',desc:'Favorise les unités offensives et les percées rapides.'},
 bastion:{name:'Bastion',desc:'Protège sa couronne avec gardiens, soins et boucliers.'},
 rituel:{name:'Rituel',desc:'Privilégie les sorts utiles et les attaques à distance.'},
 meute:{name:'Meute',desc:'Regroupe les créatures d’un même ordre pour former des lignes puissantes.'}
});
export const aiStyle = b => AI_STYLES[b?.aiStyle] ? b.aiStyle : 'equilibre';
export const aiEnraged = b => Boolean(b?.aiBoss && b?.heroes?.e && b.heroes.e.hp>0 && b.heroes.e.hp*2<=b.heroes.e.maxhp);
import {laneCount,lastCell,crownColumn,entryColumn} from './engine/board.js';
const finite=(n)=>Number.isFinite(n)?n:0;
const alive=(u)=>!!u && u.hp>0;

export function inspectEnemyLane(b,lane){
 const row=b.board[lane]||[];
 const threats=[],friends=[];
 for(let col=1;col<=lastCell(b);col++){
  const u=row[col];if(!alive(u))continue;
  if(u.side==='p')threats.push({u,col});
  else if(u.side==='e')friends.push({u,col});
 }
 // Plus un ennemi est proche de la couronne ennemie (droite), plus il faut l'arrêter.
 const urgency=threats.reduce((sum,{u,col})=>{
  const steps=Math.max(1,crownColumn(b,'e')-col);
  return sum+(steps<=2?7:steps===3?3:0)+Math.max(1,u.atk)*(steps===1?3:steps===2?1.65:steps===3?.6:.15)
   +(CHARGE_IDS.has(u.id)&&steps<=3?2:0)+(u.ranged&&steps<=3?2:0)+1/steps;
 },0);
 const frontline=threats.sort((a,z)=>z.col-a.col)[0]||null;
 const guard=friends.some(({u})=>GUARD_IDS.has(u.id));
 return {lane,threats,friends,frontline,urgency,guard,entryFree:!alive(row[entryColumn(b,'e')])};
}

function scoreOption(b,card,laneInfo){
 const {urgency,threats,friends,frontline,guard}=laneInfo;
 const hero=b.heroes.e,enemyHero=b.heroes.p;
 if(card.type==='unité'){
  if(!laneInfo.entryFree)return null;
  const synergy=friends.filter(({u})=>CARDS[u.id]?.faction===card.faction).length;
  let score=4.4+card.attack*.65+card.hp*.17;
  score+=Math.min(22,urgency)*.75;
  score+=synergy?5.2+Math.min(2,synergy)*1.3:0;
  score+=threats.length&&card.ability==='ranged'?3.1:0;
  score+=threats.length&&card.ability==='pierce'&&threats.some(({u})=>(u.armor||0)>0)?4:0;
  score+=urgency>=12&&GUARD_IDS.has(card.id)?5.5:0;
  score+=urgency>=8&&card.hp>=8?2:0;
  score+=friends.length===0&&threats.length===0?2.4:0;
  score-=friends.length>=3?2:0;
  if(card.ability==='silence'&&silenceTarget(b,'e',laneInfo.lane))score+=5;
  if(card.ability==='trapper'&&threats.length&&trapPlan(b,'e',laneInfo.lane,entryColumn(b,'e')-1))score+=3;
  // Les pièges visibles près de l'entrée pénalisent les unités fragiles.
  if((b.traps||[]).some(t=>t.owner==='p'&&t.lane===laneInfo.lane&&t.col===entryColumn(b,'e')-1&&t.expiresRound>=b.round))score-=card.hp<=3?5:2;
  const reason=urgency>=12?'Défense prioritaire':synergy?'Formation de faction':threats.length?'Contre-attaque':'Percée stratégique';
  return {score,reason};
 }
 if(card.type!=='sort')return null;
 let score=-Infinity,reason='Sort tactique';
 const ability=card.ability;
 const hpLoss=Math.max(0,hero.maxhp-hero.hp);
 const injured=friends.reduce((n,{u})=>n+Math.max(0,u.maxhp-u.hp),0);
 if(ability==='spell_bolt'){
  if(frontline){score=5+Math.min(4,frontline.u.hp)*1.2+Math.min(25,urgency)*.72+(frontline.u.hp<=Math.max(1,4-(frontline.u.armor||0))?5:0);reason='Éliminer une menace';}
  else if(enemyHero.hp<=2){score=100;reason='Achever la couronne';}
 }else if(ability==='spell_storm'){
  if(threats.length){const damage=threats.reduce((n,{u})=>n+Math.min(u.hp,Math.max(1,3-(u.armor||0))),0);
   score=2+damage*1.25+threats.length*2.5+Math.min(22,urgency)*.45;
   reason='Dissiper l’assaut';}
 }else if(ability==='spell_root'){
  if(frontline&&frontline.u.stun<=0){score=3+Math.min(25,urgency)*.55+(frontline.col>=lastCell(b)-1?5:0);reason='Immobiliser l’avant-garde';}
 }else if(ability==='spell_heal'){
  if(hpLoss||injured){score=1+Math.min(5,hpLoss)*1.15+Math.min(injured,friends.length*2)*1.2+Math.min(25,urgency)*.2;
   if(hero.hp<=8)score+=8;
   reason='Soigner les blessés';}
 }else if(ability==='spell_buff'){
  if(friends.length){score=1+friends.length*4.2+Math.min(20,urgency)*.18;
   reason='Renforcer la ligne';}
 }else if(ability==='spell_silence'){
  const target=silenceTarget(b,'e',laneInfo.lane);
  if(target){score=3+silenceValue(target.u)*1.2+Math.min(22,urgency)*.35;reason='Neutraliser une capacité dangereuse';}
 }else if(ability==='spell_teleport'){
  const plan=teleportPlan(b,'e',laneInfo.lane),gain=teleportGain(b,'e',plan);
  if(gain>=2){score=5+gain;reason='Repositionner un allié';}
 }else if(ability==='spell_trap'){
  const plan=trapPlan(b,'e',laneInfo.lane);
  if(plan&&threats.some(({u,col})=>col<plan.col&&u.stun<=0&&plan.col-col<=3*(activeAbility(b,u)==='haste'?2:1))){
   score=4+Math.min(20,urgency)*.5;reason='Préparer une embuscade';
  }
 }else if(ability==='spell_hasten'){
  const target=accelerationTarget(b,'e');
  if(target){score=5+Math.min(2,target.wait)*2.4;reason='Accélérer une carte en attente';}
 }else if(ability==='spell_slow'){
  // Score fixe : aucune lecture des cartes privées du joueur pour décider.
  score=6;reason='Ralentir la main adverse';
 }else if(ability==='spell_ward'){
  const room=Math.max(0,15-hero.shield);
  if(room>0){score=room>=5?2+Math.min(5,room)*.5+Math.min(25,urgency)*.38 : -Infinity;
   reason='Protéger la couronne';}
 }
 if(!Number.isFinite(score))return null;
 return {score:finite(score),reason};
}

// Biais explicites, sans dés ni avantage caché. Chaque style dispose des mêmes
// cartes, du même déploiement (2/tour) et des mêmes statistiques de combat.
export function personalityBonus(b,card,laneInfo){
 const style=aiStyle(b),{threats,friends,urgency,guard}=laneInfo;
 const allies=friends.filter(({u})=>CARDS[u.id]?.faction===card.faction).length;
 const empty=threats.length===0&&friends.length===0;
 let bonus=0;
 if(style==='assaut'){
  if(card.type==='unité') bonus+=3.4+card.attack*.8+(card.delay<=1?2:0)+(empty?3:0)+(card.ability==='haste'?2:0);
  if(card.ability==='spell_bolt')bonus+=3.5;
  if(card.ability==='spell_heal'||card.ability==='spell_ward')bonus-=4;
 }else if(style==='bastion'){
  if(card.type==='unité')bonus+=Math.min(14,urgency)*.35+(GUARD_IDS.has(card.id)?9:0)+card.hp*.23;
  if(card.ability==='spell_heal')bonus+=7;
  if(card.ability==='spell_ward')bonus+=7;
  if(card.ability==='spell_root'&&threats.length)bonus+=5;
  if(card.ability==='spell_bolt')bonus-=2;
  if(guard&&GUARD_IDS.has(card.id))bonus-=3;
 }else if(style==='rituel'){
  if(card.type==='sort')bonus+=5;
  if(card.ability==='spell_storm'&&threats.length>=2)bonus+=8;
  if(card.ability==='spell_root'&&threats.length)bonus+=5;
  if(card.type==='unité'&&(['ranged','splash','heal'].includes(card.ability)))bonus+=4;
 }else if(style==='meute'){
  if(card.type==='unité')bonus+=2+allies*6+(card.ability==='haste'?3:0)+(empty?1.5:0);
  if(card.type==='sort')bonus-=1;
 }
 if(aiEnraged(b)){
  // À mi-vie, le boss change de PRIORITÉ ; il ne reçoit aucune nouvelle carte.
  if(card.type==='unité')bonus+=2+card.attack*.7+(card.ability==='haste'?2:0);
  if(card.ability==='spell_bolt'||card.ability==='spell_storm')bonus+=6;
  if(card.ability==='spell_heal'||card.ability==='spell_ward')bonus-=4;
 }
 return bonus;
}

// Chaque appel recalcule les options pour tenir compte de la première carte jouée.
// La liste est pure : aucun RNG ni modification du combat, donc facilement testable.
export function rankEnemyMoves(b){
 if(!b||b.status!=='active'||!b.heroes?.e)return [];
 const rows=Array.from({length:laneCount(b)},(_,lane)=>inspectEnemyLane(b,lane));
 const results=[];
 b.heroes.e.hand.forEach((entry,index)=>{
  const card=CARDS[entry.id];if(!card||entry.wait>0) return;
  rows.forEach(row=>{
   const rank=scoreOption(b,card,row);
   if(rank&&rank.score+personalityBonus(b,card,row)>0)results.push({index,lane:row.lane,id:entry.id,...rank,score:rank.score+personalityBonus(b,card,row)});
  });
 });
 return results.sort((a,z)=>z.score-a.score||a.index-z.index||a.lane-z.lane);
}
