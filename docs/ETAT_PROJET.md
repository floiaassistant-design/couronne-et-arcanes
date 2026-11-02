# État du projet — jalons durables (2 novembre 2026)

Ce fichier décrit les faits intégrés et les chantiers durables, pas l'état
instantané des tests, des branches ou des déploiements. **À chaque reprise**,
consulter [les PR GitHub](https://github.com/floiaassistant-design/couronne-et-arcanes/pulls),
la branche `main` et les [exécutions GitHub Actions](https://github.com/floiaassistant-design/couronne-et-arcanes/actions).
Ne pas déduire un état actuel d'un ancien SHA ou d'un compte rendu daté.

## Reprise Forge Rare/Épique — proposition du 2 novembre 2026

Le dernier main observé au début de la branche est `843f1412f689b75acca7ff80fb44b99c149cb6c7`, intégrant la PR 73 d'Impact de zone. La tranche [Forge Rare/Épique](FORGE_RARE_EPIQUE.md) propose dix versions sur sept unités et un paquet distinct, sans activation de rang supérieur ni écriture Notion. Ce lot doit encore être testé et relu dans sa PR, puis autorisé séparément avant fusion et publication.

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

Les évolutions de l'Aube sont obtenables (41), celles de la Sylve également
jusqu'au rang Éveillé (48), et celles de l'Ombre jusqu'à Éveillée (43) sont
intégrées. Forge et Éther restent natifs sur main à la base de cette proposition ;
les dix évolutions Forge sont exclusivement sur sa branche non fusionnée.
Le laboratoire réutilise le même moteur sans modifier la progression.

## Processus de livraison

La branche `main` est protégée par le
[ruleset GitHub](https://github.com/floiaassistant-design/couronne-et-arcanes/rules/26023976) :
PR obligatoire, branche à jour et contrôles `validation` et `assemblage-web`.
L'autorisation explicite du propriétaire est conservée ; aucune fusion
automatique. Les PR constituent les journaux des travaux en cours et portent
leurs preuves de tests et points de reprise. `AGENTS.md` fixe les règles.

La distribution du jeu est séparée de la fusion. Sites a confirmé le
2 novembre 2026 la **version publique 21**, déployée avec succès à 16:47, heure
de Paris. Son commit de diffusion `cc8325be47953df720e0a56589d082ad6ce293de`
est distinct du SHA GitHub du jeu ; cette observation ne prouve pas la publication
du main intégrant les PR 72 et 73. Vérifier le paquet exact et le flux existant, sans
lancer de publication parallèle.

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
- Relire les validations Notion les plus récentes à chaque tranche ; pour Forge,
  contrôler la PR Rare/Épique avant tout accord de fusion. Éther reste séparé,
  sans appliquer implicitement ses nouvelles décisions natives. [Reprise](REPRISE_MIGRATION_CARTES.md).
- Assurer pour chaque nouvelle PR un bilan documentaire, un point de reprise
  et une relecture du diff avant proposition de fusion.

## Références

[Consignes permanentes](../AGENTS.md) ·
[Carte des tests](CARTE_TESTS.md) ·
[Migration des cartes](REPRISE_MIGRATION_CARTES.md) ·
[Audit campagne/IA](AUDIT_CAMPAGNE_IA_2026_10_31.md) ·
[Historique des états](HISTORIQUE_ETAT_2026_10_31.md) ·
[Historique des consignes](HISTORIQUE_CONSIGNES_2026_10_31.md).
