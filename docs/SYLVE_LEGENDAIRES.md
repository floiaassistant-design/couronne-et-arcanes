# Sylve Légendaire — proposition du 29 octobre 2026

## Base et portée

Main `33cad6673c9e3cb468b222de39ad821a936dc098`, PR 62 et 63 intégrées sur
accord explicite ; branche dédiée `feat/evolutions-legendaires-sylve`.
Source : [tableau maître Notion](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f),
édition relue `2026-10-27T06:13:46.581Z`. Aucune écriture ni nouvelle validation de
conception. Les valeurs résident dans `cards/sylve.js`, sans tableau parallèle.

Les onze personnages Sylve gagnent leur version Légendaire : 37 définitions,
26 évolutions Sylve obtenables sur cette branche. Les 22 versions Divines/Éveillées
restent sans définition et sans obtention ; les six cases de Collection sont conservées.
La demande de poursuivre n'autorise aucune fusion/publication de cette nouvelle PR.

## Progression

Trois Épiques libres du même personnage donnent une Légendaire après victoire de
mission 06. Les Épiques du Cerf et de l'Archidruide sont leurs stocks natifs ; les
neuf autres proviennent du stock évolué. Le deck est protégé, sans saut de rang,
or, éclat, cadeau, reçu ou défi individuel. Les 67 recettes utilisent la même
transaction confirmée et sauvée sur copie ; panne et double clic ne dupliquent rien.
Le prix, le contenu et les taux des trois paquets restent inchangés : aucune
Légendaire dans les paquets ciblés. Aube, économie et butins existants conservés.

## Pouvoirs et interactions

Portée 3 de l'Éclaireuse, Charge +3 du Loup et Armure 3 du Gardien remplacent
leurs paramètres précédents. Célérité, Vol, Garde positionnelle et Riposte
restent ceux du moteur commun. L'Ours ne reçoit pas Garde. Cerf, Ours et
Archidruide gagnent seulement leurs statistiques validées à ce rang.

Poison prolongé lit trois tours depuis la définition du Traqueur ; les ticks
restent aux tours de la cible, comme le poison natif, avec rafraîchissement sans
cumul. Le piège renforcé lit deux dégâts bruts avant protections, sans double
application ; blocage déplacement/attaque, cadence trois tours, durée et quota
sont conservés. Les pièges runiques et natifs gardent leurs paramètres exacts.

La Luciole donne à son arrivée une barrière à un autre allié vivant de sa ligne,
priorité au plus blessé proportionnellement, puis colonne/uid ; allié plein
possible si aucun blessé. Sans allié, pas de barrière personnelle à la Luciole.
Le plafond par effet réutilise `grantAbilityBarrier`, partagé entre invocations ;
les barrières d'autres sources coexistent et ne sont jamais effacées. L'arrivée
est résolue une fois, avant le piège d'entrée comme les capacités existantes.

Après soin effectif, la Dryade pose une Régénération sur la même cible : un PV
à la fin de son prochain tour, avant les nouveaux soutiens. Aucun soin différé
immédiat, cumul ou résurrection ; cible pleine au déclenchement : effet consommé
sans gain. L'effet persiste si la Dryade disparaît. Une nouvelle application
rafraîchit l'effet, sans soin différé supplémentaire ; plusieurs soins normaux
restent des soins normaux. Les tours alternés filtrent le camp ; le mode historique
résout une fois par tour. `readyRound` et durée restants sont sauvegardés.

Le Harcèlement pose un malus non cumulable à la prochaine attaque d'unité,
sur une cible ennemie encore vivante. Il ne modifie jamais son ATQ permanente.
Les bonus sont ajoutés avant retrait du malus, minimum zéro ; une attaque à zéro
ne déclenche pas le minimum d'un dégât. Le malus disparaît lors de l'intention
suivante, même contre une couronne ; une Riposte valide est aussi une attaque
et le consomme. Aucun sort, piège, poison ou soin ne le consomme. Dans le mode
simultané historique, les intentions déjà préparées ne changent pas après coup.

Silence bloque les nouvelles applications de Harcèlement et les soutiens de la
Dryade ; Vol et portée restent passifs. Les effets déjà appliqués persistent
malgré le silence de leur cible. Plateau, fiche et IA lisent la même réduction
publique d'ATQ, sans accès supplémentaire aux cartes cachées.

## Compatibilité et architecture

`engine/unit-effects.js` porte les états communs, sans DOM ou second moteur.
Les nouveaux champs d'unité sont facultatifs et validés à la reprise. Les objets
d'états sont remplacés, sans altérer les instantanés d'événements précédents.
Aucun changement des clés, ID, niveaux, maîtrise ou stocks historiques ; pas
d'activation gratuite de référence future. Les anciens combats compatibles
continuent à se reprendre, sans recalcul de leurs statistiques. Aucun nouveau
jeu de règles natif, actif, CSS ou dépendance. 69 modules, 274 dépendances sans
cycle ; app 382 lignes, pages 270, combat 399. 76 illustrations conservées.

## Vérification et reprise

- 515 tests Node réussis ; onze versions réellement fusionnées/invoquées,
  37 versions Sylve à quatre niveaux et deux camps au laboratoire, 1 072
  exécutions de combat de fusion (67 recettes × huit graines × deux exécutions
  déterministes), stocks, verrous et sauvegardes. Quinze tests spécifiques des
  Légendaires, dont effets aux deux camps, zéro ATQ, Riposte, Silence et quotas.
- 120 scénarios de parité identiques, archive V2.4 intacte ; 20 480 combats de
  contrôle et 6 144 d'arène réussis, aucun plateau invalide.
- Builds autonome, diagnostic et web réussis ; diagnostic non distribué.
- Premier parcours navigateur Sylve Légendaire bureau réussi : fusion, panne,
  deck protégé, export/import, invocation et Harcèlement réellement appliqué
  dans un combat de campagne normal, puis reprise exacte. Les autres formats
  et les 27 suites existantes sont en cours ; résultats finaux dans la PR.

Le pilote utilise l'horloge Playwright pour observer la sauvegarde entre les
camps : les temporisations à zéro du mode sans animations consommaient déjà
le malus avant lecture. Aucun pouvoir, résultat ou plateau n'est forcé. Les
premiers journaux de test sont conservés ; aucune assertion retirée.
La difficulté et l'effort de doublons restent à apprécier en jouant. Aucun
smartphone physique, équilibrage humain exhaustif ou déploiement n'est revendiqué.
