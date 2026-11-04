// Préparation commune Node/navigateur : aucune attribution du Repli ou du présage.
import assert from 'node:assert/strict';
import {CAMPAIGN} from '../../src/data.js';
import {createBattle,playPlayerCard} from '../../src/engine.js';
import {validStoredBattle} from '../../src/ui/storage.js';
import {forgeUnit} from './forge-combat.mjs';

export function etherBattle(profile,id){
 const before=structuredClone(profile),b=createBattle(profile,CAMPAIGN[5],11,{turnFlow:'alternating'});
 for(const h of Object.values(b.heroes))Object.assign(h,{hp:100,maxhp:100,hand:[],deck:[],discard:[]});
 b.heroes.p.hand=[{id,rarity:'légendaire',wait:0}];assert(playPlayerCard(b,0,0,1).ok);
 const target=forgeUnit('golem','e',{uid:b.nextUnitId++,stun:2});
 b.board[0][id==='spark'?5:3]=target;
 assert(validStoredBattle(b));assert.deepEqual(profile,before);
 return {battle:b,plan:{seed:11,turn:1,opening:0,targetUid:target.uid}};
}
if(process.argv[1]?.endsWith('/ether-battle.mjs'))console.log(JSON.stringify(etherBattle(JSON.parse(process.argv[2]),process.argv[3])));
