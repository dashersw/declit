import { useId } from 'react';
import { useLayer } from '../layers';
import { selectHandler, useSelected } from '../selection';
import { useOpeningRegistration } from './openings';
import { useWall } from './Wall';

const FRAME = 0.06;

export interface WindowProps {
  id?: string;
  /** center of the window along the wall, from its `from` point */
  at: number;
  width?: number;
  height?: number;
  /** bottom of the window above the wall base */
  sill?: number;
  frameColor?: string;
  glassColor?: string;
  layer?: string;
}

export function Window({
  id: idProp,
  at,
  width = 1.2,
  height = 1.2,
  sill = 0.9,
  frameColor = '#f2f2ee',
  glassColor = '#a8c8dc',
  layer = 'openings',
}: WindowProps) {
  const wall = useWall();
  const autoId = useId();
  const id = idProp ?? `window${autoId}`;
  const resolved = useOpeningRegistration({ id, kind: 'window', at, width, height, sill });
  const visible = useLayer(layer);
  const selected = useSelected(id);
  const t = wall.thickness;
  const cy = sill + height / 2;
  const emissiveIntensity = selected ? 0.3 : 0;

  const frame = (
    <meshStandardMaterial color={frameColor} roughness={0.6} emissive="#2563eb" emissiveIntensity={emissiveIntensity} />
  );

  return (
    <group position={[at, 0, 0]} visible={visible} onClick={visible ? selectHandler(id) : undefined}>
      {resolved && !resolved.valid ? (
        <mesh position={[0, cy, 0]}>
          <boxGeometry args={[width, height, t + 0.06]} />
          <meshStandardMaterial color="#e11d48" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ) : (
        <>
          <mesh castShadow position={[-width / 2 + FRAME / 2, cy, 0]}>
            <boxGeometry args={[FRAME, height, t + 0.02]} />
            {frame}
          </mesh>
          <mesh castShadow position={[width / 2 - FRAME / 2, cy, 0]}>
            <boxGeometry args={[FRAME, height, t + 0.02]} />
            {frame}
          </mesh>
          <mesh castShadow position={[0, sill + height - FRAME / 2, 0]}>
            <boxGeometry args={[width - FRAME * 2, FRAME, t + 0.02]} />
            {frame}
          </mesh>
          <mesh castShadow position={[0, sill + FRAME / 2, 0]}>
            <boxGeometry args={[width - FRAME * 2, FRAME, t + 0.02]} />
            {frame}
          </mesh>
          <mesh position={[0, cy, 0]}>
            <boxGeometry args={[0.04, height - FRAME * 2, 0.03]} />
            {frame}
          </mesh>
          <mesh position={[0, cy, 0]}>
            <boxGeometry args={[width - FRAME * 2, height - FRAME * 2, 0.016]} />
            <meshStandardMaterial
              color={glassColor}
              transparent
              opacity={0.32}
              roughness={0.08}
              metalness={0.1}
              emissive="#2563eb"
              emissiveIntensity={emissiveIntensity}
            />
          </mesh>
          <mesh castShadow position={[0, sill - 0.02, 0]}>
            <boxGeometry args={[width + 0.08, 0.04, t + 0.1]} />
            {frame}
          </mesh>
        </>
      )}
    </group>
  );
}
