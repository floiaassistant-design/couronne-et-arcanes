# Sylve Divine / Éveillée — proposition du 1er novembre 2026

Base vérifiée : main `e130b3009679927bcd57e6fc59a7ddacbe9c14d2`, après PR 68.
Branche `feat/ascensions-sylve`. Ce contrat décrit le lot proposé ; sa présence
ne confirme ni fusion ni publication. Accord spécifique requis pour cette PR.

## Source et périmètre

Les 22 cellules supérieures des onze personnages ont été relues dans le
[tableau maître Notion](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f),
édition `2026-10-27T06:13:46.581Z`. Aucune écriture Notion. Le registre
`cards/sylve.js` porte les remplacements de paramètres et la provenance.
Les onze natifs et les 26 évolutions antérieures gardent leurs valeurs.
La Sylve compte désormais, sur cette branche, 59 versions dont 48 évolutions ;
89 recettes Aube/Sylve au total. Les 53 natifs et 23 sorts restent au catalogue.

## Obtention proposée

Deux rencontres communes suivent le parcours Aube, sans défi individuel :

| Ascension Sylve | Prérequis | Conditions de victoire | Accès ouvert |
| --- | --- | --- | --- |
| Le Serment des Racines | Mission 09 vaincue, deck valide et possédé, un Légendaire Sylve et trois personnages Sylve distincts | Tour 24 au plus, trois personnages Sylve distincts vivants dont un Légendaire, couronne à 40 % des PV max au moins | Onze fusions Divines |
| L’Éveil de la Canopée | Mission 12 vaincue, Serment des Racines accompli, un Divin Sylve et quatre personnages Sylve distincts au deck | Tour 24 au plus, quatre personnages Sylve distincts vivants dont un Divin, couronne à 60 % des PV max au moins | Onze fusions Éveillées |

Noms, compositions adverses et réglage de ces rencontres sont une proposition
pour cette PR, réutilisant les seuils et primitives Aube. Ils ne constituent
pas de nouvelles validations Notion des pouvoirs. Boss à 48/60 PV, difficulté
5/6, quatre lignes, cartes adverses natives et IA existante. L'essai ne coûte
rien ; la réussite ne donne ni carte, or, éclat ni XP. Elle enregistre seulement
son identifiant dans `completedTrials`, une fois. Ascensions Aube et Sylve
restent indépendantes. Combat actif et résultat non enregistré bloquent le départ.

Après accès, trois exemplaires libres du rang exact précédent créent un
exemplaire du rang suivant. Transaction existante sur copie, confirmation,
sauvegarde avant adoption, deck protégé. Les paquets, taux, prix, pools
Rare/Épique, niveaux et maîtrise sont conservés ; aucun cadeau ni migration.

## Pouvoirs et résolution

- Éclaireuse : Entrave de mouvement après attaque touchant une unité survivante.
  Une fois par invocation Divine ; au rang Éveillé, délai de trois tours entre
  applications. Un seul déplacement de résolution est sauté, sans bloquer
  l'attaque ; pas de cumul. Si déjà étourdie, elle attend la prochaine phase
  où elle pourrait se déplacer. Pas de quota consommé sur cible morte ou frappe nulle.
- Loup : Perforation de la frappe chargée seulement, autres protections
  conservées. Sans déplacement, armure normale. Trois pas au rang Éveillé,
  sans attaque supplémentaire.
- Gardien : Garde de toute sa ligne même dépassé, puis de toutes les lignes.
  Le sélecteur commun choisit un seul gardien par frappe. Une interception
  interligne ne crée pas de Riposte à distance.
- Dryade : après soin effectif, Régénération 1 sur les deux prochains tours de
  combat de la cible ; rafraîchissement à deux sans cumul. Soin immédiat 3
  au rang Éveillé. Effet appliqué indépendant de la survie de la soignante.
- Cerf : après frappe chargée sur unité, barrière personnelle 2 ; au rang Éveillé,
  également un autre allié de sa ligne, priorité au plus blessé proportionnellement,
  puis colonne/uid. Plafond 2 par cible pour cet effet, sans effacer les autres
  barrières. Pas de gain contre une couronne seule ou sans déplacement.
- Traqueur : Poison 2 pendant trois tours. Une nouvelle application remplace
  l'intensité active et rafraîchit sa durée ; aucun empilement de dégâts.
  Au rang Éveillé, au premier décès d'une victime portant encore son poison,
  contagion 2 pendant deux tours au plus proche ennemi vivant de la même ligne.
  Égalité : colonne puis uid. Une fois par invocation, sans chaîne. La provenance
  reste attachée au poison si le Traqueur meurt ou devient silencieux. Le premier
  décès éligible consomme le quota même sans autre cible. Le dernier tick létal
  est éligible ; un poison expiré ou dissipé ne l'est plus. Les morts sont traitées
  dans leur ordre réel. Une contagion pendant la phase de poison attend le
  prochain tour de la cible, sans tick immédiat selon sa colonne. Le moteur conserve
  son modèle historique d'un seul poison actif, y compris entre sources.
- Luciole : à sa destruction en combat, bouclier de couronne +2 puis +4,
  plafond 20 sans réduire un surplus. Réaction immédiate avant la frappe suivante,
  jamais répétée au retrait du plateau ou à la reprise. Aucune seconde application d'arrivée,
  aucun effet en quittant simplement le plateau.
- Ours : perte réelle de PV par attaque ennemie, protections déjà résolues,
  et survie requise : Fureur +2 puis +3 sur sa prochaine attaque. Pas de cumul,
  pas d'activation par poison, sort ou piège. Bonus consommé à l'intention
  d'attaque, sans modifier l'ATQ permanente ni une intention déjà préparée.
  Au rang Éveillé, élimination d'une unité par cette attaque : barrière 2,
  plafond 2 pour cet effet, au plus une fois par tour.
- Archidruide : après soin effectif, enlève le poison de cette seule cible.
  Au rang Éveillé, soin 3 et retrait de l'Entrave de mouvement. Étourdissement,
  Silence et autres états gardent leurs règles ; aucun retrait sans PV restaurés.
- Hibou : Harcèlement −2 sur la prochaine attaque puis les deux prochaines,
  Riposte comprise ; minimum zéro, rafraîchi sans cumul, bonus calculés avant malus.
- Trappeur : piège 2 dégâts puis étourdissement existant. Une victime survivante
  reçoit Poison 1 pour ses deux prochains tours, sans tick immédiat pendant le
  déclenchement. Période trois puis deux tours, au plus une pose par tour,
  case libre éligible juste devant, deux pièges par camp et expiration à trois
  résolutions inchangés. Aucun poison sur une victime déjà détruite.

Silence bloque les nouvelles capacités déclenchées. Les traits passifs,
protections déjà appliquées et effets différés gardent leurs règles. Les
fiches détaillent portée, conditions et fréquences ; les badges du plateau
montrent Entrave et Fureur. Les valeurs d'ATQ et déplacement sont partagées
avec les lecteurs publics de l'IA, sans exposer les cartes cachées.

## Architecture, reprise et vérification

`unit-poison.js` porte application, dissipation, tick, provenance et contagion ;
`unit-triggers.js` les protections après frappe ; `unit-death.js` les réactions
immédiates à la destruction, sans cycle avec les défenses ;
`unit-targets.js` extrait la sélection alliée existante, réutilisée par soins
et barrières. Pas de moteur alternatif, CSS, actif ou dépendance ajouté.
États facultatifs validés à la reprise : Entrave, fréquence d'application, destruction déjà résolue,
Fureur, quota de barrière, origine du poison, quota de contagion et piège enrichi.
Les objets imbriqués sont remplacés pour préserver les instantanés d'événements.
Les clés, ID, sauvegardes anciennes et `cards-v2` sont conservés. Le web et
l'unique export `JOUER.html` sont générés depuis le même graphe de modules.

Points d'entrée : `sylve_ascended.test.mjs`, `sylve_ascensions.test.mjs`,
versions/niveaux/deux camps dans `sylve_evolutions.test.mjs`, recettes et combats
partagés dans `evolution_fusion.test.mjs`. Les scénarios d'ascension utilisent
le moteur et le robot communs ; les quatre parties navigateur existantes
ajoutent les ascensions Sylve, sans nouvelle commande ni double exécution.

Contrôles locaux : 559 tests Node réussis, 120 scénarios de parité identiques,
builds autonome, diagnostic et web réussis. Un import renommé, valide en ES
modules mais non pris en charge par le builder autonome, a été remplacé par
l'import direct. Un contrôle de syntaxe du script distribué prévient cette
régression. Le graphe commun compte 74 modules et 290 dépendances sans cycle.
Les simulations locales de contrôle (20 480 combats) et d’arène (6 144 combats,
aucun plateau invalide) sont terminées. Les résultats de CI et des parcours
navigateur restent dans la PR, associés à leur SHA exact. Les contrôles de robot ne
valident pas la difficulté humaine, Safari/Firefox ou un téléphone physique.
Après revue, accord spécifique, fusion et publication via le flux existant :
reprendre les 43 évolutions Ombre, après relecture de leurs validations Notion.
