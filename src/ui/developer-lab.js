// Panneau de configuration du même combat que la campagne, sans second moteur.
import {CARDS,FACTIONS,CLASSES} from '../data.js';
import {AI_STYLES} from '../ai.js';
import {labRarity,labLevel,labCardStats,LAB_RANKS} from '../engine/developer-lab.js';

export function developerLabUI(lab,{esc,btn}){
 const side=lab.side,id=lab.cardId,card=CARDS[id];
 const deck=lab.decks[side],counts={};
 for(const key of deck)counts[key]=(counts[key]||0)+1;
 const rarity=labRarity(lab,side,id),level=labLevel(lab,side,id);
 const stats=labCardStats(lab,side,id);
 const rankOptions=id==='militia'?LAB_RANKS:[card.rarity];
 const selections=Object.values(CARDS).filter(c=>!c.heroClass||c.heroClass===lab.heroClass)
  .map(c=>`<option value="${esc(c.id)}" ${c.id===id?'selected':''}>${esc(c.name)} · ${esc(FACTIONS[c.faction].short)}</option>`).join('');
 const option=(value,text,current)=>`<option value="${esc(value)}" ${value===current?'selected':''}>${esc(text)}</option>`;
 const deckRows=Object.entries(counts).map(([key,count])=>`<span class="lab-deck-card">${count}× ${esc(CARDS[key].name)}</span>`).join('');
 return `<section class="developer-lab">
  <div class="kicker">OUTIL TEMPORAIRE · SANS SAUVEGARDE</div>
  <h1 class="page-title">Laboratoire de combat</h1>
  <p class="page-sub">Même moteur, même IA et même plateau que le jeu. Les tests n'accordent ni XP, ni or, ni éclats et n'affectent pas votre aventure.</p>
  <div class="lab-controls">
   <div class="card-panel">
    <h2>Configuration</h2>
    <label>Classe du héros
     <select data-lab-field="heroClass">${Object.entries(CLASSES).map(([key,v])=>option(key,v.name,lab.heroClass)).join('')}</select>
    </label>
    <label>Stratégie de l’IA
     <select data-lab-field="aiStyle">${Object.entries(AI_STYLES).map(([key,v])=>option(key,v.name,lab.aiStyle)).join('')}</select>
    </label>
    <label>Composition à modifier
     <select data-lab-field="side">${option('p','Vos cartes',''+side)}${option('e','Cartes de l’IA',''+side)}</select>
    </label>
    <label>Carte
     <select data-lab-field="cardId">${selections}</select>
    </label>
    <div class="lab-deck-buttons">${btn('− Retirer','lab-remove','', 'ghost')}${btn('+ Ajouter','lab-add','','primary')}</div>
    <p class="hint">${side==='p'?'Votre deck':'Deck adverse'} : ${deck.length}/24 cartes, minimum 12. Les cartes sont utilisables sans possession réelle.</p>
    <div class="lab-deck-list">${deckRows}</div>
   </div>
   <div class="card-panel">
    <h2>Réglage de la carte</h2>
    <p><strong>${esc(card.name)}</strong> · délai ${card.delay} tour(s)</p>
    <label>Rareté
      <select data-lab-field="rarity">${rankOptions.map(r=>option(r,r.charAt(0).toUpperCase()+r.slice(1),rarity)).join('')}</select>
    </label>
    <label>Niveau d'amélioration
      <select data-lab-field="level">${[0,1,2,3].filter(n=>id!=='militia'||rarity==='commun'||n>0).map(n=>option(String(n),n===0?'Base (aucun achat)':`Niveau ${n}`,String(level))).join('')}</select>
    </label>
    <p class="lab-stats">Prévision en combat : <b>${card.type==='unité'?`${stats.atk} ATQ · ${stats.hp} PV`:'sort, valeurs inchangées'}</b></p>
    ${id==='militia'?`<p class="hint">Pilote Milicien : premier coup réduit de ${stats.block}, contre-attaque de 1 au palier Divin II. Ces effets sont des hypothèses d'équilibrage, uniquement dans le laboratoire.</p>`:
      '<p class="hint">Les raretés supérieures de cette carte ne sont pas encore conçues. Seuls ses trois niveaux existants sont testables.</p>'}
    <p class="hint">Une même carte partage ces réglages entre tous ses exemplaires du camp choisi. Le cadre et l’illustration restent inchangés.</p>
   </div>
  </div>
  <div class="card-panel lab-launch">
    <p>Deux decks indépendants, 12 à 24 cartes chacun. L’IA agit avec les règles habituelles.</p>
    <div class="button-row">${btn('⚔ Lancer la bataille test','lab-start','','primary')}${btn('Retour au jeu','lab-exit','','ghost')}</div>
  </div>
 </section>`;
}