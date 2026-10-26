# Versions de cartes — contrat de données et du moteur Aube

Étapes 1 à 4 préparées dans la PR Aube en brouillon ; aucune nouvelle rareté
obtenue dans l'aventure. [Tableau maître Notion](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f),
édition relue `2026-10-26T08:37:43.944Z`. Ce fichier décrit l'API et ne remplace
pas le tableau de décisions.

## Données et identités

- `cards/schema.js` : six raretés, normalisation des alias et gel récursif.
- `cards/aube.js` : gains validés par rang et statistiques **totales**.
  Les valeurs natives viennent uniquement de `CARDS`.
- `cards/abilities.js` : socle natif, héritage par clé et politique future de
  Garde. Un pouvoir amélioré reste un seul enregistrement.
- `cards/definitions.js` : résolveur immuable par ID historique + rareté,
  puis projection des règles futures. Aucune économie, mutation de profil,
  UI, RNG ou sauvegarde dans ce registre.

```js
resolveUnitDefinition('shield'); // Définition native historique.
resolveUnitDefinition({id:'shield', rarity:'rare'});
resolveRulesDefinition({id:'shield', rarity:'commun'}); // Règles futures explicites.
unitVersionReference('shield','rare'); // {id:'shield', rarity:'rare'}, gelé.
unitVersions('shield');
```

`versionId` (ex. `shield:rare`) n'est jamais un nouvel ID de `CARDS` ou de deck.
Le catalogue économique conserve 76 natifs. Les dix Aube définissent 51 versions,
dont 41 évolutions ; les neuf rangs inférieurs inexistants ne sont pas fabriqués.
Une rareté explicite nulle, inconnue ou inférieure au natif est refusée.

Sans marqueur de règles, une référence historique désigne le natif historique.
`resolveRulesDefinition` dérive ses chiffres du même registre ; les règles
validées de Garde et Riposte s'appliquent aussi aux natifs Aube de cette
projection. `cardRules: 'aube-v1'` et une rareté explicite identifient un nouvel
instantané de ce système. Aucun ancien combattant n'est enrichi ni recalculé.
Les autres factions gardent leur socle natif historique.

## Statistiques et disponibilité

`unitStats` et `versionUnitStats` partagent le même calcul : base de rareté,
puis achats/difficulté, équipement, Forge, réputation et maîtrise. Les totaux
ne sont pas additionnés comme des bonus de palier. `versionUnitStats` expose
`base` et `bonuses` séparément ; les effets temporaires restent hors de ce calcul.

- `status.design: 'validated'` : conception validée ou catalogue natif.
- `status.engine: 'implemented'` : capacités raccordées au moteur et couvertes
  par les tests de l'étape 4 ; cela ne crée aucune possession.
- `status.combat` : les natifs restent `implemented` ; les évolutions restent
  `pending` en attendant la livraison complète, dont leurs fiches universelles.
- `status.obtaining` : `existing` pour les natifs, `undefined` pour les évolutions.
- `pendingDecisions` : les deux choix de Garde validés ont été retirés. Les
  conventions techniques sont explicites dans le contrat du moteur.

Le point de pose utilise `unitCanPlay(context,reference,side)` avant toute
consommation. Les évolutions sont refusées en aventure, même avec le marqueur
optionnel de règles. Le laboratoire autorise les versions dont le moteur est
prêt, sans possession réelle. Les références invalides restent refusées dans
les deux camps, et le laboratoire valide ses réglages avant de lancer un combat.

## Laboratoire et compatibilité

`createLabBattle` utilise `createBattle` avec `cardRules: AUBE_RULESET`. Les
réglages de rareté et de niveau restent propres à chaque camp et personnage.
Le laboratoire lit `versionUnitStats` et invoque par le point de pose commun ;
aucun niveau forcé ou ancien calcul de pilote Milicien. Les niveaux 0–3 sont
indépendants de la rareté, qui ne change pas le niveau choisi.

Les profils, achats, maîtrises, quantités et decks ne sont pas convertis. La
campagne existante ne reçoit pas automatiquement le marqueur futur tant que
la présentation complète n'est pas prête. Le laboratoire reste isolé des
sauvegardes et des récompenses de l'aventure.

[Contrat d'exécution](AUBE_MOTEUR.md), [défenses](AUBE_DEFENSES.md) et
[point de reprise](REPRISE_INTEGRATION_AUBE.md). L'unique export `JOUER.html`
embarque les mêmes modules que le web et reste généré par le builder.

Les API `completeBattle` et `grantBattleProgress` refusent aussi directement
les batailles `mode: developer`, sans modifier le profil ou l'état de test.
L'isolation des gains est donc vérifiée dans le moteur en plus des protections
de navigation et de stockage de l'interface.
