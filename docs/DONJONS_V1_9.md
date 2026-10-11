# Donjons V1.9 — Spécification jouable et contrôles

## Contenu réellement implémenté

| Donjon | Salles | Boss final | Récompense du premier achèvement |
| --- | --- | --- | --- |
| Racines d’Ysara | Entrée moussue → Sanctuaire vert → Cœur noueux | Ancien des Profondeurs | Archidruide Feuillage |
| Fonderie des Cendres | Hauts-Fours → Machine éveillée → Trône de Fer | Colosse du Soufre | Canon des Terres Rouges |
| Cryptes de Minuit | Ossuaires → Palais englouti → Cour sans Soleil | Reine des Sépulcres | Vampire d’Obsidienne |

Les 9 affrontements réutilisent le catalogue de cartes et des compositions issues des rencontres existantes avec des noms, HP, difficultés et stratégies d'IA propres. Pas de lieux explorables en temps réel ni de coopération dans cette version.

## Cycle d'une expédition

1. Cliquer **Donjons** puis **Entrer dans le donjon**. Le premier est disponible immédiatement ; le deuxième et le troisième se débloquent après la victoire sur le précédent.
2. Terminer la première bataille. Les gains d'or et d'éclats sont enregistrés dès la victoire.
3. Le souverain conserve ses PV survivants, plus 6 PV de repos (sans dépasser le maximum) ; il entame la salle suivante avec cette endurance.
4. En cas de défaite, l'expédition s'arrête, les récompenses déjà obtenues restent acquises et une nouvelle tentative commence à la salle 1.
5. Après le boss final, un bonus de fin de donjon est gagné et une carte spécifique est attribuée **uniquement lors du premier achèvement**.
6. Une expédition en cours peut être mise en pause entre les salles ; sa progression est conservée dans le profil. La bataille active reste enregistrée dans l'ancienne sauvegarde de combat.

## Robustesse

- Les fonctions de récompenses vérifient `missionId`, `dungeonId`, `dungeonStage` et l'état actif du profil ; une salle déjà validée ne peut pas être rémunérée à nouveau.
- Éviter de modifier les identifiants de donjon et leurs ordres après publication : ils sont stockés dans les sauvegardes.
- Les clés de sauvegarde restent `couronnes_arcanes_v1` et `couronnes_arcanes_bataille_v1`.
- Tests unitaires `tests/dungeons.test.mjs`, interface `tests/browser_dungeons.py` en Chromium avec stockage simulé ; **ne pas prétendre** à un test sur appareil physique ou serveur réel.

## En cours / non implémenté

- Coopération, serveur, matchmaking, échanges, donjons procéduraux, séquences scénarisées entre les salles et embranchements de choix.
