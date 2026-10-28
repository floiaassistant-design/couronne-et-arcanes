# Fusion de doublons — contrat et reprise, 28 octobre 2026

Branche `feat/fusion-doublons-evolutions`, depuis main
`736fd7d4f3b70c142ed8c4001a7acb5abc8d3a06` (PR 56 intégrée). La demande du
propriétaire retient les paquets pour découvrir, les doublons pour progresser,
puis quelques épreuves difficiles pour des cartes exceptionnelles. La présente
PR réalise la fusion ; aucune fusion sur main ni publication autorisée.

## Recettes proposées à la revue

**3 exemplaires du même personnage et du même rang → 1 exemplaire du rang
suivant**, sans or, éclats, XP ou aléa. Mission 01 terminée pour Rare ; première
victoire contre le boss de mission 03 pour Épique. Aucune épreuve obligatoire.
Les rangs supérieurs et les autres factions attendent leur propre obtention ;
les nouveaux paquets sont la prochaine étape. Le ratio 3 et ces accès sont un
réglage proposé, pas une décision de carte inscrite dans Notion.

| Personnage Aube | Commun → Rare | Rare → Épique |
| --- | --- | --- |
| Milicien | Oui | Oui |
| Porte-égide | Oui | Oui |
| Arbalétrière | Oui | Oui |
| Lancier des Remparts | Oui | Oui |
| Sœur de l’Aurore | Rang inexistant | Oui |
| Porte-étendard | Rang inexistant | Oui |
| Capitaine de l’Aube | Rang inexistant | Oui |
| Prieur solaire | Rang inexistant | Oui |

Douze recettes, dont les quatre versions déjà obtenables par épreuve. Huit
versions supplémentaires deviennent jouables après leur obtention ; aucune
carte offerte, conversion de collection ou changement de leurs pouvoirs.
29 des 41 évolutions Aube restent au laboratoire. Le Paladin et l'Ange n'ont
aucune transition admissible sous ce plafond.

Le tableau maître Notion a été relu dans l'édition
`2026-10-27T06:13:46.581Z` : les totaux Rare/Épique concernés correspondent
aux patches et aux tests indépendants. Le texte historique « non jouable »
précède l'intégration ; GitHub reste la source de livraison. Aucune écriture
Notion ni autre évolution de faction transcrite.

## Garanties de fonctionnement

- Seuls les stocks libres sont consommés : quantité possédée du rang de départ
  moins les copies de ce rang dans le deck. Aucun retrait ou remplacement
  automatique de slot. Une version native Rare utilise son stock natif ; une
  version Rare issue de fusion/épreuve utilise son stock de rareté, jamais les
  autres rangs. Aucun mélange de personnages, saut ou rétrogradation.
- La récompense rejoint la Collection. Le joueur l'ajoute dans Mon deck par les
  commandes existantes. La fusion est répétable si les stocks le permettent ;
  chaque passage coûte trois copies. Aucune boucle gratuite.
- Prévisualiser ne change rien. La confirmation annonce copies consommées,
  résultat, solde restant et copies protégées. Elle est transitoire, invalidée
  par annulation/navigation/rechargement. Double confirmation sans nouveau
  choix ignorée. Les stocks et le combat sont revérifiés au moment d'agir.
- Le contrôleur consomme sur une copie puis l'enregistre avant de l'adopter.
  Une écriture impossible ne change ni profil courant ni stocks sauvegardés.
  Une coupure après sauvegarde retrouve la transaction entière, sans reçu
  supplémentaire ni commande à rejouer. Les profils restent en stockage local.
- Combat actif ou résultat encore à récupérer : fusion refusée. Le laboratoire
  ne modifie pas l'aventure. Les sauvegardes actuelles restent compatibles ;
  aucune nouvelle clé ou migration. Imports/quantités conservent leurs bornes.
- Les quatre épreuves gardent accès et attribution unique. Fusionner ne marque
  pas une épreuve terminée et ne redonne pas son résultat. La campagne/Tour/
  donjons, leurs premières cartes natives, les paquets actuels, l'extraction,
  l'entraînement et la fabrication or/éclats restent inchangés.

## Architecture et vérification

Données de recette, opération moteur, rendu pur et contrôleur sont séparés en
quatre modules `evolution-fusion`. Le registre lit les recettes pour annoncer
le statut ; références/imports/decks réutilisent sa permission centrale. Aucun
second registre de statistiques, chiffre d'unité dans une vue ou moteur alternatif.
Les champs `evolvedCollection`, chaînes natives et références `{id,rarity}`
existants sont réutilisés. Ni `completedTrials` ni marqueur global de progression
n'est créé par une fusion. Le moteur de bataille n'est pas modifié.

Contrôles locaux : **464 tests Node**, incluant douze consommations réelles,
invocation de chaque version et reprise, rangs/copies protégés, verrous, stocks
invalides, ancien profil, fusion suivie d'épreuve, confirmation et panne. **120
scénarios de référence identiques**, archive V2.4 intacte. **192 combats** avec
des decks contenant chaque évolution réellement fusionnée : fin, déterminisme,
plateau valide et profil conservé. Builds normal, diagnostic et web réussis :
61 modules, 76 illustrations, aucun cycle. Aucun actif graphique ajouté.

`browser_evolution_fusion.py` est appelé par la suite Collection existante,
sans nouveau job ni doublon dans le plan CI. Quatre parcours (bureau/portrait/
paysage et HTTP) sur le jeu de production : confirmation/annulation, rechargement,
panne, double clic, fusion Commun → Rare → Épique, autre carte de soin, copies du
deck protégées, Collection/deck, export/import, vraie invocation et reprise.
Les assertions portent sur les stocks exacts et l'absence de mutations de ressources.
Les suites de régression sont en cours au moment de cette préparation ; leur
résultat final et la CI du commit exact sont consignés dans la PR.

## Reprise

Terminer la revue de diff, vérifier export depuis les sources, mêmes workflows
permanents que main et captures bureau/mobile. Pousser la branche et sa PR.
Consulter les résultats de la tête exacte ; ne pas relancer une CI déjà en cours
ni la surveiller activement après fin du travail indépendant. Fusion seulement
sur nouvel accord spécifique ; publication Sites distincte, après intégration.

Le ratio 3 et les missions d'accès sont à essayer pour le rythme de progression.
Aucun équilibrage humain final revendiqué : Chromium et tactile simulé, sans
appareil physique/Safari/Firefox. Les paquets d'évolution, autres factions et
épreuves exceptionnelles restent à développer.
