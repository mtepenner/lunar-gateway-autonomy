// Package ingestion subscribes to the raw station telemetry stream via MQTT.
package ingestion

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

// ThermalData holds thermal sensor readings.
type ThermalData struct {
	HullTempC     float64 `json:"hull_temp_c"`
	RadiatorTempC float64 `json:"radiator_temp_c"`
	InternalTempC float64 `json:"internal_temp_c"`
	InEclipse     bool    `json:"in_eclipse"`
	OrbitPhase    float64 `json:"orbit_phase"`
	Timestamp     float64 `json:"timestamp"`
}

// PowerData holds power bus readings.
type PowerData struct {
	BusVoltageV     float64 `json:"bus_voltage_v"`
	SolarArrayWatts float64 `json:"solar_array_watts"`
	LoadWatts       float64 `json:"load_watts"`
	BatterySOC      float64 `json:"battery_soc"`
	BatteryTempC    float64 `json:"battery_temp_c"`
	InEclipse       bool    `json:"in_eclipse"`
	Timestamp       float64 `json:"timestamp"`
}

// Telemetry is the combined payload from the station simulator.
type Telemetry struct {
	Thermal ThermalData `json:"thermal"`
	Power   PowerData   `json:"power"`
}

// TelemetryHandler is called each time a new telemetry message arrives.
type TelemetryHandler func(Telemetry)

// MQTTClient wraps the MQTT subscription logic.
type MQTTClient struct {
	broker  string
	port    string
	client  mqtt.Client
	handler TelemetryHandler
}

// NewMQTTClient creates a new MQTT subscriber.
func NewMQTTClient(broker, port string, handler TelemetryHandler) *MQTTClient {
	return &MQTTClient{broker: broker, port: port, handler: handler}
}

// Connect establishes the MQTT connection and subscribes to telemetry topics.
func (m *MQTTClient) Connect() error {
	opts := mqtt.NewClientOptions().
		AddBroker(fmt.Sprintf("tcp://%s:%s", m.broker, m.port)).
		SetClientID("edge-controller").
		SetAutoReconnect(true).
		SetConnectRetry(true).
		SetConnectRetryInterval(3 * time.Second).
		SetOnConnectHandler(func(c mqtt.Client) {
			log.Println("[MQTT] Connected, subscribing to station/telemetry")
			c.Subscribe("station/telemetry", 1, m.onTelemetry)
		})

	m.client = mqtt.NewClient(opts)
	token := m.client.Connect()
	token.Wait()
	return token.Error()
}

// Disconnect cleanly stops the MQTT client.
func (m *MQTTClient) Disconnect() {
	if m.client != nil && m.client.IsConnected() {
		m.client.Disconnect(1000)
	}
}

func (m *MQTTClient) onTelemetry(_ mqtt.Client, msg mqtt.Message) {
	var t Telemetry
	if err := json.Unmarshal(msg.Payload(), &t); err != nil {
		log.Printf("[MQTT] Bad telemetry payload: %v", err)
		return
	}
	m.handler(t)
}
