# Publication de Couronnes & Arcanes sur Sites

**Dernier état de diffusion vérifié :** Sites version 7 après la fusion autorisée
de la [PR nº 45](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/45)
le 24 octobre 2026 ; déploiement `appgdep_6adcf79b58a88191a148fcf5539a926c`
réussi et fichiers diffusés contrôlés, selon le bilan de cette PR. Les preuves
détaillées de la première publication Concorde version 5 plus bas sont historiques.

Le propriétaire a choisi Sites le 23 octobre 2026.
Jeu publié : https://couronnes-arcanes-jeu.flo-ia-assistant.chatgpt.site
Site existant : `appgprj_6adb64bffce88191bb77cdb42fd9fc73`.
Conserver cet identifiant et l’audience renvoyée par le Site natif lors de la
publication. Le 24 octobre 2026, elle est publique ; l’ancienne mention privée
ne doit pas déclencher de changement d’accès.

## Une seule source de développement

GitHub `floiaassistant-design/couronne-et-arcanes`, branche `main`, reste
l'unique source du jeu. Le dépôt de sources natif Sites contient seulement une
copie de diffusion compilée. Ne jamais y développer le moteur ou les images.

`scripts/build_web.mjs` réutilise le compilateur autonome et ses contrôles
d'images ; il refuse un JOUER enregistré différent du build. Il assemble dist
depuis les fichiers existants, sans modifier règles, IA ou sauvegardes.
L'entrée modulaire et l'export hors ligne utilisent donc les mêmes sources.
`dist/JOUER.html` est la copie exacte de l'unique export téléchargeable dans
le paquet canonique. Le miroir Sites peut omettre ce seul fichier lorsque sa
taille dépasse la limite des objets du dépôt natif ; voir le bilan ci-dessous.

Les scripts, tests, documents et reçus JSON ne sont pas distribués dans dist.
Si un futur rendu consomme du JSON, adapter explicitement ce contrat et celui
du générateur autonome. Aucun cache applicatif ni service worker n'est ajouté.

## Paquet de CI et provenance

Le workflow `Assemblage web` s'exécute sur les PR et les push vers main,
avec `contents: read`, sans secret ni publication. Après assemblage,
`scripts/package_web_artifact.mjs` crée `.openai/canonical-build.json`
et `/tmp/couronnes-web.tar.gz`. L'artifact GitHub `couronnes-web` conserve
cette archive pendant 14 jours. Le reçu généré est exclu de Git.

Le reçu identifie le dépôt, le commit source, son arbre Git, le SHA-256 de
JOUER et celui de tous les fichiers distribués. Pour `web_sha256`, trier les
noms relatifs POSIX, former `nom + U+0000 + sha256(octets)` pour chaque fichier,
joindre par un saut de ligne sans saut final, puis calculer le SHA-256 UTF-8.

La préparation du paquet ne remplace pas le workflow complet
`Tests Couronnes et Arcanes`. Avant publication, les deux workflows doivent
avoir réussi pour un arbre Git identique à celui du main visé. Une CI de PR
fusionnée peut être réutilisée si l'arbre correspond exactement. Consulter
la CI existante avant toute relance ; attendre un contrôle en cours.

## Déclenchement après fusion

Une automatisation ChatGPT a été créée et activée sur les événements GitHub
de fusion du dépôt canonique, sans interrogation périodique. Elle ignore les
fusions hors main. Elle ouvre le même Site via une autorisation fraîche et
suit `.openai/update-from-github.md`, conservé dans son dépôt de sources.

Elle télécharge le paquet vérifié, valide les chemins d'extraction, son reçu,
l'arbre via GitHub et les empreintes. Si le contenu web est déjà identique,
elle évite une nouvelle publication. Sinon elle remplace uniquement dist et
le reçu, relit main pour éviter de publier une version dépassée, puis pousse
et publie les mêmes sources par le flux natif Sites. Elle conserve l'audience
et ne fusionne jamais de PR. Un paquet expiré, une CI rouge ou un accès perdu
bloquent la publication et doivent être signalés.

Le workflow d’assemblage est désormais installé sur main. Le déclenchement
automatique après la fusion de la PR nº 42 et sa publication de bout en bout
ont été observés avec succès le 24 octobre 2026 ; les preuves suivent.

## Publication Concorde réellement vérifiée — 24 octobre 2026

- Fusion autorisée de la PR nº 42 : main
  `ea1e18c49bcfd291a664dacdf95b4bb5c847af89`, arbre
  `6ca0680d09f3e560059d10420ed77014c4951619`.
- [CI complète réussie](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40077509046)
  et [assemblage web réussi](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40077509054),
  réutilisés après vérification de l’arbre identique au main.
- Artifact `couronnes-web` nº `12553797625`, ZIP vérifié, chemins et reçu
  contrôlés, 148 fichiers canoniques comparés aux sources. SHA-256 du ZIP :
  `9cb206d37ba44a429aa43764c75fc2c764d7e5d22a51a9d2b613dea9bec7b381`.
- Automatisation existante déclenchée à 09:01:24 UTC et achevée à 09:07:05 UTC,
  sans seconde publication manuelle concurrente.
- Sites version 5, commit de diffusion
  `64f8a1c9e1760d25a5820b5ad5da92f00046e57d`, déploiement
  `appgdep_6adc74e226408191a465f3690ac2a758`, état terminal `succeeded`
  constaté à 09:05:46 UTC. Même URL, audience publique conservée.
- Les 147 fichiers web du commit réellement poussé sont identiques au paquet
  canonique. Téléchargement HTTP sans cache et comparaison exacte des 14 fichiers
  nouveaux ou modifiés : index, les sept modules concernés, card-arena.css et
  les cinq feuilles de styles sous styles/.

Le paquet canonique conserve l’export JOUER exact de 34 443 281 octets.
Le dépôt natif Sites refuse cet objet trop gros : seul `JOUER.html` est omis
du miroir web ; le fichier GitHub et son unique version hors ligne sont conservés.
Le reçu natif déclare `distribution: web-modular`, `omitted_files: [JOUER.html]`,
la raison de l’omission, l’arbre source et les empreintes suivantes :

| Empreinte SHA-256 | Valeur |
| --- | --- |
| Export hors ligne | `30dd5831479d0890ab858b623ba79af4ae394661169c44cdd177334a0320e0e8` |
| Web canonique, avec JOUER | `8527a8affffe940a05b064d0b59c68eadff130333b032b14cebcff7638ac5fda` |
| Web diffusé, sans JOUER | `a19ed142d2caf42924d805fc5b60f534a7f1df269df6425f1c2cfa094a93520f` |

Cette preuve concerne cette version exacte. Une future fusion demande de
nouveau les contrôles du commit, de l’archive réellement publiée et des fichiers
servis ; ne pas déduire sa publication d’une CI ou d’un ancien déploiement.

## Historique — publication initiale réellement vérifiée

La version 1 du Site a été publiée avec succès depuis main
`ef675bbaed3e1154cd52920cc9f74b4b6345d4b7`, arbre
`7d7760a7874e99ebd57ec9ca87587b7da12ce1a9` : PR 35, 36 et 37 intégrées.
La CI complète existante réussie et son arbre identique ont été consultés.
Le paquet compte 104 fichiers identiques aux sources, 34 modules et 42 cartes
WebP approuvées. SHA-256 de JOUER :
`3c6afd58b0b4c2a9562b9cf0a12665bbd71debf7bae2821524f055db2bc34bdf`.

Une nouvelle session avec une autorisation fraîche a relu les sources Sites,
les instructions et le reçu, puis confirmé l'empreinte des 104 fichiers.
L'aperçu géré Sites ouvre l'accueil et lance la première bataille. Cette
vérification manuelle ne prouve pas encore l'exécution future de la tâche.

## Travail parallèle et sauvegardes

Cette PR ne modifie ni src, styles, images, package.json, ni les tests du jeu.
Elle peut avancer pendant une autre PR. Réconcilier les notes état/journal si
elles se chevauchent et relire le dernier main avant toute fusion.
Chaque PR exige toujours un accord spécifique ; aucun auto-merge.

Le stockage navigateur appartient au domaine du Site. Utiliser l'export/import
du Guide pour transférer une partie depuis le fichier hors ligne. Cette
publication n'ajoute ni compte joueur ni sauvegarde cloud.
