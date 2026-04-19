/**
 * profileChart.js — Die profile visualisation (Chart.js)
 *
 * Renders a dual-axis chart showing:
 *   Left axis (y)  — radius r(z) for both curved and conical profiles (mm)
 *   Right axis (y2) — local tangent angle α(z) for curved profile (degrees)
 */

const ProfileChart = (() => {
  let chart = null;

  /**
   * Render or update the profile chart.
   *
   * @param {object} profile — output from ProfileGenerator.generate()
   */
  function render(profile) {
    const canvas = document.getElementById('profileChart');
    if (!canvas) return;

    // Destroy previous instance to avoid canvas reuse errors
    if (chart) { chart.destroy(); chart = null; }

    // Downsample for performance (max 80 display points)
    const step = Math.max(1, Math.floor(profile.z.length / 80));
    const labels    = profile.z.filter((_, i) => i % step === 0).map(v => v.toFixed(1));
    const curved    = profile.r_curved.filter((_, i) => i % step === 0).map(v => parseFloat(v.toFixed(2)));
    const conical   = profile.r_conical.filter((_, i) => i % step === 0).map(v => parseFloat(v.toFixed(2)));
    const angle_loc = profile.local_angle.filter((_, i) => i % step === 0).map(v => parseFloat(v.toFixed(2)));

    chart = new Chart(canvas, {
      data: {
        labels,
        datasets: [
          {
            type: 'line',
            label: 'Curved profile r(z)',
            data: curved,
            borderColor: '#5b9cf6',
            backgroundColor: 'rgba(91,156,246,0.07)',
            borderWidth: 2.5,
            pointRadius: 0,
            tension: 0.4,
            yAxisID: 'y',
            fill: false,
          },
          {
            type: 'line',
            label: 'Conical die r(z)',
            data: conical,
            borderColor: '#f07040',
            backgroundColor: 'rgba(240,112,64,0.05)',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0,
            yAxisID: 'y',
            borderDash: [7, 4],
            fill: false,
          },
          {
            type: 'line',
            label: 'Local angle α(z)',
            data: angle_loc,
            borderColor: '#4db87a',
            borderWidth: 1.5,
            pointRadius: 0,
            tension: 0.4,
            yAxisID: 'y2',
            borderDash: [3, 5],
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1a1c1f',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            titleColor: '#a8a49d',
            bodyColor: '#f0ede8',
            titleFont: { family: 'DM Mono, monospace', size: 11 },
            bodyFont:  { family: 'DM Mono, monospace', size: 11 },
            callbacks: {
              title: (items) => `z = ${items[0].label} mm`,
              label: (ctx) => {
                if (ctx.datasetIndex < 2) {
                  return ` r = ${ctx.parsed.y.toFixed(2)} mm`;
                }
                return ` α = ${ctx.parsed.y.toFixed(1)}°`;
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Axial position z (mm)',
              color: '#666360',
              font: { family: 'DM Mono, monospace', size: 11 },
            },
            ticks: {
              color: '#666360',
              maxTicksLimit: 10,
              font: { family: 'DM Mono, monospace', size: 10 },
            },
            grid: { color: 'rgba(255,255,255,0.04)' },
          },
          y: {
            title: {
              display: true,
              text: 'Radius r (mm)',
              color: '#666360',
              font: { family: 'DM Mono, monospace', size: 11 },
            },
            ticks: {
              color: '#666360',
              font: { family: 'DM Mono, monospace', size: 10 },
            },
            grid: { color: 'rgba(255,255,255,0.04)' },
          },
          y2: {
            position: 'right',
            title: {
              display: true,
              text: 'Local angle α (°)',
              color: '#4db87a',
              font: { family: 'DM Mono, monospace', size: 11 },
            },
            ticks: {
              color: '#4db87a',
              font: { family: 'DM Mono, monospace', size: 10 },
            },
            grid: { drawOnChartArea: false },
          },
        },
      },
    });

    // Render legend
    renderLegend();
  }

  function renderLegend() {
    const el = document.getElementById('profile-legend');
    if (!el) return;
    el.innerHTML = `
      <div class="legend-item">
        <span class="legend-swatch" style="background:#5b9cf6;"></span>
        Curved (streamlined) profile
      </div>
      <div class="legend-item">
        <span class="legend-swatch" style="background:#f07040; opacity:0.7;"></span>
        Conical die profile
      </div>
      <div class="legend-item" style="color:#4db87a;">
        <span class="legend-swatch dashed" style="color:#4db87a; border-color:#4db87a; width:18px;"></span>
        Local tangent angle (curved)
      </div>
    `;
  }

  function destroy() {
    if (chart) { chart.destroy(); chart = null; }
  }

  return { render, destroy };

})();
