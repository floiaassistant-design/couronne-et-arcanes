# Ombre Rare / Épique — proposition du 2 novembre 2026

## Base et source

Base vérifiée : main `c9ab3209472a0433931c23315164c714af9099da`, intégrant la PR 69 après
réussite de tous les contrôles. Son arbre est identique à la tête Sylve testée.
La branche `feat/ombre-rare-epique` est rattachée à ce main sans écrasement
d'historique. Cette nouvelle proposition demande son propre accord de fusion ;
elle n'est pas publiée.

Source : [tableau maître Notion](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f),
édition `2026-10-27T06:13:46.581Z`, relue le 2 novembre 2026. Aucune écriture
Notion et aucun pouvoir inventé. `cards/ombre.js` conserve les totaux et la
provenance. Le délai de la Lame nocturne, à confirmer dans le moteur selon
Notion, est bien 1 dans le catalogue actuel ; il est hérité, sans nouveau délai.

## Périmètre

Trois évolutions Rares : Guerrier d'ossements, Veilleur du tombeau et Lame
nocturne. Huit évolutions Épiques : ces trois personnages, Ombre vorace,
Faucheur de fièvre, Chevalier du Tombeau, Spectre du Caveau et Inquisiteur des
Brumes. Onze évolutions nouvelles, huit personnages concernés.

L'Ombre dispose sur cette branche de 22 versions définies, dont onze natives.
L'Archiliche Légendaire, la Banshee Épique et le Vampire Épique restent leurs
versions natives existantes. Leurs nouvelles évolutions ne sont pas activées.
Les dix autres Légendaires, puis les 22 Divines/Éveillées restent à intégrer
avec leurs mécaniques ; cette tranche ne les rend pas jouables implicitement.
Les 53 unités et 23 sorts natifs, les familles Aube/Sylve et les six cellules
par personnage sont conservés.

## Obtention

Trois exemplaires libres du rang exact précédent donnent une carte du rang
suivant : Rare après mission 01 vaincue, Épique après mission 03. Les copies
au deck restent protégées. Transaction existante confirmée et sauvée sur copie,
sans or, éclat, hasard ou ascension obligatoire ; aucun exemplaire offert.
Le total du catalogue passe à 100 recettes, dont 11 Ombre.

Un paquet distinct `ombre-evolution` réutilise le circuit des paquets Aube et
Sylve : trois cartes pour 190 or, accessible après mission 03 vaincue.
Prix, contenu, groupes, taux et absence de rang garanti sont annoncés avant
confirmation. Les trois tirages sont indépendants, avec doublons possibles.

| Groupe | Poids | Pool |
| --- | ---: | --- |
| Native Ombre Commune ou Rare | 60 % | 8 références natives |
| Évolution Rare | 35 % | 3 références définies |
| Évolution Épique | 5 % | 8 références définies |

Aucun mélange avec Aube/Sylve, aucune Légendaire ou version supérieure.
Le paquet mystique à 95 or et les deux paquets d'évolution existants gardent
leurs prix, pools, ordre et tirages. Les récompenses de campagne restent natives.

## Pouvoirs et présentation

Seuls ATQ/PV augmentent selon les cellules validées ; géométrie, délai et
capacités natives sont hérités. Garde positionnelle du Veilleur, Armure 2,
Célérité/Charge +2, Perforation, Poison 1 pendant deux tours et Silence existant
réutilisent leurs primitives. Le Chevalier possède Riposte à l'ATQ effective,
bonus compris sans Charge, au plus une fois par tour ; aucune Garde ajoutée.

L'Inquisiteur conserve sa cadence de trois tours et sa durée native. Sa fiche
structurée décrit désormais le Silence depuis ses paramètres : le moteur et
ses cibles éligibles ne changent pas. Les trois personnages sans nouvelle
évolution conservent leur présentation native. Les cartes obtenues sont
jouables dans l'aventure ; le laboratoire invoque les mêmes règles aux deux
camps, à quatre niveaux indépendants du rang, sans progression réelle.

## Architecture et compatibilité

`cards/ombre.js` est le seul nouveau module de production : patches de données,
pas de pilote ou de moteur spécifique. `cards/evolutions.js` partage la famille
avec registre et recettes ; `card-packs.js` réutilise le constructeur existant.
`OMBRE_UNIT_IDS` expose les onze natifs ; les huit personnages évolutifs
rejoignent la présentation structurée. Un texte de Silence paramétré complète
le lecteur de fiche existant.

Aucun changement de clé, ID, reçu, sauvegarde, règles de combat, IA, actif,
CSS ou dépendance. Les références natives restent des chaînes ; les évolutions
utilisent `{id,rarity}` et leurs stocks existants. Les profils anciens ne
reçoivent ni carte ni champ supplémentaire. `cards-v2` et les instantanés
historiques restent compatibles. Web et `JOUER.html` sont générés depuis les
mêmes sources ; le diagnostic n'est pas distribué.

## Contrôles et reprise

`ombre_evolutions.test.mjs` vérifie les totaux indépendants, 22 versions à
quatre niveaux et deux camps, héritages, onze fusions et tirages réels,
stocks/deck, objectifs d'accès, import et reprise. Les simulations partagées
exercent 100 recettes × huit graines × deux exécutions déterministes. Le
contrôle de Collection conserve ses six colonnes avec les PV attendus
explicitement. Les parcours de paquet Ombre sont appelés par les quatre
parties d'épreuves existantes : bureau, portrait, paysage et HTTP, avec panne,
annulation, double clic, fusion, export/import, invocation et reprise.
Le parcours de contrôle V2.9 vérifie le libellé court et le contenu de la fiche
Silence : moment, durée, cadence et capacités conservées, plutôt qu'une longueur
minimum héritée de l'ancien descriptif. La matrice permanente conserve ses
27 scripts d'entrée et 30 commandes.

Contrôles locaux : 570 tests Node réussis, 120 scénarios de parité identiques,
builds autonome, diagnostic et web réussis ; 75 modules et 292 dépendances
sans cycle. Les résultats navigateur et le commit exact sont à lire dans la PR. Les contrôles de robot
ne prouvent ni difficulté humaine ni téléphone physique, Safari ou Firefox.
Après intégration autorisée et publication vérifiée par le flux existant,
reprendre les dix Légendaires Ombre, notamment la Veille funéraire, puis
les 22 versions supérieures, en relisant chaque validation Notion.
