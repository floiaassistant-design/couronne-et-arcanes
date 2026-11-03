# Forge — cinq Légendaires de statistiques (proposition du 3 novembre 2026)

## Décision et périmètre

Source de conception : [tableau maître Notion](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f), édition constatée le 2 novembre 2026 à 16:09:01 UTC. Cette tranche prépare **cinq** versions Légendaires déjà validées, sans inventer de statistiques ni ajouter de mécanique. Base : `main` au commit `014afc27d9e0c300ce5fcab6862fdfe47d46c1c3`, après intégration de la [PR 75](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/75).

| Personnage | Épique actuel | Légendaire proposé | Effet hérité, inchangé |
| --- | --- | --- | --- |
| Sapeur gobelin (`bomb`) | 4 ATQ / 5 PV / délai 2 | **5 ATQ / 5 PV / délai 2** | Impact de zone, 2 dégâts bruts secondaires contigus |
| Ingénieure d’acier (`engineer`) | 3 ATQ / 7 PV / délai 3 (native) | **3 ATQ / 9 PV / délai 3** | Inspiration : +1 ATQ, une cible de sa ligne tous les 3 tours, plafond 12 |
| Canon des Terres Rouges (`cannon`) | 5 ATQ / 7 PV / délai 3 (native) | **5 ATQ / 9 PV / délai 3** | Distance 2 |
| Mécaniste des Hauts-Fours (`mechanist`) | 2 ATQ / 10 PV / délai 2 | **3 ATQ / 10 PV / délai 2** | Inspiration inchangée |
| Alchimiste des Braises (`alchemist`) | 3 ATQ / 7 PV / délai 2 | **4 ATQ / 7 PV / délai 2** | Poison 1 pendant 2 tours |

Les dix natives Forge, les dix Rares/Épiques déjà intégrées et leurs capacités restent inchangées. Les cinq patches ajoutés dans `src/cards/forge.js` sont lus par le registre unique, le laboratoire et les recettes existantes. Il y a **25 versions Forge définies**, dont **15 évolutions**. Le nombre de recettes du jeu doit passer de 142 à 147 si cette tranche est intégrée. Aucun nouvel identifiant natif, aucune migration de sauvegarde et aucun changement du moteur ou de l’IA.

## Obtention et compatibilité

Chaque Légendaire s'obtient par la fusion existante de **trois copies Épiques libres du deck**, après victoire à la mission **06**. Le moteur refuse les copies manquantes ou engagées dans le deck et les missions non terminées ; le profil n’est pas modifié lors d’un refus. Aucune épreuve individuelle, nouvelle ascension, carte offerte, récompense automatique ou modification de paquet n’est ajoutée. Les paquets Forge restent limités aux natives, Rares et Épiques (prix 190 or, répartition 60/35/5) ; les anciennes compositions et probabilités des autres paquets sont préservées.

Les autres Légendaires Forge **ne sont pas ajoutées dans cette PR** : Marteau des Monts (recul), Golem runique (bouclier après Garde), Foreur de fer (destruction de barrière avant frappe) et Marchefer (restauration de bouclier après élimination) demandent des mécaniques et tests dédiés. Le Colosse de braise est déjà natif Légendaire. Aucune version Divine/Éveillée Forge ni évolution Éther n’est activée ici.

## Architecture, contrôles et publication

- `src/cards/forge.js` : valeurs seules ; `cards/evolutions.js`, `cards/definitions.js` et `evolution-fusion.js` assurent la composition, les fiches, les règles et l’obtention sans duplication.
- `tests/forge_evolutions.test.mjs` : totaux, héritage, absence des autres rangs, mission 06, trois copies exactes, refus sans mutation, paquets inchangés, import/export, poses réelles, laboratoire deux camps/quatre niveaux.
- Vérifications à effectuer **sur la tête exacte de la PR** : `npm test`, `npm run test:parity`, `npm run build`, `npm run build:test`, navigateur et synchronisation de l'export.
- `JOUER.html` doit être **régénéré par `npm run build` depuis les sources** et présent dans la PR, jamais modifié manuellement. Si l'export n'est pas encore synchronisé, la tranche est **incomplète, non fusionnable**.
- Les CI de `main` obtenues avant ce travail ne valident pas ce changement ; les tests de la PR, le rendu mobile physique, l'équilibrage humain, la fusion et la publication Sites demandent des constats séparés.

**Statut : proposition en cours sur branche dédiée.** Ne pas confondre avec le code intégré à `main` ou la version publique. Une autorisation explicite et spécifique est nécessaire pour fusionner. Reprendre en vérifiant main, l'état de la PR, le diff complet, l'export autonome et les contrôles du commit exact.
