# Préparer la publication automatique du même jeu

Base : main `ef675bbaed3e1154cd52920cc9f74b4b6345d4b7` (PR 35, 36 et 37 intégrées).
Cette proposition prépare les fichiers de publication ; aucun site n'est encore
créé ni relié, aucune mise en production n'est revendiquée.

## Une seule source

`index.html`, `src/`, les styles et les images restent ceux du jeu existant.
`scripts/build_web.mjs` réutilise le compilateur autonome et ses contrôles
d'images ; il refuse un export enregistré qui ne correspond pas aux sources.
Il assemble `dist/` depuis les mêmes fichiers, sans modifier le moteur, l'IA,
les sauvegardes, les identifiants ou les ressources approuvées.

Les scripts, tests, documents et reçus JSON ne sont pas copiés dans le site.
Si un futur rendu consomme un JSON d'animation, son contrat devra explicitement
adapter cet assemblage comme le générateur autonome.
`JOUER.html` reste l'unique export hors ligne et est copié à l'identique pour
le téléchargement. L'entrée web modulaire permet le chargement des images
par le navigateur, au lieu d'embarquer toutes les cartes dans sa page initiale.

## Configuration prête pour Vercel

`vercel.json` sélectionne le dossier statique `dist/`, sans installation npm
(aucune dépendance du jeu). Avant chaque build, tests Node et parité doivent
réussir. Le compilateur vérifie ensuite l'export et les images.
Le workflow GitHub `Assemblage web` vérifie aussi cet assemblage sur les PR
et sur main, avec des droits de lecture uniquement ; il ne déploie aucun site.
Les réponses sont revalidées pour éviter un mélange de versions après une
publication. `/JOUER.html` est servi comme téléchargement.

Pour vérifier localement :

```sh
npm test
npm run test:parity
node scripts/build_web.mjs
```

## Activation restant à effectuer

Le 23 octobre, les outils Vercel ne renvoient ni équipe ni projet lié au dépôt.
Il faut sélectionner/connecter l'espace d'hébergement, importer le dépôt
**privé** existant, puis vérifier les permissions et le public du site.
Ne pas rendre le dépôt public. Ne pas copier de jeton dans Git.

Le lien Git doit prendre `main` comme branche de production ; les autres
branches servent d'aperçus et ne remplacent pas la version stable.
Les PR restent fusionnées uniquement sur accord explicite du propriétaire.
Avant l'activation en production, vérifier les Deployment Checks ou une
protection de branche équivalente pour que les parcours Chromium du workflow
GitHub `validation` réussissent avant une publication. Le build Vercel local
aux sources couvre Node, parité et export, pas les parcours navigateur.

Flux cible : PR contrôlée et fusionnée sur main → build contrôlé → publication
par la liaison Git. Aucun agent n'a besoin de recopier le code du jeu.
Cette liaison et son blocage sur CI ne sont **pas encore activés ni testés**.
Ne pas annoncer une URL publiée ou une automatisation opérationnelle avant
une création, une publication et une vérification réelles.

## Sites et travail parallèle

Le workflow Sites consulté publie une version de son propre dépôt de sources ;
il ne fournit pas ici de liaison native confirmée à ce GitHub externe après
chaque fusion. Ne pas prétendre qu'une simple création de Site active ce flux.

La branche de cette proposition ne modifie aucun fichier de `src/`, aucun
style, aucune image, ni `package.json`, ni le workflow des tests existant.
Les seules notes partagées sont l'état et le journal ; les réconcilier si une
autre PR ajoute ses propres entrées. Relire le dernier main avant toute fusion.

## Sauvegardes et limites

Le domaine du site aura son stockage navigateur propre. L'export/import du
Guide permet de transférer l'aventure depuis le fichier hors ligne.
Pas de cloud save ni d'authentification de jeu ajoutés par cette proposition.
