// Épreuves et résultat : lecture du moteur et des cartes, aucune attribution ici.
import {CARDS,CAMPAIGN} from '../data.js';
import {EVOLUTION_TRIALS} from '../evolution-trials.js';
import {evolutionTrialAccess,trialReward} from '../engine/evolution-progress.js';
import {trialObjectiveText,trialObjectiveState} from '../engine/trial-objectives.js';

export function trialBattleObjective(battle,esc){
 const state=trialObjectiveState(battle);if(!state)return '';
 return `<details class="trial-combat-objective"><summary aria-label="Objectif de l’épreuve"><span role="status">Défi · ${state.value}/${state.target}${state.achieved?' ✓':''}</span></summary><div class="trial-objective-panel"><p>${esc(state.text)}</p><p>${esc(state.label)} : ${state.value}/${state.target} · meilleur exemplaire vivant${state.achieved?' · Défi rempli':''}</p></div></details>`;
}

export function renderEvolutionTrials(profile,battle,{btn,cardUI,esc}){
 const busy=battle?.status==='active',boss=CAMPAIGN.find(m=>m.id==='03');
 return `<section class="evolution-trials"><header><div class="kicker">LES ÉPREUVES DE L’AUBE</div><h1 class="page-title">Méritez vos évolutions</h1><p class="page-sub">Accomplissez son défi, puis remportez la bataille avec le même exemplaire encore vivant. Un seul exemplaire évolue ; sa place dans votre deck est conservée.</p>${btn('Préparer mon deck','nav','data-page="deck"','ghost')}</header>
  <div class="card-panel trial-boss-gate"><h2 class="section-title">Le premier boss ouvre la suite</h2><p>Vaincre ${esc(boss.enemy)} dans « ${esc(boss.name)} » ouvre l’épreuve du Milicien Épique, après celle du Milicien Rare.</p><span class="pill">${profile.completed.includes(boss.id)?'✓ Boss déjà vaincu':'Boss à vaincre en campagne'}</span></div>
  ${busy?'<div class="hint red">Terminez le combat en cours avant de commencer une épreuve.</div>':''}
  <div class="trial-grid">${EVOLUTION_TRIALS.map(t=>{
   const access=evolutionTrialAccess(profile,t.id),name=CARDS[t.cardId].name;
   return `<article class="card-panel trial-card" data-trial-id="${t.id}"><div class="section-caption">${access.completed?'✓ ÉVOLUTION OBTENUE':access.ok?'ÉPREUVE DISPONIBLE':'ÉPREUVE VERROUILLÉE'}</div><h2>${esc(t.name)}</h2><div class="trial-reward-card">${cardUI(trialReward(t),{previewContext:'reward'})}</div><p class="trial-objective">${esc(trialObjectiveText(t))}</p><p><b>Récompense garantie :</b> 1 ${esc(name)} ${esc(t.from)} devient ${esc(t.to)}.</p><p class="hint">Une seule récompense. Aucun coût, aucun tirage, aucun exemplaire consommé en cas d’échec. Pas d’or, d’éclats ou d’XP accordés par ces épreuves.</p><div class="trial-start">${access.ok?'<p class="hint green">Objectif et récompense annoncés : à vous de jouer.</p>':`<p class="hint">${esc(access.reason)}</p>`}${btn(access.completed?'Évolution obtenue':'Commencer l’épreuve','trial-start',`data-id="${t.id}" ${!access.ok||busy?'disabled':''}`,'primary')}</div></article>`;
  }).join('')}</div>
 </section>`;
}

export function evolutionTrialResult(reward,{btn,cardUI,esc}){
 return `<div class="kicker">ÉPREUVE DE L’AUBE</div><h2>${reward.evolved?'Évolution obtenue !':reward.victory?'Objectif à retenter':'Épreuve perdue'}</h2>
  ${reward.evolved?`<p>Un exemplaire a été transformé. Il est disponible dans votre Collection et le deck a été mis à jour.</p><div class="trial-result-card">${cardUI(reward.card,{previewContext:'reward'})}</div>`:`<p>${esc(reward.reason||'Épreuve non validée. Aucun exemplaire consommé.')}</p>`}
  <div class="button-row">${btn('Retour aux épreuves','trial-exit','data-page="trials"','primary')}${btn('Voir mon deck','trial-exit','data-page="deck"','ghost')}</div>`;
}
