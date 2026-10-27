> **Contrat remplacé pour les règles natives :** la correction
> [Règles uniques](REGLES_CARTES_UNIQUES.md) applique Garde/Riposte validées
> à tous les exemplaires concernés et impose la relance des anciens combats
> actifs. Les mentions de règles natives historiques ci-dessous décrivent
> les livraisons précédentes, pas le fonctionnement proposé sur cette branche.

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
- Nouvelle suite vérifiée en deux parties sur le même export stabilisé :
  **13 parcours d'obtention** (quatre par format bureau/portrait/paysage et un
  web), dont **sept combats complets par les vrais boutons** (quatre bureau,
  un portrait, un paysage, un web) ; les autres démarrent sur une clôture issue
  d'un vrai combat simulé. Collection, six cellules, quantités, deck +/−,
  export/import, vraie invocation en campagne et reprise vérifiés dans chacun.
- `recovery()` a ensuite réussi : échec d'écriture du profil, tentative de
  commencer une autre épreuve sans écraser la récompense en attente, récupération
  sans nouvelle bataille parasite, coupure après reçu, absence de doublon,
  défaite/objectif manqué sans coût et verrou du premier boss.
- **26 suites navigateur existantes réussies** : Concorde, ciblage, effets,
  cartes/pose/aperçu (dont présentation commune), remise à zéro graphique,
  laboratoire, maintenance web, Collection (dont deck manuel), Milicien,
  Aube/Sylve/Ombre/Forge/Éther, sorts, compétences V2.8, nouvelle aventure,
  contrôles V2.9, pilote illustré, capacités, géométrie, plein écran, décor peint
  et intégrité des sauvegardes. Captures des épreuves bureau/portrait/paysage
  et invocation future examinées ; aucune illustration changée.
- Simulations historiques `control-balance` et `arena-balance` réussies.
- Le workflow de test permanent exécute la nouvelle suite en plus des contrôles
  existants. Une erreur dans le parcours du test de reprise a été corrigée :
  il ouvre le menu Citadelle avant la navigation, comme le joueur.

## Export et provenance

`JOUER.html` : **34 517 925 octets**, blob
`b2550711a00d5e9b93098f4ac2ee923c58f903b2`. Le générateur ponctuel
[40520075186](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40520075186)
a réussi et l'a enregistré dans `f2621e47904ff1d0a6e11469d5aeaaf7f607fcc8`,
arbre `6039efac5288fe02e415dd8f1f30c4c7ec87fad6`, identique au local préparé.
Son parent source `bf13cb07` avait lui aussi été comparé au local avant envoi.
Le workflow temporaire est retiré dans la clôture de revue. Le build web est
recontrôlé sans variation du blob ; aucun HTML diagnostic n'est distribué.
La tête finale et son arbre sont consignés dans la description de PR pour
éviter une référence circulaire à ce document.

Les logs de `/tmp` sont éphémères : `ca-evolution-final-browser.log` contient
les 13 parcours, `ca-evolution-recovery.log` leur complément de récupération,
`ca-evolution-regression.log` les 26 suites et `ca-evolution-final-tests.log`
les 432 tests. Playwright 1.56/Chromium 1194 installés via
`/tmp/ca-evolution-pw` si encore présents. Le builder ne doit pas réécrire
les HTML pendant qu'un navigateur les lit.

## Reprise de la vérification distante

Le contrôle GitHub `40521939853` du commit `110666be` s'est terminé en échec
sur la nouvelle suite : écran Citadelle observé au lieu du combat après la
première reprise. Node, parité, builds et les contrôles précédents avaient réussi.
L'assemblage web `40521939648` avait également réussi. Cet échec n'a pas été
reproduit sur 18 créations/reprises locales, dont six avec survol et capture.

Le test attend désormais l'écran de combat après rechargement et compare
strictement le combat sauvegardé avant/après. Les conditions de victoire,
les stocks et les assertions de récompense restent inchangés. Aucune règle du
jeu ni export modifié. Consulter la PR pour les résultats de cette nouvelle
tête : ne pas annoncer sa CI réussie avant vérification et ne pas fusionner.

## Suite à donner

1. Consulter les **deux CI du commit final exact**, son arbre et le main actuel.
   Ne pas réutiliser une ancienne tête ; les contrôles distants sont distincts
   des vérifications locales. La PR reste en brouillon tant que la revue n'est
   pas conclue. Pas de surveillance active si seule la CI reste.
2. Présenter la PR au propriétaire pour son essai/revue. Les réglages des quatre
   rencontres sont un pilote, sans équilibrage humain exhaustif.
3. Fusion et publication demandent un accord spécifique ; ne pas les déduire
   d'un « continue ». Après accord, revérifier tête/base, conflits et CI, puis
   confirmer séparément la publication effective.

Limites : Chromium bureau/mobile simulé, sans téléphone physique, Safari/Firefox,
ni équilibrage humain exhaustif. La publication du site après PR 54 n'est pas
vérifiée dans cette mission.
