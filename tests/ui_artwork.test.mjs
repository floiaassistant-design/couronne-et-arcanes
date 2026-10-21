import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {readUIArtwork} from '../scripts/lib/ui-artwork.mjs';

function fixture(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'ca-ui-art-'));
 fs.mkdirSync(path.join(root,'assets/backgrounds'),{recursive:true});
 fs.mkdirSync(path.join(root,'docs/approvals'),{recursive:true});
 const bytes=Buffer.from([255,216,1,2,3,255,217]),sha256=createHash('sha256').update(bytes).digest('hex');
 const asset={key:'test_ui',kind:'background',version:'v01',status:'approved',approvedBy:'Propriétaire',license:'Création originale',sourceRepo:'floiaassistant-design/couronne-et-arcanes-art',sourceCommit:'a'.repeat(40),target:'assets/backgrounds/test-ui.css',approvalRef:'docs/approvals/test-ui.json',bytes:bytes.length,sha256};
 fs.writeFileSync(path.join(root,asset.target),`[data-background="test_ui"]{background:url("data:image/jpeg;base64,${bytes.toString('base64')}")}`);
 const receipt={assets:[{key:asset.key,version:asset.version,sha256}]};
 fs.writeFileSync(path.join(root,asset.approvalRef),JSON.stringify(receipt));
 fs.writeFileSync(path.join(root,'assets/ui-artwork.json'),JSON.stringify({schemaVersion:1,assets:[asset]}));
 return {root,asset,receipt,cleanup:()=>fs.rmSync(root,{recursive:true,force:true})};
}

test('Le fond UI exige clé, source épinglée et reçu correspondant aux octets embarqués',()=>{
 const f=fixture();try{assert.match(readUIArtwork(f.root,['test_ui'])[f.asset.target],/data:image\/jpeg;base64/);assert.throws(()=>readUIArtwork(f.root,[]),/Clé\/chemin/);}finally{f.cleanup();}
});
test('Une image UI altérée ou une version non approuvée bloque le builder',()=>{
 const f=fixture();try{
  f.receipt.assets[0].version='v02';fs.writeFileSync(path.join(f.root,f.asset.approvalRef),JSON.stringify(f.receipt));
  assert.throws(()=>readUIArtwork(f.root,['test_ui']),/Reçu de version/);
  f.receipt.assets[0].version='v01';fs.writeFileSync(path.join(f.root,f.asset.approvalRef),JSON.stringify(f.receipt));
  fs.writeFileSync(path.join(f.root,f.asset.target),'x{background:url("data:image/jpeg;base64,eA==")}');
  assert.throws(()=>readUIArtwork(f.root,['test_ui']),/Empreinte/);
 }finally{f.cleanup();}
});
