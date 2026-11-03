# Forge — Marteau et blindages Divins / Éveillés

Proposition du 3 novembre 2026, après les intégrations du Foreur (PR 80) et du Marteau
Légendaire (PR 81). Base main vérifiée : `b54e567a477c2c9e64c7b51ccb49eb492176050b`. Conception : tableau maître Notion, édition relue
`2026-11-02T16:09:01.799Z`. Aucune nouvelle validation de conception ni écriture
Notion. Les gains remplacent ou complètent le pouvoir précédent dans le registre.

## Huit évolutions sur quatre personnages

| Carte | Divin | Éveillé |
| --- | --- | --- |
| Marteau, 4/8/1 | Brèche ouverte : suit dans la case libérée après un recul réussi | Fracas inexorable : si recul bloqué par occupation ou bord, 2 dégâts bruts supplémentaires avec protections ; sinon recul et avancée |
| Foreur, 3/7/1 et Armure 2 | Foreuse runique retire jusqu'à 4 points de barrière avant l'attaque normale | Récupération runique : si ce retrait vide la barrière, gagne une barrière personnelle de 2, plafond 2 par effet |
| Colosse, 6/13/4 et Armure 2 | Cuirasse de scories : barrière 2 après deux attaques directes lui ayant chacune retiré des PV et auxquelles il survit | Fournaise blindée remplace cette barrière par 4, plafond 4 |
| Marchefer, 3/9/1 et Protection +3 | Recyclage actif : gain de 2 boucliers dès une perte de PV causée par son attaque normale | Forge infatigable : gain de 3 ; surplus au plafond de couronne converti en barrière personnelle, plafond 2 pour cet effet |

Les statistiques, géométries et pouvoirs hérités sont conservés. Aucun gain de
Garde ou Riposte au Colosse. Les anciennes définitions natives restent intactes.

## Déclenchements et reprise

Recul, Fracas, Foreuse, Cuirasse et Recyclage ont chacun leur cadence par
invocation d'au plus une activation tous les trois tours. Les formes Divines
et Éveillées d'un pouvoir ne se déclenchent pas en double.

Le Marteau résout d'abord les réactions de contact existantes. Sans blessure,
cible survivante, contact ou Marteau vivant, aucun recul/Fracas. Une destination
bloquée n'utilise pas le quota du Divin ; l'Éveillé le consomme lorsqu'il inflige
son Fracas alternatif. Les deux déplacements d'un recul réussi passent par le
hook commun d'entrée de case, pièges compris, sans attaque supplémentaire.

La barrière du Foreur n'est accordée que si le retrait initial supprime toute
la barrière ennemie : la fin de barrière due aux dégâts normaux ne suffit pas.
Les origines des barrières restent séparées, leurs plafonds propres s'appliquent
sans réduire les autres protections ; aucun dégât aux PV ajouté par la Foreuse.

Le Colosse compte uniquement des attaques directes avec perte de PV après
protections et survie, Riposte comprise. Sort, poison, dégâts secondaires,
barrière seule et Silence ne comptent pas. Le compteur conserve au plus deux
coups éligibles pendant la cadence ; une fois prêt, la prochaine blessure
éligible peut activer la barrière. Aucun déclenchement automatique au changement
de tour. Activation : compteur à zéro et cadence renouvelée, même au plafond.

Le Marchefer doit retirer des PV à une unité par sa frappe normale ; couronne,
sort, poison, Riposte, dommage secondaire ou attaquant déjà détruit ne donnent
aucun gain. Le surplus est la part de restauration non ajoutée à la couronne,
plafonnée séparément pour la barrière ; un surplus préexistant de couronne n'est
jamais réduit. Une application au plafond consomme la cadence comme au rang
Légendaire. Les champs de combat restent facultatifs et validés, sans migration.

## Obtention

Deux ascensions Forge réutilisent le parcours commun Aube/Sylve/Ombre : victoire
de mission 09 puis 12, trois puis quatre personnages Forge distincts survivants,
dont un du rang source, couronne à 40 % puis 60 % minimum et victoire avant la
fin du tour 24. La seconde exige la première. Les adversaires emploient les
cartes natives ; les objectifs et leurs reçus restent communs.

Une ascension ouvre seulement les recettes réellement définies, ici quatre par
rang, sans cadeau ni consommation de carte. Chaque fusion demande trois copies
libres du rang source exact ; deck protégé, confirmation et sauvegarde sur copie.
Les versions encore absentes ne deviennent pas jouables par ce déblocage. Les
paquets, leurs prix/probabilités et les récompenses antérieures ne changent pas.
La proposition compte 36 versions Forge, 26 évolutions et 158 recettes au total.

## Architecture et vérification

`unit-triggers.js` porte préparation, récompenses, recul et réaction de Cuirasse.
`battle-defense.js` lui transmet uniquement le contexte des attaques directes.
`unit-barriers.js` conserve les origines par effet et l'ordre historique de
consommation ; les nouvelles clés ne sont pas ajoutées aux anciennes unités.
`unit-effects.js` valide compteur et cadence. Les fiches lisent le registre.
Aucun nouveau module de production, actif ou dépendance ; web et export communs.

`forge_ascended.test.mjs` vérifie les huit vraies fusions, statistiques, cas
positifs/négatifs, deux camps, protections, cadence, Silence, pièges, sauvegarde,
instantanés, fiches et moteur réellement embarqué. Le catalogue teste 36 versions
à quatre niveaux et dans les deux camps ; 158 recettes passent par 2 528
exécutions déterministes. `forge_ascensions.test.mjs` joue les deux rencontres
complètes et 128 combinaisons graine/niveau deux fois, avec accès, objectifs,
isolation entre factions et déblocage unique sans gain de stock.

Le pilote navigateur commun ajoute Forge aux quatre parties existantes : deux
combats UI complets, reprises après panne, fusion, Collection/deck, import/export
et invocation réelle. Un combat préparé après acquisition du Foreur contrôle
aussi son retrait de 4 points et la Récupération runique, puis la reprise exacte.
Il ne remplace pas une campagne entière depuis zéro. Les témoins de versions
inconnues sont déplacés vers le Golem encore absent ; leurs assertions restent.

Les résultats et le SHA final restent dans la PR. Aucun téléphone physique,
équilibrage humain exhaustif ou publication déduit des simulations et de Chromium.
Le propriétaire a autorisé les fusions des lots prêts après revue et CI pendant
cette session. La publication réutilise exclusivement le suivi existant.

## Suite

Golem Légendaire/Divin/Éveillé et hauts rangs des cinq autres Forge restent hors
de ce lot. Le raccordement de Cœur runique à une interception de couronne n'est
pas remplacé par un bonus sur tous les coups reçus. Aucune règle Notion nouvelle
n'est déduite d'une clarification laissée sans réponse.

## Vérifications locales du 3 novembre

685 tests Node et 120 scénarios de parité réussis ; builds autonome, diagnostic et web ainsi que syntaxe Python réussis. Export généré de 34 600 975 octets, blob Git `0a8f3516142817e60333b493bcc1fa52ed904bfc`, identique à la génération GitHub. La préparation ponctuelle est retirée du diff final. La CI et les parcours Chromium du dernier commit demeurent requis avant fusion ; les succès d’une PR précédente ne les remplacent pas.
