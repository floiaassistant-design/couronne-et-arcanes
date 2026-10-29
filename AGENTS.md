# AGENTS.md — Couronnes & Arcanes

## Ascensions Aube — proposition du 28 octobre 2026

PR 61 fusionnée sur accord, main `63ff7463b89d4f2ff410063a47ba2473087884bc`,
tests et assemblage main réussis. La suite `feat/ascensions-aube` propose les
20 évolutions Divines/Éveillées restantes : 41 évolutions Aube obtenables au total.
Deux ascensions communes ouvrent chacune dix fusions, sans épreuve par personnage :
Divin après mission 09 ; Éveillé après mission 12 et ascension Divine.
Chaque tentative est gratuite ; la réussite ouvre l'accès, sans carte offerte.
Chaque fusion exige ensuite trois copies libres du rang précédent ; deck protégé.
Règles/chiffres des 51 versions Aube inchangés, édition Notion relue
`2026-10-27T06:13:46.581Z`. Pas d'autre faction activée ni d'écriture Notion.
`EVOLUTION_TRIALS` garde les quatre pilotes ; `EVOLUTION_ASCENSIONS` porte les deux
défis communs, `ALL_EVOLUTION_TRIALS` leur lecture générale. Les reçus réutilisent
`completedTrials` ; normalisation/import/export doivent garder les six identifiants.
`engine/ascension-objectives.js` lit quatre conditions réelles depuis le plateau,
la couronne et le tour, sans second moteur ni compteur artificiel. Instantané v2
obligatoire pour ces nouvelles épreuves ; objectifs v1 et anciennes reprises conservés.
`settleEvolutionTrial` ouvre l'accès une fois, sans toucher aux stocks/deck/XP.
Le contrôleur de clôture existant sauve la copie avec reçu avant nettoyage.
Les combats actifs ou résultats non récupérés bloquent tout nouveau départ.
Paquets Rare/Épique, économie, butins et capacités conservés. 66 modules/76 images.
Les nouveaux parcours réutilisent la suite Épreuves et ses quatre parties,
sans nouveau job ni retrait d'assertion. Lire [le contrat](docs/ASCENSIONS_AUBE.md)
et [la reprise des factions](docs/REPRISE_MIGRATION_CARTES.md).
Les anciennes mentions « 21 obtenables, 20 au labo » sont historiques.
Cette nouvelle PR exige son accord spécifique de fusion ; aucune publication déduite.

## Migration Aube Légendaire — proposition du 28 octobre 2026

PR 60 fusionnée sur accord au main `e159631b5913791eb96d429201408a452def1337` ;
les deux CI main ont réussi. La suite `feat/evolutions-legendaires-aube` ouvre
neuf évolutions Légendaires déjà programmées au laboratoire, par fusion de trois
Épiques libres identiques après victoire de mission 06 (deuxième boss).
C'est un réglage d'obtention proposé à la revue, sans nouvelle décision de pouvoir.
21 évolutions Aube deviennent obtenables ; les 20 Divines/Éveillées restent au
laboratoire pour les étapes ultérieures et les défis exceptionnels.
L'Ange du Bastion est déjà Légendaire natif : aucune transition inventée.
Les recettes et l'accès par rang résident dans `evolution-fusion.js` ; Alchimie
lit les mêmes accès. Les paquets restent Rare/Épique, mêmes prix/pools/taux.
Réutiliser moteur, permissions, confirmation, stocks, sauvegarde et fiches existants.
Le tableau maître Notion a été relu à l'édition `2026-10-27T06:13:46.581Z` ;
aucun chiffre de carte ni pouvoir ne change. Lire [le contrat](docs/AUBE_LEGENDAIRES.md).
Les passages antérieurs « 12 évolutions / 29 au labo » sont historiques.
Cette nouvelle branche n'est autorisée ni à fusionner ni à publier.

## Paquets d'évolution — proposition du 28 octobre 2026

La PR 59 est intégrée sur accord au main `feeef6e` ; sa CI de PR était verte,
arbre identique vérifié après fusion. La suite isolée sur
`feat/paquet-evolution-aube` propose un paquet ciblé Aube : 190 or, 3 cartes,
après le boss de mission 03. Par carte : 60 % base Aube Commune/Rare,
35 % évolution Rare, 5 % évolution Épique, choix uniforme dans le groupe,
tirages indépendants et doublons possibles. Ce prix et ces taux sont proposés
à la revue, sans nouvelle décision de pouvoir ou écriture Notion.
`card-packs.js` partage prix, groupes et références avec moteur et vues.
`engine/card-packs.js` prépare/valide tout avant le débit ; `buyPack` reste
accessible via economy/façade, même prix 95, mêmes pools/poids natifs 65/28/7
et même séquence de six appels aléatoires. Aucun nouveau rang jouable.
Le contrôleur d'achat sauvegarde une copie avant adoption ; annulation,
double confirmation ou panne sans double débit ni perte du profil courant.
Les ouvertures UI des deux paquets sont bloquées pendant un combat/résultat non récupéré.
La fiche indique les voies de paquet, fusion et épreuve effectivement disponibles.
Lire [le contrat](docs/PAQUETS_EVOLUTION.md). Les quatre nouveaux parcours
navigateur sont répartis une fois dans les quatre parties d'épreuves existantes ;
conserver les 27 suites, les assertions et les contrôles obligatoires.
Aucune fusion/publication de cette nouvelle PR autorisée par l'accord sur la 59.

## Fusion de doublons — intégrée par PR 59, 28 octobre 2026

Le propriétaire retient paquets + fusion pour la progression ordinaire, puis
quelques épreuves très difficiles pour des cartes exceptionnelles. Les quatre
épreuves pilotes restent intégrées depuis PR 56, main `736fd7d`.
La PR 59 intègre 3 copies libres identiques
pour 1 rang suivant, sans or/éclats, Aube uniquement jusqu'à Épique. Ratio et
verrous intégrés : mission 01 pour Rare, premier boss pour Épique.
Douze recettes, dont huit versions nouvellement obtenables ; 29 autres évolutions
Aube restent au laboratoire. Les anciennes limites « quatre versions/37 autres »
ci-dessous décrivent l'état antérieur. Aucun gain ni copie automatique.
Lire [le contrat](docs/FUSION_DOUBLONS.md). `evolution-fusion.js` porte les recettes
sans chiffres de cartes ; `engine/evolution-fusion.js` contrôle et consomme les
stocks de rang exact hors deck. `unitVersionPlayable` reste la permission centrale.
Le contrôleur de fusion exige une confirmation, revérifie les stocks/combat et
sauve une copie avant de l'adopter ; une panne ne consomme rien. Préserver la
fabrication or/éclats existante, les quatre épreuves et leurs récompenses uniques.
Les paquets d'évolution sont la proposition suivante ; les grandes épreuves
restent une étape ultérieure.
Cette proposition n'autorise aucune fusion sur main ni publication.

## Priorité — règles uniques des cartes jouables, 27 octobre 2026

Demande explicite du propriétaire : les cartes déjà possédées utilisent les
règles validées, comme les nouvelles. Aucune variante permanente « historique »
de Garde/Riposte. Lire [le contrat actuel](docs/REGLES_CARTES_UNIQUES.md).
`cards/abilities.js` définit Garde normale positionnelle pour les cinq gardiens
et Riposte à l'ATQ effective pour les sept natifs concernés, bonus compris,
sans Charge. `definitions.js` expose un seul registre ; `resolveRulesDefinition`
est un alias, jamais une seconde projection. `CARD_RULESET = cards-v2` identifie
la révision du combat pour détecter une sauvegarde incompatible, sans choisir
une autre règle. Mêmes capacités en aventure, dans les deux camps et au labo.
Les profils/possessions/achats restent intacts ; aucun rang supplémentaire obtenu.

Les anciens combats actifs ne reprennent plus : message explicite et fermeture
sans défaite ni pénalité, puis relance depuis l'écran habituel. Aucune conversion
silencieuse des unités blessées. Les anciens résultats terminés peuvent être
réglés avec le reçu existant, sans rejouer leur combat. Une partie précédente
reste récupérable même si seul son combat doit être relancé. Les vieux passages
techniques ci-dessous sur les règles historiques sont remplacés par ce contrat.

La PR 56 des défis est réconciliée avec main `a0726d4` (PR 57 et 58 intégrées).
Le Porte-égide doit déclencher deux Ripostes réelles et survivre à la victoire ;
aucune ancienne Garde ni interception fictive. Les trois autres défis restent
inchangés. Les exploits sont comptés par uid vivant, sans cumul entre copies.
`engine/trial-objectives.js` porte création, validation et lecture ; `battle.js`
rapporte les faits, dont le booléen de Riposte du résolveur commun. Une ancienne
épreuve compatible sans objectif conserve sa condition de départ.
Lire [le contrat et la reprise PR 56](docs/OBJECTIFS_EPREUVES.md).
Aucune fusion/publication de cette PR n'est autorisée par « reprends ».

## Épreuves Aube — PR 55

Lire [la reprise](docs/REPRISE_EPREUVES_EVOLUTION.md) et
[le contrat](docs/EPREUVES_EVOLUTION.md) avant de poursuivre la branche
`feat/epreuves-evolution-aube`. Quatre évolutions sont proposées à l'obtention
par épreuve ; les 37 autres évolutions Aube restent au laboratoire.
`cards/references.js` porte les références `{id,rarity}`, quantités par version
et inventaire facultatif ; les natifs restent des chaînes d'ID. Pas de migration,
copie offerte ou activation globale des règles Aube dans un ancien combat.
`engine/evolution-progress.js` porte accès, création et transformation uniques.
L'interface réutilise la clôture récupérable avec reçu avant nettoyage du combat.
Aucune fusion/publication de la PR 55 autorisée. Main de base : `1177160856`.

## Contrat — construction manuelle du deck

- `ui/deck-builder.js` rend les cartes possédées et le deck actif ; réutiliser
  `modifyDeck`, `validateDeck` et `deckOverview`, sans copier les règles du moteur.
- Les filtres et le focus restent éphémères ; conserver les chaînes d'ID natives
  et les clés de sauvegarde. Les évolutions gagnées utilisent `{id,rarity}`.
  Modifications hors combat uniquement.
- Les propositions sont facultatives et confirmées avant remplacement. Garder
  les six versions de Collection et la fiche universelle ; le constructeur ne
  crée aucune possession et utilise seulement les versions déjà gagnées.
  Voir [le contrat](docs/DECK_MANUEL_2026_10_27.md).

## Contrat — versions de rareté et compatibilité

- `src/cards/definitions.js` résout une unité par son ID historique et une rareté
  facultative. Le catalogue `CARDS` conserve ses natifs ; ne pas y ajouter les
  variantes au risque de modifier paquets, rencontres et économie.
- Les statistiques totales du rang remplacent la base. Achats, maîtrise,
  équipement, bonus de profil et effets temporaires restent distincts.
  Réutiliser le calcul de `engine/unit-stats.js`, sans conversion de niveaux.
- Une définition future ne signifie pas que ses pouvoirs sont programmés.
  Respecter les statuts de combat et les décisions en attente ; ne pas activer
  une version incomplète. Les références natives historiques restent valides.
- Préserver les IDs, decks, possessions, sauvegardes et chiffres des unités déjà
  invoquées. Aucun recalcul à la reprise, aucune obtention ou migration implicite.
  Voir le [contrat des versions](docs/AUBE_VERSIONS.md).

## Contrat — préparation des défenses versionnées

- `engine/battle-defense.js` est l'unique résolution de `hit` et Riposte pour
  tous les appels du moteur. `versionUnitAbilities` lit le registre actuel pour tous les natifs et leurs
  évolutions. Aucun ancien moteur sélectionné selon le contexte.
- Distinguer `status.engine` (moteur vérifié) de `status.combat` (livraison
  complète). `unitCanPlay` contrôle la pose : seules les quatre versions des
  épreuves peuvent être jouées en aventure dans un nouveau combat compatible.
  Les autres versions restent testables seulement au laboratoire avec le
  marqueur explicite de règles.
  Aucune obtention, possession ou conversion de niveau implicite.
- `engine/guard-candidates.js` énumère les gardiens éligibles et sélectionne
  un seul gardien selon la politique centrale validée : même ligne, proximité
  de sa couronne, puis ligne/uid. Aucune limite par tour tant qu’il reste vivant.
- Les quotas réels d'une capacité doivent survivre à la sauvegarde ; les
  instantanés d'événements ne doivent pas partager un objet mutable de barrières.
  Voir [les défenses et leurs limites](docs/AUBE_DEFENSES.md).

## Contrat — règles versionnées et laboratoire commun

- `resolveRulesDefinition` est un alias du résolveur unique. `CARD_RULESET`
  identifie les combats actuels ; aucun contexte ne change les règles d'une
  même carte. Une ancienne bataille active exige une relance explicite.
- `engine/unit-rules.js` partage références, autorisation de pose, portée,
  déplacement, Charge, Vol et Perforation entre moteur, IA et prévisions.
  `engine/unit-support.js` résout arrivée et soutiens avec les primitives du
  même moteur. Les états d'arrivée et de soutien empêchent les répétitions.
- Le laboratoire utilise `versionUnitStats` et les versions dont le moteur est
  implémenté. Niveaux 0–3 indépendants de la rareté ; aucun niveau forcé ni
  nouveau pilote spécifique au Milicien. Les anciens champs `labGuard` ne sont plus résolus par le moteur.
- Les barrières de capacités gardent leurs plafonds par effet ; les sorts
  gardent leur plafond individuel et ne réduisent pas un surplus préexistant.
  Ne pas déplacer ces règles dans les vues ou dupliquer les chiffres de Notion.
- `cards/ability-text.js` fournit les libellés brefs à partir des paramètres.
  Le modèle commun et toutes les vues réutilisent ces libellés. Lire [le contrat du moteur Aube](docs/AUBE_MOTEUR.md).

## Contrat — fiche et textes communs

- `ui/card-presentation.js` résout identité, rareté, disponibilité et chiffres
  depuis le registre et les calculs partagés, puis rend la fiche commune.
  Les instantanés de plateau gardent leurs PV/ATQ réels et leurs règles explicites.
- `ui/card-inspection.js` est l’unique lecteur pour toutes les vues et modales.
  `collectionHoverContent` est un adaptateur de compatibilité, sans second lecteur.
  Aucun bouton d’ouverture, état de lecture persistant ou effet métier.
- Six cartes par unité : versions définies avec chiffres réels, évolutions sans
  possession ni obtention inventée, rangs inexistants et inconnus sans chiffres.
- Souris : survol pour lire, clic pour sélectionner la main. Toucher : premier
  contact pour lire, second contact sur la même carte pour sélectionner ; pose
  seulement sur une autre case libre. Le plateau n’active aucune pose par remontée
  de clic. Le ciblage explicite d’un sort conserve sa confirmation.
- Les nouveaux cas de `browser_card_presentation.py` font partie de la suite
  `browser_card_preview.py` déjà exécutée en CI. Voir `docs/AUBE_PRESENTATION.md`.

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

## CI parallèle — contrat de validation

Lire [le plan et les limites](docs/CI_PARALLELE.md). `test.yml` lance quatre
instances de `tests` puis le verdict historique `validation`, toujours évalué.
`ci_browser_groups.json` attribue chaque suite une fois ; les seules parties
sont les quatre contextes d'épreuves, dont l'union reproduit le parcours complet.
Ne pas lancer aussi la suite entière en CI. Les 27 entrées et tous les tests
moteur/simulations sont obligatoires. Le runner conserve les échecs, la matrice
ne s'arrête pas au premier groupe rouge et le verdict refuse tout sauf success.

Playwright reste fixé dans `scripts/requirements-ci.txt`, cache navigateur
facultatif publié par un seul groupe. Diagnostic reconstruit localement par
runner pour éviter une grosse archive obligatoire ; captures conditionnelles
et paquet Sites conservés. PR plus récente : annulation du passage obsolète ;
aucune annulation mutuelle des pushes main. Aucun appel de modèle/agent dans
les workflows, aucun suivi actif supplémentaire demandé aux futures sessions.
Vérifier le résultat global et ne lire les logs détaillés que si nécessaire.

Le verrouillage effectif nécessite que main exige `validation` et
`assemblage-web` dans GitHub, administrateurs inclus. Ne pas confondre le
verdict rouge testé dans la CI avec une protection de branche effectivement
active : elle n'était pas configurée au relevé initial de cette mission.

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
- Conserver profils, possessions et présentation cartes. Un ancien combat actif
  incompatible demande une relance, selon le contrat des règles uniques ; aucun
  second moteur historique ni conversion silencieuse de ses unités.

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
  de toutes les vues. Le contrat de consultation actuel est décrit en tête ;
  le toucher consulte d’abord, puis sélectionne explicitement la même carte. Aucun épinglage, aucune action métier ni écriture en stockage
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

