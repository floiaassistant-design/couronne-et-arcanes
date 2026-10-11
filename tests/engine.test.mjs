import test from 'node:test';
import assert from 'node:assert/strict';
import {CAMPAIGN,CARDS,CLASSES,towerMission,TOWER_MAX} from '../src/data.js';
import {freshProfile,normalizeProfile,validateDeck,modifyDeck,createBattle,playPlayerCard,endPlayerTurn,usePower,formationBonus,completeBattle,buyPack,upgradeCard,upgradeBuilding,EQUIPMENT,craftEquipment,equipEquipment,reputationLevel,FUSION_COSTS,extractCard,fuseCard} from '../src/engine.js';
const mk=(seed=42)=>createBattle(freshProfile(),CAMPAIGN[0],seed);
test('60 original cards and 12 missions',()=>{
 assert.equal(Object.keys(CARDS).length,60);assert.equal(CAMPAIGN.length,12);
 assert.equal(new Set(Object.keys(CARDS)).size,60);
 for(const m of CAMPAIGN){assert.ok(m.deck.every(id=>CARDS[id]));assert.ok(CARDS[m.unlock]);}
});
test('default deck is valid and campaign can begin',()=>{
 const p=freshProfile();assert.equal(validateDeck(p),'');
 const b=createBattle(p,CAMPAIGN[0],123);assert.equal(b.status,'active');
 assert.equal(b.heroes.p.hand.length,5);assert.equal(b.heroes.e.hand.length,5);
 assert.equal(b.board.length,3);assert.equal(b.board[0].length,7);
});
test('deck edition respects owned copies and limits',()=>{
 const p=freshProfile();assert.equal(modifyDeck(p,'dragon',1),false);
 assert.equal(modifyDeck(p,'bone',1),true);
 assert.equal(validateDeck(p),'');
 assert.equal(modifyDeck(p,'militia',1),false);
 assert.equal(modifyDeck(p,'bone',-1),true);
});
test('playing creature into lane and avoiding occupied deployment',()=>{
 const b=mk();b.heroes.p.hand=[{id:'militia',wait:0},{id:'militia',wait:0},{id:'militia',wait:0}];
 assert.equal(playPlayerCard(b,0,1).ok,true);assert.equal(b.board[1][1].id,'militia');
 assert.equal(playPlayerCard(b,0,1).ok,false);
 assert.equal(playPlayerCard(b,0,2).ok,true);
 assert.equal(playPlayerCard(b,0,0).ok,false);
});
test('countdown prohibits premature deployment',()=>{
 const b=mk();b.heroes.p.hand=[{id:'dragon',wait:3}];
 assert.equal(playPlayerCard(b,0,0).ok,false);
 for(let i=0;i<3;i++)endPlayerTurn(b);
 assert.equal(b.heroes.p.hand[0].wait,0);
});
test('hero powers affect health or opponent',()=>{
 const b=mk();b.heroes.p.hp=9;
 assert.equal(usePower(b).ok,true);assert.equal(b.heroes.p.hp,13);
 assert.equal(usePower(b).ok,false);
});
test('victory yields resources and one-time first clear card',()=>{
 const p=freshProfile(),b=mk();b.status='victory';
 const won=completeBattle(p,CAMPAIGN[0],b);
 assert.equal(won.victory,true);assert.equal(won.card,'wolf');
 assert.equal(p.unlocked,2);assert.equal(p.collection.wolf,3);
 const second=completeBattle(p,CAMPAIGN[0],b);assert.equal(second.card,null);
});
test('defeat yields consolation and does not unlock',()=>{
 const p=freshProfile(),b=mk();b.status='defeat';
 const lose=completeBattle(p,CAMPAIGN[0],b);
 assert.equal(lose.gold,10);assert.equal(p.unlocked,1);
});
test('packs, card improvement and building upgrades have real costs',()=>{
 const p=freshProfile();const pack=buyPack(p,()=>0);
 assert.equal(pack.cards.length,3);assert.equal(p.gold,15);
 const up=upgradeCard(p,'militia');assert.equal(up.ok,true);assert.equal(p.shards,15);
 assert.equal(upgradeCard(p,'militia').ok,false);
 assert.equal(upgradeBuilding(p,'bastion').ok,false);
});
test('battle has no invalid occupants after many turns',()=>{
 const b=mk(7811);
 for(let i=0;i<45&&b.status==='active';i++){
   // Player side opportunistic plays to exercise all subsystems.
   for(let j=0;j<2;j++){
     const idx=b.heroes.p.hand.findIndex(h=>h.wait===0);
     if(idx>=0){for(let lane=0;lane<3;lane++)if(playPlayerCard(b,idx,lane).ok)break;}
   }
   endPlayerTurn(b);
   assert.ok(b.heroes.p.hp>=0&&b.heroes.e.hp>=0);
   for(const row of b.board)for(const u of row)if(u){assert.ok(CARDS[u.id]);assert.ok(u.hp>0);assert.ok(u.side==='p'||u.side==='e');}
 }
 assert.ok(['active','victory','defeat'].includes(b.status));
});
test('profile loading removes unknown cards and repairs missing fields',()=>{
 const p=normalizeProfile({deck:['militia','unrecognized'],collection:{unknown:2},heroClass:'x'});
 assert.deepEqual(p.deck,['militia']);assert.equal(p.heroClass,'gardien');
});

test('four hero classes and twenty valid procedural tower floors',()=>{
 assert.equal(Object.keys(CLASSES).length,4);assert.equal(TOWER_MAX,20);
 for(let i=1;i<=TOWER_MAX;i++){
  const m=towerMission(i);
  assert.equal(m.mode,'tower');assert.equal(m.floor,i);assert.ok(m.deck.length>=16);
  assert.ok(m.deck.every(id=>CARDS[id]),`invalid floor ${i}`);
 }
 assert.throws(()=>towerMission(21));
});
test('tower victory unlocks the next stage and only grants first-clear card once',()=>{
 const p=freshProfile();const m=towerMission(5);const b=createBattle(p,m,987);b.status='victory';
 const r=completeBattle(p,m,b);
 assert.equal(r.card,'scoutcaptain');assert.equal(p.collection.scoutcaptain,1);
 assert.equal(p.towerUnlocked,6);assert.deepEqual(p.towerCleared,[5]);
 const r2=completeBattle(p,m,b);assert.equal(r2.card,null);assert.equal(p.collection.scoutcaptain,1);
});
test('equipment crafting consumes resources, buffs battle and switches slot',()=>{
 const p=freshProfile();assert.equal(craftEquipment(p,'lame').ok,true);
 assert.equal(p.equipped.arme,'lame');assert.equal(p.gold,25);assert.equal(p.shards,30);
 assert.equal(craftEquipment(p,'lame').ok,false);
 const b=createBattle(p,CAMPAIGN[0],125);b.heroes.p.hand=[{id:'militia',wait:0}];
 assert.equal(playPlayerCard(b,0,0).ok,true);assert.equal(b.board[0][1].atk,CARDS.militia.attack+1);
 p.gold=500;p.shards=500;assert.equal(craftEquipment(p,'baton').ok,true);
 assert.equal(equipEquipment(p,'lame').ok,true);assert.equal(p.equipped.arme,'lame');
});
test('faction reputation grows and boosts faction life on next battle',()=>{
 const p=freshProfile(),m=CAMPAIGN[0],b=createBattle(p,m,667);b.status='victory';
 const r=completeBattle(p,m,b);assert.ok(r.reputation.length);assert.ok(p.reputation.aube>0);
 p.reputation.aube=30;assert.equal(reputationLevel(p,'aube'),2);
 const next=createBattle(p,m,668);next.heroes.p.hand=[{id:'militia',wait:0}];
 playPlayerCard(next,0,0);assert.equal(next.board[0][1].maxhp,CARDS.militia.hp+2);
});
test('legacy profile normalization gets new persistent defaults',()=>{
 const p=normalizeProfile({version:1,collection:{militia:4},deck:['militia'],buildings:{forge:1}});
 assert.equal(p.towerUnlocked,1);assert.deepEqual(p.towerCleared,[]);
 assert.equal(p.reputation.ether,0);assert.equal(p.equipped.arme,null);
});
test('cleric hero power heals selected wounded allies',()=>{
 const p=freshProfile();p.heroClass='clerc';const b=createBattle(p,CAMPAIGN[0],871);
 b.heroes.p.hand=[{id:'militia',wait:0}];playPlayerCard(b,0,0);
 b.board[0][1].hp=1;b.heroes.p.hp=10;
 assert.equal(usePower(b).ok,true);assert.equal(b.heroes.p.hp,13);
 assert.equal(b.board[0][1].hp,4);
});

test('alchemy recipes are deterministic and pay their cost',()=>{
 const p=freshProfile();p.gold=200;p.shards=200;
 const cost=FUSION_COSTS[CARDS.lancer.rarity];
 const r=fuseCard(p,'lancer');assert.equal(r.ok,true);
 assert.equal(p.collection.lancer,1);assert.equal(p.gold,200-cost.gold);
 assert.equal(p.shards,200-cost.shards);
 assert.equal(fuseCard(p,'nonexistent').ok,false);
});
test('alchemy extraction protects active deck and recycles spare copies',()=>{
 const p=freshProfile();assert.equal(extractCard(p,'militia').ok,false);
 assert.equal(extractCard(p,'thorn').ok,true);
 assert.equal(p.collection.thorn,0);assert.equal(p.shards,58);
 assert.equal(extractCard(p,'thorn').ok,false);
});


test('concorde activates for two living allies of the same faction in one lane',()=>{
 const b=mk(220);
 const u=(id,side='p')=>({uid:++b.nextUnitId,id,side,hp:5,maxhp:5,atk:2,armor:0,ranged:false,ability:'none',stun:0,poison:0,poisonTurns:0});
 const first=u('militia');b.board[0][1]=first;
 assert.equal(formationBonus(b,0,first),0);
 const different=u('wolf');b.board[0][2]=different;
 assert.equal(formationBonus(b,0,first),0,'different orders do not combine');
 b.board[0][2]=u('shield');
 assert.equal(formationBonus(b,0,first),1);
 assert.equal(formationBonus(b,0,b.board[0][2]),1);
 assert.equal(formationBonus(b,1,first),0,'not on another lane');
 b.board[0][2].hp=0;
 assert.equal(formationBonus(b,0,first),0,'bonus vanishes when ally is defeated');
});

test('concorde adds exactly one attack damage, not permanent attack stats',()=>{
 const b=mk(221);
 const u=(uid,col)=>({uid,id:'militia',side:'p',hp:5,maxhp:5,atk:2,armor:0,ranged:false,ability:'none',stun:0,poison:0,poisonTurns:0});
 b.board[0][5]=u(900,5);b.board[0][4]=u(901,4);
 b.heroes.e.hand=[];b.heroes.e.deck=[];b.heroes.e.discard=[];
 b.heroes.p.hand=[];b.heroes.p.deck=[];b.heroes.p.discard=[];
 const before=b.heroes.e.hp;
 assert.equal(formationBonus(b,0,b.board[0][5]),1);
 endPlayerTurn(b);
 assert.equal(b.heroes.e.hp,before-3);
 assert.equal(b.board[0][5].atk,2,'attack is unchanged permanently');
 b.board[0][4]=null;
 assert.equal(formationBonus(b,0,b.board[0][5]),0);
 const remaining=b.heroes.e.hp;
 endPlayerTurn(b);
 assert.equal(b.heroes.e.hp,remaining-2,'no lingering bonus after formation breaks');
});

test('enemy formations receive the same tactical bonus as player',()=>{
 const b=mk(222);
 const u=(uid,id)=>({uid,id,side:'e',hp:5,maxhp:5,atk:2,armor:0,ranged:false,ability:'none',stun:0,poison:0,poisonTurns:0});
 b.board[2][1]=u(910,'militia');b.board[2][2]=u(911,'shield');
 b.heroes.e.hand=[];b.heroes.e.deck=[];b.heroes.e.discard=[];
 b.heroes.p.hand=[];b.heroes.p.deck=[];b.heroes.p.discard=[];
 const before=b.heroes.p.hp;
 assert.equal(formationBonus(b,2,b.board[2][1]),1);
 endPlayerTurn(b);
 assert.equal(b.heroes.p.hp,before-3);
});

test('V1.3 emits real spawn and spell visuals without changing combat balance',()=>{
 const b=mk(113);b.vfx=[];
 b.heroes.p.hand=[{id:'militia',wait:0},{id:'firebolt',wait:0}];
 assert.equal(playPlayerCard(b,0,0).ok,true);
 assert.ok(b.vfx.some(e=>e.type==='spawn'&&e.lane===0&&e.col===1));
 assert.equal(playPlayerCard(b,0,1).ok,true);
 assert.ok(b.vfx.some(e=>e.type==='spell'&&e.variant==='spell_bolt'&&e.lane===1));
 assert.equal(b.heroes.e.hp, CAMPAIGN[0].hp-2);
});

test('V1.3 traces real projectile, movement and impacts on an active lane',()=>{
 const b=mk(114);b.vfx=[];
 b.heroes.e.hand=[];b.heroes.e.deck=[];b.heroes.e.discard=[];
 b.board[0][1]={uid:802,id:'archer',side:'p',atk:2,hp:4,maxhp:4,armor:0,ranged:true,ability:'ranged',stun:0,poison:0,poisonTurns:0};
 b.board[0][3]={uid:803,id:'bone',side:'e',atk:2,hp:9,maxhp:9,armor:0,ranged:false,ability:'',stun:0,poison:0,poisonTurns:0};
 assert.equal(endPlayerTurn(b).ok,true);
 assert.ok(b.vfx.some(e=>e.type==='move'&&e.side==='e'&&e.lane===0&&e.from===3&&e.to===2));
 assert.ok(b.vfx.some(e=>e.type==='attack'&&e.side==='p'&&e.ranged&&e.lane===0&&e.from===1&&e.to===2));
 assert.ok(b.vfx.some(e=>e.type==='attack'&&e.side==='e'&&!e.ranged));
 assert.equal(b.board[0][2].hp,7);
});

test('V1.3 visual trace is optional and does not mutate any gameplay outcomes',()=>{
 const a=mk(115),b=mk(115);b.vfx=[];
 endPlayerTurn(a);endPlayerTurn(b);
 assert.ok(b.vfx.length>0);
 delete b.vfx;
 assert.deepEqual(b,a);
});


test('V1.5 guard units intercept attacks aimed at the hero on their lane',()=>{
 const b=mk(301);
 b.heroes.e.hand=[];b.heroes.e.deck=[];b.heroes.e.discard=[];
 b.heroes.p.hand=[];b.heroes.p.deck=[];b.heroes.p.discard=[];
 b.board[1][5]={uid:1001,id:'militia',side:'e',atk:3,hp:5,maxhp:5,armor:0,ranged:false,ability:'',flight:false,guard:false,stun:0,poison:0,poisonTurns:0};
 b.board[1][4]={uid:1002,id:'shield',side:'p',atk:1,hp:9,maxhp:9,armor:2,ranged:false,ability:'armor',flight:false,guard:true,stun:0,poison:0,poisonTurns:0};
 const heroBefore=b.heroes.p.hp;
 endPlayerTurn(b);
 assert.equal(b.heroes.p.hp,heroBefore,'hero is protected by the guard');
 assert.ok(b.board[1][4].hp<9,'guard took the hit instead');
});

test('V1.5 flying units can leap over one occupied square while moving',()=>{
 const b=mk(302);
 b.heroes.e.hand=[];b.heroes.e.deck=[];b.heroes.e.discard=[];
 b.heroes.p.hand=[];b.heroes.p.deck=[];b.heroes.p.discard=[];
 b.board[0][1]={uid:1010,id:'griffin',side:'p',atk:5,hp:6,maxhp:6,armor:0,ranged:false,ability:'haste',flight:true,guard:false,stun:0,poison:0,poisonTurns:0};
 b.board[0][2]={uid:1011,id:'militia',side:'p',atk:2,hp:5,maxhp:5,armor:0,ranged:false,ability:'',flight:false,guard:false,stun:2,poison:0,poisonTurns:0};
 endPlayerTurn(b);
 assert.equal(b.board[0][4]?.id,'griffin');
 assert.equal(b.board[0][2]?.id,'militia');
});


test('V1.5 flight is blocked by enemy contact and cannot overwrite enemies',()=>{
 const b=mk(303);
 b.heroes.e.hand=[];b.heroes.e.deck=[];b.heroes.e.discard=[];
 b.heroes.p.hand=[];b.heroes.p.deck=[];b.heroes.p.discard=[];
 const bird={uid:1100,id:'griffin',side:'p',atk:5,hp:6,maxhp:6,armor:0,ranged:false,ability:'haste',stun:0,poison:0,poisonTurns:0};
 const enemy={uid:1101,id:'bone',side:'e',atk:3,hp:20,maxhp:20,armor:0,ranged:false,ability:'',stun:0,poison:0,poisonTurns:0};
 b.board[0][1]=bird;b.board[0][2]=enemy;
 endPlayerTurn(b);
 assert.equal(b.board[0][1]?.uid,1100,'flying unit stops to fight adjacent enemy');
 assert.equal(b.board[0][2]?.uid,1101,'enemy is not replaced by flying movement');
});

test('V1.5 guard protects AI crown and is lane-specific',()=>{
 const b=mk(304);
 b.heroes.e.hand=[];b.heroes.e.deck=[];b.heroes.e.discard=[];
 b.heroes.p.hand=[];b.heroes.p.deck=[];b.heroes.p.discard=[];
 b.board[0][5]={uid:1200,id:'militia',side:'p',atk:3,hp:10,maxhp:10,armor:0,ranged:false,ability:'',stun:0,poison:0,poisonTurns:0};
 b.board[0][1]={uid:1201,id:'golem',side:'e',atk:2,hp:12,maxhp:12,armor:2,ranged:false,ability:'armor',stun:2,poison:0,poisonTurns:0};
 b.board[2][1]={uid:1202,id:'golem',side:'e',atk:2,hp:12,maxhp:12,armor:2,ranged:false,ability:'armor',stun:2,poison:0,poisonTurns:0};
 const before=b.heroes.e.hp;
 endPlayerTurn(b);
 assert.equal(b.heroes.e.hp,before,'guard protects hero from attack on same lane');
 assert.equal(b.board[0][1]?.hp,11,'guard absorbs attack and armor');
 assert.equal(b.board[2][1]?.hp,12,'guard in another lane unaffected');
 b.board[0][1]=null;
 const health=b.heroes.e.hp;
 endPlayerTurn(b);
 assert.equal(b.heroes.e.hp,health-3,'hero exposed once guard is gone, despite other lane guard');
});
