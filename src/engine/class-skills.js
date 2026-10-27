// Effets des compétences de classe : règles isolées du DOM et de la sauvegarde.
// Les unités anciennes sans barrier/rallyUntil restent totalement compatibles.
import {validLane} from './board.js';
import {grantSharedBarrier} from './battle-defense.js';
const own=(u,side)=>u&&u.hp>0&&u.side===side;
export function classSkillAllies(b,side,lane){return b.board[lane].filter(u=>own(u,side));}
export function classSkillEnemies(b,side,lane){
 const found=b.board[lane].map((u,col)=>u&&u.hp>0&&u.side!==side?{u,col}:null).filter(Boolean);
 return found.sort((a,z)=>side==='p'?a.col-z.col:z.col-a.col);
}
export function classSkillTargetError(b,side,card,lane){
 if(!card.heroClass)return '';
 if(!validLane(b,lane))return 'Ligne invalide.';
 const friendly=classSkillAllies(b,side,lane),foes=classSkillEnemies(b,side,lane),h=b.heroes[side];
 switch(card.ability){
  case 'spell_guard_wall':case 'spell_guard_rally':case 'spell_cleric_bless':
   return friendly.length?'':'Cette compétence demande une créature alliée sur la ligne.';
  case 'spell_cleric_light':
   return friendly.some(u=>u.hp<u.maxhp)?'':'Aucun allié blessé sur cette ligne.';
  case 'spell_arc_freeze':case 'spell_arc_chain':case 'spell_ranger_pierce':
   return foes.length?'':'Aucun ennemi sur cette ligne.';
  case 'spell_ranger_draw':
   return h.deck.length||h.discard.length?'':'Aucune carte disponible à piocher.';
  default:return 'Compétence inconnue.';
 }
}
export function blessingTarget(b,side,lane){
 return [...classSkillAllies(b,side,lane)].sort((a,z)=>a.hp/a.maxhp-z.hp/z.maxhp||a.uid-z.uid)[0]||null;
}
// Les effets sont déterministes ; hit() applique les armures, les barrières et les victimes.
export function resolveClassSkill(b,side,card,lane,hit){
 const friends=classSkillAllies(b,side,lane),foes=classSkillEnemies(b,side,lane),ability=card.ability;
 if(ability==='spell_guard_wall'){
  for(const u of friends)grantSharedBarrier(u,2,4);
 }else if(ability==='spell_guard_rally'){
  for(const u of friends)u.rallyUntil=Math.max(u.rallyUntil||0,b.round+1);
 }else if(ability==='spell_arc_freeze'){
  const u=foes[0].u;hit(b,u,1,side);if(u.hp>0)u.stun=Math.max(u.stun||0,2);
 }else if(ability==='spell_arc_chain'){
  hit(b,foes[0].u,3,side);
  if(foes[1])hit(b,foes[1].u,2,side);
 }else if(ability==='spell_ranger_pierce'){
  hit(b,foes[0].u,5,side,true);
 }else if(ability==='spell_ranger_draw'){
  // Le moteur pioche après avoir retiré la carte jouée de la main.
  return 2;
 }else if(ability==='spell_cleric_light'){
  for(const u of friends)u.hp=Math.min(u.maxhp,u.hp+3);
 }else if(ability==='spell_cleric_bless'){
  const target=blessingTarget(b,side,lane);
  grantSharedBarrier(target,4,6);
 }
 return 0;
}
