# Pilote de campagne Difficile

En préparation au 14 novembre 2026. Le bouton « Jouer en Difficile » est
disponible sur les missions 6 et 12 dès leur déblocage habituel. La
composition adverse remplace un exemplaire natif par sa version évoluée.

| Mission | Carte adverse évoluée | Effet déjà présent dans le jeu |
| --- | --- | --- |
| 06 | Golem runique Légendaire | Cœur runique ajoute du bouclier à sa couronne après une interception admissible. |
| 12 | Sentinelle prismatique Divine | Garde Divine et Prisme inhibiteur protègent sa couronne et affaiblissent l’attaquant en cas d’interception admissible. |

Le combat habituel reste disponible sur la même fiche. La progression, les
gains et le premier déblocage de carte sont communs aux deux variantes.
L’état local du combat enregistre le choix Difficile. Les deux cartes
emploient leurs statistiques et pouvoirs existants.

## Comparaison automatisée

Le joueur fixe de `scripts/lib/battle_runner.mjs` utilise les tours alternés
et les profils issus de `tests/fixtures/campaign-journey.mjs` juste avant
chaque boss, achats de la mission compris. Chaque variante utilise les
mêmes 100 graines et le même profil que le combat de référence.

| Mission | Victoires en Normal | Victoires en Difficile | Renfort observé sur le plateau en Difficile |
| --- | ---: | ---: | ---: |
| 06 | 61/100 | 59/100 | 98/100 |
| 12 | 29/100 | 27/100 | 91/100 |

Le Cœur runique a été observé dans un de ces combats et le Prisme inhibiteur
dans sept, en relevant le plateau en fin de tour. Les tests ciblés vérifient
aussi les deux pouvoirs après sauvegarde et reprise. Cette mesure décrit un
seul profil de jeu automatisé. Tester en partie réelle avant de régler les
écarts entre difficultés ou d’ajouter une variante Facile.
