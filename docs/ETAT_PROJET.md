> **Proposition en cours au 13/10/2026 (non intégrée)** : branche `feat/nouvelle-partie-lisibilite-cartes` créée depuis `main` `58a028c5` (PR nº 10 déjà fusionnée). Nouvelle partie par choix de classe, emplacement de sauvegarde précédent récupérable, étiquettes camp/Ordre/rareté sur les unités et cadres renforcés sur les cartes. Les règles, l'IA, les statistiques et les identifiants sont inchangés. Attention : la PR nº 11 d'arène céleste est ouverte, avec modifications de `styles.css` et `JOUER.html` ; il faudra réconcilier les styles et régénérer l'export depuis les sources réunies après validation éventuelle. Aucun de ces travaux ne constitue une autorisation de fusion.

# Couronnes & Arcanes — état courant V2.11 (12 octobre 2026)

- **Version officielle : V2.11 sur `main`, commit `51c4d7ab3139a78296059a734f3baea693959e74`**, issu de la PR nº 6 fusionnée sur autorisation explicite du joueur. PR nº 7 (validation manuelle), nº 8 (interface) et nº 9 (IA) sont intégrées.
- **76 cartes** ; règles et statistiques conservées depuis V2.10. Compte à rebours, actions de deux cartes par tour, IA tactique et protections de la couronne en place.
- **Arène V2.11** : 10 cases par ligne, 2 lignes en duel, 3 pour difficulté ≥3, 4 pour boss solo. Anciens combats 3×5 préservés sur reprise, sans migration destructive. Modules purs `src/engine/board.js` et `src/ui/arena-art.js`, 22 modules dans l'export autonome.
- **Graphismes** : 12 portraits partagés pour la collection, huit silhouettes SVG de combat, effets CSS accessibles ; aucune spritesheet image par image intégrée.
- **Validation vérifiée pour la PR nº 6** : GitHub Actions #38235681138 — 219 tests Node, 60 parités V2.4, build autonome synchronisé, Chromium bureau/mobile simulé, 20 480 simulations de contrôle et 6 144 combats comparatifs. Ce n'est pas un test sur smartphone physique.
- **Rythme mesuré** : 12,7 → 19,4 tours moyens entre 3×5 et les plateaux V2.11 ; attrition plus fréquente. Pas de décision d'équilibrage sans essai humain.
- **Correctifs proposés (non fusionnés)** : branche `fix/fiabilite-sauvegardes-v211` — clôture de bataille récupérable, validation des imports et sauvegardes, signalement d'échec du stockage, tests ciblés ; aucun changement des règles, des cartes ou des récompenses.
- Prochaines pistes indépendantes : audit du ressenti des combats, lisibilité du code UI et contrat d'animations pour le dépôt de ressources graphiques.

GitHub et le dernier `main` sont la référence. Toute évolution doit être proposée par branche et PR, sans fusion ni auto-merge sans accord spécifique de l'utilisateur. L'export `JOUER.html` est régénéré uniquement depuis les sources.
