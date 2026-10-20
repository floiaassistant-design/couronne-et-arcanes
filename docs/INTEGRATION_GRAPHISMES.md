# Contrat de la nouvelle production graphique

La décision du 20 octobre 2026 retire les anciens portraits, animations et
planches de la production active. Voir
[la remise à zéro](REMISE_A_ZERO_GRAPHIQUE_2026_10_20.md).

## Conserver la structure

Le plateau peint, la géométrie, les cadres et les interactions de la base PR nº 20
restent la référence technique. Le moteur fournit noms, attentes, descriptions,
statistiques et états. Ne pas peindre ces valeurs dans l'image.

## Importer un nouveau visuel

1. Préparer dans l'atelier une source originale et un export optimisé.
2. Obtenir une validation humaine spécifique sur la version exacte.
3. Conserver provenance, droits, version, dimensions, octets et SHA-256.
4. Déclarer la nouvelle clé dans `assets/artwork.json` et `src/visuals.js`.
5. Ajouter le reçu humain dans le dépôt du jeu ; le builder compare la version
   et l'empreinte. Aucun fichier inconnu n'est embarqué silencieusement.
6. Examiner toutes les cartes qui utilisent une association partagée.
7. Vérifier bureau/mobile, reprise, images manquantes et JOUER hors réseau.

L'état initial ne contient aucun visuel de personnage approuvé. Les emplacements
neutres permettent de jouer ; ils ne valent pas validation artistique.

Toute animation future demande un nouveau contrat (dimensions, ordre, durée,
boucles, ancrage, orientation et poids), un repli statique et le respect du
mouvement réduit. Elle suit les événements calculés et ne modifie pas le combat.
