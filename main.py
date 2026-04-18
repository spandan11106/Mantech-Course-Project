# main.py
from database import MATERIAL_DB, LUBRICANT_DB
from solvers import ExtrusionSolver
from geometry import StreamlinedDie

def run_optimization():
    # User Inputs (Simulated Selection)
    material = "Aluminium 6061"
    lubricant = "Graphite in Water"
    R_in, R_out, L = 25.0, 10.0, 50.0

    solver = ExtrusionSolver(material, lubricant, MATERIAL_DB, LUBRICANT_DB)
    
    # 1. Calculate using multiple methods [cite: 27]
    opt_slab = solver.find_optimum_angle("Slab", R_in, R_out)
    opt_upper = solver.find_optimum_angle("Upper Bound", R_in, R_out)
    
    # 2. Generate Curved Die [cite: 39, 40]
    z, r, local_angles = StreamlinedDie.generate_profile(R_in, R_out, L)

    print(f"--- Extrusion Optimization Report ---")
    print(f"Material: {material} | Lubricant: {lubricant}")
    print(f"Optimum Conical Angle (Slab Method): {opt_slab:.2f}°")
    print(f"Optimum Conical Angle (Upper Bound): {opt_upper:.2f}°")
    print(f"--- Curved Die Advantage ---")
    print(f"Max Local Angle in Curved Die: {max(local_angles):.2f}°")
    print(f"Entry/Exit Slopes: {local_angles[0]:.2f}° / {local_angles[-1]:.2f}°")
    print("Result: Curved die eliminates abrupt velocity discontinuities at entry/exit[cite: 44, 63].")

if __name__ == "__main__":
    run_optimization()
