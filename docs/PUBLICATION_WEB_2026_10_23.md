# Publication de Couronnes & Arcanes sur Sites

Le propriétaire a choisi Sites le 23 octobre 2026.
Jeu publié : https://couronnes-arcanes-jeu.flo-ia-assistant.chatgpt.site
Site existant : `appgprj_6adb64bffce88191bb77cdb42fd9fc73`.
Conserver cet identifiant et son audience privée actuelle.

## Une seule source de développement

GitHub `floiaassistant-design/couronne-et-arcanes`, branche `main`, reste
l'unique source du jeu. Le dépôt de sources natif Sites contient seulement une
copie de diffusion compilée. Ne jamais y développer le moteur ou les images.

`scripts/build_web.mjs` réutilise le compilateur autonome et ses contrôles
d'images ; il refuse un JOUER enregistré différent du build. Il assemble dist
depuis les fichiers existants, sans modifier règles, IA ou sauvegardes.
L'entrée modulaire et l'export hors ligne utilisent donc les mêmes sources.
`dist/JOUER.html` est la copie exacte de l'unique export téléchargeable.

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

**Le paquet dépend encore de la PR nº 38** : ce workflow n'est pas installé sur
main tant que cette proposition n'est pas fusionnée avec l'accord spécifique
du propriétaire. Le premier déclenchement automatique et sa publication de
bout en bout n'ont pas encore été observés. La création de l'automatisation
ne constitue pas cette vérification.

## Publication initiale réellement vérifiée

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
