import { useState, useEffect, useRef, useCallback } from 'react';

export interface TelemetryData {
  thermal: {
    hull_temp_c: number;
    radiator_temp_c: number;
    internal_temp_c: number;
    in_eclipse: boolean;
    orbit_phase: number;
    timestamp: number;
  };
  power: {
    bus_voltage_v: number;
    solar_array_watts: number;
    load_watts: number;
    battery_soc: number;
    battery_temp_c: number;
    in_eclipse: boolean;
    timestamp: number;
  };
}

export interface Decision {
  subsystem: string;
  action: string;
  reason: string;
  timestamp: number;
}

const WS_URL = (import.meta as any).env?.VITE_WS_URL || 'ws://localhost:8080/ws';

export function useEdgeStream() {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'telemetry') {
            setTelemetry(msg.data);
          } else if (msg.type === 'decision') {
            setDecisions(prev => [msg.data, ...prev].slice(0, 100));
          }
        } catch { /* ignore malformed messages */ }
      };

      ws.onclose = () => {
        setConnected(false);
        reconnectTimer.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => ws.close();
    } catch {
      reconnectTimer.current = setTimeout(connect, 3000);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { telemetry, decisions, connected };
}
