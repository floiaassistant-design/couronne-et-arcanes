// Combat préparé : cinq vraies fusions et six invocations en trois tours.
// Aucun résultat de pouvoir n'est préattribué. Le profil fourni est copié.
import assert from 'node:assert/strict';
import {CARDS,CAMPAIGN} from '../../src/data.js';
import {freshProfile,fuseEvolutionCopies,createBattle,playPlayerCard,endPlayerTurn,finishEnemyTurn,validateDeck} from '../../src/engine.js';
import {resolveUnitDefinition} from '../../src/cards/definitions.js';
import {validStoredBattle,validateImportedProfile} from '../../src/ui/storage.js';

export function forgeTacticalFixture(input,rank){
 const p=structuredClone(input),ids=['engineer','mechanist','cannon','bomb','alchemist'];
 p.deck=freshProfile().deck;
 for(const id of ids){const r=fuseEvolutionCopies(p,id+':'+rank);assert(r.ok,r.reason);}
 p.deck=[...ids.map(id=>({id,rarity:rank})),'wolf','healing','healing','golem','colossus','drill','ironwraith'];
 assert.equal(validateDeck(p),'');assert.deepEqual(validateImportedProfile(p),p);
 const b=createBattle(p,CAMPAIGN[5],11,{turnFlow:'alternating'});
 for(const h of Object.values(b.heroes))Object.assign(h,{hand:[],deck:[],discard:[]});
 const spawned={};
 for(const [i,id] of [...ids,'wolf'].entries()){
  const lane=id==='bomb'?1:id==='alchemist'?2:id==='wolf'?1:0;
  const col=[1,2,3].find(c=>!b.board[lane][c]);
  const ref=id==='wolf'?{id}:{id,rarity:rank};b.heroes.p.hand=[{...ref,wait:0}];
  assert(playPlayerCard(b,0,lane,col).ok);spawned[id]=b.board[lane][col];
  if(i===1||i===3){endPlayerTurn(b);finishEnemyTurn(b);}
 }
 assert.equal(b.round,3);
 for(const row of b.board)row.fill(null);
 for(const [id,lane,col] of [['engineer',0,1],['mechanist',0,2],['cannon',0,3],['wolf',0,4],['bomb',1,1],['alchemist',2,1]])b.board[lane][col]=spawned[id];
 const targets={};
 for(const [name,lane,col] of [['mark',0,5],['primary',1,2],['secondary',1,3],['poison',2,2]]){
  const d=resolveUnitDefinition('golem'),u={uid:b.nextUnitId++,id:'golem',side:'e',rarity:d.rarity,cardRules:b.cardRules,
   atk:d.stats.attack,hp:d.stats.hp,maxhp:d.stats.hp,armor:d.abilities.armor.amount,ranged:false,ability:CARDS.golem.ability,stun:99,poison:0,poisonTurns:0};
  b.board[lane][col]=u;targets[name]=u.uid;
 }
 assert.equal(validStoredBattle(b),true);
 return {profile:p,battle:b,seed:11,sources:Object.fromEntries(Object.entries(spawned).map(([id,u])=>[id,u.uid])),targets};
}
if(process.argv[1]?.endsWith('forge-tactical-battle.mjs'))console.log(JSON.stringify(forgeTacticalFixture(JSON.parse(process.argv[2]),process.argv[3])));
