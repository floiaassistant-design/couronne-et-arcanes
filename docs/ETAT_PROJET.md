# Paquet d'évolution — proposition du 28 octobre 2026

Main vérifié `feeef6e984e8895a77fa5b715dfbc15fd590ad2e` : PR 59 fusionnée
sur accord après six contrôles verts ; arbre identique à la tête testée.
La branche `feat/paquet-evolution-aube` propose un paquet Aube après mission 03 :
190 or, 3 tirages indépendants, 60 % base Commune/Rare, 35 % évolution Rare,
5 % évolution Épique par carte. Les douze évolutions déjà jouables sont réutilisées.
Aucun nouveau rang, autre faction ou copie gratuite ; les 29 évolutions futures
restent au labo. Paquet mystique : 95 or et tirages historiques conservés.
Les prix/probabilités sont communs au moteur et aux vues ; achats sauvegardés
avant adoption du profil. [Contrat et reprise](PAQUETS_EVOLUTION.md).
Aucune fusion ni publication autorisée pour cette proposition.

Les sections suivantes sont des bilans historiques.

# Fusion de doublons — proposition du 28 octobre 2026

Main vérifié `736fd7d4f3b70c142ed8c4001a7acb5abc8d3a06` : PR 56 fusionnée,
quatre défis pilotes intégrés après six contrôles réussis. La suite est isolée
sur `feat/fusion-doublons-evolutions` : douze recettes Aube jusqu'à Épique,
3 exemplaires libres d'un rang → 1 du rang suivant, sans or/éclats. Aucun
prélèvement dans le deck ; confirmation et sauvegarde avant adoption du profil.
Huit nouvelles versions deviennent obtenables via leurs règles déjà programmées ;
29 évolutions Aube restent au labo. Aucun nouveau paquet ou défi difficile ici.
[Contrat, validation et reprise](FUSION_DOUBLONS.md). Ratio et accès proposés à
la revue ; aucune fusion de cette branche ou publication autorisée.

Les comptes et statuts des bilans suivants sont historiques.

# Reprise vérifiée — 28 octobre 2026

Main actuel `a0726d4408d6ffc4c767fdb1e51be0582ce01445` : PR 57 (règles
uniques des cartes) et PR 58 (CI parallèle) fusionnées. La PR 56 reste ouverte
en brouillon, branche `feat/objectifs-epreuves-aube`, réconciliée avec ce main.
Le défi du Porte-égide utilise deux Ripostes du même exemplaire ; la Garde
actuelle et les trois autres défis sont conservés. Aucun circuit de récompense
ajouté : campagne = cartes natives, épreuves = transformation d'un exemplaire.
[Contrat, vérifications et prochaine étape](OBJECTIFS_EPREUVES.md).
Aucune fusion ni publication autorisée pour cette reprise.

Les bilans datés ci-dessous sont historiques ; les commits et la PR priment.

# État courant — 27 octobre 2026

## Proposition — CI parallèle

Branche `ci/tests-paralleles`, depuis le main `6dee2dc4` (PR 57 fusionnée).
PR 58 en brouillon : premier passage 7 min 13 s, mais reprise mobile en échec ;
verdict global rouge confirmé. Préparation des fixtures isolée avant le parcours ;
résultats du nouveau passage à lire dans la PR, aucun succès CI anticipé.
Quatre groupes de tests parallèles, verdict global `validation`, inventaire et
assertions conservés. Épreuves séparées par contexte ; aucun changement au jeu
ni à l’export. [Plan, quotas et blocage des fusions](CI_PARALLELE.md).
La protection effective de main reste une configuration externe à vérifier ;
aucune fusion autorisée pour cette proposition. La PR 56 reste indépendante.

Les sections suivantes décrivent les livraisons précédentes.


## Correction proposée — règles uniques des cartes jouables

Branche `fix/regles-cartes-jouables`, depuis le main vérifié `b58ea3f0`.
Les cinq gardiens et les sept natifs à Riposte appliquent les règles communes
validées dans Notion, dans les deux camps ; même registre qu’au laboratoire.
Les anciens combats actifs demandent une relance sans pénalité. Les profils et
possessions sont conservés. [Contrat et reprise](REGLES_CARTES_UNIQUES.md).
**440 tests Node**, **120 scénarios de non-régression**, 27 suites navigateur et
nouveau parcours de relance/fiches dans les trois formats réussis. 5 120 combats
de contrôle, comparaison avant/après de 1 536 combats par version. Builds autonomes
et web réussis ; 56 modules/212 dépendances sans cycle. Export exact dans le contrat.
La parité avec les anciennes règles n'est plus revendiquée ; référence V2.4 intacte.
La PR 56 reste indépendante et en attente, en particulier son défi d’interceptions.
Aucune fusion ni publication autorisée pour cette correction.


## PR 55 — épreuves d’évolution Aube proposées

Branche `feat/epreuves-evolution-aube`, base main
`1177160856b5162eb06c7df109d479eb41441926`. Quatre récompenses uniques :
Milicien Rare, Porte-égide Rare, Arbalétrière Rare, Milicien Épique après le
premier boss. Les cartes gagnées sont disponibles en Collection, deck manuel
et nouveaux combats ; les 37 autres évolutions restent au laboratoire.

Le blocage de simulation Épique est corrigé : l'épreuve n'hérite plus des
quatre lignes et de la furie du vrai boss. Celui-ci reste inchangé. Les
432 tests passent ; les 60 scénarios historiques restent identiques. La
vérification navigateur et la clôture après coupure ont réussi localement.
Les deux CI de la tête finale restent à vérifier sur GitHub.
[Contrat](EPREUVES_EVOLUTION.md), [résultats et reprise](REPRISE_EPREUVES_EVOLUTION.md).
Aucune fusion ni publication de cette PR autorisée.

## Main actuel — deck manuel intégré par la PR 54

Fusion autorisée au commit `1177160856` après ses deux CI réussies.
« Mon deck » propose cartes possédées, recherche/filtres, quantités et commandes
+/−, compteur et validation de 12–24 cartes. Les propositions restent facultatives ;
modifications bloquées pendant le combat. [Contrat](DECK_MANUEL_2026_10_27.md).
La publication du site après cette fusion n'est pas vérifiée ici.
Les sections ci-dessous retracent les livraisons précédentes.

## Intégration Aube — étapes 1 à 6 terminées et fusionnées

La [PR nº 53](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/53)
a été fusionnée sur accord explicite le 27 octobre 2026 au commit
`003c696870edd8238f5f74a1e73afc18d8198024`. Son arbre est identique à la tête
validée `6d30a05`. Les tests et l’assemblage post-fusion ont également réussi.
Le tableau maître Notion a été relu dans son édition du 27 octobre 2026,
06:13:46.581 UTC avant fusion. Les règles Aube correspondent au registre ; aucune nouvelle
évolution des autres factions n’est intégrée par cette mission.

Les 51 versions Aube sont raccordées au moteur commun et testables au
laboratoire, avec niveaux 0–3 indépendants. Les évolutions restent refusées
en aventure et sans circuit d’obtention. Le profil, les achats, la maîtrise,
l’économie et les anciennes batailles conservent leurs règles.

L’étape 5 ajoute le modèle de présentation commun, les textes courts dérivés
des capacités et un unique lecteur de fiche pour Collection, main, plateau des
deux camps, decks, Atelier/Alchimie, paquets, récompenses et laboratoire.
Les six cartes par unité sont conservées, avec leurs vrais chiffres et statuts.
Sur mobile : toucher pour lire, retoucher la même carte de main pour sélectionner,
puis choisir une case ; consulter une unité occupée n’active aucune pose.

Contrôles, export exact et tête GitHub dans le [point de reprise](REPRISE_INTEGRATION_AUBE.md)
et la description de PR. [Versions](AUBE_VERSIONS.md), [moteur](AUBE_MOTEUR.md),
[présentation](AUBE_PRESENTATION.md). [Revue complète de l'étape 6](REVUE_AUBE_PR53_2026_10_27.md)
terminée sans défaut bloquant identifié : 418 tests et 60 scénarios de parité
rejoués, exports synchronisés et deux CI réussies sur le code `13be34f`.
La fusion est attestée dans la PR ; les documents de revue datés décrivent sa
préparation. La publication de cette version du site reste à confirmer séparément.

## Jeu intégré sur main

**Jalon précédent :** `003c696870edd8238f5f74a1e73afc18d8198024`, incluant la PR 53. Le main actuel est indiqué en tête de document. Les détails de publication ci-dessous décrivent la dernière version publiée attestée, et non une publication de la PR Aube.

**Jalon de publication vérifié le 25 octobre :** [`1810b1518bc0e8d668ed11bc55042ae5161ae94e`](https://github.com/floiaassistant-design/couronne-et-arcanes/commit/1810b1518bc0e8d668ed11bc55042ae5161ae94e), fusion autorisée de la [PR nº 48](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/48) le 25 octobre 2026. La comparaison GitHub de ce merge à `main` est identique (aucun commit d'écart). La comparaison avec le commit PR `af048c1b` montre un commit de fusion **sans aucune différence de fichiers** : le code et `JOUER.html` sur main sont ceux qui ont été vérifiés.

**Contrôles réussis sur cet arbre :** [tests complets](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40210891590) (336 tests Node, 60 scénarios de parité et parcours navigateur bureau/mobile simulé, hors réseau, sauvegardes) ; [assemblage web](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40210891602) (paquet de PR construit et contrôle de synchronisation `JOUER.html`). L'export officiel a été généré par le builder sur GitHub dans `e6475b6` ; le workflow ponctuel de génération a été supprimé. Les deux vérifications main post-fusion peuvent être réutilisées si leur arbre est identique ; ne pas confondre tests de PR et résultat des nouveaux jobs main.

**Publication Sites confirmée :** l'automatisation existante « Publication Couronnes sur Sites » a achevé son exécution le 25 octobre 2026 (16:52:27 UTC). Elle confirme le commit publié `1810b1518bc0e8d668ed11bc55042ae5161ae94e`, la **version Sites nº 8**, la comparaison des fichiers publics avec le paquet GitHub, et le maintien de l'audience publique. [Jouer à Couronnes & Arcanes](https://couronnes-arcanes-jeu.flo-ia-assistant.chatgpt.site). La publication est distincte de la fusion et de la CI.

## Collection intégrée par la PR nº 48

Chaque unité conserve **six cartes de rareté** dans la Collection, avec une fiche courte au survol, au toucher ou au focus clavier, sans bouton « Fiche ». L'illustration existante et les statistiques natives réellement définies sont reprises ; les évolutions futures demeurent « À concevoir ». CSS de l'ancienne modale retiré ; les vues de combat, le moteur, l'IA, l'équilibrage, les images, la progression et les sauvegardes sont préservés. Contrôle visuel automatisé sur Chromium ; aucun test sur téléphone physique, Safari ou Firefox n'est revendiqué.

## Travail en parallèle

Au relevé du 26 octobre, seule la PR nº 53 est ouverte. La PR nº 41, ancien
audit documentaire, a été fermée sans fusion le 25 octobre. Le tableau maître
Notion reste la référence de conception. Chaque fusion exige toujours un
accord explicite propre à la PR concernée.

## Historique documentaire — relevés antérieurs, non normatifs

### Relevé avant fusion de la PR nº 50

**Main vérifié avant cette PR documentaire :** `1aa294511d35dd063eade2401360ad98a3ea9184`, issu de la [PR nº 51](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/51), qui formalise dans `AGENTS.md` la fin de la surveillance active des tests GitHub une fois tout autre travail utile achevé. Aucun code du jeu modifié par cette PR documentaire. [Tests de PR nº 51](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40163579140) et [assemblage de PR](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40163579155) réussis, arbre Git identique après fusion.

**Contrôles sur ce main :** [tests GitHub](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40163653903) encore **en cours au dernier relevé** ; [assemblage web](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40163653915) **en échec uniquement lors de l'envoi de l'archive**, les étapes de préparation du paquet ayant réussi. Le quota GitHub Actions demeure bloquant. Aucun nouveau déploiement Sites n'est confirmé ; dernière publication vérifiée : **version 7**. Reprendre les contrôles après notification, sans boucle d'attente active.

## Historique — fusion de la PR nº 49 (24 octobre 2026)

**Main après la PR nº 49 (relevé historique) :** `170e9c9a898821dfe27945d18ef0617a79e6cf94`, [PR nº 49](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/49) fusionnée sur accord spécifique le 24 octobre 2026. **Uniquement les workflows d'archivage CI et leurs documents** ont changé ; aucune carte, règle, progression, illustration ni sauvegarde modifiée. L'arbre Git du merge (`747902180cca411758e08545f70e01008f5aeac2`) est identique à celui de la branche validée par les deux CI réussies : [tests complets](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40133817048) et [assemblage web](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40133816929).

**Nettoyage externe terminé :** [exécution d'audit GitHub Actions](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40133466726), **250 archives redondantes supprimées, 9 références conservées, 399,5 Mo restants** selon l'API du dépôt. Le contrat désormais actif : captures de PR uniquement en cas d'échec ou de label `captures-ci` (rétention 2 jours), paquet web toujours construit/vérifié mais archivé **uniquement sur main** pendant 7 jours.

**Blocage externe encore observé :** [premier assemblage web post-fusion](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40135240903) a généré avec succès les fichiers `dist/` et le paquet du nouveau main, mais son **téléversement a échoué** car GitHub n'avait pas encore recalculé le quota. [Tests main](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40135240945) ont ensuite **réussi**. La [relance de l'assemblage le 25 octobre](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40135240903) a de nouveau été refusée au téléversement pour quota de stockage. **Aucune nouvelle publication Sites attestée** : dernière version vérifiée, Sites v7. **PR nº 41 et nº 48 toujours ouvertes** et non fusionnées.

## Main, jeu et publication

**Historique antérieur :** `63bc8b14b09bf4ecd94bb12bc6aecf17d8d2678e`, fusion autorisée de la
[PR nº 45](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/45)
le 24 octobre 2026. Les PR nº 43 (documentation Concorde) et nº 44 (délai
minimal 1) sont également fusionnées. Les 76 cartes, le ciblage direct, les
effets de combat, le laboratoire et Concorde sont intégrés.

Les repères de camp sont un rond bleu allié et un losange rouge adverse de 7 px,
à gauche des cartes ; les fiches main, plateau et Collection montrent le symbole
d'Ordre puis « Bonus de faction : +1 attaque », grisé et explicite si inactif.
La lumière de l'emblème peint reste en place. Aucun changement des règles,
statistiques, illustrations, progression ou sauvegardes par la PR nº 45.
[Contrat](REPERES_CAMP_FICHES_2026_10_24.md).

Le délai de base minimum est 1 pour les 76 cartes ; les huit anciennes unités
à délai 0 restent immédiatement jouables après pioche et les compositions de
decks historiques sont préservées (PR nº 44). Web et export
`JOUER.html` partagent leurs sources ; un seul export jouable hors ligne.
Les anciens combats 3×5 et sauvegardes restent compatibles selon les
contrôles rapportés dans les PR.

## Contrôles vérifiés et diffusion

La [PR nº 45](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/45)
documente, sur l'arbre de code correspondant au main fusionné, les résultats
de la CI finale : 333 tests, 60 scénarios de parité, deux builds et les
parcours navigateur automatisés bureau/mobile simulé, jeu ancien et sauvegardes.
L'export JOUER généré depuis les sources et sa présence sur GitHub ont été
vérifiés. Aucune nouvelle exécution de ces tests n'est revendiquée par cette
mise à jour purement documentaire. Les vérifications ne couvrent pas le
téléphone physique, Safari/Firefox ni l'équilibrage humain exhaustif.

L'automatisation existante a publié le même jeu sur
[Couronnes & Arcanes](https://couronnes-arcanes-jeu.flo-ia-assistant.chatgpt.site) :
**Sites version 7**, déploiement
`appgdep_6adcf79b58a88191a148fcf5539a926c`, terminé avec succès
et fichiers diffusés comparés au paquet, selon le bilan de la PR nº 45.
La publication est distincte de la fusion ; ne pas la déduire d'une simple CI.
[Procédure et historique](PUBLICATION_WEB_2026_10_23.md).

## CI sélective — intégrée par la PR nº 47

La [PR nº 47](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/47) a été fusionnée le 24 octobre : les PR exclusivement Markdown déclenchent des contrôles légers. Les autres PR conservent les tests complets ; tout push sur `main` garde les deux workflows et l'assemblage pour Sites. Cette optimisation ne dispense pas de vérifier la CI du commit visé.

## Proposition ouverte et prochaine étape

La [PR nº 41](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/41)
reste ouverte en brouillon parmi les travaux antérieurs. C'est un
audit documentaire des 53 unités et 23 sorts, réalisé à partir
d'un ancien main ; ses constats et descriptifs doivent être rapprochés des
modifications fusionnées depuis, sans intégrer automatiquement de nouvelles
règles. Garde, Impact de zone, Feu follet et les évolutions des cartes restent
des choix de conception à programmer séparément.

Les décisions de conception sont suivies dans
[Notion — plan des 76 cartes](https://app.notion.com/p/4026633072a881ed9768c615f538a929)
et [Notion — évolutions des 53 unités](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f).
GitHub reste la source officielle des fonctions réellement intégrées ; une
proposition Notion n'est ni un changement de code ni une fusion.

Toute nouvelle PR, y compris documentaire, attend un accord explicite et
spécifique du propriétaire avant fusion. Recontrôler main, le diff et la CI
sur la version exacte avant toute intégration.
