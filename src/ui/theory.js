/**
 * theory.js — Theory and equations panel renderer
 *
 * Displays the analytical framework behind the computed results,
 * showing the actual numbers substituted into each equation.
 */

const TheoryUI = (() => {

  /**
   * Render theory cards into #theory-content.
   * @param {object} res — full solver result object
   */
  function render(res) {
    const el = document.getElementById('theory-content');
    if (!el) return;

    const r = (v, d = 2) => parseFloat(v).toFixed(d);

    el.innerHTML = `
      <div class="theory-card">
        <h3>Avitzur Upper Bound — Optimal Angle</h3>
        <p>
          The optimal die semi-angle is derived by differentiating the total power
          functional with respect to α and setting dP/dα = 0. This balances
          friction work (decreasing with α) against redundant work (increasing with α).
        </p>
        <div class="eq-block">
          α* = √( (2/3) · m · ln(R) )
        </div>
        <div class="eq-block">
          α* = √( (2/3) · ${r(res.m, 3)} · ln(${r(res.R_ratio, 3)}) )
             = √( ${r((2/3) * res.m * Math.log(res.R_ratio), 4)} )
             = ${r(res.alpha_raw, 2)}°  (raw)
        </div>
        <p>
          Applied material class multiplier Km = ${r(res.alpha_conical / res.alpha_raw, 3)}
          and clamped to material range [${res.mat.alpha_range[0]}°, ${res.mat.alpha_range[1]}°]:
        </p>
        <div class="eq-block">
          α*_final = ${r(res.alpha_conical, 2)}°
        </div>
      </div>

      <div class="theory-card">
        <h3>Slab Method — Extrusion Pressure</h3>
        <p>
          The Slab Method performs a force balance on a differential slab element,
          assuming homogeneous deformation and Coulomb friction. The B-factor
          encodes the ratio of friction to die geometry.
        </p>
        <div class="eq-block">
          B = μ / tan(α) = ${r(res.mu, 3)} / tan(${r(res.alpha_conical, 2)}°)
            = ${r(res.B_factor, 4)}
        </div>
        <div class="eq-block">
          p = σ_y · (1+B)/B · [ R^B − 1 ] + p_back
        </div>
        <div class="eq-block">
          p = ${r(res.sy_eff, 1)} · ${r((1 + res.B_factor) / res.B_factor, 3)}
            · [ ${r(res.R_ratio, 3)}^${r(res.B_factor, 4)} − 1 ]
            + ${res.back_p}
          = ${r(res.p_conical, 1)} MPa
        </div>
      </div>

      <div class="theory-card">
        <h3>Energy Balance — Three Components</h3>
        <p>
          Total extrusion work is the sum of ideal, friction, and redundant
          contributions. The Avitzur optimum minimises Wf + Wr.
        </p>
        <div class="eq-block">
          Wᵢ = σ_y · ε = ${r(res.sy_eff, 1)} · ${r(res.eps_true, 3)}
             = ${r(res.energy_conical.Wi, 2)} MPa
        </div>
        <div class="eq-block">
          Wf = m · k · (μ/tan α) · ε
             = ${r(res.energy_conical.Wf, 2)} MPa  (conical)
             = ${r(res.energy_curved.Wf, 2)} MPa  (curved)
        </div>
        <div class="eq-block">
          Wr = (2/3) · k · α² · ε
             = ${r(res.energy_conical.Wr, 2)} MPa  (conical)
             = ${r(res.energy_curved.Wr, 2)} MPa  (curved)
        </div>
      </div>

      <div class="theory-card">
        <h3>Streamlined Die Profile — Cubic Polynomial</h3>
        <p>
          The streamlined profile r(z) uses a 3rd-order polynomial with
          zero-slope boundary conditions at entry and exit (smooth tangent),
          eliminating abrupt angle changes that generate redundant work.
        </p>
        <div class="eq-block">
          r(z) = a·z³ + b·z²  +  d
        </div>
        <div class="eq-block">
          a = −2·(Rf − Ri) / L³
          b =  3·(Rf − Ri) / L²
          d = Ri = ${res.R_in} mm,  L = ${r(res.L_die, 1)} mm
        </div>
        <div class="eq-block">
          α_local(z) = arctan |dr/dz|
          Entry: ${r(res.alpha_curved_entry, 1)}° → Peak: ${r(res.alpha_curved_peak, 1)}° → Exit: ${r(res.alpha_curved_exit, 1)}°
        </div>
      </div>

      <div class="theory-card">
        <h3>Thermal Analysis</h3>
        <p>
          Deformation work is partially converted to heat (Taylor-Quinney coefficient
          β ≈ 0.90 for metals). The adiabatic temperature rise sets a speed limit.
        </p>
        <div class="eq-block">
          ΔT_adiabatic = 0.9 · σ_y · ε / (ρ · cₚ)
                       = 0.9 · ${r(res.sy_eff,1)} · ${r(res.eps_true,3)}
                         / (${res.mat.rho} · ${res.mat.cp} / 10⁶)
                       = +${r(res.dT_adiabatic, 1)} °C
        </div>
        <div class="eq-block">
          Pe = ρ · v · R · cₚ / λ
             = ${res.Pe.toFixed(1)}
          ${res.Pe > 50 ? '→ convection-dominated (high speed)' : '→ conduction can dissipate heat'}
        </div>
      </div>

      <div class="theory-card">
        <h3>Material Class Multiplier Kₘ (MSAGS Stage 2)</h3>
        <p>
          Adjusts the Avitzur baseline angle to account for material rheology class,
          temperature regime, and strain-hardening behaviour. This is Stage 2 of the
          Multi-Scale Adaptive Geometric Strategy.
        </p>
        <div class="eq-block">
          ${res.mat.type === 'polymer'
            ? `Polymer Kₘ = 1 + 0.3·n = 1 + 0.3·${res.mat.n} = ${r(1 + 0.3 * res.mat.n, 3)}`
            : res.T > (res.mat.Trecryst || 400)
              ? `Hot metal Kₘ = 0.85 − 0.1·n = ${r(0.85 - 0.1 * res.mat.n, 3)}  (above Trecryst)`
              : `Cold metal Kₘ = 1 − 0.05·n = ${r(1 - 0.05 * res.mat.n, 3)}  (rigid-plastic regime)`
          }
        </div>
        <p>
          Material type: <strong>${res.mat.type}</strong> ·
          ${res.mat.Trecryst ? `Trecryst = ${res.mat.Trecryst} °C` : 'No recrystallisation (polymer)'} ·
          n = ${res.mat.n}
        </p>
      </div>
    `;
  }

  return { render };

})();
