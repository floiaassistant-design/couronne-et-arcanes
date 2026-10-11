# Contrôle V1.6 — Couronnes & Arcanes

Date : 11 octobre 2026.

## Évolutions réelles
- **Charge** : huit types de cartes gagnent temporairement +2 attaque si elles se sont déplacées sur le plateau pendant le même tour. Effet applicable des deux côtés, sans ressource payante et sans cumul permanent.
- **Riposte** : sept types de cartes peuvent contrer une attaque au corps à corps si elles survivent au coup ; inflige 2 dégâts avant l'armure, une seule fois par tour. Ne s'active pas à distance ni si le défenseur est éliminé. Sans riposte en chaîne.
- Les deux capacités sont indiquées sur les cartes, dans les info-bulles du plateau, dans les règles et les journaux ; événements visuels pilotés par le moteur.
- Correction annexe : l'élimination d'une unité n'est comptabilisée qu'une fois dans le nombre de victimes, même si plusieurs coups sont simultanés.

## Tests réellement exécutés
- `npm test` : 39 tests réussis, dont 8 nouveaux pour Charge/Riposte, simulation de l'IA et compatibilité d'un état ancien.
- `python3 tests/browser_smoke.py` : parcours jeu et mobile PASS.
- `python3 tests/browser_vfx.py` : effets, désactivation, préférences d'animations réduites PASS.
- `python3 tests/browser_creatures.py` : 12 archétypes graphiques hors ligne et interactions PASS.
- `python3 tests/browser_traits.py` : anciennes capacités et affichage PASS.
- `python3 tests/browser_v16.py` : capacités réelles lors d'une bataille, journal, animations et mobile PASS.
- `npm run build` : génération HTML autonome réussie.

## Limites non résolues
- Aucun test humain exhaustif des 12 missions, de l'équilibrage compétitif ou des 20 étages de la Tour.
- Aucun essai sur un smartphone physique ; seuls des profils Chromium simulés ont été testés.
- Les 60 cartes partagent 12 illustrations par archétype ; pas d'animation image par image professionnelle.
- Multijoueur non implémenté, et aucun backend de comptes ou de sauvegardes cloud.

## Reprise
- Ouvrir `JOUER.html` pour jouer, ou `index.html` via serveur HTTP local pour le développement.
- Lire `AGENTS.md` et `docs/ETAT_PROJET.md` avant modification.
- Sauvegarde locale conservée sous les anciennes clés pour compatibilité.
