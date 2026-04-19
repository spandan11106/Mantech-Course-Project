/**
 * energyChart.js — Energy component breakdown chart (Chart.js)
 *
 * Grouped bar chart comparing Wi, Wf, Wr, and Wtotal
 * between the conical and curved (streamlined) die designs.
 * Units: MPa (specific energy per unit volume)
 */

const EnergyChart = (() => {
  let chart = null;

  /**
   * Render the energy breakdown chart.
   *
   * @param {object} energy_conical — { Wi, Wf, Wr, Wtotal } for conical die
   * @param {object} energy_curved  — { Wi, Wf, Wr, Wtotal } for curved die
   */
  function render(energy_conical, energy_curved) {
    const canvas = document.getElementById('energyChart');
    if (!canvas) return;

    if (chart) { chart.destroy(); chart = null; }

    const labels = ['Ideal (Wᵢ)', 'Friction (Wf)', 'Redundant (Wr)', 'Total'];

    const conical_data = [
      parseFloat(energy_conical.Wi.toFixed(2)),
      parseFloat(energy_conical.Wf.toFixed(2)),
      parseFloat(energy_conical.Wr.toFixed(2)),
      parseFloat(energy_conical.Wtotal.toFixed(2)),
    ];

    const curved_data = [
      parseFloat(energy_curved.Wi.toFixed(2)),
      parseFloat(energy_curved.Wf.toFixed(2)),
      parseFloat(energy_curved.Wr.toFixed(2)),
      parseFloat(energy_curved.Wtotal.toFixed(2)),
    ];

    chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Conical die',
            data: conical_data,
            backgroundColor: 'rgba(240,112,64,0.65)',
            borderColor: '#f07040',
            borderWidth: 1,
            borderRadius: 3,
          },
          {
            label: 'Curved (streamlined) die',
            data: curved_data,
            backgroundColor: 'rgba(91,156,246,0.65)',
            borderColor: '#5b9cf6',
            borderWidth: 1,
            borderRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'start',
            labels: {
              color: '#a8a49d',
              font: { family: 'DM Mono, monospace', size: 11 },
              boxWidth: 10,
              boxHeight: 10,
              usePointStyle: false,
            },
          },
          tooltip: {
            backgroundColor: '#1a1c1f',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            titleColor: '#a8a49d',
            bodyColor: '#f0ede8',
            titleFont: { family: 'DM Mono, monospace', size: 11 },
            bodyFont:  { family: 'DM Mono, monospace', size: 11 },
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} MPa`,
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: '#a8a49d',
              font: { family: 'DM Mono, monospace', size: 11 },
            },
            grid: { color: 'rgba(255,255,255,0.04)' },
          },
          y: {
            title: {
              display: true,
              text: 'Specific energy (MPa)',
              color: '#666360',
              font: { family: 'DM Mono, monospace', size: 11 },
            },
            ticks: {
              color: '#666360',
              font: { family: 'DM Mono, monospace', size: 10 },
            },
            grid: { color: 'rgba(255,255,255,0.04)' },
          },
        },
      },
    });

    // Render energy table below chart
    renderEnergyTable(energy_conical, energy_curved);
  }

  function renderEnergyTable(ec, ecv) {
    const wrap = document.getElementById('energy-table-wrap');
    if (!wrap) return;

    const saving = (a, b) => {
      const pct = ((a - b) / a * 100);
      const cls = pct > 0 ? 'pos' : pct < 0 ? 'neg' : '';
      const sign = pct > 0 ? '−' : '+';
      return `<td class="num ${cls}">${Math.abs(pct).toFixed(1)}% ${sign}</td>`;
    };

    wrap.innerHTML = `
      <table class="energy-table">
        <thead>
          <tr>
            <th>Component</th>
            <th style="text-align:right">Conical (MPa)</th>
            <th style="text-align:right">Curved (MPa)</th>
            <th style="text-align:right">Saving</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Ideal work Wᵢ</td>
            <td class="num">${ec.Wi.toFixed(2)}</td>
            <td class="num">${ecv.Wi.toFixed(2)}</td>
            ${saving(ec.Wi, ecv.Wi)}
          </tr>
          <tr>
            <td>Friction work Wf</td>
            <td class="num">${ec.Wf.toFixed(2)}</td>
            <td class="num">${ecv.Wf.toFixed(2)}</td>
            ${saving(ec.Wf, ecv.Wf)}
          </tr>
          <tr>
            <td>Redundant work Wr</td>
            <td class="num">${ec.Wr.toFixed(2)}</td>
            <td class="num">${ecv.Wr.toFixed(2)}</td>
            ${saving(ec.Wr, ecv.Wr)}
          </tr>
          <tr style="font-weight:500;">
            <td>Total Wtotal</td>
            <td class="num">${ec.Wtotal.toFixed(2)}</td>
            <td class="num">${ecv.Wtotal.toFixed(2)}</td>
            ${saving(ec.Wtotal, ecv.Wtotal)}
          </tr>
        </tbody>
      </table>
    `;
  }

  function destroy() {
    if (chart) { chart.destroy(); chart = null; }
  }

  return { render, destroy };

})();
