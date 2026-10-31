# État courant — vérifié le 31 octobre 2026

## Main intégré

[`432b27c82fa05241022b9e3e3f5e7b2ba4cc651f`](https://github.com/floiaassistant-design/couronne-et-arcanes/commit/432b27c82fa05241022b9e3e3f5e7b2ba4cc651f)
intègre la [PR 66](https://github.com/floiaassistant-design/couronne-et-arcanes/pull/66),
fusionnée sur accord explicite. Son arbre `31de8519e8aa898d32697e9ba6dad45ee6c7e0d4`
est identique à la tête approuvée `f252590954251163e38ce8db7c67105e838cd576`.
[Tests main](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/41223595865)
et [assemblage main](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/41223595814)
réussis. Aucun autre travail ouvert au départ de cette mission.

Les sauvegardes protégées de la PR 65 sont intégrées. Aube complète à
l'obtention (41 évolutions), Sylve jusqu'à Légendaire (26) ; 22 Divines/Éveillées
Sylve restent à implémenter. Ombre, Forge et Éther restent natifs dans le jeu.
Même moteur/registre pour web, export et laboratoire isolé de la progression ;
six raretés de Collection et deck manuel. [Reprise des cartes](REPRISE_MIGRATION_CARTES.md).
Les consignes permanentes et bilans historiques sont désormais séparés.

Protection main vérifiée : ruleset actif, PR obligatoire, branche à jour,
`validation` et `assemblage-web`, aucun acteur de contournement. L'accord
spécifique du propriétaire reste obligatoire pour chaque nouvelle PR.

## Publication

Le jeu public reste en **Sites nº 18**, code `117a643bf110995f3bc67dc86c55a678cc8b0f76`,
source de diffusion `760fcd4d9ae032123e9fca43b6ba028582d65f8c`, audience publique.
L'automatisation existante a terminé le traitement de la PR 66 : arbre du
nouveau main, CI, artefact, provenance et empreintes vérifiés, mais contenu web
identique. **Aucune nouvelle version Sites nécessaire ni créée** pour ces textes.
Aucune publication parallèle lancée. La correction proposée ci-dessous n'est pas publiée.

[Jeu public](https://couronnes-arcanes-jeu.flo-ia-assistant.chatgpt.site) ·
[Export du main intégré](https://github.com/floiaassistant-design/couronne-et-arcanes/raw/432b27c82fa05241022b9e3e3f5e7b2ba4cc651f/JOUER.html).

## Proposition — résultats en attente et audit campagne / IA

Branche `fix/resultats-combat-non-enregistres`, depuis le main ci-dessus.
Défaut reproduit : après refus d'enregistrement du gain en campagne, un nouveau
combat peut écraser la victoire en attente. Le verrou des épreuves est étendu
à tous les modes, import compris, sans seconde transaction ni changement métier.
Navigation, export et contrôles visuels restent disponibles. Pas de carte,
équilibrage, IA, format de sauvegarde, image ou workflow permanent modifié.

Le robot partagé accepte les tours alternés sur option explicite, avec son
mode historique conservé par défaut. Deux nouveaux tests couvrent 96 rencontres
isolées × deux exécutions, quatre classes, instantanés et décisions publiques.
Neuf parcours de transaction sont ajoutés à la suite navigateur de sauvegardes
existante, sans nouvelle commande dans la matrice.

Contrôles locaux : 523 tests Node, parité 120 et builds autonome/diagnostic/web
réussis ; défaut et correction observés en navigateur cloud sur la campagne.
Simulations de contrôle/arène réussies (20 480 / 6 144 combats) ; 192 comparaisons
du robot historique identiques. Le passage ponctuel GitHub a réussi les neuf
nouveaux parcours ; les dernières assertions export/lecture et la CI complète
du SHA final restent à vérifier dans la PR.
Le runtime local n'a pas Playwright Python ; les contrôles navigateur automatiques
sont exécutés sur GitHub, sans succès final anticipé. [Détail et limites](AUDIT_CAMPAGNE_IA_2026_10_31.md).

Cette proposition attend son propre accord avant fusion. Dernier SHA et résultats
CI sont consignés dans sa PR. Export généré vérifié : 34 559 913 octets, blob
`f8212fa1379a6ad6e50ce4cefe31f28440ad52da`, empreinte dans le rapport.
Le générateur ponctuel est retiré du diff livré.

Suite : compléter la campagne UI depuis zéro avec achats/decks réels, puis
mesurer la lisibilité mobile. Les simulations ne prouvent pas l'équilibrage humain.
Le prochain lot créatif de cartes reste distinct : Divines/Éveillées Sylve après
relecture Notion des validations et mécaniques à implémenter.

## Historique

[Anciens points de reprise](HISTORIQUE_ETAT_2026_10_31.md) ·
[Anciennes consignes et bilans](HISTORIQUE_CONSIGNES_2026_10_31.md).
Les contrats datés conservent leurs constats ; GitHub et cet état courant
priment pour la livraison. Règles permanentes : [AGENTS.md](../AGENTS.md).
