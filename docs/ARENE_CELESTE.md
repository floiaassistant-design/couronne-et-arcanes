# Arène céleste pixel art — proposition graphique (12 octobre 2026)

**Statut : branche `feat/arene-celeste-pixel-art`, pas encore fusionnée.**

## Provenance, validation et intégration
Illustration originale générée dans cette conversation spécialement pour Couronnes & Arcanes le 12/10/2026. Le propriétaire a demandé son intégration, puis confirmé « Ok vas-y » : cette validation porte sur cette image uniquement et ne concerne pas les autres ressources de l'atelier. Aucun asset tiers importé ni personnage remplacé.

- Fichier original : `arène_céleste_des_royaumes_rivaux.png`, **1672×941**, **3 325 171 octets**, SHA-256 `94c3833264e75eb7e901925121e5e271244be2130745df4227d5d65277c5499d`.
- Export : `assets/backgrounds/arena-celeste.webp`, 1200 px de large, WebP qualité 68, **184 398 octets**, SHA-256 `7915dc75d438fe371f5b9e6e00d9fbcc33d44a171cab90d7b7503dfdf32f09d1`.
- Destination : fond CSS non interactif du plateau en arrière-plan des **vraies cases, unités et couronnes**, sur formats actuels et sauvegardes anciennes. Aucun identifiant visuel de `src/visuals.js` ajouté.
- `styles.css` référence l'export local dans le jeu modulaire. `scripts/build_standalone.mjs` intègre ses octets en base64 à l'export `JOUER.html`, garantissant l'affichage hors réseau. Ne jamais éditer cet export directement.
- Les animations continuent de dépendre des réglages existants et de `prefers-reduced-motion`; le décor est entièrement statique.
- La composition s'adapte au nombre de lignes par `background-size:cover` : parties des bords éventuellement recadrées selon la hauteur et la largeur.

## Périmètre et contrôles
Aucun changement de moteur, IA, statistiques, règles, progression, sauvegarde ou portrait partagé. Test dédié `tests/arena_celeste.test.mjs`. Avant fusion : `npm test`, `npm run test:parity`, `npm run build`, contrôle CI de synchronisation de `JOUER.html`, parcours navigateur bureau/mobile et sans réseau. Les PR du dépôt `couronne-et-arcanes-art` ne sont pas modifiées. La revue humaine du cadrage sur téléphone physique reste nécessaire.
