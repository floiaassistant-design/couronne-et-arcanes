# AGENTS.md — Couronnes & Arcanes

## Contrat permanent — six raretés de Collection et fiche courte

- La Collection conserve **six cartes côte à côte pour chaque personnage** (Commune, Rare, Épique, Légendaire, Divine, Éveillée), et non une vignette unique. Le remplacement de six cartes par une seule était une proposition documentaire annulée par le propriétaire.
- Chaque carte garde une **description brève** et son rang réel ; les rangs sans mécanique intégrée affichent **« À concevoir »**, sans inventer de statistiques, d'obtention ni de déblocage. Les rangs inférieurs à la rareté native ne deviennent pas jouables par simple affichage.
- La **fiche compacte** apparaît **au survol de la carte** dans la Collection, selon le principe existant pour la main et le plateau. **Aucun bouton supplémentaire pour ouvrir la fiche.** Le focus clavier et le toucher peuvent consulter la même fiche directement sur la carte, sans contrôler la sélection ou la pose en combat.
- Texte de fiche également **concis** : caractéristiques, pouvoirs et conditions essentielles uniquement. Garder les données et les effets hors des vues, éviter les copies de règles et ne pas modifier l'aperçu de combat lorsque seule la Collection est concernée.

## Contrat — affichage de Concorde

- `ui/concorde.js` rend la lumière de l’emblème et le résumé partagé : symbole
  de faction en tête, « Bonus de faction : +1 attaque », état inactif grisé.
  L’état vient de `formationBonus`, jamais de l’attaque affichée ou d’un calcul
  copié dans la vue. Aucun état de présentation ajouté aux sauvegardes.
- Le rendu éclaire les pixels de l’emblème déjà peint ; les zones par Ordre
  appartiennent à la présentation. Tout changement des cadres demande leur
  vérification visuelle. Les images originales restent contrôlées par les reçus.
- `styles/cards/concorde.css` est relié à index et embarqué par le builder.
  Garder une lumière fixe, les clics accessibles, les valeurs réelles et les
  fiches lisibles sous la barre de navigation, y compris sur petit écran.
- `ui/card-arena.js` conserve le rendu partagé `campSeal` pour les deux camps :
  rond bleu allié, losange rouge adverse. `assets/card-arena.css` place ces petits
  repères à gauche, hors de la carte ; garder les illustrations, nombres et
  clics accessibles. Le propriétaire reste celui de `u.side`, sans état sauvegardé.

## Contrat — ciblage direct et effets de combat

- `engine/spell-targeting.js` centralise les sélecteurs, en réutilisant les
  validateurs et plans existants. Les priorités des sorts demeurent obligatoires.
- `engine/spell-casting.js` porte leur résolution ; les dégâts restent injectés
  par le moteur. `previewPlayerSpell` résout une copie et ne retourne que le public.
- Cible et aperçu restent transitoires dans `ui/spell-controller.js`. Confirmer
  revérifie le plan ; annuler ne consomme rien. Les sorts restent immédiats,
  les unités agissent à validation. Souris, tactile et clavier sont conservés.
- `ui/combat-effects.js` représente seulement les étapes publiques. Préserver
  verrou, nettoyage, repli sans animation et statuts réels ; aucun effet sauvegardé.
- Les feuilles de ciblage et d’effets sont reliées par index.html ; vérifier leur
  inclusion dans le même export officiel. Aucun HTML expérimental distribué.
- Contrôles ciblés : `spell_targeting.test.mjs`, `browser_spell_targeting.py`,
  `browser_combat_fx.py`, puis les parcours existants pertinents. Les anciens
  bilans datés et comptes de modules plus bas ne sont pas des consignes actuelles.


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
- Collection nº 24, Milicien nº 25, Aube/sceaux nº 26, Sylve nº 27 et Ombre nº 28
  fusionnés sur accords spécifiques. Main vérifié :
  `ee8a2482841b722e5fb7e761a1df0c712ac75243`. La branche
  `feat/forge-cartes-20261021` part de ce main exact et propose dix Forge
  de la PR atelier nº 25, commit `ceb0a916`, sans fusion autorisée.
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
  dix Aube, onze Sylve et onze Ombre sont intégrés ; dix Forge proposés, sur demandes
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

## Politique de travail — ne pas attendre activement la CI

- Après avoir préparé le code, les contrôles locaux nécessaires et la documentation,
  pousser la branche et ouvrir ou actualiser sa PR : les GitHub Actions se
  déclenchent normalement sur cet événement. Ne pas relancer un workflow déjà
  en cours ni multiplier les exécutions sans raison.
- **Ne pas arrêter le travail simplement parce que la CI a démarré.** Tant que
  des tâches utiles **indépendantes du résultat distant** subsistent, les
  terminer : relire le diff et les fichiers générés, vérifier les dépendances
  et les PR parallèles, corriger les problèmes déjà identifiés, documenter le
  changement, compléter la PR et préparer une reprise claire.
- Lorsque la CI tourne encore **et qu'il ne reste plus aucun travail utile
  réalisable sans son résultat**, terminer la session au lieu de surveiller
  activement GitHub. Éviter les boucles de consultation, les attentes
  artificielles et les appels répétés qui consomment le quota de l'agent.
- Donner au propriétaire la branche, la PR, le dernier commit, le lien vers
  GitHub Actions, les vérifications déjà réalisées, les contrôles encore en
  cours et la prochaine action. Laisser GitHub notifier la fin des tests ;
  le propriétaire peut alors demander à un agent d'examiner le résultat.
  Ne jamais annoncer une CI réussie tant que son statut final n'est pas vérifié.
- Si la CI est déjà terminée au cours du travail utile, lire son résultat et
  traiter les échecs pertinents ; après une correction, pousser et laisser le
  nouveau run se dérouler selon la même règle. N'interrompre un travail utile
  que s'il est réellement bloqué par un résultat attendu.
- Avant toute fusion, reprendre la revue du commit exact, des tests, conflits
  et changements de main ; **l'autorisation explicite et spécifique du
  propriétaire reste obligatoire**. Après fusion, préserver les contrôles
  requis sur main et confirmer séparément la publication ; ne pas confondre
  fin d'attente active, réussite CI, fusion et déploiement.

## Contrat CI — vérification sélective des PR documentaires

- Les workflows `test.yml` et `web-package.yml` gardent leurs deux statuts
  de validation. Le script `scripts/ci_change_scope.mjs` examine le diff Git
  réel entre la base de PR et son checkout de fusion. Seuls les Markdown de
  racine et de `docs/` constituent une **PR documentaire uniquement**.
- Une liste vide, un changement d'application, de CSS, de test, de script,
  d'image, d'export, de workflow, de configuration ou un renommage provenant
  du code impose les contrôles complets (comportement conservateur).
  Toute erreur de détection bloque la CI ; ne jamais réussir par défaut.
- Sur PR documentaire seule, exécuter la classification et son test ciblé,
  conserver les jobs verts, mais omettre navigateur, moteurs, builds et paquet.
  **Sur tout push main**, continuer tous les tests et le paquet de publication,
  même après une fusion documentaire : preuve de provenance exigée par Sites.
- Garder les tests métier, la parité, le contrôle de JOUER, l'export web et les
  chemins navigateur inchangés pour les PR ayant un impact autre que Markdown.
  Modifier la classification ou les workflows exige toujours la CI complète
  et des tests du classificateur couvrant les chemins inconnus et renommages.

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

## Distribution unique — demande du propriétaire du 22/10/2026

- Une seule présentation active : cartes sur le plateau. Ne pas réintroduire
  la vue personnages, son bouton ni un export d’essai séparé.
- `JOUER.html` est l’unique export distribué ; `index.html` sert le même jeu web.
  `tests/JOUER.test.html` est uniquement un paquet diagnostic non distribué.
- Régénérer avec `npm run build` et `npm run build:test`. Les anciens documents
  mentionnant `ESSAI_CARTES.html`, `build:cards` ou quatre builds sont historiques.
- Conserver règles, moteur, profils et sauvegardes historiques, y compris leurs
  plateaux 3×5 ; ils utilisent désormais les cartes, sans conversion des données.

## Entretien des vues — proposition indépendante du 23/10/2026

- Les PR 31 à 34 sont fusionnées sur `main` `adf9c9192293ea2e25849f37a0ac11d1df08c951`.
- `ui/guide-page.js` est le propriétaire du rendu pur du Guide ; `ui/pages.js`
  fournit son bouton et la valeur de sauvegarde précédente au moment du rendu.
  Le nouveau module doit être embarqué par le builder et ne dépend ni du DOM,
  ni du stockage, ni du moteur.
- La branche de maintenance attend son accord spécifique de fusion, comme
  toute nouvelle PR. Les chiffres des rapports datés restent historiques.

## Contrats techniques à conserver

### Modules et interface

- CSS : `index.html` est l'unique liste de feuilles ordonnée, utilisée aussi par
  le générateur autonome. `styles.css` porte le socle ; `styles/components.css`,
  `styles/pages/`, `styles/cards/` et `styles/battle/` portent les composants et
  leurs variantes mobiles. Voir `styles/README.md`. Garder les surcharges peintes,
  cartes et collection dans `assets/` après ce socle. Ne pas altérer les fonds
  embarqués ni leurs reçus lors d'une réorganisation de styles.

- `src/engine.js` est la façade publique ; les règles restent dans `src/engine/`,
  sans DOM. `src/data.js`, `talents.js` et `dungeons.js` portent le catalogue et
  les rencontres. `src/ai.js` reste une IA heuristique déterministe, sans accès
  à la main, à la pioche ou à la collection privées du joueur.
- `src/app.js` orchestre les écrans et actions. Rendus dans `src/ui/pages.js`,
  `views.js`, `battle-view.js` et `card-arena.js`, stockage dans `ui/storage.js`.
  `ui/markup.js` centralise l’échappement HTML pur partagé ; `ui/collection.js` rend le catalogue par personnage et les fiches de rareté,
  sans mutation du profil : les rangs non définis restent « À concevoir ».
  `ui/painted-arena.js` porte la projection et les ancrages. `ui/arena-art.js`
  fournit le repère neutre ; `ui/combat-fx.js` conserve l'API avec fin immédiate,
  sans ancien lecteur d'effets. Les 29 modules sont empaquetés par le générateur.
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

- Quarante-deux cartes complètes Aube/Sylve/Ombre/Forge : `ui/generated-card.js` place seulement les
  textes et valeurs dans cinq zones normalisées du cadre dessiné. Mapping
  individuel `CARD_TEMPLATES`, clés `CARD_ART_NAMES`, registre `kind: card`
  dans `assets/artwork.json`. `scripts/lib/artwork.mjs` contrôle source, reçu,
  octets, SHA-256 et dimensions WebP 2:3, puis le builder embarque l’image.
  Le circuit des portraits reste distinct ; aucun portrait implicite par famille.
  Voir `docs/MILICIEN_INTEGRATION_2026_10_21.md`,
  `docs/AUBE_INTEGRATION_2026_10_21.md`, `docs/SYLVE_INTEGRATION_2026_10_21.md`
  et `docs/OMBRE_INTEGRATION_2026_10_21.md`,
  `docs/FORGE_INTEGRATION_2026_10_21.md`. Les sceaux de camp sont rendus par
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

- Régénérer `JOUER.html` depuis les sources ; ne jamais
  éditer les HTML produits à la main. Conserver la version HTTP et l'export
  autonome hors réseau. Ne jamais distribuer les HTML réservés aux tests.
- Contrôles de base : `npm test`, `npm run test:parity`, `npm run build`,
  `npm run build:test`.
- Si rendu modifié : parcours actuels `browser_card_study.py`,
  `browser_deployment.py`, `browser_card_preview.py`, `browser_art_reset.py`,
  `browser_collection.py`, `browser_milicien.py`, `browser_aube.py`, `browser_sylve.py`, `browser_ombre.py`, `browser_forge.py`, puis suites pertinentes du workflow. Vérifier bureau,
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

