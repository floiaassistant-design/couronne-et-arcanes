# Paquet d'évolution Aube — contrat et reprise, 28 octobre 2026

Branche `feat/paquet-evolution-aube`, depuis main
`feeef6e984e8895a77fa5b715dfbc15fd590ad2e`. Le propriétaire a autorisé
la fusion de PR 59 après vérification et la poursuite des paquets dans une nouvelle
PR. Aucun accord de fusion/publication de cette nouvelle proposition.

## Produits et probabilités proposés

Le paquet mystique conserve 3 cartes natives, 95 or et les poids historiques
65 % Commun, 28 % Rare, 7 % Épique, uniformes dans chaque groupe et sans cartes de
classe. Le nouveau paquet vise la progression de l'Aube et ses doublons ; aucune
évolution d'autre faction n'est programmée par cette étape.

**Paquet d'évolution de l'Aube : 190 or, 3 cartes**, après la première victoire
contre le Gardien du Bosquet (mission 03). Verrou fondé sur la mission terminée,
pas le niveau du héros ou un numéro de mission accessible.

| Groupe, pour chaque carte | Probabilité | Références possibles |
| --- | --- | --- |
| Base Aube Commune ou Rare | 60 % | 8 versions natives (4 Communes et 4 Rares) |
| Évolution Aube Rare | 35 % | Milicien, Porte-égide, Arbalétrière, Lancier |
| Évolution Aube Épique | 5 % | Ces quatre unités, Sœur, Porte-étendard, Capitaine, Prieur |

Choix uniforme dans le groupe tiré ; trois tirages indépendants, doublons possibles,
sans seuil garanti ni protection de chance. **5 % par carte** correspond à
`1 - 0,95³ = 14,2625 %` d'au moins une évolution Épique dans un paquet, et non
à 5 % par paquet. Les 60 % de base se partagent également entre les huit cartes.
Le prix et les poids sont des réglages proposés à la revue et à l'essai ; aucun
équilibrage humain final ou engagement de gain n'est revendiqué.

Les douze évolutions sont déjà autorisées par PR 59 ; les 29 autres restent au
laboratoire, et les rangs supérieurs/exclusifs attendent leurs propres circuits.
Les règles et statistiques Notion ne changent pas. Aucun tableau parallèle de
pouvoirs, nouvelle transcription ou écriture Notion dans cette proposition.

## Parcours et intégrité

Le comptoir de l'Atelier montre les deux paquets, prix, poids par carte et contenu
possible dépliable. Le nouveau produit demande confirmation du prix/tirages.
Le paquet mystique garde son bouton d'ouverture directe. La fiche partagée
annonce les sources de fusion, paquet et épreuve réellement disponibles.

- Tous les tirages et gains cumulés sont préparés avant le débit. Identifiant
  inconnu, fonds insuffisants/invalides, verrou boss, contenu indisponible,
  hasard invalide/exception et stock dépassant 100 000 : refus sans débit ni carte.
- Les doublons de même rang s'additionnent dans le stock exact ; un Milicien
  Commun, Rare et Épique n'écrasent jamais leurs quantités respectives.
- Les évolutions utilisent `evolvedCollection`, les cartes de base `collection`.
  Deck, maîtrise, entraînement, équipement, XP et épreuves restent inchangés.
  Les cartes gagnées sont ajoutables dans Mon deck et utilisables en combat ;
  les doublons libres peuvent être fusionnés par les recettes existantes.
- Le contrôleur achète sur une copie et la sauvegarde avant adoption. Une panne
  ne modifie pas le profil courant, ne montre pas de résultat acquis et ne
  dépense aucun or sauvegardé. La transaction complète tient dans le même profil.
- Après sauvegarde puis coupure/rechargement, or et cartes sont déjà dans la
  Collection ; l'ouverture et le résultat ne sont pas rejoués. Aucun reçu ou
  champ de sauvegarde supplémentaire. Une confirmation sans nouveau choix est
  ignorée ; annulation/navigation/reprise n'achètent rien.
- Combat actif ou résultat non récupéré : les ouvertures UI sont refusées.
  Le laboratoire ne peut pas acheter pour l'aventure. Les anciens profils et
  clés demeurent compatibles, sans migration ni copie offerte.

## Architecture

`card-packs.js` est l'unique saisie des prix, poids et listes de références.
Les évolutions y sont dérivées des versions livrées par fusion, pas d'un second
registre de chiffres. Le catalogue d'achat n'active aucune rareté : son contenu
est validé via les références/permissions du registre courant.

`engine/card-packs.js` porte preview et achat, sans DOM. `economy.js` le
réexporte pour conserver les imports historiques. `buyPack(profile,random)`
conserve son API et ses six appels aléatoires, dans le même ordre, pour trois
cartes natives ; seules les erreurs refusent désormais la transaction entière.

`ui/card-packs.js` rend comptoir, confirmation et résultat ; son contrôleur
sauve une copie puis l'adopte. `app.js` partage `commitProfile` avec la fusion,
sans règle d'achat dans le grand contrôleur. Les quatre couches sont séparées,
65 modules embarqués, aucun cycle ou dépendance externe, app 383/pages 270 lignes.

## Vérifications

**474 tests Node réussis** : contenu/pools exacts, comparaison des poids et
bornes historiques 65/28/7, six appels, répartition nouvelle sur 300 tirages
stratifiés, gains mixtes, fonds/verrous, hasard en échec, plafond cumulatif,
chaque évolution réellement tirée/invoquée/reprise, export/import et fusion,
confirmation, double clic et panne de sauvegarde. Les tests métier antérieurs
et les assertions sont conservés. **120 scénarios de référence identiques** ;
archive V2.4 inchangée. Builds autonome, diagnostic et web réussis : 65 modules,
76 illustrations, mêmes actifs graphiques.

Quatre parcours sur le jeu de production passés : bureau, portrait, paysage,
HTTP. Verrou boss, prix/taux affichés, annulation et rechargement, panne de
stockage, double clic, stocks exacts Commun/Rare/Épique, fusion des gains,
paquet mystique, Collection/deck, export/import, vraie invocation et reprise.
Captures du comptoir et de la confirmation examinées sur les trois formats.

Ces quatre parcours sont répartis une seule fois entre les parties existantes
`desktop`, `portrait`, `landscape`, `web-recovery` ; l'union correspond au parcours
complet. Test de partition indépendant dans `ci_pipeline_test.py`, sans dépendance
Playwright pour les tests Node. Aucun nouveau job ou appel de modèle.
Les 27 suites et les contrôles moteur restent obligatoires. Résultats finaux
locaux et CI du commit exact sont consignés dans la PR.

## Export et provenance

L'export officiel reconstruit compte **34 538 813 octets**, blob
`24472e7b46c391430da5089dd0d8ed473217edc4`, identique en local et sur GitHub.
Le [générateur ponctuel](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/40714123131)
a réussi sur `020e4bdfcc565be1149417438e1024f6968b00ca` et enregistré le
fichier dans `7c7d4166620a088c43182e6e566931916c7748a3`. L'arbre source
`c450689ae9969e0069658856054abe418a9145d0` a été comparé au local avant envoi.
Le générateur est retiré avant ouverture de la PR. Les captures des paquets
réutilisent le préfixe `ca-evolution-packs-*` déjà collecté en cas d'échec/revue,
sans modifier les workflows, rétention ou quotas de stockage.

## Reprise et limites

Vérifier main, tête/arbre et export exacts, achever les régressions pertinentes,
pousser la branche et sa PR. Aucun contrôle déjà en cours relancé ; si seule la
CI reste après la revue, terminer sans surveillance active. Fusion sur nouvel
accord spécifique, puis diffusion Sites via le flux existant et un main vérifié.

Prix/poids à apprécier en jouant ; aucun appareil physique/Safari/Firefox,
équilibrage humain exhaustif ou nouvelle publication revendiqué. La suite portera
sur les autres évolutions de factions puis les épreuves exceptionnelles, selon
les priorités du propriétaire.
