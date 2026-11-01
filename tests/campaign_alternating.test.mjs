import test from 'node:test';
import assert from 'node:assert/strict';
import {CAMPAIGN} from '../src/data.js';
import {freshProfile} from '../src/engine.js';
import {rankEnemyMoves} from '../src/ai.js';
import {validStoredBattle} from '../src/ui/storage.js';
import {validDeploymentColumn} from '../src/engine/board.js';
import {simulateBattle} from '../scripts/lib/battle_runner.mjs';

function inspectPublicDecision(b){
 const before=JSON.stringify(b),hero=b.heroes.p;
 const hidden=Object.fromEntries(['hand','deck'].map(key=>[key,Object.getOwnPropertyDescriptor(hero,key)]));
 for(const key of Object.keys(hidden))Object.defineProperty(hero,key,{configurable:true,enumerable:true,
  get(){throw Error('L’IA consulte les cartes privées du joueur : '+key);}});
 let choices;
 try{choices=rankEnemyMoves(b);}finally{Object.defineProperties(hero,hidden);}
 assert.equal(JSON.stringify(b),before,'la recherche ne modifie ni combat ni RNG');
 for(const choice of choices){
  assert.ok(choice.index>=0&&choice.index<b.heroes.e.hand.length);
  assert.equal(b.heroes.e.hand[choice.index].wait,0);
  assert.ok(choice.lane>=0&&choice.lane<b.board.length);
  assert.ok(Number.isFinite(choice.score)&&choice.score>0);
  if(choice.col!==undefined){
   assert.ok(validDeploymentColumn(b,'e',choice.col));
   assert.equal(b.board[choice.lane][choice.col],null);
  }
 }
}

test('campagne : les 12 rencontres et 4 classes terminent avec des instantanés valides en tours alternés',()=>{
 const outcomes=[];
 for(const heroClass of ['gardien','arcaniste','rodeur','clerc'])for(const mission of CAMPAIGN)for(const seed of [61031,62028]){
  const profile=freshProfile();profile.heroClass=heroClass;
  const before=structuredClone(profile),states=[];
  const options={turnFlow:'alternating',observe:b=>{
   assert.equal(b.turnFlow,'alternating');
   assert.ok(b.status!=='active'||b.phase==='player','la phase adverse doit être terminée');
   assert.equal(validStoredBattle(JSON.parse(JSON.stringify(b))),true);
   inspectPublicDecision(b);states.push(JSON.stringify(b));
  }};
  const result=simulateBattle(profile,mission,seed,options),replay=[];
  const again=simulateBattle(profile,mission,seed,{turnFlow:'alternating',observe:b=>replay.push(JSON.stringify(b))});
  assert.deepEqual(again,result,'mêmes profils/mission/graine : même résultat');
  assert.deepEqual(replay,states,'mêmes états à chaque fin de tour');
  assert.deepEqual(profile,before,'aucune progression réelle mutée par le robot');
  assert.ok(result.turns>0&&result.turns<=36);
  outcomes.push({heroClass,mission:mission.id,win:result.win,turns:result.turns});
 }
 assert.equal(outcomes.length,96);
 console.log('Campagne alternée : 96 rencontres isolées × deux exécutions, '+
  outcomes.filter(r=>r.win).length+' victoires du robot ; aucune conclusion d’équilibrage humain.');
});

test('le robot garde son mode historique si l’option de tours alternés est absente',()=>{
 let observed=false;
 simulateBattle(freshProfile(),CAMPAIGN[0],61031,{observe:b=>{
  assert.equal(b.turnFlow,undefined);observed=true;
 }});
 assert.equal(observed,true);
});
