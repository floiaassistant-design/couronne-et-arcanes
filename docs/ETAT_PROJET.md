> **13/10/2026 — branche en proposition (non fusionnée)** : `feat/arene-structuree-4x10` créée depuis `main` `0b0af7fe`, après fusion de la PR nº 12. Arène visuelle de quatre pistes pour les combats 2/3/4 × 10, avec écran de combat immersif : HUD compact, arène dominante et main de cartes en bas ; seules les vraies lignes du moteur sont interactives. Nouvelle image céleste 912×620 calibrée sur les 40 cases, sans changement des règles ni des sauvegardes. Les anciennes batailles 3 × 5 conservent leur rendu. Validation graphique humaine encore nécessaire ; la PR nº 11 reste distincte, en conflit avec `main`. Voir `docs/ARENE_STRUCTUREE.md`.

# Couronnes & Arcanes — état courant V2.11 (12 octobre 2026)

- **Version officielle : V2.11 sur `main`, commit `0b0af7feaf3aaac8882cecc44a724ee0e84e3016`**, issu de la PR nº 6 fusionnée sur autorisation explicite du joueur. Les PR nº 7, nº 8, nº 9, nº 10 (sauvegardes) et nº 12 (classes et lisibilité) sont intégrées.
- **76 cartes** ; règles et statistiques conservées depuis V2.10. Compte à rebours, actions de deux cartes par tour, IA tactique et protections de la couronne en place.
- **Arène V2.11** : 10 cases par ligne, 2 lignes en duel, 3 pour difficulté ≥3, 4 pour boss solo. Anciens combats 3×5 préservés sur reprise, sans migration destructive. Modules purs `src/engine/board.js` et `src/ui/arena-art.js`, 22 modules dans l'export autonome.
- **Graphismes** : 12 portraits partagés pour la collection, huit silhouettes SVG de combat, effets CSS accessibles ; aucune spritesheet image par image intégrée.
- **Validation vérifiée pour la PR nº 6** : GitHub Actions #38235681138 — 219 tests Node, 60 parités V2.4, build autonome synchronisé, Chromium bureau/mobile simulé, 20 480 simulations de contrôle et 6 144 combats comparatifs. Ce n'est pas un test sur smartphone physique.
- **Rythme mesuré** : 12,7 → 19,4 tours moyens entre 3×5 et les plateaux V2.11 ; attrition plus fréquente. Pas de décision d'équilibrage sans essai humain.
- **Correctifs historiques (PR nº 10 fusionnée)** : branche `fix/fiabilite-sauvegardes-v211` — clôture de bataille récupérable, validation des imports et sauvegardes, signalement d'échec du stockage, tests ciblés ; aucun changement des règles, des cartes ou des récompenses.
- Prochaines pistes indépendantes : audit du ressenti des combats, lisibilité du code UI et contrat d'animations pour le dépôt de ressources graphiques.

GitHub et le dernier `main` sont la référence. Toute évolution doit être proposée par branche et PR, sans fusion ni auto-merge sans accord spécifique de l'utilisateur. L'export `JOUER.html` est régénéré uniquement depuis les sources.
