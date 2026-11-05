# État du projet — reprise du 5 novembre 2026

GitHub est la source officielle. À chaque reprise, lire [main](https://github.com/floiaassistant-design/couronne-et-arcanes/tree/main),
[les PR ouvertes](https://github.com/floiaassistant-design/couronne-et-arcanes/pulls) et
[leurs contrôles exacts](https://github.com/floiaassistant-design/couronne-et-arcanes/actions).
Ce fichier conserve les jalons durables ; les PR portent le dernier commit, les
preuves et les limites. Une CI ou une fusion ne prouve pas la publication.

## Intégré sur main

Les [premiers Divins Éther](ETHER_PREMIERS_DIVINS.md) sont intégrés par la PR 88
au commit `3d28789bfc7081aad38f15a05376d6993b0d778f`, dont l’arbre
`9800b9024fe7e9abbbf7296843b0bfadcaed1d04` correspond à celui des six contrôles
réussis. L’export intégré est `16f206caae1cc1b895fc19543f3fd05c4a326196`.
Les contours intérieurs de rareté intégrés par la PR 87 sont inclus.

- Aube : 51 versions, dont 41 évolutions obtenables.
- Sylve : 59 versions, dont 48 évolutions jusqu’à Éveillée.
- Ombre : 54 versions, dont 43 évolutions jusqu’à Éveillée.
- Forge : 49 versions, dont 39 évolutions jusqu’à Éveillée. Le Golem est intégré
  par PR 85 ; Cœur runique exige le cas interposé validé, jamais tout coup reçu.
- Éther : 32 versions, dont 21 évolutions et la première ascension Divine.
  Le Feu follet natif a une portée de 2 et ses évolutions une portée de 3.

192 recettes, neuf ascensions communes, 53 unités natives et 23 sorts.
Le laboratoire utilise le même moteur, sans gain ni écriture dans l’aventure.
Sauvegardes protégées et transactions du profil/résultats sont intégrées.
[Migration et limites par faction](REPRISE_MIGRATION_CARTES.md).

## Publié, observation distincte

Le suivi existant a confirmé **Sites v29**, commit GitHub `3fac34fa` et arbre
`2df95c6538fcff05a3d88d861078a659cd549d4a` ; commit de diffusion
`ccc8dd42a6f6ffe435ae63c94fc0876ecfbe9e31`.
Paquet, provenance, empreintes et fichiers après publication vérifiés par ce suivi,
audience publique conservée. Le suivi du 5 novembre a ensuite signalé la publication
des contours bloquée faute d’environnement pour vérifier le paquet. Le suivi
existant a repris à la fusion de la PR 88. Le site reste en v29 à ce relevé.

[Jeu public](https://couronnes-arcanes-jeu.flo-ia-assistant.chatgpt.site) ·
[Export publié](https://couronnes-arcanes-jeu.flo-ia-assistant.chatgpt.site/JOUER.html) ·
[Procédure](PUBLICATION_WEB_2026_10_23.md).

## Proposé, non intégré et non publié

- [Soutiens de Vol](ETHER_DIVINS_VOL.md) : le Griffon et le Séraphin Divins
  reprennent cette ascension. La proposition définit 34 versions Éther, dont
  23 évolutions, et 194 recettes au total. La fusion exige son accord spécifique.

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
