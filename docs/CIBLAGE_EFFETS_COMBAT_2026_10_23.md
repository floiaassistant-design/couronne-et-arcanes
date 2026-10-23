# Ciblage direct et bibliothèque des effets — 23 octobre 2026

Proposition sur `feat/ciblage-effets-combat-20261023`, base main vérifiée
`56d786d4e4ae160e731460f2ba7860f5ca6fe2e5` (arbre
`ddf7ae16828b5142bda9ae1d9e0c384336e254ca`). Aucune PR ouverte au départ.
La CI de cette base était réussie ; elle ne valide pas les nouvelles sources.

## Utilisation et règles conservées

Sélectionner un sort, cliquer directement une carte autorisée, lire l’aperçu,
puis **Lancer le sort**. Annuler, Échap ou sélectionner une autre carte ne
consomme rien. Les boutons de ligne servent aux lignes vides, pièges et
repositionnements ; les sorts automatiques proposent directement leur aperçu.
Les unités touchées sont indiquées ensemble pour les sorts de ligne/chaîne.

Le ciblage suit les restrictions du catalogue : premier ennemi, cible du silence,
allié le plus blessé, etc. Il ne permet pas de contourner ces priorités.
Les sorts sont toujours immédiats après confirmation ; seules les unités
attendent la validation du tour. Différer les sorts modifierait les règles.
Aucun changement de statistiques, coût, IA, récompense ou clé de sauvegarde.

## Responsabilités

- `engine/spell-targeting.js` : contrats de sélection, cibles et lignes ; réutilise
  les validateurs de contrôle, de classe et de tempo. Ordre du premier ennemi partagé.
- `engine/spell-casting.js` : extraction ciblée de la résolution existante des
  sorts ; primitives de dégâts injectées depuis le moteur, aucun DOM.
- `previewPlayerSpell` dans `engine/battle.js` : véritable résolution sur copie,
  retour public seulement. Aucun calcul de dégâts recopié dans l’interface.
- `ui/spell-controller.js` : cible/aperçu éphémères, revérification à confirmation.
- `ui/spell-targeting.js` : rendu pur de l’aperçu et des contrôles.
- `ui/combat-steps.js` : regroupe le résultat complet du sort avant les morts ;
  lit aussi attaque renforcée, immobilisation, silence, poison et ralliement.
- `ui/combat-effects.js` : bibliothèque DOM bornée et paramétrable ; contact,
  tir, magie et identité Aube/Sylve/Ombre/Forge/Éther. Pas de bibliothèque ajoutée.
- `ui/combat-fx.js` : séquenceur existant, verrou, vitesse ×2, passage et nettoyage.
- `ui/unit-status.js` : états actifs réels sur les cartes ; pas de durée inventée.
- `styles/battle/spell-targeting.css` et `effect-library.css` : styles reliés par
  index.html et embarqués par le même builder dans l’unique JOUER.html.

Le résultat réel est calculé/sauvegardé avant lecture. Les effets ne rappellent
jamais le moteur. Interruption, mouvement réduit, animations désactivées ou
indisponibles affichent directement le résultat et libèrent le verrou.
Aucune nouvelle image : les 76 cadres, le plateau et leurs reçus sont inchangés.

## Contrat visuel procédural

Ancrage au centre des cartes/couronnes visibles, sans nouveau sprite ; couche
fixe inerte au pointeur, éléments temporaires supprimés à chaque action.
Contact : avancée maximale 22 px et retour, frappe puis réaction de la cible.
Tir/magie : préparation 260 ms, trajet 420 ms, impact 280 ms, valeurs et soins
jusqu’à 700 ms ; durées divisées par deux en vitesse ×2. Quatre particules
au plus par cible. Les familles partagent les primitives, avec couleur, forme
et glyphe propres ; soin ascendant, barrière lumineuse, contrôle et disparition.
Les animations ne sont ni des assets artistiques importés ni une nouvelle règle.

## Vérifications et reprise

Résultats locaux : 324 tests Node et 60 parités identiques ; compilation
et diagnostic réussis. Les 23 sorts ont été lancés sur bureau/portrait/paysage
sans réseau ; aperçu, cadres, reprises et trois champs conservés. Le lecteur
existant a validé attaques, armure, morts, tirs, magie, soins partiels, poison,
×2, Passer, rechargement, mouvement réduit, animations désactivées et laboratoire.
Le nouveau parcours valide bureau, tactile portrait/paysage, ancien 3×5,
mouvement réduit, cibles interdites, annulation, changement de cible, aperçu sans
mutation, confirmation unique, zones, soins, protections, contrôles, reprise,
IA automatique et repli après erreur d’animation. Contrôles de classe, contrôle,
web modulaire, aperçu, déploiement et intégrité des sauvegardes ont réussi.
Examen visuel des captures bureau/portrait/paysage ; l’aperçu bas en paysage
préserve l’espace du plateau. Régression dédiée : téléportation sur piège mortel,
ordre déplacement → dégâts → disparition conservé. La CI complète de la PR
reste à constater sur le commit final ; ne pas la déduire de ces résultats. Chaque PR demande sa propre
autorisation avant fusion. Publication Sites après fusion uniquement.

Limites : Chromium, formats tactiles simulés ; pas de téléphone physique,
Safari/Firefox ou équilibrage humain exhaustif. Les futurs types de sort
nécessitent une entrée explicite dans le contrat de ciblage, pas de règle implicite.
