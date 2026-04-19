/**
 * profile.js — Streamlined curved die profile generator
 *
 * Generates the 3rd-order (cubic Hermite) polynomial die profile that
 * minimises redundant work at entry and exit zones by enforcing:
 *   - Zero slope (horizontal tangent) at entry  → gentle start
 *   - Zero slope at exit                         → smooth land transition
 *
 * The polynomial r(z) is derived from the boundary conditions:
 *   r(0)  = R_in,   r'(0) = 0
 *   r(L)  = R_out,  r'(L) = 0
 *
 * Solving for coefficients of: r(z) = a·z³ + b·z² + c·z + d
 *   d = R_in
 *   c = 0
 *   b = 3·(R_out − R_in) / L²
 *   a = −2·(R_out − R_in) / L³
 *
 * This is identical to the C++ implementation in the paper appendix.
 */

const ProfileGenerator = (() => {

  /**
   * Generate the streamlined cubic polynomial die profile.
   *
   * @param {number} R_in     — entry (billet) radius (mm)
   * @param {number} R_out    — exit (extrudate) radius (mm)
   * @param {number} L        — die axial length (mm)
   * @param {number} N        — number of discrete points along z-axis
   * @returns {object}        — arrays: z, r_curved, r_conical, local_angle_deg, alpha_conical_deg
   */
  function generate(R_in, R_out, L, N = 120) {
    if (R_out >= R_in) throw new Error('R_out must be less than R_in for a converging die');
    if (L <= 0)        throw new Error('Die length L must be positive');

    // Cubic polynomial coefficients (zero-slope BC at both ends)
    const dR = R_out - R_in;             // negative for converging die
    const a  = -2.0 * dR / Math.pow(L, 3);
    const b  =  3.0 * dR / Math.pow(L, 2);
    const c  = 0.0;
    const d  = R_in;

    // Conical die — straight line from R_in to R_out
    const alpha_conical_rad = Math.atan((R_in - R_out) / L);
    const alpha_conical_deg = alpha_conical_rad * (180 / Math.PI);

    const z_arr           = [];
    const r_curved_arr    = [];
    const r_conical_arr   = [];
    const local_angle_arr = [];   // local tangent angle of curved profile (degrees)

    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const z = t * L;

      // Cubic curved profile radius
      const r_c = a * z ** 3 + b * z ** 2 + c * z + d;

      // Conical profile radius (linear interpolation)
      const r_lin = R_in + (R_out - R_in) * t;

      // Local derivative dr/dz of curved profile
      const dr_dz = 3 * a * z ** 2 + 2 * b * z + c;

      // Local tangent angle (semi-angle) of the curved profile at position z
      const angle_rad = Math.atan(Math.abs(dr_dz));
      const angle_deg = angle_rad * (180 / Math.PI);

      z_arr.push(parseFloat(z.toFixed(3)));
      r_curved_arr.push(parseFloat(r_c.toFixed(4)));
      r_conical_arr.push(parseFloat(r_lin.toFixed(4)));
      local_angle_arr.push(parseFloat(angle_deg.toFixed(3)));
    }

    return {
      z:              z_arr,
      r_curved:       r_curved_arr,
      r_conical:      r_conical_arr,
      local_angle:    local_angle_arr,
      alpha_conical_deg,

      // Profile statistics
      max_local_angle: Math.max(...local_angle_arr),
      avg_local_angle: local_angle_arr.reduce((s, v) => s + v, 0) / local_angle_arr.length,
      min_local_angle: Math.min(...local_angle_arr),
    };
  }

  /**
   * Compute second-order curvature κ(z) = |r''| / (1 + r'²)^(3/2)
   * High curvature means rapid angle change → higher local redundant work.
   *
   * @param {number} R_in
   * @param {number} R_out
   * @param {number} L
   * @param {number} N
   * @returns {number[]} curvature array
   */
  function curvature(R_in, R_out, L, N = 120) {
    const dR = R_out - R_in;
    const a  = -2.0 * dR / Math.pow(L, 3);
    const b  =  3.0 * dR / Math.pow(L, 2);

    const kappa = [];
    for (let i = 0; i <= N; i++) {
      const z     = (i / N) * L;
      const drdz  = 3 * a * z ** 2 + 2 * b * z;
      const d2rdz = 6 * a * z + 2 * b;
      const k     = Math.abs(d2rdz) / Math.pow(1 + drdz ** 2, 1.5);
      kappa.push(parseFloat(k.toFixed(6)));
    }
    return kappa;
  }

  return { generate, curvature };

})();
