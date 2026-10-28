## Fusion de doublons — proposition du 28 octobre 2026

`evolution-fusion.js` contient uniquement les douze recettes Aube et le ratio.
Il dépend des données/patches de conception, jamais des résolveurs : le registre
peut y lire l'obtention sans cycle. `definitions.js` expose la disponibilité
commune ; `references.js` réutilise `unitVersionPlayable` pour les stocks,
imports, decks et combats. Les paramètres des cartes restent dans leurs patches.

`engine/evolution-fusion.js` calcule les stocks libres du rang exact et revérifie
accès de campagne, combat, bornes et obtention avant consommation. Il ne modifie
ni deck ni ressources. `ui/evolution-fusion.js` rend recettes/confirmation ;
`ui/evolution-fusion-controller.js` détient seulement la confirmation transitoire,
consomme sur une copie puis demande sa sauvegarde avant adoption. App ajoute
l'adaptateur ; pages insère la section dans Alchimie. Quatre modules correspondent
aux données, métier, rendu et orchestration, sans dépendance externe ni cycle.
61 modules embarqués ; app reste à 380 lignes, pages à 269.
[Contrat et reprise](FUSION_DOUBLONS.md).

## Objectifs d'épreuves — PR 56 réconciliée, 28 octobre 2026

`engine/trial-objectives.js` centralise objectif figé au départ, validation,
compteurs par uid et projection pure du meilleur exemplaire vivant. `battle.js`
signale tours validés, dégâts effectifs à distance et Ripostes réellement
renvoyées par `resolveRetaliation`, sans copier leurs règles. L'attribution
reste dans `evolution-progress.js` ; `storage.js` valide le champ facultatif.
`ui/evolution-trials.js` partage compteur et fiche ; `battle-view.js` l'insère.
Aucune nouvelle dépendance externe ni second registre de cartes. Les 57 modules
sont découverts par le builder. [Contrat et reprise](OBJECTIFS_EPREUVES.md).

## Règles uniques — correction du 27 octobre 2026

`cards/abilities.js` porte les règles natives communes, Garde et Riposte incluses.
`cards/definitions.js` garde un seul registre ; les deux noms de résolution
pointent vers les mêmes objets immuables. `engine/unit-rules.js` lit ces règles
et contrôle la révision active. Garde, dégâts, soutiens et IA suppriment les
branches historiques ; aucune sélection de moteur selon le contexte.

`ui/storage.js` distingue profil conservé, ancien combat actif à relancer et
résultat terminé à régler. `app.js` rend le message de mise à jour et ferme le
combat obsolète à la demande, sans toucher au profil. La partie précédente peut
récupérer son profil même si son combat exige la même relance.
La fiche commune décrit aussi les gardiens et unités à Riposte hors Aube.
Aucun module de production, CSS, dépendance ou actif ajouté.
[Contrat actuel et contrôles](REGLES_CARTES_UNIQUES.md).

Les sections ci-dessous retracent les livraisons précédentes.

## Épreuves d'évolution — PR 55, 27 octobre 2026

`evolution-trials.js` porte les quatre rencontres, conditions et transformations.
`cards/references.js` partage identité, stock par version et validation de
l'inventaire facultatif. Le registre conserve les 76 IDs natifs ; aucun second
catalogue de chiffres ou de pouvoirs. `engine/evolution-progress.js` réutilise
profil, validation et `createBattle` pour les épreuves et leurs gains uniques.
Les dépendances restent dirigées vers données/références, sans DOM dans le moteur.

`ui/evolution-trials.js` rend l'accès, les objectifs et les résultats ;
`styles/pages/evolution-trials.css` reste limité à ces éléments. Les vues de
Collection/deck lisent les mêmes références. `app.js` orchestre la clôture sur
copies, reçu sauvegardé puis nettoyage, sans calculer la transformation.
Les mains et piles conservent `{id,rarity}` ; les anciens profils et combattants
ne sont pas migrés. Les quatre versions sont autorisées dans de nouveaux combats,
sans activer les règles versionnées des natifs. [Contrat](EPREUVES_EVOLUTION.md).

## Deck manuel — intégré par la PR 54, 27 octobre 2026

`ui/deck-builder.js` rend le choix manuel des cartes possédées et le deck actif,
avec les mêmes commandes/validations du moteur. `pages.js` adapte le rendu et
réutilise les propositions existantes ; `app.js` orchestre filtres éphémères,
focus et sauvegarde. `styles/pages/deck-builder.css` ne cible que ce nouvel écran.
Aucune migration de deck/profil. [Contrat](DECK_MANUEL_2026_10_27.md).

Les sections Aube ci-dessous décrivent la préparation historique de la PR 53,
fusionnée le 27 octobre 2026 au commit `003c6968`.

## Revue Aube — étape 6 terminée, PR 53 en brouillon lors de la revue

[Revue du 27 octobre 2026](REVUE_AUBE_PR53_2026_10_27.md) : mêmes sources web
et export, 51 modules sans cycle. Les six étapes sont terminées ; les évolutions
restent réservées au laboratoire, sans obtention ni activation en aventure.
Les sections suivantes retracent les étapes de l'architecture.

## Présentation commune Aube — étape 5, PR 53 en brouillon

`ui/card-presentation.js` porte le modèle de lecture et le rendu de fiche partagés.
Il lit le registre et les calculs du moteur, avec les chiffres des instantanés
pour le plateau. `cards/ability-text.js` dérive les formats bref/détaillé.
`card-inspection.js` est le seul lecteur DOM pour les cartes et références de
cartes de tous les écrans. Le rendu et le contrôleur séparés de Collection sont
remplacés par un adaptateur vers ce modèle commun ; `generated-card.js` conserve
les illustrations et leurs zones exactes. Pas de nouvelle règle ni de migration.
[Contrat et interactions](AUBE_PRESENTATION.md).

## Moteur Aube et laboratoire — étape 4 terminée, 26 octobre 2026

Le registre reste la seule saisie des paramètres. `resolveRulesDefinition`
est une projection immuable des règles futures, natives Aube comprises ; le
marqueur explicite `cardRules` protège les anciens instantanés sans migration.
`engine/unit-rules.js` partage références, pose autorisée, portée, déplacement,
Charge, Perforation et Vol entre combat, IA et statistiques.

`engine/unit-support.js` porte les sélecteurs et résolutions d'arrivée et de
soutien : soins proportionnels sur plusieurs lignes, Inspiration, barrière
après soin, Commandement et Intervention. Les frappes principales et secondaires
restent dans `battle.js`, qui injecte les mêmes dégâts dans tous ces effets.
`battle-defense.js` préserve les barrières de capacités lors d'un sort sans
modifier le plafond individuel de celui-ci. Aucun moteur parallèle ou DOM.

Le laboratoire lit le registre et `versionUnitStats`, avec niveaux indépendants
0–3 ; son ancien calcul pilote est retiré. L'IA lit les mêmes statistiques et
paramètres des unités versionnées, sans accès aux cartes privées du joueur.
`cards/ability-text.js` rend des libellés dérivés pour le laboratoire ; le rendu
universel de tous les écrans appartient à l'étape 5. Pas de nouvelle dépendance,
CSS ou image. [Contrat d'exécution](AUBE_MOTEUR.md).

## Défenses versionnées — étape 3 terminée, 26 octobre 2026

`engine/battle-defense.js` extrait la résolution de dégâts et Riposte de
`battle.js` et partage les mêmes appels entre sorts, pièges, attaques et pouvoirs.
Les règles futures se lisent par `cards/definitions.js:versionUnitAbilities`,
sans copie de paramètres dans le moteur. Le contrôle de silence lit cette
même API pour reconnaître une Riposte future hors des IDs historiques.
Le graphe reste dirigé vers les données et sans cycle ; aucun DOM dans le moteur.

`engine/guard-candidates.js` énumère l'éligibilité positionnelle, de ligne
ou de toutes lignes et sélectionne un seul gardien. `FUTURE_GUARD_POLICY`,
dans `cards/abilities.js`, porte la priorité et la fréquence validées : même
ligne, proximité de sa couronne, ligne/uid ; interceptions tant qu'il vit.
`battle.js` réévalue ce choix à chaque frappe et conserve la priorité historique
si aucune nouvelle Garde n'est éligible. Les événements interlignes emploient
`fromLane` et la vraie ligne de cible, déjà reconnus par le lecteur commun.
Aucune Riposte interligne ou déplacement réel du gardien n'est créé. Les fonctions de barrière gardent
un plafond par effet et ne diminuent pas une protection déjà présente.
Les instantanés explicitement versionnés utilisés par les tests gardent leurs
quotas ; la pose de versions futures reste interdite. Aucun écran ou catalogue
économique ajouté. [Règles exécutées et limites](AUBE_DEFENSES.md).

## Versions de rareté — préparation sur la branche Aube

`cards/schema.js` porte les identifiants et l'immuabilité ; `cards/aube.js` les
gains validés par rareté ; `cards/abilities.js` les capacités structurées et leur
héritage ; `cards/definitions.js` le résolveur par ID historique et rareté.
La dépendance va du moteur vers ce registre, puis vers les données natives,
jamais vers le DOM ou le stockage. `unit-stats.js` partage les additions de
bonus entre natif et prévision de version. Le point d'entrée de pose refuse les
versions dont les pouvoirs ne sont pas intégrés, sans consommation.
Le catalogue économique et les schémas sauvegardés restent inchangés.
Ces modules sont embarqués par découverte d'imports ; aucun second moteur ni
nouvel écran actif. [API et limites actuelles](AUBE_VERSIONS.md).
Cette préparation appartient à la PR Aube en brouillon et n'est pas sur main.

## Collection intégrée — PR nº 48 fusionnée (25 octobre 2026)

`ui/collection.js` garde le catalogue en lecture seule : six cellules par unité et un lecteur `bindCollectionHover` éphémère, déclenché par événements délégués souris, clavier ou tactile. La fiche compacte vit sur `document.body` afin de ne pas être rognée par le défilement horizontal. `app.js` la ferme lors des rerendus ; les chiffres existants viennent de `unitStats`, le bonus de `ui/concorde.js`, et les évolutions futures n'inventent aucune donnée. `assets/collection.css` est inclus dans l'unique `JOUER.html` généré. Aucun nouveau module, état sauvegardé, calcul moteur ou dépendance. `tests/browser_collection.py` vérifie les gestes et l'absence de l'ancien bouton.

# Proposition — repères discrets et résumé de faction, 24 octobre 2026

`ui/card-arena.js` garde `campSeal` partagé par le plateau et sa légende : rond
allié et losange adverse. `assets/card-arena.css` réduit ces SVG et les place à
gauche, hors des cartes. Aucun module ni ressource graphique supplémentaire.
`ui/concorde.js` associe le symbole de chaque Ordre au résumé « Bonus de faction :
+1 attaque ». Le même lecteur sert main, plateau et Collection ; seul le modèle
du plateau fournit l’état actif/inactif. Les coordonnées et la lumière des emblèmes
peints sont conservées. Règles, IA, événements et stockage inchangés.
La même cascade et le même builder alimentent le web et l’unique JOUER.html.
[Contrat et reprise](REPERES_CAMP_FICHES_2026_10_24.md). Proposition non fusionnée.

# Architecture intégrée — Concorde, 24 octobre 2026

`ui/concorde.js` porte le rendu pur de la lumière sur les emblèmes déjà peints
et le texte commun aux fiches. `battle-view.js` transmet le booléen issu de
`formationBonus` à `card-arena.js`, puis `generated-card.js`. La fiche plateau
réutilise le même calcul dans son modèle de lecture ; les fiches de main et de
Collection affichent la règle sans annoncer un bonus actif avant déploiement.

La lumière est une copie masquée de la zone concernée de l’image approuvée,
avec une luminosité locale ; aucun second registre graphique ni nouveau bitmap.
La feuille `styles/cards/concorde.css` est reliée à index, et le module est
embarqué par découverte d’imports. Les anciens styles du badge flottant sont
retirés. Le moteur, les événements de combat et le stockage sont inchangés.
La fiche agrandie réserve la barre de navigation du combat et la main lorsqu’elle ne peut pas tenir à côté de la carte.
[Contrat et vérifications](CONCORDE_2026_10_24.md). PR nº 42 fusionnée sur accord
spécifique ; version 5 de Sites publiée et vérifiée le 24 octobre 2026.

# Architecture courante — ciblage et effets

Les modules de `engine/` restent sans DOM ni stockage. Le catalogue, l’IA et
la progression sont inchangés. Les nouvelles responsabilités sont décrites dans
[le contrat de ciblage et effets](CIBLAGE_EFFETS_COMBAT_2026_10_23.md).

| Propriétaire | Responsabilité |
| --- | --- |
| `engine/spell-targeting.js` | Options et priorités légales, sélecteurs partagés |
| `engine/spell-casting.js` | Résolution existante extraite, dégâts injectés |
| `engine/battle.js` | Tours, primitives ; projection exacte sur une copie |
| `ui/spell-controller.js` | Sélection et confirmation éphémères |
| `ui/spell-targeting.js` | Rendu pur, prévisions publiques |
| `ui/combat-steps.js` | Ordre et différences des instantanés publics |
| `ui/combat-fx.js` | Lecture, ancrages, verrou et nettoyage |
| `ui/combat-effects.js` | Bibliothèque de primitives visuelles paramétrables |
| `ui/unit-status.js` | Badges des effets réellement actifs |

Le moteur ne dépend pas des vues ; aucune dépendance circulaire. Le séquenceur
et la bibliothèque ne rappellent aucune action moteur. `battle.js` reste cohérent
à environ 400 lignes après extraction de la résolution des sorts ; aucun découpage
artificiel des primitives d’attaque liées. Les autres ajouts sont de petits modules
par responsabilité. Le builder découvre les imports et embarque les mêmes CSS
que l’entrée web dans l’unique JOUER.html. Les sauvegardes n’incluent ni sélection,
ni aperçu, ni étape de lecture.

## Historique architectural

Les sections datées suivantes décrivent les jalons antérieurs ; leurs nombres
et statuts de propositions ne remplacent pas l’état courant du dépôt.

## Proposition du 23/10/2026 — 76 cadres complets

`visuals.js` ajoute 34 mappings individuels ; registre, index et reçus exacts concordent. `ui/generated-card.js` reste le lecteur pur commun : cinq zones pour les unités (Éther compris), trois zones grimoire pour les sorts, sans attaque/PV. Aucun nouveau module : 34. Ni règles ni stockage modifiés. Sources épinglées et contrôles inchangés du builder, unique JOUER régénéré. [Périmètre et limites](ETHER_SORTS_INTEGRATION_2026_10_23.md). Nouvelle PR sans autorisation de fusion.

# Version réunie du 23 octobre 2026 — 34 modules

Les modules de Guide, de lecture des effets et de laboratoire coexistent.
`engine/developer-lab.js` prépare des batailles `developer` via le moteur
public. Les bonus expérimentaux du Milicien restent limités à ce mode.
`ui/developer-lab.js` rend sa configuration ; `app.js` conserve la bataille
réelle en mémoire et interdit toute écriture de profil/combat pendant un test.
Les contrôles du lecteur (`fx-speed`, `fx-skip`) restent actifs dans ce mode.
Le moteur reste indépendant du DOM ; les instantanés visuels ne sont pas persistés.
`ui/guide-page.js` conserve son rendu pur. Le builder découvre les 34 modules.

Les sections ci-dessous décrivent les contrats et leurs jalons datés.

## Proposition du 23/10/2026 — lecture des événements publics

- `engine/combat-events.js` : captures publiques indépendantes, activées avec
  `b.vfx` seulement ; aucun DOM, calcul de règle ou état sauvegardé supplémentaire.
- `ui/combat-steps.js` : narration pure et différences observées des instantanés.
- `ui/combat-fx.js` : lecteur DOM, ancrages, commandes et nettoyage.
- `app.js` : résultat réel persisté puis projection temporaire dans les vues.
  Les commandes sont bloquées pendant la lecture ; fin immédiate sans animations.

Le builder découvre les 31 modules par leurs imports, sans liste parallèle.
Voir [le contrat](EFFETS_COMBAT_2026_10_23.md). Aucune fusion autorisée.

# État architectural vérifié le 23 octobre 2026

Les PR 31 à 34 sont déjà fusionnées sur `main` `adf9c9192293ea2e25849f37a0ac11d1df08c951`.
Le CSS est spécialisé et seule la présentation cartes est distribuée par
`JOUER.html`. Les propositions datées ci-dessous sont historiques.

La branche `refactor/guide-module-documentation-20261023` extrait le rendu
statique du Guide dans `src/ui/guide-page.js` avec injection de `btn`
et `previousGameAvailable`. `src/ui/pages.js` reste responsable de la
composition des pages et relit l'état à chaque `guideUI()`.
La dépendance va de `pages.js` vers `guide-page.js`, sans cycle ;
le nouveau module n'importe ni moteur ni stockage ni DOM.
Le builder doit l'inclure dans `JOUER.html`.

---

## Historique architectural des versions précédentes

## Proposition — Présentation cartes unique et export unique, 22 octobre 2026

Demande du propriétaire : conserver seulement le jeu avec les cartes sur le
plateau et un seul fichier jouable `JOUER.html`. La présentation personnages,
son bouton, sa préférence et ses styles spécifiques sont retirés. Le jeu web
et l’export démarrent toujours en cartes, même avec l’ancienne préférence off
ou un ancien lien `?cartes=0`. Les anciens combats 3×5 restent lisibles en cartes,
sans modifier leur géométrie, leurs règles ni leur sauvegarde.

Branche dédiée depuis la PR nº 33, tête exacte `063c9f61`, elle-même basée sur
main `9941596d`. Cette proposition dépend de la nº 33 et ne l’autorise pas à
être fusionnée. Chaque PR attend son accord spécifique. Détails et contrôles :
[EXPORT_UNIQUE_2026_10_22.md](EXPORT_UNIQUE_2026_10_22.md).
Les mentions de deux présentations et de quatre builds dans les sections
datées plus bas décrivent l’historique ; elles ne sont plus la consigne active.

## CSS par responsabilité — proposition du 22/10/2026

Base vérifiée : main `9941596d`, après fusion autorisée des PR nº 31 et nº 32.
Le socle `styles.css` contient les variables, la navigation et la typographie.
Dix-sept feuilles dans `styles/` regroupent composants, pages, cartes et combat,
avec leurs états et points de rupture. Les feuilles spécialisées dans `assets/`
gardent leur emplacement, leurs octets et leur priorité après le socle.
`index.html` est l'unique liste ordonnée ; `scripts/lib/stylesheets.mjs` la lit
pour le builder, qui embarque exactement les mêmes feuilles dans les deux jeux
autonomes. Aucun nouveau module de jeu ni dépendance npm. Voir
[la carte des responsabilités](../styles/README.md).

## Maintenance des vues et du CSS — intégrée par la PR nº 32

29 modules : `ui/markup.js` centralise l’échappement HTML pur (app, vues, cartes).
Les sous-rendus Collection (compétences/compositions) et plateau (case/unité/HUD/actions)
restent dans leurs modules existants. Seuls les champs d’état lus sont capturés.
La cascade CSS conserve son ordre et ses feuilles ; 22 déclarations dominées
sont retirées et la base reformattée. Aucun moteur, IA, image ou stockage modifié.
Voir [périmètre, validation et limites](MAINTENANCE_CSS_VUES_2026_10_22.md).
Les PR nº 31 et nº 32 ont été fusionnées sur accord spécifique le 22/10/2026.
Le découpage CSS décrit plus haut est une nouvelle proposition, sans accord de fusion.

## Audit de dépendances de l'interface — 22/10/2026

Les imports statiques inutilisés sont retirés des quatre points d'entrée d'interface
(`app.js`, `ui/views.js`, `ui/pages.js`, `ui/battle-view.js`).
Ce nettoyage ne déplace aucune fonction et ne modifie aucun calcul, état,
référence de sauvegarde ou rendu HTML. Le graphe conserve les dépendances du rendu vers les API du moteur,
sans import du DOM par le moteur. Deux tests surveillent les dépendances nommées
de ces écrans et l'absence de cycle sur l'ensemble de `src/`.

`styles.css` concentre encore des strates d'interface anciennes et des
déclarations au long cours ; le découpage CSS attend une comparaison réelle
des styles calculés sur desktop/mobile. Les fichiers de fond volumineux
contiennent les images embarquées indispensables au jeu hors réseau.
Les modules de rendu compactés attendent un reformatage progressif,
sans découpage arbitraire. Ce paragraphe décrit la PR de nettoyage, pas une
refonte du moteur.

# Architecture modulaire — V2.6

## Proposition du 21/10/2026 — alternance réelle joueur / IA

`engine/battle.js` conserve son calcul historique pour les parties sans `turnFlow`.
Sur les nouveaux combats avec `turnFlow: 'alternating'`, le même moteur résout
séparément le camp joueur puis adverse. L’IA continue d’utiliser `rankEnemyMoves`,
mais `playEnemyCard` expose une seule pose réelle par appel ; `finishEnemyTurn`
déclenche ensuite sa résolution. Les filtres optionnels de `battle-control.js`
ne changent pas le fonctionnement commun historique.

`app.js` orchestre les délais de présentation **après** application et sauvegarde
de chaque opération. `ui/combat-fx.js` anime uniquement les événements transitoires
du moteur en CSS et respecte les préférences de mouvement réduit. L’interface et
le moteur n’échangent pas de DOM ou d’événements persistants. `ui/storage.js`
accepte la phase `enemy` lors d’une sauvegarde. Voir
[le contrat de cette PR](TOURS_ALTERNES_2026_10_21.md).


## Cartes Forge — proposition du 21/10/2026

Toujours 28 modules. Dix associations explicites dans `visuals.js`, un reçu
d’import exact et dix entrées `kind: card` rejoignent les 32 images intégrées.
La galerie Forge officielle utilise les mêmes cinq zones que Sylve/Ombre ;
`generated-card.js` partage cette table après résolution du mapping individuel.
Le sélecteur Forge reprend les tailles de titres et nombres des cadres ornés,
sans changer les règles Aube/Sylve/Ombre. Pas de nouveau calcul ni module.
`browser_forge.py` réutilise le parcours commun : 60 projections de collection,
fiches, vraie pose, deux camps, HP blessés et sauvegarde sur trois formats.
Le repli neutre reste testé sur Éther. Sources, moteur et stockage inchangés.
[Contrôles](FORGE_INTEGRATION_2026_10_21.md).

## Cartes Ombre — intégrées par la PR nº 28

Toujours 28 modules. Onze mappings Ombre explicites rejoignent les 21 intégrés.
`generated-card.js` partage les coordonnées Sylve/Ombre vérifiées dans leurs
galeries officielles, après résolution d’un fichier explicitement catalogué.
La table de disposition reste pure et ne choisit aucune image par famille.
Les styles Ombre reçoivent une description à 3,2 cqw pour contenir le texte
complet de l’Inquisiteur ; Aube et Sylve gardent leurs typographies et zones.
Le parcours `browser_ombre.py` réutilise les vérifications partagées des cadres,
champs, vraie pose et reprise sur trois formats. Le repli neutre reste testé sur Éther depuis la proposition Forge.

## Cartes Sylve — intégrées par la PR nº 27

Toujours 28 modules. Les onze mappings Sylve sont explicites dans `visuals.js`.
Le même lecteur pur `generated-card.js` choisit les zones du cadre Aube ou Sylve
après résolution d’une image explicitement cataloguée. Aucun dessin par famille
implicite. Le compteur, le cartouche et les deux cercles Sylve ont leurs propres
coordonnées ; les textes de plus de 160 caractères utilisent une composition
plus petite, et restent lisibles en texte normal dans la fiche existante.
Les dix mappings Aube et leurs zones restent inchangés.

Les 21 exports suivent le même contrôle de provenance, reçu, SHA-256, dimensions
et poids avant empaquetage dans les quatre builds. La vue classique utilise
les images entières via `arenaSprite`, sans changer les règles. Les parcours
`browser_aube.py` et `browser_sylve.py` partagent le contrôle des cadres exacts
et des champs, puis la pose et la reprise sur trois formats d’écran.

## Cartes complètes Aube — intégrées par les PR nº 25/26

28 modules. `ui/generated-card.js` reçoit texte, attente et statistiques déjà
calculées ; il rend le cadre complet et ses cinq zones normalisées, sans moteur,
DOM ou sauvegarde. Il est partagé par `views.js`, `collection.js`, `card-arena.js`
et `card-inspection.js`. `arena-art.js` utilise aussi cette image dans la vue
classique, en entier ; nom et statistiques restent ceux du rendu classique.

Le mapping `CARD_TEMPLATES` de `visuals.js` contient les dix IDs Aube, chacun associé à son propre export. Les cartes
complètes et les portraits ont deux listes et deux tables d’images embarquées,
mais le même registre `assets/artwork.json`. Le lecteur
`scripts/lib/artwork.mjs` valide métadonnées, mapping, reçu exact, octets,
empreinte et dimensions réelles avant empaquetage. Les WebP hors registre
restent refusés dans les deux répertoires. Le builder n’effectue aucun export
automatique depuis l’atelier. Styles dans `assets/generated-card.css`.

La scène fixe utilise `overflow: clip` pour empêcher son déplacement involontaire
lors de l’ouverture d’un aperçu ; la grille et la main gardent leurs propres
défilements. Les calculs, le catalogue et les sauvegardes ne changent pas.
[Pilote](MILICIEN_INTEGRATION_2026_10_21.md) et
[lot Aube](AUBE_INTEGRATION_2026_10_21.md). `card-arena.js` partage le rendu pur
`campSeal` entre cartes et légende. Deux formes SVG distinguent les camps sans
trait sous la carte ; les stats et l’aperçu restent fournis par le moteur.

## Collection — intégrée par la PR nº 24, 21/10/2026

27 modules dans cette branche. `src/ui/collection.js` porte le catalogue par
personnage, les filtres purs et les fiches des six rangs. Il reçoit `cardUI`,
`btn` et `esc` des vues existantes ; aucune statistique ni règle n’est recopiée.
`pages.js` conserve les compositions, le deck et les compétences. `app.js`
garde les événements, la navigation et la fermeture des fiches. Les filtres
et fiches restent hors des sauvegardes.

`assets/collection.css` est limité à cet écran. Le fond JPEG embarqué passe
par `UI_BACKGROUNDS` dans `visuals.js`, `assets/ui-artwork.json` et
`scripts/lib/ui-artwork.mjs` : clé explicite, reçu de version, octets et SHA-256.
Le builder remplace les liens CSS et inclut automatiquement le nouveau module
dans JOUER et ESSAI_CARTES. Le registre des portraits reste vide.

Le moteur, le catalogue, l’IA et le stockage ne changent pas. Les cinq rangs
qui n’existent pas pour une unité sont des projections sans stats ni propriété.
[Périmètre et validation](COLLECTION_2026_10_21.md).

## État de la remise à zéro graphique du 20/10/2026

Les PR nº 20 et nº 22 sont intégrées sur main ; le jalon conserve 26 modules.
Voir [l’état actuel](ETAT_PROJET.md) et `../AGENTS.md` avant toute reprise. Les anciennes illustrations sont retirées ;
`assets/artwork.json` est vide et `visuals.js` fournit un SVG neutre. Le builder
contrôle les futurs reçus et empreintes et refuse les WebP non catalogués.
`ui/arena-art.js` garde le décor du plateau historique et remplace les silhouettes
par ce repère neutre. `ui/combat-fx.js` conserve son API avec une fin immédiate,
sans ancien lecteur d'effets. Aucune règle, IA ou sauvegarde modifiée par rapport
à la base nº 20. Décor peint, cadres et interactions conservés.

Les comptes de modules, portraits et propositions ci-dessous sont historiques.

Le moteur reste indépendant du DOM, du navigateur et des sauvegardes. Le principe de conception est décrit dans `AGENTS.md` et la refonte initiale dans `ARCHITECTURE_MODULAIRE_V2_5.md`.

```text
src/
  data.js, talents.js, dungeons.js, ai.js, visuals.js
  engine.js                   Façade publique stable
  engine/
    profile.js                Profil, deck manuel, validation, progression et équipements
    deck-builder.js           Propositions automatiques de decks / analyses pures
    battle.js                 Moteur des combats
    dungeon-run.js            Parcours des expéditions
    economy.js                Récompenses, artisanat et ressources
  app.js                      Événements de l'interface, confirmations et navigation
  ui/
    pages.js                  Écrans et atelier de compositions
    views.js                  Composants partagés et cartes
    battle-view.js            Plateau tactique
    combat-fx.js              Animations
    storage.js                Adaptateur localStorage
```

- **17 modules** au total. `deck-builder.js` importe uniquement les cartes et `validateDeck` ; ni mutation du profil en aperçu, ni import de l'interface dans le moteur.
- `proposeDeck(profile,style)` calcule une proposition à partir de la collection ; `applyDeckStyle(profile,style)` remplace uniquement le tableau `deck` après validation.
- `pages.js` affiche les quatre propositions et les statistiques ; `app.js` affiche une confirmation avant toute application et bloque le changement pendant les combats actifs.
- Le générateur de `JOUER.html` inclut automatiquement les nouveaux imports. Le HTML final n'expose pas de variables internes et contient 12 illustrations intégrées.
- API `src/engine.js` et les clés `couronnes_arcanes_v1`, `couronnes_arcanes_bataille_v1` inchangées. Aucun champ supplémentaire dans les sauvegardes.
- À vérifier à chaque modification : `npm test`, `npm run test:parity`, `npm run build`, les tests Playwright dédiés et les contrôles historiques pertinents.

## Extension V2.11 — géométrie et art de l’arène

`src/engine/board.js` centralise les dimensions, colonnes des couronnes, cases d’entrée, colonnes centrales des pièges et validation des formats sauvegardés. Module pur, partagé par combat, contrôles, compétences, IA, rendu, stockage et simulateur ; il n’importe aucun de ces consommateurs. Les règles lisent le tableau existant, ce qui maintient les combats 3×5.

`src/ui/arena-art.js` dessine le décor et les silhouettes partagées en SVG sur une grille de pixels. Il ne dépend ni du DOM ni du moteur. Les sources font maintenant 22 modules empaquetés. `battle.js` reste cohérent à 372 lignes ; les vues historiques à lignes longues ne sont pas refondues dans cette mission.


## Historique — Arène peinte fixe (intégrée par la PR nº 14)

`src/ui/painted-arena.js` regroupe la projection des cases sur l'image choisie, les ancrages des unités/héros et l'adaptation de la scène au viewport. Il ne dépend ni du moteur ni des données de cartes. `battle-view.js` réutilise le rendu historique des cellules et les indices du moteur. `app.js` monte la scène et conserve ses deux défilements ; `combat-fx.js` connaît les ancrages mais n'anime pas le mode fixe. Ressource autonome et styles séparés dans `assets/backgrounds/`, inclus dans le builder. 23 modules empaquetés, mappings portraits et sauvegardes inchangés. Contrat et résultats : `docs/ARENE_PEINTE.md`.

**État actualisé le 14/10/2026 :** arène peinte intégrée par la PR nº 14 ; pilote Arbalétrière intégré par la PR nº 15, main `f896a0c3`, avec 13 portraits.

## Proposition — statistiques et capacités après la PR nº 15

- `src/engine/unit-stats.js` dépend des données et du profil, sans DOM. Il expose le contexte de bonus du profil et les statistiques d'invocation, consommés par `battle.js`, `ui/views.js` et `ui/card-inspection.js`. `profile.js` exporte son calcul existant `gearBonus` ; la copie de `battle.js` est supprimée.
- `src/ui/card-inspection.js` gère le contenu et l'état de lecture éphémère de la main. `app.js` conserve les actions de jeu et appelle le lecteur ; aucune dépendance du moteur vers l'interface.
- La main utilise l'instantané de la bataille (y compris une sauvegarde historique) ; la collection utilise le profil actuel. Aucun champ ajouté au stockage. Le constructeur garde l'ordre des propriétés pour préserver la parité sérialisée.
- 25 modules empaquetés automatiquement, 13 portraits inchangés. `battle.js` reste à 371 lignes et `app.js` à 221 ; les deux nouveaux modules font moins de 40 lignes chacun.

## Vue cartes optionnelle — PR nº 20, 20 octobre

`ui/card-arena.js` rend les vraies unités comme cartes sur les cases existantes. Il dépend des données et du mapping graphique, sans règle ni sauvegarde de bataille. Un bouton de présentation réversible conserve uniquement une préférence graphique ; la même application et le même moteur sont empaquetés pour JOUER et ESSAI_CARTES. 26 modules, 18 portraits. Aucun changement d'API du moteur ou de schéma de profil/combat. Voir `ESSAI_CARTES_2026_10_20.md`.

La présentation plein écran de la vue cartes reste dans `assets/card-arena.css` ; `battle-view.js` place la main dans la scène et replie les informations dans un élément `details` natif. `painted-arena.js` réserve l'espace entre HUD et main par une seule transformation décor/cases/VFX. `views.js` réutilise le cadre illustré pour toutes les cartes de la main en vue cartes. Aucun module ni dépendance métier ajouté.

`ui/card-inspection.js` réunit désormais modèle de lecture du plateau (uid, statistiques et états actuels), contenu commun main/plateau, placement et événements de consultation. Il reste sans écriture métier ni stockage ; `formationBonus` est réutilisé depuis le moteur. `assets/card-preview.css` porte le cadre partagé et est embarqué par le générateur. `app.js` garde seulement l'activation/fermeture et les actions du jeu ; les clones de combat sont inertes. Toujours 26 modules et 18 portraits.

## Pose sur trois cases — PR nº 20

`engine/board.js` définit `deploymentColumns`, `validDeploymentColumn` et `freeDeploymentColumn` d’après le tableau réel (trois cases pour dix colonnes, une pour les anciens 3×5). `battle.js` valide la colonne optionnelle avant toute consommation, invoque exactement sur cette case et réutilise le hook d’entrée des pièges. L’appel sans colonne garde l’entrée historique. `ai.js` choisit une place libre dans la zone miroir ; le robot partagé `scripts/lib/battle_runner.mjs` emploie la même règle. Les sorts restent ciblés par ligne.

`battle-view.js` rend les trois cibles de pose et transmet `data-col` à `app.js`. Le contrôleur d’aperçu ne contient plus d’état épinglé ; pointerdown/clic et sélection ferment la fiche et bloquent sa réouverture sur le même élément jusqu’à sa sortie. Focus clavier et survol restent disponibles. Aucun nouveau module, champ de sauvegarde ou mapping graphique.

