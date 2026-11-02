import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
const root=fileURLToPath(new URL('../',import.meta.url));
const read=p=>readFileSync(root+p,'utf8');
test('V2.5 stable engine facade preserves all core entrypoints',async()=>{
 const api=await import('../src/engine.js');
 for(const name of ['freshProfile','normalizeProfile','createBattle','playPlayerCard','endPlayerTurn','formationBonus','settleDungeonBattle','completeBattle','chooseHeroTalent','fuseCard','upgradeCard','heroLevel'])assert.equal(typeof api[name],'function',name);
});
test('V2.5 pure core has no DOM/storage dependencies',()=>{
 for(const f of ['src/engine/profile.js','src/engine/battle.js','src/engine/unit-stats.js','src/engine/battle-control.js','src/engine/dungeon-run.js','src/engine/economy.js','src/ai.js']){
  assert.ok(existsSync(root+f));
  assert.doesNotMatch(read(f),/\b(?:document|window|localStorage)\s*[.\[]/,f);
 }
});
test('V2.5 browser persistence keys remain stable',()=>{
 const storage=read('src/ui/storage.js');
 assert.match(storage,/couronnes_arcanes_v1/);
 assert.match(storage,/couronnes_arcanes_bataille_v1/);
 assert.match(read('src/app.js'),/couronnes_arcanes_animations_v13/);
});
test('V2.5 production bundle isolates internal variables and embeds offline artwork',()=>{
 const html=read('JOUER.html');
 assert.match(html,/data:image\/webp;base64/);
 assert.doesNotMatch(html,/Object\.defineProperties\(window/);
 assert.doesNotMatch(html,/<script[^>]*src=/);
 assert.doesNotMatch(html,/import \{/);
});
test('Le script autonome distribué est du JavaScript exécutable',()=>{
 const script=read('JOUER.html').match(/<script>\n([\s\S]*)<\/script>/)?.[1];
 assert.ok(script,'Script autonome manquant');
 assert.doesNotThrow(()=>new Script(script,{filename:'JOUER.html'}));
});
