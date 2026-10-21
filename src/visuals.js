// Décors d’interface : registre distinct des portraits de personnages.
export const UI_BACKGROUNDS=Object.freeze({collection:'collection_archives_v01'});
export const UI_ART_NAMES=Object.freeze(Object.values(UI_BACKGROUNDS));
// Base graphique neuve : aucune ancienne illustration n'est sélectionnable.
// Toute future clé doit être déclarée ici et dans assets/artwork.json.
export const ART_NAMES=[];
export const CARD_ARENA_ART={};
// Cartes complètes : mapping individuel, indépendant des portraits.
export const CARD_TEMPLATES=Object.freeze({
 militia:'milicien_aube_carte_v02',
 shield:'porte_egide_aube_carte_v01',
 archer:'arbaletriere_aube_carte_v01',
 lancer:'lancier_remparts_aube_carte_v01',
 cleric:'soeur_aurore_aube_carte_v01',
 banner:'porte_etendard_aube_carte_v01',
 scoutcaptain:'capitaine_aube_carte_v01',
 paladin:'paladin_solaire_aube_carte_v01',
 sunpriest:'prieur_solaire_aube_carte_v01',
 dawnbastion:'ange_bastion_aube_carte_v01',
 treant:'gardien_racines_sylve_carte_v01',
 ranger:'eclaireuse_sylvestre_carte_v01',
 wolf:'loup_brumes_sylve_carte_v01',
 dryad:'dryade_luminescente_sylve_carte_v01',
 stag:'cerf_astral_sylve_carte_v01',
 thorn:'traqueur_epines_sylve_carte_v01',
 pixie:'luciole_epineuses_sylve_carte_v01',
 bear:'ours_roches_sylve_carte_v01',
 archdruid:'archidruide_feuillage_sylve_carte_v01',
 owl:'hibou_crepuscule_sylve_carte_v01',
 sylvan_trapper:'trappeur_sylvestre_carte_v01',
 graveknight:'chevalier_tombeau_ombre_carte_v01',
 bone:'guerrier_ossements_ombre_carte_v01',
 shade:'ombre_vorace_carte_v01',
 crypt:'veilleur_tombeau_ombre_carte_v01',
 plague:'faucheur_fievre_ombre_carte_v01',
 lich:'archiliche_minuit_ombre_carte_v01',
 banshee:'banshee_voiles_ombre_carte_v01',
 vampire:'vampire_obsidienne_ombre_carte_v01',
 nightblade:'lame_nocturne_ombre_carte_v01',
 spectre:'spectre_caveau_ombre_carte_v01',
 mist_inquisitor:'inquisiteur_brumes_ombre_carte_v01'
});
export const CARD_ART_NAMES=Object.freeze(Object.values(CARD_TEMPLATES));
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
