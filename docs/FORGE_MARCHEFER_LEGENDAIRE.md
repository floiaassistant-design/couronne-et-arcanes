# Marchefer Légendaire — proposition du 3 novembre 2026

## Décision et périmètre

Source : [tableau maître Notion](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f), édition relue du 2 novembre 2026 à 16:09:01 UTC. Cette proposition dépend du lot de cinq Légendaires de statistiques de la PR 78. Elle ne se substitue ni à sa fusion ni à son autorisation.

Le Marchefer (`ironwraith`) devient Légendaire à **3 ATQ / 9 PV / délai 1**, sans changement de portée ou de déplacement. **Ferraille récupérée** : si son attaque normale élimine une unité ennemie, rend **2 boucliers à sa couronne**, **plafond 20**, **au plus une fois tous les 3 tours**. Protection +3 à l'arrivée est héritée, sans seconde activation d'arrivée. La définition contient les paramètres, le moteur partagé les résout et les fiches les décrivent.

Pas de gain pour une simple blessure, une barrière absorbant la frappe, une attaque de couronne, un sort, un poison, une Riposte ou un dégât secondaire. Le Marchefer doit encore vivre après les réactions immédiates à sa frappe. Silence bloque ce pouvoir déclenché. Le quota appartient à chaque invocation : premier déclenchement possible au tour 1, suivant au tour 4 ; le plafond déjà atteint consomme aussi ce déclenchement, sans réduire un surplus de bouclier déjà présent.

## Obtention et conservation

Fusion commune de **trois Épiques libres du deck après mission 06**, sans copie offerte, ascension ou nouvelle récompense. 26 versions Forge sont définies dans la branche, dont 16 évolutions ; 148 recettes au total. Les paquets et leurs probabilités restent inchangés. Divin et Éveillé restent absents.

Le nouveau champ facultatif `strikeWardReadyRound` est propre à l'unité du combat, validé comme entier positif borné lors de la reprise. Aucun changement de clé, migration, reset, profil ou état d'animation sauvegardé. Les anciens combats sans ce champ restent lisibles et aucune nouvelle capacité n'est ajoutée à leurs unités natives.

`grantCrownShield` réunit le calcul déjà utilisé par Protection et Dernière lumière ; mêmes chiffres, même plafond et même conservation du surplus. Le moteur et le laboratoire réutilisent les mêmes déclencheurs dans les deux camps. La reconnaissance du pouvoir par Silence ne change pas la politique des cartes natives.

## Vérification et reprise

- `forge_marchefer.test.mjs` couvre les cas métier, l'obtention réelle, les exclusions, les quotas et leur validation, les événements, les deux camps et l'exécution depuis `JOUER.html`.
- Le catalogue et les fusions vérifient toutes les versions/recettes, stocks, sauvegardes et simulations déterministes ; les valeurs absentes restent absentes.
- Le pilote navigateur Légendaire ajoute `forge-scrap` sur les quatre formats/parties existants, sans nouveau job : fusion réelle, panne, double clic, Collection/deck, export/import, attente de main réelle, élimination, gain de bouclier et reprise.
- Générer l'export avec le builder officiel, contrôler son identité locale/distante, puis lire la CI du commit final. Les tests d'une branche antérieure ne valident pas cette proposition.
- Mettre à jour les mentions d'intégration après la fusion réelle des dépendances. Avant toute fusion de cette proposition : revue complète et autorisation spécifique du propriétaire.

## Travaux distincts et limites

Le Golem Légendaire n'est pas activé. Son Cœur runique exige une attaque visant la couronne interceptée par Garde ; `findTarget` choisit d'abord le gardien normal situé devant cette couronne comme cible d'unité. Le chemin d'interception de couronne ne s'exécute donc pas pour ce cas. Compter une attaque visant directement le Golem changerait la condition Notion : aucune telle réinterprétation n'est appliquée ici. La règle de ciblage/Garde et ce pouvoir demandent une résolution explicite de leur interaction avant livraison.

Marteau Légendaire et Foreur Légendaire restent des travaux séparés, comme les hauts rangs Forge. Aucun nouvel actif ni équilibrage natif. Chromium automatisé ne démontre ni l'équilibrage humain ni le fonctionnement sur téléphone physique ; fusion et publication Sites restent distinctes.

## Vérifications locales du 3 novembre

635 tests Node et 120 scénarios de parité réussis ; builds autonome/diagnostic, construction web, syntaxe Python et contrôles du pipeline réussis. Le plan du parcours navigateur trouve une élimination normale avec la graine 24, sans modification de PV ni attribution artificielle de gain. Export généré de 34 592 625 octets, blob Git `4216ff778b363fdaf87e53a7dcd77c2ada7c17fe`. La préparation ponctuelle de ce blob est retirée du diff final ; la CI complète du dernier commit reste la référence des parcours Chromium.
