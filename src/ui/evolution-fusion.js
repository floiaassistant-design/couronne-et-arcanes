// Présentation des recettes, sans mutation du profil ni des stocks.
import {CARDS} from '../data.js';
import {EVOLUTION_FUSIONS,EVOLUTION_FUSION_COPIES} from '../evolution-fusion.js';
import {previewEvolutionFusion} from '../engine/evolution-fusion.js';

export function renderEvolutionFusions(profile,battle,{btn,cardUI,esc}){
 return `<section class="spaced evolution-fusions" aria-labelledby="evolution-fusion-title"><h2 class="section-title" id="evolution-fusion-title">Faire évoluer mes doublons</h2><p class="page-sub">${EVOLUTION_FUSION_COPIES} exemplaires du même personnage et du même rang deviennent 1 exemplaire du rang suivant. Aucun coût en or ou éclats, aucune chance d’échec. Seuls les exemplaires hors du deck sont consommés. Les rangs Rares s’ouvrent après la mission 01 ; les Épiques après le premier boss.</p><p class="hint">Évolutions de l’Aube jusqu’à Épique. La carte obtenue rejoint la Collection ; ajoutez-la ensuite dans Mon deck.</p><div class="card-grid">${EVOLUTION_FUSIONS.map(recipe=>{
  const plan=previewEvolutionFusion(profile,recipe.id,battle);
  return `<article class="evolution-fusion-recipe" data-fusion-id="${esc(recipe.id)}">${cardUI(plan.target,{previewContext:'alchemy'})}<div class="evolution-fusion-action"><h3>${esc(CARDS[recipe.cardId].name)}</h3><p>${recipe.copies} × ${esc(recipe.from)} → 1 × ${esc(recipe.to)}</p><p class="hint">${plan.owned} possédés · ${plan.used} dans le deck · ${Math.max(0,plan.available)} libres</p>${!plan.ok?`<p class="hint">${esc(plan.reason)}</p>`:''}${btn('Préparer la fusion','evolution-fusion-preview',`data-id="${esc(recipe.id)}" ${!plan.ok?'disabled':''}`,'primary')}</div></article>`;
 }).join('')}</div></section>`;
}

export function evolutionFusionConfirmation(plan,{btn,cardUI,esc}){
 const {recipe}=plan;
 return `<div class="kicker">FUSION DE DOUBLONS</div><h2>Confirmer cette évolution ?</h2><p><b>${recipe.copies} exemplaires ${esc(recipe.from)} de ${esc(CARDS[recipe.cardId].name)}</b> seront consommés pour créer <b>1 exemplaire ${esc(recipe.to)}</b>. Cette fusion est définitive.</p><div class="fusion-result-card">${cardUI(plan.target,{previewContext:'alchemy'})}</div><p>${plan.owned} → ${plan.owned-recipe.copies} exemplaires au rang de départ. Les ${plan.used} exemplaires dans votre deck sont conservés. Aucun or ni éclat dépensé.</p><div class="button-row">${btn(`Fusionner ces ${recipe.copies} exemplaires`,'evolution-fusion-confirm','','primary')}${btn('Annuler','close-modal','','ghost')}</div>`;
}
