import { useId, useMemo } from 'react';
import * as THREE from 'three';
import { useLayer } from '../layers';
import type { Vec2 } from '../model/types';
import { selectHandler, useSelected } from '../selection';
import { useLevel } from './Level';

export interface GableRoofProps {
  id?: string;
  /** south-west corner of the footprint the roof covers */
  at: Vec2;
  /** footprint extent along x (the ridge runs along x) */
  width: number;
  /** footprint extent along z */
  depth: number;
  /** ridge height above the wall tops */
  rise?: number;
  overhang?: number;
  color?: string;
  layer?: string;
}

/**
 * A closed triangular prism sitting on the wall tops of the enclosing level —
 * the extrusion caps double as the gable ends.
 */
export function GableRoof({
  id: idProp,
  at,
  width,
  depth,
  rise = 2.2,
  overhang = 0.45,
  color = '#7c5648',
  layer = 'roof',
}: GableRoofProps) {
  const autoId = useId();
  const id = idProp ?? `roof${autoId}`;
  const level = useLevel();
  const visible = useLayer(layer);
  const selected = useSelected(id);

  const geometryArgs = useMemo(() => {
    const d2 = depth / 2 + overhang;
    const shape = new THREE.Shape();
    shape.moveTo(-d2, 0);
    shape.lineTo(d2, 0);
    shape.lineTo(0, rise);
    shape.closePath();
    return [shape, { depth: width + overhang * 2, bevelEnabled: false }] as const;
  }, [width, depth, rise, overhang]);

  if (!visible) return null;

  return (
    <group
      // +0.02 keeps the roof underside clear of the coplanar wall tops
      position={[at[0] - overhang, level.elevation + level.wallHeight + 0.02, at[1] + depth / 2]}
      rotation={[0, Math.PI / 2, 0]}
      onClick={selectHandler(id)}
    >
      <mesh castShadow receiveShadow>
        <extrudeGeometry args={geometryArgs as unknown as [THREE.Shape, THREE.ExtrudeGeometryOptions]} />
        <meshStandardMaterial
          color={color}
          roughness={0.85}
          emissive="#2563eb"
          emissiveIntensity={selected ? 0.2 : 0}
        />
      </mesh>
    </group>
  );
}
