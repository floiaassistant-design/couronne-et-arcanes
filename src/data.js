// COURONNES & ARCANES — data-driven, wholly original game content.
const raw = [
// id | name | faction | rarity | cd | atk | hp | ability | icon | description
['militia','Milicien de l’Aube','aube','commun',0,2,5,'','⚔','Un soldat loyal, solide en première ligne.'],
['shield','Porte-égide','aube','commun',1,1,9,'armor','⬡','Garde et Riposte : intercepte et contre-attaque au corps à corps.'],
['archer','Arbalétrière','aube','commun',1,2,3,'ranged','➶','Peut attaquer à deux cases.'],
['cleric','Sœur de l’Aurore','aube','rare',2,1,4,'heal','✧','Soigne un allié après chaque affrontement.'],
['paladin','Paladin solaire','aube','épique',3,4,9,'armor','♜','Armure et Riposte : contre-attaque une fois par tour au corps à corps.'],
['banner','Porte-étendard','aube','rare',2,2,6,'inspire','⚑','Renforce les autres alliés sur sa ligne.'],
['ranger','Éclaireuse sylvestre','sylve','commun',0,2,4,'ranged','➶','Tire à distance dans les profondeurs de la forêt.'],
['wolf','Loup des Brumes','sylve','commun',0,3,3,'haste','♞','Célérité et Charge : +2 attaque après un déplacement avant de frapper.'],
['treant','Gardien des Racines','sylve','rare',2,3,10,'armor','♣','Garde : protecteur robuste des bois anciens.'],
['dryad','Dryade luminescente','sylve','rare',2,1,5,'heal','❀','Régénère les créatures de sa ligne.'],
['stag','Cerf astral','sylve','épique',3,5,6,'haste','♘','Charge : une attaque renforcée après déplacement.'],
['thorn','Traqueur d’épines','sylve','commun',1,2,5,'poison','❧','Inflige un poison persistant à sa cible.'],
['bone','Guerrier d’ossements','ombre','commun',0,3,3,'','☠','Un combattant revenu des cryptes.'],
['shade','Ombre vorace','ombre','rare',1,3,3,'haste','☾','Contourne rapidement les défenses.'],
['crypt','Veilleur du tombeau','ombre','commun',1,2,7,'armor','♜','Garde : la pierre protège ses os animés.'],
['plague','Faucheur de fièvre','ombre','rare',2,3,5,'poison','☣','Ses coups provoquent des dégâts différés.'],
['lich','Archiliche de Minuit','ombre','légendaire',4,6,9,'splash','✺','Ses attaques frappent aussi une autre cible.'],
['banshee','Banshee des Voiles','ombre','épique',3,4,5,'ranged','☽','Vol : peut franchir un allié et frapper à distance depuis les brumes.'],
['smith','Marteau des Monts','forge','commun',1,3,6,'','⚒','Forge une brèche dans la ligne adverse.'],
['golem','Golem runique','forge','rare',2,2,12,'armor','⬢','Garde : créature de pierre presque indestructible.'],
['bomb','Sapeur gobelin','forge','rare',2,4,3,'splash','✷','Ses charges endommagent plusieurs ennemis.'],
['drill','Foreur de fer','forge','commun',0,2,5,'armor','⚙','Un mécanisme de guerre fiable.'],
['colossus','Colosse de braise','forge','légendaire',4,6,13,'armor','♜','Titan construit dans les hauts-fourneaux.'],
['engineer','Ingénieure d’acier','forge','épique',3,3,7,'inspire','⚒','Coordonne les machines sur sa ligne.'],
['spark','Feu follet','ether','commun',0,2,3,'ranged','✦','Esprit élémentaire qui frappe de loin.'],
['mystic','Oracle des Astres','ether','rare',2,3,4,'ranged','✧','Mage capable de viser les lignes ennemies.'],
['elemental','Élémentaire azuré','ether','épique',3,5,8,'splash','✺','Déchaîne une onde magique.'],
['griffin','Griffon du Zénith','ether','épique',3,5,6,'haste','♞','Vol : franchit une case occupée par un allié en avançant.'],
['sentinel','Sentinelle prismatique','ether','rare',2,2,9,'armor','◇','Garde : mur cristallin parcouru d’énergie.'],
['dragon','Dragon des Sept Cieux','ether','légendaire',5,7,12,'splash','♛','Vol : survole les unités alliées qui lui barrent le passage.'],
['firebolt','Lame de feu','sort','commun',1,0,0,'spell_bolt','✷','Inflige 4 dégâts à l’ennemi le plus avancé d’une ligne.'],
['healing','Souffle vital','sort','commun',1,0,0,'spell_heal','✚','Rend 5 PV au héros et 2 PV aux alliés de la ligne.'],
['warcry','Cri des anciens','sort','rare',2,0,0,'spell_buff','⚑','Donne +2 attaque aux alliés d’une ligne.'],
['storm','Orage runique','sort','épique',3,0,0,'spell_storm','ϟ','Inflige 3 dégâts à tous les ennemis d’une ligne.'],
['entangle','Prison de lierre','sort','rare',2,0,0,'spell_root','❧','Immobilise l’ennemi le plus avancé pendant un tour.'],
['sanctuary','Sanctuaire','sort','rare',2,0,0,'spell_ward','⬡','Accorde un bouclier de 5 points au héros.'],
];
// Additional cards for the expanded edition (all original characters and names).
const expansion = [
['scoutcaptain','Capitaine de l’Aube','aube','rare',1,3,6,'inspire','⚑','Coordonne la ligne et renforce ses alliés.'],
['sunpriest','Prieur solaire','aube','rare',2,2,7,'heal','✝','Restaure régulièrement un allié blessé.'],
['lancer','Lancier des Remparts','aube','commun',1,3,5,'pierce','⚔','Perce les armures avec une lance de siège.'],
['dawnbastion','Ange du Bastion','aube','légendaire',4,5,11,'ward','✵','À l’arrivée, protège la couronne.'],
['pixie','Luciole des Épineuses','sylve','commun',0,2,3,'ward','✤','Protège la couronne en entrant en jeu.'],
['bear','Ours des Roches','sylve','rare',2,4,9,'armor','♞','Puissante sentinelle des vallons.'],
['archdruid','Archidruide Feuillage','sylve','épique',3,3,7,'heal','❀','Soigne les créatures forestières.'],
['owl','Hibou du Crépuscule','sylve','commun',1,2,4,'ranged','➶','Vol : franchit les alliés et guette sa proie à distance.'],
['vampire','Vampire d’Obsidienne','ombre','épique',3,5,6,'lifesteal','☾','Ses coups redonnent des PV au héros.'],
['graveknight','Chevalier du Tombeau','ombre','rare',2,4,8,'armor','♞','Une armure liée aux anciens serments.'],
['nightblade','Lame nocturne','ombre','commun',0,3,3,'pierce','⚔','Ignore les armures de ses cibles.'],
['spectre','Spectre du Caveau','ombre','rare',1,3,4,'haste','☄','Traverse rapidement les lignes.'],
['cannon','Canon des Terres Rouges','forge','épique',3,5,7,'ranged','✷','Tire à travers la mêlée.'],
['mechanist','Mécaniste des Hauts-Fours','forge','rare',2,2,8,'inspire','⚙','Entretient la cohésion des machines.'],
['ironwraith','Marchefer','forge','commun',1,2,7,'ward','⬢','Renforce le bouclier du souverain.'],
['alchemist','Alchimiste des Braises','forge','rare',2,3,5,'poison','⚗','Ses mixtures épuisent les ennemis.'],
['tempest','Esprit de Tempête','ether','rare',2,3,6,'splash','ϟ','Électricité parcourant deux ennemis.'],
['seer','Voyante des Étoiles','ether','commun',1,2,4,'ranged','✧','Attaque depuis l’arrière.'],
['aetherknight','Chevalier du Zénith','ether','épique',3,5,9,'pierce','♜','Transperce même les armures runiques.'],
['seraph','Séraphin d’Azur','ether','légendaire',4,5,10,'heal','✵','Vol : franchit les alliés et soigne les troupes blessées.'],
['sundawn','Rayon des Couronnes','sort','rare',2,0,0,'spell_bolt','☀','Inflige des dégâts sur une ligne ciblée.'],
['bloodpact','Pacte vital','sort','rare',2,0,0,'spell_heal','♡','Soigne le héros et une ligne entière.'],
['arcflare','Éclairs d’Obsidienne','sort','épique',3,0,0,'spell_storm','ϟ','Frappe toutes les unités ennemies sur une ligne.'],
['vines','Racines du Monde','sort','commun',1,0,0,'spell_root','❧','Immobilise la première unité ennemie.']
];
// V2.8 : compétences de classe originales. Une seule copie par recette d'apprentissage.
const classCards=[
 ['skill_guard_wall','Mur des Serments','sort','rare',2,0,0,'spell_guard_wall','⬡','Accorde 2 points de barrière aux alliés de la ligne (maximum 4).'],
 ['skill_guard_rally','Ralliement royal','sort','rare',2,0,0,'spell_guard_rally','⚑','Donne +1 attaque aux alliés de la ligne pendant deux tours, sans cumul.'],
 ['skill_arc_freeze','Gel astral','sort','rare',2,0,0,'spell_arc_freeze','❄','Inflige 1 dégât et immobilise le premier ennemi de la ligne.'],
 ['skill_arc_chain','Arc des éclairs','sort','épique',3,0,0,'spell_arc_chain','ϟ','Inflige 3 dégâts au premier ennemi et 2 au suivant sur la même ligne.'],
 ['skill_ranger_pierce','Flèche de rupture','sort','rare',2,0,0,'spell_ranger_pierce','➶','Inflige 5 dégâts à la première unité ennemie en ignorant son armure.'],
 ['skill_ranger_draw','Préparation du pisteur','sort','épique',3,0,0,'spell_ranger_draw','✦','Pioche jusqu’à 2 cartes supplémentaires (main limitée à 7).'],
 ['skill_cleric_light','Lumière de concorde','sort','rare',2,0,0,'spell_cleric_light','✚','Rend 3 PV à chaque allié blessé de la ligne.'],
 ['skill_cleric_bless','Bénédiction du refuge','sort','épique',3,0,0,'spell_cleric_bless','✧','Accorde 4 points de barrière à l’allié le plus blessé (maximum 6).']
];
export const CLASS_SKILLS=Object.freeze({
 skill_guard_wall:{hero:'gardien',level:3,shards:30},
 skill_guard_rally:{hero:'gardien',level:6,shards:70},
 skill_arc_freeze:{hero:'arcaniste',level:3,shards:30},
 skill_arc_chain:{hero:'arcaniste',level:6,shards:70},
 skill_ranger_pierce:{hero:'rodeur',level:3,shards:30},
 skill_ranger_draw:{hero:'rodeur',level:6,shards:70},
 skill_cleric_light:{hero:'clerc',level:3,shards:30},
 skill_cleric_bless:{hero:'clerc',level:6,shards:70}
});
const controlCards=[
 ['seal_silence','Sceau du Mutisme','sort','rare',2,0,0,'spell_silence','⊘','Réduit au silence la capacité ennemie la plus dangereuse de la ligne pour 2 résolutions. Attaques normales et traits passifs conservés. Non renouvelable immédiatement.'],
 ['mist_inquisitor','Inquisiteur des Brumes','ombre','rare',3,2,6,'silence','⊘','Avant le déplacement, réduit au silence un ennemi de sa ligne pour la résolution en cours. Capacité utilisable tous les 3 tours.'],
 ['transposition','Faille de Transposition','sort','rare',2,0,0,'spell_teleport','✧','Déplace vers la ligne choisie l’allié le plus avancé des autres lignes, à la même colonne libre. Exclut la case devant la couronne adverse ; une téléportation par créature et par tour.'],
 ['portal_walker','Marcheur des Portails','ether','rare',2,3,5,'portal','✧','Change de ligne à la même colonne si la position est avantageuse, avant le déplacement. Une fois tous les 3 tours ; aucune arrivée devant la couronne adverse.'],
 ['rune_trap','Piège runique','sort','commun',2,0,0,'spell_trap','⌁','Arme une case centrale libre (3, puis côté allié, puis opposé). Le prochain ennemi qui y arrive subit 3 dégâts avant armure. Dure 3 résolutions ; 2 pièges par camp maximum, visibles.'],
 ['sylvan_trapper','Trappeur sylvestre','sylve','commun',2,2,5,'trapper','⌁','Arme la case libre devant lui entre les colonnes 2 et 4, tous les 3 tours. Le prochain ennemi qui y arrive subit 1 dégât avant armure et perd son déplacement et son attaque de cette résolution. Piège visible, durée 3 résolutions.']
];
// V2.10 : sortilèges de tempo, sans modification des cartes précédentes.
const tempoCards=[
 ['hourglass_surge','Élan des Heures','sort','rare',1,0,0,'spell_hasten','◷','Réduit de 2 tours l’attente de la carte alliée la plus lente en main (égalité : première à gauche). Nécessite une autre carte en attente.'],
 ['time_bind','Nœud du Temps','sort','rare',2,0,0,'spell_slow','⌛','Retarde de 2 tours une carte de la main adverse parmi les plus proches d’être prêtes, sans révéler son identité (maximum 6 tours).']
];
raw.push(...expansion,...classCards,...controlCards,...tempoCards);
export const CARDS = Object.fromEntries(raw.map(([id,name,faction,rarity,delay,attack,hp,ability,icon,description]) =>
 [id,{id,name,faction,rarity,delay,attack,hp,ability,icon,description,type:ability.startsWith('spell_')?'sort':'unité',heroClass:CLASS_SKILLS[id]?.hero||null}]));

export const FLYING_IDS=new Set(['griffin','dragon','banshee','owl','pixie','dawnbastion','seraph']);
export const GUARD_IDS=new Set(['shield','treant','crypt','golem','sentinel']);
// Traits de V1.6, indépendants du pouvoir principal de chaque carte.
export const CHARGE_IDS=new Set(['wolf','stag','shade','spectre','griffin','lancer','graveknight','aetherknight']);
export const RIPOSTE_IDS=new Set(['shield','paladin','treant','graveknight','golem','sentinel','dawnbastion']);
export function cardTraits(id){
 const traits=[];
 if(FLYING_IDS.has(id))traits.push('Vol');
 if(GUARD_IDS.has(id))traits.push('Garde');
 if(CHARGE_IDS.has(id))traits.push('Charge');
 if(RIPOSTE_IDS.has(id))traits.push('Riposte');
 const c=CARDS[id];
 if(c?.ability==='pierce')traits.push('Perforation');
 if(c?.ability==='lifesteal')traits.push('Vol de vie');
 if(c?.ability==='poison')traits.push('Poison');
 if(c?.ability==='ranged')traits.push('Distance');
 if(c?.ability==='splash')traits.push('Impact de zone');
 if(c?.ability==='heal')traits.push('Soutien');
 if(c?.ability==='inspire')traits.push('Inspiration');
 if(c?.ability==='ward')traits.push('Protection');
 if(c?.ability==='haste')traits.push('Célérité');
 if(['silence','spell_silence'].includes(c?.ability))traits.push('Silence');
 if(['portal','spell_teleport'].includes(c?.ability))traits.push('Téléportation');
 if(['trapper','spell_trap'].includes(c?.ability))traits.push('Piège');
 return traits;
}
export const FACTIONS = {
 aube:{name:'Alliance de l’Aube',short:'Aube',tone:'#e8b968'},
 sylve:{name:'Conclave Sylvestre',short:'Sylve',tone:'#89c99f'},
 ombre:{name:'Cour des Ombres',short:'Ombre',tone:'#be91d9'},
 forge:{name:'Légions de la Forge',short:'Forge',tone:'#e99574'},
 ether:{name:'Ordre de l’Éther',short:'Éther',tone:'#8faef0'},
 sort:{name:'Arcanes',short:'Sort',tone:'#d8b4ef'}
};
export const CLASSES = {
 gardien:{name:'Gardien',subtitle:'Défense & régénération',symbol:'♜',description:'Serment protecteur : soigne le héros et fortifie les alliés.'},
 arcaniste:{name:'Arcaniste',subtitle:'Contrôle & puissance',symbol:'✦',description:'Éclat astral : frappe l’ennemi le plus avancé.'},
 rodeur:{name:'Rôdeur',subtitle:'Précision & tactique',symbol:'➶',description:'Volée : touche les premières unités ennemies sur chaque ligne.'},
 clerc:{name:'Clerc',subtitle:'Guérison & protection',symbol:'✚',description:'Bénédiction : soigne le héros et la créature la plus blessée sur chaque ligne.'}
};
export const CAMPAIGN = [
 {id:'01',aiStyle:'assaut',region:'Lisières d’Ysara',name:'Le Sentier des Brumes',enemy:'Sentinelle des bois',difficulty:1,hp:15,reward:42,shards:12,unlock:'wolf',deck:['militia','militia','archer','ranger','wolf','shield','ranger','militia','wolf','firebolt','healing','thorn','archer','militia'],story:'Des convois disparaissent au bord des vieux bois.'},
 {id:'02',aiStyle:'meute',region:'Lisières d’Ysara',name:'La Clairière Murmurante',enemy:'Druide égaré',difficulty:1,hp:20,reward:48,shards:14,unlock:'dryad',deck:['wolf','ranger','thorn','ranger','treant','militia','archer','dryad','thorn','wolf','healing','ranger','militia','warcry'],story:'La nature se retourne contre les voyageurs.'},
 {id:'03',aiStyle:'bastion',region:'Lisières d’Ysara',name:'Le Cœur du Chêne',enemy:'Gardien du Bosquet',difficulty:2,hp:21,reward:64,shards:18,unlock:'treant',boss:true,deck:['treant','treant','dryad','ranger','stag','wolf','thorn','treant','healing','warcry','ranger','wolf','dryad','archer','treant','wolf'],story:'Une créature ancienne barre l’accès aux vallées.'},
 {id:'04',aiStyle:'assaut',region:'La Marche Cendrée',name:'Le Pont des Exilés',enemy:'Capitaine d’Acier',difficulty:2,hp:23,reward:56,shards:16,unlock:'drill',deck:['drill','smith','militia','shield','smith','golem','archer','firebolt','drill','smith','warcry','shield','militia','archer','drill'],story:'Les légions contrôlent le dernier passage.'},
 {id:'05',aiStyle:'bastion',region:'La Marche Cendrée',name:'La Fonderie Oubliée',enemy:'Maître des Forges',difficulty:3,hp:26,reward:70,shards:20,unlock:'golem',deck:['golem','smith','drill','bomb','golem','shield','smith','drill','firebolt','bomb','engineer','smith','golem','storm','drill','shield'],story:'Des machines de guerre sortent de la montagne.'},
 {id:'06',aiStyle:'assaut',region:'La Marche Cendrée',name:'La Couronne de Braise',enemy:'Colosse des Fourneaux',difficulty:3,hp:30,reward:90,shards:26,unlock:'colossus',boss:true,deck:['colossus','golem','smith','bomb','golem','smith','engineer','colossus','drill','storm','golem','bomb','warcry','smith','drill','golem'],story:'Le seigneur mécanique réclame tribut.'},
 {id:'07',aiStyle:'meute',region:'Les Terres du Voile',name:'Les Tombes sans Nom',enemy:'Héraut des Ombres',difficulty:3,hp:27,reward:80,shards:24,unlock:'plague',deck:['bone','bone','crypt','shade','plague','bone','banshee','crypt','shade','firebolt','bone','plague','crypt','warcry','shade','bone'],story:'Une armée oubliée se réveille sous les terres.'},
 {id:'08',aiStyle:'rituel',region:'Les Terres du Voile',name:'Le Palais Silencieux',enemy:'Reine du Néant',difficulty:4,hp:30,reward:94,shards:28,unlock:'banshee',deck:['shade','crypt','plague','banshee','lich','shade','bone','plague','crypt','storm','bone','banshee','lich','shade','crypt','entangle','plague'],story:'La souveraine des ombres livre ses secrets.'},
 {id:'09',aiStyle:'rituel',region:'Les Terres du Voile',name:'Le Trône de Minuit',enemy:'Archiliche Éternel',difficulty:4,hp:34,reward:120,shards:35,unlock:'lich',boss:true,deck:['lich','lich','crypt','plague','shade','banshee','bone','lich','crypt','storm','plague','banshee','shade','bone','lich','crypt','entangle','shade'],story:'Le voile menace de recouvrir toutes les cités.'},
 {id:'10',aiStyle:'rituel',region:'Les Hautes Sphères',name:'Les Portes d’Opale',enemy:'Oracle céleste',difficulty:4,hp:32,reward:110,shards:32,unlock:'mystic',deck:['spark','sentinel','mystic','griffin','elemental','spark','mystic','sentinel','storm','griffin','spark','elemental','mystic','healing','sentinel','spark','firebolt','griffin'],story:'Les étoiles révèlent une dernière menace.'},
 {id:'11',aiStyle:'bastion',region:'Les Hautes Sphères',name:'La Tour aux Sept Astres',enemy:'Gardien des Âges',difficulty:4,hp:34,reward:135,shards:38,unlock:'griffin',deck:['elemental','sentinel','mystic','griffin','spark','elemental','elemental','sentinel','mystic','griffin','storm','spark','mystic','healing','sentinel','elemental','griffin','dragon'],story:'Les plus grands sortilèges protègent la tour.'},
 {id:'12',aiStyle:'assaut',region:'Les Hautes Sphères',name:'L’Éclipse des Rois',enemy:'Dragon des Sept Cieux',difficulty:5,hp:42,reward:200,shards:60,unlock:'dragon',boss:true,deck:['dragon','elemental','sentinel','mystic','griffin','dragon','spark','elemental','sentinel','mystic','storm','griffin','healing','dragon','elemental','storm','sentinel','mystic','griffin','dragon'],story:'Le combat final décidera du destin des Couronnes.'}
];
export const START_DECK=['militia','militia','militia','militia','shield','shield','archer','archer','ranger','ranger','wolf','wolf','firebolt','firebolt','healing','healing','smith','spark'];
export const START_COLLECTION = {
 militia:4,shield:2,archer:2,ranger:2,wolf:2,firebolt:2,healing:2,smith:1,spark:1,
 bone:1,drill:1,thorn:1
};

// A solo challenge tower inspired by the genre, not a reproduction of historical content.
export const TOWER_MAX=20;
export function towerMission(floor){
 const n=Number(floor);if(!Number.isInteger(n)||n<1||n>TOWER_MAX)throw Error('Étage invalide');
 const factions=['aube','sylve','ombre','forge','ether'];
 const faction=factions[Math.floor((n-1)/4)];
 const aiStyle=({aube:'bastion',sylve:'meute',ombre:'rituel',forge:'assaut',ether:'rituel'})[faction];
 // La Tour historique reste stable lorsque le catalogue reçoit une extension.
 const controlIds=new Set(controlCards.map(c=>c[0]));
 const units=Object.values(CARDS).filter(c=>!controlIds.has(c.id)&&c.faction===faction&&c.type==='unité'&&c.rarity!=='légendaire');
 const spells=['firebolt','healing','warcry','storm','entangle','sanctuary'];
 const deck=Array.from({length:16+Math.floor(n/5)},(_,i)=>i%5===4?spells[(n+i)%spells.length]:units[(i+n*3)%units.length].id);
 const boss=n%5===0;
 const rewardCard=boss?({5:'scoutcaptain',10:'archdruid',15:'vampire',20:'aetherknight'}[n]||null):null;
 return {id:`T${String(n).padStart(2,'0')}`,aiStyle,mode:'tower',floor:n,region:'Tour des Couronnes',name:`Étage ${n} — ${boss?'Gardien du Sceau':FACTIONS[faction].short}`,enemy:boss?`Gardien du Sceau ${n}`:`Épreuve ${FACTIONS[faction].short}`,difficulty:Math.min(5,1+Math.floor((n-1)/4)),hp:(n<=4?15:17)+Math.ceil(n*1.15)+(boss?5:0),reward:25+n*6,shards:10+n*2,unlock:rewardCard,deck,boss,story:'Un nouveau cercle de la tour met votre stratégie à l’épreuve.'};
}
