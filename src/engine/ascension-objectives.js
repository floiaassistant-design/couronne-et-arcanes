// Objectif commun à un Ordre : lecture de l'état réel, sans second moteur.
import {CARDS} from '../data.js';
import {CARD_RARITIES} from '../cards/schema.js';

export function ascensionObjectiveText(t){
 const q=t.goal;
 return `Gagner au plus tard au tour ${q.maxRound}, avec au moins ${q.distinct} personnages distincts de l’Aube encore vivants, dont un au rang ${CARD_RARITIES.find(r=>r.id===t.from).name}, et une couronne à au moins ${q.crownPercent} % de ses PV maximum.`;
}
export function createAscensionChallenge(t){
 return {version:2,faction:t.faction,rarity:t.from,...t.goal,text:ascensionObjectiveText(t)};
}
export function validAscensionChallenge(b,t){
 const q=b.trialChallenge;
 return b.mode==='evolution-trial'&&t?.kind==='ascension'&&!!q&&q.version===2&&q.faction===t.faction&&q.rarity===t.from&&
  Number.isSafeInteger(q.distinct)&&q.distinct>=1&&q.distinct<=10&&
  Number.isSafeInteger(q.crownPercent)&&q.crownPercent>=1&&q.crownPercent<=100&&
  Number.isSafeInteger(q.maxRound)&&q.maxRound>=1&&q.maxRound<=100&&
  typeof q.text==='string'&&q.text.length>0&&q.text.length<=1000;
}
export function ascensionObjectiveState(b,t){
 if(!validAscensionChallenge(b,t))return {text:'Objectif d’ascension invalide.',achieved:false,value:0,target:1,label:'Objectif',checks:[]};
 const q=b.trialChallenge,allies=b.board.flat().filter(u=>u?.side==='p'&&u.hp>0&&CARDS[u.id]?.faction===q.faction);
 const distinct=new Set(allies.map(u=>u.id)).size,crown=b.heroes.p;
 const checks=[
  {label:`Personnages Aube vivants : ${distinct}/${q.distinct}`,met:distinct>=q.distinct},
  {label:`Un personnage ${CARD_RARITIES.find(r=>r.id===q.rarity).name} encore vivant`,met:allies.some(u=>(u.rarity||CARDS[u.id].rarity)===q.rarity)},
  {label:`PV de la couronne : au moins ${q.crownPercent} %`,met:crown.hp>0&&crown.hp*100>=crown.maxhp*q.crownPercent},
  {label:`Victoire au plus tard au tour ${q.maxRound} (tour ${b.round})`,met:b.round<=q.maxRound}
 ];
 return {text:q.text,legacy:false,achieved:checks.every(c=>c.met),value:checks.filter(c=>c.met).length,target:checks.length,label:'Conditions remplies',checks};
}
