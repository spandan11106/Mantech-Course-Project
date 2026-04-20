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
  const elDieAngle  = document.getElementById('die_angle_slider');
  const elDieAngleOut = document.getElementById('die_angle_out');
  const elAngleModeDisplay = document.getElementById('die_angle_mode');
  const elAngleAutoBtn = document.getElementById('angle_auto_btn');
  const elAngleManualBtn = document.getElementById('angle_manual_btn');
  const elMaterial  = document.getElementById('material');
  const elLubricant = document.getElementById('lubricant');
  const elCalcBtn   = document.getElementById('calc_btn');

  const elPlaceholder    = document.getElementById('results-placeholder');
  const elResultsContent = document.getElementById('results-content');
  const elMatProps       = document.getElementById('mat-props-display');
  const elLubProps       = document.getElementById('lub-props-display');

  // ── Angle mode state ────────────────────────────────────────
  let angleMode = 'auto'; // 'auto' or 'manual'
  let lastComputedResult = null; // Store results for profile regeneration

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

  // ── Die angle slider ────────────────────────────────────────
  elDieAngle.addEventListener('input', () => {
    elDieAngleOut.value = `${elDieAngle.value}°`;
    // Update profile dynamically if in manual mode and results exist
    if (angleMode === 'manual' && lastComputedResult) {
      updateProfileWithCustomAngle();
    }
  });

  // ── Angle mode toggle buttons ───────────────────────────────
  elAngleAutoBtn.addEventListener('click', () => {
    if (angleMode === 'auto') return;
    angleMode = 'auto';
    elAngleAutoBtn.classList.add('active');
    elAngleManualBtn.classList.remove('active');
    elDieAngle.disabled = true;
    elAngleModeDisplay.textContent = '(auto-optimised)';
    // Recompute with optimal angle
    if (lastComputedResult) runCompute();
  });

  elAngleManualBtn.addEventListener('click', () => {
    if (angleMode === 'manual') return;
    angleMode = 'manual';
    elAngleManualBtn.classList.add('active');
    elAngleAutoBtn.classList.remove('active');
    elDieAngle.disabled = false;
    elAngleModeDisplay.textContent = '(manually set)';
    // Update profile with manually set angle
    if (lastComputedResult) updateProfileWithCustomAngle();
  });

  // ── Populate materials dropdown ─────────────────────────────
  function populateMaterialsDropdown() {
    const select = document.getElementById('material');
    if (!select) return;

    // Group materials by type/category
    const groups = {
      'Aluminum Alloys': [],
      'Carbon & Alloy Steels': [],
      'Stainless Steels': [],
      'Copper & Brass': [],
      'Titanium & Exotic': [],
      'Polymers': []
    };

    // Categorize materials
    Object.entries(MATERIALS).forEach(([key, mat]) => {
      if (mat.name.includes('Aluminum') || mat.name.includes('Al')) {
        groups['Aluminum Alloys'].push({ key, name: mat.name });
      } else if (mat.name.includes('Stainless') || mat.name.includes('SS') || mat.name.includes('Stainless Steel') ) {
        groups['Stainless Steels'].push({ key, name: mat.name });
      } else if ((mat.type === 'metal' && mat.sy0 >= 600 && mat.sy0 <= 750) || mat.name.includes('Steel')) {
        groups['Carbon & Alloy Steels'].push({ key, name: mat.name });
      } else if (mat.name.includes('Copper') || mat.name.includes('Brass') || mat.name.includes('Bronze') || mat.name.includes('Cu')) {
        groups['Copper & Brass'].push({ key, name: mat.name });
      } else if (mat.name.includes('Titanium') || mat.name.includes('Ti') || mat.name.includes('Magnesium') || mat.name.includes('Inconel') || mat.name.includes('Monel') || mat.name.includes('Hastelloy') || mat.name.includes('Tungsten') || mat.name.includes('Zinc') || mat.name.includes('Lead') || mat.name.includes('Carbide')) {
        groups['Titanium & Exotic'].push({ key, name: mat.name });
      } else if (mat.type === 'polymer') {
        groups['Polymers'].push({ key, name: mat.name });
      }
    });

    // Build HTML with optgroups
    let html = '';
    Object.entries(groups).forEach(([groupName, materials]) => {
      if (materials.length > 0) {
        html += `<optgroup label="${groupName}">`;
        materials.forEach(({ key, name }) => {
          html += `<option value="${key}">${name}</option>`;
        });
        html += '</optgroup>';
      }
    });

    select.innerHTML = html;
    // Select first available material
    select.value = Object.keys(MATERIALS)[0];
    updateMaterialChips();
    updateLubricantDropdown();
  }

  // ── Populate lubricants dropdown with tiered ranking ──
  function updateLubricantDropdown() {
    const select = document.getElementById('lubricant');
    if (!select) return;

    const currentMaterial = MATERIALS[elMaterial.value];
    if (!currentMaterial) return;

    const materialType = currentMaterial.type;
    const top5 = [];
    const moderate5 = [];
    const others = [];

    // Rank lubricants based on compatibility score for this material type
    Object.entries(LUBRICANTS).forEach(([key, lub]) => {
      if (!lub.compatible || !lub.compatible.includes(materialType)) {
        // Not compatible at all
        others.push({ key, name: lub.name, score: 0 });
        return;
      }

      const score = lub.score[materialType] || 0;
      
      if (score >= 8) {
        // Top 5 - excellent choices
        top5.push({ key, name: lub.name, score });
      } else if (score >= 5) {
        // Moderate 5 - acceptable alternatives
        moderate5.push({ key, name: lub.name, score });
      } else {
        // Others - not recommended
        others.push({ key, name: lub.name, score });
      }
    });

    // Sort each category by score (descending)
    top5.sort((a, b) => b.score - a.score);
    moderate5.sort((a, b) => b.score - a.score);
    others.sort((a, b) => b.score - a.score);

    // Limit to 5 each for top and moderate
    const top5Limited = top5.slice(0, 5);
    const moderate5Limited = moderate5.slice(0, 5);

    // Build HTML with three tiers
    let html = '';
    
    if (top5Limited.length > 0) {
      html += '<optgroup label="★ Top Recommended (Best for this material)">';
      top5Limited.forEach(({ key, name }) => {
        html += `<option value="${key}">${name}</option>`;
      });
      html += '</optgroup>';
    }

    if (moderate5Limited.length > 0) {
      html += '<optgroup label="⊙ Moderate (Acceptable alternatives)">';
      moderate5Limited.forEach(({ key, name }) => {
        html += `<option value="${key}">${name}</option>`;
      });
      html += '</optgroup>';
    }

    if (others.length > 0) {
      html += '<optgroup label="○ Others (Not recommended)">';
      others.forEach(({ key, name }) => {
        html += `<option value="${key}">${name}</option>`;
      });
      html += '</optgroup>';
    }

    select.innerHTML = html;
    // Select first top recommendation if available
    select.value = top5Limited.length > 0 ? top5Limited[0].key : Object.keys(LUBRICANTS)[0];
    updateLubricantChips();
  }

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
    const mat = MATERIALS[elMaterial.value];
    if (!lub || !elLubProps) return;
    
    const materialType = mat.type;
    const score = lub.score[materialType] || 0;
    const isCompatible = lub.compatible && lub.compatible.includes(materialType);
    
    let compatibilityBadge = '';
    if (!isCompatible) {
      compatibilityBadge = '<span class="compat-badge compat-no">✗ Not compatible</span>';
    } else if (score >= 8) {
      compatibilityBadge = '<span class="compat-badge compat-excellent">★ Top Recommended</span>';
    } else if (score >= 5) {
      compatibilityBadge = '<span class="compat-badge compat-moderate">⊙ Acceptable Alternative</span>';
    } else {
      compatibilityBadge = '<span class="compat-badge compat-poor">○ Not Recommended</span>';
    }
    
    elLubProps.innerHTML = `
      <div class="props-chips">
        <span class="prop-chip">m <span>${lub.m}</span></span>
        <span class="prop-chip">μ <span>${lub.mu}</span></span>
        <span class="prop-chip">T range <span>${lub.temp_range[0]}–${lub.temp_range[1]}°C</span></span>
        ${compatibilityBadge}
      </div>
    `;
  }

  elMaterial.addEventListener('change', () => {
    updateMaterialChips();
    updateLubricantDropdown();
  });
  elLubricant.addEventListener('change', updateLubricantChips);
  
  // Initialize dropdowns and chips on page load
  populateMaterialsDropdown();

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

  // ── Update profile with custom/manual angle ─────────────────
  function updateProfileWithCustomAngle() {
    if (!lastComputedResult) return;

    const customAngle = parseFloat(elDieAngle.value);
    const res = lastComputedResult;

    // Recalculate L_die based on custom angle
    const L_die_custom = (res.R_in - res.R_out) / Math.tan(customAngle * Math.PI / 180);

    // Generate new profile with custom angle
    const profileCustom = ProfileGenerator.generate(
      res.R_in,
      res.R_out,
      L_die_custom,
      150
    );

    // Update chart and summary with new profile
    ProfileChart.render(profileCustom);
    renderProfileSummary(profileCustom, { ...res, L_die: L_die_custom });
  }

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
        lastComputedResult = result; // Store for dynamic angle updates

        // ── 2. Update angle slider with computed optimal angle ──
        const optimalAngleDeg = result.alpha_conical;
        elDieAngle.value = optimalAngleDeg.toFixed(1);
        elDieAngleOut.value = `${optimalAngleDeg.toFixed(1)}°`;

        // ── 3. Generate die profiles ──────────────────────────
        const profile = ProfileGenerator.generate(
          result.R_in,
          result.R_out,
          result.L_die,
          150
        );

        // ── 4. Render all UI sections ─────────────────────────
        MetricsUI.render(result);
        AlertsUI.render(result);
        ProfileChart.render(profile);
        EnergyChart.render(result.energy_conical, result.energy_curved);
        renderProfileSummary(profile, result);
        ParamsUI.render(result);
        TheoryUI.render(result);

        // ── 5. Show results panel ─────────────────────────────
        elPlaceholder.classList.add('hidden');
        elResultsContent.classList.remove('hidden');

        // ── 6. Clear loading state ────────────────────────────
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

  // ── Initialize angle slider state ───────────────────────────
  elDieAngle.disabled = true; // Start in auto mode
  elAngleAutoBtn.classList.add('active');
  elAngleManualBtn.classList.remove('active');

  // ── Run once on load with default values ────────────────────
  runCompute();

})();
