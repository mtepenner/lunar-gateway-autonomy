"""Simulates extreme temperature swings (solar radiation / eclipse cycles)."""

import math
import random
import time


class ThermalSimulator:
    """Generates realistic thermal telemetry for the lunar Gateway station."""

    def __init__(self):
        self._start_time = time.time()
        self._orbit_period = 120.0  # seconds per simulated orbit
        self._base_temp = -20.0  # °C average
        self._solar_amplitude = 150.0  # °C swing from eclipse to solar exposure
        self._noise_scale = 3.0

    def read(self) -> dict:
        elapsed = time.time() - self._start_time
        phase = (elapsed % self._orbit_period) / self._orbit_period
        solar_component = self._solar_amplitude * math.sin(2 * math.pi * phase)
        noise = random.gauss(0, self._noise_scale)

        hull_temp = self._base_temp + solar_component + noise
        in_eclipse = phase > 0.5

        return {
            "hull_temp_c": round(hull_temp, 2),
            "radiator_temp_c": round(hull_temp - 30 + random.gauss(0, 2), 2),
            "internal_temp_c": round(22.0 + random.gauss(0, 0.5), 2),
            "in_eclipse": in_eclipse,
            "orbit_phase": round(phase, 4),
            "timestamp": time.time(),
        }
