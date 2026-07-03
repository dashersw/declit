import { useMemo } from 'react';
import * as THREE from 'three';
import { useLayer } from '../layers';
import { selectHandler, useSelected } from '../selection';
import { useLevel } from './Level';

export interface RunProps {
  id?: string;
  /** 3D polyline waypoints as [x, y, z]; y is measured from the current level's floor */
  points: [number, number, number][];
  radius?: number;
  color?: string;
  layer?: string;
}

const UP = new THREE.Vector3(0, 1, 0);

interface Segment {
  position: [number, number, number];
  quaternion: THREE.Quaternion;
  length: number;
}

function PolylineRun({ id, points, radius, color, layer }: Required<Omit<RunProps, 'id'>> & { id?: string }) {
  const visible = useLayer(layer);
  const selected = useSelected(id ?? '');
  const { elevation } = useLevel();

  const segments = useMemo(() => {
    const segs: Segment[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const a = new THREE.Vector3(...points[i]);
      const b = new THREE.Vector3(...points[i + 1]);
      const dir = b.clone().sub(a);
      const length = dir.length();
      if (length < 1e-6) continue;
      const quaternion = new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize());
      const mid = a.clone().add(b).multiplyScalar(0.5);
      segs.push({ position: [mid.x, mid.y, mid.z], quaternion, length });
    }
    return segs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(points)]);

  if (!visible) return null;

  const material = (
    <meshStandardMaterial
      color={color}
      roughness={0.45}
      metalness={0.35}
      emissive="#2563eb"
      emissiveIntensity={selected ? 0.45 : 0}
    />
  );

  return (
    <group position={[0, elevation, 0]} onClick={selectHandler(id)}>
      {segments.map((s, i) => (
        <mesh key={i} position={s.position} quaternion={s.quaternion} castShadow>
          <cylinderGeometry args={[radius, radius, s.length, 12]} />
          {material}
        </mesh>
      ))}
      {points.map((p, i) => (
        <mesh key={`j${i}`} position={p} castShadow>
          <sphereGeometry args={[radius * 1.4, 12, 10]} />
          {material}
        </mesh>
      ))}
    </group>
  );
}

/** electrical cable run along 3D waypoints */
export function Wire({ id, points, radius = 0.011, color = '#d9a441', layer = 'electrical' }: RunProps) {
  return <PolylineRun id={id} points={points} radius={radius} color={color} layer={layer} />;
}

/** water pipe run along 3D waypoints */
export function Pipe({ id, points, radius = 0.026, color = '#b87333', layer = 'plumbing' }: RunProps) {
  return <PolylineRun id={id} points={points} radius={radius} color={color} layer={layer} />;
}
