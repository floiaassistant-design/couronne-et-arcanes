> **Dernière mise à jour V1.8** : le projet comprend déjà la Tour (20), 60 cartes, 4 classes, équipement, alchimie, Concorde, Vol/Garde, Charge/Riposte et une IA tactique heuristique avec personnalités Assaut/Bastion/Rituel/Meute et phase Furie des boss dans `src/ai.js`. Ne pas les recréer. Vérifier l’inventaire historique et les 59 tests.

# Mission principale à donner à ChatGPT Work / Codex

## Point de départ
Le dossier contient une application web **déjà jouable** en solo : `JOUER.html` pour jouer immédiatement et `src/` pour travailler sur le code. Lire obligatoirement `README.md`, `AGENTS.md` et `docs/BIBLE_DU_JEU.md` avant toute modification.

## Objectif
Développer **Couronnes & Arcanes**, jeu indépendant original inspiré du genre CCG tactique à trois lignes, jusqu’à une expérience aboutie, attractive et intuitive, sans nécessiter de programmation de la part de l’utilisateur. Il veut principalement découvrir les versions jouables, tester et donner son avis. Les choix techniques et les sous-tâches doivent être décidés de manière autonome, mais le concept fondamental doit rester stable.

## Consignes à l'orchestrateur

1. **Premier contrôle :** lancer les tests, ouvrir le jeu dans un vrai navigateur, terminer au moins une mission (victoire ou défaite), vérifier deck, atelier, profil, sauvegarde et mobile. Noter toute anomalie observée.
2. **Sauvegarder le projet dans GitHub** : commits lisibles, branche dédiée et PR pour chaque évolution ; maintenir une version stable sur `main`. **Ne jamais fusionner automatiquement : attendre l'accord explicite de l'utilisateur sur chaque PR, même avec tests verts.** Une autorisation de coder n'est pas une autorisation de fusionner. Ne pas activer Auto-merge ou un bot de fusion. Ne jamais prétendre avoir poussé un commit non confirmé.
3. **Privilégier les résultats complets :** résoudre plusieurs tâches cohérentes dans une session plutôt qu'un changement cosmétique isolé. Ne pas créer 20 agents ou 10 fichiers de gestion redondants.
4. **Priorité visuelle :** transformer les glyphes provisoires en de **véritables cartes illustrées originales**, puis les unités de plateau en sprites animés, effets de projectile et environnements ; produire un style cohérent d’abord sur une petite sélection avant de généraliser.
5. **Priorité gameplay :** tester et équilibrer l’ensemble des 12 missions et 60 cartes, fiabiliser les pouvoirs, empêcher les blocages, ajouter un tutoriel interactif et rendre le combat plus lisible.
6. **Progression ensuite :** étendre le jeu à partir d'une architecture data-driven, ajouter des effets, sorts, deck synergies, donjons et boss originaux, puis envisager une ville interactive.
7. **Multijoueur uniquement sur validation :** ne pas annoncer PvP/coop comme existants ; exiger une étude backend, sécurité, hébergement, coût et anti-triche avant de les réaliser.
8. **Gestion des quotas :** à la fin d'une session, valider les tests, faire un commit, laisser un état précis dans GitHub (issues ou fichier de suivi court) et préparer l’étape suivante. Reprise depuis GitHub et AGENTS.md, pas depuis une conversation géante.

## Tests minimum après chaque modification

```bash
node --test tests/*.test.mjs
python3 -m http.server 8080
# Puis ouvrir http://localhost:8080 dans un navigateur
```

Exigences : aucune erreur JavaScript, combat et progression sans blocage, deck valide, ressources non négatives, import/export compatible, fonctionnement sur petit écran. Élargir les tests avec Playwright (ou autre navigateur automatisé) si disponible.

## Critères de satisfaction du joueur
- Le jeu a **un vrai style fantasy**, pas des maisons rudimentaires, des cases vides ou des chiffres sans personnages.
- Le jeu est **immédiatement compréhensible**. L’IA propose un tutoriel sans demander au joueur d’apprendre le code.
- Chaque session livre une version visiblement améliorée et testée.
- Les règles sont cohérentes : les cartes puissantes ont des contreparties, les adversaires ne trichent pas en mode compétitif.
- L’utilisateur peut jouer dans son navigateur sur PC et, autant que possible, sur son téléphone.

## État vérifié au moment de la livraison
- Les tests `node --test` du moteur : **49/49 réussis**.
- Parcours Chromium Playwright : chargement citadelle, ouverture mission, sélection et pose d'une carte, résolution d’un tour, abandon et résultat, retour campagne ; aucune erreur JavaScript dans ce parcours.
- **Non vérifié :** campagne intégrale manuelle, équilibre complet de toutes les cartes, performances sur de vrais smartphones, publication en ligne, qualité graphique commerciale. Les illustrations actuelles sont 12 portraits partagés et animés en CSS, sans sprites individuels multi-images.

## Ne pas confondre avec un autre projet
Ce projet de CCG est **distinct** de *Les Chroniques du Royaume* (city-builder isométrique Godot). Ne pas écraser ce jeu ou sa Bible Notion et ne pas les fusionner automatiquement.


## Dernier développement intégré : V1.3

Le moteur possède une trace d’événements visuels **facultative** (`battle.vfx`) qui ne doit pas être conservée dans les sauvegardes. Le rendu `src/app.js` transforme ces événements en animations HTML/CSS via la surimpression `.battle-vfx-overlay`. Prochain objectif : sprites de créatures originaux, animations image par image et combats plus lisibles sans modifier l’équilibrage. Contrôles : `npm test`, `npm run build`, `python3 tests/browser_smoke.py`, `python3 tests/browser_vfx.py`.

## Dernier module V1.7
`src/ai.js` regroupe l’analyse non mutante du plateau et le classement des décisions possibles avec leurs motifs. Ne pas reconstruire une IA parallèle dans `engine.js`. Respecter la limitation à deux cartes par tour, les cases d’entrée occupées et les délais d’invocation. Les cartes de la main du joueur sont privées et ne doivent pas être lues pour décider. Les tests `tests/ai_v17.test.mjs` et `tests/browser_v17.py` vérifient ce comportement. La prochaine étape doit tester l’équilibrage de nombreuses parties, pas uniquement augmenter le nombre de règles.
