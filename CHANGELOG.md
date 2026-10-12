## V2.10 — Tempo des cartes (2026-10-12)

- 2 sorts originaux, catalogue de 74 à 76 cartes ; accélération de 2 tours d’une carte alliée, ralentissement de 2 tours d’une carte ennemie (plafond 6).
- Cibles déterministes, deux cartes jouables par tour inchangées ; IA sans lecture du contenu de la main adverse pour la décision ; journal sans divulgation des cartes ennemies.
- Nouveau module pur `src/engine/tempo.js`. Alchimie et paquets, interface de combat, Guide et tests de non-régression adaptés.
- Délais historiques, sauvegardes et scénarios de campagne/Tour inchangés. Validation CI à contrôler sur la PR.

## V2.9 — Mobilité et contrôle du champ de bataille (2026-10-11)

- Six cartes originales ajoutées, catalogue de 68 à 74 ; huit compétences V2.8 conservées, fabrication avec or/éclats et acquisition par paquets.
- Silence temporaire des capacités déclenchées, attaques et traits passifs conservés, expiration et résolution de répit empêchant le renouvellement permanent.
- Téléportation latérale déterministe, aperçu par ligne, destinations libres, protection des couronnes et limite par unité/tour. Capacités des nouvelles créatures limitées à une activation tous les trois tours.
- Pièges publics sur case centrale, dégâts/immobilisation à l'arrivée, consommation avant effet, expiration, plafond de deux par camp et persistance de leur propriétaire/état.
- IA adaptée aux nouvelles cartes et aux menaces visibles, sans lecture des cartes privées ; decks historiques de campagne/Tour conservés.
- Nouveau module pur `battle-control.js`, sans duplication du calcul des dégâts ; export autonome de 19 modules, mêmes clés de sauvegarde, propriétés facultatives et aucun reset.
- Indicateurs de silence/durée, pièges et téléportation animée ; descriptions et Guide actualisés. Correction du débordement de la main et des actions sur petit écran.
- 165/165 tests JavaScript locaux, 60/60 scénarios historiques identiques, build synchronisé ; Chromium bureau/mobile V2.8/V2.9, stockage réel et rechargement de l'export hors ligne.
- 20 480 scénarios d'équilibrage comparatifs rejoués à l'identique, aucun état invalide ni combat inachevé ; limites et résultats dans `docs/BATTLE_CONTROL_V2_9.md`.
- Workflow GitHub Actions étendu aux parcours V2.9 et aux simulations. Les résultats distants doivent être vérifiés sur la PR avant fusion.

## V2.8 — Compétences exclusives des quatre classes (2026-10-11)

- Huit nouvelles compétences originales : deux par classe (Gardien, Arcaniste, Rôdeur, Clerc), 68 cartes au total.
- Apprentissage aux niveaux 3 et 6 via 30/70 éclats gagnés en jeu, une copie garantie, non échangeable, sans tirage aléatoire.
- Sorts de classe intégrés à la main et au deck avec ciblage sur les lignes, attente et limite habituelle de deux cartes par tour.
- Barrières temporaires par absorption, ralliement de deux tours, gel, chaîne d'éclairs, flèche perforante, pioche, soins et bénédiction.
- Restriction de deck selon la classe actuelle ; changement de classe refusé tant qu'une compétence incompatible est équipée ; aucun effacement de la collection.
- Anciennes clés de sauvegarde et profils V2.7.1 conservés ; aucun nouveau champ obligatoire du profil.
- Tests ciblés dans `tests/class_skills_v28.test.mjs` : 130/130 tests Node, parité 60/60, build autonome et tests Chromium desktop/mobile simulé réussis (GitHub Actions #38173354595).

## V2.7.1 — Récupération et prévention des conflits (2026-10-11)

- Restauration de huit fichiers écrasés par une ancienne V1.2 depuis le commit local V2.7 `145a2e8` avec sauvegarde préalable ; mécaniques du jeu préservées.
- Règles de coordination des agents renforcées ; restauration de la documentation et des numéros de version.
- Aucun changement des règles de combat ou des données de sauvegarde.

## V2.7 — Audit des compositions et préparation GitHub (2026-10-11)

- Comparaison contrôlée de 24 configurations de decks : 12 288 combats déterministes par version, résultat avant/après conservé en JSON.
- Deck Arcanes moins saturé de sorts (5 → 3) ; amélioration dans 6/6 configurations mesurées, sans modifier les règles ou la collection du joueur.
- Expérimentation sur Assaut rapide non concluante, abandonnée sans impact sur le jeu livré.
- Simulateur de combat de référence partagé pour limiter la duplication entre les scripts de benchmark.
- Ajout d'un workflow GitHub Actions (`npm test`, parité, compilation), sans revendication de publication distante.
- Tests de reproductibilité supplémentaires et documentation d'équilibrage. Sauvegardes et gameplay existants préservés.

## V2.6 — Atelier de compositions de decks (2026-10-11)

- Quatre compositions adaptées aux seules cartes possédées : Équilibré, Assaut rapide, Rempart et Arcanes ; 16 à 18 cartes ciblées, 12 minimum si la collection est réduite.
- Proposition déterministe, score tactique suivant l'archétype (vitesse, Garde, soin, magie et sorts). Les doublons n'excèdent jamais les exemplaires de collection.
- Interface Collection : présentation des stratégies, statistiques du deck actif, aperçu détaillé, confirmation explicite ; application impossible pendant un combat actif.
- Module métier `src/engine/deck-builder.js` intégré au moteur sans changer les règles de combat, l'économie, l'XP ou les clés de sauvegarde. Code source maintenant en 17 modules.
- 9 nouveaux tests Node (115 au total), scénarios de parité 60/60 inchangés, navigateur ordinateur/mobile. Documentation : `docs/COMPOSITIONS_DECKS_V2_6.md`.

## V2.5 — refonte de l'architecture modulaire

- Extraction du profil/progression, combat, donjons, récompenses dans `src/engine/`, avec façade historique `src/engine.js` conservée.
- Découpage des vues, de la sauvegarde navigateur et des animations dans `src/ui/`.
- Générateur HTML autonome remplacé par un assembleur qui suit les imports, isole les espaces de noms de chaque module et incorpore 12 illustrations locales.
- Build de test séparé avec accès internes pour Playwright, **jamais dans le fichier joueur**.
- Scénarios de parité : 60 combats déterministes identiques à V2.4. Aucun réglage de combat, de talent ou de récompense modifié volontairement.

## V2.4 — Rééquilibrage comparatif des talents (2026-10-11)
- Audit reproductible V2.3/V2.4 : 36 configurations × 14 rencontres × 32 graines par version (32 256 combats au total), comparateur et données JSON archivés.
- Réserve de flèches du Rôdeur : une pioche supplémentaire au maximum par combat (contre une à chaque usage du pouvoir en V2.3), indicateur d'utilisation dans le combat.
- Tir précis (+2 dégâts/ligne), Écho des étoiles (2 dégâts sur une deuxième cible), Purification (désimmobilisation et +1 bouclier), Main secourable (+2 PV aux alliés ciblés et +1 au héros), Rempart ancien (+3 boucliers de départ).
- Aucune modification d'XP, économie, classes, cartes ou progression ; parties existantes compatibles (champ `talentDrawUsed` optionnel).
- Contrôles : 102 tests Node, Playwright desktop/mobile, contrôles historiques. Les résultats de simulations sont ceux d'une heuristique, non de joueurs humains.

## V2.3 — Talents des quatre classes (2026-10-11)
- 16 talents originaux (4 par classe) sur deux paliers, débloqués aux niveaux 4 et 8.
- Deux choix exclusifs par palier ; reconfiguration gratuite entre les combats ; choix conservés séparément pour chaque classe.
- Bonus tactiques modestes sur les pouvoirs de héros : protection, soins, ciblage magique, pioche et purification ; pas de bonus permanent d'attaque aux unités.
- Sauvegardes anciennes compatibles ; instantané des talents lors du lancement d'une bataille, pour éviter les modifications en cours de combat.
- Tests : 98 tests Node, Chromium bureau/mobile pour le choix, le changement de classe, le combat, la sauvegarde ; régression navigateur XP, donjons, événements, VFX et navigation vérifiée.

## V2.2 — Maîtrise et progression équilibrée
- Nouveau système d'XP de héros (12 niveaux) avec gain limité à +2 boucliers de départ.
- Maîtrise par carte réellement jouée (3 rangs) et insignes en collection ; unités rang 3 : +1 PV maximum, sorts : insigne seulement.
- XP de combat dans les résultats, jauge du héros sur Citadelle/Atelier, progression visible sur les cartes.
- Compatibilité des anciennes sauvegardes et refus des réclamations de progression en double.
- Les récompenses d'or, d'éclats et l'attaque des cartes ne sont pas augmentées par l'XP.

## V2.1 — Premier rééquilibrage mesuré (2026-10-11)
- Banc d'essai reproductible `npm run balance` (32 rencontres × 40 graines pour chacun de 3 profils, résultats de simulation documentés dans `docs/EQUILIBRAGE_V2_1.md`).
- Progression lissée : moins de PV en campagne 01/03 et Tour 1–4 ; pic de difficulté campagne 11 réduit ; boss d'Ysara légèrement allégé.
- Embuscades nettement mieux rémunérées que les coffres sans risque, avec risque de défaite inchangé ; l'interface affiche la récompense calculée à partir de la mission réelle.
- Compatibilité des sauvegardes et limites de progression inchangées ; scénarios supplémentaires de non-duplication de récompenses et de difficulté.

## V2.0 — Événements et choix entre salles (2026-10-11)
- Trois choix après chaque salle ordinaire non finale : repos +10 PV maximum, coffre or + éclats, embuscade risquée avec combat supplémentaire.
- Les embuscades possèdent une mission et un ID propres, sont jouées dans le vrai moteur, rapportent leurs récompenses uniquement après victoire et terminent l'expédition en cas de défaite.
- État de décision (`ready`, `choice`, `bonus`) enregistré dans la sauvegarde existante ; migration des sauvegardes V1.9. Une récompense ne peut pas être réclamée deux fois.
- Interface de trois cartes de choix responsive et accessible par clavier ; navigation, modal de victoire et barre de progression mises à jour.
- Suite totale : 76 tests Node réussis (9 tests de nouvelles mécaniques) + parcours navigateurs ciblés sur Chromium bureau/mobile et contrôles historiques.
- Pas de génération aléatoire de salles, de coopération ni de réseau ; l'équilibrage reste à tester avec des joueurs.

## V1.9 — Donjons solo (2026-10-11)
- Trois donjons originaux constitués chacun de trois rencontres, dont un boss final (9 nouveaux défis structurés).
- Conservation des PV du héros entre les salles, +6 PV après chaque victoire ; impossibilité de rejouer une salle pour dupliquer une récompense.
- Récompenses intermédiaires, bonus de fin, cartes garanties une seule fois lors du premier achèvement de chaque donjon.
- Déblocage progressif des donjons ; abandon et défaite gérés sans perdre les ressources déjà obtenues.
- Onglet dédié, interface de progression et reprise de session, sauvegarde dans les clés V1 existantes.
- **67 tests JavaScript réussis**, dont 8 propres aux donjons. Nouveaux parcours Chromium desktop/mobile avec simulation de fermeture et de réouverture. Tests historiques navigation, effets, portraits, traits et IA confirmés.
- Les donjons sont **solo** et les compositions d'ennemis réemploient des cartes existantes ; aucun matchmaking, serveur ni coop dans cette version.

## V1.8 — Personnalités adverses et phases de boss (2026-10-11)
- Quatre profils tactiques distincts attribués aux 12 missions et aux 20 étages : Assaut, Bastion, Rituel, Meute. Équilibré reste le repli pour les sauvegardes anciennes.
- Calcul de priorité par cartes/lignes : offensive rapide, soins et garde, sorts ciblés, ou formation Concorde selon le profil.
- Boss à deux phases : sous 50 % de PV, la Furie modifie les choix de cartes, **sans bonus de statistiques, pioches gratuites ni actions supplémentaires**.
- Profil et phase affichés dans la préparation des missions et sur le champ de bataille ; annonce dans le journal à la transition.
- Compatibilité des anciennes parties sans champ `aiStyle`, aucun changement des clés de sauvegarde.
- 9 tests unitaires supplémentaires (58 réussis). Contrôles Chromium, y compris une correction de la classe CSS de l'encadré tactique.

## V1.7 — IA tactique contextuelle (2026-10-11)
- Nouveau module `src/ai.js` indépendant du DOM : analyse des trois lignes et classement des couples carte/ligne réellement jouables.
- Défense des couronnes menacées, ciblage des unités dangereuses, usage ciblé des sorts, soins uniquement utiles, formations Concorde et contre-attaques.
- Après une première carte jouée, le classement est recalculé sans dépasser la limite de deux cartes par tour.
- Décision enregistrée dans `battle.aiLastPlan`, affichée au joueur et journalisée, sans montrer les cartes cachées.
- IA déterministe selon la situation, **heuristique et non apprenante** ; aucune recherche profonde ni anticipation de cartes cachées.
- 10 nouveaux tests unitaires pour l'IA : **49 tests JavaScript réussis** au total ; tests Chromium desktop et mobile.
- Export autonome adapté au nouveau module, et sauvegardes historiques sans migration obligatoire.

## V1.6 — Capacités tactiques et contrôles
- **Charge** : une unité éligible ayant avancé pendant le tour obtient +2 attaque pour son attaque du tour. Le bonus est temporaire et identique pour les deux camps.
- **Riposte** : un défenseur éligible survivant à une attaque au contact inflige 2 dégâts avant armure au frappeur, une seule fois par tour, sans chaîne de ripostes.
- Ajout des traits visibles sur les cartes, dans les info-bulles d’unités et dans le Guide.
- Un coup sur un ennemi déjà éliminé ne compte plus plusieurs fois dans les statistiques de victimes.
- Huit nouveaux tests ciblés ; parcours navigateur à revalider à chaque version.

# V1.5.1 — Audit et correction de livraison (2026-10-11)
- Audit reproduit : 31 tests moteur, et 4 suites Chromium (navigation, visuels, événements, traits), sans erreur signalée.
- Ajout de tests : impossibilité de franchir un ennemi ; protection de couronne IA et séparation des lignes ; contrôle interface des traits.
- Documentation de reprise mise à jour de V1.4 vers V1.5.1 ; descriptions précises : Vol franchit un allié, Garde intercepte une attaque directe vers la couronne.
- Aucune modification de dégâts, de récompenses, ni de format de sauvegarde.

## V1.5 — Capacités tactiques
- Ajout de deux familles de capacités spéciales visibles dans le jeu : **Vol** et **Garde**.
- Les unités volantes peuvent franchir une case occupée par un allié lorsqu’elles avancent.
- Les unités de garde interceptent désormais les attaques destinées à leur couronne sur leur ligne.
- Les cartes affichent désormais leurs traits tactiques (Vol, Garde, Perforation, Vol de vie, etc.).

# Historique du jeu

## V1.4 — 2026-10-11

- Remplacement des glyphes principaux par **12 portraits fantastiques originaux** dans les cartes et sur le plateau de combat ; réutilisation par archétypes entre les 60 cartes.
- Animations de repos et de posture distinctes : combattants, archers, unités lourdes, bêtes, créatures volantes, mages, soigneurs et morts-vivants.
- Réactions d'attaque et d'impact déclenchées à partir des événements visuels du moteur de la V1.3 ; les règles de combat restent identiques.
- Les 12 images sont intégrées en base64 dans `JOUER.html` et peuvent être affichées sans réseau ; la version modulaire utilise `assets/creatures/`.
- Les réglages « animations désactivées » et « mouvement réduit » s'appliquent aussi aux nouvelles animations.
- **27 tests automatiques**, contrôle Chromium et affichage mobile réussis ; aucun besoin de migration de sauvegarde.
- Limite honnête : les créatures sont des illustrations animées par CSS, et non des sprites découpés et animés image par image. Les images sont des recadrages de concept art généré pour le projet.


## V1.3 — 2026-10-11

- **Effets de combat pilotés par les événements du moteur** : invocations, mouvements, attaques de mêlée, projectiles des unités à portée, magie, soins, poison et morts.
- Effets en surimpression avec impacts et dégâts flottants ; le moteur de combat reste déterministe et identique avec les animations désactivées.
- Choix utilisateur « Animations activées / désactivées », et respect de `prefers-reduced-motion`.
- Traces visuelles strictement temporaires, non enregistrées dans la sauvegarde ; compatibilité des anciennes parties conservée.
- **25 tests du moteur réussis**, tests de navigateur sur ordinateur, mobile et option de réduction des mouvements réussis.
- Limite graphique : les unités sont toujours figurées par des glyphes stylisés, les effets ne remplacent pas les sprites illustrés définitifs.

## V1.2 — 2026-10-11

- **Concorde tactique** : au moins deux unités vivantes du même ordre, du même camp et sur la même ligne bénéficient chacune de **+1 attaque**.
- Bonus calculé au moment de l'attaque, non permanent : disparaît automatiquement si l'une des unités est détruite ou déplacée.
- Fonctionne de façon identique pour le joueur et l'IA ; reconnaissance visuelle `✦ Concorde` et attaque corrigée affichée sur les unités.
- Règles expliquées dans le guide et sur le champ de bataille ; journal d'activation quand une nouvelle unité complète la formation.
- 3 tests supplémentaires ciblant l'activation, la disparition et l'équité entre les deux camps.
- Conservation du format de sauvegarde V1.1 et des 60 cartes existantes.

## V1.1 — 2026-10-11

- Étude des fonctionnalités historiques de Kings and Legends / Rise of Mythos consignée dans `docs/INVENTAIRE_HISTORIQUE_KINGS_AND_LEGENDS.md`.
- 24 cartes originales ajoutées : **60 cartes au total**.
- Classe de héros **Clerc** ajoutée : 4 classes jouables.
- Nouveau mode solo **Tour des Couronnes**, 20 étages, 4 gardiens, récompenses de premier succès.
- Six équipements du héros, répartis entre arme, armure et relique.
- Réputation des cinq ordres et bonus progressif de santé pour leurs créatures.
- Nouveaux effets de combat : perçage des armures, vol de vie et bouclier à l'invocation.
- Laboratoire d'alchimie : extraction protégée des cartes de surplus, recettes de fusion déterministes.
- Compatibilité avec les profils localStorage précédents grâce à `normalizeProfile`.
- Correction du générateur autonome pour traiter aussi les fonctions exportées et nouvelles importations.
- **19 tests unitaires réussis ; parcours navigateur Chromium desktop et mobile réussis sans erreur JS.**

## V1.0 — 2026-10-11

- Première base solo hors ligne : 36 cartes, 12 missions, 3 classes, combat à trois lignes, collection, forge et citadelle.

## Limitations ouvertes

- Pas de contenu original ni code récupéré du jeu historique : l'objectif est un jeu distinct.
- Pas de vrai multijoueur, guildes, échange de cartes, arène serveur, donjon en coopération ou modes 2v2/4v4.
- Les illustrations et mouvements CSS restent provisoires ; il faut encore produire des sprites par créature et des animations image par image.
- Tour de 20 étages : génération de decks à partir de compositions prédéfinies, non 20 environnements entièrement uniques.
- Simulation d'équilibrage à grande échelle et tests manuels sur appareils réels encore à faire.
