# État du projet — reprise du 5 novembre 2026

GitHub est la source officielle. À chaque reprise, lire [main](https://github.com/floiaassistant-design/couronne-et-arcanes/tree/main),
[les PR ouvertes](https://github.com/floiaassistant-design/couronne-et-arcanes/pulls) et
[leurs contrôles exacts](https://github.com/floiaassistant-design/couronne-et-arcanes/actions).
Ce fichier conserve les jalons durables ; les PR portent le dernier commit, les
preuves et les limites. Une CI ou une fusion ne prouve pas la publication.

## Intégré sur main

Dernier main observé : `3fac34fa5a2b94cc705aca086d761bf6e524493c` (PR 86),
arbre `2df95c6538fcff05a3d88d861078a659cd549d4a`, identique à sa tête revue/testée ;
six contrôles réussis avant fusion. Export `a7bd33c9365a70599c29d67cfbc65d1683292ac2` confirmé.

- Aube : 51 versions, dont 41 évolutions obtenables.
- Sylve : 59 versions, dont 48 évolutions jusqu’à Éveillée.
- Ombre : 54 versions, dont 43 évolutions jusqu’à Éveillée.
- Forge : 49 versions, dont 39 évolutions jusqu’à Éveillée. Le Golem est intégré
  par PR 85 ; Cœur runique exige le cas interposé validé, jamais tout coup reçu.
- Éther : 27 versions, dont 16 évolutions intégrées par PR 84/86.
  [Repli et présage](ETHER_REPLI_PRESAGE.md) sont intégrés. Feu follet natif
  à portée 2 ; ses évolutions définies à portée 3.

187 recettes, huit ascensions communes, 53 unités natives et 23 sorts.
Le laboratoire utilise le même moteur, sans gain ni écriture dans l’aventure.
Sauvegardes protégées et transactions du profil/résultats sont intégrées.
[Migration et limites par faction](REPRISE_MIGRATION_CARTES.md).

## Publié, observation distincte

Le suivi existant a confirmé **Sites v29**, commit GitHub `3fac34fa` et arbre
ci-dessus ; commit de diffusion `ccc8dd42a6f6ffe435ae63c94fc0876ecfbe9e31`.
Paquet, provenance, empreintes et fichiers après publication vérifiés par ce suivi,
audience publique conservée. Aucun déploiement concurrent.

[Jeu public](https://couronnes-arcanes-jeu.flo-ia-assistant.chatgpt.site) ·
[Export publié](https://couronnes-arcanes-jeu.flo-ia-assistant.chatgpt.site/JOUER.html) ·
[Procédure](PUBLICATION_WEB_2026_10_23.md).

## Proposé, non intégré et non publié

- [PR 87 — contours de rareté](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/87) :
  filet intérieur partagé de 2 px, dimensions préservées. Tête `cc17b0b`, diff
  relu et six contrôles réussis ; accord spécifique toujours requis.
- [Premiers Divins Éther](ETHER_PREMIERS_DIVINS.md), branche
  `feat/ether-premiers-divins-20261105`, base main `3fac34fa` : cinq versions sur
  quatre personnages, une ascension Divine et cinq fusions. Dans la proposition :
  32 versions Éther, 21 évolutions, 192 recettes, neuf ascensions. Aucun Éveillé,
  changement de natif, paquet ou migration. Lire la PR pour ses contrôles actuels.

Les deux lots sont indépendants et partagent des documents et l’export généré.
Après une fusion autorisée, reprendre le nouveau main, préserver les deux apports,
régénérer JOUER et contrôler leur assemblage. Chaque PR exige son propre accord ;
aucun auto-merge. Sites reçoit uniquement main intégré et vérifié.

## Prochain travail utile

Poursuivre les 18 évolutions Éther encore absentes après ce lot, selon la dernière
validation Notion ; l’ascension Éveillée demeure distincte. La portée native 3 du
Feu follet exige son propre périmètre, aucune application implicite.
Auditer aussi une campagne UI complète depuis zéro ; les rencontres isolées et
combats préparés ne la remplacent pas. Vérifier lisibilité/interactions sur
vrai téléphone : Chromium simulé ne prouve ni Safari/Firefox ni équilibrage humain.

[Consignes](../AGENTS.md) · [Architecture](ARCHITECTURE_MODULAIRE_V2_6.md) ·
[Carte des tests](CARTE_TESTS.md) · [Jalons antérieurs conservés](HISTORIQUE_JALONS_2026_11_05.md) ·
[Historique antérieur](HISTORIQUE_ETAT_2026_10_31.md).
