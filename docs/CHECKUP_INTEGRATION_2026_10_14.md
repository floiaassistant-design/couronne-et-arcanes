# Check-up et reprise de l'intégration — 14 octobre 2026

## Conclusion

Le dernier Work a terminé l'intégration de la PR nº 16 : `main` est à `0310fa677947e34a02bd877f5adc6104267f87ba`, avec une CI réussie. Les documents de reprise mentionnaient encore la PR nº 15 et présentaient la PR nº 16 comme en attente. Le manque confirmé concerne cinq portraits Aube approuvés dans l'atelier, encore absents du mapping du jeu.

## État vérifié

| Élément | État réel |
| --- | --- |
| Fin de combat et sauvegardes, PR nº 10 | Fusionné |
| Nouvelle aventure, classes, identification/rareté, PR nº 12 | Fusionné |
| Combat plein écran et arène peinte, PR nº 14 | Fusionné |
| Pilote Arbalétrière, PR nº 15 | Fusionné ; mapping `archer` uniquement |
| Statistiques exactes et fiches des capacités, PR nº 16 | Fusionné |
| Ancienne arène pixel art, PR nº 11 | Ouverte, en conflit ; décision distincte |
| Cinq portraits Aube, PR art nº 10 | Approuvés artistiquement ; raccord proposé par cette branche |
| Animations chevalier/Arbalétrière et carreau | Conservés côté art ; contrat moteur restant |
| Prototype Blender, PR art nº 11 | En review ; absent du jeu |

La [CI du main #38531495638](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/38531495638) est terminée avec succès. La copie locale des 150 fichiers a été comparée à leurs empreintes Git ; l'arbre et le commit source exacts sont conservés. Sur cette base, 258 tests et 60 parités passent ; le builder reproduit l'export officiel identique.

## Raccord proposé

Source art immuable : `a6dd52096ada21d5eaf07234c632ada05cf710df`, PR art nº 10. Les cinq WebP 512×768 représentent 504 664 octets au total. Versions, droits originaux, provenance, empreintes SHA-256 et reçus sont enregistrés dans `assets/creatures/portraits-aube.json` et `docs/art-approvals/`.

Seuls cinq mappings de `src/visuals.js` changent. Les vieux `knight.webp`, `paladin.webp` et `healer.webp` restent utilisés par toutes leurs autres cartes. Un instantané graphique du main PR nº 16 contrôle les 76 cartes : les 71 autres portraits, tous les rôles et toutes les silhouettes SVG sont identiques. Aucune modification du cadre pilote, du moteur, des cartes, de l'IA ou du stockage. L'export contient 18 portraits, 25 modules et pèse 1 867 019 octets ; il est régénéré depuis les sources.

Les documents de reprise sont corrigés pour distinguer le main intégré, cette nouvelle proposition et les expériences historiques. Aucune PR de l'atelier n'est modifiée ou fusionnée.

## Validation de cette proposition

- Local : 261 tests Node réussis, 60 scénarios de parité inchangés, builds normal/test, cinq empreintes/reçus concordants et synchronisation reproductible de l’export. Simulations : 20 480 contrôles et 6 144 comparaisons d’arène, deux passes identiques, aucun état invalide ; une comparaison atteint 35 tours. Ce banc ne valide pas l’équilibrage humain.
- Nouveau parcours `browser_portraits_aube.py` : décodage réel des cinq WebP, collection/main, attente, fiche, sélection/pose et unités SVG ; bureau, portrait/paysage mobile et production hors réseau avec rechargement et mouvement réduit.
- La CI exécute ce parcours plus les neuf suites historiques, les simulations de contrôle/arène et l'identité de `JOUER.html`. Vérifier le résultat sur le commit exact de la PR ; un test écrit n'est pas un test exécuté.
- Le navigateur local Work n'a pas démarré et Playwright Python n'est pas disponible localement. Aucune validation navigateur locale ni téléphone physique revendiquée. Les captures de revue sont produites par la CI.

## Limites et prochaine étape

Les cartes conservent leur habillage actuel ; seul le portrait change. Les personnages de l'arène restent des silhouettes SVG fixes. Le cadre Illustrée v3 et la position de la fiche restent à examiner en partie ; aucune validation artistique nouvelle n'est déduite des tests. Les animations exigent encore format, cadence, ancrage, orientation, boucles et budget de poids explicitement définis avec l'atelier.

Cette proposition reste sur `fix/checkup-integration-20261014` jusqu'à l'accord explicite du propriétaire pour sa PR. Aucune fusion ou auto-merge.
