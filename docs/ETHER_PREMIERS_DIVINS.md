# Éther — cinq versions et première ascension Divine, proposition du 5 novembre 2026

## Source et périmètre

Conception relue dans le [tableau maître Notion](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f),
édition `2026-11-04T09:02:46.815Z`, toujours courante à cette reprise.
Base initiale : main `3fac34fa5a2b94cc705aca086d761bf6e524493c`, PR 86 intégrée.
La branche est réconciliée avec main `3ba15786de52f33877b2854bf743430bdc1ca327`
après fusion autorisée de PR 87 : contours CSS de 2 px et documents conservés,
JOUER régénéré depuis les sources communes. Main compte 27 versions Éther et
187 recettes ; la proposition conserve les cinq versions et l’ascension ci-dessous.

| Personnage | Rang ajouté | ATQ / PV / délai | Gain à ce rang |
| --- | --- | --- | --- |
| Sentinelle prismatique | Légendaire | 2 / 11 / 2 | Prisme inhibiteur |
| Sentinelle prismatique | Divine | 2 / 11 / 2 | Garde de toute sa ligne remplace la Garde positionnelle |
| Feu follet | Divine | 3 / 4 / 1 | Éclat persistant après Repli spectral |
| Voyante des Étoiles | Divine | 3 / 5 / 1 | Destin scellé : présage 3 remplace 2 |
| Dragon des Sept Cieux | Divine | 7 / 12 / 5 | Souffle des Sept Vents après Impact secondaire |

Les gains précédents sont hérités, sans ajout de statistiques. Armure 2 et
Riposte effective de la Sentinelle, portée 3 des évolutions du Feu follet,
portée 2 de la Voyante, Vol/Impact 2 du Dragon sont conservés. Le Feu follet
natif reste à portée 2 : sa modification validée est un périmètre séparé.

La proposition porte Éther à **32 versions, 21 évolutions sur dix personnages** ;
les onze natifs restent présents. **18 évolutions** restent absentes, dont tous
les rangs Éveillés. Les 53 unités natives et 23 sorts ne changent pas.

## Résolutions et interactions

- **Prisme inhibiteur** : après une interception réelle de sa couronne à laquelle
  elle survit, la Sentinelle applique −1 ATQ à la prochaine attaque de l’ennemi
  responsable, minimum 1. Cadence propre à l’invocation : pose N, prochaine
  disponibilité N+3 ; expiration en fin N+2. La Garde normale conserve la
  qualification partagée du gardien interposé : sans lui, le coup doit atteindre
  la couronne, avec portée et priorité réelles. Un autre coup reçu ne suffit pas.
  Garde Divine permet une interception depuis toute sa ligne, même dépassée,
  jamais depuis une autre ligne. Un seul gardien, sans double interception.
  Résolution après les réactions de contact ; gardien ou attaquant mort, attaque
  nulle et Silence excluent l’application. Une absorption complète ne l’exclut pas.
  Le malus utilise la consommation commune des intentions d’attaque/Riposte ;
  une intention déjà préparée n’est pas réécrite. Pas de cumul de Prismes ; avec
  Harcèlement, le plus fort malus s’applique sans addition, chaque état gardant
  sa consommation et sa durée propres. Ni ATQ permanente ni sort modifié.
- **Éclat persistant** : seulement après un Repli spectral réussi, la prochaine
  attaque normale gagne +2 dégâts dans sa frappe unique, protections normales.
  Bonus non cumulable, consommé à la première intention d’attaque normale,
  ou supprimé en fin N+2. Une cible couronne peut consommer ce bonus ; aucun
  bonus à une Riposte, aucun gain après un repli bloqué ou la mort sur un piège.
  Silence empêche le nouveau repli/gain, sans retirer un bonus déjà appliqué.
  Le recul lui-même conserve sa cadence N+3 et son unique case libre.
- **Destin scellé** : le paramètre 3 remplace 2 dans le présage existant. Pose
  après perte réelle de PV et survie de la victime, au plus tous les trois tours,
  une cible par Voyante, sans cumul. Fin du tour complet N+1 après les deux camps ;
  déplacement réel durant ce tour = annulation, même après retour. Immobilisation
  sans déplacement = présage maintenu. Les protections communes s’appliquent.
- **Souffle des Sept Vents** : seul l’Impact qui retire des PV à sa victime
  secondaire survivante peut la repousser d’une case vers sa propre couronne,
  sur sa ligne, dans le plateau et sans traverser une unité. Case bloquée,
  bord, absorption complète, victime morte, source morte ou Silence = aucun
  déplacement ni quota consommé. Cadence N+3. Le hook commun d’entrée déclenche
  pièges, morts et annulation des présages. Ni la cible principale ni une autre
  ligne ni une couronne ne sont repoussées ; aucune attaque supplémentaire.

Ces pouvoirs utilisent le moteur du laboratoire et des deux camps, sur les
géométries actuelles et historiques. Les événements représentent les résultats
réels ; aucune nouvelle animation ni ressource graphique n’est ajoutée.

## Obtention

La Sentinelle Légendaire suit la fusion existante après la victoire réelle en
mission 06 : trois Épiques libres donnent une Légendaire.

Une **première ascension Éther** reprend le parcours commun après mission 09 :
victoire avant la fin du tour 24, couronne à au moins 40 %, trois personnages
Éther Légendaires distincts encore vivants. Rencontre Conseil des Astres,
difficulté 5, 48 PV, boss, stratégie bastion ; deck natif Éther et sorts existants.
Ce sont les paramètres du parcours commun des factions, adaptés à Éther,
pas des pouvoirs ou caractéristiques de cartes inventés.

Son reçu ouvre seulement les quatre recettes Divines définies : trois copies
Légendaires du rang exact, libres hors deck, contre une Divine. Aucune carte,
ressource ou XP offerte. Pas d’ascension Éveillée ni d’activation de définition
future. Les autres ascensions ne débloquent pas Éther. Paquets : prix, taux,
contenus et ordre aléatoire inchangés. Total proposé : **192 recettes**.

## Architecture, stockage et vérification

`unit-triggers.js` réutilise Garde, géométrie, dégâts et entrée de case ;
`unit-strike-modifiers.js` possède les états consommables/expiration ;
`unit-effects.js` partage les malus et valide les quotas. Le présage existant
reste dans `unit-omens.js`, sans second modèle. Aucune dépendance ou module de
production ajouté : 80 modules et 76 illustrations communes au web et à JOUER.

Champs facultatifs : `prismPenalty`, `nextStrikeBonus`,
`guardPrismReadyRound`, `splashKnockbackReadyRound`. Imports/reprise vérifient
les nombres, durées et minimum. Les anciens états ne sont pas enrichis ou
réinitialisés ; progression, sauvegardes et clés historiques sont conservées.

Les tests dédiés couvrent fusions, pouvoirs, exclusions, protections, quotas,
deux camps/géométries, présages déplacés, pièges, instantanés, import/reprise,
fiches et moteur du véritable JOUER. Catalogue : 32 versions × quatre niveaux
× deux camps. Le simulateur commun joue les 192 recettes, deux fois sur huit
graines ; l’ascension joue 64 combinaisons graine/niveau rejouées.

Les quatre parties navigateur existantes ajoutent l’ascension Éther, ses refus,
reçus/pannes, fusion, Collection/deck, export/import et invocation. La fixture
`ether-divine-battle.mjs` prépare ensuite quatre fusions/invocations réelles ;
aucun pouvoir ou quota préattribué. L’UI déclenche les quatre effets, les lit,
les reprend puis vérifie leur consommation/résolution au tour suivant.

Résultats actuels à lire dans la PR, sur son commit exact. Simulation et Chromium
simulé ne prouvent ni équilibrage humain, ni Safari/Firefox ou téléphone physique.
Cette proposition attend son propre accord spécifique avant fusion. Publication
uniquement après intégration sur main, par le suivi Sites existant.

## Réconciliation avec les contours et correction du contrôle Légendaire

L’ancienne CI attendait encore « À concevoir » pour les Divines du Feu follet et
de la Voyante. Le parcours partagé attend désormais l’accès par ascension sur
ces deux cases et vérifie leurs chiffres indépendants (3/4 et 3/5). Il conserve
l’assertion d’absence pour leurs Éveillées et les contrôles des autres factions.
La matrice permanente, ses groupes et ses assertions métier restent actifs.

L’environnement local étant indisponible à cette reprise, la génération et les
contrôles de l’assemblage s’effectuent sur GitHub. Les résultats locaux antérieurs
restent historiques ; lire les nouvelles preuves dans la PR sur son SHA exact.
La publication des contours intégrés est également bloquée par cet environnement,
et le site reste à la dernière version terminale confirmée, v29.
