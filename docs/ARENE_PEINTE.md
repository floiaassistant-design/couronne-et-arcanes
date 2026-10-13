# Arène céleste peinte — version fixe

Proposition sur `feat/arene-peinte-heros-statiques`, depuis la PR nº 13 à `b2ec6b7b8bf5f62376a9d3461a4086a348562715`. Main de référence : `0b0af7feaf3aaac8882cecc44a724ee0e84e3016`. Les PR nº 11 et nº 13 restent intactes ; aucune fusion autorisée.

## Ressource et décision humaine

Le joueur a préféré la **première image**, puis demandé « donc pour linstant essais de faire au mieux sans les animation est prévoit quel y seront », dans la conversation `01a1356c-8ca4-7860-be7b-838e8a806a4d` le 13 octobre 2026.

- Version `celeste-peinte-v1`, **1672 × 941 px**. Original ImageGen `exec-a77e1593-0a95-48fc-830b-1639427f7fe0.png`, SHA-256 `c7f14410e255880bf3e6a06d9b00dee93783350786509162f496ab24ed8fb754`.
- WebP qualité 88, **369 534 octets**, SHA-256 `f38d9f1756ee78f546b62e3a6215cea470ba8f1eb2545fd1a14f2be3e72fff68`. Encodage uniquement : pas de recadrage, retouche ou redimensionnement.
- Illustration originale générée pour ce jeu, sans image tierce ni copie de jeu existant. Provenance et approbation dans `assets/backgrounds/arena-celeste-peinte.json`.
- Les octets sont embarqués dans `arena-celeste-peinte.css` et dans l'export autonome. L'ancien décor 912 × 620 de la PR nº 13 est conservé intact.
- Brief de génération : arène céleste fantasy peinte, quatre pistes de dix dalles, citadelles flottantes, lumière lunaire, deux plateformes vides pour les héros et premier plan discret pour les cartes. La première version est retenue ; les retouches ultérieures ne sont pas intégrées.

## Rendu et coordonnées

La composition principale reste entière. Un prolongement flouté du même décor remplit les côtés quand le format d'écran laisse de l'espace. Le HUD reste au-dessus du ciel et la main en bas. Décor principal, cases et ancrages sont **redimensionnés ensemble**, sans fond jouable recadré indépendamment.

`src/ui/painted-arena.js` porte seulement la géométrie graphique. Les limites relevées sur l'image sont Y = 344, 421, 509, 605, 716 ; bords gauches = 355, 331, 302, 271, 238 ; bords droits = 1319, 1341, 1370, 1400, 1432. Les joints peints ne sont pas une grille mathématique parfaite : les zones polygonales rentrent légèrement dans les dalles plutôt que promettre une superposition au pixel près.

Les indices du moteur restent inchangés. Deux lignes utilisent II–III, trois I–III et quatre I–IV. Pistes dormantes assombries et non interactives ; déploiement à la souris ou au clavier. Les anciennes sauvegardes 3×5 conservent leur rendu historique et leurs effets.

Largeur minimale de scène 960 px pour la lisibilité. Sur téléphone portrait/paysage, l'arène défile horizontalement et verticalement, séparément de la main ; les deux positions sont conservées au rendu. Les cartes gardent titre, rareté, attente et statistiques.

## Préparation des personnages animés

Les silhouettes SVG actuelles restent fixes. Les portraits et mappings de `src/visuals.js` ne changent pas. Les deux plateformes sont libres : pieds du héros joueur en (149, 559), orientation droite ; adversaire en (1522, 559), orientation gauche. Aucun nouveau héros n'est inventé.

Chaque unité expose son UID, son orientation et l'état graphique `idle`. Les ancrages de pieds sont indépendants des cases. `paintedFootPoint()` convertit les coordonnées du plan selon l'échelle et le défilement. Le module d'effets connaît ces points mais n'anime pas le mode `static` actuel. Les préférences d'animation, les effets historiques et le mouvement réduit restent compatibles ; le bouton de la vue peinte concerne les animations d'interface.

Avant de produire des séquences, définir avec l'atelier : format, dimensions de chaque frame, ordre, cadence, boucles, orientation, ancrage et budget de poids. Faire approuver les ressources exactes, adapter renderer et builder, conserver le repli statique. Réutiliser les événements de combat existants, sans modifier les calculs ni sauvegarder d'événements transitoires.

## Validation

Tests locaux sur Windows, Chrome sans interface avec Playwright 1.56.0 : bureau 1366×900, portrait 390×844 et paysage 844×390. `npm test` : 251 réussites ; `npm run test:parity` : 60 scénarios identiques ; builds normal et de test.

Parcours : `browser_arena_v211.py` (2/3/4 lignes, clavier, contrôles, défilement, reprise 3×5, export sans réseau/rechargement et sources HTTP) ; `browser_combat_fullscreen_v211.py` (HUD, main, navigation et reprise) ; `browser_painted_arena.py` (clics, héros réservés, ancrages, mode fixe, défilements et statistiques) ; nouvelle partie et persistance des victoires. Les résultats complémentaires et la CI sont décrits dans la PR uniquement après vérification.

Contrôles complémentaires réussis : `browser_new_game_legibility_v211.py`, `browser_save_integrity_v211.py`, `browser_battle_control_v29.py` et `browser_class_skills_v28.py`. Anciennes compétences, effets historiques, compteurs lisibles et reprise vérifiés ; aucun échec restant dans ces parcours locaux.

Limites : pas d'essai sur téléphone physique, pas de nouvelle séquence de marche/attaque. Accord explicite et spécifique obligatoire pour chaque fusion.
