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
const cards=['mystic','aetherknight','portal_walker'];
profile.evolvedCollection=Object.fromEntries(cards.map(id=>[`${id}:légendaire`,3]));
for(const id of cards){
 const result=fuseEvolutionCopies(profile,`${id}:divine`);
 assert(result.ok&&modifyDeck(profile,result.target,1));
}
const battle=createBattle(profile,{...CAMPAIGN[11],deck:[],hp:100},11,{turnFlow:'alternating'});
for(const hero of Object.values(battle.heroes))Object.assign(hero,{hand:[],deck:[],discard:[]});
for(const [lane,id] of cards.entries()){
 battle.heroes.p.cardsPlayed=0;
 battle.heroes.p.hand=[{id,rarity:'divine',wait:0}];
 assert(playPlayerCard(battle,0,lane,1).ok);
 battle.board[lane][4]=battle.board[lane][1];battle.board[lane][1]=null;
}
const victim=(parameters={})=>forgeUnit('militia','e',{uid:battle.nextUnitId++,hp:30,maxhp:30,armor:0,stun:99,...parameters});
battle.board[0][6]=victim({stun:1,atk:3});
battle.board[1][6]=victim({hp:7,armor:3});
battle.board[2][5]=victim();
battle.board[3][6]=victim({hp:4});
battle.vfx=[];
assert(validStoredBattle(battle));
console.log(JSON.stringify({profile,battle,seed:11}));
