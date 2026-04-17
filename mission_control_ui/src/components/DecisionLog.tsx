import React from 'react';
import { Decision } from '../hooks/useEdgeStream';

interface Props {
  decisions: Decision[];
}

const actionColors: Record<string, string> = {
  heaters_activated: '#f97316',
  heaters_activated_predictive: '#eab308',
  heaters_deactivated: '#22c55e',
  radiators_activated: '#3b82f6',
  load_shed_activated: '#ef4444',
  load_shed_deactivated: '#22c55e',
};

export default function DecisionLog({ decisions }: Props) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ color: '#7eb8ff', marginBottom: 8, fontSize: '0.9rem' }}>
        🧠 AI DECISION LOG
      </h3>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {decisions.length === 0 && (
          <p style={{ color: '#6b7280', fontStyle: 'italic' }}>Awaiting autonomous decisions...</p>
        )}
        {decisions.map((d, i) => (
          <div
            key={`${d.timestamp}-${i}`}
            style={{
              padding: '8px 10px',
              marginBottom: 6,
              borderLeft: `3px solid ${actionColors[d.action] || '#6b7280'}`,
              background: '#1a1f35',
              borderRadius: '0 4px 4px 0',
              fontSize: '0.82rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ color: actionColors[d.action] || '#9ca3af', fontWeight: 600 }}>
                [{d.subsystem.toUpperCase()}] {d.action.replace(/_/g, ' ').toUpperCase()}
              </span>
              <span style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                {new Date(d.timestamp * 1000).toLocaleTimeString()}
              </span>
            </div>
            <div style={{ color: '#d1d5db' }}>{d.reason}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
