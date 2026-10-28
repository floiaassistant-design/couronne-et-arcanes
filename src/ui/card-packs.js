// Prix, probabilités et résultats issus du même catalogue, sans opération métier.
import {CARDS} from '../data.js';
import {CARD_PACKS} from '../card-packs.js';
import {cardId,cardRarity} from '../cards/references.js';
import {previewCardPack} from '../engine/card-packs.js';

const rates=(pack,esc)=>`<ul class="pack-rates">${pack.groups.map(g=>`<li><span>${esc(g.label)}</span><b>${g.weight} %</b></li>`).join('')}</ul><p class="hint">Probabilités par carte, ${pack.count} tirages indépendants. Doublons possibles ; aucun rang garanti. Chaque carte du groupe a la même chance d’être tirée.</p>`;
function contents(pack,esc){
 return `<details class="pack-content"><summary>Voir les cartes possibles</summary>${pack.groups.map(g=>`<p><b>${esc(g.label)} :</b> ${g.cards.map(ref=>`${esc(CARDS[cardId(ref)].name)} (${esc(cardRarity(ref))})`).join(', ')}.</p>`).join('')}</details>`;
}
export function renderCardPackShop(profile,battle,{btn,esc}){
 return `<section class="spaced"><div class="section-caption">LE COMPTOIR DU MARCHAND</div><h2 class="section-title">Choisir un paquet</h2><p class="page-sub">Les cartes rejoignent votre Collection. Aucun paiement réel ni connexion requis.</p><div class="pack-shop-grid">${CARD_PACKS.map(pack=>{
  const access=previewCardPack(profile,pack.id,battle),evolution=pack.id!=='mystic';
  return `<article class="card-panel pack-offer" data-pack-id="${pack.id}"><h3>${esc(pack.name)}</h3><p><b>${pack.count} cartes · ${pack.cost} or</b></p>${rates(pack,esc)}${evolution?'<p class="hint">Après le premier boss. Les exemplaires gagnés servent au deck et à la fusion.</p>':''}${contents(pack,esc)}${!access.ok?`<p class="hint">${esc(access.reason)}</p>`:''}${btn(evolution?`Préparer l’ouverture · ${pack.cost} ◈`:`Ouvrir un paquet · ${pack.cost} ◈`,evolution?'card-pack-preview':'buy-pack',`data-id="${pack.id}" ${!access.ok?'disabled':''}`,'primary')}</article>`;
 }).join('')}</div></section>`;
}
export function cardPackConfirmation(pack,{btn,esc}){
 return `<div class="kicker">OUVERTURE DE PAQUET</div><h2>${esc(pack.name)}</h2><p>${pack.cost} or seront dépensés pour ${pack.count} cartes aléatoires.</p>${rates(pack,esc)}<div class="button-row">${btn(`Ouvrir pour ${pack.cost} or`,'card-pack-confirm','','primary')}${btn('Annuler','close-modal','','ghost')}</div>`;
}
export function cardPackResult(pack,cards,{btn,cardUI,esc}){
 return `<div class="kicker">${esc(pack.name).toUpperCase()}</div><h2>Trois nouvelles découvertes</h2><p>Ces cartes rejoignent votre collection. Ajoutez-les à votre deck pour les utiliser.</p><div class="three-grid">${cards.map(ref=>cardUI(ref,{previewContext:'pack'})).join('')}</div><div class="button-row" data-pack-result-actions>${btn('Voir ma collection','pack-collection','','primary')}${btn('Fermer','close-modal','','ghost')}</div>`;
}
