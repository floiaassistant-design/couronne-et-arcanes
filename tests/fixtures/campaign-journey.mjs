// Itinéraire reproductible pour l’audit dans le navigateur.
import assert from 'node:assert/strict';
import {CAMPAIGN} from '../../src/data.js';
import {freshProfile,completeBattle,upgradeBuilding,upgradeCard} from '../../src/engine.js';
import {simulateBattle} from '../../scripts/lib/battle_runner.mjs';

const seeds=[2,1,5,1,1,1,1,1,2,1,1,2];
const profile=freshProfile();
profile.guideSeen=true;
const route=CAMPAIGN.map((mission,index)=>{
 const upgrades=[];
 if(index){
  for(const id of ['forge','bastion'])if(upgradeBuilding(profile,id).ok)upgrades.push({type:'building',id});
  for(const id of ['archer','militia','shield','ranger','spark'])if(upgradeCard(profile,id).ok)upgrades.push({type:'card',id});
 }
 const actions=[];
 let battle;
 const seed=seeds[index];
 const result=simulateBattle(profile,mission,seed,{
  turnFlow:'alternating',observe:state=>{battle=state;},observeAction:action=>actions.push(action)
 });
 assert(result.win,'Mission '+mission.id+' : itinéraire sans victoire');
 completeBattle(profile,mission,battle);
 return {id:mission.id,seed,upgrades,actions,turns:battle.round,expected:structuredClone(profile)};
});
process.stdout.write(JSON.stringify(route));
