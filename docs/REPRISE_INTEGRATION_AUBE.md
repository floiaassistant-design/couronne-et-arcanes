# Intégration Aube — reprise par étapes

## Point de reprise — 26 octobre 2026, étape 5 préparée

**Étapes 1 à 5 préparées sur le brouillon ; contrôles finaux de présentation en cours. Arrêt avant l’étape 6.**

- Branche : `feat/aube-evolutions-fiche-universelle` ; [PR nº 53](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/53), toujours brouillon. Tête, arbre, export et CI finale dans sa description après vérification.
- Main vérifié : `cf8175002431e1714460f8be917665437a5b78c4` ; seule cette PR est ouverte. Aucune autorisation de fusion ou publication.
- [Tableau maître Notion](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f) relu, édition `2026-10-26T12:40:37.541Z`. Les dix lignes Aube restent conformes aux définitions. Les validations d’autres factions ne sont pas intégrées ici.
- Les 51 versions Aube ont leurs mécaniques communes et restent testables au laboratoire aux niveaux 0–3 indépendants, dans les deux camps. Les évolutions sont refusées en aventure, sans copie ou obtention ajoutée.
- `card-presentation.js` résout version, statistiques, statut et fiche commune ; `ability-text.js` dérive les formats bref/détaillé. `card-inspection.js` est le seul lecteur de consultation ; l’ancien rendu et le contrôleur séparés de Collection sont remplacés par un adaptateur.
- Collection, main, deux camps du plateau, Atelier/Alchimie, listes de decks, paquets, récompenses et laboratoire partagent la fiche. Miniature compacte, vrais nombres, rareté et règles de l’instantané ; aucun recalcul d’une ancienne unité ni état de lecture sauvegardé.
- La Collection conserve six cartes par unité : 51 versions Aube définies, neuf rangs inexistants, autres évolutions à concevoir. Les évolutions connues portent « Testable au laboratoire · Obtention non définie », sans commande de deck ou possession inventée.
- Survol/focus pour lire ; à la souris, clic de main pour sélectionner. Au toucher : première consultation, second contact sur la même carte de main pour sélectionner, puis pose distincte. Le ciblage des sorts reste explicite ; le clic sur une unité occupée ne remonte pas à une commande de pose.
- Contrats : [versions](AUBE_VERSIONS.md), [moteur](AUBE_MOTEUR.md), [présentation](AUBE_PRESENTATION.md), [défenses](AUBE_DEFENSES.md).

## Vérifications de l’étape 5

- `npm test` : **418 tests réussis**, dont **8 nouveaux tests de présentation** couvrant les versions des deux camps, leurs invocations réelles, les chiffres, quotas, règles historiques et statuts, tous les contextes, les sorts, l’échappement et l’absence de mutation.
- `npm run test:parity` : **60 scénarios identiques**, référence inchangée. Aucun changement aux règles, à l’IA, à l’économie ou à la progression.
- Builds normal et test : **51 modules, 76 illustrations** ; résultats finaux et export GitHub exact à relever après les derniers parcours.
- `browser_card_presentation.py` est appelé par `browser_card_preview.py`, déjà exécuté en CI. Il couvre les vrais éléments de Collection, decks, Atelier/Alchimie, paquet, récompense, laboratoire et les deux camps, souris/toucher/clavier et isolation. Les anciennes assertions des rangs à concevoir sont remplacées par les chiffres approuvés et les statuts distincts ; les neuf absences et les autres factions restent testées.
- Le helper de pages diagnostiques charge directement le fichier construit après installation du même stockage fictif, au lieu de transmettre son HTML complet par CDP à chaque ouverture. Assertions et scénarios métier conservés ; aucun délai de test augmenté.
- Avant modification, les deux CI de `c4a75ec` ont été vérifiées **success** : [tests](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40299947293), [assemblage](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40299945946). Elles valident l’étape 4 ; distinguer les nouveaux contrôles de l’étape 5.

## Prochaine étape : revue complète

1. Relire instructions, état, contrats et tableau maître à jour ; vérifier main, PR et tête exacte.
2. Examiner l’intégration des six étapes : correspondance entre définitions, effets, statistiques et présentation ; compatibilité historique, absence de doubles déclenchements, isolation du laboratoire, IA et économie.
3. Vérifier les derniers résultats CI de la tête exacte et traiter les défauts pertinents. Aucun équilibrage humain ou test de téléphone physique n’est revendiqué par l’automatisation.
4. Conserver l’obtention non définie sans inventer de copies ou de circuits économiques. Toute activation supplémentaire en aventure doit avoir un périmètre explicite.
5. Pousser le résultat sur la même PR, puis présenter la livraison complète et ses limites. **Aucune fusion ni publication sans accord spécifique du propriétaire.** Si seule la CI reste à attendre, arrêter sans la surveiller activement.

## Historique — étape 4

## Vérifications de l'étape 4

- `npm test` : **410 tests réussis**, dont **23 nouveaux tests métier** de moteur/laboratoire. Les anciennes attentes du pilote sont remplacées par les chiffres validés et des assertions d'indépendance des niveaux ; les scénarios historiques restent intacts.
- Une vérification couvre **51 versions × 4 niveaux × 2 camps = 408 invocations réelles** et leur égalité avec la prévision, sans niveau forcé. Les tests incluent l'absence des neuf rangs inférieurs et les refus sans consommation en aventure.
- **48 batailles complètes déterministes** de laboratoire : six niveaux de rareté, quatre graines, deux passes ; même moteur, quotas et intégrité des unités, aucune modification des réglages/progression.
- `npm run test:parity` : **60 scénarios identiques**, référence inchangée. `npm run build` et `npm run build:test` : **réussis**, 50 modules et 76 illustrations, mêmes sources pour web et hors réseau.
- `CONTROL_SEEDS=1 npm run control-balance` : **1 280 combats terminés**, maximum 34 tours et contrôles d'intégrité réussis. Ces simulations ne démontrent pas l'équilibrage humain des évolutions.
- Navigateur Chromium / Playwright 1.56 : `browser_developer_lab.py`, `browser_combat_fx.py`, `browser_save_integrity_v211.py`, `browser_maintenance.py` et `browser_card_capabilities.py` **réussis**. Bureau, portrait/paysage, sélection des rangs et niveau 0, vrais nombres/pouvoirs, contrôles, laboratoire isolé, interruption, reprise, HTTP, export sans réseau, mouvement réduit et animations désactivées selon les parcours. La suite des effets et le laboratoire ont été rejoués sur le dernier export exact. Captures du laboratoire bureau/mobile examinées. Aucun téléphone physique, Safari/Firefox ou équilibrage humain revendiqué.
- Les assertions de la suite des effets sont conservées. Le bouton Passer est actionné atomiquement quand la lecture est active, afin de ne pas attendre un ancien bouton détaché après la fin naturelle des effets ; un cas séparé exige son activation pendant une lecture et vérifie résultat/commandes.
- Export final généré par le [workflow ponctuel réussi](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40299695067) depuis `ede0b37e44931f0ef7544bcf61b4e5d645a94b42` : blob `170548e5197a80f85c640c947a7689f43f8ae62a`, **34 475 947 octets**, 50 modules et 76 illustrations. Le premier export de l’étape 4 (`ee36dc8`) a été remplacé après ajout du verrou métier de récompense ; aucun HTML édité à la main. L’export est enregistré dans `abe7cc1e61a054c6a38b1404268b110192f0c8b2` ; son arbre complet `18129d7a7fbe9d4bcc0880afa6c2f479af31313f` a été comparé au local, sans aucune différence. Le générateur est retiré avant la tête finale, sans modification permanente des workflows. Dernière tête, arbre final et CI dans la description de PR.
- Les CI intermédiaires de `ef6477c` et `ede0b37` ont précédé l’enregistrement de leur nouvel export : les tests ont échoué au contrôle de synchronisation du HTML, et l’assemblage à la préparation du site. Ne pas les relancer : les sources et l’export sont réunis sur la tête finale, dont les nouveaux contrôles se déclenchent normalement.
- Les deux CI de la tête précédente `ce8afd8` ont maintenant terminé **success** : [tests](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40293136902) et [assemblage](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40293136747). Ce résultat valide l’étape 3, pas le nouveau code de l’étape 4. Vérifier la nouvelle tête après notification, sans surveillance active.

## Historique — audits et résultats des étapes 1 et 2 (25 octobre)

Les constats de sources, PR, divergences et prochaines étapes ci-dessous sont
historiques. Le point de reprise ci-dessus les remplace pour le travail actuel.

## Sources examinées et état réel

Le [tableau maître Notion](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f), dont la première table de 53 unités a été lue, porte la dernière édition observée `2026-10-25T17:28:45.661Z`. Cette table confirme les dix personnages de l'Aube et leurs évolutions validées en conception, non jouables. Les annexes servent à préciser les données compatibles, jamais à remplacer une case du tableau maître par une ancienne proposition. Ne pas créer un second tableau de décisions ni réimporter les sous-paliers I–III.

Documents lus : `AGENTS.md`, `README.md`, `ETAT_PROJET.md`, `CODEX_WORK_MISSION.md`, `BIBLE_DU_JEU.md`, architectures V2.5/V2.6 et `STATISTIQUES_CAPACITES.md`. Les jalons anciens contenus dans ces documents sont historiques. Le code actuel, les deux workflows CI et les tests pertinents ont été examinés.

Au relevé initial, la seule autre PR ouverte est la [nº 41](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/41), brouillon documentaire, tête `df7adcb1cdf38f11f96bd9c3ca924edd201bbcde`. Son diff contient uniquement `docs/AUDIT_CAPACITES_DESCRIPTIONS_2026_10_23.md`. Elle décrit encore des états antérieurs à la dernière validation Notion : ne pas utiliser ce texte comme catalogue à programmer, ni le fusionner comme dépendance. Les autres branches distantes ont été inventoriées ; aucune branche d'intégration des évolutions Aube n'existait. Refaire ce contrôle à chaque reprise pour détecter un travail nouveau.

Les dix IDs historiques et leurs raretés natives restent les suivants ; ce tableau décrit la couverture technique, sans redéfinir les pouvoirs décidés dans Notion.

| Personnage | ID conservé | Rareté native | Versions existantes ou à intégrer |
| --- | --- | --- | --- |
| Milicien de l'Aube | `militia` | Commun | Commun à Éveillé : 6 |
| Porte-égide | `shield` | Commun | Commun à Éveillé : 6 |
| Arbalétrière | `archer` | Commun | Commun à Éveillé : 6 |
| Sœur de l'Aurore | `cleric` | Rare | Rare à Éveillé : 5 |
| Paladin solaire | `paladin` | Épique | Épique à Éveillé : 4 |
| Porte-étendard | `banner` | Rare | Rare à Éveillé : 5 |
| Capitaine de l'Aube | `scoutcaptain` | Rare | Rare à Éveillé : 5 |
| Prieur solaire | `sunpriest` | Rare | Rare à Éveillé : 5 |
| Lancier des Remparts | `lancer` | Commun | Commun à Éveillé : 6 |
| Ange du Bastion | `dawnbastion` | Légendaire | Légendaire à Éveillé : 3 |

**Cible : 51 versions réelles, dont 10 natives et 41 évolutions ; 9 emplacements inférieurs inexistants dans les 60 cellules visibles.** Les 51 définitions et les neuf absences sont testées à l'étape 2. Leurs pouvoirs futurs restent à raccorder au combat.

## Compatibilité : constats de l’audit initial

1. `CARDS` contient 76 entrées natives. Le profil possède des quantités par ID (`collection`), des decks de chaînes d'ID, des achats `upgrades[id]` de 0 à 3 et de la maîtrise `mastery[id]`. Les paquets, recettes, extractions, rencontres et générateurs de decks parcourent ce catalogue. Y ajouter naïvement toutes les variantes modifierait l'économie, la Tour, les pools et la normalisation.
2. `unitStats` centralise déjà les chiffres d'invocation et sépare amélioration/difficulté, équipement, Forge, réputation et maîtrise. La main lit l'instantané de bataille ; la Collection lit le profil courant. Les effets de Concorde et de Ralliement sont calculés séparément en combat.
3. Le laboratoire utilise bien `createBattle` et les tours normaux, mais son ancien pilote Milicien est obsolète : cinq rangs seulement, bonus dépendant d'un niveau, niveau 3 forcé pour certaines raretés, calcul de prévision recopié et riposte expérimentale à 1. `labMilitiaBonus`, `labGuard` et les textes associés devront être remplacés, sans généraliser cette exception.
4. Les unités sauvegardées contiennent déjà leurs chiffres réels (`atk`, `hp`, `maxhp`, `armor`, `ability`, etc.), mais pas une identité de variante de rareté. Les anciennes unités ne doivent pas être recalculées à l'import ou au rechargement. Les champs historiques manquants doivent garder leur comportement de repli.
5. `storeBattle` exclut `vfx`. L'orchestration du laboratoire bloque déjà la sauvegarde et les récompenses de l'aventure ; conserver ces protections et les vérifier aussi en cas de sortie, interruption ou résultat de combat.
6. `generatedCardFace` est partagé par les vues. En revanche, la fiche de Collection et la fiche main/plateau ont actuellement deux rendus et deux lecteurs d'événements. L'ancien lecteur combat ferme la fiche au toucher/clic pour sélectionner ; cela ne satisfait pas encore la consultation tactile universelle demandée. Un clic sur une unité alliée peut aussi remonter à la case de déploiement : couvrir ce risque.
7. Les noms de rareté actuels emploient notamment `divine` et `éveillée` côté interface ; normaliser les identifiants à une seule convention et fournir les libellés affichés depuis le même endroit. Aucun renommage d'ID de personnage.

## Architecture retenue et préparation de l’étape 2

- Conserver le catalogue historique des cartes natives et ses IDs. Ajouter un registre central des versions et un résolveur pur **(ID historique, rareté)** donnant une identité de version stable, les valeurs totales et les capacités effectives. Éviter de disperser les constantes de capacités entre registre, moteur, IA et vues.
- Séparer explicitement les couches : **base de rareté → achats existants → bonus de profil → effets temporaires**. Une statistique totale de Notion remplace la base du rang précédent ; elle n'est jamais additionnée comme un bonus. Une capacité améliorée remplace l'ancienne dans une seule définition résolue.
- Sans rareté explicite, les références historiques continuent à désigner la carte native. Ne pas réécrire les decks, exemplaires, achats, maîtrises ou combats existants pour leur attribuer une nouvelle rareté. Définir et tester le contrat facultatif de référence de version avant son utilisation dans une main ou une unité.
- Aucun nouvel accès économique aux évolutions : pas de paquet, recette, fusion, récompense, achat ni exemplaire offert. Le laboratoire peut choisir les versions programmées sans possession réelle ; la Collection les montre en lecture avec un statut distinct.
- Les chiffres passent par `unitStats`. Les fonctions de combat consomment la définition résolue et utilisent les mêmes primitives de dégâts/soins/états pour le jeu et le laboratoire. Aucun moteur parallèle réservé à l'Aube.
- Extraire les responsabilités nécessaires de `battle.js` (déjà 410 lignes au relevé) au moment d'ajouter les capacités : sélection/protection, résolution défensive et soutien/arrivée, selon les dépendances réellement constatées. Conserver une orchestration claire, sans découpage artificiel.
- Étendre `card-inspection.js` et réutiliser `generated-card.js` : une fiche compacte, un lecteur universel et des descriptions issues des paramètres réellement consommés par le moteur. Les adaptateurs fournissent contexte et chiffres ; ils ne redéfinissent pas les pouvoirs.
- Les animations reçoivent uniquement les résultats publics. Conserver les instantanés, l'ordre de lecture, le repli sans mouvement et l'exclusion des événements de la sauvegarde.

## Fonctions communes : utilisateurs et risques identifiés

Avant chaque modification, compléter cette carte d'impact par les cas de test exacts.

| Responsabilité actuelle | Utilisateurs concernés | Vigilance et tests existants |
| --- | --- | --- |
| `hit` : armure, barrière, morts | Toutes les unités ; attaques, sorts, pouvoir du héros, pièges | Armure minimale, Perforation, absorption, mort unique ; `engine`, `tactics_v16`, `class_skills_v28`, `battle_control_v29`, `spell_targeting` |
| `findTarget` / `findGuardianForHero` | Cinq factions ; Garde : `shield`, `treant`, `crypt`, `golem`, `sentinel` | Portée 3 sans casser la portée 2 historique ; Garde et géométries 3×5/10 cases ; `tactics_v16`, `arena_v211`, `deployment_zone` |
| `retaliate` | Aube : `shield`, `paladin`, `dawnbastion` ; Sylve : `treant` ; Ombre : `graveknight` ; Forge : `golem` ; Éther : `sentinel` | Fréquence, silence, survie, contact, Concorde, absence de chaîne ; ajouter Milicien seulement pour les versions concernées |
| Déplacement / Charge / portée | Célérité et Charge dans les cinq factions ; Vol partagé | `lancer` Éveillé ne doit pas donner Célérité aux anciennes copies ni changer les loups/griffons ; `tactics_v16`, `battle_control_v29`, `ai_tactical_tempo` |
| Soutien après attaques | Soin : Aube/Sylve/Éther ; Inspiration : Aube/Forge | Nombre de cibles, ligne/toutes lignes, blessure proportionnelle, plafonds et fréquence ; `engine`, `tactics_v16`, `alternating_turns` |
| Arrivée / bouclier | `dawnbastion`, `pixie`, `ironwraith` ; tous les entrants déclenchent les pièges | Une seule intervention, cible devant, limite 2 cases, protections, ordre des événements, pas d'attaque ordinaire supplémentaire |
| IA / contrôle / aperçu | `ai.js`, `battle-control.js`, `spell-targeting.js`, vues de combat | Plus de valeurs codées en dur divergentes (portée, Charge, capacités) ; conserver décisions historiques, déterminisme et information privée |

Les intitulés courts du tableau renvoient aux fichiers `tests/*.test.mjs` correspondants. Les tests de nouvelles variantes s'ajouteront aux tests historiques ; ne pas modifier la référence de parité pour masquer un échec.

## Points à résoudre avant les étapes concernées

**Obtention :** aucune modalité décidée ; cela n'empêche pas les définitions, leur test dans le laboratoire et leur présentation comme « intégrée — obtention non définie ». Les versions natives et les rangs inférieurs inexistants doivent avoir leurs propres statuts.

**Garde :** la case native du tableau maître décrit la Garde historique ; les annexes décident une future Garde normale uniquement entre attaquant et couronne, étendue au Divin puis à l'Éveillé. Le moteur actuel intercepte depuis toute la ligne et donne aussi priorité à un gardien lors du ciblage d'une unité. Ne pas assimiler automatiquement le comportement historique à la règle future ni modifier les quatre autres factions. Avant l'étape 3, préciser le périmètre d'application aux versions Aube natives/nouvelles et préserver les anciennes batailles ; définir une priorité déterministe pour plusieurs gardiens et tester les coordonnées de l'interception entre lignes.

**Riposte :** le tableau maître décrit encore 2 dégâts fixes pour les natifs Paladin/Porte-égide/Ange, tandis que l'annexe prévoit ATQ effective pour toutes les unités dotées de Riposte. Le Milicien Divin/Éveillé indique explicitement ATQ effective, une fois par invocation. Avant l'étape 3, résoudre ce conflit pour les autres Aube ; aucun passage global des cinq factions à ATQ effective n'est autorisé implicitement. Garder l'armure/barrière de la cible, ne pas ajouter la Charge à un contre-coup.

**Ordre et limites :** tester notamment premier coup absorbé, source de dégâts, Dernier Rempart face au poison et aux frappes multiples, silence des nouveaux pouvoirs, barrière du Prieur après soin effectif, barrière du Paladin après Riposte autorisée et coexistence des plafonds de barrières. Réutiliser le contrat actuel lorsqu'il tranche ; documenter toute interaction nouvelle insuffisamment spécifiée avant de la présenter comme validée. Les dégâts d'Intervention céleste ne créent pas une seconde attaque ordinaire.

## Étapes et critères d'arrêt

Chaque ligne correspond à une intervention distincte, suivie d'un arrêt et d'une mise à jour de ce fichier, du commit poussé et de la même PR brouillon. Ne pas enchaîner automatiquement l'étape suivante.

| Étape | Livrable attendu | Vérifications avant arrêt |
| --- | --- | --- |
| **1 — terminée** | Audit du main/Notion, compatibilité, carte d'impact et plan durable | Sources et PR examinées ; parité de base ; tests documentaires ; diff uniquement Markdown |
| **2 — terminée** | Registre des 51 versions, identité, capacités résolues et statistiques en couches ; contrat de repli historique | Totaux de toutes les versions, héritage/remplacement, absence des 9 versions inférieures, achats/maîtrise indépendants, sauvegardes et économie inchangées ; aucune activation partielle en jeu |
| 3 — prochaine | Capacités défensives : réduction initiale, Armure, Garde, Riposte, barrière, Dernier Rempart | Résoudre Garde/Riposte avant leur modification ; protections, mortalité, quotas, silence, anciens combats et cinq factions |
| 4 | Capacités offensives/de soutien/d'arrivée et laboratoire sur le moteur commun | Portée, Perforation, Charge, Célérité, tir derrière, soins, Inspiration, Commandement, Intervention ; retirer l'ancien pilote ; IA et laboratoire isolé |
| 5 | Carte brève et fiche universelle dans tous les écrans contenant des cartes | Main, deux camps du plateau, 60 cellules Collection, deck, Atelier/Alchimie, paquets, obtention/récompenses et laboratoire ; souris/toucher/focus sans action accidentelle ; bureau/mobile/mouvement réduit |
| 6 | Revue finale, export généré, documents à jour et PR prête à examiner | Quatre commandes obligatoires, anciennes sauvegardes et nouveaux pouvoirs sur la tête exacte, simulations pertinentes, HTTP et hors réseau, revue complète, CI du commit exact |

La programmation du registre d'étape 2 n'autorise pas une fiche à annoncer un pouvoir avant son intégration réelle. Maintenir explicitement le statut de la PR brouillon tant que ces étapes ne sont pas achevées. Mettre à jour le titre et la description autour de l'implémentation finale avant revue.

## Contrôles effectivement réalisés à l'étape 1

- **CI du main exact `cf8175002431e1714460f8be917665437a5b78c4` :** [Tests Couronnes et Arcanes](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40216317676) et [Assemblage web](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40216317680) observés terminés avec `success`.
- **Local, sources inchangées de ce main :** `npm run test:parity` réussi, 60 scénarios déterministes identiques ; `node --test tests/ci_change_scope.test.mjs` réussi, 2 tests.
- `npm test`, les deux builds et les parcours navigateur n'ont pas été relancés localement pour ce changement uniquement documentaire. Aucun nouveau pouvoir ni nouvelle interface n'a été testé ou annoncé comme intégré.
- Le diff de l'étape 1 doit contenir uniquement ce fichier et le lien de suivi dans `ETAT_PROJET.md`. La CI légère de la PR est distincte de la CI complète requise après modification du code.

## Résultat de l’étape 2

- `cards/schema.js`, `aube.js`, `abilities.js`, `definitions.js` : identifiants stables et données immuables, 51 versions Aube, totaux hérités/remplacés, capacités uniques par clé et statuts de disponibilité explicites. Les autres unités conservent leur définition native. [Contrat d’API](AUBE_VERSIONS.md).
- `unit-stats.js` partage les additions de bonus. `versionUnitStats` calcule une prévision séparant `base` et `bonuses` ; aucun niveau forcé ni ancien bonus expérimental dans cette API. Le chemin natif conserve son comportement et son instantané.
- `play` dans `battle.js`, commun aux cinq factions et aux deux camps, refuse les références futures ou invalides avant invocation/consommation. La présence d’une définition ne rend pas une carte jouable. Tests de refus sans mutation sur les deux géométries et les deux camps.
- `CARDS`, les profils, recettes, paquets, decks, maîtrises et sauvegardes ne sont pas transformés. Les unités déjà invoquées conservent leurs chiffres à la reprise. L’ancien pilote du laboratoire reste isolé et sera retiré à l’étape 4, après programmation de ses pouvoirs.
- Garde et Riposte restent explicitement dans `pendingDecisions` pour les évolutions concernées. Leurs valeurs historiques héritées dans les données ne tranchent pas la divergence Notion. L’étape 3 doit résoudre ce point avant activation.
- `JOUER.html` et le diagnostic navigateur sont générés avec les nouveaux modules par le builder commun. Aucun HTML de variante et aucun nouvel accès économique. Le générateur GitHub ponctuel sert uniquement à enregistrer l’export volumineux sur la branche ; il doit être retiré avant livraison de l’étape, sans changement durable des workflows.
- Vérifications locales : **355 tests réussis**, dont **19 nouveaux tests** de données/compatibilité ; **60 scénarios de parité identiques** ; `npm run build` et `npm run build:test` réussis. Les suites Node incluent imports sans cycle et compatibilité historique.
- Les résultats navigateur, la présence de l’export exact sur GitHub et la CI de la tête finale sont consignés dans la description de PR après leur observation. Aucune CI de la base ne valide à elle seule les nouvelles sources.
- Limites de cette étape : capacités déclarées, pas encore exécutées pour les nouvelles raretés ; aucune nouvelle fiche universelle ni modification de la Collection. L’obtention reste à décider. Aucun test sur téléphone physique ou équilibrage humain revendiqué.

## Procédure de reprise

1. Récupérer le dépôt officiel, relire `AGENTS.md`, l'état courant et ce fichier sur `feat/aube-evolutions-fiche-universelle` ; vérifier le SHA distant et toute copie locale avant usage.
2. Relire le nouveau main, les PR ouvertes et le tableau maître Notion. Réconcilier les changements sans force ni perte d'historique ; résoudre les nouveaux conflits avant de coder.
3. Retrouver la PR par cette branche et lire ses derniers résultats Actions. Ne pas créer une autre PR, fusionner la nº 41 ou publier le brouillon pour avancer.
4. Réaliser **une seule étape suivante**, ses tests utiles et sa revue. Mettre à jour le point de reprise en tête, les contrôles et les limites ; pousser puis vérifier le commit sur GitHub.
5. Si seule la CI reste en cours, fournir son lien et s'arrêter sans la consulter en boucle. Après notification, vérifier le résultat sur le commit exact.

Instruction de reprise : **« Reprends l'étape 6 de l'intégration Aube sur la branche `feat/aube-evolutions-fiche-universelle`, lis `docs/REPRISE_INTEGRATION_AUBE.md`, poursuis la même PR puis arrête-toi à la fin de l'étape. »**
