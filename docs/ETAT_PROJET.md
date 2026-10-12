# Couronnes & Arcanes — V2.11 proposée

- **Version officielle de départ : V2.10 sur `main`, commit `a59dd3a91a9c1c7101dee8e2048d9d3fff2e0dc5`.** Vérifier le dépôt avant chaque reprise.
- Branche `feat/arena-fantasy-lofi`, V2.11.0. La demande autorise une PR **sans fusion automatique**. `main` conserve la version officielle tant que cette PR n’est pas intégrée.
- Arène fantasy lo-fi : dix cases réelles par ligne, 2 lignes en duel, 3 dans les rencontres avancées, 4 pour les boss solo. 76 cartes et fonctionnalités V2.8–V2.10 conservées.
- Géométrie pure `src/engine/board.js`, art original en pixels `src/ui/arena-art.js`, 22 modules. Pas de changement des stats, decks adverses, récompenses ou délais.
- Les anciens combats 3×5 reprennent sans conversion ; nouveaux combats 2/3/4×10. Clés historiques et profil conservés ; VFX exclus des sauvegardes.
- Contrôles locaux : 210 tests Node, 60 parités, build autonome synchronisé, Chromium bureau/portrait/paysage, V2.8 et V2.9 réussis. Aucun téléphone physique testé.
- Mesures : 6 144 simulations comparatives rejouées à l’identique + 20 480 scénarios de contrôle. Zéro état invalide ni blocage ; nouveau plateau plus lent (19,4 contre 12,7 tours), attrition plus fréquente. Rapport `ARENE_V2_11.md`.
- Prochaine étape : revue de la PR et contrôle de sa CI, puis décision d’intégration. Ensuite tester le rythme avec des joueurs avant d’ajouter le donjon tactique V3.0.

GitHub est la source de vérité ; aucune archive ne doit écraser une version plus récente.
