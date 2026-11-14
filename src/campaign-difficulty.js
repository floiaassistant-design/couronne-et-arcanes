import {CAMPAIGN} from './data.js';

const HARD_REINFORCEMENTS=Object.freeze({
 '06':Object.freeze({id:'golem',rarity:'légendaire',label:'Golem runique Légendaire'}),
 '12':Object.freeze({id:'sentinel',rarity:'divine',label:'Sentinelle prismatique Divine'})
});

export function hardCampaignReinforcement(missionId){
 return Object.hasOwn(HARD_REINFORCEMENTS,missionId)?HARD_REINFORCEMENTS[missionId]:null;
}

export function campaignMission(missionId,difficulty='normal'){
 const mission=CAMPAIGN.find(entry=>entry.id===missionId);
 if(!mission||difficulty==='normal')return mission;
 if(difficulty!=='hard')return null;

 const reinforcement=hardCampaignReinforcement(missionId);
 if(!reinforcement)return null;
 const index=mission.deck.indexOf(reinforcement.id);
 if(index===-1)throw Error('La carte à faire évoluer est absente du deck adverse.');
 const deck=mission.deck.slice();
 deck[index]={id:reinforcement.id,rarity:reinforcement.rarity};
 return {...mission,deck,campaignDifficulty:'hard'};
}
