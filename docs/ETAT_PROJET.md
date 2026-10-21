# État de reprise — 21 octobre 2026

## Proposition Collection en cours de revue

- Branche `feat/collection-six-rangs-20261021`, basée sur main
  `f403f513e85cb247e0a792dd36175f25da984fc6` (nettoyage documentaire nº 23).
  La nouvelle page est proposée en PR ; aucune fusion autorisée ou effectuée.
- Pleine largeur, cinq ordres et une ligne par personnage avec six rangs.
  Seul le rang actuel est jouable ; les autres sont « À concevoir ». Divine
  rouge, Éveillée jaune céleste. Possession, deck, compositions et compétences
  conservent les données existantes. 27 modules sur cette branche.
- Fond original conservé dans la PR atelier nº 21, commit
  `c4f5e6871e32db3b646f51ba906c3ea00b7c6eb9`, CI atelier réussie
  [39569759595](https://github.com/floiaassistant-design/couronne-et-arcanes-art/actions/runs/39569759595).
  Le jeu épingle cet export et son reçu. La PR reste ouverte et non fusionnée.
- Portrait du Milicien : PR atelier nº 20 en création/validation séparée ; aucun
  portrait importé. Ajouter ensuite les cartes validées progressivement, sans
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

Prochaines étapes : examiner la PR Collection, puis finaliser et faire valider
le Milicien avant son import individuel. Les autres cartes seront conçues et
importées au fur et à mesure, avec leur propre validation.
Toute nouvelle évolution passe par une branche et une PR avec accord spécifique
avant fusion. La proposition Collection modifie seulement la présentation et son export.
