// Package thermal_control actuates heater relays based on AI triggers or threshold limits.
package thermal_control

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"lunar-gateway-autonomy/edge_controller/internal/ingestion"
	"lunar-gateway-autonomy/edge_controller/internal/state_manager"
)

const (
	freezeThreshold = -80.0  // °C — activate heaters immediately
	heatThreshold   = 120.0  // °C — activate radiators
	safeMinTemp     = -40.0  // °C — deactivate heaters
)

// HeaterController manages thermal actuators.
type HeaterController struct {
	aiURL      string
	state      *state_manager.StateSync
	heaterOn   bool
	httpClient *http.Client
}

// NewHeaterController creates a thermal controller that can consult the AI engine.
func NewHeaterController(aiURL string, state *state_manager.StateSync) *HeaterController {
	return &HeaterController{
		aiURL: aiURL,
		state: state,
		httpClient: &http.Client{Timeout: 5 * time.Second},
	}
}

// Evaluate checks thermal data and actuates heaters.
func (h *HeaterController) Evaluate(t ingestion.ThermalData) {
	// Hard fail-safe: act immediately on extreme temps
	if t.HullTempC < freezeThreshold && !h.heaterOn {
		log.Printf("[THERMAL] FREEZE RISK: hull=%.1f°C — ACTIVATING heaters", t.HullTempC)
		h.heaterOn = true
		h.state.PublishDecision("thermal", "heaters_activated",
			fmt.Sprintf("Hull temp %.1f°C below freeze threshold (%.1f°C)", t.HullTempC, freezeThreshold))
		return
	}

	if t.HullTempC > heatThreshold {
		log.Printf("[THERMAL] OVERHEAT RISK: hull=%.1f°C — activating radiators", t.HullTempC)
		h.state.PublishDecision("thermal", "radiators_activated",
			fmt.Sprintf("Hull temp %.1f°C above heat threshold (%.1f°C)", t.HullTempC, heatThreshold))
		return
	}

	if h.heaterOn && t.HullTempC > safeMinTemp {
		log.Printf("[THERMAL] Safe temp reached: hull=%.1f°C — deactivating heaters", t.HullTempC)
		h.heaterOn = false
		h.state.PublishDecision("thermal", "heaters_deactivated",
			fmt.Sprintf("Hull temp %.1f°C recovered above safe minimum", t.HullTempC))
		return
	}

	// Consult AI for predictive action
	h.consultAI(t)
}

func (h *HeaterController) consultAI(t ingestion.ThermalData) {
	payload, _ := json.Marshal(t)
	resp, err := h.httpClient.Post(h.aiURL+"/api/telemetry/predict", "application/json", bytes.NewReader(payload))
	if err != nil {
		log.Printf("[THERMAL] AI engine unreachable: %v (using local thresholds only)", err)
		return
	}
	defer resp.Body.Close()

	var result struct {
		Action string `json:"action"`
		Reason string `json:"reason"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return
	}

	if result.Action == "activate_heaters" && !h.heaterOn {
		log.Printf("[THERMAL] AI predicted freeze — activating heaters: %s", result.Reason)
		h.heaterOn = true
		h.state.PublishDecision("thermal", "heaters_activated_predictive", result.Reason)
	}
}
