# Statistiques affichées et capacités — proposition du 14 octobre 2026

Base : main `f896a0c3aca0a6496d9a9832cbfca8bd4be9c222`, après fusion autorisée de la PR nº 15. Branche `fix/stats-capacites-combat` ; vérifier sa PR pour son état courant. La PR nº 11 reste indépendante.

## Comportement

Les chiffres de la collection, de la main et de la fiche incluent amélioration, équipement, forge, réputation et maîtrise. La main lit les bonus capturés au lancement du combat ; la collection prend les bonus du profil courant. Les changements de profil entre-temps ne changent pas les statistiques d'une bataille sauvegardée.

Exemple reproduit : Milicien avec Épée de l'Aube, Forge 1 et réputation Aube 15. L'ancien affichage donnait 2 ATQ / 5 PV ; le déploiement donnait 3 / 7. Les deux donnent maintenant 3 / 7. Les bonus temporaires du plateau (Concorde, Ralliement) continuent à être affichés sur l'unité, pas présentés comme des statistiques d'invocation.

Toute carte de la main se consulte au survol/focus ou au clic/toucher. Une carte prête se sélectionne ; sa pose exige ensuite une ligne. Une carte en attente, ou consultée après deux actions de carte, ouvre seulement sa fiche. La croix et Échap ferment la lecture sans supprimer une sélection existante. Aucune commande n'est ajoutée au portrait.

Le dock agrandit une zone de lecture réservée ; les cartes gardent leur position, les boutons restent accessibles et la fiche ne recouvre pas les cases. Description de 14 px et fermeture de 44 px de large. Les descriptions longues, traits et détails des bonus défilent dans la fiche. Le compteur initial supplémentaire des cartes historiques est masqué dans la main ; le pilote conserve son badge unique 0/1/2.

## Validation locale exécutée

- `npm test` : 258 réussites ; les nouvelles assertions comparent toutes les unités affichées au déploiement, avec et sans bonus, sur les deux géométries.
- `npm run test:parity` : 60 scénarios V2.4 identiques ; `npm run build` et `build:test` réussis, 25 modules et 13 portraits.
- Chromium Playwright 1.56.0 : pilote, capacités, statistiques, vrai toucher en mobile simulé, cartes d'unités/sorts/compétences, sélection/pose, fiche lisible, reprise ; bureau 1366×900, portrait 390×844 et paysage 844×390.
- Le parcours capacités termine la mission 01 réelle avec des coups autorisés ; il ne force ni les PV ni l'issue. Un état de main contrôlé sert auparavant à tester les capacités.
- Production `JOUER.html` : contexte hors réseau, stockage réel et rechargement, animations désactivées et mouvement réduit ; état de lecture non sauvegardé.
- Suites historiques exécutées : V2.8, V2.9, nouvelle aventure, clôture/sauvegarde, arène V2.11, combat plein écran et arène peinte, dont sources HTTP et reprises 3×5.
- `control-balance` : 20 480 combats ; `arena-balance` : 6 144 combats comparatifs, deux passes reproductibles, zéro état invalide.

Les résultats de la CI distante doivent être vérifiés sur le commit de la PR ; les résultats locaux ne constituent pas une CI. Aucun test sur smartphone physique ni nouvel équilibrage humain. Le dock réduit temporairement la hauteur visible de l'arène pendant la lecture. Les animations de personnages et l'extension des portraits ne font pas partie de cette correction.
