# Légions de la Forge — proposition du 21 octobre 2026

## Source et autorisation

Branche `feat/forge-cartes-20261021`, depuis le main vérifié
`ee8a2482841b722e5fb7e761a1df0c712ac75243`, après la fusion autorisée Ombre
nº 28. Nouvelle PR distincte ; aucune fusion ni auto-merge.

Source : PR atelier nº 25 ouverte, commit immuable
`ceb0a916959925ad6a41057d11210a3ae84341e5`. Dix exports WebP 768×1152 :
Marteau des Monts, Golem runique, Sapeur gobelin, Foreur de fer, Colosse de
braise, Ingénieure d’acier, Canon des Terres Rouges, Mécaniste des Hauts-Fours,
Marchefer et Alchimiste des Braises. Catalogue et textes concordants avec main.

Le Marteau était validé artistiquement ; les neuf autres images restent review
dans ce snapshot atelier. La demande « tu peuxintégré la classe suivante »
autorise leur import manuel dans une PR du jeu. Le reçu
`approvals/forge-dix-cartes-v01.json` conserve les dix IDs, clés, versions et
SHA-256 exacts, sans modifier les validations artistiques ni fusionner l’atelier.

SHA Git, SHA-256, dimensions et octets des dix exports vérifiés. PNG, prompts,
provenance et droits conservés dans l’atelier. Aucun recadrage ni retouche.
L’affût du Canon reste proche du bord droit comme dans l’export de référence.

## Rendu et architecture

42 cadres complets : Aube 10, Sylve 11, Ombre 11, Forge 10. Mapping explicite
par ID dans `visuals.js`, registre `kind: card` et index concordants.
Le même rendu pur sert à la Collection, la main, aux fiches et au plateau ;
`arenaSprite` conserve aussi l’image entière dans la présentation classique.

La galerie Forge officielle place ses cinq zones aux mêmes coordonnées que
Sylve/Ombre : attente `[6,4.4,17.3,12.7]`, nom `[12,68.7,76,6.2]`, descriptif
`[23,78.5,54,13.4]`, attaque `[6.1,85.1,16.1,10.4]`, vie
`[80.7,85.1,16.1,10.4]`, en pourcentages. Table existante partagée sans nouveau
module ni association d’image par faction. Les tailles de titres et nombres
des cadres ornés sont étendues au sélecteur Forge. Les 32 images antérieures
et leurs styles restent inchangés.

Les nombres viennent du profil ou du combat. Blessures, attente restante et
valeurs maximum conservent leurs calculs ; deux sceaux de camp en coin,
aucune barre sous la carte. Les cinq rangs futurs restent « À concevoir »
avec tirets et sans exemplaires gratuits. Éther conserve son repli SVG neutre.
Moteur, IA, catalogue, progression, stockage et référence de parité inchangés.
Toujours 28 modules ; aucun import circulaire ni nouveau calcul d’interface.

## Vérifications exécutées

- `npm test` : 285 tests réussis. `npm run test:parity` : 60 scénarios identiques.
- Quatre builds réussis : jeu, cartes, jeu test, cartes test. 42 exports exacts
  embarqués ; `JOUER.html` 20 277 848 octets, `ESSAI_CARTES.html` 20 277 872.
- `browser_forge.py` : bureau 1440×1000, portrait 390×844, paysage 844×390.
  Dix images vérifiées par SHA-256, 60 projections de collection, fiches,
  champs sans débordement, vraie pose, HP blessés des deux camps, sceaux,
  stockage/reprise hors réseau et mouvement réduit.
- Aube, Sylve, Ombre, Collection, Milicien, aperçus, étude des cartes,
  déploiement et repli neutre : parcours navigateur réussis sur les trois formats.
- Arène, sauvegarde réelle, plateau peint, plein écran, capacités et pilote
  illustré : parcours réussis, y compris anciens combats 3×5 et export hors réseau.
- Compétences de classe V2.8, contrôles V2.9 et nouvelle aventure : parcours
  bureau/mobile réussis. Simulations `control-balance` et `arena-balance` réussies.
- Aperçu public distinct vérifié hors réseau bureau/mobile : quatre factions,
  dix Forge exactes, lecture sans mutation du profil ni variables de test exposées.
  Même vérification des dix images Forge sur l’entrée modulaire HTTP réussie.
- Examen des dix exports et des six captures bureau/portrait/paysage : cadre
  intact, cartouches et sceaux visibles. `git diff --check` réussi.

Les résultats distants restent à lire sur le commit exact de la PR ; les
contrôles locaux ne valent pas une CI terminée. Aucun téléphone physique ni
équilibrage humain exhaustif revendiqué. Le fichier autonome augmente de
4,56 Mo environ ; l’atelier et les futures raretés restent des travaux séparés.
