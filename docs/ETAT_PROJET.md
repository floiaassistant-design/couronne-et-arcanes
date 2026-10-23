# État courant — 23 octobre 2026

## Intégré sur GitHub

Base vérifiée au début de la mission : main
`56d786d4e4ae160e731460f2ba7860f5ca6fe2e5`, arbre
`ddf7ae16828b5142bda9ae1d9e0c384336e254ca`.
Les PR 35–39 sont fusionnées : Guide modulaire, lecture séquentielle du combat,
laboratoire, onze Éther + 23 sorts, préparation de publication Sites.
La CI de cette base est réussie. Aucune PR n’était ouverte au démarrage.

Un jeu web et un seul JOUER.html hors ligne, cartes sur le plateau et
76 illustrations. Tours alternés sur les nouvelles batailles ; compatibilité
historique 3×5, profils et clés de stockage conservés.

## Proposition actuelle — ciblage direct et effets

Branche `feat/ciblage-effets-combat-20261023`, depuis la base ci-dessus.
Clic direct sur les cibles légales, aperçu issu du moteur sur copie,
confirmation/annulation, zones affectées et soutien. Aucun changement des
priorités automatiques des sorts ni de leur exécution immédiate.
Contact, tirs et magie par ordre, soins, barrières, états actifs et disparition
étendent le lecteur séquentiel existant. Le laboratoire reste isolé de l’aventure.

Les responsabilités sont séparées entre ciblage/résolution moteur,
contrôleur/rendu d’aperçu, séquenceur et bibliothèque d’effets. Aucune dépendance
ajoutée au jeu ; aucun asset ni statistique/IA/progression modifié.
[Contrat, tests et limites](CIBLAGE_EFFETS_COMBAT_2026_10_23.md).

Les premiers contrôles locaux passent : 323 tests, 60 parités, les 23 sorts
sur trois formats, effets, laboratoire et plusieurs parcours de sauvegarde.
La revue finale, l’export et la CI de cette proposition restent en cours au
checkpoint. Ne pas annoncer cette branche comme intégrée ou publiée.

## Publication

Hébergement choisi : Sites, identifié dans `.openai/hosting.json`.
[Jeu public](https://couronnes-arcanes-jeu.flo-ia-assistant.chatgpt.site).
Le statut publié doit être confirmé dans le déploiement terminal ; les résultats
de la mission de ciblage ne modifient pas la publication actuelle.
L’automatisation de publication existante est réservée aux fusions sur main.
Aucune publication concurrente créée par cette mission.

## Reprise

1. Lire AGENTS, README, le présent état et le contrat de ciblage.
2. Vérifier le main, la branche, les PR et les derniers résultats réels.
3. Terminer les contrôles annoncés en cours, relire le diff et l’export généré.
4. Obtenir l’accord explicite pour cette PR avant toute fusion.

Les anciens rapports datés dans docs décrivent leurs propres jalons :
[effets initiaux](EFFETS_COMBAT_2026_10_23.md),
[laboratoire](LABORATOIRE_2026_10_23.md),
[import Éther/sorts](ETHER_SORTS_INTEGRATION_2026_10_23.md),
[export unique](EXPORT_UNIQUE_2026_10_22.md).
Leurs anciennes mentions « proposé / pas fusionné » sont historiques.
