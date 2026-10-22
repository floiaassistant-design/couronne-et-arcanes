# Un seul affichage et un seul export — proposition du 22 octobre 2026

Le propriétaire souhaite conserver uniquement les cartes sur le plateau.
`JOUER.html` devient l’unique fichier distribué. Il contient le même jeu complet
que l’ancien `ESSAI_CARTES.html`, avec les 42 illustrations embarquées et le
fonctionnement hors réseau. L’entrée web `index.html` utilise la même vue.

## Périmètre

- Retrait de la vue personnages : rendu des silhouettes, bouton de bascule,
  lecture/écriture de la préférence et variantes classiques de la fiche.
- Retrait de 60 sélecteurs CSS propres aux éléments supprimés, en conservant
  les règles partagées du plateau et les ancrages des cartes. La rareté de la
  main garde sa couleur de contour, indépendante de la disponibilité.
- Suppression d’`ESSAI_CARTES.html` et de `build:cards`. Deux compilations
  restent : production `JOUER.html` et diagnostic `tests/JOUER.test.html`.
  Le diagnostic garde ses points d’accès de test et n’est jamais distribué.
- Fiche flottante : fermeture tactile de 44 pixels et limitation au-dessus de
  la carte en main sur écran étroit, pour préserver sa sélection.
- Une seule tâche CI conserve les 20 parcours navigateur fonctionnels et le
  contrôle de synchronisation du HTML. Le second environnement d’installation
  et les deux compilations redondantes disparaissent.
- L’ancien choix graphique `off` et les paramètres `?cartes=0` n’activent plus
  un autre rendu. Aucun profil ni combat n’est réinitialisé ou converti.

## Contrats conservés

Moteur, IA, catalogue, progression, récompenses, registres d’images et fichiers
WebP ne sont pas modifiés. Les anciennes sauvegardes 3×5 gardent leurs dimensions
et leurs règles ; leurs unités utilisent désormais les cartes. Les nouveaux
combats gardent 2/3/4 lignes et dix cases. Pose, survol/focus, fermeture au clic,
animations désactivées, mouvement réduit et sauvegarde/reprise restent couverts.
Les 29 modules conservent leurs responsabilités, sans nouveau module ni cycle.

## Vérification

- Local : `npm test`, 300 tests réussis ; `npm run test:parity`, 60 instantanés
  historiques identiques ; builds production et diagnostic exécutés.
- Local : les 20 scripts Chromium du workflow ont réussi après adaptation de
  leurs attentes à la vue cartes. Ils couvrent bureau, portrait et paysage
  simulés selon chaque parcours, vrai export sans réseau et entrée web.
- Export régénéré depuis les sources sur GitHub, empreinte identique à la copie
  locale. La CI du head final est suivie dans la PR ; aucun résultat de tête
  antérieure n’est présenté comme celui de la version finale.
- Les attentes portant sur les étiquettes de l’ancienne vue sont remplacées
  par les vrais labels accessibles des cartes et les sceaux des deux camps.
  Les contrôles métier et la référence de parité ne sont pas relâchés.
- Aucun téléphone physique ni équilibrage humain exhaustif revendiqué.

## Dépendance et limites

Branche dédiée depuis `063c9f61eb29b6732d5b0c42f3043b8a8b67b731`, tête de la PR nº 33.
Main de référence : `9941596d16e39d7f48fc0b082ee41b77e5d573b7`. La PR de cette
simplification cible la branche de la nº 33 pour ne montrer que cette évolution.
La nº 33 et cette PR nécessitent chacune leur accord de fusion ; aucune fusion
ni auto-merge n’est déclenché. Les suppressions restent consultables dans Git.

Le bénéfice porte sur l’entretien et la distribution : un affichage actif,
un HTML distribué, deux builds au lieu de quatre. Aucune économie chiffrée de
quota ou de temps de calcul n’est revendiquée ; le moteur était déjà commun et
les parcours fonctionnels utiles sont conservés. Les documents datés décrivant
deux affichages restent des éléments historiques, pas des consignes actives.
