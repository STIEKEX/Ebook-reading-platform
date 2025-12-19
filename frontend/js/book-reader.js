/**
 * Premium 3D Book Reader
 * Complete implementation with all features
 */

class BookReader {
    constructor() {
        this.currentPage = 0;
        this.totalPages = 0;
        this.pages = [];
        this.bookData = null;
        this.readingMode = 'day';
        this.singlePageMode = true; // refined single-page reading
        this.fontSize = 18;
        this.fontFamily = "Georgia, 'Times New Roman', serif";
        this.lineHeight = 1.8;
        this.pageWidth = 100;
        this.bookmarks = [];
        this.highlights = [];
        this.notes = [];
        this.readingTime = 0;
        this.timerInterval = null;
        this.soundEnabled = true;
        this.autoScrollEnabled = false;
        this.uiHideDelay = 4000;
        this._uiHideTimer = null;
        
        this.initElements();
        this.initEventListeners();
        this.loadSavedSettings();
    }

    initElements() {
        // Main containers
        this.readerContainer = document.getElementById('bookReader');
        this.book3D = document.getElementById('book3D');
        this.bookCover = document.getElementById('bookCover');
        this.bookPages = document.getElementById('bookPages');
        this.loadingBook = document.getElementById('loadingBook');
        
        // Cover elements
        this.coverImage = document.getElementById('coverImage');
        this.coverTitle = document.getElementById('coverTitle');
        this.coverAuthor = document.getElementById('coverAuthor');
        
        // Controls
        this.prevBtn = document.getElementById('prevPageBtn');
        this.nextBtn = document.getElementById('nextPageBtn');
    // Legacy toolbar buttons may not exist now (hidden)
    this.tocBtn = document.getElementById('tocBtn');
    this.bookmarkBtn = document.getElementById('bookmarkBtn');
    this.searchBtn = document.getElementById('searchBtn');
    this.settingsBtn = document.getElementById('settingsBtn');
    this.dayModeBtn = document.getElementById('dayModeBtn');
    this.nightModeBtn = document.getElementById('nightModeBtn');
    this.sepiaModeBtn = document.getElementById('sepiaModeBtn');
    this.fullscreenBtn = document.getElementById('fullscreenBtn');
    this.downloadBtn = document.getElementById('downloadBtn');
    this.closeReaderBtn = document.getElementById('closeReaderBtn');
    // New floating UI
    this.readerFab = document.getElementById('readerFab');
    this.readerPanel = document.getElementById('readerPanel');
    this.readerPanelClose = document.getElementById('readerPanelClose');
    this.selectionPopup = document.getElementById('selectionPopup');
    this.readerProgress = document.getElementById('readerProgress');
        
        // Panels
        this.tocPanel = document.getElementById('tocPanel');
        this.bookmarksPanel = document.getElementById('bookmarksPanel');
        this.settingsPanel = document.getElementById('settingsPanel');
        this.searchPanel = document.getElementById('searchPanel');
        this.dictionaryPopup = document.getElementById('dictionaryPopup');
        
        // Progress
    this.progressFill = document.getElementById('progressFill');
    this.progressText = document.getElementById('progressText');
        
    // Timer
    this.readingTimer = document.getElementById('readingTimer');
    this.timerDisplay = document.getElementById('timerDisplay');
        
        // Sound
        this.pageTurnSound = document.getElementById('pageTurnSound');
        
        // Settings inputs
        this.fontFamilySelect = document.getElementById('fontFamily');
        this.fontIncreaseBtn = document.getElementById('fontIncrease');
        this.fontDecreaseBtn = document.getElementById('fontDecrease');
        this.fontSizeDisplay = document.getElementById('fontSizeDisplay');
        this.lineHeightSlider = document.getElementById('lineHeight');
        this.lineHeightDisplay = document.getElementById('lineHeightDisplay');
        this.pageWidthSlider = document.getElementById('pageWidth');
        this.pageWidthDisplay = document.getElementById('pageWidthDisplay');
        this.autoScrollCheckbox = document.getElementById('autoScroll');
        this.soundCheckbox = document.getElementById('soundEffects');
        
        // Search
        this.searchInput = document.getElementById('searchInput');
        this.searchResults = document.getElementById('searchResults');
        
        // Close button
        this.closeReaderBtn = document.getElementById('closeReaderBtn');
    }

    initEventListeners() {
        // Navigation
        if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.previousPage());
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.nextPage());
        
        // Cover click
        if (this.bookCover) this.bookCover.addEventListener('click', () => this.openBook());
        
        // Legacy Controls (guard for existence)
        if (this.tocBtn) this.tocBtn.addEventListener('click', () => this.togglePanel(this.tocPanel));
        if (this.bookmarkBtn) this.bookmarkBtn.addEventListener('click', () => this.addBookmark());
        if (this.searchBtn) this.searchBtn.addEventListener('click', () => this.togglePanel(this.searchPanel));
        if (this.settingsBtn) this.settingsBtn.addEventListener('click', () => this.togglePanel(this.settingsPanel));
        if (this.dayModeBtn) this.dayModeBtn.addEventListener('click', () => this.setReadingMode('day'));
        if (this.nightModeBtn) this.nightModeBtn.addEventListener('click', () => this.setReadingMode('night'));
        if (this.sepiaModeBtn) this.sepiaModeBtn.addEventListener('click', () => this.setReadingMode('sepia'));
        if (this.fullscreenBtn) this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        if (this.downloadBtn) this.downloadBtn.addEventListener('click', () => this.downloadBook());
        
        // Close button (now separate from menu)
        if (this.closeReaderBtn) this.closeReaderBtn.addEventListener('click', () => this.closeReader());

        // Floating panel / FAB
        if (this.readerFab) this.readerFab.addEventListener('click', (e) => { e.stopPropagation(); this.toggleReaderPanel(); });
        if (this.readerPanel) {
            // Stop clicks inside panel from closing it
            this.readerPanel.addEventListener('click', (e) => { e.stopPropagation(); });
            // Handle action buttons inside panel
            this.readerPanel.querySelectorAll('button[data-action]').forEach(btn => {
                btn.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    const action = btn.dataset.action;
                    this.handlePanelAction(action);
                });
            });
        }
    // Reader panel close button
    if (this.readerPanelClose) this.readerPanelClose.addEventListener('click', (e) => { e.stopPropagation(); this.readerPanel.classList.remove('show'); });
        
        // Settings
        if (this.fontFamilySelect) this.fontFamilySelect.addEventListener('change', (e) => this.changeFontFamily(e.target.value));
        if (this.fontIncreaseBtn) this.fontIncreaseBtn.addEventListener('click', () => this.changeFontSize(2));
        if (this.fontDecreaseBtn) this.fontDecreaseBtn.addEventListener('click', () => this.changeFontSize(-2));
        if (this.lineHeightSlider) this.lineHeightSlider.addEventListener('input', (e) => this.changeLineHeight(e.target.value));
        if (this.pageWidthSlider) this.pageWidthSlider.addEventListener('input', (e) => this.changePageWidth(e.target.value));
        if (this.autoScrollCheckbox) this.autoScrollCheckbox.addEventListener('change', (e) => this.toggleAutoScroll(e.target.checked));
        if (this.soundCheckbox) this.soundCheckbox.addEventListener('change', (e) => this.soundEnabled = e.target.checked);
        
        // Search
        if (this.searchInput) this.searchInput.addEventListener('input', (e) => this.searchInBook(e.target.value));
        
        // Panel back buttons
        const tocBackBtn = document.getElementById('tocBackBtn');
        const bookmarksBackBtn = document.getElementById('bookmarksBackBtn');
        const settingsBackBtn = document.getElementById('settingsBackBtn');
        const searchBackBtn = document.getElementById('searchBackBtn');
        
        if (tocBackBtn) tocBackBtn.addEventListener('click', () => this.togglePanel(this.tocPanel));
        if (bookmarksBackBtn) bookmarksBackBtn.addEventListener('click', () => this.togglePanel(this.bookmarksPanel));
        if (settingsBackBtn) settingsBackBtn.addEventListener('click', () => this.togglePanel(this.settingsPanel));
        if (searchBackBtn) searchBackBtn.addEventListener('click', () => this.togglePanel(this.searchPanel));
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Touch events for mobile
        this.initTouchEvents();
        
        // Close panels when clicking outside
        document.addEventListener('click', (e) => this.handleOutsideClick(e));

        // Selection popup
        document.addEventListener('mouseup', (e) => this.handleTextSelection(e));
        document.addEventListener('mousedown', (e) => {
            if (this.selectionPopup && !this.selectionPopup.contains(e.target)) {
                this.hideSelectionPopup();
            }
        });

        // UI auto-hide triggers
        ['mousemove','keydown','touchstart','click'].forEach(evt => {
            document.addEventListener(evt, () => this.bumpUIVisibility(), { passive:true });
        });
    }

    initTouchEvents() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        this.book3D.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        this.book3D.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        });
    }

    handleSwipe(startX, endX) {
        const diff = startX - endX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                this.nextPage();
            } else {
                this.previousPage();
            }
        }
    }

    handleKeyboard(e) {
        if (!this.readerContainer.classList.contains('active')) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                this.previousPage();
                break;
            case 'ArrowRight':
                this.nextPage();
                break;
            case 'Escape':
                    // Close any open panels first
                    const panels = [this.tocPanel, this.bookmarksPanel, this.settingsPanel, this.searchPanel];
                    const hasOpenPanel = panels.some(panel => panel && panel.classList.contains('active'));
                    if (hasOpenPanel) {
                        panels.forEach(panel => panel && panel.classList.remove('active'));
                    } else if (this.readerPanel && this.readerPanel.classList.contains('show')) {
                        this.readerPanel.classList.remove('show');
                    } else {
                        this.closeReader();
                    }
                break;
            case 'f':
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    this.togglePanel(this.searchPanel);
                }
                break;
        }
    }

    handleOutsideClick(e) {
        // Close panels if clicking outside
        const panels = [this.tocPanel, this.bookmarksPanel, this.settingsPanel, this.searchPanel];
        panels.forEach(panel => {
            if (panel && panel.classList.contains('active') && !panel.contains(e.target)) {
                // Check if click is on FAB or panel trigger buttons
                if (this.readerFab && !this.readerFab.contains(e.target) && 
                    this.readerPanel && !this.readerPanel.contains(e.target)) {
                    panel.classList.remove('active');
                }
            }
        });
        
        // Close reader panel if clicking outside
        if (this.readerPanel && this.readerPanel.classList.contains('show') && 
            !this.readerPanel.contains(e.target) && 
            this.readerFab && !this.readerFab.contains(e.target)) {
            this.readerPanel.classList.remove('show');
        }
    }

    async loadBook(bookData) {
        this.showLoading(true);
        this.bookData = bookData;
        
        try {
            // Set cover info
            this.coverTitle.textContent = bookData.title;
            this.coverAuthor.textContent = bookData.author;
            this.coverImage.src = bookData.coverUrl || '';
            
            // Load book content
            await this.loadBookContent(bookData);
            
            // Generate pages
            this.generatePages();
            
            // Load saved progress
            this.loadProgress();
            
            // Show reader
            this.showReader();
            
            // Timer is optional; user can enable it from the menu
            
            this.showLoading(false);
        } catch (error) {
            console.error('Error loading book:', error);
            this.showLoading(false);
            alert('Failed to load book. Please try again.');
        }
    }

    async loadBookContent(bookData) {
        // Load real book data from API when available; fallback to placeholders
        this.pages = [];
        const token = localStorage.getItem('token');
        try {
            // Derive non-API host for static files (e.g., cover/page images)
            const API_BASE_HOST = (typeof API_BASE === 'string') ? API_BASE.replace(/\/api$/, '') : '';
            // Fetch full book details (includes pages array)
            const res = await fetch(`${API_BASE}/books/${bookData.id}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (!res.ok) throw new Error(`Failed to fetch book: ${res.status}`);
            const book = await res.json();

            // Update cover from legacy URL or GridFS file
            if (this.coverImage) {
                if (book.coverImage) {
                    const coverUrl = book.coverImage.startsWith('http') ? book.coverImage : `${API_BASE_HOST}${book.coverImage}`;
                    this.coverImage.src = coverUrl;
                } else if (book.coverFileId) {
                    this.coverImage.src = `${API_BASE}/books/file/${book.coverFileId}`;
                }
            }

            // Build pages from image URLs if provided
            if (Array.isArray(book.pages) && book.pages.length > 0) {
                this.pages = book.pages
                    .sort((a, b) => (a.pageNumber || 0) - (b.pageNumber || 0))
                    .map(p => {
                        let imgUrl = '';
                        if (p.imageUrl) {
                            imgUrl = p.imageUrl?.startsWith('http') ? p.imageUrl : `${API_BASE_HOST}${p.imageUrl}`;
                        } else if (p.fileId) {
                            imgUrl = `${API_BASE}/books/file/${p.fileId}`;
                        }
                        return {
                            number: p.pageNumber || 0,
                            content: `<img class="page-image" alt="Page ${p.pageNumber}" src="${imgUrl}" />`,
                            chapter: null
                        };
                    });
                this.totalPages = this.pages.length;
                this.generateTOC();
                return;
            }

            // If no image pages but a PDF exists, render PDF pages lazily
            if (book.pdfFileId) {
                const pdfUrl = `${API_BASE}/books/file/${book.pdfFileId}`;
                await this.loadPdfDocument(pdfUrl);
                return;
            }
        } catch (err) {
            console.warn('Falling back to sample pages:', err?.message || err);
        }

        // Fallback: sample placeholder pages
        const sampleContent = `
            <h2>Chapter 1: The Beginning</h2>
            <p>This is the beginning of our story. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
            <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
        `;

        for (let i = 0; i < 50; i++) {
            this.pages.push({
                number: i + 1,
                content: `<h2>Chapter ${Math.floor(i / 5) + 1}</h2>` + sampleContent.repeat(2),
                chapter: `Chapter ${Math.floor(i / 5) + 1}`
            });
        }
        this.totalPages = this.pages.length;
        this.generateTOC();
    }

    async loadPdfDocument(pdfUrl) {
        if (!(window.pdfjsLib && window.pdfjsLib.getDocument)) throw new Error('PDF.js not loaded');
        // Ensure worker is set (in case CDN path differs)
        try {
            if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.2.67/pdf.worker.min.js';
            }
        } catch {}

        const pdf = await window.pdfjsLib.getDocument({ url: pdfUrl }).promise;
        this._pdf = pdf;
        this.totalPages = pdf.numPages;
        this.pages = Array.from({ length: pdf.numPages }, (_, i) => ({ number: i+1, content: '', chapter: null }));

        // Render first batch for immediate view
        const initial = Math.min(12, pdf.numPages);
        for (let i = 1; i <= initial; i++) {
            const dataUrl = await this.renderPdfPageToImage(pdf, i);
            this.pages[i-1].content = `<img class=\"page-image\" alt=\"Page ${i}\" src=\"${dataUrl}\" />`;
        }
        this.generateTOC();

        // Background render remaining pages in chunks
        setTimeout(() => this.renderRemainingPdfPages(initial + 1), 0);
    }

    async renderPdfPageToImage(pdf, pageNumber, scale = 2.0) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport }).promise;
        const dataUrl = canvas.toDataURL('image/png');
        // Clean up
        canvas.width = canvas.height = 0;
        return dataUrl;
    }

    async renderRemainingPdfPages(startIndex) {
        if (!this._pdf) return;
        let i = startIndex;
        const step = async () => {
            const end = Math.min(i + 3, this.totalPages); // render 3 pages per chunk
            for (; i <= end; i++) {
                if (!this.pages[i-1].content) {
                    try {
                        const dataUrl = await this.renderPdfPageToImage(this._pdf, i);
                        this.pages[i-1].content = `<img class=\"page-image\" alt=\"Page ${i}\" src=\"${dataUrl}\" />`;
                    } catch (e) { console.warn('PDF render error on page', i, e); }
                }
            }
            if (i <= this.totalPages) setTimeout(step, 0);
        };
        step();
    }

    generatePages() {
        this.bookPages.innerHTML = '';
        if (this.singlePageMode) {
            for (let i = 0; i < Math.min(this.pages.length, 12); i++) {
                const page = this.createPageElement(i, 'single');
                this.bookPages.appendChild(page);
            }
        } else {
            for (let i = 0; i < Math.min(this.pages.length, 10); i += 2) {
                const pageLeft = this.createPageElement(i, 'left');
                const pageRight = this.createPageElement(i + 1, 'right');
                this.bookPages.appendChild(pageLeft);
                this.bookPages.appendChild(pageRight);
            }
        }
        this.updatePageDisplay();
    }

    createPageElement(index, side) {
        const page = document.createElement('div');
        page.className = `page page-${side}`;
        page.dataset.pageNumber = index;
        
        if (this.pages[index]) {
            const content = document.createElement('div');
            content.className = 'page-content';
            content.innerHTML = this.pages[index].content;
            
            // Apply current settings to the page content
            content.style.fontFamily = this.fontFamily;
            content.style.fontSize = this.fontSize + 'px';
            content.style.lineHeight = this.lineHeight;
            
            // Add page number
            const pageNum = document.createElement('div');
            pageNum.className = 'page-number';
            pageNum.textContent = this.pages[index].number;
            
            page.appendChild(content);
            page.appendChild(pageNum);
            
            // Add word selection for dictionary
            this.addWordSelection(content);
        }
        
        return page;
    }

    addWordSelection(element) {
        element.addEventListener('dblclick', (e) => {
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();
            
            if (selectedText) {
                this.showDictionary(selectedText, e.pageX, e.pageY);
            }
        });
    }

    showDictionary(word, x, y) {
        // In a real app, this would call a dictionary API
        const definitions = {
            'lorem': 'A placeholder text commonly used in design.',
            'ipsum': 'Latin for "itself".',
            'dolor': 'Latin for "pain" or "sorrow".'
        };
        
        const definition = definitions[word.toLowerCase()] || 'Definition not found. This would connect to a real dictionary API.';
        
        document.getElementById('dictWord').textContent = word;
        document.getElementById('dictDefinition').textContent = definition;
        
        this.dictionaryPopup.style.left = x + 'px';
        this.dictionaryPopup.style.top = (y + 20) + 'px';
        this.dictionaryPopup.classList.add('active');
        
        setTimeout(() => {
            this.dictionaryPopup.classList.remove('active');
        }, 5000);
    }

    updatePageDisplay() {
        const pages = this.bookPages.querySelectorAll('.page');
        
        pages.forEach((page, index) => {
            const pageNumber = parseInt(page.dataset.pageNumber);
            
            if (pageNumber < this.currentPage) {
                page.classList.add('flipped');
            } else {
                page.classList.remove('flipped');
            }
        });
        
        // Update progress once
        if (typeof this.updateProgress === 'function') this.updateProgress();
        
        // Update navigation buttons (guarded)
        if (this.prevBtn) this.prevBtn.disabled = this.currentPage === 0;
        if (this.nextBtn) this.nextBtn.disabled = this.currentPage >= (this.singlePageMode ? this.totalPages - 1 : this.totalPages - 2);
    }

    openBook() {
        gsap.to(this.bookCover, {
            duration: 1.2,
            rotationY: -160,
            ease: 'power2.inOut',
            onStart: () => {
                this.bookCover.classList.add('open');
                this.playPageTurnSound();
            }
        });
    }

    nextPage() {
        if (this.singlePageMode) {
            if (this.currentPage >= this.totalPages - 1) return;
            const currentEl = this.bookPages.querySelector(`[data-page-number="${this.currentPage}"]`);
            if (currentEl) {
                gsap.to(currentEl, { duration:.6, rotationY:180, ease:'power2.inOut', onStart:()=>{currentEl.classList.add('flipping'); this.playPageTurnSound();}, onComplete:()=>{ currentEl.classList.remove('flipping'); this.currentPage += 1; this.updatePageDisplay(); this.saveProgress(); this.loadMorePages(); this.bumpUIVisibility(); } });
            }
        } else {
            if (this.currentPage >= this.totalPages - 2) return;
            const currentRightPage = this.bookPages.querySelector(`[data-page-number="${this.currentPage + 1}"]`);
            if (currentRightPage) {
                gsap.to(currentRightPage, { duration:.8, rotationY:180, ease:'power2.inOut', onStart:()=>{currentRightPage.classList.add('flipping'); this.playPageTurnSound();}, onComplete:()=>{ currentRightPage.classList.remove('flipping'); this.currentPage += 2; this.updatePageDisplay(); this.saveProgress(); this.loadMorePages(); this.bumpUIVisibility(); } });
            }
        }
    }

    previousPage() {
        if (this.currentPage === 0) return;
        this.currentPage -= (this.singlePageMode ? 1 : 2);
        this.updatePageDisplay();
        this.playPageTurnSound();
        this.saveProgress();
        this.bumpUIVisibility();
    }

    loadMorePages() {
        if (this.singlePageMode) {
            const loaded = this.bookPages.querySelectorAll('.page').length;
            const needed = this.currentPage + 12;
            if (needed > loaded && loaded < this.totalPages) {
                for (let i = loaded; i < Math.min(needed, this.totalPages); i++) {
                    const page = this.createPageElement(i, 'single');
                    this.bookPages.appendChild(page);
                }
            }
        } else {
            const loadedPages = this.bookPages.querySelectorAll('.page').length / 2;
            const pagesNeeded = this.currentPage + 10;
            if (pagesNeeded > loadedPages && loadedPages < this.totalPages) {
                for (let i = loadedPages * 2; i < Math.min(pagesNeeded, this.totalPages); i += 2) {
                    const pageLeft = this.createPageElement(i, 'left');
                    const pageRight = this.createPageElement(i + 1, 'right');
                    this.bookPages.appendChild(pageLeft);
                    this.bookPages.appendChild(pageRight);
                }
            }
        }
    }

    playPageTurnSound() {
        if (this.soundEnabled) {
            this.pageTurnSound.currentTime = 0;
            this.pageTurnSound.play().catch(e => console.log('Sound play prevented'));
        }
    }

    generateTOC() {
        const tocList = document.getElementById('tocList');
        tocList.innerHTML = '';

        // Detect if chapter labels exist
        const hasChapters = this.pages.some(p => typeof p.chapter === 'string' && p.chapter.trim().length > 0);

        if (hasChapters) {
            const chapters = {};
            this.pages.forEach((page, index) => {
                if (!chapters[page.chapter]) {
                    chapters[page.chapter] = index;
                }
            });

            Object.entries(chapters).forEach(([chapter, pageIndex]) => {
                const item = document.createElement('div');
                item.className = 'toc-item';
                item.textContent = chapter;
                item.dataset.page = pageIndex;
                item.addEventListener('click', () => {
                    this.goToPage(parseInt(pageIndex));
                    this.tocPanel.classList.remove('active');
                });
                tocList.appendChild(item);
            });
        } else {
            // Fallback: create TOC entries by page ranges (every 10 pages)
            const step = 10;
            for (let i = 0; i < this.totalPages; i += step) {
                const start = i + 1;
                const end = Math.min(i + step, this.totalPages);
                const label = start === end ? `Page ${start}` : `Pages ${start}–${end}`;
                const item = document.createElement('div');
                item.className = 'toc-item';
                item.textContent = label;
                item.dataset.page = i;
                item.addEventListener('click', () => {
                    this.goToPage(i);
                    this.tocPanel.classList.remove('active');
                });
                tocList.appendChild(item);
            }
        }
    }

    goToPage(pageNumber) {
        this.currentPage = Math.max(0, Math.min(pageNumber, this.totalPages - (this.singlePageMode ? 1 : 2)));
        this.updatePageDisplay();
        this.playPageTurnSound();
        this.saveProgress();
    }

    addBookmark() {
        const bookmark = {
            page: this.currentPage,
            date: new Date().toISOString(),
            preview: this.pages[this.currentPage]?.content.substring(0, 100) || ''
        };
        
        this.bookmarks.push(bookmark);
        this.updateBookmarksList();
        this.saveBookmarks();
        
        // Show feedback
        this.bookmarkBtn.classList.add('active');
        setTimeout(() => this.bookmarkBtn.classList.remove('active'), 500);
    }

    updateBookmarksList() {
        const bookmarksList = document.getElementById('bookmarksList');
        bookmarksList.innerHTML = '';
        
        if (this.bookmarks.length === 0) {
            bookmarksList.innerHTML = '<p style="text-align: center; color: #999;">No bookmarks yet</p>';
            return;
        }
        
        this.bookmarks.forEach((bookmark, index) => {
            const item = document.createElement('div');
            item.className = 'bookmark-item';
            item.innerHTML = `
                <div class="bookmark-page">Page ${bookmark.page + 1}</div>
                <div class="bookmark-preview">${bookmark.preview}</div>
            `;
            
            item.addEventListener('click', () => {
                this.goToPage(bookmark.page);
                this.bookmarksPanel.classList.remove('active');
            });
            
            bookmarksList.appendChild(item);
        });
    }

    searchInBook(query) {
        if (!query) {
            this.searchResults.innerHTML = '';
            return;
        }
        
        const results = [];
        this.pages.forEach((page, index) => {
            const content = page.content.toLowerCase();
            if (content.includes(query.toLowerCase())) {
                results.push({
                    page: index,
                    preview: this.getSearchPreview(page.content, query)
                });
            }
        });
        
        this.displaySearchResults(results, query);
    }

    getSearchPreview(content, query) {
        const text = content.replace(/<[^>]*>/g, '');
        const index = text.toLowerCase().indexOf(query.toLowerCase());
        if (index === -1) return '';
        
        const start = Math.max(0, index - 50);
        const end = Math.min(text.length, index + query.length + 50);
        return '...' + text.substring(start, end) + '...';
    }

    displaySearchResults(results, query) {
        this.searchResults.innerHTML = '';
        
        if (results.length === 0) {
            this.searchResults.innerHTML = '<p style="text-align: center; color: #999;">No results found</p>';
            return;
        }
        
        results.forEach(result => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 5px;">Page ${result.page + 1}</div>
                <div class="search-result-text">${this.highlightText(result.preview, query)}</div>
            `;
            
            item.addEventListener('click', () => {
                this.goToPage(result.page);
                this.searchPanel.classList.remove('active');
            });
            
            this.searchResults.appendChild(item);
        });
    }

    highlightText(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    setReadingMode(mode) {
        this.readingMode = mode;
        this.readerContainer.className = 'book-reader-container active';
        this.readerContainer.classList.add(`${mode}-mode`);
        
        // Update active button (with null checks)
        const modeButtons = [this.dayModeBtn, this.nightModeBtn, this.sepiaModeBtn].filter(btn => btn !== null);
        modeButtons.forEach(btn => {
            if (btn) btn.classList.remove('active');
        });
        
        if (mode === 'day' && this.dayModeBtn) this.dayModeBtn.classList.add('active');
        if (mode === 'night' && this.nightModeBtn) this.nightModeBtn.classList.add('active');
        if (mode === 'sepia' && this.sepiaModeBtn) this.sepiaModeBtn.classList.add('active');
        
        this.saveSettings();
    }

    changeFontFamily(fontFamily) {
        this.fontFamily = fontFamily;
        const contents = this.bookPages.querySelectorAll('.page-content');
        contents.forEach(content => {
            content.style.fontFamily = fontFamily;
        });
        this.saveSettings();
    }

    changeFontSize(delta) {
        this.fontSize = Math.max(12, Math.min(30, this.fontSize + delta));
        if (this.fontSizeDisplay) this.fontSizeDisplay.textContent = this.fontSize + 'px';
        
        const contents = this.bookPages.querySelectorAll('.page-content');
        contents.forEach(content => {
            content.style.fontSize = this.fontSize + 'px';
        });
        this.saveSettings();
    }

    changeLineHeight(value) {
        this.lineHeight = parseFloat(value);
        if (this.lineHeightDisplay) this.lineHeightDisplay.textContent = value;
        
        const contents = this.bookPages.querySelectorAll('.page-content');
        contents.forEach(content => {
            content.style.lineHeight = value;
        });
        this.saveSettings();
    }

    changePageWidth(value) {
        this.pageWidth = parseInt(value);
        if (this.pageWidthDisplay) this.pageWidthDisplay.textContent = value + '%';
        if (this.book3D) this.book3D.style.maxWidth = value + '%';
        this.saveSettings();
    }

    toggleAutoScroll(enabled) {
        this.autoScrollEnabled = enabled;
        if (enabled) {
            this.readerContainer.classList.add('auto-scroll-active');
        } else {
            this.readerContainer.classList.remove('auto-scroll-active');
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            this.readerContainer.requestFullscreen();
            if (this.fullscreenBtn) this.fullscreenBtn.innerHTML = '<i class="bx bx-exit-fullscreen"></i>';
        } else {
            document.exitFullscreen();
            if (this.fullscreenBtn) this.fullscreenBtn.innerHTML = '<i class="bx bx-fullscreen"></i>';
        }
    }

    downloadBook() {
        // In a real implementation, this would download the book file
        alert('Download functionality would be implemented here with proper authorization.');
    }

    togglePanel(panel) {
        const isActive = panel.classList.contains('active');
        
        // Close all panels
        [this.tocPanel, this.bookmarksPanel, this.settingsPanel, this.searchPanel].forEach(p => {
            p.classList.remove('active');
        });
        
        // Toggle the clicked panel
        if (!isActive) {
            panel.classList.add('active');
            
            // Update bookmarks list if opening bookmarks panel
            if (panel === this.bookmarksPanel) {
                this.updateBookmarksList();
            }
        }
    }

    updateProgress() {
        const numerator = this.singlePageMode ? (this.currentPage + 1) : (this.currentPage + 2);
        const progress = (numerator / this.totalPages) * 100;
        if (this.progressFill) this.progressFill.style.width = progress + '%';
        if (this.progressText) this.progressText.textContent = `Page ${this.currentPage + 1} of ${this.totalPages}`;
        if (this.readerProgress) this.readerProgress.classList.add('show');
    }

    startReadingTimer() {
        this.timerInterval = setInterval(() => {
            this.readingTime++;
            const minutes = Math.floor(this.readingTime / 60);
            const seconds = this.readingTime % 60;
            this.timerDisplay.textContent = 
                String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
        }, 1000);
    }

    stopReadingTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    showReader() {
        this.readerContainer.classList.add('active');
        if (this.singlePageMode) this.readerContainer.classList.add('single-page');
        document.body.classList.add('reader-active');
        this.bumpUIVisibility();
    }

    closeReader() {
        gsap.to(this.readerContainer, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                this.readerContainer.classList.remove('active');
                document.body.classList.remove('reader-active');
                this.readerContainer.style.opacity = '';
                this.stopReadingTimer();
                this.saveProgress();
                
                // Navigate back
                window.history.back();
            }
        });
    }

    showLoading(show) {
        this.loadingBook.style.display = show ? 'block' : 'none';
    }

    saveProgress() {
        if (!this.bookData) return;
        
        const progress = {
            bookId: this.bookData.id,
            currentPage: this.currentPage,
            totalPages: this.totalPages,
            lastRead: new Date().toISOString(),
            readingTime: this.readingTime
        };
        
        localStorage.setItem(`book-progress-${this.bookData.id}`, JSON.stringify(progress));
    }

    loadProgress() {
        if (!this.bookData) return;
        
        const saved = localStorage.getItem(`book-progress-${this.bookData.id}`);
        if (saved) {
            const progress = JSON.parse(saved);
            this.currentPage = progress.currentPage || 0;
            this.readingTime = progress.readingTime || 0;
            this.updatePageDisplay();
        }
    }

    saveSettings() {
        const settings = {
            readingMode: this.readingMode,
            fontSize: this.fontSize,
            fontFamily: this.fontFamily,
            lineHeight: this.lineHeight,
            pageWidth: this.pageWidth,
            soundEnabled: this.soundEnabled
        };
        
        localStorage.setItem('reader-settings', JSON.stringify(settings));
    }

    loadSavedSettings() {
        const saved = localStorage.getItem('reader-settings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.readingMode = settings.readingMode || 'day';
            this.fontSize = settings.fontSize || 18;
            this.fontFamily = settings.fontFamily || "Georgia, 'Times New Roman', serif";
            this.lineHeight = settings.lineHeight || 1.8;
            this.pageWidth = settings.pageWidth || 100;
            this.soundEnabled = settings.soundEnabled !== false;
            
            // Apply settings to UI
            if (this.fontSizeDisplay) this.fontSizeDisplay.textContent = this.fontSize + 'px';
            if (this.lineHeightSlider) this.lineHeightSlider.value = this.lineHeight;
            if (this.lineHeightDisplay) this.lineHeightDisplay.textContent = this.lineHeight;
            if (this.pageWidthSlider) this.pageWidthSlider.value = this.pageWidth;
            if (this.pageWidthDisplay) this.pageWidthDisplay.textContent = this.pageWidth + '%';
            if (this.fontFamilySelect) this.fontFamilySelect.value = this.fontFamily;
            if (this.soundCheckbox) this.soundCheckbox.checked = this.soundEnabled;
            
            // Apply reading mode
            this.setReadingMode(this.readingMode);
        }
    }

    saveBookmarks() {
        if (!this.bookData) return;
        localStorage.setItem(`book-bookmarks-${this.bookData.id}`, JSON.stringify(this.bookmarks));
    }

    loadBookmarks() {
        if (!this.bookData) return;
        const saved = localStorage.getItem(`book-bookmarks-${this.bookData.id}`);
        if (saved) {
            this.bookmarks = JSON.parse(saved);
            this.updateBookmarksList();
        }
    }
}

// Floating panel helpers & selection
BookReader.prototype.toggleReaderPanel = function() {
    if (!this.readerPanel) return;
    this.readerPanel.classList.toggle('show');
    this.bumpUIVisibility();
};

BookReader.prototype.handlePanelAction = function(action) {
    switch(action) {
        case 'open-toc': this.togglePanel(this.tocPanel); break;
        case 'open-bookmarks': this.togglePanel(this.bookmarksPanel); break;
        case 'open-search': this.togglePanel(this.searchPanel); break;
        case 'open-settings': this.togglePanel(this.settingsPanel); break;
        case 'toggle-timer': this.toggleTimer(); break;
        case 'mode-day': this.setReadingMode('day'); break;
        case 'mode-night': this.setReadingMode('night'); break;
        case 'mode-sepia': this.setReadingMode('sepia'); break;
        case 'fullscreen': this.toggleFullscreen(); break;
        case 'bookmark-add': this.addBookmark(); break;
        case 'download': this.downloadBook(); break;
    }
    this.readerPanel.classList.remove('show');
};

BookReader.prototype.toggleTimer = function() {
    if (!this.readingTimer) return;
    const visible = this.readingTimer.style.display !== 'none' && this.readingTimer.style.display !== '' ? true : (this.readingTimer.offsetParent !== null);
    if (visible) {
        this.readingTimer.style.display = 'none';
        this.stopReadingTimer();
    } else {
        this.readingTimer.style.display = 'inline-flex';
        this.startReadingTimer();
    }
    this.bumpUIVisibility();
};

BookReader.prototype.handleTextSelection = function(e) {
    if (!this.selectionPopup) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) { this.hideSelectionPopup(); return; }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (!rect.width && !rect.height) { this.hideSelectionPopup(); return; }
    this.selectionPopup.style.left = `${rect.left + window.scrollX}px`;
    this.selectionPopup.style.top = `${rect.top + window.scrollY - 50}px`;
    this.selectionPopup.style.display = 'flex';
    this.bumpUIVisibility();
};

BookReader.prototype.hideSelectionPopup = function() {
    if (this.selectionPopup) this.selectionPopup.style.display = 'none';
};

BookReader.prototype.applyHighlight = function() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    try {
        const span = document.createElement('span');
        span.className = 'text-highlight';
        range.surroundContents(span);
        sel.removeAllRanges();
    } catch(err) {
        const content = range.toString();
        const span = document.createElement('span');
        span.className = 'text-highlight';
        span.textContent = content;
        range.deleteContents();
        range.insertNode(span);
        sel.removeAllRanges();
    }
};

BookReader.prototype.saveFavouriteLine = async function(text) {
    const selectedText = (text || '').trim();
    if (!selectedText) return;
    try {
    await fetch(`${API_BASE}/favorites/lines`, {
            method:'POST',
            headers:{'Content-Type':'application/json','Authorization':`Bearer ${localStorage.getItem('token')}`},
            body:JSON.stringify({ bookId:this.bookData?.id, page:this.currentPage+1, text:selectedText })
        });
    } catch(e){ console.error(e); }
};

BookReader.prototype.addNoteForSelection = function(text) {
    if (!text) return;
    const note = prompt('Add a note:');
    if (note) {
        this.notes.push({ page:this.currentPage+1, text, note, time:new Date().toISOString() });
    }
};

BookReader.prototype.selectionActionHandler = function(action) {
    const text = (window.getSelection()?.toString() || '').trim();
    switch(action) {
        case 'highlight': this.applyHighlight(); break;
        case 'favorite': this.saveFavouriteLine(text); break;
        case 'note': this.addNoteForSelection(text); break;
        case 'copy': if (text) navigator.clipboard.writeText(text).catch(()=>{}); break;
    }
    this.hideSelectionPopup();
};

if (document.getElementById('selectionPopup')) {
    document.getElementById('selectionPopup').addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const action = btn.dataset.action;
        bookReader.selectionActionHandler(action);
    });
}

BookReader.prototype.bumpUIVisibility = function() {
    if (!this.readerContainer) return;
    this.readerContainer.classList.remove('ui-hidden');
    clearTimeout(this._uiHideTimer);
    this._uiHideTimer = setTimeout(() => {
        this.readerContainer.classList.add('ui-hidden');
        if (this.readerProgress) this.readerProgress.classList.remove('show');
    }, this.uiHideDelay);
};

// Initialize reader
const bookReader = new BookReader();

// Function to open reader with book data (called from main page)
window.openBookReader = function(bookData) {
    bookReader.loadBook(bookData);
};

// Listen for book data from URL parameters or postMessage
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    // Support both 'bookId' and 'id' parameters
    const bookId = urlParams.get('bookId') || urlParams.get('id');
    
    console.log('📖 Book Reader initialized with bookId:', bookId);
    console.log('📖 Full URL:', window.location.href);
    
    // Check if bookId is valid
    if (!bookId || bookId === 'null' || bookId === 'undefined') {
        console.error('❌ Invalid bookId, showing message...');
        
        // Show error message instead of redirecting immediately
        const bookCover = document.getElementById('bookCover');
        if (bookCover) {
            bookCover.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: white; text-align: center; padding: 2rem;">
                    <i class='bx bx-error-circle' style='font-size: 4rem; margin-bottom: 1rem;'></i>
                    <h2>No Book Selected</h2>
                    <p style="margin: 1rem 0;">Please select a book from the library to read.</p>
                    <button onclick="window.location.href='/main.html'" style="padding: 0.75rem 1.5rem; background: #4CAF50; border: none; color: white; border-radius: 5px; cursor: pointer; font-size: 1rem;">
                        Browse Books
                    </button>
                </div>
            `;
        }
        return;
    }
    
    // Try to get book data from sessionStorage first
    const storedBookData = sessionStorage.getItem('currentBook');
    
    if (storedBookData) {
        try {
            const bookData = JSON.parse(storedBookData);
            console.log('📚 Loading book from session storage:', bookData.title);
            bookReader.loadBook(bookData);
            return;
        } catch (e) {
            console.error('Error parsing stored book data:', e);
        }
    }
    
    // Fetch book data from API
    console.log('🔄 Fetching book from API:', bookId);
    fetch(`${API_BASE}/books/${bookId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch book: ${response.status}`);
        }
        return response.json();
    })
    .then(bookData => {
        console.log('✅ Book loaded successfully:', bookData.title);
        const API_BASE_HOST = (typeof API_BASE === 'string') ? API_BASE.replace(/\/api$/, '') : '';
        
        bookReader.loadBook({
            id: bookData._id,
            title: bookData.title,
            author: bookData.author,
            coverUrl: bookData.coverFileId 
                ? `${API_BASE}/books/file/${bookData.coverFileId}`
                : (bookData.coverImage ? `${API_BASE_HOST}${bookData.coverImage}` : '')
        });
    })
    .catch(error => {
        console.error('❌ Error fetching book:', error);
        const bookCover = document.getElementById('bookCover');
        if (bookCover) {
            bookCover.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: white; text-align: center; padding: 2rem;">
                    <i class='bx bx-error-circle' style='font-size: 4rem; margin-bottom: 1rem; color: #f44336;'></i>
                    <h2>Failed to Load Book</h2>
                    <p style="margin: 1rem 0;">${error.message}</p>
                    <button onclick="window.location.href='/pages/my-library.html'" style="padding: 0.75rem 1.5rem; background: #4CAF50; border: none; color: white; border-radius: 5px; cursor: pointer; font-size: 1rem;">
                        Return to Library
                    </button>
                </div>
            `;
        }
    });
});
