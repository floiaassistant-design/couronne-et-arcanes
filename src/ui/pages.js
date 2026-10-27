import {cardPreviewAttributes} from './card-presentation.js';
import { renderCollectionCatalogue } from './collection.js';
import {renderManualDeck} from './deck-builder.js';
// Écrans et cartes : rendu HTML sans gestion de navigation ni de sauvegarde.
import { CARDS, CLASS_SKILLS, FACTIONS, CLASSES, CAMPAIGN, TOWER_MAX, towerMission } from '../data.js';
import { AI_STYLES } from '../ai.js';
import { TALENT_TREE, TALENT_LEVELS } from '../talents.js';

import { DUNGEONS, dungeonById, dungeonStageMission, dungeonBonusMission } from '../dungeons.js';
import {
  DECK_STYLES,
  proposeDeck,
  deckOverview,
  validateDeck,
  BUILDINGS,
  EQUIPMENT,
  reputationLevel,
  heroLevel,
  heroShieldBonus,
  HERO_MAX_LEVEL,
  FUSION_RECIPES,
  FUSION_COSTS,
  EXTRACTION_SHARDS,
  dungeonUnlocked
} from '../engine.js';

import { renderGuidePage } from './guide-page.js';

export function createPages(getState, { btn, cardUI, esc, num, heroProgress }) {
  let profile, battle, collectionFilter, collectionOwned, previousGameAvailable, deckFilters;
  const bind =
    (fn) =>
    (...args) => {
      ({ profile, battle, collectionFilter, collectionOwned, previousGameAvailable, deckFilters } = getState());
      return fn(...args);
    };
  function homeUI() {
    const next = CAMPAIGN[Math.min(profile.unlocked - 1, 11)];
    const cleared = profile.completed.length;
    return `<section class="hero-banner"><div class="hero-copy"><div class="kicker">UN MONDE À RECONQUÉRIR · CHAPITRE I</div><h1>Forgez votre <em>légende.</em></h1><p>Cinq ordres se disputent les frontières du royaume. Collectionnez des créatures, assemblez votre deck et menez vos troupes à la victoire dans des combats tactiques sur deux à quatre lignes.</p><div class="button-row">${btn('⚔ Continuer la campagne', 'start-next', '', 'primary')}${btn('Découvrir les règles', 'nav', 'data-page="guide"', 'ghost')}${btn('Nouvelle partie · choisir une classe', 'new-game', '', 'ghost')}${previousGameAvailable ? btn('↶ Partie précédente', 'restore-previous-game', '', 'ghost') : ''}</div></div><div class="hero-crest"><div class="crest-ring"><span>♜</span></div><div class="crest-sub">LE SERMENT DES COURONNES</div></div></section>
 <section class="spaced"><div class="card-panel progression-panel"><div class="split-head"><div><div class="section-caption">PROGRESSION DU SOUVERAIN</div><h2 class="section-title">Niveau ${heroLevel(profile)} / ${HERO_MAX_LEVEL}</h2></div><span class="pill">Bouclier de vétéran +${heroShieldBonus(profile)}</span></div><p class="page-sub">${heroLevel(profile) === HERO_MAX_LEVEL ? 'Maîtrise héroïque maximale atteinte.' : `${heroProgress(profile).shown} / ${heroProgress(profile).needed} XP vers le prochain niveau.`} Les niveaux améliorent progressivement la protection, sans ajouter d’attaque aux cartes.</p><div class="progressbar"><span style="width:${heroLevel(profile) === HERO_MAX_LEVEL ? 100 : Math.min(100, heroProgress(profile).percent)}%"></span></div></div></section>
 <section class="spaced stat-row"><div class="stat-box"><strong>${cleared}/12</strong><small>Missions accomplies</small></div><div class="stat-box"><strong>${Object.keys(profile.collection).filter((k) => profile.collection[k] > 0).length}/${Object.keys(CARDS).length}</strong><small>Cartes découvertes</small></div><div class="stat-box"><strong>${profile.wins}</strong><small>Victoires</small></div><div class="stat-box"><strong>${profile.deck.length}</strong><small>Cartes du deck</small></div></section>
 <section class="spaced"><div class="split-head"><div><div class="section-caption">Votre prochain défi</div><h2 class="section-title" style="margin-top:8px">${esc(next.name)}</h2></div><span class="pill">Région · ${esc(next.region)}</span></div><div class="card-panel"><p class="page-sub">${esc(next.story)} Affrontez <strong class="gold">${esc(next.enemy)}</strong> et gagnez ${next.reward} pièces d’or et ${next.shards} éclats.</p><div class="progressbar"><span style="width:${(cleared / 12) * 100}%"></span></div><div class="button-row">${btn('Jouer cette mission', 'start-mission', `data-id="${next.id}"`, 'primary')}${btn('Voir la campagne', 'nav', 'data-page="campaign"', 'ghost')}</div></div></section>
 <section class="spaced"><h2 class="section-title">Les trois piliers de votre aventure</h2><div class="three-grid"><div class="feature-card"><div class="feature-icon">♜</div><h3>Stratégie vivante</h3><p>Vos créatures avancent et combattent automatiquement. Choisissez le bon moment et la bonne ligne.</p></div><div class="feature-card"><div class="feature-icon">✧</div><h3>Collection & évolution</h3><p>Créez des combinaisons entre factions, améliorez vos unités et débloquez de nouveaux pouvoirs.</p></div><div class="feature-card"><div class="feature-icon">⚑</div><h3>Campagne, Tour & donjons</h3><p>Parcourez douze missions, vingt étages et trois donjons successifs avec des boss.</p></div></div></section>`;
  }
  function campaignUI() {
    const groups = [];
    for (let i = 0; i < CAMPAIGN.length; i += 3) groups.push(CAMPAIGN.slice(i, i + 3));
    return `<div class="kicker">AVENTURE SOLO · 4 RÉGIONS</div><h1 class="page-title">La grande campagne</h1><p class="page-sub">Traversez les terres des cinq ordres. Chaque victoire offre de l’or, des éclats et, pour une première victoire, une nouvelle carte. Les missions déjà vaincues peuvent être rejouées pour obtenir des ressources.</p>
 ${groups
   .map(
     (gr) =>
       `<section><h2 class="chapter-heading">${esc(gr[0].region)}</h2><div class="mission-list">${gr
         .map((m) => {
           const locked = Number(m.id) > profile.unlocked,
             done = profile.completed.includes(m.id);
           return `<article class="mission ${locked ? 'locked' : ''} ${done ? 'completed' : ''}"><div class="mission-top"><span>MISSION ${m.id} · ${'✦'.repeat(m.difficulty)}</span><span>${done ? '✓ TERMINÉE' : locked ? '⌁ VERROUILLÉE' : m.boss ? '♛ BOSS' : 'À DÉCOUVRIR'}</span></div><h3>${esc(m.name)}</h3><p>${esc(m.story)}</p><p class="enemy-style-tag">Stratégie : ${esc(AI_STYLES[m.aiStyle]?.name || 'Équilibré')}${m.boss ? ' · Boss à deux phases' : ''}</p><div class="reward">◈ ${m.reward} or &nbsp; ✧ ${m.shards} éclats</div>${btn(locked ? 'Inaccessible' : done ? 'Rejouer la bataille' : 'Lancer le combat', 'start-mission', `data-id="${m.id}" ${locked ? 'disabled' : ''}`, locked ? 'ghost' : 'primary')}</article>`;
         })
         .join('')}</div></section>`
   )
   .join('')}`;
  }
  function towerUI() {
    return `<div class="kicker">ÉPREUVES SOLO · 20 ÉTAGES</div><h1 class="page-title">La Tour des Couronnes</h1><p class="page-sub">Progressez étage par étage contre des compositions de decks différentes. Chaque victoire apporte or et éclats ; les gardiens des étages 5, 10, 15 et 20 donnent une carte lors de leur première défaite. La tour se joue entièrement hors ligne.</p>
 <section class="spaced stat-row"><div class="stat-box"><strong>${profile.towerCleared.length}/${TOWER_MAX}</strong><small>Étages vaincus</small></div><div class="stat-box"><strong>${profile.towerUnlocked}</strong><small>Étage accessible</small></div></section>
 <section class="spaced"><div class="mission-list">${Array.from({ length: TOWER_MAX }, (_, i) => {
   const m = towerMission(i + 1),
     locked = i + 1 > profile.towerUnlocked,
     done = profile.towerCleared.includes(i + 1);
   return `<article class="mission ${locked ? 'locked' : ''} ${done ? 'completed' : ''}"><div class="mission-top"><span>ÉTAGE ${i + 1} · ${'✦'.repeat(m.difficulty)}</span><span>${done ? '✓ VAINCU' : locked ? '⌁ VERROUILLÉ' : m.boss ? '♛ GARDIEN' : 'À DÉFIER'}</span></div><h3>${esc(m.name)}</h3><p>${esc(m.enemy)} · ${m.hp} PV ${m.boss ? '· Gardien de palier' : ''}</p><p class="enemy-style-tag">Stratégie : ${esc(AI_STYLES[m.aiStyle]?.name || 'Équilibré')}${m.boss ? ' · Boss à deux phases' : ''}</p><div class="reward">◈ ${m.reward} or · ✧ ${m.shards} éclats ${m.unlock ? ' · Carte spéciale' : ''}</div>${btn(locked ? 'Inaccessible' : done ? 'Rejouer l’étage' : 'Défier l’étage', 'start-tower', `data-id="${i + 1}" ${locked ? 'disabled' : ''}`, locked ? 'ghost' : 'primary')}</article>`;
 }).join('')}</div></section>`;
  }
  function dungeonUI() {
    const run = profile.dungeonRun,
      cleared = profile.dungeonCleared || [];
    return `<div class="kicker">EXPÉDITIONS SOLO · 3 DONJONS</div><h1 class="page-title">Les profondeurs des Cinq Ordres</h1>
 <p class="page-sub">Chaque donjon comporte <b>trois combats principaux</b> et se termine par un boss. Vous gardez les PV restants et récupérez <b>6 PV après chaque victoire</b>. Entre deux salles, choisissez entre repos supplémentaire, coffre ou embuscade facultative. Une défaite ou un abandon met fin à l'expédition. Or et éclats gagnés à chaque victoire sont conservés. La carte spéciale est accordée une seule fois par donjon terminé.</p>
 <div class="stat-row spaced"><div class="stat-box"><strong>${cleared.length}/${DUNGEONS.length}</strong><small>Donjons terminés</small></div><div class="stat-box"><strong>${run ? `${run.stage + 1}/3` : '—'}</strong><small>Étape actuelle</small></div></div>
 ${
   run
     ? `<section class="card-panel dungeon-run spaced"><div class="kicker">EXPÉDITION EN COURS</div><h2 class="section-title">${esc(dungeonById(run.id)?.name || 'Donjon')}</h2>
 <p class="page-sub">${run.phase === 'bonus' ? 'Épreuve facultative : un ennemi plus puissant protège un trésor.' : `Prochaine salle : ${esc(dungeonStageMission(run.id, run.stage).name)}`} · ${run.hp === null ? 'Vie pleine au départ' : `♥ ${run.hp}/${run.maxhp} PV conservés`}. Votre deck peut être réorganisé entre les combats.</p>
 ${
   run.phase === 'choice'
     ? `<div class="dungeon-event"><div class="section-caption">CHOISISSEZ VOTRE CHEMIN · SALLE ${run.stage + 1}/3</div><p>Un seul choix est possible. Il est enregistré dans votre sauvegarde.</p><div class="dungeon-event-options">
 <button class="dungeon-event-option" type="button" data-action="dungeon-event" data-id="rest"><span class="event-icon">✚</span><b>Repos à l’abri</b><small>Récupérer jusqu’à 10 PV supplémentaires.</small></button>
 <button class="dungeon-event-option" type="button" data-action="dungeon-event" data-id="treasure"><span class="event-icon">◈</span><b>Coffre ancien</b><small>+${35 + run.stage * 10} or et +${12 + run.stage * 5} éclats, garantis.</small></button>
 <button class="dungeon-event-option" type="button" data-action="dungeon-event" data-id="challenge"><span class="event-icon">⚔</span><b>Embuscade risquée</b><small>Un combat bonus, +${dungeonBonusMission(run.id, run.stage).reward} or et +${dungeonBonusMission(run.id, run.stage).shards} éclats si victoire ; défaite = fin de l’expédition.</small></button>
 </div></div>`
     : `<div class="button-row">${btn(run.phase === 'bonus' ? '⚔ Affronter l’embuscade' : '⚔ Continuer l’expédition', 'dungeon-next', '', 'primary')}</div>`
 }
 <div class="button-row">${btn('Abandonner le donjon', 'dungeon-quit', '', 'ghost')}</div></section>`
     : ''
 }
 <div class="mission-list dungeon-cards">${DUNGEONS.map((d, index) => {
   const locked = !dungeonUnlocked(profile, d.id),
     done = cleared.includes(d.id),
     active = run?.id === d.id;
   return `<article class="mission dungeon-card ${locked ? 'locked' : ''} ${done ? 'completed' : ''}"><div class="mission-top"><span>${d.icon} ${esc(d.region)}</span><span>${done ? '✓ TERMINÉ' : active ? '⚔ EN COURS' : locked ? '⌁ VERROUILLÉ' : 'OUVERT'}</span></div><h3>${esc(d.name)}</h3><p>${esc(d.description)}</p><div class="dungeon-stages">${d.stages.map((s, i) => `<div class="dungeon-stage ${active && run.stage === i ? 'now' : ''}"><b>${i + 1}. ${esc(s.name)} ${s.boss ? '♛' : ''}</b><small>${esc(s.enemy)} · ${s.hp} PV · ${esc(AI_STYLES[s.aiStyle]?.name || 'Équilibré')}</small></div>`).join('')}</div>
  <div class="reward">Récompense finale : ◈ ${d.bonusGold} · ✧ ${d.bonusShards} ${!done ? `· ✦ ${esc(CARDS[d.unlock].name)}` : ''}</div>
  ${btn(active && run.phase === 'choice' ? 'Choisissez votre événement ci-dessus' : active && run.phase === 'bonus' ? 'Affronter l’embuscade' : active ? 'Poursuivre le donjon' : locked ? 'Débloquer le précédent' : run ? 'Autre expédition en cours' : done ? 'Rejouer le donjon' : 'Entrer dans le donjon', active ? 'dungeon-next' : 'start-dungeon', `data-id="${d.id}" ${locked || (run && !active) || (active && run.phase === 'choice') ? 'disabled' : ''}`, locked ? 'ghost' : 'primary')}
  </article>`;
 }).join('')}</div>`;
  }

  function classSkillsUI(busy) {
    const classSkillIds = Object.keys(CLASS_SKILLS).filter(
      (id) => CLASS_SKILLS[id].hero === profile.heroClass
    );
    return `<section class="card-panel spaced collection-skills"><div class="section-caption">V2.8 · COMPÉTENCES EXCLUSIVES</div><h2 class="section-title">Arcanes du ${esc(CLASSES[profile.heroClass].name)}</h2><p class="page-sub">Apprenez des cartes propres à votre classe avec des éclats gagnés en jeu. Une copie par compétence, conservée même après un changement de héros. Retirez les compétences incompatibles du deck avant de changer de classe.</p><div class="card-grid">${classSkillIds
      .map((id) => {
        const info = CLASS_SKILLS[id],
          known = (profile.collection[id] || 0) > 0,
          ready = heroLevel(profile) >= info.level;
        const label = known
          ? '✓ Apprise'
          : !ready
            ? 'Niveau ' + info.level + ' requis'
            : 'Apprendre · ' + info.shards + ' ✧';
        const attrs =
          'data-id="' +
          id +
          '" ' +
          (known || !ready || profile.shards < info.shards || busy ? 'disabled' : '');
        const canEdit = collectionFilter !== 'all' && collectionFilter !== CARDS[id].faction;
        return (
          '<div class="alchemy-recipe">' +
          cardUI(id, { canEdit }) +
          '<div class="alchemy-action">' +
          btn(label, 'learn-class-skill', attrs, 'primary') +
          '</div></div>'
        );
      })
      .join('')}</div></section>`;
  }

  function deckWorkshopUI(busy) {
    return `<section class="card-panel deck-workshop spaced"><div class="split-head"><div><div class="section-caption">ATELIER DE COMPOSITIONS</div><h2 class="section-title">Quatre stratégies, vos propres cartes</h2></div><span class="pill">Gratuit · sans nouvelles cartes</span></div><p class="page-sub">Découvrez une composition adaptée à votre collection. Prévisualisez toutes les cartes avant de remplacer votre deck. Vous pourrez ensuite le modifier manuellement.</p><div class="deck-preset-grid">${Object.entries(
      DECK_STYLES
    )
      .map(([id, style]) => {
        const proposed = proposeDeck(profile, id);
        return `<article class="deck-preset-card"><b>${esc(style.name)}</b><p>${esc(style.description)}</p><small>${proposed.ok ? `${proposed.overview.total} cartes · ${proposed.overview.units} unités · ${proposed.overview.spells} sorts` : esc(proposed.reason)}</small>${btn('Voir la composition', 'deck-preview', `data-id="${id}" ${!proposed.ok || busy ? 'disabled' : ''}`, 'small ghost')}</article>`;
      })
      .join(
        ''
      )}</div>${busy ? '<div class="hint">Terminez le combat en cours avant de changer de composition.</div>' : ''}</section>`;
  }

  function deckUI(){
    return renderManualDeck(profile,{battle,filters:deckFilters},{btn,cardUI,esc,quickDecks:deckWorkshopUI(battle?.status==='active')});
  }
  function collectionUI() {
    const counts = {};
    profile.deck.forEach((id) => (counts[id] = (counts[id] || 0) + 1));
    const invalid = validateDeck(profile);
    const overview = deckOverview(profile.deck),
      busy = battle?.status === 'active';

    const skillsPanel = classSkillsUI(busy);
    const workshop = deckWorkshopUI(busy);
    return `<div class="collection-screen">${renderCollectionCatalogue(profile, { faction: collectionFilter, ownedOnly: collectionOwned }, { btn, cardUI, esc })}<section id="collection-deck" class="collection-management">${workshop}${skillsPanel}<aside class="card-panel deck-aside"><div class="section-caption">Votre composition</div><h2 class="section-title" style="margin-top:9px">Deck actif</h2><div class="stat-row"><div class="stat-box"><strong>${profile.deck.length}</strong><small>Cartes / 24</small></div><div class="stat-box"><strong>${overview.units} / ${overview.spells}</strong><small>Unités / sorts</small></div></div>${invalid ? `<div class="hint red">${esc(invalid)}</div>` : `<div class="hint green">Deck valide. Prêt au combat.</div>`}<div class="deck-list">${Object.entries(
      counts
    )
      .map(
        ([id, count]) =>
          `<div class="deck-item"><span ${cardPreviewAttributes(id,CARDS[id].rarity,'deck',esc)}><span class="gold">${count}×</span> ${esc(CARDS[id].name)}</span><button class="remove" aria-label="Retirer ${esc(CARDS[id].name)}" data-action="deck-remove" data-id="${id}">×</button></div>`
      )
      .join(
        ''
      )}</div>${btn('⚔ Lancer la campagne', 'nav', 'data-page="campaign"', 'primary')}</aside></section></div>`;
  }
  function alchemyUI() {
    const recipes = FUSION_RECIPES.map((id) => CARDS[id]);
    const expendables = Object.values(CARDS).filter(
      (c) => (profile.collection[c.id] || 0) > profile.deck.filter((id) => id === c.id).length
    );
    return `<div class="kicker">LABORATOIRE · CRÉATION DE CARTES</div><h1 class="page-title">L'Alchimie des Arcanes</h1><p class="page-sub">Extrayez vos cartes en trop pour récupérer des éclats et fusionnez-les avec de l'or pour fabriquer des cartes choisies. <b>Aucun tirage aléatoire, aucune chance d'échec et aucun paiement réel.</b></p>
 <section class="spaced stat-row"><div class="stat-box"><strong>${num(profile.gold)}</strong><small>Or disponible</small></div><div class="stat-box"><strong>${num(profile.shards)}</strong><small>Éclats disponibles</small></div></section>
 <section class="spaced"><h2 class="section-title">Fusionner une carte</h2><p class="page-sub">Choisissez une recette connue. Les unités et sorts fabriqués rejoignent immédiatement votre collection.</p><div class="card-grid">${recipes.map((c) => `<div class="alchemy-recipe">${cardUI(c.id)}<div class="alchemy-action">${btn(`Fabriquer · ${FUSION_COSTS[c.rarity].gold} ◈ / ${FUSION_COSTS[c.rarity].shards} ✧`, 'fuse-card', `data-id="${c.id}" ${profile.gold < FUSION_COSTS[c.rarity].gold || profile.shards < FUSION_COSTS[c.rarity].shards ? 'disabled' : ''}`, 'primary')}</div></div>`).join('')}</div></section>
 <section class="spaced"><h2 class="section-title">Extraire les cartes en surplus</h2><p class="page-sub">Les exemplaires utilisés dans votre deck sont protégés ; seuls les exemplaires supplémentaires peuvent être extraits.</p>${expendables.length ? `<div class="card-grid">${expendables.map((c) => `<div class="alchemy-recipe">${cardUI(c.id)}<div class="alchemy-action">${btn(`Extraire · +${EXTRACTION_SHARDS[c.rarity]} ✧`, 'extract-card', `data-id="${c.id}"`, 'ghost')}</div></div>`).join('')}</div>` : '<div class="hint">Aucune carte en surplus. Gagnez des cartes ou retirez-en du deck pour pouvoir les extraire.</div>'}</section>`;
  }
  function forgeUI() {
    const own = Object.values(CARDS).filter((c) => profile.collection[c.id] > 0 && c.type === 'unité');
    return `<div class="kicker">AMÉLIORATIONS · ARTISANAT · HÉROS</div><h1 class="page-title">L’Atelier des Couronnes</h1><p class="page-sub">Développez la cité, renforcez vos cartes et choisissez la spécialité de votre héros. Chaque amélioration est conservée dans votre sauvegarde.</p>
 <section class="spaced"><div class="section-caption">PROGRESSION DU HÉROS</div><h2 class="section-title">Niveau ${heroLevel(profile)} / ${HERO_MAX_LEVEL}</h2><p class="page-sub">Expérience : ${profile.heroXp} XP. ${heroLevel(profile) === HERO_MAX_LEVEL ? 'Niveau maximum atteint.' : `Prochain niveau dans ${heroProgress(profile).needed - heroProgress(profile).shown} XP.`} Bouclier de départ : +${heroShieldBonus(profile)} aux niveaux 5 et 9. Les cartes deviennent maîtresses en étant jouées : les unités obtiennent au maximum +1 PV au rang 3 ; les sorts gagnent des insignes sans bonus de dégâts.</p><div class="progressbar"><span style="width:${heroLevel(profile) === HERO_MAX_LEVEL ? 100 : Math.min(100, heroProgress(profile).percent)}%"></span></div></section>
 <section class="spaced"><div class="section-caption">Les trois édifices</div><h2 class="section-title" style="margin-top:8px">Améliorer votre bastion</h2><div class="forge-grid">${Object.entries(
   BUILDINGS
 )
   .map(([id, b]) => {
     const level = profile.buildings[id],
       cost = b.cost * (level + 1),
       icon = { bastion: '♜', forge: '⚒', bibliotheque: '✧' }[id];
     return `<article class="forge-tile"><div class="glyph">${icon}</div><h3>${b.name}</h3><p>${b.description}</p><div class="pill">Niveau ${level} / ${b.max}</div>${btn(level === b.max ? 'Niveau maximum' : `Améliorer · ${cost} ◈`, 'building-upgrade', `data-id="${id}" ${level === b.max ? 'disabled' : ''}`, 'primary')}</article>`;
   })
   .join('')}</div></section>
 <section class="spaced"><div class="section-caption">Personnalisation</div><h2 class="section-title" style="margin-top:8px">Choisissez votre héros</h2><div class="class-options">${Object.entries(
   CLASSES
 )
   .map(
     ([id, c]) =>
       `<button class="class-option ${profile.heroClass === id ? 'active' : ''}" data-action="choose-class" data-id="${id}"><span class="glyph">${c.symbol}</span><span><b>${c.name}${profile.heroClass === id ? ' ✓' : ''}</b><small>${c.subtitle}</small></span></button>`
   )
   .join(
     ''
   )}</div><p class="hint">${esc(CLASSES[profile.heroClass].description)} Le pouvoir se recharge tous les trois tours.</p></section>
 <section class="spaced talents-section"><div class="section-caption">TALENTS · CHOIX DE CLASSE</div><h2 class="section-title" style="margin-top:8px">Arbre de talents — ${esc(CLASSES[profile.heroClass].name)}</h2><p class="page-sub">Deux paliers aux niveaux 4 et 8. Choisissez une seule voie par palier, puis changez-la gratuitement entre deux combats. Les choix de chaque classe sont conservés indépendamment.</p><div class="talent-tier-list">${[
   1, 2
 ]
   .map((tier) => {
     const ready = heroLevel(profile) >= TALENT_LEVELS[tier],
       selected = profile.talents?.[profile.heroClass]?.[tier];
     return `<div class="talent-tier"><div class="split-head"><b>Palier ${tier} · Niveau ${TALENT_LEVELS[tier]}</b><span class="pill">${ready ? (selected ? 'Voie choisie' : 'Choix disponible') : 'Verrouillé'}</span></div><div class="talent-grid">${TALENT_TREE[
       profile.heroClass
     ]
       .filter((t) => t.tier === tier)
       .map(
         (t) =>
           `<article class="talent-node ${selected === t.id ? 'active' : ''} ${ready ? '' : 'locked'}"><h3>${esc(t.name)}</h3><p>${esc(t.desc)}</p>${btn(selected === t.id ? '✓ Talent actif' : ready ? 'Choisir cette voie' : `Niveau ${TALENT_LEVELS[tier]} requis`, 'choose-talent', `data-id="${t.id}" ${!ready || selected === t.id ? 'disabled' : ''}`, selected === t.id ? 'primary' : 'ghost')}</article>`
       )
       .join('')}</div></div>`;
   })
   .join('')}</div></section>
 <section class="spaced"><div class="section-caption">ÉQUIPEMENT DU SOUVERAIN</div><h2 class="section-title" style="margin-top:8px">Forge et équipements</h2><p class="page-sub">Fabriquez vos pièces avec les ressources gagnées en jouant. Une seule pièce équipée par emplacement : arme, armure et relique.</p><div class="forge-grid">${Object.entries(
   EQUIPMENT
 )
   .map(([key, item]) => {
     const owned = profile.equipmentOwned.includes(key),
       equipped = profile.equipped[item.slot] === key;
     return `<article class="forge-tile"><div class="glyph">${item.slot === 'arme' ? '⚔' : item.slot === 'armure' ? '♜' : '✧'}</div><h3>${esc(item.name)}</h3><p>${esc(item.desc)}</p><div class="pill">${esc(item.slot)} · ${equipped ? '✓ Équipé' : owned ? 'Possédé' : 'À fabriquer'}</div>${btn(equipped ? 'Équipé' : owned ? 'Équiper' : `Fabriquer · ${item.gold} ◈ + ${item.shards} ✧`, owned ? 'equip-equipment' : 'craft-equipment', `data-id="${key}" ${equipped ? 'disabled' : ''}`, owned ? 'ghost' : 'primary')}</article>`;
   })
   .join('')}</div></section>
 <section class="spaced"><div class="section-caption">ALLIANCES ET FIDÉLITÉ</div><h2 class="section-title" style="margin-top:8px">Réputation des Cinq Ordres</h2><p class="page-sub">Les victoires augmentent votre réputation auprès des factions présentes dans votre deck. Chaque palier de 15 points donne +1 PV à leurs unités, jusqu’à +3.</p><div class="forge-grid">${Object.entries(
   FACTIONS
 )
   .filter(([k]) => k !== 'sort')
   .map(
     ([k, f]) =>
       `<article class="forge-tile"><h3>${esc(f.name)}</h3><div class="pill">${profile.reputation[k]} points · Niveau ${reputationLevel(profile, k)}/3</div><p>Bonus actuel : +${reputationLevel(profile, k)} PV par créature de cet ordre.</p></article>`
   )
   .join('')}</div></section>
 <section class="spaced"><div class="split-head"><div><div class="section-caption">Les fragments d’âme</div><h2 class="section-title" style="margin-top:8px">Renforcer vos unités</h2></div><span class="pill">✧ ${profile.shards} éclats disponibles</span></div><div class="card-grid">${own.map((c) => cardUI(c.id, { upgradable: true })).join('')}</div></section>
 <section class="spaced"><div class="card-panel"><div class="section-caption">Le comptoir du marchand</div><h2 class="section-title" style="margin-top:8px">Paquet mystique</h2><p class="page-sub">Recevez 3 cartes aléatoires pour 95 pièces d’or. Aucun paiement réel, aucune connexion requise.</p>${btn('Ouvrir un paquet · 95 ◈', 'buy-pack', `${profile.gold < 95 ? 'disabled' : ''}`, 'primary')}</div></section>`;
  }
  function guideUI() {
    return renderGuidePage({ btn, previousGameAvailable });
  }

  return {
    homeUI: bind(homeUI),
    campaignUI: bind(campaignUI),
    towerUI: bind(towerUI),
    dungeonUI: bind(dungeonUI),
    collectionUI: bind(collectionUI),
    deckUI: bind(deckUI),
    alchemyUI: bind(alchemyUI),
    forgeUI: bind(forgeUI),
    guideUI: bind(guideUI)
  };
}
