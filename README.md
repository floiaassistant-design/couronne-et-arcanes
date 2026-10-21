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
de combat sont retirées. Les cartes non encore illustrées affichent des emplacements neutres avec
leurs noms et vraies valeurs. Le décor peint, la main, les cadres, les aperçus
au survol et les interactions restent en place.

## Sylve — proposition du 21 octobre 2026

Onze cartes Sylve rejoignent les dix Aube : Gardien des Racines, Éclaireuse,
Loup des Brumes, Dryade, Cerf astral, Traqueur d’épines, Luciole, Ours,
Archidruide, Hibou et Trappeur sylvestre. Cadres en bois et racines conservés,
noms et vraies valeurs dynamiques, emplacements adaptés au cadre Sylve.
Le descriptif long du Trappeur reste complet et se lit aussi dans la fiche.
Les autres rangs restent « À concevoir », sans exemplaire ni règle ajoutés.

Source exacte : PR atelier nº 23, commit `c9b8bd8c`. Nouvelle PR jeu basée sur
le main `4b48b05f`, sans fusion. [Périmètre et vérifications](docs/SYLVE_INTEGRATION_2026_10_21.md).

## Aube et sceaux — intégrés par les PR nº 25 et nº 26

Les dix personnages de l’Aube ont leur carte complète sur main :
Milicien v02 et neuf cartes v01 de la PR atelier nº 22, épinglée au commit
`96190c83`. Cadres générés conservés, noms et vraies valeurs dynamiques en
Collection, main, fiches et combat. Aucune nouvelle rareté ni possession créée.
Le trait bleu/rouge sous les cartes du plateau est remplacé par un petit sceau :
écu à chevron allié, losange croisé adverse. La vie actuelle reste sur la carte,
la vie maximum dans la fiche. Les autres ordres restent neutres.

Les PR nº 25 puis nº 26 ont été fusionnées sur accord spécifique,
à `2787b166` puis `4b48b05f`.
[Périmètre et contrôles](docs/AUBE_INTEGRATION_2026_10_21.md).

## Milicien — intégré par la PR nº 25

Le Milicien de l’Aube v02 utilise sa carte complète avec cadre généré, issue
de la PR atelier nº 20 fusionnée. Nom, descriptif, attente, attaque et vie sont
rendus dans ses cases vides à partir des données réelles. Le même visuel sert
en Collection, dans la main, les fiches et sur le plateau ; aucune autre carte
n’est illustrée par association implicite. Les neuf autres Aube ont leurs mappings
propres dans la proposition suivante.
[Périmètre et contrôles](docs/MILICIEN_INTEGRATION_2026_10_21.md). La PR nº 25 a reçu sa validation spécifique et a été fusionnée.

## Collection — intégrée par la PR nº 24

La page Collection occupe toute la largeur : onglets Aube, Sylve, Ombre, Forge
et Éther, puis Sorts et Tous. Une ligne par personnage et six colonnes :
Commune, Rare, Épique, Légendaire, Divine rouge et Éveillée jaune céleste.
Seule la version du catalogue possède de vraies statistiques et une possession.
Les autres portent « À concevoir » ; aucune évolution de rareté n’est créée.
Deck, compositions et compétences de classe restent accessibles en bas de page.

Le fond illustré est embarqué et tracé dans `assets/ui-artwork.json`. Les
autres ordres restent neutres ; les dix Aube sont intégrés et les onze Sylve proposés. [Périmètre et vérifications](docs/COLLECTION_2026_10_21.md).
La Collection est intégrée à `0896c16e` après validation spécifique.

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
`assets/artwork.json` contient 21 cartes complètes autorisées pour import et aucun ancien lot. Chaque nouveau visuel passe par une référence,
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
Les sources sont séparées entre moteur, IA, vues et stockage ; 28 modules dans cette proposition.

[État](docs/ETAT_PROJET.md), [architecture](docs/ARCHITECTURE_MODULAIRE_V2_6.md),
[rapport avant remise à zéro](docs/CHECKUP_NETTOYAGE_2026_10_20.md),
[Bible](docs/BIBLE_DU_JEU.md). Les jalons précédents sont historiques.
Une branche et une PR par évolution ; accord spécifique requis avant fusion.
