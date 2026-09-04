/* ============================================================
   Sweetly — shared engine used by proposal.html / birthday.html / sorry.html
   ============================================================ */

const THEMES = [
  {key:'pink', name:'Romantic Pink', tagline:'Soft, warm & full of heart', particles:['💗','💕','✨','🌸']},
  {key:'elegant', name:'Elegant Dark', tagline:'Midnight, refined & dreamy', particles:['✦','⭐','🤍','✧']},
  {key:'cute', name:'Cute & Playful', tagline:'Bubbly, bright & fun', particles:['🎈','✨','🎉','💫']},
  {key:'premium', name:'Premium Gold', tagline:'Luxe, minimal & timeless', particles:['✨','🥂','⭐','♛']}
];

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function applyTheme(key){
  document.documentElement.setAttribute('data-theme', key);
  return key;
}

function renderSwitcher(container, activeKey, onPick){
  if(!container) return;
  container.innerHTML = THEMES.map(t =>
    `<div class="swatch sw-${t.key} ${activeKey===t.key?'active':''}" data-theme-key="${t.key}" title="${t.name}"></div>`
  ).join('');
  container.querySelectorAll('.swatch').forEach(el=>{
    el.addEventListener('click', ()=> onPick(el.getAttribute('data-theme-key')));
  });
}

function spawnParticle(themeKey, layer){
  if(reducedMotion || !layer) return;
  const t = THEMES.find(t=>t.key===themeKey) || THEMES[0];
  const glyph = t.particles[Math.floor(Math.random()*t.particles.length)];
  const el = document.createElement('span');
  el.className='p';
  el.textContent = glyph;
  el.style.left = (Math.random()*100)+'%';
  el.style.fontSize = (14+Math.random()*14)+'px';
  el.style.animationDuration = (7+Math.random()*6)+'s';
  el.style.setProperty('--drift', (Math.random()*80-40)+'px');
  layer.appendChild(el);
  el.addEventListener('animationend', ()=> el.remove());
}

function startAmbient(getThemeKey, layer){
  if(reducedMotion) return;
  setInterval(()=> spawnParticle(getThemeKey(), layer), 900);
}

function setStage(stageEl, html, attach){
  stageEl.classList.add('out');
  setTimeout(()=>{
    stageEl.innerHTML = html;
    stageEl.classList.remove('out');
    stageEl.classList.add('in');
    if(attach) attach();
    requestAnimationFrame(()=> requestAnimationFrame(()=> stageEl.classList.remove('in')));
  }, reducedMotion ? 0 : 200);
}

function burstConfetti(themeKey){
  if(reducedMotion) return;
  const t = THEMES.find(t=>t.key===themeKey) || THEMES[0];
  const layer = document.createElement('div');
  layer.className='confetti-layer';
  document.body.appendChild(layer);
  for(let i=0;i<34;i++){
    const s = document.createElement('span');
    s.textContent = t.particles[Math.floor(Math.random()*t.particles.length)];
    s.style.left = Math.random()*100+'%';
    s.style.setProperty('--fx', (Math.random()*160-80)+'px');
    s.style.animationDuration = (2+Math.random()*1.6)+'s';
    s.style.animationDelay = (Math.random()*0.5)+'s';
    s.style.fontSize = (14+Math.random()*16)+'px';
    layer.appendChild(s);
  }
  setTimeout(()=> layer.remove(), 3600);
}

function copyLink(text, btnEl){
  if(navigator.clipboard) navigator.clipboard.writeText(text).catch(()=>{});
  const original = btnEl.textContent;
  btnEl.textContent = 'Copied!';
  setTimeout(()=> btnEl.textContent = original, 1500);
}

async function createShareLink(state, btnEl, codeEl){
  const original = btnEl.textContent;
  btnEl.disabled = true;
  btnEl.textContent = 'Creating...';
  try{
    const url = new URL(shareUrl(state));
    codeEl.textContent = url.toString();
    if(navigator.clipboard) await navigator.clipboard.writeText(url.toString()).catch(()=>{});
    btnEl.textContent = 'Copied!';
  } catch(error){
    btnEl.textContent = 'Try again';
  }
  btnEl.disabled = false;
  setTimeout(()=> btnEl.textContent = original, 1800);
}

function encodeShareState(state){
  const data = [
    state.theme, state.name, state.message, state.icon,
    state.passwordEnabled ? state.password : '',
    state.question || '', state.reason || ''
  ];
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function shareUrl(state){
  const url = new URL(window.location.href);
  url.hash = 's=' + encodeShareState(state);
  return url.toString();
}

function loadSharedState(state){
  const match = window.location.hash.match(/^#s=([\w-]+)$/);
  if(!match) return false;
  try{
    const encoded = match[1].replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - match[1].length % 4) % 4);
    const data = JSON.parse(decodeURIComponent(escape(atob(encoded))));
    Object.assign(state, {
      theme: data[0] || state.theme, name: data[1] || '', message: data[2] || '',
      icon: data[3] || state.icon, password: data[4] || '',
      passwordEnabled: Boolean(data[4]), question: data[5] || '', reason: data[6] || '',
      mode:'recipient', step:0, passwordShowField:false
    });
    return true;
  } catch(error){
    return false;
  }
}

/* Playful "dodging" button — used for NO / "still mad" style buttons.
   Moves, shrinks and rotates on any interaction attempt, with a rotating caption. */
function attachDodge(btn, container, captionEl, teaseArr){
  let dodges = 0;
  function dodge(){
    dodges++;
    const scale = Math.max(0.55, 1 - dodges*0.045);
    const rect = container.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const maxX = Math.max(0, rect.width - btnRect.width - 8);
    const maxY = Math.max(0, rect.height - btnRect.height - 8);
    const x = 4 + Math.random()*maxX;
    const y = 4 + Math.random()*maxY;
    btn.style.position='absolute';
    btn.style.left = x+'px';
    btn.style.top = y+'px';
    btn.style.transform = `scale(${scale}) rotate(${Math.random()*30-15}deg)`;
    if(captionEl && teaseArr && teaseArr.length){
      captionEl.textContent = teaseArr[Math.floor(Math.random()*teaseArr.length)];
      captionEl.classList.remove('pop'); void captionEl.offsetWidth; captionEl.classList.add('pop');
    }
  }
  ['pointerenter','pointerdown','click','touchstart'].forEach(ev=>{
    btn.addEventListener(ev, (e)=>{ e.preventDefault(); dodge(); }, {passive:false});
  });
}

function typewriter(el, text, onDone){
  if(reducedMotion){ el.textContent = text; if(onDone) onDone(); return; }
  let i=0;
  el.innerHTML = '<span class="caret">&nbsp;</span>';
  const iv = setInterval(()=>{
    i++;
    el.innerHTML = text.slice(0,i) + '<span class="caret">&nbsp;</span>';
    if(i>=text.length){ clearInterval(iv); if(onDone) onDone(); }
  }, 16);
}

function shareId(state){
  if(!state._id) state._id = Math.random().toString(36).slice(2,8);
  return state._id;
}
