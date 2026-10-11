# IA tactique — V1.7

## Objectif
Faire choisir une action utile à l'adversaire **sur les trois lignes du plateau existant**, sans modifier les règles du joueur et sans consultation des cartes cachées du joueur.

## Architecture
- `src/ai.js` : `inspectEnemyLane(b, lane)`, `rankEnemyMoves(b)` ; aucun DOM, aucun effet de bord, aucun RNG, seulement la situation visible et la propre main de l'adversaire.
- `src/engine.js` : `enemyAct` récupère les options, joue la mieux évaluée si valide, écrit `aiLastPlan`, puis **recalcule** l'ensemble des options pour sa seconde action.
- `src/app.js` : affiche uniquement la **dernière intention effectivement jouée**, sans montrer les cartes non encore jouées.
- `scripts/build_standalone.mjs` : concatène data, IA, moteur, visuels, UI ; charge une page HTML autonome hors ligne.

## Heuristiques actuelles
- Proximité des créatures du joueur avec la couronne adverse et dégâts potentiels.
- Ciblage des créatures dangereuses par un sort de dégâts / de contrôle.
- Rejet des sorts sans cible ou dont les bénéfices sont inexistants (soins à PV maximum, contrôle sans unité, etc.).
- Bonus de formation pour le placement de créatures de même faction sur une ligne.
- Priorité secondaire au développement d'une ligne sans menace.
- Respect des cases d'entrée occupées, délais d'invocation et limite de 2 cartes par tour.

## Hypothèses et limites
- **Non apprenante** : pas de réseau neuronal, pas de recherche Monte-Carlo, pas de mémoire de l'historique des parties, pas d'exécution de plusieurs tours simulés.
- Aucun accès à la main, à la pioche ou aux cartes cachées du joueur.
- L'ennemi de campagne conserve ses caractéristiques de difficulté propres à la mission : ce n'est pas un adversaire PvP strictement symétrique en progression.
- Les adversaires n'ont pas encore de styles distincts (agressif, contrôle, défense) ; les scores sont communs à tous.
- L'équilibrage à long terme de la campagne reste à mesurer sur de nombreuses parties.

## Validation
- `npm test` : 49 tests, dont 10 nouveaux ciblant le choix de la bonne ligne, les sorts utiles, les soins, la formation, l'absence de triche et la limitation à deux actions.
- `python3 tests/browser_v17.py` : test Chromium desktop et mobile, présence de l'interface tactique et absence d'erreur JavaScript.
- Suites historiques : `browser_smoke.py`, `browser_vfx.py`, `browser_creatures.py`, `browser_traits.py`, `browser_v16.py`.
