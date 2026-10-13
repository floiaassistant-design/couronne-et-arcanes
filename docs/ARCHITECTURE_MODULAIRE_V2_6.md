# Architecture modulaire — V2.6

Le moteur reste indépendant du DOM, du navigateur et des sauvegardes. Le principe de conception est décrit dans `AGENTS.md` et la refonte initiale dans `ARCHITECTURE_MODULAIRE_V2_5.md`.

```text
src/
  data.js, talents.js, dungeons.js, ai.js, visuals.js
  engine.js                   Façade publique stable
  engine/
    profile.js                Profil, deck manuel, validation, progression et équipements
    deck-builder.js           Propositions automatiques de decks / analyses pures
    battle.js                 Moteur des combats
    dungeon-run.js            Parcours des expéditions
    economy.js                Récompenses, artisanat et ressources
  app.js                      Événements de l'interface, confirmations et navigation
  ui/
    pages.js                  Écrans et atelier de compositions
    views.js                  Composants partagés et cartes
    battle-view.js            Plateau tactique
    combat-fx.js              Animations
    storage.js                Adaptateur localStorage
```

- **17 modules** au total. `deck-builder.js` importe uniquement les cartes et `validateDeck` ; ni mutation du profil en aperçu, ni import de l'interface dans le moteur.
- `proposeDeck(profile,style)` calcule une proposition à partir de la collection ; `applyDeckStyle(profile,style)` remplace uniquement le tableau `deck` après validation.
- `pages.js` affiche les quatre propositions et les statistiques ; `app.js` affiche une confirmation avant toute application et bloque le changement pendant les combats actifs.
- Le générateur de `JOUER.html` inclut automatiquement les nouveaux imports. Le HTML final n'expose pas de variables internes et contient 12 illustrations intégrées.
- API `src/engine.js` et les clés `couronnes_arcanes_v1`, `couronnes_arcanes_bataille_v1` inchangées. Aucun champ supplémentaire dans les sauvegardes.
- À vérifier à chaque modification : `npm test`, `npm run test:parity`, `npm run build`, les tests Playwright dédiés et les contrôles historiques pertinents.

## Extension V2.11 — géométrie et art de l’arène

`src/engine/board.js` centralise les dimensions, colonnes des couronnes, cases d’entrée, colonnes centrales des pièges et validation des formats sauvegardés. Module pur, partagé par combat, contrôles, compétences, IA, rendu, stockage et simulateur ; il n’importe aucun de ces consommateurs. Les règles lisent le tableau existant, ce qui maintient les combats 3×5.

`src/ui/arena-art.js` dessine le décor et les silhouettes partagées en SVG sur une grille de pixels. Il ne dépend ni du DOM ni du moteur. Les sources font maintenant 22 modules empaquetés. `battle.js` reste cohérent à 372 lignes ; les vues historiques à lignes longues ne sont pas refondues dans cette mission.


## Proposition — Arène peinte fixe (hors main)

`src/ui/painted-arena.js` regroupe la projection des cases sur l'image choisie, les ancrages des unités/héros et l'adaptation de la scène au viewport. Il ne dépend ni du moteur ni des données de cartes. `battle-view.js` réutilise le rendu historique des cellules et les indices du moteur. `app.js` monte la scène et conserve ses deux défilements ; `combat-fx.js` connaît les ancrages mais n'anime pas le mode fixe. Ressource autonome et styles séparés dans `assets/backgrounds/`, inclus dans le builder. 23 modules empaquetés, mappings portraits et sauvegardes inchangés. Contrat et résultats : `docs/ARENE_PEINTE.md`.
