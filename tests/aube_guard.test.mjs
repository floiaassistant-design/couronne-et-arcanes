import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {freshProfile} from '../src/engine/profile.js';
import {createBattle,endPlayerTurn,finishEnemyTurn} from '../src/engine/battle.js';
import {crownGuardCandidates,findCrownGuardian} from '../src/engine/guard-candidates.js';
import {resolveUnitDefinition} from '../src/cards/definitions.js';
import {GUARD_POLICY} from '../src/cards/abilities.js';
import {captureCombatFrame} from '../src/engine/combat-events.js';
import {buildCombatSteps} from '../src/ui/combat-steps.js';
import {storeBattle,restoreBattle} from '../src/ui/storage.js';

let uid=9000;
function unit(id,side,rarity,extra={}){
 const d=resolveUnitDefinition(id,rarity);
 return {uid:++uid,id,side,atk:d.stats.attack,maxhp:d.stats.hp,hp:d.stats.hp,
  armor:d.abilities.armor?.amount||0,ranged:!!d.abilities.ranged,ability:CARDS[id].ability,
  stun:0,poison:0,poisonTurns:0,...(rarity?{rarity}:{}),...extra};
}
function combat(legacy=false){
 const b=createBattle(freshProfile(),{...CAMPAIGN[0],deck:[]},922,{legacy,turnFlow:'alternating'});
 for(const h of Object.values(b.heroes))Object.assign(h,{hp:100,maxhp:100,hand:[],deck:[],discard:[]});
 b.vfx=[];return b;
}
const guard=(side,rarity='éveillée',extra={})=>unit('shield',side,rarity,{stun:99,...extra});

test('Politique centrale validée : priorité et fréquence héritées par chaque rang, natif inclus',()=>{
 const expected={priority:'same-line-then-own-crown',tieBreak:'lane-uid',frequency:'while-alive',maxPerAttack:1};
 assert.deepEqual(GUARD_POLICY,expected);
 for(const rarity of ['rare','épique','légendaire','divine','éveillée']){
  const d=resolveUnitDefinition('shield',rarity);
  for(const [key,value] of Object.entries(expected))assert.equal(d.abilities.guard[key],value);
  assert.deepEqual(d.pendingDecisions,[]);assert.equal(d.status.combat,['rare','épique'].includes(rarity)?'implemented':'pending');
 }
 assert.equal(resolveUnitDefinition('shield').abilities.guard.scope,'positioned');
 assert.equal(resolveUnitDefinition('shield').abilities.guard.priority,'same-line-then-own-crown');
});

for(const legacy of [false,true])for(const side of ['p','e']){
 test(`Priorité symétrique ${legacy?'3×5':'dix cases'} / ${side} : même ligne puis proximité de sa couronne`,()=>{
  const b=combat(legacy),end=b.board[0].length-2,near=side==='p'?1:end,far=side==='p'?3:end-2;
  const attackerCol=side==='p'?end:1;
  b.board[0][far]=guard(side);b.board[1][near]=guard(side);
  assert.equal(findCrownGuardian(b,0,side,attackerCol).u,b.board[0][far],'même ligne avant proximité');
  b.board[0][near]=guard(side);
  assert.equal(findCrownGuardian(b,0,side,attackerCol).u,b.board[0][near]);
  b.board[0][near].hp=0;
  assert.equal(findCrownGuardian(b,0,side,attackerCol).u,b.board[0][far],'mort exclue immédiatement');
  b.board[0][far].hp=0;
  assert.equal(findCrownGuardian(b,0,side,attackerCol).u,b.board[1][near]);
 });
}

test('Égalité entre lignes : ordre des lignes stable, sélection pure et un seul résultat',()=>{
 const b=combat();b.board.push(Array(b.board[0].length).fill(null));
 b.board[1][4]=guard('e');b.board[2][4]=guard('e');
 // Un uid plus petit sur la dernière ligne ne passe pas avant la première ligne.
 b.board[2][4].uid=1;
 const before=JSON.stringify(b),found=findCrownGuardian(b,0,'e',10);
 assert.deepEqual([found.lane,found.col],[1,4]);assert.equal(JSON.stringify(b),before);
 assert.equal(crownGuardCandidates(b,0,'e',10).length,2);
});

test('Normale positionnelle, Divine derrière attaquant, Éveillée interligne : sélection raccordée',()=>{
 const b=combat();b.board[0][3]=guard('e','rare');
 assert.equal(findCrownGuardian(b,0,'e',10),null,'Garde normale dépassée');
 b.board[0][3].rarity='divine';assert.equal(findCrownGuardian(b,0,'e',10).col,3);
 assert.equal(findCrownGuardian(b,1,'e',10),null);
 b.board[0][3].rarity='éveillée';assert.equal(findCrownGuardian(b,1,'e',10).lane,0);
});

test('Deux frappes de la même résolution sont interceptées sans quota par tour ni double interception',()=>{
 const b=combat(),u=guard('e','divine');b.board[0][3]=u;
 b.board[0][9]=unit('bone','p',undefined,{atk:4,ranged:true,hp:50});
 b.board[0][10]=unit('bone','p',undefined,{atk:4,hp:50});
 u.lastGuardRound=1; // Un ancien champ éventuel ne crée pas une limite non décidée.
 endPlayerTurn(b);
 assert.equal(u.hp,u.maxhp-6,'deux coups à 4 + Concorde 1, puis Armure 2');
 assert.equal(b.heroes.e.hp,100);
 assert.equal(b.vfx.filter(e=>e.type==='damage'&&e.side==='e').length,2);
 assert.equal(b.vfx.filter(e=>e.type==='hero-damage'&&e.side==='e').length,0);
 assert.equal(b.vfx.filter(e=>e.riposte).length,0,'gardien trop loin pour riposter');
});

test('Gardien tué au premier coup : la frappe suivante choisit un autre gardien vivant',()=>{
 const b=combat(),first=guard('e','éveillée',{hp:1}),second=guard('e');
 b.board[0][3]=first;b.board[1][3]=second;
 b.board[0][9]=unit('bone','p',undefined,{atk:4,ranged:true});
 b.board[0][10]=unit('bone','p',undefined,{atk:4});
 endPlayerTurn(b);
 assert.equal(first.hp,0);assert.equal(b.stats.playerKills,1);
 assert.equal(second.hp,second.maxhp-3);assert.equal(b.heroes.e.hp,100);
 assert.equal(b.vfx.filter(e=>e.type==='damage'&&e.side==='e').length,2);
 assert.deepEqual(b.vfx.filter(e=>e.type==='attack').map(e=>[e.fromLane??e.lane,e.lane,e.to]),[[0,0,3],[0,1,3]]);
});

test('Dernier gardien tué : la frappe suivante atteint la couronne, sans retoucher le mort',()=>{
 const b=combat(),u=guard('e','divine',{hp:1});b.board[0][3]=u;
 b.board[0][9]=unit('bone','p',undefined,{atk:4,ranged:true});
 b.board[0][10]=unit('bone','p',undefined,{atk:4});
 endPlayerTurn(b);assert.equal(b.heroes.e.hp,95);assert.equal(b.stats.playerKills,1);
 assert.equal(b.vfx.filter(e=>e.type==='damage'&&e.side==='e').length,1);
 assert.equal(b.vfx.filter(e=>e.type==='hero-damage'&&e.side==='e').length,1);
});

for(const side of ['p','e'])test(`Interception interligne ${side} : vraie destination, unité immobile et aucune fausse Riposte`,()=>{
 const b=combat(),foe=side==='p'?'e':'p',end=b.board[0].length-2,attackCol=foe==='p'?end:1,guardCol=foe==='p'?end-1:2;
 const u=guard(side),attacker=unit('bone',foe,undefined,{atk:5});
 b.board[0][attackCol]=attacker;b.board[1][guardCol]=u;
 const before=captureCombatFrame(b);
 if(foe==='p')endPlayerTurn(b);else{b.phase='enemy';finishEnemyTurn(b);}
 assert.equal(u.hp,u.maxhp-3);assert.equal(b.heroes[side].hp,100);
 assert.equal(b.board[1][guardCol],u);assert.equal(b.board[0][guardCol],null);
 assert.equal(b.vfx.filter(e=>e.riposte).length,0,'colonnes adjacentes mais lignes différentes');
 const attack=b.vfx.find(e=>e.type==='attack');
 assert.deepEqual([attack.fromLane,attack.lane,attack.from,attack.to],[0,1,attackCol,guardCol]);
 const step=buildCombatSteps(b.vfx,before,captureCombatFrame(b)).find(e=>e.type==='attack');
 assert.match(step.label,/Guerrier d’ossements.*Porte-égide/);assert.equal(step.changes[0].lane,1);
 assert.equal(step.frame.board[1][guardCol].uid,u.uid);
});

test('Garde future ne détourne pas une attaque visant une unité : premier ennemi conservé à distance',()=>{
 const b=combat(),victim=unit('bone','e',undefined,{stun:99,hp:20}),u=guard('e');
 b.board[0][4]=unit('archer','p',undefined,{atk:4});b.board[0][5]=victim;b.board[0][6]=u;
 endPlayerTurn(b);assert.equal(victim.hp,16);assert.equal(u.hp,u.maxhp);
 assert.equal(b.vfx.find(e=>e.type==='attack').to,5);
});

test('Garde passive sous silence, Armure et barrière du vrai gardien appliquées une seule fois',()=>{
 const b=combat(),u=guard('e','éveillée',{silenceUntil:1,barrier:2});
 b.board[1][9]=u;b.board[0][10]=unit('bone','p',undefined,{atk:5});
 endPlayerTurn(b);assert.equal(u.barrier,0);assert.equal(u.hp,u.maxhp-1);assert.equal(b.heroes.e.hp,100);
 const damage=b.vfx.find(e=>e.type==='damage');assert.equal(damage.lane,1);assert.equal(damage.col,9);
 assert.equal(damage.armor,2);assert.equal(damage.absorbed,2);assert.equal(damage.damage,1);
});

test('Natifs des cinq factions : position requise, même ligne et priorité près de sa couronne',()=>{
 for(const id of ['shield','treant','crypt','golem','sentinel'])for(const side of ['p','e']){
  const b=combat(),end=b.board[0].length-2,near=side==='p'?1:end,far=side==='p'?3:end-2;
  b.board[0][near]=unit(id,side);b.board[0][far]=unit(id,side);
  assert.equal(findCrownGuardian(b,0,side,side==='p'?end:1).u,b.board[0][near],id);
  assert.equal(findCrownGuardian(b,0,side,side==='p'?1:end),null,'gardes dépassées : '+id);
  assert.equal(findCrownGuardian(b,1,side,side==='p'?1:end),null);
 }
});

test('Gardes de rangs différents : même règle de position et sélection pure',()=>{
 const b=combat();b.board[1][9]=guard('e');b.board[0][3]=unit('shield','e',undefined,{stun:99});
 assert.equal(findCrownGuardian(b,0,'e',10).u,b.board[1][9],'le natif dépassé ne peut pas intercepter');
 b.board[0][3]=null;b.board[0][10]=unit('shield','e',undefined,{stun:99});
 assert.equal(findCrownGuardian(b,0,'e',9).u,b.board[0][10],'natif bien placé sur la ligne prioritaire');
 b.board[0][10]=null;b.board[0][8]=guard('e','divine');
 assert.equal(findCrownGuardian(b,0,'e',10).u,b.board[0][8],'plus proche de sa couronne');
 const before=JSON.stringify(b);findCrownGuardian(b,0,'e',10);assert.equal(JSON.stringify(b),before);
});

test('Sauvegarde/reprise : choix stable sans quota ajouté ni déplacement de gardien',()=>{
 const cache={};globalThis.localStorage={getItem:k=>cache[k]??null,setItem:(k,v)=>{cache[k]=String(v);},removeItem:k=>{delete cache[k];}};
 const b=combat();b.board[0][3]=guard('e','divine');b.board[1][9]=guard('e');
 b.board[0][10]=unit('bone','p',undefined,{atk:5});
 const expected=findCrownGuardian(b,0,'e',10).u.uid;
 assert(storeBattle(b));const resumed=restoreBattle();assert(resumed);
 assert.equal(findCrownGuardian(resumed,0,'e',10).u.uid,expected);
 endPlayerTurn(resumed);assert.equal(resumed.heroes.e.hp,100);
 assert.equal(resumed.board[0][3].hp,10);assert.equal(resumed.board[1][9].hp,13);
 assert.equal(resumed.board[0][3].lastGuardRound,undefined);
});


test('Interception au contact sur la même ligne : vraie Riposte effective conservée',()=>{
 const b=combat(),u=guard('e','divine'),attacker=unit('bone','p',undefined,{atk:5,hp:20});
 b.board[0][9]=u;b.board[0][10]=attacker;
 endPlayerTurn(b);assert.equal(u.hp,10);assert.equal(attacker.hp,18);
 assert.equal(b.vfx.filter(e=>e.riposte).length,1);assert.equal(u.lastRiposteRound,1);
});

test('Coordonnées et camp invalides : aucune interception ni mutation',()=>{
 const b=combat();b.board[0][3]=unit('shield','e');
 const before=JSON.stringify(b);
 for(const col of [undefined,0,11,1.5])assert.equal(findCrownGuardian(b,0,'e',col),null);
 for(const lane of [-1,2,1.5])assert.equal(findCrownGuardian(b,lane,'e',10),null);
 assert.equal(findCrownGuardian(b,0,'x',10),null);
 assert.deepEqual(crownGuardCandidates(b,0,'x',10),[]);assert.equal(JSON.stringify(b),before);
});
