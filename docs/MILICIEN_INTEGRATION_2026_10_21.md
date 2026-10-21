# Milicien de l’Aube v02 — proposition d’intégration, 21 octobre 2026

## Source et autorisation

Le propriétaire demande explicitement « intégre le mélicien au jeux » après
fusion de la PR atelier nº 20. Cette instruction autorise l’import manuel de
la carte complète v02 dans la nouvelle PR du jeu. Le reçu du jeu désigne sa
version et son empreinte exactes. Elle n’autorise aucune autre carte ni la
fusion de cette nouvelle PR.

Source officielle : `floiaassistant-design/couronne-et-arcanes-art`, commit
`e43c3a877f45bde9a6f99fb1fa1005abdc47bace`,
[PR nº 20 fusionnée](https://github.com/floiaassistant-design/couronne-et-arcanes-art/pull/20).
Le manifeste atelier épinglé porte encore le statut review ; la présente
demande d’import lui est postérieure. La fusion art seule n’est pas traitée
comme un accord esthétique. Aucune image historique de l’ancienne série importée.

- Source PNG : `sources/cards/milicien-aube-carte-v02.png`, 1024×1536,
  3 471 038 octets ; SHA-256
  `5705ca753bf480c1cf970e46a89c8a2f934676d6da931305b6409feb9a68863f`.
- Export exact : `exports/cards/milicien-aube-carte-v02.webp`, 768×1152,
  360 012 octets ; SHA-256
  `7900c39aed106d66cf92a31bee39de56135998b32b41160d6ab07f9e50281794`.
- Prompt, référence v01 et provenance conservés dans l’atelier. Aucune nouvelle
  génération, retouche ou conversion ; le fichier du jeu est identique à l’export.
- Reçu : `docs/approvals/milicien-aube-carte-v02.json`. Registre actif :
  `assets/artwork.json`, `kind: card`, clé `milicien_aube_carte_v02`.

## Rendu et zones

Le cadre généré et ses matières restent dans l’image. Le jeu superpose seulement
les textes et nombres dans les cinq emplacements vides. Aucun recadrage en
portrait, nom, chiffre ou capacité peints. Le plein cadre de ratio 2:3 est
conservé entre Collection, main, fiches et miniatures du plateau. En vue classique,
l’image entière remplace le repère du Milicien ; nom et stats restent affichés
par le rendu classique. Le graphisme adverse n’est pas retourné.

Coordonnées en pourcentage de l’image, contrat `GENERATED_CARD_FIELDS` de
`src/ui/generated-card.js` :

| Champ | Gauche | Haut | Largeur | Hauteur |
|---|---:|---:|---:|---:|
| Compteur | 6 | 5 | 17 | 11 |
| Nom | 12 | 69,6 | 76 | 5,6 |
| Descriptif | 23 | 77,3 | 54 | 14 |
| Attaque | 3,5 | 83,5 | 18 | 12 |
| Vie | 78,5 | 83,5 | 18 | 12 |

La main affiche l’attente restante ; la Collection le délai de base ; une unité
déployée affiche zéro, avec un libellé explicite. Attaque et PV viennent de
`unitStats` pour l’invocation, et du modèle de lecture du plateau pour une unité
déjà posée : blessures, Concorde, Ralliement et autres états restent visibles.
Les bonus d’amélioration et de maîtrise sont conservés hors de l’image et dans
les fiches. Les noms et descriptions sont échappés.

La Collection garde une ligne pour le Milicien. Les six rangs réutilisent la
même image ; seule la Commune correspond à la carte réellement définie. Les
cinq futures versions portent « À concevoir » et des tirets, sans exemplaire
accordé ni action de deck. Divine reste rouge, Éveillée jaune céleste.

## Architecture et limites

28 modules. Nouveau rendu pur `ui/generated-card.js`, partagé par les vues,
la Collection, les cartes du plateau et les fiches. `CARD_TEMPLATES` ne mappe
que `militia` ; `CARD_ART_NAMES` et `INLINE_CARDS` sont séparés des portraits.
Le lecteur `scripts/lib/artwork.mjs` accepte le nouveau contrat complet :
mapping, clé, source épinglée, droits/provenance, reçu de version exact, octets,
SHA-256 et dimensions WebP. Les deux répertoires refusent les WebP non catalogués.

Le builder embarque un seul export de carte. `JOUER.html` : 1 709 051 octets ;
`ESSAI_CARTES.html` : 1 709 075 octets. Les quatre exports sont régénérés depuis
les sources. Aucun fichier de diagnostic distribué. Ni règles, catalogue,
identifiants, progression, IA, clé ou structure de sauvegarde modifiés.

La scène fixe utilise `overflow: clip` pour conserver la position de la main
quand une fiche s’ouvre ; les défilements de la grille et de la main sont
conservés et testés. Une miniature ne rend pas tous les textes confortablement
lisibles : la fiche au survol/focus permet leur lecture en plus grand. Le
Milicien n’a pas d’animation de personnage ; aucune n’est introduite ici.

## Vérification

- 284 tests Node réussis ; 60 scénarios déterministes identiques à la référence.
- Builds JOUER, ESSAI_CARTES et leurs variantes de diagnostic réussis.
- Parcours Milicien Chromium bureau, portrait et paysage : SHA-256 de l’image
  décodée, cinq champs contenus, ratio du cadre, vraie pose, attente, valeurs
  à deux chiffres, PV blessés, fiche, tour, reprise et vue classique.
- Parcours existants de Collection, compétences de classe, nouvelle partie,
  contrôle du combat, capacités, essai cartes, déploiement, survol/focus/toucher,
  arènes, main fixe et sauvegarde/reprise. Les attentes d’image neutre pour le
  Milicien sont remplacées par son export exact ; le repli SVG reste contrôlé
  sur les personnages non illustrés. Aucun contrôle métier ni référence de
  parité retiré pour masquer une régression.
- Version HTTP : module, WebP, compteur et Collection chargés sans erreur.
  Export de production ouvert sans réseau ; images manquantes et mouvement
  réduit contrôlés par les parcours existants.
- Les captures du Milicien sont conservées comme artefacts de CI. La CI distante
  doit être vérifiée sur le commit exact, distinctement des résultats locaux.
  Aucun téléphone physique ni rééquilibrage humain exhaustif revendiqué.

La Collection nº 24 est intégrée. La présente évolution reste dans une nouvelle
PR à valider avant fusion, puis les autres cartes pourront être intégrées une
par une avec leur propre validation.
