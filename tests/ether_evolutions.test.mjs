import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import {CARDS} from '../src/data.js';
import {ETHER_DESIGN_SOURCE} from '../src/cards/ether.js';
import {ETHER_UNIT_IDS,VERSIONED_UNIT_IDS,unitVersions,resolveUnitDefinition} from '../src/cards/definitions.js';
import {EVOLUTION_FUSIONS} from '../src/evolution-fusion.js';
import {cardPack,evolutionPackFor} from '../src/card-packs.js';
import {cardKey,ownedCardCopies,playableCardReference} from '../src/cards/references.js';
import {freshProfile,normalizeProfile,buyCardPack,modifyDeck,playPlayerCard,playEnemyCard,endPlayerTurn,finishEnemyTurn} from '../src/engine.js';
import {freshLab,setLabRarity,setLabLevel,createLabBattle} from '../src/engine/developer-lab.js';
import {resolveRetaliation,hit} from '../src/engine/battle-defense.js';
import {findCrownGuardian} from '../src/engine/guard-candidates.js';
import {prepareControlUnits,applySilence} from '../src/engine/battle-control.js';
import {captureCombatFrame} from '../src/engine/combat-events.js';
import {cardPresentation,boardInspectionData} from '../src/ui/card-presentation.js';
import {validateImportedProfile,validStoredBattle,saveProfile,loadProfile,storeBattle,restoreBattle} from '../src/ui/storage.js';
import {forgeUnit as unit,testStorage} from './fixtures/forge-combat.mjs';

// Totaux indépendants du registre, transcrits des cellules Notion relues le 04/11.
const totals={
 spark:[[2,3,1],[2,4,1],[3,4,1],[3,4,1],[3,4,1]],mystic:[[3,4,2],[3,6,2],[4,6,2],[4,6,2]],elemental:[[5,8,3],[5,10,3],[5,10,3]],
 griffin:[[5,6,3],[5,8,3],[5,8,3]],sentinel:[[2,9,2],[2,11,2],[2,11,2],[2,11,2]],dragon:[[7,12,5],[7,12,5]],
 tempest:[[3,6,2],[3,8,2],[4,8,2],[4,8,2]],seer:[[2,4,1],[2,5,1],[3,5,1],[3,5,1],[3,5,1]],
 aetherknight:[[5,9,3],[5,11,3],[5,11,3]],seraph:[[5,10,4],[5,10,4]],portal_walker:[[3,5,2],[3,7,2],[4,7,2],[4,7,2]]
};
const recipes=EVOLUTION_FUSIONS.filter(r=>CARDS[r.cardId].faction==='ether');
function summoned(id,rarity,side='p',level=0){
 const lab=freshLab();assert(setLabRarity(lab,side,id,rarity).ok);assert(setLabLevel(lab,side,id,level).ok);
 const before=structuredClone(lab),b=createLabBattle(lab,11);
 for(const hero of Object.values(b.heroes))Object.assign(hero,{hp:100,maxhp:100,hand:[],deck:[],discard:[]});
 b.heroes[side].hand=[{id,wait:0}];if(side==='e')b.phase='enemy';
 assert((side==='p'?playPlayerCard(b,0,0,1):playEnemyCard(b)).ok);
 const u=b.board.flat().find(u=>u?.side===side&&u.id===id);assert.deepEqual(lab,before);
 for(const row of b.board)row.fill(null);const col=side==='p'?1:10,dir=side==='p'?1:-1;
 b.board[0][col]=u;b.vfx=[];return {b,u,col,dir};
}
const attack=({b,u})=>(u.side==='p'?endPlayerTurn:finishEnemyTurn)(b);
const enemy=(side,extra={})=>unit('militia',side==='p'?'e':'p',{hp:30,maxhp:30,armor:0,stun:99,...extra});

test('Éther : 39 versions, 28 évolutions et onze personnages ; aucune décision native appliquée implicitement',()=>{
 assert.deepEqual([...ETHER_UNIT_IDS].sort(),Object.keys(totals).sort());assert.equal(recipes.length,28);
 assert.equal(ETHER_UNIT_IDS.filter(id=>VERSIONED_UNIT_IDS.includes(id)).length,11);
 let count=0;
 for(const [id,values] of Object.entries(totals)){
  const versions=unitVersions(id);assert.equal(versions.length,values.length,id);count+=versions.length;
  for(const [i,d] of versions.entries()){
   assert.deepEqual([d.stats.attack,d.stats.hp,d.stats.delay],values[i],d.versionId);
   assert.equal(d.status.combat,'implemented');assert.deepEqual(d.pendingDecisions,[]);
   if(i){assert.strictEqual(d.source,ETHER_DESIGN_SOURCE);assert.equal(d.status.obtaining,'fusion');}
   else assert.equal(d.status.obtaining,'existing');
   const abilities={...versions[0].abilities,...(id==='spark'&&i>=3?{spectralRetreat:{cells:1,period:3}}:{}),...(id==='seer'&&i>=3?{stillOmen:{amount:i===4?3:2,period:3,delay:1}}:{})};
   if(id==='spark'&&d.rarity==='divine')abilities.retreatStrike={amount:2,expiresAfter:2};
   if(id==='dragon'&&i)abilities.splashKnockback={cells:1,period:3};
   if(id==='sentinel'&&i>=2)abilities.guardPrism={amount:1,minimum:1,period:3,expiresAfter:2};
   if(id==='sentinel'&&d.rarity==='divine')abilities.guard={...abilities.guard,scope:'line'};
   if(id==='griffin'&&d.rarity==='divine')abilities.flightWake={cells:1,period:3,duration:1};
   if(id==='seraph'&&d.rarity==='divine')abilities.flightHeal={amount:2,period:3};
   if(id==='elemental'&&d.rarity==='divine')abilities.splashHealingPenalty={amount:2,duration:1,period:3};
   if(id==='tempest'&&d.rarity==='divine')abilities.splashArc={amount:2,period:3};
   if(id==='mystic'&&d.rarity==='divine')abilities.retaliatoryOmen={amount:2,period:3,expiresAfter:2};
   if(id==='aetherknight'&&d.rarity==='divine')abilities.chargeAdvance={cells:1,period:3};
   if(id==='portal_walker'&&d.rarity==='divine')abilities.portalEcho={range:1,expiresAfter:1};
   assert.deepEqual(d.abilities,abilities);assert.deepEqual(d.geometry,{...versions[0].geometry,...(id==='spark'&&i?{range:3}:{})});
  }
  assert.equal(resolveUnitDefinition(id,'divine').status.combat,'implemented');
  assert.equal(resolveUnitDefinition(id,'éveillée'),null);
 }
 assert.equal(count,39);assert.equal(Object.keys(CARDS).length,76);
 assert.equal(resolveUnitDefinition('sentinel','éveillée'),null);
 assert.equal(resolveUnitDefinition('spark').geometry.range,2);assert.equal(resolveUnitDefinition('spark','rare').geometry.range,3);
 const p=freshProfile();assert.deepEqual(normalizeProfile(p),p);assert.equal(p.evolvedCollection,undefined);
});

test('39 versions Éther × quatre niveaux × deux camps : vraie invocation et aucun gain réel du laboratoire',()=>{
 for(const [id,values] of Object.entries(totals))for(const [i,d] of unitVersions(id).entries())for(const level of [0,1,2,3])for(const side of ['p','e']){
  const {b,u}=summoned(id,d.rarity,side,level);
  assert.deepEqual([u.atk,u.maxhp],[values[i][0]+level,values[i][1]+level]);assert.equal(u.rarity,d.rarity);
  testStorage();assert(storeBattle(b));const {vfx,...saved}=b;assert.deepEqual(restoreBattle(),saved);
 }
});

test('Paquet Éther : pools 6/2/6, 60/35/5, six tirages et huit évolutions réellement obtenues',()=>{
 const pack=cardPack('ether-evolution');assert.deepEqual([pack.cost,pack.count,pack.mission],[190,3,'03']);
 assert.deepEqual(pack.groups.map(g=>g.weight),[60,35,5]);assert.deepEqual(pack.groups.map(g=>g.cards.length),[6,2,6]);
 assert.deepEqual(pack.groups[0].cards,['spark','mystic','sentinel','tempest','seer','portal_walker']);
 assert.deepEqual(pack.groups[1].cards,[{id:'seer',rarity:'rare'},{id:'spark',rarity:'rare'}]);
 assert.deepEqual(pack.groups[2].cards.map(cardKey),['mystic:épique','sentinel:épique','tempest:épique','seer:épique','portal_walker:épique','spark:épique']);
 for(const g of pack.groups)for(const ref of g.cards)assert(playableCardReference(ref));
 for(const g of pack.groups.slice(1))for(const [i,ref] of g.cards.entries()){
  const p=freshProfile();p.completed=['01','02','03'];p.gold=1000;let calls=0;
  const result=buyCardPack(p,pack.id,()=>calls++%2===0?(ref.rarity==='rare'?.7:.97):(i+.5)/g.cards.length);
  assert.equal(calls,6);assert.deepEqual(result.cards,[ref,ref,ref]);assert.equal(p.gold,810);
  assert.equal(ownedCardCopies(p,ref),3);assert(modifyDeck(p,ref,1));assert.deepEqual(validateImportedProfile(p),p);
  testStorage();assert(saveProfile(p));assert.deepEqual(loadProfile(),p);
 }
 for(const r of recipes)assert.equal(evolutionPackFor(r.cardId,r.to)?.id,['rare','épique'].includes(r.to)?pack.id:undefined);
 assert.equal(evolutionPackFor('spark','rare'),pack);
 assert.deepEqual(['aube','sylve','ombre','forge'].map(f=>cardPack(f+'-evolution').groups.map(g=>g.cards.length)),[[8,4,8],[9,6,9],[8,3,8],[7,3,7]]);
 const locked=freshProfile();locked.gold=1000;const before=structuredClone(locked);
 assert.equal(buyCardPack(locked,pack.id).ok,false);assert.deepEqual(locked,before);
});

test('Oracle et Voyante : portée 2, première cible sur leur ligne et aucune frappe supplémentaire aux deux camps',()=>{
 for(const side of ['p','e'])for(const [id,rarity,damage] of [['mystic','légendaire',4],['seer','épique',3]]){
  const c=summoned(id,rarity,side),first=enemy(side),second=enemy(side),other=enemy(side);
  c.b.board[0][c.col+c.dir*2]=first;c.b.board[0][c.col+c.dir*3]=second;c.b.board[1][c.col+c.dir*2]=other;
  attack(c);assert.equal(first.hp,30-damage);assert.equal(second.hp,30);assert.equal(other.hp,30);
  assert.equal(c.b.board[0][c.col],c.u);assert.equal(c.b.vfx.filter(e=>e.type==='attack'&&!e.riposte).length,1);
 }
});

test('Élémentaire et Tempête : Impact 2 contigu, protections normales, pas de saut ni de cible sur une autre ligne',()=>{
 for(const side of ['p','e'])for(const [id,damage] of [['elemental',5],['tempest',4]])for(const gap of [1,2]){
  const c=summoned(id,'légendaire',side),primary=enemy(side),secondary=enemy(side,{armor:2,barrier:1}),other=enemy(side);
  c.b.board[0][c.col+c.dir]=primary;c.b.board[0][c.col+c.dir*(1+gap)]=secondary;c.b.board[1][c.col+c.dir*2]=other;
  attack(c);assert.equal(primary.hp,30-damage);assert.equal(secondary.hp,30);assert.equal(secondary.barrier,gap===1?0:1);assert.equal(other.hp,30);
  assert.equal(c.b.vfx.filter(e=>e.type==='attack'&&!e.riposte).length,1);
 }
});

test('Griffon : Vol au-dessus d’un allié, deux pas et Charge +2 ; Chevalier : un pas, Perforation et barrière conservée',()=>{
 for(const side of ['p','e']){
  const c=summoned('griffin','légendaire',side),ally=unit('militia',side,{stun:99}),target=enemy(side);
  c.b.board[0][c.col+c.dir]=ally;c.b.board[0][c.col+3*c.dir]=target;attack(c);
  assert.equal(c.b.board[0][c.col+2*c.dir],c.u);assert.equal(c.b.board[0][c.col+c.dir],ally);assert.equal(target.hp,23);assert.equal(c.u.atk,5);
  for(const moved of [false,true]){
   const k=summoned('aetherknight','légendaire',side),victim=enemy(side,{armor:9,barrier:1});
   k.b.board[0][k.col+k.dir*(moved?2:1)]=victim;attack(k);
   assert.equal(victim.hp,moved?24:26);assert.equal(victim.barrier,0);assert.equal(k.u.atk,5);
   assert.equal(k.b.board[0][k.col+k.dir*(moved?1:0)],k.u);
  }
 }
});

test('Sillage : un franchissement réel donne un déplacement normal +1, une seule fois, aux deux camps',()=>{
 for(const side of ['p','e']){
  const c=summoned('griffin','divine',side),ally=unit('militia',side,{stun:1});
  const first=c.col+c.dir,landing=c.col+2*c.dir;c.b.board[0][first]=ally;
  c.b.board[0][c.col+3*c.dir]=enemy(side);attack(c);
  assert.equal(c.b.board[0][landing],c.u);
  assert.deepEqual(ally.flightWake,{cells:1,expiresRound:2});
  assert.equal(c.u.flightSupportReadyRound,4);
  assert.match(boardInspectionData(c.b,ally.uid).board.statuses.join(' '),/Sillage ascendant.*\+1/);
  testStorage();assert(storeBattle(c.b));assert(validStoredBattle(restoreBattle()));
  assert.deepEqual(restoreBattle().board[0][first].flightWake,ally.flightWake);
  const invalid=structuredClone(restoreBattle());invalid.board[0][first].flightWake.cells=2;
  assert.equal(validStoredBattle(invalid),false);
  c.b.board[0][landing]=null;c.b.board[0][c.col+3*c.dir]=null;
  c.b.round=2;c.b.phase=side==='p'?'player':'enemy';attack(c);
  assert.equal(c.b.board[0][c.col+3*c.dir],ally);assert.equal(ally.flightWake,undefined);
 }
});

test('Sillage : pas de bonus si le saut est bloqué ou silencieux ; entrave et expiration conservées',()=>{
 for(const blocked of [true,false]){
  const c=summoned('griffin','divine'),ally=unit('militia','p',{stun:99});c.b.board[0][2]=ally;
  if(blocked)c.b.board[0][3]=unit('militia','p',{stun:99});
  else assert(applySilence(c.b,c.u));
  attack(c);assert.equal(c.b.board[0][blocked?1:3],c.u);
  assert.equal(ally.flightWake,undefined);assert.equal(c.u.flightSupportReadyRound,undefined);
 }
 const c=summoned('griffin','divine'),ally=unit('militia','p',{stun:99});c.b.board[0][2]=ally;attack(c);
 assert(ally.flightWake);assert(finishEnemyTurn(c.b).ok);assert(ally.flightWake);
 attack(c);assert(ally.flightWake);assert(finishEnemyTurn(c.b).ok);assert.equal(ally.flightWake,undefined);
});

test('Soin de passage : soin immédiat plafonné, cadence et soin natif distinct',()=>{
 for(const side of ['p','e'])for(const hp of [1,4,5]){
  const c=summoned('seraph','divine',side),ally=unit('militia',side,{hp,maxhp:5,stun:99});
  const col=c.col+c.dir;c.b.board[0][col]=ally;attack(c);
  assert.equal(c.b.board[0][c.col+2*c.dir],c.u);
  const heals=c.b.vfx.filter(e=>e.type==='heal'&&e.col===col);
  assert.equal(heals.length,hp===1?2:hp===4?1:0);
  if(hp<5)assert.equal(heals[0].frame.board[0][col].hp,Math.min(5,hp+2));
  assert.equal(ally.hp,5);assert.equal(c.u.flightSupportReadyRound,hp<5?4:undefined);
  if(hp===1){
   c.b.board[0][c.col+2*c.dir]=null;c.b.board[0][c.col]=c.u;ally.hp=1;
   c.b.round=2;c.b.phase=side==='p'?'player':'enemy';c.b.vfx=[];attack(c);
   assert.equal(ally.hp,3);assert.equal(c.u.flightSupportReadyRound,4);
  }
 }
});

test('Sentinelle Épique : Armure 2, Garde de couronne positionnelle, Riposte effective une fois par tour',()=>{
 for(const side of ['p','e']){
  const c=summoned('sentinel','épique',side),opposite=side==='p'?'e':'p',target=enemy(side,{stun:0});
  const at=c.col+c.dir;c.b.board[0][at]=target;
  assert.equal(findCrownGuardian(c.b,0,side,at).u,c.u);assert.equal(findCrownGuardian(c.b,0,opposite,c.col),null);
  assert.equal(findCrownGuardian(c.b,1,side,at),null);
  assert.equal(hit(c.b,c.u,5,opposite),3);assert.equal(c.u.hp,8);
  assert(resolveRetaliation(c.b,c.u,target,0,c.col,at));assert.equal(target.hp,28);
  assert.equal(resolveRetaliation(c.b,c.u,target,0,c.col,at),false);
 }
});

test('Marcheur Légendaire : Portail avantageux réel, cadence trois tours, Silence et aucune Faille future',()=>{
 for(const rank of ['rare','épique','légendaire']){
  const view=cardPresentation({id:'portal_walker',rarity:rank});assert.equal(view.card.description,'Portail / 3 tours');
  const detail=view.details.join(' ');
  for(const phrase of ['avant son déplacement normal','même colonne libre et autorisée','gain suffisant','tous les 3 tours','aucune arrivée devant la couronne adverse','ni attaque ni déplacement supplémentaire'])assert(detail.includes(phrase),phrase);
 }
 for(const side of ['p','e']){
  const c=summoned('portal_walker','légendaire',side);c.b.board[0][c.col+c.dir]=unit('militia',side,{stun:99});
  const hooks={hit,emit:()=>{},note:()=>{},enter:()=>{}};
  prepareControlUnits(c.b,hooks,side);assert.equal(c.b.board[1][c.col],c.u);assert.equal(c.u.controlReadyRound,4);
  c.b.round=2;prepareControlUnits(c.b,hooks,side);assert.equal(c.b.board[1][c.col],c.u);assert.equal(c.u.controlReadyRound,4);
  const quiet=summoned('portal_walker','légendaire',side);quiet.b.board[0][quiet.col+quiet.dir]=unit('militia',side,{stun:99});
  assert(applySilence(quiet.b,quiet.u,1));prepareControlUnits(quiet.b,hooks,side);assert.equal(quiet.b.board[0][quiet.col],quiet.u);assert.equal(quiet.u.controlReadyRound,undefined);
  assert.equal(resolveUnitDefinition('portal_walker','légendaire').abilities.echo,undefined);
 }
});

test('Fiches, instantanés et anciennes possessions : chiffres définis seulement, aucune migration ou activation future',()=>{
 for(const r of recipes){
  const view=cardPresentation({id:r.cardId,rarity:r.to});assert(view.known);assert.match(view.availability,/fusion/);
  assert.equal(view.card.attack,resolveUnitDefinition(r.cardId,r.to).stats.attack);assert(view.details.length);
 }
 for(const ref of [{id:'spark',rarity:'éveillée'},{id:'sentinel',rarity:'éveillée'},{id:'seer',rarity:'éveillée'}]){
  const p=freshProfile();p.evolvedCollection={[cardKey(ref)]:1};assert.throws(()=>validateImportedProfile(p),/évolution invalide/);
  const view=cardPresentation(ref);assert.equal(view.known,false);assert.equal(view.stats,null);
 }
 const c=summoned('tempest','légendaire'),frame=captureCombatFrame(c.b),snapshot=JSON.stringify(frame);
 c.b.board[0][c.col+c.dir]=enemy('p');attack(c);assert.equal(JSON.stringify(frame),snapshot);
 testStorage();assert(storeBattle(c.b));const {vfx,...saved}=c.b;assert.deepEqual(restoreBattle(),saved);
});

test('Export distribué : le même registre Éther et le même moteur de Charge/Perforation sont embarqués',()=>{
 const source=readFileSync(new URL('../JOUER.html',import.meta.url),'utf8').match(/<script>\n([\s\S]*)<\/script>/)[1],context={structuredClone};
 new Script(source.replace("__load('src/app.js');","globalThis.api=__load('src/engine.js');globalThis.defs=__load('src/cards/definitions.js');globalThis.lab=__load('src/engine/developer-lab.js');")).runInNewContext(context);
 assert.equal(context.defs.resolveUnitDefinition('aetherknight','légendaire').stats.hp,11);
 assert.equal(context.defs.resolveUnitDefinition('spark','rare').geometry.range,3);
 const lab=context.lab.freshLab();context.lab.setLabRarity(lab,'p','aetherknight','légendaire');const b=context.lab.createLabBattle(lab,11);
 for(const h of Object.values(b.heroes))Object.assign(h,{hp:100,maxhp:100,hand:[],deck:[],discard:[]});
 b.heroes.p.hand=[{id:'aetherknight',wait:0}];assert(context.api.playPlayerCard(b,0,0,1).ok);
 const victim=enemy('p',{armor:9,barrier:1});b.board[0][3]=victim;context.api.endPlayerTurn(b);assert.equal(victim.hp,24);
});
