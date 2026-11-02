# État du projet — jalons durables (2 novembre 2026)

Ce fichier décrit les faits intégrés et les chantiers durables, pas l'état
instantané des tests, des branches ou des déploiements. **À chaque reprise**,
consulter [les PR GitHub](https://github.com/floiaassistant-design/couronne-et-arcanes/pulls),
la branche `main` et les [exécutions GitHub Actions](https://github.com/floiaassistant-design/couronne-et-arcanes/actions).
Ne pas déduire un état actuel d'un ancien SHA ou d'un compte rendu daté.

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

Les évolutions de l'Aube sont obtenables (41), celles de la Sylve également
jusqu'au rang Éveillé (48). Ombre, Forge et Éther restent natifs sur ce main. Le laboratoire réutilise le même moteur sans modifier la progression.

## Processus de livraison

La branche `main` est protégée par le
[ruleset GitHub](https://github.com/floiaassistant-design/couronne-et-arcanes/rules/26023976) :
PR obligatoire, branche à jour et contrôles `validation` et `assemblage-web`.
L'autorisation explicite du propriétaire est conservée ; aucune fusion
automatique. Les PR constituent les journaux des travaux en cours et portent
leurs preuves de tests et points de reprise. `AGENTS.md` fixe les règles.

La distribution du jeu est séparée de la fusion. Sites a confirmé le
2 novembre 2026, avant la fusion de la PR 69, la **version publique 19** et
son déploiement réussi. Le commit du dépôt de diffusion Sites est distinct
du SHA GitHub du jeu ; cette observation ne confirme pas la publication de
la PR 69. Vérifier le paquet du main exact et le flux de publication existant,
sans lancer de publication parallèle.

[Jeu public](https://couronnes-arcanes-jeu.flo-ia-assistant.chatgpt.site) ·
[Procédure de publication](PUBLICATION_WEB_2026_10_23.md)

## Lot Ombre en préparation

La première tranche [Ombre Rare/Épique](OMBRE_RARE_EPIQUE.md) prépare onze
évolutions et un paquet distinct, sur le main intégrant la PR 69
(`c9ab3209472a0433931c23315164c714af9099da`). Les 32 autres
évolutions Ombre restent à réaliser : dix Légendaires puis 22 hauts rangs.

## Travaux durables restant à réaliser

- Auditer une campagne complète depuis zéro dans l'interface, avec achats,
  construction de decks, progression et décisions de l'IA. Les 96 rencontres
  isolées de l'audit ne remplacent pas ce parcours complet.
- Vérifier la lisibilité et l'interaction sur téléphone physique ; la CI
  couvre Chromium simulé, pas Safari, Firefox ni l'équilibrage humain.
- Relire la proposition Ombre Rare/Épique et sa CI avant intégration autorisée ;
  préparer ensuite dix Légendaires puis 22 hauts rangs, en relisant leurs
  validations Notion. [Contrat et reprise](OMBRE_RARE_EPIQUE.md).
- Assurer pour chaque nouvelle PR un bilan documentaire, un point de reprise
  et une relecture du diff avant proposition de fusion.

## Références

[Consignes permanentes](../AGENTS.md) ·
[Carte des tests](CARTE_TESTS.md) ·
[Migration des cartes](REPRISE_MIGRATION_CARTES.md) ·
[Audit campagne/IA](AUDIT_CAMPAGNE_IA_2026_10_31.md) ·
[Historique des états](HISTORIQUE_ETAT_2026_10_31.md) ·
[Historique des consignes](HISTORIQUE_CONSIGNES_2026_10_31.md).
