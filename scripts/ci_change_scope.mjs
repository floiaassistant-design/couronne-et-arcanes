// Détecter uniquement les PR dont tous les changements concernent du Markdown.
import { execFileSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Liste volontairement restrictive : toute ressource, configuration, source,
// donnée, workflow ou test inconnu déclenche la validation complète.
export function isDocumentationPath(path) {
  return /^(?:[^/]+\.md|docs\/.+\.md)$/.test(path);
}

export function isDocumentationOnly(paths) {
  return paths.length > 0 && paths.every(isDocumentationPath);
}

export function classifyEvent(eventName, changedPaths) {
  // Les pushes sur main gardent les deux workflows complets, nécessaires
  // à la publication Sites et à la provenance du paquet.
  return eventName === 'pull_request' && isDocumentationOnly(changedPaths);
}

export function changedFilesFromBase(baseSha) {
  if (!/^[a-f0-9]{40}$/i.test(baseSha || '')) {
    throw new Error('SHA de base de PR absent ou invalide : refus du raccourci CI');
  }
  // Checkout standard d'une PR : HEAD est le commit de fusion de test.
  // Le SHA de base doit en être un ancêtre ; sinon, fail closed.
  execFileSync('git', ['merge-base', '--is-ancestor', baseSha, 'HEAD'], {
    stdio: 'pipe',
  });
  // --no-renames expose les deux chemins d'un déplacement :
  // renommer du code en .md ne doit jamais passer pour de la documentation.
  const raw = execFileSync('git', [
    'diff', '--no-renames', '--name-only', '-z', baseSha, 'HEAD',
  ], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  return raw.split('\0').filter(Boolean);
}

export function main() {
  const eventName = process.env.GITHUB_EVENT_NAME;
  const paths = eventName === 'pull_request'
    ? changedFilesFromBase(process.env.CI_BASE_SHA)
    : [];
  const docsOnly = classifyEvent(eventName, paths);
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) throw new Error('GITHUB_OUTPUT absent');
  appendFileSync(outputPath, `docs_only=${docsOnly}\n`);
  console.log(`Événement : ${eventName}; documentation seule : ${docsOnly}`);
  if (eventName === 'pull_request') {
    console.log(`Fichiers examinés : ${paths.length}`);
    for (const path of paths) console.log(` - ${path}`);
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main();
}
