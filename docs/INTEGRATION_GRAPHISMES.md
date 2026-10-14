# Intégration graphique — pilote Illustrée v3

Note source : https://github.com/floiaassistant-design/couronne-et-arcanes-art/blob/main/handoffs/moteur/INTEGRATION_GRAPHISMES.md

- **Base jeu** : `b8aafa290b4df9412e5ab5e4a9678614956b5038` (PR nº 14 fusionnée ; PR nº 11 distincte et ouverte).
- **Révision art** : `fbbcbe8db38d8708580f5faf449cf8e68857d9cb`, PR art nº 8 ; cadre v3 en *review*, non approuvé définitivement.
- **Portrait approuvé** : Arbalétrière de l'Aube, `exports/creatures/arbaletriere_aube.webp`, 512 × 768, 134 904 octets ; SHA-256 `31186adc9ea55c4d34777f70f8b5fe2969a1ea0386a74d1cf44183e931c391a3`. Reçu : `references/approvals/arbaletriere_aube_2026-10-12.json` du dépôt art.
- **Mapping** : seul `archer` utilise `arbaletriere_aube`, `archer.webp` conservé pour `skill_ranger_pierce`. Pas de changement pour le chevalier.
- **Interface** : habillage adapté à la direction v3 sur la carte pilote ; ordre en haut à gauche, un compteur en haut à droite (délai initial collection, attente réelle dont zéro dans la main), ATQ/PV et nom. Capacité abrégée « Portée 2 » en collection ; description complète dans les données et la fiche. Survol et focus ouvrent les détails ; toucher une carte prête la sélectionne et affiche sa description, toucher une carte en attente affiche uniquement sa description. Aucun bouton ne masque le portrait. Échap ou la croix du bandeau ferment la fiche sans poser de carte. Deck, maîtrise, XP, bonus et commandes conservés.
- **État actualisé le 14/10/2026** : PR nº 15 fusionnée sur autorisation explicite, commit `f896a0c3`. La PR nº 16 intégrée au main `0310fa6` fournit les statistiques d'invocation partagées et une fiche lisible pour toutes les cartes. Tests locaux bureau/tactile portrait/paysage, vraie mission et export hors réseau exécutés ; revue du joueur en partie encore utile. Les animations et le carreau corrigé restent une mission distincte.

Contrôles requis : npm test, npm run test:parity, npm run build, JOUER.html hors réseau, bureau/mobile, attente 0/1/2, clavier/tactile, pose et reprise d'ancien combat. Seuls les contrôles réellement exécutés feront foi. Les corrections de statistiques sont intégrées ; la PR d’animation exige son propre accord de fusion. Voir `STATISTIQUES_CAPACITES.md`.

## Proposition — animation illustrée

L’unité `archer` utilise les séquences approuvées de l’atelier dans une proposition distincte : voir `ANIMATIONS_ARBALETRIERE_MOTEUR.md`. Le portrait et le cadre restent inchangés. La PR nº 17 des cinq portraits est séparée ; la conserver lors d’une intégration combinée.
