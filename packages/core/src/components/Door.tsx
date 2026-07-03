import { useId, useMemo } from 'react';
import { Line } from '@react-three/drei';
import { useLayer } from '../layers';
import { selectHandler, useSelected } from '../selection';
import { useOpeningRegistration } from './openings';
import { useWall } from './Wall';

const FRAME = 0.05;

export interface DoorProps {
  id?: string;
  /** center of the door along the wall, from its `from` point */
  at: number;
  width?: number;
  height?: number;
  /** 0 = closed, 1 = fully open */
  open?: number;
  hinge?: 'start' | 'end';
  /** which side of the wall the leaf swings toward: +1 = local +Z */
  swing?: 1 | -1;
  showSwing?: boolean;
  frameColor?: string;
  leafColor?: string;
  layer?: string;
}

export function Door({
  id: idProp,
  at,
  width = 0.9,
  height = 2.1,
  open = 0,
  hinge = 'start',
  swing = 1,
  showSwing = true,
  frameColor = '#7a6a55',
  leafColor = '#9c8467',
  layer = 'openings',
}: DoorProps) {
  const wall = useWall();
  const autoId = useId();
  const id = idProp ?? `door${autoId}`;
  const resolved = useOpeningRegistration({ id, kind: 'door', at, width, height, sill: 0 });
  const visible = useLayer(layer);
  const selected = useSelected(id);
  const t = wall.thickness;

  const dir = hinge === 'start' ? 1 : -1;
  const hingeX = hinge === 'start' ? at - width / 2 + FRAME : at + width / 2 - FRAME;
  const leafW = width - FRAME * 2 - 0.01;
  const leafH = height - FRAME - 0.03;
  const yRot = -dir * swing * open * (Math.PI / 2);
  const emissiveIntensity = selected ? 0.3 : 0;

  const arc = useMemo(() => {
    const pts: [number, number, number][] = [];
    const n = 24;
    for (let i = 0; i <= n; i++) {
      const phi = (i / n) * (Math.PI / 2);
      pts.push([hingeX + dir * leafW * Math.cos(phi), 0.02, swing * leafW * Math.sin(phi)]);
    }
    return pts;
  }, [hingeX, dir, leafW, swing]);

  const invalid = resolved && !resolved.valid;

  return (
    <group visible={visible} onClick={visible ? selectHandler(id) : undefined}>
      {invalid ? (
        <mesh position={[at, height / 2, 0]}>
          <boxGeometry args={[width, height, t + 0.06]} />
          <meshStandardMaterial color="#e11d48" transparent opacity={0.4} depthWrite={false} />
        </mesh>
      ) : (
        <>
          <mesh castShadow position={[at - width / 2 + FRAME / 2, height / 2, 0]}>
            <boxGeometry args={[FRAME, height, t + 0.02]} />
            <meshStandardMaterial color={frameColor} roughness={0.8} emissive="#2563eb" emissiveIntensity={emissiveIntensity} />
          </mesh>
          <mesh castShadow position={[at + width / 2 - FRAME / 2, height / 2, 0]}>
            <boxGeometry args={[FRAME, height, t + 0.02]} />
            <meshStandardMaterial color={frameColor} roughness={0.8} emissive="#2563eb" emissiveIntensity={emissiveIntensity} />
          </mesh>
          <mesh castShadow position={[at, height - FRAME / 2, 0]}>
            <boxGeometry args={[width - FRAME * 2, FRAME, t + 0.02]} />
            <meshStandardMaterial color={frameColor} roughness={0.8} emissive="#2563eb" emissiveIntensity={emissiveIntensity} />
          </mesh>
          <group position={[hingeX, 0.01, 0]} rotation={[0, yRot, 0]}>
            <mesh castShadow position={[(dir * leafW) / 2, leafH / 2, 0]}>
              <boxGeometry args={[leafW, leafH, 0.045]} />
              <meshStandardMaterial color={leafColor} roughness={0.7} emissive="#2563eb" emissiveIntensity={emissiveIntensity} />
            </mesh>
            <mesh position={[dir * (leafW - 0.07), 1.02, 0.045]}>
              <sphereGeometry args={[0.022, 16, 12]} />
              <meshStandardMaterial color="#4a4a48" roughness={0.35} metalness={0.7} />
            </mesh>
          </group>
          {showSwing && (
            <Line points={arc} color="#8a929e" dashed dashSize={0.07} gapSize={0.05} lineWidth={1} />
          )}
        </>
      )}
    </group>
  );
}
