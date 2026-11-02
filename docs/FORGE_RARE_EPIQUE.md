# Forge Rare / Épique — proposition du 2 novembre 2026

## Sources et périmètre
Source : [tableau maître Notion](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f), page modifiée le 2 novembre 2026 à 16:09:01 UTC et relue avant la création de ce lot.
Base : `main` au commit `843f1412f689b75acca7ff80fb44b99c149cb6c7` (PR 73 intégrée), aucune PR ouverte à la reprise.
La PR de ce lot demeure **proposée et non fusionnée** ; sa publication n'est pas acquise.

Dix versions futures validées, sur sept des dix unités natives Forge :

| Unité | Rare | Épique |
| --- | --- | --- |
| Marteau des Monts (`smith`) | 3 ATQ / 8 PV / délai 1 | 4 ATQ / 8 PV / délai 1 |
| Golem runique (`golem`) | native (2/12/2) | 2 ATQ / 14 PV / délai 2 |
| Sapeur gobelin (`bomb`) | native (4/3/2) | 4 ATQ / 5 PV / délai 2 |
| Foreur de fer (`drill`) | 2 ATQ / 7 PV / délai 1 | 3 ATQ / 7 PV / délai 1 |
| Mécaniste des Hauts-Fours (`mechanist`) | native (2/8/2) | 2 ATQ / 10 PV / délai 2 |
| Marchefer (`ironwraith`) | 2 ATQ / 9 PV / délai 1 | 3 ATQ / 9 PV / délai 1 |
| Alchimiste des Braises (`alchemist`) | native (3/5/2) | 3 ATQ / 7 PV / délai 2 |

Le Colosse de braise est natif Légendaire ; l'Ingénieure d'acier et le Canon des Terres Rouges sont natifs Épiques. Aucune évolution de ces trois unités dans cette tranche.
Les versions Légendaires/Divines/Éveillées de la Forge restent à intégrer dans d'autres périmètres autorisés. Les cellules dont la rareté est inférieure au natif n'existent pas.

## Règles et progression
Les seules améliorations sont les ATQ/PV validés. Pas de délai, portée, déplacement ou capacité supplémentaire. Héritage inchangé :
- Golem : Armure 2, Garde positionnelle et Riposte à l'ATQ effective.
- Sapeur : Impact de zone 2, ciblage secondaire contigu et directionnel corrigé par la PR 73.
- Foreur : Armure 2, sans Garde ou Riposte ajoutée.
- Mécaniste : Inspiration (+1 ATQ, une cible, tous les trois tours, plafond 12).
- Marchefer : Protection +3 à la couronne à l'arrivée, plafond 20.
- Alchimiste : Poison 1 pendant deux tours.
- Marteau : attaque de contact classique, sans nouveau pouvoir.

Les dix recettes reprennent le mécanisme existant : trois exemplaires libres du rang exact précédent, après mission 01 pour Rare et mission 03 pour Épique. Deck, transactions et sauvegardes restent protégés ; aucun exemplaire gratuit, aucune ascension ni épreuve individuelle ajoutée.

Le paquet distinct `forge-evolution`, après mission 03, coûte 190 or pour trois cartes indépendantes. Poids 60/35/5 : sept natives Commune/Rare, trois versions Rare et sept versions Épique ; doublons possibles. Il n'inclut aucune version supérieure. Les paquets Aube/Sylve/Ombre et le mystique gardent leurs pools et leurs prix.

## Architecture, tests et reprise
`cards/forge.js` apporte uniquement les patches immuables et la provenance ; `cards/evolutions.js` les transmet au registre et aux recettes. `cards/definitions.js` expose les unités Forge à la présentation ; `card-packs.js` réutilise le constructeur commun. Aucun changement moteur, IA, schéma de sauvegarde, assets ou CSS ; identités natives et référence `{id,rarity}` préservées.

`tests/forge_evolutions.test.mjs` examine les totaux, rangs absents, capacités héritées, dix fusions, stocks/deck, missions, paquets, tirages, import/export, combat réel et laboratoire deux camps/quatre niveaux. La matrice existante couvre aussi navigateur, reprise et export ; la CI de la PR fera foi sur son SHA exact. Les résultats locaux et les résultats CI doivent être distingués ; le téléphone physique et l'équilibrage humain ne sont pas prouvés.

Reprise : vérifier la tête de PR et les six contrôles GitHub ; corriger un échec sur la même branche, relire diff et main. Ne pas fusionner sans autorisation spécifique, ni publier une version non fusionnée. Notion reste la source de conception, inchangée.
