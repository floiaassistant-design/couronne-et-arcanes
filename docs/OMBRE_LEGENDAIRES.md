# Ombre Légendaire — proposition du 2 novembre 2026

## Base et source

Base vérifiée : main `039a6a7d9a9de3ddb2feaccd58999924444daab6`, intégrant
la PR 70 après accord et tous les contrôles réussis. Arbre strictement identique
à la tête testée. Branche `feat/ombre-legendaires`. Cette nouvelle proposition
exige son propre accord de fusion et n'est pas publiée.

Source : [tableau maître Notion](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f),
édition `2026-10-27T06:13:46.581Z`, relue le 2 novembre. Les dix cellules
Légendaires complètes sont transcrites dans `cards/ombre.js` ; l'Archiliche
est déjà Légendaire native. Le délai de la Lame nocturne reste celui du
catalogue actuel, confirmé à 1. Aucune écriture Notion ni nouveau pouvoir conçu.

## Périmètre et obtention

Dix Légendaires nouvelles portent l'Ombre à 32 versions définies, dont
21 évolutions. Total Aube/Sylve/Ombre : 110 recettes. Les 22 Divines/Éveillées
Ombre restent absentes du registre et de l'obtention. Les 53 unités et 23 sorts
natifs ainsi que les évolutions déjà intégrées conservent leurs valeurs.

Trois Épiques libres du même personnage donnent une Légendaire après victoire
réelle de mission 06. Banshee et Vampire utilisent leurs stocks Épiques natifs ;
les huit autres personnages, leurs stocks évolués. Copies du deck protégées,
confirmation et sauvegarde avant adoption. Pas de coût en or/éclats, d'ascension
ou épreuve individuelle, de cadeau ni de saut de rang.

Les quatre paquets conservent prix, groupes, ordre et tirages. Le paquet Ombre
reste à 190 or, pools 8/3/8, taux 60/35/5 ; aucune nouvelle Légendaire dans les
paquets ciblés. Les récompenses de campagne et les stocks natifs restent intacts.

## Pouvoirs et interactions

Les statistiques suivent les totaux validés. Portée 2 et Vol de la Banshee,
Célérité/Charge de l'Ombre et du Spectre, Poison 1 pendant deux tours du Faucheur,
Perforation de la Lame et cadence de Silence de l'Inquisiteur sont conservés.
Le Chevalier passe à 5 ATQ de base, 7 sur frappe chargée hors bonus, avec
Riposte à l'ATQ effective sans Charge, au plus une fois par tour ; aucune Garde.

Le Vampire conserve Vol de vie 2 à chaque attaque effectuée, même absorbée,
sans dépasser les PV maximum de sa couronne. Sa fiche lit ces paramètres,
comme la résolution commune désormais paramétrée ; valeur, déclenchement,
Silence et comportement simultané historiques restent inchangés.

**Veille funéraire du Veilleur :** après la destruction d'une autre unité
alliée sur sa ligne, s'il vit et n'est pas silencieux, il reçoit jusqu'à deux
points de barrière personnelle. Plafond deux pour cet effet, au plus une fois
par tour. Il conserve Garde positionnelle et Armure 2 ; aucune Riposte ajoutée.

- Réaction immédiate au décès effectif, avant les dégâts suivants, y compris
  pour poison, sort ou piège. Aucun gain pour une autre ligne, un ennemi,
  sa propre mort ou le simple départ d'une unité vivante.
- Un marqueur par Veilleur et tour, indépendant des autres copies. La première
  mort éligible utilise le quota même si le plafond est déjà atteint ; perdre
  la barrière ensuite ne permet pas un second gain pendant ce tour.
- Silence bloque la nouvelle réaction ; un décès observé sous Silence n'est
  pas rejoué ensuite. Étourdissement n'empêche pas cette réaction passive.
  Les barrières déjà accordées persistent après Silence ou mort du Veilleur.
- Le plafond porte sur cet effet ; les protections d'autres sources coexistent,
  sans perte de surplus. Consommation commune des barrières, sans dégâts copiés.
- Les décès sont traités une fois dans leur ordre réel. Le balayage retire
  les morts sans redéclencher la réaction ; plusieurs Veilleurs vivants sur
  la ligne peuvent chacun réagir avec leur propre quota.

Le quota est facultatif et validé à la reprise. Les objets de barrières sont
remplacés pour préserver les instantanés. Les sauvegardes anciennes restent
sans nouveau champ tant que cet effet n'est pas utilisé ; pas de migration,
reset de profil, changement de clé, ID, niveau ou maîtrise.

## Architecture

`engine/unit-barriers.js` extrait les primitives de barrières existantes pour
les partager entre défense et réactions aux morts, sans dépendance cyclique.
`battle-defense.js` réexporte leurs fonctions : les imports existants restent
valides. Ordre et champs historiques de consommation sont préservés ; la clé
funéraire n'est pas ajoutée aux unités qui n'ont jamais reçu cet effet.

`unit-death.js` utilise la sélection alliée et les barrières communes pour
notifier les Veilleurs vivants. `unit-effects.js` valide le quota et partage
Vol de vie paramétré ; `battle-control.js` reconnaît Veille parmi les capacités
qui peuvent être réduites au silence. Les fiches et le laboratoire restent
ceux du registre unique, aucun pilote de carte ni moteur parallèle.

Même code et ressources pour le web et `JOUER.html`, unique export autonome.
Aucun actif, CSS, dépendance ou nouveau jeu de règles natives ; `cards-v2`
conservé. Le diagnostic ne fait pas partie de la distribution.

## Contrôles et reprise

`ombre_legendary.test.mjs` couvre fusions et stocks, pouvoirs effectifs,
réactions/quotas/Silence aux deux camps, poison, plafonds, reprise et instantanés.
Il charge réellement le moteur embarqué et exécute Veille sans DOM. Les tests
de catalogue exercent 32 versions Ombre à quatre niveaux et deux camps ; les
110 recettes passent par le robot partagé (1 760 exécutions déterministes).

Le pilote de fusion Légendaire existant est étendu par scénario à l'Ombre :
source Épique protégée, boss 06, panne, double clic, Collection/deck, export/import,
délai de main réellement attendu, invocation du Faucheur, Poison effectif et
reprise. Il conserve le scénario Sylve et lit aussi la fiche Veille funéraire.
Les quatre parties de CI réutilisent ces appels ; inventaire permanent inchangé.

Résultats et SHA exacts à lire dans la PR. Chromium simulé ne valide pas
Safari, Firefox, un téléphone physique ou la difficulté humaine. Après revue,
accord spécifique, intégration et publication par le flux existant : relire
les 22 Divines/Éveillées Ombre avant de préparer leur mécanique et leur accès.
