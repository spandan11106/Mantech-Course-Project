/**
 * metrics.js — Summary metric cards renderer
 *
 * Populates the top metrics grid with the most important
 * computed values from the solver result.
 */

const MetricsUI = (() => {

  /**
   * Render metric cards into #metrics-grid.
   * @param {object} res — full solver result object
   */
  function render(res) {
    const grid = document.getElementById('metrics-grid');
    if (!grid) return;

    const cards = [
      {
        label: 'Optimal conical angle',
        value: res.alpha_conical.toFixed(1) + '°',
        sub: 'semi-angle α* (Avitzur + Km)',
        accent: true,
      },
      {
        label: 'Curved entry / exit',
        value: res.alpha_curved_entry.toFixed(1) + '° / ' + res.alpha_curved_exit.toFixed(1) + '°',
        sub: 'streamlined polynomial profile',
        accent: false,
      },
      {
        label: 'Pressure saving',
        value: res.pressure_saving_pct.toFixed(1) + '%',
        sub: 'curved vs. conical die',
        accent: false,
      },
      {
        label: 'Extrusion force',
        value: res.F_extrusion.toFixed(0),
        sub: 'kN (conical die, slab method)',
        accent: false,
      },
      {
        label: 'Flow stress σ_y',
        value: res.sy_eff.toFixed(0),
        sub: 'MPa (temp + strain corrected)',
        accent: false,
      },
      {
        label: 'True strain ε',
        value: res.eps_true.toFixed(3),
        sub: 'logarithmic, ln(Ri/Rf)²',
        accent: false,
      },
      {
        label: 'Area reduction',
        value: res.reduction_pct.toFixed(1) + '%',
        sub: `R_ratio = ${res.R_ratio.toFixed(2)}`,
        accent: false,
      },
      {
        label: 'Power consumed',
        value: res.power_kW.toFixed(1),
        sub: 'kW (press power estimate)',
        accent: false,
      },
    ];

    grid.innerHTML = cards.map(c => `
      <div class="metric-card${c.accent ? ' accent' : ''}">
        <div class="metric-label">${c.label}</div>
        <div class="metric-val">${c.value}</div>
        <div class="metric-sub">${c.sub}</div>
      </div>
    `).join('');
  }

  return { render };

})();
