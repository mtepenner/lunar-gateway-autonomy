import React from 'react';
import { TelemetryData } from '../hooks/useEdgeStream';

interface Props {
  telemetry: TelemetryData | null;
}

function Bar({ label, value, max, unit, color }: {
  label: string; value: number; max: number; unit: string; color: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 3 }}>
        <span style={{ color: '#9ca3af' }}>{label}</span>
        <span style={{ color, fontWeight: 600 }}>{value.toFixed(1)} {unit}</span>
      </div>
      <div style={{ background: '#1f2937', borderRadius: 4, height: 10, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: 4,
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  );
}

export default function PowerGrid({ telemetry }: Props) {
  const power = telemetry?.power;

  return (
    <div>
      <h3 style={{ color: '#7eb8ff', marginBottom: 12, fontSize: '0.9rem' }}>
        ⚡ POWER GRID
      </h3>
      {!power ? (
        <p style={{ color: '#6b7280', fontStyle: 'italic' }}>Awaiting power telemetry...</p>
      ) : (
        <>
          <Bar label="Solar Array Output" value={power.solar_array_watts} max={5000} unit="W" color="#eab308" />
          <Bar label="Station Load" value={power.load_watts} max={5000} unit="W" color="#f97316" />
          <Bar label="Battery SOC" value={power.battery_soc * 100} max={100} unit="%" color={
            power.battery_soc < 0.15 ? '#ef4444' : power.battery_soc < 0.3 ? '#f97316' : '#22c55e'
          } />
          <Bar label="Bus Voltage" value={power.bus_voltage_v} max={32} unit="V" color="#3b82f6" />

          <div style={{
            marginTop: 12,
            padding: '8px 10px',
            background: power.in_eclipse ? '#1e1b4b' : '#1a2e05',
            borderRadius: 6,
            fontSize: '0.82rem',
            textAlign: 'center',
            border: `1px solid ${power.in_eclipse ? '#4338ca' : '#365314'}`,
          }}>
            {power.in_eclipse ? '🌑 IN ECLIPSE — Solar arrays offline' : '☀️ SUNLIT — Solar arrays charging'}
          </div>

          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <Stat label="Hull Temp" value={`${telemetry!.thermal.hull_temp_c.toFixed(1)}°C`}
              color={telemetry!.thermal.hull_temp_c < -50 ? '#3b82f6' : '#22c55e'} />
            <Stat label="Internal Temp" value={`${telemetry!.thermal.internal_temp_c.toFixed(1)}°C`} color="#22c55e" />
            <Stat label="Radiator Temp" value={`${telemetry!.thermal.radiator_temp_c.toFixed(1)}°C`} color="#6b7280" />
            <Stat label="Battery Temp" value={`${power.battery_temp_c.toFixed(1)}°C`} color="#9ca3af" />
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: '#1a1f35', borderRadius: 4, padding: '6px 8px', textAlign: 'center' }}>
      <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{label}</div>
      <div style={{ fontSize: '0.95rem', fontWeight: 700, color }}>{value}</div>
    </div>
  );
}
