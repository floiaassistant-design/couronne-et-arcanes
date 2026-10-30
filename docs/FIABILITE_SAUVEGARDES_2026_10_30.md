# Fiabilisation des sauvegardes — contrat du 30 octobre 2026

## Invariants

1. Le profil local historique conserve sa clé `couronnes_arcanes_v1` et sa
   normalisation rétrocompatible. Aucune migration ni remise à zéro implicite.
2. Un JSON invalide ou un stockage inaccessible ne permet pas de commencer
   à jouer sur un profil vierge : écran de récupération, export des octets texte
   d'origine s'ils sont lisibles, et import explicite d'un profil validé.
3. Une modification de profil ordinaire est réalisée sur une copie en mémoire.
   Elle n'est adoptée et annoncée qu'une fois l'écriture réussie. Une opération
   métier rejetée ou un quota dépassé laisse intact le profil courant.
4. Les paquets et évolutions utilisent déjà ce modèle. Les résultats de combat
   conservent leur reçu anti-duplication et leur protocole de reprise distincts.
5. Le laboratoire, les statistiques de cartes, les clés, les anciennes sauvegardes,
   les effets, les images et le moteur de combat restent inchangés.

## Reprise et vérification

- Cas de démarrage : pas de profil, profil lisible historique (deck vide inclus),
  JSON cassé, type de données invalide, blocage de lecture.
- Cas transactionnels : échec métier, échec d'écriture, succès ; mêmes ressources
  et mêmes stocks après échec, aucun faux message de réussite.
- Navigation navigateur : écran de récupération, export texte d'origine, import
  d'un profil valide, achats avec quota et reprise d'un résultat terminal.
- Générer `JOUER.html` depuis les sources, contrôler sa synchronisation et la
  CI du commit exact avant toute demande de fusion. Aucune publication sans fusion.

## Synchronisation de la distribution

Le générateur officiel `npm run build` a régénéré `JOUER.html` sur la
branche dans le commit `c17049e7dbf3d804804b76b6ba05a0830d90af40`.
Le workflow temporaire qui a fait cette opération s'est retiré du diff final.
Cette génération ne prouve pas encore le succès de la suite CI sur la tête
finale ; consulter la PR et ses contrôles avant fusion. Aucun Site publié ici.
