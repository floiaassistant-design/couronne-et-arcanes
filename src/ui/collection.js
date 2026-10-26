import {CARD_RARITIES} from '../cards/schema.js';
import {cardPresentation,cardInspectionContent} from './card-presentation.js';
// Catalogue en lecture : les versions à concevoir ne créent jamais de cartes.
import {CARDS,FACTIONS} from '../data.js';
import {UI_BACKGROUNDS} from '../visuals.js';

export const COLLECTION_RANKS=Object.freeze(CARD_RARITIES.map(r=>Object.freeze({...r,name:({commun:'Commune',divine:'Divine','éveillée':'Éveillée'})[r.id]||r.name})));

export function collectionEntries(profile,faction='all',ownedOnly=false){
 return Object.values(CARDS).filter(c=>(faction==='all'||c.faction===faction)&&
  (!ownedOnly||(profile.collection[c.id]||0)>0));
}

function versionCell(profile,card,rank,{btn,cardUI,esc}){
 const model=cardPresentation({id:card.id,rarity:rank.id},{profile});
 const current=rank.id===card.rarity,owned=current?(profile.collection[card.id]||0):0;
 const status=current?(owned?`✓ Possédée ×${owned}`:'Non possédée'):model.availability;
 return `<td data-card-id="${card.id}" data-collection-rarity="${rank.id}" data-current-version="${current}">
  <article class="collection-version ${current?'current-version':'future-version'} ${model.known?'known-version':'unknown-version'}" aria-label="${esc(card.name)} · ${rank.name} · ${status}">
   <div class="collection-card-visual" data-collection-preview data-card-id="${card.id}" data-rarity="${rank.id}" data-preview-context="collection" tabindex="0" aria-label="Aperçu de ${esc(card.name)}, ${rank.name}" aria-describedby="collection-hover-inspection">
    ${cardUI({id:card.id,rarity:rank.id},{previewContext:'collection'})}
   </div>
   <div class="collection-possession ${owned?'is-owned':''}">${status}</div>
   <div class="collection-card-actions">${current&&owned?`<span class="collection-deck-actions">${btn('+','deck-add',`data-id="${card.id}" aria-label="Ajouter ${esc(card.name)} au deck"`,'small')}${btn('−','deck-remove',`data-id="${card.id}" aria-label="Retirer ${esc(card.name)} du deck"`,'small ghost')}</span>`:''}</div>
  </article></td>`;
}

export function renderCollectionCatalogue(profile,{faction='aube',ownedOnly=false}={},helpers){
 const {btn,cardUI,esc}=helpers,list=collectionEntries(profile,faction,ownedOnly);
 const units=list.filter(c=>c.type==='unité'),spells=list.filter(c=>c.type==='sort');
 const tabs=['aube','sylve','ombre','forge','ether','sort','all'];
 const title=faction==='all'?'Les cinq ordres':FACTIONS[faction]?.name||'Les cinq ordres';
 return `<header class="collection-hero" data-collection-background="${UI_BACKGROUNDS.collection}">
   <div><div class="kicker">LES ARCHIVES DES CINQ ORDRES</div><h1 class="page-title">Votre collection</h1><p class="page-sub">Chaque créature sur sa ligne, toutes ses évolutions côte à côte.</p></div>
   <a class="btn ghost" href="#collection-deck">Mon deck et mes compétences ↓</a>
  </header>
  <div class="collection-content"><nav class="collection-factions" aria-label="Ordres de la collection">${tabs.map(id=>`<button type="button" data-action="collection-faction" data-id="${id}" aria-pressed="${faction===id}">${id==='all'?'Tous':id==='sort'?'Sorts':esc(FACTIONS[id].short)}</button>`).join('')}</nav>
   <div class="library-toolbar collection-toolbar"><label class="small"><input type="checkbox" id="owned-only" ${ownedOnly?'checked':''} /> Mes cartes uniquement</label><span class="pill">${list.length} cartes affichées</span></div>
   <section class="collection-catalogue" aria-labelledby="collection-order-title"><div class="collection-order-heading"><h2 id="collection-order-title">${esc(title)}</h2><p>Les évolutions prêtes sont testables au laboratoire ; leur obtention reste à définir. Les autres restent « À concevoir ».</p></div>
   ${units.length?`<div class="collection-table-scroll" role="region" aria-label="Évolutions des créatures ; défilement horizontal sur petit écran" tabindex="0"><table class="collection-table"><thead><tr><th scope="col">Personnage</th>${COLLECTION_RANKS.map(r=>`<th scope="col" data-rarity="${r.id}">${r.name}</th>`).join('')}</tr></thead><tbody>${units.map(c=>`<tr data-collection-character="${c.id}"><th scope="row" class="collection-character"><h3>${esc(c.name)}</h3><p>${esc(FACTIONS[c.faction].short)}</p></th>${COLLECTION_RANKS.map(r=>versionCell(profile,c,r,helpers)).join('')}</tr>`).join('')}</tbody></table></div>`:''}
   ${!units.length&&!spells.length?'<p class="hint">Aucune carte ne correspond à ce filtre.</p>':''}
   </section>
   ${spells.length?`<section class="collection-spells"><h2>Sorts et compétences</h2><div class="card-grid">${spells.map(c=>cardUI(c.id,{canEdit:true})).join('')}</div></section>`:''}
  </div>`;
}

// Adaptateur de compatibilité : même modèle et même fiche que toutes les vues.
export function collectionHoverContent(profile,id,rarity,esc){
 if(!COLLECTION_RANKS.some(r=>r.id===rarity))return null;
 const presentation=cardPresentation({id,rarity},{profile});if(!presentation)return null;
 return cardInspectionContent(presentation.card,{wait:0},presentation.stats,esc,{presentation,context:'collection'});
}
