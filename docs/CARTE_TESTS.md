# Carte des tests — relevé du 31 octobre 2026

Inventaire lu sur main `117a643bf110995f3bc67dc86c55a678cc8b0f76`.
Complément proposé après l'audit campagne/IA : `campaign_alternating.test.mjs`
exécute 96 rencontres isolées en tours alternés, chacune deux fois ;
`browser_pending_results.py` est appelé par la suite de sauvegardes existante.
Les commandes de matrice restent inchangées. [Constat et limites](AUDIT_CAMPAGNE_IA_2026_10_31.md).
Cette carte aide à choisir les contrôles ; elle ne mesure pas un pourcentage
de couverture et ne remplace pas le résultat de CI du commit concerné.
Sources : [workflow de tests](../.github/workflows/test.yml),
[plan navigateur](../scripts/ci_browser_groups.json),
[tests du pipeline](../tests/ci_pipeline.test.mjs).

## Commandes et responsabilité

| Commande / contrôle | Ce qu'il vérifie | Limite |
| --- | --- | --- |
| `npm test` | Tous les fichiers `tests/*.test.mjs` : règles, progression, données, rendu pur, stockage et pipeline ; syntaxe d'`app.js` comprise | Aucun parcours de navigateur implicite |
| `npm run test:parity` | 120 scénarios déterministes, géométries historique/actuelle, empreintes de combat/profil ; archive V2.4 inchangée | Référence actuelle `cards-v2`, pas égalité de règles avec l'ancien jeu V2.4 |
| `npm run build` puis `git diff --exit-code -- JOUER.html` | Export autonome généré et synchronisé avec le fichier officiel | Une compilation ne vérifie pas à elle seule les interactions |
| `npm run build:test` | Diagnostic local requis par les suites qui l'utilisent | Diagnostic jamais distribué |
| `npm run control-balance` | Profils/decks/graines partagés, usages de contrôle et invariants des combats | Mesure de robot, pas preuve de difficulté humaine |
| `npm run arena-balance` | Comparaison de géométries et répétition déterministe, plateaux et pièges valides | Sélection de rencontres, pas toute la campagne jouée humainement |
| `python3 scripts/run_browser_group.py <groupe>` | Exécute toutes les commandes attribuées et conserve tout échec | Diagnostic préalable ; Chromium automatisé |
| `node scripts/build_web.mjs` puis empaquetage | Distribution web, synchronisation autonome, provenance et empreintes du paquet | Une archive construite n'est pas une publication Sites |

Les commandes `balance`, `talent-balance` et `deck-balance` existent pour des
analyses ciblées ; le workflow courant n'appelle directement que les deux
simulations de contrôle/arène ci-dessus, en plus des tests Node. Ne pas annoncer
tous les outils disponibles comme exécutés par chaque CI.

## Domaines et points d'entrée existants

| Domaine | Tests Node principaux | Parcours navigateur / preuve complémentaire |
| --- | --- | --- |
| Chargement, import et écriture du profil | `profile_transactions.test.mjs`, `storage_integrity_v211.test.mjs`, `app_entry_syntax.test.mjs` | `browser_save_integrity_v211.py` : JSON cassé préservé, export brut, import valide et quota ; victoire/reprise/reçu sans double gain |
| Campagne, progression, Tour, donjons | `engine.test.mjs`, `progression_v22.test.mjs`, `dungeons.test.mjs`, `events_v20.test.mjs`, `campaign_alternating.test.mjs` (proposé) | Épreuves avec combats complets, parité campagne/Tour, simulations de rencontres ; **pas de preuve d'une campagne UI complète de mission 01 à 12 depuis zéro** |
| IA et tempo | `ai_v17.test.mjs`, `ai_styles_v18.test.mjs`, `ai_tactical_tempo.test.mjs`, `ai_arena_tempo_integration.test.mjs`, `tempo_v210.test.mjs` | Simulations de contrôle/arène ; examiner les assertions exactes avant de conclure sur une stratégie ou un défaut |
| Garde, Riposte, états et géométrie | `current_card_rules.test.mjs`, `aube_defense.test.mjs`, `aube_guard.test.mjs`, `sylve_legendary.test.mjs`, `battle_control_v29.test.mjs`, `deployment_zone.test.mjs` | Capacités, contrôle, déploiement, arène et règles actuelles ; reprise d'états temporaires |
| Deck, paquets, fusion et ascensions | `manual_deck.test.mjs`, `card_packs.test.mjs`, `evolution_fusion.test.mjs`, `evolution_progress.test.mjs`, `trial_objectives.test.mjs`, `ascensions.test.mjs` | Deck manuel, fusions, paquets Aube/Sylve, ascensions et Légendaires via les appels imbriqués ci-dessous |
| Fiches, Collection et images | `card_presentation.test.mjs`, `collection.test.mjs`, `generated_card.test.mjs`, `concorde_view.test.mjs`, `visuals.test.mjs` | Collection, fiche commune, cinq ordres et sorts : six raretés, images exactes, survol/toucher, instantanés |
| Sorts, effets et accessibilité | `spell_targeting.test.mjs`, `combat_fx.test.mjs`, `ui_markup_state.test.mjs`, `stylesheets.test.mjs` | Ciblage et effets, contrôle clavier/tactile selon suite, mouvement réduit et hors réseau ; aucun audit WCAG complet revendiqué |
| Isolation et architecture | `developer_lab.test.mjs`, `modularity.test.mjs`, `ui_import_boundaries.test.mjs` | Laboratoire commun sans progression réelle ; inspection des dépendances par le builder |
| CI et verdicts négatifs | `ci_change_scope.test.mjs`, `ci_pipeline.test.mjs` | `ci_pipeline_test.py` : partition des cas, groupe inconnu et propagation d'un échec malgré un succès suivant |

Les noms Node ci-dessus sont des points d'entrée, pas une liste exhaustive des
assertions ni une affirmation qu'elles ont toutes été relancées pendant ce
travail documentaire. Le détail des régressions sauvegarde et du pipeline a
été relu ; les autres domaines servent de plan à la suite de l'audit.

## Répartition navigateur actuelle

La matrice conserve **27 scripts d'entrée distincts, 30 commandes** : seul
`browser_evolution_trials.py` est décliné en quatre parties. Les contrôles
d'inventaire et de partition vérifient cette union ; ne pas ajouter une seconde
exécution de la suite entière dans la CI.

| Groupe | Scripts d'entrée `tests/browser_*.py` |
| --- | --- |
| interface | `concorde`, `card_preview`, `collection`, `milicien`, `ether`, `evolution_trials --part portrait` |
| combat | `spell_targeting`, `combat_fx`, `battle_control_v29`, `painted_arena`, `save_integrity_v211`, `forge`, `evolution_trials --part landscape` |
| catalogue | `aube`, `sylve`, `ombre`, `spells`, `card_study`, `maintenance`, `new_game_legibility_v211`, `evolution_trials --part desktop` |
| moteur | `arena_v211`, `combat_fullscreen_v211`, `card_capabilities`, `developer_lab`, `deployment`, `illustrated_pilot_v3`, `class_skills_v28`, `art_reset`, `evolution_trials --part web-recovery` |

Certains fichiers ne figurent pas comme commandes de matrice parce qu'ils sont
déjà appelés par une entrée. La lecture des imports/appels confirme notamment :

| Entrée de CI | Contrôles imbriqués |
| --- | --- |
| `browser_card_preview.py` | `browser_card_presentation.py` et `browser_current_card_rules.py` |
| `browser_collection.py` | `browser_manual_deck.py` et `browser_evolution_fusion.py` |
| `browser_save_integrity_v211.py` | `browser_pending_results.py` (proposé) : pertes de stockage, actions/import et reprise pour les résultats ordinaires |
| `browser_evolution_trials.py` | Paquets Aube **et** Sylve, Légendaires Sylve/Ombre/Forge, paquets Ombre et ascensions Aube/Sylve/Ombre ; une partie adaptée à chaque groupe |
| `browser_sylve.py`, `browser_ombre.py`, `browser_forge.py`, `browser_ether.py` | Pilote partagé `browser_aube.run`, avec l'ordre correspondant |

L'existence d'un ancien script `browser_*.py` dans le dépôt ne prouve donc ni
son exécution en CI ni son abandon. Lire la matrice et les appels transitifs
avant de le lancer ou de le déclarer manquant.

## Marchefer Légendaire — intégré par PR 79 le 3 novembre

`forge_marchefer.test.mjs` vérifie la fusion, Protection héritée, élimination
normale réelle, refus sur les autres causes, plafond/surplus, cadence, Silence,
destruction simultanée, deux camps du laboratoire, reprise/validation du quota,
instantanés, fiche et exécution depuis le véritable export autonome.
Les 148 recettes partagent les contrôles de stock et 2 368 exécutions déterministes.
Le scénario `forge-scrap` étend le pilote Légendaire existant : fusion, stockage
refusé, double clic, Collection/deck, import/export, attaque éliminatrice, bouclier
de couronne et reprise, dans les quatre parties déjà distribuées aux groupes.
Aucun nouveau job ni exécution de la suite entière en double.

## Foreur Légendaire — intégré par PR 80 du 3 novembre

`forge_foreur.test.mjs` ajoute les cas de retrait de barrière avant frappe,
provenance, plafonnement du retrait, armure, cadence, cible éligible, Silence,
attaque nulle, gardien, intentions simultanées, deux camps/quatre niveaux,
instantanés, sauvegarde/import, fiches et moteur embarqué. 149 recettes passent
par les fusions et 2 384 exécutions du simulateur commun, sans modifier sa référence.
`forge-drill` étend les quatre parties du pilote navigateur ; son combat préparé
garantit une barrière personnelle après le vrai parcours UI de fusion/deck.
La fixture est validée et n'attribue aucun déclenchement Foreuse à la main.
Elle ne remplace pas une campagne UI complète ni une preuve d'équilibrage.

## Lot Sylve Divine / Éveillée proposé le 1er novembre

`sylve_ascended.test.mjs` couvre les nouveaux déclencheurs et états facultatifs,
`sylve_ascensions.test.mjs` les deux rencontres complètes, objectifs, accès,
quotas et simulations déterministes. Le catalogue Sylve teste 59 versions à
quatre niveaux dans les deux camps ; les 89 recettes passent par fusion,
invocation et combats partagés. Les quatre parties navigateur existantes
réutilisent les scénarios Aube/Sylve pour boss, objectif, reprise, échec de
stockage, fusion, Collection/deck, export/import et invocation réelle.
Aucune modification de la matrice permanente ni seconde exécution de la suite.
[Contrat et limites](SYLVE_DIVINES_EVEILLEES.md). Résultats à lire dans la PR.

## Lot Ombre Rare / Épique intégré par PR 70 le 2 novembre

`ombre_evolutions.test.mjs` couvre les onze évolutions, 22 versions au laboratoire
à quatre niveaux et deux camps, véritables tirages/fusions/invocations, accès,
stocks et sauvegardes. Les 100 recettes utilisent le robot partagé. Les quatre
parties d'épreuves ajoutent le scénario de paquet Ombre sans nouvelle entrée de
matrice ; le contrôle commun des illustrations vérifie les six colonnes et
les PV de chaque version définie. [Contrat](OMBRE_RARE_EPIQUE.md).

## Lot Légendaire Ombre intégré par PR 71 le 2 novembre

`ombre_legendary.test.mjs` exerce les dix fusions et Veille funéraire : ordre
immédiat des morts, une fois par tour, plafonds par effet, plusieurs copies,
Silence, deux camps, sauvegarde et instantanés. Un cas exécute le moteur
embarqué depuis le véritable export. Le catalogue couvre 32 versions Ombre
et le robot partagé 110 recettes, sans modifier sa référence de parité.

Le pilote Légendaire Sylve est étendu par scénario au Faucheur Ombre ; sa pose
attend son délai réel, puis vérifie Poison, fiche Veille et reprise. Les quatre
parties d'épreuves l'appellent, sans ajouter de commande de matrice.
[Contrat et limites](OMBRE_LEGENDAIRES.md).

## Lot Ombre Divine / Éveillée proposé le 2 novembre

`ombre_ascended.test.mjs` couvre les 22 fusions et interactions nouvelles :
contexte fatal direct, absence de chaîne, soins/bonus plafonnés, deux camps,
contagion causée par poison, malus à cadence, cibles distinctes, PV de la cible
immédiatement avant Exécution, distances réelles, états et véritable moteur
embarqué. `ombre_ascensions.test.mjs` réutilise les parties du pilote partagé :
deux combats complets, 128 graines/niveaux joués deux fois, objectifs, reprise,
refus sans mutation et isolation des factions.

Le catalogue contrôle 54 versions Ombre × quatre niveaux × deux camps ; les
132 recettes passent par 2 112 exécutions déterministes. Les témoins de versions
absentes visent désormais Forge, au lieu de rejeter les Ombre maintenant définies.
Le pilote navigateur commun ajoute l'Ombre aux quatre parties d'ascension :
combat/reprise, pannes, déblocage sans cadeau, fusion, export/import et invocation.
L'inventaire permanent reste 27 scripts et 30 commandes, sans doublon de suite.
[Contrat](OMBRE_DIVINES_EVEILLEES.md). Résultats à lire sur le SHA de la PR.

## Décision de validation et limites

PR uniquement Markdown racine/`docs/` : classification réelle du diff, puis
tests ciblés de portée et pipeline. Les noms `validation` et `assemblage-web`
restent présents, mais un contrôle web vert dans ce cas **ne signifie pas qu'un
nouveau paquet a été construit**. Tout autre changement en PR et tout push main
déclenchent les contrôles complets et l'assemblage web.

Pour cette reprise documentaire : cinq tests Node ciblés réussis, dont le test
du pipeline qui exécute les cinq tests Python existants. Les tests de jeu,
simulations et navigateurs ne sont pas relancés localement pour des textes seuls.
La CI de la PR documentaire doit être lue sur son SHA exact ; les résultats
de main sont consignés séparément dans [ETAT_PROJET.md](ETAT_PROJET.md).

Prochain contrôle utile : campagne/IA de bout en bout, en distinguant les
rencontres simulées des actions réellement couvertes dans l'UI, puis mesures
de lisibilité mobile. Firefox, Safari, téléphone physique, panne électrique
réelle, couverture exhaustive et équilibrage humain ne sont pas validés ici.

## Marteau Légendaire — intégré par PR 81 le 3 novembre

`forge_marteau.test.mjs` couvre vraie fusion, deux camps, géométries 5/10 cases, perte de PV, barrières, Silence, attaque nulle, blocage/bord, cadence et reprise, Riposte avant recul, mort de l’attaquant, piège à l’arrivée, exclusions, interception interligne, instantanés, fiches et vrai export embarqué. Les 150 recettes passent par le robot commun. Le parcours `forge-smith` ajoute le même contrôle UI fusion/deck/import-export/combat préparé/reprise aux quatre parties existantes, sans nouveau job. Ce combat préparé ne remplace pas une campagne complète depuis zéro.

## Forge — huit hauts rangs et ascensions, proposition du 3 novembre

`forge_ascended.test.mjs` couvre les huit versions de quatre cartes : vraies fusions, recul/avancée/alternative, protections et plafonds propres, surplus, deux camps, cadence, comptage de Cuirasse, Silence, Riposte, pièges, sauvegarde et véritable export embarqué. `forge_ascensions.test.mjs` réutilise le pilote partagé pour deux combats complets, 128 combinaisons graine/niveau rejouées, accès et déblocage unique sans don. Le catalogue vérifie 36 versions Forge × 4 niveaux × 2 camps ; les 158 recettes passent par 2 528 exécutions déterministes.

Les quatre parties navigateur communes ajoutent Forge aux ascensions : deux parties UI complètes, pannes, reprise, fusion, Collection/deck, export/import et invocation. Le Foreur obtenu est ensuite joué dans un combat préparé qui vérifie réellement retrait 4 et récupération 2 au rang Éveillé ; résultat repris après rechargement. Aucun groupe/job ni second passage de la suite entière ajouté. Ce témoin préparé ne prouve ni campagne complète depuis zéro ni équilibrage humain.

## Forge — dix hauts rangs tactiques, proposition du 3 novembre

`forge_tactical_armor.test.mjs` couvre Sapeur, Calibrage et Blindage : vraies fusions, chiffres, cibles contiguës, pertes de PV, deux camps, consommation/expiration, non-cumul, Silence, Riposte, Perforation, protections, sauvegarde et fiches. `forge_tactical_strikes.test.mjs` couvre Repérage et Catalyse : invocations distinctes, provenance, cadence, protections, absence de chaîne, reprise et vrai moteur embarqué. Le scénario du navigateur est aussi joué par Node : cinq fusions, six poses en trois tours, puis deux tours de pouvoirs sans résultat préattribué. Catalogue : 46 versions Forge × 4 niveaux × 2 camps ; 168 recettes dans 2 688 exécutions déterministes.

Les quatre parties d’ascension Forge ajoutent ce combat tactique préparé, états survolés/touchés et reprise. Aucun nouveau job ni seconde exécution d’une suite entière. Les rencontres d’ascension restent partagées ; les neuf recettes définies par rang remplacent les quatre du lot précédent. Une préparation de combat ne valide pas une campagne complète depuis zéro.

## Éther — douze évolutions de statistiques

`ether_evolutions.test.mjs` couvre les 23 versions à quatre niveaux et deux camps, les six évolutions de paquet réellement tirées, pouvoirs natifs, Portail, Silence, protections, instantanés, import/reprise et moteur embarqué. Le catalogue générique vérifie les douze fusions nouvelles et 180 recettes dans 2 880 exécutions déterministes. Les pilotes de paquets et Légendaires partagés ajoutent la Voyante et le Chevalier (source Épique native protégée, boss 06, vraie Perforation contre Golem dans un combat préparé). Les quatre parties existantes couvrent bureau, portrait, paysage et HTTP, sans nouveau job ni répétition de suite entière. Les onze personnages Éther conservent aussi la revue des 66 cases de Collection et des illustrations exactes. [Contrat et limites](ETHER_SOCLE_EVOLUTIONS.md).

## Éther — Repli et présage proposés le 4 novembre

`ether_tactical.test.mjs` ajoute 18 tests métier : deux camps/deux géométries, portée, quotas, protections, exclusions, pièges, mouvement normal/téléportation/recul, immobilisation, source disparue, morts, validation/reprise et instantanés. Deux scénarios navigateur partagent `fixtures/ether-battle.mjs`, sont raccordés aux quatre parties existantes et suivent le présage jusqu’au tour suivant. `ether_evolutions.test.mjs` couvre 27 versions × quatre niveaux × deux camps et les huit références évoluées du paquet ; `evolution_fusion.test.mjs` couvre 187 recettes et 2 992 combats déterministes. Aucun job ajouté, aucune ancienne assertion d’absence supprimée : elles visent les versions encore absentes. Vérifications locales : 764 Node et 120 parité réussies ; navigateur à confirmer par CI, Playwright absent localement.

## Golem — trois hauts rangs intégrés par PR 85

`forge_golem.test.mjs` ajoute quinze cas : vraies fusions, deux camps/deux géométries, menace de couronne, exclusions, gardien dépassé/interligne, priorité, quotas par invocation, plafond/surplus, absorption, Silence, attaque nulle, mort après réaction, reprise/import, instantanés, fiches, moteur embarqué et fixture navigateur partagée. Catalogue : 49 versions Forge × quatre niveaux × deux camps et 183 recettes dans 2 928 exécutions déterministes. Les vérifications d’absence sont déplacées vers la Sentinelle encore absente, sans perdre les assertions. Le contrôle de rendu d’ascension annonce désormais dix recettes Forge par rang, comme Aube.

`golem-battle.mjs` fusionne/invoque le Golem Divin/Éveillé, puis laisse le moteur intercepter la véritable frappe adverse. Les quatre parties Forge ajoutent fiche et reprise à ce même scénario, sans nouveau job. Un combat préparé n’est pas une campagne complète ; le propriétaire a validé le cas interposé le 4 novembre, les tests en vérifient l'application.

## Éther — premiers Divins proposés le 5 novembre

`ether_divine.test.mjs` vérifie cinq vraies fusions sur quatre cartes, minimum/cadence du Prisme après menace de couronne, exclusions, deux camps/deux géométries, remplacement du présage par 3, bonus normal consommable/expirable, recul secondaire, pièges, Silence, protections, absence de chaîne, reprise et moteur réellement embarqué. `ether_ascensions.test.mjs` joue la nouvelle rencontre complète, les refus, objectifs, reçu unique et 64 graines/niveaux rejouées. Catalogue : 32 versions × quatre niveaux × deux camps ; 192 recettes dans 3 072 exécutions déterministes.

Le pilote partagé d’ascension ajoute Éther aux quatre parties existantes. Un combat préparé commun Node/navigateur fusionne/invoque les quatre Divines, sans préattribuer leurs pouvoirs ; l’interface doit déclencher, lire et reprendre les quatre effets puis leur consommation/résolution au tour suivant. Aucun nouveau job ni seconde exécution de suite entière. Les anciens témoins d’absence visent désormais les versions toujours absentes ; aucune assertion n’est retirée. Résultats et limites à lire dans la PR du SHA exact.

Le contrôle Légendaire partagé vérifie aussi les Divines du Feu follet et de la
Voyante : ascension requise, ATQ/PV 3/4 et 3/5 ; leurs Éveillées restent « À concevoir ».
L’ancienne assertion d’absence des deux rangs n’est pas conservée sur un rang ajouté.
Le parcours `browser_ether.py` vérifie également les PV affichés en Collection
pour les cinq nouveaux rangs : Feu follet 4, Voyante 5, Sentinelle 11 à ses deux
rangs et Dragon 12. Les rangs absents gardent le tiret. Les valeurs attendues
restent indépendantes du registre et sont vérifiées sur bureau, portrait et paysage.
Le groupe combat ayant atteint sa limite de 20 minutes dans le run 42056039630,
la marge des groupes passe à 30 minutes, avec les mêmes quatre groupes et tous
les contrôles. Aucune durée de réussite anticipée ; lire la nouvelle CI exacte.

## Éther — soutiens de Vol

`ether_evolutions.test.mjs` vérifie désormais 34 versions et les réactions de Vol dans les deux camps. Les valeurs de Collection et des 194 recettes restent explicites. `ether-flight-battle.mjs` prépare les deux fusions et invocations pour `browser_ether_divine.py`. Ce parcours vérifie le Sillage, le soin, le déplacement et les reprises dans les quatre parties d’ascension existantes. [Contrat](ETHER_DIVINS_VOL.md).
