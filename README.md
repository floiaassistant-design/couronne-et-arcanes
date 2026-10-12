# Couronnes & Arcanes — V2.11

Jeu original de cartes tactiques solo, inspiré du genre de Kings and Legends / Rise of Mythos, avec son propre univers et ses propres cartes. Jouable hors ligne, sur ordinateur et navigateur mobile.

## Jouer

Ouvrez **JOUER.html** dans Chrome, Edge ou Firefox. Tout le code, le style et les 12 illustrations originales partagées sont embarqués. Aucun compte, serveur ou paiement réel.

Pour développer, lancez `npm run dev` puis ouvrez `http://localhost:8080`. `index.html` utilise des modules et doit être servi par HTTP ; `JOUER.html` peut être ouvert directement.

## V2.11 — Arène fantasy lo-fi et dix cases par ligne

Le plateau contient **10 vraies cases jouables par ligne**, entre deux couronnes : **2 lignes** pour les duels (difficulté 1–2), **3 lignes** pour les rencontres avancées (difficulté ≥3), **4 lignes** pour les boss. Ce choix transpose la géométrie des modes historiques dans notre jeu solo ; il n’ajoute pas de coopération.

Décor nocturne original en pixels, ruines, lune, tours et huit silhouettes de créatures partagées par rôle, colorées par ordre. Les portraits des cartes restent les illustrations existantes. Sur téléphone, le plateau défile horizontalement ; sa position est conservée après une action. Déploiement également accessible au clavier.

Mouvement, portée, IA, compétences et contrôles utilisent la géométrie réelle. Les nouvelles batailles sont plus longues ; aucune statistique de carte ni récompense n’a été retouchée. Les anciens combats sauvegardés **restent en 3×5 jusqu’à leur fin**, avec leurs positions et effets intacts ; les prochains combats utilisent la nouvelle grille. Les clés de sauvegarde restent identiques.

**Branche de proposition :** `feat/arena-fantasy-lofi`. **Aucune fusion automatique pour cette évolution**, conformément à la demande. Rapport et mesures : [docs/ARENE_V2_11.md](docs/ARENE_V2_11.md).

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

- Combat à deux, trois ou quatre lignes de dix cases, attente d'invocation, deux cartes par tour, mouvements et attaques automatiques, Concorde, Vol, Garde, Charge et Riposte.
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
python3 tests/browser_arena_v211.py
python3 tests/browser_class_skills_v28.py
python3 tests/browser_battle_control_v29.py
npm run control-balance
npm run arena-balance
```

**V2.11 exécuté localement :** 210 tests Node réussis, zéro échec ; 60 scénarios de parité historique sur le plateau 3×5 inchangés ; compilation autonome synchronisée. Chromium : nouveaux plateaux 2/3/4×10, clavier, effets à la couronne, défilement et reprise en bureau 1366×900, portrait 390×844 et paysage 844×390. Suites V2.8 et V2.9 également réussies. L’export autonome est testé hors ligne avec le vrai stockage et le rechargement.

**Simulations :** 6 144 combats comparatifs ancien/nouveau plateau, rejoués à l’identique (12 288 exécutions), quatre classes, quatre decks, trois collections et huit rencontres. Zéro état invalide ni combat inachevé ; durée moyenne de 12,7 à 19,4 tours sur ce banc. 20 480 scénarios de contrôle V2.9 passent aussi avec les nouveaux plateaux. Il s’agit de bots, pas de performances de joueurs.

GitHub Actions exécute tests, parité, build et identité de `JOUER.html`, parcours V2.8/V2.9/V2.11 et simulations. Vérifier le résultat distant de la PR ; le fichier du workflow ne constitue pas une preuve d’exécution.

## Architecture et continuité

Les règles sont dans `src/engine/`, les données dans `src/data.js`, l'IA dans `src/ai.js`, les vues et sauvegardes dans `src/ui/`. La façade `src/engine.js` conserve les anciennes API. `src/engine/board.js` centralise les dimensions à partir des tableaux sauvegardés ; `src/ui/arena-art.js` dessine les sprites SVG en pixels. Le module pur `src/engine/battle-control.js` centralise les contrôles et leurs plans pour le moteur, l'IA et les aperçus. Le générateur embarque automatiquement les 22 modules et les illustrations.

GitHub est la référence. Avant de développer, vérifier le dernier commit et lire `AGENTS.md`, ce fichier, `CHANGELOG.md` et `docs/ETAT_PROJET.md`. Une branche et une PR par évolution, revue et contrôles verts, puis **attente de l'accord explicite de l'utilisateur pour chaque fusion sur `main`**. Aucune fusion autonome ni GitHub Auto-merge, y compris pour les correctifs ; jamais de réécriture forcée de `main` ni de restauration depuis une vieille archive.

## Sauvegardes

Clés conservées : `couronnes_arcanes_v1`, `couronnes_arcanes_bataille_v1` et le réglage d'animations historique. Pas de reset ni de migration destructive. Le stockage dépend du navigateur et de l'origine du fichier ; déplacer le jeu vers un autre emplacement peut nécessiter un export/import du profil. Les sauvegardes locales ne constituent pas une protection contre la triche.

## Limites et suite

- Aucun test sur smartphone physique ni équilibrage humain exhaustif ; le plateau se parcourt horizontalement sur petit écran.
- IA heuristique déterministe, sans apprentissage ni recherche profonde. Les pièges sont visibles ; aucune information cachée n'est consultée.
- Les six cartes sont utilisables et obtenables ; leur introduction dans de nouvelles rencontres officielles reste une prochaine étape, les anciens decks n'étant pas réécrits.
- Douze portraits partagés pour les cartes, huit silhouettes en pixels pour l’arène et animations CSS ; pas de sprites dessinés image par image pour les 76 cartes.
- Pas de PvP, coop, guildes, backend ou monétisation réelle.

Prochaine piste après V2.10 — proposition V3.0 : **un donjon tactique inédit**, avec trois boss utilisant progressivement silence, portails et pièges, et des récompenses acquises uniquement en jeu.

Historique : `CHANGELOG.md`. État de reprise : `docs/ETAT_PROJET.md`. Vision à long terme : `docs/BIBLE_DU_JEU.md`.
