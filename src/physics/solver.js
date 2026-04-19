/**
 * solver.js — Core extrusion die optimisation solver
 *
 * Implements a three-layer analytical chain based on the
 * Multi-Scale Adaptive Geometric Strategy (MSAGS) described in:
 *   Mhapsekar & Singh, IIT Guwahati, April 2026
 *
 * ┌─────────────────────────────────────────────────────┐
 * │  Layer 1 — Avitzur Upper Bound                      │
 * │  Computes optimal semi-angle α* from friction & R   │
 * │                                                     │
 * │  Layer 2 — Slab Method                              │
 * │  Computes extrusion pressure using B-factor         │
 * │                                                     │
 * │  Layer 3 — Energy decomposition                     │
 * │  Separates Wi, Wf, Wr for conical and curved dies   │
 * └─────────────────────────────────────────────────────┘
 */

const Solver = (() => {

  /**
   * Temperature-corrected flow stress scaling factor.
   * Uses an exponential decay model calibrated to material class.
   *
   * @param {object} mat  — material entry from MATERIALS
   * @param {number} T    — process temperature (°C)
   * @returns {number}    — dimensionless scaling factor [0.1, 1.0]
   */
  function temperatureScaling(mat, T) {
    if (mat.type === 'polymer') {
      // Polymers show rapid viscosity drop near Tm
      const T_ref = 20;
      const T_drop = mat.Tm - T_ref;
      const normalised = Math.min(1.0, Math.max(0.0, (T - T_ref) / T_drop));
      return Math.max(0.05, 1.0 - Math.pow(normalised, 1.5));
    }
    // Metals: exponential decay from ambient
    const T_ref = 20;
    const decay = mat.temp_decay;
    return Math.max(0.10, 1.0 - decay * (T - T_ref));
  }

  /**
   * Strain-hardened, temperature-corrected effective flow stress.
   * Power-law model:  σ_f = C · ε^n  (Hollomon equation)
   * Then scaled for temperature.
   *
   * @param {object} mat      — material
   * @param {number} eps      — true (logarithmic) strain
   * @param {number} T        — temperature (°C)
   * @returns {number}        — effective flow stress (MPa)
   */
  function flowStress(mat, eps, T) {
    const eps_eff = Math.max(eps, 0.001); // avoid ε=0 singularity
    const sigma_base = mat.C * Math.pow(eps_eff, mat.n);
    return sigma_base * temperatureScaling(mat, T);
  }

  /**
   * Avitzur's Upper Bound optimal die semi-angle.
   * Derived by differentiating total power w.r.t. α and setting dP/dα = 0.
   *
   *   α* ≈ √( (2/3) · m · ln(R) )
   *
   * where R = area reduction ratio = (Ri/Rf)²
   * Then clamped to the material's recommended range.
   *
   * @param {number} m        — Tresca friction factor
   * @param {number} R_ratio  — area reduction ratio
   * @param {object} mat      — material (for range clamping)
   * @returns {number}        — optimal semi-angle (degrees)
   */
  function avitzurOptimalAngle(m, R_ratio, mat) {
    const arg = (2.0 / 3.0) * m * Math.log(R_ratio);
    const alpha_rad = Math.sqrt(Math.max(arg, 0.001));
    let alpha_deg = alpha_rad * (180 / Math.PI);
    // Clamp to material-validated range
    alpha_deg = Math.max(mat.alpha_range[0], Math.min(mat.alpha_range[1], alpha_deg));
    return alpha_deg;
  }

  /**
   * Material Class Multiplier (Km) — MSAGS Stage 2 refinement.
   * Adjusts the Avitzur baseline based on material rheology class.
   *
   * @param {object} mat  — material
   * @param {number} T    — temperature
   * @param {number} n    — strain-hardening exponent
   * @returns {number}    — multiplier applied to raw α*
   */
  function materialClassMultiplier(mat, T, n) {
    if (mat.type === 'polymer') {
      // Polymers: wider angles due to shear-thinning flow
      return 1.0 + 0.3 * n;
    }
    const isHot = T > (mat.Trecryst || 400);
    if (isHot) {
      // Hot metal: viscoplastic → gentler convergence needed
      return 0.85 - 0.1 * n;
    }
    // Cold metal: rigid-plastic → standard Avitzur
    return 1.0 - 0.05 * n;
  }

  /**
   * Slab Method extrusion pressure.
   * Classical formulation with Coulomb friction:
   *
   *   p = σ_y · (1 + B) / B · [ (Ri/Rf)^(2B) − 1 ]  +  p_back
   *
   * where B = μ / tan(α)
   *
   * @param {number} sy_eff   — effective flow stress (MPa)
   * @param {number} mu       — Coulomb friction coefficient
   * @param {number} alpha_rad — die semi-angle (radians)
   * @param {number} R_ratio  — area reduction ratio
   * @param {number} back_p   — back pressure (MPa)
   * @returns {number}        — extrusion pressure (MPa)
   */
  function slabPressure(sy_eff, mu, alpha_rad, R_ratio, back_p) {
    const B = mu / Math.tan(alpha_rad);
    if (Math.abs(B) < 1e-6) {
      // Frictionless limit: p = σ_y · ln(R)
      return sy_eff * Math.log(R_ratio) + back_p;
    }
    const p = sy_eff * ((1 + B) / B) * (Math.pow(R_ratio, B) - 1);
    return p + back_p;
  }

  /**
   * Energy component decomposition for conical die.
   *
   * Wi — ideal work (independent of die angle)
   *        Wi = σ_y · ln(R)
   *
   * Wf — friction work on conical surface
   *        Wf = m · k · A_contact / A_billet · σ_y
   *        simplified as: Wf ∝ m · μ · sy / tan(α)
   *
   * Wr — redundant work (internal shearing at entry/exit zones)
   *        Wr = (2/3) · k · α² · ln(R)    (Avitzur approximation)
   *
   * @param {number} sy_eff   — flow stress (MPa)
   * @param {number} m        — Tresca factor
   * @param {number} mu       — Coulomb factor
   * @param {number} alpha_rad — semi-angle (radians)
   * @param {number} R_ratio  — area reduction ratio
   * @param {number} eps_true — true strain
   * @returns {{ Wi, Wf, Wr, Wtotal }}
   */
  function energyComponents(sy_eff, m, mu, alpha_rad, R_ratio, eps_true) {
    const k = sy_eff / Math.sqrt(3);     // shear flow stress
    const Wi = sy_eff * eps_true;
    const Wf = m * k * (mu / Math.tan(alpha_rad)) * eps_true * 1.5;
    const Wr = (2.0 / 3.0) * k * alpha_rad * alpha_rad * eps_true;
    return { Wi, Wf, Wr, Wtotal: Wi + Wf + Wr };
  }

  /**
   * Curved (streamlined) die energy estimate.
   * The polynomial profile reduces both Wf and Wr by providing
   * a variable local angle — smaller at entry, larger mid-zone.
   * Savings factors are based on FEM comparisons in the literature.
   *
   * Wf reduction: ~18–22% due to smaller entry contact zone
   * Wr reduction: ~45–55% due to smooth velocity field
   *
   * @param {{ Wi, Wf, Wr }} conical — energy components of conical die
   * @param {number} n               — strain-hardening exponent (scales Wr savings)
   * @returns {{ Wi, Wf, Wr, Wtotal }}
   */
  function curvedDieEnergy(conical, n) {
    const Wf_save = 0.18 + 0.04 * n;   // 18–22% saving
    const Wr_save = 0.45 + 0.10 * n;   // 45–55% saving
    const Wi = conical.Wi;
    const Wf = conical.Wf * (1 - Wf_save);
    const Wr = conical.Wr * (1 - Wr_save);
    return { Wi, Wf, Wr, Wtotal: Wi + Wf + Wr };
  }

  /**
   * Adiabatic temperature rise estimate.
   * Assumes most of the deformation work converts to heat.
   *   ΔT = (0.9 · σ_y · ε) / (ρ · cp) × 10⁶  (unit correction Pa→MPa)
   *
   * @param {object} mat   — material
   * @param {number} sy    — flow stress (MPa)
   * @param {number} eps   — true strain
   * @returns {number}     — temperature rise (°C)
   */
  function adiabaticTempRise(mat, sy, eps) {
    return (0.90 * sy * eps * 1e6) / (mat.rho * mat.cp);
  }

  /**
   * Peclet number — ratio of convective to conductive heat transfer.
   * High Pe → heat is swept downstream before conduction can dissipate it.
   *   Pe = ρ · v · Ri / k_thermal × cp
   *
   * @param {object} mat     — material
   * @param {number} speed   — extrusion speed (mm/s → convert to m/s)
   * @param {number} R_in    — billet radius (mm → convert to m)
   * @returns {number}       — dimensionless Peclet number
   */
  function pecletNumber(mat, speed, R_in) {
    const v = speed * 0.001;      // mm/s → m/s
    const L = R_in * 0.001;       // mm → m
    return (mat.rho * v * L * mat.cp) / mat.k_thermal;
  }

  /**
   * Dead metal zone (DMZ) risk assessment.
   * DMZ forms when local friction stress exceeds the material shear strength,
   * causing corner stagnation. Onset is typically at α > 45° for most metals.
   *
   * @param {number} alpha_deg  — die semi-angle (degrees)
   * @param {object} mat        — material
   * @param {number} m          — friction factor
   * @returns {'low'|'moderate'|'high'}
   */
  function dmzRisk(alpha_deg, mat, m) {
    if (mat.type === 'polymer' || mat.dmz_angle === null) return 'n/a';
    const threshold = mat.dmz_angle * (1 - 0.3 * m);   // friction lowers threshold
    if (alpha_deg > threshold) return 'high';
    if (alpha_deg > threshold * 0.85) return 'moderate';
    return 'low';
  }

  /**
   * Main computation entry point.
   * Returns a comprehensive result object for use by all UI modules.
   *
   * @param {object} inputs
   * @param {number} inputs.R_in     — initial billet radius (mm)
   * @param {number} inputs.R_out    — final extrudate radius (mm)
   * @param {number} inputs.T        — process temperature (°C)
   * @param {number} inputs.speed    — extrusion speed (mm/s)
   * @param {number} inputs.back_p   — back pressure (MPa)
   * @param {string} inputs.matKey   — key into MATERIALS
   * @param {string} inputs.lubKey   — key into LUBRICANTS
   * @returns {object} results
   */
  function compute(inputs) {
    const { R_in, R_out, T, speed, back_p, matKey, lubKey } = inputs;

    if (R_out >= R_in) throw new Error('R_out must be less than R_in');
    if (R_in <= 0 || R_out <= 0) throw new Error('Radii must be positive');

    const mat = MATERIALS[matKey];
    const lub = LUBRICANTS[lubKey];

    if (!mat) throw new Error(`Unknown material: ${matKey}`);
    if (!lub) throw new Error(`Unknown lubricant: ${lubKey}`);

    // ── Geometric ratios ───────────────────────────────────
    const R_ratio = Math.pow(R_in / R_out, 2);       // area reduction ratio
    const eps_true = Math.log(R_ratio);               // true (logarithmic) strain
    const reduction_pct = (1 - 1 / R_ratio) * 100;  // % area reduction

    // ── Material rheology ──────────────────────────────────
    const sy_eff = flowStress(mat, eps_true, T);
    const k = sy_eff / Math.sqrt(3);                  // Tresca shear flow stress

    // ── Friction parameters ─────────────────────────────────
    const m = lub.m;
    const mu = lub.mu;

    // ── Avitzur optimal angle (MSAGS Stage 1) ──────────────
    const alpha_raw = avitzurOptimalAngle(m, R_ratio, mat);

    // ── Material class multiplier (MSAGS Stage 2) ──────────
    const Km = materialClassMultiplier(mat, T, mat.n);
    let alpha_conical = alpha_raw * Km;
    // Final clamp to material range
    alpha_conical = Math.max(mat.alpha_range[0], Math.min(mat.alpha_range[1], alpha_conical));

    const alpha_conical_rad = alpha_conical * Math.PI / 180;

    // ── Curved die profile angles ──────────────────────────
    // Entry angle (smooth start) and exit angle (controlled convergence)
    const alpha_curved_entry = alpha_conical * 0.45;
    const alpha_curved_peak  = alpha_conical * 1.10;   // local max near mid-zone
    const alpha_curved_exit  = alpha_conical * 0.78;

    // ── Die geometry ───────────────────────────────────────
    const L_die = (R_in - R_out) / Math.tan(alpha_conical_rad);
    const A_billet = Math.PI * R_in * R_in;
    const A_exit   = Math.PI * R_out * R_out;

    // ── Slab method pressure ───────────────────────────────
    const B_factor = mu / Math.tan(alpha_conical_rad);
    const p_conical = slabPressure(sy_eff, mu, alpha_conical_rad, R_ratio, back_p);

    // ── Energy components ──────────────────────────────────
    const energy_conical = energyComponents(sy_eff, m, mu, alpha_conical_rad, R_ratio, eps_true);
    const energy_curved  = curvedDieEnergy(energy_conical, mat.n);

    // ── Force & power ──────────────────────────────────────
    const F_extrusion = p_conical * A_billet / 1000; // kN (A in mm², p in MPa → N/mm²)
    const power_kW    = F_extrusion * speed / 1000;  // kW

    // ── Pressure saving ────────────────────────────────────
    const pressure_saving_pct =
      ((energy_conical.Wtotal - energy_curved.Wtotal) / energy_conical.Wtotal) * 100;

    // ── Thermal analysis ───────────────────────────────────
    const dT_adiabatic = adiabaticTempRise(mat, sy_eff, eps_true);
    const T_die_zone   = T + 0.7 * dT_adiabatic;     // partial heat loss assumed
    const Pe           = pecletNumber(mat, speed, R_in);
    const near_Tm      = T_die_zone > 0.85 * mat.Tm;

    // ── Dead metal zone ────────────────────────────────────
    const dmz = dmzRisk(alpha_conical, mat, m);

    // ── Lubricant compatibility check ──────────────────────
    const lub_compatible = lub.compatible.includes(mat.type) &&
      T >= lub.temp_range[0] && T <= lub.temp_range[1];

    return {
      // Inputs (echoed for display)
      R_in, R_out, T, speed, back_p, mat, lub, matKey, lubKey,

      // Geometry
      R_ratio,
      eps_true,
      reduction_pct,
      L_die,
      A_billet,
      A_exit,

      // Material
      sy_eff,
      k,

      // Friction
      m, mu, B_factor,

      // Optimal angles
      alpha_raw,
      alpha_conical,      // final optimal conical semi-angle (degrees)
      alpha_curved_entry,
      alpha_curved_peak,
      alpha_curved_exit,

      // Pressures & forces
      p_conical,
      F_extrusion,
      power_kW,

      // Energy breakdown
      energy_conical,
      energy_curved,
      pressure_saving_pct,

      // Thermal
      dT_adiabatic,
      T_die_zone,
      Pe,
      near_Tm,

      // Risk & diagnostics
      dmz,
      lub_compatible,

      // Convenience
      alpha_conical_rad,
    };
  }

  return { compute };

})();
