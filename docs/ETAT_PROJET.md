# État courant — 24 octobre 2026

## Intégré sur GitHub

Main vérifié après fusion autorisée de la [PR nº 42](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/42) :
`ea1e18c49bcfd291a664dacdf95b4bb5c847af89`, arbre
`6ca0680d09f3e560059d10420ed77014c4951619`.
Le ciblage des sorts, le lecteur d’effets, le laboratoire, les 76 cartes
illustrées et l’affichage Concorde sont intégrés. Un jeu web et un seul JOUER
hors ligne ; profils, progression et anciennes batailles 3×5 conservés.

## Concorde livré

L’emblème déjà peint en haut à droite s’éclaire de façon fixe lorsque le moteur
accorde Concorde. Le badge flottant est retiré. Les fiches main/plateau/Collection
expliquent le bonus de faction ; la fiche réserve Citadelle sur petit écran.
La fusion de cette variante a été autorisée spécifiquement par le propriétaire.
Aucun emblème neuf créé ou importé, aucun fichier de l’atelier modifié.
[Contrat, contrôles et bilan de livraison](CONCORDE_2026_10_24.md).

Les validations de conception Garde, Impact de zone, évolutions et Milicien
suivies dans Notion ne sont pas implémentées par cette livraison.
L’audit documentaire [nº 41](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/41)
reste indépendant et non fusionné.

## Vérifications et reprise

330 tests, 60 parités, builds et parcours bureau/mobile/ancien 3×5 réussis.
La [CI complète](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40077509046)
et l’[assemblage web](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40077509054)
ont validé le même arbre que ce main ; aucune suite retirée.
JOUER distant et local identiques, blob `1e2efb67929e1c0d50c93914c288ef60ce957056`.
Les contrôles automatisés ne remplacent pas un test sur téléphone physique ou
un équilibrage humain exhaustif. Relire main et les PR réelles avant de reprendre.
Chaque future PR nécessite son propre accord explicite de fusion.

## Publication vérifiée

[Jeu en ligne](https://couronnes-arcanes-jeu.flo-ia-assistant.chatgpt.site) :
Sites version 5, publication automatique du main ci-dessus, déploiement
`appgdep_6adc74e226408191a465f3690ac2a758` terminé avec `succeeded`
le 24 octobre 2026 à 09:05:46 UTC. Les 147 fichiers du commit de diffusion
ont été comparés au paquet canonique ; les 14 fichiers nouveaux ou modifiés
ont aussi été comparés par HTTP sans cache, tous identiques.

L’unique export hors ligne demeure dans GitHub ; seul le miroir Sites omet
JOUER.html, trop gros pour son dépôt de diffusion. Le reçu garde son empreinte.
Le Site, son audience publique et l’automatisation existante sont conservés.
[Procédure et provenance](PUBLICATION_WEB_2026_10_23.md).
