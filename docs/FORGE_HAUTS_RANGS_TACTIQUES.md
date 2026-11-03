# Forge — dix hauts rangs tactiques

Proposition du 3 novembre 2026 après la fusion de la PR 82, main
`e3800b8b581efc89344db267f9a2f5e58884c323`, arbre
`151beffffdbaf5f296e0a6a0e7e858955215bb1a`. Conception relue dans le tableau
maître Notion, édition `2026-11-02T16:09:01.799Z`, sans écriture ou nouvelle
validation de conception. Les statistiques ci-dessous sont les totaux de base.

## Dix versions sur cinq personnages

| Carte | Totaux ATQ/PV/délai | Divin | Éveillé |
| --- | --- | --- | --- |
| Sapeur gobelin | 5/5/2 | Charge fissurante : cible secondaire blessée, −1 Armure temporaire | Démolition totale : cibles principale et secondaire blessées, −2 Armure temporaire |
| Ingénieure d'acier | 3/9/3 | Calibrage de précision : Inspiration donne Ignore Armure 1 | Calibrage suprême : Ignore Armure 2 et barrière personnelle 1 si la frappe retire des PV |
| Mécaniste des Hauts-Fours | 3/10/2 | Blindage provisoire : Inspiration donne +1 Armure temporaire | Blindage renforcé : bonus remplacé par +2 Armure |
| Canon des Terres Rouges | 5/9/3 | Obus de repérage : une attaque d'un autre allié à +2 bruts | Barrage coordonné : deux attaques à +2 bruts |
| Alchimiste des Braises | 4/7/2 | Catalyse des braises : consomme son poison, 2 dégâts bruts protégés | Combustion totale : remplace les 2 dégâts par 4 |

Géométries et capacités héritées conservées : Impact 2 contigu, Inspiration sur
un seul autre allié tous les 3 tours et plafond 12 ATQ, Distance 2 du Canon,
Poison 1 pendant 2 tours. Aucune nouvelle capacité donnée aux natifs.

## États d'Armure et Inspiration

Fracture exige une perte effective de PV et une cible survivante. Le malus
concerne la prochaine attaque directe d'une unité ennemie reçue, Riposte comprise,
ou expire à la fin du tour suivant. Les dégâts d'Impact restent à 2 bruts, avec
leurs protections ; les cases vides ou alliées ne sont pas traversées. Au rang
Divin, seule la cible secondaire est concernée ; au rang Éveillé, la cible
principale peut aussi recevoir le malus. Aucun cumul ; le plus fort est conservé.

L'allié doit effectivement gagner de l'ATQ par Inspiration pour recevoir
Calibrage ou Blindage. Au plafond 12, aucun nouvel effet associé n'est accordé.
Les soutiens restent limités à un autre allié de la ligne. Silence bloque les
nouvelles applications ; un effet déjà posé reste utilisable sous Silence.

Calibrage attend la prochaine attaque contre une unité, pas une couronne.
Blindage attend la prochaine attaque directe ennemie reçue. Une attaque
absorbée consomme l'utilisation ; sort, poison et dégât secondaire ne la
consomment pas. Les deux expirent en fin du tour suivant. La Perforation ignore
encore toute l'Armure, mais l'attaque consomme ces effets. Leur montant ne se
cumule pas entre copies ; un effet plus faible ne rétrograde pas le plus fort.

Le moteur calcule une seule Armure effective pour la frappe : Armure de base,
Blindage, Fracture puis Calibrage, minimum zéro. L'Armure permanente n'est jamais
mutée. La barrière du Calibrage suprême exige une perte de PV sur la frappe
directe et un attaquant encore vivant après les réactions immédiates. Son
plafond propre 1 coexiste avec les autres barrières.

## Repérage

Le tir normal du Canon doit retirer des PV à une unité qui survit. Il peut
marquer au plus une fois tous les 3 tours. La marque attend une autre invocation
alliée : son propre Canon n'en bénéficie pas, mais un autre Canon le peut.
Le bonus de 2 bruts est ajouté à la frappe avant ses protections normales,
sans attaque supplémentaire. Une frappe absorbée consomme une utilisation ;
une attaque nulle n'en effectue pas. Riposte d'un autre allié incluse, sorts,
poison et dégâts secondaires exclus.

La marque expire en fin du deuxième tour suivant sa pose, même si sa source
a disparu. Un Canon ne garde qu'une cible marquée ; une cible ne porte qu'une
marque. Un nouveau marquage valide remplace le précédent sans additionner les
montants ou utilisations. Les états posés ne sont pas supprimés par Silence.

## Catalyse et provenance du poison

La frappe normale est résolue d'abord. Si sa cible survit, que l'Alchimiste vit
encore et que cette cible portait déjà son poison avant la frappe, il peut le
consommer puis infliger le supplément de 2/4 bruts via les protections communes.
Cette détonation est un dégât secondaire, pas une deuxième attaque : aucun
nouveau Repérage consommé, Fracas fatal ou comptage de Cuirasse. Elle partage
une cadence par invocation de trois tours et ne réapplique pas le poison.

Sans détonation, une attaque normale effectuée applique ou renouvelle le Poison
normal. Les deux nouveaux rangs enregistrent l'invocation qui l'a posé : autre
copie, poison natif non sourcé ou autre faction ne peuvent pas être consommés.
Les poisons natifs et les contagions existantes gardent leurs paramètres et
leur comportement. Poison expiré, cible éliminée par la frappe, Silence,
attaque nulle, sort ou couronne ne déclenchent pas de détonation.

## Obtention, stockage et architecture

Les deux ascensions Forge existantes ouvrent désormais neuf recettes définies
par rang. Chaque évolution demande trois exemplaires libres du rang exact
précédent ; le deck reste protégé. Aucune nouvelle épreuve, récompense ou carte
offerte. Paquets, prix, taux, natifs, identifiants et clés de sauvegarde conservés.
La proposition compte 46 versions Forge, 36 évolutions et 168 recettes au total.
Les trois versions futures du Golem restent absentes : Cœur runique n'est pas
réinterprété comme un bonus sur tous les coups reçus.

`unit-strike-modifiers.js` centralise états consommables, calcul d'Armure,
Calibrage, marques, expiration et validation. `battle-defense.js` appelle ces
calculs seulement pour les attaques directes ; les autres dégâts gardent leurs
protections habituelles. `unit-support.js` pose les états après gain d'ATQ.
`unit-triggers.js` orchestre marquage et détonation ; `unit-poison.js` partage
le contrôle de provenance. Les fiches de plateau montrent les états actifs.
Les objets sont remplacés, sans altérer les instantanés précédents ; tous les
champs de combat ajoutés restent facultatifs, validés et repris sans migration.
Un module de production ajouté, automatiquement inclus dans les deux builds.

## Vérification et limites

Les tests dédiés couvrent dix vraies fusions, chiffres indépendants, pouvoirs,
exclusions, deux camps, consommation/expiration, non-cumul, Silence, Riposte,
Perforation, barrières, interactions, sauvegarde/import, instantanés et export
réellement embarqué. Le catalogue exerce 46 versions × quatre niveaux × deux
camps ; 168 recettes passent par 2 688 exécutions déterministes. Les ascensions
réutilisent les rencontres et simulations partagées, avec neuf recettes par rang.

Les quatre parties navigateur Forge existantes ajoutent un combat tactique
préparé : cinq fusions réelles, six invocations sur trois tours, puis deux tours
joués dans l'interface pour Fracture, Calibrage, Blindage, Repérage utilisé par
un autre allié et Catalyse. Aucun résultat de pouvoir n'est préattribué.
Survol/toucher, états affichés, sauvegarde et reprise sont vérifiés. Pas de
nouveau job ni d'exécution en double de la suite entière.

Ce témoin est préparé et ne prouve pas une campagne UI complète depuis zéro.
Chromium simulé ne prouve ni téléphone physique, Safari/Firefox ni équilibrage
humain. Les résultats, SHA exact et reprise restent dans la PR ; le propriétaire
a autorisé la fusion des lots prêts après revue et contrôles. Publication
séparée par le suivi existant, sans déploiement concurrent.

## Contrôles locaux du 3 novembre

721 tests Node et 120 scénarios de parité réussis ; builds autonome, diagnostic et web, syntaxe Python et contrôles de pipeline réussis. Export généré de 34 612 867 octets, blob Git `9ed63f64020ecf69d8dedd3424953dcffb256c08`, 78 modules et 76 illustrations. L’identité GitHub et la CI de la tête finale restent à vérifier dans la PR ; les succès de la PR 82 ne valident pas ces nouveaux pouvoirs.
