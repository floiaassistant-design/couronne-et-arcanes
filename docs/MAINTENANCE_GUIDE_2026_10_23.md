# Maintenance ciblée — 23 octobre 2026

Base exacte : `adf9c9192293ea2e25849f37a0ac11d1df08c951`. Les PR 31 à 34 sont fusionnées ;
aucune PR ouverte dans le jeu à la vérification de départ.

## Périmètre
Le rendu statique du Guide est déplacé de `src/ui/pages.js` vers
`src/ui/guide-page.js` sans changer les textes, le balisage, les actions,
les sauvegardes ou l'interface publique de `createPages`.
`previousGameAvailable` reste relu à chaque rendu. Trois tests dédiés et
le garde de dépendances sont ajoutés. README, état et architecture distinguent
maintenant les PR fusionnées des anciennes propositions.

Aucun changement de combat, IA, économie, catalogue, graphismes, CSS,
animation, identifiants, sauvegardes ou géométrie historique.

## Vérification
À exécuter sur la tête de la PR : `npm test`,
`npm run test:parity`, `npm run build`, synchronisation exacte de
`JOUER.html`, `npm run build:test` et parcours navigateur bureau/mobile,
hors réseau et sauvegarde/reprise. Ne pas annoncer de résultat non observé.
La reconstruction temporaire du HTML sur la branche est retirée avant revue.
Aucune fusion automatique ; validation spécifique obligatoire.
