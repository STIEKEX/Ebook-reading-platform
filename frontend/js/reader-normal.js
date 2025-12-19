/* Normal Reader: single-page, distraction-free reading experience */
(function(){
  const qs = (s, p=document) => p.querySelector(s);
  const qsa = (s, p=document) => [...p.querySelectorAll(s)];

  class NormalReader {
    constructor(){
      // State
      this.book = null; // { id, title, author, coverImage }
      this.chapters = []; // [{id,title,html}]
      this.currentChapterIndex = 0;
      this.selection = null;
      this.settings = this.loadSettings();
      this.progressHideTimer = null;
      this.searchResults = [];
      this.searchIndex = 0;

      // Elements
      this.wrapper = qs('#readerContentWrapper');
      this.page = qs('#readerPage');
      this.chapterTitle = qs('#chapterTitle');
      this.chapterBody = qs('#chapterBody');
      this.fab = qs('#readerFab');
      this.panel = qs('#readerPanel');
      this.panelTabs = qsa('.reader-panel__tab');
      this.panelBody = qs('#panelBody');
      this.progress = qs('#readerProgress');
  this.progressBar = qs('#readerProgressBar');
  this.progressLabel = qs('#readerProgressLabel');
      this.tocList = qs('#tocList');
      this.searchInput = qs('#searchInput');
      this.searchResultsEl = qs('#searchResults');
      this.bookmarkList = qs('#bookmarkList');
      this.favoritesList = qs('#favoritesList');
      this.selectionToolbar = qs('#selectionToolbar');
      this.dictPopup = qs('#dictPopup');

      // Settings controls
      this.themeSelect = qs('#themeSelect');
      this.fontSelect = qs('#fontSelect');
      this.fontSizeRange = qs('#fontSizeRange');
      this.lineHeightRange = qs('#lineHeightRange');
      this.marginRange = qs('#marginRange');
      this.justifySelect = qs('#justifySelect');
      this.scrollModeSelect = qs('#scrollModeSelect');
      this.focusModeToggle = qs('#focusModeToggle');

      this.init();
    }

    /* Initialization */
    async init(){
      this.applySettingsToDom();
      this.initEvents();

      let bookData = this.getBookFromContext();
      if (!bookData) {
        // Fallback to sample so the reader never gets stuck on loading
        this.book = { id: 'sample', title: 'Sample Book', author: '—' };
        this.chapters = [ { id: 'sample', title: 'Sample', html: '<p>Lorem ipsum dolor sit amet…</p>'.repeat(30) } ];
        this.buildTOC();
        this.renderChapter(0, { animate: false });
        this.showProgressBarTransient();
        return;
      }

      // Fetch text chapters (stub or real)
      await this.fetchChapters(bookData.id);
      this.buildTOC();
      await this.restoreProgress();
      this.renderChapter(this.currentChapterIndex, { animate: false });
      this.showProgressBarTransient();
      this.loadFavorites();
    }

    getBookFromContext(){
      const session = sessionStorage.getItem('currentBook');
      const url = new URL(window.location.href);
      const id = url.searchParams.get('bookId');
      if (session) {
        const data = JSON.parse(session);
        this.book = data;
        return data;
      }
      if (id) {
        this.book = { id };
        return this.book;
      }
      return null;
    }

    async fetchChapters(bookId){
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${window.API_BASE_URL || '/api'}/books/${bookId}/text`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data = await res.json();
        this.book = data.book || this.book;
        this.chapters = data.chapters || [];
        if (!this.chapters.length) throw new Error('No chapters available');
      } catch (e) {
        // Fallback sample
        this.chapters = [
          { id: 'sample', title: 'Sample', html: '<p>Lorem ipsum dolor sit amet…</p>'.repeat(30) }
        ];
      }
    }

    buildTOC(){
      this.tocList.innerHTML = '';
      this.chapters.forEach((ch, idx) => {
        const li = document.createElement('li');
        li.textContent = ch.title;
        li.tabIndex = 0;
        li.addEventListener('click', () => this.goToChapter(idx));
        li.addEventListener('keypress', (e)=>{ if(e.key==='Enter') this.goToChapter(idx); });
        this.tocList.appendChild(li);
      });
    }

    renderChapter(index, { animate = true } = {}){
      index = Math.max(0, Math.min(this.chapters.length-1, index));
      const ch = this.chapters[index];
      this.currentChapterIndex = index;
      this.chapterTitle.textContent = ch.title;
      // fade transition
      if (animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
        this.page.style.opacity = 0;
        requestAnimationFrame(()=>{
          this.chapterBody.innerHTML = ch.html;
          this.page.style.opacity = 0;
          setTimeout(()=>{ this.page.style.transition = 'opacity 220ms ease'; this.page.style.opacity = 1; }, 20);
          setTimeout(()=>{ this.page.style.transition = ''; }, 280);
        });
      } else {
        this.chapterBody.innerHTML = ch.html;
      }
      this.wrapper.scrollTop = 0;
      this.updateProgress();
    }

    goToChapter(index){
      this.renderChapter(index);
      this.saveProgress();
      this.closePanel();
    }

    /* Settings */
    loadSettings(){
      try { return JSON.parse(localStorage.getItem('normalReader:settings')) || {}; } catch { return {}; }
    }
    saveSettings(){ localStorage.setItem('normalReader:settings', JSON.stringify(this.settings)); }

    applySettingsToDom(){
      const html = document.documentElement;
      html.classList.remove('reader--day','reader--dark','reader--sepia','reader--cream','reader--warm');
      html.classList.add(`reader--${this.settings.theme || 'day'}`);
      // page styles
      this.page?.style.setProperty('--font', this.settings.font || 'Georgia');
      this.page?.style.setProperty('--fontSize', (this.settings.fontSize || 18) + 'px');
      this.page?.style.setProperty('--lineHeight', String(this.settings.lineHeight || 1.75));
      this.page?.style.setProperty('--justify', this.settings.justify || 'left');
  this.page?.style.setProperty('--paraGap', '1.1em');
  if (this.page) this.page.style.padding = `${this.settings.margin || 64}px`;

      if (this.settings.scrollMode === 'horizontal') {
        document.body.classList.add('scroll-horizontal');
      } else {
        document.body.classList.remove('scroll-horizontal');
      }

      // Dyslexic font (fallback if not loaded)
      if (this.settings.font === 'OpenDyslexic' && !document.getElementById('odyslexic')){
        const link = document.createElement('link');
        link.id = 'odyslexic';
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/open-dyslexic.css';
        document.head.appendChild(link);
      }

      // sync controls (if present)
      if (this.themeSelect) this.themeSelect.value = this.settings.theme || 'day';
      if (this.fontSelect) this.fontSelect.value = this.settings.font || 'Georgia';
      if (this.fontSizeRange) this.fontSizeRange.value = this.settings.fontSize || 18;
      if (this.lineHeightRange) this.lineHeightRange.value = this.settings.lineHeight || 1.75;
      if (this.marginRange) this.marginRange.value = this.settings.margin || 64;
      if (this.justifySelect) this.justifySelect.value = this.settings.justify || 'left';
      if (this.scrollModeSelect) this.scrollModeSelect.value = this.settings.scrollMode || 'vertical';
      if (this.focusModeToggle) this.focusModeToggle.checked = !!this.settings.focusMode;

      // Focus mode hides FAB and progress until interaction
      const f = !!this.settings.focusMode;
      this.fab?.classList.toggle('focus-hidden', f);
    }

    initEvents(){
      // Interaction shows progress briefly
      const interact = () => this.showProgressBarTransient();
      ['scroll','click','keydown','mousemove','touchstart'].forEach(ev => {
        this.wrapper.addEventListener(ev, interact, { passive: true });
        window.addEventListener(ev, interact, { passive: true });
      });

      // FAB toggle panel
      this.fab.addEventListener('click', ()=>{
        this.panel.classList.toggle('open');
        this.panel.setAttribute('aria-hidden', this.panel.classList.contains('open') ? 'false' : 'true');
      });

      // Tabs
      this.panelTabs.forEach(btn=>{
        btn.addEventListener('click', ()=>{
          this.panelTabs.forEach(b=>b.classList.remove('active'));
          btn.classList.add('active');
          const tab = btn.dataset.tab;
          qsa('[data-panel]', this.panelBody).forEach(sec=>{
            sec.hidden = sec.getAttribute('data-panel') !== tab;
          });
        });
      });

      // Settings controls
      this.themeSelect.addEventListener('change', (e)=>{ this.settings.theme = e.target.value; this.saveSettings(); this.applySettingsToDom(); });
      this.fontSelect.addEventListener('change', (e)=>{ this.settings.font = e.target.value; this.saveSettings(); this.applySettingsToDom(); });
      this.fontSizeRange.addEventListener('input', (e)=>{ this.settings.fontSize = Number(e.target.value); this.saveSettings(); this.applySettingsToDom(); });
      this.lineHeightRange.addEventListener('input', (e)=>{ this.settings.lineHeight = Number(e.target.value); this.saveSettings(); this.applySettingsToDom(); });
      this.marginRange.addEventListener('input', (e)=>{ this.settings.margin = Number(e.target.value); this.saveSettings(); this.applySettingsToDom(); });
      this.justifySelect.addEventListener('change', (e)=>{ this.settings.justify = e.target.value; this.saveSettings(); this.applySettingsToDom(); });
      this.scrollModeSelect.addEventListener('change', (e)=>{ this.settings.scrollMode = e.target.value; this.saveSettings(); this.applySettingsToDom(); });
      this.focusModeToggle.addEventListener('change', (e)=>{ this.settings.focusMode = e.target.checked; this.saveSettings(); this.applySettingsToDom(); });

      // Keyboard navigation (chapter prev/next)
      window.addEventListener('keydown', (e)=>{
        if (e.key === 'ArrowLeft') this.prevChapter();
        if (e.key === 'ArrowRight') this.nextChapter();
        if (e.key === 'f' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); this.openSearch(); }
      });

      // Selection handling
      this.chapterBody.addEventListener('mouseup', (e)=> this.handleSelection(e));
      this.chapterBody.addEventListener('touchend', (e)=> this.handleSelection(e));

      // Toolbar actions
      this.selectionToolbar.addEventListener('click', (e)=>{
        const action = e.target.closest('button')?.dataset.action;
        if (!action) return;
        if (action === 'highlight') this.applyHighlight();
        if (action === 'favorite') this.saveFavouriteLine();
        if (action === 'define') this.lookupDefinition();
        if (action === 'note') this.addNoteToSelection();
      });

      // Search
      this.searchInput?.addEventListener('input', ()=> this.searchInBook(this.searchInput.value));

      // Scroll progress save (debounced)
      let t; this.wrapper.addEventListener('scroll', ()=>{
        this.updateProgress();
        clearTimeout(t); t = setTimeout(()=> this.saveProgress(), 350);
      }, { passive: true });

      // Click outside panel closes it
      document.addEventListener('click', (e)=>{
        if (this.panel.classList.contains('open')){
          if (!this.panel.contains(e.target) && !this.fab.contains(e.target)) this.closePanel();
        }
      });
    }

    closePanel(){ this.panel.classList.remove('open'); this.panel.setAttribute('aria-hidden','true'); }

    openSearch(){ this.panel.classList.add('open'); this.panel.setAttribute('aria-hidden','false'); this.panelTabs.forEach(b=>b.classList.remove('active')); this.panelTabs[1].classList.add('active'); qsa('[data-panel]', this.panelBody).forEach((sec,i)=>sec.hidden = i!==1); this.searchInput.focus(); }

    /* Progress */
    updateProgress(){
      const scrolled = this.wrapper.scrollTop;
      const total = this.wrapper.scrollHeight - this.wrapper.clientHeight;
      const pct = total > 0 ? Math.min(100, Math.max(0, (scrolled/total)*100)) : 0;
      this.progressBar.style.width = pct.toFixed(2) + '%';
      this._progressPct = pct;
      this.updateEstimatedTime();
    }

    updateEstimatedTime(){
      // Estimate time left in chapter based on 220 WPM
      try {
        const text = this.chapterBody.innerText || '';
        const words = text.trim().split(/\s+/).length;
        const totalMins = Math.ceil(words / 220);
        const leftMins = Math.max(0, Math.round(totalMins * (100 - (this._progressPct||0)) / 100));
        if (this.progressLabel) this.progressLabel.textContent = leftMins ? `${leftMins} min left in chapter` : 'End of chapter';
      } catch { if (this.progressLabel) this.progressLabel.textContent = ''; }
    }

    showProgressBarTransient(){
      this.progress.classList.add('active');
      clearTimeout(this.progressHideTimer);
      this.progressHideTimer = setTimeout(()=> this.progress.classList.remove('active'), 1500);
    }

    async saveProgress(){
      try {
        const token = localStorage.getItem('token');
        if (!token || !this.book?.id) return;
        await fetch(`${window.API_BASE_URL || '/api'}/books/progress`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ bookId: this.book.id, lastReadChapter: this.chapters[this.currentChapterIndex]?.id, lastReadOffset: this.wrapper.scrollTop, progressPercent: this._progressPct })
        });
        // local fallback
        localStorage.setItem(`normalReader:progress:${this.book.id}`, JSON.stringify({ idx: this.currentChapterIndex, offset: this.wrapper.scrollTop }));
      } catch {}
    }

    async restoreProgress(){
      const token = localStorage.getItem('token');
      try {
        if (token && this.book?.id){
          const res = await fetch(`${window.API_BASE_URL || '/api'}/books/progress/${this.book.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
          if (res.ok){
            const h = await res.json();
            if (h?.lastReadChapter){
              const idx = this.chapters.findIndex(c=>c.id===h.lastReadChapter);
              if (idx>=0) this.currentChapterIndex = idx;
            }
            setTimeout(()=>{ this.wrapper.scrollTop = h?.lastReadOffset || 0; }, 50);
            return;
          }
        }
      } catch {}
      // local fallback
      try {
        const local = JSON.parse(localStorage.getItem(`normalReader:progress:${this.book.id}`));
        if (local){ this.currentChapterIndex = local.idx||0; setTimeout(()=> this.wrapper.scrollTop = local.offset||0, 50); }
      } catch {}
    }

    /* Selection + Highlight + Favourite */
    getSelectionRange(){
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return null;
      if (!this.page.contains(sel.anchorNode)) return null;
      return sel.getRangeAt(0);
    }

    handleSelection(e){
      const range = this.getSelectionRange();
      if (!range) { this.selectionToolbar.style.display = 'none'; return; }
      this.selection = range;
      const rect = range.getBoundingClientRect();
      const wrapperRect = this.wrapper.getBoundingClientRect();
      this.selectionToolbar.style.left = (rect.left + rect.width/2) + 'px';
      this.selectionToolbar.style.top = (rect.top - 8 + window.scrollY) + 'px';
      this.selectionToolbar.style.display = 'flex';
      this.selectionToolbar.setAttribute('aria-hidden','false');
    }

    wrapRange(range, tagName='span', attrs={}){
      const el = document.createElement(tagName);
      Object.entries(attrs).forEach(([k,v])=> el.setAttribute(k, v));
      range.surroundContents(el);
      return el;
    }

    applyHighlight(color='yellow'){
      const range = this.selection; if (!range) return;
      try {
        const span = this.wrapRange(range, 'span', { class: 'highlight', 'data-color': color });
        this.saveHighlightLocally(span.innerText, color);
      } catch { /* If range invalid (spans across elements), fallback */ }
      window.getSelection().removeAllRanges();
      this.selectionToolbar.style.display = 'none';
    }

    async saveFavouriteLine(){
      const range = this.selection; if (!range) return;
      const text = String(range.toString()).trim();
      if (!text) return;
      // Persist to backend
      const token = localStorage.getItem('token');
      if (token && this.book?.id){
        try {
          await fetch(`${window.API_BASE_URL || '/api'}/favorites/lines`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ bookId: this.book.id, text, chapter: this.chapters[this.currentChapterIndex]?.id })
          });
        } catch {}
      }
      this.addFavouriteLocally({ text, chapter: this.chapters[this.currentChapterIndex]?.id });
      window.getSelection().removeAllRanges();
      this.selectionToolbar.style.display = 'none';
      this.loadFavorites();
    }

    saveHighlightLocally(text, color){
      try {
        const k = `normalReader:highlights:${this.book.id}`;
        const arr = JSON.parse(localStorage.getItem(k)) || [];
        arr.push({ text, color, chapter: this.chapters[this.currentChapterIndex]?.id, t: Date.now() });
        localStorage.setItem(k, JSON.stringify(arr));
      } catch {}
    }

    addFavouriteLocally(item){
      try {
        const k = `normalReader:favorites:${this.book.id}`;
        const arr = JSON.parse(localStorage.getItem(k)) || [];
        arr.unshift({ ...item, t: Date.now() });
        localStorage.setItem(k, JSON.stringify(arr));
      } catch {}
    }

    async loadFavorites(){
      this.favoritesList.innerHTML = '';
      const frag = document.createDocumentFragment();

      // Backend
      const token = localStorage.getItem('token');
      let backendList = [];
      if (token && this.book?.id){
        try {
          const res = await fetch(`${window.API_BASE_URL || '/api'}/favorites/lines?bookId=${this.book.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
          if (res.ok) backendList = await res.json();
        } catch {}
      }

      // Local
      let localList = [];
      try { localList = JSON.parse(localStorage.getItem(`normalReader:favorites:${this.book.id}`)) || []; } catch {}

      const list = [...backendList.map(x=>({ id: x._id, text: x.text, chapter: x.chapter, backend: true })), ...localList.map(x=>({ text: x.text, chapter: x.chapter }))];

      if (!list.length){
        const p = document.createElement('p'); p.textContent = 'No favourite lines yet.'; p.style.color = '#888'; this.favoritesList.appendChild(p); return;
      }

      list.forEach(item => {
        const div = document.createElement('div');
        div.className = 'favorite-item';
        div.style.padding = '10px';
        div.style.borderBottom = '1px solid rgba(0,0,0,0.06)';
        div.innerHTML = `<div style="font-size:14px;">${item.text}</div><div style="font-size:12px;color:#888;margin-top:4px;">${item.chapter || ''}</div>`;
        frag.appendChild(div);
      });
      this.favoritesList.appendChild(frag);
    }

    /* Dictionary */
    async lookupDefinition(){
      const text = String(window.getSelection()?.toString()||'').trim().split(/\s+/)[0];
      if (!text) return;
      const rect = this.selection?.getBoundingClientRect();
      if (rect){
        this.dictPopup.style.display = 'block';
        this.dictPopup.style.left = rect.left + 'px';
        this.dictPopup.style.top = rect.bottom + 8 + 'px';
        this.dictPopup.innerHTML = `<h4>${text}</h4><p>Definition lookup placeholder. Connect a dictionary API (e.g., Free Dictionary) for real definitions.</p>`;
        setTimeout(()=>{
          document.addEventListener('click', this._dictCloser = (e)=>{ if(!this.dictPopup.contains(e.target)) { this.dictPopup.style.display='none'; document.removeEventListener('click', this._dictCloser);} });
        }, 0);
      }
    }

    addNoteToSelection(){
      const txt = String(window.getSelection()?.toString()||'').trim(); if (!txt) return;
      const note = prompt('Add a note for this selection:');
      if (!note) return;
      try {
        const k = `normalReader:notes:${this.book.id}`;
        const arr = JSON.parse(localStorage.getItem(k)) || [];
        arr.unshift({ text: txt, note, chapter: this.chapters[this.currentChapterIndex]?.id, t: Date.now() });
        localStorage.setItem(k, JSON.stringify(arr));
        alert('Note saved');
      } catch {}
    }

    /* Search */
    searchInBook(query){
      this.searchResultsEl.innerHTML = '';
      if (!query?.trim()) return;
      const res = [];
      this.chapters.forEach((ch, idx)=>{
        const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig');
        const text = ch.html.replace(/<[^>]*>/g,' ');
        let m; let count = 0;
        while((m = regex.exec(text)) && count < 20){
          const start = Math.max(0, m.index - 40);
          const end = Math.min(text.length, m.index + query.length + 40);
          const preview = text.slice(start, end).replace(regex, (s)=>`<mark>${s}</mark>`);
          res.push({ idx, preview });
          count++;
        }
      });
      if (!res.length){ this.searchResultsEl.innerHTML = '<p style="color:#888;">No results</p>'; return; }
      const frag = document.createDocumentFragment();
      res.forEach(r => {
        const div = document.createElement('div'); div.className = 'search-result';
        div.innerHTML = r.preview;
        div.addEventListener('click', ()=>{ this.goToChapter(r.idx); this.closePanel(); this.showProgressBarTransient(); });
        frag.appendChild(div);
      });
      this.searchResultsEl.appendChild(frag);
    }

    /* Chapter navigation */
    nextChapter(){ if (this.currentChapterIndex < this.chapters.length-1){ this.goToChapter(this.currentChapterIndex+1); } }
    prevChapter(){ if (this.currentChapterIndex > 0){ this.goToChapter(this.currentChapterIndex-1); } }
  }

  window.addEventListener('DOMContentLoaded', ()=> new NormalReader());
})();
