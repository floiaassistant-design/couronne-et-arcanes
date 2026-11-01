# CI parallèle — contrat en vigueur

La CI parallèle est intégrée. La matrice et les commandes actuelles sont dans
`scripts/ci_browser_groups.json` et `.github/workflows/test.yml` ; voir la
[carte des tests](CARTE_TESTS.md) pour les domaines et les appels imbriqués.
Quatre groupes puis `validation`, propagation des échecs et contrôles sélectifs
des seules PR Markdown sont conservés. Tout push main garde les tests complets
et le paquet web ; une PR documentaire verte ne produit pas nécessairement de paquet.

## Contrôle de documentation proposé le 1er novembre 2026

Le job final `validation` conserve son verdict historique après les quatre
groupes, puis contrôle sur PR les champs `Documentation`, `Reprise`, `Limites`
et éventuellement `Justification` du descriptif. Déclarer une mise à jour
nécessite un changement Markdown réel à la racine ou dans `docs/`.
L'absence de documentation est autorisée seulement si justifiée. Cette
vérification ne lit pas le sens des documents : une revue reste nécessaire.
Aucun appel d'agent, aucune permission d'écriture et aucune fusion automatique.
Le contrôle est sans effet sur les push `main` et conserve les deux statuts
historiquement exigés.

## Protection de main vérifiée le 31 octobre 2026

L'API du ruleset [Protection main](https://github.com/floiaassistant-design/couronne-et-arcanes/rules/26023976)
confirme `enforcement: active`, cible `refs/heads/main`, PR obligatoire,
contrôles `validation` et `assemblage-web` et branche à jour (`strict`), blocage
de suppression et de réécriture forcée. `bypass_actors` est vide et l'utilisateur
courant ne peut pas contourner ce ruleset. **La protection n'est plus à configurer.**

Le nombre de revues GitHub approuvées exigées reste zéro : ce mécanisme ne
remplace pas l'autorisation explicite et spécifique du propriétaire dans
[AGENTS](../AGENTS.md). Aucun réglage GitHub n'a été modifié lors de ce relevé.
L'absence de protection classique ne suffit pas à conclure : lire aussi les rulesets.

## Historique de mise en place — non normatif

Le texte ci-dessous conserve les mesures et échecs initiaux du 27 octobre.
Les mentions de PR ouverte, d'absence de protection et de contrôles à effectuer
décrivent cette date, **pas l'état courant**. Le résultat d'une CI récente se lit
sur le commit exact ; aucune durée historique n'est une promesse de performance.

---

## Proposition initiale du 27 octobre 2026

Base : main `6dee2dc42e3d6bd69d7cd3aaa065c7ac262b674b` (PR 57 fusionnée).
Branche : `ci/tests-paralleles`. Aucune fusion autorisée.
La PR 56 des épreuves reste indépendante ; aucune règle du jeu n'est modifiée.

## Mesure initiale et répartition

Le [passage complet de la PR 57](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40570775867)
a pris **22 min 22 s**, du 27/10/2026 19:37:26Z à 19:59:48Z. Durées observées :
installation Playwright/Chromium 30 s, épreuves 383 s, bloc cartes/pose/aperçus
135 s, contrôle 98 s, Concorde 64 s, ciblage 61 s, simulations 51 + 19 s.
Simplement isoler les épreuves entières aurait laissé un goulot de plus de six
minutes. Elles sont donc divisées par contexte indépendant, sans changer leurs
assertions, profils, combats, graines ou nombre de cas.

Le workflow contient **cinq jobs au total** : quatre instances de `tests` en
parallèle et un job final `validation`. La matrice est statique, plafonnée à
quatre runners Ubuntu standards ; `fail-fast: false` conserve les autres groupes
lorsqu'un groupe échoue. Le workflow web reste indépendant et conserve son nom.

| Groupe | Épreuves attribuées | Autres contrôles principaux |
| --- | --- | --- |
| interface | Portrait : quatre parcours, dont un combat entier | Concorde, fiche universelle, Collection/deck, Milicien, Éther |
| combat | Paysage : quatre parcours, dont un combat entier | Ciblage, effets, contrôle, arène peinte, sauvegardes, Forge |
| catalogue | Bureau : quatre combats entiers | Aube, Sylve, Ombre, sorts, cartes, maintenance HTTP, nouvelle partie |
| moteur | HTTP : un combat entier et bloc de récupération | Tous les tests Node, parité, builds, simulations complètes, géométries, capacités, laboratoire, déploiement, compétences et base graphique |

Estimation avant le premier passage : environ **6–8 minutes**, hors file
GitHub, avec une charge équilibrée autour de cinq à six minutes par groupe et
l'installation propre à chaque runner. Ce n'est pas une durée garantie ; les
durées réellement mesurées du nouveau passage seront consignées dans la PR.

## Couverture et dépendances

`scripts/ci_browser_groups.json` est l'unique liste des commandes navigateur de
la matrice. Les **27 entrées existantes** sont conservées. Une seule entrée est
déclinée en quatre parties : `browser_evolution_trials.py --part ...`, soit 30
commandes, sans duplication des parcours. Sans option, cette suite continue de
faire tout son parcours initial pour l'utilisation locale.

`tests/evolution_ci_plan.py` porte le plan pur des épreuves : 12 parcours de
fichier, un HTTP, puis le bloc de récupération ; **sept combats UI entiers**.
Le test du découpage compare leur union exacte avec le plan initial indépendant,
y compris les formats, le toucher et le caractère complet de chaque combat.
Les fonctions d'assertion de la suite navigateur sont intactes.

Le premier passage distant a révélé une reprise intermittente d'un état de test
antérieur dans le parcours mobile, également observée localement. La préparation
des fixtures est désormais séparée du document testé : chargement initial,
écriture unique du profil et du combat, puis chargement du parcours. Le hook
réinstallé à chaque document contient seulement l'horloge et les pannes simulées.
Aucune réinjection de fixture pendant les rechargements vérifiés, aucune
restauration corrective, attente arbitraire ou relance automatique. Les mêmes
comparaisons exactes du profil et du combat restent obligatoires. La cause
interne au navigateur n'est pas établie ; le résultat du nouveau passage doit
être vérifié sur le commit exact et consigné dans la PR.

Les suites ont été examinées : lecture du dépôt seulement, contextes navigateur
isolés, fixtures déterministes générées sur stdout, serveurs HTTP sur des ports
éphémères. Aucun état de test n'est transmis d'un groupe à un autre. Les profils
nécessaires aux épreuves avancées sont contenus dans leurs propres fixtures.
Les imports entre scripts restent disponibles dans le checkout de chaque job.

`scripts/run_browser_group.py` lance chaque commande avec le Python courant,
sans shell. Il conserve un échec même si une suite suivante réussit et termine
les autres suites de son groupe. Code de sortie non nul dès qu'une commande
échoue, groupe inconnu refusé ; durées et résultats dans le résumé GitHub.

Le groupe moteur exécute une seule fois `npm test`, `test:parity`, le build
normal et sa synchronisation `JOUER.html`, `control-balance` et `arena-balance`
aux volumes actuels, sans réduire le nombre de graines. Les changements restent
limités à la CI, à ses outils/tests et à l'ordonnancement des épreuves. Le jeu,
les sauvegardes et l'export officiel restent byte pour byte identiques.

## Installation, cache et stockage

Chaque runner est une machine distincte. Il faut donc y installer Python /
Chromium et produire son diagnostic local ; cela n'est pas un second passage
des tests. Le build diagnostic prend moins d'une seconde dans la mesure initiale.
Cette petite génération locale évite de stocker et de transférer une archive
de diagnostic d'environ 34,5 Mo à chaque PR. Aucun artefact de transfert ajouté.

Playwright reste épinglé à **1.56.0**, dans `scripts/requirements-ci.txt`.
Le navigateur téléchargé est mis en cache par OS/architecture/version des
requirements ; un seul groupe publie ce cache. L'installation officielle reste
exécutée pour vérifier la version et les dépendances système, même sur cache
chaud. Un cache absent ne fait sauter aucun test. Les caches de PR restent dans
la portée de leur ref GitHub ; aucun binaire de jeu n'est publié depuis un cache.

Les captures ne sont archivées que sur échec du groupe ou label `captures-ci`,
comme avant, avec deux jours de rétention. Noms d'archives distincts par groupe
pour éviter les collisions. Tous les motifs de capture précédents sont conservés.
Le paquet Sites reste produit par `web-package.yml`, archivé uniquement sur main
pendant sept jours ; aucun téléchargement/polling d'artefacts par un agent ajouté.

Le dépôt est **public**, vérifié via son API. Les [runners standards publics](https://docs.github.com/en/actions/concepts/billing-and-usage)
sont gratuits ; les limites de stockage restent applicables. Aucun larger runner,
aucune hausse du plafond de cache, aucun service payant, aucune modification de
facturation. La première exécution de chaque nouvelle version peut avoir quatre
caches manquants en parallèle ; les prochaines révisions peuvent réutiliser le cache.
Une PR plus récente annule l'ancien passage de cette même PR ; les pushes main
ont des groupes de concurrence distincts et ne s'annulent pas mutuellement.

Les workflows n'appellent aucun modèle, aucune API OpenAI ni aucun agent. Le
contrôle final garde son nom stable et les résumés de durée sont automatiques :
les futures PR ne demandent pas de supervision supplémentaire par ChatGPT.
L'analyse d'un défaut réel reste du travail d'agent, comme avant ; aucune promesse
de quota identique pour tous les futurs défauts n'est faite.

## Verdict et protection des fusions

`validation` attend la matrice entière avec `if: always()`. Le shell exact du
workflow n'accepte que `needs.tests.result == success`. Échec, annulation, saut,
absence ou valeur inconnue refusés. Il n'utilise ni checkout ni installation,
`continue-on-error`, ni succès par défaut. Tous les jobs gardent `contents: read` ;
les actions sont épinglées sur des commits, les identifiants Git ne sont pas
persistés. Aucun `pull_request_target`, secret ou privilège d'administration ajouté.

Les tests exécutent ce shell avec chacun des résultats possibles et vérifient
son code de sortie. Le runner est aussi testé avec une vraie commande qui échoue
suivie d'une commande qui réussit : les deux tournent, le verdict reste en échec.
`tests/ci_pipeline.test.mjs` contrôle séparément l'inventaire des 27 suites,
les parties des épreuves et la présence de toutes les commandes moteur.

**Point de configuration externe constaté :** au début de la mission, l'API
indique `main.protected = false` et aucun ruleset. Un job rouge n'interdit donc
pas à lui seul une fusion manuelle dans GitHub. Le workflow ne peut pas activer
une protection de branche par une modification YAML. Le connecteur disponible
n'expose pas de mutation d'administration, et l'interface des réglages demande
une connexion GitHub dans le navigateur dédié.

Réglage à appliquer dans la protection de **main** pour un verrouillage effectif :

- Exiger les contrôles **`validation`** et **`assemblage-web`** avant fusion.
- Exiger une branche à jour avant fusion (mode strict).
- Appliquer les contrôles aux administrateurs et empêcher leur contournement.
- Conserver l'accord humain spécifique à chaque PR ; aucun auto-merge.

Les deux noms sont déjà présents dans les contrôles existants : pas de migration
vers un nom de contrôle absent. [Documentation officielle](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks).
La PR doit signaler distinctement verdict bloquant et protection effectivement
activée ; ne jamais affirmer que cette dernière est active sans lecture de preuve.

## PR documentaires et reprise

La classification restrictive de `ci_change_scope.mjs` est conservée. Chaque
job la calcule avant toute installation navigateur ; seule la vérification
ciblée de la classification et du pipeline tourne sur le groupe moteur pour une
PR uniquement Markdown. Aucune double exécution de ces tests dans une PR complète,
puisqu'ils appartiennent alors à `npm test`. Tout push main garde les tests
complets et l'assemblage web de publication.

Validation préparée : tests de couverture/verdict négatifs, `actionlint` 1.7.7
(source officielle et archive vérifiée par SHA-256), tests Node, parité, builds
et simulations. Les quatre vrais groupes navigateur et la CI du commit exact
sont vérifiés et rapportés dans la PR ; aucun succès anticipé.

Premier essai distant, tête `1a61de3` : [run 40577512835](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40577512835),
**7 min 13 s** entre le premier démarrage et le verdict, mais **rouge**.
Catalogue, combat, moteur et assemblage web réussis ; portrait en échec de
reprise. Le verdict final a bien refusé `needs.tests.result = failure`.
Somme des durées des cinq jobs : **23 min 30 s de runner**, distincte du temps
d'attente de 7 min 13 s. La parallélisation réduit l'attente, pas nécessairement
la somme des minutes machines. Ce passage incomplet ne valide pas le gain final.

Après ouverture : finir les tâches utiles indépendantes du résultat distant,
puis laisser GitHub notifier la fin s'il ne reste que la CI. Lire les durées des
jobs et leur résumé lors de la prochaine vérification, sans boucle de polling.
Aucune fusion ni publication n'est autorisée par cette mission.
