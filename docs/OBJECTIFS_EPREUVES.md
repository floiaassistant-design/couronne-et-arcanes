# Objectifs personnels des épreuves — PR 56, reprise du 28 octobre 2026

Branche `feat/objectifs-epreuves-aube`, réconciliée par fusion de main
`a0726d4408d6ffc4c767fdb1e51be0582ce01445`, sans réécriture d'historique.
Les PR 55, 57 et 58 sont intégrées ; l'accord du propriétaire porte ici sur
la poursuite de la PR 56, sans fusion ni publication.

Les décisions de cartes reprises sont celles du registre unique de main et du
[contrat des règles communes](REGLES_CARTES_UNIQUES.md). Aucune règle de carte,
statistique, rareté jouable ni décision Notion modifiée. La référence Notion
relue lors de la préparation originale était l'édition du 27/10/2026 à
06:13:46.581 UTC ; aucune nouvelle lecture ou écriture revendiquée ici.
Les seuils des défis sont des réglages proposés à la revue.

## Conditions des nouveaux départs

| Évolution | Défi du personnage au rang de départ |
| --- | --- |
| Milicien Commun → Rare | Rester vivant pendant 3 tours |
| Porte-égide Commun → Rare | Déclencher 2 Ripostes |
| Arbalétrière Commune → Rare | Infliger 4 dégâts effectifs à des unités ennemies depuis au moins deux cases devant elle |
| Milicien Rare → Épique | Déclencher sa réduction du premier coup |

Accomplir le défi, gagner et garder **le même exemplaire** vivant. Deux copies
ne peuvent pas additionner leurs exploits. La mort retire la candidature ; une
réinvocation obtient un nouveau uid et son propre compteur. Le relevé montre
le meilleur exemplaire vivant, pas un total historique de l'équipe.

L'ancien objectif d'intercepter deux attaques de couronne était fondé sur
l'ancienne Garde ; il est remplacé. Un coup visant directement un gardien ne
constitue pas une interception. Les nouvelles règles de Garde sont conservées,
y compris lorsqu'un ennemi dépasse un gardien. Seule une Riposte effectivement
résolue compte : contact, survie au coup, absence de Silence et quota commun
d'une fois par tour. Tirs, sorts et dégâts seuls ne comptent pas.

Les tours de survie sont comptés après validation des actions du joueur si le
Milicien est vivant sur le plateau. Une validation refusée ou une reprise ne
compte pas deux fois. Les dégâts à distance comptent les PV réellement perdus,
après protections et sans surdégâts ; contact, autre unité et héros/sorts exclus.
La réduction initiale reprend l'état réel du moteur, sans consommer un nouveau quota.

## Récompenses et portée

Les 12 missions gardent chacune leur carte native à la première victoire ; la
rejouer ne redonne pas cette carte. Les épreuves transforment un seul exemplaire
possédé et son slot de deck, sans augmenter le total de copies ni accorder or,
éclats, XP ou autre récompense de campagne. Le premier boss conserve son Gardien
des Racines et ouvre l'accès au Milicien Épique après l'épreuve Rare ; il ne
donne pas lui-même le Milicien. Attribution et reçu uniques conservés.

Rencontres, decks adverses, statistiques, prérequis et ressources restent ceux de
main. Les recoupements Tour/donjons (Archidruide, Vampire), les copies natives de
départ, les paquets et la fabrication ne sont pas modifiés. Les 37 autres évolutions
Aube restent au laboratoire. Pas de marchand, contrat, fusion de doublons ni
nouvelle récompense.

## Architecture et sauvegardes

- `engine/trial-objectives.js` : création/validation de l'objectif enregistré,
  comptage des faits et lecture pure des survivants ; aucun DOM, profil ou stockage.
- `battle.js` : signale tours et dégâts résolus ; compte une Riposte seulement
  lorsque `resolveRetaliation` renvoie vrai, sans recopier Garde/Riposte.
- `evolution-progress.js` : création et lecture de l'objectif avant transformation ;
  clôture récupérable et reçu inchangés.
- `ui/evolution-trials.js` : consignes et compteur « Défi · x/y », avec fiche
  compacte ; `battle-view.js` l'insère sans calcul métier ni nouvelle géométrie.
- `storage.js` : valide le champ facultatif `trialChallenge` et conserve le refus
  des anciens combats actifs incompatibles avec `cards-v2`.

L'objectif en bataille contient version, personnage/rang, métrique, seuil, texte,
compteurs par uid et dernier tour compté si nécessaire. Une épreuve déjà commencée
sous les règles actuelles sans ce champ garde sa condition de survie seule. Une
reprise ne l'enrichit pas. Les futurs réglages ne changent pas un objectif déjà
enregistré ; les données invalides sont refusées. Aucun second moteur de cartes.
Les profils, exemplaires gagnés et clés restent ; aucun gain rétroactif.

## Vérifications de cette reprise

Contrôles locaux terminés : **455 tests Node**, **120 scénarios déterministes**
identiques à la référence `cards-v2`, archive V2.4 intacte. Les tests incluent
les 12 récompenses de campagne (première victoire/rejeu), les quatre
transformations uniques, Riposte/quotas, Silence, mort, copies et reprise.
Simulations `control-balance` et `arena-balance` réussies. Builds autonome,
diagnostic et web réussis ; 57 modules, 76 illustrations.

Les **27 suites navigateur** (30 entrées réparties dans les quatre groupes) ont
réussi localement : bureau, portrait, paysage, HTTP et export hors réseau.
Les épreuves couvrent **13 parcours dont sept combats UI complets**, objectif
visible avant combat et compteur final, stocks/deck/export/import, invocation
future, reprise exacte, ancienne épreuve sans nouvel objectif, coupures avant
et après reçu, verrou du boss et absence de doublon. Captures des fiches/compteurs
examinées dans les trois formats. Aucun actif graphique modifié.

Commit/arbre exacts et CI finale :
[PR 56](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/56).
Les bilans de l'ancienne tête `6dc30bae` ne valident pas cette nouvelle version.

Les 33 graines précédentes restent dans la matrice. La graine 124 est ajoutée :
avec la Garde actuelle, le robot de référence n'obtenait plus le Milicien Épique
dans les anciennes graines ; cette graine termine réellement son objectif et
sa victoire. Aucun résultat forcé, seuil abaissé, statistique ou rencontre modifié.
La matrice couvre donc 34 graines × 4 épreuves × 2 répétitions = **272 combats**.
Le générateur navigateur cherche au plus 256 graines et conserve un vrai succès
par défi ; les actions sont rejouées avec les boutons du jeu. Cela prouve la
possibilité, sans garantir la facilité du défi pour un joueur humain.

## Export et provenance

`JOUER.html` reconstruit : **34 520 499 octets**, blob
`6fbe2f7eb8c085459a5e5c421d97faf327054029`, identique en local et sur GitHub.
Le [générateur ponctuel](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40665284799)
a réussi sur `5170958ee61fcf1a662ce8a49596b395fdad93fd` et enregistré l'export
au commit `cd976ec`. L'arbre source `033da52d526fb4979dd90631e0a173d1afd74dc0`
a été comparé au local avant envoi. Le générateur est retiré avant la livraison ;
les workflows permanents sont ceux de main. Les anciennes CI de préparation
ne valident pas la tête finale ; lire les deux passages associés dans la PR.

## Reprise et limites

Consulter le dernier commit et ses deux CI avant toute proposition de fusion.
Ne pas lancer un second passage déjà en cours ni surveiller activement la CI
quand aucun travail indépendant ne reste. Les quatre groupes de PR 58 et les
assertions restent obligatoires. L'export officiel est reconstruit depuis les
mêmes sources, sans variante de test distribuée.

Après vérification, proposer au propriétaire son essai/revue. La PR reste ouverte
et sa fusion attend son accord spécifique. Publication Sites distincte, réservée
au contenu intégré sur main. Limites : Chromium bureau/tactile simulé, aucun
appareil physique, Safari/Firefox ni équilibrage humain exhaustif.
