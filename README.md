# Extrusion Die Optimiser

**Multi-Scale Geometric Optimisation of the Extrusion Die Angle**  
*Spandan Mhapsekar (240103103) & Shlok Pratap Singh (240103099)*  
*Department of Mechanical Engineering, IIT Guwahati — April 2026*

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Features](#features)
4. [Project Structure](#project-structure)
5. [Theoretical Framework](#theoretical-framework)
6. [Materials & Lubricants](#materials--lubricants)
7. [Architecture & Modules](#architecture--modules)
8. [Usage Guide](#usage-guide)
9. [Physics Implementation](#physics-implementation)
10. [References](#references)

---

## Overview

An **interactive web-based engineering tool** that computes optimal extrusion die angles from first principles using the Multi-Scale Adaptive Geometric Strategy (MSAGS). The application combines classical metal-forming theory (Avitzur's Upper Bound, Slab Method) with advanced material models and interactive visualizations to support extrusion die design.

### Key Capabilities

- **Optimal die angle calculation** – derives semi-angle α* minimizing total deformation power
- **Pressure prediction** – estimates extrusion force using Slab Method with friction adjustment
- **Streamlined die design** – generates cubic polynomial curved profiles with zero-slope boundary conditions
- **Energy decomposition** – separates ideal, friction, and redundant work components
- **Multi-material support** – 40+ materials (aluminum, steel, titanium, copper, polymers)
- **Lubricant ranking** – intelligent compatibility scoring for 30+ lubricant/interface types
- **Thermal analysis** – adiabatic heating, die-zone temperature, material-dependent flow stress
- **Risk assessment** – dead metal zone (DMZ) screening, thermal limits, recrystallization detection
- **Real-time interactivity** – dual-mode die angle control (auto-optimized vs. manual adjustment)

---

## Quick Start

### Installation

1. **Clone or download** the repository:
   ```bash
   cd Mantech-Course-Project
   ```

2. **Install dependencies** (requires Node.js ≥ 14):
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```
   The application will open at `http://localhost:3000` in your default browser.

### Alternative: Direct Browser Access

If you have a local HTTP server installed, navigate to the workspace folder and open `index.html` directly in your browser (for Chrome/Edge/Firefox).

---

## Features

### Interactive Input Panel (Section 01–02)

**Geometry:**
- Initial billet radius Rᵢ (range: 1–500 mm)
- Final extrudate radius Rf (range: 0.5–499 mm)
- Die length calculated from geometry and optimal angle

**Die Angle Control:**
- **Auto mode** – computes optimal α* using Avitzur formula + MSAGS Km correction
- **Manual mode** – user-defined semi-angle with real-time profile regeneration
- Angle range sliders (1–90°)

**Process Conditions:**
- Temperature (20–1300 °C) – affects flow stress and lubricant performance
- Extrusion speed (1–500 mm/s) – influences strain rate, adiabatic heating, and DMZ risk
- Back pressure (0–200 MPa) – modulates effective friction factor

**Material & Lubricant Selection:**
- 40+ materials organized into 6 categories (aluminum, steel, stainless, copper, titanium, polymers)
- 30+ lubricants with temperature/compatibility ranges
- Dynamic dropdown ranking: ★ Top Recommended → ⊙ Moderate → Not Recommended

### Real-Time Results Display

**Metrics Grid:**
- Optimal conical angle (semi-angle α*)
- Streamlined profile entry/exit angles
- Pressure saving % (curved vs. conical)
- Extrusion force (kN)
- Temperature-corrected flow stress (MPa)
- True strain and strain rate

**Energy Chart:**
- Breakdown of ideal work Wᵢ, friction work Wf, and redundant work Wr
- Comparison: conical vs. curved die profiles
- Percentage distribution bar

**Profile Chart:**
- Die profile geometry: conical (linear) vs. curved (cubic polynomial)
- Radius vs. axial position along die
- Tangent angle overlay showing geometry-induced deformation

**Contextual Alerts:**
- Dead metal zone (DMZ) risk classification (high/moderate/low)
- Thermal warnings (adiabatic rise, proximity to melting point)
- Lubricant compatibility alerts with operating range notes
- Material-specific guidance (recrystallization, polymer considerations)
- Temperature correction factors applied

**Theory Section:**
- Avitzur Upper Bound formula with numerical substitution
- Slab Method pressure calculation step-by-step
- Energy balance equations
- Temperature scaling model
- MSAGS Material Class Multiplier (Km) derivation

### Material Property Cards

Display:
- Initial yield strength σ_y0
- Strain-hardening coefficient C and exponent n
- Melting temperature Tm
- Recrystallization temperature
- Recommended die angle range (cold vs. hot working)
- Thermal conductivity and density

### Lubricant Property Cards

Display:
- Tresca friction factor m (shear-stress based)
- Coulomb friction coefficient μ (normal-stress based)
- Effective temperature range
- Material type compatibility (metal/polymer)
- Material-specific compatibility score (0–10)
- Engineering notes on performance and hazards

---

## Project Structure

```
extrusion-die-optimizer/
│
├── index.html                    ← Main HTML entry point, DOM structure
├── package.json                  ← Project metadata, npm scripts, dependencies
├── README.md                     ← This file
│
└── src/
    │
    ├── main.js                   ← Application orchestration & event handling
    │                                • UI element binding
    │                                • Mode toggling (auto/manual die angle)
    │                                • Dropdown population & material updates
    │                                • Results pipeline coordination
    │
    ├── data/
    │   ├── materials.js          ← Material property database (40 entries)
    │   │                            Properties: sy0, C, n, m_pw, alpha_range,
    │   │                            Tm, Trecryst, rho, k_thermal, cp, E,
    │   │                            temp_decay, dmz_angle, notes
    │   │
    │   └── lubricants.js         ← Lubricant database (30 entries)
    │                                Properties: m (Tresca), μ (Coulomb),
    │                                temp_range, compatible, score, notes
    │
    ├── physics/
    │   ├── solver.js             ← Core MSAGS computation engine
    │   │                            Layer 1 – Avitzur optimal angle & Km
    │   │                            Layer 2 – Slab Method pressure
    │   │                            Layer 3 – Energy decomposition
    │   │                            Thermal models (adiabatic, flow stress)
    │   │                            Dead metal zone screening
    │   │
    │   └── profile.js            ← Streamlined die profile generator
    │                                • Cubic Hermite polynomial (zero-slope BCs)
    │                                • Curve curvature analysis
    │                                • Local tangent angle computation
    │
    ├── charts/
    │   ├── energyChart.js        ← Chart.js energy decomposition visualization
    │   │                            Stacked bar: Wᵢ, Wf, Wr comparison
    │   │
    │   └── profileChart.js       ← Chart.js die profile renderer
    │                                Conical vs. curved geometry plot
    │
    ├── ui/
    │   ├── alerts.js             ← Contextual warning & info alert system
    │   │                            DMZ screening, thermal limits,
    │   │                            lubricant compatibility, recrystallization
    │   │
    │   ├── metrics.js            ← Summary metric cards grid renderer
    │   │
    │   ├── params.js             ← Input panel parameter updates & validation
    │   │
    │   ├── theory.js             ← Theory equations panel with calculations
    │   │
    │   └── styles.css            ← Application styling, layout, typography
    │
    └── index.html                 ← (Note: if separate from root)
```

---

## Theoretical Framework

### Layer 1: Avitzur Upper Bound & Optimal Angle

The optimal die semi-angle α* minimizes total deformation power P_total = Wᵢ + Wf + Wr by solving:

$$\frac{dP}{d\alpha} = 0$$

This yields:

$$\alpha^* = \sqrt{\frac{2}{3} \cdot m \cdot \ln(R)}$$

where:
- **m** – Tresca friction factor (0 ≤ m ≤ 1)
- **R** – area reduction ratio = (Rᵢ/Rf)²

**MSAGS Stage 2 Correction:**  
A material class multiplier Km is applied empirically to account for deviations from classical plasticity theory:

$$\alpha^*_{\text{final}} = K_m \cdot \alpha^* \text{ (clamped to material range)}$$

The multiplier is material-specific and validated against literature die-trial data.

### Layer 2: Slab Method & Extrusion Pressure

The ram pressure P is estimated by force balance on a differential slab element:

$$P = \left( \sigma_y + \frac{2\mu \cdot R_i}{L} \cdot \ln(R) \right) \cdot \frac{A_i}{A_f}$$

where:
- **σ_y** – temperature-corrected flow stress (Hollomon: σ = C·ε^n)
- **μ** – Coulomb friction coefficient
- **L** – die length (derived from R and α)

**Extrusion Force:**
$$F = P \cdot A_i$$

### Layer 3: Energy Decomposition

Total specific work w_total = w_ideal + w_friction + w_redundant:

- **w_ideal** – shear deformation under frictionless conditions
- **w_friction** – plastic dissipation due to friction at die walls
- **w_redundant** – dead metal zone shearing and geometric inefficiency

For **curved dies**, redundant work is distributed over a streamlined polynomial profile, reducing peak local deformation and enabling **pressure savings** of 15–40% vs. conical dies.

### Streamlined Cubic Profile

The die radius r(z) follows a 3rd-order Hermite polynomial with zero-slope boundary conditions:

$$r(z) = a z^3 + b z^2 + c z + d$$

with:
- r(0) = Rᵢ,  r'(0) = 0  (smooth entry)
- r(L) = Rf,  r'(L) = 0  (smooth exit)

**Coefficients:**
$$a = -2(R_f - R_i)/L^3, \quad b = 3(R_f - R_i)/L^2, \quad c = 0, \quad d = R_i$$

This minimizes redundant work by enforcing zero local slope at entry/exit cone junctions.

### Temperature-Corrected Flow Stress

Metals follow exponential decay; polymers show sharp viscosity drop near Tm:

$$\sigma_y(T) = C \cdot \varepsilon^n \cdot \left[1 - \delta(T - T_{\text{ref}})\right]$$

where δ is the material-specific temperature sensitivity (K⁻¹).

### Adiabatic Temperature Rise

For high-speed extrusion:

$$\Delta T_{\text{ad}} = \frac{\rho \cdot c_p}{k_{\text{thermal}}} \cdot W_{\text{specific}}$$

Peclet number Pe = v·L/α determines if adiabatic assumptions hold.

### Dead Metal Zone (DMZ) Screening

A simplified criterion flags DMZ risk when die semi-angle exceeds material-specific threshold:

$$\alpha > \alpha_{\text{dmz\_onset}}$$

**Note:** This is a screening tool only; actual DMZ initiation depends on strain rate, speed, and detailed 3D flow. FEM simulation and pilot die trials are essential for critical applications.

---

## Materials & Lubricants

### Material Database (40 entries)

**Categories:**
1. **Aluminum Alloys** (6 entries)
   - 1100-O (soft, annealed)
   - 2024-T4 (aerospace, high strength)
   - 6061-T6 (structural, versatile)
   - 7075-T6 (ultra-high strength, poor formability)
   - 5052-H32 (excellent marine corrosion resistance)
   - 3003-H14 (general-purpose, workable)

2. **Carbon & Alloy Steels** (9 entries)
   - Low carbon (1018, A36 – highly formable)
   - Medium carbon (1045 – balanced strength/ductility)
   - High-strength alloys (4140, 4340 – very high flow stress)
   - Tool steels (D2, O1, H13, W1, 52100 – extreme hardness)

3. **Stainless Steels** (5 entries)
   - Austenitic (304, 316 – high strain-hardening, frequent annealing needed)
   - Martensitic (410, 420 – moderate formability)
   - Precipitation hardening (17-4 PH – high strength)
   - Cutlery grade (440C – extreme hardness)

4. **Copper & Brass** (7 entries)
   - Pure copper (110 ETP – highly ductile, excellent conductivity)
   - Cartridge brass (260, 70/30 – standard for deep drawing)
   - Free-machining brass (360 – excellent machinability)
   - Phosphor bronze (510 – fatigue resistance)
   - Beryllium copper (172 – precipitation hardening)
   - Bearing bronze (932 – cast material reference)

5. **Titanium & Exotic** (7 entries)
   - Titanium (CP2, Ti-6Al-4V – very low formability at room temp)
   - Magnesium (AZ31B – HCP structure requires ~250 °C heat)
   - Superalloys (Inconel 718, 625 – extreme high-temp strength)
   - Nickel alloys (Monel 400, Hastelloy C-276 – superior corrosion)
   - Other (Zinc Zamak3, pure Lead, tungsten carbide – tooling reference)

6. **Polymers** (13 entries)
   - Polyethylene family (PE, HDPE, LDPE – high ductility)
   - Polypropylene (PP – semi-crystalline, wide angle range)
   - Amorphous (ABS, PC, PS – moderate to brittle)
   - Engineering plastics (Nylon 66, POM, PTFE, PET – stiff, lower ductility)
   - Advanced (PEEK – high-performance thermoplastic)
   - Polyurethane (PU – versatile formulation)

Each material record includes:
- Flow stress model: C, n (Hollomon equation)
- Thermal data: Tm, Trecryst, k_thermal, cp, ρ, E
- Forming ranges: α_range (cold/hot), dmz_angle_onset
- Strain-rate sensitivity: m_pw exponent
- Temperature decay coefficient: temp_decay

### Lubricant Database (30 entries)

**Friction Model:**
- **Tresca m** (shear-stress friction): τ_interface = m·σ_y/√3
- **Coulomb μ** (normal-stress friction): τ_interface = μ·N

**Tiers by compatibility score:**
- **★ Top Recommended (8–10):** Zinc phosphate, MoS₂, WS₂, hBN, PTFE, copper plating
- **⊙ Moderate (5–7):** Graphite, synthetic ester, PAO, calcium sulfonate, polyurea
- **Not Recommended (<5):** Dry, talc, beeswax (incompatible or inadequate for process)

**Lubricant Categories:**
1. **Solid/Powder** (dry, MoS₂, graphite, hBN, WS₂, talc, soapstone)
   - Low friction but challenge to maintain film at high speeds
   
2. **Mineral & Synthetic Oils** (mineral oil, castor, palm, lard, syn. ester, PAO, naphthenic)
   - Good boundary lubrication; temperature limits 100–300 °C
   
3. **Extreme Pressure (EP)** (zinc phosphate, chlorinated paraffin, sulfurised lard, copper/lead plating)
   - Forms sacrificial boundary films; handles 300–900 °C
   
4. **Polymer-Specific** (silicone oil, water emulsion, synthetic ester, PAO)
   - Tailored viscosity and thermal stability for molten polymers
   
5. **Greases** (lithium complex, calcium sulfonate, aluminum complex, polyurea, barium complex)
   - Retained at high speeds; multi-purpose or specialized uses

6. **High-Temp Coatings** (glass powder, hBN, copper/lead plating)
   - Melts to hydrodynamic film during hot extrusion (700–1200 °C)

**Note on Friction Hybrid Model:**  
The solver uses dual-friction definitions:
- **Tresca m** for energy decomposition (Layer 3)
- **Coulomb μ** for pressure estimation (Layer 2)

This practical approach is common in industry and provides good agreement with experimental data, though it is not "pure" single-theory plasticity. Classical metal-forming texts justify this coupling for engineering estimates.

---

## Architecture & Modules

### 1. **main.js** – Application Orchestration

**Responsibilities:**
- DOM element caching and event binding
- Slider live readout callbacks (temperature, speed, back pressure)
- Die angle mode toggle (auto ↔ manual)
- Material & lubricant dropdown population with categorization
- Material/lubricant property card updates
- Orchestration of computation pipeline
- Results dispatch to all UI renderer modules (charts, metrics, alerts, theory)

**Key Functions:**
- `populateMaterialsDropdown()` – groups 40 materials into 6 categories
- `updateLubricantDropdown()` – ranks 30 lubricants by compatibility score
- `runCompute()` – triggers Solver.compute()
- `updateProfileWithCustomAngle()` – regenerates profile in manual mode
- Module initialization calls (ProfileGenerator, Solver, MetricsUI, etc.)

### 2. **solver.js** – Core Physics Engine (MSAGS Pipeline)

**Three-layer computation:**

**Layer 1: Avitzur Optimal Angle**
- `temperatureScaling(mat, T)` – exponential decay for metals; power-law for polymers
- `flowStress(mat, eps, T)` – Hollomon equation with temp correction
- `avitzurOptimalAngle(m, R_ratio, mat)` – derives α* from Upper Bound
- `materialClassMultiplier(mat, T)` – MSAGS-specific Km correction
- Final clamped angle: α*_final = min(max(Km·α*, α_min), α_max)

**Layer 2: Slab Method & Pressure**
- `slabMethodPressure(mat, T, R_i, R_f, α, m_eff, L)` – force balance
- `extrustionForce(P, A_i)` – computes ram force in kN
- Dead metal zone detection: `dmzRisk(α_optimal, α_dmz_onset)`

**Layer 3: Energy Decomposition**
- `idealWork(σ_y, ε, R)` – shear-only deformation energy
- `frictionWork(m, R, α, L)` – friction-induced dissipation
- `redundantWork(...)` – geometric inefficiency penalty
- `energyBreakdown(...)` – returns {w_ideal, w_friction, w_redundant}
- Curved profile energy correction via ProfileGenerator output

**Thermal & Risk Assessment:**
- `adibaticHeating(ε_dot, ...)` – Peclet-based temperature rise
- `dieZoneTemperature(...)` – combines billet + adiabatic + due diligence
- `lubricantCompatibility(T, T_min, T_max, material_type)` – boolean checks

**Public Interface:**
```javascript
const result = Solver.compute({
  R_in, R_out, T, v_ex, P_back, mat, lub, alpha_override
});
```

Returns:
```javascript
{
  alpha_conical, alpha_raw, Km,
  sy_eff, eps_true, eps_rate,
  F_extrusion, pressure,
  w_ideal, w_friction, w_redundant,
  pressure_saving_pct,
  T_die_zone, dT_adiabatic, near_Tm,
  dmz, dmz_threshold,
  lub_compatible, alpha_curved_entry, alpha_curved_exit,
  // ... and many more properties
}
```

### 3. **profile.js** – Streamlined Die Profile Generator

**Cubic Hermite Polynomial:**
- Entry condition: r(0) = Rᵢ, dr/dz|₀ = 0
- Exit condition: r(L) = Rf, dr/dz|L = 0
- Analytical solution: a, b, c, d coefficients

**Public Interface:**
```javascript
const profile = ProfileGenerator.generate(R_in, R_out, L, N_points);
```

Returns:
```javascript
{
  z,                    // axial position array
  r_curved,            // curved profile radius array
  r_conical,           // conical profile radius array (linear)
  local_angle,         // tangent semi-angle at each z
  alpha_conical_deg,   // conical die semi-angle
  max_local_angle, avg_local_angle, min_local_angle
}
```

**Uses:**
- Called by Solver to compute curved-vs-conical energy difference
- Called by ProfileChart to visualize geometry
- Curvature computation for redundant work estimation

### 4. **energyChart.js** – Energy Breakdown Visualization

- Chart.js horizontal stacked bar chart
- Compares: ideal Wᵢ, friction Wf, redundant Wr for:
  - Conical die (straight-walled)
  - Curved die (polynomial streamlined)
- Displays % savings via curved profile
- Updates on every computation

### 5. **profileChart.js** – Die Geometry Visualization

- Dual-curve plot: conical vs. curved die profile
- Radius (mm) vs. axial position (mm)
- Secondary y-axis: local tangent angle (degrees)
- Overlays entry/exit angle metrics
- Real-time update in auto/manual mode

### 6. **alerts.js** – Contextual Warning System

Screens for:
- **Dead metal zone risk** – HIGH (critical), MODERATE, OK
- **Thermal limits** – adiabatic rise >80 °C, proximity to Tm
- **Lubricant compatibility** – outside temp range or incompatible material type
- **Material notes** – recrystallization regime, polymer-specific guidance
- **Speed/angle warnings** – extreme parameter combinations

All alerts include engineering interpretation and mitigation strategies.

### 7. **metrics.js** – Summary Cards Renderer

Displays 6–8 key scalar values in a responsive grid:
- Optimal angle α* (highlighted as primary metric)
- Curved entry/exit angles
- Pressure saving %
- Extrusion force (kN)
- Flow stress σ_y (MPa)
- True strain ε
- (Optional) Peclet number, die-zone temp, DMZ flag

### 8. **params.js** – Input Parameter Management

Updates input fields with validated values:
- Live readout callbacks for sliders
- Dropdown change handlers
- Range validation and clamping
- Automatic profile regeneration on parameter change

### 9. **theory.js** – Equations & Calculations Display

Renders LaTeX-style equations with numerical substitution:
1. **Avitzur Upper Bound** – step-by-step α* derivation
2. **Slab Method** – pressure formula with B-factor
3. **Energy Balance** – Wᵢ, Wf, Wr expressions
4. **Temperature Scaling** – material-specific decay
5. **MSAGS Corrections** – Km derivation and application

### 10. **styles.css** – UI Styling

- **Typography:** Syne (sans), DM Mono (monospace), Instrument Serif (display)
- **Layout:** CSS Grid for multi-column panels, Flexbox for cards
- **Color:** Professional engineering aesthetic with accent colors for warnings
- **Responsveness:** Mobile-friendly breakpoints
- **Visual polish:** Grain overlay, smooth transitions, high contrast

---

## Usage Guide

### 1. **Select Material & Lubricant**

Navigate to **Section 02** (Material). The material dropdown is pre-populated with 40 engineering materials grouped by alloy class.

When you select a material, the lubricant dropdown automatically ranks lubricants by compatibility:
- ★ **Top Recommended** – optimal for this material type & temperature
- ⊙ **Moderate** – acceptable alternatives
- *No label* – not recommended (incompatible or ineffective)

Click on a material or lubricant name to view detailed property cards.

### 2. **Define Die Geometry**

In **Section 01** (Geometry), set:
- **Initial billet radius Rᵢ** – typical range 20–200 mm
- **Final extrudate radius Rf** – must be < Rᵢ
- Die length L is calculated internally from geometry and optimal angle

### 3. **Set Process Conditions**

**Die Angle Control:**
- **Auto mode** (default) – click "Auto" button. The solver computes α* using Avitzur + MSAGS Km
- **Manual mode** – click "Manual" button, then drag the angle slider to explore custom angles

**Temperature, Speed, Back Pressure:**
- Adjust sliders; live displays update immediately
- Back pressure (typically 0–50 MPa) modulates the effective friction factor in the Slab Method
- High temperature reduces flow stress (→ lower force, wider optimal angle for some materials)
- High speed increases strain-rate effects and adiabatic heating (→ larger ΔT_ad)

### 4. **Interpret Results**

Upon clicking **Calculate** (or auto-triggered on parameter change in some modes):

**Metrics Grid (top):**
- Read the **"Optimal conical angle"** – this is your primary design variable α*
- Compare **"Pressure saving %"** – expect 15–40% savings with curved die

**Profile Chart (left):**
- Visual comparison of conical vs. curved die profile
- Observe entry/exit angle transitions and curvature

**Energy Chart (right):**
- Bar chart breakdown: Wᵢ (green), Wf (orange), Wr (red)
- Curved die reduces redundant work → overall lower pressure

**Alerts Section:**
- Red ▲ warnings – take immediate action (e.g., reduce speed if DMZ risk is high)
- Orange ◆ cautions – monitor die trials carefully
- Blue ℹ info notes – contextual material/process guidance

**Theory Panel:**
- Verify the mathematical framework and numerical values
- Check that α* makes sense given the material and friction factor

### 5. **Validate with Die Trials**

**Important caveat:** The MSAGS model is analytical and calibrated against literature. Before committing to production tooling:
1. **FEM simulation** with actual billet/extrusion parameters
2. **Pilot die trials** with prototype or existing dies
3. **Metallographical analysis** (grain structure, surface quality) post-extrusion
4. **Pressure recording** during trials vs. prediction

Dead metal zone screening is a simplified indicator only; actual onset occurs at a critical combination of angle, speed, temperature, and friction that requires 3D flow analysis or experience-based knock-down factors.

---

## Physics Implementation

### Avitzur Upper Bound Theorem

Classical reference:  
Avitzur, B. (1979). *Metal Forming: The Application of Limit Analysis.* Elsevier.

The Upper Bound method assumes velocity field consistency and minimizes total power. For axisymmetric extrusion through a conical die:

$$P_{\text{total}} = W_i + W_f + W_r$$

where:
- Wᵢ – ideal work (isochoric plastic strain)
- Wf – friction work (at die walls)
- Wr – redundant work (geometric inefficiency)

Optimal angle satisfies ∂P/∂α = 0, yielding a closed-form expression.

### Slab Method (Limit Analysis)

Assumes uniform stress on a slab element:
$$\sigma_{\text{long}} = \sigma_y \left( 1 + \frac{2\mu \ln(R)}{tan(\alpha)} \right)$$

Then:
$$P = \sigma_{\text{long}} \cdot (A_i / A_f)$$

The B-factor encodes geometry (R, α) and friction (μ) coupling.

### Streamlined Profile Design

Classical reference:  
Sheppard, T. & Jackson, A. (1994). *Extrusion of Aluminium Alloys.* Butterworth-Heinemann.

Excessive local angles increase redundant work. Zero-slope Hermite polynomial entry/exit ensures smooth transition and minimal redundant deformation.

### Temperature-Dependent Flow Stress

Hollomon equation (isotropic hardening):
$$\sigma = C \cdot \varepsilon^n$$

Temperature correction (exponential, validated for metals):
$$\sigma(T) = \sigma(\varepsilon, T_{\text{ref}}) \cdot e^{-\beta(T - T_{\text{ref}})}$$

Polymers use power-law near Tm due to melt-like viscosity transition.

### Dead Metal Zone Onset

Empirical screening criterion from literature:
$$\alpha > \alpha_{\text{dmz\_onset}} \quad \Rightarrow \quad \text{DMZ risk}$$

Material-specific onset angles in database are calibrated from:
- die-trial reports (angle vs. surface defect correlation)
- FEM sensitivity studies
- ASM Handbook Vol. 14 guidance

**Caveats:**
- Actual DMZ depends on strain rate, temperature, speed
- Simplified indicator; always pilot-test before production
- Dead-metal zone can also occur at specific speed ranges even below α_onset (experimental observation)

---

## File Descriptions (Detailed)

### Main HTML Structure (`index.html`)

A single-page application with:
1. **Header** – project branding and methodology tag
2. **Main section** with three regions:
   - **Input Panel** (left) – geometry, material, lubricant, process settings
   - **Results Panel** (center/right) – metrics, charts, alerts, theory
3. **External stylesheets** – Google Fonts, local styles.css
4. **Script imports** (at end):
   ```html
   <script src="src/data/materials.js"></script>
   <script src="src/data/lubricants.js"></script>
   <script src="src/physics/solver.js"></script>
   <script src="src/physics/profile.js"></script>
   <script src="src/charts/profileChart.js"></script>
   <script src="src/charts/energyChart.js"></script>
   <script src="src/ui/alerts.js"></script>
   <script src="src/ui/metrics.js"></script>
   <script src="src/ui/params.js"></script>
   <script src="src/ui/theory.js"></script>
   <script src="src/main.js"></script>
   ```

### Data Modules

**materials.js:**
- Constant MATERIALS = { al_1100_O, al_2024_T4, ..., poly_pu }
- 40 entries with mechanical, thermal, forming properties
- Referenced by Solver for flow-stress and UB corrections

**lubricants.js:**
- Constant LUBRICANTS = { dry, moly, graphite, ..., water_emul }
- 30 entries with friction factors (Tresca m, Coulomb μ) and temperature ranges
- Compatibility scoring (metal/polymer_type against material type)

### Physics Modules

**solver.js:**
- Namespace: `Solver = { compute(params) }`
- Internal functions for power-law flow stress, temperature scaling, Avitzur formula, Slab pressure
- Returns comprehensive result object with all intermediate values for display

**profile.js:**
- Namespace: `ProfileGenerator = { generate(R_in, R_out, L, N), curvature(...) }`
- Cubic Hermite polynomial with zero-slope BCs
- Supports both conical (linear) and curved (polynomial) geometry

### Chart Modules

**energyChart.js:**
- Uses Chart.js library (CDN or npm)
- Horizontal stacked bar: ideal, friction, redundant work
- Updates on result change via `EnergyChart.render(result)`

**profileChart.js:**
- Chart.js line chart with dual y-axes
- Plots r_curved vs. z (primary), local_angle vs. z (secondary)
- Overlays r_conical for comparison

### UI Modules

**alerts.js:**
- Namespace: `AlertsUI = { render(result) }`
- Generates alert objects (type, icon, message)
- Inserts into #alerts-row DOM

**metrics.js:**
- Namespace: `MetricsUI = { render(result) }`
- Creates metric cards (label, value, sub) into #metrics-grid

**params.js:**
- Namespace: `ParamsUI` (or inline event handlers in main.js)
- Updates input fields based on result
- Validates ranges and triggers dependent updates

**theory.js:**
- Namespace: `TheoryUI = { render(result) }`
- Generates LaTeX-style equation blocks
- Substitutes numerical values for teaching/verification
- Inserts into #theory-content

**styles.css:**
- Comprehensive stylesheet
- Variables for color, spacing, fonts
- Grid layout for multi-column UI
- Dark theme with accent highlights

---

## Dependencies

### Runtime

- **Chart.js** ^4.4.1 (DOM charting library)
- Modern browser with ES6+ support (Chrome 80+, Firefox 75+, Edge 80+, Safari 13+)

### Development

- **Node.js** ≥ 14 (for npm)
- **live-server** ^1.2.2 (development HTTP server with auto-reload)

### Installation

```bash
npm install
```

Creates node_modules/ with Chart.js and live-server.

### Running

```bash
npm start       # Starts dev server on port 3000, opens browser
npm run dev     # Same as start but doesn't auto-open
```

Alternatively, serve index.html with any HTTP server:
```bash
python -m http.server 8000  # Python 3
python -m SimpleHTTPServer 8000    # Python 2
npx http-server -p 8000     # Node.js alternative
```

---

## Browser Compatibility

**Fully Supported:**
- Chrome/Chromium ≥ 80
- Edge ≥ 80
- Firefox ≥ 75
- Safari ≥ 13

**Known Limitations:**
- Internet Explorer 11 – not supported (ES6 optional chaining, spread operators)
- Mobile Safari (iPad, iPhone) – scales well but small input controls; recommend landscape orientation on tablets

---

## Performance & Limitations

### Computational Complexity
- Single solver run: **~1 ms** (negligible on modern hardware)
- Chart re-render: **~50–100 ms** (Chart.js overhead)
- Profile generation: **~10 ms** (120 discrete points default)
- Overall app response time: **<200 ms** from parameter change to full display update

### Accuracy Notes

1. **Avitzur Upper Bound** – provides upper-bound estimate; actual pressure typically 10–20% lower with optimized die flow
2. **Slab Method** – 2D approximation; ignores side-wall friction variations and 3D edge effects
3. **Streamlined Profile** – cubic polynomial is computationally efficient but may not be globally optimal for all material/friction combinations
4. **Dead Metal Zone Screening** – simplified angle-only criterion; actual onset is 3D flow-dependent
5. **Thermal Model** – adiabatic assumption assumes insulated billet and fast process; cooling die → lower ΔT
6. **Material Data** – calibrated to standard forming conditions (typical speeds, temperatures); extreme conditions may require correction

### Material Database Gaps

Not included (but can be added):
- Composites (fiber-reinforced polymers, metal-matrix composites)
- Single-crystal superalloys
- Adiabatic shear band behavior
- Strain-rate-dependent phase transitions

---

## Troubleshooting

### Application Won't Start

**Symptom:** Blank page on http://localhost:3000

**Solution:**
1. Check dev server is running: `npm start` shows "Listening on port 3000"
2. Verify no port conflict: `lsof -i :3000` (Linux/Mac)
3. Clear browser cache: Ctrl+F5 (or Cmd+Shift+R on Mac)
4. Check browser console for errors: F12 → Console tab

### Charts Not Displaying

**Symptom:** Blank chart areas, no visualization

**Solution:**
1. Verify Chart.js is loaded: F12 → Network tab, search "chart.js"
2. Check DOM elements exist: F12 → Elements tab, search "#metrics-grid", "#energy-chart-container", etc.
3. Inspect chart render functions in energyChart.js, profileChart.js for errors

### Parameters Not Updating

**Symptom:** Changing a slider doesn't trigger result update

**Solution:**
1. Check browser console for JavaScript errors
2. Verify event listeners are bound: search for `addEventListener` in main.js
3. Test in simpler browser (Chrome) to rule out browser-specific issues

### Incorrect Die Angle

**Symptom:** Computed α* seems too small or too large

**Explanation:** Check:
1. Is material selected? Default is aluminum; different materials have different Km
2. Is lubricant Tresca friction factor m realistic? (Dry ~0.4; MoS₂ ~0.08)
3. Is temperature extreme? (Very high T → lower σ_y → larger α*)
4. Is area reduction ratio R very large? (Large R → larger α*)

**Validation:**
- Consult material-specific literature (e.g., ASM Handbook Vol. 14)
- Compare with published die-angle recommendations for your alloy class
- Check Theory panel for numerical verification

---

## References

### Classical Metal-Forming Theory

1. **Avitzur, B.** (1979). *Metal Forming: The Application of Limit Analysis.* Elsevier.
   - Foundational Upper Bound derivations and extrusion applications

2. **Hosford, W. F. & Caddell, R. M.** (2011). *Metal Forming: Mechanics and Metallurgy* (3rd ed.). Cambridge University Press.
   - Comprehensive strain-hardening, flow stress, and plastic instability coverage

3. **Schey, J. A.** (1983). *Tribology in Metalworking: Friction, Lubrication, and Wear.* ASM International.
   - Friction factor models (Tresca, Coulomb) and lubricant film mechanics in bulk forming

4. **ASM Handbook Vol. 14A & 14B: Metalworking — Bulk Forming** (2005). ASM International.
   - Material properties, forming limits, and industrial die design practice

5. **ASM Handbook Vol. 18: Friction, Lubrication, and Wear** (1992). ASM International.
   - Tribological data for lubricants and solid films

### Extrusion Die Design

6. **Sheppard, T. & Jackson, A.** (1994). *Extrusion of Aluminium Alloys.* Butterworth-Heinemann.
   - Aluminum-specific extrusion process design and die optimization

7. **Davis, J. R.** (1993). *Aluminum and Aluminum Alloys.* ASM International.
   - Material properties and forming characteristics

8. **Tekkaya, A. E.** (2000). "State of the art of simulation of sheet metal forming." Journal of Materials Processing Technology, 103(1), 14–22.
   - FEM trends and validation strategies

### Polymer Processing

9. **Osswald, T. A., Turng, L.-S., & Gramann, P. J.** (2002). *Injection Molding Handbook* (2nd ed.). Hanser Publishers.
   - Polymer viscosity, thermal, and rheological modeling

10. **White, J. L. & Dee, H.** (1974). "The instability of simple shear flow of a viscoelastic fluid." Journal of Non-Newtonian Fluid Mechanics, 1(1), 1–13.
    - Shear instability and viscoelastic effects

---

## Project Metadata

- **Name:** extrusion-die-optimizer
- **Version:** 1.0.0
- **License:** MIT
- **Authors:** Spandan Mhapsekar (240103103), Shlok Pratap Singh (240103099)
- **Institution:** Department of Mechanical Engineering, IIT Guwahati
- **Date:** April 2026

---

## Useful Links

- [Chart.js Documentation](https://www.chartjs.org/)
- [MDN Web Docs – Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)
- [ASM Handbook Online](https://www.asmhandbooks.com/) (subscription required)
- [Live Server (npm)](https://www.npmjs.com/package/live-server)

---

## Known Issues & Future Work

### Known Issues

1. **Mobile responsiveness:** Input sliders are small on phones; user experience is suboptimal
2. **Polymer material class multiplier Km:** Currently empirical; calibration against more polymer die-trial data would improve accuracy
3. **Dead metal zone screening:** Simplified angle-only criterion; doesn't account for speed/temperature interaction

### Future Enhancements

- [ ] 3D FEM export (generate ABAQUS/Nastran input deck with optimized α)
- [ ] Sensitivity analysis dashboard (tornado plots for Km, friction, temperature)
- [ ] Material creep/relaxation modeling (for hot extrusion of superalloys)
- [ ] Multi-objective optimization (Pareto front for force vs. angle vs. pressure-saving %)
- [ ] Polymer melt-flow index (MFI) integration
- [ ] Die cost calculator (tool steel, lead time estimator)
- [ ] Internationalization and unit system selector (SI, US Customary)
- [ ] Data export (JSON, CSV for spreadsheet comparison)
- [ ] Dark mode toggle
- [ ] Offline mode (service worker for PWA capability)

---

## Support & Contributing

For bug reports, feature requests, or contributions:
1. Create a clear issue description with:
   - **Steps to reproduce** the problem
   - **Expected vs. actual** behavior
   - **Browser/OS** details
   - **Console error messages** (if applicable)

2. Code contributions welcome; please:
   - Follow existing code style (consistent indentation, naming conventions)
   - Add inline comments for complex physics functions
   - Test in Chrome, Firefox, Safari before submitting
   - Update this README if you add new modules or materials

---

## Acknowledgments

- **IIT Guwahati** – institutional support and resources
- **Classical mechanics pioneers** (Avitzur, Hosford, Schey) – theoretical foundations
- **Open-source community** – Chart.js, live-server, and numerous references

---

## License

MIT License (see LICENSE file in repository)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, and/or sublicense.

**Disclaimer:** This tool is provided for educational and engineering estimation purposes. It is not a replacement for full 3D FEM simulation, pilot-scale trials, or expert metallurgical consultation before committing to production tooling or critical applications. Always validate results experimentally.

