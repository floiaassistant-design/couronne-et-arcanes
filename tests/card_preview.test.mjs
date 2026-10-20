import test from 'node:test';
import assert from 'node:assert/strict';
import {freshProfile,createBattle,playPlayerCard} from '../src/engine.js';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {unitStats} from '../src/engine/unit-stats.js';
import {boardInspectionData,cardInspectionContent,previewPosition} from '../src/ui/card-inspection.js';
const esc=s=>String(s).replace(/</g,'&lt;').replace(/>/g,'&gt;');
test('Aperçu plateau : PV blessés, camp adverse, Concorde et états réels sans mutation',()=>{
 const b=createBattle(freshProfile(),CAMPAIGN[0],4);
 b.heroes.p.hand=[{id:'militia',wait:0},{id:'shield',wait:0}];
 assert.equal(playPlayerCard(b,0,0).ok,true);
 const u=b.board[0][1];b.board[0][2]={...u,id:'shield',uid:999};
 Object.assign(u,{hp:2,maxhp:7,armor:1,barrier:3,poisonTurns:2,rallyUntil:b.round,silenceUntil:b.round});
 const before=JSON.stringify(b),model=boardInspectionData(b,u.uid);
 assert.equal(model.stats.atk,u.atk+2);assert.equal(model.stats.hp,2);assert.equal(model.stats.maxhp,7);
 assert.ok(model.board.statuses.includes('Concorde +1 ATQ'));assert.ok(model.board.statuses.some(s=>s.startsWith('Silence')));
 const html=cardInspectionContent(model.card,model.entry,model.stats,esc,{illustrated:true,board:model.board});
 assert.match(html,/En combat/);assert.match(html,/PV 2\/7/);assert.match(html,/Armure 1/);assert.match(html,/milicien_aube.webp/);
 assert.equal(JSON.stringify(b),before);
 u.side='e';const enemy=boardInspectionData(b,u.uid);
 assert.equal(enemy.stats.atk,u.atk+1);assert.equal(enemy.board.side,'e');
 assert.match(cardInspectionContent(enemy.card,enemy.entry,enemy.stats,esc,{illustrated:true,board:enemy.board}),/Unité adverse/);
 assert.equal(boardInspectionData(b,'missing'),null);
});
test('Le même cadre sert aux unités et sorts de la main avec délai et statistiques d’invocation',()=>{
 const b=createBattle(freshProfile(),CAMPAIGN[0],8),before=JSON.stringify(b);
 const unit=cardInspectionContent(CARDS.archer,{wait:2},unitStats(b,'archer'),esc,{illustrated:true});
 const spell=cardInspectionContent(CARDS.firebolt,{wait:0},null,esc,{illustrated:true});
 for(const html of [unit,spell])assert.match(html,/class="card-preview" data-preview-kind="hand"/);
 assert.match(unit,/À l’invocation/);assert.match(unit,/Attente 2 tours/);assert.match(unit,/arbaletriere_aube.webp/);
 assert.match(spell,/Prête à jouer/);assert.doesNotMatch(spell,/inspection-stats/);
 assert.equal(JSON.stringify(b),before);
});
test('Cadre : échappement du texte et placement dans les quatre bords du viewport',()=>{
 const html=cardInspectionContent({...CARDS.archer,name:'<script>'},{wait:1},null,esc,{illustrated:true});
 assert.doesNotMatch(html,/<script>/);assert.match(html,/&lt;script&gt;/);
 for(const viewport of [{width:1366,height:900},{width:390,height:844},{width:844,height:390}])for(const kind of ['hand','board'])for(const x of [0,viewport.width-50])for(const y of [0,viewport.height-70]){
  const size={width:312,height:Math.min(420,viewport.height-24)};
  const p=previewPosition({left:x,top:y,right:x+50,width:50,height:70},size,viewport,kind);
  assert.ok(p.left>=12&&p.top>=12);assert.ok(p.left+size.width<=viewport.width-12);assert.ok(p.top+size.height<=viewport.height-12);
 }
});

test('En paysage court, la fiche de main se place à côté de la carte sans la masquer',()=>{
 const anchor={left:20,top:295,right:82,width:62,height:83};
 const p=previewPosition(anchor,{width:312,height:350},{width:844,height:390},'hand');
 assert.ok(p.left>=anchor.right+12);
});
