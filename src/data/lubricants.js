/**
 * lubricants.js — Lubricant / interface condition database
 *
 * References:
 *   - Schey "Tribology in Metalworking: Friction, Lubrication, and Wear"
 *   - Bay & Wibom "Lubricants for Cold Forging and Extrusion"
 *   - ASM Handbook Vol. 18 (Friction, Lubrication, and Wear)
 *
 * m  — Tresca friction factor (shear friction model), range [0, 1]
 *       τ_interface = m · k   (k = shear flow stress of the workpiece)
 *       m = 0: frictionless; m = 1: full sticking (no sliding)
 *
 * mu — Coulomb friction coefficient μ (used in Slab Method pressure formula)
 *       F_friction = μ · N
 *
 * temp_range — effective temperature range (°C)
 * compatible  — material classes where this lubricant is typically used
 */
const LUBRICANTS = {
  dry: {
    name: 'Dry (no lubricant)',
    m: 0.40,
    mu: 0.20,
    temp_range: [20, 400],
    compatible: ['metal', 'polymer'],
    notes: 'Sticking friction likely above 45° die angle. Severe tool wear. Not recommended for production.'
  },
  moly: {
    name: 'Molybdenum disulfide (MoS₂)',
    m: 0.08,
    mu: 0.04,
    temp_range: [20, 400],
    compatible: ['metal'],
    notes: 'Lamellar solid lubricant. Excellent at moderate temperatures. Degrades above 400 °C in oxidising atmospheres.'
  },
  sodium_stearate: {
    name: 'Sodium stearate (soap)',
    m: 0.10,
    mu: 0.05,
    temp_range: [20, 250],
    compatible: ['metal'],
    notes: 'Classic cold extrusion lubricant. Often applied via phosphate conversion coating. Very effective for Al and steel.'
  },
  graphite: {
    name: 'Graphite grease',
    m: 0.12,
    mu: 0.06,
    temp_range: [20, 700],
    compatible: ['metal'],
    notes: 'High-temp capable solid lubricant. Used for copper, brass, and steel hot extrusion. Contamination risk.'
  },
  mineral_oil: {
    name: 'Mineral oil',
    m: 0.18,
    mu: 0.09,
    temp_range: [20, 150],
    compatible: ['metal', 'polymer'],
    notes: 'Low-pressure applications only. Insufficient film strength at high contact pressures.'
  },
  ptfe: {
    name: 'PTFE / Teflon coating',
    m: 0.06,
    mu: 0.03,
    temp_range: [20, 260],
    compatible: ['metal', 'polymer'],
    notes: 'Lowest friction solid lubricant. Applied as die coating or strip liner. Excellent for aluminium wire drawing.'
  },
  zinc_phos: {
    name: 'Zinc phosphate + soap',
    m: 0.07,
    mu: 0.035,
    temp_range: [20, 300],
    compatible: ['metal'],
    notes: 'Industry standard for cold steel extrusion. Phosphate layer provides reactive carrier; soap reduces interface friction significantly.'
  },
  glass: {
    name: 'Glass lubricant (Séjournet process)',
    m: 0.05,
    mu: 0.025,
    temp_range: [700, 1300],
    compatible: ['metal'],
    notes: 'Viscous glass melt provides excellent lubrication for hot steel and titanium extrusion. Minimum die temperatures ~800 °C.'
  }
};
