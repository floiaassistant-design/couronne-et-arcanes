# Aube — défenses préparées, étape 3 terminée

Relecture du [tableau maître officiel](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f),
édition `2026-10-26T08:37:43.944Z`. La [page des sorts et archives](https://app.notion.com/p/4026633072a881ed9768c615f538a929),
édition `2026-10-25T22:11:46.891Z`, renvoie explicitement à ce tableau pour les unités.
La PR nº 41, fermée sans fusion, n'est plus une source de décisions actives.

## Ce qui est raccordé et ce qui reste fermé

`battle-defense.js` porte les dégâts et la Riposte du moteur commun, appelés
par les attaques, sorts, pièges et pouvoirs existants. Les paramètres futurs
viennent de `versionUnitAbilities` et du registre central ; aucune constante
ATQ/PV ou valeur de capacité recopiée par personnage dans le moteur.

Une unité historique sans marqueur de règles conserve son instantané et son
fonctionnement. `cardRules: aube-v1` identifie les nouveaux instantanés des
règles futures, natifs Aube compris ; les tests des seules évolutions explicites
restent compatibles. Les évolutions `pending` restent refusées en aventure,
mais sont désormais testables dans le laboratoire par le même point de pose.
Aucune possession ni migration n'est créée.

| Responsabilité | Préparation réelle |
| --- | --- |
| Premier coup | Une seule réduction, montant du rang, consommée avant barrière ; aucune addition 1+2+3 |
| Armure | Montant résolu (dont Armure 3), minimum 1 avant autres protections ; Perforation ignore seulement l'armure |
| Riposte | ATQ actuelle avec Concorde et Ralliement, sans Charge ; au contact, après survie, sans contre-chaîne ; Milicien une fois/invocation, autres évolutions une fois/tour |
| Dernier Rempart | Sur un coup mortel après protections, survie une fois à `min(5, maxhp)` ; aucun kill provisoire ou double kill |
| Paladin | Barrière après une Riposte autorisée, même absorbée par l'ennemi ; plafond propre de 2 |
| Prieur | Barrière raccordée après soin effectif ; jamais après un soin nul |
| Garde | Trois portées raccordées ; un gardien par frappe, même ligne puis proximité de sa couronne ; aucune limite par tour tant qu’il vit |

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
  nouveau gain ne diminue jamais une protection existante. Les sorts conservent
  leur plafond individuel de barrière totale ; ils ne réduisent pas un surplus
  acquis ailleurs et ne réattribuent pas les points d’une capacité.
- `firstHitReductionUsed`, `lastStandUsed`, `riposteUsed`,
  `lastRiposteRound` et `abilityBarriers` appartiennent seulement aux
  instantanés concernés. Les quotas persistent après sauvegarde/reprise.
  Les objets de barrières sont remplacés à chaque modification afin de
  préserver les instantanés publics déjà émis.

Les anciens combattants ne reçoivent pas ces champs par migration. Les
statistiques sauvegardées ne sont pas reconstruites depuis Notion.

## Garde : décisions validées et raccordées le 26 octobre

Le propriétaire a validé les deux propositions. Elles ont été inscrites puis
relues dans le tableau maître Notion. `FUTURE_GUARD_POLICY` centralise leur
représentation ; les évolutions du Porte-égide en héritent sans seconde copie.
Les entrées `guard-priority` et `guard-frequency` ont été retirées des décisions
en attente. Aucun autre pouvoir n'a été ajouté par cet accord.

1. Parmi les gardiens éligibles, priorité à la même ligne que l'attaque, puis
   au gardien le plus proche de **sa propre couronne**. Égalité par ligne puis uid.
2. Toutes les attaques éligibles peuvent être interceptées tant que le gardien
   reste vivant ; un seul gardien par attaque. Le choix est refait à chaque
   frappe : un mort ne bloque pas la frappe suivante et aucun dégât ne se
   reporte du gardien sur la couronne au cours de la même attaque.

Garde normale : gardien entre attaquant et couronne sur sa ligne ; Divine :
sa ligne même derrière l'attaquant ; Éveillée : toutes les lignes. Garde ne
protège jamais une autre unité : une Garde future ne détourne donc plus le
ciblage ordinaire d'une unité à distance.

Les natifs conservent leur sélection historique quand aucune Garde future
n'est éligible. Dans un combat mêlant nouveaux et anciens gardiens éligibles,
la présence d'une Garde future applique la priorité validée à ces candidats.
Un ancien gardien sur la ligne attaquée garde donc sa candidature historique.
Cette coexistence est testée ; aucune conversion ou activation économique.

Les coordonnées des événements emploient la vraie ligne du gardien en cible
et `fromLane` pour l'attaquant. Le lecteur existant sait déjà les représenter.
Le gardien ne change pas de case et ne riposte pas entre deux lignes, même
si les colonnes semblent adjacentes. Au contact sur sa propre ligne, la Riposte
et ses protections normales restent disponibles selon leur quota.

Les étapes 3 et 4 sont terminées sur le brouillon. Les versions futures restent
`pending` pour la livraison complète et fermées à la pose en aventure ; le
laboratoire utilise désormais leurs pouvoirs communs. La fiche universelle
reste à traiter à l'étape 5.
