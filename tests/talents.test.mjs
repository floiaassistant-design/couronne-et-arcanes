import {createBattle} from './fixtures/legacy-battle.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {TALENT_TREE,TALENT_LEVELS,normalizeTalentChoices,chosenTalents} from '../src/talents.js';
import {CAMPAIGN} from '../src/data.js';
import {freshProfile,normalizeProfile,heroLevel,HERO_LEVEL_THRESHOLD,chooseHeroTalent,usePower} from '../src/engine.js';

const prof=(hero='gardien',level=8)=>{const p=freshProfile();p.heroClass=hero;p.heroXp=HERO_LEVEL_THRESHOLD(level);return p;};
const mk=(hero='gardien',ids=[],level=8)=>{const p=prof(hero,level);for(const id of ids)assert.equal(chooseHeroTalent(p,id).ok,true);return createBattle(p,CAMPAIGN[0],7289);};
const unit=(uid,id,side='e',hp=8)=>({uid,id,side,hp,maxhp:10,atk:2,armor:0,ranged:false,ability:'',stun:0,poison:0,poisonTurns:0});

test('V2.3 has four classes, two exclusive branches at two levels',()=>{
 assert.deepEqual(TALENT_LEVELS,{1:4,2:8});
 assert.equal(Object.keys(TALENT_TREE).length,4);
 for(const [hero,list] of Object.entries(TALENT_TREE)){
  assert.equal(list.length,4,hero);
  for(const tier of [1,2])assert.equal(list.filter(x=>x.tier===tier).length,2,`${hero}/${tier}`);
 }
});
test('V2.3 talents are locked until hero reaches 4 or 8',()=>{
 const p=prof('gardien',1);
 assert.equal(heroLevel(p),1);
 assert.equal(chooseHeroTalent(p,'gardien_rempart').ok,false);
 p.heroXp=HERO_LEVEL_THRESHOLD(4);
 assert.equal(chooseHeroTalent(p,'gardien_rempart').ok,true);
 assert.equal(chooseHeroTalent(p,'gardien_barriere').ok,false);
 p.heroXp=HERO_LEVEL_THRESHOLD(8);
 assert.equal(chooseHeroTalent(p,'gardien_barriere').ok,true);
});
test('V2.3 choices are exclusive per tier, free to switch, and class-specific',()=>{
 const p=prof();
 assert.equal(chooseHeroTalent(p,'gardien_rempart').ok,true);
 assert.equal(chooseHeroTalent(p,'gardien_serment').ok,true);
 assert.deepEqual(chosenTalents(p,8),['gardien_serment']);
 assert.equal(chooseHeroTalent(p,'arcaniste_focus').ok,false);
 p.heroClass='arcaniste';
 assert.equal(chooseHeroTalent(p,'arcaniste_focus').ok,true);
 assert.deepEqual(chosenTalents(p,8),['arcaniste_focus']);
 p.heroClass='gardien';
 assert.deepEqual(chosenTalents(p,8),['gardien_serment']);
});
test('V2.3 sanitizes malformed previous imported talent fields',()=>{
 const raw={deck:freshProfile().deck,collection:freshProfile().collection,heroClass:'gardien',heroXp:HERO_LEVEL_THRESHOLD(8),talents:{gardien:{1:'arcaniste_focus',2:'gardien_sentinelle'},rodeur:{1:'rodeur_precision',2:'wrong'},arcaniste:'bad'}};
 const p=normalizeProfile(raw);
 assert.deepEqual(p.talents,{gardien:{2:'gardien_sentinelle'},rodeur:{1:'rodeur_precision'}});
 assert.deepEqual(chosenTalents(normalizeProfile({}),1),[]);
 assert.deepEqual(normalizeTalentChoices(['wrong']),{});
});
test('V2.3 snapshots choices when battle starts and legacy battle has no talents',()=>{
 const p=prof();chooseHeroTalent(p,'gardien_rempart');
 const b=createBattle(p,CAMPAIGN[0],777);
 assert.equal(b.heroes.p.shield,4);
 chooseHeroTalent(p,'gardien_serment');
 assert.deepEqual(b.heroTalents,['gardien_rempart']);
 assert.deepEqual(chosenTalents(p,8),['gardien_serment']);
 delete b.heroTalents;
 assert.equal(usePower(b).ok,true,'legacy in-progress battle still works');
});
test('V2.3 guardian can choose healing or early protection',()=>{
 const b=mk('gardien',['gardien_serment','gardien_sentinelle']);
 b.heroes.p.hp=10;
 b.board[0][1]=unit(1,'militia','p',4);
 assert.equal(usePower(b).ok,true);
 assert.equal(b.heroes.p.hp,16);
 assert.equal(b.board[0][1].hp,6);
 const c=mk('gardien',['gardien_rempart','gardien_barriere']);
 assert.equal(c.heroes.p.shield,4);
 assert.equal(usePower(c).ok,true);
 assert.equal(c.heroes.p.shield,7);
});
test('V2.3 arcanist focus improves hero power and echoes hit another enemy',()=>{
 const focused=mk('arcaniste',['arcaniste_focus','arcaniste_echos']);
 focused.board[0][2]=unit(10,'bone','e',10);
 focused.board[1][3]=unit(11,'bone','e',10);
 assert.equal(usePower(focused).ok,true);
 assert.equal(focused.board[0][2].hp,5);
 assert.equal(focused.board[1][3].hp,8);
 const shielded=mk('arcaniste',['arcaniste_barriere','arcaniste_tissage']);
 shielded.heroes.p.hp=10;
 assert.equal(usePower(shielded).ok,true);
 assert.equal(shielded.heroes.p.shield,3);
 assert.equal(shielded.heroes.p.hp,12);
});
test('V2.3 ranger can hit harder or draw an extra card',()=>{
 const b=mk('rodeur',['rodeur_precision','rodeur_poursuite']);
 b.board[1][3]=unit(20,'bone','e',10);
 const start=b.heroes.p.hand.length;
 assert.equal(usePower(b).ok,true);
 assert.equal(b.board[1][3].hp,6);
 assert.equal(b.heroes.p.hand.length,Math.min(7,start+1));
 const c=mk('rodeur',['rodeur_couvert','rodeur_concentration']);
 c.board[1][3]=unit(21,'bone','e',10);c.heroes.p.hp=10;
 assert.equal(usePower(c).ok,true);
 assert.equal(c.heroes.p.shield,3);
 assert.equal(c.heroes.p.hp,12);
});
test('V2.3 cleric can cleanse poison or increase healing',()=>{
 const b=mk('clerc',['clerc_soutien','clerc_purification']);
 b.heroes.p.hp=10;
 const ally=unit(30,'militia','p',3);ally.poison=2;ally.poisonTurns=2;
 b.board[1][2]=ally;
 assert.equal(usePower(b).ok,true);
 assert.equal(ally.hp,8);
 assert.equal(b.heroes.p.hp,14,'Main secourable soigne aussi le héros de 1 PV');
 assert.equal(ally.poison,0);assert.equal(ally.poisonTurns,0);
 const c=mk('clerc',['clerc_foi','clerc_souffle']);c.heroes.p.hp=10;
 assert.equal(usePower(c).ok,true);
 assert.equal(c.heroes.p.hp,15);
 assert.equal(c.heroes.p.shield,3);
});
test('V2.3 zero talent damage and hero stats remain baseline for a beginner',()=>{
 const p=freshProfile(),b=createBattle(p,CAMPAIGN[0],700);
 assert.deepEqual(b.heroTalents,[]);assert.equal(b.heroes.p.shield,0);
 b.board[1][2]=unit(5,'bone');
 assert.equal(usePower(b).ok,true);
 assert.equal(b.heroes.p.hp,b.heroes.p.maxhp);
});


test('V2.4 arcanist second target receives two damage without harming allies',()=>{
 const b=mk('arcaniste',['arcaniste_echos']);
 b.board[0][2]=unit(31,'bone','e',10);
 b.board[1][3]=unit(32,'bone','e',10);
 b.board[2][1]=unit(33,'militia','p',10);
 assert.equal(usePower(b).ok,true);
 assert.equal(b.board[0][2].hp,6);
 assert.equal(b.board[1][3].hp,8);
 assert.equal(b.board[2][1].hp,10);
});

test('V2.4 ranger reserve draws at most once per battle (including legacy battle)',()=>{
 const b=mk('rodeur',['rodeur_poursuite']);
 const first=b.heroes.p.hand.length;
 assert.equal(usePower(b).ok,true);
 assert.equal(b.heroes.p.hand.length,first+1);
 assert.equal(b.talentDrawUsed,true);
 b.powerCooldown=0;
 const second=b.heroes.p.hand.length;
 assert.equal(usePower(b).ok,true);
 assert.equal(b.heroes.p.hand.length,second);
 delete b.talentDrawUsed;
 b.powerCooldown=0;
 assert.equal(usePower(b).ok,true,'old battle without draw flag should not throw');
 assert.equal(b.talentDrawUsed,true);
});

test('V2.4 ranger reserve waits if hand is full or cards are unavailable',()=>{
 const b=mk('rodeur',['rodeur_poursuite']);
 b.heroes.p.hand=Array.from({length:7},()=>({id:'militia',wait:0}));
 usePower(b);
 assert.equal(b.talentDrawUsed,false);
 b.powerCooldown=0;
 b.heroes.p.hand.pop();
 const before=b.heroes.p.hand.length;
 usePower(b);
 assert.equal(b.heroes.p.hand.length,before+1);
 assert.equal(b.talentDrawUsed,true);
});

test('V2.4 cleric purification clears root and poison, with capped shield',()=>{
 const b=mk('clerc',['clerc_purification']);
 const ally=unit(41,'militia','p',5);ally.poison=2;ally.poisonTurns=3;ally.stun=2;
 const enemy=unit(42,'bone','e',5);enemy.poison=2;enemy.poisonTurns=3;enemy.stun=2;
 b.board[1][1]=ally;b.board[1][5]=enemy;b.heroes.p.shield=15;
 assert.equal(usePower(b).ok,true);
 assert.equal(b.heroes.p.shield,15,'shield cap');
 assert.equal(ally.poisonTurns,0);assert.equal(ally.stun,0);assert.equal(ally.poison,0);
 assert.equal(enemy.poisonTurns,3);assert.equal(enemy.stun,2);
});
