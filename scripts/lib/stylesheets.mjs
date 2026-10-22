import fs from 'node:fs';
import path from 'node:path';

// L'ordre des liens de l'entrée web est aussi l'ordre de la cascade hors ligne.
export function readStylesheets(root,html=fs.readFileSync(path.join(root,'index.html'),'utf8')){
 const seen=new Set();
 return [...html.matchAll(/<link\b[^>]*>/g)].filter(([tag])=>/\brel="stylesheet"/.test(tag)).map(([tag])=>{
  const file=tag.match(/\bhref="\.\/([^"]+)"/)?.[1];
  if(!file||!file.endsWith('.css')||file.split('/').some(part=>!part||part==='.'||part==='..')||/[\\:?#]/.test(file)){
   throw Error('Feuille CSS locale non reconnue : '+tag);
  }
  if(seen.has(file))throw Error('Feuille CSS reliée deux fois : '+file);
  seen.add(file);
  const css=fs.readFileSync(path.join(root,file),'utf8');
  if(/@import\b/i.test(css))throw Error('Relier la dépendance CSS dans index.html : '+file);
  if(/<\/style\b/i.test(css))throw Error('Fin de style HTML dans la feuille CSS : '+file);
  return {file,tag,css};
 });
}
