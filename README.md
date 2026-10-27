# Couronnes & Arcanes

Jeu solo de cartes tactiques fantasy, web et hors ligne : 76 cartes illustrées,
quatre classes, campagne, Tour et trois donjons. GitHub est la source officielle.

## Jouer

- `index.html` / `npm run dev` : jeu web modulaire ; publication sur Sites après fusion.
- `JOUER.html` : **unique export jouable**, complet et autonome sans réseau.
- `tests/JOUER.test.html` : diagnostic automatisé seulement, jamais distribué.

Le catalogue impose un **délai de base minimum de 1** : huit unités passent
de 0 à 1, sans modifier les délais supérieurs ni l'attente effective à la pioche
(`max(0, délai - 1)`). Elles restent jouables immédiatement ; les decks
automatiques conservent leurs compositions historiques.

Le plateau, les cartes et le moteur sont communs. Les nouveaux combats utilisent
les tours alternés : poser jusqu’à deux cartes, valider, puis regarder ses unités
agir et l’IA jouer. Les anciens combats 3×5 gardent leurs règles historiques.

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

## Concorde — intégré et publié

Deux unités alliées du même Ordre sur la même ligne gagnent chacune +1 ATQ.
La carte elle-même compte parmi les deux ; davantage d’unités ne cumule pas ce
bonus. Il disparaît lorsque la formation cesse ; les sorts en sont exclus.

Le jeu éclaire discrètement l’emblème déjà peint **en haut à droite**
des cartes concernées. La lumière est fixe et localisée. Aucun nouveau dessin : les
illustrations et leurs reçus sont conservés. La variante à emblèmes neufs au
centre envisagée dans l’audit reste historique, sans import automatique.
[Contrat et validation](docs/CONCORDE_2026_10_24.md).
La PR nº 42 a été fusionnée sur accord spécifique le 24 octobre 2026, puis
publiée sur le [jeu en ligne](https://couronnes-arcanes-jeu.flo-ia-assistant.chatgpt.site)
(Sites, version 5). Le déploiement et les fichiers servis ont été vérifiés.

### Affichage simplifié — intégré et publié

Les repères sont un petit rond bleu pour vos unités et un losange rouge
pour les adversaires, à côté de chaque carte. Les fiches main/plateau/Collection
affichent une ligne : **☀ Bonus de faction : +1 attaque**, avec le symbole de
l’Ordre en tête. Le bonus inactif est grisé et marqué « inactif » ; la lumière
de Concorde sur l’image est conservée.
La [PR nº 45](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/45)
a été fusionnée le 24 octobre 2026. La CI finale et la publication automatique
Sites version 7 ont été vérifiées dans son bilan.
[Contrat et reprise](docs/REPERES_CAMP_FICHES_2026_10_24.md).

### Collection — six cartes et aperçu rapide

Pour chaque unité, la Collection conserve **six emplacements de rareté côte à côte**. Sur la carte, le descriptif reste court ; au **survol**, une fiche synthétique indique les statistiques et pouvoirs de la version affichée. Le focus clavier et le toucher donnent accès au même aperçu directement depuis la carte, **sans bouton de fiche ajouté**. Les versions Aube définies montrent leurs chiffres et le statut « Testable au laboratoire · Obtention non définie ». Les rangs inférieurs inexistants et les évolutions encore « À concevoir » restent sans statistiques inventées. La même fiche sert à la main, au plateau des deux camps, aux decks, Atelier/Alchimie, paquets, récompenses et laboratoire. Sur mobile, le premier toucher consulte ; le second sur la même carte de main sélectionne, avant de choisir une case de pose. [Contrat de présentation](docs/AUBE_PRESENTATION.md).

## Progression et sauvegarde

La Collection, les classes, les maîtrises, équipements, talents et donjons sont
conservés. Le bouton Développeur ouvre un laboratoire utilisant le même moteur,
sans récompense ni écriture dans l’aventure. Le laboratoire peut tester les **51 versions définies des dix unités Aube**
et leurs niveaux 0 à 3, choisis indépendamment. Les autres unités conservent
leur version native. Les nouvelles raretés ne sont pas offertes dans l’aventure ;
leur obtention reste à définir. Cette préparation appartient à la PR Aube en
brouillon, avec une présentation commune et une [revue finale terminée](docs/REVUE_AUBE_PR53_2026_10_27.md). La PR attend la décision du propriétaire ; elle n'est ni fusionnée ni publiée.

La sauvegarde est locale à l’appareil et à l’adresse utilisée. Guide permet
l’export/import du profil. Les clés historiques et les combats repris sont
conservés ; aucune réinitialisation ou migration implicite.

## Développer et vérifier

```sh
npm test
npm run test:parity
npm run build
npm run build:test
python3 tests/browser_concorde.py
python3 tests/browser_spell_targeting.py
python3 tests/browser_combat_fx.py
```

La CI couvre également images, interfaces bureau/mobile simulé, anciennes
sauvegardes, laboratoire, reprise et hors réseau. Pour une PR ne modifiant
que des fichiers Markdown à la racine ou dans `docs/`, seuls le contrôle
de portée et ses tests légers tournent ; les deux jobs restent présents.
Tout autre changement en PR, et tout push sur `main`, gardent la suite complète
et le paquet de diffusion nécessaire à Sites.
[Contrat de CI](AGENTS.md#contrat-ci--vérification-sélective-des-pr-documentaires).
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
