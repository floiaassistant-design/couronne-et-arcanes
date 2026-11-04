# Reprise des migrations de cartes — état du 4 novembre 2026

Source de conception : [tableau maître unique](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f),
édition relue `2026-11-02T16:09:01.799Z`. Les compteurs ci-dessous décrivent
les cases de conception complètes, pas leur livraison. Aucun tableau parallèle
de pouvoirs ni validation de nouvelles décisions.

GitHub reste la source du jeu. Base historique du lot Ombre : main
`588692a44680f7f08a51d37407e396685d67cc8f`, PR 71 intégrée après accord et six
contrôles réussis. Base historique de la PR 75 Forge :
`843f1412f689b75acca7ff80fb44b99c149cb6c7`, PR 73 intégrée.
Les 41 évolutions Aube, 48 Sylve et 43 Ombre jusqu'à Éveillée sont intégrées.
La PR 72 a intégré les 22 derniers hauts rangs Ombre avec accord spécifique.
La publication est suivie séparément dans [ETAT_PROJET.md](ETAT_PROJET.md).

| Ordre | Unités natives | Évolutions conçues complètement validées | Situation d'implémentation |
| --- | ---: | ---: | --- |
| Aube | 10 | 41 | 51 versions déjà au moteur ; toutes obtenables depuis PR 62 |
| Sylve | 11 | 48 | 48 évolutions intégrées, 59 versions définies jusqu’à Éveillée |
| Ombre | 11 | 43 | 43 évolutions intégrées par les PR 70/71/72, 54 versions définies |
| Forge | 10 | 39 sur 39 cases futures | 36 évolutions intégrées jusqu’à PR 83 ; 46 versions sur main, trois rangs du Golem préparés, raccordement validé le 4 novembre |
| Éther | 11 | 39 sur 39 cases futures | 23 versions sur main après PR 84, dont douze évolutions de statistiques ; 27 autres évolutions absentes ; portée 3 future du Feu follet distincte |

Les 53 unités natives et les 23 sorts demeurent au catalogue. Une carte affichée
ou un pouvoir validé ne crée ni exemplaire ni définition jouable. Les onze personnages Éther ont leurs 39 évolutions validées dans cette édition ;
la disponibilité réelle reste déterminée par le registre du jeu.

## Lot intégré : Sylve Rare/Épique

Les quinze versions de [la première tranche](SYLVE_RARE_EPIQUE.md) réutilisent
les pouvoirs natifs déjà vérifiés ; Luciole Épique remplace son bouclier d'arrivée
par 5, plafond 20. Six Rares et neuf Épiques par fusion, après missions 01/03.
Un paquet Sylve distinct réutilise le circuit d'achat, à 190 or et taux 60/35/5.
Pas de nouvelle épreuve, copie gratuite ou définition des rangs supérieurs.

## Lot intégré : les onze Légendaires Sylve

[Contrat](SYLVE_LEGENDAIRES.md) : tous les personnages Sylve atteignent Légendaire,
par fusion après mission 06. Leurs nouveaux états utilisent le moteur commun,
sans élargir les paquets Rare/Épique ni inventer des épreuves individuelles.

## Lot intégré : les 22 Divines/Éveillées Sylve

La PR 69 est intégrée après tests et accord spécifique. Le [contrat](SYLVE_DIVINES_EVEILLEES.md) décrit les pouvoirs, interactions et deux ascensions
communes suivies de fusions de trois copies. Aucun élargissement de paquet,
don ou migration. La publication reste à vérifier via le flux existant.

## Lot intégré : Ombre Rare / Épique

Le [contrat](OMBRE_RARE_EPIQUE.md) décrit onze évolutions validées pour huit
personnages. Le délai de la Lame nocturne est confirmé à 1 dans le catalogue
actuel. Fusions de trois copies libres après missions 01/03 et paquet distinct
à 190 or ; aucun changement des pouvoirs ni des paquets existants. Base :
main intégrant la PR 69 ; PR 70 fusionnée le 2 novembre après accord spécifique
et six contrôles réussis. Arbre intégré identique à la tête testée.

## Lot intégré : dix Légendaires Ombre

Le [contrat](OMBRE_LEGENDAIRES.md) transcrit les dix validations et la Veille
funéraire du Veilleur dans les primitives communes. Fusion de trois Épiques
libres après mission 06, paquets inchangés. Base : main intégrant la PR 70.
La PR 71 a été intégrée après accord spécifique et six contrôles réussis,
sans conflit ni différence d'arbre avec la tête testée.

## Lot intégré : les 22 Divines/Éveillées Ombre

Le [contrat](OMBRE_DIVINES_EVEILLEES.md) décrit les 22 pouvoirs et leurs
interactions, deux ascensions communes puis fusions de trois copies libres.
Paquets, natifs et sauvegardes historiques conservés. La PR 72 a été
fusionnée le 2 novembre après autorisation spécifique et six contrôles réussis.
La publication du jeu reste une opération distincte.

## Reprise suivante : Forge et Éther

Les 39 évolutions Forge sont entièrement validées dans la conception.
La première tranche [Rare/Épique](FORGE_RARE_EPIQUE.md) est intégrée par la PR 75 :
dix versions sur sept personnages (3 Rares et 7 Épiques), 142 recettes au total après cette fusion. La publication Sites doit être vérifiée indépendamment de la fusion. Les 39 évolutions Éther sont validées en conception ; douze évolutions de statistiques sont intégrées par PR 84 et les 27 autres restent absentes.
La nouvelle portée native 3 du Feu follet est une décision séparée du natif 2
encore au moteur ; elle exige son propre périmètre, contrôle et documentation.
Relire Notion à la reprise, car la conception continue en parallèle.

Les [cinq Légendaires Forge de statistiques](FORGE_LEGENDAIRES_STATS.md) sont intégrées par la [PR 78](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/78) le 3 novembre 2026, au commit `304e20f1f0d8a5007948ddba6577990d7a5f2123`, avec accord spécifique, six contrôles réussis et export synchronisé. Le Marchefer a ensuite été intégré par la PR 79 ; Foreur, Golem et Marteau restent des tranches distinctes. Aucun succès de la PR 78 ne valide leurs nouveaux pouvoirs.

Le [Foreur Légendaire](FORGE_FOREUR_LEGENDAIRE.md) est intégré par PR 80 au commit `7d3d6d4` : 27 versions Forge, 17 évolutions Forge et 149 recettes après cette fusion. Le Marteau est intégré par PR 81 ; le Golem reste distinct.

## Conditions de reprise

Marchefer et Foreur sont intégrés par PR 79 et 80. Le Marteau est désormais intégré par PR 81 ; seul le Golem reste absent au rang Légendaire. Cœur runique exige de résoudre le raccordement entre ciblage direct du gardien normal et interception de couronne, sans réinterpréter la validation Notion.

- Lire main, les branches/PR et `ETAT_PROJET.md`, rapprocher les choix de la
  dernière édition Notion. Les anciens bilans sont historiques.
- Ne pas empiler silencieusement les propositions : intégrer les dépendances
  après accord ou expliciter la base d'une PR dépendante. Ne jamais forcer main.
- Aucun graphique importé automatiquement ; les images existantes et leurs
  reçus restent la référence de livraison. Les valeurs viennent du registre.
- Avant d'annoncer un lot terminé : obtention réelle, stocks/deck/combats,
  pouvoirs, quotas, import/export/reprise, perte de stockage et hors réseau.
- Ne pas transformer une demande de poursuivre en autorisation de fusion,
  ni un succès de CI en preuve de publication. Ne pas attendre activement
  GitHub lorsqu'il ne reste plus de travail indépendant.

## Reprise du 3 novembre — lot Marteau

Foreur intégré par PR 80 (`7d3d6d4`). Le [Marteau](FORGE_MARTEAU_LEGENDAIRE.md) intégré par PR 81 au commit `b54e567` apporte une évolution supplémentaire : 28 versions Forge, 18 évolutions et 150 recettes sur main après cette fusion. Golem demeure fermé au rang Légendaire : son bonus n’est pas réinterprété comme une récompense de tout coup reçu. Les hauts rangs de plusieurs autres Forge se préparent séparément. L’accord explicite de cette session autorise les fusions des lots prêts après revue/CI ; il ne dispense d’aucun contrôle ni ne crée de fusion automatique.

## Hauts rangs Forge et blindages — intégrés par PR 82

Le lot [Marteau / Foreur / Colosse / Marchefer](FORGE_HAUTS_RANGS_BLINDAGES.md) a intégré huit évolutions et deux ascensions. Après PR 82, les deux défis ouvrent quatre recettes définies chacun, pas les cartes encore absentes. Le pilote et les simulations d’ascension sont partagés ; les pouvoirs lisent le registre et les primitives de protections/mouvement. 36 versions Forge, 26 évolutions et 158 recettes sur main après PR 82 ; publication distincte. Golem et les autres hauts rangs attendent leurs lots.

## Hauts rangs tactiques — intégrés par PR 83

[Contrat](FORGE_HAUTS_RANGS_TACTIQUES.md) : dix évolutions intégrées le 4 novembre au commit `86efbca0`, arbre identique à la tête dont les six contrôles ont réussi. 46 versions Forge et 168 recettes sur main ; les ascensions ouvrent neuf recettes chacune. Golem Rare et Épique sont jouables et obtenables ; ses trois rangs futurs restent fermés pour respecter la condition d’interception de Cœur runique. Publication distincte.

## Douze évolutions Éther — intégrées par PR 84

[Contrat](ETHER_SOCLE_EVOLUTIONS.md) : six Rares/Épiques et six Légendaires sur huit personnages, intégrées au commit `bc826d3`, avec pouvoirs existants conservés, paquet et fusions partagés. 23 versions Éther et 180 recettes sur main après PR 84 ; les 27 autres évolutions restent absentes. Le Feu follet conserve sa portée 2 et ses seules versions natives, jusqu’au lot explicite de portée 3. Pas de nouvel état de combat, de migration ou d’ascension Éther. Ensuite : raccordement Golem et pouvoirs Éther, avec relecture de Notion et contrôles propres à chaque lot.

## Proposition — trois rangs du Golem

Le [contrat Golem](FORGE_GOLEM_COEUR_RUNIQUE.md) précise les trois évolutions, Cœur +1 après interception/survie, Garde remplaçante et quota sauvegardé. Avec le lot Éther intégré : 49 versions Forge, 39 évolutions Forge et 183 recettes dans la branche. Le propriétaire a validé le cas interposé le 4 novembre : le coup doit effectivement atteindre la couronne sans ce Golem, sans autre unité cible. La décision est consignée dans Notion ; les tests positifs/négatifs restent conservés. Lire la revue et les contrôles de la tête finale avant fusion.
