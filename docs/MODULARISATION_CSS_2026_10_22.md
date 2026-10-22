# CSS par responsabilité — 22 octobre 2026

Base GitHub vérifiée : `9941596d16e39d7f48fc0b082ee41b77e5d573b7`, après
fusion autorisée des PR nº 31 et nº 32. Nouvelle proposition sur
`refactor/css-modules-20261022`, sans autorisation de fusion.

## Changement

Le fichier global de 3 739 lignes mélangeait plusieurs écrans et couches de
combat. `styles.css` devient un socle de 260 lignes (variables, HTML, navigation,
ressources et typographie). Dix-sept feuilles regroupent les composants, pages,
cartes et éléments du combat ; les points de rupture restent chez leur
propriétaire. Les fichiers de styles réorganisés font au plus 337 lignes.
Voir [la carte des responsabilités](../styles/README.md).

Les règles d'unités et formations sont réunies, la main est distincte de son
conteneur plein écran, les fiches de lecture restent distinctes des cartes,
et les états des donjons restent près de leur présentation. Aucune règle n'est
supprimée sur la seule base de son âge ou de la présence d'une surcharge.

Les sept feuilles spécialisées de `assets/` conservent leurs octets et leur
ordre après le socle : fond peint, projection, vue cartes, aperçus, fond de
collection, collection et cartes générées. Les deux fonds volumineux contiennent
les images approuvées embarquées ; ils ne sont pas de gros modules applicatifs.
Les classes historiques encore partagées par les cadres sont conservées.

## Distribution

`index.html` est l'unique liste ordonnée des 25 feuilles. Aucun `@import`,
nouvelle dépendance npm ou chargement à la demande. Le navigateur charge les
feuilles locales et le builder lit les mêmes liens via
`scripts/lib/stylesheets.mjs`, puis les remplace par leurs contenus, dans le
même ordre. Les contrôles des registres, reçus et images restent actifs.

Le builder refuse une feuille manquante, dupliquée, externe, hors du projet,
un import CSS caché ou une fin de balise style. Les tests détectent aussi un
module `styles/` oublié dans l'entrée web. Les assertions historiques de rareté,
géométrie et plein écran lisent maintenant les feuilles qui possèdent ces règles.

`JOUER.html` et `ESSAI_CARTES.html` sont régénérés exclusivement par le builder.
Les deux exports réservés aux tests restent exclus de la distribution. Les
29 modules du jeu, leur JavaScript embarqué et les images sont inchangés.

## Vérification

Contrôles locaux de base : 300 tests Node, 60 scénarios de parité, quatre builds
et parcours de l'entrée web bureau/portrait/paysage. Chaque feuille web est
vérifiée chargée et analysée ; navigation, pose, reprise réelle après recharge,
images, animations désactivées et mouvement réduit sont exercés.

La comparaison statique retrouve exactement les 2 331 déclarations par sélecteur
et contexte, keyframes inclus, du global de main. Les quatre builds contiennent
les 25 feuilles exactes dans leur ordre web ; les JavaScript et illustrations
embarqués des deux exports de production sont identiques à main.

Comparaison de rendu à effectuer sur l'arbre final :

```sh
python3 tests/browser_maintenance.py --reference /chemin/main-verifie
```

Elle couvre 123 états sur trois formats : écrans principaux, sept filtres de
collection, trois phases de donjon, combats 2/3/4 lignes et historiques 3×5,
deux vues, sélection et phase adverse. DOM, styles calculés, rectangles et pixels
sont comparés. Les grandes variables d'image définies exclusivement sur `:root`
ou un conteneur identifié par attribut sont lues une fois par propriétaire,
après contrôle des déclarations et surcharges ; toute
surcharge ou propriété enregistrée conserve la lecture par élément.
Les pseudo-éléments sans contenu ne génèrent aucune boîte ; leur contenu reste
comparé, les pseudo-éléments réellement générés gardent leur comparaison complète.
L'option `--viewport desktop|portrait|landscape` permet de répartir la même
comparaison sur trois processus, sans retirer d'état.

Les résultats finaux de cette comparaison, des 19 autres suites navigateur
et de la CI sur le commit exact figurent dans la description de la PR. Les
premiers essais simultanés ont rencontré des délais d'attente de démarrage ;
ils ne sont pas comptés comme réussis et doivent être remplacés par des parcours
terminés, pas par un allongement des délais ou une suppression d'assertions.

## Limites

Le découpage change l'organisation, pas la quantité de règles nécessaires.
La cascade reste globale : déplacer les liens ou regrouper arbitrairement
les sélecteurs peut changer leur priorité. Les deux vues et les anciennes
sauvegardes justifient encore des variantes de présentation.

Le web effectue 17 requêtes CSS locales supplémentaires au premier chargement ;
les exports autonomes restent sans requête CSS ni réseau. Aucun gain de vitesse
n'est revendiqué. Les parcours utilisent Chromium simulant bureau/mobile ;
ils ne constituent ni un test sur téléphone physique, ni une validation humaine
exhaustive, ni une validation des autres moteurs de navigateur.
