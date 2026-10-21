import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

function webpSize(b){
 if(b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WEBP')throw Error('Format WebP invalide');
 const kind=b.toString('ascii',12,16);
 if(kind==='VP8 ')return [b.readUInt16LE(26)&16383,b.readUInt16LE(28)&16383];
 if(kind==='VP8X')return [1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)];
 if(kind==='VP8L'){const n=b.readUInt32LE(21);return [(n&16383)+1,((n>>>14)&16383)+1];}
 throw Error('Dimensions WebP inconnues');
}
export function readArtwork(root,{portraits,cards,templates}){
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/artwork.json'),'utf8'));
 if(manifest.schemaVersion!==1||!Array.isArray(manifest.assets))throw Error('Registre graphique invalide');
 const seen=new Set(),groups={creatures:[],cards:[]};
 for(const a of manifest.assets){
  if(a.status!=='approved'||!a.approvedBy||!a.license||!a.approvalRef||!a.sourceRepo||!a.sourceCommit)throw Error('Approbation/provenance manquante');
  const group=a.kind==='card'?'cards':'creatures',names=group==='cards'?cards:portraits;
  if(!/^[a-z0-9_-]+$/.test(a.key)||!names.includes(a.key)||seen.has(a.key)||a.target!==`assets/${group}/${a.key}.webp`)throw Error('Clé graphique invalide');
  if(group==='cards'&&(!a.provenance||a.sourceRepo!=='floiaassistant-design/couronne-et-arcanes-art'||!/^[0-9a-f]{40}$/.test(a.sourceCommit)||templates[a.cardId]!==a.key))throw Error('Contrat de carte complète invalide');
  seen.add(a.key);groups[group].push(a);
 }
 for(const [group,names] of [['creatures',portraits],['cards',cards]]){
  const dir=path.join(root,'assets',group),files=fs.existsSync(dir)?fs.readdirSync(dir).filter(n=>n.endsWith('.webp')):[];
  if(files.length!==groups[group].length||names.length!==groups[group].length||files.some(f=>!groups[group].some(a=>f===a.key+'.webp')))throw Error('Illustration non cataloguée');
 }
 if(Object.values(templates).some(key=>!groups.cards.some(a=>a.key===key)))throw Error('Carte complète non cataloguée');
 const art={},cardArt={};
 for(const a of manifest.assets){
  const receiptPath=path.resolve(root,a.approvalRef);
  if(!receiptPath.startsWith(root+path.sep))throw Error('Reçu hors du projet');
  const receipt=JSON.parse(fs.readFileSync(receiptPath,'utf8'));
  if(!receipt.assets?.some(x=>x.sha256===a.sha256&&x.version===a.version&&(a.kind!=='card'||x.key===a.key&&x.cardId===a.cardId)))throw Error('Reçu de version incorrect');
  const bytes=fs.readFileSync(path.join(root,a.target));
  if(bytes.length!==a.bytes||createHash('sha256').update(bytes).digest('hex')!==a.sha256)throw Error('Empreinte graphique incorrecte');
  if(a.kind==='card'){
   const [width,height]=webpSize(bytes);
   if(width!==a.width||height!==a.height||width/height!==2/3)throw Error('Dimensions de carte complète incorrectes');
  }
  (a.kind==='card'?cardArt:art)[a.key]='data:image/webp;base64,'+bytes.toString('base64');
 }
 return {art,cardArt};
}
