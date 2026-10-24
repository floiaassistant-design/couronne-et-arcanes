import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import {
  classifyEvent, isDocumentationOnly, isDocumentationPath,
} from '../scripts/ci_change_scope.mjs';

test('les seuls Markdown racine ou docs peuvent raccourcir une PR', () => {
  for (const name of ['README.md', 'AGENTS.md', 'CHANGELOG.md', 'docs/ETAT_PROJET.md', 'docs/sous-dossier/guide.md']) {
    assert.equal(isDocumentationPath(name), true, name);
  }
  for (const name of ['src/notes.md', '.github/workflows/test.yml', 'docs/config.json',
    'docs/previews/carte.png', 'JOUER.html', 'scripts/build_web.mjs',
    'assets/artwork.json', 'tests/ci_change_scope.test.mjs']) {
    assert.equal(isDocumentationPath(name), false, name);
  }
  assert.equal(isDocumentationOnly([]), false, 'liste vide : contrôle complet');
  assert.equal(isDocumentationOnly(['README.md', 'docs/ETAT_PROJET.md']), true);
  assert.equal(isDocumentationOnly(['README.md', 'src/data.js']), false);
  assert.equal(classifyEvent('push', ['README.md']), false, 'main : publication contrôlée');
  assert.equal(classifyEvent('pull_request', ['docs/guide.md']), true);
  assert.equal(classifyEvent('workflow_dispatch', ['README.md']), false);
});

test('le diff réel refuse une PR mixte ou un renommage depuis du code', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ca-ci-scope-'));
  const script = resolve('scripts/ci_change_scope.mjs');
  const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim();
  const validate = (event, base) => {
    const file = join(dir, 'github-output');
    writeFileSync(file, '');
    const run = spawnSync(process.execPath, [script], {
      cwd: dir, encoding: 'utf8',
      env: { ...process.env, GITHUB_EVENT_NAME: event, CI_BASE_SHA: base, GITHUB_OUTPUT: file },
    });
    assert.equal(run.status, 0, run.stderr || run.stdout);
    return readFileSync(file, 'utf8').trim();
  };
  try {
    git('init', '-q');
    git('config', 'user.email', 'ci@example.invalid');
    git('config', 'user.name', 'CI test');
    mkdirSync(join(dir, 'docs'));
    mkdirSync(join(dir, 'src'));
    writeFileSync(join(dir, 'README.md'), '# base\n');
    writeFileSync(join(dir, 'src', 'game.js'), 'export const game = true;\n');
    git('add', '.');
    git('commit', '-qm', 'base');
    const base = git('rev-parse', 'HEAD');
    writeFileSync(join(dir, 'README.md'), '# documentation\n');
    git('add', '.');
    git('commit', '-qm', 'documentation');
    assert.equal(validate('pull_request', base), 'docs_only=true');
    assert.equal(validate('push', base), 'docs_only=false');
    writeFileSync(join(dir, 'src', 'game.js'), 'export const game = false;\n');
    git('add', '.');
    git('commit', '-qm', 'code');
    assert.equal(validate('pull_request', base), 'docs_only=false');
    // Même sans autre modification du code, la suppression du chemin src/
    // doit empêcher de qualifier ce renommage de documentaire.
    const beforeRename = git('rev-parse', 'HEAD');
    renameSync(join(dir, 'src', 'game.js'), join(dir, 'docs', 'game.md'));
    git('add', '-A');
    git('commit', '-qm', 'rename');
    assert.equal(validate('pull_request', beforeRename), 'docs_only=false');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
