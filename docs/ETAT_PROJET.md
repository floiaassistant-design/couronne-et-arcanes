# Couronnes & Arcanes — V2.9

- **Version : 2.9.0**, branche `feat/v2.9-battle-control`, intégration dans `main` après contrôles verts de la PR. Base distante de départ : V2.8, commit `5c362b7610526275aa7276e89c78a4825bac1409`.
- **Livrable :** 74 cartes ; silence borné avec répit, téléportation latérale et pièges publics ; six nouvelles cartes obtenables en Alchimie et paquets. Les huit compétences exclusives V2.8 et les 68 cartes précédentes sont intactes.
- **Architecture :** nouveau module pur `src/engine/battle-control.js`, partagé par moteur/IA/aperçus ; dégâts, armures, barrières et statistiques réutilisent le moteur. 19 modules dans l'export, 12 portraits partagés.
- **Sauvegardes :** clés `couronnes_arcanes_v1` et `couronnes_arcanes_bataille_v1` conservées ; aucun champ nouveau obligatoire, aucune réinitialisation. Propriétaire/expiration des pièges et états des unités persistants.
- **Contrôles locaux exécutés :** 165/165 tests Node, 60/60 parités historiques, build synchronisé ; Chromium V2.8/V2.9 bureau/mobile simulé, export autonome hors ligne, stockage réel/rechargement et parcours de fin de combat. Débordement de la main mobile corrigé.
- **Simulations :** 20 480 scénarios comparatifs, rejoués à l'identique ; quatre classes × quatre compositions × deux niveaux × cinq variantes × huit adversaires × seize graines. Zéro état invalide, aucun combat inachevé, maximum observé 32 tours. Rapport : `BATTLE_CONTROL_V2_9.md`, données : `BATTLE_CONTROL_BENCHMARK_V2_9.json`.
- **CI :** workflow étendu aux parcours V2.9 et aux simulations ; consulter les résultats de la PR et vérifier les SHA distants avant de fusionner. Aucun succès distant présumé.
- **Limites :** bots heuristiques, pas de test physique ni d'équilibrage humain ; rencontres historiques inchangées, IA avec les nouvelles cartes vérifiée en laboratoire ; illustrations partagées et absence de réseau.
- **Proposition V3.0 :** donjon original en trois salles avec des boss utilisant progressivement les trois contrôles ; mesurer sa difficulté avec les anciennes et nouvelles compositions avant intégration.

GitHub reste la source de vérité. Toujours reprendre le dernier `main`, préserver les décisions techniques et utiliser une PR contrôlée. La fusion est autorisée sans test manuel du joueur si les portes obligatoires passent.
