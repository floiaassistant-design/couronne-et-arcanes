import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const groups=JSON.parse(read('scripts/ci_browser_groups.json'));

// Inventaire indépendant des 27 entrées du workflow avant découpage (main 6dee2dc).
const baseline=`concorde spell_targeting combat_fx card_study deployment card_preview art_reset
 developer_lab maintenance collection evolution_trials milicien aube sylve ombre forge ether spells
 class_skills_v28 new_game_legibility_v211 battle_control_v29 illustrated_pilot_v3 card_capabilities
 arena_v211 combat_fullscreen_v211 painted_arena save_integrity_v211`.trim().split(/\s+/).map(n=>'tests/browser_'+n+'.py');

test('CI : les 27 suites existantes et les quatre parties des épreuves passent exactement une fois',()=>{
 const commands=Object.values(groups).flat();
 assert.deepEqual([...new Set(commands.map(c=>c[0]))].sort(),baseline.sort());
 assert.equal(commands.length,30);assert.equal(new Set(commands.map(c=>JSON.stringify(c))).size,30);
 for(const suite of baseline.filter(p=>!p.endsWith('evolution_trials.py')))assert.equal(commands.filter(c=>c[0]===suite).length,1,suite);
 const result=spawnSync('python3',['tests/ci_pipeline_test.py'],{encoding:'utf8'});
 assert.equal(result.status,0,result.stdout+'\n'+result.stderr);
});

test('CI : toutes les vérifications moteur restent actives une seule fois et la classification documentaire reste restrictive',()=>{
 const workflow=read('.github/workflows/test.yml');
 for(const command of ['npm test','npm run test:parity','npm run build\n','git diff --exit-code -- JOUER.html','npm run control-balance','npm run arena-balance'])assert.equal(workflow.split(command).length-1,1,command);
 assert.match(workflow,/fail-fast: false/);assert.match(workflow,/max-parallel: 4/);
 assert.match(workflow,/group: \[interface, combat, catalogue, moteur\]/);
 assert.match(workflow,/run: node scripts\/ci_change_scope.mjs/);
 assert.doesNotMatch(workflow,/continue-on-error|pull_request_target|secrets\./);
 assert.match(workflow,/contents: read/);
 assert.equal((workflow.match(/python3 -m pip install/g)||[]).length,1);
 assert.equal((workflow.match(/playwright install --with-deps chromium/g)||[]).length,1);
 assert.match(workflow,/persist-credentials: false/);
 assert.match(workflow,/name: apercu-\$\{\{ matrix.group \}\}/);
});

test('CI : le verdict historique validation attend la matrice et refuse échec, annulation, saut et absence',()=>{
 const workflow=read('.github/workflows/test.yml'),gate=workflow.slice(workflow.indexOf('\n  validation:'));
 assert.match(gate,/needs: tests/);assert.match(gate,/if: \$\{\{ always\(\) \}\}/);
 assert.match(gate,/TEST_GROUPS_RESULT: \$\{\{ needs.tests.result \}\}/);
 // Le shell exact du workflow est exécuté, pas une copie de son algorithme.
 const shell=gate.split('        run: |\n')[1].split('\n').map(l=>l.slice(10)).join('\n');
 for(const [result,expected] of [['success',0],['failure',1],['cancelled',1],['skipped',1],['',1],['unexpected',1]]){
  const process=spawnSync('bash',['-e','-c',shell],{env:{...globalThis.process.env,TEST_GROUPS_RESULT:result},encoding:'utf8'});
  assert.equal(process.status,expected,result||'absent');
 }
});
