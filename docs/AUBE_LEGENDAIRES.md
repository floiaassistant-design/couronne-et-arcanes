# Migration des neuf Légendaires Aube — 28 octobre 2026

Branche `feat/evolutions-legendaires-aube`, depuis le main vérifié
`e159631b5913791eb96d429201408a452def1337` (PR 60 fusionnée sur accord,
tests et assemblage main réussis). Le propriétaire demande la poursuite de
la migration du laboratoire vers l'aventure ; aucun accord de fusion de cette
nouvelle proposition ni de publication n'est déduit de cette demande.

## Versions et obtention proposées

Neuf versions déjà programmées au laboratoire deviennent obtenables :
Milicien, Porte-égide, Arbalétrière, Sœur de l'Aurore, Paladin solaire,
Porte-étendard, Capitaine de l'Aube, Prieur solaire et Lancier des Remparts,
au rang **Légendaire**. L'Ange du Bastion est déjà Légendaire natif : aucun rang
inférieur ou recette supplémentaire n'est inventé.

**3 Épiques libres identiques → 1 Légendaire**, après une première victoire
contre le Colosse des Fourneaux (mission 06, deuxième boss). Ratio conservé et
mission d'accès proposés pour le rythme de progression ; ce ne sont pas des
pouvoirs supplémentaires validés dans Notion. La victoire enregistrée est
obligatoire ; niveau du héros, mission accessible ou victoires précédentes ne
la remplacent pas. Pas d'or, éclats, XP, aléa ou défi par personnage.

Le Paladin consomme ses Épiques natifs de `collection` ; les huit autres leurs
Épiques de `evolvedCollection`. Les copies du deck sont protégées. La carte
créée rejoint son stock Légendaire et peut être ajoutée dans Mon deck. Aucun
remplacement automatique, cadeau, saut de rang, transfert ou migration de profil.
Une chaîne complète depuis une Commune exige 27 Communes libres ; chaque étape
est confirmée séparément. Le laboratoire reste disponible pour les mêmes cartes.

Au total : **21 évolutions Aube obtenables**, plus les 10 natifs existants ;
**20 évolutions Divines/Éveillées restent au laboratoire**. Les défis très
difficiles pour les cartes exceptionnelles restent une étape séparée. Les autres
factions ne reçoivent aucune nouvelle définition ou obtention dans ce lot.

## Canon, règles et compatibilité

Le [tableau maître Notion](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f)
a été relu dans son édition `2026-10-27T06:13:46.581Z`. Les neuf gains correspondent
aux patches et aux totaux indépendants déjà testés : PV, ATQ, portée, soin et
nombre de cibles d'Inspiration. Aucun chiffre, fréquence ou pouvoir réécrit.
Les anciennes mentions Notion « non jouable » décrivent la conception avant
livraison ; le code et la PR établissent la disponibilité réelle. Aucun tableau
parallèle de décisions ni écriture Notion.

Garde positionnelle normale et Riposte à l'ATQ effective restent communes aux
cartes déjà possédées et aux nouvelles. Aucun second moteur, changement de révision
de combat ou réinitialisation : les combats déjà compatibles restent identiques.
Les nouvelles cartes peuvent rejoindre un nouveau combat après préparation du
deck, jamais être injectées dans un combat actif.

Le paquet mystique conserve 95 or et ses tirages natifs 65/28/7. Le paquet Aube
conserve 190 or et ses groupes 60/35/5, exclusivement base Commune/Rare et
évolutions Rare/Épique. Les Légendaires ne s'ajoutent pas aux paquets. Les Épiques
réellement tirées alimentent la nouvelle fusion après le boss ; aucun taux caché.
Campagne, Tour, donjons, quatre épreuves pilotes, entraînement, fabrication et
butins demeurent inchangés.

## Architecture et transactions

`evolution-fusion.js` contient les 21 recettes et l'accès commun par rang
`EVOLUTION_FUSION_MISSIONS`. Les recettes dérivent des définitions Aube, sans
second catalogue de chiffres. Le registre et les références réutilisent la
permission existante pour Collection, imports, deck et invocation.
`ui/evolution-fusion.js` affiche les mêmes missions et les noms de campagne.
Aucune règle d'accès calculée dans la vue. Aucun nouveau module de production,
CSS, dépendance, actif graphique ou champ de profil : 65 modules/76 illustrations.

Le moteur et le contrôleur de fusion existants sont conservés : prévisualisation
pure, vérification du combat et du stock exact, confirmation transitoire,
consommation sur une copie, sauvegarde puis adoption. Annulation, navigation,
rechargement de confirmation, panne et deuxième confirmation ne consomment rien
supplémentaire. Stock du rang de départ et du résultat bornés à 100 000.
Une sauvegarde après succès contient toute la transaction, sans commande à rejouer.

## Vérifications

**480 tests Node réussis**, dont les 21 recettes avec consommation réelle,
import/deck/invocation/reprise et chiffres indépendants ; neuf verrouillages
Légendaires ; sources Épiques natives/évoluées protégées ; chaîne complète
27 Communes ; trois Épiques réellement tirées dans un paquet puis fusionnées ;
portée 3, soins 3 et deux inspirations de ligne dans un vrai contexte d'aventure ;
panne de sauvegarde et double confirmation pour les neuf nouvelles recettes.
Les tests des règles du laboratoire et des autres factions restent actifs.

**336 combats** avec des decks contenant une version réellement fusionnée :
fin, plateau valide, déterminisme et profil conservé. **120 scénarios de référence
identiques**, archive V2.4 inchangée. Builds autonome, diagnostic et web réussis.

Le parcours de fusion navigateur existant est étendu, sans nouveau job/suite :
bureau, portrait, paysage et HTTP. Il conserve ses vérifications Rare/Épique et
ajoute le verrou du deuxième boss, copies du deck protégées, annulation, panne,
double clic, fusion du Paladin natif, Collection, deck, export/import puis vraie
invocation simultanée des Lancers Épique et Légendaire et reprise exacte.
Les 27 suites des quatre groupes sont lancées localement ; leurs résultats et
la CI du commit exact seront consignés dans la PR après vérification.

## Export et reprise

`JOUER.html` reconstruit depuis les mêmes sources : **34 539 145 octets**, blob
`21224fe275f8a6f5db63a39f575f309c96a2f6eb`. Ne pas éditer l'export à la main.
Vérifier l'identité des arbres et de ce blob après enregistrement GitHub.
Les workflows permanents et le plan à quatre groupes restent ceux de main.

Terminer la revue/captures et les contrôles indépendants, pousser la branche,
ouvrir la PR puis lire la CI si elle est déjà terminée. Aucun contrôle en cours
relancé ni surveillance active quand il ne reste que son résultat. Fusion sur
nouvel accord spécifique, diffusion Sites via le flux existant après intégration.

Mission 06 et effort de doublons à apprécier en jouant : aucun équilibrage humain
exhaustif, appareil physique, Safari/Firefox ou nouvelle publication revendiqué.
