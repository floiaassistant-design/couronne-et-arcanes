# Couronnes & Arcanes — V2.10

Jeu original de cartes tactiques solo, inspiré du genre de Kings and Legends / Rise of Mythos, avec son propre univers et ses propres cartes. Jouable hors ligne, sur ordinateur et navigateur mobile.

## Jouer

Ouvrez **JOUER.html** dans Chrome, Edge ou Firefox. Tout le code, le style et les 12 illustrations originales partagées sont embarqués. Aucun compte, serveur ou paiement réel.

Pour développer, lancez `npm run dev` puis ouvrez `http://localhost:8080`. `index.html` utilise des modules et doit être servi par HTTP ; `JOUER.html` peut être ouvert directement.

## V2.10 — Manipulation des comptes à rebours

Le jeu propose désormais **76 cartes**. Deux sorts originaux s’ajoutent aux 74 cartes précédentes, sans changer les délais historiques :

- **Élan des Heures** (rare, délai 1) : réduit de deux tours le compteur de la carte alliée la plus lente en main (égalité : première à gauche). Impossible si aucune autre carte n'attend.
- **Nœud du Temps** (rare, délai 2) : ajoute deux tours au compteur de la carte adverse la plus proche d'être prête, sans révéler son identité, dans une limite de six tours. Impossible si aucune carte adverse n'est éligible.

Chaque sort consomme une des deux actions de carte du tour. Effets symétriques joueur/IA et accessibles en Alchimie (32 or + 64 éclats) ou par les paquets habituels. L'IA n'inspecte pas les cartes de la main du joueur lorsqu'elle évalue ces sorts. Sauvegardes et scénarios de rencontres existants conservés. Détails : `docs/TEMPO_V2_10.md`.

## V2.9 — Mobilité et contrôle

La V2.9 avait introduit six cartes (68 à 74), toutes conservées en V2.10. Les 68 cartes précédentes, dont les huit compétences exclusives de classe V2.8, sont conservées.

| Carte | Mécanique | Acquisition |
|---|---|---|
| Sceau du Mutisme | Silence pendant deux résolutions | Alchimie : 32 or + 64 éclats, ou paquet |
| Inquisiteur des Brumes | Silence d'une résolution, recharge de trois tours | Alchimie : 32 or + 64 éclats, ou paquet |
| Faille de Transposition | Repositionnement latéral d'un allié | Alchimie : 32 or + 64 éclats, ou paquet |
| Marcheur des Portails | Repositionnement automatique avantageux, recharge de trois tours | Alchimie : 32 or + 64 éclats, ou paquet |
| Piège runique | 3 dégâts avant armure au prochain ennemi arrivant | Alchimie : 12 or + 26 éclats, ou paquet |
| Trappeur sylvestre | Piège : 1 dégât avant armure et immobilisation, recharge de trois tours | Alchimie : 12 or + 26 éclats, ou paquet |

**Silence :** les attaques normales continuent. Les capacités déclenchées sont suspendues ; armure, Distance, Vol, Garde, Concorde et les bonus déjà reçus sont conservés. Une résolution de répit suit le silence, qui ne peut être renouvelé immédiatement. Le poison déjà appliqué reste actif.

**Téléportation :** autre ligne, même colonne libre ; aucune arrivée devant la couronne adverse et une seule téléportation par unité/par tour. Le sort choisit l'allié éligible le plus avancé des autres lignes, avec un aperçu pour chacune des destinations. La phase normale de mouvement suit ; la téléportation seule ne déclenche pas Charge.

**Pièges :** publics pour les deux camps, sur une case identifiable, déclenchés lorsqu'un ennemi entre par mouvement ou téléportation. Une case survolée ne les déclenche pas. Deux pièges maximum par camp, disparition après usage ou trois résolutions. Leur propriétaire, leur effet et leur expiration restent sauvegardés.

L'IA évalue ces cartes avec le plateau public et sa propre main. Les rencontres historiques de campagne et de Tour restent inchangées ; des adversaires utilisant les six cartes sont contrôlés dans les simulations. Les nouvelles propriétés des combats sont facultatives pour les sauvegardes anciennes.

Règles complètes, méthode et résultats : [docs/BATTLE_CONTROL_V2_9.md](docs/BATTLE_CONTROL_V2_9.md).

## Contenu conservé

- Combat à trois lignes, attente d'invocation, deux cartes par tour, mouvements et attaques automatiques, Concorde, Vol, Garde, Charge et Riposte.
- Quatre classes, seize talents et huit compétences exclusives apprenables aux niveaux 3 et 6 contre 30/70 éclats.
- Douze missions de campagne, vingt étages de Tour et trois donjons de trois salles, avec choix de repos, coffre ou embuscade.
- Collection, decks de 12 à 24 cartes, quatre compositions automatiques fondées sur les exemplaires possédés, amélioration d'unités, six équipements, bâtiments et réputations.
- XP du héros et maîtrise des cartes, récompenses protégées contre les doubles réclamations, paquets achetables avec l'or du jeu et alchimie déterministe.
- Animations désactivables, préférence de mouvement réduit, sauvegardes de profil et de combat, export/import de profil dans le Guide.

## Validation

```bash
npm test
npm run test:parity
npm run build
npm run build:test
python3 tests/browser_class_skills_v28.py
python3 tests/browser_battle_control_v29.py
npm run control-balance
```

**Exécuté localement :** 165/165 tests Node ; 60/60 scénarios de parité V2.4 ; compilation autonome synchronisée ; Chromium V2.8/V2.9 sur bureau 1366×900 et téléphone simulé 390×844. Le vrai export est aussi testé hors ligne, avec stockage réel et rechargement, fin de combat, collection et atelier. Les tests Python utilisent Playwright 1.56.0 et Chromium (`python3 -m pip install playwright==1.56.0`, puis `python3 -m playwright install chromium`).

**Équilibrage :** 20 480 scénarios déterministes, rejoués à l'identique, quatre classes, quatre compositions, deux niveaux, cinq variantes et huit adversaires. Tous terminés en 32 tours maximum dans cet échantillon, sans état invalide. Les statistiques de bots ne prédisent pas les performances humaines.

GitHub Actions exécute tests, parité, build, vérification de synchronisation, parcours V2.8/V2.9 et simulations sur chaque PR. Consulter ses résultats réels avant toute fusion ; la présence du workflow ne constitue pas une preuve de réussite.

## Architecture et continuité

Les règles sont dans `src/engine/`, les données dans `src/data.js`, l'IA dans `src/ai.js`, les vues et sauvegardes dans `src/ui/`. La façade `src/engine.js` conserve les anciennes API. Le nouveau module pur `src/engine/battle-control.js` centralise les contrôles et leurs plans pour le moteur, l'IA et les aperçus. Le générateur embarque automatiquement les 19 modules et les illustrations.

GitHub est la référence. Avant de développer, vérifier le dernier commit et lire `AGENTS.md`, ce fichier, `CHANGELOG.md` et `docs/ETAT_PROJET.md`. Une branche et une PR par évolution, revue et contrôles verts, puis fusion autonome autorisée ; jamais de réécriture forcée de main ni de restauration depuis une vieille archive.

## Sauvegardes

Clés conservées : `couronnes_arcanes_v1`, `couronnes_arcanes_bataille_v1` et le réglage d'animations historique. Pas de reset ni de migration destructive. Le stockage dépend du navigateur et de l'origine du fichier ; déplacer le jeu vers un autre emplacement peut nécessiter un export/import du profil. Les sauvegardes locales ne constituent pas une protection contre la triche.

## Limites et suite

- Aucun test sur smartphone physique ni équilibrage humain exhaustif ; le plateau se parcourt horizontalement sur petit écran.
- IA heuristique déterministe, sans apprentissage ni recherche profonde. Les pièges sont visibles ; aucune information cachée n'est consultée.
- Les six cartes sont utilisables et obtenables ; leur introduction dans de nouvelles rencontres officielles reste une prochaine étape, les anciens decks n'étant pas réécrits.
- Douze portraits partagés et animations CSS, pas 74 illustrations uniques ni sprites image par image.
- Pas de PvP, coop, guildes, backend ou monétisation réelle.

Prochaine piste après V2.10 — proposition V3.0 : **un donjon tactique inédit**, avec trois boss utilisant progressivement silence, portails et pièges, et des récompenses acquises uniquement en jeu.

Historique : `CHANGELOG.md`. État de reprise : `docs/ETAT_PROJET.md`. Vision à long terme : `docs/BIBLE_DU_JEU.md`.
