import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {CARDS} from '../src/data.js';
import {visualFor,CARD_ARENA_ART} from '../src/visuals.js';
import {boardCard,cardArenaEnabled} from '../src/ui/card-arena.js';
test('Vue cartes : mapping opt-in des cinq portraits, archétypes partagés inchangés',()=>{
 assert.equal(cardArenaEnabled(),false);
 assert.equal(visualFor(CARDS.militia).art,'knight');
 assert.equal(visualFor(CARDS.archer,{cards:true}).art,'arbaletriere_aube');
 assert.equal(visualFor(CARDS.skill_ranger_pierce,{cards:true}).art,'archer');
 for(const [id,art] of Object.entries(CARD_ARENA_ART)){
  assert.equal(visualFor(CARDS[id],{cards:true}).art,art);
  assert.equal(visualFor(CARDS[id],{cards:true}).role,visualFor(CARDS[id]).role);
 }
});
test('Vue cartes : seuls les nombres du vrai combattant sont rendus, aucune mutation',()=>{
 const u={id:'militia',uid:42,side:'p',atk:3,hp:2,maxhp:7},before=structuredClone(u);
 const html=boardCard(u,4);
 assert.match(html,/attaque 4, vie 2 sur 7/);assert.match(html,/milicien_aube.webp/);
 assert.deepEqual(u,before);
});
test('Vue cartes : export du même jeu et même plateau, aucune fixture préplacée',()=>{
 const html=fs.readFileSync('ESSAI_CARTES.html','utf8');
 assert.match(html,/<body data-card-combat="true">/);
 assert.match(html,/src\/app.js/);assert.match(html,/paintedArena/);
 assert.match(html,/data-action="deploy"/);assert.match(html,/data-action="end-turn"/);
 assert.doesNotMatch(html,/createStudy|study-cards|STUDY_PRESETS|Object.defineProperties\(window/);
});
test('Vue cartes : versions et empreintes des cinq portraits approuvés',()=>{
 const m=JSON.parse(fs.readFileSync('docs/CARD_ARENA_ASSETS.json'));
 assert.equal(m.sourceCommit,'a6dd52096ada21d5eaf07234c632ada05cf710df');
 for(const a of m.assets){
  const receipt=JSON.parse(fs.readFileSync('docs/art-approvals/'+a.approvalRef.split('/').at(-1)));
  assert.ok(receipt.assets.some(x=>x.id===a.id&&x.version===a.version&&x.sha256===a.sha256));
  assert.equal(a.status,'approved');assert.equal(a.license,'original');
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync(a.target)).digest('hex'),a.sha256);
 }
});
