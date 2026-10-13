# Arène structurée — contrat de géométrie et prototype

**Statut :** proposition sur `feat/arene-structuree-4x10`, hors `main`.
**Référence :** V2.11 / `src/engine/board.js` ; `main` après PR nº 12.
**Objectif :** dalles graphiques exactement alignées sur les cellules réelles, sans géométrie factice dans le moteur.

## Règles d'affichage

- Arène 10 colonnes : **4 pistes visuelles fixes** (I–IV), dix dalles décorées identiques aux véritables cellules.
- Partie à 2 lignes : vraies lignes 0 et 1 projetées visuellement sur II et III. I et IV sont assombries, sans `.battle-cell` ni contrôle clavier.
- Partie à 3 lignes : vraies lignes 0, 1, 2 sur I, II, III. IV est inactive.
- Partie à 4 lignes : toutes les pistes sont actives.
- Anciennes sauvegardes **3 × 5** : rendu ancien intact, sans piste supplémentaire.
- `data-visual-lane` concerne exclusivement le rendu. `data-lane` pour déploiements, `battle.board` et les indices `.lane-row` restent des coordonnées du moteur.

## Alignement et style

Le **sol** est un motif pixel art CSS dessiné *dans chaque cellule* (surface, fissures, joint et relief), jamais une image libre avec `background-size:cover`. Les lignes décoratives utilisent exactement les mêmes paramètres CSS `grid-template-columns`, `gap`, `min-width` et `min-height` que les vraies lignes. La `.battle-grid` conserve son défilement horizontal ; les dalles gardent leur centrage lorsque l'écran est étroit.

Les couronnes de la grille réelle restent accessibles et les unités conservent les étiquettes de camp/Ordre/rareté de la PR nº 12. Les dalles actives ont une faible bordure au repos ; les cases disponibles ont un contour lumineux renforcé.

La vue du ciel et les sprites SVG intégrés sont conservés. **Aucun nouvel asset non approuvé** n'a été ajouté. La PR nº 11 conserve sa propre image panoramique approuvée mais actuellement en conflit ; une intégration graphique ultérieure doit placer éventuellement cette image hors du sol calibré.

## Contrôles à effectuer

- `npm test` : respect des quatre pistes, projection de 2/3/4 lignes, sauvegarde ancienne 3 × 5, maintien des identifications.
- `npm run test:parity` : aucun calcul du moteur modifié.
- `npm run build` : génération stricte de `JOUER.html` depuis les sources.
- `tests/browser_arena_v211.py` : quatre pistes visibles, centres X identiques, vrai nombre de cellules jouables, déploiement, défilement, reprise, mobile portrait/paysage, animations désactivées.
- `tests/browser_new_game_legibility_v211.py` : labels PR nº 12 et rareté.
- Essai **visuel humain** de l'alignement et de la lisibilité sur un smartphone physique avant validation graphique.

Aucune modification du moteur, du combat, de l'IA, des statistiques, des identifiants, des sauvegardes ou des ressources graphiques approuvées. Aucun merge autorisé sans validation spécifique.
