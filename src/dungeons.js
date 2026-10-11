// Three original solo expeditions. The mission decks share the public card pool
// with campaign encounters; no server, paywall or hidden rewards are required.
import {CAMPAIGN,CARDS} from './data.js';
export const DUNGEONS=[
 {id:'ysara',name:'Les Racines d’Ysara',region:'Sylve ancienne',icon:'♣',description:'Trois salles au cœur d’une forêt réveillée. Des bêtes, des dryades, puis un gardien ancestral.',unlock:'archdruid',bonusGold:65,bonusShards:22,
  stages:[
   {name:'L’Entrée moussue',enemy:'Veilleur de mousse',source:'01',hp:17,difficulty:1,aiStyle:'meute',gold:21,shards:7},
   {name:'Le Sanctuaire vert',enemy:'Prêtresse des Ronces',source:'02',hp:21,difficulty:2,aiStyle:'meute',gold:28,shards:10},
   {name:'Le Cœur noueux',enemy:'Ancien des Profondeurs',source:'03',hp:26,difficulty:2,aiStyle:'bastion',boss:true,gold:45,shards:15}
  ]},
 {id:'braise',name:'La Fonderie des Cendres',region:'Marches brûlantes',icon:'⚒',description:'Franchissez les ateliers, les galeries de fer et la salle du colosse.',unlock:'cannon',bonusGold:90,bonusShards:32,
  stages:[
   {name:'Les Hauts-Fours',enemy:'Sapeur des Cendres',source:'04',hp:24,difficulty:2,aiStyle:'assaut',gold:32,shards:12},
   {name:'La Machine éveillée',enemy:'Ingénieure des Runes',source:'05',hp:29,difficulty:3,aiStyle:'bastion',gold:41,shards:15},
   {name:'Le Trône de Fer',enemy:'Colosse du Soufre',source:'06',hp:34,difficulty:3,aiStyle:'assaut',boss:true,gold:58,shards:20}
  ]},
 {id:'minuit',name:'Les Cryptes de Minuit',region:'Terres du Voile',icon:'☾',description:'Affrontez les sentinelles mortes, une cour d’ombres et la souveraine de la crypte.',unlock:'vampire',bonusGold:120,bonusShards:46,
  stages:[
   {name:'Les Ossuaires',enemy:'Porte-Cendres',source:'07',hp:29,difficulty:3,aiStyle:'meute',gold:45,shards:16},
   {name:'Le Palais englouti',enemy:'Conseiller spectral',source:'08',hp:34,difficulty:4,aiStyle:'rituel',gold:55,shards:19},
   {name:'La Cour sans Soleil',enemy:'Reine des Sépulcres',source:'09',hp:39,difficulty:4,aiStyle:'rituel',boss:true,gold:78,shards:28}
  ]}
];
export function dungeonById(id){return DUNGEONS.find(d=>d.id===id)||null;}
export function dungeonStageMission(dungeonId,stage){
 const d=dungeonById(dungeonId);if(!d||!Number.isInteger(stage)||stage<0||stage>=d.stages.length)throw Error('Étape de donjon invalide');
 const s=d.stages[stage],reference=CAMPAIGN.find(m=>m.id===s.source);
 if(!reference||!reference.deck.every(id=>CARDS[id]))throw Error('Donjon non configuré');
 return {id:`D_${d.id}_${stage+1}`,mode:'dungeon',dungeonId:d.id,dungeonStage:stage,region:d.region,
  name:s.name,enemy:s.enemy,difficulty:s.difficulty,hp:s.hp,deck:[...reference.deck],aiStyle:s.aiStyle,boss:!!s.boss,
  reward:s.gold,shards:s.shards,story:d.description,unlock:null};
}

// Optional event encounter between rooms, never counted as a fourth main room.
export function dungeonBonusMission(id,stage){
 const base=dungeonStageMission(id,stage);
 if(stage<1)throw Error('Épreuve bonus uniquement entre deux salles');
 return {...base,id:`B_${id}_${stage+1}`,name:`Embuscade — ${base.name}`,
  enemy:`Chasseur de reliques · ${base.enemy}`,hp:base.hp+4,difficulty:Math.min(5,base.difficulty+1),
  reward:85+stage*15,shards:32+stage*8,boss:false,bonusEncounter:true};
}
