"""Predicts when the station will freeze before it happens."""

import math
import logging

from core.model_loader import ModelLoader

log = logging.getLogger(__name__)

FREEZE_THRESHOLD = -80.0  # °C
DANGER_ZONE = -50.0  # °C — start worrying


class ThermalPredictor:
    """Predicts future hull temperature and recommends heater actions."""

    def __init__(self):
        self.model = ModelLoader.load("thermal_predictor")

    def predict(self, hull_temp: float, radiator_temp: float,
                in_eclipse: bool, orbit_phase: float) -> dict:
        # Heuristic prediction (works without ONNX model)
        cooling_rate = self._estimate_cooling_rate(hull_temp, in_eclipse, orbit_phase)
        predicted_temp = hull_temp + cooling_rate * 5.0  # 5-minute projection

        if predicted_temp < FREEZE_THRESHOLD:
            action = "activate_heaters"
            reason = (f"Predicted hull temp in 5min: {predicted_temp:.1f}°C "
                      f"(below freeze threshold {FREEZE_THRESHOLD}°C). "
                      f"Current cooling rate: {cooling_rate:.2f}°C/min.")
            confidence = min(0.95, 0.7 + abs(cooling_rate) * 0.05)
        elif predicted_temp < DANGER_ZONE:
            action = "standby"
            reason = (f"Hull trending cold ({predicted_temp:.1f}°C in 5min) "
                      f"but above freeze threshold. Monitoring.")
            confidence = 0.6
        else:
            action = "none"
            reason = f"Hull temp stable/warming. Predicted: {predicted_temp:.1f}°C in 5min."
            confidence = 0.8

        return {
            "action": action,
            "reason": reason,
            "predicted_temp_in_5m": round(predicted_temp, 2),
            "confidence": round(confidence, 3),
        }

    def _estimate_cooling_rate(self, current_temp: float, in_eclipse: bool,
                                orbit_phase: float) -> float:
        """Estimate °C/min cooling rate based on physics heuristics."""
        base_rate = -2.0 if in_eclipse else 1.5

        # Eclipse entry acceleration
        if in_eclipse and orbit_phase < 0.6:
            base_rate *= 1.5

        # Radiative cooling follows Stefan-Boltzmann (simplified)
        if current_temp > 0:
            base_rate -= 0.01 * math.sqrt(abs(current_temp))
        else:
            base_rate -= 0.02 * math.sqrt(abs(current_temp))

        return base_rate
