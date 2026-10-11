// Laboratoire V2.9 : profils fictifs, mêmes graines et adversaires pour toutes les variantes.
import assert from 'node:assert/strict';
import {CARDS,CAMPAIGN,CLASS_SKILLS} from '../src/data.js';
import {freshProfile,validateDeck,HERO_LEVEL_THRESHOLD} from '../src/engine.js';
import {CONTROL_IDS} from '../src/engine/battle-control.js';
import {simulateBattle} from './lib/battle_runner.mjs';
const seeds=Number(process.env.CONTROL_SEEDS||16);
assert.ok(Number.isInteger(seeds)&&seeds>0&&seeds<=128);
const decks={
 assaut:['militia','militia','wolf','wolf','shade','spectre','stag','lancer','ranger','archer','firebolt','warcry','healing','thorn','spark','smith'],
 rempart:['shield','shield','golem','golem','treant','crypt','sentinel','paladin','cleric','dryad','healing','sanctuary','archer','ranger','ironwraith','sunpriest'],
 arcanes:['spark','spark','mystic','mystic','elemental','seer','tempest','aetherknight','ranger','archer','storm','firebolt','healing','sanctuary','sentinel','cleric'],
 soutien:['militia','shield','banner','scoutcaptain','cleric','dryad','archdruid','sunpriest','ranger','treant','healing','warcry','sanctuary','paladin','archer','ironwraith']
};
const variants={reference:[],silence:CONTROL_IDS.slice(0,2),teleportation:CONTROL_IDS.slice(2,4),pieges:CONTROL_IDS.slice(4,6),mixte:CONTROL_IDS};
const enemies=CAMPAIGN.filter((_,i)=>[2,5,8,11].includes(i)).flatMap(m=>[m,{...m,id:m.id+'-controle',name:m.name+' / contrôle',deck:m.deck.map((id,i)=>i<6?CONTROL_IDS[i]:id)}]);
const rows=[],uses=Object.fromEntries([...CONTROL_IDS,...Object.keys(CLASS_SKILLS)].map(id=>[id,0]));
let completed=0,maxTurns=0,trapStates=0,silentStates=0;
for(const level of [6,9])for(const hero of ['gardien','arcaniste','rodeur','clerc'])for(const [style,base] of Object.entries(decks))for(const [variant,addition] of Object.entries(variants)){
 const p=freshProfile();p.heroClass=hero;p.heroXp=HERO_LEVEL_THRESHOLD(level);
 p.collection=Object.fromEntries(Object.keys(CARDS).map(id=>[id,4]));
 p.upgrades=Object.fromEntries(Object.values(CARDS).filter(c=>c.type==='unité').map(c=>[c.id,level===6?1:2]));
 p.buildings={bastion:level===6?1:2,forge:level===6?1:2,bibliotheque:1};
 const skills=Object.keys(CLASS_SKILLS).filter(id=>CLASS_SKILLS[id].hero===hero);
 p.deck=[...base,...skills];addition.forEach((id,i)=>p.deck[10+i]=id);
 assert.equal(validateDeck(p),'');
 let wins=0,turns=0;
 for(const mission of enemies)for(let seed=0;seed<seeds;seed++){
  let last;
  const result=simulateBattle(p,mission,19029+seed*997,{observe:b=>{
   last=b;const units=b.board.flat().filter(Boolean);
   assert.equal(new Set(units.map(u=>u.uid)).size,units.length);
   assert.ok(b.heroes.p.hp>=0&&b.heroes.e.hp>=0&&b.round<=36);
   for(const u of units){assert.ok(u.hp>0);if(u.silenceUntil>=b.round){assert.ok(u.silenceUntil-b.round<=1);silentStates++;}}
   for(const side of ['p','e'])assert.ok((b.traps||[]).filter(t=>t.owner===side).length<=2);
   for(const t of b.traps||[]){assert.ok(t.lane>=0&&t.lane<3&&t.col>=2&&t.col<=4&&t.expiresRound>=b.round);trapStates++;}
  }});
  wins+=Number(result.win);turns+=result.turns;maxTurns=Math.max(maxTurns,result.turns);completed++;
  for(const id of Object.keys(uses))uses[id]+=last.cardUses?.[id]||0;
 }
 rows.push({level,hero,style,variant,battles:enemies.length*seeds,wins,winRate:Math.round(wins/(enemies.length*seeds)*1000)/10,meanTurns:Math.round(turns/(enemies.length*seeds)*100)/100});
}
const summary={schema:1,seeds,completed,maxTurns,trapStates,silentStates,uses,rows};
if(process.argv.includes('--json'))console.log(JSON.stringify(summary,null,2));
else console.log(JSON.stringify({seeds,completed,maxTurns,trapStates,silentStates,uses},null,2));
