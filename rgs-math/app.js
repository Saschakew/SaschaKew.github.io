// Main Application Module
class PresentationApp {
    constructor() {
        this.chapters = [];
        this.currentChapter = 0;
        this.currentSlide = 0;
        this.slides = [];
        this.theme = localStorage.getItem('theme') || 'dark';
        this.isFullscreen = false;
        this.markdownCache = {};
        this.frozen = typeof window !== 'undefined' && !!window.__FROZEN_PRESENTATION__;
        // Problem set solution protection
        this.solutionPasswords = {};   // keyed by chapter number
        this.unlockedSolutions = {};   // keyed by chapter number (boolean)
        // Track active animation module instances to clean up on slide change
        this.activeAnimInstances = [];
        
        this.init();
    }

    async init() {
        this.setupTheme();
        await this.loadChapters();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.setupLiveReload();
        
        // Load initial chapter
        const savedChapter = parseInt(localStorage.getItem('currentChapter')) || 0;
        await this.loadChapter(savedChapter);
        
        // Hide loading
        document.getElementById('loading').classList.add('hidden');
    }

    setupLiveReload() {
        if (this.frozen) return;
        // Connect to server-sent events for live reload
        if (typeof EventSource !== 'undefined') {
            const source = new EventSource('/events');
            
            source.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'reload') {
                    console.log(`File ${data.file} changed, reloading...`);
                    // Clear cache for the changed file
                    const changedFile = data.file; // basename only from server
                    // Remove exact and basename-matching cache entries
                    Object.keys(this.markdownCache).forEach((key) => {
                        const base = key.split('/').pop();
                        if (key === changedFile || base === changedFile) {
                            delete this.markdownCache[key];
                        }
                    });
                    // Reload current chapter if it's the one that changed
                    const current = this.chapters[this.currentChapter];
                    const currentFile = current.file;
                    const currentBase = (currentFile || '').split('/').pop();
                    // Also compute expected problem set basename for the current chapter
                    const psBase = (typeof current.number === 'number' && current.number >= 1)
                        ? `Chapter${current.number}_problemset.md`
                        : null;
                    if (
                        currentFile === changedFile ||
                        currentBase === changedFile ||
                        (psBase && psBase === changedFile)
                    ) {
                        this.loadChapter(this.currentChapter);
                    }
                }
            };
            
            source.onerror = (error) => {
                console.log('Live reload connection error:', error);
            };
        }
    }

    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.textContent = this.theme === 'dark' ? '🌙' : '☀️';
    }

    async loadChapters() {
        // Define chapters
        this.chapters = [
            { number: 0, title: 'Course Introduction', file: 'Chapter0_slides.md' },
            { number: 1, title: 'Logic, Sets & Proofs', file: 'Chapter1_slides.md' },
            { number: 2, title: 'Real Analysis I', file: 'Chapter2_slides.md' },
            { number: 3, title: 'Real Analysis II', file: 'Chapter3_slides.md' },
            { number: 4, title: 'Linear Algebra', file: 'Chapter4_slides.md' },
            { number: 5, title: 'Multivariate Calculus', file: 'Chapter5_slides.md' },
            { number: 6, title: 'Unconstrained Optimization', file: 'Chapter6_slides.md' },
            { number: 7, title: 'Constrained Optimization', file: 'Chapter7_slides.md' },
            { number: 8, title: 'Dynamic Macro', file: 'Chapter8_slides.md' },
            { number: 9, title: 'Econometrics', file: 'Chapter9_slides.md' }
        ];

        // Render chapter navigation
        const chapterList = document.getElementById('chapter-list');
        chapterList.innerHTML = '';
        
        this.chapters.forEach((chapter, index) => {
            const item = document.createElement('div');
            item.className = 'chapter-item';
            item.innerHTML = `
                <span class="chapter-number">${chapter.number}</span>
                <span class="chapter-title">${chapter.title}</span>
            `;
            item.onclick = () => this.loadChapter(index);
            chapterList.appendChild(item);
        });
    }

    async loadChapter(chapterIndex) {
        this.currentChapter = chapterIndex;
        this.currentSlide = 0;
        localStorage.setItem('currentChapter', chapterIndex);
        
        // Update navigation
        document.querySelectorAll('.chapter-item').forEach((item, index) => {
            item.classList.toggle('active', index === chapterIndex);
        });

        // Load markdown content
        const chapter = this.chapters[chapterIndex];
        let content;

        // Frozen build: load from embedded data and skip fetch/problem-set fetch
        if (this.frozen && window.__FROZEN_PRESENTATION__) {
            const chNum = chapter.number;
            const frozen = window.__FROZEN_PRESENTATION__;
            const combined = (frozen.contentByNumber && Object.prototype.hasOwnProperty.call(frozen.contentByNumber, String(chNum)))
                ? (frozen.contentByNumber[String(chNum)] || '')
                : '# Error\n\nFrozen content not found for this chapter.';
            // Set solution password state from frozen payload
            const pw = (frozen.solutionPasswords && frozen.solutionPasswords[String(chNum)]) || '';
            this.solutionPasswords[chNum] = pw;
            this.unlockedSolutions[chNum] = !pw; // no password => open

            // Process and render content
            this.processContent(combined);
            this.buildChapterTOC();
            this.renderSlide(0);
            
            // Do not proceed with dynamic fetch path
            return;
        }

        if (this.markdownCache[chapter.file]) {
            content = this.markdownCache[chapter.file];
        } else {
            try {
                // Build URL: ProblemSets use absolute path served by Express; chapters from parent dir
                let url = chapter.file;
                if (url.startsWith('ProblemSets/')) {
                    url = `/${url}`;
                } else {
                    url = `../${url}`;
                }
                const response = await fetch(url);
                content = await response.text();
                this.markdownCache[chapter.file] = content;
            } catch (error) {
                console.error('Error loading chapter:', error);
                content = '# Error\n\nCould not load chapter content.';
            }
        }

        // Try to append Problem Set for this chapter as the last section
        let combined = content;
        try {
            const chapNum = this.chapters[chapterIndex].number;
            if (typeof chapNum === 'number' && chapNum >= 1) {
                const psKey = `ProblemSets/Chapter${chapNum}_problemset.md`;
                let psContent = '';
                if (this.markdownCache[psKey]) {
                    psContent = this.markdownCache[psKey];
                } else {
                    const psResp = await fetch(`/${psKey}`);
                    if (psResp.ok) {
                        psContent = await psResp.text();
                        this.markdownCache[psKey] = psContent;
                    }
                }
                if (psContent) {
                    // Extract optional solution password from an HTML comment like:
                    // <!-- solution_password: YOURPASS -->
                    let extracted = null;
                    try {
                        const m = psContent.match(/<!--\s*solution_password\s*:\s*([^\n\r]+?)\s*-->/i);
                        if (m) {
                            extracted = (m[1] || '').trim();
                            psContent = psContent.replace(m[0], '');
                        }
                    } catch (_) {}
                    if (extracted) {
                        this.solutionPasswords[chapNum] = extracted;
                        // Reset unlock state when (re)loading chapter
                        this.unlockedSolutions[chapNum] = false;
                    } else {
                        this.solutionPasswords[chapNum] = '';
                        this.unlockedSolutions[chapNum] = true; // no password means open
                    }
                    combined += `\n\n---\n# Problem Set\n\n${psContent}`;
                }
            }
        } catch (e) {
            console.warn('Problem Set load skipped:', e);
        }

        // Process and render content
        this.processContent(combined);
        this.buildChapterTOC();
        this.renderSlide(0);
        
        // Load chapter animations if available
    }

    processContent(markdown) {
        // Split content into slides. Treat '---' as hard breaks and also split on H1/H2 headers.
        const hardSections = markdown.split(/\n---\n/g);
        let rawSlides = [];
        hardSections.forEach(section => {
            const parts = section.split(/(?=^#{1,2}\s)/gm);
            rawSlides.push(...parts);
        });

        this.slides = rawSlides
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .map(slide => this.enhanceMarkdown(slide));
    }

    enhanceMarkdown(markdown) {
        // Animations disabled: return markdown as-is (no button injection)
        return markdown;
    }

    // Protect math segments from Markdown parsing by replacing them with
    // placeholders before calling marked.parse, then restore them afterward.
    // This avoids Markdown interpreting underscores in LaTeX (e.g., X_i) as
    // emphasis, which breaks expressions like \sum_{i=1}^n.
    protectMath(markdown) {
        if (!markdown) return { text: markdown, placeholders: [] };

        const placeholders = [];
        let text = String(markdown);

        const makeReplacer = () => (match) => {
            const key = `@@MATH_${placeholders.length}@@`;
            placeholders.push({ key, value: match });
            return key;
        };

        const replaceAll = (pattern) => {
            text = text.replace(pattern, makeReplacer());
        };

        // Order matters: replace display math first, then bracket forms,
        // then inline paren, then inline dollar. Use non-greedy, multi-line.
        replaceAll(/\$\$[\s\S]*?\$\$/g);        // $$ ... $$ (display)
        replaceAll(/\\\[[\s\S]*?\\\]/g);        // \[ ... \] (display)
        replaceAll(/\\\([\s\S]*?\\\)/g);        // \( ... \) (inline)
        // Inline $...$ on a single line (avoid spanning lines to reduce
        // collision with currency like $12,000). Allow escaped $ to pass.
        replaceAll(/(?<!\\)\$[^$\n]+?(?<!\\)\$/g);

        return { text, placeholders };
    }

    restoreMath(html, placeholders) {
        if (!html || !placeholders || placeholders.length === 0) return html;
        let out = String(html);
        // Restore in insertion order
        for (const { key, value } of placeholders) {
            out = out.split(key).join(value);
        }
        return out;
    }

    // Helpers for solution password gating
    getCurrentChapterNumber() {
        return (this.chapters[this.currentChapter] && this.chapters[this.currentChapter].number) || null;
    }

    areSolutionsLocked() {
        const chNum = this.getCurrentChapterNumber();
        if (chNum == null) return false;
        const pass = this.solutionPasswords[chNum];
        if (!pass) return false; // no password set
        return !this.unlockedSolutions[chNum];
    }

    promptUnlockSolutions() {
        const chNum = this.getCurrentChapterNumber();
        if (chNum == null) return true;
        const pass = this.solutionPasswords[chNum];
        if (!pass) return true; // nothing to unlock
        if (this.unlockedSolutions[chNum]) return true;
        const input = window.prompt('Enter password to view solutions for this chapter:');
        if (input !== null && input === String(pass)) {
            this.unlockedSolutions[chNum] = true;
            return true;
        }
        return false;
    }

    buildChapterTOC() {
        const tocList = document.getElementById('chapter-toc-list');
        if (!tocList) return;
        tocList.innerHTML = '';

        // Header: show current chapter title
        const header = document.querySelector('#chapter-toc .toc-header h3');
        if (header && this.chapters[this.currentChapter]) {
            const ch = this.chapters[this.currentChapter];
            header.textContent = `Chapter ${ch.number}: ${ch.title}`;
        }

        // Build items from slides: ONLY include H2 (## ) headings
        if (!this.slides || this.slides.length === 0) return;
        let count = 0;
        this.slides.forEach((md, i) => {
            const m = (md || '').match(/^##\s+(.+)$/m);
            if (!m) return; // skip slides without H2 heading
            count += 1;
            let title = m[1].trim();
            title = title.replace(/[\*_`]/g, '').replace(/<[^>]*>/g, '');

            const item = document.createElement('div');
            item.className = 'toc-item';
            item.setAttribute('data-index', String(i));
            item.innerHTML = `
                <span class="toc-number">${count}</span>
                <span class="toc-title">${title}</span>
            `;
            item.onclick = () => this.renderSlide(i);
            tocList.appendChild(item);
        });
    }

    updateTOCActive(index) {
        const tocList = document.getElementById('chapter-toc-list');
        if (!tocList) return;
        tocList.querySelectorAll('.toc-item').forEach(el => el.classList.remove('active'));
        const active = tocList.querySelector(`.toc-item[data-index="${index}"]`);
        if (active) active.classList.add('active');
        const toScroll = tocList.querySelector('.toc-item.active');
        if (toScroll && typeof toScroll.scrollIntoView === 'function') {
            toScroll.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
    }

    renderSlide(index) {
        this.currentSlide = index;
        const container = document.getElementById('slide-container');
        if (!this.slides || !this.slides[index]) {
            container.innerHTML = '<div class="slide"><p>No content.</p></div>';
            this.updateControls();
            return;
        }

        // Destroy any active animation instances before rerendering slide content
        this.destroyActiveAnimations();

        const pre = this.protectMath(this.slides[index]);
        const htmlRaw = marked.parse(pre.text);
        const html = this.restoreMath(htmlRaw, pre.placeholders);
        container.innerHTML = `<div class="slide">${html}</div>`;

        // Inject optional subtitle under the first H1 if declared in markdown
        // Supported syntaxes (case-insensitive):
        // 1) HTML comment directive anywhere on the slide: <!-- subtitle: Your Name — 2025 -->
        // 2) A line immediately after the leading H1: "Subtitle: Your Name — 2025"
        try {
            const slideEl = container.querySelector('.slide');
            if (slideEl) {
                const originalMd = this.slides[index] || '';
                let subtitleText = null;
                // Try HTML comment directive first
                const m1 = originalMd.match(/<!--\s*subtitle\s*:\s*([^\n\r]+?)\s*-->/i);
                if (m1) {
                    subtitleText = (m1[1] || '').trim();
                } else {
                    // Then try a line "Subtitle: ..." immediately following a leading H1
                    const lines = String(originalMd).split(/\r?\n/);
                    if (lines.length > 1 && /^#\s+/.test(lines[0] || '')) {
                        // Find the first non-empty line after the H1
                        for (let j = 1; j < lines.length; j++) {
                            const s = (lines[j] || '').trim();
                            if (!s) continue;
                            const m2 = s.match(/^Subtitle\s*:\s*(.+)$/i);
                            if (m2) {
                                subtitleText = (m2[1] || '').trim();
                            }
                            break; // Only inspect the first non-empty line after H1
                        }
                    }
                }

                if (subtitleText) {
                    const h1 = slideEl.querySelector('h1');
                    if (h1) {
                        const p = document.createElement('p');
                        p.className = 'subtitle';
                        p.textContent = subtitleText;
                        h1.insertAdjacentElement('afterend', p);
                    }
                }
            }
        } catch (e) {
            console.warn('subtitle injection failed', e);
        }

        // Post-process spacing: if a list immediately follows a paragraph with
        // no blank line in the Markdown source, remove the list's top margin.
        try {
            const slideRoot = container.querySelector('.slide');
            if (slideRoot) {
                this.applyTightListSpacing(this.slides[index], slideRoot);
            }
        } catch (_) {}

        // Render math with KaTeX auto-render
        if (window.renderMathInElement) {
            try {
                window.renderMathInElement(container, {
                    delimiters: [
                        { left: "$$", right: "$$", display: true },
                        { left: "$", right: "$", display: false },
                        { left: "\\(", right: "\\)", display: false },
                        { left: "\\[", right: "\\]", display: true }
                    ],
                    throwOnError: false,
                    strict: false
                });
            } catch (e) {
                console.warn('Math render error', e);
            }
        }

        // Syntax highlighting
        if (window.hljs) {
            container.querySelectorAll('pre code').forEach(block => {
                try { window.hljs.highlightElement(block); } catch (e) {}
            });
        }
        
        // Make entire details box clickable (not just summary)
        try {
            const slideRoot = container.querySelector('.slide');
            if (slideRoot) {
                // Mark solution details as locked if a password is set for this chapter
                const chNum = this.getCurrentChapterNumber();
                const hasPw = chNum != null && !!(this.solutionPasswords[chNum]);
                slideRoot.querySelectorAll('details').forEach(det => {
                    const summary = det.querySelector('summary');
                    const summaryText = (summary && summary.textContent ? summary.textContent : '').toLowerCase();
                    const isSolution = /solution/.test(summaryText);
                    const isLocked = isSolution && hasPw && !this.unlockedSolutions[chNum];
                    if (isLocked) {
                        det.classList.add('solution-locked');
                        // Prevent native toggle on summary click until unlocked (capture phase)
                        if (summary) {
                            summary.addEventListener('click', (e) => {
                                if (!this.unlockedSolutions[chNum]) {
                                    const ok = this.promptUnlockSolutions();
                                    if (!ok) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        return false;
                                    } else {
                                        // Unlocked now: remove lock classes across slide
                                        slideRoot.querySelectorAll('details.solution-locked').forEach(d => d.classList.remove('solution-locked'));
                                    }
                                }
                            }, true);
                        }
                    }

                    // Whole-box click to toggle (except on summary/interactive elements)
                    det.addEventListener('click', (e) => {
                        // If clicking on the native summary, allow default flow (it may have unlocked above)
                        if (e.target.closest('summary')) return;
                        // Ignore clicks on interactive elements
                        if (e.target.closest('a, button, input, textarea, select, label')) return;
                        // Avoid toggling when user is selecting text
                        const sel = window.getSelection && window.getSelection();
                        if (sel && typeof sel.toString === 'function' && sel.toString().length > 0) return;

                        // If this is a solution and still locked, prompt
                        if (isSolution && this.areSolutionsLocked()) {
                            const ok = this.promptUnlockSolutions();
                            if (!ok) {
                                e.preventDefault();
                                e.stopPropagation();
                                return;
                            } else {
                                // Unlocked now: remove lock styles
                                slideRoot.querySelectorAll('details.solution-locked').forEach(d => d.classList.remove('solution-locked'));
                            }
                        }

                        // Toggle the details open state
                        det.open = !det.open;
                        e.preventDefault();
                        e.stopPropagation();
                    });
                });
            }
        } catch (e) {
            console.warn('details toggle enhancement failed', e);
        }
        
        // Initialize data-anim modules inside this slide (scoped, small and explicit)
        try {
            const slideRoot = container.querySelector('.slide');
            if (slideRoot) {
                this.initDataAnimations(slideRoot);
            }
        } catch (e) {
            console.warn('data-anim init failed', e);
        }

        // Animations disabled: ignore any per-slide buttons (only global example remains)
        this.updateControls();
        this.updateTOCActive(index);
    }

    // Determine where a list immediately follows a paragraph in the original
    // Markdown without an intervening blank line, and add a class to tighten
    // spacing for those lists only.
    applyTightListSpacing(markdown, slideRoot) {
        if (!markdown || !slideRoot) return;
        const lines = String(markdown).split(/\r?\n/);

        // Normalize by stripping leading blockquote markers (> ...)
        const stripQuote = (s) => String(s ?? '').replace(/^\s*>+\s?/, '');
        const isListStart = (s) => /^(?:\s*[-*+]\s+|\s*\d+[\.)]\s+)/.test(stripQuote(s));
        const isHeading = (s) => /^\s*#{1,6}\s+/.test(stripQuote(s));
        const isFenceLine = (s) => /^\s*```/.test(stripQuote(s));
        const isBlank = (s) => stripQuote(s).trim().length === 0;
        const isHtml = (s) => stripQuote(s).trim().startsWith('<');

        const pairs = [];
        let inFence = false;

        // Scan for paragraph-line followed by list start, with or without blank line
        for (let i = 0; i < lines.length - 1; i++) {
            const a = lines[i] ?? '';
            const aN = stripQuote(a);

            // Handle fenced code blocks (even inside quotes)
            if (isFenceLine(a)) { inFence = !inFence; continue; }
            if (inFence) continue;

            if (isBlank(aN)) continue; // skip blanks
            if (isHeading(a) || isListStart(a)) continue; // skip non-paragraph starters

            const b = lines[i + 1] ?? '';
            const c = lines[i + 2] ?? '';
            const bN = stripQuote(b);
            const cN = stripQuote(c);

            let tight = isListStart(b); // no blank line
            const spaced = isBlank(bN) && isListStart(c); // has a blank line (including quoted blank)
            // Heuristic: allow colon-ended lead-in to be treated as tight even with one blank line
            if (!tight && spaced && /:\s*$/.test(aN)) {
                tight = true;
            }

            if (tight || spaced) {
                pairs.push({ tight });
            }
        }

        // Apply to DOM in order of occurrence
        let k = 0;
        const lists = slideRoot.querySelectorAll('p + ul, p + ol');
        lists.forEach((ul) => {
            const info = pairs[k++];
            if (info && info.tight) {
                ul.classList.add('tight-follow');
                const prev = ul.previousElementSibling;
                if (prev && prev.tagName === 'P') {
                    prev.classList.add('tight-next-list');
                }
            }
        });
    }

    injectChapterAnimations(markdown) {
        // Animations disabled: no injection into slides
        return markdown;
    }

    async loadChapterAnimations(chapterIndex) {
        // Pruned: chapter animations not supported
        return;
    }

    async loadAnimationsFromSpecs(chapterIndex) {
        // Pruned: spec-based animations not supported
        return;
    }

    createAnimationsFromSpec(specContent, chapterIndex) {
        // Pruned: return empty map
        return {};
    }

    createSpecBasedAnimation(container, spec) {
        // Pruned path: keep simple placeholder (not used in example-only mode)
        container.innerHTML = '<div style="padding:1rem; text-align:center; color: var(--text-secondary);">Animations are disabled (example only).</div>';
    }

    createChapterSpecificAnimation(chapter, title) { /* pruned */ }

    drawInitialState(ctx, chapter) { /* pruned */ }

    // Pruned: createEpsilonNAnimation removed

    // Pruned: createLagrangeAnimation removed

    // Pruned: createContinuityAnimation removed

    // Pruned: createLinearTransformAnimation removed

    // Pruned: createPartialDerivativeAnimation removed

    // Pruned: createDynamicAnimation removed

    // Pruned: createRegressionAnimation removed

    // Pruned: createGenericAnimation removed

    destroyActiveAnimations() {
        try {
            const arr = Array.isArray(this.activeAnimInstances) ? this.activeAnimInstances : [];
            arr.forEach(inst => {
                try { inst && typeof inst.destroy === 'function' && inst.destroy(); } catch (_) {}
            });
        } catch (_) {}
        this.activeAnimInstances = [];
    }

    async initDataAnimations(slideRoot) {
        if (!slideRoot) return;
        const mounts = slideRoot.querySelectorAll('[data-anim]');
        if (!mounts || mounts.length === 0) return;

        for (const el of mounts) {
            const id = String(el.getAttribute('data-anim') || '').trim();
            let options = {};
            const optStr = el.getAttribute('data-options');
            if (optStr) {
                try { options = JSON.parse(optStr); } catch (e) { console.warn('data-anim options parse failed', e); }
            }
            try {
                let loader = null;
                switch (id) {
                    case 'ch7_lagrange_tangency':
                    case 'ch7_lagrange_tangency_plot':
                        loader = () => import('../animations/chapters/ch7_lagrange_tangency_plot.js');
                        break;
                    case 'ch6_unconstrained_foc_plot':
                        loader = () => import('../animations/chapters/ch6_unconstrained_foc_plot.js');
                        break;
                    case 'ch7_kkt_consumer_inequality':
                        loader = () => import('../animations/chapters/ch7_kkt_consumer_inequality.js');
                        break;
                    default:
                        console.info('Unknown data-anim id:', id);
                        continue;
                }
                const mod = await loader();
                if (mod && typeof mod.init === 'function') {
                    const inst = mod.init(el, options) || { destroy() {} };
                    this.activeAnimInstances.push(inst);
                }
            } catch (e) {
                console.error('Failed to load animation module:', id, e);
            }
        }
    }

    showAnimation(animationId) {
        // Only the example animation is allowed
        if (animationId !== 'example') {
            console.info('All animations are disabled except the example.');
            return;
        }
        const container = document.getElementById('animation-container');
        const content = document.getElementById('animation-content');
        
        container.classList.remove('hidden');
        content.innerHTML = `
            <div style="text-align: center; color: var(--text-secondary);">
                <h3>Linear function: y = m x + b</h3>
                <p>Adjust the slope m and intercept b. Press Esc or × to close.</p>
                <div class="anim-controls" style="display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; margin-top:1rem;">
                    <label style="display:flex; align-items:center; gap:0.5rem;">
                        <span>m (slope)</span>
                        <input id="input-slope" type="number" step="0.1" value="1" style="width:6rem; padding:0.25rem; background: var(--bg-tertiary); color: var(--text-primary); border:1px solid var(--border-color); border-radius:0.25rem;" aria-label="Slope m">
                    </label>
                    <label style="display:flex; align-items:center; gap:0.5rem;">
                        <span>b (intercept)</span>
                        <input id="input-intercept" type="number" step="0.1" value="0" style="width:6rem; padding:0.25rem; background: var(--bg-tertiary); color: var(--text-primary); border:1px solid var(--border-color); border-radius:0.25rem;" aria-label="Intercept b">
                    </label>
                </div>
                <canvas id="animation-canvas" width="800" height="400" style="border: 1px solid var(--border-color); border-radius: 0.5rem; margin-top: 1rem;"></canvas>
            </div>
        `;
        this.createLinearGraphAnimation();
    }

    createLinearGraphAnimation() {
        const canvas = document.getElementById('animation-canvas');
        const slopeInput = document.getElementById('input-slope');
        const interceptInput = document.getElementById('input-intercept');
        if (!canvas || !slopeInput || !interceptInput) return;

        const ctx = canvas.getContext('2d');

        const state = {
            xmin: -10,
            xmax: 10,
            ymin: -10,
            ymax: 10,
            get m() { return Number.isFinite(parseFloat(slopeInput.value)) ? parseFloat(slopeInput.value) : 0; },
            get b() { return Number.isFinite(parseFloat(interceptInput.value)) ? parseFloat(interceptInput.value) : 0; }
        };

        const css = getComputedStyle(document.documentElement);
        const colGrid = (css.getPropertyValue('--border-color') || '#2a2a2a').trim();
        const colAxes = (css.getPropertyValue('--text-secondary') || '#a0a0a0').trim();
        const colLine = (css.getPropertyValue('--text-accent') || '#60a5fa').trim();

        function toPx(x, y) {
            const sx = canvas.width / (state.xmax - state.xmin);
            const sy = canvas.height / (state.ymax - state.ymin);
            return {
                x: (x - state.xmin) * sx,
                y: canvas.height - (y - state.ymin) * sy
            };
        }

        function drawGrid() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.lineWidth = 1;
            ctx.strokeStyle = colGrid;
            // vertical lines
            for (let x = Math.ceil(state.xmin); x <= state.xmax; x++) {
                const p1 = toPx(x, state.ymin);
                const p2 = toPx(x, state.ymax);
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
            // horizontal lines
            for (let y = Math.ceil(state.ymin); y <= state.ymax; y++) {
                const p1 = toPx(state.xmin, y);
                const p2 = toPx(state.xmax, y);
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }

            // axes
            ctx.lineWidth = 2;
            ctx.strokeStyle = colAxes;
            let p1 = toPx(state.xmin, 0);
            let p2 = toPx(state.xmax, 0);
            ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
            p1 = toPx(0, state.ymin);
            p2 = toPx(0, state.ymax);
            ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
            ctx.restore();
        }

        function drawLine() {
            ctx.save();
            ctx.lineWidth = 3;
            ctx.strokeStyle = colLine;
            const x1 = state.xmin;
            const y1 = state.m * x1 + state.b;
            const x2 = state.xmax;
            const y2 = state.m * x2 + state.b;
            const p1 = toPx(x1, y1);
            const p2 = toPx(x2, y2);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.restore();
        }

        function draw() {
            drawGrid();
            drawLine();
        }

        slopeInput.addEventListener('input', draw);
        interceptInput.addEventListener('input', draw);

        draw();
    }

    updateControls() {
        // Update slide counter
        document.getElementById('current-slide').textContent = this.currentSlide + 1;
        document.getElementById('total-slides').textContent = this.slides.length;
        
        // Update progress bar
        const progress = ((this.currentSlide + 1) / this.slides.length) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        
        // Update button states
        document.getElementById('prev-slide').disabled = this.currentSlide === 0;
        document.getElementById('next-slide').disabled = this.currentSlide === this.slides.length - 1;
    }

    setupEventListeners() {
        // Navigation toggle
        document.getElementById('nav-toggle').addEventListener('click', () => {
            document.getElementById('navigation').classList.toggle('collapsed');
        });
        
        // Example animation button (global)
        const exampleBtn = document.getElementById('example-animation-btn');
        if (exampleBtn) {
            exampleBtn.addEventListener('click', () => {
                this.showAnimation('example');
            });
        }
        
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.theme = this.theme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', this.theme);
            this.setupTheme();
        });
        
        // Fullscreen toggle
        document.getElementById('fullscreen-toggle').addEventListener('click', () => {
            this.toggleFullscreen();
        });
        
        // Slide navigation
        document.getElementById('prev-slide').addEventListener('click', () => {
            this.navigateSlide(-1);
        });
        
        document.getElementById('next-slide').addEventListener('click', () => {
            this.navigateSlide(1);
        });
        
        // Close animation
        document.getElementById('close-animation').addEventListener('click', () => {
            document.getElementById('animation-container').classList.add('hidden');
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    this.navigateSlide(-1);
                    break;
                case 'ArrowRight':
                    this.navigateSlide(1);
                    break;
                case 'ArrowUp':
                    this.navigateChapter(-1);
                    break;
                case 'ArrowDown':
                    this.navigateChapter(1);
                    break;
                case 'f':
                case 'F':
                    if (!e.ctrlKey && !e.metaKey) {
                        this.toggleFullscreen();
                    }
                    break;
                case 'Escape':
                    document.getElementById('animation-container').classList.add('hidden');
                    if (this.isFullscreen) {
                        this.toggleFullscreen();
                    }
                    break;
                case 't':
                case 'T':
                    if (!e.ctrlKey && !e.metaKey) {
                        document.getElementById('theme-toggle').click();
                    }
                    break;
                case 'Home':
                    this.renderSlide(0);
                    break;
                case 'End':
                    this.renderSlide(this.slides.length - 1);
                    break;
            }
        });
    }

    navigateSlide(direction) {
        const newSlide = this.currentSlide + direction;
        if (newSlide >= 0 && newSlide < this.slides.length) {
            this.renderSlide(newSlide);
        } else if (newSlide >= this.slides.length && this.currentChapter < this.chapters.length - 1) {
            // Go to next chapter
            this.loadChapter(this.currentChapter + 1);
        } else if (newSlide < 0 && this.currentChapter > 0) {
            // Go to previous chapter, last slide
            this.loadChapter(this.currentChapter - 1).then(() => {
                this.renderSlide(this.slides.length - 1);
            });
        }
    }

    navigateChapter(direction) {
        const newChapter = this.currentChapter + direction;
        if (newChapter >= 0 && newChapter < this.chapters.length) {
            this.loadChapter(newChapter);
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            document.body.classList.add('fullscreen');
            this.isFullscreen = true;
        } else {
            document.exitFullscreen();
            document.body.classList.remove('fullscreen');
            this.isFullscreen = false;
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PresentationApp();
});
