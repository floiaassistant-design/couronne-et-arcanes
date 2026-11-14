# Héros adverses de l’arène peinte

Chaque mission de la campagne choisit le WebP dédié à son adversaire via
l’identifiant de rencontre déjà présent dans le combat, y compris à la reprise.
Les associations et les noms exacts des douze missions figurent dans le
[reçu d’import](approvals/heros-adverses-v01.json).

Dans la Tour, les étages 5, 10, 15 et 20 affichent chacun leur Gardien du
Sceau. Les autres étages, les donjons et le laboratoire gardent un socle
adverse libre. Le [registre des Gardiens](approvals/gardiens-tour-v01.json)
identifie les WebP exacts et leur provenance dans l’atelier. Leur proposition
artistique conserve le statut en revue dans le registre source.

Les exports transparents de 152 × 183 px sont orientés vers le joueur dans
l’image source. Leur socle est centré en (1522, 510) dans le repère du décor.
Un décalage du fond de trois pixels aligne le dernier rang de pixels visibles
sur le point de contact. La respiration étire légèrement la pose en hauteur
autour de la ligne des pieds, avec un maximum de 1,6 % à 42 % d’une boucle
de quatre secondes. La pose originale s’affiche si les animations du jeu sont
désactivées ou si le navigateur demande un mouvement réduit. Le cadrage montre
les deux socles à partir de 960 pixels de largeur. Sur un écran plus étroit,
le socle défile avec le plateau. Le visuel décoratif laisse passer les clics.

Les PNG, les WebP exacts et la référence de révision du Druide égaré
proviennent de l’[archive du 8 novembre 2026](https://chatgpt.com/library?file_id=libfile_f72c90383e5c81918c0691e5cff0b159&account_id=personal).
La branche de préparation de l’atelier n’avait encore enregistré aucun visuel
de ce lot. Le reçu consigne cette provenance, les prompts, les droits, les
dimensions, les poids et les SHA-256. Le statut de revue artistique du registre
de reprise est conservé séparément de l’accord d’intégration au jeu.

Les octets WebP sont embarqués dans `assets/arena-enemies-art.css`, feuille
partagée par le web et JOUER.html. Le builder vérifie la présence des douze
associations de campagne et des quatre boss de la Tour, les dimensions,
la transparence, les octets et les empreintes.
Les tests couvrent le rendu, les ancrages, le mouvement réduit, la reprise
et l’export sans réseau.
