# État courant — vérifié le 31 octobre 2026

## Intégré dans main

Dernier main vérifié : [`117a643bf110995f3bc67dc86c55a678cc8b0f76`](https://github.com/floiaassistant-design/couronne-et-arcanes/commit/117a643bf110995f3bc67dc86c55a678cc8b0f76),
fusion autorisée de la [PR 65](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/65).
Son arbre `ea419ca21800af1f47ad655a9b298b6d0c1841d6` est identique à la tête
approuvée `d6458eba36ca7913b12609db24280c35490c60fc`.

- **Sauvegardes** : profil illisible préservé, récupération/import explicites,
  opérations ordinaires sur copie et succès seulement après écriture durable.
  Paquets, fusions et clôtures gardent leurs transactions/reçus spécialisés.
- **Évolutions** : Aube complète à l'obtention (41 évolutions), Sylve jusqu'à
  Légendaire (26). Les 22 Divines/Éveillées Sylve restent à implémenter ; Ombre,
  Forge et Éther restent natifs dans le jeu. [Reprise des cartes](REPRISE_MIGRATION_CARTES.md).
- Même moteur, registre et ressources pour web, laboratoire et `JOUER.html` ;
  laboratoire isolé de la progression. Six raretés de Collection, deck manuel,
  ciblage direct, effets de combat, Garde/Riposte uniques et CI parallèle intégrés.
- Protection GitHub lue : ruleset [Protection main](https://github.com/floiaassistant-design/couronne-et-arcanes/rules/26023976)
  actif sur main, PR obligatoire, branche à jour et contrôles `validation` /
  `assemblage-web`, suppressions et force pushes bloqués, aucun acteur de contournement.
  La configuration n'exige pas de revue GitHub approuvée ; l'accord spécifique
  du propriétaire reste obligatoire selon AGENTS.

## Contrôles observés

Sur la tête approuvée : [tests complets réussis](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/41210592469)
et [assemblage web réussi](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/41210592442).
Leur réutilisation pour le merge repose sur l'identité d'arbre ci-dessus.
L'[assemblage main](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/41219964483)
et la [CI main](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/41219964452)
ont également réussi sur le commit de fusion exact.

## Publication séparée

Publication confirmée : **Sites nº 18**, GitHub `117a643bf110995f3bc67dc86c55a678cc8b0f76`,
source de diffusion `760fcd4d9ae032123e9fca43b6ba028582d65f8c`, audience publique.
L'automatisation existante a achevé son exécution le 31 octobre à 17 h 42,
heure de Paris, avec provenance/empreintes du paquet et fichiers modifiés
comparés. Le déploiement natif `appgdep_6ae61a39af708191819a6d0119517e37`
est confirmé réussi. Aucune publication parallèle lancée pendant cette reprise.

[Jeu en ligne — version publiée ci-dessus](https://couronnes-arcanes-jeu.flo-ia-assistant.chatgpt.site)
· [Export du main intégré](https://github.com/floiaassistant-design/couronne-et-arcanes/raw/117a643bf110995f3bc67dc86c55a678cc8b0f76/JOUER.html).

## Reprise de l'audit — travail documentaire proposé

Branche `docs/reprise-audit-et-tests-20261031`, basée sur le main ci-dessus.
Aucune autre PR ouverte au départ. Cette branche sépare consignes permanentes
et bilans datés, corrige les statuts intégrés et cartographie les tests existants
dans [CARTE_TESTS.md](CARTE_TESTS.md). Aucun fichier de jeu, test, workflow,
illustration ou export modifié ; aucune écriture dans Notion.

Contrôles locaux réussis : cinq tests Node existants de portée documentaire et
pipeline, dont cinq tests Python appelés par le pipeline ; liens ajoutés et
chemins de tests vérifiés, archives fidèles et diff documentaire relu. La CI
de cette nouvelle PR doit être vérifiée sur son propre SHA. Cette documentation est
**proposée, non fusionnée** ; son accord de fusion reste spécifique.

Prochaine étape de l'audit : relever les parcours campagne/IA réellement
couverts et les lacunes, puis mesurer la lisibilité et les interactions mobiles.
Les simulations ne valident pas seules la difficulté humaine. Le prochain lot
créatif de cartes reste distinct : Divines/Éveillées Sylve, après relecture des
validations Notion et des mécaniques à implémenter.

## Historique

[Anciens points de reprise](HISTORIQUE_ETAT_2026_10_31.md) ·
[Anciennes consignes et bilans](HISTORIQUE_CONSIGNES_2026_10_31.md).
Les contrats spécialisés conservent leurs relevés datés ; GitHub et cet état
courant priment pour le statut de livraison. Les règles permanentes sont dans
[AGENTS.md](../AGENTS.md).
