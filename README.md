# Extrusion Die Optimiser

**Multi-Scale Geometric Optimisation of the Extrusion Die Angle**
*Spandan Mhapsekar (240103103) & Shlok Pratap Singh (240103099)*
*Department of Mechanical Engineering, IIT Guwahati — April 2026*

---

## Overview

A browser-based engineering tool that computes the optimal conical and curved
(streamlined) extrusion die angles from first principles, implementing the
Multi-Scale Adaptive Geometric Strategy (MSAGS) described in the project report.

**Physics implemented:**
- Avitzur Upper Bound theorem (optimal angle α*)
- Slab Method extrusion pressure (B-factor formulation)
- Energy decomposition: ideal Wᵢ, friction Wf, redundant Wr
- Cubic polynomial streamlined die profile (zero-slope BCs)
- Temperature-corrected flow stress (Hollomon power-law)
- Material Class Multiplier Km (MSAGS Stage 2)
- Adiabatic temperature rise & Peclet number
- Dead metal zone risk assessment

---

## File Structure

```
extrusion-die-optimizer/
│
├── index.html                  ← Main HTML entry point, layout & DOM
│
├── package.json                ← Project metadata & dev server script
│
├── README.md                   ← This file
│
└── src/
    │
    ├── data/
    │   ├── materials.js        ← Material property database (14 materials)
    │   │                           sy0, C, n, Tm, Trecryst, rho, k_thermal,
    │   │                           cp, E, temp_decay, alpha_range, dmz_angle
    │   │
    │   └── lubricants.js       ← Lubricant database (8 conditions)
    │                               Tresca m, Coulomb μ, temp range, compatibility
    │
    ├── physics/
    │   ├── solver.js           ← Core computation engine (MSAGS pipeline)
    │   │                           Avitzur angle, Slab pressure, energy breakdown,
    │   │                           thermal analysis, DMZ risk, Peclet number
    │   │
    │   └── profile.js          ← Cubic polynomial die profile generator
    │                               r(z) = az³ + bz² + d, local angle α(z),
    │                               curvature κ(z)
    │
    ├── charts/
    │   ├── profileChart.js     ← Chart.js dual-axis profile visualisation
    │   │                           r(z) curved vs conical + local angle overlay
    │   │
    │   └── energyChart.js      ← Chart.js grouped bar energy breakdown
    │                               Wᵢ, Wf, Wr, Wtotal for conical vs curved
    │
    └── ui/
        ├── styles.css          ← Full stylesheet (dark industrial aesthetic)
        │                           CSS variables, layout, components, animations
        │
        ├── metrics.js          ← Summary metric cards renderer
        ├── alerts.js           ← Engineering warnings & diagnostics renderer
        ├── params.js           ← Full parameter table renderer (6 sections)
        ├── theory.js           ← Theory & equations panel with live substitution
        └── main.js             ← App entry point; event wiring & orchestration
```

---

## How to Run

### Option 1 — Direct (no install needed)

Simply open `index.html` in any modern browser.

> **Note:** Some browsers block local JS module loading. If the page is blank,
> use Option 2 below.

### Option 2 — Dev server (recommended)

```bash
# Install dependencies (one-time)
npm install

# Start live-reload dev server
npm start
```

Then open `http://localhost:3000` in your browser.

### Option 3 — Python simple server

```bash
python -m http.server 3000
# then open http://localhost:3000
```

---

## Computational Details

### MSAGS Three-Stage Pipeline

**Stage 1 — Avitzur Upper Bound**
```
α* = √( (2/3) · m · ln(R) )
```
where `m` = Tresca friction factor, `R` = area reduction ratio `(Ri/Rf)²`

**Stage 2 — Material Class Multiplier Km**
- Cold metal (T < Trecryst):  `Km = 1 − 0.05·n`
- Hot metal (T ≥ Trecryst):   `Km = 0.85 − 0.10·n`
- Polymer:                     `Km = 1 + 0.30·n`

Final angle: `α_final = clamp(α* · Km, α_min, α_max)`

**Stage 3 — Streamlined profile**
```
r(z) = a·z³ + b·z²  +  Ri
a = −2·(Rf − Ri) / L³
b =  3·(Rf − Ri) / L²
```
Zero-slope BCs at z=0 and z=L enforce smooth material entry/exit.

### Slab Method Pressure
```
B = μ / tan(α)
p = σ_y · (1+B)/B · [R^B − 1]  +  p_back
```

### Energy Components
```
Wᵢ = σ_y · ε                           (ideal work)
Wf = m · k · (μ/tanα) · ε · 1.5        (friction work)
Wr = (2/3) · k · α² · ε               (redundant work, Avitzur)
```

Curved die savings: Wf reduced ~18–22%, Wr reduced ~45–55% (from FEM literature).

---

## References

1. Avitzur, B. — "Handbook of Metal-Forming Processes", Wiley, 1983
2. Hosford & Caddell — "Metal Forming: Mechanics and Metallurgy", Cambridge, 2011
3. ASM Handbook Vol. 14A — "Metalworking: Bulk Forming", ASM International, 2005
4. Schey, J.A. — "Tribology in Metalworking", ASM International, 1983
5. Combined upper bound and slab method, FEM and experimental study (link in report)
6. Simulation of Direct Extrusion using FEM and ANN (link in report)
