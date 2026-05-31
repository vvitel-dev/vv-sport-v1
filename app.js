

const storageSafe = {
  getItem(k){
    try{
      return window.localStorage.getItem(k);
    }catch(e){
      try{return localStorage.getItem(k)}catch(e2){return null}
    }
  },
  setItem(k,v){
    try{
      window.localStorage.setItem(k,v);
    }catch(e){
      try{localStorage.setItem(k,v)}catch(e2){}
    }
  },
  removeItem(k){
    try{
      window.localStorage.removeItem(k);
    }catch(e){
      try{localStorage.removeItem(k)}catch(e2){}
    }
  }
};
let currentTab=storageSafe.getItem('vv-current-tab')||'today';


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

const LEVELS={debutant:{label:'Débutant',sub:'Effort plus court, repos plus long',factor:.75,rest:1.35},medium:{label:'Medium',sub:'Équilibre intensité/récupération',factor:1,rest:1},expert:{label:'Expert',sub:'Effort plus long, repos court',factor:1.25,rest:.65},perso:{label:'Perso',sub:'38 ans · 72 kg · 1,78 m · prise musculaire',factor:1.08,rest:1.05}};
const MODES={classique:{label:'Ancien mode',sub:'Poids du corps'},anneaux:{label:'Anneaux',sub:'Force, stabilité, gainage'},supports:{label:'Supports de pompes',sub:'Amplitude, poignets, épaules'}};
const DUR={compose:{effort:40,rest:90},isolation:{effort:35,rest:60},abdos:{effort:35,rest:45},gainage:{effort:45,rest:45},mobilite:{effort:45,rest:20},repos:{effort:0,rest:0}};
const PERSONAL={name:'Vincent',age:38,weight:72,height:178,goal:'Prise musculaire',pushups:30,pullups:5,plank:90};

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
Lundi:{title:'Push — Pecs · Triceps · Épaules',duration:'55–70 min',warmup:'5 min tapis vitesse facile + rotations épaules',exercises:[
{name:'Pompes',sets:'4 × 8–15',target:'Pecs, triceps, gainage',how:'Corps droit, abdos serrés. Descends lentement puis pousse.',tips:'Ne creuse pas le dos.',svg:'push',type:'compose'},
{name:'Dips',sets:'4 × 6–12',target:'Triceps, pecs, épaules',how:'Descends doucement, coudes vers l’arrière, puis remonte.',tips:'Aide-toi si trop dur.',svg:'default',type:'compose'},
{name:'Élévations latérales',sets:'4 × 15–20',target:'Épaules',how:'Lève jusqu’aux épaules puis redescends lentement.',tips:'Pas d’élan.',svg:'db',type:'isolation'},
{name:'Planche',sets:'3 × 1 min',target:'Gainage profond',how:'Avant-bras au sol, corps droit, abdos serrés.',tips:'Ne lève pas les fesses.',svg:'plank',type:'gainage'}]},
Mardi:{title:'Pull — Dos · Biceps · Abdos',duration:'55–70 min',warmup:'5 min marche facile sur tapis',exercises:[
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
Dimanche:{title:'Repos',duration:'—',warmup:'Récupération',exercises:[
{name:'Repos',sets:'Récupération',target:'Repos',how:'Hydratation, sommeil, marche légère possible.',tips:'Indispensable pour progresser.',svg:'rest',type:'repos'}]}
};
const DAYS=Object.keys(BASE);
function getRealDay(){
  const map=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  return map[new Date().getDay()] || 'Lundi';
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
 ['rings','push','db','treadmill'].forEach(k=>{
   const el=document.getElementById('toggle-'+k);
   if(el)el.classList.toggle('active',equipment[k]);
 });
}let currentDay=(typeof getRealDay==='function'?getRealDay():'Lundi');let activeTab='today';
let timer={seconds:90,left:90,interval:null,running:false,phase:'manual',exercise:null,exerciseData:null,effort:90,rest:0,totalPhase:90,prep:5,pendingStart:false,circuit:null,circuitIndex:0,sourceDay:null,sourceIndex:null};
function clone(o){return JSON.parse(JSON.stringify(o))}



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

function scaleSeconds(s,isRest=false){if(!s)return 0;const l=LEVELS[profile.level]||LEVELS.medium;return Math.max(10,Math.round(s*(isRest?l.rest:l.factor)/5)*5)}


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

function buildPersonalProgram(){
  const p={
    Lundi:{title:'Perso · Push hypertrophie',duration:'55–70 min',warmup:'5 min tapis vitesse facile + mobilité épaules/poignets',exercises:[
      {name:equipment.rings?'Ring push-ups tempo':'Pompes profondes supports tempo',sets:'4 × 8–12',target:'Pecs, triceps, gainage',how:'Descente lente 3 sec, pause courte, remontée contrôlée.',tips:'Objectif prise musculaire : tension et amplitude avant vitesse.',svg:equipment.rings?'rings':'push',type:'compose'},
      {name:equipment.rings?'Dips anneaux assistés/progression':'Dips entre supports ou pompes diamant',sets:'4 × 6–10',target:'Triceps, pecs, épaules',how:'Amplitude contrôlée, épaules basses, pas d’à-coups.',tips:'Si douleur épaule, réduis amplitude.',svg:equipment.rings?'rings':'push',type:'compose'},
      {name:equipment.db?'Élévations latérales 5 kg tempo':'Pike push-ups contrôlées',sets:equipment.db?'4 × 15–25':'4 × 8–12',target:'Épaules',how:equipment.db?'Monte aux épaules, bloque 1 sec, descends lentement.':'Hanches hautes, pousse verticalement.',tips:'Pas d’élan, brûlure contrôlée.',svg:'default',type:equipment.db?'isolation':'compose'},
      {name:'Gainage RKC',sets:'3 × 30–45 sec',target:'Abdos & gainage',how:'Contracte fort abdos/fessiers, corps droit.',tips:'Qualité maximale, pas besoin de tenir 3 min.',svg:'plank',type:'gainage'}
    ]},
    Mardi:{title:'Perso · Pull priorité tractions',duration:'55–70 min',warmup:'5 min tapis vitesse facile + activation scapulaire',exercises:[
      {name:'Tractions progression',sets:'5 × 3–5',target:'Dos, biceps',how:'Séries propres. Garde 1 répétition en réserve.',tips:'Objectif passer de 5 à 8–10 tractions.',svg:'default',type:'compose'},
      {name:equipment.rings?'Rowing anneaux lourd':'Rowing haltères 5 kg tempo lent',sets:equipment.rings?'5 × 8–12':'4 × 20–30',target:'Dos, arrière épaules',how:equipment.rings?'Corps à vitesse réglable, tire poitrine vers anneaux.':'Buste penché, coudes vers l’arrière, tempo lent.',tips:'Plus de volume dos pour équilibrer tes 30 pompes.',svg:equipment.rings?'rings':'default',type:'compose'},
      {name:equipment.db?'Curl haltères 5 kg tempo':'Curl serviette/isométrique',sets:'4 × 15–25',target:'Biceps',how:'Montée propre, descente lente 3 sec.',tips:'Avec 5 kg, utilise le tempo et les reps longues.',svg:'db',type:'isolation'},
      {name:'Hollow body hold',sets:'3 × 30–45 sec',target:'Abdos & gainage',how:'Bas du dos collé, jambes tendues si possible.',tips:'Arrête avant de cambrer.',svg:'plank',type:'gainage'}
    ]},
    Mercredi:{title:'Perso · Cardio léger + abdos',duration:'35–55 min',warmup:equipment.bike?'Vélo 5 min facile':(equipment.treadmill?'Tapis 5 min vitesse facile':'Échauffement cardio léger 5 min'),exercises:[
      cardioEquipmentExercise('25–35 min'),
      {name:'Relevés de jambes',sets:'4 × 10–15',target:'Abdos bas',how:'Monte contrôlé, redescends sans cambrer.',tips:'Bas du dos stable.',svg:'plank',type:'abdos'},
      {name:'Mountain climbers contrôlés',sets:'3 × 35–45 sec',target:'Abdos & cardio',how:'Genoux alternés, bassin stable.',tips:'Qualité avant vitesse.',svg:'push',type:'abdos'}
    ]},
    Jeudi:{title:'Perso · Mobilité / récupération',duration:'20–30 min',warmup:'Respiration + mobilité douce',exercises:[
      {name:'Mobilité épaules',sets:'8 min',target:'Épaules',how:'Cercles lents, rotations, ouverture thoracique.',tips:'Important avec anneaux + pompes.',svg:'mobility',type:'mobilite'},
      {name:'Mobilité poignets',sets:'5 min',target:'Poignets',how:'Flexion/extension douce, appuis progressifs.',tips:'Utile pour supports pompes et anneaux.',svg:'mobility',type:'mobilite'},
      {name:'Étirements dos/pecs',sets:'10 min',target:'Récupération',how:'Étirements doux, respiration lente.',tips:'Si ça fait mal, arrête.',svg:'mobility',type:'mobilite'}
    ]},
    Vendredi:{title:'Perso · Full body hypertrophie',duration:'55–70 min',warmup:'5 min tapis vitesse facile + activation complète',exercises:[
      {name:equipment.push?'Pompes profondes supports':'Pompes tempo',sets:'5 × 8–15',target:'Pecs, triceps',how:'Amplitude contrôlée, descente lente.',tips:'Arrête 1–2 reps avant l’échec.',svg:'push',type:'compose'},
      {name:'Bulgarian split squat',sets:'4 × 10–15 / jambe',target:'Jambes, fessiers',how:'Pied arrière sur support, descente contrôlée.',tips:'Très efficace même sans charges lourdes.',svg:'legs',type:'compose'},
      {name:equipment.rings?'Rowing anneaux':'Rowing haltères tempo',sets:'4 × 10–15',target:'Dos',how:'Tire avec les coudes, serre les omoplates.',tips:'Garde autant de tirage que de poussée.',svg:equipment.rings?'rings':'default',type:'compose'},
      {name:'Gainage dynamique',sets:'3 × 45 sec',target:'Abdos & gainage',how:'Reste aligné pendant les mouvements.',tips:'Contrôle total.',svg:'plank',type:'gainage'}
    ]},
    Samedi:{title:'Perso · Anneaux/supports skill + finition',duration:'35–50 min',warmup:'Échauffement épaules + poignets',exercises:[
      {name:equipment.rings?'Support hold anneaux':'Support hold sur supports',sets:'5 × 15–30 sec',target:'Stabilité épaules, gainage',how:'Bras verrouillés, épaules basses, corps gainé.',tips:'Travail de contrôle, pas d’échec total.',svg:equipment.rings?'rings':'push',type:'gainage'},
      {name:equipment.rings?'Ring rows technique':'Pompes scapulaires',sets:'4 × 10–15',target:'Scapulas, dos, posture',how:'Mouvement propre et contrôlé.',tips:'Prévention épaules.',svg:equipment.rings?'rings':'push',type:'compose'},
      {name:equipment.db?'Finisher épaules/bras 5 kg':'Finisher abdos',sets:'3 tours',target:'Finition musculaire',how:equipment.db?'Élévations, curl, extension triceps en séries longues.':'Crunch, gainage, mountain climbers.',tips:'Brûlure propre, technique stricte.',svg:'default',type:equipment.db?'isolation':'abdos'}
    ]},
    Dimanche:{title:'Repos',duration:'—',warmup:'Récupération',exercises:[
      {name:'Repos',sets:'Récupération',target:'Repos',how:'Hydratation, sommeil, marche légère possible.',tips:'Pas de minuteur : récupération obligatoire.',svg:'rest',type:'repos'}
    ]}
  };
  Object.values(p).forEach(day=>day.exercises.forEach(ex=>{
    const d=DUR[ex.type]||DUR.compose;
    ex.effort=scaleSeconds(d.effort,false);
    ex.rest=scaleSeconds(d.rest,true);
  }));
  return p;
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
    p.Lundi.title='Push débutant — Technique · Pecs · Triceps';
    p.Lundi.duration='40–55 min';
    setExercise(p.Lundi.exercises[0],pushVariantForLevel());
    setExercise(p.Lundi.exercises[1],{name:'Dips assistés ou pompes serrées inclinées',sets:'3 × 6–10',target:'Triceps, pecs',how:'Utilise les pieds pour aider. Descends peu au début, sans douleur aux épaules.',tips:'Ne cherche pas l’échec. Progression propre semaine après semaine.',svg:hasRings?'rings':'push'});
    setExercise(p.Lundi.exercises[2],{name:hasDb?'Élévations latérales légères':'Y-T-W épaules au sol',sets:'3 × 12–18',target:'Épaules, posture',how:hasDb?'Monte sans élan jusqu’aux épaules, redescends lentement.':'Lève les bras en Y, T puis W, lentement.',tips:'Petit mouvement propre, aucune douleur.',svg:hasDb?'db':'mobility'});
    setExercise(p.Lundi.exercises[3],{name:'Gainage genoux ou planche courte',sets:'3 × 20–35 sec',target:'Gainage profond',how:'Choisis genoux au sol ou planche classique courte. Corps aligné, respiration calme.',tips:'Arrête dès que le bas du dos creuse.',svg:'plank'});

    p.Mardi.title='Pull débutant — Dos · Posture · Biceps';
    setExercise(p.Mardi.exercises[0],{name:'Tractions assistées négatives',sets:'4 × 2–4',target:'Dos, biceps',how:'Monte avec aide, descends en 3 à 5 sec. Repose-toi assez.',tips:'Une répétition lente vaut mieux que plusieurs avec élan.',svg:'pull'});
    setExercise(p.Mardi.exercises[1],{name:hasRings?'Rowing anneaux facile':'Rowing haltères buste appuyé',sets:'3 × 10–15',target:'Dos, arrière épaules',how:hasRings?'Corps plus vertical pour réduire la difficulté, tire la poitrine vers les anneaux.':'Buste stable, tire les coudes vers l’arrière.',tips:'Serre les omoplates, contrôle la descente.',svg:hasRings?'rings':'db'});
    setExercise(p.Mardi.exercises[2],{name:hasDb?'Curl haltères contrôlé':'Curl serviette isométrique',sets:'3 × 12–18',target:'Biceps',how:hasDb?'Coudes fixes, descente lente.':'Tire contre une serviette avec contrôle.',tips:'Pas d’élan.',svg:hasDb?'db':'default'});
    setExercise(p.Mardi.exercises[3],{name:'Dead bug ou relevés de genoux',sets:'3 × 8–12 / côté',target:'Abdos bas, contrôle lombaire',how:'Bas du dos collé au sol. Va lentement.',tips:'Si tu cambres, réduis l’amplitude.',svg:'core'});

    p.Mercredi.title='Cardio doux · Abdos débutant';
    setExercise(p.Mercredi.exercises[1],{name:'Crunch contrôlé',sets:'3 × 12–18',target:'Abdos',how:'Remonte légèrement, expire, redescends lentement.',tips:'Ne tire pas sur la nuque.',svg:'crunch'});
    setExercise(p.Mercredi.exercises[2],{name:'Mountain climbers lents',sets:'3 × 20–30 sec',target:'Cardio, abdos',how:'Alterne les genoux lentement, épaules au-dessus des mains.',tips:'Bassin stable avant vitesse.',svg:'mountain'});
    setExercise(p.Mercredi.exercises[3],{name:'Gainage genoux',sets:'3 × 20–35 sec',target:'Core',how:'Genoux au sol si besoin, ligne épaules-hanches propre.',tips:'Respire, ne bloque pas.',svg:'plank'});

    p.Vendredi.title='Full body débutant — Base propre';
    setExercise(p.Vendredi.exercises[0],pushVariantForLevel());
    setExercise(p.Vendredi.exercises[1],{name:'Squats contrôlés',sets:'3 × 12–18',target:'Jambes, fessiers',how:'Descends à amplitude confortable, genoux stables, dos long.',tips:'Ajoute une pause en bas plutôt que de te précipiter.',svg:'legs'});
    setExercise(p.Vendredi.exercises[2],{name:'Gainage shoulder taps sur genoux',sets:'3 × 20–30 sec',target:'Core, stabilité épaules',how:'Depuis les genoux, touche une épaule puis l’autre sans bouger le bassin.',tips:'Lent et stable.',svg:'shoulder_tap'});

    p.Samedi.title='Circuit débutant — Technique + souffle';
    setExercise(p.Samedi.exercises[0],{name:'Circuit poids du corps débutant',sets:'2–3 tours',target:'Tout le corps',how:'Pompes inclinées, squats contrôlés, rowing facile, gainage genoux.',tips:'Repos long si besoin. Tu dois finir propre.',svg:'circuit'});
    setExercise(p.Samedi.exercises[1],{name:'Abdos finisher facile',sets:'2 tours',target:'Abdos',how:'Crunch contrôlé, dead bug, gainage court.',tips:'Stop si le dos cambre.',svg:'plank'});
  }

  if(level==='expert'){
    p.Lundi.title='Push expert — Intensité · Tempo · Stabilité';
    p.Lundi.duration='60–75 min';
    setExercise(p.Lundi.exercises[0],pushVariantForLevel());
    setExercise(p.Lundi.exercises[1],{name:hasRings?'Dips anneaux assistés tempo':'Dips profonds tempo',sets:'5 × 5–10',target:'Triceps, pecs, épaules',how:'Descente 3 sec, épaules basses, pause courte, remonte puissant.',tips:'Stop si douleur épaule. Intensité oui, ego non.',svg:hasRings?'rings':'dip'});
    setExercise(p.Lundi.exercises[2],{name:hasDb?'Élévations latérales 1,5 reps':'Pike push-ups tempo',sets:hasDb?'5 × 15–25':'5 × 6–12',target:'Épaules',how:hasDb?'Monte, demi-descente, remonte, puis descente complète.':'Hanches hautes, descente lente, pousse verticalement.',tips:'Brûlure contrôlée, pas d’élan.',svg:hasDb?'db':'pike'});
    setExercise(p.Lundi.exercises[3],{name:'Gainage RKC',sets:'4 × 30–45 sec',target:'Gainage profond',how:'Contracte abdos, fessiers et quadriceps très fort.',tips:'Court mais intense.',svg:'plank'});

    p.Mardi.title='Pull expert — Tractions · Rowing lourd · Core';
    setExercise(p.Mardi.exercises[0],{name:'Tractions strictes + négatives',sets:'5 × 3–6 + 1 négative',target:'Dos, biceps',how:'Tractions propres, puis une négative lente sur la dernière rep.',tips:'Garde 1 rep propre en réserve sur les premières séries.',svg:'pull'});
    setExercise(p.Mardi.exercises[1],{name:hasRings?'Rowing anneaux pieds avancés':'Rowing haltères tempo 5 kg',sets:'5 × 10–15',target:'Dos, arrière épaules',how:hasRings?'Corps plus horizontal, tire haut vers les côtes.':'Tempo 4 sec en descente, contraction forte en haut.',tips:'Équilibre la poussée avec beaucoup de tirage.',svg:hasRings?'rings':'db'});
    setExercise(p.Mardi.exercises[2],{name:hasDb?'Curl haltères myo-reps':'Curl isométrique serviette',sets:'4 × 15–25 + mini-série',target:'Biceps',how:'Après la série, respire 15 sec puis ajoute 4–6 reps propres.',tips:'Ne triche pas avec le dos.',svg:hasDb?'db':'default'});
    setExercise(p.Mardi.exercises[3],{name:'Hollow body hold avancé',sets:'4 × 35–50 sec',target:'Abdos, gainage',how:'Jambes tendues si possible, bas du dos collé.',tips:'Réduis l’amplitude si tu cambres.',svg:'hollow'});

    p.Mercredi.title='Cardio zone 2 + core expert';
    setExercise(p.Mercredi.exercises[1],{name:'Relevés de jambes tempo',sets:'4 × 12–18',target:'Abdos bas',how:'Monte contrôlé, bloque 1 sec, descends en 3 sec.',tips:'Aucune cambrure.',svg:'core'});
    setExercise(p.Mercredi.exercises[2],{name:'Mountain climbers rapides propres',sets:'5 × 35–45 sec',target:'Cardio, abdos',how:'Cadence élevée mais bassin stable.',tips:'Épaules solides au-dessus des mains.',svg:'mountain'});
    setExercise(p.Mercredi.exercises[3],{name:'Planche dynamique',sets:'4 × 45–60 sec',target:'Core, épaules',how:'Alterne planche, shoulder taps et blocage propre.',tips:'Zéro rotation du bassin.',svg:'shoulder_tap'});

    p.Vendredi.title='Full body expert — Hypertrophie dense';
    setExercise(p.Vendredi.exercises[0],pushVariantForLevel());
    setExercise(p.Vendredi.exercises[1],{name:'Bulgarian split squat tempo',sets:'5 × 10–15 / jambe',target:'Jambes, fessiers',how:'Descente 3 sec, pause en bas, remonte fort.',tips:'Unilatéral pour rendre les jambes difficiles sans charge lourde.',svg:'split'});
    setExercise(p.Vendredi.exercises[2],{name:'Gainage dynamique avancé',sets:'4 × 45–60 sec',target:'Core, épaules',how:'Shoulder taps, planche bras tendus, contrôle total.',tips:'Qualité stricte malgré la fatigue.',svg:'shoulder_tap'});

    p.Samedi.title='Circuit expert — Densité · Finisher';
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
    <button class="choice-btn equipment-choice ${equipment[k]?'active':''}" id="toggle-${k}" onclick="toggleEquipment('${k}')">
      <strong>${title}</strong>
      <span>${desc}</span>
    </button>
  `).join('');
}


function selectLevel(k){
  if(!LEVELS || !LEVELS[k])return;
  profile.level=k;
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

function renderChoices(){
  const levelHTML=Object.entries(LEVELS).map(([k,v])=>`
    <button class="choice-btn ${profile.level===k?'active':''}" onclick="selectLevel('${k}')">
      <strong>${v.label}</strong>
      <span>${v.desc||v.sub||''}</span>
    </button>
  `).join('');

  const levelBox=document.getElementById('level-choices');
  const modeBox=document.getElementById('mode-choices');

  if(levelBox)levelBox.innerHTML=levelHTML;
  if(modeBox)modeBox.innerHTML=`
    <div class="setup-label full-label">Matériel disponible</div>
    ${equipmentChoicesHTML()}
  `;
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
function saveProfileAndEnter(){
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
  showTab('today');
}

function todayKey(){
  return new Date().toISOString().slice(0,10);
}
function getHistory(){
  try{return JSON.parse(storageSafe.getItem('vv-history')||'[]')}catch(e){return[]}
}
function saveHistory(list){
  storageSafe.setItem('vv-history',JSON.stringify(list.slice(-120)));
}
function logExerciseDone(ex){
  if(!ex || ex.type==='repos')return;
  const list=getHistory();
  list.push({
    date:todayKey(),
    time:Date.now(),
    day:currentDay,
    exercise:ex.name,
    level:profile.level,
    mode:profile.mode,
    minutes:Math.max(1,Math.round(((ex.effort||40)+(ex.rest||0))/60))
  });
  saveHistory(list);
}
function statsSummary(){
  const list=getHistory();
  const byDate={};
  let exercises=0, minutes=0;
  list.forEach(x=>{
    if((x.exercise||'').toLowerCase()==='repos')return;
    byDate[x.date]=(byDate[x.date]||0)+1;
    exercises++;
    minutes+=x.minutes||2;
  });
  const sessions=Object.keys(byDate).length;
  let streak=0;
  const d=new Date();
  for(let i=0;i<60;i++){
    const key=d.toISOString().slice(0,10);
    if(byDate[key]){streak++;d.setDate(d.getDate()-1)}
    else break;
  }
  return {list,byDate,sessions,exercises,minutes,streak};
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
  return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});
}
function formatHistoryDate(key){
  const parts=String(key||'').split('-');
  if(parts.length!==3)return key||'—';
  const d=new Date(Number(parts[0]),Number(parts[1])-1,Number(parts[2]));
  try{return d.toLocaleDateString('fr-FR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});}catch(e){return key;}
}
function formatChartDay(date){
  try{return date.toLocaleDateString('fr-FR',{weekday:'short'}).replace('.','').slice(0,3);}catch(e){return '';}
}
function groupHistoryByDate(list){
  const groups={};
  (list||[]).forEach(x=>{
    const k=x.date||todayKey();
    if(!groups[k])groups[k]=[];
    groups[k].push(x);
  });
  return Object.keys(groups).sort().reverse().map(date=>({
    date,
    items:groups[date].sort((a,b)=>(b.time||0)-(a.time||0)),
    minutes:groups[date].reduce((sum,x)=>sum+(x.minutes||2),0)
  }));
}
function resetStats(){
  if(!confirm('Réinitialiser toutes les stats et l’historique ?'))return;
  storageSafe.removeItem('vv-history');
  renderStats();
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
    const k=x.toISOString().slice(0,10);
    days.push({k,v:s.byDate[k]||0});
  }
  const max=Math.max(1,...days.map(x=>x.v));
  const total7=days.reduce((sum,x)=>sum+x.v,0);
  if(chart)chart.innerHTML=`
    <div class="chart-top">
      <div><strong>${total7}</strong><span>exercice${total7>1?'s':''}</span></div>
      <small>max ${max}/jour</small>
    </div>
    <div class="chart-bars">
      ${days.map(x=>{
        const parts=x.k.split('-');
        const date=new Date(Number(parts[0]),Number(parts[1])-1,Number(parts[2]));
        const h=x.v ? Math.max(18,Math.round((x.v/max)*86)) : 6;
        return '<div class="chart-day" title="'+escapeHTML(x.k)+' · '+x.v+' exercice(s)"><span class="chart-value">'+(x.v||'')+'</span><div class="chart-track"><div class="chart-bar '+(x.v?'has-value':'is-empty')+'" style="height:'+h+'px"></div></div><span class="chart-label">'+escapeHTML(formatChartDay(date))+'</span></div>';
      }).join('')}
    </div>`;

  const hist=q('history-list');
  if(hist){
    const groups=groupHistoryByDate(s.list);
    hist.innerHTML=groups.map((g,idx)=>{
      const count=g.items.length;
      const rows=g.items.map(x=>{
        const time=x.time ? new Date(x.time).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) : '—';
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
      timer:{
        seconds:timer.seconds,
        left:timer.left,
        running:false,
        phase:timer.phase,
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
        guidedTotal:timer.guidedTotal,
        guided:timer.guided,
        guidedIndex:timer.guidedIndex,
        guidedTotal:timer.guidedTotal
      },
      guidedSession:guidedSession ? {
        day:guidedSession.day,
        steps:guidedSession.steps,
        index:guidedSession.index,
        startedAt:guidedSession.startedAt
      } : null,
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
  currentTab=state.activeTab || state.currentTab || 'today';
  if(typeof activeTab!=='undefined')activeTab=currentTab;

  if(state.timer){
    timer={...timer,...state.timer,running:false,pendingStart:false};
  }

  guidedSession=state.guidedSession || null;

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
  const dayEl=document.getElementById('launch-day');
  const profileEl=document.getElementById('launch-profile');
  if(dayEl)dayEl.textContent=getRealDay();
  if(profileEl){
    profileEl.textContent=(profile.level&&LEVELS[profile.level]) ? LEVELS[profile.level].label : 'À configurer';
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
    showTab('today');
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
  ensureAdaptiveMode();
  loadPrepTime();
  renderChoices();
  currentDay=getRealDay();
  storageSafe.setItem('vv-current-day',currentDay);
  showLaunch();

  bindNavigationTabs();

  showTab(currentTab||'today');
}
function key(ex,day=currentDay){return profile.level+'-'+profile.mode+'-'+day+'-'+ex.name}
function getDone(ex,day=currentDay){return storageSafe.getItem('done-'+key(ex,day))==='1'}
function setDone(ex,v,opts={},day=currentDay){
  const was=getDone(ex,day);
  storageSafe.setItem('done-'+key(ex,day),v?'1':'0');
  if(v&&!was&&ex.type!=='repos')logExerciseDone(ex);
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
  return Math.round(ex.filter(e=>storageSafe.getItem('done-'+profile.level+'-'+profile.mode+'-'+day+'-'+e.name)==='1').length/ex.length*100);
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
    <button class="choice-btn ${profile.level===k?'active':''}" onclick="selectLevel('${k}')">
      <strong>${v.label}</strong>
      <span>${v.desc||v.sub||''}</span>
    </button>
  `).join('');

  const opt=document.getElementById('options-content');
  if(!opt)return;
  opt.replaceChildren ? opt.replaceChildren() : opt.innerHTML='';

  opt.innerHTML=`
    <div class="page-header compact">
      <h2>Options</h2>
      <p>Modifier le profil</p>
    </div>

    <div class="setup-label" style="padding-left:12px">Niveau</div>
    <div style="padding:0 12px" class="choice-grid">${levelHTML}</div>

    <div class="setup-label" style="padding-left:12px">Minuteur</div>
    <div style="padding:0 12px" class="choice-grid">
      <button id="sound-toggle" class="choice-btn ${soundEnabled?'active':''}" type="button" aria-pressed="${soundEnabled?'true':'false'}" onclick="toggleSoundOption()">
        <strong>Sons du minuteur</strong>
        <span>${soundEnabled?'Activé':'Désactivé'} · bips + vibration</span>
      </button>
    </div>

    <div class="setup-label" style="padding-left:12px">Matériel disponible</div>
    <div style="padding:0 12px" class="choice-grid">${equipmentChoicesHTML()}</div>

    <div style="padding:20px 12px 90px">
      <button class="primary-btn" onclick="saveProfileAndEnter()">Appliquer</button>
    </div>
  `;
}

function profilePillLabel(){
  const levelLabel=(LEVELS&&LEVELS[profile.level]) ? LEVELS[profile.level].label : 'Perso';
  if(profile.level==='perso')return 'Perso · 38 ans · 72 kg · 1,78 m · prise musculaire';
  return levelLabel;
}

function renderAll(){updateSessionRunner();if(typeof renderEquipment==='function')renderEquipment();if(typeof renderStats==='function')renderStats();renderTimerDaySelect();renderChoices();renderDays();renderInfo();renderExercises();renderExerciseLibrary();renderWeek();document.getElementById('profile-pill').textContent=profilePillLabel();document.getElementById('tip-mode').textContent=timerModeLabel ? timerModeLabel() : profilePillLabel()}
function renderDays(){document.getElementById('day-scroller').innerHTML=DAYS.map(d=>`<button class="day-chip ${d===currentDay?'active':''}" onclick="currentDay='${d}';storageSafe.setItem('vv-current-day',currentDay);renderAll()">${d}</button>`).join('')}

let guidedSession=null;

function buildSessionSteps(day){
  const program=P()[day];
  if(!program||!program.exercises)return [];

  const steps=[];
  program.exercises.forEach(ex=>{
    if(ex.type==='repos')return;

    if(ex.circuit&&ex.circuit.length){
      ex.circuit.forEach((step,idx)=>{
        steps.push({
          source:ex.name,
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
    const original=program.exercises.find(ex=>ex.type!=='repos' && (ex.name===step.source || ex.name===step.name));
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

  const nextIndex=guidedSession.index+1;
  if(nextIndex>=guidedSession.steps.length){
    finishGuidedSession();
    return true;
  }

  startGuidedStep(nextIndex);
  return true;
}

function finishGuidedSession(){
  if(!guidedSession)return;

  const day=guidedSession.day;
  const program=P()[day];
  if(program&&program.exercises){
    program.exercises.forEach(ex=>{
      if(ex.type!=='repos')setDone(ex,true,{silent:true});
    });
  }

  guidedSession=null;
  timer.guided=false;
  updateSessionRunner();
  document.getElementById('timer-context').textContent='Séance terminée';
  document.getElementById('timer-phase').textContent='TERMINÉ';
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
  return next ? 'Prochain exercice : '+next.name : 'Prochain exercice : —';
}

function updateSessionRunner(){
  const card=document.getElementById('session-runner-card');
  if(!card)return;

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
    <button class="primary-btn" onclick="startTodaySession()">${p.done>0?'Reprendre ma séance':'Démarrer ma séance du jour'}</button>
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
      '<em>'+(ex.circuit?'circuit':(ex.effort?fmt(ex.effort):'—'))+'</em>'+
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
      '<div class="session-actions"><button class="session-start-btn session-complete-btn" type="button" disabled>Séance terminée</button></div>'+
    '</div>';
  }

  const next=info.nextExercise ? info.nextExercise.name : '—';
  if(String(next).toLowerCase().includes('séance terminée') || String(next).toLowerCase().includes('seance terminee')){
    return '<div class="session-status session-complete">'+
      '<div class="session-status-title"><span>Avancement</span><strong>'+info.total+'/'+info.total+' · 100%</strong></div>'+
      '<div class="session-next done">Tous les exercices sont terminés.</div>'+
      '<div class="session-actions"><button class="session-start-btn session-complete-btn" type="button" disabled>Séance terminée</button></div>'+
    '</div>';
  }
  return '<div class="session-status">'+
    '<div class="session-status-title"><span>Avancement</span><strong>'+info.done+'/'+info.total+' · '+info.pct+'%</strong></div>'+
    '<div class="session-next">Prochain exercice : '+next+'</div>'+
    '<div class="session-actions"><button class="session-start-btn" onclick="startTodaySession()">Démarrer ma séance du jour</button></div>'+
  '</div>';
}

function renderInfo(){const p=P()[currentDay];document.getElementById('day-info-card').innerHTML=`<div class="card"><div class="card-info"><div><div class="day-name">${currentDay}${currentDay===getRealDay()?' · Aujourd’hui':''}</div><div class="day-title">${p.title} · ${p.duration}</div><div class="warmup">Échauffement : ${p.warmup}</div></div><button class="reset-btn" onclick="resetDay()">Reset</button></div><div class="prog-row"><span class="prog-label">Progression</span><span class="prog-pct">${pct(currentDay)}%</span></div><div class="prog-track"><div class="prog-fill" style="width:${pct(currentDay)}%"></div></div>${sessionStatusHTML()}</div>`}

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
    return `<div class="ex-card ${getDone(ex)?'done':''}" onclick="toggleCard(this)"><div class="ex-header"><div class="ex-title-block"><div class="ex-name">${ex.name}</div><div class="ex-sets">${ex.sets}</div></div><div class="ex-actions"><svg class="ex-chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" aria-hidden="true"><path d="M5 7l5 5 5-5"/></svg>${ex.type==='repos'?'':`<button type="button" class="mini-timer-btn ${timer.exercise===ex.name&&timer.running?'active':''}" data-exercise="${ex.name}" title="Démarrer l’exercice" aria-label="Démarrer l’exercice" onclick="event.preventDefault();event.stopPropagation();startExerciseTimer('${currentDay}',${i})">▶</button>`}<button type="button" class="check-btn ${getDone(ex)?'done':''}" title="${checkLabel}" aria-label="${checkLabel}" onclick="return handleCheckClick(event,'${currentDay}',${i})">✓</button></div></div><div class="ex-body"><div class="ex-visual" data-visual="${visualKey}">${visual}</div><div class="ex-meta"><strong>Cible :</strong> ${ex.target}<br><strong>Comment faire :</strong> ${ex.how}<br><strong>Conseil :</strong> ${ex.tips}</div>${ex.type==='repos'?'':`<div class="ex-timer-line">${ex.circuit?'Circuit guidé · '+ex.circuit.length+' étapes':'Effort '+fmt(ex.effort)+' · Récupération '+fmt(ex.rest)}</div>`}${circuitHTML(ex)}<textarea class="ex-note" placeholder="Note personnelle..." onclick="event.stopPropagation()" oninput="setNote(P()[currentDay].exercises[${i}],this.value)">${getNote(ex)}</textarea></div></div>`;
  }).join('');
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
      items.push({day,index,ex});
    });
  });
  return items;
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
      onclick="selectExerciseLevel('${k}')">${v.label}</button>
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
  const list=document.getElementById('exercise-library-list');
  if(!list)return;

  const items=getExerciseLibraryItems();
  if(!items.length){
    list.innerHTML='<div class="empty-card">Aucun exercice disponible.</div>';
    return;
  }

  list.innerHTML=items.map((item,libraryIndex)=>{
    const ex=item.ex;
    const visualKey=chooseExerciseVisual(ex);
    const visual=SVGS[visualKey]||SVGS[ex.svg]||SVGS.default;
    const timing=ex.circuit?'Circuit guidé · '+ex.circuit.length+' étapes':'Effort '+fmt(ex.effort||60)+' · Récupération '+fmt(ex.rest||0);
    return `<div class="ex-card library-ex-card" onclick="toggleCard(this)">
      <div class="ex-header">
        <div class="ex-title-block">
          <div class="ex-name">${ex.name}</div>
          <div class="ex-sets">${ex.sets||item.day+' · exercice seul'}</div>
        </div>
        <div class="ex-actions">
          <button type="button" class="mini-timer-btn" title="Lancer l’exercice" aria-label="Lancer l’exercice" onclick="event.preventDefault();event.stopPropagation();startLibraryExercise(${libraryIndex})">▶</button>
          <svg class="ex-chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M5 7l5 5 5-5"/></svg>
        </div>
      </div>
      <div class="ex-body">
        <div class="ex-visual" data-visual="${visualKey}">${visual}</div>
        <div class="ex-meta"><strong>Cible :</strong> ${ex.target||'—'}<br><strong>Comment faire :</strong> ${ex.how||'Fais le mouvement avec contrôle.'}<br><strong>Conseil :</strong> ${ex.tips||'Garde une technique propre.'}</div>
        <div class="ex-timer-line">${timing}</div>
        ${circuitHTML(ex)}
      </div>
    </div>`;
  }).join('');
}

function startLibraryExercise(libraryIndex){
  const item=getExerciseLibraryItems()[Number(libraryIndex)];
  if(!item)return;
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
    storageSafe.setItem('done-'+profile.level+'-'+profile.mode+'-'+d+'-'+e.name,'0');
  }));
  renderAll();
  saveAppState();
}
function renderWeek(){const grid=document.getElementById('week-grid');if(!grid)return;grid.innerHTML=DAYS.map(d=>{const p=pct(d);return `<div class="week-card ${d===currentDay?'today':''}" onclick="currentDay='${d}';storageSafe.setItem('vv-current-day',currentDay);showTab('today');renderAll()"><div class="wday">${d}</div><div class="wtitle">${P()[d].title}</div><div class="wpct ${p===100?'full':''}">${p}%</div><div class="week-prog-track"><div class="week-prog-fill" style="width:${p}%"></div></div><span class="badge ${p===100?'badge-done':p>0?'badge-partial':'badge-rest'}">${p===100?'fait':p>0?'en cours':'à faire'}</span></div>`}).join('')}

function bindNavigationTabs(){
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
  return ['today','week','exercises','timer','stats','options'];
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
      <button class="stats-reset-btn" type="button" onclick="resetStats()">Reset stats</button>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">Séances</div><div class="stat-value" id="stat-sessions">0</div></div>
      <div class="stat-card"><div class="stat-label">Exercices</div><div class="stat-value" id="stat-exercises">0</div></div>
      <div class="stat-card"><div class="stat-label">Série</div><div class="stat-value" id="stat-streak">0j</div></div>
      <div class="stat-card"><div class="stat-label">Temps</div><div class="stat-value" id="stat-time">0h00</div></div>
    </div>
    <div class="coach-card"><div class="coach-title">Coach</div><div class="coach-text" id="coach-text">Lance ou valide quelques exercices pour créer tes premières stats.</div></div>
    <div class="coach-card"><div class="coach-title">7 derniers jours</div><div class="chart" id="stats-chart"></div></div>
    <div class="section-label">Historique par jour</div><div class="history-list" id="history-list"></div>`;
  if(options)appScreen.insertBefore(el,options); else appScreen.insertBefore(el,appScreen.querySelector('.tab-bar'));
}

function showTab(t){
  ensureStatsTab();
  const tabNames=getTabPageNames();
  currentTab=tabNames.includes(t)?t:'today';
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
    updateTimer();
    updateTimerDetails();
  }
  if(currentTab==='stats' && typeof renderStats==='function')renderStats();
  if(currentTab==='options' && typeof renderOptions==='function')renderOptions();

  if(typeof bindNavigationTabs==='function')bindNavigationTabs();
  storageSafe.setItem('vv-current-tab',currentTab);
  saveAppState();
}
function fmt(s){return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')}

function renderSoundOption(){
  const btn=document.getElementById('sound-toggle');
  if(!btn)return;
  btn.classList.toggle('active',soundEnabled);
  btn.setAttribute('aria-pressed',soundEnabled?'true':'false');
  const label=btn.querySelector('span');
  if(label)label.textContent=soundEnabled?'Activé · bips + vibration':'Désactivé · bips + vibration';
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

  playSoundFile('done');
  playBeep(523,0.12,'sine',0.45);
  setTimeout(()=>playBeep(659,0.12,'sine',0.45),160);
  setTimeout(()=>playBeep(784,0.14,'sine',0.45),320);
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
  if(type==='start'){playSoundFile('start');playBeep(740,0.12,'sine',0.45);vibrate([90]);}
  if(type==='count'){playSoundFile('count');playBeep(960,0.07,'square',0.35);vibrate(35);}
  if(type==='rest'){playSoundFile('rest');playBeep(520,0.16,'sine',0.45);setTimeout(()=>playBeep(520,0.16,'sine',0.45),190);vibrate([100,70,100]);}
  if(type==='done'){playSoundFile('done');playBeep(660,0.12,'sine',0.45);setTimeout(()=>playBeep(880,0.16,'sine',0.45),160);vibrate([130,80,170]);}
}


function setPrepTime(seconds){
  timer.prep=Math.max(0,Number(seconds)||0);
  storageSafe.setItem('vv-prep-time',String(timer.prep));
}
function loadPrepTime(){
  const saved=storageSafe.getItem('vv-prep-time');
  timer.prep=saved===null?5:Math.max(0,Number(saved)||0);
  const select=document.getElementById('prep-select');
  if(select)select.value=String(timer.prep);
}

function setTimerState(seconds,ctx,phase='PRÊT',exercise=null,rest=0,exerciseData=null){clearInterval(timer.interval);timer={seconds,left:seconds,interval:null,running:false,phase:'effort',exercise,exerciseData,effort:seconds,rest,totalPhase:seconds,prep:timer.prep||5,pendingStart:false,circuit:exerciseData&&exerciseData.circuit?exerciseData.circuit:null,circuitIndex:0,sourceDay:null,sourceIndex:null};document.getElementById('timer-context').textContent=ctx;document.getElementById('timer-phase').textContent=phase;document.getElementById('tip-effort').textContent=fmt(seconds);document.getElementById('tip-rest').textContent=rest?fmt(rest):'—';syncTimerLabels();updateTimer();saveAppState()}
function setManualTimer(s){setTimerState(s,'Timer manuel','PRÊT',null,0,null);timer.exerciseData=null;updateTimerDetails()}
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
  if(timer.pendingStart || timer.phase==='prep')return 'Préparation';
  if(timer.phase==='rest')return 'Récupération';
  if(timer.running)return 'Exercice en cours';
  if(hasActiveTimerSession())return 'En pause';
  if(timer.left===0 && timer.exercise)return 'Terminé';
  return 'Exercice sélectionné';
}

function timerContextLabel(){
  const name=currentTimerName();
  const status=timerStatusLabel();

  if(!name){
    if(timer.context)return timer.context;
    return status;
  }

  if(status==='Préparation')return 'Prépare-toi · '+name;
  if(status==='Récupération')return 'Récupération · '+name;
  if(status==='En pause')return 'En pause · '+name;
  if(status==='Terminé')return 'Terminé · '+name;
  if(status==='Exercice en cours')return 'Exercice · '+name;
  return name;
}

function syncTimerLabels(){
  const statusEl=document.getElementById('timer-status-label');
  const contextEl=document.getElementById('timer-context');

  if(statusEl)statusEl.textContent=timerStatusLabel();
  if(contextEl)contextEl.textContent=timerContextLabel();

  document.body.classList.toggle('timer-is-prep',timer.pendingStart||timer.phase==='prep');
  document.body.classList.toggle('timer-is-rest',timer.phase==='rest');
  document.body.classList.toggle('timer-is-effort',timer.running&&timer.phase==='effort');
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
  return 'Détails du minuteur';
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
  const target=document.getElementById('timer-target');
  const sets=document.getElementById('timer-sets');
  const how=document.getElementById('timer-how');
  const tips=document.getElementById('timer-tips');
  const effortEl=document.getElementById('tip-effort');
  const restEl=document.getElementById('tip-rest');
  const modeEl=document.getElementById('tip-mode');

  if(!target||!sets||!how||!tips)return;

  if(!ex){
    target.textContent='—';
    sets.textContent='—';
    how.textContent='Lance une séance depuis Aujourd’hui ou un exercice depuis Exercices pour voir les détails ici.';
    tips.textContent='';
    if(effortEl)effortEl.textContent=timer.seconds?fmt(timer.seconds):'—';
    if(restEl)restEl.textContent=timer.rest?fmt(timer.rest):'Aucune';
    if(modeEl)modeEl.textContent=timerModeLabel();
    return;
  }

  const currentStep=(timer.circuit&&timer.circuit[timer.circuitIndex]) ? timer.circuit[timer.circuitIndex] : null;
  const effort=currentStep ? currentStep.effort : (ex.effort || timer.effort || timer.seconds || 0);
  const rest=currentStep ? currentStep.rest : (ex.rest || timer.rest || 0);

  target.textContent=ex.target || (currentStep ? currentStep.name : 'Exercice');
  sets.textContent=ex.circuit ? 'Circuit · '+ex.circuit.length+' étapes' : (ex.sets || '—');

  if(currentStep){
    how.textContent='À faire maintenant : '+currentStep.name;
  }else{
    how.textContent=ex.how || 'Garde un mouvement propre et contrôlé.';
  }

  tips.textContent=ex.tips ? 'Conseil : '+ex.tips : '';

  if(effortEl)effortEl.textContent=effort ? fmt(effort) : 'Libre';
  if(restEl)restEl.textContent=rest ? fmt(rest) : 'Aucune';
  if(modeEl)modeEl.textContent=timerModeLabel();

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
  if(timer.phase==='prep' || timer.pendingStart) return 'Préparation';
  if(timer.phase==='effort') return 'Effort';
  if(timer.phase==='rest') return 'Récupération';
  if(timer.phase==='manual') return 'Minuteur manuel';
  return 'Bloc en cours';
}
function timerMeaningText(){
  if(timer.phase==='prep' || timer.pendingStart) return 'Prépare-toi : l’exercice démarre à la fin du décompte.';
  if(timer.phase==='effort') return 'Ce temps correspond à l’effort de l’exercice en cours.';
  if(timer.phase==='rest') return 'Ce temps correspond à la récupération avant la suite.';
  if(timer.phase==='manual') return 'Minuteur libre : ce temps n’est pas lié à un exercice.';
  return 'Le temps affiché concerne seulement le bloc en cours, pas toute la séance.';
}


function validateTimerExercise(){
  if(timer.sourceDay===null || timer.sourceIndex===null){
    return;
  }
  toggleExerciseDone(timer.sourceDay,timer.sourceIndex);
  updateTimerValidateButton();
}
function updateTimerValidateButton(){
  const btn=document.getElementById('timer-validate-btn');
  if(!btn)return;
  if(timer.freeMode || timer.sourceDay===null || timer.sourceIndex===null || !P()[timer.sourceDay] || !P()[timer.sourceDay].exercises[timer.sourceIndex]){
    btn.classList.add('hidden');
    return;
  }
  const ex=P()[timer.sourceDay].exercises[timer.sourceIndex];
  btn.classList.remove('hidden');
  btn.textContent=getDone(ex)?'Exercice validé ✓':'Valider cet exercice';
}



function canRestartTimer(){
  return !!(timer && (timer.exercise || timer.exerciseData || timer.circuit || timer.sourceDay!==null));
}

function restartCurrentTimer(){
  if(!canRestartTimer())return;

  const sourceDay=timer.sourceDay;
  const sourceIndex=timer.sourceIndex;
  const data=timer.exerciseData ? {...timer.exerciseData} : null;
  const circuit=timer.circuit ? timer.circuit.map(step=>({...step})) : null;
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

  setTimerState(effort,timer.context || exerciseName,'EXERCICE',exerciseName,rest,data);
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
    }else if(hasActiveTimerSession()){
      btn.textContent='Reprendre';
    }else{
      btn.textContent='Commencer';
    }
  }

  if(restartBtn){
    const showRestart=!timer.running && canRestartTimer() && (hasActiveTimerSession() || timer.left===0);
    restartBtn.classList.toggle('hidden',!showRestart);
  }
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
  syncTimerButtons();
}

function startPrepCountdown(){
  clearInterval(timer.interval);
  timer.pendingStart=true;
  timer.running=true;
  const originalLeft=timer.left;
  let prepLeft=timer.prep;
  document.getElementById('timer-phase').textContent='PRÉPARATION';
  syncTimerLabels();
  document.getElementById('timer-display').textContent=fmt(prepLeft);
  const ring=document.getElementById('timer-ring');
  if(ring)ring.style.setProperty('--timer-progress','0%');
  cue('count');

  timer.interval=setInterval(()=>{
    prepLeft--;
    const progress=Math.round(((timer.prep-prepLeft)/Math.max(1,timer.prep))*100);
    const ring=document.getElementById('timer-ring');
    const fill=document.getElementById('timer-linear-fill');
    const percent=document.getElementById('timer-percent');
    const step=document.getElementById('timer-step');

    if(ring)ring.style.setProperty('--timer-progress',progress+'%');
    if(fill)fill.style.width=progress+'%';
    if(percent)percent.textContent=progress+'%';
    if(step)step.textContent='Préparation';

    if(prepLeft>0){
      document.getElementById('timer-display').textContent=fmt(prepLeft);
      if(prepLeft<=3)cue('count');
    }else{
      clearInterval(timer.interval);
      timer.pendingStart=false;syncTimerLabels();
      timer.left=originalLeft;
      document.getElementById('timer-phase').textContent='EFFORT';
      startActiveTimer();
    }
  },1000);
}

function startActiveTimer(){
  timer.running=true;
  cue('start');
  timer.interval=setInterval(()=>{
    timer.left--;
    if(timer.left>0&&timer.left<=3)cue('count');
    if(timer.left<=0){
      clearInterval(timer.interval);
      if(timer.phase==='effort'&&timer.rest>0){
        cue('rest');
        timer.phase='rest';syncTimerLabels();
        timer.left=timer.rest;
        timer.seconds=timer.rest;
        timer.totalPhase=timer.rest;
        document.getElementById('timer-phase').textContent='RÉCUPÉRATION';
        timer.interval=setInterval(()=>{
          timer.left--;
          if(timer.left>0&&timer.left<=3)cue('count');
          if(timer.left<=0){
            clearInterval(timer.interval);
            if(timer.circuit && timer.circuitIndex < timer.circuit.length-1){
              timer.circuitIndex++;
              const step=timer.circuit[timer.circuitIndex];
              timer.exercise=step.name;syncTimerLabels();
              timer.left=step.effort;
              timer.seconds=step.effort;
              timer.totalPhase=step.effort;
              timer.rest=step.rest;
              timer.phase='effort';syncTimerLabels();
              document.getElementById('timer-context').textContent='Circuit · '+step.name;
              document.getElementById('timer-phase').textContent='EFFORT';
              timer.pendingStart=false;syncTimerLabels();
              updateTimer();
              if(timer.prep>0)startPrepCountdown(); else startActiveTimer();
            }else{
              if(timer.guided&&advanceGuidedSession()){
                return;
              }
              timer.running=false;
              document.getElementById('timer-phase').textContent='TERMINÉ';
              cue('done');
            }
          }
          updateTimer();
        },1000);
      }else{
        if(timer.guided&&advanceGuidedSession()){
          return;
        }
        timer.running=false;
        document.getElementById('timer-phase').textContent='TERMINÉ';
        cue('done');
      }
    }
    updateTimer();
  },1000);
  updateTimer();
}

function toggleTimer(){
  if(timer.running){
    timer.running=false;
    timer.pendingStart=false;syncTimerLabels();
    clearInterval(timer.interval);
    updateTimer();
    saveAppState();
    return;
  }

  if(timer.left<=0){
    timer.left=timer.seconds;
    timer.totalPhase=timer.seconds;
  }

  const shouldPrep = timer.phase==='effort' && timer.prep>0 && !timer.pendingStart;
  if(shouldPrep){
    startPrepCountdown();
    return;
  }

  startActiveTimer();

  syncTimerLabels();
  if(typeof updateMainTimerButton==='function')updateMainTimerButton();
}
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}))}
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
      prepStatus==='Préparation' &&
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
  const activeWeek=document.getElementById('tab-week') ? document.getElementById('tab-week').classList.contains('active') : true;

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
    (typeof __testFirstStartTimerState==='function' ? __testFirstStartTimerState() : true) &&
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
  const countOptions=(html.match(/<h2>Options<\/h2>/g)||[]).length;
  const countNiveau=(html.match(/>Niveau</g)||[]).length;
  const countMaterial=(html.match(/>Matériel disponible</g)||[]).length;
  const tabChildrenOk=Array.from ? Array.from(tab.children).filter(x=>x.id!=='options-content').length===0 : true;
  showTab('today');
  const hiddenOk=tab.hidden===true && tab.style.display==='none';
  return countOptions===1 && countNiveau===1 && countMaterial===1 && html.includes('Sons du minuteur') && tabChildrenOk && hiddenOk;
}
