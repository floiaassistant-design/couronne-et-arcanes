# Check-up avant nettoyage — 20 octobre 2026

> Rapport historique établi avant la décision de refaire les graphismes.
> Les recommandations de consolider ou d'importer les anciens portraits,
> animations et modèles sont remplacées par la [remise à zéro](REMISE_A_ZERO_GRAPHIQUE_2026_10_20.md).
> Depuis : PR jeu nº 20 et nº 22 et PR art nº 18 fusionnées sur accord spécifique ;
> les 17 anciennes PR graphiques sont fermées sans fusion. Les tableaux ci-dessous
> restent l'inventaire au moment de l'audit, pas des tâches ou états de PR actuels.
> Reprendre depuis [l'état actuel](ETAT_PROJET.md) et le dernier main GitHub.

## Conclusion

Le socle jouable passe les contrôles exécutés. Le besoin prioritaire est de
consolider les références et les directions graphiques accumulées : documentation
de reprise périmée, catalogues d'atelier distincts, chevauchement de deux PR de
portraits et plusieurs présentations de combat encore ouvertes.

Le nettoyage doit avancer par petites PR : documentation, catalogue graphique,
réconciliation de la présentation choisie, puis styles et poids. Ce rapport ne
supprime aucun fichier, ne clôt aucune PR, ne change aucun statut artistique et
n'autorise aucune fusion.

## Références et périmètre

| Référence | Révision examinée |
| --- | --- |
| Jeu, dernier main | `0310fa677947e34a02bd877f5adc6104267f87ba` — PR nº 16 intégrée |
| Atelier, dernier main | `cf80c44d5685e6f6050deadd962f2d49fdccc9a0` — PR nº 16 intégrée |
| Cartes sur plateau, PR jeu nº 20 | `30379a08b5493b1d219703f6f1fa8258afc8e5c9` |

Examen des consignes, README, états, Bible, architecture, sources, assets du jeu,
générateur autonome, workflows, 18 PR ouvertes et CI associées aux têtes exactes.
Les deux états exécutés sont le main du jeu et la PR nº 20. Les autres PR ont été
examinées par métadonnées, fichiers concernés, contrats et CI ; leurs combinaisons
n'ont pas été exécutées pendant cet audit.

Inventaire avant ouverture de la PR de ce rapport : **5 PR jeu et 13 PR art**.
Tous les fichiers matérialisés ont été comparés à leur empreinte Git distante ;
les trois exports de production reconstruits correspondent aussi aux empreintes
Git attendues. Le PNG documentaire `docs/images/arena-v211.png` et les quatre
grands PNG de l'atelier n'ont pas été téléchargés localement. Aucune nouvelle
revue esthétique de ces images n'est revendiquée.

## 1. Documentation de reprise à corriger en premier — P1

Constats sur le main du jeu :

- `AGENTS.md` et `docs/ETAT_PROJET.md` annoncent encore `f896a0c3` et la PR nº 15
  comme base courante. Le main réel inclut la PR nº 16.
- `README.md`, `docs/ETAT_PROJET.md` et
  `docs/ARCHITECTURE_MODULAIRE_V2_6.md` décrivent encore les statistiques et la
  lecture des capacités comme une proposition non intégrée.
- La Bible garde en tête une direction pixel antérieure à l'arène peinte ; sa
  section de règles V1 décrit aussi le 3×5 historique. Les encadrés historiques
  doivent rester identifiables sans servir de consigne actuelle.
- `docs/CODEX_WORK_MISSION.md` présente plusieurs anciens jalons comme derniers
  développements. L'architecture conserve successivement les comptes 17, 22, 23
  et 25 modules : préciser lesquels sont historiques.

Constats sur le main art :

- `docs/ETAT_PROJET.md` présente encore `54e8799b` comme main, la nº 14 ouverte
  et les PNG sur une branche ; `cf80c44d` contient déjà ces sources après fusion
  des nº 14 et 16.
- `AGENTS.md` et `album-cartes/README.md` gardent également des indications de
  présence sur branche devenues historiques.
- `docs/DECISIONS_GRAPHIQUES_ACTUELLES.md` contient bien l'addendum Milicien
  nº 2, mais son ouverture met encore en avant le pilote Illustrée v3.

Action : actualiser les fichiers existants, distinguer explicitement « intégré »,
« proposé » et « historique », et rendre la référence actuelle immédiatement
lisible. Garder les règles permanentes dans AGENTS ; déplacer les anciens états
dans les documents historiques existants avec des liens. Aucun historique utile
ni reçu d'approbation ne doit disparaître.

## 2. Catalogues graphiques à consolider — P1

Le main art contient **quatre PNG sources**, dont le Milicien nº 2 validé et
l'Arbalétrière album nº 1 en revue. Son `manifest.json` contient **zéro asset** :
`npm run validate` réussit et `npm run export:game` produit donc un paquet vide.
Ce résultat ne prouve aucune validation des ressources restées sur des branches.

Les manifestes examinés sont différents :

| Branche / PR art | Entrées du manifeste | Statuts déclarés |
| --- | ---: | --- |
| main | 0 | aucun export catalogué |
| nº 1, Chevalier | 88 | 38 approved, 10 draft, 40 rejected |
| nº 2, Arbalétrière historique | 28 | 28 approved |
| nº 8, livraison consolidée historique | 116 | 66 approved, 10 draft, 40 rejected |
| nº 10, portraits Aube | 5 | 5 approved |
| nº 12, Milicien combat et portraits | 23 | 11 approved, 12 review |
| nº 17, corrections de carte Arbalétrière | 9 | 8 draft, 1 review |

Ces lignes se recouvrent : **ne pas additionner les compteurs et ne pas remplacer
un manifeste complet par celui d'un seul lot**. La nº 12 reprend notamment les
cinq portraits de la nº 10 ; la nº 8 reprend les livraisons nº 1 et 2.

Le validateur du main refuse encore un asset `approved` de type `unit`.
Les branches de livraison distinguent déjà l'approbation artistique et les
portraits exportables. Une consolidation devra reprendre ce contrat et ses tests,
puis réunir les entrées par identifiant et version avec leurs sources, exports,
licences et reçus. Copier seulement les JSON dans le main actuel ne suffit pas.

Conserver les deux index utiles : registre des PNG maîtres pour la création,
manifeste des exports pour l'intégration. Les relier explicitement sans confondre
un PNG de référence, un portrait, une carte complète et une animation.

## 3. Deux intégrations des mêmes portraits — P1

Les cinq WebP de la PR jeu nº 17 et de la nº 20 sont **identiques par empreinte
Git**. Les deux reçus d'approbation associés le sont également.

Le comportement proposé diffère :

- nº 17 : remplacement explicite des mappings normaux des cinq cartes Aube ;
- nº 20 : `CARD_ARENA_ART` et `visualFor(card,{cards:true})`, utilisés lorsque la
  présentation cartes est active ; mapping normal conservé.

Action : retenir un comportement explicite puis réconcilier `src/visuals.js`,
les index de provenance, les tests et les présentations main/collection/plateau.
Ne pas traiter ces PR comme deux apports graphiques indépendants. Préserver tous
les consommateurs des portraits partagés ; `skill_ranger_pierce` conserve
notamment son `archer.webp` historique.

La nº 20 ne contient **pas** le nouveau PNG de carte Milicien nº 2 : elle utilise
les portraits approuvés et les cadres HTML/CSS. Valider le modèle graphique dans
l'atelier ne l'a donc pas encore intégré au jeu.

## 4. PR nº 19 : régression de lisibilité vérifiée — P1

La [CI 38708068303](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/38708068303)
est en échec sur `5ddcc8db`. Le job `validation`, étape
`Parcours V2.9 et export autonome ordinateur et téléphone simulé`, échoue dans
`tests/browser_battle_control_v29.py:43`.

Le contrôle exige une police d'au moins 10 px pour l'état de disponibilité.
Deux cartes historiques sur trois échouent à `readable`, tandis que `fits` et
`labelFits` passent. `assets/backgrounds/combat-immersif.css` impose notamment
8 px à `.hand-readiness`, puis 7 px sur écran bas.

Les étapes navigateur suivantes, la validation combinée et les simulations de ce
workflow sont sautées. La présence d'un artefact téléversé via `if: always()` ne
vaut pas validation du jeu.

Action si cette branche est retenue : corriger la lisibilité, puis repasser toute
la CI sans abaisser le seuil du test. Sinon conserver ses idées utiles comme
historique et préparer sa clôture après comparaison avec la nº 20. Aucun correctif
ni clôture n'est exécuté dans cet audit.

## 5. Présentation commune à stabiliser — P1

Trois états coexistent : jeu officiel à silhouettes fixes et pilote Illustrée v3,
proposition d'unité Arbalétrière animée, et proposition de cartes sur plateau.
Le modèle Milicien nº 2 constitue la référence graphique la plus récente pour
l'album ; son approbation reste distincte de l'intégration de ces présentations.

Le contrat déjà validé conserve le blason en haut à gauche, un seul compteur
d'attente en haut à droite, les champs de texte vierges dans l'image, l'épée
bleue en bas à gauche et le cœur rouge en bas à droite. Les valeurs viennent du
jeu. Le personnage doit être illustré dans la fenêtre du cadre.

Action : préparer un gabarit réutilisable versionné et ses zones d'affichage,
puis l'appliquer à une petite sélection. Les sources actuelles sont des PNG
aplatis : une couche de cadre séparée reste à produire et à examiner. Ne pas
présenter une génération répétée du cadre comme une copie exacte du modèle.

La nouvelle Arbalétrière n'est **pas validée**. La fiche de la PR art nº 17
conserve V8 comme base nette à corriger ; une corde manque encore. V9/V10 sont
des brouillons dégradant le cadre. Préserver le portrait historique approuvé et
toutes les références utiles ; aucune approbation nouvelle n'est déduite de cet
audit.

La PR jeu nº 20 inclut aussi une **vraie évolution de règle** : pose en cases
1/2/3, miroir adverse 10/9/8, adaptations moteur/IA/robot. Elle ne doit pas être
fusionnée sous le seul intitulé « nettoyage graphique ». La parité historique
3×5 réussie ne démontre pas l'équilibrage de ce nouveau placement.

## 6. Styles, poids et lisibilité du code — P2

| Mesure | Main | PR nº 20 |
| --- | ---: | ---: |
| Modules source | 25 | 26 |
| Portraits embarqués | 13 | 18 |
| JOUER.html | 1 193 800 octets | 1 901 331 octets |
| ESSAI_CARTES.html | absent | 1 901 355 octets |

`styles.css` pèse 68 713 octets et contient les strates de plusieurs générations
d'arène, de dock et de fiche. L'arène peinte ajoute son propre layout ; la nº 20
ajoute `card-arena.css` (15 952 octets) et `card-preview.css` (4 842 octets).
Le fichier CSS du décor peint pèse 492 967 octets parce qu'il embarque son WebP
de 369 534 octets. Cette image est nécessaire au jeu hors réseau.

L'ancien décor calibré reste chargé par `index.html` et le builder :
`arena-celeste-calibree.css`, **71 594 octets**, dont un WebP de 53 314 octets.
Le rendu peint surcharge ensuite l'image de `.arena-calibrated-art`. Candidat
prioritaire à une suppression du chargement actif **après vérification navigateur
de tous les modes**. Son retrait potentiel représente environ 6 % du HTML du main ;
ce n'est pas un gain de performances mesuré. Archiver sa provenance avant retrait.

Action styles : séparer les responsabilités (base, cartes, combat commun, mode
peint, mode cartes, compatibilité historique), garder un ordre de chargement
explicite et supprimer les surcharges devenues inutiles après comparaison des
styles calculés. Éviter d'ajouter un troisième correctif sur les deux précédents.

La séparation moteur/interface est saine dans les contrôles exécutés : aucun
cycle détecté dans les imports statiques examinés et aucune dépendance DOM ou
stockage repérée dans les modules métier examinés. Préserver cette architecture.

La densité du code masque cependant son volume : `ui/pages.js` fait 31 895 octets
en 108 lignes, avec une ligne de 2 149 caractères ; `ui/battle-view.js` fait
11 585 octets en 46 lignes. `app.js` atteint 24 281 octets et `engine/battle.js`
20 746 octets. Reformater d'abord les vues ; découper ensuite seulement les
responsabilités réellement indépendantes. Éviter une refonte générale du moteur.

## 7. Triage de toutes les PR ouvertes

CI ci-dessous : dernier résultat disponible pour la **tête exacte indiquée**.
Les workflows de PR peuvent tester le commit de fusion temporaire de GitHub.
« Réussie » ne signifie ni accord artistique ni autorisation de fusion.

### Jeu

| PR | Tête | CI | Traitement recommandé |
| --- | --- | --- | --- |
| [11](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/11) | `5fd16662` | réussie | Ancienne arène pixel, en conflit avec main. Candidate à clôture documentée après inventaire de ses apports uniques. |
| [17](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/17) | `2e739166` | réussie | Réconcilier ses cinq portraits avec nº 20 ; décider du mapping normal. |
| [18](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/18) | `3a6f928a` | réussie | Conserver contrat, séquences et repli statique ; décider de leur rôle dans la direction cartes. |
| [19](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/19) | `5ddcc8db` | **échec** | Dépend de nº 18. Corriger ou reprendre ses apports utiles ; pas d'intégration en l'état. |
| [20](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/20) | `30379a08` | réussie | Base de la proposition cartes, à réconcilier avec nº 17 ; placement élargi à traiter explicitement. |

Au moment du contrôle GitHub, nº 11 est non fusionnable (`dirty`) ; nº 17, 18 et
20 sont `clean`, nº 19 `unstable`. Ces états sont temporaires et doivent être
revérifiés avant une éventuelle intégration.

### Atelier graphique

| PR | Tête | CI | Traitement recommandé |
| --- | --- | --- | --- |
| [1](https://github.com/floiaassistant-design/couronne-et-arcanes-art/pull/1) | `b782a99c` | réussie | Préserver Chevalier approuvé, sources et reçus ; catalogue repris dans nº 8. |
| [2](https://github.com/floiaassistant-design/couronne-et-arcanes-art/pull/2) | `234988e2` | réussie | Préserver Arbalétrière historique approuvée ; catalogue repris dans nº 8. |
| [3](https://github.com/floiaassistant-design/couronne-et-arcanes-art/pull/3) | `aa1102a9` | réussie | Workflow approuvé à conserver, comparateur expérimental à identifier comme historique ; basée sur nº 1. |
| [4](https://github.com/floiaassistant-design/couronne-et-arcanes-art/pull/4) | `d193b762` | réussie | Étude du carreau, basée sur nº 3 ; séparer effet en revue et séquences déjà approuvées. |
| [5](https://github.com/floiaassistant-design/couronne-et-arcanes-art/pull/5) | `f5fe8f47` | réussie | Propositions de cadres historiques, basées sur nº 3. |
| [6](https://github.com/floiaassistant-design/couronne-et-arcanes-art/pull/6) | `3c79f155` | réussie | Pilote Illustrée, basée sur nº 5 ; conserver les éléments effectivement repris dans le jeu. |
| [7](https://github.com/floiaassistant-design/couronne-et-arcanes-art/pull/7) | `909783cf` | réussie | Étape de la main allégée, basée sur nº 6. |
| [8](https://github.com/floiaassistant-design/couronne-et-arcanes-art/pull/8) | `fbbcbe8d` | réussie | Référence consolidée des 116 entrées ; basée sur nº 7, à préserver lors du rapprochement des catalogues. |
| [10](https://github.com/floiaassistant-design/couronne-et-arcanes-art/pull/10) | `a6dd5209` | réussie | Lot de cinq portraits approuvés ; sources des PR jeu nº 17 et 20. |
| [11](https://github.com/floiaassistant-design/couronne-et-arcanes-art/pull/11) | `fd38e48d` | réussie | Étude Blender séparée ; conserver comme expérience, sans migration ni import automatique. |
| [12](https://github.com/floiaassistant-design/couronne-et-arcanes-art/pull/12) | `ba1ac3aa` | réussie | Basée sur nº 10. Quatre actions approuvées à préserver ; nouvelle marche en revue. |
| [15](https://github.com/floiaassistant-design/couronne-et-arcanes-art/pull/15) | `00722feb` | réussie | Candidate à clôture : fiche et PNG déjà repris et enrichis sur main par nº 16 ; comparer le contenu avant clôture. |
| [17](https://github.com/floiaassistant-design/couronne-et-arcanes-art/pull/17) | `5297dd6a` | réussie | Brouillon actuel Arbalétrière, corde non résolue ; aucune intégration au jeu. |

Toutes ces PR art sont encore en brouillon. Les empilements expliquent une partie
du nombre élevé de PR : ils ne représentent pas treize livraisons indépendantes
à fusionner successivement. Conserver les commits et reçus avant toute clôture.

## 8. Contrôles réellement exécutés

| Contrôle | Résultat |
| --- | --- |
| Main : `npm test` | 258/258 réussis |
| Main : `npm run test:parity` | 60 scénarios historiques identiques |
| Main : `npm run build`, `npm run build:test` | réussis ; JOUER identique à l'empreinte Git officielle |
| Main : `npm run control-balance` | 20 480 combats terminés, assertions réussies |
| Main : `npm run arena-balance` | 6 144 scénarios sur deux passes identiques, zéro état invalide |
| PR nº 20 : `npm test` | 273/273 réussis après reconstruction des exports attendus |
| PR nº 20 : `npm run test:parity` | 60 scénarios historiques identiques |
| PR nº 20 : builds normal, cartes et test | réussis ; JOUER et ESSAI identiques aux empreintes Git de la PR |
| Atelier main : `npm test` | 8/8 réussis |
| Atelier main : `npm run validate`, `npm run export:game` | réussis, zéro asset exportable |
| Analyse des imports statiques | aucun cycle détecté sur les 25/26 modules |
| Liens Markdown locaux explicites | aucune cible absente dans les inventaires distants examinés |

Le comparateur d'arène a donc exécuté 12 288 combats au total. Un scénario atteint
35 tours ; aucun combat ne reste inachevé. Ces simulations de bots vérifient la
cohérence et la reproductibilité de ce banc, pas l'équilibrage humain. Elles
portent sur le main et ne valident pas le placement élargi de la PR nº 20.

La [CI du main jeu 38531495638](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/38531495638)
et les deux jobs de la [CI nº 20 39416021471](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/39416021471)
sont réussis. Les parcours bureau/mobile simulés, sauvegarde/reprise et hors
réseau sont des preuves distantes consultées, pas des parcours locaux réexécutés
pendant cette mission. Le journal nº 20 confirme aussi le parcours des sources
modulaires HTTP.

La [CI du main art 39467375889](https://github.com/floiaassistant-design/couronne-et-arcanes-art/actions/runs/39467375889)
est réussie ; ses étapes `verify:card-sources`, validation, tests et export ont
été vérifiées. Le contrôle des quatre grands PNG s'appuie ici sur cette CI, pas
sur un décodage local. Les images du jeu embarquées dans les deux CSS ont été
extraites en mémoire et leurs SHA-256 correspondent aux références documentées.

Limites : Node local 24, CI configurée pour Node 22 ; aucun navigateur local ni
téléphone physique utilisé, aucune mesure nouvelle de FPS/mémoire, aucune revue
visuelle exhaustive des itérations, aucun test de fusion combinant nº 17/18/19/20.

## 9. Ordre concret du nettoyage à préparer

1. **Documentation et triage.** Corriger les états existants des deux dépôts,
   identifier les anciens jalons et confirmer les candidats à clôture nº 11 jeu
   et nº 15 art après conservation des apports uniques.
2. **Catalogue de l'atelier.** Réunir les manifestes utiles et le validateur
   compatible, conserver sources et reçus exacts ; relier l'album au catalogue.
   Aucun transfert automatique vers le jeu.
3. **Présentation et mappings.** Réconcilier nº 17/nº 20, garder les identités et
   sauvegardes, puis préparer l'export technique du cadre Milicien validé. La
   nouvelle carte Arbalétrière attend toujours sa correction et son accord.
4. **Styles et ressources actives.** Nettoyer la cascade après comparaison des
   rendus, vérifier le retrait de l'ancien décor calibré, puis mesurer les poids
   et le comportement sur petit écran. Régénérer les HTML depuis les sources.
5. **Animations et lisibilité.** Déterminer ce qui reste utile des nº 18/19 dans
   cette présentation ; corriger le défaut de nº 19 si elle est retenue. Préserver
   animations désactivées, mouvement réduit et repli statique.
6. **Lisibilité des sources.** Reformater et extraire les vues concernées sans
   rééquilibrage ni modification cachée de l'IA ou du stockage.

Chaque lot garde sa branche et sa PR. Après une modification effective : tests,
parité si règles conservées, builds, comparaison des exports, parcours bureau et
mobile, reprise historique 3×5, sauvegarde réelle, animations coupées et hors
réseau. Toute modification de règle, dont la pose élargie, garde des contrôles
spécifiques et une conclusion distincte sur l'équilibrage.

La première PR de nettoyage recommandée porte uniquement sur la documentation
et les références. La suppression de ressources et la réconciliation des rendus
viennent ensuite. **Chaque fusion attend un accord explicite et spécifique.**
