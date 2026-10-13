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

## Affichage immersif V2.11 proposé

La zone de combat utilise une vue plein écran `.combat-screen`, un HUD supérieur compact, une arène défilante dominante et un dock de cartes fixé **dans la zone basse du viewport**. Le dock contient les mêmes cartes (avec rareté, état d'attente et statistiques) et les mêmes boutons d'action ; les informations adverses restent accessibles dans le panneau d'actions, qui défile séparément. Un bouton `Citadelle` conserve l'accès à la navigation sans abandonner le combat.

La géométrie 4 × 10 des pistes est préservée, les 2/3/4 vraies lignes restent dans le moteur et les combats historiques 3 × 5 ne sont pas modifiés. Les défilements horizontaux de l'arène et de la main, ainsi que le défilement vertical du panneau, survivent au `render()`. Le dock se compacte en paysage mobile ; aucun élément interactif n'est masqué par une ligne décorative inactive.

Les illustrations calibrées définitives ne font pas partie de cette modification : étape graphique séparée dans la PR nº 13, sans délégation au dépôt d'art.

## Illustration céleste approuvée — calibrage 4 × 10

La maquette créée dans la conversation le 13 octobre 2026 et approuvée par l'utilisateur est utilisée ici. **Il ne s'agit pas du fond panoramique de la PR nº 11.** Art original `arene_celeste_maquette_exacte_912x620.png` (912 × 620) ; version WebP qualité 65, 83 264 octets, SHA-256 `82de78e896549005772fc1f22ee1fa7d3996eb476939799ce516c20db7f6284f`. Aucun tiers ni droits externes. La ressource approuvée est stockée dans `assets/backgrounds/arena-celeste-calibree.css` sous forme d'URI WebP base64 : cela évite toute dépendance réseau et permet la version web modulaire et l'export `JOUER.html` autonome.

**Repères exacts en pixels** : largeur de plan 912 ; scène haute 118 ; quatre rangées de 116 séparées par 6 pixels ; premières coordonnées X = 76 px, puis dix cellules de 75,2 px séparées de 4 px. Pistes I à IV commencent aux Y = 124, 246, 368 et 490 px. Aucune image n'est agrandie par `cover` : les cellules HTML restent en superposition sur le décor statique à taille native. Les pistes inactives sont masquées par une voile sombre semi-transparente mais restent non interactives.

Sur les grands écrans, le plan fixe de 912 px est centré dans la scène plein écran ; sur mobile, il défile horizontalement sans changer l'échelle ni les hitboxes. Les anciennes batailles 3 × 5 n'utilisent pas ce décor et conservent leurs géométries et sauvegardes existantes. Le ciel animé ancien est neutralisé uniquement sur le plateau calibré ; le réglage de mouvement réduit et l'arrêt des animations restent respectés.

**Tests** : un contrôle géométrique navigateur mesure les décalages entre les centres des cases et les positions de l'image, pour 2/3/4 lignes et bureau/mobile. Le test source valide l'empreinte du WebP décodé. La génération hors ligne inclut la feuille de style du décor à partir des sources (jamais par modification directe du fichier `JOUER.html`).
