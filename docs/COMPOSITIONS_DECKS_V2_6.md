# V2.6 — Atelier de compositions de decks

## Règles de la fonctionnalité

L'écran **Collection & deck** permet au joueur de prévisualiser puis de choisir l'une des quatre compositions proposées. L'utilisateur conserve la possibilité de modifier individuellement les cartes du deck.

| Style | Objectif | Taille visée | Sorts visés |
|---|---|---:|---:|
| Équilibré | Mixte, Garde, Charge, portée et soins | 18 | 4 |
| Assaut rapide | Unités rapides et agressives, sorts de dégâts | 16 | 2 |
| Rempart | Défense, Garde, soins et effets protecteurs | 18 | 4 |
| Arcanes | Sorts de contrôle, portée et unités Éther | 18 | 5 |

Le nombre de sorts est un objectif **et non une obligation** : le jeu ne sélectionne que les cartes possédées. Un joueur sans sorts peut donc obtenir un deck uniquement composé d'unités. Si la collection est limitée, un modèle peut proposer moins de 16/18 cartes, mais jamais moins de 12. Le moteur valide toutes les quantités avec la validation de deck existante.

Les exemplaires sont classés selon des scores déterministes de rôle, de statistiques, de délai et de capacités. Le classement peut favoriser des styles, sans fournir une garantie de victoire ni prétendre à un calcul d'optimalité. Il n'utilise aucune donnée cachée des adversaires ni ressource en ligne.

## Préservation des données

- Ouvrir l'aperçu **ne modifie ni le profil, ni la sauvegarde**.
- Appliquer remplace **uniquement** `profile.deck` et nécessite un clic explicite, après présentation des cartes.
- Impossible pendant un combat actif ; les cartes n'appartenant pas à la collection ne sont jamais créées.
- Aucune monnaie dépensée, aucune augmentation de statistiques, aucune altération des sauvegardes antérieures.

## Contrôles

- `tests/deck_builder_v26.test.mjs` vérifie quatre styles, répétabilité, stocks, stratégie différenciée, refus des choix invalides, compatibilité des sauvegardes et combats après application.
- `tests/browser_decks_v26.py` ouvre le HTML livré sur Chromium bureau/mobile : aperçu, annulation, confirmation, rechargement simulé, combat réel et blocage des changements pendant le combat.
- `npm test` : 115 tests ; `npm run test:parity` : 60 combats de référence inchangés.
- `npm run build` : HTML joueur autonome, illustrations intégrées et contrôles internes absents.

**Limites :** aucun classement multijoueur, calcul de deck optimal ou analyse statistique de victoires par archétype. L'équilibrage de ces compositions demandera de vraies parties ou des simulations supplémentaires sur plusieurs collections.
