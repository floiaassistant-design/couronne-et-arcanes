# Lire la Bible avec l'état courant

La Bible conserve la vision et les éditions historiques du jeu. Les sections
V1 et leurs listes « implémenté / non implémenté » ne décrivent plus seules le
jeu actuel : plateau 3×5, comptes de cartes/classes, anciens graphismes,
absence de site ou d'effets y sont des relevés anciens, pas des règles à restaurer.
Les anciennes batailles actives incompatibles demandent désormais une relance
explicite sans pénalité ; leur ancienne promesse de reprise inchangée est historique.

Pour la livraison réelle : [état courant](ETAT_PROJET.md), [utilisation](../README.md),
[registre et architecture](ARCHITECTURE_MODULAIRE_V2_6.md). Les règles permanentes
sont dans [AGENTS](../AGENTS.md), la conception des évolutions dans le tableau
maître Notion, leur état intégré dans [la reprise des cartes](REPRISE_MIGRATION_CARTES.md).
Ce repérage documentaire ne change ni l'univers ni les règles du jeu.

---

> **20/10/2026 — PR nº 20 intégrée, puis remise à zéro nº 22 :** pose libre dans les trois premières cases alliées des arènes à dix cases, zone miroir pour l’adversaire. Clic = sélection/pose ; survol ou focus = lecture, sans fiche épinglée. Les anciennes batailles 3×5 gardent une entrée. Les descriptions historiques d’invocation à une extrémité ci-dessous ne décrivent pas cette nouvelle option.

> **Mise à jour de géométrie V2.11 (fusionnée sur main le 12/10/2026)** : 10 cases par ligne, 2 lignes en duel, 3 dans les rencontres avancées et 4 pour les boss solo ; anciens combats 3×5 conservés. Le décor peint et la présentation cartes sont conservés ; les anciens graphismes de personnages sont retirés. La présente bible contient des sections V1 historiques ; le README et `ETAT_PROJET.md` décrivent l’état courant.

# COURONNES & ARCANES

> **Nouvelle production graphique, décision du 20/10/2026 :** plateau et
> présentation des cartes conservés, anciens personnages, images et animations
> retirés de la production active. Les anciennes planches et accords ne sont
> plus des modèles à réemployer. Les sections graphiques antérieures sont
> historiques ; lire `REMISE_A_ZERO_GRAPHIQUE_2026_10_20.md` et l'état courant.
## Bible du jeu et cahier de production — Édition 1.0

> Jeu indépendant original, inspiré par le **genre** des jeux de cartes tactiques en lignes, notamment *Kings and Legends / Rise of Mythos*. Il ne reprend ni son code, ni ses illustrations, ni ses noms propres, ni ses cartes originales, ni ses marques. Cette bible est à la fois le descriptif de la version jouable présente et le projet complet à viser.

---

## 1. Identité du projet

- **Titre :** Couronnes & Arcanes — Les Chroniques des Cinq Ordres.
- **Genre :** jeu de cartes à collectionner (CCG) tactique, combats au tour par tour, unités invoquées à progression autonome.
- **Support prioritaire :** navigateur web moderne, ordinateur et smartphone en format paysage pour les batailles.
- **Public :** joueurs aimant la collection, l’heroic fantasy et la tactique accessible avec profondeur stratégique.
- **Moteur du prototype :** HTML/CSS/JavaScript, sans dépendance, jouable hors ligne.
- **Moteur final :** conserver le web si techniquement satisfaisant ; ne migrer vers Godot que sur décision justifiée par la qualité visuelle, l’animation et la maintenance.
- **Modèle économique :** jeu intégralement jouable, pas de paiement réel, pas de publicité ni d'énergie quotidienne dans la version de référence.
- **Expérience :** construire des decks, choisir sa classe, progresser sur une carte de régions, gagner des cartes, personnaliser son bastion, battre des boss, puis défier d’autres stratégies.

### Vision d’une partie
Le joueur se trouve dans la citadelle, prépare un deck de 12 à 24 cartes et choisit un adversaire. Le combat oppose deux héros sur les bords d’une arène comportant trois lignes. Les unités invoquées s’approchent automatiquement de l’ennemi ; les sorts et l’ordre des cartes modifient l’issue. Une victoire rapporte de l’or, des éclats et parfois de nouvelles cartes ; le joueur revient à sa collection pour préparer le défi suivant.

### Principes non négociables
1. Compréhensible sans savoir programmer et sans tutoriel vidéo externe.
2. Actions tactiques significatives ; l’emplacement et le moment de la pose comptent.
3. Unités visibles se déplaçant et attaquant, pas seulement des chiffres dans des menus.
4. Univers et identité graphique cohérents et originaux ; vraie progression artistique.
5. Aucun mécanisme pay-to-win ni collection dépendant d’argent réel.
6. Une version réellement jouable et sauvegardée à chaque étape de développement.
7. Les changements d’une session Codex à l’autre sont traçables dans GitHub.

## 2. Univers, synopsis et progression narrative

Le royaume d’Astravelle a perdu la **Couronne des Serments**, fragmentée pendant une éclipse. Cinq ordres rivaux ont recueilli les éclats. Le héros, jeune souverain d’une citadelle isolée, doit restaurer les pactes anciens, affronter les usurpateurs et choisir ce que signifiera la nouvelle paix.

**Acte I — Lisières d’Ysara (missions 1–3)** : convoyeurs disparus, brume enchantée, ancien gardien de la forêt. Identité : verts, lucioles, mousse, racines géantes. Boss : Gardien du Bosquet.

**Acte II — La Marche Cendrée (missions 4–6)** : cols occupés, forges industrielles, colosse alimenté par un minerai vivant. Identité : cuivre, fer, laves et engrenages. Boss : Colosse des Fourneaux.

**Acte III — Les Terres du Voile (missions 7–9)** : tombes ouvertes, peste surnaturelle, archiliche gardien d’un fragment. Identité : violets désaturés, ruines, clair de lune. Boss : Archiliche Éternel.

**Acte IV — Les Hautes Sphères (missions 10–12)** : tour astrologique, cour des oracles, dragon ancien. Identité : bleus célestes, or antique, cristaux flottants. Boss : Dragon des Sept Cieux.

**Évolution future de la narration :** dialogues illustrés entre combats, embranchements secondaires, compagnons récurrents, fins alternatives. La première version ne doit pas prétendre contenir ces scènes.

## 3. Combat tactique — règles de référence, édition jouable

### Arène
- Trois lignes horizontales (I, II, III), sept colonnes visuelles : deux colonnes représentent les portails des héros ; cinq colonnes centrales permettent d'accueillir les troupes.
- Le joueur déploie en colonne 1 (gauche), l'adversaire en colonne 5 (droite).
- Une case occupée bloque le déploiement et le déplacement.
- Les unités du joueur avancent vers la droite ; celles de l'ennemi, vers la gauche.
- On gagne en réduisant à zéro les PV du héros adverse.
- Les unités ne changent pas de ligne par défaut ; des cartes spéciales pourront le permettre dans une extension.

### Deck, main, tempo
- Deck : **12 à 24 cartes**. Le deck initial contient **18 cartes**.
- Main initiale : 5 cartes, plus les bonus de la Bibliothèque.
- Une carte est jouable lorsque son compteur d'attente atteint 0. Les cartes longues à préparer sont souvent plus puissantes.
- Au maximum **deux cartes jouées par tour**.
- À chaque fin de tour, l'IA joue, les unités se déplacent puis combattent, les attentes baissent et chaque camp pioche une carte.
- Les cartes utilisées rejoignent la défausse et reviennent en jeu lorsque le paquet est épuisé.
- Les dégâts d'attaque sont réduits par l'armure, avec un minimum d'un point subi par coup.
- Les attaques d'un même tour sont calculées à partir d'une liste d'actions afin de limiter l'avantage systématique du premier attaquant.
- Après le tour 16, les deux héros subissent une attrition progressive afin d'éviter les batailles interminables.
- Au-delà de 35 tours, l'issue est tranchée selon les PV restants ; le mécanisme doit être retesté lors de l’équilibrage.

### Capacités implémentées
- **Armure** : réduction de 2 points par frappe.
- **Portée** : peut frapper à 2 cases.
- **Rapidité** : se déplace jusqu'à 2 cases par tour si l'espace est libre.
- **Soin** : soigne un allié blessé de sa ligne.
- **Poison** : inflige des dégâts différés.
- **Éclaboussure** : une attaque touche également une seconde cible.
- **Inspiration** : renforce périodiquement un allié de sa ligne.
- **Sort — feu** : inflige 4 dégâts à une unité, ou 2 au héros si la ligne est vide.
- **Sort — soin** : répare le héros et les unités de la ligne.
- **Sort — cri** : améliore l'attaque des alliés de la ligne.
- **Sort — orage** : touche tous les ennemis d'une ligne.
- **Sort — racines** : étourdit la première unité ennemie.
- **Sort — sanctuaire** : ajoute un bouclier au héros.

### Classes jouables
1. **Gardien** — résistance, rétablissement : +4 PV et +2 bouclier avec son pouvoir.
2. **Arcaniste** — assaut : inflige 4 points à l’ennemi le plus avancé, ou 2 au héros si le terrain est libre.
3. **Rôdeur** — pression de zone : 2 points à la première unité ennemie de chaque ligne.

Le pouvoir est disponible au début puis se recharge tous les trois tours. Pour la version complète, chaque classe devrait recevoir **12 à 20 cartes de compétences exclusives**, plusieurs styles de deck et une progression de talents non obligatoire.

### IA de la version livrée (V1.7)
- Le moteur utilise une **heuristique déterministe** dans `src/ai.js`, non un modèle qui apprend.
- Pour chaque carte prête de la main adverse, l'IA examine trois lignes, les menaces proches de sa couronne, les bonus de formation, les sorts utiles et les cases de déploiement libres.
- Elle peut choisir de défendre, cibler une cible dangereuse, se soigner, lancer une offensive ou conserver un sort inadapté.
- Elle réévalue les possibilités après sa première action et respecte la limite de deux cartes par tour.
- Elle n'accède pas aux cartes cachées de la main, de la pioche ni de la collection du joueur. Son dernier motif de décision est affiché.
- Les missions haut niveau attribuent toujours des unités plus fortes à l'ennemi ; il s'agit d'une difficulté de campagne explicite, pas d'une IA compétitive à ressources égales.

### IA finale visée
- Évaluer pour chaque carte/lane l'urgence défensive, l'efficacité d'une attaque, le prochain tour, les synergies de deck.
- Rechercher les décisions les plus prometteuses à profondeur limitée et sous budget de calcul.
- Définir plusieurs personnalités d'adversaires : agressif, contrôle, essaim, soins, tempo, anti-armure.
- Distinguer la difficulté par **qualité de décision et composition du deck**, sans connaissance cachée en mode compétitif.
- Écrire des tests automatiques et des simulations de centaines de parties pour chaque mise à jour majeure.

## 4. Les cinq ordres et la collection

### Alliance de l'Aube
Infanterie, boucliers, soins, soutien : Milicien de l'Aube, Porte-égide, Arbalétrière, Sœur de l'Aurore, Paladin solaire, Porte-étendard.

### Conclave Sylvestre
Mobilité, régénération, harcèlement : Éclaireuse sylvestre, Loup des Brumes, Gardien des Racines, Dryade luminescente, Cerf astral, Traqueur d'épines.

### Cour des Ombres
Poison, pression rapide, dégâts magiques : Guerrier d'ossements, Ombre vorace, Veilleur du tombeau, Faucheur de fièvre, Archiliche de Minuit, Banshee des Voiles.

### Légions de la Forge
Blindage, percussion, explosion : Marteau des Monts, Golem runique, Sapeur gobelin, Foreur de fer, Colosse de braise, Ingénieure d'acier.

### Ordre de l'Éther
Portée, magie, vitesse, créatures mythiques : Feu follet, Oracle des Astres, Élémentaire azuré, Griffon du Zénith, Sentinelle prismatique, Dragon des Sept Cieux.

### Six sorts neutres
Lame de feu, Souffle vital, Cri des anciens, Orage runique, Prison de lierre, Sanctuaire.

**Total de la version jouable : 36 cartes originales** (30 unités, 6 sorts), réparties entre les raretés **commun, rare, épique, légendaire**. Les fiches complètes et les caractéristiques se trouvent dans `src/data.js`. La collection future pourrait atteindre 150–250 cartes, par incréments équilibrés ; ce n’est pas une obligation de produire 1 000 cartes avant d’avoir un jeu plaisant.

### Composition tactique recommandée
- Deck rapide : loups, guerriers, feu follets, sorts offensifs.
- Deck défensif : boucliers, golems, soins, archers.
- Deck contrôle : poison, racines, mages, dégâts de zone.
- Deck hybride : équilibre entre unités à délai court et grosses unités.

## 5. Progression, récompenses et économie

**Monnaies :** or pour améliorer la cité et ouvrir des paquets ; éclats pour améliorer les unités ; renommée comme indicateur d'avancement.

**Récompense d'une mission :** or et éclats à chaque victoire ; une copie de la carte promise lors de la première victoire uniquement. Les défaites offrent 10 pièces d'or pour limiter les impasses.

**Paquets mystiques :** 95 pièces d'or gagnées uniquement en jeu ; 3 cartes avec raretés pondérées. La transparence des probabilités et un mécanisme de protection contre les mauvais tirages restent à ajouter si le système de paquets devient central.

**Cartes améliorables :** unités niveaux 0 à 3 ; coût de 35/70/105 éclats ; bonus d'attaque et de PV par niveau. Les sorts ne sont pas encore améliorables.

**Citadelle :** Bastion royal (+4 PV héros/niveau), Forge ancestrale (+1 PV aux unités/niveau), Bibliothèque des Sages (+1 carte initiale/niveau). Les coûts augmentent avec le niveau et sont définis dans le moteur.

**Règle de progression :** aucun mur artificiel destiné à faire payer ; toute carte reste obtenable via des combats, objectifs ou artisanat à terme.

## 6. Campagne : douze missions livrées

| Nº | Région | Adversaire | Récompense carte | Type |
|----|--------|------------|------------------|------|
| 01 | Lisières d'Ysara | Sentinelle des bois | Loup des Brumes | Normal |
| 02 | Lisières d'Ysara | Druide égaré | Dryade luminescente | Normal |
| 03 | Lisières d'Ysara | Gardien du Bosquet | Gardien des Racines | Boss |
| 04 | Marche Cendrée | Capitaine d'Acier | Foreur de fer | Normal |
| 05 | Marche Cendrée | Maître des Forges | Golem runique | Normal |
| 06 | Marche Cendrée | Colosse des Fourneaux | Colosse de braise | Boss |
| 07 | Terres du Voile | Héraut des Ombres | Faucheur de fièvre | Normal |
| 08 | Terres du Voile | Reine du Néant | Banshee des Voiles | Normal |
| 09 | Terres du Voile | Archiliche Éternel | Archiliche de Minuit | Boss |
| 10 | Hautes Sphères | Oracle céleste | Oracle des Astres | Normal |
| 11 | Hautes Sphères | Gardien des Âges | Griffon du Zénith | Normal |
| 12 | Hautes Sphères | Dragon des Sept Cieux | Dragon des Sept Cieux | Boss final |

Chacune possède un deck ennemi, un nombre de PV, une difficulté, une récompense et un texte d'introduction. La première victoire déverrouille la suite.

## 7. UX / Interface / accessibilité

### Parcours minimal d'un nouveau joueur
1. Ouverture : écran citadelle ; aide de bienvenue présentée une fois.
2. Bouton « Compris, jouer ! » → première mission.
3. Cliquer une carte non bloquée → la carte est surlignée.
4. Cliquer la ligne choisie → l'unité apparaît à gauche.
5. Fin de tour → l'IA invoque ses unités et les combats se résolvent.
6. Victoire → détail des récompenses ; retour à la campagne.
7. Collection → ajouter/retirer des copies ; Atelier → choisir une classe et améliorer.

### Qualité attendue pour la version complète
- Illustrations uniques, personnages animés, effets de coups et projectiles, impact visuel par rareté, fond environnemental par région.
- Vraie phase de déplacement/attaque en animation lisible, vitesse x1/x2 et bouton d'accélération.
- Tutoriel interactif contextualisé au lieu d’un simple guide texte.
- Animation de pack, animations de victoire, événements sonores, musique adaptative, réglage du volume et option muet.
- Mode daltonisme, taille des textes réglable, sous-titrage et réduction des animations.
- Taille tactile min. 44 px, sélection intuitive, disposition paysage smartphone.
- Les sorts nécessitant une cible doivent prévisualiser l'effet avant la validation.

### Direction artistique
Fantasy peinte en 2D avec influences de gravures médiévales, cuir sombre, or patiné, reflets magiques. Chaque ordre a sa palette : Aube or/ivoire ; Sylve vert mousse ; Ombre prune/noir ; Forge cuivre/braise ; Éther bleu/indigo. Éviter les copies d’interfaces et d’illustrations de jeux existants. Première priorité : **six cartes illustrées avec un style cohérent, une arène animée et un héros**, pas 300 images approximatives.

## 8. Fonctions réellement implémentées dans le dépôt

- Campagne jouable en 12 missions contre l'IA avec victoires/défaites.
- 36 cartes, 3 classes et 6 familles de capacités.
- Système d'attente, pioche/défausse, maximum de 2 cartes/tour.
- Unités invoquées sur plateau 3 × 5, déplacements/attaques automatiques.
- Deck personnalisable selon les copies possédées, limites 12 à 24 cartes.
- Amélioration d'unités et de trois édifices.
- Boutique de paquets gratuits en monnaie de jeu.
- Interface responsive, guide et aide de bienvenue.
- Sauvegarde automatique via localStorage, reprise d'un combat en cours ; export/import du profil JSON.
- Aucune inscription ni serveur ni accès réseau requis pour jouer à la version autonome.
- Tests unitaires du moteur et parcours de navigateur basique contrôlé.

### Fonctionnalités NON implémentées
- Illustrations professionnelles peintes, sprites de personnages animés et effets audiovisuels.
- Construction visuelle d'une cité sur carte ; la citadelle se gère par améliorations textuelles.
- Réseau : vrais PvP, coop, guildes, matchmaking, classements et comptes partagés.
- Marché, échange de cartes, classement saisonnier, équipement RPG complet, 150+ cartes, donjons procéduraux.
- Serveur anti-triche et statistiques d'équilibrage réelles sur un public de joueurs.
- Jeu mis en ligne chez un hébergeur, publication en boutique ou validation sur les principaux téléphones.

Cette distinction est essentielle : le code actuel est un **jeu solo autonome et testable**, pas la reproduction complète d'un MMO-CCG commercial.

## 9. Vision du jeu « abouti » — modules à construire

### Module A — Combat spectaculaire
Deux phases visuelles distinctes : placement des cartes puis animation tactique. Unité vivante, déplacement, collision, coup, défense, mort ; sons et projections. Champs de bataille multiples avec terrains donnant des variantes légères de stratégie.

### Module B — Collection longue durée
150 à 250 cartes avec rôles distincts, 6 à 8 familles de synergies, 4 classes ou plus, variantes rares qui ne détruisent pas l'équilibre, crafting transparent, catalogue avec recherche et filtres.

### Module C — Citadelle illustrée
Écran de ville interactif : forge, académie, salle du trône, bibliothèque, portail d'expédition ; chaque bâtiment a une vraie fonction. Pas de ville type city-builder complète : l’objectif est d'enrichir le CCG sans transformer le projet en second jeu de gestion.

### Module D — Campagne et donjons
40–80 rencontres réparties en chapitres avec histoires, boss à mécaniques spécifiques, modificateurs de terrain, donjons de 3–5 combats et composition d'équipe.

### Module E — IA avancée
Personnalités, simulations et outils d'équilibrage automatisés, ennemis de niveau croissant, modes défi et préparation de decks adaptatifs mais non omniscients.

### Module F — Multijoueur (si validé)
PvP en temps réel ou asynchrone avec moteur de combat déterministe sur serveur, matchmaking, classement, reconnexion, anti-triche, comptes, protection des données, gestion des abus et tests de charge. Ce module doit rester séparé de la version solo. Coopératif 2v2 / donjons partagés uniquement après architecture et tests serveur.

### Module G — Excellence de production
Optimisation web mobile, écrans adaptatifs, son, localisation, accessibilité, tests automatisés end-to-end, corrections de bugs, métriques anonymisées avec consentement si ajoutées.

## 10. Définition de « terminé »

Un jalon ne peut être déclaré terminé que si :
- le jeu démarre et la fonctionnalité se lance sans erreur console ;
- le scénario de test réel, puis ses cas limites, réussissent ;
- la sauvegarde et la reprise fonctionnent ;
- l'interface est compréhensible et cohérente sur ordinateur et téléphone ;
- le code et les tâches restantes sont enregistrés sur GitHub ;
- le joueur peut bénéficier immédiatement du changement dans une version stable.

L'ordre des modules appartient à l'agent principal si cela améliore la cohérence du jeu, mais il doit expliciter les compromis et ne pas sacrifier la version stable.

## 11. Aspects techniques à respecter

- La **logique métier** doit rester indépendante du rendu (`src/engine.js`).
- Les données de cartes et de missions restent déclaratives (`src/data.js`).
- Le rendu et les événements sont dans `src/app.js`; éviter la croissance illimitée en divisant quand nécessaire.
- Aucune dépendance externe nécessaire pour démarrer.
- La sauvegarde côté navigateur n'est pas sécurisée contre les modifications manuelles et ne doit pas servir de référence pour du PvP avec enjeu.
- Le moteur utilise un générateur de hasard à graine pour les decks ; toute future synchronisation réseau devra rendre l'ensemble des événements déterministe et vérifiable.
- Les nouvelles capacités nécessitent des tests unitaires et des tests d'interaction.
- Préférer des fichiers lisibles et peu de complexité plutôt que des cadres logiciels disproportionnés.

## 12. Propriété intellectuelle

S’inspirer d’une mécanique ou d’un genre n’autorise pas à reprendre un logo, un nom commercial, une carte, des illustrations ou le texte d'un autre jeu. `Couronnes & Arcanes`, ses factions, créatures et missions sont des éléments originaux conçus pour ce prototype. Tout visuel tiers introduit ultérieurement doit être autorisé/licencié et documenté.

## 13. Sources d'inspiration historique (mécanique, non assets)

- JeuxOnLine — *Kings and Legends*, descriptions des combats en lignes, campagne et types de modes : https://www.jeuxonline.info/jeu/Kings_and_Legends
- JeuxOnLine — critique détaillant les cartes de créatures, compétences et délais : https://www.jeuxonline.info/critique/5534
- Archives de la communauté *Kings and Legends* : https://kingsandlegends-archive.fandom.com/wiki/Kings_and_Legends

Ces ressources servent à caractériser le **genre**, pas à reproduire son contenu propriétaire.


## V1.3 — Animations tactiques (implémenté, 2026-10-11)

- Le moteur produit des événements de rendu transitoires (déploiement, déplacement, attaques, magie, soins, mort) sans modifier les règles.
- Le navigateur anime ces événements au-dessus du plateau avec projectiles, impacts et messages de dégâts.
- Désactivation volontaire des animations et préférence système de réduction du mouvement prises en charge.
- Aucun événement visuel n’est conservé dans les sauvegardes ; anciennes parties V1.0 à V1.2 reconnues.
- Les personnages représentés par glyphes restent provisoires : les véritables personnages illustrés et leurs animations image par image sont à développer.


## Extension jouable V1.9 — Donjons en trois salles

La V1.9 ajoute trois **donjons solo** : Racines d’Ysara, Fonderie des Cendres et Cryptes de Minuit. Chacun contient trois affrontements et un boss final. Les PV du souverain persistent entre salles, avec +6 PV de repos après chaque victoire ; le joueur garde les ressources obtenues lors des salles réussies. Une carte spéciale est gagnée à la première victoire complète de chaque donjon ; les expéditions peuvent ensuite être rejouées contre des récompenses en ressources seulement. Donjons coopératifs, serveur et progression procédurale restent dans la feuille de route, **pas** dans le jeu livré. Voir `docs/DONJONS_V1_9.md`.


## Ajout V2.2 — XP du héros et maîtrise des cartes
Le héros progresse du niveau 1 au niveau 12 par l'XP de combat. Bonus limité à +1 bouclier de départ aux niveaux 5 et 9. Une carte réellement jouée gagne de la maîtrise (4, 10, 22 XP pour ses rangs 1 à 3) ; une unité de rang 3 gagne +1 PV au combat suivant. Aucun bonus d'attaque ni de monnaie lié à ces nouveaux niveaux. Les sorts gagnent un insigne de maîtrise sans puissance accrue. Progression sauvegardée sous `heroXp` et `mastery` dans le profil existant.
