import {evolutionTrial} from '../evolution-trials.js';
import {cardPresentation} from './card-presentation.js';
import {spellSelection,spellCardState,spellTargetingUI} from './spell-targeting.js';
// Écrans et cartes : rendu HTML sans gestion de navigation ni de sauvegarde.
import { CARDS, FACTIONS, CLASSES } from '../data.js';
import { AI_STYLES, aiStyle, aiEnraged } from '../ai.js';
import { silenced, teleportPlan, controlTargetError } from '../engine/battle-control.js';
import { TALENT_TREE } from '../talents.js';
import { boardCard, campSeal } from './card-arena.js';
import { laneCount, lastCell, validDeploymentColumn } from '../engine/board.js';
import { arenaBackdrop } from './arena-art.js';
import { paintedArena, paintedTile } from './painted-arena.js';

import { formationBonus } from '../engine.js';

export function createBattleView(getState, { btn, cardUI, esc }) {
  let battle, selectedCard, animationsEnabled, combatReport, spellTarget, spellPreview, selection;
  const bind =
    (fn) =>
    (...args) => {
      ({ battle, selectedCard, animationsEnabled, combatReport, spellTarget, spellPreview } = getState());
      return fn(...args);
    };
  function battleUnit(u, lane) {
    const silent = silenced(battle, u),
      remaining = silent ? u.silenceUntil - battle.round + 1 : 0;
    const concord = u ? formationBonus(battle, lane, u) : 0;
    const rallied = u && u.rallyUntil >= battle.round ? 1 : 0;
    const targeting=selection?spellCardState(selection,u.uid):null;
    const attack = u ? u.atk + concord + rallied : 0;
    const card=cardPresentation(u,{unit:u,stats:{atk:attack,hp:u.hp,maxhp:u.maxhp}}).card;
    return `<div class="unit-on-board ${u.side === 'e' ? 'enemy' : 'ally'} ${silent ? 'silenced' : ''}" data-actor-id="${u.uid}" data-facing="${u.side === 'p' ? 'right' : 'left'}" data-animation-state="idle" data-owner="${u.side}" data-rarity="${esc(card.rarity)}" style="--tone:${FACTIONS[card.faction].tone}" data-unit-summary="${u.side === 'p' ? 'Votre unité' : 'Unité adverse'} · ${esc(FACTIONS[card.faction].name)} · ${esc(card.rarity)} · ${esc(card.name)} · ${esc(card.description)} · Attaque ${attack}${concord ? ' (dont +1 Concorde)' : ''}${rallied ? ' (dont +1 Ralliement)' : ''} · PV ${u.hp}/${u.maxhp}${u.barrier ? ' · Barrière ' + u.barrier : ''}${silent ? ' · Silence : ' + remaining + ' résolution(s)' : ''}">${silent ? `<div class="silence-badge" role="status">⊘ Silence ${remaining}</div>` : ''}${boardCard(u, attack, selection?{...targeting,lane}:null,battle.round,!!concord)}</div>`;
  }

  function battleCell(u, lane, col, visualLane = null) {
    const tile = visualLane === null ? null : paintedTile(visualLane, col);

    const traps = (battle.traps || []).filter(
      (t) => t.lane === lane && t.col === col && t.expiresRound >= battle.round
    );
    const zone=selection?.options.find(o=>!o.error&&o.cells.some(c=>c.lane===lane&&c.col===col));
    const deployable = !selection && validDeploymentColumn(battle, 'p', col);

    return `<div ${tile ? `style="${tile.style}" data-foot-x="${tile.footX}" data-foot-y="${tile.footY}"` : ''} data-col="${col}" data-lane="${lane}" class="battle-cell ${zone?'spell-zone':''} ${battle.phase === 'player' && selectedCard >= 0 && deployable && (!u || CARDS[battle.heroes.p.hand[selectedCard]?.id]?.type === 'sort') ? 'available' : ''}" ${zone?`role="button" tabindex="0" data-action="spell-lane" aria-label="Cible du sort, ligne ${lane+1}, case ${col}"`:deployable && battle.phase === 'player' ? `role="${u ? 'group' : 'button'}" tabindex="0" data-action="deploy" data-lane="${lane}" aria-label="Déployer sur la ligne ${lane + 1}, case ${col}"` : ''}>
 ${traps.map((t) => `<span class="terrain-trap ${t.owner === 'e' ? 'enemy' : ''}" role="img" aria-label="Piège ${t.owner === 'p' ? 'allié' : 'adverse'}, ligne ${lane + 1}, case ${col}, ${t.expiresRound - battle.round + 1} tours" title="${t.kind === 'snare' ? '1 dégât et immobilisation' : '3 dégâts'} avant armure · expire dans ${t.expiresRound - battle.round + 1} résolution(s)">⌁ ${t.owner === 'p' ? 'ALLIÉ' : 'ENNEMI'} · ${t.expiresRound - battle.round + 1}</span>`).join('')}
 ${u ? battleUnit(u, lane) : `<span class="slot-num">${col}</span>`}</div>`;
  }
  function battleHud(p, e) {
    return `<div class="battle-hud"><div class="fighter ${selection?.option?.heroes?.includes('p')?'spell-hero-affected':''}"><h3>♜ ${esc(p.name)}</h3><div class="hpbar"><span style="width:${(p.hp / p.maxhp) * 100}%;background:linear-gradient(90deg,#7199a2,#a1d7b8)"></span></div><div class="hp-line">♥ ${p.hp}/${p.maxhp} PV ${p.shield ? `· ⬡ ${p.shield} bouclier` : ''}</div></div><div class="battle-mid"><div class="turn-n">${battle.round}</div><div class="turn-label">${battle.phase === 'enemy' ? 'TOUR DE L’IA' : 'VOTRE TOUR'}</div></div><div class="fighter enemy ${selection?.option?.heroes?.includes('e')?'spell-hero-affected':''}"><h3>${esc(e.name)} ♛</h3><div class="enemy-style-tag">${esc(AI_STYLES[aiStyle(battle)].name)}${aiEnraged(battle) ? ' · FURIE' : battle.aiBoss ? ' · Boss' : ''}</div><div class="hpbar"><span style="width:${(e.hp / e.maxhp) * 100}%"></span></div><div class="hp-line">♥ ${e.hp}/${e.maxhp} PV ${e.shield ? `· ⬡ ${e.shield} bouclier` : ''}</div></div></div>`;
  }

  function battleActions(immersive) {
    return `<aside class="actions-side">${btn('✦ Utiliser le pouvoir', 'hero-power', `${battle.powerCooldown > 0 || battle.phase !== 'player' || battle.status !== 'active' ? 'disabled' : ''}`)}${btn(battle.turnFlow === 'alternating' ? 'Valider mes actions →' : 'Terminer le tour →', 'end-turn', `${battle.phase !== 'player' || battle.status !== 'active' ? 'disabled' : ''}`, 'primary')}${immersive ? '' : btn('Abandonner', 'retreat', '', 'ghost')}${immersive ? '<details class="combat-intel"><summary>Journal & détails</summary><div class="combat-intel-panel">' : ''}<div class="enemy-ai-profile ai-personality"><b>Style adverse : ${esc(AI_STYLES[aiStyle(battle)].name)}</b><span>${esc(AI_STYLES[aiStyle(battle)].desc)}${battle.aiBoss ? (aiEnraged(battle) ? ' Le boss est entré en furie.' : ' Le boss devient plus offensif sous 50 % de PV.') : ''}</span></div>${battle.aiLastPlan ? `<div class="ai-plan"><b>Dernière tactique adverse</b><span>${esc(battle.aiLastPlan)}</span></div>` : ''}<div class="section-caption">Actions du souverain</div><div class="power-hint">${battle.heroTalents?.length ? `<div class="battle-talents">${battle.heroTalents.map((id) => `✦ ${esc(TALENT_TREE[battle.heroClass].find((t) => t.id === id)?.name || 'Talent')}`).join(' · ')}${battle.heroTalents.includes('rodeur_poursuite') ? `<span class="talent-once-status"> · Réserve : ${battle.talentDrawUsed ? 'utilisée' : 'disponible'}</span>` : ''}</div>` : ''}${CLASSES[battle.heroClass].symbol} ${CLASSES[battle.heroClass].description}${battle.powerCooldown ? ` Disponible dans ${battle.powerCooldown} tour(s).` : ''}</div><p>${battle.turnFlow === 'alternating' ? 'Vos unités agissent après validation, puis l’IA pose ses cartes et fait agir les siennes.' : 'Les créatures avancent et combattent automatiquement quand vous terminez le tour.'}</p>${combatReport?.lines?.length ? `<details class="combat-recap"><summary>Déroulé du tour ${combatReport.round} · ${combatReport.lines.length} actions</summary><ol>${combatReport.lines.map(line => `<li>${esc(line)}</li>`).join('')}</ol></details>` : ''}<div class="section-caption" style="margin-top:14px">Journal du combat</div><div class="log-list">${battle.log.map((msg) => `<div>${esc(msg)}</div>`).join('')}</div>${immersive ? btn('Abandonner', 'retreat', '', 'ghost') + '</div></details>' : ''}</aside>`;
  }

  function battleUI() {
    const p = battle.heroes.p,
      e = battle.heroes.e,
      lanes = laneCount(battle),
      cells = lastCell(battle);
    selection=spellSelection(battle,selectedCard,spellTarget);
    const selected = CARDS[p.hand[selectedCard]?.id],
      immersive = cells === 10;
    const inspectionPanel =
      '<div id="hand-card-inspection" class="hand-card-inspection" role="region" aria-label="Capacités de la carte consultée" hidden></div>';
    const preview =
      selected?.ability === 'spell_teleport'
        ? Array.from({ length: lanes }, (_, lane) => {
            const plan = teleportPlan(battle, 'p', lane);
            return plan
              ? `Ligne ${lane + 1} : ${esc(CARDS[plan.u.id].name)}, de ${plan.fromLane + 1} vers ${lane + 1}, case ${plan.col}`
              : `Ligne ${lane + 1} : ${esc(controlTargetError(battle, 'p', selected, lane))}`;
          }).join(' · ')
        : '';
    const arena =
      cells === 10
        ? paintedArena(lanes, (lane, col, visual) => battleCell(battle.board[lane][col], lane, col, visual))
        : `<div class="arena-sky" aria-hidden="true"></div>${Array.from({ length: lanes }, (_, lane) => `<div class="lane-row" data-crown-col="${cells + 1}"><div class="lane-label">${['I', 'II', 'III', 'IV'][lane]}</div><div class="lane-gate" aria-label="Votre couronne"><span class="pixel-tower" aria-hidden="true"></span><b>♜</b></div>${Array.from({ length: cells }, (_, i) => battleCell(battle.board[lane][i + 1], lane, i + 1)).join('')}<div class="lane-gate enemy" aria-label="Couronne adverse"><span class="pixel-tower" aria-hidden="true"></span><b>♛</b></div></div>`).join('')}`;
    return `<div class="combat-screen" data-painted-arena="${cells === 10}" data-card-layout="${immersive}"><div class="split-head combat-titlebar"><div><div class="kicker">${battle.mode==='developer'?'TEST SANS RÉCOMPENSE':'COMBAT TACTIQUE'} · ${esc(battle.missionName)}</div><h1 class="combat-mission-name">${esc(battle.missionName)}</h1>${battle.mode==='evolution-trial'?`<p class="trial-combat-objective">${esc(evolutionTrial(battle.missionId)?.objective||'')}</p>`:''}</div><span class="pill">2 cartes maximum par tour</span><button type="button" class="combat-menu-link" data-action="${battle.mode==='developer'?'lab-back':'nav'}" data-page="home" aria-label="${battle.mode==='developer'?'Retourner au laboratoire':'Revenir à la Citadelle sans abandonner la bataille'}">${battle.mode==='developer'?'⚙ Laboratoire':'☷ Citadelle'}</button></div>
 <section class="battle-panel arena-lofi combat-stage">${battleHud(p, e)}
 <div class="combat-readout" aria-label="Lecture des actions du combat"><div class="combat-readout-copy" role="status" aria-live="polite" aria-atomic="true"><b class="combat-phase">${selection?'Ciblage du sort':battle.phase === 'enemy' ? 'Tour adverse' : 'À vous de jouer'}</b><span class="combat-action">${selection?'Cliquez une cible autorisée, puis confirmez dans l’aperçu.':battle.phase === 'enemy' ? 'L’IA prépare ses cartes.' : 'Posez vos cartes, puis validez vos actions.'}</span></div><button type="button" data-action="fx-speed" aria-label="Vitesse de lecture des actions">×1</button><button type="button" data-action="fx-skip" hidden>Passer</button>${spellTargetingUI(selection,spellTarget,spellPreview,esc)}</div>
 <div class="arena-caption"><span>${selectedCard >= 0 ? (selection?'✦ CHOISISSEZ LA CIBLE DU SORT':'✦ CHOISISSEZ UNE CASE DE DÉPART') : '✧ ARÈNE DES SERMENTS'}</span><span>${lanes} lignes · ${cells} cases par ligne</span></div><div class="battle-grid ${cells === 10 ? 'arena-structured arena-painted' : ''}" tabindex="0" role="region" aria-label="Plateau de combat : ${lanes} lignes de ${cells} cases" style="--cells:${cells};--arena-scene:url('${arenaBackdrop()}')">${arena}</div>
 <div class="arena-legend" aria-label="Légende du plateau"><span class="legend-ally">${campSeal('p')} VOS UNITÉS</span><span class="legend-enemy">${campSeal('e')} ADVERSAIRES</span><span>Contour : rareté · Étiquette : Ordre</span></div>
 <p class="arena-scroll-hint">Sur petit écran, faites glisser le plateau pour voir toutes les cases. Les couronnes sont hors de la grille.</p><div class="vfx-controls"><span>Attaques, déplacements et effets du combat.</span><button type="button" class="vfx-toggle" data-action="toggle-animations" aria-pressed="${animationsEnabled}">${animationsEnabled ? '✦ ' : ''}Animations ${animationsEnabled ? 'activées' : 'désactivées'}</button></div>
 ${battle.mode === 'dungeon' ? `<div class="dungeon-battle-banner">♛ DONJON · ${battle.dungeonBonus ? 'Épreuve bonus' : 'Salle ' + (battle.dungeonStage + 1) + '/3'} · Les PV du héros sont conservés entre les combats (+6 PV après victoire).</div>` : ''}
 <p class="control-tip">⊘ Silence : capacités déclenchées suspendues, attaques et traits passifs conservés. ✧ Téléportation : autre ligne, même colonne. ⌁ Pièges publics : déclenchés à l’arrivée d’un ennemi, deux par camp. ◷ Tempo : accélérez vos cartes ou ralentissez une carte adverse.</p>${preview ? `<p class="teleport-preview" role="status">${preview}</p>` : ''}
 <p class="formation-tip">✦ CONCORDE : deux alliés du même Ordre sur la même ligne gagnent chacun +1 attaque ; leur emblème s’éclaire. ⚡ Charge après déplacement · ↶ Riposte au contact. Valeurs et fréquence sur la fiche de chaque version.</p>
 <div class="battle-tip"><span>← VOTRE COURONNE · VOS UNITÉS AVANCENT →</span><span>← L’ENNEMI AVANCE · COURONNE ADVERSE →</span></div>
 ${immersive ? '' : '</section>'}<div class="combat-hand-dock" role="region" aria-label="Main de cartes et actions de combat"><div class="hand-panel"><div class="combat-hand-tray"><div class="hand-header"><div><div class="section-caption">Votre main · ${p.hand.length} cartes</div><div class="selection-guide">${selectedCard >= 0 ? (selection?'✦ Sort sélectionné : cliquez une cible, puis confirmez.':'✦ Carte sélectionnée : choisissez une des trois premières cases libres.') : 'Survol : lire. Toucher : lire, puis retoucher pour sélectionner.'}</div></div><span class="pill">${p.cardsPlayed}/2 jouées</span></div><div class="hand">${p.hand.map((c, i) => cardUI(c.id, { compact: true, index: i, select: selectedCard === i, cooldown: c.wait })).join('') || '<div class="hint">Votre main est vide. Terminez le tour.</div>'}</div></div>
 ${battleActions(immersive)}</div></div>${immersive ? '</section>' : ''}${inspectionPanel}</div>`;
  }

  return { battleUI: bind(battleUI) };
}

