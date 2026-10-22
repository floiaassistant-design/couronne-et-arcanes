# Organisation du CSS

`index.html` est l'unique liste ordonnée des feuilles. Le navigateur les charge
directement, sans `@import`, dépendance npm ni chargement conditionnel. Le builder
lit cette même liste et remplace chaque lien par son contenu pour `JOUER.html`
et son paquet diagnostic `tests/JOUER.test.html`.

| Emplacement | Responsabilité |
| --- | --- |
| `../styles.css` | Variables, éléments HTML, navigation, ressources, typographie |
| `components.css` | Boutons, panneaux, grilles, dialogues, notifications, guide |
| `pages/home-campaign.css` | Accueil, missions et présentation des adversaires |
| `pages/collection-deck.css` | Structure du catalogue, deck et compositions |
| `pages/workshop.css` | Forge, classes, alchimie, maîtrise et talents |
| `pages/dungeons.css` | Expéditions, étapes et choix entre combats |
| `cards/base.css` | Cadre, portrait neutre, valeurs et actions communes |
| `cards/hand.css` | Cartes compactes, sélection, attente et disponibilité |
| `cards/rarity.css` | Contours et étiquettes de rareté |
| `cards/illustrated.css` | Cadre illustré et variante compacte |
| `cards/inspection.css` | Lecture des capacités et espace réservé |
| `battle/base.css` | HUD, cases, journal, formations et contrôle |
| `battle/units.css` | Unités sur les cases, notamment les parties historiques |
| `battle/arena.css` | Habillage commun du plateau |
| `battle/fullscreen.css` | Conteneur du combat, titre, HUD et plateau |
| `battle/hand-dock.css` | Main ancrée en bas et commandes |
| `battle/board.css` | Identité des camps, pistes et géométrie du plateau |
| `battle/effects.css` | Réglage des animations et signaux transitoires |
| `../assets/*.css` | Vue cartes, aperçu commun, collection et cartes générées |
| `../assets/backgrounds/*.css` | Fonds approuvés embarqués et projection peinte |

Les points de rupture, états et préférences de mouvement restent dans le fichier
du composant concerné. Les adaptations d'un composant dans un conteneur de combat
appartiennent à ce conteneur, par exemple `hand-dock.css`. Les variantes peintes
et les cartes générées viennent après le socle classique, comme avant le découpage.
Ne pas déplacer un lien ou ajouter une couche CSS sans vérifier la cascade.

Pour ajouter une feuille : choisir son propriétaire, la relier une seule fois
dans `index.html`, puis exécuter tests, parité et les builds production/diagnostic. Le garde des
styles vérifie les modules oubliés, les doublons et les dépendances non locales.
Les fonds à image embarquée conservent leurs fichiers et reçus d'approbation.

Pour un déplacement de règles sans changement visuel, construire aussi le HTML
de test du checkout de référence, puis lancer :

```sh
python3 tests/browser_maintenance.py --reference /chemin/checkout-reference
python3 tests/browser_maintenance.py
```

Le premier compare les états du parcours (DOM, styles calculés, rectangles et pixels), le
second exerce l'entrée web, les feuilles effectivement chargées, la pose et la
reprise sur bureau, portrait et paysage. Les autres parcours du workflow restent
nécessaires pour les images, la sélection, les anciens combats et le hors ligne.
