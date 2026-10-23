# Import Éther et sorts — proposition du 23 octobre 2026

Base réelle : `main` `ef675bbaed3e1154cd52920cc9f74b4b6345d4b7`, après fusion des PR 35–37. Aucune PR jeu ouverte au départ. La PR nº 38 de préparation web a été ouverte pendant ce travail : aucun fichier de code, style ou image partagé, chevauchement limité aux notes État/Changelog ; sa fusion reste séparée. Branche `feat/ether-sorts-cartes-20261023` ; aucune fusion ni auto-merge.

La demande du propriétaire d’ajouter les cartes créées autorise un import manuel des PR atelier nº 26 (`53d47b136391582dc4fb9755c3c4cad0a5f5df00`) et nº 27 (`2871642c54e53568153b2d9f3d69a07a7d5bd169`). Onze Éther : Feu follet v02 et dix v01. Vingt-trois sorts v01, dont huit compétences de classe. Les 42 cartes antérieures restent identiques ; 76 cartes illustrées au total.

Les reçus `approvals/ether-onze-cartes-20261023.json` et `approvals/sorts-vingt-trois-cartes-20261023.json` distinguent cette demande d’import des avis artistiques de l’atelier : pilotes approuvés, 32 autres images encore review dans les snapshots. Aucun manifeste atelier changé, aucune fusion atelier. Chaque fichier garde sa version, provenance, droits, source PNG, métadonnées et SHA-256 exacts, épinglés au commit source. Le Feu follet v01 rejeté est exclu. Aucun portrait partagé ni ancien lot réactivé.

## Rendu

Mappings individuels dans `src/visuals.js`, registre et index concordants. `ui/generated-card.js` conserve les cinq champs des unités ; les Éther partagent les coordonnées des cadres ornés, avec le descriptif long du Marcheur composé plus petit. Les sorts utilisent une variante explicite de trois champs, sans attaque/PV : attente `[5,5.4,18,10]`, nom `[12.5,68.1,75,6]`, effet `[13,77.8,74,14]`, en pourcentages, conformément au pilote Lame de feu. Les nombres et textes viennent des données réelles et sont échappés.

Même lecteur en Collection, main et aperçu ; unités également sur le plateau. Les sorts restent des actions par ligne, sans unité artificielle. Les rangs futurs restent « À concevoir ». Moteur, IA, catalogue, progression, laboratoire, stockage et ancienne géométrie 3×5 inchangés ; 34 modules. Aucun nouveau lecteur ou module de règles.

`npm run build` régénère l’unique `JOUER.html` autonome : 34 415 376 octets, environ 14,1 Mo de plus pour les 34 WebP supplémentaires. `index.html` sert le même jeu modulaire. Aucun export d’essai réintroduit.

## Vérifications

Résultats locaux : `npm test` 317/317 ; `npm run test:parity` 60 scénarios identiques ; builds jeu et diagnostic réussis, diff sans erreur. Les suites Éther, sorts, Forge, Collection, aperçu commun, base graphique, étude des cartes, déploiement et jeu web modulaire passent sur bureau/portrait/paysage. Compétences de classe bureau/mobile, intégrité des sauvegardes, laboratoire et effets (mouvement réduit et animations désactivées inclus) passent également. Les parcours dédiés contrôlent chaque export par SHA-256, les champs sans débordement, les valeurs courantes, la non-mutation de la collection, les vraies poses et les sauvegardes/reprises hors réseau. Les sorts sont lancés un par un par la vraie interface, compétences dans leur classe, sur bureau/portrait/paysage. Les suites sont ajoutées à la CI et leurs captures aux artefacts.

Images exportées examinées en planche, captures bureau/mobile inspectées. Les descriptions complètes restent aussi dans les fiches en texte normal. Aucun téléphone physique, revue artistique individuelle des 32 nouvelles images ou équilibrage humain exhaustif revendiqué. La CI distante doit être lue sur le commit publié avant d’en annoncer le résultat. Aucune fusion autorisée.

## Reprise — contrôle de la CI du 23 octobre

La CI `39964151815`, sur `55b4ebfd`, a validé tests moteur, parité, synchronisation du fichier autonome, effets, sauvegardes, Collection et les cinq familles de créatures. Elle a échoué sur une empreinte d’image dans la fiche d’un sort en portrait ; les étapes suivantes ont été ignorées. Elle ne doit pas être présentée comme réussie.

Le parcours initial repasse localement sur les trois formats. Le test est stabilisé : pointeur écarté avant le parcours au clavier, attente explicite de la fiche et de la bonne clé graphique avant décodage. L’empreinte exacte, les trois champs, les textes et vrais lancements restent contrôlés ; aucun délai arbitraire ni relâchement des assertions. Aucune modification du jeu, des images ou de JOUER : blob toujours `dd30fce7c897c1ba9abe4bb4e75803fa1f3b8a63`. Nouvelle CI complète à consulter sur le correctif publié.
