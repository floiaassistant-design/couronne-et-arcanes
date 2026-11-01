# Mission de développement — Couronnes & Arcanes

## Reprendre le travail réel

Lire [AGENTS](../AGENTS.md), [README](../README.md), [l'état courant](ETAT_PROJET.md),
la [Bible](BIBLE_DU_JEU.md) et l'[architecture](ARCHITECTURE_MODULAIRE_V2_6.md).
Vérifier main, les PR ouvertes et les travaux parallèles ; vérifier toute copie
locale. GitHub est la source officielle du jeu et de l'atelier, les anciens
bilans ne déterminent ni les actifs courants ni la prochaine tâche.

## Définir une évolution cohérente

Identifier modules, dépendances et tests, puis réutiliser les règles et rendus
partagés. Garder moteur, IA, progression, interface, animations et stockage
séparés. Préserver hors périmètre équilibrage, identifiants, économie, API et
sauvegardes historiques. Les chiffres ou pouvoirs encore indéfinis ne sont pas
à inventer. Les limites de livraison des cartes sont suivies dans la
[reprise des migrations](REPRISE_MIGRATION_CARTES.md).

Pour les graphismes, lire la [décision de production](REMISE_A_ZERO_GRAPHIQUE_2026_10_20.md)
et le [contrat d'import](INTEGRATION_GRAPHISMES.md), puis vérifier la version
exacte approuvée dans l'atelier. Import et fusion atelier sont distincts.
Source, prompt, droits, provenance, reçu et empreinte restent traçables ;
aucun ancien lot ni lecteur d'effets n'est restauré implicitement.

## Vérifier et livrer

- Une évolution, une branche, une PR. Réconcilier les dépendances utiles,
  sans forcer main ni écraser les contributions d'autrui.
- Choisir les contrôles avec [la carte des tests](CARTE_TESTS.md) et AGENTS.
  Une PR Markdown seule utilise le contrôle léger existant ; le jeu ou la CI
  demandent les contrôles complets pertinents. Ne jamais affaiblir les tests.
- `JOUER.html` est l'unique export hors ligne, généré depuis les mêmes sources
  que le web. Le diagnostic reste réservé aux tests. Documenter chaque ajout
  de module, CSS ou ressource et son inclusion dans les distributions.
- Relire le diff complet et la CI du commit exact. Distinguer tests, examen
  visuel et limites ; les simulations ne valident pas l'équilibrage humain.
- Actualiser les documents concernés et pousser le travail utile. Renseigner dans
  la description de PR les champs `Documentation`, `Reprise`, `Limites`, et
  `Justification` si aucun document ne change. La vérification CI contrôle
  leur présence, mais la revue vérifie la cohérence réelle de ces informations.
  Au retour d'une session, revérifier les états GitHub avant de lire un ancien bilan. Terminer
  les tâches indépendantes de la CI puis laisser un point de reprise si elle
  tourne encore, sans surveillance active ni relance redondante.
- Chaque PR, documentation comprise, attend l'accord explicite et spécifique
  du propriétaire avant fusion. Aucun auto-merge. Après accord, revérifier
  main/contenu/CI et consigner le bilan après fusion dans la PR.
- Sites reçoit seulement la distribution du main intégré et vérifié. Consulter
  l'automatisation existante, préserver l'audience et confirmer le résultat
  terminal ; ne jamais déduire la publication de la fusion.
