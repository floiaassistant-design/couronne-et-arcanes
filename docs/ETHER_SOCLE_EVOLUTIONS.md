# Éther — douze évolutions de statistiques, intégrées le 4 novembre 2026

## Source et périmètre

Base intégrée : PR 83, commit `86efbca0b62370eb15d46e2d5a577e4bc974b887`,
arbre `10ecd7ce053aadeedffd6edae5771eddffc9ba38`, identique à la tête dont les
six contrôles ont réussi. Sa publication Sites est suivie séparément.
Le [tableau maître Notion](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f)
a été relu le 4 novembre ; édition `2026-11-02T16:09:01.799Z`.
Aucune écriture Notion, statistique ou capacité inventée.

Ce lot transcrit douze cellules validées qui ne demandent aucun pouvoir nouveau.
Les valeurs ci-dessous sont les totaux du rang, avant niveau et bonus du profil.

| Personnage | Rare | Épique | Légendaire |
| --- | --- | --- | --- |
| Oracle des Astres | native | 3 ATQ / 6 PV / délai 2 | 4 ATQ / 6 PV / délai 2 |
| Élémentaire azuré | — | native | 5 ATQ / 10 PV / délai 3 |
| Griffon du Zénith | — | native | 5 ATQ / 8 PV / délai 3 |
| Sentinelle prismatique | native | 2 ATQ / 11 PV / délai 2 | hors lot |
| Esprit de Tempête | native | 3 ATQ / 8 PV / délai 2 | 4 ATQ / 8 PV / délai 2 |
| Voyante des Étoiles | 2 ATQ / 5 PV / délai 1 | 3 ATQ / 5 PV / délai 1 | hors lot |
| Chevalier du Zénith | — | native | 5 ATQ / 11 PV / délai 3 |
| Marcheur des Portails | native | 3 ATQ / 7 PV / délai 2 | 4 ATQ / 7 PV / délai 2 |

La branche définit 23 versions Éther, dont onze natives : douze évolutions
sur huit personnages et 180 recettes toutes factions. Les 27 autres évolutions
Éther validées restent absentes. Dragon et Séraphin conservent leurs natives.
Feu follet conserve **Distance 2** : la décision validée de Distance 3, y compris
pour sa Commune, réclame une tranche explicite de règles. Ses évolutions ne
sont pas ajoutées avec une portée incorrecte. Aucun rang Divin/Éveillé Éther
ni ascension de cette faction n'est ouvert.

## Obtention et présentation

Les fusions existantes consomment trois copies libres du rang exact précédent,
en protégeant le deck. Rare après mission 01, Épique après mission 03 et
Légendaire après mission 06 effectivement gagnée. Ni niveau, ni accès au boss
ne remplacent sa victoire. Aucune carte offerte, or ou éclat demandé par la fusion.

Le nouveau paquet `ether-evolution` réutilise le constructeur et les transactions
des quatre paquets de faction : 190 or, trois tirages indépendants après mission
03, doublons possibles, aucun rang garanti. Groupes annoncés avant confirmation :

| Groupe | Poids | Références |
| --- | ---: | --- |
| Native Commune ou Rare | 60 % | Feu follet, Oracle, Sentinelle, Tempête, Voyante, Marcheur |
| Évolution Rare | 35 % | Voyante uniquement |
| Évolution Épique | 5 % | Oracle, Sentinelle, Tempête, Voyante, Marcheur |

La composition limitée est volontaire et visible : aucun Feu follet évolué,
Légendaire ou rang futur. Le prix et les taux des autres paquets, leurs pools
et le paquet mystique à 95 or ne changent pas. Les Légendaires de ce lot
restent obtenables uniquement par fusion.

Les huit personnages utilisent les fiches structurées communes, en Collection,
main, plateau, deck, paquet, Alchimie et laboratoire. Six cases par personnage,
chiffres et possessions réels ; les versions absentes ne reçoivent ni statistiques
ni bouton jouable. Le libellé historique « À concevoir » indique encore une
absence de définition dans le jeu, même lorsque Notion a déjà validé le pouvoir.

## Moteur, architecture et compatibilité

`cards/ether.js` est un module de données immuables avec provenance. La famille
commune alimente définitions et recettes ; `ETHER_UNIT_IDS` expose les onze
natifs et seules les huit unités évolutives rejoignent la présentation structurée.
`card-packs.js` réutilise le constructeur de paquet existant. Aucun pilote
de faction, règle de combat ou dépendance ajouté.

Distance 2, Impact contigu à 2 dégâts bruts, Vol/Célérité/Charge, Perforation,
Garde positionnelle/Riposte et Portail à cadence trois tours sont hérités.
Armure et barrières passent par les protections communes. Aucun Prisme,
Présage, Sillage ou Écho futur n'est attribué par anticipation.

Identifiants, 76 cartes natives, images, économie existante, IA et clés de
sauvegarde conservés. Les références natives restent des chaînes ; les nouvelles
évolutions utilisent `{id, rarity}`. Aucun profil ancien enrichi automatiquement,
aucune migration ou réinitialisation. Le laboratoire utilise le même moteur,
isolé de l'aventure. Les distributions web et autonome incluent le même nouveau
module par leur graphe d'import ; `JOUER.html` est régénéré, jamais corrigé à la main.

## Vérifications et reprise

`ether_evolutions.test.mjs` vérifie les totaux indépendants, les 23 versions à
quatre niveaux aux deux camps, les tirages des six évolutions de paquet,
les pouvoirs hérités en vrai combat, Silence, protections, Portail, sauvegardes,
instantanés, fiches et moteur réellement embarqué. Les tests génériques vérifient
les douze nouvelles fusions, stocks protégés et 180 recettes sur huit graines,
avec deux exécutions identiques : 2 880 combats déterministes.

Le pilote navigateur partagé ajoute Éther aux achats/fusions existants : boss,
contenu/taux, annulation, panne de stockage, double clic, stocks, deck,
export/import, invocation de la Voyante et reprise. Le parcours Légendaire
partagé ajoute le Chevalier issu de trois Épiques natives, avec deck protégé,
boss 06 et Perforation effective contre un Golem natif dans un combat préparé.
Bureau, portrait, paysage et HTTP utilisent les quatre parties existantes ;
aucun nouveau job, aucune exécution en double de la suite entière.

Résultats locaux : 731 tests Node réussis, 120 scénarios de parité inchangés,
builds autonome, diagnostic et web réussis ; syntaxe Python vérifiée. Les résultats
du navigateur sont consignés avec le commit exact dans la PR. Pas de téléphone physique, de campagne
UI complète depuis zéro ni de preuve d'équilibrage humain.

Suite : contrôler la CI du commit exact, traiter tout échec, relire main et le
diff avant fusion dans le cadre de l'accord reçu. Vérifier ensuite la diffusion
par le suivi Sites existant. Les trois rangs du Golem restent distincts :
Cœur runique nécessite une interception de couronne réelle. Puis poursuivre
les pouvoirs Éther et la décision de portée du Feu follet dans leurs propres lots.

## Correction de fiche avant fusion

Le premier contrôle navigateur a détecté un vrai manque : la fiche structurée du Marcheur n’expliquait plus son Portail. Le libellé bref et le détail lisent maintenant le paramètre de cadence, avec destination libre/autorisée, gain évalué par le moteur et exclusion de la couronne adverse. Le contrôle remplace la seule longueur minimale par les six assertions de règles attendues ; les trois rangs définis sont aussi vérifiés par Node. La mécanique de Portail reste inchangée. Les résultats de la nouvelle tête sont à lire dans la PR ; le premier échec n’est pas effacé.

## Intégration du 4 novembre 2026

PR 84 fusionnée au commit `bc826d3ca1daa2824b9e895c51f4e61077870583`, après accord et six contrôles réussis sur la tête corrigée `c79fb33437e0d69d8c38d4410faa67af1076f197`. Arbre `f83f7819b130ba8d7191053279c69fb65769c3cd` identique à la version revue/testée, export `bcf3ecd146e2ce07be269c4edb82f79fe8c4b195` confirmé. Les formulations de branche/proposition ci-dessus décrivent le lot livré. Publication distincte : dernier terminal confirmé Sites v27 / PR 83, suivi existant réutilisé.
