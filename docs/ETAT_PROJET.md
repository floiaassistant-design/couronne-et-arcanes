# État de reprise — 21 octobre 2026

## Proposition Aube et sceaux en cours de revue

- Branche `feat/aube-cartes-sceaux-20261021`, suite de la PR jeu nº 25 encore
  ouverte (`feat/milicien-carte-v02-20261021`, head `0d2a4d0a`). Le main vérifié
  reste `0896c16e` ; cette branche ne prétend pas y avoir intégré le Milicien.
- Neuf autres cartes Aube v01 importées manuellement depuis la PR atelier nº 22,
  commit `96190c837f79e645777967aaf84decbea0ad33a5`, encore ouverte.
  Demande humaine d’ajout consignée avec les neuf empreintes dans
  `approvals/aube-neuf-cartes-v01.json` ; le manifeste atelier reste en review.
- Dix personnages Aube illustrés, mappings individuels, vraies valeurs et
  possessions conservées ; rangs futurs toujours « À concevoir ». Sylve et
  autres factions restent neutres. Sources et images non retouchées.
- Le trait de vie/camp sous les cartes laisse place à deux petits sceaux :
  écu à chevron pour vous, losange croisé pour l’adversaire. Vrais PV sur carte,
  PV actuels/maximum et camp dans la fiche et le nom accessible.
- 28 modules, dix cartes complètes. Nouvelle PR séparée, ciblant la branche
  Milicien pour montrer uniquement cette évolution. Aucune fusion autorisée.
  Voir [périmètre et vérification](AUBE_INTEGRATION_2026_10_21.md).

## Proposition Milicien — PR nº 25, non fusionnée

- Branche `feat/milicien-carte-v02-20261021`, basée sur le main du jeu
  `0896c16e30cff37464b5eb355b3d2b37a2c5651a`, après fusion autorisée de la
  Collection nº 24. Aucune fusion de cette nouvelle évolution n’est autorisée.
- Source art : PR nº 20 fusionnée à `e43c3a877f45bde9a6f99fb1fa1005abdc47bace`,
  carte complète Milicien de l’Aube v02. Export exact WebP 768×1152, 360 012 octets.
- Instruction humaine « intégre le mélicien au jeux », consignée dans le reçu
  du jeu. L’ancien statut review du manifeste atelier n’est pas réutilisé comme
  validation : le reçu d’import est postérieur et désigne l’empreinte exacte.
- Cadre dessiné conservé, textes et chiffres dynamiques dans ses cinq cases ;
  même image en Collection, main, fiches et plateau. Seul `militia` est associé
  à cette image ; les neuf autres personnages sont ajoutés par la proposition
  suivante ci-dessus. Les futures évolutions restent à concevoir.
- 28 modules, un nouvel asset complet et aucun ancien portrait réactivé.
  [Périmètre, contrat et contrôles](MILICIEN_INTEGRATION_2026_10_21.md).

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

Prochaines étapes : examiner la PR jeu du Milicien, puis poursuivre les cartes
après validation du gabarit rendu. Les autres cartes seront conçues et
importées au fur et à mesure, avec leur propre validation.
Toute nouvelle évolution passe par une branche et une PR avec accord spécifique
avant fusion. La proposition Collection modifie seulement la présentation et son export.
