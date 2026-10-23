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
