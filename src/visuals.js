// Décors d’interface : registre distinct des portraits de personnages.
export const UI_BACKGROUNDS=Object.freeze({collection:'collection_archives_v01'});
export const UI_ART_NAMES=Object.freeze(Object.values(UI_BACKGROUNDS));
// Base graphique neuve : aucune ancienne illustration n'est sélectionnable.
// Toute future clé doit être déclarée ici et dans assets/artwork.json.
export const ART_NAMES=[];
export const CARD_ARENA_ART={};
// Cartes complètes : mapping individuel, indépendant des portraits.
export const CARD_ART_NAMES=Object.freeze(['milicien_aube_carte_v02']);
export const CARD_TEMPLATES=Object.freeze({militia:'milicien_aube_carte_v02'});
export const INLINE_CARDS={};
export function cardTemplateFor(card){return CARD_TEMPLATES[card?.id]||null;}
export function cardTemplateSrc(key){return CARD_ART_NAMES.includes(key)?INLINE_CARDS[key]||'./assets/cards/'+key+'.webp':null;}

const roles={
 wolf:'beast',bear:'beast',stag:'beast',griffin:'flying',dragon:'flying',
 pixie:'flying',owl:'flying',dawnbastion:'flying',seraph:'flying',
 treant:'heavy',golem:'heavy',colossus:'heavy',drill:'heavy',
 ironwraith:'heavy',cannon:'heavy',sentinel:'heavy',
 shade:'undead',bone:'undead',crypt:'undead',plague:'undead',
 vampire:'undead',graveknight:'undead',spectre:'undead',nightblade:'undead',
 banshee:'caster',lich:'caster',archdruid:'caster',seer:'caster',
 mystic:'caster',spark:'caster',elemental:'caster',tempest:'caster',
 alchemist:'caster',engineer:'heavy',mechanist:'heavy',
 archer:'ranged',ranger:'ranged',cleric:'support',dryad:'support',sunpriest:'support'
};
export function visualFor(card){
 const role=!card?'heavy':card.type==='sort'?'spell':roles[card.id]||
  (card.ability==='ranged'?'ranged':card.ability==='heal'?'support':
   card.ability==='armor'?'heavy':card.ability==='splash'?'caster':'fighter');
 return {art:card?CARD_ARENA_ART[card.id]||null:null,role};
}
const placeholder='<svg xmlns="http://www.w3.org/2000/svg" width="384" height="576" viewBox="0 0 384 576"><rect width="384" height="576" fill="#142538"/><path d="M192 176l70 112-70 112-70-112z" fill="none" stroke="#9a865e" stroke-width="3"/><circle cx="192" cy="288" r="24" fill="none" stroke="#9a865e" stroke-width="2"/></svg>';
export const PLACEHOLDER_ART='data:image/svg+xml,'+encodeURIComponent(placeholder);
// Remplacée par le builder avec les seuls fichiers approuvés du registre actif.
export const INLINE_CREATURES={};
export function artSrc(name){
 if(!ART_NAMES.includes(name))return PLACEHOLDER_ART;
 return INLINE_CREATURES[name]||`./assets/creatures/${name}.webp`;
}
