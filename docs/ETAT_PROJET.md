# État du projet — reprise du 9 novembre 2026

GitHub est la source officielle. À chaque reprise, lire [main](https://github.com/floiaassistant-design/couronne-et-arcanes/tree/main),
[les PR ouvertes](https://github.com/floiaassistant-design/couronne-et-arcanes/pulls) et
[leurs contrôles exacts](https://github.com/floiaassistant-design/couronne-et-arcanes/actions).
Ce fichier conserve les jalons durables ; les PR portent le dernier commit, les
preuves et les limites. Une CI ou une fusion ne prouve pas la publication.

## Héros de la Couronne

La PR 99 a intégré le visuel du joueur sur son socle dans l’arène peinte. Le [contrat des héros](HEROS_COURONNE_2026_11_07.md) documente le cadrage, la provenance et les contrôles.

## Héros adverses de campagne intégrés

Les douze missions affichent chacune un adversaire dédié avec une respiration légère. Les [visuels v01 et leur reçu](HEROS_ADVERSES.md) sont rattachés aux identifiants des missions. Le lot est intégré par la [PR 100](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/100). Les illustrations de la Tour et des donjons restent à préparer.

## Paquets de faction intégrés

La PR 96 a intégré les cinq paquets d’évolution à 125 or au commit
`a8f3d6b0d5f6b775703d4188ea685e206e71d0c9`. Les trois cartes et les
taux 60/35/5 restent inchangés. Le Mystique coûte 95 or.

## Contours de rareté renforcés — PR 97

La PR 97 porte le filet intérieur de 2 à 4 px et aligne la palette de la
Collection sur les six couleurs partagées. Aucune règle, illustration,
dimension ou sauvegarde ne change. JOUER.html est régénéré depuis les sources.
Fusion et publication sont distinctes : vérifier les statuts actuels de la
PR 97 et des Actions GitHub, sans déduire l'un de l'autre.

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

Les [sept dernières Éveillées Éther](ETHER_DERNIERES_EVEILLEES.md) sont
intégrées par la PR 93 au commit `84c6178a85e5e5b5dc0ad42dcf33c74dc92baf35`,
sur l’arbre contrôlé `3a8ba8261a11a54ff03e3124c140617e34c5939d`.

La [portée du Feu follet](ETHER_PORTEE_FEU_FOLLET.md) est intégrée par la PR 94
au commit `21e471cb9d1bc45a1e1d2abf4b7be3459e730bdf`. Les six raretés tirent
à trois cases. Le Feu follet touche le premier ennemi à portée sur sa ligne,
et une unité alliée fait écran.

- Aube : 51 versions, dont 41 évolutions obtenables.
- Sylve : 59 versions, dont 48 évolutions jusqu’à Éveillée.
- Ombre : 54 versions, dont 43 évolutions jusqu’à Éveillée.
- Forge : 49 versions, dont 39 évolutions jusqu’à Éveillée. Le Golem est intégré
  par PR 85 ; Cœur runique exige le cas interposé validé, jamais tout coup reçu.
- Éther : 50 versions, dont 39 évolutions, onze Divines et onze Éveillées.

210 recettes, dix ascensions communes, 53 unités natives et 23 sorts.
Le laboratoire utilise le même moteur, sans gain ni écriture dans l’aventure.
Sauvegardes protégées et transactions du profil/résultats sont intégrées.
[Migration et limites par faction](REPRISE_MIGRATION_CARTES.md).

## Publié, observation distincte

**Sites v38** a publié les héros adverses de campagne le 9 novembre 2026,
depuis main `d8ab41bbfb7ac36bd4b043b5bd4c0d19ed2a2888`.
Le [bilan de la PR 100](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/100)
consigne les preuves de publication.

[Jeu public](https://couronnes-arcanes-jeu.flo-ia-assistant.chatgpt.site) ·
[Export hors ligne intégré](https://raw.githubusercontent.com/floiaassistant-design/couronne-et-arcanes/d8ab41bbfb7ac36bd4b043b5bd4c0d19ed2a2888/JOUER.html) ·
[Procédure](PUBLICATION_WEB_2026_10_23.md).

## Prochain travail utile

La PR d’[audit de la campagne](AUDIT_CAMPAGNE_CONTINUE_2026_11_06.md) propose
un parcours reproductible des douze missions depuis un profil neuf. Vérifier
la lisibilité et les interactions sur un téléphone physique, puis compléter
les essais de jouabilité avec d’autres routes.

[Consignes](../AGENTS.md) · [Architecture](ARCHITECTURE_MODULAIRE_V2_6.md) ·
[Carte des tests](CARTE_TESTS.md) · [Jalons antérieurs conservés](HISTORIQUE_JALONS_2026_11_05.md) ·
[Historique antérieur](HISTORIQUE_ETAT_2026_10_31.md).
