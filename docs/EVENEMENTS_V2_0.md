# V2.0 — Événements des donjons

## Principe
Un événement est proposé uniquement après une victoire dans les salles principales 1 et 2 de chaque donjon. Chaque événement ne peut être résolu qu'une seule fois. Le combat de la salle suivante ne peut pas démarrer sans choix.

| Choix | Effet | Risque |
|---|---|---|
| Repos | Soigne jusqu'à 10 PV supplémentaires, plafonnés au maximum de PV du héros | Aucun |
| Coffre ancien | +35 + 10×index de salle en or et +12 + 5×index en éclats, index 1 ou 2 | Aucun |
| Embuscade | Combat supplémentaire, récompense après victoire (60 ou 75 or ; 26 ou 32 éclats) et +6 PV de repos | Défaite : expédition terminée |

Les +6 PV de récupération après chaque victoire (V1.9) restent inchangés. Le donjon compte toujours **trois salles principales**, mais une expédition peut comporter **trois à cinq combats** selon les choix.

## Modèle d'état et compatibilité
- `dungeonRun` dans le profil conserve `id`, `stage`, `hp`, `maxhp` et `phase` : `ready`, `choice`, `bonus`.
- Une ancienne sauvegarde V1.9 sans champ `phase` est normalisée en `ready` : elle peut continuer sans événement imposé rétroactivement.
- Le combat bonus reçoit un `missionId` indépendant (`B_<id>_<n>`), distinct des combats principaux (`D_<id>_<n>`).
- `settleDungeonBattle` contrôle le donjon, la salle, la phase et l'ID de mission avant tout versement. Après résolution, la phase change immédiatement ; le règlement répété est rejeté.
- La sauvegarde du profil conserve les clés locales historiques. Les événements visuels ne sont pas persistés.

## Fichiers et tests
- `src/dungeons.js` : création des rencontres bonus.
- `src/engine.js` : décision, transition, combat et récompenses.
- `src/app.js` et `styles.css` : panneau de choix et écrans de progression.
- `tests/events_v20.test.mjs` et `tests/browser_events_v20.py` : décisions, duplications, combats, sauvegardes et réouverture simulée.
- Pour reconstruire le fichier HTML autonome, exécuter `npm run build` puis valider navigateur.

## Limites
Événements prévisibles et non procéduraux, solo hors ligne ; aucune promesse de difficulté équilibrée ou de synchronisation entre appareils.
