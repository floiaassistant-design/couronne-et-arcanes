import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {CARDS} from '../src/data.js';
import {visualFor,ART_NAMES} from '../src/visuals.js';
import {arenaSprite} from '../src/ui/arena-art.js';

const read=p=>readFileSync(new URL('../'+p,import.meta.url));
const json=p=>JSON.parse(read(p));
const sha=b=>createHash('sha256').update(b).digest('hex');
const manifest=json('assets/creatures/portraits-aube.json');
const baseline=json('tests/fixtures/portraits_main_pr16.json');
const changed=new Map(manifest.assets.map(a=>[a.gameCardId,a.key]));

test('Lot Aube : cinq versions approuvées, empreintes et reçus concordants',()=>{
 assert.equal(manifest.sourceCommit,'a6dd52096ada21d5eaf07234c632ada05cf710df');
 assert.equal(manifest.assets.length,5);
 assert.deepEqual(Object.fromEntries(changed),{
  militia:'milicien_aube',shield:'porte_egide',cleric:'soeur_aurore',
  paladin:'paladin_solaire',banner:'porte_etendard'
 });
 for(const a of manifest.assets){
  const bytes=read(a.target),receipt=json(a.approvalRef);
  const approval=receipt.assets.find(v=>v.export===a.source);
  assert.equal(a.status,'approved');assert.equal(a.license,'original');
  assert.equal(approval.version,a.version);assert.equal(approval.sha256,a.sha256);
  assert.equal(receipt.evidence.type,'explicit-user-message');
  assert.equal(bytes.length,a.bytes);assert.equal(sha(bytes),a.sha256);
  assert.equal(bytes.subarray(0,4).toString(),'RIFF');
  assert.equal(bytes.subarray(8,12).toString(),'WEBP');
  assert.ok(ART_NAMES.includes(a.key));
 }
 assert.equal(manifest.assets.find(a=>a.gameCardId==='militia').version,2);
 assert.equal(manifest.assets.find(a=>a.gameCardId==='banner').version,2);
});

test('Lot Aube : autres portraits et toutes les unités de combat préservés',()=>{
 assert.equal(Object.keys(CARDS).length,Object.keys(baseline).length);
 for(const card of Object.values(CARDS)){
  const visual=visualFor(card),previous=baseline[card.id];
  assert.equal(visual.art,changed.get(card.id)||previous.art,card.id);
  assert.equal(visual.role,previous.role,card.id+' rôle');
  assert.equal(sha(arenaSprite(card,visual.role)),previous.spriteSha256,card.id+' unité');
 }
 assert.equal(visualFor(CARDS.skill_ranger_pierce).art,'archer');
});

test('Lot Aube : cinq portraits embarqués exactement dans le jeu autonome',()=>{
 const html=read('JOUER.html').toString('utf8');
 for(const a of manifest.assets){
  assert.ok(html.includes('data:image/webp;base64,'+read(a.target).toString('base64')),a.key);
 }
 assert.ok(!html.includes('window.profile'), 'Pas de diagnostic dans la distribution');
});
