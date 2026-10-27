import {cardPresentation} from '../src/ui/card-presentation.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CARDS} from '../src/data.js';
import {visualFor} from '../src/visuals.js';
test('ancienne identité graphique retirée, identifiants de jeu conservés',()=>{
 assert.equal(visualFor(CARDS.archer).art,null);
 assert.equal(visualFor(CARDS.skill_ranger_pierce).art,null);
 assert.equal(CARDS.archer.id,'archer');assert.equal(CARDS.skill_ranger_pierce.id,'skill_ranger_pierce');
});
test('compteur unique et fiche indépendante des gestes de pose',()=>{
 const v=readFileSync(new URL('../src/ui/views.js',import.meta.url),'utf8');
 const a=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 const b=readFileSync(new URL('../src/ui/battle-view.js',import.meta.url),'utf8');
 assert.match(v,/data-delay-kind/);assert.match(v,/inHand\s*\?\s*cooldown\s*:\s*c\.delay/);
 assert.match(v,/cardPresentation/);assert.equal(cardPresentation('archer').card.description,'Portée 2');assert.doesNotMatch(v,/data-action="inspect-card"/);
 assert.match(a,/suppressCardInspection\(i\)/);
 assert.doesNotMatch(a,/inspectCard\(i,true\)/);
 assert.match(a,/!event\.target\.closest\('button'\)/);
 assert.match(b,/id="hand-card-inspection"/);
});
