# Audit de la campagne continue — 6 novembre 2026

## Parcours reproductible

Le navigateur démarre avec un stockage vide. Il ouvre le jeu modulaire en HTTP
local, démarre la première mission par l’écran de bienvenue et utilise les
commandes du jeu pour le pouvoir, la pose, les sorts et la validation des tours.
Les achats d’amélioration passent par l’Atelier entre les combats. Le parcours
garde le deck initial et joue la classe Gardien. Les animations sont désactivées
par le contrôle du jeu et Chromium applique la préférence de mouvement réduit.

Le robot prépare les actions avec le moteur commun, les récompenses et des
graines gagnantes choisies à l’avance. La graine est injectée seulement pendant
le clic de départ de la mission. Le navigateur utilise son propre profil réel
et son moteur pour chaque résolution. La lecture de la sauvegarde sert aux
assertions. Aucun profil ni résultat de combat n’est injecté.

| Mission | Graine | Tour de victoire |
| --- | ---: | ---: |
| 01 | 2 | 31 |
| 02 | 1 | 13 |
| 03 | 5 | 18 |
| 04 | 1 | 30 |
| 05 | 1 | 16 |
| 06 | 1 | 18 |
| 07 | 1 | 14 |
| 08 | 1 | 24 |
| 09 | 2 | 21 |
| 10 | 1 | 13 |
| 11 | 1 | 13 |
| 12 | 2 | 22 |

## Points vérifiés

Les parcours web modulaire et hors ligne ont été rejoués le 9 novembre 2026
sur Chromium bureau, en 233 tours chacun, depuis le jeu de la PR 100, commit
`d8ab41bbfb7ac36bd4b043b5bd4c0d19ed2a2888`. Les 812 tests Node et les
120 scénarios de parité ont réussi. Les builds web et hors ligne reproduisent
le même fichier JOUER que ce main. Le premier audit du 6 novembre avait
obtenu les mêmes résultats de progression sur la version du Feu follet.

Le parcours compare le profil complet après chaque victoire, y compris les
missions débloquées, le nombre de victoires, les exemplaires gagnés, les
améliorations, les ressources, l’expérience et la maîtrise. Il exige un reçu
propre à la mission. Les missions 01, 06 et 12 contrôlent la reprise en cours
de combat et l’égalité du profil après retour à la campagne et rechargement.
L’export final est comparé à la sauvegarde du navigateur.

Le profil observé termine après 12 victoires, avec 259 pièces d’or, 128 éclats et 480 XP.
Cette route choisie contrôle le fonctionnement de la progression. Elle ne mesure
ni l’équilibrage humain, ni la facilité à gagner avec une graine quelconque.

## Relancer le parcours

Une fois les dépendances de `scripts/requirements-ci.txt` et Chromium installés :

```sh
python3 tests/browser_campaign_journey.py
```

Le scénario utilise les modules réels du jeu en local. L’option `--offline` lance
le même contrôle sur l’export `JOUER.html` généré. Le lancement reste à la demande
en raison de sa durée. Un essai sur téléphone physique, Safari et Firefox reste
à réaliser.
