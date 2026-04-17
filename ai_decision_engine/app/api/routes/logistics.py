"""Endpoints to process cargo and supply statuses."""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Any

from models.logistics_extractor import LogisticsExtractor

router = APIRouter()
extractor = LogisticsExtractor()


class ManifestInput(BaseModel):
    manifest_id: str = ""
    vehicle: str = ""
    origin: str = ""
    launch_ts: float = 0.0
    cargo: list[dict[str, Any]] = []
    raw_text: str | None = None


class CargoItem(BaseModel):
    item: str
    quantity: int
    mass_kg: float | None = None
    priority: str = "medium"
    notes: str = ""


class StructuredManifest(BaseModel):
    manifest_id: str
    vehicle: str
    origin: str
    total_mass_kg: float
    item_count: int
    items: list[CargoItem]


@router.post("/extract", response_model=StructuredManifest)
async def extract_manifest(data: ManifestInput):
    result = extractor.extract(data.model_dump())
    return result
