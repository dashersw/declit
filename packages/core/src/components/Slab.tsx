import { useId, useMemo } from 'react';
import * as THREE from 'three';
import { useLayer } from '../layers';
import type { Vec2 } from '../model/types';
import { selectHandler, useSelected } from '../selection';
import { useRegisterElement } from './Model';
import { useLevel } from './Level';

export interface SlabProps {
  id?: string;
  /** plan outline, in (x, z) coordinates */
  outline: Vec2[];
  /** voids cut through the slab, e.g. a stairwell — each a closed (x, z) polygon */
  holes?: Vec2[][];
  thickness?: number;
  color?: string;
  layer?: string;
}

export function Slab({ id: idProp, outline, holes, thickness = 0.2, color = '#cfc9bd', layer = 'structure' }: SlabProps) {
  const autoId = useId();
  const id = idProp ?? `slab${autoId}`;
  const level = useLevel();
  const visible = useLayer(layer);
  const selected = useSelected(id);

  useRegisterElement({ id, type: 'slab', outline, thickness, elevation: level.elevation });

  const geometryArgs = useMemo(() => {
    const shape = new THREE.Shape();
    // shape y maps to world -z under the -90° X rotation
    shape.moveTo(outline[0][0], -outline[0][1]);
    for (let i = 1; i < outline.length; i++) shape.lineTo(outline[i][0], -outline[i][1]);
    shape.closePath();
    for (const hole of holes ?? []) {
      if (hole.length < 3) continue;
      const path = new THREE.Path();
      path.moveTo(hole[0][0], -hole[0][1]);
      for (let i = 1; i < hole.length; i++) path.lineTo(hole[i][0], -hole[i][1]);
      path.closePath();
      shape.holes.push(path);
    }
    return [shape, { depth: thickness, bevelEnabled: false }] as const;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(outline), JSON.stringify(holes), thickness]);

  return (
    <mesh
      castShadow
      receiveShadow
      visible={visible}
      onClick={visible ? selectHandler(id) : undefined}
      position={[0, level.elevation - thickness, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <extrudeGeometry args={geometryArgs as unknown as [THREE.Shape, THREE.ExtrudeGeometryOptions]} />
      <meshStandardMaterial color={color} roughness={0.9} emissive="#2563eb" emissiveIntensity={selected ? 0.15 : 0} />
    </mesh>
  );
}
