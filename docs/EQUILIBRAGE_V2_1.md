# Équilibrage V2.1 — Mesures et décisions (11 octobre 2026)

## Méthode reproductible

Commande depuis le projet : `npm run balance -- --summary`, `npm run balance -- --mid --summary`, `npm run balance -- --developed --summary`.

Le banc d’essai exécute **32 rencontres distinctes × 40 graines prédéfinies = 1 280 combats isolés par profil**, soit **3 840 combats** pour les trois profils finaux. Les profils débutant et avancé ont été mesurés avec **exactement les mêmes 2 560 combats** avant et après. Un bot fixe choisit ses cartes suivant une heuristique de ligne, déclenche son pouvoir de héros disponible et respecte les deux cartes par tour ; les combats de donjons sont ici **indépendants**, sans report réel des PV entre salles. Ce n’est PAS un taux de victoire de joueurs réels, ni une preuve d’équilibrage du jeu complet.

| Profil | Avant V2.0 | Après V2.1 |
|---|---:|---:|
| Départ, sans amélioration | 227/1 280 = **17,7 %** | 232/1 280 = **18,1 %** |
| Intermédiaire (1 bastion, deux cartes améliorées) | Non mesuré | 336/1 280 = **26,3 %** |
| Avancé (équipement, bâtiments, réputation, cartes améliorées) | 1 046/1 280 = **81,7 %** | 1 059/1 280 = **82,7 %** |

Le taux **global** agrège les 12 missions, 5 étages représentatifs, 9 salles de donjon et 6 embuscades : il ne mesure pas la courbe de progression d’un joueur. La difficulté élevée des rencontres avancées explique en partie les résultats bas du deck débutant.

## Ajustements réellement intégrés

1. Campagne 01 : PV du héros adverse **17 → 15**, afin d'adoucir la première victoire (bot débutant : **45 % → 50 %**).
2. Campagne 03, premier boss : **24 → 21 PV**. La difficulté reste sensible (bot débutant **15 % → 20 %**, profil intermédiaire **30 %**), invitant à utiliser la forge et les premières améliorations.
3. Campagne 11 : adversaire **36 → 34 PV**, difficulté des cartes ennemies **5 → 4**, un dragon du deck remplacé par un élémentaire. Bot avancé : **13 % → 43 %**, tandis que le boss final 12 n'a pas été affaibli.
4. Tour 1 à 4 : **−2 PV** au héros adverse. Étages 5 et suivants, y compris boss, inchangés.
5. Donjon Ysara, boss : **28 → 26 PV**. Les autres boss des donjons sont conservés.
6. Embuscade facultative : or **45 + 15 × étape → 85 + 15 × étape** ; éclats **20 + 6 × étape → 32 + 8 × étape**. À l'étape 1 : **100 or / 40 éclats** contre coffre sûr de **45 or / 17 éclats** ; à l'étape 2 : **115 / 48** contre **55 / 22**. L'embuscade implique toujours un combat, une perte possible de PV et la fin du donjon en cas de défaite. Le gain est toujours versé une fois, uniquement après victoire.

Le choix de coffre et de repos est inchangé ; aucune monnaie réelle, amélioration payante, bonus caché ni modification des sauvegardes. L'interface lit désormais le gain d'embuscade directement dans `dungeonBonusMission` pour rester synchronisée avec le moteur.

## Limites / prochaine vérification

- Aucun test utilisateur, téléphone réel ou instrumentation de télémétrie. Tester manuellement au moins 5 expéditions complètes et 5 passages des missions 03, 06, 11, 12.
- Le profil intermédiaire reste faible en fin de campagne : il faut gagner de nouvelles cartes et équipements pour avancer ; l’équilibre de cette progression n'est pas encore démontré.
- Le banc d’essai n'évalue pas l'endurance des donjons de bout en bout, les récompenses par heure ni la variété des decks optimisés. Il sert à détecter les **grandes ruptures** et à comparer exactement les mêmes paramètres entre versions.
- Ne pas interpréter les pourcentages comme des prévisions de victoire individuelle.
