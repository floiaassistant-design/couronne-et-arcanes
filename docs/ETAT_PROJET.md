# Couronnes & Arcanes — état de reprise, 14 octobre 2026

## Actualisation du 20 octobre — PR nº 20 corrigée

Main vérifié : `0310fa677947e34a02bd877f5adc6104267f87ba` (PR nº 16 intégrée). La PR nº 20 reprend désormais le vrai jeu et son plateau peint avec des cartes dans les cases. Le premier essai à six unités préplacées est retiré. Main, délais, pose, avancée, couronnes, IA, modes et progression conservés ; vue réversible par un bouton. Cinq portraits approuvés à clés dédiées opt-in ; aucun archétype partagé remplacé. Local : 262 tests, 60 parités, builds normal/essai. Nouvelle CI navigateur à vérifier sur cette correction. Les PR nº 17–19 restent distinctes ; aucune fusion autorisée. Voir [ESSAI_CARTES_2026_10_20.md](ESSAI_CARTES_2026_10_20.md).

- **Main officiel : V2.11, commit `f896a0c3aca0a6496d9a9832cbfca8bd4be9c222`.** PR nº 15 fusionnée sur autorisation spécifique du propriétaire. PR nº 14 (arène peinte et plein écran) déjà intégrée ; PR nº 10 (sauvegardes) et nº 12 (nouvelle aventure/classes/rareté) conservées.
- **76 cartes, quatre classes, 12 missions, 20 étages, trois donjons.** Règles et statistiques de combat inchangées. Dix cases par ligne, deux/trois/quatre lignes ; anciennes batailles 3×5 préservées.
- **Graphismes officiels :** 13 portraits, dont Arbalétrière approuvée SHA-256 `31186adc9ea55c4d34777f70f8b5fe2969a1ea0386a74d1cf44183e931c391a3`. Seul `archer` utilise `arbaletriere_aube` ; `skill_ranger_pierce` conserve `archer.webp`. Arène peinte fixe, huit silhouettes SVG, aucun personnage animé image par image intégré.
- **PR nº 15 vérifiée avant fusion :** tête `da251bc`, CI #38453860186 réussie, 253 tests, 60 parités, build et parcours bureau/mobile. La fiche n'a aucun bouton sur le portrait.
- **PR nº 11 :** ancienne arène pixel art toujours ouverte et en conflit ; distincte du rendu peint courant. Ne pas l'intégrer sans décision spécifique.

## Proposition courante — statistiques et capacités

- Branche **`fix/stats-capacites-combat`**, depuis le main `f896a0c3` ; vérifier sa PR pour son statut réel. Aucune fusion autorisée pour ces nouvelles corrections.
- Statistiques d'invocation partagées entre moteur, main, collection et fiche ; équipement, forge, réputation et maîtrise inclus. La main respecte l'instantané du combat sauvegardé.
- Consultation de toutes les cartes, sorts et compétences en attente : texte de 14 px, détails des bonus, croix/Échap, sélection et pose conservées. Zone réservée au-dessus des cartes, sans bouton sur le portrait.
- Deux modules ajoutés : `engine/unit-stats.js` et `ui/card-inspection.js`. 25 modules et 13 portraits dans `JOUER.html`, régénéré depuis les sources. Clés et schéma de sauvegarde conservés ; état de lecture transitoire.
- **Contrôles locaux exécutés :** 258 tests Node, 60 parités, builds, neuf suites Chromium bureau/mobile, vrai toucher simulé, mission 01 terminée, reprise et production hors réseau/mouvement réduit. Simulations : 20 480 contrôles et 6 144 comparatifs d'arène, reproductibles et sans état invalide. CI distante à vérifier sur la PR, aucun téléphone physique testé.
- Contrat et résultats : [STATISTIQUES_CAPACITES.md](STATISTIQUES_CAPACITES.md). Provenance du pilote : [INTEGRATION_GRAPHISMES.md](INTEGRATION_GRAPHISMES.md).

## Suite

Faire examiner la lecture du pilote en partie avant la généralisation artistique aux cinq portraits Aube restants. Puis contrat d'animations pour les séquences approuvées ; audit séparé du rythme/attrition avant tout nouvel équilibrage ou donjon.

GitHub et le dernier `main` sont la référence. Une branche et une PR par évolution ; accord explicite et spécifique requis avant chaque fusion, aucun auto-merge.
