# IA des adversaires — V1.8

## Fonctionnement
Le moteur (`src/engine.js`) applique strictement les mêmes règles que pour le joueur. Il utilise `rankEnemyMoves` dans `src/ai.js` pour évaluer chaque couple **carte jouable / ligne** présent dans sa main. Aucun accès à la main, pioche ou deck caché du joueur. Chaque action entraîne une nouvelle évaluation. **Maximum deux cartes par tour**, délai des cartes et règles normales de déploiement.

### Styles
- **Assaut** : valorise créatures agressives, statistiques d'attaque, vitesse et lignes ouvertes ; tente une percée.
- **Bastion** : valorise gardiens, robustesse, soins et boucliers, spécialement face aux menaces proches.
- **Rituel** : favorise les sorts réellement utiles, le contrôle de ligne et les combattants magiques ou à distance.
- **Meute** : favorise les unités du même ordre sur une ligne pour profiter de Concorde et les créatures rapides.
- **Équilibré** : priorités normales sans bonus de style ; utilisé pour les batailles sauvegardées avant la V1.8.

### Boss : deux phases
Les boss de campagne et tous les cinq étages de la Tour reçoivent une seconde priorité **Furie** lorsque leurs PV restants sont à 50 % ou moins. Il ne s'agit que d'une modification du score des cartes offensives et défensives. **Aucun PV, action, carte, ressource ni pouvoir supplémentaire n'est accordé.** La transition est annoncée une fois, dans le journal.

## Structure et données
- `src/data.js` définit `aiStyle` pour les 12 missions et la Tour (selon la faction de ses étages).
- `src/ai.js` définit les descriptions et les calculs, sans effet secondaire.
- `src/engine.js` enregistre `battle.aiStyle`, `battle.aiBoss` et `battle.aiPhaseAnnounced`.
- `src/app.js` montre ces caractéristiques dans le menu et sur le champ de bataille.
- Anciens combats sans ces champs : profil `equilibre`, pas de Furie sans marqueur `aiBoss`. Les clés de stockage navigateur restent inchangées.

## Vérifications
- `node --test tests/*.test.mjs` : 59 tests réussis au moment de la livraison.
- `python3 tests/browser_v18.py` : profils visibles, seconde phase, log et tour jouable sur Chromium desktop et mobile.
- Regression des suites précédentes : interfaces, Charge/Riposte, visuels et navigation.

## Limites
IA heuristique non entraînée ; les styles reposent sur un classement tactique à court terme, sans vision à plusieurs tours. Les compositions de deck existantes influencent également les stratégies. L'équilibrage statistique sur des centaines de parties et les essais sur appareils physiques restent à réaliser.

- Contrôle additionnel V1.8 : 120 combats simulés sur la campagne et la Tour (`tests/simulation_v18.test.mjs`).
