# Reprise des migrations de cartes — reprise Ombre du 2 novembre 2026

Source de conception : [tableau maître unique](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f),
édition relue `2026-10-27T06:13:46.581Z`. Les compteurs ci-dessous décrivent
les cases de conception complètes, pas leur livraison. Aucun tableau parallèle
de pouvoirs ni validation de nouvelles décisions.

GitHub reste la source du jeu. Base vérifiée : main
`039a6a7d9a9de3ddb2feaccd58999924444daab6`, PR 70 intégrée après accord et six contrôles réussis.
Les 41 évolutions Aube, 48 Sylve et onze Rares/Épiques Ombre sont intégrées.
La branche `feat/ombre-legendaires` propose dix Légendaires relues le 2 novembre,
sans modifier Notion. [Contrat et reprise](OMBRE_LEGENDAIRES.md). La publication
est suivie séparément dans [ETAT_PROJET.md](ETAT_PROJET.md).

| Ordre | Unités natives | Évolutions conçues complètement validées | Situation d'implémentation |
| --- | ---: | ---: | --- |
| Aube | 10 | 41 | 51 versions déjà au moteur ; toutes obtenables depuis PR 62 |
| Sylve | 11 | 48 | 48 évolutions intégrées, 59 versions définies jusqu’à Éveillée |
| Ombre | 11 | 43 | 11 Rares/Épiques intégrées ; 10 Légendaires proposées, 32 versions sur la branche ; 22 évolutions restantes |
| Forge | 10 | 0 sur 39 cases futures | Conception incomplète ; règles communes de Garde déjà validées, sans compléter les cases à leur place |
| Éther | 11 | 0 sur 39 cases futures | Conception incomplète ; même distinction pour les règles communes de Garde |

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

## Lot proposé : dix Légendaires Ombre

Le [contrat](OMBRE_LEGENDAIRES.md) transcrit les dix validations et la Veille
funéraire du Veilleur dans les primitives communes. Fusion de trois Épiques
libres après mission 06, paquets inchangés. Base : main intégrant la PR 70.
Ce nouveau lot conserve son accord spécifique ; les contrôles et SHA sont
à lire dans sa PR. Les 22 Divines/Éveillées viennent ensuite. Réactions aux morts, créations et
vols/régénérations doivent réutiliser les primitives communes, sans deuxième
moteur. Forge et Éther restent à concevoir ; leurs cases ne sont pas complétées
sans validation du propriétaire.

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
