import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { TelemetryData } from '../hooks/useEdgeStream';
import * as THREE from 'three';

interface Props {
  telemetry: TelemetryData | null;
}

function GatewayModel({ telemetry }: Props) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  const hullColor = telemetry
    ? telemetry.thermal.hull_temp_c < -50
      ? '#3b82f6'
      : telemetry.thermal.hull_temp_c > 80
        ? '#ef4444'
        : '#22c55e'
    : '#6b7280';

  const heaterActive = telemetry ? telemetry.thermal.hull_temp_c < -50 : false;
  const inEclipse = telemetry?.thermal.in_eclipse ?? false;

  return (
    <group ref={groupRef}>
      {/* Main habitat module */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 3, 16]} />
        <meshStandardMaterial color={hullColor} metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Solar arrays */}
      <mesh position={[-2.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.05, 3, 1.2]} />
        <meshStandardMaterial
          color={inEclipse ? '#374151' : '#2563eb'}
          emissive={inEclipse ? '#000' : '#1d4ed8'}
          emissiveIntensity={inEclipse ? 0 : 0.3}
        />
      </mesh>
      <mesh position={[2.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.05, 3, 1.2]} />
        <meshStandardMaterial
          color={inEclipse ? '#374151' : '#2563eb'}
          emissive={inEclipse ? '#000' : '#1d4ed8'}
          emissiveIntensity={inEclipse ? 0 : 0.3}
        />
      </mesh>

      {/* Docking port */}
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 0.5, 12]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Heater glow indicators */}
      {heaterActive && (
        <>
          <pointLight position={[0, 0, 1.2]} color="#f97316" intensity={2} distance={3} />
          <pointLight position={[0, 0, -1.2]} color="#f97316" intensity={2} distance={3} />
        </>
      )}

      {/* Radiator panels */}
      <mesh position={[0, -0.5, 1.2]} rotation={[Math.PI / 6, 0, 0]}>
        <boxGeometry args={[1.5, 0.02, 0.6]} />
        <meshStandardMaterial color="#d1d5db" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.5, -1.2]} rotation={[-Math.PI / 6, 0, 0]}>
        <boxGeometry args={[1.5, 0.02, 0.6]} />
        <meshStandardMaterial color="#d1d5db" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

export default function Station3D({ telemetry }: Props) {
  return (
    <div style={{ height: '100%', minHeight: 300 }}>
      <h3 style={{ color: '#7eb8ff', marginBottom: 8, fontSize: '0.9rem' }}>
        🛸 GATEWAY 3D VIEW
      </h3>
      <Canvas camera={{ position: [5, 3, 5], fov: 45 }} style={{ borderRadius: 6 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <GatewayModel telemetry={telemetry} />
        <OrbitControls enableZoom enablePan={false} />
      </Canvas>
    </div>
  );
}
