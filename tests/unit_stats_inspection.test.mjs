import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {freshProfile,createBattle,playPlayerCard} from '../src/engine.js';
import {unitStatContext,unitStats} from '../src/engine/unit-stats.js';
import {createViews} from '../src/ui/views.js';
import {cardInspectionContent} from '../src/ui/card-inspection.js';

function equippedProfile(){
 const p=freshProfile();p.buildings.forge=1;p.reputation.aube=15;
 p.equipmentOwned=['lame'];p.equipped.arme='lame';return p;
}
const shown=html=>({atk:Number(html.match(/stat atk[^]*?<b>(\d+)<\/b>/)[1]),maxhp:Number(html.match(/stat hp[^]*?<b>(\d+)<\/b>/)[1])});
const viewsFor=(profile,battle)=>createViews(()=>({profile,battle,screen:'battle',selectedCard:-1,animationsEnabled:false}));

test('Milicien : main, collection et unité donnent 3 ATQ / 7 PV avec les trois bonus',()=>{
 const p=equippedProfile(),b=createBattle(p,CAMPAIGN[0],42),views=viewsFor(p,b);
 b.heroes.p.hand=[{id:'militia',wait:0}];
 for(const opts of [{},{compact:true,index:0,cooldown:0}])assert.deepEqual(shown(views.cardUI('militia',opts)),{atk:3,maxhp:7});
 assert.equal(playPlayerCard(b,0,0).ok,true);
 assert.deepEqual({atk:b.board[0][1].atk,maxhp:b.board[0][1].maxhp},{atk:3,maxhp:7});
 const stats=unitStats(b,'militia');assert.deepEqual(stats.bonuses.map(x=>x.label),['Équipement','Forge','Réputation']);
});

test('Toutes les unités : aperçu égal au déploiement avec améliorations, maîtrise et deux géométries',()=>{
 for(const legacy of [false,true])for(const improved of [false,true]){
  const p=improved?equippedProfile():freshProfile();
  if(improved){p.buildings.forge=2;p.reputation.sylve=30;}
  for(const c of Object.values(CARDS).filter(c=>c.type==='unité')){
   p.collection[c.id]=Math.max(1,p.collection[c.id]||0);if(improved){p.upgrades[c.id]=2;p.mastery[c.id]=22;}
   const b=createBattle(p,CAMPAIGN[0],13,{legacy});b.heroes.p.hand=[{id:c.id,wait:0}];
   const stats=shown(viewsFor(p,b).cardUI(c.id,{compact:true,index:0,cooldown:0}));
   assert.equal(playPlayerCard(b,0,0).ok,true,c.id);
   const u=b.board[0][1];assert.deepEqual(stats,{atk:u.atk,maxhp:u.maxhp},c.id);
  }
 }
});

test('La main reprend les bonus du combat sauvegardé, la collection ceux du profil actuel',()=>{
 const p=equippedProfile(),b=createBattle(p,CAMPAIGN[0],7);
 p.buildings.forge=3;p.reputation.aube=45;p.equipped.arme=null;p.upgrades.militia=2;p.mastery.militia=22;
 const restored=JSON.parse(JSON.stringify(b)),views=viewsFor(p,restored);
 const before=JSON.stringify({p,restored});
 assert.deepEqual(shown(views.cardUI('militia',{compact:true,index:0,cooldown:0})),{atk:3,maxhp:7});
 assert.deepEqual(shown(views.cardUI('militia')),{atk:4,maxhp:14});
 assert.equal(JSON.stringify({p,restored}),before);
});

test('Sorts et anciens combats : pas de statistique d’unité inventée ni champ de sauvegarde ajouté',()=>{
 const p=freshProfile(),b=createBattle(p,CAMPAIGN[0],9,{legacy:true});
 delete b.mastery;delete b.reputationBonus;delete b.unitAtkBonus;
 assert.equal(unitStats(b,'firebolt'),null);assert.equal(unitStats(b,'unknown'),null);
 assert.deepEqual(shown(viewsFor(p,b).cardUI('archer',{compact:true,index:0,cooldown:2})),{atk:2,maxhp:3});
 const fields=Object.keys(b);unitStats(b,'archer');assert.deepEqual(Object.keys(b),fields);
 assert.equal(unitStats({enemyDifficulty:5},'militia','e').atk,4);
});

test('Fiche : capacité complète, attente réelle, bonus et statistiques partagés sans mutation',()=>{
 const p=equippedProfile(),stats=unitStats(unitStatContext(p),'archer');
 const esc=s=>String(s).replace(/</g,'&lt;').replace(/>/g,'&gt;');
 const html=cardInspectionContent(CARDS.archer,{wait:2},stats,esc);
 assert.match(html,/Portée 2 cases/);assert.match(html,/Attente 2 tours/);
 assert.match(html,/ATQ 3 \/ PV 5/);assert.match(html,/Équipement \+1 ATQ/);assert.match(html,/Réputation \+1 PV/);
 const spell=cardInspectionContent(CARDS.firebolt,{wait:0},null,esc);
 assert.match(spell,/Prête à jouer/);assert.doesNotMatch(spell,/inspection-stats/);
 assert.doesNotMatch(cardInspectionContent({...CARDS.archer,name:'<img>'},{wait:0},stats,esc),/<img>/);
});
