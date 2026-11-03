# Reprise des migrations de cartes — état du 3 novembre 2026

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
| Forge | 10 | 39 sur 39 cases futures | 10 Rares/Épiques et 7 Légendaires intégrées par PR 75/78/79/80 ; autres lots suivis séparément |
| Éther | 11 | 9 sur 39 cases futures | Feu follet et Oracle complets ; autres cases encore ouvertes dans cette édition ; règles partielles de Garde distinctes |

Les 53 unités natives et les 23 sorts demeurent au catalogue. Une carte affichée
ou un pouvoir validé ne crée ni exemplaire ni définition jouable. Les cellules
« À définir » restent ouvertes ; leur complétion exige une décision du propriétaire.

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
dix versions sur sept personnages (3 Rares et 7 Épiques), 142 recettes au total après cette fusion. La publication Sites doit être vérifiée indépendamment de la fusion. L'Éther conserve 30 cases futures incomplètes dans cette édition.
La nouvelle portée native 3 du Feu follet est une décision séparée du natif 2
encore au moteur ; elle exige son propre périmètre, contrôle et documentation.
Relire Notion à la reprise, car la conception continue en parallèle.

Les [cinq Légendaires Forge de statistiques](FORGE_LEGENDAIRES_STATS.md) sont intégrées par la [PR 78](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/78) le 3 novembre 2026, au commit `304e20f1f0d8a5007948ddba6577990d7a5f2123`, avec accord spécifique, six contrôles réussis et export synchronisé. Le Marchefer a ensuite été intégré par la PR 79 ; Foreur, Golem et Marteau restent des tranches distinctes. Aucun succès de la PR 78 ne valide leurs nouveaux pouvoirs.

Le [Foreur Légendaire](FORGE_FOREUR_LEGENDAIRE.md) est intégré par PR 80 au commit `7d3d6d4` : 27 versions Forge, 17 évolutions Forge et 149 recettes après cette fusion. Le Marteau est la proposition suivante ; le Golem reste distinct.

## Conditions de reprise

Marchefer et Foreur sont intégrés par PR 79 et 80. Golem et Marteau demeurent absents du main observé avant cette proposition. Cœur runique exige de résoudre le raccordement entre ciblage direct du gardien normal et interception de couronne, sans réinterpréter la validation Notion.

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

Foreur intégré par PR 80 (`7d3d6d4`). La proposition [Marteau](FORGE_MARTEAU_LEGENDAIRE.md) apporte une évolution supplémentaire : 28 versions Forge, 18 évolutions et 150 recettes dans sa branche. Golem demeure fermé au rang Légendaire : son bonus n’est pas réinterprété comme une récompense de tout coup reçu. Les hauts rangs de plusieurs autres Forge se préparent séparément. L’accord explicite de cette session autorise les fusions des lots prêts après revue/CI ; il ne dispense d’aucun contrôle ni ne crée de fusion automatique.

## Proposition — hauts rangs Forge et blindages

Le lot [Marteau / Foreur / Colosse / Marchefer](FORGE_HAUTS_RANGS_BLINDAGES.md) prépare huit évolutions et deux ascensions. Les deux défis ouvrent quatre recettes définies chacun, pas les cartes encore absentes. Le pilote et les simulations d’ascension sont partagés ; les pouvoirs lisent le registre et les primitives de protections/mouvement. 36 versions Forge, 26 évolutions et 158 recettes dans cette branche ; intégration/publication distinctes. Golem et les autres hauts rangs attendent leurs lots.
