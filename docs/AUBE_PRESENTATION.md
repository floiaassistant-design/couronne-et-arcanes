# Aube — présentation commune des cartes, étape 5

**Extension PR 55 :** les quatre récompenses des [épreuves](EPREUVES_EVOLUTION.md)
affichent « À gagner en épreuve », « Évolution obtenue » ou l'épreuve déjà
accomplie sans exemplaire restant. Les quantités et commandes de deck suivent
chaque version possédée. Les 37 autres évolutions gardent l'indication labo.
Le bilan de l'étape 5 ci-dessous décrit sa livraison historique par la PR 53.

## Archive — source et portée de l’étape 5

Le tableau maître Notion a été relu dans son édition du 26 octobre 2026,
12:40:37.541 UTC. Les dix lignes Aube conservent les décisions transcrites
au registre ; les nouvelles validations des autres factions ne sont pas
implémentées par cette mission. Le registre central reste la source des
51 versions Aube, pas un second tableau saisi dans l’interface.

Cette étape présente les pouvoirs déjà raccordés à l’étape 4. Elle ne change
ni règles, ni IA, ni obtention, ni possessions, ni achats, ni maîtrise.
Les évolutions restent testables au laboratoire et refusées en aventure.
`status.engine` reste distinct de l'activation en aventure `status.combat` ;
la [revue de livraison de l'étape 6](REVUE_AUBE_PR53_2026_10_27.md) est terminée.

## Une présentation et un lecteur

- `cards/ability-text.js` dérive le texte bref et les explications Aube des
  paramètres effectifs : valeurs, portée, zone, cibles et fréquence. Les
  descriptions des autres cartes natives et des sorts restent dans `CARDS` ;
  leur texte bref est limité à 90 caractères, la fiche conserve l’effet complet.
- `ui/card-presentation.js` résout l’identité, les chiffres, le statut et la fiche
  commune. Le cadre approuvé vient toujours de `generated-card.js`. Les vues
  lui fournissent contexte ou instantané, sans recopier les calculs de combat.
- `ui/card-inspection.js` est l’unique lecteur de consultation : survol, focus,
  toucher, fermeture, défilement et placement dans le viewport. Aucun état de
  lecture ne rejoint le profil, la bataille ou le stockage.
- `collectionHoverContent` est un adaptateur pur vers cette même fiche ; le
  second contrôleur de Collection et son rendu séparé sont supprimés.

Les cartes de Collection, main et plateau des deux camps, Atelier/Alchimie,
paquets, récompenses, listes de decks et laboratoire ont accès au même lecteur.
Les modales et noms de cartes déjà affichés utilisent la même référence ;
aucun bouton pour ouvrir une fiche n’est ajouté. Le bouton de fermeture reste
une commande de lecture, sans effet métier.

## Chiffres et disponibilité

- Main : version choisie et bonus de l’instantané de bataille, attente réelle.
- Plateau : uid, camp, ATQ effective avec Concorde/Ralliement, PV blessés/max,
  protections, silence, poison et quotas consommés. Aucun recalcul de PV/ATQ.
- Collection et écrans de progression : profil actuel, par le calcul partagé
  `unitStats` / `versionUnitStats`. Les bonus sont distingués de la base.
- Laboratoire : choix de rareté et de niveau du camp concerné ; même calcul que
  l’invocation et la prévision, sans appliquer les bonus du profil d’aventure.
- Natif historique : conserve ses règles, notamment Garde historique et Riposte
  fixe. Natif du laboratoire marqué `aube-v1` : fiche des règles versionnées.

La Collection conserve six cartes par unité. Les 51 versions définies montrent
leurs chiffres ; les 41 évolutions indiquent « Testable au laboratoire ·
Obtention non définie », sans possession ou action de deck. Les neuf rangs
inférieurs inexistants affichent « Rang inexistant », sans chiffres inventés.
Les versions non définies des autres factions restent « À concevoir ».
Divin reste rouge et Éveillé jaune céleste ; la rareté visible suit la référence
réelle dans la main, les deux camps et la fiche.

## Consultation et actions

Survol/focus ouvre la fiche sans sélectionner. À la souris, le clic de main
conserve la sélection normale et ferme la fiche. Au toucher, un premier contact
consulte ; un second contact sur la même carte de main la sélectionne, puis
la pose demande toujours une case libre distincte. Une carte en attente ou
le quota de pose atteint reste non sélectionnable.

Cliquer ou toucher une unité déjà sur le plateau ne remonte jamais vers une
commande de pose ; le ciblage explicite d’un sort conserve ses commandes et
sa confirmation. Échap, fermeture ou navigation ferment la lecture. La miniature est compacte, avec les chiffres à côté. La fiche
reste dans le viewport, avec défilement pour les capacités longues. Les modales de paquet sont également bornées et défilables pour garder leurs commandes accessibles ; en paysage
court, son contenu peut défiler entièrement. Survol/focus/toucher ne créent
aucune carte, ne dépensent rien, ne modifient ni bataille ni sauvegarde.

## Vérifications

Les résultats finaux des tests, exports exacts et contrôles GitHub sont dans
[le point de reprise](REPRISE_INTEGRATION_AUBE.md) et la description de PR 53.
Le nouveau parcours universel est appelé par `browser_card_preview.py`, déjà
exécuté par la CI : aucun workflow permanent supplémentaire.

Revue de l'étape 6 terminée le 27 octobre 2026 ; aucune fusion ni publication.
