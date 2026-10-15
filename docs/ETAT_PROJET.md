# Proposition en cours — combat immersif, 15 octobre 2026

- Main officiel vérifié : `0310fa677947e34a02bd877f5adc6104267f87ba` ; PR nº 17 et nº 18 ouvertes, non fusionnées, PR nº 11 distincte. Le reste du document conserve le checkpoint de la PR nº 18.
- Branche `feat/arene-immersive-effets` depuis la PR nº 18 `3a6f928a25caf45604965bcddf1e6181d31c31ad`. Nouvelle proposition de composition à examiner : décor pleine surface, main flottante, HUD compact et journal repliable.
- Arbalétrière peinte 140 px (au lieu de 176), pieds inchangés ; ancien 3×5 à 96 px conservé. Carreau : neuf rayons dorés et cercle bleuté à l’impact, 380 ms, référence art `d193b762c662fbaad4bb32db6e5d9d83b1938a7b`. Aucune image, règle, IA ou sauvegarde modifiée.
- Contrôles locaux : 264 tests Node, 60 parités historiques, builds normal/test ; Chromium sur bureau 1366×900, portrait 390×844 et paysage 844×390 pour composition, journal, fiche, vrai tir/impact et interruption. CI complète et copie combinée avec les cinq portraits de la PR nº 17 à vérifier sur la nouvelle PR.
- Contrat, périmètre et limites : `COMBAT_IMMERSIF_2026_10_15.md`. Aucun téléphone physique testé. Une autorisation spécifique reste nécessaire pour chaque fusion.

---

# Couronnes & Arcanes — reprise du 15 octobre 2026

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
- **CI confirmée le 15/10/2026 :** [#38697938861](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/38697938861), réussie sur `304f74045291cb8bdd16073fbcf2fa29c26b620e` : 263 tests Node, 60 parités historiques identiques, builds normal/test et export synchronisé ; dix suites Chromium, 20 480 simulations de contrôle et 6 144 comparaisons d’arène. Aucun navigateur local ni téléphone physique testé dans cette reprise.
- **Blocage résolu :** le test du tir indisponible comptait aussi l’acteur au repos, dont l’atlas était disponible. Le contrôle cible désormais les acteurs en tir et vérifie une requête réellement bloquée, l’image fixe décodée et visible, et l’atlas masqué. Le moteur, le lecteur et les textures n’ont pas été modifiés par ce correctif.
- **Aperçu combiné vérifié avec PR nº 17 `2e7391669843a96a848104c88e0164234b612453` :** 266 tests, 60 parités, parcours des cinq portraits et du pilote animé sur bureau/mobile portrait/paysage, production hors réseau/reprise/mouvement réduit et atlas de tir indisponible réussis. `JOUER.html` régénéré : 4 986 888 octets, 27 modules, 18 portraits et six textures unitaires. Cette copie de contrôle ne fusionne aucune branche.
- Le workflow ne livre désormais l’artefact combiné qu’après le succès des contrôles et y joint `JOUER.sha256`. Les documents des deux PR et l’export devront être réconciliés lors d’une intégration autorisée.
- Contrat, provenance et limites : [ANIMATIONS_ARBALETRIERE_MOTEUR.md](ANIMATIONS_ARBALETRIERE_MOTEUR.md). Manifeste : `assets/units/arbaletriere_aube/manifest.json` ; reçu humain conservé dans `docs/art-approvals/`.

## Suite

Les PR nº 17 et nº 18 restent ouvertes et non fusionnées. Faire examiner l’aperçu combiné et le pilote animé dans la vraie bataille sur bureau/mobile avant une décision spécifique pour chacune. Les séquences restent des poses peintes approuvées, avec leurs limites de marche/contours et une défaite sur un genou. Le chevalier, le reste du catalogue et le prototype Blender restent distincts. Audit du rythme/attrition avant tout nouvel équilibrage ou donjon.

Une branche et une PR par évolution ; accord explicite et spécifique avant chaque fusion, aucun auto-merge.
