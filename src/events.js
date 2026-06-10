(function bindStaticActions(global){
  function runStaticAction(action,element){
    switch(action){
      case 'resume-launch': return global.resumeFromLaunch();
      case 'skip-intro': return global.hideIntroScreen();
      case 'show-profile-setup': return global.showProfileSetup();
      case 'save-profile': return global.saveProfileAndEnter();
      case 'save-profile-tab': return global.saveProfileAndEnter(element.dataset.tab||'program');
      case 'program-view': return global.showProgramView(element.dataset.view||'today');
      case 'reset-week': return global.resetWeek();
      case 'stop-guided-session': return global.stopGuidedSession();
      case 'timer-mode': return element.dataset.mode==='manual' ? global.activateManualTimerMode() : global.activateExerciseTimerMode();
      case 'toggle-timer': return global.toggleTimer();
      case 'restart-timer': return global.restartCurrentTimer();
      case 'validate-timer': return global.validateTimerExercise();
      case 'manual-timer': return global.setManualTimer(Number(element.dataset.seconds)||90);
      case 'reset-stats': return global.resetStats();
      case 'close-tutorial': return global.closeTutorialModal();
      case 'open-youtube': return global.openYouTubeMusic();
      case 'open-spotify': return global.openSpotifyMusic();
      case 'close-immersive': return global.closeImmersiveTimer();
      case 'immersive-toggle': return global.immersiveToggleTimer();
      case 'immersive-restart': return global.immersiveRestartTimer();
      case 'open-immersive': return global.openImmersiveTimer();
      case 'set-timer-color': return global.setTimerPresetColor(element.dataset.color);
      case 'set-timer-skin': return global.setTimerSkin(element.dataset.skin);
      case 'minimize-spotify': return global.minimizeSpotifyPlayer();
      case 'close-spotify': return global.closeSpotifyPlayer();
      case 'minimize-youtube': return global.minimizeYouTubePlayer();
      case 'close-youtube': return global.closeYouTubePlayer();
      case 'open-youtube-external': return global.openYouTubeExternal();
      case 'select-level': return global.selectLevel(element.dataset.level);
      case 'toggle-sound': return global.toggleSoundOption();
      case 'set-theme': return global.setColorTheme(element.dataset.theme);
      case 'toggle-equipment': return global.toggleEquipment(element.dataset.equipment);
      case 'export-data': return global.exportUserData();
      case 'import-data': return global.triggerImportUserData();
      case 'reset-progress': return global.resetProgressData();
      case 'reset-notes': return global.resetNotesData();
      case 'reset-profile': return global.resetProfileData();
      case 'clear-media': return element.dataset.media==='youtube' ? global.setYouTubeUrl('') : global.setSpotifyUrl('');
      case 'save-feedback': return global.saveSessionFeedback(element.dataset.value,element.dataset.day||undefined);
      case 'show-today': return global.showTab('today');
      case 'edit-plan': return global.toggleWeeklyPlanEdit();
      case 'save-plan': return global.saveWeeklyPlanFromUI();
      case 'regenerate-plan': return global.regenerateWeeklyPlan();
      case 'load-selected-plan': return global.loadWeeklyPlanSnapshot(global.selectedSavedWeeklyPlanId||'');
      case 'delete-selected-plan': return global.deleteWeeklyPlanSnapshot();
      case 'plan-template': return global.applyWeeklyPlanTemplate(element.dataset.template);
      case 'create-plan-routine': return global.openRoutineBuilderFromPlan();
      case 'add-plan-routine-exercise': return global.addWeeklyPlanRoutineExercise(element.dataset.day,Number(element.dataset.index));
      case 'remove-plan-routine-exercise': return global.removeWeeklyPlanRoutineExercise(element.dataset.day,Number(element.dataset.index));
      case 'move-plan-routine-exercise': return global.moveWeeklyPlanRoutineExercise(element.dataset.day,Number(element.dataset.index),Number(element.dataset.dir)||0);
      case 'launch-plan-today': return global.launchPlannedToday();
      case 'launch-plan-day': return global.launchPlannedDay(element.dataset.day);
      case 'start-today-session': return global.startTodaySession();
      case 'reset-day': return global.resetDay();
      case 'toggle-card': return global.toggleCard(element);
      case 'start-exercise': return global.startExerciseTimer(element.dataset.day,Number(element.dataset.index));
      case 'check-exercise': return global.handleCheckClick({preventDefault(){},stopPropagation(){},stopImmediatePropagation(){}},element.dataset.day,Number(element.dataset.index));
      case 'open-tutorial': return global.openTutorialSearchEncoded(element.dataset.query);
      case 'start-library-exercise': return global.startLibraryExercise(Number(element.dataset.index));
      case 'toggle-custom-session': return global.toggleCustomSessionItem(Number(element.dataset.index));
      case 'load-saved-session': return global.loadSavedCustomSession(Number(element.dataset.index));
      case 'start-saved-session': return global.startSavedCustomSession(Number(element.dataset.index));
      case 'delete-saved-session': return global.deleteSavedCustomSession(Number(element.dataset.index));
      case 'clear-custom-session': return global.clearCustomSession();
      case 'remove-custom-session': return global.removeCustomSessionItem(Number(element.dataset.index));
      case 'save-custom-session': return global.saveCurrentCustomSession();
      case 'start-custom-session': return global.startCustomSession();
      case 'select-exercise-level': return global.selectExerciseLevel(element.dataset.level);
      case 'toggle-custom-profile': return global.toggleCustomProfilePanel();
      case 'create-custom-profile': return global.createCustomProfile();
      case 'delete-custom-profile': return global.deleteCustomProfile(element.dataset.id);
      case 'week-day': {
        return global.selectProgramDay(element.dataset.day,{week:true});
      }
      case 'select-day': {
        return global.selectProgramDay(element.dataset.day);
      }
      case 'nav-tab': return global.navigateTab(Number(element.dataset.dir)||1);
      default: return undefined;
    }
  }

  document.addEventListener('click',function(event){
    const actionEl=event.target && event.target.closest ? event.target.closest('[data-action]') : null;
    if(!actionEl)return;
    const action=actionEl.dataset.action;
    if(!action || action==='app-name' || action==='prep-time' || action==='exercise-note' || action==='spotify-url' || action==='youtube-url' || action==='import-file' || action==='custom-profile-field' || action==='select-custom-profile' || action==='plan-field' || action==='plan-routine-field' || action==='plan-routine-ex-name')return;
    event.preventDefault();
    if(actionEl.closest('[data-action="toggle-card"]') && action!=='toggle-card')event.stopPropagation();
    runStaticAction(action,actionEl);
  });

  document.addEventListener('input',function(event){
    const actionEl=event.target && event.target.closest ? event.target.closest('[data-action="app-name"]') : null;
    if(actionEl)global.setAppName(actionEl.value);
    const noteEl=event.target && event.target.closest ? event.target.closest('[data-action="exercise-note"]') : null;
    if(noteEl)global.setNote(global.P()[noteEl.dataset.day].exercises[Number(noteEl.dataset.index)],noteEl.value);
    const spotifyEl=event.target && event.target.closest ? event.target.closest('[data-action="spotify-url"]') : null;
    if(spotifyEl)global.setSpotifyUrl(spotifyEl.value);
    const youtubeEl=event.target && event.target.closest ? event.target.closest('[data-action="youtube-url"]') : null;
    if(youtubeEl)global.setYouTubeUrl(youtubeEl.value);
    const profileField=event.target && event.target.closest ? event.target.closest('[data-action="custom-profile-field"]') : null;
    if(profileField)global.saveCustomProfileField(profileField.dataset.field,profileField.value);
    const planRoutineField=event.target && event.target.closest ? event.target.closest('[data-action="plan-routine-field"]') : null;
    if(planRoutineField)global.updateWeeklyPlanRoutineField(planRoutineField.dataset.day,planRoutineField.dataset.field,planRoutineField.value,{render:false});
    const planExerciseName=event.target && event.target.closest ? event.target.closest('[data-action="plan-routine-ex-name"]') : null;
    if(planExerciseName)global.renameWeeklyPlanRoutineExercise(planExerciseName.dataset.day,planExerciseName.dataset.key,planExerciseName.value,{render:false});
  });

  document.addEventListener('blur',function(event){
    const actionEl=event.target && event.target.closest ? event.target.closest('[data-action="app-name"]') : null;
    if(actionEl)global.setAppName(actionEl.value);
  },true);

  document.addEventListener('change',function(event){
    const actionEl=event.target && event.target.closest ? event.target.closest('[data-action="prep-time"]') : null;
    if(actionEl)global.setPrepTime(Number(actionEl.value));
    const importEl=event.target && event.target.closest ? event.target.closest('[data-action="import-file"]') : null;
    if(importEl){
      global.importUserData(importEl.files&&importEl.files[0]);
      importEl.value='';
    }
    const profileField=event.target && event.target.closest ? event.target.closest('[data-action="custom-profile-field"]') : null;
    if(profileField)global.saveCustomProfileField(profileField.dataset.field,profileField.value);
    const customProfileSelect=event.target && event.target.closest ? event.target.closest('[data-action="select-custom-profile"]') : null;
    if(customProfileSelect)global.selectCustomProfile(customProfileSelect.value);
    const planField=event.target && event.target.closest ? event.target.closest('[data-action="plan-field"]') : null;
    if(planField)global.updateWeeklyPlanDraft(planField.dataset.day,planField.dataset.field,planField.value);
    const planRoutineField=event.target && event.target.closest ? event.target.closest('[data-action="plan-routine-field"]') : null;
    if(planRoutineField)global.updateWeeklyPlanRoutineField(planRoutineField.dataset.day,planRoutineField.dataset.field,planRoutineField.value);
    const planExerciseName=event.target && event.target.closest ? event.target.closest('[data-action="plan-routine-ex-name"]') : null;
    if(planExerciseName)global.renameWeeklyPlanRoutineExercise(planExerciseName.dataset.day,planExerciseName.dataset.key,planExerciseName.value);
  });
})(window);
