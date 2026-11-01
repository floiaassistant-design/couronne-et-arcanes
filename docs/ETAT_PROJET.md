# État du projet — jalons durables (1er novembre 2026)

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

Les évolutions de l'Aube sont obtenables (41), celles de la Sylve jusqu'au
rang Légendaire (26). Les 22 Divines/Éveillées Sylve restent à intégrer après
relecture des validations Notion ; Ombre, Forge et Éther restent natifs dans
le jeu. Le laboratoire réutilise le même moteur sans modifier la progression.

## Processus de livraison

La branche `main` est protégée par le
[ruleset GitHub](https://github.com/floiaassistant-design/couronne-et-arcanes/rules/26023976) :
PR obligatoire, branche à jour et contrôles `validation` et `assemblage-web`.
L'autorisation explicite du propriétaire est conservée ; aucune fusion
automatique. Les PR constituent les journaux des travaux en cours et portent
leurs preuves de tests et points de reprise. `AGENTS.md` fixe les règles.

La distribution du jeu est séparée de la fusion. La dernière publication
**explicitement vérifiée dans les bilans disponibles avant cette reprise**
était Sites version 18, code `117a643bf110995f3bc67dc86c55a678cc8b0f76`.
Ce repère historique **ne confirme pas** la publication des PR 66 ou 67.
Vérifier l'automatisation de publication et l'état réel de Sites pour une
version plus récente ; ne jamais republier en parallèle.

[Jeu public](https://couronnes-arcanes-jeu.flo-ia-assistant.chatgpt.site) ·
[Procédure de publication](PUBLICATION_WEB_2026_10_23.md)

## Travaux durables restant à réaliser

- Auditer une campagne complète depuis zéro dans l'interface, avec achats,
  construction de decks, progression et décisions de l'IA. Les 96 rencontres
  isolées de l'audit ne remplacent pas ce parcours complet.
- Vérifier la lisibilité et l'interaction sur téléphone physique ; la CI
  couvre Chromium simulé, pas Safari, Firefox ni l'équilibrage humain.
- Intégrer les Divines/Éveillées Sylve seulement après validation des règles
  et références dans Notion.
- Assurer pour chaque nouvelle PR un bilan documentaire, un point de reprise
  et une relecture du diff avant proposition de fusion.

## Références

[Consignes permanentes](../AGENTS.md) ·
[Carte des tests](CARTE_TESTS.md) ·
[Migration des cartes](REPRISE_MIGRATION_CARTES.md) ·
[Audit campagne/IA](AUDIT_CAMPAGNE_IA_2026_10_31.md) ·
[Historique des états](HISTORIQUE_ETAT_2026_10_31.md) ·
[Historique des consignes](HISTORIQUE_CONSIGNES_2026_10_31.md).
