// Page Guide : rendu HTML pur, sans accès au moteur, au DOM ni à la sauvegarde.
export function renderGuidePage({ btn, previousGameAvailable }) {
    const steps = [
      [
        'Choisissez une mission',
        'Ouvrez Campagne, puis lancez le Sentier des Brumes. Le combat commence immédiatement.'
      ],
      [
        'Observez vos cartes',
        'Chaque carte porte un chiffre de délai (◷). Dans votre main, un compte à rebours indique combien de tours avant de pouvoir la jouer. La couleur et le nom de la rareté sont également visibles sur le cadre.'
      ],
      [
        'Distinguez les troupes',
        'Sur le plateau, chaque unité affiche VOUS ou ENNEMI, son Ordre (Aube, Sylve, Ombre, Forge ou Éther) et sa rareté. Les quatre classes de héros se choisissent dans l’Atelier.'
      ],
      [
        'Posez une unité ou ciblez un sort',
        'Pour une unité, sélectionnez sa carte puis une case de départ libre. Pour un sort, cliquez une carte autorisée ou choisissez une ligne, lisez l’aperçu puis confirmez avec Lancer le sort. Annuler ou Échap ne consomme rien. Les sorts sont immédiats ; vos unités agissent après validation du tour.'
      ],
      [
        'Validez vos actions',
        'Cliquez « Valider mes actions ». Vos unités avancent et attaquent, puis l’IA joue ses cartes et fait agir les siennes. Les anciens combats sauvegardés conservent leur résolution commune.'
      ],
      [
        'Protégez votre couronne',
        'Évitez que les créatures adverses atteignent votre porte. Faites tomber les PV du héros ennemi à zéro pour gagner.'
      ],
      [
        'Activez une formation',
        'Placez au moins deux créatures du même Ordre sur une même ligne : chacune gagne +1 attaque tant que la formation tient. La carte elle-même compte parmi les deux ; davantage de créatures ne porte pas ce bonus au-delà de +1. L’emblème déjà peint en haut à droite de la carte s’éclaire quand Concorde est actif, aussi chez les ennemis. La fiche indique le bonus et son état.'
      ],
      [
        'Choisissez vos talents',
        'À partir des niveaux 4 et 8, l’Atelier propose deux voies exclusives par palier. Changez de voie gratuitement entre deux combats. Les talents sélectionnés restent propres à chaque classe.'
      ],
      [
        'Apprenez les compétences de classe',
        'Dans la Collection, apprenez des cartes réservées à votre classe aux niveaux 3 et 6 en échange d’éclats. Une carte de classe incompatible doit être retirée du deck avant de changer de héros.'
      ],
      [
        'Contrôlez le terrain',
        'Les six cartes de contrôle sont fabriquables en Alchimie avec l’or et les éclats du jeu, ou obtenables dans les paquets. Silence : suspend Poison, Soin, Inspiration, Impact de zone, Vol de vie, Perforation, Célérité, Charge, Riposte et les capacités de contrôle. Armure, Distance, Vol, Garde, Concorde et bonus déjà appliqués sont conservés. Un tour de répit suit chaque silence ; le poison déjà appliqué continue.'
      ],
      [
        'Changez de ligne et préparez un piège',
        'Faille : choisissez une ligne d’arrivée ; l’allié le plus avancé d’une autre ligne rejoint la même colonne libre (égalité : ligne la plus haute). La case devant la couronne adverse est exclue. Une téléportation par unité et par tour. Les pièges sont publics, persistent trois résolutions et se déclenchent quand un ennemi entre sur leur case par déplacement ou téléportation ; une case survolée ne les déclenche pas.'
      ],
      [
        'Maîtrisez le temps',
        'Élan des Heures réduit de deux tours le compteur de votre carte en attente la plus lente. Nœud du Temps ajoute deux tours au compteur d’une carte ennemie sans révéler son identité (maximum six). Ces sorts consomment une action parmi les deux cartes jouables par tour et sont fabricables en Alchimie.'
      ],
      [
        'Progressez en jouant',
        'Chaque victoire apporte de l’expérience au héros. Les cartes réellement jouées gagnent en maîtrise (les unités reçoivent +1 PV au rang 3 ; les sorts gagnent des insignes). Les niveaux de héros 5 et 9 donnent chacun +1 bouclier.'
      ],
      [
        'Améliorez votre armée',
        'Chaque victoire apporte de l’or, des éclats et parfois une carte. Modifiez votre deck, équipez votre héros et choisissez votre classe.'
      ],
      [
        'Gravissez la Tour',
        'La Tour des Couronnes propose 20 épreuves. Les étages de gardiens 5, 10, 15 et 20 peuvent offrir une carte exclusive.'
      ],
      [
        'Choisissez dans les donjons',
        'Entre deux salles, choisissez un seul événement : repos (+10 PV), coffre garanti, ou embuscade bonus risquée. Une défaite met fin à l’expédition.'
      ],
      [
        'Gagnez des réputations',
        'Chaque victoire apporte de la réputation aux factions de votre deck. Leurs unités gagnent des PV en atteignant les paliers de réputation.'
      ]
    ];
    return `<div class="kicker">LES LOIS DU ROYAUME</div><h1 class="page-title">Apprendre à jouer</h1><p class="page-sub">Pas besoin d’avoir déjà joué à un jeu de cartes tactique. Le principe est simple : poser une carte au bon moment, sur la bonne ligne, puis laisser vos troupes agir.</p><div class="guide-list spaced">${steps.map(([title, desc], i) => `<div class="guide-step"><div class="step-num">${String(i + 1).padStart(2, '0')}</div><div><h3>${title}</h3><p>${desc}</p></div></div>`).join('')}</div>
 <div class="card-panel spaced"><div class="section-caption">RÈGLES AVANCÉES</div><div class="two-grid" style="margin-top:17px"><div><h3>Plateau et capacités</h3><p class="page-sub">Chaque ligne contient <b>10 cases jouables</b>, entre les deux couronnes : 2 lignes en duel, 3 pour les rencontres avancées, 4 contre les boss. Posez vos créatures sur une case libre parmi les trois premières de chaque ligne : 1, 2 ou 3. La zone adverse est symétrique : 10, 9 ou 8. Les anciens combats de 3 lignes de 5 cases conservent leur case d’entrée unique.</p><p class="page-sub"><b>Armure</b> réduit les dégâts. <b>Portée</b> fixe la distance d’attaque. <b>Rapidité</b> accélère le déplacement. <b>Poison</b> inflige des dégâts différés. <b>Soin</b> restaure un allié. <b>Éclaboussure</b> touche une seconde cible. <b>Charge</b> renforce une attaque après déplacement. <b>Riposte</b> répond à un adversaire adjacent après une attaque au contact. Les valeurs, zones et fréquences de chaque version sont précisées sur sa fiche.</p></div><div><h3>Composition du deck</h3><p class="page-sub">Vous pouvez jouer au plus <b>deux cartes par tour</b>. Les cartes lentes sont puissantes mais doivent patienter dans votre main. Mélangez unités rapides, défenses, soutiens et sorts. Les cartes utilisées reviennent lorsque le paquet se reforme.</p></div></div></div><div class="card-panel spaced"><div class="section-caption">SAUVEGARDE & TRANSPORT</div><h2 class="section-title" style="margin-top:9px">Conserver votre progression</h2><p class="page-sub">La partie est enregistrée dans ce navigateur. Vous pouvez aussi exporter un fichier de sauvegarde et l’importer sur un autre appareil. « Nouvelle partie » conserve seulement un emplacement précédent sur cet appareil : exportez votre profil avant de multiplier les essais.</p><div class="button-row">${btn('↓ Exporter ma sauvegarde', 'export-save', '', 'primary')}${btn('↑ Importer une sauvegarde', 'import-save', '', 'ghost')}${previousGameAvailable ? btn('↶ Reprendre la partie précédente', 'restore-previous-game', '', 'ghost') : ''}<input id="import-file" type="file" accept="application/json,.json" hidden /></div></div><div class="button-row">${btn('Commencer la première mission', 'start-mission', 'data-id="01"', 'primary')}</div>`;
  }
