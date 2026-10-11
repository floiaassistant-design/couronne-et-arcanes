// Collections de laboratoire : simulations uniquement, jamais attribuées au joueur.
import {CARDS} from '../../src/data.js';
import {freshProfile} from '../../src/engine.js';

export const LAB_COLLECTIONS=Object.freeze(['depart','progression','catalogue']);
export function makeLabProfile(level,heroClass='gardien'){
 if(!LAB_COLLECTIONS.includes(level))throw Error(`Collection inconnue : ${level}`);
 const p=freshProfile();p.heroClass=heroClass;
 if(level==='depart')return p;
 if(level==='progression'){
  const bonus={shield:3,archer:3,ranger:3,wolf:3,treant:2,dryad:2,cleric:2,
   golem:2,sentinel:2,griffin:2,mystic:3,spark:3,nightblade:3,shade:2,
   firebolt:3,healing:3,storm:2,entangle:2,warcry:2,sanctuary:2};
  p.collection={...p.collection,...bonus};
  p.buildings.bastion=1;p.upgrades={militia:1,ranger:1,shield:1};
  p.reputation.aube=6;p.reputation.sylve=6;
 }else{
  p.collection=Object.fromEntries(Object.values(CARDS).map(c=>[c.id,c.rarity==='légendaire'?1:3]));
  p.buildings={bastion:2,forge:1,bibliotheque:1};
  p.equipmentOwned=['lame','cuirasse'];p.equipped={arme:'lame',armure:'cuirasse',relique:null};
  p.reputation={aube:15,sylve:15,ombre:10,forge:10,ether:10};
  p.upgrades={militia:1,shield:1,ranger:1,archer:1,wolf:1};
 }
 return p;
}
