import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const bg=readFileSync(new URL('../assets/backgrounds/arena-celeste.webp',import.meta.url));
const css=readFileSync(new URL('../styles.css',import.meta.url),'utf8');
const html=readFileSync(new URL('../JOUER.html',import.meta.url),'utf8');

test('arène céleste : WebP optimisé et empreinte stable',()=>{
 assert.equal(bg.subarray(0,4).toString(),'RIFF');
 assert.equal(bg.subarray(8,12).toString(),'WEBP');
 assert.equal(bg.length,184398);
 assert.equal(createHash('sha256').update(bg).digest('hex'),'7915dc75d438fe371f5b9e6e00d9fbcc33d44a171cab90d7b7503dfdf32f09d1');
 assert.match(css,/backgrounds\/arena-celeste\.webp/);
});
test('export autonome : fond embarqué, aucune dépendance réseau',()=>{
 assert.ok(html.includes('data:image/webp;base64,'+bg.toString('base64')));
 assert.ok(!html.includes('url("./assets/backgrounds/arena-celeste.webp")'));
 assert.ok(html.includes('aria-label="Plateau de combat'));
});
