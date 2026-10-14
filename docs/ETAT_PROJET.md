# Couronnes & Arcanes — état de reprise, 14 octobre 2026

## Main vérifié avant cette reprise

- **V2.11, commit `0310fa677947e34a02bd877f5adc6104267f87ba` : PR nº 16 fusionnée le 14/10/2026.** Statistiques d'invocation partagées et fiche des capacités pour toutes les cartes déjà intégrées. Les PR nº 10, 12, 14 et 15 sont aussi fusionnées.
- **CI du main vérifiée :** [Actions #38531495638](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/38531495638), succès. Contrôle local indépendant de cette base : 258 tests, 60 parités et reconstruction de `JOUER.html` identique octet par octet.
- 76 cartes, quatre classes, 12 missions, 20 étages, trois donjons ; 25 modules, 13 portraits embarqués. Arène peinte, huit silhouettes SVG fixes ; anciens combats 3×5 conservés.
- **PR nº 11 :** ancienne arène pixel art, ouverte et en conflit. Elle ne constitue pas un composant manquant de l'arène peinte actuelle. Ne pas intégrer sans décision spécifique.

## Proposition de reprise — cinq portraits Aube

- Branche **`fix/checkup-integration-20261014`** depuis le main ci-dessus. Les cinq portraits approuvés de la PR art nº 10, commit exact `a6dd52096ada21d5eaf07234c632ada05cf710df`, sont importés avec leurs reçus et empreintes.
- Mapping dédié : `militia` → `milicien_aube` v2 ; `shield` → `porte_egide` v1 ; `cleric` → `soeur_aurore` v1 ; `paladin` → `paladin_solaire` v1 ; `banner` → `porte_etendard` v2. Aucun archétype partagé remplacé.
- 25 modules et **18 portraits** dans l'export régénéré. Les 71 autres mappings, les 76 rôles/silhouettes de combat, le cadre pilote Arbalétrière, les statistiques, règles, IA, progression et sauvegardes sont conservés.
- **Contrôles locaux exécutés :** 261 tests Node, 60 parités, builds normal/test, empreintes des cinq fichiers approuvés et reçus concordants. Simulations locales : 20 480 contrôles et 6 144 comparaisons reproductibles, aucun état invalide. Parcours Chromium complets prévus dans la CI de cette PR ; consulter son résultat exact. Le navigateur local Work n'a pas démarré ; aucun parcours local ni téléphone physique revendiqué.
- Résultats et limites : [CHECKUP_INTEGRATION_2026_10_14.md](CHECKUP_INTEGRATION_2026_10_14.md). Provenance : [INTEGRATION_GRAPHISMES.md](INTEGRATION_GRAPHISMES.md) et `assets/creatures/portraits-aube.json`.

## Suite

Faire examiner les cinq portraits dans le vrai combat et la collection. Le cadre Illustrée v3 reste limité à l'Arbalétrière ; les nouvelles cartes gardent leurs cadres actuels. Les animations du chevalier/Arbalétrière et le carreau corrigé attendent une mission avec contrat d'animation ; le prototype Blender reste en review. Audit du rythme/attrition séparé avant un nouvel équilibrage ou donjon.

GitHub et le dernier `main` sont la référence. Une branche et une PR par évolution ; accord explicite et spécifique requis avant chaque fusion, aucun auto-merge.
