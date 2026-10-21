# AGENTS.md — Couronnes & Arcanes

## Reprise et sources officielles

- Le code et les documents du jeu sont dans
  `floiaassistant-design/couronne-et-arcanes`. Les sources, prompts, références,
  exports et reçus graphiques sont dans `floiaassistant-design/couronne-et-arcanes-art`.
  GitHub est l'unique source officielle et le seul point de reprise du projet.
- Lire `README.md`, `docs/ETAT_PROJET.md`, `docs/CODEX_WORK_MISSION.md`, la Bible
  et l'architecture pertinente. Vérifier le dernier main, les branches et les PR
  réelles avant chaque mission ; les anciens numéros de version ne les remplacent pas.
- Jalon fonctionnel intégré le 20/10/2026 : PR jeu nº 20 puis nº 22, commit
  `50b32e4ad5c41da8c99f190d4ca300ce9fec988a`. Atelier remis à zéro par la PR
  art nº 18, commit `e598646540bf01d0389de772eed1d7f3539c27cc`. Ces trois fusions
  ont été autorisées explicitement ; cette autorisation ne couvre aucune future PR.
- Collection nº 24, Milicien nº 25, Aube/sceaux nº 26 et Sylve nº 27 fusionnés
  sur accords spécifiques. Main vérifié : `3c208df3eb3d5a57953e0c3bd0ee91069895edab`.
  La branche `feat/ombre-cartes-20261021` part de ce main exact et propose onze
  Ombre de la PR atelier nº 24, commit `e1022f20`, sans fusion autorisée.
- Ne jamais reprendre le projet depuis une ancienne archive externe, une copie
  locale non vérifiée, une conversation ou une ancienne branche. Les versions
  antérieures restent consultables dans Git et ne doivent pas écraser le main.
- Une mission, une branche dédiée, une PR. Vérifier main avant publication,
  réconcilier ses avancées utiles, ne jamais forcer l'historique.
- Les rapports d'audit, anciens résultats et étapes de conception sont historiques.
  Leurs listes d'assets, prochaines tâches et états de PR ne sont pas des consignes
  actuelles. `docs/ETAT_PROJET.md` et les commits réels priment.

## Nouvelle production graphique — décision du 20/10/2026

- Conserver plateau peint, présentation plein écran, cadres, main et aperçus.
  Refaire les illustrations et animations de personnages. Aucun ancien portrait,
  sprite, atlas, planche, modèle ou accord artistique n'est une référence active.
- `assets/artwork.json` est le registre actif. Après la remise à zéro,
  dix Aube et onze Sylve sont intégrés ; onze Ombre sont proposés, sur demandes
  explicites d’import. Voir les reçus exacts du jeu. Les SVG neutres sont des emplacements techniques. Le décor
  peint reste embarqué ; les interactions des compteurs sont conservées.
- Produire une seule illustration pilote neuve puis obtenir l'accord humain
  sur sa version exacte. Conserver source, prompt, droits, provenance, version,
  dimensions, poids, reçu et SHA-256 dans les dépôts GitHub.
- Tout import demande une PR du jeu, un mapping explicite dans `src/visuals.js`
  et une entrée du registre. Aucun actif implicite par famille et aucune
  synchronisation automatique entre atelier et jeu. Le builder refuse les WebP
  non catalogués ou sans reçu, provenance, droits et empreinte concordante.
- Noms, textes et statistiques sont rendus par le jeu. Les anciennes validations
  n'approuvent pas une nouvelle image. Une future animation demande son contrat,
  un repli fixe et le respect du mouvement réduit ; elle suit les événements du
  moteur et ne calcule aucune règle. Aucun événement VFX n'est sauvegardé.
- Lire `docs/REMISE_A_ZERO_GRAPHIQUE_2026_10_20.md` et
  `docs/INTEGRATION_GRAPHISMES.md`. Les anciennes PR jeu nº 11, 17, 18 et 19
  sont fermées sans fusion ; ne pas réintroduire leurs lots.

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

## Contrats techniques à conserver

### Modules et interface

- `src/engine.js` est la façade publique ; les règles restent dans `src/engine/`,
  sans DOM. `src/data.js`, `talents.js` et `dungeons.js` portent le catalogue et
  les rencontres. `src/ai.js` reste une IA heuristique déterministe, sans accès
  à la main, à la pioche ou à la collection privées du joueur.
- `src/app.js` orchestre les écrans et actions. Rendus dans `src/ui/pages.js`,
  `views.js`, `battle-view.js` et `card-arena.js`, stockage dans `ui/storage.js`.
  `ui/collection.js` rend le catalogue par personnage et les fiches de rareté,
  sans mutation du profil : les rangs non définis restent « À concevoir ».
  `ui/painted-arena.js` porte la projection et les ancrages. `ui/arena-art.js`
  fournit le repère neutre ; `ui/combat-fx.js` conserve l'API avec fin immédiate,
  sans ancien lecteur d'effets. Les 28 modules sont empaquetés par le générateur.
- `engine/unit-stats.js` partage les statistiques d'invocation entre moteur,
  main et collection ; réutiliser `gearBonus` du profil. La main lit l'instantané
  du combat, la collection le profil actuel. Préserver la parité et l'ordre des
  propriétés lors d'une refonte du constructeur de bataille.
- `ui/card-inspection.js` et `assets/card-preview.css` portent l'aperçu commun
  main/plateau. Survol ou focus pour lire ; clic/toucher ferme la fiche pendant
  sélection et pose. Aucun épinglage, aucune action métier ni écriture en stockage
  depuis le lecteur ; valeurs actuelles par uid, bonus et capacités lisibles.

- Fonds d’interface : `UI_BACKGROUNDS`/`UI_ART_NAMES` dans `visuals.js`, registre
  `assets/ui-artwork.json` et contrôle `scripts/lib/ui-artwork.mjs`. Sources
  épinglées dans l’atelier, reçu et empreinte exacts ; CSS à image JPEG embarquée.
  Ce contrat ne remplace pas le registre WebP des portraits. Voir
  `docs/COLLECTION_2026_10_21.md` avant l’ajout progressif des cartes.

- Trente-deux cartes complètes Aube/Sylve/Ombre : `ui/generated-card.js` place seulement les
  textes et valeurs dans cinq zones normalisées du cadre dessiné. Mapping
  individuel `CARD_TEMPLATES`, clés `CARD_ART_NAMES`, registre `kind: card`
  dans `assets/artwork.json`. `scripts/lib/artwork.mjs` contrôle source, reçu,
  octets, SHA-256 et dimensions WebP 2:3, puis le builder embarque l’image.
  Le circuit des portraits reste distinct ; aucun portrait implicite par famille.
  Voir `docs/MILICIEN_INTEGRATION_2026_10_21.md`,
  `docs/AUBE_INTEGRATION_2026_10_21.md`, `docs/SYLVE_INTEGRATION_2026_10_21.md`
  et `docs/OMBRE_INTEGRATION_2026_10_21.md`. Les sceaux de camp sont rendus par
  `card-arena.js`, sans barre de vie sous les cartes ; HP réels et fiche conservés.

### Géométrie et combat

- `engine/board.js` porte les dimensions à partir du tableau sauvegardé. Ne pas
  utiliser une constante globale comme limite d'un combat existant.
- Nouveaux combats : dix cases (1–10), couronnes en 0/11 ; deux lignes en
  difficulté 1–2, trois au-delà, quatre pour les boss. Anciens combats 3×5 :
  tableau et couronnes 0/6 conservés jusqu'à leur fin.
- Pose libre en 1/2/3, miroir adverse 10/9/8. La colonne de
  `playPlayerCard(b,index,lane,col)` est optionnelle, défaut 1. Valider avant de
  consommer la carte et réutiliser le hook d'entrée des pièges. IA et robot
  partagé utilisent la même géométrie. Ancien 3×5 : une seule entrée.
- Conserver délais, quota de deux cartes par tour, mouvement, portée et sorts
  par ligne. Les tests positionnés en 3×5 utilisent `tests/fixtures/legacy-battle.mjs`.
  Ne modifier ni assertions ni référence de parité pour masquer un échec.
- `engine/battle-control.js` porte les plans purs de silence, téléportation et
  pièges, partagés avec IA et vues. Silence : capacités déclenchées uniquement,
  deux résolutions au plus puis répit ; traits passifs et effets déjà actifs
  conservés. Téléportation : même colonne libre, une fois par unité et tour,
  sans arrivée devant la couronne adverse ; réutiliser `teleportPlan`.
- Deux pièges publics par camp, trois résolutions au plus ; retirer avant leur
  effet, utiliser `hit` et conserver propriétaire/expiration. Les champs de
  contrôle sont facultatifs pour les anciennes sauvegardes.
- `engine/tempo.js` modifie seulement les attentes de main : Élan des Heures
  réduit de deux la plus lente (égalité premier indice) ; Nœud du Temps ajoute
  deux à la plus proche d'être prête, plafond six, sans révéler son identité.
  Interdire l'action sans cible éligible et conserver les autres délais.

### Progression, sauvegardes et simulations

- `engine/deck-builder.js` est le seul propriétaire des propositions de decks.
  Prévisualisation pure, exemplaires possédés seulement ; confirmation avant
  remplacement de `profile.deck`, hors combat. Les quatre styles restent distincts.
- Compétences de classe : ne pas créer d'exemplaires gratuits, retirer les
  compétences incompatibles du deck après changement de classe sans supprimer
  la collection. Garder les anciens catalogues et decks de Tour de référence.
- Donjons : phases ready/choice/bonus, reprise des anciens profils, butin spécial
  sur victoire une seule fois. Le moteur porte les récompenses et le journal ;
  aucune seconde implémentation dans les vues.
- Conserver `couronnes_arcanes_v1`, `couronnes_arcanes_bataille_v1` et la clé
  d'animations existante. Aucun reset de profil, aucune migration implicite ;
  lecture, animations et autres états transitoires restent hors sauvegardes.
- Réutiliser `scripts/lib/battle_runner.mjs` et les scénarios fictifs partagés.
  Comparer mêmes graines et rencontres ; un résultat de bot ne valide pas
  l'équilibrage humain ni la pose élargie. Ne pas annoncer PvP/coop comme réalisés.

## Vérification et livraison

- Régénérer `JOUER.html` et `ESSAI_CARTES.html` depuis les sources ; ne jamais
  éditer les HTML produits à la main. Conserver la version HTTP et l'export
  autonome hors réseau. Ne jamais distribuer les HTML réservés aux tests.
- Contrôles de base : `npm test`, `npm run test:parity`, `npm run build`,
  `npm run build:cards`, `npm run build:test` et
  `node scripts/build_standalone.mjs --cards --test`.
- Si rendu modifié : parcours actuels `browser_card_study.py`,
  `browser_deployment.py`, `browser_card_preview.py`, `browser_art_reset.py`,
  `browser_collection.py`, `browser_milicien.py`, `browser_aube.py`, `browser_sylve.py`, `browser_ombre.py`, puis suites pertinentes du workflow. Vérifier bureau,
  portrait, paysage,
  sauvegarde/reprise, mouvement réduit, absence d'images et export hors réseau.
- Si règles modifiées : tests métier, compatibilité historique et simulations
  pertinentes (`control-balance`, `arena-balance`, comparateurs de decks/talents).
  Relire les contrats détaillés de ces fonctions avant modification.
- Vérifier les résultats distants sur le commit exact ; distinguer tests locaux,
  CI et examen visuel. Aucun téléphone physique ou équilibrage humain exhaustif
  n'est validé par les seuls tests automatisés.
- Fin de session : état de reprise court, changements et limites documentés,
  commit GitHub vérifié et PR. Les anciens bilans restent des rapports datés.
