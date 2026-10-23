# Laboratoire de combat intégré — proposition du 23 octobre 2026

## Objectif
Une commande **Développeur** dans la navigation ouvre un simple écran de préparation des batailles de test. Aucune authentification dans cette version locale/hors ligne. Aucune deuxième copie du jeu ni second moteur : la bataille se déroule dans le plateau, les vues, les règles et l'IA habituels. Le seul export distribuable reste `JOUER.html`.

## Utilisation
- Deux decks indépendants de 12 à 24 cartes, y compris des cartes non possédées. La classe du héros et le style tactique de l'IA peuvent être sélectionnés.
- Choisir un camp et une carte, l'ajouter ou la retirer, puis régler ses niveaux. Les sorts utilisent toujours leurs règles actuelles, sans niveau inventé.
- Les cartes hors Milicien peuvent tester leurs améliorations existantes de niveau 0 à 3. Les raretés supérieures **ne sont pas** simulées sans règle validée : les menus les bloquent.
- Pour le Milicien uniquement, les cinq paliers Commune, Rare, Épique, Légendaire et Divine sont des **hypothèses de laboratoire** : niveaux 0–3 pour Commune, 1–3 ensuite ; attente 0 ; attaque 2 → 5 avec les améliorations existantes ; PV maximum 10 au rang Divin III hors maîtrise/équipement ; réduction de 1, 2 ou 3 du premier dégât reçu selon le palier, et contre-attaque unique de 1 au contact dès Divin II. Les bonus ne se cumulent pas entre raretés.
- Le Milicien conserve exactement la même carte dessinée et le même cadre quel que soit le palier testé. L'Éveillée est hors périmètre.

## Isolation
- La configuration et la bataille de laboratoire sont **uniquement en mémoire**. En cas de rechargement, le jeu reprend la dernière partie normalement sauvegardée ; aucun état de labo n'est écrit dans les clés `couronnes_arcanes_v1` ou `couronnes_arcanes_bataille_v1`.
- La partie du joueur demeure en mémoire pendant le test ; un bouton permet de la retrouver. Les actions de sauvegarde, récompenses, progression, achat ou changement de deck réel sont écartées en laboratoire.
- Une bataille terminée n'accorde ni expérience ni ressources. Il reste possible de revoir les paramètres et de relancer autant d'essais que souhaité.
- Le moteur `src/engine/battle.js` ne consulte jamais le DOM. Il active l'effet pilote uniquement lorsque `mode === 'developer'`, avec un bloc de réglages éphémère `labStats`. Les combats normaux, anciens profils et géométries 3×5 conservent le calcul historique.
- L'UI est dans `src/ui/developer-lab.js`, sa disposition dans `styles/pages/developer-lab.css`, la configuration pure dans `src/engine/developer-lab.js`, et l'orchestration de navigation dans `src/app.js`. Aucun nouveau stockage ni clé graphique.
- Le mode laboratoire n'est pas une protection d'accès : le bouton est volontairement visible dans le jeu hors ligne.

## Contrôles attendus sur la PR
Exécuter `npm test`, `npm run test:parity`, `npm run build` et `npm run build:test`. Examiner la CI sur le commit exact ; vérifier en navigateur l'entrée/sortie du labo, la pose alliée, la phase IA visible, le retour aux sauvegardes, la présentation desktop/mobile, les animations désactivées, et `JOUER.html` sans réseau. Les résultats effectifs doivent être rapportés séparément des contrôles non effectués.

## Limites
Le laboratoire n'est **pas** un système d'évolution prêt à débloquer avec XP/éclats. Les coûts, le rythme d'expérience et les pouvoirs des autres personnages doivent être conçus et équilibrés par groupes de délais. Les niveaux supérieurs du Milicien ne sont qu'une proposition jouable, à ajuster avant intégration à la progression normale. Aucun droit graphique supplémentaire ni nouvelle image n'est nécessaire.

**Fusion** : la PR est livrée pour revue, aucune fusion sur main sans accord explicite et spécifique.