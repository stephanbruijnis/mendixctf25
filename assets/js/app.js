const state = {
  raw: [],
  query: '',
  category: '',
};

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

function truncate(str, n=160){
  if(!str) return '';
  return str.length > n ? str.slice(0,n-1) + '…' : str;
}

function unique(arr){ return Array.from(new Set(arr.filter(Boolean))).sort(); }

function renderFilters(){
  const cats = unique(state.raw.map(x => x.category));
  const catSelect = $('#cat');
  const current = catSelect.value;
  catSelect.innerHTML = '<option value="">All categories</option>' + cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  if (cats.includes(current)) catSelect.value = current;
}

function applyFilters(items){
  const q = state.query.trim().toLowerCase();
  const cat = state.category;
  let out = items.filter(it => {
    const hay = [it.name, it.description, it.attribution, (it.files||[]).join(' '), (it.hints||[]).join(' '), (it.tags||[]).join(' '), it.category].join(' ').toLowerCase();
    const okQ = q ? hay.includes(q) : true;
    const okCat = cat ? it.category === cat : true;
    return okQ && okCat;
  });

  return out;
}

function renderCards(items){
  // Group challenges by category
  const sections = {
    'Pizza Mario - Beginner to Medium': [],
    'Patient Portal - Hard to Insane': [],
    'Magic': []
  };
  
  // Sort items into sections
  items.forEach(item => {
    const category = item.category || 'Uncategorized';
    if (sections[category]) {
      sections[category].push(item);
    }
  });
  
  // Sort each section by points ascending (lowest to highest)
  Object.keys(sections).forEach(sectionKey => {
    sections[sectionKey].sort((a, b) => (a.value || 0) - (b.value || 0));
  });
  
  // Render each section
  const pizzaGrid = $('#pizza-mario-grid');
  const patientGrid = $('#patient-portal-grid');
  const magicGrid = $('#magic-grid');
  
  pizzaGrid.innerHTML = sections['Pizza Mario - Beginner to Medium'].map(cardHTML).join('');
  patientGrid.innerHTML = sections['Patient Portal - Hard to Insane'].map(cardHTML).join('');
  magicGrid.innerHTML = sections['Magic'].map(cardHTML).join('');
  
  // Show/hide sections based on content
  $('#pizza-mario-section').style.display = sections['Pizza Mario - Beginner to Medium'].length > 0 ? 'block' : 'none';
  $('#patient-portal-section').style.display = sections['Patient Portal - Hard to Insane'].length > 0 ? 'block' : 'none';
  $('#magic-section').style.display = sections['Magic'].length > 0 ? 'block' : 'none';
  
  // Show empty message if no items in any section
  const totalItems = Object.values(sections).reduce((sum, arr) => sum + arr.length, 0);
  $('#empty').hidden = totalItems > 0;

  // wire buttons
  $$('.btn-details').forEach(btn => btn.addEventListener('click', ()=>{
    const id = btn.dataset.id;
    const challenge = state.raw.find(c => c.id.toString() === id);
    if (challenge) {
      showDetailsModal(challenge);
    }
  }));
}

function cardHTML(it){
  const id = (it.id ?? '').toString();
  const cat = escapeHtml(it.category || 'Uncategorized');
  const pts = escapeHtml((it.value ?? 0).toString());
  const title = escapeHtml(it.name || 'Untitled');
  const desc = escapeHtml(truncate(it.description || ''));
  const tags = (it.tags||[]).map(t=>`<span class="chip">#${escapeHtml(t)}</span>`).join('');
  const files = (it.files||[]).map(f=>`<li><a href="${escapeAttr(f)}" target="_blank" rel="noopener">${escapeHtml(fileName(f))}</a></li>`).join('');
  const hints = (it.hints||[]).map(h=>`<li>${escapeHtml(h)}</li>`).join('');
  const conn = (it.connection_info || '').trim();
  const next = it.next_id ? `<div class="muted">Next challenge id: <span class="kbd">${escapeHtml(it.next_id)}</span></div>` : '';

  return `
  <article class="card" role="listitem" aria-label="${title}">
    <div class="card-head">
      <span class="pts">${pts} pts</span>
    </div>
    <h3 class="card-title">${title}</h3>
    <p class="card-desc">${desc}</p>
    <div class="chips">${tags}</div>
    <div class="actions">
      <button class="btn btn-details" data-id="${escapeAttr(id)}">Details</button>
      ${conn ? `<a href="${escapeAttr(conn)}" target="_blank" rel="noopener" class="btn secondary">Open Application</a>` : ''}
    </div>
  </article>`;
}

function cssEscape(id){ return CSS?.escape ? CSS.escape(id) : id.replace(/[^\w-]/g, '_'); }
function fileName(url){ try { const u = new URL(url, location.href); return decodeURIComponent(u.pathname.split('/').pop()||url); } catch { return url; } }

function processMarkdown(text) {
  if (!text) return '';
  // Convert markdown images to HTML images
  let processed = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">');
  // Convert \r\n to <br> for line breaks
  processed = processed.replace(/\r\n/g, '<br>');
  return processed;
}

function showDetailsModal(challenge) {
  const modal = $('#modal');
  const modalTitle = $('#modalTitle');
  const modalBody = $('#modalBody');
  
  modalTitle.textContent = challenge.name || 'Challenge Details';
  
  const files = (challenge.files||[]).map(f=>`<li><a href="${escapeAttr(f)}" target="_blank" rel="noopener">${escapeHtml(fileName(f))}</a></li>`).join('');
  const hints = (challenge.hints||[]).map(h=>`<li>${escapeHtml(h)}</li>`).join('');
  const next = challenge.next_id ? `<div class="muted">Next challenge id: <span class="kbd">${escapeHtml(challenge.next_id)}</span></div>` : '';
  
  modalBody.innerHTML = `
    <div class="modal-section">
      <h4>Category</h4>
      <div class="badge">${escapeHtml(challenge.category || 'Uncategorized')}</div>
    </div>
    
    <div class="modal-section">
      <h4>Points</h4>
      <div class="pts">${escapeHtml((challenge.value || 0).toString())} pts</div>
    </div>
    
    ${challenge.description ? `<div class="modal-section">
      <h4>Description</h4>
      <div>${processMarkdown(challenge.description)}</div>
    </div>` : ''}
    
    ${files ? `<div class="modal-section">
      <h4>Files</h4>
      <ul class="list">${files}</ul>
    </div>` : ''}
    
    ${hints ? `<div class="modal-section">
      <h4>Hints</h4>
      <ul class="list">${hints}</ul>
    </div>` : ''}
    
    ${challenge.attribution ? `<div class="modal-section">
      <h4>Attribution</h4>
      <div class="muted">${escapeHtml(challenge.attribution)}</div>
    </div>` : ''}
    
    ${challenge.connection_info ? `<div class="modal-section">
      <h4>Connection</h4>
      <a href="${escapeAttr(challenge.connection_info)}" target="_blank" rel="noopener" class="btn secondary">Open Application</a>
    </div>` : ''}
    
    ${next ? `<div class="modal-section">${next}</div>` : ''}
  `;
  
  modal.showModal();
}

function openConn(text){
  const dialog = $('#modal');
  $('#connText').textContent = text || '';
  $('#copyConn').onclick = ()=> copy(text || '');
  $('#openLink').onclick = ()=>{
    try{ const u = new URL(text); window.open(u.href, '_blank','noopener'); }
    catch{ alert('No valid URL detected in connection info. Copied to clipboard instead.'); copy(text||''); }
  };
  dialog.showModal();
}

function copy(text){
  if(!text) return;
  navigator.clipboard?.writeText(text).then(()=>{
    toast('Copied to clipboard');
  }).catch(()=>{
    fallbackCopy(text);
  });
}
function fallbackCopy(text){
  const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); toast('Copied to clipboard');
}

function toast(msg){
  const t = document.createElement('div');
  t.textContent = msg; t.style.position='fixed'; t.style.bottom='20px'; t.style.left='50%'; t.style.transform='translateX(-50%)';
  t.style.background='rgba(13,110,253,0.95)'; t.style.color='#fff'; t.style.padding='10px 14px'; t.style.borderRadius='999px'; t.style.boxShadow='0 10px 30px rgba(13,110,253,0.35)'; t.style.zIndex='9999';
  document.body.appendChild(t); setTimeout(()=>{ t.remove(); }, 1300);
}

// FIX: remove stray ')' from regex
function escapeHtml(str=''){
  return String(str).replace(/[&<>"]/g, s=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[s]));
}
function escapeAttr(str=''){
  return String(str).replace(/["'`<>&]/g, c=>({"\"":"&quot;","'":"&#39;","`":"&#96;","<":"&lt;",">":"&gt;","&":"&amp;"}[c]));
}

function update(){
  const filtered = applyFilters(state.raw);
  renderCards(filtered);
  // persist basic UI state
  localStorage.setItem('ctf-ui', JSON.stringify({
    q: state.query, cat: state.category
  }));
}

async function bootstrap(){
  console.log('Bootstrap starting...');
  bindUI();
  console.log('UI bound, loading data...');
  await loadData();
  console.log('Bootstrap complete');
}

async function loadData(){
  console.log('Loading data...');
  try{
    console.log('Fetching resources/data/challenges.json');
    const res = await fetch('resources/data/challenges.json', {cache:'no-store'});
    console.log('Fetch response:', res.status, res.ok);
    if(!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    console.log('Data loaded:', data.length, 'challenges');
    if(!Array.isArray(data)) throw new Error('JSON root must be an array');
    state.raw = data;
  } catch(err){
    console.error('Could not load resources/data/challenges.json. You can still paste JSON via prompt.', err);
    const demo = [];
    state.raw = demo; // empty fallback
  }
  console.log('Calling hydrateFromState with', state.raw.length, 'challenges');
  hydrateFromState();
}

function hydrateFromState(){
  renderFilters();
  
  // Set up system dark mode detection
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle('light', !prefersDark);
  
  // Listen for changes to system theme preference
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    document.documentElement.classList.toggle('light', !e.matches);
  });
  
  const persisted = localStorage.getItem('ctf-ui');
  if(persisted){
    try{
      const p = JSON.parse(persisted);
      state.query = p.q || '';
      state.category = p.cat || '';
    }catch{}
  }
  $('#q').value = state.query;
  $('#cat').value = state.category;
  update();
}

function bindUI(){
  $('#q').addEventListener('input', e=>{ state.query = e.target.value; update(); });
  $('#cat').addEventListener('change', e=>{ state.category = e.target.value; update(); });
  $('#reset').addEventListener('click', ()=>{ state.query=''; state.category=''; update(); hydrateFromState(); $('#q').value=''; $('#cat').value=''; });

  // modal
  $('#closeModal').addEventListener('click', ()=> $('#modal').close());
  $('#modal').addEventListener('click', (e)=>{ const d = $('#modal'); const r = d.getBoundingClientRect(); if(e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close(); });

  // shortcuts
  window.addEventListener('keydown', (e)=>{ if(e.key === '/'){ e.preventDefault(); $('#q').focus(); } });
}

// ---- Lightweight runtime tests (do not alter app behavior) ----
function assertEq(name, actual, expected){
  if(actual !== expected){
    console.error('❌', name, { actual, expected });
  } else {
    console.log('✅', name);
  }
}
function runTests(){
  try{
    assertEq('escapeHtml ampersand', escapeHtml('&'), '&amp;');
    assertEq('escapeHtml lt/gt', escapeHtml('<div>'), '&lt;div&gt;');
    assertEq('escapeHtml quote', escapeHtml('"hi"'), '&quot;hi&quot;');
    assertEq('escapeAttr all', escapeAttr('"\'`<>&'), '&quot;&#39;&#96;&lt;&gt;&amp;');
    console.log('All sanity tests executed.');
  } catch(e){ console.error('Test harness error', e); }
}

// Initialize
console.log('Starting initialization...');
bootstrap();
runTests();
console.log('Initialization completed.');