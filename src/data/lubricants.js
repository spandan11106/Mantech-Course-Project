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
  dry: { name: 'Dry (no lubricant)', m: 0.40, mu: 0.20, temp_range: [20, 400], compatible: ['metal', 'polymer'], score: { metal: 1, polymer: 1 }, notes: 'Sticking friction likely. Severe tool wear.' },
  moly: { name: 'Molybdenum disulfide (MoS₂)', m: 0.08, mu: 0.04, temp_range: [20, 400], compatible: ['metal'], score: { metal: 9, polymer: 0 }, notes: 'Lamellar solid. Excellent at moderate temps. Oxidizes above 400C.' },
  graphite: { name: 'Graphite powder/grease', m: 0.12, mu: 0.06, temp_range: [20, 700], compatible: ['metal'], score: { metal: 7, polymer: 0 }, notes: 'High-temp capable solid. Needs moisture to lubricate effectively.' },
  mineral_oil: { name: 'Mineral oil (light)', m: 0.18, mu: 0.09, temp_range: [20, 150], compatible: ['metal', 'polymer'], score: { metal: 5, polymer: 6 }, notes: 'Low-pressure, high-speed drawing applications only.' },
  ptfe: { name: 'PTFE / Teflon coating', m: 0.06, mu: 0.03, temp_range: [20, 260], compatible: ['metal', 'polymer'], score: { metal: 8, polymer: 9 }, notes: 'Lowest friction solid coating. Great for Al wire drawing.' },
  zinc_phos: { name: 'Zinc phosphate + stearate soap', m: 0.07, mu: 0.035, temp_range: [20, 300], compatible: ['metal'], score: { metal: 10, polymer: 0 }, notes: 'Industry standard for severe cold steel extrusion.' },
  castor: { name: 'Castor Oil', m: 0.15, mu: 0.08, temp_range: [20, 200], compatible: ['metal', 'polymer'], score: { metal: 6, polymer: 8 }, notes: 'Excellent boundary lubrication properties due to polar molecules.' },
  palm: { name: 'Palm Oil', m: 0.16, mu: 0.085, temp_range: [20, 180], compatible: ['metal', 'polymer'], score: { metal: 5, polymer: 7 }, notes: 'Traditional organic drawing oil, often emulsified.' },
  lard: { name: 'Lard Oil', m: 0.14, mu: 0.07, temp_range: [20, 150], compatible: ['metal'], score: { metal: 6, polymer: 0 }, notes: 'Excellent film strength, historically important for heavy cutting/drawing.' },
  syn_ester: { name: 'Synthetic Ester Oil', m: 0.13, mu: 0.065, temp_range: [20, 250], compatible: ['metal', 'polymer'], score: { metal: 7, polymer: 7 }, notes: 'High performance, good thermal stability, biodegradable.' },
  pao: { name: 'Polyalphaolefin (PAO)', m: 0.15, mu: 0.075, temp_range: [20, 200], compatible: ['metal', 'polymer'], score: { metal: 6, polymer: 7 }, notes: 'Premium synthetic base oil. Excellent viscosity-temperature behavior.' },
  silicone: { name: 'Silicone Oil', m: 0.17, mu: 0.09, temp_range: [20, 250], compatible: ['polymer'], score: { metal: 2, polymer: 10 }, notes: 'Excellent for polymer molding/extrusion. Poor steel-on-steel boundary lubricant.' },
  chlor_paraffin: { name: 'Chlorinated Paraffin (Extreme Pressure)', m: 0.09, mu: 0.045, temp_range: [20, 250], compatible: ['metal'], score: { metal: 7, polymer: 0 }, notes: 'Outstanding EP properties. Forms metal chlorides at high temp. Environmental concerns.' },
  sulfur_lard: { name: 'Sulfurised Lard Oil (EP)', m: 0.10, mu: 0.05, temp_range: [20, 300], compatible: ['metal'], score: { metal: 6, polymer: 0 }, notes: 'Forms sacrificial metal sulfides preventing welding at high pressures.' },
  naph_oil: { name: 'Naphthenic Oil', m: 0.19, mu: 0.095, temp_range: [20, 140], compatible: ['metal', 'polymer'], score: { metal: 4, polymer: 5 }, notes: 'Good solvency, low pour point. Used in mild drawing.' },
  li_complex: { name: 'Lithium Complex Grease', m: 0.13, mu: 0.065, temp_range: [20, 180], compatible: ['metal', 'polymer'], score: { metal: 5, polymer: 6 }, notes: 'Versatile multi-purpose grease. Good water resistance.' },
  ca_sulfonate: { name: 'Calcium Sulfonate Grease', m: 0.12, mu: 0.06, temp_range: [20, 200], compatible: ['metal'], score: { metal: 7, polymer: 0 }, notes: 'Exceptional extreme pressure (EP) properties and washout resistance.' },
  al_complex: { name: 'Aluminum Complex Grease', m: 0.14, mu: 0.07, temp_range: [20, 160], compatible: ['metal', 'polymer'], score: { metal: 5, polymer: 6 }, notes: 'Food grade potential. Good water resistance.' },
  polyurea: { name: 'Polyurea Grease', m: 0.12, mu: 0.06, temp_range: [20, 200], compatible: ['metal', 'polymer'], score: { metal: 6, polymer: 6 }, notes: 'Long life, high temp, ashless. Used in sealed-for-life bearings/dies.' },
  ba_complex: { name: 'Barium Complex Grease', m: 0.13, mu: 0.065, temp_range: [20, 150], compatible: ['metal'], score: { metal: 5, polymer: 0 }, notes: 'High speed, high water resistance. Toxicological concerns limit use.' },
  cu_plate: { name: 'Copper Plating', m: 0.18, mu: 0.09, temp_range: [20, 900], compatible: ['metal'], score: { metal: 8, polymer: 0 }, notes: 'Used as a solid lubricant for extreme drawing of stainless steel wire.' },
  pb_plate: { name: 'Lead Plating', m: 0.15, mu: 0.08, temp_range: [20, 300], compatible: ['metal'], score: { metal: 6, polymer: 0 }, notes: 'Historical extreme pressure solid lube. Phased out due to toxicity.' },
  glass: { name: 'Glass Powder (Sejournet process)', m: 0.10, mu: 0.05, temp_range: [700, 1200], compatible: ['metal'], score: { metal: 9, polymer: 0 }, notes: 'Melts to become viscous hydrodynamic film during hot steel/titanium extrusion.' },
  boron_n: { name: 'Hexagonal Boron Nitride (hBN)', m: 0.11, mu: 0.055, temp_range: [20, 900], compatible: ['metal', 'polymer'], score: { metal: 9, polymer: 6 }, notes: '"White graphite". Excellent high temp stability, clean.' },
  talc: { name: 'Talc Powder', m: 0.20, mu: 0.10, temp_range: [20, 500], compatible: ['metal', 'polymer'], score: { metal: 4, polymer: 5 }, notes: 'Mild solid lubricant and release agent.' },
  soapstone: { name: 'Soapstone / Steatite', m: 0.22, mu: 0.11, temp_range: [20, 600], compatible: ['metal'], score: { metal: 5, polymer: 0 }, notes: 'Traditional high-temp drawing block.' },
  stearic_acid: { name: 'Stearic Acid', m: 0.10, mu: 0.05, temp_range: [20, 100], compatible: ['metal'], score: { metal: 5, polymer: 0 }, notes: 'Reacts with metal surfaces to form low-shear metallic soaps.' },
  beeswax: { name: 'Beeswax', m: 0.12, mu: 0.06, temp_range: [20, 60], compatible: ['metal', 'polymer'], score: { metal: 3, polymer: 4 }, notes: 'Excellent boundary film, but very low melting point.' },
  lanolin: { name: 'Lanolin', m: 0.13, mu: 0.065, temp_range: [20, 80], compatible: ['metal'], score: { metal: 4, polymer: 0 }, notes: 'Polar natural wax, adheres strongly to metal.' },
  ws2: { name: 'Tungsten Disulfide (WS₂)', m: 0.07, mu: 0.035, temp_range: [20, 650], compatible: ['metal', 'polymer'], score: { metal: 9, polymer: 5 }, notes: 'Similar to MoS2 but handles higher temperatures.' },
  water_emul: { name: 'Synthetic Water Emulsion', m: 0.20, mu: 0.10, temp_range: [20, 100], compatible: ['metal'], score: { metal: 3, polymer: 6 }, notes: 'Provides excellent cooling but lower lubricity. High speed operations.' }
};
