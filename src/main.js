/**
 * main.js — Application entry point
 *
 * Responsibilities:
 *   - Initialise all UI event listeners
 *   - Orchestrate the computation pipeline
 *   - Route results to each renderer module
 *   - Handle errors gracefully
 */

(function () {
  'use strict';

  // ── Element references ──────────────────────────────────────
  const elRin       = document.getElementById('r_in');
  const elRout      = document.getElementById('r_out');
  const elTemp      = document.getElementById('temp_slider');
  const elTempOut   = document.getElementById('temp_out');
  const elSpeed     = document.getElementById('speed_slider');
  const elSpeedOut  = document.getElementById('speed_out');
  const elBackP     = document.getElementById('back_p');
  const elBackPOut  = document.getElementById('back_p_out');
  const elMaterial  = document.getElementById('material');
  const elLubricant = document.getElementById('lubricant');
  const elCalcBtn   = document.getElementById('calc_btn');

  const elPlaceholder    = document.getElementById('results-placeholder');
  const elResultsContent = document.getElementById('results-content');
  const elMatProps       = document.getElementById('mat-props-display');
  const elLubProps       = document.getElementById('lub-props-display');

  // ── Slider live readouts ────────────────────────────────────
  elTemp.addEventListener('input', () => {
    elTempOut.value = `${elTemp.value} °C`;
  });

  elSpeed.addEventListener('input', () => {
    elSpeedOut.value = `${elSpeed.value} mm/s`;
  });

  elBackP.addEventListener('input', () => {
    elBackPOut.value = `${elBackP.value} MPa`;
  });

  // ── Material property chips ─────────────────────────────────
  function updateMaterialChips() {
    const mat = MATERIALS[elMaterial.value];
    if (!mat || !elMatProps) return;
    elMatProps.innerHTML = `
      <div class="props-chips">
        <span class="prop-chip">σ_y₀ <span>${mat.sy0} MPa</span></span>
        <span class="prop-chip">n <span>${mat.n}</span></span>
        <span class="prop-chip">Tm <span>${mat.Tm}°C</span></span>
        <span class="prop-chip">α range <span>${mat.alpha_range[0]}°–${mat.alpha_range[1]}°</span></span>
        <span class="prop-chip">ρ <span>${mat.rho} kg/m³</span></span>
      </div>
    `;
  }

  function updateLubricantChips() {
    const lub = LUBRICANTS[elLubricant.value];
    if (!lub || !elLubProps) return;
    elLubProps.innerHTML = `
      <div class="props-chips">
        <span class="prop-chip">m <span>${lub.m}</span></span>
        <span class="prop-chip">μ <span>${lub.mu}</span></span>
        <span class="prop-chip">T range <span>${lub.temp_range[0]}–${lub.temp_range[1]}°C</span></span>
      </div>
    `;
  }

  elMaterial.addEventListener('change', updateMaterialChips);
  elLubricant.addEventListener('change', updateLubricantChips);
  updateMaterialChips();
  updateLubricantChips();

  // ── Tab switching ───────────────────────────────────────────
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const panel = document.getElementById('tab-' + target);
      if (panel) panel.classList.add('active');
    });
  });

  // ── Profile summary cards ───────────────────────────────────
  function renderProfileSummary(profile, res) {
    const el = document.getElementById('profile-summary');
    if (!el) return;
    el.innerHTML = `
      <div class="summary-card">
        <div class="summary-card-label">Max local angle</div>
        <div class="summary-card-val">${profile.max_local_angle.toFixed(1)}°</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-label">Avg local angle</div>
        <div class="summary-card-val">${profile.avg_local_angle.toFixed(1)}°</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-label">Die land length</div>
        <div class="summary-card-val">${res.L_die.toFixed(1)} mm</div>
      </div>
      <div class="summary-card">
        <div class="summary-card-label">Conical angle</div>
        <div class="summary-card-val">${profile.alpha_conical_deg.toFixed(1)}°</div>
      </div>
    `;
  }

  // ── Main compute pipeline ───────────────────────────────────
  function runCompute() {
    // Gather inputs
    const inputs = {
      R_in:    parseFloat(elRin.value),
      R_out:   parseFloat(elRout.value),
      T:       parseFloat(elTemp.value),
      speed:   parseFloat(elSpeed.value),
      back_p:  parseFloat(elBackP.value),
      matKey:  elMaterial.value,
      lubKey:  elLubricant.value,
    };

    // Basic validation
    if (isNaN(inputs.R_in) || isNaN(inputs.R_out)) {
      showError('Please enter valid numeric values for both radii.');
      return;
    }

    if (inputs.R_out >= inputs.R_in) {
      showError(`Final radius (${inputs.R_out} mm) must be smaller than initial radius (${inputs.R_in} mm).`);
      return;
    }

    try {
      // ── Show loading state ────────────────────────────────
      elCalcBtn.classList.add('loading');
      elCalcBtn.disabled = true;
      
      // Use requestAnimationFrame to ensure loading state is visible
      requestAnimationFrame(() => {
        // ── 1. Run physics solver ─────────────────────────────
        const result = Solver.compute(inputs);

        // ── 2. Generate die profiles ──────────────────────────
        const profile = ProfileGenerator.generate(
          result.R_in,
          result.R_out,
          result.L_die,
          150
        );

        // ── 3. Render all UI sections ─────────────────────────
        MetricsUI.render(result);
        AlertsUI.render(result);
        ProfileChart.render(profile);
        EnergyChart.render(result.energy_conical, result.energy_curved);
        renderProfileSummary(profile, result);
        ParamsUI.render(result);
        TheoryUI.render(result);

        // ── 4. Show results panel ─────────────────────────────
        elPlaceholder.classList.add('hidden');
        elResultsContent.classList.remove('hidden');

        // ── 5. Clear loading state ────────────────────────────
        elCalcBtn.classList.remove('loading');
        elCalcBtn.disabled = false;

        // Scroll to results on mobile
        if (window.innerWidth < 1000) {
          document.getElementById('panel-results').scrollIntoView({ behavior: 'smooth' });
        }
      });

    } catch (err) {
      // ── Clear loading state on error ──────────────────────
      elCalcBtn.classList.remove('loading');
      elCalcBtn.disabled = false;
      
      showError(`Computation error: ${err.message}`);
      console.error(err);
    }
  }

  function showError(msg) {
    const row = document.getElementById('alerts-row');
    if (row) {
      row.innerHTML = `
        <div class="alert alert-warn">
          <span class="alert-icon">▲</span>
          <span>${msg}</span>
        </div>
      `;
    }
    elPlaceholder.classList.add('hidden');
    elResultsContent.classList.remove('hidden');
  }

  // ── Button click ────────────────────────────────────────────
  elCalcBtn.addEventListener('click', runCompute);

  // ── Also trigger on Enter key in number inputs ──────────────
  [elRin, elRout].forEach(el => {
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter') runCompute();
    });
  });

  // ── Run once on load with default values ────────────────────
  runCompute();

})();
