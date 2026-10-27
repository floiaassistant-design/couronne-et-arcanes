# Versions de cartes — contrat de données et du moteur Aube

Étapes 1 à 6 intégrées par la PR 53. La PR 55 propose quatre obtentions par
[épreuve](EPREUVES_EVOLUTION.md), sans ouvrir les 37 autres évolutions.
[Tableau maître Notion](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f),
édition relue `2026-10-27T06:13:46.581Z`, décisions Aube inchangées. Ce fichier décrit l'API et ne remplace
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
- `status.combat` : natifs et quatre versions des épreuves `implemented` ;
  les 37 autres évolutions restent `pending` pour l'aventure.
- `status.obtaining` : `existing` pour les natifs, `trial` pour les quatre
  récompenses pilotes, `undefined` pour les autres évolutions.
- `pendingDecisions` : les deux choix de Garde validés ont été retirés. Les
  conventions techniques sont explicites dans le contrat du moteur.

Le point de pose utilise `unitCanPlay(context,reference,side)` avant toute
consommation. Les quatre versions gagnées sont autorisées côté joueur dans un
nouveau combat `evolutionsEnabled: true`. Le deck et les exemplaires sont
validés à la création ; ce marqueur n'active pas les autres versions.
Le laboratoire autorise les versions dont le moteur est
prêt, sans possession réelle. Les références invalides restent refusées dans
les deux camps, et le laboratoire valide ses réglages avant de lancer un combat.

## Laboratoire et compatibilité

`createLabBattle` utilise `createBattle` avec `cardRules: AUBE_RULESET`. Les
réglages de rareté et de niveau restent propres à chaque camp et personnage.
Le laboratoire lit `versionUnitStats` et invoque par le point de pose commun ;
aucun niveau forcé ou ancien calcul de pilote Milicien. Les niveaux 0–3 sont
indépendants de la rareté, qui ne change pas le niveau choisi.

Les anciens profils, achats, maîtrises, quantités et decks ne sont pas convertis.
L'inventaire `evolvedCollection` et `completedTrials` sont facultatifs ; les
références de deck évoluées sont des objets `{id,rarity}`, pas des chaînes de
version. Seuls leurs nouveaux instantanés portent `cardRules: aube-v1` ; les
natifs du même combat restent historiques. Le laboratoire reste isolé des
sauvegardes et des récompenses de l'aventure.

[Contrat d'exécution](AUBE_MOTEUR.md), [défenses](AUBE_DEFENSES.md) et
[point de reprise](REPRISE_INTEGRATION_AUBE.md). L'unique export `JOUER.html`
embarque les mêmes modules que le web et reste généré par le builder.

Les API `completeBattle` et `grantBattleProgress` refusent aussi directement
les batailles `mode: developer`, sans modifier le profil ou l'état de test.
L'isolation des gains est donc vérifiée dans le moteur en plus des protections
de navigation et de stockage de l'interface.
