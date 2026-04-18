# database.py

MATERIAL_DB = {
    "Aluminium 6061": {"flow_stress": 150.0, "poisson": 0.33, "k": 0.25},
    "Copper (C11000)": {"flow_stress": 210.0, "poisson": 0.34, "k": 0.30},
    "Stainless Steel 304": {"flow_stress": 510.0, "poisson": 0.29, "k": 0.45},
    "Titanium Ti-6Al-4V": {"flow_stress": 850.0, "poisson": 0.31, "k": 0.55}
}

LUBRICANT_DB = {
    "Graphite in Water": {"m": 0.05, "type": "Hydrodynamic"},
    "MoS2 Paste": {"m": 0.12, "type": "Boundary Layer"},
    "Mineral Oil": {"m": 0.25, "type": "Mixed Lubrication"},
    "Unlubricated": {"m": 0.55, "type": "Dry Friction"}
}
