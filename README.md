# vV Sport

Application web/PWA de programme sportif personnel: musculation, calisthenie, abdos, minuteur et suivi de progression.

## Fonctionnalites

- Choix du niveau au lancement: Debutant, Medium, Expert ou Perso.
- Programme adapte au materiel disponible: anneaux, supports de pompes, halteres, tapis, velo.
- Vue du jour, vue semaine, bibliotheque d'exercices et onglet minuteur.
- Seance guidee du jour avec enchainement automatique des exercices.
- Notes personnelles, progression locale, stats et conseils.
- PWA installable avec manifest et service worker.

## Lancer en local

Depuis le dossier du projet:

```bash
python -m http.server 8000
```

Puis ouvrir:

```text
http://localhost:8000
```

## Structure

- `index.html`: structure de l'application.
- `styles.css`: interface et responsive mobile.
- `app.js`: logique de programme, minuteur, progression et PWA.
- `manifest.webmanifest`: configuration d'installation PWA.
- `sw.js`: cache hors-ligne.
- `sound-*.wav`: sons du minuteur.

## Donnees

Les reglages, notes et progressions sont stockes localement dans le navigateur avec `localStorage`.
