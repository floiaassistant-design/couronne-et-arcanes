// Premier parcours d'obtention : références de versions, objectifs et rencontres.
// Les chiffres et pouvoirs restent exclusivement dans le registre de cartes.
import {freezeCardData} from './cards/schema.js';
export const EVOLUTION_TRIALS=freezeCardData([
 {id:'aube-militia-rare',name:'Tenir jusqu’à l’aube',cardId:'militia',from:'commun',to:'rare',mission:'01',
  goal:{metric:'turns',target:3},
  objective:'Remporter la bataille avec au moins un Milicien Commun encore vivant.',
  enemy:'Patrouille des Brumes',difficulty:1,hp:16,aiStyle:'equilibre',deck:['militia','militia','shield','archer','militia','healing','militia','archer']},
 {id:'aube-shield-rare',name:'Le serment du Porte-égide',cardId:'shield',from:'commun',to:'rare',mission:'02',
  goal:{metric:'interceptions',target:2},
  objective:'Remporter la bataille avec au moins un Porte-égide Commun encore vivant.',
  enemy:'Éclaireurs des Brumes',difficulty:1,hp:18,aiStyle:'assaut',deck:['militia','ranger','militia','wolf','militia','healing','ranger','militia']},
 {id:'aube-archer-rare',name:'La dernière volée',cardId:'archer',from:'commun',to:'rare',mission:'02',
  goal:{metric:'rangedDamage',target:4},
  objective:'Remporter la bataille avec au moins une Arbalétrière Commune encore vivante.',
  enemy:'Gardes du chemin',difficulty:1,hp:18,aiStyle:'bastion',deck:['shield','militia','shield','militia','healing','militia','archer','militia']},
 {id:'aube-militia-epic',name:'Le rempart du Bosquet',cardId:'militia',from:'rare',to:'épique',mission:'03',previous:'aube-militia-rare',
  goal:{metric:'firstHit',target:1},
  objective:'Remporter la bataille avec au moins un Milicien Rare encore vivant.',
  enemy:'Gardien de l’épreuve du Bosquet',difficulty:2,hp:22,aiStyle:'bastion',deck:['treant','militia','ranger','dryad','shield','wolf','militia','healing','archer','militia','shield','ranger']}
]);
export const evolutionTrial=id=>EVOLUTION_TRIALS.find(t=>t.id===id)||null;
export const evolutionTrialFor=(id,rarity)=>EVOLUTION_TRIALS.find(t=>t.cardId===id&&t.to===rarity)||null;
