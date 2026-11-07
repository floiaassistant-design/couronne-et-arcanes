import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {CLASSES} from '../../src/data.js';

export function validateHeroArtwork(root,sheets){
 const receipt=JSON.parse(readFileSync(path.join(root,'docs/approvals/heros-couronne-v01.json'),'utf8'));
 const {atlas,assets}=receipt;
 const sheet=sheets.find(({file})=>file===receipt.stylesheet);
 if(!sheet||receipt.schemaVersion!==1||receipt.status!=='approved'||!receipt.approval||
    !receipt.license||!receipt.source?.libraryFile||!receipt.sourceArchive||
    !/^[0-9a-f]{64}$/.test(receipt.source?.sha256)||
    atlas?.frameWidth!==152||atlas.frameHeight!==183||atlas.frames!==16||
    !Array.isArray(assets)){
  throw Error('Feuille, reçu ou provenance des héros manquants');
 }
 const rules=[...sheet.css.matchAll(/\.arena-hero-actor\[data-hero-class="([a-z]+)"\]\{background-image:url\("data:image\/webp;base64,([A-Za-z0-9+/=]+)"\)\}/g)];
 const classes=Object.keys(CLASSES);
 const images=new Map(rules.map(([,id,encoded])=>[id,encoded]));
 const registered=new Map(assets.map(asset=>[asset.id,asset]));
 if(rules.length!==classes.length||images.size!==classes.length||assets.length!==classes.length||
    [...sheet.css.matchAll(/url\(/g)].length!==classes.length){
  throw Error('Correspondance des atlas de héros invalide');
 }
 for(const id of classes){
  if(!images.has(id)||!registered.has(id))throw Error('Atlas de héros absent : '+id);
  const bytes=Buffer.from(images.get(id),'base64');
  const expected=registered.get(id);
  const header=bytes.toString('ascii',8,16);
  if(bytes.length<30||header!=='WEBPVP8X'||!(bytes[20]&0x10)||
     bytes.readUIntLE(24,3)+1!==atlas.frameWidth*atlas.frames||
     bytes.readUIntLE(27,3)+1!==atlas.frameHeight||
     bytes.length!==expected.bytes||createHash('sha256').update(bytes).digest('hex')!==expected.sha256){
   throw Error('Format ou empreinte de l’atlas de héros invalide : '+id);
  }
 }
}
