# Reprise des migrations de cartes — lot Sylve proposé le 1er novembre 2026

Source de conception : [tableau maître unique](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f),
édition relue `2026-10-27T06:13:46.581Z`. Les compteurs ci-dessous décrivent
les cases de conception complètes, pas leur livraison. Aucun tableau parallèle
de pouvoirs ni validation de nouvelles décisions.

GitHub reste la source du jeu. Base vérifiée : main
`e130b3009679927bcd57e6fc59a7ddacbe9c14d2` (PR 68 intégrée).
La branche `feat/ascensions-sylve` propose les 22 versions supérieures relues
le 1er novembre et leurs ascensions ; leur fusion/publication n'est pas acquise.
[Contrat et reprise](SYLVE_DIVINES_EVEILLEES.md). Les 41 évolutions Aube et les
26 Sylve antérieures restent conservées. La publication est suivie séparément
dans [ETAT_PROJET.md](ETAT_PROJET.md). Aucune écriture Notion.

| Ordre | Unités natives | Évolutions conçues complètement validées | Situation d'implémentation |
| --- | ---: | ---: | --- |
| Aube | 10 | 41 | 51 versions déjà au moteur ; toutes obtenables depuis PR 62 |
| Sylve | 11 | 48 | 26 évolutions intégrées ; 22 Divines/Éveillées proposées sur la branche, 59 versions au total |
| Ombre | 11 | 43 | Natifs seuls ; transcription et mécanique des évolutions à préparer |
| Forge | 10 | 0 sur 39 cases futures | Conception incomplète ; règles communes de Garde déjà validées, sans compléter les cases à leur place |
| Éther | 11 | 0 sur 39 cases futures | Conception incomplète ; même distinction pour les règles communes de Garde |

Les 53 unités natives et les 23 sorts demeurent au catalogue. Une carte affichée
ou un pouvoir validé ne crée ni exemplaire ni définition jouable. Les cellules
« À définir » restent ouvertes ; leur complétion exige une décision du propriétaire.

## Lot intégré : Sylve Rare/Épique

Les quinze versions de [la première tranche](SYLVE_RARE_EPIQUE.md) réutilisent
les pouvoirs natifs déjà vérifiés ; Luciole Épique remplace son bouclier d'arrivée
par 5, plafond 20. Six Rares et neuf Épiques par fusion, après missions 01/03.
Un paquet Sylve distinct réutilise le circuit d'achat, à 190 or et taux 60/35/5.
Pas de nouvelle épreuve, copie gratuite ou définition des rangs supérieurs.

## Lot intégré : les onze Légendaires Sylve

[Contrat](SYLVE_LEGENDAIRES.md) : tous les personnages Sylve atteignent Légendaire,
par fusion après mission 06. Leurs nouveaux états utilisent le moteur commun,
sans élargir les paquets Rare/Épique ni inventer des épreuves individuelles.

## Lot proposé : les 22 Divines/Éveillées Sylve

Le [contrat](SYLVE_DIVINES_EVEILLEES.md) décrit les pouvoirs transcrits,
les interactions et les deux ascensions communes, suivies de fusions de trois
copies du rang précédent. Aucun élargissement de paquet, don ou migration.
Les réglages des rencontres sont proposés à la revue, distincts des pouvoirs
validés dans Notion. Terminer les contrôles de la PR, relire le diff, obtenir
l'accord spécifique puis fusionner et vérifier la publication via le flux existant.

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
