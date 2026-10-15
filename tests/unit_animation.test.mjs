import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {freshProfile,createBattle,playPlayerCard,endPlayerTurn} from '../src/engine.js';
import {unitSpriteFor,clipFrame,unitAnimationPlan,unitSpriteHTML} from '../src/ui/unit-sprites.js';

const read=p=>readFileSync(new URL('../'+p,import.meta.url));
const manifest=JSON.parse(read('assets/units/arbaletriere_aube/manifest.json'));
const approval=JSON.parse(read(manifest.approvalRef));
test('Arbalétrière : seuls les atlas et la vue statique approuvés sont importés',()=>{
 const entries=[manifest.static,...manifest.clips];let total=0;
 for(const asset of entries){
  const bytes=read(asset.target),receipt=approval.assets.find(a=>a.export===asset.source);
  assert.equal(bytes.length,asset.bytes);total+=bytes.length;
  assert.equal(createHash('sha256').update(bytes).digest('hex'),receipt.sha256);
  assert.equal(asset.sha256,receipt.sha256);assert.equal(receipt.hasAlpha,true);
 }
 assert.ok(total<=manifest.budgetBytes);assert.ok(read('JOUER.html').length<5_100_000);
 assert.equal(approval.evidence.exactMessage,'ok je valide tous');
});
test('Arbalétrière : cadence variable, boucles et arrêt sur la dernière pose',()=>{
 const clips=unitSpriteFor('archer').clips;
 assert.equal(clipFrame(clips.tir,599),2);assert.equal(clipFrame(clips.tir,600),3);
 assert.equal(clipFrame(clips.tir,10000),5);assert.equal(clipFrame(clips.defaite,10000),3);
 assert.equal(clipFrame(clips.marche,660),0);assert.equal(clipFrame(clips.repos,2750),0);
 for(const clip of manifest.clips){assert.deepEqual(clips[clip.id].durations,clip.durations);}
});
test('Arbalétrière : identité portrait/unité indépendante et aucune autre carte remappée',()=>{
 for(const c of Object.values(CARDS))assert.equal(!!unitSpriteFor(c.id),c.id==='archer');
 assert.match(unitSpriteHTML('archer','e'),/facing-left/);
 assert.match(unitSpriteHTML('archer','p'),/unit-static/);
 assert.equal(unitSpriteHTML('militia','p'),'');
 assert.ok(read('JOUER.html').includes(read(manifest.clips[0].target).toString('base64')));
});
test('Les traces publiques gardent les UID même après une mort, sans changer le combat',()=>{
 const p=freshProfile(),b=createBattle(p,{...CAMPAIGN[0],deck:[],hp:80},45);
 b.heroes.p.hand=[{id:'archer',wait:0}];b.vfx=[];
 assert.equal(playPlayerCard(b,0,0).ok,true);
 const archer=b.board[0][1];assert.deepEqual(b.vfx[0].actor,{uid:archer.uid,cardId:'archer',side:'p'});
 b.board[0][1]=null;b.board[0][4]=archer;
 b.board[0][5]={...archer,uid:99,id:'militia',side:'e',hp:1,maxhp:1,atk:1,ranged:false};
 const other=structuredClone(b);delete other.vfx;b.vfx=[];
 endPlayerTurn(b);endPlayerTurn(other);
 const attack=b.vfx.find(e=>e.type==='attack'&&e.actor?.cardId==='archer');
 assert.equal(attack.actor.uid,archer.uid);assert.equal(attack.target.uid,99);
 const death=b.vfx.find(e=>e.type==='death'&&e.actor?.uid===99);assert.equal(death.actor.cardId,'militia');
 const events=b.vfx;delete b.vfx;assert.deepEqual(b,other);
 const frozen=JSON.stringify(events);unitAnimationPlan(events);assert.equal(JSON.stringify(events),frozen);
});
test('La marche précède le tir et le projectile, puis impact et défaite restent ordonnés',()=>{
 const archer={uid:1,cardId:'archer',side:'p'},enemy={uid:2,cardId:'militia',side:'e'};
 const plan=unitAnimationPlan([
  {type:'move',actor:archer,lane:0,from:1,to:2},
  {type:'attack',actor:archer,target:enemy,lane:0,from:2,to:4,damage:2,ranged:true},
  {type:'attack',actor:enemy,target:archer,lane:0,from:4,to:2,damage:9},
  {type:'death',actor:archer,lane:0,col:2}
 ]);
 assert.deepEqual(plan.actions.map(a=>a.clip),['marche','tir','impact','defaite']);
 assert.equal(plan.actions[1].start,660);
 for(let i=1;i<plan.actions.length;i++)assert.ok(plan.actions[i].start>=plan.actions[i-1].start+plan.actions[i-1].duration);
 assert.equal(unitAnimationPlan([{type:'attack',actor:enemy,lane:0,from:1,to:2}]).actions.length,0);
});

test('Le lecteur reste actif jusqu’à la fin de l’impact du carreau',()=>{
 const actor={uid:1,cardId:'archer',side:'p'},sprite=unitSpriteFor('archer');
 const plan=unitAnimationPlan([{type:'attack',actor,lane:0,from:2,to:4,damage:2,ranged:true}]);
 assert.equal(sprite.displaySize,140);
 assert.ok(plan.duration>=sprite.projectile.releaseMs+sprite.projectile.travelMs+sprite.projectile.impactMs);
});
