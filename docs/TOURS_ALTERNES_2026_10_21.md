# Tours alternés et pose visible de l’IA — proposition du 21 octobre 2026

## Règle proposée pour les nouveaux combats
Dans la campagne, la Tour et les donjons démarrés depuis cette version, le combat garde deux cartes au maximum par camp et par manche. L’ordre est maintenant :
1. Le joueur pose ses cartes sur les cases autorisées, peut utiliser son pouvoir, puis **valide ses actions**.
2. Poison, contrôles, déplacements et attaques des **unités alliées** sont résolus. Les dégâts et événements viennent toujours du moteur.
3. L’IA choisit et **pose une carte à la fois** depuis sa propre main, en respectant les compteurs, ses deux actions et le plateau visible. Le rendu est actualisé et l’action est sauvegardée entre chaque pose.
4. Quand l’IA n’a plus d’action utile, poison, contrôles, déplacements et attaques de ses **unités** sont résolus. Les pièges expirent ; l’attrition s’applique à partir de la manche 17 ; les mains piochent et les compteurs diminuent pour la manche suivante.
5. Une victoire ou défaite peut intervenir dès la résolution du joueur ou lors d’un sort adverse. Le moteur ne permet alors pas d’autres actions.

Les attaques d’un même camp restent collectées avant leur résolution. Riposte, capacités et ciblage utilisent les modules existants. La phase adverse est enregistrable et reprend après rechargement. Les sauvegardes historiques **sans** `turnFlow: 'alternating'` restent sur l’ancien calcul commun : pas de migration implicite.

## Périmètre exact
- Moteur : fonctions publiques `playEnemyCard` et `finishEnemyTurn`, filtres de camp dans la résolution, marqueur optionnel `turnFlow` dans les nouveaux combats.
- Interface : indication du camp actif, bouton **Valider mes actions**, poses de l’IA entrecoupées de courts délais, effets CSS sur les cases selon les événements réels.
- Lecture réduite : si les animations sont désactivées ou si le système demande moins de mouvement, les étapes visuelles sont raccourcies/supprimées ; **les règles sont identiques**.
- Export : le builder existant doit régénérer `JOUER.html` et `ESSAI_CARTES.html`, sans édition directe. Aucun nouvel asset, portrait, droits ou mapping d’image.

## Limites et suite
Les cartes sont encore **jouées immédiatement lors de leur pose** : cette première version n’ajoute pas de file d’attente annulable avant validation. Les petits effets CSS indiquent les événements ; ce ne sont pas encore des séquences de sprites approuvées par l’atelier. L’équilibrage de cette nouvelle alternance doit être mesuré avant la fusion ; la suite de parité historique vérifie uniquement le mode ancien. Les anciens tests de navigateur pouvant supposer un tour entier synchrone doivent être adaptés pour attendre la fin réelle du tour adverse.

État de validation et résultats : voir la PR et ses vérifications GitHub sur le commit proposé. Aucun accord de fusion sur main n’est implicite.
