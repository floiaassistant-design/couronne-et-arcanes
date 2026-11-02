# Impact de zone — contrat de ciblage (proposition du 2 novembre 2026)

## Décision validée et périmètre

Source de conception : décision « Impact de zone » du 24 octobre 2026 dans les archives Notion, à distinguer du comportement jouable antérieur. Le tableau maître des 53 cartes est inchangé.
Cette branche corrige **uniquement le ciblage natif de l'Impact de zone** pour les deux camps, le laboratoire et la campagne, dans le moteur partagé ; pas de nouvelle rareté, de modification de dégâts, d'économie ni de progression.

- La frappe principale conserve son ciblage normal : premier ennemi devant l'attaquant sur sa ligne.
- Après cette frappe, l'Impact peut infliger ses dégâts secondaires bruts à l'ennemi **sur la case immédiatement derrière la cible principale, dans le sens de l'attaque**. Si elle est vide, occupée par un allié de l'attaquant ou par une unité déjà morte, pas de dégâts secondaires. On ne saute pas de case, on ne change pas de ligne et on ne touche jamais une couronne.
- Les dégâts secondaires respectent les protections normales (Armure, barrière, réductions, PV réellement retirés). Chaque dommage est enregistré par l'événement de dégâts du moteur ; aucune seconde attaque normale ni chaîne de ripostes ou d'effets d'attaque.
- Pour l'Archiliche Éveillée déjà intégrée, les **deux** cibles secondaires approuvées forment une chaîne contiguë derrière la cible principale : les cases +1 et +2 doivent toutes deux être occupées par des ennemis vivants. Une absence ou un allié bloque la suite ; elle ne sélectionne jamais deux ennemis dispersés.
- Garde : une interception n'autorise pas à frapper derrière l'attaquant, sur une ligne différente ou hors grille. Les préconditions antérieures de l'Impact sur une interception et les pouvoirs d'un rang particulier restent inchangés.
- Le comportement est identique pour le camp joueur et le camp IA, sur les grilles historiques 3×5 et les grilles actuelles 2–4×10.

## Responsabilités et tests

Sélection géométrique pure : `src/engine/unit-targets.js`, fonction `contiguousSplashTargets`, réutilise les dimensions de `board.js`. Résolution des dégâts, intentions et conditions de Garde : `src/engine/battle.js` avec `hit()` du moteur existant. Paramètres natifs et textes : `src/cards/abilities.js` et `ability-text.js`.

Tests : `tests/splash_targeting.test.mjs` (attaquant joueur et IA, barrière, Armure, absence de case contiguë, arrière, autre ligne, bord du plateau, chaîne de l'Archiliche, anciennes géométries), plus tests existants d'Ombre et de sauvegarde. À lancer pour l'arbre exact : `npm test`, `npm run test:parity`, `npm run build`, `npm run build:test` et groupes navigateur CI. Le snapshot de parité actuel doit être comparé au nouveau ciblage : sa mise à jour est un changement volontaire de règles, pas un affaiblissement des contrôles. L'archive historique V2.4 ne doit jamais être remplacée.

## Livraison et limites

Cette branche/PR est **proposée, non fusionnée, non publiée** avant accord spécifique. `JOUER.html` doit être régénéré depuis les sources (jamais retouché à la main), puis contrôlé identique à la distribution web. Les évolutions Forge/Éther validées restent hors du code. La correction ne prouve pas l'équilibrage humain ; les tests visuels et navigateur restent distincts des tests unitaires.
