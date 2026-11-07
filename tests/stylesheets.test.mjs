import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readStylesheets} from '../scripts/lib/stylesheets.mjs';

function fixture(run){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'ca-css-'));
 try{
  fs.mkdirSync(path.join(root,'styles'));
  fs.writeFileSync(path.join(root,'styles.css'),':root{--test:1}');
  fs.writeFileSync(path.join(root,'styles/cards.css'),'.card{color:red}');
  run(root);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
}
const link=file=>`<link rel="stylesheet" href="${file}" />`;

test('CSS : chaque module de présentation est relié à l’entrée web',()=>{
 const root=fileURLToPath(new URL('../',import.meta.url));
 const linked=new Set(readStylesheets(root).map(s=>s.file));
 for(const file of fs.readdirSync(path.join(root,'styles'),{recursive:true}).filter(f=>f.endsWith('.css'))){
  assert.ok(linked.has('styles/'+file.split(path.sep).join('/')),'Module CSS absent de index.html : '+file);
 }
});

test('CSS : la compilation conserve l’ordre de l’entrée web et le contenu exact',()=>fixture(root=>{
 const sheets=readStylesheets(root,link('./styles/cards.css')+link('./styles.css'));
 assert.deepEqual(sheets.map(s=>[s.file,s.css]),[
  ['styles/cards.css','.card{color:red}'],['styles.css',':root{--test:1}']
 ]);
}));
test('CSS : une dépendance absente ou reliée deux fois interrompt le build',()=>fixture(root=>{
 assert.throws(()=>readStylesheets(root,link('./missing.css')),/ENOENT/);
 assert.throws(()=>readStylesheets(root,link('./styles.css').repeat(2)),/deux fois/);
}));
test('CSS : les feuilles externes ou hors du projet sont refusées',()=>fixture(root=>{
 for(const href of ['https://example.com/style.css','./../styles.css','./styles.css?version=1']){
  assert.throws(()=>readStylesheets(root,link(href)),/locale non reconnue/);
 }
}));
test('CSS : les dépendances cachées et fins de style HTML sont refusées',()=>fixture(root=>{
 for(const css of ['@import "cards.css";','a::before{content:"</style>"}']){
  fs.writeFileSync(path.join(root,'styles.css'),css);
  assert.throws(()=>readStylesheets(root,link('./styles.css')),/dépendance CSS|Fin de style/);
 }
}));

test('Le filet intérieur et les six couleurs de rareté restent communs à toutes les vues',()=>{
 const root=fileURLToPath(new URL('../',import.meta.url));
 const drawn=fs.readFileSync(path.join(root,'assets/generated-card.css'),'utf8');
 assert.ok(drawn.includes('.generated-face{outline:4px solid var(--rarity-border,#c9ae7c);outline-offset:-4px}'));
 const collection=fs.readFileSync(path.join(root,'assets/collection.css'),'utf8');
 const rarity=fs.readFileSync(path.join(root,'styles/cards/rarity.css'),'utf8');
 for(const [rank,color] of Object.entries({
  commun:'#c8d8df',rare:'#69dbf9','épique':'#d4a2ff','légendaire':'#ffd46b',
  divine:'#f06a5f','éveillée':'#fff09a'
 })){
  assert.ok(collection.includes(`[data-rarity=${rank}],.collection-hover-inspection [data-rarity=${rank}]{--collection-rarity:${color};--rarity-border:${color}}`),rank);
  assert.ok(rarity.includes(`--rarity-border:${color}`) || rarity.includes(`--rarity-border: ${color}`),rank);
 }
});
