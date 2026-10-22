import {esc} from './markup.js';
import {generatedCardFace} from './generated-card.js';
// Présentation des vraies unités sur leurs cases. Ni règles, ni partie préfabriquée.
import {CARDS,FACTIONS} from '../data.js';
import {visualFor,artSrc,cardTemplateFor} from '../visuals.js';
// Deux silhouettes distinctes : le camp reste lisible sans dépendre de la couleur.
export function campSeal(side){
 const enemy=side==='e';
 return `<svg class="board-camp-seal" data-camp="${enemy?'e':'p'}" viewBox="0 0 24 28" aria-hidden="true" focusable="false"><path class="camp-seal-body" d="${enemy?'M12 1 23 14 12 27 1 14Z':'M2 2H22V13C22 20 17 24 12 27 7 24 2 20 2 13Z'}"/><path class="camp-seal-mark" d="${enemy?'M8 9 16 19M16 9 8 19':'M7 11 12 16 17 11'}"/></svg>`;
}
export function boardCard(u,attack=u.atk){
 const c=CARDS[u.id],v=visualFor(c,{cards:true});
 return `<button type="button" class="board-card ${cardTemplateFor(c)?'generated-board':''}" data-unit-id="${esc(u.uid)}" aria-controls="hand-card-inspection" aria-expanded="false" data-card-id="${u.id}" data-side="${u.side}" aria-label="${u.side==='e'?'Unité adverse':'Votre unité'}, ${esc(c.name)} : attaque ${attack}, vie ${u.hp} sur ${u.maxhp}">
 ${cardTemplateFor(c)?generatedCardFace(c,{stats:{atk:attack,hp:u.hp},delay:0,kind:'deployed',board:true,esc}):` <img class="board-card-art" src="${artSrc(v.art)}" alt="" draggable="false"><span class="board-card-order">${esc(FACTIONS[c.faction].short)}</span>
 <span class="board-card-name">${esc(c.name)}</span><span class="board-card-stats"><span>⚔ <b>${attack}</b></span><span>♥ <b>${u.hp}</b></span></span>`}

 ${campSeal(u.side)}</button>`;
}
