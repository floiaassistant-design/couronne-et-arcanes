# Aube — contrat du moteur et du laboratoire, étape 4

Conception : [tableau maître officiel](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f),
édition relue `2026-10-27T05:48:45.318Z`, décisions Aube inchangées. Ce document décrit les choix techniques,
les responsabilités et les limites du brouillon ; aucune seconde matrice de
statistiques ou validation de conception.

## Un registre et un moteur

`resolveUnitDefinition` conserve l'identité native historique ;
`resolveRulesDefinition` dérive les règles futures depuis les mêmes données.
Sa projection ajoute aux natifs Aube la Garde positionnelle et la Riposte
à l'ATQ effective, comme aux évolutions. Les autres factions restent natives.
Un nouvel instantané porte sa rareté et `cardRules: aube-v1`. Une ancienne
unité sans ce marqueur n'est jamais recalculée ou migrée.

`unit-rules.js` partage références, disponibilité, portée, déplacement, Charge,
Perforation et Vol. `unit-stats.js` fournit les mêmes additions de bonus à la
prévision et à la pose réelle. `battle.js` conserve l'orchestration des attaques
et leurs effets secondaires ; `unit-support.js` résout arrivées et soutiens.
Toutes les pertes utilisent `hit` ; aucun combat parallèle de laboratoire.

## Attaques et soutiens

- Portée 3 : un seul premier ennemi devant le tireur, sans détour vers un
  gardien situé derrière lui. Déplacement et portée viennent de la définition.
- Perforation et tir arrière sont distincts : la première ignore l'armure
  primaire ; les dégâts secondaires frappent seulement la case ennemie
  immédiatement derrière la première cible, dans le sens du tir et sur la même
  ligne. Pas de tir arrière derrière le tireur, vers une couronne, après un
  trou, vers un allié ou à travers une interception interligne/arrière.
- Charge et Célérité lisent leurs paramètres résolus. Charge exige un déplacement
  préalable ; silence suspend ces capacités et Perforation/tir arrière, mais
  conserve la portée passive. Aucune attaque supplémentaire créée.
- Soins : alliés vivants blessés, par rapport PV/PV max puis ligne/colonne/uid.
  Les cibles sont distinctes, la soigneuse est admissible et le plafond des PV
  max s'applique. Chaque soigneur déclenche au plus une fois par tour.
- Inspiration : ordre stable des lignes puis colonnes, sans le producteur,
  nombre de cibles et cadence résolus ; un bonus ne diminue pas une ATQ qui
  dépasserait déjà le plafond. La cadence reste celle des tours de bataille.
- Les soutiens restent après les attaques. Comme dans le socle historique,
  l'immobilisation suspend déplacement/attaque ; le silence suspend les soutiens.
- Prieur : barrière uniquement après un soin effectif, plafond propre de 2 pour
  cet effet. Les sorts de barrière gardent leur plafond individuel total et ne
  réduisent pas un surplus acquis ailleurs. Les points d'une capacité ne sont
  pas effacés ou réattribués lors d'un nouveau sort.

## Arrivée et reprise

Protection précède Commandement/Intervention, puis le piège d'entrée, comme
l'ancien ordre Protection → piège. Intervention sélectionne le premier ennemi
vivant devant l'Ange à deux cases maximum, applique les protections normales,
et ne compte pas comme une attaque ordinaire supplémentaire ni une Riposte.
Une unité tuée ensuite par un piège a déjà appliqué son effet d'arrivée.

`arrivalResolved`, `lastHealRound` et `lastInspireRound` empêchent une seconde
activation lors d'une reprise ou d'un rappel du résolveur. Les quotas défensifs
restent ceux du [contrat des défenses](AUBE_DEFENSES.md). Les effets visuels
représentent seulement les résultats du moteur et ne sont pas sauvegardés.

## Laboratoire, IA et disponibilité

Les 51 versions Aube sont testables dans les deux camps du laboratoire ; les
niveaux 0–3 sont indépendants. Les autres unités n'ont que leur rang natif. Le
pilote Milicien, ses bonus expérimentaux et niveaux forcés sont retirés de la
création de nouvelles unités. Les anciens champs de défense restent lisibles
seulement pour compatibilité, sans nouvelle génération.

L'IA emploie les statistiques et paramètres résolus de ses cartes et des unités
publiques. Les décisions historiques restent identiques sans marqueur futur ;
aucune lecture de la main, pioche ou collection privées du joueur. Les styles,
limites de pose et géométries restent ceux du moteur commun.

`status.engine` indique la disponibilité technique ; les évolutions gardent
`status.combat: pending` pour l'activation en aventure et une obtention non définie.
`unitCanPlay` autorise ces versions seulement dans le laboratoire ; la campagne
n'est pas convertie et ne reçoit pas automatiquement le marqueur futur.

`ability-text.js` fournit les textes à partir des paramètres, sans recopier les
valeurs. L'étape 5 a unifié cartes et fiches dans les autres écrans ; la
[revue de l'étape 6](REVUE_AUBE_PR53_2026_10_27.md) est terminée. Aucun nouvel
actif ou circuit économique.

Les API `completeBattle` et `grantBattleProgress` refusent aussi directement
les batailles `mode: developer`, sans modifier le profil ou l'état de test.
L'isolation des gains est donc vérifiée dans le moteur en plus des protections
de navigation et de stockage de l'interface.
