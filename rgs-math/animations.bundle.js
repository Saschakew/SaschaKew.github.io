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

})();
