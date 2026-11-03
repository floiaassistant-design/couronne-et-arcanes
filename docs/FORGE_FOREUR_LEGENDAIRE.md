# Foreur Légendaire — proposition du 3 novembre 2026

## Décision et périmètre

Source : [tableau maître Notion](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f), édition relue du 2 novembre 2026 à 16:09:01 UTC. Cette tranche suit les cinq Légendaires de statistiques et le Marchefer de la PR 79, intégrés à main `5a70b0c135c938f2417d0d499ea6ab821266dab5` ; elle ne les livre pas une seconde fois.

Le Foreur (`drill`) conserve **3 ATQ / 7 PV / délai 1, Armure 2, portée et déplacement 1**. **Foreuse d'acier** : avant les dégâts de son attaque normale contre une unité ennemie portant une barrière personnelle, retire **jusqu'à 2 points de cette barrière**, puis applique l'attaque normale avec l'armure et la barrière restantes. Au plus **une activation tous les 3 tours**, uniquement en présence d'une barrière éligible.

Le retrait de barrière ne crée aucun dégât aux PV et ne vise jamais le bouclier de couronne. Une attaque nulle, une cible morte, l'absence de barrière ou Silence n'utilisent pas la cadence. Le premier déclenchement peut avoir lieu au tour 1, puis au tour 4. Aucun effet par sort, poison, Riposte ou dégât secondaire. Les intentions simultanées déjà préparées gardent leur fonctionnement historique ; aucune nouvelle attaque n'est créée. Une attaque normale interceptée par un gardien utilise la barrière de ce gardien, sans changer la règle de Garde.

## Obtention, stockage et architecture

Fusion existante de **trois Épiques libres du deck après mission 06**, sans copie offerte ni épreuve nouvelle. 27 versions Forge et 149 recettes sont définies dans la branche, dont 17 évolutions Forge. Les paquets, probabilités, natifs et rangs Divin/Éveillé restent inchangés.

`cards/forge.js` porte les paramètres et `ability-text.js` les libellés communs. `unit-triggers.js` prépare la frappe via `absorbBarrier` : consommation des origines de barrière et instantanés conservés, aucun calcul de dégâts recopié. `battle.js` appelle cette préparation uniquement dans la frappe normale contre une unité. Les autres résolutions restent communes.

Le champ facultatif `barrierDrillReadyRound` est propre à l'invocation, validé comme entier positif borné et conservé à la reprise. Aucune clé de sauvegarde, migration, possession, niveau ou état d'animation ajouté. Silence reconnaît le nouveau pouvoir déclenché sans modifier les cibles natives. Aucun module de production ou actif graphique ajouté ; les mêmes modules entrent dans le web et l'export autonome.

## Vérifications et limites

`forge_foreur.test.mjs` couvre les 14 cas de données/fusion, retraits partiels, armure, cadence, Silence, attaque nulle, exclusions, gardien réel, origines de barrière, instantanés, deux camps/quatre niveaux du laboratoire, intentions simultanées, reprise/import, fiches et véritable moteur embarqué.

Le parcours navigateur `forge-drill` réutilise les quatre parties existantes : vraie fusion, stocks protégés, annulation, stockage refusé, double clic, Collection/deck, import/export et reprise. Son combat est **préparé** avec des unités/statistiques du registre et une barrière adverse de 5 via la primitive existante, pour garantir une cible éligible. La validation du tour dans l'interface doit réellement retirer la barrière avant la frappe, préserver les PV protégés et sauver la cadence. Aucun champ de résultat Foreuse n'est préattribué. Ce cas ne prouve pas l'apparition naturelle de cette barrière dans une campagne complète depuis zéro.

649 tests Node et 120 scénarios de parité réussissent localement, ainsi que les builds autonome et diagnostic. Les contrôles Chromium restent ceux de la CI du dernier commit ; aucun téléphone physique ni équilibrage humain revendiqué. Régénérer l'export avec le builder officiel et contrôler son identité avant livraison.

Le Golem et le Marteau Légendaires restent distincts : aucune réinterprétation du déclencheur Cœur runique ni activation de Coup de masse. La proposition Foreur exige sa revue et une autorisation spécifique avant fusion. Publication Sites séparée, par le suivi existant après intégration vérifiée à main.

## Export et reprise du 3 novembre

Le build officiel produit 34 593 927 octets, blob Git `8e2e44aab953d1660774c162477f8a42f3a686a3`, identique entre génération locale et GitHub. La préparation ponctuelle de ce blob est retirée du diff final ; aucun workflow permanent ajouté. Les builds web/diagnostic, cinq tests de pipeline et la syntaxe Python réussissent aussi localement. La CI de la tête finale, la revue et l’accord spécifique pour cette PR restent requis avant fusion.
