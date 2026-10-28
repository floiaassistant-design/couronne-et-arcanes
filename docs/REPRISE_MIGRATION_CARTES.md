# Reprise des migrations de cartes — 28 octobre 2026

Source de conception : [tableau maître unique](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f),
édition relue `2026-10-27T06:13:46.581Z`. Les compteurs ci-dessous décrivent
les cases de conception complètes, pas leur livraison. Aucun tableau parallèle
de pouvoirs ni validation de nouvelles décisions.

GitHub reste la source du jeu : main `63ff7463b89d4f2ff410063a47ba2473087884bc`
intègre les 21 premières évolutions Aube. La branche `feat/ascensions-aube`
propose les vingt dernières et deux défis communs ; ses tests/PR et son statut
de fusion doivent être relus avant de reprendre. La publication est distincte.

| Ordre | Unités natives | Évolutions conçues complètement validées | Situation d'implémentation |
| --- | ---: | ---: | --- |
| Aube | 10 | 41 | 51 versions déjà au moteur ; toutes obtenables dans la proposition d'ascensions |
| Sylve | 11 | 48 | Natifs seuls ; transcription et mécanique des évolutions à préparer |
| Ombre | 11 | 43 | Natifs seuls ; transcription et mécanique des évolutions à préparer |
| Forge | 10 | 0 sur 39 cases futures | Conception incomplète ; règles communes de Garde déjà validées, sans compléter les cases à leur place |
| Éther | 11 | 0 sur 39 cases futures | Conception incomplète ; même distinction pour les règles communes de Garde |

Les 53 unités natives et les 23 sorts demeurent au catalogue. Une carte affichée
ou un pouvoir validé ne crée ni exemplaire ni définition jouable. Les cellules
« À définir » restent ouvertes ; leur complétion exige une décision du propriétaire.

## Prochain lot : Sylve

1. Relire les 48 cases complètes et leurs sources avant transcription, garder
   les onze ID natifs et les six emplacements par personnage. Décrire les totaux
   hérités et remplacements de capacités dans les données, sans réécrire le natif.
2. Réutiliser géométrie, Charge, Garde, Riposte, Vol, soin et pièges du moteur.
   Identifier chaque capacité nouvelle avant d'autoriser une version : notamment
   les entraves, soutiens, états et fréquences validés. Pas d'activation globale
   pour contourner une mécanique absente.
3. Vérifier chaque rang aux deux camps, les bonus séparés et les quotas à la
   reprise. Laboratoire, IA et lecteur de fiche utilisent les mêmes règles.
4. Ouvrir les circuits ordinaires paquets/fusion seulement pour les versions
   réellement implémentées, puis proposer les défis exceptionnels communs.
   Conserver l'économie et annoncer prix/taux/récompenses avant achat ou essai.
5. Branche et PR propres, tests de contrat et combats complets, export autonome
   identique aux sources, contrôles navigateur et sauvegardes. Accord de fusion
   spécifique, puis publication par le flux existant.

## Lot suivant : Ombre

Même méthode pour les 43 évolutions validées. Vérifier particulièrement les
réactions aux morts, créations, vols/régénérations et interactions d'états qui
seront effectivement présentes dans les cases relues. Chaque effet doit utiliser
les primitives communes ; aucune seconde simulation ou variante historique.
Les choix validés de Riposte et Garde restent ceux déjà appliqués aux natifs.

## Conditions de reprise

- Lire main, les branches/PR et `ETAT_PROJET.md`, rapprocher les choix de la
  dernière édition Notion. Les anciens bilans sont historiques.
- Ne pas empiler silencieusement les propositions : intégrer les dépendances
  après accord ou expliciter la base d'une PR dépendante. Ne jamais forcer main.
- Aucun graphique importé automatiquement ; les images existantes et leurs
  reçus restent la référence de livraison. Les valeurs viennent du registre.
- Avant d'annoncer un lot terminé : obtention réelle, stocks/deck/combats,
  pouvoirs, quotas, import/export/reprise, perte de stockage et hors réseau.
- Ne pas transformer une demande de poursuivre en autorisation de fusion,
  ni un succès de CI en preuve de publication. Ne pas attendre activement
  GitHub lorsqu'il ne reste plus de travail indépendant.
