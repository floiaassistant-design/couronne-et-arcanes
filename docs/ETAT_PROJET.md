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

Les [soutiens de Vol](ETHER_DIVINS_VOL.md) sont intégrés par la PR 89 au commit
`708317c3935f3cf70e754ad7f1df4dc3bee862c7`. Son arbre
`2fa4f3c2b53561d865fbdc7c91dbbc6cd95e69fa` correspond aux six contrôles réussis.

- Aube : 51 versions, dont 41 évolutions obtenables.
- Sylve : 59 versions, dont 48 évolutions jusqu’à Éveillée.
- Ombre : 54 versions, dont 43 évolutions jusqu’à Éveillée.
- Forge : 49 versions, dont 39 évolutions jusqu’à Éveillée. Le Golem est intégré
  par PR 85 ; Cœur runique exige le cas interposé validé, jamais tout coup reçu.
- Éther : 34 versions, dont 23 évolutions et la première ascension Divine.
  Le Feu follet natif a une portée de 2 et ses évolutions une portée de 3.

194 recettes, neuf ascensions communes, 53 unités natives et 23 sorts.
Le laboratoire utilise le même moteur, sans gain ni écriture dans l’aventure.
Sauvegardes protégées et transactions du profil/résultats sont intégrées.
[Migration et limites par faction](REPRISE_MIGRATION_CARTES.md).

## Publié, observation distincte

**Sites v30** est publiée au commit de diffusion
`716042d0dea171b9fb21711f07cef4e15bd7b55d`. Le registre Éther servi en ligne
correspond à celui de la PR 88. La publication des soutiens de Vol est en cours
via le suivi existant au moment de ce relevé.

[Jeu public](https://couronnes-arcanes-jeu.flo-ia-assistant.chatgpt.site) ·
[Export publié](https://couronnes-arcanes-jeu.flo-ia-assistant.chatgpt.site/JOUER.html) ·
[Procédure](PUBLICATION_WEB_2026_10_23.md).

## Proposé, non intégré et non publié

- [Effets d’Impact](ETHER_DIVINS_IMPACT.md) : Élémentaire azuré et Esprit de
  Tempête Divins. Ce lot porte la proposition à 36 versions, 25 évolutions et
  196 recettes.

## Prochain travail utile

Poursuivre les 14 évolutions Éther encore absentes après ces lots, selon la dernière
validation Notion ; l’ascension Éveillée demeure distincte. La portée native 3 du
Feu follet exige son propre périmètre, aucune application implicite.
Auditer aussi une campagne UI complète depuis zéro ; les rencontres isolées et
combats préparés ne la remplacent pas. Vérifier lisibilité/interactions sur
vrai téléphone : Chromium simulé ne prouve ni Safari/Firefox ni équilibrage humain.

[Consignes](../AGENTS.md) · [Architecture](ARCHITECTURE_MODULAIRE_V2_6.md) ·
[Carte des tests](CARTE_TESTS.md) · [Jalons antérieurs conservés](HISTORIQUE_JALONS_2026_11_05.md) ·
[Historique antérieur](HISTORIQUE_ETAT_2026_10_31.md).
