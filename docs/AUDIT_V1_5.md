# Audit de Couronnes & Arcanes V1.5 — 2026-10-11

## Contrôles
- `npm test` : 31/31 tests réussis, y compris 2 nouvelles vérifications des limites de Vol et Garde.
- `python3 tests/browser_smoke.py` : contrôle navigation, campagne, deck, tour, forge et affichage mobile.
- `python3 tests/browser_vfx.py` : flèches, sorts, réglage des animations, ancien profil.
- `python3 tests/browser_creatures.py` : images hors ligne, sprites représentés sur le plateau, mobile.
- `python3 tests/browser_traits.py` : étiquettes Vol/Garde/Perforation, entrée en combat, unité historique dépourvue de nouveaux attributs.
- Export HTML autonome et ZIP : génération/relecture et intégrité de l’archive.

## Constats et correctifs
1. **AGENTS.md et ETAT_PROJET.md restés à V1.4** alors que la V1.5 était livrée. Corrigés en V1.5.1.
2. **Vol ambigu dans les descriptions** : saute par-dessus une unité alliée quand la prochaine case est libre ; ne traverse pas les ennemis, que la créature combat au contact. Description clarifiée, moteur inchangé.
3. **Garde limité** : intercepte les coups visant directement la couronne sur sa ligne, mais ne protège pas automatiquement d’autres unités. Portée documentée ; n’en pas déduire une mécanique générale de provocation.
4. **Drive resté sur la V1.4 au moment de l’audit** : cette divergence exige l’archivage V1.4 et le dépôt du paquet audité pour le corriger.

## Limites
- Les portraits des cartes restent partagés entre 60 cartes, et leurs animations sont basées sur CSS, non sur sprites image par image.
- Les sauvegardes locales dans le navigateur ne remplacent pas une sauvegarde sur serveur ; exporter la progression avant une mise à jour.
- Aucune preuve de test humain de l’intégralité de la campagne, sur appareils physiques, ou d’équilibrage compétitif.
- Aucun dépôt GitHub créé lors de cet audit.
