// Compte à rebours tactique : règles indépendantes du DOM et des sauvegardes.
import {CARDS} from '../data.js';
export const TEMPO_IDS=Object.freeze(['hourglass_surge','time_bind']);
export const TEMPO_MAX_WAIT=6;
const wait=c=>Number.isFinite(c?.wait)?Math.max(0,Math.trunc(c.wait)):0;
const options=(hand,allow)=>(hand||[]).map((card,index)=>({card,index,wait:wait(card)})).filter(allow);
// Choisir l'attente la plus longue, puis la carte la plus à gauche.
export function accelerationTarget(b,side){
 return options(b.heroes?.[side]?.hand,x=>x.wait>0).sort((a,z)=>z.wait-a.wait||a.index-z.index)[0]||null;
}
// Choisir la carte adverse la plus proche d'être jouable, sans communiquer son ID.
export function obstructionTarget(b,side){
 const other=side==='p'?'e':'p';
 return options(b.heroes?.[other]?.hand,x=>x.wait<TEMPO_MAX_WAIT).sort((a,z)=>a.wait-z.wait||a.index-z.index)[0]||null;
}
export function tempoTargetError(b,side,card){
 if(card.ability==='spell_hasten'&&!accelerationTarget(b,side))return 'Aucune autre carte de votre main ne possède un compte à rebours à accélérer.';
 if(card.ability==='spell_slow'&&!obstructionTarget(b,side))return 'Aucune carte adverse ne peut être ralentie.';
 return '';
}
export function resolveTempoSpell(b,side,card,note){
 if(card.ability==='spell_hasten'){
  const target=accelerationTarget(b,side);if(!target)return false;
  target.card.wait=Math.max(0,target.wait-2);
  note(b,side==='p'
   ? `Élan des Heures : ${CARDS[target.card.id]?.name||'une carte'} passe de ${target.wait} à ${target.card.wait} tour(s) d’attente.`
   : 'L’ennemi accélère une carte de sa main.');
  return true;
 }
 if(card.ability==='spell_slow'){
  const target=obstructionTarget(b,side);if(!target)return false;
  target.card.wait=Math.min(TEMPO_MAX_WAIT,target.wait+2);
  note(b,side==='p'
   ? 'Nœud du Temps : une carte de la main ennemie est retardée de 2 tours (maximum 6).'
   : 'L’ennemi retarde une de vos cartes de 2 tours (maximum 6).');
  return true;
 }
 return false;
}
