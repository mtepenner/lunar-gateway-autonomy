import React from 'react';
import Station3D from './components/Station3D';
import DecisionLog from './components/DecisionLog';
import PowerGrid from './components/PowerGrid';
import LogisticsTable from './components/LogisticsTable';
import { useEdgeStream } from './hooks/useEdgeStream';

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: 'auto 1fr 1fr',
    gap: '12px',
    padding: '16px',
    height: '100vh',
    background: '#0a0e1a',
  },
  header: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '12px',
    background: 'linear-gradient(135deg, #1a1f35, #0d1117)',
    borderRadius: '8px',
    border: '1px solid #1e3a5f',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#7eb8ff',
    letterSpacing: '2px',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#8892a6',
    marginTop: '4px',
  },
  panel: {
    background: '#111827',
    borderRadius: '8px',
    border: '1px solid #1e3a5f',
    padding: '16px',
    overflow: 'auto',
  },
  statusDot: {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    marginRight: 8,
  },
};

function App() {
  const { telemetry, decisions, connected } = useEdgeStream();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>🌑 LUNAR GATEWAY — MISSION CONTROL</div>
        <div style={styles.subtitle}>
          <span style={{
            ...styles.statusDot,
            backgroundColor: connected ? '#22c55e' : '#ef4444',
          }} />
          {connected ? 'CONNECTED TO EDGE CONTROLLER' : 'DISCONNECTED — BUFFERING'}
        </div>
      </div>

      <div style={styles.panel}>
        <Station3D telemetry={telemetry} />
      </div>

      <div style={styles.panel}>
        <PowerGrid telemetry={telemetry} />
      </div>

      <div style={styles.panel}>
        <DecisionLog decisions={decisions} />
      </div>

      <div style={styles.panel}>
        <LogisticsTable />
      </div>
    </div>
  );
}

export default App;
