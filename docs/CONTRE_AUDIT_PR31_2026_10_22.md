# Contre-audit indépendant de la PR nº 31 — 22 octobre 2026

Référence : main `dd2aa52bf9eb1373073faa2bcb1fb72a4d04a580`.
Diff initial examiné intégralement : tête `f6249f71a83ed3eba33b3cb35c5947882754c22c`, onze fichiers.

## Évaluation

Les 149 suppressions initiales concernent bien des liaisons sans référence : 30 dans app.js, 45 dans views.js, 31 dans pages.js et 43 dans battle-view.js. Vérification indépendante avec résolution des portées JavaScript ; les corps des quatre modules sont identiques après retrait des imports et espaces vides. Les huit instructions entièrement supprimées ne portent pas d'initialisation nécessaire ; leurs modules restent atteignables ailleurs. Le moteur, l'IA, les données, les images et le stockage sont inchangés.

Le générateur expose les cinq diagnostics depuis engine.js uniquement sous --test. Le module moteur figure déjà dans les dépendances de app.js : aucune dépendance cachée absente du bundle. Les deux exports de production régénérés avant correction correspondent exactement aux blobs GitHub. Le correctif du parcours browser_art_reset attend réellement la manche sauvegardée après la phase adverse, sans affaiblir les assertions suivantes.

Un oubli réel : l'import aiStyle dans pages.js n'était pas utilisé. Le garde lexical confondait m.aiStyle avec une référence à cette liaison. Retrait de cet import supplémentaire (150 au total), exclusion des propriétés pointées dans ce garde et test de régression. Le garde reste lexical : ce n'est pas un analyseur complet JavaScript. L'analyse de portée indépendante n'a trouvé aucun autre import inutilisé sous src/.

## Vérifications relancées

- Main exact : 289 tests et 60 parités réussis.
- PR initiale exacte : 291 tests, 60 parités et les quatre builds réussis ; browser_art_reset et browser_card_study réussis sur bureau/portrait/paysage, vraie pose, tour, reprise et export hors réseau.
- Correctif : 292 tests et 60 parités réussis ; quatre exports régénérés. Les parcours graphiques, de cartes et d'intégrité de sauvegarde sont relancés séparément sur cette version.
- La CI initiale f6249f7 était réussie. Le workflow GitHub du commit de régénération f4e87c7 indique action_required, sans job ; ce statut n'est pas une réussite. Vérifier le nouveau head et sa CI avant toute décision de fusion.

Les travaux CSS et sous-rendus complémentaires ont une branche et une PR distinctes. Aucun changement de règles ni fusion autorisée. Les anciens résultats et cet audit ne remplacent pas le contrôle du head au moment de la fusion.
