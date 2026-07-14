/* ============ AMBIENT CANVAS PARTICLES ============ */
const canvas = document.getElementById('bgcanvas');
const ctx = canvas.getContext('2d');
let W,H,particles=[];
function resize(){W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight;}
window.addEventListener('resize', resize); resize();
for(let i=0;i<60;i++){
  particles.push({x:Math.random()*W, y:Math.random()*H, r:Math.random()*1.6+.3, s:Math.random()*.3+.05, o:Math.random()*.5+.1});
}
function drawParticles(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#d4af37';
  particles.forEach(p=>{
    ctx.globalAlpha=p.o;
    ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    p.y -= p.s;
    if(p.y<-10){p.y=H+10; p.x=Math.random()*W;}
  });
  ctx.globalAlpha=1;
  requestAnimationFrame(drawParticles);
}
drawParticles();

/* ============ SOUND ============ */
let audioCtx=null;
let soundOn = localStorage.getItem('ric_sound') !== 'off';
function updateSoundBtn(){document.getElementById('soundBtn').textContent = soundOn ? '🔊 AUDIO ON' : '🔇 AUDIO OFF';}
updateSoundBtn();
document.getElementById('soundBtn').addEventListener('click', ()=>{
  soundOn = !soundOn;
  localStorage.setItem('ric_sound', soundOn?'on':'off');
  updateSoundBtn();
  if(soundOn) blip(660,.05);
});
function blip(freq=520, dur=.06){
  if(!soundOn) return;
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type='sine'; o.frequency.value=freq;
    g.gain.setValueAtTime(.06, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(.0001, audioCtx.currentTime+dur);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime+dur);
  }catch(e){}
}

/* ============ COUNTDOWN ============ */
const target = new Date('2026-07-21T20:00:00');
function tickCountdown(){
  const now = new Date();
  let diff = target - now;
  if(diff < 0) diff = 0;
  const d = Math.floor(diff/(1000*60*60*24));
  const h = Math.floor((diff/(1000*60*60))%24);
  const m = Math.floor((diff/(1000*60))%60);
  const s = Math.floor((diff/1000)%60);
  document.getElementById('cd-d').textContent = String(d).padStart(2,'0');
  document.getElementById('cd-h').textContent = String(h).padStart(2,'0');
  document.getElementById('cd-m').textContent = String(m).padStart(2,'0');
  document.getElementById('cd-s').textContent = String(s).padStart(2,'0');
}
tickCountdown(); setInterval(tickCountdown,1000);

/* ============ GAUGES ============ */
const probability = Math.floor(Math.random()*88)+8; // 8-95
const autismLevel = Math.floor(Math.random()*16)+84; // 84-99

function captionFor(p){
  if(p<25) return "Esito incerto. Preparare piano B.";
  if(p<50) return "Possibile, ma servirà fortuna.";
  if(p<75) return "Condizioni favorevoli rilevate.";
  return "Il destino è dalla nostra parte.";
}
window.addEventListener('load', ()=>{
  setTimeout(()=>{
    const circumference = 251;
    const offset = circumference - (circumference * probability/100);
    document.getElementById('gaugeArc').style.transition='stroke-dashoffset 1.6s cubic-bezier(.16,.9,.3,1)';
    document.getElementById('gaugeArc').style.strokeDashoffset = offset;
    document.getElementById('probVal').textContent = probability + '%';
    document.getElementById('probCaption').textContent = captionFor(probability);
  }, 400);

  setTimeout(()=>{
    document.getElementById('autismFill').style.width = autismLevel + '%';
    document.getElementById('autismPct').textContent = autismLevel + '%';
    document.getElementById('autismLabel').textContent = autismLevel>95 ? 'MASSIMO STORICO REGISTRATO' : 'LIVELLO CRITICO';
  }, 500);
});

/* ============ ACHIEVEMENTS ============ */
const ACHIEVEMENTS = {
  observer:   {name:"Osservatore Attento", desc:"Hai esaminato entrambi gli agenti sul campo.", icon:"👁️"},
  redactor:   {name:"Occhio di Falco", desc:"Hai svelato un'informazione redatta.", icon:"🔍"},
  gambler:    {name:"Scommettitore", desc:"Hai piazzato una previsione operativa.", icon:"🎲"},
  voter:      {name:"Stratega", desc:"Hai votato l'esito della missione.", icon:"🗳️"},
  writer:     {name:"Sceneggiatore", desc:"Hai suggerito una frase per Pastore.", icon:"✍️"},
  explorer:   {name:"Esploratore", desc:"Hai raggiunto il fondo del dossier.", icon:"🧭"},
  konami:     {name:"Agente Segreto", desc:"Hai scoperto il codice nascosto.", icon:"🕵️"},
  declass:    {name:"Whistleblower", desc:"Hai tentato di declassificare il documento.", icon:"📁"},
};
let unlocked = JSON.parse(localStorage.getItem('ric_ach') || '{}');

function renderAchievements(){
  const grid = document.getElementById('achGrid');
  grid.innerHTML='';
  let count=0;
  Object.entries(ACHIEVEMENTS).forEach(([key,a])=>{
    const isUn = !!unlocked[key];
    if(isUn) count++;
    const el = document.createElement('div');
    el.className = 'card ach' + (isUn?' unlocked':'');
    el.innerHTML = `<div class="aic">${isUn?a.icon:'🔒'}</div><h5>${isUn?a.name:'???'}</h5><p>${isUn?a.desc:'Distintivo non ancora sbloccato.'}</p>`;
    grid.appendChild(el);
  });
  document.getElementById('achProgress').textContent = `${count} / ${Object.keys(ACHIEVEMENTS).length} SBLOCCATI`;
}
function unlock(key){
  if(unlocked[key]) return;
  unlocked[key]=true;
  localStorage.setItem('ric_ach', JSON.stringify(unlocked));
  renderAchievements();
  showToast('DISTINTIVO SBLOCCATO', ACHIEVEMENTS[key].icon + ' ' + ACHIEVEMENTS[key].name);
  blip(880,.09);
}
renderAchievements();

function showToast(title, desc){
  const box = document.getElementById('toastbox');
  const t = document.createElement('div');
  t.className='toast';
  t.innerHTML = `<div class="ttitle">${title}</div><div class="tdesc">${desc}</div>`;
  box.appendChild(t);
  setTimeout(()=>t.remove(), 4200);
}

/* click avatars -> observer achievement */
let avClicks = new Set();
['av1','av2'].forEach(id=>{
  document.getElementById(id).addEventListener('click', ()=>{
    blip(420,.05);
    avClicks.add(id);
    if(avClicks.size===2) unlock('observer');
  });
});

/* redacted reveal */
document.querySelectorAll('.redacted').forEach(el=>{
  el.addEventListener('mouseenter', ()=> unlock('redactor'));
  el.addEventListener('click', ()=> unlock('redactor'));
});

/* scroll to bottom -> explorer */
window.addEventListener('scroll', ()=>{
  if((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 40){
    unlock('explorer');
  }
});

/* ============ BETS ============ */
const BET_OPTIONS = [
  {id:'foto', label:'Foto ricordo insieme', odds:'2.5x'},
  {id:'nega', label:'Pastore nega la somiglianza', odds:'1.8x'},
  {id:'fuga', label:'Sarcinella scappa in bagno', odds:'4.0x'},
  {id:'ignoto', label:'Nessuno dei due se ne accorge', odds:'3.2x'},
  {id:'standing', label:'Standing ovation del gruppo WhatsApp', odds:'6.6x'},
  {id:'chiede', label:'Pastore chiede "chi sei?"', odds:'5.5x'},
];
let betCounts = JSON.parse(localStorage.getItem('ric_bets') || '{}');
let myBet = localStorage.getItem('ric_mybet') || null;
BET_OPTIONS.forEach(o=>{ if(!(o.id in betCounts)) betCounts[o.id]=Math.floor(Math.random()*40)+5; });

function renderBets(){
  const grid = document.getElementById('betsGrid');
  grid.innerHTML='';
  const total = Object.values(betCounts).reduce((a,b)=>a+b,0) || 1;
  BET_OPTIONS.forEach(o=>{
    const pct = Math.round((betCounts[o.id]/total)*100);
    const el = document.createElement('div');
    el.className = 'card bet' + (myBet===o.id ? ' selected':'');
    el.innerHTML = `
      <div class="odds">${o.odds}</div>
      <h4>${o.label}</h4>
      <div class="bet-bar"><div style="width:${pct}%"></div></div>
      <div class="bet-pct">${pct}% degli agenti concorda</div>
    `;
    el.addEventListener('click', ()=>{
      if(myBet===o.id) return;
      if(myBet) betCounts[myBet] = Math.max(0, betCounts[myBet]-1);
      betCounts[o.id] = (betCounts[o.id]||0)+1;
      myBet = o.id;
      localStorage.setItem('ric_bets', JSON.stringify(betCounts));
      localStorage.setItem('ric_mybet', myBet);
      renderBets();
      unlock('gambler');
      blip(600,.06);
    });
    grid.appendChild(el);
  });
}
renderBets();

/* ============ OUTCOME VOTE ============ */
const OUTCOMES = [
  {id:'photo', label:'Foto', icon:'📸'},
  {id:'greet', label:'Saluto', icon:'🤝'},
  {id:'flee', label:'Fuga', icon:'🏃'},
  {id:'none', label:'Nessun contatto', icon:'🚫'},
];
let outcomeCounts = JSON.parse(localStorage.getItem('ric_outcomes') || '{}');
let myOutcome = localStorage.getItem('ric_myoutcome') || null;
OUTCOMES.forEach(o=>{ if(!(o.id in outcomeCounts)) outcomeCounts[o.id]=Math.floor(Math.random()*30)+10; });

function renderOutcomes(){
  const grid = document.getElementById('outcomeGrid');
  grid.innerHTML='';
  const total = Object.values(outcomeCounts).reduce((a,b)=>a+b,0) || 1;
  OUTCOMES.forEach(o=>{
    const pct = Math.round((outcomeCounts[o.id]/total)*100);
    const el = document.createElement('div');
    el.className = 'card outcome' + (myOutcome===o.id?' voted':'');
    el.innerHTML = `
      <div class="icon">${o.icon}</div>
      <h4>${o.label}</h4>
      <div class="obar"><div style="width:${pct}%"></div></div>
      <div class="opct">${pct}%</div>
    `;
    el.addEventListener('click', ()=>{
      if(myOutcome===o.id) return;
      if(myOutcome) outcomeCounts[myOutcome] = Math.max(0, outcomeCounts[myOutcome]-1);
      outcomeCounts[o.id] = (outcomeCounts[o.id]||0)+1;
      myOutcome = o.id;
      localStorage.setItem('ric_outcomes', JSON.stringify(outcomeCounts));
      localStorage.setItem('ric_myoutcome', myOutcome);
      renderOutcomes();
      unlock('voter');
      blip(700,.06);
    });
    grid.appendChild(el);
  });
}
renderOutcomes();

/* ============ SUGGESTIONS ============ */
function loadSuggestions(){ return JSON.parse(localStorage.getItem('ric_suggestions') || '[]'); }
function saveSuggestions(arr){ localStorage.setItem('ric_suggestions', JSON.stringify(arr)); }

function renderSuggestions(){
  const list = document.getElementById('suggestList');
  const items = loadSuggestions();
  list.innerHTML='';
  if(items.length===0){
    list.innerHTML = '<div class="suggest-empty">Nessuna frase ancora registrata. Sii il primo agente a proporne una.</div>';
    return;
  }
  items.slice().reverse().forEach((it, idxRev)=>{
    const idx = items.length - 1 - idxRev;
    const el = document.createElement('div');
    el.className='suggest-item';
    el.innerHTML = `<span class="del" data-idx="${idx}">✕</span>“${it.text}”<div class="meta">Agente anonimo · ${it.time}</div>`;
    list.appendChild(el);
  });
  list.querySelectorAll('.del').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const i = parseInt(e.target.dataset.idx);
      const arr = loadSuggestions();
      arr.splice(i,1);
      saveSuggestions(arr);
      renderSuggestions();
    });
  });
}
renderSuggestions();

document.getElementById('suggestBtn').addEventListener('click', ()=>{
  const input = document.getElementById('suggestInput');
  const val = input.value.trim();
  if(!val) return;
  const arr = loadSuggestions();
  arr.push({text: val, time: new Date().toLocaleDateString('it-IT', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'})});
  saveSuggestions(arr);
  input.value='';
  renderSuggestions();
  unlock('writer');
  blip(760,.07);
});
document.getElementById('suggestInput').addEventListener('keydown', (e)=>{
  if(e.key==='Enter' && (e.ctrlKey || e.metaKey)) document.getElementById('suggestBtn').click();
});

/* ============ FOOTER EASTER EGG (declassify) ============ */
let footerClicks=0;
document.getElementById('footerStamp').addEventListener('click', (e)=>{
  footerClicks++;
  blip(500,.04);
  if(footerClicks>=5){
    e.target.textContent = '◈ DOCUMENTO DECLASSIFICATO ◈';
    e.target.style.color = '#3fd58a';
    e.target.style.borderColor = '#3fd58a';
    unlock('declass');
  }
});

/* ============ LOGO TRIPLE CLICK EASTER EGG ============ */
let logoClicks=0, logoTimer=null;
document.getElementById('logoClick').addEventListener('click', ()=>{
  logoClicks++;
  blip(340,.04);
  clearTimeout(logoTimer);
  logoTimer = setTimeout(()=>{ logoClicks=0; }, 900);
  if(logoClicks>=3){
    showToast('MESSAGGIO CIFRATO', 'Anche i sosia meritano rispetto. Forse.');
    logoClicks=0;
  }
});

/* ============ KONAMI CODE EASTER EGG ============ */
const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let konamiIdx=0;
window.addEventListener('keydown', (e)=>{
  const key = e.key.length===1 ? e.key.toLowerCase() : e.key;
  if(key === konami[konamiIdx]){
    konamiIdx++;
    if(konamiIdx===konami.length){
      document.getElementById('secretSection').classList.add('show');
      document.getElementById('secretSection').scrollIntoView({behavior:'smooth', block:'center'});
      unlock('konami');
      konamiIdx=0;
    }
  } else {
    konamiIdx = (key===konami[0]) ? 1 : 0;
  }
});
