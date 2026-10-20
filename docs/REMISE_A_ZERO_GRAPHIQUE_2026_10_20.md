# Nouvelle base graphique — 20 octobre 2026

## Décision du propriétaire

« on garde plateau présentation des carte est tous mais toute les images
animations anciennes planche etc on vire tous on repart sur de bonne basse »

Le plateau, les cadres, la main, les fiches et les interactions de la proposition
cartes sont conservés. Toutes les anciennes illustrations de personnages et
animations de combat sont retirées de la production active, y compris les
anciens portraits artistiquement approuvés. Ces accords restent des faits
historiques et n'autorisent aucun réemploi dans la nouvelle série.

Le décor peint du plateau est conservé : il fait partie du plateau explicitement
retenu. L'ancien décor calibré de remplacement n'est plus chargé.

## Branche et dépendance

Cette évolution est empilée sur la PR nº 20, tête exacte
`30379a08b5493b1d219703f6f1fa8258afc8e5c9`, pour conserver la présentation des
cartes déjà développée. Le main vérifié après fusion autorisée de la PR nº 21 est
`f505a8b607b2aa08ce55567063635fcd2ebc9660`.

La PR nº 20 contient déjà la pose en 1/2/3 et son miroir adverse. Cette remise à
zéro ne change aucun module de règles, aucune IA, aucun catalogue de cartes ni
aucune sauvegarde par rapport à cette base. Elle ne fusionne pas la nº 20.

## Retraits et conservation

- Retrait des 18 WebP de personnages de cette base, des reçus de lots utilisés
  par son ancien mapping et des associations d'illustrations.
- Remplacement des huit silhouettes pixel par un repère SVG géométrique neutre.
- Retrait du lecteur d'anciens effets de combat et de ses animations CSS.
  L'API appelle immédiatement la fin de lecture ; les événements restent
  calculés par le moteur et exclus du stockage comme auparavant.
- Retrait du décor calibré de 53 314 octets et de son chargement.
- Conservation du décor peint et de ses coordonnées, de la géométrie, des
  statistiques visibles, de l'aperçu au survol et de la pose.
- Conservation des gestes d'interface des compteurs et du réglage de mouvement
  réduit ; aucun personnage animé ancien n'est réutilisé.
- Conservation des versions précédentes dans l'historique Git, sans réécriture
  ni purge d'historique. Aucun dossier d'anciens dessins n'est réinjecté.

Le cadre Milicien et les anciennes planches ne sont plus des modèles d'image à
reprendre automatiquement. La présentation HTML/CSS existante sert de contrat de
placement ; une nouvelle illustration pilote sera proposée puis validée.

## Catalogue de la nouvelle production

`assets/artwork.json` est le registre actif, initialement vide.
`src/visuals.js` ne possède aucune clé d'image approuvée et retourne un
emplacement neutre pour tout ancien nom ou identifiant inconnu.

Le builder refuse un WebP non catalogué et une entrée sans statut approuvé,
provenance, reçu de version et empreinte concordante. Chaque nouvel ajout demande
une adaptation explicite du mapping, une vraie source et une validation humaine.
Un emplacement SVG n'est pas une illustration finale approuvée.

## Anciennes PR

Les PR jeu nº 11, 17, 18 et 19 concernent les anciens visuels. Elles ne doivent
plus être intégrées telles quelles. La nº 20 reste la dépendance de présentation.
Les PR graphiques antérieures ne constituent plus un lot à fusionner. Leur
clôture et les suppressions sur main sont distinctes de cette proposition.

## Vérification et livraison

Reconstruire JOUER.html, ESSAI_CARTES.html et les HTML réservés aux tests.
Exécuter les tests, les 60 parités historiques et les parcours navigateur
bureau/mobile, sauvegarde/reprise, mode cartes/personnages, mouvement réduit et
hors réseau. Les tests d'anciens portraits sont remplacés par des contrôles de
retrait effectif et de validité des emplacements ; les assertions du moteur et la
référence de parité restent conservées.

La nouvelle PR de nettoyage attend un accord spécifique avant fusion.
