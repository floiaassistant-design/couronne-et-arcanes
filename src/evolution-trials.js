// Premier parcours d'obtention : références de versions, objectifs et rencontres.
// Les chiffres et pouvoirs restent exclusivement dans le registre de cartes.
import {freezeCardData} from './cards/schema.js';
export const EVOLUTION_TRIALS=freezeCardData([
 {id:'aube-militia-rare',name:'Tenir jusqu’à l’aube',cardId:'militia',from:'commun',to:'rare',mission:'01',
  goal:{metric:'turns',target:3},
  objective:'Remporter la bataille avec au moins un Milicien Commun encore vivant.',
  enemy:'Patrouille des Brumes',difficulty:1,hp:16,aiStyle:'equilibre',deck:['militia','militia','shield','archer','militia','healing','militia','archer']},
 {id:'aube-shield-rare',name:'Le serment du Porte-égide',cardId:'shield',from:'commun',to:'rare',mission:'02',
  goal:{metric:'ripostes',target:2},
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
// Deux épreuves communes ouvrent les fusions de tout l'Ordre, sans carte offerte.
export const EVOLUTION_ASCENSIONS=freezeCardData([
 {id:'aube-ascension-divine',kind:'ascension',faction:'aube',name:'Le Serment divin',from:'légendaire',to:'divine',mission:'09',
  goal:{distinct:3,crownPercent:40,maxRound:24},
  enemy:'Conseil des Serments',difficulty:5,hp:48,boss:true,aiStyle:'bastion',
  deck:['shield','paladin','archer','cleric','lancer','banner','shield','paladin','sunpriest','archer','healing','warcry','shield','lancer','cleric','storm']},
 {id:'aube-ascension-eveillee',kind:'ascension',faction:'aube',name:'L’Éveil du Bastion',from:'divine',to:'éveillée',mission:'12',previous:'aube-ascension-divine',
  goal:{distinct:4,crownPercent:60,maxRound:24},
  enemy:'Gardien de l’Éveil',difficulty:6,hp:60,boss:true,aiStyle:'assaut',
  deck:['dawnbastion','paladin','shield','lancer','sunpriest','archer','banner','paladin','dawnbastion','shield','storm','healing','warcry','lancer','paladin','sunpriest','archer','shield']}
]);
export const ALL_EVOLUTION_TRIALS=Object.freeze([...EVOLUTION_TRIALS,...EVOLUTION_ASCENSIONS]);
export const evolutionTrial=id=>ALL_EVOLUTION_TRIALS.find(t=>t.id===id)||null;
export const evolutionTrialFor=(id,rarity)=>EVOLUTION_TRIALS.find(t=>t.cardId===id&&t.to===rarity)||null;
export const evolutionAscensionFor=(faction,rarity)=>EVOLUTION_ASCENSIONS.find(t=>t.faction===faction&&t.to===rarity)||null;
