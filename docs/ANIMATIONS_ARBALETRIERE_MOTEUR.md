# Arbalétrière illustrée — contrat moteur et proposition d’intégration, 14 octobre 2026

## Sources approuvées et périmètre

Carte moteur `archer` uniquement. Le portrait de carte reste `arbaletriere_aube.webp` et le cadre Illustrée v3 reste inchangé. L’unité du plateau utilise sa vue de combat séparée et les cinq atlas approuvés de la PR art nº 2, commit exact `234988e2960451e5ed31ed6226175694b92da880`. Reçu copié sans modification : `docs/art-approvals/arbaletriere_aube_2026-10-12.json`, message humain « ok je valide tous ». Les tentatives non sélectionnées et le chevalier sont exclus.

Le propriétaire a demandé le raccord des animations illustrées au vrai combat le 14/10/2026. Ce travail prépare une PR ; aucune fusion n’est autorisée. La PR nº 17 des cinq portraits reste distincte. Main vérifié au départ : `0310fa677947e34a02bd877f5adc6104267f87ba` ; l’ancienne PR nº 11 ne fournit aucune ressource pour ce raccord.

## Contrat

- WebP avec alpha, octets originaux conservés ; atlas horizontaux d’une ligne, cadres **512×512**. Pas de recompression, de retouche ou de nouvelles images.
- Ancrage source **(256,461)**, orientation droite pour le joueur ; miroir horizontal complet pour l’adversaire. Cadre affiché 176 px dans le plan peint, redimensionné avec lui ; 96 px sur le plateau historique.
- Six textures, **2 328 136 octets** au total, budget brut **2,4 Mo**. Liste, dimensions et SHA-256 : `assets/units/arbaletriere_aube/manifest.json`. L’export autonome réserve un budget de 5,1 Mo, incluant les cinq portraits déjà proposés par la PR nº 17 ; cette branche seule reste autour de 4,31 Mo. Tout autre élargissement exige un nouveau budget.

| Séquence | Durées des images (ms) | Boucle |
| --- | --- | --- |
| Repos V3 | 650 / 650 / 800 / 650 | Oui, sur l’unité vivante |
| Marche V2 | 180 / 150 / 180 / 150 | Oui ; un cycle pour le déplacement tracé |
| Tir V2 | 200 / 140 / 260 / 110 / 160 / 230 | Non |
| Impact V2 | 110 / 160 / 200 | Non |
| Défaite V2 | 150 / 230 / 250 / 450 | Non ; dernière pose puis disparition |

Le lecteur utilise les durées variables exactes. Les séquences ne créent aucun événement ni dégât. Les mouvements suivent les deux ancrages de la trace ; téléportation, attaques, dommages publics de poison/pièges et morts conservent l’ordre par UID. Les attaques attendent les déplacements ; les acteurs indépendants peuvent jouer en parallèle. La mort d’une unité retirée du plateau est montrée par une copie graphique transitoire.

Le carreau est un petit dessin vectoriel original, adapté de l’étude art PR nº 4 `d193b762c662fbaad4bb32db6e5d9d83b1938a7b` : sortie à **600 ms**, image 04 du tir, ancrage de l’arme **(469,141)** dans le cadre 512×512 ; trajet **440 ms**. Le point utilise le même ancrage, la même échelle et le même miroir que l’unité ; il reste indépendant des changements de pose après le lâcher. Le carreau ne déclenche jamais un calcul de dégâts. L’étude du projectile est en review ; cette PR en propose le rendu moteur, sans inventer une approbation artistique.

## Architecture et interruptions

`ui/unit-sprites.js` contient le contrat pur, le rendu ciblé et le plan des séquences. `ui/unit-animation.js` porte le chargement des atlas, la lecture, les acteurs transitoires, le projectile et les interruptions. `combat-fx.js` coordonne ce lecteur avec les effets historiques ; `app.js` le monte après le rendu et la projection. Le builder embarque les six textures dans le HTML. 27 modules ; aucun import du navigateur dans le moteur.

Le helper de trace existant du moteur ajoute uniquement l’identité publique `{uid,cardId,side}` des acteurs/cibles depuis le plateau au moment de l’événement. Cela permet de garder la bonne identité après un déplacement ou une mort, sans consulter les mains cachées. Aucun champ obligatoire de bataille, résultat, statistique, hasard ou règle ne change. `withBattleFx` efface la trace avant sauvegarde, comme auparavant ; l’animation ne reçoit pas le profil et ne modifie jamais la bataille.

Désactivation, mouvement réduit, navigation ou nouveau rendu annulent les copies, projectiles et horloges. La vue illustrée statique reste disponible. Un atlas absent garde cette vue ; si la vue elle-même manque, l’ancienne silhouette sert de repli. Le résultat est calculé et sauvegardé avant l’animation. Recharger un combat restaure une unité au repos, sans rejouer un tir ou une mort sauvegardés.

## Validation et limites

- Local : 263 tests Node et 60 parités historiques inchangées ; builds normal/test et empreintes contrôlées. Tests d’UID après retrait, ordre marche/tir/impact/mort, cadence et octets approuvés.
- Nouveau parcours Chromium `browser_unit_animation.py` : événements réels sur un scénario de laboratoire contrôlé, images décodées, repos/marche/tir/impact/mort, origine du carreau, ancien 3×5, miroir adverse, navigation/interruption, animations coupées, mouvement réduit, reprise et production hors réseau. Serveur modulaire avec atlas de tir bloqué pour le repli statique.
- Les neuf suites navigateur historiques et les simulations restent dans la CI. Vérifier le résultat sur le commit exact de la PR ; un test écrit n’est pas une preuve d’exécution. Aucun navigateur local ni téléphone physique revendiqué dans cette session.
- Limites acceptées du reçu : poses peintes courtes, appuis de marche imparfaits, petites variations du visage/arme/contours, défaite sur un genou. Aucune animation du reste du catalogue ajoutée.

En intégrant aussi la PR nº 17, régénérer `JOUER.html` depuis les sources combinées et conserver ses cinq nouveaux portraits et métadonnées. La fusion de chaque PR nécessite son propre accord spécifique.

## Reprise vérifiée — 15 octobre 2026

La [CI #38697938861](https://github.com/floiaassistant-design/couronne-et-arcanes/actions/runs/38697938861) a terminé avec succès sur `304f74045291cb8bdd16073fbcf2fa29c26b620e`. Les 263 tests, 60 parités, builds synchronisés, dix parcours Chromium, simulations de contrôle et comparaisons d’arène sont exécutés. Le scénario HTTP bloque réellement `tir.webp` et confirme que le tireur conserve son image fixe visible pendant qu’un autre acteur peut utiliser le repos ou l’impact. L’ancienne assertion globale rejetait à tort cet autre atlas disponible ; seul le test a été corrigé.

L’aperçu combiné avec les sources exactes de la PR nº 17 `2e7391669843a96a848104c88e0164234b612453` passe 266 tests et 60 parités, puis les parcours des cinq portraits et du pilote animé sur bureau et mobile portrait/paysage, ainsi que la production hors réseau et le repli d’atlas. Export : 4 986 888 octets, sous le budget de 5,1 Mo. Le workflow est ajusté pour ne proposer cet artefact qu’après validation et pour joindre l’empreinte SHA-256 du HTML. Aucune fusion, changement de règle ou nouvelle validation artistique n’en découle.
