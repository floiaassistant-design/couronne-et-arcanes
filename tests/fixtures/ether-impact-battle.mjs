import assert from 'node:assert/strict';
import {CAMPAIGN} from '../../src/data.js';
import {createBattle,freshProfile,fuseEvolutionCopies,modifyDeck,playPlayerCard} from '../../src/engine.js';
import {validStoredBattle} from '../../src/ui/storage.js';
import {forgeUnit} from './forge-combat.mjs';

const profile=freshProfile();
profile.completed=CAMPAIGN.map(m=>m.id);
profile.unlocked=12;
profile.guideSeen=true;
profile.completedTrials=['ether-ascension-divine'];
const cards=['elemental','tempest'];
profile.evolvedCollection=Object.fromEntries(cards.map(id=>[`${id}:légendaire`,3]));
for(const id of cards){
 const result=fuseEvolutionCopies(profile,`${id}:divine`);
 assert(result.ok&&modifyDeck(profile,result.target,1));
}
const battle=createBattle(profile,{...CAMPAIGN[11],deck:[],hp:100},11,{turnFlow:'alternating'});
for(const hero of Object.values(battle.heroes))Object.assign(hero,{hand:[],deck:[],discard:[]});
const victim=()=>forgeUnit('militia','e',{uid:battle.nextUnitId++,hp:30,maxhp:30,armor:0,stun:99});
for(const [index,id] of cards.entries()){
 const lane=index*2;
 battle.heroes.p.hand=[{id,rarity:'divine',wait:0}];
 assert(playPlayerCard(battle,0,lane,1).ok);
 battle.board[lane][2]=victim();
 battle.board[lane][3]=victim();
}
battle.board[0][3].regeneration={amount:3,remaining:1,readyRound:2};
battle.board[1][3]=victim();
battle.board[3][3]=victim();
battle.vfx=[];
assert(validStoredBattle(battle));
console.log(JSON.stringify({profile,battle,seed:11}));
