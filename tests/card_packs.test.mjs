import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,CAMPAIGN} from '../src/data.js';
import {CARD_PACKS,cardPack} from '../src/card-packs.js';
import {freshProfile,buyPack,buyCardPack,previewCardPack,fuseEvolutionCopies,modifyDeck,createBattle,playPlayerCard} from '../src/engine.js';
import {cardKey,ownedCardCopies,playableCardReference} from '../src/cards/references.js';
import {resolveUnitDefinition} from '../src/cards/definitions.js';
import {validateImportedProfile,saveProfile,loadProfile,storeBattle,restoreBattle} from '../src/ui/storage.js';
import {createCardPackController} from '../src/ui/card-pack-controller.js';

const ready=()=>{const p=freshProfile();p.gold=10000;p.completed=['01','02','03'];return p;};
function draws(values){let i=0;return ()=>values[i++%values.length];}
const kind=ref=>typeof ref==='string'?'native':ref.rarity;
function storage(){const data={};globalThis.localStorage={getItem:k=>data[k]??null,setItem:(k,v)=>{data[k]=String(v)},removeItem:k=>{delete data[k]}};return data;}

test('Catalogue : ancien paquet conservé, nouveau contenu explicite et seuls les douze rangs Aube déjà jouables',()=>{
 assert.equal(CARD_PACKS.length,3);
 const pack=cardPack('aube-evolution');assert.deepEqual([pack.cost,pack.count,pack.mission],[190,3,'03']);
 assert.deepEqual(pack.groups.map(g=>g.weight),[60,35,5]);assert.deepEqual(pack.groups.map(g=>g.cards.length),[8,4,8]);
 assert.deepEqual(pack.groups[0].cards.slice().sort(),['militia','shield','archer','lancer','cleric','banner','scoutcaptain','sunpriest'].sort());
 assert.deepEqual(pack.groups[1].cards.map(cardKey).sort(),['militia:rare','shield:rare','archer:rare','lancer:rare'].sort());
 assert.deepEqual(pack.groups[2].cards.map(cardKey).sort(),['militia','shield','archer','lancer','cleric','banner','scoutcaptain','sunpriest'].map(id=>id+':épique').sort());
 for(const p of CARD_PACKS){assert.equal(p.groups.reduce((n,g)=>n+g.weight,0),100);assert.ok(p.groups.every(g=>g.cards.every(playableCardReference)));}
 assert.throws(()=>{pack.groups[0].weight=0},TypeError);assert.throws(()=>{pack.groups[0].cards.push('wolf')},TypeError);
});

test('Paquet mystique : mêmes IDs, six tirages, poids 65/28/7 et prix 95 sur les bornes historiques',()=>{
 const all=Object.values(CARDS).filter(c=>!c.heroClass);
 for(const roll of [0,.649999,.65,.929999,.93,.999999])for(const pick of [0,.49,.999999]){
  const pool=all.filter(c=>roll<.65?c.rarity==='commun':roll<.93?c.rarity==='rare':c.rarity==='épique');
  const p=ready(),before=structuredClone(p);let calls=0;
  const result=buyPack(p,()=>calls++%2===0?roll:pick),expected=pool[Math.floor(pick*pool.length)].id;
  assert.deepEqual(result,{ok:true,cards:[expected,expected,expected]});assert.equal(calls,6);assert.equal(p.gold,before.gold-95);
  before.gold-=95;before.collection[expected]=(before.collection[expected]||0)+3;assert.deepEqual(p,before);
 }
});

test('Bornes et répartition du nouveau paquet : trois tirages indépendants, doublons et absence de rang garanti',()=>{
 for(const [roll,expected] of [[0,'native'],[.599999,'native'],[.6,'rare'],[.949999,'rare'],[.95,'épique'],[.999999,'épique']]){
  const p=ready(),result=buyCardPack(p,'aube-evolution',draws([roll,.999999]));
  assert.equal(result.ok,true);assert.deepEqual(result.cards.map(kind),[expected,expected,expected]);
  assert.ok(result.cards.every(ref=>cardKey(ref)===cardKey(result.cards[0])));
 }
 const p=ready();p.gold=190*100;const counts={native:0,rare:0,'épique':0};
 for(let i=0;i<100;i++)for(const ref of buyCardPack(p,'aube-evolution',draws([(i+.5)/100,.5])).cards)counts[kind(ref)]++;
 assert.deepEqual(counts,{native:180,rare:105,'épique':15});assert.equal(p.gold,0);
});

test('Achat mixte : un seul débit, trois stocks de Milicien distincts et aucune autre progression modifiée',()=>{
 const p=ready(),before=structuredClone(p),result=buyCardPack(p,'aube-evolution',draws([0,0,.6,0,.95,0]));
 assert.deepEqual(result.cards,['militia',{id:'militia',rarity:'rare'},{id:'militia',rarity:'épique'}]);
 const expected=structuredClone(before);expected.gold-=190;expected.collection.militia++;
 expected.evolvedCollection={'militia:rare':1,'militia:épique':1};assert.deepEqual(p,expected);
 assert.deepEqual(validateImportedProfile(p),p);storage();assert(saveProfile(p));assert.deepEqual(loadProfile(),p);
});

test('Boss, fonds, combat actif et résultat en attente : refus avant tout tirage ou changement',()=>{
 for(const reason of ['boss','gold','active','pending','unknown']){
  const p=ready();let battle=null,id='aube-evolution',calls=0;
  if(reason==='boss'){p.completed=['01','02'];p.unlocked=12;}
  if(reason==='gold')p.gold=189;if(reason==='active')battle={status:'active'};
  if(reason==='pending')battle={status:'victory'};if(reason==='unknown')id='inventé';
  const before=structuredClone(p);assert.equal(buyCardPack(p,id,()=>{calls++;return 0},battle).ok,false,reason);
  assert.equal(calls,0);assert.deepEqual(p,before,reason);
 }
 const p=freshProfile();assert.equal(buyPack(p,()=>0).ok,true,'le paquet mystique reste accessible avant le boss');
});

test('Tirage invalide, exception et stock saturé : transaction entière refusée sans aucun débit',()=>{
 for(const invalid of [-1,1,NaN,Infinity]){
  const p=ready(),before=structuredClone(p);assert.equal(buyCardPack(p,'aube-evolution',draws([.6,invalid])).ok,false);assert.deepEqual(p,before);
 }
 const p=ready(),before=structuredClone(p);let calls=0;
 assert.equal(buyCardPack(p,'aube-evolution',()=>{if(++calls===5)throw Error('coupure');return .6}).ok,false);assert.deepEqual(p,before);
 for(const amount of [99998,100000,-1,1.5,NaN,null]){
  const capped=ready();capped.evolvedCollection={'militia:rare':amount};const old=structuredClone(capped);
  assert.equal(buyCardPack(capped,'aube-evolution',draws([.6,0])).ok,false,String(amount));assert.deepEqual(capped,old);
 }
});

test('Chaque évolution peut réellement être tirée, mise au deck, invoquée et reprise ; aucun rang supplémentaire activé',()=>{
 const pack=cardPack('aube-evolution');
 for(const group of pack.groups.filter(g=>typeof g.cards[0]==='object'))for(const [index,ref] of group.cards.entries()){
  const p=ready(),roll=ref.rarity==='rare'?.7:.97;
  const result=buyCardPack(p,pack.id,draws([roll,(index+.5)/group.cards.length]));
  assert.equal(result.ok,true);assert.deepEqual(result.cards,[ref,ref,ref]);assert.equal(ownedCardCopies(p,ref),3);
  assert.equal(modifyDeck(p,ref,1),true);const b=createBattle(p,CAMPAIGN[0],1);b.heroes.p.hand=[{...ref,wait:0}];
  assert.equal(playPlayerCard(b,0,0,1).ok,true);const u=b.board[0][1],def=resolveUnitDefinition(ref);
  assert.equal(u.rarity,ref.rarity);assert.deepEqual([u.atk,u.hp],[def.stats.attack,def.stats.hp]);
  storage();assert(storeBattle(b));assert.deepEqual(restoreBattle(),b);
 }
 assert.ok(pack.groups.every(g=>g.cards.every(ref=>typeof ref==='string'||ref.rarity!=='légendaire')));
 assert.equal(playableCardReference({id:'ranger',rarity:'divine'}),false);
 assert.equal(playableCardReference({id:'wolf',rarity:'divine'}),false);
});

test('Les doublons de paquet alimentent la fusion, sans épreuve accomplie ni gain supplémentaire',()=>{
 const p=ready(),before=structuredClone(p);
 buyCardPack(p,'aube-evolution',draws([.6,0]));
 assert.equal(p.evolvedCollection['militia:rare'],3);assert.equal(fuseEvolutionCopies(p,'militia:épique').ok,true);
 assert.equal(p.evolvedCollection['militia:rare'],0);assert.equal(p.evolvedCollection['militia:épique'],1);
 assert.equal(p.gold,before.gold-190);assert.deepEqual(p.collection,before.collection);assert.deepEqual(p.deck,before.deck);
 assert.equal(p.completedTrials,undefined);
});

test('Trois Épiques du paquet deviennent une Légendaire après le deuxième boss, sans modifier le paquet',()=>{
 const p=ready();p.completed.push('06');const before=structuredClone(p);
 const result=buyCardPack(p,'aube-evolution',draws([.95,0]));assert.equal(result.ok,true);
 assert.deepEqual(result.cards,Array.from({length:3},()=>({id:'militia',rarity:'épique'})));
 assert.equal(fuseEvolutionCopies(p,'militia:légendaire').ok,true);
 const expected=structuredClone(before);expected.gold-=190;
 expected.evolvedCollection={'militia:épique':0,'militia:légendaire':1};assert.deepEqual(p,expected);
});

function controller(){
 let profile=ready(),battle=null,saves=0,fail=false,modal='',message='';
 const handle=createCardPackController(()=>({profile,battle}),{btn:()=>'',cardUI:()=>'',esc:s=>s,showModal:s=>{modal=s},hideModal:()=>{modal=''},refresh:()=>{},toast:s=>{message=s},random:draws([0,0,.6,0,.95,0]),commitProfile:next=>{saves++;if(fail)return false;profile=next;return true;}});
 return {handle,get profile(){return profile},get saves(){return saves},get modal(){return modal},get message(){return message},set fail(v){fail=v},set battle(v){battle=v}};
}
test('Confirmation, annulation et double validation : une seule ouverture adoptée, aucun achat implicite',()=>{
 const c=controller(),before=structuredClone(c.profile);
 c.handle('card-pack-confirm');assert.equal(c.saves,0);
 c.handle('card-pack-preview',{id:'aube-evolution'});assert.match(c.modal,/190 or/);assert.match(c.modal,/5 %/);assert.deepEqual(c.profile,before);
 c.handle('close-modal');c.handle('card-pack-confirm');assert.equal(c.saves,0);
 c.handle('card-pack-preview',{id:'aube-evolution'});c.handle('card-pack-confirm');const once=structuredClone(c.profile);
 c.handle('card-pack-confirm');c.handle('buy-pack');assert.equal(c.saves,1);assert.deepEqual(c.profile,once);
});
test('Panne de sauvegarde et modification de fonds/combat après confirmation : aucune perte du profil courant',()=>{
 for(const change of ['storage','gold','battle']){
  const c=controller();c.handle('card-pack-preview',{id:'aube-evolution'});
  if(change==='storage')c.fail=true;if(change==='gold')c.profile.gold=0;if(change==='battle')c.battle={status:'active'};
  const before=structuredClone(c.profile);c.handle('card-pack-confirm');assert.deepEqual(c.profile,before);assert.ok(c.message);
  assert.equal(c.saves,change==='storage'?1:0);assert.equal(c.modal,'');
 }
 const c=controller();c.fail=true;const old=structuredClone(c.profile);c.handle('buy-pack');assert.deepEqual(c.profile,old);
});
