# Contrat de la nouvelle production graphique

La décision du 20 octobre 2026 retire les anciens portraits, animations et
planches de la production active. Voir
[la remise à zéro](REMISE_A_ZERO_GRAPHIQUE_2026_10_20.md).

## Conserver la structure

Le plateau peint, la géométrie, les cadres et les interactions de la PR nº 20
intégrée et de la remise à zéro nº 22 restent la référence technique. Les sources
et reçus sont versionnés dans les dépôts GitHub du jeu et de l’atelier. Le moteur fournit noms, attentes, descriptions,
statistiques et états. Ne pas peindre ces valeurs dans l'image.

## Importer un nouveau visuel

1. Préparer dans l'atelier une source originale et un export optimisé.
2. Obtenir une validation humaine spécifique sur la version exacte.
3. Conserver provenance, droits, version, dimensions, octets et SHA-256.
4. Déclarer la nouvelle clé dans `assets/artwork.json` et `src/visuals.js`.
5. Ajouter le reçu humain dans le dépôt du jeu ; le builder compare la version
   et l'empreinte. Aucun fichier inconnu n'est embarqué silencieusement.
6. Examiner toutes les cartes qui utilisent une association partagée.
7. Vérifier bureau/mobile, reprise, images manquantes et JOUER hors réseau.

L'état initial ne contient aucun visuel de personnage approuvé. Les emplacements
neutres permettent de jouer ; ils ne valent pas validation artistique.

Toute animation future demande un nouveau contrat (dimensions, ordre, durée,
boucles, ancrage, orientation et poids), un repli statique et le respect du
mouvement réduit. Elle suit les événements calculés et ne modifie pas le combat.

## Fonds d’interface — Collection, 21/10/2026

Le fond `collection_archives_v01` suit un circuit explicite séparé des portraits :
`assets/ui-artwork.json`, `UI_BACKGROUNDS`/`UI_ART_NAMES` de `src/visuals.js`,
reçu dans `docs/approvals/` et CSS autonome dans `assets/backgrounds/`.
`scripts/lib/ui-artwork.mjs` vérifie clé, statut, provenance épinglée au commit
art, droits, version du reçu, taille et empreinte du JPEG embarqué. Il refuse
un URL réseau ou une image altérée. Le builder embarque le CSS enregistré.

La source PNG, le prompt et l’export exact sont conservés dans la
[PR atelier nº 21](https://github.com/floiaassistant-design/couronne-et-arcanes-art/pull/21),
commit `c4f5e6871e32db3b646f51ba906c3ea00b7c6eb9`. L’accord sur la Collection
autorise ce fond précis et cette présentation. Il ne valide aucun portrait,
aucune animation ni aucune fusion. Lors de cet import du fond, le Milicien de la PR atelier nº 20 était
en création et en validation séparée ; son import ultérieur autorisé est décrit
ci-dessous. Les futurs portraits suivent toujours
le contrat WebP et leur mapping individuel ; aucun portrait par famille implicite.

## Carte complète Milicien v02 — import manuel autorisé le 21/10/2026

La demande « intégre le mélicien au jeux » autorise l’export exact de la v02
issue de la PR art nº 20 fusionnée. Reçu humain dans le jeu, source épinglée
à `e43c3a877f45bde9a6f99fb1fa1005abdc47bace`. Le statut review encore présent
dans ce snapshot atelier est historique par rapport à cette instruction ;
il ne vaut pas approbation automatique. Aucune autre image ni fusion autorisée.

Contrat adapté aux cadres peints complets : `kind: card` dans `assets/artwork.json`,
`assets/cards/`, mapping individuel `CARD_TEMPLATES` et liste `CARD_ART_NAMES`.
`scripts/lib/artwork.mjs` contrôle le reçu (clé, carte, version, SHA-256),
l’export WebP réel de ratio 2:3, les octets et le mapping. Il refuse les fichiers
inconnus comme les images modifiées. Le builder injecte `INLINE_CARDS`.

`ui/generated-card.js` rend des valeurs fournies par les vues dans cinq zones
normalisées. Ne pas redessiner les bordures ni recadrer cette image comme
un portrait. Noms et descriptions sont échappés ; stats et délai proviennent
du profil ou du combat via les fonctions existantes. Les futures raretés ne
créent ni carte ni possession. [Coordonnées et contrôles](MILICIEN_INTEGRATION_2026_10_21.md).
