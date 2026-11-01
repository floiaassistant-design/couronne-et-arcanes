# AGENTS.md — Couronnes & Arcanes

## Sources et reprise

- GitHub est la source officielle : `floiaassistant-design/couronne-et-arcanes`
  pour le jeu, `floiaassistant-design/couronne-et-arcanes-art` pour l'atelier.
- Avant chaque mission, vérifier le dernier main, les PR ouvertes et le travail
  parallèle. Vérifier toute copie locale avant usage ; aucune archive ou
  conversation ne remplace le dépôt actuel.
- Lire `README.md`, `docs/ETAT_PROJET.md`, `docs/CODEX_WORK_MISSION.md`, la Bible
  et l'architecture concernée. Les anciens bilans, comptes et états de PR sont
  historiques ; ils ne fixent aucune prochaine action ni autorisation.
- À chaque reprise, lire en priorité la branche `main`, les PR ouvertes, leurs
  SHA exacts et les résultats de GitHub Actions. `ETAT_PROJET.md` garde les
  jalons durables et les prochaines étapes, jamais le statut instantané d'une CI.
- Ne pas recopier comme vérités courantes les anciens bilans de conversation,
  PR ou documentation : vérifier les statuts de fusion et de publication à la source.
- Notion porte les décisions de conception ; le registre du jeu porte les
  versions réellement implémentées. Relire les validations avant transcription,
  sans inventer les statistiques, pouvoirs, évolutions ou permissions manquants.

## Branche, revue et autorisation de fusion

- Une évolution cohérente, une branche dédiée, une PR. Identifier modules,
  dépendances et tests avant de coder ; consulter les PR pour limiter les
  modifications communes et expliciter les dépendances entre branches.
- Préserver les contributions utiles lors des conflits ; ne jamais forcer main
  ni écraser le travail d'autrui. Relire main avant intégration.
- **Toute PR exige un accord explicite et spécifique du propriétaire avant
  fusion**, y compris documentation et correctifs. « Continue », un accord de
  développement ou l'accord sur une autre PR ne suffisent pas. Aucun auto-merge,
  bot ou workflow de fusion, ni publication d'une branche non fusionnée.
- Avant proposition : relire le diff complet, documents et fichiers générés
  inclus, vérifier le commit exact, les CI, conflits et interactions. Présenter
  résultat, lien de PR, contrôles observés et limites.
- Après accord seulement : revérifier cible, contenu approuvé, tête, CI et main.
  Tester tout nouvel assemblage de conflit ; actualiser main entre les fusions.
- Après fusion : confirmer commit et contenu de main, export et identité d'arbre
  si une CI antérieure est réutilisée. Enregistrer dans la PR un bilan daté des
  contrôles, de la publication et des blocages. Toute correction supplémentaire
  du dépôt passe par une nouvelle branche et une PR.

## Architecture et responsabilités

- Réutiliser l'existant avant de créer. Séparer moteur, IA, données, progression,
  interface, animations, stockage et CSS ; le moteur reste indépendant du DOM.
  Les vues lisent les règles ; les animations représentent les résultats.
- `src/engine.js` est la façade publique ; les règles restent dans `src/engine/`.
  `src/app.js` orchestre écrans et actions, sans reprendre le métier des modules.
  Catalogue et rencontres restent dans `data.js`, `talents.js`, `dungeons.js`.
- Garder des dépendances explicites, sans cycle, calcul métier recopié, code mort
  ni import inutilisé. 300–400 lignes est un signal de revue, pas une limite :
  découper par responsabilité, sans micro-modules artificiels ni refonte générale.
- Justifier toute dépendance ajoutée. Documenter le rôle des nouveaux modules et
  rechercher les doublons, cycles et fichiers devenus trop complexes en fin de tâche.
- Préserver hors du périmètre demandé équilibrage, IA, API, identifiants,
  progression, récompenses et sauvegardes historiques. Tout changement volontaire
  doit être expliqué et vérifié. Aucun reset ou migration implicite.
- `src/ai.js` reste une heuristique déterministe : aucune lecture de la main,
  de la pioche ou de la collection privées du joueur.
- Contrats détaillés : `docs/ARCHITECTURE_MODULAIRE_V2_6.md` et documents spécialisés.

## Sauvegardes et transactions

- Conserver `couronnes_arcanes_v1`, `couronnes_arcanes_bataille_v1` et la clé
  d'animations existante. États de lecture, sélection et animation transitoires
  hors sauvegardes ; seuls les états métier nécessaires à la reprise persistent.
- Une lecture illisible ou inaccessible du profil interdit toute initialisation
  ou écriture silencieuse d'une partie neuve. Garder le stockage intact, bloquer
  les opérations et proposer export brut si lisible puis import validé explicite.
  Un deck temporairement vide reste compatible avec le chargement historique.
- Les actions ordinaires de collection, ressources, classe, talents, équipement,
  deck, bâtiment et expédition travaillent sur copie : vérifier la règle métier,
  persister, puis adopter et annoncer le succès. Refus d'écriture = aucune mutation
  adoptée ni faux succès. Réutiliser `ui/profile-transactions.js` et `ui/storage.js`.
- Paquets, fusions et clôtures de combat conservent leurs transactions spécialisées.
  Sauver la copie du profil et son reçu avant nettoyage du combat ; interruption
  ou double confirmation ne doit ni perdre les gains ni les attribuer deux fois.
- Tout résultat non enregistré bloque les actions qui modifieraient ou remplaceraient
  l'aventure, import compris, quel que soit le mode de combat. Retenter sa clôture
  avant de libérer ces actions ; navigation, export et contrôles visuels restent disponibles.
- Valider imports, nombres, possessions, références et états facultatifs de combat.
  Protéger l'affichage des textes avec `ui/markup.js`. Ne pas recalculer les unités
  d'une bataille reprise à partir du profil actuel.
- Ancien combat actif incompatible : message explicite et relance sans défaite ni
  pénalité, profil conservé. Ancien résultat terminé : règlement via son reçu sans
  rejouer. Aucun second moteur historique ni conversion silencieuse.

## Registre, progression et laboratoire

- `cards/definitions.js` résout ID historique et rareté facultative ; le catalogue
  natif `CARDS` ne reçoit pas les variantes, pour préserver paquets et rencontres.
  Les natifs gardent leurs chaînes d'ID ; les évolutions utilisent `{id,rarity}`.
- Les totaux de rang remplacent la base ; maîtrise, niveau, équipement, bonus de
  profil et effets temporaires restent distincts. Réutiliser `engine/unit-stats.js`
  et `gearBonus` ; conserver la parité et les instantanés lors d'une refonte.
- `cards/evolutions.js` partage familles et provenance avec registre et recettes.
  Une définition ne suffit pas à rendre une version jouable : réutiliser les
  permissions centrales et les statuts moteur/combat, sans activation globale.
- `resolveRulesDefinition` reste un alias du registre unique ; `CARD_RULESET`
  identifie la compatibilité du combat, sans choisir des règles concurrentes.
  Les mêmes cartes appliquent les mêmes règles dans les deux camps et au laboratoire.
- Laboratoire : même moteur et niveaux choisis indépendamment de la rareté,
  aucun exemplaire offert, gain ou écriture dans la progression réelle. Ne pas
  réintroduire `labGuard`, un moteur parallèle ou un pilote propre à une carte.
- `engine/deck-builder.js` porte les propositions pures ; `ui/deck-builder.js`
  réutilise `modifyDeck`, `validateDeck` et `deckOverview`. Cartes possédées seulement,
  confirmation avant remplacement, modifications hors combat, filtres éphémères.
- Changement de classe : retirer du deck les compétences incompatibles, sans
  supprimer la collection ni créer d'exemplaires. Garder les decks de Tour de référence.
- `evolution-fusion.js` porte les recettes et accès, `engine/evolution-fusion.js`
  contrôle les stocks de rang exact hors deck ; confirmation et sauvegarde avant
  adoption. Préserver fabrication classique, exemplaires du deck et reçus existants.
- `card-packs.js` partage prix, groupes et références ; `engine/card-packs.js`
  valide tirages et gains avant débit. Garder l'API `buyPack`, les pools et l'ordre
  aléatoire hors changement volontaire. Afficher coût, chances et contenu avant achat.
- Épreuves : objectifs dans `trial-objectives.js` / `ascension-objectives.js`,
  faits rapportés par le moteur, exploits par uid vivant sans cumul entre copies.
  Préserver objectifs anciens, identifiants de `completedTrials`, imports et reçus.
  Une ascension ouvre l'accès prévu sans cadeau implicite. Combat actif ou résultat
  non récupéré bloque tout nouveau départ et les achats incompatibles.
- Donjons : phases ready/choice/bonus, reprise historique, récompense spéciale
  unique ; moteur propriétaire du butin et du journal, sans règle copiée dans les vues.

## Combat et effets

- `engine/board.js` lit la géométrie du combat sauvegardé. Nouveaux combats :
  dix cases, couronnes 0/11 ; deux lignes en difficulté 1–2, trois au-delà et
  quatre pour les boss. Les fixtures 3×5 gardent tableau et couronnes 0/6.
- Pose en 1/2/3, miroir adverse 10/9/8 ; colonne optionnelle de `playPlayerCard`
  par défaut 1. Valider avant consommation et réutiliser l'entrée des pièges.
  Préserver délai, quota de deux cartes, portée, déplacement et géométrie partagée
  par moteur, IA et robot. Ne pas changer les références pour masquer un échec.
- `engine/unit-rules.js` partage permissions, portée, mouvement, Charge, Vol et
  Perforation. `unit-support.js` porte arrivées et soutiens avec leurs marqueurs
  anti-répétition. Les pouvoirs viennent du registre, sans chiffres dupliqués.
- `battle-defense.js` résout `hit` et Riposte pour tous les appels. Garde normale
  positionnelle : candidats via `guard-candidates.js`, même ligne puis proximité
  de sa couronne puis ligne/uid ; un gardien choisi, sans quota inventé par tour.
  Riposte à l'ATQ effective, bonus compris, sans Charge.
- Barrières : plafonds propres à chaque effet, sans réduire un surplus préexistant.
  Les objets des instantanés d'événements ne doivent pas partager d'état mutable.
- `unit-effects.js` partage malus d'attaque, poison paramétré et régénération.
  L'ATQ permanente ne change pas ; malus consommé à la prochaine intention d'attaque
  ou Riposte valide, bonus inclus, minimum zéro. Pas de consommation par sort ni
  modification rétroactive des intentions simultanées déjà préparées.
- Régénération après soin effectif, au prochain tour de son camp avant les nouveaux
  soins ; non cumulable, rafraîchie, indépendante de la survie du soigneur.
  Silence bloque les nouvelles applications, pas les effets déjà appliqués.
- `battle-control.js` partage silence, téléportation et pièges avec IA/vues.
  Silence : capacités déclenchées, deux tours au plus puis répit ; traits passifs
  conservés. Téléportation via `teleportPlan` : même colonne libre, une fois par
  unité/tour, sans arrivée devant la couronne ennemie. Deux pièges par camp,
  trois tours au plus ; retrait avant effet, propriétaire/expiration conservés.
- `engine/tempo.js` ne change que les attentes de main : Élan réduit de deux
  la plus lente, égalité premier indice ; Nœud ajoute deux à la plus proche prête,
  plafond six, sans révéler son identité. Refuser sans cible éligible.
- `spell-targeting.js` centralise les cibles obligatoires ; `spell-casting.js`
  résout avec les primitives du moteur. Aperçu sur copie, public seulement.
  Confirmer revérifie, annuler ne consomme rien ; sorts immédiats après confirmation,
  unités après validation du tour. État de ciblage transitoire dans le contrôleur.
- Animations : événements publics seulement, verrou/nettoyage et repli immédiat
  conservés, sauvegarde du résultat avant effets, mouvement réduit respecté.

## Présentation, CSS et graphismes

- Une seule présentation : cartes sur le plateau. `card-presentation.js` et
  `card-inspection.js` fournissent modèle et lecteur communs à toutes les vues ;
  `collectionHoverContent` reste un adaptateur, sans seconde fiche.
- Collection : six raretés côte à côte par personnage, description et fiche
  concises, chiffres réellement définis, « À concevoir » pour les versions absentes.
  Ni statistiques, possession ni obtention inventées, ni bouton de fiche ajouté.
- Survol/focus pour lire ; souris : clic de main pour sélectionner. Toucher :
  premier contact pour lire, second sur la même carte pour sélectionner, puis
  une case libre pour poser. Consulter une unité occupée ne déclenche aucune pose.
- Main/plateau lisent leurs instantanés et états réels ; Collection lit le profil.
  `ui/guide-page.js` reste un rendu pur, sans DOM, stockage ni règle de moteur.
- Concorde via `formationBonus`, rendu partagé `ui/concorde.js` : lumière fixe
  sur l'emblème peint et texte de bonus, inactif explicite. `campSeal` dans
  `card-arena.js` : rond bleu allié, losange rouge adverse discrets à gauche.
  Garder lisibilité, clics, nombres et fiches accessibles sur petit écran.
- `index.html` est la liste CSS ordonnée du web et du builder. Respecter
  `styles/README.md`, composants et surcharges peintes de `assets/` ; préserver
  fonds embarqués et reçus lors d'une réorganisation.
- Avant création/import graphique, consulter atelier et validation de la version
  exacte : source, prompt, provenance, droits, dimensions, poids, reçu, SHA-256.
  Commencer une nouvelle direction par un pilote approuvé ; les anciens lots et
  validations ne valent pas autorisation d'une nouvelle image.
- Import distinct de la fusion atelier : PR du jeu, mapping explicite dans
  `visuals.js`, registre `assets/artwork.json`, clés/cadres individuels et reçus.
  Aucun actif implicite par famille ni synchronisation automatique.
  Le builder contrôle les WebP et les fonds via leurs registres ; textes et valeurs
  restent dynamiques. Toute animation nouvelle exige son contrat et son repli fixe.
- Lire `docs/INTEGRATION_GRAPHISMES.md` et la décision de remise à zéro ;
  ne restaurer aucun ancien portrait, sprite, atlas ou lecteur d'effets retiré.

## Tests et CI

- Consulter d'abord la CI existante. Les résultats ne valent que pour le SHA exact
  ou un arbre Git démontré identique. Distinguer contrôles locaux, CI, examen
  visuel et limites ; aucun smartphone physique ni équilibrage humain déduit d'un bot.
- Selon le périmètre : `npm test`, `npm run test:parity` si règles inchangées,
  `npm run build`, `npm run build:test`. Rendu : parcours bureau/portrait/paysage,
  images, interactions, reprise, import/export, stockage refusé, mouvement réduit
  et hors réseau. Règles : cas métier et simulations pertinentes.
- Réutiliser `scripts/lib/battle_runner.mjs` et les scénarios partagés, mêmes
  graines et rencontres. Ne pas affaiblir les assertions ou modifier une référence
  pour faire disparaître un échec. Ne pas annoncer PvP/coop comme réalisés.
- Quatre groupes via `scripts/ci_browser_groups.json` puis verdict `validation`.
  Chaque commande une fois ; les parties d'épreuves remplacent leur suite entière
  en CI. Garder inventaire, assertions, propagation des échecs et `fail-fast: false`.
- PR uniquement Markdown racine/`docs/` : classification restrictive et tests
  ciblés du pipeline, deux contrôles conservés. Liste vide, chemin inconnu,
  code/config/test/ressource ou renommage depuis le code impose le contrôle complet.
  Tout push main garde tests complets et assemblage/paquet de publication.
- Playwright épinglé, cache facultatif publié par un seul groupe, diagnostic local,
  captures conditionnelles, paquet Sites sur main. Aucun appel de modèle/agent
  dans les workflows. Protection effective de main à vérifier séparément du YAML.
- Pousser puis terminer tout travail utile indépendant de la CI ; ne pas s'arrêter
  dès son démarrage. Quand seul son résultat manque, terminer la session avec lien,
  SHA et reprise, sans polling actif, attente artificielle ni relance redondante.
  Traiter les échecs observés sans les requalifier. Reprendre la revue avant fusion.
- [Carte des tests](docs/CARTE_TESTS.md) · [Contrat CI](docs/CI_PARALLELE.md).

## Distribution, documentation et publication

- Web et `JOUER.html` utilisent les mêmes sources, moteur et ressources.
  `JOUER.html` est l'unique export jouable hors ligne, généré, jamais retouché
  à la main. `tests/JOUER.test.html` reste un diagnostic non distribué.
  Tout ajout de module/CSS/ressource doit entrer dans les deux distributions.
- Toute PR remplit les champs normalisés de reprise : `Documentation`,
  `Justification` si aucun document n'est nécessaire, `Reprise` et `Limites`.
  La CI exige les champs et une modification Markdown réelle si la documentation
  est déclarée mise à jour ; elle ne peut pas juger seule la justesse du contenu.
  Une justification doit être précise, pas un texte de modèle non rempli.
- Mettre à jour les documents concernés dans la même PR : utilisation dans
  README, règles permanentes dans AGENTS, responsabilités dans architecture,
  état/reprise dans ETAT_PROJET, changements dans CHANGELOG et contrats spécialisés.
  Garder l'état court, séparer proposé/intégré/publié, identifier l'historique.
  Aucun numéro de PR, compte de modules ou relevé périssable dans ces règles.
- Sites est l'hébergement choisi ; réutiliser `.openai/hosting.json` et les
  instructions persistantes. Consulter l'automatisation existante avant toute
  publication ou tâche concurrente ; GitHub reste la source, Sites la distribution.
- Publier uniquement main intégré avec CI et paquet correspondants vérifiés,
  audience conservée, secrets hors code. Confirmer résultat terminal et URL :
  une fusion ou une CI verte ne prouve pas la publication.
- Fin de session : pousser et vérifier sur GitHub le travail utile. Donner branche,
  PR, dernier commit, contrôles réussis/en cours, limites, blocage et prochaine
  étape ; liens vers jeu/export en précisant la version. Rien d'indispensable
  uniquement dans une conversation ou un dossier temporaire.
