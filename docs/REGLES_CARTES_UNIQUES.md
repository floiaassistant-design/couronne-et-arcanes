# Règles uniques des cartes jouables — 27 octobre 2026

## Demande, périmètre et source

Le propriétaire constate que les cartes déjà jouables restent aux anciennes
règles alors que leurs nouvelles mécaniques sont programmées au laboratoire.
Il demande une règle unique par carte, y compris pour les exemplaires déjà
possédés. Il accepte de quitter puis relancer un ancien combat ; il refuse
la coexistence permanente de deux fonctionnements. Réalisation autorisée par
« tu peux lancer je suis à 100 % ». Cet accord ne couvre aucune fusion.

Base vérifiée : main `b58ea3f00330d5f1db3675a2611ddcca8374e699`, PR 55 intégrée.
Branche indépendante `fix/regles-cartes-jouables`. La PR 56 n'est pas modifiée.
Source relue : [tableau maître Notion](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f),
édition **2026-10-27T06:13:46.581Z**, sans omission signalée par la lecture.
Les décisions générales de Garde/Riposte y concernent toutes les factions ;
les anciens paragraphes « jouables » y décrivent encore le comportement publié.
Aucune nouvelle décision écrite dans Notion.

## Audit du socle et résultat attendu

| Périmètre | Résultat |
| --- | --- |
| 53 unités natives | ATQ, PV, délai, déplacement et portée de base conservés ; aucune possession transformée |
| 10 Aube | Leurs définitions et helpers programmés servent aussi l'aventure et les fiches natives ; plus de projection de règles parallèle |
| 5 gardiens : Porte-égide, Gardien des Racines, Veilleur du tombeau, Golem runique, Sentinelle prismatique | Garde normale positionnelle sur leur ligne, protège uniquement leur couronne |
| 7 natifs à Riposte : Porte-égide, Paladin solaire, Gardien des Racines, Chevalier du Tombeau, Golem runique, Sentinelle prismatique, Ange du Bastion | Dégâts bruts égaux à l'ATQ effective, Concorde/Ralliement compris, sans Charge ; au contact après survie, une fois par tour |
| Milicien Divin/Éveillé au laboratoire | Riposte spéciale une fois par invocation conservée |
| 4 évolutions des épreuves PR 55 | Toujours obtenables et jouables selon leurs conditions existantes |
| 37 autres évolutions Aube | Toujours au laboratoire, sans nouvelle obtention |
| Évolutions Sylve/Ombre/Forge/Éther | Aucune matrice supplémentaire activée ; règles communes Garde/Riposte seulement, sans inventer leurs autres pouvoirs |

Garde normale : gardien vivant entre l'attaquant et sa propre couronne, même
ligne. Divine : sa ligne même dépassé ; Éveillée : toutes les lignes. Un seul
gardien par frappe, priorité à la même ligne puis au plus près de sa couronne,
égalité ligne/uid. Sans quota de tour tant qu'il vit. Aucune protection d'une
autre unité : le premier ennemi à portée reste la cible directe d'un tireur.
Le sélecteur n'ajoute aucune candidature « historique ».

Riposte : protections normales de la cible, pas de chaîne, pas contre un tireur,
pas après mort, pas entre deux lignes ni sous Silence ; le quota survit à la
sauvegarde. Aucun montant fixe natif n'est conservé dans les données ou le moteur.

Les primitives natives d'arrivée et de soutien utilisent les helpers déjà
communs au laboratoire : même valeur de Soin/Inspiration/Protection, états de
fréquence persistants, plafonds de barrière respectés sans écraser un surplus
existant. Les chiffres blessés (ATQ/PV/Armure de l'instantané) restent réels.
Les prix, paquets, fabrication, achats, maîtrise, bonus de profil, illustrations,
IDs, clés de stockage et stocks restent inchangés.

## Une seule résolution

- `cards/abilities.js` porte `GUARD_POLICY` et les capacités natives actuelles.
  Les améliorations Aube héritent des paramètres, sans recopier Garde/Riposte
  dans les rangs qui ne les changent plus.
- `cards/definitions.js` garde un seul registre immuable.
  `resolveRulesDefinition` est un alias de `resolveUnitDefinition` ; aucune
  seconde map ni branche selon `source`, date ou contexte.
- `engine/unit-rules.js`, `battle-defense.js`, `guard-candidates.js`,
  `unit-support.js` et l'IA lisent ces mêmes définitions. Les replis historiques
  et l'ancien pilote `labGuard` sont retirés.
- `CARD_RULESET = 'cards-v2'` est une révision de compatibilité, pas une option
  de gameplay. Toute création de combat la pose ; les actions refusent une
  ancienne révision. Les unités nouvellement invoquées portent leur vrai rang.
- La fiche commune dérive Garde/Riposte aussi hors Aube et n'affiche plus
  « Garde historique ». Les sorts et autres fiches natives conservent leur texte.
  Le Guide explique la règle actuelle, sans sélection d'une ancienne variante.

## Sauvegardes et mise à jour

Profil et bataille sont deux sauvegardes distinctes. Importer un ancien profil,
reprendre sa collection ou acheter une carte native n'active aucune ancienne règle.

`restoreBattle` refuse un ancien combat **actif**, sans le réécrire ni toucher
au profil. Un message demande de le relancer depuis Campagne/Tour/Donjon/Épreuves.
« Revenir au jeu » retire seulement cette bataille si le stockage l'autorise ;
aucune défaite, XP, dépense, consommation de carte ou récompense n'est créée.
Un donjon conserve sa phase, sa salle et ses PV d'entrée, pour rejouer la salle.
Une nouvelle bataille remplace naturellement l'ancienne sauvegarde de combat.

Une partie précédente reste restaurable : son profil est récupéré et son ancien
combat actif affiche le même message. Aucun profil ancien n'est invalidé à cause
de la seule révision de bataille.

Un ancien combat **déjà terminé** peut encore passer par la clôture existante et
son reçu avant nettoyage. Aucun ancien tour n'est exécuté ; cela préserve un gain
interrompu et sa protection contre une double attribution. Les nouveaux combats
conservent exactement leurs dégâts, quotas et autres instantanés à la reprise.

## Contrôles et références de simulation

Les anciens tests qui imposaient Garde après dépassement ou Riposte fixe sont
remplacés par les assertions correspondantes aux décisions validées. Leurs autres
contrôles de géométrie, Silence, Armure, fréquence, objets et sauvegardes restent.
`tests/current_card_rules.test.mjs` ajoute des invocations réelles des cinq
gardiens/sept unités à Riposte, dans les deux camps, leur ciblage, leurs fiches,
les modes, les profils et la compatibilité de bataille.

La parité V2.4 n'est plus revendiquée : les règles changent volontairement.
`refactor_baseline_v24.json` reste byte pour byte intact, SHA-256
`4997044f537da23b51202cc0223d9cc84b8cae336fb6632ebd2ea699585b5df8`.
Cette archive sert encore aux contrôles des anciens profils et combats.
`rules_baseline_cards_v2.json` est une **nouvelle référence explicite** : mêmes
60 graines/rencontres sur 3×5 puis sur les géométries actuelles, soit 120 scénarios.
Les empreintes couvrent l'intégralité des batailles/profils ; les résultats sont
lisibles à côté. Le script refuse toute réécriture d'une référence existante.
Les tests métier indépendants vérifient les décisions de gameplay ; cette nouvelle
référence sert ensuite aux non-régressions, sans faire passer l'ancien moteur.

Validation en cours : résultats réellement terminés dans la PR et l'état final
de cette section ; aucun succès distant annoncé par anticipation.

## Réconciliation de la PR 56 et reprise

Ne pas fusionner les deux PR en bloc. La correction des natifs est prioritaire.
La PR 56 reste sur sa branche, sans fusion autorisée. Après intégration de cette
correction, elle devra être rebasée/réconciliée et ses combats rejoués. Son objectif
Porte-égide compte les interceptions de couronne ; un gardien normal interposé
est généralement la cible directe. L'ancien objectif ne doit pas réintroduire
l'ancienne Garde pour obtenir deux interceptions. Revoir son exploit et sa preuve
de réussite avec les règles communes avant de proposer la PR 56 à la fusion.

Avant livraison : comparer main, le commit, l'arbre et l'export officiel exacts ;
retirer le générateur ponctuel. Vérifier la CI de cette tête. Lorsque tout travail
utile est terminé, laisser GitHub notifier sa fin, sans surveillance active.
Aucune fusion ni publication effectuée ou autorisée par cette mission.
