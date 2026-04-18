# solvers.py
import numpy as np
from scipy.optimize import minimize_scalar

class ExtrusionSolver:
    def __init__(self, material_name, lubricant_name, MATERIAL_DB, LUBRICANT_DB):
        self.flow_stress = MATERIAL_DB[material_name]["flow_stress"]
        self.m = LUBRICANT_DB[lubricant_name]["m"]

    def slab_method_energy(self, alpha_deg, R_in, R_out):
        """Standard Force Balance (ignores redundant work)."""
        alpha = np.radians(alpha_deg)
        ratio = R_in / R_out
        # Energy based purely on homogeneous deformation and friction [cite: 29]
        W_h = self.flow_stress * np.log(ratio**2)
        W_f = (self.m * self.flow_stress / np.sin(alpha)) * np.log(ratio**2)
        return W_h + W_f

    def avitzur_upper_bound(self, alpha_deg, R_in, R_out):
        """Avitzur's Upper Bound Theorem considering internal shear."""
        alpha = np.radians(alpha_deg)
        # Redundant work (Wr) increases with alpha [cite: 20, 32]
        W_r = (2/np.sqrt(3)) * self.flow_stress * (alpha/(np.sin(alpha)**2) - 1/np.tan(alpha))
        # Friction work (Wf) decreases with alpha [cite: 21, 32]
        W_f = (self.m/np.sqrt(3)) * self.flow_stress * (1/np.tan(alpha)) * np.log(R_in/R_out)
        return W_r + W_f

    def find_optimum_angle(self, method, R_in, R_out):
        func = self.slab_method_energy if method == "Slab" else self.avitzur_upper_bound
        res = minimize_scalar(func, args=(R_in, R_out), bounds=(1, 60), method='bounded')
        return res.x
