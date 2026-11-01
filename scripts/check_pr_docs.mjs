// Contrat minimal de documentation et de reprise pour chaque PR.
// La présence des champs est testable ; leur exactitude reste une revue humaine/agent.
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {changedFilesFromBase, isDocumentationPath} from './ci_change_scope.mjs';

const MODES = new Set(['mise-a-jour', 'non-necessaire']);
const EMPTY = /^(?:\[[^\]]+\]|à compléter|a completer|todo|tbd|n\/a|\.{3}|-+)$/i;

export function field(body, name) {
  const prefix = new RegExp('^\\s*' + name + '\\s*:\\s*', 'i');
  const line = String(body || '').split(/\r?\n/).find(value => prefix.test(value));
  return line ? line.replace(prefix, '').trim() : '';
}

function filled(text) {
  return text.length >= 12 && !EMPTY.test(text);
}

export function checkPrDocumentation({eventName, body, files}) {
  if (eventName !== 'pull_request') return [];
  const errors = [];
  const mode = field(body, 'Documentation').toLowerCase();
  const reason = field(body, 'Justification');
  const resume = field(body, 'Reprise');
  const limits = field(body, 'Limites');

  if (!files.length) errors.push('Liste de fichiers vide : vérification impossible.');
  if (!MODES.has(mode)) {
    errors.push('Documentation: mise-a-jour OU Documentation: non-necessaire attendu.');
  } else if (mode === 'mise-a-jour' && !files.some(isDocumentationPath)) {
    errors.push('Documentation déclarée mise à jour mais aucun Markdown racine/docs/ modifié.');
  } else if (mode === 'non-necessaire' && !filled(reason)) {
    errors.push('Justification concrète obligatoire sans modification documentaire.');
  }
  if (!filled(resume)) errors.push('Reprise: prochaine action / état durable requis (12 caractères minimum).');
  if (!filled(limits)) errors.push('Limites: limites connues ou absence de limite expliquée requises.');
  return errors;
}

export function main() {
  if (process.env.GITHUB_EVENT_NAME !== 'pull_request') {
    console.log('Contrôle documentaire réservé aux PR.');
    return;
  }
  if (!process.env.GITHUB_EVENT_PATH) throw Error('GITHUB_EVENT_PATH absent.');
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
  const base = event.pull_request?.base?.sha;
  const files = changedFilesFromBase(base);
  const errors = checkPrDocumentation({
    eventName: 'pull_request',
    body: event.pull_request?.body,
    files,
  });
  console.log('Fichiers examinés : ' + files.length);
  if (errors.length) {
    for (const error of errors) console.error('Documentation : ' + error);
    process.exitCode = 1;
    return;
  }
  console.log('Documentation/reprise renseignées ; cohérence sémantique à revoir avant fusion.');
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main();
}
