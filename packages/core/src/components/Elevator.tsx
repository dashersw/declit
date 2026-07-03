import { useId } from 'react';
import { useLayer } from '../layers';
import type { Vec2 } from '../model/types';
import { selectHandler, useSelected } from '../selection';
import { useLevel } from './Level';

export interface ElevatorProps {
  id?: string;
  /** south-west corner of the shaft footprint */
  at: Vec2;
  width?: number;
  depth?: number;
  /** shaft height on this floor (usually the storey height) */
  height: number;
  /** which side the landing doors open onto: the shaft is open on that face */
  doorSide?: 'south' | 'north' | 'east' | 'west';
  /** show the car parked on this floor */
  car?: boolean;
  layer?: string;
}

const T = 0.1; // shaft wall thickness

/**
 * One storey of an elevator: three shaft walls (the door side is open), a pair
 * of landing doors, and optionally the car parked on this floor. Render one per
 * storey in the same footprint and cut a matching `<Slab holes>` shaft void in
 * every floor so the car can travel.
 */
export function Elevator({
  id: idProp,
  at,
  width = 2.0,
  depth = 2.0,
  height,
  doorSide = 'south',
  car = false,
  layer = 'structure',
}: ElevatorProps) {
  const autoId = useId();
  const id = idProp ?? `lift${autoId}`;
  const level = useLevel();
  const visible = useLayer(layer);
  const selected = useSelected(id);
  if (!visible) return null;

  const emissive = selected ? 0.25 : 0;
  const doorH = Math.min(2.2, height - 0.2);
  // rotate the whole shaft so local -z (where the doors sit) faces doorSide
  const yaw = { south: 0, north: Math.PI, east: -Math.PI / 2, west: Math.PI / 2 }[doorSide];
  const shaft = (
    <meshStandardMaterial color="#cdd2d6" roughness={0.6} metalness={0.15} emissive="#2563eb" emissiveIntensity={emissive} />
  );
  const metal = (
    <meshStandardMaterial color="#9aa2a8" roughness={0.35} metalness={0.7} emissive="#2563eb" emissiveIntensity={emissive} />
  );

  return (
    <group position={[at[0] + width / 2, level.elevation, at[1] + depth / 2]} rotation={[0, yaw, 0]} onClick={selectHandler(id)}>
      {/* back wall (far from the doors) */}
      <mesh castShadow receiveShadow position={[0, height / 2, depth / 2 - T / 2]}>
        <boxGeometry args={[width, height, T]} />
        {shaft}
      </mesh>
      {/* side walls */}
      <mesh castShadow receiveShadow position={[-width / 2 + T / 2, height / 2, 0]}>
        <boxGeometry args={[T, height, depth]} />
        {shaft}
      </mesh>
      <mesh castShadow receiveShadow position={[width / 2 - T / 2, height / 2, 0]}>
        <boxGeometry args={[T, height, depth]} />
        {shaft}
      </mesh>
      {/* lintel above the doors */}
      <mesh castShadow position={[0, (doorH + height) / 2, -depth / 2 + T / 2]}>
        <boxGeometry args={[width, height - doorH, T]} />
        {shaft}
      </mesh>
      {/* two landing doors on the front */}
      <mesh castShadow position={[-width / 4 - 0.01, doorH / 2, -depth / 2 + T / 2]}>
        <boxGeometry args={[width / 2 - 0.04, doorH, 0.05]} />
        {metal}
      </mesh>
      <mesh castShadow position={[width / 4 + 0.01, doorH / 2, -depth / 2 + T / 2]}>
        <boxGeometry args={[width / 2 - 0.04, doorH, 0.05]} />
        {metal}
      </mesh>
      {/* call plate */}
      <mesh position={[width / 2 + 0.02, 1.1, -depth / 2 + 0.05]}>
        <boxGeometry args={[0.03, 0.14, 0.08]} />
        {metal}
      </mesh>
      {car && (
        <mesh castShadow position={[0, (doorH - 0.05) / 2 + 0.05, 0.12]}>
          <boxGeometry args={[width - 0.28, doorH - 0.1, depth - 0.34]} />
          <meshStandardMaterial color="#b7bdc2" roughness={0.3} metalness={0.6} emissive="#2563eb" emissiveIntensity={emissive} />
        </mesh>
      )}
    </group>
  );
}
