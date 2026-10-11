// Audit V2.7 : quatre decks × 3 collections × 2 classes, mêmes missions/graines.
// Données simulées, sans prédiction du taux de victoire des humains.
import {CAMPAIGN,towerMission} from '../src/data.js';
import {DUNGEONS,dungeonStageMission} from '../src/dungeons.js';
import {DECK_STYLES,proposeDeck,validateDeck} from '../src/engine.js';
import {makeLabProfile,LAB_COLLECTIONS} from './lib/deck_scenarios.mjs';
import {simulateBattle} from './lib/battle_runner.mjs';

const seedCount=Math.max(1,Math.min(200,Math.floor(Number(process.env.DECK_SEEDS)||20)));
const encounters=[...CAMPAIGN.map(m=>({id:`C${m.id}`,m})),
 {id:'T05',m:towerMission(5)},{id:'T10',m:towerMission(10)},
 {id:'D01',m:dungeonStageMission(DUNGEONS[0].id,0)},
 {id:'D03',m:dungeonStageMission(DUNGEONS[2].id,2)}];
const names=Object.keys(DECK_STYLES),classes=['gardien','arcaniste'];
const rows=[],byEncounter=[];
const percent=(v,n)=>+(100*v/n).toFixed(1);
for(const collection of LAB_COLLECTIONS)for(const hero of classes){
 const base=makeLabProfile(collection,hero);
 for(const style of names){
  const proposal=proposeDeck(base,style);
  if(!proposal.ok)throw Error(`${collection}/${hero}/${style}: ${proposal.reason}`);
  const profile={...base,deck:proposal.deck};
  const bad=validateDeck(profile);if(bad)throw Error(bad);
  let wins=0,rounds=0,remaining=0;
  for(const {id,m} of encounters){
   let encounterWins=0;
   for(let k=0;k<seedCount;k++){
    const r=simulateBattle(profile,m,101001+k*3167,{turnLimit:42});
    wins+=Number(r.win);encounterWins+=Number(r.win);rounds+=r.turns;
    remaining+=r.hp/r.maxhp;
   }
   byEncounter.push({collection,hero,style,id,enemyStyle:m.aiStyle||'equilibre',wins:encounterWins,n:seedCount});
  }
  const n=encounters.length*seedCount;
  rows.push({collection,hero,style,wins,n,winPct:percent(wins,n),avgTurns:+(rounds/n).toFixed(2),
   avgRemainingHpPct:percent(remaining,n),deckSize:proposal.deck.length,
   overview:proposal.overview});
 }
}
const groups=[];
for(const collection of LAB_COLLECTIONS)for(const hero of classes){
 const set=rows.filter(r=>r.collection===collection&&r.hero===hero);
 const rates=set.map(r=>r.winPct);
 groups.push({collection,hero,spreadPp:+(Math.max(...rates)-Math.min(...rates)).toFixed(1),
  best:set.reduce((a,b)=>b.winPct>a.winPct?b:a).style,
  worst:set.reduce((a,b)=>b.winPct<a.winPct?b:a).style});
}
const result={version:'2.7',method:'paired mission and PRNG seed, fixed scripted player, independent battles; non-human estimate',seedCount,
 encounters:encounters.length,variants:rows.length,battles:rows.reduce((n,r)=>n+r.n,0),rows,groups,byEncounter};
if(process.argv.includes('--json'))console.log(JSON.stringify(result,null,2));
else{
 console.log(`Comparaison V2.7 : ${result.battles} combats, ${encounters.length} adversaires, ${seedCount} graines, 3 collections × 2 classes × 4 compositions`);
 for(const g of groups){
  console.log(`\n${g.collection} / ${g.hero} — écart ${g.spreadPp} points`);
  for(const r of rows.filter(r=>r.collection===g.collection&&r.hero===g.hero))
   console.log(`  ${r.style.padEnd(9)} ${String(r.winPct.toFixed(1)).padStart(5)} %  (${r.wins}/${r.n})  ${r.deckSize} cartes, ${r.overview.spells} sorts`);
 }
}
