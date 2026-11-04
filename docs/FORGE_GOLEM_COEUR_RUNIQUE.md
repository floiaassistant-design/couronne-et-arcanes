# Golem — trois hauts rangs, proposition du 4 novembre 2026

## Statut et conception

Proposition non fusionnée. Le lot Éther PR 84 et sa correction de fiche Portail
sont intégrés au commit `bc826d3ca1daa2824b9e895c51f4e61077870583`, arbre
`f83f7819b130ba8d7191053279c69fb65769c3cd`, identique à la tête dont les six
contrôles ont réussi. La publication terminale confirmée reste Sites v27 / PR 83 ;
les diffusions suivantes sont suivies séparément.

Le [tableau maître Notion](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f)
est relu le 4 novembre, édition `2026-11-02T16:09:01.799Z`. Les trois cellules
sont validées : aucune statistique ou capacité nouvelle n'est proposée ici.
Le propriétaire a validé le cas interposé le 4 novembre 2026 après explication :
« oui ca me parait bien ». Cette décision est enregistrée dans la cellule
Légendaire du tableau maître et héritée aux deux rangs suivants. L'accord de
fusion des lots prêts reçu dans la session reste soumis à la revue et aux contrôles.

| Rang | Totaux de base | Protection |
| --- | --- | --- |
| Légendaire | 2 ATQ / 14 PV / délai 2 | Garde normale, Cœur runique |
| Divin | 2 ATQ / 14 PV / délai 2 | Garde de toute sa ligne, Cœur runique |
| Éveillé | 2 ATQ / 14 PV / délai 2 | Garde de toutes les lignes, Cœur runique |

Armure 2 et Riposte à l'ATQ effective au contact, une fois par tour, sont héritées.
Les portées de Garde se remplacent, sans second gardien ni double interception.
Rare et Épique restent inchangés et n'obtiennent pas le Cœur runique.

## Cas interposé — règle validée le 4 novembre 2026

Le moteur vise une unité avant sa couronne. Un Golem normal placé devant sa
couronne est donc touché directement, sans passer par le chemin d'interception.
Notion demande une interception effective ; compter tous les coups reçus
inventerait une autre capacité. La règle validée retient une qualification limitée :

- la couronne doit être dans la portée réelle de cette attaque ;
- le Golem doit être le gardien éligible choisi par la priorité centrale ;
- en retirant ce seul Golem, la même attaque atteindrait la couronne : aucune
  autre unité ennemie atteignable ne doit devenir sa cible ;
- cette vérification ne change ni la cible, ni le déplacement, ni les dégâts,
  ni la priorité d'une attaque. Elle qualifie seulement le Cœur runique du Golem.

Exemple : couronne en colonne 0, Golem en 1, tireur ennemi de portée 2 en 2.
Il touche le Golem ; sans lui la couronne serait touchée : Cœur après
survie. Un Golem en 4 touché par ce tireur depuis 5 ne gagne aucun bouclier.
Une autre unité derrière le Golem et avant sa couronne interdit aussi ce gain.
Les configurations sont symétriques et fonctionnent sur les anciens plateaux.

**Le cas est validé par le propriétaire. La clarification documentaire et le
raccordement au main intégré ne changent pas le code qui a réussi les six
contrôles sur la tête `d4b4680885fa928ad30e35d5f9615124a4f0e860`.**
Les interceptions déjà explicites de Garde Divine/Éveillée suivent directement
la condition Notion, sans avoir besoin de cette qualification supplémentaire.

## Cœur runique et obtention

Après une attaque effectivement réalisée et interceptée, si le Golem vit encore
après les effets immédiats, Riposte et réactions de contact : +1 bouclier à sa
propre couronne, plafond 20. Aucun surplus préexistant n'est réduit. Une activation
par tour pour chaque invocation, distincte du nombre illimité d'interceptions.
Une attaque entièrement absorbée compte ; une attaque à zéro, un sort, poison,
effet secondaire, coup reçu loin de la couronne ou Riposte directe ne compte pas.
Silence suspend le Cœur, pas la Garde passive. À plafond atteint, l'interception
consomme l'activation sans ajouter de point. Le quota n'offre ni PV, barrière
personnelle, nouvelle attaque ou récompense après la mort du gardien.

Les trois recettes existantes de fusion consomment trois copies libres du rang
précédent, avec deck protégé. Légendaire après victoire 06 ; Divin/Éveillé après
victoire 09/12 et ascension Forge correspondante. Ces deux ascensions ouvrent
alors dix recettes chacune. Aucun paquet, prix, taux ou exemplaire offert modifié.
La branche définit 49 versions Forge, 39 évolutions Forge et 183 recettes au total.
Les autres évolutions Éther restent absentes.

## Responsabilités et compatibilité

`guard-candidates.js` porte la qualification pure du cas interposé et réutilise
portée et sélection partagées. `battle.js` transmet l'interception et le résultat
après les réactions existantes, sans second calcul de dégâts. `unit-triggers.js`
attribue le bouclier avec `grantCrownShield` ; `unit-effects.js` valide le champ
facultatif `lastGuardWardRound`. Il appartient à l'invocation sauvegardée, pas
à l'animation ; les fiches lisent le registre et cet état.

Pas de nouveau module, dépendance, actif, ID natif, clé de stockage ou migration.
Les 79 modules et 76 illustrations restent communs au web et à l'export autonome
généré. Aucun autre gardien ni règle native de ciblage n'est modifié.

## Contrôles et reprise

`forge_golem.test.mjs` couvre trois vraies fusions, deux camps, deux géométries,
interpositions positives/négatives, gardien dépassé, interceptions interlignes,
priorités, deux attaques, quotas individuels, plafonds/surplus, absorption, Silence,
attaque nulle, mort après Fracas, exclusions, sauvegarde/import, instantanés,
fiches et véritable moteur embarqué. Les marqueurs inconnus restent refusés ;
les tests d'évolutions absentes sont conservés sur une Sentinelle encore absente.

La fixture partagée du navigateur fusionne et invoque le Golem Divin/Éveillé
par les API normales, puis joue les deux camps. Aucun Cœur ni dégât n'est attribué
à la préparation : le moteur intercepte, retire les PV et ajoute le bouclier.
Le navigateur contrôle fiche, profil conservé et reprise, dans les quatre parties
existantes. Les fusions, laboratoire et simulations génériques incluent les trois
versions, sans ajouter de job ni rejouer la suite entière en parallèle.

Contrôles locaux : 746 tests Node réussis, 120 scénarios de parité identiques, builds autonome/diagnostic/web et syntaxe Python réussis. Les résultats navigateur et SHA exacts sont consignés dans la PR. Les tests ne valent ni
téléphone physique, ni campagne complète UI depuis zéro, ni équilibrage humain.
La décision sur le cas interposé est actée et la PR dépendante intégrée.
Avant fusion : revue du diff complet, main et contrôles exacts de la tête finale
vérifiés. Publication uniquement
après fusion, via le suivi Sites existant.
