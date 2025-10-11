const state = {
  raw: [],
  query: '',
  category: '',
  currentChallenge: null,
  currentTab: 'details'
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
      showChallengePage(challenge);
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

function showChallengePage(challenge) {
  console.log('Showing challenge page for:', challenge.name, challenge);
  
  state.currentChallenge = challenge;
  state.currentTab = 'details';
  
  // Update URL
  const challengeSlug = challenge.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  history.pushState({ challengeId: challenge.id }, '', `#challenge/${challenge.id}/${challengeSlug}`);
  
  // Hide main content and show challenge page
  const app = $('#app');
  const toolbar = $('.toolbar');
  
  if (app) app.style.display = 'none';
  if (toolbar) toolbar.style.display = 'none';
  
  // Update page title
  document.title = `${challenge.name} - Mendix CTF 2025`;
  
  // Show challenge page
  let challengePage = $('#challenge-page');
  if (!challengePage) {
    challengePage = document.createElement('div');
    challengePage.id = 'challenge-page';
    challengePage.className = 'container';
    const main = document.querySelector('main');
    if (main) {
      main.appendChild(challengePage);
    } else {
      document.body.appendChild(challengePage);
    }
  }
  
  challengePage.style.display = 'block';
  const pageContent = renderChallengePage(challenge);
  console.log('Generated page content:', pageContent);
  challengePage.innerHTML = pageContent;
  
  // Bind tab navigation
  $$('#challenge-page .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      state.currentTab = tab;
      updateActiveTab();
      renderTabContent();
    });
  });
  
  // Bind back button
  const backBtn = $('#back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      showMainPage();
    });
  }
  
  updateActiveTab();
  renderTabContent();
}

function showMainPage() {
  // Update URL
  history.pushState({}, '', window.location.pathname);
  
  // Show main content and hide challenge page
  $('#app').style.display = 'block';
  $('.toolbar').style.display = 'flex';
  
  const challengePage = $('#challenge-page');
  if (challengePage) {
    challengePage.style.display = 'none';
  }
  
  // Reset page title
  document.title = 'Mendix CTF — Challenges';
  
  state.currentChallenge = null;
  state.currentTab = 'details';
}

function renderChallengePage(challenge) {
  const title = escapeHtml(challenge.name || 'Untitled');
  const category = escapeHtml(challenge.category || 'Uncategorized');
  const points = escapeHtml((challenge.value || 0).toString());
  const attribution = escapeHtml(challenge.attribution || '');
  
  return `
    <div class="challenge-header">
      <button id="back-btn" class="btn secondary">← Back to Challenges</button>
      <div class="challenge-meta">
        <h1 class="challenge-title">${title}</h1>
        <div class="challenge-badges">
          <span class="badge category-badge">${category}</span>
          <span class="badge points-badge">${points} pts</span>
          ${attribution ? `<span class="badge difficulty-badge">${attribution}</span>` : ''}
        </div>
      </div>
    </div>
    
    <div class="challenge-tabs">
      <button class="tab-btn" data-tab="details">Details</button>
      <button class="tab-btn" data-tab="hints">Hints</button>
      <button class="tab-btn" data-tab="writeup">Write-up</button>
    </div>
    
    <div id="tab-content" class="tab-content">
      <!-- Content will be rendered here -->
    </div>
  `;
}

function updateActiveTab() {
  $$('#challenge-page .tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === state.currentTab);
  });
}

function renderTabContent() {
  const challenge = state.currentChallenge;
  if (!challenge) {
    console.warn('No current challenge found');
    return;
  }
  
  const tabContent = $('#tab-content');
  if (!tabContent) {
    console.warn('Tab content element not found');
    return;
  }
  
  console.log('Rendering tab:', state.currentTab, 'for challenge:', challenge.name);
  
  switch (state.currentTab) {
    case 'details':
      tabContent.innerHTML = renderDetailsTab(challenge);
      break;
    case 'hints':
      tabContent.innerHTML = renderHintsTab(challenge);
      break;
    case 'writeup':
      tabContent.innerHTML = renderWriteupTab(challenge);
      break;
    default:
      console.warn('Unknown tab:', state.currentTab);
      tabContent.innerHTML = renderDetailsTab(challenge);
  }
}

function renderDetailsTab(challenge) {
  const files = (challenge.files||[]).map(f=>`<li><a href="${escapeAttr(f)}" target="_blank" rel="noopener">${escapeHtml(fileName(f))}</a></li>`).join('');
  const next = challenge.next_id ? `<div class="muted">Next challenge id: <span class="kbd">${escapeHtml(challenge.next_id)}</span></div>` : '';
  
  return `
    <div class="tab-section">
      <h3>Description</h3>
      <div class="description-content">
        ${processMarkdown(challenge.description || 'No description available.')}
      </div>
    </div>
    
    ${files ? `<div class="tab-section">
      <h3>Files</h3>
      <ul class="file-list">${files}</ul>
    </div>` : ''}
    
    ${challenge.connection_info ? `<div class="tab-section">
      <h3>Connection</h3>
      <div class="connection-info">
        <a href="${escapeAttr(challenge.connection_info)}" target="_blank" rel="noopener" class="btn primary">Open Application</a>
        <code class="connection-url">${escapeHtml(challenge.connection_info)}</code>
      </div>
    </div>` : ''}
    
    ${next ? `<div class="tab-section">${next}</div>` : ''}
  `;
}

function renderHintsTab(challenge) {
  const hints = challenge.hints || [];
  
  if (hints.length === 0) {
    return `
      <div class="tab-section">
        <div class="empty-state">
          <h3>No hints available</h3>
          <p>This challenge doesn't have any hints. Good luck!</p>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="tab-section">
      <h3>Hints</h3>
      <div class="hints-list">
        ${hints.map((hint, index) => `
          <div class="hint-item">
            <div class="hint-header">
              <span class="hint-number">Hint ${index + 1}</span>
            </div>
            <div class="hint-content">
              ${escapeHtml(hint)}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderWriteupTab(challenge) {
  return `
    <div class="tab-section">
      <div class="writeup-placeholder">
        <h3>Write-up</h3>
        <p>Community write-ups for this challenge will appear here after the CTF concludes.</p>
        <div class="contribute-section">
          <h4>Want to contribute?</h4>
          <p>Share your solution and help others learn! Create a pull request with your write-up.</p>
          <a href="https://github.com/jopterhorst/mendixctf25" target="_blank" rel="noopener" class="btn secondary">
            Contribute on GitHub
          </a>
        </div>
      </div>
    </div>
  `;
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
  
  // Handle initial route
  handleRoute();
}

function bindUI(){
  $('#q').addEventListener('input', e=>{ state.query = e.target.value; update(); });
  $('#cat').addEventListener('change', e=>{ state.category = e.target.value; update(); });
  $('#reset').addEventListener('click', ()=>{ state.query=''; state.category=''; update(); hydrateFromState(); $('#q').value=''; $('#cat').value=''; });

  // Handle browser back/forward buttons
  window.addEventListener('popstate', (e) => {
    handleRoute();
  });

  // shortcuts
  window.addEventListener('keydown', (e)=>{ 
    if(e.key === '/'){ 
      e.preventDefault(); 
      if ($('#q').style.display !== 'none') {
        $('#q').focus(); 
      }
    }
    if(e.key === 'Escape' && state.currentChallenge){ 
      showMainPage(); 
    }
  });
}

function handleRoute() {
  const hash = window.location.hash;
  
  if (hash.startsWith('#challenge/')) {
    const parts = hash.split('/');
    const challengeId = parts[1];
    
    if (challengeId && state.raw.length > 0) {
      const challenge = state.raw.find(c => c.id.toString() === challengeId);
      if (challenge) {
        showChallengePage(challenge);
        return;
      }
    }
  }
  
  // Default: show main page
  if (state.currentChallenge) {
    showMainPage();
  }
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