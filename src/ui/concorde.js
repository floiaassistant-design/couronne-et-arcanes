// Présentation seulement : l'état actif est fourni par formationBonus du moteur.
import {FACTIONS} from '../data.js';

// Zones des emblèmes déjà peints, en pourcentage du cadre complet 768 × 1152.
// Une copie locale de ces pixels s'éclaire ; aucune nouvelle illustration.
const EMBLEMS=Object.freeze({
 aube:{box:[82,2.2,16,11],glow:'#ffe3a0'},
 sylve:{box:[79.5,2,19,14.5],glow:'#bce6a0'},
 ombre:{box:[81,1.8,18,12],glow:'#d8d0f0'},
 forge:{box:[78.5,1.7,20,13.5],glow:'#ffd09b'},
 ether:{box:[79.2,1.6,19.5,15.2],glow:'#a7dfff'}
});

export function concordeLight(card,src,active){
 const emblem=card?.type==='unité'&&EMBLEMS[card.faction];
 if(!active||!emblem||!src)return '';
 const [x,y,w,h]=emblem.box;
 const style=`left:${x}%;top:${y}%;width:${w}%;height:${h}%;--concorde-glow:${emblem.glow}`;
 const crop=`background-image:url('${src}');background-size:${10000/w}% ${10000/h}%;background-position:${100*x/(100-w)}% ${100*y/(100-h)}%`;
 return `<span class="concorde-emblem-light" data-concorde-faction="${card.faction}" style="${style}" aria-hidden="true"><span class="concorde-emblem-pixels" style="${crop}"></span></span>`;
}

export function concordeDescription(card){
 if(card?.type!=='unité'||!FACTIONS[card.faction])return '';
 return `Bonus de faction — ${FACTIONS[card.faction].short} : dès que 2 unités alliées de cet Ordre sont sur la même ligne, chacune gagne +1 ATQ. La carte elle-même compte parmi les deux. Le bonus reste +1 avec davantage d'unités et cesse dès que la condition disparaît.`;
}

export function concordeDetails(card,esc,active=null){
 const description=concordeDescription(card);if(!description)return '';
 return `<p class="concorde-description">${esc(description)}${active===null?'':` <strong class="concorde-state">${active?'Actif : +1 ATQ incluse.':'Inactif sur cette unité.'}</strong>`}</p>`;
}
