// Entry point for the edge controller daemon.
package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"syscall"

	"lunar-gateway-autonomy/edge_controller/internal/ingestion"
	"lunar-gateway-autonomy/edge_controller/internal/power_management"
	"lunar-gateway-autonomy/edge_controller/internal/state_manager"
	"lunar-gateway-autonomy/edge_controller/internal/thermal_control"
)

func main() {
	log.Println("[EDGE] Starting Lunar Gateway Edge Controller...")

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	mqttBroker := envOrDefault("MQTT_BROKER", "redis")
	mqttPort := envOrDefault("MQTT_PORT", "1883")
	redisAddr := envOrDefault("REDIS_ADDR", "redis:6379")
	aiEngineURL := envOrDefault("AI_ENGINE_URL", "http://ai-engine:8000")

	stateSync := state_manager.New(redisAddr)
	thermalCtrl := thermal_control.NewHeaterController(aiEngineURL, stateSync)
	powerMgr := power_management.NewBatteryBackup(stateSync)

	mqttClient := ingestion.NewMQTTClient(mqttBroker, mqttPort, func(telemetry ingestion.Telemetry) {
		// Run fail-safes
		powerMgr.Evaluate(telemetry.Power)
		thermalCtrl.Evaluate(telemetry.Thermal)

		// Buffer to local state
		stateSync.BufferTelemetry(ctx, telemetry)
	})

	if err := mqttClient.Connect(); err != nil {
		log.Fatalf("[EDGE] Failed to connect to MQTT: %v", err)
	}
	defer mqttClient.Disconnect()

	log.Println("[EDGE] Controller running. Waiting for telemetry...")

	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	<-sigCh
	log.Println("[EDGE] Shutting down gracefully...")
}

func envOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
