# Onze cartes Sylve — proposition du 21 octobre 2026

## Source et périmètre

Branche `feat/sylve-cartes-20261021`, basée sur le main vérifié
`4b48b05f524a04814c67a58f0420e7262a31d3e3`, après les fusions autorisées
des PR jeu nº 25 et nº 26. Aucun changement à ces dix cartes Aube ni à leurs
zones de texte. Nouvelle PR distincte, sans fusion ni auto-merge.

Source : PR atelier nº 23 encore ouverte, commit immuable
`c9b8bd8c2ed707f2d266554228f53d4714b95ba4`. Onze WebP 768×1152 repris
exactement : Gardien des Racines, Éclaireuse sylvestre, Loup des Brumes,
Dryade luminescente, Cerf astral, Traqueur d’épines, Luciole des Épineuses,
Ours des Roches, Archidruide Feuillage, Hibou du Crépuscule et Trappeur sylvestre.

La demande « tu peu intégré les carte sylve qui doivent étre préte quelque
part » est consignée dans `approvals/sylve-onze-cartes-v01.json`, avec les onze
versions et empreintes exactes. Le Gardien est approuvé artistiquement dans
l’atelier ; les dix autres y restent review. Ce reçu d’import postérieur ne
modifie pas leur statut atelier et ne prétend pas à une nouvelle validation
artistique. La fusion du jeu et celle de l’atelier restent des décisions séparées.

Les SHA Git téléchargés, SHA-256, dimensions et poids concordent avec les
métadonnées de ce commit. Les sources PNG, prompts, droits et provenance y
restent disponibles. Aucun recadrage, retouche ou export automatique.

## Rendu

`CARD_TEMPLATES` contient onze nouvelles associations individuelles.
Le rendu pur existant `generated-card.js` est réutilisé en Collection, main,
fiche et plateau. Les valeurs proviennent toujours des données et calculs du
jeu. La vue classique utilise le même fichier entier via `arenaSprite`.

Le cadre Sylve a ses propres zones normalisées, reprises de la galerie atelier :

| Champ | Gauche % | Haut % | Largeur % | Hauteur % |
|---|---:|---:|---:|---:|
| Compteur | 6 | 4,4 | 17,3 | 12,7 |
| Nom | 12 | 68,7 | 76 | 6,2 |
| Descriptif | 23 | 78,5 | 54 | 13,4 |
| Attaque | 6,1 | 85,1 | 16,1 | 10,4 |
| Vie | 80,7 | 85,1 | 16,1 | 10,4 |

Le nom et les chiffres ont une taille adaptée aux cartouches et cercles Sylve.
Les descriptifs de plus de 160 caractères utilisent une typographie réduite,
sans retirer ni réécrire le texte. Celui du Trappeur se lit aussi en texte normal
dans la fiche existante : la miniature seule ne permet pas une lecture confortable.

21 images embarquées, toujours 28 modules. Les fichiers autonomes JOUER et
ESSAI_CARTES font environ 11,12 Mo chacun. Les autres factions restent neutres.
Aucune règle, capacité, statistique de base, IA, possession, rareté, clé ou
structure de sauvegarde modifiée. Les cinq rangs futurs restent « À concevoir ».
Les sceaux de camp restent distincts par forme et les vraies valeurs de PV
sont conservées sur la carte et dans la fiche.

## Contrôles locaux exécutés

- 285 tests Node et 60 scénarios de parité identiques. Quatre builds générés
  depuis les sources ; aucun fichier de diagnostic distribué.
- Onze images Sylve exactes décodées et comparées aux empreintes, 66 projections
  de Collection, champs contenus, fiches, vraie pose par l’API normale, blessures,
  sceaux des deux camps et reprise. Bureau 1440×1000, portrait 390×844,
  paysage 844×390, sans réseau et avec mouvement réduit. Même contrôle pour
  les dix Aube et leurs 60 projections.
- Parcours Collection, Milicien, aperçus, essai cartes, déploiement, base neutre,
  arène 2/3/4 lignes et ancienne sauvegarde 3×5, plein écran, arène peinte,
  capacités, compétences, contrôles, nouvelle aventure et sauvegarde après
  coupure réussis. L’arène vérifie aussi le jeu web modulaire et l’export réel.
- Sources réunies et captures Collection/plateau examinées sur les trois formats.
  Contrôle du diff, mapping, registre, reçus et responsabilité des modules.

La CI distante sera vérifiée sur le head exact de la nouvelle PR. Aucun téléphone
physique ni nouvel équilibrage humain revendiqués. Les variations artistiques
signalées dans l’atelier sont conservées : quatre ailes pour la Luciole, aile
du Hibou proche du compteur. Elles restent à juger dans le rendu du jeu.
