# Cour des Ombres — proposition du 21 octobre 2026

## Source et autorisation

Branche `feat/ombre-cartes-20261021`, basée sur le main exact
`3c208df3eb3d5a57953e0c3bd0ee91069895edab`, après la fusion autorisée de la
Sylve nº 27. Nouvelle PR distincte ; aucune fusion ni auto-merge.

Source : PR atelier nº 24 ouverte, commit immuable
`e1022f20a8ecad8f8843579d0b4af7a1655c69a0`. Onze WebP 768×1152 : Chevalier
du Tombeau, Guerrier d’ossements, Ombre vorace, Veilleur du tombeau, Faucheur
de fièvre, Archiliche de Minuit, Banshee des Voiles, Vampire d’Obsidienne,
Lame nocturne, Spectre du Caveau et Inquisiteur des Brumes.

Le Chevalier exact était validé artistiquement ; les dix autres images restent
review dans l’atelier. La demande « tu peux continue avec la prochaine classe
la pr est préte » est consignée dans `approvals/ombre-onze-cartes-v01.json`,
avec les onze versions et empreintes. Cette autorisation d’import postérieure
ne change pas le manifeste atelier et n’autorise aucune fusion.

SHA Git téléchargés, SHA-256, dimensions et poids concordent avec les
métadonnées de ce commit. PNG originaux, prompts, droits et provenance sont
conservés dans l’atelier. Aucun fichier recadré ou retouché, aucun ancien lot.

## Rendu et architecture

Onze mappings explicites dans `CARD_TEMPLATES`. `generated-card.js` réutilise
le lecteur pur existant ; la table de disposition choisit uniquement des zones
après résolution d’une image cataloguée. Les galeries officielles Sylve et
Ombre utilisent les mêmes coordonnées, donc la géométrie est partagée :

| Champ | Gauche % | Haut % | Largeur % | Hauteur % |
|---|---:|---:|---:|---:|
| Compteur | 6 | 4,4 | 17,3 | 12,7 |
| Nom | 12 | 68,7 | 76 | 6,2 |
| Descriptif | 23 | 78,5 | 54 | 13,4 |
| Attaque | 6,1 | 85,1 | 16,1 | 10,4 |
| Vie | 80,7 | 85,1 | 16,1 | 10,4 |

Les descriptions Ombre utilisent 3,2 cqw pour contenir aussi le texte complet
de l’Inquisiteur. La fiche existante fournit également la description en texte
normal ; une miniature ne suffit pas à une lecture confortable. Les noms et
chiffres réutilisent les tailles vérifiées pour ces cartouches et cercles.
Les zones et typographies Aube/Sylve restent identiques.

Les cartes restent entières en Collection, main, fiche, plateau et vue classique.
Compteur, attaque et PV proviennent des calculs existants. Les sceaux de camp
restent distincts par forme. Forge et Éther conservent leurs repères neutres.
32 images et 28 modules, environ 15,72 Mo par HTML autonome. Les exports sont
régénérés depuis les sources ; aucun diagnostic n’est distribué.

Aucune modification du moteur, catalogue, IA, possessions, identifiants,
raretés ou sauvegardes. Les cinq rangs futurs restent « À concevoir ».

## Vérification

- 285 tests Node réussis, 60 scénarios de parité identiques et quatre builds.
- Parcours Ombre : onze exports exacts, 66 projections, champs contenus,
  fiches, vraie pose par l’API normale, PV blessés, deux camps et reprise hors
  réseau, avec mouvement réduit. Bureau 1440×1000, portrait 390×844,
  paysage 844×390. Sources réunies et captures examinées.
- Les parcours existants sont exécutés avant livraison ; leur résultat final
  et celui de la CI sur le head exact sont indiqués dans la PR.

Aucun téléphone physique ni nouvel équilibrage humain revendiqués. Les points
artistiques signalés par l’atelier restent conservés : bouclier du Veilleur
en bord de fenêtre, lame du Faucheur proche de l’ornement, couverture ornée
du livre de l’Inquisiteur. L’intégration ne modifie pas ces illustrations.
