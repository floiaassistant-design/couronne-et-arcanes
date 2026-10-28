# Sylve Rare/Épique — proposition du 28 octobre 2026

## Portée et dépendance

Branche `feat/evolutions-sylve-rare-epique`, depuis la PR 62
`feat/ascensions-aube` à `fc10d0de185b05d3a9e266d2b3dff306db2564b0`.
Cette dépendance reste ouverte en brouillon, tests et assemblage réussis ; main
reste `63ff7463b89d4f2ff410063a47ba2473087884bc` (PR 61 intégrée).
La PR Sylve cible la branche 62, sans fusion implicite. Après intégration
spécifiquement autorisée de la 62, la recibler sur main et revérifier les contrôles.
Chaque PR attend son propre accord ; le flux de publication reste distinct.

Source : [tableau maître Notion](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f),
édition relue `2026-10-27T06:13:46.581Z`. Aucun changement de conception ni
écriture dans Notion. Cette tranche transcrit quinze cases complètes ; elle
ne prétend pas livrer les 48 évolutions Sylve.

## Versions livrées

Six unités Communes gagnent leurs versions Rare et Épique : Éclaireuse sylvestre,
Loup des Brumes, Traqueur d’épines, Luciole des Épineuses, Hibou du Crépuscule et
Trappeur sylvestre. Leurs ID historiques sont conservés : `ranger`, `wolf`,
`thorn`, `pixie`, `owl`, `sylvan_trapper`.
Trois unités Rares gagnent leur version Épique : Gardien des Racines (`treant`),
Dryade luminescente (`dryad`), Ours des Roches (`bear`). Les deux Épiques natifs
restent natifs : aucune transition artificielle vers leur propre rareté.
Les statistiques sont transcrites une seule fois dans `cards/sylve.js` par
patches hérités ; les tests comparent des totaux indépendants.

Les capacités natives réutilisent le moteur commun : portée, Vol, Célérité,
Charge, armure, Garde positionnelle, Riposte à l'ATQ effective, soin, poison et
pièges. L'Ours conserve son armure sans Garde. La Luciole Épique remplace son
bouclier d'arrivée par 5, plafond 20, une seule application par invocation.
Aucun nouveau mécanisme de combat n'est introduit.
Les 33 évolutions supérieures restent sans définition ou obtention ; leurs
cases demeurent « À concevoir », sans chiffres inventés. Régénération,
harcèlement, contagion et autres pouvoirs nouveaux demandent les lots suivants.

## Obtention et sauvegardes

La fusion réutilise le ratio existant : trois copies libres identiques du rang
précédent donnent une copie du suivant, sans or ni éclats. Rare après victoire
mission 01 ; Épique après le premier boss, mission 03. Les copies du deck sont
protégées. Les 56 recettes résultantes sont les 41 Aube de la branche parente
et ces quinze Sylve ; les quatre pilotes et les deux ascensions Aube restent
inchangés. Aucune épreuve individuelle Sylve ajoutée.

Le paquet Sylve est proposé à 190 or pour trois cartes, après mission 03 :
60 % base Sylve Commune/Rare (neuf choix), 35 % évolution Rare (six choix),
5 % évolution Épique (neuf choix). Choix uniforme dans le groupe, tirages
indépendants, doublons possibles et aucun rang garanti. Prix/taux affichés
avant confirmation ; ce réglage d'économie est proposé à la revue.
Les pools Aube restent exactement 8/4/8. Le paquet mystique garde son prix 95,
les pools natifs 65/28/7 et la même séquence de six appels aléatoires.

Les cartes réellement achetées ou fusionnées rejoignent la Collection et le
constructeur de deck, puis les nouveaux combats et le laboratoire commun.
Aucune copie offerte, migration de stock, modification des ID/clés de sauvegarde
ou nouveau reçu. Confirmation, verrou de combat et sauvegarde sur copie avant
adoption restent ceux déjà employés. Annulation, panne et double clic sont testés.
Le second clic d'une confirmation ne peut plus actionner les boutons apparus
à la place et escamoter le résultat du paquet ; la sélection tactile de main reste
inchangée. Les fiches utilisent les paramètres réels, poison et pièges inclus.

## Architecture et vérification

`cards/evolutions.js` partage familles et provenance avec le registre et les
recettes ; il ne contient aucun chiffre. `card-packs.js` sépare explicitement
les pools par faction. Aucun moteur, actif, CSS, bibliothèque ni schéma parallèle.
68 modules embarqués, 76 images conservées, app 382 lignes et pages 270.
`JOUER.html` est généré depuis les sources, jamais édité à la main.

- 500 tests Node réussis ; 896 combats complets de versions obtenables
  (56 recettes × huit graines × deux camps), 26 versions Sylve à quatre niveaux
  et deux camps au labo ; stocks, deck, bonus, arrivée et quotas vérifiés.
- 120 scénarios de parité identiques, référence historique V2.4 intacte.
- Builds autonome, diagnostic et web vérifiés ; diagnostic non distribué.
- 26 autres suites navigateur réussies, dont Sylve aux trois formats après mise
  à jour de ses anciennes attentes de cases vides. Les quatre parcours de paquet
  Sylve ont réussi : achat réel d'une Luciole Épique, fusion des Rares,
  export/import, pose en campagne, bouclier 5 et reprise exacte. Quatre parties
  d'épreuves existantes conservées, sans nouveau job ni retrait d'assertion ;
  leurs résultats finaux sont consignés dans la PR.
- Le premier essai Sylve a révélé le second clic actionnant la Collection :
  corrigé dans le routeur puis revérifié avec le vrai double clic et les mêmes
  assertions. Après les deux corrections de texte finales, achat Sylve bureau,
  Collection Sylve aux trois formats et laboratoire ont été revérifiés ; onze
  tests ciblés de présentation/laboratoire ont aussi réussi.
- Simulations communes réussies : 20 480 combats de contrôle et 6 144 d'arène,
  aucun plateau invalide. Elles ne remplacent pas l'appréciation humaine.

Export final : **34 550 415 octets**, blob
`f2ded472eaf544e4fcffa205948b0ee8a19b2f5f`, identique local/distant.
Arbre source comparé avant génération ; générateur temporaire limité à la branche,
empreinte attendue obligatoire, retiré avant ouverture de la PR. Tête et arbre
finaux, résultats CI exacts et provenance de génération sont consignés dans la PR.
Aucun téléphone physique, équilibrage humain exhaustif, succès CI anticipé ou
publication revendiqué.
