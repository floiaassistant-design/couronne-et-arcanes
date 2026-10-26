import { esc } from './markup.js';
import {cardPresentation,cardPreviewAttributes} from './card-presentation.js';
import { generatedCardFace } from './generated-card.js';
import { createPages } from './pages.js';
import { createBattleView } from './battle-view.js';
import { unitStatContext } from '../engine/unit-stats.js';
// Écrans et cartes : rendu HTML sans gestion de navigation ni de sauvegarde.
import { FACTIONS, CLASSES } from '../data.js';

import { visualFor, artSrc, cardTemplateFor } from '../visuals.js';

import {
  heroLevel,
  HERO_MAX_LEVEL,
  HERO_LEVEL_THRESHOLD,
  masteryRank,
  MASTERY_THRESHOLDS
} from '../engine.js';

export function createViews(getState) {
  let profile, battle, screen, animationsEnabled;
  const num = (n) => Math.round(n).toLocaleString('fr-FR');
  function bind(fn) {
    return (...args) => {
      ({ profile, battle, screen, animationsEnabled } = getState());
      return fn(...args);
    };
  }
  function heroProgress(p) {
    const level = heroLevel(p),
      start = HERO_LEVEL_THRESHOLD(level),
      end = level === HERO_MAX_LEVEL ? start : HERO_LEVEL_THRESHOLD(level + 1);
    return {
      level,
      shown: Math.max(0, (p.heroXp || 0) - start),
      needed: Math.max(0, end - start),
      percent:
        level === HERO_MAX_LEVEL
          ? 100
          : Math.max(0, Math.min(100, (100 * ((p.heroXp || 0) - start)) / (end - start)))
    };
  }
  function resourceUI() {
    return `<div class="res-pill">♛ Niv. <b>${heroLevel(profile)}</b></div><div class="res-pill">◈ Or <b>${num(profile.gold)}</b></div><div class="res-pill">✧ Éclats <b>${num(profile.shards)}</b></div><div class="res-pill">✦ Renommée <b>${num(profile.stars)}</b></div>`;
  }
  function navUI() {
    const pages = [
      ['home', 'Citadelle', '♜'],
      ['campaign', 'Campagne', '⚑'],
      ['tower', 'Tour', '♛'],
      ['dungeons', 'Donjons', '⚔'],
      ['collection', 'Collection', '✦'],
      ['alchemy', 'Alchimie', '⚗'],
      ['forge', 'Atelier', '⚒'],
      ['guide', 'Guide', '☷'],
       ['developer', 'Développeur', '⚙']
    ];
    if (battle?.status === 'active') pages.push(['battle', 'Combat en cours', '⚔']);
    return pages
      .map(
        ([id, label, icon]) =>
          `<button type="button" class="nav-btn ${screen === id ? 'active' : ''}" data-action="nav" data-page="${id}">${icon}&nbsp; ${label}</button>`
      )
      .join('');
  }
  function btn(label, action, extra = '', cls = '') {
    return `<button type="button" class="btn ${cls}" data-action="${action}" ${extra}>${label}</button>`;
  }
  function cardUI(
    id,
    {
      compact = false,
      index = null,
      select = false,
      canEdit = false,
      upgradable = false,
      cooldown = null,
      rarity = null, statContext = null, side = 'p', previewContext = null
    } = {}
  ) {
    const reference=typeof id==='object'?id:rarity?{id,rarity}:id;
    id=typeof id==='object'?id.id:id;
    const inHand = compact && cooldown !== null && cooldown !== undefined;
    const context = statContext||(inHand && battle ? battle : unitStatContext(profile));
    const entry=inHand?battle?.heroes.p.hand[index]:null;
    const actualReference=entry?.id===id?entry:reference;
    const presentation=cardPresentation(actualReference,{context,side});
    if(!presentation)return '';
    const c=presentation.card;
    const tone = FACTIONS[c.faction].tone,
      owned = profile.collection[id] || 0,
      visual = visualFor(c, { cards: true }),
      masteryXp = profile.mastery?.[id] || 0;
    const waiting = inHand && cooldown > 0,
      ready = inHand && !waiting;
    const stats=presentation.stats;
    const bonus = context.upgrades?.[id] || 0,
      rank = masteryRank({ mastery: context.mastery }, id);
    const fullCard = cardTemplateFor(c),
      pilot = id === 'archer',
      illustrated = pilot || inHand; // Cadre commun de la main illustrée.
    return `<div class="unit-card ${fullCard ? 'generated-template' : ''} ${illustrated ? 'illustrated-pilot' : ''} ${compact ? 'compact' : ''} ${waiting ? 'on-cooldown hand-waiting' : ''} ${ready ? 'hand-ready' : ''} ${inHand ? 'hand-card' : ''} ${inHand && animationsEnabled ? 'timer-motion' : ''} ${select ? 'selected' : ''}" data-rarity="${c.rarity}" style="--tone:${tone}" ${!inHand&&previewContext!=='collection'?cardPreviewAttributes(id,c.rarity,previewContext||screen,esc):''} ${compact ? `aria-controls="hand-card-inspection" aria-expanded="false" data-action="select-card" data-index="${index}" role="button" tabindex="0" aria-label="${esc(c.name)}${inHand ? (waiting ? ', en attente : ' + cooldown + ' tour' + (cooldown > 1 ? 's' : '') + ' avant disponibilité' : ', prête à être jouée') : ''}, consulter les capacités"` : ''}>
 ${illustrated && !fullCard ? `<span class="illustrated-faction">${esc(FACTIONS[c.faction].short)}</span><span class="illustrated-count" data-delay-kind="${inHand ? 'remaining' : 'base'}" aria-label="${inHand ? 'Attente restante' : 'Délai de base'} : ${inHand ? cooldown : c.delay}"><b>${inHand ? cooldown : c.delay}</b></span>` : ''}
 <div class="card-head"><span>${esc(c.heroClass ? CLASSES[c.heroClass].name : FACTIONS[c.faction].short)}</span><b>${c.heroClass ? 'COMPÉTENCE' : c.type === 'sort' ? 'SORT' : 'UNITÉ'}</b></div>
 <div class="card-quality-tag" aria-label="Rareté : ${esc(c.rarity)}">${esc(c.rarity.toUpperCase())}</div>
 ${
   fullCard
     ? `${inHand ? `<div class="hand-readiness ${waiting ? 'waiting' : 'ready'}" aria-hidden="true">${waiting ? '◷ EN ATTENTE' : '✓ PRÊTE'}</div>` : ''}${generatedCardFace(c, { stats, delay: inHand ? cooldown : c.delay, kind: inHand ? 'remaining' : 'base', esc })}`
     : ` <div class="portrait creature-portrait role-${visual.role}"><img class="creature-image" src="${artSrc(visual.art)}" alt="" data-artwork-status="placeholder" loading="lazy" draggable="false" /><span class="portrait-emblem" aria-hidden="true">${c.icon}</span></div>
 ${inHand ? `<div class="hand-readiness ${waiting ? 'waiting' : 'ready'}" aria-hidden="true">${waiting ? '◷ EN ATTENTE' : '✓ PRÊTE'}</div>` : ''}
 <div class="card-title">${esc(c.name)}${bonus ? ` <span class="tiny gold">+${bonus}</span>` : ''}${rank ? ` <span class="mastery-seal" title="Maîtrise ${rank}/3">✦${rank}</span>` : ''}</div>
 <div class="card-detail" title="${esc(c.description)}">${esc(c.description)}</div>
 ${
   presentation.traits.length
     ? `<div class="card-traits">${presentation.traits
         .map((t) => `<span class="trait-pill">${esc(t)}</span>`)
         .join('')}</div>`
     : ''
 }
 <div class="card-stats" ${stats ? 'title="Statistiques à l’invocation, bonus inclus"' : ''}>${stats ? `<span class="stat atk">⚔ <b>${stats.atk}</b></span><span class="stat hp">♥ <b>${stats.maxhp}</b></span>` : ''}<span class="stat cd">◷ <b>${inHand ? cooldown : c.delay}</b></span><span class="card-rarity">${esc(c.rarity)}</span></div>`
 }

 ${fullCard && !inHand && (bonus || rank) ? `<div class="generated-card-progress">${bonus ? 'Amélioration +' + bonus : ''}${bonus && rank ? ' · ' : ''}${rank ? 'Maîtrise ' + rank + '/3' : ''}</div>` : ''}
 ${(canEdit || upgradable) && owned ? `<div class="mastery-progress" title="Maîtrise gagnée en jouant cette carte"><span>Maîtrise ${rank}/3 · ${masteryXp}${rank === 3 ? ' (MAX)' : ' / ' + MASTERY_THRESHOLDS[rank + 1]} XP</span><div class="mastery-track"><i style="width:${rank === 3 ? 100 : Math.min(100, (masteryXp / MASTERY_THRESHOLDS[rank + 1]) * 100)}%"></i></div></div>` : ''}
 ${canEdit ? `<div class="card-actions"><span class="tiny muted">Possédées : ${owned}</span><span>${btn('+', 'deck-add', `data-id="${id}" aria-label="Ajouter ${esc(c.name)}"`, 'small')}${btn('−', 'deck-remove', `data-id="${id}" aria-label="Retirer ${esc(c.name)}"`, 'small ghost')}</span></div>` : ''}
 ${upgradable && c.type === 'unité' ? `<div class="card-actions"><span class="tiny muted">Niv. ${bonus}/3</span>${btn(bonus === 3 ? 'MAX' : `+1 · ${(bonus + 1) * 35} ✧`, 'card-upgrade', `data-id="${id}" ${!owned || bonus === 3 ? 'disabled' : ''}`, 'small')}</div>` : ''}
 ${waiting ? `<div class="cooldown-stamp" aria-hidden="true"><b>${cooldown}</b><small>${cooldown === 1 ? 'TOUR' : 'TOURS'}</small></div>` : ''}</div>`;
  }
  const pages = createPages(getState, { btn, cardUI: bind(cardUI), esc, num, heroProgress });
  const battlefield = createBattleView(getState, { btn, cardUI: bind(cardUI), esc });
  return {
    ...pages,
    ...battlefield,
    btn,
    cardUI: bind(cardUI),
    navUI: bind(navUI),
    resourceUI: bind(resourceUI)
  };
}
