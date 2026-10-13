import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {createViews} from '../src/ui/views.js';
import {freshProfile,createBattle} from '../src/engine.js';
import {CAMPAIGN} from '../src/data.js';

const css=readFileSync(new URL('../assets/backgrounds/arena-celeste-calibree.css',import.meta.url),'utf8');
const markup=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
const index=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const source=readFileSync(new URL('../scripts/build_standalone.mjs',import.meta.url),'utf8');
test('illustration approuvée 912×620 ; signature WebP et empreinte inchangées',()=>{
 const encoded=css.match(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/)?.[1];
 assert.ok(encoded,'WebP intégré dans la feuille du décor');
 const buffer=Buffer.from(encoded,'base64');
 assert.equal(buffer.length,53314);
 assert.equal(buffer.subarray(0,4).toString('ascii'),'RIFF');
 assert.equal(buffer.subarray(8,12).toString('ascii'),'WEBP');
 assert.equal(createHash('sha256').update(buffer).digest('hex'),'29d2d80fdb65493c408cc3d5af174c00fc25dfa49971398a4add1909a9a5464c');
});
test('le sol est calé 912 px avec quatre rangées 116px, sans recadrage cover',()=>{
 assert.match(markup,/width:912px;height:620px/);
 assert.match(markup,/height:118px;min-height:118px/);
 assert.match(markup,/height:116px;min-height:116px;max-height:116px/);
 assert.match(markup,/grid-template-columns:24px 44px repeat\(10,minmax\(0,1fr\)\) 44px/);
 assert.match(markup,/pointer-events:none;user-select:none/);
 assert.doesNotMatch(markup.slice(markup.indexOf('/* Arène céleste calibrée')),/background-size:\s*cover/);
});
test('jeu modulaire et export embarquent la même illustration sans requête distante',()=>{
 assert.match(index,/assets\/backgrounds\/arena-celeste-calibree\.css/);
 assert.match(source,/const arenaArtCss=read\('assets\/backgrounds\/arena-celeste-calibree\.css'\)/);
 assert.match(source,/\+arenaArtCss\+/);
});
for(const lanes of [2,3,4]){
 test('une seule illustration et '+lanes+' vraies lignes jouables',()=>{
  const profile=freshProfile(),battle=createBattle(profile,{...CAMPAIGN[0],boss:lanes===4,difficulty:lanes===3?3:1},213);
  const html=createViews(()=>({profile,battle,screen:'battle',selectedCard:-1,collectionFilter:'all',collectionOwned:false,animationsEnabled:false})).battleUI();
  assert.equal((html.match(/class="arena-calibrated-art"/g)||[]).length,1);
  assert.equal((html.match(/class="battle-cell /g)||[]).length,10*lanes);
  assert.equal((html.match(/class="arena-dormant-cell"/g)||[]).length,10*(4-lanes));
 });
}
