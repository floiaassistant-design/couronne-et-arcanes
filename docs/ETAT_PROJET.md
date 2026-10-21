# État de reprise — 21 octobre 2026

## Proposition Sylve en cours

- Branche `feat/sylve-cartes-20261021`, basée sur le dernier main vérifié
  `4b48b05f524a04814c67a58f0420e7262a31d3e3` après les fusions autorisées nº 25/26.
- Onze exports v01 de la PR atelier nº 23, commit immuable
  `c9b8bd8c2ed707f2d266554228f53d4714b95ba4`. Le Gardien est validé artistiquement ;
  les dix autres y restent en revue. La demande actuelle d’intégration autorise
  ce lot précis ; reçu des onze versions et empreintes dans le jeu.
- 21 cartes complètes, mappings individuels et 28 modules. Les images ne sont
  ni retouchées ni recadrées. Zones et typographie adaptées au cadre Sylve.
- Vraies possessions, statistiques et attentes ; rangs futurs « À concevoir ».
  Aucun changement moteur, IA, catalogue ni clé de sauvegarde. Les autres
  factions gardent leurs repères neutres. Aucune fusion de cette nouvelle PR.
- [Périmètre, contrôles et limites](SYLVE_INTEGRATION_2026_10_21.md).

## Milicien et Aube intégrés — PR nº 25 puis nº 26

- PR nº 25 fusionnée à `2787b1667871efe9fb1ae21528a17cd6b7e57e27` et nº 26 à
  `4b48b05f524a04814c67a58f0420e7262a31d3e3`, après « tu peux fusionner les pr ».
- Dix cadres complets, textes et valeurs dynamiques. Sceaux de camp en coin
  remplaçant le trait sous les cartes ; formes et camp accessibles conservés.
- Sources : Milicien v02 à `e43c3a87`, neuf autres Aube v01 à `96190c83`.
  Les PR atelier nº 21/22 restent séparées et non fusionnées.
- CI avant fusion réussie sur les deux heads ; main après fusion identique
  à la version Aube testée, par comparaison GitHub sans fichier modifié.
- [Milicien](MILICIEN_INTEGRATION_2026_10_21.md) et [Aube](AUBE_INTEGRATION_2026_10_21.md)
  conservent les périmètres et contrôles datés des propositions.

## Collection intégrée — PR nº 24

- Branche `feat/collection-six-rangs-20261021`, basée sur main
  `f403f513e85cb247e0a792dd36175f25da984fc6` (nettoyage documentaire nº 23).
  La page a été intégrée après validation explicite, à `0896c16e`.
- Pleine largeur, cinq ordres et une ligne par personnage avec six rangs.
  Seul le rang actuel est jouable ; les autres sont « À concevoir ». Divine
  rouge, Éveillée jaune céleste. Possession, deck, compositions et compétences
  conservent les données existantes. 27 modules sur cette branche.
- Fond original conservé dans la PR atelier nº 21, commit
  `c4f5e6871e32db3b646f51ba906c3ea00b7c6eb9`, CI atelier réussie
  [39569759595](https://github.com/floiaassistant-design/couronne-et-arcanes-art/actions/runs/39569759595).
  Le jeu épingle cet export et son reçu. La PR reste ouverte et non fusionnée.
- La PR atelier nº 20 est depuis fusionnée ; son import est décrit ci-dessus.
  Ajouter ensuite les cartes validées progressivement, sans
  inventer leurs textes, statistiques ou conditions d’évolution.
- Contrôles et limites de cette proposition : [Collection](COLLECTION_2026_10_21.md).
  Les résultats du jalon ci-dessous sont historiques.

## Jalon fonctionnel intégré

- Jeu : PR nº 20 fusionnée à `33b839068c4be29ef27e3d912fbfc75b52ddfc95`, puis
  PR nº 22 à `50b32e4ad5c41da8c99f190d4ca300ce9fec988a` sur accord spécifique.
  La nº 21 (rapport) était déjà intégrée. Vérifier le dernier main avant travail :
  ces empreintes identifient le jalon, pas une branche de reprise à figer.
- Atelier : PR nº 18 fusionnée à `e598646540bf01d0389de772eed1d7f3539c27cc`.
  GitHub est l'unique source officielle : dépôt du jeu pour les sources jouables,
  dépôt art pour sources graphiques, prompts, références, exports et reçus.
- Plateau peint plein écran, main intégrée, cadres et lecture au survol/focus
  conservés. Clic/toucher ferme l'aperçu ; pose en 1/2/3, miroir adverse 10/9/8.
- Anciennes illustrations et animations de personnages retirées. Registre
  `assets/artwork.json` vide ; SVG neutres, aucun ancien portrait ni effet actif.
- 76 cartes, quatre classes, 12 missions, 20 étages, trois donjons, 26 modules.
  Moteur, IA, catalogue et stockage inchangés par la remise à zéro relativement
  à la nº 20. Clés, profils et anciens combats 3×5 conservés.
- Anciennes PR jeu nº 11, 17, 18, 19 et treize anciennes PR art fermées sans
  fusion comme historiques. Leurs images et accords ne sont pas des lots actifs.

## Contrôles du jalon

[CI jeu après fusion](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/39498989044)
réussie : 273 tests Node, 60 parités, builds synchronisés, parcours Chromium
bureau/portrait/paysage, vraie sauvegarde/reprise, export hors réseau et simulations.
[CI atelier après fusion](https://github.com/floiaassistant-design/couronne-et-arcanes-art/actions/runs/39499003125)
réussie : neuf tests, validation, contrôle des sources et export vide.
Aucun téléphone physique ni équilibrage humain exhaustif revendiqué.

## Reprise

Lire `AGENTS.md`, le README, la [décision actuelle](REMISE_A_ZERO_GRAPHIQUE_2026_10_20.md)
et le [contrat d'import](INTEGRATION_GRAPHISMES.md). La Bible et l'architecture
décrivent les contraintes métier ; leurs sections datées et les anciens audits
sont historiques. Leurs prochaines tâches, chiffres d'assets et états de PR
ne remplacent pas le présent état et les commits réels. Aucun ancien paquet
externe ou conversation ne sert de source de reprise.

Prochaine étape : examiner la nouvelle PR Sylve et son aperçu, puis décider
séparément de sa fusion. Les rangs futurs et les autres factions continuent
progressivement avec leurs versions, reçus et mappings exacts.
