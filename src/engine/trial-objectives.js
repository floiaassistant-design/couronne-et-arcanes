// Objectifs d'épreuve : faits résolus du moteur et lecture pure des survivants.
import {CARDS} from '../data.js';
import {evolutionTrial} from '../evolution-trials.js';

const metrics=['turns','rangedDamage','ripostes','firstHit'];
const labels={turns:'Tours de survie',rangedDamage:'Dégâts à distance',ripostes:'Ripostes déclenchées',firstHit:'Premier coup réduit'};
const eligible=(q,u)=>u&&u.side==='p'&&u.hp>0&&u.id===q.cardId&&(u.rarity||CARDS[u.id]?.rarity)===q.rarity;
export function trialObjectiveText(t){
 if(!t?.goal)return t?.objective||'';
 const {metric,target}=t.goal,name=CARDS[t.cardId].name;
 const task=metric==='turns'?`Rester en vie pendant ${target} tours`:
  metric==='rangedDamage'?`Infliger ${target} dégâts à des unités ennemies depuis au moins deux cases`:
  metric==='ripostes'?`Déclencher ${target} Ripostes`:'Déclencher sa réduction du premier coup';
 return `${name} · rang ${t.from} : ${task}. Remporter ensuite la bataille avec ce même exemplaire encore vivant.`;
}
export function createTrialChallenge(t){
 return {version:1,cardId:t.cardId,rarity:t.from,metric:t.goal.metric,target:t.goal.target,text:trialObjectiveText(t),counts:{}};
}
export function validTrialChallenge(b){
 const q=b.trialChallenge;if(q===undefined)return true;
 const t=evolutionTrial(b.missionId);
 return !!q&&b.mode==='evolution-trial'&&!!t&&q.version===1&&q.cardId===t.cardId&&q.rarity===t.from&&
  metrics.includes(q.metric)&&Number.isSafeInteger(q.target)&&q.target>0&&q.target<=10000&&
  (q.metric!=='firstHit'||q.target===1)&&
  (q.lastRound===undefined||Number.isSafeInteger(q.lastRound)&&q.lastRound>=1&&q.lastRound<=b.round)&&
  typeof q.text==='string'&&q.text.length>0&&q.text.length<=1000&&
  !!q.counts&&typeof q.counts==='object'&&!Array.isArray(q.counts)&&Object.keys(q.counts).length<=1000&&
  Object.entries(q.counts).every(([uid,n])=>/^[1-9]\d*$/.test(uid)&&Number.isSafeInteger(Number(uid))&&Number.isSafeInteger(n)&&n>=0&&n<=1000000);
}
export function recordTrialFact(b,u,metric,amount){
 const q=b.trialChallenge;
 if(b.mode!=='evolution-trial'||q?.version!==1||q.metric!==metric||!eligible(q,u)||!Number.isFinite(amount)||amount<=0)return;
 q.counts[u.uid]=Math.min(1000000,(q.counts[u.uid]||0)+Math.floor(amount));
}
export function recordTrialTurn(b){
 const q=b.trialChallenge;
 if(b.mode!=='evolution-trial'||q?.metric!=='turns'||q.lastRound===b.round)return;
 q.lastRound=b.round;
 for(const row of b.board)for(const u of row)recordTrialFact(b,u,'turns',1);
}
export function trialObjectiveState(b){
 const t=evolutionTrial(b?.missionId);if(!t||b.mode!=='evolution-trial')return null;
 const q=b.trialChallenge;
 if(q===undefined){
  const alive=b.board.flat().some(u=>eligible({cardId:t.cardId,rarity:t.from},u));
  return {text:t.objective,legacy:true,achieved:alive,value:alive?1:0,target:1,label:'Personnage vivant'};
 }
 if(!validTrialChallenge(b))return {text:'Objectif sauvegardé invalide.',achieved:false,value:0,target:1,label:'Objectif'};
 const values=b.board.flat().filter(u=>eligible(q,u)).map(u=>q.metric==='firstHit'?(u.firstHitReductionUsed===true?1:0):(q.counts[u.uid]||0));
 const value=Math.max(0,...values);
 return {text:q.text,legacy:false,achieved:value>=q.target,value:Math.min(value,q.target),target:q.target,label:labels[q.metric]};
}
