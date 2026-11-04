// Préparations de tests : définitions réelles, fusion et invocation publiques.
import assert from 'node:assert/strict';
import {CARDS,CAMPAIGN} from '../../src/data.js';
import {resolveUnitDefinition} from '../../src/cards/definitions.js';
import {evolutionFusionFor} from '../../src/evolution-fusion.js';
import {cardReference} from '../../src/cards/references.js';
import {freshProfile,fuseEvolutionCopies,modifyDeck,createBattle,playPlayerCard} from '../../src/engine.js';
import {hit} from '../../src/engine/battle-defense.js';

let uid=4000;
export function forgeUnit(id,side='e',extra={}){
 const d=resolveUnitDefinition(id,extra.rarity);
 assert(d,id+':'+extra.rarity);
 return {uid:uid++,id,side,rarity:d.rarity,cardRules:'cards-v2',atk:d.stats.attack,hp:d.stats.hp,maxhp:d.stats.hp,
  armor:d.abilities.armor?.amount||0,ranged:!!d.abilities.ranged,ability:CARDS[id].ability,stun:0,poison:0,poisonTurns:0,...extra};
}
export function forgeBattle(id='smith',rarity='légendaire'){
 const p=freshProfile();p.completed=CAMPAIGN.map(m=>m.id);p.unlocked=12;
 p.completedTrials=['forge-ascension-divine','forge-ascension-eveillee'];
 const recipe=evolutionFusionFor(id,rarity),source=cardReference({id,rarity:recipe.from});
 if(typeof source==='string')p.collection[id]=(p.collection[id]||0)+3;
 else p.evolvedCollection={[id+':'+recipe.from]:3};
 const fused=fuseEvolutionCopies(p,id+':'+rarity);assert(fused.ok,fused.reason);
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
export function forgeContact(id,rarity,side='p'){
 const c=forgeBattle(id,rarity);for(const row of c.b.board)row.fill(null);c.u.side=side;
 const col=side==='p'?4:7,dir=side==='p'?1:-1;
 const target=forgeUnit('militia',side==='p'?'e':'p',{hp:40,maxhp:40,armor:3,stun:99});
 c.b.board[0][col]=c.u;c.b.board[0][col+dir]=target;c.b.phase=side==='p'?'player':'enemy';
 return {...c,target,col,dir};
}
export function directForgeHit(b,attacker,target,raw=attacker.atk,ignoreArmor=false){
 const lane=b.board.findIndex(row=>row.includes(target));
 return hit(b,target,raw,attacker.side,ignoreArmor,true,{attacker,from:b.board[lane].indexOf(attacker),to:b.board[lane].indexOf(target),sameLine:true});
}
