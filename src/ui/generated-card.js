// Carte dessinée complète : zones normalisées, valeurs fournies par les vues.
import {cardTemplateFor,cardTemplateSrc} from '../visuals.js';

export const GENERATED_CARD_FIELDS=Object.freeze({
 counter:[6,5,17,11],name:[12,69.6,76,5.6],description:[23,77.3,54,14],
 attack:[3.5,83.5,18,12],health:[78.5,83.5,18,12]
});
const zone=name=>{const [x,y,w,h]=GENERATED_CARD_FIELDS[name];return `data-card-field="${name}" style="left:${x}%;top:${y}%;width:${w}%;height:${h}%"`;};
export function generatedCardFace(card,{stats=null,delay=card.delay,description=card.description,kind='base',board=false,esc}){
 const key=cardTemplateFor(card);if(!key)return '';
 return `<div class="generated-face" data-card-template="${key}">
  <img class="creature-image generated-card-image ${board?'board-card-art':''}" src="${cardTemplateSrc(key)}" alt="" data-artwork-status="approved" draggable="false" />
  <span class="generated-counter illustrated-count" ${zone('counter')} data-delay-kind="${kind}" aria-label="${kind==='remaining'?'Attente restante':kind==='deployed'?'Déployée, attente':'Délai de base'} : ${delay}"><b>${delay}</b></span>
  <div class="card-title ${board?'board-card-name':''}" ${zone('name')}>${esc(card.name)}</div>
  <div class="card-detail" ${zone('description')}>${esc(description)}</div>
  <div class="card-stats ${board?'board-card-stats':''}" aria-label="${stats?'Attaque et vie actuelles':'Attaque et vie à définir'}"><span class="stat atk" ${zone('attack')}>⚔ <b>${stats?.atk??'—'}</b></span><span class="stat hp" ${zone('health')}>♥ <b>${stats?.hp??stats?.maxhp??'—'}</b></span><span class="stat cd">◷ <b>${delay}</b></span></div>
 </div>`;
}
