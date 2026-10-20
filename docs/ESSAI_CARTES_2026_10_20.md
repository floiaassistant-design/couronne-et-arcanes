# Combat de cartes — essai indépendant du 20 octobre 2026

Demande : essayer de grandes cartes illustrées et des effets selon leurs attaques. Le dernier main vérifié est `0310fa677947e34a02bd877f5adc6104267f87ba` ; les notes antérieures mentionnant encore la PR nº 16 en attente sont historiques.

## Périmètre

Ouvrir `ESSAI_CARTES.html` sans installation ni réseau, ou servir `experiments/card-duel/index.html` depuis la racine du dépôt. Six cartes préplacées sur trois lignes, trois formations d'essai, lecture automatique/pause, tour suivant, inspection et reprise automatique. Les cartes représentent les unités ; aucune silhouette ni sprite de personnage. Les cases courantes sont indiquées sur chaque carte ; cette vue transposée ne permet pas de poser ou déplacer manuellement des cartes. Ce n'est pas le remplacement de l'arène officielle ou une nouvelle campagne.

Le moteur actuel résout réellement mouvements, attaques simultanées, ripostes, armure, soins et victoire à la couronne. Une lecture séquentielle rend les événements compréhensibles ; son ordre visuel ne change pas l'ordre des calculs. `studySteps` construit un état de présentation à partir d'une copie ; il est limité aux six unités sans sorts de cette fixture. Les PV affichés sont comparés au résultat du moteur sur les trois formations jusqu'à leur terme. Aucune modification des règles, de l'IA, des récompenses ou des cartes officielles.

## Portraits et coordination

Les cinq portraits proviennent de la PR art nº 10, commit `a6dd52096ada21d5eaf07234c632ada05cf710df` : Milicien v2, Porte-étendard v2, Porte-égide v1, Sœur de l'Aurore v1, Paladin solaire v1. Fichiers inchangés, droits originaux et validations humaines recopiées dans `experiments/card-duel/portraits.json` et `approvals/`. Le portrait Arbalétrière provient du main jeu, SHA-256 `31186adc9ea55c4d34777f70f8b5fe2969a1ea0386a74d1cf44183e931c391a3`.

Le mapping est propre à cet essai dans `src/experiments/card-study-view.js`. Aucune nouvelle clé n'est ajoutée au mapping de production `src/visuals.js` ; aucun archétype partagé n'est remplacé. L'intégration des cinq portraits au jeu complet reste dans la PR nº 17. Les PR nº 18/19 d'animations et d'interface et la nº 11 d'ancienne arène restent indépendantes et non fusionnées. Le dépôt art n'est pas modifié.

## Architecture et export

- `card-study-model.js` : fixture explicite, appels au moteur, lecture des événements et validation de reprise.
- `card-study-view.js` : cartes de l'essai et correspondance dédiée des portraits.
- `card-study-fx.js` : effets de frappe, carreau, impact, soin et défaite ; aucune animation raster à produire ou contrat de sprites à modifier.
- `card-study.js` : contrôleur, annulation, préférences de mouvement réduit et sauvegarde dédiée.
- `experiments/card-duel/` : HTML/CSS sources, reçus et portraits de l'atelier.
- Le générateur existant accepte `--cards` (`npm run build:cards`) et embarque le même graphe de modules. L'export normal `npm run build` reste reproductible.

Clé isolée `couronnes_arcanes_essai_cartes_v1`. Les clés officielles ne sont ni lues ni écrites. Le résultat autoritaire est sauvegardé avant sa lecture animée : recharger pendant une attaque reprend le tour résolu. Aucun VFX ou minuteur sérialisé. Pause, désactivation, mouvement réduit et changement de taille interrompent les effets et affichent l'état final.

## Vérification

Localement : 264 tests Node, 60 scénarios de parité, exports jeu/essai construits. Les six tests ajoutés contrôlent les trois formations jusqu'à victoire/défaite, les PV après armure et soins, la sauvegarde isolée et les cinq reçus/empreintes. Le parcours Chromium ajouté couvre bureau 1366×900, portrait 390×844, 320×740 et paysage 844×390 : décodage des portraits, tir/frappe/soin, PV, reprise, interruption, mouvement réduit et export production sans réseau.

Les résultats navigateur seront consignés après exécution de la CI. Aucun navigateur Chromium local ni téléphone physique n'est disponible dans cette session. Les durées et les effets sont des choix de revue esthétique, pas une validation du plaisir de jeu ou d'un nouvel équilibrage. Une branche/PR dédiée ; aucune fusion autorisée.
