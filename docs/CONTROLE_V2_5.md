# Contrôle de livraison — V2.5

- Moteur : `npm test` **106 réussis / 106**.
- Parité : `npm run test:parity` — **60 instantanés de combat identiques** à la V2.4 (campagne, Tour et 4 classes).
- Génération : `npm run build` — **16 modules encapsulés** ; 12 portraits WebP inclus en data URI dans `JOUER.html`.
- Génération de tests : `npm run build:test` — HTML séparé ; jamais distribué comme la version joueur.
- Chromium : `tests/browser_production_v25.py` réussit à 1366×768 et 390×844, sans erreurs JS ; illustrations chargées sans réseau et aucune variable interne accessible publiquement.
- Chromium : `tests/browser_smoke.py`, `tests/browser_talent_balance_v24.py`, `tests/browser_events_v20.py` réussis sur bureau/mobile simulés. Les vérifications des anciens donjons, talents et VFX ont également été effectuées lors de la refonte des modules.
- Sauvegarde : clés persistantes inchangées, ancienne façade API préservée, aucune modification volontaire des règles, taux, objets ou récompenses.
- Limites : ces tests ne prouvent pas l'absence totale de régressions et ne remplacent pas un essai sur téléphone physique. Le générateur de modules gère les syntaxes ES utilisées dans le projet, pas toutes les syntaxes ES possibles.
