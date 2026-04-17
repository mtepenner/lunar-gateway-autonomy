"""FastAPI server running locally on the Gateway's internal network."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes.telemetry import router as telemetry_router
from api.routes.logistics import router as logistics_router

app = FastAPI(title="Lunar Gateway AI Decision Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(telemetry_router, prefix="/api/telemetry", tags=["telemetry"])
app.include_router(logistics_router, prefix="/api/logistics", tags=["logistics"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai-decision-engine"}
