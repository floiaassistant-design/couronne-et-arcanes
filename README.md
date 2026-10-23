## Proposition du 23 octobre — attaques et tours lisibles

Déplacements des cartes, lien attaquant/cible, frappes et projectiles distincts,
PV réellement perdus, soins et défaites séquencées. Bandeau d'action, vitesse
×2, bouton Passer et déroulé du tour consultable. Les résultats sont sauvegardés
avant la lecture ; règles et sauvegardes historiques conservées.
[Contrat et vérification](docs/EFFETS_COMBAT_2026_10_23.md).
Proposition sur branche dédiée, sans fusion autorisée.

# Couronnes & Arcanes — base graphique neuve

Jeu de cartes tactiques solo, web et hors ligne : 76 cartes, quatre classes,
12 missions, 20 étages de Tour et trois donjons. Collection, progression, IA,
statistiques et sauvegardes sont conservées.

## Proposition de simplification du 22 octobre

Un seul export `JOUER.html`, toujours en présentation cartes. L’ancienne vue
personnages et `ESSAI_CARTES.html` sont retirés sur demande du propriétaire.
Proposition séparée, dépendante de la PR nº 33, sans fusion autorisée.
[Périmètre et vérification](docs/EXPORT_UNIQUE_2026_10_22.md).

## État intégré

Les PR de maintenance nº 31 et nº 32 sont fusionnées sur accord spécifique,
main vérifié `9941596d` le 22 octobre 2026. Une nouvelle proposition organise le
CSS par responsabilité :
[structure des styles](styles/README.md) et
[périmètre et contrôles](docs/MODULARISATION_CSS_2026_10_22.md).

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

## Légions de la Forge — intégrées par la PR nº 29

Dix cartes Forge rejoignent les 32 Aube/Sylve/Ombre : Marteau des Monts, Golem,
Sapeur, Foreur, Colosse, Ingénieure, Canon, Mécaniste, Marchefer et Alchimiste.
Cadres acier/cuivre/braises entiers, noms et valeurs réels dans leurs champs.
Exports exacts de la PR atelier nº 25, commit `ceb0a916`. Collection, main,
fiches et plateau partagent ces images ; les rangs futurs restent « À concevoir ».
La PR nº 29 est fusionnée sur main depuis le 21 octobre 2026.
[Périmètre et contrôles](docs/FORGE_INTEGRATION_2026_10_21.md).

## Cour des Ombres — intégrée par la PR nº 28

Onze cartes Ombre rejoignent les 21 Aube/Sylve : Chevalier du Tombeau,
Guerrier d’ossements, Ombre vorace, Veilleur, Faucheur, Archiliche, Banshee,
Vampire, Lame nocturne, Spectre et Inquisiteur des Brumes. Cadres en
obsidienne/argent/améthyste conservés, valeurs réelles dans les champs vides.
Les images sont épinglées au commit atelier `e1022f20` de la PR nº 24.
Aucune rareté, possession ni règle ajoutée. PR nº 28 fusionnée sur accord
spécifique à `ee8a2482`.
[Périmètre et vérifications](docs/OMBRE_INTEGRATION_2026_10_21.md).

## Sylve — intégrée par la PR nº 27

Onze cartes Sylve rejoignent les dix Aube : Gardien des Racines, Éclaireuse,
Loup des Brumes, Dryade, Cerf astral, Traqueur d’épines, Luciole, Ours,
Archidruide, Hibou et Trappeur sylvestre. Cadres en bois et racines conservés,
noms et vraies valeurs dynamiques, emplacements adaptés au cadre Sylve.
Le descriptif long du Trappeur reste complet et se lit aussi dans la fiche.
Les autres rangs restent « À concevoir », sans exemplaire ni règle ajoutés.

Source exacte : PR atelier nº 23, commit `c9b8bd8c`. PR jeu nº 27 fusionnée
sur accord spécifique à `3c208df3`. [Périmètre et vérifications](docs/SYLVE_INTEGRATION_2026_10_21.md).

## Aube et sceaux — intégrés par les PR nº 25 et nº 26

Les dix personnages de l’Aube ont leur carte complète sur main :
Milicien v02 et neuf cartes v01 de la PR atelier nº 22, épinglée au commit
`96190c83`. Cadres générés conservés, noms et vraies valeurs dynamiques en
Collection, main, fiches et combat. Aucune nouvelle rareté ni possession créée.
Le trait bleu/rouge sous les cartes du plateau est remplacé par un petit sceau :
écu à chevron allié, losange croisé adverse. La vie actuelle reste sur la carte,
la vie maximum dans la fiche. Éther garde ses repères neutres.

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

Le fond illustré est embarqué et tracé dans `assets/ui-artwork.json`.
Les 42 cartes Aube, Sylve, Ombre et Forge sont intégrées. [Périmètre et vérifications](docs/COLLECTION_2026_10_21.md).
La Collection est intégrée à `0896c16e` après validation spécifique.

## Tours alternés — intégrés par la PR nº 30

Pour les **nouveaux** combats, le joueur pose ses cartes et valide ses actions ;
ses unités se déplacent et attaquent. L’IA pose ensuite ses cartes une par une
de façon visible, puis ses unités agissent. Les anciennes sauvegardes restent
sur la résolution commune historique. [Contrat et limites](docs/TOURS_ALTERNES_2026_10_21.md).

## Jouer et développer

- `JOUER.html` : unique jeu autonome, ouvrable sans réseau, cartes sur le plateau.
- `npm run dev` : même jeu web sur `index.html`, même présentation.
- `tests/JOUER.test.html` : diagnostic automatisé seulement, jamais distribué.

Le plateau comporte dix cases par ligne, deux/trois/quatre lignes suivant la
rencontre. La PR nº 20 intégrée permet la pose sur les trois premières cases, avec
zone miroir pour l'IA. Les anciennes batailles 3×5 restent compatibles.
L'équilibrage de cette pose élargie reste distinct des anciens benchmarks.

## Nouvelle production d'images

Aucun ancien portrait n'est automatiquement réutilisé. Le catalogue actif
`assets/artwork.json` contient 42 cartes complètes autorisées pour import et aucun ancien lot. Chaque nouveau visuel passe par une référence,
une génération pilote, une validation humaine exacte et un export contrôlé.
Les nombres, noms et descriptions viennent du jeu.

Le builder exige une clé déclarée, un reçu, des droits, une provenance et un
SHA-256 concordant ; il refuse les WebP non catalogués. Le dépôt
[couronne-et-arcanes-art](https://github.com/floiaassistant-design/couronne-et-arcanes-art)
reste l'atelier ; aucune synchronisation automatique.

## Contrôles

```sh
npm run build
npm run build:test
npm test
npm run test:parity
```

Les workflows exécutent également les parcours Chromium bureau/mobile,
sauvegarde réelle, reprise et export hors réseau. Vérifier leurs résultats
distants avant de les déclarer réussis. Aucun téléphone physique n'est garanti.

Les clés `couronnes_arcanes_v1`, `couronnes_arcanes_bataille_v1` et le réglage
d'animations sont conservés. Les effets transitoires restent exclus du stockage.
Les sources sont séparées entre moteur, IA, vues et stockage : 29 modules.
Les PR nº 31 et nº 32 sont intégrées. La PR nº 33 organise les styles ; la
proposition d’export unique en dépend et attend son propre accord de fusion.
[Maintenance intégrée](docs/MAINTENANCE_CSS_VUES_2026_10_22.md).

[État](docs/ETAT_PROJET.md), [architecture](docs/ARCHITECTURE_MODULAIRE_V2_6.md),
[rapport avant remise à zéro](docs/CHECKUP_NETTOYAGE_2026_10_20.md),
[Bible](docs/BIBLE_DU_JEU.md). Les jalons précédents sont historiques.
Une branche et une PR par évolution ; accord spécifique requis avant fusion.
