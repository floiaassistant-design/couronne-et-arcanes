// Combat préparé : vraie fusion/invocation, puis interception par le moteur.
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {CAMPAIGN} from '../../src/data.js';
import {freshProfile,fuseEvolutionCopies,modifyDeck,createBattle,playPlayerCard} from '../../src/engine.js';
import {evolutionFusionFor} from '../../src/evolution-fusion.js';
import {validateImportedProfile,validStoredBattle} from '../../src/ui/storage.js';
import {forgeUnit as unit} from './forge-combat.mjs';

export function golemFixture(profile,rank){
 const p=structuredClone(profile),r=evolutionFusionFor('golem',rank);
 assert(r);p.deck=freshProfile().deck.slice(0,11);p.evolvedCollection??={};
 p.evolvedCollection['golem:'+r.from]=(p.evolvedCollection['golem:'+r.from]||0)+3;
 const fused=fuseEvolutionCopies(p,r.id);assert(fused.ok,fused.reason);assert(modifyDeck(p,fused.target,1));
 assert.deepEqual(validateImportedProfile(p),p);
 const b=createBattle(p,CAMPAIGN[5],11,{turnFlow:'alternating'});
 for(const h of Object.values(b.heroes))Object.assign(h,{hand:[],deck:[],discard:[]});
 b.heroes.p.shield=0;b.heroes.p.hand=[{...fused.target,wait:0}];
 const lane=rank==='éveillée'?1:0;
 assert(playPlayerCard(b,0,lane,3).ok);const golem=b.board[lane][3];
 const attacker=unit('archer','e');attacker.uid=b.nextUnitId++;
 b.board[0][2]=attacker;delete b.vfx;
 assert(validStoredBattle(b));
 return {profile:p,battle:b,seed:11,golemUid:golem.uid,attackerUid:attacker.uid,maxhp:golem.maxhp,rank};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)console.log(JSON.stringify(golemFixture(JSON.parse(process.argv[2]),process.argv[3])));
