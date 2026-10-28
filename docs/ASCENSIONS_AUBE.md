# Ascensions communes — fin de l'obtention Aube, 28 octobre 2026

Branche `feat/ascensions-aube`, depuis main
`63ff7463b89d4f2ff410063a47ba2473087884bc` (PR 61 fusionnée sur accord ;
tests et assemblage main réussis). Le propriétaire demande de poursuivre tout
le travail nécessaire ; cette proposition termine le lot Aube sans déduire
un accord de fusion de la nouvelle PR ou de publication.

## Deux défis pour tout l'Ordre

Les 20 évolutions Divines/Éveillées restantes deviennent obtenables par fusion
après deux grandes épreuves communes. Aucune épreuve par personnage : une
réussite ouvre les dix recettes du rang pour les dix unités Aube, y compris
l'Ange du Bastion, déjà Légendaire natif. Le laboratoire reste disponible.

| Épreuve proposée | Accès | Conditions de victoire |
| --- | --- | --- |
| Le Serment divin | Mission 09 gagnée ; un Aube Légendaire et trois personnages Aube distincts dans le deck | Trois Aube distincts encore vivants, dont un Légendaire ; couronne à au moins 40 % de ses PV max ; tour 24 au plus tard |
| L'Éveil du Bastion | Mission 12 gagnée ; Serment divin accompli ; un Aube Divin et quatre personnages Aube distincts dans le deck | Quatre Aube distincts encore vivants, dont un Divin ; couronne à au moins 60 % de ses PV max ; tour 24 au plus tard |

Le rang requis est exact ; plusieurs copies/rangs du même personnage ne
comptent que pour un personnage distinct. Ennemis, morts et autres Ordres ne
comptent pas. Toutes les conditions et la victoire sont nécessaires. Les PV
sont évalués proportionnellement au maximum réel de la couronne, pas un nombre
fixe indépendant de l'équipement. Le bouclier ne remplace pas ces PV.

Chaque rencontre utilise le moteur ordinaire, quatre lignes de boss et des
cartes ennemies natives : Conseil des Serments, difficulté 5/48 PV ; Gardien de
l'Éveil, difficulté 6/60 PV. Aucune mécanique de boss ou unité parallèle.
Ces paramètres, conditions et missions sont une proposition d'obtention à
l'essai, pas des pouvoirs de cartes ou des décisions inventées dans Notion.

## Récompense et économie

**L'ascension ne donne aucune copie.** Elle autorise une fois les fusions du
rang ; chaque fusion exige ensuite **trois copies libres identiques du rang
précédent pour une copie du rang suivant**, sans or/éclats/aléa. Les copies du
deck restent protégées ; le joueur ajoute ensuite la carte créée dans Mon deck.
Une nouvelle recette ne transforme ni la collection existante ni un ancien deck.

Tenter ou rater le défi ne consomme aucun exemplaire, or ou éclat. Les épreuves
ne distribuent ni XP, maîtrise, réputation ni récompense de campagne. Un succès
ne modifie que le reçu `completedTrials` ; les quatre épreuves pilotes gardent
leurs transformations uniques et leur remplacement de slot. Le paquet Aube
reste à 190 or, groupes 60/35/5 Rare/Épique ; le paquet mystique à 95 or et
65/28/7 natifs. Aucun rang supérieur ajouté aux paquets ou aux butins.

Avec ce lot : **41 évolutions Aube obtenables**, plus les dix natifs, soit les
51 versions définies. Aucune évolution Aube ne reste exclusivement au labo.
Les statistiques, capacités et règles des cartes sont inchangées depuis les
patches validés : [tableau maître](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f),
édition relue `2026-10-27T06:13:46.581Z`. Aucun autre Ordre transcrit, aucune
écriture Notion ou nouvelle illustration. [Suite des factions](REPRISE_MIGRATION_CARTES.md).

## Architecture, sauvegarde et reprise

- `evolution-trials.js` conserve les quatre `EVOLUTION_TRIALS`, ajoute les deux
  `EVOLUTION_ASCENSIONS` et la lecture `ALL_EVOLUTION_TRIALS`. Les missions des
  fusions Divines/Éveillées dérivent de ces rencontres ; aucun deuxième accès.
- `engine/ascension-objectives.js` est un lecteur pur du plateau/couronne/tour.
  `trial-objectives.js` distribue les objectifs v1 existants et v2 composites.
  Le v2 sauvegarde les seuils et le texte au départ, avec validation structurelle
  et bornes ; aucun objectif absent ou ancien repli ne suffit à une ascension.
- `engine/evolution-progress.js` partage accès/création, puis attribue soit la
  transformation pilote, soit l'autorisation de rang. Victoire/objectifs/accès
  revérifiés, attribution unique. Combat actif ou résultat non récupéré bloque
  le départ. La campagne annonce les accès sur les boss 09/12.
- Les identifiants restent dans `completedTrials` : normalisation, import,
  export et partie précédente conservent les six reçus connus. Aucun champ,
  clé ou migration de profil supplémentaire ; ancien profil sans reçu inchangé.
- Le contrôleur existant règle une copie du profil/bataille, sauvegarde le reçu,
  puis adopte et nettoie le combat. Panne de profil : rien acquis ; reprise
  réessaie. Panne de nettoyage : reçu reconnu, aucun nouveau déblocage ou gain.
  Après succès, l'ascension est fermée et les fusions restent répétables.
- Alchimie et la fiche commune affichent le vrai verrou. Aucun pouvoir ou
  attribution dans les vues. Un seul module de production ajouté : 66 modules,
  76 illustrations, aucun CSS, bibliothèque ou changement de révision de combat.

## Vérifications

**490 tests Node réussis**, dont les 41 consommations de fusion, les vingt
nouvelles versions réellement invoquées après ascension, import/reprise, deux
combats complets sans résultat forcé, absence de cadeau, accès/verrous, identité
unique des personnages, seuils exacts, refus des objectifs invalides et protection
du deck. Ange Divin/Éveillé : Intervention avec protections, bouclier d'arrivée
et aucune répétition ; Milicien Éveillé : Dernier Rempart et quota sauvegardé.
Les tests de pouvoirs communs et les 51 totaux indépendants restent actifs.

**656 combats de contrôle** avec une version réellement fusionnée. **256
exécutions déterministes d'ascension**, deux défis × quatre niveaux × seize
graines rejouées : succès et échecs réels, fin, plateau et profil conservés.
**120 scénarios de référence identiques**, archive V2.4 intacte. Builds autonome,
diagnostic et web réussis, mêmes règles et images.

Lors de la préparation, un bot fixe avec un deck Aube avancé, bastion 2/forge 1,
a été mesuré sur 32 graines par niveau : déblocages Divins 6/17/26/29 sur 32
aux niveaux 0/1/2/3 ; Éveillés 3/6/15/22. Le profil de l'Éveil possède déjà ses
Divines. Ces nombres décrivent ce bot/deck, pas la difficulté pour un humain.
Ils montrent que les épreuves sont gagnables et que gagner ne suffit pas toujours
à valider l'objectif ; ils ne remplacent pas l'essai du rythme de progression.

Les nouveaux parcours sont distribués une fois dans les quatre parties existantes :
bureau/Divin et portrait/Éveillé jouent tout le combat dans l'export réel ;
paysage/Divin et HTTP/Éveillé reprennent des résultats issus de vrais combats et
simulent les deux pannes de clôture. Tous vérifient ensuite le déblocage sans
cadeau, fusion de l'Ange, annulation/double clic, Collection/deck, export/import,
vraie invocation après son délai de trois tours et reprise exacte. Les 27 suites,
les quatre groupes et leurs contrôles obligatoires sont conservés. Résultats
complets/captures/CI du commit exact dans la PR ; aucun succès anticipé.

## Distribution et limites

Export `JOUER.html` reconstruit : **34 547 008 octets**, blob
`617d56535c6f350b7d6a4bb71fc8123ef4512a2b`. Vérifier les arbres et le blob
après enregistrement GitHub ; ne pas éditer l'HTML à la main. Diagnostic jamais
distribué. Générateur ponctuel retiré avant PR, workflows permanents inchangés.

Terminer les travaux indépendants, pousser et ouvrir la PR. Ne pas relancer un
contrôle en cours ni attendre activement la CI quand seul son résultat demeure.
Chaque nouvelle fusion exige son accord propre ; Sites suit le flux existant
après intégration autorisée. Chromium/tactile simulé ; aucune validation de
smartphone physique, Safari/Firefox, équilibrage humain final ou publication.
