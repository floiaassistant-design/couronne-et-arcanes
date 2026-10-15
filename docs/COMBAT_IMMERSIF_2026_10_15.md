# Proposition de combat immersif — 15 octobre 2026

## Source et périmètre

Main vérifié au départ : `0310fa677947e34a02bd877f5adc6104267f87ba`. La branche `feat/arene-immersive-effets` reprend la PR nº 18 au commit exact `3a6f928a25caf45604965bcddf1e6181d31c31ad` sans la fusionner. La PR nº 17 des cinq portraits reste distincte ; la CI en reprend les sources exactes `2e7391669843a96a848104c88e0164234b612453` dans une copie de contrôle. La PR nº 11 n’est pas utilisée.

Le propriétaire demande un essai plus soigné, avec une arène occupant l’écran, une interface compacte, une Arbalétrière moins grande et l’effet du carreau montré dans l’atelier. Cette proposition conserve les personnages actuels ; elle ne réalise pas encore une conversion générale vers des cartes posées sur le plateau.

## Composition

- Le décor couvre toute la scène ; la grille remplit la largeur disponible. Le format peint, les quatre pistes projetées et les cases actives restent identiques.
- La main flotte en bas : 188 px sur bureau, 185 px en portrait et 130 px en paysage court, avec un espace supplémentaire pour lire une fiche. Le plateau interactif s’arrête au-dessus et reste défilable dans les deux directions.
- HUD dans les coins, tour central et trois commandes conservées. Le journal, le profil adverse et les explications de pouvoir sont regroupés dans un volet `<details>` accessible au clavier, au-dessus de la main. Son état n’est pas sauvegardé.
- La fiche conserve son texte de 14 px, sa fermeture et la séparation entre inspection, sélection et pose.
- Les cartes de la main montrent leur illustration sur toute leur surface, avec titre, statistiques, rareté et petit compteur d'attente. Le portrait du pilote conserve son identité. L'ouverture d'une fiche garde les coordonnées des cartes, y compris lors d'un toucher mobile.

## Taille et effet du carreau

La taille peinte passe de 176 à 140 px (réduction d’environ 20,5 %) dans le plan de référence 1672×941. Les cadres des atlas restent 512×512, le point d’ancrage (256,461) et le miroir adverse sont conservés ; l’ancien plateau reste à 96 px. Aucune texture n’est redessinée ou recompressée.

L’effet reprend la fonction `spark` de `review/animation_hybride_essai_v2.js` dans l’atelier au commit `d193b762c662fbaad4bb32db6e5d9d83b1938a7b` : neuf rayons `#f3dc99`, cercle `#b9daee`, expansion et disparition sur 380 ms. La proposition de cette scène est demandée dans la présente conversation ; cela ne requalifie pas tout le registre art en approuvé. Le rendu SVG reste transitoire, calé sur l’arrivée à 600+440 ms après le début du tir. Le plan conserve la couche jusqu’à sa fin. Navigation, nouveau rendu, désactivation et mouvement réduit la suppriment avec le lecteur existant.

## Validation et limites

Local : 264 tests Node, 60 scénarios de parité, builds normal/test. Un parcours Chromium réel en bureau 1366×900, portrait 390×844 et paysage 844×390 vérifie la surface du plateau, le journal, la fiche, un vrai tir et ses neuf rayons/cercle, puis l’interruption par désactivation. Les captures locales ont servi à corriger l’ancrage du volet. Les suites Python complètes et l’aperçu avec les cinq portraits sont exécutés par la CI de la PR ; vérifier son résultat sur sa tête exacte.

L’export est régénéré, avec le nouveau CSS embarqué. Aucun fichier d’image, calcul de combat, statistique, IA, collection, progression ou schéma de sauvegarde ne change. Les effets restent cosmétiques et aucun état visuel n’est stocké.

Sur téléphone, la scène garde son minimum de 960 px et se parcourt horizontalement ; aucun smartphone physique testé. Seule l’Arbalétrière possède ses séquences peintes ; les autres unités gardent leurs SVG fixes. La restauration générale des autres effets dans l’arène peinte et le mode de cartes sur le plateau restent des évolutions distinctes. Les limites des poses approuvées subsistent.

Cette proposition et ses dépendances attendent chacune une autorisation explicite et spécifique avant fusion. Aucun auto-merge.
