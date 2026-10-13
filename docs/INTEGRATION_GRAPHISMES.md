# Intégration graphique — pilote Illustrée v3

Note source : https://github.com/floiaassistant-design/couronne-et-arcanes-art/blob/main/handoffs/moteur/INTEGRATION_GRAPHISMES.md

- **Base jeu** : `b8aafa290b4df9412e5ab5e4a9678614956b5038` (PR nº 14 fusionnée ; PR nº 11 distincte et ouverte).
- **Révision art** : `fbbcbe8db38d8708580f5faf449cf8e68857d9cb`, PR art nº 8 ; cadre v3 en *review*, non approuvé définitivement.
- **Portrait approuvé** : Arbalétrière de l'Aube, `exports/creatures/arbaletriere_aube.webp`, 512 × 768, 134 904 octets ; SHA-256 `31186adc9ea55c4d34777f70f8b5fe2969a1ea0386a74d1cf44183e931c391a3`. Reçu : `references/approvals/arbaletriere_aube_2026-10-12.json` du dépôt art.
- **Mapping** : seul `archer` utilise `arbaletriere_aube`, `archer.webp` conservé pour `skill_ranger_pierce`. Pas de changement pour le chevalier.
- **Interface** : habillage adapté à la direction v3 sur la carte pilote ; ordre en haut à gauche, un compteur en haut à droite (délai initial collection, attente réelle dont zéro dans la main), ATQ/PV et nom. Capacité abrégée « Portée 2 » en collection ; description complète dans les données et la fiche. Survol, focus et bouton tactile d'inspection ; cliquer Fiche n'est ni sélectionner ni poser. Deck, maîtrise, XP, bonus et commandes conservés.
- **État** : position de la fiche au-dessus de la main encore à examiner sur ordinateur et mobile. Les animations et le carreau corrigé ne sont pas intégrés. Aucun changement moteur/IA/sauvegarde.

Contrôles requis : npm test, npm run test:parity, npm run build, JOUER.html hors réseau, bureau/mobile, attente 0/1/2, clavier/tactile, pose et reprise d'ancien combat. Seuls les contrôles réellement exécutés feront foi. PR non fusionnée sans accord spécifique.
