import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {PAINTED_ARENA,paintedTile,paintedArena,paintedFootPoint} from '../src/ui/painted-arena.js';

test('arène peinte : ressource approuvée originale et encodage autonome identifiés',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../assets/backgrounds/arena-celeste-peinte.json',import.meta.url)));
 const css=readFileSync(new URL('../assets/backgrounds/arena-celeste-peinte.css',import.meta.url),'utf8');
 const bytes=Buffer.from(css.match(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/)[1],'base64');
 assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.webp_sha256);
 assert.equal(bytes.length,manifest.webp_bytes);
 assert.equal(manifest.source_sha256,'c7f14410e255880bf3e6a06d9b00dee93783350786509162f496ab24ed8fb754');
 assert.equal(manifest.width,1672);assert.equal(manifest.height,941);assert.equal(manifest.encoding.resize,false);
 assert.equal(manifest.approval.selected,'première image');
 const html=readFileSync(new URL('../JOUER.html',import.meta.url),'utf8');
 assert.ok(html.includes(css.trim()));
 assert.doesNotMatch(html,/<link[^>]+arena-(?:celeste-peinte|peinte-layout)/);
});
test('arène peinte : quarante zones de placement et pieds dans leurs dalles',()=>{
 for(let row=0;row<4;row++)for(let col=1;col<=10;col++){
  const tile=paintedTile(row,col);
  assert.ok(tile.footX>tile.left&&tile.footX<tile.left+tile.width);
  assert.ok(tile.footY>tile.top&&tile.footY<tile.top+tile.height);
  assert.equal(tile.top,PAINTED_ARENA.rows[row]);
  if(col>1)assert.ok(tile.footX>paintedTile(row,col-1).footX);
 }
 assert.throws(()=>paintedTile(4,1),RangeError);assert.throws(()=>paintedTile(0,11),RangeError);
});
for(const lanes of [2,3,4])test(`arène peinte : projection ${lanes} lignes sans case interactive dormante`,()=>{
 const calls=[];
 const html=paintedArena(lanes,(lane,col,visual)=>{calls.push({lane,col,visual});return '<button data-action="deploy"></button>';});
 assert.equal(calls.length,lanes*10);
 assert.deepEqual([...new Set(calls.map(c=>c.visual))],lanes===2?[1,2]:Array.from({length:lanes},(_,i)=>i));
 assert.deepEqual([...new Set(calls.map(c=>c.lane))],Array.from({length:lanes},(_,i)=>i));
 assert.equal((html.match(/class="arena-dormant-cell"/g)||[]).length,(4-lanes)*10);
 assert.equal((html.match(/class="arena-hero-slot"/g)||[]).length,2);
 assert.match(html,/data-render-mode="static"/);
});
test('arène peinte : ancrage des futures animations suit échelle et défilement',()=>{
 const tile=paintedTile(2,7),scale=.62;
 const el={dataset:{footX:tile.footX,footY:tile.footY},hasAttribute:()=>true,
  closest:()=>({getBoundingClientRect:()=>({left:-180,top:35,width:1672*scale,height:941*scale})})};
 const point=paintedFootPoint(el);
 assert.equal(point.x,-180+tile.footX*scale);assert.equal(point.y,35+tile.footY*scale);
 assert.equal(paintedFootPoint({closest:()=>null}),null);
});
