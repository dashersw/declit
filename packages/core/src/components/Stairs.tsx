import { useId } from 'react';
import { useLayer } from '../layers';
import { angleOfWall, dist } from '../model/math';
import type { Vec2 } from '../model/types';
import { selectHandler, useSelected } from '../selection';
import { useLevel } from './Level';

export interface StairsProps {
  id?: string;
  /** plan position of the bottom step */
  from: Vec2;
  /** plan position of the top step edge */
  to: Vec2;
  /** total height climbed (typically the story height) */
  rise: number;
  width?: number;
  /** defaults to ~17.5 cm risers */
  steps?: number;
  color?: string;
  layer?: string;
}

export function Stairs({
  id: idProp,
  from,
  to,
  rise,
  width = 1,
  steps: stepsProp,
  color = '#b9b2a4',
  layer = 'structure',
}: StairsProps) {
  const autoId = useId();
  const id = idProp ?? `stairs${autoId}`;
  const level = useLevel();
  const visible = useLayer(layer);
  const selected = useSelected(id);
  if (!visible) return null;

  const run = dist(from, to);
  const steps = stepsProp ?? Math.max(3, Math.round(rise / 0.175));
  const stepRise = rise / steps;
  const stepRun = run / steps;
  const angle = angleOfWall(from, to);

  return (
    <group
      position={[from[0], level.elevation, from[1]]}
      rotation={[0, angle, 0]}
      onClick={selectHandler(id)}
    >
      {Array.from({ length: steps }, (_, i) => (
        <mesh
          key={i}
          castShadow
          receiveShadow
          position={[(i + 0.5) * stepRun, ((i + 1) * stepRise) / 2, 0]}
        >
          <boxGeometry args={[stepRun, (i + 1) * stepRise, width]} />
          <meshStandardMaterial
            color={color}
            roughness={0.9}
            emissive="#2563eb"
            emissiveIntensity={selected ? 0.2 : 0}
          />
        </mesh>
      ))}
    </group>
  );
}
