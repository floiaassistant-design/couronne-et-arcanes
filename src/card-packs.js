// Contenu et probabilités des paquets ; aucune statistique ni possession de carte.
import {CARDS} from './data.js';
import {EVOLUTION_FUSIONS} from './evolution-fusion.js';
import {freezeCardData} from './cards/schema.js';

const natives=Object.values(CARDS).filter(c=>!c.heroClass);
const nativeRank=rarity=>natives.filter(c=>c.rarity===rarity).map(c=>c.id);
const evolutionRank=rarity=>EVOLUTION_FUSIONS.filter(r=>r.to===rarity).map(r=>({id:r.cardId,rarity:r.to}));
export const CARD_PACKS=freezeCardData([
 {id:'mystic',name:'Paquet mystique',cost:95,count:3,mission:null,groups:[
  {label:'Carte de base Commune',weight:65,cards:nativeRank('commun')},
  {label:'Carte de base Rare',weight:28,cards:nativeRank('rare')},
  {label:'Carte de base Épique',weight:7,cards:nativeRank('épique')}
 ]},
 {id:'aube-evolution',name:'Paquet d’évolution de l’Aube',cost:190,count:3,mission:'03',groups:[
  {label:'Carte de base de l’Aube (Commune ou Rare)',weight:60,cards:natives.filter(c=>c.faction==='aube'&&['commun','rare'].includes(c.rarity)).map(c=>c.id)},
  {label:'Évolution Aube Rare',weight:35,cards:evolutionRank('rare')},
  {label:'Évolution Aube Épique',weight:5,cards:evolutionRank('épique')}
 ]}
]);
export const cardPack=id=>CARD_PACKS.find(p=>p.id===id)||null;
export const evolutionPackFor=(id,rarity)=>CARD_PACKS.find(p=>p.groups.some(g=>g.cards.some(ref=>typeof ref==='object'&&ref.id===id&&ref.rarity===rarity)))||null;
