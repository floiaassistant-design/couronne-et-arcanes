# État du projet — reprise du 5 novembre 2026

GitHub est la source officielle. À chaque reprise, lire [main](https://github.com/floiaassistant-design/couronne-et-arcanes/tree/main),
[les PR ouvertes](https://github.com/floiaassistant-design/couronne-et-arcanes/pulls) et
[leurs contrôles exacts](https://github.com/floiaassistant-design/couronne-et-arcanes/actions).
Ce fichier conserve les jalons durables ; les PR portent le dernier commit, les
preuves et les limites. Une CI ou une fusion ne prouve pas la publication.

## Intégré sur main

Dernier main observé : `3ba15786de52f33877b2854bf743430bdc1ca327` (PR 87),
arbre `698af18ea3ebc97ca33835b9f74d853ba86bf89c`, identique à sa tête revue/testée ;
six contrôles réussis avant fusion. Export `d6f3a2f42719f6249e96b09c5b092bb6315e2e97` confirmé.
Les contours intérieurs de rareté de 2 px sont intégrés dans toutes les vues,
sans changement de dimensions. La publication est une observation distincte.

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
`2df95c6538fcff05a3d88d861078a659cd549d4a` ; commit de diffusion
`ccc8dd42a6f6ffe435ae63c94fc0876ecfbe9e31`.
Paquet, provenance, empreintes et fichiers après publication vérifiés par ce suivi,
audience publique conservée. Le suivi du 5 novembre a ensuite signalé la publication
des contours bloquée : environnement d’exécution indisponible, vérifications du
paquet non réalisables. Le site reste en v29 ; aucune publication parallèle.

[Jeu public](https://couronnes-arcanes-jeu.flo-ia-assistant.chatgpt.site) ·
[Export publié](https://couronnes-arcanes-jeu.flo-ia-assistant.chatgpt.site/JOUER.html) ·
[Procédure](PUBLICATION_WEB_2026_10_23.md).

## Proposé, non intégré et non publié

- [Premiers Divins Éther](ETHER_PREMIERS_DIVINS.md), branche
  `feat/ether-premiers-divins-20261105`, réconciliée avec main `3ba15786` : cinq versions sur
  quatre personnages, une ascension Divine et cinq fusions. Dans la proposition :
  32 versions Éther, 21 évolutions, 192 recettes, neuf ascensions. Aucun Éveillé,
  changement de natif, paquet ou migration. Lire la PR pour ses contrôles actuels.
- [Soutiens de Vol](ETHER_DIVINS_VOL.md) : le Griffon et le Séraphin Divins
  reprennent cette ascension. La proposition définit 34 versions Éther, dont
  23 évolutions, et 194 recettes au total. La fusion exige son accord spécifique.

Cette branche réunit les contours intégrés et les évolutions Éther proposées.
Le contrôle Légendaire distingue désormais les Divines définies mais soumises à
ascension des Éveillées toujours absentes, avec chiffres attendus indépendants.
JOUER est régénéré depuis ces sources communes ; lire les contrôles de
l’assemblage complet sur sa nouvelle tête.
Chaque PR exige son accord spécifique ; aucun auto-merge. Sites reçoit uniquement
main intégré et vérifié.

## Prochain travail utile

Poursuivre les 16 évolutions Éther encore absentes après les deux lots, selon la dernière
validation Notion ; l’ascension Éveillée demeure distincte. La portée native 3 du
Feu follet exige son propre périmètre, aucune application implicite.
Auditer aussi une campagne UI complète depuis zéro ; les rencontres isolées et
combats préparés ne la remplacent pas. Vérifier lisibilité/interactions sur
vrai téléphone : Chromium simulé ne prouve ni Safari/Firefox ni équilibrage humain.

[Consignes](../AGENTS.md) · [Architecture](ARCHITECTURE_MODULAIRE_V2_6.md) ·
[Carte des tests](CARTE_TESTS.md) · [Jalons antérieurs conservés](HISTORIQUE_JALONS_2026_11_05.md) ·
[Historique antérieur](HISTORIQUE_ETAT_2026_10_31.md).
