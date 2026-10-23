## Proposition de publication web — 23 octobre 2026

Main vérifié : `ef675bba`, PR 35/36/37 fusionnées. Une branche indépendante
prépare `dist/` depuis les sources existantes et une configuration Vercel.
Aucun site ni déploiement automatique encore activés : espace d'hébergement
à sélectionner/connecter et blocage sur CI à vérifier. Voir
[publication web](PUBLICATION_WEB_2026_10_23.md). Aucune fusion autorisée.

# Version réunie — 23 octobre 2026

Le propriétaire a demandé explicitement de fusionner les PR ouvertes du jeu :
nº 35 (Guide), nº 36 (effets de combat) et nº 37 (laboratoire).
La nº 35 est intégrée à `420744563110952c1cc5538e7e56559154285a72`.
Les sources de cette version réunissent les trois évolutions ; la branche du
laboratoire conserve les commits originaux comme parents pour tracer les PR.
Les contrôles finaux et la reconstruction de `JOUER.html` précèdent la fusion.

- Même jeu web et unique export autonome, 42 images existantes, 34 modules.
- Résultat moteur calculé avant les effets ; projections transitoires hors stockage.
- Laboratoire sans XP/récompense ni écriture de l'aventure ; Milicien pilote uniquement.
- Commandes ×2 et Passer également disponibles en bataille de laboratoire.
- Aucun import d'images Éther ni fusion de l'atelier dans ce lot.
- Aucune autorisation d'auto-merge ni de fusion des futures PR.

Voir [effets](EFFETS_COMBAT_2026_10_23.md),
[laboratoire](LABORATOIRE_2026_10_23.md) et
[maintenance](MAINTENANCE_GUIDE_2026_10_23.md).
Les sections suivantes sont les notes datées de chaque proposition.

---

## Proposition — Laboratoire de combat intégré, 23 octobre 2026

Une branche indépendante `feat/laboratoire-developpeur-20261023` ajoute un bouton
Développeur, deux decks configurables et une vraie bataille de test utilisant le
moteur existant, sans sauvegarde ni récompense. Premier prototype de progression
Commune→Divine du Milicien, sans nouvelle illustration. Les autres cartes gardent
leurs règles actuelles. Voir [contrat](LABORATOIRE_2026_10_23.md).
La PR reste à valider ; aucune fusion autorisée. La PR nº 35 de maintenance du
Guide est séparée : vérifier les éventuelles mises à jour documentaires lors de
leur intégration. Les paragraphes datés plus bas sont historiques.

---

# Proposition du 23 octobre 2026 — effets et lecture des tours

Main réel au départ : `adf9c919` ; PR nº 33 et nº 34 fusionnées. Les sections
plus bas qui les présentent comme en attente sont historiques.
Branche `feat/effets-combat-lisibles-20261023` : instantanés publics,
lecture séquentielle des mouvements/attaques, vraies pertes de PV/protection,
bandeau et déroulé, vitesse ×2, passage de séquence et suivi mobile.
Règles, IA, illustrations et clés de sauvegarde conservées ; 31 modules.
[Contrat, périmètre et limites](EFFETS_COMBAT_2026_10_23.md).
Aucune fusion autorisée. La maintenance du Guide reste une évolution séparée.

---


# État intégré vérifié le 23 octobre 2026

Dernier `main` confirmé : `adf9c9192293ea2e25849f37a0ac11d1df08c951`.
Les PR 31, 32, 33 et 34 sont **fusionnées** avec l'accord du propriétaire.
La distribution comporte une seule vue cartes, un seul `JOUER.html` autonome,
et 17 feuilles CSS spécialisées. `ESSAI_CARTES.html` est supprimé.
Moteur, IA, progression, catalogue et anciennes sauvegardes 3×5 préservés.

La branche `refactor/guide-module-documentation-20261023` propose
l'extraction isolée du Guide (`src/ui/guide-page.js`) et la remise à jour de
la documentation. Elle n'est **pas intégrée** ; la fusion exige son accord propre.
[Note de maintenance](MAINTENANCE_GUIDE_2026_10_23.md).

---

## Historique des propositions : les statuts de PR ci-dessous sont datés

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

# Modularisation CSS — proposition du 22 octobre 2026

- Main vérifié : `9941596d16e39d7f48fc0b082ee41b77e5d573b7`. Les PR nº 31
  et nº 32 sont fusionnées après autorisation explicite et spécifique.
- Nouvelle branche `refactor/css-modules-20261022` depuis cet arbre exact.
  `styles.css` devient le socle ; 17 feuilles regroupent les responsabilités.
  Le builder utilise la même liste de feuilles que le jeu web, dans `index.html`.
- Aucun moteur, IA, catalogue, image, stockage ou rendu volontairement modifié.
  [Organisation](../styles/README.md) et
  [contrôles de cette proposition](MODULARISATION_CSS_2026_10_22.md).
- Cette nouvelle proposition reste à faire valider ; aucune fusion autorisée.

---

# Contre-audit et maintenance — historique avant fusion du 22 octobre 2026

- Main vérifié : `dd2aa52`. Forge nº 29 et tours alternés nº 30 sont intégrés.
- PR nº 31 ouverte : 149 imports supprimés vérifiés indépendamment ; un 150e
  (`aiStyle` dans pages.js) retiré après détection d’un faux positif du garde.
  Voir [rapport indépendant](CONTRE_AUDIT_PR31_2026_10_22.md).
- Branche complémentaire `refactor/css-vues-maintenance-20261022`, basée sur
  la nº 31 corrigée : CSS consolidé, sous-rendus explicites et échappement partagé.
  [Périmètre et contrôles réellement exécutés](MAINTENANCE_CSS_VUES_2026_10_22.md).
- Deux propositions séparées, aucune fusion autorisée. Les paragraphes plus bas
  gardent leurs dates et décrivent des étapes historiques.

---

# Vérification GitHub — 22 octobre 2026

- Dernier `main` vérifié au démarrage de cet audit : `dd2aa52bf9eb1373073faa2bcb1fb72a4d04a580`. La PR nº 30 (tours alternés, phase de jeu adverse visible) y est **fusionnée** ; les paragraphes datés ci-dessous la présentant comme une proposition à valider décrivent une étape passée.
- Aucune PR ouverte dans le dépôt jeu lors de la vérification du 22 octobre. La PR de maintenance des imports est distincte, ne change ni les règles, ni l'IA, ni les sauvegardes, ni les graphismes.
- L'audit constate des listes de dépendances copiées lors du découpage des vues. Retrait ciblé des liaisons inutilisées dans `src/app.js`, `src/ui/views.js`, `src/ui/pages.js` et `src/ui/battle-view.js` ; gardes de tests des dépendances nommées et des cycles. Les gros rendus HTML et la cascade `styles.css` restent à analyser visuellement avant un refactoring distinct.
- Les exports autonomes sont régénérés depuis les sources et doivent être comparés par CI avant toute fusion. Le rapport de PR distingue contrôles effectués et limites.

---

## Proposition de tours alternés — PR à valider

- Branche `feat/tours-alternes-ia-visible-20261021`, créée depuis le dernier main GitHub `9e0087ca5503995014aa30f0a31d06bf77cb893e` (Forge nº 29 déjà fusionnée).
- Nouveaux combats : validation du joueur → mouvement/attaques alliés → pose visible de 0 à 2 cartes par l’IA → mouvement/attaques adverses → pioche. Anciennes sauvegardes maintenues sur l’ancien moteur, sans conversion silencieuse.
- Effets visuels CSS depuis les événements moteur, sans animation graphique nouvelle ni modification de cartes ; phase adverse sauvegardable. [Règles, périmètre, limites](TOURS_ALTERNES_2026_10_21.md).
- Équilibrage à refaire sur le nouveau mode ; aucun résultat de benchmark historique ne le valide. Attendre revue des contrôles de la PR, et accord spécifique avant fusion.

# État de reprise — 21 octobre 2026

## Proposition Légions de la Forge en cours

- Branche `feat/forge-cartes-20261021`, depuis le dernier main vérifié
  `ee8a2482841b722e5fb7e761a1df0c712ac75243`, après la fusion autorisée nº 28.
- Dix WebP v01 de la PR atelier nº 25, commit exact
  `ceb0a916959925ad6a41057d11210a3ae84341e5`. Marteau validé artistiquement ;
  neuf images y restent review. Demande d’import actuelle et dix empreintes
  dans `approvals/forge-dix-cartes-v01.json` ; manifeste atelier conservé.
- 42 cartes complètes, 28 modules. Mapping individuel, cadres entiers, zones
  communes aux galeries Sylve/Ombre/Forge, noms et valeurs dynamiques dans
  Collection, main, fiches et plateau. Éther garde son repère neutre.
- Aucune règle, IA, possession, rareté ni sauvegarde modifiée. Rangs futurs
  « À concevoir ». Nouvelle PR séparée, aucune fusion autorisée.
- [Périmètre, contrôles et limites](FORGE_INTEGRATION_2026_10_21.md).

## Cour des Ombres intégrée — PR nº 28

- Fusion à `ee8a2482841b722e5fb7e761a1df0c712ac75243` après « vasy fusionne ».
- Onze exports exacts de la PR atelier nº 24, à `e1022f20`, ajoutés aux
  21 Aube/Sylve ; valeurs dynamiques et sources artistiques distinctes.
- Main vérifié avant la mission Forge ; PR atelier séparée, non fusionnée.
- [Périmètre et bilan datés](OMBRE_INTEGRATION_2026_10_21.md).

## Sylve intégrée — PR nº 27

- Fusion à `3c208df3eb3d5a57953e0c3bd0ee91069895edab` après « vasy fusionne ».
- Onze sources exactes épinglées à `c9b8bd8c`, images en bois/racines, zones
  normalisées et valeurs dynamiques. Dix Aube conservés. La PR atelier reste séparée.
- CI avant fusion réussie sur `9c76d0b7`, 285 tests, 60 parités et parcours navigateur.
  Main après fusion vérifié identique à cet arbre, sans fichier modifié.
- [Périmètre et bilan datés](SYLVE_INTEGRATION_2026_10_21.md).

## Milicien et Aube intégrés — PR nº 25 puis nº 26

- PR nº 25 fusionnée à `2787b1667871efe9fb1ae21528a17cd6b7e57e27` et nº 26 à
  `4b48b05f524a04814c67a58f0420e7262a31d3e3`, après « tu peux fusionner les pr ».
- Dix cadres complets, textes et valeurs dynamiques. Sceaux de camp en coin
  remplaçant le trait sous les cartes ; formes et camp accessibles conservés.
- Sources : Milicien v02 à `e43c3a87`, neuf autres Aube v01 à `96190c83`.
  Les PR atelier nº 21/22 restent séparées et non fusionnées.
- CI avant fusion réussie sur les deux heads ; main après fusion identique
  à la version Aube testée, par comparaison GitHub sans fichier modifié.
- [Milicien](MILICIEN_INTEGRATION_2026_10_21.md) et [Aube](AUBE_INTEGRATION_2026_10_21.md)
  conservent les périmètres et contrôles datés des propositions.

## Collection intégrée — PR nº 24

- Branche `feat/collection-six-rangs-20261021`, basée sur main
  `f403f513e85cb247e0a792dd36175f25da984fc6` (nettoyage documentaire nº 23).
  La page a été intégrée après validation explicite, à `0896c16e`.
- Pleine largeur, cinq ordres et une ligne par personnage avec six rangs.
  Seul le rang actuel est jouable ; les autres sont « À concevoir ». Divine
  rouge, Éveillée jaune céleste. Possession, deck, compositions et compétences
  conservent les données existantes. 27 modules sur cette branche.
- Fond original conservé dans la PR atelier nº 21, commit
  `c4f5e6871e32db3b646f51ba906c3ea00b7c6eb9`, CI atelier réussie
  [39569759595](https://github.com/floiaassistant-design/couronne-et-arcanes-art/actions/runs/39569759595).
  Le jeu épingle cet export et son reçu. La PR reste ouverte et non fusionnée.
- La PR atelier nº 20 est depuis fusionnée ; son import est décrit ci-dessus.
  Ajouter ensuite les cartes validées progressivement, sans
  inventer leurs textes, statistiques ou conditions d’évolution.
- Contrôles et limites de cette proposition : [Collection](COLLECTION_2026_10_21.md).
  Les résultats du jalon ci-dessous sont historiques.

## Jalon fonctionnel intégré

- Jeu : PR nº 20 fusionnée à `33b839068c4be29ef27e3d912fbfc75b52ddfc95`, puis
  PR nº 22 à `50b32e4ad5c41da8c99f190d4ca300ce9fec988a` sur accord spécifique.
  La nº 21 (rapport) était déjà intégrée. Vérifier le dernier main avant travail :
  ces empreintes identifient le jalon, pas une branche de reprise à figer.
- Atelier : PR nº 18 fusionnée à `e598646540bf01d0389de772eed1d7f3539c27cc`.
  GitHub est l'unique source officielle : dépôt du jeu pour les sources jouables,
  dépôt art pour sources graphiques, prompts, références, exports et reçus.
- Plateau peint plein écran, main intégrée, cadres et lecture au survol/focus
  conservés. Clic/toucher ferme l'aperçu ; pose en 1/2/3, miroir adverse 10/9/8.
- Anciennes illustrations et animations de personnages retirées. Registre
  `assets/artwork.json` vide ; SVG neutres, aucun ancien portrait ni effet actif.
- 76 cartes, quatre classes, 12 missions, 20 étages, trois donjons, 26 modules.
  Moteur, IA, catalogue et stockage inchangés par la remise à zéro relativement
  à la nº 20. Clés, profils et anciens combats 3×5 conservés.
- Anciennes PR jeu nº 11, 17, 18, 19 et treize anciennes PR art fermées sans
  fusion comme historiques. Leurs images et accords ne sont pas des lots actifs.

## Contrôles du jalon

[CI jeu après fusion](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/39498989044)
réussie : 273 tests Node, 60 parités, builds synchronisés, parcours Chromium
bureau/portrait/paysage, vraie sauvegarde/reprise, export hors réseau et simulations.
[CI atelier après fusion](https://github.com/floiaassistant-design/couronne-et-arcanes-art/actions/runs/39499003125)
réussie : neuf tests, validation, contrôle des sources et export vide.
Aucun téléphone physique ni équilibrage humain exhaustif revendiqué.

## Reprise

Lire `AGENTS.md`, le README, la [décision actuelle](REMISE_A_ZERO_GRAPHIQUE_2026_10_20.md)
et le [contrat d'import](INTEGRATION_GRAPHISMES.md). La Bible et l'architecture
décrivent les contraintes métier ; leurs sections datées et les anciens audits
sont historiques. Leurs prochaines tâches, chiffres d'assets et états de PR
ne remplacent pas le présent état et les commits réels. Aucun ancien paquet
externe ou conversation ne sert de source de reprise.

Prochaine étape : examiner la PR Forge et son aperçu, puis décider
séparément de sa fusion. Les autres factions et les rangs futurs continuent
progressivement, avec leurs versions, reçus et mappings exacts.

