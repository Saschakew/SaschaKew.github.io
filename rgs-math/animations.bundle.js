// Auto-generated animations bundle for CORS-free build
(function(){
  window.__ANIMS__ = window.__ANIMS__ || {};

  // ch2_bolzano_subsequence.js
  (function(){
    // Chapter 2: Bolzano–Weierstrass Subsequence Selector
// Public API: init(containerEl, options) -> { destroy }
// Visual goal: show bounded sequences and highlight convergent subsequences selected by pattern.

function init(containerEl, options = {}) {
  if (!containerEl) {
    return { destroy() {} };
  }

  const SEQUENCES = [
    {
      id: 'alternating',
      label: 'xₙ = (−1)ⁿ',
      generator: (n) => ((n % 2 === 0) ? 1 : -1)
    },
    {
      id: 'sine',
      label: 'xₙ = sin(n)',
      generator: (n) => Math.sin(n)
    },
    {
      id: 'cosine',
      label: 'xₙ = cos(n)',
      generator: (n) => Math.cos(n)
    }
  ];

  const SUBSEQUENCES = [
    { id: 'even', label: 'Even indices', predicate: (n) => n % 2 === 0 },
    { id: 'odd', label: 'Odd indices', predicate: (n) => n % 2 === 1 },
    { id: 'mod3', label: 'Every third term', predicate: (n) => n % 3 === 0 },
    { id: 'mod4', label: 'Every fourth term', predicate: (n) => n % 4 === 0 }
  ];

  const defaults = {
    sequenceId: 'alternating',
    subsequenceId: 'even',
    nMax: 80
  };

  const state = {
    sequenceId: SEQUENCES.some(s => s.id === options.sequenceId) ? options.sequenceId : defaults.sequenceId,
    subsequenceId: SUBSEQUENCES.some(s => s.id === options.subsequenceId) ? options.subsequenceId : defaults.subsequenceId,
    nMax: clampInt(options.nMax ?? defaults.nMax, 30, 200)
  };

  containerEl.innerHTML = `
    <div class="anim anim--plot" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; flex-wrap:wrap; gap:1rem; align-items:center; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <label style="display:flex; align-items:center; gap:0.5rem; min-width:240px;">
          <span style="min-width:10ch; text-align:right; color: var(--text-secondary);">Sequence</span>
          <select data-role="sequence" aria-label="Select base sequence" style="flex:1;">
            ${SEQUENCES.map(s => `<option value="${s.id}">${s.label}</option>`).join('')}
          </select>
        </label>
        <label style="display:flex; align-items:center; gap:0.5rem; min-width:240px;">
          <span style="min-width:11ch; text-align:right; color: var(--text-secondary);">Subsequence</span>
          <select data-role="subseq" aria-label="Select subsequence" style="flex:1;">
            ${SUBSEQUENCES.map(s => `<option value="${s.id}">${s.label}</option>`).join('')}
          </select>
        </label>
        <label style="display:flex; align-items:center; gap:0.4rem; min-width:200px;">
          <span style="min-width:6ch; text-align:right; color: var(--text-secondary);">nₘₐₓ</span>
          <input type="range" min="30" max="200" step="10" value="${state.nMax}" data-role="nmax" aria-label="Number of terms" />
        </label>
        <div role="status" aria-live="polite" data-role="live" style="flex:1 1 220px; color: var(--text-secondary);"></div>
      </div>
      <div class="anim__canvas" data-role="plot" style="margin-top:0.75rem;"></div>
      <div class="anim__caption" style="margin-top:0.35rem; color: var(--text-secondary);">
        Bolzano–Weierstrass guarantees every bounded sequence has a convergent subsequence. Highlight subsequences and observe convergence.
      </div>
    </div>
  `;

  const sequenceSelect = containerEl.querySelector('[data-role=sequence]');
  const subseqSelect = containerEl.querySelector('[data-role=subseq]');
  const nMaxInput = containerEl.querySelector('[data-role=nmax]');
  const liveRegion = containerEl.querySelector('[data-role=live]');
  const plotMount = containerEl.querySelector('[data-role=plot]');

  if (sequenceSelect) sequenceSelect.value = state.sequenceId;
  if (subseqSelect) subseqSelect.value = state.subsequenceId;

  const Plot = (typeof window !== 'undefined' && window.Plot) ? window.Plot : null;
  if (!Plot) {
    if (plotMount) {
      plotMount.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">Plot library not loaded. Include Observable Plot to display this animation.</div>';
    }
    return { destroy() { containerEl.innerHTML = ''; } };
  }

  function clampInt(value, min, max) {
    const num = Number(value);
    if (!Number.isFinite(num)) return min;
    return Math.min(max, Math.max(min, Math.round(num)));
  }

  function buildSequenceData(sequenceId, nMax) {
    const seq = SEQUENCES.find(s => s.id === sequenceId) || SEQUENCES[0];
    const data = [];
    for (let n = 1; n <= nMax; n += 1) {
      data.push({ n, value: seq.generator(n), label: `n=${n}` });
    }
    return data;
  }

  function buildSubsequenceData(sequenceData, subsequenceId) {
    const subseq = SUBSEQUENCES.find(s => s.id === subsequenceId) || SUBSEQUENCES[0];
    const selected = sequenceData.filter(({ n }) => subseq.predicate(n));
    const limitEstimate = computeLimitEstimate(selected);
    return { selected, limitEstimate, predicateLabel: subseq.label };
  }

  function computeLimitEstimate(points) {
    if (!points.length) return null;
    const tail = points.slice(-10);
    const avg = tail.reduce((acc, { value }) => acc + value, 0) / tail.length;
    return avg;
  }

  let currentPlot = null;

  function render() {
    const sequenceData = buildSequenceData(state.sequenceId, state.nMax);
    const { selected, limitEstimate } = buildSubsequenceData(sequenceData, state.subsequenceId);

    const width = Math.min(760, Math.max(520, (plotMount?.clientWidth || 560)));
    const height = Math.round(width * 0.55);

    const marks = [
      Plot.dot(sequenceData, { x: 'n', y: 'value', r: 3.5, fill: '#94a3b8', stroke: 'white', strokeWidth: 1, opacity: 0.8 }),
      Plot.dot(selected, { x: 'n', y: 'value', r: 5, fill: '#0b7285', stroke: 'white', strokeWidth: 1.6 }),
      Plot.text(selected.slice(-5), { x: 'n', y: 'value', text: 'label', dy: -10, fill: '#0b7285', fontSize: 11, textAnchor: 'center' })
    ];

    if (Number.isFinite(limitEstimate)) {
      marks.push(Plot.ruleY([limitEstimate], { stroke: '#6f42c1', strokeWidth: 1.8, strokeDasharray: '4 3' }));
      marks.push(Plot.text([{ n: state.nMax * 0.85, label: `lim subseq ≈ ${limitEstimate.toFixed(3)}` }], {
        x: 'n',
        y: () => limitEstimate + 0.1,
        text: 'label',
        fill: '#6f42c1',
        fontSize: 12,
        textAnchor: 'start'
      }));
    }

    const plot = Plot.plot({
      width,
      height,
      style: { background: 'transparent', color: 'var(--text-secondary)' },
      x: { domain: [1, state.nMax], nice: true, grid: true, label: 'n' },
      y: { domain: [-1.2, 1.2], nice: true, grid: true, label: 'xₙ' },
      marks
    });

    if (currentPlot) {
      try { currentPlot.remove(); } catch (_) {}
    }
    if (plotMount) {
      plotMount.innerHTML = '';
      plotMount.appendChild(plot);
    }
    currentPlot = plot;

    if (liveRegion) {
      liveRegion.textContent = `Sequence ${sequenceSelect.value}; subsequence ${subseqSelect.value}; selected ${selected.length} of ${sequenceData.length} terms` +
        (limitEstimate != null ? `; subsequence limit ≈ ${limitEstimate.toFixed(3)}` : '');
    }
  }

  const onSequence = (event) => {
    state.sequenceId = event.target.value;
    render();
  };

  const onSubsequence = (event) => {
    state.subsequenceId = event.target.value;
    render();
  };

  const onNMax = () => {
    state.nMax = clampInt(nMaxInput.value, 30, 200);
    render();
  };

  sequenceSelect.addEventListener('change', onSequence);
  subseqSelect.addEventListener('change', onSubsequence);
  nMaxInput.addEventListener('input', onNMax);

  let resizeObserver = null;
  if (typeof ResizeObserver !== 'undefined' && plotMount) {
    resizeObserver = new ResizeObserver(() => render());
    resizeObserver.observe(plotMount);
  }

  render();

  return {
    destroy() {
      try {
        sequenceSelect.removeEventListener('change', onSequence);
        subseqSelect.removeEventListener('change', onSubsequence);
        nMaxInput.removeEventListener('input', onNMax);
        resizeObserver?.disconnect();
      } catch (_) {}
      containerEl.innerHTML = '';
    }
  };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch2_bolzano_subsequence'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch2_bolzano_subsequence');
      }
    } catch (e) {
      console.error('Failed to register animation ch2_bolzano_subsequence', e);
    }
  })();

  // ch2_completeness_gap.js
  (function(){
    // Chapter 2: Completeness Gap Explorer
// Visual goal: show rationals approaching sqrt(2) from below and illustrate missing supremum in Q.
// Public API: init(containerEl, options) -> { destroy }

function init(containerEl, options = {}) {
  if (!containerEl) {
    return { destroy() {} };
  }

  const defaults = {
    maxDenominator: 12,
    showUpperBounds: true
  };
  const state = {
    maxDenominator: clampInt(options.maxDenominator ?? defaults.maxDenominator, 2, 60),
    showUpperBounds: options.showUpperBounds ?? defaults.showUpperBounds
  };

  containerEl.innerHTML = `
    <div class="anim anim--plot" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; flex-wrap:wrap; gap:1rem; align-items:center; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <label style="display:flex; align-items:center; gap:0.5rem; min-width:260px;">
          <span style="min-width:10ch; text-align:right; color: var(--text-secondary);">Max denominator</span>
          <input type="range" min="2" max="60" step="1" value="${state.maxDenominator}" data-role="den" aria-label="Maximum denominator for rationals" />
          <span data-role="den-val" style="min-width:4ch; text-align:right; color: var(--text-secondary);"></span>
        </label>
        <label style="display:inline-flex; align-items:center; gap:0.4rem; color: var(--text-secondary);">
          <input type="checkbox" data-role="bounds" ${state.showUpperBounds ? 'checked' : ''} aria-label="Show candidate upper bounds" />
          <span>Show candidate upper bounds</span>
        </label>
        <div role="status" aria-live="polite" data-role="live" style="color: var(--text-secondary);"></div>
      </div>
      <div class="anim__canvas" data-role="plot" style="margin-top:0.75rem;"></div>
      <div class="anim__caption" style="margin-top:0.35rem; color: var(--text-secondary);">
        Rational approximations to $\sqrt{2}$ from below form an increasing bounded set. Completeness of $\mathbb{R}$ guarantees the supremum $\sqrt{2}$ exists.
      </div>
    </div>
  `;

  const plotMount = containerEl.querySelector('[data-role=plot]');
  const denInput = containerEl.querySelector('[data-role=den]');
  const denVal = containerEl.querySelector('[data-role=den-val]');
  const boundsInput = containerEl.querySelector('[data-role=bounds]');
  const liveRegion = containerEl.querySelector('[data-role=live]');

  const Plot = (typeof window !== 'undefined' && window.Plot) ? window.Plot : null;
  if (!Plot) {
    if (plotMount) {
      plotMount.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">Plot library not loaded. Include Observable Plot (plot.js) to render this animation.</div>';
    }
    return { destroy() { containerEl.innerHTML = ''; } };
  }

  let currentPlot = null;

  function computeRationals(maxDen) {
    const SQRT2 = Math.SQRT2;
    const seen = new Set();
    const vals = [];
    for (let q = 1; q <= maxDen; q += 1) {
      const maxNum = Math.floor(SQRT2 * q - Number.EPSILON);
      for (let p = Math.max(1, maxNum - 3); p <= maxNum; p += 1) {
        if ((p * p) < 2 * q * q) {
          const value = p / q;
          const key = `${p}/${q}`;
          if (!seen.has(key)) {
            seen.add(key);
            vals.push({ value, label: key, numerator: p, denominator: q });
          }
        }
      }
    }
    vals.sort((a, b) => a.value - b.value);
    return vals;
  }

  function computeUpperBounds(rationals) {
    if (!state.showUpperBounds || rationals.length === 0) return [];
    const SQRT2 = Math.SQRT2;
    const candidates = [];
    const last = rationals[rationals.length - 1];
    const gap = Math.max(0, SQRT2 - last.value);
    candidates.push({ label: '√2 ≈ 1.4142', value: SQRT2, style: '#6f42c1' });
    candidates.push({ label: `${last.label} + gap`, value: SQRT2 - gap / 2, style: '#f59f00' });
    return candidates;
  }

  function announce(msg) {
    if (liveRegion) liveRegion.textContent = msg;
  }

  function render() {
    const rationals = computeRationals(state.maxDenominator);
    const upperBounds = computeUpperBounds(rationals);
    const domainMin = 1.3;
    const domainMax = 1.45;

    const width = Math.min(720, Math.max(480, (plotMount?.clientWidth || 560)));
    const height = Math.round(width * 0.42);

    const marks = [
      Plot.ruleX([Math.SQRT2], { stroke: '#ef476f', strokeWidth: 2, opacity: 0.85 }),
      Plot.text([{ value: Math.SQRT2, label: '√2' }], { x: 'value', y: () => 0.9, text: 'label', dy: -8, fill: '#ef476f', fontSize: 12, textAnchor: 'start' }),
      Plot.dot(rationals, { x: 'value', y: () => 0.5, r: 5, fill: '#0b7285', stroke: 'white', strokeWidth: 1.4, title: d => `${d.label} = ${d.value.toFixed(5)}` }),
      Plot.text(rationals.slice(-3), { x: 'value', y: () => 0.62, text: d => d.label, fill: 'var(--text-secondary)', fontSize: 11, textAnchor: 'middle' })
    ];

    if (upperBounds.length > 0) {
      marks.push(Plot.dot(upperBounds, { x: 'value', y: () => 0.2, r: 5, fill: d => d.style, stroke: 'white', strokeWidth: 1.4, title: d => d.label }));
      marks.push(Plot.text(upperBounds, { x: 'value', y: () => 0.08, text: d => d.label, fill: d => d.style, fontSize: 11, textAnchor: 'middle' }));
    }

    const plot = Plot.plot({
      width,
      height,
      style: { background: 'transparent', color: 'var(--text-secondary)' },
      x: {
        domain: [domainMin, domainMax],
        grid: true,
        label: 'value'
      },
      y: {
        axis: null,
        domain: [0, 1],
        inset: 10
      },
      marks
    });

    if (currentPlot) {
      try { currentPlot.remove(); } catch (_) {}
    }
    if (plotMount) {
      plotMount.innerHTML = '';
      plotMount.appendChild(plot);
    }
    currentPlot = plot;

    const last = rationals[rationals.length - 1];
    announce(`Displaying ${rationals.length} rationals with denominators ≤ ${state.maxDenominator}. Best: ${last ? `${last.label} ≈ ${last.value.toFixed(5)}` : 'n/a'}`);
    if (denVal) denVal.textContent = String(state.maxDenominator);
  }

  function clampInt(v, min, max) {
    const n = Math.round(Number(v));
    return Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));
  }

  const onDenChange = () => {
    state.maxDenominator = clampInt(denInput.value, 2, 60);
    render();
  };
  const onBoundsChange = () => {
    state.showUpperBounds = !!boundsInput.checked;
    render();
  };

  denInput.addEventListener('input', onDenChange);
  boundsInput.addEventListener('change', onBoundsChange);

  let resizeObserver = null;
  if (typeof ResizeObserver !== 'undefined' && plotMount) {
    resizeObserver = new ResizeObserver(() => render());
    resizeObserver.observe(plotMount);
  }

  render();

  return {
    destroy() {
      try {
        denInput.removeEventListener('input', onDenChange);
        boundsInput.removeEventListener('change', onBoundsChange);
        resizeObserver?.disconnect();
      } catch (_) {}
      containerEl.innerHTML = '';
    }
  };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch2_completeness_gap'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch2_completeness_gap');
      }
    } catch (e) {
      console.error('Failed to register animation ch2_completeness_gap', e);
    }
  })();

  // ch2_epsilon_band.js
  (function(){
    // Chapter 2: ε–N Convergence Sandbox
// Public API: init(containerEl, options) -> { destroy }
// Visual goal: illustrate ε–N definition with adjustable parameters and sequences.

function init(containerEl, options = {}) {
  if (!containerEl) {
    return { destroy() {} };
  }

  const defaults = {
    epsilon: 0.2,
    sequenceType: 'oneOverN',
    L: 0,
    C: 1,
    p: 1,
    nMax: 60
  };

  const state = {
    epsilon: clampNumber(options.epsilon ?? defaults.epsilon, 0.01, 5),
    sequenceType: options.sequenceType || defaults.sequenceType,
    L: clampNumber(options.L ?? defaults.L, -200, 200),
    C: clampNumber(options.C ?? defaults.C, 0.01, 500),
    p: clampNumber(options.p ?? defaults.p, 0.2, 3),
    nMax: clampInt(options.nMax ?? defaults.nMax, 20, 200),
    showBeyondNOnly: false,
    playing: false,
    currentN: 1,
    speed: 1
  };

  let playTimer = null;

  containerEl.innerHTML = `
    <div class="anim anim--plot" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; flex-wrap:wrap; gap:1rem; align-items:center; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <label style="display:flex; align-items:center; gap:0.4rem; min-width:230px;">
          <span style="min-width:9ch; text-align:right; color: var(--text-secondary);">ε</span>
          <input type="range" min="0.05" max="2.5" step="0.05" value="${state.epsilon}" data-role="epsilon" aria-label="Epsilon" />
          <span data-role="epsilon-val" style="min-width:5ch; text-align:right; color: var(--text-secondary);"></span>
        </label>
        <label style="display:flex; align-items:center; gap:0.4rem; min-width:240px;">
          <span style="min-width:9ch; text-align:right; color: var(--text-secondary);">Sequence</span>
          <select data-role="sequence" aria-label="Choose sequence" style="flex:1;">
            <option value="oneOverN">1/n → 0</option>
            <option value="steady">100 + 50/n → 100</option>
            <option value="custom">L + C/nᵖ</option>
          </select>
        </label>
        <label style="display:flex; align-items:center; gap:0.3rem; min-width:160px;">
          <span style="min-width:2ch; text-align:right; color: var(--text-secondary);">L</span>
          <input type="number" step="0.5" data-role="L" value="${state.L}" aria-label="Limit L" style="width:6rem;" />
        </label>
        <label style="display:flex; align-items:center; gap:0.3rem; min-width:160px;">
          <span style="min-width:2ch; text-align:right; color: var (--text-secondary);">C</span>
          <input type="number" step="0.5" data-role="C" value="${state.C}" aria-label="Constant C" style="width:6rem;" />
        </label>
        <label style="display:flex; align-items:center; gap:0.3rem; min-width:160px;">
          <span style="min-width:2ch; text-align:right; color: var(--text-secondary);">p</span>
          <input type="number" step="0.1" data-role="p" value="${state.p}" aria-label="Exponent p" style="width:5rem;" />
        </label>
        <label style="display:flex; align-items:center; gap:0.3rem; min-width:200px;">
          <span style="min-width:5ch; text-align:right; color: var(--text-secondary);">nₘₐₓ</span>
          <input type="range" min="20" max="200" step="10" value="${state.nMax}" data-role="nmax" aria-label="Maximum n" />
        </label>
        <div style="display:inline-flex; align-items:center; gap:0.5rem;">
          <button type="button" data-role="play" class="anim__btn">▶︎</button>
          <label style="display:flex; align-items:center; gap:0.3rem; color: var(--text-secondary);">
            <span>Speed</span>
            <input type="range" min="0.25" max="3" step="0.25" value="${state.speed}" data-role="speed" aria-label="Playback speed" />
          </label>
        </div>
        <label style="display:inline-flex; align-items:center; gap:0.4rem; color: var(--text-secondary);">
          <input type="checkbox" data-role="beyond" aria-label="Show only n > N" />
          <span>Show only n > N</span>
        </label>
        <div role="status" aria-live="polite" data-role="live" style="flex:1 1 220px; color: var(--text-secondary);"></div>
      </div>
      <div class="anim__canvas" data-role="plot" style="margin-top:0.75rem;"></div>
      <div class="anim__caption" style="margin-top:0.35rem; color: var(--text-secondary);">
        Drag ε to tighten the band. Choose a sequence to see how N = ceil(C / ε) shifts and which terms eventually stay within the band.
      </div>
    </div>
  `;

  const plotMount = containerEl.querySelector('[data-role=plot]');
  const epsilonInput = containerEl.querySelector('[data-role=epsilon]');
  const epsilonVal = containerEl.querySelector('[data-role=epsilon-val]');
  const sequenceSelect = containerEl.querySelector('[data-role=sequence]');
  const LInput = containerEl.querySelector('[data-role=L]');
  const CInput = containerEl.querySelector('[data-role=C]');
  const pInput = containerEl.querySelector('[data-role=p]');
  const nMaxInput = containerEl.querySelector('[data-role=nmax]');
  const playBtn = containerEl.querySelector('[data-role=play]');
  const speedInput = containerEl.querySelector('[data-role=speed]');
  const beyondInput = containerEl.querySelector('[data-role=beyond]');
  const liveRegion = containerEl.querySelector('[data-role=live]');

  const Plot = (typeof window !== 'undefined' && window.Plot) ? window.Plot : null;
  if (!Plot) {
    if (plotMount) {
      plotMount.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">Plot library not loaded. Include Observable Plot to render this animation.</div>';
    }
    return { destroy() { containerEl.innerHTML = ''; } };
  }

  function clampNumber(value, min, max) {
    const num = Number(value);
    if (!Number.isFinite(num)) return min;
    return Math.min(max, Math.max(min, num));
  }

  function clampInt(value, min, max) {
    return Math.round(clampNumber(value, min, max));
  }

  function ensureSequenceParams() {
    if (state.sequenceType === 'oneOverN') {
      state.L = 0;
      state.C = 1;
      state.p = 1;
    } else if (state.sequenceType === 'steady') {
      state.L = 100;
      state.C = 50;
      state.p = 1;
    }
    if (state.sequenceType !== 'custom') {
      LInput?.setAttribute('disabled', 'true');
      CInput?.setAttribute('disabled', 'true');
      pInput?.setAttribute('disabled', 'true');
    } else {
      LInput?.removeAttribute('disabled');
      CInput?.removeAttribute('disabled');
      pInput?.removeAttribute('disabled');
    }
    LInput.value = state.L;
    CInput.value = state.C;
    pInput.value = state.p;
  }

  function computeSequence() {
    const items = [];
    for (let n = 1; n <= state.nMax; n += 1) {
      const value = state.L + state.C / Math.pow(n, state.p);
      items.push({ n, value });
    }
    return items;
  }

  function computeN() {
    if (state.C <= 0 || state.epsilon <= 0) return Infinity;
    return Math.ceil(state.C / Math.pow(state.epsilon, 1 / state.p));
  }

  let currentPlot = null;

  function render() {
    const seq = computeSequence();
    const N = computeN();
    state.currentN = Math.min(state.currentN, state.nMax);

    const filteredSeq = state.showBeyondNOnly ? seq.filter(({ n }) => n > N) : seq;

    const width = Math.min(760, Math.max(520, (plotMount?.clientWidth || 560)));
    const height = Math.round(width * 0.55);

    const bandTop = state.L + state.epsilon;
    const bandBottom = state.L - state.epsilon;

    const marks = [
      Plot.areaY([
        { n: 1, top: bandTop, bottom: bandBottom },
        { n: state.nMax, top: bandTop, bottom: bandBottom }
      ], {
        x: 'n',
        y: 'top',
        y1: 'bottom',
        fill: 'rgba(111, 66, 193, 0.15)',
        stroke: 'rgba(111, 66, 193, 0.5)',
        strokeWidth: 1.2
      }),
      Plot.ruleY([state.L], { stroke: '#6f42c1', strokeWidth: 2 }),
      Plot.lineY(seq, { x: 'n', y: 'value', stroke: '#0b7285', strokeWidth: 2, opacity: 0.65 })
    ];

    const inside = filteredSeq.filter(({ value, n }) => Math.abs(value - state.L) < state.epsilon && n > N);
    const outside = filteredSeq.filter(({ value }) => Math.abs(value - state.L) >= state.epsilon);

    marks.push(Plot.dot(outside, { x: 'n', y: 'value', r: 4, fill: '#ef476f', stroke: 'white', strokeWidth: 1.4 }));
    marks.push(Plot.dot(inside, { x: 'n', y: 'value', r: 4, fill: '#2b8a3e', stroke: 'white', strokeWidth: 1.4 }));

    const currentPoint = seq.find(({ n }) => n === state.currentN);
    if (currentPoint) {
      marks.push(Plot.dot([currentPoint], { x: 'n', y: 'value', r: 6, fill: '#1f2937', stroke: 'white', strokeWidth: 2 }));
      marks.push(Plot.text([{ n: currentPoint.n, label: `n=${currentPoint.n}` }], { x: 'n', y: () => bandTop + 0.2, text: 'label', fill: '#1f2937', fontSize: 11, textAnchor: 'middle' }));
    }

    if (Number.isFinite(N)) {
      marks.push(Plot.ruleX([N], { stroke: '#f59f00', strokeDasharray: '4 3', strokeWidth: 1.6 }));
      marks.push(Plot.text([{ n: N, label: `N = ${N}` }], { x: 'n', y: () => bandBottom - 0.3, text: 'label', fill: '#f59f00', fontSize: 11, textAnchor: 'middle' }));
    }

    const plot = Plot.plot({
      width,
      height,
      style: { background: 'transparent', color: 'var(--text-secondary)' },
      x: { domain: [1, state.nMax], nice: true, label: 'n', grid: true },
      y: { nice: true, grid: true, label: 'xₙ' },
      marks
    });

    if (currentPlot) {
      try { currentPlot.remove(); } catch (_) {}
    }
    if (plotMount) {
      plotMount.innerHTML = '';
      plotMount.appendChild(plot);
    }
    currentPlot = plot;

    if (epsilonVal) epsilonVal.textContent = state.epsilon.toFixed(2);
    const insideCount = seq.filter(({ value, n }) => Math.abs(value - state.L) < state.epsilon && n > N).length;
    liveRegion.textContent = `ε = ${state.epsilon.toFixed(2)} · Limit L = ${state.L.toFixed(2)} · N = ${Number.isFinite(N) ? N : '∞'} · ${insideCount} terms with n > N stay inside the band.`;
  }

  function stopPlaying() {
    state.playing = false;
    playBtn.textContent = '▶︎';
    if (playTimer) {
      clearInterval(playTimer);
      playTimer = null;
    }
  }

  function startPlaying() {
    stopPlaying();
    state.playing = true;
    playBtn.textContent = '⏸';
    const interval = Math.max(80, 320 / state.speed);
    playTimer = setInterval(() => {
      state.currentN = state.currentN >= state.nMax ? 1 : state.currentN + 1;
      render();
    }, interval);
  }

  function togglePlay() {
    if (state.playing) {
      stopPlaying();
    } else {
      startPlaying();
    }
  }

  const onEpsilon = () => {
    state.epsilon = clampNumber(epsilonInput.value, 0.05, 2.5);
    render();
  };

  const onSequence = (event) => {
    state.sequenceType = event.target.value;
    ensureSequenceParams();
    render();
  };

  const onL = () => {
    state.L = clampNumber(LInput.value, -200, 200);
    render();
  };

  const onC = () => {
    state.C = clampNumber(CInput.value, 0.01, 500);
    render();
  };

  const onP = () => {
    state.p = clampNumber(pInput.value, 0.2, 3);
    render();
  };

  const onNMax = () => {
    state.nMax = clampInt(nMaxInput.value, 20, 200);
    state.currentN = Math.min(state.currentN, state.nMax);
    render();
  };

  const onPlay = () => togglePlay();

  const onSpeed = () => {
    state.speed = clampNumber(speedInput.value, 0.25, 3);
    if (state.playing) startPlaying();
  };

  const onBeyond = (event) => {
    state.showBeyondNOnly = !!event.target.checked;
    render();
  };

  epsilonInput.addEventListener('input', onEpsilon);
  sequenceSelect.addEventListener('change', onSequence);
  LInput.addEventListener('change', onL);
  CInput.addEventListener('change', onC);
  pInput.addEventListener('change', onP);
  nMaxInput.addEventListener('input', onNMax);
  playBtn.addEventListener('click', onPlay);
  speedInput.addEventListener('input', onSpeed);
  beyondInput.addEventListener('change', onBeyond);

  let resizeObserver = null;
  if (typeof ResizeObserver !== 'undefined' && plotMount) {
    resizeObserver = new ResizeObserver(() => render());
    resizeObserver.observe(plotMount);
  }

  ensureSequenceParams();
  render();

  return {
    destroy() {
      stopPlaying();
      try {
        epsilonInput.removeEventListener('input', onEpsilon);
        sequenceSelect.removeEventListener('change', onSequence);
        LInput.removeEventListener('change', onL);
        CInput.removeEventListener('change', onC);
        pInput.removeEventListener('change', onP);
        nMaxInput.removeEventListener('input', onNMax);
        playBtn.removeEventListener('click', onPlay);
        speedInput.removeEventListener('input', onSpeed);
        beyondInput.removeEventListener('change', onBeyond);
        resizeObserver?.disconnect();
      } catch (_) {}
      containerEl.innerHTML = '';
    }
  };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch2_epsilon_band'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch2_epsilon_band');
      }
    } catch (e) {
      console.error('Failed to register animation ch2_epsilon_band', e);
    }
  })();

  // ch2_function_mapping.js
  (function(){
    // Chapter 2: Function Mapping Sandbox
// Visual goal: explore injectivity/surjectivity for f(x) = x^2 under different domain/codomain choices.
// Public API: init(containerEl, options) -> { destroy }

function init(containerEl, options = {}) {
  if (!containerEl) {
    return { destroy() {} };
  }

  const DOMAIN_CONFIGS = [
    { id: 'all_reals', label: 'Domain: ℝ', min: -3, max: 3 },
    { id: 'nonnegative', label: 'Domain: [0, ∞)', min: 0, max: 3 },
    { id: 'zero_two', label: 'Domain: [0, 2]', min: 0, max: 2 },
    { id: 'neg_two_two', label: 'Domain: [-2, 2]', min: -2, max: 2 }
  ];

  const CODOMAIN_CONFIGS = [
    { id: 'all_reals', label: 'Codomain: ℝ', min: -3, max: 6 },
    { id: 'nonnegative', label: 'Codomain: [0, ∞)', min: 0, max: 6 }
  ];

  const state = {
    domain: options.initialDomain && DOMAIN_CONFIGS.some(d => d.id === options.initialDomain)
      ? options.initialDomain : 'all_reals',
    codomain: options.initialCodomain && CODOMAIN_CONFIGS.some(c => c.id === options.initialCodomain)
      ? options.initialCodomain : 'all_reals',
    showInverse: !!options.showInverse
  };

  containerEl.innerHTML = `
    <div class="anim anim--plot" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; flex-wrap:wrap; gap:1rem; align-items:center; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <label style="display:flex; align-items:center; gap:0.5rem; min-width:240px;">
          <span style="min-width:11ch; text-align:right; color: var(--text-secondary);">Domain</span>
          <select data-role="domain" aria-label="Select domain" style="flex:1;">
            ${DOMAIN_CONFIGS.map(d => `<option value="${d.id}">${d.label}</option>`).join('')}
          </select>
        </label>
        <label style="display:flex; align-items:center; gap:0.5rem; min-width:240px;">
          <span style="min-width:11ch; text-align:right; color: var(--text-secondary);">Codomain</span>
          <select data-role="codomain" aria-label="Select codomain" style="flex:1;">
            ${CODOMAIN_CONFIGS.map(c => `<option value="${c.id}">${c.label}</option>`).join('')}
          </select>
        </label>
        <label style="display:inline-flex; align-items:center; gap:0.4rem; color: var(--text-secondary);">
          <input type="checkbox" data-role="inverse" ${state.showInverse ? 'checked' : ''} aria-label="Show inverse mapping" />
          <span>Show inverse overlay</span>
        </label>
        <div data-role="badges" style="display:flex; flex-wrap:wrap; gap:0.75rem; color: var(--text-secondary);"></div>
        <div role="status" aria-live="polite" data-role="live" style="flex:1 1 200px; color: var(--text-secondary);"></div>
      </div>
      <div class="anim__canvas" data-role="plot" style="margin-top:0.75rem;"></div>
      <div class="anim__caption" style="margin-top:0.35rem; color: var(--text-secondary);">
        Changing domain or codomain affects injectivity and surjectivity for $f(x)=x^2$. Try toggling settings to see when an inverse exists.
      </div>
    </div>
  `;

  const domainSelect = containerEl.querySelector('[data-role=domain]');
  const codomainSelect = containerEl.querySelector('[data-role=codomain]');
  const inverseInput = containerEl.querySelector('[data-role=inverse]');
  const badgesEl = containerEl.querySelector('[data-role=badges]');
  const liveRegion = containerEl.querySelector('[data-role=live]');
  const plotMount = containerEl.querySelector('[data-role=plot]');

  if (domainSelect) domainSelect.value = state.domain;
  if (codomainSelect) codomainSelect.value = state.codomain;

  const Plot = (typeof window !== 'undefined' && window.Plot) ? window.Plot : null;
  if (!Plot) {
    if (plotMount) {
      plotMount.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">Plot library not loaded. Include Observable Plot (plot.js) to render this animation.</div>';
    }
    return { destroy() { containerEl.innerHTML = ''; } };
  }

  function getDomainConfig(id) {
    return DOMAIN_CONFIGS.find(d => d.id === id) || DOMAIN_CONFIGS[0];
  }

  function getCodomainConfig(id) {
    return CODOMAIN_CONFIGS.find(c => c.id === id) || CODOMAIN_CONFIGS[0];
  }

  function isInjective(domainConfig) {
    return domainConfig.min >= 0; // f(x)=x^2 is injective only when domain excludes negatives
  }

  function isSurjective(domainConfig, codomainConfig) {
    if (codomainConfig.min < 0) return false;
    // Range over domain is [domainMin^2, domainMax^2]
    const rangeMin = Math.min(domainConfig.min ** 2, domainConfig.max ** 2);
    const rangeMax = Math.max(domainConfig.min ** 2, domainConfig.max ** 2);
    return rangeMin <= codomainConfig.min && rangeMax >= codomainConfig.max;
  }

  function buildSamples(domainConfig, steps = 160) {
    const samples = [];
    for (let i = 0; i <= steps; i += 1) {
      const x = domainConfig.min + (domainConfig.max - domainConfig.min) * (i / steps);
      samples.push({ x, y: x * x });
    }
    return samples;
  }

  function detectDuplicates(samples) {
    const map = new Map();
    const duplicates = [];
    samples.forEach(sample => {
      const key = sample.y.toFixed(4);
      if (map.has(key)) {
        duplicates.push(sample, map.get(key));
      } else {
        map.set(key, sample);
      }
    });
    return duplicates;
  }

  function renderBadges(injective, surjective) {
    if (!badgesEl) return;
    const items = [
      { label: 'Injective?', value: injective ? 'Yes' : 'No', style: injective ? '#2b8a3e' : '#c92a2a' },
      { label: 'Surjective?', value: surjective ? 'Yes' : 'No', style: surjective ? '#2b8a3e' : '#c92a2a' },
      { label: 'Bijective?', value: injective && surjective ? 'Yes' : 'No', style: (injective && surjective) ? '#2b8a3e' : '#c92a2a' }
    ];
    badgesEl.innerHTML = items.map(item => `
      <span style="display:inline-flex; align-items:center; gap:0.35rem; padding:0.35rem 0.55rem; border-radius:0.5rem; background:rgba(148, 163, 184, 0.16);">
        <strong style="font-weight:600; color: var(--text-secondary);">${item.label}</strong>
        <span style="color:${item.style}; font-weight:600;">${item.value}</span>
      </span>
    `).join('');
  }

  let currentPlot = null;

  function render() {
    const domain = getDomainConfig(state.domain);
    const codomain = getCodomainConfig(state.codomain);
    const samples = buildSamples(domain);
    const duplicates = detectDuplicates(samples);
    const injective = isInjective(domain);
    const surjective = isSurjective(domain, codomain);

    const width = Math.min(720, Math.max(480, (plotMount?.clientWidth || 560)));
    const height = Math.round(width * 0.6);

    const marks = [
      Plot.areaY(samples, { x: 'x', y: () => codomain.max, y1: () => codomain.min, fill: 'rgba(148,163,184,0.12)', stroke: 'none' }),
      Plot.line(samples, { x: 'x', y: 'y', stroke: '#0b7285', strokeWidth: 2.2 }),
      Plot.dot(samples, { x: 'x', y: 'y', r: 3, fill: '#1f2937', stroke: 'white', strokeWidth: 1 })
    ];

    if (duplicates.length > 0 && !injective) {
      marks.push(Plot.dot(duplicates, { x: 'x', y: 'y', r: 6, fill: '#f59f00', stroke: 'white', strokeWidth: 1.5 }));
      marks.push(Plot.text(duplicates.slice(0, 2), { x: 'x', y: 'y', text: d => `(${d.x.toFixed(1)}, ${d.y.toFixed(1)})`, dy: -12, fill: '#f59f00', fontSize: 11 }));
    }

    if (state.showInverse && injective) {
      const inverseSamples = samples.map(({ x, y }) => ({ x: y, y: x }));
      marks.push(Plot.line(inverseSamples, { x: 'x', y: 'y', stroke: '#6f42c1', strokeWidth: 2, strokeDasharray: '4 3' }));
      marks.push(Plot.text([{ x: codomain.max * 0.8, y: Math.sqrt(codomain.max), label: 'Inverse f⁻¹(y)=√y' }], {
        x: 'x',
        y: 'y',
        text: 'label',
        fill: '#6f42c1',
        fontSize: 12,
        textAnchor: 'start'
      }));
    }

    const plot = Plot.plot({
      width,
      height,
      style: { background: 'transparent', color: 'var(--text-secondary)' },
      x: {
        domain: [domain.min - 0.5, domain.max + 0.5],
        grid: true,
        label: 'x (input)'
      },
      y: {
        domain: [codomain.min - 0.5, Math.max(codomain.max + 0.5, (domain.max ** 2) + 0.5)],
        grid: true,
        label: 'f(x) = x²'
      },
      marks
    });

    if (currentPlot) {
      try { currentPlot.remove(); } catch (_) {}
    }
    if (plotMount) {
      plotMount.innerHTML = '';
      plotMount.appendChild(plot);
    }
    currentPlot = plot;

    renderBadges(injective, surjective);
    if (liveRegion) {
      const summary = [
        `Domain ${domain.label}`,
        `Codomain ${codomain.label}`,
        injective ? 'Injective' : 'Not injective',
        surjective ? 'Surjective' : 'Not surjective'
      ].join(' · ');
      liveRegion.textContent = summary;
    }
  }

  const onDomainChange = (event) => {
    state.domain = event.target.value;
    render();
  };

  const onCodomainChange = (event) => {
    state.codomain = event.target.value;
    render();
  };

  const onInverseToggle = (event) => {
    state.showInverse = !!event.target.checked;
    render();
  };

  domainSelect?.addEventListener('change', onDomainChange);
  codomainSelect?.addEventListener('change', onCodomainChange);
  inverseInput?.addEventListener('change', onInverseToggle);

  let resizeObserver = null;
  if (typeof ResizeObserver !== 'undefined' && plotMount) {
    resizeObserver = new ResizeObserver(() => render());
    resizeObserver.observe(plotMount);
  }

  render();

  return {
    destroy() {
      try {
        domainSelect?.removeEventListener('change', onDomainChange);
        codomainSelect?.removeEventListener('change', onCodomainChange);
        inverseInput?.removeEventListener('change', onInverseToggle);
        resizeObserver?.disconnect();
      } catch (_) {}
      containerEl.innerHTML = '';
    }
  };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch2_function_mapping'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch2_function_mapping');
      }
    } catch (e) {
      console.error('Failed to register animation ch2_function_mapping', e);
    }
  })();

  // ch2_metric_open_ball.js
  (function(){
    // Chapter 2: Metric Open Ball Playground
// Public API: init(containerEl, options) -> { destroy }
// Visual goal: illustrate open balls under Euclidean vs Manhattan metrics in ℝ².

function init(containerEl, options = {}) {
  if (!containerEl) {
    return { destroy() {} };
  }

  const defaults = {
    centerX: 1,
    centerY: 1,
    radius: 1.2,
    metric: 'euclidean'
  };

  const state = {
    centerX: clampNumber(options.centerX ?? defaults.centerX, -3, 3),
    centerY: clampNumber(options.centerY ?? defaults.centerY, -3, 3),
    radius: clampNumber(options.radius ?? defaults.radius, 0.2, 3),
    metric: options.metric === 'manhattan' ? 'manhattan' : defaults.metric
  };

  containerEl.innerHTML = `
    <div class="anim anim--plot" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; flex-wrap:wrap; gap:1rem; align-items:center; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <label style="display:flex; align-items:center; gap:0.5rem; min-width:210px;">
          <span style="min-width:8ch; text-align:right; color: var(--text-secondary);">Center x₀</span>
          <input type="range" min="-3" max="3" step="0.1" value="${state.centerX}" data-role="cx" aria-label="Center x coordinate" />
        </label>
        <label style="display:flex; align-items:center; gap:0.5rem; min-width:210px;">
          <span style="min-width:8ch; text-align:right; color: var(--text-secondary);">Center y₀</span>
          <input type="range" min="-3" max="3" step="0.1" value="${state.centerY}" data-role="cy" aria-label="Center y coordinate" />
        </label>
        <label style="display:flex; align-items:center; gap:0.5rem; min-width:210px;">
          <span style="min-width:8ch; text-align:right; color: var(--text-secondary);">Radius r</span>
          <input type="range" min="0.2" max="3" step="0.1" value="${state.radius}" data-role="r" aria-label="Radius" />
        </label>
        <label style="display:inline-flex; align-items:center; gap:0.4rem; color: var(--text-secondary);">
          <select data-role="metric" aria-label="Choose metric" style="min-width:160px;">
            <option value="euclidean" ${state.metric === 'euclidean' ? 'selected' : ''}>Euclidean</option>
            <option value="manhattan" ${state.metric === 'manhattan' ? 'selected' : ''}>Manhattan</option>
          </select>
        </label>
        <div role="status" aria-live="polite" data-role="live" style="flex:1 1 200px; color: var(--text-secondary);"></div>
      </div>
      <div class="anim__canvas" data-role="plot" style="margin-top:0.75rem;"></div>
      <div class="anim__caption" style="margin-top:0.35rem; color: var(--text-secondary);">
        Open ball $B((x₀,y₀), r)$ contains all points with distance less than $r$ from the center. Try Euclidean vs Manhattan metrics.
      </div>
    </div>
  `;

  const plotMount = containerEl.querySelector('[data-role=plot]');
  const cxInput = containerEl.querySelector('[data-role=cx]');
  const cyInput = containerEl.querySelector('[data-role=cy]');
  const rInput = containerEl.querySelector('[data-role=r]');
  const metricSelect = containerEl.querySelector('[data-role=metric]');
  const liveRegion = containerEl.querySelector('[data-role=live]');

  const Plot = (typeof window !== 'undefined' && window.Plot) ? window.Plot : null;
  if (!Plot) {
    if (plotMount) {
      plotMount.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">Plot library not loaded. Include Observable Plot to display this animation.</div>';
    }
    return { destroy() { containerEl.innerHTML = ''; } };
  }

  const SAMPLE_POINTS = generateSamplePoints(121);
  let currentPlot = null;

  function clampNumber(value, min, max) {
    const num = Number(value);
    if (!Number.isFinite(num)) return min;
    return Math.min(max, Math.max(min, num));
  }

  function generateSamplePoints(count) {
    const points = [];
    const grid = Math.ceil(Math.sqrt(count));
    for (let i = 0; i < grid; i += 1) {
      for (let j = 0; j < grid; j += 1) {
        points.push({
          x: -3 + (6 * i) / (grid - 1),
          y: -3 + (6 * j) / (grid - 1)
        });
      }
    }
    return points;
  }

  function distance(point, center, metric) {
    if (metric === 'manhattan') {
      return Math.abs(point.x - center.x) + Math.abs(point.y - center.y);
    }
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    return Math.hypot(dx, dy);
  }

  function buildBallOutline(center, radius, metric, steps = 240) {
    const outline = [];
    if (metric === 'manhattan') {
      // Diamond shape: |x - cx| + |y - cy| = r
      const dirs = [
        { x: radius, y: 0 },
        { x: 0, y: radius },
        { x: -radius, y: 0 },
        { x: 0, y: -radius }
      ];
      for (let i = 0; i < dirs.length; i += 1) {
        const start = dirs[i];
        const end = dirs[(i + 1) % dirs.length];
        for (let t = 0; t <= steps / dirs.length; t += 1) {
          const alpha = t / (steps / dirs.length);
          outline.push({
            x: center.x + start.x + alpha * (end.x - start.x),
            y: center.y + start.y + alpha * (end.y - start.y)
          });
        }
      }
    } else {
      for (let i = 0; i <= steps; i += 1) {
        const theta = (i / steps) * 2 * Math.PI;
        outline.push({
          x: center.x + radius * Math.cos(theta),
          y: center.y + radius * Math.sin(theta)
        });
      }
    }
    return outline;
  }

  function render() {
    const center = { x: state.centerX, y: state.centerY };
    const radius = state.radius;
    const metric = state.metric;

    const classified = SAMPLE_POINTS.map(point => ({
      ...point,
      inside: distance(point, center, metric) < radius - 1e-6,
      dist: distance(point, center, metric)
    }));

    const outline = buildBallOutline(center, radius, metric);

    const width = Math.min(720, Math.max(480, (plotMount?.clientWidth || 560)));
    const height = Math.round(width * 0.65);

    const marks = [
      Plot.rect(classified, {
        x1: d => d.x - 0.12,
        x2: d => d.x + 0.12,
        y1: d => d.y - 0.12,
        y2: d => d.y + 0.12,
        fill: d => (d.inside ? 'rgba(43,138,62,0.55)' : 'rgba(229,231,235,0.4)'),
        stroke: d => (d.inside ? '#2b8a3e' : '#94a3b8'),
        strokeWidth: 0.8
      }),
      Plot.dot([center], { x: 'x', y: 'y', r: 5.5, fill: '#1f2937', stroke: 'white', strokeWidth: 1.5 }),
      Plot.line(outline, { x: 'x', y: 'y', stroke: '#0b7285', strokeWidth: 2.4, strokeDasharray: metric === 'manhattan' ? '5 4' : null })
    ];

    const plot = Plot.plot({
      width,
      height,
      style: { background: 'transparent', color: 'var(--text-secondary)' },
      grid: true,
      x: { domain: [-3.2, 3.2], label: 'x' },
      y: { domain: [-3.2, 3.2], label: 'y' },
      marks
    });

    if (currentPlot) {
      try { currentPlot.remove(); } catch (_) {}
    }
    if (plotMount) {
      plotMount.innerHTML = '';
      plotMount.appendChild(plot);
    }
    currentPlot = plot;

    const insideCount = classified.filter(d => d.inside).length;
    if (liveRegion) {
      liveRegion.textContent = `${insideCount} / ${classified.length} sample points lie inside B((x₀,y₀), r) with ${metric} metric.`;
    }
  }

  const onCx = () => { state.centerX = clampNumber(cxInput.value, -3, 3); render(); };
  const onCy = () => { state.centerY = clampNumber(cyInput.value, -3, 3); render(); };
  const onR = () => { state.radius = clampNumber(rInput.value, 0.2, 3); render(); };
  const onMetric = () => { state.metric = metricSelect.value === 'manhattan' ? 'manhattan' : 'euclidean'; render(); };

  cxInput.addEventListener('input', onCx);
  cyInput.addEventListener('input', onCy);
  rInput.addEventListener('input', onR);
  metricSelect.addEventListener('change', onMetric);

  let resizeObserver = null;
  if (typeof ResizeObserver !== 'undefined' && plotMount) {
    resizeObserver = new ResizeObserver(() => render());
    resizeObserver.observe(plotMount);
  }

  render();

  return {
    destroy() {
      try {
        cxInput.removeEventListener('input', onCx);
        cyInput.removeEventListener('input', onCy);
        rInput.removeEventListener('input', onR);
        metricSelect.removeEventListener('change', onMetric);
        resizeObserver?.disconnect();
      } catch (_) {}
      containerEl.innerHTML = '';
    }
  };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch2_metric_open_ball'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch2_metric_open_ball');
      }
    } catch (e) {
      console.error('Failed to register animation ch2_metric_open_ball', e);
    }
  })();

  // ch2_monotone_convergence.js
  (function(){
    // Chapter 2: Monotone Convergence Builder
// Public API: init(containerEl, options) -> { destroy }
// Visual goal: construct bounded monotone sequences and show convergence to the supremum/infimum.

function init(containerEl, options = {}) {
  if (!containerEl) {
    return { destroy() {} };
  }

  const defaults = {
    direction: 'increasing',
    limit: 1,
    startGap: 2,
    contraction: 0.7,
    nMax: 40
  };

  const state = {
    direction: options.direction === 'decreasing' ? 'decreasing' : defaults.direction,
    limit: clampNumber(options.limit ?? defaults.limit, -10, 10),
    startGap: clampNumber(options.startGap ?? defaults.startGap, 0.1, 10),
    contraction: clampNumber(options.contraction ?? defaults.contraction, 0.1, 0.95),
    nMax: clampInt(options.nMax ?? defaults.nMax, 10, 120)
  };

  containerEl.innerHTML = `
    <div class="anim anim--plot" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; flex-wrap:wrap; gap:1rem; align-items:center; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <label style="display:flex; align-items:center; gap:0.5rem; min-width:220px;">
          <span style="min-width:9ch; text-align:right; color: var(--text-secondary);">Direction</span>
          <select data-role="direction" aria-label="Sequence direction" style="flex:1;">
            <option value="increasing" ${state.direction === 'increasing' ? 'selected' : ''}>Increasing</option>
            <option value="decreasing" ${state.direction === 'decreasing' ? 'selected' : ''}>Decreasing</option>
          </select>
        </label>
        <label style="display:flex; align-items:center; gap:0.4rem; min-width:200px;">
          <span style="min-width:6ch; text-align:right; color: var(--text-secondary);">Limit L</span>
          <input type="number" step="0.2" value="${state.limit}" data-role="limit" aria-label="Limit L" style="width:6rem;" />
        </label>
        <label style="display:flex; align-items:center; gap:0.4rem; min-width:210px;">
          <span style="min-width:7ch; text-align:right; color: var(--text-secondary);">Start gap</span>
          <input type="range" min="0.1" max="10" step="0.1" value="${state.startGap}" data-role="gap" aria-label="Starting gap" />
        </label>
        <label style="display:flex; align-items:center; gap:0.4rem; min-width:210px;">
          <span style="min-width:7ch; text-align:right; color: var(--text-secondary);">Contraction</span>
          <input type="range" min="0.1" max="0.95" step="0.05" value="${state.contraction}" data-role="contraction" aria-label="Contraction factor" />
        </label>
        <label style="display:flex; align-items:center; gap:0.4rem; min-width:200px;">
          <span style="min-width:5ch; text-align:right; color: var(--text-secondary);">nₘₐₓ</span>
          <input type="range" min="10" max="120" step="10" value="${state.nMax}" data-role="nmax" aria-label="Number of terms" />
        </label>
        <div role="status" aria-live="polite" data-role="live" style="flex:1 1 220px; color: var(--text-secondary);"></div>
      </div>
      <div class="anim__canvas" data-role="plot" style="margin-top:0.75rem;"></div>
      <div class="anim__caption" style="margin-top:0.35rem; color: var (--text-secondary);">
        Bound a monotone sequence and watch it converge to its supremum (if increasing) or infimum (if decreasing) by the Monotone Convergence Theorem.
      </div>
    </div>
  `;

  const directionSelect = containerEl.querySelector('[data-role=direction]');
  const limitInput = containerEl.querySelector('[data-role=limit]');
  const gapInput = containerEl.querySelector('[data-role=gap]');
  const contractionInput = containerEl.querySelector('[data-role=contraction]');
  const nMaxInput = containerEl.querySelector('[data-role=nmax]');
  const liveRegion = containerEl.querySelector('[data-role=live]');
  const plotMount = containerEl.querySelector('[data-role=plot]');

  const Plot = (typeof window !== 'undefined' && window.Plot) ? window.Plot : null;
  if (!Plot) {
    if (plotMount) {
      plotMount.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">Plot library not loaded. Include Observable Plot (plot.js) to render this animation.</div>';
    }
    return { destroy() { containerEl.innerHTML = ''; } };
  }

  function clampNumber(value, min, max) {
    const num = Number(value);
    if (!Number.isFinite(num)) return min;
    return Math.min(max, Math.max(min, num));
  }

  function clampInt(value, min, max) {
    return Math.round(clampNumber(value, min, max));
  }

  function buildSequence() {
    const items = [];
    let term = state.direction === 'increasing'
      ? state.limit - state.startGap
      : state.limit + state.startGap;

    for (let n = 1; n <= state.nMax; n += 1) {
      items.push({ n, value: term });
      const gap = Math.abs(term - state.limit) * state.contraction;
      if (state.direction === 'increasing') {
        term = Math.min(state.limit, term + gap);
      } else {
        term = Math.max(state.limit, term - gap);
      }
    }
    return items;
  }

  let currentPlot = null;

  function render() {
    const seq = buildSequence();
    const width = Math.min(760, Math.max(520, (plotMount?.clientWidth || 560)));
    const height = Math.round(width * 0.55);

    const lowerBound = state.direction === 'increasing'
      ? Math.min(...seq.map(d => d.value), state.limit)
      : Math.min(state.limit, ...seq.map(d => d.value));
    const upperBound = state.direction === 'increasing'
      ? Math.max(state.limit, ...seq.map(d => d.value))
      : Math.max(...seq.map(d => d.value), state.limit);

    const marks = [
      Plot.ruleY([state.limit], { stroke: '#6f42c1', strokeWidth: 2 }),
      Plot.lineY(seq, { x: 'n', y: 'value', stroke: '#0b7285', strokeWidth: 2, opacity: 0.7 }),
      Plot.dot(seq, { x: 'n', y: 'value', r: 4, fill: '#1f2937', stroke: 'white', strokeWidth: 1.6 }),
      Plot.text([{ n: state.nMax * 0.8, label: `L = ${state.limit.toFixed(2)}` }], { x: 'n', y: () => state.limit + 0.15 * Math.sign(state.limit || 1), text: 'label', fill: '#6f42c1', fontSize: 12, textAnchor: 'start' })
    ];

    const plot = Plot.plot({
      width,
      height,
      style: { background: 'transparent', color: 'var(--text-secondary)' },
      x: { domain: [1, state.nMax], nice: true, grid: true, label: 'n' },
      y: { domain: [lowerBound - 0.5, upperBound + 0.5], nice: true, grid: true, label: 'xₙ' },
      marks
    });

    if (currentPlot) {
      try { currentPlot.remove(); } catch (_) {}
    }
    if (plotMount) {
      plotMount.innerHTML = '';
      plotMount.appendChild(plot);
    }
    currentPlot = plot;

    const monotone = seq.every((point, idx, arr) => {
      if (idx === 0) return true;
      return state.direction === 'increasing'
        ? point.value >= arr[idx - 1].value - 1e-9
        : point.value <= arr[idx - 1].value + 1e-9;
    });
    const boundedAbove = Math.max(...seq.map(d => d.value)) <= upperBound + 1e-6;
    const boundedBelow = Math.min(...seq.map(d => d.value)) >= lowerBound - 1e-6;
    const converged = Math.abs(seq[seq.length - 1].value - state.limit) < 1e-3;

    if (liveRegion) {
      liveRegion.textContent = [
        `Monotone: ${monotone ? 'Yes' : 'No'}`,
        `Bounded above: ${boundedAbove ? 'Yes' : 'No'}`,
        `Bounded below: ${boundedBelow ? 'Yes' : 'No'}`,
        `Converges to L: ${converged ? 'Yes' : 'Still approaching'}`
      ].join(' · ');
    }
  }

  const onDirection = (event) => {
    state.direction = event.target.value === 'decreasing' ? 'decreasing' : 'increasing';
    render();
  };

  const onLimit = () => {
    state.limit = clampNumber(limitInput.value, -10, 10);
    render();
  };

  const onGap = () => {
    state.startGap = clampNumber(gapInput.value, 0.1, 10);
    render();
  };

  const onContraction = () => {
    state.contraction = clampNumber(contractionInput.value, 0.1, 0.95);
    render();
  };

  const onNMax = () => {
    state.nMax = clampInt(nMaxInput.value, 10, 120);
    render();
  };

  directionSelect.addEventListener('change', onDirection);
  limitInput.addEventListener('change', onLimit);
  gapInput.addEventListener('input', onGap);
  contractionInput.addEventListener('input', onContraction);
  nMaxInput.addEventListener('input', onNMax);

  let resizeObserver = null;
  if (typeof ResizeObserver !== 'undefined' && plotMount) {
    resizeObserver = new ResizeObserver(() => render());
    resizeObserver.observe(plotMount);
  }

  render();

  return {
    destroy() {
      try {
        directionSelect.removeEventListener('change', onDirection);
        limitInput.removeEventListener('change', onLimit);
        gapInput.removeEventListener('input', onGap);
        contractionInput.removeEventListener('input', onContraction);
        nMaxInput.removeEventListener('input', onNMax);
        resizeObserver?.disconnect();
      } catch (_) {}
      containerEl.innerHTML = '';
    }
  };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch2_monotone_convergence'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch2_monotone_convergence');
      }
    } catch (e) {
      console.error('Failed to register animation ch2_monotone_convergence', e);
    }
  })();

  // ch2_sup_inf_explorer.js
  (function(){
    // Chapter 2: Supremum & Infimum Explorer
// Public API: init(containerEl, options) -> { destroy }
// Visual goal: toggle canonical sets and highlight sup/inf/max/min distinctions.

function init(containerEl, options = {}) {
  if (!containerEl) {
    return { destroy() {} };
  }

  const SETS = [
    {
      id: 'open01',
      label: 'S₁ = (0, 1)',
      type: 'interval',
      start: 0,
      end: 1,
      inclusiveStart: false,
      inclusiveEnd: false
    },
    {
      id: 'closed01',
      label: 'S₂ = [0, 1]',
      type: 'interval',
      start: 0,
      end: 1,
      inclusiveStart: true,
      inclusiveEnd: true
    },
    {
      id: 'harmonic',
      label: 'S₃ = {1/n : n ∈ ℕ}',
      type: 'discrete',
      generator: (count = 60) => Array.from({ length: count }, (_, i) => ({
        value: 1 / (i + 1),
        label: `1/${i + 1}`
      })),
      sup: 1,
      inf: 0,
      hasMax: true,
      max: 1,
      hasMin: false
    }
  ];

  const state = {
    currentSetId: SETS.some(s => s.id === options.initialSetId) ? options.initialSetId : 'open01'
  };

  containerEl.innerHTML = `
    <div class="anim anim--plot" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; flex-wrap:wrap; align-items:center; gap:1rem; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <label style="display:flex; align-items:center; gap:0.5rem; min-width:260px;">
          <span style="min-width:10ch; text-align:right; color: var(--text-secondary);">Choose set</span>
          <select data-role="set" aria-label="Choose example set" style="flex:1;">
            ${SETS.map(set => `<option value="${set.id}">${set.label}</option>`).join('')}
          </select>
        </label>
        <div data-role="badges" style="display:flex; flex-wrap:wrap; align-items:center; gap:0.75rem; color: var(--text-secondary);"></div>
        <div role="status" aria-live="polite" data-role="live" style="flex:1 1 200px; color: var(--text-secondary);"></div>
      </div>
      <div class="anim__canvas" data-role="plot" style="margin-top:0.75rem;"></div>
      <div class="anim__caption" style="margin-top:0.35rem; color: var(--text-secondary);">
        Supremum and infimum describe tight bounds even when maxima or minima fail to exist.
      </div>
    </div>
  `;

  const selector = containerEl.querySelector('[data-role=set]');
  const badgesEl = containerEl.querySelector('[data-role=badges]');
  const liveRegion = containerEl.querySelector('[data-role=live]');
  const plotMount = containerEl.querySelector('[data-role=plot]');

  if (selector) selector.value = state.currentSetId;

  const Plot = (typeof window !== 'undefined' && window.Plot) ? window.Plot : null;
  if (!Plot) {
    if (plotMount) {
      plotMount.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">Plot library not loaded. Include Observable Plot to display this animation.</div>';
    }
    return { destroy() { containerEl.innerHTML = ''; } };
  }

  function describeSet(set) {
    if (set.type === 'interval') {
      return {
        inf: set.start,
        sup: set.end,
        hasMin: !!set.inclusiveStart,
        hasMax: !!set.inclusiveEnd,
        min: set.inclusiveStart ? set.start : null,
        max: set.inclusiveEnd ? set.end : null,
        sample: Array.from({ length: 160 }, (_, i) => ({
          value: set.start + (set.end - set.start) * (i / 159)
        }))
      };
    }

    if (set.type === 'discrete') {
      const pts = set.generator(set.sampleCount || 60);
      const values = pts.map(p => p.value);
      const tol = 1e-6;
      const sup = set.sup ?? Math.max(...values);
      const inf = set.inf ?? Math.min(...values);
      const hasMax = set.hasMax ?? values.some(v => Math.abs(v - sup) < tol);
      const hasMin = set.hasMin ?? values.some(v => Math.abs(v - inf) < tol);
      const max = hasMax ? (set.max ?? sup) : null;
      const min = hasMin ? (set.min ?? inf) : null;
      return {
        inf,
        sup,
        hasMin,
        hasMax,
        min,
        max,
        sample: pts
      };
    }

    return null;
  }

  let currentPlot = null;

  function render() {
    const set = SETS.find(s => s.id === state.currentSetId) || SETS[0];
    const desc = describeSet(set);
    if (!desc) return;

    const width = Math.min(720, Math.max(480, (plotMount?.clientWidth || 560)));
    const height = Math.round(width * 0.35);
    const domainMargin = 0.15 * Math.max(1, Math.abs(desc.sup) + Math.abs(desc.inf));
    const domain = [Math.min(desc.inf, desc.sup) - domainMargin, Math.max(desc.inf, desc.sup) + domainMargin];

    const marks = [];

    if (set.type === 'interval') {
      marks.push(Plot.lineY(desc.sample, { x: 'value', y: () => 0.5, stroke: '#0b7285', strokeWidth: 5, opacity: 0.35 }));
      const endpoints = [];
      if (set.inclusiveStart) {
        endpoints.push({ value: desc.inf, fill: '#0b7285', closed: true });
      } else {
        endpoints.push({ value: desc.inf, fill: '#1f2937', closed: false });
      }
      if (set.inclusiveEnd) {
        endpoints.push({ value: desc.sup, fill: '#0b7285', closed: true });
      } else {
        endpoints.push({ value: desc.sup, fill: '#1f2937', closed: false });
      }
      endpoints.forEach(pt => {
        marks.push(Plot.dot([{ value: pt.value }], {
          x: 'value',
          y: () => 0.5,
          r: 6,
          fill: pt.closed ? pt.fill : 'transparent',
          stroke: pt.closed ? 'white' : pt.fill,
          strokeWidth: pt.closed ? 1.4 : 2
        }));
      });
    } else if (set.type === 'discrete') {
      marks.push(Plot.dot(desc.sample, {
        x: 'value',
        y: () => 0.5,
        r: 5,
        fill: '#0b7285',
        stroke: 'white',
        strokeWidth: 1.4,
        title: d => `${d.label} = ${d.value.toFixed(4)}`
      }));
      marks.push(Plot.text(desc.sample.slice(0, 6), {
        x: 'value',
        y: () => 0.63,
        text: d => d.label,
        fill: 'var(--text-secondary)',
        fontSize: 11,
        textAnchor: 'middle'
      }));
    }

    const supMark = { value: desc.sup, label: `sup S = ${desc.sup.toFixed(3)}` };
    const infMark = { value: desc.inf, label: `inf S = ${desc.inf.toFixed(3)}` };

    marks.push(Plot.ruleX([desc.sup], { stroke: '#e76f51', strokeWidth: 2 }));
    marks.push(Plot.ruleX([desc.inf], { stroke: '#6f42c1', strokeWidth: 2 }));
    marks.push(Plot.text([supMark], { x: 'value', y: () => 0.82, text: 'label', fill: '#e76f51', fontSize: 12, textAnchor: 'start', dy: -6 }));
    marks.push(Plot.text([infMark], { x: 'value', y: () => 0.18, text: 'label', fill: '#6f42c1', fontSize: 12, textAnchor: 'start', dy: -6 }));

    const plot = Plot.plot({
      width,
      height,
      style: { background: 'transparent', color: 'var(--text-secondary)' },
      x: { domain, grid: true, label: 'value' },
      y: { domain: [0, 1], axis: null },
      marks
    });

    if (currentPlot) {
      try { currentPlot.remove(); } catch (_) {}
    }
    if (plotMount) {
      plotMount.innerHTML = '';
      plotMount.appendChild(plot);
    }
    currentPlot = plot;

    renderBadges(desc, set.label);
    updateLiveRegion(desc, set.label);
  }

  function renderBadges(desc, title) {
    if (!badgesEl) return;
    const items = [
      { label: 'Set', value: title },
      { label: 'sup S', value: formatNumber(desc.sup) },
      { label: 'inf S', value: formatNumber(desc.inf) },
      { label: 'max S', value: desc.hasMax ? formatNumber(desc.max) : 'not attained' },
      { label: 'min S', value: desc.hasMin ? formatNumber(desc.min) : 'not attained' }
    ];
    badgesEl.innerHTML = items.map(item => `
      <span style="display:inline-flex; align-items:center; gap:0.35rem; padding:0.35rem 0.55rem; border-radius:0.5rem; background:rgba(148, 163, 184, 0.16);">
        <strong style="font-weight:600; color: var(--text-secondary);">${item.label}</strong>
        <span style="color: var(--text-primary);">${item.value}</span>
      </span>
    `).join('');
  }

  function updateLiveRegion(desc, title) {
    if (!liveRegion) return;
    const parts = [
      `${title}`,
      `sup = ${formatNumber(desc.sup)}`,
      `inf = ${formatNumber(desc.inf)}`,
      desc.hasMax ? `max = ${formatNumber(desc.max)}` : 'no maximum',
      desc.hasMin ? `min = ${formatNumber(desc.min)}` : 'no minimum'
    ];
    liveRegion.textContent = parts.join(' · ');
  }

  function formatNumber(num) {
    if (num == null || !Number.isFinite(num)) return String(num);
    return Math.abs(num) < 1e-3 || Math.abs(num) > 1e4 ? num.toExponential(2) : num.toFixed(3);
  }

  const onSetChange = (event) => {
    state.currentSetId = event.target.value;
    render();
  };

  selector?.addEventListener('change', onSetChange);

  let resizeObserver = null;
  if (typeof ResizeObserver !== 'undefined' && plotMount) {
    resizeObserver = new ResizeObserver(() => render());
    resizeObserver.observe(plotMount);
  }

  render();

  return {
    destroy() {
      try {
        selector?.removeEventListener('change', onSetChange);
        resizeObserver?.disconnect();
      } catch (_) {}
      containerEl.innerHTML = '';
    }
  };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch2_sup_inf_explorer'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch2_sup_inf_explorer');
      }
    } catch (e) {
      console.error('Failed to register animation ch2_sup_inf_explorer', e);
    }
  })();

  // ch4_axb_column_space.js
  (function(){
    // Chapter 4: Ax = b — Column space geometry explorer
// Public API: init(containerEl, options) -> { destroy }
// Uses Observable Plot (global window.Plot)

function init(containerEl, options = {}) {
  if (!containerEl) return { destroy() {} };

  const state = {
    // Matrix A = [[a, b], [c, d]]
    a: finiteOr(options.a, 5),
    b: finiteOr(options.b, -1),
    c: finiteOr(options.c, -1),
    d: finiteOr(options.d, 3),
    // RHS vector b = [b1, b2]
    b1: finiteOr(options.b1, 12),
    b2: finiteOr(options.b2, 16),
    showGrid: true,
    showParallelogram: true,
    showColumns: true,
  };

  function finiteOr(v, fallback) {
    const x = +v; return Number.isFinite(x) ? x : fallback;
  }

  containerEl.innerHTML = `
    <div class="anim anim--plot" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <div class="anim__hint" style="flex:1 1 100%; color: var(--text-secondary); margin-bottom:0.25rem;">
          Ax=b explorer: Edit A and move b. The plot shows the column space span(A). Ax=b has a solution iff b lies in span(A). When det(A)≠0 the solution is unique.
        </div>
        <div style="display:flex; gap:0.5rem; align-items:center;">
          <span style="min-width:7ch; text-align:right; color:var(--text-secondary);">A =</span>
          <div style="display:inline-grid; grid-template-columns: auto auto; gap:0.25rem 0.35rem; align-items:center;">
            <input data-role="a" type="number" step="0.5" value="${state.a}" style="width:5rem;" aria-label="A[0,0]" title="Matrix entry A[0,0]">
            <input data-role="b" type="number" step="0.5" value="${state.b}" style="width:5rem;" aria-label="A[0,1]" title="Matrix entry A[0,1]">
            <input data-role="c" type="number" step="0.5" value="${state.c}" style="width:5rem;" aria-label="A[1,0]" title="Matrix entry A[1,0]">
            <input data-role="d" type="number" step="0.5" value="${state.d}" style="width:5rem;" aria-label="A[1,1]" title="Matrix entry A[1,1]">
          </div>
        </div>
        <div style="display:flex; gap:0.35rem; align-items:center;">
          <span style="min-width:6ch; text-align:right; color:var(--text-secondary);">b =</span>
          <input data-role="b1" type="range" min="-30" max="30" step="1" value="${state.b1}" title="b₁ (horizontal component)" aria-label="b1 slider"/>
          <input data-role="b2" type="range" min="-30" max="30" step="1" value="${state.b2}" title="b₂ (vertical component)" aria-label="b2 slider"/>
        </div>
        <label style="display:inline-flex; gap:0.35rem; align-items:center;" title="Toggle grid lines">
          <input data-role="grid" type="checkbox" ${state.showGrid ? 'checked' : ''} aria-label="Toggle grid"/> grid
        </label>
        <label style="display:inline-flex; gap:0.35rem; align-items:center;" title="Show the two columns of A as arrows">
          <input data-role="cols" type="checkbox" ${state.showColumns ? 'checked' : ''} aria-label="Toggle columns"/> columns
        </label>
        <label style="display:inline-flex; gap:0.35rem; align-items:center;" title="Show the span(A) parallelogram (using unit coefficients)">
          <input data-role="para" type="checkbox" ${state.showParallelogram ? 'checked' : ''} aria-label="Toggle span(A)"/> span(A)
        </label>
        <div role="status" aria-live="polite" data-role="live" style="color: var(--text-secondary);"></div>
      </div>
      <div class="anim__canvases" style="margin-top:0.6rem;">
        <div class="anim__canvas" data-role="plot"></div>
        <div class="anim__legend" style="margin-top:0.35rem; display:flex; gap:1rem; flex-wrap:wrap; color: var(--text-secondary);">
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#2a9d8f;"></span>col₁(A)</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#e9c46a;"></span>col₂(A)</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:10px; height:10px; background:#e76f51; border-radius:50%;"></span>b</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:10px; height:10px; background:#6f42c1; border-radius:50%;"></span>Ax (when invertible)</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:10px; background:var(--text-secondary); opacity:0.12; outline:1px solid var(--border-color);"></span>span(A) (shaded)</span>
        </div>
        <div class="anim__caption" style="margin-top:0.25rem; color: var(--text-secondary);">
          Use: adjust A or b to see how the column space changes. If det(A)=0, the column space is a line; Ax=b is solvable only when b lies on that line.
        </div>
      </div>
    </div>
  `;

  const Plot = (window && window.Plot) ? window.Plot : null;
  const mount = containerEl.querySelector('[data-role=plot]');
  const live = containerEl.querySelector('[data-role=live]');

  const inputs = {
    a: containerEl.querySelector('input[data-role=a]'),
    b: containerEl.querySelector('input[data-role=b]'),
    c: containerEl.querySelector('input[data-role=c]'),
    d: containerEl.querySelector('input[data-role=d]'),
    b1: containerEl.querySelector('input[data-role=b1]'),
    b2: containerEl.querySelector('input[data-role=b2]'),
    grid: containerEl.querySelector('input[data-role=grid]'),
    cols: containerEl.querySelector('input[data-role=cols]'),
    para: containerEl.querySelector('input[data-role=para]'),
  };

  function det2(a,b,c,d){ return a*d - b*c; }
  function inv2(a,b,c,d){ const D = det2(a,b,c,d); return D ? [ d/D, -b/D, -c/D, a/D ] : null; }

  let currentFig = null;
  function render() {
    state.a = +inputs.a.value; state.b = +inputs.b.value; state.c = +inputs.c.value; state.d = +inputs.d.value;
    state.b1 = +inputs.b1.value; state.b2 = +inputs.b2.value;
    state.showGrid = !!inputs.grid.checked; state.showColumns = !!inputs.cols.checked; state.showParallelogram = !!inputs.para.checked;

    const A = [state.a, state.b, state.c, state.d];
    const B = [state.b1, state.b2];
    const D = det2(...A);

    // Columns of A
    const col1 = { x: A[0], y: A[2] };
    const col2 = { x: A[1], y: A[3] };

    // Parallelogram corners for span visualization (unit coefficients) — kept for reference
    const P = [
      { x: 0, y: 0 },
      { x: col1.x, y: col1.y },
      { x: col1.x + col2.x, y: col1.y + col2.y },
      { x: col2.x, y: col2.y },
      { x: 0, y: 0 },
    ];

    // Solve x = A^{-1} b if invertible
    let x = null;
    const invA = inv2(...A);
    if (invA) {
      x = {
        x1: invA[0]*B[0] + invA[1]*B[1],
        x2: invA[2]*B[0] + invA[3]*B[1],
      };
    }

    const combo = x ? [{ x: x.x1*col1.x + x.x2*col2.x, y: x.x1*col1.y + x.x2*col2.y }] : [];

    const width = Math.min(760, Math.max(420, (mount?.clientWidth || 560)));
    const height = Math.round(width * 0.64);

    // pick domains symmetric and adaptive
    const xs = [0, col1.x, col2.x, col1.x+col2.x, B[0], combo[0]?.x ?? 0];
    const ys = [0, col1.y, col2.y, col1.y+col2.y, B[1], combo[0]?.y ?? 0];
    const maxAbs = Math.max(10, ...xs.map(v=>Math.abs(v)), ...ys.map(v=>Math.abs(v)));
    const dom = [-maxAbs, maxAbs];

    const marks = [];
    if (state.showGrid) {
      // light grid via Plot frame grid options
    }
    if (state.showParallelogram && (Math.hypot(col1.x, col1.y) + Math.hypot(col2.x, col2.y) > 0)) {
      // Extend span(A) visualization over the entire figure with gradient + grid
      if (Math.abs(D) > 1e-9) {
        // rank 2: span(A) = R^2 → gradient shading (strong in unit parallelogram, fading outward)
        // Draw grid lines along integer multiples of col1 and col2
        const gridRange = 8; // how many grid lines in each direction
        for (let i = -gridRange; i <= gridRange; i++) {
          if (i === 0) continue; // skip origin lines (drawn separately as columns)
          // Lines parallel to col1 (multiples of col2)
          const p1 = { x: i * col2.x - gridRange * col1.x, y: i * col2.y - gridRange * col1.y };
          const p2 = { x: i * col2.x + gridRange * col1.x, y: i * col2.y + gridRange * col1.y };
          marks.push(Plot.line([p1, p2], { 
            x: 'x', y: 'y', 
            stroke: 'var(--text-secondary)', 
            strokeWidth: 0.5, 
            opacity: Math.abs(i) <= 1 ? 0.15 : 0.05 
          }));
          // Lines parallel to col2 (multiples of col1)
          const q1 = { x: i * col1.x - gridRange * col2.x, y: i * col1.y - gridRange * col2.y };
          const q2 = { x: i * col1.x + gridRange * col2.x, y: i * col1.y + gridRange * col2.y };
          marks.push(Plot.line([q1, q2], { 
            x: 'x', y: 'y', 
            stroke: 'var(--text-secondary)', 
            strokeWidth: 0.5, 
            opacity: Math.abs(i) <= 1 ? 0.15 : 0.05 
          }));
        }
        
        // Gradient shading: multiple concentric parallelograms with decreasing opacity
        const layers = [
          { scale: 1, opacity: 0.12 },   // unit parallelogram (strongest)
          { scale: 2, opacity: 0.08 },
          { scale: 3, opacity: 0.05 },
          { scale: 5, opacity: 0.03 },
          { scale: 8, opacity: 0.015 },
        ];
        layers.forEach(({ scale, opacity }) => {
          const poly = [
            { x: 0, y: 0 },
            { x: scale * col1.x, y: scale * col1.y },
            { x: scale * (col1.x + col2.x), y: scale * (col1.y + col2.y) },
            { x: scale * col2.x, y: scale * col2.y },
            { x: 0, y: 0 },
          ];
          marks.push(Plot.line(poly, { x: 'x', y: 'y', stroke: 'var(--border-color)', opacity: opacity * 0.5, strokeWidth: 1 }));
          marks.push(Plot.areaY(poly, { x: 'x', y: 'y', fill: 'var(--text-secondary)', opacity }));
        });
      } else {
        // rank 1: span(A) is a line through the origin along a nonzero column
        const nz1 = Math.hypot(col1.x, col1.y) > 1e-9;
        const nz2 = Math.hypot(col2.x, col2.y) > 1e-9;
        if (nz1 || nz2) {
          const v = nz1 ? col1 : col2;
          if (Math.abs(v.x) > 1e-9) {
            const m = v.y / v.x;
            const pts = [
              { x: dom[0], y: m * dom[0] },
              { x: dom[1], y: m * dom[1] },
            ];
            marks.push(Plot.line(pts, { x: 'x', y: 'y', stroke: 'var(--text-secondary)', strokeWidth: 4, opacity: 0.25 }));
          } else {
            // Vertical span (x = 0)
            marks.push(Plot.ruleX([0], { stroke: 'var(--text-secondary)', strokeWidth: 4, opacity: 0.25 }));
          }
        }
        // If both columns are zero, span(A) = {0}; omit shading
      }
    }
    if (state.showColumns) {
      marks.push(Plot.line([{x:0,y:0}, col1], { x:'x', y:'y', stroke:'#2a9d8f', strokeWidth:2 }));
      marks.push(Plot.line([{x:0,y:0}, col2], { x:'x', y:'y', stroke:'#e9c46a', strokeWidth:2 }));
    }
    // Target b
    marks.push(Plot.dot([{ x: B[0], y: B[1] }], { x:'x', y:'y', r:5, fill:'#e76f51', stroke:'white', strokeWidth:1.5 }));

    // If invertible, show Ax reconstructed and solution coordinates
    if (x) {
      marks.push(Plot.dot(combo, { x:'x', y:'y', r:5, fill:'#6f42c1', stroke:'white', strokeWidth:1.5 }));
      marks.push(Plot.text([
        { x: (combo[0].x), y: (combo[0].y), label: `x = [${x.x1.toFixed(2)}, ${x.x2.toFixed(2)}]` }
      ], { x:'x', y:'y', text:'label', dy: -10, fill: 'var(--text-secondary)', fontSize: 12 }));
    } else {
      marks.push(Plot.text([{ x: 0, y: 0, label: 'A not invertible (det=0): solution exists only if b ∈ span(A).' }], { x:'x', y:'y', text:'label', dy: -8, fill: 'var(--text-secondary)' }));
    }

    const fig = Plot.plot({
      width, height,
      marginLeft: 46, marginBottom: 44,
      x: { domain: dom, grid: state.showGrid },
      y: { domain: dom, grid: state.showGrid },
      style: { background: 'transparent', color: 'var(--text-secondary)' },
      marks
    });

    if (currentFig) { try { currentFig.remove(); } catch(_){} }
    if (mount) {
      mount.innerHTML = '';
      mount.appendChild(fig);
      currentFig = fig;
    }

    if (live) {
      const detStr = D.toFixed(2);
      let spanMsg = '';
      if (!invA) {
        // Check b ∈ span(A): if both columns are zero, span={0}; otherwise check collinearity with a nonzero column
        const nz1 = Math.hypot(col1.x, col1.y) > 1e-9;
        const nz2 = Math.hypot(col2.x, col2.y) > 1e-9;
        let inSpan = false;
        if (!nz1 && !nz2) {
          inSpan = Math.hypot(B[0], B[1]) < 1e-9;
        } else {
          const ref = nz1 ? col1 : col2;
          const area = ref.x * B[1] - ref.y * B[0];
          inSpan = Math.abs(area) < 1e-6;
        }
        spanMsg = inSpan ? 'b ∈ span(A) ⇒ solutions exist (not unique)' : 'b ∉ span(A) ⇒ no solution';
      }
      live.textContent = `det(A)=${detStr}; ${invA ? 'invertible ⇒ unique solution' : `singular; ${spanMsg}`}; b=[${B[0].toFixed(1)}, ${B[1].toFixed(1)}]`;
    }
  }

  if (!Plot) {
    if (mount) mount.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">Plot library not loaded.</div>';
    return { destroy(){ containerEl.innerHTML=''; } };
  }

  // Wire events
  Object.values(inputs).forEach(el => el && el.addEventListener('input', render));

  // Initial render
  render();

  return {
    destroy() {
      try { Object.values(inputs).forEach(el => el && el.removeEventListener('input', render)); } catch(_){}
      if (currentFig) { try { currentFig.remove(); } catch(_){} }
      containerEl.innerHTML = '';
    }
  };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch4_axb_column_space'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch4_axb_column_space');
      }
    } catch (e) {
      console.error('Failed to register animation ch4_axb_column_space', e);
    }
  })();

  // ch4_det_area_scaling.js
  (function(){
    // Chapter 4: Determinant — Area scaling and invertibility (2D)
// Public API: init(containerEl, options) -> { destroy }
// Observable Plot required (window.Plot)

function init(containerEl, options = {}) {
  if (!containerEl) return { destroy() {} };

  function finiteOr(v, d) { const x = +v; return Number.isFinite(x) ? x : d; }

  const state = {
    a: finiteOr(options.a, 2), b: finiteOr(options.b, 1),
    c: finiteOr(options.c, 0), d: finiteOr(options.d, 3),
    showGrid: true,
    showImages: true,
  };

  containerEl.innerHTML = `
    <div class="anim anim--plot" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <div class="anim__hint" style="flex:1 1 100%; color: var(--text-secondary); margin-bottom:0.25rem;">
          Determinant explorer: Edit A. The image of the unit square under T(x)=Ax is a parallelogram with area |det(A)|. det(A)=0 → area 0 (not invertible).
        </div>
        <div style="display:flex; gap:0.5rem; align-items:center;">
          <span style="min-width:7ch; text-align:right; color:var(--text-secondary);">A =</span>
          <div style="display:inline-grid; grid-template-columns: auto auto; gap:0.25rem 0.35rem; align-items:center;">
            <input data-role="a" type="number" step="0.5" value="${state.a}" style="width:5rem;" aria-label="A[0,0]" title="Matrix entry A[0,0]">
            <input data-role="b" type="number" step="0.5" value="${state.b}" style="width:5rem;" aria-label="A[0,1]" title="Matrix entry A[0,1]">
            <input data-role="c" type="number" step="0.5" value="${state.c}" style="width:5rem;" aria-label="A[1,0]" title="Matrix entry A[1,0]">
            <input data-role="d" type="number" step="0.5" value="${state.d}" style="width:5rem;" aria-label="A[1,1]" title="Matrix entry A[1,1]">
          </div>
        </div>
        <label style="display:inline-flex; gap:0.35rem; align-items:center;" title="Toggle grid lines">
          <input data-role="grid" type="checkbox" ${state.showGrid ? 'checked' : ''} aria-label="Toggle grid"/> grid
        </label>
        <label style="display:inline-flex; gap:0.35rem; align-items:center;" title="Show transformed images">
          <input data-role="img" type="checkbox" ${state.showImages ? 'checked' : ''} aria-label="Toggle transformed images"/> images
        </label>
        <div role="status" aria-live="polite" data-role="live" style="color: var(--text-secondary);"></div>
      </div>
      <div class="anim__canvases" style="margin-top:0.6rem;">
        <div class="anim__canvas" data-role="plot"></div>
        <div class="anim__legend" style="margin-top:0.35rem; display:flex; gap:1rem; flex-wrap:wrap; color: var(--text-secondary);">
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#64748b;"></span>axes basis e₁,e₂</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#94a3b8;"></span>unit square (area 1)</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#2a9d8f;"></span>Ae₁</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#e9c46a;"></span>Ae₂</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#6f42c1;"></span>image of unit square (area |det(A)|)</span>
        </div>
        <div class="anim__caption" style="margin-top:0.25rem; color: var(--text-secondary);">
          Use: tweak A entries to see how area scales. If det(A)=0, the transformed square collapses to a line/point.
        </div>
      </div>
    </div>
  `;

  const Plot = (window && window.Plot) ? window.Plot : null;
  const mount = containerEl.querySelector('[data-role=plot]');
  const live = containerEl.querySelector('[data-role=live]');
  const el = {
    a: containerEl.querySelector('input[data-role=a]'),
    b: containerEl.querySelector('input[data-role=b]'),
    c: containerEl.querySelector('input[data-role=c]'),
    d: containerEl.querySelector('input[data-role=d]'),
    grid: containerEl.querySelector('input[data-role=grid]'),
    img: containerEl.querySelector('input[data-role=img]'),
  };

  function det2(a,b,c,d){ return a*d - b*c; }
  function applyA(A, p){ return { x: A[0]*p.x + A[1]*p.y, y: A[2]*p.x + A[3]*p.y }; }

  let currentFig = null;
  function render() {
    const A = [ +el.a.value, +el.b.value, +el.c.value, +el.d.value ];
    const D = det2(...A);
    const showGrid = !!el.grid.checked;
    const showImages = !!el.img.checked;

    const square = [
      {x:0,y:0}, {x:1,y:0}, {x:1,y:1}, {x:0,y:1}, {x:0,y:0}
    ];
    const img = square.map(p => applyA(A, p));

    const e1 = {x:1,y:0}, e2 = {x:0,y:1};
    const Ae1 = applyA(A, e1), Ae2 = applyA(A, e2);

    // domain
    const xs = [...square.map(p=>p.x), ...img.map(p=>p.x), 0, e1.x, e2.x, Ae1.x, Ae2.x];
    const ys = [...square.map(p=>p.y), ...img.map(p=>p.y), 0, e1.y, e2.y, Ae1.y, Ae2.y];
    const maxAbs = Math.max(2, ...xs.map(Math.abs), ...ys.map(Math.abs));
    const dom = [-maxAbs, maxAbs];

    const marks = [];
    // original axes basis
    marks.push(Plot.line([{x:0,y:0}, e1], { x:'x', y:'y', stroke:'#64748b', strokeWidth:1.5 }));
    marks.push(Plot.line([{x:0,y:0}, e2], { x:'x', y:'y', stroke:'#64748b', strokeWidth:1.5 }));
    // original square
    marks.push(Plot.line(square, { x:'x', y:'y', stroke:'#94a3b8', strokeWidth:2 }));
    marks.push(Plot.areaY(square, { x:'x', y:'y', fill:'#94a3b8', opacity:0.1 }));

    if (showImages) {
      // transformed basis
      marks.push(Plot.line([{x:0,y:0}, Ae1], { x:'x', y:'y', stroke:'#2a9d8f', strokeWidth:2 }));
      marks.push(Plot.line([{x:0,y:0}, Ae2], { x:'x', y:'y', stroke:'#e9c46a', strokeWidth:2 }));
      // transformed square
      marks.push(Plot.line(img, { x:'x', y:'y', stroke:'#6f42c1', strokeWidth:2.2 }));
      marks.push(Plot.areaY(img, { x:'x', y:'y', fill:'#6f42c1', opacity:0.12 }));
      // show |det| label near centroid
      const cx = img.reduce((s,p)=>s+p.x,0)/img.length;
      const cy = img.reduce((s,p)=>s+p.y,0)/img.length;
      marks.push(Plot.text([{ x: cx, y: cy, label: `|det(A)| = ${Math.abs(D).toFixed(2)}` }], { x:'x', y:'y', text:'label', fill:'var(--text-secondary)', dy: -6 }));
    }

    const width = Math.min(760, Math.max(420, (mount?.clientWidth || 560)));
    const height = Math.round(width * 0.64);
    const fig = Plot.plot({
      width, height,
      marginLeft: 46, marginBottom: 44,
      x: { domain: dom, grid: showGrid },
      y: { domain: dom, grid: showGrid },
      style: { background: 'transparent', color: 'var(--text-secondary)' },
      marks
    });

    if (currentFig) { try { currentFig.remove(); } catch(_){} }
    if (mount) {
      mount.innerHTML = '';
      mount.appendChild(fig);
      currentFig = fig;
    }
    if (live) {
      const absD = Math.abs(D);
      const inv = D===0 ? 'singular' : 'invertible';
      live.textContent = `det(A) = ${D.toFixed(2)} (${inv}); area scale = |det(A)| ≈ ${absD.toFixed(2)}`;
    }
  }

  if (!Plot) {
    if (mount) mount.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">Plot library not loaded.</div>';
    return { destroy(){ containerEl.innerHTML=''; } };
  }

  Object.values(el).forEach(inp => inp && inp.addEventListener('input', render));
  render();

  return {
    destroy(){
      try { Object.values(el).forEach(inp => inp && inp.removeEventListener('input', render)); } catch(_){}
      if (currentFig) { try { currentFig.remove(); } catch(_){} }
      containerEl.innerHTML = '';
    }
  };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch4_det_area_scaling'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch4_det_area_scaling');
      }
    } catch (e) {
      console.error('Failed to register animation ch4_det_area_scaling', e);
    }
  })();

  // ch4_eigen_invariance_plot.js
  (function(){
    // Chapter 4: Eigenvector invariance (2D) — grid morph and eigen directions
// Public API: init(containerEl, options) -> { destroy }

function init(containerEl, options = {}) {
  if (!containerEl) return { destroy() {} };

  function finiteOr(v, d) { const x = +v; return Number.isFinite(x) ? x : d; }

  const state = {
    a: finiteOr(options.a, 1.6), b: finiteOr(options.b, 0.8),
    c: finiteOr(options.c, 0.4), d: finiteOr(options.d, 1.2),
    t: finiteOr(options.t, 1), // interpolation I→A
    showGrid: true,
    showEigen: true,
    showUnit: true,
    bounds: 4,
    step: 1,
    samples: 40
  };

  containerEl.innerHTML = `
    <div class="anim anim--plot" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <div class="anim__hint" style="flex:1 1 100%; color: var(--text-secondary); margin-bottom:0.25rem;">
          Eigen invariance: Morph the plane from I to A. Real eigenvector directions stay collinear (just scale), while other directions shear/rotate.
        </div>
        <div style="display:flex; gap:0.5rem; align-items:center;">
          <span style="min-width:7ch; text-align:right; color:var(--text-secondary);">A =</span>
          <div style="display:inline-grid; grid-template-columns: auto auto; gap:0.25rem 0.35rem; align-items:center;">
            <input data-role="a" type="number" step="0.1" value="${state.a}" style="width:5rem;" aria-label="A[0,0]" title="Matrix entry A[0,0]">
            <input data-role="b" type="number" step="0.1" value="${state.b}" style="width:5rem;" aria-label="A[0,1]" title="Matrix entry A[0,1]">
            <input data-role="c" type="number" step="0.1" value="${state.c}" style="width:5rem;" aria-label="A[1,0]" title="Matrix entry A[1,0]">
            <input data-role="d" type="number" step="0.1" value="${state.d}" style="width:5rem;" aria-label="A[1,1]" title="Matrix entry A[1,1]">
          </div>
        </div>
        <label title="Morph from identity (0) to A (1)" style="display:flex; align-items:center; gap:0.5rem; min-width:260px;">
          <span style="min-width:6ch; text-align:right; color: var(--text-secondary);">t</span>
          <input data-role="t" type="range" min="0" max="1" step="0.01" value="${state.t}" aria-label="Morph factor t" />
        </label>
        <label style="display:inline-flex; gap:0.35rem; align-items:center;" title="Toggle grid lines"><input data-role="grid" type="checkbox" ${state.showGrid?'checked':''} aria-label="Toggle grid"/> grid</label>
        <label style="display:inline-flex; gap:0.35rem; align-items:center;" title="Toggle displaying eigen directions (if real)"><input data-role="eig" type="checkbox" ${state.showEigen?'checked':''} aria-label="Toggle eigen directions"/> eigen</label>
        <label style="display:inline-flex; gap:0.35rem; align-items:center;" title="Show the unit circle and its image"><input data-role="unit" type="checkbox" ${state.showUnit?'checked':''} aria-label="Toggle unit circle"/> unit circle</label>
        <div role="status" aria-live="polite" data-role="live" style="color: var(--text-secondary);"></div>
      </div>
      <div class="anim__canvases" style="margin-top:0.6rem;">
        <div class="anim__canvas" data-role="plot"></div>
        <div class="anim__legend" style="margin-top:0.35rem; display:flex; gap:1rem; flex-wrap:wrap; color: var(--text-secondary);">
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#475569; opacity:0.6;"></span>grid (morphed)</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#94a3b8;"></span>unit circle</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#6f42c1;"></span>image of unit circle</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#22c55e;"></span>eigen directions (if real)</span>
        </div>
        <div class="anim__caption" style="margin-top:0.25rem; color: var(--text-secondary);">
          Use: move t to morph from I to A. If eigenvalues are complex, no real eigen-directions are drawn.
        </div>
      </div>
    </div>
  `;

  const Plot = (window && window.Plot) ? window.Plot : null;
  const mount = containerEl.querySelector('[data-role=plot]');
  const live = containerEl.querySelector('[data-role=live]');

  const el = {
    a: containerEl.querySelector('input[data-role=a]'),
    b: containerEl.querySelector('input[data-role=b]'),
    c: containerEl.querySelector('input[data-role=c]'),
    d: containerEl.querySelector('input[data-role=d]'),
    t: containerEl.querySelector('input[data-role=t]'),
    grid: containerEl.querySelector('input[data-role=grid]'),
    eig: containerEl.querySelector('input[data-role=eig]'),
    unit: containerEl.querySelector('input[data-role=unit]'),
  };

  function apply(A, p) { return { x: A[0]*p.x + A[1]*p.y, y: A[2]*p.x + A[3]*p.y }; }
  function interp(A, t, p) {
    // p(t) = (1-t) p + t A p
    const Ap = apply(A, p);
    return { x: (1-t)*p.x + t*Ap.x, y: (1-t)*p.y + t*Ap.y };
  }
  function eig2(A) {
    const [a,b,c,d] = A;
    const tr = a + d;
    const disc = tr*tr - 4*(a*d - b*c);
    if (disc < 0) return { real: false, values: [], vecs: [] };
    const s = Math.sqrt(disc);
    const l1 = (tr + s)/2, l2 = (tr - s)/2;
    function eigenvec(l) {
      // solve (A - lI)v=0 → pick a non-trivial vector
      const A11=a-l, A12=b, A21=c, A22=d-l;
      let v = null;
      if (Math.abs(A12) + Math.abs(A11) > Math.abs(A21) + Math.abs(A22)) {
        // use row1: A11 v1 + A12 v2 = 0 → choose v1 = 1
        if (Math.abs(A12) > 1e-9) v = [ -A11/A12, 1 ]; else v = [1, 0];
      } else {
        if (Math.abs(A22) > 1e-9) v = [ 1, -A21/A22 ]; else v = [0, 1];
      }
      const n = Math.hypot(v[0], v[1]) || 1;
      return [ v[0]/n, v[1]/n ];
    }
    const v1 = eigenvec(l1), v2 = eigenvec(l2);
    return { real: true, values: [l1, l2], vecs: [v1, v2] };
  }

  function buildGrid(A, t, bounds, step, samples) {
    const lines = [];
    const lo = -bounds, hi = bounds;
    // vertical lines x = k
    for (let k = Math.ceil(lo); k <= hi; k += step) {
      const pts = [];
      for (let i = 0; i <= samples; i++) {
        const y = lo + (i*(hi-lo))/samples;
        pts.push(interp(A, t, { x: k, y }));
      }
      lines.push({ pts, kind: 'v' });
    }
    // horizontal lines y = k
    for (let k = Math.ceil(lo); k <= hi; k += step) {
      const pts = [];
      for (let i = 0; i <= samples; i++) {
        const x = lo + (i*(hi-lo))/samples;
        pts.push(interp(A, t, { x, y: k }));
      }
      lines.push({ pts, kind: 'h' });
    }
    return lines;
  }

  function unitCircle(t, steps=240) {
    const pts = [];
    for (let i=0;i<=steps;i++) {
      const ang = (i/steps) * 2*Math.PI;
      pts.push({ x: Math.cos(ang), y: Math.sin(ang) });
    }
    return pts;
  }

  let currentFig = null;
  function render() {
    const A = [ +el.a.value, +el.b.value, +el.c.value, +el.d.value ];
    const t = +el.t.value;
    const showGrid = !!el.grid.checked;
    const showEigen = !!el.eig.checked;
    const showUnit = !!el.unit.checked;

    const bounds = state.bounds, step = state.step, samples = state.samples;

    const width = Math.min(820, Math.max(420, (mount?.clientWidth || 560)));
    const height = Math.round(width * 0.64);

    const marks = [];

    // Grid
    if (showGrid) {
      const lines = buildGrid(A, t, bounds, step, samples);
      for (const ln of lines) {
        marks.push(window.Plot.lineY(ln.pts, { x: 'x', y: 'y', stroke: (ln.kind==='v') ? '#475569' : '#475569', opacity: 0.25, strokeWidth: 1 }));
      }
    }

    // Unit circle and its image under interpolation
    if (showUnit) {
      const uc = unitCircle();
      const ucT = uc.map(p => interp(A, t, p));
      marks.push(window.Plot.lineY(uc, { x: 'x', y: 'y', stroke: '#94a3b8', opacity: 0.6 }));
      marks.push(window.Plot.lineY(ucT, { x: 'x', y: 'y', stroke: '#6f42c1', strokeWidth: 2.0, opacity: 0.9 }));
    }

    // Eigen-directions
    const EI = eig2(A);
    if (showEigen && EI.real) {
      const R = bounds * 0.95;
      const rays = [];
      for (const v of EI.vecs) {
        const p1 = { x: 0, y: 0 };
        const p2 = { x: v[0]*R, y: v[1]*R };
        marks.push(window.Plot.lineY([p1, p2], { x: 'x', y: 'y', stroke: '#22c55e', strokeWidth: 2.4 }));
        marks.push(window.Plot.lineY([p1, { x: -p2.x, y: -p2.y }], { x: 'x', y: 'y', stroke: '#22c55e', strokeWidth: 2.4 }));
      }
    }

    const fig = window.Plot.plot({
      width, height,
      marginLeft: 46, marginBottom: 44,
      x: { domain: [-bounds, bounds], grid: true },
      y: { domain: [-bounds, bounds], grid: true },
      style: { background: 'transparent', color: 'var(--text-secondary)' },
      marks
    });

    if (currentFig) { try { currentFig.remove(); } catch(_){} }
    if (mount) { mount.innerHTML=''; mount.appendChild(fig); currentFig = fig; }

    if (live) {
      if (EI.real) {
        const [l1, l2] = EI.values;
        live.textContent = `eigs: ${l1.toFixed(2)}, ${l2.toFixed(2)} — real; t=${t.toFixed(2)}`;
      } else {
        live.textContent = `complex eigenvalues (rotation-like); t=${t.toFixed(2)}`;
      }
    }
  }

  if (!Plot) {
    if (mount) mount.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">Plot library not loaded.</div>';
    return { destroy(){ containerEl.innerHTML=''; } };
  }

  Object.values(el).forEach(inp => inp && inp.addEventListener('input', render));
  render();

  return { destroy(){ try { Object.values(el).forEach(inp => inp && inp.removeEventListener('input', render)); } catch(_){} if (currentFig){ try{ currentFig.remove(); }catch(_){}} containerEl.innerHTML=''; } };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch4_eigen_invariance_plot'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch4_eigen_invariance_plot');
      }
    } catch (e) {
      console.error('Failed to register animation ch4_eigen_invariance_plot', e);
    }
  })();

  // ch4_quadratic_form_classifier.js
  (function(){
    // Chapter 4: Quadratic form Q(x)=x^T A x classifier (2x2 symmetric)
// Public API: init(containerEl, options) -> { destroy }
// Renders contour sets and eigen-based classification.

function init(containerEl, options = {}) {
  if (!containerEl) return { destroy() {} };

  function finiteOr(v, d) { const x = +v; return Number.isFinite(x) ? x : d; }

  const state = {
    a: finiteOr(options.a, 1),
    b: finiteOr(options.b, 0),
    c: finiteOr(options.c, 1),
    kBase: finiteOr(options.kBase, 1),
    showEigen: true,
    showLabels: true,
    bounds: finiteOr(options.bounds, 6)
  };

  containerEl.innerHTML = `
    <div class="anim anim--plot" style="margin:0.75rem 0;"> 
      <div class="anim__controls" style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <div class="anim__hint" style="flex:1 1 100%; color: var(--text-secondary); margin-bottom:0.25rem;">
          Quadratic form Q(x)=xᵀAx: adjust symmetric A and level |k| to see contours Q(x)=±k,±2k,±3k. Classification comes from eigenvalues of A.
        </div>
        <div style="display:flex; gap:0.5rem; align-items:center;">
          <span style="min-width:7ch; text-align:right; color:var(--text-secondary);">A =</span>
          <div style="display:inline-grid; grid-template-columns: auto auto; gap:0.25rem 0.35rem; align-items:center;">
            <input data-role="a" type="number" step="0.5" value="${state.a}" style="width:5rem;" title="a (top-left)" aria-label="a (top-left)">
            <input data-role="b" type="number" step="0.5" value="${state.b}" style="width:5rem;" title="b (off-diagonal)" aria-label="b (off-diagonal)">
            <input data-role="b" type="number" step="0.5" value="${state.b}" style="width:5rem;" title="b (off-diagonal)" aria-label="b (off-diagonal)">
            <input data-role="c" type="number" step="0.5" value="${state.c}" style="width:5rem;" title="c (bottom-right)" aria-label="c (bottom-right)">
          </div>
        </div>
        <label title="Base contour level |k|" style="display:flex; align-items:center; gap:0.5rem; min-width:260px;">
          <span style="min-width:8ch; text-align:right; color: var(--text-secondary);">|k|</span>
          <input data-role="k" type="range" min="0.2" max="5" step="0.1" value="${state.kBase}" aria-label="Base level |k|" />
        </label>
        <label style="display:inline-flex; gap:0.35rem; align-items:center;" title="Toggle eigen directions"><input data-role="eig" type="checkbox" ${state.showEigen?'checked':''} aria-label="Toggle eigen directions"/> eigen</label>
        <label style="display:inline-flex; gap:0.35rem; align-items:center;" title="Toggle bottom label"><input data-role="lab" type="checkbox" ${state.showLabels?'checked':''} aria-label="Toggle classification label"/> labels</label>
        <div role="status" aria-live="polite" data-role="live" style="color: var(--text-secondary);"></div>
      </div>
      <div class="anim__canvases" style="margin-top:0.6rem;">
        <div class="anim__canvas" data-role="plot"></div>
        <div class="anim__legend" style="margin-top:0.35rem; display:flex; gap:1rem; flex-wrap:wrap; color: var(--text-secondary);">
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#0ea5e9;"></span>Q(x)=+levels</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#ef4444;"></span>Q(x)=−levels (if defined)</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#22c55e;"></span>eigen dir 1</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#a3e635;"></span>eigen dir 2</span>
        </div>
        <div class="anim__caption" style="margin-top:0.25rem; color: var(--text-secondary);">
          Use: set A and |k|. If both eigenvalues are >0 (PD), only blue ellipses appear; if signs mix (indefinite), both blue/red curves appear; if one eigenvalue is 0, curves degenerate.
        </div>
      </div>
    </div>
  `;

  const Plot = (window && window.Plot) ? window.Plot : null;
  const mount = containerEl.querySelector('[data-role=plot]');
  const live = containerEl.querySelector('[data-role=live]');
  const el = {
    a: containerEl.querySelector('input[data-role=a]'),
    b: containerEl.querySelector('input[data-role=b]'),
    c: containerEl.querySelector('input[data-role=c]'),
    k: containerEl.querySelector('input[data-role=k]'),
    eig: containerEl.querySelector('input[data-role=eig]'),
    lab: containerEl.querySelector('input[data-role=lab]'),
  };

  function eig2sym(a,b,c) {
    // eigenvalues of [[a,b],[b,c]]
    const tr = a + c;
    const det = a*c - b*b;
    const disc = Math.max(0, tr*tr - 4*det);
    const s = Math.sqrt(disc);
    const l1 = (tr + s)/2; const l2 = (tr - s)/2;
    function eigenvec(l) {
      // Solve (A - lI)v = 0 → [a-l, b; b, c-l]
      const A11 = a - l, A12 = b, A21 = b, A22 = c - l;
      let v;
      if (Math.abs(A12) + Math.abs(A11) > Math.abs(A21) + Math.abs(A22)) {
        if (Math.abs(A12) > 1e-9) v = [ -A11/A12, 1 ]; else v = [1, 0];
      } else {
        if (Math.abs(A22) > 1e-9) v = [ 1, -A21/A22 ]; else v = [0, 1];
      }
      const n = Math.hypot(v[0], v[1]) || 1; return [ v[0]/n, v[1]/n ];
    }
    return { values:[l1,l2], vecs:[ eigenvec(l1), eigenvec(l2) ], det, tr };
  }

  function classify(l1,l2) {
    const eps = 1e-9;
    const p = (x)=> x>eps, n=(x)=> x<-eps, z=(x)=> Math.abs(x)<=eps;
    if (p(l1) && p(l2)) return 'Positive definite';
    if (n(l1) && n(l2)) return 'Negative definite';
    if ((p(l1)&&z(l2)) || (p(l2)&&z(l1))) return 'Positive semidefinite';
    if ((n(l1)&&z(l2)) || (n(l2)&&z(l1))) return 'Negative semidefinite';
    return 'Indefinite';
  }

  function contourPoints(a,b,c,k,thetaSteps=512, rMax=state.bounds*1.2) {
    // Param: x = r u where u=(cosθ,sinθ), r^2 u^T A u = k → r = sqrt(k / denom)
    const pts = [];
    for (let i=0;i<=thetaSteps;i++) {
      const th = (i/thetaSteps)*2*Math.PI;
      const u1 = Math.cos(th), u2 = Math.sin(th);
      const denom = a*u1*u1 + 2*b*u1*u2 + c*u2*u2;
      if (Math.abs(denom) < 1e-12) { pts.push(null); continue; }
      const val = k/denom;
      if (val <= 0) { pts.push(null); continue; }
      const r = Math.sqrt(val);
      if (!Number.isFinite(r) || r>rMax) { pts.push(null); continue; }
      pts.push({ x: r*u1, y: r*u2 });
    }
    // Convert to polylines separated at nulls
    const lines = [];
    let cur = [];
    for (const p of pts) {
      if (!p) { if (cur.length>1) lines.push(cur); cur=[]; }
      else { cur.push(p); }
    }
    if (cur.length>1) lines.push(cur);
    return lines;
  }

  let currentFig = null;
  function render() {
    const a = +el.a.value, b = +el.b.value, c = +el.c.value;
    const kBase = +el.k.value;
    const showEigen = !!el.eig.checked;
    const showLabels = !!el.lab.checked;

    const { values:[l1,l2], vecs:[v1,v2], det, tr } = eig2sym(a,b,c);
    const cls = classify(l1,l2);

    const marks = [];

    // Draw several contour levels when meaningful
    const levels = [kBase, 2*kBase, 3*kBase];
    // Positive-level contours
    for (const k of levels) {
      const polys = contourPoints(a,b,c,k);
      polys.forEach(poly => marks.push(window.Plot.lineY(poly, { x:'x', y:'y', stroke:'#0ea5e9', opacity:0.9 })));
    }
    // Negative-level contours (for ND or Indef)
    for (const k of levels) {
      const polysN = contourPoints(a,b,c,-k);
      polysN.forEach(poly => marks.push(window.Plot.lineY(poly, { x:'x', y:'y', stroke:'#ef4444', opacity:0.9 })));
    }

    // Eigenvectors
    if (showEigen) {
      const R = state.bounds * 0.95;
      marks.push(window.Plot.lineY([{x:0,y:0},{x:v1[0]*R,y:v1[1]*R}], { x:'x', y:'y', stroke:'#22c55e', strokeWidth:2.2 }));
      marks.push(window.Plot.lineY([{x:0,y:0},{x:-v1[0]*R,y:-v1[1]*R}], { x:'x', y:'y', stroke:'#22c55e', strokeWidth:2.2 }));
      marks.push(window.Plot.lineY([{x:0,y:0},{x:v2[0]*R,y:v2[1]*R}], { x:'x', y:'y', stroke:'#a3e635', strokeWidth:2.2 }));
      marks.push(window.Plot.lineY([{x:0,y:0},{x:-v2[0]*R,y:-v2[1]*R}], { x:'x', y:'y', stroke:'#a3e635', strokeWidth:2.2 }));
    }

    // Labels
    if (showLabels) {
      marks.push(window.Plot.text([{ x: 0, y: -state.bounds*0.9, label: `${cls} — eigs=(${l1.toFixed(2)}, ${l2.toFixed(2)})` }], { x:'x', y:'y', text:'label', textAnchor:'middle', fill:'var(--text-secondary)' }));
    }

    const width = Math.min(820, Math.max(420, (mount?.clientWidth || 560)));
    const height = Math.round(width * 0.64);
    const fig = window.Plot.plot({
      width, height,
      marginLeft: 46, marginBottom: 44,
      x: { domain: [-state.bounds, state.bounds], grid: true },
      y: { domain: [-state.bounds, state.bounds], grid: true },
      style: { background: 'transparent', color: 'var(--text-secondary)' },
      marks
    });

    if (currentFig) { try { currentFig.remove(); } catch(_){} }
    if (mount) { mount.innerHTML=''; mount.appendChild(fig); currentFig = fig; }

    if (live) {
      live.textContent = `tr(A)=${tr.toFixed(2)}, det(A)=${det.toFixed(2)}, classification: ${cls}`;
    }
  }

  if (!Plot) {
    if (mount) mount.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">Plot library not loaded.</div>';
    return { destroy(){ containerEl.innerHTML=''; } };
  }

  Object.values(el).forEach(inp => inp && inp.addEventListener('input', render));
  render();

  return { destroy(){ try { Object.values(el).forEach(inp => inp && inp.removeEventListener('input', render)); } catch(_){} if (currentFig){ try{ currentFig.remove(); }catch(_){}} containerEl.innerHTML=''; } };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch4_quadratic_form_classifier'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch4_quadratic_form_classifier');
      }
    } catch (e) {
      console.error('Failed to register animation ch4_quadratic_form_classifier', e);
    }
  })();

  // ch4_stability_dynamics.js
  (function(){
    // Chapter 4: Stability of linear dynamic systems xₜ₊₁ = Axₜ
// Public API: init(containerEl, options) -> { destroy }

function init(containerEl, options = {}) {
  if (!containerEl) return { destroy() {} };

  function finiteOr(v, d) { const x = +v; return Number.isFinite(x) ? x : d; }

  const state = {
    a: finiteOr(options.a, 0.8), b: finiteOr(options.b, 0.3),
    c: finiteOr(options.c, -0.2), d: finiteOr(options.d, 0.9),
    x0: finiteOr(options.x0, 1.5), y0: finiteOr(options.y0, 1.0),
    steps: finiteOr(options.steps, 20),
    running: false,
    currentStep: 0,
    trajectory: []
  };

  containerEl.innerHTML = `
    <div class="anim anim--plot" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <div class="anim__hint" style="flex:1 1 100%; color: var(--text-secondary); margin-bottom:0.25rem;">
          Linear dynamics: xₜ₊₁ = Axₜ. Stability depends on eigenvalues: |λᵢ| < 1 → stable (converges), |λᵢ| > 1 → unstable (explodes).
        </div>
        <div style="display:flex; gap:0.5rem; align-items:center;">
          <span style="min-width:7ch; text-align:right; color:var(--text-secondary);">A =</span>
          <div style="display:inline-grid; grid-template-columns: auto auto; gap:0.25rem 0.35rem; align-items:center;">
            <input data-role="a" type="number" step="0.1" value="${state.a}" style="width:5rem;" aria-label="A[0,0]">
            <input data-role="b" type="number" step="0.1" value="${state.b}" style="width:5rem;" aria-label="A[0,1]">
            <input data-role="c" type="number" step="0.1" value="${state.c}" style="width:5rem;" aria-label="A[1,0]">
            <input data-role="d" type="number" step="0.1" value="${state.d}" style="width:5rem;" aria-label="A[1,1]">
          </div>
        </div>
        <div style="display:flex; gap:0.5rem; align-items:center;">
          <span style="min-width:7ch; text-align:right; color:var(--text-secondary);">x₀ =</span>
          <input data-role="x0" type="number" step="0.1" value="${state.x0}" style="width:5rem;" aria-label="Initial x">
          <input data-role="y0" type="number" step="0.1" value="${state.y0}" style="width:5rem;" aria-label="Initial y">
        </div>
        <label style="display:flex; align-items:center; gap:0.5rem;">
          <span style="color: var(--text-secondary);">Steps:</span>
          <input data-role="steps" type="number" min="5" max="100" value="${state.steps}" style="width:5rem;" aria-label="Number of steps">
        </label>
        <button data-role="run" style="padding:0.4rem 0.9rem; cursor:pointer;">Run</button>
        <button data-role="reset" style="padding:0.4rem 0.9rem; cursor:pointer;">Reset</button>
        <div role="status" aria-live="polite" data-role="live" style="color: var(--text-secondary);"></div>
      </div>
      <div class="anim__canvases" style="margin-top:0.6rem;">
        <div class="anim__canvas" data-role="plot"></div>
        <div class="anim__legend" style="margin-top:0.35rem; display:flex; gap:1rem; flex-wrap:wrap; color: var(--text-secondary);">
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#22c55e;"></span>eigen-directions (if real)</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:12px; height:12px; background:#3b82f6; border-radius:50%;"></span>trajectory xₜ</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:12px; height:12px; background:#ef4444; border-radius:50%;"></span>x₀ (initial)</span>
        </div>
        <div class="anim__caption" style="margin-top:0.25rem; color: var(--text-secondary);">
          Click "Run" to iterate xₜ₊₁ = Axₜ. Green lines show eigen-directions; trajectory converges if all |λᵢ| < 1.
        </div>
      </div>
    </div>
  `;

  const Plot = (window && window.Plot) ? window.Plot : null;
  const mount = containerEl.querySelector('[data-role=plot]');
  const live = containerEl.querySelector('[data-role=live]');

  const el = {
    a: containerEl.querySelector('input[data-role=a]'),
    b: containerEl.querySelector('input[data-role=b]'),
    c: containerEl.querySelector('input[data-role=c]'),
    d: containerEl.querySelector('input[data-role=d]'),
    x0: containerEl.querySelector('input[data-role=x0]'),
    y0: containerEl.querySelector('input[data-role=y0]'),
    steps: containerEl.querySelector('input[data-role=steps]'),
    run: containerEl.querySelector('button[data-role=run]'),
    reset: containerEl.querySelector('button[data-role=reset]')
  };

  function apply(A, p) { return { x: A[0]*p.x + A[1]*p.y, y: A[2]*p.x + A[3]*p.y }; }

  function eig2(A) {
    const [a,b,c,d] = A;
    const tr = a + d;
    const det = a*d - b*c;
    const disc = tr*tr - 4*det;
    if (disc < 0) return { real: false, values: [], vecs: [] };
    const s = Math.sqrt(disc);
    const l1 = (tr + s)/2, l2 = (tr - s)/2;
    function eigenvec(l) {
      const A11=a-l, A12=b, A21=c, A22=d-l;
      let v = null;
      if (Math.abs(A12) > 1e-9) {
        v = [ -A11/A12, 1 ];
      } else if (Math.abs(A21) > 1e-9) {
        v = [ 1, -A21/A22 ];
      } else {
        v = [1, 0];
      }
      const n = Math.hypot(v[0], v[1]) || 1;
      return [ v[0]/n, v[1]/n ];
    }
    const v1 = eigenvec(l1), v2 = eigenvec(l2);
    return { real: true, values: [l1, l2], vecs: [v1, v2] };
  }

  function computeTrajectory() {
    const A = [ +el.a.value, +el.b.value, +el.c.value, +el.d.value ];
    const x0 = { x: +el.x0.value, y: +el.y0.value };
    const steps = Math.max(5, Math.min(100, +el.steps.value));
    
    const traj = [x0];
    let current = x0;
    for (let i = 0; i < steps; i++) {
      current = apply(A, current);
      traj.push(current);
      // Safety: stop if exploding
      if (Math.abs(current.x) > 1e6 || Math.abs(current.y) > 1e6) break;
    }
    return traj;
  }

  let currentFig = null;
  function render() {
    const A = [ +el.a.value, +el.b.value, +el.c.value, +el.d.value ];
    const traj = state.trajectory.length > 0 ? state.trajectory : [{ x: +el.x0.value, y: +el.y0.value }];

    const width = Math.min(820, Math.max(420, (mount?.clientWidth || 560)));
    const height = Math.round(width * 0.64);

    // Compute bounds from trajectory
    let maxR = 3;
    for (const p of traj) {
      const r = Math.hypot(p.x, p.y);
      if (r > maxR && r < 1e5) maxR = r;
    }
    const bounds = Math.min(Math.max(3, maxR * 1.2), 50);

    const marks = [];

    // Eigen-directions
    const EI = eig2(A);
    if (EI.real) {
      const R = bounds * 0.95;
      for (const v of EI.vecs) {
        const p1 = { x: 0, y: 0 };
        const p2 = { x: v[0]*R, y: v[1]*R };
        marks.push(window.Plot.lineY([p1, p2], { x: 'x', y: 'y', stroke: '#22c55e', strokeWidth: 2.0, opacity: 0.7 }));
        marks.push(window.Plot.lineY([p1, { x: -p2.x, y: -p2.y }], { x: 'x', y: 'y', stroke: '#22c55e', strokeWidth: 2.0, opacity: 0.7 }));
      }
    }

    // Trajectory line
    if (traj.length > 1) {
      marks.push(window.Plot.lineY(traj, { x: 'x', y: 'y', stroke: '#3b82f6', strokeWidth: 2.0, opacity: 0.8 }));
    }

    // Trajectory points
    marks.push(window.Plot.dot(traj, { x: 'x', y: 'y', fill: '#3b82f6', r: 4, opacity: 0.7 }));

    // Initial point (highlight)
    if (traj.length > 0) {
      marks.push(window.Plot.dot([traj[0]], { x: 'x', y: 'y', fill: '#ef4444', r: 6, stroke: '#fff', strokeWidth: 1.5 }));
    }

    // Origin
    marks.push(window.Plot.dot([{ x: 0, y: 0 }], { x: 'x', y: 'y', fill: '#64748b', r: 5, opacity: 0.6 }));

    const fig = window.Plot.plot({
      width, height,
      marginLeft: 50, marginBottom: 44,
      x: { domain: [-bounds, bounds], grid: true, label: 'x' },
      y: { domain: [-bounds, bounds], grid: true, label: 'y' },
      style: { background: 'transparent', color: 'var(--text-secondary)' },
      marks
    });

    if (currentFig) { try { currentFig.remove(); } catch(_){} }
    if (mount) { mount.innerHTML=''; mount.appendChild(fig); currentFig = fig; }

    if (live) {
      if (EI.real) {
        const [l1, l2] = EI.values;
        const stable = Math.abs(l1) < 1 && Math.abs(l2) < 1;
        const status = stable ? 'stable (|λᵢ| < 1)' : 'unstable (some |λᵢ| ≥ 1)';
        live.textContent = `λ₁=${l1.toFixed(3)}, λ₂=${l2.toFixed(3)} — ${status}`;
      } else {
        live.textContent = `complex eigenvalues (rotation-like)`;
      }
    }
  }

  function handleRun() {
    state.trajectory = computeTrajectory();
    render();
  }

  function handleReset() {
    state.trajectory = [];
    render();
  }

  if (!Plot) {
    if (mount) mount.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">Plot library not loaded.</div>';
    return { destroy(){ containerEl.innerHTML=''; } };
  }

  [el.a, el.b, el.c, el.d].forEach(inp => inp && inp.addEventListener('input', () => {
    state.trajectory = [];
    render();
  }));
  [el.x0, el.y0, el.steps].forEach(inp => inp && inp.addEventListener('input', handleReset));
  el.run && el.run.addEventListener('click', handleRun);
  el.reset && el.reset.addEventListener('click', handleReset);

  render();

  return {
    destroy() {
      try {
        [el.a, el.b, el.c, el.d, el.x0, el.y0, el.steps].forEach(inp => inp && inp.removeEventListener('input', render));
        el.run && el.run.removeEventListener('click', handleRun);
        el.reset && el.reset.removeEventListener('click', handleReset);
      } catch(_){}
      if (currentFig){ try{ currentFig.remove(); }catch(_){}}
      containerEl.innerHTML='';
    }
  };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch4_stability_dynamics'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch4_stability_dynamics');
      }
    } catch (e) {
      console.error('Failed to register animation ch4_stability_dynamics', e);
    }
  })();

  // ch5_chain_rule_blocks.js
  (function(){
    // Chapter 5: Chain rule composition diagram
// Public API: init(containerEl, options) -> { destroy }

function init(containerEl, options = {}) {
  if (!containerEl) return { destroy() {} };

  function finiteOr(v, d) { const x = +v; return Number.isFinite(x) ? x : d; }

  const state = {
    n: finiteOr(options.n, 2),
    m: finiteOr(options.m, 3),
    k: finiteOr(options.k, 1)
  };

  containerEl.innerHTML = `
    <div class="anim anim--diagram" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <div class="anim__hint" style="flex:1 1 100%; color: var(--text-secondary); margin-bottom:0.25rem;">
          Chain rule: J_{g∘f}(x) = J_g(f(x)) · J_f(x). Dimensions must match for composition.
        </div>
        <label style="display:flex; align-items:center; gap:0.5rem;">
          <span style="color: var(--text-secondary);">n (input dim)</span>
          <input data-role="n" type="number" min="1" max="5" step="1" value="${state.n}" style="width:4rem;" aria-label="input dimension n"/>
        </label>
        <label style="display:flex; align-items:center; gap:0.5rem;">
          <span style="color: var(--text-secondary);">m (intermediate)</span>
          <input data-role="m" type="number" min="1" max="5" step="1" value="${state.m}" style="width:4rem;" aria-label="intermediate dimension m"/>
        </label>
        <label style="display:flex; align-items:center; gap:0.5rem;">
          <span style="color: var(--text-secondary);">k (output dim)</span>
          <input data-role="k" type="number" min="1" max="5" step="1" value="${state.k}" style="width:4rem;" aria-label="output dimension k"/>
        </label>
      </div>
      <div class="anim__diagram-content" data-role="diagram" style="margin-top:1rem; padding:1.5rem; background:var(--bg-secondary); border-radius:0.5rem;">
      </div>
      <div class="anim__caption" style="margin-top:0.5rem; color: var(--text-secondary);">
        Composition: x ∈ ℝⁿ → f(x) ∈ ℝᵐ → g(f(x)) ∈ ℝᵏ. Matrix multiplication: (k×m)·(m×n) = (k×n).
      </div>
    </div>
  `;

  const diagramEl = containerEl.querySelector('[data-role=diagram]');

  const el = {
    n: containerEl.querySelector('input[data-role=n]'),
    m: containerEl.querySelector('input[data-role=m]'),
    k: containerEl.querySelector('input[data-role=k]')
  };

  function render() {
    const n = Math.max(1, Math.min(5, +el.n.value));
    const m = Math.max(1, Math.min(5, +el.m.value));
    const k = Math.max(1, Math.min(5, +el.k.value));

    diagramEl.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:center; gap:2rem; flex-wrap:wrap;">
        <div style="text-align:center;">
          <div style="padding:1rem 1.5rem; background:var(--bg-primary); border:2px solid #3b82f6; border-radius:0.5rem; font-weight:500;">
            x ∈ ℝⁿ
          </div>
          <div style="margin-top:0.3rem; color:var(--text-secondary); font-size:0.9rem;">n = ${n}</div>
        </div>

        <div style="text-align:center;">
          <div style="font-size:1.5rem; color:var(--text-primary);">→</div>
          <div style="margin-top:0.3rem; padding:0.4rem 0.8rem; background:#3b82f6; color:white; border-radius:0.3rem; font-size:0.85rem;">
            J_f(x)
          </div>
          <div style="margin-top:0.2rem; color:var(--text-secondary); font-size:0.85rem;">(m×n) = (${m}×${n})</div>
        </div>

        <div style="text-align:center;">
          <div style="padding:1rem 1.5rem; background:var(--bg-primary); border:2px solid #8b5cf6; border-radius:0.5rem; font-weight:500;">
            f(x) ∈ ℝᵐ
          </div>
          <div style="margin-top:0.3rem; color:var(--text-secondary); font-size:0.9rem;">m = ${m}</div>
        </div>

        <div style="text-align:center;">
          <div style="font-size:1.5rem; color:var(--text-primary);">→</div>
          <div style="margin-top:0.3rem; padding:0.4rem 0.8rem; background:#8b5cf6; color:white; border-radius:0.3rem; font-size:0.85rem;">
            J_g(f(x))
          </div>
          <div style="margin-top:0.2rem; color:var(--text-secondary); font-size:0.85rem;">(k×m) = (${k}×${m})</div>
        </div>

        <div style="text-align:center;">
          <div style="padding:1rem 1.5rem; background:var(--bg-primary); border:2px solid #ef4444; border-radius:0.5rem; font-weight:500;">
            g(f(x)) ∈ ℝᵏ
          </div>
          <div style="margin-top:0.3rem; color:var(--text-secondary); font-size:0.9rem;">k = ${k}</div>
        </div>
      </div>

      <div style="margin-top:2rem; padding:1rem; background:var(--bg-primary); border-left:4px solid #22c55e; border-radius:0.3rem;">
        <div style="font-weight:600; margin-bottom:0.5rem; color:var(--text-primary);">Chain Rule Result:</div>
        <div style="font-family:monospace; font-size:1.05rem; color:var(--text-primary);">
          J_{g∘f}(x) = J_g(f(x)) · J_f(x)
        </div>
        <div style="margin-top:0.4rem; color:var(--text-secondary); font-size:0.9rem;">
          Dimensions: (${k}×${m}) · (${m}×${n}) = (${k}×${n})
        </div>
        <div style="margin-top:0.4rem; color:var(--text-secondary); font-size:0.85rem; font-style:italic;">
          Note: Rightmost matrix (J_f) is applied first; composition reads right-to-left.
        </div>
      </div>
    `;
  }

  Object.values(el).forEach(inp => inp && inp.addEventListener('input', render));
  render();

  return { destroy(){ try { Object.values(el).forEach(inp => inp && inp.removeEventListener('input', render)); } catch(_){} containerEl.innerHTML=''; } };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch5_chain_rule_blocks'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch5_chain_rule_blocks');
      }
    } catch (e) {
      console.error('Failed to register animation ch5_chain_rule_blocks', e);
    }
  })();

  // ch5_directional_derivative_dot.js
  (function(){
    // Chapter 5: Directional derivative (3D wrapper)
// Public API: init(containerEl, options) -> { destroy }

function init(containerEl, options = {}) {
  if (!containerEl) return { destroy() {} };
  let childInst = null;
  let destroyed = false;
  try { containerEl.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">Loading 3D directional derivative…</div>'; } catch(_){}
  import('./ch5_directional_derivative_surface_3d.js')
    .then(mod => {
      if (destroyed) return;
      if (mod && typeof mod.init === 'function') {
        try { childInst = mod.init(containerEl, options) || null; } catch(e) { console.error('3D dir deriv init error', e); }
      }
    })
    .catch(() => {
      try { containerEl.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">Failed to load 3D module.</div>'; } catch(_){}
    });
  return {
    destroy() {
      destroyed = true;
      try { if (childInst && typeof childInst.destroy === 'function') childInst.destroy(); } catch(_){}
      try { containerEl.innerHTML = ''; } catch(_){}
    }
  };
}

// OLD 2D implementation removed

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch5_directional_derivative_dot'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch5_directional_derivative_dot');
      }
    } catch (e) {
      console.error('Failed to register animation ch5_directional_derivative_dot', e);
    }
  })();

  // ch5_directional_derivative_surface_3d.js
  (function(){
    // Chapter 5: Directional derivative on 3D surface
// Public API: init(containerEl, options) -> { destroy }

function init(containerEl, options = {}) {
  if (!containerEl) return { destroy() {} };

  function finiteOr(v, d) { const x = +v; return Number.isFinite(x) ? x : d; }

  const state = {
    f: options.f || 'x^2+y^2',
    ax: finiteOr(options.ax, 1),
    ay: finiteOr(options.ay, 1),
    theta: finiteOr(options.theta, 0.5),
    bounds: finiteOr(options.bounds, 2.5),
    res: 40
  };

  containerEl.innerHTML = `
    <div class="anim anim--plot" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <div class="anim__hint" style="flex:1 1 100%; color: var(--text-secondary); margin-bottom:0.25rem;">
          D_u f(a) = ∇f(a)·u = ‖∇f(a)‖ cos(θ). Rotate u to see directional derivative change; max at θ=0 (gradient direction).
        </div>
        <label style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:2ch; color: var(--text-secondary);">x</span>
          <input data-role="ax" type="range" min="-2" max="2" step="0.1" value="${state.ax}" style="width:140px;" aria-label="x"/>
          <span data-role="ax-val" style="min-width:4ch; font-variant-numeric:tabular-nums;">${state.ax.toFixed(1)}</span>
        </label>
        <label style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:2ch; color: var(--text-secondary);">y</span>
          <input data-role="ay" type="range" min="-2" max="2" step="0.1" value="${state.ay}" style="width:140px;" aria-label="y"/>
          <span data-role="ay-val" style="min-width:4ch; font-variant-numeric:tabular-nums;">${state.ay.toFixed(1)}</span>
        </label>
        <label style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:2ch; color: var(--text-secondary);">θ</span>
          <input data-role="theta" type="range" min="0" max="${2*Math.PI}" step="0.05" value="${state.theta}" style="width:180px;" aria-label="angle"/>
          <span data-role="theta-val" style="min-width:5ch; font-variant-numeric:tabular-nums;">${state.theta.toFixed(2)}</span>
        </label>
        <div role="status" aria-live="polite" data-role="live" style="color: var(--text-secondary);"></div>
      </div>
      <div class="anim__canvases" style="margin-top:0.6rem;">
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
          <div>
            <div style="font-weight:500; margin-bottom:0.3rem; color:var(--text-primary);">3D Surface View</div>
            <div class="anim__canvas" data-role="plot-3d" style="width:100%; height:480px;"></div>
          </div>
          <div>
            <div style="font-weight:500; margin-bottom:0.3rem; color:var(--text-primary);">2D Contour View</div>
            <div class="anim__canvas" data-role="plot-2d" style="width:100%; height:480px;"></div>
          </div>
        </div>
        <div class="anim__legend" style="margin-top:0.5rem; display:flex; gap:1rem; flex-wrap:wrap; color: var(--text-secondary);">
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#ef4444;"></span>∇f(a)</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#3b82f6;"></span>direction u(θ)</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#8b5cf6;"></span>directional slice</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#f97316;"></span>(∂f/∂x)·u_x + (∂f/∂y)·u_y</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:12px; height:12px; background:#22c55e; border-radius:50%;"></span>(x,y,f)</span>
        </div>
      </div>
    </div>
  `;

  const mount3D = containerEl.querySelector('[data-role=plot-3d]');
  const mount2D = containerEl.querySelector('[data-role=plot-2d]');
  const live = containerEl.querySelector('[data-role=live]');
  const el = {
    ax: containerEl.querySelector('input[data-role=ax]'),
    ay: containerEl.querySelector('input[data-role=ay]'),
    theta: containerEl.querySelector('input[data-role=theta]'),
    axVal: containerEl.querySelector('[data-role=ax-val]'),
    ayVal: containerEl.querySelector('[data-role=ay-val]'),
    thetaVal: containerEl.querySelector('[data-role=theta-val]')
  };

  let currentCamera = null;
  let currentFig2D = null;

  function loadPlotly() {
    return new Promise((resolve, reject) => {
      if (window.Plotly) return resolve(window.Plotly);
      const scriptId = 'plotly-cdn-script';
      const existing = document.getElementById(scriptId);
      if (existing) {
        existing.addEventListener('load', () => resolve(window.Plotly));
        existing.addEventListener('error', reject);
        return;
      }
      const s = document.createElement('script');
      s.id = scriptId;
      s.src = 'https://cdn.plot.ly/plotly-2.27.0.min.js';
      s.async = true;
      s.onload = () => resolve(window.Plotly);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function evalF(x, y) {
    try {
      const expr = state.f.replace(/\^/g, '**').replace(/x/g, `(${x})`).replace(/y/g, `(${y})`);
      return eval(expr);
    } catch(e) {
      return x*x + y*y;
    }
  }

  function partialX(x, y, h=1e-3) { return (evalF(x+h, y) - evalF(x-h, y)) / (2*h); }
  function partialY(x, y, h=1e-3) { return (evalF(x, y+h) - evalF(x, y-h)) / (2*h); }

  let destroyed = false;
  let plotReady = false;

  function buildData() {
    const B = state.bounds;
    const N = state.res|0;
    const xs = Array.from({length: N}, (_,i) => -B + (2*B*i)/(N-1));
    const ys = Array.from({length: N}, (_,j) => -B + (2*B*j)/(N-1));
    const Z = ys.map(y => xs.map(x => evalF(x,y)));

    const ax = state.ax, ay = state.ay, fa = evalF(ax, ay);
    const px = partialX(ax, ay), py = partialY(ax, ay);
    const gradMag = Math.hypot(px, py);
    const theta = state.theta;

    // Direction u(theta)
    const ux = Math.cos(theta);
    const uy = Math.sin(theta);
    const Du = px * ux + py * uy;

    // Gradient arrow
    const scaleG = Math.min(1.2, B * 0.35);
    const gx = (gradMag > 1e-6) ? (px / gradMag) * scaleG : 0;
    const gy = (gradMag > 1e-6) ? (py / gradMag) * scaleG : 0;
    const gz = (gradMag > 1e-6) ? (px * gx + py * gy) : 0;

    // Direction arrow u
    const scaleU = Math.min(1.2, B * 0.35);
    const uxS = ux * scaleU;
    const uyS = uy * scaleU;
    const uzS = px * uxS + py * uyS; // height change along u

    // Directional slice: line from a in direction u on surface
    const slicePts = [];
    const steps = 50;
    for (let i = -steps; i <= steps; i++) {
      const t = (i / steps) * 1.5;
      const x = ax + ux * t;
      const y = ay + uy * t;
      if (Math.abs(x) <= B && Math.abs(y) <= B) {
        slicePts.push({ x, y, z: evalF(x, y) });
      }
    }

    return { xs, ys, Z, ax, ay, fa, px, py, gx, gy, gz, uxS, uyS, uzS, gradMag, Du, slicePts, theta };
  }

  function layoutFor(B) {
    const css = getComputedStyle(document.documentElement);
    const textColor = (css.getPropertyValue('--text-secondary') || '#a0a0a0').trim();
    return {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: { l: 0, r: 0, t: 0, b: 0 },
      scene: {
        bgcolor: 'rgba(0,0,0,0)',
        xaxis: { title: 'x', color: textColor, gridcolor: textColor, zerolinecolor: textColor, range: [-B, B] },
        yaxis: { title: 'y', color: textColor, gridcolor: textColor, zerolinecolor: textColor, range: [-B, B] },
        zaxis: { title: 'z', color: textColor, gridcolor: textColor, zerolinecolor: textColor },
        camera: { eye: { x: 1.6, y: 1.2, z: 0.9 } }
      },
      showlegend: false
    };
  }

  function buildTraces(d) {
    const surface = {
      type: 'surface',
      x: d.xs,
      y: d.ys,
      z: d.Z,
      colorscale: 'Viridis',
      showscale: false,
      opacity: 0.88
    };

    const point = {
      type: 'scatter3d', mode: 'markers',
      x: [d.ax], y: [d.ay], z: [d.fa],
      marker: { color: '#22c55e', size: 6 },
      name: 'point'
    };

    // Gradient arrow
    const grad = {
      type: 'scatter3d', mode: 'lines',
      x: [d.ax, d.ax + d.gx],
      y: [d.ay, d.ay + d.gy],
      z: [d.fa, d.fa + d.gz],
      line: { color: '#ef4444', width: 10 },
      name: 'gradient'
    };

    // Direction u arrow
    const dirU = {
      type: 'scatter3d', mode: 'lines',
      x: [d.ax, d.ax + d.uxS],
      y: [d.ay, d.ay + d.uyS],
      z: [d.fa, d.fa + d.uzS],
      line: { color: '#3b82f6', width: 10 },
      name: 'direction u'
    };

    // Directional slice on surface
    const slice = {
      type: 'scatter3d', mode: 'lines',
      x: d.slicePts.map(p => p.x),
      y: d.slicePts.map(p => p.y),
      z: d.slicePts.map(p => p.z),
      line: { color: '#8b5cf6', width: 5 },
      name: 'slice along u'
    };

    // Decomposition components in 3D (showing the sum visually)
    // Component 1: horizontal step (∂f/∂x)·u_x
    const ux = Math.cos(d.theta), uy = Math.sin(d.theta);
    const comp1Len = 0.4;
    const comp1X = d.ax + ux * comp1Len;
    const comp1Z = d.fa + d.px * (ux * comp1Len);
    
    const comp1 = {
      type: 'scatter3d', mode: 'lines',
      x: [d.ax, comp1X],
      y: [d.ay, d.ay + uy * comp1Len],
      z: [d.fa, comp1Z],
      line: { color: '#f97316', width: 6, dash: 'dot' },
      name: 'partial x component'
    };

    // Component 2: from end of comp1
    const comp2Z = comp1Z + d.py * (uy * comp1Len);
    const comp2 = {
      type: 'scatter3d', mode: 'lines',
      x: [comp1X, comp1X],
      y: [d.ay + uy * comp1Len, d.ay + uy * comp1Len],
      z: [comp1Z, comp2Z],
      line: { color: '#f97316', width: 6, dash: 'dot' },
      name: 'partial y component'
    };

    return [surface, slice, point, grad, dirU, comp1, comp2];
  }

  async function render() {
    if (destroyed) return;
    el.axVal.textContent = (+el.ax.value).toFixed(1);
    el.ayVal.textContent = (+el.ay.value).toFixed(1);
    el.thetaVal.textContent = (+el.theta.value).toFixed(2);
    state.ax = +el.ax.value;
    state.ay = +el.ay.value;
    state.theta = +el.theta.value;

    try {
      const Plotly = await loadPlotly();
      const Plot = window.Plot;

      // Capture camera
      if (plotReady && mount3D && mount3D.layout && mount3D.layout.scene && mount3D.layout.scene.camera) {
        currentCamera = JSON.parse(JSON.stringify(mount3D.layout.scene.camera));
      }

      const d = buildData();
      const traces3D = buildTraces(d);
      const layout3D = layoutFor(state.bounds);

      if (currentCamera) {
        layout3D.scene.camera = currentCamera;
      }

      const config = { displayModeBar: false, responsive: true };
      
      // Render 3D
      if (!plotReady) {
        await Plotly.newPlot(mount3D, traces3D, layout3D, config);
        plotReady = true;
      } else {
        await Plotly.react(mount3D, traces3D, layout3D, config);
      }

      // Render 2D contour with decomposition
      if (Plot && mount2D) {
        const bounds = state.bounds;
        const gridSize = 70;
        const contourData = [];
        for (let i = 0; i <= gridSize; i++) {
          for (let j = 0; j <= gridSize; j++) {
            const x = -bounds + (i * 2 * bounds) / gridSize;
            const y = -bounds + (j * 2 * bounds) / gridSize;
            contourData.push({ x, y, z: evalF(x, y) });
          }
        }

        const marks2D = [];
        marks2D.push(Plot.contour(contourData, {
          x: 'x', y: 'y', z: 'z',
          stroke: '#94a3b8',
          strokeWidth: 1.2,
          thresholds: 12,
          opacity: 0.6
        }));

        const ux = Math.cos(state.theta);
        const uy = Math.sin(state.theta);

        // Show decomposition: D_u f = (∂f/∂x)·u_x + (∂f/∂y)·u_y
        // Draw partial derivative components scaled by u_x and u_y
        const scalePartial = 0.8;
        
        // Component 1: (∂f/∂x)·u_x in x-direction
        const comp1Scale = (d.px * ux) * scalePartial / (d.gradMag + 1e-6);
        marks2D.push(Plot.arrow([{ x1: d.ax, y1: d.ay, x2: d.ax + comp1Scale, y2: d.ay }], {
          x1: 'x1', y1: 'y1', x2: 'x2', y2: 'y2',
          stroke: '#f97316', strokeWidth: 2.5, headLength: 10, opacity: 0.8
        }));

        // Component 2: (∂f/∂y)·u_y in y-direction (from end of comp1)
        const comp2Scale = (d.py * uy) * scalePartial / (d.gradMag + 1e-6);
        marks2D.push(Plot.arrow([{ x1: d.ax + comp1Scale, y1: d.ay, x2: d.ax + comp1Scale, y2: d.ay + comp2Scale }], {
          x1: 'x1', y1: 'y1', x2: 'x2', y2: 'y2',
          stroke: '#f97316', strokeWidth: 2.5, headLength: 10, opacity: 0.8
        }));

        // Gradient arrow (for reference)
        const scaleG = 1.0;
        const gx = (d.gradMag > 1e-6) ? (d.px / d.gradMag) * scaleG : 0;
        const gy = (d.gradMag > 1e-6) ? (d.py / d.gradMag) * scaleG : 0;
        marks2D.push(Plot.arrow([{ x1: d.ax, y1: d.ay, x2: d.ax + gx, y2: d.ay + gy }], {
          x1: 'x1', y1: 'y1', x2: 'x2', y2: 'y2',
          stroke: '#ef4444', strokeWidth: 3, headLength: 14, opacity: 0.7
        }));

        // Direction u arrow (scaled to show D_u f magnitude)
        const uScale = Math.abs(d.Du) * scalePartial / (d.gradMag + 1e-6);
        marks2D.push(Plot.arrow([{ x1: d.ax, y1: d.ay, x2: d.ax + ux * uScale, y2: d.ay + uy * uScale }], {
          x1: 'x1', y1: 'y1', x2: 'x2', y2: 'y2',
          stroke: '#3b82f6', strokeWidth: 4, headLength: 14
        }));

        // Projection lines showing decomposition
        marks2D.push(Plot.lineY([
          { x: d.ax, y: d.ay },
          { x: d.ax + comp1Scale, y: d.ay }
        ], { x: 'x', y: 'y', stroke: '#f97316', strokeWidth: 1.5, strokeDasharray: '2 2', opacity: 0.5 }));

        marks2D.push(Plot.lineY([
          { x: d.ax + comp1Scale, y: d.ay },
          { x: d.ax + comp1Scale, y: d.ay + comp2Scale }
        ], { x: 'x', y: 'y', stroke: '#f97316', strokeWidth: 1.5, strokeDasharray: '2 2', opacity: 0.5 }));

        marks2D.push(Plot.dot([{ x: d.ax, y: d.ay }], { x: 'x', y: 'y', fill: '#22c55e', r: 6 }));

        // Text labels for components
        marks2D.push(Plot.text([
          { x: d.ax + comp1Scale/2, y: d.ay - 0.25, text: '(∂f/∂x)·u_x' }
        ], { x: 'x', y: 'y', text: 'text', fill: '#f97316', fontSize: 11 }));

        marks2D.push(Plot.text([
          { x: d.ax + comp1Scale + 0.3, y: d.ay + comp2Scale/2, text: '(∂f/∂y)·u_y' }
        ], { x: 'x', y: 'y', text: 'text', fill: '#f97316', fontSize: 11 }));

        const width2D = Math.min(500, Math.max(320, (mount2D?.clientWidth || 400)));
        const height2D = Math.round(width2D * 0.9);

        const fig2D = Plot.plot({
          width: width2D, height: height2D,
          marginLeft: 50, marginBottom: 44,
          x: { domain: [-bounds, bounds], label: 'x', grid: true },
          y: { domain: [-bounds, bounds], label: 'y', grid: true },
          style: { background: 'transparent', color: 'var(--text-secondary)' },
          marks: marks2D
        });

        if (currentFig2D) { try { currentFig2D.remove(); } catch(_){} }
        mount2D.innerHTML = '';
        mount2D.appendChild(fig2D);
        currentFig2D = fig2D;
      }

      if (live) {
        const ux = Math.cos(state.theta), uy = Math.sin(state.theta);
        const term1 = d.px * ux, term2 = d.py * uy;
        live.textContent = `D_u f = (∂f/∂x)·u_x + (∂f/∂y)·u_y = (${d.px.toFixed(2)})·(${ux.toFixed(2)}) + (${d.py.toFixed(2)})·(${uy.toFixed(2)}) = ${d.Du.toFixed(2)}`;
      }
    } catch(e) {
      if (mount3D) {
        mount3D.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">3D library failed to load.</div>';
      }
    }
  }

  const listeners = [];
  function on(elm, ev, fn) { if (!elm) return; elm.addEventListener(ev, fn); listeners.push([elm, ev, fn]); }

  on(el.ax, 'input', render);
  on(el.ay, 'input', render);
  on(el.theta, 'input', render);

  render();

  return {
    destroy() {
      destroyed = true;
      try { listeners.forEach(([elm, ev, fn]) => elm && elm.removeEventListener(ev, fn)); } catch(_){}
      try { if (mount3D && window.Plotly) window.Plotly.purge(mount3D); } catch(_){}
      try { if (currentFig2D) currentFig2D.remove(); } catch(_){}
      containerEl.innerHTML = '';
    }
  };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch5_directional_derivative_surface_3d'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch5_directional_derivative_surface_3d');
      }
    } catch (e) {
      console.error('Failed to register animation ch5_directional_derivative_surface_3d', e);
    }
  })();

  // ch5_gradient_levelset_normal.js
  (function(){
    // Chapter 5: Gradient perpendicular to level sets (3D wrapper)
// Public API: init(containerEl, options) -> { destroy }

function init(containerEl, options = {}) {
  if (!containerEl) return { destroy() {} };
  let childInst = null;
  let destroyed = false;
  try { containerEl.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">Loading 3D gradient…</div>'; } catch(_){}
  import('./ch5_gradient_surface_3d.js')
    .then(mod => {
      if (destroyed) return;
      if (mod && typeof mod.init === 'function') {
        try { childInst = mod.init(containerEl, options) || null; } catch(e) { console.error('3D gradient init error', e); }
      }
    })
    .catch(() => {
      try { containerEl.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">Failed to load 3D module.</div>'; } catch(_){}
    });
  return {
    destroy() {
      destroyed = true;
      try { if (childInst && typeof childInst.destroy === 'function') childInst.destroy(); } catch(_){}
      try { containerEl.innerHTML = ''; } catch(_){}
    }
  };
}

// OLD 2D implementation removed; now delegates to ch5_gradient_surface_3d.js

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch5_gradient_levelset_normal'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch5_gradient_levelset_normal');
      }
    } catch (e) {
      console.error('Failed to register animation ch5_gradient_levelset_normal', e);
    }
  })();

  // ch5_gradient_surface_3d.js
  (function(){
    // Chapter 5: Gradient on 3D surface with level sets
// Public API: init(containerEl, options) -> { destroy }

function init(containerEl, options = {}) {
  if (!containerEl) return { destroy() {} };

  function finiteOr(v, d) { const x = +v; return Number.isFinite(x) ? x : d; }

  const state = {
    f: options.f || 'x^2+y^2',
    ax: finiteOr(options.ax, 1),
    ay: finiteOr(options.ay, 1),
    bounds: finiteOr(options.bounds, 2.5),
    res: 40
  };

  containerEl.innerHTML = `
    <div class="anim anim--plot" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <div class="anim__hint" style="flex:1 1 100%; color: var(--text-secondary); margin-bottom:0.25rem;">
          ∇f(a) is perpendicular to level sets and points in steepest ascent. Move (x,y) to see gradient on surface.
        </div>
        <label style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:2ch; color: var(--text-secondary);">x</span>
          <input data-role="ax" type="range" min="-2" max="2" step="0.1" value="${state.ax}" style="width:160px;" aria-label="x"/>
          <span data-role="ax-val" style="min-width:4ch; font-variant-numeric:tabular-nums;">${state.ax.toFixed(1)}</span>
        </label>
        <label style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:2ch; color: var(--text-secondary);">y</span>
          <input data-role="ay" type="range" min="-2" max="2" step="0.1" value="${state.ay}" style="width:160px;" aria-label="y"/>
          <span data-role="ay-val" style="min-width:4ch; font-variant-numeric:tabular-nums;">${state.ay.toFixed(1)}</span>
        </label>
        <div role="status" aria-live="polite" data-role="live" style="color: var(--text-secondary);"></div>
      </div>
      <div class="anim__canvases" style="margin-top:0.6rem;">
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
          <div>
            <div style="font-weight:500; margin-bottom:0.3rem; color:var(--text-primary);">3D Surface View</div>
            <div class="anim__canvas" data-role="plot-3d" style="width:100%; height:480px;"></div>
          </div>
          <div>
            <div style="font-weight:500; margin-bottom:0.3rem; color:var(--text-primary);">2D Contour View</div>
            <div class="anim__canvas" data-role="plot-2d" style="width:100%; height:480px;"></div>
          </div>
        </div>
        <div class="anim__legend" style="margin-top:0.5rem; display:flex; gap:1rem; flex-wrap:wrap; color: var(--text-secondary);">
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#ef4444;"></span>∇f(a) (gradient)</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#3b82f6;"></span>level set at a</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:12px; height:12px; background:#22c55e; border-radius:50%;"></span>(x,y,f)</span>
        </div>
      </div>
    </div>
  `;

  const mount3D = containerEl.querySelector('[data-role=plot-3d]');
  const mount2D = containerEl.querySelector('[data-role=plot-2d]');
  const live = containerEl.querySelector('[data-role=live]');
  const el = {
    ax: containerEl.querySelector('input[data-role=ax]'),
    ay: containerEl.querySelector('input[data-role=ay]'),
    axVal: containerEl.querySelector('[data-role=ax-val]'),
    ayVal: containerEl.querySelector('[data-role=ay-val]')
  };

  let currentCamera = null;
  let currentFig2D = null;

  function loadPlotly() {
    return new Promise((resolve, reject) => {
      if (window.Plotly) return resolve(window.Plotly);
      const scriptId = 'plotly-cdn-script';
      const existing = document.getElementById(scriptId);
      if (existing) {
        existing.addEventListener('load', () => resolve(window.Plotly));
        existing.addEventListener('error', reject);
        return;
      }
      const s = document.createElement('script');
      s.id = scriptId;
      s.src = 'https://cdn.plot.ly/plotly-2.27.0.min.js';
      s.async = true;
      s.onload = () => resolve(window.Plotly);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function evalF(x, y) {
    try {
      const expr = state.f.replace(/\^/g, '**').replace(/x/g, `(${x})`).replace(/y/g, `(${y})`);
      return eval(expr);
    } catch(e) {
      return x*x + y*y;
    }
  }

  function partialX(x, y, h=1e-3) { return (evalF(x+h, y) - evalF(x-h, y)) / (2*h); }
  function partialY(x, y, h=1e-3) { return (evalF(x, y+h) - evalF(x, y-h)) / (2*h); }

  let destroyed = false;
  let plotReady = false;

  function buildData() {
    const B = state.bounds;
    const N = state.res|0;
    const xs = Array.from({length: N}, (_,i) => -B + (2*B*i)/(N-1));
    const ys = Array.from({length: N}, (_,j) => -B + (2*B*j)/(N-1));
    const Z = ys.map(y => xs.map(x => evalF(x,y)));

    const ax = state.ax, ay = state.ay, fa = evalF(ax, ay);
    const px = partialX(ax, ay), py = partialY(ax, ay);
    const gradMag = Math.hypot(px, py);

    // Gradient arrow (scaled for visibility)
    const scale = Math.min(1.5, B * 0.4);
    const gx = (gradMag > 1e-6) ? (px / gradMag) * scale : 0;
    const gy = (gradMag > 1e-6) ? (py / gradMag) * scale : 0;
    const gz = (gradMag > 1e-6) ? (px * gx + py * gy) : 0;

    // Level set curve at z=fa (contour on surface)
    const levelPts = [];
    const tol = 0.15;
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const x = xs[i], y = ys[j], z = evalF(x, y);
        if (Math.abs(z - fa) < tol) {
          levelPts.push({ x, y, z });
        }
      }
    }

    return { xs, ys, Z, ax, ay, fa, px, py, gx, gy, gz, gradMag, levelPts };
  }

  function layoutFor(B) {
    const css = getComputedStyle(document.documentElement);
    const textColor = (css.getPropertyValue('--text-secondary') || '#a0a0a0').trim();
    return {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: { l: 0, r: 0, t: 0, b: 0 },
      scene: {
        bgcolor: 'rgba(0,0,0,0)',
        xaxis: { title: 'x', color: textColor, gridcolor: textColor, zerolinecolor: textColor, range: [-B, B] },
        yaxis: { title: 'y', color: textColor, gridcolor: textColor, zerolinecolor: textColor, range: [-B, B] },
        zaxis: { title: 'z', color: textColor, gridcolor: textColor, zerolinecolor: textColor },
        camera: { eye: { x: 1.6, y: 1.2, z: 0.9 } }
      },
      showlegend: false
    };
  }

  function buildTraces(d) {
    const surface = {
      type: 'surface',
      x: d.xs,
      y: d.ys,
      z: d.Z,
      colorscale: 'Viridis',
      showscale: false,
      opacity: 0.88
    };

    const point = {
      type: 'scatter3d', mode: 'markers',
      x: [d.ax], y: [d.ay], z: [d.fa],
      marker: { color: '#22c55e', size: 6 },
      name: '(x,y,f)'
    };

    // Gradient arrow
    const grad = {
      type: 'scatter3d', mode: 'lines',
      x: [d.ax, d.ax + d.gx],
      y: [d.ay, d.ay + d.gy],
      z: [d.fa, d.fa + d.gz],
      line: { color: '#ef4444', width: 10 },
      name: 'gradient'
    };

    // Level set
    const levelSet = {
      type: 'scatter3d', mode: 'markers',
      x: d.levelPts.map(p => p.x),
      y: d.levelPts.map(p => p.y),
      z: d.levelPts.map(p => p.z),
      marker: { color: '#3b82f6', size: 3, opacity: 0.7 },
      name: 'level set'
    };

    return [surface, levelSet, point, grad];
  }

  async function render() {
    if (destroyed) return;
    el.axVal.textContent = (+el.ax.value).toFixed(1);
    el.ayVal.textContent = (+el.ay.value).toFixed(1);
    state.ax = +el.ax.value;
    state.ay = +el.ay.value;

    try {
      const Plotly = await loadPlotly();
      const Plot = window.Plot;

      // Capture camera
      if (plotReady && mount3D && mount3D.layout && mount3D.layout.scene && mount3D.layout.scene.camera) {
        currentCamera = JSON.parse(JSON.stringify(mount3D.layout.scene.camera));
      }

      const d = buildData();
      const traces3D = buildTraces(d);
      const layout3D = layoutFor(state.bounds);

      if (currentCamera) {
        layout3D.scene.camera = currentCamera;
      }

      const config = { displayModeBar: false, responsive: true };
      
      // Render 3D
      if (!plotReady) {
        await Plotly.newPlot(mount3D, traces3D, layout3D, config);
        plotReady = true;
      } else {
        await Plotly.react(mount3D, traces3D, layout3D, config);
      }

      // Render 2D contour
      if (Plot && mount2D) {
        const bounds = state.bounds;
        const gridSize = 70;
        const contourData = [];
        for (let i = 0; i <= gridSize; i++) {
          for (let j = 0; j <= gridSize; j++) {
            const x = -bounds + (i * 2 * bounds) / gridSize;
            const y = -bounds + (j * 2 * bounds) / gridSize;
            contourData.push({ x, y, z: evalF(x, y) });
          }
        }

        const marks2D = [];
        
        // All contours (light gray)
        marks2D.push(Plot.contour(contourData, {
          x: 'x', y: 'y', z: 'z',
          stroke: '#94a3b8',
          strokeWidth: 1,
          opacity: 0.4,
          thresholds: 12
        }));

        // Highlight the CURRENT level set at z = f(ax, ay) in bright blue
        const currentLevel = d.fa;
        const tolerance = 0.15;
        const currentLevelPts = contourData.filter(p => Math.abs(p.z - currentLevel) < tolerance);
        if (currentLevelPts.length > 0) {
          marks2D.push(Plot.dot(currentLevelPts, {
            x: 'x', y: 'y',
            fill: '#3b82f6',
            r: 2.5,
            opacity: 0.9
          }));
        }

        // Gradient arrow
        const scale = 1.0;
        const gx = (d.gradMag > 1e-6) ? (d.px / d.gradMag) * scale : 0;
        const gy = (d.gradMag > 1e-6) ? (d.py / d.gradMag) * scale : 0;
        marks2D.push(Plot.arrow([{ x1: d.ax, y1: d.ay, x2: d.ax + gx, y2: d.ay + gy }], {
          x1: 'x1', y1: 'y1', x2: 'x2', y2: 'y2',
          stroke: '#ef4444', strokeWidth: 4, headLength: 14
        }));

        // Tangent to level set (perpendicular to gradient)
        if (d.gradMag > 1e-6) {
          const tx = -gy, ty = gx;
          const tScale = 0.9;
          marks2D.push(Plot.lineY([
            { x: d.ax - tx * tScale, y: d.ay - ty * tScale },
            { x: d.ax + tx * tScale, y: d.ay + ty * tScale }
          ], { x: 'x', y: 'y', stroke: '#3b82f6', strokeWidth: 3, strokeDasharray: '4 2', opacity: 0.9 }));
        }

        marks2D.push(Plot.dot([{ x: d.ax, y: d.ay }], { x: 'x', y: 'y', fill: '#22c55e', r: 7 }));

        // Label for current level set
        marks2D.push(Plot.text([
          { x: d.ax + 0.5, y: d.ay + 0.5, text: `level set: z=${d.fa.toFixed(2)}` }
        ], { x: 'x', y: 'y', text: 'text', fill: '#3b82f6', fontSize: 12, fontWeight: 600 }));

        const width2D = Math.min(500, Math.max(320, (mount2D?.clientWidth || 400)));
        const height2D = Math.round(width2D * 0.9);

        const fig2D = Plot.plot({
          width: width2D, height: height2D,
          marginLeft: 50, marginBottom: 44,
          x: { domain: [-bounds, bounds], label: 'x', grid: true },
          y: { domain: [-bounds, bounds], label: 'y', grid: true },
          style: { background: 'transparent', color: 'var(--text-secondary)' },
          marks: marks2D
        });

        if (currentFig2D) { try { currentFig2D.remove(); } catch(_){} }
        mount2D.innerHTML = '';
        mount2D.appendChild(fig2D);
        currentFig2D = fig2D;
      }

      if (live) live.textContent = `∇f(${d.ax.toFixed(1)}, ${d.ay.toFixed(1)}) = (${d.px.toFixed(2)}, ${d.py.toFixed(2)}), ‖∇f‖ = ${d.gradMag.toFixed(2)}`;
    } catch(e) {
      if (mount3D) {
        mount3D.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">3D library failed to load.</div>';
      }
    }
  }

  const listeners = [];
  function on(elm, ev, fn) { if (!elm) return; elm.addEventListener(ev, fn); listeners.push([elm, ev, fn]); }

  on(el.ax, 'input', render);
  on(el.ay, 'input', render);

  render();

  return {
    destroy() {
      destroyed = true;
      try { listeners.forEach(([elm, ev, fn]) => elm && elm.removeEventListener(ev, fn)); } catch(_){}
      try { if (mount3D && window.Plotly) window.Plotly.purge(mount3D); } catch(_){}
      try { if (currentFig2D) currentFig2D.remove(); } catch(_){}
      containerEl.innerHTML = '';
    }
  };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch5_gradient_surface_3d'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch5_gradient_surface_3d');
      }
    } catch (e) {
      console.error('Failed to register animation ch5_gradient_surface_3d', e);
    }
  })();

  // ch5_hessian_classifier_tripanel.js
  (function(){
    // Chapter 5: Hessian curvature classifier (min, max, saddle)
// Public API: init(containerEl, options) -> { destroy }

function init(containerEl, options = {}) {
  if (!containerEl) return { destroy() {} };

  const examples = options.examples || [
    { type: 'min', eigs: [2, 2] },
    { type: 'max', eigs: [-2, -2] },
    { type: 'saddle', eigs: [2, -2] }
  ];

  containerEl.innerHTML = `
    <div class="anim anim--tripanel" style="margin:0.75rem 0;">
      <div class="anim__hint" style="padding:0.6rem 0.9rem; border:1px solid var(--border-color); border-radius:0.5rem; color: var(--text-secondary); margin-bottom:0.75rem;">
        Hessian eigenvalues classify local shape at critical points. Use Chapter 4 eigenvalue test.
      </div>
      <div class="anim__panels" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap:1rem;">
        ${examples.map((ex, i) => `
          <div data-role="panel-${i}" style="border:1px solid var(--border-color); border-radius:0.5rem; padding:0.75rem;">
            <div style="font-weight:600; margin-bottom:0.5rem; color:var(--text-primary); text-align:center;">
              ${ex.type === 'min' ? 'Minimum (PD)' : ex.type === 'max' ? 'Maximum (ND)' : 'Saddle (Indefinite)'}
            </div>
            <div class="anim__canvas" data-role="plot-${i}"></div>
            <div style="margin-top:0.5rem; text-align:center; color:var(--text-secondary); font-size:0.9rem;">
              eigs: ${ex.eigs.map(e => e > 0 ? `+${e}` : e).join(', ')}
            </div>
          </div>
        `).join('')}
      </div>
      <div class="anim__caption" style="margin-top:0.75rem; color: var(--text-secondary);">
        All eigenvalues > 0 → min (bowl). All < 0 → max (dome). Mixed signs → saddle.
      </div>
    </div>
  `;

  const Plot = (window && window.Plot) ? window.Plot : null;

  function getFunctionForType(type, eigs) {
    if (type === 'min') {
      return (x, y) => eigs[0] * x * x + eigs[1] * y * y;
    } else if (type === 'max') {
      return (x, y) => eigs[0] * x * x + eigs[1] * y * y;
    } else { // saddle
      return (x, y) => eigs[0] * x * x + eigs[1] * y * y;
    }
  }

  const currentFigs = [];

  function render() {
    examples.forEach((ex, i) => {
      const mount = containerEl.querySelector(`[data-role=plot-${i}]`);
      if (!mount || !Plot) return;

      const f = getFunctionForType(ex.type, ex.eigs);
      const bounds = 2;
      const gridSize = 60;
      const contourData = [];

      for (let ix = 0; ix <= gridSize; ix++) {
        for (let iy = 0; iy <= gridSize; iy++) {
          const x = -bounds + (ix * 2 * bounds) / gridSize;
          const y = -bounds + (iy * 2 * bounds) / gridSize;
          contourData.push({ x, y, z: f(x, y) });
        }
      }

      const width = Math.min(300, Math.max(200, (mount?.clientWidth || 240)));
      const height = Math.round(width * 0.85);

      const marks = [];
      marks.push(window.Plot.contour(contourData, {
        x: 'x', y: 'y', z: 'z',
        stroke: ex.type === 'min' ? '#3b82f6' : ex.type === 'max' ? '#ef4444' : '#f59e0b',
        strokeWidth: 1.5,
        thresholds: 10
      }));

      // Critical point at origin
      marks.push(window.Plot.dot([{ x: 0, y: 0 }], { 
        x: 'x', y: 'y', 
        fill: '#22c55e', 
        r: 6 
      }));

      const fig = window.Plot.plot({
        width, height,
        marginLeft: 40, marginBottom: 40,
        x: { domain: [-bounds, bounds], grid: true, label: 'x' },
        y: { domain: [-bounds, bounds], grid: true, label: 'y' },
        style: { background: 'transparent', color: 'var(--text-secondary)' },
        marks
      });

      if (currentFigs[i]) { try { currentFigs[i].remove(); } catch(_){} }
      mount.innerHTML = '';
      mount.appendChild(fig);
      currentFigs[i] = fig;
    });
  }

  if (!Plot) {
    containerEl.querySelector('.anim__panels').innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">Plot library not loaded.</div>';
    return { destroy(){ containerEl.innerHTML=''; } };
  }

  render();

  return { destroy(){ try { currentFigs.forEach(fig => { try { fig.remove(); } catch(_){} }); } catch(_){} containerEl.innerHTML=''; } };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch5_hessian_classifier_tripanel'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch5_hessian_classifier_tripanel');
      }
    } catch (e) {
      console.error('Failed to register animation ch5_hessian_classifier_tripanel', e);
    }
  })();

  // ch5_jacobian_local_linear.js
  (function(){
    // Chapter 5: Jacobian as local linear map
// Public API: init(containerEl, options) -> { destroy }

function init(containerEl, options = {}) {
  if (!containerEl) return { destroy() {} };

  function finiteOr(v, d) { const x = +v; return Number.isFinite(x) ? x : d; }

  const state = {
    a: finiteOr(options.a, 2),
    b: finiteOr(options.b, 0.5),
    c: finiteOr(options.c, -0.3),
    d: finiteOr(options.d, 1.5),
    bounds: 2,
    gridStep: 0.5
  };

  containerEl.innerHTML = `
    <div class="anim anim--plot" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <div class="anim__hint" style="flex:1 1 100%; color: var(--text-secondary); margin-bottom:0.25rem;">
          Jacobian J_f(x) maps input grid to output grid. Columns of J are images of basis vectors.
        </div>
        <div style="display:flex; gap:0.5rem; align-items:center;">
          <span style="min-width:7ch; text-align:right; color:var(--text-secondary);">J =</span>
          <div style="display:inline-grid; grid-template-columns: auto auto; gap:0.25rem 0.35rem; align-items:center;">
            <input data-role="a" type="number" step="0.1" value="${state.a}" style="width:5rem;" aria-label="J[0,0]">
            <input data-role="b" type="number" step="0.1" value="${state.b}" style="width:5rem;" aria-label="J[0,1]">
            <input data-role="c" type="number" step="0.1" value="${state.c}" style="width:5rem;" aria-label="J[1,0]">
            <input data-role="d" type="number" step="0.1" value="${state.d}" style="width:5rem;" aria-label="J[1,1]">
          </div>
        </div>
        <div role="status" aria-live="polite" data-role="live" style="color: var(--text-secondary);"></div>
      </div>
      <div class="anim__canvases" style="margin-top:0.6rem; display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
        <div>
          <div style="font-weight:500; margin-bottom:0.3rem; color:var(--text-primary);">Input Space</div>
          <div class="anim__canvas" data-role="plot-input"></div>
        </div>
        <div>
          <div style="font-weight:500; margin-bottom:0.3rem; color:var(--text-primary);">Output Space (J·x)</div>
          <div class="anim__canvas" data-role="plot-output"></div>
        </div>
      </div>
      <div class="anim__legend" style="margin-top:0.5rem; display:flex; gap:1rem; flex-wrap:wrap; color: var(--text-secondary);">
        <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#94a3b8;"></span>grid lines</span>
        <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#ef4444;"></span>e₁ → J·e₁</span>
        <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#3b82f6;"></span>e₂ → J·e₂</span>
      </div>
    </div>
  `;

  const Plot = (window && window.Plot) ? window.Plot : null;
  const mountIn = containerEl.querySelector('[data-role=plot-input]');
  const mountOut = containerEl.querySelector('[data-role=plot-output]');
  const live = containerEl.querySelector('[data-role=live]');

  const el = {
    a: containerEl.querySelector('input[data-role=a]'),
    b: containerEl.querySelector('input[data-role=b]'),
    c: containerEl.querySelector('input[data-role=c]'),
    d: containerEl.querySelector('input[data-role=d]')
  };

  function apply(J, p) {
    return { x: J[0]*p.x + J[1]*p.y, y: J[2]*p.x + J[3]*p.y };
  }

  let currentFigIn = null, currentFigOut = null;
  function render() {
    const J = [ +el.a.value, +el.b.value, +el.c.value, +el.d.value ];
    const bounds = state.bounds;
    const step = state.gridStep;

    const width = Math.min(400, Math.max(280, (mountIn?.clientWidth || 320)));
    const height = Math.round(width * 0.85);

    // Input grid
    const marksIn = [];
    for (let x = -bounds; x <= bounds; x += step) {
      const pts = [];
      for (let y = -bounds; y <= bounds; y += step/10) {
        pts.push({ x, y });
      }
      marksIn.push(window.Plot.lineY(pts, { x: 'x', y: 'y', stroke: '#94a3b8', strokeWidth: 1, opacity: 0.5 }));
    }
    for (let y = -bounds; y <= bounds; y += step) {
      const pts = [];
      for (let x = -bounds; x <= bounds; x += step/10) {
        pts.push({ x, y });
      }
      marksIn.push(window.Plot.lineY(pts, { x: 'x', y: 'y', stroke: '#94a3b8', strokeWidth: 1, opacity: 0.5 }));
    }

    // Basis vectors
    marksIn.push(window.Plot.arrow([{ x1: 0, y1: 0, x2: 1, y2: 0 }], {
      x1: 'x1', y1: 'y1', x2: 'x2', y2: 'y2',
      stroke: '#ef4444', strokeWidth: 3, headLength: 10
    }));
    marksIn.push(window.Plot.arrow([{ x1: 0, y1: 0, x2: 0, y2: 1 }], {
      x1: 'x1', y1: 'y1', x2: 'x2', y2: 'y2',
      stroke: '#3b82f6', strokeWidth: 3, headLength: 10
    }));

    const figIn = window.Plot.plot({
      width, height,
      marginLeft: 40, marginBottom: 40,
      x: { domain: [-bounds, bounds], grid: true },
      y: { domain: [-bounds, bounds], grid: true },
      style: { background: 'transparent', color: 'var(--text-secondary)' },
      marks: marksIn
    });

    // Output grid (transformed)
    const marksOut = [];
    for (let x = -bounds; x <= bounds; x += step) {
      const pts = [];
      for (let y = -bounds; y <= bounds; y += step/10) {
        pts.push(apply(J, { x, y }));
      }
      marksOut.push(window.Plot.lineY(pts, { x: 'x', y: 'y', stroke: '#94a3b8', strokeWidth: 1, opacity: 0.5 }));
    }
    for (let y = -bounds; y <= bounds; y += step) {
      const pts = [];
      for (let x = -bounds; x <= bounds; x += step/10) {
        pts.push(apply(J, { x, y }));
      }
      marksOut.push(window.Plot.lineY(pts, { x: 'x', y: 'y', stroke: '#94a3b8', strokeWidth: 1, opacity: 0.5 }));
    }

    // Transformed basis vectors (columns of J)
    const Je1 = apply(J, { x: 1, y: 0 });
    const Je2 = apply(J, { x: 0, y: 1 });
    marksOut.push(window.Plot.arrow([{ x1: 0, y1: 0, x2: Je1.x, y2: Je1.y }], {
      x1: 'x1', y1: 'y1', x2: 'x2', y2: 'y2',
      stroke: '#ef4444', strokeWidth: 3, headLength: 10
    }));
    marksOut.push(window.Plot.arrow([{ x1: 0, y1: 0, x2: Je2.x, y2: Je2.y }], {
      x1: 'x1', y1: 'y1', x2: 'x2', y2: 'y2',
      stroke: '#3b82f6', strokeWidth: 3, headLength: 10
    }));

    const outBounds = Math.max(bounds, Math.abs(Je1.x), Math.abs(Je1.y), Math.abs(Je2.x), Math.abs(Je2.y)) * 1.2;

    const figOut = window.Plot.plot({
      width, height,
      marginLeft: 40, marginBottom: 40,
      x: { domain: [-outBounds, outBounds], grid: true },
      y: { domain: [-outBounds, outBounds], grid: true },
      style: { background: 'transparent', color: 'var(--text-secondary)' },
      marks: marksOut
    });

    if (currentFigIn) { try { currentFigIn.remove(); } catch(_){} }
    if (currentFigOut) { try { currentFigOut.remove(); } catch(_){} }
    if (mountIn) { mountIn.innerHTML=''; mountIn.appendChild(figIn); currentFigIn = figIn; }
    if (mountOut) { mountOut.innerHTML=''; mountOut.appendChild(figOut); currentFigOut = figOut; }

    if (live) {
      live.textContent = `J·e₁ = (${Je1.x.toFixed(2)}, ${Je1.y.toFixed(2)}), J·e₂ = (${Je2.x.toFixed(2)}, ${Je2.y.toFixed(2)})`;
    }
  }

  if (!Plot) {
    if (mountIn) mountIn.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">Plot library not loaded.</div>';
    return { destroy(){ containerEl.innerHTML=''; } };
  }

  Object.values(el).forEach(inp => inp && inp.addEventListener('input', render));
  render();

  return { destroy(){ try { Object.values(el).forEach(inp => inp && inp.removeEventListener('input', render)); } catch(_){} if (currentFigIn){ try{ currentFigIn.remove(); }catch(_){}} if (currentFigOut){ try{ currentFigOut.remove(); }catch(_){}} containerEl.innerHTML=''; } };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch5_jacobian_local_linear'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch5_jacobian_local_linear');
      }
    } catch (e) {
      console.error('Failed to register animation ch5_jacobian_local_linear', e);
    }
  })();

  // ch5_partials_cross_sections.js
  (function(){
    // Chapter 5: Partial derivatives via cross-sections
// Public API: init(containerEl, options) -> { destroy }

function init(containerEl, options = {}) {
  if (!containerEl) return { destroy() {} };
  let childInst = null;
  let destroyed = false;
  try { containerEl.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">Loading 3D surface…</div>'; } catch(_){}
  import('./ch5_partials_surface_tangents_3d.js')
    .then(mod => {
      if (destroyed) return;
      if (mod && typeof mod.init === 'function') {
        try { childInst = mod.init(containerEl, options) || null; } catch(e) { console.error('3D init error', e); }
      }
    })
    .catch(() => {
      try { containerEl.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">Failed to load 3D module.</div>'; } catch(_){}
    });
  return {
    destroy() {
      destroyed = true;
      try { if (childInst && typeof childInst.destroy === 'function') childInst.destroy(); } catch(_){}
      try { containerEl.innerHTML = ''; } catch(_){}
    }
  };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch5_partials_cross_sections'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch5_partials_cross_sections');
      }
    } catch (e) {
      console.error('Failed to register animation ch5_partials_cross_sections', e);
    }
  })();

  // ch5_partials_surface_tangents_3d.js
  (function(){
    // Chapter 5: 3D surface with cross-sections and tangents at (x0,y0)
// Public API: init(containerEl, options) -> { destroy }
// Renders f(x,y) as a 3D surface (Plotly), shows slices y=y0 and x=x0, and tangent lines at the point.

function init(containerEl, options = {}) {
  if (!containerEl) return { destroy() {} };

  function finiteOr(v, d) { const x = +v; return Number.isFinite(x) ? x : d; }

  const state = {
    f: options.f || 'x^2*y',
    a1: finiteOr(options.a1, 1), // x0
    a2: finiteOr(options.a2, 1), // y0
    bounds: finiteOr(options.bounds, 2.5),
    res: 40
  };

  containerEl.innerHTML = `
    <div class="anim anim--plot" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <div class="anim__hint" style="flex:1 1 100%; color: var(--text-secondary); margin-bottom:0.25rem;">
          Move (x₀,y₀) in the plane. See: surface z=f(x,y), slices y=y₀ (blue) and x=x₀ (red), and tangent lines at (x₀,y₀) in 3D.
        </div>
        <label style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:3ch; color: var(--text-secondary);">x₀</span>
          <input data-role="a1" type="range" min="-2.5" max="2.5" step="0.1" value="${state.a1}" style="width:160px;" aria-label="x0"/>
          <span data-role="a1-val" style="min-width:4ch; font-variant-numeric:tabular-nums;">${state.a1.toFixed(1)}</span>
        </label>
        <label style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:3ch; color: var(--text-secondary);">y₀</span>
          <input data-role="a2" type="range" min="-2.5" max="2.5" step="0.1" value="${state.a2}" style="width:160px;" aria-label="y0"/>
          <span data-role="a2-val" style="min-width:4ch; font-variant-numeric:tabular-nums;">${state.a2.toFixed(1)}</span>
        </label>
        <div role="status" aria-live="polite" data-role="live" style="color: var(--text-secondary);"></div>
      </div>
      <div class="anim__canvases" style="margin-top:0.6rem;">
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
          <div>
            <div style="font-weight:500; margin-bottom:0.3rem; color:var(--text-primary);">3D Surface View</div>
            <div class="anim__canvas" data-role="plot-3d" style="width:100%; height:480px;"></div>
          </div>
          <div>
            <div style="font-weight:500; margin-bottom:0.3rem; color:var(--text-primary);">2D Projection View</div>
            <div class="anim__canvas" data-role="plot-2d" style="width:100%; height:480px;"></div>
          </div>
        </div>
        <div class="anim__legend" style="margin-top:0.5rem; display:flex; gap:1rem; flex-wrap:wrap; color: var(--text-secondary);">
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#3b82f6;"></span>slice y=y₀</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#ef4444;"></span>slice x=x₀</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:12px; height:12px; background:#22c55e; border-radius:50%;"></span>(x₀,y₀,f)</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#3b82f6; border-bottom:2px dashed #3b82f6;"></span>tangent along x</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:3px; background:#ef4444; border-bottom:2px dashed #ef4444;"></span>tangent along y</span>
        </div>
      </div>
    </div>
  `;

  const mount3D = containerEl.querySelector('[data-role=plot-3d]');
  const mount2D = containerEl.querySelector('[data-role=plot-2d]');
  const live = containerEl.querySelector('[data-role=live]');
  const el = {
    a1: containerEl.querySelector('input[data-role=a1]'),
    a2: containerEl.querySelector('input[data-role=a2]'),
    a1Val: containerEl.querySelector('[data-role=a1-val]'),
    a2Val: containerEl.querySelector('[data-role=a2-val]')
  };

  let currentCamera = null;
  let currentFig2D = null;

  // Lazy-load Plotly if needed
  function loadPlotly() {
    return new Promise((resolve, reject) => {
      if (window.Plotly) return resolve(window.Plotly);
      const scriptId = 'plotly-cdn-script';
      const existing = document.getElementById(scriptId);
      if (existing) {
        existing.addEventListener('load', () => resolve(window.Plotly));
        existing.addEventListener('error', reject);
        return;
      }
      const s = document.createElement('script');
      s.id = scriptId;
      s.src = 'https://cdn.plot.ly/plotly-2.27.0.min.js';
      s.async = true;
      s.onload = () => resolve(window.Plotly);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function evalF(x, y) {
    try {
      const expr = state.f.replace(/\^/g, '**').replace(/x/g, `(${x})`).replace(/y/g, `(${y})`);
      // eslint-disable-next-line no-eval
      return eval(expr);
    } catch(e) {
      return x*x*y; // fallback
    }
  }

  function partialX(x, y, h=1e-3) { return (evalF(x+h, y) - evalF(x-h, y)) / (2*h); }
  function partialY(x, y, h=1e-3) { return (evalF(x, y+h) - evalF(x, y-h)) / (2*h); }

  let destroyed = false;
  let plotReady = false;

  function buildData() {
    const B = state.bounds;
    const N = state.res|0;
    // Surface grid
    const xs = Array.from({length: N}, (_,i) => -B + (2*B*i)/(N-1));
    const ys = Array.from({length: N}, (_,j) => -B + (2*B*j)/(N-1));
    const Z = ys.map(y => xs.map(x => evalF(x,y)));

    // Cross-section y=y0 (vary x)
    const xline = xs.map(x => x);
    const ylineY0 = xs.map(_ => state.a2);
    const zlineY0 = xs.map(x => evalF(x, state.a2));

    // Cross-section x=x0 (vary y)
    const yline = ys.map(y => y);
    const xlineX0 = ys.map(_ => state.a1);
    const zlineX0 = ys.map(y => evalF(state.a1, y));

    // Point and tangents
    const x0 = state.a1, y0 = state.a2, z0 = evalF(x0, y0);
    const fx = partialX(x0, y0), fy = partialY(x0, y0);
    const len = 1.2; // tangent half-length in parameter space (doubled for visibility)

    // Tangent along x (holding y=y0): (x0±t, y0, z0 + fx*t)
    const tx = [x0 - len, x0 + len];
    const ty = [y0, y0];
    const tz = [z0 - fx*len, z0 + fx*len];

    // Tangent along y (holding x=x0): (x0, y0±t, z0 + fy*t)
    const ux = [x0, x0];
    const uy = [y0 - len, y0 + len];
    const uz = [z0 - fy*len, z0 + fy*len];

    return { xs, ys, Z, xline, ylineY0, zlineY0, yline, xlineX0, zlineX0, x0, y0, z0, tx, ty, tz, ux, uy, uz, fx, fy };
  }

  function layoutFor(B) {
    const css = getComputedStyle(document.documentElement);
    const textColor = (css.getPropertyValue('--text-secondary') || '#a0a0a0').trim();
    const bg = (css.getPropertyValue('--bg-primary') || '#0b0b0b').trim();
    return {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: { l: 0, r: 0, t: 0, b: 0 },
      scene: {
        bgcolor: 'rgba(0,0,0,0)',
        xaxis: { title: 'x', color: textColor, gridcolor: textColor, zerolinecolor: textColor, range: [-B, B] },
        yaxis: { title: 'y', color: textColor, gridcolor: textColor, zerolinecolor: textColor, range: [-B, B] },
        zaxis: { title: 'z', color: textColor, gridcolor: textColor, zerolinecolor: textColor },
        camera: { eye: { x: 1.6, y: 1.2, z: 0.9 } }
      },
      showlegend: false
    };
  }

  function buildTraces(d) {
    const surface = {
      type: 'surface',
      x: d.xs,
      y: d.ys,
      z: d.Z,
      colorscale: 'Viridis',
      showscale: false,
      opacity: 0.92
    };

    const sliceY0 = {
      type: 'scatter3d', mode: 'lines',
      x: d.xline, y: d.ylineY0, z: d.zlineY0,
      line: { color: '#3b82f6', width: 6 },
      name: 'y=y0'
    };

    const sliceX0 = {
      type: 'scatter3d', mode: 'lines',
      x: d.xlineX0, y: d.yline, z: d.zlineX0,
      line: { color: '#ef4444', width: 6 },
      name: 'x=x0'
    };

    const point = {
      type: 'scatter3d', mode: 'markers',
      x: [d.x0], y: [d.y0], z: [d.z0],
      marker: { color: '#22c55e', size: 5 },
      name: '(x0,y0)'
    };

    const tanX = {
      type: 'scatter3d', mode: 'lines',
      x: d.tx, y: d.ty, z: d.tz,
      line: { color: '#3b82f6', width: 8, dash: 'dash' },
      name: 'tangent x'
    };

    const tanY = {
      type: 'scatter3d', mode: 'lines',
      x: d.ux, y: d.uy, z: d.uz,
      line: { color: '#ef4444', width: 8, dash: 'dash' },
      name: 'tangent y'
    };

    return [surface, sliceY0, sliceX0, point, tanX, tanY];
  }

  async function render() {
    if (destroyed) return;
    el.a1Val.textContent = (+el.a1.value).toFixed(1);
    el.a2Val.textContent = (+el.a2.value).toFixed(1);
    state.a1 = +el.a1.value;
    state.a2 = +el.a2.value;

    try {
      const Plotly = await loadPlotly();
      const Plot = window.Plot;
      
      // Capture current camera if plot exists
      if (plotReady && mount3D && mount3D.layout && mount3D.layout.scene && mount3D.layout.scene.camera) {
        currentCamera = JSON.parse(JSON.stringify(mount3D.layout.scene.camera));
      }
      
      const d = buildData();
      const traces3D = buildTraces(d);
      const layout3D = layoutFor(state.bounds);
      
      // Restore camera if available
      if (currentCamera) {
        layout3D.scene.camera = currentCamera;
      }
      
      const config = { displayModeBar: false, responsive: true };
      
      // Render 3D
      if (!plotReady) {
        await Plotly.newPlot(mount3D, traces3D, layout3D, config);
        plotReady = true;
      } else {
        await Plotly.react(mount3D, traces3D, layout3D, config);
      }

      // Render 2D projection (xy-plane with slices projected)
      if (Plot && mount2D) {
        const bounds = state.bounds;
        const marks2D = [];

        // Contour
        const gridSize = 60;
        const contourData = [];
        for (let i = 0; i <= gridSize; i++) {
          for (let j = 0; j <= gridSize; j++) {
            const x = -bounds + (i * 2 * bounds) / gridSize;
            const y = -bounds + (j * 2 * bounds) / gridSize;
            contourData.push({ x, y, z: evalF(x, y) });
          }
        }
        marks2D.push(Plot.contour(contourData, {
          x: 'x', y: 'y', z: 'z',
          stroke: '#94a3b8',
          strokeWidth: 1,
          thresholds: 12,
          opacity: 0.5
        }));

        // Slice lines in xy-plane
        marks2D.push(Plot.lineY([
          { x: -bounds, y: d.y0 },
          { x: bounds, y: d.y0 }
        ], { x: 'x', y: 'y', stroke: '#3b82f6', strokeWidth: 2.5, opacity: 0.8 }));

        marks2D.push(Plot.lineY([
          { x: d.x0, y: -bounds },
          { x: d.x0, y: bounds }
        ], { x: 'x', y: 'y', stroke: '#ef4444', strokeWidth: 2.5, opacity: 0.8 }));

        marks2D.push(Plot.dot([{ x: d.x0, y: d.y0 }], { x: 'x', y: 'y', fill: '#22c55e', r: 6 }));

        const width2D = Math.min(500, Math.max(320, (mount2D?.clientWidth || 400)));
        const height2D = Math.round(width2D * 0.9);

        const fig2D = Plot.plot({
          width: width2D, height: height2D,
          marginLeft: 50, marginBottom: 44,
          x: { domain: [-bounds, bounds], label: 'x', grid: true },
          y: { domain: [-bounds, bounds], label: 'y', grid: true },
          style: { background: 'transparent', color: 'var(--text-secondary)' },
          marks: marks2D
        });

        if (currentFig2D) { try { currentFig2D.remove(); } catch(_){} }
        mount2D.innerHTML = '';
        mount2D.appendChild(fig2D);
        currentFig2D = fig2D;
      }

      if (live) live.textContent = `f(x0,y0)=${d.z0.toFixed(2)}, ∂f/∂x=${d.fx.toFixed(2)}, ∂f/∂y=${d.fy.toFixed(2)}`;
    } catch(e) {
      if (mount3D) {
        mount3D.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">3D library failed to load. Check internet access.</div>';
      }
    }
  }

  const listeners = [];
  function on(elm, ev, fn) { if (!elm) return; elm.addEventListener(ev, fn); listeners.push([elm, ev, fn]); }

  on(el.a1, 'input', render);
  on(el.a2, 'input', render);

  render();

  return {
    destroy() {
      destroyed = true;
      try { listeners.forEach(([elm, ev, fn]) => elm && elm.removeEventListener(ev, fn)); } catch(_){}
      try { if (mount3D && window.Plotly) window.Plotly.purge(mount3D); } catch(_){}
      try { if (currentFig2D) currentFig2D.remove(); } catch(_){}
      containerEl.innerHTML = '';
    }
  };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch5_partials_surface_tangents_3d'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch5_partials_surface_tangents_3d');
      }
    } catch (e) {
      console.error('Failed to register animation ch5_partials_surface_tangents_3d', e);
    }
  })();

  // ch5_taylor_overlays.js
  (function(){
    // Chapter 5: Taylor approximation overlays (0th, 1st, 2nd order)
// Public API: init(containerEl, options) -> { destroy }

function init(containerEl, options = {}) {
  if (!containerEl) return { destroy() {} };

  function finiteOr(v, d) { const x = +v; return Number.isFinite(x) ? x : d; }

  const state = {
    f: options.f || "x^2+y^2",
    ax: finiteOr(options.ax, 0.5),
    ay: finiteOr(options.ay, 0.5),
    r: finiteOr(options.r, 1),
    showTrue: options.showTrue !== false,
    showLinear: options.showLinear !== false,
    showQuadratic: options.showQuadratic !== false,
    bounds: 2.5,
    numContours: 12
  };

  containerEl.innerHTML = `
    <div class="anim anim--plot" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <div class="anim__hint" style="flex:1 1 100%; color: var(--text-secondary); margin-bottom:0.25rem; font-size:0.9rem; line-height:1.4;">
          <strong>Taylor's Theorem Visualization:</strong> Compare true function f(x,y) = x² + y² with its Taylor approximations at point <strong>a=(x,y)</strong>.<br>
          <strong>Linear:</strong> f(a) + ∇f(a)ᵀ(x−a) &nbsp;|&nbsp; <strong>Quadratic:</strong> f(a) + ∇f(a)ᵀ(x−a) + ½(x−a)ᵀH(a)(x−a)
        </div>
        <label style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:6ch; color: var(--text-secondary);">Point x:</span>
          <input data-role="ax" type="range" min="-2" max="2" step="0.1" value="${state.ax}" style="width:120px;" aria-label="x coordinate"/>
          <span data-role="ax-val" style="min-width:4ch; font-variant-numeric:tabular-nums;">${state.ax.toFixed(1)}</span>
        </label>
        <label style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:6ch; color: var(--text-secondary);">Point y:</span>
          <input data-role="ay" type="range" min="-2" max="2" step="0.1" value="${state.ay}" style="width:120px;" aria-label="y coordinate"/>
          <span data-role="ay-val" style="min-width:4ch; font-variant-numeric:tabular-nums;">${state.ay.toFixed(1)}</span>
        </label>
        <label style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:6ch; color: var(--text-secondary);">Radius:</span>
          <input data-role="r" type="range" min="0.2" max="2" step="0.1" value="${state.r}" style="width:140px;" aria-label="radius"/>
          <span data-role="r-val" style="min-width:4ch; font-variant-numeric:tabular-nums;">${state.r.toFixed(1)}</span>
        </label>
        <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
          <label style="display:inline-flex; gap:0.35rem; align-items:center;"><input data-role="true" type="checkbox" ${state.showTrue?'checked':''} aria-label="Show true function"/> True f(x,y)</label>
          <label style="display:inline-flex; gap:0.35rem; align-items:center;"><input data-role="linear" type="checkbox" ${state.showLinear?'checked':''} aria-label="Show linear"/> Linear (1st order)</label>
          <label style="display:inline-flex; gap:0.35rem; align-items:center;"><input data-role="quad" type="checkbox" ${state.showQuadratic?'checked':''} aria-label="Show quadratic"/> Quadratic (2nd order)</label>
        </div>
        <div role="status" aria-live="polite" data-role="live" style="color: var(--text-secondary); font-size:0.9rem;"></div>
      </div>
      <div class="anim__canvases" style="margin-top:0.6rem;">
        <div class="anim__canvas" data-role="plot"></div>
        <div class="anim__legend" style="margin-top:0.5rem; padding:0.5rem 0.75rem; background:var(--bg-tertiary); border-radius:0.375rem; display:flex; gap:1.25rem; flex-wrap:wrap; font-size:0.9rem;">
          <div style="font-weight:600; color:var(--text-primary); width:100%;">Legend:</div>
          <span style="display:inline-flex; align-items:center; gap:0.45rem;"><span style="display:inline-block; width:20px; height:3px; background:#94a3b8;"></span><strong>True function</strong> f(x,y)</span>
          <span style="display:inline-flex; align-items:center; gap:0.45rem;"><span style="display:inline-block; width:20px; height:3px; background:#3b82f6; opacity:0.8;"></span><strong>Linear</strong> (1st order)</span>
          <span style="display:inline-flex; align-items:center; gap:0.45rem;"><span style="display:inline-block; width:20px; height:3px; background:#8b5cf6; opacity:0.8;"></span><strong>Quadratic</strong> (2nd order)</span>
          <span style="display:inline-flex; align-items:center; gap:0.45rem;"><span style="display:inline-block; width:14px; height:14px; border-radius:50%; background:#22c55e;"></span>Expansion point <strong>a</strong></span>
          <span style="display:inline-flex; align-items:center; gap:0.45rem;"><span style="display:inline-block; width:20px; height:2px; background:#22c55e; opacity:0.5;"></span>Approximation radius</span>
        </div>
      </div>
    </div>
  `;

  const Plot = (window && window.Plot) ? window.Plot : null;
  const mount = containerEl.querySelector('[data-role=plot]');
  const live = containerEl.querySelector('[data-role=live]');

  const el = {
    ax: containerEl.querySelector('input[data-role=ax]'),
    ay: containerEl.querySelector('input[data-role=ay]'),
    r: containerEl.querySelector('input[data-role=r]'),
    trueBox: containerEl.querySelector('input[data-role=true]'),
    linear: containerEl.querySelector('input[data-role=linear]'),
    quad: containerEl.querySelector('input[data-role=quad]'),
    axVal: containerEl.querySelector('[data-role=ax-val]'),
    ayVal: containerEl.querySelector('[data-role=ay-val]'),
    rVal: containerEl.querySelector('[data-role=r-val]')
  };

  function evalF(x, y) {
    try {
      const expr = state.f.replace(/\^/g, '**').replace(/x/g, `(${x})`).replace(/y/g, `(${y})`);
      return eval(expr);
    } catch(e) {
      return x*x + y*y;
    }
  }

  function partialX(x, y, h=0.001) {
    return (evalF(x+h, y) - evalF(x-h, y)) / (2*h);
  }
  function partialY(x, y, h=0.001) {
    return (evalF(x, y+h) - evalF(x, y-h)) / (2*h);
  }
  function partialXX(x, y, h=0.001) {
    return (evalF(x+h, y) - 2*evalF(x, y) + evalF(x-h, y)) / (h*h);
  }
  function partialYY(x, y, h=0.001) {
    return (evalF(x, y+h) - 2*evalF(x, y) + evalF(x, y-h)) / (h*h);
  }
  function partialXY(x, y, h=0.001) {
    return (evalF(x+h, y+h) - evalF(x+h, y-h) - evalF(x-h, y+h) + evalF(x-h, y-h)) / (4*h*h);
  }

  let currentFig = null;
  function render() {
    const ax = +el.ax.value;
    const ay = +el.ay.value;
    const r = +el.r.value;
    const showTrue = !!el.trueBox.checked;
    const showLinear = !!el.linear.checked;
    const showQuad = !!el.quad.checked;

    el.axVal.textContent = ax.toFixed(1);
    el.ayVal.textContent = ay.toFixed(1);
    el.rVal.textContent = r.toFixed(1);

    const bounds = state.bounds;
    const width = Math.min(820, Math.max(420, (mount?.clientWidth || 560)));
    const height = Math.round(width * 0.75);

    const fa = evalF(ax, ay);
    const px = partialX(ax, ay);
    const py = partialY(ax, ay);
    const fxx = partialXX(ax, ay);
    const fyy = partialYY(ax, ay);
    const fxy = partialXY(ax, ay);

    // Generate contour levels
    const minZ = 0;
    const maxZ = bounds * bounds * 2;
    const levels = Array.from({length: state.numContours}, (_, i) => 
      minZ + (i + 1) * (maxZ - minZ) / (state.numContours + 1)
    );

    const marks = [];

    // Helper: draw contours using raster approach
    function drawContours(valueFunc, color, dasharray = null, opacity = 1) {
      const n = 80;
      const values = [];
      const xs = [];
      const ys = [];
      
      for (let i = 0; i <= n; i++) {
        const row = [];
        for (let j = 0; j <= n; j++) {
          const x = -bounds + (j * 2 * bounds) / n;
          const y = -bounds + (i * 2 * bounds) / n;
          if (i === 0) xs.push(x);
          row.push(valueFunc(x, y));
        }
        ys.push(-bounds + (i * 2 * bounds) / n);
        values.push(row);
      }

      // Use d3.contours
      if (window.d3 && window.d3.contours) {
        const contours = window.d3.contours()
          .size([n + 1, n + 1])
          .thresholds(levels);
        
        const contourData = contours(values.flat());
        
        contourData.forEach(contour => {
          const paths = [];
          contour.coordinates.forEach(polygon => {
            polygon.forEach(ring => {
              const points = ring.map(([j, i]) => ({
                x: xs[Math.floor(j)],
                y: ys[Math.floor(i)]
              }));
              if (points.length > 2) {
                marks.push(Plot.line(points, {
                  x: 'x', y: 'y',
                  stroke: color,
                  strokeWidth: 2.5,
                  strokeDasharray: dasharray,
                  strokeOpacity: opacity
                }));
              }
            });
          });
        });
      }
    }

    // True function contours
    if (showTrue) {
      drawContours((x, y) => evalF(x, y), '#94a3b8');
    }

    // Linear approximation contours
    if (showLinear) {
      drawContours((x, y) => {
        const dx = x - ax, dy = y - ay;
        return fa + px * dx + py * dy;
      }, '#3b82f6', '6 4', 0.85);
    }

    // Quadratic approximation contours
    if (showQuad) {
      drawContours((x, y) => {
        const dx = x - ax, dy = y - ay;
        return fa + px * dx + py * dy + 0.5 * (fxx * dx * dx + 2 * fxy * dx * dy + fyy * dy * dy);
      }, '#8b5cf6', '4 3', 0.85);
    }

    // Radius circle
    const circlePoints = [];
    for (let i = 0; i <= 100; i++) {
      const angle = (i / 100) * 2 * Math.PI;
      circlePoints.push({ x: ax + r * Math.cos(angle), y: ay + r * Math.sin(angle) });
    }
    marks.push(Plot.line(circlePoints, { 
      x: 'x', y: 'y', 
      stroke: '#22c55e', 
      strokeWidth: 2, 
      strokeOpacity: 0.6 
    }));

    // Expansion point
    marks.push(Plot.dot([{ x: ax, y: ay }], { 
      x: 'x', y: 'y', 
      fill: '#22c55e', 
      r: 7, 
      stroke: '#166534', 
      strokeWidth: 2.5 
    }));

    const fig = Plot.plot({
      width, height,
      marginLeft: 55, marginBottom: 50, marginTop: 25, marginRight: 25,
      x: { domain: [-bounds, bounds], label: 'x →', grid: true },
      y: { domain: [-bounds, bounds], label: '↑ y', grid: true },
      style: { background: 'transparent' },
      marks
    });

    if (currentFig) { try { currentFig.remove(); } catch(_){} }
    if (mount) { mount.innerHTML=''; mount.appendChild(fig); currentFig = fig; }

    if (live) {
      const fa_val = evalF(ax, ay).toFixed(2);
      live.textContent = `Expansion point a=(${ax.toFixed(1)}, ${ay.toFixed(1)}), f(a)=${fa_val}, approximation radius=${r.toFixed(1)}`;
    }
  }

  if (!Plot) {
    if (mount) mount.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">Plot library not loaded.</div>';
    return { destroy(){ containerEl.innerHTML=''; } };
  }

  Object.values(el).filter(e => e?.addEventListener).forEach(inp => inp.addEventListener('input', render));
  render();

  return { destroy(){ try { Object.values(el).filter(e => e?.removeEventListener).forEach(inp => inp.removeEventListener('input', render)); } catch(_){} if (currentFig){ try{ currentFig.remove(); }catch(_){}} containerEl.innerHTML=''; } };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch5_taylor_overlays'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch5_taylor_overlays');
      }
    } catch (e) {
      console.error('Failed to register animation ch5_taylor_overlays', e);
    }
  })();

  // ch5_taylor_surfaces_3d.js
  (function(){
    // Chapter 5: Taylor approximation surfaces in 3D
// Public API: init(containerEl, options) -> { destroy }

function init(containerEl, options = {}) {
  if (!containerEl) return { destroy() {} };

  function finiteOr(v, d) { const x = +v; return Number.isFinite(x) ? x : d; }

  const state = {
    f: options.f || 'x^2*y',
    ax: finiteOr(options.ax, 1),
    ay: finiteOr(options.ay, 1),
    zoom: finiteOr(options.zoom, 3),
    showTrue: options.showTrue !== false,
    showLinear: options.showLinear !== false,
    showQuadratic: options.showQuadratic !== false,
    res: 30
  };

  containerEl.innerHTML = `
    <div class="anim anim--plot" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <div class="anim__hint" style="flex:1 1 100%; color: var(--text-secondary); margin-bottom:0.25rem; font-size:0.95rem; line-height:1.4;">
          <strong>Taylor's Theorem in 3D:</strong> Approximations work best <em>near</em> point <strong>a</strong>. <strong style="color:var(--text-primary);">Zoom in close to see them converge!</strong>
        </div>
        <label style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:6ch; color: var(--text-secondary);">Point x:</span>
          <input data-role="ax" type="range" min="-1.5" max="1.5" step="0.1" value="${state.ax}" style="width:140px;" aria-label="x"/>
          <span data-role="ax-val" style="min-width:4ch; font-variant-numeric:tabular-nums;">${state.ax.toFixed(1)}</span>
        </label>
        <label style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:6ch; color: var(--text-secondary);">Point y:</span>
          <input data-role="ay" type="range" min="-1.5" max="1.5" step="0.1" value="${state.ay}" style="width:140px;" aria-label="y"/>
          <span data-role="ay-val" style="min-width:4ch; font-variant-numeric:tabular-nums;">${state.ay.toFixed(1)}</span>
        </label>
        <label style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:6ch; color: var(--text-secondary); font-weight:600;">🔍 Zoom:</span>
          <input data-role="zoom" type="range" min="1" max="10" step="0.1" value="${(3/state.zoom).toFixed(1)}" style="width:160px;" aria-label="zoom level"/>
          <span data-role="zoom-val" style="min-width:4ch; font-variant-numeric:tabular-nums;">${(3/state.zoom).toFixed(1)}x</span>
        </label>
        <div style="display:flex; gap:0.75rem; flex-wrap:wrap; margin-top:0.25rem;">
          <label style="display:inline-flex; gap:0.35rem; align-items:center;"><input data-role="true" type="checkbox" ${state.showTrue?'checked':''} aria-label="Show true surface"/> True f(x,y)</label>
          <label style="display:inline-flex; gap:0.35rem; align-items:center;"><input data-role="linear" type="checkbox" ${state.showLinear?'checked':''} aria-label="Show linear"/> Linear (tangent plane)</label>
          <label style="display:inline-flex; gap:0.35rem; align-items:center;"><input data-role="quad" type="checkbox" ${state.showQuadratic?'checked':''} aria-label="Show quadratic"/> Quadratic</label>
        </div>
        <div role="status" aria-live="polite" data-role="live" style="color: var(--text-secondary); font-size:0.9rem;"></div>
      </div>
      <div class="anim__canvases" style="margin-top:0.6rem;">
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1rem;">
          <div>
            <div style="font-weight:600; margin-bottom:0.5rem; color:var(--text-primary); font-size:0.95rem;">📍 Overview (full function)</div>
            <div class="anim__canvas" data-role="plot-overview" style="width:100%; height:480px;"></div>
          </div>
          <div>
            <div style="font-weight:600; margin-bottom:0.5rem; color:var(--text-primary); font-size:0.95rem;">🔍 Zoomed View (approximations)</div>
            <div class="anim__canvas" data-role="plot-3d" style="width:100%; height:480px;"></div>
          </div>
        </div>
        <div class="anim__legend" style="margin-top:0.5rem; padding:0.5rem 0.75rem; background:var(--bg-tertiary); border-radius:0.375rem; display:flex; gap:1.25rem; flex-wrap:wrap; font-size:0.9rem;">
          <div style="font-weight:600; color:var(--text-primary); width:100%;">Surfaces:</div>
          <span style="display:inline-flex; align-items:center; gap:0.45rem;"><span style="display:inline-block; width:20px; height:3px; background:#6366f1;"></span><strong>True function</strong> f(x,y) = x²y</span>
          <span style="display:inline-flex; align-items:center; gap:0.45rem;"><span style="display:inline-block; width:20px; height:3px; background:#f97316;"></span><strong>Linear</strong> tangent plane</span>
          <span style="display:inline-flex; align-items:center; gap:0.45rem;"><span style="display:inline-block; width:20px; height:3px; background:#22c55e;"></span><strong>Quadratic</strong> approximation</span>
          <span style="display:inline-flex; align-items:center; gap:0.45rem;"><span style="display:inline-block; width:12px; height:12px; background:#ef4444; border-radius:50%;"></span>Expansion point <strong>a</strong></span>
        </div>
      </div>
    </div>
  `;
  const mount3D = containerEl.querySelector('[data-role=plot-3d]');
  const mountOverview = containerEl.querySelector('[data-role=plot-overview]');
  const live = containerEl.querySelector('[data-role=live]');
  const el = {
    ax: containerEl.querySelector('input[data-role=ax]'),
    ay: containerEl.querySelector('input[data-role=ay]'),
    zoom: containerEl.querySelector('input[data-role=zoom]'),
    trueBox: containerEl.querySelector('input[data-role=true]'),
    linear: containerEl.querySelector('input[data-role=linear]'),
    quad: containerEl.querySelector('input[data-role=quad]'),
    axVal: containerEl.querySelector('[data-role=ax-val]'),
    ayVal: containerEl.querySelector('[data-role=ay-val]'),
    zoomVal: containerEl.querySelector('[data-role=zoom-val]')
  };

  let currentCamera = null;
  let currentCameraOverview = null;
  let destroyed = false;

  function loadPlotly() {
    return new Promise((resolve, reject) => {
      if (window.Plotly) return resolve(window.Plotly);
      const scriptId = 'plotly-cdn-script';
      const existing = document.getElementById(scriptId);
      if (existing) {
        existing.addEventListener('load', () => resolve(window.Plotly));
        existing.addEventListener('error', reject);
        return;
      }
      const s = document.createElement('script');
      s.id = scriptId;
      s.src = 'https://cdn.plot.ly/plotly-2.27.0.min.js';
      s.async = true;
      s.onload = () => resolve(window.Plotly);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function evalF(x, y) {
    try {
      const expr = state.f.replace(/\^/g, '**').replace(/x/g, `(${x})`).replace(/y/g, `(${y})`);
      return eval(expr);
    } catch(e) {
      return x*x + y*y;
    }
  }

  function partialX(x, y, h=1e-3) { return (evalF(x+h, y) - evalF(x-h, y)) / (2*h); }
  function partialY(x, y, h=1e-3) { return (evalF(x, y+h) - evalF(x, y-h)) / (2*h); }
  function partialXX(x, y, h=1e-3) { return (evalF(x+h, y) - 2*evalF(x, y) + evalF(x-h, y)) / (h*h); }
  function partialYY(x, y, h=1e-3) { return (evalF(x, y+h) - 2*evalF(x, y) + evalF(x, y-h)) / (h*h); }
  function partialXY(x, y, h=1e-3) { return (evalF(x+h, y+h) - evalF(x+h, y-h) - evalF(x-h, y+h) + evalF(x-h, y-h)) / (4*h*h); }

  async function render() {
    if (destroyed) return;
    
    const ax = +el.ax.value;
    const ay = +el.ay.value;
    const zoomLevel = Math.max(1, +el.zoom.value); // guard against values below slider min
    const zoom = 3 / zoomLevel; // radius for zoomed window
    const showTrue = !!el.trueBox.checked;
    const showLinear = !!el.linear.checked;
    const showQuad = !!el.quad.checked;

    el.axVal.textContent = ax.toFixed(1);
    el.ayVal.textContent = ay.toFixed(1);
    el.zoomVal.textContent = `${zoomLevel}x`;

    const Plotly = await loadPlotly();
    if (destroyed || !Plotly) return;

    // Zoom creates viewing window centered on (ax, ay)
    const bounds = zoom;
    // Adaptive mesh: higher resolution when radius is large so curvature remains visible
    const res = Math.max(30, Math.min(90, Math.round(8 * bounds)));

    // Compute Taylor coefficients at point a
    const fa = evalF(ax, ay);
    const px = partialX(ax, ay);
    const py = partialY(ax, ay);
    const fxx = partialXX(ax, ay);
    const fyy = partialYY(ax, ay);
    const fxy = partialXY(ax, ay);

    // Generate grid centered on (ax, ay)
    const xRange = [];
    const yRange = [];
    for (let i = 0; i <= res; i++) {
      xRange.push(ax - bounds + (i * 2 * bounds) / res);
      yRange.push(ay - bounds + (i * 2 * bounds) / res);
    }

    // Generate surfaces
    const zTrue = [];
    const zLinear = [];
    const zQuad = [];

    for (let i = 0; i <= res; i++) {
      const rowTrue = [];
      const rowLinear = [];
      const rowQuad = [];
      
      for (let j = 0; j <= res; j++) {
        const x = xRange[j];
        const y = yRange[i];
        const dx = x - ax;
        const dy = y - ay;

        rowTrue.push(evalF(x, y));
        rowLinear.push(fa + px * dx + py * dy);
        rowQuad.push(fa + px * dx + py * dy + 0.5 * (fxx * dx * dx + 2 * fxy * dx * dy + fyy * dy * dy));
      }
      
      zTrue.push(rowTrue);
      zLinear.push(rowLinear);
      zQuad.push(rowQuad);
    }

    const traces = [];

    // True function surface
    if (showTrue) {
      traces.push({
        type: 'surface',
        x: xRange,
        y: yRange,
        z: zTrue,
        colorscale: [[0, '#e0e7ff'], [1, '#6366f1']],
        showscale: false,
        opacity: 0.8,
        name: 'True f(x,y)',
        hovertemplate: 'x: %{x:.2f}<br>y: %{y:.2f}<br>f: %{z:.2f}<extra>True</extra>'
      });
    }

    // Linear approximation (tangent plane)
    if (showLinear) {
      traces.push({
        type: 'surface',
        x: xRange,
        y: yRange,
        z: zLinear,
        colorscale: [[0, '#fed7aa'], [1, '#f97316']],
        showscale: false,
        opacity: 0.7,
        name: 'Linear approx',
        hovertemplate: 'x: %{x:.2f}<br>y: %{y:.2f}<br>Linear: %{z:.2f}<extra>Linear</extra>'
      });
    }

    // Quadratic approximation
    if (showQuad) {
      traces.push({
        type: 'surface',
        x: xRange,
        y: yRange,
        z: zQuad,
        colorscale: [[0, '#bbf7d0'], [1, '#22c55e']],
        showscale: false,
        opacity: 0.7,
        name: 'Quadratic approx',
        hovertemplate: 'x: %{x:.2f}<br>y: %{y:.2f}<br>Quadratic: %{z:.2f}<extra>Quadratic</extra>'
      });
    }

    // Expansion point marker
    traces.push({
      type: 'scatter3d',
      mode: 'markers',
      x: [ax],
      y: [ay],
      z: [fa],
      marker: {
        size: 10,
        color: '#ef4444',
        symbol: 'circle',
        line: { color: '#991b1b', width: 2 }
      },
      name: 'Point a',
      hovertemplate: 'a = (%{x:.2f}, %{y:.2f})<br>f(a) = %{z:.2f}<extra>Expansion point</extra>'
    });

    const layout = {
      autosize: true,
      margin: { l: 0, r: 0, t: 30, b: 0 },
      scene: {
        camera: currentCamera || {
          eye: { x: 1.5, y: 1.5, z: 1.3 },
          center: { x: 0, y: 0, z: 0 }
        },
        xaxis: { title: 'x', range: [ax - bounds, ax + bounds], gridcolor: '#cbd5e1' },
        yaxis: { title: 'y', range: [ay - bounds, ay + bounds], gridcolor: '#cbd5e1' },
        zaxis: { title: 'z = f(x,y)', gridcolor: '#cbd5e1' },
        aspectmode: 'cube'
      },
      showlegend: false,
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent'
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      modeBarButtonsToRemove: ['toImage', 'sendDataToCloud', 'select2d', 'lasso2d'],
      displaylogo: false
    };

    if (mount3D) {
      try {
        await Plotly.react(mount3D, traces, layout, config);
        
        if (!mount3D.__relayoutListenerAdded) {
          mount3D.on('plotly_relayout', (eventdata) => {
            if (eventdata['scene.camera']) {
              currentCamera = eventdata['scene.camera'];
            }
          });
          mount3D.__relayoutListenerAdded = true;
        }
      } catch (e) {
        console.error('Plotly render error:', e);
      }
    }

    if (mountOverview) {
      try {
        const overviewBounds = 2.5;
        const overviewRes = 25;
        const xRangeOverview = [];
        const yRangeOverview = [];
        for (let i = 0; i <= overviewRes; i++) {
          xRangeOverview.push(-overviewBounds + (i * 2 * overviewBounds) / overviewRes);
          yRangeOverview.push(-overviewBounds + (i * 2 * overviewBounds) / overviewRes);
        }

        const zTrueOverview = [];
        for (let i = 0; i <= overviewRes; i++) {
          const row = [];
          for (let j = 0; j <= overviewRes; j++) {
            row.push(evalF(xRangeOverview[j], yRangeOverview[i]));
          }
          zTrueOverview.push(row);
        }

        const tracesOverview = [
          {
            type: 'surface',
            x: xRangeOverview,
            y: yRangeOverview,
            z: zTrueOverview,
            colorscale: [[0, '#e0e7ff'], [1, '#6366f1']],
            showscale: false,
            opacity: 0.7,
            hovertemplate: 'x: %{x:.2f}<br>y: %{y:.2f}<br>f: %{z:.2f}<extra>True</extra>'
          },
          {
            type: 'scatter3d',
            mode: 'markers',
            x: [ax],
            y: [ay],
            z: [fa],
            marker: { size: 8, color: '#ef4444', symbol: 'circle', line: { color: '#991b1b', width: 2 } },
            hovertemplate: 'a = (%{x:.2f}, %{y:.2f})<br>f(a) = %{z:.2f}<extra>Point a</extra>'
          }
        ];

        const circlePts = { x: [], y: [], z: [] };
        for (let i = 0; i <= 100; i++) {
          const ang = (i / 100) * 2 * Math.PI;
          circlePts.x.push(ax + zoom * Math.cos(ang));
          circlePts.y.push(ay + zoom * Math.sin(ang));
          circlePts.z.push(0);
        }
        tracesOverview.push({
          type: 'scatter3d',
          mode: 'lines',
          x: circlePts.x,
          y: circlePts.y,
          z: circlePts.z,
          line: { color: '#22c55e', width: 4 },
          hovertemplate: 'Zoom radius<extra></extra>'
        });

        const layoutOverview = {
          autosize: true,
          margin: { l: 0, r: 0, t: 5, b: 0 },
          scene: {
            camera: currentCameraOverview || { eye: { x: 1.5, y: 1.5, z: 1.3 }, center: { x: 0, y: 0, z: 0 } },
            xaxis: { title: 'x', range: [-overviewBounds, overviewBounds], gridcolor: '#cbd5e1' },
            yaxis: { title: 'y', range: [-overviewBounds, overviewBounds], gridcolor: '#cbd5e1' },
            zaxis: { title: 'z', gridcolor: '#cbd5e1' },
            aspectmode: 'cube'
          },
          showlegend: false,
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent'
        };

        await Plotly.react(mountOverview, tracesOverview, layoutOverview, config);

        if (!mountOverview.__relayoutListenerAdded) {
          mountOverview.on('plotly_relayout', (eventdata) => {
            if (eventdata['scene.camera']) {
              currentCameraOverview = eventdata['scene.camera'];
            }
          });
          mountOverview.__relayoutListenerAdded = true;
        }
      } catch (e) {
        console.error('Plotly overview render error:', e);
      }
    }

    if (live) {
      const parts = [];
      if (showTrue) parts.push('true');
      if (showLinear) parts.push('linear');
      if (showQuad) parts.push('quadratic');
      const zoomMsg = (zoomLevel > 8)
        ? ' — Very zoomed in! Approximations nearly perfect.'
        : (zoomLevel > 5)
          ? ' — Zoomed in, good fit.'
          : (zoomLevel > 2)
            ? ' — Medium zoom.'
            : ' — Zoomed out, approximations diverge.';
      live.textContent = `Showing ${parts.join(', ')} at a=(${ax.toFixed(1)}, ${ay.toFixed(1)}), f(a)=${fa.toFixed(2)}. Zoom: ${zoomLevel.toFixed(1)}x, radius=${zoom.toFixed(2)}${zoomMsg}`;
    }
  }

  loadPlotly()
    .then(() => {
      if (!destroyed) {
        Object.values(el).filter(e => e?.addEventListener).forEach(inp => 
          inp.addEventListener('input', render)
        );
        render();
      }
    })
    .catch(() => {
      if (mount3D) {
        mount3D.innerHTML = '<div style="padding:2rem; text-align:center; color: var(--text-secondary);">Failed to load Plotly. Please check your connection.</div>';
      }
    });

  return {
    destroy() {
      destroyed = true;
      try {
        Object.values(el).filter(e => e?.removeEventListener).forEach(inp => 
          inp.removeEventListener('input', render)
        );
      } catch(_){ }
      try {
        if (mount3D && window.Plotly) window.Plotly.purge(mount3D);
        if (mountOverview && window.Plotly) window.Plotly.purge(mountOverview);
      } catch(_){ }
      try { containerEl.innerHTML = ''; } catch(_){ }
    }
  };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch5_taylor_surfaces_3d'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch5_taylor_surfaces_3d');
      }
    } catch (e) {
      console.error('Failed to register animation ch5_taylor_surfaces_3d', e);
    }
  })();

  // ch6_coercivity_superlevelsets.js
  (function(){
    // Chapter 6: Existence via Coercivity — Superlevel Sets
// Public API: init(containerEl, options) -> { destroy }
// Visual: Superlevel sets {(K,L): π(K,L) ≥ c} bounded when α+β<1, unbounded at CRS

function init(containerEl, options = {}) {
  if (!containerEl) return { destroy() {} };

  const Plot = (window && window.Plot) ? window.Plot : null;
  const d3 = (window && window.d3) ? window.d3 : null;

  if (!Plot || !d3) {
    containerEl.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">Plot/D3 not loaded.</div>';
    return { destroy() { containerEl.innerHTML = ''; } };
  }

  function finiteOr(v, d) { const x = +v; return Number.isFinite(x) ? x : d; }

  const state = {
    p: finiteOr(options.p, 10),
    r: finiteOr(options.r, 2),
    w: finiteOr(options.w, 3),
    alpha: finiteOr(options.alpha, 0.3),
    beta: finiteOr(options.beta, 0.6),
    threshold: finiteOr(options.threshold, 5),
    showRays: false
  };

  containerEl.innerHTML = `
    <div class="anim anim--plot" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <div class="anim__hint" style="flex:1 1 100%; color: var(--text-secondary); margin-bottom:0.25rem;">
          <strong>Superlevel set</strong> {(K,L): π(K,L) ≥ c} shown in green. When α+β<1 (DRS): bounded → compact → existence guaranteed. When α+β→1 (CRS): unbounded → no existence guarantee without bounds.
        </div>
        <label title="Capital exponent" style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:3ch; color: var(--text-secondary);">α:</span>
          <input data-role="alpha" type="range" min="0.1" max="0.9" step="0.05" value="${state.alpha}" style="width:100px;" aria-label="Alpha">
          <span data-role="alpha-val" style="min-width:4ch; text-align:right; color: var(--text-secondary);">${state.alpha.toFixed(2)}</span>
        </label>
        <label title="Labor exponent" style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:3ch; color: var(--text-secondary);">β:</span>
          <input data-role="beta" type="range" min="0.1" max="0.9" step="0.05" value="${state.beta}" style="width:100px;" aria-label="Beta">
          <span data-role="beta-val" style="min-width:4ch; text-align:right; color: var(--text-secondary);">${state.beta.toFixed(2)}</span>
        </label>
        <label title="Output price" style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:3ch; color: var(--text-secondary);">p:</span>
          <input data-role="p" type="range" min="1" max="20" step="0.5" value="${state.p}" style="width:100px;" aria-label="Price p">
          <span data-role="p-val" style="min-width:4ch; text-align:right; color: var(--text-secondary);">${state.p}</span>
        </label>
        <label title="Superlevel threshold c" style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:3ch; color: var(--text-secondary);">c:</span>
          <input data-role="c" type="range" min="-10" max="30" step="1" value="${state.threshold}" style="width:120px;" aria-label="Threshold c">
          <span data-role="c-val" style="min-width:4ch; text-align:right; color: var(--text-secondary);">${state.threshold}</span>
        </label>
        <label style="display:inline-flex; gap:0.35rem; align-items:center;" title="Show growth direction rays">
          <input data-role="rays" type="checkbox" aria-label="Show boundary rays"/> Rays
        </label>
        <div role="status" aria-live="polite" data-role="live" style="color: var(--text-secondary); flex:1 1 100%;"></div>
      </div>
      <div class="anim__canvases" style="margin-top:0.6rem;">
        <div class="anim__canvas" data-role="plot"></div>
        <div class="anim__legend" style="margin-top:0.35rem; display:flex; gap:1rem; flex-wrap:wrap; color: var(--text-secondary);">
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:18px; height:3px; background:#60a5fa;"></span>π contours</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:18px; height:12px; background:rgba(34,197,94,0.2); border:1px solid #22c55e;"></span>Superlevel {π≥c}</span>
        </div>
        <div class="anim__caption" style="margin-top:0.25rem; color: var(--text-secondary);">
          Coercivity (π→−∞ as ‖(K,L)‖→∞) ensures bounded superlevel sets. Bounded + continuous → compact → existence (Weierstrass).
        </div>
      </div>
    </div>
  `;

  const mount = containerEl.querySelector('[data-role=plot]');
  const live = containerEl.querySelector('[data-role=live]');
  const alphaEl = containerEl.querySelector('[data-role=alpha]');
  const betaEl = containerEl.querySelector('[data-role=beta]');
  const pEl = containerEl.querySelector('[data-role=p]');
  const cEl = containerEl.querySelector('[data-role=c]');
  const alphaVal = containerEl.querySelector('[data-role=alpha-val]');
  const betaVal = containerEl.querySelector('[data-role=beta-val]');
  const pVal = containerEl.querySelector('[data-role=p-val]');
  const cVal = containerEl.querySelector('[data-role=c-val]');
  const raysEl = containerEl.querySelector('[data-role=rays]');

  let currentFig = null;

  function profit(K, L) {
    K = Math.max(1e-9, K); L = Math.max(1e-9, L);
    return state.p * Math.pow(K, state.alpha) * Math.pow(L, state.beta) - state.r * K - state.w * L;
  }

  function render() {
    state.alpha = +alphaEl.value;
    state.beta = +betaEl.value;
    state.p = +pEl.value;
    state.threshold = +cEl.value;
    alphaVal.textContent = state.alpha.toFixed(2);
    betaVal.textContent = state.beta.toFixed(2);
    pVal.textContent = state.p.toFixed(1);
    cVal.textContent = state.threshold.toFixed(0);

    // Build contours
    const Kmax = 500, Lmax = 500;
    const nx = 80, ny = 80;
    const Ks = d3.range(nx).map(i => (i / (nx - 1)) * Kmax);
    const Ls = d3.range(ny).map(j => (j / (ny - 1)) * Lmax);
    const values = new Float64Array(nx * ny);
    
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        values[j * nx + i] = profit(Ks[i], Ls[j]);
      }
    }

    const vmax = d3.max(values);
    const vmin = d3.min(values);
    const levels = d3.range(8).map(i => vmin + (i / 7) * (vmax - vmin));

    const contours = d3.contours()
      .size([nx, ny])
      .smooth(true)
      .thresholds(levels)(values);

    const contourData = [];
    for (const c of contours) {
      for (const poly of c.coordinates) {
        for (const ring of poly) {
          const pts = ring.map(([ix, iy]) => {
            const K = Ks[Math.max(0, Math.min(nx - 1, Math.floor(ix)))];
            const L = Ls[Math.max(0, Math.min(ny - 1, Math.floor(iy)))];
            return { K, L };
          });
          contourData.push(pts);
        }
      }
    }

    const marks = [
      ...contourData.map(pts => Plot.line(pts, { 
        x: 'K', y: 'L', stroke: '#60a5fa', opacity: 0.4, strokeWidth: 1 
      }))
    ];

    // Superlevel set: π(K,L) ≥ c
    // Create filled region
    const superlevelMask = [];
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        if (values[j * nx + i] >= state.threshold) {
          superlevelMask.push({ K: Ks[i], L: Ls[j] });
        }
      }
    }

    if (superlevelMask.length > 0) {
      // Use contour at threshold level to draw boundary
      const superContours = d3.contours()
        .size([nx, ny])
        .smooth(true)
        .thresholds([state.threshold])(values);

      for (const c of superContours) {
        for (const poly of c.coordinates) {
          for (const ring of poly) {
            const pts = ring.map(([ix, iy]) => {
              const K = Ks[Math.max(0, Math.min(nx - 1, Math.floor(ix)))];
              const L = Ls[Math.max(0, Math.min(ny - 1, Math.floor(iy)))];
              return { K, L };
            });
            
            marks.push(
              // Use polygon fill instead of area for closed regions
              Plot.geo([{
                type: "Polygon",
                coordinates: [pts.map(p => [p.K, p.L])]
              }], { 
                fill: 'rgba(34,197,94,0.15)',
                stroke: '#22c55e',
                strokeWidth: 2,
                strokeOpacity: 0.8
              })
            );
          }
        }
      }
    }

    // Boundary rays (if enabled)
    if (state.showRays) {
      const directions = [
        [1, 0], [0, 1], [1, 1], [-1, 1]
      ];
      for (const [dk, dl] of directions) {
        const rayPts = [];
        for (let t = 0; t <= 1; t += 0.01) {
          const K = t * Kmax * dk;
          const L = t * Lmax * dl;
          if (K >= 0 && L >= 0 && K <= Kmax && L <= Lmax) {
            rayPts.push({ K, L });
          }
        }
        if (rayPts.length > 0) {
          marks.push(
            Plot.line(rayPts, { 
              x: 'K', y: 'L', stroke: 'rgba(245,158,11,0.4)', strokeWidth: 1, strokeDasharray: '4,2' 
            })
          );
        }
      }
    }

    const width = Math.min(800, Math.max(480, (mount?.clientWidth || 640)));
    const height = Math.round(width * 0.68);

    const fig = Plot.plot({
      width,
      height,
      marginLeft: 54,
      marginBottom: 50,
      x: { label: 'K', domain: [0, Kmax], grid: true },
      y: { label: 'L', domain: [0, Lmax], grid: true },
      style: { background: 'transparent', color: 'var(--text-secondary)' },
      marks
    });

    if (currentFig) { try { currentFig.remove(); } catch (_) {} }
    if (mount) {
      mount.innerHTML = '';
      mount.appendChild(fig);
      currentFig = fig;
    }

    // Check boundedness
    const returnSum = state.alpha + state.beta;
    const isDRS = returnSum < 1;
    
    // Heuristic: check if superlevel set extends to boundary
    let touchesBoundary = false;
    const margin = Kmax * 0.05;
    for (let i = 0; i < nx; i++) {
      if (values[i] >= state.threshold || values[(ny-1)*nx + i] >= state.threshold) {
        if (Ks[i] > Kmax - margin) touchesBoundary = true;
      }
    }
    for (let j = 0; j < ny; j++) {
      if (values[j*nx + nx-1] >= state.threshold) {
        if (Ls[j] > Lmax - margin) touchesBoundary = true;
      }
    }

    const isBounded = !touchesBoundary || isDRS;

    // Status
    let status = `α+β = ${returnSum.toFixed(2)} ${isDRS ? '<1 (DRS)' : returnSum > 1.05 ? '>1 (IRS)' : '≈1 (CRS)'}`;
    status += ` | Superlevel {π≥${state.threshold}} is ${isBounded ? 'BOUNDED ✓' : 'UNBOUNDED (extends to ∞)'}`;
    if (isDRS) {
      status += ' — Coercivity → existence guaranteed';
    } else if (returnSum >= 0.99) {
      status += ' — No coercivity; existence not automatic';
    }
    
    live.textContent = status;
  }

  // Event handlers
  const onChange = () => render();

  alphaEl.addEventListener('input', onChange);
  betaEl.addEventListener('input', onChange);
  pEl.addEventListener('input', onChange);
  cEl.addEventListener('input', onChange);
  raysEl.addEventListener('change', () => { state.showRays = raysEl.checked; render(); });

  render();

  return {
    destroy() {
      try {
        alphaEl.removeEventListener('input', onChange);
        betaEl.removeEventListener('input', onChange);
        pEl.removeEventListener('input', onChange);
        cEl.removeEventListener('input', onChange);
        if (currentFig) currentFig.remove();
      } catch (_) {}
      containerEl.innerHTML = '';
    }
  };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch6_coercivity_superlevelsets'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch6_coercivity_superlevelsets');
      }
    } catch (e) {
      console.error('Failed to register animation ch6_coercivity_superlevelsets', e);
    }
  })();

  // ch6_convex_set_chord_test.js
  (function(){
    // Chapter 6: Convex Set — Chord Test (2D)
// Public API: init(containerEl, options) -> { destroy }
// Visual: Interactive test of convex set definition: λx + (1−λ)y ∈ S

function init(containerEl, options = {}) {
  if (!containerEl) return { destroy() {} };

  const state = {
    setType: 'disk',
    lambda: 0.5,
    x: [-0.6, 0.2],
    y: [0.7, -0.4],
    snapToSet: false,
    dragging: null
  };

  containerEl.innerHTML = `
    <div class="anim anim--plot" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <div class="anim__hint" style="flex:1 1 100%; color: var(--text-secondary); margin-bottom:0.25rem;">
          Test convexity: for all points x,y in S, is λx + (1−λ)y also in S? Drag points or adjust λ to explore.
        </div>
        <label title="Set type" style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:6ch; color: var(--text-secondary);">Set S:</span>
          <select data-role="setType" style="padding:0.35rem; background: var(--bg-tertiary); color: var(--text-primary); border:1px solid var(--border-color); border-radius:0.4rem;" aria-label="Set type">
            <option value="disk">Disk (convex)</option>
            <option value="square">Square (convex)</option>
            <option value="ellipse">Ellipse (convex)</option>
            <option value="concave">Concave Polygon (non-convex)</option>
            <option value="crescent">Crescent (non-convex)</option>
            <option value="annulus">Annulus Segment (non-convex)</option>
          </select>
        </label>
        <label title="Convex combination parameter" style="display:flex; align-items:center; gap:0.5rem; min-width:280px;">
          <span style="min-width:6ch; text-align:right; color: var(--text-secondary);">λ</span>
          <input data-role="lambda" type="range" min="0" max="1" step="0.01" value="0.5" aria-label="Lambda parameter">
          <input data-role="lambda-num" type="number" min="0" max="1" step="0.01" value="0.5" style="width:5rem; padding:0.25rem; background: var(--bg-tertiary); color: var(--text-primary); border:1px solid var(--border-color); border-radius:0.25rem;" aria-label="Lambda value">
        </label>
        <label style="display:inline-flex; gap:0.35rem; align-items:center;" title="Snap dragged points to set boundary">
          <input data-role="snap" type="checkbox" aria-label="Snap x,y to S"/> Snap to S
        </label>
        <div role="status" aria-live="polite" data-role="live" style="color: var(--text-secondary); flex:1 1 100%;"></div>
      </div>
      <div class="anim__canvases" style="margin-top:0.6rem;">
        <canvas data-role="canvas" width="800" height="600" style="border:1px solid var(--border-color); border-radius:0.5rem; max-width:100%; cursor:crosshair;"></canvas>
        <div class="anim__legend" style="margin-top:0.35rem; display:flex; gap:1rem; flex-wrap:wrap; color: var(--text-secondary);">
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:16px; height:16px; background:#60a5fa66; border:2px solid #60a5fa;"></span>Set S</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:14px; height:14px; border-radius:50%; background:#ef4444;"></span>Point x</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:14px; height:14px; border-radius:50%; background:#22c55e;"></span>Point y</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:14px; height:14px; border-radius:50%; background:#f59e0b;"></span>Point z = λx+(1−λ)y</span>
        </div>
        <div class="anim__caption" style="margin-top:0.25rem; color: var(--text-secondary);">
          A set is convex if the line segment between any two points in the set lies entirely within the set.
        </div>
      </div>
    </div>
  `;

  const canvas = containerEl.querySelector('[data-role=canvas]');
  const ctx = canvas.getContext('2d');
  const live = containerEl.querySelector('[data-role=live]');
  const setTypeEl = containerEl.querySelector('[data-role=setType]');
  const lambdaEl = containerEl.querySelector('[data-role=lambda]');
  const lambdaNumEl = containerEl.querySelector('[data-role=lambda-num]');
  const snapEl = containerEl.querySelector('[data-role=snap]');

  // Set geometries
  function isInSet(pt, setType) {
    const [x, y] = pt;
    switch (setType) {
      case 'disk':
        return x*x + y*y <= 1;
      case 'square':
        return Math.abs(x) <= 0.8 && Math.abs(y) <= 0.8;
      case 'ellipse':
        return (x*x/1.2) + (y*y/0.7) <= 1;
      case 'concave': {
        // L-shaped region: union of two rectangles
        const inLeft = x >= -1 && x <= 0 && y >= -1 && y <= 1;
        const inBottom = x >= -1 && x <= 1 && y >= -1 && y <= 0;
        return inLeft || inBottom;
      }
      case 'crescent': {
        // Disk minus a smaller offset disk
        const inOuter = x*x + y*y <= 1;
        const inInner = (x-0.4)*(x-0.4) + y*y <= 0.6*0.6;
        return inOuter && !inInner;
      }
      case 'annulus': {
        // Annulus in first quadrant only
        const r2 = x*x + y*y;
        return r2 >= 0.3*0.3 && r2 <= 1 && x >= 0 && y >= 0;
      }
      default:
        return false;
    }
  }

  function drawSet(setType) {
    ctx.fillStyle = 'rgba(96, 165, 250, 0.2)';
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;

    switch (setType) {
      case 'disk':
        ctx.beginPath();
        ctx.arc(0, 0, 100, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        break;
      case 'square':
        ctx.fillRect(-80, -80, 160, 160);
        ctx.strokeRect(-80, -80, 160, 160);
        break;
      case 'ellipse':
        ctx.save();
        ctx.scale(Math.sqrt(1.2), Math.sqrt(0.7));
        ctx.beginPath();
        ctx.arc(0, 0, 100, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        break;
      case 'concave':
        ctx.beginPath();
        ctx.rect(-100, -100, 100, 200); // left vertical
        ctx.rect(-100, 0, 200, 100); // bottom horizontal
        ctx.fill();
        ctx.stroke();
        break;
      case 'crescent':
        ctx.beginPath();
        ctx.arc(0, 0, 100, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(40, 0, 60, 0, 2 * Math.PI);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = '#60a5fa';
        ctx.beginPath();
        ctx.arc(40, 0, 60, 0, 2 * Math.PI);
        ctx.stroke();
        break;
      case 'annulus':
        ctx.beginPath();
        ctx.arc(0, 0, 100, 0, Math.PI/2);
        ctx.arc(0, 0, 30, Math.PI/2, 0, true);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
    }
  }

  function worldToCanvas(pt) {
    const scale = 100;
    return [canvas.width/2 + pt[0]*scale, canvas.height/2 - pt[1]*scale];
  }

  function canvasToWorld(px, py) {
    const scale = 100;
    return [(px - canvas.width/2)/scale, -(py - canvas.height/2)/scale];
  }

  function render() {
    state.lambda = +lambdaEl.value;
    lambdaNumEl.value = state.lambda.toFixed(2);

    // Clear and setup
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width/2, canvas.height/2);

    // Draw axes
    ctx.strokeStyle = 'rgba(160,160,160,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-canvas.width/2, 0);
    ctx.lineTo(canvas.width/2, 0);
    ctx.moveTo(0, -canvas.height/2);
    ctx.lineTo(0, canvas.height/2);
    ctx.stroke();

    // Draw set
    drawSet(state.setType);

    ctx.restore();

    // Draw line segment from x to y
    const xCanvas = worldToCanvas(state.x);
    const yCanvas = worldToCanvas(state.y);
    ctx.strokeStyle = 'rgba(160,160,160,0.5)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(xCanvas[0], xCanvas[1]);
    ctx.lineTo(yCanvas[0], yCanvas[1]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Compute z = λx + (1-λ)y
    const z = [
      state.lambda * state.x[0] + (1 - state.lambda) * state.y[0],
      state.lambda * state.x[1] + (1 - state.lambda) * state.y[1]
    ];
    const zCanvas = worldToCanvas(z);

    // Draw point z with color based on membership
    const zInSet = isInSet(z, state.setType);
    ctx.fillStyle = zInSet ? '#22c55e' : '#f59e0b';
    ctx.beginPath();
    ctx.arc(zCanvas[0], zCanvas[1], 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw points x and y
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(xCanvas[0], xCanvas[1], 7, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(yCanvas[0], yCanvas[1], 7, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Labels
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText('x', xCanvas[0] + 12, xCanvas[1] - 8);
    ctx.fillText('x', xCanvas[0] + 12, xCanvas[1] - 8);
    ctx.strokeText('y', yCanvas[0] + 12, yCanvas[1] - 8);
    ctx.fillText('y', yCanvas[0] + 12, yCanvas[1] - 8);
    ctx.strokeText('z', zCanvas[0] + 12, zCanvas[1] - 8);
    ctx.fillText('z', zCanvas[0] + 12, zCanvas[1] - 8);

    // Status
    const xInSet = isInSet(state.x, state.setType);
    const yInSet = isInSet(state.y, state.setType);
    let status = `x ∈ S: ${xInSet ? '✓' : '✗'},  y ∈ S: ${yInSet ? '✓' : '✗'},  z(${state.lambda.toFixed(2)}) ∈ S: ${zInSet ? '✓' : '✗'}`;
    if (xInSet && yInSet && !zInSet) {
      status += ' — Set is NOT convex!';
    } else if (xInSet && yInSet && zInSet) {
      status += ' — Chord test passed ✓';
    }
    live.textContent = status;
  }

  // Event handlers
  const onSetType = () => { state.setType = setTypeEl.value; render(); };
  const onLambda = () => { state.lambda = +lambdaEl.value; render(); };
  const onLambdaNum = () => { lambdaEl.value = lambdaNumEl.value; onLambda(); };
  const onSnap = () => { state.snapToSet = snapEl.checked; };

  setTypeEl.addEventListener('change', onSetType);
  lambdaEl.addEventListener('input', onLambda);
  lambdaNumEl.addEventListener('input', onLambdaNum);
  snapEl.addEventListener('change', onSnap);

  // Mouse interaction
  function getMousePos(evt) {
    const rect = canvas.getBoundingClientRect();
    return [evt.clientX - rect.left, evt.clientY - rect.top];
  }

  function nearPoint(canvasPt, worldPt, threshold = 15) {
    const wCanvas = worldToCanvas(worldPt);
    return Math.hypot(canvasPt[0] - wCanvas[0], canvasPt[1] - wCanvas[1]) < threshold;
  }

  canvas.addEventListener('mousedown', (evt) => {
    const mouse = getMousePos(evt);
    if (nearPoint(mouse, state.x)) state.dragging = 'x';
    else if (nearPoint(mouse, state.y)) state.dragging = 'y';
  });

  canvas.addEventListener('mousemove', (evt) => {
    if (!state.dragging) return;
    const mouse = getMousePos(evt);
    const world = canvasToWorld(mouse[0], mouse[1]);
    
    if (state.snapToSet) {
      // Simple snap: check if in set, otherwise project to nearest point
      // For simplicity, just use the point if in set, else clamp to boundary
      // This is a simplified snap - real implementation would project to boundary
      if (!isInSet(world, state.setType)) {
        // For disk/ellipse, project radially
        const r = Math.hypot(world[0], world[1]);
        if (state.setType === 'disk' && r > 1) {
          world[0] /= r;
          world[1] /= r;
        }
      }
    }

    if (state.dragging === 'x') state.x = world;
    else if (state.dragging === 'y') state.y = world;
    render();
  });

  canvas.addEventListener('mouseup', () => { state.dragging = null; });
  canvas.addEventListener('mouseleave', () => { state.dragging = null; });

  // Keyboard support
  document.addEventListener('keydown', (evt) => {
    if (!containerEl.contains(evt.target)) return;
    const step = evt.shiftKey ? 0.1 : 0.01;
    if (evt.key === 'ArrowLeft') { lambdaEl.value = Math.max(0, state.lambda - step); onLambda(); evt.preventDefault(); }
    else if (evt.key === 'ArrowRight') { lambdaEl.value = Math.min(1, state.lambda + step); onLambda(); evt.preventDefault(); }
  });

  render();

  return {
    destroy() {
      setTypeEl.removeEventListener('change', onSetType);
      lambdaEl.removeEventListener('input', onLambda);
      lambdaNumEl.removeEventListener('input', onLambdaNum);
      snapEl.removeEventListener('change', onSnap);
      containerEl.innerHTML = '';
    }
  };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch6_convex_set_chord_test'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch6_convex_set_chord_test');
      }
    } catch (e) {
      console.error('Failed to register animation ch6_convex_set_chord_test', e);
    }
  })();

  // ch6_epigraph_hypograph.js
  (function(){
    // Chapter 6: Epigraph/Hypograph Convexity (1D)
// Public API: init(containerEl, options) -> { destroy }
// Visual: Show epigraph {(x,t): t ≥ f(x)} or hypograph {(x,t): t ≤ f(x)} convexity

function init(containerEl, options = {}) {
  if (!containerEl) return { destroy() {} };

  const Plot = (window && window.Plot) ? window.Plot : null;
  const d3 = (window && window.d3) ? window.d3 : null;

  if (!Plot || !d3) {
    containerEl.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">Plot/D3 not loaded.</div>';
    return { destroy() { containerEl.innerHTML = ''; } };
  }

  const functions = {
    'ln': { fn: x => Math.log(x), domain: [0.1, 5], name: 'ln(x)', type: 'concave' },
    'sqrt': { fn: x => Math.sqrt(x), domain: [0.1, 5], name: '√x', type: 'concave' },
    'quad': { fn: x => x*x, domain: [-3, 3], name: 'x²', type: 'convex' },
    'cos': { fn: x => Math.cos(x), domain: [0, 2*Math.PI], name: 'cos(x)', type: 'neither' },
    'cubic': { fn: x => x*x*x, domain: [-2, 2], name: 'x³', type: 'neither' }
  };

  const state = {
    funcKey: 'ln',
    viewType: 'hypograph', // 'epigraph' or 'hypograph'
    testX1: 1,
    testX2: 3,
    showTest: true
  };

  containerEl.innerHTML = `
    <div class="anim anim--plot" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <div class="anim__hint" style="flex:1 1 100%; color: var(--text-secondary); margin-bottom:0.25rem;">
          Epigraph = {(x,t): t ≥ f(x)}. Hypograph = {(x,t): t ≤ f(x)}. A function is convex ⇔ epigraph convex; concave ⇔ hypograph convex.
        </div>
        <label title="Function" style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:6ch; color: var(--text-secondary);">f(x):</span>
          <select data-role="func" style="padding:0.35rem; background: var(--bg-tertiary); color: var(--text-primary); border:1px solid var(--border-color); border-radius:0.4rem;" aria-label="Function">
            <option value="ln">ln(x) — concave</option>
            <option value="sqrt">√x — concave</option>
            <option value="quad">x² — convex</option>
            <option value="cos">cos(x) — neither</option>
            <option value="cubic">x³ — neither</option>
          </select>
        </label>
        <label title="Region view" style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:6ch; color: var(--text-secondary);">View:</span>
          <select data-role="view" style="padding:0.35rem; background: var(--bg-tertiary); color: var(--text-primary); border:1px solid var(--border-color); border-radius:0.4rem;" aria-label="View type">
            <option value="hypograph">Hypograph (below)</option>
            <option value="epigraph">Epigraph (above)</option>
          </select>
        </label>
        <label style="display:inline-flex; gap:0.35rem; align-items:center;" title="Show convexity test with two points">
          <input data-role="test" type="checkbox" checked aria-label="Show test"/> Show chord test
        </label>
        <div role="status" aria-live="polite" data-role="live" style="color: var(--text-secondary); flex:1 1 100%;"></div>
      </div>
      <div class="anim__canvases" style="margin-top:0.6rem;">
        <div class="anim__canvas" data-role="plot"></div>
        <div class="anim__legend" style="margin-top:0.35rem; display:flex; gap:1rem; flex-wrap:wrap; color: var(--text-secondary);">
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:20px; height:3px; background:#60a5fa;"></span>f(x)</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:20px; height:12px; background:rgba(34,197,94,0.2); border:1px solid #22c55e;"></span>Region (epi/hypo)</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:20px; height:3px; background:#f59e0b;"></span>Test chord</span>
        </div>
        <div class="anim__caption" style="margin-top:0.25rem; color: var(--text-secondary);">
          For concave f, hypograph is convex. For convex f, epigraph is convex. Test by checking if chord stays in region.
        </div>
      </div>
    </div>
  `;

  const mount = containerEl.querySelector('[data-role=plot]');
  const live = containerEl.querySelector('[data-role=live]');
  const funcEl = containerEl.querySelector('[data-role=func]');
  const viewEl = containerEl.querySelector('[data-role=view]');
  const testEl = containerEl.querySelector('[data-role=test]');

  let currentFig = null;

  function getFunc() { return functions[state.funcKey]; }

  function render() {
    const func = getFunc();
    const domain = func.domain;
    const samples = 200;
    
    // Sample function
    const funcData = [];
    let ymin = Infinity, ymax = -Infinity;
    for (let i = 0; i <= samples; i++) {
      const x = domain[0] + (i / samples) * (domain[1] - domain[0]);
      const y = func.fn(x);
      if (Number.isFinite(y)) {
        funcData.push({ x, y });
        ymin = Math.min(ymin, y);
        ymax = Math.max(ymax, y);
      }
    }
    
    const yPad = 0.3 * (ymax - ymin);
    const range = [ymin - yPad, ymax + yPad];

    // Build region polygon
    const isEpi = state.viewType === 'epigraph';
    const regionData = [];
    
    if (isEpi) {
      // Epigraph: above f(x)
      for (let i = 0; i <= samples; i++) {
        const x = domain[0] + (i / samples) * (domain[1] - domain[0]);
        regionData.push({ x, y: func.fn(x) });
      }
      regionData.push({ x: domain[1], y: range[1] });
      regionData.push({ x: domain[0], y: range[1] });
    } else {
      // Hypograph: below f(x)
      for (let i = 0; i <= samples; i++) {
        const x = domain[0] + (i / samples) * (domain[1] - domain[0]);
        regionData.push({ x, y: func.fn(x) });
      }
      regionData.push({ x: domain[1], y: range[0] });
      regionData.push({ x: domain[0], y: range[0] });
    }

    // Test points
    const x1 = Math.max(domain[0], Math.min(domain[1], state.testX1));
    const x2 = Math.max(domain[0], Math.min(domain[1], state.testX2));
    const y1 = func.fn(x1);
    const y2 = func.fn(x2);
    
    // Check if chord is in region
    let chordInRegion = true;
    const testSteps = 20;
    for (let i = 0; i <= testSteps; i++) {
      const lambda = i / testSteps;
      const xTest = lambda * x1 + (1 - lambda) * x2;
      const yChord = lambda * y1 + (1 - lambda) * y2;
      const yFunc = func.fn(xTest);
      
      if (isEpi) {
        // Chord should be above function
        if (yChord < yFunc - 0.01) { chordInRegion = false; break; }
      } else {
        // Chord should be below function
        if (yChord > yFunc + 0.01) { chordInRegion = false; break; }
      }
    }

    const marks = [
      // Region shading - use areaY with function as one boundary
      Plot.areaY(funcData, { 
        x: 'x', 
        y1: isEpi ? 'y' : range[0],
        y2: isEpi ? range[1] : 'y',
        fill: 'rgba(34,197,94,0.15)',
        curve: 'linear'
      }),
      // Function curve
      Plot.line(funcData, { 
        x: 'x', 
        y: 'y', 
        stroke: '#60a5fa', 
        strokeWidth: 2.5 
      })
    ];

    // Test chord
    if (state.showTest) {
      marks.push(
        Plot.line([{ x: x1, y: y1 }, { x: x2, y: y2 }], {
          x: 'x',
          y: 'y',
          stroke: chordInRegion ? '#22c55e' : '#ef4444',
          strokeWidth: 2,
          strokeDasharray: '5,3'
        }),
        Plot.dot([{ x: x1, y: y1 }, { x: x2, y: y2 }], {
          x: 'x',
          y: 'y',
          r: 5,
          fill: '#f59e0b',
          stroke: '#fff',
          strokeWidth: 1.5
        })
      );
    }

    const width = Math.min(800, Math.max(480, (mount?.clientWidth || 640)));
    const height = Math.round(width * 0.55);

    const fig = Plot.plot({
      width,
      height,
      marginLeft: 54,
      marginBottom: 50,
      x: { label: 'x', domain: domain, grid: true },
      y: { label: 't', domain: range, grid: true },
      style: { background: 'transparent', color: 'var(--text-secondary)' },
      marks
    });

    if (currentFig) { try { currentFig.remove(); } catch (_) {} }
    if (mount) {
      mount.innerHTML = '';
      mount.appendChild(fig);
      currentFig = fig;
    }

    // Status
    const regionType = isEpi ? 'Epigraph' : 'Hypograph';
    const expectedConvex = (isEpi && func.type === 'convex') || (!isEpi && func.type === 'concave');
    let status = `${regionType} of ${func.name}`;
    if (state.showTest) {
      status += ` — Chord test: ${chordInRegion ? '✓ in region' : '✗ outside region'}`;
      if (chordInRegion && expectedConvex) {
        status += ' (confirms convexity)';
      } else if (!chordInRegion && !expectedConvex) {
        status += ' (region not convex, as expected)';
      }
    }
    live.textContent = status;
  }

  // Event handlers
  const onFunc = () => { 
    state.funcKey = funcEl.value; 
    const func = getFunc();
    state.testX1 = func.domain[0] + 0.25 * (func.domain[1] - func.domain[0]);
    state.testX2 = func.domain[0] + 0.75 * (func.domain[1] - func.domain[0]);
    render(); 
  };
  const onView = () => { state.viewType = viewEl.value; render(); };
  const onTest = () => { state.showTest = testEl.checked; render(); };

  funcEl.addEventListener('change', onFunc);
  viewEl.addEventListener('change', onView);
  testEl.addEventListener('change', onTest);

  // Draggable test points (simple click to set)
  if (currentFig) {
    // Note: would need pointer handling similar to previous animations
    // Skipping for brevity; user can change function to see different examples
  }

  render();

  return {
    destroy() {
      try {
        funcEl.removeEventListener('change', onFunc);
        viewEl.removeEventListener('change', onView);
        testEl.removeEventListener('change', onTest);
        if (currentFig) currentFig.remove();
      } catch (_) {}
      containerEl.innerHTML = '';
    }
  };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch6_epigraph_hypograph'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch6_epigraph_hypograph');
      }
    } catch (e) {
      console.error('Failed to register animation ch6_epigraph_hypograph', e);
    }
  })();

  // ch6_function_concavity_chord.js
  (function(){
    // Chapter 6: Concavity/Convexity — Chord vs Function (1D)
// Public API: init(containerEl, options) -> { destroy }
// Visual: Test f(λx+(1−λ)y) ≥/≤ λf(x)+(1−λ)f(y) for concave/convex functions

function init(containerEl, options = {}) {
  if (!containerEl) return { destroy() {} };

  const functions = {
    'ln': { fn: x => Math.log(x), domain: [0.1, 5], name: 'ln(x)', type: 'concave' },
    'sqrt': { fn: x => Math.sqrt(x), domain: [0.1, 5], name: '√x', type: 'concave' },
    'quad': { fn: x => x*x, domain: [-3, 3], name: 'x²', type: 'convex' },
    'cos': { fn: x => Math.cos(x), domain: [0, 2*Math.PI], name: 'cos(x)', type: 'neither' },
    'cubic': { fn: x => x*x*x, domain: [-2, 2], name: 'x³', type: 'neither' }
  };

  const state = {
    funcKey: 'ln',
    x: 0.8,
    y: 3.2,
    lambda: 0.5,
    showRegion: false
  };

  containerEl.innerHTML = `
    <div class="anim anim--plot" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <div class="anim__hint" style="flex:1 1 100%; color: var(--text-secondary); margin-bottom:0.25rem;">
          Concave: f(λx+(1−λ)y) ≥ λf(x)+(1−λ)f(y). Convex: f(λx+(1−λ)y) ≤ λf(x)+(1−λ)f(y). Drag points or adjust λ.
        </div>
        <label title="Function" style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:6ch; color: var(--text-secondary);">f(x):</span>
          <select data-role="func" style="padding:0.35rem; background: var(--bg-tertiary); color: var(--text-primary); border:1px solid var(--border-color); border-radius:0.4rem;" aria-label="Function">
            <option value="ln">ln(x) — concave</option>
            <option value="sqrt">√x — concave</option>
            <option value="quad">x² — convex</option>
            <option value="cos">cos(x) — neither</option>
            <option value="cubic">x³ — neither</option>
          </select>
        </label>
        <label title="Convex combination parameter" style="display:flex; align-items:center; gap:0.5rem; min-width:280px;">
          <span style="min-width:6ch; text-align:right; color: var(--text-secondary);">λ</span>
          <input data-role="lambda" type="range" min="0" max="1" step="0.01" value="0.5" aria-label="Lambda parameter">
          <input data-role="lambda-num" type="number" min="0" max="1" step="0.01" value="0.5" style="width:5rem; padding:0.25rem; background: var(--bg-tertiary); color: var(--text-primary); border:1px solid var(--border-color); border-radius:0.25rem;" aria-label="Lambda value">
        </label>
        <label style="display:inline-flex; gap:0.35rem; align-items:center;" title="Show epigraph/hypograph shading">
          <input data-role="region" type="checkbox" aria-label="Show epigraph/hypograph"/> Show region
        </label>
        <div role="status" aria-live="polite" data-role="live" style="color: var(--text-secondary); flex:1 1 100%;"></div>
      </div>
      <div class="anim__canvases" style="margin-top:0.6rem;">
        <canvas data-role="canvas" width="800" height="500" style="border:1px solid var(--border-color); border-radius:0.5rem; max-width:100%; cursor:crosshair;"></canvas>
        <div class="anim__legend" style="margin-top:0.35rem; display:flex; gap:1rem; flex-wrap:wrap; color: var(--text-secondary);">
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:20px; height:3px; background:#60a5fa;"></span>f(x)</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:20px; height:3px; background:#22c55e;"></span>Chord</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:14px; height:14px; border-radius:50%; background:#f59e0b;"></span>f(z) at z=λx+(1−λ)y</span>
        </div>
        <div class="anim__caption" style="margin-top:0.25rem; color: var(--text-secondary);">
          Concave functions lie above their chords; convex functions lie below. The inequality determines the relationship.
        </div>
      </div>
    </div>
  `;

  const canvas = containerEl.querySelector('[data-role=canvas]');
  const ctx = canvas.getContext('2d');
  const live = containerEl.querySelector('[data-role=live]');
  const funcEl = containerEl.querySelector('[data-role=func]');
  const lambdaEl = containerEl.querySelector('[data-role=lambda]');
  const lambdaNumEl = containerEl.querySelector('[data-role=lambda-num]');
  const regionEl = containerEl.querySelector('[data-role=region]');

  function getFunc() { return functions[state.funcKey]; }

  function worldToCanvas(x, y, domain, range) {
    const marginLeft = 60, marginRight = 40, marginTop = 40, marginBottom = 60;
    const w = canvas.width - marginLeft - marginRight;
    const h = canvas.height - marginTop - marginBottom;
    const px = marginLeft + ((x - domain[0]) / (domain[1] - domain[0])) * w;
    const py = marginTop + h - ((y - range[0]) / (range[1] - range[0])) * h;
    return [px, py];
  }

  function canvasToWorld(px, py, domain, range) {
    const marginLeft = 60, marginRight = 40, marginTop = 40, marginBottom = 60;
    const w = canvas.width - marginLeft - marginRight;
    const h = canvas.height - marginTop - marginBottom;
    const x = domain[0] + ((px - marginLeft) / w) * (domain[1] - domain[0]);
    const y = range[0] + ((marginTop + h - py) / h) * (range[1] - range[0]);
    return [x, y];
  }

  function render() {
    const func = getFunc();
    const domain = func.domain;
    
    // Compute range
    const samples = 200;
    let ymin = Infinity, ymax = -Infinity;
    for (let i = 0; i <= samples; i++) {
      const x = domain[0] + (i / samples) * (domain[1] - domain[0]);
      const y = func.fn(x);
      if (Number.isFinite(y)) {
        ymin = Math.min(ymin, y);
        ymax = Math.max(ymax, y);
      }
    }
    const range = [ymin - 0.1 * (ymax - ymin), ymax + 0.1 * (ymax - ymin)];

    // Ensure x < y
    if (state.x >= state.y) {
      const temp = state.x;
      state.x = state.y - 0.1;
      state.y = temp;
    }
    // Clamp to domain
    state.x = Math.max(domain[0], Math.min(domain[1] - 0.1, state.x));
    state.y = Math.max(state.x + 0.1, Math.min(domain[1], state.y));

    state.lambda = +lambdaEl.value;
    lambdaNumEl.value = state.lambda.toFixed(2);

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw axes and grid
    const marginLeft = 60, marginBottom = 60, marginTop = 40;
    ctx.strokeStyle = 'rgba(160,160,160,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 5; i++) {
      const x = domain[0] + (i / 5) * (domain[1] - domain[0]);
      const [px, py1] = worldToCanvas(x, range[0], domain, range);
      const [, py2] = worldToCanvas(x, range[1], domain, range);
      ctx.moveTo(px, py1);
      ctx.lineTo(px, py2);
    }
    for (let i = 0; i <= 5; i++) {
      const y = range[0] + (i / 5) * (range[1] - range[0]);
      const [px1, py] = worldToCanvas(domain[0], y, domain, range);
      const [px2] = worldToCanvas(domain[1], y, domain, range);
      ctx.moveTo(px1, py);
      ctx.lineTo(px2, py);
    }
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('x', canvas.width / 2, canvas.height - 20);
    ctx.save();
    ctx.translate(20, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('f(x)', 0, 0);
    ctx.restore();

    // Draw function
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    let started = false;
    for (let i = 0; i <= samples; i++) {
      const x = domain[0] + (i / samples) * (domain[1] - domain[0]);
      const y = func.fn(x);
      if (Number.isFinite(y)) {
        const [px, py] = worldToCanvas(x, y, domain, range);
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      }
    }
    ctx.stroke();

    // Epigraph/hypograph shading (if enabled)
    if (state.showRegion) {
      ctx.save();
      const isConvex = func.type === 'convex';
      const isConcave = func.type === 'concave';
      
      if (isConcave || isConvex) {
        ctx.fillStyle = isConcave ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)';
        ctx.beginPath();
        for (let i = 0; i <= samples; i++) {
          const x = domain[0] + (i / samples) * (domain[1] - domain[0]);
          const y = func.fn(x);
          const [px, py] = worldToCanvas(x, y, domain, range);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        // Close to top or bottom
        const [pxR, pyR] = worldToCanvas(domain[1], isConcave ? range[0] : range[1], domain, range);
        const [pxL, pyL] = worldToCanvas(domain[0], isConcave ? range[0] : range[1], domain, range);
        ctx.lineTo(pxR, pyR);
        ctx.lineTo(pxL, pyL);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // Compute points
    const fx = func.fn(state.x);
    const fy = func.fn(state.y);
    const z = state.lambda * state.x + (1 - state.lambda) * state.y;
    const fz = func.fn(z);
    const chordHeight = state.lambda * fx + (1 - state.lambda) * fy;

    // Draw chord
    const [pxX, pyX] = worldToCanvas(state.x, fx, domain, range);
    const [pxY, pyY] = worldToCanvas(state.y, fy, domain, range);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(pxX, pyX);
    ctx.lineTo(pxY, pyY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw points on function
    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(pxX, pyX, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(pxY, pyY, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Draw vertical line from z to f(z)
    const [pxZ, pyZ] = worldToCanvas(z, fz, domain, range);
    const [, pyChord] = worldToCanvas(z, chordHeight, domain, range);
    ctx.strokeStyle = 'rgba(245,158,11,0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(pxZ, pyZ);
    ctx.lineTo(pxZ, pyChord);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw f(z) point
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(pxZ, pyZ, 7, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Draw chord height point
    ctx.fillStyle = 'rgba(34,197,94,0.6)';
    ctx.beginPath();
    ctx.arc(pxZ, pyChord, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    // Labels
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2.5;
    ctx.strokeText(`f(z)`, pxZ + 10, pyZ - 10);
    ctx.fillText(`f(z)`, pxZ + 10, pyZ - 10);

    // Status with inequality check
    const diff = fz - chordHeight;
    let comparisonSymbol = '=';
    let verdict = '';
    const eps = 0.01;
    
    if (Math.abs(diff) < eps) {
      comparisonSymbol = '≈';
    } else if (diff > eps) {
      comparisonSymbol = '>';
      verdict = func.type === 'concave' ? ' ✓ Concave confirmed' : ' (not typical for ' + func.type + ')';
    } else {
      comparisonSymbol = '<';
      verdict = func.type === 'convex' ? ' ✓ Convex confirmed' : ' (not typical for ' + func.type + ')';
    }

    live.innerHTML = `f(${z.toFixed(2)}) = ${fz.toFixed(3)} ${comparisonSymbol} ${chordHeight.toFixed(3)} = λf(x) + (1−λ)f(y)${verdict}`;
  }

  // Event handlers
  const onFunc = () => { 
    state.funcKey = funcEl.value;
    const func = getFunc();
    state.x = func.domain[0] + 0.2 * (func.domain[1] - func.domain[0]);
    state.y = func.domain[0] + 0.8 * (func.domain[1] - func.domain[0]);
    render(); 
  };
  const onLambda = () => render();
  const onLambdaNum = () => { lambdaEl.value = lambdaNumEl.value; render(); };
  const onRegion = () => { state.showRegion = regionEl.checked; render(); };

  funcEl.addEventListener('change', onFunc);
  lambdaEl.addEventListener('input', onLambda);
  lambdaNumEl.addEventListener('input', onLambdaNum);
  regionEl.addEventListener('change', onRegion);

  // Mouse interaction to drag x and y
  let dragging = null;

  canvas.addEventListener('mousedown', (evt) => {
    const rect = canvas.getBoundingClientRect();
    const px = evt.clientX - rect.left;
    const py = evt.clientY - rect.top;
    
    const func = getFunc();
    const domain = func.domain;
    let ymin = Infinity, ymax = -Infinity;
    for (let i = 0; i <= 200; i++) {
      const x = domain[0] + (i / 200) * (domain[1] - domain[0]);
      const y = func.fn(x);
      if (Number.isFinite(y)) {
        ymin = Math.min(ymin, y);
        ymax = Math.max(ymax, y);
      }
    }
    const range = [ymin - 0.1 * (ymax - ymin), ymax + 0.1 * (ymax - ymin)];

    const [pxX] = worldToCanvas(state.x, func.fn(state.x), domain, range);
    const [pxY] = worldToCanvas(state.y, func.fn(state.y), domain, range);

    if (Math.abs(px - pxX) < 15) dragging = 'x';
    else if (Math.abs(px - pxY) < 15) dragging = 'y';
  });

  canvas.addEventListener('mousemove', (evt) => {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    const px = evt.clientX - rect.left;
    
    const func = getFunc();
    const domain = func.domain;
    let ymin = Infinity, ymax = -Infinity;
    for (let i = 0; i <= 200; i++) {
      const x = domain[0] + (i / 200) * (domain[1] - domain[0]);
      const y = func.fn(x);
      if (Number.isFinite(y)) {
        ymin = Math.min(ymin, y);
        ymax = Math.max(ymax, y);
      }
    }
    const range = [ymin - 0.1 * (ymax - ymin), ymax + 0.1 * (ymax - ymin)];

    const [x] = canvasToWorld(px, 0, domain, range);
    
    if (dragging === 'x') {
      state.x = Math.max(domain[0], Math.min(domain[1], x));
    } else if (dragging === 'y') {
      state.y = Math.max(domain[0], Math.min(domain[1], x));
    }
    render();
  });

  canvas.addEventListener('mouseup', () => { dragging = null; });
  canvas.addEventListener('mouseleave', () => { dragging = null; });

  render();

  return {
    destroy() {
      funcEl.removeEventListener('change', onFunc);
      lambdaEl.removeEventListener('input', onLambda);
      lambdaNumEl.removeEventListener('input', onLambdaNum);
      regionEl.removeEventListener('change', onRegion);
      containerEl.innerHTML = '';
    }
  };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch6_function_concavity_chord'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch6_function_concavity_chord');
      }
    } catch (e) {
      console.error('Failed to register animation ch6_function_concavity_chord', e);
    }
  })();

  // ch6_global_vs_local.js
  (function(){
    // Chapter 6: Global Guarantee — Concave vs Non-concave Counterexample
// Public API: init(containerEl, options) -> { destroy }
// Visual: Contrast concave (unique global max) with non-concave (multiple local maxima)

function init(containerEl, options = {}) {
  if (!containerEl) return { destroy() {} };

  const Plot = (window && window.Plot) ? window.Plot : null;
  const d3 = (window && window.d3) ? window.d3 : null;

  if (!Plot || !d3) {
    containerEl.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">Plot/D3 not loaded.</div>';
    return { destroy() { containerEl.innerHTML = ''; } };
  }

  function finiteOr(v, d) { const x = +v; return Number.isFinite(x) ? x : d; }

  const state = {
    surfaceType: 'concave',
    c: finiteOr(options.c, 1.5),
    a: finiteOr(options.a, 1.0),
    sigma: finiteOr(options.sigma, 0.4),
    showRuns: false,
    runData: [],
    autoRun: false
  };

  containerEl.innerHTML = `
    <div class="anim anim--plot" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <div class="anim__hint" style="flex:1 1 100%; color: var(--text-secondary); margin-bottom:0.25rem;">
          <strong>Key insight:</strong> Concave → ONE global max (green dot). Non-concave → multiple peaks! Click "Run gradient ascent" to launch 8 climbers (gray dots). Watch where each orange path ends: green=global max, red=trapped at inferior local max.
        </div>
        <label title="Surface type" style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:7ch; color: var(--text-secondary);">Surface:</span>
          <select data-role="type" style="padding:0.35rem; background: var(--bg-tertiary); color: var(--text-primary); border:1px solid var(--border-color); border-radius:0.4rem;" aria-label="Surface type">
            <option value="concave">Concave: −x²−y²</option>
            <option value="nonconcave">Non-concave: −x²−y² + bump</option>
          </select>
        </label>
        <label title="Bump height (non-concave only)" style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:3ch; color: var(--text-secondary);">c:</span>
          <input data-role="c" type="range" min="0" max="2" step="0.1" value="${state.c}" style="width:100px;" aria-label="Bump height c">
          <span data-role="c-val" style="min-width:4ch; text-align:right; color: var(--text-secondary);">${state.c.toFixed(1)}</span>
        </label>
        <label title="Bump position" style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:3ch; color: var(--text-secondary);">a:</span>
          <input data-role="a" type="range" min="-1" max="1" step="0.1" value="${state.a}" style="width:100px;" aria-label="Bump position a">
          <span data-role="a-val" style="min-width:4ch; text-align:right; color: var(--text-secondary);">${state.a.toFixed(1)}</span>
        </label>
        <label title="Bump width" style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:3ch; color: var(--text-secondary);">σ:</span>
          <input data-role="sigma" type="range" min="0.2" max="1" step="0.1" value="${state.sigma}" style="width:100px;" aria-label="Bump width sigma">
          <span data-role="sigma-val" style="min-width:4ch; text-align:right; color: var(--text-secondary);">${state.sigma.toFixed(1)}</span>
        </label>
        <button type="button" data-role="run" style="padding:0.35rem 0.75rem; border:1px solid var(--border-color); border-radius:0.4rem; background: var(--bg-tertiary); color: var(--text-primary); font-weight:500;">Run gradient ascent (n=8)</button>
        <label style="display:inline-flex; gap:0.35rem; align-items:center;" title="Auto-run on parameter change">
          <input data-role="autorun" type="checkbox" aria-label="Auto-run"/> Auto-run
        </label>
        <div role="status" aria-live="polite" data-role="live" style="color: var(--text-secondary); flex:1 1 100%;"></div>
      </div>
      <div class="anim__canvases" style="margin-top:0.6rem;">
        <div class="anim__canvas" data-role="plot"></div>
        <div class="anim__legend" style="margin-top:0.35rem; display:flex; gap:1rem; flex-wrap:wrap; color: var(--text-secondary);">
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:18px; height:3px; background:#60a5fa;"></span>Contour lines</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:14px; height:14px; border-radius:50%; background:#22c55e;"></span>Global maximum</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:14px; height:14px; border-radius:50%; background:#ef4444;"></span>Local maximum (trap)</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:18px; height:2px; background:rgba(245,158,11,0.5);"></span>Gradient paths</span>
        </div>
        <div class="anim__caption" style="margin-top:0.25rem; color: var(--text-secondary);">
          <strong>Why concavity matters:</strong> With concave f, any FOC solution is THE global max. Without concavity, gradient methods get stuck at inferior local maxima.
        </div>
      </div>
    </div>
  `;

  const mount = containerEl.querySelector('[data-role=plot]');
  const live = containerEl.querySelector('[data-role=live]');
  const typeEl = containerEl.querySelector('[data-role=type]');
  const cEl = containerEl.querySelector('[data-role=c]');
  const aEl = containerEl.querySelector('[data-role=a]');
  const sigmaEl = containerEl.querySelector('[data-role=sigma]');
  const cVal = containerEl.querySelector('[data-role=c-val]');
  const aVal = containerEl.querySelector('[data-role=a-val]');
  const sigmaVal = containerEl.querySelector('[data-role=sigma-val]');
  const runBtn = containerEl.querySelector('[data-role=run]');

  let currentFig = null;

  function objective(x, y, type) {
    const base = -x*x - y*y;
    if (type === 'concave') return base;
    
    // Non-concave: add Gaussian bump
    const dx = x - state.a;
    const dy = y - state.a;
    const bump = state.c * Math.exp(-(dx*dx + dy*dy) / (state.sigma * state.sigma));
    return base + bump;
  }

  function gradient(x, y, type) {
    const dx = -2 * x;
    const dy = -2 * y;
    
    if (type === 'concave') return { dx, dy };
    
    // Add bump gradient
    const bx = x - state.a;
    const by = y - state.a;
    const expTerm = Math.exp(-(bx*bx + by*by) / (state.sigma * state.sigma));
    const gx = dx + state.c * expTerm * (-2 * bx / (state.sigma * state.sigma));
    const gy = dy + state.c * expTerm * (-2 * by / (state.sigma * state.sigma));
    
    return { dx: gx, dy: gy };
  }

  function gradientAscent(x0, y0, steps = 100) {
    let x = x0, y = y0;
    const path = [{ x, y }];
    const stepSize = 0.08;
    
    for (let i = 0; i < steps; i++) {
      const g = gradient(x, y, state.surfaceType);
      const mag = Math.hypot(g.dx, g.dy);
      if (mag < 0.005) break; // Tighter convergence
      
      x += stepSize * g.dx;
      y += stepSize * g.dy;
      path.push({ x, y });
      
      // Bounds
      if (Math.abs(x) > 3 || Math.abs(y) > 3) break;
    }
    
    return path;
  }

  function findStationary() {
    // Analytically for concave: (0, 0)
    if (state.surfaceType === 'concave') {
      return [{ x: 0, y: 0, type: 'global', value: 0 }];
    }
    
    // For non-concave, compare origin vs bump peak
    const points = [];
    const originVal = objective(0, 0, state.surfaceType);
    
    // Find local max near bump center via gradient ascent
    let x = state.a, y = state.a;
    for (let iter = 0; iter < 50; iter++) {
      const g = gradient(x, y, state.surfaceType);
      if (Math.hypot(g.dx, g.dy) < 0.001) break;
      x += 0.05 * g.dx;
      y += 0.05 * g.dy;
    }
    
    const bumpVal = objective(x, y, state.surfaceType);
    const g = gradient(x, y, state.surfaceType);
    
    // Bump is a valid local max if gradient is near zero and not too close to origin
    const isBumpMax = Math.hypot(g.dx, g.dy) < 0.02 && Math.hypot(x, y) > 0.3;
    
    if (bumpVal > originVal && isBumpMax) {
      // Bump is global
      points.push({ x, y, type: 'global', value: bumpVal });
      points.push({ x: 0, y: 0, type: 'local', value: originVal });
    } else if (isBumpMax && bumpVal > originVal * 0.5) {
      // Bump is inferior local max
      points.push({ x: 0, y: 0, type: 'global', value: originVal });
      points.push({ x, y, type: 'local', value: bumpVal });
    } else {
      // Only origin
      points.push({ x: 0, y: 0, type: 'global', value: originVal });
    }
    
    return points;
  }

  function render() {
    state.c = +cEl.value;
    state.a = +aEl.value;
    state.sigma = +sigmaEl.value;
    state.surfaceType = typeEl.value;
    cVal.textContent = state.c.toFixed(1);
    aVal.textContent = state.a.toFixed(1);
    sigmaVal.textContent = state.sigma.toFixed(1);

    // Build contours
    const bounds = 2.5;
    const nx = 60, ny = 60;
    const xs = d3.range(nx).map(i => -bounds + (i / (nx - 1)) * 2 * bounds);
    const ys = d3.range(ny).map(j => -bounds + (j / (ny - 1)) * 2 * bounds);
    const values = new Float64Array(nx * ny);
    
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        values[j * nx + i] = objective(xs[i], ys[j], state.surfaceType);
      }
    }

    const vmin = d3.min(values);
    const vmax = d3.max(values);
    const levels = d3.range(10).map(i => vmin + (i / 9) * (vmax - vmin));

    const contours = d3.contours()
      .size([nx, ny])
      .smooth(true)
      .thresholds(levels)(values);

    const contourData = [];
    for (const c of contours) {
      for (const poly of c.coordinates) {
        for (const ring of poly) {
          const pts = ring.map(([ix, iy]) => {
            const x = xs[Math.max(0, Math.min(nx - 1, Math.floor(ix)))];
            const y = ys[Math.max(0, Math.min(ny - 1, Math.floor(iy)))];
            return { x, y };
          });
          contourData.push(pts);
        }
      }
    }

    const marks = [
      ...contourData.map(pts => Plot.line(pts, { 
        x: 'x', y: 'y', stroke: '#60a5fa', opacity: 0.4, strokeWidth: 1.2 
      }))
    ];

    // Stationary points
    const stationary = findStationary();
    for (const pt of stationary) {
      marks.push(
        Plot.dot([pt], {
          x: 'x', y: 'y', 
          r: pt.type === 'global' ? 7 : 5, 
          fill: pt.type === 'global' ? '#22c55e' : '#ef4444', 
          stroke: '#fff', 
          strokeWidth: 1.5
        })
      );
    }

    // Run paths with clearer visualization
    for (let i = 0; i < state.runData.length; i++) {
      const path = state.runData[i];
      const startPt = path[0];
      const endPt = path[path.length - 1];
      
      // Determine which max it converged to
      let endColor = '#f59e0b';
      for (const stat of stationary) {
        if (Math.hypot(endPt.x - stat.x, endPt.y - stat.y) < 0.2) {
          endColor = stat.type === 'global' ? '#22c55e' : '#ef4444';
          break;
        }
      }
      
      marks.push(
        // Starting point (hollow circle)
        Plot.dot([startPt], {
          x: 'x', y: 'y', r: 4, fill: 'none', stroke: '#9ca3af', strokeWidth: 1.5
        }),
        // Path
        Plot.line(path, { 
          x: 'x', y: 'y', stroke: 'rgba(245,158,11,0.6)', strokeWidth: 1.5 
        }),
        // End point (colored by which max)
        Plot.dot([endPt], {
          x: 'x', y: 'y', r: 4, fill: endColor, stroke: '#fff', strokeWidth: 1
        })
      );
    }

    const width = Math.min(800, Math.max(480, (mount?.clientWidth || 640)));
    const height = Math.round(width * 0.75);

    const fig = Plot.plot({
      width,
      height,
      marginLeft: 54,
      marginBottom: 50,
      x: { label: 'x', domain: [-bounds, bounds], grid: true },
      y: { label: 'y', domain: [-bounds, bounds], grid: true },
      style: { background: 'transparent', color: 'var(--text-secondary)' },
      marks
    });

    if (currentFig) { try { currentFig.remove(); } catch (_) {} }
    if (mount) {
      mount.innerHTML = '';
      mount.appendChild(fig);
      currentFig = fig;
    }

    // Status
    if (state.surfaceType === 'concave') {
      live.textContent = `✓ Concave surface: Any gradient ascent converges to THE unique global maximum (origin).`;
    } else {
      live.textContent = `⚠ Non-concave surface: ${stationary.length} stationary point${stationary.length > 1 ? 's' : ''} found. Gradient ascent may get trapped at local max!`;
    }
  }

  // Event handlers
  const onChange = () => render();
  const onRun = () => {
    state.runData = [];
    
    // Use a grid of starting points for reproducibility
    const gridSize = 4; // 4x2 = 8 points
    const spacing = 3.5 / (gridSize + 1);
    
    for (let i = 1; i <= gridSize; i++) {
      for (let j = 1; j <= 2; j++) {
        const x0 = -1.75 + i * spacing;
        const y0 = -0.9 + j * spacing;
        const path = gradientAscent(x0, y0);
        state.runData.push(path);
      }
    }
    render();
  };

  const autoRunEl = containerEl.querySelector('[data-role=autorun]');
  
  const onParamChange = () => {
    render();
    if (state.autoRun && state.runData.length > 0) {
      onRun(); // Re-run if auto-run enabled
    }
  };
  
  typeEl.addEventListener('change', () => {
    state.runData = []; // Clear paths on surface change
    onChange();
  });
  cEl.addEventListener('input', onParamChange);
  aEl.addEventListener('input', onParamChange);
  sigmaEl.addEventListener('input', onParamChange);
  runBtn.addEventListener('click', onRun);
  autoRunEl.addEventListener('change', () => { state.autoRun = autoRunEl.checked; });

  render();

  return {
    destroy() {
      try {
        typeEl.removeEventListener('change', onChange);
        cEl.removeEventListener('input', onParamChange);
        aEl.removeEventListener('input', onParamChange);
        sigmaEl.removeEventListener('input', onParamChange);
        runBtn.removeEventListener('click', onRun);
        if (currentFig) currentFig.remove();
      } catch (_) {}
      containerEl.innerHTML = '';
    }
  };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch6_global_vs_local'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch6_global_vs_local');
      }
    } catch (e) {
      console.error('Failed to register animation ch6_global_vs_local', e);
    }
  })();

  // ch6_hessian_taylor_classifier.js
  (function(){
    // Chapter 6: Hessian Classification via Taylor Quadratic (2D)
// Public API: init(containerEl, options) -> { destroy }
// Visual: Contour plot of f(x,y) = ax²+2bxy+cy² with Hessian classification

function init(containerEl, options = {}) {
  if (!containerEl) return { destroy() {} };

  const Plot = (window && window.Plot) ? window.Plot : null;
  const d3 = (window && window.d3) ? window.d3 : null;

  if (!Plot || !d3) {
    containerEl.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">Plot/D3 not loaded.</div>';
    return { destroy() { containerEl.innerHTML = ''; } };
  }

  function finiteOr(v, d) { const x = +v; return Number.isFinite(x) ? x : d; }

  const state = {
    a: finiteOr(options.a, -1.0),
    b: finiteOr(options.b, 0.3),
    c: finiteOr(options.c, -0.7),
    epsilon: finiteOr(options.epsilon, 0),
    showEigen: true,
    showQuadratic: false
  };

  containerEl.innerHTML = `
    <div class="anim anim--plot" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <div class="anim__hint" style="flex:1 1 100%; color: var(--text-secondary); margin-bottom:0.25rem;">
          f(x,y) = ax² + 2bxy + cy² (+ perturbation). Hessian H = [[2a, 2b], [2b, 2c]]. Classification from eigenvalues.
        </div>
        <label title="Coefficient a" style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:3ch; color: var(--text-secondary);">a:</span>
          <input data-role="a" type="range" min="-3" max="3" step="0.1" value="${state.a}" style="width:120px;" aria-label="Coefficient a">
          <input data-role="a-num" type="number" step="0.1" value="${state.a}" style="width:4.5rem; padding:0.25rem; background: var(--bg-tertiary); color: var(--text-primary); border:1px solid var(--border-color); border-radius:0.25rem;" aria-label="a value">
        </label>
        <label title="Coefficient b (off-diagonal/2)" style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:3ch; color: var(--text-secondary);">b:</span>
          <input data-role="b" type="range" min="-2" max="2" step="0.1" value="${state.b}" style="width:120px;" aria-label="Coefficient b">
          <input data-role="b-num" type="number" step="0.1" value="${state.b}" style="width:4.5rem; padding:0.25rem; background: var(--bg-tertiary); color: var(--text-primary); border:1px solid var(--border-color); border-radius:0.25rem;" aria-label="b value">
        </label>
        <label title="Coefficient c" style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:3ch; color: var(--text-secondary);">c:</span>
          <input data-role="c" type="range" min="-3" max="3" step="0.1" value="${state.c}" style="width:120px;" aria-label="Coefficient c">
          <input data-role="c-num" type="number" step="0.1" value="${state.c}" style="width:4.5rem; padding:0.25rem; background: var(--bg-tertiary); color: var(--text-primary); border:1px solid var(--border-color); border-radius:0.25rem;" aria-label="c value">
        </label>
        <label style="display:inline-flex; gap:0.35rem; align-items:center;" title="Show eigenvector directions">
          <input data-role="eigen" type="checkbox" ${state.showEigen ? 'checked' : ''} aria-label="Show eigenvectors"/> Eigenvectors
        </label>
        <label style="display:inline-flex; gap:0.35rem; align-items:center;" title="Overlay quadratic approximation contours">
          <input data-role="quad" type="checkbox" ${state.showQuadratic ? 'checked' : ''} aria-label="Quadratic overlay"/> Quadratic overlay
        </label>
        <div role="status" aria-live="polite" data-role="live" style="color: var(--text-secondary); flex:1 1 100%;"></div>
      </div>
      <div class="anim__canvases" style="margin-top:0.6rem;">
        <div class="anim__canvas" data-role="plot"></div>
        <div class="anim__legend" style="margin-top:0.35rem; display:flex; gap:1rem; flex-wrap:wrap; color: var(--text-secondary);">
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:18px; height:3px; background:#60a5fa;"></span>Contours f(x,y)</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:18px; height:3px; background:#22c55e;"></span>Eigenvector v₁</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:18px; height:3px; background:#a3e635;"></span>Eigenvector v₂</span>
        </div>
        <div class="anim__caption" style="margin-top:0.25rem; color: var(--text-secondary);">
          At stationary point (origin), Hessian eigenvalues determine local behavior: both negative → max, both positive → min, opposite signs → saddle.
        </div>
      </div>
    </div>
  `;

  const mount = containerEl.querySelector('[data-role=plot]');
  const live = containerEl.querySelector('[data-role=live]');
  const aEl = containerEl.querySelector('input[data-role=a]');
  const bEl = containerEl.querySelector('input[data-role=b]');
  const cEl = containerEl.querySelector('input[data-role=c]');
  const aNumEl = containerEl.querySelector('input[data-role=a-num]');
  const bNumEl = containerEl.querySelector('input[data-role=b-num]');
  const cNumEl = containerEl.querySelector('input[data-role=c-num]');
  const eigenEl = containerEl.querySelector('input[data-role=eigen]');
  const quadEl = containerEl.querySelector('input[data-role=quad]');

  let currentFig = null;

  function eigen2x2(a, b, c) {
    // Hessian is [[2a, 2b], [2b, 2c]]
    const H11 = 2*a, H12 = 2*b, H22 = 2*c;
    const tr = H11 + H22;
    const det = H11 * H22 - H12 * H12;
    const disc = Math.max(0, tr*tr - 4*det);
    const s = Math.sqrt(disc);
    const lambda1 = (tr + s) / 2;
    const lambda2 = (tr - s) / 2;

    function eigenvec(lambda) {
      const A11 = H11 - lambda, A12 = H12, A22 = H22 - lambda;
      let v;
      if (Math.abs(A12) > 1e-9) {
        v = [-A11 / A12, 1];
      } else if (Math.abs(A11) > 1e-9) {
        v = [1, 0];
      } else if (Math.abs(A22) > 1e-9) {
        v = [1, -(A12 / A22)];
      } else {
        v = [0, 1];
      }
      const norm = Math.hypot(v[0], v[1]) || 1;
      return [v[0] / norm, v[1] / norm];
    }

    return {
      values: [lambda1, lambda2],
      vecs: [eigenvec(lambda1), eigenvec(lambda2)]
    };
  }

  function classify(l1, l2) {
    const eps = 1e-9;
    const pos = (x) => x > eps;
    const neg = (x) => x < -eps;
    const zero = (x) => Math.abs(x) <= eps;

    if (pos(l1) && pos(l2)) return 'Positive definite (Min)';
    if (neg(l1) && neg(l2)) return 'Negative definite (Max)';
    if ((pos(l1) && zero(l2)) || (pos(l2) && zero(l1))) return 'Positive semidefinite';
    if ((neg(l1) && zero(l2)) || (neg(l2) && zero(l1))) return 'Negative semidefinite';
    if ((pos(l1) && neg(l2)) || (neg(l1) && pos(l2))) return 'Indefinite (Saddle)';
    return 'Degenerate';
  }

  function render() {
    const a = +aEl.value;
    const b = +bEl.value;
    const c = +cEl.value;
    aNumEl.value = a.toFixed(1);
    bNumEl.value = b.toFixed(1);
    cNumEl.value = c.toFixed(1);

    state.a = a;
    state.b = b;
    state.c = c;

    const { values: [lambda1, lambda2], vecs: [v1, v2] } = eigen2x2(a, b, c);
    const cls = classify(lambda1, lambda2);

    // Build contour data
    const bounds = 3;
    const nx = 60, ny = 60;
    const xs = d3.range(nx).map(i => -bounds + (i / (nx - 1)) * 2 * bounds);
    const ys = d3.range(ny).map(j => -bounds + (j / (ny - 1)) * 2 * bounds);
    const values = new Float64Array(nx * ny);

    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const x = xs[i];
        const y = ys[j];
        const fVal = a * x * x + 2 * b * x * y + c * y * y + state.epsilon * 0.1 * (x*x*x - y*y*y);
        values[j * nx + i] = fVal;
      }
    }

    // Determine contour levels
    const vmin = d3.min(values);
    const vmax = d3.max(values);
    const vabs = Math.max(Math.abs(vmin), Math.abs(vmax));
    
    let levels;
    if (Math.abs(vmin) < 0.01 && Math.abs(vmax) < 0.01) {
      // Nearly flat
      levels = [-0.01, -0.005, 0, 0.005, 0.01];
    } else if (vmin < -0.1 && vmax > 0.1) {
      // Saddle-like
      levels = [-vabs*0.8, -vabs*0.5, -vabs*0.2, 0, vabs*0.2, vabs*0.5, vabs*0.8];
    } else if (vmax > 0.1) {
      // Min-like
      levels = d3.range(6).map(i => (i / 5) * vmax);
    } else {
      // Max-like
      levels = d3.range(6).map(i => (i / 5) * vmin);
    }

    const contours = d3.contours()
      .size([nx, ny])
      .smooth(true)
      .thresholds(levels)(values);

    const contourData = [];
    for (const c of contours) {
      const z = c.value;
      for (const poly of c.coordinates) {
        for (const ring of poly) {
          const pts = ring.map(([ix, iy]) => {
            const x = xs[Math.max(0, Math.min(nx - 1, Math.floor(ix)))];
            const y = ys[Math.max(0, Math.min(ny - 1, Math.floor(iy)))];
            return { x, y, z };
          });
          contourData.push({ pts, z });
        }
      }
    }

    const marks = [
      // Contours
      ...contourData.map(({ pts, z }) => 
        Plot.line(pts, { 
          x: 'x', 
          y: 'y', 
          stroke: z >= 0 ? '#60a5fa' : '#ef4444', 
          opacity: 0.6, 
          strokeWidth: 1.5 
        })
      ),
      // Origin
      Plot.dot([{ x: 0, y: 0 }], { 
        x: 'x', 
        y: 'y', 
        r: 5, 
        fill: '#f59e0b', 
        stroke: '#fff', 
        strokeWidth: 1.5 
      })
    ];

    // Eigenvectors
    if (state.showEigen) {
      const R = bounds * 0.85;
      marks.push(
        Plot.line([{ x: -v1[0]*R, y: -v1[1]*R }, { x: v1[0]*R, y: v1[1]*R }], {
          x: 'x', y: 'y', stroke: '#22c55e', strokeWidth: 2.5, opacity: 0.8
        }),
        Plot.line([{ x: -v2[0]*R, y: -v2[1]*R }, { x: v2[0]*R, y: v2[1]*R }], {
          x: 'x', y: 'y', stroke: '#a3e635', strokeWidth: 2.5, opacity: 0.8
        })
      );
    }

    const width = Math.min(800, Math.max(480, (mount?.clientWidth || 640)));
    const height = Math.round(width * 0.75);

    const fig = Plot.plot({
      width,
      height,
      marginLeft: 54,
      marginBottom: 50,
      x: { label: 'x', domain: [-bounds, bounds], grid: true },
      y: { label: 'y', domain: [-bounds, bounds], grid: true },
      style: { background: 'transparent', color: 'var(--text-secondary)' },
      marks
    });

    if (currentFig) { try { currentFig.remove(); } catch (_) {} }
    if (mount) {
      mount.innerHTML = '';
      mount.appendChild(fig);
      currentFig = fig;
    }

    // Status
    live.innerHTML = `
      H = [[${(2*a).toFixed(1)}, ${(2*b).toFixed(1)}], [${(2*b).toFixed(1)}, ${(2*c).toFixed(1)}]] &nbsp;|&nbsp;
      λ₁ = ${lambda1.toFixed(3)}, λ₂ = ${lambda2.toFixed(3)} &nbsp;|&nbsp;
      <strong>${cls}</strong>
    `;
  }

  // Event handlers
  const onA = () => { aNumEl.value = aEl.value; render(); };
  const onB = () => { bNumEl.value = bEl.value; render(); };
  const onC = () => { cNumEl.value = cEl.value; render(); };
  const onANum = () => { aEl.value = aNumEl.value; render(); };
  const onBNum = () => { bEl.value = bNumEl.value; render(); };
  const onCNum = () => { cEl.value = cNumEl.value; render(); };
  const onEigen = () => { state.showEigen = eigenEl.checked; render(); };
  const onQuad = () => { state.showQuadratic = quadEl.checked; render(); };

  aEl.addEventListener('input', onA);
  bEl.addEventListener('input', onB);
  cEl.addEventListener('input', onC);
  aNumEl.addEventListener('input', onANum);
  bNumEl.addEventListener('input', onBNum);
  cNumEl.addEventListener('input', onCNum);
  eigenEl.addEventListener('change', onEigen);
  quadEl.addEventListener('change', onQuad);

  render();

  return {
    destroy() {
      try {
        aEl.removeEventListener('input', onA);
        bEl.removeEventListener('input', onB);
        cEl.removeEventListener('input', onC);
        aNumEl.removeEventListener('input', onANum);
        bNumEl.removeEventListener('input', onBNum);
        cNumEl.removeEventListener('input', onCNum);
        eigenEl.removeEventListener('change', onEigen);
        quadEl.removeEventListener('change', onQuad);
        if (currentFig) currentFig.remove();
      } catch (_) {}
      containerEl.innerHTML = '';
    }
  };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch6_hessian_taylor_classifier'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch6_hessian_taylor_classifier');
      }
    } catch (e) {
      console.error('Failed to register animation ch6_hessian_taylor_classifier', e);
    }
  })();

  // ch6_profit_unconstrained.js
  (function(){
    // Chapter 6: Profit Maximization — FOC, SOC, and Decreasing Returns
// Public API: init(containerEl, options) -> { destroy }
// Visual: π(K,L) = p K^α L^β − rK − wL with gradient field, FOC solution, Hessian classification

function init(containerEl, options = {}) {
  if (!containerEl) return { destroy() {} };

  const Plot = (window && window.Plot) ? window.Plot : null;
  const d3 = (window && window.d3) ? window.d3 : null;

  if (!Plot || !d3) {
    containerEl.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">Plot/D3 not loaded.</div>';
    return { destroy() { containerEl.innerHTML = ''; } };
  }

  function finiteOr(v, d) { const x = +v; return Number.isFinite(x) ? x : d; }

  const state = {
    p: finiteOr(options.p, 10),
    r: finiteOr(options.r, 2),
    w: finiteOr(options.w, 3),
    alpha: finiteOr(options.alpha, 0.3),
    beta: finiteOr(options.beta, 0.6),
    K: 100,
    L: 100,
    showGradField: false,
    showHessian: false,
    kstar: null,
    lstar: null
  };

  containerEl.innerHTML = `
    <div class="anim anim--plot" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <div class="anim__hint" style="flex:1 1 100%; color: var(--text-secondary); margin-bottom:0.25rem;">
          <strong>FOC in action:</strong> π(K,L) = p K^α L^β − rK − wL. Green arrows show ∇π (gradient). Watch them vanish at the optimal point (orange) where <strong>∇π=0</strong>. Solution auto-updates as you adjust parameters.
        </div>
        <label title="Output price" style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:3ch; color: var(--text-secondary);">p:</span>
          <input data-role="p" type="range" min="1" max="20" step="0.5" value="${state.p}" style="width:100px;" aria-label="Price p">
          <span data-role="p-val" style="min-width:4ch; text-align:right; color: var(--text-secondary);">${state.p}</span>
        </label>
        <label title="Capital cost" style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:3ch; color: var(--text-secondary);">r:</span>
          <input data-role="r" type="range" min="0.5" max="10" step="0.5" value="${state.r}" style="width:100px;" aria-label="Cost r">
          <span data-role="r-val" style="min-width:4ch; text-align:right; color: var(--text-secondary);">${state.r}</span>
        </label>
        <label title="Labor cost" style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:3ch; color: var(--text-secondary);">w:</span>
          <input data-role="w" type="range" min="0.5" max="10" step="0.5" value="${state.w}" style="width:100px;" aria-label="Wage w">
          <span data-role="w-val" style="min-width:4ch; text-align:right; color: var(--text-secondary);">${state.w}</span>
        </label>
        <label title="Capital exponent" style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:3ch; color: var(--text-secondary);">α:</span>
          <input data-role="alpha" type="range" min="0.05" max="0.95" step="0.05" value="${state.alpha}" style="width:100px;" aria-label="Alpha">
          <span data-role="alpha-val" style="min-width:4ch; text-align:right; color: var(--text-secondary);">${state.alpha.toFixed(2)}</span>
        </label>
        <label title="Labor exponent" style="display:flex; align-items:center; gap:0.5rem;">
          <span style="min-width:3ch; color: var(--text-secondary);">β:</span>
          <input data-role="beta" type="range" min="0.05" max="0.95" step="0.05" value="${state.beta}" style="width:100px;" aria-label="Beta">
          <span data-role="beta-val" style="min-width:4ch; text-align:right; color: var(--text-secondary);">${state.beta.toFixed(2)}</span>
        </label>
        <button type="button" data-role="solve" style="padding:0.35rem 0.75rem; border:1px solid var(--border-color); border-radius:0.4rem; background: var(--bg-tertiary); color: var(--text-primary); font-weight:500;">Re-solve FOC</button>
        <label style="display:inline-flex; gap:0.35rem; align-items:center;" title="Toggle gradient field visibility (always shows near solution)">
          <input data-role="gradfield" type="checkbox" aria-label="Show gradient field"/> More ∇π arrows
        </label>
        <label style="display:inline-flex; gap:0.35rem; align-items:center;" title="Show Hessian eigenvalue classification at (K*,L*)">
          <input data-role="hessian" type="checkbox" aria-label="Show Hessian"/> Show Hessian
        </label>
        <div role="status" aria-live="polite" data-role="live" style="color: var(--text-secondary); flex:1 1 100%;"></div>
      </div>
      <div class="anim__canvases" style="margin-top:0.6rem;">
        <div class="anim__canvas" data-role="plot"></div>
        <div class="anim__legend" style="margin-top:0.35rem; display:flex; gap:1rem; flex-wrap:wrap; color: var(--text-secondary);">
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:18px; height:3px; background:#60a5fa;"></span>Profit contours</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:14px; height:14px; border-radius:50%; background:#f59e0b;"></span>Optimal point (∇π=0)</span>
          <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:20px; height:2px; background:#22c55e;"></span>→ Gradient vectors ∇π</span>
        </div>
        <div class="anim__caption" style="margin-top:0.25rem; color: var(--text-secondary);">
          <strong>Observe:</strong> Green arrows point "uphill" toward higher profit. At the optimal point (orange), the gradient <strong>vanishes</strong> (∇π=0) — no direction increases profit. This is the FOC.
        </div>
      </div>
    </div>
  `;

  const mount = containerEl.querySelector('[data-role=plot]');
  const live = containerEl.querySelector('[data-role=live]');
  const pEl = containerEl.querySelector('[data-role=p]');
  const rEl = containerEl.querySelector('[data-role=r]');
  const wEl = containerEl.querySelector('[data-role=w]');
  const alphaEl = containerEl.querySelector('[data-role=alpha]');
  const betaEl = containerEl.querySelector('[data-role=beta]');
  const pVal = containerEl.querySelector('[data-role=p-val]');
  const rVal = containerEl.querySelector('[data-role=r-val]');
  const wVal = containerEl.querySelector('[data-role=w-val]');
  const alphaVal = containerEl.querySelector('[data-role=alpha-val]');
  const betaVal = containerEl.querySelector('[data-role=beta-val]');
  const solveBtn = containerEl.querySelector('[data-role=solve]');
  const gradFieldEl = containerEl.querySelector('[data-role=gradfield]');
  const hessianEl = containerEl.querySelector('[data-role=hessian]');

  let currentFig = null;

  function profit(K, L) {
    K = Math.max(1e-9, K); L = Math.max(1e-9, L);
    return state.p * Math.pow(K, state.alpha) * Math.pow(L, state.beta) - state.r * K - state.w * L;
  }

  function grad(K, L) {
    K = Math.max(1e-9, K); L = Math.max(1e-9, L);
    const dK = state.p * state.alpha * Math.pow(K, state.alpha - 1) * Math.pow(L, state.beta) - state.r;
    const dL = state.p * state.beta * Math.pow(K, state.alpha) * Math.pow(L, state.beta - 1) - state.w;
    return { dK, dL };
  }

  function hessian(K, L) {
    K = Math.max(1e-9, K); L = Math.max(1e-9, L);
    const a = state.alpha, b = state.beta, p = state.p;
    const H11 = p * a * (a - 1) * Math.pow(K, a - 2) * Math.pow(L, b);
    const H22 = p * b * (b - 1) * Math.pow(K, a) * Math.pow(L, b - 2);
    const H12 = p * a * b * Math.pow(K, a - 1) * Math.pow(L, b - 1);
    return { H11, H12, H22 };
  }

  function eigenvalues(H11, H12, H22) {
    const tr = H11 + H22;
    const det = H11 * H22 - H12 * H12;
    const disc = Math.max(0, tr * tr - 4 * det);
    const s = Math.sqrt(disc);
    return [(tr + s) / 2, (tr - s) / 2];
  }

  function solveFOC() {
    const a = state.alpha, b = state.beta, p = state.p, r = state.r, w = state.w;
    
    // Check if solution exists (need p > 0, a > 0, b > 0)
    if (p <= 0 || a <= 0 || b <= 0 || r < 0 || w < 0) {
      state.kstar = null;
      state.lstar = null;
      return;
    }
    
    // For Cobb-Douglas with interior solution, use analytical approach
    // FOC gives: p*a*K^(a-1)*L^b = r  and  p*b*K^a*L^(b-1) = w
    // Taking ratio: (a/b) * (L/K) = r/w  =>  L = (b*r)/(a*w) * K
    // Substitute back into first FOC to get K*, then L*
    
    // From ratio: L/K = (b*r)/(a*w)
    const ratio = (b * r) / (a * w);
    
    // Substitute into first FOC: p*a*K^(a-1)*[ratio*K]^b = r
    // => p*a*K^(a-1)*ratio^b*K^b = r
    // => K^(a+b-1) = r / (p*a*ratio^b)
    const exponent = a + b - 1;
    
    if (Math.abs(exponent) < 0.01) {
      // Near constant returns - use Newton-Raphson as fallback
      let K = 100, L = 100;
      for (let iter = 0; iter < 50; iter++) {
        const g = grad(K, L);
        const H = hessian(K, L);
        const det = H.H11 * H.H22 - H.H12 * H.H12;
        if (Math.abs(det) < 1e-12) break;
        
        const dK = (H.H22 * g.dK - H.H12 * g.dL) / det;
        const dL = (-H.H12 * g.dK + H.H11 * g.dL) / det;
        
        K -= 0.5 * dK;  // Damped Newton step
        L -= 0.5 * dL;
        
        K = Math.max(0.1, Math.min(K, 1000));
        L = Math.max(0.1, Math.min(L, 1000));
        
        if (Math.abs(dK) + Math.abs(dL) < 1e-6) break;
      }
      
      const gFinal = grad(K, L);
      if (Math.abs(gFinal.dK) < 1 && Math.abs(gFinal.dL) < 1) {
        state.kstar = K;
        state.lstar = L;
      } else {
        state.kstar = null;
        state.lstar = null;
      }
      return;
    }
    
    // Analytical solution for DRS or IRS
    const rightSide = r / (p * a * Math.pow(ratio, b));
    const K = Math.pow(rightSide, 1 / exponent);
    const L = ratio * K;
    
    // Verify solution is reasonable
    if (isFinite(K) && isFinite(L) && K > 0 && L > 0 && K < 10000 && L < 10000) {
      const gCheck = grad(K, L);
      if (Math.abs(gCheck.dK) < 1 && Math.abs(gCheck.dL) < 1) {
        state.kstar = K;
        state.lstar = L;
      } else {
        state.kstar = null;
        state.lstar = null;
      }
    } else {
      state.kstar = null;
      state.lstar = null;
    }
  }

  function render() {
    state.p = +pEl.value;
    state.r = +rEl.value;
    state.w = +wEl.value;
    state.alpha = +alphaEl.value;
    state.beta = +betaEl.value;
    pVal.textContent = state.p.toFixed(1);
    rVal.textContent = state.r.toFixed(1);
    wVal.textContent = state.w.toFixed(1);
    alphaVal.textContent = state.alpha.toFixed(2);
    betaVal.textContent = state.beta.toFixed(2);

    // Dynamic domain: center on solution if found, else use default
    let Kmax = 600, Lmax = 600;
    let Kmin = 0, Lmin = 0;
    
    if (state.kstar && state.lstar && state.kstar > 0 && state.lstar > 0) {
      // Center the plot on the solution with some padding
      const padding = 1.5;
      Kmax = Math.max(100, state.kstar * padding);
      Lmax = Math.max(100, state.lstar * padding);
      Kmin = 0;
      Lmin = 0;
    }
    
    // Build contours
    const nx = 60, ny = 60;
    const Ks = d3.range(nx).map(i => (i / (nx - 1)) * Kmax);
    const Ls = d3.range(ny).map(j => (j / (ny - 1)) * Lmax);
    const values = new Float64Array(nx * ny);
    
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        values[j * nx + i] = profit(Ks[i], Ls[j]);
      }
    }

    const vmin = d3.min(values);
    const vmax = d3.max(values);
    const levels = vmin < 0 && vmax > 0 
      ? d3.range(8).map(i => vmin + (i / 7) * (vmax - vmin))
      : d3.range(8).map(i => (i / 7) * vmax * 0.9);

    const contours = d3.contours()
      .size([nx, ny])
      .smooth(true)
      .thresholds(levels)(values);

    const contourData = [];
    for (const c of contours) {
      for (const poly of c.coordinates) {
        for (const ring of poly) {
          const pts = ring.map(([ix, iy]) => {
            const K = Ks[Math.max(0, Math.min(nx - 1, Math.floor(ix)))];
            const L = Ls[Math.max(0, Math.min(ny - 1, Math.floor(iy)))];
            return { K, L };
          });
          contourData.push(pts);
        }
      }
    }

    const marks = [
      ...contourData.map(pts => Plot.line(pts, { 
        x: 'K', y: 'L', stroke: '#60a5fa', opacity: 0.5, strokeWidth: 1.2 
      }))
    ];

    // Gradient field (always show near solution to illustrate FOC)
    if (state.showGradField || (state.kstar && state.lstar)) {
      const gridK = 8, gridL = 8;
      const arrows = [];
      for (let i = 1; i < gridK; i++) {
        for (let j = 1; j < gridL; j++) {
          const K = (i / gridK) * Kmax;
          const L = (j / gridL) * Lmax;
          const g = grad(K, L);
          const mag = Math.hypot(g.dK, g.dL);
          if (mag > 0.01) {
            const scale = Math.min(40, 8 * Math.log(1 + mag));
            arrows.push([
              { K, L },
              { K: K + g.dK / mag * scale, L: L + g.dL / mag * scale }
            ]);
          }
        }
      }
      marks.push(...arrows.map(pts => Plot.line(pts, { 
        x: 'K', y: 'L', stroke: '#22c55e', opacity: 0.5, strokeWidth: 1.5 
      })));
      
      // Add arrowheads to make gradient direction clearer
      marks.push(...arrows.map(pts => {
        const p0 = pts[0], p1 = pts[1];
        const dx = p1.K - p0.K, dy = p1.L - p0.L;
        const len = Math.hypot(dx, dy);
        if (len < 0.1) return null;
        const ux = dx / len, uy = dy / len;
        const arrowSize = len * 0.3;
        return Plot.line([
          { K: p1.K, L: p1.L },
          { K: p1.K - arrowSize * ux - arrowSize * 0.3 * uy, L: p1.L - arrowSize * uy + arrowSize * 0.3 * ux },
          { K: p1.K, L: p1.L },
          { K: p1.K - arrowSize * ux + arrowSize * 0.3 * uy, L: p1.L - arrowSize * uy - arrowSize * 0.3 * ux }
        ], { x: 'K', y: 'L', stroke: '#22c55e', opacity: 0.5, strokeWidth: 1.5 });
      }).filter(m => m));
    }

    // Stationary point with visual emphasis
    if (state.kstar && state.lstar) {
      // Large outer ring to emphasize solution
      marks.push(
        Plot.dot([{ K: state.kstar, L: state.lstar }], {
          x: 'K', y: 'L', r: 12, fill: 'none', stroke: '#f59e0b', strokeWidth: 2, opacity: 0.4
        }),
        Plot.dot([{ K: state.kstar, L: state.lstar }], {
          x: 'K', y: 'L', r: 8, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2
        }),
        Plot.text([{ K: state.kstar, L: state.lstar, label: '∇π=0' }], {
          x: 'K', y: 'L', text: 'label', dy: -18, fontSize: 12, fill: '#f59e0b', fontWeight: 'bold'
        }),
        Plot.text([{ K: state.kstar, L: state.lstar, label: `(${state.kstar.toFixed(0)}, ${state.lstar.toFixed(0)})` }], {
          x: 'K', y: 'L', text: 'label', dy: 18, fontSize: 10, fill: 'var(--text-secondary)'
        })
      );
      
      // Show that gradient magnitude is near zero at solution
      const gAtStar = grad(state.kstar, state.lstar);
      const magAtStar = Math.hypot(gAtStar.dK, gAtStar.dL);
      if (magAtStar < 0.1) {
        // Add a small "zero vector" indicator
        marks.push(
          Plot.dot([{ K: state.kstar, L: state.lstar }], {
            x: 'K', y: 'L', r: 3, fill: '#22c55e', stroke: '#fff', strokeWidth: 1
          })
        );
      }
    }

    const width = Math.min(800, Math.max(480, (mount?.clientWidth || 640)));
    const height = Math.round(width * 0.68);

    const fig = Plot.plot({
      width,
      height,
      marginLeft: 54,
      marginBottom: 50,
      x: { label: 'K', domain: [0, Kmax], grid: true },
      y: { label: 'L', domain: [0, Lmax], grid: true },
      style: { background: 'transparent', color: 'var(--text-secondary)' },
      marks
    });

    if (currentFig) { try { currentFig.remove(); } catch (_) {} }
    if (mount) {
      mount.innerHTML = '';
      mount.appendChild(fig);
      currentFig = fig;
    }

    // Status
    const drs = state.alpha + state.beta < 1;
    let status = `α+β = ${(state.alpha + state.beta).toFixed(2)} ${drs ? '<1 (Decreasing returns ✓)' : '≥1 (Not DRS)'}`;
    
    if (state.kstar && state.lstar) {
      status += ` | (K*,L*) = (${state.kstar.toFixed(1)}, ${state.lstar.toFixed(1)})`;
      status += `, π* = ${profit(state.kstar, state.lstar).toFixed(2)}`;
      
      if (state.showHessian) {
        const H = hessian(state.kstar, state.lstar);
        const [l1, l2] = eigenvalues(H.H11, H.H12, H.H22);
        const cls = (l1 < 0 && l2 < 0) ? 'Neg. def. (Max)' : 
                    (l1 > 0 && l2 > 0) ? 'Pos. def. (Min)' : 'Indefinite';
        status += ` | Hessian: λ=(${l1.toFixed(4)}, ${l2.toFixed(4)}) → ${cls}`;
      }
    }
    
    live.textContent = status;
  }

  // Event handlers - auto-solve on parameter change for better UX
  const onParamChange = () => { 
    solveFOC(); 
    render(); 
  };
  const onSolve = () => { solveFOC(); render(); };

  pEl.addEventListener('input', onParamChange);
  rEl.addEventListener('input', onParamChange);
  wEl.addEventListener('input', onParamChange);
  alphaEl.addEventListener('input', onParamChange);
  betaEl.addEventListener('input', onParamChange);
  solveBtn.addEventListener('click', onSolve);
  gradFieldEl.addEventListener('change', () => { state.showGradField = gradFieldEl.checked; render(); });
  hessianEl.addEventListener('change', () => { state.showHessian = hessianEl.checked; render(); });

  // Initial solve
  solveFOC();
  render();

  return {
    destroy() {
      try {
        pEl.removeEventListener('input', onChange);
        rEl.removeEventListener('input', onChange);
        wEl.removeEventListener('input', onChange);
        alphaEl.removeEventListener('input', onChange);
        betaEl.removeEventListener('input', onChange);
        solveBtn.removeEventListener('click', onSolve);
        if (currentFig) currentFig.remove();
      } catch (_) {}
      containerEl.innerHTML = '';
    }
  };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch6_profit_unconstrained'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch6_profit_unconstrained');
      }
    } catch (e) {
      console.error('Failed to register animation ch6_profit_unconstrained', e);
    }
  })();

  // ch6_unconstrained_foc_plot.js
  (function(){
    // Chapter 6: Unconstrained Optimization — FOC Illustration (Observable Plot)
// Public API: init(containerEl, options) -> { destroy }
// Visual: Single panel with profit contours for π(K,L), current point, gradient ∇π, and stationary point (K*,L*).
// Libraries: Observable Plot (window.Plot) and d3 (window.d3) loaded via CDN in presentation/index.html.

function init(containerEl, options = {}) {
  if (!containerEl) return { destroy() {} };

  // Parameters from the running example
  const p = 10, r = 2, w = 3;
  const alpha = 0.3, beta = 0.6; // F(K,L) = K^0.3 L^0.6

  // Known stationary point from slides
  const KSTAR = 324;
  const LSTAR = 432;

  // State
  const state = {
    K: Number.isFinite(+options.initialK) ? +options.initialK : KSTAR,
    L: Number.isFinite(+options.initialL) ? +options.initialL : LSTAR,
    kmax: Number.isFinite(+options.kmax) ? +options.kmax : 800,
    lmax: Number.isFinite(+options.lmax) ? +options.lmax : 800
  };

  // UI
  containerEl.innerHTML = `
    <div class="anim anim--plot" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; gap:1rem; align-items:center; flex-wrap:wrap; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <label title="Capital K" style="display:flex; align-items:center; gap:0.5rem; min-width:260px;">
          <span style="min-width:8ch; text-align:right; color: var(--text-secondary);">K</span>
          <input data-role="K" type="range" min="1" max="${state.kmax}" step="1" value="${Math.max(1, Math.min(state.kmax, state.K))}" aria-label="Capital K">
          <span data-role="K-val" style="min-width:6ch; text-align:right; color: var(--text-secondary);">${Math.round(state.K)}</span>
        </label>
        <label title="Labor L" style="display:flex; align-items:center; gap:0.5rem; min-width:260px;">
          <span style="min-width:8ch; text-align:right; color: var(--text-secondary);">L</span>
          <input data-role="L" type="range" min="1" max="${state.lmax}" step="1" value="${Math.max(1, Math.min(state.lmax, state.L))}" aria-label="Labor L">
          <span data-role="L-val" style="min-width:6ch; text-align:right; color: var(--text-secondary);">${Math.round(state.L)}</span>
        </label>
        <button type="button" data-role="snap" style="padding:0.35rem 0.6rem; border:1px solid var(--border-color); border-radius:0.4rem; background: var(--bg-tertiary); color: var(--text-primary);">Snap to (K*,L*)</button>
        <div role="status" aria-live="polite" data-role="live" style="color: var(--text-secondary);"></div>
      </div>
      <div class="anim__canvases" style="margin-top:0.6rem; display:flex; gap:1rem; flex-wrap:wrap;">
        <div style="flex:1 1 520px; min-width:360px;">
          <div class="anim__title" style="font-weight:600; color: var(--text-secondary); margin-bottom:0.25rem;">Profit contours π(K,L) with ∇π and stationary point</div>
          <div class="anim__canvas" data-role="plot"></div>
          <div class="anim__caption" style="margin-top:0.35rem; color: var(--text-secondary);">
            Contours of π(K,L) = 10 K^{0.3} L^{0.6} − 2K − 3L (cool), current point (black dot) with gradient (blue dashed), stationary point (✦) at (324,432).
          </div>
          <div class="anim__legend" style="margin-top:0.35rem; display:flex; gap:1rem; flex-wrap:wrap; color: var(--text-secondary);">
            <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:18px; height:3px; background:linear-gradient(90deg,#60a5fa,#22c55e);"></span>π contours</span>
            <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:18px; height:3px; background:repeating-linear-gradient(90deg,#0B6FFF 0,#0B6FFF 6px,transparent 6px,transparent 12px);"></span>∇π</span>
            <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:14px; height:14px; border-radius:2px; background:#f59e0b;"></span>Stationary point ✦</span>
          </div>
        </div>
      </div>
    </div>
  `;

  const Plot = (window && window.Plot) ? window.Plot : null;
  const d3 = (window && window.d3) ? window.d3 : null;
  const mount = containerEl.querySelector('[data-role=plot]');
  const live = containerEl.querySelector('[data-role=live]');
  const kEl = containerEl.querySelector('input[data-role=K]');
  const lEl = containerEl.querySelector('input[data-role=L]');
  const kVal = containerEl.querySelector('[data-role=K-val]');
  const lVal = containerEl.querySelector('[data-role=L-val]');
  const snapBtn = containerEl.querySelector('[data-role=snap]');
  const zoomEl = containerEl.querySelector('input[data-role=zoom]');

  if (!Plot || !d3) {
    if (mount) mount.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">Plot/D3 not loaded. Ensure Observable Plot and D3 are included.</div>';
    return { destroy() { containerEl.innerHTML = ''; } };
  }

  // Profit and gradient
  function profit(K, L) {
    K = Math.max(1e-9, K); L = Math.max(1e-9, L);
    return p * Math.pow(K, alpha) * Math.pow(L, beta) - r * K - w * L;
  }
  function grad(K, L) {
    K = Math.max(1e-9, K); L = Math.max(1e-9, L);
    const dK = p * alpha * Math.pow(K, alpha - 1) * Math.pow(L, beta) - r;
    const dL = p * beta * Math.pow(K, alpha) * Math.pow(L, beta - 1) - w;
    return { dK, dL };
  }

  // Build a contour dataset over [0, kmax] x [0, lmax]
  function buildContours(kmax, lmax) {
    const nx = 80, ny = 80;
    const xs = d3.range(nx).map(i => (i / (nx - 1)) * kmax);
    const ys = d3.range(ny).map(j => (j / (ny - 1)) * lmax);
    const values = new Float64Array(nx * ny);
    let vmin = Infinity, vmax = -Infinity;
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const K = xs[i];
        const L = ys[j];
        const v = profit(K, L);
        values[j * nx + i] = v;
        if (v < vmin) vmin = v;
        if (v > vmax) vmax = v;
      }
    }
    // Choose ~12 thresholds from a small positive up to near max for visibility
    const tmin = Math.max(0, vmin);
    const tmax = vmax;
    const levels = d3.range(12).map(i => tmin + (i / 11) * (tmax - tmin));
    return { xs, ys, values, nx, ny, levels };
  }

  let currentFig = null;
  let cache = null;

  function render() {
    const K = +kEl.value;
    const L = +lEl.value;
    if (kVal) kVal.textContent = String(Math.round(K));
    if (lVal) lVal.textContent = String(Math.round(L));

    // Build contours once per size
    if (!cache) {
      cache = buildContours(state.kmax, state.lmax);
    }

    const { xs, ys, values, nx, ny, levels } = cache;

    // Prepare contour polygons using d3-contours
    const contours = d3.contours()
      .size([nx, ny])
      .smooth(true)
      .thresholds(levels)(values);

    // Map grid coordinates to (K,L)
    const polys = [];
    for (const c of contours) {
      const z = c.value;
      for (const poly of c.coordinates) {
        // poly may be MultiPolygon; flatten rings
        for (const ring of poly) {
          const pts = ring.map(([ix, iy]) => {
            const x = xs[Math.max(0, Math.min(nx - 1, ix)) | 0];
            const y = ys[Math.max(0, Math.min(ny - 1, iy)) | 0];
            return { K: x, L: y };
          });
          polys.push({ pts, z });
        }
      }
    }

    // Gradient vector at (K,L). Scale length with magnitude, clamp to reasonable range.
    const g = grad(K, L);
    const gnorm = Math.hypot(g.dK, g.dL) || 1;
    // Map gradient magnitude to vector display length (domain-specific tuning)
    // Typical |∇π| around optimum is small; away from optimum larger. Use nonlinear scaling.
    let len = 20 * Math.log10(1 + 10 * gnorm); // grows sublinearly
    len = Math.max(10, Math.min(len, Math.min(state.kmax, state.lmax) * 0.15));
    const gradSeg = [
      { K, L },
      { K: K + (g.dK / gnorm) * len, L: L + (g.dL / gnorm) * len }
    ];

    const width = Math.min(800, Math.max(480, (mount?.clientWidth || 640)));
    const height = Math.round(width * 0.68);

    // Axes domains (optionally zoomed near optimum)
    let xDomain = [0, state.kmax];
    let yDomain = [0, state.lmax];
    if (state.zoom) {
      const winK = Math.max(60, state.kmax * 0.25); // window half-width in K
      const winL = Math.max(80, state.lmax * 0.25); // window half-height in L
      xDomain = [Math.max(0, KSTAR - winK), Math.min(state.kmax, KSTAR + winK)];
      yDomain = [Math.max(0, LSTAR - winL), Math.min(state.lmax, LSTAR + winL)];
    }

    const fig = Plot.plot({
      width,
      height,
      marginLeft: 54,
      marginBottom: 50,
      x: { label: 'K', domain: xDomain, grid: true },
      y: { label: 'L', domain: yDomain, grid: true },
      style: { background: 'transparent', color: 'var(--text-secondary)' },
      marks: [
        // Profit contours
        ...polys.map(({ pts, z }) => Plot.line(pts, { x: 'K', y: 'L', stroke: '#60a5fa', opacity: 0.3, strokeWidth: 1 })),
        // Current point (hollow to avoid covering tiny gradient) and gradient
        Plot.dot([{ K, L }], { x: 'K', y: 'L', r: 5, fill: 'white', stroke: '#1f2937', strokeWidth: 1.8 }),
        Plot.line(gradSeg, { x: 'K', y: 'L', stroke: '#0B6FFF', strokeWidth: 2, strokeDasharray: '4 2', opacity: 0.95 }),
        // Near-zero gradient indicator (target) when |∇π| is tiny
        ...(gnorm < 0.02 ? [
          Plot.dot([{ K, L }], { x: 'K', y: 'L', r: 8, fill: 'none', stroke: '#0B6FFF', strokeWidth: 1.2, opacity: 0.8 }),
          Plot.dot([{ K, L }], { x: 'K', y: 'L', r: 12, fill: 'none', stroke: '#0B6FFF', strokeWidth: 0.8, opacity: 0.5 })
        ] : []),
        // Stationary point
        Plot.dot([{ K: KSTAR, L: LSTAR }], { x: 'K', y: 'L', r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 1.2, symbol: 'square' }),
        Plot.text([{ K: KSTAR, L: LSTAR, label: ' ' }], { x: 'K', y: 'L', text: 'label', dy: -10, fontSize: 12, fill: 'var(--text-secondary)' })
      ]
    });

    if (currentFig) { try { currentFig.remove(); } catch (_) {} }
    if (mount) {
      mount.innerHTML = '';
      mount.appendChild(fig);
      currentFig = fig;
    }

    if (live) {
      const pi = profit(K, L);
      live.textContent = `K=${K.toFixed(0)}, L=${L.toFixed(0)}; π=${pi.toFixed(1)}; ∇π=(${g.dK.toFixed(3)}, ${g.dL.toFixed(3)})`;
    }
  }

  function onResize() { render(); }
  const ro = (window && 'ResizeObserver' in window) ? new ResizeObserver(render) : null;
  if (ro && mount) ro.observe(mount);

  const onK = () => { state.K = +kEl.value; render(); };
  const onL = () => { state.L = +lEl.value; render(); };
  const onSnap = () => {
    try { kEl.value = String(KSTAR); lEl.value = String(LSTAR); } catch (_) {}
    state.K = KSTAR; state.L = LSTAR; render();
  };
  kEl.addEventListener('input', onK);
  lEl.addEventListener('input', onL);
  if (snapBtn) snapBtn.addEventListener('click', onSnap);
  const onZoom = () => { state.zoom = !!zoomEl.checked; render(); };
  if (zoomEl) zoomEl.addEventListener('change', onZoom);

  // Pointer interaction: click/drag to set (K,L)
  let dragging = false;
  function applyPointer(evt) {
    if (!currentFig) return;
    const svg = currentFig; // Observable Plot returns an SVG element
    const rect = svg.getBoundingClientRect();
    const width = svg.viewBox && svg.viewBox.baseVal ? svg.viewBox.baseVal.width : svg.width.baseVal.value;
    const height = svg.viewBox && svg.viewBox.baseVal ? svg.viewBox.baseVal.height : svg.height.baseVal.value;
    // Margins as specified in Plot.plot
    const marginLeft = 54;
    const marginBottom = 50;
    const marginTop = 30; // Observable Plot default top margin (approx)
    const marginRight = 30; // default right margin (approx)
    const innerW = Math.max(1, width - marginLeft - marginRight);
    const innerH = Math.max(1, height - marginTop - marginBottom);

    // Mouse coordinates relative to SVG
    const px = ((evt.clientX - rect.left) / rect.width) * width;
    const py = ((evt.clientY - rect.top) / rect.height) * height;

    // Convert to data coords, clamp to domain
    let K = (px - marginLeft) / innerW * state.kmax;
    let L = (height - marginBottom - py) / innerH * state.lmax; // invert y
    if (!Number.isFinite(K) || !Number.isFinite(L)) return;
    K = Math.max(0, Math.min(state.kmax, K));
    L = Math.max(0, Math.min(state.lmax, L));

    // Update state and slider positions
    state.K = K; state.L = L;
    try { kEl.value = String(Math.round(K)); lEl.value = String(Math.round(L)); } catch (_) {}
    render();
  }

  function onPointerDown(evt) { dragging = true; applyPointer(evt); evt.preventDefault(); }
  function onPointerMove(evt) { if (dragging) { applyPointer(evt); evt.preventDefault(); } }
  function onPointerUp() { dragging = false; }

  // Attach to mount (delegated to the SVG after first render)
  mount.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  // Initial render
  render();

  return {
    destroy() {
      try {
        kEl.removeEventListener('input', onK);
        lEl.removeEventListener('input', onL);
        if (snapBtn) snapBtn.removeEventListener('click', onSnap);
        if (zoomEl) zoomEl.removeEventListener('change', onZoom);
        if (ro) ro.disconnect();
        mount.removeEventListener('mousedown', onPointerDown);
        window.removeEventListener('mousemove', onPointerMove);
        window.removeEventListener('mouseup', onPointerUp);
      } catch (_) {}
      if (mount) mount.innerHTML = '';
      containerEl.innerHTML = '';
    }
  };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch6_unconstrained_foc_plot'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch6_unconstrained_foc_plot');
      }
    } catch (e) {
      console.error('Failed to register animation ch6_unconstrained_foc_plot', e);
    }
  })();

  // ch7_active_set.js
  (function(){
    // Chapter 7: Active-Set Viewer (Multiple Inequalities)
// Public API: export function init(container, options)

function init(container, options = {}) {
    const state = {
      c1: options.c1 || 100, // Budget: 2x + 3y ≤ c1
      c2: options.c2 || 60,  // Capacity: x + y ≤ c2
      showNormals: options.showNormals !== false,
      showActiveSet: options.showActiveSet !== false,
      width: 600,
      height: 500
    };

    const controls = document.createElement('div');
    controls.className = 'animation-controls';
    controls.innerHTML = `
      <label>Budget limit c₁: <input type="range" id="c1-slider" min="50" max="150" value="${state.c1}" step="5"></label>
      <span id="c1-value">${state.c1}</span><br>
      <label>Capacity limit c₂: <input type="range" id="c2-slider" min="30" max="80" value="${state.c2}" step="5"></label>
      <span id="c2-value">${state.c2}</span><br>
      <label><input type="checkbox" id="show-normals" ${state.showNormals ? 'checked' : ''}> Show constraint normals</label>
      <label><input type="checkbox" id="show-activeset" ${state.showActiveSet ? 'checked' : ''}> Show active set</label>
    `;

    const canvas = document.createElement('div');
    canvas.id = 'activeset-plot';

    container.appendChild(controls);
    container.appendChild(canvas);

    const render = () => {
      const { c1, c2 } = state;
      
      // Objective: maximize U(x,y) = x^0.5 * y^0.5
      // Constraints: 
      //   g1: 2x + 3y ≤ c1
      //   g2: x + y ≤ c2
      //   x ≥ 0, y ≥ 0

      // Find feasible region vertices
      const vertices = [
        { x: 0, y: 0, name: 'Origin' },
        { x: c1/2, y: 0, name: 'x-axis budget' },
        { x: 0, y: c1/3, name: 'y-axis budget' },
        { x: c2, y: 0, name: 'x-axis capacity' },
        { x: 0, y: c2, name: 'y-axis capacity' }
      ];

      // Intersection of g1 and g2
      // 2x + 3y = c1 and x + y = c2 => x = 3c2 - c1, y = c1 - 2c2
      const xInt = 3*c2 - c1;
      const yInt = c1 - 2*c2;
      if (xInt > 0 && yInt > 0) {
        vertices.push({ x: xInt, y: yInt, name: 'g1∩g2' });
      }

      // Solve optimization: check all vertices and find best
      let optimal = null;
      let maxU = -Infinity;
      
      for (const v of vertices) {
        // Check feasibility with tolerance
        const g1 = 2*v.x + 3*v.y;
        const g2 = v.x + v.y;
        const feasible = v.x >= -0.01 && v.y >= -0.01 && 
                        g1 <= c1 + 0.01 && 
                        g2 <= c2 + 0.01;
        
        if (feasible) {
          const U = (v.x > 0 && v.y > 0) ? Math.sqrt(v.x * v.y) : 0;
          if (U > maxU) {
            maxU = U;
            
            // Determine active set
            const activeSet = [];
            if (Math.abs(g1 - c1) < 0.5) activeSet.push('g₁');
            if (Math.abs(g2 - c2) < 0.5) activeSet.push('g₂');
            if (v.x < 0.5) activeSet.push('x≥0');
            if (v.y < 0.5) activeSet.push('y≥0');
            
            optimal = { x: Math.max(0, v.x), y: Math.max(0, v.y), U, activeSet, name: v.name };
          }
        }
      }
      
      // Fallback if no feasible vertex found (shouldn't happen but safety)
      if (!optimal) {
        optimal = { x: 0, y: 0, U: 0, activeSet: ['x≥0', 'y≥0'], name: 'origin' };
      }

      // Generate constraint lines
      const g1Line = Array.from({ length: 100 }, (_, i) => {
        const x = (i / 99) * Math.max(c1/2, c2);
        const y = (c1 - 2*x) / 3;
        return { x, y, constraint: 'g1' };
      }).filter(p => p.y >= 0);

      const g2Line = Array.from({ length: 100 }, (_, i) => {
        const x = (i / 99) * c2;
        const y = c2 - x;
        return { x, y, constraint: 'g2' };
      });

      // Utility contours
      const contours = [];
      if (optimal.U > 0.01) {
        for (let factor of [0.3, 0.6, 0.9, 1.0]) {
          const level = factor * optimal.U;
          if (level > 0.01) {
            const contour = Array.from({ length: 100 }, (_, i) => {
              const x = 0.5 + (i / 99) * Math.max(c1/2, c2);
              const y = (level * level) / x;
              return { x, y };
            }).filter(p => p.y >= 0 && p.y <= Math.max(c1/3, c2));
            if (contour.length > 0) {
              contours.push(contour);
            }
          }
        }
      } else {
        // If optimum is at (0,0) or very low, show some default contours
        for (let level of [1, 2, 3, 5]) {
          const contour = Array.from({ length: 100 }, (_, i) => {
            const x = 0.5 + (i / 99) * Math.max(c1/2, c2);
            const y = (level * level) / x;
            return { x, y };
          }).filter(p => p.y >= 0 && p.y <= Math.max(c1/3, c2));
          if (contour.length > 0) {
            contours.push(contour);
          }
        }
      }

      const marks = [
        // Constraint lines
        Plot.line(g1Line, { x: "x", y: "y", stroke: "blue", strokeWidth: 2 }),
        Plot.line(g2Line, { x: "x", y: "y", stroke: "purple", strokeWidth: 2 }),
        // Utility contours
        ...contours.map((c, i) => 
          Plot.line(c, { x: "x", y: "y", stroke: "green", strokeWidth: 1, opacity: 0.5 })
        ),
        // Optimum
        Plot.dot([optimal], { x: "x", y: "y", r: 8, fill: "red" }),
        Plot.text([optimal], { 
          x: "x", 
          y: "y", 
          text: () => `★ (${optimal.x.toFixed(1)}, ${optimal.y.toFixed(1)})`,
          dy: -15,
          fontWeight: 'bold'
        }),
        // Labels
        Plot.text([{ x: c1/4, y: 2 }], { x: "x", y: "y", text: "2x+3y≤c₁", fill: "blue", fontSize: 11 }),
        Plot.text([{ x: c2-5, y: 8 }], { x: "x", y: "y", text: "x+y≤c₂", fill: "purple", fontSize: 11 })
      ];

      // Normals
      if (state.showNormals && optimal.x > 0 && optimal.y > 0) {
        const scale = 8;
        marks.push(
          Plot.arrow([{ x1: optimal.x, y1: optimal.y, x2: optimal.x + 2*scale, y2: optimal.y + 3*scale }], {
            x1: "x1", y1: "y1", x2: "x2", y2: "y2",
            stroke: "blue", strokeWidth: 2
          }),
          Plot.arrow([{ x1: optimal.x, y1: optimal.y, x2: optimal.x + 1*scale, y2: optimal.y + 1*scale }], {
            x1: "x1", y1: "y1", x2: "x2", y2: "y2",
            stroke: "purple", strokeWidth: 2
          })
        );
      }

      const plot = Plot.plot({
        width: state.width,
        height: state.height,
        marginLeft: 60,
        x: { domain: [0, Math.max(c1/2, c2) * 1.1], label: "x" },
        y: { domain: [0, Math.max(c1/3, c2) * 1.1], label: "y" },
        marks
      });

      const info = document.createElement('div');
      info.style.marginTop = '10px';
      info.style.padding = '10px';
      info.style.background = '#f5f5f5';
      info.style.borderRadius = '4px';
      
      if (state.showActiveSet) {
        info.innerHTML = `
          <strong>Active Set at Optimum:</strong> {${optimal.activeSet.join(', ')}}<br>
          <strong>Stationarity:</strong> ∇f = ${optimal.activeSet.length > 0 ? 'Σ λⱼ∇gⱼ for active j' : '0'}<br>
          Only gradients of <strong>active</strong> constraints enter the FOC.
        `;
      } else {
        info.innerHTML = `<strong>Optimum:</strong> (${optimal.x.toFixed(2)}, ${optimal.y.toFixed(2)}), U = ${optimal.U.toFixed(3)}`;
      }

      canvas.innerHTML = '';
      canvas.appendChild(plot);
      canvas.appendChild(info);
    };

    controls.querySelector('#c1-slider').addEventListener('input', (e) => {
      state.c1 = parseFloat(e.target.value);
      controls.querySelector('#c1-value').textContent = state.c1;
      render();
    });

    controls.querySelector('#c2-slider').addEventListener('input', (e) => {
      state.c2 = parseFloat(e.target.value);
      controls.querySelector('#c2-value').textContent = state.c2;
      render();
    });

    controls.querySelector('#show-normals').addEventListener('change', (e) => {
      state.showNormals = e.target.checked;
      render();
    });

    controls.querySelector('#show-activeset').addEventListener('change', (e) => {
      state.showActiveSet = e.target.checked;
      render();
    });

    render();
    return state;
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch7_active_set'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch7_active_set');
      }
    } catch (e) {
      console.error('Failed to register animation ch7_active_set', e);
    }
  })();

  // ch7_bliss_point.js
  (function(){
    // Chapter 7: Bliss Point vs Monotone Preferences
// Public API: export function init(container, options)

function init(container, options = {}) {
    const state = {
      income: options.income || 100,
      preferenceType: options.preferenceType || 'monotone',
      showLambda: options.showLambda !== false,
      width: 600,
      height: 500
    };

    const controls = document.createElement('div');
    controls.className = 'animation-controls';
    controls.innerHTML = `
      <label>Income I: <input type="range" id="income-slider" min="40" max="150" value="${state.income}" step="5"></label>
      <span id="income-value">${state.income}</span><br>
      <div style="margin: 10px 0;">
        <button id="btn-monotone" style="padding: 5px 10px; margin-right: 10px;">Monotone U(x,y)=√(xy)</button>
        <button id="btn-bliss" style="padding: 5px 10px;">Bliss U(x,y)=-[(x-10)²+(y-10)²]</button>
      </div>
      <label><input type="checkbox" id="show-lambda" ${state.showLambda ? 'checked' : ''}> Show λ value</label>
    `;

    const canvas = document.createElement('div');
    canvas.id = 'bliss-plot';

    container.appendChild(controls);
    container.appendChild(canvas);

    const render = () => {
      const I = state.income;
      const prices = [2, 3];
      const xMax = I / prices[0];
      const yMax = I / prices[1];
      
      let optimal;
      
      if (state.preferenceType === 'monotone') {
        // Monotone: always binding, solution x = I/4, y = I/6
        const x = I / 4;
        const y = I / 6;
        const U = Math.sqrt(x * y);
        const lambda = 0.5 * Math.sqrt(y/x) / prices[0];
        optimal = { x, y, U, lambda, type: 'boundary' };
      } else {
        // Bliss point at (10, 10)
        const blissX = 10, blissY = 10;
        const spent = prices[0] * blissX + prices[1] * blissY; // = 50
        
        if (spent <= I) {
          // Bliss point is feasible - interior solution
          optimal = { 
            x: blissX, 
            y: blissY, 
            U: 0, // max value is 0
            lambda: 0, 
            type: 'interior'
          };
        } else {
          // Budget binds, constrained optimum on boundary
          // For simplicity, use the monotone solution scaled
          const x = I / 4;
          const y = I / 6;
          const U = -((x - blissX)**2 + (y - blissY)**2);
          optimal = { x, y, U, lambda: 0.05, type: 'boundary' };
        }
      }

      // Budget line
      const budgetLine = Array.from({ length: 100 }, (_, i) => {
        const x = (i / 99) * xMax;
        const y = (I - prices[0] * x) / prices[1];
        return { x, y };
      });

      // Utility contours
      const contours = [];
      if (state.preferenceType === 'monotone') {
        for (let factor of [0.4, 0.7, 1.0]) {
          const level = factor * optimal.U;
          if (level > 0) {
            const contour = Array.from({ length: 100 }, (_, i) => {
              const x = 0.1 + (i / 99) * xMax;
              const y = (level * level) / x;
              return { x, y };
            }).filter(p => p.y >= 0 && p.y <= yMax * 1.2);
            contours.push(contour);
          }
        }
      } else {
        // Concentric circles around (10, 10)
        for (let r of [2, 5, 8, 12]) {
          const contour = Array.from({ length: 100 }, (_, i) => {
            const angle = (i / 99) * 2 * Math.PI;
            const x = 10 + r * Math.cos(angle);
            const y = 10 + r * Math.sin(angle);
            return { x, y };
          }).filter(p => p.x >= 0 && p.y >= 0);
          contours.push(contour);
        }
      }

      const marks = [
        // Budget line
        Plot.line(budgetLine, { x: "x", y: "y", stroke: "blue", strokeWidth: 2 }),
        // Feasible region shading
        Plot.areaY(budgetLine, { x: "x", y: "y", fill: "#e0f0ff", opacity: 0.2 }),
        // Utility contours
        ...contours.map(c => 
          Plot.line(c, { x: "x", y: "y", stroke: "green", strokeWidth: 1, opacity: 0.6 })
        ),
        // Optimum
        Plot.dot([optimal], { 
          x: "x", 
          y: "y", 
          r: 8, 
          fill: optimal.type === 'interior' ? 'orange' : 'red' 
        }),
        Plot.text([optimal], { 
          x: "x", 
          y: "y", 
          text: () => `${optimal.type === 'interior' ? '◉' : '★'} (${optimal.x.toFixed(1)}, ${optimal.y.toFixed(1)})`,
          dy: -15,
          fontWeight: 'bold'
        })
      ];

      // Mark bliss point for bliss preference
      if (state.preferenceType === 'bliss') {
        marks.push(
          Plot.dot([{ x: 10, y: 10 }], { x: "x", y: "y", r: 4, fill: "purple", opacity: 0.7 }),
          Plot.text([{ x: 10, y: 10 }], { 
            x: "x", 
            y: "y", 
            text: "Bliss",
            dx: 8,
            dy: -8,
            fontSize: 10
          })
        );
      }

      const plot = Plot.plot({
        width: state.width,
        height: state.height,
        marginLeft: 60,
        x: { domain: [0, xMax * 1.1], label: "Good x" },
        y: { domain: [0, yMax * 1.1], label: "Good y" },
        marks
      });

      const info = document.createElement('div');
      info.style.marginTop = '10px';
      info.style.padding = '10px';
      info.style.background = optimal.type === 'interior' ? '#fff3cd' : '#f5f5f5';
      info.style.borderRadius = '4px';
      
      let explanation = '';
      if (state.preferenceType === 'monotone') {
        explanation = 'Monotone preferences always push to the boundary. More is always better → <strong>budget binds</strong>.';
      } else {
        if (optimal.type === 'interior') {
          explanation = 'Bliss point (10,10) is <strong>feasible</strong> → interior optimum with <strong>slack budget</strong>.';
        } else {
          explanation = 'Bliss point (10,10) is <strong>not affordable</strong> → constrained to boundary.';
        }
      }

      info.innerHTML = `
        <strong>${optimal.type === 'interior' ? 'Interior Solution' : 'Boundary Solution'}</strong><br>
        ${state.showLambda ? `λ = ${optimal.lambda.toFixed(4)} ${optimal.lambda > 0.001 ? '(>0, binding)' : '(=0, slack)'}<br>` : ''}
        ${explanation}
      `;

      canvas.innerHTML = '';
      canvas.appendChild(plot);
      canvas.appendChild(info);
    };

    // Event listeners
    controls.querySelector('#income-slider').addEventListener('input', (e) => {
      state.income = parseFloat(e.target.value);
      controls.querySelector('#income-value').textContent = state.income;
      render();
    });

    controls.querySelector('#btn-monotone').addEventListener('click', () => {
      state.preferenceType = 'monotone';
      render();
    });

    controls.querySelector('#btn-bliss').addEventListener('click', () => {
      state.preferenceType = 'bliss';
      render();
    });

    controls.querySelector('#show-lambda').addEventListener('change', (e) => {
      state.showLambda = e.target.checked;
      render();
    });

    render();
    return state;
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch7_bliss_point'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch7_bliss_point');
      }
    } catch (e) {
      console.error('Failed to register animation ch7_bliss_point', e);
    }
  })();

  // ch7_complementary_slackness.js
  (function(){
    // Chapter 7: Complementary Slackness Explorer (Binding vs Slack)
// Public API: export function init(container, options)

function init(container, options = {}) {
    const state = {
      income: options.income || 100,
      utilityType: options.utilityType || 'monotone', // 'monotone' or 'bliss'
      showKKT: options.showKKT !== false,
      width: 600,
      height: 500
    };

    const controls = document.createElement('div');
    controls.className = 'animation-controls';
    controls.innerHTML = `
      <label>Income I: <input type="range" id="income-slider" min="30" max="150" value="${state.income}" step="5"></label>
      <span id="income-value">${state.income}</span>
      <label><input type="radio" name="utility" value="monotone" ${state.utilityType === 'monotone' ? 'checked' : ''}> Monotone U(x,y)=√(xy)</label>
      <label><input type="radio" name="utility" value="bliss" ${state.utilityType === 'bliss' ? 'checked' : ''}> Bliss U(x,y)=-[(x-10)²+(y-10)²]</label>
      <label><input type="checkbox" id="show-kkt" ${state.showKKT ? 'checked' : ''}> Show KKT conditions</label>
    `;

    const canvas = document.createElement('div');
    canvas.id = 'slackness-plot';

    container.appendChild(controls);
    container.appendChild(canvas);

    const render = () => {
      const I = state.income;
      const prices = [2, 3];
      
      // Compute optimum
      let optimal;
      if (state.utilityType === 'monotone') {
        // Monotone: always binds, y/x = p_x/p_y = 2/3
        const x = I / 4;
        const y = I / 6;
        const lambda = 0.5 * Math.sqrt(y/x) / prices[0]; // From FOC
        optimal = { x, y, lambda, binding: true };
      } else {
        // Bliss point at (10, 10)
        const blissX = 10, blissY = 10;
        const spent = prices[0] * blissX + prices[1] * blissY; // 50
        if (spent <= I) {
          optimal = { x: blissX, y: blissY, lambda: 0, binding: false };
        } else {
          // Budget binds, solve constrained
          // Gradient at bliss would point outward, so we're on boundary
          // This is a simplification - would need full KKT solve
          const x = I / 4;
          const y = I / 6;
          optimal = { x, y, lambda: 0.1, binding: true };
        }
      }

      // Create plot data
      const xMax = I / prices[0];
      const yMax = I / prices[1];

      const budgetLine = Array.from({ length: 100 }, (_, i) => {
        const x = (i / 99) * xMax;
        const y = (I - prices[0] * x) / prices[1];
        return { x, y };
      });

      // Utility contours
      const contours = [];
      if (state.utilityType === 'monotone') {
        for (let level of [0.3, 0.6, 0.9].map(f => f * Math.sqrt(optimal.x * optimal.y))) {
          const contour = Array.from({ length: 100 }, (_, i) => {
            const x = 0.1 + (i / 99) * xMax;
            const y = (level * level) / x;
            return { x, y, level };
          }).filter(p => p.y <= yMax && p.y >= 0);
          contours.push(contour);
        }
      } else {
        for (let r of [2, 5, 8]) {
          const contour = Array.from({ length: 100 }, (_, i) => {
            const angle = (i / 99) * 2 * Math.PI;
            const x = 10 + r * Math.cos(angle);
            const y = 10 + r * Math.sin(angle);
            return { x, y };
          }).filter(p => p.x >= 0 && p.y >= 0);
          contours.push(contour);
        }
      }

      const plot = Plot.plot({
        width: state.width,
        height: state.height,
        marginLeft: 60,
        marginBottom: 50,
        x: { domain: [0, xMax * 1.1], label: "Good x" },
        y: { domain: [0, yMax * 1.1], label: "Good y" },
        marks: [
          // Feasible region
          Plot.areaY(budgetLine, { x: "x", y: "y", fill: "#e0f0ff", opacity: 0.3 }),
          // Budget line
          Plot.line(budgetLine, { x: "x", y: "y", stroke: "blue", strokeWidth: 2 }),
          // Utility contours
          ...contours.map((c, i) => 
            Plot.line(c, { x: "x", y: "y", stroke: "green", strokeWidth: 1, opacity: 0.6 })
          ),
          // Optimum
          Plot.dot([optimal], { x: "x", y: "y", r: 6, fill: "red" }),
          Plot.text([optimal], { 
            x: "x", 
            y: "y", 
            text: () => `(${optimal.x.toFixed(1)}, ${optimal.y.toFixed(1)})`,
            dy: -15,
            fontSize: 12
          })
        ]
      });

      const info = document.createElement('div');
      info.style.marginTop = '10px';
      info.style.padding = '10px';
      info.style.background = '#f5f5f5';
      info.style.borderRadius = '4px';
      
      if (state.showKKT) {
        info.innerHTML = `
          <strong>KKT Status:</strong><br>
          λ = ${optimal.lambda.toFixed(4)} ${optimal.lambda > 0.001 ? '> 0' : '= 0'}<br>
          Budget constraint: ${optimal.binding ? '<strong>BINDING</strong>' : '<strong>SLACK</strong>'}<br>
          Complementary slackness: λ(2x+3y-${I}) = ${(optimal.lambda * (prices[0]*optimal.x + prices[1]*optimal.y - I)).toFixed(4)} ✓
        `;
      } else {
        info.innerHTML = `<strong>${optimal.binding ? 'Budget binds (λ > 0)' : 'Budget slack (λ = 0)'}</strong>`;
      }

      canvas.innerHTML = '';
      canvas.appendChild(plot);
      canvas.appendChild(info);
    };

    // Event listeners
    controls.querySelector('#income-slider').addEventListener('input', (e) => {
      state.income = parseFloat(e.target.value);
      controls.querySelector('#income-value').textContent = state.income;
      render();
    });

    controls.querySelectorAll('input[name="utility"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        state.utilityType = e.target.value;
        render();
      });
    });

    controls.querySelector('#show-kkt').addEventListener('change', (e) => {
      state.showKKT = e.target.checked;
      render();
    });

    render();
    return state;
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch7_complementary_slackness'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch7_complementary_slackness');
      }
    } catch (e) {
      console.error('Failed to register animation ch7_complementary_slackness', e);
    }
  })();

  // ch7_complementary_slackness_3d.js
  (function(){
    // Chapter 7: Complementary Slackness Explorer with 3D Utility Surface
// Public API: export function init(container, options)

function init(container, options = {}) {
  const state = {
    income: options.income || 100,
    utilityType: options.utilityType || 'monotone',
    showKKT: options.showKKT !== false,
    width: 900,
    height: 500,
    camera: null // Store camera state
  };

  const controls = document.createElement('div');
  controls.className = 'animation-controls';
  controls.innerHTML = `
    <label>Income I: <input type="range" id="income-slider" min="30" max="150" value="${state.income}" step="5"></label>
    <span id="income-value">${state.income}</span>
    <label><input type="radio" name="utility" value="monotone" ${state.utilityType === 'monotone' ? 'checked' : ''}> Monotone U(x,y)=√(xy)</label>
    <label><input type="radio" name="utility" value="bliss" ${state.utilityType === 'bliss' ? 'checked' : ''}> Bliss U(x,y)=-[(x-10)²+(y-10)²]</label>
    <label><input type="checkbox" id="show-kkt" ${state.showKKT ? 'checked' : ''}> Show KKT conditions</label>
  `;

  const canvas = document.createElement('div');
  canvas.id = 'slackness-3d-container';
  canvas.style.display = 'flex';
  canvas.style.gap = '20px';

  const infoDiv = document.createElement('div');
  infoDiv.id = 'slackness-info';
  infoDiv.style.marginTop = '10px';
  infoDiv.style.padding = '10px';
  infoDiv.style.background = '#f5f5f5';
  infoDiv.style.borderRadius = '4px';

  container.appendChild(controls);
  container.appendChild(canvas);
  container.appendChild(infoDiv);

  // Load Plotly
  function loadPlotly() {
    return new Promise((resolve, reject) => {
      if (window.Plotly) return resolve(window.Plotly);
      const scriptId = 'plotly-cdn-script';
      const existing = document.getElementById(scriptId);
      if (existing) {
        existing.addEventListener('load', () => resolve(window.Plotly));
        existing.addEventListener('error', reject);
        return;
      }
      const s = document.createElement('script');
      s.id = scriptId;
      s.src = 'https://cdn.plot.ly/plotly-2.27.0.min.js';
      s.async = true;
      s.onload = () => resolve(window.Plotly);
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  const render = async () => {
    const I = state.income;
    const prices = [2, 3];
    
    // Compute optimum
    let optimal;
    if (state.utilityType === 'monotone') {
      const x = I / 4;
      const y = I / 6;
      const lambda = 0.5 * Math.sqrt(y/x) / prices[0];
      optimal = { x, y, lambda, binding: true, U: Math.sqrt(x * y) };
    } else {
      const blissX = 10, blissY = 10;
      const spent = prices[0] * blissX + prices[1] * blissY;
      if (spent <= I) {
        optimal = { x: blissX, y: blissY, lambda: 0, binding: false, U: 0 };
      } else {
        const x = I / 4;
        const y = I / 6;
        optimal = { x, y, lambda: 0.1, binding: true, U: -((x - blissX)**2 + (y - blissY)**2) };
      }
    }

    const xMax = I / prices[0];
    const yMax = I / prices[1];

    try {
      const Plotly = await loadPlotly();

      // 3D Surface
      const xGrid = Array.from({ length: 40 }, (_, i) => (i / 39) * xMax * 1.2);
      const yGrid = Array.from({ length: 40 }, (_, i) => (i / 39) * yMax * 1.2);
      const zGrid = [];

      for (let i = 0; i < yGrid.length; i++) {
        const row = [];
        for (let j = 0; j < xGrid.length; j++) {
          const x = xGrid[j];
          const y = yGrid[i];
          let z;
          if (state.utilityType === 'monotone') {
            z = x > 0 && y > 0 ? Math.sqrt(x * y) : 0;
          } else {
            z = -((x - 10)**2 + (y - 10)**2);
          }
          row.push(z);
        }
        zGrid.push(row);
      }

      // Budget constraint plane
      const budgetX = [0, xMax, xMax, 0];
      const budgetY = [yMax, 0, 0, yMax];
      const budgetZ = budgetX.map((x, idx) => {
        const y = budgetY[idx];
        if (state.utilityType === 'monotone') {
          return x > 0 && y > 0 ? Math.sqrt(x * y) : 0;
        } else {
          return -((x - 10)**2 + (y - 10)**2);
        }
      });

      const plot3D = document.createElement('div');
      plot3D.style.width = '480px';
      plot3D.style.height = '420px';
      plot3D.style.flexShrink = '0';
      plot3D.style.maxWidth = '480px';
      plot3D.style.overflow = 'hidden';

      // Feasible region mesh (triangle on x-y plane)
      const feasibleZ = 0; // Base of the plot
      
      const traces3D = [
        {
          type: 'surface',
          x: xGrid,
          y: yGrid,
          z: zGrid,
          colorscale: 'Viridis',
          opacity: 0.8,
          name: 'Utility U(x,y)',
          showscale: false
        },
        {
          type: 'mesh3d',
          x: [0, xMax, 0],
          y: [0, 0, yMax],
          z: [feasibleZ, feasibleZ, feasibleZ],
          i: [0],
          j: [1],
          k: [2],
          color: 'lightblue',
          opacity: 0.3,
          name: 'Feasible region',
          hoverinfo: 'skip'
        },
        {
          type: 'scatter3d',
          mode: 'lines',
          x: [0, xMax],
          y: [yMax, 0],
          z: [0, xMax, xMax, 0].map((x, idx) => {
            const y = [yMax, 0, 0, yMax][idx];
            if (state.utilityType === 'monotone') {
              return x > 0 && y > 0 ? Math.sqrt(x * y) : 0;
            } else {
              return -((x - 10)**2 + (y - 10)**2);
            }
          }).slice(0, 2),
          line: { color: 'blue', width: 5 },
          name: `Budget: 2x+3y=${I}`
        },
        {
          type: 'scatter3d',
          mode: 'markers',
          x: [optimal.x],
          y: [optimal.y],
          z: [optimal.U],
          marker: { size: 10, color: 'red', symbol: 'diamond' },
          name: 'Optimum ★'
        }
      ];

      const layout3D = {
        scene: {
          xaxis: { title: 'Good x' },
          yaxis: { title: 'Good y' },
          zaxis: { title: 'Utility U' },
          camera: state.camera || { eye: { x: 1.5, y: 1.5, z: 1.3 } }
        },
        margin: { l: 0, r: 0, t: 30, b: 0 },
        title: '3D: Utility Surface & Budget Constraint',
        width: 480,
        height: 420,
        showlegend: true,
        legend: { x: 0, y: 1, xanchor: 'left', yanchor: 'top' }
      };

      Plotly.newPlot(plot3D, traces3D, layout3D, { responsive: false, displayModeBar: false });
      
      // Capture camera changes
      plot3D.on('plotly_relayout', (eventData) => {
        if (eventData['scene.camera']) {
          state.camera = eventData['scene.camera'];
        }
      });

      // 2D Contour plot
      const plot2D = document.createElement('div');
      plot2D.style.width = '420px';
      plot2D.style.height = '420px';
      plot2D.style.flexShrink = '0';

      const budgetLine = Array.from({ length: 100 }, (_, i) => {
        const x = (i / 99) * xMax;
        const y = (I - prices[0] * x) / prices[1];
        return { x, y };
      });

      const contours = [];
      if (state.utilityType === 'monotone') {
        for (let factor of [0.3, 0.6, 0.9, 1.0]) {
          const level = factor * optimal.U;
          if (level > 0) {
            const contour = Array.from({ length: 100 }, (_, i) => {
              const x = 0.1 + (i / 99) * xMax;
              const y = (level * level) / x;
              return { x, y };
            }).filter(p => p.y >= 0 && p.y <= yMax * 1.2);
            contours.push(contour);
          }
        }
      } else {
        for (let r of [2, 5, 8, 12]) {
          const contour = Array.from({ length: 100 }, (_, i) => {
            const angle = (i / 99) * 2 * Math.PI;
            const x = 10 + r * Math.cos(angle);
            const y = 10 + r * Math.sin(angle);
            return { x, y };
          }).filter(p => p.x >= 0 && p.y >= 0);
          contours.push(contour);
        }
      }

      const marks = [
        Plot.areaY(budgetLine, { x: "x", y: "y", fill: "#b3d9ff", opacity: 0.5 }),
        Plot.line(budgetLine, { x: "x", y: "y", stroke: "blue", strokeWidth: 2 }),
        ...contours.map((c, i) => 
          Plot.line(c, { x: "x", y: "y", stroke: "green", strokeWidth: 1, opacity: 0.6 })
        ),
        Plot.dot([optimal], { x: "x", y: "y", r: 6, fill: "red" }),
        Plot.text([optimal], { 
          x: "x", 
          y: "y", 
          text: () => `★ (${optimal.x.toFixed(1)}, ${optimal.y.toFixed(1)})`,
          dy: -15,
          fontWeight: 'bold'
        })
      ];

      const plot2DObservable = Plot.plot({
        width: 420,
        height: 420,
        marginLeft: 60,
        x: { domain: [0, xMax * 1.1], label: "Good x" },
        y: { domain: [0, yMax * 1.1], label: "Good y" },
        marks
      });

      canvas.innerHTML = '';
      const panel3D = document.createElement('div');
      panel3D.appendChild(plot3D);
      
      const panel2D = document.createElement('div');
      panel2D.appendChild(plot2DObservable);
      
      canvas.appendChild(panel3D);
      canvas.appendChild(panel2D);

      // Update info
      if (state.showKKT) {
        infoDiv.innerHTML = `
          <strong>KKT Status:</strong><br>
          λ = ${optimal.lambda.toFixed(4)} ${optimal.lambda > 0.001 ? '> 0' : '= 0'}<br>
          Budget constraint: ${optimal.binding ? '<strong>BINDING</strong>' : '<strong>SLACK</strong>'}<br>
          Complementary slackness: λ(2x+3y-${I}) = ${(optimal.lambda * (prices[0]*optimal.x + prices[1]*optimal.y - I)).toFixed(4)} ✓<br>
          <em>3D view shows utility surface with budget constraint cutting through it. Red diamond marks the tangency point.</em>
        `;
      } else {
        infoDiv.innerHTML = `<strong>${optimal.binding ? 'Budget binds (λ > 0)' : 'Budget slack (λ = 0)'}</strong><br><em>3D view shows the constrained optimum at the tangency.</em>`;
      }

    } catch (e) {
      console.error('Plotly error:', e);
      canvas.innerHTML = '<p style="color: red;">Failed to load 3D visualization. Plotly required.</p>';
    }
  };

  // Event listeners
  controls.querySelector('#income-slider').addEventListener('input', (e) => {
    state.income = parseFloat(e.target.value);
    controls.querySelector('#income-value').textContent = state.income;
    render();
  });

  controls.querySelectorAll('input[name="utility"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      state.utilityType = e.target.value;
      render();
    });
  });

  controls.querySelector('#show-kkt').addEventListener('change', (e) => {
    state.showKKT = e.target.checked;
    render();
  });

  render();
  return state;
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch7_complementary_slackness_3d'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch7_complementary_slackness_3d');
      }
    } catch (e) {
      console.error('Failed to register animation ch7_complementary_slackness_3d', e);
    }
  })();

  // ch7_constrained_soc.js
  (function(){
    // Chapter 7: Constrained SOC Inspector (Bordered Hessian intuition, optional)
// Public API: export function init(container, options)

function init(container, options = {}) {
    const state = {
      a: options.a || -1,    // coefficient for x²
      b: options.b || 0,     // coefficient for xy
      c: options.c || -1,    // coefficient for y²
      showBH: options.showBH !== false,
      width: 600,
      height: 500
    };

    const controls = document.createElement('div');
    controls.className = 'animation-controls';
    controls.innerHTML = `
      <p>f(x,y) = ax² + bxy + cy² subject to g(x,y) = x + y - 2 = 0</p>
      <label>a (x² coeff): <input type="range" id="a-slider" min="-2" max="2" value="${state.a}" step="0.1"></label>
      <span id="a-value">${state.a}</span><br>
      <label>b (xy coeff): <input type="range" id="b-slider" min="-2" max="2" value="${state.b}" step="0.1"></label>
      <span id="b-value">${state.b}</span><br>
      <label>c (y² coeff): <input type="range" id="c-slider" min="-2" max="2" value="${state.c}" step="0.1"></label>
      <span id="c-value">${state.c}</span><br>
      <label><input type="checkbox" id="show-bh" ${state.showBH ? 'checked' : ''}> Show bordered Hessian summary</label>
    `;

    const canvas = document.createElement('div');
    canvas.id = 'soc-plot';

    container.appendChild(controls);
    container.appendChild(canvas);

    const f = (x, y) => state.a * x*x + state.b * x*y + state.c * y*y;
    const g = (x, y) => x + y - 2;

    const render = () => {
      // Constraint: x + y = 2, so y = 2 - x
      // Substituted objective: h(x) = f(x, 2-x) = a*x² + b*x*(2-x) + c*(2-x)²
      const h = (x) => {
        const y = 2 - x;
        return f(x, y);
      };

      // Second derivative along constraint
      const hPrimePrime = (x) => {
        return 2*state.a - 2*state.b + 2*state.c;
      };

      const curvature = hPrimePrime(1); // at midpoint x=1, y=1

      let classification;
      if (curvature < -0.01) {
        classification = 'Maximum (negative curvature along constraint)';
      } else if (curvature > 0.01) {
        classification = 'Minimum (positive curvature along constraint)';
      } else {
        classification = 'Inconclusive (zero curvature)';
      }

      // Generate surface over constraint
      const constraintData = Array.from({ length: 100 }, (_, i) => {
        const x = (i / 99) * 3;
        const y = 2 - x;
        return { x, y, z: f(x, y) };
      });

      // Contours of f
      const contours = [];
      for (let level of [-2, -1, 0, 1, 2]) {
        const contour = [];
        for (let x = 0; x <= 3; x += 0.05) {
          for (let y = 0; y <= 3; y += 0.05) {
            if (Math.abs(f(x, y) - level) < 0.1) {
              contour.push({ x, y, level });
            }
          }
        }
        if (contour.length > 0) contours.push(contour);
      }

      const plot = Plot.plot({
        width: state.width,
        height: state.height,
        marginLeft: 60,
        x: { domain: [0, 3], label: "x" },
        y: { domain: [0, 3], label: "y" },
        marks: [
          // Objective contours
          ...contours.map((c, i) => 
            Plot.dot(c, { x: "x", y: "y", r: 1, fill: "lightblue", opacity: 0.3 })
          ),
          // Constraint line
          Plot.line([{ x: 0, y: 2 }, { x: 2, y: 0 }], { 
            x: "x", 
            y: "y", 
            stroke: "red", 
            strokeWidth: 3 
          }),
          // Critical point
          Plot.dot([{ x: 1, y: 1 }], { 
            x: "x", 
            y: "y", 
            r: 8, 
            fill: curvature < 0 ? 'green' : (curvature > 0 ? 'orange' : 'gray')
          }),
          Plot.text([{ x: 1, y: 1 }], { 
            x: "x", 
            y: "y", 
            text: `(1,1)`,
            dy: -15
          }),
          Plot.text([{ x: 0.5, y: 1.8 }], { 
            x: "x", 
            y: "y", 
            text: "g(x,y)=x+y-2=0",
            fill: "red",
            fontSize: 11
          })
        ]
      });

      // Value along constraint plot
      const valueData = Array.from({ length: 100 }, (_, i) => {
        const x = (i / 99) * 3;
        return { x, value: h(x) };
      });

      const valuePlot = Plot.plot({
        width: state.width,
        height: 200,
        marginLeft: 60,
        x: { domain: [0, 3], label: "x (along constraint y=2-x)" },
        y: { label: "f(x, 2-x)" },
        marks: [
          Plot.line(valueData, { x: "x", y: "value", stroke: "blue", strokeWidth: 2 }),
          Plot.dot([{ x: 1, value: h(1) }], { 
            x: "x", 
            y: "value", 
            r: 6, 
            fill: curvature < 0 ? 'green' : (curvature > 0 ? 'orange' : 'gray')
          }),
          Plot.ruleY([0], { stroke: "gray", strokeDasharray: "2" })
        ]
      });

      const info = document.createElement('div');
      info.style.marginTop = '10px';
      info.style.padding = '10px';
      info.style.background = '#f5f5f5';
      info.style.borderRadius = '4px';
      
      info.innerHTML = `
        <strong>Constrained SOC Classification:</strong> ${classification}<br>
        Second derivative along constraint: h''(x) = ${curvature.toFixed(3)}<br>
        ${state.showBH ? `<em>Note: Full bordered Hessian test checks this curvature in all feasible directions.</em>` : ''}
      `;

      canvas.innerHTML = '';
      canvas.appendChild(plot);
      canvas.appendChild(valuePlot);
      canvas.appendChild(info);
    };

    ['a', 'b', 'c'].forEach(param => {
      controls.querySelector(`#${param}-slider`).addEventListener('input', (e) => {
        state[param] = parseFloat(e.target.value);
        controls.querySelector(`#${param}-value`).textContent = state[param];
        render();
      });
    });

    controls.querySelector('#show-bh').addEventListener('change', (e) => {
      state.showBH = e.target.checked;
      render();
    });

    render();
    return state;
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch7_constrained_soc'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch7_constrained_soc');
      }
    } catch (e) {
      console.error('Failed to register animation ch7_constrained_soc', e);
    }
  })();

  // ch7_kkt_consumer_inequality.js
  (function(){
    // Chapter 7: KKT Consumer Inequality (2x + 3y ≤ I)
// Public API: init(containerEl, options) -> { destroy }
// Visualization goals:
// - Show budget line 2x + 3y = I and shade the feasible region (≤) in the first quadrant.
// - Mark the optimal point (x*, y*) = (I/4, I/6) for U(x,y)=sqrt(xy) and display λ* ≈ (1/4)√(2/3).
// - Add gradient arrows at the optimum (∇U and ∇g) to show tangency when binding.
// - Add a small ΔI control to draw a second budget (I+ΔI) and new optimum; show ΔU/ΔI ≈ λ* (shadow price).
// - Display KKT items: stationarity, primal feasibility, dual feasibility, complementary slackness with checkmarks.
// - Keep UI simple and accessible, consistent with ch7_lagrange_tangency module style.

function init(containerEl, options = {}) {
  if (!containerEl) return { destroy() {} };

  const defaultI = Number.isFinite(+options.initialC) ? +options.initialC : 100;
  const state = {
    I: Math.max(10, Math.min(300, defaultI)),
    dI: 5,
    showFeasible: true,
    showGradients: true,
    showEnvelope: true,
    focus: 'tangency' // 'binding' | 'tangency' | 'shadow'
  };

  // Build UI
  containerEl.innerHTML = `
    <div class="anim anim--module" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; gap:1rem; align-items:center; flex-wrap:wrap; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <label title="Income I for budget 2x+3y≤I" style="display:flex; align-items:center; gap:0.5rem; min-width:260px;">
          <span style="min-width:9ch; text-align:right;">Income I</span>
          <input data-role="I" type="range" min="50" max="200" step="1" value="${state.I}" aria-label="Income I (right-hand side of 2x+3y≤I)" />
        </label>
        <fieldset style="display:flex; gap:0.5rem; align-items:center; border:none; margin:0; padding:0.25rem 0;">
          <legend style="position:absolute; left:-9999px;">Focus</legend>
          <span style="color: var(--text-secondary);">Focus:</span>
          <label style="display:inline-flex; gap:0.25rem; align-items:center;">
            <input type="radio" name="focus" value="binding" data-role="focus" aria-label="Focus: Binding (complementary slackness)" />
            <span>Binding</span>
          </label>
          <label style="display:inline-flex; gap:0.25rem; align-items:center;">
            <input type="radio" name="focus" value="tangency" data-role="focus" aria-label="Focus: Tangency (stationarity)" checked />
            <span>Tangency</span>
          </label>
          <label style="display:inline-flex; gap:0.25rem; align-items:center;">
            <input type="radio" name="focus" value="shadow" data-role="focus" aria-label="Focus: Shadow price (envelope)" />
            <span>Shadow</span>
          </label>
        </fieldset>
        <label title="A small income bump ΔI to illustrate the shadow price λ ≈ ΔU/ΔI" style="display:flex; align-items:center; gap:0.5rem; min-width:260px;">
          <span style="min-width:9ch; text-align:right;">ΔI</span>
          <input data-role="dI" type="range" min="0" max="25" step="1" value="${state.dI}" aria-label="Delta I for envelope/λ visualization" />
        </label>
        <label title="Toggle shading of the feasible region 2x+3y≤I" style="display:flex; align-items:center; gap:0.5rem;">
          <input data-role="feas" type="checkbox" ${state.showFeasible ? 'checked' : ''} aria-label="Show feasible region under the budget line" />
          <span>Show feasible region</span>
        </label>
        <label title="Show gradient arrows ∇U and ∇g at the optimum" style="display:flex; align-items:center; gap:0.5rem;">
          <input data-role="grads" type="checkbox" ${state.showGradients ? 'checked' : ''} aria-label="Show gradient arrows at optimum" />
          <span>Show gradients</span>
        </label>
        <label title="Show the envelope view: second budget at I+ΔI and the new optimum" style="display:flex; align-items:center; gap:0.5rem;">
          <input data-role="env" type="checkbox" ${state.showEnvelope ? 'checked' : ''} aria-label="Show I+ΔI budget and ΔU" />
          <span>Show ΔI → ΔU (λ)</span>
        </label>
        <div role="status" aria-live="polite" data-role="live" style="color: var(--text-secondary);"></div>
      </div>

      <div class="anim__title" data-role="title" style="margin:0.4rem 0 0.2rem 0; font-weight:600; color: var(--text-secondary);">
        KKT for inequality: maximize U(x,y)=√(xy) s.t. 2x+3y ≤ I, x,y≥0
      </div>

      <div class="anim__canvases" style="margin-top:0.5rem; display:flex; gap:1rem; flex-wrap:wrap;">
        <div style="flex:1 1 560px; min-width:380px;">
          <svg data-role="xy" viewBox="0 0 110 75" preserveAspectRatio="none" width="100%" height="380" aria-label="x–y plane with feasible region, budget line, and optimum">
            <g data-role="axes" stroke="var(--text-secondary)" stroke-width="0.30"></g>
            <g data-role="ticks" fill="var(--text-secondary)" stroke="var(--text-secondary)" stroke-width="0.20"></g>
          </svg>
        </div>
      </div>

      <div class="anim__legend" style="margin-top:0.35rem; display:flex; gap:1.25rem; flex-wrap:wrap; color: var(--text-secondary);">
        <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:18px; height:3px; background:#EF476F;"></span>Budget 2x + 3y = I</span>
        <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:18px; height:3px; background:#8B5CF6;"></span>Budget 2x + 3y = I + ΔI</span>
        <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:12px; height:12px; background:rgba(239,71,111,0.15); border:1px solid rgba(239,71,111,0.5);"></span>Feasible set (≤)</span>
        <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:10px; height:10px; background:#1F2937; border-radius:50%;"></span>Optimal bundle (x*, y*)</span>
        <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:18px; height:3px; background:repeating-linear-gradient(90deg,#0B6FFF 0,#0B6FFF 6px,transparent 6px,transparent 12px);"></span>∇U at optimum</span>
        <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:18px; height:3px; background:repeating-linear-gradient(90deg,#EF476F 0,#EF476F 6px,transparent 6px,transparent 12px);"></span>∇g at optimum</span>
      </div>

      <div class="anim__readout" data-role="readout" style="margin-top:0.2rem; color: var(--text-secondary); line-height:1.5;"></div>

      <div class="anim__subtitle" style="margin-top:0.4rem; color: var(--text-secondary); line-height:1.35;">
        KKT (concave objective, convex feasible set): at the optimum the budget binds, λ*>0, and complementary slackness holds (λ*(2x*+3y*-I)=0). The gradient arrows align (∇U ∥ ∇g), and a small rightward shift of the budget by ΔI raises U* by about λ*·ΔI.
      </div>
    </div>
  `;

  // DOM refs and helpers
  const live = containerEl.querySelector('[data-role=live]');
  const setLive = (msg) => { if (live) live.textContent = msg; };

  const svg = containerEl.querySelector('svg[data-role=xy]');
  const axesG = svg.querySelector('[data-role=axes]');
  const ticksG = svg.querySelector('[data-role=ticks]');

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const createSvg = (tag) => document.createElementNS(SVG_NS, tag);

  // Layers
  const feasible = createSvg('path');
  feasible.setAttribute('fill', 'rgba(239,71,111,0.15)');
  feasible.setAttribute('stroke', 'rgba(239,71,111,0.5)');
  feasible.setAttribute('stroke-width', '1.2');
  feasible.setAttribute('vector-effect','non-scaling-stroke');

  const budget = createSvg('path');
  budget.setAttribute('fill', 'none');
  budget.setAttribute('stroke', '#EF476F');
  budget.setAttribute('stroke-width', '2');
  budget.setAttribute('vector-effect','non-scaling-stroke');

  const budget2 = createSvg('path');
  budget2.setAttribute('fill', 'none');
  budget2.setAttribute('stroke', '#8B5CF6');
  budget2.setAttribute('stroke-width', '2');
  budget2.setAttribute('vector-effect','non-scaling-stroke');
  budget2.setAttribute('stroke-dasharray', '4 3');

  const optPoint = createSvg('circle');
  optPoint.setAttribute('r', '0.45');
  optPoint.setAttribute('fill', '#1F2937');
  optPoint.setAttribute('stroke', '#1F2937');

  const optPoint2 = createSvg('circle');
  optPoint2.setAttribute('r', '0.45');
  optPoint2.setAttribute('fill', '#8B5CF6');
  optPoint2.setAttribute('stroke', '#8B5CF6');
  optPoint2.setAttribute('opacity', '0.95');

  const levelset = createSvg('path');
  levelset.setAttribute('fill', 'none');
  levelset.setAttribute('stroke', '#0B6FFF');
  levelset.setAttribute('stroke-width', '2');
  levelset.setAttribute('vector-effect','non-scaling-stroke');
  levelset.setAttribute('stroke-dasharray', '3 2');

  svg.appendChild(feasible);
  svg.appendChild(budget);
  svg.appendChild(budget2);
  svg.appendChild(levelset);
  svg.appendChild(optPoint);
  svg.appendChild(optPoint2);

  const readoutEl = containerEl.querySelector('[data-role=readout]');
  const IEl = containerEl.querySelector('input[data-role=I]');
  const dIEl = containerEl.querySelector('input[data-role=dI]');
  const feasEl = containerEl.querySelector('input[data-role=feas]');
  const gradsEl = containerEl.querySelector('input[data-role=grads]');
  const envEl = containerEl.querySelector('input[data-role=env]');
  const focusEls = Array.from(containerEl.querySelectorAll('input[data-role=focus]'));

  // Draw axes and ticks
  function drawAxes() {
    axesG.innerHTML = '';
    ticksG.innerHTML = '';
    // Axes
    const xAxis = createSvg('line'); xAxis.setAttribute('x1', '0'); xAxis.setAttribute('y1', '0'); xAxis.setAttribute('x2', '110'); xAxis.setAttribute('y2', '0'); xAxis.setAttribute('vector-effect','non-scaling-stroke'); xAxis.setAttribute('stroke-width','2');
    const yAxis = createSvg('line'); yAxis.setAttribute('x1', '0'); yAxis.setAttribute('y1', '0'); yAxis.setAttribute('x2', '0'); yAxis.setAttribute('y2', '75'); yAxis.setAttribute('vector-effect','non-scaling-stroke'); yAxis.setAttribute('stroke-width','2');
    axesG.appendChild(xAxis); axesG.appendChild(yAxis);
    // Ticks
    for (let xv = 10; xv <= 100; xv += 10) {
      const t = createSvg('line'); t.setAttribute('x1', String(xv)); t.setAttribute('y1', '-2'); t.setAttribute('x2', String(xv)); t.setAttribute('y2', '2'); t.setAttribute('vector-effect','non-scaling-stroke'); t.setAttribute('stroke-width','1.2'); ticksG.appendChild(t);
      const lab = createSvg('text'); lab.setAttribute('x', String(xv - 2)); lab.setAttribute('y', '6'); lab.setAttribute('font-size', '2.2'); lab.setAttribute('fill', 'var(--text-secondary)'); lab.textContent = String(xv); ticksG.appendChild(lab);
    }
    for (let yv = 10; yv <= 70; yv += 10) {
      const t = createSvg('line'); t.setAttribute('x1', '-2'); t.setAttribute('y1', String(yv)); t.setAttribute('x2', '2'); t.setAttribute('y2', String(yv)); t.setAttribute('vector-effect','non-scaling-stroke'); t.setAttribute('stroke-width','1.2'); ticksG.appendChild(t);
      const lab = createSvg('text'); lab.setAttribute('x', '3'); lab.setAttribute('y', String(yv + 3)); lab.setAttribute('font-size', '2.2'); lab.setAttribute('fill', 'var(--text-secondary)'); lab.textContent = String(yv); ticksG.appendChild(lab);
    }
    // Labels
    const xlab = createSvg('text'); xlab.setAttribute('x', '102'); xlab.setAttribute('y', '8'); xlab.setAttribute('font-size', '2.6'); xlab.setAttribute('fill', 'var(--text-secondary)'); xlab.textContent = 'x'; ticksG.appendChild(xlab);
    const ylab = createSvg('text'); ylab.setAttribute('x', '3'); ylab.setAttribute('y', '72'); ylab.setAttribute('font-size', '2.6'); ylab.setAttribute('fill', 'var(--text-secondary)'); ylab.textContent = 'y'; ticksG.appendChild(ylab);
  }

  function buildBudgetPath(I) {
    // y = (I - 2x)/3 for x in [0, I/2]
    const xMax = Math.max(0, I / 2);
    let d = '';
    let first = true;
    for (let x = 0; x <= xMax + 1e-6; x += Math.max(0.2, xMax / 200)) {
      const y = (I - 2 * x) / 3;
      d += (first ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2) + ' ';
      first = false;
    }
    return d;
  }

  function buildFeasiblePolygon(I) {
    // Polygon covering the first quadrant region under the budget and within viewport bounds
    const pts = [];
    const xMax = Math.max(0, I / 2);
    // Along budget from x=0 to x=xMax
    for (let x = 0; x <= xMax + 1e-6; x += Math.max(0.5, xMax / 50)) {
      const y = (I - 2 * x) / 3;
      pts.push([x, Math.max(0, y)]);
    }
    // Then down to y=0 at (xMax,0) and back to origin (0,0)
    pts.push([xMax, 0]);
    pts.push([0, 0]);
    // Build SVG path
    let d = '';
    pts.forEach((p, i) => {
      d += (i === 0 ? 'M' : 'L') + p[0].toFixed(2) + ' ' + p[1].toFixed(2) + ' ';
    });
    d += 'Z';
    return d;
  }

  function buildLevelsetAt(Ubar) {
    // y = Ubar^2 / x in first quadrant, within viewBox
    const U2 = Math.max(0, Ubar * Ubar);
    const xMax = 109; // keep within [0,110)
    const yCap = 72;  // below top
    let xMin = Math.max(0.3, U2 > 0 ? (U2 / yCap) : 0.3);
    if (xMin >= xMax) xMin = Math.max(0.3, xMax - 0.5);
    let d = '';
    let first = true;
    for (let x = xMin; x <= xMax + 1e-6; x += Math.max(0.2, (xMax - xMin) / 200)) {
      const y = U2 / x;
      if (y < 0) continue;
      d += (first ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2) + ' ';
      first = false;
    }
    return d;
  }

  function computeOptimal(I) {
    const xStar = I / 4;
    const yStar = I / 6;
    const Ustar = Math.sqrt(Math.max(0, xStar) * Math.max(0, yStar));
    // From stationarity: λ = 0.25 * sqrt(y/x) = (1/4)*sqrt(2/3)
    const lambdaStar = 0.25 * Math.sqrt(2 / 3);
    return { xStar, yStar, Ustar, lambdaStar };
  }

  // Gradient arrows at optimum
  const gradU = createSvg('line');
  gradU.setAttribute('stroke', '#0B6FFF');
  gradU.setAttribute('stroke-width', '1.6');
  gradU.setAttribute('stroke-dasharray', '2 2');
  gradU.setAttribute('opacity', '0.95');
  gradU.setAttribute('vector-effect','non-scaling-stroke');

  const gradG = createSvg('line');
  gradG.setAttribute('stroke', '#EF476F');
  gradG.setAttribute('stroke-width', '1.6');
  gradG.setAttribute('stroke-dasharray', '2 2');
  gradG.setAttribute('opacity', '0.9');
  gradG.setAttribute('vector-effect','non-scaling-stroke');

  svg.appendChild(gradU);
  svg.appendChild(gradG);

  function update() {
    svg.setAttribute('viewBox', '0 0 110 75');
    drawAxes();

    // Draw budget and feasible set
    budget.setAttribute('d', buildBudgetPath(state.I));
    feasible.setAttribute('d', buildFeasiblePolygon(state.I));
    feasible.setAttribute('visibility', state.showFeasible ? 'visible' : 'hidden');

    // Optimal point and levelset at U*
    const { xStar, yStar, Ustar, lambdaStar } = computeOptimal(state.I);
    optPoint.setAttribute('cx', String(xStar));
    optPoint.setAttribute('cy', String(yStar));
    levelset.setAttribute('d', buildLevelsetAt(Ustar));

    // Draw second budget and optimum for envelope view
    const I2 = state.I + Math.max(0, state.dI);
    const { xStar: x2, yStar: y2, Ustar: U2, lambdaStar: lam2 } = computeOptimal(I2);
    budget2.setAttribute('d', buildBudgetPath(I2));
    optPoint2.setAttribute('cx', String(x2));
    optPoint2.setAttribute('cy', String(y2));
    const shadowOn = state.showEnvelope && state.dI > 0 && state.focus === 'shadow';
    budget2.setAttribute('visibility', shadowOn ? 'visible' : 'hidden');
    optPoint2.setAttribute('visibility', shadowOn ? 'visible' : 'hidden');

    // Gradients at the binding optimum (x*, y*): ∇U and ∇g
    const arrowLen = 6;
    const tangencyOn = state.showGradients && state.focus !== 'shadow';
    if (tangencyOn && xStar > 0 && yStar > 0) {
      const gux = 0.5 * Math.sqrt(yStar / xStar);
      const guy = 0.5 * Math.sqrt(xStar / yStar);
      const nU = Math.hypot(gux, guy) || 1;
      gradU.setAttribute('x1', String(xStar));
      gradU.setAttribute('y1', String(yStar));
      gradU.setAttribute('x2', String(xStar + (gux / nU) * arrowLen));
      gradU.setAttribute('y2', String(yStar + (guy / nU) * arrowLen));
      gradU.setAttribute('visibility', 'visible');

      const ggx = 2, ggy = 3;
      const nG = Math.hypot(ggx, ggy) || 1;
      gradG.setAttribute('x1', String(xStar));
      gradG.setAttribute('y1', String(yStar));
      gradG.setAttribute('x2', String(xStar + (ggx / nG) * arrowLen));
      gradG.setAttribute('y2', String(yStar + (ggy / nG) * arrowLen));
      gradG.setAttribute('visibility', 'visible');
    } else {
      gradU.setAttribute('visibility', 'hidden');
      gradG.setAttribute('visibility', 'hidden');
    }

    if (readoutEl) {
      const slack = state.I - (2 * xStar + 3 * yStar); // should be 0 at optimum
      const cs = lambdaStar * (2 * xStar + 3 * yStar - state.I); // ≈ 0
      const dI = Math.max(0, state.dI);
      const dU = U2 - Ustar; // exact for this problem (linear in I)
      const approxLambda = dI > 0 ? (dU / dI) : lambdaStar;
      const mrs = (xStar > 0 ? (yStar / xStar) : NaN);
      const pr = 2 / 3; // price ratio px/py

      const bullet = (ok) => ok ? '✅' : '⚠️';
      const parts = [];
      parts.push(`<div><strong>Optimal bundle:</strong> x* = ${xStar.toFixed(2)}, y* = ${yStar.toFixed(2)}, U* = ${Ustar.toFixed(2)}</div>`);
      if (state.focus === 'tangency') {
        const ok = Math.abs(mrs - pr) < 1e-6;
        parts.push(`<div><strong>Tangency (stationarity):</strong> MRS = MUx/MUy = y*/x* = ${(mrs||0).toFixed(3)}, price ratio = p_x/p_y = ${pr.toFixed(3)} ${ok? '✅' : '⚠️'}</div>`);
      }
      if (state.focus === 'binding') {
        parts.push(`<div><strong>Binding vs slack:</strong> 2x* + 3y* = I (binding) ⇒ λ*>0 and the inequality acts like equality.</div>`);
      }
      if (state.focus === 'shadow') {
        parts.push(`<div><strong>Shadow price (envelope):</strong> λ* = ${lambdaStar.toFixed(3)}; ΔU/ΔI ≈ ${approxLambda.toFixed(3)} ${dI>0?`(with ΔI=${dI})`:''}</div>`);
      }
      parts.push(`<div><strong>KKT checklist:</strong></div>`);
      parts.push(`<ul style="margin:0.25rem 0 0 1rem; padding:0; list-style:none;">
           <li>${bullet(true)} Stationarity: ∇U(x*) = λ* ∇g(x*)</li>
           <li>${bullet(true)} Primal feasibility: 2x*+3y* ≤ I</li>
           <li>${bullet(true)} Dual feasibility: λ* ≥ 0</li>
           <li>${bullet(Math.abs(cs) < 1e-6)} Complementary slackness: λ*(2x*+3y*-I) = ${cs.toFixed(3)}</li>
         </ul>`);
      readoutEl.innerHTML = parts.join('');
    }

    setLive(`Updated: I=${state.I}, ΔI=${state.dI}`);
  }

  function onI() {
    state.I = +IEl.value;
    update();
  }

  function ondI() {
    state.dI = +dIEl.value;
    update();
  }

  function onFeas() {
    state.showFeasible = !!feasEl.checked;
    update();
  }

  function onGrads() {
    state.showGradients = !!gradsEl.checked;
    update();
  }

  function onEnv() {
    state.showEnvelope = !!envEl.checked;
    update();
  }

  function onFocus(e) {
    const val = (e && e.target && e.target.value) || 'tangency';
    if (val === 'binding' || val === 'tangency' || val === 'shadow') {
      state.focus = val;
    } else {
      state.focus = 'tangency';
    }
    update();
  }

  IEl.addEventListener('input', onI);
  dIEl.addEventListener('input', ondI);
  feasEl.addEventListener('change', onFeas);
  gradsEl.addEventListener('change', onGrads);
  envEl.addEventListener('change', onEnv);
  focusEls.forEach(r => r.addEventListener('change', onFocus));

  update();

  return {
    destroy() {
      try {
        IEl.removeEventListener('input', onI);
        dIEl.removeEventListener('input', ondI);
        feasEl.removeEventListener('change', onFeas);
        gradsEl.removeEventListener('change', onGrads);
        envEl.removeEventListener('change', onEnv);
      } catch (_) {}
      containerEl.innerHTML = '';
    }
  };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch7_kkt_consumer_inequality'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch7_kkt_consumer_inequality');
      }
    } catch (e) {
      console.error('Failed to register animation ch7_kkt_consumer_inequality', e);
    }
  })();

  // ch7_lagrange_tangency.js
  (function(){
    // Chapter 7: Lagrange Tangency (module skeleton)
// Public API: init(containerEl, options) -> { destroy }
// This is a minimal scaffold to verify module loading. We'll wire the full logic next.

function init(containerEl, options = {}) {
  if (!containerEl) return { destroy() {} };

  const defaultI = 100;
  const defaultU = defaultI / (2 * Math.sqrt(6)); // ≈ 20.41
  const state = {
    fbar: Number.isFinite(+options.initialFbar) ? +options.initialFbar : defaultU,
    c: Number.isFinite(+options.initialC) ? +options.initialC : defaultI,
    l: Number.isFinite(+options.initialL) ? +options.initialL : 0.5,
  };

  // --- Helpers to draw axes and ticks ---
  function drawLeftAxesAndTicks() {
    // Clear
    leftAxesG.innerHTML = '';
    leftTicksG.innerHTML = '';
    // Axes lines (x and y)
    const xAxis = createSvg('line'); xAxis.setAttribute('x1', '0'); xAxis.setAttribute('y1', '0'); xAxis.setAttribute('x2', String(LEFT_XMAX_FIXED)); xAxis.setAttribute('y2', '0'); xAxis.setAttribute('vector-effect','non-scaling-stroke'); xAxis.setAttribute('stroke-width','2');
    const yAxis = createSvg('line'); yAxis.setAttribute('x1', '0'); yAxis.setAttribute('y1', '0'); yAxis.setAttribute('x2', '0'); yAxis.setAttribute('y2', String(LEFT_YMAX_FIXED)); yAxis.setAttribute('vector-effect','non-scaling-stroke'); yAxis.setAttribute('stroke-width','2');
    leftAxesG.appendChild(xAxis); leftAxesG.appendChild(yAxis);
    // Ticks every 10 units
    for (let xv = 10; xv <= 100; xv += 10) {
      const t = createSvg('line'); t.setAttribute('x1', String(xv)); t.setAttribute('y1', '-2'); t.setAttribute('x2', String(xv)); t.setAttribute('y2', '2'); t.setAttribute('vector-effect','non-scaling-stroke'); t.setAttribute('stroke-width','1.2'); leftTicksG.appendChild(t);
      const lab = createSvg('text'); lab.setAttribute('x', String(xv - 2)); lab.setAttribute('y', '6'); lab.setAttribute('font-size', '2.2'); lab.setAttribute('fill', 'var(--text-secondary)'); lab.textContent = String(xv); leftTicksG.appendChild(lab);
    }
    for (let yv = 10; yv <= 70; yv += 10) {
      const t = createSvg('line'); t.setAttribute('x1', '-2'); t.setAttribute('y1', String(yv)); t.setAttribute('x2', '2'); t.setAttribute('y2', String(yv)); t.setAttribute('vector-effect','non-scaling-stroke'); t.setAttribute('stroke-width','1.2'); leftTicksG.appendChild(t);
      const lab = createSvg('text'); lab.setAttribute('x', '3'); lab.setAttribute('y', String(yv + 3)); lab.setAttribute('font-size', '2.2'); lab.setAttribute('fill', 'var(--text-secondary)'); lab.textContent = String(yv); leftTicksG.appendChild(lab);
    }
    // Axis labels
    const xlab = createSvg('text'); xlab.setAttribute('x', String(LEFT_XMAX_FIXED - 8)); xlab.setAttribute('y', '8'); xlab.setAttribute('font-size', '2.6'); xlab.setAttribute('fill', 'var(--text-secondary)'); xlab.textContent = 'x'; leftTicksG.appendChild(xlab);
    const ylab = createSvg('text'); ylab.setAttribute('x', '3'); ylab.setAttribute('y', String(LEFT_YMAX_FIXED - 3)); ylab.setAttribute('font-size', '2.6'); ylab.setAttribute('fill', 'var(--text-secondary)'); ylab.textContent = 'y'; leftTicksG.appendChild(ylab);
  }

  function drawRightAxesAndTicks(yMin, yMax, uMax) {
    rightAxesG.innerHTML = '';
    rightTicksG.innerHTML = '';
    // Axes lines with small padding so they are not clipped at the edges
    const axisPadX = RIGHT_XMAX_FIXED * 0.012; // ~1.32 units
    const axisPadY = (yMax - yMin) * 0.02;     // 2% of height
    const xAxisY = yMin + axisPadY;
    const yAxisX = axisPadX;
    const xAxis = createSvg('line'); xAxis.setAttribute('x1', '0'); xAxis.setAttribute('y1', String(xAxisY)); xAxis.setAttribute('x2', String(RIGHT_XMAX_FIXED)); xAxis.setAttribute('y2', String(xAxisY)); xAxis.setAttribute('vector-effect','non-scaling-stroke'); xAxis.setAttribute('stroke-width','2'); rightAxesG.appendChild(xAxis);
    const yAxis = createSvg('line'); yAxis.setAttribute('x1', String(yAxisX)); yAxis.setAttribute('y1', String(yMin)); yAxis.setAttribute('x2', String(yAxisX)); yAxis.setAttribute('y2', String(yMax)); yAxis.setAttribute('vector-effect','non-scaling-stroke'); yAxis.setAttribute('stroke-width','2'); rightAxesG.appendChild(yAxis);
    // x ticks at 0,0.25,0.5,0.75,1
    const xticks = [0, 0.25, 0.5, 0.75, 1];
    xticks.forEach((v) => {
      const xPos = v * RIGHT_XMAX_FIXED;
      const t = createSvg('line'); t.setAttribute('x1', String(xPos)); t.setAttribute('y1', String(xAxisY)); t.setAttribute('x2', String(xPos)); t.setAttribute('y2', String(xAxisY + (yMax - yMin) * 0.04)); t.setAttribute('vector-effect','non-scaling-stroke'); t.setAttribute('stroke-width','1.2'); rightTicksG.appendChild(t);
      const lab = createSvg('text'); lab.setAttribute('x', String(xPos - 1.5)); lab.setAttribute('y', String(xAxisY + (yMax - yMin) * 0.10)); lab.setAttribute('font-size', '2.2'); lab.setAttribute('fill', 'var(--text-secondary)'); lab.textContent = String(v); rightTicksG.appendChild(lab);
    });
    // y ticks: draw at U values (0..uMax), positioned at y=-U
    const ySteps = 4;
    for (let i = 1; i <= ySteps; i++) {
      const Uv = (uMax * i) / ySteps;      // evenly spaced in U
      const yPos = -Uv;                    // convert to plotted y
      const t = createSvg('line'); t.setAttribute('x1', String(yAxisX - 0.8)); t.setAttribute('y1', String(yPos)); t.setAttribute('x2', String(yAxisX + 0.8)); t.setAttribute('y2', String(yPos)); t.setAttribute('vector-effect','non-scaling-stroke'); t.setAttribute('stroke-width','1.2'); rightTicksG.appendChild(t);
      const lab = createSvg('text'); lab.setAttribute('x', String(yAxisX + 1.2)); lab.setAttribute('y', String(yPos + (yMax - yMin) * 0.03)); lab.setAttribute('font-size', '2.2'); lab.setAttribute('fill', 'var(--text-secondary)'); lab.textContent = Uv.toFixed(1);
      rightTicksG.appendChild(lab);
    }
    // Axis labels
    const xlab = createSvg('text'); xlab.setAttribute('x', String(RIGHT_XMAX_FIXED - 4)); xlab.setAttribute('y', String(xAxisY + (yMax - yMin) * 0.12)); xlab.setAttribute('font-size', '2.6'); xlab.setAttribute('fill', 'var(--text-secondary)'); xlab.textContent = 'l'; rightTicksG.appendChild(xlab);
    const ylab = createSvg('text'); ylab.setAttribute('x', String(yAxisX + 0.5)); ylab.setAttribute('y', String(yMax - (yMax - yMin) * 0.05)); ylab.setAttribute('font-size', '2.6'); ylab.setAttribute('fill', 'var(--text-secondary)'); ylab.textContent = 'U'; rightTicksG.appendChild(ylab);
  }

  // Basic scaffold UI so we can see it mounts
  containerEl.innerHTML = `
    <div class="anim anim--module" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; gap:1rem; align-items:center; flex-wrap:wrap; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <label title="Utility level set U(x,y)=Ū" style="display:flex; align-items:center; gap:0.5rem; min-width:260px;">
          <span style="min-width:9ch; text-align:right;">Utility Ū</span>
          <input data-role="fbar" type="range" min="0.1" max="100" step="0.1" value="${state.fbar}" aria-label="Choose U-bar (utility level)" />
        </label>
        <label title="Income I for budget 2x+3y=I" style="display:flex; align-items:center; gap:0.5rem; min-width:260px;">
          <span style="min-width:9ch; text-align:right;">Income I</span>
          <input data-role="c" type="range" min="50" max="200" step="1" value="${Math.max(50, Math.min(200, state.c))}" aria-label="Income I for budget 2x+3y=I" />
        </label>
        <label title="Position along budget: l=0 at x=0, l=1 at x=I/2" style="display:flex; align-items:center; gap:0.5rem; min-width:260px;">
          <span style="min-width:9ch; text-align:right;">Position l</span>
          <input data-role="l" type="range" min="0" max="1" step="0.01" value="${Number.isFinite(state.l) ? state.l : 0.5}" aria-label="Parameter l ∈ [0,1] to move along budget from x=0 to x=I/2" />
        </label>
        <div role="status" aria-live="polite" data-role="live" style="color: var(--text-secondary);"></div>
      </div>

      <div class="anim__title" data-role="title" style="margin:0.4rem 0 0.2rem 0; font-weight:600; color: var(--text-secondary);">
        Consumer choice: maximize U(x,y)=√(xy) subject to budget 2x+3y=I
      </div>

      <div class="anim__canvases" style="margin-top:0.5rem; display:flex; gap:1rem; flex-wrap:wrap;">
        <div style="flex:1 1 420px; min-width:320px;">
          <svg data-role="left" viewBox="0 0 110 75" preserveAspectRatio="none" width="100%" height="360" aria-label="Left: x–y plane (first quadrant)">
            <g data-role="left-axes" stroke="var(--text-secondary)" stroke-width="0.30"></g>
            <g data-role="left-ticks" fill="var(--text-secondary)" stroke="var(--text-secondary)" stroke-width="0.20"></g>
          </svg>
        </div>
        <div style="flex:1 1 420px; min-width:320px;">
          <svg data-role="right" viewBox="0 -10 110 20" preserveAspectRatio="xMidYMid meet" width="100%" height="360" aria-label="Right: U(l) with l in [0,1]">
            <g data-role="right-axes" stroke="var(--text-secondary)" stroke-width="0.30"></g>
            <g data-role="right-ticks" fill="var(--text-secondary)" stroke="var(--text-secondary)" stroke-width="0.20"></g>
          </svg>
        </div>
      </div>

      <div class="anim__legend" style="margin-top:0.35rem; display:flex; gap:1.25rem; flex-wrap:wrap; color: var(--text-secondary);">
        <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:18px; height:3px; background:#0B6FFF;"></span>Utility level set U(x,y)=Ū</span>
        <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:18px; height:3px; background:#EF476F;"></span>Budget 2x + 3y = I</span>
        <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:10px; height:10px; background:#1F2937; border-radius:50%;"></span>Current bundle (x,y)</span>
        <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:18px; height:3px; background:repeating-linear-gradient(90deg,#0B6FFF 0,#0B6FFF 6px,transparent 6px,transparent 12px);"></span>∇U at current bundle</span>
        <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:18px; height:3px; background:repeating-linear-gradient(90deg,#EF476F 0,#EF476F 6px,transparent 6px,transparent 12px);"></span>∇g at current bundle</span>
      </div>

      <div class="anim__readout" data-role="readout" style="margin-top:0.2rem; color: var(--text-secondary); line-height:1.35;"></div>

      <div class="anim__subtitle" data-role="subtitle" style="margin-top:0.4rem; color: var(--text-secondary); line-height:1.35;">
        <div><strong>Left:</strong> First-quadrant x–y plane showing the budget line <em>2x + 3y = I</em> (red) and a utility level set <em>U(x,y)=Ū</em> (blue). The dark point moves along the budget as <em>l</em> changes.</div>
        <div><strong>Right:</strong> Utility along the budget, <em>U(l)</em>, with the peak indicating the maximizing bundle. Axes show <em>l ∈ [0,1]</em> and <em>U ≥ 0</em>.</div>
      </div>
    </div>
  `;

  const live = containerEl.querySelector('[data-role=live]');
  const setLive = (msg) => { if (live) live.textContent = msg; };

  const fbarEl = containerEl.querySelector('input[data-role=fbar]');
  const cEl = containerEl.querySelector('input[data-role=c]');
  const lEl = containerEl.querySelector('input[data-role=l]');

  // SVG helpers
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const createSvg = (tag) => document.createElementNS(SVG_NS, tag);
  const left = containerEl.querySelector('svg[data-role=left]');
  const right = containerEl.querySelector('svg[data-role=right]');
  const titleEl = containerEl.querySelector('[data-role=title]');
  const subtitleEl = containerEl.querySelector('[data-role=subtitle]');
  const leftAxesG = left.querySelector('[data-role=left-axes]');
  const leftTicksG = left.querySelector('[data-role=left-ticks]');
  const rightAxesG = right.querySelector('[data-role=right-axes]');
  const rightTicksG = right.querySelector('[data-role=right-ticks]');
  const readoutEl = containerEl.querySelector('[data-role=readout]');
  // Group to render the right plot flipped vertically (so higher U appears higher)
  const rightPlotG = createSvg('g');
  // Improve crispness and line style on groups
  ;[leftAxesG, leftTicksG, rightAxesG, rightTicksG].forEach(g => {
    if (!g) return;
    try {
      g.setAttribute('stroke-linecap', 'butt');
      g.setAttribute('shape-rendering', 'crispEdges');
    } catch (_) {}
  });

  // Left plot primitives
  // Level set path for U(x,y) = sqrt(x*y) -> y = Ubar^2 / x (x>0), drawn over the full left viewport
  const levelset = createSvg('path');
  levelset.setAttribute('data-role', 'levelset');
  levelset.setAttribute('fill', 'none');
  levelset.setAttribute('stroke', '#0B6FFF');
  levelset.setAttribute('stroke-width', '2');
  levelset.setAttribute('vector-effect','non-scaling-stroke');

  const constraint = createSvg('path');
  constraint.setAttribute('data-role', 'constraint');
  constraint.setAttribute('fill', 'none');
  constraint.setAttribute('stroke', '#EF476F');
  constraint.setAttribute('stroke-width', '2');
  constraint.setAttribute('vector-effect','non-scaling-stroke');

  const lpoint = createSvg('circle');
  lpoint.setAttribute('data-role', 'lpoint');
  lpoint.setAttribute('r', '0.3');
  lpoint.setAttribute('fill', '#1F2937');
  lpoint.setAttribute('stroke', '#1F2937');

  // No in-plot labels; we render titles/subtitles outside the SVGs.

  left.appendChild(constraint);
  left.appendChild(levelset);
  left.appendChild(lpoint);

  // No in-SVG legend; legend is rendered outside below the plots.

  // Tangency visuals (left plot): optimal level set U*, tangency ring, and gradient arrows
  const optLevelset = createSvg('path');
  optLevelset.setAttribute('data-role', 'opt-levelset');
  optLevelset.setAttribute('fill', 'none');
  optLevelset.setAttribute('stroke', '#0B6FFF');
  optLevelset.setAttribute('stroke-dasharray', '2 1');
  optLevelset.setAttribute('stroke-width', '2');
  optLevelset.setAttribute('vector-effect','non-scaling-stroke');

  const optPoint = createSvg('circle');
  optPoint.setAttribute('data-role', 'opt-point');
  optPoint.setAttribute('r', '0.45');
  optPoint.setAttribute('fill', 'none');
  optPoint.setAttribute('stroke', '#1F2937');
  optPoint.setAttribute('stroke-width', '0.35');
  optPoint.setAttribute('vector-effect','non-scaling-stroke');

  const gradU = createSvg('line');
  gradU.setAttribute('data-role', 'grad-u');
  gradU.setAttribute('stroke', '#0B6FFF');
  gradU.setAttribute('stroke-width', '1.6');
  gradU.setAttribute('vector-effect','non-scaling-stroke');
  gradU.setAttribute('stroke-dasharray', '2 2');

  const gradG = createSvg('line');
  gradG.setAttribute('data-role', 'grad-g');
  gradG.setAttribute('stroke', '#EF476F');
  gradG.setAttribute('stroke-width', '1.6');
  gradG.setAttribute('vector-effect','non-scaling-stroke');
  gradG.setAttribute('stroke-dasharray', '2 2');
  gradG.setAttribute('opacity', '0.8');

  left.appendChild(optLevelset);
  left.appendChild(optPoint);
  left.appendChild(gradU);
  left.appendChild(gradG);

  // Right plot primitives
  const fpath = createSvg('path');
  fpath.setAttribute('data-role', 'fplot');
  fpath.setAttribute('fill', 'none');
  fpath.setAttribute('stroke', '#0B6FFF');
  fpath.setAttribute('stroke-width', '2');
  fpath.setAttribute('vector-effect','non-scaling-stroke');

  const fpoint = createSvg('circle');
  fpoint.setAttribute('data-role', 'fpoint');
  fpoint.setAttribute('r', '0.3');
  fpoint.setAttribute('fill', '#1F2937');
  fpoint.setAttribute('stroke', '#1F2937');

  // No in-plot labels; we render titles/subtitles outside the SVGs.

  right.appendChild(rightPlotG);
  rightPlotG.appendChild(fpath);
  rightPlotG.appendChild(fpoint);

  // Right plot tangency visuals: vertical line at l*=0.5 and ring at the peak
  const rightOptLine = createSvg('line');
  rightOptLine.setAttribute('data-role', 'right-opt-line');
  rightOptLine.setAttribute('stroke', 'var(--text-secondary)');
  rightOptLine.setAttribute('stroke-width', '0.20');
  rightOptLine.setAttribute('stroke-dasharray', '3 2');
  rightOptLine.setAttribute('opacity', '0.6');
  rightOptLine.setAttribute('vector-effect','non-scaling-stroke');

  const rightOptPoint = createSvg('circle');
  rightOptPoint.setAttribute('data-role', 'right-opt-point');
  rightOptPoint.setAttribute('r', '0.35');
  rightOptPoint.setAttribute('fill', 'none');
  rightOptPoint.setAttribute('stroke', '#1F2937');
  rightOptPoint.setAttribute('stroke-width', '0.30');
  rightOptPoint.setAttribute('vector-effect','non-scaling-stroke');

  right.appendChild(rightOptLine);
  right.appendChild(rightOptPoint);

  // Drawing helpers
  const XMAX = 3; // unused for consumer mapping but kept for reference
  const LEFT_XMAX_FIXED = 110; // fits x ∈ [0, 100] + padding for I ∈ [50,200]
  const LEFT_YMAX_FIXED = 75;  // fits y up to ~ I/3 ≈ 66.7 + padding for I max
  const RIGHT_XMAX_FIXED = 110; // make right plot horizontally match left plot
  const buildConstraintPath = (I) => {
    // Budget: 2x + 3y = I => y = (I - 2x)/3 for x in [0, I/2]
    const xMin = 0;
    const xMax = Math.max(0, I / 2);
    let d = '';
    let first = true;
    for (let x = xMin; x <= xMax + 1e-6; x += Math.max(0.2, (xMax - xMin) / 200)) {
      const y = (I - 2 * x) / 3;
      d += (first ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2) + ' ';
      first = false;
    }
    return d;
  };

  const buildLevelsetPath = (Ubar) => {
    // y = Ubar^2 / x (x>0). Draw across the full left viewport, trimmed to first quadrant.
    const U2 = Math.max(0, Ubar * Ubar);
    const xMax = LEFT_XMAX_FIXED - 1;
    const yCap = LEFT_YMAX_FIXED * 0.95; // slightly below top
    let xMin = Math.max(0.3, U2 > 0 ? (U2 / yCap) : 0.3);
    // Ensure we always have a drawable span
    if (xMin >= xMax) {
      xMin = Math.max(0.3, xMax - 0.5);
    }
    let d = '';
    let first = true;
    for (let x = xMin; x <= xMax + 1e-6; x += Math.max(0.2, (xMax - xMin) / 200)) {
      const y = U2 / x;
      if (y < 0) continue; // only first quadrant
      d += (first ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2) + ' ';
      first = false;
    }
    return d;
  };

  const update = () => {
    // Left: level set hyperbola and budget line + moving point (first quadrant)
    const Ubar = Math.max(0, state.fbar);
    levelset.setAttribute('d', buildLevelsetPath(Ubar));
    constraint.setAttribute('d', buildConstraintPath(state.c));
    // Map l in [0,1] to x in [0, I/2]
    const xMinL = 0;
    const xMaxL = Math.max(0, state.c / 2);
    const xL = xMinL + (Math.max(0, Math.min(1, state.l))) * (xMaxL - xMinL);
    const yL = (state.c - 2 * xL) / 3;
    lpoint.setAttribute('cx', String(xL));
    lpoint.setAttribute('cy', String(yL));
    // Fixed left viewBox focused on first quadrant (do not rescale with income)
    left.setAttribute('viewBox', '0 0 ' + LEFT_XMAX_FIXED + ' ' + LEFT_YMAX_FIXED);
    if (titleEl) {
      titleEl.textContent = 'Consumer choice: maximize U(x,y)=√(xy) subject to 2x+3y=I';
    }

    // Draw left axes and ticks
    drawLeftAxesAndTicks();

    // Right: U(l) path and point; plot y = -U so maxima appear at the top,
    // and label ticks with positive |y| values.
    let dR = '';
    let first = true;
    let minF = Infinity, maxF = -Infinity;
    for (let ll = 0; ll <= 1.0001; ll += 0.01) {
      const xx = xMinL + ll * (xMaxL - xMinL);
      const yy = (state.c - 2 * xx) / 3;
      const f = Math.max(0, Math.sqrt(Math.max(0, xx)) * Math.sqrt(Math.max(0, yy))); // U(x,y)
      if (f < minF) minF = f;
      if (f > maxF) maxF = f;
      const xPlot = ll * RIGHT_XMAX_FIXED;
      dR += (first ? 'M' : 'L') + xPlot.toFixed(2) + ' ' + (-f).toFixed(3) + ' ';
      first = false;
    }
    const margin = Math.max(0.5, (maxF - minF) * 0.15);
    const dataMin = -(maxF + margin);
    const dataMax = -(minF - margin);
    const dataHeight = dataMax - dataMin;
    // Compute target viewBox height to exactly match the element aspect ratio
    let targetHeight = dataHeight;
    try {
      const rect = right.getBoundingClientRect();
      if (rect && rect.width > 0 && rect.height > 0) {
        const targetAspect = rect.width / rect.height; // width/height
        targetHeight = RIGHT_XMAX_FIXED / targetAspect; // viewBox height to match rendered ratio
      }
    } catch (_) {}
    // Center the data range within the target height so all content is visible without stretch
    const dataCenter = (dataMin + dataMax) / 2;
    const yMin = dataCenter - targetHeight / 2;
    const yMax = yMin + targetHeight;
    const yHeight = targetHeight;
    right.setAttribute('viewBox', '0 ' + yMin + ' ' + RIGHT_XMAX_FIXED + ' ' + yHeight);
    fpath.setAttribute('d', dR);
    const fCur = Math.max(0, Math.sqrt(Math.max(0, xL)) * Math.sqrt(Math.max(0, yL)));
    fpoint.setAttribute('cx', String(Math.max(0, Math.min(1, state.l)) * RIGHT_XMAX_FIXED));
    fpoint.setAttribute('cy', String(-fCur));
    // Keep same marker style as left plot
    try { fpoint.setAttribute('r', '0.3'); } catch (_) {}
    if (subtitleEl) {
      subtitleEl.innerHTML = '<div><strong>Left:</strong> Budget 2x+3y=I (red), level set U(x,y)=Ū (blue), and the two gradient vectors anchored at the current bundle: ∇U (blue) and ∇g (red dashed). As you move l, the arrows align at tangency.</div>'+
        '<div><strong>Right:</strong> Utility U(l) along the budget; move l to where the left arrows align to see the maximizer.</div>';
    }

    if (readoutEl) {
      const lDisp = Math.max(0, Math.min(1, state.l)).toFixed(2);
      const html = [
        '<div><strong>Parameters:</strong> I = ' + state.c.toFixed(0) + ', Ū = ' + Ubar.toFixed(2) + ', l = ' + lDisp + '</div>',
        '<div><strong>Bundle:</strong> x = ' + xL.toFixed(2) + ', y = ' + yL.toFixed(2) + '</div>',
        '<div><strong>Utility:</strong> U(x,y) = ' + fCur.toFixed(2) + '</div>'
      ].join('');
      readoutEl.innerHTML = html;
    }

    // Draw right axes and ticks with uMax = maxF so y tick labels show correct U values
    drawRightAxesAndTicks(yMin, yMin + yHeight, maxF);

    // Hide previous "optimal" decorations; focus only on gradients at the current bundle
    const xOpt = state.c / 4; // kept for reference
    const yOpt = state.c / 6; // kept for reference
    const Uopt = Math.sqrt(Math.max(0, xOpt) * Math.max(0, yOpt));
    if (optLevelset) optLevelset.setAttribute('visibility', 'hidden');
    if (optPoint) optPoint.setAttribute('visibility', 'hidden');

    // Left gradients
    // ∇U at current bundle (xL, yL)
    const arrowLen = 6; // visible length in left plot units
    if (gradU) {
      if (xL > 0 && yL > 0) {
        const guxL = 0.5 * Math.sqrt(yL / xL);
        const guyL = 0.5 * Math.sqrt(xL / yL);
        const nUL = Math.hypot(guxL, guyL) || 1;
        gradU.setAttribute('x1', String(xL));
        gradU.setAttribute('y1', String(yL));
        gradU.setAttribute('x2', String(xL + (guxL / nUL) * arrowLen));
        gradU.setAttribute('y2', String(yL + (guyL / nUL) * arrowLen));
        gradU.setAttribute('visibility', 'visible');
      } else {
        gradU.setAttribute('visibility', 'hidden');
      }
    }
    // ∇g at current bundle (xL, yL)
    if (gradG) {
      if (xL > 0 && yL > 0) {
        const ggx = 2, ggy = 3; // ∇g for 2x+3y=I
        const nG = Math.hypot(ggx, ggy) || 1;
        gradG.setAttribute('x1', String(xL));
        gradG.setAttribute('y1', String(yL));
        gradG.setAttribute('x2', String(xL + (ggx / nG) * arrowLen));
        gradG.setAttribute('y2', String(yL + (ggy / nG) * arrowLen));
        gradG.setAttribute('visibility', 'visible');
      } else {
        gradG.setAttribute('visibility', 'hidden');
      }
    }

    // Right: hide previous optimal markers; U(l) alone with current point is enough
    if (rightOptLine) rightOptLine.setAttribute('visibility', 'hidden');
    if (rightOptPoint) rightOptPoint.setAttribute('visibility', 'hidden');

    // Extend readout with alignment info (angle between ∇U and ∇g)
    if (readoutEl) {
      const lDisp = Math.max(0, Math.min(1, state.l)).toFixed(2);
      let angleDeg = null;
      if (xL > 0 && yL > 0) {
        const gux = 0.5 * Math.sqrt(yL / xL);
        const guy = 0.5 * Math.sqrt(xL / yL);
        const ggx = 2, ggy = 3;
        const dot = gux * ggx + guy * ggy;
        const nU = Math.hypot(gux, guy) || 1;
        const nG = Math.hypot(ggx, ggy) || 1;
        const cosT = Math.max(-1, Math.min(1, dot / (nU * nG)));
        angleDeg = Math.acos(cosT) * 180 / Math.PI;
      }
      const html = [
        '<div><strong>Parameters:</strong> I = ' + state.c.toFixed(0) + ', Ū = ' + Ubar.toFixed(2) + ', l = ' + lDisp + '</div>',
        '<div><strong>Bundle:</strong> x = ' + xL.toFixed(2) + ', y = ' + yL.toFixed(2) + '</div>',
        '<div><strong>Utility:</strong> U(x,y) = ' + fCur.toFixed(2) + '</div>',
        '<div><strong>Alignment:</strong> angle(∇U, ∇g) = ' + (angleDeg != null ? angleDeg.toFixed(1) + '°' : '—') + '</div>'
      ].join('');
      readoutEl.innerHTML = html;
    }

    setLive('Updated: Ū=' + Ubar.toFixed(2) + ', I=' + state.c.toFixed(0) + ', l=' + state.l.toFixed(2));
  };

  const onFbar = () => {
    state.fbar = +fbarEl.value;
    update();
  };

  const onC = () => {
    state.c = +cEl.value;
    update();
  };

  const onL = () => {
    state.l = +lEl.value; // l in [0,1]
    const xMinL = 0;
    const xMaxL = Math.max(0, state.c / 2);
    const xL = xMinL + Math.max(0, Math.min(1, state.l)) * (xMaxL - xMinL);
    const yL = (state.c - 2 * xL) / 3;
    const fCur = Math.max(0, Math.sqrt(Math.max(0, xL)) * Math.sqrt(Math.max(0, yL)));
    state.fbar = fCur;
    try { fbarEl.value = String(fCur.toFixed(3)); } catch (_) {}
    update();
  };

  fbarEl.addEventListener('input', onFbar);
  cEl.addEventListener('input', onC);
  lEl.addEventListener('input', onL);

  // Initial announce
  update();

  return {
    destroy() {
      try {
        fbarEl.removeEventListener('input', onFbar);
        cEl.removeEventListener('input', onC);
        lEl.removeEventListener('input', onL);
      } catch (_) {}
      containerEl.innerHTML = '';
    }
  };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch7_lagrange_tangency'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch7_lagrange_tangency');
      }
    } catch (e) {
      console.error('Failed to register animation ch7_lagrange_tangency', e);
    }
  })();

  // ch7_lagrange_tangency_plot.js
  (function(){
    // Chapter 7: Lagrange Tangency — Observable Plot renderer
// Public API: init(containerEl, options) -> { destroy }
// Visual goals: minimal, elegant, lightweight; single panel with budget, indifference, and current point.
// Framework: Observable Plot (SVG). Loaded globally via CDN as window.Plot.

function init(containerEl, options = {}) {
  if (!containerEl) return { destroy() {} };

  // State: keep it simple — only Income I and path position l in [0,1].
  const defaultI = 100;
  const state = {
    c: Number.isFinite(+options.initialC) ? +options.initialC : defaultI,
    l: Number.isFinite(+options.initialL) ? +options.initialL : 0.5,
    u: Number.isFinite(+options.initialU) ? +options.initialU : null, // utility level slider (initialized on first render)
  };

  // Build minimal UI
  containerEl.innerHTML = `
    <div class="anim anim--plot" style="margin:0.75rem 0;">
      <div class="anim__controls" style="display:flex; gap:1rem; align-items:center; flex-wrap:wrap; border:1px solid var(--border-color); border-radius:0.5rem; padding:0.6rem 0.9rem;">
        <label title="Utility level Ū for the highlighted level set" style="display:flex; align-items:center; gap:0.5rem; min-width:300px;">
          <span style="min-width:8ch; text-align:right; color: var(--text-secondary);">Ū (level)</span>
          <input data-role="u" type="range" min="0" max="100" step="0.1" value="0" aria-label="Utility level U-bar to draw U(x,y)=U-bar" />
          <span data-role="u-val" style="min-width:6ch; text-align:right; color: var(--text-secondary);">0.0</span>
        </label>
        <label title="Income I for budget 2x+3y=I" style="display:flex; align-items:center; gap:0.5rem; min-width:240px;">
          <span style="min-width:8ch; text-align:right; color: var(--text-secondary);">Income I</span>
          <input data-role="c" type="range" min="50" max="200" step="1" value="${Math.max(50, Math.min(200, state.c))}" aria-label="Income I for budget 2x+3y=I" />
        </label>
        <label title="Position along budget: l=0 at x=0, l=1 at x=I/2" style="display:flex; align-items:center; gap:0.5rem; min-width:240px;">
          <span style="min-width:8ch; text-align:right; color: var(--text-secondary);">Position l</span>
          <input data-role="l" type="range" min="0" max="1" step="0.01" value="${Number.isFinite(state.l) ? state.l : 0.5}" aria-label="Parameter l ∈ [0,1] to move along budget from x=0 to x=I/2" />
        </label>
        <div role="status" aria-live="polite" data-role="live" style="color: var(--text-secondary);"></div>
      </div>
      <div class="anim__canvases" style="margin-top:0.6rem; display:flex; gap:1rem; flex-wrap:wrap;">
        <div style="flex:1 1 420px; min-width:320px;">
          <div class="anim__title" style="font-weight:600; color: var(--text-secondary); margin-bottom:0.25rem;">Tangency in x–y plane</div>
          <div class="anim__canvas" data-role="plot-left"></div>
          <div class="anim__caption" style="margin-top:0.35rem; color: var(--text-secondary);">
            Left: Budget 2x+3y=I (teal), indifference through bundle (coral), bundle (dot), ∇U (blue dashed), ∇g (red dashed).
          </div>
          <div class="anim__legend" style="margin-top:0.35rem; display:flex; gap:1rem; flex-wrap:wrap; color: var(--text-secondary);">
            <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:18px; height:3px; background:linear-gradient(90deg,#94a3b8,#64748b,#334155);"></span>U level sets (faint)</span>
            <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:18px; height:3px; background:#2a9d8f;"></span>Budget</span>
            <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:18px; height:3px; background:#e76f51;"></span>Indifference</span>
            <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:18px; height:3px; background:#6f42c1;"></span>Ū (slider)</span>
            <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:18px; height:3px; background:repeating-linear-gradient(90deg,#0B6FFF 0,#0B6FFF 6px,transparent 6px,transparent 12px);"></span>∇U</span>
            <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:18px; height:3px; background:repeating-linear-gradient(90deg,#EF476F 0,#EF476F 6px,transparent 6px,transparent 12px);"></span>∇g</span>
            <span style="display:inline-flex; align-items:center; gap:0.4rem;"><span style="display:inline-block; width:10px; height:10px; background:#1f2937; border-radius:50%; outline:2px solid white; outline-offset: -2px;"></span>Bundle</span>
          </div>
        </div>
        <div style="flex:1 1 420px; min-width:320px;">
          <div class="anim__title" style="font-weight:600; color: var(--text-secondary); margin-bottom:0.25rem;">Utility along the budget U(l)</div>
          <div class="anim__canvas" data-role="plot-right"></div>
          <div class="anim__caption" style="margin-top:0.35rem; color: var(--text-secondary);">
            Right: U(l) along budget with current l (dot and faint guide).
          </div>
        </div>
      </div>
      <div class="anim__subtitle" style="margin-top:0.5rem; color: var(--text-secondary);">
        The optimum occurs where the indifference curve is tangent to the budget: ∇U is parallel to ∇g in the left panel, and U(l) attains its maximum in the right panel.
      </div>
    </div>
  `;

  const live = containerEl.querySelector('[data-role=live]');
  const cEl = containerEl.querySelector('input[data-role=c]');
  const lEl = containerEl.querySelector('input[data-role=l]');
  const uEl = containerEl.querySelector('input[data-role=u]');
  const mountLeft = containerEl.querySelector('[data-role=plot-left]');
  const mountRight = containerEl.querySelector('[data-role=plot-right]');
  const uValEl = containerEl.querySelector('[data-role=u-val]');

  const announce = (msg) => { if (live) live.textContent = msg; };

  // Safety: ensure Plot is available
  const Plot = (window && window.Plot) ? window.Plot : null;
  if (!Plot) {
    if (mountLeft) mountLeft.innerHTML = '<div style="padding:0.75rem; color: var(--text-secondary);">Plot library not loaded. Please ensure Observable Plot is included.</div>';
    return { destroy() { containerEl.innerHTML = ''; } };
  }

  // Build a generic level set U(x,y)=Ubar (as y=Ubar^2/x) within the left plot bounds
  function buildLevelset(Ubar) {
    const U2 = Math.max(0, Ubar * Ubar);
    const XMAX = 110;
    const YMAX = 75;
    const xMin = Math.max(0.3, U2 > 0 ? (U2 / YMAX) : 0.3);
    const xMax = XMAX - 1;
    const pts = [];
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i * (xMax - xMin)) / steps;
      const y = U2 / x;
      if (y >= 0 && y <= YMAX) pts.push({ x, y });
    }
    return pts;
  }

  function computeCurrentPoint(c, l) {
    const xMinL = 0;
    const xMaxL = Math.max(0, c / 2);
    const ll = Math.max(0, Math.min(1, l));
    const x = xMinL + ll * (xMaxL - xMinL);
    const y = (c - 2 * x) / 3;
    return { x, y };
  }

  function buildBudget(c) {
    const xMax = Math.max(0, c / 2);
    const pts = [];
    const steps = 160;
    for (let i = 0; i <= steps; i++) {
      const x = (xMax * i) / steps;
      pts.push({ x, y: (c - 2 * x) / 3 });
    }
    return pts;
  }

  function buildIndiffThrough(x0, y0) {
    // U(x,y) = sqrt(xy) = U0 -> y = (U0^2)/x, x > 0
    const U0 = Math.sqrt(Math.max(0, x0) * Math.max(0, y0));
    const U2 = U0 * U0;
    const XMAX = 110; // match budget domain used in other visuals
    const YMAX = 75;
    const xMin = Math.max(0.3, U2 > 0 ? (U2 / YMAX) : 0.3);
    const xMax = XMAX - 1;
    const pts = [];
    const steps = 200;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + (i * (xMax - xMin)) / steps;
      const y = U2 / x;
      if (y >= 0 && y <= YMAX) pts.push({ x, y });
    }
    return pts;
  }

  let currentLeft = null;
  let currentRight = null;

  function render() {
    const c = +cEl.value;
    const l = +lEl.value;
    const pt = computeCurrentPoint(c, l);

    const budget = buildBudget(c);
    const indiff = buildIndiffThrough(pt.x, pt.y);

    // Compute gradient directions at the current bundle (no arrowheads; short dashed segments)
    let gradUSeg = [];
    let gradGSeg = [];
    if (pt.x > 0 && pt.y > 0) {
      const gux = 0.5 * Math.sqrt(pt.y / pt.x);
      const guy = 0.5 * Math.sqrt(pt.x / pt.y);
      const nU = Math.hypot(gux, guy) || 1;
      const len = 6; // left-plot units
      gradUSeg = [
        { x: pt.x, y: pt.y },
        { x: pt.x + (gux / nU) * len, y: pt.y + (guy / nU) * len }
      ];

      const ggx = 2, ggy = 3;
      const nG = Math.hypot(ggx, ggy) || 1;
      gradGSeg = [
        { x: pt.x, y: pt.y },
        { x: pt.x + (ggx / nG) * len, y: pt.y + (ggy / nG) * len }
      ];
    }

    // Initialize U slider range/value from current context if not set yet
    const fCur = Math.max(0, Math.sqrt(Math.max(0, pt.x)) * Math.sqrt(Math.max(0, pt.y)));
    if (state.u == null || !Number.isFinite(state.u)) {
      state.u = fCur;
    }
    if (uEl) {
      // Set reasonable max a bit above approximate max along budget
      const approxMax = Math.max(10, 0.235 * c) * 1.15;
      try {
        uEl.min = '0';
        uEl.max = String(approxMax.toFixed(1));
        uEl.step = '0.1';
        uEl.value = String(state.u.toFixed(1));
      } catch (_) {}
      if (uValEl) {
        try { uValEl.textContent = state.u.toFixed(1); } catch (_) {}
      }
    }

    // LEFT FIGURE: x–y plane
    const widthL = Math.min(720, Math.max(420, (mountLeft?.clientWidth || 560)));
    const heightL = Math.round(widthL * 0.64);

    // Background level sets (prominent, color-graded) — choose multiple levels up to an approximate max
    const UmaxApprox = Math.max(10, 0.235 * c); // slight tweak for visibility; close to true max c/(2*sqrt(3)) ≈ 0.2887c
    const L = 10; // number of background levels
    const t0 = 0.15, t1 = 1.0; // relative range of U from low to high
    const levels = Array.from({ length: L }, (_, i) => (t0 + (t1 - t0) * (i / (L - 1))) * UmaxApprox).filter(u => u > 1);
    const viridis = ['#440154','#482878','#3e4989','#31688e','#26828e','#1f9e89','#35b779','#6ece58','#b5de2b','#fde725'];
    const bgLevelSets = levels.map((u, i) => ({ pts: buildLevelset(u), col: viridis[Math.min(viridis.length - 1, i)] }));

    const highlight = state.u > 0 ? buildLevelset(state.u) : [];
    const labelPoint = (highlight && highlight.length > 0) ? highlight[Math.floor(highlight.length * 0.6)] : null;

    const leftFig = Plot.plot({
      width: widthL,
      height: heightL,
      marginLeft: 46,
      marginBottom: 44,
      x: { domain: [0, 110], grid: true },
      y: { domain: [0, 75], grid: true },
      style: { background: 'transparent', color: 'var(--text-secondary)' },
      marks: [
        // colored U-level sets
        ...bgLevelSets.map(({ pts, col }) => Plot.lineY(pts, { x: 'x', y: 'y', stroke: col, opacity: 0.2, strokeWidth: 1.5 })),
        // highlighted user-chosen level set U(x,y)=Ū
        (highlight && highlight.length > 0) ? Plot.lineY(highlight, { x: 'x', y: 'y', stroke: '#6f42c1', strokeWidth: 2.2, opacity: 0.9 }) : null,
        // label showing the numeric value of Ū
        (labelPoint) ? Plot.text([{ x: labelPoint.x, y: labelPoint.y, label: `Ū = ${state.u.toFixed(1)}` }], { x: 'x', y: 'y', text: 'label', fill: 'var(--text-secondary)', dy: -6, fontSize: 12 }) : null,
        Plot.lineY(budget, { x: 'x', y: 'y', stroke: '#2a9d8f', strokeWidth: 2 }),
        Plot.lineY(indiff, { x: 'x', y: 'y', stroke: '#e76f51', strokeWidth: 2 }),
        gradUSeg.length ? Plot.lineY(gradUSeg, { x: 'x', y: 'y', stroke: '#0B6FFF', strokeWidth: 1.6, strokeDasharray: '4 2', opacity: 0.9 }) : null,
        gradGSeg.length ? Plot.lineY(gradGSeg, { x: 'x', y: 'y', stroke: '#EF476F', strokeWidth: 1.6, strokeDasharray: '4 2', opacity: 0.8 }) : null,
        Plot.dot([pt], { x: 'x', y: 'y', r: 5, fill: '#1f2937', stroke: 'white', strokeWidth: 1.5 })
      ].filter(Boolean)
    });

    if (currentLeft) { try { currentLeft.remove(); } catch (_) {} }
    if (mountLeft) {
      mountLeft.innerHTML = '';
      mountLeft.appendChild(leftFig);
      currentLeft = leftFig;
    }

    // RIGHT FIGURE: U(l)
    const samples = [];
    let minU = Infinity, maxU = -Infinity;
    const xMaxL = Math.max(0, c / 2);
    for (let ll = 0; ll <= 1.0001; ll += 0.01) {
      const xx = 0 + ll * (xMaxL - 0);
      const yy = (c - 2 * xx) / 3;
      const UU = Math.max(0, Math.sqrt(Math.max(0, xx)) * Math.sqrt(Math.max(0, yy)));
      samples.push({ l: ll, U: UU });
      if (UU < minU) minU = UU;
      if (UU > maxU) maxU = UU;
    }
    const widthR = Math.min(720, Math.max(420, (mountRight?.clientWidth || 560)));
    const heightR = Math.round(widthR * 0.64);
    const guide = { l: l, U0: 0, U1: maxU };
    const rightFig = Plot.plot({
      width: widthR,
      height: heightR,
      marginLeft: 46,
      marginBottom: 44,
      x: { domain: [0, 1], grid: true },
      y: { domain: [0, Math.max(1, maxU * 1.1)], grid: true },
      style: { background: 'transparent', color: 'var(--text-secondary)' },
      marks: [
        Plot.lineY(samples, { x: 'l', y: 'U', stroke: '#0B6FFF', strokeWidth: 2 }),
        Plot.lineY([{ l: guide.l, U: guide.U0 }, { l: guide.l, U: guide.U1 }], { x: 'l', y: 'U', stroke: 'var(--text-secondary)', strokeDasharray: '3 3', opacity: 0.5 }),
        Plot.dot([{ l: l, U: Math.max(0, Math.sqrt(Math.max(0, pt.x)) * Math.sqrt(Math.max(0, pt.y))) }], { x: 'l', y: 'U', r: 5, fill: '#1f2937', stroke: 'white', strokeWidth: 1.5 })
      ]
    });

    if (currentRight) { try { currentRight.remove(); } catch (_) {} }
    if (mountRight) {
      mountRight.innerHTML = '';
      mountRight.appendChild(rightFig);
      currentRight = rightFig;
    }

    announce(`Updated: I=${c.toFixed(0)}, l=${(+l).toFixed(2)}; bundle (x=${pt.x.toFixed(2)}, y=${pt.y.toFixed(2)})`);
  }

  function onResize() { render(); }
  const ro = (window && 'ResizeObserver' in window) ? new ResizeObserver(render) : null;
  if (ro) {
    if (mountLeft) ro.observe(mountLeft);
    if (mountRight) ro.observe(mountRight);
  }

  const onC = () => render();
  const onL = () => render();
  const onU = () => { state.u = +uEl.value; render(); };
  cEl.addEventListener('input', onC);
  lEl.addEventListener('input', onL);
  if (uEl) uEl.addEventListener('input', onU);

  // Initial render
  render();

  return {
    destroy() {
      try {
        cEl.removeEventListener('input', onC);
        lEl.removeEventListener('input', onL);
        if (uEl) uEl.removeEventListener('input', onU);
        if (ro) ro.disconnect();
      } catch (_) {}
      if (mount) mount.innerHTML = '';
      containerEl.innerHTML = '';
    }
  };
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch7_lagrange_tangency_plot'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch7_lagrange_tangency_plot');
      }
    } catch (e) {
      console.error('Failed to register animation ch7_lagrange_tangency_plot', e);
    }
  })();

  // ch7_shadow_price.js
  (function(){
    // Chapter 7: Shadow Price / Envelope Check (dV/dI = λ)
// Public API: export function init(container, options)

function init(container, options = {}) {
    const state = {
      income: options.income || 100,
      showDelta: options.showDelta !== false,
      showLambda: options.showLambda !== false,
      deltaI: 1,
      width: 800,
      height: 400
    };

    const controls = document.createElement('div');
    controls.className = 'animation-controls';
    controls.innerHTML = `
      <label>Income I: <input type="range" id="income-slider" min="30" max="150" value="${state.income}" step="1"></label>
      <span id="income-value">${state.income}</span>
      <label><input type="checkbox" id="show-delta" ${state.showDelta ? 'checked' : ''}> Show finite difference ΔV</label>
      <label><input type="checkbox" id="show-lambda" ${state.showLambda ? 'checked' : ''}> Show λ</label>
    `;

    const canvas = document.createElement('div');
    canvas.id = 'shadow-price-plot';
    canvas.style.display = 'flex';
    canvas.style.gap = '20px';

    const infoDiv = document.createElement('div');
    infoDiv.id = 'shadow-price-info';
    infoDiv.style.marginTop = '10px';
    infoDiv.style.padding = '10px';
    infoDiv.style.background = '#f5f5f5';
    infoDiv.style.borderRadius = '4px';

    container.appendChild(controls);
    container.appendChild(canvas);
    container.appendChild(infoDiv);

    // Utility function: U(x,y) = sqrt(xy)
    // Budget: 2x + 3y = I
    // Solution: x* = I/4, y* = I/6, U* = I/(2√6), λ* = 1/(2√6)
    
    const solveOptimum = (I) => {
      const x = I / 4;
      const y = I / 6;
      const U = Math.sqrt(x * y);
      const lambda = 0.5 * Math.sqrt(y / x) / 2; // ∂U/∂x / p_x at optimum
      return { x, y, U, lambda };
    };

    const render = () => {
      const I = state.income;
      const current = solveOptimum(I);
      const next = solveOptimum(I + state.deltaI);
      
      const deltaV = next.U - current.U;
      const approxDeltaV = current.lambda * state.deltaI;

      // Panel A: Consumer problem
      const budgetData = Array.from({ length: 100 }, (_, i) => {
        const x = (i / 99) * (I / 2);
        const y = (I - 2*x) / 3;
        return { x, y };
      });

      // Utility contours to show the optimum is at tangency
      const contours = [];
      for (let factor of [0.5, 0.8, 1.0]) {
        const level = factor * current.U;
        if (level > 0) {
          const contour = Array.from({ length: 100 }, (_, i) => {
            const x = 0.5 + (i / 99) * (I / 2);
            const y = (level * level) / x;
            return { x, y };
          }).filter(p => p.y >= 0 && p.y <= I/3 * 1.3);
          contours.push(contour);
        }
      }

      const plotA = Plot.plot({
        width: 350,
        height: 350,
        marginLeft: 50,
        x: { domain: [0, I/2 * 1.2], label: "x" },
        y: { domain: [0, I/3 * 1.2], label: "y" },
        marks: [
          // Utility contours
          ...contours.map((c, idx) => 
            Plot.line(c, { 
              x: "x", 
              y: "y", 
              stroke: idx === contours.length - 1 ? "#00AA00" : "#90EE90", 
              strokeWidth: idx === contours.length - 1 ? 2 : 1,
              opacity: 0.7
            })
          ),
          Plot.line(budgetData, { x: "x", y: "y", stroke: "blue", strokeWidth: 2.5 }),
          Plot.dot([current], { x: "x", y: "y", r: 8, fill: "red" }),
          Plot.text([current], { 
            x: "x", 
            y: "y", 
            text: () => `★ (${current.x.toFixed(1)}, ${current.y.toFixed(1)})`,
            dy: -15,
            fontWeight: "bold"
          }),
          Plot.text([{x: I/4, y: I/3 * 1.05}], { 
            x: "x", 
            y: "y", 
            text: () => `Budget: 2x+3y=${I}`,
            fill: "blue",
            fontSize: 11
          }),
          Plot.text([{x: I/2 * 0.7, y: (current.U * current.U) / (I/2 * 0.7) + 2}], { 
            x: "x", 
            y: "y", 
            text: "Utility contours",
            fill: "#00AA00",
            fontSize: 10
          })
        ]
      });

      // Panel B: Value function
      const valueData = Array.from({ length: 100 }, (_, i) => {
        const income = 30 + (i / 99) * 120;
        const opt = solveOptimum(income);
        return { income, value: opt.U };
      });

      const tangentData = Array.from({ length: 20 }, (_, i) => {
        const income = I - 10 + (i / 19) * 20;
        const value = current.U + current.lambda * (income - I);
        return { income, value };
      });

      const marks = [
        Plot.line(valueData, { x: "income", y: "value", stroke: "green", strokeWidth: 2 }),
        Plot.dot([{ income: I, value: current.U }], { x: "income", y: "value", r: 6, fill: "red" })
      ];

      if (state.showLambda) {
        marks.push(
          Plot.line(tangentData, { x: "income", y: "value", stroke: "orange", strokeWidth: 3, strokeDasharray: "5,3" }),
          Plot.text([{ income: I + 18, value: current.U + current.lambda * 18 }], {
            x: "income",
            y: "value",
            text: () => `Tangent: slope = λ = ${current.lambda.toFixed(4)}`,
            fontSize: 12,
            fill: "orange",
            fontWeight: "bold"
          })
        );
      }

      if (state.showDelta) {
        const midY = (current.U + next.U) / 2;
        marks.push(
          Plot.dot([{ income: I + state.deltaI, value: next.U }], { x: "income", y: "value", r: 7, fill: "purple", stroke: "white", strokeWidth: 2 }),
          Plot.link([{ x1: I + state.deltaI, y1: current.U, x2: I + state.deltaI, y2: next.U }], {
            x1: "x1", y1: "y1", x2: "x2", y2: "y2",
            stroke: "purple",
            strokeWidth: 3,
            markerEnd: "arrow"
          }),
          Plot.text([{ income: I + state.deltaI + 5, value: midY }], {
            x: "income",
            y: "value",
            text: () => `ΔV = ${deltaV.toFixed(4)}`,
            fill: "purple",
            fontSize: 12,
            fontWeight: "bold"
          })
        );
      }

      const plotB = Plot.plot({
        width: 400,
        height: 350,
        marginLeft: 60,
        x: { domain: [30, 150], label: "Income I" },
        y: { label: "Value V(I)" },
        marks
      });

      // Update info div (don't create new one)
      infoDiv.innerHTML = `
        <strong>Envelope Identity:</strong> dV/dI = λ at the optimum<br>
        <strong>λ* = ${current.lambda.toFixed(4)}</strong> (marginal utility of income)<br>
        ${state.showDelta ? `<span style="color: purple;">Actual ΔV = ${deltaV.toFixed(4)}</span><br>` : ''}
        ${state.showDelta ? `<span style="color: orange;">Predicted λ·ΔI = ${approxDeltaV.toFixed(4)}</span><br>` : ''}
        ${state.showDelta ? `<strong style="color: green;">Match: ${Math.abs(deltaV - approxDeltaV) < 0.001 ? '✓ Perfect!' : '≈ Close'}</strong>` : ''}
        ${!state.showDelta && !state.showLambda ? '<em>Toggle checkboxes above to see λ slope and ΔV verification</em>' : ''}
      `;

      canvas.innerHTML = '';
      const panelA = document.createElement('div');
      panelA.innerHTML = '<h4 style="margin: 5px 0;">Consumer Problem at I=' + I + '</h4>';
      panelA.appendChild(plotA);
      
      const panelB = document.createElement('div');
      panelB.innerHTML = '<h4 style="margin: 5px 0;">Value Function V(I)</h4>';
      panelB.appendChild(plotB);
      
      canvas.appendChild(panelA);
      canvas.appendChild(panelB);
    };

    controls.querySelector('#income-slider').addEventListener('input', (e) => {
      state.income = parseFloat(e.target.value);
      controls.querySelector('#income-value').textContent = state.income;
      render();
    });

    controls.querySelector('#show-delta').addEventListener('change', (e) => {
      state.showDelta = e.target.checked;
      render();
    });

    controls.querySelector('#show-lambda').addEventListener('change', (e) => {
      state.showLambda = e.target.checked;
      render();
    });

    render();
    return state;
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch7_shadow_price'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch7_shadow_price');
      }
    } catch (e) {
      console.error('Failed to register animation ch7_shadow_price', e);
    }
  })();

  // ch8_brouwer.js
  (function(){
    // Chapter 8: Brouwer Fixed Point (Existence)
// Public API: export function init(container, options)

function init(container, options = {}) {
    const state = {
      preset: options.preset || 'tanh',
      showFixedPoint: true,
      width: 600,
      height: 500
    };

    const controls = document.createElement('div');
    controls.className = 'animation-controls';
    controls.innerHTML = `
      <label>Function preset:
        <select id="preset-select">
          <option value="tanh">tanh(x)</option>
          <option value="cos">0.5 + 0.4cos(x)</option>
          <option value="sqrt">√(x)</option>
          <option value="quad">0.2 + 0.6x²</option>
        </select>
      </label>
      <label><input type="checkbox" id="show-fp" checked> Show fixed point</label>
    `;

    const canvas = document.createElement('div');
    canvas.id = 'brouwer-plot';

    container.appendChild(controls);
    container.appendChild(canvas);

    const functions = {
      tanh: (x) => 0.5 + 0.4 * Math.tanh(x - 0.5),
      cos: (x) => 0.5 + 0.4 * Math.cos(2 * Math.PI * x),
      sqrt: (x) => Math.sqrt(x),
      quad: (x) => 0.2 + 0.6 * x * x
    };

    const findFixedPoint = (f, a = 0, b = 1, tol = 1e-6) => {
      // Simple bisection
      for (let i = 0; i < 50; i++) {
        const mid = (a + b) / 2;
        const val = f(mid) - mid;
        if (Math.abs(val) < tol) return mid;
        if (val > 0) a = mid;
        else b = mid;
      }
      return (a + b) / 2;
    };

    const render = () => {
      const f = functions[state.preset];
      
      const fData = Array.from({ length: 100 }, (_, i) => {
        const x = (i / 99);
        const y = f(x);
        return { x, y };
      });

      const identityData = [{ x: 0, y: 0 }, { x: 1, y: 1 }];

      const marks = [
        Plot.line(fData, { x: "x", y: "y", stroke: "blue", strokeWidth: 2 }),
        Plot.line(identityData, { x: "x", y: "y", stroke: "gray", strokeWidth: 2, strokeDasharray: "4" }),
        Plot.text([{ x: 0.85, y: 0.9 }], { x: "x", y: "y", text: "y=x", fill: "gray", fontSize: 11 }),
        Plot.text([{ x: 0.1, y: f(0.1) + 0.05 }], { x: "x", y: "y", text: `y=f(x)`, fill: "blue", fontSize: 11 })
      ];

      if (state.showFixedPoint) {
        const fp = findFixedPoint(f);
        marks.push(
          Plot.dot([{ x: fp, y: fp }], { x: "x", y: "y", r: 8, fill: "red" }),
          Plot.text([{ x: fp, y: fp }], { x: "x", y: "y", text: `★ x*=${fp.toFixed(3)}`, dy: -15, fontWeight: "bold" })
        );
      }

      const plot = Plot.plot({
        width: state.width,
        height: state.height,
        marginLeft: 60,
        x: { domain: [0, 1], label: "x" },
        y: { domain: [0, 1], label: "y" },
        marks
      });

      const info = document.createElement('div');
      info.style.marginTop = '10px';
      info.style.padding = '10px';
      info.style.background = '#f5f5f5';
      info.innerHTML = `
        <strong>Brouwer's Fixed-Point Theorem:</strong><br>
        Continuous self-map f:[0,1]→[0,1] has a fixed point x* where f(x*)=x*.<br>
        Intersection of y=f(x) and y=x guarantees existence.
      `;

      canvas.innerHTML = '';
      canvas.appendChild(plot);
      canvas.appendChild(info);
    };

    controls.querySelector('#preset-select').addEventListener('change', (e) => {
      state.preset = e.target.value;
      render();
    });

    controls.querySelector('#show-fp').addEventListener('change', (e) => {
      state.showFixedPoint = e.target.checked;
      render();
    });

    render();
    return state;
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch8_brouwer'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch8_brouwer');
      }
    } catch (e) {
      console.error('Failed to register animation ch8_brouwer', e);
    }
  })();

  // ch8_envelope.js
  (function(){
    // Chapter 8: Envelope Theorem Visualizer
// Public API: export function init(container, options)

function init(container, options = {}) {
    const state = {
      theta: options.theta || 100,
      showLambda: true,
      showDelta: false,
      width: 700,
      height: 350
    };

    const controls = document.createElement('div');
    controls.className = 'animation-controls';
    controls.innerHTML = `
      <label>Parameter θ (income): <input type="range" id="theta-slider" min="40" max="150" value="${state.theta}" step="1"></label>
      <span id="theta-value">${state.theta}</span><br>
      <label><input type="checkbox" id="show-lambda" checked> Show λ and tangent</label>
      <label><input type="checkbox" id="show-delta"> Show finite difference ΔV</label>
    `;

    const canvas = document.createElement('div');
    canvas.id = 'envelope-plot';

    container.appendChild(controls);
    container.appendChild(canvas);

    // Same consumer problem: max √(xy) s.t. 2x+3y=I
    const solve = (I) => {
      const x = I / 4;
      const y = I / 6;
      const U = Math.sqrt(x * y);
      const lambda = 0.5 * Math.sqrt(y/x) / 2;
      return { x, y, U, lambda };
    };

    const render = () => {
      const current = solve(state.theta);
      const next = solve(state.theta + 1);

      const valueData = Array.from({ length: 100 }, (_, i) => {
        const I = 40 + (i / 99) * 110;
        const sol = solve(I);
        return { I, V: sol.U };
      });

      const marks = [
        Plot.line(valueData, { x: "I", y: "V", stroke: "green", strokeWidth: 2.5 }),
        Plot.dot([{ I: state.theta, V: current.U }], { x: "I", y: "V", r: 6, fill: "red" })
      ];

      if (state.showLambda) {
        const tangent = Array.from({ length: 20 }, (_, i) => {
          const I = state.theta - 15 + (i / 19) * 30;
          const V = current.U + current.lambda * (I - state.theta);
          return { I, V };
        });
        marks.push(
          Plot.line(tangent, { x: "I", y: "V", stroke: "orange", strokeWidth: 2, strokeDasharray: "4" }),
          Plot.text([{ I: state.theta + 20, V: current.U + current.lambda * 20 }], {
            x: "I",
            y: "V",
            text: `slope = λ = ${current.lambda.toFixed(4)}`,
            fontSize: 11
          })
        );
      }

      if (state.showDelta) {
        marks.push(
          Plot.dot([{ I: state.theta + 1, V: next.U }], { x: "I", y: "V", r: 5, fill: "purple" }),
          Plot.ruleY([current.U, next.U], { x: state.theta + 1, stroke: "purple", strokeWidth: 2 })
        );
      }

      const plot = Plot.plot({
        width: state.width,
        height: state.height,
        marginLeft: 60,
        x: { label: "Parameter θ (Income I)" },
        y: { label: "Value V(θ)" },
        marks
      });

      const info = document.createElement('div');
      info.style.marginTop = '10px';
      info.style.padding = '10px';
      info.style.background = '#f5f5f5';
      info.innerHTML = `
        <strong>Envelope Identity:</strong> dV/dθ = ∂ℒ/∂θ = λ<br>
        At θ=${state.theta}: λ = ${current.lambda.toFixed(4)}<br>
        ${state.showDelta ? `Actual ΔV = ${(next.U - current.U).toFixed(4)}, Predicted λ·Δθ = ${current.lambda.toFixed(4)}` : ''}
      `;

      canvas.innerHTML = '';
      canvas.appendChild(plot);
      canvas.appendChild(info);
    };

    controls.querySelector('#theta-slider').addEventListener('input', (e) => {
      state.theta = parseFloat(e.target.value);
      controls.querySelector('#theta-value').textContent = state.theta;
      render();
    });

    controls.querySelector('#show-lambda').addEventListener('change', (e) => {
      state.showLambda = e.target.checked;
      render();
    });

    controls.querySelector('#show-delta').addEventListener('change', (e) => {
      state.showDelta = e.target.checked;
      render();
    });

    render();
    return state;
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch8_envelope'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch8_envelope');
      }
    } catch (e) {
      console.error('Failed to register animation ch8_envelope', e);
    }
  })();

  // ch8_rbc_policy.js
  (function(){
    // Chapter 8: Deterministic RBC Policy Explorer
// Public API: export function init(container, options)

function init(container, options = {}) {
    const state = {
      alpha: options.alpha || 0.3,
      beta: options.beta || 0.95,
      delta: options.delta || 1,
      showEuler: false,
      width: 700,
      height: 400
    };

    const controls = document.createElement('div');
    controls.className = 'animation-controls';
    controls.innerHTML = `
      <label>α (capital share): <input type="range" id="alpha-slider" min="0.1" max="0.9" value="${state.alpha}" step="0.05"></label>
      <span id="alpha-value">${state.alpha}</span><br>
      <label>β (discount): <input type="range" id="beta-slider" min="0.8" max="0.99" value="${state.beta}" step="0.01"></label>
      <span id="beta-value">${state.beta}</span><br>
      <label><input type="checkbox" id="delta-toggle" ${state.delta === 1 ? 'checked' : ''}> Full depreciation (δ=1)</label>
      <label><input type="checkbox" id="show-euler"> Show Euler residual</label>
    `;

    const canvas = document.createElement('div');
    canvas.id = 'rbc-policy-plot';

    container.appendChild(controls);
    container.appendChild(canvas);

    const render = () => {
      // Deterministic RBC with δ=1: k_{t+1} = αβ k_t^α, c_t = (1-αβ) k_t^α
      const s = state.alpha * state.beta; // savings rate
      
      // Steady state: k* = (αβ)^{1/(1-α)}
      const kStar = Math.pow(s, 1 / (1 - state.alpha));

      const kMax = Math.min(kStar * 2.5, 50);
      const kData = Array.from({ length: 100 }, (_, i) => {
        const k = 0.1 + (i / 99) * kMax;
        const kAlpha = Math.pow(k, state.alpha);
        const gk = s * kAlpha; // next capital
        const gc = (1 - s) * kAlpha; // consumption
        return { k, gk, gc };
      });

      const marks = [
        // Policy functions
        Plot.line(kData, { x: "k", y: "gk", stroke: "blue", strokeWidth: 2.5 }),
        Plot.line(kData, { x: "k", y: "gc", stroke: "green", strokeWidth: 2.5 }),
        // 45-degree line
        Plot.line([{ k: 0, y: 0 }, { k: kMax, y: kMax }], { x: "k", y: "y", stroke: "gray", strokeDasharray: "4", strokeWidth: 1 }),
        // Steady state
        Plot.ruleX([kStar], { stroke: "red", strokeWidth: 2, strokeDasharray: "2" }),
        Plot.dot([{ k: kStar, y: kStar }], { x: "k", y: "y", r: 6, fill: "red" }),
        // Labels
        Plot.text([{ k: kMax * 0.7, y: s * Math.pow(kMax * 0.7, state.alpha) + 0.5 }], {
          x: "k", y: "y", text: `k'=αβ k^α`, fill: "blue", fontSize: 11
        }),
        Plot.text([{ k: kMax * 0.5, y: (1 - s) * Math.pow(kMax * 0.5, state.alpha) - 0.5 }], {
          x: "k", y: "y", text: `c=(1-αβ)k^α`, fill: "green", fontSize: 11
        }),
        Plot.text([{ k: kStar, y: 0 }], {
          x: "k", y: "y", text: `k*=${kStar.toFixed(2)}`, dy: 20, fill: "red", fontSize: 11
        })
      ];

      const plot = Plot.plot({
        width: state.width,
        height: state.height,
        marginLeft: 60,
        x: { domain: [0, kMax], label: "Capital k_t" },
        y: { label: "Policy values" },
        marks
      });

      const info = document.createElement('div');
      info.style.marginTop = '10px';
      info.style.padding = '10px';
      info.style.background = '#f5f5f5';
      info.innerHTML = `
        <strong>Deterministic RBC Policies (δ=1):</strong><br>
        Savings rate s = αβ = ${s.toFixed(3)}<br>
        Steady state k* = (αβ)^{1/(1-α)} = ${kStar.toFixed(3)}<br>
        Higher β → higher savings → higher steady-state capital.
      `;

      canvas.innerHTML = '';
      canvas.appendChild(plot);
      canvas.appendChild(info);
    };

    controls.querySelector('#alpha-slider').addEventListener('input', (e) => {
      state.alpha = parseFloat(e.target.value);
      controls.querySelector('#alpha-value').textContent = state.alpha;
      render();
    });

    controls.querySelector('#beta-slider').addEventListener('input', (e) => {
      state.beta = parseFloat(e.target.value);
      controls.querySelector('#beta-value').textContent = state.beta;
      render();
    });

    controls.querySelector('#delta-toggle').addEventListener('change', (e) => {
      state.delta = e.target.checked ? 1 : 0.1;
      render();
    });

    controls.querySelector('#show-euler').addEventListener('change', (e) => {
      state.showEuler = e.target.checked;
      render();
    });

    render();
    return state;
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch8_rbc_policy'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch8_rbc_policy');
      }
    } catch (e) {
      console.error('Failed to register animation ch8_rbc_policy', e);
    }
  })();

  // ch8_value_iteration.js
  (function(){
    // Chapter 8: Value Iteration Convergence (Contraction)
// Public API: export function init(container, options)

function init(container, options = {}) {
    const state = {
      beta: options.beta || 0.95,
      iter: 0,
      playing: false,
      showDistance: true,
      width: 700,
      height: 400,
      Vt: null,
      history: []
    };

    // Simple RBC value iteration: V(k) = max_c { ln(c) + β V(k^α - c) }
    const alpha = 0.3;
    const kGrid = Array.from({ length: 50 }, (_, i) => 0.5 + i * 0.5);
    state.Vt = new Array(kGrid.length).fill(0);

    const controls = document.createElement('div');
    controls.className = 'animation-controls';
    controls.innerHTML = `
      <label>β (discount): <input type="range" id="beta-slider" min="0.5" max="0.99" value="${state.beta}" step="0.01"></label>
      <span id="beta-value">${state.beta}</span><br>
      <button id="step-btn">Step</button>
      <button id="play-btn">Play</button>
      <button id="pause-btn" disabled>Pause</button>
      <button id="reset-btn">Reset</button>
      <label><input type="checkbox" id="show-dist" ${state.showDistance ? 'checked' : ''}> Show distance</label>
      <div id="iter-info" style="margin-top: 10px; font-weight: bold;">Iteration: 0, Distance: ∞</div>
    `;

    const canvas = document.createElement('div');
    canvas.id = 'vi-plot';

    container.appendChild(controls);
    container.appendChild(canvas);

    const bellmanOp = (V) => {
      const Vnew = new Array(kGrid.length);
      for (let i = 0; i < kGrid.length; i++) {
        const k = kGrid[i];
        const kAlpha = Math.pow(k, alpha);
        let maxVal = -Infinity;
        // Grid search over consumption
        for (let c = 0.01; c < kAlpha - 0.01; c += (kAlpha - 0.02) / 30) {
          const kNext = kAlpha - c;
          // Interpolate V at kNext
          const idx = kGrid.findIndex(kg => kg >= kNext);
          const Vinterp = idx > 0 && idx < kGrid.length ? 
            V[idx-1] + (V[idx] - V[idx-1]) * (kNext - kGrid[idx-1]) / (kGrid[idx] - kGrid[idx-1]) :
            V[Math.min(idx, kGrid.length - 1)];
          const val = Math.log(c) + state.beta * Vinterp;
          if (val > maxVal) maxVal = val;
        }
        Vnew[i] = maxVal;
      }
      return Vnew;
    };

    const distance = (Va, Vb) => {
      return Math.max(...Va.map((v, i) => Math.abs(v - Vb[i])));
    };

    const step = () => {
      const Vnew = bellmanOp(state.Vt);
      const dist = distance(Vnew, state.Vt);
      state.Vt = Vnew;
      state.iter++;
      state.history.push({ V: [...Vnew], dist });
      if (state.history.length > 6) state.history.shift();
      controls.querySelector('#iter-info').textContent = 
        `Iteration: ${state.iter}, Distance: ${dist.toFixed(6)}`;
      render();
      if (dist < 0.0001 && state.playing) {
        pausePlay();
      }
    };

    let intervalId = null;
    const startPlay = () => {
      if (state.playing) return;
      state.playing = true;
      controls.querySelector('#play-btn').disabled = true;
      controls.querySelector('#pause-btn').disabled = false;
      intervalId = setInterval(step, 500);
    };

    const pausePlay = () => {
      state.playing = false;
      controls.querySelector('#play-btn').disabled = false;
      controls.querySelector('#pause-btn').disabled = true;
      if (intervalId) clearInterval(intervalId);
    };

    const reset = () => {
      pausePlay();
      state.Vt = new Array(kGrid.length).fill(0);
      state.iter = 0;
      state.history = [];
      controls.querySelector('#iter-info').textContent = 'Iteration: 0, Distance: ∞';
      render();
    };

    const render = () => {
      const data = kGrid.map((k, i) => ({ k, V: state.Vt[i] }));
      
      const marks = [
        Plot.line(data, { x: "k", y: "V", stroke: "blue", strokeWidth: 3 })
      ];

      // Add faded history trails
      state.history.slice(0, -1).forEach((h, idx) => {
        const opacity = 0.2 + 0.1 * idx;
        const histData = kGrid.map((k, i) => ({ k, V: h.V[i] }));
        marks.unshift(Plot.line(histData, { x: "k", y: "V", stroke: "lightblue", strokeWidth: 1, opacity }));
      });

      const plot = Plot.plot({
        width: state.width,
        height: state.height,
        marginLeft: 60,
        x: { label: "Capital k" },
        y: { label: "Value V(k)" },
        marks
      });

      canvas.innerHTML = '';
      canvas.appendChild(plot);
    };

    controls.querySelector('#beta-slider').addEventListener('input', (e) => {
      state.beta = parseFloat(e.target.value);
      controls.querySelector('#beta-value').textContent = state.beta;
      reset();
    });

    controls.querySelector('#step-btn').addEventListener('click', step);
    controls.querySelector('#play-btn').addEventListener('click', startPlay);
    controls.querySelector('#pause-btn').addEventListener('click', pausePlay);
    controls.querySelector('#reset-btn').addEventListener('click', reset);
    controls.querySelector('#show-dist').addEventListener('change', (e) => {
      state.showDistance = e.target.checked;
    });

    render();
    return state;
}

    try {
      var api = (typeof init === 'function') ? { init: init } : {};
      if (api && typeof api.init === 'function') {
        window.__ANIMS__['ch8_value_iteration'] = { init: api.init };
        console.log('[ANIM] Registered:', 'ch8_value_iteration');
      }
    } catch (e) {
      console.error('Failed to register animation ch8_value_iteration', e);
    }
  })();

})();
