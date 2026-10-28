// Empreintes des règles actuelles ; ancienne référence conservée et contrôlée, jamais rejouée par un second moteur.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {CARD_RULESET} from '../src/cards/definitions.js';
import {CAMPAIGN,towerMission} from '../src/data.js';
import {freshProfile,createBattle,endPlayerTurn,playPlayerCard,usePower,completeBattle,beginDungeon,nextDungeonBattle,chooseDungeonEvent,settleDungeonBattle} from '../src/engine.js';
const results=[];
for(const legacy of [true,false])for(let seed=10;seed<70;seed++){
 const p=freshProfile();p.heroClass=['gardien','arcaniste','rodeur','clerc'][seed%4];p.heroXp=seed*7;
 const mission=seed%2?CAMPAIGN[seed%12]:towerMission(1+seed%20);
 const b=createBattle(p,mission,seed,{legacy});
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
 results.push({layout:legacy?'3x5':'2-4x10',seed,mission:mission.id,battle:bState,profile:JSON.stringify(profile),
  outcome:{status:b.status,round:b.round,playerHp:b.heroes.p.hp,enemyHp:b.heroes.e.hp,...b.stats}});
}
const digest=data=>createHash('sha256').update(data).digest('hex');
const archive=fs.readFileSync(new URL('../tests/fixtures/refactor_baseline_v24.json',import.meta.url));
assert.equal(digest(archive),'4997044f537da23b51202cc0223d9cc84b8cae336fb6632ebd2ea699585b5df8','La référence historique ne doit pas être réécrite');
const current={rules:CARD_RULESET,scenarios:results.map(({battle,profile,...info})=>({...info,battleHash:digest(battle),profileHash:digest(profile)}))};
const dest=new URL('../tests/fixtures/rules_baseline_cards_v2.json',import.meta.url);
if(process.argv.includes('--check')){
 assert.deepEqual(current,JSON.parse(fs.readFileSync(dest,'utf8')),'Divergence des règles actuelles : examiner les scénarios avant toute modification de référence');
 console.log('Règles actuelles :',results.length,'scénarios déterministes identiques à leur référence ; archive V2.4 inchangée');
}else if(process.argv.includes('--record-current')&&!fs.existsSync(dest)){
 fs.writeFileSync(dest,JSON.stringify(current,null,2)+'\n');
 console.log('Nouvelle référence de gameplay créée explicitement :',CARD_RULESET,results.length,'scénarios ; archive historique conservée');
}else{
 console.error('Aucune référence réécrite. Utiliser --check ; création initiale explicite seulement avec --record-current.');
 process.exitCode=2;
}
