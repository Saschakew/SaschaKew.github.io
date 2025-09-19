// Auto-generated animations bundle for CORS-free build
(function(){
  window.__ANIMS__ = window.__ANIMS__ || {};

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
