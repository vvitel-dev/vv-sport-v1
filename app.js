const storageSafe = window.storageSafe;
const renderScheduler = window.UIEngine.createRenderScheduler();

// Performance optimization: Render debouncing with requestAnimationFrame
function scheduleRender(renderFn) {
  renderScheduler.schedule(renderFn);
}

// Render memoization to prevent duplicate consecutive renders
function shouldRender() {
  return renderScheduler.shouldRender({ currentTab, programView, currentDay });
}

const APP_VERSION='1.2.0';
let appName=storageSafe.getItem('vv-app-name')||'vV Sport';
function cleanAppName(value){
  const name=String(value||'').trim().replace(/\s+/g,' ');
  return name || 'vV Sport';
}
function updateAppNameUI(){
  const name=cleanAppName(appName);
  appName=name;
  const launchTitle=document.getElementById('launch-title');
  const setupInput=document.getElementById('setup-app-name');
  if(launchTitle)launchTitle.textContent=name;
  if(setupInput && setupInput.value!==name)setupInput.value=name;
  document.title=name;
}
function setAppName(value){
  appName=cleanAppName(value);
  storageSafe.setItem('vv-app-name',appName);
  updateAppNameUI();
}
let spotifyUrl=storageSafe.getItem('vv-spotify-url')||'';
let youtubeUrl=storageSafe.getItem('vv-youtube-url')||'';
function cleanSpotifyUrl(value){
  const url=String(value||'').trim();
  if(!url)return '';
  if(/^https:\/\/open\.spotify\.com\/(playlist|album|track|artist|show|episode)\//i.test(url))return url.slice(0,300);
  if(/^spotify:(playlist|album|track|artist|show|episode):/i.test(url))return url.slice(0,300);
  return '';
}
function spotifyEmbedUrl(value){
  const url=cleanSpotifyUrl(value);
  if(!url)return '';
  let match=url.match(/^https:\/\/open\.spotify\.com\/(playlist|album|track|artist|show|episode)\/([^?/#]+)/i);
  if(match)return 'https://open.spotify.com/embed/'+match[1].toLowerCase()+'/'+encodeURIComponent(match[2])+'?utm_source=vv_sport';
  match=url.match(/^spotify:(playlist|album|track|artist|show|episode):([^?/#]+)/i);
  if(match)return 'https://open.spotify.com/embed/'+match[1].toLowerCase()+'/'+encodeURIComponent(match[2])+'?utm_source=vv_sport';
  return '';
}
function setSpotifyUrl(value){
  spotifyUrl=String(value||'').trim().slice(0,300);
  if(spotifyUrl)storageSafe.setItem('vv-spotify-url',spotifyUrl);
  else storageSafe.removeItem('vv-spotify-url');
  updateSpotifyUI();
  saveAppState();
}
function cleanYouTubeUrl(value){
  const url=String(value||'').trim();
  if(!url)return '';
  if(/^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(url))return url.slice(0,300);
  return '';
}
function youtubeEmbedUrl(value){
  const url=cleanYouTubeUrl(value);
  if(!url)return '';
  let match=url.match(/[?&]list=([^&#]+)/i);
  if(match)return 'https://www.youtube.com/embed/videoseries?list='+encodeURIComponent(match[1]);
  match=url.match(/youtu\.be\/([^?/#]+)/i);
  if(match)return 'https://www.youtube.com/embed/'+encodeURIComponent(match[1]);
  match=url.match(/[?&]v=([^&#]+)/i);
  if(match)return 'https://www.youtube.com/embed/'+encodeURIComponent(match[1]);
  match=url.match(/youtube\.com\/shorts\/([^?/#]+)/i);
  if(match)return 'https://www.youtube.com/embed/'+encodeURIComponent(match[1]);
  match=url.match(/youtube\.com\/embed\/([^?/#]+)/i);
  if(match)return 'https://www.youtube.com/embed/'+encodeURIComponent(match[1]);
  return '';
}
function openYouTubeExternal(){
  const url=cleanYouTubeUrl(youtubeUrl);
  if(url)window.open(url,'_blank','noopener,noreferrer');
}
function setYouTubeUrl(value){
  youtubeUrl=String(value||'').trim().slice(0,300);
  if(youtubeUrl)storageSafe.setItem('vv-youtube-url',youtubeUrl);
  else storageSafe.removeItem('vv-youtube-url');
  updateYouTubeUI();
  saveAppState();
}
function openSpotifyMusic(){
  if(document.body.classList.contains('immersive-open'))closeImmersiveTimer();
  const embed=spotifyEmbedUrl(spotifyUrl);
  if(!embed){
    showTab('options');
    setTimeout(()=>{
      const section=document.querySelector('[data-options-section="music"]');
      if(section){
        section.open=true;
        section.scrollIntoView({behavior:'smooth',block:'center'});
      }
      const input=document.getElementById('spotify-url-input');
      if(input)input.focus();
    },0);
    return;
  }
  let sheet=document.getElementById('spotify-player-sheet');
  if(!sheet){
    sheet=document.createElement('div');
    sheet.id='spotify-player-sheet';
    sheet.className='spotify-player-sheet hidden';
    sheet.innerHTML='<div class="spotify-player-head" id="spotify-player-drag"><span>Spotify</span><div><button type="button" data-action="minimize-spotify" aria-label="Cacher Spotify">−</button><button type="button" data-action="close-spotify" aria-label="Fermer Spotify">×</button></div></div><iframe id="spotify-player-frame" title="Lecteur Spotify" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>';
    document.body.appendChild(sheet);
    makeSpotifyPlayerDraggable(sheet);
  }
  const frame=document.getElementById('spotify-player-frame');
  if(frame && frame.src!==embed)frame.src=embed;
  sheet.classList.remove('hidden');
  sheet.classList.remove('minimized');
  document.body.classList.add('spotify-open');
  updateSpotifyMiniButton(false);
}
function openYouTubeMusic(){
  if(document.body.classList.contains('immersive-open'))closeImmersiveTimer();
  const embed=youtubeEmbedUrl(youtubeUrl);
  if(!embed){
    showTab('options');
    setTimeout(()=>{
      const section=document.querySelector('[data-options-section="music"]');
      if(section){
        section.open=true;
        section.scrollIntoView({behavior:'smooth',block:'center'});
      }
      const input=document.getElementById('youtube-url-input');
      if(input)input.focus();
    },0);
    return;
  }
  let sheet=document.getElementById('youtube-player-sheet');
  if(!sheet){
    sheet=document.createElement('div');
    sheet.id='youtube-player-sheet';
    sheet.className='spotify-player-sheet youtube-player-sheet hidden';
    sheet.innerHTML='<div class="spotify-player-head" id="youtube-player-drag"><span>YouTube</span><div><button type="button" data-action="minimize-youtube" aria-label="Cacher YouTube">−</button><button type="button" data-action="close-youtube" aria-label="Fermer YouTube">×</button></div></div><iframe id="youtube-player-frame" title="Lecteur YouTube" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe><div class="youtube-fallback" id="youtube-fallback"><strong>Lecture intégrée indisponible</strong><span>YouTube bloque parfois le lecteur intégré en local ou selon la vidéo.</span><button type="button" data-action="open-youtube-external">Ouvrir sur YouTube</button></div>';
    document.body.appendChild(sheet);
    makePlayerDraggable(sheet,'#youtube-player-drag');
  }
  const frame=document.getElementById('youtube-player-frame');
  const fallback=document.getElementById('youtube-fallback');
  const localFile=location.protocol==='file:';
  if(frame){
    frame.classList.toggle('hidden',localFile);
    if(localFile)frame.src='about:blank';
    else if(frame.src!==embed)frame.src=embed;
  }
  if(fallback)fallback.classList.toggle('hidden',!localFile);
  sheet.classList.remove('hidden','minimized');
  updateYouTubeMiniButton(false);
}
function updateYouTubeMiniButton(show){
  let mini=document.getElementById('youtube-mini-btn');
  if(!mini){
    mini=document.createElement('button');
    mini.id='youtube-mini-btn';
    mini.className='spotify-mini-btn youtube-mini-btn hidden';
    mini.type='button';
    mini.innerHTML='<svg class="media-service-icon youtube-service-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6.5" width="18" height="11" rx="3"></rect><path d="M10.5 9.5v5l4.4-2.5z"></path></svg>';
    mini.setAttribute('aria-label','Réouvrir YouTube');
    mini.title='Réouvrir YouTube';
    mini.addEventListener('click',restoreYouTubePlayer);
    document.body.appendChild(mini);
  }
  mini.classList.toggle('hidden',!show);
}
function minimizeYouTubePlayer(){
  const sheet=document.getElementById('youtube-player-sheet');
  if(sheet)sheet.classList.add('hidden','minimized');
  updateYouTubeMiniButton(true);
}
function restoreYouTubePlayer(){
  const sheet=document.getElementById('youtube-player-sheet');
  if(!sheet){
    openYouTubeMusic();
    return;
  }
  sheet.classList.remove('hidden','minimized');
  updateYouTubeMiniButton(false);
}
function closeYouTubePlayer(){
  const sheet=document.getElementById('youtube-player-sheet');
  if(sheet){
    const frame=document.getElementById('youtube-player-frame');
    if(frame)frame.src='about:blank';
    sheet.classList.add('hidden');
  }
  updateYouTubeMiniButton(false);
}
function updateSpotifyMiniButton(show){
  let mini=document.getElementById('spotify-mini-btn');
  if(!mini){
    mini=document.createElement('button');
    mini.id='spotify-mini-btn';
    mini.className='spotify-mini-btn hidden';
    mini.type='button';
    mini.innerHTML='<svg class="media-service-icon spotify-service-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M7.2 9.5c3.2-1 7.1-.7 9.7.8"></path><path d="M7.8 12.2c2.6-.8 5.7-.6 7.9.6"></path><path d="M8.5 14.8c1.9-.5 4.1-.4 5.7.5"></path></svg>';
    mini.setAttribute('aria-label','Réouvrir Spotify');
    mini.title='Réouvrir Spotify';
    mini.addEventListener('click',restoreSpotifyPlayer);
    document.body.appendChild(mini);
  }
  mini.classList.toggle('hidden',!show);
}
function minimizeSpotifyPlayer(){
  const sheet=document.getElementById('spotify-player-sheet');
  if(sheet)sheet.classList.add('hidden','minimized');
  document.body.classList.remove('spotify-open');
  updateSpotifyMiniButton(true);
}
function restoreSpotifyPlayer(){
  const sheet=document.getElementById('spotify-player-sheet');
  if(!sheet){
    openSpotifyMusic();
    return;
  }
  sheet.classList.remove('hidden','minimized');
  document.body.classList.add('spotify-open');
  updateSpotifyMiniButton(false);
}
function closeSpotifyPlayer(){
  const sheet=document.getElementById('spotify-player-sheet');
  if(sheet){
    const frame=document.getElementById('spotify-player-frame');
    if(frame)frame.src='about:blank';
    sheet.classList.add('hidden');
  }
  document.body.classList.remove('spotify-open');
  updateSpotifyMiniButton(false);
}
function makeSpotifyPlayerDraggable(sheet){
  makePlayerDraggable(sheet,'#spotify-player-drag');
}
function makePlayerDraggable(sheet,handleSelector){
  const handle=sheet.querySelector(handleSelector);
  if(!handle || sheet.dataset.draggable==='1')return;
  sheet.dataset.draggable='1';
  let startX=0,startY=0,startLeft=0,startTop=0,dragging=false;
  const move=(clientX,clientY)=>{
    if(!dragging)return;
    const nextLeft=Math.max(8,Math.min(window.innerWidth-sheet.offsetWidth-8,startLeft+(clientX-startX)));
    const nextTop=Math.max(8,Math.min(window.innerHeight-sheet.offsetHeight-8,startTop+(clientY-startY)));
    sheet.style.left=nextLeft+'px';
    sheet.style.top=nextTop+'px';
    sheet.style.right='auto';
    sheet.style.bottom='auto';
    sheet.style.margin='0';
  };
  handle.addEventListener('pointerdown',event=>{
    if(event.target&&event.target.closest&&event.target.closest('button'))return;
    dragging=true;
    startX=event.clientX;
    startY=event.clientY;
    const rect=sheet.getBoundingClientRect();
    startLeft=rect.left;
    startTop=rect.top;
    handle.setPointerCapture&&handle.setPointerCapture(event.pointerId);
  });
  handle.addEventListener('pointermove',event=>move(event.clientX,event.clientY));
  handle.addEventListener('pointerup',()=>{
    dragging=false;
  });
  handle.addEventListener('pointercancel',()=>{dragging=false;});
}
function updateSpotifyUI(){
  removeLegacyMediaDock();
  const has=!!cleanSpotifyUrl(spotifyUrl);
  const btn=document.getElementById('timer-spotify-btn');
  if(btn){
    btn.classList.toggle('connected',has);
    btn.title=has?'Ouvrir Spotify':'Ajouter un lien Spotify';
    btn.setAttribute('aria-label',btn.title);
  }
  const input=document.getElementById('spotify-url-input');
  if(input && document.activeElement!==input && input.value!==spotifyUrl)input.value=spotifyUrl;
  const openBtn=document.querySelector('.spotify-open-btn');
  if(openBtn){
    openBtn.classList.toggle('connected',has);
    openBtn.textContent=has?'Ouvrir Spotify':'Ajouter un lien';
  }
}
function updateYouTubeUI(){
  removeLegacyMediaDock();
  const has=!!youtubeEmbedUrl(youtubeUrl);
  const btn=document.getElementById('timer-youtube-btn');
  if(btn){
    btn.classList.toggle('connected',has);
    btn.title=has?'Ouvrir YouTube':'Ajouter un lien YouTube';
    btn.setAttribute('aria-label',btn.title);
  }
  const input=document.getElementById('youtube-url-input');
  if(input && document.activeElement!==input && input.value!==youtubeUrl)input.value=youtubeUrl;
  const openBtn=document.querySelector('.youtube-open-btn');
  if(openBtn){
    openBtn.classList.toggle('connected',has);
    openBtn.textContent=has?'Ouvrir YouTube':'Ajouter un lien';
  }
}
function removeLegacyMediaDock(){
  const dock=document.getElementById('media-floating-dock');
  if(dock)dock.remove();
  storageSafe.removeItem('vv-media-dock-anchor');
}
const COLOR_THEMES={
  lime:{label:'Lime',accent:'#bdf45b',dim:'rgba(189,244,91,.10)',accent2:'#74d7e7',accent3:'#e9bd65',bg:'#0b0d0c',gradient:'linear-gradient(135deg,#d9ff63 0%,#9be84a 48%,#67e8f9 100%)'},
  ocean:{label:'Ocean',accent:'#67e8f9',dim:'rgba(103,232,249,.11)',accent2:'#bdf45b',accent3:'#60a5fa',bg:'#091012',gradient:'linear-gradient(135deg,#67e8f9 0%,#38bdf8 52%,#8b5cf6 100%)'},
  sunset:{label:'Sunset',accent:'#f2c36b',dim:'rgba(242,195,107,.12)',accent2:'#fb7185',accent3:'#f97316',bg:'#100d0a',gradient:'linear-gradient(135deg,#facc15 0%,#fb923c 48%,#fb7185 100%)'},
  rose:{label:'Rose',accent:'#fb7185',dim:'rgba(251,113,133,.12)',accent2:'#f0abfc',accent3:'#f2c36b',bg:'#100b0d',gradient:'linear-gradient(135deg,#fb7185 0%,#f472b6 48%,#a78bfa 100%)'},
  violet:{label:'Violet',accent:'#a78bfa',dim:'rgba(167,139,250,.13)',accent2:'#67e8f9',accent3:'#f2c36b',bg:'#0e0c13',gradient:'linear-gradient(135deg,#a78bfa 0%,#7c3aed 50%,#67e8f9 100%)'}
};
let colorThemeKey=storageSafe.getItem('vv-color-theme')||'lime';
const TIMER_PRESET_COLORS=window.TimerShell.colors;
function applyColorTheme(key=colorThemeKey){
  const theme=COLOR_THEMES[key]||COLOR_THEMES.lime;
  colorThemeKey=COLOR_THEMES[key]?key:'lime';
  const root=document.documentElement;
  root.style.setProperty('--accent',theme.accent);
  root.style.setProperty('--accent-dim',theme.dim);
  root.style.setProperty('--accent-2',theme.accent2);
  root.style.setProperty('--accent-3',theme.accent3);
  root.style.setProperty('--accent-gradient',theme.gradient);
  root.style.setProperty('--profile-color',theme.accent);
  root.style.setProperty('--bg',theme.bg);
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.setAttribute('content',theme.bg);
}
function timerColorForProfile(){
  return window.TimerShell.colorForProfile(profile);
}
function applyTimerColor(){
  window.TimerShell.applyColor(profile);
}
function setTimerPresetColor(key){
  if(!window.TimerShell.setPresetColorKey(key))return;
  applyTimerColor();
  renderTimerColorPreset();
}
function setTimerSkin(key){
  if(!window.TimerShell.setSkinKey(key))return;
  applyTimerSkin();
  window.TimerShell.renderImmersiveSkinPreset(escapeHTML);
}
function applyTimerSkin(){
  const view=document.getElementById('immersive-timer');
  if(!view||!window.TimerShell)return;
  const skin=window.TimerShell.getSkinKey();
  view.classList.remove('skin-watch','skin-chrono','skin-minimal');
  view.classList.add('skin-'+skin);
}
function renderTimerColorPreset(){
  window.TimerShell.renderColorPreset({escapeHTML});
}
function isManualTimerMode(){
  return window.TimerShell.isManualMode(timer);
}
function updateTimerModeSwitch(){
  const manual=isManualTimerMode();
  const manualBtn=document.getElementById('timer-mode-manual');
  const exerciseBtn=document.getElementById('timer-mode-exercise');
  if(manualBtn){
    manualBtn.classList.toggle('active',manual);
    manualBtn.setAttribute('aria-selected',manual?'true':'false');
  }
  if(exerciseBtn){
    exerciseBtn.classList.toggle('active',!manual);
    exerciseBtn.setAttribute('aria-selected',!manual?'true':'false');
  }
}
function activateManualTimerMode(){
  clearInterval(timer.interval);
  guidedSession=null;
  setTimerState(timerTune.effort||90,'Chrono libre','PRÊT',null,timerTune.rest||0,null);
  timer.phase='manual';
  timer.exercise=null;
  timer.exerciseData=null;
  timer.circuit=null;
  timer.circuitIndex=0;
  timer.sourceDay=null;
  timer.sourceIndex=null;
  timer.freeMode=true;
  timer.guided=false;
  timer.running=false;
  timer.pendingStart=false;
  updateTimerModeSwitch();
  updateSessionRunner();
  updateTimerDetails();
  updateTimer();
  saveAppState();
}
function activateExerciseTimerMode(){
  if(timer.running || hasActiveTimerSession())return;
  timer.phase='effort';
  timer.freeMode=false;
  updateTimerModeSwitch();
  updateTimerDetails();
  updateTimer();
  previewSelectedTimerExercise();
}
function openImmersiveTimer(){
  window.TimerShell.openImmersive();
  syncImmersiveTimer();
}
function closeImmersiveTimer(){
  window.TimerShell.closeImmersive();
}
function immersiveToggleTimer(){
  toggleTimer();
  syncImmersiveTimer();
  setTimeout(syncImmersiveTimer,0);
}
function immersiveRestartTimer(){
  restartCurrentTimer();
  syncImmersiveTimer();
  setTimeout(syncImmersiveTimer,0);
}
function immersiveTimerTitle(){
  return window.TimerShell.immersiveTitle(timer,guidedSession);
}
function immersiveTimerSubtitle(){
  return window.TimerShell.immersiveSubtitle(timer,guidedSession);
}
function normalizeLabel(value){
  return window.TimerShell.normalizeLabel(value);
}
function syncImmersiveTimer(){
  const view=document.getElementById('immersive-timer');
  if(!view || view.hidden)return;
  const total=timer.totalPhase||timer.seconds||1;
  const done=Math.min(100,Math.max(0,Math.round(((total-timer.left)/total)*100)));
  const title=immersiveTimerTitle();
  const subtitle=immersiveTimerSubtitle();
  const status=timerStatusLabel ? timerStatusLabel() : 'Prêt';
  const phase=timerPhaseLabel ? timerPhaseLabel() : 'En attente';
  const time=document.getElementById('immersive-time');
  const titleEl=document.getElementById('immersive-title');
  const subtitleEl=document.getElementById('immersive-subtitle');
  const statusEl=document.getElementById('immersive-status');
  const stepEl=document.getElementById('immersive-step');
  const pctEl=document.getElementById('immersive-percent');
  const fill=document.getElementById('immersive-fill');
  const ring=document.getElementById('immersive-ring');
  const main=document.getElementById('immersive-main-btn');
  const restart=document.getElementById('immersive-restart-btn');
  applyTimerSkin();
  window.TimerShell.renderImmersiveSkinPreset(escapeHTML);
  view.classList.toggle('running',timer.running);
  view.classList.toggle('paused',!timer.running&&hasActiveTimerSession());
  if(time)time.textContent=fmt(timer.left);
  if(titleEl)titleEl.textContent=title;
  if(subtitleEl)subtitleEl.textContent=subtitle;
  if(statusEl)statusEl.textContent=status;
  if(statusEl)statusEl.hidden=normalizeLabel(status)===normalizeLabel(title);
  if(subtitleEl)subtitleEl.hidden=normalizeLabel(subtitle)===normalizeLabel(title);
  if(stepEl)stepEl.textContent=phase;
  if(pctEl)pctEl.textContent=done+'%';
  if(fill)fill.style.width=done+'%';
  if(ring)ring.style.setProperty('--timer-progress',done+'%');
  if(main){
    main.textContent=timer.running?'Pause':(hasActiveTimerSession()?'Reprendre':'Commencer');
    main.classList.toggle('running',timer.running);
    main.setAttribute('aria-label',main.textContent+' le minuteur');
  }
  if(restart){
    const showRestart=canRestartTimer() && !timer.running && (hasActiveTimerSession() || timer.left===0 || timer.phase==='manual');
    restart.classList.toggle('hidden',!showRestart);
    restart.disabled=!showRestart;
  }
}
function setColorTheme(key){
  if(!COLOR_THEMES[key])return;
  storageSafe.setItem('vv-color-theme',key);
  applyColorTheme(key);
  applyTimerColor();
  if(currentTab==='options' && typeof renderOptions==='function')renderOptions();
}
function colorThemeOptionsHTML(){
  return '<div class="theme-grid">'+Object.entries(COLOR_THEMES).map(([key,theme])=>
    '<button class="theme-choice '+(colorThemeKey===key?'active':'')+'" type="button" data-action="set-theme" data-theme="'+key+'" aria-pressed="'+(colorThemeKey===key?'true':'false')+'" style="--swatch:'+theme.accent+';--swatch-gradient:'+theme.gradient+'">'+
      '<span class="theme-swatch" aria-hidden="true"></span>'+
      '<span class="theme-choice-copy"><strong>'+escapeHTML(theme.label)+'</strong></span>'+
    '</button>'
  ).join('')+'</div>';
}
let currentTab=storageSafe.getItem('vv-current-tab')||'program';
let programView=storageSafe.getItem('vv-program-view')||'today';
if(currentTab==='today'||currentTab==='week'){
  programView=currentTab;
  currentTab='program';
}


window.addEventListener('error',
function(event){
  try{
    document.body.innerHTML = '<div style="padding:20px;color:#f0ede6;background:#111;min-height:100vh;font-family:system-ui"><h2>vV Sport</h2><p>Une erreur a bloqué le lancement.</p><pre style="white-space:pre-wrap;color:#ff8a8a;font-size:12px">'+String(event.message||'Erreur inconnue')+'</pre></div>';
  }catch(e){}
});
function vvFatalError(message){
  try{
    document.body.innerHTML = '<div style="padding:20px;color:#f0ede6;background:#111;min-height:100vh;font-family:system-ui"><h2>vV Sport</h2><p>'+message+'</p></div>';
  }catch(e){}
}

const LEVELS={debutant:{label:'Débutant',sub:'Effort plus court, repos plus long',factor:.75,rest:1.35},medium:{label:'Medium',sub:'Équilibre intensité/récupération',factor:1,rest:1},expert:{label:'Expert',sub:'Effort plus long, repos court',factor:1.25,rest:.65},perso:{label:'Perso',sub:'Questionnaire + programme adapté',factor:1.08,rest:1.05}};
const MODES={classique:{label:'Ancien mode',sub:'Poids du corps'},anneaux:{label:'Anneaux',sub:'Force, stabilité, gainage'},supports:{label:'Supports de pompes',sub:'Amplitude, poignets, épaules'}};
const DUR={compose:{effort:40,rest:90},isolation:{effort:35,rest:60},abdos:{effort:35,rest:45},gainage:{effort:45,rest:45},mobilite:{effort:45,rest:20},repos:{effort:0,rest:0}};
const PERSONAL={name:'Vincent',age:38,weight:72,height:178,goal:'Prise musculaire',pushups:30,pullups:5,plank:90};
const CUSTOM_PROFILE_DEFAULT={
  name:'',
  age:'',
  weight:'',
  height:'',
  goal:'muscle',
  experience:'intermediate',
  sessions:'4',
  sessionTime:'45',
  pushups:'10',
  pullups:'0',
  plank:'30',
  focus:'balanced',
  limitation:'none'
};
function loadCustomProfile(){
  try{
    const profiles=loadCustomProfiles();
    const activeId=storageSafe.getItem('vv-active-custom-profile');
    const active=profiles.find(p=>p.id===activeId) || profiles[0];
    return {...CUSTOM_PROFILE_DEFAULT,...(active||{})};
  }catch(e){
    return {...CUSTOM_PROFILE_DEFAULT};
  }
}
function profileDisplayName(p){
  return (p&&p.name&&p.name.trim()) ? p.name.trim() : 'Profil perso';
}
function createProfileId(){
  return 'profile-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);
}
function loadCustomProfiles(){
  try{
    const saved=JSON.parse(storageSafe.getItem('vv-custom-profiles')||'[]');
    if(Array.isArray(saved)&&saved.length)return saved.map(p=>({...CUSTOM_PROFILE_DEFAULT,...p}));
  }catch(e){}
  try{
    const legacy=JSON.parse(storageSafe.getItem('vv-custom-profile')||'null');
    if(legacy){
      const migrated={...CUSTOM_PROFILE_DEFAULT,...legacy,id:createProfileId()};
      storageSafe.setItem('vv-custom-profiles',JSON.stringify([migrated]));
      storageSafe.setItem('vv-active-custom-profile',migrated.id);
      return [migrated];
    }
  }catch(e){}
  const initial={...CUSTOM_PROFILE_DEFAULT,id:createProfileId(),name:'vv'};
  storageSafe.setItem('vv-custom-profiles',JSON.stringify([initial]));
  storageSafe.setItem('vv-active-custom-profile',initial.id);
  return [initial];
}
function saveCustomProfiles(list){
  storageSafe.setItem('vv-custom-profiles',JSON.stringify(list));
}
let customProfile=loadCustomProfile();
let customProfileOpen=storageSafe.getItem('vv-custom-profile-open')==='1';

const CIRCUITS={
  'Circuit complet':[
    {name:'Pompes profondes ou ring push-ups',effort:40,rest:20},
    {name:'Squats / Bulgarian split squat',effort:45,rest:20},
    {name:'Rowing anneaux ou haltères',effort:40,rest:20},
    {name:'Gainage',effort:45,rest:60}
  ],
  'Circuit poids du corps':[
    {name:'Pompes',effort:30,rest:20},
    {name:'Squats',effort:35,rest:20},
    {name:'Mountain climbers',effort:30,rest:20},
    {name:'Gainage',effort:35,rest:60}
  ],
  'Circuit supports':[
    {name:'Pompes profondes supports',effort:40,rest:20},
    {name:'Shoulder taps',effort:35,rest:20},
    {name:'Squats',effort:45,rest:20},
    {name:'Gainage',effort:45,rest:60}
  ],
  'Circuit anneaux':[
    {name:'Ring rows',effort:40,rest:20},
    {name:'Ring push-ups',effort:40,rest:20},
    {name:'Support hold',effort:25,rest:25},
    {name:'Knee raises',effort:35,rest:60}
  ],
  'Finisher épaules/bras 5 kg':[
    {name:'Élévations latérales',effort:35,rest:15},
    {name:'Curl haltères',effort:35,rest:15},
    {name:'Extension triceps',effort:35,rest:45}
  ],
  'Finisher abdos':[
    {name:'Crunch',effort:35,rest:15},
    {name:'Relevés de jambes',effort:35,rest:15},
    {name:'Gainage',effort:40,rest:45}
  ],
  'Abdos finisher':[
    {name:'Crunch',effort:35,rest:15},
    {name:'Relevés de jambes',effort:35,rest:15},
    {name:'Mountain climbers',effort:35,rest:45}
  ]
};
function attachCircuit(ex){
  const key=Object.keys(CIRCUITS).find(k=>(ex.name||'').toLowerCase().includes(k.toLowerCase()));
  if(key){
    ex.circuit=CIRCUITS[key].map(step=>({
      ...step,
      effort:scaleSeconds(step.effort,false),
      rest:scaleSeconds(step.rest,true)
    }));
  }
  return ex;
}
function normalizeCircuits(p){
  Object.values(p).forEach(day=>day.exercises.forEach(attachCircuit));
  return p;
}

const SVGS={
default:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="12" y1="82" x2="148" y2="82"/>
  <g class="move-breathe">
    <circle class="joint" cx="80" cy="18" r="8"/>
    <line class="body-line" x1="80" y1="27" x2="80" y2="56"/>
    <line class="body-line" x1="80" y1="39" x2="52" y2="52"/>
    <line class="body-line" x1="80" y1="39" x2="108" y2="52"/>
    <line class="body-line" x1="80" y1="56" x2="62" y2="79"/>
    <line class="body-line" x1="80" y1="56" x2="98" y2="79"/>
  </g>
</svg>`,
push:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="10" y1="82" x2="150" y2="82"/>
  <g class="move-press">
    <line class="body-line" x1="26" y1="56" x2="123" y2="56"/>
    <circle class="joint" cx="132" cy="52" r="8"/>
    <line class="body-line" x1="101" y1="56" x2="90" y2="80"/>
    <line class="body-line" x1="43" y1="56" x2="25" y2="76"/>
    <line class="body-line" x1="28" y1="56" x2="17" y2="68"/>
  </g>
</svg>`,
pike:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="10" y1="82" x2="150" y2="82"/>
  <g class="move-press">
    <circle class="joint" cx="112" cy="57" r="7"/>
    <line class="body-line" x1="106" y1="61" x2="78" y2="36"/>
    <line class="body-line" x1="78" y1="36" x2="48" y2="78"/>
    <line class="body-line" x1="96" y1="62" x2="88" y2="80"/>
    <line class="body-line" x1="48" y1="78" x2="28" y2="80"/>
    <line class="guide" x1="112" y1="65" x2="112" y2="78"/>
  </g>
</svg>`,
rings:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="16" y1="86" x2="144" y2="86"/>
  <line x1="45" y1="0" x2="45" y2="7" stroke="#888" stroke-width="2"/>
  <line x1="115" y1="0" x2="115" y2="7" stroke="#888" stroke-width="2"/>
  <circle cx="45" cy="14" r="8" fill="none" stroke="#c8f060" stroke-width="2.5"/>
  <circle cx="115" cy="14" r="8" fill="none" stroke="#c8f060" stroke-width="2.5"/>
  <g class="move-pull">
    <circle class="joint" cx="80" cy="34" r="8"/>
    <line class="body-line" x1="80" y1="42" x2="80" y2="65"/>
    <line class="body-line" x1="80" y1="49" x2="45" y2="23"/>
    <line class="body-line" x1="80" y1="49" x2="115" y2="23"/>
    <line class="body-line" x1="80" y1="65" x2="64" y2="84"/>
    <line class="body-line" x1="80" y1="65" x2="96" y2="84"/>
  </g>
</svg>`,
row:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="10" y1="82" x2="150" y2="82"/>
  <g class="move-pull">
    <circle class="joint" cx="118" cy="42" r="8"/>
    <line class="body-line" x1="110" y1="46" x2="70" y2="62"/>
    <line class="body-line" x1="70" y1="62" x2="34" y2="78"/>
    <line class="body-line" x1="88" y1="55" x2="76" y2="78"/>
    <line class="body-line" x1="95" y1="50" x2="130" y2="28"/>
    <line class="body-line" x1="95" y1="50" x2="132" y2="55"/>
  </g>
  <rect x="126" y="22" width="14" height="14" rx="2" fill="#c8f060"/>
</svg>`,
pull:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <rect x="24" y="8" width="112" height="5" rx="2.5" fill="#888"/>
  <circle cx="62" cy="16" r="3.5" fill="#c8f060"/>
  <circle cx="98" cy="16" r="3.5" fill="#c8f060"/>
  <g class="move-up">
    <circle class="joint" cx="80" cy="31" r="8"/>
    <line class="body-line" x1="80" y1="39" x2="80" y2="66"/>
    <line class="body-line" x1="80" y1="39" x2="62" y2="16"/>
    <line class="body-line" x1="80" y1="39" x2="98" y2="16"/>
    <line class="body-line" x1="80" y1="66" x2="64" y2="84"/>
    <line class="body-line" x1="80" y1="66" x2="96" y2="84"/>
  </g>
</svg>`,
dip:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="10" y1="82" x2="150" y2="82"/>
  <line x1="48" y1="34" x2="48" y2="82" stroke="#888" stroke-width="3"/>
  <line x1="112" y1="34" x2="112" y2="82" stroke="#888" stroke-width="3"/>
  <g class="move-down">
    <circle class="joint" cx="80" cy="26" r="8"/>
    <line class="body-line" x1="80" y1="34" x2="80" y2="58"/>
    <line class="body-line" x1="80" y1="42" x2="50" y2="36"/>
    <line class="body-line" x1="80" y1="42" x2="110" y2="36"/>
    <line class="body-line" x1="80" y1="58" x2="66" y2="80"/>
    <line class="body-line" x1="80" y1="58" x2="96" y2="80"/>
  </g>
</svg>`,
plank:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="10" y1="78" x2="150" y2="78"/>
  <g class="move-breathe">
    <line class="body-line" x1="34" y1="58" x2="128" y2="58"/>
    <circle class="joint" cx="137" cy="54" r="8"/>
    <line class="body-line" x1="55" y1="58" x2="48" y2="78"/>
    <line class="body-line" x1="72" y1="58" x2="65" y2="78"/>
    <line class="body-line" x1="34" y1="58" x2="22" y2="70"/>
    <line class="body-line" x1="34" y1="58" x2="16" y2="67"/>
  </g>
  <line class="guide" x1="24" y1="50" x2="139" y2="50"/>
</svg>`,
hollow:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="12" y1="78" x2="148" y2="78"/>
  <g class="move-breathe">
    <path class="body-line" d="M35 68 Q78 46 122 68"/>
    <circle class="joint" cx="130" cy="63" r="8"/>
    <line class="body-line" x1="40" y1="68" x2="22" y2="56"/>
    <line class="body-line" x1="42" y1="68" x2="18" y2="70"/>
    <line class="body-line" x1="112" y1="62" x2="146" y2="50"/>
  </g>
</svg>`,
core:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="12" y1="80" x2="148" y2="80"/>
  <g class="move-legraise">
    <path class="body-line" d="M28 68 Q80 48 132 68"/>
    <circle class="joint" cx="136" cy="63" r="8"/>
    <line class="body-line" x1="32" y1="68" x2="16" y2="58"/>
    <line class="body-line" x1="50" y1="68" x2="92" y2="48"/>
    <line class="body-line" x1="50" y1="68" x2="98" y2="56"/>
  </g>
</svg>`,
mountain:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="10" y1="82" x2="150" y2="82"/>
  <g class="move-mountain">
    <line class="body-line" x1="36" y1="55" x2="124" y2="55"/>
    <circle class="joint" cx="132" cy="51" r="8"/>
    <line class="body-line" x1="104" y1="55" x2="91" y2="80"/>
    <line class="body-line" x1="58" y1="55" x2="78" y2="78"/>
    <line class="body-line" x1="42" y1="55" x2="25" y2="74"/>
  </g>
</svg>`,
legs:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="12" y1="82" x2="148" y2="82"/>
  <g class="move-squat">
    <circle class="joint" cx="80" cy="18" r="8"/>
    <line class="body-line" x1="80" y1="27" x2="80" y2="55"/>
    <line class="body-line" x1="80" y1="38" x2="54" y2="51"/>
    <line class="body-line" x1="80" y1="38" x2="106" y2="51"/>
    <line class="body-line" x1="80" y1="55" x2="58" y2="80"/>
    <line class="body-line" x1="80" y1="55" x2="108" y2="78"/>
  </g>
</svg>`,
split:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="12" y1="82" x2="148" y2="82"/>
  <rect x="104" y="62" width="32" height="10" rx="3" fill="#555"/>
  <g class="move-squat">
    <circle class="joint" cx="76" cy="18" r="8"/>
    <line class="body-line" x1="76" y1="27" x2="78" y2="55"/>
    <line class="body-line" x1="76" y1="38" x2="52" y2="50"/>
    <line class="body-line" x1="76" y1="38" x2="100" y2="50"/>
    <line class="body-line" x1="78" y1="55" x2="56" y2="80"/>
    <line class="body-line" x1="78" y1="55" x2="112" y2="66"/>
  </g>
</svg>`,
db:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="12" y1="82" x2="148" y2="82"/>
  <circle class="joint" cx="80" cy="18" r="8"/>
  <line class="body-line" x1="80" y1="27" x2="80" y2="58"/>
  <line class="body-line" x1="80" y1="58" x2="62" y2="80"/>
  <line class="body-line" x1="80" y1="58" x2="98" y2="80"/>
  <g class="move-shoulder">
    <line class="body-line" x1="80" y1="38" x2="42" y2="38"/>
    <line class="body-line" x1="80" y1="38" x2="118" y2="38"/>
    <rect x="30" y="32" width="12" height="12" rx="2" fill="#c8f060"/>
    <rect x="118" y="32" width="12" height="12" rx="2" fill="#c8f060"/>
  </g>
</svg>`,
curl:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="12" y1="82" x2="148" y2="82"/>
  <circle class="joint" cx="80" cy="18" r="8"/>
  <line class="body-line" x1="80" y1="27" x2="80" y2="58"/>
  <line class="body-line" x1="80" y1="58" x2="62" y2="80"/>
  <line class="body-line" x1="80" y1="58" x2="98" y2="80"/>
  <line class="body-line" x1="80" y1="38" x2="58" y2="52"/>
  <g class="move-curl">
    <line class="body-line" x1="102" y1="38" x2="112" y2="60"/>
    <rect x="108" y="58" width="12" height="12" rx="2" fill="#c8f060"/>
  </g>
</svg>`,
triceps:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="12" y1="82" x2="148" y2="82"/>
  <circle class="joint" cx="80" cy="18" r="8"/>
  <line class="body-line" x1="80" y1="27" x2="80" y2="58"/>
  <line class="body-line" x1="80" y1="58" x2="62" y2="80"/>
  <line class="body-line" x1="80" y1="58" x2="98" y2="80"/>
  <line class="body-line" x1="80" y1="34" x2="96" y2="24"/>
  <g class="move-curl">
    <line class="body-line" x1="96" y1="24" x2="112" y2="18"/>
    <rect x="110" y="13" width="12" height="12" rx="2" fill="#c8f060"/>
  </g>
</svg>`,
scap:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="10" y1="82" x2="150" y2="82"/>
  <g class="move-scap">
    <line class="body-line" x1="28" y1="55" x2="125" y2="55"/>
    <circle class="joint" cx="134" cy="51" r="8"/>
    <line class="body-line" x1="104" y1="55" x2="92" y2="80"/>
    <line class="body-line" x1="45" y1="55" x2="28" y2="78"/>
  </g>
  <line class="guide" x1="75" y1="48" x2="102" y2="48"/>
</svg>`,
cardio:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="12" y1="82" x2="148" y2="82"/>
  <g class="move-run">
    <circle class="joint" cx="82" cy="20" r="8"/>
    <line class="body-line" x1="82" y1="28" x2="70" y2="54"/>
    <line class="body-line" x1="74" y1="40" x2="48" y2="48"/>
    <line class="body-line" x1="74" y1="40" x2="100" y2="50"/>
    <line class="body-line" x1="70" y1="54" x2="48" y2="78"/>
    <line class="body-line" x1="70" y1="54" x2="104" y2="74"/>
  </g>
  <path class="guide" d="M116 30 H145M108 44 H140M118 58 H150"/>
</svg>`,
mobility:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <circle class="joint" cx="80" cy="22" r="8"/>
  <line class="body-line" x1="80" y1="30" x2="80" y2="62"/>
  <line class="body-line" x1="80" y1="62" x2="62" y2="82"/>
  <line class="body-line" x1="80" y1="62" x2="98" y2="82"/>
  <path class="guide move-breathe" d="M80 40 Q112 18 116 50 Q118 69 80 52"/>
  <path class="guide move-breathe" d="M80 40 Q48 18 44 50 Q42 69 80 52"/>
</svg>`,
rest:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <text class="move-breathe" x="56" y="38" font-size="22" fill="#c8f060" opacity=".8" font-family="sans-serif" font-weight="bold">Z</text>
  <text x="82" y="25" font-size="16" fill="#c8f060" opacity=".5" font-family="sans-serif" font-weight="bold">Z</text>
  <line class="floor" x1="20" y1="75" x2="130" y2="75"/>
  <line class="body-line" x1="30" y1="75" x2="115" y2="75"/>
  <circle class="joint" cx="122" cy="70" r="8"/>
</svg>`,
ring_push:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="12" y1="84" x2="148" y2="84"/>
  <line x1="45" y1="0" x2="45" y2="22" stroke="#888" stroke-width="2"/>
  <line x1="115" y1="0" x2="115" y2="22" stroke="#888" stroke-width="2"/>
  <circle cx="45" cy="29" r="8" fill="none" stroke="#c8f060" stroke-width="2.5"/>
  <circle cx="115" cy="29" r="8" fill="none" stroke="#c8f060" stroke-width="2.5"/>
  <g class="move-ring-push">
    <circle class="joint" cx="130" cy="53" r="7"/>
    <line class="body-line" x1="122" y1="56" x2="44" y2="57"/>
    <line class="body-line" x1="66" y1="57" x2="45" y2="37"/>
    <line class="body-line" x1="104" y1="56" x2="115" y2="37"/>
    <line class="body-line" x1="47" y1="57" x2="26" y2="80"/>
    <line class="body-line" x1="40" y1="57" x2="18" y2="72"/>
  </g>
</svg>`,
ring_row:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="12" y1="84" x2="148" y2="84"/>
  <line x1="42" y1="0" x2="42" y2="20" stroke="#888" stroke-width="2"/>
  <line x1="118" y1="0" x2="118" y2="20" stroke="#888" stroke-width="2"/>
  <circle cx="42" cy="28" r="8" fill="none" stroke="#c8f060" stroke-width="2.5"/>
  <circle cx="118" cy="28" r="8" fill="none" stroke="#c8f060" stroke-width="2.5"/>
  <g class="move-ring-row">
    <circle class="joint" cx="118" cy="48" r="7"/>
    <line class="body-line" x1="110" y1="51" x2="38" y2="70"/>
    <line class="body-line" x1="92" y1="56" x2="42" y2="36"/>
    <line class="body-line" x1="98" y1="54" x2="118" y2="36"/>
    <line class="body-line" x1="42" y1="70" x2="20" y2="82"/>
    <line class="body-line" x1="52" y1="68" x2="32" y2="84"/>
  </g>
</svg>`,
ring_support:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="12" y1="84" x2="148" y2="84"/>
  <line x1="52" y1="0" x2="52" y2="31" stroke="#888" stroke-width="2"/>
  <line x1="108" y1="0" x2="108" y2="31" stroke="#888" stroke-width="2"/>
  <circle cx="52" cy="38" r="8" fill="none" stroke="#c8f060" stroke-width="2.5"/>
  <circle cx="108" cy="38" r="8" fill="none" stroke="#c8f060" stroke-width="2.5"/>
  <g class="move-ring-support">
    <circle class="joint" cx="80" cy="18" r="7"/>
    <line class="body-line" x1="80" y1="26" x2="80" y2="58"/>
    <line class="body-line" x1="80" y1="38" x2="52" y2="46"/>
    <line class="body-line" x1="80" y1="38" x2="108" y2="46"/>
    <line class="body-line" x1="80" y1="58" x2="64" y2="83"/>
    <line class="body-line" x1="80" y1="58" x2="96" y2="83"/>
  </g>
</svg>`,
knee_raise:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <rect x="30" y="8" width="100" height="5" rx="2.5" fill="#888"/>
  <circle cx="65" cy="16" r="3.5" fill="#c8f060"/>
  <circle cx="95" cy="16" r="3.5" fill="#c8f060"/>
  <circle class="joint" cx="80" cy="29" r="8"/>
  <line class="body-line" x1="80" y1="37" x2="80" y2="61"/>
  <line class="body-line" x1="80" y1="38" x2="65" y2="16"/>
  <line class="body-line" x1="80" y1="38" x2="95" y2="16"/>
  <g class="move-knee-raise">
    <line class="body-line" x1="80" y1="61" x2="57" y2="76"/>
    <line class="body-line" x1="80" y1="61" x2="105" y2="73"/>
  </g>
</svg>`,
crunch:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="12" y1="78" x2="148" y2="78"/>
  <g class="move-crunch">
    <circle class="joint" cx="108" cy="57" r="8"/>
    <path class="body-line" d="M42 72 Q78 54 105 61"/>
    <line class="body-line" x1="48" y1="72" x2="28" y2="67"/>
    <line class="body-line" x1="52" y1="72" x2="74" y2="77"/>
    <line class="body-line" x1="74" y1="77" x2="92" y2="77"/>
    <line class="body-line" x1="104" y1="62" x2="126" y2="52"/>
  </g>
</svg>`,
shoulder_tap:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="10" y1="82" x2="150" y2="82"/>
  <line class="body-line" x1="34" y1="57" x2="124" y2="57"/>
  <circle class="joint" cx="134" cy="53" r="8"/>
  <line class="body-line" x1="104" y1="57" x2="92" y2="80"/>
  <line class="body-line" x1="45" y1="57" x2="26" y2="79"/>
  <g class="move-shoulder-tap">
    <line class="body-line" x1="76" y1="57" x2="112" y2="49"/>
  </g>
  <line class="guide" x1="112" y1="46" x2="130" y2="46"/>
</svg>`,
lateral_raise:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="12" y1="82" x2="148" y2="82"/>
  <circle class="joint" cx="80" cy="18" r="8"/>
  <line class="body-line" x1="80" y1="27" x2="80" y2="58"/>
  <line class="body-line" x1="80" y1="58" x2="62" y2="80"/>
  <line class="body-line" x1="80" y1="58" x2="98" y2="80"/>
  <g class="move-lateral-raise">
    <line class="body-line" x1="80" y1="38" x2="42" y2="38"/>
    <line class="body-line" x1="80" y1="38" x2="118" y2="38"/>
    <rect x="30" y="33" width="12" height="10" rx="2" fill="#c8f060"/>
    <rect x="118" y="33" width="12" height="10" rx="2" fill="#c8f060"/>
  </g>
</svg>`,
rkc:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="10" y1="80" x2="150" y2="80"/>
  <g class="move-rkc">
    <line class="body-line" x1="32" y1="58" x2="128" y2="58"/>
    <circle class="joint" cx="137" cy="54" r="8"/>
    <line class="body-line" x1="62" y1="58" x2="52" y2="80"/>
    <line class="body-line" x1="80" y1="58" x2="70" y2="80"/>
    <line class="body-line" x1="36" y1="58" x2="24" y2="74"/>
    <line class="body-line" x1="34" y1="58" x2="16" y2="70"/>
  </g>
  <path class="guide" d="M52 46 Q80 38 108 46" />
</svg>`,
wrist_mobility:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="12" y1="82" x2="148" y2="82"/>
  <circle class="joint" cx="80" cy="20" r="8"/>
  <line class="body-line" x1="80" y1="28" x2="80" y2="58"/>
  <line class="body-line" x1="80" y1="58" x2="62" y2="80"/>
  <line class="body-line" x1="80" y1="58" x2="98" y2="80"/>
  <line class="body-line" x1="80" y1="40" x2="54" y2="56"/>
  <g class="move-wrist">
    <line class="body-line" x1="80" y1="40" x2="111" y2="54"/>
    <circle cx="116" cy="56" r="5" fill="#c8f060" opacity=".75"/>
  </g>
</svg>`,
stretch_back:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="12" y1="82" x2="148" y2="82"/>
  <g class="move-stretch">
    <circle class="joint" cx="112" cy="58" r="8"/>
    <path class="body-line" d="M32 78 Q74 38 108 62"/>
    <line class="body-line" x1="42" y1="75" x2="22" y2="80"/>
    <line class="body-line" x1="82" y1="48" x2="118" y2="36"/>
    <line class="body-line" x1="78" y1="50" x2="124" y2="60"/>
  </g>
</svg>`,
bike:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="12" y1="82" x2="148" y2="82"/>
  <circle cx="48" cy="66" r="16" fill="none" stroke="#888" stroke-width="3"/>
  <circle cx="112" cy="66" r="16" fill="none" stroke="#888" stroke-width="3"/>
  <path d="M48 66 L72 44 L90 66 L112 66 L84 44 L72 44" fill="none" stroke="#c8f060" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="84" y1="44" x2="94" y2="33" stroke="#888" stroke-width="3" stroke-linecap="round"/>
  <line x1="70" y1="44" x2="66" y2="31" stroke="#888" stroke-width="3" stroke-linecap="round"/>
  <g class="move-bike">
    <circle class="joint" cx="88" cy="27" r="7"/>
    <line class="body-line" x1="84" y1="34" x2="73" y2="48"/>
    <line class="body-line" x1="75" y1="47" x2="90" y2="55"/>
    <line class="body-line" x1="90" y1="55" x2="91" y2="66"/>
    <line class="body-line" x1="75" y1="47" x2="62" y2="58"/>
    <line class="body-line" x1="62" y1="58" x2="54" y2="66"/>
    <line class="body-line" x1="82" y1="36" x2="96" y2="35"/>
    <line class="body-line" x1="96" y1="35" x2="108" y2="38"/>
  </g>
</svg>`,
circuit:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="10" y1="82" x2="150" y2="82"/>
  <g class="move-circuit">
    <circle cx="42" cy="26" r="7" class="joint"/>
    <line class="body-line" x1="42" y1="34" x2="42" y2="58"/>
    <line class="body-line" x1="42" y1="43" x2="24" y2="54"/>
    <line class="body-line" x1="42" y1="43" x2="60" y2="54"/>
    <line class="body-line" x1="42" y1="58" x2="30" y2="80"/>
    <line class="body-line" x1="42" y1="58" x2="54" y2="80"/>
  </g>
  <path class="guide move-circuit-arrow" d="M66 45 C78 34 92 34 104 45" fill="none" stroke="#c8f060" stroke-width="3" stroke-linecap="round"/>
  <path d="M100 36 L110 45 L100 54" fill="none" stroke="#c8f060" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <g class="move-circuit move-circuit-delay">
    <circle cx="122" cy="26" r="7" class="joint"/>
    <line class="body-line" x1="122" y1="34" x2="122" y2="58"/>
    <line class="body-line" x1="122" y1="43" x2="104" y2="54"/>
    <line class="body-line" x1="122" y1="43" x2="140" y2="54"/>
    <line class="body-line" x1="122" y1="58" x2="110" y2="80"/>
    <line class="body-line" x1="122" y1="58" x2="134" y2="80"/>
  </g>
</svg>`,
db_row:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="10" y1="82" x2="150" y2="82"/>
  <g class="move-db-row">
    <circle class="joint" cx="88" cy="34" r="8"/>
    <line class="body-line" x1="82" y1="40" x2="52" y2="58"/>
    <line class="body-line" x1="52" y1="58" x2="34" y2="80"/>
    <line class="body-line" x1="52" y1="58" x2="78" y2="80"/>
    <line class="body-line" x1="70" y1="48" x2="108" y2="54"/>
    <rect x="108" y="49" width="14" height="10" rx="2" fill="#c8f060"/>
    <line class="body-line" x1="68" y1="50" x2="44" y2="64"/>
  </g>
</svg>`,
support_hold:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="10" y1="82" x2="150" y2="82"/>
  <line x1="48" y1="36" x2="48" y2="82" stroke="#888" stroke-width="3"/>
  <line x1="112" y1="36" x2="112" y2="82" stroke="#888" stroke-width="3"/>
  <g class="move-support-hold">
    <circle class="joint" cx="80" cy="23" r="7"/>
    <line class="body-line" x1="80" y1="31" x2="80" y2="60"/>
    <line class="body-line" x1="80" y1="41" x2="50" y2="42"/>
    <line class="body-line" x1="80" y1="41" x2="110" y2="42"/>
    <line class="body-line" x1="80" y1="60" x2="66" y2="82"/>
    <line class="body-line" x1="80" y1="60" x2="96" y2="82"/>
  </g>
</svg>`,
ring_dip:`<svg viewBox="0 0 160 90" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <line class="floor" x1="12" y1="84" x2="148" y2="84"/>
  <line x1="52" y1="0" x2="52" y2="30" stroke="#888" stroke-width="2"/>
  <line x1="108" y1="0" x2="108" y2="30" stroke="#888" stroke-width="2"/>
  <circle cx="52" cy="38" r="8" fill="none" stroke="#c8f060" stroke-width="2.5"/>
  <circle cx="108" cy="38" r="8" fill="none" stroke="#c8f060" stroke-width="2.5"/>
  <g class="move-ring-dip">
    <circle class="joint" cx="80" cy="21" r="7"/>
    <line class="body-line" x1="80" y1="29" x2="80" y2="59"/>
    <line class="body-line" x1="80" y1="40" x2="52" y2="46"/>
    <line class="body-line" x1="80" y1="40" x2="108" y2="46"/>
    <line class="body-line" x1="80" y1="59" x2="65" y2="82"/>
    <line class="body-line" x1="80" y1="59" x2="95" y2="82"/>
  </g>
</svg>`
};
const BASE={
Lundi:{title:'Push – Pecs · Triceps · Épaules',duration:'55–70 min',warmup:'5 min tapis vitesse facile + rotations épaules',exercises:[
{name:'Pompes',sets:'4 × 8–15',target:'Pecs, triceps, gainage',how:'Corps droit, abdos serrés. Descends lentement puis pousse.',tips:'Ne creuse pas le dos.',svg:'push',type:'compose'},
{name:'Dips',sets:'4 × 6–12',target:'Triceps, pecs, épaules',how:'Descends doucement, coudes vers l’arrière, puis remonte.',tips:'Aide-toi si trop dur.',svg:'default',type:'compose'},
{name:'Élévations latérales',sets:'4 × 15–20',target:'Épaules',how:'Lève jusqu’aux épaules puis redescends lentement.',tips:'Pas d’élan.',svg:'db',type:'isolation'},
{name:'Planche',sets:'3 × 1 min',target:'Gainage profond',how:'Avant-bras au sol, corps droit, abdos serrés.',tips:'Ne lève pas les fesses.',svg:'plank',type:'gainage'}]},
Mardi:{title:'Pull – Dos · Biceps · Abdos',duration:'55–70 min',warmup:'5 min marche facile sur tapis',exercises:[
{name:'Tractions',sets:'4 × MAX',target:'Dos, biceps',how:'Tire le menton au-dessus de la barre, descends lentement.',tips:'Pas d’élan.',svg:'default',type:'compose'},
{name:'Rowing',sets:'4 × 10–15',target:'Dos, arrière épaules',how:'Tire vers la poitrine, serre les omoplates.',tips:'Contrôle la descente.',svg:'rings',type:'compose'},
{name:'Curl haltères',sets:'4 × 15',target:'Biceps',how:'Monte vers les épaules puis redescends lentement.',tips:'Coudes fixes.',svg:'db',type:'isolation'},
{name:'Relevés de jambes',sets:'3 × 15',target:'Bas des abdos',how:'Lève les jambes puis redescends sans toucher le sol.',tips:'Bas du dos collé.',svg:'plank',type:'abdos'}]},
Mercredi:{title:'Cardio · Abdos',duration:'45–60 min',warmup:'Marche sur tapis ou course légère',exercises:[
{name:'Crunch',sets:'3 × 20',target:'Abdos',how:'Remonte légèrement, contracte, redescends lentement.',tips:'Ne tire pas sur la nuque.',svg:'default',type:'abdos'},
{name:'Mountain climbers',sets:'4 × 35s',target:'Cardio, abdos',how:'Genoux alternés vers la poitrine.',tips:'Épaules au-dessus des mains.',svg:'push',type:'abdos'},
{name:'Gainage',sets:'3 × 1 min',target:'Core',how:'Tiens une ligne droite.',tips:'Respiration calme.',svg:'plank',type:'gainage'}]},
Jeudi:{title:'Récupération · Mobilité',duration:'20–30 min',warmup:'Respiration + mobilité douce',exercises:[
{name:'Mobilité épaules',sets:'5 min',target:'Épaules',how:'Cercles lents et amplitude progressive.',tips:'Sans douleur.',svg:'mobility',type:'mobilite'},
{name:'Étirements',sets:'10 min',target:'Récupération',how:'Respire calmement, relâche les tensions.',tips:'Ne force pas.',svg:'mobility',type:'mobilite'}]},
Vendredi:{title:'Full Body',duration:'55–70 min',warmup:'Échauffement complet',exercises:[
{name:'Pompes tempo',sets:'5 × 12',target:'Pecs, triceps',how:'Descente lente, pause courte, remontée propre.',tips:'Amplitude complète.',svg:'push',type:'compose'},
{name:'Squats',sets:'4 × 25',target:'Jambes',how:'Dos droit, genoux stables.',tips:'Contrôle la descente.',svg:'legs',type:'compose'},
{name:'Gainage dynamique',sets:'4 × 45s',target:'Core',how:'Reste gainé pendant le mouvement.',tips:'Ne cambre pas.',svg:'plank',type:'gainage'}]},
Samedi:{title:'Circuit',duration:'35–45 min',warmup:'Échauffement complet',exercises:[
{name:'Circuit complet',sets:'3 tours',target:'Tout le corps',how:'Pompes, squats, abdos, gainage.',tips:'Repos si besoin.',svg:'default',type:'compose'},
{name:'Abdos finisher',sets:'3 tours',target:'Abdos',how:'Crunch, relevés de jambes, gainage.',tips:'Qualité avant vitesse.',svg:'plank',type:'abdos'}]},
Dimanche:{title:'Repos',duration:'–',warmup:'Récupération',exercises:[
{name:'Repos',sets:'Récupération',target:'Repos',how:'Hydratation, sommeil, marche légère possible.',tips:'Indispensable pour progresser.',svg:'rest',type:'repos'}]}
};
const DAYS=window.ProgramEngine.days(BASE);
function getRealDay(){
  return window.ProgramEngine.getRealDay();
}let profile={level:storageSafe.getItem('vv-level')||'',mode:storageSafe.getItem('vv-mode')||''};
let soundEnabled=storageSafe.getItem('vv-sound')!=='0';
const SOUND_FILES={
  start:'sound-start-premium-v3.wav',
  count:'sound-count-premium-v3.wav',
  rest:'sound-rest-premium-v3.wav',
  done:'sound-done-premium-v3.wav'
};
const AUDIO_POOL={};
Object.keys(SOUND_FILES).forEach(k=>{
  const a=new Audio(SOUND_FILES[k]);
  a.preload='auto';
  a.volume=1;
  AUDIO_POOL[k]=a;
});
let equipment={
  rings:storageSafe.getItem('vv-eq-rings')!=='0',
  push:storageSafe.getItem('vv-eq-push')!=='0',
  db:storageSafe.getItem('vv-eq-db')!=='0',
  treadmill:storageSafe.getItem('vv-eq-treadmill')!=='0'
,bike:storageSafe.getItem('vv-eq-bike')!=='0'};
function toggleEquipment(k){
  equipment[k]=!equipment[k];
  storageSafe.setItem('vv-eq-'+k,equipment[k]?'1':'0');

  if(timer && !timer.running){
    timer.exercise=null;
    timer.exerciseData=null;
    timer.circuit=null;
    timer.circuitIndex=0;
  }

  guidedSession=null;
  renderEquipment();
  renderChoices();
  if(currentTab==='options'&&typeof renderOptions==='function')renderOptions();
  renderAll();
  saveAppState();
}
function renderEquipment(){
 ['rings','push','db','treadmill','bike'].forEach(k=>{
   const el=document.getElementById('toggle-'+k);
   if(el)el.classList.toggle('active',equipment[k]);
 });
}let currentDay=(typeof getRealDay==='function'?getRealDay():'Lundi');let activeTab='today';
function clone(o){return window.ProgramEngine.clone(o)}



function chooseExerciseVisual(ex){
  const n=(ex.name||'').toLowerCase();
  const hasRings=n.includes('anneaux')||n.includes('ring');
  const hasDb=n.includes('haltère')||n.includes('haltere')||n.includes('dumbbell')||n.includes('5 kg');

  if(n.includes('circuit')) return 'circuit';
  if(n.includes('poignet')) return 'wrist_mobility';
  if((n.includes('mobilité')||n.includes('mobilite')) && (n.includes('épaule')||n.includes('epaule'))) return 'mobility';
  if((n.includes('row')||n.includes('rowing')) && hasRings) return 'ring_row';
  if((n.includes('ring push') || n.includes('pompes anneaux'))) return 'ring_push';
  if(n.includes('support hold') && hasRings) return 'ring_support';
  if(n.includes('support hold')) return 'support_hold';
  if(n.includes('dips') && hasRings) return 'ring_dip';
  if(n.includes('dips')) return 'dip';
  if((n.includes('row')||n.includes('rowing')) && hasDb) return 'db_row';
  if(n.includes('traction')) return 'pull';
  if(n.includes('rowing')||n.includes('row')) return 'row';
  if(n.includes('scap')) return 'scap';
  if(n.includes('shoulder tap')) return 'shoulder_tap';
  if(n.includes('rkc')) return 'rkc';
  if(n.includes('pike')) return 'pike';
  if(n.includes('pompe')||n.includes('push')) return 'push';
  if(n.includes('hollow')) return 'hollow';
  if(n.includes('mountain')) return 'mountain';
  if(n.includes('knee raise') || n.includes('knee raises') || n.includes('relevé') || n.includes('releve') || n.includes('leg raise')) return 'knee_raise';
  if(n.includes('crunch')||n.includes('abdos')) return 'crunch';
  if(n.includes('gainage dynamique')) return 'shoulder_tap';
  if(n.includes('gainage')||n.includes('plank')||n.includes('planche')) return 'plank';
  if(n.includes('bulgarian')||n.includes('split')) return 'split';
  if(n.includes('squat')||n.includes('jambe')) return 'legs';
  if(n.includes('curl')) return 'curl';
  if(n.includes('triceps')||n.includes('extension')) return 'triceps';
  if(n.includes('élévation')||n.includes('elevation')||n.includes('latérale')||n.includes('laterale')) return 'lateral_raise';
  if(n.includes('haltère')||n.includes('haltere')||n.includes('5 kg')) return 'db';
  if(n.includes('vélo')||n.includes('velo')||n.includes('bike')) return 'bike';
  if(n.includes('tapis')||n.includes('marche')||n.includes('cardio')||n.includes('footing')) return 'cardio';
  if(n.includes('épaule')||n.includes('epaule')) return 'mobility';
  if(n.includes('étirement')||n.includes('etirement')||n.includes('dos')||n.includes('pecs')) return 'stretch_back';
  if(n.includes('mobilité')||n.includes('mobilite')) return 'mobility';
  if(n.includes('repos')) return 'rest';

  if(ex.type==='repos') return 'rest';
  if(ex.type==='mobilite') return ex.svg || 'mobility';
  if(ex.type==='gainage') return 'plank';
  if(ex.type==='abdos') return 'crunch';
  if(ex.type==='isolation') return 'lateral_raise';
  return ex.svg || 'default';
}





function cardioAlternative(eq,baseName='Cardio doux'){
  if(eq.treadmill && eq.bike)return baseName.includes('Tapis') ? baseName : 'Tapis ou vélo zone 2';
  if(eq.treadmill)return baseName.includes('Tapis') ? baseName : 'Tapis zone 2';
  if(eq.bike)return 'Vélo zone 2';
  return 'Marche dehors ou cardio léger';
}

function adaptExerciseForEquipment(ex,eq=equipment){
  const n=(ex.name||'').toLowerCase();
  const next={...ex};

  const needsRings=n.includes('ring')||n.includes('anneaux');
  const needsPush=n.includes('support')||n.includes('poignées')||n.includes('poignees');
  const needsDb=n.includes('haltère')||n.includes('haltere')||n.includes('dumbbell')||n.includes('curl')||n.includes('élévation')||n.includes('elevation');
  const needsTreadmill=n.includes('tapis');
  const needsBike=n.includes('vélo')||n.includes('velo')||n.includes('bike');
  const isCardio=needsTreadmill||needsBike||n.includes('cardio')||n.includes('zone 2');

  if(isCardio){
    if(needsTreadmill && !eq.treadmill && eq.bike){
      next.name='Vélo zone 2';
      next.how='Pédale à rythme régulier, résistance confortable. Tu dois pouvoir parler en phrases courtes.';
      next.tips='Cardio doux : l’objectif est de récupérer et construire l’endurance, pas de finir vidé.';
      next.svg='bike';
      return next;
    }

    if(needsBike && !eq.bike && eq.treadmill){
      next.name='Tapis zone 2';
      next.how='Règle la vitesse pour rester en effort modéré. Tu dois pouvoir parler en phrases courtes.';
      next.tips='Cardio doux : reste régulier, sans chercher à te cramer.';
      next.svg='cardio';
      return next;
    }

    if((needsTreadmill&&!eq.treadmill&&!eq.bike) || (needsBike&&!eq.bike&&!eq.treadmill)){
      next.name='Marche dehors ou cardio léger';
      next.how='Marche active ou cardio simple à la maison, sans impact violent.';
      next.tips='Garde un effort facile à modéré. Le but est de bouger, pas de te fatiguer.';
      next.svg='cardio';
      return next;
    }

    if(!needsTreadmill && !needsBike && !eq.treadmill && eq.bike){
      next.name='Vélo zone 2';
      next.svg='bike';
      return next;
    }

    if(!needsTreadmill && !needsBike && !eq.treadmill && !eq.bike){
      next.name='Marche dehors ou cardio léger';
      next.svg='cardio';
      return next;
    }
  }

  if(needsRings&&!eq.rings){
    if(n.includes('row')){
      next.name='Row sous table / serviette';
      next.how='Tire les coudes vers l’arrière, corps gainé. Choisis une inclinaison contrôlable.';
      next.tips='Alternative sans anneaux : garde le tirage propre et lent.';
      next.svg='row';
      return next;
    }
    if(n.includes('push')){
      next.name=eq.push?'Pompes profondes supports':'Pompes au sol tempo';
      next.how='Descends en contrôle, corps gainé. Remonte sans creuser le dos.';
      next.tips='Alternative sans anneaux : priorité à la stabilité.';
      next.svg='push';
      return next;
    }
    if(n.includes('support hold')){
      next.name='Gainage planche serré';
      next.how='Garde le corps gainé, épaules solides, respiration courte.';
      next.tips='Alternative sans anneaux pour travailler stabilité et gainage.';
      next.svg='plank';
      return next;
    }
    next.name='Alternative poids du corps';
    next.svg='default';
    return next;
  }

  if(needsPush&&!eq.push){
    next.name=next.name.replace(/supports?/ig,'au sol');
    next.how=next.how||'Réalise la version au sol, amplitude contrôlée.';
    next.tips=next.tips||'Sans supports, garde un mouvement propre et sans douleur aux poignets.';
    next.svg=chooseExerciseVisual(next);
    return next;
  }

  if(needsDb&&!eq.db){
    if(n.includes('curl')){
      next.name='Curl isométrique serviette';
      next.how='Tire contre une serviette ou bloque en isométrie, 20 à 30 secondes.';
      next.tips='Alternative sans haltères : tension continue, sans à-coup.';
      next.svg='curl';
      return next;
    }
    if(n.includes('triceps')||n.includes('extension')){
      next.name='Pompes serrées tempo';
      next.how='Mains rapprochées, descente lente, coudes près du corps.';
      next.tips='Alternative triceps sans haltères.';
      next.svg='push';
      return next;
    }
    if(n.includes('élévation')||n.includes('elevation')){
      next.name='Élévations latérales à vide tempo';
      next.how='Monte lentement jusqu’à hauteur d’épaule, pause courte, redescends lentement.';
      next.tips='Sans haltères : tempo lent et contrôle.';
      next.svg='lateral_raise';
      return next;
    }
    next.name='Alternative poids du corps';
    next.svg='default';
    return next;
  }

  next.svg=chooseExerciseVisual(next);
  return next;
}

function applyEquipmentAdaptation(p){
  Object.values(p).forEach(day=>{
    day.exercises=day.exercises.map(ex=>adaptExerciseForEquipment(ex,equipment));
  });

  if(equipment.bike && !equipment.treadmill && p.Mercredi && !p.Mercredi.exercises.some(ex=>(ex.name||'').includes('Vélo'))){
    p.Mercredi.exercises.unshift(cardioEquipmentExercise('20–30 min'));
  }

  return p;
}

function improveExerciseText(ex){
  const n=(ex.name||'').toLowerCase();

  if(n.includes('pike')){
    ex.how='Place les hanches hautes, tête entre les bras. Descends doucement le front vers le sol, puis repousse fort avec les épaules.';
    ex.tips='Ne cherche pas à aller trop bas si tu perds le contrôle. Coudes légèrement vers l’arrière, épaules solides.';
    ex.svg='pike';
  }else if(n.includes('pompe') || n.includes('push-up') || n.includes('push ups') || n.includes('ring push')){
    ex.how='Garde le corps gainé. Descends en contrôle, poitrine vers le sol ou les supports, puis repousse sans creuser le bas du dos.';
    ex.tips='Arrête-toi avant que la forme se dégrade. Une pompe propre vaut mieux que trois répétitions bâclées.';
    if(!n.includes('ring')) ex.svg='push';
  }else if(n.includes('dips')){
    ex.how='Épaules basses, buste légèrement penché. Descends seulement dans une amplitude confortable, puis remonte sans à-coup.';
    ex.tips='Si tu sens l’avant de l’épaule, réduis l’amplitude ou change d’exercice. Ne force pas si tu ressens une douleur.';
    ex.svg=n.includes('anneaux')||n.includes('ring')?'rings':'dip';
  }else if(n.includes('traction')){
    ex.how='Pars bras tendus, serre les omoplates, puis tire la poitrine vers la barre. Redescends lentement.';
    ex.tips='Garde des répétitions propres. Si tu bloques, fais moins de reps mais ajoute une descente lente.';
    ex.svg='pull';
  }else if(n.includes('rowing') || n.includes('row')){
    ex.how='Reste gainé, tire les coudes vers l’arrière et serre les omoplates. Redescends sans te relâcher.';
    ex.tips='Plus ton corps est horizontal, plus c’est dur. Choisis une inclinaison où tu contrôles vraiment le mouvement.';
    ex.svg=n.includes('anneaux')||n.includes('ring')?'rings':'row';
  }else if(n.includes('curl')){
    ex.how='Coudes près du corps. Monte sans balancer, marque un petit arrêt en haut, puis redescends lentement.';
    ex.tips='Avec léger, le tempo fait le travail : lent, propre, sans élan.';
    ex.svg='curl';
  }else if(n.includes('triceps') || n.includes('extension')){
    ex.how='Garde les coudes stables. Étends les bras en contrôle, puis reviens lentement.';
    ex.tips='Ne laisse pas les épaules prendre le dessus. Si ça tire bizarrement, réduis l’amplitude.';
    ex.svg='triceps';
  }else if(n.includes('élévation') || n.includes('elevation')){
    ex.how='Monte les bras sur les côtés jusqu’à hauteur d’épaule, contrôle une seconde, puis redescends doucement.';
    ex.tips='Pas besoin de monter plus haut. Garde les épaules basses et évite l’élan.';
    ex.svg='db';
  }else if(n.includes('bulgarian')){
    ex.how='Pied arrière posé, buste stable. Descends droit, garde le genou avant dans l’axe, puis pousse dans le pied avant.';
    ex.tips='Commence calme : l’équilibre compte autant que les reps. Ajoute de l’amplitude seulement si c’est stable.';
    ex.svg='split';
  }else if(n.includes('squat')){
    ex.how='Pieds stables, genoux dans l’axe. Descends en gardant le buste solide, puis remonte en poussant le sol.';
    ex.tips='Contrôle la descente. Si les genoux rentrent ou si le dos s’arrondit, ralentis.';
    ex.svg='legs';
  }else if(n.includes('gainage') || n.includes('plank') || n.includes('support hold')){
    ex.how='Serre les abdos et les fessiers. Garde une ligne propre des épaules aux pieds et respire court.';
    ex.tips='Stoppe avant que le bas du dos se creuse. Un bon gainage doit rester propre, pas juste durer longtemps.';
    ex.svg='plank';
  }else if(n.includes('hollow')){
    ex.how='Bas du dos collé au sol, épaules légèrement décollées. Garde les jambes tendues ou fléchies selon ton niveau.';
    ex.tips='Si le dos se décolle, rapproche les genoux. Le but est de garder la tension, pas de trembler dans tous les sens.';
    ex.svg='hollow';
  }else if(n.includes('mountain')){
    ex.how='Position pompe, épaules au-dessus des mains. Ramène les genoux en alternance sans laisser le bassin partir dans tous les sens.';
    ex.tips='Va vite seulement si tu restes propre. Sinon, ralentis et garde le gainage.';
    ex.svg='mountain';
  }else if(n.includes('scap')){
    ex.how='Bras tendus, laisse les omoplates bouger puis repousse le sol pour les écarter. Le mouvement est petit mais contrôlé.';
    ex.tips='Ne plie pas les coudes. Cherche le contrôle des épaules, pas la vitesse.';
    ex.svg='scap';
  }else if(n.includes('vélo') || n.includes('velo') || n.includes('bike')){
    ex.how='Règle une résistance confortable. Garde un rythme régulier, respiration contrôlée, sans chercher à te cramer.';
    ex.tips='Le vélo sert surtout à chauffer, récupérer ou faire du cardio doux. Tu dois pouvoir tenir l’effort proprement.';
    ex.svg='bike';
  }else if(n.includes('tapis') || n.includes('marche') || n.includes('cardio') || n.includes('footing')){
    ex.how='Règle la vitesse pour rester en effort modéré. Tu dois pouvoir parler en phrases courtes.';
    ex.tips='Le cardio doit aider ta récupération, pas te vider pour la musculation.';
    ex.svg='cardio';
  }else if(n.includes('mobilité') || n.includes('mobilite') || n.includes('poignet') || n.includes('étirement') || n.includes('etirement')){
    ex.how='Bouge lentement, sans forcer. Cherche une amplitude confortable et respire normalement.';
    ex.tips='Si ça fait mal, arrête. Le but est de te sentir mieux après, pas de gagner un concours de souplesse.';
    ex.svg='mobility';
  }else if(n.includes('circuit') || n.includes('finisher')){
    ex.how='Suis les étapes dans l’ordre. Prends les transitions calmement et garde la technique propre.';
    ex.tips='Ne transforme pas le circuit en course contre la montre. L’intensité est utile seulement si le mouvement reste correct.';
    ex.svg='default';
  }else if(n.includes('repos')){
    ex.how='Aujourd’hui, rien à forcer. Marche tranquille ou mobilité légère si tu en as envie, sinon repos complet.';
    ex.tips='Le but est simple : récupérer pour revenir frais à la prochaine séance.';
    ex.svg='rest';
  }

  ex.svg=chooseExerciseVisual(ex);
  return ex;
}
function improveProgramText(p){
  Object.values(p).forEach(day=>day.exercises.forEach(improveExerciseText));
  return p;
}

function normalizeExerciseSvg(ex){
  ex.svg=chooseExerciseVisual(ex);
  return ex;
}
function normalizeProgramSvgs(p){
  Object.values(p).forEach(day=>day.exercises.forEach(normalizeExerciseSvg));
  return p;
}

function activeLevelConfig(){
  if(profile.level!=='perso')return LEVELS[profile.level]||LEVELS.medium;
  const diff=customDifficulty();
  const adj=feedbackAdjustment();
  const base=diff==='beginner'?{factor:.82,rest:1.28}:(diff==='advanced'?{factor:1.18,rest:.82}:LEVELS.perso);
  return {factor:base.factor,rest:Math.max(.7,base.rest+adj.restShift)};
}
function scaleSeconds(s,isRest=false){if(!s)return 0;const l=activeLevelConfig();return Math.max(10,Math.round(s*(isRest?l.rest:l.factor)/5)*5)}


function cardioEquipmentExercise(minutes='25–35 min'){
  if(equipment.bike && equipment.treadmill){
    return {
      name:'Vélo ou tapis zone 2',
      sets:minutes,
      target:'Cardio, récupération',
      how:'Choisis vélo ou tapis. Reste en effort modéré : tu dois pouvoir parler en phrases courtes.',
      tips:'Cardio doux : régulier, sans te cramer, pour aider la récupération.',
      svg:'bike',
      type:'mobilite',
      effort:scaleSeconds(1200,false),
      rest:scaleSeconds(60,true)
    };
  }

  if(equipment.bike){
    return {
      name:'Vélo zone 2',
      sets:minutes,
      target:'Cardio, récupération',
      how:'Pédale à rythme régulier, résistance confortable. Tu dois pouvoir parler en phrases courtes.',
      tips:'Le vélo sert à chauffer, récupérer ou faire du cardio doux sans trop taper dans les jambes.',
      svg:'bike',
      type:'mobilite',
      effort:scaleSeconds(1200,false),
      rest:scaleSeconds(60,true)
    };
  }

  if(equipment.treadmill){
    return {
      name:'Tapis zone 2',
      sets:minutes,
      target:'Cardio, récupération',
      how:'Règle seulement la vitesse : marche rapide ou footing léger. Tu dois pouvoir parler.',
      tips:'Vitesse confortable : assez rapide pour transpirer, pas trop pour gêner la prise musculaire.',
      svg:'cardio',
      type:'mobilite',
      effort:scaleSeconds(1200,false),
      rest:scaleSeconds(60,true)
    };
  }

  return {
    name:'Marche active dehors',
    sets:minutes,
    target:'Cardio, récupération',
    how:'Marche active ou cardio léger à la maison, sans impact violent.',
    tips:'Garde un effort facile à modéré. Le but est de bouger, pas de te fatiguer.',
    svg:'cardio',
    type:'mobilite'
  };
}

function customNumber(key,fallback){
  const n=Number(customProfile&&customProfile[key]);
  return Number.isFinite(n)&&n>0?n:fallback;
}

function feedbackKey(day=currentDay){
  return 'vv-session-feedback-'+profile.level+'-'+profile.mode+'-'+day;
}

function getSessionFeedback(day=currentDay){
  try{return JSON.parse(storageSafe.getItem(feedbackKey(day))||'null')}catch(e){return null}
}

function saveSessionFeedback(value,day=currentDay){
  const payload={value,day,date:todayKey(),time:Date.now(),level:profile.level,mode:profile.mode};
  storageSafe.setItem(feedbackKey(day),JSON.stringify(payload));
  renderTimerFinishPanel();
  renderAll();
  saveAppState();
}

function recentSessionFeedback(){
  const feedback=DAYS.map(day=>getSessionFeedback(day)).filter(Boolean).sort((a,b)=>(b.time||0)-(a.time||0));
  return feedback[0]||null;
}

function feedbackAdjustment(){
  const fb=recentSessionFeedback();
  if(!fb)return {difficultyShift:0,restShift:0,avoidPain:false,value:null};
  if(fb.value==='easy')return {difficultyShift:1,restShift:-.08,avoidPain:false,value:fb.value};
  if(fb.value==='hard')return {difficultyShift:-1,restShift:.16,avoidPain:false,value:fb.value};
  if(fb.value==='pain')return {difficultyShift:-1,restShift:.22,avoidPain:true,value:fb.value};
  return {difficultyShift:0,restShift:0,avoidPain:false,value:fb.value};
}

function customDifficulty(){
  const push=customNumber('pushups',10);
  const pull=Number(customProfile&&customProfile.pullups)||0;
  const plank=customNumber('plank',30);
  const exp=(customProfile&&customProfile.experience)||'intermediate';
  let rank=2;
  if(exp==='beginner' || push<8 || plank<25)rank=1;
  if(exp==='advanced' || push>=30 || pull>=6 || plank>=90)rank=3;
  rank=Math.max(1,Math.min(3,rank+feedbackAdjustment().difficultyShift));
  return rank===1?'beginner':(rank===3?'advanced':'intermediate');
}

function customGoalLabel(){
  const goal=(customProfile&&customProfile.goal)||'muscle';
  return {muscle:'prise musculaire',strength:'force',fatloss:'perte de gras',mobility:'mobilité',general:'forme générale'}[goal]||'programme perso';
}

function customProfileSummary(){
  if(!customProfile)return 'Profil personnalisé';
  const bits=[];
  if(customProfile.name)bits.push(customProfile.name);
  bits.push(customGoalLabel());
  if(customProfile.sessionTime)bits.push(customProfile.sessionTime+' min');
  return bits.join(' · ');
}

function saveCustomProfileField(key,value){
  customProfile={...CUSTOM_PROFILE_DEFAULT,...customProfile,[key]:String(value)};
  if(!customProfile.id)customProfile.id=createProfileId();
  const profiles=loadCustomProfiles();
  const index=profiles.findIndex(p=>p.id===customProfile.id);
  if(index>=0)profiles[index]=customProfile;
  else profiles.push(customProfile);
  saveCustomProfiles(profiles);
  storageSafe.setItem('vv-active-custom-profile',customProfile.id);
  if(profile.level==='perso'){
    renderAll();
    saveAppState();
  }
}

function selectCustomProfile(id){
  const found=loadCustomProfiles().find(p=>p.id===id);
  if(!found)return;
  customProfile={...CUSTOM_PROFILE_DEFAULT,...found};
  storageSafe.setItem('vv-active-custom-profile',customProfile.id);
  renderChoices();
  if(currentTab==='options' && typeof renderOptions==='function')renderOptions();
  renderAll();
  saveAppState();
}

function createCustomProfile(){
  const profiles=loadCustomProfiles();
  const created={...CUSTOM_PROFILE_DEFAULT,id:createProfileId(),name:'Profil '+(profiles.length+1)};
  profiles.push(created);
  saveCustomProfiles(profiles);
  customProfile=created;
  customProfileOpen=true;
  storageSafe.setItem('vv-custom-profile-open','1');
  storageSafe.setItem('vv-active-custom-profile',created.id);
  profile.level='perso';
  storageSafe.setItem('vv-level','perso');
  renderChoices();
  if(currentTab==='options' && typeof renderOptions==='function')renderOptions();
  renderAll();
  saveAppState();
}

function deleteCustomProfile(id){
  const profiles=loadCustomProfiles();
  if(profiles.length<=1){
    alert('Garde au moins un profil personnalisé.');
    return;
  }
  if(!confirm('Supprimer ce profil personnalisé ?'))return;
  const nextProfiles=profiles.filter(p=>p.id!==id);
  saveCustomProfiles(nextProfiles);
  customProfile={...CUSTOM_PROFILE_DEFAULT,...nextProfiles[0]};
  storageSafe.setItem('vv-active-custom-profile',customProfile.id);
  renderChoices();
  if(currentTab==='options' && typeof renderOptions==='function')renderOptions();
  renderAll();
  saveAppState();
}

function toggleCustomProfilePanel(){
  customProfileOpen=!customProfileOpen;
  storageSafe.setItem('vv-custom-profile-open',customProfileOpen?'1':'0');
  renderChoices();
  if(currentTab==='options' && typeof renderOptions==='function')renderOptions();
}

function personalSets(base){
  const diff=customDifficulty();
  const time=customNumber('sessionTime',45);
  if(time<=30)return base.replace(/^5/g,'3').replace(/^4/g,'3');
  if(diff==='beginner')return base.replace(/^5/g,'3').replace(/^4/g,'3');
  if(diff==='advanced' && time>=55)return base.replace(/^3/g,'4').replace(/^4/g,'5');
  return base;
}

function customPushExercise(){
  const diff=customDifficulty();
  const shoulder=(customProfile.limitation==='shoulder');
  if(diff==='beginner')return {name:equipment.push?'Pompes inclinées sur supports':'Pompes inclinées ou genoux',sets:personalSets('3 × 8–12'),target:'Pecs, triceps, gainage',how:'Choisis une inclinaison qui reste propre. Corps aligné, descente contrôlée.',tips:'Garde 2 répétitions en réserve. La régularité compte plus que l’échec.',svg:'push',type:'compose'};
  if(shoulder)return {name:'Pompes tempo amplitude confortable',sets:personalSets('4 × 8–15'),target:'Pecs, triceps',how:'Descends seulement sans gêne, tempo lent, épaules basses.',tips:'Aucune douleur épaule. Réduis l’amplitude si besoin.',svg:'push',type:'compose'};
  if(equipment.rings)return {name:'Ring push-ups tempo',sets:personalSets('4 × 8–12'),target:'Pecs, triceps, stabilité',how:'Anneaux contrôlés, descente 3 sec, remontée propre.',tips:'Tension et stabilité avant vitesse.',svg:'rings',type:'compose'};
  return {name:equipment.push?'Pompes profondes supports tempo':'Pompes tempo',sets:personalSets('4 × 8–15'),target:'Pecs, triceps, gainage',how:'Descente lente, pause courte, remontée contrôlée.',tips:'Arrête 1 ou 2 reps avant de perdre la forme.',svg:'push',type:'compose'};
}

function customPullExercise(){
  const pull=Number(customProfile.pullups)||0;
  if(pull<1)return {name:equipment.rings?'Rowing anneaux facile':'Rowing haltères ou serviette',sets:personalSets('4 × 10–15'),target:'Dos, biceps',how:'Tire avec les coudes, serre les omoplates, descends lentement.',tips:'Base prioritaire avant les tractions.',svg:equipment.rings?'rings':'db',type:'compose'};
  if(pull<5)return {name:'Tractions négatives + assistées',sets:personalSets('4 × 2–4'),target:'Dos, biceps',how:'Monte avec aide, descends en 3 à 5 sec.',tips:'Peu de reps, mais propres.',svg:'pull',type:'compose'};
  return {name:'Tractions progression',sets:personalSets('5 × 3–6'),target:'Dos, biceps',how:'Tractions strictes, garde une répétition en réserve.',tips:'Objectif progression sans tricher.',svg:'pull',type:'compose'};
}

function adaptPersonalProgramToCustom(p){
  const goal=customProfile.goal||'muscle';
  const focus=customProfile.focus||'balanced';
  const limit=customProfile.limitation||'none';
  const time=customNumber('sessionTime',45);
  const sessions=customNumber('sessions',4);
  const diff=customDifficulty();

  p.Lundi.title='Perso · '+customGoalLabel()+' · Push';
  p.Lundi.duration=time<=30?'25–35 min':(time>=55?'55–70 min':'40–55 min');
  p.Lundi.exercises[0]=customPushExercise();
  if(limit==='shoulder'){
    p.Lundi.exercises[1]={name:'Pompes serrées inclinées',sets:personalSets('3 × 8–12'),target:'Triceps, pecs',how:'Mains serrées mais épaules confortables, amplitude courte si besoin.',tips:'Pas de dips si l’épaule proteste.',svg:'push',type:'compose'};
  }

  p.Mardi.title='Perso · '+(focus==='pull'?'priorité dos/tractions':'Pull équilibrage');
  p.Mardi.exercises[0]=customPullExercise();

  if(goal==='fatloss'){
    p.Mercredi.title='Perso · cardio doux + abdos';
    p.Mercredi.exercises[0]=cardioEquipmentExercise(time>=45?'30–40 min':'20–30 min');
    p.Samedi.title='Perso · circuit métabolique propre';
  }

  if(goal==='strength'){
    p.Lundi.exercises[0].sets=personalSets(diff==='advanced'?'5 × 5–8':'4 × 5–8');
    p.Mardi.exercises[0].sets=personalSets(diff==='advanced'?'5 × 3–5':'4 × 3–5');
    p.Vendredi.title='Perso · force full body';
    p.Vendredi.exercises[0]=customPushExercise();
    p.Vendredi.exercises[1].sets=personalSets('5 × 6–10 / jambe');
  }

  if(goal==='mobility' || limit==='back'){
    p.Jeudi.title='Perso · mobilité renforcée';
    p.Jeudi.exercises.unshift({name:'Respiration + mobilité hanches',sets:'8 min',target:'Dos, hanches',how:'Respiration lente, bascule bassin, ouverture de hanches douce.',tips:'Cherche le relâchement, pas la performance.',svg:'mobility',type:'mobilite'});
    p.Vendredi.exercises[1]={name:'Squats contrôlés amplitude confortable',sets:personalSets('3 × 10–15'),target:'Jambes, mobilité',how:'Descente lente, dos long, amplitude sans gêne.',tips:'Si le dos tire, réduis l’amplitude.',svg:'legs',type:'compose'};
  }

  if(focus==='core'){
    p.Mercredi.exercises.push({name:'Gainage personnalisé',sets:personalSets('3 × '+Math.max(20,customNumber('plank',30)-10)+' sec'),target:'Core',how:'Tiens propre, respiration calme, stop avant cambrure.',tips:'Le bon gainage reste aligné.',svg:'plank',type:'gainage'});
  }

  if(focus==='legs'){
    p.Vendredi.exercises.splice(2,0,{name:'Fentes arrière contrôlées',sets:personalSets('3 × 10–12 / jambe'),target:'Jambes, fessiers',how:'Grand pas arrière, buste stable, remonte en poussant dans le sol.',tips:'Genou stable, pas de rebond.',svg:'legs',type:'compose'});
  }

  if(focus==='push'){
    p.Vendredi.exercises[0]=customPushExercise();
    p.Samedi.exercises.push({name:'Finisher push propre',sets:personalSets('3 × 8–12'),target:'Pecs, triceps',how:'Pompes lentes, amplitude confortable, arrêt avant échec technique.',tips:'Volume utile, pas de reps sales.',svg:'push',type:'compose'});
  }

  if(sessions<=3){
    p.Mercredi.exercises=[cardioEquipmentExercise('20–30 min'),{name:'Mobilité complète',sets:'12 min',target:'Récupération',how:'Épaules, hanches, dos, respiration lente.',tips:'Journée légère volontaire.',svg:'mobility',type:'mobilite'}];
    p.Jeudi.exercises=[{name:'Repos actif',sets:'Récupération',target:'Repos',how:'Marche tranquille ou mobilité légère.',tips:'Jour neutre pour assimiler.',svg:'rest',type:'repos'}];
    p.Samedi.exercises=[{name:'Repos',sets:'Récupération',target:'Repos',how:'Récupère vraiment, sommeil et hydratation.',tips:'Le repos fait partie du programme.',svg:'rest',type:'repos'}];
  }else if(sessions>=5 && p.Samedi.exercises.every(ex=>ex.type!=='repos')){
    p.Samedi.title='Perso · finition ciblée';
  }

  Object.values(p).forEach(day=>day.exercises.forEach(ex=>{
    if(limit==='shoulder' && /dips|pike/i.test(ex.name||'')){
      ex.name='Alternative épaules confortables';
      ex.how='Mouvement sans douleur, amplitude courte, tempo lent.';
      ex.tips='La priorité est de garder les épaules calmes.';
      ex.svg='mobility';
    }
    if(limit==='knee' && /squat|fente|bulgarian/i.test(ex.name||'')){
      ex.name='Jambes amplitude confortable';
      ex.how='Amplitude réduite si besoin, genoux stables, contrôle lent.';
      ex.tips='Pas de douleur genou. Ajuste la profondeur.';
    }
  }));

  return p;
}

const ADAPTIVE_LIBRARY=[
  {id:'push_easy',name:'Pompes inclinées',movement:'push',target:'Pecs, triceps, gainage',svg:'push',difficulty:'beginner',goals:['muscle','general','fatloss'],how:'Mains surélevées, corps aligné, descente contrôlée.',tips:'Garde 2 répétitions propres en réserve.'},
  {id:'push_support',name:'Pompes profondes supports tempo',movement:'push',target:'Pecs, triceps',svg:'push',requires:['push'],difficulty:'intermediate',goals:['muscle','strength'],how:'Poignets neutres, descente lente, pause courte en bas.',tips:'Amplitude seulement si épaules confortables.'},
  {id:'push_rings',name:'Ring push-ups tempo',movement:'push',target:'Pecs, triceps, stabilité',svg:'rings',requires:['rings'],difficulty:'advanced',goals:['muscle','strength'],how:'Anneaux contrôlés, descente 3 sec, remontée propre.',tips:'Stabilité avant amplitude.'},
  {id:'push_safe',name:'Pompes tempo amplitude confortable',movement:'push',target:'Pecs, triceps',svg:'push',safeFor:['shoulder'],difficulty:'intermediate',goals:['muscle','general'],how:'Amplitude sans gêne, épaules basses, tempo lent.',tips:'Aucune douleur épaule.'},
  {id:'dip',name:'Dips assistés ou pompes serrées',movement:'push',target:'Triceps, pecs',svg:'dip',avoid:['shoulder'],difficulty:'advanced',goals:['strength','muscle'],how:'Descente contrôlée, épaules basses, aide si besoin.',tips:'Stop si gêne épaule.'},
  {id:'push_knee',name:'Pompes genoux tempo',movement:'push',target:'Pecs, triceps, gainage',svg:'push',safeFor:['shoulder'],difficulty:'beginner',goals:['general','muscle'],how:'Genoux au sol, bassin aligné, descends lentement puis pousse proprement.',tips:'Garde le même alignement épaules-hanches-genoux.'},
  {id:'push_close',name:'Pompes serrées inclinées',movement:'push',target:'Triceps, pecs',svg:'push',avoid:['shoulder'],difficulty:'intermediate',goals:['muscle','strength'],how:'Mains rapprochées sur support, coudes près du corps, tempo contrôlé.',tips:'Très utile pour les triceps sans forcer les épaules.'},
  {id:'pike_push',name:'Pike push-ups tempo',movement:'push',target:'Épaules, triceps',svg:'pike',avoid:['shoulder'],difficulty:'advanced',goals:['strength','muscle'],how:'Hanches hautes, tête descend vers le sol, pousse verticalement.',tips:'Amplitude courte si les épaules ne sont pas parfaitement calmes.'},
  {id:'support_hold',name:'Support hold sur supports',movement:'push',target:'Triceps, épaules, gainage',svg:'dip',requires:['push'],avoid:['shoulder'],difficulty:'intermediate',goals:['strength','general'],how:'Bras tendus sur supports, épaules basses, tiens le corps solide.',tips:'Travail de stabilité avant les dips.'},

  {id:'row_rings_easy',name:'Rowing anneaux facile',movement:'pull',target:'Dos, biceps, posture',svg:'rings',requires:['rings'],difficulty:'beginner',goals:['general','muscle'],how:'Corps plutôt vertical, tire la poitrine vers les anneaux.',tips:'Serre les omoplates.'},
  {id:'row_rings',name:'Rowing anneaux tempo',movement:'pull',target:'Dos, arrière épaules',svg:'rings',requires:['rings'],difficulty:'intermediate',goals:['muscle','strength'],how:'Tire avec les coudes, pause en haut, descente lente.',tips:'Équilibre les pompes avec du tirage.'},
  {id:'row_db',name:'Rowing haltères tempo',movement:'pull',target:'Dos, arrière épaules',svg:'db',requires:['db'],difficulty:'intermediate',goals:['muscle','general'],how:'Buste stable, coudes vers l’arrière, descente lente.',tips:'Ne tire pas avec le bas du dos.'},
  {id:'pullup_negative',name:'Tractions négatives assistées',movement:'pull',target:'Dos, biceps',svg:'pull',difficulty:'beginner',goals:['strength','muscle'],how:'Monte avec aide, descends en 3 à 5 sec.',tips:'Peu de reps, mais impeccables.'},
  {id:'pullup',name:'Tractions progression',movement:'pull',target:'Dos, biceps',svg:'pull',difficulty:'advanced',goals:['strength','muscle'],how:'Tractions strictes, garde une répétition en réserve.',tips:'Progression propre, pas d’élan.'},
  {id:'curl',name:'Curl haltères contrôlé',movement:'pull',target:'Biceps',svg:'db',requires:['db'],difficulty:'beginner',goals:['muscle'],how:'Coudes fixes, descente lente.',tips:'Le tempo rend 5 kg utiles.'},
  {id:'row_db_supported',name:'Rowing haltère appuyé',movement:'pull',target:'Dos, biceps, posture',svg:'db',requires:['db'],safeFor:['back'],difficulty:'beginner',goals:['general','muscle'],how:'Une main appuyée, dos stable, tire le coude vers la hanche.',tips:'Variante propre si le bas du dos fatigue.'},
  {id:'face_pull_rings',name:'Face pull aux anneaux',movement:'pull',target:'Arrière épaules, posture',svg:'rings',requires:['rings'],difficulty:'intermediate',goals:['general','mobility','muscle'],how:'Tire les anneaux vers le visage, coudes hauts, omoplates serrées.',tips:'Léger, précis, excellent pour la posture.'},
  {id:'scap_pull',name:'Suspension scapulaire',movement:'pull',target:'Dos, épaules basses',svg:'pull',difficulty:'intermediate',goals:['strength','mobility'],how:'Suspendu, bras tendus, descends les épaules puis relâche lentement.',tips:'Prépare les tractions sans tirer avec les bras.'},
  {id:'reverse_fly_db',name:'Oiseau haltères tempo',movement:'pull',target:'Arrière épaules, haut du dos',svg:'db',requires:['db'],difficulty:'beginner',goals:['muscle','general'],how:'Buste incliné, bras ouverts, mouvement petit et contrôlé.',tips:'Pas d’élan, pense posture.'},

  {id:'squat',name:'Squats contrôlés',movement:'legs',target:'Jambes, fessiers',svg:'legs',difficulty:'beginner',goals:['general','fatloss','muscle'],how:'Dos long, genoux stables, amplitude confortable.',tips:'Pause en bas plutôt que vitesse.'},
  {id:'split',name:'Bulgarian split squat tempo',movement:'legs',target:'Jambes, fessiers',svg:'split',avoid:['knee'],difficulty:'advanced',goals:['muscle','strength'],how:'Descente 3 sec, pause en bas, remontée forte.',tips:'Très efficace sans charge lourde.'},
  {id:'lunge_safe',name:'Jambes amplitude confortable',movement:'legs',target:'Jambes, mobilité',svg:'legs',safeFor:['knee'],difficulty:'beginner',goals:['general','mobility'],how:'Amplitude réduite si besoin, genoux stables.',tips:'Pas de douleur genou.'},
  {id:'reverse_lunge',name:'Fentes arrière contrôlées',movement:'legs',target:'Jambes, fessiers, équilibre',svg:'legs',avoid:['knee'],difficulty:'intermediate',goals:['muscle','general'],how:'Grand pas arrière, buste stable, pousse dans le sol pour remonter.',tips:'La fente arrière est souvent plus douce pour les genoux.'},
  {id:'glute_bridge',name:'Pont fessier tempo',movement:'legs',target:'Fessiers, ischios, bas du dos',svg:'legs',safeFor:['knee','back'],difficulty:'beginner',goals:['general','muscle','mobility'],how:'Talons au sol, monte le bassin, serre les fessiers 1 sec en haut.',tips:'Simple, efficace, peu stressant.'},
  {id:'calf_raise',name:'Mollets debout tempo',movement:'legs',target:'Mollets, chevilles',svg:'legs',difficulty:'beginner',goals:['general','muscle'],how:'Monte sur la pointe des pieds, pause en haut, descente lente.',tips:'Tiens un support pour rester stable.'},
  {id:'wall_sit',name:'Chaise au mur',movement:'legs',target:'Quadriceps, gainage',svg:'legs',safeFor:['back'],difficulty:'intermediate',goals:['strength','fatloss','general'],how:'Dos au mur, genoux confortables, tiens sans rebond.',tips:'Arrête avant que la posture se dégrade.'},

  {id:'plank_easy',name:'Gainage genoux ou planche courte',movement:'core',target:'Gainage profond',svg:'plank',difficulty:'beginner',goals:['general','mobility'],how:'Ligne propre, respiration calme.',tips:'Stop avant que le dos creuse.'},
  {id:'plank_rkc',name:'Gainage RKC',movement:'core',target:'Abdos, gainage',svg:'plank',difficulty:'advanced',goals:['strength','muscle'],how:'Contracte fort abdos, fessiers et quadriceps.',tips:'Court mais intense.'},
  {id:'hollow',name:'Hollow body hold',movement:'core',target:'Abdos, gainage',svg:'hollow',difficulty:'intermediate',goals:['muscle','strength'],how:'Bas du dos collé, jambes tendues si possible.',tips:'Réduis l’amplitude si tu cambres.'},
  {id:'deadbug',name:'Dead bug contrôlé',movement:'core',target:'Abdos bas, contrôle lombaire',svg:'core',difficulty:'beginner',goals:['mobility','general'],how:'Bas du dos collé, alterne bras/jambe lentement.',tips:'Très bon si le dos est sensible.'},
  {id:'side_plank',name:'Gainage latéral',movement:'core',target:'Obliques, stabilité bassin',svg:'plank',difficulty:'intermediate',goals:['general','strength','muscle'],how:'Coude sous l’épaule, corps aligné, tiens sans laisser tomber le bassin.',tips:'Commence sur les genoux si besoin.'},
  {id:'shoulder_taps',name:'Shoulder taps contrôlés',movement:'core',target:'Gainage, épaules, anti-rotation',svg:'shoulder_tap',avoid:['shoulder'],difficulty:'intermediate',goals:['general','strength'],how:'En planche, touche une épaule puis l’autre sans bouger le bassin.',tips:'Lent et stable vaut mieux que rapide.'},
  {id:'crunch_control',name:'Crunch contrôlé',movement:'core',target:'Abdos',svg:'crunch',difficulty:'beginner',goals:['general','muscle'],how:'Expire en remontant légèrement, redescends lentement.',tips:'Ne tire jamais sur la nuque.'},
  {id:'leg_raise',name:'Relevés de jambes tempo',movement:'core',target:'Abdos bas',svg:'core',avoid:['back'],difficulty:'advanced',goals:['strength','muscle'],how:'Monte contrôlé, bloque 1 sec, descends sans cambrer.',tips:'Plie les genoux si le bas du dos décolle.'},

  {id:'bike',name:'Vélo zone 2',movement:'cardio',target:'Cardio, récupération',svg:'bike',requires:['bike'],difficulty:'beginner',goals:['fatloss','general','mobility'],how:'Rythme régulier, tu dois pouvoir parler.',tips:'Cardio utile sans finir vidé.'},
  {id:'treadmill',name:'Tapis zone 2',movement:'cardio',target:'Cardio, récupération',svg:'cardio',requires:['treadmill'],difficulty:'beginner',goals:['fatloss','general'],how:'Vitesse confortable, marche rapide ou footing léger.',tips:'Zone 2 : régulier et soutenable.'},
  {id:'walk',name:'Marche active dehors',movement:'cardio',target:'Cardio, récupération',svg:'cardio',difficulty:'beginner',goals:['fatloss','general','mobility'],how:'Marche active sans impact violent.',tips:'Bouger sans te cramer.'},
  {id:'mountain',name:'Mountain climbers contrôlés',movement:'cardio',target:'Cardio, abdos',svg:'mountain',avoid:['shoulder'],difficulty:'intermediate',goals:['fatloss','general'],how:'Genoux alternés, bassin stable.',tips:'Ralentis si la technique bouge.'},
  {id:'bike_intervals',name:'Vélo intervalles doux',movement:'cardio',target:'Cardio, souffle',svg:'bike',requires:['bike'],difficulty:'intermediate',goals:['fatloss','general'],how:'Alterne 40 sec soutenu et 80 sec facile, sans sprint violent.',tips:'Tu dois finir mieux, pas explosé.'},
  {id:'treadmill_incline',name:'Marche inclinée tapis',movement:'cardio',target:'Cardio, jambes, perte de gras',svg:'cardio',requires:['treadmill'],difficulty:'beginner',goals:['fatloss','general'],how:'Inclinaison modérée, pas rapide, posture haute.',tips:'Excellent cardio sans impact de course.'},
  {id:'step_jacks',name:'Step jacks sans saut',movement:'cardio',target:'Cardio doux, coordination',svg:'cardio',safeFor:['knee'],difficulty:'beginner',goals:['fatloss','general','mobility'],how:'Un pied sort sur le côté puis revient, bras actifs, sans saut.',tips:'Option cardio quand tu veux rester doux.'},
  {id:'low_impact_circuit',name:'Circuit cardio sans impact',movement:'cardio',target:'Cardio, tout le corps',svg:'circuit',safeFor:['knee'],difficulty:'intermediate',goals:['fatloss','general'],how:'Squat partiel, marche active, gainage court, mobilité dynamique.',tips:'Rythme régulier, technique propre.'},

  {id:'shoulders',name:'Mobilité épaules',movement:'mobility',target:'Épaules',svg:'mobility',difficulty:'beginner',goals:['mobility','general'],how:'Cercles lents, rotations, ouverture thoracique.',tips:'Aucune douleur.'},
  {id:'hips',name:'Respiration + mobilité hanches',movement:'mobility',target:'Dos, hanches',svg:'mobility',safeFor:['back'],difficulty:'beginner',goals:['mobility'],how:'Respiration lente, bascule bassin, ouverture douce.',tips:'Cherche le relâchement.'},
  {id:'wrists',name:'Mobilité poignets',movement:'mobility',target:'Poignets',svg:'mobility',difficulty:'beginner',goals:['mobility','general'],how:'Flexion/extension douce, appuis progressifs.',tips:'Utile pour supports et anneaux.'},
  {id:'thoracic',name:'Mobilité thoracique',movement:'mobility',target:'Dos haut, posture',svg:'mobility',safeFor:['back','shoulder'],difficulty:'beginner',goals:['mobility','general'],how:'Rotations lentes, ouverture de poitrine, respiration calme.',tips:'Aide les pompes, rows et la posture.'},
  {id:'ankles',name:'Mobilité chevilles',movement:'mobility',target:'Chevilles, squats, marche',svg:'mobility',safeFor:['knee'],difficulty:'beginner',goals:['mobility','general'],how:'Genou avance doucement vers l’avant, talon au sol.',tips:'Utile pour les squats et les fentes.'},
  {id:'hamstrings',name:'Mobilité ischios douce',movement:'mobility',target:'Arrière des jambes, bas du dos',svg:'mobility',safeFor:['back'],difficulty:'beginner',goals:['mobility'],how:'Étirements actifs courts, dos long, respiration lente.',tips:'Ne force pas, cherche de la fluidité.'}
];

function adaptiveContext(){
  const diff=customDifficulty();
  const feedback=feedbackAdjustment();
  return {
    goal:customProfile.goal||'muscle',
    focus:customProfile.focus||'balanced',
    limitation:feedback.avoidPain ? 'shoulder' : (customProfile.limitation||'none'),
    feedback:feedback.value,
    avoidPain:feedback.avoidPain,
    sessions:customNumber('sessions',4),
    minutes:customNumber('sessionTime',45),
    difficulty:diff,
    pushups:customNumber('pushups',10),
    pullups:Number(customProfile.pullups)||0,
    plank:customNumber('plank',30)
  };
}

function difficultyRank(v){return {beginner:1,intermediate:2,advanced:3}[v]||2}
function equipmentOk(item){
  return !(item.requires||[]).some(k=>!equipment[k]);
}
function limitationOk(item,ctx){
  return !(item.avoid||[]).includes(ctx.limitation);
}
function adaptiveScore(item,slot,ctx,used){
  if(item.movement!==slot)return -999;
  if(!equipmentOk(item) || !limitationOk(item,ctx))return -999;
  if(used.has(item.id))return -60;
  let score=0;
  const diffGap=Math.abs(difficultyRank(item.difficulty)-difficultyRank(ctx.difficulty));
  score-=diffGap*10;
  if((item.goals||[]).includes(ctx.goal))score+=18;
  if(item.safeFor&&item.safeFor.includes(ctx.limitation))score+=28;
  if(ctx.focus===slot)score+=24;
  if(ctx.focus==='pull'&&slot==='pull')score+=12;
  if(ctx.focus==='core'&&slot==='core')score+=12;
  if(ctx.pullups<1 && item.id==='pullup_negative')score+=20;
  if(ctx.pullups>=5 && item.id==='pullup')score+=22;
  if(ctx.pushups<8 && item.id==='push_easy')score+=18;
  if(ctx.goal==='fatloss'&&slot==='cardio')score+=20;
  if(ctx.goal==='mobility'&&(slot==='mobility'||item.safeFor))score+=18;
  if(ctx.feedback==='easy' && item.difficulty==='advanced')score+=10;
  if(ctx.feedback==='hard' && item.difficulty==='beginner')score+=10;
  if(ctx.avoidPain && item.safeFor)score+=16;
  return score;
}

function chooseAdaptiveExercise(slot,ctx,used){
  const sorted=ADAPTIVE_LIBRARY
    .map(item=>({item,score:adaptiveScore(item,slot,ctx,used)}))
    .filter(x=>x.score>-900)
    .sort((a,b)=>b.score-a.score);
  const pick=(sorted[0]&&sorted[0].item) || ADAPTIVE_LIBRARY.find(x=>x.movement===slot) || ADAPTIVE_LIBRARY[0];
  used.add(pick.id);
  return makeAdaptiveExercise(pick,ctx);
}

function adaptiveSetsFor(item,ctx){
  const short=ctx.minutes<=30;
  const advanced=ctx.difficulty==='advanced';
  const strength=ctx.goal==='strength';
  if(item.movement==='cardio')return ctx.minutes>=60?'30–40 min':(short?'15–20 min':'20–30 min');
  if(item.movement==='mobility')return short?'6–8 min':'8–12 min';
  if(item.movement==='core')return advanced?'4 × 35–50 sec':(short?'2–3 × 20–35 sec':'3 × 30–45 sec');
  if(item.movement==='legs')return strength?(advanced?'5 × 6–10':'4 × 6–10'):(short?'3 × 10–12':'4 × 10–15');
  if(item.movement==='pull' && /Tractions/.test(item.name))return advanced?'5 × 3–6':'4 × 2–5';
  if(strength)return advanced?'5 × 5–8':'4 × 5–8';
  return advanced&&!short?'5 × 8–15':(short?'3 × 8–12':'4 × 8–15');
}

function makeAdaptiveExercise(item,ctx){
  const ex={
    id:item.id,
    doneKey:item.id,
    name:item.name,
    sets:adaptiveSetsFor(item,ctx),
    target:item.target,
    how:item.how,
    tips:item.tips,
    svg:item.svg,
    type:item.movement==='mobility'||item.movement==='cardio'?'mobilite':(item.movement==='core'?'gainage':'compose')
  };
  const d=DUR[ex.type]||DUR.compose;
  ex.effort=scaleSeconds(item.movement==='cardio'?1200:d.effort,false);
  ex.rest=scaleSeconds(item.movement==='cardio'?60:d.rest,true);
  return ex;
}

function adaptiveDay(day,title,slots,ctx,used){
  const exercises=slots.map(slot=>chooseAdaptiveExercise(slot,ctx,used));
  return {
    title,
    duration:ctx.minutes<=30?'25–35 min':(ctx.minutes>=60?'55–70 min':'40–55 min'),
    warmup:slots.includes('cardio')?'5 min facile + mobilité articulaire':'5 min mobilité + activation progressive',
    exercises
  };
}

function restDay(title='Repos'){
  return {title,duration:'–',warmup:'Récupération',exercises:[
    {name:'Repos',sets:'Récupération',target:'Repos',how:'Hydratation, sommeil, marche légère possible.',tips:'Le repos fait partie du programme.',svg:'rest',type:'repos',effort:0,rest:0}
  ]};
}

function buildAdaptivePersonalProgram(){
  const ctx=adaptiveContext();
  const used=new Set();
  const plan={
    Lundi:adaptiveDay('Lundi','Perso · '+customGoalLabel()+' · Push',['push','push','pull','core'],ctx,used),
    Mardi:adaptiveDay('Mardi','Perso · Pull · posture',['pull','pull','push','core'],ctx,used),
    Mercredi:adaptiveDay('Mercredi','Perso · Cardio · Core',['cardio','core','mobility'],ctx,used),
    Jeudi:adaptiveDay('Jeudi','Perso · Mobilité · récupération',['mobility','mobility','core'],ctx,used),
    Vendredi:adaptiveDay('Vendredi','Perso · Full body',['push','legs','pull','core'],ctx,used),
    Samedi:adaptiveDay('Samedi','Perso · Circuit ciblé',['push','legs','pull','cardio'],ctx,used),
    Dimanche:restDay()
  };

  if(ctx.sessions<=3){
    plan.Mardi=restDay('Repos actif');
    plan.Jeudi=adaptiveDay('Jeudi','Perso · Mobilité courte',['mobility','core'],ctx,used);
    plan.Samedi=restDay();
  }else if(ctx.sessions===4){
    plan.Samedi=restDay();
  }else if(ctx.sessions>=6){
    plan.Jeudi=adaptiveDay('Jeudi','Perso · Mobilité + cardio doux',['mobility','cardio','core'],ctx,used);
  }

  if(ctx.goal==='fatloss'){
    plan.Samedi=adaptiveDay('Samedi','Perso · Cardio + circuit propre',['cardio','legs','push','core'],ctx,used);
  }
  if(ctx.goal==='mobility'){
    plan.Mercredi=adaptiveDay('Mercredi','Perso · Mobilité active',['mobility','mobility','cardio'],ctx,used);
    plan.Samedi=ctx.sessions>=5?adaptiveDay('Samedi','Perso · mobilité + gainage',['mobility','core','cardio'],ctx,used):plan.Samedi;
  }

  return normalizeCircuits(improveProgramText(applyEquipmentAdaptation(normalizeProgramSvgs(plan))));
}

function buildPersonalProgram(){
  return buildAdaptivePersonalProgram();
}


function setExercise(ex,data){
  Object.assign(ex,data);
  return ex;
}

function pushVariantForLevel(){
  const hasRings=(profile.mode==='anneaux')||equipment.rings;
  const hasSupports=(profile.mode==='supports')||equipment.push;
  if(profile.level==='debutant'){
    return hasSupports
      ? {name:'Pompes inclinées sur supports',sets:'3 × 8–12',target:'Pecs, triceps, gainage',how:'Mains sur supports ou surface haute. Corps droit, descente contrôlée, remonte sans forcer.',tips:'Garde 2 répétitions en réserve. Si c’est dur, monte les mains plus haut.',svg:'push'}
      : {name:'Pompes inclinées ou genoux',sets:'3 × 8–12',target:'Pecs, triceps, gainage',how:'Choisis la variante propre : mains surélevées ou genoux au sol. Descends lentement.',tips:'Qualité avant quantité. Arrête avant de perdre l’alignement.',svg:'push'};
  }
  if(profile.level==='expert'){
    if(hasRings)return {name:'Ring push-ups tempo',sets:'5 × 6–10',target:'Pecs, triceps, gainage, stabilité',how:'Anneaux proches du corps, descente 3 sec, pause 1 sec, remontée explosive contrôlée.',tips:'Stabilité parfaite avant amplitude. Ne laisse pas les anneaux partir.',svg:'rings'};
    if(hasSupports)return {name:'Pompes profondes supports tempo',sets:'5 × 8–12',target:'Pecs, triceps, épaules',how:'Grande amplitude, descente 3 sec, pause courte en bas, remontée puissante.',tips:'Amplitude utile seulement si épaules confortables.',svg:'push'};
    return {name:'Pompes tempo difficiles',sets:'5 × 10–15',target:'Pecs, triceps, gainage',how:'Descente 4 sec, pause 1 sec, remontée forte. Ajoute un déclin si trop facile.',tips:'Dernières reps difficiles mais propres.',svg:'push'};
  }
  if(hasRings)return {name:'Pompes aux anneaux',sets:'4 × 8–12',target:'Pecs, triceps, gainage',how:'Contrôle les anneaux, corps droit, descends sans perdre les épaules.',tips:'Si les anneaux bougent trop, réduis l’amplitude.',svg:'rings'};
  if(hasSupports)return {name:'Pompes avec supports',sets:'4 × 8–15',target:'Pecs, triceps, gainage',how:'Poignets neutres, descente contrôlée, remontée propre.',tips:'Garde une amplitude confortable.',svg:'push'};
  return {name:'Pompes classiques',sets:'4 × 8–15',target:'Pecs, triceps, gainage',how:'Corps droit, abdos serrés. Descends lentement puis pousse.',tips:'Ne creuse pas le dos.',svg:'push'};
}

function adaptProgramByLevel(p){
  const level=profile.level||'medium';
  const hasRings=(profile.mode==='anneaux')||equipment.rings;
  const hasSupports=(profile.mode==='supports')||equipment.push;
  const hasDb=equipment.db;

  if(level==='debutant'){
    p.Lundi.title='Push débutant – Technique · Pecs · Triceps';
    p.Lundi.duration='40–55 min';
    setExercise(p.Lundi.exercises[0],pushVariantForLevel());
    setExercise(p.Lundi.exercises[1],{name:'Dips assistés ou pompes serrées inclinées',sets:'3 × 6–10',target:'Triceps, pecs',how:'Utilise les pieds pour aider. Descends peu au début, sans douleur aux épaules.',tips:'Ne cherche pas l’échec. Progression propre semaine après semaine.',svg:hasRings?'rings':'push'});
    setExercise(p.Lundi.exercises[2],{name:hasDb?'Élévations latérales légères':'Y-T-W épaules au sol',sets:'3 × 12–18',target:'Épaules, posture',how:hasDb?'Monte sans élan jusqu’aux épaules, redescends lentement.':'Lève les bras en Y, T puis W, lentement.',tips:'Petit mouvement propre, aucune douleur.',svg:hasDb?'db':'mobility'});
    setExercise(p.Lundi.exercises[3],{name:'Gainage genoux ou planche courte',sets:'3 × 20–35 sec',target:'Gainage profond',how:'Choisis genoux au sol ou planche classique courte. Corps aligné, respiration calme.',tips:'Arrête dès que le bas du dos creuse.',svg:'plank'});

    p.Mardi.title='Pull débutant – Dos · Posture · Biceps';
    setExercise(p.Mardi.exercises[0],{name:'Tractions assistées négatives',sets:'4 × 2–4',target:'Dos, biceps',how:'Monte avec aide, descends en 3 à 5 sec. Repose-toi assez.',tips:'Une répétition lente vaut mieux que plusieurs avec élan.',svg:'pull'});
    setExercise(p.Mardi.exercises[1],{name:hasRings?'Rowing anneaux facile':'Rowing haltères buste appuyé',sets:'3 × 10–15',target:'Dos, arrière épaules',how:hasRings?'Corps plus vertical pour réduire la difficulté, tire la poitrine vers les anneaux.':'Buste stable, tire les coudes vers l’arrière.',tips:'Serre les omoplates, contrôle la descente.',svg:hasRings?'rings':'db'});
    setExercise(p.Mardi.exercises[2],{name:hasDb?'Curl haltères contrôlé':'Curl serviette isométrique',sets:'3 × 12–18',target:'Biceps',how:hasDb?'Coudes fixes, descente lente.':'Tire contre une serviette avec contrôle.',tips:'Pas d’élan.',svg:hasDb?'db':'default'});
    setExercise(p.Mardi.exercises[3],{name:'Dead bug ou relevés de genoux',sets:'3 × 8–12 / côté',target:'Abdos bas, contrôle lombaire',how:'Bas du dos collé au sol. Va lentement.',tips:'Si tu cambres, réduis l’amplitude.',svg:'core'});

    p.Mercredi.title='Cardio doux · Abdos débutant';
    setExercise(p.Mercredi.exercises[1],{name:'Crunch contrôlé',sets:'3 × 12–18',target:'Abdos',how:'Remonte légèrement, expire, redescends lentement.',tips:'Ne tire pas sur la nuque.',svg:'crunch'});
    setExercise(p.Mercredi.exercises[2],{name:'Mountain climbers lents',sets:'3 × 20–30 sec',target:'Cardio, abdos',how:'Alterne les genoux lentement, épaules au-dessus des mains.',tips:'Bassin stable avant vitesse.',svg:'mountain'});
    setExercise(p.Mercredi.exercises[3],{name:'Gainage genoux',sets:'3 × 20–35 sec',target:'Core',how:'Genoux au sol si besoin, ligne épaules-hanches propre.',tips:'Respire, ne bloque pas.',svg:'plank'});

    p.Vendredi.title='Full body débutant – Base propre';
    setExercise(p.Vendredi.exercises[0],pushVariantForLevel());
    setExercise(p.Vendredi.exercises[1],{name:'Squats contrôlés',sets:'3 × 12–18',target:'Jambes, fessiers',how:'Descends à amplitude confortable, genoux stables, dos long.',tips:'Ajoute une pause en bas plutôt que de te précipiter.',svg:'legs'});
    setExercise(p.Vendredi.exercises[2],{name:'Gainage shoulder taps sur genoux',sets:'3 × 20–30 sec',target:'Core, stabilité épaules',how:'Depuis les genoux, touche une épaule puis l’autre sans bouger le bassin.',tips:'Lent et stable.',svg:'shoulder_tap'});

    p.Samedi.title='Circuit débutant – Technique + souffle';
    setExercise(p.Samedi.exercises[0],{name:'Circuit poids du corps débutant',sets:'2–3 tours',target:'Tout le corps',how:'Pompes inclinées, squats contrôlés, rowing facile, gainage genoux.',tips:'Repos long si besoin. Tu dois finir propre.',svg:'circuit'});
    setExercise(p.Samedi.exercises[1],{name:'Abdos finisher facile',sets:'2 tours',target:'Abdos',how:'Crunch contrôlé, dead bug, gainage court.',tips:'Stop si le dos cambre.',svg:'plank'});
  }

  if(level==='expert'){
    p.Lundi.title='Push expert – Intensité · Tempo · Stabilité';
    p.Lundi.duration='60–75 min';
    setExercise(p.Lundi.exercises[0],pushVariantForLevel());
    setExercise(p.Lundi.exercises[1],{name:hasRings?'Dips anneaux assistés tempo':'Dips profonds tempo',sets:'5 × 5–10',target:'Triceps, pecs, épaules',how:'Descente 3 sec, épaules basses, pause courte, remonte puissant.',tips:'Stop si douleur épaule. Intensité oui, ego non.',svg:hasRings?'rings':'dip'});
    setExercise(p.Lundi.exercises[2],{name:hasDb?'Élévations latérales 1,5 reps':'Pike push-ups tempo',sets:hasDb?'5 × 15–25':'5 × 6–12',target:'Épaules',how:hasDb?'Monte, demi-descente, remonte, puis descente complète.':'Hanches hautes, descente lente, pousse verticalement.',tips:'Brûlure contrôlée, pas d’élan.',svg:hasDb?'db':'pike'});
    setExercise(p.Lundi.exercises[3],{name:'Gainage RKC',sets:'4 × 30–45 sec',target:'Gainage profond',how:'Contracte abdos, fessiers et quadriceps très fort.',tips:'Court mais intense.',svg:'plank'});

    p.Mardi.title='Pull expert – Tractions · Rowing lourd · Core';
    setExercise(p.Mardi.exercises[0],{name:'Tractions strictes + négatives',sets:'5 × 3–6 + 1 négative',target:'Dos, biceps',how:'Tractions propres, puis une négative lente sur la dernière rep.',tips:'Garde 1 rep propre en réserve sur les premières séries.',svg:'pull'});
    setExercise(p.Mardi.exercises[1],{name:hasRings?'Rowing anneaux pieds avancés':'Rowing haltères tempo 5 kg',sets:'5 × 10–15',target:'Dos, arrière épaules',how:hasRings?'Corps plus horizontal, tire haut vers les côtes.':'Tempo 4 sec en descente, contraction forte en haut.',tips:'Équilibre la poussée avec beaucoup de tirage.',svg:hasRings?'rings':'db'});
    setExercise(p.Mardi.exercises[2],{name:hasDb?'Curl haltères myo-reps':'Curl isométrique serviette',sets:'4 × 15–25 + mini-série',target:'Biceps',how:'Après la série, respire 15 sec puis ajoute 4–6 reps propres.',tips:'Ne triche pas avec le dos.',svg:hasDb?'db':'default'});
    setExercise(p.Mardi.exercises[3],{name:'Hollow body hold avancé',sets:'4 × 35–50 sec',target:'Abdos, gainage',how:'Jambes tendues si possible, bas du dos collé.',tips:'Réduis l’amplitude si tu cambres.',svg:'hollow'});

    p.Mercredi.title='Cardio zone 2 + core expert';
    setExercise(p.Mercredi.exercises[1],{name:'Relevés de jambes tempo',sets:'4 × 12–18',target:'Abdos bas',how:'Monte contrôlé, bloque 1 sec, descends en 3 sec.',tips:'Aucune cambrure.',svg:'core'});
    setExercise(p.Mercredi.exercises[2],{name:'Mountain climbers rapides propres',sets:'5 × 35–45 sec',target:'Cardio, abdos',how:'Cadence élevée mais bassin stable.',tips:'Épaules solides au-dessus des mains.',svg:'mountain'});
    setExercise(p.Mercredi.exercises[3],{name:'Planche dynamique',sets:'4 × 45–60 sec',target:'Core, épaules',how:'Alterne planche, shoulder taps et blocage propre.',tips:'Zéro rotation du bassin.',svg:'shoulder_tap'});

    p.Vendredi.title='Full body expert – Hypertrophie dense';
    setExercise(p.Vendredi.exercises[0],pushVariantForLevel());
    setExercise(p.Vendredi.exercises[1],{name:'Bulgarian split squat tempo',sets:'5 × 10–15 / jambe',target:'Jambes, fessiers',how:'Descente 3 sec, pause en bas, remonte fort.',tips:'Unilatéral pour rendre les jambes difficiles sans charge lourde.',svg:'split'});
    setExercise(p.Vendredi.exercises[2],{name:'Gainage dynamique avancé',sets:'4 × 45–60 sec',target:'Core, épaules',how:'Shoulder taps, planche bras tendus, contrôle total.',tips:'Qualité stricte malgré la fatigue.',svg:'shoulder_tap'});

    p.Samedi.title='Circuit expert – Densité · Finisher';
    setExercise(p.Samedi.exercises[0],{name:hasRings?'Circuit anneaux expert':'Circuit complet expert',sets:'4–5 tours',target:'Tout le corps',how:hasRings?'Ring rows, ring push-ups, support hold, Bulgarian split squat.':'Pompes profondes, Bulgarian split squat, rowing, gainage RKC.',tips:'Repos court mais technique parfaite.',svg:'circuit'});
    setExercise(p.Samedi.exercises[1],{name:'Abdos finisher expert',sets:'4 tours',target:'Abdos',how:'Hollow hold, relevés de jambes tempo, mountain climbers.',tips:'Brûlure ok, douleur lombaire non.',svg:'hollow'});
  }

  if(level==='medium'){
    setExercise(p.Lundi.exercises[0],pushVariantForLevel());
    setExercise(p.Mardi.exercises[1],{name:hasRings?'Rowing anneaux':'Rowing haltères tempo',sets:'4 × 10–15',target:'Dos, arrière épaules',how:hasRings?'Tire la poitrine vers les anneaux, serre les omoplates.':'Buste stable, tempo lent, coudes vers l’arrière.',tips:'Contrôle la descente.',svg:hasRings?'rings':'db'});
    setExercise(p.Vendredi.exercises[0],hasSupports||hasRings?pushVariantForLevel():{name:'Pompes tempo',sets:'5 × 10–15',target:'Pecs, triceps',how:'Descente lente, pause courte, remontée propre.',tips:'Amplitude complète sans douleur.',svg:'push'});
    setExercise(p.Vendredi.exercises[1],{name:'Bulgarian split squat ou squats',sets:'4 × 10–15 / jambe',target:'Jambes, fessiers',how:'Choisis Bulgarian si tu maîtrises, sinon squats contrôlés.',tips:'Genoux stables, tempo propre.',svg:'split'});
  }

  return p;
}

function adaptCircuitsByLevel(p){
  const level=profile.level||'medium';
  if(!p.Samedi)return p;
  p.Samedi.exercises.forEach(ex=>{
    const n=(ex.name||'').toLowerCase();
    if(n.includes('circuit') && level==='debutant'){
      ex.circuit=[
        {name:'Pompes inclinées',effort:scaleSeconds(25,false),rest:scaleSeconds(30,true)},
        {name:'Squats contrôlés',effort:scaleSeconds(30,false),rest:scaleSeconds(30,true)},
        {name:equipment.rings?'Rowing anneaux facile':'Rowing haltères facile',effort:scaleSeconds(30,false),rest:scaleSeconds(30,true)},
        {name:'Gainage genoux',effort:scaleSeconds(25,false),rest:scaleSeconds(75,true)}
      ];
    }
    if(n.includes('circuit') && level==='expert'){
      ex.circuit=[
        {name:equipment.rings?'Ring push-ups tempo':'Pompes profondes tempo',effort:scaleSeconds(45,false),rest:scaleSeconds(15,true)},
        {name:'Bulgarian split squat tempo',effort:scaleSeconds(50,false),rest:scaleSeconds(15,true)},
        {name:equipment.rings?'Ring rows pieds avancés':'Rowing tempo',effort:scaleSeconds(45,false),rest:scaleSeconds(15,true)},
        {name:'Gainage RKC',effort:scaleSeconds(35,false),rest:scaleSeconds(60,true)}
      ];
    }
    if(n.includes('abdos') && level==='debutant'){
      ex.circuit=[
        {name:'Crunch contrôlé',effort:scaleSeconds(25,false),rest:scaleSeconds(20,true)},
        {name:'Dead bug',effort:scaleSeconds(25,false),rest:scaleSeconds(20,true)},
        {name:'Gainage genoux',effort:scaleSeconds(25,false),rest:scaleSeconds(60,true)}
      ];
    }
    if(n.includes('abdos') && level==='expert'){
      ex.circuit=[
        {name:'Hollow body hold',effort:scaleSeconds(40,false),rest:scaleSeconds(15,true)},
        {name:'Relevés de jambes tempo',effort:scaleSeconds(40,false),rest:scaleSeconds(15,true)},
        {name:'Mountain climbers rapides propres',effort:scaleSeconds(40,false),rest:scaleSeconds(45,true)}
      ];
    }
  });
  return p;
}

function adaptProgram(){
  if(profile.level==='perso')return buildPersonalProgram();
  const p=clone(BASE);
  Object.values(p).forEach(day=>day.exercises.forEach(ex=>{
    const d=DUR[ex.type]||DUR.compose;
    ex.effort=scaleSeconds(d.effort,false);
    ex.rest=scaleSeconds(d.rest,true);
  }));
  if(p.Mercredi && !p.Mercredi.exercises.some(ex=>(ex.name||'').includes('zone 2') || (ex.name||'').includes('Marche active'))){
    p.Mercredi.exercises.unshift(cardioEquipmentExercise(profile.level==='expert'?'25–35 min':'20–30 min'));
  }
  adaptProgramByLevel(p);
  const prepared=normalizeCircuits(improveProgramText(applyEquipmentAdaptation(normalizeProgramSvgs(p))));
  return adaptCircuitsByLevel(prepared);
}
function P(){return adaptProgram()}

function equipmentChoicesHTML(){
  const items=[
    ['rings','Anneaux','Exercices aux anneaux si disponibles'],
    ['push','Supports de pompes','Pompes profondes et amplitude'],
    ['db','Haltères 5 kg','Épaules, bras, finition'],
    ['treadmill','Tapis','Marche/course, vitesse réglable'],
    ['bike','Vélo','Cardio doux, échauffement, récupération']
  ];

  return items.map(([k,title,desc])=>`
    <button class="choice-btn equipment-choice ${equipment[k]?'active':''}" id="toggle-${k}" data-action="toggle-equipment" data-equipment="${k}">
      <strong>${title}</strong>
      <span>${desc}</span>
    </button>
  `).join('');
}

function equipmentSummaryText(){
  const labels={
    rings:'Anneaux',
    push:'Supports',
    db:'Haltères',
    treadmill:'Tapis',
    bike:'Vélo'
  };
  const active=Object.keys(labels).filter(k=>equipment[k]).map(k=>labels[k]);
  if(!active.length)return 'Aucun matériel';
  if(active.length<=2)return active.join(' · ');
  return active.slice(0,2).join(' · ')+' +'+(active.length-2);
}


function selectLevel(k){
  if(!LEVELS || !LEVELS[k])return;
  const wasPerso=profile.level==='perso';
  profile.level=k;
  if(k==='perso'){
    customProfileOpen=wasPerso?!customProfileOpen:true;
    storageSafe.setItem('vv-custom-profile-open',customProfileOpen?'1':'0');
  }else{
    customProfileOpen=false;
    storageSafe.setItem('vv-custom-profile-open','0');
  }
  storageSafe.setItem('vv-level',k);
  renderChoices();
  if(currentTab==='options' && typeof renderOptions==='function')renderOptions();
  renderAll();
  saveAppState();
}

function selectMode(k){
  profile.mode='adaptive';
  storageSafe.setItem('vv-mode','adaptive');
  renderChoices();
  if(typeof renderOptions==='function')renderOptions();
  renderAll();
  saveAppState();
}

function customProfileFormHTML(){
  const c={...CUSTOM_PROFILE_DEFAULT,...customProfile};
  const selected=(key,value)=>String(c[key])===String(value)?'selected':'';
  const profiles=loadCustomProfiles();
  const profileOptions=profiles.map(p=>`<option value="${escapeHTML(p.id)}" ${p.id===c.id?'selected':''}>${escapeHTML(profileDisplayName(p))}</option>`).join('');
  return `
    <div class="custom-profile-panel ${profile.level==='perso'?'active':''} ${customProfileOpen?'open':''}">
      <button class="custom-profile-head" type="button" data-action="toggle-custom-profile" aria-expanded="${customProfileOpen?'true':'false'}">
        <span><strong>Profil personnalisé</strong><em>${escapeHTML(customProfileSummary())}</em></span>
        <b>${customProfileOpen?'Fermer':'Modifier'}</b>
      </button>
      ${customProfileOpen?`
      <div class="custom-profile-manager">
        <label>Profil actif
          <select data-action="select-custom-profile">${profileOptions}</select>
        </label>
        <button type="button" data-action="create-custom-profile">Nouveau</button>
        <button type="button" class="danger-mini" data-action="delete-custom-profile" data-id="${escapeHTML(c.id)}">Supprimer</button>
      </div>
      <div class="custom-form-grid">
        <label>Pseudo <input type="text" value="${escapeHTML(c.name)}" placeholder="Ton pseudo" data-action="custom-profile-field" data-field="name"></label>
        <label>Âge <input type="number" min="12" max="90" value="${escapeHTML(c.age)}" placeholder="38" data-action="custom-profile-field" data-field="age"></label>
        <label>Poids <input type="number" min="30" max="200" value="${escapeHTML(c.weight)}" placeholder="72" data-action="custom-profile-field" data-field="weight"></label>
        <label>Taille <input type="number" min="120" max="230" value="${escapeHTML(c.height)}" placeholder="178" data-action="custom-profile-field" data-field="height"></label>
      </div>
      <div class="custom-form-grid">
        <label>Objectif
          <select data-action="custom-profile-field" data-field="goal">
            <option value="muscle" ${selected('goal','muscle')}>Prise musculaire</option>
            <option value="strength" ${selected('goal','strength')}>Force</option>
            <option value="fatloss" ${selected('goal','fatloss')}>Perte de gras</option>
            <option value="mobility" ${selected('goal','mobility')}>Mobilité / récupération</option>
            <option value="general" ${selected('goal','general')}>Forme générale</option>
          </select>
        </label>
        <label>Niveau réel
          <select data-action="custom-profile-field" data-field="experience">
            <option value="beginner" ${selected('experience','beginner')}>Débutant</option>
            <option value="intermediate" ${selected('experience','intermediate')}>Intermédiaire</option>
            <option value="advanced" ${selected('experience','advanced')}>Avancé</option>
          </select>
        </label>
        <label>Séances/semaine
          <select data-action="custom-profile-field" data-field="sessions">
            <option value="3" ${selected('sessions','3')}>3</option>
            <option value="4" ${selected('sessions','4')}>4</option>
            <option value="5" ${selected('sessions','5')}>5</option>
            <option value="6" ${selected('sessions','6')}>6</option>
          </select>
        </label>
        <label>Temps/séance
          <select data-action="custom-profile-field" data-field="sessionTime">
            <option value="30" ${selected('sessionTime','30')}>30 min</option>
            <option value="45" ${selected('sessionTime','45')}>45 min</option>
            <option value="60" ${selected('sessionTime','60')}>60 min</option>
          </select>
        </label>
      </div>
      <div class="custom-form-grid performance-grid">
        <label>Pompes propres <input type="number" min="0" max="100" value="${escapeHTML(c.pushups)}" data-action="custom-profile-field" data-field="pushups"></label>
        <label>Tractions <input type="number" min="0" max="50" value="${escapeHTML(c.pullups)}" data-action="custom-profile-field" data-field="pullups"></label>
        <label>Gainage sec <input type="number" min="0" max="600" value="${escapeHTML(c.plank)}" data-action="custom-profile-field" data-field="plank"></label>
      </div>
      <div class="custom-form-grid">
        <label>Priorité
          <select data-action="custom-profile-field" data-field="focus">
            <option value="balanced" ${selected('focus','balanced')}>Équilibré</option>
            <option value="push" ${selected('focus','push')}>Pecs / triceps</option>
            <option value="pull" ${selected('focus','pull')}>Dos / tractions</option>
            <option value="legs" ${selected('focus','legs')}>Jambes</option>
            <option value="core" ${selected('focus','core')}>Abdos / gainage</option>
          </select>
        </label>
        <label>Limite à respecter
          <select data-action="custom-profile-field" data-field="limitation">
            <option value="none" ${selected('limitation','none')}>Aucune</option>
            <option value="shoulder" ${selected('limitation','shoulder')}>Épaules</option>
            <option value="back" ${selected('limitation','back')}>Dos</option>
            <option value="knee" ${selected('limitation','knee')}>Genoux</option>
          </select>
        </label>
      </div>
      `:''}
    </div>
  `;
}

function renderChoices(){
  const levelHTML=Object.entries(LEVELS).map(([k,v])=>`
    <button class="choice-btn ${profile.level===k?'active':''}" data-action="select-level" data-level="${k}">
      <strong>${v.label}</strong>
      <span>${v.desc||v.sub||''}</span>
    </button>
  `).join('');

  const levelBox=document.getElementById('level-choices');
  const modeBox=document.getElementById('mode-choices');
  const levelSummary=document.getElementById('setup-level-summary');
  const equipmentSummary=document.getElementById('setup-equipment-summary');

  if(levelBox)levelBox.innerHTML=levelHTML;
  if(modeBox)modeBox.innerHTML=`
    ${profile.level==='perso'&&customProfileOpen?customProfileFormHTML():''}
    ${equipmentChoicesHTML()}
  `;
  if(levelSummary)levelSummary.textContent=(profile.level&&LEVELS[profile.level]) ? LEVELS[profile.level].label : 'À choisir';
  if(equipmentSummary)equipmentSummary.textContent=equipmentSummaryText();
  if(typeof renderSetupPlan==='function')renderSetupPlan();
}
function showProfileSetup(){
  storageSafe.removeItem('vv-ready');
  document.body.classList.remove('is-ready');

  const launch=document.getElementById('launch-screen');
  const app=document.getElementById('app-screen');
  const setup=document.getElementById('setup-screen');

  if(launch)launch.classList.add('hidden');
  if(app)app.classList.add('hidden');
  if(setup)setup.classList.remove('hidden');

  renderChoices();
}

function hideIntroScreen(){
  const intro=document.getElementById('intro-screen');
  if(!intro)return;
  intro.classList.add('hide');
  window.sessionStorage&&sessionStorage.setItem('vv-intro-seen','1');
  setTimeout(()=>intro.classList.add('hidden'),520);
}

function initIntroScreen(){
  const intro=document.getElementById('intro-screen');
  if(!intro)return;
  const seen=window.sessionStorage&&sessionStorage.getItem('vv-intro-seen')==='1';
  if(seen){
    intro.classList.add('hidden');
    return;
  }
  setTimeout(hideIntroScreen,1700);
}
function saveProfileAndEnter(targetTab='plan'){
  if(!profile.level){
    alert('Choisis ton niveau et le matériel disponible');
    return;
  }
  storageSafe.setItem('vv-level',profile.level);
  storageSafe.setItem('vv-mode',profile.mode);

  const realDay=getRealDay();
  currentDay=realDay;
  storageSafe.setItem('vv-current-day',currentDay);
  activeTab='today';

  const launch=document.getElementById('launch-screen');
  if(launch)launch.classList.add('hidden');
  document.getElementById('setup-screen').classList.add('hidden');
  document.getElementById('app-screen').classList.remove('hidden');
  renderAll();
  if(targetTab==='exercises')showTab('exercises');
  else if(targetTab==='plan')showTab('plan');
  else{
    showTab('program');
    showProgramView('today',{keepDay:true});
  }
}

function todayKey(){
  return dateKey(new Date());
}
function dateKey(date){
  const y=date.getFullYear();
  const m=String(date.getMonth()+1).padStart(2,'0');
  const d=String(date.getDate()).padStart(2,'0');
  return y+'-'+m+'-'+d;
}
function dateFromKey(key){
  const parts=String(key||'').split('-');
  if(parts.length!==3)return new Date();
  return new Date(Number(parts[0]),Number(parts[1])-1,Number(parts[2]));
}
function programDayForDate(date){
  return window.ProgramEngine.dayForDate(date,DAYS);
}
function isRestProgramDay(dayName){
  return window.ProgramEngine.isRestProgramDay(dayName,P());
}
function isRestDateKey(key){
  return isRestProgramDay(programDayForDate(dateFromKey(key)));
}
function getHistory(){
  return window.StatsEngine.getHistory(storageSafe);
}
function saveHistory(list){
  window.StatsEngine.saveHistory(storageSafe,list);
}
function logExerciseDone(ex,day=currentDay){
  if(!ex || ex.type==='repos')return;
  const list=getHistory();
  list.push({
    date:todayKey(),
    time:Date.now(),
    day,
    exercise:ex.name,
    level:profile.level,
    mode:profile.mode,
    minutes:Math.max(1,Math.round(((ex.effort||40)+(ex.rest||0))/60))
  });
  saveHistory(list);
}
function statsSummary(){
  return window.StatsEngine.summary({
    history:getHistory(),
    dateKey,
    isRestDateKey
  });
}

function weekStatsSummary(){
  return window.StatsEngine.weekSummary({
    days:DAYS,
    getProgram:P,
    getDone
  });
}

function weekStatsHTML(){
  const w=weekStatsSummary();
  return '<div class="week-stats">'+
    '<div class="week-stats-top"><div><strong>'+w.pct+'%</strong><span>semaine actuelle</span></div><small>'+w.doneExercises+'/'+w.totalExercises+' exercices · '+w.restDays+' repos</small></div>'+
    '<div class="week-stat-days">'+w.rows.map(x=>{
      const cls=x.rest?'rest':(x.pct>=100?'done':(x.pct>0?'partial':''));
      const label=x.rest?'repos':x.pct+'%';
      return '<div class="week-stat-day '+cls+'" title="'+escapeHTML(x.day)+' · '+escapeHTML(label)+'"><span>'+escapeHTML(x.day.slice(0,3))+'</span><b>'+escapeHTML(label)+'</b></div>';
    }).join('')+'</div>'+
  '</div>';
}
function coachAdvice(){
  const p=pct(currentDay);
  const day=P()[currentDay];
  const isRestDay=currentDay==='Dimanche' || (day && day.exercises.every(e=>e.type==='repos'));

  if(isRestDay){
    return "Aujourd’hui, c’est repos. Pas besoin de cocher quoi que ce soit ni de lancer un chrono. Si tu as envie, fais une marche tranquille ou un peu de mobilité. Sinon, récupère vraiment.";
  }

  if(p===0){
    return "Commence par le premier exercice et prends le temps de bien faire. Une séance réussie, c’est surtout une séance propre et régulière.";
  }

  if(p<50){
    return "Tu es lancé. Continue exercice par exercice. Si un mouvement ne passe pas bien aujourd’hui, adapte-le plutôt que de forcer.";
  }

  if(p<100){
    return "Il ne reste plus grand-chose. Termine proprement, sans chercher l’échec partout. Garde un peu de marge pour bien récupérer.";
  }

  return "Séance terminée. Bien joué. Note ce qui était facile ou difficile, puis laisse le corps récupérer.";
}
function escapeHTML(v){
  return window.UIEngine.escapeHTML(v);
}
function tutorialSearchQuery(ex){
  const name=(ex&&ex.name)||'exercice';
  const target=(ex&&ex.target)||'';
  return 'tuto '+name+' technique '+target;
}
// Tutorial modal functions
function openTutorialModal(url,title='Tutoriel vidéo'){
  const modal=document.getElementById('tutorial-modal');
  const iframe=document.getElementById('tutorial-iframe');
  const titleEl=document.getElementById('tutorial-modal-title');
  if(!modal || !iframe)return;
  iframe.src=youtubeEmbedUrl(url)||url;
  if(titleEl)titleEl.textContent=title;
  modal.classList.remove('hidden');
  document.body.style.overflow='hidden';
}
function closeTutorialModal(){
  const modal=document.getElementById('tutorial-modal');
  const iframe=document.getElementById('tutorial-iframe');
  if(!modal || !iframe)return;
  modal.classList.add('hidden');
  iframe.src='';
  document.body.style.overflow='';
}
function openTutorialSearch(query){
  const url='https://www.youtube.com/results?search_query='+encodeURIComponent(query||'tuto exercice technique');
  window.open(url,'_blank','noopener,noreferrer');
}
function openTutorialSearchEncoded(encodedQuery){
  const safe=String(encodedQuery||'');
  window.open('https://www.youtube.com/results?search_query='+safe,'_blank','noopener,noreferrer');
}
// Close modal on ESC key
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    const modal=document.getElementById('tutorial-modal');
    if(modal && !modal.classList.contains('hidden'))closeTutorialModal();
  }
});
document.addEventListener('click',event=>{
  const card=event.target.closest&&event.target.closest('.tip-expand');
  if(!card)return;
  if(event.target.closest('summary'))return;
  event.preventDefault();
  event.stopPropagation();
  card.open=false;
});
document.addEventListener('toggle',event=>{
  const card=event.target;
  if(!card || !card.classList || !card.classList.contains('tip-expand') || !card.open)return;
  const wrap=card.closest('.timer-summary-card');
  if(!wrap)return;
  wrap.querySelectorAll('.tip-expand[open]').forEach(other=>{
    if(other!==card)other.open=false;
  });
},true);
function tutorialLinkHTML(ex){
  if(!ex || ex.type==='repos')return '';
  return '<button class="tutorial-link" type="button" data-action="open-tutorial" data-query="'+encodeURIComponent(tutorialSearchQuery(ex))+'">Voir un tuto YouTube</button>';
}
function formatHistoryDate(key){
  return window.StatsEngine.formatHistoryDate(key,dateFromKey);
}
function formatChartDay(date){
  return window.StatsEngine.formatChartDay(date);
}
function groupHistoryByDate(list){
  return window.StatsEngine.groupHistoryByDate(list,todayKey);
}
function resetStats(){
  if(!confirm('Réinitialiser toutes les stats et l’historique ?'))return;
  storageSafe.removeItem('vv-history');
  renderStats();
}

function vvStorageKeys(){
  const keys=[];
  try{
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);
      if(k && (k.startsWith('vv-') || k.startsWith('done-') || k.startsWith('note-')))keys.push(k);
    }
  }catch(e){}
  return keys.sort();
}

function exportUserData(){
  const data={
    app:cleanAppName(appName),
    version:APP_VERSION,
    exportedAt:new Date().toISOString(),
    values:{}
  };
  vvStorageKeys().forEach(k=>{data.values[k]=storageSafe.getItem(k);});
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download='vv-sport-data-'+todayKey()+'.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function triggerImportUserData(){
  const input=document.getElementById('import-data-input');
  if(input)input.click();
}

function importUserData(file){
  if(!file)return;
  const reader=new FileReader();
  reader.onload=function(){
    try{
      const data=JSON.parse(String(reader.result||'{}'));
      const values=data.values || data;
      const keys=Object.keys(values).filter(k=>k.startsWith('vv-') || k.startsWith('done-') || k.startsWith('note-'));
      if(!keys.length)throw new Error('Aucune donnée vV Sport trouvée.');
      if(!confirm('Importer ces données et remplacer les données locales actuelles ?'))return;
      keys.forEach(k=>storageSafe.setItem(k,String(values[k])));
      location.reload();
    }catch(e){
      alert('Import impossible : '+(e.message||'fichier invalide'));
    }
  };
  reader.readAsText(file);
}

function resetProgressData(){
  if(!confirm('Réinitialiser uniquement la progression cochée ? Les notes et stats restent conservées.'))return;
  vvStorageKeys().filter(k=>k.startsWith('done-')).forEach(k=>storageSafe.removeItem(k));
  renderAll();
  saveAppState();
}

function resetNotesData(){
  if(!confirm('Supprimer toutes les notes personnelles ?'))return;
  vvStorageKeys().filter(k=>k.startsWith('note-')).forEach(k=>storageSafe.removeItem(k));
  renderAll();
  saveAppState();
}

function resetProfileData(){
  if(!confirm('Réinitialiser le profil, le matériel et les options ? Progression, notes et stats restent conservées.'))return;
  ['vv-level','vv-mode','vv-ready','vv-custom-profile','vv-custom-profiles','vv-active-custom-profile','vv-eq-rings','vv-eq-push','vv-eq-db','vv-eq-treadmill','vv-eq-bike','vv-prep-time','vv-sound','vv-color-theme','vv-profile-color','vv-timer-color','vv-timer-preset-color','vv-spotify-url','vv-youtube-url'].forEach(k=>storageSafe.removeItem(k));
  profile={level:'',mode:''};
  customProfile=loadCustomProfile();
  equipment={rings:true,push:true,db:true,treadmill:true,bike:true};
  soundEnabled=true;
  spotifyUrl='';
  youtubeUrl='';
  colorThemeKey='lime';
  applyColorTheme(colorThemeKey);
  window.TimerShell.setPresetColorKey('auto');
  applyTimerColor();
  showProfileSetup();
}
function renderStats(){
  const s=statsSummary();
  const q=id=>document.getElementById(id);
  if(!q('stat-sessions'))return;
  q('stat-sessions').textContent=s.sessions;
  q('stat-exercises').textContent=s.exercises;
  q('stat-streak').textContent=s.streak+'j';
  q('stat-time').textContent=Math.floor(s.minutes/60)+'h'+String(s.minutes%60).padStart(2,'0');
  q('coach-text').textContent=coachAdvice();

  const chart=q('stats-chart');
  const days=[];
  const d=new Date();
  for(let i=6;i>=0;i--){
    const x=new Date(d);
    x.setDate(d.getDate()-i);
    const k=dateKey(x);
    days.push({k,v:s.byDate[k]||0,rest:isRestProgramDay(programDayForDate(x))});
  }
  const max=Math.max(1,...days.map(x=>x.v));
  const total7=days.reduce((sum,x)=>sum+x.v,0);
  const rest7=days.filter(x=>x.rest).length;
  if(chart)chart.innerHTML=`
    <div class="chart-top">
      <div><strong>${total7}</strong><span>exercice${total7>1?'s':''}</span></div>
      <small>${rest7?rest7+' repos · ':''}max ${max}/jour</small>
    </div>
    <div class="chart-bars">
      ${days.map(x=>{
        const date=dateFromKey(x.k);
        const h=x.v ? Math.max(18,Math.round((x.v/max)*86)) : 6;
        const value=x.v ? x.v : (x.rest?'repos':'');
        const title=x.rest && !x.v ? x.k+' · repos' : x.k+' · '+x.v+' exercice(s)';
        const barClass=x.v?'has-value':(x.rest?'is-rest':'is-empty');
        return '<div class="chart-day" title="'+escapeHTML(title)+'"><span class="chart-value '+(x.rest&&!x.v?'is-rest':'')+'">'+escapeHTML(value)+'</span><div class="chart-track"><div class="chart-bar '+barClass+'" style="height:'+h+'px"></div></div><span class="chart-label">'+escapeHTML(formatChartDay(date))+'</span></div>';
      }).join('')}
    </div>`;

  const weekBox=q('stats-week');
  if(weekBox)weekBox.innerHTML=weekStatsHTML();

  const hist=q('history-list');
  if(hist){
    const groups=groupHistoryByDate(s.list);
    hist.innerHTML=groups.map((g,idx)=>{
      const count=g.items.length;
      const rows=g.items.map(x=>{
        const time=x.time ? new Date(x.time).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) : '–';
        return '<div class="history-detail-item"><div><strong>'+escapeHTML(x.exercise||'Exercice')+'</strong><small>'+escapeHTML(time)+' · '+escapeHTML(x.day||'')+' · '+escapeHTML(x.level||'')+' · '+escapeHTML(x.mode||'')+'</small></div><div class="prog-pct">'+(x.minutes||2)+'min</div></div>';
      }).join('');
      return '<details class="history-day" '+(idx===0?'open':'')+'><summary><div><strong>'+escapeHTML(formatHistoryDate(g.date))+'</strong><small>'+count+' exercice'+(count>1?'s':'')+' · '+g.minutes+' min</small></div><span class="history-chevron">⌄</span></summary><div class="history-detail-list">'+rows+'</div></details>';
    }).join('') || '<div class="card"><div class="day-title">Aucun historique pour le moment.</div><div class="page-sub">Valide un exercice ou termine un chrono pour créer tes premières stats.</div></div>';
  }
}


function saveAppState(){
  try{
    const state={
      currentDay,
      activeTab:currentTab,
      programView,
      timer:{
        seconds:timer.seconds,
        left:timer.left,
        running:false,
        phase:timer.phase,
        context:timer.context,
        exercise:timer.exercise,
        exerciseData:timer.exerciseData,
        effort:timer.effort,
        rest:timer.rest,
        totalPhase:timer.totalPhase,
        prep:timer.prep,
        pendingStart:false,
        circuit:timer.circuit,
        circuitIndex:timer.circuitIndex,
        sourceDay:timer.sourceDay,
        sourceIndex:timer.sourceIndex,
        guided:timer.guided,
        guidedIndex:timer.guidedIndex,
        guidedTotal:timer.guidedTotal
      },
      guidedSession:guidedSession ? {
        day:guidedSession.day,
        steps:guidedSession.steps,
        index:guidedSession.index,
        label:guidedSession.label,
        custom:guidedSession.custom,
        startedAt:guidedSession.startedAt
      } : null,
      customSessionSelection,
      savedCustomSessions,
      lastCompletedSession,
      savedAt:Date.now()
    };
    storageSafe.setItem('vv-app-state',JSON.stringify(state));
  }catch(e){}
}

function loadAppState(){
  try{
    return JSON.parse(storageSafe.getItem('vv-app-state')||'null');
  }catch(e){
    return null;
  }
}

function hasResumeState(){
  const state=loadAppState();
  return !!(state && state.savedAt && (Date.now()-state.savedAt) < 1000*60*60*24*7);
}

function clearResumeState(){
  storageSafe.removeItem('vv-app-state');
}

function restoreAppState(){
  const state=loadAppState();
  if(!state)return false;

  currentDay=state.currentDay || getRealDay();
  programView=state.programView || programView || 'today';
  currentTab=normalizeTabTarget(state.activeTab || state.currentTab || 'program');
  if(typeof activeTab!=='undefined')activeTab=currentTab;

  if(state.timer){
    timer={...timer,...state.timer,running:false,pendingStart:false};
  }

  guidedSession=state.guidedSession || null;
  lastCompletedSession=state.lastCompletedSession || null;
  customSessionSelection=Array.isArray(state.customSessionSelection) ? state.customSessionSelection : customSessionSelection;
  savedCustomSessions=Array.isArray(state.savedCustomSessions) ? state.savedCustomSessions : savedCustomSessions;
  storageSafe.setItem('vv-custom-session-selection',JSON.stringify(customSessionSelection));
  storageSafe.setItem('vv-saved-custom-sessions',JSON.stringify(savedCustomSessions));

  document.getElementById('launch-screen').classList.add('hidden');
  document.getElementById('setup-screen').classList.add('hidden');
  document.getElementById('app-screen').classList.remove('hidden');

  renderAll();
  showTab(currentTab);
  updateTimer();
  updateSessionRunner();

  return true;
}

function updateLaunchInfo(){
  updateAppNameUI();
  const dayEl=document.getElementById('launch-day');
  const profileEl=document.getElementById('launch-profile');
  if(dayEl)dayEl.textContent=getRealDay();
  if(profileEl){
    profileEl.textContent=profile.level==='perso' ? customProfileSummary() : ((profile.level&&LEVELS[profile.level]) ? LEVELS[profile.level].label : 'À configurer');
  }
  const resumeBtn=document.getElementById('resume-button');
  if(resumeBtn)resumeBtn.classList.toggle('hidden',!hasResumeState());
}
function showLaunch(){
  const launch=document.getElementById('launch-screen');
  const setup=document.getElementById('setup-screen');
  const app=document.getElementById('app-screen');
  if(launch)launch.classList.remove('hidden');
  if(setup)setup.classList.add('hidden');
  if(app)app.classList.add('hidden');
  updateLaunchInfo();
}

function resumeFromLaunch(){
  if(!restoreAppState()){
    startFreshFromLaunch();
  }
}

function startFreshFromLaunch(){
  clearResumeState();
  guidedSession=null;
  timer.running=false;
  clearInterval(timer.interval);
  const launch=document.getElementById('launch-screen');
  if(launch)launch.classList.add('hidden');

  if(profile.level){
    currentDay=getRealDay();
    activeTab='today';
    storageSafe.setItem('vv-current-day',currentDay);
    document.getElementById('app-screen').classList.remove('hidden');
    renderAll();
    showTab('plan');
  }else{
    document.getElementById('setup-screen').classList.remove('hidden');
    renderChoices();
  }
}

function enterFromLaunch(){
  startFreshFromLaunch();
}
function openSetupFromLaunch(){
  const launch=document.getElementById('launch-screen');
  if(launch)launch.classList.add('hidden');
  document.getElementById('app-screen').classList.add('hidden');
  document.getElementById('setup-screen').classList.remove('hidden');
  renderChoices();
}


function ensureAdaptiveMode(){
  profile.mode='adaptive';
  storageSafe.setItem('vv-mode','adaptive');
}

function boot(){
  applyColorTheme();
  applyTimerColor();
  updateAppNameUI();
  ensureAdaptiveMode();
  loadPrepTime();
  renderChoices();
  currentDay=getRealDay();
  storageSafe.setItem('vv-current-day',currentDay);
  showLaunch();

  bindNavigationTabs();

  showTab(currentTab||'today');
}
function exerciseDoneKey(ex){
  if(!ex)return 'exercice';
  return ex.doneKey || ex.id || ex.name || 'exercice';
}
function key(ex,day=currentDay){return profile.level+'-'+profile.mode+'-'+day+'-'+exerciseDoneKey(ex)}
function legacyKey(ex,day=currentDay){return profile.level+'-'+profile.mode+'-'+day+'-'+((ex&&ex.name)||'exercice')}
function getDone(ex,day=currentDay){
  const stable='done-'+key(ex,day);
  if(storageSafe.getItem(stable)==='1')return true;
  const legacy='done-'+legacyKey(ex,day);
  return legacy!==stable && storageSafe.getItem(legacy)==='1';
}
function setDone(ex,v,opts={},day=currentDay){
  const was=getDone(ex,day);
  const stable='done-'+key(ex,day);
  const legacy='done-'+legacyKey(ex,day);
  storageSafe.setItem(stable,v?'1':'0');
  if(legacy!==stable)storageSafe.setItem(legacy,v?'1':'0');
  if(v&&!was&&ex.type!=='repos')logExerciseDone(ex,day);
  if(!opts.silent){
    renderAll();
    saveAppState();
  }
}
function getNote(ex,day=currentDay){return storageSafe.getItem('note-'+key(ex,day))||''}
function setNote(ex,v,day=currentDay){storageSafe.setItem('note-'+key(ex,day),v)}
function pct(day){
  const ex=P()[day].exercises.filter(e=>e.type!=='repos');
  if(!ex.length)return 0;
  return Math.round(ex.filter(e=>getDone(e,day)).length/ex.length*100);
}


function getTimerExerciseOptions(){
  const seen=new Set();
  const items=[];

  DAYS.forEach(day=>{
    const dayProgram=P()[day];
    if(!dayProgram||!dayProgram.exercises)return;

    dayProgram.exercises.forEach((ex,index)=>{
      if(ex.type==='repos')return;

      const key=(ex.name||'')+'-'+(ex.circuit?'circuit':'single');
      if(seen.has(key))return;
      seen.add(key);

      items.push({day,index,ex});
    });
  });

  return items;
}


function hasActiveTimerSession(){
  if(!timer)return false;
  const hasTimeLeft=Number(timer.left)>0;
  return !!(
    timer.running ||
    timer.pendingStart ||
    timer.phase==='prep' ||
    (timer.guided && hasTimeLeft) ||
    (hasTimeLeft && timer.phase==='rest') ||
    (hasTimeLeft && timer.phase==='manual' && timer.left<timer.seconds) ||
    (hasTimeLeft && timer.phase==='effort' && timer.left<timer.seconds)
  );
}


function updateExerciseButtons(){
  if(typeof renderExercises==='function')renderExercises();
  if(typeof renderExerciseLibrary==='function')renderExerciseLibrary();
}

function renderTimerDaySelect(){
  if(hasActiveTimerSession()){
    updateTimer();
    updateTimerDetails();
    if(typeof renderExercises==='function')renderExercises();
    return;
  }
  renderTimerExerciseSelect();
}

function renderTimerExerciseSelect(){
  const exSelect=document.getElementById('timer-exercise-select');
  if(!exSelect)return;

  const items=getTimerExerciseOptions();
  exSelect.innerHTML=items.map((item,i)=>{
    const ex=item.ex;
    const label=ex.circuit
      ? ex.name+' · circuit '+ex.circuit.length+' étapes'
      : ex.name+' · '+fmt(ex.effort)+' / repos '+fmt(ex.rest);
    return '<option value="'+i+'">'+label+'</option>';
  }).join('');

  if(!hasActiveTimerSession())previewSelectedTimerExercise();
}

function previewSelectedTimerExercise(){
  if(hasActiveTimerSession())return;
  const exSelect=document.getElementById('timer-exercise-select');
  if(!exSelect)return;

  const items=getTimerExerciseOptions();
  const item=items[Number(exSelect.value)]||items[0];

  if(!item){
    setTimerState(90,'Aucun exercice disponible','PRÊT',null,0,null);
    return;
  }

  const ex=item.ex;

  if(ex.circuit&&ex.circuit.length){
    const first=ex.circuit[0];
    const exData={
      ...ex,
      target:ex.target||'Circuit',
      how:'Commence par : '+first.name+'. Suis ensuite les étapes affichées, dans l’ordre.',
      tips:ex.tips||'Passe d’un mouvement à l’autre sans te précipiter.'
    };
    setTimerState(first.effort,ex.name,'PRÊT',first.name,first.rest,exData);
    timer.circuit=ex.circuit;
    timer.circuitIndex=0;
  }else{
    setTimerState(ex.effort,ex.name,'PRÊT',ex.name,ex.rest,ex);
  }

  timer.sourceDay=null;
  timer.sourceIndex=null;
  updateTimer();
  saveAppState();
}

function startSelectedTimerExercise(){
  previewSelectedTimerExercise();
  toggleTimer();
}

function renderOptions(){
  const levelHTML=Object.entries(LEVELS).map(([k,v])=>`
    <button class="choice-btn ${profile.level===k?'active':''}" data-action="select-level" data-level="${k}">
      <strong>${v.label}</strong>
      <span>${v.desc||v.sub||''}</span>
    </button>
  `).join('');

  const opt=document.getElementById('options-content');
  if(!opt)return;
  const openOptionSections={};
  opt.querySelectorAll('details[data-options-section]').forEach(section=>{
    openOptionSections[section.dataset.optionsSection]=section.open;
  });
  const optionOpenAttr=(key,fallback=false)=>(openOptionSections[key]??fallback)?' open':'';
  opt.replaceChildren ? opt.replaceChildren() : opt.innerHTML='';

  opt.innerHTML=`
    <div class="page-header compact options-hero">
      <div>
        <h2>Profil</h2>
        <p>Réglages du profil et de l’app</p>
      </div>
    </div>

    <div class="options-stack">
      <div class="options-group">
        <div class="options-group-title">Profil</div>
      <details class="options-section options-dropdown" data-options-section="level"${optionOpenAttr('level')}>
        <summary><span>Niveau</span></summary>
        <div class="choice-grid">${levelHTML}</div>
        ${profile.level==='perso'&&customProfileOpen?'<div class="options-form-wrap">'+customProfileFormHTML()+'</div>':''}
      </details>

      <details class="options-section options-dropdown" data-options-section="equipment"${optionOpenAttr('equipment')}>
        <summary><span>Matériel disponible</span></summary>
        <div class="choice-grid">${equipmentChoicesHTML()}</div>
      </details>
      </div>

      <div class="options-group">
        <div class="options-group-title">Préférences</div>
      <details class="options-section options-dropdown options-section-inline" data-options-section="timer"${optionOpenAttr('timer')}>
        <summary><span>Minuteur son</span></summary>
        <button id="sound-toggle" class="sound-segment ${soundEnabled?'active':''}" type="button" aria-pressed="${soundEnabled?'true':'false'}" data-action="toggle-sound">
          <span>Off</span>
          <strong>On</strong>
        </button>
      </details>

      <details class="options-section options-dropdown" data-options-section="theme"${optionOpenAttr('theme')}>
        <summary><span>Thème couleur</span></summary>
        ${colorThemeOptionsHTML()}
      </details>

      <details class="options-section options-dropdown" data-options-section="music"${optionOpenAttr('music')}>
        <summary><span>Musique</span></summary>
        <div class="spotify-options">
          <label class="spotify-field">
            <span>Lien Spotify</span>
            <input id="spotify-url-input" type="url" value="${escapeHTML(spotifyUrl)}" placeholder="https://open.spotify.com/playlist/..." data-action="spotify-url">
          </label>
          <div class="spotify-actions">
            <button type="button" class="spotify-open-btn ${cleanSpotifyUrl(spotifyUrl)?'connected':''}" data-action="open-spotify">${cleanSpotifyUrl(spotifyUrl)?'Ouvrir Spotify':'Ajouter un lien'}</button>
            <button type="button" class="spotify-clear-btn" data-action="clear-media" data-media="spotify">Supprimer</button>
          </div>
          <label class="spotify-field">
            <span>Lien YouTube</span>
            <input id="youtube-url-input" type="url" value="${escapeHTML(youtubeUrl)}" placeholder="https://youtube.com/watch?v=... ou playlist" data-action="youtube-url">
          </label>
          <div class="spotify-actions">
            <button type="button" class="spotify-open-btn youtube-open-btn ${youtubeEmbedUrl(youtubeUrl)?'connected':''}" data-action="open-youtube">${youtubeEmbedUrl(youtubeUrl)?'Ouvrir YouTube':'Ajouter un lien'}</button>
            <button type="button" class="spotify-clear-btn" data-action="clear-media" data-media="youtube">Supprimer</button>
          </div>
          <p class="options-section-note">Colle un lien Spotify ou YouTube. L’app l’ouvre en overlay pendant ta séance sans modifier tes stats.</p>
        </div>
      </details>
      </div>

      <div class="options-group options-data-group">
        <div class="options-group-title">Données</div>
      <details class="options-section options-dropdown" data-options-section="data"${optionOpenAttr('data')}>
        <summary><span>Données</span></summary>
        <div class="choice-grid options-data-grid">
          <button class="choice-btn" type="button" data-action="export-data">
            <strong>Exporter mes données</strong>
            <span>Sauvegarde profil, notes, progression et stats en JSON.</span>
          </button>
          <button class="choice-btn" type="button" data-action="import-data">
            <strong>Importer une sauvegarde</strong>
            <span>Restaure un fichier exporté depuis vV Sport.</span>
          </button>
          <input id="import-data-input" class="hidden" type="file" accept="application/json,.json" data-action="import-file">
        </div>
      </details>

      <details class="options-section options-dropdown options-danger-section" data-options-section="reset"${optionOpenAttr('reset')}>
        <summary><span>Réinitialiser</span></summary>
        <div class="choice-grid danger-grid">
          <button class="choice-btn danger-choice" type="button" data-action="reset-progress">
            <strong>Progression cochée</strong>
            <span>Garde les notes, stats et réglages.</span>
          </button>
          <button class="choice-btn danger-choice" type="button" data-action="reset-notes">
            <strong>Notes personnelles</strong>
            <span>Supprime seulement les notes des cartes.</span>
          </button>
          <button class="choice-btn danger-choice" type="button" data-action="reset-stats">
            <strong>Stats et historique</strong>
            <span>Remet à zéro les séances, exercices et streak.</span>
          </button>
          <button class="choice-btn danger-choice" type="button" data-action="reset-profile">
            <strong>Profil et matériel</strong>
            <span>Relance la configuration initiale.</span>
          </button>
        </div>
      </details>
      </div>
    </div>

    <div class="app-version">${escapeHTML(cleanAppName(appName))} ${APP_VERSION}</div>

    <div class="options-apply">
      <button class="primary-btn" data-action="save-profile">Appliquer</button>
    </div>
  `;
  updateSpotifyUI();
  updateYouTubeUI();
  if(currentTab==='options')renderHeaderNavControls();
  renderMediaControls();
}

function profilePillLabel(){
  const levelLabel=(LEVELS&&LEVELS[profile.level]) ? LEVELS[profile.level].label : 'Perso';
  if(profile.level==='perso')return 'Perso · '+customProfileSummary();
  return levelLabel;
}

function profilePillHTML(){
  if(profile.level==='perso'){
    const name=profileDisplayName(customProfile);
    return '<span class="profile-avatar" aria-hidden="true"></span><span class="profile-copy"><strong>'+escapeHTML(name)+'</strong><em>'+escapeHTML(customGoalLabel())+' · '+escapeHTML((customProfile&&customProfile.sessionTime)||'45')+' min</em></span>';
  }
  const label=(LEVELS&&LEVELS[profile.level]) ? LEVELS[profile.level].label : 'À configurer';
  const sub=(LEVELS&&LEVELS[profile.level]) ? (LEVELS[profile.level].sub||'Programme standard') : 'Choisis ton profil';
  return '<span class="profile-avatar" aria-hidden="true"></span><span class="profile-copy"><strong>'+escapeHTML(label)+'</strong><em>'+escapeHTML(sub)+'</em></span>';
}

function renderAllImpl(){applyTimerColor();updateSessionRunner();if(typeof renderEquipment==='function')renderEquipment();if(typeof renderStats==='function')renderStats();if(typeof renderWeeklyPlan==='function')renderWeeklyPlan();renderTimerDaySelect();renderChoices();renderDays();renderInfo();renderExercises();renderExerciseLibrary();renderWeek();renderTimerFinishPanel();const pill=document.getElementById('profile-pill');if(pill)pill.innerHTML=profilePillHTML();document.getElementById('tip-mode').textContent=timerModeLabel ? timerModeLabel() : profilePillLabel()}

// Wrapper with memoization to prevent duplicate renders
function renderAll() {
  renderAllImpl();
}
function selectProgramDay(day,options={}){
  if(!DAYS.includes(day))return;
  currentDay=day;
  storageSafe.setItem('vv-current-day',currentDay);
  if(options.week)showProgramView('today',{keepDay:true});
  renderAll();
}
function renderDays(){document.getElementById('day-scroller').innerHTML=DAYS.map(d=>`<button class="day-chip ${d===currentDay?'active':''}" data-action="select-day" data-day="${d}">${d}</button>`).join('')}

let guidedSession=null;
let customSessionSelection=[];
let savedCustomSessions=[];
let lastCompletedSession=null;
try{
  customSessionSelection=JSON.parse(storageSafe.getItem('vv-custom-session-selection')||'[]');
  if(!Array.isArray(customSessionSelection))customSessionSelection=[];
}catch(e){
  customSessionSelection=[];
}
try{
  savedCustomSessions=JSON.parse(storageSafe.getItem('vv-saved-custom-sessions')||'[]');
  if(!Array.isArray(savedCustomSessions))savedCustomSessions=[];
}catch(e){
  savedCustomSessions=[];
}

function libraryItemKey(item){
  if(!item||!item.ex)return '';
  const ex=item.ex;
  if(item.libraryOnly)return 'lib|'+(ex.name||'')+'|'+(ex.target||'');
  return 'program|'+(item.day||'')+'|'+(ex.name||'')+'|'+(ex.target||'')+'|'+(ex.sets||'');
}

function saveCustomSessionSelection(){
  storageSafe.setItem('vv-custom-session-selection',JSON.stringify(customSessionSelection));
  saveAppState();
}

function saveSavedCustomSessions(){
  storageSafe.setItem('vv-saved-custom-sessions',JSON.stringify(savedCustomSessions));
  saveAppState();
}

function getCustomSessionItems(){
  const items=getExerciseLibraryItems();
  const map=new Map(items.map(item=>[libraryItemKey(item),item]));
  return customSessionSelection.map(key=>map.get(key)).filter(Boolean);
}

function customSessionMinutes(items=getCustomSessionItems()){
  const seconds=items.reduce((sum,item)=>{
    const ex=item.ex;
    if(ex.circuit&&ex.circuit.length)return sum+ex.circuit.reduce((s,step)=>s+(step.effort||0)+(step.rest||0),0);
    return sum+(ex.effort||60)+(ex.rest||0);
  },0);
  return Math.max(1,Math.round(seconds/60));
}

function exerciseToCustomSteps(item){
  if(!item||!item.ex)return [];
  const ex=item.ex;
  if(ex.circuit&&ex.circuit.length){
    return ex.circuit.map((step,idx)=>({
      custom:true,
      source:ex.name,
      isLastForExercise:idx===ex.circuit.length-1,
      name:step.name,
      effort:step.effort,
      rest:step.rest,
      target:ex.target||'Circuit',
      sets:(idx+1)+'/'+ex.circuit.length,
      how:'Circuit : '+ex.name+'. Étape '+(idx+1)+' : '+step.name+'.',
      tips:ex.tips||'Garde un mouvement propre et enchaîne calmement.',
      svg:ex.svg||'default',
      original:ex
    }));
  }
  return [{
    custom:true,
    source:ex.name,
    isLastForExercise:true,
    name:ex.name,
    effort:ex.effort||60,
    rest:ex.rest||0,
    target:ex.target,
    sets:ex.sets,
    how:ex.how,
    tips:ex.tips,
    svg:ex.svg,
    original:ex
  }];
}

function buildSessionSteps(day){
  const program=P()[day];
  if(!program||!program.exercises)return [];

  const steps=[];
  program.exercises.forEach((ex,exerciseIndex)=>{
    if(ex.type==='repos')return;

    if(ex.circuit&&ex.circuit.length){
      ex.circuit.forEach((step,idx)=>{
        steps.push({
          source:ex.name,
          sourceKey:exerciseDoneKey(ex),
          exerciseIndex,
          isLastForExercise:idx===ex.circuit.length-1,
          name:step.name,
          effort:step.effort,
          rest:step.rest,
          target:ex.target||'Circuit',
          sets:(idx+1)+'/'+ex.circuit.length,
          how:'Circuit : '+ex.name+'. Étape '+(idx+1)+' : '+step.name+'.',
          tips:ex.tips||'Passe à l’exercice suivant sans te précipiter, en gardant une technique propre.',
          svg:ex.svg||'default',
          isCircuitStep:true
        });
      });
    }else{
      steps.push({
        source:ex.name,
        sourceKey:exerciseDoneKey(ex),
        exerciseIndex,
        isLastForExercise:true,
        name:ex.name,
        effort:ex.effort,
        rest:ex.rest,
        target:ex.target,
        sets:ex.sets,
        how:ex.how,
        tips:ex.tips,
        svg:ex.svg,
        original:ex
      });
    }
  });

  return steps;
}

function currentDaySessionInfo(){
  const steps=buildSessionSteps(currentDay);
  const done=P()[currentDay].exercises.filter(ex=>ex.type!=='repos'&&getDone(ex)).length;
  const total=P()[currentDay].exercises.filter(ex=>ex.type!=='repos').length;
  const pct=total?Math.round(done/total*100):0;
  const nextExercise=P()[currentDay].exercises.find(ex=>ex.type!=='repos'&&!getDone(ex));
  return {steps,done,total,pct,nextExercise};
}

function estimatedDayMinutes(dayName=currentDay){
  const day=P()[dayName];
  const exercises=(day&&day.exercises?day.exercises:[]).filter(ex=>ex.type!=='repos');
  if(!exercises.length)return 0;
  return Math.max(1,Math.round(exercises.reduce((sum,ex)=>{
    if(ex.circuit&&ex.circuit.length){
      return sum+ex.circuit.reduce((s,st)=>s+(st.effort||0)+(st.rest||0),0);
    }
    return sum+(ex.effort||40)+(ex.rest||0);
  },0)/60));
}

function programHeroHTML(){
  const day=P()[currentDay];
  const info=currentDaySessionInfo();
  const restDay=!info.total;
  const next=info.nextExercise;
  const minutes=estimatedDayMinutes(currentDay);
  const buttonLabel=info.done>0?'Reprendre ma séance':'Démarrer ma séance';
  const status=restDay?'Repos':(info.pct>=100?'Terminé':(info.done?'En cours':'Prêt'));

  if(restDay){
    return '<div class="program-hero rest">'+
      '<div class="program-hero-main"><span>Programme du jour</span><strong>'+escapeHTML(currentDay)+'</strong><em>'+escapeHTML(day.title)+' · récupération</em></div>'+
      '<div class="program-hero-meter"><b>Repos</b><small>0 exercice compté</small></div>'+
      '<div class="program-hero-next">Tu peux cocher la carte repos pour marquer la journée, sans impacter tes stats sportives.</div>'+
    '</div>';
  }

  return '<div class="program-hero">'+
    '<div class="program-hero-main"><span>Programme du jour</span><strong>'+escapeHTML(currentDay)+'</strong><em>'+escapeHTML(day.title)+' · ~'+minutes+' min</em></div>'+
    '<div class="program-hero-meter"><b>'+info.pct+'%</b><small>'+info.done+'/'+info.total+' exercices</small></div>'+
    '<div class="program-hero-progress"><div style="width:'+info.pct+'%"></div></div>'+
    '<div class="program-hero-next">'+(next?'Prochain : '+escapeHTML(next.name):'Séance terminée')+'</div>'+
    '<button class="program-main-action" type="button" '+(info.pct>=100?'disabled':'data-action="start-today-session"')+'>'+(info.pct>=100?'Séance terminée':buttonLabel)+'</button>'+
    (info.pct>=100?sessionFeedbackHTML():'')+
  '</div>';
}

function sessionFeedbackHTML(){
  const fb=getSessionFeedback(currentDay);
  const selected=fb&&fb.value;
  const items=[
    ['easy','Trop facile'],
    ['good','Bien'],
    ['hard','Trop dur'],
    ['pain','Douleur']
  ];
  return '<div class="session-feedback"><div class="session-feedback-title">Ressenti de séance</div><div class="session-feedback-grid">'+
    items.map(([value,label])=>'<button type="button" class="'+(selected===value?'active':'')+'" data-action="save-feedback" data-value="'+value+'">'+label+'</button>').join('')+
  '</div><div class="session-feedback-note">'+(selected?'Pris en compte pour adapter la suite.':'Ton choix adapte les prochaines séances Perso.')+'</div></div>';
}

function sessionFeedbackButtonsHTML(day=currentDay){
  const fb=getSessionFeedback(day);
  const selected=fb&&fb.value;
  const items=[
    ['easy','Trop facile'],
    ['good','Bien'],
    ['hard','Trop dur'],
    ['pain','Douleur']
  ];
  return '<div class="session-feedback-grid">'+
    items.map(([value,label])=>'<button type="button" class="'+(selected===value?'active':'')+'" data-action="save-feedback" data-value="'+value+'" data-day="'+day+'">'+label+'</button>').join('')+
  '</div>';
}

function renderTimerFinishPanel(){
  const panel=document.getElementById('timer-finish-panel');
  if(!panel)return;
  if(!lastCompletedSession){
    panel.classList.add('hidden');
    panel.innerHTML='';
    return;
  }
  const day=lastCompletedSession.day&&DAYS.includes(lastCompletedSession.day) ? lastCompletedSession.day : currentDay;
  const fb=getSessionFeedback(day);
  panel.classList.remove('hidden');
  panel.innerHTML=
    '<div class="timer-finish-title">Séance terminée</div>'+
    '<div class="timer-finish-sub">'+escapeHTML(lastCompletedSession.label||'Bon travail. Garde ce ressenti pour adapter la suite.')+'</div>'+
    '<div class="timer-finish-feedback">'+
      '<span>Ressenti</span>'+
      sessionFeedbackButtonsHTML(day)+
      '<small>'+(fb?'Pris en compte pour les prochaines séances.':'Le coach adapte ensuite volume, repos et difficulté.')+'</small>'+
    '</div>'+
    '<button class="timer-finish-link" type="button" data-action="show-today">Voir mon programme</button>';
}

function startTodaySession(){
  const p=todayExerciseProgress();

  if(p.complete){
    showTab('today');
    updateSessionRunner();
    return;
  }

  const day=currentDay;
  const program=P()[day];
  const steps=buildSessionSteps(day).filter(step=>{
    if(!program||!program.exercises)return true;
    const original=program.exercises.find(ex=>ex.type!=='repos' && (exerciseDoneKey(ex)===step.sourceKey || ex.name===step.source || ex.name===step.name));
    return !original || !getDone(original,day);
  });

  if(steps.length){
    guidedSession={day,steps,index:0,startedAt:Date.now()};
    showTab('timer');
    updateSessionRunner();
    startGuidedStep(0);
    return;
  }

  updateSessionRunner();
}

function startGuidedStep(index){
  if(!guidedSession)return;

  const step=guidedSession.steps[index];
  if(!step){
    finishGuidedSession();
    return;
  }

  guidedSession.index=index;

  const exData={
    name:step.name,
    target:step.target||'Séance',
    sets:step.sets||'Étape '+(index+1),
    how:step.how||'Fais le mouvement calmement, sans te précipiter.',
    tips:step.tips||'Garde un mouvement propre et contrôlé.',
    svg:step.svg||'default'
  };

  setTimerState(step.effort,guidedSession.day+' · '+step.name,'PRÊT',step.name,step.rest,exData);
  timer.sourceDay=null;
  timer.sourceIndex=null;
  timer.guided=true;
  timer.guidedIndex=index;
  timer.guidedTotal=guidedSession.steps.length;
  updateSessionRunner();
  toggleTimer();

  syncTimerLabels();
  if(typeof updateMainTimerButton==='function')updateMainTimerButton();
}

function advanceGuidedSession(){
  if(!guidedSession)return false;

  markGuidedStepDone();

  const nextIndex=guidedSession.index+1;
  if(nextIndex>=guidedSession.steps.length){
    finishGuidedSession();
    return true;
  }

  startGuidedStep(nextIndex);
  return true;
}

function markGuidedStepDone(){
  if(!guidedSession)return;
  if(guidedSession.custom)return;
  const step=guidedSession.steps[guidedSession.index];
  if(!step || !step.isLastForExercise)return;
  const program=P()[guidedSession.day];
  if(!program || !program.exercises)return;
  let ex=null;
  if(Number.isInteger(step.exerciseIndex))ex=program.exercises[step.exerciseIndex];
  if(!ex){
    ex=program.exercises.find(item=>item.type!=='repos' && (exerciseDoneKey(item)===step.sourceKey || item.name===step.source));
  }
  if(ex && ex.type!=='repos')setDone(ex,true,{silent:true},guidedSession.day);
}

function finishGuidedSession(){
  if(!guidedSession)return;

  markGuidedStepDone();

  const day=guidedSession.day;
  const isCustom=!!guidedSession.custom;
  const finishedLabel=isCustom?'Séance personnalisée terminée':'Séance du jour terminée';
  const program=P()[day];
  if(!isCustom&&program&&program.exercises){
    program.exercises.forEach(ex=>{
      if(ex.type!=='repos')setDone(ex,true,{silent:true},day);
    });
  }

  guidedSession=null;
  timer.guided=false;
  lastCompletedSession={day:isCustom?currentDay:day,label:finishedLabel,custom:isCustom,finishedAt:Date.now()};
  updateSessionRunner();
  document.getElementById('timer-context').textContent=isCustom?'Séance perso terminée':'Séance terminée';
  document.getElementById('timer-phase').textContent='TERMINÉ';
  renderTimerFinishPanel();
  renderAll();
}

function stopGuidedSession(){
  guidedSession=null;
  timer.guided=false;
  timer.running=false;
  clearInterval(timer.interval);
  updateSessionRunner();
  updateTimer();
}


function todayExerciseProgress(){
  const day=P()[currentDay];
  if(!day || !day.exercises)return {total:0,done:0,nextIndex:-1,complete:false};

  const exercises=day.exercises.filter(ex=>ex.type!=='repos');
  const total=exercises.length;
  const done=exercises.filter(ex=>getDone(ex,currentDay)).length;
  const nextIndex=day.exercises.findIndex(ex=>ex.type!=='repos' && !getDone(ex,currentDay));

  return {total,done,nextIndex,complete:total>0 && done>=total};
}

function todaySessionStatusText(){
  const p=todayExerciseProgress();
  if(p.total===0)return 'Repos';
  if(p.complete)return 'Séance terminée';
  if(p.done===0)return 'Séance prête';
  return 'Séance en cours';
}

function todayNextExerciseText(){
  const p=todayExerciseProgress();
  if(p.total===0)return 'Aucun exercice prévu';
  if(p.complete)return 'Tous les exercices sont terminés';
  const next=P()[currentDay].exercises[p.nextIndex];
  return next ? 'Prochain exercice : '+next.name : 'Prochain exercice : –';
}

function updateSessionRunner(){
  const card=document.getElementById('session-runner-card');
  if(!card)return;

  if(guidedSession&&guidedSession.custom){
    const total=guidedSession.steps.length||0;
    const current=Math.min(total,(guidedSession.index||0)+1);
    const step=guidedSession.steps[guidedSession.index]||null;
    card.classList.remove('hidden','session-complete');
    card.innerHTML=`
      <div class="session-line">
        <span>Séance perso</span>
        <strong>${current}/${total}</strong>
      </div>
      <div class="session-next">${step?'En cours : '+escapeHTML(step.name):'Séance personnalisée prête.'}</div>
      <button class="session-runner-stop" type="button" data-action="stop-guided-session">Arrêter la séance</button>
    `;
    return;
  }

  const p=todayExerciseProgress();
  if(p.total===0){
    card.innerHTML=`
      <div class="session-line">
        <span>Statut</span>
        <strong>Repos</strong>
      </div>
      <div class="session-next">Aucune séance prévue aujourd’hui.</div>
    `;
    card.classList.add('session-complete');
    return;
  }

  if(p.complete || pct(currentDay)>=100){
    card.classList.add('session-complete');
    card.innerHTML=`
      <div class="session-line">
        <span>Statut</span>
        <strong>Séance terminée</strong>
      </div>
      <div class="session-next done">Tous les exercices sont terminés.</div>
      <button class="primary-btn session-complete-btn" type="button" disabled>Séance terminée</button>
    `;
    return;
  }

  card.classList.remove('session-complete');
  card.innerHTML=`
    <div class="session-line">
      <span>Avancement</span>
      <strong>${p.done}/${p.total} · ${Math.round((p.done/p.total)*100)}%</strong>
    </div>
    <div class="session-next">${todayNextExerciseText()}</div>
    <button class="primary-btn" data-action="start-today-session">${p.done>0?'Reprendre ma séance':'Démarrer ma séance du jour'}</button>
  `;
}



function sessionPlanHTML(){
  const exercises=(P()[currentDay]&&P()[currentDay].exercises?P()[currentDay].exercises:[]).filter(ex=>ex.type!=='repos');
  if(!exercises.length){
    return '<div class="session-plan"><div class="session-plan-title">Plan du jour</div><div class="session-plan-empty">Repos aujourd’hui.</div></div>';
  }

  const next=exercises.filter(ex=>!getDone(ex)).slice(0,4);
  const shown=next.length?next:exercises.slice(0,4);
  const remaining=exercises.filter(ex=>!getDone(ex)).length;
  const estimatedMinutes=Math.max(1,Math.round(exercises.reduce((sum,ex)=>{
    if(ex.circuit&&ex.circuit.length){
      return sum+ex.circuit.reduce((s,st)=>s+(st.effort||0)+(st.rest||0),0);
    }
    return sum+(ex.effort||40)+(ex.rest||0);
  },0)/60));

  return '<div class="session-plan">'+
    '<div class="session-plan-title"><span>Plan du jour</span><strong>'+remaining+' restant · ~'+estimatedMinutes+' min</strong></div>'+
    shown.map((ex,i)=>'<div class="session-plan-item">'+
      '<span>'+(i+1)+'. '+ex.name+'</span>'+
      '<em>'+(ex.circuit?'circuit':(ex.effort?fmt(ex.effort):'–'))+'</em>'+
    '</div>').join('')+
  '</div>';
}

function sessionStatusHTML(){
  const info=currentDaySessionInfo();
  if(!info.total){
    return '<div class="session-status"><div class="session-next">Jour de repos : aucune séance guidée à lancer.</div></div>';
  }

  const visualPct=pct(currentDay);
  const isComplete=(info.done>=info.total) || visualPct>=100 || !info.nextExercise;
  if(isComplete){
    return '<div class="session-status session-complete">'+
      '<div class="session-status-title"><span>Avancement</span><strong>'+info.total+'/'+info.total+' · 100%</strong></div>'+
      '<div class="session-next done">Tous les exercices sont terminés.</div>'+
    '</div>';
  }

  const next=info.nextExercise ? info.nextExercise.name : '–';
  if(String(next).toLowerCase().includes('séance terminée') || String(next).toLowerCase().includes('seance terminee')){
    return '<div class="session-status session-complete">'+
      '<div class="session-status-title"><span>Avancement</span><strong>'+info.total+'/'+info.total+' · 100%</strong></div>'+
      '<div class="session-next done">Tous les exercices sont terminés.</div>'+
    '</div>';
  }
  return '<div class="session-status">'+
    '<div class="session-status-title"><span>Avancement</span><strong>'+info.done+'/'+info.total+' · '+info.pct+'%</strong></div>'+
    '<div class="session-next">Prochain exercice : '+next+'</div>'+
  '</div>';
}

function renderInfo(){
  const p=P()[currentDay];
  const info=currentDaySessionInfo();
  const progress=pct(currentDay);
  const restDay=!info.total;
  if(restDay){
    document.getElementById('day-info-card').innerHTML=programHeroHTML();
    return;
  }
  document.getElementById('day-info-card').innerHTML=
    `<div class="card day-detail-card"><div class="card-info"><div><div class="day-name">${currentDay}${currentDay===getRealDay()?' · Aujourd’hui':''}</div><div class="day-title">${p.title} · ${p.duration}</div><div class="warmup">Échauffement : ${p.warmup}</div></div><button class="reset-btn" data-action="reset-day">Reset</button></div><div class="prog-row"><span class="prog-label">Progression</span><span class="prog-pct">${progress}%</span></div><div class="prog-track"><div class="prog-fill" style="width:${progress}%"></div></div>${sessionStatusHTML()}<button class="primary-btn day-session-action" ${progress>=100?'disabled':'data-action="start-today-session"'}>${progress>=100?'Séance terminée':(progress>0?'Reprendre ma séance':'Démarrer ma séance')}</button>${sessionPlanHTML()}</div>`;
}

function circuitHTML(ex){
  if(!ex.circuit||!ex.circuit.length)return '';
  return '<div class="circuit-list">'+
    ex.circuit.map((step,idx)=>'<div class="circuit-item"><span><span class="circuit-order">'+(idx+1)+'.</span> <strong>'+step.name+'</strong></span><span>'+fmt(step.effort)+' / repos '+fmt(step.rest)+'</span></div>').join('')+
  '</div>';
}
function currentCircuitStepText(){
  if(!timer.circuit||!timer.circuit.length)return '';
  const step=timer.circuit[timer.circuitIndex];
  if(!step)return '';
  const next=timer.circuit[timer.circuitIndex+1];
  return 'Étape '+(timer.circuitIndex+1)+'/'+timer.circuit.length+' : '+step.name+(next?' · ensuite '+next.name:' · dernier exercice du circuit');
}

function renderExercises(){
  const prog=P();
  const list=document.getElementById('exercise-list');
  if(!list || !prog[currentDay])return;

  list.innerHTML=prog[currentDay].exercises.map((ex,i)=>{
    const visualKey=chooseExerciseVisual(ex);
    const visual=SVGS[visualKey]||SVGS[ex.svg]||SVGS.default;
    const checkLabel=ex.type==='repos'?'Valider le repos':'Valider l’exercice';
    return `<div class="ex-card ${ex.type==='repos'?'rest-card':''} ${getDone(ex)?'done':''}" data-action="toggle-card"><div class="ex-header"><div class="ex-title-block"><div class="ex-name">${ex.name}</div><div class="ex-sets">${ex.sets}</div></div><div class="ex-actions"><svg class="ex-chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5 7l5 5 5-5"/></svg>${ex.type==='repos'?'':`<button type="button" class="mini-timer-btn ${timer.exercise===ex.name&&timer.running?'active':''}" data-exercise="${ex.name}" title="Démarrer l’exercice" aria-label="Démarrer l’exercice" data-action="start-exercise" data-day="${currentDay}" data-index="${i}">▶</button>`}<button type="button" class="check-btn ${getDone(ex)?'done':''}" title="${checkLabel}" aria-label="${checkLabel}" data-action="check-exercise" data-day="${currentDay}" data-index="${i}">✓</button></div></div><div class="ex-body"><div class="ex-visual" data-visual="${visualKey}">${visual}</div>${exerciseMetaHTML(ex)}${tutorialLinkHTML(ex)}${ex.type==='repos'?'':`<div class="ex-timer-line">${ex.circuit?'Circuit guidé · '+ex.circuit.length+' étapes':'Effort '+fmt(ex.effort)+' · Récupération '+fmt(ex.rest)}</div>`}${circuitHTML(ex)}<textarea class="ex-note" placeholder="Note personnelle..." data-action="exercise-note" data-day="${currentDay}" data-index="${i}">${getNote(ex)}</textarea></div></div>`;
  }).join('');
}

function exerciseMetaHTML(ex){
  const rows=[
    ['Cible',ex.target||'–'],
    ['Faire',ex.how||'Fais le mouvement avec contrôle.'],
    ['Conseil',ex.tips||'Garde une technique propre.']
  ];
  return '<div class="ex-meta ex-meta-grid">'+rows.map(([label,value])=>
    '<div class="ex-meta-row"><span>'+escapeHTML(label)+'</span><p>'+escapeHTML(value)+'</p></div>'
  ).join('')+'</div>';
}




function getExerciseLibraryItems(){
  const program=P();
  const seen=new Set();
  const items=[];
  DAYS.forEach(day=>{
    const exercises=(program[day]&&program[day].exercises)||[];
    exercises.forEach((ex,index)=>{
      if(!ex||ex.type==='repos')return;
      const key=(ex.name||'')+'|'+(ex.target||'')+'|'+(ex.sets||'');
      if(seen.has(key))return;
      seen.add(key);
      const item={day,index,ex,theme:inferExerciseTheme(ex),source:'programme'};
      item.key=libraryItemKey(item);
      items.push(item);
    });
  });
  const ctx=adaptiveContext();
  ADAPTIVE_LIBRARY.forEach(item=>{
    if(!equipmentOk(item) || !limitationOk(item,ctx))return;
    const ex=makeAdaptiveExercise(item,ctx);
    const key=(ex.name||'')+'|'+(ex.target||'');
    if(seen.has(key))return;
    seen.add(key);
    const libraryItem={day:null,index:null,ex,theme:item.movement,source:'bibliotheque',libraryOnly:true};
    libraryItem.key=libraryItemKey(libraryItem);
    items.push(libraryItem);
  });
  return items;
}

const EXERCISE_THEME_LABELS={
  push:'Push',
  pull:'Pull',
  legs:'Jambes',
  core:'Gainage / abdos',
  cardio:'Cardio',
  mobility:'Mobilité'
};
const EXERCISE_THEME_ORDER=['push','pull','legs','core','cardio','mobility'];

function inferExerciseTheme(ex){
  const text=((ex&&ex.name)||'')+' '+((ex&&ex.target)||'')+' '+((ex&&ex.type)||'')+' '+((ex&&ex.svg)||'');
  const n=text.toLowerCase();
  if(/cardio|vélo|velo|tapis|marche|mountain|souffle|zone 2/.test(n))return 'cardio';
  if(/mobilité|mobilite|étirement|etirement|poignet|hanche|cheville|thoracique|respiration|récup/.test(n))return 'mobility';
  if(/jambe|squat|fente|mollet|chaise|fessier|split|bulgarian/.test(n))return 'legs';
  if(/dos|rowing|traction|curl|biceps|pull|oiseau|face pull/.test(n))return 'pull';
  if(/abdo|gainage|planche|core|hollow|dead bug|crunch|relevé|releve/.test(n))return 'core';
  return 'push';
}

function exerciseCardHTML(item,libraryIndex){
  const ex=item.ex;
  const visualKey=chooseExerciseVisual(ex);
  const visual=SVGS[visualKey]||SVGS[ex.svg]||SVGS.default;
  const timing=ex.circuit?'Circuit guidé · '+ex.circuit.length+' étapes':'Effort '+fmt(ex.effort||60)+' · Récupération '+fmt(ex.rest||0);
  const sourceLabel=item.source==='programme' ? item.day+' · programme' : 'Bibliothèque · exercice seul';
  const selected=customSessionSelection.includes(item.key||libraryItemKey(item));
  const sessionKey=item.key||libraryItemKey(item);
  return `<div class="ex-card library-ex-card ${selected?'session-selected':''}" data-session-key="${escapeHTML(sessionKey)}" data-action="toggle-card">
    <div class="ex-header">
      <div class="library-title-row">
        <div class="ex-title-block">
          <div class="ex-name">${ex.name}</div>
          <div class="ex-sets">${ex.sets||sourceLabel}</div>
          <div class="exercise-source">${sourceLabel}</div>
          <button type="button" class="select-session-btn ${selected?'active':''}" data-session-key="${escapeHTML(sessionKey)}" title="${selected?'Retirer de la séance':'Ajouter à la séance'}" aria-label="${selected?'Retirer de la séance':'Ajouter à la séance'}" aria-pressed="${selected?'true':'false'}" data-action="toggle-custom-session" data-index="${libraryIndex}">${selected?'Ajouté':' + Séance'}</button>
        </div>
      </div>
      <div class="ex-actions">
        <button type="button" class="mini-timer-btn" title="Lancer l’exercice" aria-label="Lancer l’exercice" data-action="start-library-exercise" data-index="${libraryIndex}">▶</button>
        <svg class="ex-chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M5 7l5 5 5-5"/></svg>
      </div>
    </div>
    <div class="ex-body">
      <div class="ex-visual" data-visual="${visualKey}">${visual}</div>
      ${exerciseMetaHTML(ex)}
      ${tutorialLinkHTML(ex)}
      <div class="ex-timer-line">${timing}</div>
      ${circuitHTML(ex)}
    </div>
  </div>`;
}

function syncCustomSessionCards(){
  document.querySelectorAll('.library-ex-card[data-session-key]').forEach(card=>{
    const key=card.getAttribute('data-session-key');
    const selected=customSessionSelection.includes(key);
    card.classList.toggle('session-selected',selected);
  });
  document.querySelectorAll('.select-session-btn[data-session-key]').forEach(btn=>{
    const key=btn.getAttribute('data-session-key');
    const selected=customSessionSelection.includes(key);
    btn.classList.toggle('active',selected);
    btn.textContent=selected?'Ajouté':'+ Séance';
    btn.title=selected?'Retirer de la séance':'Ajouter à la séance';
    btn.setAttribute('aria-label',selected?'Retirer de la séance':'Ajouter à la séance');
    btn.setAttribute('aria-pressed',selected?'true':'false');
  });
}

function renderCustomSessionBuilder(){
  const box=document.getElementById('custom-session-builder');
  if(!box)return;
  const items=getCustomSessionItems();
  const savedHTML=savedCustomSessions.length ? '<div class="saved-session-list">'+
    savedCustomSessions.map((session,index)=>
      '<div class="saved-session-item">'+
        '<div><strong>'+escapeHTML(session.name||('Séance '+(index+1)))+'</strong><span>'+((session.keys&&session.keys.length)||0)+' exercices · ~'+customSessionMinutesFromKeys(session.keys||[])+' min</span></div>'+
        '<div class="saved-session-actions">'+
          '<button type="button" data-action="load-saved-session" data-index="'+index+'">Charger</button>'+
          '<button type="button" data-action="start-saved-session" data-index="'+index+'">Lancer</button>'+
          '<button type="button" aria-label="Supprimer '+escapeHTML(session.name||'cette séance')+'" data-action="delete-saved-session" data-index="'+index+'">×</button>'+
        '</div>'+
      '</div>'
    ).join('')+
  '</div>' : '';

  if(!items.length){
    box.innerHTML='<div class="custom-session-empty"><strong>Séance personnalisée</strong><span>Sélectionne plusieurs exercices avec + pour créer ta séance.</span></div>'+savedHTML;
    box.classList.remove('has-items');
    return;
  }

  box.classList.add('has-items');
  box.innerHTML=
    '<div class="custom-session-head"><div><span>Séance personnalisée</span><strong>'+items.length+' exercice'+(items.length>1?'s':'')+' · ~'+customSessionMinutes(items)+' min</strong></div><button type="button" data-action="clear-custom-session">Vider</button></div>'+
    '<div class="custom-session-list">'+items.map((item,index)=>
      '<div class="custom-session-item"><span>'+(index+1)+'. '+escapeHTML(item.ex.name)+'</span><button type="button" aria-label="Retirer '+escapeHTML(item.ex.name)+'" data-action="remove-custom-session" data-index="'+index+'">×</button></div>'
    ).join('')+'</div>'+
    '<div class="custom-session-save-row">'+
      '<input id="custom-session-name" type="text" maxlength="32" placeholder="Nom de la séance" value="'+escapeHTML(defaultCustomSessionName())+'">'+
      '<button type="button" data-action="save-custom-session">Sauver</button>'+
    '</div>'+
    '<button class="custom-session-start" type="button" data-action="start-custom-session">Lancer ma séance perso</button>'+
    savedHTML;
}

function defaultCustomSessionName(){
  const d=new Date();
  return 'Séance '+DAYS[d.getDay()===0?6:d.getDay()-1];
}

function customSessionMinutesFromKeys(keys){
  if(!Array.isArray(keys)||!keys.length)return 0;
  const items=getExerciseLibraryItems();
  const map=new Map(items.map(item=>[libraryItemKey(item),item]));
  return customSessionMinutes(keys.map(key=>map.get(key)).filter(Boolean));
}

function saveCurrentCustomSession(){
  if(!customSessionSelection.length)return;
  const input=document.getElementById('custom-session-name');
  const name=(input&&input.value ? input.value.trim() : '') || defaultCustomSessionName();
  const session={id:'session-'+Date.now(),name,keys:[...customSessionSelection],createdAt:Date.now()};
  savedCustomSessions=[session,...savedCustomSessions.filter(s=>s.name!==name)].slice(0,8);
  saveSavedCustomSessions();
  renderCustomSessionBuilder();
}

function loadSavedCustomSession(index){
  const session=savedCustomSessions[Number(index)];
  if(!session || !Array.isArray(session.keys))return;
  customSessionSelection=[...session.keys];
  saveCustomSessionSelection();
  renderCustomSessionBuilder();
  syncCustomSessionCards();
}

function deleteSavedCustomSession(index){
  savedCustomSessions.splice(Number(index),1);
  saveSavedCustomSessions();
  renderCustomSessionBuilder();
}

function startSavedCustomSession(index){
  loadSavedCustomSession(index);
  startCustomSession();
}

function toggleCustomSessionItem(libraryIndex){
  const item=getExerciseLibraryItems()[Number(libraryIndex)];
  if(!item)return;
  const key=item.key||libraryItemKey(item);
  if(customSessionSelection.includes(key)){
    customSessionSelection=customSessionSelection.filter(k=>k!==key);
  }else{
    customSessionSelection.push(key);
  }
  saveCustomSessionSelection();
  renderCustomSessionBuilder();
  syncCustomSessionCards();
}

function removeCustomSessionItem(index){
  customSessionSelection.splice(Number(index),1);
  saveCustomSessionSelection();
  renderCustomSessionBuilder();
  syncCustomSessionCards();
}

function clearCustomSession(){
  customSessionSelection=[];
  saveCustomSessionSelection();
  renderCustomSessionBuilder();
  syncCustomSessionCards();
}

function startCustomSession(){
  const items=getCustomSessionItems();
  const steps=items.flatMap(exerciseToCustomSteps).filter(step=>step.effort>0);
  if(!steps.length)return;
  guidedSession={day:'Séance perso',label:'Séance personnalisée',custom:true,steps,index:0,startedAt:Date.now()};
  showTab('timer');
  updateSessionRunner();
  startGuidedStep(0);
  saveAppState();
}

function renderExerciseProfileQuick(){
  const box=document.getElementById('exercise-profile-quick');
  if(!box || !LEVELS)return;
  box.innerHTML=Object.entries(LEVELS).map(([k,v])=>{
    const isActive=profile.level===k;
    return `
    <button type="button"
      class="profile-chip ${isActive?'active is-active':''}"
      data-level="${k}"
      aria-pressed="${isActive?'true':'false'}"
      data-action="select-exercise-level">${v.label}</button>
  `;
  }).join('');
}

function selectExerciseLevel(k){
  if(!LEVELS || !LEVELS[k])return;
  profile.level=k;
  storageSafe.setItem('vv-level',k);
  renderChoices();
  if(typeof renderOptions==='function' && currentTab==='options')renderOptions();
  renderAll();
  saveAppState();
}

function renderExerciseLibrary(){
  renderExerciseProfileQuick();
  renderCustomSessionBuilder();
  const list=document.getElementById('exercise-library-list');
  if(!list)return;

  const items=getExerciseLibraryItems();
  if(!items.length){
    list.innerHTML='<div class="empty-card">Aucun exercice disponible.</div>';
    return;
  }

  list.innerHTML=EXERCISE_THEME_ORDER.map(theme=>{
    const group=items.map((item,index)=>({...item,libraryIndex:index})).filter(item=>item.theme===theme);
    if(!group.length)return '';
    return `<details class="exercise-theme-section">
      <summary class="exercise-theme-head">
        <span>${EXERCISE_THEME_LABELS[theme]}</span>
        <strong>${group.length}</strong>
      </summary>
      ${group.map(item=>exerciseCardHTML(item,item.libraryIndex)).join('')}
    </details>`;
  }).join('');
}

function startLibraryExercise(libraryIndex){
  const item=getExerciseLibraryItems()[Number(libraryIndex)];
  if(!item)return;
  if(item.libraryOnly){
    const ex=item.ex;
    setTimerState(ex.effort||60,ex.name,'EXERCICE',ex.name,ex.rest||0,ex);
    timer.freeMode=true;
    timer.sourceDay=null;
    timer.sourceIndex=null;
    startPrepCountdown();
    updateTimerDetails();
    updateTimer();
    showTab('timer');
    saveAppState();
    return;
  }
  startExerciseTimer(item.day,item.index,{free:true});
}

function handleCheckClick(event,day,index){
  if(event){
    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
  }

  const targetDay=day || currentDay;
  const targetIndex=Number(index);

  toggleExerciseDone(targetDay,targetIndex);
  return false;
}

function toggleExerciseDone(day,index){
  const program=P();
  const targetDay=day || currentDay;
  const targetIndex=Number(index);

  if(!program[targetDay] || !program[targetDay].exercises || !program[targetDay].exercises[targetIndex])return false;

  const ex=program[targetDay].exercises[targetIndex];

  const next=!getDone(ex,targetDay);
  setDone(ex,next,{silent:true},targetDay);
  renderAll();
  updateTimerValidateButton();
  saveAppState();
  return next;
}

function toggleCard(el){el.classList.toggle('open')}function resetDay(){
  P()[currentDay].exercises.forEach(e=>setDone(e,false,{silent:true}));
  renderAll();
  saveAppState();

  updateSessionRunner();
}
function resetWeek(){
  DAYS.forEach(d=>P()[d].exercises.forEach(e=>{
    setDone(e,false,{silent:true},d);
  }));
  renderAll();
  saveAppState();
}
function renderWeek(){const grid=document.getElementById('week-grid');if(!grid)return;grid.innerHTML=DAYS.map(d=>{const p=pct(d);return `<div class="week-card ${d===currentDay?'today':''}" data-action="week-day" data-day="${d}"><div class="wday">${d}</div><div class="wtitle">${P()[d].title}</div><div class="wpct ${p===100?'full':''}">${p}%</div><div class="week-prog-track"><div class="week-prog-fill" style="width:${p}%"></div></div><span class="badge ${p===100?'badge-done':p>0?'badge-partial':'badge-rest'}">${p===100?'fait':p>0?'en cours':'à faire'}</span></div>`}).join('')}


const WEEKLY_PLAN_KEY='vv-weekly-plan-v1';
const SAVED_WEEKLY_PLANS_KEY='vv-saved-weekly-plans-v1';
const WEEKLY_PLAN_TYPES={
  rest:'Repos',
  routine:'Exercice libre',
  session:'Séance'
};
let weeklyPlanEditing=false;
let weeklyPlan=loadWeeklyPlan();
let selectedSavedWeeklyPlanId='';
Object.defineProperty(window,'selectedSavedWeeklyPlanId',{get(){return selectedSavedWeeklyPlanId;}});

function defaultWeeklyPlan(template='current'){
  const plan={version:1,template,days:{}};
  const sportDays=template==='3days'?3:(template==='4days'?4:Math.max(1,DAYS.filter(day=>!isRestProgramDay(day)).length));
  const routineDays=template==='3days'
    ? planDaysForCount(3)
    : (template==='4days'?planDaysForCount(4):DAYS.filter(day=>!isRestProgramDay(day)));
  plan.sportDays=sportDays;
  DAYS.forEach(day=>{
    const routine=routineDays.includes(day);
    plan.days[day]={type:routine?'routine':'rest',routineDay:day,sessionId:'',exerciseKey:''};
  });
  return plan;
}

function planDaysForCount(count){
  const presets={
    1:['Mercredi'],
    2:['Mardi','Vendredi'],
    3:['Lundi','Mercredi','Vendredi'],
    4:['Lundi','Mardi','Jeudi','Samedi'],
    5:['Lundi','Mardi','Mercredi','Vendredi','Samedi'],
    6:['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']
  };
  return presets[Math.max(1,Math.min(6,Number(count)||3))] || presets[3];
}

function normalizeWeeklyPlan(plan){
  const fallback=defaultWeeklyPlan('current');
  const next={...fallback,...(plan||{})};
  next.days={...fallback.days,...(plan&&plan.days?plan.days:{})};
  next.sportDays=Math.max(1,Math.min(6,Number(next.sportDays)||DAYS.filter(day=>next.days[day]&&next.days[day].type!=='rest').length||3));
  DAYS.forEach(day=>{
    next.days[day]={type:'routine',routineDay:day,sessionId:'',exerciseKey:'',customName:'',customKeys:[],customExerciseNames:{},...(next.days[day]||{})};
    if(next.days[day].type==='exercise'){
      next.days[day].type='routine';
      if(next.days[day].exerciseKey){
        const keys=Array.isArray(next.days[day].customKeys)?next.days[day].customKeys:[];
        if(!keys.includes(next.days[day].exerciseKey))keys.push(next.days[day].exerciseKey);
        next.days[day].customKeys=keys;
      }
    }
    if(!WEEKLY_PLAN_TYPES[next.days[day].type])next.days[day].type='routine';
    if(!DAYS.includes(next.days[day].routineDay))next.days[day].routineDay=day;
    if(!Array.isArray(next.days[day].customKeys))next.days[day].customKeys=[];
    if(!next.days[day].customExerciseNames||typeof next.days[day].customExerciseNames!=='object')next.days[day].customExerciseNames={};
    if(/^Routine\b/i.test(String(next.days[day].customName||''))){
      next.days[day].customName=String(next.days[day].customName).replace(/^Routine\b/i,'Exercice libre');
    }
  });
  return next;
}

function loadWeeklyPlan(){
  try{return normalizeWeeklyPlan(JSON.parse(storageSafe.getItem(WEEKLY_PLAN_KEY)||'null'));}
  catch(e){return defaultWeeklyPlan('current');}
}

function saveWeeklyPlan(){
  weeklyPlan=normalizeWeeklyPlan(weeklyPlan);
  storageSafe.setItem(WEEKLY_PLAN_KEY,JSON.stringify(weeklyPlan));
}

function loadSavedWeeklyPlans(){
  try{
    const plans=JSON.parse(storageSafe.getItem(SAVED_WEEKLY_PLANS_KEY)||'[]');
    return Array.isArray(plans)?plans:[];
  }catch(e){return [];}
}

function saveSavedWeeklyPlans(plans){
  storageSafe.setItem(SAVED_WEEKLY_PLANS_KEY,JSON.stringify((plans||[]).slice(0,8)));
}

function savedWeeklyPlanOptions(){
  const plans=loadSavedWeeklyPlans();
  if(!plans.length)return '<option value="">Aucun plan sauvegardé</option>';
  return '<option value="">Charger un plan...</option>'+plans.map(plan=>
    '<option value="'+escapeHTML(plan.id)+'" '+(plan.id===selectedSavedWeeklyPlanId?'selected':'')+'>'+escapeHTML(plan.name||'Plan sauvegardé')+'</option>'
  ).join('');
}

function saveCurrentWeeklyPlanSnapshot(){
  saveWeeklyPlan();
  const plans=loadSavedWeeklyPlans().filter(plan=>plan&&plan.plan);
  const stamp=new Date();
  const name=(weeklyPlan.sportDays||weeklyPlanSelectedSportDays().length)+' jour'+((weeklyPlan.sportDays||0)>1?'s':'')+' · '+stamp.toLocaleDateString('fr-FR');
  plans.unshift({id:String(Date.now()),name,createdAt:stamp.toISOString(),plan:normalizeWeeklyPlan(weeklyPlan)});
  selectedSavedWeeklyPlanId=plans[0].id;
  saveSavedWeeklyPlans(plans);
  weeklyPlanEditing=false;
  renderWeeklyPlan();
  renderSetupPlan();
}

function loadWeeklyPlanSnapshot(id){
  const found=loadSavedWeeklyPlans().find(plan=>plan.id===id);
  if(!found||!found.plan)return;
  selectedSavedWeeklyPlanId=id;
  weeklyPlan=normalizeWeeklyPlan(found.plan);
  saveWeeklyPlan();
  weeklyPlanEditing=false;
  renderWeeklyPlan();
  renderSetupPlan();
}

function deleteWeeklyPlanSnapshot(){
  if(!selectedSavedWeeklyPlanId)return;
  const plans=loadSavedWeeklyPlans().filter(plan=>plan.id!==selectedSavedWeeklyPlanId);
  selectedSavedWeeklyPlanId='';
  saveSavedWeeklyPlans(plans);
  renderWeeklyPlan();
}

function weeklyPlanEntry(day){
  weeklyPlan=normalizeWeeklyPlan(weeklyPlan);
  return weeklyPlan.days[day]||defaultWeeklyPlan('current').days[day];
}

function weeklyPlanExerciseMap(){
  return new Map(getExerciseLibraryItems().map(item=>[item.key||libraryItemKey(item),item]));
}

function weeklyPlanCustomItems(day,entry=weeklyPlanEntry(day)){
  const map=weeklyPlanExerciseMap();
  const names=(entry&&entry.customExerciseNames)||{};
  return ((entry&&entry.customKeys)||[]).map(key=>{
    const item=map.get(key);
    if(!item)return null;
    return {key,item,name:names[key]||item.ex.name};
  }).filter(Boolean);
}

function weeklyPlanCustomRoutineName(day,entry=weeklyPlanEntry(day)){
  return (entry&&entry.customName&&entry.customName.trim()) || ('Exercice libre '+day);
}

function weeklyPlanCustomRoutineSteps(day,entry=weeklyPlanEntry(day)){
  return weeklyPlanCustomItems(day,entry).flatMap(selected=>{
    const label=selected.name||selected.item.ex.name;
    return exerciseToCustomSteps(selected.item).map(step=>({
      ...step,
      source:label,
      name:step.name===selected.item.ex.name ? label : step.name,
      original:{...(step.original||selected.item.ex),name:label}
    }));
  }).filter(step=>step.effort>0);
}

function weeklyPlanExerciseOptions(selectedKey){
  const items=getExerciseLibraryItems();
  if(!items.length)return '<option value="">Aucun exercice disponible</option>';
  return items.slice(0,80).map(item=>{
    const key=item.key||libraryItemKey(item);
    const ex=item.ex||{};
    return '<option value="'+escapeHTML(key)+'" '+(key===selectedKey?'selected':'')+'>'+escapeHTML(ex.name||'Exercice')+'</option>';
  }).join('');
}

function weeklyPlanSessionOptions(selectedId){
  if(!savedCustomSessions.length)return '<option value="">Aucune séance sauvegardée</option>';
  return savedCustomSessions.map((session,index)=>{
    const id=session.id||String(index);
    return '<option value="'+escapeHTML(id)+'" '+(id===selectedId?'selected':'')+'>'+escapeHTML(session.name||('Séance '+(index+1)))+'</option>';
  }).join('');
}

function weeklyPlanTypeOptions(selectedType){
  return Object.entries(WEEKLY_PLAN_TYPES).map(([value,label])=>
    '<option value="'+value+'" '+(value===selectedType?'selected':'')+'>'+label+'</option>'
  ).join('');
}

function weeklyPlanSportTypeOptions(selectedType){
  return Object.entries(WEEKLY_PLAN_TYPES).filter(([value])=>value!=='rest').map(([value,label])=>
    '<option value="'+value+'" '+(value===selectedType?'selected':'')+'>'+label+'</option>'
  ).join('');
}

function weeklyPlanRoutineOptions(selectedDay){
  return DAYS.map(day=>
    '<option value="'+day+'" '+(day===selectedDay?'selected':'')+'>'+day+' - '+escapeHTML((P()[day]&&P()[day].title)||'Programme')+'</option>'
  ).join('');
}

function weeklyPlanSportDaysOptions(selectedCount){
  return [1,2,3,4,5,6].map(count=>
    '<option value="'+count+'" '+(Number(selectedCount)===count?'selected':'')+'>'+count+' jour'+(count>1?'s':'')+' de sport</option>'
  ).join('');
}

function weeklyPlanSelectedSportDays(){
  weeklyPlan=normalizeWeeklyPlan(weeklyPlan);
  const desired=Math.max(1,Math.min(6,Number(weeklyPlan.sportDays)||3));
  const selected=DAYS.filter(day=>weeklyPlanEntry(day).type!=='rest').slice(0,desired);
  planDaysForCount(desired).forEach(day=>{
    if(selected.length<desired&&!selected.includes(day))selected.push(day);
  });
  DAYS.forEach(day=>{
    if(selected.length<desired&&!selected.includes(day))selected.push(day);
  });
  return selected.slice(0,desired);
}

function weeklyPlanDayOptions(selectedDay,selectedDays){
  return DAYS.map(day=>{
    const disabled=selectedDays.includes(day)&&day!==selectedDay;
    return '<option value="'+day+'" '+(day===selectedDay?'selected':'')+' '+(disabled?'disabled':'')+'>'+day+'</option>';
  }).join('');
}

function weeklyPlanDuplicateOptions(day){
  return '<option value="">Copier une journée...</option>'+DAYS.filter(d=>d!==day).map(d=>
    '<option value="'+d+'">'+d+' - '+escapeHTML(WEEKLY_PLAN_TYPES[weeklyPlanEntry(d).type]||'Plan')+'</option>'
  ).join('');
}

function weeklyPlanEntryMinutes(day,entry){
  if(entry.type==='rest')return 0;
  if(entry.type==='routine'){
    const customItems=weeklyPlanCustomItems(day,entry);
    return customItems.length ? customSessionMinutes(customItems.map(x=>x.item)) : estimatedDayMinutes(entry.routineDay||day);
  }
  if(entry.type==='session'){
    const session=savedCustomSessions.find((s,index)=>(s.id||String(index))===entry.sessionId);
    return session ? customSessionMinutesFromKeys(session.keys||[]) : 0;
  }
  if(entry.type==='exercise'){
    const item=getExerciseLibraryItems().find(x=>(x.key||libraryItemKey(x))===entry.exerciseKey);
    const ex=item&&item.ex;
    return ex ? Math.max(1,Math.round(((ex.effort||60)+(ex.rest||0))/60)) : 0;
  }
  return 0;
}

function weeklyPlanLoadSummary(){
  const entries=DAYS.map(day=>({day,entry:weeklyPlanEntry(day)}));
  const workouts=entries.filter(x=>x.entry.type!=='rest');
  const minutes=entries.reduce((sum,x)=>sum+weeklyPlanEntryMinutes(x.day,x.entry),0);
  const rest=entries.length-workouts.length;
  const busiest=entries.reduce((best,x)=>{
    const mins=weeklyPlanEntryMinutes(x.day,x.entry);
    return mins>(best.minutes||0)?{day:x.day,minutes:mins}:best;
  },{day:'',minutes:0});
  return {workouts:workouts.length,rest,minutes,busiest};
}

function weeklyPlanSummary(day,entry){
  if(entry.type==='rest')return 'Repos prévu';
  if(entry.type==='routine'){
    const customItems=weeklyPlanCustomItems(day,entry);
    if(customItems.length)return weeklyPlanCustomRoutineName(day,entry)+' · '+customItems.length+' exo'+(customItems.length>1?'s':'');
    const source=entry.routineDay||day;
    const p=P()[source];
    return 'Exercice libre '+source+' · '+(p&&p.title?p.title:'programme');
  }
  if(entry.type==='session'){
    const session=savedCustomSessions.find((s,index)=>(s.id||String(index))===entry.sessionId);
    return session ? 'Séance sauvegardée · '+(session.name||'Sans nom') : 'Séance sauvegardée à choisir';
  }
  if(entry.type==='exercise'){
    const item=getExerciseLibraryItems().find(x=>(x.key||libraryItemKey(x))===entry.exerciseKey);
    return item ? 'Exercice libre · '+item.ex.name : 'Exercice libre à choisir';
  }
  return 'Plan à définir';
}

function weeklyPlanEditFields(day,entry){
  const type=entry.type;
  const createSessionLink='<button type="button" class="plan-inline-action" data-action="create-plan-routine">Créer / programmer une séance</button>';
  const detail=type==='routine'
    ? '<label>Base programme<select data-action="plan-field" data-day="'+day+'" data-field="routineDay">'+weeklyPlanRoutineOptions(entry.routineDay||day)+'</select></label>'+weeklyPlanRoutineBuilderHTML(day,entry)
    : (type==='session'
      ? '<label>Séance sauvegardée<select data-action="plan-field" data-day="'+day+'" data-field="sessionId">'+weeklyPlanSessionOptions(entry.sessionId)+'</select></label>'+createSessionLink
      : '<div class="plan-rest-note">Repos actif ou vraie coupure. Rien ne sera compté dans les exercices.</div>');
  return '<div class="plan-edit-grid">'+
    '<label>Quoi faire ce jour<select data-action="plan-field" data-day="'+day+'" data-field="type">'+weeklyPlanTypeOptions(type)+'</select></label>'+
    detail+
  '</div>';
}

function weeklyPlanRoutineBuilderHTML(day,entry){
  const selected=weeklyPlanCustomItems(day,entry);
  const selectedKeys=new Set(((entry&&entry.customKeys)||[]));
  const items=getExerciseLibraryItems().map((item,index)=>({...item,libraryIndex:index}));
  const selectedHTML=selected.length
    ? '<div class="plan-routine-list">'+selected.map((selectedItem,index)=>
        '<div class="plan-routine-item">'+
          '<span>'+(index+1)+'</span>'+
          '<input type="text" maxlength="42" value="'+escapeHTML(selectedItem.name)+'" data-action="plan-routine-ex-name" data-day="'+day+'" data-key="'+escapeHTML(selectedItem.key)+'" aria-label="Renommer '+escapeHTML(selectedItem.name)+'">'+
          '<div class="plan-routine-item-actions">'+
            '<button type="button" data-action="move-plan-routine-exercise" data-day="'+day+'" data-index="'+index+'" data-dir="-1" aria-label="Monter">↑</button>'+
            '<button type="button" data-action="move-plan-routine-exercise" data-day="'+day+'" data-index="'+index+'" data-dir="1" aria-label="Descendre">↓</button>'+
            '<button type="button" data-action="remove-plan-routine-exercise" data-day="'+day+'" data-index="'+index+'" aria-label="Retirer">×</button>'+
          '</div>'+
        '</div>'
      ).join('')+'</div>'
    : '<div class="plan-routine-empty">Ajoute des exercices pour créer ta séance libre du jour. Sinon la base programme sera utilisée.</div>';
  const shopHTML=EXERCISE_THEME_ORDER.map(theme=>{
    const group=items.filter(item=>item.theme===theme);
    if(!group.length)return '';
    return '<details class="plan-shop-theme">'+
      '<summary><span>'+EXERCISE_THEME_LABELS[theme]+'</span><strong>'+group.length+'</strong></summary>'+
      '<div class="plan-shop-list">'+group.map(item=>{
        const key=item.key||libraryItemKey(item);
        const added=selectedKeys.has(key);
        return '<button type="button" class="plan-shop-item '+(added?'active':'')+'" data-action="add-plan-routine-exercise" data-day="'+day+'" data-index="'+item.libraryIndex+'" '+(added?'disabled':'')+'>'+
          '<span><b>'+escapeHTML(item.ex.name)+'</b><em>'+escapeHTML(item.ex.sets||item.ex.target||'Exercice')+'</em></span>'+
          '<strong>'+(added?'Ajouté':'+')+'</strong>'+
        '</button>';
      }).join('')+'</div>'+
    '</details>';
  }).join('');
  return '<div class="plan-routine-builder">'+
    '<label>Nom de la séance libre<input type="text" maxlength="36" value="'+escapeHTML(weeklyPlanCustomRoutineName(day,entry))+'" data-action="plan-routine-field" data-day="'+day+'" data-field="customName"></label>'+
    '<div class="plan-routine-head"><span>Exercice libre</span><strong>'+selected.length+' exercice'+(selected.length>1?'s':'')+'</strong></div>'+
    selectedHTML+
    '<details class="plan-routine-shop">'+
      '<summary><span>Ajouter des exercices</span><strong>Boutique</strong></summary>'+
      shopHTML+
    '</details>'+
  '</div>';
}

function renderWeeklyPlan(){
  const box=document.getElementById('weekly-plan-content');
  if(!box)return;
  weeklyPlan=normalizeWeeklyPlan(weeklyPlan);
  const today=getRealDay();
  const load=weeklyPlanLoadSummary();
  const selectedDays=weeklyPlanSelectedSportDays();
  const savedPlans=loadSavedWeeklyPlans();
  const canDeleteSavedPlan=Boolean(selectedSavedWeeklyPlanId&&savedPlans.some(plan=>plan.id===selectedSavedWeeklyPlanId));
  const levelLabel=(profile.level&&LEVELS[profile.level]) ? LEVELS[profile.level].label : 'Profil à choisir';
  const planTitle=(weeklyPlan.sportDays||selectedDays.length)+' jour'+((weeklyPlan.sportDays||selectedDays.length)>1?'s':'')+' de sport';
  const calendarPreview=DAYS.map(day=>{
    const entry=weeklyPlanEntry(day);
    const active=entry.type!=='rest';
    const minutes=weeklyPlanEntryMinutes(day,entry);
    const title=active ? (WEEKLY_PLAN_TYPES[entry.type]||'Sport') : 'Repos';
    const summary=entry.type==='rest'
      ? 'Journée libre'
      : (entry.type==='routine'
        ? escapeHTML(((P()[entry.routineDay||day]||{}).title)||'Programme')
        : escapeHTML(weeklyPlanSummary(day,entry).replace(/^Exercice libre · /,'').replace(/^Séance sauvegardée · /,'')));
    const head='<div class="plan-calendar-date"><strong>'+day.slice(0,3)+'</strong></div>'+
      '<div class="plan-calendar-event"><b>'+escapeHTML(title)+'</b><small>'+summary+'</small></div>'+
      '<div class="plan-calendar-meta">'+(minutes?'~'+minutes+' min':'Repos')+'</div>';
    if(weeklyPlanEditing){
      return '<details class="plan-calendar-day plan-calendar-drop '+(active?'active':'rest')+' '+(day===today?'today':'')+'" data-plan-day="'+day+'">'+
        '<summary class="plan-calendar-summary">'+head+'</summary>'+
        '<div class="plan-calendar-edit">'+weeklyPlanEditFields(day,entry)+'</div>'+
      '</details>';
    }
    return '<article class="plan-calendar-day '+(active?'active':'rest')+' '+(day===today?'today':'')+'" data-plan-day="'+day+'">'+head+'</article>';
  }).join('');
  const editPanel=weeklyPlanEditing
    ? '<div class="plan-editor-panel">'+
        '<details class="plan-subdrop">'+
          '<summary><span>Jours de sport / semaine</span><strong>'+escapeHTML(planTitle)+'</strong></summary>'+
          '<label class="plan-primary-select">Rythme<select data-action="plan-field" data-day="week" data-field="sportDays">'+weeklyPlanSportDaysOptions(weeklyPlan.sportDays)+'</select></label>'+
          '<div class="setup-plan-days">'+selectedDays.map((day,index)=>'<div class="setup-plan-day-row"><label class="setup-plan-day"><span>Jour '+(index+1)+'</span><select data-action="plan-field" data-day="sport-'+index+'" data-field="sportDay">'+weeklyPlanDayOptions(day,selectedDays)+'</select></label><label class="setup-plan-day setup-plan-day-type"><span>Activité</span><select data-action="plan-field" data-day="'+day+'" data-field="type">'+weeklyPlanSportTypeOptions(weeklyPlanEntry(day).type)+'</select></label></div>').join('')+'</div>'+
        '</details>'+
      '</div>'
    : '';
  box.innerHTML=
    '<section class="plan-summary-card">'+
      '<span>Résumé du choix</span>'+
      '<strong>'+escapeHTML(planTitle)+'</strong>'+
      '<p>'+escapeHTML(levelLabel)+' · '+escapeHTML(equipmentSummaryText())+'</p>'+
      '<div class="plan-summary-grid">'+
        '<div><span>Séances</span><strong>'+load.workouts+'</strong></div>'+
        '<div><span>Temps</span><strong>~'+load.minutes+' min</strong></div>'+
        '<div><span>Aujourd’hui</span><strong>'+escapeHTML(WEEKLY_PLAN_TYPES[weeklyPlanEntry(today).type]||'Plan')+'</strong></div>'+
      '</div>'+
      '<button class="program-main-action" type="button" data-action="launch-plan-today">Lancer aujourd’hui</button>'+
    '</section>'+
    '<section class="plan-manager-card plan-calendar-card">'+
      '<div class="plan-manager-head"><div><span>Calendrier semaine</span></div><button type="button" class="timer-secondary-btn" data-action="edit-plan">'+(weeklyPlanEditing?'Fermer':'Modifier')+'</button></div>'+
      '<details class="plan-section-drop" '+(weeklyPlanEditing?'open':'')+'><summary><span>Voir</span><strong>'+load.workouts+' séance'+(load.workouts>1?'s':'')+' prévue'+(load.workouts>1?'s':'')+'</strong></summary><div class="plan-calendar-week">'+calendarPreview+'</div>'+editPanel+'</details>'+
    '</section>'+
    '<section class="plan-manager-card">'+
      '<details class="plan-section-drop plan-save-drop">'+
        '<summary><span>Plans</span><strong>Sauvegarder ou reprendre</strong></summary>'+
        '<div class="plan-save-panel">'+
          '<div class="plan-manager-actions">'+
            '<button type="button" class="timer-secondary-btn" data-action="regenerate-plan">Refaire</button>'+
            '<button type="button" class="start-btn plan-save-btn" data-action="save-plan">Sauvegarder</button>'+
          '</div>'+
          '<div class="plan-load-row">'+
            '<label class="plan-load-select">Plan sauvegardé<select data-action="plan-field" data-day="week" data-field="selectSavedPlan">'+savedWeeklyPlanOptions()+'</select></label>'+
            '<div class="plan-load-actions">'+
              '<button type="button" class="timer-secondary-btn" data-action="load-selected-plan" '+(selectedSavedWeeklyPlanId?'':'disabled')+'>Charger</button>'+
              '<button type="button" class="timer-secondary-btn danger-choice" data-action="delete-selected-plan" '+(canDeleteSavedPlan?'':'disabled')+'>Supprimer</button>'+
            '</div>'+
          '</div>'+
        '</div>'+
      '</details>'+
    '</section>';
}

function renderSetupPlan(){
  const box=document.getElementById('setup-plan-content');
  if(!box)return;
  weeklyPlan=normalizeWeeklyPlan(weeklyPlan);
  const load=weeklyPlanLoadSummary();
  const today=getRealDay();
  const selectedDays=weeklyPlanSelectedSportDays();
  const planSummary=(weeklyPlan.sportDays||selectedDays.length)+' jour'+((weeklyPlan.sportDays||selectedDays.length)>1?'s':'');
  box.innerHTML=
    '<section class="setup-plan-block">'+
      '<details class="setup-dropdown setup-plan-dropdown">'+
        '<summary><span>Plan de semaine</span><strong>'+planSummary+'</strong></summary>'+
        '<div class="setup-plan-card">'+
          '<div class="setup-plan-copy"><strong>Programme tes jours de sport</strong><span>Choisis ton rythme, puis ajuste rapidement les journées importantes.</span></div>'+
          '<label class="plan-primary-select">Jours de sport / semaine<select data-action="plan-field" data-day="week" data-field="sportDays">'+weeklyPlanSportDaysOptions(weeklyPlan.sportDays)+'</select></label>'+
          '<div class="setup-plan-metrics">'+
            '<div><span>Séances</span><strong>'+load.workouts+'</strong></div>'+
            '<div><span>Temps</span><strong>~'+load.minutes+' min</strong></div>'+
            '<div><span>Aujourd’hui</span><strong>'+escapeHTML(WEEKLY_PLAN_TYPES[weeklyPlanEntry(today).type]||'Plan')+'</strong></div>'+
          '</div>'+
          '<div class="setup-plan-days">'+selectedDays.map((day,index)=>'<div class="setup-plan-day-row"><label class="setup-plan-day"><span>Jour '+(index+1)+'</span><select data-action="plan-field" data-day="sport-'+index+'" data-field="sportDay">'+weeklyPlanDayOptions(day,selectedDays)+'</select></label><label class="setup-plan-day setup-plan-day-type"><span>Activité</span><select data-action="plan-field" data-day="'+day+'" data-field="type">'+weeklyPlanSportTypeOptions(weeklyPlanEntry(day).type)+'</select></label></div>').join('')+'</div>'+
        '</div>'+
      '</details>'+
      '<div class="setup-next-grid">'+
        '<button type="button" class="choice-btn setup-next-card" data-action="save-profile-tab" data-tab="program"><strong>Programme</strong><span>Voir et lancer la séance prévue aujourd’hui.</span></button>'+
        '<button type="button" class="choice-btn setup-next-card" data-action="save-profile-tab" data-tab="exercises"><strong>Exercices</strong><span>Explorer la bibliothèque et créer une séance.</span></button>'+
      '</div>'+
    '</section>';
}

function toggleWeeklyPlanEdit(){
  weeklyPlanEditing=!weeklyPlanEditing;
  renderWeeklyPlan();
  renderSetupPlan();
}

function applyWeeklyPlanTemplate(template){
  weeklyPlan=defaultWeeklyPlan(template||'current');
  saveWeeklyPlan();
  renderWeeklyPlan();
  renderSetupPlan();
}

function regenerateWeeklyPlan(){
  const count=Math.max(1,Math.min(6,Number(weeklyPlan&&weeklyPlan.sportDays)||3));
  weeklyPlan=defaultWeeklyPlan(count===3?'3days':(count===4?'4days':'current'));
  applyWeeklyPlanSelectedDays(planDaysForCount(count));
  weeklyPlanEditing=true;
  renderWeeklyPlan();
}

function updateWeeklyPlanDraft(day,field,value){
  if(day==='week' && field==='sportDays'){
    applyWeeklyPlanSportDays(Number(value)||3);
    return;
  }
  if(day==='week' && field==='loadSavedPlan'){
    if(value)loadWeeklyPlanSnapshot(value);
    return;
  }
  if(day==='week' && field==='selectSavedPlan'){
    selectedSavedWeeklyPlanId=value||'';
    renderWeeklyPlan();
    return;
  }
  if(field==='sportDay' && String(day||'').startsWith('sport-')){
    updateWeeklyPlanSportDay(Number(String(day).replace('sport-','')),value);
    return;
  }
  if(!DAYS.includes(day))return;
  const shouldKeepDayOpen=field==='type'||field==='routineDay'||field==='sessionId'||field==='exerciseKey';
  weeklyPlan=normalizeWeeklyPlan(weeklyPlan);
  const entry=weeklyPlan.days[day];
  if(field==='duplicateFrom'){
    if(DAYS.includes(value)){
      weeklyPlan.days[day]={...weeklyPlanEntry(value)};
      saveWeeklyPlan();
      renderWeeklyPlan();
      renderSetupPlan();
    }
    return;
  }
  entry[field]=value;
  if(field==='type'){
    if(value==='routine'&&!entry.routineDay)entry.routineDay=day;
    if(value==='session'&&!entry.sessionId&&savedCustomSessions[0])entry.sessionId=savedCustomSessions[0].id||'0';
    if(value==='exercise'&&!entry.exerciseKey){
      const first=getExerciseLibraryItems()[0];
      if(first)entry.exerciseKey=first.key||libraryItemKey(first);
    }
  }
  saveWeeklyPlan();
  if(shouldKeepDayOpen)syncWeeklyPlanDayCard(day);
  else renderWeeklyPlan();
  renderSetupPlan();
}

function syncWeeklyPlanDayCard(day){
  const card=document.querySelector('.plan-calendar-day[data-plan-day="'+day+'"]');
  if(!card){
    renderWeeklyPlan();
    return;
  }
  const entry=weeklyPlanEntry(day);
  const active=entry.type!=='rest';
  const minutes=weeklyPlanEntryMinutes(day,entry);
  card.classList.toggle('active',active);
  card.classList.toggle('rest',!active);
  const titleEl=card.querySelector('.plan-calendar-event b');
  if(titleEl)titleEl.textContent=active ? (WEEKLY_PLAN_TYPES[entry.type]||'Sport') : 'Repos';
  const summary=card.querySelector('.plan-calendar-event small');
  if(summary){
    summary.textContent=entry.type==='rest'
      ? 'Journée libre'
      : (entry.type==='routine'
        ? (weeklyPlanCustomItems(day,entry).length
          ? weeklyPlanSummary(day,entry)
          : (((P()[entry.routineDay||day]||{}).title)||'Programme'))
        : weeklyPlanSummary(day,entry).replace(/^Séance sauvegardée · /,''));
  }
  const meta=card.querySelector('.plan-calendar-meta');
  if(meta)meta.textContent=minutes?'~'+minutes+' min':'Repos';
  const edit=card.querySelector('.plan-calendar-edit');
  if(edit)edit.innerHTML=weeklyPlanEditFields(day,entry);
}

function updateWeeklyPlanRoutineField(day,field,value,options={}){
  if(!DAYS.includes(day))return;
  weeklyPlan=normalizeWeeklyPlan(weeklyPlan);
  const entry=weeklyPlan.days[day];
  if(field==='customName')entry.customName=String(value||'').slice(0,36);
  saveWeeklyPlan();
  if(options.render===false)return;
  renderWeeklyPlan();
  renderSetupPlan();
}

function renameWeeklyPlanRoutineExercise(day,key,value,options={}){
  if(!DAYS.includes(day)||!key)return;
  weeklyPlan=normalizeWeeklyPlan(weeklyPlan);
  const entry=weeklyPlan.days[day];
  entry.customExerciseNames={...(entry.customExerciseNames||{})};
  entry.customExerciseNames[key]=String(value||'').slice(0,42);
  saveWeeklyPlan();
  if(options.render===false)return;
  renderWeeklyPlan();
  renderSetupPlan();
}

function addWeeklyPlanRoutineExercise(day,libraryIndex){
  if(!DAYS.includes(day))return;
  const item=getExerciseLibraryItems()[Number(libraryIndex)];
  if(!item)return;
  weeklyPlan=normalizeWeeklyPlan(weeklyPlan);
  const entry=weeklyPlan.days[day];
  const key=item.key||libraryItemKey(item);
  entry.type='routine';
  entry.customKeys=Array.isArray(entry.customKeys)?entry.customKeys:[];
  if(!entry.customKeys.includes(key))entry.customKeys.push(key);
  entry.customExerciseNames={...(entry.customExerciseNames||{})};
  if(!entry.customExerciseNames[key])entry.customExerciseNames[key]=item.ex.name;
  saveWeeklyPlan();
  syncWeeklyPlanDayCard(day);
  renderSetupPlan();
}

function syncWeeklyPlanRoutineBuilder(day){
  const card=document.querySelector('.plan-calendar-day[data-plan-day="'+day+'"]');
  if(!card){
    renderWeeklyPlan();
    return;
  }
  const entry=weeklyPlanEntry(day);
  const builder=card.querySelector('.plan-routine-builder');
  if(builder)builder.outerHTML=weeklyPlanRoutineBuilderHTML(day,entry);
  const summary=card.querySelector('.plan-calendar-event small');
  if(summary){
    const customItems=weeklyPlanCustomItems(day,entry);
    summary.textContent=customItems.length
      ? weeklyPlanCustomRoutineName(day,entry)+' · '+customItems.length+' exo'+(customItems.length>1?'s':'')
      : (((P()[entry.routineDay||day]||{}).title)||'Programme');
  }
  const meta=card.querySelector('.plan-calendar-meta');
  if(meta){
    const minutes=weeklyPlanEntryMinutes(day,entry);
    meta.textContent=minutes?'~'+minutes+' min':'Repos';
  }
}

function removeWeeklyPlanRoutineExercise(day,index){
  if(!DAYS.includes(day))return;
  weeklyPlan=normalizeWeeklyPlan(weeklyPlan);
  const entry=weeklyPlan.days[day];
  entry.customKeys=Array.isArray(entry.customKeys)?entry.customKeys:[];
  const removed=entry.customKeys.splice(Number(index),1)[0];
  if(removed&&entry.customExerciseNames)delete entry.customExerciseNames[removed];
  saveWeeklyPlan();
  renderWeeklyPlan();
  renderSetupPlan();
}

function moveWeeklyPlanRoutineExercise(day,index,dir){
  if(!DAYS.includes(day)||!dir)return;
  weeklyPlan=normalizeWeeklyPlan(weeklyPlan);
  const entry=weeklyPlan.days[day];
  entry.customKeys=Array.isArray(entry.customKeys)?entry.customKeys:[];
  const from=Number(index);
  const to=from+Number(dir);
  if(from<0||to<0||from>=entry.customKeys.length||to>=entry.customKeys.length)return;
  const [item]=entry.customKeys.splice(from,1);
  entry.customKeys.splice(to,0,item);
  saveWeeklyPlan();
  renderWeeklyPlan();
  renderSetupPlan();
}

function updateWeeklyPlanSportDay(index,value){
  if(!DAYS.includes(value))return;
  weeklyPlan=normalizeWeeklyPlan(weeklyPlan);
  const selected=weeklyPlanSelectedSportDays();
  if(index<0||index>=selected.length)return;
  selected[index]=value;
  const unique=[];
  selected.forEach(day=>{
    if(DAYS.includes(day)&&!unique.includes(day))unique.push(day);
  });
  planDaysForCount(weeklyPlan.sportDays).forEach(day=>{
    if(unique.length<weeklyPlan.sportDays&&!unique.includes(day))unique.push(day);
  });
  applyWeeklyPlanSelectedDays(unique.slice(0,weeklyPlan.sportDays));
}

function applyWeeklyPlanSelectedDays(selectedDays){
  weeklyPlan=normalizeWeeklyPlan(weeklyPlan);
  const selected=selectedDays.filter((day,index,arr)=>DAYS.includes(day)&&arr.indexOf(day)===index).slice(0,6);
  weeklyPlan.sportDays=Math.max(1,selected.length);
  DAYS.forEach(day=>{
    const previous=weeklyPlan.days[day]||{};
    weeklyPlan.days[day]=selected.includes(day)
      ? {...previous,type:previous.type&&previous.type!=='rest'?previous.type:'routine',routineDay:previous.routineDay||day}
      : {...previous,type:'rest',routineDay:day};
  });
  saveWeeklyPlan();
  renderWeeklyPlan();
  renderSetupPlan();
}

function applyWeeklyPlanSportDays(count){
  weeklyPlan=normalizeWeeklyPlan(weeklyPlan);
  const desired=Math.max(1,Math.min(6,Number(count)||3));
  const current=weeklyPlanSelectedSportDays().slice(0,desired);
  planDaysForCount(desired).forEach(day=>{
    if(current.length<desired&&!current.includes(day))current.push(day);
  });
  applyWeeklyPlanSelectedDays(current.slice(0,desired));
}

function openRoutineBuilderFromPlan(){
  showTab('exercises');
  setTimeout(()=>{
    const builder=document.getElementById('custom-session-builder');
    if(builder)builder.scrollIntoView({behavior:'smooth',block:'start'});
  },0);
}

function saveWeeklyPlanFromUI(){
  saveCurrentWeeklyPlanSnapshot();
  weeklyPlanEditing=false;
  renderWeeklyPlan();
  renderSetupPlan();
  saveAppState();
}

function launchPlannedToday(){
  return launchPlannedDay(getRealDay());
}

function launchPlannedDay(day){
  if(!DAYS.includes(day))return;
  const entry=weeklyPlanEntry(day);
  if(entry.type==='rest'){
    currentDay=day;
    storageSafe.setItem('vv-current-day',currentDay);
    showTab('program');
    showProgramView('today',{keepDay:true});
    return;
  }
  if(entry.type==='routine'){
    const sourceDay=DAYS.includes(entry.routineDay)?entry.routineDay:day;
    const customSteps=weeklyPlanCustomRoutineSteps(day,entry);
    const steps=(customSteps.length?customSteps:buildSessionSteps(sourceDay)).filter(step=>step.effort>0);
    if(!steps.length)return;
    currentDay=sourceDay;
    storageSafe.setItem('vv-current-day',currentDay);
    guidedSession={day:sourceDay,label:'Plan · '+weeklyPlanCustomRoutineName(day,entry),steps,index:0,startedAt:Date.now(),planned:true,custom:customSteps.length>0};
    showTab('timer');
    updateSessionRunner();
    startGuidedStep(0);
    saveAppState();
    return;
  }
  if(entry.type==='session'){
    const index=savedCustomSessions.findIndex((session,i)=>(session.id||String(i))===entry.sessionId);
    if(index<0){showTab('exercises');return;}
    startSavedCustomSession(index);
    return;
  }
  if(entry.type==='exercise'){
    const items=getExerciseLibraryItems();
    const index=items.findIndex(item=>(item.key||libraryItemKey(item))===entry.exerciseKey);
    if(index<0){showTab('exercises');return;}
    startLibraryExercise(index);
  }
}function bindNavigationTabs(){
  document.querySelectorAll('[data-tab]').forEach(btn=>{
    if(btn.__vvNavBound)return;
    btn.__vvNavBound=true;
    btn.addEventListener('click',event=>{
      const tab=btn.dataset&&btn.dataset.tab;
      if(!tab)return;
      event.preventDefault();
      showTab(tab);
    });
  });
}

function getTabPageNames(){
  return ['plan','program','exercises','timer','stats','options'];
}

const TAB_LABELS={
  plan:'Plan',
  program:'Programme',
  exercises:'Exercices',
  timer:'Minuteur',
  stats:'Stats',
  options:'Profil'
};

function navigateTab(delta){
  const names=getTabPageNames();
  const index=Math.max(0,names.indexOf(currentTab));
  const next=names[(index+delta+names.length)%names.length];
  showTab(next);
}

function renderHeaderNavControls(){
  document.querySelectorAll('.page-nav-controls').forEach(el=>el.remove());
  const names=getTabPageNames();
  if(!currentTab || !names.includes(currentTab))return;
  const page=document.getElementById('tab-'+currentTab);
  if(!page || page.hidden || page.style.display==='none')return;
  const header=page.querySelector('.page-header');
  if(!header)return;

  const index=names.indexOf(currentTab);
  const prev=names[(index-1+names.length)%names.length];
  const next=names[(index+1)%names.length];
  const controls=document.createElement('div');
  controls.className='page-nav-controls';
  controls.innerHTML=
    '<button class="page-nav-btn" type="button" data-action="nav-tab" data-dir="-1" aria-label="Page précédente : '+escapeHTML(TAB_LABELS[prev]||prev)+'">‹</button>'+
    '<button class="page-nav-btn" type="button" data-action="nav-tab" data-dir="1" aria-label="Page suivante : '+escapeHTML(TAB_LABELS[next]||next)+'">›</button>';
  header.appendChild(controls);
}

function renderMediaControls(){
  updateSpotifyUI();
  updateYouTubeUI();
}

function normalizeTabTarget(t){
  if(t==='today'||t==='week'){
    programView=t;
    storageSafe.setItem('vv-program-view',programView);
    return 'program';
  }
  return t;
}

function showProgramView(view,opts={}){
  programView=view==='week'?'week':'today';
  storageSafe.setItem('vv-program-view',programView);
  if(programView==='today'&&!opts.keepDay){
    currentDay=getRealDay();
    storageSafe.setItem('vv-current-day',currentDay);
    renderAll();
  }

  ['today','week'].forEach(name=>{
    const panel=document.getElementById('program-'+name);
    const btn=document.getElementById('program-view-'+name);
    const active=name===programView;
    if(panel){
      panel.classList.toggle('active',active);
      panel.classList.toggle('hidden',!active);
      panel.hidden=!active;
      panel.style.display=active?'block':'none';
    }
    if(btn){
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-selected',active?'true':'false');
    }
  });

  if(currentTab!=='program')showTab('program');
}


function ensureStatsTab(){
  const appScreen=document.getElementById('app-screen');
  if(!appScreen)return;
  if(document.getElementById('tab-stats'))return;
  const options=document.getElementById('tab-options');
  const el=document.createElement('div');
  el.id='tab-stats';
  el.className='tab-page';
  el.hidden=true;
  el.style.display='none';
  el.innerHTML=`
    <div class="page-header stats-header">
      <div>
        <div class="page-title">Stats</div>
        <div class="page-sub">Progression, régularité et historique</div>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">Séances</div><div class="stat-value" id="stat-sessions">0</div></div>
      <div class="stat-card"><div class="stat-label">Exercices</div><div class="stat-value" id="stat-exercises">0</div></div>
      <div class="stat-card"><div class="stat-label">Série</div><div class="stat-value" id="stat-streak">0j</div></div>
      <div class="stat-card"><div class="stat-label">Temps</div><div class="stat-value" id="stat-time">0h00</div></div>
    </div>
    <div class="coach-card"><div class="coach-title">Coach</div><div class="coach-text" id="coach-text">Lance ou valide quelques exercices pour créer tes premières stats.</div></div>
    <div class="coach-card"><div class="coach-title">7 derniers jours</div><div class="chart" id="stats-chart"></div></div>
    <div class="coach-card"><div class="coach-title">Semaine actuelle</div><div id="stats-week"></div></div>
    <div class="section-label">Historique par jour</div><div class="history-list" id="history-list"></div>
    <div class="stats-reset-footer"><button class="stats-reset-btn" type="button" data-action="reset-stats">Reset stats</button></div>`;
  if(options)appScreen.insertBefore(el,options); else appScreen.insertBefore(el,appScreen.querySelector('.tab-bar'));
}

function showTab(t){
  ensureStatsTab();
  const tabNames=getTabPageNames();
  const normalized=normalizeTabTarget(t);
  currentTab=tabNames.includes(normalized)?normalized:'program';
  if(typeof activeTab!=='undefined')activeTab=currentTab;

  tabNames.forEach(name=>{
    const page=document.getElementById('tab-'+name);
    if(!page)return;
    const active=name===currentTab;
    page.classList.toggle('active',active);
    page.classList.toggle('hidden',!active);
    page.hidden=!active;
    page.style.display=active?'block':'none';
  });

  document.querySelectorAll('[data-tab]').forEach(btn=>{
    const active=btn.dataset&&btn.dataset.tab===currentTab;
    btn.classList.toggle('active',active);
    if(active)btn.setAttribute('aria-current','page');
    else btn.removeAttribute('aria-current');
  });

  if(currentTab==='timer'){
    renderTimerDaySelect();
    renderTimerTune();
    renderTimerColorPreset();
    updateTimer();
    updateTimerDetails();
  }
  if(currentTab==='plan' && typeof renderWeeklyPlan==='function')renderWeeklyPlan();
  if(currentTab==='stats' && typeof renderStats==='function')renderStats();
  if(currentTab==='options' && typeof renderOptions==='function')renderOptions();
  if(currentTab==='program')showProgramView(programView);

  if(typeof bindNavigationTabs==='function')bindNavigationTabs();
  renderHeaderNavControls();
  renderMediaControls();
  storageSafe.setItem('vv-current-tab',currentTab);
  saveAppState();
}
function fmt(s){return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}

function renderSoundOption(){
  const btn=document.getElementById('sound-toggle');
  if(!btn)return;
  btn.classList.toggle('active',soundEnabled);
  btn.setAttribute('aria-pressed',soundEnabled?'true':'false');
}
function toggleSoundOption(){
  soundEnabled=!soundEnabled;
  storageSafe.setItem('vv-sound',soundEnabled?'1':'0');
  renderSoundOption();
  if(currentTab==='options' && !document.getElementById('sound-toggle'))renderOptions();

  if(soundEnabled){
    unlockAudio()
      .then(()=>unlockSoundFiles())
      .then(()=>cue('start'))
      .catch(()=>{});
  }
}
let audioCtx=null;
let audioUnlocked=false;

function getAudioCtx(){
  try{
    if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();
    return audioCtx;
  }catch(e){
    return null;
  }
}

async function unlockAudio(){
  const ctx=getAudioCtx();
  if(!ctx)return false;
  try{
    if(ctx.state==='suspended')await ctx.resume();

    // silent unlock pulse
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    gain.gain.value=0.00001;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime+0.02);

    audioUnlocked=true;
    return true;
  }catch(e){
    return false;
  }
}

function playBeep(freq=660,duration=0.10,type='sine',volume=0.28){
  if(!soundEnabled)return;
  const ctx=getAudioCtx();
  if(!ctx)return;

  try{
    if(ctx.state==='suspended')ctx.resume();

    const osc=ctx.createOscillator();
    const gain=ctx.createGain();

    osc.type=type;
    osc.frequency.setValueAtTime(freq,ctx.currentTime);

    gain.gain.setValueAtTime(0.0001,ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(volume,ctx.currentTime+0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime+duration+0.03);
  }catch(e){}
}

function playTone(freq=660,duration=0.14,delay=0,volume=0.18,type='sine'){
  if(!soundEnabled)return;
  const ctx=getAudioCtx();
  if(!ctx)return;

  try{
    if(ctx.state==='suspended')ctx.resume();

    const now=ctx.currentTime+delay;
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    const filter=ctx.createBiquadFilter();

    osc.type=type;
    osc.frequency.setValueAtTime(freq,now);
    filter.type='lowpass';
    filter.frequency.setValueAtTime(2600,now);
    filter.Q.setValueAtTime(0.2,now);

    gain.gain.setValueAtTime(0.0001,now);
    gain.gain.linearRampToValueAtTime(volume,now+0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001,now+duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now+duration+0.04);
  }catch(e){}
}

function playChime(notes,baseVolume=0.16){
  if(!soundEnabled)return;
  notes.forEach((note,index)=>{
    playTone(note.freq,note.duration||0.16,note.delay?index*0.11:0,note.volume||baseVolume,note.type||'sine');
  });
}

function vibrate(pattern){
  if(soundEnabled&&'vibrate' in navigator)navigator.vibrate(pattern);
}


async function unlockSoundFiles(){
  if(!soundEnabled)return;
  try{
    await Promise.all(Object.values(AUDIO_POOL).map(async audio=>{
      audio.muted=true;
      audio.currentTime=0;
      await audio.play().catch(()=>{});
      audio.pause();
      audio.currentTime=0;
      audio.muted=false;
    }));
  }catch(e){}
}

async function testSound(){
  soundEnabled=true;
  storageSafe.setItem('vv-sound','1');
  renderSoundOption();

  await unlockAudio();
  await unlockSoundFiles();

  playChime([
    {freq:523,duration:0.16,delay:0,volume:0.16},
    {freq:659,duration:0.16,delay:0.12,volume:0.15},
    {freq:784,duration:0.22,delay:0.24,volume:0.14}
  ]);
  vibrate([80,60,120]);

  const phase=document.getElementById('timer-phase');
  if(phase)phase.textContent='SON TESTÉ';
}

document.addEventListener('pointerdown',function(){
  if(soundEnabled&&!audioUnlocked)unlockAudio();
},{once:true});

function playSoundFile(type){
  if(!soundEnabled)return;
  try{
    const original=AUDIO_POOL[type];
    if(!original)return;
    const audio=original.cloneNode();
    audio.volume=1;
    audio.play().catch(()=>{});
  }catch(e){}
}

function cue(type){
  if(type==='start'){
    playChime([
      {freq:587,duration:0.13,delay:0,volume:0.14},
      {freq:784,duration:0.18,delay:0.11,volume:0.16}
    ]);
    vibrate([70]);
  }
  if(type==='count'){
    playTone(880,0.075,0,0.105,'sine');
    vibrate(28);
  }
  if(type==='rest'){
    playChime([
      {freq:494,duration:0.14,delay:0,volume:0.13},
      {freq:392,duration:0.22,delay:0.14,volume:0.12}
    ]);
    vibrate([85,55,85]);
  }
  if(type==='done'){
    playChime([
      {freq:523,duration:0.14,delay:0,volume:0.14},
      {freq:659,duration:0.14,delay:0.11,volume:0.145},
      {freq:784,duration:0.24,delay:0.22,volume:0.135}
    ]);
    vibrate([110,70,150]);
  }
}


function setPrepTime(seconds){
  timer.prep=Math.max(0,Number(seconds)||0);
  storageSafe.setItem('vv-prep-time',String(timer.prep));
  timerTune.prep=timer.prep;
  storageSafe.setItem('vv-timer-tune-prep',String(timerTune.prep));
  renderTimerTune();
}
function loadPrepTime(){
  const saved=storageSafe.getItem('vv-prep-time');
  timer.prep=saved===null?5:Math.max(0,Number(saved)||0);
  timerTune.prep=timer.prep;
  const select=document.getElementById('prep-select');
  if(select)select.value=String(timer.prep);
  renderTimerTune();
}

function setTimerState(seconds,ctx,phase='PRÊT',exercise=null,rest=0,exerciseData=null){clearInterval(timer.interval);lastCompletedSession=null;renderTimerFinishPanel();timer={seconds,left:seconds,interval:null,running:false,phase:'effort',context:ctx,exercise,exerciseData,effort:seconds,rest,totalPhase:seconds,prep:timer.prep??5,pendingStart:false,circuit:exerciseData&&exerciseData.circuit?exerciseData.circuit:null,circuitIndex:0,sourceDay:null,sourceIndex:null};document.getElementById('timer-context').textContent=ctx;document.getElementById('timer-phase').textContent=phase;document.getElementById('tip-effort').textContent=fmt(seconds);document.getElementById('tip-rest').textContent=rest?fmt(rest):'—';syncTimerLabels();updateTimer();saveAppState()}
function renderTimerTune(){
  const effort=document.getElementById('timer-tune-effort');
  const rest=document.getElementById('timer-tune-rest');
  const prep=document.getElementById('timer-tune-prep');
  if(effort)effort.textContent=fmt(timerTune.effort);
  if(rest)rest.textContent=fmt(timerTune.rest);
  if(prep)prep.textContent=fmt(timerTune.prep);
}
function stepTimerTune(kind,delta){
  if(!timerTune || !(kind in timerTune))return;
  const min=kind==='effort'?15:0;
  const max=kind==='effort'?900:(kind==='rest'?300:60);
  timerTune[kind]=Math.max(min,Math.min(max,(Number(timerTune[kind])||0)+delta));
  storageSafe.setItem('vv-timer-tune-'+kind,String(timerTune[kind]));
  if(kind==='prep'){
    timer.prep=timerTune.prep;
    storageSafe.setItem('vv-prep-time',String(timer.prep));
    const select=document.getElementById('prep-select');
    if(select)select.value=String(timer.prep);
  }
  renderTimerTune();
}
function applyTunedManualTimer(){
  timer.prep=timerTune.prep;
  storageSafe.setItem('vv-prep-time',String(timer.prep));
  setTimerState(timerTune.effort,'Chrono libre','PRÊT',null,timerTune.rest,null);
  timer.phase='manual';
  timer.context='Chrono libre';
  timer.exercise=null;
  timer.exerciseData=null;
  timer.circuit=null;
  timer.sourceDay=null;
  timer.sourceIndex=null;
  timer.freeMode=true;
  timer.guided=false;
  timer.running=false;
  timer.pendingStart=false;
  updateTimerModeSwitch();
  updateTimerDetails();
  updateTimer();
  saveAppState();
  renderTimerTune();
}
function setManualTimer(s){
  timerTune.effort=Math.max(15,Number(s)||90);
  storageSafe.setItem('vv-timer-tune-effort',String(timerTune.effort));
  renderTimerTune();
  setTimerState(s,'Chrono libre','PRÊT',null,timerTune.rest||0,null);
  timer.phase='manual';
  timer.context='Chrono libre';
  timer.exercise=null;
  timer.exerciseData=null;
  timer.circuit=null;
  timer.sourceDay=null;
  timer.sourceIndex=null;
  timer.freeMode=true;
  timer.guided=false;
  timer.running=false;
  timer.pendingStart=false;
  updateTimerModeSwitch();
  updateTimerDetails();
  updateTimer();
  saveAppState();
}
function startExerciseTimer(day,i,options={}){
  const ex=P()[day].exercises[i];
  if(ex.type==='repos')return;

  if(ex.circuit&&ex.circuit.length){
    const first=ex.circuit[0];
    const exData={...ex,target:ex.target||'Circuit',how:'Commence par : '+first.name+'. Suis ensuite les étapes affichées, dans l’ordre.',tips:ex.tips||'Passe d’un mouvement à l’autre sans te précipiter.'};
    setTimerState(first.effort,day+' · '+ex.name,'EXERCICE',first.name,first.rest,exData);
    timer.circuit=ex.circuit;
    timer.circuitIndex=0;
  }else{
    if(!ex.effort)return;
    setTimerState(ex.effort,day+' · '+ex.name,'EXERCICE',ex.name,ex.rest,ex);
  }

  if(options && options.free){
    timer.sourceDay=null;
    timer.sourceIndex=null;
    timer.freeMode=true;
  }else{
    timer.sourceDay=day;
    timer.sourceIndex=i;
    timer.freeMode=false;
  }
  timer.running=false;
  timer.pendingStart=false;
  timer.phase='effort';

  showTab('timer');
  updateTimerDetails();
  updateTimer();
  saveAppState();
}



function currentTimerName(){
  if(timer.exercise)return timer.exercise;
  if(timer.exerciseData&&timer.exerciseData.name)return timer.exerciseData.name;
  if(timer.circuit&&timer.circuit[timer.circuitIndex]&&timer.circuit[timer.circuitIndex].name)return timer.circuit[timer.circuitIndex].name;
  return '';
}

function timerStatusLabel(){
  if(timer.pendingStart || timer.phase==='prep')return 'Avant départ';
  if(timer.phase==='rest')return 'Récupération';
  if(timer.running)return 'Exercice en cours';
  if(hasActiveTimerSession())return 'En pause';
  if(timer.left===0 && timer.exercise)return 'Terminé';
  if(isManualTimerMode())return 'Chrono libre';
  return 'Exercice sélectionné';
}

function timerContextLabel(){
  const name=currentTimerName();
  const status=timerStatusLabel();

  if(!name){
    if(timer.context)return timer.context;
    return status;
  }

  if(status==='Avant départ')return 'Prépare-toi · '+name;
  if(status==='Récupération')return 'Récupération · '+name;
  if(status==='En pause')return name;
  if(status==='Terminé')return 'Terminé · '+name;
  if(status==='Exercice en cours')return 'Exercice · '+name;
  return name;
}

function syncTimerLabels(){
  const statusEl=document.getElementById('timer-status-label');
  const contextEl=document.getElementById('timer-context');
  const card=document.querySelector('.timer-card');
  const status=timerStatusLabel();
  updateSpotifyUI();
  updateYouTubeUI();

  if(statusEl)statusEl.textContent=status;
  if(contextEl)contextEl.textContent=timerContextLabel();

  document.body.classList.toggle('timer-is-prep',timer.pendingStart||timer.phase==='prep');
  document.body.classList.toggle('timer-is-rest',timer.phase==='rest');
  document.body.classList.toggle('timer-is-effort',timer.running&&timer.phase==='effort');
  document.body.classList.toggle('timer-is-paused',status==='En pause');

  if(card){
    const labelEl=card.querySelector('.timer-label');
    if(labelEl)labelEl.textContent=isManualTimerMode()?'Chrono libre':'Exercice sélectionné';
    card.classList.toggle('is-running',timer.running);
    card.classList.toggle('is-paused',status==='En pause');
    card.classList.toggle('is-rest',timer.phase==='rest');
    card.classList.toggle('is-prep',timer.pendingStart||timer.phase==='prep');
    card.classList.toggle('is-done',status==='Terminé');
    card.classList.toggle('has-session',canRestartTimer()&&!isManualTimerMode());
    card.classList.toggle('is-manual',isManualTimerMode());
  }
  updateTimerModeSwitch();
}



function timerModeLabel(){
  try{
    if(profile && profile.level==='perso')return 'Perso';
    if(profile && LEVELS && LEVELS[profile.level])return LEVELS[profile.level].label;
  }catch(e){}
  return 'Perso';
}

function timerDetailTitle(){
  if(timer.phase==='rest')return 'Récupération';
  if(timer.pendingStart || timer.phase==='prep')return 'Préparation';
  if(timer.exercise || timer.exerciseData)return 'Détails de l’exercice';
  return '';
}

function syncTimerDetailTitle(){
  const candidates=[
    document.getElementById('timer-detail-title'),
    document.getElementById('timer-details-title'),
    document.getElementById('timer-info-title')
  ].filter(Boolean);

  candidates.forEach(el=>{el.textContent=timerDetailTitle();});
}

function updateTimerDetails(){
  syncTimerLabels();
  syncTimerDetailTitle();

  const ex=timer.exerciseData;
  const summary=document.querySelector('.timer-summary-details');
  const target=document.getElementById('timer-target');
  const sets=document.getElementById('timer-sets');
  const how=document.getElementById('timer-how');
  const tips=document.getElementById('timer-tips');
  const effortEl=document.getElementById('tip-effort');
  const restEl=document.getElementById('tip-rest');
  const modeEl=document.getElementById('tip-mode');
  const effortInfo=document.getElementById('tip-effort-info');
  const restInfo=document.getElementById('tip-rest-info');
  const modeInfo=document.getElementById('tip-mode-info');

  if(!target||!sets||!how||!tips)return;

  if(!ex){
    if(summary)summary.classList.add('hidden');
    target.textContent='–';
    sets.textContent='–';
    how.textContent=isManualTimerMode()?'Choisis une durée, puis lance ton minuteur libre.':'Lance une séance depuis Aujourd’hui ou un exercice depuis Exercices pour voir les détails ici.';
    tips.textContent='';
    if(effortEl)effortEl.textContent=timer.seconds?fmt(timer.seconds):'–';
    if(restEl)restEl.textContent=timer.rest?fmt(timer.rest):'Aucune';
    if(modeEl)modeEl.textContent=isManualTimerMode()?'Manuel':timerModeLabel();
    if(effortInfo)effortInfo.textContent=isManualTimerMode()?'Durée libre choisie pour ton chrono manuel.':'Aucun exercice lancé pour le moment.';
    if(restInfo)restInfo.textContent=isManualTimerMode()?'Repos indicatif si tu veux enchaîner plusieurs tours.':'La récupération apparaîtra quand un exercice sera sélectionné.';
    if(modeInfo)modeInfo.textContent=isManualTimerMode()?'Le minuteur manuel ne valide pas un exercice automatiquement.':'Le mode suit ton profil actuel.';
    return;
  }

  if(summary)summary.classList.remove('hidden');

  const currentStep=(timer.circuit&&timer.circuit[timer.circuitIndex]) ? timer.circuit[timer.circuitIndex] : null;
  const effort=currentStep ? currentStep.effort : (ex.effort || timer.effort || timer.seconds || 0);
  const rest=currentStep ? currentStep.rest : (ex.rest || timer.rest || 0);

  target.textContent=ex.target || (currentStep ? currentStep.name : 'Exercice');
  sets.textContent=ex.circuit ? 'Circuit · '+ex.circuit.length+' étapes' : (ex.sets || '–');

  if(currentStep){
    how.textContent='À faire maintenant : '+currentStep.name;
  }else{
    how.textContent=ex.how || 'Garde un mouvement propre et contrôlé.';
  }

  tips.textContent=ex.tips ? 'Conseil : '+ex.tips : '';

  if(effortEl)effortEl.textContent=effort ? fmt(effort) : 'Libre';
  if(restEl)restEl.textContent=rest ? fmt(rest) : 'Aucune';
  if(modeEl)modeEl.textContent=timerModeLabel();
  if(effortInfo)effortInfo.textContent=currentStep?'Durée de cette étape du circuit.':'Durée prévue pour une série propre, sans précipiter le mouvement.';
  if(restInfo)restInfo.textContent=rest?'Récupération avant la suite. Garde une respiration calme et repars propre.':'Pas de repos programmé pour ce bloc.';
  if(modeInfo)modeInfo.textContent='Ce mode adapte les exercices, les durées et la récupération à ton profil.';

  const detail=document.getElementById('timer-detail-card');
  let old=document.getElementById('timer-circuit-next');
  if(old)old.remove();

  if(detail && timer.circuit && timer.circuit.length){
    const next=timer.circuit[timer.circuitIndex+1];
    const div=document.createElement('div');
    div.id='timer-circuit-next';
    div.className='timer-circuit-next';
    div.textContent=next ? 'Ensuite : '+next.name : 'Dernière étape du circuit';
    detail.appendChild(div);
  }
}

function syncTimerButtons(){
  document.querySelectorAll('.mini-timer-btn').forEach(function(btn){
    btn.classList.remove('active');
    if(timer.exercise && timer.running && btn.getAttribute('data-exercise')===timer.exercise){
      btn.classList.add('active');
    }
  });
}


function timerPhaseLabel(){
  if(!timer.running && hasActiveTimerSession()) return timer.phase==='rest'?'Récupération':'Effort';
  if(timer.phase==='prep' || timer.pendingStart) return 'Décompte';
  if(timer.phase==='effort') return 'Effort';
  if(timer.phase==='rest') return 'Récupération';
  if(timer.phase==='manual') return 'Libre';
  return 'Bloc en cours';
}
function timerMeaningText(){
  if(!timer.running && hasActiveTimerSession()) return 'Reprends quand tu es prêt, ou recommence ce bloc si tu veux repartir proprement.';
  if(timer.phase==='prep' || timer.pendingStart) return 'Prépare-toi : l’exercice démarre à la fin du décompte.';
  if(timer.phase==='effort') return 'Ce temps correspond à l’effort de l’exercice en cours.';
  if(timer.phase==='rest') return 'Ce temps correspond à la récupération avant la suite.';
  if(timer.phase==='manual') return 'Chrono libre : ce temps n’est pas lié à un exercice.';
  return 'Le temps affiché concerne seulement le bloc en cours, pas toute la séance.';
}


function validateTimerExercise(){
  if(timer.sourceDay===null || timer.sourceIndex===null){
    return;
  }
  const day=timer.sourceDay;
  const index=Number(timer.sourceIndex);
  const program=P();
  if(!program[day] || !program[day].exercises || !program[day].exercises[index])return;
  setDone(program[day].exercises[index],true,{silent:true},day);
  renderAll();
  saveAppState();
  updateTimerValidateButton();
}
function updateTimerValidateButton(){
  const btn=document.getElementById('timer-validate-btn');
  if(!btn)return;
  if(timer.freeMode || timer.sourceDay===null || timer.sourceIndex===null || !P()[timer.sourceDay] || !P()[timer.sourceDay].exercises[timer.sourceIndex]){
    btn.classList.add('hidden');
    btn.classList.remove('done');
    btn.disabled=false;
    return;
  }
  const ex=P()[timer.sourceDay].exercises[timer.sourceIndex];
  btn.classList.remove('hidden');
  const done=getDone(ex,timer.sourceDay);
  btn.classList.toggle('done',done);
  btn.disabled=done;
  btn.textContent=done?'Exercice validé ✓':'Valider cet exercice';
}



function canRestartTimer(){
  return !!(timer && (timer.exercise || timer.exerciseData || timer.circuit || timer.sourceDay!==null || timer.phase==='manual' || timer.freeMode));
}

function restartCurrentTimer(){
  if(!canRestartTimer())return;

  const sourceDay=timer.sourceDay;
  const sourceIndex=timer.sourceIndex;
  const data=timer.exerciseData ? {...timer.exerciseData} : null;
  const circuit=timer.circuit ? timer.circuit.map(step=>({...step})) : null;
  const wasManual=(timer.phase==='manual' || (timer.freeMode && sourceDay===null && sourceIndex===null && !data && !circuit));
  const exerciseName=timer.exercise || (data&&data.name) || 'Exercice';
  const rest=timer.rest || (data&&data.rest) || 0;
  const effort=timer.effort || timer.seconds || (data&&data.effort) || 30;

  clearInterval(timer.interval);

  if(sourceDay!==null && sourceIndex!==null && P()[sourceDay] && P()[sourceDay].exercises[sourceIndex]){
    startExerciseTimer(sourceDay,sourceIndex);
    return;
  }

  if(circuit && circuit.length){
    const first=circuit[0];
    const exData=data || {
      name:exerciseName,
      circuit:circuit,
      how:'Suis les étapes dans l’ordre.',
      tips:'Garde un mouvement propre.'
    };
    setTimerState(first.effort,exerciseName,'EXERCICE',first.name,first.rest,exData);
    timer.circuit=circuit;
    timer.circuitIndex=0;
    timer.sourceDay=sourceDay;
    timer.sourceIndex=sourceIndex;
    startPrepCountdown();
    updateTimerDetails();
    updateTimer();
    saveAppState();
    return;
  }

  setTimerState(effort,wasManual?'Chrono libre':(timer.context || exerciseName),wasManual?'PRÊT':'EXERCICE',wasManual?null:exerciseName,rest,data);
  if(wasManual){
    timer.phase='manual';
    timer.freeMode=true;
  }
  timer.sourceDay=sourceDay;
  timer.sourceIndex=sourceIndex;
  startPrepCountdown();
  updateTimerDetails();
  updateTimer();
  saveAppState();
}

function updateMainTimerButton(){
  const btn=document.getElementById('main-timer-btn');
  const restartBtn=document.getElementById('timer-restart-btn');

  if(btn){
    if(timer.running){
      btn.textContent='Pause';
      btn.setAttribute('aria-label','Mettre le minuteur en pause');
    }else if(hasActiveTimerSession()){
      btn.textContent='Reprendre';
      btn.setAttribute('aria-label','Reprendre le minuteur');
    }else{
      btn.textContent='Commencer';
      btn.setAttribute('aria-label','Commencer le minuteur');
    }
  }

  if(restartBtn){
    const showRestart=!timer.running && canRestartTimer() && (hasActiveTimerSession() || timer.left===0);
    restartBtn.classList.toggle('hidden',!showRestart);
  }
  syncImmersiveTimer();
}

function updateTimer(){syncTimerLabels();updateMainTimerButton();updateTimerValidateButton();
  const display=document.getElementById('timer-display');
  const ring=document.getElementById('timer-ring');
  const fill=document.getElementById('timer-linear-fill');
  const percentEl=document.getElementById('timer-percent');
  const stepEl=document.getElementById('timer-step');
  const total=timer.totalPhase||timer.seconds||1;
  const done=Math.min(100,Math.max(0,Math.round(((total-timer.left)/total)*100)));
  const urgent=timer.left<=10&&timer.running;
  const isRest=timer.phase==='rest';

  display.textContent=fmt(timer.left);
  updateTimerDetails();
display.classList.toggle('running',timer.running);
  display.classList.toggle('urgent',urgent);

  if(ring){
    ring.style.setProperty('--timer-progress',done+'%');
    ring.classList.toggle('pulse',timer.running);
    ring.classList.toggle('rest',isRest);
    ring.classList.toggle('urgent',urgent);
  }

  if(fill){
    fill.style.width=done+'%';
    fill.classList.toggle('rest',isRest);
    fill.classList.toggle('urgent',urgent);
    fill.classList.toggle('running',timer.running);
  }

  if(percentEl)percentEl.textContent=done+'%';
  if(stepEl){
    stepEl.textContent=timerPhaseLabel();
  }
  const meaning=document.getElementById('timer-meaning');
  if(meaning)meaning.textContent=timerMeaningText();

  const mainTimerBtn=document.getElementById('main-timer-btn');
  if(mainTimerBtn)mainTimerBtn.classList.toggle('running',timer.running);
  if(mainTimerBtn)mainTimerBtn.classList.toggle('paused',!timer.running&&hasActiveTimerSession());
  syncImmersiveTimer();
  syncTimerButtons();
}

function timerEngineHooks(){
  return {
    cue,
    updateTimer,
    syncTimerLabels,
    updateMainTimerButton,
    saveAppState,
    advanceGuidedSession,
    setPhaseText(text){
      const el=document.getElementById('timer-phase');
      if(el)el.textContent=text;
    },
    setContextText(text){
      const el=document.getElementById('timer-context');
      if(el)el.textContent=text;
    }
  };
}

function startPrepCountdown(){
  return window.TimerShell.startPrepCountdown(timer,timerEngineHooks());
}

function startActiveTimer(){
  return window.TimerShell.startActiveTimer(timer,timerEngineHooks());
}

function toggleTimer(){
  return window.TimerShell.toggleTimer(timer,timerEngineHooks());
}function registerServiceWorker(){
  if(!('serviceWorker' in navigator))return;
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./sw.js').then(reg=>{
      reg.update&&reg.update();
      if(reg.waiting)reg.waiting.postMessage({type:'SKIP_WAITING'});
      reg.addEventListener('updatefound',()=>{
        const worker=reg.installing;
        if(!worker)return;
        worker.addEventListener('statechange',()=>{
          if(worker.state==='installed' && navigator.serviceWorker.controller){
            storageSafe.setItem('vv-update-ready','1');
          }
        });
      });
    }).catch(()=>{});
  });
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(storageSafe.getItem('vv-reloaded-for-update')===APP_VERSION)return;
    storageSafe.setItem('vv-reloaded-for-update',APP_VERSION);
    window.location.reload();
  });
}
registerServiceWorker();
initIntroScreen();
boot();


function pruneHistory(){
  try{
    const list=JSON.parse(storageSafe.getItem('vv-history')||'[]');
    if(list.length>150)storageSafe.setItem('vv-history',JSON.stringify(list.slice(-150)));
  }catch(e){}
}
pruneHistory();

window.addEventListener('pagehide', saveAppState);
document.addEventListener('visibilitychange', function(){ if(document.hidden) saveAppState(); });

document.addEventListener('touchstart', function(){
  if(soundEnabled && !audioUnlocked) unlockAudio().then(()=>unlockSoundFiles&&unlockSoundFiles());
},{once:true, passive:true});

function __testAdaptExerciseForEquipment(ex,eqOverride){
  const oldEq=(typeof equipment!=='undefined')?{...equipment}:null;
  if(typeof equipment!=='undefined' && eqOverride){
    Object.assign(equipment,eqOverride);
  }
  const result=adaptExerciseForEquipment(ex);
  if(typeof equipment!=='undefined' && oldEq){
    Object.assign(equipment,oldEq);
  }
  return result;
}

function __testTimerTabResume(){
  const beforeTimer={...timer};
  timer.exercise='Pompes';
  timer.left=12;
  timer.seconds=30;
  timer.running=false;
  timer.phase='effort';syncTimerLabels();
  timer.sourceDay='Lundi';
  timer.sourceIndex=0;

  const before={
    exercise:timer.exercise,
    left:timer.left,
    seconds:timer.seconds,
    sourceDay:timer.sourceDay,
    sourceIndex:timer.sourceIndex
  };

  showTab('week');
  showTab('timer');

  const after={
    exercise:timer.exercise,
    left:timer.left,
    seconds:timer.seconds,
    sourceDay:timer.sourceDay,
    sourceIndex:timer.sourceIndex
  };

  Object.assign(timer,beforeTimer);
  return JSON.stringify(before)===JSON.stringify(after);
}


function __testTimerStateLabels(){
  const before={...timer};

  setTimerState(30,'Lundi · Ring push-ups tempo','EXERCICE','Ring push-ups tempo',30,{name:'Ring push-ups tempo',effort:30,rest:30});

  timer.pendingStart=true;
  timer.phase='prep';
  timer.running=false;
  syncTimerLabels();
  const prepStatus=document.getElementById('timer-status-label').textContent;
  const prepContext=document.getElementById('timer-context').textContent;

  timer.pendingStart=false;syncTimerLabels();
  timer.phase='effort';
  timer.running=true;
  syncTimerLabels();
  const effortStatus=document.getElementById('timer-status-label').textContent;
  const effortContext=document.getElementById('timer-context').textContent;

  timer.running=false;
  timer.left=10;
  timer.phase='effort';
  syncTimerLabels();
  const pauseStatus=document.getElementById('timer-status-label').textContent;

  timer.running=true;
  timer.phase='rest';
  syncTimerLabels();
  const restStatus=document.getElementById('timer-status-label').textContent;

  timer.running=false;
  timer.left=0;
  timer.phase='effort';
  syncTimerLabels();
  const doneStatus=document.getElementById('timer-status-label').textContent;

  Object.assign(timer,before);
  syncTimerLabels();

  return {
    prepStatus,
    prepContext,
    effortStatus,
    effortContext,
    pauseStatus,
    restStatus,
    doneStatus,
    ok:
      prepStatus==='Avant départ' &&
      prepContext.includes('Prépare-toi') &&
      effortStatus==='Exercice en cours' &&
      effortContext.includes('Exercice · Ring push-ups tempo') &&
      pauseStatus==='En pause' &&
      restStatus==='Récupération' &&
      doneStatus==='Terminé'
  };
}


function __testTimerPauseResumeRestart(){
  const before={...timer};

  setTimerState(30,'Lundi · Pompes','EXERCICE','Pompes',20,{name:'Pompes',effort:30,rest:20});
  timer.left=12;
  timer.running=false;
  timer.phase='effort';
  timer.sourceDay='Lundi';
  timer.sourceIndex=0;
  updateTimer();

  const main=document.getElementById('main-timer-btn');
  const restart=document.getElementById('timer-restart-btn');
  const pausedOk=main && main.textContent==='Reprendre' && restart && !restart.classList.contains('hidden');

  timer.running=true;
  updateTimer();
  const runningOk=main && main.textContent==='Pause' && restart && restart.classList.contains('hidden');

  timer.running=false;
  updateTimer();
  const beforeRestartExercise=timer.exercise;
  const beforeRestartSource=timer.sourceDay;

  // On ne lance pas vraiment le compte à rebours ici, on vérifie seulement que l’option existe et que les labels sont bons.
  Object.assign(timer,before);
  updateTimer();

  return !!(pausedOk && runningOk && beforeRestartExercise==='Pompes' && beforeRestartSource==='Lundi');
}

function __testTimerDetailsDynamic(){
  setTimerState(90,'Test · Ring push-ups tempo','EXERCICE','Ring push-ups tempo',30,{
    name:'Ring push-ups tempo',
    target:'Pecs, épaules, triceps',
    sets:'3 séries',
    effort:90,
    rest:30,
    how:'Descends en contrôle.',
    tips:'Garde le corps gainé.'
  });

  updateTimerDetails();

  const effort=document.getElementById('tip-effort').textContent;
  const rest=document.getElementById('tip-rest').textContent;
  const mode=document.getElementById('tip-mode').textContent;
  const target=document.getElementById('timer-target').textContent;
  const how=document.getElementById('timer-how').textContent;

  return {
    effort,rest,mode,target,how,
    ok: effort==='01:30' && rest==='00:30' && !!mode && target.includes('Pecs') && how.includes('Descends')
  };
}

function __testPauseResumeRestartInternal(){
  const before={...timer};

  setTimerState(30,'Test · Pompes','EXERCICE','Pompes',20,{name:'Pompes',effort:30,rest:20});
  timer.running=false;
  timer.left=12;
  timer.phase='effort';
  updateTimer();

  const main=document.getElementById('main-timer-btn');
  const restart=document.getElementById('timer-restart-btn');

  const pausedOk=main && main.textContent==='Reprendre' && restart && !restart.classList.contains('hidden');

  timer.running=true;
  updateTimer();
  const runningOk=main && main.textContent==='Pause' && restart && restart.classList.contains('hidden');

  Object.assign(timer,before);
  updateTimer();

  return !!(pausedOk && runningOk);
}

function __testCheckmarkCards(){
  let day=null;
  let index=-1;

  DAYS.some(d=>{
    const p=P()[d];
    if(!p||!p.exercises)return false;
    const i=p.exercises.findIndex(ex=>ex.type!=='repos');
    if(i>=0){
      day=d;
      index=i;
      return true;
    }
    return false;
  });

  if(day===null || index<0)return true;

  const ex=P()[day].exercises[index];
  const storageKey='done-'+key(ex,day);

  const original=storageSafe.getItem(storageKey);
  storageSafe.setItem(storageKey,'0');

  let stopped=false;
  let immediate=false;
  const fakeEvent={
    preventDefault(){},
    stopPropagation(){stopped=true;},
    stopImmediatePropagation(){immediate=true;}
  };

  handleCheckClick(fakeEvent,day,index);
  const after=storageSafe.getItem(storageKey)==='1';

  handleCheckClick(fakeEvent,day,index);
  const restored=storageSafe.getItem(storageKey)==='0';

  if(original===null){
    storageSafe.removeItem(storageKey);
  }else{
    storageSafe.setItem(storageKey,original);
  }

  return stopped && immediate && after && restored;
}

function __testStableDoneKeys(){
  const beforeLevel=profile.level;
  const beforeMode=profile.mode;
  const beforeDay=currentDay;

  profile.level='perso';
  profile.mode='adaptive';

  let dayName=null;
  let ex=null;
  DAYS.some(day=>{
    const p=P()[day];
    if(!p||!p.exercises)return false;
    const found=p.exercises.find(item=>item.type!=='repos' && item.doneKey);
    if(found){
      dayName=day;
      ex=found;
      return true;
    }
    return false;
  });

  if(!dayName || !ex){
    profile.level=beforeLevel;
    profile.mode=beforeMode;
    currentDay=beforeDay;
    return true;
  }

  const stable='done-'+key(ex,dayName);
  const legacy='done-'+legacyKey(ex,dayName);
  const originalStable=storageSafe.getItem(stable);
  const originalLegacy=storageSafe.getItem(legacy);

  storageSafe.setItem(stable,'0');
  if(legacy!==stable)storageSafe.setItem(legacy,'0');

  setDone(ex,true,{silent:true},dayName);
  const renamed={...ex,name:ex.name+' test'};
  const stableOk=getDone(renamed,dayName);
  const pctOk=pct(dayName)>0;

  setDone(ex,false,{silent:true},dayName);
  const resetOk=!getDone(renamed,dayName);

  if(originalStable===null)storageSafe.removeItem(stable);
  else storageSafe.setItem(stable,originalStable);
  if(legacy!==stable){
    if(originalLegacy===null)storageSafe.removeItem(legacy);
    else storageSafe.setItem(legacy,originalLegacy);
  }

  profile.level=beforeLevel;
  profile.mode=beforeMode;
  currentDay=beforeDay;

  return stableOk && pctOk && resetOk;
}

function __testGuidedSessionValidation(){
  const beforeGuided=guidedSession ? {...guidedSession} : null;
  const beforeTimer={...timer};
  const beforeDay=currentDay;

  let dayName=null;
  DAYS.some(day=>{
    const p=P()[day];
    if(p&&p.exercises&&p.exercises.some(ex=>ex.type!=='repos')){
      dayName=day;
      return true;
    }
    return false;
  });

  if(!dayName)return true;

  const program=P()[dayName];
  const originals=program.exercises.map(ex=>[
    'done-'+key(ex,dayName),
    storageSafe.getItem('done-'+key(ex,dayName)),
    'done-'+legacyKey(ex,dayName),
    storageSafe.getItem('done-'+legacyKey(ex,dayName))
  ]);
  program.exercises.forEach(ex=>setDone(ex,false,{silent:true},dayName));

  const steps=buildSessionSteps(dayName);
  const targetIndex=steps.findIndex(step=>step.isLastForExercise);
  if(targetIndex<0){
    originals.forEach(([stable,stableVal,legacy,legacyVal])=>{
      if(stableVal===null)storageSafe.removeItem(stable); else storageSafe.setItem(stable,stableVal);
      if(legacyVal===null)storageSafe.removeItem(legacy); else storageSafe.setItem(legacy,legacyVal);
    });
    guidedSession=beforeGuided;
    Object.assign(timer,beforeTimer);
    currentDay=beforeDay;
    return true;
  }

  guidedSession={day:dayName,steps,index:targetIndex,startedAt:Date.now()};
  markGuidedStepDone();

  const step=steps[targetIndex];
  const ex=program.exercises[step.exerciseIndex];
  const marked=!!(ex&&getDone(ex,dayName));
  const progressMoved=pct(dayName)>0;

  originals.forEach(([stable,stableVal,legacy,legacyVal])=>{
    if(stableVal===null)storageSafe.removeItem(stable); else storageSafe.setItem(stable,stableVal);
    if(legacyVal===null)storageSafe.removeItem(legacy); else storageSafe.setItem(legacy,legacyVal);
  });
  guidedSession=beforeGuided;
  Object.assign(timer,beforeTimer);
  currentDay=beforeDay;
  updateTimer();

  return marked && progressMoved && steps.every(step=>step.sourceKey&&Number.isInteger(step.exerciseIndex));
}

function __testWeekProgressAfterCheck(){
  const beforeDay=currentDay;
  let dayName=null;
  let index=-1;

  DAYS.some(day=>{
    const p=P()[day];
    if(!p||!p.exercises)return false;
    const i=p.exercises.findIndex(ex=>ex.type!=='repos');
    if(i>=0){
      dayName=day;
      index=i;
      return true;
    }
    return false;
  });

  if(!dayName || index<0)return true;

  const exercises=P()[dayName].exercises;
  const originals=exercises.map(ex=>[
    'done-'+key(ex,dayName),
    storageSafe.getItem('done-'+key(ex,dayName)),
    'done-'+legacyKey(ex,dayName),
    storageSafe.getItem('done-'+legacyKey(ex,dayName))
  ]);

  exercises.forEach(ex=>setDone(ex,false,{silent:true},dayName));
  renderWeek();
  const beforePct=pct(dayName);

  const fakeEvent={
    preventDefault(){},
    stopPropagation(){},
    stopImmediatePropagation(){}
  };
  handleCheckClick(fakeEvent,dayName,index);
  renderWeek();

  const afterPct=pct(dayName);
  const grid=document.getElementById('week-grid');
  const html=grid ? grid.innerHTML : '';
  const weekShowsProgress=afterPct>0 && html.includes(afterPct+'%');

  originals.forEach(([stable,stableVal,legacy,legacyVal])=>{
    if(stableVal===null)storageSafe.removeItem(stable); else storageSafe.setItem(stable,stableVal);
    if(legacyVal===null)storageSafe.removeItem(legacy); else storageSafe.setItem(legacy,legacyVal);
  });
  currentDay=beforeDay;
  renderWeek();

  return beforePct===0 && afterPct>0 && weekShowsProgress;
}

function __testCheckmarkRerendersCard(){
  const beforeDay=currentDay;
  let dayName=null;
  let index=-1;

  DAYS.some(day=>{
    const p=P()[day];
    if(!p||!p.exercises)return false;
    const i=p.exercises.findIndex(ex=>ex.type!=='repos');
    if(i>=0){
      dayName=day;
      index=i;
      return true;
    }
    return false;
  });

  if(!dayName || index<0)return true;

  currentDay=dayName;
  const exercises=P()[dayName].exercises;
  const originals=exercises.map(ex=>[
    'done-'+key(ex,dayName),
    storageSafe.getItem('done-'+key(ex,dayName)),
    'done-'+legacyKey(ex,dayName),
    storageSafe.getItem('done-'+legacyKey(ex,dayName))
  ]);
  exercises.forEach(ex=>setDone(ex,false,{silent:true},dayName));
  renderAll();

  const fakeEvent={
    preventDefault(){},
    stopPropagation(){},
    stopImmediatePropagation(){}
  };
  handleCheckClick(fakeEvent,dayName,index);

  const firstCard=document.querySelector('#exercise-list .ex-card');
  const firstCheck=document.querySelector('#exercise-list .check-btn');
  const progressText=document.querySelector('#day-info-card .prog-pct');
  const ok=!!(
    firstCard &&
    firstCheck &&
    firstCard.classList.contains('done') &&
    firstCheck.classList.contains('done') &&
    progressText &&
    progressText.textContent !== '0%'
  );

  originals.forEach(([stable,stableVal,legacy,legacyVal])=>{
    if(stableVal===null)storageSafe.removeItem(stable); else storageSafe.setItem(stable,stableVal);
    if(legacyVal===null)storageSafe.removeItem(legacy); else storageSafe.setItem(legacy,legacyVal);
  });
  currentDay=beforeDay;
  renderAll();

  return ok;
}

function __testStorageSafe(){
  storageSafe.setItem('vv-storage-test','ok');
  const ok=storageSafe.getItem('vv-storage-test')==='ok';
  storageSafe.removeItem('vv-storage-test');
  return ok;
}

function __testFirstStartTimerState(){
  let day=null;
  let index=-1;

  DAYS.some(d=>{
    const p=P()[d];
    if(!p||!p.exercises)return false;
    const i=p.exercises.findIndex(ex=>ex.type!=='repos' && ex.effort);
    if(i>=0){
      day=d;
      index=i;
      return true;
    }
    return false;
  });

  if(day===null)return true;

  const before={...timer};
  startExerciseTimer(day,index);

  const main=document.getElementById('main-timer-btn');
  const ok=
    timer.exercise &&
    timer.running===false &&
    timer.pendingStart===false &&
    timer.left===timer.seconds &&
    main &&
    main.textContent==='Commencer';

  Object.assign(timer,before);
  updateTimer();
  return ok;
}

function __testBikeProgramExplicit(){
  const beforeLevel=profile.level;
  const beforeEquipment={...equipment};

  profile.level='perso';
  equipment.treadmill=false;
  equipment.bike=true;
  const perso=P();
  const persoHasBike=!!(perso.Mercredi && perso.Mercredi.exercises.some(ex=>(ex.name||'').includes('Vélo') || ex.svg==='bike'));

  profile.level='medium';
  equipment.treadmill=false;
  equipment.bike=true;
  const generic=P();
  const genericHasBike=!!(generic.Mercredi && generic.Mercredi.exercises.some(ex=>(ex.name||'').includes('Vélo') || ex.svg==='bike'));

  const explicit=cardioEquipmentExercise('25–35 min');
  const helperOk=explicit.name.includes('Vélo') && explicit.svg==='bike';

  const bikeVisualOk=chooseExerciseVisual({name:'Vélo zone 2'})==='bike';

  profile.level=beforeLevel;
  Object.assign(equipment,beforeEquipment);

  return persoHasBike && genericHasBike && helperOk && bikeVisualOk;
}

function __testMediumBikeWednesday(){
  const beforeLevel=profile.level;
  const beforeEquipment={...equipment};

  profile.level='medium';
  equipment.treadmill=false;
  equipment.bike=true;

  const p=P();
  const names=p.Mercredi && p.Mercredi.exercises ? p.Mercredi.exercises.map(e=>e.name).join(' | ') : '';

  profile.level=beforeLevel;
  Object.assign(equipment,beforeEquipment);

  return names.includes('Vélo');
}

function __testSetupFunctions(){
  const beforeLevel=profile.level;
  const beforeSound=soundEnabled;

  selectLevel('medium');
  const levelOk=profile.level==='medium';

  toggleSoundOption();
  const soundChanged=soundEnabled!==beforeSound;
  toggleSoundOption();

  renderChoices();
  const setupHTML=document.getElementById('level-choices') ? document.getElementById('level-choices').innerHTML : '';
  const materialHTML=document.getElementById('mode-choices') ? document.getElementById('mode-choices').innerHTML : '';

  profile.level=beforeLevel;
  soundEnabled=beforeSound;
  renderChoices();

  return levelOk && soundChanged && setupHTML.includes('Medium') && materialHTML.includes('Matériel disponible') && materialHTML.includes('Vélo');
}

function __testSelectLevelInternal(){
  const before=profile.level;
  selectLevel('expert');
  const ok=profile.level==='expert';
  profile.level=before;
  renderChoices();
  return ok;
}

function __testTabIsolation(){
  renderChoices();
  const setupLevel=document.getElementById('level-choices').innerHTML;
  const setupMaterial=document.getElementById('mode-choices').innerHTML;

  showTab('week');
  const activeWeek=document.getElementById('tab-program') ? document.getElementById('tab-program').classList.contains('active') && programView==='week' : true;

  showTab('options');
  const activeOptions=document.getElementById('tab-options') ? document.getElementById('tab-options').classList.contains('active') : true;
  const optionsAfter=document.getElementById('options-content').innerHTML;

  return (
    setupLevel.includes('Débutant') &&
    setupLevel.includes('Medium') &&
    setupMaterial.includes('Matériel disponible') &&
    setupMaterial.includes('Vélo') &&
    activeWeek &&
    activeOptions &&
    optionsAfter.includes('Niveau') &&
    optionsAfter.includes('Matériel disponible') &&
    optionsAfter.includes('Vélo')
  );
}

function __testTimerFinishFeedbackPanel(){
  const beforeLast=lastCompletedSession ? {...lastCompletedSession} : null;
  const day=currentDay;
  const keyName=feedbackKey(day);
  const beforeFeedback=storageSafe.getItem(keyName);

  lastCompletedSession={day,label:'Séance du jour terminée',custom:false,finishedAt:Date.now()};
  renderTimerFinishPanel();
  const panel=document.getElementById('timer-finish-panel');
  const visible=!!(panel && !panel.classList.contains('hidden') && panel.innerHTML.includes('Ressenti'));
  saveSessionFeedback('good',day);
  const saved=getSessionFeedback(day);
  const savedOk=!!(saved && saved.value==='good');

  lastCompletedSession=beforeLast;
  if(beforeFeedback===null)storageSafe.removeItem(keyName);
  else storageSafe.setItem(keyName,beforeFeedback);
  renderTimerFinishPanel();

  return visible && savedOk;
}

function __testSavedCustomSessionFlow(){
  const beforeSelection=[...customSessionSelection];
  const beforeSaved=savedCustomSessions.map(s=>({...s,keys:Array.isArray(s.keys)?[...s.keys]:[]}));
  const items=getExerciseLibraryItems().slice(0,2);
  if(items.length<1)return true;
  const keys=items.map(item=>item.key||libraryItemKey(item));

  customSessionSelection=keys;
  savedCustomSessions=[];
  const name='Test séance';
  savedCustomSessions.push({id:'test-session',name,keys:[...customSessionSelection],createdAt:Date.now()});
  saveSavedCustomSessions();
  customSessionSelection=[];
  loadSavedCustomSession(0);
  const loaded=customSessionSelection.length===items.length && customSessionSelection[0]===keys[0];

  customSessionSelection=beforeSelection;
  savedCustomSessions=beforeSaved;
  saveCustomSessionSelection();
  saveSavedCustomSessions();
  renderCustomSessionBuilder();

  return loaded;
}

function __testFullAuditState(){
  return (
    __testProfileStartFlow() &&
    __testNavigationTabs() &&
    __testMaterialLabelClean() &&
    __testSessionCompletedStatus() &&
    (typeof __testBikeProgramExplicit==='function' ? __testBikeProgramExplicit() : true) &&
    (typeof __testMediumBikeWednesday==='function' ? __testMediumBikeWednesday() : true) &&
    (typeof __testStorageSafe==='function' ? __testStorageSafe() : true) &&
    (typeof __testCheckmarkCards==='function' ? __testCheckmarkCards() : true) &&
    (typeof __testStableDoneKeys==='function' ? __testStableDoneKeys() : true) &&
    (typeof __testGuidedSessionValidation==='function' ? __testGuidedSessionValidation() : true) &&
    (typeof __testWeekProgressAfterCheck==='function' ? __testWeekProgressAfterCheck() : true) &&
    (typeof __testCheckmarkRerendersCard==='function' ? __testCheckmarkRerendersCard() : true) &&
    (typeof __testFirstStartTimerState==='function' ? __testFirstStartTimerState() : true) &&
    (typeof __testTimerStateLabels==='function' ? __testTimerStateLabels().ok : true) &&
    (typeof __testTimerPauseResumeRestart==='function' ? __testTimerPauseResumeRestart() : true) &&
    (typeof __testTimerDetailsDynamic==='function' ? __testTimerDetailsDynamic().ok : true) &&
    (typeof __testTimerFinishFeedbackPanel==='function' ? __testTimerFinishFeedbackPanel() : true) &&
    (typeof __testSavedCustomSessionFlow==='function' ? __testSavedCustomSessionFlow() : true) &&
    (typeof __testOptionsNoDuplicate==='function' ? __testOptionsNoDuplicate() : true) &&
    (typeof __testVisualMappings==='function' ? __testVisualMappings() : true)
  );
}

function __testMaterialLabelClean(){
  renderChoices();
  const setup=document.getElementById('mode-choices') ? document.getElementById('mode-choices').innerHTML : '';
  showTab('options');
  const options=document.getElementById('options-content') ? document.getElementById('options-content').innerHTML : '';
  const countSetup=(setup.match(/Matériel disponible/g)||[]).length;
  const countOptions=(options.match(/Matériel disponible/g)||[]).length;
  return countSetup===1 && countOptions===1 && !/>\s*Matériel\s*</.test(setup) && !/>\s*Matériel\s*</.test(options);
}

function __testSessionCompletedStatus(){
  const beforeDay=currentDay;
  const dayName=currentDay;
  const day=P()[dayName];

  if(!day || !day.exercises)return true;

  const original=day.exercises.map(ex=>['done-'+key(ex,dayName),storageSafe.getItem('done-'+key(ex,dayName))]);

  day.exercises.forEach(ex=>{
    if(ex.type!=='repos')setDone(ex,true,{silent:true},dayName);
  });

  updateSessionRunner();

  const card=document.getElementById('session-runner-card');
  const html=card ? card.innerHTML : '';
  const ok=
    html.includes('Séance terminée') &&
    html.includes('Tous les exercices sont terminés') &&
    html.includes('Séance terminée') &&
    !html.includes('Prochain exercice : Séance') &&
    !html.includes('Démarrer ma séance du jour');

  original.forEach(([k,v])=>{
    if(v===null)storageSafe.removeItem(k);
    else storageSafe.setItem(k,v);
  });
  updateSessionRunner();

  currentDay=beforeDay;
  return ok;
}


/* vvDelegatedNav */
document.addEventListener('click',function(event){
  const btn=event.target && event.target.closest ? event.target.closest('[data-tab]') : null;
  if(!btn)return;
  const tab=btn.dataset&&btn.dataset.tab;
  if(!tab)return;
  event.preventDefault();
  showTab(tab);
});


function __testNavigationTabs(){
  if(typeof bindNavigationTabs==='function')bindNavigationTabs();
  const names=getTabPageNames();

  for(const name of names){
    const page=document.getElementById('tab-'+name);
    if(page)page.classList.add('tab-page');
  }

  for(const name of names){
    showTab(name);
    const page=document.getElementById('tab-'+name);
    if(page && !page.classList.contains('active'))return false;
    for(const other of names){
      if(other===name)continue;
      const otherPage=document.getElementById('tab-'+other);
      if(otherPage && !otherPage.hidden)return false;
    }
  }

  showTab('today');
  return true;
}

function __testProfileStartFlow(){
  renderChoices();
  const levelHTML=document.getElementById('level-choices') ? document.getElementById('level-choices').innerHTML : '';
  const materialHTML=document.getElementById('mode-choices') ? document.getElementById('mode-choices').innerHTML : '';
  return (
    !levelHTML.includes('undefined') &&
    !materialHTML.includes('undefined') &&
    levelHTML.includes('Débutant') &&
    levelHTML.includes('Medium') &&
    levelHTML.includes('Expert') &&
    levelHTML.includes('Perso') &&
    materialHTML.includes('Matériel disponible') &&
    materialHTML.includes('Vélo')
  );
}

function __testVisualMappings(){
  const samples=[
    ['Ring push-ups tempo','ring_push'],
    ['Ring rows technique','ring_row'],
    ['Rowing aux anneaux','ring_row'],
    ['Dips anneaux assistés/progression','ring_dip'],
    ['Support hold sur supports','support_hold'],
    ['Support hold anneaux','ring_support'],
    ['Rowing haltères 5 kg tempo lent','db_row'],
    ['Circuit complet','circuit'],
    ['Vélo zone 2','bike'],
    ['Mobilité épaules','mobility'],
    ['Mobilité poignets','wrist_mobility'],
    ['Étirements dos/pecs','stretch_back'],
    ['Élévations latérales 5 kg tempo','lateral_raise'],
    ['Tractions progression','pull'],
    ['Finisher abdos','crunch']
  ];
  for(const [name,expected] of samples){
    const key=chooseExerciseVisual({name,type:'compose'});
    if(key!==expected || !SVGS[key])return false;
  }

  const beforeLevel=profile.level;
  const beforeEquipment={...equipment};
  const levels=['debutant','medium','expert','perso'];
  const eqs=[
    {rings:true,push:true,db:true,treadmill:true,bike:true},
    {rings:false,push:false,db:false,treadmill:false,bike:false},
    {rings:false,push:false,db:false,treadmill:false,bike:true}
  ];
  for(const level of levels){
    profile.level=level;
    for(const eq of eqs){
      Object.assign(equipment,eq);
      const p=P();
      for(const day of Object.values(p)){
        for(const ex of day.exercises){
          const key=chooseExerciseVisual(ex);
          if(!SVGS[key])return false;
        }
      }
    }
  }
  profile.level=beforeLevel;
  Object.assign(equipment,beforeEquipment);
  return true;
}


function __testOptionsNoDuplicate(){
  showTab('options');
  const opt=document.getElementById('options-content');
  const tab=document.getElementById('tab-options');
  if(!opt||!tab)return false;
  const html=opt.innerHTML;
  const countOptions=(html.match(/Options/g)||[]).length;
  const countNiveau=(html.match(/>Niveau</g)||[]).length;
  const countMaterial=(html.match(/>Matériel disponible</g)||[]).length;
  const tabChildrenOk=Array.from ? Array.from(tab.children).filter(x=>x.id!=='options-content').length===0 : true;
  showTab('today');
  const hiddenOk=tab.hidden===true && tab.style.display==='none';
  return countOptions>=1 && countNiveau===1 && countMaterial===1 && html.includes('Sons du minuteur') && html.includes('theme-grid') && tabChildrenOk && hiddenOk;
}
