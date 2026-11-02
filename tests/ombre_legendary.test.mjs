import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script} from 'node:vm';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {freshProfile,fuseEvolutionCopies,modifyDeck,createBattle,playPlayerCard,endPlayerTurn,finishEnemyTurn} from '../src/engine.js';
import {resolveUnitDefinition} from '../src/cards/definitions.js';
import {cardKey,cardReference,ownedCardCopies} from '../src/cards/references.js';
import {evolutionFusionFor} from '../src/evolution-fusion.js';
import {cardPack,evolutionPackFor} from '../src/card-packs.js';
import {hit,resolveRetaliation,grantAbilityBarrier,grantSharedBarrier} from '../src/engine/battle-defense.js';
import {resolveUnitDeath} from '../src/engine/unit-death.js';
import {applySilence} from '../src/engine/battle-control.js';
import {recordCombatEvent} from '../src/engine/combat-events.js';
import {storeBattle,restoreBattle,saveProfile,loadProfile,validateImportedProfile,validStoredBattle} from '../src/ui/storage.js';
import {cardPresentation} from '../src/ui/card-presentation.js';
import {freshLab,setLabRarity,createLabBattle} from '../src/engine/developer-lab.js';
import {playEnemyCard} from '../src/engine.js';

const totals={bone:[4,6,1],shade:[4,5,1],crypt:[3,9,1],plague:[4,7,2],banshee:[4,7,3],vampire:[5,8,3],graveknight:[5,10,2],nightblade:[4,6,1],spectre:[4,6,1],mist_inquisitor:[3,8,3]};
let uid=900;
const noop=()=>{};
function unit(id='militia',side='p',extra={}){const d=resolveUnitDefinition(id);return {uid:uid++,id,rarity:d.rarity,side,atk:d.stats.attack,hp:d.stats.hp,maxhp:d.stats.hp,armor:d.abilities.armor?.amount||0,ranged:d.geometry.range>1,ability:CARDS[id].ability,stun:0,poison:0,poisonTurns:0,...extra};}
function storage(){const data={};globalThis.localStorage={getItem:k=>data[k]??null,setItem:(k,v)=>{data[k]=String(v)},removeItem:k=>{delete data[k]}};}
function prepared(id){
 const p=freshProfile();p.completed=CAMPAIGN.slice(0,6).map(m=>m.id);const ref=cardReference({id,rarity:'épique'}),used=p.deck.filter(r=>cardKey(r)===cardKey(ref)).length;
 if(typeof ref==='string')p.collection[ref]=used+3;else p.evolvedCollection={[cardKey(ref)]:used+3};
 const plan=fuseEvolutionCopies(p,id+':légendaire');assert.equal(plan.ok,true);assert.equal(modifyDeck(p,plan.target,1),true);
 const b=createBattle(p,{...CAMPAIGN[0],deck:[],hp:100},11,{turnFlow:'alternating'});
 for(const h of Object.values(b.heroes))Object.assign(h,{hp:100,maxhp:100,hand:[],deck:[],discard:[]});
 b.heroes.p.hand=[{...plan.target,wait:0}];return {p,b,ref:plan.target};
}
function gained(id){const x=prepared(id);assert(playPlayerCard(x.b,0,0,1).ok);return {...x,u:x.b.board[0][1]};}

test('Dix Légendaires réellement fusionnées : totaux, mission 06, stocks, import et reprise',()=>{
 for(const [id,expected] of Object.entries(totals)){
  const d=resolveUnitDefinition(id,'légendaire');assert.deepEqual([d.stats.attack,d.stats.hp,d.stats.delay],expected);assert.equal(evolutionFusionFor(id,'légendaire').mission,'06');
  const {p,b,u,ref}=gained(id);assert.deepEqual([u.atk,u.maxhp],expected.slice(0,2));assert.equal(ownedCardCopies(p,ref),1);assert.equal(p.completedTrials,undefined);assert.equal(b.mode,'campaign');
  assert.deepEqual(validateImportedProfile(p),p);storage();assert(saveProfile(p));assert.deepEqual(loadProfile(),p);assert(storeBattle(b));assert.deepEqual(restoreBattle(),b);
  for(const rank of ['divine','éveillée']){assert.equal(resolveUnitDefinition(id,rank).status.obtaining,'fusion');const before=structuredClone(p);assert.equal(fuseEvolutionCopies(p,id+':'+rank).ok,false);assert.deepEqual(p,before);assert.ok(evolutionFusionFor(id,rank).ascension);}assert.equal(evolutionPackFor(id,'légendaire'),null);
 }
 assert.equal(resolveUnitDefinition('lich').rarity,'légendaire');assert.equal(evolutionFusionFor('lich','légendaire'),null);
 assert.deepEqual(cardPack('ombre-evolution').groups.map(g=>g.cards.length),[8,3,8]);
});

test('Veille funéraire : barrière immédiate, une fois par tour et plafond propre sans cumul',()=>{
 const {b,u}=gained('crypt');const kill=col=>{const ally=unit();b.board[0][col]=ally;hit(b,ally,100,'e');return ally;};
 const dead=kill(2);assert.equal(u.barrier,2);assert.equal(u.lastFuneralWatchRound,1);assert.equal(dead.deathResolved,true);
 hit(b,u,3,'e');assert.equal(u.barrier,1);kill(3);assert.equal(u.barrier,1);assert.equal(u.hp,9);
 b.round=2;kill(4);assert.equal(u.barrier,2);grantSharedBarrier(u,8,10);assert.equal(u.barrier,10);
 hit(b,u,4,'e');assert.equal(u.barrier,8);kill(5);assert.equal(u.barrier,8);
 b.round=3;kill(6);assert.equal(u.barrier,10);resolveUnitDeath(b,dead,0,2,noop);assert.equal(u.barrier,10);
});

test('Veille : pas de gain pour un ennemi, une autre ligne, soi-même ou un gardien déjà mort',()=>{
 const {b,u}=gained('crypt');const other=unit('militia','p'),enemy=unit('bone','e');b.board[1][2]=other;b.board[0][2]=enemy;
 hit(b,other,100,'e');hit(b,enemy,100,'p');assert.equal(u.barrier,undefined);assert.equal(u.lastFuneralWatchRound,undefined);
 hit(b,u,100,'e');assert.equal(u.barrier,undefined);const ally=unit();b.board[0][3]=ally;hit(b,ally,100,'e');assert.equal(u.barrier,undefined);
});

test('Plusieurs Veilleurs : quotas individuels, seulement les vivants sur la ligne du décès',()=>{
 const {b,u}=gained('crypt'),second={...u,uid:uid++},otherLine={...u,uid:uid++};b.board[0][3]=second;b.board[1][1]=otherLine;
 const ally=unit();b.board[0][2]=ally;hit(b,ally,100,'e');assert.deepEqual([u.barrier,second.barrier,otherLine.barrier],[2,2,undefined]);
 hit(b,u,100,'e');assert.equal(second.barrier,2);assert.equal(otherLine.barrier,undefined);
 b.round=2;const next=unit();b.board[0][4]=next;hit(b,next,100,'e');assert.equal(second.lastFuneralWatchRound,2);assert.equal(second.barrier,2);
});

test('Silence bloque Veille sans rejouer un décès ancien ; Étourdissement ne bloque pas cette réaction',()=>{
 const {b,u}=gained('crypt');assert.equal(applySilence(b,u,1),true);const ally=unit();b.board[0][2]=ally;hit(b,ally,100,'e');assert.equal(u.barrier,undefined);assert.equal(ally.deathResolved,true);
 delete u.silenceUntil;resolveUnitDeath(b,ally,0,2,noop);assert.equal(u.barrier,undefined);
 u.stun=2;const next=unit();b.board[0][3]=next;hit(b,next,100,'e');assert.equal(u.barrier,2);assert.equal(u.lastFuneralWatchRound,1);
});

test('Cap rempli : le déclenchement utilise le quota même si aucune barrière ne peut être ajoutée',()=>{
 const {b,u}=gained('crypt');grantAbilityBarrier(u,'funeralBarrier',{amount:2,cap:2});const a=unit();b.board[0][2]=a;hit(b,a,100,'e');assert.equal(u.lastFuneralWatchRound,1);
 hit(b,u,4,'e');assert.equal(u.barrier,0);const z=unit();b.board[0][3]=z;hit(b,z,100,'e');assert.equal(u.barrier,0);
});

test('Un décès par poison déclenche avant les mouvements, puis le quota survit à la reprise',()=>{
 const {b,u}=gained('crypt');u.stun=99;const ally=unit('militia','p',{hp:1,poison:1,poisonTurns:1});b.board[0][2]=ally;endPlayerTurn(b);assert.equal(b.board[0][2],null);assert.equal(u.barrier,2);assert.equal(u.lastFuneralWatchRound,1);
 storage();assert(storeBattle(b));const restored=restoreBattle();assert.deepEqual(restored,b);const next=unit();restored.board[0][3]=next;hit(restored,next,100,'e');assert.equal(restored.board[0][1].barrier,2);
});

test('Protection funéraire : source plafonnée et consommation sans effacer une autre barrière',()=>{
 const {b,u}=gained('crypt');grantAbilityBarrier(u,'healBarrier',{amount:2,cap:2});grantAbilityBarrier(u,'funeralBarrier',{amount:2,cap:2});grantSharedBarrier(u,6,10);
 hit(b,u,5,'e');assert.equal(u.barrier,7);assert.equal(u.abilityBarriers.healBarrier,0);assert.equal(u.abilityBarriers.funeralBarrier,1);assert.equal(u.hp,9);
 const native=unit('militia','p',{barrier:2,abilityBarriers:{healBarrier:2}});hit(b,native,1,'e');assert.deepEqual(native.abilityBarriers,{healBarrier:1,riposteBarrier:0,arrivalBarrier:0,chargeBarrier:0,furyBarrier:0});
});

test('Reprise et événements : quota validé, instantanés de barrières non mutés',()=>{
 const {b,u}=gained('crypt');const a=unit();b.board[0][2]=a;hit(b,a,100,'e');b.vfx=[];recordCombatEvent(b,{type:'state',side:'p',lane:0,col:1});const frame=JSON.stringify(b.vfx[0].frame);hit(b,u,3,'e');assert.equal(JSON.stringify(b.vfx[0].frame),frame);
 storage();storeBattle(b);const {vfx,...saved}=b;assert.deepEqual(restoreBattle(),saved);
 for(const value of [null,-1,0,1.5,Infinity]){const bad=structuredClone(saved);bad.board[0][1].lastFuneralWatchRound=value;assert.equal(validStoredBattle(bad),false);}
});

test('Chevalier : ATQ 5, Charge +2 après un seul pas et Riposte effective sans Charge',()=>{
 for(const distance of [1,2]){
  const {b,u}=gained('graveknight'),target=unit('bone','e',{hp:30,maxhp:30,stun:99});b.board[0][1+distance]=target;endPlayerTurn(b);assert.equal(target.hp,30-5-(distance===2?2:0));assert.equal(u.atk,5);
 }
 const {b,u}=gained('graveknight'),target=unit('bone','e',{hp:30,maxhp:30});u.movedThisRound=true;assert(resolveRetaliation(b,u,target,0,1,2,1));assert.equal(target.hp,24);assert.equal(resolveRetaliation(b,u,target,0,1,2,1),false);
});

test('Banshee : Vol et portée 2 réels, première cible seulement, présentation structurée',()=>{
 const {b,u}=gained('banshee');b.board[0][2]=unit('militia','p',{stun:99});const target=unit('bone','e',{hp:30,maxhp:30,stun:99}),back=unit('bone','e',{hp:30,maxhp:30,stun:99});b.board[0][5]=target;b.board[0][6]=back;
 endPlayerTurn(b);assert.equal(b.board[0][3],u);assert.equal(target.hp,26);assert.equal(back.hp,30);const text=cardPresentation({id:'banshee',rarity:'légendaire'});assert.match(text.card.description,/Portée 2/);assert.match(text.details.join(' '),/Vol/);
});

test('Vampire : Vol de vie 2 même sur frappe absorbée, plafond et Silence inchangés',()=>{
 for(const silence of [false,true]){
  const {b,u}=gained('vampire');b.heroes.p.hp=99;b.board[0][2]=unit('bone','e',{hp:30,maxhp:30,barrier:100,stun:99});if(silence)assert(applySilence(b,u,1));endPlayerTurn(b);
  assert.equal(b.heroes.p.hp,silence?99:100);assert.equal(b.board[0][2].hp,30);
 }
 const d=cardPresentation({id:'vampire',rarity:'légendaire'});assert.match(d.card.description,/Vol de vie 2/);assert.match(d.details.join(' '),/même si la frappe est absorbée/);
});

test('Faucheur et Lame Légendaires : Poison 1 × 2 et Perforation conservent leurs règles',()=>{
 const plague=gained('plague'),target=unit('bone','e',{hp:30,maxhp:30,stun:99});plague.b.board[0][2]=target;endPlayerTurn(plague.b);assert.deepEqual([target.hp,target.poison,target.poisonTurns],[26,1,2]);finishEnemyTurn(plague.b);assert.deepEqual([target.hp,target.poisonTurns],[25,1]);
 const blade=gained('nightblade'),armored=unit('bone','e',{hp:30,maxhp:30,armor:9,barrier:2,stun:99});blade.b.board[0][2]=armored;endPlayerTurn(blade.b);assert.equal(armored.hp,28);assert.equal(armored.barrier,0);
});

test('Veille aux deux camps : dégâts et poison dans le vrai laboratoire, sans progression réelle',()=>{
 for(const side of ['p','e'])for(const poison of [false,true]){
  const lab=freshLab();setLabRarity(lab,side,'crypt','légendaire');const before=structuredClone(lab),b=createLabBattle(lab,11);b.heroes[side].hand=[{id:'crypt',wait:0}];if(side==='e')b.phase='enemy';assert((side==='p'?playPlayerCard(b,0,0,1):playEnemyCard(b)).ok);
  const u=b.board.flat().find(u=>u?.side===side&&u.id==='crypt');for(const row of b.board)row.fill(null);const col=side==='p'?1:10,dir=side==='p'?1:-1;b.board[0][col]=u;u.stun=99;
  const ally=unit('militia',side,{hp:poison?1:5,poison:poison?1:0,poisonTurns:poison?1:0});b.board[0][col+dir]=ally;
  if(poison){if(side==='p')endPlayerTurn(b);else finishEnemyTurn(b);}else hit(b,ally,100,side==='p'?'e':'p');
  assert.equal(u.barrier,2);assert.equal(u.lastFuneralWatchRound,1);assert.deepEqual(lab,before);storage();storeBattle(b);assert.deepEqual(restoreBattle(),b);
 }
});

test('Export autonome : graphe réellement chargé et Veille exécutée sans DOM',()=>{
 const script=readFileSync(new URL('../JOUER.html',import.meta.url),'utf8').match(/<script>\n([\s\S]*)<\/script>/)[1];
 assert.ok(script.includes("__load('src/app.js');"));
 const context={structuredClone};new Script(script.replace("__load('src/app.js');","globalThis.api=__load('src/engine.js');")).runInNewContext(context);
 const e=context.api,p=e.freshProfile();p.evolvedCollection={'crypt:légendaire':1};p.deck[0]={id:'crypt',rarity:'légendaire'};
 const b=e.createBattle(p,{id:'offline',name:'Hors ligne',enemy:'Test',hp:100,difficulty:1,deck:[]},1,{turnFlow:'alternating'});
 b.heroes.p.hand=[{id:'crypt',rarity:'légendaire',wait:0},{id:'militia',wait:0}];assert(e.playPlayerCard(b,0,0,1).ok);assert(e.playPlayerCard(b,0,0,2).ok);
 const ally=b.board[0][2];ally.hp=1;ally.poison=1;ally.poisonTurns=1;e.endPlayerTurn(b);const watcher=b.board.flat().find(u=>u?.id==='crypt');assert.equal(watcher.barrier,2);assert.equal(watcher.lastFuneralWatchRound,1);
});
