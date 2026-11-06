# Éther — Élémentaire et Esprit de Tempête Divins

Les rangs et pouvoirs suivent le [tableau maître Notion](https://app.notion.com/p/4036633072a881fdbab8d6e122a43e3f), édition du 4 novembre 2026. Les deux cartes suivent l’[ascension Divine Éther existante](ETHER_PREMIERS_DIVINS.md).

| Version | ATQ | PV | Délai | Pouvoir ajouté |
| --- | ---: | ---: | ---: | --- |
| Élémentaire azuré Divin | 5 | 10 | 3 | Résonance perturbatrice |
| Esprit de Tempête Divin | 4 | 8 | 2 | Arc transversal |

La **Résonance perturbatrice** se pose si l’Impact retire au moins 1 PV à sa cible secondaire et qu’elle survit. Le prochain soin tenté sur cette unité blessée rend jusqu’à 2 PV de moins, avec un minimum de 0. Un soin entièrement annulé consomme le malus. Sans soin, la marque expire à la fin du tour suivant. Elle s’applique aux soins d’unité, sorts, pouvoirs et régénérations. Couronne, barrières et effets de survie suivent leurs propres règles.

L’**Arc transversal** exige le même Impact effectif. Il touche un seul autre ennemi, dans la colonne de la victime secondaire, sur une ligne voisine. La ligne du dessus a priorité. Les 2 dégâts bruts suivent les protections ordinaires. Un arc effectivement lancé consomme la cadence même s’il est absorbé. Les effets d’Impact ne se propagent pas depuis la troisième cible.

Les deux pouvoirs respectent une cadence de trois tours par invocation. Le Silence suspend leur activation et la Résonance déjà appliquée garde sa durée. Les dégâts et la sélection de la première cible secondaire suivent le contrat d’Impact existant.

## Obtention et contrôles

Chaque Divine demande trois Légendaires libres du personnage après l’ascension Éther. Le lot propose 36 versions Éther, dont 25 évolutions, et 196 recettes dans le jeu. Les trois autres Divines, les onze Éveillées et la décision sur le Feu follet natif restent des chantiers séparés.

`unit-healing.js` porte l’application, la durée, la validation et la consommation du malus sur les soins de créatures. `unit-triggers.js` reçoit la victime secondaire du moteur et appelle les dégâts existants pour l’arc. Le registre fournit les paramètres et la fiche lit le même état que le moteur. Les états sont facultatifs pour la reprise d’anciens combats. Web et autonome utilisent les mêmes sources et illustrations.

Les tests couvrent les deux camps et géométries, les exclusions d’Impact, le choix de ligne, la cadence, les protections, les soins et la validation des combats repris. Les parcours navigateur passent par les vraies fusions et invocations, puis vérifient les deux effets sur deux tours. La CI exacte et la publication se suivent depuis la PR.
