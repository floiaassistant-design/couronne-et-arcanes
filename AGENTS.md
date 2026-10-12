# AGENTS.md — Couronnes & Arcanes

## Version stable et coordination multi-sessions — PRIORITAIRE

- **Base courante : V2.11, issue de V2.10, PR nº 6 fusionnée le 12/10/2026 (commit `51c4d7ab`)**. Avant tout travail, lire `AGENTS.md`, `docs/ETAT_PROJET.md`, consulter la branche et son dernier commit, et vérifier les sources de `src/`.
- **Ne jamais copier une ancienne version par-dessus la dernière version.** La copie V1.2 avait écrasé huit fichiers de V2.7 le 11/10/2026 ; les fichiers ont été récupérés depuis le commit local `145a2e8`.
- **Une branche par agent/session** lorsque plusieurs agents développent en parallèle. Un seul intégrateur prépare la fusion après comparaison des modifications et exécution des tests, **sans jamais fusionner avant l'accord explicite de l'utilisateur**.
- **Anti-écrasement :** vérifier l'état GitHub avant chaque publication ; si la branche cible a avancé, réconcilier les changements utiles sur la branche de travail et ne jamais forcer la réécriture de l'historique. Ce travail ne constitue jamais une autorisation de fusionner sur `main`.
- **Fin de session :** tests, documentation de l'état, journal des changements, commit explicite, export autonome si nécessaire.
- **Source de vérité :** GitHub pour les sources de développement, `JOUER.html` généré depuis ces sources pour jouer, Drive pour les archives. Une archive sur Drive n'est pas automatiquement synchronisée avec GitHub.

## Fusion sur `main` uniquement après validation explicite — POLITIQUE PRIORITAIRE

- **Aucune fusion automatique ou autonome.** Les agents, Work, Codex et les outils GitHub ne doivent jamais déclencher une fusion sur `main` simplement parce que les tests sont verts, qu'une évolution a été demandée, ou que le joueur n'a pas signalé de défauts.
- **Une branche et une pull request par évolution.** L'agent peut coder, tester, pousser sur sa branche, ouvrir une PR et proposer son intégration. Il doit **s'arrêter avant toute fusion**, présenter le résumé des changements, le lien de PR, les tests réellement exécutés et les risques éventuels.
- **Accord obligatoire pour chaque PR :** seule une instruction explicite et spécifique de l'utilisateur du type « fusionne cette PR » ou une fusion effectuée directement par l'utilisateur dans GitHub autorise l'intégration sur `main`. Un « vas-y », « continue », « améliore le jeu » ou « lance les tests » **n'autorise pas** la fusion. Un accord sur une PR ne s'étend jamais aux PR suivantes.
- **Interdictions :** ne pas activer GitHub Auto-merge, ne pas programmer de workflow/bot de fusion, ne pas utiliser une commande de fusion avant validation humaine. Cette règle s'applique également aux correctifs, à la documentation et aux modifications de la présente politique.
- **Contrôles avant proposition :** relire le diff, comparer au `main` actuel, vérifier les sauvegardes historiques, l'équilibrage et les tests pertinents ; exécuter `npm test`, `npm run test:parity` lorsque les règles sont inchangées, `npm run build`, vérifier `JOUER.html` et effectuer des parcours navigateur desktop/mobile si l'interface change. Ne jamais qualifier une CI absente, incomplète ou rouge de « verte ».
- **Après autorisation explicite uniquement :** revérifier le commit `head`, la branche cible, les tests, les éventuels conflits et les mises à jour depuis la revue. Ne jamais écraser `main` ni forcer l'historique. Si la PR a changé ou si un contrôle échoue, suspendre et demander une nouvelle décision au besoin.
- **Continuité :** le joueur teste quand il le souhaite ; les évolutions peuvent rester sur des branches et des PR ouvertes sans être fusionnées. À chaque fin de session, enregistrer le code et l'état du travail sur la branche, sans publier une nouvelle version stable sans accord.

## Règle permanente — architecture modulaire et qualité du code

**Priorité à chaque mission de développement.** Cette section s'applique à toutes les futures versions et prévaut sur les indications d'architecture des sections historiques plus bas. Conserver des fichiers compréhensibles et une architecture cohérente au fil des ajouts, pas seulement lors d'une refonte ponctuelle.

1. **Une responsabilité par module.** Placer chaque fonction dans le module qui porte le métier concerné ; séparer strictement combat, IA, progression, récompenses, données, interface, animations et sauvegardes. Le moteur ne doit pas dépendre du DOM.
2. **Éviter les gros fichiers.** Viser *en général* moins de **300 à 400 lignes par fichier source**. C'est un signal de révision, **pas une limite stricte** : ne pas découper artificiellement des fonctions ou produire des dizaines de micro-modules sans valeur.
3. **Réutiliser avant de créer.** Chercher les fonctions, structures et composants existants avant d'ajouter un module ; ne pas dupliquer des calculs, règles métier, validations ou données partagées.
4. **Limiter le couplage.** Préférer des interfaces explicites et des dépendances dans un sens clair ; éviter les imports circulaires, les accès globaux et les dépendances cachées. Ne pas déplacer le comportement métier dans `app.js` ou dans la façade `engine.js`.
5. **Refactoriser au bon moment.** Si une fonctionnalité agrandit excessivement un module ou mélange plusieurs responsabilités, proposer puis réaliser un **découpage ciblé**, avec tests de non-régression. Ne pas lancer une refonte générale sans nécessité.
6. **Préserver le fonctionnement.** Ne pas modifier involontairement les règles du jeu, l'équilibrage, les API publiques, les identifiants de cartes, les anciens profils ni les clés de sauvegarde. Toute migration de schéma doit être explicite et testée.
7. **Préserver la distribution.** Maintenir le jeu web modulaire **et** le générateur de `JOUER.html` autonome hors ligne. Lorsqu'un module est ajouté, vérifier qu'il est intégré à la compilation et que les illustrations restent embarquées.
8. **Tester avant de livrer.** Ajouter des tests ciblés pour les nouvelles responsabilités, exécuter `npm test`, `npm run test:parity` lorsque les règles ne doivent pas changer, `npm run build`, puis des parcours navigateur pertinents. Ne déclarer réussies que les vérifications réellement exécutées.
9. **Documenter la structure.** Actualiser `AGENTS.md`, `docs/ARCHITECTURE_MODULAIRE_V2_5.md` ou son successeur, et `docs/ETAT_PROJET.md` **uniquement lorsque la structure ou l'état du projet évolue** ; expliquer le rôle de tout nouveau module.
10. **Privilégier lisibilité et stabilité.** Un fichier légèrement plus long mais cohérent vaut mieux qu'un découpage confus. Les performances, la simplicité et la capacité d'un nouvel agent à reprendre le travail priment sur un quota arbitraire de lignes.

**Contrôle préalable obligatoire :** identifier les modules concernés, leurs dépendances et tests avant de coder. **Contrôle final obligatoire :** rechercher les doublons, les responsabilités mélangées, les imports circulaires et les fichiers devenus trop volumineux ; les réorganiser si utile, puis documenter les exceptions justifiées.

## V2.11 — arène et géométrie (intégrée sur main)

- La mission arène impose une PR **sans fusion automatique** ; elle prévaut ici sur la politique générale. Ne pas intégrer cette branche sans instruction ultérieure.
- `src/engine/board.js` est le propriétaire des dimensions. Les tableaux sauvegardés déterminent les cases et lignes ; ne jamais utiliser `LANES`/`WIDTH` comme limites d’un combat déjà créé.
- Nouveaux combats : dix cases (colonnes 1–10), couronnes en 0/11 ; 2 lignes difficulté 1–2, 3 lignes difficulté ≥3, 4 pour un boss. Anciens combats 3×5 : garder exactement le tableau, couronnes 0/6.
- `src/ui/arena-art.js` fournit l’art SVG en pixels partagé par rôle, sans règles métier. L’export doit embarquer ce module et rester sans réseau.
- Tests historiques dont les positions sont codées en 3×5 utilisent `tests/fixtures/legacy-battle.mjs`. Ne pas modifier leurs assertions ni la référence de parité pour masquer un échec. `tests/arena_v211.test.mjs` couvre les nouvelles dimensions, les capacités en colonnes 6–10 et les sauvegardes.
- Contrôler `browser_arena_v211.py` sur desktop, mobile portrait/paysage ; préserver le défilement après rendu et mapper les VFX aux bonnes couronnes. Aucun événement VFX en stockage.
- `npm run arena-balance` compare les deux géométries et exige deux passes identiques. Les nouveaux combats plus longs et l’attrition plus fréquente sont une conséquence connue, pas une preuve d’équilibrage humain. Voir `docs/ARENE_V2_11.md`.

## V2.10 — compte à rebours tactique

- `src/engine/tempo.js` réalise exclusivement le ciblage et la modification déterministes des valeurs `wait` de la main ; les propriétés existantes de sauvegarde restent intactes.
- Élan des Heures (`hourglass_surge`) : −2 tours sur la carte alliée la plus lente (égalité : premier indice), interdit sans cible.
- Nœud du Temps (`time_bind`) : +2 tours sur la carte adverse la plus proche d'être disponible (égalité : premier indice), plafond 6, identité non révélée dans le journal ; interdit sans cible éligible.
- Le moteur peut cibler la main adverse lors de la résolution ; `src/ai.js` n'a jamais accès au contenu de la main privée du joueur pour ses choix.
- Tests dédiés : `tests/tempo_v210.test.mjs` + contrôles historiques, build synchronisé et navigateur. Aucun remplacement d'anciennes données de carte.

## V2.9 — contrôles du champ de bataille

- `src/engine/battle-control.js` porte silence, téléportation, pièges et plans de ciblage purs, partagés par `battle.js`, `ai.js` et `ui/battle-view.js`. Il ne dépend ni du moteur ni de l'IA : conserver ce sens de dépendance.
- Silence suspend uniquement les capacités déclenchées ; armure, Distance, Vol, Garde, Concorde et effets déjà appliqués restent actifs. Maximum deux résolutions, puis une résolution de répit ; ne pas empiler/renouveler un silence.
- Téléportation latérale : même colonne libre, aucune arrivée devant la couronne adverse, une fois par unité et par tour. Réutiliser `teleportPlan` pour l'aperçu et l'IA, et le hook d'entrée pour les pièges.
- Pièges publics : deux par camp, cases 2–4, trois résolutions maximum ; retirer avant d'appliquer leurs effets. Utiliser `hit` du moteur, conserver propriétaire/expiration et ne pas sauvegarder les VFX.
- Les propriétés `traps`, `silenceUntil`, `silenceGuardUntil`, `teleportedRound` et `controlReadyRound` sont facultatives ; ne pas les imposer aux anciens combats ni réinitialiser un profil.
- Les decks historiques de Tour sont filtrés pour rester stables lors de l'extension du catalogue. Ne pas remplacer la référence de parité V2.4 ; `tests/fixtures/catalogue_v28.json` fige les 68 cartes et rencontres V2.8.
- Tests : `tests/battle_control_v29.test.mjs`, `tests/browser_battle_control_v29.py`, contrôles V2.8, parité et build. `npm run control-balance` utilise le simulateur partagé et des profils fictifs ; rapport et limites dans `docs/BATTLE_CONTROL_V2_9.md`.

## V2.8 — compétences exclusives (version historique)

- Cartes V2.8 dans `src/data.js` (`CLASS_SKILLS`) : huit sorts réservés aux quatre classes, sans modifier les 60 anciennes cartes.
- Effets et validation de cible dans `src/engine/class-skills.js`, consommation des actions et dégâts dans `src/engine/battle.js`, coût d'apprentissage dans `src/engine/economy.js`.
- Changer de classe impose de retirer les compétences incompatibles du deck actif ; ne pas supprimer les exemplaires appris.
- Aucun champ obligatoire ajouté aux sauvegardes ; les anciens combats restent jouables sans `barrier` ni `rallyUntil`.
- Vérifier les nouvelles capacités avec `tests/class_skills_v28.test.mjs`, les tests historiques et la parité avant fusion.

## V2.7 — comparateur de compositions (version courante)

- Lire `docs/DECK_BALANCE_V2_7.md` avant de modifier les styles, le nombre de sorts, la pioche ou les scores de cartes.
- `scripts/lib/battle_runner.mjs` centralise le joueur automatisé pour les comparateurs V2.1, V2.4 et V2.7 ; ne pas recréer un troisième automate au sein d'un autre script.
- `scripts/lib/deck_scenarios.mjs` contient des **collections fictives réservées aux simulations**, jamais des cartes attribuées au joueur.
- Comparer au minimum les quatre archétypes sur des collections différentes, avec **les mêmes graines et rencontres**, avant d'affirmer qu'une composition est meilleure.
- Les résultats de bots **ne prédisent pas** la performance humaine : ne pas introduire d'avantages cachés ou de changements d'équilibrage non mesurés.
- `.github/workflows/test.yml` prépare les tests GitHub Actions ; un fichier local **n'est pas une preuve de push ni d'exécution CI**. Ne jamais confondre le Git local et le dépôt distant.

## V2.6 — atelier de compositions (version historique)

- Lire `docs/COMPOSITIONS_DECKS_V2_6.md` et `docs/ARCHITECTURE_MODULAIRE_V2_6.md` avant les modifications d'archétypes de deck.
- `src/engine/deck-builder.js` est le **seul** propriétaire des propositions automatiques et des statistiques de composition. Il dépend des données des cartes et de la validation existante ; il n'a ni DOM, ni stockage, ni effets secondaires lors d'une prévisualisation.
- Ne jamais créer gratuitement des cartes via les modèles : respecter `profile.collection`, contrôler le deck avant application. Le clic de prévisualisation ne doit rien modifier ; seul un clic explicite sur la confirmation remplace `profile.deck` hors combat.
- Les quatre styles doivent rester réellement distincts pour le deck initial et pour une collection avancée. Mesurer les combats par type de deck avant d'affirmer qu'un style est plus fort.
- Tests nouveaux : `tests/deck_builder_v26.test.mjs`, `tests/browser_decks_v26.py`; continuer `npm test`, `npm run test:parity`, `npm run build` et les contrôles historiques pertinents.
- Pas de nouveau champ obligatoire dans les anciennes sauvegardes ; rester à 17 modules tant qu'aucune nouvelle responsabilité ne justifie un découpage.

## V2.5 — architecture modulaire (fondation précédente)

- Voir **`docs/ARCHITECTURE_MODULAIRE_V2_5.md`** avant toute modification.
- L'API historique `src/engine.js` est une **façade** ; modifier le module métier concerné dans `src/engine/` plutôt que de déplacer du code dans la façade.
- `src/app.js` orchestre les écrans et les événements ; écrire les rendus dans `src/ui/pages.js`, `views.js` ou `battle-view.js`, les effets visuels dans `combat-fx.js` et les sauvegardes dans `storage.js`.
- `npm test`, `npm run test:parity`, `npm run build`, `npm run build:test`, puis parcours Chromium. La référence de parité V2.4 est figée et ne doit pas être réécrite en cas de modification des règles.
- **Ne jamais diffuser `tests/JOUER.test.html`** : il contient des accès internes pour les tests. Distribuer uniquement `JOUER.html` et les sources nécessaires.
- Sauvegardes : garder les clés `couronnes_arcanes_v1`, `couronnes_arcanes_bataille_v1`, et la clé d'animations existante ; aucun changement volontaire du schéma.
- V2.5 = refonte technique, pas de nouvelles cartes, compétences, récompenses ou équilibrage.

## Historique V2.4 — équilibrage comparatif des 16 talents

- Modifications : pioche **Rôdeur Réserve de flèches limitée à une fois par combat**, et rééquilibrage de 5 autres talents (Tir précis, Écho des étoiles, Purification, Main secourable, Rempart ancien).
- Audit **32 256 combats déterministes avant/après** : 36 configurations, 14 rencontres, 32 graines, mêmes profils et stratégie. Les données et leurs limites sont consignées dans `docs/EQUILIBRAGE_TALENTS_V2_4.md`.
- Tests : `npm test` (102 tests), `npm run build`, `python3 tests/browser_talent_balance_v24.py` et les parcours navigateur historiques. Ne pas affirmer que la simulation constitue une preuve d'équilibrage humain.
- Sauvegardes : conserver `couronnes_arcanes_v1` et `couronnes_arcanes_bataille_v1` ; le nouveau drapeau `battle.talentDrawUsed` est facultatif pour les anciennes parties.
- Prochaine tâche : tester les 16 talents avec des **decks diversifiés et des profils fin de jeu**, notamment la branche Main secourable du Clerc.

## Historique V2.3 — talents tactiques de héros

- `src/talents.js` contient 16 talents, 2 choix exclusifs par palier (niveaux 4 et 8) pour chacune des 4 classes. Il reste indépendant du DOM et du moteur.
- `src/engine.js` normalise `profile.talents`, propose `chooseHeroTalent()`, capture `battle.heroTalents` à la création du combat et applique seulement les bonus de pouvoir de héros pertinents. Les batailles d'anciennes versions sans `heroTalents` restent fonctionnelles.
- `src/app.js` montre l'arbre dans **Atelier**, permet de changer gratuitement la voie hors combat et conserve les choix par classe. Ne pas supprimer les anciennes clés `localStorage`.
- `scripts/build_standalone.mjs` incorpore **talents.js avant engine.js**. L'export `JOUER.html` doit fonctionner intégralement hors ligne.
- Tests nécessaires : `npm test` (98 réussis), `python tests/browser_talents_v23.py`, `browser_progression_v22.py`, `browser_dungeons.py`, `browser_events_v20.py`, `browser_vfx.py` et `browser_smoke.py`.
- Documentation détaillée : `docs/TALENTS_V2_3.md`. Prochaine tâche : affiner l'ergonomie des talents et mesurer leur impact sur l'équilibrage en campagnes longues.

## Informations générales du projet

Projet : **jeu web CCG tactique solo original**, inspiré du genre des jeux de cartes avec unités marchant sur des lignes. Aucun asset ou nom de carte propriétaire issu d'un autre jeu.

## À lire
1. `docs/BIBLE_DU_JEU.md` : règles, univers, roadmap, critères de fin.
2. `docs/CODEX_WORK_MISSION.md` : mandat opérationnel et principes d'autonomie.
3. `README.md` : lancement et état réel.

## Répartition des responsabilités
- `src/data.js` : catalogue de cartes, classes et campagnes ; toute ID ajoutée doit être unique.
- `src/engine.js` : règles, progression, récompenses, orchestration des tours ; PAS de DOM.
- `src/dungeons.js` : définition des donjons et des rencontres, sans DOM ; ne jamais réattribuer les récompenses spéciales à chaque répétition.
- `src/ai.js` : analyse publique du plateau et choix tactiques du camp adverse ; PAS de DOM ni de cartes cachées du joueur.
- `src/app.js` : interface, navigation, sauvegarde navigateur, interactions et rendu ; privilégier des composants lorsque la taille augmente.
- `src/visuals.js` : correspondance cartes → portraits/roles graphiques ; `assets/creatures/` contient 12 WebP originaux.
- `styles.css` : charte et responsive.
- `index.html` : entrée web modulaire.
- `JOUER.html` : export autonome sans module externe ; **régénérer** après toute modification de `src`, des images ou de CSS.
- `tests/` : tests unitaires ; mettre à jour en même temps que le moteur.

## Règles de travail
- Toujours exécuter `node --test tests/*.test.mjs` après modification du moteur.
- Toujours lancer un contrôle navigateur après modification de l'UI.
- Conserver le jeu jouable à chaque commit. Ne pas ajouter un faux bouton, une fausse capacité, une fausse mission ou un écran fictif présenté comme fini.
- Les fonctionnalités non réalisées doivent être signalées honnêtement.
- Maintenir `docs/ETAT_PROJET.md` court lors des sessions futures : version stable, tests, travail restant et prochaine priorité.
- Ne pas multiplier les sous-agents si un seul agent et des tests suffisent ; si plusieurs sont utilisés, missions non chevauchantes et revue d'intégration.
- Ne jamais inventer de preuve d'exécution ou de commit GitHub.
- Pour une mise en production avec comptes/réseau : backend autoritatif, validation serveur, sécurisation des sauvegardes et données personnelles ; pas de prototype local présenté comme système anti-triche.

## Définition de Done
Fonction utilisable par le joueur, testée, documentée, sauvegarde et UI vérifiées, absence de régression majeure, commit traçable.

## Direction graphique
Univers de fantasy médiévale peinte, cartes détaillées originales, héros expressifs, vrais sprites animés. Le visuel actuel est une base soignée mais **provisoire**.

## Historique V1.9 et consignes de recherche

- État historique : **V1.9** (fondée sur la V1.5.1 auditée), avec Vol (saut d’un allié si case libre, pas d’ennemi), Garde (interception des attaques vers la couronne sur la même ligne), **Charge** (attaque +2 si déplacement ce tour) et **Riposte** (contre-attaque au contact, une fois par tour), étiquettes de traits. 12 portraits originaux illustrés sur le plateau et les cartes, animations CSS distinctes par rôle et réactions aux attaques ; effets de combat pilotés par les actions réelles, interrupteur et respect des animations réduites ; concorde de faction (+1 attaque si deux unités du même ordre sont alignées, bonus dynamique et symétrique), 60 cartes, 12 missions de campagne, **20 étages de tour**, 4 classes, 6 équipements, 5 réputations, extraction et fusion de cartes. Lire `docs/INVENTAIRE_HISTORIQUE_KINGS_AND_LEGENDS.md` avant les évolutions majeures.
- Ne jamais affirmer que les 900+ cartes, le PvP, les guildes ou les 50 étages du jeu historique sont programmés.
- Le produit final doit demeurer original ; ne pas télécharger/réutiliser les assets protégés ou logos de Kings and Legends.
- Tester `npm test`, `npm run build`, puis `python3 tests/browser_smoke.py` et `python3 tests/browser_vfx.py` si Chromium et Playwright disponibles avant tout ZIP/commit.
- Ne pas intégrer les événements visuels `battle.vfx` dans les sauvegardes ; les animations ne doivent jamais influencer les calculs du moteur.
- Conserver les clés de sauvegarde `couronnes_arcanes_v1` et `couronnes_arcanes_bataille_v1` lors de migrations ; vérifier qu'un profil V1 fonctionne encore.
- Priorité technique prochaine : simuler des parties complètes pour équilibrer les quatre personnalités V1.8 et la Furie des boss, puis améliorer les sprites animés et les combats. Ne pas ajouter du PvP prématurément. Ne pas attaquer le PvP avant un socle complet et testé.

- **Ne pas présenter la V1.4 comme 60 illustrations uniques ou des sprites en plusieurs frames**. Les portraits sont des découpes de concepts visuels générés pour le jeu et sont réutilisés par famille.
- Tester aussi `tests/browser_creatures.py` après modification des illustrations et valider que `JOUER.html` contient les images en local (aucune requête réseau).

- Résultats d’audit du moteur et du navigateur : voir `docs/AUDIT_V1_5.md`. Cette base de jeu est stable en test automatisé, mais ni une campagne exhaustive ni un test sur téléphone physique ne sont revendiqués.

## Continuité V1.7
- `src/ai.js` classe les cartes/lignes selon la situation de plateau ; `src/engine.js` applique chaque décision et recalcule après le premier coup.
- Le joueur voit seulement le motif de la dernière action adverse ; l’IA ne consulte jamais sa main, sa pioche ni sa collection privées.
- Vérifier `tests/ai_v17.test.mjs` et `tests/browser_v17.py` ainsi que les tests historiques avant livraison.
- Cette IA est **déterministe et heuristique**, pas un réseau neuronal ni un apprentissage autonome.

## Continuité V1.8
- Chaque mission a son `aiStyle` dans `src/data.js` et chaque étage de la Tour reçoit le sien ; la bataille le conserve dans `battle.aiStyle`. Le repli pour une bataille V1.7 est `equilibre`.
- `src/ai.js` exporte `AI_STYLES`, `aiStyle`, `aiEnraged`, `personalityBonus` et `rankEnemyMoves`. La Furie se déclenche à au plus 50 % des PV d'un boss.
- Ne jamais modifier silencieusement la règle de 2 cartes/tour, les probabilités de pioche, la main privée du joueur, ni les stats des boss.
- Vérifier `tests/ai_styles_v18.test.mjs` et `tests/browser_v18.py` en plus des anciens tests.
- 59 tests JavaScript ont réussi sur la V1.8 et le jeu s'affiche sur Chromium desktop/mobile. Aucun benchmark de centaines de parties ou de vrai smartphone n'est revendiqué.

## Expéditions V1.9
- `src/dungeons.js` : 3 donjons × 3 salles, réemploi assumé des cartes/decks préexistants, bosses finaux.
- `src/engine.js` : `beginDungeon`, `nextDungeonBattle`, `settleDungeonBattle`, `abandonDungeon`, `dungeonUnlocked` ; profil `dungeonRun`/`dungeonCleared` ajouté sans changer la clé de sauvegarde.
- Les PV persistent entre les salles avec récupération fixe de 6 PV après chaque victoire. Une défaite clôt le donjon. La première victoire complète accorde une carte unique ; pas de nouvelle copie lors des répétitions.
- Reprise possible après rechargement : le combat actif est enregistré dans l'ancienne clé `couronnes_arcanes_bataille_v1`, l'avancée entre les salles dans le profil.
- L'export HTML autonome **requiert** l'intégration du nouveau module `dungeons.js` dans `scripts/build_standalone.mjs`.
- Tests : `npm test`, `python3 tests/browser_dungeons.py`, historiques selon pertinence ; `tests/browser_dungeons.py` simule la mémoire de stockage car cette VM bloque les navigations locales Chromium.
- Pas de donjons coopératifs, ni d'images uniques pour chaque salle ; ne pas les annoncer comme implémentés.

## Continuité V2.0 — événements des donjons
- État dans `profile.dungeonRun.phase` : `ready` (combat principal possible), `choice` (événement obligatoire), `bonus` (combat facultatif choisi). Un profil V1.9 dépourvu de `phase` reprend en `ready`.
- Le moteur exporte `chooseDungeonEvent`, et `src/dungeons.js` `dungeonBonusMission`. Ne pas attribuer le butin du combat bonus avant victoire ni proposer plusieurs événements sur la même transition. Le combat supplémentaire est une vraie rencontre avec `missionId` en `B_...` ; jamais confondre avec les salles normales en `D_...`.
- Événements : repos +10 PV au plus (après les +6 existants), coffre déterministe, ou combat bonus à risque d'abandon de l'expédition.
- Vérifier `tests/events_v20.test.mjs` et `tests/browser_events_v20.py`, en plus des anciens tests de donjon. Les sauvegardes restent dans les clés historiques et ne doivent pas être invalidées.
- V2.0 : 76 tests Node réussis. Scripts navigateur ciblés confirmés sur desktop/mobile avec stockage simulé. Le comportement sur téléphone physique n'est pas confirmé.

## Historique V2.1 — équilibrage documenté
- Lire `docs/EQUILIBRAGE_V2_1.md` avant toute modification des PV ennemis, de leurs decks ou des récompenses. C'est un **premier** rééquilibrage, pas une validation exhaustive.
- `npm run balance -- --summary`, `--mid --summary`, `--developed --summary` : simulateur déterministe isolé, 1 280 combats/profil avec une heuristique de joueur fixe. Ne jamais faire passer ces taux pour des données d'utilisateurs.
- Campagne 01/03/11, Tour 1–4, boss du donjon Ysara ajustés ; autres paliers préservés pour permettre une progression via améliorations.
- `dungeonBonusMission` est la source unique des récompenses d'embuscade. L'UI ne doit pas les coder en dur. Bonus obtenu uniquement sur victoire et une seule fois.
- Version stable à cette étape : V2.1 ; les mentions anciennes sont conservées ici uniquement à titre historique.
