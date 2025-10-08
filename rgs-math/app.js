// Enhanced CORS-Free Static Build - Improved Math Processing
(function() {
  'use strict';
  
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
        
        // Quiet verbose logs by default; enable with ?debug=1
        try {
            const qs = (typeof location !== 'undefined' ? location.search : '') || '';
            const debugOn = /(?:^|[?&])debug=1(?:&|$)/.test(qs);
            window.__MATH_DEBUG__ = debugOn;
            // Do not silence logs in frozen/static builds; only silence in dev without debug
            if (!debugOn && typeof console !== 'undefined' && !this.frozen) {
                const noop = function(){};
                // Keep warnings/errors, silence console.log/info
                try { console.log = noop; } catch(_) {}
                try { console.info = noop; } catch(_) {}
            }
        } catch(_) {}

        this.init();
    }

    async init() {
        this.setupTheme();
        await this.loadChapters();
        this.setupEventListeners();
        // Initialize new sidebar state (body data-attributes)
        this.applySidebarState();
        this.setupKeyboardShortcuts();
        this.setupLiveReload();
        
        // Load initial chapter
        const savedChapter = parseInt(localStorage.getItem('currentChapter')) || 0;
        await this.loadChapter(savedChapter);
        
        // Hide loading
        document.getElementById('loading').classList.add('hidden');
    }

    setupLiveReload() {
        return; // Disabled for static build
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
        // Preserve current sidebar collapsed state across chapter loads
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

            console.log(`[FROZEN] Chapter ${chNum} content length:`, combined.length);
            if (combined.includes('\\begin{aligned}')) {
                console.log('[FROZEN] Found aligned block in content');
                // Find and log the exact display block
                const match = combined.match(/\$\$[\s\S]*?\\begin\{aligned\}[\s\S]*?\\end\{aligned\}[\s\S]*?\$\$/);
                if (match) {
                    console.log('[FROZEN] Display block found:', match[0]);
                } else {
                    console.log('[FROZEN] No $$ wrapper found around aligned block');
                    // Check if it's there without $$
                    const alignedMatch = combined.match(/\\begin\{aligned\}[\s\S]*?\\end\{aligned\}/);
                    if (alignedMatch) {
                        console.log('[FROZEN] Raw aligned block:', alignedMatch[0]);
                    }
                }
            }

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

        // Verbose dev logs are gated behind a debug flag
        this.__debug = this.__debug || /[?&]debug=1/.test((typeof location !== 'undefined' ? location.search : ''));
        if (this.__debug) {
            try { document.body.classList.add('debug'); } catch (_) {}
            console.log(`[DEV] Chapter ${this.chapters[chapterIndex].number} content length:`, combined.length);
            if (combined.includes('\\begin{aligned}')) {
                console.log('[DEV] Found aligned block in content');
            }
        }

        // Process and render content
        this.processContent(combined);
        this.buildChapterTOC();
        this.renderSlide(0);
        
        // Load chapter animations if available
    }

    processContent(markdown) {
        // Normalize line endings to avoid CRLF vs LF differences between dev (fetch) and frozen (fs->JSON)
        const src = String(markdown).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        // Split content into slides. Treat '---' as hard breaks and also split on H1/H2 headers.
        const hardSections = src.split(/\n---\n/g);
        let rawSlides = [];
        hardSections.forEach(section => {
            const parts = section.split(/(?=^#{1,2}\s)/gm);
            rawSlides.push(...parts);
        });

        // Store original markdown slides
        this.slides = rawSlides
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .map(slide => this.enhanceMarkdown(slide));

        // Pre-render HTML with math for consistency across dev/frozen
        this.slidesHtml = this.slides.map((md, i) => {
            // Normalize: ensure LaTeX display environments are wrapped in $$ if missing
            const normalized = this.normalizeDisplayEnvs(md);
            const pre = this.protectMath(normalized);
            const htmlRaw = marked.parse(pre.text);
            const htmlRendered = this.renderPlaceholdersToKaTeX(htmlRaw, pre.placeholders);
            // Validate math rendering and detect issues
            this.validateMathRendering(htmlRendered, pre.placeholders);
            return `<div class="slide">${htmlRendered}</div>`;
        });
    }

    // If an aligned/align environment appears without $$ delimiters (which can happen in the
    // frozen build payload), wrap it in $$ so KaTeX treats it as display math.
    normalizeDisplayEnvs(md) {
        let text = String(md || '');
        
        // Ensure display math blocks have proper spacing by adding empty lines
        text = text.replace(/(\S)\n(\$\$[\s\S]*?\$\$)\n(\S)/g, '$1\n\n$2\n\n$3');
        text = text.replace(/(\S)(\$\$[\s\S]*?\$\$)(\S)/g, '$1\n\n$2\n\n$3');
        
        // Handle environments without $ wrappers
        if (/\\begin\{aligned\}[\s\S]*?\\end\{aligned\}/.test(text) && !/\$\$[\s\S]*?\\begin\{aligned\}/.test(text)) {
            text = text.replace(/\\begin\{aligned\}/g, '$\n\\begin{aligned}')
                       .replace(/\\end\{aligned\}/g, '\\end{aligned}\n$');
        }
        
        if (/\\begin\{align\}[\s\S]*?\\end\{align\}/.test(text) && !/\$\$[\s\S]*?\\begin\{align\}/.test(text)) {
            text = text.replace(/\\begin\{align\}/g, '$\n\\begin{align}')
                       .replace(/\\end\{align\}/g, '\\end{align}\n$');
        }
        
        return text;
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

        const makeReplacer = (asBlock = false) => (match) => {
            const key = `@@MATH_${placeholders.length}@@`;
            placeholders.push({ key, value: match, block: !!asBlock });
            if (this.__debug) {
                console.log(`[PROTECT] Captured math: ${key} -> ${match.substring(0, 50)}...`);
            }
            return asBlock ? (`\n${key}\n`) : key;
        };

        const replaceAll = (pattern, desc, asBlock = false) => {
            const before = text.length;
            text = text.replace(pattern, makeReplacer(asBlock));
            const after = text.length;
            if (this.__debug) {
                console.log(`[PROTECT] ${desc}: ${before - after} chars replaced`);
            }
        };

        // Order matters: replace display math first, then bracket forms,
        // then LaTeX environments, then inline paren, then inline dollar. Use non-greedy, multi-line.
        replaceAll(/\$\$[\s\S]*?\$\$/g, 'Display $$', true);        // $$ ... $$ (display)
        replaceAll(/\\\[[\s\S]*?\\\]/g, 'Display \\[\\]', true);        // \[ ... \] (display)
        // Capture aligned/align environments even if not wrapped in $$
        replaceAll(/\\begin\{aligned\}[\s\S]*?\\end\{aligned\}/g, 'Env aligned', true);
        replaceAll(/\\begin\{align\}[\s\S]*?\\end\{align\}/g, 'Env align', true);
        // Capture matrix environments (bmatrix, pmatrix, matrix, cases)
        replaceAll(/\\begin\{bmatrix\}[\s\S]*?\\end\{bmatrix\}/g, 'Env bmatrix', true);
        replaceAll(/\\begin\{pmatrix\}[\s\S]*?\\end\{pmatrix\}/g, 'Env pmatrix', true);
        replaceAll(/\\begin\{matrix\}[\s\S]*?\\end\{matrix\}/g, 'Env matrix', true);
        replaceAll(/\\begin\{cases\}[\s\S]*?\\end\{cases\}/g, 'Env cases', true);
        replaceAll(/\\\([\s\S]*?\\\)/g, 'Inline \\(\\)');        // \( ... \) (inline)
        // Inline $...$ on a single line (avoid spanning lines to reduce
        // collision with currency like $12,000). Allow escaped $ to pass.
        replaceAll(/(?<!\\)\$[^$\n]+?(?<!\\)\$/g, 'Inline $ (single line)');
        // Multiline inline $...$ (for cases where math spans lines)
        replaceAll(/(?<!\\)\$[\s\S]*?(?<!\\)\$/g, 'Inline $ (multiline)');

        if (this.__debug) {
            console.log(`[PROTECT] Total placeholders created: ${placeholders.length}`);
        }
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

    // Provide a global helper to dump a compact Markdown report you can paste into Slides/errors.md
    // Usage in dev tools: window.dumpErrorReport()
    dumpErrorReport() {
        const buckets = window.__errorBuckets || {};
        const keys = Object.keys(buckets);
        if (!keys.length) {
            console.log('# Math Error Report\n\nNo errors collected.');
            return;
        }
        const lines = ['# Math Error Report', '', 'Aggregated KaTeX/render issues (deduplicated):', ''];
        keys.forEach(k => {
            const e = buckets[k];
            const when = new Date(e.lastAt).toISOString();
            const sample = e.sample && e.sample.expr ? e.sample.expr : '';
            lines.push(`- **${k}** — count=${e.count} — last=${when}`);
            if (sample) lines.push(`  - sample: \`${sample.replace(/`/g, '\\`')}\``);
        });
        console.log(lines.join('\n'));
    }

    // Normalize problematic Unicode characters to TeX equivalents before KaTeX rendering
    normalizeMathUnicode(mathText) {
        if (!mathText) return mathText;
        return String(mathText)
            // Double vertical bar (norm notation) - main culprit from errors.md
            .replace(/‖/g, '\\Vert')
            // Fractions and special characters
            .replace(/½/g, '\\frac{1}{2}')
            .replace(/⅓/g, '\\frac{1}{3}')
            .replace(/¼/g, '\\frac{1}{4}')
            .replace(/¾/g, '\\frac{3}{4}')
            .replace(/⅛/g, '\\frac{1}{8}')
            // Inequality symbols
            .replace(/≤/g, '\\le')
            .replace(/≥/g, '\\ge')
            .replace(/≠/g, '\\neq')
            .replace(/≈/g, '\\approx')
            // Multiplication and operations
            .replace(/×/g, '\\times')
            .replace(/·/g, '\\cdot')
            .replace(/÷/g, '\\div')
            // Greek letters that might be Unicode
            .replace(/α/g, '\\alpha')
            .replace(/β/g, '\\beta')
            .replace(/γ/g, '\\gamma')
            .replace(/δ/g, '\\delta')
            .replace(/ε/g, '\\epsilon')
            .replace(/λ/g, '\\lambda')
            .replace(/μ/g, '\\mu')
            .replace(/π/g, '\\pi')
            .replace(/σ/g, '\\sigma')
            .replace(/θ/g, '\\theta')
            .replace(/Δ/g, '\\Delta')
            .replace(/Σ/g, '\\Sigma')
            .replace(/Π/g, '\\Pi')
            // Blackboard bold common sets
            .replace(/ℝ/g, '\\mathbb{R}')
            .replace(/ℤ/g, '\\mathbb{Z}')
            .replace(/ℚ/g, '\\mathbb{Q}')
            .replace(/ℕ/g, '\\mathbb{N}')
            .replace(/ℂ/g, '\\mathbb{C}')
            // Arrows and other symbols
            .replace(/→/g, '\\rightarrow')
            .replace(/←/g, '\\leftarrow')
            .replace(/↔/g, '\\leftrightarrow')
            .replace(/⇒/g, '\\Rightarrow')
            .replace(/⇐/g, '\\Leftarrow')
            .replace(/⇔/g, '\\Leftrightarrow')
            .replace(/∈/g, '\\in')
            .replace(/∉/g, '\\notin')
            .replace(/⊆/g, '\\subseteq')
            .replace(/⊇/g, '\\supseteq')
            .replace(/∪/g, '\\cup')
            .replace(/∩/g, '\\cap')
            .replace(/∅/g, '\\emptyset')
            .replace(/∞/g, '\\infty')
            // Partial and Nabla, including italic/bold math unicode variants
            .replace(/[∂𝜕𝝏]/g, '\\partial')
            .replace(/[∇𝛻𝜵]/g, '\\nabla')
            .replace(/∫/g, '\\int')
            .replace(/∑/g, '\\sum')
            .replace(/∏/g, '\\prod')
            // Unicode minus (U+2212) to ASCII hyphen
            .replace(/−/g, '-')
            // Non-breaking space to regular space
            .replace(/\u00A0/g, ' ')
            // Smart quotes to ASCII (can interfere with parsing)
            .replace(/[""]/g, '"')
            .replace(/['']/g, "'");
    }

    // Render protected math placeholders to KaTeX HTML with error bucketing
    renderPlaceholdersToKaTeX(html, placeholders) {
        if (!html || !placeholders || placeholders.length === 0) return html;
        let out = String(html);

        // Initialize error bucket storage
        const buckets = (window.__errorBuckets = window.__errorBuckets || {});
        const now = Date.now();
        const bucketError = (source, message, sample) => {
            const key = `${source}: ${message}`;
            const entry = buckets[key] || { count: 0, firstAt: now, lastAt: now, sample: null, source };
            entry.count += 1;
            entry.lastAt = now;
            if (!entry.sample && sample) entry.sample = sample;
            buckets[key] = entry;
        };

        // Build a quick lookup for placeholder raw values
        const phMap = Object.create(null);
        placeholders.forEach(p => { phMap[p.key] = p.value; });

        // Expand nested placeholders inside a raw TeX string back to raw TeX
        const expandRaw = (tex, depth = 0) => {
            if (!tex) return tex;
            // Safety to avoid pathological recursion
            if (depth > 5) return tex;
            let changed = false;
            let expanded = String(tex).replace(/@@MATH_\d+@@/g, (m) => {
                if (phMap[m]) { changed = true; return phMap[m]; }
                return m;
            });
            return changed ? expandRaw(expanded, depth + 1) : expanded;
        };

        for (const { key, value } of placeholders) {
            let display = false;
            // Expand any nested placeholders in the raw value back to LaTeX before normalization/KaTeX
            let inner = expandRaw(String(value || ''));
            if (this.__debug) {
                console.log(`[MATH] Processing placeholder: ${key} -> ${value.substring(0, 50)}...`);
            }
            try {
                if (/^\$\$[\s\S]*\$\$$/.test(inner)) {
                    display = true; inner = inner.slice(2, -2);
                } else if (/^\\\[[\s\S]*\\\]$/.test(inner)) {
                    display = true; inner = inner.slice(2, -2);
                } else if (/^\\\([\s\S]*\\\)$/.test(inner)) {
                    display = false; inner = inner.slice(2, -2);
                } else if (/^(?<!\\)\$[^$\n]+?(?<!\\)\$/.test(inner)) {
                    display = false; inner = inner.slice(1, -1);
                }
            } catch (_) {}

            // Normalize Unicode to TeX
            inner = this.normalizeMathUnicode(inner);

            let replacement = inner;
            try {
                if (window && window.katex && typeof window.katex.renderToString === 'function') {
                    if (this.__debug) {
                        console.log(`[MATH] Rendering with KaTeX: display=${display}, inner=${inner.substring(0, 50)}...`);
                    }
                    const isEnv = /^\\begin\{aligned\}/.test(inner) || /^\\begin\{align\}/.test(inner);
                    const expr = isEnv ? inner : inner;
                    replacement = window.katex.renderToString(expr, { displayMode: display, throwOnError: false, strict: false });
                } else {
                    if (this.__debug) console.log('[MATH] KaTeX not available, using raw delimiters');
                    replacement = value;
                }
            } catch (e) {
                bucketError('KaTeX', e && e.message ? e.message : 'render error', { expr: inner.substring(0, 120), display });
                if (this.__debug) {
                    console.warn('[MATH] KaTeX render error:', e && e.message, 'for:', inner.substring(0, 120));
                }
                replacement = value;
            }
            out = out.split(key).join(replacement);
        }

        // Unwrap paragraphs around display blocks
        try {
            out = out.replace(/<p>\s*(<span class="katex-display">[\s\S]*?<\/span>)\s*<\/p>/g, '$1');
        } catch (_) {}

        // Final cleanup: if any placeholder tokens leaked, restore them to their raw TeX to avoid visible @@MATH_x@@
        try {
            if (/@@MATH_\d+@@/.test(out)) {
                for (const { key, value } of placeholders) {
                    if (out.indexOf(key) !== -1) {
                        out = out.split(key).join(value);
                    }
                }
            }
        } catch (_) {}

        // Emit one-line summary of errors (deduped) once per load unless debug
        if (!this.__debug && !window.__errorSummaryPrinted) {
            window.__errorSummaryPrinted = true;
            const keys = Object.keys(window.__errorBuckets || {});
            if (keys.length) {
                const summary = ['[ERROR SUMMARY] KaTeX/render issues (deduped):'];
                keys.forEach(k => {
                    const e = window.__errorBuckets[k];
                    summary.push(`- ${k} [count=${e.count}] example="${(e.sample && e.sample.expr) ? e.sample.expr : ''}"`);
                });
                console.log(summary.join('\n'));
            }
        }

        return out;
    }

    // Comprehensive math validation and error detection
    validateMathRendering(html, originalPlaceholders) {
        if (!html || !originalPlaceholders) return;
        
        const issues = [];
        
        // Check for unrestored placeholders
        const unresolvedPlaceholders = html.match(/@@MATH_\d+@@/g);
        if (unresolvedPlaceholders) {
            issues.push({
                type: 'UNRESOLVED_PLACEHOLDERS',
                count: unresolvedPlaceholders.length,
                examples: unresolvedPlaceholders.slice(0, 3),
                severity: 'HIGH'
            });
        }
        
        // Check for raw LaTeX that should have been processed
        const rawLatex = [
            { pattern: /\$\$[\s\S]*?\$\$/g, type: 'DISPLAY_MATH' },
            { pattern: /\\\[[\s\S]*?\\\]/g, type: 'DISPLAY_BRACKET' },
            { pattern: /\\begin\{(bmatrix|pmatrix|matrix|cases|aligned|align)\}/g, type: 'ENVIRONMENT' },
            { pattern: /(?<!\\)\$[^$\n]+?(?<!\\)\$/g, type: 'INLINE_MATH' }
        ];
        
        rawLatex.forEach(({ pattern, type }) => {
            const matches = html.match(pattern);
            if (matches) {
                issues.push({
                    type: `RAW_LATEX_${type}`,
                    count: matches.length,
                    examples: matches.slice(0, 2).map(m => m.substring(0, 50) + '...'),
                    severity: 'HIGH'
                });
            }
        });
        
        // Check for incorrectly rendered display math (should be block, not inline)
        const inlineDisplayMath = html.match(/<span class="katex"[^>]*>[\s\S]*?\\displaystyle[\s\S]*?<\/span>/g);
        if (inlineDisplayMath) {
            issues.push({
                type: 'DISPLAY_AS_INLINE',
                count: inlineDisplayMath.length,
                examples: ['Display math rendered as inline'],
                severity: 'MEDIUM'
            });
        }
        
        // Check for missing matrix environments
        const matrixContent = html.match(/\\begin\{[bp]?matrix\}[\s\S]*?\\end\{[bp]?matrix\}/g);
        if (matrixContent) {
            issues.push({
                type: 'UNPROCESSED_MATRIX',
                count: matrixContent.length,
                examples: matrixContent.slice(0, 2).map(m => m.substring(0, 40) + '...'),
                severity: 'HIGH'
            });
        }
        
        // Report issues
        if (issues.length > 0) {
            const buckets = (window.__mathValidationIssues = window.__mathValidationIssues || {});
            issues.forEach(issue => {
                const key = issue.type;
                const entry = buckets[key] || { count: 0, lastSeen: null, examples: [] };
                entry.count += issue.count;
                entry.lastSeen = new Date().toISOString();
                entry.severity = issue.severity;
                if (issue.examples) {
                    entry.examples = [...new Set([...entry.examples, ...issue.examples])].slice(0, 5);
                }
                buckets[key] = entry;
            });
            
            if (this.__debug) {
                console.warn('[MATH VALIDATION] Issues detected:', issues);
            }
        }
    }

    // Enhanced error reporting that includes validation issues
    dumpErrorReport() {
        const katexBuckets = window.__errorBuckets || {};
        const validationBuckets = window.__mathValidationIssues || {};
        
        const katexKeys = Object.keys(katexBuckets);
        const validationKeys = Object.keys(validationBuckets);
        
        if (!katexKeys.length && !validationKeys.length) {
            console.log('# Math Error Report\n\nNo errors or issues detected.');
            return;
        }
        
        const lines = ['# Math Error Report', '', 'Generated: ' + new Date().toISOString(), ''];
        
        if (katexKeys.length) {
            lines.push('## KaTeX Rendering Errors', '');
            katexKeys.forEach(k => {
                const e = katexBuckets[k];
                const when = new Date(e.lastAt).toISOString();
                const sample = e.sample && e.sample.expr ? e.sample.expr : '';
                lines.push(`- **${k}** — count=${e.count} — last=${when}`);
                if (sample) lines.push(`  - sample: \`${sample.replace(/`/g, '\\`')}\``);
            });
            lines.push('');
        }
        
        if (validationKeys.length) {
            lines.push('## Math Processing Issues', '');
            validationKeys.forEach(k => {
                const issue = validationBuckets[k];
                lines.push(`- **${k}** (${issue.severity}) — count=${issue.count} — last=${issue.lastSeen}`);
                if (issue.examples && issue.examples.length) {
                    issue.examples.forEach(ex => {
                        lines.push(`  - example: \`${ex.replace(/`/g, '\\`')}\``);
                    });
                }
            });
            lines.push('');
        }
        
        lines.push('## Debugging Tips', '');
        lines.push('- Add `?debug=1` to URL for verbose logging');
        lines.push('- Check for unmatched delimiters in markdown');
        lines.push('- Verify LaTeX environment syntax');
        lines.push('- Look for Unicode characters that need normalization');
        
        console.log(lines.join('\n'));
    }

    // aligned/align environments and render them directly via katex.render.
    renderResidualDisplayMath(root) {
        if (!root || !window || !window.katex) return;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
        const nodes = [];
        // Collect first to avoid mutating during traversal
        while (true) {
            const n = walker.nextNode();
            if (!n) break;
            const t = String(n.nodeValue || '');
            if (t.includes('$$') || t.includes('\\[') || t.includes('\\begin{aligned}') || t.includes('\\begin{align}')) nodes.push(n);
        }
        nodes.forEach(node => {
            const text = String(node.nodeValue || '');
            const parent = node.parentNode;
            if (!parent) return;
            const frag = document.createDocumentFragment();
            let idx = 0;
            const pattern = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\begin\{aligned\}[\s\S]*?\\end\{aligned\}|\\begin\{align\}[\s\S]*?\\end\{align\})/g;
            let m;
            while ((m = pattern.exec(text))) {
                const before = text.slice(idx, m.index);
                if (before) frag.appendChild(document.createTextNode(before));
                const chunk = m[0];
                let display = true;
                let inner = chunk;
                if (/^\$\$/.test(chunk)) {
                    inner = chunk.slice(2, -2);
                    display = true;
                } else if (/^\\\[/.test(chunk)) {
                    inner = chunk.slice(2, -2);
                    display = true;
                } else if (/^\\begin\{aligned\}/.test(chunk) || /^\\begin\{align\}/.test(chunk)) {
                    // Keep full environment for KaTeX
                    inner = chunk;
                    display = true;
                }
                const span = document.createElement('span');
                try {
                    window.katex.render(inner, span, { displayMode: display, throwOnError: false, strict: false });
                } catch (e) {
                    span.textContent = chunk; // graceful fallback
                }
                frag.appendChild(span);
                idx = pattern.lastIndex;
            }
            const after = text.slice(idx);
            if (after) frag.appendChild(document.createTextNode(after));
            try { parent.replaceChild(frag, node); } catch (_) {}
        });
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
        // Avoid scrolling the (hidden) right TOC into view when it's collapsed,
        // which can cause horizontal page shifts.
        const rightState = (document.body && document.body.getAttribute('data-right')) || 'expanded';
        if (rightState !== 'collapsed') {
            const toScroll = tocList.querySelector('.toc-item.active');
            if (toScroll && typeof toScroll.scrollIntoView === 'function') {
                toScroll.scrollIntoView({ block: 'nearest', inline: 'nearest' });
            }
        }
    }

    renderSlide(index) {
        this.currentSlide = index;
        const container = document.getElementById('slide-container');
        // Always scroll the slide container to the top when changing slides
        if (container) {
            try { container.scrollTo({ top: 0, behavior: 'smooth' }); }
            catch (_) { try { container.scrollTop = 0; } catch(__) {} }
        }
        if (!this.slides || !this.slides[index]) {
            container.innerHTML = '<div class="slide"><p>No content.</p></div>';
            this.updateControls();
            return;
        }

        // Destroy any active animation instances before rerendering slide content
        this.destroyActiveAnimations();

        // Use pre-rendered HTML for consistent math rendering
        const htmlSlide = (this.slidesHtml && this.slidesHtml[index]) ? this.slidesHtml[index] : null;
        if (htmlSlide) {
            container.innerHTML = htmlSlide;
        } else {
            const pre = this.protectMath(this.slides[index]);
            const htmlRaw = marked.parse(pre.text);
            const htmlRendered = this.renderPlaceholdersToKaTeX(htmlRaw, pre.placeholders);
            // Validate math rendering and detect issues
            this.validateMathRendering(htmlRendered, pre.placeholders);
            container.innerHTML = `<div class="slide">${htmlRendered}</div>`;
        }

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

        // Render math with KaTeX auto-render (fallback; placeholders already rendered)
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
                // Fallback pass: render any residual display math not caught above
                this.renderResidualDisplayMath(container);
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
        // Re-enforce sidebar state after slide render to prevent accidental expansion
        try {
            const nav = document.getElementById('navigation');
            const toc = document.getElementById('chapter-toc');
            if (nav) {
                if (this.leftCollapsed) {
                    nav.style.transform = 'translateX(-100%)';
                    nav.style.pointerEvents = 'none';
                } else {
                    nav.style.transform = '';
                    nav.style.pointerEvents = '';
                }
            }
            if (toc) {
                if (this.rightCollapsed) {
                    toc.style.transform = 'translateX(100%)';
                    toc.style.pointerEvents = 'none';
                } else {
                    toc.style.transform = '';
                    toc.style.pointerEvents = '';
                }
            }
        } catch(_) {}
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
                // Frozen build path: load from pre-bundled registry to avoid dynamic import/file origin issues
                if (this.frozen && typeof window !== 'undefined' && window.__ANIMS__) {
                    const alias = {
                        'ch7_lagrange_tangency': 'ch7_lagrange_tangency_plot',
                        'ch2_completeness_gap': 'ch2_completeness_gap',
                        'ch2_sup_inf_explorer': 'ch2_sup_inf_explorer',
                        'ch2_function_mapping': 'ch2_function_mapping',
                        'ch2_metric_open_ball': 'ch2_metric_open_ball',
                        'ch2_epsilon_band': 'ch2_epsilon_band',
                        'ch2_monotone_convergence': 'ch2_monotone_convergence',
                        'ch2_bolzano_subsequence': 'ch2_bolzano_subsequence',
                        // Chapter 4 aliases
                        'ch4_eigen_invariance': 'ch4_eigen_invariance_plot',
                        'ch4_eigen_invariance_plot': 'ch4_eigen_invariance_plot',
                        'ch4_axb_column_space': 'ch4_axb_column_space',
                        'ch4_det_area_scaling': 'ch4_det_area_scaling',
                        'ch4_quadratic_form_classifier': 'ch4_quadratic_form_classifier',
                        'ch4_stability_dynamics': 'ch4_stability_dynamics',
                        // Chapter 5: route wrapper IDs to concrete 3D implementations in frozen build
                        'ch5_partials_cross_sections': 'ch5_partials_surface_tangents_3d',
                        'ch5_partials_surface_tangents_3d': 'ch5_partials_surface_tangents_3d',
                        'ch5_gradient_levelset_normal': 'ch5_gradient_surface_3d',
                        'ch5_gradient_surface_3d': 'ch5_gradient_surface_3d',
                        'ch5_taylor_surfaces_3d': 'ch5_taylor_surfaces_3d',
                        // Chapter 7 new modules
                        'ch7_complementary_slackness': 'ch7_complementary_slackness_3d',
                        'ch7_shadow_price': 'ch7_shadow_price',
                        'ch7_active_set': 'ch7_active_set',
                        'ch7_bliss_point': 'ch7_bliss_point',
                        'ch7_constrained_soc': 'ch7_constrained_soc',
                        // Chapter 8 new modules
                        'ch8_value_iteration': 'ch8_value_iteration',
                        'ch8_envelope': 'ch8_envelope',
                        'ch8_brouwer': 'ch8_brouwer',
                        'ch8_rbc_policy': 'ch8_rbc_policy',
                        // Chapter 8 interactive explorers
                        'ch8_envelope_tangent_check': 'ch8_envelope_tangent_check',
                        'ch8_maximum_continuity': 'ch8_maximum_continuity'
                    };
                    // Prefer alias if defined to avoid wrapper modules that try dynamic import in frozen builds
                    const mappedId = alias[id] || id;
                    if (window.__ANIMS__[mappedId] && typeof window.__ANIMS__[mappedId].init === 'function') {
                        const inst = window.__ANIMS__[mappedId].init(el, options) || { destroy() {} };
                        this.activeAnimInstances.push(inst);
                        continue; // handled via bundled registry
                    } else {
                        console.info('Animation not found in frozen bundle:', id, 'mapped to:', mappedId);
                        continue;
                    }
                }

                let loader = null;
                switch (id) {
                    case 'ch7_lagrange_tangency':
                    case 'ch7_lagrange_tangency_plot':
                        // Dynamic import removed for static build
                        break;
                    case 'ch2_completeness_gap':
                        // Dynamic import removed for static build
                        break;
                    case 'ch2_sup_inf_explorer':
                        // Dynamic import removed for static build
                        break;
                    case 'ch2_function_mapping':
                        // Dynamic import removed for static build
                        break;
                    case 'ch2_metric_open_ball':
                        // Dynamic import removed for static build
                        break;
                    case 'ch2_epsilon_band':
                        // Dynamic import removed for static build
                        break;
                    case 'ch2_monotone_convergence':
                        // Dynamic import removed for static build
                        break;
                    case 'ch2_bolzano_subsequence':
                        // Dynamic import removed for static build
                        break;
                    case 'ch6_unconstrained_foc_plot':
                        // Dynamic import removed for static build
                        break;
                    // Chapter 6 interactive figures
                    case 'ch6_convex_set_chord_test':
                        // Dynamic import removed for static build
                        break;
                    case 'ch6_function_concavity_chord':
                        // Dynamic import removed for static build
                        break;
                    case 'ch6_epigraph_hypograph':
                        // Dynamic import removed for static build
                        break;
                    case 'ch6_hessian_taylor_classifier':
                        // Dynamic import removed for static build
                        break;
                    case 'ch6_profit_unconstrained':
                        // Dynamic import removed for static build
                        break;
                    case 'ch6_global_vs_local':
                        // Dynamic import removed for static build
                        break;
                    case 'ch6_coercivity_superlevelsets':
                        // Dynamic import removed for static build
                        break;
                    // Chapter 7 interactive figures
                    case 'ch7_kkt_consumer_inequality':
                        // Dynamic import removed for static build
                        break;
                    case 'ch7_complementary_slackness':
                        // Dynamic import removed for static build
                        break;
                    case 'ch7_shadow_price':
                        // Dynamic import removed for static build
                        break;
                    case 'ch7_active_set':
                        // Dynamic import removed for static build
                        break;
                    case 'ch7_bliss_point':
                        // Dynamic import removed for static build
                        break;
                    case 'ch7_constrained_soc':
                        // Dynamic import removed for static build
                        break;
                    // Chapter 8 interactive figures
                    case 'ch8_value_iteration':
                        // Dynamic import removed for static build
                        break;
                    case 'ch8_envelope':
                        // Dynamic import removed for static build
                        break;
                    case 'ch8_envelope_tangent_check':
                        // Dynamic import removed for static build
                        break;
                    case 'ch8_maximum_continuity':
                        // Dynamic import removed for static build
                        break;
                    case 'ch8_brouwer':
                        // Dynamic import removed for static build
                        break;
                    case 'ch8_rbc_policy':
                        // Dynamic import removed for static build
                        break;
                    // Chapter 4 interactive figures
                    case 'ch4_axb_column_space':
                        // Dynamic import removed for static build
                        break;
                    case 'ch4_det_area_scaling':
                        // Dynamic import removed for static build
                        break;
                    case 'ch4_eigen_invariance':
                    case 'ch4_eigen_invariance_plot':
                        // Dynamic import removed for static build
                        break;
                    case 'ch4_quadratic_form_classifier':
                        // Dynamic import removed for static build
                        break;
                    case 'ch4_stability_dynamics':
                        // Dynamic import removed for static build
                        break;
                    // Chapter 5 interactive figures
                    case 'ch5_partials_cross_sections':
                    case 'ch5_partials_surface_tangents_3d':
                        // Dynamic import removed for static build
                        break;
                    case 'ch5_gradient_levelset_normal':
                        // Dynamic import removed for static build
                        break;
                    case 'ch5_directional_derivative_dot':
                        // Dynamic import removed for static build
                        break;
                    case 'ch5_jacobian_local_linear':
                        // Dynamic import removed for static build
                        break;
                    case 'ch5_chain_rule_blocks':
                        // Dynamic import removed for static build
                        break;
                    case 'ch5_hessian_classifier_tripanel':
                        // Dynamic import removed for static build
                        break;
                    case 'ch5_taylor_overlays':
                        // Dynamic import removed for static build
                        break;
                    case 'ch5_taylor_surfaces_3d':
                        // Dynamic import removed for static build
                        break;
                    default:
                        console.info('Unknown data-anim id:', id);
                        continue;
                }
                // Using bundled animations instead
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
        try { console.info('[App] Binding UI listeners'); } catch(_) {}
        // Bind new global toggles
        const toggleLeft = document.getElementById('toggle-left');
        const toggleRight = document.getElementById('toggle-right');
        const leftExpandToggle = document.getElementById('left-expand-toggle');
        const rightExpandToggle = document.getElementById('right-expand-toggle');
        try { console.log('[SIDEBAR] toggle-left present:', !!toggleLeft, 'toggle-right present:', !!toggleRight); } catch(_) {}
        if (toggleLeft) {
            toggleLeft.addEventListener('click', () => this.setLeftCollapsed(!this.leftCollapsed));
        }
        if (toggleRight) {
            toggleRight.addEventListener('click', () => this.setRightCollapsed(!this.rightCollapsed));
        }
        if (leftExpandToggle) {
            leftExpandToggle.addEventListener('click', () => this.setLeftCollapsed(false));
        }
        if (rightExpandToggle) {
            rightExpandToggle.addEventListener('click', () => this.setRightCollapsed(false));
        }

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

    // Sidebar state via body data-attributes (fresh mechanism)
    // Storage keys: leftCollapsed_v2, rightCollapsed_v2 ('1' collapsed, '0' expanded)
    applySidebarState() {
        const leftStr = localStorage.getItem('leftCollapsed_v2');
        const rightStr = localStorage.getItem('rightCollapsed_v2');
        this.leftCollapsed = (leftStr === '1');
        this.rightCollapsed = (rightStr === '1');
        // Default to expanded if unset
        if (leftStr === null) this.leftCollapsed = false;
        if (rightStr === null) this.rightCollapsed = false;
        // On small screens, prefer right sidebar collapsed by default (no saved preference)
        try {
            if (rightStr === null && typeof window !== 'undefined' && window.innerWidth <= 768) {
                this.rightCollapsed = true;
            }
        } catch(_) {}
        try { console.log('[SIDEBAR] applySidebarState -> left:', this.leftCollapsed, 'right:', this.rightCollapsed); } catch(_) {}
        document.body.setAttribute('data-left', this.leftCollapsed ? 'collapsed' : 'expanded');
        document.body.setAttribute('data-right', this.rightCollapsed ? 'collapsed' : 'expanded');
        // Apply inline transforms as a secondary enforcement to avoid CSS specificity issues
        try {
            const nav = document.getElementById('navigation');
            const toc = document.getElementById('chapter-toc');
            if (nav) {
                if (this.leftCollapsed) {
                    nav.style.transform = 'translateX(-100%)';
                    nav.style.pointerEvents = 'none';
                } else {
                    nav.style.transform = '';
                    nav.style.pointerEvents = '';
                }
            }
            if (toc) {
                if (this.rightCollapsed) {
                    toc.style.transform = 'translateX(100%)';
                    toc.style.pointerEvents = 'none';
                } else {
                    toc.style.transform = '';
                    toc.style.pointerEvents = '';
                }
            }
        } catch(_) {}
        this.updateEdgeToggles();
    }

    setLeftCollapsed(flag) {
        // New mechanism: set body data attribute and persist v2 key
        this.leftCollapsed = !!flag;
        try { localStorage.setItem('leftCollapsed_v2', this.leftCollapsed ? '1' : '0'); } catch(_) {}
        document.body.setAttribute('data-left', this.leftCollapsed ? 'collapsed' : 'expanded');
        try { console.log('[SIDEBAR] Left set to', this.leftCollapsed ? 'collapsed' : 'expanded'); } catch(_) {}
        // Inline transform enforcement
        try {
            const nav = document.getElementById('navigation');
            if (nav) {
                if (this.leftCollapsed) {
                    nav.style.transform = 'translateX(-100%)';
                    nav.style.pointerEvents = 'none';
                } else {
                    nav.style.transform = '';
                    nav.style.pointerEvents = '';
                }
            }
        } catch(_) {}
        this.updateEdgeToggles();
    }

    setRightCollapsed(flag) {
        // New mechanism: set body data attribute and persist v2 key
        this.rightCollapsed = !!flag;
        try { localStorage.setItem('rightCollapsed_v2', this.rightCollapsed ? '1' : '0'); } catch(_) {}
        document.body.setAttribute('data-right', this.rightCollapsed ? 'collapsed' : 'expanded');
        try { console.log('[SIDEBAR] Right set to', this.rightCollapsed ? 'collapsed' : 'expanded'); } catch(_) {}
        // Inline transform enforcement
        try {
            const toc = document.getElementById('chapter-toc');
            if (toc) {
                if (this.rightCollapsed) {
                    toc.style.transform = 'translateX(100%)';
                    toc.style.pointerEvents = 'none';
                } else {
                    toc.style.transform = '';
                    toc.style.pointerEvents = '';
                }
            }
        } catch(_) {}
        this.updateEdgeToggles();
    }

    updateEdgeToggles() {
        try {
            const leftHeaderToggle = document.getElementById('toggle-left');
            if (leftHeaderToggle) {
                const label = this.leftCollapsed ? 'Expand left menu' : 'Collapse left menu';
                leftHeaderToggle.setAttribute('aria-label', label);
                leftHeaderToggle.setAttribute('title', label);
                leftHeaderToggle.setAttribute('aria-expanded', this.leftCollapsed ? 'false' : 'true');
            }

            const rightHeaderToggle = document.getElementById('toggle-right');
            if (rightHeaderToggle) {
                const label = this.rightCollapsed ? 'Expand right menu' : 'Collapse right menu';
                rightHeaderToggle.setAttribute('aria-label', label);
                rightHeaderToggle.setAttribute('title', label);
                rightHeaderToggle.setAttribute('aria-expanded', this.rightCollapsed ? 'false' : 'true');
            }

            const leftEdgeToggle = document.getElementById('left-expand-toggle');
            if (leftEdgeToggle) {
                const show = !!this.leftCollapsed;
                leftEdgeToggle.classList.toggle('show', show);
                leftEdgeToggle.setAttribute('aria-hidden', show ? 'false' : 'true');
                leftEdgeToggle.setAttribute('title', 'Expand left menu');
                leftEdgeToggle.setAttribute('aria-label', 'Expand left menu');
                leftEdgeToggle.tabIndex = show ? 0 : -1;
            }

            const rightEdgeToggle = document.getElementById('right-expand-toggle');
            if (rightEdgeToggle) {
                const show = !!this.rightCollapsed;
                rightEdgeToggle.classList.toggle('show', show);
                rightEdgeToggle.setAttribute('aria-hidden', show ? 'false' : 'true');
                rightEdgeToggle.setAttribute('title', 'Expand right menu');
                rightEdgeToggle.setAttribute('aria-label', 'Expand right menu');
                rightEdgeToggle.tabIndex = show ? 0 : -1;
            }
        } catch(_) {}
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
                case 'Escape':
                    document.getElementById('animation-container').classList.add('hidden');
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
    // Expose error reporting function globally
    window.dumpErrorReport = () => window.app.dumpErrorReport();
    // Expose math testing function
    window.testMath = (mathText) => {
        const pre = window.app.protectMath(mathText);
        console.log('Protected:', pre);
        const html = marked.parse(pre.text);
        console.log('Marked HTML:', html);
        const rendered = window.app.renderPlaceholdersToKaTeX(html, pre.placeholders);
        console.log('Final HTML:', rendered);
        window.app.validateMathRendering(rendered, pre.placeholders);
        return rendered;
    };
});


})();