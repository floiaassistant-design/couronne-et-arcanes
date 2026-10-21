# Collection par personnage — proposition du 21 octobre 2026

## Comportement

L’onglet Collection occupe toute la largeur, avec le fond des archives royales.
Les onglets sont Aube, Sylve, Ombre, Forge, Éther, Sorts et Tous. Dans chaque
ordre, une ligne par personnage affiche les six rangs côte à côte : Commune,
Rare, Épique, Légendaire, Divine rouge et Éveillée jaune céleste. Sur mobile,
le tableau défile horizontalement sans élargir la page.

La version qui existe dans `CARDS` conserve son identifiant, son texte, ses
statistiques effectives et ses exemplaires possédés. `cardUI` réutilise les
bonus du profil (améliorations, équipement, réputation, maîtrise). Les commandes
+/− utilisent les actions et les validations du deck existantes. Une carte non
possédée est indiquée comme telle ; aucune copie n’est accordée par cet écran.

Les cinq autres rangs sont des projections « À concevoir ». Leurs statistiques
et délai sont inconnus ; ils n’ont ni possession ni commande de deck. La fiche
explique que capacités et conditions d’obtention restent à définir. Ces cases
ne créent aucun objet de catalogue ou de sauvegarde. Le même portrait est
réutilisé par personnage, actuellement le SVG neutre ; une illustration éveillée
distincte pourra être décidée plus tard. Aucun texte d’évolution fictif n’est
introduit comme règle du jeu.

Le lien « Mon deck et mes compétences » rejoint les outils existants sous le
tableau : quatre compositions avec confirmation, compétences de classe et deck
actif. Une compétence apprise peut être ajoutée même si son ordre n’est pas
sélectionné, avec une seule commande d’ajout quel que soit l’onglet. Sorts et
compétences du catalogue restent visibles dans Sorts et Tous.

## Structure et graphismes

- Nouveau `src/ui/collection.js` : rendu et filtrage purs, fiches de consultation.
  Pas de DOM, de règle, de calcul de statistiques ou d’écriture du profil.
- `pages.js` garde les outils de deck et de classe ; `app.js` orchestre les
  onglets et les fiches. Filtres, lecture et classes CSS ne sont pas sauvegardés.
- `assets/collection.css` reste limité à la Collection. Le décor du combat et
  les autres cadres ne changent pas. 27 modules sont empaquetés automatiquement.
- Fond : PNG original 1774 × 887 et export JPEG de 304 275 octets conservés dans
  la [PR atelier nº 21](https://github.com/floiaassistant-design/couronne-et-arcanes-art/pull/21),
  commit `c4f5e6871e32db3b646f51ba906c3ea00b7c6eb9`. Prompt, provenance, droits,
  dimensions, poids, version, SHA-256 et reçu sont conservés dans l’atelier.
- L’accord d’intégration porte sur le fond et la présentation revus, identifiés
  par leur empreinte dans `docs/approvals/collection-archives-v01.json`. Le jeu
  épingle le commit art, la clé et le JPEG dans `assets/ui-artwork.json` et
  `src/visuals.js`. `scripts/lib/ui-artwork.mjs` contrôle le registre, le reçu
  exact, la taille et l’empreinte de l’image embarquée. Aucune requête réseau.
- Le registre de portraits `assets/artwork.json` reste vide. Le Milicien de la
  PR atelier nº 20 n’est pas validé ni importé par cette proposition.

Les sources moteur, IA, catalogue et stockage sont inchangées. Aucun nouveau
champ de profil/bataille ni migration. Les deux exports distribués sont produits
par le builder ; les HTML de diagnostic restent réservés aux tests.

## Contrôles locaux

- `npm test` : 280 tests réussis, dont lecture sans mutation, rang réel uniquement,
  statistiques partagées, compétences sans commande dupliquée et contrôle du fond.
- `npm run test:parity` : 60 états déterministes identiques à la référence.
- `npm run build`, `build:cards`, `build:test` et `--cards --test` réussis.
  JOUER : 1 220 162 octets ; ESSAI_CARTES : 1 220 186 octets, aucun portrait importé.
- Collection en vrai Chromium : bureau, portrait, paysage et version HTTP ;
  exemplaires réels, futures fiches sans mutation, modification manuelle du deck,
  sauvegarde/reprise, compositions/confirmation et blocage pendant combat.
  Contrôle du JPEG décodable, d’images manquantes, du mouvement réduit, de la
  largeur et du défilement. Export de production ouvert hors réseau.
- Parcours existants réussis : compétences de classe, nouvelle partie/raretés,
  contrôle V2.9 et production hors ligne, pilote/cadre, capacités, essai cartes,
  déploiement, aperçus, remise à zéro, arène, combat immersif, arène peinte et
  intégrité de sauvegarde. Les deux suites qui ciblaient l’ancienne grille ont
  été adaptées aux onglets/colonnes réels en conservant leurs contrôles métier.
- `control-balance` : 20 480 combats terminés ; `arena-balance` : 6 144 combats, zéro état invalide et neuf combats
  à la limite de durée. Ces
  simulations ne valent pas un équilibrage humain de toutes les situations.
- Diff relu, aucun changement de règle, aucune dépendance circulaire ajoutée ;
  nouveau module UI 73 lignes, lecteur de registre 28 lignes. Les vues historiques
  à lignes longues restent cohérentes, sans refonte générale.

Le script historique `browser_decks_v26.py`, hors workflow actuel, échoue sur
son ancienne attente de trois lignes pour la mission 01. Le même échec a été
reproduit sur main `f403f513` avec son HTML exact ; le jeu utilise deux lignes.
Le script n’est pas modifié. Le parcours des compositions est couvert par le
nouveau test Collection (prévisualiser, annuler, confirmer, reprendre et bloquer
en combat) et par les tests métier existants.

La CI du jeu doit être examinée sur le commit exact de la PR ; ces résultats
locaux ne la remplacent pas. La CI de l’atelier sur `c4f5e687` est réussie
([run 39569759595](https://github.com/floiaassistant-design/couronne-et-arcanes-art/actions/runs/39569759595)).
Aucun appareil physique ni équilibrage humain exhaustif n’a été testé.

## Suite du travail

Examiner puis, sur instruction spécifique, fusionner les PR de la Collection
et de son fond. Finaliser et valider la version exacte du Milicien, l’importer
avec son propre mapping/reçu, puis créer les autres cartes progressivement.
Textes, statistiques, capacités et conditions d’évolution restent à concevoir
et à valider à chaque étape. Le changement de rareté en jeu n’est pas implémenté
par cette page. Aucune fusion ni auto-merge n’est effectuée dans cette mission.
