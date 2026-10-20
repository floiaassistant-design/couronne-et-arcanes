# Couronnes & Arcanes — base graphique neuve

Jeu de cartes tactiques solo, web et hors ligne : 76 cartes, quatre classes,
12 missions, 20 étages de Tour et trois donjons. Collection, progression, IA,
statistiques et sauvegardes sont conservées.

## État intégré

Le propriétaire a demandé le 20 octobre 2026 de refaire les illustrations et
animations en conservant le plateau et la présentation des cartes.
[Décision et périmètre](docs/REMISE_A_ZERO_GRAPHIQUE_2026_10_20.md).

Les PR jeu nº 20 puis nº 22 ont été fusionnées sur accord explicite ; le jalon
fonctionnel est `50b32e4ad5c41da8c99f190d4ca300ce9fec988a`. La remise à zéro de
l'atelier est intégrée par sa PR nº 18 à `e5986465`. Vérifier le dernier main
GitHub avant toute nouvelle mission.

GitHub est l'unique source officielle du code, des documents et de la nouvelle
production graphique. Les anciennes archives externes ne sont ni une source
de reprise ni une destination de synchronisation.

Les anciennes illustrations de personnages, silhouettes pixel et animations
de combat sont retirées. Les cartes affichent des emplacements neutres avec
leurs noms et vraies valeurs. Le décor peint, la main, les cadres, les aperçus
au survol et les interactions restent en place.

## Jouer et développer

- `JOUER.html` : jeu autonome, ouvrable sans réseau.
- `ESSAI_CARTES.html` : même jeu, présentation cartes activée au démarrage.
- `npm run dev` : serveur local ; `index.html?cartes=1` active cette vue.

Le plateau comporte dix cases par ligne, deux/trois/quatre lignes suivant la
rencontre. La PR nº 20 intégrée permet la pose sur les trois premières cases, avec
zone miroir pour l'IA. Les anciennes batailles 3×5 restent compatibles.
L'équilibrage de cette pose élargie reste distinct des anciens benchmarks.

## Nouvelle production d'images

Aucun ancien portrait n'est automatiquement réutilisé. Le catalogue actif
`assets/artwork.json` est vide. Chaque nouveau visuel passe par une référence,
une génération pilote, une validation humaine exacte et un export contrôlé.
Les nombres, noms et descriptions viennent du jeu.

Le builder exige une clé déclarée, un reçu, des droits, une provenance et un
SHA-256 concordant ; il refuse les WebP non catalogués. Le dépôt
[couronne-et-arcanes-art](https://github.com/floiaassistant-design/couronne-et-arcanes-art)
reste l'atelier ; aucune synchronisation automatique.

## Contrôles

```sh
npm run build
npm run build:cards
npm run build:test
node scripts/build_standalone.mjs --cards --test
npm test
npm run test:parity
```

Les workflows exécutent également les parcours Chromium bureau/mobile,
sauvegarde réelle, reprise et export hors réseau. Vérifier leurs résultats
distants avant de les déclarer réussis. Aucun téléphone physique n'est garanti.

Les clés `couronnes_arcanes_v1`, `couronnes_arcanes_bataille_v1` et le réglage
d'animations sont conservés. Les effets transitoires restent exclus du stockage.
Les sources sont séparées entre moteur, IA, vues et stockage ; 26 modules.

[État](docs/ETAT_PROJET.md), [architecture](docs/ARCHITECTURE_MODULAIRE_V2_6.md),
[rapport avant remise à zéro](docs/CHECKUP_NETTOYAGE_2026_10_20.md),
[Bible](docs/BIBLE_DU_JEU.md). Les jalons précédents sont historiques.
Une branche et une PR par évolution ; accord spécifique requis avant fusion.
