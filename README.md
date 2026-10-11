# Couronnes & Arcanes — V2.7 (audit des compositions)


## Nouveauté V2.7 — compositions évaluées sur plusieurs stratégies

- Comparateur reproductible : `DECK_SEEDS=32 npm run deck-balance` (24 configurations, 16 rencontres, 32 graines = 12 288 combats par version).
- Le style **Arcanes** privilégie désormais trois sorts au lieu de cinq ; unités magiques mieux représentées et meilleures performances avec le joueur automatisé testé.
- Aucune modification des dégâts, cartes, adversaires, talents ou clés de sauvegarde ; les styles Équilibré, Assaut rapide et Rempart sont inchangés.
- Simulateur mutualisé dans `scripts/lib/`, résultats comparatifs et limites dans `docs/DECK_BALANCE_V2_7.md`.
- Un workflow GitHub Actions de test est prêt dans `.github/workflows/test.yml`. Il s'exécutera **une fois le dépôt publié sur GitHub**.

## Nouveauté V2.6 — quatre stratégies de deck

Dans **Collection & deck → Atelier de compositions**, choisissez parmi **Équilibré**, **Assaut rapide**, **Rempart** et **Arcanes**. Chaque proposition est construite **exclusivement avec les exemplaires réellement possédés**, dans la limite de 12 à 24 cartes. Les cartes restent dans la collection et aucune ressource n'est dépensée.

- **Prévisualiser** affiche la liste exacte sans changer la sauvegarde.
- **Appliquer** remplace le deck courant uniquement après confirmation ; la modification manuelle reste possible.
- Un combat actif interdit le remplacement. Les anciennes sauvegardes restent compatibles : aucun champ obligatoire ajouté.
- `src/engine/deck-builder.js` gère la sélection déterministe ; `src/ui/pages.js` l'affiche et `src/app.js` orchestre la confirmation.
- Tests : `npm test` (115 tests), `npm run test:parity` (60 scénarios de combat inchangés), `npm run build`, `python3 tests/browser_decks_v26.py` (bureau/mobile). Voir `docs/COMPOSITIONS_DECKS_V2_6.md`.

## Nouveauté V2.5 — refonte technique, aucun changement de gameplay

- Le moteur est réparti entre `src/engine/profile.js`, `battle.js`, `dungeon-run.js`, `economy.js` et l'ancienne API `src/engine.js` est conservée comme façade.
- L'interface utilise `src/ui/views.js`, `pages.js`, `battle-view.js`, `combat-fx.js` et `storage.js`. Le fichier `src/app.js` ne sert plus qu'à orchestrer les actions.
- La compilation suit automatiquement les dépendances : `npm run build` produit le HTML autonome, `npm run build:test` le HTML **réservé aux tests**, `npm run test:parity` compare 60 états de combat déterministes avec V2.4.
- Clés de sauvegarde et 60 cartes inchangées. Documentation détaillée : `docs/ARCHITECTURE_MODULAIRE_V2_5.md`.

## Jouer immédiatement

**Option la plus simple :** ouvrir le fichier **`JOUER.html`** dans un navigateur moderne (Chrome, Edge, Firefox). Le fichier inclut tout le code et le style : il n'a besoin ni d'installation, ni de compte, ni d'Internet.

**Option développeur / Work / Codex :** ouvrir ce dossier dans un éditeur et lancer :

```bash
python3 -m http.server 8080
```

Puis aller sur `http://localhost:8080` depuis le même ordinateur. Le projet source modulaire est `index.html` + `styles.css` + `src/` et utilise des modules JavaScript. Ne pas ouvrir `index.html` directement en `file://`, car certains navigateurs bloquent les importations de modules locaux. Pour un lancement direct, utiliser **`JOUER.html`**.

## Version 2.4 — Rééquilibrage vérifié des talents

- **Réserve de flèches (Rôdeur)** : une seule pioche supplémentaire par combat, avec état visible « disponible / utilisée » ; aucune pioche perdue quand la main est pleine.
- **Tir précis, Écho des étoiles, Purification, Main secourable et Rempart ancien** ont des bonus réajustés ; descriptions affichées en jeu à jour.
- **Comparateur reproductible** : `TALENT_SEEDS=32 npm run talent-balance`. Les tableaux avant/après des 16 talents, et des combinaisons possibles, figurent dans `docs/EQUILIBRAGE_TALENTS_V2_4.md` et ses deux fichiers JSON.
- **Testé** : 102 tests Node, navigateur Chromium desktop/mobile et sauvegardes héritées. Aucun reset d'XP, aucune modification des récompenses.

## Version 2.3 — Choisir sa voie de héros

- **Quatre arbres de talents** : Gardien, Arcaniste, Rôdeur et Clerc. Chacun comporte 4 talents, répartis en 2 paliers exclusifs : **niveau 4** et **niveau 8**. On choisit 1 talent par palier, soit 2 talents actifs au maximum par classe.
- **16 talents originaux** : défense, soin, sort, pioche, purification, sans attaque passive sur les cartes. Seuls certains pouvoirs de héros obtiennent un léger bonus offensif.
- **Choix gratuits** : dans **Atelier → Arbre de talents**. Un talent peut être remplacé entre deux combats ; chaque classe garde ses propres choix.
- **Sauvegarde** : champ facultatif `talents` ajouté au profil ; anciennes sauvegardes chargées normalement. Un combat mémorise un instantané des talents choisis au lancement pour éviter les changements pendant la bataille. Les anciens combats sauvegardés restent valides sans champ `heroTalents`.
- **Équilibrage** : aucun coût en argent réel, en or ou en éclats ; aucun changement des taux d'XP ou des récompenses V2.1/V2.2.
- **Contrôle** : `npm test` (98 tests), `tests/browser_talents_v23.py` (bureau et mobile), et parcours historiques des donjons, événements, sauvegardes et effets visuels.

Voir `docs/TALENTS_V2_3.md` pour les règles détaillées.

## Version 2.2 — Progression du héros et maîtrise des cartes

- **Héros** : expérience gagnée en combat et 12 niveaux. Victoire : `22 + 6 × difficulté` XP. Une défaite après au moins trois tours avec une carte jouée rapporte 5 XP ; une retraite immédiate ne rapporte aucune XP. Au niveau 5 et 9, le souverain obtient chacun +1 bouclier de départ (maximum +2). Aucune augmentation permanente d'attaque.
- **Cartes** : en combat, chaque carte réellement jouée gagne de la maîtrise à la résolution (jusqu'à deux utilisations prises en compte, plus un point en cas de victoire) ; seuils : rang 1 à 4 XP, rang 2 à 10 XP, rang 3 à 22 XP. Une **unité** de rang 3 obtient **+1 PV** au prochain combat (maximum), sans bonus d'attaque. Les **sorts** gagnent une progression visuelle seulement.
- **Interface** : niveau du souverain en en-tête et sur la Citadelle, barre d'XP, jauges de maîtrise dans la collection/atelier, insignes sur les cartes, XP affichée à la fin des combats.
- **Économie** : ni monnaie premium, ni ressources supplémentaires automatiques par niveau. Les valeurs d'or/éclats équilibrées en V2.1 restent inchangées.
- **Sauvegardes** : mêmes clés locales et ajout non destructif des champs `heroXp` et `mastery`. Les anciennes sauvegardes commencent au niveau 1 avec maîtrise 0. Les gains ne peuvent pas être réclamés deux fois en rejouant la résolution du même combat.
- **Tests** : `npm test`, `python3 tests/browser_progression_v22.py`, `python3 tests/browser_smoke.py`, `python3 tests/browser_dungeons.py`.

## Version 2.1 — Difficulté et récompenses ajustées

- La campagne démarre plus doucement : missions 01 et 03 légèrement allégées ; correction d'un pic de difficulté en mission 11 ; Tour 1–4 moins sévère ; boss du premier donjon légèrement ajusté.
- Les embuscades de donjon rapportent maintenant **100 ou 115 or**, et **40 ou 48 éclats** selon l'étape, uniquement en cas de victoire. Le coffre garanti et le repos sont inchangés. La défaite en embuscade clôt toujours l'expédition.
- Le banc d'essai `npm run balance -- --summary`, `npm run balance -- --mid --summary`, `npm run balance -- --developed --summary` simule une stratégie automatisée déterministe, pas de véritables joueurs. Voir les chiffres, hypothèses et limites dans `docs/EQUILIBRAGE_V2_1.md`.
- Les sauvegardes restent compatibles, sans remise à zéro.

## Version 2.0 — Choisir son chemin entre les salles

- Après chacune des deux premières salles d'un donjon, un **choix obligatoire** est proposé :
  - **Repos** : soigne jusqu'à **10 PV supplémentaires**, en plus des 6 PV rendus après la victoire.
  - **Coffre ancien** : donne immédiatement **35 + 10 × l'indice de salle** pièces d’or et **12 + 5 × l'indice de salle** éclats (indice 1 ou 2), sans hasard.
  - **Embuscade risquée** : déclenche **un vrai combat supplémentaire** ; victoire = récompense supplémentaire et 6 PV de repos, défaite = fin du donjon. Aucun butin avant la victoire.
- Un seul événement peut être pris à chaque transition ; la décision et le combat bonus sont conservés dans la sauvegarde locale. Les anciennes sauvegardes V1.9 sans phase de donjon migrent vers `ready`.
- Trois donjons, trois combats principaux chacun ; selon les choix, une expédition peut comporter jusqu'à **cinq combats**. Aucun serveur, PvP ou mode coopératif.
- 76 tests JavaScript réussis, plus des parcours Chromium ordinateur/mobile pour les événements et les donjons. Tests de réouverture via stockage simulé ; test de rechargement réel sur l’appareil du joueur encore souhaitable.

Guide technique : `docs/EVENEMENTS_V2_0.md`.

## Version 1.9 — Donjons solo à plusieurs combats

- **Trois donjons distincts** (Sylve, Forge, Cryptes), chacun en trois combats avec un boss final.
- Les **PV du héros sont conservés** d'une salle à l'autre, avec **+6 PV de repos** après chaque victoire ; pas de soin instantané complet.
- Or et éclats accordés à chaque étape, bonus de fin de donjon et carte originale garantie **une seule fois** à la première victoire complète ; les donjons restent rejouables.
- Une défaite ou un abandon annule l'expédition mais conserve les ressources des salles déjà gagnées.
- Progression et salle actuelle sauvegardées dans le profil existant, compatible avec V1.8 ; reprise en ouvrant de nouveau le jeu.
- **Mode solo et hors ligne uniquement**. Il n'existe pas encore de donjons coopératifs ou de génération procédurale de salles.

Plus d'informations : `docs/DONJONS_V1_9.md`.

## Version 1.8 — Adversaires aux stratégies distinctes

La campagne (12 missions) et la Tour (20 étages) attribuent désormais un **profil tactique visible** : **Assaut** (offensive), **Bastion** (gardiens et soins), **Rituel** (magie et contrôle) ou **Meute** (formations de faction). Le profil **Équilibré** est le comportement de compatibilité pour les anciennes batailles. Les boss changent de priorité quand leurs PV tombent à 50 % ou moins : ils entrent en **Furie** et cherchent davantage à attaquer, sans carte, mana, statistique ou action gratuite. Ces comportements se fondent exclusivement sur le plateau et la main de l'adversaire, avec la limite existante de deux cartes par tour.

L'écran de mission annonce la stratégie adverse. Le combat affiche la personnalité, l'éventuelle phase de furie et le dernier plan choisi. Voir `src/ai.js` et `docs/IA_PERSONNALITES_V1_8.md`.

## Version 1.7 — IA de combat contextuelle

Le nouveau fichier `src/ai.js` évalue chaque carte utilisable de la main adverse sur chacune des trois lignes, uniquement à partir du plateau visible et de la main de l'IA. Il privilégie la défense d'une ligne menacée, les sorts qui éliminent une menace, les soins utiles et les formations de faction. Il recalcule ses choix après chaque pose et n'utilise que les deux actions autorisées par tour. Le dernier plan adverse est lisible sur l'écran de combat. L'algorithme est une **heuristique déterministe**, pas une IA qui s'entraîne ou apprend en permanence. Il n'y a pas de multijoueur.

## Version 1.6 — Charge et Riposte

Les loups, cavaliers et quelques créatures rapides bénéficient de **Charge** : une attaque gagne +2 dégâts si la créature s’est déplacée pendant le même tour. Certaines unités de défense possèdent **Riposte** : lorsqu’elles survivent à un coup au contact, elles infligent 2 dégâts (avant armure) à l’assaillant, au maximum une fois par tour. Les deux mécaniques sont utilisables par le joueur et par l’IA, avec des étiquettes visibles sur les cartes et dans le guide. Les sauvegardes V1 restent compatibles et les 60 cartes sont conservées.

## Version 1.4 — Bestiaire illustré

Les 60 cartes utilisent désormais **12 illustrations fantasy originales**, créées pour ce projet et réparties par archétypes visuels (chevaliers, elfes, golems, dragons, créatures des ombres, magie et soins). Ces visuels apparaissent **sur les cartes et sur le plateau de combat**. Les créatures disposent de mouvements visuels selon leur rôle : unité lourde, archer, bête, créature volante, mage, soutien, mort-vivant ou guerrier. Les assauts et les impacts jouent une animation ponctuelle, tandis que le moteur de combat reste inchangé.

Les illustrations sont des **portraits recadrés issus des images conceptuelles générées pour le projet**. Ce ne sont **pas encore** des sprites détourés, des séquences d'animation image par image, ni des illustrations uniques pour les 60 cartes. L'animation est réalisée en CSS et par le navigateur. Le fichier autonome intègre les images et reste hors ligne ; les sauvegardes V1 restent compatibles. Voir `src/visuals.js` et `assets/creatures/`.

## Version 1.3 — Champ de bataille vivant

La recherche historique est conservée dans **`docs/INVENTAIRE_HISTORIQUE_KINGS_AND_LEGENDS.md`**. Elle distingue ce que le jeu original proposait et ce que nous avons réellement programmé.

Cette V1.3 ajoute des animations pilotées par le moteur : déplacement des créatures, éclairs et flèches, impacts, dégâts flottants, sorts, pouvoirs et invocations. Un interrupteur dans le combat permet de les désactiver et le réglage système « animations réduites » est respecté. Il s’agit toujours d’effets CSS et de symboles, **pas encore de sprites de personnages illustrés image par image**. Les sauvegardes restent compatibles.

## Ce que vous pouvez faire maintenant

- 12 missions contre une IA, divisées en 4 régions et 4 boss, et une **tour de 20 étages**.
- Une collection de **60 cartes originales**, en 5 factions plus les sorts.
- Composer un deck de 12 à 24 cartes (18 au départ).
- Jouer sur 3 lignes avec invocation différée, déplacements et attaques automatiques.
- **Créer des formations : deux alliés d’un même Ordre sur une ligne gagnent chacun +1 attaque.** Le bonus est dynamique, signalé sur le plateau et fonctionne aussi pour l’IA.
- Choisir parmi **4 classes de héros** et lancer leurs pouvoirs.
- Améliorer des cartes (3 niveaux), 3 bâtiments de la citadelle et acheter des paquets avec l'or gagné en jeu.
- **Fabriquer et équiper six objets**, choisir arme, armure et relique.
- Gagner de la **réputation auprès des cinq factions** : débloquer jusqu’à +3 PV par unité de leur ordre.
- Dans la page **Alchimie**, extraire les cartes en surplus pour des éclats et fabriquer des cartes sélectionnées avec des recettes sans échec.
- Retrouver votre progression via la sauvegarde du navigateur ; exporter/importer un profil dans le Guide.
- Reprendre une bataille interrompue dans un navigateur où le stockage local fonctionne.
- Jouer sans serveur ni service externe : aucune transaction réelle.

## Commandes de contrôle qualité

```bash
node --test tests/*.test.mjs
```

**102 tests JavaScript réussis en V2.4.** Lancez-les après chaque modification. En option, si Chromium et Playwright Python sont installés, lancez `python3 tests/browser_smoke.py`, `python3 tests/browser_vfx.py`, `python3 tests/browser_creatures.py`, `python3 tests/browser_traits.py`, `python3 tests/browser_v16.py` et `python3 tests/browser_v17.py`. Un parcours initial dans Chromium a également été réalisé (démarrer, jouer une carte, terminer un tour, quitter le combat), sans erreur JavaScript.

## Compatibilité des sauvegardes V1

La nouvelle édition conserve les clés localStorage historiques et complète les profils précédents avec les nouveaux champs (équipement, réputation, tour). **Une sauvegarde de sécurité par export JSON reste recommandée avant les mises à jour.**

## Limites actuelles — à lire

Il s'agit d'une **première édition solo fonctionnelle**, pas d'un grand jeu commercial déjà terminé. Les illustrations sont pour l'instant des compositions vectorielles et symboles, les personnages disposent maintenant d’illustrations partagées et animées en CSS, sans sprites détourés image par image, l'IA tactique reste une heuristique (sans apprentissage), le multijoueur/coop et les donjons en coop ne sont pas présents, et la campagne intégrale n'a pas été testée humainement. Les combats et récompenses demandent encore des sessions d'équilibrage. Le rendu téléphone doit être confirmé sur de vrais appareils.

**Voir `docs/BIBLE_DU_JEU.md` pour la vision complète** et **`docs/CODEX_WORK_MISSION.md` pour continuer le développement avec Work / Codex**.

## Historique des versions

Voir `CHANGELOG.md` pour les modifications des versions V1.0 à V1.5.1.

## Architecture

```
Couronnes_et_Arcanes/
├── JOUER.html                 ← fichier autonome pour jouer directement
├── index.html                 ← interface modulaire (serveur local)
├── styles.css                 ← identité graphique responsive
├── src/
│   ├── data.js                ← 60 cartes, 12 missions, héros/factions
│   ├── engine.js              ← moteur, IA, progression, économie
│   ├── visuals.js             ← sélection des illustrations et des rôles
│   └── app.js                 ← écran, interactions et sauvegarde
├── assets/creatures/          ← 12 illustrations WebP originales
├── src/ai.js                   ← classement des actions de l’IA tactique
├── tests/                      ← tests moteur et navigateur
├── AGENTS.md                  ← consignes persistantes pour Codex
├── CHANGELOG.md
└── docs/
    ├── BIBLE_DU_JEU.md
    ├── INVENTAIRE_HISTORIQUE_KINGS_AND_LEGENDS.md
    └── CODEX_WORK_MISSION.md
```

## Sauvegardes et précautions

Les profils sont stockés dans le navigateur (`localStorage`) : supprimer les données du navigateur peut effacer la progression. L'export/import JSON permet de conserver une copie portable. Les parties en cours ont une sauvegarde locale distincte. Les sauvegardes locales ne constituent pas une sécurité contre la triche et ne sont pas utilisables en l'état pour un PvP compétitif.

## Propriété intellectuelle

Jeu original s'inspirant de mécaniques génériques des CCG tactiques en lignes. N'utilise pas les noms, graphismes, cartes, musiques ou logos de *Kings and Legends*.

## Nouveautés V1.5

- **Vol** : certaines créatures peuvent franchir une case occupée par une unité **alliée** lorsqu’elles avancent ; les ennemis adjacents restent combattus normalement.
- **Garde** : certaines unités interceptent les attaques **directes destinées à la couronne sur leur ligne** ; cette règle ne protège pas automatiquement les créatures voisines et n’empêche pas les sorts visant plusieurs cibles.
- **Traits visibles** : les cartes affichent désormais leurs capacités tactiques sous forme d’étiquettes.


## Audit de livraison V1.5.1

L’audit a corrigé les documents de reprise restés à la V1.4 et clarifié la portée des traits Vol/Garde. Deux tests moteur supplémentaires vérifient le contact ennemi et la protection de la couronne IA. Un contrôle Chromium `tests/browser_traits.py` valide l’affichage des traits et le chargement du combat. Voir `docs/AUDIT_V1_5.md`.
