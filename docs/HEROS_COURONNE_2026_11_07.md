# Héros de la Couronne v01

Planche originale du 7 novembre 2026. L’ordre du PNG est Gardien, Arcaniste, Rôdeur, Clerc. La maquette v1 validée fixe les pieds du joueur à (149, 510) dans le décor original 1672 × 941. La hauteur du personnage est de 183 pixels dans ce repère.

Chaque WebP est une bande de 16 poses transparentes de 152 × 183 pixels. Première pose au repos, dernière en inspiration maximale. Les poses sont découpées dans la planche ci-dessus, redimensionnées avec préservation des proportions, puis le torse est légèrement déformé selon la pose. Le bas du corps et les points de contact restent fixes. Boucle de quatre secondes, avec le sommet de l’inspiration à 42 %. La pose zéro sert de repli statique.

Recadrages source en pixels `x, y, largeur, hauteur`, suivis de la fraction horizontale de l’ancrage des pieds et du masque de protection de l’équipement :

| Classe | Recadrage | Pieds | Masque |
| --- | --- | --- | --- |
| Gardien | 9, 10, 457, 852 | 0,47 | 0,55–0,77 |
| Arcaniste | 482, 10, 385, 853 | 0,49 | 0,72–0,89 |
| Rôdeur | 897, 36, 458, 826 | 0,54 | 0,59–0,77 |
| Clerc | 1370, 28, 368, 834 | 0,57 | 0,71–0,86 |

Le déplacement vertical maximal vaut 1,6 % de la hauteur. Il est concentré sur le torse (centre à 32 % de la hauteur) et s’annule progressivement entre 46 % et 67 % de la hauteur de l’image. Export WebP qualité 88 avec canal alpha à qualité maximale.

## Prompt original

A high-quality 2D painted fantasy character lineup for the tactical game Couronnes & Arcanes, on a truly transparent alpha background. ONE wide horizontal production sheet, four separate full-body battle-arena characters standing side by side on a common invisible baseline, each entirely inside its own equal-width quarter of the canvas with clear transparent gutters and no overlapping weapons. Each stands solidly on both feet with head, fingers, equipment and boots fully visible. Faces turn three quarters towards screen right, relaxed neutral alert idle pose with stable feet. 2D painterly semi-realistic European medieval fantasy, confident silhouettes, large simple shapes with finely painted believable materials, no anime, no chibi, no 3D plastic look. Refined brass and stone textures, subtle cool reflected moonlight for use in a slate blue celestial arena, strong color/value separation so they remain distinct at 80 px in height. Adults, four distinct faces and ages. From left to right, strictly: 1. Gardien, broad protector in ivory steel plate with aged antique gold borders, a compact navy cape behind the shoulders, bare head, large shield planted by the FRONT of his body toward screen right, resting a hand at the top of the shield, shield never hiding the whole torso; 2. Arcaniste, older lean spellcaster in a long tailored indigo coat, high collar, upright staff with a small icy crystal at the top; 3. Rôdeur, woodland scout wearing moss-green hood and cape over brown leather, holding a compact low bow diagonally, not aiming; 4. Clerc, resolute healer in a cream and burgundy robe with embroidered shoulder capelet, short ceremonial scepter, calm clear face. Same scale and camera elevation, different silhouettes and readable gear. Space above heads and underneath boots. No text, no floor, no labels, no cast shadows, no cards, no frame, no circles, no scene, no particles, no external aura. A cohesive character design sheet made of four clean, reusable separate cutout silhouettes.

## Intégration au jeu

Le rendu choisit la planche selon la classe enregistrée dans le combat et
l’affiche sur le socle du joueur de l’arène peinte. Le décor, les cases et
le socle gardent le même repère lorsque le plateau défile. Le personnage est
décoratif et laisse les clics passer. La première pose s’affiche lorsque le
réglage des animations du jeu est désactivé ou que le navigateur demande un
mouvement réduit.

Le [reçu d’import](approvals/heros-couronne-v01.json) identifie la planche
originale, l’archive de reprise et les quatre exports par leurs empreintes
SHA-256. Les exports exacts sont embarqués dans
`assets/arena-heroes-art.css`, qui associe une planche par classe et sert aux
deux distributions. Leur provenance est l’archive de reprise validée. Une
éventuelle mise en registre dans le dépôt atelier reste une opération distincte.

Le builder contrôle le mapping, le format, les dimensions et les empreintes
des quatre exports. Les tests de l’arène vérifient le choix par classe, la
pose fixe, l’ancrage et le déploiement des cartes.
