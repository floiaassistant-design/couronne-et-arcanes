# V2.9 — Règles, architecture et vérification

## Cartes et règles

| Carte / ID | Rareté | Délai | ATK / PV | Effet |
|---|---|---:|---|---|
| Sceau du Mutisme / `seal_silence` | rare | 2 | sort | Silence de deux résolutions |
| Inquisiteur des Brumes / `mist_inquisitor` | rare | 3 | 2 / 6 | Silence de la résolution actuelle, recharge trois tours |
| Faille de Transposition / `transposition` | rare | 2 | sort | Allié éligible le plus avancé vers la ligne choisie |
| Marcheur des Portails / `portal_walker` | rare | 2 | 3 / 5 | Déplacement latéral si avantage public ≥ 2, recharge trois tours |
| Piège runique / `rune_trap` | commun | 2 | sort | 3 dégâts avant armure à l'arrivée d'un ennemi |
| Trappeur sylvestre / `sylvan_trapper` | commun | 2 | 2 / 5 | 1 dégât avant armure et immobilisation, recharge trois tours |

Délais, armure, barrières, progression et limite de deux cartes par tour restent ceux du moteur existant. Les six cartes ont une recette d'Alchimie aux coûts historiques de leur rareté (commun : 12 or/26 éclats ; rare : 32 or/64 éclats), et peuvent être tirées dans les paquets à 95 or. Aucune attribution gratuite au joueur depuis les collections de laboratoire.

### Silence

Une résolution désigne la fin d'un tour joueur, incluant actions de l'IA, préparation des capacités de contrôle, déplacement, attaques et soutien. Le Sceau affecte cette résolution et la suivante ; l'Inquisiteur agit avant le déplacement pour cette résolution. `silenceUntil` est inclusif ; expiration après la résolution, puis `silenceGuardUntil` protège une résolution entière avant réapplication.

Suspend : Poison nouvellement appliqué, Soin, Inspiration, Impact de zone, Vol de vie, Perforation, Célérité, Charge, Riposte et capacités des nouvelles unités. Conserve : attaque de base, PV, armure, Distance, Vol, Garde, Concorde, barrières et bonus déjà appliqués, poison déjà reçu. Les sorts et pouvoirs du héros ne sont pas des capacités de créature et restent utilisables. Les effets à l'invocation déjà résolus ne sont pas annulés.

La cible est choisie parmi les ennemis ayant une capacité suspendable, hors silence/répit : valeur de contrôle décroissante, attaque décroissante, proximité du camp lançant, puis UID. Valeurs publiques dans `silenceValue`. Pas de consommation sur une ligne sans cible utile.

### Téléportation

Change uniquement la ligne, pas la colonne ; départ et arrivée entre les cases 1 et 5, destination libre, autre ligne. La colonne 5 est exclue pour un allié joueur, la colonne 1 pour un allié adverse : aucune arrivée juste devant la couronne opposée. Les colonnes de héros 0 et 6 sont toujours interdites. `teleportedRound` empêche un deuxième transfert de la même unité dans le tour.

Faille : parmi les alliés des autres lignes ayant une destination valide, plus avancé en premier, puis ligne supérieure et UID. Aperçu de ce même plan dans l'UI. Le Marcheur compare les positions publiques (menaces, possibilité de frapper, passage bloqué, pièges visibles), avec égalité par ligne supérieure. La téléportation ne donne pas Charge ; le mouvement normal qui suit peut la donner. Les arrivées déclenchent les pièges, même avant la résolution du tour.

### Pièges

Ils occupent un emplacement logique séparé des créatures, sont publics, et ne bloquent pas le déplacement. Placement initial uniquement sur une case vide des colonnes 2–4, sans autre piège. Le sort privilégie la case 3, puis la case côté allié (2 joueur / 4 adversaire), puis l'autre ; le Trappeur prépare la case juste devant lui si elle est admissible. Deux pièges armés maximum par camp.

Un ennemi arrivant sur la case par mouvement ou transfert les consomme avant tout calcul ; un allié ou une unité survolant la case ne les consomme pas. Dégâts via `hit`, donc armure/barrière et compteurs de victimes conservés. Le collet suspend les mouvements restants et l'attaque de la résolution actuelle (étourdissement historique de 1). Expiration après la troisième résolution, aucune boucle de déclenchement.

## Architecture et sauvegardes

`src/engine/battle-control.js` centralise plans purs, validations, effets et expiration. Il importe uniquement les données. `battle.js` fournit les hooks d'événement, de journal et d'entrée de case ; les dommages restent dans son `hit`. L'IA et la vue utilisent ces mêmes plans, sans imports circulaires ni moteur dépendant du DOM. Le module principal de combat reste à 368 lignes ; pas de refonte générale.

Champs facultatifs : `battle.traps` (liste d'objets avec `owner`, `lane`, `col`, `kind`, `damage`, `stun`, `expiresRound`), et états de créature `silenceUntil`, `silenceGuardUntil`, `teleportedRound`, `controlReadyRound`. L'absence équivaut à aucun contrôle. Même clé de profil `couronnes_arcanes_v1`, même clé de combat `couronnes_arcanes_bataille_v1`. Les événements visuels ne sont pas conservés dans le stockage.

Les 68 fiches V2.8, la campagne et les vingt decks de Tour sont figés en fixture de non-régression. La Tour exclut les nouvelles unités de sa génération historique. L'IA sait employer les six cartes lorsqu'elles appartiennent à son deck, comme dans les rencontres de laboratoire ; les anciennes rencontres officielles gardent leurs decks.

## Preuves exécutées localement

- `npm test` : **165 réussis, 0 échoué, 0 ignoré**, dont 35 tests V2.9 (avec variantes ciblées) et la suite V2.8 complète.
- `npm run test:parity` : **60 états finaux identiques à la référence V2.4**, sans réécriture de cette référence.
- `npm run build`, `npm run build:test` : 19 modules, 12 images embarquées ; reconstruction identique du HTML autonome.
- `python3 tests/browser_class_skills_v28.py` : apprentissage, restrictions de classe, combat et sauvegarde sur 1366×900 et 390×844.
- `python3 tests/browser_battle_control_v29.py` : fabrication des six cartes, ajout au deck, descriptions, silence/durée, aperçu et animation du transfert, pièges/dégâts, sauvegarde/reprise, anciennes propriétés facultatives, mouvement réduit et absence de débordement global. Le vrai `JOUER.html` est ouvert sans réseau avec stockage réel, rechargement, fin de combat, collection et atelier sur les deux formats.
- `node scripts/battle_control_balance.mjs --json` : 20 480 scénarios, puis deuxième exécution identique octet par octet au JSON livré.

Des premiers contrôles ont échoué sur le nombre de cartes attendu, la composition historique de Tour et le débordement mobile ; ils ont été corrigés puis relancés. Seuls les résultats finaux verts comptent pour la fusion. Les Actions GitHub doivent encore être vérifiées sur le commit exact de la PR, indépendamment de ces preuves locales.

## Simulations et limites

Deux profils fictifs : niveau 6 avec unités améliorées à 1 et bâtiments 1, niveau 9 avec améliorations/bâtiments 2. Chaque profil possède fictivement les cartes nécessaires. Quatre classes, quatre decks fixés de 18 cartes incluant les deux compétences V2.8 de la classe, cinq variantes : référence, remplacement de deux cartes par Silence/Téléportation/Pièges, remplacement de six par les six nouveautés.

Adversaires : boss des missions 03/06/09/12 avec decks historiques, puis quatre variantes où six cartes sont remplacées par les nouveautés. Seize graines identiques (`19029 + seed × 997`) pour toutes les compositions. **2 × 4 × 4 × 5 × 8 × 16 = 20 480 combats**, rejoués une seconde fois pour la reproductibilité.

| Classe | Référence | Silence | Téléportation | Pièges | Six cartes ensemble |
|---|---:|---:|---:|---:|---:|
| Gardien | 75,3 % | 72,7 % | 72,9 % | 73,7 % | 67,2 % |
| Arcaniste | 84,3 % | 81,7 % | 82,2 % | 83,0 % | 77,4 % |
| Rôdeur | 84,4 % | 82,1 % | 81,6 % | 83,6 % | 79,4 % |
| Clerc | 72,9 % | 73,6 % | 72,7 % | 73,0 % | 66,3 % |

Chaque case agrège 1 024 combats. Les quatre classes restent viables dans cet échantillon. Les six nouveautés cumulées ne surpassent pas systématiquement la référence. Le deck Soutien passe de 81,4 % à 79,6 % avec les deux cartes Silence et à 69,4 % avec les six contrôles ; aucune stratégie n'est supprimée dans ce test. La composition Rempart demeure plus efficace que certaines autres avec ce joueur automatisé, limite déjà observée avant V2.9.

Maximum observé : **32 tours**, zéro combat inachevé ni état invalide. Contrôles à chaque tour : PV non négatifs, unités vivantes et UID uniques, durée de silence ≤ 2, cases de pièges valides et plafond par camp. 28 219 états de pièges et 12 494 états de silence observés. Toutes les nouvelles cartes et les huit compétences V2.8 ont été jouées dans le laboratoire ; compteurs détaillés dans `BATTLE_CONTROL_BENCHMARK_V2_9.json`.

Ces nombres sont ceux d'une heuristique de laboratoire, sans talents ni équipement dans ces profils ; ils ne sont ni des statistiques humaines, ni un test PvP symétrique, ni une preuve d'équilibrage exhaustif. Le robot a été adapté aux compétences/contrôles et peut encore sous-utiliser les repositionnements. Les états transitoires entre deux observations sont couverts par les tests ciblés ; les assertions de fin de tour seules ne suffisent pas. L'IA ne recherche pas profondément et ne connaît aucune carte privée du joueur.

Pas de téléphone physique testé. Le plateau et la main se parcourent horizontalement sur petit écran. V3.0 proposée : un donjon en trois salles, avec boss originaux utilisant progressivement les contrôles, récompenses en jeu et difficulté mesurée avant intégration.
