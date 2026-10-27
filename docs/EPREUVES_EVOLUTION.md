> **Contrat remplacé pour les règles natives :** la correction
> [Règles uniques](REGLES_CARTES_UNIQUES.md) applique Garde/Riposte validées
> à tous les exemplaires concernés et impose la relance des anciens combats
> actifs. Les mentions de règles natives historiques ci-dessous décrivent
> les livraisons précédentes, pas le fonctionnement proposé sur cette branche.

# Épreuves d’évolution Aube — contrat de la PR 55

Branche `feat/epreuves-evolution-aube`, depuis main `1177160856` (PR 54).
Le propriétaire demande de commencer l'obtention par épreuves et boss. Les
recettes et rencontres ci-dessous sont proposées dans cette PR ; elles ne
constituent pas une nouvelle validation inscrite dans Notion. Aucune écriture
Notion, fusion ou publication effectuée pour ce pilote.

## Parcours et récompenses

| Épreuve | Accès | Exemplaire transformé |
| --- | --- | --- |
| Tenir jusqu’à l’aube | Mission 01 terminée | Milicien Commun → Rare |
| Le serment du Porte-égide | Mission 02 terminée | Porte-égide Commun → Rare |
| La dernière volée | Mission 02 terminée | Arbalétrière Commune → Rare |
| Le rempart du Bosquet | Mission 03 et première épreuve du Milicien terminées | Milicien Rare → Épique |

Posséder un exemplaire du rang de départ et l'inclure dans un deck valide.
Remporter la bataille avec au moins une unité alliée correspondante, à ce rang
exact, encore vivante. Une carte dans la main ou une unité ennemie ne suffit pas.
Les conditions et la récompense garantie sont annoncées avant le combat.

La première réussite transforme un seul exemplaire et remplace un slot
correspondant du deck, sans changer sa taille. Aucun coût supplémentaire, tirage,
or, éclat ou XP d'épreuve. Défaite ou objectif manqué : aucune consommation.
Chaque épreuve ne récompense qu'une fois ; deux combats terminés ou deux reprises
ne donnent pas deux cartes. Le Milicien Rare consommé pour l'Épique reste un
rang connu dans la Collection, mais n'est plus compté comme possédé.

Le premier boss de campagne garde deck, statistiques, quatre lignes et furie.
Sa victoire ouvre l'accès à l'épreuve Épique, avec l'épreuve Rare en prérequis.
L'épreuve elle-même est une rencontre de difficulté 2 à deux lignes, sans
statut de boss/furie : la version initiale à quatre lignes était trop difficile
dans la matrice de vérification. Aucun autre combat n'est rééquilibré.

## Données, deck et combat

Les références natives restent des chaînes (`'militia'`). Les évolutions sont
des objets (`{id:'militia',rarity:'rare'}`). `militia:rare` sert de clé de vue ou
d'inventaire, jamais de nouvel ID `CARDS` ou de chaîne de deck.

`evolvedCollection` et `completedTrials` apparaissent seulement si fournis ou
après une transformation. Un ancien profil n'obtient aucune copie automatiquement.
Les stocks sont distincts pour chaque rang. Les imports refusent rangs inconnus,
quantités invalides et decks excédant les stocks ; les clés de stockage restent.

Les quatre versions pilotes ont `status.combat: implemented`, obtention `trial`.
Les 37 autres évolutions Aube restent `pending`, au laboratoire uniquement.
Un nouveau combat dont le deck contient une version gagnée porte
`evolutionsEnabled: true`. Seules ses unités futures portent leur rareté et
`cardRules: aube-v1` ; les natifs et anciennes batailles gardent leurs règles.
Pioche, main et recyclage préservent l'identité de version. Les PV et quotas
sauvegardés ne sont jamais recalculés à la reprise.

Améliorations payantes, maîtrise, Forge, équipement et réputation restent
indépendants du rang. L'entraînement est partagé par personnage et ne donne
aucune nouvelle rareté. Paquets, fusion existante et extraction conservent
leur catalogue natif. Pas de nouveau marchand, paquet ou contrat de faction.

## Clôture récupérable et interface

L'interface sauvegarde la bataille terminée, résout sur des copies puis sauve
le profil avec son reçu. Elle supprime ensuite la bataille en attente.
Si l'écriture du profil échoue, ni le profil courant ni les exemplaires ne
changent ; le combat reste disponible après rechargement. Une autre action
ne peut pas écraser cette épreuve non réglée. Si le nettoyage échoue après
le reçu, la reprise nettoie sans consommer/récompenser à nouveau.

Collection : six rangs visibles par personnage, vrais stocks par version,
fiche commune sans attribution au survol/focus/toucher. « Mon deck » propose
les versions gagnées avec +/− et les mêmes validations. La récompense est
annoncée en campagne pour le premier boss et détaillée dans « Épreuves ».

## Vérification et limites

`evolution_progress.test.mjs` couvre inventaire, accès, moteur, récompenses,
quotas, compatibilité et combats déterministes. Le générateur de scénarios
navigateur utilise des combats entiers du moteur et trouve une réussite sans
forcer le résultat. `browser_evolution_trials.py` rejoue ces actions par les
commandes réelles du jeu, vérifie Collection/deck/export/import/campagne et les
deux interruptions de clôture. La CI exécute cette suite en complément des
parcours existants. Les fixtures ciblées de défaite/objectif manqué sont
distinctes des parcours complets de réussite.

Les résultats réellement obtenus, la tête et les tâches restantes figurent dans
[la reprise](REPRISE_EPREUVES_EVOLUTION.md) et la [PR 55](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/55).
Chromium simulé ne prouve pas le comportement d'un téléphone physique,
Safari/Firefox ou un équilibrage humain exhaustif.
