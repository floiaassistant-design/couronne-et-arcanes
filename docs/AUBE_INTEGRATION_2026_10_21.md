# Aube et sceaux de camp — proposition du 21 octobre 2026

La demande d’ajouter les autres cartes de l’Aube complète le Milicien v02 par
neuf cartes v01 : Porte-égide, Arbalétrière, Lancier des Remparts, Sœur de l’Aurore,
Porte-étendard, Capitaine de l’Aube, Paladin solaire, Prieur solaire et Ange du Bastion.

## Source et périmètre

- Jeu : branche `feat/aube-cartes-sceaux-20261021`, suite de la PR nº 25 encore
  ouverte, head `0d2a4d0a21ecd600ada553c1aeca62c52753d930`. Main vérifié à
  `0896c16e30cff37464b5eb355b3d2b37a2c5651a`. PR séparée ciblant la branche
  Milicien pour isoler cette évolution. Aucune fusion ni auto-merge.
- Atelier : PR nº 22 encore ouverte, commit immuable
  `96190c837f79e645777967aaf84decbea0ad33a5`. Les neuf exports WebP 768×1152 sont
  repris exactement, sans recadrage ni retouche. Chaque SHA Git, SHA-256,
  dimension et poids concorde avec les métadonnées officielles de ce commit.
- Le reçu `approvals/aube-neuf-cartes-v01.json` consigne la demande humaine
  postérieure et les neuf versions exactes. Le manifeste atelier reste en review ;
  il n’est pas présenté comme une validation ni une fusion déjà réalisée.
- `CARD_TEMPLATES` associe chaque ID à son propre fichier. Même lecteur de
  carte complète et mêmes cinq zones normalisées que le pilote ; descriptions
  à 4 cqw pour contenir aussi les textes longs. Aucun personnage d’un autre
  ordre, ancien portrait ou animation réactivés.

Les vraies données du catalogue, les bonus et la vie actuelle remplissent les
cadres en Collection, main, fiches et plateau. Les cinq autres rangs par personnage
restent des projections « À concevoir », sans stats inventées ni possession.
Les dix images sont embarquées dans JOUER et ESSAI_CARTES, environ 5,69 Mo chacun.

## Repères sur le plateau

Le trait bleu/rouge au bas des cartes est retiré. Un sceau en coin indique le
camp : écu à chevron pour vous, losange croisé pour l’adversaire. La forme et le
motif s’ajoutent à la teinte, pour ne pas dépendre de la couleur seule. Légende
adaptée, nom accessible avec camp et PV actuels/maximum. Les vraies valeurs
restent sur la carte ; la fiche détaillée conserve la vie actuelle/maximum.

`campSeal` est un rendu SVG pur dans `ui/card-arena.js`, partagé avec la légende
de `battle-view.js`. Les bornes de pose, cases et règles ne changent pas. Les
28 modules existants suffisent ; aucune dépendance moteur vers l’interface,
aucun nouveau champ ni changement de clé de sauvegarde.

## Vérification locale exécutée

- 285 tests Node réussis ; 60 scénarios de parité identiques.
- Quatre builds : JOUER, ESSAI_CARTES et leurs diagnostics. Diagnostics exclus
  de la distribution. Contrôle du diff et des sources/mappings/reçus.
- `browser_aube.py` : les dix exports exacts, 60 cartes de Collection, champs
  contenus et descriptions longues, vraies poses, blessure, PV, deux sceaux,
  lecture du camp adverse et reprise ; bureau 1440×1000, portrait 390×844 et
  paysage 844×390, sans requête réseau et en mouvement réduit.
- Parcours Milicien, Collection, aperçus, essai cartes, déploiement, remise à
  zéro graphique, arène classique 2/3/4 lignes et ancien 3×5, plein écran,
  sauvegarde après coupure, nouvelle aventure, contrôles et compétences de classe.
- Captures examinées : neuf sources réunies, Collection et sceaux sur les
  trois formats. Nouveaux contrôles Aube et captures ajoutés au workflow.

La CI distante doit être lue sur le head exact de la PR avant d’annoncer son
résultat. Aucun téléphone physique ni nouvel équilibrage humain revendiqués.
L’ancien script hors workflow `browser_decks_v26.py` conserve ses hypothèses
historiques de géométrie ; il n’est pas utilisé pour masquer les contrôles actuels.
