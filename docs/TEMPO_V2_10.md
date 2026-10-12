# Tempo des cartes — V2.10

Chaque carte conserve son délai `CARDS[id].delay`. À sa pioche, le moteur initialise `wait = max(0,delay-1)`; les cartes présentes en main perdent un tour d'attente à chaque nouvelle manche. Les nouveaux sorts manipulent uniquement `wait` et ne modifient ni les délais de base, ni l'économie, ni les anciennes sauvegardes.

**Élan des Heures** (rare, délai nominal 1) : réduit de deux tours la carte alliée qui a le plus grand `wait>0`. En cas d'égalité, première dans la main. Sans carte éligible, l'action est refusée avant d'être consommée.

**Nœud du Temps** (rare, délai nominal 2) : retarde de deux tours une carte adverse avec le plus petit `wait` parmi les cibles admissibles ; égalité départagée par l'ordre dans la main. Le maximum est six tours. Main vide ou toutes cartes à six tours : action refusée. L'identité ciblée n'est pas divulguée dans le journal.

Les deux sorts sont identiques pour joueur et IA ; ils consomment chacun une des deux actions de cartes de la manche. L'IA tient compte de sa propre main pour Élan des Heures, mais le score de Nœud du Temps reste fixe afin de ne jamais inspecter les cartes privées du joueur. Le moteur sélectionne la cible effective seulement quand le sort est résolu.

**Acquisition :** recette Alchimie de rare (32 or + 64 éclats) ou paquet ordinaire ; aucune monnaie réelle.

**Validation :** `npm test`, `npm run test:parity`, `npm run build`, `git diff --exit-code -- JOUER.html`, tests navigateur bureau/mobile simulé, `npm run control-balance`. Vérifier le vrai statut CI avant fusion.
