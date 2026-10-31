# Carte des tests — relevé du 31 octobre 2026

Inventaire lu sur main `117a643bf110995f3bc67dc86c55a678cc8b0f76`.
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
| Campagne, progression, Tour, donjons | `engine.test.mjs`, `progression_v22.test.mjs`, `dungeons.test.mjs`, `events_v20.test.mjs` | Épreuves avec combats complets, parité campagne/Tour, simulations de rencontres ; **pas de preuve d'une campagne UI complète de mission 01 à 12 depuis zéro** |
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
| `browser_evolution_trials.py` | Paquets Aube **et** Sylve, Légendaires Sylve et ascensions ; une partie adaptée à chaque groupe |
| `browser_sylve.py`, `browser_ombre.py`, `browser_forge.py`, `browser_ether.py` | Pilote partagé `browser_aube.run`, avec l'ordre correspondant |

L'existence d'un ancien script `browser_*.py` dans le dépôt ne prouve donc ni
son exécution en CI ni son abandon. Lire la matrice et les appels transitifs
avant de le lancer ou de le déclarer manquant.

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
