# Couronnes & Arcanes — V2.11 proposée

- **Version officielle actuelle : V2.10 sur `main`, commit `81e815271c9fa7c2cc38b11553ef925efd3b9872`**, comprenant les PR nº 7 (validation manuelle), 8 (interface) et 9 (IA tactique). Ancienne base de la proposition V2.11 : `a59dd3a91a9c1c7101dee8e2048d9d3fff2e0dc5`.
- Branche `feat/arena-fantasy-lofi`, V2.11.0. La demande autorise une PR **sans fusion automatique**. `main` conserve la version officielle tant que cette PR n’est pas intégrée.
- Arène fantasy lo-fi : dix cases réelles par ligne, 2 lignes en duel, 3 dans les rencontres avancées, 4 pour les boss solo. 76 cartes et fonctionnalités V2.8–V2.10 conservées.
- Géométrie pure `src/engine/board.js`, art original en pixels `src/ui/arena-art.js`, 22 modules. Pas de changement des stats, decks adverses, récompenses ou délais.
- Les anciens combats 3×5 reprennent sans conversion ; nouveaux combats 2/3/4×10. Clés historiques et profil conservés ; VFX exclus des sauvegardes.
- Contrôles locaux : 210 tests Node, 60 parités, build autonome synchronisé, Chromium bureau/portrait/paysage, V2.8 et V2.9 réussis. Aucun téléphone physique testé.
- Mesures : 6 144 simulations comparatives rejouées à l’identique + 20 480 scénarios de contrôle. Zéro état invalide ni blocage ; nouveau plateau plus lent (19,4 contre 12,7 tours), attrition plus fréquente. Rapport `ARENE_V2_11.md`.
- Prochaine étape : revue de la PR et contrôle de sa CI, puis décision d’intégration. Ensuite tester le rythme avec des joueurs avant d’ajouter le donjon tactique V3.0.

GitHub est la source de vérité ; aucune archive ne doit écraser une version plus récente.

## Intégration des travaux parallèles (12 octobre 2026)

- La PR nº 6 a été réconciliée sur le nouveau `main` sans modifier les règles de validation des fusions. Les fonctionnalités des PR nº 8 et 9, les tests nouveaux et le rendu des cartes sont conservés.
- `src/ai.js` utilise la géométrie réelle du plateau pour l'estimation des menaces sur la couronne et conserve les nouvelles décisions tactiques des sorts de tempo.
- `JOUER.html` a été régénéré depuis les sources combinées et contrôlé identique par la compilation GitHub Actions. La PR nº 6 reste ouverte et attend une revue humaine.
- Les mesures du plateau ont été **revalidées sur la combinaison** par la CI #38235167355 : 6 144 combats comparatifs (3 072 par géométrie), 20 480 scénarios de contrôle, aucun état invalide. 12,7 → 19,4 tours moyens et 1 806 → 1 866 victoires des bots joueurs, résultats cohérents avec l'ancien rapport ; ils ne prouvent pas l'équilibrage humain.
- Contrôles sur le commit de code `dd12378e9e5482fe3d4fa1aef4ee328137930c68` : **219 tests Node, 60 parités, build autonome synchronisé, Chromium desktop/mobile/paysage, reprises anciennes et hors ligne : tous réussis**, [CI GitHub](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/38235167355). Aucun téléphone physique testé.
- **La PR nº 6 doit rester ouverte tant que l'utilisateur n'a pas donné une autorisation de fusion spécifique.**
