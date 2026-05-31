# vV Sport — version finale

## Inclus
- Choix du profil au lancement : Débutant / Medium / Expert
- Choix matériel : Matériel disponible / Anneaux / Supports de pompes
- Programme semaine adapté automatiquement
- Cartes exercices pliables avec illustrations
- Notes personnelles sauvegardées
- Progression par jour et semaine
- Minuteur dans chaque carte exercice : bouton ⏱
- Effort + récupération adaptés au niveau
- PWA installable avec manifest + service worker

## Tester
```bash
python -m http.server 8000
```

Puis ouvrir :
```txt
http://localhost:8000
```


## Mode Perso
Profil intégré :
- 38 ans
- 72 kg
- 1,78 m
- objectif : prise musculaire
- 30 pompes propres
- 5 tractions
- gainage 1m30
- matériel : anneaux, supports pompes, haltères 5 kg, tapis

Le mode Perso adapte le programme en priorité sur :
- hypertrophie maison
- progression traction
- équilibre push/pull
- tension musculaire et tempo
- récupération réaliste

## Matériel dynamique
Dans Options, active/désactive :
- Anneaux
- Supports de pompes
- Haltères
- Tapis

L’app remplace automatiquement certains exercices selon le matériel disponible.


## Si les sons ne s'entendent pas
Sur mobile, appuie d'abord sur :
Options → Tester le son

Les navigateurs bloquent parfois l'audio tant qu'il n'y a pas eu une interaction utilisateur explicite.


## Timer amélioré
Le minuteur affiche :
- cercle de progression animé
- barre linéaire
- pourcentage
- état Exercice / Récupération
- couleurs différentes selon effort, repos et fin proche

## Stats / coaching / animations
- Onglet Stats
- Historique local des exercices cochés
- Streak de jours actifs
- Temps estimé
- Graphique 7 derniers jours
- Conseil coach local basé sur tes données
- Micro-animations SVG sur pompes et anneaux


## Version optimisée
Cette version sépare :
- `index.html`
- `styles.css`
- `app.js`

Optimisations ajoutées :
- HTML allégé
- CSS séparé
- JS séparé avec `defer`
- service worker mis à jour
- réduction des animations si l’utilisateur préfère moins de mouvement
- pruning historique local
- moins de rendu lourd pendant le timer


## Vérification finale
- Syntaxe JS vérifiée avec Node.
- Références HTML/manifest/service worker vérifiées.
- Timer optimisé : il ne redessine plus toute la liste d'exercices à chaque seconde.

## Correctif audio + illustrations
- Ajout de vrais fichiers audio WAV pour rendre les sons plus fiables.
- WebAudio conservé en fallback.
- Illustrations SVG mieux adaptées : pompes, anneaux, gainage, jambes, tirage, haltères, cardio, mobilité, repos.
- Le service worker met en cache les fichiers audio.

## Correctif minuteur détails
- Le minuteur affiche maintenant cible, séries, consigne et conseil de l'exercice.
- Barre de progression plus visible.
- Cercle de progression agrandi.
- État Exercice / Récupération + pourcentage conservés.

## Correctif navigation / jour réel
- Après validation dans Options, l’app revient automatiquement sur l’onglet Aujourd’hui.
- Au démarrage, l’app sélectionne automatiquement le vrai jour de la semaine selon la date du navigateur/téléphone.

## Amélioration bonhommes / animations
Les illustrations ont été remplacées par des SVG plus lisibles :
- lignes du corps uniformes
- articulations plus claires
- flèches de mouvement
- animations discrètes adaptées au mouvement
- meilleure cohérence visuelle entre exercices

## Correctif écran noir
- Réinjection de la fonction `getRealDay()` utilisée au démarrage.
- Test runtime Node avec DOM simulé exécuté.

## Correctif préparation + animation
- Ajout d'un compte à rebours de préparation avant les exercices.
- Préparation configurable : 0s, 5s, 10s, 15s.
- Les flèches directionnelles des illustrations sont masquées.
- Animations de bonhomme plus sobres et plus lentes.

## Circuit guidé
- Les exercices de type circuit affichent maintenant l’ordre exact des étapes.
- Le minuteur démarre sur la première étape du circuit.
- Après chaque récupération, il passe automatiquement à l’étape suivante.
- L’écran minuteur affiche l’étape en cours et la suivante.

## Correctif tapis
Le tapis est maintenant traité comme un tapis marche/course électrique à vitesse réglable uniquement :
- aucune inclinaison
- consignes basées sur la vitesse
- zone 2 = marche rapide ou footing léger où tu peux encore parler

## Libellé tapis
Le matériel est affiché simplement comme “Tapis”, avec des consignes basées sur la vitesse.

## Écran de présentation
L’app affiche maintenant une page de présentation au lancement.
- Bouton Commencer : ouvre le programme du vrai jour.
- Bouton Changer le profil : ouvre la configuration.
- Après Options > Appliquer, retour direct sur Aujourd’hui conservé.

## Audit final anti écran noir
- Syntaxe JavaScript vérifiée.
- Test runtime avec DOM simulé.
- Références HTML/PWA/service worker vérifiées.
- Cache PWA versionné.
- Garde anti écran noir ajoutée.

## Conseils et animations améliorés
- Conseils techniques plus précis selon l'exercice.
- Pike push-ups, dips et rowing ont maintenant une illustration dédiée.
- Chaque exercice reçoit une illustration animée ou un fallback animé.

## Sélecteur d'exercice dans le minuteur
L'onglet Minuteur permet maintenant de choisir directement :
- un jour
- un exercice précis
- puis de lancer le timer adapté

Les circuits sont aussi disponibles depuis ce menu.

## Minuteur simplifié
Le minuteur propose maintenant une sélection globale d’exercice :
- pas besoin de choisir un jour
- liste unique des exercices disponibles
- timer adapté automatiquement
- circuits disponibles aussi

## Audit final global
- Syntaxe JavaScript vérifiée.
- Test runtime anti-écran noir avec DOM simulé.
- Fichiers audio WAV vérifiés.
- Cache PWA versionné.
- Sélecteur global d'exercice dans minuteur vérifié.

## Libellés minuteur clarifiés
- “Exercice en cours” remplacé par “Effort prévu”.
- Le grand timer indique maintenant clairement le bloc actuel.
- Ajout d’un texte explicatif : préparation / effort / récupération.

## Séance guidée du jour
- La page du jour affiche maintenant où tu en es dans la séance.
- Bouton “Démarrer la séance du jour”.
- Le minuteur enchaîne automatiquement les exercices de la journée.
- Les circuits sont déroulés étape par étape dans cette séance guidée.

## Audit final séance guidée
- Syntaxe JS vérifiée.
- Test runtime anti-écran noir.
- Audio WAV vérifié.
- Séance guidée du jour vérifiée.
- Cache PWA versionné.

## Son simplifié
- Suppression du bouton visible “Tester le son”.
- Le toggle Sons du minuteur suffit.
- Quand les sons sont activés, l'audio est déverrouillé automatiquement.

## Correctif validation manuelle
- La coche d'un exercice utilise maintenant une fonction stable.
- Cliquer sur ✓ valide/dévalide l'exercice sans ouvrir/fermer la carte.
- La progression du jour et de la semaine se met à jour.

## Reprendre / Commencer
- L’écran de lancement propose Reprendre si une session récente existe.
- Reprendre restaure le jour, l’onglet, le minuteur et la séance guidée.
- Commencer repart proprement sur le vrai jour actuel.

## Audit final reprise
- Syntaxe JS vérifiée.
- Runtime anti-écran noir vérifié.
- Reprendre/Commencer vérifié.
- Validation manuelle vérifiée.
- Audio WAV vérifié.
- Cache PWA versionné.

## Version plus propre
- Reset jour optimisé : un seul rendu.
- Reset semaine optimisé : un seul rendu.
- Fin de séance guidée optimisée : validation groupée.
- Libellé “Reset jour” plus clair.
- Feedback tactile sur boutons.

## Audit ultime
- Syntaxe JS vérifiée.
- Runtime anti-écran noir vérifié.
- PWA/cache versionné.
- Audio WAV vérifié.
- Reset optimisé vérifié.
- Reprendre/Commencer vérifié.

## Correctif accueil
- L'écran de présentation n'est plus centré trop bas.
- Suppression du grand espace vide en haut.
- Carte d'accueil positionnée plus naturellement.

## Optimisation mobile
- Viewport iPhone avec safe-area.
- Hauteur écran mobile `svh/dvh`.
- Boutons tactiles minimum 44px.
- Évite le zoom iOS sur select/input/textarea.
- Barre du bas compatible encoche iPhone.
- Déverrouillage audio renforcé au premier toucher.
- Cache PWA versionné.

## Polish UI spacing
- Espacements cartes/textes harmonisés.
- Lisibilité mobile améliorée.
- Boutons et zones tactiles clarifiés.
- Timer, cartes exercices, stats et écran accueil plus aérés.

## Correctif coche exercice
- La coche ✓ à côté du minuteur utilise maintenant un handler dédié.
- Le clic ne propage plus vers la carte.
- La coche valide/dévalide l'exercice sans lancer le minuteur.

## Libellé Reset
- Le bouton “Reset jour” est renommé “Reset”.
- Le comportement ne change pas : il remet à zéro uniquement le jour affiché.

## Illustrations améliorées
- Mapping exercice → illustration renforcé.
- Nouvelles illustrations dédiées : pike, dips, rowing, hollow, mountain climbers, split squat, curl, triceps, scapulaire.
- Le design reste sobre, mais les mouvements correspondent mieux aux exercices.

## Audit final illustrations
- Syntaxe JS vérifiée.
- Runtime anti-écran noir vérifié.
- Mapping illustrations vérifié.
- Audio WAV vérifié.
- PWA/cache versionné.

## Correctif mapping animation
- Pompes scapulaires utilisent maintenant l’animation scapulaire dédiée.

## Matériel disponible adaptatif
- Une seule section : “Matériel disponible”.
- Les programmes sont reconstruits selon le matériel activé/désactivé.
- Matériel disponible : alternatives supports, haltères ou poids du corps.
- Sans supports : pompes au sol.
- Sans haltères : alternatives poids du corps/isométriques.
- Sans tapis : marche dehors/cardio léger.

## Correctif matériel adaptatif v22
- Libellé matériel clarifié.
- Test adaptatif sécurisé.

## Audit final cohérence
- Matériel disponible relié à l'adaptation du programme.
- Runtime anti-écran noir.
- Mapping visuels.
- Audio, PWA, reset et séance guidée vérifiés.

## Icône carte exercice
- L’icône minuteur des cartes est remplacée par ▶.
- La fonction reste identique : démarrer l’exercice et ouvrir le minuteur.
- Le libellé accessibilité devient “Démarrer l’exercice”.

## Icône démarrer discrète
- Le bouton ▶ garde exactement la même fonction.
- Style plus discret, vert, cohérent avec le design sombre.

## Audit final icône démarrer
- Icône ▶ conserve la fonction startExerciseTimer.
- Style vert discret vérifié.
- Runtime anti-écran noir vérifié.
- Audio, matériel adaptatif, reset, séance guidée et PWA vérifiés.

## Conseil dimanche naturel
- Le conseil du dimanche/repos est remplacé par un message plus humain.
- Pas de pression, pas de minuteur, priorité récupération.

## Conseils naturels
- Tous les conseils principaux ont été réécrits.
- Ton plus simple, plus humain, moins automatique.
- Les consignes restent techniques mais plus faciles à comprendre.

## Audit final textes
- Textes visibles harmonisés.
- Conseils plus naturels.
- Labels boutons et timer clarifiés.
- Runtime anti-écran noir, audio, PWA, matériel adaptatif et séance guidée vérifiés.

## Better V2
- Plan de séance du jour plus clair.
- Bouton minuteur dynamique : Démarrer / Reprendre.
- Validation possible directement depuis le minuteur quand lancé depuis une carte.
- Interface toujours mobile-first et simple HTML.

## Correctif Better V2 HTML
- Bouton principal minuteur identifié.
- Bouton “Valider cet exercice” inséré correctement.

## Matériel unique
- Suppression du doublon “Matériel” / “Matériel disponible”.
- Le premier écran utilise maintenant directement “Matériel disponible”.
- Options affiche une seule section matériel.
- L’ancien mode interne est fixé sur “adaptive”.

## Fix Options matériel unique v35
- Ajout/réparation de renderOptions.
- Suppression du libellé Matériel disponible.
- Options affiche uniquement Niveau, Minuteur, Matériel disponible.

## Audit orthographe
- Correction des fautes restantes dans les libellés visibles.
- Harmonisation des unités : 72 kg, 1,78 m, 5 kg.
- Correction de “Supports de pompes”.
- Vérification des textes principaux, conseils, options, minuteur et matériel.

## Animations plus spécifiques
- Ajout de poses dédiées : ring push, ring row, support hold, knee raises, crunch, shoulder taps, gainage RKC, élévations latérales, mobilité poignets, étirements.
- Le mapping exercice → illustration est plus précis.
- Le style stickman sombre est conservé.

## Correctif reprise minuteur
- Changer d’onglet ne réinitialise plus l’exercice lancé dans le minuteur.
- En revenant sur Minuteur, le bouton affiche Reprendre si un exercice est en pause.
- La sélection d’exercice ne prévisualise plus par-dessus un timer actif/reprenable.

## Correctif reprise minuteur v39
- Un timer terminé ne bloque plus la sélection d’un nouvel exercice.
- Un timer en cours ou en pause reste reprenable après changement d’onglet.

## Correctif reprise minuteur v40
- Correction d’un appel interne manquant.
- Le retour sur l’onglet Minuteur conserve l’exercice en cours ou en pause.

## Correctif états minuteur v41
- Le libellé “Exercice sélectionné / Prépare-toi” se met maintenant à jour.
- Après la préparation, l’état passe bien à “Exercice en cours”.
- Pendant la récupération, l’état passe à “Récupération”.
- En pause, l’état affiche “En pause”.

## Correctif états minuteur v42
- Ajout d’un test interne des transitions d’état.
- Les textes du minuteur ne restent plus bloqués sur “Prépare-toi”.

## Correctif états minuteur v43
- Audit corrigé sur la vraie fonction updateTimer.
- Synchronisation des libellés confirmée sur Préparation / Exercice / Récupération / Pause / Terminé.

## Pause minuteur
- En pause, le bouton principal devient “Reprendre”.
- Un bouton “Recommencer” apparaît pour relancer l’exercice depuis le début.
- En cours d’exercice, “Recommencer” est masqué pour éviter les erreurs.

## Détails minuteur dynamiques
- Le titre n’affiche plus “Repos recommandé” de façon confuse.
- Effort prévu, récupération prévue et mode sont recalculés selon l’exercice courant.
- En circuit, les détails suivent l’étape en cours.

## Correctif détails minuteur v46
- Le mode est dynamique et sécurisé même si le profil n’est pas encore chargé.
- Les contrôles Reprendre/Recommencer sont vérifiés et conservés.

## Correctif audit détails minuteur v47
- Tests internes utilisés pour vérifier les détails dynamiques et les boutons Reprendre/Recommencer.

## Correctif coche cartes exercice
- La coche ✓ valide/dévalide vraiment l’exercice.
- Le clic ne se propage plus à la carte.
- La progression, les stats et la sauvegarde sont synchronisées.

## Correctif final coche cartes v49
- Correction du jour passé à la coche.
- renderAll sécurisé après suppression de l’ancien mode.
- Reprendre/Recommencer conservés.

## Correctif final coche cartes v50
- La coche utilise maintenant un test interne fiable.
- La validation ne redessine l’interface qu’une seule fois.
- Le bouton généré est nettoyé.

## Correctif syntaxe coche v51
- Correction des guillemets dans le template de la coche.
- Audit relancé après correction.

## Correctif stockage coche v52
- Correction de storageSafe : il utilisait une récursion au lieu de localStorage.
- La coche sauvegarde maintenant réellement l’état fait/non fait.
- Les clés de sauvegarde prennent le bon jour en compte.

## Correctif syntaxe storage v53
- Bloc storageSafe nettoyé après correction du stockage.

## Correctif final setDone v54
- Ancien corps de setDone dupliqué supprimé.

## Correctif bloc done/note v55
- Bloc key/getDone/setDone/getNote/setNote remplacé entièrement.

## Audit final coche v56
- Test storageSafe fait depuis l’intérieur de l’app.

## États du minuteur au premier démarrage
- Depuis une carte exercice, le minuteur s’ouvre maintenant sur “Commencer”.
- Le décompte de préparation démarre après appui sur “Commencer”.
- Pendant l’effort : “Pause”.
- En pause : “Reprendre” + “Recommencer”.
- Correction du reset automatique du timer au chargement.

## Correction Matériel disponible v58
- Suppression de l'ancien bloc Matériel : Matériel disponible / Anneaux / Supports.
- Premier écran : Matériel disponible sélectionnable directement.
- Options : une seule section Matériel disponible.
- Le programme reste adaptatif selon Anneaux, Supports de pompes, Haltères 5 kg et Tapis.

## Ajout Vélo v59
- Ajout de Vélo dans Matériel disponible.
- Le vélo sert au cardio doux, échauffement et récupération.
- Si Tapis est absent mais Vélo disponible, les blocs tapis deviennent vélo.
- Si Vélo est absent mais Tapis disponible, les blocs vélo deviennent tapis.
- Si aucun cardio n’est disponible, l’app propose marche dehors ou cardio léger.

## Correctif vélo v60
- Correction de l’ordre d’initialisation dans l’adaptation tapis/vélo.

## Programme vélo explicite v61
- Le vélo n’est plus seulement une alternative : il apparaît comme vrai exercice quand il est disponible.
- Perso Mercredi : Vélo zone 2 si Vélo coché et Tapis non coché.
- Programme générique : ajout d’un bloc cardio vélo/tapis/marche le mercredi.
- L’animation vélo est utilisée pour les exercices Vélo.

## Correctif programme vélo explicite v62
- Test vélo rendu robuste.
- Le programme garantit un vrai bloc Vélo quand Vélo est disponible et Tapis absent.

## Correctif programme vélo v63
- Correction de applyEquipmentAdaptation : map ne passe plus l’index à la place de l’équipement.
- Le vélo reste bien Vélo zone 2 dans les programmes quand il est disponible.

## Audit vélo v64
- Vérification Mercredi medium faite via helper interne.

## Correctif lancement v65
- Correction du crash “selectLevel is not defined”.
- Restauration des fonctions appelées par le premier écran et Options.
- Audit des onclick principaux.

## Audit lancement v66
- Test selectLevel fait via helper interne, sans accès externe à profile.

## Correction onglets/options v67
- Options ne s’affiche plus dans tous les menus.
- renderAll ne rend plus Options globalement.
- Niveau et Matériel disponible sont restaurés dans le bon conteneur.
- Conteneur Options isolé dans l’onglet Options.

## Audit complet optimisé v68
- Audit complet lancement / onglets / Options / matériel / vélo / coche / minuteur.
- showTab renforcé pour mobile/WebView.
- renderAll ne rend plus Options globalement.
- CSS onglets ciblé uniquement sur .tab-page.
- Tests internes consolidés.

## Audit complet v69
- Suppression finale des traces “Sans anneaux”.
- Rendu Matériel disponible vérifié sur setup et Options.

## Audit complet v70
- Helper __testFullAuditState aligné sur le menu Options final.

## Correction libellé matériel
- Suppression du doublon “Matériel / Matériel disponible”.
- Un seul libellé reste affiché : “Matériel disponible”.

## Correction libellé matériel v72
- Suppression des dernières traces statiques “Matériel”.

## Statut séance terminée v73
- À 100%, la carte passe en “Séance terminée”.
- Le texte “Prochain exercice” disparaît quand tout est terminé.
- Le bouton devient “Recommencer la séance”.
- Le démarrage ne relance plus une séance déjà complète.

## Correctif navigation onglets v74
- Les boutons de navigation sont reliés à showTab même si onclick ou data binding manque.
- showTab gère active + hidden + display pour mobile/WebView.
- La navigation est rebinding au lancement.
- Délégation de clic ajoutée pour les boutons data-tab.

## Correctif navigation onglets v75
- currentTab initialisé.
- Onglet Stats inclus dans showTab.
- data-tab ajouté aux boutons du menu.
- options-content flottant supprimé.

## Correctif navigation v76
- currentTab replacé proprement hors du handler d’erreur.

## Correction profil / lancement v77
- Correction des niveaux affichés en undefined.
- currentTab initialisé proprement.
- Commencer ouvre le choix du profil.
- Reprendre garde le comportement de reprise.
- Navigation onglets conservée.

## Audit visuel v78
- Les cartes utilisent maintenant chooseExerciseVisual(ex) au lieu de seulement ex.svg.
- Ajout de visuels spécifiques : circuit, rowing haltères, support hold sur supports, dips anneaux.
- Correction des mappings : rowing aux anneaux, dips anneaux, mobilité épaules, étirements dos/pecs.
- Audit interne des mappings visuels ajouté.

## Audit visuel v79
- Mobilité épaules priorisée sur le visuel mobilité, pas haltères.

## Vérification complète finale v78
- Structure HTML corrigée.
- Profil/niveaux sans undefined.
- currentTab/activeTab synchronisés.
- Navigation mobile robuste.
- Options isolé.
- Matériel disponible sans doublon.
- Statut séance terminée.
- Visuels et animations conservés.
- Tests runtime complets.

## Correctif safe area iPhone v79
- Ajout de viewport-fit=cover.
- Ajout de padding safe-area en haut pour éviter que l’heure/Dynamic Island recouvre le titre.
- Ajout de padding safe-area en bas pour la navigation.

## Correctif doublon Options v80
- La section Options ne contient plus qu’un seul conteneur dynamique.
- Suppression des anciens blocs statiques en bas de l’onglet.
- Ajout d’un test anti-doublon Options.

## Hard fix Options / onglets v81
- Options isolé en dur.
- Suppression des blocs statiques.
- showTab masque explicitement toutes les pages non actives.
