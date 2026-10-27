# Construction manuelle du deck — 27 octobre 2026

## Demande et comportement

Le propriétaire veut composer simplement son deck et garder les compositions
proposées comme raccourcis facultatifs. La branche `feat/deck-manuel-simple`
part du main `003c696870edd8238f5f74a1e73afc18d8198024`, après fusion autorisée
de la PR 53. Cette nouvelle évolution demande sa propre revue avant fusion.

« Mon deck » est accessible depuis la navigation et le haut de la Collection.
L'écran montre les cartes possédées compatibles avec la classe, avec recherche
insensible aux accents et filtres par Ordre/type. Chaque carte et chaque ligne
du deck indiquent les quantités possédées et utilisées, avec commandes +/−.
La fiche universelle reste disponible sur la carte ou le nom.

Le compteur, les unités/sorts et la validation sont visibles. Les changements
s'enregistrent automatiquement ; un deck incomplet reste modifiable et ne
peut pas lancer de combat. Une tentative depuis campagne/Tour/donjon ramène
au constructeur. « Repartir de zéro » demande confirmation et retire seulement
les cartes du deck, sans modifier la Collection. Les quatre propositions
existantes restent sous une section repliée, avec prévisualisation et confirmation.

Le clavier conserve son point d'action après +/−. La recherche ne remplace que
les résultats, pour conserver le focus, le curseur et la frappe continue.
En portrait, le deck actif précède les cartes disponibles ; les commandes
restent accessibles au toucher. Pendant un combat actif, consultation seule :
les commandes manuelles, celles de la Collection et les raccourcis sont bloqués.

## Responsabilités et compatibilité

- `src/ui/deck-builder.js` : catalogue filtré et rendu manuel, sans stockage.
  Disponibilité et validation utilisent `modifyDeck`, `validateDeck` et
  `deckOverview`, sans seconde règle de construction.
- `src/ui/pages.js` : adaptateur vers ce rendu, avec les propositions existantes.
- `src/app.js` : navigation, filtres éphémères, commandes, focus et sauvegarde.
- `styles/pages/deck-builder.css` : styles propres à l'écran, reliés une fois
  dans `index.html` et embarqués par le builder commun.

Un seul deck actif, dans le format historique de chaînes d'ID. Aucun changement
des limites de 12–24, possessions, profils, clés de stockage, achats, maîtrise,
règles de combat ou propositions déterministes. Les six cartes de Collection
restent présentes. Les évolutions Aube demeurent réservées au laboratoire ;
les propositions d'obtention discutées ne sont pas implémentées ici.

## Vérifications et livraison

`manual_deck.test.mjs` vérifie filtrage, possession/classe, rang natif, quantités,
limites, validation et absence de mutation. `browser_manual_deck.py` construit
un deck par les vrais boutons, vérifie recherche, filtres, confirmation, fiche,
stockage réel, rechargement, composition du combat et verrou pendant celui-ci.
Il est également appelé par `browser_collection.py`, déjà exécuté en CI.

Les résultats locaux, export exact, commit et contrôles GitHub finaux sont
rapportés dans la PR de cette branche. Les tests navigateur couvrent Chromium,
bureau et mobile simulé, HTTP et export hors réseau ; aucun téléphone physique,
Safari/Firefox ou équilibrage humain n'est revendiqué.

Résultats locaux de la livraison : **422 tests Node réussis** (quatre nouveaux),
**60 scénarios de parité identiques**, builds normal/test réussis : **52 modules,
76 illustrations**. Les suites existantes `card_study`, `deployment`,
`card_preview`, `art_reset`, `collection`, `milicien`, `aube`, `sylve`, `ombre`,
`forge`, `maintenance`, `class_skills_v28` et `save_integrity_v211` ont réussi.
Le nouveau parcours manuel a également réussi sur bureau, portrait, paysage et
web HTTP. Sur l'export final exact, le parcours manuel des quatre contextes et
la maintenance web des trois formats ont été rejoués avec succès. Captures du
constructeur bureau/mobile examinées ; aucune illustration modifiée.

L'export officiel `JOUER.html` fait **34 497 768 octets**, blob
`bd3a1c71b7c6170e8eeb4d4c08596ca004743578`. Le
[générateur ponctuel réussi](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40467501555)
l'a enregistré dans `d60349104a4bfdab8bea52dc5ba9f9dadab61040`, arbre
`9cf06dca9b07ff87b692ee57a456243f3bda8714` identique au local testé.
Le workflow temporaire est retiré avant la PR ; aucun workflow permanent modifié.
La tête de livraison et ses contrôles exacts figurent dans la description de PR.

Revue structurelle : **52 modules, 185 dépendances, aucun cycle** ; `battle.js`
reste à 386 lignes, `app.js` à 357 et `pages.js` à 260. Moteur, catalogue natif,
stockage et actifs approuvés inchangés. Les filtres, le rendu et les commandes
gardent leurs responsabilités ; aucune seconde validation de deck.
