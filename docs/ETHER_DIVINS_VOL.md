# Éther — Griffon et Séraphin Divins

Les deux rangs reprennent le [tableau maître Notion](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f), édition du 4 novembre 2026. Ils s’appuient sur la première [ascension Divine Éther](ETHER_PREMIERS_DIVINS.md).

| Version | ATQ | PV | Délai | Pouvoir ajouté |
| --- | ---: | ---: | ---: | --- |
| Griffon du Zénith Divin | 5 | 8 | 3 | Sillage ascendant |
| Séraphin d’Azur Divin | 5 | 10 | 4 | Soin de passage |

Après un saut de Vol effectivement réalisé au-dessus d’un allié, le Griffon lui donne une case libre supplémentaire lors de son prochain déplacement normal. Un déplacement effectif consomme le bonus. Il expire à la fin du tour suivant de cet allié si celui-ci reste sur place. Le pas supplémentaire se fait dans la même ligne et suit les contrôles ordinaires de cible, d’occupation et d’entrée de case. Deux sillages ne s’additionnent pas. Vol, Célérité 2 et Charge +2 du Griffon sont conservés.

Après un saut de Vol au-dessus d’un allié blessé, le Séraphin lui rend immédiatement jusqu’à 2 PV. L’arrivée doit avoir lieu sur une case libre et valide. Un allié déjà à son maximum ne consomme pas le pouvoir. Le soin normal du Séraphin conserve son déclenchement après les attaques et sa priorité à l’allié le plus blessé proportionnellement.

Chaque effet a sa propre cadence par invocation, une fois tous les trois tours. Le saut normal reste possible sous Silence. Le Silence suspend les nouvelles activations, tandis qu’un Sillage déjà accordé garde sa durée. Les effets suivent le déplacement effectivement enregistré par le moteur, avant la résolution d’un éventuel piège de la case d’arrivée.

## Obtention et reprise

L’ascension Divine Éther existante ouvre les deux fusions supplémentaires. Chacune coûte trois exemplaires Légendaires libres du personnage correspondant. Le Griffon utilise ses Légendaires évolués. Le Séraphin utilise ses Légendaires natifs. Le lot porte Éther à 34 versions et 23 évolutions, et le jeu à 194 recettes. Les prochains rangs Éveillés et le reste des Divines demeurent des lots distincts.

Le moteur centralise les réactions au survol, la validation du Sillage et son expiration dans `unit-flight-support.js`. Le moteur de déplacement gère la case supplémentaire et le circuit d’entrée partagé. Le Sillage et la cadence sont facultatifs dans les combats sauvegardés. La fiche de plateau lit le même état que le moteur. Web, autonome et laboratoire partagent les sources et les illustrations existantes.

Le catalogue et le laboratoire vérifient les deux versions dans les deux camps. Les scénarios métier couvrent cadence, Silence, saut bloqué, expiration, consommation, soin plafonné et reprise. Le parcours navigateur suit les deux fusions, le Sillage, le soin et les deux tours de reprise dans les formats du lot Éther. Les contrôles de la tête exacte et le statut de publication sont suivis dans la PR.
