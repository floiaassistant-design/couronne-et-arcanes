# Couronnes & Arcanes — architecture V2.5

## Objectif
Refactoriser **sans changer les règles ni la structure des sauvegardes**. Le jeu se joue toujours avec `JOUER.html` sans installation, réseau, ni outil de développement.

## Sources et responsabilités

```text
src/
  data.js              Cartes, factions et missions (données, aucune UI)
  talents.js           Définitions et validateur des choix de talents
  dungeons.js          Définitions des donjons et événements
  ai.js                Décisions tactiques de l'adversaire (pas de DOM)
  visuals.js           Références des portraits
  engine.js            Façade publique : réexporte les fonctions historiques
  engine/
    profile.js         Profil, équipement, deck, expérience et maîtrise
    battle.js          Tour de jeu, déplacements, attaques, pouvoirs
    dungeon-run.js     État des expéditions, transitions et événements
    economy.js         Récompenses de campagne, forge, fusion et paquets
  app.js               Contrôleur navigateur, navigation et actions
  ui/
    storage.js         Adaptateur localStorage pour profils et combats
    combat-fx.js       Animations uniquement (pas de modifications de dégâts)
    views.js           Cartes, éléments partagés et composition des vues
    pages.js           Citadelle, campagne, tour, donjons, collection, etc.
    battle-view.js     Plateau des combats
```

**Principes :** les modules de moteur n'accèdent ni au DOM ni à `localStorage`. Les vues ne modifient pas les règles. `app.js` orchestre les appels. Le fichier `engine.js` demeure le point d'entrée public compatible avec les anciennes importations de tests et d'outils Codex. Il ne contient plus la logique métier.

## Build et tests

- `npm test` — tests unitaires et architecture.
- `npm run test:parity` — compare **60 états finaux déterministes** avec une référence V2.4 figée dans `tests/fixtures/refactor_baseline_v24.json`. Cette référence couvre les combats de campagne et de tour, quatre classes et des pouvoirs de héros. Ne pas l'écraser pour masquer un changement de comportement.
- `npm run build` — produit uniquement **`JOUER.html`**, véritable version hors ligne.
- `npm run build:test` — produit **`tests/JOUER.test.html`** avec des contrôles internes accessibles aux tests Playwright. **Ne jamais publier ce fichier comme le jeu**. Le jeu final n'expose pas ces contrôles.
- Tests Playwright (`tests/browser_*.py`) : exécuter `npm run build:test` au préalable. Les tests utilisent le HTML de diagnostic et le même moteur que le jeu final.

Le générateur parcourt automatiquement les imports ES statiques et empaquette chaque module dans une fonction isolée. Il n'utilise aucun service réseau ni dépendance externe. Il traite uniquement les imports nommés et les réexports globaux qui existent aujourd'hui ; toute nouvelle syntaxe ES devra être ajoutée au générateur et testée explicitement.

## Compatibilité et points de vigilance

- Clés inchangées : `couronnes_arcanes_v1` et `couronnes_arcanes_bataille_v1` ; le paramètre VFX garde sa clé `couronnes_arcanes_animations_v13`.
- Aucune migration destructive ; la V2.5 est un **changement d'architecture**, pas une nouvelle règle.
- Une bataille en cours réouverte doit conserver ses champs facultatifs de talents, d'IA, de progression et de donjon.
- Les scripts d'équilibrage utilisent encore la façade `engine.js` ; ils restent compatibles.
- La vue principale `pages.js` a encore du volume et pourra être divisée par écran si de nouveaux menus apparaissent. Éviter de recréer un fichier géant en y ajoutant toutes les fonctionnalités.
- Les fonctionnalités en ligne (PvP, guildes, serveur) ne sont pas implémentées.

## Évolution V2.6

Le module `src/engine/deck-builder.js` a été ajouté pour la construction automatique de compositions à partir de la collection existante. Aucun changement de dépendance du DOM ni de la façade historique ; le générateur suit ce 17e module. Architecture courante : `docs/ARCHITECTURE_MODULAIRE_V2_6.md`.
