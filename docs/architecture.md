# Architecture cible

`app.js` est encore le fichier principal de l'application. Pour eviter une grosse migration risquee, le decoupage se fait par petites passes.

## Modules deja extraits

- `src/storage.js`: wrapper protege autour de `localStorage`.
- `src/ui.js`: helpers UI partages: scheduler de rendu et echappement HTML.
- `src/program.js`: helpers du moteur programme: jours, jour reel, clone et detection repos.
- `src/events.js`: delegation des actions declarees avec `data-action` dans `index.html` et dans les rendus dynamiques.
- `src/timer.js`: shell du minuteur: couleurs, preset couleur, outils du cadran et ouverture/fermeture du mode immersif.
- `src/stats.js`: calculs d'historique, streak, resume semaine et formats de dates.

## Modules cibles

- `src/storage.js`: lecture/ecriture `localStorage`, export/import, migrations de donnees.
- `src/program.js`: generation des programmes, adaptation profil/materiel/feedback. Les helpers sont extraits, les donnees et adaptations restent a migrer par blocs.
- `src/timer.js`: etat du minuteur, seance guidee, mode immersif, sons.
- `src/stats.js`: calculs de progression, streak, historique. Le rendu stats reste encore dans `app.js`.
- `src/ui.js`: rendu des onglets, cartes, options. Les helpers sont extraits, les templates restent a migrer par zones.

## Ordre recommande

1. Continuer l'extraction des fonctions sans dependance DOM: helpers, stats.
2. Extraire le moteur programme: donnees exercices, adaptation, construction de seance.
3. Continuer l'extraction du timer: compte a rebours, `start`, `pause`, `restart`, `validate`.
4. Extraire les rendus UI restants vers `src/ui.js` en gardant la delegation `data-action`.
5. Garder `app.js` comme point d'entree jusqu'a ce que tous les modules soient stables.

## Regle pour les prochains changements

Quand une nouvelle fonctionnalite est ajoutee, eviter d'ajouter un gros bloc global dans `app.js`. Preferer une fonction pure ou un module cible, puis brancher l'UI avec un petit adaptateur.
