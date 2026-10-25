# État courant — 25 octobre 2026

## Blocage de validation — contrôle du 25 octobre 2026

Sur la tête `75f8f625`, les exécutions Actions [génération](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40176177646), [tests](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40176180677) et [assemblage](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40176180555) ont échoué avant toute étape : runner absent, logs indisponibles. La relance unique du job de génération a également échoué avant exécution. [Statut public GitHub Actions](https://www.githubstatus.com/) annoncé opérationnel au relevé ; panne globale non confirmée. Vérifier via l'interface GitHub les annotations et les éventuelles limitations de facturation/stockage avant toute nouvelle tentative.

Un nettoyage indépendant supprime les CSS obsolètes de l'ancienne fiche et restaure les couleurs de rareté sur le nouvel aperçu. Cet ajustement est une **proposition non validée**. **Reste nécessaire :** reconstruire `JOUER.html` par `npm run build` depuis les sources, supprimer le workflow ponctuel de régénération, obtenir les résultats complets sur l'arbre final et relire l'ensemble avant une éventuelle autorisation de fusion. Ne jamais fusionner ni publier automatiquement.

## Contrôles récents et correction en cours — PR nº 48

La [CI sur `b02dceb`](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40175425633) a validé 336 tests Node, la parité, l'export autonome synchronisé, les parcours Collection bureau/portrait/paysage, le ciblage, Concorde et plusieurs parcours de sauvegarde. Elle a ensuite échoué parce que l'ancien test Milicien recherchait `collection-inspect`, bouton volontairement supprimé. Les tests suivants ont été interrompus. L'[assemblage web sur ce commit](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40175425639) a **réussi**. Le téléversement des captures d'échec a aussi rencontré le quota externe GitHub Actions.

La branche ajoute maintenant une correction ciblée du test Milicien et du test Aube (même sélecteur obsolète), vérifie les empreintes des visuels et remplace l'image neutre de l'aperçu Collection par la vraie carte déjà approuvée, sans changement de ressource, de mécanique ni de sauvegarde. **Régénérer `JOUER.html` depuis les sources**, relire le résultat des deux CI sur le dernier commit, sans surveillance active et sans fusion ni publication implicite.

## Historique — correctif tactile et export synchronisé — PR nº 48

L'export officiel `JOUER.html` a été **régénéré depuis les sources par `npm run build` sur GitHub Actions**, commit [`5474a7e6`](https://github.com/floiaassistant-design/couronne-et-arcanes/commit/5474a7e6a074b71d6c16deb897eb3ac378fe7efb). Le workflow ponctuel de génération s'est supprimé dans le même commit et ne reste **pas** dans le diff de PR. Le contrôle intermédiaire sur `59dc38ba` échouait uniquement à la vérification de synchronisation de cet export (336 tests Node et parité réussis) ; les parcours navigateur de cette exécution ont été sautés. La validation finale de la branche régénérée est à lire dans les nouveaux contrôles GitHub, sans présumer leur issue.

L'[exécution CI sur `93998477`](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40173082058) échouait dans le test navigateur Collection en orientation portrait, tandis que l'assemblage web réussissait. Un correctif de la gestion de l'aperçu distingue désormais les événements de survol des contacts tactiles et ignore la sortie de pointeur due au toucher. Le test simule les événements souris de compatibilité et vérifie que la fiche reste ouverte. Les règles, valeurs de cartes et sauvegardes restent inchangées. **PR non fusionnée ; vérifier le nouvel export autonome généré et la CI du commit final avant toute intégration.** Le quota d'archives GitHub Actions reste une question distincte.

## Proposition Collection — PR nº 48 (non fusionnée)

La [PR nº 48](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/48) conserve six cartes par unité, avec une fiche courte au survol, au focus et au toucher, sans bouton « Fiche ». Les raretés non intégrées restent « À concevoir », sans chiffres ni capacités inventés. Aucun changement du moteur, de l'IA ou des sauvegardes. La proposition a été rapprochée du `main` `7e9613b9872db3171246f2ddccfb3353bd542408` sans perdre les optimisations de CI. Le test navigateur Collection vérifie désormais le lecteur sur les cartes ; contrôler la nouvelle CI avant toute fusion. La PR nº 41 reste indépendante.

## Main confirmé le 25 octobre 2026

`main` `7e9613b9872db3171246f2ddccfb3353bd542408` après fusion de la PR nº 50 : les [tests GitHub](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40164564331) ont réussi ; l'[assemblage web](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40164564386) a construit le paquet mais son téléversement a échoué (quota GitHub Actions). Dernière publication Sites vérifiée : version 7. Aucun résultat de CI de la nouvelle PR nº 48 n'est présumé.

## Historique documentaire

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
