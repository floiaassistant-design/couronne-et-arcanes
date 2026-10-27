# Reprise — épreuves d’évolution Aube

**Pause demandée par le propriétaire pour préserver le quota, le 27 octobre 2026.**
Ce travail est un brouillon incomplet. Ne pas fusionner ni publier. Reprendre
la même branche et la même PR ; ne pas recommencer depuis une ancienne copie.

## Dépôt, base et décisions

- Dépôt : `floiaassistant-design/couronne-et-arcanes`.
- Branche : `feat/epreuves-evolution-aube` ; PR de reprise en brouillon, lien
  et tête exacte dans sa description.
- Base main : `1177160856b5162eb06c7df109d479eb41441926`, fusion autorisée de
  la PR 54. Arbre `8d888451cf4da0b887d3f68853e7af040935c814`, identique au
  contenu testé de la PR 54 (`f5385a8`). Les deux CI de cette PR ont réussi :
  [tests](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40468034445),
  [web](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40468034414).
  Publication du site non vérifiée ici. La PR 53 était déjà fusionnée.
- [Notion officiel](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f)
  relu, édition `2026-10-27T06:13:46.581Z`. Chiffres/pouvoirs Aube inchangés.
  Aucune modification de Notion par ce travail.
- Le propriétaire a demandé de commencer les épreuves et récompenses de boss
  dans une nouvelle PR. Il n'a pas autorisé sa fusion. Les réglages pilotes
  ci-dessous sont une implémentation proposée à examiner, pas une validation
  déjà enregistrée dans Notion.

## Premier périmètre implémenté, à terminer de vérifier

| Épreuve | Accès | Transformation unique proposée |
| --- | --- | --- |
| Tenir jusqu’à l’aube | Mission 01 terminée | Milicien Commun → Rare |
| Le serment du Porte-égide | Mission 02 terminée | Porte-égide Commun → Rare |
| La dernière volée | Mission 02 terminée | Arbalétrière Commune → Rare |
| Le rempart du Bosquet | Premier boss, mission 03, et épreuve Milicien Rare terminés | Milicien Rare → Épique |

Objectif : gagner avec au moins un exemplaire du personnage **au rang demandé**
encore vivant. Un exemplaire est transformé, pas ajouté gratuitement ; un slot
de deck correspondant est remplacé, sans changer sa taille. Aucun exemplaire
consommé sur défaite/objectif manqué ; récompense une seule fois. Ces épreuves
n'accordent pas d'or, éclats ou XP. Le boss existant ne change pas de statistiques :
sa victoire ouvre la dernière épreuve, ce qui est annoncé dans la campagne.

Pas de nouveaux paquets, fusion de doublons, marchand, contrats de faction ou
autres évolutions dans ce pilote. Les 37 autres évolutions Aube restent au labo.

## Code présent

- `src/evolution-trials.js` : quatre définitions, prérequis, objectifs et decks
  adverses ; pas de copie de statistiques/pouvoirs des cartes.
- `src/cards/references.js` : identité, clés de vue et inventaire. Les natifs
  restent des chaînes d'ID. Les évolutions dans les decks sont `{id,rarity}`,
  jamais un nouvel ID de `CARDS`.
- Profil : ajouts facultatifs `evolvedCollection` (ex. `{'militia:rare':1}`)
  et `completedTrials`. Aucun ajout automatique sur un ancien profil ; les
  anciennes chaînes, quantités, achats, maîtrises et clés de sauvegarde restent.
- `engine/evolution-progress.js` : accès, création via le moteur normal,
  attribution et transformation uniques. `completeBattle`/`grantBattleProgress`
  refusent les gains génériques pour `mode: evolution-trial`.
- Les quatre versions pilotes ont `status.combat: implemented` et obtention
  `trial`. Les autres restent en attente. Les attentes de tests de statuts ont
  été ajustées uniquement pour ces quatre références explicites.
- Nouveau combat avec référence future : `evolutionsEnabled: true` ; main,
  recyclage et invocation conservent la rareté. Seules les unités futures
  gagnées portent `cardRules: aube-v1` ; les natifs du même combat gardent leurs
  règles historiques. Le marqueur global du labo reste indépendant.
- Deck manuel, propositions, Collection six cellules, Atelier, cartes/fiches,
  réputation et import/export adaptés aux références. Les quantités par rang
  sont distinctes ; l'entraînement reste attaché au personnage.
- `ui/evolution-trials.js` et `styles/pages/evolution-trials.css` : écran Épreuves,
  récompense annoncée, objectifs, accès et résultat. Navigation et `settle()`
  réutilisent le journal de clôture existant (copies profil/bataille puis reçu).
- Les anciens instantanés défensifs restent lisibles, y compris les unités
  versionnées de tests antérieurs. Ne pas restreindre leur lecture aux quatre
  nouvelles versions : les tests de quotas/reprise doivent rester intacts.

## Tests réellement exécutés et blocage connu

Dernier `npm test` : **431 tests, 430 réussis, 1 échec**. Les 422 tests précédents
passent après mise à jour des attentes de disponibilité. Le nouveau fichier
`tests/evolution_progress.test.mjs` contient neuf tests : huit réussissent
(identités, accès, transformation, unicité, échecs sans consommation, moteur,
recyclage, decks, imports, sauvegardes, lecture des vues).

**Échec à traiter en priorité :**
`Combats complets des quatre épreuves : fin et intégrité déterministes, objectifs réalisables`.
Pour `aube-militia-epic`, le bot générique n'obtient jamais l'objectif sur les
graines `[1,2,3,4,7,11,21,41]`. Les combats terminent et restent déterministes,
mais aucun résultat ne satisfait le test. Cela ne prouve pas encore que
l'épreuve est impossible pour un humain. Examiner défaite/victoire, placement,
survie du Milicien Rare, stratégie du bot et difficulté de la rencontre.
**Ne pas enlever l'assertion ni annoncer les tests verts.**

La parité historique de **60 scénarios reste identique**. Les deux builds
passent (56 modules, 76 illustrations). Aucun parcours navigateur du nouveau
flux n'a encore été exécuté. Les suites de la PR 54 sont des résultats de la
version précédente, pas une validation de ce nouveau pilote.

Les logs scratch peuvent disparaître ; résultats utiles retranscrits ici :
`/tmp/ca-trial-new-tests.log`, `/tmp/ca-trial-all-tests.log`,
`/tmp/ca-trial-checkpoint-parity.log`, `/tmp/ca-trial-checkpoint-build.log`.
Playwright 1.56 est dans `/tmp/ca-deck-pw` et Chromium 1194 dans le cache si
encore présents ; les recréer selon le workflow existant si nécessaire.

## Prochaines étapes, dans cet ordre

1. Relire AGENTS, cet état, la PR, Notion et le main actuels. Vérifier le commit
   exact et les autres PR. La nouvelle PR n'a aucune autorisation de fusion.
2. Corriger/investiguer le test de l'épreuve Épique ; tester aussi la lisibilité
   des conditions et la possibilité réelle de réussir chaque défi.
3. Ajouter le parcours navigateur des trois formats et HTTP/hors réseau :
   accès/verrou boss, objectif raté, victoire, consommation exacte, récompense
   une fois, résultat, Collection, deck manuel, invocation future en campagne,
   reprise et export/import.
4. Vérifier particulièrement la transaction de `settle()` : simuler un échec
   d'écriture du profil après victoire, recharger la bataille terminée puis
   attribuer exactement une fois, sans consommer avant sauvegarde réussie.
5. Revue des règles d'accès, appels directs, profils sans exemplaire, rangs
   interdits, changements de classe, mélange natifs/futurs et quotas persistants.
   La lecture/survol ne doit jamais transformer ou attribuer une carte.
6. Actualiser les contrats Aube, AGENTS, README, architecture et changelog autour
   de l'état final : plusieurs anciennes sections décrivent encore toutes les
   évolutions comme réservées au laboratoire.
7. Rejouer tests, parité, builds, simulations et suites navigateur pertinentes.
   Revoir les captures. Générer/synchroniser l'unique `JOUER.html`, supprimer
   tout générateur temporaire avant livraison et comparer les arbres distants.
8. Mettre à jour cette même PR, résultats et limites exacts. Si seule la CI reste
   à attendre, arrêter sans surveillance active. Aucune fusion ni publication
   sans accord spécifique du propriétaire.

Le checkpoint et l'état de l'export GitHub figurent dans la description de PR.
Ne pas prendre ce brouillon pour la version finale jouable validée.
