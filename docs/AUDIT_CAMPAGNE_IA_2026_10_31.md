# Audit campagne / IA — 31 octobre 2026

Base vérifiée : main `432b27c82fa05241022b9e3e3f5e7b2ba4cc651f`,
PR 66 fusionnée sur accord ; arbre local complet identique au canon GitHub
`31de8519e8aa898d32697e9ba6dad45ee6c7e0d4`, tous les blobs contrôlés.
Branche : `fix/resultats-combat-non-enregistres`. Aucun autre travail ouvert au départ.

## Défaut reproduit et correction

Une victoire fictive de mission 01 est réglée avec un refus d'écriture du profil.
Le résultat terminal reste sauvegardé, mais le joueur revient à la campagne et
clique « Lancer le combat ». Sur main, le nouveau combat remplace ce résultat :
`status: victory`, `wins: 0` devient `status: active`, `wins: 0` ; le gain est perdu.
La protection du routeur et de l'import ne couvrait que `evolution-trial`.

Correction ciblée : retirer cette restriction de mode dans les deux contrôles
existants, garder la clôture et ses reçus, et laisser les commandes visuelles
disponibles. Après correction, le même clic conserve la victoire et ses données.
Une fois le stockage rétabli, il règle d'abord la récompense : 110 → 152 or,
50 → 62 éclats, une victoire et une copie du Loup gagnée ; aucun nouveau combat
créé par ce clic de récupération. La nouvelle action doit ensuite être refaite.
Défaites, Tour et donjons utilisent le même verrou ; leurs gains restent ceux
de leurs propres fonctions de règlement, sans nouvelle règle économique.

Reproduction avant/après observée dans le navigateur cloud, sur un diagnostic
généré et une page locale de QA. La page de QA, sa panne simulée et ses commandes
ne font partie ni du jeu, ni de l'export, ni de la PR. Aucun profil réel touché.

## Couverture ajoutée sans second moteur

Le robot partagé utilisait par défaut le mode de résolution historique, même
avec une géométrie récente. L'option explicite `turnFlow: 'alternating'` exerce
maintenant le chemin utilisé par l'interface : actions du joueur, poses adverses
une par une, puis résolution adverse. L'absence d'option conserve tous les outils
et leurs métriques historiques ; aucune IA ni règle du jeu n'est modifiée.

Le nouveau test Node couvre les 12 rencontres × 4 classes × 2 graines, puis
rejoue chaque rencontre à l'identique : **96 rencontres isolées, 192 exécutions**.
Il contrôle fin de combat, états sérialisables/reconnus à chaque fin de tour,
égalité exacte des traces, immutabilité du profil du robot et des recherches IA,
absence de lecture des main/pioche privées, options prêtes et positions valides.
Les tests existants couvrent déjà le quota de deux cartes et la reprise entre
deux poses adverses. Les nouveaux tests ne prétendent pas jouer douze missions
successives depuis une nouvelle aventure, acheter ou composer un deck humain.

Les neuf nouveaux parcours navigateur sont appelés par la suite de sauvegardes
déjà dans la matrice : victoire/défaite des trois modes au bureau, campagne en
portrait/paysage tactile, puis entrée modulaire HTTP. Ils contrôlent résultat et
profil exacts, nouveau départ, nouvelle partie, retrait du deck, import refusé,
récupération après panne, absence de double gain après rechargement et nouveau
combat possible ensuite. Fixtures terminales explicites : ce sont des tests de
transaction, pas des preuves de victoire jouée ni de difficulté de campagne.

## Contrôles et limites

- Sur le main avant correction : 521 tests Node réussis.
- Après correction : 523 tests Node et 120 scénarios de parité réussis ;
  archive V2.4 conservée, 96 rencontres alternées rejouées exactement.
- Builds autonome, diagnostic et web réussis depuis les mêmes sources ;
  nouvel export généré, aucune retouche manuelle. Vérifier son empreinte et le
  diff distant final dans la PR avant livraison.
- Navigateur cloud : défaut puis conservation et récupération observés sur le
  parcours campagne. La suite Python n'est pas disponible dans le runtime local ;
  les neuf nouveaux parcours et toutes les suites existantes restent à vérifier
  en CI sur le dernier SHA. Aucun succès de navigateur CI anticipé.
- Aucun changement de carte, IA, équilibrage, illustration, identifiant, clé,
  format historique ou formule de récompense. Aucun workflow permanent modifié.

Les 18 victoires du robot sur ces 96 rencontres de départ ne constituent ni
un taux de réussite humain ni un diagnostic d'équilibrage. Le robot ne fait pas
les achats, améliorations et adaptations de deck d'une vraie progression.
Une campagne UI complète, la mesure mobile détaillée, Safari/Firefox et un
téléphone physique restent à examiner. La lisibilité mobile n'est pas validée
par la seule existence de formats tactiles automatisés.

## Reprise

Terminer génération distante contrôlée de `JOUER.html`, retirer l'outil ponctuel,
relire le diff complet et les contrôles sur le SHA final, puis proposer la PR.
Pas de fusion ni publication sans accord spécifique sur cette nouvelle PR.
Le jeu public reste celui du main intégré ; la publication documentaire de
la PR 66 est suivie par l'automatisation existante, sans déploiement concurrent.
