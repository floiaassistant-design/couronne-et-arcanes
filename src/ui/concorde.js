// Présentation seulement : l'état actif est fourni par formationBonus du moteur.
import {FACTIONS} from '../data.js';

// Zones des emblèmes déjà peints, en pourcentage du cadre complet 768 × 1152.
// Une copie locale de ces pixels s'éclaire ; aucune nouvelle illustration.
const EMBLEMS=Object.freeze({
 aube:{box:[82,2.2,16,11],glow:'#ffe3a0',symbol:'☀'},
 sylve:{box:[79.5,2,19,14.5],glow:'#bce6a0',symbol:'❧'},
 ombre:{box:[81,1.8,18,12],glow:'#d8d0f0',symbol:'☾'},
 forge:{box:[78.5,1.7,20,13.5],glow:'#ffd09b',symbol:'⚒'},
 ether:{box:[79.2,1.6,19.5,15.2],glow:'#a7dfff',symbol:'◇'}
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
 if(card?.type!=='unité'||!EMBLEMS[card.faction])return '';
 return 'Bonus de faction : +1 attaque';
}

export function concordeDetails(card,esc,active=null){
 const description=concordeDescription(card);if(!description)return '';
 const state=active===null?'available':active?'active':'inactive';
 return `<p class="concorde-description" data-concorde-state="${state}"><span class="concorde-symbol" role="img" aria-label="${esc(FACTIONS[card.faction].short)}">${EMBLEMS[card.faction].symbol}</span> ${esc(description)}${active===false?' <span class="concorde-state">(inactif)</span>':''}</p>`;
}
