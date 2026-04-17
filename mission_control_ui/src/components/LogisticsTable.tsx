import React, { useState, useEffect } from 'react';

interface CargoItem {
  item: string;
  quantity: number;
  mass_kg: number | null;
  priority: string;
  notes: string;
}

interface Manifest {
  manifest_id: string;
  vehicle: string;
  origin: string;
  total_mass_kg: number;
  item_count: number;
  items: CargoItem[];
}

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

const priorityColors: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

export default function LogisticsTable() {
  const [manifests, setManifests] = useState<Manifest[]>([]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/logistics/extract`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            manifest_id: 'demo',
            vehicle: 'Dragon XL-4',
            origin: 'KSC',
            cargo: [
              { item: 'Water Recycler Filter Pack', qty: 5, mass_kg: 12.5, priority: 'critical' },
              { item: 'Oxygen Canister 5L', qty: 10, mass_kg: 8.2, priority: 'high' },
              { item: 'Food Ration Packet (Beef Stew)', qty: 50, mass_kg: 0.4 },
            ],
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setManifests(prev => {
            const exists = prev.some(m => m.manifest_id === data.manifest_id);
            if (exists) return prev;
            return [data, ...prev].slice(0, 10);
          });
        }
      } catch { /* AI engine may be offline */ }
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ color: '#7eb8ff', marginBottom: 8, fontSize: '0.9rem' }}>
        📦 CARGO LOGISTICS
      </h3>
      {manifests.length === 0 ? (
        <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
          Awaiting cargo manifests from supply vehicles...
        </p>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {manifests.map((m) => (
            <div key={m.manifest_id} style={{
              background: '#1a1f35',
              borderRadius: 6,
              padding: 10,
              marginBottom: 8,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: '#d1d5db' }}>
                  {m.vehicle} — {m.origin}
                </span>
                <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                  ID: {m.manifest_id} | {m.total_mass_kg.toFixed(1)} kg | {m.item_count} items
                </span>
              </div>
              <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ color: '#6b7280', borderBottom: '1px solid #374151' }}>
                    <th style={{ textAlign: 'left', padding: '4px 6px' }}>Item</th>
                    <th style={{ textAlign: 'right', padding: '4px 6px' }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '4px 6px' }}>Mass</th>
                    <th style={{ textAlign: 'center', padding: '4px 6px' }}>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {m.items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #1f2937' }}>
                      <td style={{ padding: '4px 6px', color: '#d1d5db' }}>{item.item}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right', color: '#9ca3af' }}>{item.quantity}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right', color: '#9ca3af' }}>
                        {item.mass_kg != null ? `${item.mass_kg} kg` : '—'}
                      </td>
                      <td style={{ padding: '4px 6px', textAlign: 'center' }}>
                        <span style={{
                          color: priorityColors[item.priority] || '#9ca3af',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          fontSize: '0.72rem',
                        }}>
                          {item.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
