"""Loads lightweight ONNX or quantized ML models."""

import logging
import os

log = logging.getLogger(__name__)


class ModelLoader:
    """Manages loading and caching of ONNX models."""

    _cache: dict = {}

    @classmethod
    def load(cls, model_name: str):
        if model_name in cls._cache:
            return cls._cache[model_name]

        model_path = os.path.join(os.path.dirname(__file__), "..", "weights", f"{model_name}.onnx")

        if os.path.exists(model_path):
            try:
                import onnxruntime as ort
                session = ort.InferenceSession(model_path)
                cls._cache[model_name] = session
                log.info("Loaded ONNX model: %s", model_name)
                return session
            except Exception as e:
                log.warning("Failed to load ONNX model %s: %s — using heuristic fallback", model_name, e)
                return None
        else:
            log.info("No ONNX model found at %s — using heuristic fallback", model_path)
            return None
