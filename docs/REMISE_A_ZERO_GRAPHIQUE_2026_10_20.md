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

## Intégration et sources officielles

La présentation de la PR nº 20, tête `30379a08`, a été fusionnée sur main à
`33b83906`, puis la remise à zéro de la PR nº 22 à
`50b32e4ad5c41da8c99f190d4ca300ce9fec988a`, sur accord humain spécifique.
L'atelier est remis à zéro par sa PR nº 18 à `e5986465`. La PR nº 21 (rapport)
avait déjà été intégrée. Vérifier le dernier main avant toute nouvelle mission.

GitHub est l'unique source officielle du code, des documents et des nouvelles
images ; aucune ancienne archive externe n'est une source de reprise.
La nº 20 porte la pose en 1/2/3 et son miroir adverse. La nº 22 ne change aucun
module de règles, IA, catalogue ou stockage par rapport à cette base.

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

Les PR jeu nº 11, 17, 18 et 19 sont fermées sans fusion comme historiques,
ainsi que les treize anciennes PR art. Leurs branches et commits sont conservés.
Les PR nº 20 et nº 22 sont intégrées ; les anciennes PR graphiques ne sont plus
des lots à fusionner ou à réimporter.

## Vérification et livraison

Reconstruire JOUER.html, ESSAI_CARTES.html et les HTML réservés aux tests.
Exécuter les tests, les 60 parités historiques et les parcours navigateur
bureau/mobile, sauvegarde/reprise, mode cartes/personnages, mouvement réduit et
hors réseau. Les tests d'anciens portraits sont remplacés par des contrôles de
retrait effectif et de validité des emplacements ; les assertions du moteur et la
référence de parité restent conservées.

Les contrôles du jalon fusionné sont consignés dans [l’état du projet](ETAT_PROJET.md).
Chaque future PR demande son propre accord spécifique avant fusion.
