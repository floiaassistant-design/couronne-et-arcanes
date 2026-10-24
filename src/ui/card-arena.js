import {unitStatusBadges} from './unit-status.js';
import {esc} from './markup.js';
import {generatedCardFace} from './generated-card.js';
// Présentation des vraies unités sur leurs cases. Ni règles, ni partie préfabriquée.
import {CARDS,FACTIONS} from '../data.js';
import {visualFor,artSrc,cardTemplateFor} from '../visuals.js';
// Rond allié et losange adverse : deux petits repères sans dépendre de la couleur.
export function campSeal(side){
 const enemy=side==='e';
 return `<svg class="board-camp-seal" data-camp="${enemy?'e':'p'}" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path class="camp-seal-body" d="${enemy?'M6 1 11 6 6 11 1 6Z':'M6 1a5 5 0 1 0 0 10a5 5 0 1 0 0-10Z'}"/></svg>`;
}
export function boardCard(u,attack=u.atk,targeting=null,round=0,concordeActive=false){
 const c=CARDS[u.id],v=visualFor(c,{cards:true});
 return `<button type="button" class="board-card ${targeting?(targeting.valid?'spell-eligible':'spell-forbidden'):''} ${u.barrier>0?'protected-card':''} ${targeting?.affected?'spell-affected':''} ${cardTemplateFor(c)?'generated-board':''}" data-unit-id="${esc(u.uid)}" ${targeting?`data-action="${targeting.valid?'spell-target':'spell-invalid'}" data-lane="${targeting.lane}" aria-disabled="${!targeting.valid}"`: ''} aria-controls="hand-card-inspection" aria-expanded="false" data-card-id="${u.id}" data-side="${u.side}" aria-label="${u.side==='e'?'Unité adverse':'Votre unité'}, ${esc(c.name)} : attaque ${attack}, vie ${u.hp} sur ${u.maxhp}${concordeActive?', Concorde active : +1 ATQ incluse':''}${targeting?(targeting.valid?', Cible autorisée':', Cible interdite'):''}">
 ${cardTemplateFor(c)?generatedCardFace(c,{stats:{atk:attack,hp:u.hp},delay:0,kind:'deployed',board:true,concordeActive,esc}):` <img class="board-card-art" src="${artSrc(v.art)}" alt="" draggable="false"><span class="board-card-order">${esc(FACTIONS[c.faction].short)}</span>
 <span class="board-card-name">${esc(c.name)}</span><span class="board-card-stats"><span>⚔ <b>${attack}</b></span><span>♥ <b>${u.hp}</b></span></span>`}

 ${campSeal(u.side)}${unitStatusBadges(u,round)}</button>`;
}
