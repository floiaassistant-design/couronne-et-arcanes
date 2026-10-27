# Objectifs personnels des épreuves — suite de la PR 55

Branche `feat/objectifs-epreuves-aube`, base main
`b58ea3f00330d5f1db3675a2611ddcca8374e699`. La PR 55 a été fusionnée sur accord
explicite après ses deux CI réussies. L'autorisation ne couvre pas la nouvelle
PR ; aucune fusion ou publication de cette suite n'est autorisée.

Le tableau maître Notion a été relu, édition `2026-10-27T06:13:46.581Z`.
Aucun pouvoir/chiffre de carte ni décision Notion modifié. Les seuils des défis
ci-dessous sont des réglages proposés à la revue de cette PR.

## Conditions des nouveaux départs

| Évolution | Défi du personnage au rang de départ |
| --- | --- |
| Milicien Commun → Rare | Rester vivant pendant 3 tours |
| Porte-égide Commun → Rare | Intercepter 2 attaques visant sa couronne |
| Arbalétrière Commune → Rare | Infliger 4 dégâts effectifs aux unités ennemies depuis au moins deux cases devant elle |
| Milicien Rare → Épique | Déclencher sa réduction du premier coup |

Accomplir le défi, gagner et garder **le même exemplaire** vivant. Deux copies
ne peuvent pas additionner leurs exploits. La mort retire la candidature ; une
réinvocation possède un nouveau uid et recommence son compteur. Le relevé montre
le meilleur exemplaire encore vivant, pas un total historique de l'équipe.

Les tours de survie sont comptés après validation des actions du joueur, si le
Milicien est encore sur le plateau et vivant. Une validation refusée ou une
reprise n'ajoute pas un second tour. Les dégâts à distance comptent les PV
réellement perdus, après protections et sans surdégâts. Contact, attaques d'une
autre unité et dégâts du héros/sort ne comptent pas. Une interception compte
lorsque le moteur détourne réellement une attaque de couronne ; frapper une
unité portant Garde n'est pas une interception.

Les natifs gardent leurs règles historiques, notamment Garde/Riposte du
Porte-égide Commun. Cette PR ne convertit pas leurs règles en celles des versions
futures. Les réductions déjà programmées et leurs quotas sont réutilisés.

Rencontres, decks adverses, prérequis de campagne/boss, récompenses uniques,
consommation d'un seul exemplaire et slot de deck restent ceux de la PR 55.
Aucun paquet, fusion de doublons, contrat, marchand ou évolution supplémentaire.

## Architecture et compatibilité

- `engine/trial-objectives.js` : objectif enregistré au départ, validation,
  relevé des faits et lecture pure des survivants. Pas de DOM/profil/stockage.
- `battle.js` : signale les interceptions et dégâts des attaques résolues,
  puis les tours validés. Aucun second calcul de dégâts ni règle de Garde.
- `evolution-progress.js` : crée l'objectif et réutilise sa lecture avant
  transformation. La clôture avec reçu reste inchangée.
- `ui/evolution-trials.js` : consignes avant combat et composant commun
  « Défi · x/y », ouvrant une fiche compacte ; `battle-view.js` l'insère dans
  le bandeau existant, sans modifier la géométrie du plateau.
- `storage.js` : validation stricte du champ facultatif `trialChallenge`.

`trialChallenge` appartient seulement à la bataille : version, personnage/rang,
métrique, seuil, texte, compteurs par uid et dernier tour compté si nécessaire.
Les conditions sont enregistrées au départ et conservées à la reprise même si
un réglage ultérieur change. Les compteurs invalides sont refusés à la lecture.

Une ancienne épreuve sans ce champ conserve **la condition de survie seule** et
son texte d'origine. La consultation n'ajoute aucun compteur/champ à cette
bataille. Les profils, possessions déjà gagnées et clés historiques restent ;
aucune récompense rétroactive ni seconde réussite d'une épreuve terminée.

## Vérification et reprise

- 441 tests Node réussis, dont neuf nouveaux cas sur les objectifs.
- 60 scénarios de parité identiques ; 57 modules, 222 dépendances sans cycle,
  76 illustrations ; `battle.js` reste à 397 lignes.
- Matrice des quatre épreuves étendue aux graines 1–32 et 41 : 264 combats
  terminés/déterministes, avec au moins une vraie réussite par épreuve.
- Les fixtures d'attribution complètes sont distinctes des combats simulés :
  ceux-ci doivent toujours atteindre les objectifs par les actions du moteur.
- Parcours navigateur complet et contrôles ciblés en cours au checkpoint :
  compteur 0/seuil avant combat et seuil/seuil en victoire, bureau/portrait/
  paysage, HTTP/hors réseau, inventaire/deck/campagne et reprise ancienne/nouvelle.

Résultats et tête exacte dans la description de la nouvelle PR. Les logs locaux
peuvent disparaître : `/tmp/ca-personal-all.log`, `ca-personal-browser.log` et
`ca-personal-regression.log`. Playwright 1.56/Chromium 1194 disponibles via
`/tmp/ca-evolution-pw` si encore présents. Ne pas reconstruire les HTML pendant
que les navigateurs les lisent.

Avant livraison : terminer les parcours, examiner les captures des trois formats,
valider le paquet web, synchroniser l'unique `JOUER.html` et supprimer le générateur
temporaire s'il a été utilisé. Vérifier les arbres GitHub/local et les deux CI de
la tête exacte. Si seule la CI reste, arrêter sans surveillance active.

Limites : Chromium simulé, aucun téléphone physique/Safari/Firefox ; la réussite
du robot démontre une possibilité, sans garantir un équilibrage humain exhaustif.
Publication Sites distincte, non revendiquée ici.
