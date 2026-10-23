# Lecture des attaques — proposition du 23 octobre 2026

Branche `feat/effets-combat-lisibles-20261023`, basée sur main
`adf9c9192293ea2e25849f37a0ac11d1df08c951`. PR nº 33 (CSS) et nº 34
(export unique) réellement fusionnées ; aucune PR jeu ouverte au démarrage.
La branche de maintenance du Guide existe séparément : seul l'export généré
et les notes documentaires se recoupent, pas les modules fonctionnels.
Aucune fusion n'est autorisée par cette proposition.

## Comportement

Les actions se lisent dans leur ordre réel : carte qui avance, source soulignée,
liaison vers la cible, projectile ou frappe, PV réellement perdus après armure
et protection, puis retrait de la carte vaincue. Poison, soins, riposte, sorts,
pièges, téléportations et couronnes suivent aussi les événements.
Le bandeau nomme l'action, son camp, sa ligne et son rang dans la séquence.
Le plateau défile vers l'action sur petit écran ; vitesse ×1/×2 et bouton
Passer pour la séquence courante. Journal & détails donne le déroulé du tour
courant ou du dernier tour résolu, sans l'enregistrer dans le profil.

Le moteur calcule et sauvegarde le résultat avant la lecture. Le rendu utilise
uniquement des copies publiques intermédiaires ; la main privée adverse n'y
entre jamais. Les actions du joueur sont bloquées pendant cette lecture.
Rechargement ou sortie : le résultat enregistré reprend, sans rejouer les coups.
Animations désactivées et mouvement réduit : résultat immédiat, déroulé textuel
conservé. Les anciennes parties 3×5 conservent leurs règles.

## Structure

- `engine/combat-events.js` capture uniquement plateau, protections, PV publics
  et pièges lorsque `b.vfx` est explicitement actif. Les instantanés locaux sont
  non énumérables sur les événements pour préserver leur contrat historique.
- `engine/battle.js` émet les dégâts réellement retirés aux unités/couronnes ;
  la riposte est annoncée avant son impact. Aucun calcul, retour de `hit`,
  ciblage, ordre de règles, hasard ou décision IA n'est changé.
- `ui/combat-steps.js` transforme les événements en étapes et décrit les écarts
  observés de PV/protection, sans recalculer les dégâts. Aucun plafond de 28 actions.
- `ui/combat-fx.js` lit les étapes, place les effets sur les rectangles rendus,
  verrouille les commandes et gère vitesse, annulation et nettoyage.
- `app.js` orchestre la projection temporaire et le retour au résultat réel ;
  les sauvegardes, le moteur et le profil ne reçoivent jamais cette projection.
- `battle-view.js`, `painted-arena.js` et `styles/battle/effects.css` rendent le
  bandeau, le déroulé et les effets. Le plateau réserve la place du bandeau.

Effets procéduraux CSS/DOM et Web Animations uniquement : aucune image, ancienne
animation de personnage ou ressource atelier importée. Aucun contrat de sprites
nouveau. Les 42 cartes approuvées et leurs empreintes restent identiques.
31 modules embarqués ; `JOUER.html` unique régénéré par le builder existant.
Le moteur existant reste légèrement au-dessus de 400 lignes ; l'instrumentation
de présentation est isolée, sans nouvelle responsabilité DOM dans ce module.

## Vérification

Les assertions métier et la référence de parité existantes sont conservées.
Les parcours d'interface attendent désormais la fin visuelle, et les sélecteurs
ciblent le résumé parent lorsque le nouveau déroulé ajoute un second `summary`.
Voir la PR pour les contrôles effectués sur son commit exact.
Le test ajouté couvre armure, barrière, coup fatal, couronnes, riposte, soins
partiels, poison, absence de troncature et équivalence avec/sans événements.
Le parcours navigateur vérifie la vraie validation, les cartes intermédiaires,
le verrou, la vitesse, le défilement mobile, le journal, l'interruption et les
modes sans animation. Aucun téléphone physique ni campagne humaine exhaustive.

## Résultats locaux avant publication

- `npm test` : 308 tests réussis ; huit nouveaux tests ciblés, assertions
  existantes inchangées. `npm run test:parity` : 60 scénarios identiques.
- `npm run build` et `npm run build:test` réussis ; 31 modules et 42 images
  approuvées embarquées. L'export généré est comparé par empreinte après publication.
- 21 suites navigateur exécutées : `combat_fx`, `card_study`, `deployment`,
  `card_preview`, `art_reset`, `collection`, `milicien`, `aube`, `sylve`, `ombre`,
  `forge`, `maintenance`, `save_integrity_v211`, `arena_v211`,
  `combat_fullscreen_v211`, `card_capabilities`, `battle_control_v29`,
  `class_skills_v28`, `new_game_legibility_v211`, `illustrated_pilot_v3`,
  `painted_arena`. Les échecs de synchronisation et d'encombrement paysage ont
  été corrigés puis les suites concernées relancées avec succès.
- Chromium : bureau, portrait et paysage, export sans réseau, réduction du
  mouvement, animations désactivées, défilement vers la cible, vrais PV/protections,
  coupure en pleine lecture puis reprise sans double action. Examen visuel des
  captures bureau/portrait/paysage. Aucune vérification sur téléphone physique.
- `git diff --check` réussi ; aucune image ni clé de stockage modifiée.
- La PR nº 35 du Guide est ouverte à la fin du travail. Les modules source
  fonctionnels ne se recoupent pas ; réconcilier les notes documentaires et
  régénérer `JOUER.html` si les deux évolutions sont intégrées successivement.

Ces résultats sont locaux. La CI distante et son commit exact doivent être lus
sur la PR ; ne pas déduire sa réussite de cette liste. Aucune fusion autorisée.
