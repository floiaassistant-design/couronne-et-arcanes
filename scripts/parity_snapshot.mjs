// Behavioral fingerprint for deterministic module refactors. No production dependency.
import fs from 'node:fs';
import {CAMPAIGN,towerMission} from '../src/data.js';
import {freshProfile,createBattle,endPlayerTurn,playPlayerCard,usePower,completeBattle,beginDungeon,nextDungeonBattle,chooseDungeonEvent,settleDungeonBattle} from '../src/engine.js';
const results=[];
for(let seed=10;seed<70;seed++){
 const p=freshProfile();p.heroClass=['gardien','arcaniste','rodeur','clerc'][seed%4];p.heroXp=seed*7;
 const mission=seed%2?CAMPAIGN[seed%12]:towerMission(1+seed%20);
 const b=createBattle(p,mission,seed);
 for(let turn=0;turn<7&&b.status==='active';turn++){
  for(let played=0;played<2;played++){
   const options=b.heroes.p.hand.map((c,i)=>({c,i})).filter(o=>o.c.wait===0);
   for(const {i} of options){if([0,1,2].some(l=>playPlayerCard(b,i,(l+seed+turn)%3).ok))break;}
  }
  if(b.status==='active'&&b.powerCooldown===0)usePower(b);
  if(b.status==='active')endPlayerTurn(b);
 }
 const profile={...p};const bState=JSON.stringify(b);
 if(b.status!=='active')completeBattle(profile,mission,b);
 results.push({seed,mission:mission.id,battle:bState,profile:JSON.stringify(profile)});
}
const dest=new URL('../tests/fixtures/refactor_baseline_v24.json',import.meta.url);
if(process.argv.includes('--check')){
 const baseline=JSON.parse(fs.readFileSync(dest,'utf8'));
 if(JSON.stringify(baseline)!==JSON.stringify(results))throw Error('Divergence de comportement détectée avec la V2.4');
 console.log('Parité V2.4 :',results.length,'scénarios déterministes identiques');
}else{
 console.error('Refuser de réécrire la référence historique sans intervention explicite.');
 process.exitCode=2;
}
