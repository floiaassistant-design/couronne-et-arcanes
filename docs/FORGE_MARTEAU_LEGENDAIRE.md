# Marteau Légendaire — intégré par PR 81 le 3 novembre 2026

Source : tableau maître Notion, édition relue du 2 novembre 2026 à 16:09:01 UTC.
Base : main intégrant le Foreur par PR 80, commit `7d3d6d4`.

## Règle et obtention

4 ATQ / 8 PV / délai 1, portée et déplacement 1 conservés. Coup de masse : une
attaque normale au contact retirant des PV à une unité ennemie survivante la
repousse d'une case vers sa propre couronne si la destination est libre et dans
le plateau, au plus une fois tous les 3 tours. Aucun recul sans perte de PV,
sur une couronne, par sort, poison, Riposte ou dégât secondaire, sous Silence,
hors contact ou après la destruction du Marteau.

Les réactions de contact existantes, dont Riposte, sont résolues avant le recul.
Un déplacement réussi consomme la cadence ; une destination bloquée ou hors
plateau n'ajoute ni collision, dégât, attaque, avancée du Marteau ou consommation
de cadence. Les pièges de la case d'arrivée utilisent leur résolution commune.
Les intentions simultanées historiques restent préparées ; le nouveau recul
vérifie les positions réelles et ne crée aucune frappe supplémentaire.

Fusion de trois Épiques libres après mission 06, même transaction et protection
du deck. Paquets, taux, natifs, sauvegardes et rangs futurs conservés. Cette
branche compte 28 versions Forge, 18 évolutions et 150 recettes au total.

## Architecture et preuves

Définition et textes dans le registre commun ; `unit-triggers.js` résout le
recul et réutilise le hook d'entrée de case. `knockbackReadyRound` est facultatif,
validé et sauvegardé sur l'invocation. Aucun module, moteur ou état d'animation
persistant ajouté. Le web et l'export autonome utilisent les mêmes modules.

Tests métier, deux camps, géométries réelle/historique, blocages, barrières,
Silence, Riposte, pièges, reprise, instantanés et vrai moteur embarqué. Le pilote
`forge-smith` réutilise les quatre parties navigateur existantes : vraie fusion,
deck protégé, panne, double clic, Collection/deck, import/export, puis combat
préparé valide contre un Golem natif et reprise après recul. Aucun résultat du
pouvoir n'est préattribué ; ce cas ne prouve pas une campagne complète depuis zéro.
Les résultats et le SHA final seront consignés dans la PR. Aucun téléphone
physique, équilibrage humain exhaustif ou publication déduit des tests.

## Point distinct — Golem

Les règles de Garde sont validées. Le ciblage choisit le premier ennemi avant
la couronne : un Golem normal placé entre un tireur et sa couronne est donc
touché comme unité, sans événement d'interception. Compter tous ses coups reçus
changerait Cœur runique. Cette proposition ne le fait pas. Il reste à préciser
si le cas particulier où la couronne est elle-même à portée doit compter comme
une interception ; aucune nouvelle réponse n'est supposée. Le Golem Légendaire
reste fermé pendant que les autres cartes progressent.

Le propriétaire a explicitement autorisé la fusion des lots prêts pendant cette
session : revue complète, CI du commit exact et vérification de main restent
obligatoires. Publication distincte par le suivi existant, sans flux concurrent.

Fusion confirmée au commit `b54e567a477c2c9e64c7b51ccb49eb492176050b`, arbre `01ee415dcf4a03be1902191cf48c3cf824deb975` identique à la tête testée après six succès. Les mentions de préparation ci-dessus conservent les preuves et limites du lot ; publication distincte.
