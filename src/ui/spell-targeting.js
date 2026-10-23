// Rendu pur du ciblage et de la projection calculée par le moteur.
import {CARDS} from '../data.js';
import {spellTargetOptions} from '../engine/spell-targeting.js';
import {frameChanges} from './combat-steps.js';

export function spellSelection(b,index,target){
 const card=CARDS[b.heroes.p.hand[index]?.id];
 if(b.phase!=='player'||b.status!=='active'||card?.type!=='sort')return null;
 const plan=spellTargetOptions(b,'p',card);
 const option=plan.options.find(o=>!o.error&&o.lane===target?.lane);
 return {card,...plan,option};
}
export function spellCardState(selection,uid){
 if(!selection)return {};
 return {valid:selection.options.some(o=>!o.error&&o.selectors.includes(uid)),
  affected:selection.option?.affected.includes(uid)||false};
}
function predictionText(preview){
 if(!preview?.ok)return preview?.reason||'';
 const changes=frameChanges(preview.before,preview.after);
 return changes.map(c=>`${c.name} : `+[
  c.hp?`${c.hp>0?'+':'−'}${Math.abs(c.hp)} PV`:'',
  c.shield?`${c.shield>0?'+':'−'}${Math.abs(c.shield)} protection`:'',
  ...(c.effects||[])
 ].filter(Boolean).join(', ')).join(' · ');
}
export function spellTargetingUI(selection,target,preview,esc){
 if(!selection)return '';
 const {card,mode,options,option,reason}=selection;
 const hint=mode==='first'?'Cliquez le premier ennemi sur sa ligne.':mode==='blessing'?'Cliquez l’allié le plus blessé de sa ligne.':mode==='silence'?'Cliquez la cible du silence mise en évidence.':mode==='enemy-line'||mode==='chain'?'Cliquez un ennemi autorisé pour choisir sa ligne.':mode==='ally-line'?'Cliquez un allié pour choisir sa ligne.':mode==='destination'?'Choisissez la ligne de destination.':mode==='trap'?'Choisissez la ligne du piège.':'Cibles automatiques : aucune sélection nécessaire.';
 const movement=option?.cells?.length?option.cells.map(c=>`Case ${c.col}, ligne ${c.lane+1}`).join(' · '):'';
 const prediction=[predictionText(preview),preview?.detail,movement].filter(Boolean).join(' · ');
 const automatic=mode==='automatic',ready=option&&preview?.ok;
 return `<section class="spell-targeting" aria-label="Ciblage du sort"><div class="spell-target-heading"><b>${esc(card.name)}</b><button type="button" data-action="spell-cancel">Annuler</button></div><p>${esc(reason||hint)}</p>
 ${automatic?'':`<div class="spell-lanes" aria-label="Choisir la ligne du sort">${options.map(o=>`<button type="button" data-action="spell-lane" data-lane="${o.lane}" ${o.error?'disabled':''} aria-pressed="${option?.lane===o.lane}" title="${esc(o.error||'Prévisualiser cette ligne')}">Ligne ${o.lane+1}</button>`).join('')}</div>`}
 <div class="spell-prediction" role="status" aria-live="polite">${ready?esc(prediction||card.description)+(prediction?'': ' · Aucun changement de PV ou de protection.'):'Choisissez une cible ou une ligne autorisée pour voir les effets.'}</div>
 ${ready?`<button type="button" class="btn primary spell-confirm" data-action="spell-confirm">Lancer le sort${automatic?'':` · ligne ${target.lane+1}`}</button>`:''}<small>Confirmation : lancement immédiat. Les unités attaquent après validation du tour.</small></section>`;
}
