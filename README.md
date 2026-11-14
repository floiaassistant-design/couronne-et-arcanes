# Couronnes & Arcanes

Le jeu intègre les sauvegardes protégées, Garde/Riposte uniques, le deck manuel,
les paquets/fusions et les ascensions Aube, Sylve, Ombre, Forge et Éther. La [PR 75](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/75)
a intégré dix évolutions Rares/Épiques Forge et leur paquet à `main`,
avec six contrôles réussis. Ce lot et les PR suivantes jusqu’à la PR 83 sont publiés dans la version Sites 27.
La PR 83 a intégré dix hauts rangs tactiques Forge, publiés dans Sites v27. La PR 84 a intégré [douze évolutions Éther](docs/ETHER_SOCLE_EVOLUTIONS.md) avec leur paquet. La PR 85 a intégré les [trois hauts rangs du Golem](docs/FORGE_GOLEM_COEUR_RUNIQUE.md). La PR 86 a intégré [Repli et présage](docs/ETHER_REPLI_PRESAGE.md), publiés dans Sites v29. Les contours de rareté (PR 87) et les [premiers Divins Éther avec leur ascension](docs/ETHER_PREMIERS_DIVINS.md) (PR 88) sont intégrés dans `main`. Leur diffusion est suivie dans [l’état du projet](docs/ETAT_PROJET.md).
Les [cinq Légendaires Forge de statistiques](docs/FORGE_LEGENDAIRES_STATS.md) sont intégrées par la PR 78 le 3 novembre 2026, avec leurs fusions et leur export synchronisé. Leur publication est confirmée dans la version Sites 23.
Le [Marchefer Légendaire](docs/FORGE_MARCHEFER_LEGENDAIRE.md) et sa récupération de bouclier après élimination sont intégrés par la PR 79 le 3 novembre 2026. La publication reste suivie séparément.
Le [Foreur Légendaire](docs/FORGE_FOREUR_LEGENDAIRE.md) est intégré par la PR 80 : Foreuse d'acier retire jusqu'à 2 points de barrière personnelle avant l'attaque normale, au plus une fois tous les 3 tours. Sa publication est suivie séparément.
[Contrat Forge Rare/Épique](docs/FORGE_RARE_EPIQUE.md).
[État intégré et publication](docs/ETAT_PROJET.md) · [Carte des tests](docs/CARTE_TESTS.md).

Jeu solo de cartes tactiques fantasy, web et hors ligne : 76 cartes illustrées,
quatre classes, campagne, Tour et trois donjons. GitHub est la source officielle.

## Jouer

Dans l’arène peinte, votre classe apparaît sur le socle de gauche. Les douze adversaires de campagne et les quatre Gardiens du Sceau de la Tour ont chacun un visuel sur le socle de droite, accessible en faisant défiler le plateau sur mobile. Désactivez les animations depuis le combat pour garder une pose fixe. [Héros du joueur](docs/HEROS_COURONNE_2026_11_07.md) · [Héros adverses](docs/HEROS_ADVERSES.md).

Les cartes dessinées reprennent le filet intérieur de rareté de 4 pixels (renforcement par PR 97 après PR 87) : main, plateau, Collection, fiches et autres vues, avec les mêmes dimensions et couleurs.

- [Portée du Feu follet](docs/ETHER_PORTEE_FEU_FOLLET.md) : cette proposition applique trois cases à ses six raretés, avec un tir arrêté par la première unité rencontrée sur sa ligne.

- Impact de zone : cible secondaire uniquement immédiatement derrière la cible principale, sans case vide, dans le sens de la frappe ; voir le [contrat de ciblage](docs/IMPACT_ZONE_2026_11_02.md), intégré à main par la PR 73.

- `index.html` / `npm run dev` : jeu web modulaire ; publication sur Sites après fusion.
- `JOUER.html` : **unique export jouable**, complet et autonome sans réseau.
- `tests/JOUER.test.html` : diagnostic automatisé seulement, jamais distribué.

« Épreuves » annonce les conditions et récompenses de trois
évolutions Rares, puis du Milicien Épique après le premier boss. Accomplir son défi et gagner avec le même
exemplaire vivant transforme un seul exemplaire et
conserve sa place dans le deck. Une défaite ne consomme rien. Les cartes gagnées
sont utilisables en campagne ; la fusion ouvre sur main 41 évolutions Aube, 48 Sylve, 43 Ombre et 39 évolutions Forge supplémentaires. Éther dispose de 32 évolutions sur main, dont quatre Éveillées. La [proposition des dernières Éveillées](docs/ETHER_DERNIERES_EVEILLEES.md) porte ce total à 39. Les rangs Divin/Éveillé exigent les grandes ascensions communes de leur faction. Le laboratoire reste disponible pour les tester.

Le catalogue impose un **délai de base minimum de 1** : huit unités passent
de 0 à 1, sans modifier les délais supérieurs ni l'attente effective à la pioche
(`max(0, délai - 1)`). Elles restent jouables immédiatement ; les decks
automatiques conservent leurs compositions historiques.

Le plateau, les cartes et le moteur sont communs. Les nouveaux combats utilisent
les tours alternés : poser jusqu’à deux cartes, valider, puis regarder ses unités
agir et l’IA jouer. Les anciens combats actifs incompatibles demandent une relance sans perte du profil.

## Ciblage direct et effets

Sélectionner un sort, cliquer une carte autorisée, lire l’aperçu puis **Lancer le
sort**. Les contours verts désignent les cibles autorisées ; les contours dorés
montrent toutes les cartes concernées. Annuler, Échap ou une autre carte permet
de changer d’avis sans consommation. Les boutons de ligne restent utiles pour
les lignes vides, les pièges et les téléportations. Les sorts automatiques
présentent directement leur confirmation.

Les priorités existantes restent obligatoires : premier ennemi, cible du silence,
allié le plus blessé. Le moteur calcule l’aperçu sur une copie du combat.
**Les sorts sont immédiats après confirmation ; les unités attaquent après
validation du tour.** Aucun rééquilibrage ni changement d’IA.

Contact avec avancée/retour, tir avec projectile, magie selon les cinq ordres,
soins ascendants, barrières et états actifs rendent les actions visibles.
L’ordre et les résultats sont ceux du moteur. Vitesse ×2, Passer, mouvement réduit
et désactivation des animations restent disponibles. Le résultat réel est
sauvegardé avant les effets ; une interruption ne rejoue aucune attaque.
[Contrat et vérifications](docs/CIBLAGE_EFFETS_COMBAT_2026_10_23.md).
Le ciblage et ces effets sont intégrés sur GitHub depuis la PR nº 40.

## Concorde

Deux unités alliées du même Ordre sur la même ligne gagnent chacune +1 ATQ.
La carte elle-même compte parmi les deux ; davantage d’unités ne cumule pas ce
bonus. Il disparaît lorsque la formation cesse ; les sorts en sont exclus.

Le jeu éclaire discrètement l’emblème déjà peint **en haut à droite**
des cartes concernées. La lumière est fixe et localisée. Aucun nouveau dessin : les
illustrations et leurs reçus sont conservés. La variante à emblèmes neufs au
centre envisagée dans l’audit reste historique, sans import automatique.
[Contrat et validation](docs/CONCORDE_2026_10_24.md).

### Repères de camp

Les repères sont un petit rond bleu pour vos unités et un losange rouge
pour les adversaires, à côté de chaque carte. Les fiches main/plateau/Collection
affichent une ligne : **☀ Bonus de faction : +1 attaque**, avec le symbole de
l’Ordre en tête. Le bonus inactif est grisé et marqué « inactif » ; la lumière
de Concorde sur l’image est conservée.
[Contrat et reprise](docs/REPERES_CAMP_FICHES_2026_10_24.md).

### Collection — six cartes et aperçu rapide

Pour chaque unité, la Collection conserve **six emplacements de rareté côte à côte**. Sur la carte, le descriptif reste court ; au **survol**, une fiche synthétique indique les statistiques et pouvoirs de la version affichée. Le focus clavier et le toucher donnent accès au même aperçu directement depuis la carte, **sans bouton de fiche ajouté**. Les versions Aube, Sylve, Ombre, Forge et Éther définies montrent leurs chiffres et leurs stocks réels : les versions livrées sont accessibles par fusion ; leurs fiches précisent aussi les paquets ou épreuves disponibles. Les Divines/Éveillées définies indiquent « Ascension requise » avant le défi commun correspondant. Les rangs inférieurs inexistants et les évolutions encore « À concevoir » restent sans statistiques inventées. La même fiche sert à la main, au plateau des deux camps, aux decks, Atelier/Alchimie, paquets, récompenses et laboratoire. Sur mobile, le premier toucher consulte ; le second sur la même carte de main sélectionne, avant de choisir une case de pose. [Contrat de présentation](docs/AUBE_PRESENTATION.md).

## Progression et sauvegarde

### Composer son deck

**Mon deck** dans la navigation permet de choisir librement ses cartes possédées :
recherche, filtres par Ordre/type et boutons +/−, quantités disponibles et compteur
de 12 à 24 cartes. Le deck s'enregistre automatiquement. Les compositions proposées
restent une aide facultative, repliée en bas de l'écran. Les modifications sont
bloquées pendant un combat. Après une victoire ou une défaite en campagne ou dans la Tour, le bouton « Modifier mon deck » ouvre directement cet écran. [Fonctionnement](docs/DECK_MANUEL_2026_10_27.md).

La Collection, les classes, les maîtrises, équipements, talents et donjons sont
conservés. Le bouton Développeur ouvre un laboratoire utilisant le même moteur,
sans récompense ni écriture dans l’aventure. Le laboratoire peut tester les **51 versions définies des dix unités Aube**
et les **59 versions Sylve** jusqu'à Éveillée, à leurs niveaux 0 à 3 choisis indépendamment.
L’Ombre compte 54 versions définies, dont onze natives. Forge en compte 49, dont dix natives. `main` définit 36 versions Éther, dont les [Divines d’Impact](docs/ETHER_DIVINS_IMPACT.md). Le Feu follet natif a une portée de 2 et ses évolutions une portée de 3. Les quatre récompenses pilotes se gagnent dans les Épreuves.
Les grandes ascensions ouvrent les Divines et Éveillées définies, sans carte offerte ni consommation du deck. Le [lot des dernières Divines](docs/ETHER_DERNIERES_DIVINES.md) est intégré. Les [premières Éveillées](docs/ETHER_PREMIERES_EVEILLEES.md) s’obtiennent après L’Éveil des Hautes Sphères, accessible après la mission 12 et l’ascension Divine Éther. Les paquets d’évolution Aube, Sylve, Ombre, Forge et Éther offrent chacun trois cartes pour 125 or après le premier boss. Chaque carte a 60 % de chances d’être une carte de base de la faction, 35 % une évolution Rare et 5 % une évolution Épique. Le Mystique coûte 95 or. [Migration des factions](docs/REPRISE_MIGRATION_CARTES.md) · [Forge Rare/Épique](docs/FORGE_RARE_EPIQUE.md). La PR Aube nº 53, avec sa présentation commune et sa
[revue finale](docs/REVUE_AUBE_PR53_2026_10_27.md), a été fusionnée sur accord du
propriétaire le 27 octobre 2026. La publication du site reste une opération distincte.

La sauvegarde est locale à l’appareil et à l’adresse utilisée. Guide permet
l’export/import du profil. Les clés historiques et les combats repris sont
conservés ; aucune réinitialisation ou migration implicite.

### Protection des sauvegardes

Si le profil local ne peut pas être lu, le jeu affiche un écran de récupération :
aucune partie vierge n'est enregistrée à sa place. Exportez les données brutes
avant d'importer une sauvegarde JSON valide. Si le stockage est indisponible,
rétablissez-le dans le navigateur puis rechargez. Le deck peut rester vide pendant
sa construction ; les profils historiques lisibles restent compatibles.

Fabrication, équipements, talents, alchimie, deck et événements de donjon ne
confirment désormais une action qu'après sauvegarde réussie. En cas d'échec,
les ressources, les copies et le profil actif restent inchangés. Aucune clé de
sauvegarde ou règle de combat modifiée. La protection est intégrée ; le statut de publication est suivi dans [l’état courant](docs/ETAT_PROJET.md).

Le correctif proposé dans [le suivi d'audit](docs/AUDIT_CAMPAGNE_IA_2026_10_31.md)
étend aussi la protection des résultats en attente à la campagne, à la Tour et
aux donjons. Si l'enregistrement d'une victoire ou défaite échoue, les actions
qui remplaceraient ou modifieraient l'aventure retentent d'abord sa clôture,
sans lancer le nouveau combat ni importer un autre profil. Navigation et export
restent disponibles. Une fois le résultat enregistré, les actions sont libérées.

## Développer et vérifier

```sh
npm test
npm run test:parity
npm run build
npm run build:test
python3 tests/browser_concorde.py
python3 tests/browser_spell_targeting.py
python3 tests/browser_combat_fx.py
python3 tests/browser_evolution_trials.py
```

La CI couvre également images, interfaces bureau/mobile simulé, anciennes
sauvegardes, laboratoire, reprise et hors réseau. Pour une PR ne modifiant
que des fichiers Markdown à la racine ou dans `docs/`, seuls le contrôle
de portée et ses tests légers tournent ; les deux jobs restent présents.
Tout autre changement en PR, et tout push sur `main`, gardent la suite complète
et le paquet de diffusion nécessaire à Sites.
[Contrat de CI](AGENTS.md#tests-et-ci) · [Couverture et limites](docs/CARTE_TESTS.md).
Un résultat ancien ne valide pas automatiquement un nouveau commit. Le builder découvre les modules importés et
les feuilles reliées par index.html ; ne jamais éditer JOUER.html à la main.
Aucune bibliothèque de jeu externe n’est nécessaire.

Lire [l’état courant](docs/ETAT_PROJET.md), [AGENTS](AGENTS.md),
[l’architecture](docs/ARCHITECTURE_MODULAIRE_V2_6.md),
[la Bible](docs/BIBLE_DU_JEU.md) et [les styles](styles/README.md).
Les notes de versions antérieures dans docs sont historiques ; leurs statuts
ne remplacent pas le main et les PR réels. Une évolution, une branche, une PR ;
chaque fusion exige un accord explicite et spécifique du propriétaire.

## Graphismes et publication

Les 76 images importées, le plateau peint, les cadres et leurs reçus ont été
préservés par les PR nº 44 et 45. L’atelier est
[floiaassistant-design/couronne-et-arcanes-art](https://github.com/floiaassistant-design/couronne-et-arcanes-art).
Toute nouvelle image demande son mapping et sa provenance vérifiés ; aucun
ancien lot ne doit être restauré implicitement.

Sites héberge le jeu depuis la distribution de main ; la fusion seule ne prouve
pas sa publication. Réutiliser le Site et le workflow existants :
[procédure de publication](docs/PUBLICATION_WEB_2026_10_23.md).

Le [Marteau Légendaire](docs/FORGE_MARTEAU_LEGENDAIRE.md) est intégré par PR 81 et ajoute Coup de masse : recul après blessure au contact, sans attaque supplémentaire. Sa publication est suivie séparément.

La [PR 82 Forge — hauts rangs et blindages](docs/FORGE_HAUTS_RANGS_BLINDAGES.md) a intégré huit versions Divines/Éveillées du Marteau, du Foreur, du Colosse et du Marchefer, avec deux ascensions communes. Les pouvoirs et recettes du Golem et des autres hauts rangs restent distincts.

Le lot intégré [Forge — dix hauts rangs tactiques](docs/FORGE_HAUTS_RANGS_TACTIQUES.md) ajoute les Divines/Éveillées du Sapeur, de l’Ingénieure, du Mécaniste, du Canon et de l’Alchimiste, avec leurs pouvoirs. Les ascensions Forge ouvrent dix recettes par rang depuis l’intégration du Golem par PR 85.
