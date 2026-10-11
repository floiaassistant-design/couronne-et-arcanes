# Couronnes & Arcanes — V2.8 (compétences exclusives)

- **Version de référence après fusion de la PR #3 : V2.8** (branche principale `main`), jeu HTML solo autonome hors ligne. La base V2.7.1 et les sauvegardes historiques sont préservées.
- **Nouveautés :** 8 compétences originales, 2 par classe, 68 cartes ; apprentissage aux niveaux 3 et 6 contre 30 ou 70 éclats ; barrières, ralliement, gel, dégâts magiques, flèche perforante, pioche, soins et bénédiction.
- **Tests exécutés sur la PR #3 :** 130/130 tests JavaScript, 60/60 combats de parité, `npm run build`, vérification de `JOUER.html`, parcours Playwright Chromium bureau et téléphone simulé. Preuve : Actions #38173354595 (succès).
- **Limites :** pas de test sur smartphone réel ni d'équilibrage humain exhaustif ; les simulations ne remplacent pas les joueurs.
- **Coordination :** GitHub est la référence officielle ; une branche par session, CI + tests + revue, puis fusion autonome après succès. Le joueur teste occasionnellement, pas nécessairement à chaque version ; bloquer en cas de risque ou d'échec.
- **Prochaine étape :** mesurer les huit compétences avec des decks et combats diversifiés avant tout rééquilibrage.

# Couronnes & Arcanes — état V2.7.1 (récupération du projet)

- **Version courante : 2.7.1**, jeu solo HTML autonome hors ligne. Structure de jeu modulaire inchangée ; les nouveaux modules `scripts/lib/` servent uniquement aux simulations.
- **Nouveauté :** étude comparée des quatre compositions de deck sur 24 configurations, 16 rencontres et 32 graines ; 12 288 combats par version, avant/après.
- **Correction :** composition Arcanes limitée à trois sorts au lieu de cinq ; comparaison améliorée dans les six profils simulés. Assaut, Rempart et Équilibré inchangés.
- **Qualité :** script `npm run deck-balance`, tests de non-régression, parité 60 combats et CI GitHub Actions prête à activer après publication du dépôt.
- **Sauvegardes :** clés `couronnes_arcanes_v1` et `couronnes_arcanes_bataille_v1` conservées, aucun champ obligatoire ni reset.
- **Limites :** IA du joueur simulée, pas de statistiques humaines ; pas de preuve d'exécution Actions ni de push GitHub sans accès effectif au dépôt.
- **Suite :** mesure de performances avec des parties humaines, améliorer les stratégies du joueur automatisé et les rapports de test, puis nouvelles fonctionnalités.

Voir `docs/DECK_BALANCE_V2_7.md` et `docs/COMPOSITIONS_DECKS_V2_6.md`.

## Continuité des sessions — 11 octobre 2026

- Les huit fichiers remplacés accidentellement par V1.2 ont été conservés en archive, et la base V2.7 rétablie. Les mécanismes de Concorde étaient déjà présents en V2.7.
- Cette V2.7.1 harmonise les instructions, le numéro de version et le fichier HTML autonome, sans changer volontairement le gameplay.
- Référence de développement : dépôt GitHub, branches séparées, pull requests contrôlées ; archives sur Google Drive.
