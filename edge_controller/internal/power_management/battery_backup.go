// Package power_management implements hardcoded fail-safes for automated load shedding.
package power_management

import (
	"log"

	"lunar-gateway-autonomy/edge_controller/internal/ingestion"
	"lunar-gateway-autonomy/edge_controller/internal/state_manager"
)

const (
	criticalSOC   = 0.15 // 15 % — shed non-essential loads
	warningSOC    = 0.30 // 30 % — alert
	lowVoltage    = 25.0 // V — emergency load shedding
	normalVoltage = 27.0 // V — restore loads
)

// BatteryBackup manages automated 120V/12V load shedding.
type BatteryBackup struct {
	state     *state_manager.StateSync
	shedding  bool
}

// NewBatteryBackup creates a new power management controller.
func NewBatteryBackup(state *state_manager.StateSync) *BatteryBackup {
	return &BatteryBackup{state: state}
}

// Evaluate inspects power data and triggers fail-safes if necessary.
func (b *BatteryBackup) Evaluate(p ingestion.PowerData) {
	if p.BatterySOC < criticalSOC || p.BusVoltageV < lowVoltage {
		if !b.shedding {
			log.Printf("[POWER] CRITICAL: SOC=%.1f%%, V=%.1fV — SHEDDING non-essential loads",
				p.BatterySOC*100, p.BusVoltageV)
			b.shedding = true
			b.state.PublishDecision("power", "load_shed_activated",
				"Battery critically low; non-essential 120V/12V loads disconnected.")
		}
	} else if p.BatterySOC < warningSOC {
		log.Printf("[POWER] WARNING: SOC=%.1f%% — monitoring closely", p.BatterySOC*100)
	} else if b.shedding && p.BusVoltageV > normalVoltage && p.BatterySOC > warningSOC {
		log.Printf("[POWER] Restored: SOC=%.1f%%, V=%.1fV — loads reconnected",
			p.BatterySOC*100, p.BusVoltageV)
		b.shedding = false
		b.state.PublishDecision("power", "load_shed_deactivated",
			"Battery recovered; non-essential loads reconnected.")
	}
}
