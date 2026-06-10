(function createTimerShell(global){
  const TIMER_PRESET_COLORS={
    auto:{label:'Auto',color:''},
    lime:{label:'Lime',color:'#bdf45b'},
    cyan:{label:'Cyan',color:'#67e8f9'},
    ocean:{label:'Ocean',color:'#38bdf8'},
    mint:{label:'Menthe',color:'#34d399'},
    violet:{label:'Violet',color:'#a78bfa'},
    indigo:{label:'Indigo',color:'#818cf8'},
    amber:{label:'Ambre',color:'#f2c36b'},
    orange:{label:'Orange',color:'#fb923c'},
    rose:{label:'Rose',color:'#fb7185'},
    magenta:{label:'Magenta',color:'#f472b6'},
    red:{label:'Rouge',color:'#ef4444'},
    white:{label:'Blanc',color:'#f8fafc'}
  };
  const TIMER_SKINS={
    watch:{label:'Montre'},
    chrono:{label:'Chrono'},
    minimal:{label:'Minimal'}
  };

  let presetColorKey=(global.storageSafe&&global.storageSafe.getItem('vv-timer-preset-color'))||'auto';
  let skinKey=(global.storageSafe&&global.storageSafe.getItem('vv-timer-skin'))||'watch';
  global.timer=global.timer||{
    seconds:90,
    left:90,
    interval:null,
    running:false,
    phase:'manual',
    context:'Chrono libre',
    exercise:null,
    exerciseData:null,
    effort:90,
    rest:0,
    totalPhase:90,
    prep:5,
    pendingStart:false,
    circuit:null,
    circuitIndex:0,
    sourceDay:null,
    sourceIndex:null
  };
  global.timerTune=global.timerTune||{
    effort:Math.max(15,Number(global.storageSafe&&global.storageSafe.getItem('vv-timer-tune-effort'))||90),
    rest:Math.max(0,Number(global.storageSafe&&global.storageSafe.getItem('vv-timer-tune-rest'))||30),
    prep:Math.max(0,Number(global.storageSafe&&global.storageSafe.getItem('vv-timer-tune-prep'))||5)
  };

  function getPresetColorKey(){
    return presetColorKey;
  }

  function setPresetColorKey(key){
    if(!TIMER_PRESET_COLORS[key])return false;
    presetColorKey=key;
    if(global.storageSafe)global.storageSafe.setItem('vv-timer-preset-color',key);
    return true;
  }

  function getSkinKey(){
    return TIMER_SKINS[skinKey]?skinKey:'watch';
  }

  function setSkinKey(key){
    if(!TIMER_SKINS[key])return false;
    skinKey=key;
    if(global.storageSafe)global.storageSafe.setItem('vv-timer-skin',key);
    return true;
  }

  function colorForProfile(profile){
    if(presetColorKey&&presetColorKey!=='auto'&&TIMER_PRESET_COLORS[presetColorKey]){
      return TIMER_PRESET_COLORS[presetColorKey].color;
    }
    if(profile&&profile.level==='debutant')return '#67e8f9';
    if(profile&&profile.level==='medium')return '#bdf45b';
    if(profile&&profile.level==='expert')return '#a78bfa';
    const accent=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    return accent||'#bdf45b';
  }

  function applyColor(profile){
    document.documentElement.style.setProperty('--timer-color',colorForProfile(profile));
  }

  function renderColorPreset(options={}){
    const ring=document.getElementById('timer-ring');
    if(!ring)return;
    const escapeHTML=options.escapeHTML || (value=>String(value||''));
    let tools=document.getElementById('timer-floating-tools');
    if(!tools){
      tools=document.createElement('div');
      tools.id='timer-floating-tools';
      tools.className='timer-floating-tools';
      tools.innerHTML='<button class="timer-icon-btn" type="button" data-action="open-immersive" title="Mode immersif" aria-label="Ouvrir le mode immersif"><span aria-hidden="true">⛶</span></button>';
      ring.appendChild(tools);
    }else if(tools.parentElement!==ring){
      ring.appendChild(tools);
    }
    tools.querySelectorAll('.timer-spotify-btn,.timer-youtube-btn').forEach(btn=>btn.remove());
    if(!tools.querySelector('[data-action="open-immersive"]')){
      tools.insertAdjacentHTML('afterbegin','<button class="timer-icon-btn" type="button" data-action="open-immersive" title="Mode immersif" aria-label="Ouvrir le mode immersif"><span aria-hidden="true">⛶</span></button>');
    }
    let box=document.getElementById('timer-color-preset');
    if(!box){
      box=document.createElement('div');
      box.id='timer-color-preset';
      box.className='timer-color-preset timer-color-floating';
      tools.appendChild(box);
    }else if(box.parentElement!==tools){
      tools.appendChild(box);
    }
    box.innerHTML=Object.entries(TIMER_PRESET_COLORS).map(([key,item])=>
      '<button class="timer-color-dot '+(presetColorKey===key?'active':'')+'" type="button" data-action="set-timer-color" data-color="'+key+'" title="'+escapeHTML(item.label)+'" aria-label="Couleur minuteur '+escapeHTML(item.label)+'" aria-pressed="'+(presetColorKey===key?'true':'false')+'" style="--timer-choice:'+(item.color||'var(--timer-color,var(--accent))')+'">'+
        '<span></span>'+
      '</button>'
    ).join('');
    const oldSkins=document.getElementById('timer-skin-preset');
    if(oldSkins)oldSkins.remove();
    renderImmersiveSkinPreset(escapeHTML);
  }

  function renderImmersiveSkinPreset(escapeHTML=value=>String(value||'')){
    const box=document.getElementById('immersive-skin-preset');
    if(!box)return;
    box.innerHTML=Object.entries(TIMER_SKINS).map(([key,item])=>
      '<button class="timer-skin-dot '+(getSkinKey()===key?'active':'')+'" type="button" data-action="set-timer-skin" data-skin="'+key+'" title="Style '+escapeHTML(item.label)+'" aria-label="Style minuteur '+escapeHTML(item.label)+'" aria-pressed="'+(getSkinKey()===key?'true':'false')+'">'+escapeHTML(item.label)+'</button>'
    ).join('');
  }

  function openImmersive(){
    const view=document.getElementById('immersive-timer');
    if(!view)return;
    if(view.parentElement!==document.body)document.body.appendChild(view);
    document.documentElement.classList.add('immersive-root');
    document.documentElement.style.width='100%';
    document.documentElement.style.maxWidth='none';
    document.documentElement.style.margin='0';
    document.documentElement.style.padding='0';
    document.body.style.width='100%';
    document.body.style.maxWidth='none';
    document.body.style.margin='0';
    document.body.style.padding='0';
    view.style.position='fixed';
    view.style.inset='0';
    view.style.width='100vw';
    view.style.maxWidth='none';
    view.style.height='100vh';
    view.style.margin='0';
    view.style.transform='none';
    view.hidden=false;
    view.classList.remove('hidden');
    document.body.classList.add('immersive-open');
  }

  function closeImmersive(){
    const view=document.getElementById('immersive-timer');
    if(!view)return;
    view.hidden=true;
    view.classList.add('hidden');
    document.body.classList.remove('immersive-open');
    document.documentElement.classList.remove('immersive-root');
    document.documentElement.style.width='';
    document.documentElement.style.maxWidth='';
    document.documentElement.style.margin='';
    document.documentElement.style.padding='';
    document.body.style.width='';
    document.body.style.maxWidth='';
    document.body.style.margin='';
    document.body.style.padding='';
    view.style.position='';
    view.style.inset='';
    view.style.width='';
    view.style.maxWidth='';
    view.style.height='';
    view.style.margin='';
    view.style.transform='';
  }

  function isManualMode(timer=global.timer){
    return timer.phase==='manual' || (timer.freeMode && !timer.exercise && !timer.exerciseData && timer.sourceDay===null);
  }

  function immersiveTitle(timer=global.timer,guidedSession=null){
    if(timer.exercise)return timer.exercise;
    if(timer.exerciseData&&timer.exerciseData.name)return timer.exerciseData.name;
    if(guidedSession&&guidedSession.steps&&guidedSession.steps[guidedSession.index]){
      return guidedSession.steps[guidedSession.index].name || 'Séance guidée';
    }
    if(timer.phase==='manual')return 'Chrono libre';
    return 'Minuteur';
  }

  function immersiveSubtitle(timer=global.timer,guidedSession=null){
    if(guidedSession&&guidedSession.day)return guidedSession.day+' · séance guidée';
    if(timer.context)return timer.context;
    if(timer.exerciseData&&timer.exerciseData.target)return timer.exerciseData.target;
    return 'Exercice sélectionné';
  }

  function normalizeLabel(value){
    return String(value||'')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .replace(/\s+/g,' ')
      .trim();
  }

  function noop(){}

  function phaseText(hooks,text){
    (hooks.setPhaseText||noop)(text);
  }

  function contextText(hooks,text){
    (hooks.setContextText||noop)(text);
  }

  function startPrepCountdown(timer=global.timer,hooks={}){
    clearInterval(timer.interval);
    const resumePrep=timer.pendingStart && timer.phase==='prep';
    const originalLeft=resumePrep ? (timer.prepOriginalLeft || timer.seconds || timer.left) : timer.left;
    const originalTotal=resumePrep ? (timer.prepOriginalTotal || timer.totalPhase || timer.seconds || timer.left) : (timer.totalPhase || timer.seconds || timer.left);
    const returnPhase=resumePrep ? (timer.prepReturnPhase || 'effort') : (timer.phase || 'effort');
    let prepLeft=resumePrep ? timer.left : timer.prep;

    timer.pendingStart=true;
    timer.running=true;
    timer.phase='prep';
    timer.prepOriginalLeft=originalLeft;
    timer.prepOriginalTotal=originalTotal;
    timer.prepReturnPhase=returnPhase;
    timer.left=prepLeft;
    timer.totalPhase=Math.max(1,timer.prep);
    (hooks.updateMainTimerButton||noop)();
    phaseText(hooks,'PREPARATION');
    (hooks.syncTimerLabels||noop)();
    (hooks.updateTimer||noop)();
    (hooks.cue||noop)('count');

    timer.interval=setInterval(()=>{
      prepLeft--;
      timer.left=Math.max(0,prepLeft);

      if(prepLeft>0){
        if(prepLeft<=3)(hooks.cue||noop)('count');
        (hooks.updateTimer||noop)();
      }else{
        clearInterval(timer.interval);
        timer.pendingStart=false;
        timer.phase=timer.prepReturnPhase || 'effort';
        timer.left=originalLeft;
        timer.totalPhase=originalTotal;
        delete timer.prepOriginalLeft;
        delete timer.prepOriginalTotal;
        delete timer.prepReturnPhase;
        (hooks.syncTimerLabels||noop)();
        phaseText(hooks,'EFFORT');
        startActiveTimer(timer,hooks);
      }
    },1000);
  }

  function startActiveTimer(timer=global.timer,hooks={}){
    timer.running=true;
    (hooks.cue||noop)('start');
    timer.interval=setInterval(()=>{
      timer.left--;
      if(timer.left>0&&timer.left<=3)(hooks.cue||noop)('count');
      if(timer.left<=0){
        clearInterval(timer.interval);
        if(timer.phase==='effort'&&timer.rest>0){
          (hooks.cue||noop)('rest');
          timer.phase='rest';
          (hooks.syncTimerLabels||noop)();
          timer.left=timer.rest;
          timer.seconds=timer.rest;
          timer.totalPhase=timer.rest;
          phaseText(hooks,'RECUPERATION');
          timer.interval=setInterval(()=>{
            timer.left--;
            if(timer.left>0&&timer.left<=3)(hooks.cue||noop)('count');
            if(timer.left<=0){
              clearInterval(timer.interval);
              if(timer.circuit && timer.circuitIndex < timer.circuit.length-1){
                timer.circuitIndex++;
                const step=timer.circuit[timer.circuitIndex];
                timer.exercise=step.name;
                (hooks.syncTimerLabels||noop)();
                timer.left=step.effort;
                timer.seconds=step.effort;
                timer.totalPhase=step.effort;
                timer.rest=step.rest;
                timer.phase='effort';
                (hooks.syncTimerLabels||noop)();
                contextText(hooks,'Circuit - '+step.name);
                phaseText(hooks,'EFFORT');
                timer.pendingStart=false;
                (hooks.syncTimerLabels||noop)();
                (hooks.updateTimer||noop)();
                if(timer.prep>0)startPrepCountdown(timer,hooks);
                else startActiveTimer(timer,hooks);
              }else{
                if(timer.guided && (hooks.advanceGuidedSession||noop)()){
                  return;
                }
                timer.running=false;
                phaseText(hooks,'TERMINE');
                (hooks.cue||noop)('done');
              }
            }
            (hooks.updateTimer||noop)();
          },1000);
        }else{
          if(timer.guided && (hooks.advanceGuidedSession||noop)()){
            return;
          }
          timer.running=false;
          phaseText(hooks,'TERMINE');
          (hooks.cue||noop)('done');
        }
      }
      (hooks.updateTimer||noop)();
    },1000);
    (hooks.updateTimer||noop)();
  }

  function toggleTimer(timer=global.timer,hooks={}){
    if(timer.running){
      timer.running=false;
      if(!timer.pendingStart)timer.pendingStart=false;
      (hooks.syncTimerLabels||noop)();
      clearInterval(timer.interval);
      (hooks.updateTimer||noop)();
      (hooks.saveAppState||noop)();
      return;
    }

    if(timer.left<=0){
      timer.left=timer.seconds;
      timer.totalPhase=timer.seconds;
    }

    if(timer.pendingStart && timer.prep>0){
      startPrepCountdown(timer,hooks);
      return;
    }

    const shouldPrep=(timer.phase==='effort' || timer.phase==='manual') && timer.prep>0 && !timer.pendingStart;
    if(shouldPrep){
      startPrepCountdown(timer,hooks);
      return;
    }

    startActiveTimer(timer,hooks);
    (hooks.syncTimerLabels||noop)();
    (hooks.updateMainTimerButton||noop)();
  }

  global.TimerShell={
    colors:TIMER_PRESET_COLORS,
    skins:TIMER_SKINS,
    get timer(){return global.timer;},
    get tune(){return global.timerTune;},
    getPresetColorKey,
    setPresetColorKey,
    getSkinKey,
    setSkinKey,
    colorForProfile,
    applyColor,
    renderColorPreset,
    renderImmersiveSkinPreset,
    openImmersive,
    closeImmersive,
    isManualMode,
    immersiveTitle,
    immersiveSubtitle,
    normalizeLabel,
    startPrepCountdown,
    startActiveTimer,
    toggleTimer
  };
})(window);
