import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';

test('Le point d’entrée du jeu est analysable en JavaScript avant les tests navigateur',()=>{
 assert.doesNotThrow(()=>execFileSync(process.execPath,['--check','src/app.js'],{stdio:'pipe'}));
 const app=readFileSync('src/app.js','utf8');
 assert.match(app,/function recoveryUI\(\)/);
 assert.match(app,/function changeProfile\(operation\)/);
 assert.equal((app.match(/if\(event\.target\.id==='import-file'\)/g)||[]).length,1);
});
