# État du projet — jalons durables (2 novembre 2026)

Ce fichier décrit les faits intégrés et les chantiers durables, pas l'état
instantané des tests, des branches ou des déploiements. **À chaque reprise**,
consulter [les PR GitHub](https://github.com/floiaassistant-design/couronne-et-arcanes/pulls),
la branche `main` et les [exécutions GitHub Actions](https://github.com/floiaassistant-design/couronne-et-arcanes/actions).
Ne pas déduire un état actuel d'un ancien SHA ou d'un compte rendu daté.

## Forge Rare/Épique — intégrée le 2 novembre 2026

La [PR 75](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/75) a intégré dix versions Forge sur sept unités et un paquet distinct. Fusion squash au commit `5d9e2861911744ed051d3f656cdb186025451613`, arbre identique à la tête testée `42103d5` ; six contrôles réussis, sans nouveau rang supérieur ni écriture Notion. Publication Sites distincte, à confirmer.

## Jalons intégrés

- [PR 65](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/65) :
  protection des sauvegardes et des transactions du profil.
- [PR 66](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/66) :
  séparation des consignes permanentes et de l'historique, carte de tests.
- [PR 67](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/67) :
  conservation des résultats non enregistrés de campagne, Tour et donjons ;
  reprise et tests des tours alternés du robot d'audit. Fusion autorisée le
  1er novembre 2026, commit `d4af666e533ffa67ec0c36f241af65041f8546f6`.
  Les contrôles de la tête PR ont réussi ; le statut des contrôles de main
  et la publication doivent être lus séparément sur leurs sources actuelles.

- [PR 69](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/69) :
  22 évolutions Divines/Éveillées Sylve et deux ascensions communes, fusionnées
  avec l'accord du propriétaire le 2 novembre 2026 dans `c9ab3209472a0433931c23315164c714af9099da`.
  Arbre intégré identique à la tête testée ; aucune publication déduite de la fusion.

- [PR 70](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/70) :
  onze évolutions Rares/Épiques Ombre et paquet distinct, fusionnés après accord
  spécifique et six contrôles réussis le 2 novembre 2026 dans
  `039a6a7d9a9de3ddb2feaccd58999924444daab6`. Arbre identique à la tête testée.

- [PR 71](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/71) :
  dix Légendaires Ombre et Veille funéraire, fusionnées après accord spécifique
  et six contrôles réussis dans `588692a44680f7f08a51d37407e396685d67cc8f`.
  Arbre intégré identique à la tête testée, sans conflit.

- [PR 72](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/72) :
  22 Divines/Éveillées Ombre et deux ascensions communes, intégrées le
  2 novembre après accord spécifique et six contrôles réussis.
  54 versions Ombre et 132 recettes étaient présentes sur main après cette fusion.

- [PR 73](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/73) :
  ciblage contigu de l'Impact de zone, intégré sur main le 2 novembre 2026,
  sans changement des sauvegardes ou des décisions Notion.

- [PR 75](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/75) :
  dix évolutions Forge Rares/Épiques et paquet dédié, fusionnées le 2 novembre
  après accord spécifique et six contrôles réussis ; arbre intégré inchangé.

Les évolutions de l'Aube sont obtenables (41), celles de la Sylve également
jusqu'au rang Éveillé (48), et celles de l'Ombre jusqu'à Éveillée (43) sont
intégrées. Dix évolutions Forge Rares/Épiques sont également sur main ;
l'Éther conserve ses versions natives.
Le laboratoire réutilise le même moteur sans modifier la progression.

## Processus de livraison

La branche `main` est protégée par le
[ruleset GitHub](https://github.com/floiaassistant-design/couronne-et-arcanes/rules/26023976) :
PR obligatoire, branche à jour et contrôles `validation` et `assemblage-web`.
L'autorisation explicite du propriétaire est conservée ; aucune fusion
automatique. Les PR constituent les journaux des travaux en cours et portent
leurs preuves de tests et points de reprise. `AGENTS.md` fixe les règles.

La distribution du jeu est séparée de la fusion. Le suivi de publication
existant a confirmé le 2 novembre 2026 la **version publique 22**, basée sur
le commit GitHub `afdf6543761dd04c832e268f7d5f261cb23addf6` (PR 72),
avec le commit Sites `10f7143b06bce3a24a61f5ae5462cdea70064714`.
Ce constat ne prouve pas la publication des PR 73 et 75. Vérifier le paquet
exact et le flux existant, sans lancer de publication parallèle.

[Jeu public](https://couronnes-arcanes-jeu.flo-ia-assistant.chatgpt.site) ·
[Procédure de publication](PUBLICATION_WEB_2026_10_23.md)

## Lot Ombre intégré

Les [Rares/Épiques](OMBRE_RARE_EPIQUE.md), [Légendaires](OMBRE_LEGENDAIRES.md)
et [Divines/Éveillées](OMBRE_DIVINES_EVEILLEES.md) sont intégrées par les
PR 70/71/72. Les onze personnages Ombre disposent de 54 versions,
dont 43 évolutions ; les deux ascensions sont communes à la faction.
La publication du main intégrant ces lots est suivie indépendamment de leur fusion.

## Travaux durables restant à réaliser

- Auditer une campagne complète depuis zéro dans l'interface, avec achats,
  construction de decks, progression et décisions de l'IA. Les 96 rencontres
  isolées de l'audit ne remplacent pas ce parcours complet.
- Vérifier la lisibilité et l'interaction sur téléphone physique ; la CI
  couvre Chromium simulé, pas Safari, Firefox ni l'équilibrage humain.
- Relire les validations Notion les plus récentes à chaque tranche ; préparer
  séparément les hauts rangs Forge encore absents et les évolutions Éther,
  sans appliquer implicitement leurs décisions natives. [Reprise](REPRISE_MIGRATION_CARTES.md).
- Terminer la revue des [cinq Légendaires Forge de statistiques](FORGE_LEGENDAIRES_STATS.md) dans la [PR 78](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/78) : export hors ligne régénéré, références des tests actualisées et parcours navigateur Forge ajouté ; CI du commit final puis accord spécifique requis. Proposition non fusionnée, non publiée.
- Assurer pour chaque nouvelle PR un bilan documentaire, un point de reprise
  et une relecture du diff avant proposition de fusion.

## Références

[Consignes permanentes](../AGENTS.md) ·
[Carte des tests](CARTE_TESTS.md) ·
[Migration des cartes](REPRISE_MIGRATION_CARTES.md) ·
[Audit campagne/IA](AUDIT_CAMPAGNE_IA_2026_10_31.md) ·
[Historique des états](HISTORIQUE_ETAT_2026_10_31.md) ·
[Historique des consignes](HISTORIQUE_CONSIGNES_2026_10_31.md).
