// Combat préparé pour le navigateur : unités/statistiques du registre, barrière
// via la primitive existante. Aucune attribution manuelle de l'effet Foreuse.
import assert from 'node:assert/strict';
import {CARDS,CAMPAIGN} from '../../src/data.js';
import {createBattle,playPlayerCard} from '../../src/engine.js';
import {resolveUnitDefinition} from '../../src/cards/definitions.js';
import {grantSharedBarrier} from '../../src/engine/unit-barriers.js';
import {validStoredBattle} from '../../src/ui/storage.js';

const profile=JSON.parse(process.argv[2]),before=structuredClone(profile);
const b=createBattle(profile,CAMPAIGN[5],11,{turnFlow:'alternating'});
for(const hero of Object.values(b.heroes))Object.assign(hero,{hand:[],deck:[],discard:[]});
b.heroes.p.hand=[{id:'drill',rarity:'légendaire',wait:0}];
assert.equal(playPlayerCard(b,0,0,1).ok,true);
const d=resolveUnitDefinition('golem');
const target={uid:b.nextUnitId++,id:'golem',side:'e',rarity:d.rarity,cardRules:b.cardRules,
 atk:d.stats.attack,hp:d.stats.hp,maxhp:d.stats.hp,armor:d.abilities.armor.amount,
 ranged:false,ability:CARDS.golem.ability,stun:0,poison:0,poisonTurns:0};
grantSharedBarrier(target,5,6);b.board[0][2]=target;
assert.equal(validStoredBattle(b),true);assert.deepEqual(profile,before);
console.log(JSON.stringify({battle:b,plan:{seed:11,turn:1,opening:0,targetUid:target.uid}}));
