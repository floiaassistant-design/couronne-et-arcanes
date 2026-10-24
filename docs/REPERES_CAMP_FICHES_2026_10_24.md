# Repères de camp et fiches — proposition du 24 octobre 2026

## Demande validée

Le propriétaire a validé l’aperçu sur le plateau : petit rond bleu allié et petit
losange rouge adverse, à côté des cartes. Le blason centré au-dessus disparaît.
Dans les fiches, le symbole précède « Bonus de faction : +1 attaque ».
Le long paragraphe est retiré ; le bonus inactif est grisé avec « (inactif) ».

Symboles : Aube ☀, Sylve ❧, Ombre ☾, Forge ⚒, Éther ◇. Les images et la lumière
fixe sur les emblèmes peints sont conservées. Aucun import dans l’atelier.

## Contrat

- `ui/card-arena.js` garde le rendu commun `campSeal`, avec deux formes SVG.
- `assets/card-arena.css` place les repères de 7 px à gauche, hors des cartes,
  sans intercepter les clics. Le camp accessible reste annoncé par la carte.
- `ui/concorde.js` partage le résumé et les symboles entre main, plateau et
  Collection ; l’état actif vient toujours de `formationBonus` via les vues.
- `styles/cards/concorde.css` distingue l’état inactif sans nouvelle animation.
- Aucun calcul métier, état persistant, image, identifiant ou dépendance ajouté.
  Les deux builds restent générés depuis les mêmes sources et feuilles.

## Reprise

Branche : `fix/discreet-camp-markers-faction-summary-20261024`.
Base officielle : main `3beb7346cc6b881ad6ea123087309c853d51162b`, arbre
`e4119167750232e3cfdfdfdb475926fabf44c57a`. La copie locale complète et son export
de départ ont été comparés aux empreintes Git de cet arbre, tous identiques.

Contrôles locaux réussis : 333 tests Node, 60 parités, builds production et
diagnostic. Parcours Concorde (5 Ordres, deux camps, bureau/portrait/paysage et
ancien 3×5), Aube/Sylve/Ombre/Forge/Éther, aperçus, pose, jeu web modulaire et
intégrité des sauvegardes réussis avec Playwright 1.56.0 / Chromium 141.
Les repères ne recouvrent aucune carte voisine. Captures bureau et portrait
examinées : texte court, symbole en tête, emblème lumineux et Citadelle conservés.
Export local : 34 443 715 octets, blob Git `f61db5e6089a2cab7cb552d43bf2542f4b703422`.
Le générateur distant ponctuel doit produire le même blob, puis être retiré ;
la CI finale et son commit sont consignés dans la PR.
Les anciens tests du texte détaillé vérifient maintenant le résumé demandé,
ses cinq symboles et les états réels ; les vérifications du moteur sont conservées.

Statut : proposition non fusionnée et non publiée. Chaque fusion exige un accord
spécifique. Les captures automatisées ne valident pas un téléphone physique,
Safari/Firefox ni un équilibrage humain exhaustif.
