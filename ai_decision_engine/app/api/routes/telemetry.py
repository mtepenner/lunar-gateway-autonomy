"""Endpoints for the Go controller to request complex thermal decisions."""

from fastapi import APIRouter
from pydantic import BaseModel

from models.thermal_predictor import ThermalPredictor

router = APIRouter()
predictor = ThermalPredictor()


class ThermalInput(BaseModel):
    hull_temp_c: float
    radiator_temp_c: float = 0.0
    internal_temp_c: float = 22.0
    in_eclipse: bool = False
    orbit_phase: float = 0.0
    timestamp: float = 0.0


class PredictionResponse(BaseModel):
    action: str
    reason: str
    predicted_temp_in_5m: float
    confidence: float


@router.post("/predict", response_model=PredictionResponse)
async def predict_thermal(data: ThermalInput):
    result = predictor.predict(
        hull_temp=data.hull_temp_c,
        radiator_temp=data.radiator_temp_c,
        in_eclipse=data.in_eclipse,
        orbit_phase=data.orbit_phase,
    )
    return result
