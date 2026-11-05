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
profile.evolvedCollection={'griffin:légendaire':3};
profile.collection.seraph=3;
const ids=['griffin','seraph'];
for(const id of ids){
 const result=fuseEvolutionCopies(profile,id+':divine');
 assert(result.ok&&modifyDeck(profile,result.target,1));
}
const battle=createBattle(profile,{...CAMPAIGN[11],deck:[],hp:100},11,{turnFlow:'alternating'});
for(const hero of Object.values(battle.heroes))Object.assign(hero,{hand:[],deck:[],discard:[]});
for(const [lane,id] of ids.entries()){
 battle.heroes.p.hand=[{id,rarity:'divine',wait:0}];
 assert(playPlayerCard(battle,0,lane,1).ok);
 battle.board[lane][2]=forgeUnit('militia','p',{uid:battle.nextUnitId++,hp:lane?1:5,maxhp:5,stun:lane?99:1});
}
battle.vfx=[];
assert(validStoredBattle(battle));
console.log(JSON.stringify({profile,battle,seed:11}));
