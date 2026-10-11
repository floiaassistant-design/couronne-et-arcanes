# Progression V2.2 — Spécification technique

## Philosophie
Les ressources achetées/farmées en V2.1 sont conservées. La V2.2 ajoute de la progression visible, mais ne doit pas accentuer trop fortement le différentiel entre un débutant et un joueur avancé.

## Héros
- `heroXp` est stocké dans le profil, initialisé à 0 pour les anciens profils.
- Niveaux 1 à 12 inclus. Seuils cumulés : `40 × n + 6 × n × (n−1)` avec `n = niveau − 1`.
- Victoire : `22 + 6 × difficulté` XP ; défaite après au moins 3 tours et une carte jouée : 5 XP ; abandon immédiat : 0.
- Niveaux 5 et 9 : chacun +1 bouclier au début d'un **nouveau** combat, soit +2 maximum. Les statistiques permanentes n'évoluent pas pendant une bataille commencée.
- Aucun don automatique d'or ou d'éclats avec les niveaux.

## Maîtrise des cartes
- Chaque carte du joueur jouée avec succès pendant un combat contribue, lors du règlement de ce combat : `min(2, nombre de fois jouée) + (victoire ? 1 : 0)` XP.
- Défaites prématurées : aucun XP. La maîtrise des ennemis n'augmente jamais le profil du joueur.
- Rangs 0/1/2/3 pour 0/4/10/22 XP cumulé. Rang 3 : +1 PV aux **unités uniquement**, à partir du combat suivant. Les sorts ne reçoivent qu'un insigne visuel.
- Le rang ne remplace pas les améliorations existantes (`upgrades`), ni les bonus de réputation ou d'équipement.

## Intégrité et migration
- `normalizeProfile` supprime les entrées de maîtrise inconnues, non numériques, négatives, et borne la quantité d'expérience.
- `battle.progressionGranted` évite de réattribuer la récompense deux fois pour le même combat, et `settleDungeonBattle` exige toujours que l'étape soit active.
- Les clés de sauvegarde historiques sont inchangées. Les gains sont sauvegardés uniquement à la conclusion d'un combat valide.

## Tests
- Tests ciblés : `tests/progression_v22.test.mjs` et `tests/browser_progression_v22.py`.
- Base non réécrite : tests du moteur 2.1, déplacements et compétences, donjons/embuscades, stratégies des ennemis, illustrations.
- Tests navigateur sur Chromium desktop et mobile simulés ; la sauvegarde est testée par réouverture avec stockage réinjecté (pas un test sur un appareil physique).
