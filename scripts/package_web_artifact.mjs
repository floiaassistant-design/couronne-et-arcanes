// Reçu et archive utilisés par la publication Sites ; aucune règle de jeu.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const root=fileURLToPath(new URL('../',import.meta.url));
const [commit,tree]=process.argv.slice(2);
if(![commit,tree].every(v=>/^[a-f0-9]{40}$/.test(v||''))){
 throw Error('Fournir le commit source et son arbre Git exacts.');
}
const digest=data=>createHash('sha256').update(data).digest('hex');
const files=fs.readdirSync(path.join(root,'dist'),{recursive:true})
 .filter(name=>fs.statSync(path.join(root,'dist',name)).isFile()).sort();
const manifest=files.map(name=>name.split(path.sep).join('/')+'\0'+
 digest(fs.readFileSync(path.join(root,'dist',name)))).join('\n');
const receipt={repository:'floiaassistant-design/couronne-et-arcanes',
 source_commit:commit,source_tree:tree,
 offline_sha256:digest(fs.readFileSync(path.join(root,'dist/JOUER.html'))),
 web_sha256:digest(manifest)};
fs.mkdirSync(path.join(root,'.openai'),{recursive:true});
fs.writeFileSync(path.join(root,'.openai/canonical-build.json'),JSON.stringify(receipt,null,2)+'\n');
const archive=path.join(os.tmpdir(),'couronnes-web.tar.gz');
execFileSync('tar',['-czf',archive,'dist','.openai/canonical-build.json'],{cwd:root});
console.log(JSON.stringify({archive,...receipt}));
