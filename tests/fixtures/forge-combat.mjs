// Préparations de tests : définitions réelles, fusion et invocation publiques.
import assert from 'node:assert/strict';
import {CARDS,CAMPAIGN} from '../../src/data.js';
import {resolveUnitDefinition} from '../../src/cards/definitions.js';
import {freshProfile,fuseEvolutionCopies,modifyDeck,createBattle,playPlayerCard} from '../../src/engine.js';

let uid=4000;
export function forgeUnit(id,side='e',extra={}){
 const d=resolveUnitDefinition(id,extra.rarity);
 assert(d,id+':'+extra.rarity);
 return {uid:uid++,id,side,rarity:d.rarity,cardRules:'cards-v2',atk:d.stats.attack,hp:d.stats.hp,maxhp:d.stats.hp,
  armor:d.abilities.armor?.amount||0,ranged:!!d.abilities.ranged,ability:CARDS[id].ability,stun:0,poison:0,poisonTurns:0,...extra};
}
export function forgeBattle(id='smith',rarity='légendaire'){
 const p=freshProfile();p.completed=CAMPAIGN.map(m=>m.id);p.unlocked=12;
 p.evolvedCollection={[id+':épique']:3};
 const fused=fuseEvolutionCopies(p,id+':légendaire');assert(fused.ok,fused.reason);
 assert(modifyDeck(p,fused.target,1));
 const b=createBattle(p,{...CAMPAIGN[0],deck:[],hp:100},11,{turnFlow:'alternating'});
 for(const h of Object.values(b.heroes))Object.assign(h,{hp:100,maxhp:100,hand:[],deck:[],discard:[]});
 b.heroes.p.hand=[{id,rarity,wait:0}];assert(playPlayerCard(b,0,0,1).ok);b.vfx=[];
 return {p,b,u:b.board[0][1]};
}
export function testStorage(){
 const data={};globalThis.localStorage={getItem:k=>data[k]??null,setItem:(k,v)=>{data[k]=String(v);},removeItem:k=>{delete data[k];}};
 return data;
}
