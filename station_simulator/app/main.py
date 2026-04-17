"""Station Simulator – publishes simulated telemetry over MQTT."""

import json
import logging
import os
import time

import paho.mqtt.client as mqtt

from sensors.thermal import ThermalSimulator
from sensors.power_bus import PowerBusSimulator
from logistics.manifest_generator import generate_manifest

logging.basicConfig(level=logging.INFO, format="%(asctime)s [SIM] %(message)s")
log = logging.getLogger(__name__)

MQTT_BROKER = os.getenv("MQTT_BROKER", "redis")
MQTT_PORT = int(os.getenv("MQTT_PORT", "1883"))
PUBLISH_INTERVAL = float(os.getenv("PUBLISH_INTERVAL", "2.0"))
MANIFEST_INTERVAL = float(os.getenv("MANIFEST_INTERVAL", "15.0"))


def main():
    thermal = ThermalSimulator()
    power = PowerBusSimulator()

    client = mqtt.Client(client_id="station-sim", protocol=mqtt.MQTTv311)

    connected = False
    while not connected:
        try:
            client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
            connected = True
            log.info("Connected to MQTT broker at %s:%d", MQTT_BROKER, MQTT_PORT)
        except Exception as exc:
            log.warning("MQTT connection failed (%s), retrying in 3s...", exc)
            time.sleep(3)

    client.loop_start()

    last_manifest = 0.0
    try:
        while True:
            thermal_data = thermal.read()
            power_data = power.read()

            telemetry = {
                "thermal": thermal_data,
                "power": power_data,
            }
            client.publish("station/telemetry", json.dumps(telemetry), qos=1)
            log.info(
                "Telemetry → hull=%.1f°C  bus=%.1fV  soc=%.1f%%  eclipse=%s",
                thermal_data["hull_temp_c"],
                power_data["bus_voltage_v"],
                power_data["battery_soc"] * 100,
                thermal_data["in_eclipse"],
            )

            now = time.time()
            if now - last_manifest >= MANIFEST_INTERVAL:
                manifest = generate_manifest()
                client.publish("station/manifest", json.dumps(manifest), qos=1)
                log.info("Manifest published: %s", manifest.get("manifest_id", "?"))
                last_manifest = now

            time.sleep(PUBLISH_INTERVAL)
    except KeyboardInterrupt:
        log.info("Shutting down simulator.")
    finally:
        client.loop_stop()
        client.disconnect()


if __name__ == "__main__":
    main()
