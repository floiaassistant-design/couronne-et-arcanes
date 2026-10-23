// Préparer le même jeu pour un hébergement statique, sans second catalogue.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const root=fileURLToPath(new URL('../',import.meta.url));
const output=path.join(root,'dist');
const offline=path.join(root,'JOUER.html');
const committed=fs.readFileSync(offline);

// Réutiliser les contrôles de provenance et la compilation du jeu existant.
execFileSync(process.execPath,[path.join(root,'scripts/build_standalone.mjs')],{
 cwd:root,stdio:'inherit'
});
if(!committed.equals(fs.readFileSync(offline))){
 throw Error('JOUER.html doit être régénéré et enregistré dans la PR avant publication.');
}

fs.rmSync(output,{recursive:true,force:true});
fs.mkdirSync(output,{recursive:true});
for(const entry of ['index.html','styles.css','src','styles','assets','JOUER.html']){
 fs.cpSync(path.join(root,entry),path.join(output,entry),{
  recursive:true,
  filter:source=>!['.md','.json'].includes(path.extname(source))
 });
}

console.log('dist/ prêt : même entrée web, modules et images ; JOUER.html téléchargeable.');
