import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

// Les fonds UI sont indépendants du registre des portraits WebP.
export function readUIArtwork(root,names){
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/ui-artwork.json'),'utf8'));
 if(manifest.schemaVersion!==1||!Array.isArray(manifest.assets))throw Error('Registre UI invalide');
 const css={},keys=new Set();
 for(const a of manifest.assets){
  if(a.kind!=='background'||a.status!=='approved'||!a.approvedBy||!a.license||
   a.sourceRepo!=='floiaassistant-design/couronne-et-arcanes-art'||!/^[0-9a-f]{40}$/.test(a.sourceCommit||''))throw Error('Approbation/provenance UI manquante');
  if(!names.includes(a.key)||keys.has(a.key)||!/^[a-z0-9_-]+$/.test(a.key)||
   !/^assets\/backgrounds\/[a-z0-9-]+\.css$/.test(a.target)||css[a.target])throw Error('Clé/chemin UI invalide');
  if(!/^docs\/approvals\/[a-z0-9-]+\.json$/.test(a.approvalRef||''))throw Error('Reçu UI invalide');
  const receipt=JSON.parse(fs.readFileSync(path.join(root,a.approvalRef),'utf8'));
  if(!receipt.assets?.some(r=>r.key===a.key&&r.version===a.version&&r.sha256===a.sha256))throw Error('Reçu de version UI incorrect');
  const source=fs.readFileSync(path.join(root,a.target),'utf8');
  const urls=[...source.matchAll(/url\(([^)]+)\)/g)];
  const image=urls.length===1&&urls[0][1].match(/^['"]?data:image\/jpeg;base64,([A-Za-z0-9+/=]+)['"]?$/);
  if(!image)throw Error('Fond UI non autonome');
  const bytes=Buffer.from(image[1],'base64');
  if(bytes.length!==a.bytes||createHash('sha256').update(bytes).digest('hex')!==a.sha256)throw Error('Empreinte du fond UI incorrecte');
  keys.add(a.key);css[a.target]=source;
 }
 if(keys.size!==names.length)throw Error('Fond UI non catalogué');
 return css;
}
