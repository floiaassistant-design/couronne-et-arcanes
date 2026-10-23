// Maintient des dépendances explicites après l'extraction des écrans.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../',import.meta.url));
const namedImports=/^import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"];?$/gm;
// Garde lexical léger : une propriété homonyme (m.aiStyle) n'est pas une liaison.
const referencesName=(body,name)=>new RegExp('(?<![\\w$.])'+name+'(?![\\w$])').test(body);
const sourcePaths=['src/app.js','src/ui/views.js','src/ui/pages.js','src/ui/battle-view.js','src/ui/guide-page.js'];
const read=file=>readFileSync(path.join(root,file),'utf8');

test('Les écrans ne conservent pas de noms importés inutilisés',()=>{
 for(const file of sourcePaths){
  const source=read(file);
  const body=source.replace(namedImports,'');
  for(const match of source.matchAll(namedImports)){
   for(const imported of match[1].split(',').map(x=>x.trim()).filter(Boolean)){
    const name=imported.split(/\s+as\s+/).at(-1);
    assert.ok(referencesName(body,name),file+' : '+name+' est importé mais jamais utilisé');
   }
  }
 }
});

test('Une propriété homonyme ne masque pas un import mort',()=>{
 assert.equal(referencesName('m.aiStyle;','aiStyle'),false);
 assert.equal(referencesName('aiStyle(battle);','aiStyle'),true);
});

function sourceFiles(dir='src'){
 return readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(entry=>{
  const child=path.posix.join(dir,entry.name);
  return entry.isDirectory()?sourceFiles(child):entry.isFile()&&entry.name.endsWith('.js')?[child]:[];
 });
}
test('Le graphe de modules reste sans imports circulaires',()=>{
 const files=sourceFiles(),set=new Set(files),graph=new Map();
 for(const file of files){
  const source=read(file),deps=new Set();
  for(const match of source.matchAll(/^(?:import\s*\{[^}]+\}\s*from|export\s*\*\s*from)\s*['"]([^'"]+)['"];?$/gm)){
   const request=match[1];
   if(!request.startsWith('.'))continue;
   const target=path.posix.normalize(path.posix.join(path.posix.dirname(file),request));
   assert.ok(set.has(target),file+' : dépendance absente '+request);
   deps.add(target);
  }
  graph.set(file,[...deps]);
 }
 const visited=new Set(),active=new Set();
 function visit(file,stack=[]){
  assert.ok(!active.has(file),'Cycle : '+[...stack,file].join(' -> '));
  if(visited.has(file))return;
  active.add(file);
  for(const next of graph.get(file))visit(next,[...stack,file]);
  active.delete(file);visited.add(file);
 }
 for(const file of files)visit(file);
});
