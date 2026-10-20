# Présentation cartes — base conservée pour la refonte

Le code de présentation vient de la PR nº 20 à `30379a08`, intégrée sur main.
La remise à zéro nº 22 est également intégrée ; voir [l’état actuel](ETAT_PROJET.md). Cette remise à zéro
conserve son plateau peint, ses vrais emplacements, la main intégrée, les cadres
HTML/CSS et l'aperçu partagé au survol/focus. Clic ou toucher ferme la fiche
pendant la sélection et la pose. Les vraies statistiques viennent du moteur.

La règle de pose en 1/2/3 et le miroir 10/9/8 appartiennent déjà à cette base.
Les sauvegardes 3×5 gardent leur entrée historique. La remise à zéro n'ajoute
aucune règle ni donnée de profil.

Les cinq anciens portraits du lot Aube sont retirés, comme les treize portraits
de la version antérieure. Les deux modes d'affichage utilisent des repères
neutres. `JOUER.html` et `ESSAI_CARTES.html` restent le même jeu, ce dernier
ouvrant la vue cartes. Le registre `assets/artwork.json` est initialement vide.

[Décision graphique actuelle](REMISE_A_ZERO_GRAPHIQUE_2026_10_20.md).
Les anciennes études sont récupérables dans les commits et ne sont plus des
livraisons à importer. Les contrôles de survol, toucher, clavier, pose, reprise,
mouvement réduit et hors réseau doivent continuer à passer.
