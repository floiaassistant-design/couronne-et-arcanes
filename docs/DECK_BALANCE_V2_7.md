# V2.7 — Audit comparatif des compositions de deck

## Périmètre et méthode

- **24 configurations** : quatre decks × trois collections (`depart`, `progression`, `catalogue`) × deux classes (Gardien et Arcaniste).
- **16 rencontres par configuration** : douze missions de campagne, deux étages de Tour et deux salles de donjon ; **32 graines déterministes** identiques entre variantes.
- **12 288 combats simulés avant et 12 288 après** (24 576 au total), mêmes adversaires et même heuristique automatisée du joueur.
- Tous les decks générés sont contrôlés par `validateDeck()` et respectent les exemplaires appartenant à la collection de laboratoire ; les collections avancées sont **fictives pour le benchmark**, aucune carte n'est donnée au joueur.
- **Ce ne sont pas des statistiques de joueurs humains ni une preuve d'équilibrage compétitif.** Le robot joue selon une tactique simplifiée qui sous-utilise certains sorts et stratégies offensives. Les cartes et l'IA ennemie ne sont pas modifiées.

## Changement retenu

- La composition **Arcanes** intègre désormais au plus **3 sorts sélectionnés en priorité**, au lieu de 5. Cela laisse davantage de place aux unités magiques, notamment celles qui peuvent occuper rapidement le plateau.
- **Assaut rapide : inchangé** (16 cartes, 2 sorts). Une expérimentation à 18 cartes et 3 sorts a dégradé ses performances sur l'échantillon large ; elle a été abandonnée.
- **Équilibré et Rempart : inchangés**. Les autres modes, la progression, les statistiques et les sauvegardes restent identiques.

## Résultat reproductible pour la composition Arcanes

| Collection simulée | Classe | V2.6 | V2.7 | Écart |
|---|---|---:|---:|---:|
| depart | gardien | 24.8 % | 27.5 % | +2.7 pts |
| depart | arcaniste | 26.0 % | 29.5 % | +3.5 pts |
| progression | gardien | 38.9 % | 39.8 % | +0.9 pts |
| progression | arcaniste | 38.5 % | 40.0 % | +1.5 pts |
| catalogue | gardien | 69.1 % | 72.5 % | +3.4 pts |
| catalogue | arcaniste | 74.4 % | 76.2 % | +1.8 pts |

Le déséquilibre entre Rempart et les compositions offensives avec des collections intermédiaires reste important dans **ce simulateur**. Aucun ajustement de combat supplémentaire n'est justifié avant des tests humains et l'amélioration du joueur automatisé.

## Reproduction

```bash
npm test
npm run test:parity
DECK_SEEDS=32 npm run deck-balance
DECK_SEEDS=32 node scripts/deck_style_balance.mjs --json
```

Fichiers source des résultats : `docs/DECK_BENCHMARK_V2_6_BASELINE.json` et `docs/DECK_BENCHMARK_V2_7.json`. Le simulateur partagé se trouve dans `scripts/lib/battle_runner.mjs` et les profils de laboratoire dans `scripts/lib/deck_scenarios.mjs` ; aucune de ces ressources n'est intégrée au HTML joueur.

## GitHub

Le dépôt peut être créé ou relié à partir de ce dossier. `.github/workflows/test.yml` exécute les tests, vérifie la parité et compile le HTML sur push vers `main` et sur pull request. **La présence du fichier de workflow ne prouve pas une exécution sur GitHub** : aucun dépôt distant ni résultat Actions ne doit être revendiqué sans vérification réelle.
