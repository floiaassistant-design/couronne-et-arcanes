import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {CARDS} from '../src/data.js';
import {visualFor} from '../src/visuals.js';
test('nouveau portrait seulement pour archer',()=>{
 assert.equal(visualFor(CARDS.archer).art,'arbaletriere_aube');
 assert.equal(visualFor(CARDS.skill_ranger_pierce).art,'archer');
 const bytes=readFileSync(new URL('../assets/creatures/arbaletriere_aube.webp',import.meta.url));
 assert.equal(bytes.length,134904);
 assert.equal(createHash('sha256').update(bytes).digest('hex'),'31186adc9ea55c4d34777f70f8b5fe2969a1ea0386a74d1cf44183e931c391a3');
});
test('compteur unique et fiche indépendante des gestes de pose',()=>{
 const v=readFileSync(new URL('../src/ui/views.js',import.meta.url),'utf8');
 const a=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 const b=readFileSync(new URL('../src/ui/battle-view.js',import.meta.url),'utf8');
 assert.match(v,/data-delay-kind/);assert.match(v,/inHand\?cooldown:c\.delay/);
 assert.match(v,/Portée 2/);assert.match(v,/data-action="inspect-card"/);
 assert.match(a,/case 'inspect-card':inspectCard\(index,true\)/);
 assert.match(a,/!event\.target\.closest\('button'\)/);
 assert.match(b,/id="hand-card-inspection"/);
});
