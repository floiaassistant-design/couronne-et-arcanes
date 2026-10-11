# Arbres de talents — V2.3

## Principes

Chaque classe dispose de deux paliers (niveau 4 et niveau 8) et de deux options à chaque palier. Le joueur choisit **une option par palier**, pour au maximum deux talents actifs. Changer d'option est **gratuit**, mais n'affecte que les combats suivants. Les choix restent propres à chaque classe. L'IA ne reçoit pas de bonus de talent.

| Classe | Niveau 4 — choix 1 | Niveau 4 — choix 2 | Niveau 8 — choix 1 | Niveau 8 — choix 2 |
|---|---|---|---|---|
| Gardien | Rempart ancien : +2 boucliers au départ | Serment vivant : pouvoir soigne +2 PV héros | Veille protectrice : pouvoir soigne +2 PV l'allié le plus blessé | Bastion runique : pouvoir donne +1 bouclier |
| Arcaniste | Éclat concentré : pouvoir +1 dégât | Voile astral : pouvoir donne +2 boucliers | Écho des étoiles : 1 dégât à une deuxième unité | Tissage vital : pouvoir soigne +2 PV héros |
| Rôdeur | Tir précis : pouvoir +1 dégât par ligne touchée | Repli couvert : pouvoir donne +2 boucliers | Réserve de flèches : pouvoir pioche 1 carte (max 7 en main) | Souffle du chasseur : pouvoir soigne +2 PV si une unité a été touchée |
| Clerc | Main secourable : pouvoir soigne +1 PV de plus par allié visé | Foi rayonnante : pouvoir donne +2 boucliers | Purification : pouvoir retire le poison des alliés | Souffle de grâce : pouvoir soigne +2 PV héros |

Les valeurs respectent les plafonds existants de PV, boucliers et cartes. Les talents n'ajoutent pas de dégâts permanents aux cartes, ne modifient pas les récompenses et ne nécessitent aucun paiement.

## Architecture

- **Fichier de définition** : `src/talents.js` exporte `TALENT_TREE`, `TALENT_LEVELS`, `normalizeTalentChoices`, `chosenTalents`, `talentInfo`.
- **Validation** : `src/engine.js` exporte `chooseHeroTalent`. Les ID invalides, talents d'autres classes ou paliers verrouillés sont refusés.
- **Sauvegarde** : `profile.talents` est optionnel ; son contenu est nettoyé lors de l'import. Une ancienne sauvegarde sans talents reste valide. La clé locale n'est pas modifiée.
- **Combats** : `createBattle` fige `heroTalents`. Un ancien combat sans ce champ se joue sans talent et reste compatible.
- **Rendu** : le joueur sélectionne ses talents dans Atelier, où les branches inaccessibles sont bloquées ; les choix actifs sont rappelés dans le panneau de combat.
- **Fichier autonome** : `scripts/build_standalone.mjs` inclut le module de talents avant le moteur ; toutes les données sont locales.

## Validation

`npm test` (98 tests), `python3 tests/browser_talents_v23.py`, `python3 tests/browser_progression_v22.py`, `python3 tests/browser_smoke.py`, `python3 tests/browser_dungeons.py`, `python3 tests/browser_events_v20.py`, `python3 tests/browser_vfx.py`.

Limites : équilibre statistique des talents encore à mesurer ; aucune version serveur, aucun compte ou PvP. Les tests de rechargement utilisent un stockage simulé dans Chromium, pas un vrai appareil.
