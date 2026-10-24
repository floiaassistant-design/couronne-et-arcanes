# Audit des capacités et projet de descriptions — Couronnes & Arcanes

**État : PROPOSITION DOCUMENTAIRE, non validée.** 23 octobre 2026.

**Source vérifiée :** `floiaassistant-design/couronne-et-arcanes`, `main` au commit `2de25b7cb9cc99bd1edb9202c43fea5f8338b5c6` (PR 40 déjà intégrée au moment de l’audit). **Périmètre :** 76 cartes = 53 unités et 23 sorts, moteur, ciblage, capacités secondaires et textes affichés.

**Aucune règle, statistique, sauvegarde, image, animation, IA ni export n'est modifié par ce document.** Les textes ci-dessous sont des *propositions* fidèles au moteur actuel, pas encore visibles dans le jeu ; les changements d’équilibrage restent en décision.

## 0. Simplification des raretés et de la Collection — décision du 24 octobre 2026

**Décision de conception du propriétaire : une seule évolution par rareté, sans les trois sous-paliers I/II/III pour chaque rareté dans le futur système d'évolution.** Objectif : collection simple à parcourir, sans matrice permanente 6 × 3, dans l'esprit de *Kings and Legends*. **Non intégré au jeu** : les valeurs et règles réelles restent celles du code actuel.

**Règle de Riposte retenue en conception — changement futur de mécanique :** les dégâts bruts d'une Riposte correspondent à l'**ATQ effective de l'unité au moment où elle riposte** (son ATQ de combat, incluant les bonus actifs comme Concorde et Ralliement), et non à un chiffre de Riposte fixe. Les protections normales de la cible s'appliquent ensuite. Exemple : Porte-égide de base à 1 ATQ → Riposte de 1 dégât brut ; avec +1 ATQ de Concorde → Riposte de 2 dégâts bruts. **Cette décision remplace l'ancienne proposition d'augmenter une Riposte fixe de 2 à 3 dégâts au rang Rare : son évolution Rare reste à définir.** Les conditions de déclenchement et les fréquences restent propres à chaque capacité : les unités dotées de Riposte dans le moteur actuel ripostent au contact une fois par tour ; pour le Milicien Divin/Éveillé envisagé, la riposte spéciale reste une fois par invocation tant qu'aucune autre décision n'est prise. Le bonus de Charge lié à un déplacement n'est pas automatiquement ajouté à la Riposte. **Statut : règle souhaitée, non programmée ; le moteur actuel inflige encore 2 dégâts bruts fixes aux unités dotées de Riposte.** Tester ATQ variable, Concorde, bonus de classe, armure, barrière, silence et anciennes sauvegardes avant modification.

**Règle globale de transmission des capacités (validée en conception) :** à chaque rareté supérieure, **la carte garde toutes les capacités et bonus déjà acquis**, et gagne une nouvelle capacité ou une amélioration de l'une des anciennes. **Une amélioration remplace sa valeur précédente**, elle ne s'y ajoute pas (réduction du premier coup de 1 → 2 → 3 dégâts = réduction de 3, pas 6). Les **effets distincts** et les bonus permanents restent présents aux rangs suivants, sauf décision expresse contraire. Ex. Milicien Éveillé : réduction de 3 dégâts du premier coup reçu (une fois/invocation), riposte au contact égale à son ATQ effective (une fois/invocation), bonus de +3 PV maximum débloqué au Légendaire et Dernier Rempart (survit une fois avec 5 PV au plus). **Définir le nouveau gain par rang dans les cases de la matrice ; détailler la combinaison totale dans la fiche**, et ne pas recopier toutes les capacités héritées en gros texte sur la petite carte. Statut : décision de conception, **non implémentée dans le moteur**.

### Prérequis obligatoire : déplacement, portée et rôle AVANT les évolutions

**Diagnostic du moteur en production (main `ea1e18c49bcfd291a664dacdf95b4bb5c847af89`, 24 octobre 2026).** Nous avions commencé les capacités par rareté sans documenter systématiquement **déplacement, portée des attaques, portée des effets, statistiques et délai**. Ce tableau établit le **socle réel des 53 unités** ; il ne valide aucune augmentation de vitesse ou de portée. Source : `src/data.js` et `src/engine/battle.js` (déplacement `moveUnits`, attaque `findTarget`) ainsi que `src/engine/battle-control.js`.

- **Déplacement normal :** au plus **1 case en avant par phase d'action de l'unité** ; **Célérité** (Loup, Cerf, Ombre vorace, Griffon, Spectre) permet jusqu'à **2 cases**. Le mouvement cesse si une cible est déjà attaquable, si le chemin est bloqué, si l'unité est immobilisée ou à la limite du plateau. Silence peut suspendre Célérité.
- **Vol :** ne donne pas automatiquement 2 cases de vitesse ; il autorise à **sauter par-dessus un allié immédiatement devant**, avec une case d'atterrissage libre et dans les limites. Certaines unités possèdent à la fois Vol et Célérité.
- **Portée d'attaque actuelle :** **1 case** pour 45 unités, **2 cases** pour les 8 unités `ranged` ; la cible est cherchée **devant, sur la même ligne**. La distance d'un sort, de Garde, d'un soin ou d'un autre pouvoir est **distincte** de la portée de l'attaque.
- **Délai** du tableau : attente de la carte avant sa pose, **pas** une durée de déplacement ni un temps de recharge universel de ses capacités. Les ATQ/PV sont les valeurs du catalogue avant bonus de profil, maîtrise, formation, équipement ou évolution future.
- **Attention aux écarts entre proposition et moteur :** Garde Divine/Éveillée sur plusieurs positions/lignes et Impact de zone limité à un second ennemi adjacent relèvent de **choix de conception non programmés** ; le moteur actuel de Garde protège la couronne de sa ligne et l'Impact peut atteindre un autre ennemi de la même ligne. La proposition historique d'un Feu follet avec portée 3 **n'est pas une valeur actuelle** (portée 2 dans le moteur).
- **Méthode obligatoire avant de valider une nouvelle rareté :** vérifier pour l'unité (1) ATQ/PV/délai, (2) déplacement normal et spécial, (3) portée/cibles de l'attaque, (4) portée/cibles/fréquence des capacités, (5) bonus conservés et nouvelle capacité, (6) interaction avec blocage/Vol/Garde/Charge/Concorde/Riposte, (7) texte court sur la carte et descriptif complet dans la fiche, (8) statut *actuel / proposé / validé / intégré*. **Ne pas fixer d'augmentation de mouvement ou de portée sans accord** et ne pas transposer silencieusement les anciens paliers.

#### Aube — 10 unités

| Unité | Base native (ATQ / PV / délai) | Avance max. | Attaque | Effets : cible/zone actuelle | Mobilité particulière |
|---|---|---|---|---|---|
| Milicien de l’Aube (`militia`) | commun ; 2 ATQ / 5 PV ; délai 0 | 1 case | 1 case | Aucun | — |
| Porte-égide (`shield`) | commun ; 1 ATQ / 9 PV ; délai 1 | 1 case | 1 case | Armure : soi ; Garde : couronne de sa ligne ; Riposte : ennemi au contact | — |
| Arbalétrière (`archer`) | commun ; 2 ATQ / 3 PV ; délai 1 | 1 case | 2 cases | Distance : attaque | — |
| Sœur de l’Aurore (`cleric`) | rare ; 1 ATQ / 4 PV ; délai 2 | 1 case | 1 case | Soin : allié de sa ligne | — |
| Paladin solaire (`paladin`) | épique ; 4 ATQ / 9 PV ; délai 3 | 1 case | 1 case | Armure : soi ; Riposte : ennemi au contact | — |
| Porte-étendard (`banner`) | rare ; 2 ATQ / 6 PV ; délai 2 | 1 case | 1 case | Inspiration : allié de sa ligne | — |
| Capitaine de l’Aube (`scoutcaptain`) | rare ; 3 ATQ / 6 PV ; délai 1 | 1 case | 1 case | Inspiration : allié de sa ligne | — |
| Prieur solaire (`sunpriest`) | rare ; 2 ATQ / 7 PV ; délai 2 | 1 case | 1 case | Soin : allié de sa ligne | — |
| Lancier des Remparts (`lancer`) | commun ; 3 ATQ / 5 PV ; délai 1 | 1 case | 1 case | Perforation : cible attaquée | Charge après déplacement |
| Ange du Bastion (`dawnbastion`) | légendaire ; 5 ATQ / 11 PV ; délai 4 | 1 case | 1 case | Protection : sa couronne ; Riposte : ennemi au contact | Vol : saute un allié si atterrissage libre |

#### Sylve — 11 unités

| Unité | Base native (ATQ / PV / délai) | Avance max. | Attaque | Effets : cible/zone actuelle | Mobilité particulière |
|---|---|---|---|---|---|
| Éclaireuse sylvestre (`ranger`) | commun ; 2 ATQ / 4 PV ; délai 0 | 1 case | 2 cases | Distance : attaque | — |
| Loup des Brumes (`wolf`) | commun ; 3 ATQ / 3 PV ; délai 0 | 2 cases | 1 case | Célérité : déplacement | Charge après déplacement |
| Gardien des Racines (`treant`) | rare ; 3 ATQ / 10 PV ; délai 2 | 1 case | 1 case | Armure : soi ; Garde : couronne de sa ligne ; Riposte : ennemi au contact | — |
| Dryade luminescente (`dryad`) | rare ; 1 ATQ / 5 PV ; délai 2 | 1 case | 1 case | Soin : allié de sa ligne | — |
| Cerf astral (`stag`) | épique ; 5 ATQ / 6 PV ; délai 3 | 2 cases | 1 case | Célérité : déplacement | Charge après déplacement |
| Traqueur d’épines (`thorn`) | commun ; 2 ATQ / 5 PV ; délai 1 | 1 case | 1 case | Poison : cible touchée | — |
| Luciole des Épineuses (`pixie`) | commun ; 2 ATQ / 3 PV ; délai 0 | 1 case | 1 case | Protection : sa couronne | Vol : saute un allié si atterrissage libre |
| Ours des Roches (`bear`) | rare ; 4 ATQ / 9 PV ; délai 2 | 1 case | 1 case | Armure : soi | — |
| Archidruide Feuillage (`archdruid`) | épique ; 3 ATQ / 7 PV ; délai 3 | 1 case | 1 case | Soin : allié de sa ligne | — |
| Hibou du Crépuscule (`owl`) | commun ; 2 ATQ / 4 PV ; délai 1 | 1 case | 2 cases | Distance : attaque | Vol : saute un allié si atterrissage libre |
| Trappeur sylvestre (`sylvan_trapper`) | commun ; 2 ATQ / 5 PV ; délai 2 | 1 case | 1 case | Piège : case libre devant lui | — |

#### Ombre — 11 unités

| Unité | Base native (ATQ / PV / délai) | Avance max. | Attaque | Effets : cible/zone actuelle | Mobilité particulière |
|---|---|---|---|---|---|
| Guerrier d’ossements (`bone`) | commun ; 3 ATQ / 3 PV ; délai 0 | 1 case | 1 case | Aucun | — |
| Ombre vorace (`shade`) | rare ; 3 ATQ / 3 PV ; délai 1 | 2 cases | 1 case | Célérité : déplacement | Charge après déplacement |
| Veilleur du tombeau (`crypt`) | commun ; 2 ATQ / 7 PV ; délai 1 | 1 case | 1 case | Armure : soi ; Garde : couronne de sa ligne | — |
| Faucheur de fièvre (`plague`) | rare ; 3 ATQ / 5 PV ; délai 2 | 1 case | 1 case | Poison : cible touchée | — |
| Archiliche de Minuit (`lich`) | légendaire ; 6 ATQ / 9 PV ; délai 4 | 1 case | 1 case | Impact : autre ennemi de sa ligne (moteur actuel) | — |
| Banshee des Voiles (`banshee`) | épique ; 4 ATQ / 5 PV ; délai 3 | 1 case | 2 cases | Distance : attaque | Vol : saute un allié si atterrissage libre |
| Vampire d’Obsidienne (`vampire`) | épique ; 5 ATQ / 6 PV ; délai 3 | 1 case | 1 case | Vol de vie : son héros | — |
| Chevalier du Tombeau (`graveknight`) | rare ; 4 ATQ / 8 PV ; délai 2 | 1 case | 1 case | Armure : soi ; Riposte : ennemi au contact | Charge après déplacement |
| Lame nocturne (`nightblade`) | commun ; 3 ATQ / 3 PV ; délai 0 | 1 case | 1 case | Perforation : cible attaquée | — |
| Spectre du Caveau (`spectre`) | rare ; 3 ATQ / 4 PV ; délai 1 | 2 cases | 1 case | Célérité : déplacement | Charge après déplacement |
| Inquisiteur des Brumes (`mist_inquisitor`) | rare ; 2 ATQ / 6 PV ; délai 3 | 1 case | 1 case | Silence : ennemi de sa ligne | — |

#### Forge — 10 unités

| Unité | Base native (ATQ / PV / délai) | Avance max. | Attaque | Effets : cible/zone actuelle | Mobilité particulière |
|---|---|---|---|---|---|
| Marteau des Monts (`smith`) | commun ; 3 ATQ / 6 PV ; délai 1 | 1 case | 1 case | Aucun | — |
| Golem runique (`golem`) | rare ; 2 ATQ / 12 PV ; délai 2 | 1 case | 1 case | Armure : soi ; Garde : couronne de sa ligne ; Riposte : ennemi au contact | — |
| Sapeur gobelin (`bomb`) | rare ; 4 ATQ / 3 PV ; délai 2 | 1 case | 1 case | Impact : autre ennemi de sa ligne (moteur actuel) | — |
| Foreur de fer (`drill`) | commun ; 2 ATQ / 5 PV ; délai 0 | 1 case | 1 case | Armure : soi | — |
| Colosse de braise (`colossus`) | légendaire ; 6 ATQ / 13 PV ; délai 4 | 1 case | 1 case | Armure : soi | — |
| Ingénieure d’acier (`engineer`) | épique ; 3 ATQ / 7 PV ; délai 3 | 1 case | 1 case | Inspiration : allié de sa ligne | — |
| Canon des Terres Rouges (`cannon`) | épique ; 5 ATQ / 7 PV ; délai 3 | 1 case | 2 cases | Distance : attaque | — |
| Mécaniste des Hauts-Fours (`mechanist`) | rare ; 2 ATQ / 8 PV ; délai 2 | 1 case | 1 case | Inspiration : allié de sa ligne | — |
| Marchefer (`ironwraith`) | commun ; 2 ATQ / 7 PV ; délai 1 | 1 case | 1 case | Protection : sa couronne | — |
| Alchimiste des Braises (`alchemist`) | rare ; 3 ATQ / 5 PV ; délai 2 | 1 case | 1 case | Poison : cible touchée | — |

#### Éther — 11 unités

| Unité | Base native (ATQ / PV / délai) | Avance max. | Attaque | Effets : cible/zone actuelle | Mobilité particulière |
|---|---|---|---|---|---|
| Feu follet (`spark`) | commun ; 2 ATQ / 3 PV ; délai 0 | 1 case | 2 cases | Distance : attaque | — |
| Oracle des Astres (`mystic`) | rare ; 3 ATQ / 4 PV ; délai 2 | 1 case | 2 cases | Distance : attaque | — |
| Élémentaire azuré (`elemental`) | épique ; 5 ATQ / 8 PV ; délai 3 | 1 case | 1 case | Impact : autre ennemi de sa ligne (moteur actuel) | — |
| Griffon du Zénith (`griffin`) | épique ; 5 ATQ / 6 PV ; délai 3 | 2 cases | 1 case | Célérité : déplacement | Vol : saute un allié si atterrissage libre ; Charge après déplacement |
| Sentinelle prismatique (`sentinel`) | rare ; 2 ATQ / 9 PV ; délai 2 | 1 case | 1 case | Armure : soi ; Garde : couronne de sa ligne ; Riposte : ennemi au contact | — |
| Dragon des Sept Cieux (`dragon`) | légendaire ; 7 ATQ / 12 PV ; délai 5 | 1 case | 1 case | Impact : autre ennemi de sa ligne (moteur actuel) | Vol : saute un allié si atterrissage libre |
| Esprit de Tempête (`tempest`) | rare ; 3 ATQ / 6 PV ; délai 2 | 1 case | 1 case | Impact : autre ennemi de sa ligne (moteur actuel) | — |
| Voyante des Étoiles (`seer`) | commun ; 2 ATQ / 4 PV ; délai 1 | 1 case | 2 cases | Distance : attaque | — |
| Chevalier du Zénith (`aetherknight`) | épique ; 5 ATQ / 9 PV ; délai 3 | 1 case | 1 case | Perforation : cible attaquée | Charge après déplacement |
| Séraphin d’Azur (`seraph`) | légendaire ; 5 ATQ / 10 PV ; délai 4 | 1 case | 1 case | Soin : allié de sa ligne | Vol : saute un allié si atterrissage libre |
| Marcheur des Portails (`portal_walker`) | rare ; 3 ATQ / 5 PV ; délai 2 | 1 case | 1 case | Portail : autre ligne, même colonne | Changement de ligne conditionnel |

**Exemple de lecture :** Milicien Commun : **2 ATQ / 5 PV, délai 0, avance 1 case, attaque à 1 case**. Porte-égide Commun : **1 ATQ / 9 PV, délai 1, avance 1 case, attaque à 1 case**, avec Armure 2, Garde et Riposte actuelles (Riposte fixe 2 dans le moteur ; **riposte égale à l'ATQ** uniquement projetée). Même au rang Éveillé, les caractéristiques de mouvement/portée **ne changent pas sans décision spécifique**. Les stats finales des futures raretés restent à définir.

### Règle de conception et interface souhaitée

- **Six rangs affichables :** Commun, Rare, Épique, Légendaire, Divin, Éveillé ; **un état d'évolution par rang**, au lieu de trois sous-paliers à définir pour chaque rang. Les identifiants techniques déjà utilisés dans la Collection, notamment `divine` et `éveillée`, ne seront pas renommés sans migration étudiée.
- **Une seule carte visible par personnage** dans la Collection, avec son portrait déjà autorisé, nom, rareté **réelle actuelle**, possession et caractéristiques. **Au clic/toucher**, une fiche lisible montre la capacité, les stats et **la prochaine évolution** (ou « À définir »), avec accès secondaire au détail des autres raretés. Le survol peut être facultatif sur ordinateur, mais ne doit jamais être obligatoire pour le mobile ou le clavier.
- **La rareté native n'est pas toujours Commune.** Certaines cartes commencent Rare, Épique ou Légendaire : préserver leurs valeurs et identifiants ; ne pas leur attribuer des versions inférieures fictives ni une progression 100 % Commune→Éveillée sans avoir défini les règles d'accès.
- **Une fiche de conception par unité**, dans laquelle chaque rang comporte **une ligne de synthèse** : `Rang | ATQ / PV / délai | Déplacement (cases + mobilité spéciale) | Portée d'attaque (cases) | Zone / cible des capacités | Capacités héritées + gain du rang | Obtention | Description | État`. Un champ peut rester « À définir » avant arbitrage ; aucun bonus, aucune mobilité ni portée inventés. **Les 53 lignes du socle ci-dessus constituent les valeurs actuelles, distinctes des 6 raretés futures** ; les descriptions des 23 sorts restent dans l'audit.
- **Ne pas transformer l'historique en règle actuelle :** les trois sous-niveaux du Milicien discutés dans Notion (réduction du premier coup, riposte, Dernier Rempart et leurs valeurs validées) sont préservés comme **décisions historiques de l'ancien modèle** ; leur traduction en **un seul rang Rare, Épique, etc.** nécessite un nouvel arbitrage. Le Milicien n'a **pas** Garde.
- **Séparer les trois systèmes :** actuellement, une unité possède des **améliorations payantes 0 à 3** (35/70/105 éclats, bonus ATQ/PV), une **maîtrise 0 à 3** qui rapporte une progression propre, et **une rareté native fixe**. La décision sur « une évolution par rareté » concerne le **futur système** ; elle ne supprime, ne rembourse et ne migre pas implicitement les améliorations, maîtrises, decks et sauvegardes. Leur coexistence reste à décider avant programmation.
- **Actualisation du 24 octobre 2026 — Concorde :** la [PR nº 42](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/42) est **fusionnée sur main** (`ea1e18c49bcfd291a664dacdf95b4bb5c847af89`) : elle réutilise les logos déjà peints **en haut à droite** avec une surbrillance conditionnelle, sans nouvel emblème importé. La variante ancienne d'emblèmes nouveaux **centrés en haut**, décrite au §2, est **historique et non retenue**. La présente PR nº 41 demeure séparée et non fusionnée.

### Petit tableau des rangs — une évolution et non trois par rareté

| Rang | Ce qui sera défini une seule fois par carte | Statut global |
|---|---|---|
| Commun | Version de référence si la rareté native est Commune | Stats actuelles conservées |
| Rare | Évolution propre au rang, ou rareté native déjà jouable | Effets/obtention à préciser |
| Épique | Évolution propre au rang, ou rareté native déjà jouable | Effets/obtention à préciser |
| Légendaire | Évolution propre au rang, ou rareté native déjà jouable | Reprendre les anciens choix à un seul rang |
| Divin | Une forme nouvelle par unité, si définie | À concevoir (hors prototype de labo) |
| Éveillé | Une forme nouvelle par unité, si définie | À concevoir |

### Tableau de conception : une capacité à définir par rareté pour chacune des 53 unités

**Tableaux de travail pour Notion et la conception, pas une interface à afficher dans le jeu.** Chaque colonne correspond à **une seule version de rareté**, sans sous-paliers I / II / III. **Actuel** désigne la seule version jouable du catalogue, avec capacité et chiffres de base (audit détaillé au §4). **À définir** est un espace libre pour imaginer puis faire valider une capacité de ce rang ; **—** représente une rareté inférieure à la rareté native, non définie. Ce tableau ne crée aucune carte supplémentaire.

**Milicien :** les six cases portent maintenant une **description complète et lisible de sa progression par rareté**, rédigée à partir des accords de conception, notamment le choix de **5 PV après Dernier Rempart**. La description actuelle (Commun) est factuelle ; les cinq autres sont des **textes de conception**, non intégrés. Les réductions de 1/2/2/3 dégâts **se remplacent** et sont limitées au premier coup après invocation ; la riposte Divine d'une valeur égale à l'ATQ effective est une fois par invocation ; les 3 PV du Légendaire sont un bonus **total par rapport à l'Épique**, non l'addition des anciens paliers. L'Éveillé survit avec 5 PV au plus, **une seule fois par invocation**. Il n'a **pas Garde**. **Décision du propriétaire :** au rang **Éveillé**, le Milicien **conserve** sa réduction du premier coup (−3 dégâts) **et sa riposte** (dégâts égaux à l'ATQ effective), puis **gagne** Dernier Rempart (survie à 5 PV). Les avantages des rangs précédents sont conservés lorsqu'ils ne sont pas remplacés par une valeur supérieure ; le bonus de PV du Légendaire est donc aussi conservé. **À préciser avant codage :** l'ordre exact de résolution des effets, les statistiques ATQ/PV totales, l'équilibrage et l'affichage sur les vraies cartes. Les anciennes variantes I–III restent conservées uniquement comme historique dans la [fiche Notion principale](https://app.notion.com/p/4026633072a881ed9768c615f538a929).

**Lisibilité dans le jeu — règle de présentation :** la **petite carte** doit afficher les statistiques réelles et des **noms courts / icônes** (pour le Milicien Éveillé : `Réduction −3`, `Riposte`, `Dernier Rempart`), **pas le texte complet** de tous les pouvoirs hérités. La **fiche détaillée**, accessible au clic, toucher et clavier, donne **chaque descriptif exact** (condition, montant, limite d'une fois par invocation et conservation des pouvoirs). Ne pas dépendre uniquement d'une infobulle au survol, inaccessible sur mobile ; ne pas recopier les règles de résolution dans le DOM. Cette présentation est une **spécification**, pas une interface déjà intégrée.

**Tableaux actifs et plus lisibles dans Notion :** [Évolutions simplifiées — 53 unités, six raretés](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f). Les nouveaux pouvoirs et bonus seront renseignés au fur et à mesure des décisions et séparés clairement des données déjà intégrées.

#### Aube — 10 unités

| Unité | Commun | Rare | Épique | Légendaire | Divin | Éveillé |
|---|---|---|---|---|---|---|
| Milicien de l’Aube (`militia`) | **Actuel :** Combattant au corps à corps, 2 ATQ, 5 PV, délai 0. Aucune capacité spéciale. | **Description retenue :** Réduit de 1 les dégâts du premier coup reçu après son invocation. Une seule fois par invocation. | **Description retenue :** Réduit de 2 les dégâts du premier coup reçu après son invocation. Une seule fois par invocation. | **Description retenue :** Réduit de 2 les dégâts du premier coup reçu après son invocation, une seule fois. Possède 3 PV maximum supplémentaires par rapport au Milicien Épique (sans addition des anciens sous-paliers). | **Description retenue :** Réduit de 3 les dégâts du premier coup reçu après son invocation, une seule fois. Lorsqu'un ennemi l'attaque au corps à corps, il riposte en infligeant des dégâts bruts égaux à son ATQ effective, une seule fois par invocation. | **Description retenue (Éveillé) :** Conserve la réduction de **3 dégâts sur le premier coup reçu**, une fois par invocation, et la **riposte égale à son ATQ effective** contre un attaquant au corps à corps, une fois par invocation. Ajoute **Dernier Rempart** : lorsqu'un coup devrait le tuer, il survit avec **5 PV** (sans dépasser son maximum), une seule fois par invocation. Conserve le bonus de PV déjà acquis au rang Légendaire. |
| Porte-égide (`shield`) | **Actuel :** Armure 2. Garde : intercepte les attaques contre la couronne de sa ligne. Riposte : 2 dégâts au contact, 1 fois/tour. | À définir | À définir | À définir | À définir | À définir |
| Arbalétrière (`archer`) | **Actuel :** Distance : attaque jusqu’à 2 cases devant elle, sur sa ligne. | À définir | À définir | À définir | À définir | À définir |
| Sœur de l’Aurore (`cleric`) | — | **Actuel :** Soin : après les attaques, rend 2 PV à l’allié le plus blessé proportionnellement sur sa ligne (elle-même incluse). | À définir | À définir | À définir | À définir |
| Paladin solaire (`paladin`) | — | — | **Actuel :** Armure 2. Riposte : inflige 2 dégâts à un attaquant adjacent au contact, au plus une fois par tour. | À définir | À définir | À définir |
| Porte-étendard (`banner`) | — | **Actuel :** Inspiration : tous les 3 tours, donne +1 ATQ au premier autre allié de sa ligne (cumul possible, ATQ plafonnée à 12). | À définir | À définir | À définir | À définir |
| Capitaine de l’Aube (`scoutcaptain`) | — | **Actuel :** Inspiration : tous les 3 tours, donne +1 ATQ au premier autre allié de sa ligne (cumul possible, ATQ plafonnée à 12). | À définir | À définir | À définir | À définir |
| Prieur solaire (`sunpriest`) | — | **Actuel :** Soin : après les attaques, rend 2 PV à l’allié le plus blessé proportionnellement sur sa ligne. | À définir | À définir | À définir | À définir |
| Lancier des Remparts (`lancer`) | **Actuel :** Perforation : ignore l’armure. Charge : +2 ATQ s’il a avancé avant d’attaquer. | À définir | À définir | À définir | À définir | À définir |
| Ange du Bastion (`dawnbastion`) | — | — | — | **Actuel :** Protection : à l’invocation, +3 bouclier à sa couronne (plafond 20). Vol : franchit un allié. Riposte : 2 dégâts au contact, 1 fois/tour. | À définir | À définir |

#### Sylve — 11 unités

| Unité | Commun | Rare | Épique | Légendaire | Divin | Éveillé |
|---|---|---|---|---|---|---|
| Éclaireuse sylvestre (`ranger`) | **Actuel :** Distance : attaque jusqu’à 2 cases devant elle, sur sa ligne. | À définir | À définir | À définir | À définir | À définir |
| Loup des Brumes (`wolf`) | **Actuel :** Célérité : avance jusqu’à 2 cases libres/tour. Charge : +2 ATQ s’il a avancé avant de frapper. | À définir | À définir | À définir | À définir | À définir |
| Gardien des Racines (`treant`) | — | **Actuel :** Armure 2. Garde : intercepte les attaques visant la couronne de sa ligne. Riposte : 2 dégâts au contact, 1 fois/tour. | À définir | À définir | À définir | À définir |
| Dryade luminescente (`dryad`) | — | **Actuel :** Soin : après les attaques, rend 2 PV à l’allié le plus blessé proportionnellement sur sa ligne. | À définir | À définir | À définir | À définir |
| Cerf astral (`stag`) | — | — | **Actuel :** Célérité : avance jusqu’à 2 cases/tour. Charge : +2 ATQ s’il a avancé avant de frapper. | À définir | À définir | À définir |
| Traqueur d’épines (`thorn`) | **Actuel :** Poison : après une attaque, inflige 1 dégât par résolution pendant 2 résolutions à la cible touchée. | À définir | À définir | À définir | À définir | À définir |
| Luciole des Épineuses (`pixie`) | **Actuel :** Protection : à l’invocation, +3 bouclier à sa couronne (plafond 20). Vol : franchit un allié si l’arrivée est libre. | À définir | À définir | À définir | À définir | À définir |
| Ours des Roches (`bear`) | — | **Actuel :** Armure 2 : réduit les dégâts subis. Ne possède pas Garde. | À définir | À définir | À définir | À définir |
| Archidruide Feuillage (`archdruid`) | — | — | **Actuel :** Soin : après les attaques, rend 2 PV à l’allié le plus blessé proportionnellement sur sa ligne. | À définir | À définir | À définir |
| Hibou du Crépuscule (`owl`) | **Actuel :** Distance : attaque jusqu’à 2 cases devant lui. Vol : franchit un allié si la case suivante est libre. | À définir | À définir | À définir | À définir | À définir |
| Trappeur sylvestre (`sylvan_trapper`) | **Actuel :** Piège : tous les 3 tours, arme la case libre juste devant lui si possible. À l’arrivée d’un ennemi : 1 dégât brut et immobilisation, piège visible durant au plus 3 résolutions. | À définir | À définir | À définir | À définir | À définir |

#### Ombre — 11 unités

| Unité | Commun | Rare | Épique | Légendaire | Divin | Éveillé |
|---|---|---|---|---|---|---|
| Guerrier d’ossements (`bone`) | **Actuel :** Corps à corps : attaque à 1 case devant lui, sur sa ligne. | À définir | À définir | À définir | À définir | À définir |
| Ombre vorace (`shade`) | — | **Actuel :** Célérité : avance jusqu’à 2 cases/tour. Charge : +2 ATQ s’il a avancé avant de frapper. | À définir | À définir | À définir | À définir |
| Veilleur du tombeau (`crypt`) | **Actuel :** Armure 2. Garde : intercepte les attaques visant la couronne de sa ligne. | À définir | À définir | À définir | À définir | À définir |
| Faucheur de fièvre (`plague`) | — | **Actuel :** Poison : après une attaque, inflige 1 dégât par résolution pendant 2 résolutions à la cible touchée. | À définir | À définir | À définir | À définir |
| Archiliche de Minuit (`lich`) | — | — | — | **Actuel :** Impact de zone : sa frappe sur une unité peut infliger 2 dégâts supplémentaires à un autre ennemi de la même ligne. | À définir | À définir |
| Banshee des Voiles (`banshee`) | — | — | **Actuel :** Distance : attaque à 2 cases devant elle. Vol : peut franchir une case occupée par un allié si la case suivante est libre. | À définir | À définir | À définir |
| Vampire d’Obsidienne (`vampire`) | — | — | **Actuel :** Vol de vie : à chaque attaque effectuée, rend 2 PV à son héros, même si la frappe a été absorbée. | À définir | À définir | À définir |
| Chevalier du Tombeau (`graveknight`) | — | **Actuel :** Armure 2. Charge : +2 ATQ s’il a avancé. Riposte : 2 dégâts au contact, 1 fois/tour (pas de Garde). | À définir | À définir | À définir | À définir |
| Lame nocturne (`nightblade`) | **Actuel :** Perforation : ses attaques ignorent l’armure de la cible. | À définir | À définir | À définir | À définir | À définir |
| Spectre du Caveau (`spectre`) | — | **Actuel :** Célérité : avance jusqu’à 2 cases/tour sur sa ligne. Charge : +2 ATQ après déplacement (ne change pas de ligne). | À définir | À définir | À définir | À définir |
| Inquisiteur des Brumes (`mist_inquisitor`) | — | **Actuel :** Silence : avant son déplacement, désactive certaines capacités d’un ennemi de sa ligne pour la résolution en cours (au plus une fois tous les 3 tours). | À définir | À définir | À définir | À définir |

#### Forge — 10 unités

| Unité | Commun | Rare | Épique | Légendaire | Divin | Éveillé |
|---|---|---|---|---|---|---|
| Marteau des Monts (`smith`) | **Actuel :** Corps à corps : attaque à 1 case devant lui, sur sa ligne. | À définir | À définir | À définir | À définir | À définir |
| Golem runique (`golem`) | — | **Actuel :** Armure 2. Garde : intercepte les attaques visant la couronne. Riposte : 2 dégâts au contact, 1 fois/tour. | À définir | À définir | À définir | À définir |
| Sapeur gobelin (`bomb`) | — | **Actuel :** Impact de zone : sa frappe sur une unité peut infliger 2 dégâts supplémentaires à un autre ennemi de la même ligne. | À définir | À définir | À définir | À définir |
| Foreur de fer (`drill`) | **Actuel :** Armure 2 : réduit de 2 les dégâts bruts de chaque frappe, avec un minimum de 1 avant barrière. | À définir | À définir | À définir | À définir | À définir |
| Colosse de braise (`colossus`) | — | — | — | **Actuel :** Armure 2 : résiste aux frappes. Ne possède ni Garde ni Riposte dans les règles actuelles. | À définir | À définir |
| Ingénieure d’acier (`engineer`) | — | — | **Actuel :** Inspiration : tous les 3 tours, donne +1 ATQ au premier autre allié de sa ligne (cumul possible, ATQ plafonnée à 12). | À définir | À définir | À définir |
| Canon des Terres Rouges (`cannon`) | — | — | **Actuel :** Distance : attaque jusqu’à 2 cases devant lui, sur sa ligne. | À définir | À définir | À définir |
| Mécaniste des Hauts-Fours (`mechanist`) | — | **Actuel :** Inspiration : tous les 3 tours, donne +1 ATQ au premier autre allié de sa ligne (cumul possible, ATQ plafonnée à 12). | À définir | À définir | À définir | À définir |
| Marchefer (`ironwraith`) | **Actuel :** Protection : à l’invocation, +3 bouclier à sa couronne (plafond 20). | À définir | À définir | À définir | À définir | À définir |
| Alchimiste des Braises (`alchemist`) | — | **Actuel :** Poison : après une attaque, inflige 1 dégât par résolution pendant 2 résolutions à la cible touchée. | À définir | À définir | À définir | À définir |

#### Éther — 11 unités

| Unité | Commun | Rare | Épique | Légendaire | Divin | Éveillé |
|---|---|---|---|---|---|---|
| Feu follet (`spark`) | **Actuel :** Distance : attaque jusqu’à 2 cases devant lui, sur sa ligne (portée 3 seulement proposée, non active). | À définir | À définir | À définir | À définir | À définir |
| Oracle des Astres (`mystic`) | — | **Actuel :** Distance : attaque jusqu’à 2 cases devant lui, uniquement sur sa ligne. | À définir | À définir | À définir | À définir |
| Élémentaire azuré (`elemental`) | — | — | **Actuel :** Impact de zone : sa frappe sur une unité peut infliger 2 dégâts supplémentaires à un autre ennemi de la même ligne. | À définir | À définir | À définir |
| Griffon du Zénith (`griffin`) | — | — | **Actuel :** Célérité : avance jusqu’à 2 cases/tour. Vol : franchit un allié si possible. Charge : +2 ATQ après déplacement. | À définir | À définir | À définir |
| Sentinelle prismatique (`sentinel`) | — | **Actuel :** Armure 2. Garde : intercepte les attaques visant la couronne. Riposte : 2 dégâts au contact, 1 fois/tour. | À définir | À définir | À définir | À définir |
| Dragon des Sept Cieux (`dragon`) | — | — | — | **Actuel :** Impact de zone : sa frappe sur une unité peut infliger 2 dégâts supplémentaires à un autre ennemi de sa ligne. Vol : franchit un allié si possible. | À définir | À définir |
| Esprit de Tempête (`tempest`) | — | **Actuel :** Impact de zone : sa frappe sur une unité peut infliger 2 dégâts supplémentaires à un autre ennemi de la même ligne. | À définir | À définir | À définir | À définir |
| Voyante des Étoiles (`seer`) | **Actuel :** Distance : attaque jusqu’à 2 cases devant elle, sur sa ligne. | À définir | À définir | À définir | À définir | À définir |
| Chevalier du Zénith (`aetherknight`) | — | — | **Actuel :** Perforation : ignore l’armure. Charge : +2 ATQ s’il a avancé avant de frapper. | À définir | À définir | À définir |
| Séraphin d’Azur (`seraph`) | — | — | — | **Actuel :** Soin : après les attaques, rend 2 PV à l’allié le plus blessé proportionnellement sur sa ligne. Vol : franchit un allié. | À définir | À définir |
| Marcheur des Portails (`portal_walker`) | — | **Actuel :** Portail : avant le déplacement, change de ligne à la même colonne libre si le moteur juge le gain suffisant (au plus une fois tous les 3 tours). | À définir | À définir | À définir | À définir |

### Plan de mise à jour du jeu — futures PR séparées

1. **Valider le modèle de progression** : décider du lien entre la rareté évolutive, les améliorations payantes existantes, la maîtrise, l'obtention de copies et le deck, en préservant toutes les sauvegardes. Ne pas retirer l'atelier ni changer le coût des éclats de manière implicite.
2. **Valider le socle de combat avant les pouvoirs** : parcourir les 53 unités du référentiel (déplacement, Vol / Célérité / Portail, portée d'attaque, cible/zone des pouvoirs, délai, ATQ/PV et particularités). Pour chaque rang, commencer par décider **si vitesse ou portée sont conservées ou modifiées**, puis les statistiques, les capacités héritées, le nouveau gain, les conditions et le descriptif complet. Commencer par Milicien puis Porte-égide, sans importer les anciennes valeurs I–III. Rien de non arbitré n'est ajouté au moteur ; éviter de recopier les règles dans les fiches.
3. **PR de simplification de l'interface Collection** : remplacer les six cartes côte à côte dans `src/ui/collection.js` / `assets/collection.css` par une vignette unique et une fiche accessible au clic/toucher ; réutiliser `collectionInspection`, le rendu de cartes et les fonctions existantes. Tant que le nouveau système n'est pas programmé, montrer **la version native et « prochaine évolution à définir »** sans débloquer de copies fictives. Préserver filtres, onglets, raccourcis du deck, les cinq Ordres et les sorts.
4. **PR moteur/progression uniquement après validation des données** : centraliser les définitions par identifiant de carte, garder les règles dans le moteur (sans DOM), vérifier IA, équilibrage, 2–4 lignes et ancien 3 × 5 ; laboratoire isolé ; aucune migration implicite. Préserver jeu web et export généré `JOUER.html` depuis les mêmes sources.
5. **Vérifier sur le code exact** : `npm test`, parité lorsque les règles ne changent pas, `npm run build`, `npm run build:test` ; bureau, mobile, clavier, mouvement réduit, image, deck, sauvegarde/reprise, anciens profils, export hors connexion. Relire les PR concurrentes, notamment la PR nº 43 de documentation de publication ; la PR nº 42 est désormais fusionnée sur main. Fusion uniquement sur accord explicite pour **chaque PR**, puis publication Sites vérifiée séparément.

**Statut : préparation documentaire ; aucune modification du jeu, du laboratoire, des images, des statistiques ni des sauvegardes dans cette PR.** Les sections 1 à 8 conservent l'audit factuel du moteur et les descriptifs proposés des **76 cartes actuelles**.

---

## 1. Principes de lecture

- Le plateau courant a **10 cases par ligne** et 2 à 4 lignes ; les anciens combats **3 × 5** sont toujours pris en charge. Le joueur avance vers la droite et l’IA vers la gauche.

- Les unités normales attaquent devant elles à **1 case** ; les unités « Distance » attaquent jusqu’à **2 cases devant elles**, sur leur **propre ligne**, jamais librement d’une ligne à l’autre. En portée, une Garde est prioritaire si elle se trouve dans les cases examinées.

- Lorsqu'aucune unité ennemie n'est devant elle à portée, une unité peut attaquer la couronne si elle se trouve assez près de cette couronne. Une Garde présente ailleurs sur cette ligne peut actuellement intercepter ce coup, **même derrière l'attaquant** : voir §2.

- Déplacement standard : **1 case** ; Célérité : **2 cases au plus**, sauf blocage ou cible à portée. Vol permet de sauter **une case occupée** si la case suivante est libre ; ce n'est pas un changement libre de ligne.

- Attaque, armure, barrières, concorde, améliorations de carte, équipement, Forge, maîtrise et réputation modifient le résultat. Les valeurs ci-dessous sont **de base**, hors bonus. Les dégâts bruts des sorts/effets sont généralement réduits par l'armure ; le moteur applique un minimum de 1 avant barrière, sauf cas particuliers de protection expérimentale.

- **Concorde (bonus de faction commun aux 53 unités)** : si **au moins 2 unités alliées du même Ordre** se trouvent sur la **même ligne**, **chacune** gagne **+1 ATQ** tant que la condition reste vraie. Les sorts n'en bénéficient pas. Cela s'ajoute à la capacité propre à chaque unité.

- **Délai de carte** : à la pioche, le compteur vaut `max(0, délai - 1)`. Les valeurs 0 **et** 1 sont donc jouables immédiatement ; 2 demande un tour d'attente, etc. Le changement proposé « minimum 1 » n'est **pas** appliqué.

- Les nouveaux combats séparent les actions alliées et adverses ; les anciens combats sauvegardés gardent leur mode historique. Sorts : le joueur sélectionne une cible **autorisée** et confirme, mais certaines priorités automatiques restent imposées.

## 2. Anomalies et décisions à soumettre au propriétaire

| Priorité | Constat du code | Risque / décision demandée |

|---|---|---|

| **A** | **Garde / attaque vers l'arrière :** une attaque destinée à la couronne est redirigée vers une Garde quelconque de la ligne, sans contrôle qu'elle se situe entre l'attaquant et la couronne. L'événement visuel pointe aussi vers cette case arrière. | Comportement réel, déjà couvert par un ancien test de « protection de couronne ». Décider : **garder une protection magique sur toute la ligne et l'expliquer**, ou **restreindre l'interception à l'avant** puis rééquilibrer. Ne pas corriger sans choix. |

| **A** | **Impact de zone :** après avoir touché une unité, le moteur cherche un autre ennemi vivant **partout sur la même ligne** (premier trouvé en ordre de colonnes), sans notion de proximité ni de direction. | Un ennemi derrière l'attaquant peut perdre des PV ; définir si c'est une onde magique volontaire ou une zone à restreindre. |

| **B** | **Oracle des Astres** : « viser les lignes ennemies » peut suggérer plusieurs lignes, mais la portée actuelle est **2 cases sur une seule ligne**. | Réécrire, sans lui donner une nouvelle capacité. |

| **B** | **Spectre du Caveau** : « traverse rapidement les lignes », mais ne change pas de ligne automatiquement ; Célérité + Charge sur la même ligne. | Corriger le texte trompeur. |

| **B** | **Trappeur sylvestre** : l'ancien texte annonce « entre les colonnes 2 et 4 ». Sur le plateau actuel, le moteur tente la case juste devant lui et l'accepte si elle est libre et dans la zone générale autorisée ; il n'applique pas la limite 2–4. | Corriger la description ou décider d'une restriction de règle. |

| **B** | **Prison de lierre / Racines du Monde** : le texte annonce parfois « un tour », mais le moteur met un **compteur d'immobilisation à 2**. | Vérifier l'affichage et les résolutions alternées/historiques avant d'annoncer une durée en « tours ». |

| **B** | **Sorts en doublon :** Lame de feu/Rayon des Couronnes, Souffle vital/Pacte vital, Orage runique/Éclairs d'Obsidienne, Prison de lierre/Racines du Monde ont actuellement les mêmes effets par paire, avec des délais parfois différents. | Conserver provisoirement le moteur ; discuter de rôles distincts lors de l'équilibrage. |

| **B** | **Concorde** : texte flottant sur le plateau, bonus peu expliqué dans les descriptions. | Proposition UX : capacité de faction expliquée dans la fiche de **chaque unité** ; **emblème exclusif de sa faction, centré en haut de la carte**, mis en valeur uniquement lorsque Concorde est actif, à la place du texte flottant. Emblèmes à créer et valider dans l'atelier graphique avant toute intégration. |

| **C** | **Délai 0 / 1** : même disponibilité immédiate ; certaines évaluations de deck/IA distinguent toutefois 0 et 1. | Proposition : afficher au minimum 1, seulement après vérification des évaluations et sauvegardes. |

| **C** | **Feu follet** (2 ATQ, 3 PV, délai 0, portée 2) est plus fragile que l'Éclaireuse sylvestre à attaque/délai/portée identiques. | Tester **portée 3** à statistiques inchangées ; ne pas décider avant simulation et jeu humain. |

### Historique : contrat visuel proposé pour des emblèmes Concorde neufs (non retenu)

**Cet ancien scénario ne doit pas être confondu avec la solution intégrée par la PR nº 42** (logos existants sur les cartes, surbrillance discrète). Les choix qui suivent décrivent l'idée initiale et ne lancent pas de nouvelle production graphique.

- **Un emblème original distinct pour chacun des cinq Ordres : Aube, Sylve, Ombre, Forge et Éther.** Ce ne sera **pas** un symbole générique partagé ; chaque carte emploiera celui de sa faction.
- **Position définitive demandée : en haut, exactement au centre du cadre de la carte** (et non dans un coin ou dans un bandeau flottant au-dessus du plateau). Dimension et intégration à ajuster aux cadres existants pour ne masquer ni le nom, ni les statistiques, ni les autres éléments.
- **Bonus inactif :** emblème discret, sans effet lumineux. **Bonus actif :** ce même emblème s'éclaire ou reçoit un léger halo/relief ; pas de texte flottant « Concorde ». Respecter le mouvement réduit et la lisibilité mobile ; ne pas confondre l'effet actif avec la rareté ou un statut.
- **Documentation en jeu :** chaque fiche d'unité indique « Bonus de faction — [Ordre] : dès que deux alliés de cet Ordre sont sur la même ligne, chacun gagne +1 ATQ ; le bonus cesse quand la condition disparaît ». Les sorts ne reçoivent pas ce bonus.
- **Production graphique ultérieure :** faire créer spécifiquement les cinq emblèmes par génération d'images dans l'atelier `couronne-et-arcanes-art`, à partir des contrats graphiques actifs. **Présenter chaque version au propriétaire pour validation** avant import ; conserver source, droits, provenance, reçus et empreintes, puis intégrer dans une PR graphique séparée. Aucune image n'est approuvée ou produite par le présent audit.
- **Règles conservées :** la formation continue d'être calculée par le moteur ; l'emblème reflète son état réel et n'accorde aucun bonus supplémentaire. Vérifier les deux camps, toutes les lignes et les parties sauvegardées.

## 3. Dictionnaire des capacités — fonctionnement actuel

| Capacité | Règle actuellement codée | Points d'attention |

|---|---|---|

| Corps à corps | Attaque devant à 1 case, même ligne. | La couronne est une cible distincte hors de la grille. |

| Distance | Attaque devant jusqu'à 2 cases, même ligne. | Ne peut pas choisir n'importe quelle carte ni changer de ligne. |

| Garde | Priorité comme cible si à portée ; intercepte une attaque visant la couronne sur la ligne. | **Interception possible depuis l'arrière** ; à décider. |

| Armure | Réduit les dégâts bruts de 2 par frappe ; au moins 1 avant barrière. | La perforation ignore l'armure. |

| Riposte | 2 dégâts bruts à un attaquant adjacent de contact, 1 fois par tour ; pas contre un tireur. | Nécessite une unité riposteuse active et non réduite au silence. |

| Vol | Peut franchir une case occupée par une unité si l'atterrissage est libre. | Pas de changement de ligne ; la présence d'un ennemi à portée bloque d'abord le déplacement. |

| Célérité | Jusqu'à 2 cases parcourues au lieu de 1 si libre et aucune cible à portée. | Se déclenche si la capacité n'est pas réduite au silence. |

| Charge | +2 ATQ pendant la frappe après avoir effectivement avancé dans cette résolution. | Trait secondaire de plusieurs cartes ; n'est pas attaché uniquement à « Célérité ». |

| Poison | L'attaque pose/renouvelle un poison : 1 dégât par résolution pendant au moins 2 résolutions visées, suivant l'état. | Effet différé ; la durée est renouvelable. |

| Impact de zone | Si une unité est la cible principale, 2 dégâts bruts à un autre ennemi vivant de la même ligne. | **Cible secondaire non limitée à la portée/face avant** ; pas d'effet secondaire lors du coup direct sur couronne. |

| Soin | Après les attaques, +2 PV au blessé de la ligne ayant la plus faible fraction de PV ; l'unité soignante peut se soigner. | Plusieurs soigneurs peuvent se déclencher. |

| Inspiration | Tous les 3 tours, donne +1 ATQ au premier autre allié de sa ligne selon l'ordre des cases, jusqu'à 12 ATQ. | Bonus durable et cumulable, différent de Ralliement et Concorde. |

| Protection | À l'invocation, +3 bouclier à sa propre couronne (plafond 20). | Effet unique d'invocation, pas une barrière sur l'unité. |

| Perforation | Ignore la réduction d'armure lors de la frappe. | Les barrières continuent d'absorber des dégâts. |

| Vol de vie | Quand l'unité attaque, son héros récupère jusqu'à 2 PV. | Déclenché même si la cible a absorbé le coup. |

| Concorde | 2 alliés vivants du même Ordre sur la même ligne : +1 ATQ chacun. | Actif aussi chez l'IA, retrait automatique quand la formation cesse. |

| Silence | Suspend les capacités déclenchées (Poison, Soin, Charge, etc.) pendant l'intervalle prévu ; conserve attaque normale, armure, portée, vol, garde, concorde. | Les états déjà appliqués peuvent perdurer ; réapplication immédiate limitée. |

| Portail / Faille | Changement vers une autre ligne en gardant la colonne ; emplacement libre et contraintes obligatoires. | Portail unité automatique selon avantage calculé ; Faille sort sur ligne destination. |

| Piège | Objet visible, public, déclenché par entrée d'ennemi sur la case (pas par un simple survol). | Piège runique 3 dégâts bruts ; sylvestre 1 + immobilisation. Maximum 2 pièges par camp ; 3 résolutions. |

| Barrière / Bouclier | Absorbe des dégâts avant les PV ; barrière de l'unité distincte du bouclier de couronne. | Les plafonds dépendent de chaque sort. |

| Ralliement | Bonus temporaire +1 ATQ, 2 tours, sans cumul. | Contrairement à Inspiration, ne modifie pas définitivement l'attaque de base. |

## 4. Propositions de descriptifs — les 53 unités

Le texte ci-dessous peut être découpé en **ligne courte sur la carte** (capacité) et **fiche détaillée** (capacité + bonus commun + précisions). Tous les chiffres sont ceux du moteur actuel, pas des buffs proposés. **Pour chaque unité de chaque section, la fiche doit ajouter explicitement :** « Bonus de faction — [Ordre] : 2 unités alliées de cet Ordre sur la même ligne = +1 ATQ pour chacune, tant qu'elles restent ensemble. »

### Alliance de l’Aube — 10 unités

| Carte | Base (délai / ATQ / PV) | Description factuelle proposée |

|---|---:|---|

| **Milicien de l’Aube** (`militia`) | 0 / 2 / 5 | Corps à corps : attaque à 1 case devant lui, sur sa ligne. **Concorde Aube** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Porte-égide** (`shield`) | 1 / 1 / 9 | Armure 2. Garde : intercepte les attaques contre la couronne de sa ligne. Riposte : 2 dégâts au contact, 1 fois/tour. **Concorde Aube** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Arbalétrière** (`archer`) | 1 / 2 / 3 | Distance : attaque jusqu’à 2 cases devant elle, sur sa ligne. **Concorde Aube** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Sœur de l’Aurore** (`cleric`) | 2 / 1 / 4 | Soin : après les attaques, rend 2 PV à l’allié le plus blessé proportionnellement sur sa ligne (elle-même incluse). **Concorde Aube** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Paladin solaire** (`paladin`) | 3 / 4 / 9 | Armure 2. Riposte : inflige 2 dégâts à un attaquant adjacent au contact, au plus une fois par tour. **Concorde Aube** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Porte-étendard** (`banner`) | 2 / 2 / 6 | Inspiration : tous les 3 tours, donne +1 ATQ au premier autre allié de sa ligne (cumul possible, ATQ plafonnée à 12). **Concorde Aube** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Capitaine de l’Aube** (`scoutcaptain`) | 1 / 3 / 6 | Inspiration : tous les 3 tours, donne +1 ATQ au premier autre allié de sa ligne (cumul possible, ATQ plafonnée à 12). **Concorde Aube** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Prieur solaire** (`sunpriest`) | 2 / 2 / 7 | Soin : après les attaques, rend 2 PV à l’allié le plus blessé proportionnellement sur sa ligne. **Concorde Aube** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Lancier des Remparts** (`lancer`) | 1 / 3 / 5 | Perforation : ignore l’armure. Charge : +2 ATQ s’il a avancé avant d’attaquer. **Concorde Aube** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Ange du Bastion** (`dawnbastion`) | 4 / 5 / 11 | Protection : à l’invocation, +3 bouclier à sa couronne (plafond 20). Vol : franchit un allié. Riposte : 2 dégâts au contact, 1 fois/tour. **Concorde Aube** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

### Conclave Sylvestre — 11 unités

| Carte | Base (délai / ATQ / PV) | Description factuelle proposée |

|---|---:|---|

| **Éclaireuse sylvestre** (`ranger`) | 0 / 2 / 4 | Distance : attaque jusqu’à 2 cases devant elle, sur sa ligne. **Concorde Sylve** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Loup des Brumes** (`wolf`) | 0 / 3 / 3 | Célérité : avance jusqu’à 2 cases libres/tour. Charge : +2 ATQ s’il a avancé avant de frapper. **Concorde Sylve** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Gardien des Racines** (`treant`) | 2 / 3 / 10 | Armure 2. Garde : intercepte les attaques visant la couronne de sa ligne. Riposte : 2 dégâts au contact, 1 fois/tour. **Concorde Sylve** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Dryade luminescente** (`dryad`) | 2 / 1 / 5 | Soin : après les attaques, rend 2 PV à l’allié le plus blessé proportionnellement sur sa ligne. **Concorde Sylve** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Cerf astral** (`stag`) | 3 / 5 / 6 | Célérité : avance jusqu’à 2 cases/tour. Charge : +2 ATQ s’il a avancé avant de frapper. **Concorde Sylve** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Traqueur d’épines** (`thorn`) | 1 / 2 / 5 | Poison : après une attaque, inflige 1 dégât par résolution pendant 2 résolutions à la cible touchée. **Concorde Sylve** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Luciole des Épineuses** (`pixie`) | 0 / 2 / 3 | Protection : à l’invocation, +3 bouclier à sa couronne (plafond 20). Vol : franchit un allié si l’arrivée est libre. **Concorde Sylve** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Ours des Roches** (`bear`) | 2 / 4 / 9 | Armure 2 : réduit les dégâts subis. Ne possède pas Garde. **Concorde Sylve** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Archidruide Feuillage** (`archdruid`) | 3 / 3 / 7 | Soin : après les attaques, rend 2 PV à l’allié le plus blessé proportionnellement sur sa ligne. **Concorde Sylve** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Hibou du Crépuscule** (`owl`) | 1 / 2 / 4 | Distance : attaque jusqu’à 2 cases devant lui. Vol : franchit un allié si la case suivante est libre. **Concorde Sylve** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Trappeur sylvestre** (`sylvan_trapper`) | 2 / 2 / 5 | Piège : tous les 3 tours, arme la case libre juste devant lui si possible. À l’arrivée d’un ennemi : 1 dégât brut et immobilisation, piège visible durant au plus 3 résolutions. **Concorde Sylve** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

### Cour des Ombres — 11 unités

| Carte | Base (délai / ATQ / PV) | Description factuelle proposée |

|---|---:|---|

| **Guerrier d’ossements** (`bone`) | 0 / 3 / 3 | Corps à corps : attaque à 1 case devant lui, sur sa ligne. **Concorde Ombre** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Ombre vorace** (`shade`) | 1 / 3 / 3 | Célérité : avance jusqu’à 2 cases/tour. Charge : +2 ATQ s’il a avancé avant de frapper. **Concorde Ombre** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Veilleur du tombeau** (`crypt`) | 1 / 2 / 7 | Armure 2. Garde : intercepte les attaques visant la couronne de sa ligne. **Concorde Ombre** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Faucheur de fièvre** (`plague`) | 2 / 3 / 5 | Poison : après une attaque, inflige 1 dégât par résolution pendant 2 résolutions à la cible touchée. **Concorde Ombre** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Archiliche de Minuit** (`lich`) | 4 / 6 / 9 | Impact de zone : sa frappe sur une unité peut infliger 2 dégâts supplémentaires à un autre ennemi de la même ligne. **Concorde Ombre** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Banshee des Voiles** (`banshee`) | 3 / 4 / 5 | Distance : attaque à 2 cases devant elle. Vol : peut franchir une case occupée par un allié si la case suivante est libre. **Concorde Ombre** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Vampire d’Obsidienne** (`vampire`) | 3 / 5 / 6 | Vol de vie : à chaque attaque effectuée, rend 2 PV à son héros, même si la frappe a été absorbée. **Concorde Ombre** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Chevalier du Tombeau** (`graveknight`) | 2 / 4 / 8 | Armure 2. Charge : +2 ATQ s’il a avancé. Riposte : 2 dégâts au contact, 1 fois/tour (pas de Garde). **Concorde Ombre** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Lame nocturne** (`nightblade`) | 0 / 3 / 3 | Perforation : ses attaques ignorent l’armure de la cible. **Concorde Ombre** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Spectre du Caveau** (`spectre`) | 1 / 3 / 4 | Célérité : avance jusqu’à 2 cases/tour sur sa ligne. Charge : +2 ATQ après déplacement (ne change pas de ligne). **Concorde Ombre** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Inquisiteur des Brumes** (`mist_inquisitor`) | 3 / 2 / 6 | Silence : avant son déplacement, désactive certaines capacités d’un ennemi de sa ligne pour la résolution en cours (au plus une fois tous les 3 tours). **Concorde Ombre** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

### Légions de la Forge — 10 unités

| Carte | Base (délai / ATQ / PV) | Description factuelle proposée |

|---|---:|---|

| **Marteau des Monts** (`smith`) | 1 / 3 / 6 | Corps à corps : attaque à 1 case devant lui, sur sa ligne. **Concorde Forge** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Golem runique** (`golem`) | 2 / 2 / 12 | Armure 2. Garde : intercepte les attaques visant la couronne. Riposte : 2 dégâts au contact, 1 fois/tour. **Concorde Forge** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Sapeur gobelin** (`bomb`) | 2 / 4 / 3 | Impact de zone : sa frappe sur une unité peut infliger 2 dégâts supplémentaires à un autre ennemi de la même ligne. **Concorde Forge** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Foreur de fer** (`drill`) | 0 / 2 / 5 | Armure 2 : réduit de 2 les dégâts bruts de chaque frappe, avec un minimum de 1 avant barrière. **Concorde Forge** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Colosse de braise** (`colossus`) | 4 / 6 / 13 | Armure 2 : résiste aux frappes. Ne possède ni Garde ni Riposte dans les règles actuelles. **Concorde Forge** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Ingénieure d’acier** (`engineer`) | 3 / 3 / 7 | Inspiration : tous les 3 tours, donne +1 ATQ au premier autre allié de sa ligne (cumul possible, ATQ plafonnée à 12). **Concorde Forge** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Canon des Terres Rouges** (`cannon`) | 3 / 5 / 7 | Distance : attaque jusqu’à 2 cases devant lui, sur sa ligne. **Concorde Forge** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Mécaniste des Hauts-Fours** (`mechanist`) | 2 / 2 / 8 | Inspiration : tous les 3 tours, donne +1 ATQ au premier autre allié de sa ligne (cumul possible, ATQ plafonnée à 12). **Concorde Forge** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Marchefer** (`ironwraith`) | 1 / 2 / 7 | Protection : à l’invocation, +3 bouclier à sa couronne (plafond 20). **Concorde Forge** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Alchimiste des Braises** (`alchemist`) | 2 / 3 / 5 | Poison : après une attaque, inflige 1 dégât par résolution pendant 2 résolutions à la cible touchée. **Concorde Forge** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

### Ordre de l’Éther — 11 unités

| Carte | Base (délai / ATQ / PV) | Description factuelle proposée |

|---|---:|---|

| **Feu follet** (`spark`) | 0 / 2 / 3 | Distance : attaque jusqu’à 2 cases devant lui, sur sa ligne (portée 3 seulement proposée, non active). **Concorde Éther** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Oracle des Astres** (`mystic`) | 2 / 3 / 4 | Distance : attaque jusqu’à 2 cases devant lui, uniquement sur sa ligne. **Concorde Éther** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Élémentaire azuré** (`elemental`) | 3 / 5 / 8 | Impact de zone : sa frappe sur une unité peut infliger 2 dégâts supplémentaires à un autre ennemi de la même ligne. **Concorde Éther** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Griffon du Zénith** (`griffin`) | 3 / 5 / 6 | Célérité : avance jusqu’à 2 cases/tour. Vol : franchit un allié si possible. Charge : +2 ATQ après déplacement. **Concorde Éther** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Sentinelle prismatique** (`sentinel`) | 2 / 2 / 9 | Armure 2. Garde : intercepte les attaques visant la couronne. Riposte : 2 dégâts au contact, 1 fois/tour. **Concorde Éther** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Dragon des Sept Cieux** (`dragon`) | 5 / 7 / 12 | Impact de zone : sa frappe sur une unité peut infliger 2 dégâts supplémentaires à un autre ennemi de sa ligne. Vol : franchit un allié si possible. **Concorde Éther** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Esprit de Tempête** (`tempest`) | 2 / 3 / 6 | Impact de zone : sa frappe sur une unité peut infliger 2 dégâts supplémentaires à un autre ennemi de la même ligne. **Concorde Éther** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Voyante des Étoiles** (`seer`) | 1 / 2 / 4 | Distance : attaque jusqu’à 2 cases devant elle, sur sa ligne. **Concorde Éther** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Chevalier du Zénith** (`aetherknight`) | 3 / 5 / 9 | Perforation : ignore l’armure. Charge : +2 ATQ s’il a avancé avant de frapper. **Concorde Éther** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Séraphin d’Azur** (`seraph`) | 4 / 5 / 10 | Soin : après les attaques, rend 2 PV à l’allié le plus blessé proportionnellement sur sa ligne. Vol : franchit un allié. **Concorde Éther** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

| **Marcheur des Portails** (`portal_walker`) | 2 / 3 / 5 | Portail : avant le déplacement, change de ligne à la même colonne libre si le moteur juge le gain suffisant (au plus une fois tous les 3 tours). **Concorde Éther** : +1 ATQ avec 2 alliés du même Ordre sur la ligne. |

## 5. Propositions de descriptifs — les 23 sorts et compétences

Les **sorts ne bénéficient pas de Concorde**. Leurs dégâts indiqués sont les valeurs brutes, avant armure/protection ; la fiche devrait préciser « première cible » ou « ligne » et les restrictions de classe, au lieu de laisser croire à une cible libre.

| Sort | Délai | Description factuelle proposée |

|---|---:|---|

| **Lame de feu** (`firebolt`) | 1 | Inflige 4 dégâts bruts à la première unité ennemie de la ligne choisie ; si elle est vide, inflige 2 dégâts à la couronne ennemie. |

| **Souffle vital** (`healing`) | 1 | Rend jusqu’à 5 PV à votre héros et jusqu’à 2 PV à chaque allié de la ligne choisie. |

| **Cri des anciens** (`warcry`) | 2 | Donne +2 ATQ aux alliés présents sur la ligne choisie. Effet cumulable pour le reste du combat. |

| **Orage runique** (`storm`) | 3 | Inflige 3 dégâts bruts à chaque unité ennemie de la ligne choisie. |

| **Prison de lierre** (`entangle`) | 2 | Immobilise le premier ennemi de la ligne : compteur d’immobilisation 2 (durée d’action à clarifier en jeu). |

| **Sanctuaire** (`sanctuary`) | 2 | Accorde +5 bouclier au héros, sans dépasser 15. |

| **Rayon des Couronnes** (`sundawn`) | 2 | Même effet que Lame de feu : 4 dégâts bruts à la première unité ennemie de la ligne, ou 2 à la couronne si aucun ennemi. |

| **Pacte vital** (`bloodpact`) | 2 | Même effet que Souffle vital : +5 PV au héros et +2 PV à chaque allié de la ligne. |

| **Éclairs d’Obsidienne** (`arcflare`) | 3 | Même effet qu’Orage runique : 3 dégâts bruts à tous les ennemis de la ligne. |

| **Racines du Monde** (`vines`) | 1 | Même effet que Prison de lierre : compteur d’immobilisation 2 sur le premier ennemi de la ligne. |

| **Mur des Serments** (`skill_guard_wall`) | 2 | Gardien : +2 barrière à chaque allié de la ligne (plafond individuel 4). Nécessite un allié. |

| **Ralliement royal** (`skill_guard_rally`) | 2 | Gardien : +1 ATQ aux alliés de la ligne pendant la résolution courante et la suivante ; sans cumul. Nécessite un allié. |

| **Gel astral** (`skill_arc_freeze`) | 2 | Arcaniste : 1 dégât brut au premier ennemi de la ligne, puis immobilisation (compteur 2) s’il survit. |

| **Arc des éclairs** (`skill_arc_chain`) | 3 | Arcaniste : 3 dégâts bruts au premier ennemi de la ligne et 2 au deuxième s’il existe. |

| **Flèche de rupture** (`skill_ranger_pierce`) | 2 | Rôdeur : 5 dégâts bruts au premier ennemi de la ligne, sans réduction d’armure. |

| **Préparation du pisteur** (`skill_ranger_draw`) | 3 | Rôdeur : pioche jusqu’à 2 cartes après utilisation (main limitée à 7), si le deck ou la défausse en contient. |

| **Lumière de concorde** (`skill_cleric_light`) | 2 | Clerc : rend jusqu’à 3 PV à chaque allié de la ligne ; exige au moins un allié blessé. |

| **Bénédiction du refuge** (`skill_cleric_bless`) | 3 | Clerc : donne +4 barrière (plafond 6) à l’allié de la ligne aux PV proportionnels les plus faibles. |

| **Sceau du Mutisme** (`seal_silence`) | 2 | Suspend pour 2 résolutions les capacités déclenchées de l’ennemi jugé le plus dangereux sur la ligne ; attaques et traits passifs conservés. |

| **Faille de Transposition** (`transposition`) | 2 | Déplace vers la ligne choisie l’allié éligible le plus avancé d’une autre ligne, dans la même colonne libre (pas juste devant la couronne adverse). |

| **Piège runique** (`rune_trap`) | 2 | Place automatiquement un piège visible sur une case libre centrale de la ligne. À l’entrée d’un ennemi : 3 dégâts bruts ; 3 résolutions max, 2 pièges par camp. |

| **Élan des Heures** (`hourglass_surge`) | 1 | Réduit de 2 tours l’attente de la carte alliée en main la plus lente (égalité : première à gauche). Nécessite une carte en attente. |

| **Nœud du Temps** (`time_bind`) | 2 | Ajoute 2 tours d’attente à la carte ennemie en main la plus proche d’être prête (égalité : première à gauche), sans la révéler ; maximum 6. |

## 6. Tableau de décision préalable aux changements du jeu

| Sujet | Option prudente | Variante à tester (modifie les règles) | Statut |

|---|---|---|---|

| Garde arrière | Garder la protection de ligne entière, **l'indiquer clairement** et montrer une interception spéciale. | Interception uniquement si le gardien se situe entre l'attaquant et sa couronne. | **À valider** |

| Impact de zone arrière | Garder l'onde sur toute la ligne et la rendre visuellement compréhensible. | Limiter la seconde cible à la proximité ou en avant de la première. | **À valider** |

| Portée Feu follet | Conserver 2 cases. | Tester 3 cases avec 2 ATQ / 3 PV et délai inchangé. | **À valider** |

| Délai minimum | Conserver 0/1 avec leur sens actuel. | Migrer les huit unités délai 0 à 1 sans changer leur disponibilité, adapter IA/deck et vérifier sauvegardes. | **À valider** |

| Concorde / faction | Conserver +1 ATQ à 2 alliés, sans équilibrage. | Fiche de chaque unité : règle expliquée ; emblème **de sa propre faction**, **en haut au centre de la carte**, visuellement activé par la Concorde ; remplacer le texte flottant. Concevoir les cinq emblèmes originaux en atelier et les faire valider avant intégration. | **À valider** |

| Sorts équivalents | Clarifier leurs textes et garder la mécanique. | Donner à chaque sort une identité distincte après analyse de coût/délai, IA et équilibrage. | **À valider** |

## 7. Matrice de contrôle pour une future PR de corrections

- **Moteur, toutes lignes :** 2, 3 et 4 lignes actuelles + ancien 3 × 5 ; camps allié/ennemi ; contact, Distance, Garde devant/derrière, Riposte, Charge, deuxième cible Impact de zone.

- **Équilibrage :** mesurer comparaison avant/après sur mêmes graines et profils ; analyse par deck et faction. Les simulations automatiques ne prouvent pas le ressenti humain.

- **Rendu :** vérifier que chaque animation relie l'attaquant au **vrai destinataire des PV perdus** ; impacts et PV corrects même pour dégâts absorbés, Gardes et deuxièmes cibles ; bureau, mobile simulé, réductions des mouvements. Pour Concorde, vérifier sur les cadres de toutes les factions l'emblème **en haut au centre**, sans chevauchement avec nom, coût, illustration ou rareté, et l'activation/désactivation au bon moment.

- **Descriptions :** comparer chaque texte à un test de moteur ; textes lisibles sur les cadres complets (53 unités + 23 sorts), fiche agrandie sur petit écran ; caractères échappés.

- **Sauvegardes :** conserver identifiants, progression, historique, combats 3 × 5, laboratoire isolé ; web et unique `JOUER.html` régénéré depuis les mêmes sources.

- **CI :** réutiliser les contrôles existants, puis `npm test`, `npm run test:parity` si les règles doivent rester identiques, `npm run build`, `npm run build:test`, tests navigateurs pertinents sur le commit exact.

## 8. Sources, vérifications et limites

Sources au commit ci-dessus : [catalogue et traits](../src/data.js), [ciblage, déplacements, dégâts et tours](../src/engine/battle.js), [sorts](../src/engine/spell-casting.js), [compétences de classe](../src/engine/class-skills.js), [contrôles, pièges et silence](../src/engine/battle-control.js), [tempo](../src/engine/tempo.js), [contrat de cibles des sorts](../src/engine/spell-targeting.js), [fiche d’inspection](../src/ui/card-inspection.js), [effets](../src/ui/combat-fx.js), [tests historiques de Garde](../tests/engine.test.mjs).

**Méthode :** lecture du code et des tests existants + concordance des **76 identifiants du catalogue** avec les **76 descriptifs proposés**. La CI du `main` vérifiée avant l'audit était verte au commit `2de25b7...` ([tests](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40011997013), [assemblage](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40011996924)). **Aucune nouvelle simulation ou vérification visuelle effectuée pour ce rapport** : les scénarios Garde/Impact arrière sont déduits du code et d'anciens tests, pas reproduits sur le téléphone du propriétaire.

**Suite :** propriétaire valide ou refuse les décisions du §6 ; ensuite seulement, créer une PR **de règles** distincte de la PR **de descriptions/interface**, avec tests adaptés. Aucune fusion automatique.

