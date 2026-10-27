// Construction manuelle : catalogue possédé et commandes du moteur existant.
import {CARDS,FACTIONS} from '../data.js';
import {deckOverview,modifyDeck,validateDeck} from '../engine.js';
import {cardPreviewAttributes} from './card-presentation.js';
import {cardId,cardKey,cardFromKey,cardRarity,ownedCardEntries,ownedCardCopies} from '../cards/references.js';

const searchable=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');
export function manualDeckCards(profile,{query='',faction='all',type='all'}={}){
 const needle=searchable(query).trim();
 return ownedCardEntries(profile).map(({reference})=>({...CARDS[cardId(reference)],rarity:cardRarity(reference),reference})).filter(c=>
  (!c.heroClass||c.heroClass===profile.heroClass)&&
  (faction==='all'||c.faction===faction)&&(type==='all'||c.type===type)&&
  (!needle||searchable(c.name+' '+c.description+' '+FACTIONS[c.faction].name).includes(needle)));
}

export function renderManualDeck(profile,{battle=null,filters={}}={}, {btn,cardUI,esc,quickDecks}){
 const {query='',faction='all',type='all'}=filters,busy=battle?.status==='active';
 const overview=deckOverview(profile.deck),invalid=validateDeck(profile),cards=manualDeckCards(profile,filters);
 // Le même validateur de modification décide des ajouts, sur une copie éphémère.
 const canAdd=id=>!busy&&modifyDeck({...profile,deck:[...profile.deck]},cardFromKey(id),1);
 function controls(id){
  const ref=cardFromKey(id),base=CARDS[cardId(ref)];
  const used=overview.counts[id]||0,owned=ownedCardCopies(profile,ref),name=esc(base.name+(typeof ref==='object'?' '+cardRarity(ref):''));
  return `<div class="manual-card-controls">${btn('−','deck-remove',`data-id="${id}" aria-label="Retirer un exemplaire de ${name}" ${busy||!used?'disabled':''}`,'small ghost')}<span><b>${used}</b> dans le deck<small>${owned} possédé${owned>1?'s':''}</small></span>${btn('+','deck-add',`data-id="${id}" aria-label="Ajouter un exemplaire de ${name}" ${canAdd(id)?'':'disabled'}`,'small')}</div>`;
 }
 const options=Object.entries(FACTIONS).map(([id,f])=>`<option value="${id}" ${faction===id?'selected':''}>${esc(f.short)}</option>`).join('');
 return `<div class="manual-deck-screen">
  <header class="manual-deck-header"><div><div class="kicker">VOTRE ARMÉE, VOS CHOIX</div><h1 class="page-title" id="manual-deck-title" tabindex="-1">Mon deck</h1><p class="page-sub">Choisissez vos cartes avec + et −. Votre deck s’enregistre automatiquement.</p></div>${btn('Voir toute la Collection','nav','data-page="collection"','ghost')}</header>
  ${busy?'<div class="hint red" role="status">Combat en cours : vous pouvez consulter vos cartes. Terminez ce combat pour modifier votre deck.</div>':''}
  <div class="manual-deck-layout">
   <section class="manual-card-library" aria-labelledby="manual-library-title"><h2 class="section-title" id="manual-library-title">Mes cartes disponibles</h2>
    <div class="manual-deck-filters"><label>Rechercher<input type="search" data-deck-field="query" value="${esc(query)}" placeholder="Nom d’une carte…" autocomplete="off"></label><label>Ordre<select data-deck-field="faction"><option value="all">Tous les ordres</option>${options}</select></label><label>Type<select data-deck-field="type"><option value="all">Unités et sorts</option><option value="unité" ${type==='unité'?'selected':''}>Unités</option><option value="sort" ${type==='sort'?'selected':''}>Sorts</option></select></label></div>
    <div class="manual-deck-results"><p class="hint">${cards.length} carte${cards.length>1?'s':''} différente${cards.length>1?'s':''} · Seules vos cartes possédées et compatibles avec votre classe sont proposées.</p>
    <div class="card-grid manual-card-grid" data-deck-zone="library">${cards.map(c=>`<article class="manual-card-entry" data-deck-card="${cardKey(c.reference)}">${cardUI(c.reference,{previewContext:'deck'})}${controls(cardKey(c.reference))}</article>`).join('')}</div>
    ${cards.length?'':'<div class="card-panel">Aucune carte ne correspond à ces filtres. Essayez un autre nom ou un autre ordre.</div>'}</div>
   </section>
   <aside class="card-panel manual-deck-aside" aria-labelledby="manual-current-title"><div class="section-caption">VOTRE COMPOSITION</div><h2 class="section-title" id="manual-current-title" tabindex="-1">Deck actif</h2>
    <div class="manual-deck-count"><strong>${overview.total}<small> / 24 cartes</small></strong><span>${overview.units} unités · ${overview.spells} sorts</span></div>
    <div class="hint ${invalid?'red':'green'}" role="status">${esc(invalid||'Deck prêt au combat.')}</div><p class="hint">Entre 12 et 24 cartes. Chaque exemplaire vient de votre Collection.</p>
    <div class="manual-deck-list" data-deck-zone="current">${Object.entries(overview.counts).map(([id,count])=>`<div class="manual-deck-row" data-deck-card="${id}"><span ${cardPreviewAttributes(cardId(cardFromKey(id)),cardRarity(cardFromKey(id)),'deck',esc)}><b>${count}×</b> ${esc(CARDS[cardId(cardFromKey(id))].name)}${typeof cardFromKey(id)==='object'?' · '+esc(cardRarity(cardFromKey(id))):''}</span>${controls(id)}</div>`).join('')||'<p class="hint">Votre deck est vide. Ajoutez vos premières cartes avec +.</p>'}</div>
    <div class="button-row">${btn('Aller en campagne','nav',`data-page="campaign" ${invalid?'disabled':''}`,'primary')}${btn('Repartir de zéro','deck-clear',busy||!overview.total?'disabled':'','ghost')}</div>
    <p class="hint">Les cartes retirées restent dans votre Collection.</p>
   </aside>
  </div>
  <details class="manual-deck-help"><summary>Besoin d’un point de départ ? Voir les compositions proposées</summary>${quickDecks}</details>
 </div>`;
}
