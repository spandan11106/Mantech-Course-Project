/**
 * params.js — Full parameter table renderer
 *
 * Renders all computed and input parameters in a structured
 * two-column grid, grouped by category.
 */

const ParamsUI = (() => {

  /**
   * Render full parameter table into #params-grid.
   * @param {object} res — full solver result object
   */
  function render(res) {
    const grid = document.getElementById('params-grid');
    if (!grid) return;

    const sections = [
      {
        title: 'Geometry',
        rows: [
          ['Initial radius Rᵢ',         `${res.R_in} mm`],
          ['Final radius Rf',            `${res.R_out} mm`],
          ['Area reduction ratio R',     res.R_ratio.toFixed(3)],
          ['True (log) strain ε',        res.eps_true.toFixed(4)],
          ['% Area reduction',           `${res.reduction_pct.toFixed(1)}%`],
          ['Die land length L',          `${res.L_die.toFixed(1)} mm`],
          ['Billet cross-section',       `${res.A_billet.toFixed(1)} mm²`],
          ['Exit cross-section',         `${res.A_exit.toFixed(1)} mm²`],
        ],
      },
      {
        title: 'Process conditions',
        rows: [
          ['Process temperature',        `${res.T} °C`],
          ['Extrusion speed',            `${res.speed} mm/s`],
          ['Back pressure',              `${res.back_p} MPa`],
          ['Adiabatic ΔT',               `+${res.dT_adiabatic.toFixed(1)} °C`],
          ['Estimated die zone T',       `${res.T_die_zone.toFixed(0)} °C`],
          ['Peclet number Pe',           res.Pe.toFixed(2)],
        ],
      },
      {
        title: 'Material rheology',
        rows: [
          ['Material',                   res.mat.name],
          ['Material type',              res.mat.type],
          ['Strain-hardening exp. n',    res.mat.n.toFixed(3)],
          ['Strength coeff. C',          `${res.mat.C} MPa`],
          ['Flow stress σ_y (eff.)',     `${res.sy_eff.toFixed(1)} MPa`],
          ['Shear flow stress k',        `${res.k.toFixed(1)} MPa`],
          ['Density ρ',                  `${res.mat.rho} kg/m³`],
          ['Thermal conductivity λ',     `${res.mat.k_thermal} W/m·K`],
          ['Specific heat cₚ',           `${res.mat.cp} J/kg·K`],
          ['Melting point Tm',           `${res.mat.Tm} °C`],
          res.mat.Trecryst
            ? ['Recryst. temp.',         `${res.mat.Trecryst} °C`]
            : ['Recryst. temp.',         'N/A (polymer)'],
          ['Young\'s modulus E',         `${res.mat.E} GPa`],
        ],
      },
      {
        title: 'Friction & lubrication',
        rows: [
          ['Lubricant',                  res.lub.name],
          ['Tresca friction factor m',   res.m.toFixed(3)],
          ['Coulomb friction coeff. μ',  res.mu.toFixed(3)],
          ['Slab method B factor',       res.B_factor.toFixed(4)],
          ['Lub. temp. range',           `${res.lub.temp_range[0]}–${res.lub.temp_range[1]} °C`],
          ['Compatible w/ material',     res.lub_compatible ? '✓ Yes' : '✗ Check lubricant'],
        ],
      },
      {
        title: 'Conical die results',
        rows: [
          ['Raw α* (Avitzur)',           `${res.alpha_raw.toFixed(2)}°`],
          ['Material multiplier Km',     ((res.alpha_conical / res.alpha_raw) || 1).toFixed(3)],
          ['Final optimal angle α*',     `${res.alpha_conical.toFixed(2)}°`],
          ['Valid range for material',   `${res.mat.alpha_range[0]}°–${res.mat.alpha_range[1]}°`],
          ['Slab method pressure',       `${res.p_conical.toFixed(1)} MPa`],
          ['Extrusion force',            `${res.F_extrusion.toFixed(0)} kN`],
          ['Press power',                `${res.power_kW.toFixed(1)} kW`],
          ['Dead metal zone risk',       res.dmz.toUpperCase()],
        ],
      },
      {
        title: 'Curved profile results',
        rows: [
          ['Entry angle α_entry',        `${res.alpha_curved_entry.toFixed(2)}°`],
          ['Peak local angle α_peak',    `${res.alpha_curved_peak.toFixed(2)}°`],
          ['Exit angle α_exit',          `${res.alpha_curved_exit.toFixed(2)}°`],
          ['Friction energy Wf (curved)',`${res.energy_curved.Wf.toFixed(2)} MPa`],
          ['Redundant energy Wr (curved)',`${res.energy_curved.Wr.toFixed(2)} MPa`],
          ['Total energy (curved)',      `${res.energy_curved.Wtotal.toFixed(2)} MPa`],
          ['Pressure saving vs. conical',`${res.pressure_saving_pct.toFixed(1)}%`],
        ],
      },
    ];

    grid.innerHTML = sections.map(sec => `
      <div class="params-section">
        <div class="params-section-title">${sec.title}</div>
        ${sec.rows.map(([k, v]) => `
          <div class="param-row">
            <span class="param-key">${k}</span>
            <span class="param-val">${v}</span>
          </div>
        `).join('')}
      </div>
    `).join('');
  }

  return { render };

})();
