import test from 'node:test';
import assert from 'node:assert/strict';
import {CARDS,CAMPAIGN,GUARD_IDS,RIPOSTE_IDS,towerMission} from '../src/data.js';
import {freshProfile,createBattle,playPlayerCard,playEnemyCard,endPlayerTurn,finishEnemyTurn,usePower,beginDungeon,nextDungeonBattle,completeBattle,formationBonus} from '../src/engine.js';
import {CARD_RULESET,resolveUnitDefinition,resolveRulesDefinition} from '../src/cards/definitions.js';
import {findCrownGuardian} from '../src/engine/guard-candidates.js';
import {resolveRetaliation} from '../src/engine/battle-defense.js';
import {freshLab,createLabBattle} from '../src/engine/developer-lab.js';
import {cardPresentation,boardInspectionData} from '../src/ui/card-presentation.js';
import {SAVE_KEY,BATTLE_KEY,PREVIOUS_GAME_KEY,saveProfile,storeBattle,restoreBattle,storedBattleNeedsRestart,hasPreviousAdventure,restorePreviousAdventure} from '../src/ui/storage.js';
const storage=()=>{const data={};globalThis.localStorage={getItem:k=>data[k]??null,setItem:(k,v)=>{data[k]=String(v);},removeItem:k=>{delete data[k];}};return data;};
function battle(){const b=createBattle(freshProfile(),{...CAMPAIGN[0],deck:[]},17,{turnFlow:'alternating'});for(const h of Object.values(b.heroes))Object.assign(h,{hp:100,maxhp:100,deck:[],discard:[],hand:[]});b.vfx=[];return b;}
function summon(b,id,side='p'){
 b.heroes[side].cardsPlayed=0;b.heroes[side].hand=[{id,wait:0}];b.phase=side==='p'?'player':'enemy';
 const next=b.nextUnitId,col=[1,2,3].find(c=>!b.board[0][c]);
 const result=side==='p'?playPlayerCard(b,0,0,col):playEnemyCard(b);assert.equal(result.ok,true);
 const u=b.board.flat().find(x=>x?.id===id&&x.side===side&&x.uid>=next);assert(u);
 for(const row of b.board)for(let i=1;i<row.length-1;i++)if(row[i]===u)row[i]=null;
 return u;
}

test('Aventure, Tour, donjon, épreuve et laboratoire partagent la seule révision active',()=>{
 const p=freshProfile();beginDungeon(p,'ysara');
 const encounters=[createBattle(p,CAMPAIGN[0],1),createBattle(p,towerMission(1),1),nextDungeonBattle(p,1),createBattle(p,{...CAMPAIGN[0],mode:'evolution-trial'},1),createLabBattle(freshLab(),1)];
 for(const b of encounters)assert.equal(b.cardRules,CARD_RULESET);
 for(const c of Object.values(CARDS).filter(c=>c.type==='unité')){
  assert.strictEqual(resolveRulesDefinition(c.id),resolveUnitDefinition(c.id));
  assert.deepEqual(resolveUnitDefinition(c.id).stats,{attack:c.attack,hp:c.hp,delay:c.delay});
 }
});

test('Cinq gardiens réellement invoqués, deux camps : position, même ligne et priorité uniques dès le rang natif',()=>{
 for(const id of GUARD_IDS)for(const side of ['p','e']){
  const b=battle(),u=summon(b,id,side),near=side==='p'?1:10,far=side==='p'?3:8,attacker=side==='p'?5:6;
  b.board[0][near]=u;assert.equal(findCrownGuardian(b,0,side,attacker).u,u,id);
  const second=summon(b,id,side);b.board[0][far]=second;
  assert.equal(findCrownGuardian(b,0,side,attacker).u,u,'plus proche de sa couronne : '+id);
  assert.equal(findCrownGuardian(b,1,side,attacker),null,'aucune protection interligne native');
  assert.equal(findCrownGuardian(b,0,side,side==='p'?1:10),null,'gardes dépassées');
 }
});

test('Natifs réellement invoqués : un gardien à distance ne détourne plus une attaque contre une unité',()=>{
 for(const id of GUARD_IDS)for(const side of ['p','e']){
  const b=battle(),foe=side==='p'?'e':'p',archer=summon(b,'archer',side),victim=summon(b,'militia',foe),guard=summon(b,id,foe);
  const from=side==='p'?4:7,dir=side==='p'?1:-1;
  victim.hp=victim.maxhp=30;victim.stun=guard.stun=99;
  b.board[0][from]=archer;b.board[0][from+dir]=victim;b.board[0][from+2*dir]=guard;
  const before=guard.hp;b.phase=side==='p'?'player':'enemy';
  (side==='p'?endPlayerTurn:finishEnemyTurn)(b);
  assert.equal(victim.hp,28,id);assert.equal(guard.hp,before,id);
 }
});

test('Sept unités à Riposte réellement invoquées : ATQ + Concorde + Ralliement, sans Charge, deux camps et quota repris',()=>{
 for(const id of RIPOSTE_IDS)for(const side of ['p','e']){
  const b=battle(),foeSide=side==='p'?'e':'p',u=summon(b,id,side),foe=summon(b,'militia',foeSide),ally=summon(b,id,side);
  u.atk=7;u.rallyUntil=b.round;u.movedThisRound=true;foe.hp=foe.maxhp=100;
  b.board[0][4]=u;b.board[0][5]=foe;b.board[0][1]=ally;
  const bonus=formationBonus(b,0,u)+1;assert.equal(bonus,2);
  assert.equal(resolveRetaliation(b,u,foe,0,4,5,bonus),true);assert.equal(foe.hp,91,id);
  const copy=JSON.parse(JSON.stringify(b));assert.equal(resolveRetaliation(copy,copy.board[0][4],copy.board[0][5],0,4,5,bonus),false);
  copy.round++;assert.equal(resolveRetaliation(copy,copy.board[0][4],copy.board[0][5],0,4,5,0),true);assert.equal(copy.board[0][5].hp,84);
 }
});

test('Fiches natives des cinq factions : règles communes avant pose et sur le plateau, profil intact',()=>{
 const p=freshProfile(),before=JSON.stringify(p);
 for(const id of new Set([...GUARD_IDS,...RIPOSTE_IDS])){
  const b=battle(),u=summon(b,id);b.board[0][1]=u;
  for(const sheet of [cardPresentation(id,{profile:p}),cardPresentation({id,rarity:CARDS[id].rarity},{profile:p}),boardInspectionData(b,u.uid)]){
   const text=sheet.details.join(' ');assert.doesNotMatch(text,/historique|2 dégâts fixes/);
   if(GUARD_IDS.has(id))assert.match(text,/entre l’attaquant et la couronne/);
   if(RIPOSTE_IDS.has(id))assert.match(text,/ATQ effective.*sans Charge.*une fois par tour/);
  }
 }
 assert.equal(JSON.stringify(p),before);
});

test('Ancien combat actif : aucune action ni reprise, détection sans suppression du profil ou du combat',()=>{
 const data=storage(),p=freshProfile();p.upgrades.shield=3;p.mastery.shield=22;saveProfile(p);
 for(const tag of [undefined,'aube-v1','unknown']){
  const b=battle();if(tag===undefined)delete b.cardRules;else b.cardRules=tag;
  data[BATTLE_KEY]=JSON.stringify(b);const before=JSON.stringify({p,b,data});
  assert.equal(restoreBattle(),null);assert(storedBattleNeedsRestart());
  for(const action of [x=>playPlayerCard(x,0,0),endPlayerTurn,usePower,x=>{x.phase='enemy';return playEnemyCard(x);},x=>{x.phase='enemy';return finishEnemyTurn(x);}]){
   const copy=structuredClone(b);if(action===endPlayerTurn||action===usePower)copy.phase='player';
   const phase=copy.phase;const result=action(copy);assert.equal(result.ok,false);assert.match(result.reason,/relancé/);
   copy.phase=phase;assert.deepEqual(copy,b);
  }
  assert.equal(JSON.stringify({p,b,data}),before);
 }
 assert.equal(JSON.parse(data[SAVE_KEY]).mastery.shield,22);
});

test('Partie précédente : profil ancien récupérable, seul son combat obsolète demande relance',()=>{
 const data=storage(),current=freshProfile(),old=freshProfile();old.gold=1234;old.collection.shield=7;
 const b=battle();delete b.cardRules;saveProfile(current);
 data[PREVIOUS_GAME_KEY]=JSON.stringify({profile:JSON.stringify(old),battle:JSON.stringify(b)});
 assert(hasPreviousAdventure());assert(restorePreviousAdventure());assert.equal(restoreBattle(),null);assert(storedBattleNeedsRestart());
 assert.deepEqual(JSON.parse(data[SAVE_KEY]),old);
 assert.equal(JSON.parse(JSON.parse(data[PREVIOUS_GAME_KEY]).profile).gold,current.gold);
 assert(storeBattle(null));assert.equal(data[BATTLE_KEY],undefined);assert.deepEqual(JSON.parse(data[SAVE_KEY]),old);
});

test('Ancien résultat déjà terminé : récupération du butin une fois, sans rejouer les anciennes règles',()=>{
 storage();const p=freshProfile(),b=createBattle(p,CAMPAIGN[0],1);delete b.cardRules;
 b.status='victory';b.phase='finished';b.heroes.e.hp=0;storeBattle(b);
 const restored=restoreBattle();assert(restored);assert.equal(storedBattleNeedsRestart(),false);
 completeBattle(p,CAMPAIGN[0],restored);const before=JSON.stringify(p);
 completeBattle(p,CAMPAIGN[0],restored);assert.equal(JSON.stringify(p),before);assert.equal(p.wins,1);
});
