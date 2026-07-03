import { useId } from 'react';
import { useLayer } from '../layers';
import type { Vec2 } from '../model/types';
import { selectHandler, useSelected } from '../selection';
import { useLevel } from './Level';

export interface PoolProps {
  id?: string;
  /** south-west corner of the water surface */
  at: Vec2;
  width: number;
  depth: number;
  curb?: number;
  curbHeight?: number;
  waterColor?: string;
  curbColor?: string;
  layer?: string;
}

export function Pool({
  id: idProp,
  at,
  width,
  depth,
  curb = 0.14,
  curbHeight = 0.16,
  waterColor = '#3fa8cf',
  curbColor = '#d8d2c6',
  layer = 'structure',
}: PoolProps) {
  const autoId = useId();
  const id = idProp ?? `pool${autoId}`;
  const level = useLevel();
  const visible = useLayer(layer);
  const selected = useSelected(id);
  if (!visible) return null;

  const emissiveIntensity = selected ? 0.25 : 0;
  const curbMaterial = (
    <meshStandardMaterial
      color={curbColor}
      roughness={0.85}
      emissive="#2563eb"
      emissiveIntensity={emissiveIntensity}
    />
  );

  return (
    <group position={[at[0], level.elevation, at[1]]} onClick={selectHandler(id)}>
      <mesh castShadow position={[width / 2, curbHeight / 2, -curb / 2]}>
        <boxGeometry args={[width + curb * 2, curbHeight, curb]} />
        {curbMaterial}
      </mesh>
      <mesh castShadow position={[width / 2, curbHeight / 2, depth + curb / 2]}>
        <boxGeometry args={[width + curb * 2, curbHeight, curb]} />
        {curbMaterial}
      </mesh>
      <mesh castShadow position={[-curb / 2, curbHeight / 2, depth / 2]}>
        <boxGeometry args={[curb, curbHeight, depth]} />
        {curbMaterial}
      </mesh>
      <mesh castShadow position={[width + curb / 2, curbHeight / 2, depth / 2]}>
        <boxGeometry args={[curb, curbHeight, depth]} />
        {curbMaterial}
      </mesh>
      <mesh position={[width / 2, 0.07, depth / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial
          color={waterColor}
          transparent
          opacity={0.7}
          roughness={0.05}
          metalness={0.1}
          emissive="#2563eb"
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>
    </group>
  );
}
