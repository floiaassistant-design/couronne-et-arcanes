import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {readArtwork} from '../scripts/lib/artwork.mjs';
import {ART_NAMES,CARD_ART_NAMES,CARD_TEMPLATES,cardTemplateFor} from '../src/visuals.js';
import {CARDS} from '../src/data.js';
import {generatedCardFace} from '../src/ui/generated-card.js';
const names={portraits:ART_NAMES,cards:CARD_ART_NAMES,templates:CARD_TEMPLATES};
function fixture(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'ca-complete-card-'));
 for(const file of ['assets/artwork.json','assets/cards/milicien_aube_carte_v02.webp','docs/approvals/milicien-aube-carte-v02.json']){
  fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});fs.copyFileSync(file,path.join(root,file));
 }
 return {root,registry:JSON.parse(fs.readFileSync(path.join(root,'assets/artwork.json'))),cleanup:()=>fs.rmSync(root,{recursive:true,force:true})};
}
test('La carte complète est épinglée à ses octets approuvés et reste limitée au Milicien',()=>{
 const f=fixture();try{
  const r=readArtwork(f.root,names);assert.deepEqual(r.art,{});
  assert.match(r.cardArt.milicien_aube_carte_v02,/^data:image\/webp;base64,/);
  for(const card of Object.values(CARDS))assert.equal(cardTemplateFor(card),card.id==='militia'?'milicien_aube_carte_v02':null);
 }finally{f.cleanup();}
});
test('Une carte altérée, une autre version ou un fichier hors registre bloque le build',()=>{
 const f=fixture();try{
  const target=path.join(f.root,f.registry.assets[0].target),bytes=fs.readFileSync(target);
  fs.writeFileSync(target,Buffer.from('corrupted'));assert.throws(()=>readArtwork(f.root,names),/Empreinte/);fs.writeFileSync(target,bytes);
  f.registry.assets[0].version='03';fs.writeFileSync(path.join(f.root,'assets/artwork.json'),JSON.stringify(f.registry));assert.throws(()=>readArtwork(f.root,names),/Reçu de version/);
  f.registry.assets[0].version='02';fs.writeFileSync(path.join(f.root,'assets/artwork.json'),JSON.stringify(f.registry));
  fs.writeFileSync(path.join(f.root,'assets/cards/unknown.webp'),bytes);assert.throws(()=>readArtwork(f.root,names),/Illustration non cataloguée/);
 }finally{f.cleanup();}
});
test('Le nouveau contrat refuse le statut review et des dimensions incohérentes',()=>{
 const f=fixture();try{
  f.registry.assets[0].status='review';fs.writeFileSync(path.join(f.root,'assets/artwork.json'),JSON.stringify(f.registry));assert.throws(()=>readArtwork(f.root,names),/Approbation/);
  f.registry.assets[0].status='approved';f.registry.assets[0].width=1024;fs.writeFileSync(path.join(f.root,'assets/artwork.json'),JSON.stringify(f.registry));assert.throws(()=>readArtwork(f.root,names),/Dimensions/);
 }finally{f.cleanup();}
});
test('Le cadre dessiné reçoit des valeurs actuelles sans calcul ni mutation et échappe les textes',()=>{
 const card={...CARDS.militia,name:'<script>',description:'<img>'},stats={atk:4,hp:2,maxhp:9},before=JSON.stringify({card,stats});
 const html=generatedCardFace(card,{stats,delay:3,kind:'remaining',esc:s=>s.replaceAll('<','&lt;')});
 assert.match(html,/data-delay-kind="remaining"[^]*?<b>3<\/b>/);assert.match(html,/stat atk[^]*?<b>4<\/b>/);assert.match(html,/stat hp[^]*?<b>2<\/b>/);
 assert.match(html,/&lt;script>/);assert.match(html,/&lt;img>/);assert.doesNotMatch(html,/<script>|<img>/);
 assert.equal(JSON.stringify({card,stats}),before);
});
