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
  
  // Sort each section by points ascending (lowest to highest = easiest to hardest)
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

  // wire card clicks
  $$('.challenge-card').forEach(card => {
    card.addEventListener('click', () => {
      const challengeId = card.dataset.challengeId;
      const challenge = state.raw.find(c => c.id.toString() === challengeId);
      if (challenge) {
        showChallengePage(challenge);
      }
    });
    
    // Add hover cursor
    card.style.cursor = 'pointer';
  });
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
  
  // Check if challenge has write-ups
  const hasWriteups = it.writeups && it.writeups.length > 0;
  const writeupIndicator = hasWriteups ? `<span class="writeup-indicator" title="Write-up available">📝</span>` : '';
  
  // Check if challenge has hints
  const hasHints = it.hints && it.hints.length > 0;
  const hintIndicator = hasHints ? `<span class="hint-indicator" title="Hints available">💡</span>` : '';

  return `
  <article class="card challenge-card" role="listitem" aria-label="${title}" data-challenge-id="${escapeAttr(id)}">
    <div class="card-head">
      <div class="card-indicators">
        ${writeupIndicator}
        ${hintIndicator}
      </div>
      <span class="pts">${pts} pts</span>
    </div>
    <h3 class="card-title">${title}</h3>
    <p class="card-desc">${desc}</p>
    <div class="chips">${tags}</div>
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
  const header = $('header');
  
  console.log('Elements found - app:', !!app, 'toolbar:', !!toolbar, 'header:', !!header);
  
  if (app) {
    app.style.display = 'none';
    console.log('Hidden app');
  }
  if (toolbar) {
    toolbar.style.display = 'none';
    console.log('Hidden toolbar');
  }
  if (header) {
    header.style.display = 'none';
    console.log('Hidden header');
  }
  
  // Update page title
  document.title = `${challenge.name} - Mendix CTF 2025`;
  
  // Show challenge page
  let challengePage = $('#challenge-page');
  if (!challengePage) {
    challengePage = document.createElement('div');
    challengePage.id = 'challenge-page';
    challengePage.className = 'container';
    // Insert after the header instead of inside main
    const header = document.querySelector('header');
    if (header && header.nextSibling) {
      header.parentNode.insertBefore(challengePage, header.nextSibling);
    } else if (header) {
      header.parentNode.appendChild(challengePage);
    } else {
      document.body.appendChild(challengePage);
    }
    console.log('Created and inserted challenge page element');
  }
  
  challengePage.style.display = 'block';
  const pageContent = renderChallengePage(challenge);
  console.log('Generated page content length:', pageContent.length);
  console.log('First 200 chars:', pageContent.substring(0, 200));
  challengePage.innerHTML = pageContent;
  console.log('Challenge page innerHTML set');
  
  // Bind tab navigation
  const tabBtns = $$('#challenge-page .tab-btn');
  console.log('Found tab buttons:', tabBtns.length);
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      console.log('Tab clicked:', tab);
      state.currentTab = tab;
      updateActiveTab();
      renderTabContent();
    });
  });
  
  // Bind back button
  const backBtn = $('#back-btn');
  console.log('Found back button:', !!backBtn);
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      console.log('Back button clicked');
      showMainPage();
    });
  }
  
  console.log('About to call updateActiveTab and renderTabContent');
  updateActiveTab();
  renderTabContent();
  console.log('Challenge page setup complete');
}

function showMainPage() {
  // Update URL
  history.pushState({}, '', window.location.pathname);
  
  // Show main content and hide challenge page
  const app = $('#app');
  const toolbar = $('.toolbar');
  const header = $('header');
  
  if (app) app.style.display = 'block';
  if (toolbar) toolbar.style.display = 'flex';
  if (header) header.style.display = 'block';
  
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
  console.log('=== RENDER TAB CONTENT START ===');
  const challenge = state.currentChallenge;
  if (!challenge) {
    console.warn('No current challenge found');
    return;
  }
  
  const tabContent = $('#tab-content');
  console.log('Tab content element found:', !!tabContent);
  if (!tabContent) {
    console.warn('Tab content element not found');
    return;
  }
  
  console.log('Rendering tab:', state.currentTab, 'for challenge:', challenge.name);
  
  let content = '';
  switch (state.currentTab) {
    case 'details':
      content = renderDetailsTab(challenge);
      console.log('Details content generated, length:', content.length);
      tabContent.innerHTML = content;
      break;
    case 'hints':
      content = renderHintsTab(challenge);
      console.log('Hints content generated, length:', content.length);
      tabContent.innerHTML = content;
      break;
    case 'writeup':
      content = renderWriteupTab(challenge);
      console.log('Writeup content generated, length:', content.length);
      tabContent.innerHTML = content;
      break;
    default:
      console.warn('Unknown tab:', state.currentTab);
      content = renderDetailsTab(challenge);
      tabContent.innerHTML = content;
  }
  console.log('=== RENDER TAB CONTENT END ===');
  
  // Bind hint spoilers after content is rendered
  if (state.currentTab === 'hints') {
    setTimeout(bindHintSpoilers, 50); // Small delay to ensure DOM is updated
  }
}

function bindHintSpoilers() {
  const spoilers = $$('.hint-content.spoiler');
  
  spoilers.forEach(spoiler => {
    spoiler.addEventListener('click', () => {
      if (spoiler.classList.contains('revealed') || spoiler.classList.contains('revealing')) {
        return; // Prevent multiple clicks during animation
      }
      
      const overlay = spoiler.querySelector('.spoiler-overlay');
      const timer = spoiler.querySelector('.spoiler-timer');
      const timerBar = spoiler.querySelector('.timer-bar');
      const statusElement = spoiler.closest('.hint-item').querySelector('.hint-status');
      
      // Start reveal animation
      spoiler.classList.add('revealing');
      overlay.style.opacity = '0';
      
      // Show timer
      setTimeout(() => {
        overlay.style.display = 'none';
        timer.style.display = 'block';
        spoiler.classList.add('revealed');
        spoiler.classList.remove('revealing');
        
        if (statusElement) {
          statusElement.textContent = 'Revealed';
          statusElement.style.color = 'var(--success)';
        }
        
        // Start countdown animation
        timerBar.style.animation = 'countdown 5s linear forwards';
        
        // Hide after 5 seconds
        setTimeout(() => {
          spoiler.classList.add('hiding');
          
          setTimeout(() => {
            // Reset to hidden state
            spoiler.classList.remove('revealed', 'hiding');
            overlay.style.display = 'flex';
            overlay.style.opacity = '1';
            timer.style.display = 'none';
            timerBar.style.animation = 'none';
            
            if (statusElement) {
              statusElement.textContent = 'Click to reveal';
              statusElement.style.color = '';
            }
          }, 300);
        }, 5000);
      }, 300);
    });
  });
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
  
  // Process hints to handle both string and object formats, then sort by order
  const processedHints = hints.map((hint, index) => {
    if (typeof hint === 'string') {
      // Legacy format - string only
      return {
        order: index + 1,
        text: hint
      };
    } else {
      // New format - object with order and text
      return {
        order: hint.order || index + 1,
        text: hint.text || hint
      };
    }
  }).sort((a, b) => a.order - b.order);
  
  return `
    <div class="tab-section">
      <h3>Hints</h3>
      <div class="hints-notice">
        <p>💡 Click on a hint to reveal it temporarily</p>
      </div>
      <div class="hints-list">
        ${processedHints.map((hint, index) => `
          <div class="hint-item">
            <div class="hint-header">
              <span class="hint-number">Hint ${hint.order}</span>
              <span class="hint-status">Click to reveal</span>
            </div>
            <div class="hint-content spoiler" data-hint-index="${index}" data-hint-order="${hint.order}">
              <div class="spoiler-overlay">
                <span class="spoiler-text">Click to reveal hint</span>
                <div class="spoiler-timer" style="display: none;">
                  <div class="timer-bar"></div>
                </div>
              </div>
              <div class="hint-text">${escapeHtml(hint.text)}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderWriteupTab(challenge) {
  const writeups = challenge.writeups || [];
  
  if (writeups.length === 0) {
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
  
  return `
    <div class="tab-section">
      <h3>Community Write-ups</h3>
      <p class="writeups-intro">The following write-ups have been contributed by the community:</p>
      
      <div class="writeups-list">
        ${writeups.map(writeup => `
          <div class="writeup-item">
            <div class="writeup-header">
              <h4 class="writeup-title">
                <a href="${escapeAttr(writeup.url)}" target="_blank" rel="noopener">
                  ${escapeHtml(writeup.title)}
                </a>
              </h4>
              <div class="writeup-meta">
                <span class="writeup-author">by ${escapeHtml(writeup.author)}</span>
                ${writeup.platform ? `<span class="writeup-platform">${escapeHtml(writeup.platform)}</span>` : ''}
              </div>
            </div>
            <div class="writeup-actions">
              <a href="${escapeAttr(writeup.url)}" target="_blank" rel="noopener" class="btn primary">
                Read Write-up
              </a>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="contribute-section">
        <h4>Want to add your write-up?</h4>
        <p>Share your solution and help others learn! Create a pull request to add your write-up to this challenge.</p>
        <a href="https://github.com/jopterhorst/mendixctf25" target="_blank" rel="noopener" class="btn secondary">
          Contribute on GitHub
        </a>
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