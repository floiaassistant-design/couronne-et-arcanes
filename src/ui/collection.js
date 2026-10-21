import {generatedCardFace} from './generated-card.js';
// Catalogue en lecture : les versions à concevoir ne créent jamais de cartes.
import {CARDS,FACTIONS} from '../data.js';
import {visualFor,artSrc,UI_BACKGROUNDS,cardTemplateFor} from '../visuals.js';

export const COLLECTION_RANKS=Object.freeze([
 {id:'commun',name:'Commune'},
 {id:'rare',name:'Rare'},
 {id:'épique',name:'Épique'},
 {id:'légendaire',name:'Légendaire'},
 {id:'divine',name:'Divine'},
 {id:'éveillée',name:'Éveillée'}
]);

export function collectionEntries(profile,faction='all',ownedOnly=false){
 return Object.values(CARDS).filter(c=>(faction==='all'||c.faction===faction)&&
  (!ownedOnly||(profile.collection[c.id]||0)>0));
}

function futureCard(card,rarity,esc){
 if(cardTemplateFor(card))return `<div class="unit-card collection-future generated-template" data-rarity="${rarity}">${generatedCardFace(card,{delay:'—',description:rarity==='éveillée'?'Forme éveillée à concevoir.':'Évolution à concevoir.',esc})}</div>`;
 const visual=visualFor(card);
 return `<div class="unit-card collection-future" data-rarity="${rarity}">
  <div class="portrait creature-portrait role-${visual.role}"><img class="creature-image" src="${artSrc(visual.art)}" alt="" loading="lazy" draggable="false" /><span class="portrait-emblem" aria-hidden="true">${card.icon}</span></div>
  <div class="card-title">${esc(card.name)}</div>
  <div class="card-detail">${rarity==='éveillée'?'Forme éveillée à concevoir.':'Évolution à concevoir.'}</div>
  <div class="card-stats" aria-label="Attaque et vie à définir"><span class="stat atk">⚔ <b>—</b></span><span class="stat hp">♥ <b>—</b></span></div>
 </div>`;
}

function versionCell(profile,card,rank,{btn,cardUI,esc}){
 const current=rank.id===card.rarity,owned=current?(profile.collection[card.id]||0):0;
 const attrs=`data-id="${card.id}" data-rarity="${rank.id}"`;
 const status=current?(owned?`✓ Possédée ×${owned}`:'Non possédée'):'À concevoir';
 return `<td data-card-id="${card.id}" data-collection-rarity="${rank.id}" data-current-version="${current}">
  <article class="collection-version ${current?'current-version':'future-version'}" aria-label="${esc(card.name)} · ${rank.name} · ${status}">
   <div class="collection-card-visual"><span class="collection-delay" aria-label="${current?'Délai de base : '+card.delay:'Délai à définir'}">${current?card.delay:'—'}</span>
    ${current?cardUI(card.id):futureCard(card,rank.id,esc)}
   </div>
   <div class="collection-possession ${owned?'is-owned':''}">${status}</div>
   <div class="collection-card-actions">${btn('Fiche','collection-inspect',attrs,'small ghost')}
    ${current&&owned?`<span class="collection-deck-actions">${btn('+','deck-add',`data-id="${card.id}" aria-label="Ajouter ${esc(card.name)} au deck"`,'small')}${btn('−','deck-remove',`data-id="${card.id}" aria-label="Retirer ${esc(card.name)} du deck"`,'small ghost')}</span>`:''}
   </div>
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
   <section class="collection-catalogue" aria-labelledby="collection-order-title"><div class="collection-order-heading"><h2 id="collection-order-title">${esc(title)}</h2><p>Les versions « À concevoir » seront complétées au fil de la création des cartes.</p></div>
   ${units.length?`<div class="collection-table-scroll" role="region" aria-label="Évolutions des créatures ; défilement horizontal sur petit écran" tabindex="0"><table class="collection-table"><thead><tr><th scope="col">Personnage</th>${COLLECTION_RANKS.map(r=>`<th scope="col" data-rarity="${r.id}">${r.name}</th>`).join('')}</tr></thead><tbody>${units.map(c=>`<tr data-collection-character="${c.id}"><th scope="row" class="collection-character"><h3>${esc(c.name)}</h3><p>${esc(FACTIONS[c.faction].short)}</p></th>${COLLECTION_RANKS.map(r=>versionCell(profile,c,r,helpers)).join('')}</tr>`).join('')}</tbody></table></div>`:''}
   ${!units.length&&!spells.length?'<p class="hint">Aucune carte ne correspond à ce filtre.</p>':''}
   </section>
   ${spells.length?`<section class="collection-spells"><h2>Sorts et compétences</h2><div class="card-grid">${spells.map(c=>cardUI(c.id,{canEdit:true})).join('')}</div></section>`:''}
  </div>`;
}

export function collectionInspection(profile,id,rarity,{btn,cardUI,esc}){
 const card=CARDS[id],rank=COLLECTION_RANKS.find(r=>r.id===rarity);
 if(!card||!rank)return null;
 const current=card.rarity===rarity,owned=current?(profile.collection[id]||0):0;
 return `<section class="collection-inspection"><div class="kicker">${esc(FACTIONS[card.faction].short)} · ${rank.name}</div><h2>${esc(card.name)}</h2>
  <div class="collection-inspection-card">${current?cardUI(id):futureCard(card,rarity,esc)}</div>
  <p>${current?esc(card.description):'Cette évolution est à concevoir. Ses statistiques, ses capacités et ses conditions d’obtention seront précisées lors de sa création.'}</p>
  <p>${current?(owned?`Vous possédez ${owned} exemplaire${owned>1?'s':''} de cette carte.`:'Vous ne possédez pas encore cette carte.'):'Cette version ne peut pas encore être ajoutée au deck.'}</p>
  <div class="button-row">${btn('Fermer','close-modal','','primary')}</div></section>`;
}
