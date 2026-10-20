import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {createStudy,resolveStudy,studySteps,validStudy,STUDY_KEY,STUDY_PRESETS} from '../src/experiments/card-study-model.js';
import {endPlayerTurn} from '../src/engine/battle.js';

const health=b=>[b.board.map(row=>row.map(u=>u?[u.uid,u.hp]:null)),...['p','e'].map(s=>b.heroes[s].hp)];
for(const preset of Object.keys(STUDY_PRESETS))test(`Essai ${preset} : événements et PV identiques au vrai moteur jusqu’à la fin`,()=>{
 const b=createStudy(preset);let turns=0,heals=0,arrows=0,armored=0;
 while(b.status==='active'&&turns++<36){
  const reference=structuredClone(b);endPlayerTurn(reference);
  const result=resolveStudy(b);assert.deepEqual(b,reference);assert.ok(!('vfx' in b));
  const steps=studySteps(result);if(steps.length)assert.deepEqual(health(steps.at(-1).frame),health(b));
  for(const {event:e} of steps){heals+=e.type==='heal';arrows+=!!e.ranged;armored+=e.type==='attack'&&e.actual<e.damage;}
 }
 assert.notEqual(b.status,'active');assert.ok(turns<=35);assert.ok(arrows);assert.ok(armored);
 if(preset==='balanced')assert.ok(heals);
});
test('Essai : les dégâts affichés sont les PV perdus après armure et les soins réels',()=>{
 const steps=studySteps(resolveStudy(createStudy()));
 const hit=steps.find(({event:e})=>e.type==='attack'&&e.cardId==='paladin'&&!e.riposte).event;
 assert.equal(hit.damage,4);assert.equal(hit.actual,2);
 assert.equal(steps.find(({event:e})=>e.type==='heal').event.actual,2);
});
test('Essai : sauvegarde dédiée, aucune donnée transitoire ni profil réel',()=>{
 assert.notEqual(STUDY_KEY,'couronnes_arcanes_v1');assert.notEqual(STUDY_KEY,'couronnes_arcanes_bataille_v1');
 const b=createStudy('assault');resolveStudy(b);const restored=JSON.parse(JSON.stringify(b));
 assert.ok(validStudy(restored));assert.equal(restored.studyPreset,'assault');assert.ok(!('vfx' in restored));
 assert.ok(!validStudy({}));assert.ok(!validStudy({...b,missionId:'01'}));assert.ok(!validStudy({...b,heroes:{}}));
});
test('Essai : versions, droits et empreintes des portraits approuvés',()=>{
 const m=JSON.parse(fs.readFileSync('experiments/card-duel/portraits.json'));
 assert.equal(m.sourceCommit,'a6dd52096ada21d5eaf07234c632ada05cf710df');assert.equal(m.assets.length,5);
 for(const a of m.assets){
  assert.equal(a.status,'approved');assert.equal(a.license,'original');
  const receipt=JSON.parse(fs.readFileSync('experiments/card-duel/approvals/'+a.approvalRef.split('/').at(-1)));
  assert.ok(receipt.assets.some(x=>x.id===a.id&&x.version===a.version&&x.sha256===a.sha256));
  const bytes=fs.readFileSync('experiments/card-duel/portraits/'+a.target.split('/').at(-1));
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),a.sha256);
 }
});
