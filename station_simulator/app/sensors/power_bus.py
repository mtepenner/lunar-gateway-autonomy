"""Simulates battery voltage, solar array output, and electrical loads."""

import math
import random
import time


class PowerBusSimulator:
    """Generates realistic power-bus telemetry."""

    def __init__(self):
        self._start_time = time.time()
        self._orbit_period = 120.0
        self._battery_capacity_ah = 200.0
        self._battery_soc = 0.85  # state of charge (0-1)

    def read(self) -> dict:
        elapsed = time.time() - self._start_time
        phase = (elapsed % self._orbit_period) / self._orbit_period
        in_eclipse = phase > 0.5

        # Solar array output – zero during eclipse
        if in_eclipse:
            solar_watts = 0.0
        else:
            solar_watts = 4500.0 * math.sin(math.pi * phase / 0.5) + random.gauss(0, 50)
            solar_watts = max(0.0, solar_watts)

        # Station loads fluctuate
        base_load = 2800.0
        load_watts = base_load + random.gauss(0, 200) + 400 * random.random()

        # Battery charge/discharge
        net_power = solar_watts - load_watts
        delta_soc = (net_power / (self._battery_capacity_ah * 28.0)) * 0.01
        self._battery_soc = max(0.05, min(1.0, self._battery_soc + delta_soc))

        bus_voltage = 28.0 + (self._battery_soc - 0.5) * 4.0 + random.gauss(0, 0.1)

        return {
            "bus_voltage_v": round(bus_voltage, 2),
            "solar_array_watts": round(solar_watts, 1),
            "load_watts": round(load_watts, 1),
            "battery_soc": round(self._battery_soc, 4),
            "battery_temp_c": round(25.0 + random.gauss(0, 1.5), 2),
            "in_eclipse": in_eclipse,
            "timestamp": time.time(),
        }
