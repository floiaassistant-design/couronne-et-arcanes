// Identité des versions : indépendante des achats et compatible avec les rangs UI historiques.
export function freezeCardData(value){
 if(value&&typeof value==='object'&&!Object.isFrozen(value)){
  for(const child of Object.values(value))freezeCardData(child);
  Object.freeze(value);
 }
 return value;
}

export const CARD_RARITIES=freezeCardData([
 {id:'commun',name:'Commun'},
 {id:'rare',name:'Rare'},
 {id:'épique',name:'Épique'},
 {id:'légendaire',name:'Légendaire'},
 {id:'divine',name:'Divin'},
 {id:'éveillée',name:'Éveillé'}
]);
const aliases=Object.freeze({divin:'divine','éveillé':'éveillée'});
export function normalizeCardRarity(value){
 if(typeof value!=='string')return null;
 const lower=value.normalize('NFC').toLowerCase();
 const id=Object.hasOwn(aliases,lower)?aliases[lower]:lower;
 return CARD_RARITIES.some(rank=>rank.id===id)?id:null;
}
