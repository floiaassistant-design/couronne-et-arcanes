# Couronnes & Arcanes — reprise du 14 octobre 2026

## Main et propositions distinctes

- Main vérifié : **V2.11, `0310fa677947e34a02bd877f5adc6104267f87ba`**, PR nº 16 intégrée. Statistiques effectives et fiche de toutes les capacités déjà raccordées ; PR nº 10/12/14/15 aussi intégrées. CI main #38531495638 réussie.
- 76 cartes, quatre classes, 12 missions, 20 étages, trois donjons ; arène peinte et anciens combats 3×5 conservés. Main : 25 modules, 13 portraits.
- **PR nº 17 ouverte** : cinq portraits Aube approuvés, mappings dédiés, export 18 portraits. CI #38593719348 réussie. Aucun accord de fusion dans cette session.
- **PR nº 11 ouverte et en conflit** : ancienne proposition d’arène pixel art, indépendante de l’arène peinte actuelle. Ne pas la reprendre comme un composant manquant.

## Proposition courante — Arbalétrière illustrée animée

- Branche `feat/arbaletriere-animations-evenements` depuis le main ci-dessus. Seule l’unité `archer` reçoit son personnage peint approuvé ; les portraits/cadres de cartes, identifiants, autres unités et règles restent identiques.
- Six WebP originaux de la PR art nº 2 au commit exact `234988e2960451e5ed31ed6226175694b92da880`, 2 328 136 octets. Repos/marche/tir/impact/défaite, cadres 512×512, durées et boucles conservées, ancrage (256,461), miroir adverse, carreau à l’arme à 600 ms.
- Le lecteur suit les traces publiques des événements et annule horloges/projectiles sur navigation, nouveau rendu ou mouvement réduit. Vue illustrée fixe lorsque désactivé, repli statique d’asset, reprise au repos. Les traces gardent les UID après disparition d’une unité et ne sont jamais sauvegardées.
- **27 modules, 13 portraits**, plus six textures unitaires dans l’export autonome régénéré. L’évolution de la PR nº 17 reste séparée ; préserver ses cinq portraits lors d’une future intégration combinée et reconstruire JOUER depuis les sources.
- **Contrôles locaux :** 263 tests Node, 60 parités historiques, builds normal/test, empreintes exactes. Parcours Chromium bureau/mobile/hors réseau et simulations à vérifier sur la CI de cette PR ; aucun navigateur local ou téléphone physique revendiqué.
- Contrat, provenance et limites : [ANIMATIONS_ARBALETRIERE_MOTEUR.md](ANIMATIONS_ARBALETRIERE_MOTEUR.md). Manifeste : `assets/units/arbaletriere_aube/manifest.json` ; reçu humain conservé dans `docs/art-approvals/`.

## Suite

Faire examiner le pilote animé dans la vraie bataille sur bureau/mobile. Les séquences restent des poses peintes approuvées, avec leurs limites de marche/contours et une défaite sur un genou. Le chevalier, le reste du catalogue et le prototype Blender restent distincts. Audit du rythme/attrition avant tout nouvel équilibrage ou donjon.

Une branche et une PR par évolution ; accord explicite et spécifique avant chaque fusion, aucun auto-merge.
