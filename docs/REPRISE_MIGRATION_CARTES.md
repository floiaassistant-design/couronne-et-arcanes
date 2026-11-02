# Reprise des migrations de cartes — Forge Rare/Épique proposée le 2 novembre 2026

Source de conception : [tableau maître unique](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f),
édition relue `2026-11-02T15:29:46.385Z`. Les compteurs ci-dessous décrivent
les cases de conception complètes, pas leur livraison. Aucun tableau parallèle
de pouvoirs ni validation de nouvelles décisions.

GitHub reste la source du jeu. Base historique du lot Ombre : main
`588692a44680f7f08a51d37407e396685d67cc8f`, PR 71 intégrée après accord et six
contrôles réussis. Base de la nouvelle proposition Forge :
`843f1412f689b75acca7ff80fb44b99c149cb6c7`, PR 73 intégrée. Les 41 évolutions Aube, 48 Sylve et 21 Ombre jusqu'à Légendaire
sont intégrées. `feat/ombre-divines-eveillees` propose les 22 hauts rangs restants,
sans modifier Notion. [Contrat](OMBRE_DIVINES_EVEILLEES.md). La publication est
suivie séparément dans [ETAT_PROJET.md](ETAT_PROJET.md).

| Ordre | Unités natives | Évolutions conçues complètement validées | Situation d'implémentation |
| --- | ---: | ---: | --- |
| Aube | 10 | 41 | 51 versions déjà au moteur ; toutes obtenables depuis PR 62 |
| Sylve | 11 | 48 | 48 évolutions intégrées, 59 versions définies jusqu’à Éveillée |
| Ombre | 11 | 43 | 21 évolutions intégrées ; 22 hauts rangs proposés, 54 versions sur la branche |
| Forge | 10 | 39 sur 39 cases futures | 10 Rares/Épiques proposées sur une branche (7 unités), les autres non implémentées sur main |
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

## Lot proposé : les 22 Divines/Éveillées Ombre

Le [contrat](OMBRE_DIVINES_EVEILLEES.md) décrit les 22 pouvoirs et leurs
interactions, deux ascensions communes puis fusions de trois copies libres.
Paquets, natifs et sauvegardes historiques conservés. Cette nouvelle proposition
attend ses contrôles et son propre accord de fusion ; elle n'est pas publiée.

## Reprise suivante : Forge et Éther

Les 39 évolutions Forge sont entièrement validées dans la conception.
La première tranche [Rare/Épique](FORGE_RARE_EPIQUE.md) propose dix versions
sur sept personnages (3 Rares et 7 Épiques), et 142 recettes au total
sur sa branche, sans fusion ni publication. Ne pas déduire l'intégration
sur main du seul statut Notion. L'Éther conserve 30 cases futures incomplètes dans cette édition.
La nouvelle portée native 3 du Feu follet est une décision séparée du natif 2
encore au moteur ; elle exige son propre périmètre, contrôle et documentation.
Relire Notion à la reprise, car la conception continue en parallèle.

## Conditions de reprise

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
