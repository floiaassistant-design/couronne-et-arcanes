import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {CAMPAIGN,CLASSES,towerMission} from '../../src/data.js';
import {CAMPAIGN_HERO_ART_IDS,TOWER_HERO_ART_IDS} from '../../src/ui/painted-arena.js';

function validateHeroWebP(encoded,expected,width,height,id){
 const bytes=Buffer.from(encoded,'base64');
 if(bytes.length<30||bytes.toString('ascii',8,16)!=='WEBPVP8X'||!(bytes[20]&0x10)||
    bytes.readUIntLE(24,3)+1!==width||bytes.readUIntLE(27,3)+1!==height||
    bytes.length!==expected.bytes||createHash('sha256').update(bytes).digest('hex')!==expected.sha256){
  throw Error('Format ou empreinte du visuel de héros invalide : '+id);
 }
}

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
  validateHeroWebP(images.get(id),registered.get(id),atlas.frameWidth*atlas.frames,atlas.frameHeight,id);
 }
}

export function validateEnemyHeroArtwork(root,sheets){
 const receipt=JSON.parse(readFileSync(path.join(root,'docs/approvals/heros-adverses-v01.json'),'utf8'));
 const tower=JSON.parse(readFileSync(path.join(root,'docs/approvals/gardiens-tour-v01.json'),'utf8'));
 const sheet=sheets.find(({file})=>file===receipt.stylesheet);
 const hash=/^[0-9a-f]{64}$/;
 if(!sheet||receipt.schemaVersion!==1||!receipt.importApproval||!receipt.provenance||
    !receipt.rights||!receipt.sourceArchive?.libraryFile||!hash.test(receipt.sourceArchive.sha256)||
    !Array.isArray(receipt.assets)||tower.schemaVersion!==1||!tower.provenance||!tower.rights||
    !/^[a-f0-9]{40}$/.test(tower.sourceCommit)||!Array.isArray(tower.assets)){
  throw Error('Feuille, reçu ou provenance des héros adverses manquants');
 }
 const rules=[...sheet.css.matchAll(/\.arena-hero-actor\[data-enemy-hero="(T?\d{2})"\]\{background-image:url\("data:image\/webp;base64,([A-Za-z0-9+/=]+)"\)\}/g)];
 const images=new Map(rules.map(([,id,encoded])=>[id,encoded]));
 const campaign=new Map(receipt.assets.map(asset=>[asset.missionId,asset]));
 const guardians=new Map(tower.assets.map(asset=>[asset.missionId,asset]));
 const count=CAMPAIGN_HERO_ART_IDS.length+TOWER_HERO_ART_IDS.length;
 if(rules.length!==count||images.size!==count||[...sheet.css.matchAll(/url\(/g)].length!==count||
    receipt.assets.length!==CAMPAIGN_HERO_ART_IDS.length||tower.assets.length!==TOWER_HERO_ART_IDS.length){
  throw Error('Correspondance des héros adverses invalide');
 }
 for(const id of [...CAMPAIGN_HERO_ART_IDS,...TOWER_HERO_ART_IDS]){
  const isTower=TOWER_HERO_ART_IDS.includes(id);
  const asset=isTower?guardians.get(id):campaign.get(id);
  const mission=isTower?towerMission(Number(id.slice(1))):CAMPAIGN.find(m=>m.id===id);
  if(!images.has(id)||!asset||!mission||mission.enemy!==asset.name||
     (isTower?!mission.boss||asset.version!=='01':!asset.prompt)||!hash.test(asset.source?.sha256)||
     asset.export?.width!==152||asset.export.height!==183){
   throw Error('Visuel adverse absent ou mal associé : '+id);
  }
  validateHeroWebP(images.get(id),asset.export,152,183,id);
 }
}
