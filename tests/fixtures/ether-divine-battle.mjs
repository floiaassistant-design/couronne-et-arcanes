// Combat préparé commun Node/navigateur : quatre vraies fusions et invocations,
// jamais de pouvoir, marque, bonus ou quota attribué à la main.
import assert from 'node:assert/strict';
import {CAMPAIGN} from '../../src/data.js';
import {freshProfile,fuseEvolutionCopies,modifyDeck,createBattle,playPlayerCard} from '../../src/engine.js';
import {validStoredBattle} from '../../src/ui/storage.js';
import {forgeUnit} from './forge-combat.mjs';

export function etherDivineBattle(input){
 const profile=structuredClone(input||freshProfile());
 if(!input){
  profile.completed=CAMPAIGN.map(m=>m.id);profile.unlocked=12;profile.guideSeen=true;
  profile.completedTrials=['ether-ascension-divine'];
  profile.evolvedCollection=Object.fromEntries(['spark','seer','sentinel'].map(id=>[id+':légendaire',3]));
  profile.collection.dragon=3;
 }
 for(const id of ['spark','seer','dragon','sentinel']){
  if(!profile.evolvedCollection?.[id+':divine'])assert(fuseEvolutionCopies(profile,id+':divine').ok,id);
  if(!profile.deck.some(r=>r?.id===id&&r.rarity==='divine'))assert(modifyDeck(profile,{id,rarity:'divine'},1));
 }
 const b=createBattle(profile,{...CAMPAIGN[11],deck:[],hp:100},11,{turnFlow:'alternating'});
 for(const h of Object.values(b.heroes))Object.assign(h,{hp:100,maxhp:100,hand:[],deck:[],discard:[]});
 const sources={},targets={};
 for(const [lane,id] of ['spark','seer','dragon','sentinel'].entries()){
  b.heroes.p.cardsPlayed=0;b.heroes.p.hand=[{id,rarity:'divine',wait:0}];
  assert(playPlayerCard(b,0,lane,1).ok);
  const u=b.board[lane][1];sources[id]=u.uid;
  if(id==='sentinel')u.stun=99;
  else {b.board[lane][1]=null;b.board[lane][4]=u;}
  const target=forgeUnit(id==='sentinel'?'archer':'militia','e',{uid:b.nextUnitId++,hp:40,maxhp:40,armor:0,atk:3,stun:id==='sentinel'?0:99});
  b.board[lane][id==='sentinel'?2:id==='seer'?6:5]=target;targets[id]=target.uid;
  if(id==='dragon'){
   const secondary=forgeUnit('militia','e',{uid:b.nextUnitId++,hp:40,maxhp:40,armor:0,stun:99});
   b.board[lane][6]=secondary;targets.secondary=secondary.uid;
  }
 }
 b.heroes.p.cardsPlayed=0;b.vfx=[];
 assert(validStoredBattle(b));
 return {profile,battle:b,sources,targets,seed:11};
}
if(process.argv[1]?.endsWith('/ether-divine-battle.mjs'))console.log(JSON.stringify(etherDivineBattle(process.argv[2]?JSON.parse(process.argv[2]):undefined)));
