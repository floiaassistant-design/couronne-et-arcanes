# Versions de cartes — contrat de données en préparation

État de la PR Aube : définitions et compatibilité préparées ; défenses partiellement raccordées au moteur, versions futures toujours refusées à la pose. Les décisions restent dans le [tableau maître Notion](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f), édition observée `2026-10-26T08:18:43.609Z`. Ce document décrit l'API, pas un nouveau tableau de décisions.

## Responsabilités

- `src/cards/schema.js` : six identifiants de rareté et leurs libellés, alias de lecture et gel récursif des données. Les IDs canoniques `divine`/`éveillée` préservent la convention historique de l'interface ; `divin`/`éveillé` sont des alias d'entrée.
- `src/cards/aube.js` : gains validés par rang, avec des statistiques **totales**. Les natifs viennent de `CARDS`, sans deuxième saisie. Une propriété absente est héritée, une valeur fournie remplace la précédente. La provenance Notion est conservée.
- `src/cards/abilities.js` : paramètres structurés du socle natif et héritage par clé de capacité. Un pouvoir amélioré reste un seul enregistrement ; aucun cumul de déclencheurs. Le moteur historique sera raccordé à ces paramètres lors des étapes de combat.
- `src/cards/definitions.js` : résolveur immuable commun aux cinq factions, versions Aube et statuts explicites. Aucun profil, stockage, DOM, hasard, achat ou récompense.
- `engine/unit-stats.js` : un calcul commun pour les statistiques natives et la prévision d'une version, avec les achats et bonus dans des lignes séparées.

## Références et API

```js
resolveUnitDefinition('shield'); // Le natif historique, jamais une évolution implicite.
resolveUnitDefinition('shield', 'rare');
resolveUnitDefinition({id:'shield', rarity:'rare'});
unitVersionReference('shield', 'rare'); // {id:'shield', rarity:'rare'}, gelé.
unitVersions('shield'); // Versions réellement définies, jamais les rangs inférieurs.
versionUnitStats(unitStatContext(profile), {id:'shield', rarity:'rare'});
```

`id` reste l'identifiant historique du personnage. `versionId`, par exemple `shield:rare`, identifie la définition ; **ce n'est pas un nouvel ID de `CARDS` ni un format de deck**. Les decks, quantités, achats et maîtrises historiques ne changent pas.

Sans rareté, une référence désigne le natif. Une rareté explicitement inconnue, nulle ou inférieure au natif renvoie `null`, sans repli silencieux. Les sorts sont hors de ce résolveur d'unités. `stats` contient ATQ/PV/délai de base ; `geometry` contient `steps` (déplacement) et `range` (attaque ordinaire). Les pouvoirs d'arrivée gardent leur propre portée.

`versionUnitStats` est une **prévision pure**, pas une invocation. Son champ `base` indique les totaux de rareté ; `bonuses` détaille amélioration/difficulté, équipement, Forge, réputation et maîtrise. Les effets temporaires restent hors de ce calcul. Cette API ne consulte pas l'ancien pilote Milicien et ne force aucun niveau d'achat.

## Disponibilité et compatibilité

Les dix natifs Aube et leurs 41 évolutions ont une définition. Les neuf rangs inférieurs n'existent pas. Les autres factions conservent uniquement leurs versions natives.

- `status.design: 'validated'` signifie que la définition est issue d'une conception validée ou du catalogue natif.
- `status.combat: 'implemented'` est réservé aux natifs actuellement jouables ; les évolutions sont `'pending'` tant que leurs règles ne sont pas programmées et vérifiées.
- `status.obtaining: 'existing'` conserve les circuits historiques du natif ; `'undefined'` n'invente aucun circuit pour une évolution.
- Les décisions `guard-priority` et `guard-frequency` ont été validées le 26 octobre et retirées de `pendingDecisions`. La nouvelle édition Notion distingue les valeurs historiques natives des règles futures générales : les évolutions du Porte-égide, du Paladin et de l’Ange utilisent une Riposte effective ; les natifs conservent leur définition historique. Ce périmètre ne programme pas implicitement les quatre autres factions.

Le point d'entrée commun de pose refuse une référence explicite non jouable **avant consommation**. Le refus vaut aussi pour l'adversaire et le laboratoire. Les références historiques et les variantes natives explicites continuent de fonctionner.

À cette étape, aucune vue n'annonce les nouveaux pouvoirs, aucune sauvegarde n'est enrichie et aucune unité existante n'est recalculée. Le laboratoire garde temporairement son ancien pilote ; son remplacement est prévu avec le raccordement des pouvoirs, pas avec la seule présence des données. La Collection et sa fiche universelle seront traitées à leur étape dédiée.

Les prévisions utilisent les mêmes additions que les statistiques natives. `unitStats` conserve son résultat historique et son instantané de bataille. Les tests vérifient anciennes batailles 3×5, profils importés, decks, achats, maîtrise, économie, natifs des cinq factions dans les deux camps, et isolation du laboratoire.

## Branchement des étapes suivantes

Réutiliser le résolveur pour la création des unités et leurs capacités ; ne pas recopier les valeurs de `aube.js` dans le moteur, l'IA ou les vues. Ne passer une version à `implemented` qu'après raccordement complet de ses pouvoirs, descriptions et tests. Résoudre les entrées `pendingDecisions` avant leur activation. Les contraintes de barrières par source et l'ordre des interactions doivent préserver les protections déjà présentes.

Le builder découvre ces modules par les imports du moteur ; l'export autonome est généré avec les mêmes sources. Aucun fichier HTML de variante, catalogue de sauvegarde parallèle ou système d'obtention n'est ajouté.

## Préparation défensive de l'étape 3

`versionUnitAbilities(unit)` ne renvoie des paramètres que pour un instantané
avec rareté future explicite et connue ; une unité historique ou une rareté
native explicite reste sur le chemin historique. Cette API ne rend pas une
version jouable et ne recalcule aucun chiffre sauvegardé. Les tests utilisent
ces instantanés pour exercer les mêmes primitives de moteur.

Les défenses et leurs quotas sont détaillés dans [AUBE_DEFENSES.md](AUBE_DEFENSES.md).
Les barrières de soin sont prêtes mais leur raccordement aux soins effectifs
multi-cibles appartient à l'étape 4. La Garde future est raccordée au moteur sur les instantanés versionnés :
éligibilité, priorité centrale et interceptions tant que le gardien vit. Les
versions restent `pending` : aucune nouvelle pose ou obtention n'est activée.
