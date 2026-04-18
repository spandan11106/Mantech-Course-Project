# geometry.py
import numpy as np

class StreamlinedDie:
    @staticmethod
    def generate_profile(R_in, R_out, L, num_points=100):
        """Generates 3rd-order polynomial for curved die [cite: 63, 84-87]."""
        z = np.linspace(0, L, num_points)
        
        # Coefficients derived to ensure dr/dz = 0 at entry and exit [cite: 84-87]
        a = -2.0 * (R_out - R_in) / (L**3)
        b = 3.0 * (R_out - R_in) / (L**2)
        d = R_in
        
        r = a * (z**3) + b * (z**2) + d
        
        # Calculate local angles to prove smoothness [cite: 92-93]
        dr_dz = 3 * a * (z**2) + 2 * b * z
        angles = np.degrees(np.arctan(np.abs(dr_dz)))
        
        return z, r, angles
