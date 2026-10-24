# État courant — 24 octobre 2026

## Main, jeu et publication

Main officiel vérifié : `63bc8b14b09bf4ecd94bb12bc6aecf17d8d2678e`, fusion autorisée de la
[PR nº 45](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/45)
le 24 octobre 2026. Les PR nº 43 (documentation Concorde) et nº 44 (délai
minimal 1) sont également fusionnées. Les 76 cartes, le ciblage direct, les
effets de combat, le laboratoire et Concorde sont intégrés.

Les repères de camp sont un rond bleu allié et un losange rouge adverse de 7 px,
à gauche des cartes ; les fiches main, plateau et Collection montrent le symbole
d'Ordre puis « Bonus de faction : +1 attaque », grisé et explicite si inactif.
La lumière de l'emblème peint reste en place. Aucun changement des règles,
statistiques, illustrations, progression ou sauvegardes par la PR nº 45.
[Contrat](REPERES_CAMP_FICHES_2026_10_24.md).

Le délai de base minimum est 1 pour les 76 cartes ; les huit anciennes unités
à délai 0 restent immédiatement jouables après pioche et les compositions de
decks historiques sont préservées (PR nº 44). Web et export
`JOUER.html` partagent leurs sources ; un seul export jouable hors ligne.
Les anciens combats 3×5 et sauvegardes restent compatibles selon les
contrôles rapportés dans les PR.

## Contrôles vérifiés et diffusion

La [PR nº 45](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/45)
documente, sur l'arbre de code correspondant au main fusionné, les résultats
de la CI finale : 333 tests, 60 scénarios de parité, deux builds et les
parcours navigateur automatisés bureau/mobile simulé, jeu ancien et sauvegardes.
L'export JOUER généré depuis les sources et sa présence sur GitHub ont été
vérifiés. Aucune nouvelle exécution de ces tests n'est revendiquée par cette
mise à jour purement documentaire. Les vérifications ne couvrent pas le
téléphone physique, Safari/Firefox ni l'équilibrage humain exhaustif.

L'automatisation existante a publié le même jeu sur
[Couronnes & Arcanes](https://couronnes-arcanes-jeu.flo-ia-assistant.chatgpt.site) :
**Sites version 7**, déploiement
`appgdep_6adcf79b58a88191a148fcf5539a926c`, terminé avec succès
et fichiers diffusés comparés au paquet, selon le bilan de la PR nº 45.
La publication est distincte de la fusion ; ne pas la déduire d'une simple CI.
[Procédure et historique](PUBLICATION_WEB_2026_10_23.md).

## Proposition de CI sélective — en préparation

Branche `ci/sauter-tests-complets-pr-docs-20261024` : optimisations
des deux workflows pour les PR Markdown uniquement. Les jobs restent
visibles, la détection est prudente et couverte par de nouveaux tests.
Toute PR touchant au jeu, à la configuration, aux ressources, à l'export
ou à la CI garde le parcours complet ; tout push sur main conserve
également les deux contrôles et l'archive de diffusion Sites.
**Proposition non fusionnée, non publiée** : seule une PR approuvée
spécifiquement pourra changer cette politique.

## Proposition ouverte et prochaine étape

La [PR nº 41](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/41)
reste ouverte en brouillon parmi les travaux antérieurs. C'est un
audit documentaire des 53 unités et 23 sorts, réalisé à partir
d'un ancien main ; ses constats et descriptifs doivent être rapprochés des
modifications fusionnées depuis, sans intégrer automatiquement de nouvelles
règles. Garde, Impact de zone, Feu follet et les évolutions des cartes restent
des choix de conception à programmer séparément.

Les décisions de conception sont suivies dans
[Notion — plan des 76 cartes](https://app.notion.com/p/4026633072a881ed9768c615f538a929)
et [Notion — évolutions des 53 unités](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f).
GitHub reste la source officielle des fonctions réellement intégrées ; une
proposition Notion n'est ni un changement de code ni une fusion.

Toute nouvelle PR, y compris documentaire, attend un accord explicite et
spécifique du propriétaire avant fusion. Recontrôler main, le diff et la CI
sur la version exacte avant toute intégration.
