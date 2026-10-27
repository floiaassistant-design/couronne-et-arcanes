# Revue finale Aube — PR 53, 27 octobre 2026

## Conclusion et périmètre

Les six étapes de préparation sont terminées sur
[la PR 53](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/53).
Aucun défaut bloquant identifié dans le périmètre relu. La clôture de revue
modifie uniquement les documents ; elle ne change ni moteur, ni UI, ni export.
La PR reste en brouillon, à examiner par le propriétaire, sans fusion ni publication.

Les **51 versions Aube** sont testables au laboratoire. Les **41 évolutions**
restent refusées en aventure, sans obtention définie. Le moteur prêt, la fiche
disponible et l'activation en aventure sont trois états distincts. Ni la revue
ni une éventuelle fusion ne créent un circuit d'obtention.

## Sources et version examinées

- [Tableau maître Notion](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f),
  édition relue `2026-10-27T05:48:45.318Z` : préambule et dix lignes Aube.
  Leurs décisions sont inchangées ; les autres factions sont hors périmètre.
- Code et export : `13be34f8b134e52cfafd00f9915e850ddb19bea1`, arbre
  `587bff0a66d1792d0afa5c81b5104190c704a625`.
- Base `main` relue : `cf8175002431e1714460f8be917665437a5b78c4`, inchangée.
  Seule la PR 53 est ouverte ; la PR 41 est fermée sans fusion.
- `AGENTS.md`, README, état, mission, bible, architecture et contrats Aube relus.
  Le commit documentaire de clôture et ses contrôles exacts sont dans la PR.

## Points contrôlés

| Zone | Résultat de la revue et preuves |
| --- | --- |
| Définitions et chiffres | 10 natives et 41 évolutions, 9 rangs inférieurs absents. Totaux de rareté et bonus séparés, héritage/remplacement sans double capacité ; assertions des 51 définitions. |
| Défenses et Garde | Pipeline commun de dégâts, protections et quotas persistants. Priorité validée, un gardien par frappe, réévaluation après mort ; absence de fausse Riposte interligne. |
| Attaques et soutiens | Portée, tir arrière, Charge/Célérité, soins effectifs distincts, barrières, Inspiration, Commandement et Intervention raccordés ; arrivée résolue une fois, sans frappe ordinaire ajoutée. |
| Ancien jeu | Natifs et anciens combattants sans marqueur gardent leurs règles et chiffres ; profils, achats, maîtrise et decks non migrés. Parité historique et tests de reprise conservés. |
| Laboratoire et IA | Même moteur et mêmes statistiques aux deux camps, niveaux indépendants ; refus de gains même par API directe. IA déterministe, sans lecture des cartes privées du joueur. |
| Cartes et fiches | Un modèle, un rendu et un contrôleur communs. Contexte de profil/main/unité/laboratoire préservé ; consultation et pose distinctes, ciblage explicite des sorts conservé. |
| Structure | 51 modules, 181 dépendances locales, aucun cycle détecté. Plus gros module JS : `battle.js`, 386 lignes ; `app.js`, 319. Défenses, soutiens, géométrie et présentation ont des responsabilités séparées. |
| Diff sensible | Aucun changement au catalogue `src/data.js`, au stockage, aux manifestes/images approuvés ou aux workflows permanents. Aucun moteur ou tableau manuel de statistiques ajouté dans l'UI. |

Les documents qui annonçaient encore les fiches et la revue comme étapes à venir
sont corrigés. Les anciennes sections datées restent des résultats historiques.

## Vérifications et export

Rejoués à l'étape 6 : **418 tests Node réussis**, **60 scénarios de parité
identiques**, builds normal et test réussis, puis comparaison de `JOUER.html`
avec le fichier suivi : aucune différence. La suite comprend **408 invocations**
(51 versions × 4 niveaux × 2 camps) et **48 batailles déterministes** du laboratoire.
`git diff --check` est également propre.

Les deux contrôles distants de la tête de code `13be34f` sont **success** :
[tests complets](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40363691764)
et [assemblage web](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40363691591).
Les échecs intermédiaires précédant l'export sont remplacés par ces résultats.

Les parcours navigateur de l'étape 5 et de cette CI restent applicables au même
code : Chromium, bureau/mobile simulé, HTTP et export hors réseau, anciennes
sauvegardes, cartes, sorts, laboratoire et effets. Ils ne sont pas revendiqués
comme une nouvelle exécution locale à l'étape 6. Les 1 280 simulations de contrôle
de l'étape 4 restent également un résultat historique, sans nouvelle modification
des règles qui imposerait de les rejouer.

Export officiel unique : **34 485 745 octets**, **51 modules, 76 illustrations**,
blob `c7c765f6a33b55433184a36c6272955e38ddb07d`. HTML généré depuis les sources,
sans édition manuelle ; diagnostic `tests/JOUER.test.html` non distribué.

## Limites et décision suivante

Aucun téléphone physique, Safari/Firefox ou équilibrage humain exhaustif n'est
validé par ces contrôles. Le choix d'obtention et l'activation en aventure
restent à définir dans un périmètre distinct. Le propriétaire peut maintenant
examiner la livraison de la PR 53 ; toute fusion ou publication nécessite son
accord spécifique. Si seule la CI du commit documentaire reste en attente,
arrêter sans surveillance active et vérifier son résultat après notification.
