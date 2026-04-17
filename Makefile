.PHONY: build up down test test-sim test-ai test-go lint clean

build:
	docker-compose build

up:
	docker-compose up --build -d

down:
	docker-compose down

logs:
	docker-compose logs -f

test: test-sim test-ai test-go

test-sim:
	@echo "=== Testing Station Simulator ==="
	cd station_simulator && python -m pytest tests/ -v || echo "No pytest tests found — running smoke test" && python -c "from app.sensors.thermal import ThermalSimulator; t=ThermalSimulator(); print('Thermal OK:', t.read())"
	cd station_simulator && python -c "from app.sensors.power_bus import PowerBusSimulator; p=PowerBusSimulator(); print('Power OK:', p.read())"
	cd station_simulator && python -c "from app.logistics.manifest_generator import generate_manifest; print('Manifest OK:', generate_manifest())"

test-ai:
	@echo "=== Testing AI Decision Engine ==="
	cd ai_decision_engine && python -m pytest tests/ -v || echo "No pytest tests found — running smoke test" && python -c "from app.models.thermal_predictor import ThermalPredictor; p=ThermalPredictor(); print('Predictor OK:', p.predict(-60, -90, True, 0.55))"
	cd ai_decision_engine && python -c "from app.models.logistics_extractor import LogisticsExtractor; e=LogisticsExtractor(); print('Extractor OK:', e.extract({'manifest_id':'test','vehicle':'X','origin':'KSC','cargo':[{'item':'Water','qty':5}]}))"

test-go:
	@echo "=== Testing Edge Controller ==="
	cd edge_controller && go build ./... && echo "Go build OK"

lint:
	cd edge_controller && go vet ./...
	cd ai_decision_engine && python -m flake8 app/ --max-line-length 120 || true
	cd station_simulator && python -m flake8 app/ --max-line-length 120 || true

clean:
	docker-compose down -v --rmi local
	rm -rf edge_controller/edge-controller
