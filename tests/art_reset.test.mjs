import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {createCombatFx} from '../src/ui/combat-fx.js';

test('Sans anciens effets : fin de lecture immédiate, événements et dégâts inchangés',()=>{
 const events=[{type:'attack',damage:4}],before=structuredClone(events);let completed=0;
 const fx=createCombatFx(()=>{throw Error('Aucun lecteur de personnages ne doit démarrer');});
 fx.playBattleFx(events,()=>completed++);fx.stopBattleFx();
 assert.equal(completed,1);assert.deepEqual(events,before);
});
test('Builder : aucune ancienne image ajoutée sans registre ni approbation',()=>{
 const root=fileURLToPath(new URL('../',import.meta.url)),dir=fs.mkdtempSync(path.join(os.tmpdir(),'ca-new-art-'));
 try{
  for(const f of ['package.json','index.html','styles.css','src','scripts','assets'])fs.cpSync(path.join(root,f),path.join(dir,f),{recursive:true});
  fs.writeFileSync(path.join(dir,'assets/creatures/ancien.webp'),'not approved');
  let r=spawnSync(process.execPath,['scripts/build_standalone.mjs'],{cwd:dir,encoding:'utf8'});
  assert.notEqual(r.status,0);assert.match(r.stderr,/Illustration non cataloguée/);
  fs.unlinkSync(path.join(dir,'assets/creatures/ancien.webp'));
  fs.writeFileSync(path.join(dir,'assets/artwork.json'),JSON.stringify({schemaVersion:1,assets:[{key:'test',status:'review'}]}));
  r=spawnSync(process.execPath,['scripts/build_standalone.mjs'],{cwd:dir,encoding:'utf8'});
  assert.notEqual(r.status,0);assert.match(r.stderr,/Approbation\/provenance manquante/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
