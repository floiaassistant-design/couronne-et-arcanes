# Couronnes & Arcanes — état V2.7

- **Version courante : 2.7.0**, jeu solo HTML autonome hors ligne. Structure de jeu modulaire inchangée ; les nouveaux modules `scripts/lib/` servent uniquement aux simulations.
- **Nouveauté :** étude comparée des quatre compositions de deck sur 24 configurations, 16 rencontres et 32 graines ; 12 288 combats par version, avant/après.
- **Correction :** composition Arcanes limitée à trois sorts au lieu de cinq ; comparaison améliorée dans les six profils simulés. Assaut, Rempart et Équilibré inchangés.
- **Qualité :** script `npm run deck-balance`, tests de non-régression, parité 60 combats et CI GitHub Actions prête à activer après publication du dépôt.
- **Sauvegardes :** clés `couronnes_arcanes_v1` et `couronnes_arcanes_bataille_v1` conservées, aucun champ obligatoire ni reset.
- **Limites :** IA du joueur simulée, pas de statistiques humaines ; pas de preuve d'exécution Actions ni de push GitHub sans accès effectif au dépôt.
- **Suite :** mesure de performances avec des parties humaines, améliorer les stratégies du joueur automatisé et les rapports de test, puis nouvelles fonctionnalités.

Voir `docs/DECK_BALANCE_V2_7.md` et `docs/COMPOSITIONS_DECKS_V2_6.md`.
