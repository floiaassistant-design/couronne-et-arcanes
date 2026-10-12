# Couronnes & Arcanes — V2.10 (branche d'évolution)

- Base officielle avant évolution : V2.9 sur `main`, commit `91e69ae7acb94d92c67a656c82ec50f8ddd83d36`.
- Branche de développement : `feat/v2.10-tempo-countdown`.
- 76 cartes : deux nouveaux sorts de tempo, sans modification des 74 cartes antérieures, ni des rencontres historiques.
- Module pur `src/engine/tempo.js` pour le ciblage et les effets ; IA, combat, alchimie et Guide adaptés. Même format de sauvegarde (`wait` sur les cartes en main).
- Tests : `tests/tempo_v210.test.mjs`, suites historiques, 60 parités, compilation autonome et contrôle navigateur/équilibrage à vérifier dans la CI de la PR.
- Limites : aucune nouvelle unité chronomancienne ; IA heuristique ; pas de preuve de test sur téléphone physique.
- Après V2.10 : donjon tactique original, puis équilibrage en situation.

`main` reste la référence stable tant que la PR n'est pas fusionnée.
