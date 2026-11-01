import test from 'node:test';
import assert from 'node:assert/strict';
import {checkPrDocumentation, field} from '../scripts/check_pr_docs.mjs';

const body = [
  '## Documentation et reprise',
  'Documentation: mise-a-jour',
  'Justification: Non applicable pour cette PR.',
  'Reprise: Revoir la CI sur le SHA exact, puis présenter la PR.',
  'Limites: La CI ne garantit pas la justesse métier des documents.',
].join('\n');
const run = (description, files = ['AGENTS.md'], eventName = 'pull_request') =>
  checkPrDocumentation({eventName, body: description, files});

test('lit les champs structurés sans interpréter le texte libre', () => {
  assert.equal(field(body, 'Documentation'), 'mise-a-jour');
  assert.equal(field(body, 'Reprise').startsWith('Revoir la CI'), true);
});
test('PR documentée et document effectivement modifié', () => {
  assert.deepEqual(run(body), []);
  assert.deepEqual(run(body, ['docs/ETAT_PROJET.md']), []);
});
test('documentation annoncée mais aucune modification Markdown', () => {
  assert.match(run(body, ['src/app.js']).join(' '), /aucun Markdown/);
});
test('absence de documentation justifiée', () => {
  const without = body.replace('Documentation: mise-a-jour', 'Documentation: non-necessaire');
  assert.deepEqual(run(without, ['src/app.js']), []);
});
test('absence de justification explicite refusée', () => {
  const without = body.replace('Documentation: mise-a-jour', 'Documentation: non-necessaire')
    .replace('Justification: Non applicable pour cette PR.', 'Justification: TODO');
  assert.match(run(without, ['src/app.js']).join(' '), /Justification/);
});
test('champs de reprise et limites manquants refusés', () => {
  const incomplete = body.replace('Reprise: Revoir la CI sur le SHA exact, puis présenter la PR.', 'Reprise: [à compléter]')
    .replace('Limites: La CI ne garantit pas la justesse métier des documents.', 'Limites: TBD');
  assert.equal(run(incomplete).length, 2);
});
test('modes invalides et liste vide refusés', () => {
  assert.equal(run(body.replace('Documentation: mise-a-jour', 'Documentation: peut-être'), []).length, 2);
});
test('push main ignoré : validation documentaire réservée aux PR', () => {
  assert.deepEqual(run('', [], 'push'), []);
});
