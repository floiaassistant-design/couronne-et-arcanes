# Éther — Repli spectral et Étoile immobile, intégrés par PR 86 le 4 novembre 2026

La PR 86 est fusionnée sur accord spécifique au commit `3fac34fa5a2b94cc705aca086d761bf6e524493c`.
Arbre `2df95c6538fcff05a3d88d861078a659cd549d4a` exactement identique à la tête revue/testée
`725d2f8`, six contrôles réussis, export `a7bd33c9365a70599c29d67cfbc65d1683292ac2`.
Les formulations de préparation et de CI à attendre ci-dessous décrivent le lot historique ;
la publication est suivie séparément.

## Source et versions

Base GitHub : main `bc826d3ca1daa2824b9e895c51f4e61077870583` (PR 84),
arbre `f83f7819b130ba8d7191053279c69fb65769c3cd`, reproduit exactement avant
modification. La branche est ensuite réconciliée avec main après fusion du Golem :
`4de013ddf06a3a6f6d4f46041af0e63e789f1eef`, arbre
`a1df3b30936765d3e02301dc51371d87759df3af`. Tableau maître Notion relu, édition `2026-11-04T09:02:46.815Z` :
[source de conception](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f).
Aucune décision de conception nouvelle ni écriture du tableau maître.

| Version ajoutée | ATQ | PV | Délai | Portée | Pouvoir |
| --- | ---: | ---: | ---: | ---: | --- |
| Feu follet Rare | 2 | 4 | 1 | 3 | Distance 3 |
| Feu follet Épique | 3 | 4 | 1 | 3 | Distance 3 |
| Feu follet Légendaire | 3 | 4 | 1 | 3 | Repli spectral |
| Voyante Légendaire | 3 | 5 | 1 | 2 | Étoile immobile |

Totaux avant niveaux et bonus du profil. Cette branche définit 27 versions
Éther, dont 16 évolutions, sur neuf personnages évolutifs ; 187 recettes
toutes factions. Les 23 autres évolutions Éther restent absentes, ainsi que
les deux ascensions de cette faction. Le Feu follet **natif conserve la portée 2** :
son passage validé à 3 demande un changement natif explicite, séparé de ce lot.
Les trois rangs ajoutés ont bien leur propre portée 3 validée dans Notion.

## Repli spectral

Après la frappe normale positive sur une unité ennemie survivante, et après
les réactions, le Feu follet vivant et non silencieux recule d'une case vers
sa propre couronne, sur sa ligne. La case doit être libre et dans le plateau.
Une frappe absorbée par une barrière compte ; une attaque nulle, une couronne,
un sort, un poison, une Riposte ou une victime morte ne compte pas.
Pas de changement de ligne ni d'attaque supplémentaire.

Le quota facultatif `spectralRetreatReadyRound` appartient à l'invocation :
un succès au tour N autorise le suivant à N+3. Un recul impossible ne le
consomme pas. L'entrée réelle réutilise les pièges et les décès du moteur.
Éclat persistant et Fuite lumineuse ne sont pas implémentés dans cette tranche.

## Étoile immobile

Une frappe normale positive retirant au moins un PV à un ennemi survivant
pose un présage ; une barrière absorbant tous les dégâts ne suffit pas.
La Voyante doit vivre après les réactions et ne pas être silencieuse.
Son quota `stillOmenReadyRound` autorise un nouveau marquage à N+3.

La victime porte `stillOmen` : UID et camp de la source, dégâts et tour dû.
Une seule victime par source et un seul présage par victime, sans cumul : une
nouvelle application éligible remplace la marque. La disparition de la source
n'efface pas un effet déjà posé ; la disparition de la victime empêche ses dégâts.

Une pose au tour N est examinée à la **fin du tour complet N+1**, après les
actions des deux camps et avant l'incrément de `round`, dans les modes alterné
et historique. Aucun dégât au tour de pose. Un déplacement réel pendant N+1
annule immédiatement la marque, même suivi d'un retour : déplacement normal,
Portail/téléportation ou recul forcé. Un déplacement pendant N ne l'annule pas.
Une immobilisation, une destination bloquée ou un mouvement simplement tenté
ne compte pas comme déplacement.

Sans mouvement, la marque est retirée avant l'appel commun `hit` pour 2 dégâts
bruts : Armure, barrière, minimum et réactions de mort habituels, sans contexte
d'attaque directe, Riposte, nouvelle marque ou attaque supplémentaire.
Destin scellé et Constellation captive restent absents.

## Obtention, état et distributions

Fusions communes : trois copies libres du rang exact précédent, après victoire
des missions 01/03/06 pour Rare/Épique/Légendaire. Deck, stocks et sauvegardes
restent transactionnels. Le paquet Éther garde 190 or, trois cartes et 60/35/5 ;
ses groupes passent de 6/1/5 à **6/2/6** : Feu follet rejoint Rare et Épique.
Les Légendaires ne sont pas tirées. Autres paquets et natifs inchangés.

`unit-omens.js` porte pose, annulation, résolution et validation du présage.
`unit-triggers.js` porte le recul personnel ; `battle.js` fournit les hooks
communs de frappe, entrée de case et fin de tour. Fiches et Silence lisent
le registre. Les nouveaux états sont facultatifs, validés et remplacés/retirés
sans muter les objets d'instantanés. Aucune clé, réinitialisation ou migration.
Web, laboratoire et autonome utilisent le même graphe, 80 modules et les
76 illustrations existantes ; aucune dépendance ou ressource ajoutée.

## Vérifications et reprise

764 tests Node et 120 scénarios de parité natifs réussis localement, dont
18 tests tactiques dédiés. Les 27 versions Éther sont invoquées aux quatre
niveaux dans les deux camps ; les 187 recettes sont réellement fusionnées
et exécutées dans 2 992 simulations déterministes. Le moteur de l'export
est également exécuté pour les deux nouveaux pouvoirs.

Deux scénarios raccordés aux quatre parties navigateur existantes couvrent
fusion, panne d'écriture, double clic, Collection/deck, export/import,
combat réel, fiche et reprise ; la Voyante est suivie jusqu'à la consommation
du présage au tour suivant. Les préparations n'attribuent aucun résultat de
pouvoir. CI et parcours navigateur restent à lire sur la tête GitHub exacte :
Playwright absent de cet environnement local. Ni téléphone physique,
campagne UI complète depuis zéro, ni preuve d'équilibrage humain.

La PR Golem 85 est intégrée. L’assemblage conserve ses trois rangs, Cœur, Garde,
quotas, tests et documentation, avec les quatre évolutions Éther. Les conflits
sur imports, champs validés, compteurs et documents ont été réconciliés sans
retirer les contributions. Les 764 tests et 120 scénarios de parité ont réussi
sur cet assemblage ; sa nouvelle CI reste requise. La PR 86 attend son accord
spécifique de fusion. Sites ne reçoit que main intégré et vérifié, via le suivi existant.
