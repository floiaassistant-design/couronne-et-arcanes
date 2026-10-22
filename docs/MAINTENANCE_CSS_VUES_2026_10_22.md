# Maintenance CSS et vues — 22 octobre 2026

Travail complémentaire au contre-audit de la PR nº 31. Main vérifié : `dd2aa52`.
La branche part de la PR nº 31 corrigée ; cette proposition ne vaut pas accord de fusion.

## CSS : périmètre et preuve

Les huit feuilles sont examinées : base `styles.css`, arène cartes, aperçu,
collection, carte générée, disposition peinte et deux fonds embarqués. Inventaire
par contexte (y compris media queries) : 625 règles de style dans styles.css,
23 sélecteurs exacts redéfinis dans un même contexte ; une autre répétition
conditionnelle dans arena-peinte-layout.css. Une répétition n'est pas forcément inutile.
Les grandes feuilles des deux fonds portent leurs images embarquées, nécessaires
au hors réseau ; elles restent identiques, comme les cinq feuilles spécialisées de rendu.

22 déclarations réellement dominées sont retirées de styles.css, sans déplacer
leurs remplaçantes ni regrouper des media queries. Elles concernent : affichage
ancien de rareté compacte, position de cellule, alignement et espacements d'unité,
espacement de main mobile, ombre de sélection, ancrage et étiquettes classiques,
repères de formation/silence, rangées dormantes et ancien format de fiche.
Le même sélecteur et le même contexte réécrivent chaque propriété plus loin.
Les shorthands, valeurs fonctionnelles, variables, différences d'importance et
replis de syntaxe douteux ne sont pas supprimés par ce nettoyage.

La base est reformattée en blocs lisibles. L'ordre de la cascade est conservé,
y compris les adaptations bureau, portrait, faible hauteur et mouvement réduit.
Les valeurs des variables CSS restent identiques à l'octet. Aucun découpage
supplémentaire n'est introduit : déplacer ces strates entre fichiers changerait
la priorité relative avec les feuilles spécialisées. La longueur du fichier est
une exception justifiée par cette première consolidation conservatrice.

## Responsabilités JavaScript

- `ui/markup.js` possède l'échappement HTML pur partagé par l'orchestrateur,
  les composants et les cartes du plateau. Il ne dépend ni du DOM ni du moteur.
  L'apostrophe utilise désormais la même entité HTML dans ces trois consommateurs.
- `pages.js` compose la Collection depuis ses sous-rendus de compétences et de
  compositions ; les actions et propositions de deck restent dans leurs modules.
- `battle-view.js` distingue case, contenu d'unité, HUD et panneau d'actions.
  Le module du plateau reste unique ; aucun calcul de combat n'est déplacé.
- `views.js`, `pages.js` et `battle-view.js` ne capturent que les champs d'état
  qu'ils lisent. Chaque rendu relit l'état courant ; il n'écrit ni profil ni combat.
- Les trois vues sont reformattées sans réécrire les chaînes de contenu.
  29 modules empaquetés automatiquement, contre 28 ; aucun paquet npm ajouté.

L'analyse de portée de tous les imports sous src/ ne trouve plus de liaison
inutilisée. Les trois adaptateurs de lecture d'état restent locaux : ils servent
des fermetures différentes ; les fusionner créerait davantage de couplage.
Les fonctions de règles partagées (statistiques, formation, géométrie, contrôles,
propositions de deck) restent réutilisées depuis leurs propriétaires existants.
Moteur, IA, catalogue, actifs et stockage ne sont pas modifiés.

## Vérification reproductible

- `npm test` : 295 tests réussis ; trois nouveaux cas vérifient l'échappement,
  le remplacement d'état sans mutation et la reprise de géométrie historique.
- `npm run test:parity` : 60 scénarios identiques à la référence historique.
- Les quatre builds : jeu, cartes, et leurs variantes réservées aux tests.
- 19 suites navigateur actuelles du projet : toutes réussies localement
  (cartes, déploiement, aperçu, remise à zéro, collection, quatre factions,
  compétences, nouvelle partie, contrôles, pilote, capacités, arène, plein écran,
  scène peinte, intégrité des sauvegardes).
- `python3 tests/browser_maintenance.py` : vrai jeu web modulaire servi en HTTP,
  huit écrans, pose, reprise, images, animations désactivées et mouvement réduit,
  bureau 1366×900, portrait 390×844, paysage 844×390.
- `python3 tests/browser_maintenance.py --reference CHEMIN` compare les deux
  checkouts après leurs builds : DOM, tous styles calculés (pseudo-éléments
  compris), rectangles et pixels, dans des contextes hors réseau. La référence
  utilisée pour le contre-audit est f6249f7, avant ce travail CSS ; les changements
  ultérieurs de la PR nº 31 ne modifient pas son rendu.

Deux assertions historiques sont adaptées aux espaces de formatage, sans changer
le comportement attendu. Aucun résultat historique ni référence de parité n'est modifié.
Les builds sont toujours générés depuis les sources ; les HTML de test ne sont pas distribués.

## Limites

Les parcours Chromium simulent les formats mobiles : pas de téléphone physique,
Safari ni Firefox testés. Les contrôles de sauvegarde couvrent les anciennes
batailles 3×5, phases conservées et interruption de récompense ; ils ne peuvent
représenter toutes les sauvegardes privées possibles. La parité de 60 scénarios
est historique ; elle ne constitue pas une validation humaine de l'équilibrage
actuel des tours alternés. Vérifier séparément la CI sur le head exact de chaque PR.
Aucune fusion, aucun auto-merge, aucune modification volontaire du jeu.
