# Audit comparatif des talents — V2.4 (11 octobre 2026)

## Méthode reproductible

- Référence : ZIP original V2.3, non modifié ; script d’analyse identique pour l’avant et l’après.
- **14 rencontres** (10 de campagne, 2 étages de tour et 2 salles de donjon), **32 graines fixes** par rencontre, pour **448 combats par configuration**.
- Pour chaque classe : configuration sans talent, ses 4 talents individuellement et les 4 paires autorisées (palier 1 × palier 2), soit **9 configurations par classe, 36 au total**.
- **16 128 combats par version**, soit **32 256 combats simulés** pour la comparaison avant/après.
- Le héros de référence est niveau 8, avec un deck et des améliorations de milieu de progression identiques. Une heuristique fixe joue le deck et utilise le pouvoir lorsqu’il est disponible.
- **Limite majeure : il ne s’agit pas de joueurs humains.** Les pourcentages et écarts peuvent changer avec le style de jeu, le deck, la difficulté, les seeds et les décisions de talent ; des écarts de quelques points ne prouvent pas une supériorité statistique.

## Résultats des 16 talents pris séparément

| Classe | Talent | Victoires V2.3 | Victoires V2.4 |
|---|---|---:|---:|
| **Gardien (sans talent)** | — | 53,6 % | 53,6 % |
| Gardien | Rempart ancien | 53,8 % | 53,8 % |
| Gardien | Serment vivant | 55,4 % | 55,4 % |
| Gardien | Veille protectrice | 56,7 % | 56,7 % |
| Gardien | Bastion runique | 54,9 % | 54,9 % |
| **Arcaniste (sans talent)** | — | 52,9 % | 52,9 % |
| Arcaniste | Éclat concentré | 57,6 % | 57,6 % |
| Arcaniste | Voile astral | 58,0 % | 58,0 % |
| Arcaniste | Écho des étoiles | 54,7 % | 55,6 % |
| Arcaniste | Tissage vital | 54,7 % | 54,7 % |
| **Rodeur (sans talent)** | — | 54,5 % | 54,5 % |
| Rodeur | Tir précis | 54,7 % | 61,2 % |
| Rodeur | Repli couvert | 58,9 % | 58,9 % |
| Rodeur | Réserve de flèches | 75,2 % | 58,0 % |
| Rodeur | Souffle du chasseur | 56,5 % | 56,5 % |
| **Clerc (sans talent)** | — | 55,4 % | 55,4 % |
| Clerc | Main secourable | 54,9 % | 56,5 % |
| Clerc | Foi rayonnante | 60,9 % | 60,9 % |
| Clerc | Purification | 55,4 % | 58,3 % |
| Clerc | Souffle de grâce | 57,4 % | 57,4 % |

## Changements réellement appliqués

1. **Réserve de flèches — Rôdeur :** la pioche supplémentaire est limitée à **une fois par combat**, uniquement lorsqu’une carte peut réellement être piochée et que la main n’est pas pleine. Un indicateur *disponible / utilisée* apparaît en combat. L’ancien champ de sauvegarde reste optionnel (`talentDrawUsed`).
2. **Tir précis — Rôdeur :** bonus porté de +1 à **+2 dégâts sur chaque ligne effectivement touchée** par le pouvoir.
3. **Écho des étoiles — Arcaniste :** la seconde cible reçoit **2 dégâts** au lieu de 1, selon les règles habituelles d’armure.
4. **Purification — Clerc :** retire le poison **et l’immobilisation** des alliés, et ajoute **+1 bouclier** au héros (plafond inchangé).
5. **Main secourable — Clerc :** +2 PV supplémentaires à chaque allié effectivement soigné par le pouvoir, et +1 PV supplémentaire au héros.
6. **Rempart ancien — Gardien :** bouclier de départ augmenté de +2 à **+3**.

## Points de vigilance

- Le talent de pioche du Rôdeur présentait une différence de taux de victoire simulé très importante : **75,2 % → 58,0 %** après limitation, contre **54,5 % sans talent** dans le même banc de test.
- Les choix situés à proximité dans les pourcentages ne sont pas nécessairement interchangeables : soin, bouclier, contrôle et dégâts servent des stratégies différentes.
- **Main secourable** conserve un avantage situationnel surtout visible avec des unités blessées ; la simulation scriptée ne reflète pas toutes les compositions possibles.
- Il reste à tester avec de vrais joueurs, des decks variés, et de l’équipement de fin de jeu ; les données ne prouvent pas que les 16 talents sont parfaitement équilibrés.
- Pas de changement de récompenses, XP, nombres de cartes, monétisation ou structure des sauvegardes de profil.

## Reproduire

`TALENT_SEEDS=32 npm run talent-balance` lance la simulation V2.4. Les résultats intégraux (y compris les paires de talents) sont disponibles dans `docs/DONNEES_SIMULATIONS_TALENTS_AVANT_V2_3.json` et `docs/DONNEES_SIMULATIONS_TALENTS_APRES_V2_4.json`.
