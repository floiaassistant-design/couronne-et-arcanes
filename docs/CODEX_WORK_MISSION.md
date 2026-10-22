## Proposition — Présentation cartes unique et export unique, 22 octobre 2026

Demande du propriétaire : conserver seulement le jeu avec les cartes sur le
plateau et un seul fichier jouable `JOUER.html`. La présentation personnages,
son bouton, sa préférence et ses styles spécifiques sont retirés. Le jeu web
et l’export démarrent toujours en cartes, même avec l’ancienne préférence off
ou un ancien lien `?cartes=0`. Les anciens combats 3×5 restent lisibles en cartes,
sans modifier leur géométrie, leurs règles ni leur sauvegarde.

Branche dédiée depuis la PR nº 33, tête exacte `063c9f61`, elle-même basée sur
main `9941596d`. Cette proposition dépend de la nº 33 et ne l’autorise pas à
être fusionnée. Chaque PR attend son accord spécifique. Détails et contrôles :
[EXPORT_UNIQUE_2026_10_22.md](EXPORT_UNIQUE_2026_10_22.md).
Les mentions de deux présentations et de quatre builds dans les sections
datées plus bas décrivent l’historique ; elles ne sont plus la consigne active.

# Mission de développement — Couronnes & Arcanes

## Reprendre depuis GitHub

Lire `../AGENTS.md`, `../README.md`, [l'état du projet](ETAT_PROJET.md),
la [Bible](BIBLE_DU_JEU.md) et l'architecture concernée. Vérifier le dernier main
et les PR réelles. Les dépôts GitHub du jeu et de l'atelier sont les seules
sources officielles ; aucune ancienne archive externe ne sert à reprendre ou
à synchroniser le projet. Ne pas mélanger ce CCG avec un autre projet de jeu.

## Socle existant

Les PR jeu nº 20 et nº 22 sont intégrées : même jeu tactique solo, plateau peint
plein écran, cartes sur les cases, main et cadre de lecture commun. Pose en
1/2/3, miroir adverse 10/9/8, anciennes sauvegardes 3×5 compatibles. Le contenu
est de 76 cartes, quatre classes, 12 missions, 20 étages et trois donjons.
Moteur, IA heuristique, progression, équipements, talents et sauvegardes existent
déjà. Lire leurs modules et tests avant de créer une nouvelle implémentation.

## Travail graphique actuel

Le propriétaire conserve plateau et présentation mais demande des illustrations
et animations neuves. Les anciens portraits, silhouettes, planches et accords
sont historiques. La PR Milicien nº 25 importe une carte complète v02 autorisée le 21/10/2026.
Les PR Aube nº 26, Sylve nº 27 et Ombre nº 28 sont désormais fusionnées sur
accords spécifiques ; les deux sceaux remplacent le trait de camp. La branche
Forge suivante propose dix v01 de la PR atelier nº 25, épinglées à `ceb0a916`.
Éther garde ses repères neutres. Lire l’état courant avant toute nouvelle mission. Ne pas réinstaller les anciens lots ni restaurer leur lecteur d'effets.

Commencer par une seule illustration pilote. Source, prompt, provenance, droits,
version, dimensions, poids, empreinte et accord humain exact restent dans GitHub.
Les textes et valeurs restent dynamiques. Toute future animation demande un
contrat explicite, un repli fixe et le respect du mouvement réduit. Voir la
[décision](REMISE_A_ZERO_GRAPHIQUE_2026_10_20.md) et le
[contrat d'import](INTEGRATION_GRAPHISMES.md). Aucun transfert automatique.

## Méthode et livraison

- Réaliser les changements autorisés de manière autonome sur une branche dédiée,
  conserver le concept, vérifier les dépendances et réutiliser les modules.
- Vérifier tests, parité et builds suivant AGENTS. Un changement d'interface
  demande les parcours navigateur actuels du workflow, dont cartes, déploiement,
  aperçus, base graphique neutre, sauvegarde/reprise et fonctionnement hors réseau.
  `npm run dev` sert l'entrée modulaire ; `JOUER.html` est généré pour jouer
  directement. Ne pas distribuer les HTML réservés aux tests.
- Ne pas annoncer une campagne humaine exhaustive, un smartphone physique ou un
  équilibrage final sur la seule base de tests. Documenter les limites réelles.
- Tenir l'état court, enregistrer les changements et vérifier la publication
  effective du commit. Ouvrir une PR concrète et testée.
- Chaque nouvelle PR exige un accord explicite et spécifique avant fusion,
  y compris la documentation. Aucun auto-merge ni réécriture forcée de main.

Les rapports V1 et les anciennes propositions sont des bilans datés ; ils ne
définissent ni les assets actuels, ni les tests à réactiver, ni la prochaine tâche.
