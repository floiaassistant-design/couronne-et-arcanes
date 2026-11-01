// Épreuves et résultat : lecture du moteur et des cartes, aucune attribution ici.
import {CARDS,CAMPAIGN,FACTIONS} from '../data.js';
import {EVOLUTION_TRIALS,ALL_EVOLUTION_ASCENSIONS} from '../evolution-trials.js';
import {evolutionTrialAccess,trialReward} from '../engine/evolution-progress.js';
import {trialObjectiveText,trialObjectiveState} from '../engine/trial-objectives.js';
import {EVOLUTION_FUSION_COPIES,EVOLUTION_FUSIONS} from '../evolution-fusion.js';
import {CARD_RARITIES} from '../cards/schema.js';

export function trialBattleObjective(battle,esc){
 const state=trialObjectiveState(battle);if(!state)return '';
 const progress=state.checks?`<ul>${state.checks.map(c=>`<li>${c.met?'✓':'○'} ${esc(c.label)}</li>`).join('')}</ul>`:`<p>${esc(state.label)} : ${state.value}/${state.target} · meilleur exemplaire vivant${state.achieved?' · Défi rempli':''}</p>`;
 return `<details class="trial-combat-objective"><summary aria-label="Objectif de l’épreuve"><span role="status">Défi · ${state.value}/${state.target}${state.achieved?' ✓':''}</span></summary><div class="trial-objective-panel"><p>${esc(state.text)}</p>${progress}</div></details>`;
}

function renderAscensions(profile,battle,{btn,esc}){
 return `<section class="spaced"><h2 class="section-title">Les grandes ascensions</h2><p class="page-sub">Deux défis communs par faction, pour l’Aube et la Sylve. Une réussite débloque les fusions de ce rang pour les personnages de cette faction. Chaque carte demande ensuite ${EVOLUTION_FUSION_COPIES} copies libres du rang précédent ; aucune carte n’est offerte par l’épreuve.</p><div class="trial-grid">${ALL_EVOLUTION_ASCENSIONS.map(t=>{
  const access=evolutionTrialAccess(profile,t.id,battle),rank=CARD_RARITIES.find(r=>r.id===t.to).name,faction=FACTIONS[t.faction].short,count=EVOLUTION_FUSIONS.filter(r=>r.ascension===t.id).length;
  return `<article class="card-panel ascension-card" data-trial-id="${esc(t.id)}"><div class="kicker">ASCENSION ${esc(faction)} · RANG ${esc(rank)}</div><h2>${esc(t.name)}</h2><span class="pill">${access.completed?'✓ Fusions débloquées':`${count} fusions à débloquer`}</span><p class="trial-objective">${esc(trialObjectiveText(t))}</p><p><b>Récompense :</b> accès au rang ${esc(rank)} pour ${esc(faction)} par fusion, sans coût ni copie consommée pour tenter l’épreuve. Pas d’or, d’éclats ou d’XP.</p><p class="hint">${access.ok?'Objectif annoncé : préparez votre deck pour ce combat de boss.':esc(access.reason)}</p>${btn(access.completed?'Ascension accomplie':'Tenter l’ascension','trial-start',`data-id="${esc(t.id)}" ${!access.ok?'disabled':''}`,'primary')}</article>`;
 }).join('')}</div></section>`;
}

export function renderEvolutionTrials(profile,battle,{btn,cardUI,esc}){
 const busy=!!battle&&(battle.status==='active'||!battle.rewardGiven),boss=CAMPAIGN.find(m=>m.id==='03');
 return `<section class="evolution-trials"><header><div class="kicker">LES ÉPREUVES DES FACTIONS</div><h1 class="page-title">Méritez vos évolutions</h1><p class="page-sub">Les grandes ascensions ouvrent les rangs Divin et Éveillé. Les quatre défis de personnage ci-dessous restent une autre voie d’obtention des premières évolutions.</p>${btn('Préparer mon deck','nav','data-page="deck"','ghost')}</header>
  ${renderAscensions(profile,battle,{btn,esc})}
  <div class="card-panel trial-boss-gate"><h2 class="section-title">Le premier boss ouvre la suite</h2><p>Vaincre ${esc(boss.enemy)} dans « ${esc(boss.name)} » ouvre l’épreuve du Milicien Épique, après celle du Milicien Rare.</p><span class="pill">${profile.completed.includes(boss.id)?'✓ Boss déjà vaincu':'Boss à vaincre en campagne'}</span></div>
  ${busy?'<div class="hint red">Terminez le combat en cours avant de commencer une épreuve.</div>':''}
  <div class="trial-grid">${EVOLUTION_TRIALS.map(t=>{
   const access=evolutionTrialAccess(profile,t.id),name=CARDS[t.cardId].name;
   return `<article class="card-panel trial-card" data-trial-id="${t.id}"><div class="section-caption">${access.completed?'✓ ÉVOLUTION OBTENUE':access.ok?'ÉPREUVE DISPONIBLE':'ÉPREUVE VERROUILLÉE'}</div><h2>${esc(t.name)}</h2><div class="trial-reward-card">${cardUI(trialReward(t),{previewContext:'reward'})}</div><p class="trial-objective">${esc(trialObjectiveText(t))}</p><p><b>Récompense garantie :</b> 1 ${esc(name)} ${esc(t.from)} devient ${esc(t.to)}.</p><p class="hint">Une seule récompense. Aucun coût, aucun tirage, aucun exemplaire consommé en cas d’échec. Pas d’or, d’éclats ou d’XP accordés par ces épreuves.</p><div class="trial-start">${access.ok?'<p class="hint green">Objectif et récompense annoncés : à vous de jouer.</p>':`<p class="hint">${esc(access.reason)}</p>`}${btn(access.completed?'Évolution obtenue':'Commencer l’épreuve','trial-start',`data-id="${t.id}" ${!access.ok||busy?'disabled':''}`,'primary')}</div></article>`;
  }).join('')}</div>
 </section>`;
}

export function evolutionTrialResult(reward,{btn,cardUI,esc}){
 return `<div class="kicker">ÉPREUVE D’ÉVOLUTION</div><h2>${reward.unlocked?'Ascension accomplie !':reward.evolved?'Évolution obtenue !':reward.victory?'Objectif à retenter':'Épreuve perdue'}</h2>
  ${reward.unlocked?`<p>Les fusions du rang ${esc(CARD_RARITIES.find(r=>r.id===reward.trial.to).name)} pour ${esc(FACTIONS[reward.trial.faction].short)} sont débloquées dans Alchimie. Chaque carte demande ${EVOLUTION_FUSION_COPIES} exemplaires libres du rang précédent. Votre deck et vos stocks sont conservés ; aucune carte n’a été offerte.</p>`:reward.evolved?`<p>Un exemplaire a été transformé. Il est disponible dans votre Collection et le deck a été mis à jour.</p><div class="trial-result-card">${cardUI(reward.card,{previewContext:'reward'})}</div>`:`<p>${esc(reward.reason||'Épreuve non validée. Aucun exemplaire consommé.')}</p>`}
  <div class="button-row">${btn('Retour aux épreuves','trial-exit','data-page="trials"','primary')}${btn('Voir mon deck','trial-exit','data-page="deck"','ghost')}</div>`;
}
