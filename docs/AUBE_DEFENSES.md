# Aube — défenses préparées, étape 3 partielle

Relecture du [tableau maître officiel](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f),
édition `2026-10-26T07:46:27.447Z`. La [page des sorts et archives](https://app.notion.com/p/4026633072a881ed9768c615f538a929),
édition `2026-10-25T22:11:46.891Z`, renvoie explicitement à ce tableau pour les unités.
La PR nº 41, fermée sans fusion, n'est plus une source de décisions actives.

## Ce qui est raccordé et ce qui reste fermé

`battle-defense.js` porte les dégâts et la Riposte du moteur commun, appelés
par les attaques, sorts, pièges et pouvoirs existants. Les paramètres futurs
viennent de `versionUnitAbilities` et du registre central ; aucune constante
ATQ/PV ou valeur de capacité recopiée par personnage dans le moteur.

Une unité historique, même explicitement marquée avec sa rareté native, garde
son instantané et ses règles historiques. Le nouveau chemin requiert une
rareté future explicite connue. **La pose refuse toujours toutes ces versions
`pending`**, dans les deux camps et le laboratoire. Les tests construisent ces
instantanés pour vérifier les défenses sans ajouter de circuit d'obtention.
Les nouvelles règles ne sont donc pas présentées comme jouables.

| Responsabilité | Préparation réelle |
| --- | --- |
| Premier coup | Une seule réduction, montant du rang, consommée avant barrière ; aucune addition 1+2+3 |
| Armure | Montant résolu (dont Armure 3), minimum 1 avant autres protections ; Perforation ignore seulement l'armure |
| Riposte | ATQ actuelle avec Concorde et Ralliement, sans Charge ; au contact, après survie, sans contre-chaîne ; Milicien une fois/invocation, autres évolutions une fois/tour |
| Dernier Rempart | Sur un coup mortel après protections, survie une fois à `min(5, maxhp)` ; aucun kill provisoire ou double kill |
| Paladin | Barrière après une Riposte autorisée, même absorbée par l'ennemi ; plafond propre de 2 |
| Prieur | Primitive de barrière après soin effectif préparée ; raccordement au soin multi-cible à l'étape 4 |
| Garde | Candidatures Normale, Divine et Éveillée énumérées ; aucune sélection, interception future ou quota activé |

## Interactions techniques à examiner avant activation

Ces conventions sont **l'implémentation proposée dans le brouillon**, pas de
nouvelles validations de conception consignées dans Notion :

- Ordre : Armure/minimum, réduction du premier coup ennemi, barrière, PV,
  puis Dernier Rempart avant comptage définitif d'une victime.
- La réduction initiale est passive et reste sous silence. Riposte, barrière
  liée à son déclenchement et Dernier Rempart sont suspendus sous silence.
  Un quota suspendu n'est pas consommé. Le sélecteur de silence reconnaît
  aussi le Milicien futur, sans lui attribuer Garde.
- Le poison périodique conserve la perte directe de PV historique : il ne
  consomme pas le premier coup et ne déclenche pas Dernier Rempart. Les sorts,
  pièges et autres frappes qui passent par `hit` utilisent les protections.
- Les points de barrière de capacités sont comptés par effet sur la cible,
  pas par lanceur. Ils sont consommés avant la protection extérieure ; un
  nouveau gain ne diminue jamais une protection existante. Les barrières de
  capacités doivent être réconciliées avec tous les sorts lors de l'étape 4.
- `firstHitReductionUsed`, `lastStandUsed`, `riposteUsed`,
  `lastRiposteRound` et `abilityBarriers` appartiennent seulement aux
  instantanés concernés. Les quotas persistent après sauvegarde/reprise.
  Les objets de barrières sont remplacés à chaque modification afin de
  préserver les instantanés publics déjà émis.

Les anciens combattants ne reçoivent pas ces champs par migration. Les
statistiques sauvegardées ne sont pas reconstruites depuis Notion.

## Garde : deux décisions encore absentes

Notion précise « priorité entre plusieurs Gardes, fréquence des interceptions »
comme éléments à étudier avant programmation. `crownGuardCandidates` renvoie
l'ensemble des candidats avec **leur vraie ligne et colonne**, dans les deux
sens du plateau et les géométries 3×5 ou dix cases. Elle ne protège que la
couronne ; la normale exige une position entre l'attaquant et sa couronne,
la Divine couvre sa ligne, l'Éveillée toutes les lignes. Les autres factions
et la sélection de Garde historique du jeu ne sont pas modifiées.

Deux choix sont nécessaires pour terminer son raccordement :

1. Quel gardien intercepte si plusieurs sont éligibles ? Proposition à
   examiner : même ligne en priorité, puis gardien le plus proche de sa
   couronne ; égalité finale par ligne puis uid. Cette proposition n'est
   **ni programmée ni validée**.
2. Combien de frappes peut-il intercepter ? Proposition à examiner : toutes
   les frappes tant qu'il reste vivant, avec une seule interception par
   attaque. La portée améliorée remplace l'ancienne ; pas de double blocage.
   Cette proposition n'est **ni programmée ni validée**.

`pendingDecisions` garde `guard-priority` et `guard-frequency` sur les
évolutions du Porte-égide. L'étape 3 reste partielle ; ne pas enchaîner l'étape 4.
