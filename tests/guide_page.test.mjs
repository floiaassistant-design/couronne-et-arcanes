import test from 'node:test';
import assert from 'node:assert/strict';
import { renderGuidePage } from '../src/ui/guide-page.js';
import { createPages } from '../src/ui/pages.js';

const btn = (label, action, extra = '', cls = '') =>
  `<button class="${cls}" data-action="${action}" ${extra}>${label}</button>`;

test('les étapes, règles et actions du Guide sont conservées', () => {
  const html = renderGuidePage({ btn, previousGameAvailable: false });
  assert.equal((html.match(/class="guide-step"/g) || []).length, 17);
  for (const action of ['export-save', 'import-save', 'start-mission'])
    assert.match(html, new RegExp('data-action="' + action + '"'));
  assert.match(html, /10 cases jouables/);
  assert.match(html, /trois premières/);
  assert.doesNotMatch(html, /data-action="restore-previous-game"/);
});

test('le Guide ne propose la restauration que si une partie existe', () => {
  assert.match(renderGuidePage({ btn, previousGameAvailable: true }), /data-action="restore-previous-game"/);
  assert.doesNotMatch(renderGuidePage({ btn, previousGameAvailable: false }), /data-action="restore-previous-game"/);
});

test('la page relit la disponibilité de la sauvegarde à chaque rendu', () => {
  let previousGameAvailable = false;
  const getState = () => ({
    profile: {}, battle: null, collectionFilter: 'aube',
    collectionOwned: false, previousGameAvailable
  });
  const pages = createPages(getState, {
    btn, cardUI: () => '', esc: value => value,
    num: value => value, heroProgress: () => ({})
  });
  assert.doesNotMatch(pages.guideUI(), /data-action="restore-previous-game"/);
  previousGameAvailable = true;
  assert.match(pages.guideUI(), /data-action="restore-previous-game"/);
});
