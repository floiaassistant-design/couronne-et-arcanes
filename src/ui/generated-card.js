// Carte dessinée complète : zones normalisées, valeurs fournies par les vues.
import {cardTemplateFor,cardTemplateSrc} from '../visuals.js';
import {concordeLight} from './concorde.js';

export const GENERATED_CARD_FIELDS=Object.freeze({
 counter:[6,5,17,11],name:[12,69.6,76,5.6],description:[23,77.3,54,14],
 attack:[3.5,83.5,18,12],health:[78.5,83.5,18,12]
});
// Zones communes des cadres ornés ; images distinctes, entières.
export const SYLVE_CARD_FIELDS=Object.freeze({
 counter:[6,4.4,17.3,12.7],name:[12,68.7,76,6.2],description:[23,78.5,54,13.4],
 attack:[6.1,85.1,16.1,10.4],health:[80.7,85.1,16.1,10.4]
});
// Variante grimoire du pilote Lame de feu : aucun champ attaque ou vie.
export const SPELL_CARD_FIELDS=Object.freeze({
 counter:[5,5.4,18,10],name:[12.5,68.1,75,6],description:[13,77.8,74,14]
});
const layouts=Object.freeze({aube:GENERATED_CARD_FIELDS,sylve:SYLVE_CARD_FIELDS,ombre:SYLVE_CARD_FIELDS,forge:SYLVE_CARD_FIELDS,ether:SYLVE_CARD_FIELDS,sort:SPELL_CARD_FIELDS});
const zone=(fields,name)=>{const [x,y,w,h]=fields[name];return `data-card-field="${name}" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%"`;};
export function generatedCardFace(card,{stats=null,delay=card.delay,description=card.description,kind='base',board=false,concordeActive=false,esc}){
 const key=cardTemplateFor(card);if(!key)return '';
 const layout=card.type==='sort'?'sort':Object.hasOwn(layouts,card.faction)?card.faction:'aube',fields=layouts[layout];
 return `<div class="generated-face" data-card-template="${key}" data-generated-layout="${layout}" ${card.type==='unité'?`data-concorde="${concordeActive?'active':'inactive'}"`:''} data-long-description="${description.length>(layout==='ether'?140:160)}">
  <img class="creature-image generated-card-image ${board?'board-card-art':''}" src="${cardTemplateSrc(key)}" alt="" data-artwork-status="approved" draggable="false" />
  ${concordeLight(card,cardTemplateSrc(key),concordeActive)}
  <span class="generated-counter illustrated-count" ${zone(fields,'counter')} data-delay-kind="${kind}" aria-label="${kind==='remaining'?'Attente restante':kind==='deployed'?'Déployée, attente':'Délai de base'} : ${delay}"><b>${delay}</b></span>
  <div class="card-title ${board?'board-card-name':''}" ${zone(fields,'name')}>${esc(card.name)}</div>
  <div class="card-detail" ${zone(fields,'description')}>${esc(description)}</div>
  ${layout==='sort'?'':`<div class="card-stats ${board?'board-card-stats':''}" aria-label="${stats?'Attaque et vie actuelles':'Attaque et vie à définir'}"><span class="stat atk" ${zone(fields,'attack')}>⚔ <b>${stats?.atk??'—'}</b></span><span class="stat hp" ${zone(fields,'health')}>♥ <b>${stats?.hp??stats?.maxhp??'—'}</b></span><span class="stat cd">◷ <b>${delay}</b></span></div>`}
 </div>`;
}
