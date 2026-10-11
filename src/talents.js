// Talents V2.3 : deux embranchements exclusifs par palier et par classe.
// Les décisions ne concernent que le joueur. Aucun paiement et aucun bonus d'attaque passif.
export const TALENT_LEVELS = Object.freeze({1:4, 2:8});
export const TALENT_TREE = Object.freeze({
 gardien:[
  {id:'gardien_rempart',tier:1,name:'Rempart ancien',desc:'+3 boucliers au début du combat.'},
  {id:'gardien_serment',tier:1,name:'Serment vivant',desc:'Le pouvoir soigne le héros de 2 PV supplémentaires.'},
  {id:'gardien_sentinelle',tier:2,name:'Veille protectrice',desc:'Le pouvoir soigne de 2 PV votre allié le plus blessé.'},
  {id:'gardien_barriere',tier:2,name:'Bastion runique',desc:'Le pouvoir accorde 1 bouclier supplémentaire.'}
 ],
 arcaniste:[
  {id:'arcaniste_focus',tier:1,name:'Éclat concentré',desc:'+1 dégât au pouvoir du héros.'},
  {id:'arcaniste_barriere',tier:1,name:'Voile astral',desc:'Le pouvoir vous accorde 2 boucliers.'},
  {id:'arcaniste_echos',tier:2,name:'Écho des étoiles',desc:'Le pouvoir inflige 2 dégâts à une seconde unité ennemie, si possible.'},
  {id:'arcaniste_tissage',tier:2,name:'Tissage vital',desc:'Le pouvoir soigne le héros de 2 PV.'}
 ],
 rodeur:[
  {id:'rodeur_precision',tier:1,name:'Tir précis',desc:'+2 dégâts du pouvoir sur chaque ligne touchée.'},
  {id:'rodeur_couvert',tier:1,name:'Repli couvert',desc:'Le pouvoir vous accorde 2 boucliers.'},
  {id:'rodeur_poursuite',tier:2,name:'Réserve de flèches',desc:'Une fois par combat, le pouvoir pioche 1 carte si la main n’est pas pleine.'},
  {id:'rodeur_concentration',tier:2,name:'Souffle du chasseur',desc:'Si le pouvoir touche un ennemi, récupérez 2 PV.'}
 ],
 clerc:[
  {id:'clerc_soutien',tier:1,name:'Main secourable',desc:'Le pouvoir soigne chaque allié ciblé de 2 PV et le héros de 1 PV supplémentaires.'},
  {id:'clerc_foi',tier:1,name:'Foi rayonnante',desc:'Le pouvoir vous accorde 2 boucliers.'},
  {id:'clerc_purification',tier:2,name:'Purification',desc:'Le pouvoir retire poison et immobilisation des alliés, et donne +1 bouclier au héros.'},
  {id:'clerc_souffle',tier:2,name:'Souffle de grâce',desc:'Le pouvoir soigne le héros de 2 PV supplémentaires.'}
 ]
});
const talentById = Object.fromEntries(Object.entries(TALENT_TREE).flatMap(([hero,perks])=>perks.map(t=>[t.id,{...t,hero}])));
export function talentInfo(id){return talentById[id] || null;}
export function normalizeTalentChoices(raw){
 const choices={};
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return choices;
 for(const [hero,entries] of Object.entries(TALENT_TREE)){
  const picked=raw[hero];
  if(!picked||typeof picked!=='object'||Array.isArray(picked))continue;
  const found={};
  for(const tier of [1,2]){
   const id=picked[tier];
   if(entries.some(perk=>perk.id===id&&perk.tier===tier))found[tier]=id;
  }
  if(Object.keys(found).length)choices[hero]=found;
 }
 return choices;
}
export function chosenTalents(profile,level){
 return Object.values(profile?.talents?.[profile?.heroClass]||{}).filter(id=>{
  const info=talentInfo(id);
  return info&&info.hero===profile.heroClass&&Number(level)>=TALENT_LEVELS[info.tier];
 });
}
