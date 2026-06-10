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

## Build

Le build utilise `esbuild` si les dependances sont installees:

```bash
npm install
npm run build
```

Sans `npm install`, `node build.js` copie les fichiers `.min` sans minification risquee.

## Creer un zip propre

Ne zippe pas le dossier du projet a la main, sinon tu risques d'inclure `.git`.

Utilise plutot:

```powershell
npm run release
```

ou directement:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/create-release.ps1
```

Le zip est cree avec `git archive`, donc le dossier `.git` n'est jamais inclus.

## Structure

- `index.html`: structure de l'application.
- `styles.css`: interface et responsive mobile.
- `app.js`: logique de programme, minuteur, progression et PWA.
- `src/storage.js`: acces securise au stockage local.
- `src/ui.js`: helpers UI partages, scheduler de rendu et echappement HTML.
- `src/program.js`: helpers du moteur programme et calendrier.
- `src/events.js`: delegation des actions statiques sans `onclick` inline.
- `src/timer.js`: shell du minuteur, couleurs et mode immersif.
- `src/stats.js`: moteur de calcul des stats, historique et semaine.
- `docs/architecture.md`: plan de decoupage progressif de `app.js`.
- `scripts/create-release.ps1`: creation d'un zip de publication sans `.git`.
- `manifest.webmanifest`: configuration d'installation PWA.
- `sw.js`: cache hors-ligne.
- `sound-*.wav`: sons du minuteur.

## Donnees

Les reglages, notes et progressions sont stockes localement dans le navigateur avec `localStorage`.
