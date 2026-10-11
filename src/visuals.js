// Art original issu des illustrations créées pour Couronnes & Arcanes.
// Un archétype partagé ne prétend pas être une illustration unique pour chacune des 60 cartes.
export const ART_NAMES=['paladin','ranger','treant','dragon','healer','griffin','golem','shade','blizzard','knight','archer','sunlight'];
const direct={
 militia:'knight',shield:'paladin',archer:'archer',cleric:'healer',paladin:'paladin',banner:'knight',
 ranger:'ranger',wolf:'griffin',treant:'treant',dryad:'healer',stag:'griffin',thorn:'ranger',
 bone:'knight',shade:'shade',crypt:'paladin',plague:'shade',lich:'shade',banshee:'shade',
 smith:'knight',golem:'golem',bomb:'golem',drill:'golem',colossus:'golem',engineer:'knight',
 spark:'blizzard',mystic:'blizzard',elemental:'blizzard',griffin:'griffin',sentinel:'golem',dragon:'dragon',
 scoutcaptain:'knight',sunpriest:'healer',lancer:'paladin',dawnbastion:'healer',
 pixie:'sunlight',bear:'griffin',archdruid:'treant',owl:'griffin',
 vampire:'shade',graveknight:'paladin',nightblade:'shade',spectre:'shade',
 cannon:'golem',mechanist:'knight',ironwraith:'golem',alchemist:'shade',
 tempest:'blizzard',seer:'blizzard',aetherknight:'paladin',seraph:'healer',
 firebolt:'sunlight',healing:'healer',warcry:'paladin',storm:'blizzard',entangle:'treant',sanctuary:'sunlight',
 sundawn:'sunlight',bloodpact:'healer',arcflare:'blizzard',vines:'treant',
 seal_silence:'shade',mist_inquisitor:'shade',transposition:'blizzard',portal_walker:'blizzard',rune_trap:'sunlight',sylvan_trapper:'ranger',
 skill_guard_wall:'paladin',skill_guard_rally:'knight',skill_arc_freeze:'blizzard',skill_arc_chain:'blizzard',
 skill_ranger_pierce:'archer',skill_ranger_draw:'ranger',skill_cleric_light:'healer',skill_cleric_bless:'sunlight'
};
const roles={
 wolf:'beast',bear:'beast',stag:'beast',griffin:'flying',dragon:'flying',pixie:'flying',owl:'flying',
 dawnbastion:'flying',seraph:'flying',treant:'heavy',archdruid:'caster',
 golem:'heavy',colossus:'heavy',drill:'heavy',ironwraith:'heavy',cannon:'heavy',sentinel:'heavy',
 shade:'undead',bone:'undead',crypt:'undead',plague:'undead',banshee:'caster',lich:'caster',vampire:'undead',graveknight:'undead',spectre:'undead',nightblade:'undead',
 archer:'ranged',ranger:'ranged',owl:'flying',seer:'caster',mystic:'caster',spark:'caster',elemental:'caster',tempest:'caster',
 cleric:'support',dryad:'support',sunpriest:'support',seraph:'flying',
 alchemist:'caster',archdruid:'caster',engineer:'heavy',mechanist:'heavy'
};
export function visualFor(card){
 if(!card)return {art:'knight',role:'heavy'};
 const art=direct[card.id] || (card.faction==='ombre'?'shade':card.faction==='forge'?'golem':card.faction==='sylve'?'ranger':card.faction==='ether'?'blizzard':'knight');
 const role=card.type==='sort'?'spell':roles[card.id]||(card.ability==='ranged'?'ranged':card.ability==='heal'?'support':card.ability==='armor'?'heavy':card.ability==='splash'?'caster':'fighter');
 return {art,role};
}

// In the standalone HTML, the build embeds image bytes in this map.
export const INLINE_CREATURES={};
export function artSrc(name){return INLINE_CREATURES[name]||`./assets/creatures/${name}.webp`;}
