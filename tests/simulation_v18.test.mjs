import test from 'node:test';
import assert from 'node:assert/strict';
import {CAMPAIGN,towerMission} from '../src/data.js';
import {freshProfile,createBattle,playPlayerCard,endPlayerTurn,usePower} from '../src/engine.js';
function runCombat(mission,seed){
 const b=createBattle(freshProfile(),mission,seed);
 let turns=0;
 while(b.status==='active'&&turns<39){
  if(b.powerCooldown===0)usePower(b);
  for(let k=0;k<2&&b.status==='active';k++){
   let played=false;
   for(let i=0;i<b.heroes.p.hand.length&&!played;i++){
    if(b.heroes.p.hand[i].wait>0)continue;
    for(let lane=0;lane<3&&!played;lane++){
     const res=playPlayerCard(b,i,lane);if(res.ok)played=true;
    }
   }
  }
  if(b.status==='active')endPlayerTurn(b);
  turns++;
  assert.ok(b.heroes.p.hp>=0&&b.heroes.e.hp>=0,'health underflow');
  for(const row of b.board)for(const u of row)if(u){assert.ok(u.hp>0);assert.ok(u.side==='e'||u.side==='p');}
 }
 assert.ok(turns<=36,'turn cap exceeded');
 assert.ok(b.status==='victory'||b.status==='defeat','unfinished match');
 return b.status;
}
test('V1.8 completes 120 deterministic solo encounters without invalid combat states',()=>{
 let count=0;
 for(const mission of [...CAMPAIGN,...[1,4,5,9,10,15,16,20].map(towerMission)]){
  for(let seed=1;seed<=6;seed++){runCombat(mission,100000+seed*127+count++);}
 }
 assert.equal(count,120);
});
