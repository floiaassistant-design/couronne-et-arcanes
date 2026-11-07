# État du projet — reprise du 6 novembre 2026

GitHub est la source officielle. À chaque reprise, lire [main](https://github.com/floiaassistant-design/couronne-et-arcanes/tree/main),
[les PR ouvertes](https://github.com/floiaassistant-design/couronne-et-arcanes/pulls) et
[leurs contrôles exacts](https://github.com/floiaassistant-design/couronne-et-arcanes/actions).
Ce fichier conserve les jalons durables ; les PR portent le dernier commit, les
preuves et les limites. Une CI ou une fusion ne prouve pas la publication.

## Ajustement proposé au Comptoir

Les cinq paquets d’évolution passent à 125 or. Ils contiennent trois cartes de
la faction, avec les mêmes taux de 60/35/5 par carte. Le Mystique coûte 95 or.

## Intégré sur main

Les [premiers Divins Éther](ETHER_PREMIERS_DIVINS.md) sont intégrés par la PR 88
au commit `3d28789bfc7081aad38f15a05376d6993b0d778f`, dont l’arbre
`9800b9024fe7e9abbbf7296843b0bfadcaed1d04` correspond à celui des six contrôles
réussis. L’export intégré est `16f206caae1cc1b895fc19543f3fd05c4a326196`.
Les contours intérieurs de rareté intégrés par la PR 87 sont inclus.

Les [soutiens de Vol](ETHER_DIVINS_VOL.md) sont intégrés par la PR 89 au commit
`708317c3935f3cf70e754ad7f1df4dc3bee862c7`. Son arbre
`2fa4f3c2b53561d865fbdc7c91dbbc6cd95e69fa` correspond aux six contrôles réussis.

Les [effets d’Impact](ETHER_DIVINS_IMPACT.md) sont intégrés par la PR 90 au
commit `a5404b8d1c54dd774b9c72be19083ef19eaa1759`. Son arbre
`2f00dda645335680fe340e79afff2347777aad22` correspond aux six contrôles réussis.

Les [dernières Divines Éther](ETHER_DERNIERES_DIVINES.md) sont intégrées par
la PR 91 au commit `fc9ec5e55bc7e99bd40be2ca9ed6740ce4e15305`. Son arbre
`9a62c086ede78b0fd65ea320e07d8f51d13d2afc` correspond aux six contrôles réussis.

Les [premières Éveillées Éther](ETHER_PREMIERES_EVEILLEES.md) et leur ascension sont
intégrées par la PR 92 au commit `2755fdc817295a8b5403c5cb9fb76c4edb746e5f`,
sur l’arbre contrôlé `14c76638891a5e8dd08dff23ab0effbec00e3ed3`.

- Aube : 51 versions, dont 41 évolutions obtenables.
- Sylve : 59 versions, dont 48 évolutions jusqu’à Éveillée.
- Ombre : 54 versions, dont 43 évolutions jusqu’à Éveillée.
- Forge : 49 versions, dont 39 évolutions jusqu’à Éveillée. Le Golem est intégré
  par PR 85 ; Cœur runique exige le cas interposé validé, jamais tout coup reçu.
- Éther : 43 versions, dont 32 évolutions, les onze Divines et quatre Éveillées.
  Le Feu follet natif a une portée de 2 et ses évolutions une portée de 3.

203 recettes, dix ascensions communes, 53 unités natives et 23 sorts.
Le laboratoire utilise le même moteur, sans gain ni écriture dans l’aventure.
Sauvegardes protégées et transactions du profil/résultats sont intégrées.
[Migration et limites par faction](REPRISE_MIGRATION_CARTES.md).

## Publié, observation distincte

**Sites v33** a publié les dernières Divines de la PR 91 au commit de diffusion
`50f0e165ce9560f5d25a75504bc7ae1f7e4c184e`, vérifié sur le site. La publication
des premières Éveillées passe par le suivi existant.

[Jeu public](https://couronnes-arcanes-jeu.flo-ia-assistant.chatgpt.site) ·
[Export hors ligne intégré](https://raw.githubusercontent.com/floiaassistant-design/couronne-et-arcanes/2755fdc817295a8b5403c5cb9fb76c4edb746e5f/JOUER.html) ·
[Procédure](PUBLICATION_WEB_2026_10_23.md).

## Proposé, non intégré et non publié

- [Dernières Éveillées](ETHER_DERNIERES_EVEILLEES.md) : sept rangs proposés,
  50 versions Éther, 39 évolutions Éther et 210 recettes au total.

- [Portée du Feu follet](ETHER_PORTEE_FEU_FOLLET.md) : trois cases à toutes
  les raretés et tir sans traverser une unité, dans une proposition distincte.

## Prochain travail utile
Auditer aussi une campagne UI complète depuis zéro ; les rencontres isolées et
combats préparés ne la remplacent pas. Vérifier lisibilité/interactions sur
vrai téléphone : Chromium simulé ne prouve ni Safari/Firefox ni équilibrage humain.

[Consignes](../AGENTS.md) · [Architecture](ARCHITECTURE_MODULAIRE_V2_6.md) ·
[Carte des tests](CARTE_TESTS.md) · [Jalons antérieurs conservés](HISTORIQUE_JALONS_2026_11_05.md) ·
[Historique antérieur](HISTORIQUE_ETAT_2026_10_31.md).
