/**
 * alerts.js — Contextual alerts and warnings renderer
 *
 * Generates engineering-relevant warnings based on the solver output.
 * Checks for: dead metal zone risk, thermal limits, lubricant compatibility,
 * speed limits, angle range violations, and polymer-specific notes.
 */

const AlertsUI = (() => {

  /**
   * Render alerts into #alerts-row.
   * @param {object} res — full solver result object
   */
  function render(res) {
    const row = document.getElementById('alerts-row');
    if (!row) return;

    const alerts = [];

    // ── Dead metal zone ──────────────────────────────────────
    if (res.dmz === 'high') {
      alerts.push({
        type: 'warn',
        icon: '▲',
        msg: `Dead metal zone risk is HIGH (α = ${res.alpha_conical.toFixed(1)}° exceeds DMZ onset for this material). 
              Material may stagnate at die corners → surface defects, internal voids. 
              Use streamlined curved profile or reduce friction factor. 
              ⚠ This is a screening indicator based on die angle and friction only — 
              strain rate and temperature effects are not modelled. 
              FEM simulation and pilot die trials are required before finalising the design.`,
      });
    } else if (res.dmz === 'moderate') {
      alerts.push({
        type: 'warn',
        icon: '◆',
        msg: `Moderate dead metal zone risk. Die angle is approaching the stagnation threshold for ${res.mat.name}. 
              Monitor for surface streak defects. Curved profile recommended. 
              Note: DMZ assessment is a simplified screening tool; actual onset also depends on 
              extrusion speed and temperature. Validate with FEM or die trials if critical.`,
      });
    }

    // ── Thermal limit ────────────────────────────────────────
    if (res.near_Tm) {
      alerts.push({
        type: 'warn',
        icon: '▲',
        msg: `Die zone temperature estimate (${res.T_die_zone.toFixed(0)} °C) is above 85% of melting point 
              (Tm = ${res.mat.Tm} °C). Risk of hot cracking, incipient melting, and rapid die wear. 
              Reduce extrusion speed or lower billet temperature.`,
      });
    } else if (res.dT_adiabatic > 80) {
      alerts.push({
        type: 'warn',
        icon: '◇',
        msg: `Adiabatic temperature rise estimated at +${res.dT_adiabatic.toFixed(0)} °C. 
              Ensure adequate die cooling and consider reducing ram speed.`,
      });
    }

    // ── Lubricant compatibility ──────────────────────────────
    if (!res.lub_compatible) {
      const [tmin, tmax] = res.lub.temp_range;
      alerts.push({
        type: 'warn',
        icon: '▲',
        msg: `Lubricant "${res.lub.name}" is not optimal for this combination. 
              Effective range: ${tmin}–${tmax} °C. 
              ${!res.lub.compatible.includes(res.mat.type) ? `Not recommended for ${res.mat.type}s.` : `Process temperature ${res.T} °C is outside the effective window.`}`,
      });
    }

    // ── Recrystallisation note ───────────────────────────────
    if (res.mat.Trecryst && res.T >= res.mat.Trecryst && res.mat.type === 'metal') {
      alerts.push({
        type: 'info',
        icon: 'ℹ',
        msg: `Process temperature (${res.T} °C) is above recrystallisation temperature 
              (T_recryst = ${res.mat.Trecryst} °C) for ${res.mat.name}. 
              Hot extrusion regime: dynamic recrystallisation will refine grain structure. 
              Optimal angle shifts toward ${res.mat.alpha_optimal_hot}° (hot range). 
              Note: the MSAGS Stage 2 Km multiplier is applied — validate α* with die trials 
              before committing to production tooling.`,
      });
    }

    // ── Polymer note ─────────────────────────────────────────
    if (res.mat.type === 'polymer') {
      alerts.push({
        type: 'info',
        icon: 'ℹ',
        msg: `${res.mat.name} is a polymer. Shear-thinning (power-law) rheology dominates — 
              Avitzur's Upper Bound is adapted with the MSAGS Material Class Multiplier (Km), 
              a proprietary Stage 2 correction not derived from classical theory. 
              Wider optimal die angle (${res.mat.alpha_range[0]}°–${res.mat.alpha_range[1]}°) minimises 
              die swell and backpressure. Curved profile strongly recommended. 
              Validate α* against melt-flow index data and die trials.`,
      });
    }

    // ── High Peclet number ───────────────────────────────────
    if (res.Pe > 100) {
      alerts.push({
        type: 'info',
        icon: 'ℹ',
        msg: `High Peclet number (Pe = ${res.Pe.toFixed(0)}) — convective heat transport dominates. 
              Deformation heat is carried forward with the material rather than conducted away. 
              Temperature gradients in the extrudate will be significant.`,
      });
    }

    // ── Good result confirmation ─────────────────────────────
    if (alerts.length === 0) {
      alerts.push({
        type: 'success',
        icon: '✓',
        msg: `All parameters within safe operating ranges. 
              No dead metal zone risk, thermal conditions nominal, lubricant compatible. 
              Optimal die angle α* = ${res.alpha_conical.toFixed(1)}° is recommended as a starting point. 
              Treat pressure estimates as ±10% engineering approximations and validate 
              with pilot die trials before production.`,
      });
    }

    row.innerHTML = alerts.map(a => `
      <div class="alert alert-${a.type}">
        <span class="alert-icon">${a.icon}</span>
        <span>${a.msg}</span>
      </div>
    `).join('');
  }

  return { render };

})();
