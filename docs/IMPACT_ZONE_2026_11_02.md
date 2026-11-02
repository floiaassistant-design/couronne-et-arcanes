# Impact de zone — ciblage directionnel (proposition du 2 novembre 2026)

## Source et périmètre

Le tableau maître [Notion](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f) définit 53 unités et 210 évolutions, sans programmer les nouvelles versions. La décision complémentaire validée sur l’Impact est conservée dans l’archive de conception Notion : **un seul ennemi immédiatement derrière la cible principale dans le sens de l'attaque**, sans case vide intermédiaire. Ce contrat documente la correction de **la règle commune actuelle**, et non la création d'une évolution.

Proposition sur la branche fix/impact-zone-adjacence-20261102, issue du main afdf6543761dd04c832e268f7d5f261cb23addf6. Fusion et publication non autorisées dans cette mission.

## Contrat moteur

- La cible principale est le premier ennemi valide devant l'attaquant, sur sa propre ligne.
- Après une attaque normale effective sur une **unité**, la case suivante **immédiatement derrière cette première cible** dans le sens de frappe peut recevoir l'Impact de zone (2 dégâts **bruts** pour les versions natives). Une case vide, une unité alliée de l'attaquant ou une unité déjà morte arrête la propagation ; on ne saute pas plus loin.
- Le côté joueur progresse vers les colonnes croissantes, le côté ennemi vers les décroissantes. Aucun Impact derrière l'attaquant, sur une ligne différente, sur une couronne, ou après une frappe sans puissance.
- Les protections existantes (Armure, barrière, réductions, mort) restent celles de la primitive hit ; la deuxième cible peut être touchée même si l'attaque principale vient de tuer la première. Aucun coup/attaque supplémentaire, aucune nouvelle récompense ni modification de temps.
- Lorsqu'une version permet **deux cibles secondaires** (Archiliche Éveillée), elles doivent être dans les deux cases consécutives qui suivent la cible principale ; si la première est vide ou bloquée, la seconde n'est pas frappée.
- Une interception de Garde n'autorise un Impact que si le paramètre de la version autorise l'effet sur garde, si le gardien reste **sur la ligne de l'attaquant**, et si sa case est devant lui. La protection interligne de Garde Éveillée n'ouvre pas un Impact entre lignes.

## Implémentation ciblée

- src/engine/unit-targets.js : sélection pure réutilisable depuis le plateau réel, bornée aux cases jouables et à l'orientation.
- src/engine/battle.js : les deux points d'appel (unité touchée, gardien qui intercepte) transmettent les colonnes réelles ; conservation du registre de capacité, des dégâts et des instantanés.
- src/cards/abilities.js : description interne du contrat de sélection. Aucune valeur d'ATQ/PV, fréquence, classe ou composition de deck modifiée.
- tests/splash_targeting.test.mjs : deux camps, anciens plateaux 3×5 et nouveaux plateaux 10 cases, trous, alliés, protections, couronne, cible principale éliminée, cinq natifs, deux cibles secondaires de l'Archiliche.

## Validation et limites

Les scénarios et les vérifications GitHub Actions doivent être examinés **sur le SHA exact** de la branche. Les 120 empreintes historiques du contrôle de parité représentent l'ancien comportement : un écart dû à la nouvelle règle ne doit ni être masqué par une exception globale ni autoriser une mise à jour aveugle des références. Toute nouvelle référence doit être calculée depuis l'exécution et revue ; l'archive historique demeure intacte.

Le seul export hors ligne est JOUER.html, généré par npm run build. S'il n'est pas régénéré à l'identique sur la branche, la PR reste **brouillon/non intégrable** : ne jamais corriger ce HTML manuellement. Les changements de cartes Forge/Éther et de progression restent hors périmètre.
