# Vue cartes sur le plateau — PR nº 20 corrigée

**Périmètre final demandé :** réutiliser le jeu existant avec son plateau et remplacer la présentation des personnages par des cartes à la bonne taille. Le premier essai à trois duels indépendants a été refusé et retiré de cette branche. Main de référence vérifié : `0310fa677947e34a02bd877f5adc6104267f87ba`.

## Jeu et plateau conservés

`ESSAI_CARTES.html` utilise exactement le même `src/app.js`, le même moteur, les mêmes écrans, missions, decks et modes que `JOUER.html`. Pas de cartes préplacées, de formation d'essai, de scénario alternatif ni de nouvelle règle. La main, l'attente réelle, la limite de deux cartes, la pose par ligne, les mouvements, les portées, la Concorde, les sorts, l'IA, les couronnes et la progression restent ceux du jeu.

L'arène peinte et ses coordonnées restent identiques : 10 cases, 2/3/4 lignes selon la rencontre ; reprise 3×5 inchangée. `boardCard` remplace le contenu graphique de la véritable unité sur sa case. Les portraits ne sont pas retournés pour le camp adverse. Les cartes de 56×82 px en coordonnées de l'image gardent une marge entre les ancrages des lignes ; le zoom minimal de revue passe de 960 à 1280 px pour rendre les cartes plus visibles. Le plateau garde ses défilements. Les statistiques affichent les vraies valeurs, bonus de formation/ralliement et PV courants inclus.

Le bouton « Vue : cartes/personnages » change uniquement l'affichage du même combat et conserve une préférence graphique séparée. Le jeu normal garde son rendu initial par défaut ; l'aperçu démarre directement en vue cartes. Les cinq portraits approuvés sont également utilisés dans la main/collection lorsque la vue cartes est active.

## Portraits

Dépôt art `floiaassistant-design/couronne-et-arcanes-art`, PR nº 10, commit `a6dd52096ada21d5eaf07234c632ada05cf710df` : Milicien v2, Porte-étendard v2, Porte-égide v1, Sœur de l'Aurore v1, Paladin solaire v1. Arbalétrière déjà sur main : SHA-256 `31186adc9ea55c4d34777f70f8b5fe2969a1ea0386a74d1cf44183e931c391a3`. Images inchangées, droits originaux, dimensions, versions, reçus et empreintes dans `CARD_ARENA_ASSETS.json` et `art-approvals/`.

Les clés dédiées sont explicitement déclarées dans `src/visuals.js` via `CARD_ARENA_ART`, activées par l'option `visualFor(card,{cards:true})`. Le mapping normal et les archétypes partagés ne sont pas remplacés : `skill_ranger_pierce` conserve `archer.webp`. Cette branche chevauche la PR nº 17 sur les cinq assets : ne pas importer deux fois, réconcilier le mapping lors d'une intégration future. Les PR nº 18/19 d'animations restent distinctes, non fusionnées ; aucune modification du dépôt art.

## Architecture et export

Un module ajouté : `src/ui/card-arena.js`, vue HTML et choix de présentation uniquement. `battle-view.js` réutilise les cellules et le plateau actuels ; `views.js` applique le mapping opt-in aux cartes consultées. `painted-arena.js` garde ses projections et adapte seulement le zoom de cette vue. `combat-fx.js` réutilise les événements existants, ancre les effets au centre des cartes et copie une carte pour son déplacement. Les dégâts bruts des événements ne sont pas présentés comme des PV perdus dans cette vue ; les cartes affichent les PV autoritaires calculés par le moteur.

Le générateur existant embarque 26 modules et 18 portraits. `npm run build` régénère JOUER.html ; `npm run build:cards` régénère ESSAI_CARTES.html à partir du même HTML et du même app.js, avec la vue cartes activée. Sur le serveur de développement : `index.html?cartes=1`.

Aucune modification dans les modules du moteur, des données ou de l'IA. Clés et schéma des profils/combats conservés. Les VFX restent transitoires ; animations désactivées, mouvement réduit ou API d'animation absente donnent des cartes statiques.

## Vérification

Local : 262 tests Node, 60 parités historiques, builds normal/essai/test. Tests nouveaux : mapping opt-in et archétypes partagés, rendu des vrais PV sans mutation, export du vrai jeu sans fixture et vérification des cinq approbations/empreintes.

Le nouveau parcours Chromium contrôle sur bureau/portrait/paysage : vraie mission initiale, main et délais, sélection et pose sur la grille, avancée du même identifiant d'unité, couronnes, sauvegarde/reprise, défilement, changement de vue sans mutation du combat, animations désactivées, mouvement réduit et production hors réseau. Un parcours de diagnostic termine la vraie mission 01 avec les actions autorisées et vérifie une récompense unique. Captures dans l'artefact CI `essai-cartes` ; vérifier le résultat de la nouvelle tête. Les preuves de l'ancien prototype ne valident pas cette correction. Aucun téléphone physique ou navigateur Chromium local revendiqué.

Une PR intégrable dans le dépôt du jeu ; accord explicite spécifique requis avant fusion.
