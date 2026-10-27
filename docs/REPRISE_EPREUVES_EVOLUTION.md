# Reprise — épreuves d’évolution Aube, PR 55

La pause du 27 octobre a été levée par le propriétaire. Continuer sur cette
même branche/PR, sans fusion ni publication autorisée.

- Dépôt : `floiaassistant-design/couronne-et-arcanes`.
- Branche : `feat/epreuves-evolution-aube`.
- [PR 55](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/55) :
  tête exacte, export et résultats distants dans sa description.
- Main relu : `1177160856b5162eb06c7df109d479eb41441926` (PR 54 fusionnée sur
  accord après ses deux CI réussies). La PR 53 était déjà intégrée.
- [Notion officiel](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f)
  relu, édition `2026-10-27T06:13:46.581Z`, décisions Aube inchangées.
  Aucune écriture Notion. Les recettes de ce pilote sont proposées à la revue.

## Périmètre et code

Lire [EPREUVES_EVOLUTION.md](EPREUVES_EVOLUTION.md) pour le contrat complet,
les quatre transformations, prérequis et responsabilités. Les 37 autres
évolutions restent au laboratoire. Les natifs restent des chaînes d'ID ;
seules les évolutions utilisent `{id,rarity}`, avec inventaire facultatif
`evolvedCollection` et suivi `completedTrials`. Les anciennes sauvegardes,
achats, maîtrise et clés restent compatibles.

Le test auparavant rouge pour `aube-militia-epic` est corrigé sans retirer
son assertion. L'épreuve ne porte plus le statut de boss (quatre lignes/furie) ;
son deck et son objectif sont conservés. Le vrai boss de campagne reste inchangé.
Les simulations du parcours trouvent une réussite sans forcer le résultat.

La clôture utilise les copies et le reçu de profil existants. Une récompense
non sauvegardée reste récupérable ; une autre action ne peut pas écraser le
combat terminé. Une récupération réussie affiche d'abord son résultat, sans
exécuter l'action qui avait demandé cette récupération.

## Vérifications acquises

- **432 tests Node réussis**, dont dix cas dédiés aux épreuves.
- **60 scénarios de parité identiques**.
- Builds normal/test réussis : **56 modules, 76 illustrations**.
- Revue du graphe : **216 dépendances, aucun cycle** ; moteur sans DOM.
  `app.js` 371 lignes, `battle.js` 390, nouveaux modules métier 48/54 lignes.
- Quatre parcours complets bureau réussis : bataille par les vrais boutons,
  récompense, Collection, deck manuel, export/import, invocation en campagne
  et reprise. Parcours Milicien Rare tactile portrait également réussi.
- Simulations historiques `control-balance` et `arena-balance` exécutées.

Les autres suites navigateur et la vérification complète sur l'export final
sont en cours lors de ce checkpoint de travail. Ne pas annoncer cette CI verte.
Les fichiers de `/tmp` sont éphémères ; les résultats finaux doivent être
reportés ici et dans la PR. Logs de session : `ca-evolution-final-browser.log`,
`ca-evolution-regression.log`, `ca-evolution-tests.log`, `ca-evolution-control.log`
et `ca-evolution-arena.log` dans `/tmp`. Playwright 1.56/Chromium 1194 installés
via `/tmp/ca-evolution-pw` si encore présents.

## Avant livraison de cette même PR

1. Terminer `browser_evolution_trials.py` : quatre combats complets bureau,
   un portrait et un paysage, autres clôtures dans les trois formats, parcours
   web modulaire, imports, invocation future, deux interruptions de clôture,
   objectif manqué/défaite et verrou de boss. Ne pas affaiblir les assertions.
2. Terminer les suites navigateur du workflow, examiner leurs captures et
   corriger tout échec pertinent ; compléter le bilan exact.
3. Rejouer les contrôles affectés par les derniers correctifs. Le builder ne
   doit pas réécrire les HTML pendant qu'un navigateur les lit.
4. Synchroniser `JOUER.html` depuis les mêmes sources. Le générateur temporaire
   `.github/workflows/evolution-checkpoint.yml` doit être retiré avant livraison.
   Comparer blob, arbre complet et tête GitHub aux fichiers locaux testés.
5. Mettre à jour la PR et ce bilan. Les contrats Aube, deck, AGENTS, architecture,
   README et changelog ont été réconciliés avec les quatre versions pilotes.
6. Si seule la CI reste, arrêter sans surveillance active. Fusion et publication
   demandent un accord spécifique ; ne pas le déduire d'un « continue ».

Limites : Chromium bureau/mobile simulé, sans téléphone physique, Safari/Firefox,
ni équilibrage humain exhaustif. La publication du site après PR 54 n'est pas
vérifiée dans cette mission.
